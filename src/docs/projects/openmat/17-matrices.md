# OpenMAT — Lesson 17 — Matrices

## What You Will Build

```
>> A = [1 2; 3 4]
>> B = [5 6; 7 8]
>> C = A * B
>> disp(C)
[19, 22]
[43, 50]
```

And the identity matrix:

```
>> I = eye(2)
>> disp(I * A)
[1, 2]
[3, 4]
```

Multiplying by the identity returns the original matrix — unchanged. This is the
matrix equivalent of multiplying a number by `1`.

---

## What You Need to Know First

Lessons 01–16 complete. `EnvironmentValue` includes `number[]` (vectors). The
`assertNumber` and `assertVector` type guards exist in `evaluator.ts`. The BRD
lexer from lesson 04 produces `SEMICOLON` (`;`) tokens.

---

## Concept: Matrix Multiplication

**What a matrix is:**

A matrix is a rectangular grid of numbers. A 2×3 matrix has 2 rows and 3 columns.
An m×n matrix has m rows and n columns. A vector `[3, 4]` is a 1×2 row vector,
or equivalently a 2×1 column vector.

**The multiplication rule:**

To multiply matrix A (m×n) by matrix B (n×p), the number of columns of A must
equal the number of rows of B. The result is an m×p matrix.

The entry at row i, column j of the result is the dot product of row i of A with
column j of B:

```
C[i][j] = A[i] · B_column_j = sum over k of A[i][k] × B[k][j]
```

For a 2×2 example:

```
A = [1 2]     B = [5 6]
    [3 4]         [7 8]

C[0][0] = row0(A) · col0(B) = 1×5 + 2×7 = 19
C[0][1] = row0(A) · col1(B) = 1×6 + 2×8 = 22
C[1][0] = row1(A) · col0(B) = 3×5 + 4×7 = 43
C[1][1] = row1(A) · col1(B) = 3×6 + 4×8 = 50

C = [19 22]
    [43 50]
```

**Why row-dot-column:**

Matrix multiplication composes linear transformations. A matrix represents a
function that takes a vector and produces another vector. Multiplying two matrices
produces the matrix of the *composed* function — apply B first, then A. In lesson
18, combining a rotation matrix with a scaling matrix produces a single matrix
that does both in one operation.

**Maths — why A×B ≠ B×A:**

"Rotate then translate" is not the same as "translate then rotate." The
non-commutativity of matrix multiplication encodes this physical reality directly.
Test it:

```
A*B = [19 22; 43 50]
B*A = [23 34; 31 46]
```

Different results. Matrix multiplication is non-commutative.

**The identity matrix:**

The n×n identity matrix `I` has `1`s on the diagonal and `0`s elsewhere:

```
I₂ = [1 0]    I₃ = [1 0 0]
     [0 1]         [0 1 0]
                   [0 0 1]
```

`I × A = A × I = A`. It is the "multiply by 1" of matrices.

**SE concept — data structure design:**

A matrix is a 2D structure. Two storage choices:

1. **Array of arrays (`number[][]`):**
   ```typescript
   const A = [[1, 2], [3, 4]];
   A[0][1]  // row 0, column 1 → 2 (O(1))
   ```
   Row access is fast; column access requires iterating all rows.

2. **Flat array with index arithmetic:**
   ```typescript
   const A = [1, 2, 3, 4];
   const get = (r: number, c: number) => A[r * 2 + c];
   ```
   More cache-friendly; same asymptotic complexity.

OpenMAT uses `number[][]` because row access dominates (matrix multiplication
iterates rows), and `A[row][col]` matches mathematical notation for 2×2–3×3
matrices. NumPy uses a flat array internally and exposes `A[row, col]` as
syntactic sugar — the design choice always depends on which operations need to
be fast.

**CS concept — row-column index arithmetic:**

In *row-major order* (C, JavaScript), elements of the same row are contiguous
in memory. The flat index of element `(i, j)` in a matrix with `cols` columns is:

