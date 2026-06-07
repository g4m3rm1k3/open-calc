# Tetris V3 — LAB 02 — The Board Matrix

**Prerequisites:** LAB-01 complete. You have a Vite + TypeScript project with a
black canvas on screen. You know type annotations (`: number`, `: string`) and
the non-null assertion `!`.

**What this lab adds:**
- A `CellValue` type alias — TypeScript enforces what can go in a board cell
- A `Board` type — a 2D array where each cell is a `CellValue`
- A `createBoard()` function that builds the empty 2D array correctly
- The visible 10×20 grid with 1px gaps rendered on the canvas

**Time:** 45–60 minutes

---

## What You Will Build

```
Before (LAB-01 end):          After (LAB-02 end):
┌──────────────┐              ┌──────────────┐
│              │              │ ▓▓▓▓▓▓▓▓▓▓▓ │
│   solid      │              │ ▓  ▓  ▓  ▓  │  ← grid lines (1px gaps)
│   black      │    ──────►  │ ▓  ▓  ▓  ▓  │
│   canvas     │              │ ▓  ▓  ▓  ▓  │
│              │              │ ▓▓▓▓▓▓▓▓▓▓▓ │
└──────────────┘              └──────────────┘
```

Ten columns, twenty rows. Each visible "gap" between cells is actually the dark
background of the canvas showing through — the cells are drawn 1px smaller than
the grid size, creating the illusion of a grid.

---

> **Quick Check — try to answer before reading further:**
>
> 1. In V2, the board was `createBoard()` returning `Array.from({length: 20},
>    () => new Array(10).fill(0))`. Why did we use `Array.from` with a callback
>    instead of just `.fill([])`?
> 2. If `CellValue` is defined as `type CellValue = 0 | 1`, what happens when
>    you try to write `board[0][0] = 2` in TypeScript?
> 3. *(Prediction)* Each cell is drawn as `CELL_SIZE - 1` pixels wide. What
>    do you predict happens if you draw it exactly `CELL_SIZE` pixels wide instead?
>
> *(Answers at the end of this lab)*

---

## Concept: Matrices — 2D Data as a Grid

**What it computes:** A matrix is a rectangular grid of values arranged in rows
and columns — a 2D array where position has mathematical meaning.

**The real-world analogy:** A spreadsheet. Row 3, Column 5 is one specific cell.
Every cell has a row-first address: `[row][column]`. The Tetris board is a
20-row × 10-column matrix. A locked piece occupies specific cells; an empty
cell is 0; a filled cell holds a color index.

**Canonical example (General Explanation):**

```
A 3×4 matrix (3 rows, 4 columns):

         col 0  col 1  col 2  col 3
row 0  [  0,     0,     1,     0  ]
row 1  [  0,     1,     1,     0  ]
row 2  [  0,     0,     1,     0  ]

Access: matrix[row][col]
matrix[0][2] = 1   ← row 0, col 2 is filled
matrix[1][1] = 1   ← row 1, col 1 is filled
```

**Project Application (The "Why" here):**

The Tetris board is a `20 × 10` matrix. Row 0 is the top, row 19 is the floor.
`board[row][col] === 0` means the cell is empty. `board[row][col] !== 0` means
a piece has locked there. The value stored is a **color index** — which of the
7 Tetris colors fills that cell.

**Why row-first matters:** When we check if a row is full, we scan across all
columns in ONE row: `board[row].every(cell => cell !== 0)`. If we stored
column-first (`board[col][row]`), that operation would require iterating every
column separately. Row-first matches how we read Tetris — line by line from top
to bottom.

**Watch for:** The two indices look symmetrical but mean very different things.
`board[col][row]` is a common mistake — it silently works but produces a
transposed board (columns become rows). Always name your loop variables
`rowIndex` and `colIndex` to make the order obvious.

---

## Concept: `type` Alias — Giving a Name to a Type

