# Junior to Senior — T7·L3 — Matrices and Transforms

**Prerequisites:** T7·L2 (Dot and Cross Product). You have Vec3 with all operations.
This lesson teaches 4×4 matrices not as a collection of numbers to memorise but by
explaining WHY 3×3 is not enough, WHAT the 4th row/column means, and HOW matrix
multiplication produces composition of transforms.

**What this lab adds:**
- Why translation cannot be done with 3×3 matrix multiplication — the linearity proof
- What the 4th dimension (w) means and why points use w=1 and directions use w=0
- How matrix multiplication works mechanically — one element at a time
- Why TRS order means "scale first, rotate second, translate last" — the right-to-left rule
- Building and testing each transform matrix before combining them

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A linear transformation has this property: `f(a + b) = f(a) + f(b)`.
>    Translation breaks this: `translate(a + b) ≠ translate(a) + translate(b)`.
>    Show a concrete example where this fails.
> 2. Column-major storage: `m[0]` through `m[15]`. Which index is the X-translation?
>    Which index is the Y-translation? How do you know?
> 3. `M = T * R * S`. You apply M to point P. Which transform runs FIRST on P?
>
> *(Answers at the end of this lab)*

---

## Why 3×3 Is Not Enough

A 3×3 matrix can only represent LINEAR transformations — operations where
`f(a + b) = f(a) + f(b)` and `f(k*a) = k*f(a)`.

Scale is linear: `scale(a + b) = scale(a) + scale(b)`.
Rotation is linear: `rotate(a + b) = rotate(a) + rotate(b)`.
But translation is NOT linear:

```
Let T = "add (5, 0, 0)" — move 5 units right.
Let a = (1, 0, 0), b = (2, 0, 0).

T(a + b) = T(3, 0, 0) = (8, 0, 0)
T(a) + T(b) = (6, 0, 0) + (7, 0, 0) = (13, 0, 0)

8 ≠ 13 → Translation is NOT linear → Cannot be represented as a 3×3 matrix.
```

The trick that fixes this: add a 4th dimension (w). For a POINT, w=1. For a DIRECTION, w=0.
Then translation becomes a linear operation in the 4D space — representable as a 4×4 matrix.

---

## Step 1 — Understand the Translation Matrix

The 4×4 translation matrix for moving by (tx, ty, tz):

```
[1  0  0  tx]
[0  1  0  ty]
[0  0  1  tz]
[0  0  0   1]
```

Apply it to a point `(x, y, z, w=1)`:

```
x' = 1*x + 0*y + 0*z + tx*w = x + tx   ← x is translated
y' = 0*x + 1*y + 0*z + ty*w = y + ty   ← y is translated
z' = 0*x + 0*y + 1*z + tz*w = z + tz   ← z is translated
w' = 0*x + 0*y + 0*z +  1*w = w = 1    ← w stays 1
```

Apply it to a direction `(x, y, z, w=0)`:

```
x' = x + tx*0 = x   ← x NOT translated (tx multiplied by w=0)
y' = y + ty*0 = y   ← y NOT translated
z' = z + tz*0 = z   ← z NOT translated
w' = 1*0 = 0        ← w stays 0
```

**This is why** directions use w=0 and points use w=1. The translation terms multiply
`w` — zero for directions means "no translation." The math enforces the geometry:
a direction is not a position, so translating it makes no sense.

Create `src/math/Mat4.ts`:

```ts
// src/math/Mat4.ts
import { Vec3 } from './Vec3';

/**
 * Column-major 4×4 matrix.
 * m[col * 4 + row] = element at row 'row', column 'col'
 *
 * Column-major layout (matching WebGL/OpenGL convention):
 * m[0]  m[4]  m[8]   m[12]   ← column 0, 1, 2, 3
 * m[1]  m[5]  m[9]   m[13]
 * m[2]  m[6]  m[10]  m[14]
 * m[3]  m[7]  m[11]  m[15]
 *
 * Translation is in m[12], m[13], m[14] (last column, top 3 rows)
 */
export class Mat4 {
  readonly m: readonly number[];

  constructor(m: readonly number[]) {
    if (m.length !== 16) throw new Error('Mat4 requires exactly 16 elements');
    this.m = m;
  }
}
```