```
flat_index = i × cols + j
```

Row 0 is stored first, then row 1, then row 2. Iterating across a row reads
contiguous memory — fast. Iterating down a column skips `cols` elements between
reads — cache-unfriendly.

MATLAB uses *column-major order* (`flat_index = i + j × rows`). This is why
MATLAB's matrix multiplication iterates differently under the hood. For 3×3
matrices, the difference is invisible. For 1000×1000, it is 10–100× in speed.

**CS lens — O(n³) complexity:**

Matrix multiplication has three nested loops (rows × columns × inner). For
square n×n matrices, this is O(n³). For our 2×2 and 3×3 matrices it is trivially
fast. For large matrices (1000×1000), `n³ = 10⁹` operations — too slow without
hardware acceleration. NumPy uses BLAS routines that run on the CPU's vector
units, achieving practical O(n^2.37) via Strassen-like algorithms.

---

## Step 1 — Extend EnvironmentValue for Matrices

Open `src/environment.ts`. Add type aliases and extend the union:

```typescript
export type Vector = number[];
export type Matrix = number[][];
export type EnvironmentValue = number | string | boolean | FunctionDefNode | Vector | Matrix;

export function isMatrix(v: EnvironmentValue): v is Matrix {
  return Array.isArray(v) && v.length > 0 && Array.isArray(v[0]);
}

export function isVector(v: EnvironmentValue): v is Vector {
  return Array.isArray(v) && (v.length === 0 || typeof v[0] === 'number');
}
```

**`Vector` and `Matrix` type aliases — why name them:**

`Vector` is `number[]` — a flat array of numbers, the same type used for vectors
since lesson 16. `Matrix` is `number[][]` — an array of rows, where each row is
itself an array of numbers. Giving these types names instead of writing `number[]`
and `number[][]` inline everywhere makes the intent visible: when a function
parameter is typed `Matrix`, you know it expects a 2D structure, not a 1D one.
Both are now added to the `EnvironmentValue` union, which is the type of everything
a variable can hold in the OpenMAT runtime.

**`isMatrix` and `isVector` — type guard functions:**

`isMatrix` is a *type guard function* — a function whose return type is written
as `v is Matrix`. When TypeScript sees `if (isMatrix(v))`, it narrows `v` to type
`Matrix` inside the if-block. This is user-defined type narrowing, the same
narrowing TypeScript performs automatically for `typeof` and `instanceof`. The
implementation (`Array.isArray(v) && v.length > 0 && Array.isArray(v[0])`) is
the runtime check that justifies the compile-time narrowing: if `v` is an array,
is non-empty, and its first element is itself an array, TypeScript and the runtime
agree that `v` is a `Matrix`.

`isVector` uses the complementary check: if `v` is an array whose first element
is a `number` (not another array), it is a flat vector. The `v.length === 0`
guard covers the empty-array case — an empty array is treated as an empty vector
rather than an error.

This builds on the same `assertNumber` and `assertVector` pattern from earlier
lessons — the difference is that type guard functions return `true`/`false` and
let the caller decide what to do, while assert functions throw immediately if the
type is wrong.

---

## Step 2 — Add MatrixNode to the Parser

Add `MatrixNode` to the `ASTNode` union in `src/parser.ts`:

```typescript
export type ASTNode = /* ... */ | VectorNode | MatrixNode;

export interface MatrixNode {
  kind: 'Matrix';
  rows: ASTNode[][];
  line: number;
}
```

**The parsing challenge:** Both `[1, 2, 3]` (vector) and `[1 2; 3 4]` (matrix)
start with `[`. The parser cannot know which it is until it sees either `,`/`]`
(vector) or `;` (matrix row separator).

**The solution — accumulate, then decide:**

```
Read '['         → start accumulating
Read elements    → add to currentRow
Read ';'         → save row, start new row
Read ']'         → save last row; if 1 row → VectorNode, else → MatrixNode
```

Replace the `[` case in `parseAtom` with this logic:

```typescript
if (token.type === TokenType.LBRACKET) {
  advance();   // consume '['
  skipNewlines();

  const rows: ASTNode[][] = [];
  let currentRow: ASTNode[] = [];

  while (peek().type !== TokenType.RBRACKET && !atEnd()) {
    if (peek().type === TokenType.SEMICOLON) {
      advance();   // consume ';' — row separator
      rows.push(currentRow);
      currentRow = [];
      skipNewlines();
      continue;
    }

    currentRow.push(parseAssignment());

    if (peek().type === TokenType.COMMA) {
      advance();   // commas are optional separators between elements
    }
  }

  rows.push(currentRow);   // save the last (or only) row
  expect(TokenType.RBRACKET);

  if (rows.length === 1) {
    return { kind: 'Vector', elements: rows[0], line: token.line };
  }
  return { kind: 'Matrix', rows, line: token.line };
}
```

**CS concept — deferred disambiguation:**

The parser does not classify `[` as "vector" or "matrix" immediately. It reads
forward, collects what it finds, and classifies at the end. This is *deferred
disambiguation* — the meaning of a construct is determined by context, not by
the first token. Every real-world parser uses this technique for ambiguous grammar.

To make this concrete, here is a token-level trace of each case.

*Case 1 — vector `[1, 2]`:*
The parser sees `[`. It calls `advance()` to consume it. `currentRow = []`.
It parses `1` and adds it to `currentRow`. It sees `,` — a comma — and consumes
it. It parses `2` and adds it to `currentRow`. It sees `]`. The while-loop exits.
`rows.push(currentRow)` saves the single row `[NumberNode(1), NumberNode(2)]`.
`rows.length === 1` is true, so the function returns `VectorNode`. The decision
was not made at `[` — it was made at `]`, after the full content was seen.

*Case 2 — matrix `[1 2; 3 4]`:*
The parser sees `[`. It calls `advance()`. `currentRow = []`. It parses `1`. No
comma follows, so it continues. It parses `2`. It sees `;`. The semicolon branch
runs: `rows.push([NumberNode(1), NumberNode(2)])`, `currentRow = []`, loop
continues. It parses `3`. It parses `4`. It sees `]`. The while-loop exits.
`rows.push(currentRow)` saves `[NumberNode(3), NumberNode(4)]`. Now
`rows = [[NumberNode(1), NumberNode(2)], [NumberNode(3), NumberNode(4)]]`.
`rows.length > 1`, so the function returns `MatrixNode`. The `;` is what forced
the decision — nothing about the `[` token told the parser which construct this
was.

---

## Step 3 — Evaluate the Matrix Node

Add to the evaluator's `switch`:

```typescript
case 'Matrix': {
  return node.rows.map(rowNodes =>
    rowNodes.map(el => {
      const v = evaluate(el, env);
      if (typeof v !== 'number') throw new RuntimeError('matrix elements must be numbers', node.line);
      return v as number;
    })
  );
}
```

**Walkthrough — evaluating `[1 2; 3 4]`:**

The parser produced `MatrixNode({ kind: 'Matrix', rows: [[NumberNode(1), NumberNode(2)], [NumberNode(3), NumberNode(4)]], line: 1 })`. The evaluator enters the `case 'Matrix'` branch.

The outer `.map(rowNodes => ...)` iterates over the two rows. Row 0 is
`[NumberNode(1), NumberNode(2)]`. The inner `.map(el => evaluate(el, env))`
calls `evaluate` on each node. `evaluate(NumberNode(1), env)` returns `1`.
`evaluate(NumberNode(2), env)` returns `2`. `typeof 1 !== 'number'`? No — both
pass the guard. The inner `.map` returns `[1, 2]`. Row 1: same process →
`[3, 4]`. The outer `.map` returns `[[1, 2], [3, 4]]`. This is the `Matrix =
number[][]` type introduced in Step 1 — a JavaScript array of arrays of plain
numbers, ready to be stored in the environment or passed to `multiplyMatrices`.

