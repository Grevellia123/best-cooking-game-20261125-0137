// Sizzle & Serve — game state and rules. No drawing here, only logic.
// A tiny seeded RNG keeps screenshot staging reproducible.

import { INGREDIENTS, RECIPES, plateMatchesRecipe, recipeById } from './recipes.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SHIFT_SECONDS = 150;
export const GRILL_COOK_SECONDS = 4;
export const GRILL_BURN_SECONDS = 9;
export const MAX_ORDERS = 3;
export const MAX_PLATE = 5;

export function createWorld(seed) {
  const rng = mulberry32(seed == null ? (Date.now() % 2147483647) : seed);
  return {
    rng,
    screen: 'title', // title | play | over
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    score: 0,
    coins: 0,
    served: 0,
    failed: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    orders: [],
    nextOrderIn: 1.5,
    nextOrderId: 1,
    plate: [],
    grill: [
      { state: 'empty', t: 0 },
      { state: 'empty', t: 0 },
    ],
    toast: '',
    toastT: 0,
    flash: '', // 'good' | 'bad' | ''
    flashT: 0,
    muted: false,
    paused: false,
    startedAt: 0,
  };
}

export function orderInterval(level) {
  return Math.max(4, 9 - level);
}

export function orderPatience(level) {
  return Math.max(18, 32 - level * 2);
}

export function spawnOrder(world) {
  if (world.orders.length >= MAX_ORDERS) return;
  const dish = RECIPES[Math.floor(world.rng() * RECIPES.length)];
  const patience = orderPatience(world.level);
  world.orders.push({
    id: world.nextOrderId++,
    dishId: dish.id,
    patience,
    patienceMax: patience,
  });
}

export function startGame(world) {
  const fresh = createWorld();
  fresh.rng = world.rng;
  Object.assign(world, fresh);
  world.screen = 'play';
  spawnOrder(world);
  world.nextOrderIn = orderInterval(world.level);
}

export function endGame(world) {
  world.screen = 'over';
  world.timeLeft = 0;
}

export function setToast(world, text) {
  world.toast = text;
  world.toastT = 3;
}

export function setFlash(world, kind) {
  world.flash = kind;
  world.flashT = 0.35;
}

// Put an ingredient on the plate. Patty goes to the grill instead.
export function addIngredient(world, id) {
  if (world.screen !== 'play' || world.paused) return false;
  if (id === 'patty') {
    const slot = world.grill.find((s) => s.state === 'empty');
    if (!slot) { setToast(world, 'Grill is full!'); return false; }
    slot.state = 'cooking';
    slot.t = 0;
    return true;
  }
  if (world.plate.length >= MAX_PLATE) { setToast(world, 'Plate is full — serve or clear it!'); return false; }
  world.plate.push(id);
  return true;
}

// Click a grill slot: take a cooked patty, or throw a burnt one away.
export function clickGrill(world, index) {
  if (world.screen !== 'play' || world.paused) return false;
  const slot = world.grill[index];
  if (!slot) return false;
  if (slot.state === 'done') {
    if (world.plate.length >= MAX_PLATE) { setToast(world, 'Plate is full — serve or clear it!'); return false; }
    world.plate.push('patty');
    slot.state = 'empty';
    slot.t = 0;
    return true;
  }
  if (slot.state === 'burnt') {
    slot.state = 'empty';
    slot.t = 0;
    setToast(world, 'Burnt patty tossed!');
    return true;
  }
  return false;
}

export function clearPlate(world) {
  if (world.screen !== 'play' || world.paused) return;
  if (world.plate.length === 0) return;
  world.plate = [];
  setToast(world, 'Plate cleared.');
}

export function servePlate(world) {
  if (world.screen !== 'play' || world.paused) return false;
  if (world.plate.length === 0) { setToast(world, 'Plate is empty!'); return false; }
  const match = world.orders.find((o) => plateMatchesRecipe(world.plate, recipeById(o.dishId)));
  if (!match) {
    world.combo = 0;
    setFlash(world, 'bad');
    setToast(world, 'No order matches that plate!');
    return false;
  }
  const recipe = recipeById(match.dishId);
  const patienceBonus = Math.round(8 * (match.patience / match.patienceMax));
  const comboBonus = Math.min(10, world.combo * 2);
  const earned = recipe.price + patienceBonus + comboBonus;
  world.coins += earned;
  world.score += earned * 10;
  world.served += 1;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.level = 1 + Math.floor(world.served / 3);
  world.orders = world.orders.filter((o) => o.id !== match.id);
  world.plate = [];
  setFlash(world, 'good');
  setToast(world, `Served ${recipe.name}! +${earned} coins${world.combo > 1 ? ` (combo x${world.combo})` : ''}`);
  return true;
}

export function update(world, dt) {
  if (world.screen !== 'play' || world.paused) return;
  world.elapsed += dt;
  world.timeLeft -= dt;
  if (world.toastT > 0) world.toastT -= dt;
  if (world.flashT > 0) world.flashT -= dt;

  for (const slot of world.grill) {
    if (slot.state === 'cooking' || slot.state === 'done') {
      slot.t += dt;
      if (slot.state === 'cooking' && slot.t >= GRILL_COOK_SECONDS) slot.state = 'done';
      if (slot.t >= GRILL_BURN_SECONDS) slot.state = 'burnt';
    }
  }

  for (let i = world.orders.length - 1; i >= 0; i -= 1) {
    const order = world.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      world.orders.splice(i, 1);
      world.failed += 1;
      world.combo = 0;
      setFlash(world, 'bad');
      setToast(world, 'An order walked out!');
    }
  }

  world.nextOrderIn -= dt;
  if (world.nextOrderIn <= 0) {
    spawnOrder(world);
    world.nextOrderIn = orderInterval(world.level);
  }

  if (world.timeLeft <= 0) endGame(world);
}

export function ingredientNames() {
  return INGREDIENTS.map((i) => i.name);
}
