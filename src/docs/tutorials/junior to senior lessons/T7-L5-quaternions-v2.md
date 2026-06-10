# Junior to Senior — T7·L5 — Quaternions

**Prerequisites:** T7·L4 (Coordinate Systems). You understand the transform pipeline.
This lesson teaches quaternions by first showing WHAT GOES WRONG with Euler angles,
then explaining the quaternion MECHANISM — how four numbers encode an axis and angle.

**What this lab adds:**
- Gimbal lock demonstrated step by step — why it happens and what degree of freedom is lost
- The quaternion formula: `q = (cos(θ/2), sin(θ/2)*axis)` — where the half-angle comes from
- Why you compose quaternion rotations with multiplication, not addition
- `slerp`: what "spherical linear interpolation" means geometrically and why lerp is wrong for rotations
- The practical rule: use quaternions, convert to matrix when you need to apply

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Euler angles: yaw (Y-axis) → pitch (X-axis) → roll (Z-axis). After yaw 90°,
>    the pitch and roll axes are now aligned. What two operations are now identical?
> 2. A quaternion `q` represents a rotation. `q.w = cos(θ/2)`. If `q.w = 1`, what
>    is the rotation angle θ? What rotation does this represent?
> 3. `slerp(q1, q2, 0.5)` — is this the same as `lerp(q1, q2, 0.5)` on the raw
>    numbers? Why or why not?
>
> *(Answers at the end of this lab)*

---

## Step 1 — See Gimbal Lock Happen

Before building the solution, experience the problem.

```bash
npx tsx -e "
import { Mat4 } from './src/math/Mat4.js';
import { Vec3 }  from './src/math/Vec3.js';

// An aircraft starts facing +Z.
// We will try to rotate it to face +X by applying Euler rotations.

// Method 1: Yaw 90° around Y, then pitch:
const initialFacing = new Vec3(0, 0, 1);

const afterYaw90 = Mat4.rotationY(Math.PI / 2).transformDirection(initialFacing);
console.log('After yaw 90°:', afterYaw90.x.toFixed(2), afterYaw90.y.toFixed(2), afterYaw90.z.toFixed(2));
// Expect: facing along -X (1, 0, 0) — yaw rotated from +Z to +X

// Now pitch up 90° — but what axis does pitch use?
// Pitch is around the LOCAL X axis. After yaw 90°, local X is now world Z.
const afterPitch90 = Mat4.rotationX(Math.PI / 2).transformDirection(afterYaw90);
console.log('After pitch 90°:', afterPitch90.x.toFixed(2), afterPitch90.y.toFixed(2), afterPitch90.z.toFixed(2));

// Now try roll — but roll is around local Z, which is now world X (same as our facing direction).
// Roll and yaw are now controlling the SAME rotation. We've lost one degree of freedom.
const afterRoll45 = Mat4.rotationZ(Math.PI / 4).transformDirection(afterPitch90);
const afterYaw45  = Mat4.rotationY(Math.PI / 4).transformDirection(afterPitch90);
console.log('After roll 45° and yaw 45° produce the same result?',
  Math.abs(afterRoll45.x - afterYaw45.x) < 0.01 &&
  Math.abs(afterRoll45.y - afterYaw45.y) < 0.01
);
"
```

**You should see:** The two operations (roll and yaw) produce the same or near-identical
results — they have become the same rotation. This is gimbal lock: two axes aligned,
one degree of freedom lost.

---

### Concept: Why Gimbal Lock Happens and What Quaternions Do Differently

**Why Euler angles have gimbal lock:**

Euler angles (yaw/pitch/roll) apply rotations sequentially in a FIXED ORDER. After
rotating around Y (yaw), the X axis used for pitch is NOW IN THE ROTATED FRAME.
Once the rotated X axis coincides with Z, pitch and roll are equivalent — you've lost
the ability to rotate in one direction without affecting another.

**How quaternions avoid it:**

A quaternion represents rotation as a SINGLE AXIS + ANGLE, not as three sequential rotations.
There is only one rotation step — no accumulated axis alignment. You cannot lose a degree of
freedom because there is only ever one degree of freedom in play.

