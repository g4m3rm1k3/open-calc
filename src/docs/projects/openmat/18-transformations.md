# OpenMAT — Lesson 18 — Transformations

## What You Will Build

Type this into the console:

```
>> angle = pi / 4
>> R = rotate(angle)
>> S = scale(1.5, 1.5)
>> T = transform(R, S)
>> drawTransformedTriangle(T)
```

The triangle rotates 45° and scales to 1.5× its original size — because of
matrix mathematics you built, understood, and applied.

---

## What You Need to Know First

Lessons 01–17 complete. The full interpreter works: variables, functions, loops,
vectors, matrices. `multiplyMatrices` exists in `evaluator.ts`. `isMatrix` and
`isVector` are exported from `environment.ts`. `pi` resolves to `Math.PI` as a
built-in constant (from lesson 15).

---

## Concept: Why 3×3 Matrices for 2D Transformations?

**The problem with 2×2 matrices:**

A 2×2 matrix can represent rotations and scalings, but not translations (moving
the triangle). Translation in 2D means adding a constant to each coordinate:

```
x' = x + tx
y' = y + ty
```

This is addition, not multiplication. A 2×2 matrix can only express *linear*
operations — things expressible as `M × v`. Translation is *affine* — linear
plus a constant. You cannot write `x + tx` as a 2×2 matrix multiplication.

**The solution — homogeneous coordinates:**

Add a third coordinate `w` to every 2D point:

```
point     [x, y]  →  homogeneous [x, y, 1]
direction [x, y]  →  homogeneous [x, y, 0]
```

The choice of `1` for points and `0` for directions is not arbitrary:
- A point should be moved by translation (`w = 1` picks up the translation column)
- A direction should not be moved (`w = 0` ignores the translation column)

Now every transformation — including translation — is a 3×3 matrix:

```
[x']   [a  b  tx] [x]
[y'] = [c  d  ty] [y]
[1 ]   [0  0   1] [1]
```

The bottom row `[0 0 1]` ensures `w` stays 1 after multiplication.

Composing any sequence of transformations is just matrix multiplication:

```
Combined = Translation × Rotation × Scale
```

Apply `Combined` to each vertex and the triangle moves, rotates, and scales in
one operation. Order matters: this produces "scale first, then rotate, then
translate" (right to left — the standard convention).

---

## Concept: The Rotation Matrix

**Deriving it from first principles:**

A unit vector pointing right is `[1, 0]`. After rotating anti-clockwise by θ,
it points to `[cos θ, sin θ]`. This is the definition of cosine and sine on the
unit circle.

A unit vector pointing up is `[0, 1]`. After rotating by θ, it points to
`[-sin θ, cos θ]`. (The negative sign: rotating the y-axis anti-clockwise moves
it toward the negative-x direction.)

A matrix transforms the standard basis vectors into its columns. Column 1 is
"where the x-axis goes." Column 2 is "where the y-axis goes." So:

```
R₂ₓ₂ = [cos θ   -sin θ]
        [sin θ    cos θ]
```

In homogeneous coordinates (3×3):

```
R = [cos θ   -sin θ   0]
    [sin θ    cos θ   0]
    [0        0       1]
```

The bottom row and right column preserve `w = 1`. Rotation does not translate —
the translation column is all zeros.

**Verify with θ = 90° = π/2:**

`cos(π/2) = 0`, `sin(π/2) = 1`.

Apply to `[1, 0, 1]` (the point `(1, 0)`):
```
x' = 0×1 + (−1)×0 + 0 = 0
y' = 1×1 +   0×0 + 0 = 1
```

`(1, 0)` → `(0, 1)` — 90° anti-clockwise. Correct.

---

## Concept: Scale and Translation Matrices

**Scaling — scale x by `sx`, y by `sy`:**

```
S = [sx   0   0]
    [0    sy  0]
    [0    0   1]
```

Uniform scaling (`sx = sy`) makes the triangle larger or smaller. Non-uniform
stretches or squishes it.

**Translation — move by `(tx, ty)`:**

```
T = [1   0   tx]
    [0   1   ty]
    [0   0    1]
```

Applying to `[x, y, 1]`:
```
x' = x + tx
y' = y + ty
```

This is pure addition of `(tx, ty)` — which was impossible with a 2×2 matrix.
The `w = 1` picks up the `tx` and `ty` terms.

---

## Step 1 — Add the Transformation Built-in Functions

Add to `evaluateBuiltin` in `src/evaluator.ts`:

```typescript
import { isMatrix } from './environment';

if (name === 'rotate') {
  const angle = assertNumber(evaluate(argNodes[0], env), 'rotate()', callLine);
  const c = Math.cos(angle), s = Math.sin(angle);
  return [
    [c, -s, 0],
    [s,  c, 0],
    [0,  0, 1],
  ];
}

if (name === 'scale') {
  const sx = assertNumber(evaluate(argNodes[0], env), 'scale()', callLine);
  const sy = argNodes[1] ? assertNumber(evaluate(argNodes[1], env), 'scale()', callLine) : sx;
  return [
    [sx, 0,  0],
    [0,  sy, 0],
    [0,  0,  1],
  ];
}

if (name === 'translate') {
  const tx = assertNumber(evaluate(argNodes[0], env), 'translate()', callLine);
  const ty = assertNumber(evaluate(argNodes[1], env), 'translate()', callLine);
  return [
    [1, 0, tx],
    [0, 1, ty],
    [0, 0,  1],
  ];
}

if (name === 'transform') {
  // transform(A, B, C, ...) composes matrices: A × B × C × ...
  // Convention: last matrix is applied first.
  if (argNodes.length === 0) return [[1,0,0],[0,1,0],[0,0,1]];

  const mats = argNodes.map(n => {
    const v = evaluate(n, env);
    if (!isMatrix(v)) throw new RuntimeError('transform() requires matrices', callLine);
    return v as number[][];
  });

  return mats.reduce((acc, m) => multiplyMatrices(acc, m, callLine));
}
```

**Why `transform(R, S)` applies S first:**

`transform(R, S)` computes `R × S`. When applied to a point `v`, the result is
`R × (S × v)` — S is applied to `v` first, then R. This is the standard
right-to-left convention: `transform(Translate, Rotate, Scale)` means "scale
first, then rotate, then translate."

---

## Step 2 — Add drawTransformedTriangle to the Canvas

Open `src/canvas.ts`. Add vertex constants and the function:

```typescript
// Triangle vertices from lesson 01, in homogeneous coordinates [x, y, 1]
const APEX          = [250, 100, 1];
const BOTTOM_LEFT   = [100, 400, 1];
const BOTTOM_RIGHT  = [400, 400, 1];

function applyMatrix(M: number[][], p: number[]): number[] {
  return M.map(row => row.reduce((s, v, i) => s + v * p[i], 0));
}

export function drawTransformedTriangle(M: number[][]): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const a = applyMatrix(M, APEX);
  const l = applyMatrix(M, BOTTOM_LEFT);
  const r = applyMatrix(M, BOTTOM_RIGHT);

  const fill = getComputedStyle(document.documentElement).getPropertyValue('--colour-triangle').trim();
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(l[0], l[1]);
  ctx.lineTo(r[0], r[1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
```

Add to `evaluateBuiltin`:

```typescript
import { drawTransformedTriangle } from './canvas';

if (name === 'drawTransformedTriangle') {
  const M = evaluate(argNodes[0], env);
  if (!isMatrix(M)) throw new RuntimeError('drawTransformedTriangle() requires a matrix', callLine);
  drawTransformedTriangle(M as number[][]);
  return 0;
}
```

---

## Step 3 — Write the Tests

Add to `src/transform.test.ts`:

```typescript
import { tokenize }    from './lexer';
import { parse }       from './parser';
import { evaluate }    from './evaluator';
import { Environment } from './environment';

function run(src: string, env = new Environment()) {
  return evaluate(parse(tokenize(src)), env);
}

test('rotate(0) is the identity', () => {
  const M = run('rotate(0)') as number[][];
  expect(M[0][0]).toBeCloseTo(1);
  expect(M[0][1]).toBeCloseTo(0);
  expect(M[1][0]).toBeCloseTo(0);
  expect(M[1][1]).toBeCloseTo(1);
});

test('rotate(pi/2) rotates 90 degrees anti-clockwise', () => {
  const M = run('rotate(pi / 2)') as number[][];
  expect(M[0][0]).toBeCloseTo(0);
  expect(M[0][1]).toBeCloseTo(-1);
  expect(M[1][0]).toBeCloseTo(1);
  expect(M[1][1]).toBeCloseTo(0);
});

test('scale(2, 2) doubles coordinates', () => {
  const env = new Environment();
  run('S = scale(2, 2)', env);
  const S = env.get('S') as number[][];
  const p = [3, 4, 1];
  const result = S.map(row => row.reduce((s, v, i) => s + v * p[i], 0));
  expect(result[0]).toBeCloseTo(6);
  expect(result[1]).toBeCloseTo(8);
});

test('translate(10, 20) moves a point', () => {
  const env = new Environment();
  run('T = translate(10, 20)', env);
  const T = env.get('T') as number[][];
  const p = [5, 5, 1];
  const result = T.map(row => row.reduce((s, v, i) => s + v * p[i], 0));
  expect(result[0]).toBeCloseTo(15);
  expect(result[1]).toBeCloseTo(25);
});

test('translation does not affect directions (w=0)', () => {
  const env = new Environment();
  run('T = translate(10, 20)', env);
  const T = env.get('T') as number[][];
  const d = [1, 0, 0];   // direction: w=0
  const result = T.map(row => row.reduce((s, v, i) => s + v * d[i], 0));
  expect(result[0]).toBeCloseTo(1);   // unchanged
  expect(result[1]).toBeCloseTo(0);   // unchanged
});
```

