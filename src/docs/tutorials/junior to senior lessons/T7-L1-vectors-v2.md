# Junior to Senior — T7·L1 — Vectors

**Prerequisites:** T6·L8 (Frontend Testing). You can build and test a React application.
This lesson starts Topic 7 — the 3D math required for the CAD/CAM viewport. The lesson
teaches vectors not by listing the formulas but by showing you the GEOMETRY behind each
operation, then deriving the formula from the geometry.

**What this lab adds:**
- Why `(3, 4)` as a point and `(3, 4)` as a vector are the same numbers but different concepts
- How addition, subtraction, and scaling work GEOMETRICALLY — then in code
- Why `sqrt(x² + y² + z²)` is the length formula — deriving it from Pythagoras, not memorising it
- Why normalised vectors are used for directions — and what you break if you don't normalise

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `A = (1, 2, 3)` and `B = (4, 6, 3)`. You want the vector pointing FROM A TO B.
>    Do you compute `A - B` or `B - A`? How do you know?
> 2. `Vec3(3, 0, 0).magnitude()` returns 3. `Vec3(0, 4, 0).magnitude()` returns 4.
>    What does `Vec3(3, 4, 0).magnitude()` return? Why?
> 3. You scale a direction vector `(1, 0, 0)` by 5: `(5, 0, 0)`. Did the direction change?
>    Did the magnitude change?
>
> *(Answers at the end of this lab)*

---

## The Geometry First

Before writing any code, understand what each operation MEANS with arrows on paper.

### Addition — "take one step, then another"

```
Start at origin (0,0). Vector A = (3, 1). Vector B = (1, 2).
A + B means: take A's step, THEN take B's step.

  4 |      ×  ← (4, 3) = A + B
  3 |     /
  2 |    × ← (1, 2) = B      /
  1 |   /           × ← (3, 1) = A
  0 |──────────────────────
    0   1   2   3   4
```

The sum `(4, 3)` is where you end up after taking both steps from the origin.

### Subtraction — "the path from A to B"

```
A = (1, 2). B = (4, 5). B - A = (3, 3).
This is the arrow FROM A pointing TO B.

  5 |    × B
  4 |   /
  3 |  / ← B - A = (3, 3)
  2 | × A
  1 |
  0 |────────
    0 1 2 3 4
```

`B - A` always points FROM A TOWARD B. `A - B` points the other way.

### Magnitude — "the length of the arrow"

A vector `(3, 4, 0)` drawn as an arrow has a length. To find it:
- It makes a right triangle: horizontal leg = 3, vertical leg = 4
- Pythagorean theorem: `length² = 3² + 4² = 9 + 16 = 25`
- `length = sqrt(25) = 5`

This is where `sqrt(x² + y² + z²)` comes from — it IS the 3D version of the Pythagorean
theorem. You are not memorising a formula; you are computing the length of a diagonal
in 3D space.

---

## Step 1 — Build Vec3 From Scratch, One Operation at a Time

Create a new project for Topic 7:

```bash
mkdir coord-explorer && cd coord-explorer
npm init -y
npm install -D vitest typescript
```

Create `src/math/Vec3.ts`. Add ONE method, test it, then add the next.

```ts
// src/math/Vec3.ts
export class Vec3 {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly z: number,
  ) {}
  // Methods added one at a time below
}
```

Create the first test:

```ts
// src/math/Vec3.test.ts
import { describe, it, expect } from 'vitest';
import { Vec3 } from './Vec3';

describe('Vec3', () => {
  it('stores x, y, z', () => {
    const v = new Vec3(1, 2, 3);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
  });
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: `Tests 1 passed` — the constructor works.

---

### Adding `add`

The geometry: `add` combines two displacement arrows end-to-end. The code is the formula
derived from the geometry: add each component independently.

```
(3, 1) + (1, 2) = (3+1, 1+2) = (4, 3)
Each axis is independent — the x-step of A and the x-step of B combine,
the y-step of A and the y-step of B combine.
```

Add to `Vec3.ts`:

```ts
// src/math/Vec3.ts — add this method

add(other: Vec3): Vec3 {
  // Each axis combines independently — this IS the vector addition geometry:
  return new Vec3(
    this.x + other.x,
    this.y + other.y,
    this.z + other.z,
  );
}
```

Add the test:

```ts
it('add combines two vectors component-by-component', () => {
  const a = new Vec3(3, 1, 0);
  const b = new Vec3(1, 2, 0);
  const result = a.add(b);
  // From the geometry above: 3+1=4, 1+2=3, 0+0=0:
  expect(result.x).toBe(4);
  expect(result.y).toBe(3);
  expect(result.z).toBe(0);
});