**The formula:** `q = (w, x, y, z)` where:
- `w = cos(θ/2)` — half-angle cosine
- `x = sin(θ/2) * axis.x`
- `y = sin(θ/2) * axis.y`
- `z = sin(θ/2) * axis.z`

**Why half-angle?** Quaternions use double cover — to rotate 360°, the quaternion
must traverse 720° on the unit hypersphere. Half-angle compensates for this: a full
360° rotation uses θ = 360°, so θ/2 = 180°, and the quaternion traverses 360° on the
hypersphere. The math works out consistently.

**You do not need to understand the derivation** to use quaternions correctly. What matters:
- `fromAxisAngle(axis, θ)` creates a rotation quaternion
- `q1.multiply(q2)` composes two rotations (q2 applied first, then q1)
- `q.rotate(v)` applies the rotation to a vector
- `slerp(q1, q2, t)` smoothly interpolates between two rotations

---

## Step 2 — Build the Quaternion Class

Create `src/math/Quaternion.ts`:

```ts
// src/math/Quaternion.ts
import { Vec3 } from './Vec3';

export class Quaternion {
  constructor(
    readonly w: number,  // cos(θ/2) — scalar part
    readonly x: number,  // sin(θ/2) * axis.x
    readonly y: number,  // sin(θ/2) * axis.y
    readonly z: number,  // sin(θ/2) * axis.z
  ) {}

  static identity(): Quaternion {
    // θ = 0: cos(0) = 1, sin(0) = 0 → no rotation:
    return new Quaternion(1, 0, 0, 0);
  }
}
```

Add `fromAxisAngle`:

```ts
static fromAxisAngle(axis: Vec3, angleRad: number): Quaternion {
  // θ/2 because quaternions double-cover the rotation sphere:
  const halfAngle = angleRad / 2;
  const s         = Math.sin(halfAngle);
  const n         = axis.normalise();  // axis must be a unit vector
  return new Quaternion(
    Math.cos(halfAngle),  // w = cos(θ/2)
    n.x * s,              // x = sin(θ/2) * axis.x
    n.y * s,
    n.z * s,
  );
}
```

### SAVE AND TRY — verify the identity rotation:

```bash
npx tsx -e "
import { Quaternion } from './src/math/Quaternion.js';
const id = Quaternion.identity();
console.log('Identity:', id.w, id.x, id.y, id.z);
// Expected: 1 0 0 0

const q90y = Quaternion.fromAxisAngle({x:0,y:1,z:0, normalise:()=>({x:0,y:1,z:0})}, Math.PI/2);
console.log('90° around Y:', q90y.w.toFixed(3), q90y.y.toFixed(3));
// w = cos(45°) ≈ 0.707, y = sin(45°) ≈ 0.707
"
```

Expected: `Identity: 1 0 0 0` and `90° around Y: 0.707 0.707`.

Add `rotate` — apply the quaternion to a vector:

```ts
rotate(v: Vec3): Vec3 {
  // v' = q * [0,v] * q^(-1) — sandwich product
  // For unit quaternions, q^(-1) = conjugate(q)
  // This is computed efficiently using the Rodrigues formula:
  const t = new Vec3(
    2 * (this.y * v.z - this.z * v.y),
    2 * (this.z * v.x - this.x * v.z),
    2 * (this.x * v.y - this.y * v.x),
  );
  return new Vec3(
    v.x + this.w * t.x + (this.y * t.z - this.z * t.y),
    v.y + this.w * t.y + (this.z * t.x - this.x * t.z),
    v.z + this.w * t.z + (this.x * t.y - this.y * t.x),
  );
}
```

