# Tetris V3 — LAB 09 — Scoring, Levels, and the HUD

**Prerequisites:** LAB-08 complete. Lines clear. `clearLines()` returns the
count. A `score` field exists in `GameState` (from the challenge, or add it now).

**What this lab adds:**
- `enum ScoreMultiplier` — named, typed constants for the scoring table
- Full Tetris scoring formula: `base_points × level`
- Level progression: every 10 lines cleared advances the level
- Drop speed scales with level (faster each level)
- HUD rendered on canvas: Score, Level, Lines

**Time:** 60 minutes

---

## What You Will Build

```
┌──────────────┐   ┌──────────┐
│              │   │ SCORE    │
│   game       │   │ 1200     │
│   board      │   │          │
│   (10×20)    │   │ LEVEL    │
│              │   │ 3        │
│              │   │          │
│              │   │ LINES    │
└──────────────┘   │ 25       │
                   └──────────┘
```

The HUD panel sits to the right of the board, displaying score, level, and
total lines cleared. Canvas text APIs render the numbers.

---

> **Quick Check — try to answer before reading further:**
>
> 1. What is the difference between a TypeScript `enum` and an object used as
>    a constant map like `const SCORES = { single: 40 }`?
> 2. The Tetris scoring formula is `baseScore × level`. If you clear 4 lines
>    at level 3, what is the score?
> 3. *(Prediction)* If the drop interval at level N is `800 / (N + 1)` ms,
>    at what level does the piece fall at roughly double the level-1 speed?
>
> *(Answers at the end of this lab)*

---

## Concept: `enum` — Named Typed Constants

**What it is:** A TypeScript keyword that creates a named set of related
constants, each automatically assigned a value, that forms a distinct type.

**The problem before:**

Without enums, the score table is an array indexed by magic numbers:

```ts
const SCORE_TABLE = [0, 40, 100, 300, 1200];
state.score += SCORE_TABLE[linesCleared];
```

The indices `0`, `1`, `2`, `3`, `4` have no names. If a reader sees
`SCORE_TABLE[3]`, they must count to know it means "triple."

**The solution — `enum` makes indices named:**

```ts
enum LinesCleared {
  Zero   = 0,
  Single = 1,
  Double = 2,
  Triple = 3,
  Tetris = 4,
}

const BASE_SCORES: Record<LinesCleared, number> = {
  [LinesCleared.Zero]:   0,
  [LinesCleared.Single]: 40,
  [LinesCleared.Double]: 100,
  [LinesCleared.Triple]: 300,
  [LinesCleared.Tetris]: 1200,
};

// Now the intent is readable:
state.score += BASE_SCORES[LinesCleared.Tetris] * state.level;
```

**Canonical example (General Explanation):**

A compass has four directions. Without an enum, you use `0=North, 1=East, 2=South, 3=West`
— which is which? With an enum:

```ts
enum Direction { North, East, South, West }
// North=0, East=1, South=2, West=3 — auto-assigned

let heading: Direction = Direction.North;
heading = 0;            // ✅ works (enum values are numbers)
heading = Direction.Up; // ❌ ERROR: 'Up' is not a member of Direction
```

**TypeScript generates JavaScript for `enum`** — unlike interfaces, enums
DO exist at runtime as an object. `Direction.North` evaluates to `0` at runtime.

**Pattern category:** Creational (named constant factory)
**Tradeoff:** Enums add a small JavaScript object at runtime. For simple
constants, `const` objects with `as const` are equivalent and lighter.
**When to use enum:** When the constants form a closed set (exactly these
values, no others) and you want TypeScript to enforce that only these values
are valid — e.g., you cannot pass `5` to a function expecting `LinesCleared`.

**Watch for:** Numeric enums allow reverse-lookup: `LinesCleared[1]` returns
`"Single"`. This can be surprising. If you only need the forward direction
(name → value), use `const enum` — it is inlined at compile time and generates
no runtime object.

---

## Math: The Tetris Scoring Formula

**What it computes:** The points awarded for clearing lines depends on how many
lines were cleared at once and the current level.

