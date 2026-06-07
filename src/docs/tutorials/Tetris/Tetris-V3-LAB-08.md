# Tetris V3 — LAB 08 — Line Clearing: Array Algorithms

**Prerequisites:** LAB-07 complete. Pieces lock into the board and new pieces
spawn. The board fills up indefinitely — no lines are cleared yet.

**What this lab adds:**
- `Board.isRowFull(row)` — using `Array.every()` as universal quantification
- `Board.clearLines()` — using `Array.filter()` as set comprehension; returns
  the number of lines cleared
- The game calls `clearLines()` after every lock; full rows disappear and the
  stack shifts down

**Time:** 45–60 minutes

---

## What You Will Build

```
Before: rows fill up until the board is completely full — game cannot continue

After:
  ┌──────────────┐
  │              │  ← empty rows appear at top
  │ ░░░░░░░░░░   │
  │  ░░░░░░░░░░  │  ← full row disappears
  │  ░░░░░░░░░░  │    when filled
  └──────────────┘
```

Rows above the cleared line shift down by the number of cleared lines.
The game can now run indefinitely.

---

> **Quick Check — try to answer before reading further:**
>
> 1. `Array.every()` returns `true` if ALL elements pass the test. What does
>    it return if the array is empty?
> 2. `Array.filter()` removes elements — what does it return? Does it modify
>    the original array?
> 3. *(Prediction)* If three rows are cleared simultaneously, how many empty
>    rows must be added at the top?
>
> *(Answers at the end of this lab)*

---

## Math: Universal Quantification — `Array.every()`

**What it computes:** Returns `true` if EVERY element of an array satisfies
a condition. Equivalent to the mathematical "for all" quantifier (∀).

**The mathematical notation:**

```
∀x ∈ row : x ≠ 0
"For all cells x in this row, x is not equal to zero."
= true only if EVERY cell is non-zero (filled)
```

**The real-world analogy:** A train leaves only if every seat is booked.
One empty seat and the train stays. ALL seats must be full — hence "every."

**Canonical example:**

```ts
const row = [1, 3, 6, 2, 5, 7, 4, 1, 2, 3];  // 10 cells, all non-zero

row.every(cell => cell !== 0);   // true — all cells are filled
row.every(cell => cell > 5);     // false — not every cell is > 5

const emptyRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
emptyRow.every(cell => cell !== 0);   // false — all cells are zero (empty)
```

**Project Application (The "Why" here):**

`isRowFull` uses `every` to check that all 10 cells in a row are non-zero.
If ANY cell is 0 (empty), `every` short-circuits and returns `false` —
the row is not full. This is more readable than a `for` loop with a
`return false` inside and a `return true` at the end.

**Watch for:** `[].every(condition)` returns `true` — vacuous truth.
An empty array trivially satisfies "every element passes" because there are
no elements to fail. In our case, rows always have 10 elements, so this
edge case does not arise.

---

## Math: Set Comprehension — `Array.filter()`

**What it computes:** Returns a NEW array containing only elements that pass
a given test. The original array is not changed.

**The mathematical notation:**

```
{ row ∈ cells : row is NOT full }
"The set of all rows in cells such that the row is not full."
= all rows that need to stay (non-full rows)
```

**The real-world analogy:** Sorting recyclables from trash. You examine each
item — if it is recyclable, keep it in one bin. If not, throw it away. The
result is a new bin with only the keepers. The original pile is unchanged.

**Canonical example:**

```ts
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filter returns all even numbers in a new array:
const evens = numbers.filter(n => n % 2 === 0);  // [2, 4, 6, 8, 10]
console.log(numbers);  // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] — unchanged

// For board rows — keep only non-full rows:
const remainingRows = cells.filter(row => !isRowFull(row));
```

**Project Application (The "Why" here):**

After `filter`, the remaining rows are the rows that were NOT full.
Full rows are absent from the result. The number of absent rows tells us
how many empty rows to prepend at the top. This is more concise and
correct than a `for` loop that copies rows one-by-one.

**Watch for:** `filter` returns a new array — it does NOT modify `this.cells`
in place. You must assign the result back: `this.cells = this.cells.filter(...)`.

---

## Step 1 — Add `isRowFull` and `clearLines` to the Board Class

Open `src/board.ts`. Inside the `Board` class, add these two methods after `lock()`:

```ts
// isRowFull: returns true if every cell in the given row is non-zero.
// 'rowData' is a CellValue[] — we check it directly rather than passing a row index,
// so this method can be used with 'filter' without capturing 'this'.
private isRowFull(rowData: CellValue[]): boolean {  // ← add this method
  return rowData.every((cell) => cell !== 0);
  // every() returns true if ALL cells satisfy 'cell !== 0'
  // i.e., true if ALL cells are filled (non-empty)
}

// clearLines: removes full rows and prepends empty rows at the top.
// Returns the number of rows cleared — used by the scoring system in LAB-09.
public clearLines(): number {   // ← add this method
  const rowsBefore = this.cells.length;          // always BOARD_ROWS (20)

  // Keep only non-full rows — full rows are removed by filter:
  this.cells = this.cells.filter((row) => !this.isRowFull(row));
  //                                       ↑ negate: keep rows that are NOT full

  const linesCleared = rowsBefore - this.cells.length;
  // Number of rows removed = rows before minus rows after.
  // If 2 rows were full, this.cells.length is now 18, linesCleared = 2.

  // Prepend 'linesCleared' empty rows at the top to restore height to BOARD_ROWS:
  for (let i = 0; i < linesCleared; i++) {
    this.cells.unshift(new Array(this.cols).fill(0) as CellValue[]);
    // unshift adds an element to the BEGINNING of the array (opposite of push).
    // This inserts an empty row at the top, pushing everything down.
  }

  return linesCleared;  // caller (scoring system) needs to know how many cleared
}
```

### SAVE AND TRY

Save `src/board.ts`. No visual change yet — `clearLines` exists but is not
called from the game loop.

**Test in DevTools Console:**

Manually fill a row and test:

```js
// Set all cells in row 19 (bottom row) to color 1 (cyan):
for (let col = 0; col < 10; col++) {
  state.board.lock({ getCells: () => [[1]], position: { x: col, y: 19 }, getColorIndex: () => 1 });
}
// Simpler — directly test with a known full row via the console
state.board.clearLines()
// Expected: returns 0 (no rows fully manually filled this way in console easily)
```

A cleaner console test: fill row 19 manually, then call `clearLines`:

```js
// In the console, after a row has been naturally filled by the game:
state.board.clearLines()   // Expected: 1 (if one row is full)
drawBackground(); drawBoard(state.board); drawPiece(state.activePiece);
```

---

## Step 2 — Call `clearLines` in the Game Loop

Open `src/main.ts`. In the `update()` function, update the lock block:

```ts
    if (canMoveDown) {
      state.activePiece.position = belowPosition;
    } else {
      // Lock the piece into the board:
      state.board.lock(state.activePiece);

      // Clear any full lines immediately after locking:
      const linesCleared = state.board.clearLines();  // ← add this line
      // linesCleared is returned for scoring (used in LAB-09).
      // For now, we just log it:
      if (linesCleared > 0) {
        console.log(`Cleared ${linesCleared} line(s)`);  // ← temporary — removed in LAB-09
      }

      state.activePiece = spawnPiece();
      state.gravityTimer = 0;
    }
```

### SAVE AND TRY

Save. Play the game — let pieces fall and stack.

**You should see:**
- When a row becomes completely filled, it disappears
- All rows above it shift down by one (or more, if multiple rows cleared)
- Empty rows appear at the top, maintaining the board's 20-row height

**In DevTools Console:**

Watch the Console tab while playing — when a line clears, you see
`Cleared 1 line(s)` (or 2, 3, 4 for multi-line clears).

**Change something:** Temporarily change the `filter` line to
`this.cells.filter(() => true)` (keep ALL rows, including full ones).
Save. Lines no longer clear — the board fills up. Change it back to
`!this.isRowFull(row)`.

---

## DSA: The Algorithm Analysis

**Time complexity of `clearLines()`:**

```
filter: visits every row once — O(BOARD_ROWS) = O(20) = O(1) (constant)
  isRowFull per row: visits every cell — O(BOARD_COLS) = O(10) = O(1)
  Combined: O(BOARD_ROWS × BOARD_COLS) = O(200) = O(1) for fixed board size

unshift: in the worst case (4 lines cleared), called 4 times.
  Each unshift on a JavaScript array is O(n) because all existing elements
  shift forward by one position.
  4 unshifts × 20 rows = O(80 element moves) = O(1) for fixed board size.

Total: O(1) — constant time for a fixed-size Tetris board.
```