it('adding the zero vector is identity', () => {
  const v = new Vec3(5, 3, 7);
  const zero = new Vec3(0, 0, 0);
  const result = v.add(zero);
  expect(result.x).toBe(5);   // unchanged
  expect(result.y).toBe(3);
  expect(result.z).toBe(7);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: `Tests 3 passed`.

---

### Adding `sub` — The Direction Arrow

The geometry: `B.sub(A)` gives the arrow that starts at A and ends at B. The code
subtracts each component.

```
B = (4, 6), A = (1, 2). B - A = (3, 4).
This arrow has x-component 3 (go 3 right) and y-component 4 (go 4 up).
Starting from A and following (3, 4), you reach B exactly.
```

Add to `Vec3.ts`:

```ts
sub(other: Vec3): Vec3 {
  // The arrow from `other` to `this`.
  // Verify: this.sub(other) points FROM other TOWARD this.
  return new Vec3(
    this.x - other.x,
    this.y - other.y,
    this.z - other.z,
  );
}
```

Add the test — and verify the direction:

```ts
it('B.sub(A) gives the vector pointing FROM A TO B', () => {
  const A = new Vec3(1, 2, 0);
  const B = new Vec3(4, 6, 0);
  const A_to_B = B.sub(A);  // "B minus A" = from A to B

  // From the geometry: (4-1, 6-2, 0-0) = (3, 4, 0):
  expect(A_to_B.x).toBe(3);
  expect(A_to_B.y).toBe(4);

  // Verify it is the REVERSE of A - B:
  const B_to_A = A.sub(B);
  expect(B_to_A.x).toBe(-3);  // opposite direction
  expect(B_to_A.y).toBe(-4);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: `Tests 5 passed`.

---

### Adding `scale` — Changing the Magnitude

The geometry: scaling multiplies the length of the arrow without changing its direction.
`(1, 0, 0)` points right with length 1. `(1, 0, 0).scale(5)` points right with length 5.

```ts
scale(factor: number): Vec3 {
  // Each component scales by the same factor.
  // Why? Because magnitude = sqrt(x² + y² + z²).
  // Scaling all components by k: sqrt((kx)² + (ky)² + (kz)²) = k * sqrt(x² + y² + z²)
  // So magnitude scales by |k| — direction is unchanged for positive k.
  return new Vec3(
    this.x * factor,
    this.y * factor,
    this.z * factor,
  );
}
```

Add the test:

```ts
it('scale multiplies the length but not the direction', () => {
  const direction = new Vec3(1, 0, 0);   // points along +X with length 1
  const scaled    = direction.scale(5);  // should point along +X with length 5

  expect(scaled.x).toBe(5);   // length grew
  expect(scaled.y).toBe(0);   // direction unchanged
  expect(scaled.z).toBe(0);

  // Scaling by -1 flips the direction:
  const flipped = direction.scale(-1);
  expect(flipped.x).toBe(-1);  // now points along -X
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: `Tests 7 passed`.

---

### Adding `magnitude` — The Pythagorean Theorem in 3D

The geometry shows why this formula is `sqrt(x² + y² + z²)`:

```
In 2D: a vector (3, 4) forms a right triangle with legs 3 and 4.
Hypotenuse (length) = sqrt(3² + 4²) = sqrt(9 + 16) = sqrt(25) = 5

In 3D: a vector (x, y, z) first goes horizontal: diagonal_xy = sqrt(x² + y²)
Then goes vertical by z: total = sqrt(diagonal_xy² + z²) = sqrt(x² + y² + z²)
```

It is Pythagoras applied twice — once in the XY plane, once vertically.

```ts
magnitude(): number {
  // sqrt(x² + y² + z²) — the 3D Pythagorean theorem:
  return Math.sqrt(
    this.x ** 2 +
    this.y ** 2 +
    this.z ** 2
  );
}
```

Add the tests — notice the 3-4-5 right triangle:

```ts
it('magnitude of (3, 4, 0) is 5 — the 3-4-5 right triangle', () => {
  // 3² + 4² = 9 + 16 = 25. sqrt(25) = 5.
  // This is just the Pythagorean theorem with z=0:
  expect(new Vec3(3, 4, 0).magnitude()).toBeCloseTo(5);
});

it('magnitude of an axis-aligned vector equals its component', () => {
  // (7, 0, 0): sqrt(49 + 0 + 0) = 7. Only the x component matters.
  expect(new Vec3(7, 0, 0).magnitude()).toBe(7);
  expect(new Vec3(0, 5, 0).magnitude()).toBe(5);
  expect(new Vec3(0, 0, 3).magnitude()).toBe(3);
});

it('magnitude of the zero vector is 0', () => {
  expect(new Vec3(0, 0, 0).magnitude()).toBe(0);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: `Tests 10 passed`.

---

### Adding `normalise` — Why Directions Use Unit Vectors

**The problem with raw directions:** If you want to move 5 units in the direction from
A to B, you compute `B.sub(A)` — but that vector's magnitude is the DISTANCE from A to B,
not 1. If A and B are 100 units apart, `B.sub(A)` has magnitude 100. Moving by that vector
moves you 100 units, not 5.

**The solution — normalise:** Divide the vector by its own magnitude to get a vector
with the SAME direction but magnitude 1 (called a "unit vector").

```
(3, 4, 0) has magnitude 5.
Normalised: (3/5, 4/5, 0/5) = (0.6, 0.8, 0)
Check: sqrt(0.6² + 0.8²) = sqrt(0.36 + 0.64) = sqrt(1.0) = 1 ✓
```

Now to move 5 units from A toward B: `normalise(B - A).scale(5)`.

```ts
normalise(): Vec3 {
  const m = this.magnitude();
  if (m === 0) {
    // The zero vector has no direction — normalising it is undefined:
    throw new Error('Cannot normalise the zero vector — it has no direction');
  }
  // Divide each component by the magnitude:
  // This scales the vector so that its new magnitude = old_magnitude / old_magnitude = 1
  return this.scale(1 / m);
}
```

Add the tests:

```ts
it('normalise returns a vector with magnitude 1', () => {
  const v = new Vec3(3, 4, 0);
  const n = v.normalise();
  // Magnitude should be exactly 1 (within floating-point precision):
  expect(n.magnitude()).toBeCloseTo(1);
});

it('normalise preserves direction — components scale proportionally', () => {
  const v = new Vec3(3, 4, 0);
  const n = v.normalise();
  // Original: (3, 4, 0) with magnitude 5.
  // Normalised: (3/5, 4/5, 0) = (0.6, 0.8, 0):
  expect(n.x).toBeCloseTo(0.6);
  expect(n.y).toBeCloseTo(0.8);
  expect(n.z).toBeCloseTo(0);
});

it('normalising an already-unit vector returns the same direction', () => {
  const unit = new Vec3(1, 0, 0);
  const n    = unit.normalise();
  // (1, 0, 0) has magnitude 1. Dividing by 1 gives (1, 0, 0):
  expect(n.x).toBeCloseTo(1);
});

it('normalising the zero vector throws', () => {
  expect(() => new Vec3(0, 0, 0).normalise()).toThrow();
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: `Tests 14 passed`.

**Change something:** Try normalising a large vector to verify the magnitude is 1:

```bash
npx tsx -e "
const { Vec3 } = await import('./src/math/Vec3.js');
const v = new Vec3(100, 200, 300);
const n = v.normalise();
console.log('magnitude:', n.magnitude());  // should be very close to 1
console.log('x:', n.x.toFixed(6));
"
```

Expected: `magnitude: 1.0000000000000002` — not exactly 1 due to floating-point, but
close enough for all practical purposes.

---

### Adding the Remaining Operations

Add `dot`, `equals`, and `distanceTo` to complete the Vec3 class:

```ts
dot(other: Vec3): number {
  // dot product: a scalar that measures how aligned two vectors are.
  // = x₁x₂ + y₁y₂ + z₁z₂
  // = |a||b|cos(θ) — equals 0 when perpendicular, 1 when parallel (unit vectors)
  return this.x * other.x + this.y * other.y + this.z * other.z;
}

equals(other: Vec3, epsilon = 1e-10): boolean {
  // Can't use === because floating point: sqrt(3)² ≠ 3 exactly
  return (
    Math.abs(this.x - other.x) < epsilon &&
    Math.abs(this.y - other.y) < epsilon &&
    Math.abs(this.z - other.z) < epsilon
  );
}

distanceTo(other: Vec3): number {
  // Distance between two POINTS = magnitude of the vector from one to the other:
  return this.sub(other).magnitude();
}

negate(): Vec3 {
  return this.scale(-1);  // flips direction
}

toArray(): [number, number, number] {
  return [this.x, this.y, this.z];
}

static readonly ZERO   = new Vec3(0, 0, 0);
static readonly X_AXIS = new Vec3(1, 0, 0);  // unit vector along +X
static readonly Y_AXIS = new Vec3(0, 1, 0);  // unit vector along +Y
static readonly Z_AXIS = new Vec3(0, 0, 1);  // unit vector along +Z
```

Add tests for dot product — the geometry is covered in T7-L2, but test the formula now:

```ts
it('dot product of perpendicular unit vectors is 0', () => {
  // X axis and Y axis are perpendicular (90° apart).
  // cos(90°) = 0. So X·Y = |X||Y|cos(90°) = 1 × 1 × 0 = 0:
  expect(Vec3.X_AXIS.dot(Vec3.Y_AXIS)).toBe(0);
});

it('dot product of parallel unit vectors is 1', () => {
  // Same direction: cos(0°) = 1. So X·X = 1 × 1 × 1 = 1:
  expect(Vec3.X_AXIS.dot(Vec3.X_AXIS)).toBe(1);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Add `lerp` (Linear Interpolation)

**The geometry to understand first:**

Linear interpolation answers: "what point is t% of the way from A to B?"
- t=0: at A
- t=1: at B
- t=0.5: halfway between A and B
- t=0.25: one-quarter of the way from A to B

**The formula:** `lerp(A, B, t) = A + t * (B - A)`

In words: start at A, then move t fraction of the distance from A to B.

**Why this formula?** `B - A` is the vector from A to B. `t * (B - A)` is t% of that
distance. `A + that` puts you t% of the way from A to B.

**Task:** Implement `lerp(other: Vec3, t: number): Vec3` and write 3 tests before
implementing that verify:
1. `lerp(B, 0)` returns A
2. `lerp(B, 1)` returns B
3. `lerp(B, 0.5)` returns the midpoint

---

<details>
<summary>▶ Show Solution</summary>

```ts
lerp(other: Vec3, t: number): Vec3 {
  // A + t * (B - A) — t% of the way from this to other:
  return this.add(other.sub(this).scale(t));
}
```

**Tests:**
```ts
it('lerp at t=0 returns the starting vector', () => {
  const a = new Vec3(0, 0, 0);
  const b = new Vec3(10, 0, 0);
  expect(a.lerp(b, 0).equals(a)).toBe(true);
});

it('lerp at t=1 returns the ending vector', () => {
  const a = new Vec3(0, 0, 0);
  const b = new Vec3(10, 0, 0);
  expect(a.lerp(b, 1).equals(b)).toBe(true);
});

it('lerp at t=0.5 returns the midpoint', () => {
  const a = new Vec3(0, 0, 0);
  const b = new Vec3(10, 0, 0);
  const mid = a.lerp(b, 0.5);
  expect(mid.x).toBeCloseTo(5);
});
```

**Key insight:** The formula `A + t*(B-A)` can be rewritten as `(1-t)*A + t*B` —
a weighted average. At t=0: 100% A, 0% B. At t=1: 0% A, 100% B. At t=0.5: 50% each.
This weighted-average form is often how lerp is explained in graphics literature.

</details>

---

## Final Check

| Operation | Geometry | Formula |
|---|---|---|
| `add(B)` | End-to-end arrows | `(x+bx, y+by, z+bz)` |
| `sub(B)` | Arrow FROM B TO this | `(x-bx, y-by, z-bz)` |
| `scale(k)` | Stretch/shrink the arrow | `(kx, ky, kz)` |
| `magnitude()` | Length of the arrow | `sqrt(x²+y²+z²)` = Pythagoras |
| `normalise()` | Same direction, length 1 | `v / magnitude(v)` |
| `dot(B)` | Alignment measure | `x*bx + y*by + z*bz` |

---

## Quick Check Answers

**1. Vector FROM A TO B — `A-B` or `B-A`?**

`B - A`. The vector FROM A TO B = the position of B minus the position of A.
A simple check: `B - A` evaluated at A should give B: `A + (B-A) = B`. ✓
If you compute `A - B`, you get the vector pointing the OTHER way — from B toward A.

**2. `Vec3(3, 0, 0).magnitude()` is 3. `Vec3(0, 4, 0)` is 4. `Vec3(3, 4, 0)`?**

5. The formula is `sqrt(x² + y² + z²) = sqrt(9 + 16 + 0) = sqrt(25) = 5`.
This is the 3-4-5 right triangle — a famous Pythagorean triple. The vector `(3, 4, 0)`
forms a right triangle in the XY plane with legs 3 and 4 and hypotenuse 5.

**3. `(1, 0, 0).scale(5)` = `(5, 0, 0)`. Did direction change? Did magnitude change?**

Direction unchanged — still points along positive X. Magnitude changed: was 1, now 5.
Scaling a vector multiplies its length by the scale factor while keeping the same
direction (for positive scale factors). Negative scale factors flip the direction.