**Formula:**

```
score_gained = BASE_SCORE[lines_cleared] × level
```

**Base scores (Official Nintendo Tetris scoring):**

```
1 line  (Single): 40  × level
2 lines (Double): 100 × level
3 lines (Triple): 300 × level
4 lines (Tetris): 1200 × level
```

**Why this progression?** The ratios matter:
- Double = 2.5 × Single (better than 2 singles)
- Triple = 7.5 × Single (much better than 3 singles)
- Tetris = 30 × Single (dramatically better than 4 singles)

This incentivizes patience — wait to clear 4 lines at once (a "Tetris") for
a huge bonus. The `× level` multiplier rewards survival at higher levels.

**Concrete example:**

```
Level 3, clear 4 lines (Tetris):
score_gained = 1200 × 3 = 3600 points

Level 3, clear 1 line four separate times:
score_gained = (40 × 3) × 4 = 480 points

Tetris = 7.5× better than four singles at the same level.
```

**Why it matters here:** The `× level` part means clearing a Tetris at level 5
gives exactly 5× more points than the same clear at level 1. Higher levels are
both harder (faster pieces) and more rewarding (larger multiplier).

---

## Step 1 — Add Scoring Types to `board.ts`

Open `src/board.ts`. Add the enum and scoring constants at the top (before the class):

```ts
// src/board.ts (add after imports, before Board class)

// LinesCleared: names for the four possible line-clear counts.
// Using a const enum — inlined at compile time, no runtime object generated.
export const enum LinesCleared {
  Zero   = 0,
  Single = 1,
  Double = 2,
  Triple = 3,
  Tetris = 4,
}

// BASE_SCORES: points awarded per clear type BEFORE level multiplier.
// Record<K, V> is a TypeScript type for an object where all keys are type K
// and all values are type V. Here: keys are LinesCleared values, values are numbers.
export const BASE_SCORES: Record<number, number> = {
  [LinesCleared.Zero]:   0,     // no lines: no points
  [LinesCleared.Single]: 40,    // 1 line
  [LinesCleared.Double]: 100,   // 2 lines
  [LinesCleared.Triple]: 300,   // 3 lines
  [LinesCleared.Tetris]: 1200,  // 4 lines (the "Tetris")
} as const;
```

### SAVE AND TRY

Save. No visual change. Check for TypeScript errors.

**In DevTools Console:**

`const enum` is inlined — `LinesCleared` will not appear as a runtime object.
Test by checking the score table:

```js
BASE_SCORES[4]   // Expected: 1200 (Tetris score)
BASE_SCORES[1]   // Expected: 40 (single)
```

---

## Step 2 — Update GameState with Score, Level, and Lines

Open `src/main.ts`. Update `GameState`:

```ts
interface GameState {
  board: Board;
  activePiece: Piece;
  gravityTimer: number;
  dropInterval: number;
  score: number;          // running total score
  level: number;          // current level (1-based)
  totalLinesCleared: number;  // total lines cleared (drives level progression)
}
```

Update `state` initialization:

```ts
const state: GameState = {
  board: new Board(BOARD_COLS, BOARD_ROWS),
  activePiece: spawnPiece(),
  gravityTimer: 0,
  dropInterval: NORMAL_DROP_INTERVAL,
  score: 0,
  level: 1,
  totalLinesCleared: 0,
};
```

---

## Math: Level Progression and Speed Scaling

**Level formula:**

```
level = Math.floor(totalLinesCleared / 10) + 1
```

Every 10 lines cleared advances the level by 1. Level 1 starts at 0 lines.
Level 2 at 10 lines. Level 10 at 90 lines.

**Drop interval formula:**

```
dropInterval = BASE_DROP_MS / level     (simple linear scaling)
```

At level 1: 800ms. At level 2: 400ms. At level 4: 200ms. At level 8: 100ms.

This gives an exponential feel — early levels feel gradual, later levels
accelerate sharply.

