# Tetris V3 — LAB 03 — The Piece Class

**Prerequisites:** LAB-02 complete. You have a typed board, a color table, and
a working `drawBoard()` function. You understand type aliases and union types.

**What this lab adds:**
- A `Vec2` interface — a 2D vector with x and y (the math of position)
- A `Piece` class with a constructor, private properties, and public methods
- `spawnPiece()` — creates a new T-piece at the top center of the board
- `drawPiece()` — the Piece draws itself using the board's coordinate system
- Result: a visible purple T-piece sitting at the top of the grid

**Time:** 60–75 minutes

---

## What You Will Build

```
Before (LAB-02 end):          After (LAB-03 end):
┌──────────────┐              ┌──────────────┐
│              │              │   ░ ░ ░      │  ← T-piece (purple)
│   empty      │              │     ░        │     at top center
│   grid       │    ──────►  │              │
│              │              │   (board     │
│              │              │    beneath)  │
└──────────────┘              └──────────────┘
```

The T-piece is drawn on top of the board. In later labs it will move, rotate,
and eventually lock into the board array. For now it just sits there — visible
and typed.

---

> **Quick Check — try to answer before reading further:**
>
> 1. A plain JavaScript object `{ x: 3, y: 5 }` could hold a position. Why
>    would a TypeScript `interface` or `class` be better for a position type?
> 2. What is the difference between a class `property` and a class `method`?
> 3. *(Prediction)* If `this.position` is private inside the Piece class,
>    what do you predict happens when outside code tries to read `piece.position`?
>
> *(Answers at the end of this lab)*

---

## Concept: Vectors — Position and Direction as Mathematics

**What it computes:** A **vector** is an ordered pair of numbers `(x, y)` that
can represent either a **point** (a location in space) or a **direction** (a
movement from one point to another).

**The real-world analogy:** Think of a map grid. A point is a specific location:
"the piece is at column 3, row 0." A direction is a relative movement: "move
left = (−1, 0)". Both are represented as `(x, y)` pairs. The math is identical;
only the *interpretation* differs.

**In Tetris we use vectors for two things:**

```
Position vector  — where the piece's top-left corner sits on the board:
  { x: 3, y: 0 }   ← column 3, row 0

Direction vector — how much to move when a key is pressed:
  { x: -1, y: 0 }  ← move one column left
  { x:  0, y: 1 }  ← move one row down
```

**Adding vectors** moves a position by a direction:

```
new_position = position + direction
{ x: 3, y: 0 } + { x: -1, y: 0 } = { x: 2, y: 0 }
```

This is vector addition — the fundamental operation of movement in 2D space.
Linear algebra formalizes this, and you will use it every time you move the
piece.

**Canonical example (General Explanation):**

```
Start at position (3, 0).
Press left arrow: direction = (-1, 0).
New position = (3 + (-1), 0 + 0) = (2, 0).

Start at (2, 0).
Press down: direction = (0, 1).
New position = (2, 0 + 1) = (2, 1).
```

**Project Application (The "Why" here):**

The Piece stores its position as a `Vec2`. When the player presses a key, the
movement handler adds a direction vector to the piece's position vector. In LAB-04
(rotation), the position vector is also used to translate rotated cell coordinates
from piece-local space back to board space. The vector model makes this math
natural — without it, you would need separate x and y variables everywhere.

**Why it matters here:** `Vec2` gives position a type that can be passed to
functions, stored as a class property, and reasoned about as a unit. Treating
x and y as separate `number` variables breaks down when you need to add them
together or pass a position to a function.

**Watch for:** In Tetris, `x` is the column (horizontal) and `y` is the row
(vertical). Canvas also uses `x` for horizontal and `y` for vertical, but
canvas `y` increases **downward** (origin at top-left). So `y: 0` is the top
row and `y: 19` is the bottom. This matches the board array where `board[0]` is
the top row.

---

## Concept: `interface` — Describing the Shape of an Object

**What it is:** A TypeScript keyword that defines the required properties and
their types for an object, without creating any runtime code.

**The problem before:**