**Why it matters:** For a fixed-size board, these constants do not matter.
But if you built a variable-size board (100 rows, 50 columns), the
`unshift` calls would start to dominate. A more efficient approach:
pre-allocate the board array, track an offset, and use modular indexing
to avoid shifting memory. This is a common interview question.

**For now:** The simple `filter` + `unshift` approach is correct, readable,
and fast enough for a 20×10 board.

---

## 🎯 Challenge: Count Lines Cleared Per Type

**You know:** `clearLines()` returns the number of lines cleared (0–4).
Tetris awards different scores for different clear counts (single, double,
triple, Tetris).

**Task:** Add a score accumulator to the game state. In `main.ts`, when
`clearLines()` returns a positive number, compute the score for that clear
using this table:

| Lines cleared | Points |
|---------------|--------|
| 1 | 40 |
| 2 | 100 |
| 3 | 300 |
| 4 | 1200 |

Add `score: number` to the `GameState` interface. Log the running score to
the Console after each clear. (Full HUD display is LAB-09.)

**Hint:**

```ts
const SCORE_TABLE: readonly number[] = [0, 40, 100, 300, 1200];
// Index 0 = 0 lines (no points), index 4 = Tetris (1200 points).
// Use linesCleared as the index.
```

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Add to GameState interface:
interface GameState {
  board: Board;
  activePiece: Piece;
  gravityTimer: number;
  dropInterval: number;
  score: number;         // ← add this
}

// Add to state initialization:
const state: GameState = {
  board: new Board(BOARD_COLS, BOARD_ROWS),
  activePiece: spawnPiece(),
  gravityTimer: 0,
  dropInterval: NORMAL_DROP_INTERVAL,
  score: 0,              // ← add this
};

// Score table — index is number of lines cleared:
const SCORE_TABLE: readonly number[] = [0, 40, 100, 300, 1200];

// In update(), replace the console.log:
const linesCleared = state.board.clearLines();
if (linesCleared > 0) {
  state.score += SCORE_TABLE[linesCleared];   // look up score by clear count
  console.log(`Score: ${state.score}`);
}
```

**Key insight:** `SCORE_TABLE[linesCleared]` uses the clear count as an array
index. This is the **data-driven dispatch** pattern — no `if/else` chain needed.
The table maps input (lines cleared) to output (score) directly. The scoring
formula in LAB-09 will multiply this base score by the level.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Single line clears | Fill one row — it disappears, rows above shift down |
| Multiple line clears | Fill 2+ rows simultaneously — all clear at once |
| Top rows refill with empties | After clearing, the top rows are black (empty) |
| Board height stays at 20 | `state.board.getCells().length` always returns `20` |
| `filter` does not modify original | `isRowFull` uses the passed row array, not `this.cells[index]` |
| Console logs clear count | Watch DevTools Console while playing |

---

## Quick Check Answers

**1. What does `Array.every()` return for an empty array?**

`true` — vacuous truth. The statement "every element satisfies the condition"
is trivially true when there are no elements to violate it. This is standard
mathematical logic: `∀x ∈ ∅ : P(x)` is always `true`. In practice, our rows
always have `BOARD_COLS` (10) elements, so this edge case never occurs in Tetris.
But it is important to know — some algorithms rely on `every` returning `true`
for empty arrays; others are surprised by it.

**2. Does `Array.filter()` modify the original array?**

No — `filter` always returns a **new** array. The original is unchanged.
This is a core property of functional array methods (`map`, `filter`, `reduce`):
they return new values without mutating their inputs. This is why we write
`this.cells = this.cells.filter(...)` — we assign the result back to replace
the original. Without the assignment, the filtered result is discarded and
`this.cells` is unchanged.

**3. (Prediction) If three rows clear simultaneously, how many empty rows appear at the top?**

Three. `linesCleared = 3`. The `for` loop calls `unshift` three times,
adding three empty rows to the beginning of `this.cells`. This preserves
the invariant that `this.cells.length === BOARD_ROWS` (20). The three empty
rows slide in at the top; all remaining rows shift down by three. The cleared
rows are simply absent from the filtered result.

---

*Next: LAB-09 — Scoring and Levels. We add a HUD (canvas text rendering),
implement the full Tetris scoring formula (base score × level), and increase
drop speed with each level. We introduce TypeScript `enum` for named game constants.*