Add the identity matrix and verify it:

```ts
static identity(): Mat4 {
  // Identity: transforming a vector gives the same vector back.
  // 1s on the diagonal, 0s everywhere else:
  return new Mat4([
    1, 0, 0, 0,   // column 0
    0, 1, 0, 0,   // column 1
    0, 0, 1, 0,   // column 2
    0, 0, 0, 1,   // column 3
  ]);
}
```

Create the test file `src/math/Mat4.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Mat4 } from './Mat4';
import { Vec3 } from './Vec3';

// Helper — compare Vec3 approximately:
function expectVec3Close(a: Vec3, b: Vec3, digits = 5) {
  expect(a.x).toBeCloseTo(b.x, digits);
  expect(a.y).toBeCloseTo(b.y, digits);
  expect(a.z).toBeCloseTo(b.z, digits);
}

describe('Mat4', () => {
  it('identity has 1s on diagonal, 0s everywhere else', () => {
    const m = Mat4.identity().m;
    expect(m[0]).toBe(1);   // (row 0, col 0)
    expect(m[5]).toBe(1);   // (row 1, col 1)
    expect(m[10]).toBe(1);  // (row 2, col 2)
    expect(m[15]).toBe(1);  // (row 3, col 3)
    expect(m[4]).toBe(0);   // off-diagonal
    expect(m[1]).toBe(0);   // off-diagonal
  });
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: `Tests N+1 passed`.

---

## Step 2 — Build Translation and `transformPoint`

Add to `Mat4.ts`:

```ts
static translation(x: number, y: number, z: number): Mat4 {
  // Column-major: translation goes in the LAST COLUMN (indices 12, 13, 14):
  // [1 0 0 x]     stored as: 1, 0, 0, 0,  (col 0)
  // [0 1 0 y]                0, 1, 0, 0,  (col 1)
  // [0 0 1 z]                0, 0, 1, 0,  (col 2)
  // [0 0 0 1]                x, y, z, 1   (col 3)
  return new Mat4([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1,  // ← translation is in the 4th column (indices 12, 13, 14, 15)
  ]);
}

transformPoint(v: Vec3): Vec3 {
  // w = 1 for points: translation IS applied
  const m = this.m;
  const x = m[0]*v.x + m[4]*v.y + m[8]*v.z  + m[12];  // + tx*1
  const y = m[1]*v.x + m[5]*v.y + m[9]*v.z  + m[13];  // + ty*1
  const z = m[2]*v.x + m[6]*v.y + m[10]*v.z + m[14];  // + tz*1
  const w = m[3]*v.x + m[7]*v.y + m[11]*v.z + m[15];
  return new Vec3(x/w, y/w, z/w);   // perspective divide (w=1 for affine)
}

transformDirection(v: Vec3): Vec3 {
  // w = 0 for directions: translation is NOT applied (tx*0 = 0)
  const m = this.m;
  return new Vec3(
    m[0]*v.x + m[4]*v.y + m[8]*v.z,    // no m[12] term (0 * tx = 0)
    m[1]*v.x + m[5]*v.y + m[9]*v.z,    // no m[13] term
    m[2]*v.x + m[6]*v.y + m[10]*v.z,   // no m[14] term
  );
}
```

Add the tests:

```ts
it('translation moves a point by the given amount', () => {
  const t = Mat4.translation(5, 3, -1);
  const p = new Vec3(1, 1, 1);
  const result = t.transformPoint(p);
  // (1+5, 1+3, 1+(-1)) = (6, 4, 0):
  expectVec3Close(result, new Vec3(6, 4, 0));
});

