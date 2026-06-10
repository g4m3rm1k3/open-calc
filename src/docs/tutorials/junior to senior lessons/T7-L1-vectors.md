# Junior to Senior — T7·L1 — Vectors

**Prerequisites:** T6·L8 (Frontend Testing). You can build and test a full
React application. This lesson starts Topic 7 — the 3D math required to work
with Three.js and eventually to build the CAD/CAM viewport.

**What this lab adds:**
- Vector: a magnitude and direction, represented as `(x, y, z)`
- Addition, subtraction, scalar multiplication
- Magnitude and normalisation
- Why normalised vectors are used for directions

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have two points `A = (1, 2, 3)` and `B = (4, 6, 3)`. What is the
>    vector pointing FROM A TO B?
> 2. A normalised vector has magnitude 1. What does normalising `(3, 0, 0)` produce?
> 3. You scale a direction vector by 5 (`5 * v`). Does the direction change?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `Vec3` class — a 3D vector implementation with tests, used as the foundation
for all 3D math in the curriculum:

```ts
const a = new Vec3(1, 0, 0);
const b = new Vec3(0, 1, 0);

a.add(b)         // Vec3(1, 1, 0)
a.scale(5)       // Vec3(5, 0, 0)
a.magnitude()    // 1
a.normalise()    // Vec3(1, 0, 0) — already unit length
b.sub(a)         // Vec3(-1, 1, 0)
a.dot(b)         // 0 — perpendicular
```

---

### Concept: Vectors vs Points

**A point** is a position in space. `P = (3, 4, 0)` is 3 units along X, 4 along Y.

**A vector** is a displacement — a magnitude and direction. `v = (3, 4, 0)` means
"3 units in X, 4 in Y." It describes movement, not position.

The same numbers represent both. The distinction is in how you interpret them:

```ts
const pointA = new Vec3(1, 2, 0);    // point: position
const pointB = new Vec3(4, 6, 0);    // point: position
const AB     = pointB.sub(pointA);   // vector: from A to B = (3, 4, 0)
```

**Practical rules:**
- `point + vector = point` (moving a position)
- `point - point = vector` (direction from one position to another)
- `vector + vector = vector` (combining displacements)
- `point + point` is meaningless geometrically

---

### Concept: The Operations

**Addition:** Move in two directions sequentially.

```ts
// Moving A by the vector v:
const position  = new Vec3(1, 2, 0);
const velocity  = new Vec3(0.5, 0, 0);
const newPos    = position.add(velocity);  // Vec3(1.5, 2, 0)
```

**Subtraction:** The vector from A to B is `B - A`.

```ts
const B_to_A = pointA.sub(pointB);  // Vec3(-3, -4, 0) — from B toward A
const A_to_B = pointB.sub(pointA);  // Vec3(3, 4, 0)   — from A toward B
```

**Scalar multiplication:** Scaling a vector changes its magnitude, not its direction.

```ts
const direction = new Vec3(1, 0, 0);   // pointing along X
const fast      = direction.scale(10); // Vec3(10, 0, 0) — same direction, bigger step
```

**Magnitude:** The length of the vector.

```ts
// Pythagorean theorem in 3D:
// |v| = sqrt(x² + y² + z²)
new Vec3(3, 4, 0).magnitude()   // sqrt(9 + 16 + 0) = 5
```

**Normalisation:** Dividing a vector by its magnitude produces a unit vector — same direction, length 1.

```ts
// Unit vector in the same direction:
new Vec3(3, 4, 0).normalise()   // Vec3(0.6, 0.8, 0) — length 1
```

**Why normalised vectors:** When you only need a direction (not a speed or distance),
use a unit vector. A camera "facing direction" is always normalised — the camera
doesn't move faster when you look further. A surface normal is normalised —
the light calculation only cares about direction.

---

## Step 1 — Implement `Vec3`

Create a new project for Topic 7 (or add to the existing one):

```bash
mkdir coord-explorer
cd coord-explorer
npm init -y
npm install -D vitest typescript
```

Create `src/math/Vec3.ts`:

```ts
export class Vec3 {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly z: number,
  ) {}

  add(other: Vec3): Vec3 {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other: Vec3): Vec3 {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  scale(s: number): Vec3 {
    return new Vec3(this.x * s, this.y * s, this.z * s);
  }

  negate(): Vec3 {
    return this.scale(-1);
  }

  magnitude(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  normalise(): Vec3 {
    const m = this.magnitude();
    if (m === 0) throw new Error('Cannot normalise a zero vector');
    return this.scale(1 / m);
  }

  dot(other: Vec3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  equals(other: Vec3, epsilon = 1e-10): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  distanceTo(other: Vec3): number {
    return this.sub(other).magnitude();
  }

  toString(): string {
    return `Vec3(${this.x.toFixed(4)}, ${this.y.toFixed(4)}, ${this.z.toFixed(4)})`;
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  static readonly ZERO    = new Vec3(0, 0, 0);
  static readonly X_AXIS  = new Vec3(1, 0, 0);
  static readonly Y_AXIS  = new Vec3(0, 1, 0);
  static readonly Z_AXIS  = new Vec3(0, 0, 1);
}
```

---

## Step 2 — Write Tests

Create `src/math/Vec3.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Vec3 }                  from './Vec3';

// Helper — check approximate equality:
const expectClose = (a: Vec3, b: Vec3) => {
  expect(a.x).toBeCloseTo(b.x, 8);
  expect(a.y).toBeCloseTo(b.y, 8);
  expect(a.z).toBeCloseTo(b.z, 8);
};

describe('Vec3', () => {

  describe('add', () => {
    it('adds component-wise', () => {
      const r = new Vec3(1, 2, 3).add(new Vec3(4, 5, 6));
      expect(r.equals(new Vec3(5, 7, 9))).toBe(true);
    });

    it('adding zero vector is identity', () => {
      const v = new Vec3(3, 4, 5);
      expect(v.add(Vec3.ZERO).equals(v)).toBe(true);
    });
  });

  describe('sub', () => {
    it('computes the vector from A to B as B.sub(A)', () => {
      const A = new Vec3(1, 2, 0);
      const B = new Vec3(4, 6, 0);
      const AB = B.sub(A);
      expect(AB.equals(new Vec3(3, 4, 0))).toBe(true);
    });
  });

  describe('scale', () => {
    it('scales all components by the factor', () => {
      const r = new Vec3(1, 2, 3).scale(3);
      expect(r.equals(new Vec3(3, 6, 9))).toBe(true);
    });

    it('scale by 0 gives zero vector', () => {
      expect(new Vec3(5, 5, 5).scale(0).equals(Vec3.ZERO)).toBe(true);
    });

    it('scale by -1 negates direction', () => {
      const v = new Vec3(1, -2, 3);
      expect(v.scale(-1).equals(new Vec3(-1, 2, -3))).toBe(true);
    });
  });

  describe('magnitude', () => {
    it('computes the 3D Pythagorean length', () => {
      // 3-4-5 right triangle on XY plane:
      expect(new Vec3(3, 4, 0).magnitude()).toBeCloseTo(5);
    });

    it('unit axis vectors have magnitude 1', () => {
      expect(Vec3.X_AXIS.magnitude()).toBeCloseTo(1);
      expect(Vec3.Y_AXIS.magnitude()).toBeCloseTo(1);
      expect(Vec3.Z_AXIS.magnitude()).toBeCloseTo(1);
    });

    it('zero vector has magnitude 0', () => {
      expect(Vec3.ZERO.magnitude()).toBe(0);
    });
  });

  describe('normalise', () => {
    it('returns a unit vector with the same direction', () => {
      const n = new Vec3(3, 4, 0).normalise();
      expect(n.magnitude()).toBeCloseTo(1);
      expect(n.x).toBeCloseTo(0.6);
      expect(n.y).toBeCloseTo(0.8);
    });

    it('unit vectors normalise to themselves', () => {
      const n = Vec3.X_AXIS.normalise();
      expect(n.equals(Vec3.X_AXIS)).toBe(true);
    });

    it('throws when normalising the zero vector', () => {
      expect(() => Vec3.ZERO.normalise()).toThrow();
    });
  });

  describe('dot product', () => {
    it('returns 0 for perpendicular unit vectors', () => {
      expect(Vec3.X_AXIS.dot(Vec3.Y_AXIS)).toBe(0);
      expect(Vec3.X_AXIS.dot(Vec3.Z_AXIS)).toBe(0);
    });

    it('returns 1 for identical unit vectors', () => {
      expect(Vec3.X_AXIS.dot(Vec3.X_AXIS)).toBe(1);
    });

    it('returns -1 for opposite unit vectors', () => {
      expect(Vec3.X_AXIS.dot(Vec3.X_AXIS.negate())).toBe(-1);
    });
  });

  describe('distanceTo', () => {
    it('computes distance between two points', () => {
      const A = new Vec3(0, 0, 0);
      const B = new Vec3(3, 4, 0);
      expect(A.distanceTo(B)).toBeCloseTo(5);
    });

    it('distance from a point to itself is 0', () => {
      const A = new Vec3(3, 7, -2);
      expect(A.distanceTo(A)).toBe(0);
    });
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Add `lerp`

**You know:** Vector operations, normalisation.

**Task:** Add `lerp(other: Vec3, t: number): Vec3` — linear interpolation between
this vector and `other`. At `t=0`, returns `this`. At `t=1`, returns `other`.
At `t=0.5`, returns the midpoint.

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

**Tests:**
```ts
it('lerp at t=0 returns the original vector', () => {
  const a = new Vec3(0, 0, 0);
  const b = new Vec3(10, 0, 0);
  expect(a.lerp(b, 0).equals(a)).toBe(true);
});

