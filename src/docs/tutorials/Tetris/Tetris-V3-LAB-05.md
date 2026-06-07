# Tetris V3 — LAB 05 — Collision Detection

**Prerequisites:** LAB-04 complete. Pieces rotate with the Up arrow. The board
exists as a typed 2D array. No boundaries are enforced yet — the piece can be
moved off-screen.

**What this lab adds:**
- `isValidPosition(piece, testPosition, testCells)` — a predicate that answers
  "would this piece fit here?"
- Left/right/down arrow movement blocked by walls, floor, and locked board cells
- Rotation that validates before committing — blocked by walls and locked cells

**Time:** 60–75 minutes

---

## What You Will Build

```
Before: piece passes through walls and floor freely

After:
  ┌──────────────┐
  │ ░░░          │  ← blocked by left wall
  │  ░           │
  │              │
  │           ░░░│  ← blocked by right wall
  │            ░ │
  │              │
  │         ░░░  │
  │          ░   │  ← blocked by floor
  └──────────────┘
```

Rotation at the wall is also blocked when it would place cells outside the board.

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why do we check a PROPOSED position instead of the CURRENT position?
> 2. A piece at column 8 with a 3-cell-wide shape — what column would the
>    rightmost cell occupy? Would it be out of bounds for a 10-column board?
> 3. *(Prediction)* What happens if we check collision AFTER moving instead of BEFORE?
>
> *(Answers at the end of this lab)*

---

## Concept: Predicate Functions — "Does This Fit?"

**What it is:** A function that returns a boolean (`true`/`false`) answering a
yes/no question. The name always starts with `is` or `can`.

**The problem before:**

Without a predicate, the movement code mixes the question "is this valid?" with
the action "move the piece." This makes the logic hard to reuse — rotation needs
the same validity check as movement, but the code is buried inside the movement handler.

**The solution:** Extract the validity check into its own function. Call it
before moving, only move if it returns `true`:

```ts
// Check BEFORE moving:
if (isValidPosition(piece, proposedPosition, piece.getCells())) {
  piece.position = proposedPosition;
}
// No else needed — if it fails, nothing happens.
```

**Pattern category:** Behavioral — Guard Clause
**Official name:** Guard Clause / Predicate Function (non-GoF, but ubiquitous)
**Tradeoff:** One extra function call per action. Worth it: reusable, testable,
readable.
**You will see this again in:** LAB-04 rotation validation, LAB-06 gravity.

---

## Logic: Collision Conditions

**What it decides:** Whether a piece fits at a given position on the board.

**The four failure conditions (ANY of these = invalid):**

```
For each filled cell (col, row) in the piece's shape matrix:

  boardCol = position.x + col
  boardRow = position.y + row

  1. boardCol < 0              → left wall violation
  2. boardCol >= BOARD_COLS    → right wall violation
  3. boardRow >= BOARD_ROWS    → floor violation (row too large)
  4. board[boardRow][boardCol] !== 0   → overlaps a locked cell

If ALL cells pass ALL four checks → position is VALID (return true).
If ANY cell fails ANY check → position is INVALID (return false).
```

**Truth table (simplified for one cell):**

```
Left wall?  Right wall?  Floor?  Overlap?  Result
  yes          —           —        —       INVALID
  no          yes          —        —       INVALID
  no           no          yes      —       INVALID
  no           no          no       yes     INVALID
  no           no          no       no      VALID
```

We use short-circuit `||` — as soon as one condition is `true`, we return
`false` without checking the rest. This is both efficient and readable.

**Watch for:** We check `boardRow < 0` is NOT a failure — pieces start above
the board (`y: 0` means the top, but some shape rows at `y: -1` are above the
visible area). We allow negative rows so pieces can spawn with empty rows above
the visible board area. Only positive row violations (below floor) are blocked.

---

## Step 1 — Add `isValidPosition` to piece.ts

Open `src/piece.ts`. Add this function after `rotateMatrixCCW`, before the
`Piece` class, so the class can use it:

```ts
// isValidPosition: returns true if 'cells' placed at 'position' fits on the board.
// Takes the board as a parameter — the Piece class does not own the board.
// Takes testCells separately so we can validate a rotation BEFORE committing it.
export function isValidPosition(
  board: number[][],          // the current board state
  position: Vec2,             // proposed top-left position
  testCells: number[][],      // the shape to test (may be rotated)
  boardCols: number,          // total columns (10)
  boardRows: number           // total rows (20)
): boolean {

  for (let rowIndex = 0; rowIndex < testCells.length; rowIndex++) {
    for (let colIndex = 0; colIndex < testCells[rowIndex].length; colIndex++) {

      if (testCells[rowIndex][colIndex] === 0) continue;  // skip empty cells

      const boardCol = position.x + colIndex;  // board column this cell occupies
      const boardRow = position.y + rowIndex;  // board row this cell occupies

      // Left and right wall check:
      if (boardCol < 0 || boardCol >= boardCols) return false;

      // Floor check — we allow cells above the board (boardRow < 0 = above top):
      if (boardRow >= boardRows) return false;

      // Overlap check — only check cells that are actually on the board:
      if (boardRow >= 0 && board[boardRow][boardCol] !== 0) return false;
    }
  }

  return true;  // all cells passed all checks
}
```

### SAVE AND TRY

Save `src/piece.ts`. No visual change. Test in DevTools Console after importing.

Add a temporary test in `main.ts` below the board creation:

```ts
import { isValidPosition } from './piece';  // ← add to imports at top of main.ts
// TEMP TEST:
console.log(isValidPosition(board, { x: 3, y: 0 }, activePiece.getCells(), BOARD_COLS, BOARD_ROWS));
// Expected: true (T-piece at center top is valid)
console.log(isValidPosition(board, { x: -1, y: 0 }, activePiece.getCells(), BOARD_COLS, BOARD_ROWS));
// Expected: false (piece would extend past left wall)
```

Delete the TEMP TEST lines after verifying.

---

## Step 2 — Update Piece.rotate() to Validate

Open `src/piece.ts`. Replace the `rotate()` method in the Piece class:

```ts
// rotate: rotates 90° CW only if the rotated shape fits at current position.
// Takes board, boardCols, boardRows as parameters — the Piece doesn't own these.
public rotate(board: number[][], boardCols: number, boardRows: number): void {  // ← update signature
  const rotated = rotateMatrix(this.cells);

  // Validate BEFORE committing — if rotation doesn't fit, do nothing:
  if (isValidPosition(board, this.position, rotated, boardCols, boardRows)) {
    this.cells = rotated;   // rotation is valid — commit it
  }
  // If invalid: this.cells is unchanged — the piece stays in its current state.
}
```

---

## Step 3 — Add Full Keyboard Movement

Replace the keydown event listener in `main.ts`:

```ts
// ── Keyboard Input ──────────────────────────────────────────────────────────

window.addEventListener('keydown', (event: KeyboardEvent) => {
  // Build a proposed position based on which arrow was pressed:
  let dx = 0;  // horizontal delta (change in x)
  let dy = 0;  // vertical delta (change in y)

  switch (event.key) {
    case 'ArrowLeft':
      dx = -1;  // move one column left
      event.preventDefault();
      break;
    case 'ArrowRight':
      dx = 1;   // move one column right
      event.preventDefault();
      break;
    case 'ArrowDown':
      dy = 1;   // move one row down (soft drop)
      event.preventDefault();
      break;
    case 'ArrowUp':
      // Rotation is handled separately — not a position change:
      activePiece.rotate(board, BOARD_COLS, BOARD_ROWS);  // ← updated call
      event.preventDefault();
      break;
    default:
      return;  // ignore all other keys — skip the redraw below
  }

  if (dx !== 0 || dy !== 0) {
    // Build the proposed position:
    const proposed: Vec2 = {
      x: activePiece.position.x + dx,
      y: activePiece.position.y + dy,
    };

    // Only move if the proposed position is valid:
    if (isValidPosition(board, proposed, activePiece.getCells(), BOARD_COLS, BOARD_ROWS)) {
      activePiece.position = proposed;  // commit the move
    }
  }

  // Redraw after any key press:
  drawBackground();
  drawBoard();
  drawPiece(activePiece);
});
```

