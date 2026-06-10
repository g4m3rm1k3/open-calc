# Junior to Senior — T7·L7 — Perspective vs Orthographic Projection

**Prerequisites:** T7·L6 (Ray Casting). You can trace rays from the camera. This lesson
finalises Topic 7 by explaining HOW the two projection matrices work — what values they
put into the clip space W component and why that determines foreshortening.

**What this lab adds:**
- How the perspective matrix encodes "far things appear smaller" in the W component
- How orthographic skips the W encoding so distances don't affect apparent size
- Why the depth buffer precision problem happens — nonlinear depth distribution
- The concrete formula for how much precision you lose per depth range
- Building and testing both projection matrices

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. After the perspective matrix, a point at distance 10 has W=10. A point at
>    distance 20 has W=20. After dividing by W (perspective divide), what happens
>    to their clip-space X and Y coordinates?
> 2. The orthographic matrix produces W=1 for all points. Why does this mean
>    size is constant regardless of distance?
> 3. Near=0.001, Far=100,000. A point at depth 50,000 and another at depth 50,001.
>    Can the depth buffer distinguish them? Why not?
>
> *(Answers at the end of this lab)*

---

## The Key Difference: What Goes Into W

Both projection matrices transform a camera-space point into clip space.
The key difference is what they put into the W component:

**Perspective:** W = -cameraZ (or +cameraZ depending on convention)
After perspective divide (÷W): objects at larger Z get smaller X, Y → smaller on screen.

**Orthographic:** W = 1 always
After perspective divide (÷1 = nothing): X and Y are unchanged → same size regardless of depth.

This is the entire difference. Everything else follows from this.

---

## Step 1 — See the Difference Numerically

Before building anything, calculate by hand what each projection does to two points —
one near, one far.

```
Two points in camera space:
  Point A: (1, 0, -5)   — 5 units in front of camera, 1 unit to the right
  Point B: (1, 0, -10)  — 10 units in front of camera, 1 unit to the right

PERSPECTIVE projection (60° FOV, 1.0 aspect ratio):
  After perspective matrix:
    A: clip_x ≈ 1.73, clip_w = 5  → NDC_x = 1.73/5  ≈ 0.346
    B: clip_x ≈ 1.73, clip_w = 10 → NDC_x = 1.73/10 ≈ 0.173
  Result: B appears at HALF the x position of A → appears half as wide → smaller object

ORTHOGRAPHIC projection (same extents):
  After orthographic matrix:
    A: clip_x ≈ some_value, clip_w = 1 → NDC_x = clip_x (unchanged by ÷1)
    B: clip_x ≈ same_value, clip_w = 1 → NDC_x = clip_x (same!)
  Result: B at same x position as A → same size → no foreshortening
```

---

## Step 2 — Build the Projection Matrices

Add to `src/math/transforms.ts`:

```ts
// src/math/transforms.ts
import { Mat4 } from './Mat4';

export interface PerspectiveParams {
  fovYRad:     number;    // vertical field of view in radians (e.g., PI/3 = 60°)
  aspectRatio: number;    // viewport width / height (e.g., 800/600 ≈ 1.333)
  near:        number;    // minimum visible distance (e.g., 0.1)
  far:         number;    // maximum visible distance (e.g., 1000)
}

export function makePerspectiveMatrix({
  fovYRad, aspectRatio, near, far,
}: PerspectiveParams): Mat4 {
  // f = 1 / tan(fovY/2) — the "zoom factor"
  // Larger FOV → smaller f → wider view → less zoom
  const f  = 1 / Math.tan(fovYRad / 2);
  const nf = 1 / (near - far);   // used to encode depth

  // Column-major. The perspective matrix's key property:
  // For a point (x, y, z, 1) in camera space, the output W = -z
  // After ÷W: NDC_x = x*f/(-z)*aspectRatio → objects further away (larger z magnitude) appear smaller
  return new Mat4([
    f / aspectRatio, 0,  0,                      0,
    0,               f,  0,                      0,
    0,               0,  (far + near) * nf,      -1,  // ← -1 here puts -z into W
    0,               0,  (2 * far * near) * nf,   0,
  ]);
}

export interface OrthographicParams {
  left:   number;   // e.g., -10
  right:  number;   // e.g.,  10
  bottom: number;   // e.g., -10
  top:    number;   // e.g.,  10
  near:   number;   // e.g., -100 (orthographic near can be negative)
  far:    number;   // e.g.,  100
}

export function makeOrthographicMatrix({
  left, right, bottom, top, near, far,
}: OrthographicParams): Mat4 {
  // The orthographic matrix scales and translates each axis to fit in the [-1,1] NDC box.
  // Critically: W = 1 always — no perspective divide effect.
  const rml = right - left;
  const tmb = top   - bottom;
  const fmn = far   - near;

  return new Mat4([
    2/rml, 0,     0,     0,
    0,     2/tmb, 0,     0,
    0,     0,    -2/fmn, 0,   // ← W column is (0,0,0,1) → W always = 1
    -(right+left)/rml, -(top+bottom)/tmb, -(far+near)/fmn, 1,
  ]);
}
```