Extend `BinaryOp` for matrix operations (after the vector cases from lesson 16):

```typescript
// Matrix × Matrix
if (isMatrix(left) && isMatrix(right)) {
  if (node.operator !== '*') throw new RuntimeError(`operator '${node.operator}' not supported for matrices`, node.line);
  return multiplyMatrices(left, right, node.line);
}

// Matrix × Vector (treat vector as column vector)
if (isMatrix(left) && isVector(right)) {
  if (node.operator !== '*') throw new RuntimeError(`operator '${node.operator}' not supported for matrix × vector`, node.line);
  const col = (right as number[]).map(c => [c]);
  return multiplyMatrices(left, col, node.line).map(row => row[0]);
}
```

Implement `multiplyMatrices`:

```typescript
function multiplyMatrices(A: number[][], B: number[][], line: number): number[][] {
  const m = A.length;
  const n = A[0].length;
  const p = B[0].length;

  if (B.length !== n) {
    throw new RuntimeError(
      `cannot multiply ${m}×${n} matrix by ${B.length}×${p} matrix`,
      line
    );
  }

  return Array.from({ length: m }, (_, rowIndex) =>
    Array.from({ length: p }, (_, colIndex) => {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[rowIndex][k] * B[k][colIndex];
      }
      return sum;
    })
  );
}
```

**`Array.from` — first use:**

`Array.from({ length: m }, (_, rowIndex) => ...)` creates an array of `m`
elements where each element is the return value of the callback. The callback
receives two arguments: the element value (named `_` here, by convention, to
signal it is intentionally unused) and the index (named `rowIndex`). Because the
source is a length-only object `{ length: m }` rather than a real array, all
element values are `undefined` — which is why `_` is never read. Only the index
matters.

This is the correct way to create arrays of computed values in TypeScript.
`new Array(m)` creates `m` empty slots, and `.map()` skips empty slots entirely,
producing a sparse array with missing entries rather than computed ones. `Array.from`
fills those slots with the callback's return value before the mapping runs.
Whenever you need an array of `n` items where each item is computed from its
index, `Array.from({ length: n }, (_, i) => ...)` is the right tool.

**Walkthrough — `multiplyMatrices([[1,2],[3,4]], [[5,6],[7,8]], 1)`:**

`m = A.length = 2`. `n = A[0].length = 2`. `p = B[0].length = 2`.
Dimension check: `B.length === n`? `2 === 2`? Yes — proceed.

`Array.from({ length: 2 }, ...)` creates 2 rows.

Row 0 (`rowIndex = 0`): `Array.from({ length: 2 }, ...)` creates 2 columns.

- Col 0 (`colIndex = 0`): `k=0: A[0][0] × B[0][0] = 1×5 = 5`. `k=1: A[0][1] × B[1][0] = 2×7 = 14`. `sum = 19`.
- Col 1 (`colIndex = 1`): `k=0: A[0][0] × B[0][1] = 1×6 = 6`. `k=1: A[0][1] × B[1][1] = 2×8 = 16`. `sum = 22`.
- Row 0 result: `[19, 22]`.

Row 1 (`rowIndex = 1`):

- Col 0: `A[1][0] × B[0][0] + A[1][1] × B[1][0] = 3×5 + 4×7 = 15 + 28 = 43`.
- Col 1: `A[1][0] × B[0][1] + A[1][1] × B[1][1] = 3×6 + 4×8 = 18 + 32 = 50`.
- Row 1 result: `[43, 50]`.

Final result: `[[19, 22], [43, 50]]`. This matches the hand-calculated answer
from the concept section and the expected output in the SAVE AND TRY block.

**Why `rowIndex`, `colIndex`, `k` instead of `i`, `j`, `k`:**

`i`, `j`, `k` are mathematical convention for matrix indices and are fine when
the meaning is stated alongside (as in a textbook). In code, `rowIndex` and
`colIndex` state the meaning explicitly. `k` is kept as the inner index since
it is universally understood as the summation variable in matrix multiplication.

