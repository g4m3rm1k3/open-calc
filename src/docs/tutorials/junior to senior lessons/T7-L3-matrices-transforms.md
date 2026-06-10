# Junior to Senior — T7·L3 — Matrices and Transforms

**Prerequisites:** T7·L2 (Dot and Cross Product). You understand vector products.
This lesson introduces 4×4 matrices — the compact representation of any
combination of translation, rotation, and scale in 3D space.

**What this lab adds:**
- Why 4×4 instead of 3×3: translation requires the extra dimension
- Model, view, and projection matrices — the three transforms in 3D rendering
- Composing transforms by multiplying matrices
- Why order matters: TRS vs SRT produce different results
- Homogeneous coordinates: the `w` component

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. To move a point 5 units along X, you add `(5, 0, 0)` to it. Why can't this
>    be done with a 3×3 matrix multiplication?
> 2. `M = Scale * Rotate * Translate` vs `M = Translate * Rotate * Scale` —
>    these produce different results. Without running code, which would you use
>    to "rotate an object around its own centre, then place it in the world"?
> 3. A 4×4 transformation matrix `M` transforms world coordinates to camera
>    coordinates. What does `M⁻¹` do?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `Mat4` class that represents a 4×4 transformation matrix, and pure functions
for building translation, rotation, and scale matrices:

```ts
const model = Mat4.translation(5, 0, 0)
  .multiply(Mat4.rotationY(Math.PI / 4))
  .multiply(Mat4.scale(2, 2, 2));

const worldPoint  = new Vec3(1, 0, 0);
const transformed = model.transformPoint(worldPoint);
```

---

### Concept: Homogeneous Coordinates

**Why 4×4?** In 3D, translation cannot be represented as a matrix multiplication
of a 3D vector — addition is not linear in the way matrix multiplication is.

The trick: add a fourth component `w`. For a point, `w = 1`. For a direction
(vector), `w = 0`. Then translation becomes a matrix multiplication:

```
[x']   [1 0 0 tx] [x]   [x + tx*w]
[y'] = [0 1 0 ty] [y] = [y + ty*w]
[z']   [0 0 1 tz] [z]   [z + tz*w]
[w']   [0 0 0  1] [w]   [w       ]
```

For a point (w=1): x' = x + tx, y' = y + ty. Translation applied. ✓
For a direction (w=0): x' = x, y' = y. No translation. ✓

This is why directions (normals, ray directions) are not affected by translation —
their `w` is 0.

---

### Concept: The Transform Pipeline

Every point in a 3D scene goes through three matrix transforms:

```
Object space → [Model matrix] → World space → [View matrix] → Camera space → [Projection matrix] → Clip space
```

**Model matrix:** Positions a mesh in the world. Contains the object's
translation, rotation, and scale. `M = T * R * S` (TRS order — scale first, then rotate, then translate).

**View matrix:** Converts world coordinates to camera-relative coordinates.
It is the inverse of the camera's model matrix.

**Projection matrix:** Converts the camera's 3D space to 2D clip coordinates,
applying perspective (objects further away appear smaller) or orthographic
(no foreshortening) projection.

---

### Concept: Matrix Multiplication and Order

Matrix multiplication is not commutative: `A * B ≠ B * A` (usually).

```
Translate(5,0,0) * Rotate(Y, 45°):  rotate first, then translate in world space
Rotate(Y, 45°)  * Translate(5,0,0): translate in object space (along the rotated X axis), then rotate
```

**The standard TRS order:** `M = T * R * S`

When you multiply a point by M, the operations apply right to left: scale first,
then rotate, then translate. This is the natural "build an object in its own
space, then place it in the world" order.

```ts
// Object is 2× bigger (scale), facing a direction (rotate), placed at position (translate):
const model = Mat4.translation(5, 0, 0)
  .multiply(Mat4.rotationY(Math.PI / 4))
  .multiply(Mat4.scale(2, 2, 2));
// Applied to a point: scale → rotate → translate (right to left)
```

---

## Step 1 — Build `Mat4`

Create `src/math/Mat4.ts`:

```ts
import { Vec3 } from './Vec3';

/**
 * Column-major 4×4 matrix.
 * Stored as m[col][row]: m[0] = first column, etc.
 * This matches Three.js, OpenGL, and WebGL conventions.
 */
export class Mat4 {
  readonly m: readonly number[];  // 16 elements, column-major

  constructor(m: readonly number[]) {
    if (m.length !== 16) throw new Error('Mat4 requires exactly 16 elements');
    this.m = m;
  }

  static identity(): Mat4 {
    return new Mat4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  static translation(x: number, y: number, z: number): Mat4 {
    // Column-major: translation goes in column 3 (indices 12, 13, 14):
    return new Mat4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1,
    ]);
  }

  static scale(x: number, y: number, z: number): Mat4 {
    return new Mat4([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1,
    ]);
  }

  static rotationX(rad: number): Mat4 {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Mat4([
      1,  0,  0, 0,
      0,  c,  s, 0,
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

  multiply(other: Mat4): Mat4 {
    const a = this.m;
    const b = other.m;
    const r = new Array(16).fill(0);

    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          // Column-major: a[k*4+row] is row 'row', column 'k' of matrix a
          sum += a[k * 4 + row] * b[col * 4 + k];
        }
        r[col * 4 + row] = sum;
      }
    }

    return new Mat4(r);
  }

  // Transform a point (w=1) — translation applies:
  transformPoint(v: Vec3): Vec3 {
    const m = this.m;
    const x = m[0]*v.x + m[4]*v.y + m[8]*v.z  + m[12];
    const y = m[1]*v.x + m[5]*v.y + m[9]*v.z  + m[13];
    const z = m[2]*v.x + m[6]*v.y + m[10]*v.z + m[14];
    const w = m[3]*v.x + m[7]*v.y + m[11]*v.z + m[15];
    return new Vec3(x/w, y/w, z/w);   // perspective divide (w=1 for affine transforms)
  }

  // Transform a direction (w=0) — translation does NOT apply:
  transformDirection(v: Vec3): Vec3 {
    const m = this.m;
    return new Vec3(
      m[0]*v.x + m[4]*v.y + m[8]*v.z,
      m[1]*v.x + m[5]*v.y + m[9]*v.z,
      m[2]*v.x + m[6]*v.y + m[10]*v.z,
    );
  }
}
```

---

## Step 2 — Write Tests

Create `src/math/Mat4.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Mat4 }  from './Mat4';
import { Vec3 }  from './Vec3';

const closeVec = (a: Vec3, b: Vec3) => {
  expect(a.x).toBeCloseTo(b.x, 5);
  expect(a.y).toBeCloseTo(b.y, 5);
  expect(a.z).toBeCloseTo(b.z, 5);
};

describe('Mat4', () => {

  it('identity transform leaves a point unchanged', () => {
    const p = new Vec3(3, 4, 5);
    closeVec(Mat4.identity().transformPoint(p), p);
  });

  it('translation moves a point by the given offset', () => {
    const p      = new Vec3(1, 1, 1);
    const result = Mat4.translation(5, 0, 0).transformPoint(p);
    closeVec(result, new Vec3(6, 1, 1));
  });

  it('translation does NOT move a direction (w=0)', () => {
    const d      = Vec3.X_AXIS;
    const result = Mat4.translation(5, 3, 7).transformDirection(d);
    closeVec(result, Vec3.X_AXIS);
  });

  it('scale multiplies each component', () => {
    const result = Mat4.scale(2, 3, 4).transformPoint(new Vec3(1, 1, 1));
    closeVec(result, new Vec3(2, 3, 4));
  });

  it('rotationY by π/2 maps +X to -Z', () => {
    const result = Mat4.rotationY(Math.PI / 2).transformDirection(Vec3.X_AXIS);
    closeVec(result, Vec3.Z_AXIS.negate());
  });

  it('rotationZ by π/2 maps +X to +Y', () => {
    const result = Mat4.rotationZ(Math.PI / 2).transformDirection(Vec3.X_AXIS);
    closeVec(result, Vec3.Y_AXIS);
  });

  it('identity * M = M', () => {
    const T = Mat4.translation(1, 2, 3);
    const combined = Mat4.identity().multiply(T);
    const p = new Vec3(0, 0, 0);
    closeVec(combined.transformPoint(p), T.transformPoint(p));
  });

  it('TRS order: scale first, rotate second, translate last', () => {
    // A point at (1, 0, 0) scaled by 2, then placed at (5, 0, 0):
    const M = Mat4.translation(5, 0, 0).multiply(Mat4.scale(2, 2, 2));
    const result = M.transformPoint(new Vec3(1, 0, 0));
    closeVec(result, new Vec3(7, 0, 0));  // (1*2) + 5 = 7
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Add `lookAt`

**You know:** Matrix multiplication, normalise, cross product.

**Task:** Implement `Mat4.lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4` — the
view matrix for a camera positioned at `eye`, looking at `target`, with `up` as
the up direction.

Algorithm:
1. `forward = normalise(target - eye)`
2. `right = normalise(forward × up)`
3. `cameraUp = right × forward`
4. Construct the view matrix from these three axes

Write 2 tests before implementing.

Try for at least 15 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

**Tests:**
```ts
it('lookAt: camera at origin looking down -Z puts the forward axis at -Z', () => {
  const view    = Mat4.lookAt(Vec3.ZERO, Vec3.Z_AXIS.negate(), Vec3.Y_AXIS);
  const forward = view.transformDirection(Vec3.Z_AXIS.negate());
  // In view space, forward should still be -Z:
  expect(forward.z).toBeLessThan(0);
});

