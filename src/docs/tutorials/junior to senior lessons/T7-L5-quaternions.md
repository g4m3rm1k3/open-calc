# Junior to Senior — T7·L5 — Quaternions

**Prerequisites:** T7·L4 (Coordinate Systems). You understand the transform pipeline.
This lesson covers quaternions — the rotation representation that avoids gimbal lock.

**What this lab adds:**
- Gimbal lock: why Euler angles fail for arbitrary rotations
- Quaternion: encodes axis + angle in four numbers
- Composing rotations: multiply quaternions (non-commutative)
- `slerp`: smooth spherical interpolation between rotations
- How to use quaternions without deriving the math

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You rotate an aircraft: yaw 90°, then pitch 90°. One axis is now aligned with
>    another — you've lost a degree of freedom. What is this called?
> 2. `q1 * q2` vs `q2 * q1` — are they the same rotation?
> 3. You want to animate a camera rotating from orientation A to orientation B
>    over 1 second. Why not interpolate the Euler angles directly?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `Quaternion` class that handles 3D rotations without gimbal lock:

```ts
// Rotate 90° around Y axis:
const q = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 2);

// Apply to a vector:
const rotated = q.rotate(Vec3.X_AXIS);  // Vec3(0, 0, -1) — X → -Z

// Compose two rotations:
const q2 = Quaternion.fromAxisAngle(Vec3.X_AXIS, Math.PI / 2);
const combined = q.multiply(q2);

// Smooth interpolation:
const halfway = Quaternion.slerp(q, q2, 0.5);
```

---

### Concept: Gimbal Lock

**What it is:** When using three Euler angles (yaw/pitch/roll or X/Y/Z rotations),
applying them in a fixed order can align two rotation axes — losing a degree of freedom.

**The problem in practice:** A camera using Euler angles can "lock up" and be unable
to rotate in a particular direction. Animating between two Euler angle sets can
produce unexpected spins and flips (the "shortest path" is not obvious for angles).

**The solution:** Store rotation as a quaternion (axis + angle). Quaternions have
no gimbal lock — any rotation can be represented and composed without degenerate states.

---

### Concept: What a Quaternion Is

**The math:** A quaternion is `q = w + xi + yj + zk` where `i`, `j`, `k` are
imaginary units. For rotations, `q = (w, x, y, z)` where:
- `w = cos(θ/2)` — the "scalar" part
- `(x, y, z) = sin(θ/2) * axis` — the "vector" part (axis scaled by half-angle sine)

**You do not need to understand the algebra.** You only need to know:
- Create from axis + angle: `Quaternion.fromAxisAngle(axis, angle)`
- Rotate a vector: `q.rotate(v)`
- Compose rotations: `q1.multiply(q2)` — q2 applied first, then q1
- Interpolate: `Quaternion.slerp(q1, q2, t)`
- Unit quaternions represent pure rotations (magnitude = 1)

---

## Step 1 — Implement `Quaternion`

Create `src/math/Quaternion.ts`:

```ts
import { Vec3 } from './Vec3';

export class Quaternion {
  constructor(
    readonly w: number,
    readonly x: number,
    readonly y: number,
    readonly z: number,
  ) {}

  static identity(): Quaternion {
    return new Quaternion(1, 0, 0, 0);
  }

  static fromAxisAngle(axis: Vec3, angleRad: number): Quaternion {
    const halfAngle = angleRad / 2;
    const s         = Math.sin(halfAngle);
    const n         = axis.normalise();
    return new Quaternion(
      Math.cos(halfAngle),
      n.x * s, n.y * s, n.z * s,
    );
  }

  multiply(other: Quaternion): Quaternion {
    // Hamilton product:
    return new Quaternion(
      this.w*other.w - this.x*other.x - this.y*other.y - this.z*other.z,
      this.w*other.x + this.x*other.w + this.y*other.z - this.z*other.y,
      this.w*other.y - this.x*other.z + this.y*other.w + this.z*other.x,
      this.w*other.z + this.x*other.y - this.y*other.x + this.z*other.w,
    );
  }

  conjugate(): Quaternion {
    return new Quaternion(this.w, -this.x, -this.y, -this.z);
  }

  magnitude(): number {
    return Math.sqrt(this.w**2 + this.x**2 + this.y**2 + this.z**2);
  }

  normalise(): Quaternion {
    const m = this.magnitude();
    return new Quaternion(this.w/m, this.x/m, this.y/m, this.z/m);
  }

  rotate(v: Vec3): Vec3 {
    // Efficient rotation: v' = q * [0,v] * q*
    const vq = new Quaternion(0, v.x, v.y, v.z);
    const r  = this.multiply(vq).multiply(this.conjugate());
    return new Vec3(r.x, r.y, r.z);
  }

  toEuler(): { x: number; y: number; z: number } {
    const { w, x, y, z } = this;
    const sinrCosp =  2 * (w*x + y*z);
    const cosrCosp =  1 - 2 * (x*x + y*y);
    const sinp     =  2 * (w*y - z*x);
    const sinyCosp =  2 * (w*z + x*y);
    const cosyCosp =  1 - 2 * (y*y + z*z);
    return {
      x: Math.atan2(sinrCosp, cosrCosp),
      y: Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI/2 : Math.asin(sinp),
      z: Math.atan2(sinyCosp, cosyCosp),
    };
  }

  static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    let dot = a.w*b.w + a.x*b.x + a.y*b.y + a.z*b.z;

    // If dot < 0, negate b to take the shorter arc:
    const target = dot < 0 ? new Quaternion(-b.w, -b.x, -b.y, -b.z) : b;
    dot = Math.abs(dot);

    if (dot > 0.9995) {
      // Nearly identical — linear interpolation to avoid division by near-zero:
      return new Quaternion(
        a.w + t*(target.w - a.w),
        a.x + t*(target.x - a.x),
        a.y + t*(target.y - a.y),
        a.z + t*(target.z - a.z),
      ).normalise();
    }

    const theta0    = Math.acos(dot);
    const theta     = theta0 * t;
    const sinTheta0 = Math.sin(theta0);
    const sinTheta  = Math.sin(theta);

    const s1 = Math.cos(theta) - dot * sinTheta / sinTheta0;
    const s2 = sinTheta / sinTheta0;

    return new Quaternion(
      s1*a.w + s2*target.w,
      s1*a.x + s2*target.x,
      s1*a.y + s2*target.y,
      s1*a.z + s2*target.z,
    ).normalise();
  }
}
```

---

## Step 2 — Write Tests

Create `src/math/Quaternion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Quaternion } from './Quaternion';
import { Vec3 }       from './Vec3';

const close = (a: Vec3, b: Vec3, digits = 5) => {
  expect(a.x).toBeCloseTo(b.x, digits);
  expect(a.y).toBeCloseTo(b.y, digits);
  expect(a.z).toBeCloseTo(b.z, digits);
};

describe('Quaternion', () => {

  it('identity does not rotate a vector', () => {
    const v = new Vec3(1, 2, 3);
    close(Quaternion.identity().rotate(v), v);
  });

  it('90° rotation around Y maps +X to -Z', () => {
    const q = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 2);
    close(q.rotate(Vec3.X_AXIS), Vec3.Z_AXIS.negate());
  });

  it('90° rotation around Z maps +X to +Y', () => {
    const q = Quaternion.fromAxisAngle(Vec3.Z_AXIS, Math.PI / 2);
    close(q.rotate(Vec3.X_AXIS), Vec3.Y_AXIS);
  });

  it('180° rotation around Z maps +X to -X', () => {
    const q = Quaternion.fromAxisAngle(Vec3.Z_AXIS, Math.PI);
    close(q.rotate(Vec3.X_AXIS), Vec3.X_AXIS.negate());
  });

  it('rotation preserves vector magnitude', () => {
    const v       = new Vec3(3, 4, 0);
    const q       = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 3);
    const rotated = q.rotate(v);
    expect(rotated.magnitude()).toBeCloseTo(v.magnitude());
  });

  it('slerp at t=0 returns the first quaternion', () => {
    const q1 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, 0);
    const q2 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 2);
    const r  = Quaternion.slerp(q1, q2, 0);
    close(r.rotate(Vec3.X_AXIS), q1.rotate(Vec3.X_AXIS));
  });

  it('slerp at t=1 returns the second quaternion', () => {
    const q1 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, 0);
    const q2 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 2);
    const r  = Quaternion.slerp(q1, q2, 1);
    close(r.rotate(Vec3.X_AXIS), q2.rotate(Vec3.X_AXIS));
  });

  it('slerp at t=0.5 produces the halfway rotation', () => {
    // Rotating from 0° to 90° around Y — halfway should be 45°:
    const q1     = Quaternion.fromAxisAngle(Vec3.Y_AXIS, 0);
    const q2     = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 2);
    const q45    = Quaternion.slerp(q1, q2, 0.5);
    const q45ref = Quaternion.fromAxisAngle(Vec3.Y_AXIS, Math.PI / 4);
    close(q45.rotate(Vec3.X_AXIS), q45ref.rotate(Vec3.X_AXIS));
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Animate a Rotation

**You know:** `slerp`, `fromAxisAngle`, `rotate`.

**Task:** Write `animateRotation(startAngle, endAngle, duration, currentTime)` that
returns the interpolated quaternion at the given time. The rotation is around the Y axis.

```ts
// At t=0: startAngle. At t=duration: endAngle. Smooth in between.
const q = animateRotation(0, Math.PI, 2000, 1000);  // halfway through
// The rotated +X axis should be pointing along -X (180° rotation)
// At halfway (90°), it should be pointing along -Z
```

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function animateRotation(
  startAngle:  number,
  endAngle:    number,
  duration:    number,
  currentTime: number,
): Quaternion {
  const t  = Math.max(0, Math.min(1, currentTime / duration));
  const q1 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, startAngle);
  const q2 = Quaternion.fromAxisAngle(Vec3.Y_AXIS, endAngle);
  return Quaternion.slerp(q1, q2, t);
}
```