---

## Step 4 — Add Matrix Built-in Functions

Add to `evaluateBuiltin` in `src/evaluator.ts`:

```typescript
if (name === 'eye') {
  const n = Math.round(evaluate(argNodes[0], env) as number);
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => r === c ? 1 : 0)
  );
}

if (name === 'zeros') {
  const rows = Math.round(evaluate(argNodes[0], env) as number);
  const cols = argNodes[1] ? Math.round(evaluate(argNodes[1], env) as number) : rows;
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

if (name === 'transpose') {
  const mat = evaluate(argNodes[0], env);
  if (!isMatrix(mat)) throw new RuntimeError('transpose() requires a matrix', callLine);
  const m = mat.length, n = mat[0].length;
  return Array.from({ length: n }, (_, c) => Array.from({ length: m }, (_, r) => mat[r][c]));
}
```

**`Array.from` in `eye` and `zeros`:**

`eye` uses the same `Array.from({ length: n }, (_, r) => ...)` pattern introduced
in `multiplyMatrices`. The outer call creates `n` rows; `r` is the row index. The
inner `Array.from({ length: n }, (_, c) => r === c ? 1 : 0)` creates `n` column
values; `c` is the column index. `r === c` is true only on the diagonal, so
diagonal cells get `1` and all others get `0`. For `eye(2)`:
row 0 → `[1, 0]` (r=0, c=0 matches; c=1 does not); row 1 → `[0, 1]`.

`zeros` uses `Array(cols).fill(0)` for the inner row — this is appropriate here
because every element is the same value (`0`), so there is nothing to compute
per-index. `Array(cols)` creates `cols` empty slots and `.fill(0)` sets all of
them to `0`.

**`transpose`** uses `Array.from` to build the output in column-first order:
for each column index `c` of the original matrix, it creates a new row by
collecting `mat[r][c]` across all rows `r`. A column in the original becomes a
row in the result.

Update `disp` to handle matrices:

```typescript
if (name === 'disp') {
  const val = evaluate(argNodes[0], env);
  if (isMatrix(val)) {
    val.forEach(row => printOutput('[' + row.map(formatResult).join(', ') + ']'));
  } else if (isVector(val)) {
    printOutput('[' + (val as number[]).map(formatResult).join(', ') + ']');
  } else {
    printOutput(formatResult(val));
  }
  return val;
}
```

---

## Step 5 — Write the Tests

Create `src/matrix.test.ts`:

```typescript
import { tokenize }    from './lexer';
import { parse }       from './parser';
import { evaluate }    from './evaluator';
import { Environment, isMatrix } from './environment';

function run(src: string, env = new Environment()) {
  return evaluate(parse(tokenize(src)), env);
}

test('matrix multiplication 2×2', () => {
  const env = new Environment();
  run('A = [1 2; 3 4]', env);
  run('B = [5 6; 7 8]', env);
  const C = run('A * B', env) as number[][];
  expect(C[0]).toEqual([19, 22]);
  expect(C[1]).toEqual([43, 50]);
});

test('identity matrix leaves A unchanged', () => {
  const env = new Environment();
  run('A = [1 2; 3 4]', env);
  const result = run('eye(2) * A', env) as number[][];
  expect(result[0]).toEqual([1, 2]);
  expect(result[1]).toEqual([3, 4]);
});

test('matrix multiplication is not commutative', () => {
  const env = new Environment();
  run('A = [1 2; 3 4]', env);
  run('B = [5 6; 7 8]', env);
  const AB = run('A * B', env) as number[][];
  const BA = run('B * A', env) as number[][];
  expect(AB[0]).not.toEqual(BA[0]);
});

test('dimension mismatch throws RuntimeError', () => {
  expect(() => run('[1 2] * [1 2]')).toThrow('cannot multiply');
});

test('matrix × vector (column)', () => {
  // [1 0; 0 1] * [3, 4] = [3, 4]
  const result = run('[1 0; 0 1] * [3, 4]') as number[];
  expect(result).toEqual([3, 4]);
});
```

