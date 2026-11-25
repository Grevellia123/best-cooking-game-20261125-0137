// Sizzle & Serve — deterministic staging for screenshots.
// ?shot=start  : title screen over a quiet kitchen
// ?shot=play   : mid-shift — orders on the board, a dish mid-assembly, grill cooking, timer running
// ?shot=end    : shift-over screen with a real score
// ?seed=N      : pick the random seed (default 7)

import { createWorld, startGame, addIngredient, clickGrill, servePlate, spawnOrder, update } from './world.js';
import { recipeById } from './recipes.js';

function autopilot(world) {
  // Try to serve the first order we can finish, else keep building toward it.
  const order = world.orders[0];
  if (!order) return;
  const recipe = recipeById(order.dishId);
  const missing = [...recipe.needs];
  for (const item of world.plate) {
    const at = missing.indexOf(item);
    if (at !== -1) missing.splice(at, 1);
  }
  if (missing.length === 0) { servePlate(world); return; }
  const next = missing[0];
  if (next === 'patty') {
    const done = world.grill.findIndex((s) => s.state === 'done');
    if (done !== -1) { clickGrill(world, done); return; }
    const cooking = world.grill.some((s) => s.state === 'cooking');
    if (!cooking) addIngredient(world, 'patty');
    return;
  }
  addIngredient(world, next);
}

export function stageShot(name, seed) {
  const world = createWorld(seed);
  if (name === 'start') {
    // Title over a kitchen that already has an order waiting.
    startGame(world);
    for (let i = 0; i < 40; i += 1) update(world, 0.05);
    world.screen = 'title';
    return world;
  }
  startGame(world);
  const seconds = name === 'end' ? 150 : 26;
  const steps = Math.floor(seconds / 0.1);
  for (let i = 0; i < steps; i += 1) {
    autopilot(world);
    update(world, 0.1);
    if (world.screen === 'over') break;
  }
  if (name === 'end' && world.screen !== 'over') {
    // Force the shift to end so the game-over screen shows.
    world.timeLeft = 0.01;
    update(world, 0.1);
  }
  if (name === 'play') {
    // Stage a busy mid-shift frame: orders on the board, a dish mid-assembly
    // on the plate, and a patty mid-cook on the grill.
    while (world.orders.length < 2) spawnOrder(world);
    const order = world.orders[0];
    if (order) {
      const recipe = recipeById(order.dishId);
      const partial = recipe.needs.filter((n) => n !== 'patty').slice(0, 2);
      for (const need of partial) {
        if (!world.plate.includes(need)) addIngredient(world, need);
      }
    }
    // A patty mid-cook on the grill (take a finished one first, if any).
    const doneAt = world.grill.findIndex((s) => s.state === 'done');
    if (doneAt !== -1) clickGrill(world, doneAt);
    if (!world.grill.some((s) => s.state === 'cooking')) addIngredient(world, 'patty');
    for (let i = 0; i < 20; i += 1) update(world, 0.1);
  }
  return world;
}

export function shotSeed(search) {
  const params = new URLSearchParams(search);
  const raw = Number(params.get('seed'));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 7;
}
