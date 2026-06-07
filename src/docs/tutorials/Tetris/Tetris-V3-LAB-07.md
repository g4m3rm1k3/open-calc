# Tetris V3 — LAB 07 — The Board Class: Locking and Spawning

**Prerequisites:** LAB-06 complete. Pieces fall automatically, stop at the floor,
but do not lock. A new piece never spawns.

**What this lab adds:**
- A `Board` class that encapsulates the 2D array and all operations on it
- `Board.lock(piece)` — merges the piece into the board's cells
- `Board.isOccupied(col, row)` — read-only check used by `isValidPosition`
- A `spawnPiece()` function that picks a random piece
- The game loops: piece falls → lands → locks → new piece spawns → repeat

**Time:** 60–75 minutes

---

## What You Will Build

```
Before: piece falls, hits floor, stops. No new piece. One piece forever.

After: piece falls → hits floor → LOCKS (cells appear as colored squares)
       → new random piece spawns at top → repeat indefinitely
```

After this lab the game is mechanically complete (minus line clearing) — you can
play it, watch pieces stack, and see the board fill up.

---

> **Quick Check — try to answer before reading further:**
>
> 1. What does "encapsulation" mean in OOP, and why is it valuable?
> 2. If `board` is a private property of `Board`, how can `isValidPosition`
>    (an external function) still check cell values?
> 3. *(Prediction)* What happens if you lock a piece that is partially above
>    the top of the board (row < 0 cells)?
>
> *(Answers at the end of this lab)*

---

## Concept: Encapsulation — Controlling Access to State

**What it is:** Hiding an object's internal data behind a controlled public
interface, so outside code cannot corrupt the data by breaking the object's rules.

**The problem before:**

The board is a raw 2D array in `main.ts`. Any function can write anything to it:

```ts
state.board[5][3] = 99;  // valid TypeScript — but 99 is not a CellValue (0–7)
```

TypeScript catches the `99` case (not a valid `CellValue`), but cannot prevent
logical corruption like writing to the wrong position during a lock operation.

**The solution — Board class:**

```ts
class Board {
  private cells: CellValue[][];   // only Board's methods can change this

  public lock(piece: Piece): void {
    // validated, controlled write to cells — no outside code needed
  }

  public getCell(col: number, row: number): CellValue {
    return this.cells[row][col];  // read-only access through a method
  }
}
```

Outside code asks the Board to lock a piece — it never touches `cells` directly.
The Board controls the locking process: it validates positions, skips off-screen
cells, and guarantees the result is a valid board state.

**Pattern category:** Structural — Encapsulation (OOP pillar)
**Tradeoff:** More code to write. Worth it when data has rules about how it
can be modified — the Board has strict rules (only valid CellValues, only
on-board positions).
**You will see this again in:** LAB-11 Queue class.

---

## Step 1 — Create `src/board.ts` with the Board Class

Create a new file `src/board.ts`:

```ts
// src/board.ts

import { Piece, Vec2 } from './piece';   // Piece and Vec2 are needed for lock()

// ── Types ──────────────────────────────────────────────────────────────────

export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
// NOTE: CellValue moves here from main.ts. Update main.ts to import it from board.ts.

// ── Board Class ────────────────────────────────────────────────────────────

export class Board {
  private cells: CellValue[][];           // the 2D grid of locked cells
  public readonly cols: number;           // number of columns (10)
  public readonly rows: number;           // number of rows (20)

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.cells = this.createEmptyCells();  // start with a clean grid
  }

  // createEmptyCells: internal helper — creates a fresh all-zero 2D array.
  // Private because outside code should never bypass 'reset()' to recreate cells.
  private createEmptyCells(): CellValue[][] {
    return Array.from(
      { length: this.rows },
      () => new Array(this.cols).fill(0) as CellValue[]
    );
  }

  // reset: wipes the board for a new game. Public because main.ts calls it on restart.
  public reset(): void {
    this.cells = this.createEmptyCells();
  }

  // getCell: read-only access to one cell. Used by isValidPosition and drawBoard.
  // Returns 0 for cells above the board (row < 0) — they are always empty.
  public getCell(col: number, row: number): CellValue {
    if (row < 0) return 0;  // above the board — treat as empty
    return this.cells[row][col];
  }

  // getRows / getCols: returns a read-only view of the cells for drawing.
  // We return a copy so outside code cannot mutate the board's internal array.
  public getCells(): CellValue[][] {
    return this.cells.map((row) => [...row] as CellValue[]);
  }

  // lock: merges a piece's cells into the board permanently.
  // Called when a piece has landed and cannot move further down.
  public lock(piece: Piece): void {
    const cells = piece.getCells();     // the piece's shape matrix
    const pos = piece.position;         // the piece's board position

    for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
      for (let colIndex = 0; colIndex < cells[rowIndex].length; colIndex++) {

        if (cells[rowIndex][colIndex] === 0) continue;  // skip empty cells

        const boardRow = pos.y + rowIndex;   // target row on the board
        const boardCol = pos.x + colIndex;   // target column on the board

        // Skip cells above the board — they are not stored (piece spawned partially above):
        if (boardRow < 0) continue;

        // Write the piece's color index into the board cell:
        this.cells[boardRow][boardCol] = piece.getColorIndex() as CellValue;
      }
    }
  }

  // isTopRowOccupied: checks if any cell in the top row is non-zero.
  // Used in LAB-10 for game over detection — if a piece locks into the top row,
  // the game is over.
  public isTopRowOccupied(): boolean {
    return this.cells[0].some((cell) => cell !== 0);
  }
}
```

