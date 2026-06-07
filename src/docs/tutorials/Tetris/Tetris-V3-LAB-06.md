# Tetris V3 — LAB 06 — Game Loop and Interfaces

**Prerequisites:** LAB-05 complete. Pieces move and rotate with keyboard input,
collision detection works. Nothing falls automatically yet.

**What this lab adds:**
- `interface GameState` — a TypeScript contract describing all game data in one object
- `requestAnimationFrame` game loop with delta time
- Automatic gravity — the piece falls one row every 800ms
- The canvas redraws every frame (not just on key presses)

**Time:** 60–75 minutes

---

## What You Will Build

```
Before: piece only moves when you press a key — nothing happens on its own

After: piece falls one row every 800ms automatically.
       Keyboard still works for horizontal movement and rotation.
       Down arrow (soft drop) still works.
       When the piece reaches the floor — it stays there (locking in LAB-07).
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. `requestAnimationFrame` gives you a timestamp in milliseconds. How do you
>    use two timestamps to calculate how much time has passed?
> 2. What is the difference between a TypeScript `interface` and a `class`?
> 3. *(Prediction)* If your game loop runs at 60fps (16.7ms per frame) and you
>    accumulate delta time, how many frames pass before a 800ms gravity timer fires?
>
> *(Answers at the end of this lab)*

---

## Mental Model: The Game Loop

**Official name:** Game Loop
**Why it exists:** Interactivity requires the world to update continuously —
regardless of whether the player pressed a key. The game loop runs 60 times per
second, updating state and redrawing the screen every frame.

**The three phases:**
1. **Update** — apply game logic (gravity, input, collisions)
2. **Render** — draw the current state to the canvas
3. **Schedule** — ask the browser to call this function again on the next frame

```ts
function gameLoop(timestamp: number): void {
  update(timestamp);   // 1. update
  render();            // 2. render
  requestAnimationFrame(gameLoop);  // 3. schedule next frame
}
requestAnimationFrame(gameLoop);    // start the loop
```

**Where it appears again:** Every canvas or WebGL game uses this pattern.
It is the same pattern as a React render cycle or a physics engine step.

---

## Math: Delta Time

**What it computes:** The time (in milliseconds) that passed between the current
frame and the previous frame.

**The real-world analogy:** A car driving at 60mph. After 0.5 hours, it has
traveled 30 miles. After 2 hours, 120 miles. The distance depends on speed AND
time: `distance = speed × time`. Delta time is the "time" factor — it lets game
speed be defined in real seconds, not in frames.

**Formula:**

```
deltaTime = currentTimestamp - previousTimestamp

gravityTimer += deltaTime
if (gravityTimer >= DROP_INTERVAL_MS) {
  dropPieceOneRow();
  gravityTimer -= DROP_INTERVAL_MS;   // subtract, not reset to 0
}                                      // ↑ preserves leftover time
                                       //   so gravity stays accurate
```

**Why subtract instead of reset to zero:** If a frame takes 20ms and
`DROP_INTERVAL_MS` is 18ms, resetting to 0 loses 2ms. After many frames,
this accumulates into measurable drift — the piece falls slightly slower than
intended. Subtracting preserves the remainder.

**Concrete example:**

```
Frame 1: timestamp=0     dt=0      gravityTimer=0
Frame 2: timestamp=16.7  dt=16.7   gravityTimer=16.7
Frame 3: timestamp=33.4  dt=16.7   gravityTimer=33.4
...
Frame 48: timestamp=800  dt=16.7   gravityTimer=800 → DROP! gravityTimer=0
```

At 60fps, 48 frames ≈ 800ms. The piece drops exactly once per second at any
frame rate.

**Watch for:** `dt` can spike to 1000ms+ if the browser tab is hidden and then
shown. Cap delta time: `const dt = Math.min(deltaTime, 100)`. Without the cap,
one giant dt could drop the piece through the entire board instantly.

---

## Concept: TypeScript `interface` — A Contract for Objects

**What it is:** A named type that describes what properties and methods an object
must have — without creating any runtime code.

**The problem before (scattered state):**

Right now `main.ts` has `board`, `activePiece`, `PIECE_COLORS` as separate
module-level variables. As the game grows (score, level, game over flag), these
scatter across the file. Any function that needs "the game state" must receive
5+ separate parameters.

**The solution — bundle state into a typed object:**

```ts
interface GameState {
  board: Board;
  activePiece: Piece;
  gravityTimer: number;   // ms accumulated since last drop
  dropInterval: number;   // ms between automatic drops
}
```

Now a function signature becomes `function update(state: GameState): void`
instead of `function update(board, piece, timer, interval): void`.

**Difference from `class`:**

| | `interface` | `class` |
|---|---|---|
| Runtime existence | No — compile-time only | Yes — creates a constructor |
| Creates objects | No — just describes shape | Yes — `new ClassName()` |
| Has methods | Can declare (not implement) | Implements methods |
| Use when | Describing data shape | Data + behavior together |

**Canonical example:**

```ts
interface Car {
  make: string;
  model: string;
  year: number;
  startEngine(): void;   // method signature — the 'what', not the 'how'
}