In LAB-02 you used `type Board = CellValue[][]`. That works for arrays. For
objects with named properties, `interface` reads more naturally:

```ts
// type alias — works but verbose for objects:
type Vec2 = { x: number; y: number };

// interface — cleaner syntax for objects:
interface Vec2 {
  x: number;
  y: number;
}
```

Both produce identical TypeScript behavior. The difference is style: `interface`
reads like "here is the shape of a Vec2 object" and supports extension with
`extends`. `type` is more flexible (can be a union, primitive, or tuple).
We use `interface` for objects with named properties, and `type` for unions
and primitives.

**Canonical example (General Explanation):**

An interface is a contract — like a job description. The job description says
"must have: name (string), years of experience (number)." Any applicant who has
both qualifies. TypeScript uses the same model: any object that has all the
required properties satisfies the interface.

```ts
interface Employee {
  name: string;
  yearsExperience: number;
}

const alice: Employee = { name: 'Alice', yearsExperience: 5 };   // ✅
const bob: Employee = { name: 'Bob' };                            // ❌ missing yearsExperience
const carol: Employee = { name: 'Carol', yearsExperience: '3' }; // ❌ wrong type
```

**Project Application (The "Why" here):**

`Vec2` describes what a position or direction object must have: an `x` and a
`y`, both numbers. The Piece class stores its position as `Vec2`. When a
movement function receives a direction, TypeScript checks that the argument
actually has `x` and `y` — preventing "forgot to include y" bugs.

**Smallest possible example:**

```ts
interface Vec2 {
  x: number;
  y: number;
}

const piecePos: Vec2 = { x: 3, y: 0 };    // ✅
const moveLeft: Vec2 = { x: -1, y: 0 };   // ✅
const bad: Vec2 = { x: 5 };               // ❌ missing y
```

**Watch for:** An interface defines the *minimum* required properties. Extra
properties are allowed at the point of creation, but TypeScript uses **structural
typing** — if an object has all required fields, it satisfies the interface,
regardless of what else it has.

---

## Concept: Classes — Bundling Data and Behavior

**What it is:** A `class` is a blueprint for creating objects that bundle related
data (properties) and behavior (methods) together, with TypeScript enforcing
who can access which parts.

**The problem before:**

In V2, you had a plain piece object:

```js
const piece = {
  shapeIndex: 5,
  rotation: 0,
  position: { x: 3, y: 0 }
};
```

And separate functions to work with it:

```js
function drawPiece(piece) { ... }
function rotatePiece(piece) { ... }
function movePiece(piece, dx, dy) { ... }
```

Nothing enforces that `drawPiece` receives the right kind of object. Nothing
stops `movePiece` from setting `piece.shapeIndex = -1`. The data and the
functions that operate on it are disconnected.

**The solution:**

A class puts the data (properties) and the functions (methods) in one place.
The class controls who can access what:

```ts
class Piece {
  private shapeIndex: number;    // only code INSIDE Piece can read or write this
  public position: Vec2;         // any code can read this

  constructor(shapeIndex: number) {   // runs when you write: new Piece(5)
    this.shapeIndex = shapeIndex;     // 'this' refers to the new object being created
    this.position = { x: 3, y: 0 };
  }

  public draw(): void {          // any code can call piece.draw()
    // uses this.shapeIndex and this.position internally
  }
}

const piece = new Piece(5);
piece.draw();           // ✅ public method
piece.shapeIndex;       // ❌ ERROR: private — TypeScript refuses
```

**Canonical example (General Explanation):**

Think of a bank account. The balance is private — you cannot directly change it.
You interact through public methods: `deposit()`, `withdraw()`, `getBalance()`.
The bank controls the rules for how the balance changes. A class is the same
model: private data, public interface.

```ts
class BankAccount {
  private balance: number = 0;

  public deposit(amount: number): void {
    if (amount > 0) this.balance += amount;  // validated before changing
  }

  public getBalance(): number {
    return this.balance;   // read-only access — you see it but can't change it directly
  }
}
```

**Pattern category:** Creational (the class IS the factory) + Encapsulation
(structural, from OOP)