**What it is:** A keyword that creates a named shorthand for any TypeScript type
expression, so you can use the name instead of repeating the full type everywhere.

**The problem before:**

Without a type alias, you would write the board type inline every time:

```ts
function createBoard(): (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[][] { ... }
function clearLines(board: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[][]): void { ... }
function lockPiece(board: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[][]): void { ... }
```

This is repetitive and easy to get wrong. If the board's cell type ever changes,
you update it in one place instead of every function signature.

**The solution:**

```ts
type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Board = CellValue[][];

function createBoard(): Board { ... }
function clearLines(board: Board): void { ... }
function lockPiece(board: Board): void { ... }
```

**Canonical example (General Explanation):**

A type alias is like naming a file path. Instead of typing out
`/home/user/documents/projects/tetris/src/board.ts` every time, you create a
shorthand. The name replaces the full expression — TypeScript expands it
automatically wherever the name is used.

```ts
// Without alias — repeated and fragile:
let x: number | string | null = 5;
let y: number | string | null = "hello";

// With alias — one definition, used everywhere:
type MaybeNumber = number | string | null;
let x: MaybeNumber = 5;
let y: MaybeNumber = "hello";
```

**Project Application (The "Why" here):**

`CellValue` is `0 | 1 | 2 | 3 | 4 | 5 | 6 | 7`. Zero means empty. Values 1–7
are the seven Tetris piece colors. TypeScript will refuse `board[0][0] = 8`
because `8` is not a valid `CellValue`. This catches off-by-one errors in color
indexing before they cause visual glitches.

**Watch for:** `type` aliases are not classes — they have no runtime existence.
At runtime, `CellValue` is just a number. The alias only exists during
TypeScript's compile-time check. You cannot write `instanceof CellValue` — it
does not exist at runtime.

---

## Concept: Union Types — `A | B | C`

**What it is:** A type that allows a value to be any one of several specific
options — not just any number, but specifically `0`, `1`, `2`, up to `7`.

**Canonical example (General Explanation):**

A traffic light signal has three possible values: red, yellow, green. It cannot
be blue — that would be a bug. A union type enforces this contract:

```ts
type TrafficLight = 'red' | 'yellow' | 'green';
let signal: TrafficLight = 'red';      // ✅
signal = 'purple';                     // ❌ ERROR: not assignable to 'TrafficLight'
```

For numbers, the same principle applies:

```ts
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 3;    // ✅
roll = 7;                  // ❌ ERROR: Type '7' is not assignable to type 'DiceRoll'
```

**Project Application (The "Why" here):**

`CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7` means the board can only hold
color indices 0 through 7. If you accidentally write `board[row][col] = pieces.length`
and `pieces.length` is `8`, TypeScript will catch it. Color index `8` would
crash the color lookup table silently in JavaScript — TypeScript stops it from
entering the board.

**Watch for:** Union types of number literals use numeric literals, not `number`.
`type CellValue = number` would accept any number — that defeats the purpose.
`type CellValue = 0 | 1 | 2 | 3` restricts to exactly those four values.

---

## Concept: The Shared Reference Trap in Array Creation

**What it is:** A subtle bug where `.fill([])` creates one inner array and
makes every outer array slot point to the same one — not separate arrays.

**The problem before:**

```ts
// WRONG — looks correct, silently broken:
const board = new Array(20).fill(new Array(10).fill(0));
//                                ↑ ONE array object, referenced 20 times

board[0][0] = 5;    // set top-left cell
console.log(board[1][0]);   // expects 0, gets 5 — all rows are the SAME array
```

**Why this happens:** `new Array(20).fill(x)` fills every slot with the *same
value of `x`*. For a primitive like `0`, that is fine — primitives are copied.
For an object like `[]` (an array), every slot holds a reference to the **exact
same array object** in memory. Setting one cell writes to the shared array,
affecting all rows.