### SAVE AND TRY

Save `src/board.ts`. No visual change yet.

**Check for TypeScript errors** in your editor's Problems panel. Expect zero errors.

---

## Step 2 — Update main.ts to Use the Board Class

Open `src/main.ts`. Make these changes:

**Update imports:**

```ts
// At the top of main.ts:
import { Piece, Vec2, isValidPosition, rotateMatrix } from './piece';  // ← same
import { Board, CellValue } from './board';   // ← add this import
// Remove 'type Board = CellValue[][]' and 'type CellValue = ...' — they are in board.ts now
```

**Update the `GameState` interface:**

```ts
interface GameState {
  board: Board;              // ← was: Board (the type alias) — now it's the class
  activePiece: Piece;
  gravityTimer: number;
  dropInterval: number;      // remove 'readonly' — soft drop changes this
}
```

**Update state initialization:**

```ts
const state: GameState = {
  board: new Board(BOARD_COLS, BOARD_ROWS),  // ← was: createBoard()
  activePiece: new Piece(6),
  gravityTimer: 0,
  dropInterval: NORMAL_DROP_INTERVAL,
};
```

**Update `isValidPosition` calls** — the Board class now provides `getCell`,
so update the function in `piece.ts` to accept a Board-like object:

Since `isValidPosition` needs to check individual cells, we pass a cell-getter
function instead of the raw 2D array. Update the signature in `piece.ts`:

```ts
// In piece.ts — update isValidPosition:
export function isValidPosition(
  getCell: (col: number, row: number) => number,  // ← was: board: number[][]
  position: Vec2,
  testCells: number[][],
  boardCols: number,
  boardRows: number
): boolean {
  for (let rowIndex = 0; rowIndex < testCells.length; rowIndex++) {
    for (let colIndex = 0; colIndex < testCells[rowIndex].length; colIndex++) {
      if (testCells[rowIndex][colIndex] === 0) continue;
      const boardCol = position.x + colIndex;
      const boardRow = position.y + rowIndex;
      if (boardCol < 0 || boardCol >= boardCols) return false;
      if (boardRow >= boardRows) return false;
      if (boardRow >= 0 && getCell(boardCol, boardRow) !== 0) return false;
    }
  }
  return true;
}
```

**Update all `isValidPosition` calls in main.ts:**

```ts
// Instead of: isValidPosition(state.board, ...)
// Use: isValidPosition((c, r) => state.board.getCell(c, r), ...)
isValidPosition(
  (col, row) => state.board.getCell(col, row),  // ← lambda wraps getCell
  proposed,
  state.activePiece.getCells(),
  BOARD_COLS,
  BOARD_ROWS
)
```

**Update `drawBoard` to use `Board.getCells()`:**

```ts
function drawBoard(board: Board): void {  // ← parameter type changes to Board class
  const cells = board.getCells();        // get a copy of the cells
  for (let rowIndex = 0; rowIndex < BOARD_ROWS; rowIndex++) {
    for (let colIndex = 0; colIndex < BOARD_COLS; colIndex++) {
      const cellValue = cells[rowIndex][colIndex];
      drawCell(colIndex, rowIndex, PIECE_COLORS[cellValue]);
    }
  }
}
```

### SAVE AND TRY

Save. The game should look and behave identically to LAB-06 — pieces fall,
stop at floor, no new piece yet. We have just refactored to use the Board class.

**In DevTools Console:**

```js
state.board.getCell(0, 0)    // Expected: 0 (empty)
state.board.cols              // Expected: 10
state.board.rows              // Expected: 20
```

---

## Step 3 — Spawn a New Piece After Locking

Add `spawnPiece` to `main.ts`:

```ts
// ── Piece Spawning ─────────────────────────────────────────────────────────

// PIECE_COUNT: total number of piece types (I, J, L, O, S, T, Z = 7).
const PIECE_COUNT: number = 7;

// spawnPiece: creates a new random piece. Shape index 1–7 maps to 7 Tetris pieces.
// Math.random() returns a number in [0, 1). We scale and floor it to get 1–7.
function spawnPiece(): Piece {
  const shapeIndex = Math.floor(Math.random() * PIECE_COUNT) + 1;
  // Math.floor(Math.random() * 7) = 0–6 (random integer)
  // + 1 = 1–7 (shift to valid shape index range)
  return new Piece(shapeIndex);
}
```

Now update the `update()` function in the game loop to detect landing and lock:

```ts
function update(dt: number): void {
  state.gravityTimer += dt;

  if (state.gravityTimer >= state.dropInterval) {
    state.gravityTimer -= state.dropInterval;

    const belowPosition: Vec2 = {
      x: state.activePiece.position.x,
      y: state.activePiece.position.y + 1,
    };

    const canMoveDown = isValidPosition(
      (col, row) => state.board.getCell(col, row),
      belowPosition,
      state.activePiece.getCells(),
      BOARD_COLS,
      BOARD_ROWS
    );

    if (canMoveDown) {
      state.activePiece.position = belowPosition;  // drop one row
    } else {
      // Piece has landed — lock it and spawn the next piece:
      state.board.lock(state.activePiece);          // merge into board
      state.activePiece = spawnPiece();             // new piece at top
      state.gravityTimer = 0;                       // reset timer for new piece
    }
  }
}
```

### SAVE AND TRY

Save. Let the game run without touching anything.

**You should see:**
1. T-piece (or a random piece) spawns at the top
2. It falls one row every 800ms
3. When it reaches the floor, its cells remain (colored squares on the board)
4. A new random piece immediately spawns at the top
5. New pieces land on top of old locked pieces

**In DevTools Console:**

After a few pieces have locked, check:

```js
state.board.getCell(5, 19)   // Expected: a non-zero color index (locked piece)
```

**Change something:** Change `const PIECE_COUNT = 7` to `const PIECE_COUNT = 1`.
Save. Only I-pieces spawn — watch horizontal bars stack up. Change back to `7`.

---

## 🎯 Challenge: Refactor `drawPiece` to Use `drawShape`

**You know:** The challenge in LAB-03 introduced a `drawShape(cells, position, color)`
function. The `Piece` class is now fully defined with `getCells()`, `position`,
and `getColorIndex()`.

**Task:** If you did not implement `drawShape` in LAB-03, add it now. Then
update `drawPiece` to delegate to `drawShape` — `drawPiece` should contain
only 3 lines: extract data from the piece, call `drawShape`. This prepares
`drawShape` for reuse in LAB-11 (ghost piece and next-piece preview).

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Add to main.ts (if not already there from LAB-03 challenge):
function drawShape(cells: number[][], position: Vec2, color: string): void {
  for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
    for (let colIndex = 0; colIndex < cells[rowIndex].length; colIndex++) {
      if (cells[rowIndex][colIndex] === 0) continue;
      drawCell(position.x + colIndex, position.y + rowIndex, color);
    }
  }
}

// Updated drawPiece — delegates to drawShape:
function drawPiece(piece: Piece): void {
  drawShape(
    piece.getCells(),
    piece.position,
    PIECE_COLORS[piece.getColorIndex()]
  );
}
```

**Key insight:** `drawShape` is a pure function — it only reads its inputs
and writes to the canvas. `drawPiece` is an adapter — it extracts data from
a Piece and passes it to the pure function. This separation means `drawShape`
can be reused for the ghost piece (different position, same cells, transparent
color) without any changes to the Piece class.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Piece locks on landing | Let a piece fall to the floor — its colors stay on the board |
| New piece spawns after lock | After locking, a new piece appears at the top within one frame |
| Random pieces spawn | Watch 5+ pieces — different shapes and colors appear |
| Board fills up | After many pieces, the board stack grows — pieces land on top of each other |
| Board class encapsulates cells | Console: `state.board.cells` → TypeScript error (private); `state.board.getCell(0,0)` → works |
| Lock skips above-board cells | Spawn behavior is normal — no crash when piece partially above row 0 |

---

## Quick Check Answers

**1. What is encapsulation and why is it valuable?**

Encapsulation is bundling data and the rules for modifying that data together
in one place (a class), with private fields preventing outside code from
bypassing those rules. It is valuable because it makes bugs localized —
if the board state is corrupt, only the Board class methods could have caused
it. In V2, any function could write anything to `board[row][col]`, making
corruption bugs hard to trace. In V3, `Board.lock()` is the only way to modify
the board cells, and it validates every write.

**2. If `cells` is private, how can `isValidPosition` check cell values?**

Through the public `getCell(col, row)` method. `isValidPosition` receives a
function `(col, row) => number` — we pass `(col, row) => state.board.getCell(col, row)`.
The Board controls what `getCell` returns (it handles out-of-bounds row < 0 by
returning 0). `isValidPosition` never touches the private `cells` array — it
only calls the public interface the Board exposes.

**3. (Prediction) What happens when a piece locks with cells above row 0?**

Those above-board cells (`boardRow < 0`) are silently skipped by the `lock()`
method's `if (boardRow < 0) continue` guard. Only the visible cells (row ≥ 0)
are written into the board. This is correct behavior — pieces spawn with
their top rows above the board so they appear to "enter" from the top,
but only the visible portion actually participates in the game.

---

*Next: LAB-08 — Line Clearing. The Board class gets `clearLines()` — it scans
for full rows using `Array.every()`, removes them with `Array.filter()`, and
prepends empty rows at the top. We teach these as formal algorithms: filter
as set comprehension, every as universal quantification.*
