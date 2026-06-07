# Tetris V3 — LAB 10 — Game Over: Finite State Machine

**Prerequisites:** LAB-09 complete. Score, level, and lines display. Pieces
lock, lines clear, pieces spawn indefinitely.

**What this lab adds:**
- A `GamePhase` discriminated union — a TypeScript Finite State Machine
- Game over detection when a newly spawned piece overlaps locked cells
- A semi-transparent overlay drawn on the canvas when the game ends
- Any-key restart that resets the full game state cleanly

**Time:** 45–60 minutes

---

## What You Will Build

```
During play:                    Game over:
┌──────────────┐                ┌──────────────┐
│   ░ ░ ░      │                │▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← dark overlay
│     ░        │   board        │▓             ▓│
│   ░ ░ ░ ░ ░  │   full up      │▓  GAME OVER  ▓│
│  ░ ░ ░ ░ ░ ░ │   ──────►     │▓             ▓│
│  ░ ░ ░ ░ ░ ░ │                │▓ Press any   ▓│
│  ░ ░ ░ ░ ░ ░ │                │▓   key       ▓│
└──────────────┘                └──────────────┘
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. What is a Finite State Machine? Name the four components of a formal FSM.
> 2. In TypeScript, what is a "discriminated union"?
> 3. *(Prediction)* If you reset the board and spawn a new piece immediately
>    after a game-over, what could go wrong?
>
> *(Answers at the end of this lab)*

---

## DSA / OOP Concept: Finite State Machine (FSM)

**What it is:** A mathematical model with a finite set of states, a current
state, and defined transitions (rules for moving between states in response
to events). Only one state is active at a time.

**The four formal components:**

1. **States** — a finite set of possible situations (Playing, GameOver)
2. **Current state** — which one is active right now
3. **Events** — what can trigger a transition (piece locks out, key pressed)
4. **Transitions** — rules mapping (state, event) → new state

**In Tetris:**

```
States:    Playing,  GameOver
Events:    LockOut,  AnyKeyPress

Transitions:
  Playing + LockOut     → GameOver
  GameOver + AnyKeyPress → Playing  (with full reset)
```

**The problem before:**

Without an FSM, game state is tracked with boolean flags:

```ts
let isGameOver = false;
let isPlaying = true;
// These can conflict: isGameOver=true and isPlaying=true simultaneously
// — an impossible state that causes bugs.
```

**The solution — one state variable, mutually exclusive values:**

```ts
type GamePhase = 'playing' | 'gameover';
let phase: GamePhase = 'playing';
// Impossible to be both 'playing' and 'gameover' — only one string can be stored.
```

**Pattern category:** Behavioral
**Official name:** Finite State Machine (FSM) / State Pattern
**Tradeoff:** FSMs add structure but require formalizing all transitions.
Bugs often come from missing transitions ("what happens if X in state Y?").
**You will see this again in:** Any multi-screen UI — menus, pausing, cutscenes.

---

## Concept: Discriminated Unions — TypeScript's FSM Type

**What it is:** A union of object types where each member has a shared
`kind` (or `type`) property with a unique literal value. TypeScript uses
the discriminant to narrow the type in `switch` statements.

**Canonical example:**

```ts
type Shape =
  | { kind: 'circle';    radius: number }
  | { kind: 'square';    side: number }
  | { kind: 'rectangle'; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':    return Math.PI * shape.radius ** 2;
    //                              ↑ TypeScript knows shape has 'radius' here
    case 'square':    return shape.side ** 2;
    case 'rectangle': return shape.width * shape.height;
  }
}
```

Each case of the `switch` narrows `shape` to the specific subtype — TypeScript
knows exactly which properties exist.

**Project Application (The "Why" here):**

For Tetris, the discriminated union is simple:

```ts
type GamePhase =
  | { kind: 'playing' }
  | { kind: 'gameover'; finalScore: number };  // gameover carries the score
```

When `phase.kind === 'gameover'`, TypeScript knows `phase.finalScore` exists.
When `phase.kind === 'playing'`, it knows `finalScore` does not exist —
preventing access to an undefined property.

**Watch for:** The discriminant field must have a **literal type**, not a general
type like `string`. `kind: string` would not narrow — TypeScript cannot know
which string value means which subtype.

---

## Step 1 — Define `GamePhase` in main.ts

Open `src/main.ts`. Add the type above `GameState`:

```ts
// ── Game Phase (FSM) ───────────────────────────────────────────────────────

// The two phases of the game. Only one can be active at a time.
// 'gameover' carries the final score so the overlay can display it.
type GamePhase =
  | { kind: 'playing' }
  | { kind: 'gameover'; finalScore: number };  // ← add this type

// Add phase to GameState:
interface GameState {
  board: Board;
  activePiece: Piece;
  gravityTimer: number;
  dropInterval: number;
  score: number;
  level: number;
  totalLinesCleared: number;
  phase: GamePhase;     // ← add this field
}