it('translation does NOT move a direction (w=0)', () => {
  const t = Mat4.translation(5, 3, -1);
  const d = Vec3.X_AXIS;    // direction — should not move
  const result = t.transformDirection(d);
  // Direction is unchanged — translation has no effect on directions:
  expectVec3Close(result, Vec3.X_AXIS);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all new tests pass. **Change something:** Change `transformPoint` to use
`transformDirection` for the point test. Expected: the translation is NOT applied —
the output is `(1, 1, 1)` instead of `(6, 4, 0)`. This shows the w=0 vs w=1 difference concretely.

---

## Step 3 — Build Scale and Rotation, Test Each Alone

```ts
static scale(x: number, y: number, z: number): Mat4 {
  // Scale factors on the diagonal (each axis scaled independently):
  return new Mat4([
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1,
  ]);
}

static rotationX(rad: number): Mat4 {
  const c = Math.cos(rad), s = Math.sin(rad);
  // Rotation around X: Y and Z rotate; X stays fixed:
  return new Mat4([
    1,  0,  0, 0,
    0,  c,  s, 0,   // ← column-major: s is at [9] not [6]
    0, -s,  c, 0,
    0,  0,  0, 1,
  ]);
}

static rotationY(rad: number): Mat4 {
  const c = Math.cos(rad), s = Math.sin(rad);
  return new Mat4([
     c, 0, -s, 0,
     0, 1,  0, 0,
     s, 0,  c, 0,
     0, 0,  0, 1,
  ]);
}

static rotationZ(rad: number): Mat4 {
  const c = Math.cos(rad), s = Math.sin(rad);
  return new Mat4([
    c,  s, 0, 0,
   -s,  c, 0, 0,
    0,  0, 1, 0,
    0,  0, 0, 1,
  ]);
}
```

Test each rotation individually — verify the direction it rotates:

```ts
it('scale(2, 3, 4) doubles x, triples y, quadruples z', () => {
  const s = Mat4.scale(2, 3, 4);
  const p = new Vec3(1, 1, 1);
  expectVec3Close(s.transformPoint(p), new Vec3(2, 3, 4));
});

it('rotationY by PI/2 maps +X to -Z', () => {
  // 90° rotation around Y: X-axis rotates toward -Z in a right-handed system
  const r = Mat4.rotationY(Math.PI / 2);
  expectVec3Close(r.transformDirection(Vec3.X_AXIS), Vec3.Z_AXIS.negate());
});

it('rotationZ by PI/2 maps +X to +Y', () => {
  // 90° rotation around Z: X-axis rotates toward Y
  const r = Mat4.rotationZ(Math.PI / 2);
  expectVec3Close(r.transformDirection(Vec3.X_AXIS), Vec3.Y_AXIS);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all new tests pass.

---

## Step 4 — Matrix Multiplication (Composition)

Two transforms applied sequentially = one combined matrix.

```ts
multiply(other: Mat4): Mat4 {
  const a = this.m;    // left matrix
  const b = other.m;  // right matrix
  const r = new Array(16).fill(0);

  // Standard matrix multiplication: result[col][row] = dot of row `row` of a and column `col` of b
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        // Column-major: a[k*4+row] = element at row `row`, column `k` of matrix a
        sum += a[k * 4 + row] * b[col * 4 + k];
      }
      r[col * 4 + row] = sum;
    }
  }

  return new Mat4(r);
}
```

Test that order matters — the critical TRS insight:

```ts
it('TRS: scale THEN rotate THEN translate (right-to-left application)', () => {
  // M = T * R * S
  // Applied to point P: first S, then R, then T (right-to-left)
  // A point at (1, 0, 0) scaled by 2, then placed at (5, 0, 0):
  const T = Mat4.translation(5, 0, 0);
  const S = Mat4.scale(2, 2, 2);
  const M = T.multiply(S);  // T * S means: first S, then T

  const p = new Vec3(1, 0, 0);
  const result = M.transformPoint(p);
  // First scale: (1,0,0)*2 = (2,0,0)
  // Then translate: (2,0,0) + (5,0,0) = (7,0,0)
  expectVec3Close(result, new Vec3(7, 0, 0));
});