**The solution:** Use `Array.from` with a factory function. The function is
called once per slot, creating a **new** inner array each time:

```ts
// CORRECT — a fresh inner array for every row:
const board = Array.from({ length: 20 }, () => new Array(10).fill(0));
//                                        ↑ () => ... is called 20 times
//                                          returning a NEW array each time
board[0][0] = 5;
console.log(board[1][0]);   // 0 — separate arrays, no shared reference
```

**Canonical example (General Explanation):**

Imagine 20 students all given "a sheet of paper." If you photocopy the same
sheet 20 times, each student has their own copy — `Array.from` with a factory.
If you pass around the same original sheet, whoever writes on it changes
everyone's copy — `.fill([])`.

**Project Application (The "Why" here):**

The Tetris board needs 20 **independent** rows. When row 18 fills up and gets
cleared, only row 18 should change. If all rows shared the same array, clearing
one row would clear all 20 — the game would be unplayable.

**Watch for:** This bug only appears when you write to a cell. Reading
`board[0][0]` will return `0` on a broken shared-reference board — it looks
fine until the first mutation. Always verify with: set one cell, then read a
different row at the same column — it must return `0`.

---

## Step 1 — Define the Types and Create the Board

Open `src/main.ts`. Below the constants from LAB-01, add the type definitions:

```ts
// ── Types ──────────────────────────────────────────────────────────────────
// (Add these lines right after the BOARD_ROWS constant)

// CellValue: what each board cell can hold.
// 0 = empty. 1–7 = the seven Tetris piece colors (added in LAB-03).
// TypeScript will reject any value outside 0–7 being stored in the board.
type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;  // ← add this

// Board: a 2D array — 20 rows, each row is 10 CellValues.
// [] means "array of". CellValue[][] means "array of arrays of CellValue".
type Board = CellValue[][];  // ← add this
```

Now add the `createBoard` function below the types:

```ts
// ── Board ──────────────────────────────────────────────────────────────────

// createBoard: creates a fresh 20×10 grid, all cells empty (0).
// Return type 'Board' means TypeScript checks that we actually return a Board.
function createBoard(): Board {  // ← add this function
  return Array.from(
    { length: BOARD_ROWS },     // create BOARD_ROWS slots (20)
    () => new Array(BOARD_COLS).fill(0) as CellValue[]
    //   ↑ factory function — called once per row, returns a fresh array
    //                                    ↑ 'as CellValue[]' — we know fill(0)
    //                                       produces all-zero arrays, which are
    //                                       valid CellValue arrays (0 is in the type)
  );
}

// Create the board and hold it in a variable.
// TypeScript infers the type as 'Board' from the function's return type.
const board: Board = createBoard();  // ← add this
```

### SAVE AND TRY

Save. No visual change yet — the board exists in memory but is not drawn.

**In DevTools Console:**

```js
board[0][0]
```

**Expected:** `0`

```js
board.length
```

**Expected:** `20`

```js
board[0].length
```

**Expected:** `10`

**Test the shared-reference fix.** Type this in the Console:

```js
board[0][0] = 5;    // set top-left cell manually
board[1][0]         // read the same column in the next row
```

**Expected:** `0` — the rows are independent. If you got `5`, you have the
shared-reference bug. Re-read the concept block above.

**Change something:** Temporarily change `BOARD_ROWS` to `5`. Save. Check
`board.length` — it should be `5`. Change it back to `20`.

---

## Concept: The `readonly` Modifier — Immutable After Creation

**What it is:** A TypeScript keyword that prevents a property or variable from
being reassigned after it is first set.

**The problem before:**

```ts
const BOARD_COLS = 10;   // 'const' prevents BOARD_COLS = 20
// But:
const colors = ['red', 'blue'];
colors.push('green');    // 'const' does NOT prevent mutation of array contents
```

`const` only prevents *reassigning* the variable (pointing it at a different
array). It does not prevent *mutating* the array's contents.

