// Sizzle & Serve — boot, game loop and input (mouse + keyboard).
// The game is a single canvas; every click and key is mapped through LAYOUT.

import { createWorld, startGame, addIngredient, clickGrill, clearPlate, servePlate, update } from './world.js';
import { INGREDIENTS } from './recipes.js';
import { drawWorld, LAYOUT, W, H } from './render.js';
import { stageShot, shotSeed } from './shots.js';
import { unlockAudio, playClick, playPop, playGood, playBad } from './sound.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
let world = shotName ? stageShot(shotName, shotSeed(window.location.search)) : createWorld();

function toGameCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (W / rect.width),
    y: (event.clientY - rect.top) * (H / rect.height),
  };
}

function inside(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

function handleClick(point) {
  unlockAudio();
  if (world.screen === 'title') {
    if (inside(point, LAYOUT.startButton)) { startGame(world); playGood(); }
    return;
  }
  if (world.screen === 'over') {
    if (inside(point, LAYOUT.restartButton)) { startGame(world); playGood(); }
    return;
  }
  if (world.paused) return;
  for (const bin of LAYOUT.bins) {
    if (inside(point, bin)) {
      if (addIngredient(world, bin.id)) playPop();
      return;
    }
  }
  for (let i = 0; i < LAYOUT.grillSlots.length; i += 1) {
    if (inside(point, LAYOUT.grillSlots[i])) {
      if (clickGrill(world, i)) playPop();
      return;
    }
  }
  if (inside(point, LAYOUT.serve)) {
    if (servePlate(world)) playGood(); else playBad();
    return;
  }
  if (inside(point, LAYOUT.clear)) {
    clearPlate(world);
    playClick();
  }
}

canvas.addEventListener('pointerdown', (event) => handleClick(toGameCoords(event)));

window.addEventListener('keydown', (event) => {
  unlockAudio();
  const key = event.key.toLowerCase();
  if (key === 'enter') {
    if (world.screen === 'title' || world.screen === 'over') { startGame(world); playGood(); }
    return;
  }
  if (key === 'p' && world.screen === 'play') { world.paused = !world.paused; return; }
  if (key === 'm') { world.muted = !world.muted; return; }
  if (world.screen !== 'play' || world.paused) return;
  if (key === ' ') { event.preventDefault(); if (servePlate(world)) playGood(); else playBad(); return; }
  if (key === 'r') { clearPlate(world); playClick(); return; }
  const ing = INGREDIENTS.find((i) => i.key === key);
  if (ing && addIngredient(world, ing.id)) playPop();
});

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!shotName) update(world, dt);
  drawWorld(ctx, world);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