it('lookAt camera origin, a point directly ahead appears in front', () => {
  const eye    = new Vec3(0, 0, 5);
  const target = new Vec3(0, 0, 0);
  const view   = Mat4.lookAt(eye, target, Vec3.Y_AXIS);
  const p      = new Vec3(0, 0, 0);
  const viewP  = view.transformPoint(p);
  expect(viewP.z).toBeLessThan(0);  // in front of camera (negative Z in view space)
});
```

**Implementation:**
```ts
static lookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const forward = target.sub(eye).normalise();
  const right   = forward.cross(up).normalise();
  const camUp   = right.cross(forward);

  // View matrix = rotation part transposed, then translation:
  return new Mat4([
    right.x,              camUp.x,              -forward.x,             0,
    right.y,              camUp.y,              -forward.y,             0,
    right.z,              camUp.z,              -forward.z,             0,
    -right.dot(eye),      -camUp.dot(eye),       forward.dot(eye),      1,
  ]);
}
```

</details>

---

## Final Check

| Transform | Column-major elements | Effect |
|---|---|---|
| Identity | Diagonal = 1, rest 0 | No change |
| Translation(x,y,z) | Last column = (x,y,z,1) | Moves point |
| Scale(x,y,z) | Diagonal = (x,y,z,1) | Scales each axis |
| TRS order | `T * R * S` | Scale first, rotate, then translate |

---

## Quick Check Answers

**1. Translation can't be done with 3×3 matrix multiplication — why?**

A 3×3 matrix can represent linear transformations: rotation, scale, shear.
Translation is NOT a linear transformation — `f(x + y) ≠ f(x) + f(y)` for translation.
Adding a 4th component (w=1 for points, w=0 for directions) converts translation to
matrix multiplication: the translation terms multiply by w=1 for points, and by w=0
for directions (no translation for directions). This is the purpose of homogeneous coordinates.

**2. "Rotate around own centre, then place in world" — which matrix order?**

`M = T * R * S` (or just `M = T * R` if scale is 1). When you multiply a point by M,
operations apply right to left: scale first (sizing in object space), rotate (spin around
the object's origin), then translate (move to world position). This gives "rotate around
own centre" because the rotation happens BEFORE the translation to world space.
`M = R * T` would translate first (move away from origin) then rotate around the world
origin — the object would orbit rather than spin in place.

**3. `M` transforms world to camera. What does `M⁻¹` do?**

`M⁻¹` transforms camera coordinates back to world coordinates. If M is the view matrix
(world → camera space), then `M⁻¹` is the camera's model matrix (camera's position and
orientation in world space). This is used in ray casting: to cast a ray from screen space
through the scene, you invert the projection and view matrices to find the world-space ray
origin and direction.