### SAVE AND TRY

Save. Click the canvas to focus. Test all four arrow keys.

**You should see:**
- Left/Right arrows: piece moves horizontally, stops at column 0 (left wall)
  and column 7 (right wall for a 3-wide piece — rightmost cell at col 9)
- Down arrow: piece moves down one row per press, stops at the floor (row 17
  for a 3-tall piece — bottom cell at row 19)
- Up arrow: piece rotates 90° CW, blocked at walls if rotation would extend outside

**In DevTools Console:**

Move the piece to the left wall, then type:

```js
activePiece.position
```

**Expected:** `{ x: 0, y: ... }` — exactly at column 0.

**Change something:** Temporarily change `boardCols` in `isValidPosition` to
`5` — the effective board width halves and the piece is blocked much sooner.
Change it back.

---

## 🎯 Challenge: Hard Drop

**You know:** `isValidPosition` checks any proposed position. The piece falls
until `isValidPosition` returns `false`.

**Task:** Implement hard drop — when Space is pressed, the piece instantly moves
to the lowest valid row. Add it to the `keydown` handler.

**Hint:**

```ts
case ' ':                           // Space key
  // Keep moving down until the next row is invalid:
  while (isValidPosition(board, { x: activePiece.position.x, y: activePiece.position.y + 1 }, ...)) {
    activePiece.position.y += 1;
  }
  event.preventDefault();
  break;
```

The while loop keeps adding 1 to Y until the next position is invalid — then
it stops. That final Y is the lowest valid row.

---

<details>
<summary>▶ Show Solution</summary>

```ts
case ' ':
  event.preventDefault();
  // Drop until the next row down is invalid:
  while (
    isValidPosition(
      board,
      { x: activePiece.position.x, y: activePiece.position.y + 1 },
      activePiece.getCells(),
      BOARD_COLS,
      BOARD_ROWS
    )
  ) {
    activePiece.position.y += 1;
  }
  // Do not break — fall through to redraw (already handled below the switch)
  break;
```

**Key insight:** Hard drop is just an accelerated version of gravity — move
down repeatedly until blocked. The same `isValidPosition` function handles
both the single-step soft drop and the instant hard drop. The separation of
"check" (`isValidPosition`) from "act" (update position) makes both features
trivial to add.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Left wall blocks movement | Move left until blocked — `activePiece.position.x` must be `0` |
| Right wall blocks movement | Move right until blocked — rightmost cell (x + shape width - 1) must be `9` |
| Floor blocks movement | Move down until blocked — bottom cell row must be `19` |
| Rotation blocked at walls | Push piece to left wall, try to rotate — rotation that would go outside is blocked |
| `isValidPosition` tested | Console: test with an explicitly out-of-bounds position — returns `false` |

---

## Quick Check Answers

**1. Why check a PROPOSED position instead of the CURRENT position?**

The current position is already valid — the piece is already there. We need
to know whether the **next** position (after moving) is valid before we commit
the move. Checking the current position would always return `true` and allow
any movement. The "check before act" pattern is the core of all collision
detection: propose → validate → commit or discard.

**2. A piece at column 8 with a 3-cell-wide shape — is it out of bounds?**

Yes. The rightmost cell is at `boardCol = 8 + 2 = 10`. The board has columns
0 through 9 (`BOARD_COLS = 10`). Column 10 does not exist — the check
`boardCol >= boardCols` catches this: `10 >= 10` is `true` → invalid.

**3. (Prediction) What happens if we check collision AFTER moving?**

The piece would briefly occupy an illegal position — one frame where it extends
through a wall or overlaps a locked cell. In a game with a game loop, this
flickers: the piece appears in the wrong position for one frame before snapping
back. With keyboard input (which redraws immediately), you would see the piece
pass through the wall for one draw call, then snap back. More critically: if
you check after moving AND decide to snap back, you need to undo the move —
extra state management. Check-before-act avoids the undo entirely.

---

*Next: LAB-06 — Game Loop and Interfaces. We add automatic gravity using
`requestAnimationFrame` and delta time, introduce the TypeScript `interface`
keyword to define a formal `GameState` contract, and make pieces fall on their
own.*