**Tests:**
```ts
it('at t=0 returns start rotation', () => {
  const q = animateRotation(0, Math.PI, 1000, 0);
  close(q.rotate(Vec3.X_AXIS), Vec3.X_AXIS);
});

it('at t=duration returns end rotation', () => {
  const q = animateRotation(0, Math.PI, 1000, 1000);
  close(q.rotate(Vec3.X_AXIS), Vec3.X_AXIS.negate());
});

it('at t=half returns the midpoint rotation', () => {
  const q = animateRotation(0, Math.PI, 1000, 500);
  // Halfway = 90° = pointing along -Z:
  close(q.rotate(Vec3.X_AXIS), Vec3.Z_AXIS.negate());
});
```

</details>

---

## Final Check

| Operation | What it does |
|---|---|
| `fromAxisAngle(axis, angle)` | Creates a rotation quaternion |
| `q.rotate(v)` | Applies the rotation to a vector |
| `q1.multiply(q2)` | Composes rotations (q2 first, then q1) |
| `q.conjugate()` | The inverse rotation |
| `slerp(q1, q2, t)` | Smooth interpolation between rotations |

---

## Quick Check Answers

**1. Yaw 90°, pitch 90° → lose a degree of freedom. What is this?**

Gimbal lock. After yaw 90°, the pitch axis has rotated to align with the roll axis.
You now have two rotation axes pointing the same direction — one degree of freedom is
lost. You can no longer roll without also yawing. Quaternions avoid this because they
encode rotation as a single axis + angle — there are no intermediate rotation axes
to misalign.

**2. `q1 * q2` vs `q2 * q1` — same rotation?**

No — quaternion multiplication is not commutative. `q1 * q2` applies q2 first, then
q1 (right-to-left, like matrix multiplication). `q2 * q1` applies q1 first, then q2.
Rotating 90° around X then 90° around Y is different from 90° around Y then 90° around X.
Order matters.

**3. Animating between Euler angles — why not interpolate directly?**

Euler angle interpolation produces incorrect paths and can go "the long way around."
If A = (0°, 0°, 0°) and B = (0°, 350°, 0°), linearly interpolating to 175° rotation
is wrong — the correct shortest path is -5° (going backward through 350° → 0°).
Slerp always takes the shortest arc on the unit quaternion sphere, producing smooth
and correct rotation animation. Euler angle interpolation also cannot handle gimbal lock
configurations correctly.
