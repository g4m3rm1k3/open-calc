# Tetris V3 — LAB 04 — Rotation Matrices

**Prerequisites:** LAB-03 complete. You have a `Piece` class with `cells`,
`position`, and `getColorIndex()`. The T-piece is visible at the top of the
board.

**What this lab adds:**
- The mathematical explanation of why 90° rotation = transpose + row reversal
- A `rotateMatrix()` pure function that applies the rotation
- A `rotate()` method on the Piece class
- Keyboard input: the Up arrow rotates the piece through all 4 states

**Time:** 60–90 minutes (the math section is substantial — work through it slowly)

---

## What You Will Build

```
Press Up arrow — piece rotates 90° clockwise through 4 states:

State 0        State 1        State 2        State 3
(spawn)        (1× CW)        (2× CW)        (3× CW)

 ░ ░ ░          ░              ░ ░ ░              ░
   ░          ░ ░                ░              ░ ░
             ░                                   ░
```

Four presses of Up returns the piece to its original orientation. Every rotation
state is computed from the previous one using the same mathematical operation —
no lookup table, no precomputed list.

---

> **Quick Check — try to answer before reading further:**
>
> 1. In linear algebra, what is a "transpose" of a matrix?
> 2. If you rotate a 3×3 matrix 90° clockwise four times, where do you end up?
> 3. *(Prediction)* A 4×4 matrix rotated 90° clockwise — does the matrix size
>    change? Why or why not?
>
> *(Answers at the end of this lab)*

---

## Math: The 2D Rotation Matrix

**What it computes:** A 2D rotation matrix transforms a point `(x, y)` by
rotating it θ degrees around the origin `(0, 0)`.

**The real-world analogy:** Imagine a clock hand. At 12 o'clock, the tip of
the hand is at position `(0, 1)` (straight up). After rotating 90° clockwise,
the tip is at `(1, 0)` (pointing right). The rotation matrix is the formula
that computes this new position for any starting position.

**The 2D rotation matrix for angle θ:**

```
R(θ) = [ cos θ   -sin θ ]
       [ sin θ    cos θ ]

For a point (x, y), the rotated point (x', y') is:
  x' = x·cos θ  -  y·sin θ
  y' = x·sin θ  +  y·cos θ
```

**For 90° clockwise (θ = -90°, because clockwise is negative in standard math):**

```
cos(-90°) = 0
sin(-90°) = -1

R(-90°) = [ 0    1 ]
          [ -1   0 ]

x' = x·0  -  y·1   =  -y
y' = x·(-1) + y·0  =  -x
Wait — that's counter-clockwise. Let me use the standard convention:

For 90° CW in screen coordinates (y-axis points DOWN):
  x' =  y
  y' = -x   ... but negative y is off-screen. In a grid, we use the
                transpose+reverse trick instead. Here is why:
```

**Why the transpose + reverse trick works:**

The rotation formula above works perfectly for continuous coordinates. But
Tetris pieces are grids — we need to rotate a **matrix of cells**, not individual
points. The trick exploits a property of 90° rotation:

**Step 1 — What does 90° CW rotation do to a point in a grid?**

Consider a 3×3 grid. In a 3×3 matrix, a cell at `(row, col)` rotates 90° CW to
position `(col, 2 - row)` in the new matrix (where `2` = size - 1).

Let us trace three points:

```
Original 3×3 grid (row, col):
  Top-left  (0, 0)  →  After 90° CW  →  (0, 2)  = top-right
  Top-right (0, 2)  →  After 90° CW  →  (2, 2)  = bottom-right
  Bot-left  (2, 0)  →  After 90° CW  →  (0, 0)  = top-left

Formula: (row, col) → (col, size-1-row)
```

**Step 2 — The transpose + reverse equivalence:**

The transpose of a matrix swaps rows and columns: `matrix[row][col]` becomes
`matrix[col][row]`. Then reversing each row mirrors it horizontally.

```
Original:       Transpose:      Reverse rows:
0 1 0           0 1 0           0 1 0
1 1 1    →      1 1 0    →      0 1 1    = 90° CW rotation!
0 0 0           0 1 0           0 1 0

Wait — let me use a clearer example:

Original (T):    Transpose:      Reverse each row:
A B C            A D G           G D A
D E F    →      B E H    →      H E B   = 90° CW rotation
G H I            C F I           I F C
```