Create `src/math/Quaternion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Quaternion } from './Quaternion';
import { Vec3 }       from './Vec3';

function expectVec3Close(a: Vec3, b: Vec3) {
  expect(a.x).toBeCloseTo(b.x, 5);
  expect(a.y).toBeCloseTo(b.y, 5);
  expect(a.z).toBeCloseTo(b.z, 5);
}

describe('Quaternion', () => {

  it('identity does not rotate a vector', () => {
    const v = new Vec3(1, 2, 3);
    expectVec3Close(Quaternion.identity().rotate(v), v);
  });

  it('90° around Y maps +X to -Z', () => {
    // Right-hand rule: 90° yaw maps the +X axis toward -Z:
    const q = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 2);
    expectVec3Close(q.rotate(Vec3.X_AXIS), Vec3.Z_AXIS.negate());
  });

  it('90° around Z maps +X to +Y', () => {
    const q = Quaternion.fromAxisAngle(Vec3.Z_AXIS, Math.PI / 2);
    expectVec3Close(q.rotate(Vec3.X_AXIS), Vec3.Y_AXIS);
  });

  it('rotation preserves vector magnitude', () => {
    const v = new Vec3(3, 4, 0);
    const q = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 3);
    const rotated = q.rotate(v);
    expect(rotated.magnitude()).toBeCloseTo(v.magnitude());
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/math/Quaternion.test.ts
```

Expected: all 4 tests pass.

---

## Step 3 — Add Multiplication and Slerp

### Concept: Slerp — Why Regular Lerp Is Wrong for Rotations

**The problem with lerp:**

```
q1 = rotation A
q2 = rotation B

lerp(q1, q2, 0.5) = (q1 + q2) / 2  ← averages the raw numbers

Problem: the result may not be a unit quaternion.
         Even if it is, it may not follow the shortest arc on the unit sphere.
```

**The geometry of slerp:**

Quaternions live on the surface of a unit 4D sphere (a 3-sphere). Two rotations are
two points on this sphere. The SHORTEST path between them is an arc along the sphere's
surface — not a straight line through the interior.

Slerp (Spherical Linear Interpolation) walks along that arc:
```
slerp(q1, q2, t) = q1 * sin((1-t)θ)/sin(θ)  +  q2 * sin(t*θ)/sin(θ)
where θ = angle between q1 and q2 on the sphere = arccos(q1 · q2)
```

```ts
multiply(other: Quaternion): Quaternion {
  // Hamilton product — composing two rotations:
  // q2 applied first, then q1 (right-to-left, like matrix multiplication)
  return new Quaternion(
    this.w*other.w - this.x*other.x - this.y*other.y - this.z*other.z,
    this.w*other.x + this.x*other.w + this.y*other.z - this.z*other.y,
    this.w*other.y - this.x*other.z + this.y*other.w + this.z*other.x,
    this.w*other.z + this.x*other.y - this.y*other.x + this.z*other.w,
  );
}

static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
  // Dot product = cos of the angle between them on the 4D sphere:
  let dot = a.w*b.w + a.x*b.x + a.y*b.y + a.z*b.z;

  // If dot < 0, b is on the "other side" — negate for shortest arc:
  const bFinal = dot < 0
    ? new Quaternion(-b.w, -b.x, -b.y, -b.z)
    : b;
  dot = Math.abs(dot);

  if (dot > 0.9995) {
    // Nearly identical — linear interpolation avoids division by near-zero sin(θ):
    return new Quaternion(
      a.w + t*(bFinal.w - a.w),
      a.x + t*(bFinal.x - a.x),
      a.y + t*(bFinal.y - a.y),
      a.z + t*(bFinal.z - a.z),
    );
  }

  const theta0    = Math.acos(dot);        // angle between the two quaternions
  const theta     = theta0 * t;            // angle for this interpolation step
  const sinTheta  = Math.sin(theta);
  const sinTheta0 = Math.sin(theta0);

  const s1 = Math.cos(theta) - dot * sinTheta / sinTheta0;
  const s2 = sinTheta / sinTheta0;

  return new Quaternion(
    s1*a.w + s2*bFinal.w,
    s1*a.x + s2*bFinal.x,
    s1*a.y + s2*bFinal.y,
    s1*a.z + s2*bFinal.z,
  );
}
```

Add the slerp tests:

```ts
it('slerp at t=0 returns the first rotation', () => {
  const q1 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, 0);
  const q2 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 2);
  const r  = Quaternion.slerp(q1, q2, 0);
  expectVec3Close(r.rotate(Vec3.X_AXIS), q1.rotate(Vec3.X_AXIS));
});

it('slerp at t=1 returns the second rotation', () => {
  const q1 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, 0);
  const q2 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 2);
  const r  = Quaternion.slerp(q1, q2, 1);
  expectVec3Close(r.rotate(Vec3.X_AXIS), q2.rotate(Vec3.X_AXIS));
});

it('slerp at t=0.5 produces the halfway rotation', () => {
  // 0° to 90° around Y — halfway should be 45°:
  const q1   = Quaternion.fromAxisAngle(Vec3.Y_AXIS, 0);
  const q2   = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 2);
  const half = Quaternion.slerp(q1, q2, 0.5);
  const q45  = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 4);
  expectVec3Close(half.rotate(Vec3.X_AXIS), q45.rotate(Vec3.X_AXIS));
});
```

### SAVE AND TRY

```bash
npx vitest run src/math/Quaternion.test.ts
```

Expected: all 7 tests pass.

---

## 🎯 Challenge: Animate a Rotation Over Time

**You know:** `fromAxisAngle`, `slerp`, `rotate`.

**Task:** Write `animateRotation(startAngle: number, endAngle: number, durationMs: number, currentTimeMs: number): Quaternion`
that returns the interpolated quaternion for the given time.

```ts
// At t=0ms: startAngle rotation
// At t=durationMs: endAngle rotation
// At t=durationMs/2: halfway rotation
```

All rotations are around the Y axis.

Write 3 tests: at t=0, at t=duration, at t=duration/2.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function animateRotation(
  startAngle:   number,
  endAngle:     number,
  durationMs:   number,
  currentTimeMs: number,
): Quaternion {
  const t  = Math.max(0, Math.min(1, currentTimeMs / durationMs));
  const q1 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, startAngle);
  const q2 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, endAngle);
  return Quaternion.slerp(q1, q2, t);
}
```

**Tests:**
```ts
it('at t=0 returns the start rotation', () => {
  const q = animateRotation(0, Math.PI, 1000, 0);
  expectVec3Close(q.rotate(Vec3.X_AXIS), Vec3.X_AXIS);  // 0° rotation
});

it('at t=duration returns the end rotation', () => {
  const q = animateRotation(0, Math.PI, 1000, 1000);
  // 180° around Y flips +X to -X:
  expectVec3Close(q.rotate(Vec3.X_AXIS), Vec3.X_AXIS.negate());
});

it('at t=duration/2 returns 90° rotation (halfway between 0° and 180°)', () => {
  const q = animateRotation(0, Math.PI, 1000, 500);
  // 90° around Y maps +X to -Z:
  expectVec3Close(q.rotate(Vec3.X_AXIS), Vec3.Z_AXIS.negate());
});
```

</details>

---

## Final Check

| Operation | What it does |
|---|---|
| `fromAxisAngle(axis, θ)` | Creates rotation quaternion |
| `q.rotate(v)` | Applies rotation to vector |
| `q1.multiply(q2)` | Composes rotations (q2 first, then q1) |
| `slerp(q1, q2, t)` | Smooth arc interpolation on the rotation sphere |

---

## Quick Check Answers

**1. After yaw 90°, pitch and roll control the same axis. Which two operations?**

After yawing 90°, the aircraft's local pitch axis (originally world X) has rotated to
align with world Z. The aircraft's roll axis (originally world Z) is now world X — wait,
actually after yaw 90°: local X → world Z, local Z → world -X. So pitch (local X rotation)
and roll (local Z rotation) are now controlling rotations around world Z and world -X.
If the aircraft then pitches 90°, local Z aligns with world Y — then roll and yaw both
control Y-axis rotations. They become identical: two controls, one degree of freedom.

**2. `q.w = 1`. What is θ? What rotation?**

`w = cos(θ/2) = 1`. `cos(θ/2) = 1` when `θ/2 = 0°`, so `θ = 0°`. This is the identity
rotation — no rotation at all. The quaternion `(1, 0, 0, 0)` represents "do nothing."

**3. `slerp(q1, q2, 0.5)` vs `lerp` on raw numbers — same?**

No. `lerp` interpolates in a straight LINE through 4D space — the result may not be on
the unit sphere (magnitude ≠ 1 → not a valid rotation). Even if normalised, the path
does not follow the shortest arc. `slerp` explicitly travels along the sphere's surface
using the sine functions, always producing unit quaternions and always taking the shortest
path between two rotations.