it('lerp at t=1 returns the other vector', () => {
  const a = new Vec3(0, 0, 0);
  const b = new Vec3(10, 0, 0);
  expect(a.lerp(b, 1).equals(b)).toBe(true);
});

it('lerp at t=0.5 returns the midpoint', () => {
  const a = new Vec3(0, 0, 0);
  const b = new Vec3(10, 0, 0);
  expect(a.lerp(b, 0.5).equals(new Vec3(5, 0, 0))).toBe(true);
});
```

**Implementation:**
```ts
lerp(other: Vec3, t: number): Vec3 {
  return this.add(other.sub(this).scale(t));
  // Equivalent: this * (1-t) + other * t
}
```

</details>

---

## Final Check

| Operation | Formula | Example |
|---|---|---|
| `add` | `(ax+bx, ay+by, az+bz)` | `(1,0,0)+(0,1,0) = (1,1,0)` |
| `sub` | `(ax-bx, ay-by, az-bz)` | B - A = vector from A to B |
| `scale` | `(s*x, s*y, s*z)` | Direction unchanged |
| `magnitude` | `sqrt(x²+y²+z²)` | `(3,4,0)` → 5 |
| `normalise` | `v / magnitude` | Same direction, length 1 |
| `dot` | `ax*bx + ay*by + az*bz` | 0 if perpendicular |
| `lerp` | `a + (b-a)*t` | Smooth path between points |

---

## Quick Check Answers

**1. Vector from A=(1,2,3) to B=(4,6,3)?**

`B - A = (4-1, 6-2, 3-3) = (3, 4, 0)`. Subtraction gives the displacement vector.
The order matters: `B - A` points FROM A TO B. `A - B` would point in the opposite direction.

**2. Normalising `(3, 0, 0)`?**

`magnitude = sqrt(9+0+0) = 3`. `normalised = (3/3, 0/3, 0/3) = (1, 0, 0)`.
The direction (positive X) is preserved. The length is 1. This is the X axis unit vector.

**3. Scaling direction vector by 5 — does direction change?**

No. Scaling changes the magnitude (length) without affecting the direction.
`(1, 0, 0) * 5 = (5, 0, 0)` — still pointing along positive X, just "stronger."
Direction is preserved by any positive scalar. Negative scalars flip the direction.