**Proof that transpose + reverse = 90° CW:**

The transpose moves `matrix[row][col]` → `matrix[col][row]`.
Then reversing row `r` moves `matrix[r][col]` → `matrix[r][size-1-col]`.

Combined: `matrix[row][col]` → `matrix[col][size-1-row]`

That is exactly the 90° CW formula: `(row, col) → (col, size-1-row)`. The two
operations together implement the rotation matrix without using `Math.sin` or
`Math.cos` — because 90° is a special case where sin and cos are exactly 0 and 1.

**Canonical example — Full walkthrough:**

```
Starting T-piece shape (index: row, col = 0-based):

      col:  0  1  2
row 0:      0  1  0
row 1:      1  1  1
row 2:      0  0  0

Step 1: Transpose (swap row and col indices — read the matrix diagonally):
Read original[0][0]=0, original[1][0]=1, original[2][0]=0 → new row 0: [0, 1, 0]
Read original[0][1]=1, original[1][1]=1, original[2][1]=0 → new row 1: [1, 1, 0]
Read original[0][2]=0, original[1][2]=1, original[2][2]=0 → new row 2: [0, 1, 0]

After transpose:
      col:  0  1  2
row 0:      0  1  0
row 1:      1  1  0
row 2:      0  1  0

Step 2: Reverse each row (flip horizontally):
row 0: [0, 1, 0] → reversed → [0, 1, 0]   (palindrome — same both ways)
row 1: [1, 1, 0] → reversed → [0, 1, 1]
row 2: [0, 1, 0] → reversed → [0, 1, 0]

Final result (T rotated 90° CW):
      col:  0  1  2
row 0:      0  1  0
row 1:      0  1  1
row 2:      0  1  0

Visual check:
  ░            (T stem going right)
  ░ ░
  ░
Correct! The T is now pointing right, which is 90° CW from pointing up.
```

**Why it matters here:** Instead of storing 4 rotation states for each of the
7 pieces (28 arrays), we store 1 state and rotate it on demand. The same
`rotateMatrix` function works for every piece — the math is universal.

**Watch for:** Transpose is defined on square matrices (N×N). The T, J, L, S, Z
pieces use 3×3 matrices; the I piece traditionally uses 4×4; the O piece uses
2×2. Because each is square, the transpose is always valid. If you tried to
rotate a non-square matrix, the row/column counts would change — that requires
a different formula.

---

## Step 1 — Write `rotateMatrix` as a Pure Function

A **pure function** takes input and returns output without modifying any external
state. `rotateMatrix` takes a shape matrix and returns a **new** rotated matrix —
it never modifies the original. This matters because we will call it inside
`rotate()` which needs to validate the result before committing the change.

Open `src/piece.ts`. Add `rotateMatrix` below the `SHAPES` constant, before
the `Piece` class:

```ts
// src/piece.ts (add between SHAPES and the Piece class)

// rotateMatrix: returns a NEW matrix that is the input rotated 90° clockwise.
// Does NOT modify the original — the caller decides whether to keep the result.
//
// Algorithm: transpose (swap rows/cols) then reverse each row.
// Mathematical proof: this is equivalent to applying the 2D rotation matrix
// R(-90°) to each cell position in a grid — see LAB-04 concept block for proof.
export function rotateMatrix(matrix: number[][]): number[][] {  // ← add this
  const rows = matrix.length;          // number of rows in the original
  const cols = matrix[0].length;       // number of columns in the original

  // Step 1: Transpose — create a new matrix with rows and columns swapped.
  // The transposed matrix has 'cols' rows and 'rows' columns.
  // For square matrices (like our 3×3 and 4×4 shapes), rows === cols.
  const transposed: number[][] = Array.from(
    { length: cols },                         // new matrix has 'cols' rows
    (_, rowIndex) =>
      Array.from({ length: rows }, (_, colIndex) => matrix[colIndex][rowIndex])
      //                                                ↑ read from original: col becomes row
  );

  // Step 2: Reverse each row — flip horizontally.
  // .map returns a new array; .reverse() would mutate in-place, so we spread first.
  return transposed.map((row) => [...row].reverse());
  //                              ↑ spread creates a copy before reversing
}
```