// Any object with these fields satisfies the interface:
const myCar: Car = {
  make: 'Toyota',
  model: 'Corolla',
  year: 2020,
  startEngine() { console.log('vroom'); }
};
```

**Project Application (The "Why" here):**

`GameState` is an interface (not a class) because it is pure data — no private
state, no encapsulation rules. The Board class (LAB-07) and Piece class (LAB-03)
already handle their own encapsulation. `GameState` is the connector that holds
references to all game objects.

**Watch for:** TypeScript interfaces use semicolons `;` between properties, not
commas. Object literals use commas. They look similar but have different syntax.

---

## Step 1 — Define `GameState` Interface

Open `src/main.ts`. Add the interface below the imports:

```ts
// ── Game State Interface ────────────────────────────────────────────────────

// GameState: the complete, typed description of all mutable game data.
// Using an interface (not a class) because this is pure data — no behavior needed.
interface GameState {
  board: Board;                  // the 20×10 locked-cell grid
  activePiece: Piece;            // the currently falling piece
  gravityTimer: number;          // ms accumulated since the last automatic drop
  readonly dropInterval: number; // ms between automatic drops (800ms at level 1)
}
```

Now replace the scattered variable declarations with a single `state` object:

```ts
// ── Initial State ──────────────────────────────────────────────────────────

// Remove these old lines (they are replaced by 'state'):
// const board: Board = createBoard();
// const activePiece: Piece = new Piece(6);

const DROP_INTERVAL_MS: number = 800;  // ms between automatic drops at level 1

// Single typed object holds all mutable game data:
const state: GameState = {
  board: createBoard(),
  activePiece: new Piece(6),
  gravityTimer: 0,
  dropInterval: DROP_INTERVAL_MS,
};
```

### SAVE AND TRY

Save. The game should look identical to LAB-05 — nothing visual changed.

**Check for TypeScript errors:** If you see errors, it is because the old
`board` and `activePiece` variables are now `state.board` and `state.activePiece`.
The next step updates all references.

---

## Step 2 — Update All References to Use `state`

Do a find-and-replace in `main.ts`:
- `board` → `state.board` (wherever it was the standalone variable)
- `activePiece` → `state.activePiece`

The key places to update:

```ts
// drawBoard call:
drawBoard(state.board);  // ← was: drawBoard() using the global 'board'

// drawPiece call:
drawPiece(state.activePiece);  // ← was: drawPiece(activePiece)

// isValidPosition calls in keyboard handler — update all 'board' → 'state.board':
isValidPosition(state.board, proposed, state.activePiece.getCells(), BOARD_COLS, BOARD_ROWS)
```

Also update `drawBoard` to accept `board` as a parameter (instead of using the global):

```ts
function drawBoard(board: Board): void {  // ← add parameter
  for (let rowIndex = 0; rowIndex < BOARD_ROWS; rowIndex++) {
    for (let colIndex = 0; colIndex < BOARD_COLS; colIndex++) {
      const cellValue = board[rowIndex][colIndex];  // uses the parameter now
      drawCell(colIndex, rowIndex, PIECE_COLORS[cellValue]);
    }
  }
}
```

### SAVE AND TRY

Save. Same visual as before — the game should work exactly as in LAB-05 with
keyboard movement. No visual change; we just cleaned up the architecture.

**In DevTools Console:**

```js
state.gravityTimer    // Expected: 0 (hasn't started yet)
state.dropInterval    // Expected: 800
state.board.length    // Expected: 20
```

---

## Step 3 — Add the Game Loop with Delta Time

Replace the bottom section of `main.ts` (the single `drawBackground()`, `drawBoard()`,
`drawPiece()` calls) with the full game loop:

```ts
// ── Game Loop ──────────────────────────────────────────────────────────────

// Cap delta time to 100ms — prevents large time spikes (e.g. tab switching)
// from dropping the piece through the entire board in one update.
const MAX_DELTA_MS: number = 100;

let previousTimestamp: number = 0;  // timestamp of the last frame — starts at 0

function update(dt: number): void {
  // Accumulate time since last gravity drop:
  state.gravityTimer += dt;

  // If enough time has accumulated, drop the piece one row:
  if (state.gravityTimer >= state.dropInterval) {
    state.gravityTimer -= state.dropInterval;  // subtract, not reset — preserves remainder

    const belowPosition: Vec2 = {
      x: state.activePiece.position.x,
      y: state.activePiece.position.y + 1,  // one row lower
    };

    if (isValidPosition(state.board, belowPosition, state.activePiece.getCells(), BOARD_COLS, BOARD_ROWS)) {
      state.activePiece.position = belowPosition;  // drop one row
    }
    // If not valid: piece has landed. Locking handled in LAB-07.
  }
}

function render(): void {
  drawBackground();
  drawBoard(state.board);
  drawPiece(state.activePiece);
}