### SAVE AND TRY

```bash
npx tsx -e "
import { makePerspectiveMatrix } from './src/math/transforms.js';
import { Vec3 } from './src/math/Vec3.js';
import { Mat4 } from './src/math/Mat4.js';

const proj = makePerspectiveMatrix({ fovYRad: Math.PI/3, aspectRatio: 1, near: 0.1, far: 100 });

// Two points: same x=1, different depths:
const near_pt = new Vec3(1, 0, -5);
const far_pt  = new Vec3(1, 0, -10);

// Apply projection manually to see the W values:
const m = proj.m;
function applyProj(v) {
  const x = m[0]*v.x + m[4]*v.y + m[8]*v.z  + m[12];
  const y = m[1]*v.x + m[5]*v.y + m[9]*v.z  + m[13];
  const w = m[3]*v.x + m[7]*v.y + m[11]*v.z + m[15];
  return { ndcX: (x/w).toFixed(3), w: w.toFixed(2) };
}

console.log('Near point (z=-5):', applyProj(near_pt));
console.log('Far  point (z=-10):', applyProj(far_pt));
"
```

**You should see** that the far point has a smaller NDC x value than the near point —
demonstrating that the far object appears smaller. The W values should be different
(≈5 and ≈10), and dividing by W shrinks the far object.

---

## Step 3 — Test That Shows the Difference

Create `src/math/transforms.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Mat4 } from './Mat4';
import { Vec3 }  from './Vec3';
import { makePerspectiveMatrix, makeOrthographicMatrix } from './transforms';

function projectPoint(mat: Mat4, v: Vec3): { ndcX: number; ndcY: number; ndcZ: number } {
  const m = mat.m;
  const x = m[0]*v.x + m[4]*v.y + m[8]*v.z  + m[12];
  const y = m[1]*v.x + m[5]*v.y + m[9]*v.z  + m[13];
  const z = m[2]*v.x + m[6]*v.y + m[10]*v.z + m[14];
  const w = m[3]*v.x + m[7]*v.y + m[11]*v.z + m[15];
  return { ndcX: x/w, ndcY: y/w, ndcZ: z/w };
}

describe('Projection matrices', () => {

  it('perspective: farther object appears smaller (smaller NDC x)', () => {
    const proj = makePerspectiveMatrix({ fovYRad: Math.PI/3, aspectRatio: 1, near: 0.1, far: 100 });

    // Both points have x=1 in camera space, different depths:
    const near = projectPoint(proj, new Vec3(1, 0, -5));
    const far  = projectPoint(proj, new Vec3(1, 0, -10));

    // The far point should appear at half the NDC x of the near point:
    expect(far.ndcX).toBeLessThan(near.ndcX);
    expect(far.ndcX).toBeCloseTo(near.ndcX / 2, 2);   // twice as far → half the size
  });

  it('orthographic: same NDC x regardless of depth', () => {
    const ortho = makeOrthographicMatrix({ left:-10, right:10, bottom:-10, top:10, near:-100, far:100 });

    // Both points have x=5 in camera space, different depths:
    const near = projectPoint(ortho, new Vec3(5, 0, -5));
    const far  = projectPoint(ortho, new Vec3(5, 0, -50));

    // Orthographic: depth doesn't affect x position:
    expect(far.ndcX).toBeCloseTo(near.ndcX, 5);
  });

  it('perspective: origin (0,0,0) in camera space maps to (0,0) in NDC', () => {
    const proj = makePerspectiveMatrix({ fovYRad: Math.PI/3, aspectRatio: 1, near: 0.1, far: 100 });
    // A point directly in front of the camera (at x=0, y=0):
    const centre = projectPoint(proj, new Vec3(0, 0, -1));
    expect(centre.ndcX).toBeCloseTo(0);
    expect(centre.ndcY).toBeCloseTo(0);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/math/transforms.test.ts
```

Expected: all 3 tests pass.

**Change something:** Change `new Vec3(1, 0, -10)` to `new Vec3(1, 0, -20)` in the
perspective test. Expected: `far.ndcX` should now be approximately `near.ndcX / 4`
(four times as far → one-quarter the apparent size). Verify the proportionality.

---

### Concept: Depth Buffer Precision — Why Near/Far Values Matter

**The problem:**

The depth buffer stores one number per pixel — the NDC Z coordinate (0 to 1). The
distribution of NDC Z values is NON-LINEAR for perspective projection:

```
Camera-space Z:  0.1  0.5   1    5    10   100  10,000
NDC Z:           0.0  0.08  0.1  0.45  0.72  0.99  0.9999
```

Most of the depth buffer precision is used in the NEAR RANGE (close to the camera),
and almost none is left for the FAR range. This is why:

```
near = 0.1, far = 10,000
NDC precision for Z=5,000 to Z=5,001 (1 unit apart at mid-distance):
   Both map to approximately NDC Z ≈ 0.9999
   Cannot distinguish → z-fighting (flickering artifacts)

near = 1.0, far = 1,000
NDC precision for Z=500 to Z=501:
   Maps to approximately different values → distinguishable
```

**The rule:** Set `near` as LARGE as possible and `far` as SMALL as possible.
The ratio `far/near` determines the precision budget:
- `far/near = 10,000/0.001 = 10,000,000` → terrible precision at mid-distance
- `far/near = 1000/0.1 = 10,000` → much better

**For the CAD/CAM viewport (workpiece ~600mm):**
```ts
const projection = makePerspectiveMatrix({
  fovYRad:     Math.PI / 4,    // 45° — less distortion for engineering work
  aspectRatio: width / height,
  near:        0.1,            // 0.1mm — nothing smaller is relevant
  far:         2000,           // 2000mm — larger than any workpiece
  // ratio = 20,000 — reasonable precision throughout the work volume
});
```

---

## 🎯 Challenge: Compare Depth Buffer Usage

**You know:** Projection matrices, NDC Z values, non-linear depth.

**Task:** Write `computeNdcDepth(cameraZ: number, near: number, far: number): number`
that computes the NDC Z value using the perspective projection formula:

```
NDC_Z = (far + near) / (near - far)  +  (2 * far * near) / ((near - far) * cameraZ)
```

Then write a test that demonstrates the non-linear distribution by checking that:
- The near half of the depth range (near to (near+far)/2) uses more than 90% of the NDC range
- The far half uses less than 10%

---

<details>
<summary>▶ Show Solution</summary>

```ts
function computeNdcDepth(cameraZ: number, near: number, far: number): number {
  // cameraZ is negative in OpenGL convention (camera looks down -Z)
  // This formula comes directly from the perspective matrix's Z row:
  const A = (far + near) / (near - far);
  const B = (2 * far * near) / (near - far);
  return A + B / cameraZ;  // cameraZ is negative, so B/cameraZ is negative/positive
}
```

**Tests:**
```ts
it('near half of depth uses more than 90% of NDC precision', () => {
  const near = 0.1, far = 1000;
  const midZ = -(near + far) / 2;  // halfway between near and far (in camera space, negative)

  const ndcAtNear = computeNdcDepth(-near, near, far);
  const ndcAtMid  = computeNdcDepth(midZ, near, far);
  const ndcAtFar  = computeNdcDepth(-far, near, far);

  const totalRange = ndcAtFar - ndcAtNear;
  const nearHalf   = ndcAtMid - ndcAtNear;  // NDC range used by z=0.1 to z=500

  // The near half of camera-space depth uses most of the NDC range:
  expect(nearHalf / totalRange).toBeGreaterThan(0.9);
});
```

**Key insight:** The non-linearity means that `near=0.001` with `far=10000` is catastrophic
for depth precision — 99.99% of the NDC range is used in the first 1% of camera-space depth.
This is why "set near as large as possible" is a critical rule for avoiding z-fighting.

</details>

---

## Final Check

| | Perspective | Orthographic |
|---|---|---|
| W component | W = -cameraZ | W = 1 |
| Effect | Far things appear smaller | Same size at all distances |
| Use for | Games, 3D visualisation | CAD, engineering, 2D rendering |
| FOV parameter | Yes — controls zoom | No — uses extents (width/height) |

---

## Quick Check Answers

**1. Point at W=10 vs W=20 after perspective divide. What happens to their X,Y?**

After dividing by W: if both have the same clip_x (e.g., both have x=1.73 in clip space),
then NDC_x = 1.73/10 = 0.173 vs NDC_x = 1.73/20 = 0.0865. The farther point (W=20)
has HALF the NDC x coordinate, appearing at half the screen position — it looks
half as far from the centre — meaning the object appears half as wide. This is perspective foreshortening.

**2. Orthographic produces W=1. Why is size constant?**

After ÷W = ÷1, nothing changes. The clip-space X and Y values ARE the NDC values.
Since the projection matrix maps world coordinates directly to clip space without
encoding any depth-dependent scaling into W, the NDC position is independent of depth.
A cube at distance 5 and an identical cube at distance 50 produce the same clip_x, clip_y,
and therefore appear at the same screen size.

**3. Near=0.001, Far=100,000. Can the depth buffer distinguish depth 50,000 from 50,001?**

Almost certainly not. The perspective depth mapping is non-linear: 99.999% of the 0-1
NDC Z range is consumed by the camera-space range from 0.001 to ≈50 units. The remaining
0.001% of NDC Z covers 0.001 to 100,000 units. Two points 1 unit apart at depth 50,000
both map to NDC Z ≈ 0.9999... — the same value in a 24-bit depth buffer. They z-fight.
Setting near=1.0 and far=10,000 dramatically improves precision.