Run `npx vitest run` — all tests should pass.

---

### SAVE AND TRY

```
>> A = [1 2; 3 4]
>> B = [5 6; 7 8]
>> C = A * B
>> disp(C)
[19, 22]
[43, 50]
```

```
>> I = eye(2)
>> disp(I * A)
[1, 2]
[3, 4]
```

Confirm non-commutativity:
```
>> disp(A * B)
[19, 22]
[43, 50]
>> disp(B * A)
[23, 34]
[31, 46]
```

---

## Connect the Pieces

Matrices are the foundation of lesson 18. A 2D geometric transformation is
represented as a 3×3 matrix in homogeneous coordinates. Composing two
transformations is matrix multiplication. The `multiplyMatrices` function
written here does all the work — lesson 18 only needs OpenMAT code.

```
EnvironmentValue = number | string | boolean | FunctionDefNode | Vector | Matrix
BinaryOp dispatches: isMatrix + isMatrix → multiplyMatrices
                     isMatrix + isVector → column multiplication
evaluateBuiltin: eye(), zeros(), transpose(), updated disp()
```

---

## Real-World Connection

NumPy stores matrices as flat arrays internally (`dtype float64`, C contiguous)
and uses BLAS/LAPACK routines for multiplication. The row-major/column-major
distinction explained in the concept section is exactly why NumPy's `.T`
(transpose) is O(1) — it does not copy data. It just changes a flag that tells
NumPy to read the flat array in column-major order instead of row-major. The
data does not move; only the interpretation changes.

TensorFlow and PyTorch extend the same concept to n-dimensional tensors. A matrix
is a rank-2 tensor; a vector is rank-1; a batch of images is rank-4. The
`multiplyMatrices` loop structure written here is structurally identical to what
these libraries do for small matrices before handing off to GPU kernels for large
ones.

The 3×3 matrix built in lesson 18 is what WebGL's `mat3` type and Three.js's
`Matrix3` class store internally — a flat array of 9 numbers accessed with the
same row-dot-column logic. When you multiply two `Matrix3` objects in Three.js,
it calls exactly the same triple-nested loop.

---

## What Breaks Without This

Try `A * B` where A is 2×3 and B is 2×3. The dimension check throws:
"cannot multiply 2×3 matrix by 2×3 matrix." Without the check, `B.length !== n`
would not be caught — the inner loop accesses `B[k][colIndex]` with `k` going
up to 2 (for a 2-column A) but `B` only has rows at 0 and 1. `B[2]` is
`undefined`, and `undefined[colIndex]` throws a JavaScript TypeError inside
the loop. The dimension check converts a cryptic crash into a meaningful error
at the right abstraction level.

---

## Definition of Done

- [ ] `[1 2; 3 4] * [5 6; 7 8]` → `[[19,22],[43,50]]`
- [ ] `eye(2) * A = A` for any 2×2 A
- [ ] `A * B ≠ B * A` confirmed with a test
- [ ] `disp` formats matrices as multiple lines, one row per line
- [ ] Incompatible dimensions produce a clear `RuntimeError` with the dimensions
- [ ] All matrix tests pass
- [ ] You can compute a 2×2 product by hand using the row-dot-column rule
- [ ] You can explain why matrix multiplication is non-commutative
- [ ] You can explain the trade-off between `number[][]` and a flat array
- [ ] Commit your work:
  ```
  git add src/environment.ts src/parser.ts src/evaluator.ts src/matrix.test.ts
  git commit -m "Add matrices: [1 2; 3 4] syntax, A*B multiplication, eye/zeros/transpose built-ins"
  ```

---

*Next: Lesson 18 — Transformations. Rotation, scaling, and translation as 3×3
matrices in homogeneous coordinates. The triangle moves because of maths you
wrote and understand.*