### SAVE AND TRY

Save `src/piece.ts`. No visual change yet. Test the math in DevTools Console.

**First, import and test manually:**

The Console cannot easily access non-exported functions from a module. Instead,
temporarily add a test call to `main.ts`:

In `src/main.ts`, below the imports, add:

```ts
// TEMPORARY TEST — delete after verifying:
import { rotateMatrix } from './piece';  // ← add at the top with other imports
console.log(rotateMatrix([[0,1,0],[1,1,1],[0,0,0]]));  // ← add below board creation
```

Save. Check DevTools Console.

**Expected output:**

```
[
  [0, 1, 0],
  [0, 1, 1],
  [0, 1, 0]
]
```

This is the T-piece rotated 90° clockwise — stem pointing right. If you see a
different result, re-read the transpose step above.

Delete the temporary test lines after verifying. Keep the `rotateMatrix` import
— we will use it next.

---

## Step 2 — Add `rotate()` to the Piece Class

Inside the `Piece` class in `src/piece.ts`, add the `rotate` method:

```ts
// Inside the Piece class, below getCells():

// rotate: rotates the piece 90° clockwise.
// Validates the result before committing — the position parameter is used to
// check if the rotated shape still fits on the board (full validation in LAB-05).
// For now, we rotate unconditionally and add bounds-checking in the next lab.
public rotate(): void {  // ← add this method
  const rotated = rotateMatrix(this.cells);
  // rotateMatrix returns a new matrix — 'this.cells' is not changed yet.
  // We store the result and will replace this.cells only after validation.
  // (Validation is added in LAB-05 — for now we always commit the rotation.)

  this.cells = rotated;
  // Replace the current shape with the rotated one.
  // 'this.cells' is private, so only this method (inside the class) can do this.
}
```

### SAVE AND TRY

Save. No visual change — we have not wired rotation to a key yet.

**In DevTools Console:**

```js
activePiece.getCells()
// Note the current shape (T pointing up)

activePiece.rotate()
activePiece.getCells()
// Should show T pointing right (stem on right side)

activePiece.rotate()
activePiece.getCells()
// Should show T pointing down (stem pointing down)
```

Then redraw:

```js
drawBackground(); drawBoard(); drawPiece(activePiece);
```

**Expected:** The T-piece should now be rotated (pointing down after two rotations).

---

## Step 3 — Add Keyboard Input

Now wire the Up arrow key to call `rotate()`.

Add a keyboard event listener to the bottom of `src/main.ts`:

```ts
// ── Keyboard Input ─────────────────────────────────────────────────────────

// keydown: fires once when a key is pressed down.
// 'event.key' is a string describing which key — 'ArrowUp', 'ArrowLeft', etc.
// 'event.preventDefault()' stops the browser's default behavior (page scrolling).
window.addEventListener('keydown', (event: KeyboardEvent) => {  // ← add this block
  if (event.key === 'ArrowUp') {
    event.preventDefault();   // stop browser from scrolling up

    activePiece.rotate();     // rotate the piece 90° CW
    drawBackground();         // redraw everything to show the new state
    drawBoard();
    drawPiece(activePiece);
  }
});
```

### SAVE AND TRY

Save. Click the browser window (to focus it — keyboard events go to the focused element).

**You should see:** Press Up arrow once — the T-piece rotates 90° clockwise
(stem points right). Press again — 180° (stem points down). Press again — 270°
(stem points left). Press again — 360° (back to original).

**Verify 4th press returns to start:**
1. Note the starting shape
2. Press Up 4 times
3. The shape must be identical to step 1

**Change something:** Open `src/piece.ts`. In `rotateMatrix`, temporarily
comment out the `.reverse()` call (return the transposed matrix only):

```ts
return transposed;  // without reversing
```

Save. Press Up. The piece should rotate counter-clockwise instead of clockwise.
This confirms that the `.reverse()` is what switches the direction. Un-comment it.

---

## 🎯 Challenge: Counter-Clockwise Rotation

**You know:** 90° CW = transpose + reverse each row. Counter-clockwise is the
inverse operation.