function gameLoop(timestamp: number): void {
  const rawDelta = timestamp - previousTimestamp;      // ms since last frame
  const dt = Math.min(rawDelta, MAX_DELTA_MS);         // cap to prevent spikes
  previousTimestamp = timestamp;                       // save for next frame

  update(dt);    // update game state
  render();      // draw the new state

  requestAnimationFrame(gameLoop);  // schedule the next frame (~16.7ms at 60fps)
}

// Start the loop — first call provides timestamp=0 from the browser:
requestAnimationFrame(gameLoop);
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** The T-piece slowly falls down the board — one row every
~800ms. Arrow keys still work for horizontal movement and rotation. The piece
reaches the floor and stops there (it does not lock yet — locking is LAB-07).

**In DevTools Console:**

```js
state.activePiece.position
```

Run it a few times — the `y` value should increase by 1 every ~800ms.

**Change something:** Change `DROP_INTERVAL_MS` from `800` to `100`. Save.
The piece falls 10× faster. Change it back to `800`.

---

## 🎯 Challenge: Speed Up Soft Drop

**You know:** The gravity timer uses `state.dropInterval`. Soft drop (Down arrow)
currently moves one row per key press. Real Tetris soft drop makes gravity
10× faster while the key is held.

**Task:** Instead of moving one row per keydown event, make Down arrow set a
faster drop interval (80ms) while held, and restore the normal interval on keyup.

**Hints:**

1. `window.addEventListener('keyup', ...)` fires when a key is released.
2. Store a `normalDropInterval` and a `softDropInterval` constant.
3. On keydown Down: `state.dropInterval = softDropInterval`
4. On keyup Down: `state.dropInterval = normalDropInterval`

---

<details>
<summary>▶ Show Solution</summary>

```ts
const NORMAL_DROP_INTERVAL: number = 800;   // ms at normal speed
const SOFT_DROP_INTERVAL: number = 80;      // ms during soft drop (10× faster)

// Update state initialization:
const state: GameState = {
  board: createBoard(),
  activePiece: new Piece(6),
  gravityTimer: 0,
  dropInterval: NORMAL_DROP_INTERVAL,  // was: DROP_INTERVAL_MS
};

// In keydown handler, remove the ArrowDown case that moves piece manually.
// Gravity now handles movement. Just change the interval:
case 'ArrowDown':
  event.preventDefault();
  state.dropInterval = SOFT_DROP_INTERVAL;
  break;

// Add keyup listener:
window.addEventListener('keyup', (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    state.dropInterval = NORMAL_DROP_INTERVAL;
  }
});
```

**Key insight:** Soft drop is not "move the piece" — it is "make gravity faster."
By manipulating the timer interval rather than directly moving the piece, soft
drop integrates naturally with the game loop. The same gravity code handles
both normal and fast drop — no duplicate movement logic.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Piece falls automatically | Watch the canvas — piece descends without key presses |
| Fall rate is ~800ms | Count time between drops — should be approximately 0.8 seconds |
| Left/right/rotate still work | Arrow keys still function during auto-fall |
| Piece stops at floor | Let piece fall to row 17 — it stops (bottom cell at row 19) |
| `state` object is typed | Console: `state.dropInterval = "fast"` → TypeScript error in editor |
| Delta time cap works | Switch tabs for 10 seconds, return — piece should NOT have fallen through the board |

---

## Quick Check Answers

**1. How do you calculate elapsed time between two timestamps?**

Subtract the previous timestamp from the current one:
`dt = currentTimestamp - previousTimestamp`. Both timestamps are in milliseconds
from some arbitrary start point (when the browser was loaded). The subtraction
gives the elapsed time between frames. After using `dt`, store the current
timestamp as the new previous: `previousTimestamp = currentTimestamp`. This
creates a rolling window: each frame knows exactly how long it waited.

**2. Difference between TypeScript `interface` and `class`?**

A `class` exists at runtime — it creates a constructor function and instances
with methods stored on a prototype. An `interface` is erased entirely at
compile time — no JavaScript is generated for it. Use `class` when objects
need behavior (methods, private state). Use `interface` when you only need
to describe the shape of data — especially for objects created with `{}` literal
syntax, not `new`. `GameState` uses an interface because it is assembled from
parts (a board array, a Piece instance, timers) rather than constructed from
a single template.

**3. (Prediction) How many 60fps frames before an 800ms gravity timer fires?**

At 60fps, each frame takes approximately 1000/60 ≈ 16.7ms. After 800ms ÷ 16.7ms
≈ 47.9 frames, the gravity timer fires. In practice, the 48th frame pushes the
accumulated timer past 800ms. Because we subtract (not reset) on each drop, any
leftover time (up to 16.7ms) carries forward — the next drop's timer starts
at the leftover amount, keeping the interval precise over time.

---

*Next: LAB-07 — Locking and Spawning. When a piece reaches the floor (or
lands on another piece), it locks into the board array and a new random piece
spawns. We introduce the Board class — the first large OOP refactor — with
private state and public methods for locking.*