// Update state initialization:
const state: GameState = {
  board: new Board(BOARD_COLS, BOARD_ROWS),
  activePiece: spawnPiece(),
  gravityTimer: 0,
  dropInterval: BASE_DROP_MS,
  score: 0,
  level: 1,
  totalLinesCleared: 0,
  phase: { kind: 'playing' },   // ← add this
};
```

### SAVE AND TRY

Save. No visual change. Verify TypeScript is happy.

**In DevTools Console:**

```js
state.phase            // Expected: { kind: 'playing' }
state.phase.kind       // Expected: 'playing'
```

---

## Step 2 — Detect Game Over and Transition State

Game over occurs when a newly spawned piece immediately overlaps locked cells
— the board has stacked to the top.

Update the lock block in `update()`:

```ts
    } else {
      state.board.lock(state.activePiece);

      const linesCleared = state.board.clearLines();
      if (linesCleared > 0) {
        state.score += BASE_SCORES[linesCleared] * state.level;
        state.totalLinesCleared += linesCleared;
        const newLevel = computeLevel(state.totalLinesCleared);
        if (newLevel > state.level) {
          state.level = newLevel;
          state.dropInterval = computeDropInterval(state.level);
        }
      }

      // Spawn the next piece:
      const nextPiece = spawnPiece();

      // Check if the spawn position is valid — if not, the board is full:
      const spawnIsValid = isValidPosition(
        (col, row) => state.board.getCell(col, row),
        nextPiece.position,
        nextPiece.getCells(),
        BOARD_COLS,
        BOARD_ROWS
      );

      if (!spawnIsValid) {
        // GAME OVER — transition to gameover state:
        state.phase = { kind: 'gameover', finalScore: state.score };
        // The game loop continues rendering but 'update' will check phase
        // and skip game logic while in 'gameover'.
      } else {
        state.activePiece = nextPiece;  // valid spawn — continue playing
      }

      state.gravityTimer = 0;
    }
```

Update the top of `update()` to guard against running while in gameover:

```ts
function update(dt: number): void {
  if (state.phase.kind !== 'playing') return;  // ← add this guard at the top
  // Nothing updates while in gameover — rendering continues (shows the overlay)
  // ...rest of update unchanged...
}
```

### SAVE AND TRY

Save. Play until the board fills up.

**You should see:** When the board stacks to the top and a new piece cannot
spawn, the game stops falling. The board is frozen on screen.

**In DevTools Console (after game over):**

```js
state.phase   // Expected: { kind: 'gameover', finalScore: <your score> }
```

---

## Step 3 — Draw the Game Over Overlay

Add `drawGameOver` to `main.ts`:

```ts
// drawGameOver: renders a semi-transparent overlay with GAME OVER text.
// Uses globalAlpha to blend the overlay with the board visible beneath it.
function drawGameOver(): void {
  // Semi-transparent black overlay over the board area only:
  ctx.globalAlpha = 0.75;    // 75% opacity — board still visible beneath
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH - 100, CANVAS_HEIGHT);  // board area only (300px wide)
  ctx.globalAlpha = 1.0;     // restore full opacity — text must be fully opaque

  // Center text over the board (board width = 300px, center x = 150):
  ctx.textAlign = 'center';

  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('GAME OVER', 150, CANVAS_HEIGHT / 2 - 20);

  // Display the final score (available because phase.kind === 'gameover'):
  if (state.phase.kind === 'gameover') {
    ctx.font = '16px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`Score: ${state.phase.finalScore}`, 150, CANVAS_HEIGHT / 2 + 14);
    //                      ↑ TypeScript knows .finalScore exists here
    //                        because we checked phase.kind === 'gameover'
  }

  ctx.font = '14px monospace';
  ctx.fillStyle = '#888888';
  ctx.fillText('Press any key to restart', 150, CANVAS_HEIGHT / 2 + 44);

  ctx.textAlign = 'left';  // restore default alignment
}
```

Update `render()` to conditionally show the overlay:

```ts
function render(): void {
  drawBackground();
  drawBoard(state.board);

  if (state.phase.kind === 'playing') {
    drawPiece(state.activePiece);  // only draw active piece during play
  }

  drawHUD();

  if (state.phase.kind === 'gameover') {
    drawGameOver();               // overlay appears on top of everything
  }
}
```

### SAVE AND TRY

Save. Play until game over.

**You should see:** When the game ends, a semi-transparent black overlay appears
over the board with "GAME OVER", the final score, and a restart prompt.

---

## Step 4 — Restart on Any Key

Update the `keydown` handler. Add a check at the top, before any other key handling:

```ts
window.addEventListener('keydown', (event: KeyboardEvent) => {
  // If in gameover state, any key restarts the game:
  if (state.phase.kind === 'gameover') {      // ← add this block at the top
    resetGame();
    return;  // do not process the key as a game action after restarting
  }

  // ...rest of existing keydown handler unchanged...
});
```

Add the `resetGame` function:

```ts
// resetGame: returns the game to its initial state for a fresh start.
// Resets all GameState fields — nothing from the previous game carries over
// (except the high score stored in localStorage, handled separately).
function resetGame(): void {
  state.board.reset();                          // wipe the board cells
  state.activePiece = spawnPiece();            // spawn a fresh piece
  state.gravityTimer = 0;
  state.dropInterval = BASE_DROP_MS;           // back to level 1 speed
  state.score = 0;
  state.level = 1;
  state.totalLinesCleared = 0;
  state.phase = { kind: 'playing' };           // transition back to playing
  // The game loop is already running — it picks up the new state on the next frame.
}
```

### SAVE AND TRY

Save. Play until game over. Press any key.

**You should see:** The overlay disappears. A new piece spawns at the top.
The score, level, and lines all reset to their starting values. The board is
empty again.

**Verify the FSM transition:**

```js
// During game over:
state.phase    // { kind: 'gameover', finalScore: N }