**Official name:** Encapsulation — one of the four pillars of OOP
(alongside Abstraction, Inheritance, and Polymorphism)

**Tradeoff:** Classes add structure and safety but also ceremony — more lines
to write than a plain object. Worth it when an object has complex rules about
how its data can change.

**You will see this again in:** LAB-07 (Board class), LAB-11 (Queue class).

**Watch for:** `this` inside a class method refers to the specific object
instance the method was called on. If you pass a class method as a callback
(e.g., `setTimeout(this.update, 1000)`), `this` loses its binding and becomes
`undefined`. This is a common JavaScript/TypeScript trap. We avoid it by using
arrow functions for callbacks.

---

## Concept: Access Modifiers — `private` and `public`

**What it is:** Keywords that control which code can read or write a class property
or call a class method.

| Modifier | Who can access |
|----------|----------------|
| `public` | Any code — inside or outside the class |
| `private` | Only code inside this class definition |
| `protected` | Only this class and subclasses (not used in this series) |

**Canonical example:**

```ts
class Piece {
  public colorIndex: number;     // other code can read and write this
  private cells: number[][];     // only Piece's own methods can read this

  public draw(): void { ... }    // callable from anywhere: piece.draw()
  private validate(): boolean { ... }  // only called internally: this.validate()
}
```

**Project Application (The "Why" here):**

`cells` (the shape matrix) is private because outside code should never directly
modify a piece's shape — rotation is the only valid way to change it, and
rotation goes through the `rotate()` method which validates the result. If
`cells` were public, any bug in the game loop could accidentally corrupt the
piece's shape.

**Watch for:** TypeScript's `private` is compile-time only. Compiled JavaScript
has no access control — `piece.cells` is technically accessible at runtime.
TypeScript prevents it at the code level, which is where the bugs enter.

---

## Step 1 — Define `Vec2` and the Piece Shape Data

Create a new file `src/piece.ts`. We are splitting the Piece class into its own
file because it will grow over the next several labs. Keeping it separate makes
each file's responsibility clear.

```ts
// src/piece.ts

// ── Vec2 ───────────────────────────────────────────────────────────────────

// Vec2: a 2D vector — used for piece position and movement directions.
// 'interface' is used here (not 'type') because Vec2 is a named object shape.
export interface Vec2 {   // 'export' makes Vec2 available to main.ts and future files
  x: number;              // column (horizontal) — increases rightward
  y: number;              // row (vertical) — increases downward
}

// ── Piece shape data ───────────────────────────────────────────────────────

// Each piece's shape is a 4×4 grid of 0s and 1s.
// 1 = cell is filled, 0 = cell is empty.
// Stored as a 2D array (matrix): SHAPES[pieceIndex][row][col].
// Rotation states are computed mathematically in LAB-04 — not precomputed here.
//
// Why 4×4? The largest piece (I) needs 4 cells in a row. Using 4×4 for all
// pieces gives a consistent matrix size — same rotation math for every piece.

export const SHAPES: readonly number[][][] = [  // 'export' so main.ts can use it
  // Index 1: I piece (cyan)
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],  // ← the horizontal bar
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  // Index 2: J piece (blue)
  [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // Index 3: L piece (orange)
  [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  // Index 4: O piece (yellow)
  [
    [1, 1],
    [1, 1],  // ← the square — never needs rotation
  ],
  // Index 5: S piece (green)
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  // Index 6: T piece (purple)
  [
    [0, 1, 0],
    [1, 1, 1],  // ← the T shape
    [0, 0, 0],
  ],
  // Index 7: Z piece (red)
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
] as const;
```

### SAVE AND TRY

Save `src/piece.ts`. No visual change — this file is not imported yet.

**In DevTools Console:** You cannot test it yet. In the next step we import it.

---

## Step 2 — Write the Piece Class

Below the `SHAPES` array in `src/piece.ts`, add the Piece class:

```ts
// src/piece.ts (add below SHAPES)

// ── Piece class ────────────────────────────────────────────────────────────

export class Piece {
  // Properties — the data each Piece instance carries.
  // 'private' = only methods inside this class can read or write these.
  // 'readonly' on cells would prevent reassignment, but we need to reassign
  //   it during rotation (LAB-04). It remains private for now.

  private cells: number[][];    // the current shape matrix (copy from SHAPES)
  private colorIndex: number;   // which of the 7 Tetris colors this piece uses

  // 'public' = outside code can read this to know where the piece is.
  // Position is the top-left corner of the 4×4 shape matrix on the board.
  public position: Vec2;

  // Constructor — runs when you write 'new Piece(shapeIndex)'.
  // 'shapeIndex' determines which of the 7 shapes to use (1–7, matching CellValue).
  constructor(shapeIndex: number) {
    // SHAPES is 0-indexed but shapeIndex is 1–7 (0 = empty cell).
    // Subtract 1 to convert: shapeIndex 1 → SHAPES[0], shapeIndex 7 → SHAPES[6].
    const shapeData = SHAPES[shapeIndex - 1];

    // Deep copy the shape matrix — we cannot mutate the shared SHAPES constant.
    // Array.from creates a new outer array; .map creates a new inner array for each row.
    this.cells = Array.from(shapeData, (row) => [...row]);
    //                                  ↑ spread copies each row into a new array
    //                                    (same as [...row] or Array.from(row))

    this.colorIndex = shapeIndex;   // color 1 = I piece cyan, color 6 = T piece purple, etc.

    // Spawn position: horizontally centered, at the top row.
    // Math.floor centers the 4×4 shape: (10 columns - 4 cells wide) / 2 = 3
    // We hardcode the column count here — in a later lab we will import BOARD_COLS.
    this.position = {
      x: Math.floor((10 - this.cells[0].length) / 2),  // center horizontally
      y: 0,                                              // top row
    };
  }

  // getColorIndex: returns the piece's color index for drawing.
  // Getter method — exposes read-only access to a private value.
  public getColorIndex(): number {
    return this.colorIndex;
  }

  // getCells: returns a copy of the current shape matrix.
  // Returns a copy (not the original) so outside code cannot mutate the piece's shape.
  public getCells(): number[][] {
    return Array.from(this.cells, (row) => [...row]);  // deep copy
  }
}
```

### SAVE AND TRY

Save `src/piece.ts`. No visual change yet — the class exists but is not imported.

**Check for TypeScript errors:** Look at your editor's Problems panel (VS Code:
bottom status bar, or View → Problems). Zero errors expected.

---

## Step 3 — Import Piece into main.ts and Spawn the First Piece

Open `src/main.ts`. At the very top, add the import:

```ts
// src/main.ts — top of file

import { Piece, Vec2 } from './piece';  // ← add this at line 1
// 'Piece' is the class we just wrote. 'Vec2' is the interface.
// './piece' means src/piece.ts — Vite resolves the .ts extension automatically.
```

Below the `board` constant, add:

```ts
// ── Active Piece ───────────────────────────────────────────────────────────

// T-piece = shape index 6, color index 6 (purple).
// 'new Piece(6)' calls the constructor with shapeIndex = 6.
const activePiece: Piece = new Piece(6);  // ← add this
```

### SAVE AND TRY

Save. No visual change yet — the piece is in memory but not drawn.

**In DevTools Console:**

```js
activePiece.position
```

**Expected:** `{ x: 3, y: 0 }` — column 3, row 0 (top center for the 3×3 T-piece).

```js
activePiece.getCells()
```

**Expected:** The T-piece matrix — a 3×3 grid with 1s in the T shape.

```js
activePiece.colorIndex
```

**Expected:** This is `private` — the console will show `undefined` or an error.
The TypeScript compiler would have flagged this at write time, but the console
bypasses TypeScript. This demonstrates that `private` is a compile-time guard.

---

## Step 4 — Draw the Piece

Add `drawPiece` to `src/main.ts`, below `drawBoard`:

```ts
// drawPiece: renders the active piece on top of the board.
// It reads the piece's cells and position, then draws each filled cell
// at its board coordinate (piece-local + piece position offset).
function drawPiece(piece: Piece): void {  // ← add this function
  const cells = piece.getCells();         // get a copy of the shape matrix
  const pos = piece.position;             // the top-left corner in board coordinates
  const color = PIECE_COLORS[piece.getColorIndex()];  // look up the color string

  for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
    for (let colIndex = 0; colIndex < cells[rowIndex].length; colIndex++) {

      if (cells[rowIndex][colIndex] === 0) continue;
      // Skip empty cells (0) in the shape matrix — only draw filled cells (1).
      // 'continue' jumps to the next iteration of the inner loop.

      // Convert piece-local coordinates to board coordinates:
      // The piece's top-left corner is at pos.x, pos.y.
      // A cell at (colIndex, rowIndex) in the shape matrix is at
      // (pos.x + colIndex, pos.y + rowIndex) on the board.
      const boardCol = pos.x + colIndex;  // board column for this cell
      const boardRow = pos.y + rowIndex;  // board row for this cell

      drawCell(boardCol, boardRow, color);
    }
  }
}
```

Update the bottom of `main.ts` to call `drawPiece`:

```ts
drawBackground();
drawBoard();
drawPiece(activePiece);   // ← add this line
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** A purple T-piece at the top of the grid. The T-shape has
three cells on the top row (columns 3, 4, 5) and one cell below the center
(column 4, row 1).

**In DevTools Console:**

```js
activePiece.position
```

Try changing the position:

```js
activePiece.position.x = 0;
drawBackground(); drawBoard(); drawPiece(activePiece);
```

**Expected:** The T-piece jumps to column 0, row 0.

```js
activePiece.position.x = 3;
drawBackground(); drawBoard(); drawPiece(activePiece);
```

**Expected:** It moves back to the center.

**Change something:** In `main.ts`, change `new Piece(6)` to `new Piece(1)`
(the I piece). Save. The canvas should show a horizontal cyan bar at the top.
Change back to `new Piece(6)`.

---

## Math: Piece-Local to Board Coordinate Conversion

**What it computes:** Translates a cell coordinate within the piece's 4×4 matrix
(local space) into a coordinate on the 10×20 board (world space).

**The real-world analogy:** A stamp on paper. The stamp has a design on it
(local coordinates). Where on the paper a given part of the stamp lands depends
on where you pressed the stamp (the offset). The piece shape is the stamp; the
position is where you pressed it.

**Formula (vector addition):**

```
board_col = piece_position.x + cell_col_in_shape
board_row = piece_position.y + cell_row_in_shape
```

**Concrete example for the T-piece at position (3, 0):**

```
Shape matrix (T):      Board positions after offset:
row 0: [0, 1, 0]       row 0: skip, (3+1=4, 0), skip
row 1: [1, 1, 1]       row 1: (3, 1), (4, 1), (5, 1)
row 2: [0, 0, 0]       row 2: all skip

