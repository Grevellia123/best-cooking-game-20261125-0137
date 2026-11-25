# best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Grevellia123/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Grevellia123/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Sizzle & Serve — a tiny original cooking game for make.fun's "Make the best cooking game" bounty. It plays offline in a desktop browser from static files — no build step, no network requests, no borrowed art, music or names.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080, or open `game/index.html` from any static server.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xaximy&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>

# Sizzle & Serve

A tiny original cooking game for make.fun's "Make the best cooking game" bounty.
It plays offline in a desktop browser from static files — no build step, no
network requests, no borrowed art, music or names.

## How to play

Run `node serve.ts` and open http://localhost:8080, or open `game/index.html`
from any static server.

- Orders appear on the **order board** (top left). Each one lists the dish
  and the ingredients it needs, with a patience bar that drains.
- Click an ingredient bin on the counter (or press keys 1–7) to add it to the
  **plate**. Patties go on the **grill** first: click a grill slot when the
  patty turns green, before it burns.
- Press **Space** (or the SERVE button) when the plate matches an order.
  Serve fast for a patience bonus; serving in a row builds a combo.
- **R** clears the plate, **P** pauses, **M** mutes. One shift lasts
  150 seconds — serve as many dishes as you can.

## Recipes

| Dish | Needs | Price |
| --- | --- | --- |
| Classic Burger | bun, patty, lettuce | 12 |
| Cheese Burger | bun, patty, cheese, tomato | 15 |
| Garden Salad | lettuce, tomato, cheese | 10 |
| Pasta Marinara | pasta, tomato, sauce | 14 |
| Deluxe Stack | bun, patty, cheese, lettuce, tomato | 20 |

Orders arrive faster and patience runs shorter as your level rises
(one level per 3 dishes served).

## Files

- `game/index.html` + `game/src/*.js` — the game (canvas 2D, ES modules)
- `main.ts` — the entry program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — make.fun's dossier library, unchanged
- `screenshots/` — real renders of the game running in a headless browser
  (`?shot=start|play|end` stages each scene; see `shots.json`)
- `serve.ts` — tiny static server for local play-testing

## Screenshots

`1-start.png` — title screen. `2-play.png` — mid-shift: orders on the
board, a dish mid-assembly on the plate, a patty on the grill, timer
running. `3-end.png` — shift-over screen with the final score.
