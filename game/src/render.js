// Sizzle & Serve — all canvas drawing. One canvas, 1280x720, no images.
// LAYOUT is shared with the input code so clicks land where the art is.

import { INGREDIENTS, ingredientById, recipeById, plateProgress } from './recipes.js';
import { GRILL_COOK_SECONDS, SHIFT_SECONDS } from './world.js';

export const W = 1280;
export const H = 720;

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 20, y: 84, w: 280, h: 300 },
  grill: { x: 330, y: 84, w: 240, h: 210 },
  grillSlots: [
    { x: 352, y: 150, w: 96, h: 96 },
    { x: 452, y: 150, w: 96, h: 96 },
  ],
  plate: { x: 610, y: 84, w: 330, h: 210 },
  serve: { x: 980, y: 100, w: 280, h: 84 },
  clear: { x: 980, y: 196, w: 280, h: 52 },
  bins: INGREDIENTS.map((ing, i) => ({
    id: ing.id,
    x: 40 + i * 172,
    y: 470,
    w: 156,
    h: 150,
  })),
  startButton: { x: 490, y: 500, w: 300, h: 72 },
  restartButton: { x: 490, y: 500, w: 300, h: 72 },
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', bold = true) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700' : '400'} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Draw one ingredient icon centred at (cx, cy) with radius r.
export function drawIngredientIcon(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = '#e8b06a';
    ctx.beginPath(); ctx.arc(0, 2, r, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d99a4e';
    ctx.fillRect(-r, 0, r * 2, r * 0.28);
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-r * 0.4, -r * 0.45], [0, -r * 0.6], [r * 0.4, -r * 0.45]]) {
      ctx.beginPath(); ctx.ellipse(dx, dy, r * 0.12, r * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = '#8a5a33';
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6d4423';
    for (const [dx, dy] of [[-r * 0.5, -r * 0.15], [r * 0.3, r * 0.2], [0, -r * 0.3]]) {
      ctx.beginPath(); ctx.arc(dx, dy, r * 0.12, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#7dc24a';
    for (const [dx, dy] of [[-r * 0.45, 0], [0, -r * 0.2], [r * 0.45, 0]]) {
      ctx.beginPath(); ctx.arc(dx, dy, r * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#4d8a2a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.quadraticCurveTo(0, r * 0.5, r * 0.7, 0); ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e84a3f';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath(); ctx.moveTo(0, -r * 0.9); ctx.lineTo(-r * 0.3, -r * 1.15); ctx.lineTo(r * 0.3, -r * 1.15); ctx.closePath(); ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = '#ffc93c';
    ctx.beginPath(); ctx.moveTo(-r, r * 0.7); ctx.lineTo(r, r * 0.7); ctx.lineTo(0, -r * 0.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d99e12';
    for (const [dx, dy] of [[-r * 0.3, r * 0.3], [r * 0.25, r * 0.15]]) {
      ctx.beginPath(); ctx.arc(dx, dy, r * 0.14, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'pasta') {
    ctx.strokeStyle = '#f2d06b'; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, i * r * 0.45);
      ctx.quadraticCurveTo(0, i * r * 0.45 - r * 0.4, r * 0.8, i * r * 0.45);
      ctx.stroke();
    }
  } else if (id === 'sauce') {
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, r * 0.6, r * 0.3, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8837a';
    ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.35, r * 0.18, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawOrderCard(ctx, order, x, y, w, h) {
  const recipe = recipeById(order.dishId);
  const frac = Math.max(0, order.patience / order.patienceMax);
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = frac < 0.3 ? '#c0392b' : '#2c3e50';
  text(ctx, `#${order.id} ${recipe.name}`, x + 12, y + 22, 17, frac < 0.3 ? '#c0392b' : '#2c3e50');
  text(ctx, `$${recipe.price}`, x + w - 12, y + 22, 17, '#b97f3e', 'right');
  let ix = x + 14;
  for (const need of recipe.needs) {
    drawIngredientIcon(ctx, need, ix + 16, y + 52, 14);
    ix += 34;
  }
  // patience bar
  ctx.fillStyle = '#e0d5c0';
  rr(ctx, x + 12, y + h - 18, w - 24, 10, 5);
  ctx.fill();
  ctx.fillStyle = frac < 0.3 ? '#e74c3c' : '#27ae60';
  if (frac > 0) { rr(ctx, x + 12, y + h - 18, (w - 24) * frac, 10, 5); ctx.fill(); }
}

export function drawWorld(ctx, world) {
  // Wall and floor
  ctx.fillStyle = '#f7e8c8';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e8d5a8';
  for (let x = 0; x < W; x += 64) {
    ctx.fillRect(x, 64, 2, 330);
    ctx.fillRect(0, 64 + ((x / 64) % 5) * 66, W, 2);
  }
  ctx.fillStyle = '#c98f5f';
  ctx.fillRect(0, 640, W, 80);
  ctx.fillStyle = '#b97f3e';
  for (let x = 0; x < W; x += 90) ctx.fillRect(x, 640, 3, 80);

  // Top bar
  ctx.fillStyle = '#3b2a1e';
  ctx.fillRect(0, 0, W, 64);
  text(ctx, 'SIZZLE & SERVE', 20, 34, 28, '#ffd98a');
  text(ctx, `SCORE ${world.score}`, 420, 34, 20, '#ffffff');
  text(ctx, `COINS ${world.coins}`, 620, 34, 20, '#ffd98a');
  text(ctx, `LEVEL ${world.level}`, 790, 34, 20, '#ffffff');
  const low = world.timeLeft < 30 && world.screen === 'play';
  text(ctx, `TIME ${formatTime(world.timeLeft)}`, 1260, 34, 26, low ? '#ff6b5e' : '#ffffff', 'right');

  // Order board
  const b = LAYOUT.board;
  ctx.fillStyle = '#2f4f3e';
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#8a6d3b'; ctx.lineWidth = 4;
  rr(ctx, b.x, b.y, b.w, b.h, 12); ctx.stroke();
  text(ctx, 'ORDER BOARD', b.x + b.w / 2, b.y + 24, 20, '#fdf6e3', 'center');
  if (world.orders.length === 0) {
    text(ctx, 'No orders yet…', b.x + b.w / 2, b.y + 90, 16, '#bcd8c2', 'center', false);
  }
  world.orders.forEach((order, i) => {
    drawOrderCard(ctx, order, b.x + 12, b.y + 46 + i * 82, b.w - 24, 74);
  });
  text(ctx, `Served ${world.served}  •  Walked out ${world.failed}`, b.x + b.w / 2, b.y + b.h - 10, 13, '#bcd8c2', 'center', false);

  // Grill
  const g = LAYOUT.grill;
  ctx.fillStyle = '#5d4037';
  rr(ctx, g.x, g.y, g.w, g.h, 12);
  ctx.fill();
  text(ctx, 'GRILL', g.x + g.w / 2, g.y + 20, 16, '#ffe0b3', 'center');
  text(ctx, 'take the patty when green', g.x + g.w / 2, g.y + 40, 12, '#d8b896', 'center', false);
  world.grill.forEach((slot, i) => {
    const s = LAYOUT.grillSlots[i];
    ctx.fillStyle = '#2b1a12';
    rr(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fill();
    if (slot.state === 'cooking' || slot.state === 'done') {
      const frac = Math.min(1, slot.t / GRILL_COOK_SECONDS);
      drawIngredientIcon(ctx, 'patty', s.x + s.w / 2, s.y + s.h / 2 - 6, 26);
      ctx.fillStyle = '#e0d5c0';
      ctx.fillRect(s.x + 10, s.y + s.h - 16, s.w - 20, 8);
      ctx.fillStyle = slot.state === 'done' ? '#2ecc71' : '#e67e22';
      ctx.fillRect(s.x + 10, s.y + s.h - 16, (s.w - 20) * frac, 8);
      if (slot.state === 'done') text(ctx, 'READY!', s.x + s.w / 2, s.y - 2, 13, '#2ecc71', 'center');
    } else if (slot.state === 'burnt') {
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, 26, 16, 0, 0, Math.PI * 2); ctx.fill();
      text(ctx, 'BURNT — click to toss', s.x + s.w / 2, s.y + s.h - 8, 11, '#ff8a7a', 'center', false);
    } else {
      text(ctx, 'empty', s.x + s.w / 2, s.y + s.h / 2, 14, '#8a7a66', 'center', false);
    }
  });

  // Plate — the dish mid-assembly
  const p = LAYOUT.plate;
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, p.x, p.y, p.w, p.h, 12);
  ctx.fill();
  text(ctx, 'PLATE — build the dish here', p.x + p.w / 2, p.y + 22, 15, '#6b4a2a', 'center');
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#c9b896'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + 118, 120, 52, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (world.plate.length === 0) {
    text(ctx, 'empty plate', p.x + p.w / 2, p.y + 118, 15, '#b0a284', 'center', false);
  } else {
    world.plate.forEach((id, i) => {
      const cx = p.x + p.w / 2 + (i - (world.plate.length - 1) / 2) * 44;
      drawIngredientIcon(ctx, id, cx, p.y + 118 - i * 4, 20);
      const ing = ingredientById(id);
      text(ctx, ing.name, cx, p.y + 178, 11, '#6b4a2a', 'center', false);
    });
  }

  // Serve / clear buttons
  const sv = LAYOUT.serve;
  ctx.fillStyle = world.plate.length ? '#27ae60' : '#95a5a6';
  rr(ctx, sv.x, sv.y, sv.w, sv.h, 14);
  ctx.fill();
  text(ctx, 'SERVE  (Space)', sv.x + sv.w / 2, sv.y + sv.h / 2, 26, '#ffffff', 'center');
  const cl = LAYOUT.clear;
  ctx.fillStyle = '#e67e22';
  rr(ctx, cl.x, cl.y, cl.w, cl.h, 10);
  ctx.fill();
  text(ctx, 'Clear plate  (R)', cl.x + cl.w / 2, cl.y + cl.h / 2, 16, '#ffffff', 'center');

  // Ingredient counter bins
  text(ctx, 'INGREDIENTS ON THE COUNTER — click a bin (or press its number key)', 40, 452, 16, '#6b4a2a');
  LAYOUT.bins.forEach((bin) => {
    const ing = ingredientById(bin.id);
    ctx.fillStyle = '#fffaf0';
    rr(ctx, bin.x, bin.y, bin.w, bin.h, 12);
    ctx.fill();
    ctx.strokeStyle = '#c9b896'; ctx.lineWidth = 2;
    rr(ctx, bin.x, bin.y, bin.w, bin.h, 12); ctx.stroke();
    drawIngredientIcon(ctx, bin.id, bin.x + bin.w / 2, bin.y + 58, 34);
    text(ctx, ing.name, bin.x + bin.w / 2, bin.y + 112, 16, '#3b2a1e', 'center');
    text(ctx, `[${ing.key}]${bin.id === 'patty' ? ' → grill' : ''}`, bin.x + bin.w / 2, bin.y + 134, 13, '#8a7a66', 'center', false);
  });

  // Combo + toast
  if (world.combo > 1) {
    text(ctx, `COMBO x${world.combo}!`, 640, 668, 22, '#c0392b', 'center');
  }
  if (world.toastT > 0) {
    ctx.globalAlpha = Math.min(1, world.toastT);
    text(ctx, world.toast, 640, 700, 18, '#3b2a1e', 'center');
    ctx.globalAlpha = 1;
  }

  // Flash border on good/bad serve
  if (world.flashT > 0) {
    ctx.strokeStyle = world.flash === 'good' ? '#2ecc71' : '#e74c3c';
    ctx.lineWidth = 10;
    ctx.globalAlpha = Math.min(1, world.flashT * 3);
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.globalAlpha = 1;
  }

  if (world.screen === 'title') drawTitle(ctx);
  if (world.screen === 'over') drawOver(ctx, world);
  if (world.paused && world.screen === 'play') {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'PAUSED — press P to continue', 640, 360, 34, '#ffffff', 'center');
  }
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(43,26,18,0.82)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'SIZZLE & SERVE', 640, 170, 72, '#ffd98a', 'center');
  text(ctx, 'A tiny kitchen, a big rush', 640, 230, 26, '#ffffff', 'center', false);
  const lines = [
    'Orders appear on the board — build each dish on the plate.',
    'Click ingredient bins (or keys 1-7). Patties go on the grill first:',
    'click the grill slot when it turns green, before it burns!',
    'Press Space (or SERVE) when the plate matches an order. Beat the clock!',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 300 + i * 34, 20, '#ffe0b3', 'center', false));
  const b = LAYOUT.startButton;
  ctx.fillStyle = '#27ae60';
  rr(ctx, b.x, b.y, b.w, b.h, 16);
  ctx.fill();
  text(ctx, 'START COOKING  (Enter)', b.x + b.w / 2, b.y + b.h / 2, 24, '#ffffff', 'center');
  text(ctx, `Shift: ${SHIFT_SECONDS} seconds  •  5 recipes  •  combos pay extra`, 640, 610, 16, '#bcd8c2', 'center', false);
}

function drawOver(ctx, world) {
  ctx.fillStyle = 'rgba(43,26,18,0.85)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, "SHIFT OVER!", 640, 170, 64, '#ffd98a', 'center');
  text(ctx, `Score ${world.score}   •   Coins ${world.coins}`, 640, 250, 30, '#ffffff', 'center');
  text(ctx, `Dishes served ${world.served}   •   Walked out ${world.failed}   •   Best combo x${world.bestCombo}`, 640, 300, 22, '#ffe0b3', 'center', false);
  const verdict = world.served >= 12 ? 'Head Chef material!' : world.served >= 7 ? 'Solid line cook!' : world.served >= 3 ? 'A promising start!' : 'The kitchen humbled you — go again!';
  text(ctx, verdict, 640, 350, 24, '#ffffff', 'center', false);
  const b = LAYOUT.restartButton;
  ctx.fillStyle = '#27ae60';
  rr(ctx, b.x, b.y, b.w, b.h, 16);
  ctx.fill();
  text(ctx, 'COOK AGAIN  (Enter)', b.x + b.w / 2, b.y + b.h / 2, 24, '#ffffff', 'center');
}