// Press any key — then immediately:
state.phase    // { kind: 'playing' }
```

---

## 🎯 Challenge: Pause State

**You know:** The FSM has two states. Adding a third — `'paused'` — follows
the same pattern.

**Task:** Add a `paused` state. Press `P` to toggle between `playing` and
`paused`. While paused:
- The piece does not fall (update guard)
- A "PAUSED" overlay appears over the board
- All game input is ignored except `P` to unpause

Add `{ kind: 'paused' }` to the `GamePhase` union. Update the `update` guard,
`render`, and the `keydown` handler.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Updated GamePhase:
type GamePhase =
  | { kind: 'playing' }
  | { kind: 'paused' }                          // ← new state
  | { kind: 'gameover'; finalScore: number };

// Update guard in update():
function update(dt: number): void {
  if (state.phase.kind !== 'playing') return;  // blocks both 'paused' and 'gameover'
  // ...
}

// In render():
if (state.phase.kind === 'paused') {
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH - 100, CANVAS_HEIGHT);
  ctx.globalAlpha = 1.0;
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('PAUSED', 150, CANVAS_HEIGHT / 2);
  ctx.textAlign = 'left';
}

// In keydown handler, before the gameover check:
if (event.key === 'p' || event.key === 'P') {
  if (state.phase.kind === 'playing') {
    state.phase = { kind: 'paused' };
  } else if (state.phase.kind === 'paused') {
    state.phase = { kind: 'playing' };
    previousTimestamp = performance.now();  // reset timestamp to avoid dt spike after pause
  }
  return;
}
```

**Key insight:** The FSM's `update` guard `if (state.phase.kind !== 'playing') return`
automatically blocks both `paused` and `gameover` without any additional checks.
New states are added to the guard for free. Resetting `previousTimestamp` after
unpausing is critical — without it, the accumulated dt from the pause duration
would cause a massive time spike that drops the piece instantly.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Game over triggers when board fills | Stack pieces until game ends |
| Overlay appears on game over | Semi-transparent black with GAME OVER text |
| Final score shown in overlay | `state.phase.finalScore` matches score before death |
| Any key restarts | Press any key during game over — fresh board |
| Score, level, lines reset on restart | All counters return to 0/1/0 |
| Game loop continues during gameover | Canvas still renders the frozen board |
| TypeScript narrows `finalScore` | `state.phase.finalScore` only accessible when `kind === 'gameover'` |

---

## Quick Check Answers

**1. What is a Finite State Machine? Name the four components.**

An FSM is a model with a finite set of possible states, where only one state
is active at a time, and defined rules move between states. The four components:
(1) **States** — the finite set of possible situations; (2) **Current state** —
which one is active; (3) **Events** — inputs or actions that trigger transitions;
(4) **Transitions** — rules defining which event in which state leads to which
new state. FSMs are used in game logic, UI flows, protocol parsing, and
traffic light controllers.

**2. What is a TypeScript discriminated union?**

A union type where each member has a shared property (the discriminant) with a
distinct literal value. TypeScript uses the discriminant in `if`/`switch` checks
to narrow the type — inside `case 'gameover':`, TypeScript knows the object has
`finalScore` because only the `gameover` variant has that property. The discriminant
makes type narrowing exhaustive and explicit, eliminating the need for type casts.

**3. (Prediction) If you reset the board and spawn a piece immediately after
game over, what could go wrong?**

If you reset the board (wipe all cells) AFTER spawning the new piece, the spawn
position check runs against the OLD (full) board — the new piece might be
flagged as invalid even though the board is about to be cleared. Always reset
the board FIRST, then spawn. Alternatively, check spawn validity against the
ALREADY RESET board. Order of operations matters: `board.reset()` → `spawnPiece()`
→ check validity against the now-empty board.

---

*Next: LAB-11 — Ghost Piece, Next Preview, and the 7-Bag Queue. We formally
teach the Queue data structure, implement the 7-bag randomizer (Fisher-Yates
shuffle), draw a ghost piece (showing the landing position), and add a
next-piece preview panel.*