**The solution:** `readonly` on arrays and object properties:

```ts
const colors: readonly string[] = ['red', 'blue'];
colors.push('green');    // ❌ ERROR: Property 'push' does not exist on readonly array
colors[0] = 'purple';   // ❌ ERROR: Index signature in type is readonly
```

**Project Application (The "Why" here):**

We will mark the color lookup table (added next) as `readonly` — the 7 piece
colors should never change at runtime. If a future function accidentally tries
to modify the color list, TypeScript stops it.

**Watch for:** `readonly` is a TypeScript-only concept. Compiled JavaScript has
no `readonly` — if you call methods that bypass TypeScript's type checker, the
array can still be mutated. `readonly` is compile-time protection, not a runtime
lock.

---

## Step 2 — Add the Color Table

Add the piece colors below the `board` constant:

```ts
// ── Colors ─────────────────────────────────────────────────────────────────

// PIECE_COLORS: index 0 = empty cell color, indices 1–7 = the 7 piece colors.
// 'as const' tells TypeScript these are exact literal values (not just 'string[]').
// 'readonly' ensures nothing can add, remove, or change entries at runtime.
const PIECE_COLORS: readonly string[] = [  // ← add this
  '#000000',  // 0 = empty (black)
  '#00f0f0',  // 1 = I piece (cyan)
  '#0000f0',  // 2 = J piece (blue)
  '#f0a000',  // 3 = L piece (orange)
  '#f0f000',  // 4 = O piece (yellow)
  '#00f000',  // 5 = S piece (green)
  '#a000f0',  // 6 = T piece (purple)
  '#f00000',  // 7 = Z piece (red)
] as const;
```

### SAVE AND TRY

Save. No visual change — the colors are in memory.

**In DevTools Console:**

```js
PIECE_COLORS[1]
```

**Expected:** `'#00f0f0'` (cyan)

**Test readonly protection.** In the Console, try:

```js
PIECE_COLORS.push('#ffffff')
```

**Expected:** An error — "Cannot add property 8, object is not extensible."
The `as const` + `readonly` prevented the mutation.

---

## Step 3 — Draw a Single Cell

Before drawing the whole board, draw one cell and confirm the position and size
math are correct.

Add `drawCell` below `drawBackground()` in `main.ts`:

```ts
// drawCell: paints one grid cell at (col, row) with the given color.
// col and row are GRID coordinates (0–9 and 0–19), not pixel coordinates.
// We multiply by CELL_SIZE to convert grid position to pixel position.
function drawCell(col: number, row: number, color: string): void {  // ← add this
  ctx.fillStyle = color;
  ctx.fillRect(
    col * CELL_SIZE + 1,   // pixel x: 1px offset creates left gap (grid line)
    row * CELL_SIZE + 1,   // pixel y: 1px offset creates top gap (grid line)
    CELL_SIZE - 1,         // width: 1px narrower than full size creates right gap
    CELL_SIZE - 1          // height: 1px shorter than full size creates bottom gap
  );
  // The 4 gaps (left, top, right, bottom) form the 1px grid lines between cells.
  // The canvas background (#000000) shows through the gaps — no line drawing needed.
}
```

Call it at the bottom of `main.ts` to verify:

```ts
drawBackground();
drawCell(0, 0, '#00f0f0');  // ← add this: draw ONE cyan cell at top-left
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** The black canvas with a single cyan square in the top-left
corner, with a thin dark gap on the left and top edges (the 1px offset).

**In DevTools Console:**

```js
// The cell's pixel position — should be (1, 1) because of the +1 offset:
// col 0 × 30 + 1 = 1
// row 0 × 30 + 1 = 1
```

**Change something:** Change `drawCell(0, 0, ...)` to `drawCell(5, 10, '#f00000')`.
Save. The red square appears at column 5, row 10 — roughly center-board.
Change it back to `drawCell(0, 0, '#00f0f0')`.

---

## Math: Grid-to-Pixel Coordinate Conversion

**What it computes:** Translates a grid position (column, row) into canvas pixel
coordinates that `fillRect` can use.

**The real-world analogy:** A chessboard. The square at column C, row 5 is at a
specific physical location on the board. To find it, you measure from the left
edge: `column × square_size`. To find the row: `row × square_size`. The square
starts at that pixel and extends for `square_size` pixels.

**Formula:**

```
pixel x = col × CELL_SIZE + 1    (the +1 is the left grid gap)
pixel y = row × CELL_SIZE + 1    (the +1 is the top grid gap)
width   = CELL_SIZE - 1           (1px less = right grid gap)
height  = CELL_SIZE - 1           (1px less = bottom grid gap)
```

**Concrete example for cell (col=2, row=3) with CELL_SIZE=30:**

```
pixel x = 2 × 30 + 1 = 61
pixel y = 3 × 30 + 1 = 91
width   = 30 - 1     = 29
height  = 30 - 1     = 29

So fillRect(61, 91, 29, 29) draws the cell.
The 1px gap at x=60 (column boundary) and y=90 (row boundary) shows through as grid line.
```

**Why it matters here:** Every draw operation in this game — cells, pieces,
ghost pieces — uses this same conversion. The CELL_SIZE constant is the single
control point for the entire grid scale.

**Watch for:** Forgetting the `+1` offset on x and y draws cells edge-to-edge
with no gaps. Forgetting the `-1` on width and height overlaps cells, hiding
the gaps. Both visually look "almost right" — test by drawing adjacent cells.

---

## Step 4 — Draw the Full Board

Remove the single-cell test line and replace it with a `drawBoard` function:

```ts
// Remove this line:
drawCell(0, 0, '#00f0f0');  // ← delete this

// Add this function above the drawBackground() call:
function drawBoard(): void {  // ← add this function
  for (let rowIndex = 0; rowIndex < BOARD_ROWS; rowIndex++) {
    // rowIndex: which row we are currently drawing (0 = top, 19 = bottom)
    for (let colIndex = 0; colIndex < BOARD_COLS; colIndex++) {
      // colIndex: which column within this row (0 = left, 9 = right)

      const cellValue = board[rowIndex][colIndex];
      // cellValue is a CellValue (0–7) — TypeScript knows this from the Board type

      const color = PIECE_COLORS[cellValue];
      // Look up the color string for this cell's value.
      // cellValue 0 → PIECE_COLORS[0] → '#000000' (empty/black)

      drawCell(colIndex, rowIndex, color);
      // Note: drawCell takes (col, row) — column FIRST, row SECOND.
      // This matches how canvas works: x (horizontal) before y (vertical).
      // But the board array is indexed [row][col] — row FIRST.
      // These two orderings are the opposite of each other — be careful here.
    }
  }
}
```

Now update the bottom of `main.ts` to call `drawBoard` instead:

```ts
drawBackground();
drawBoard();   // ← was: drawCell(0, 0, '#00f0f0')
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** The full 10×20 grid drawn on the canvas. Every cell is
black (color index 0 = empty), with thin dark gaps forming the grid lines.

**In DevTools Console:**

```js
// Set one cell to a non-zero value and call drawBoard manually to see it:
board[5][3] = 1;
drawBoard();
```

**Expected:** A cyan cell appears at row 5, column 3. The rest of the board is black.

**Change something:** Temporarily change `CELL_SIZE` to `20`. Save. The grid
becomes smaller (fits 200px tall), showing 20 rows but shorter. The math still
works because CELL_SIZE drives both drawCell and createBoard's dimensions.
Change it back to `30`.

---

## 🎯 Challenge: Test the Board Type Guard

**You know:** `CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7` means TypeScript
rejects values outside that range at compile time.