it('identity * M = M (identity is the neutral element)', () => {
  const T = Mat4.translation(1, 2, 3);
  const I = Mat4.identity();
  const p = new Vec3(0, 0, 0);
  // I*T applied to origin should give (1,2,3):
  expectVec3Close(I.multiply(T).transformPoint(p), T.transformPoint(p));
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Build `lookAt` (View Matrix)

**The mechanism to understand first:**

A camera at position `eye` looking at `target` with `up` as the up direction has
three orthogonal axes:
- `forward = normalise(target - eye)` — where the camera looks
- `right = normalise(forward × up)` — camera's right direction
- `cameraUp = right × forward` — camera's actual up (may differ from world up due to tilt)

The view matrix transforms world coordinates into camera coordinates. It is built from
these three axes plus the camera position.

**Task:** Implement `Mat4.lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4`

Write 1 test: a camera at `(0, 0, 5)` looking at the origin should put the origin
directly in front of it — at a negative z in camera space.

---

<details>
<summary>▶ Show Solution</summary>

```ts
static lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const forward = target.sub(eye).normalise();                // -Z of camera
  const right   = forward.cross(up).normalise();              // +X of camera
  const camUp   = right.cross(forward);                       // +Y of camera

  // The view matrix = rotation (transpose of camera axes) × translation (-eye):
  return new Mat4([
    right.x,         camUp.x,         -forward.x,         0,
    right.y,         camUp.y,         -forward.y,         0,
    right.z,         camUp.z,         -forward.z,         0,
    -right.dot(eye), -camUp.dot(eye),  forward.dot(eye),  1,
  ]);
}
```

**Test:**
```ts
it('lookAt: point directly in front of camera has negative z in camera space', () => {
  const eye    = new Vec3(0, 0, 5);
  const target = Vec3.ZERO;
  const view   = Mat4.lookAt(eye, target, Vec3.Y_AXIS);

  const worldPoint = Vec3.ZERO;
  const cameraPoint = view.transformPoint(worldPoint);

  // The origin is 5 units in front of the camera — negative z in camera space:
  expect(cameraPoint.z).toBeLessThan(0);
});
```

**Key insight:** The view matrix is the INVERSE of the camera's model matrix. The camera's
model matrix transforms from camera space to world space. The view matrix goes the other way.
For an orthogonal rotation matrix, the inverse equals the transpose — which is why the
`lookAt` construction transposes the camera axes.

</details>

---

## Final Check

| Transform | What it does | Column-major location |
|---|---|---|
| Translation(x,y,z) | Moves points | m[12], m[13], m[14] |
| Scale(x,y,z) | Scales each axis | m[0], m[5], m[10] (diagonal) |
| RotationY(θ) | Rotates in XZ plane | m[0],m[2],m[8],m[10] |
| T * R * S | Apply S first, R second, T last | Right-to-left |

---

## Quick Check Answers

**1. Translation breaks linearity. Concrete example:**

`T = translate by (5, 0, 0)`.
`a = (1, 0, 0)`, `b = (2, 0, 0)`.
`T(a + b) = T(3, 0, 0) = (8, 0, 0)`.
`T(a) + T(b) = (6, 0, 0) + (7, 0, 0) = (13, 0, 0)`.
`8 ≠ 13` — linearity fails. A linear transformation must satisfy `f(a+b) = f(a) + f(b)`.
Translation does not. Therefore it cannot be represented as a 3×3 matrix multiplication.

**2. Column-major: X-translation is at which index?**

`m[12]` (index 12). In column-major layout, the last column is at indices 12-15.
The translation goes in the last column (column 3): x=m[12], y=m[13], z=m[14].
The identity element m[15] stays 1. This is the OpenGL/WebGL convention; Direct3D uses
row-major where translation is at m[3], m[7], m[11].

**3. `M = T * R * S`. Applied to point P, which transform runs first?**

`S` runs first. Matrix multiplication applies right-to-left: `M * P = T * (R * (S * P))`.
Inner operations apply before outer ones. `S` is rightmost, so it is applied first.
This is the TRS convention: Scale in object space first, Rotate in object space, Translate
to world position. The result: the object is scaled, then rotated around its own centre,
then placed in the world.