Run `npx vitest run` — all tests should pass.

---

### SAVE AND TRY

**Pure rotation:**
```
>> R = rotate(pi / 6)
>> drawTransformedTriangle(R)
```
The triangle rotates 30°.

**Scale and rotate (applied right-to-left: scale first, then rotate):**
```
>> S = scale(0.8, 0.8)
>> R = rotate(pi / 4)
>> T = transform(R, S)
>> drawTransformedTriangle(T)
```

**Rotate and translate:**
```
>> R = rotate(pi / 4)
>> Tr = translate(50, 0)
>> T = transform(Tr, R)
>> drawTransformedTriangle(T)
```
Rotates 45°, then moves 50 pixels right.

**Animate with a loop:**
```
>> for i = 0:11
     angle = i * pi / 6
     R = rotate(angle)
     drawTransformedTriangle(R)
   end
```
The triangle sweeps through 12 positions, 30° apart. Each frame is a matrix
multiplication computed by the interpreter you built.

---

## Connect the Pieces

The entire 18-lesson pipeline is now connected:

```
OpenMAT source code
    ↓  tokenize (lesson 04)    → tokens
    ↓  parse    (lesson 05)    → AST
    ↓  evaluate (lessons 06–15) → values
    ↓  rotate/scale/translate  → 3×3 matrices
    ↓  transform(...)          → composed matrix via multiplyMatrices
    ↓  applyMatrix to vertices → transformed coordinates
    ↓  drawTransformedTriangle → canvas
```

Every function call is traceable. Every operator is explainable. Every
transformation has a matrix derived from first principles.

---

## What Breaks Without This

Transpose the rotation matrix (swap the off-diagonal signs):

```typescript
// WRONG — this gives clockwise rotation:
return [
  [c,  s, 0],
  [-s, c, 0],
  [0,  0, 1],
];
```

`rotate(pi/2)` now produces clockwise rotation instead of anti-clockwise. The
triangle moves to the right angle but in the wrong direction. The test catches
this immediately:

```
Expected: M[1][0] to be close to 1
Received: -1
```

The sign of `sin θ` in the off-diagonal position determines rotation direction.
The test encodes the geometric fact: `[1, 0]` must map to `[cos θ, sin θ]`, so
the first column must be `[c, s, 0]^T`. A wrong sign is caught before any visual
output is generated.

---

## Definition of Done

- [ ] `rotate(pi/2)` returns a matrix where `[1, 0, 1]` maps to `[0, 1, 1]`
- [ ] `drawTransformedTriangle(rotate(pi/2))` rotates the triangle 90°
- [ ] `drawTransformedTriangle(scale(2, 2))` doubles the triangle's size
- [ ] `transform(Tr, R, S)` composes all three correctly (scale, rotate, translate)
- [ ] The translation test confirms `w = 0` (direction) is unaffected
- [ ] All transformation tests pass
- [ ] You can derive the rotation matrix from the images of the basis vectors
      without notes
- [ ] You can explain why homogeneous coordinates are needed and what `w = 1`
      vs `w = 0` means
- [ ] You can explain why the order of matrix composition matters

---

## The End of the Beginning

You have built a working programming language. Not a toy — a real interpreter
with a complete pipeline:

| Stage | What it does |
|-------|-------------|
| Lexer | Converts source text to tokens |
| Parser | Converts tokens to an AST with correct operator precedence |
| Evaluator | Traverses the AST and computes results |
| Environment | Stores and retrieves named values (symbol table) |
| Error system | Reports failures with line numbers and error types |
| Visualiser | Renders the results of computation as geometry |

You understand every function in the codebase. You can explain every design
decision — why the grammar has levels, why scope chains work the way they do,
why homogeneous coordinates require a `1` in the `w` position. The maths — dot
products, matrix multiplication, the rotation matrix — was derived from first
principles, not memorised.

This is what it means to understand a system rather than to have used one.