Filled board cells: (4,0), (3,1), (4,1), (5,1) — the T shape
```

**Why it matters here:** This same formula appears in LAB-05 (collision
detection checks each cell against the board), LAB-04 (rotation validates
the rotated cells fit on the board), and every other operation that needs to
know where a piece's cells actually are.

**Watch for:** The piece matrix is indexed `[row][col]` but the board draw
call takes `(col, row)`. The inner loop variable names `rowIndex` and `colIndex`
make the ordering explicit. Swapping them produces a transposed piece drawing.

---

## 🎯 Challenge: Draw a Piece at an Arbitrary Position

**You know:** The `Vec2` interface, `drawCell`, and the piece-local to board
coordinate formula.

**Task:** Write a standalone function (outside the Piece class) that draws
any shape matrix at any board position — without using `activePiece` directly.
Call it `drawShape` with this signature:

```ts
function drawShape(
  cells: number[][],
  position: Vec2,
  color: string
): void { ... }
```

Then draw the L-piece (index 3) at position `{ x: 6, y: 10 }` using `drawShape`
alongside the existing T-piece at the top.

**Starting code (current drawPiece):**

```ts
function drawPiece(piece: Piece): void {
  const cells = piece.getCells();
  const pos = piece.position;
  const color = PIECE_COLORS[piece.getColorIndex()];
  // ... loop and drawCell ...
}
```

**Hint:** `drawShape` is almost identical to `drawPiece`, but takes raw data
instead of a Piece object. The Piece class would call `drawShape` internally.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// A reusable drawing function — takes raw data, not a Piece instance.
// This is the separation of concerns: the Piece class manages state,
// this function handles the visual output.
function drawShape(cells: number[][], position: Vec2, color: string): void {
  for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
    for (let colIndex = 0; colIndex < cells[rowIndex].length; colIndex++) {
      if (cells[rowIndex][colIndex] === 0) continue;
      drawCell(position.x + colIndex, position.y + rowIndex, color);
    }
  }
}

// To draw the L-piece at (6, 10):
const lPieceShapeIndex = 3;
const lShape = SHAPES[lPieceShapeIndex - 1] as number[][];  // 0-indexed: shape 3 = index 2
drawShape(lShape, { x: 6, y: 10 }, PIECE_COLORS[lPieceShapeIndex]);

// The Piece class's drawPiece can now delegate to drawShape:
function drawPiece(piece: Piece): void {
  drawShape(piece.getCells(), piece.position, PIECE_COLORS[piece.getColorIndex()]);
}
```

**Key insight:** Separating `drawShape` (raw data → pixels) from the Piece class
(state management) is the **Data vs Behavior Separation** principle. The Piece
class knows WHAT the piece is; `drawShape` knows HOW to draw it. When we add
a ghost piece in LAB-11, we can reuse `drawShape` with a different color — no
Piece class changes needed.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `Vec2` interface imported correctly | No errors in editor; Console: `activePiece.position` shows `{ x: 3, y: 0 }` |
| T-piece visible at top center | Canvas: purple T at columns 3–5, rows 0–1 |
| Piece cells are a deep copy | Console: modify `activePiece.getCells()[0][0] = 99`, then call `getCells()` again — should still show original shape |
| `colorIndex` is private | Console: `activePiece.colorIndex` → `undefined` (bypasses TypeScript at runtime, but editor shows error at write time) |
| Different pieces spawn correctly | Change `new Piece(6)` to `new Piece(1)` → cyan I-bar; `new Piece(4)` → yellow square |
| Coordinate math is correct | T-piece at (3, 0): cells at board cols 3, 4, 5 (row 0) and col 4 (row 1) — verify by counting grid squares |

---

## Quick Check Answers

**1. Why is a `Vec2` interface better than separate x and y variables?**

Separate variables (`let pieceX = 3; let pieceY = 0`) cannot be passed as a
unit to a function, stored as a single property, or typed together. Every
function that needs a position must take two parameters instead of one. With
`Vec2`, a position is a single value: `piece.position = { x: 3, y: 0 }`. You
pass one argument, store one property, and add one value to another with simple
arithmetic: `{ x: pos.x + dir.x, y: pos.y + dir.y }`. The math becomes visible
in the code.

**2. What is the difference between a class property and a class method?**

A **property** stores data — it is a value the object holds. `this.position`,
`this.colorIndex`, `this.cells` are all properties. A **method** is a function
that belongs to the class — it is behavior the object can perform. `draw()`,
`getCells()`, `rotate()` are methods. Properties answer "what is this object?"
— methods answer "what can this object do?" The `this` keyword inside a method
refers to the specific instance the method was called on.

**3. (Prediction) What happens if outside code tries to read a `private` property?**

TypeScript's compiler refuses — it shows a red error: "Property 'cells' is
private and only accessible within class 'Piece'." The code will not compile.
However, if you bypass TypeScript (e.g., via the browser DevTools console or
a JavaScript cast), the property IS accessible at runtime — TypeScript is a
compile-time tool. The protection is real for developers writing TypeScript, but
not a runtime lock.

---

*Next: LAB-04 — Rotation Matrices. The math of 90° clockwise rotation: why
transposing a matrix and reversing its rows produces a rotation. We add a
`rotate()` method to the Piece class using the actual linear algebra, not a
lookup table.*