**Task:** Derive and implement 90° counter-clockwise (CCW) rotation of a matrix.
Add a `rotateCCW(): void` method to the Piece class. Wire it to the `z` key.

**Hint:**

The inverse of "transpose, then reverse rows" is "reverse rows, then transpose."
Think about it: if A → B → C is the forward path, then C → B → A is the reverse.
Here: original → transpose → reverse = CW. So: original → reverse → transpose = CCW.

Alternatively: 3× CW = 1× CCW. You could call `rotate()` three times.

Try implementing the full reverse-then-transpose approach — it is the true inverse.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In src/piece.ts, add this function alongside rotateMatrix:
export function rotateMatrixCCW(matrix: number[][]): number[][] {
  // CCW = reverse each row first, then transpose.
  // This is the inverse of CW (transpose then reverse).
  const reversed = matrix.map((row) => [...row].reverse());  // reverse each row
  const rows = reversed.length;
  const cols = reversed[0].length;
  return Array.from(
    { length: cols },
    (_, rowIndex) =>
      Array.from({ length: rows }, (_, colIndex) => reversed[colIndex][rowIndex])
  );
}

// In the Piece class, add this method:
public rotateCCW(): void {
  this.cells = rotateMatrixCCW(this.cells);
}

// In main.ts, in the keydown handler:
if (event.key === 'z' || event.key === 'Z') {
  event.preventDefault();
  activePiece.rotateCCW();
  drawBackground(); drawBoard(); drawPiece(activePiece);
}
```

**Key insight:** CW and CCW are not just code — they are mathematical inverses.
`rotateCCW` followed by `rotateCW` returns the matrix to its original state.
This is the same as a rotation matrix `R(θ)` and its inverse `R(-θ)` — they
compose to the identity (no change). In LAB-05 (wall kicks), this matters:
if a CW rotation is blocked, we can reverse it with CCW without needing to
store the previous state.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| T-piece rotates CW on Up arrow | Press Up 4 times — piece returns to original orientation |
| Rotation uses math, not lookup | `rotateMatrix([[0,1,0],[1,1,1],[0,0,0]])` returns T rotated CW |
| I-piece rotates correctly | Change to `new Piece(1)`, press Up — bar switches between horizontal and vertical |
| O-piece rotation is identity | Change to `new Piece(4)`, press Up — yellow square looks the same (2×2 rotation of a filled square = same square) |
| `rotate()` is a method on Piece | `activePiece.rotate()` works in Console; `activePiece.cells` is blocked (private) |

---

## Quick Check Answers

**1. What is the transpose of a matrix?**

The transpose of a matrix swaps rows and columns: `matrix[row][col]` becomes
`matrix[col][row]`. For a 3×3 matrix, the transpose is the mirror image across
the main diagonal (top-left to bottom-right). For example, the element at
`(row=1, col=0)` moves to `(row=0, col=1)`. The first column of the original
becomes the first row of the transposed matrix. The diagonal elements (where
`row === col`) stay in place.

**2. If you rotate a 3×3 matrix 90° CW four times, where do you end up?**

Exactly where you started — the original matrix. Four 90° clockwise rotations
add up to 360°, which is a full circle — the identity transformation. This is
why the Tetris rotation system cycles through exactly 4 states. Mathematically,
the rotation group for 90° rotations has order 4: `R⁰, R¹, R², R³`, and then
`R⁴ = R⁰` (the identity).

**3. (Prediction) Does a 4×4 matrix's size change after 90° CW rotation?**

No — a square matrix (N×N) remains N×N after any rotation. The transpose of
an N×N matrix is also N×N (rows and columns are swapped, but both counts are N).
Reversing each row does not change the matrix dimensions. Non-square matrices
(M×N where M ≠ N) would change dimensions after transposing (M×N → N×M), which
is why we use square matrices for Tetris piece shapes — the rotation is always
dimension-preserving.

---

*Next: LAB-05 — Collision Detection. The `isValidPosition()` predicate method
checks whether a given piece position and rotation fits on the board without
overlapping walls, the floor, or locked cells. Pieces will finally be blocked
by boundaries — and the rotation we just added will be validated before committing.*