**Why divide and not subtract?** Subtracting a fixed amount (e.g., `800 - level × 50`)
hits zero and goes negative. Division asymptotically approaches zero — the game
speeds up forever without becoming instantaneous.

---

## Step 3 — Add `computeScore` and `updateLevel` to the Game Loop

Add two pure functions to `main.ts`:

```ts
// ── Scoring ─────────────────────────────────────────────────────────────────

import { Board, CellValue, BASE_SCORES } from './board';  // ← update import

const BASE_DROP_MS: number = 800;  // drop interval at level 1 (rename from NORMAL_DROP_INTERVAL)

// computeDropInterval: returns the ms between drops at a given level.
// Division keeps the interval always positive — no level causes 0 or negative ms.
function computeDropInterval(level: number): number {
  return Math.floor(BASE_DROP_MS / level);
  // Level 1: 800ms. Level 2: 400ms. Level 4: 200ms. Level 8: 100ms.
}

// computeLevel: determines level from total lines cleared.
function computeLevel(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;  // every 10 lines = 1 level up
}
```

Update the lock block in `update()`:

```ts
    if (canMoveDown) {
      state.activePiece.position = belowPosition;
    } else {
      state.board.lock(state.activePiece);

      const linesCleared = state.board.clearLines();

      if (linesCleared > 0) {
        // Apply scoring formula: base × level
        state.score += BASE_SCORES[linesCleared] * state.level;

        // Track cumulative lines and recompute level:
        state.totalLinesCleared += linesCleared;
        const newLevel = computeLevel(state.totalLinesCleared);

        if (newLevel > state.level) {
          state.level = newLevel;
          state.dropInterval = computeDropInterval(state.level);  // speed up
        }
      }

      state.activePiece = spawnPiece();
      state.gravityTimer = 0;
    }
```

### SAVE AND TRY

Save. Play the game, clear some lines.

**In DevTools Console:**

After clearing lines:

```js
state.score           // Expected: a positive number, growing with each clear
state.level           // Expected: 1 initially, increases after every 10 lines
state.totalLinesCleared  // Expected: count of total lines cleared
state.dropInterval    // Expected: decreases as level increases
```

---

## Step 4 — Draw the HUD

The HUD sits to the right of the 300px board. We need to widen the canvas
to accommodate both, OR draw the HUD in a separate `<div>`. The simpler
approach: widen the canvas to 400px and draw the HUD in the right 100px.

Update constants in `main.ts`:

```ts
const CANVAS_WIDTH: number = 400;      // ← was 300 — extra 100px for HUD
const HUD_X: number = CANVAS_WIDTH - 95;  // left edge of HUD panel (x = 305)
```

Add the HUD drawing function:

```ts
// drawHUD: renders score, level, and lines on the right panel of the canvas.
function drawHUD(): void {
  const labelColor: string = '#aaaaaa';  // dimmer gray for labels
  const valueColor: string = '#ffffff';  // bright white for numbers

  ctx.textAlign = 'left';   // align text to the left of the x coordinate

  // SCORE label:
  ctx.font = '14px monospace';   // monospace so numbers don't shift width
  ctx.fillStyle = labelColor;
  ctx.fillText('SCORE', HUD_X, 40);   // (x, y) — baseline of text

  // Score value:
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = valueColor;
  ctx.fillText(String(state.score), HUD_X, 62);

  // LEVEL label:
  ctx.font = '14px monospace';
  ctx.fillStyle = labelColor;
  ctx.fillText('LEVEL', HUD_X, 110);

  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = valueColor;
  ctx.fillText(String(state.level), HUD_X, 132);

  // LINES label:
  ctx.font = '14px monospace';
  ctx.fillStyle = labelColor;
  ctx.fillText('LINES', HUD_X, 180);

  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = valueColor;
  ctx.fillText(String(state.totalLinesCleared), HUD_X, 202);
}
```

Update `render()` to call `drawHUD`:

```ts
function render(): void {
  drawBackground();
  drawBoard(state.board);
  drawPiece(state.activePiece);
  drawHUD();   // ← add this
}
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** The canvas is now 400px wide. Score, Level, and Lines are
displayed in the right panel. They update immediately when lines are cleared.

**In DevTools Console:**

```js
state.score = 9999;     // manually set a high score
// Score in HUD updates on the next render frame (within 16ms)
```

**Change something:** Change `ctx.font = 'bold 18px monospace'` to
`'bold 28px monospace'` for the score value. Save. The score number is
larger. Change back.

---

## 🎯 Challenge: High Score Tracker

**You know:** `state.score` tracks the current score. `localStorage` is a
browser API that persists data across page reloads.

**Task:** Add a high score that persists when the page is refreshed.
- On game start, read the high score from `localStorage.getItem('tetris-highscore')`
- After each line clear, if `state.score > highScore`, update `highScore` and
  save to `localStorage.setItem('tetris-highscore', String(state.score))`
- Display the high score below the score in the HUD

**Hints:**

1. `localStorage.getItem(key)` returns `string | null` — parse with
   `parseInt(value ?? '0', 10)` to get a number (defaulting to 0 if null).
2. `localStorage.setItem(key, value)` always takes strings.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// At module level (outside functions):
let highScore: number = parseInt(localStorage.getItem('tetris-highscore') ?? '0', 10);

// In the scoring block (after state.score is updated):
if (state.score > highScore) {
  highScore = state.score;
  localStorage.setItem('tetris-highscore', String(highScore));
}

// In drawHUD, add after LINES:
ctx.font = '14px monospace';
ctx.fillStyle = labelColor;
ctx.fillText('BEST', HUD_X, 250);

ctx.font = 'bold 18px monospace';
ctx.fillStyle = '#f0d000';   // gold color for best score
ctx.fillText(String(highScore), HUD_X, 272);
```

**Key insight:** `localStorage` persists data in the browser even after the
tab is closed. The `?? '0'` is the **nullish coalescing operator** — it provides
a fallback when the left side is `null` or `undefined`. On the first ever run,
`localStorage.getItem('tetris-highscore')` returns `null`, and `?? '0'` provides
the default string `'0'`, which parses to `0`.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Score increments on line clear | Clear a line — score jumps by 40+ |
| Tetris scores 1200 × level | Fill 4 rows at once — score jumps by 1200 × current level |
| Level advances every 10 lines | Watch level counter — increases at 10, 20, 30 lines |
| Pieces fall faster at higher levels | At level 3, drop interval is ~267ms — visibly faster |
| HUD displays correctly | Score, Level, Lines all visible in right panel |
| HUD updates in real time | Clear a line — numbers update immediately |

---

## Quick Check Answers

**1. Difference between `enum` and a constant object?**

Both create named constants. The key difference is type safety: an `enum` creates
a distinct type — `LinesCleared.Tetris` has type `LinesCleared`, not just `number`.
TypeScript can enforce that only valid enum members are passed to functions expecting
`LinesCleared`. A `const` object like `{ Tetris: 4 }` just gives you a `number`
— TypeScript cannot distinguish it from any other number. `const enum` additionally
inlines the values at compile time, generating no runtime object — useful for
performance-critical constants.

**2. Clear 4 lines at level 3 — what is the score?**

`BASE_SCORES[4] × level = 1200 × 3 = 3600` points. The base score for a Tetris
(4 simultaneous lines) is 1200. The level multiplier is 3 (level 3). The formula
rewards both skill (clearing 4 at once) and survival (reaching level 3).

**3. (Prediction) At what level does drop speed double?**

Level 2. At level 1: `800 / 1 = 800ms`. At level 2: `800 / 2 = 400ms`.
400ms is exactly half of 800ms — double the speed. The formula `BASE_DROP_MS / level`
means each level exactly multiplies speed: level 4 is 4× level 1, level 8 is
8× level 1. This creates exponential difficulty even though the formula is linear.

---

*Next: LAB-10 — Game Over and Finite State Machine. We detect when a piece
locks into the top row, display a game-over overlay, and handle restart. We
formalize this with TypeScript discriminated unions as a Finite State Machine.*