**Task:** Open `src/main.ts` in your editor. Try to write these lines and
observe what TypeScript says (you do NOT need to save or run — just observe
the editor's feedback):

```ts
board[0][0] = 8;       // attempt 1: one above the max
board[0][0] = -1;      // attempt 2: negative number
board[0][0] = 1.5;     // attempt 3: a decimal
board[0][0] = 0;       // attempt 4: valid
```

Then write a function `fillRow(rowIndex: number, value: CellValue): void`
that sets every cell in a given row to `value`. Call it with a valid value to
verify it works, then try calling it with `8` — TypeScript should refuse.

**Hints:**

1. The function signature is `function fillRow(rowIndex: number, value: CellValue): void`
2. Loop through `board[rowIndex]` and assign `value` to each index.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function fillRow(rowIndex: number, value: CellValue): void {
  for (let colIndex = 0; colIndex < BOARD_COLS; colIndex++) {
    board[rowIndex][colIndex] = value;  // TypeScript checks: is value a CellValue?
  }
}

// Valid call — CellValue 1 is allowed:
fillRow(19, 1);    // fills the bottom row with cyan
drawBackground();
drawBoard();       // call these to see the result

// TypeScript error — 8 is not in 0|1|2|3|4|5|6|7:
fillRow(18, 8);    // ❌ TypeScript: Argument of type '8' is not assignable to 'CellValue'
```

**Key insight:** The `value: CellValue` parameter annotation means TypeScript
checks every *call site* — not just the function body. Any code that calls
`fillRow(row, 8)` is rejected at the call, before the function even runs.
This is the value of typed parameters: bugs are caught at the point of incorrect
use, not buried inside functions.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Board is 20 × 10 | Console: `board.length` → `20`, `board[0].length` → `10` |
| Rows are independent | Console: set `board[0][0] = 5`, check `board[1][0]` → must be `0` |
| Grid lines are visible | Canvas shows thin dark gaps between every cell |
| Color lookup works | Console: `board[5][5] = 3; drawBoard()` → orange cell at row 5, col 5 |
| `CellValue` type enforced | Editor shows error on `board[0][0] = 8` |
| `PIECE_COLORS` is readonly | Console: `PIECE_COLORS.push('x')` → error |
| Coordinate math correct | Cell at col 2, row 3 starts at pixel (61, 91) — verify with `drawCell(2, 3, '#f00000')` and inspect with DevTools |

---

## Quick Check Answers

**1. Why use `Array.from` with a callback instead of `.fill([])`?**

`.fill([])` creates **one** inner array and places a reference to it in every
outer slot. All 20 "rows" point to the same array object. Setting `board[0][0]`
changes `board[1][0]`, `board[2][0]`, and every other row — because they are all
the same array. `Array.from({ length: 20 }, () => new Array(10).fill(0))` calls
the factory function `() => new Array(10).fill(0)` twenty times, creating 20
**separate** arrays. Each row is independent.

**2. What happens if you write `board[0][0] = 2` when `CellValue = 0 | 1`?**

TypeScript refuses to compile. The error reads: `Type '2' is not assignable to
type '0 | 1'`. The code never runs in the browser — the compile step rejects it.
This is the purpose of the union type: it restricts the domain of valid values
at write time, not at runtime.

**3. (Prediction) What if `drawCell` used `CELL_SIZE` instead of `CELL_SIZE - 1` for width and height?**

Adjacent cells would draw edge-to-edge with no gaps between them. The canvas
background would not show through — you would see a solid filled rectangle
with no grid lines. All cells would be visible, but the board would look like
one big block of color rather than a grid. The 1px gap (achieved by drawing
`CELL_SIZE - 1` wide) is purely visual — it lets the black background act as
a grid line without needing to draw lines separately.

---

*Next: LAB-03 — The Piece Class. We define a TypeScript `class` with a
constructor, properties, and methods. The Piece class carries its own shape,
position, and color — and knows how to draw itself.*
