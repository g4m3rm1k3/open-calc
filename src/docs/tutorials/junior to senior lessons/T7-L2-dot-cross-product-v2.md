# Junior to Senior — T7·L2 — Dot Product and Cross Product

**Prerequisites:** T7·L1 (Vectors). You have a working `Vec3` class with `add`, `sub`,
`scale`, `magnitude`, `normalise`. This lesson teaches the two vector products by showing
WHERE their formulas come from, not just what they are.

**What this lab adds:**
- The dot product formula derived from its geometric meaning — alignment as a shadow
- Why `a · b = 0` means perpendicular — the cosine connection
- The cross product formula derived from the right-hand rule
- Why the cross product magnitude is `|a||b|sin(θ)` — the parallelogram area
- Using dot product for lighting, cross product for surface normals

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two unit vectors point in the same direction. Their dot product is `1`.
>    Two unit vectors point in opposite directions. Their dot product is `-1`.
>    Two unit vectors are perpendicular. Their dot product is `0`.
>    What value does the dot product approach as the angle approaches 90°?
> 2. `a × b` produces a vector perpendicular to both `a` and `b`. What is
>    `a × a` (a vector crossed with itself)?
> 3. `(B - A) × (C - A)` gives the face normal of triangle ABC. If you swap
>    B and C, how does the result change?
>
> *(Answers at the end of this lab)*

---

## The Dot Product — Measuring Alignment as a Shadow

The geometric picture of the dot product: it measures how much one vector "shadows"
another.

Draw unit vector **a** pointing right. Draw unit vector **b** pointing at some angle θ.
Cast a shadow of **b** onto the line of **a**. The shadow's length is `cos(θ)`.

```
       b
      /
     / θ
────/────────── a
    │
    shadow = cos(θ)
```

- θ = 0°  (same direction): shadow = cos(0°) = 1  (maximum alignment)
- θ = 90° (perpendicular): shadow = cos(90°) = 0  (no alignment)
- θ = 180° (opposite): shadow = cos(180°) = -1 (maximum anti-alignment)

For non-unit vectors, the shadow also grows with the magnitudes:
`a · b = |a| × |b| × cos(θ)`

**The formula `x₁x₂ + y₁y₂ + z₁z₂` comes from this geometry** — it is not an arbitrary
definition. It is the result of expanding `|a||b|cos(θ)` using vector components.

---

## Step 1 — Add `dot` and `angleTo` to Vec3

Open `src/math/Vec3.ts`:

```ts
dot(other: Vec3): number {
  // a · b = x₁x₂ + y₁y₂ + z₁z₂
  // This equals |a||b|cos(θ) — proved via the law of cosines
  return this.x * other.x + this.y * other.y + this.z * other.z;
}
```

Add the tests one at a time:

```ts
it('dot product of same-direction unit vectors is 1', () => {
  // cos(0°) = 1. The shadow of X_AXIS onto X_AXIS is its full length.
  expect(Vec3.X_AXIS.dot(Vec3.X_AXIS)).toBe(1);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: `Tests N+1 passed`. Add the perpendicular test:

```ts
it('dot product of perpendicular unit vectors is 0', () => {
  // cos(90°) = 0. X and Y point in completely unrelated directions.
  // The shadow of Y onto X is zero.
  expect(Vec3.X_AXIS.dot(Vec3.Y_AXIS)).toBe(0);
  expect(Vec3.X_AXIS.dot(Vec3.Z_AXIS)).toBe(0);
});

it('dot product of opposite-direction unit vectors is -1', () => {
  // cos(180°) = -1. X and -X are maximally opposite.
  expect(Vec3.X_AXIS.dot(Vec3.X_AXIS.negate())).toBe(-1);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all new tests pass. Now add `angleTo`:

```ts
angleTo(other: Vec3): number {
  // Rearranging a · b = |a||b|cos(θ):
  // cos(θ) = (a · b) / (|a| × |b|)
  // θ = arccos(a · b / |a||b|)
  //
  // For unit vectors: θ = arccos(a · b) — simpler form
  const cosAngle = this.normalise().dot(other.normalise());
  // Clamp to [-1, 1] to prevent NaN from floating-point errors > 1 or < -1:
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}
```

```ts
it('angleTo returns PI/2 for perpendicular vectors', () => {
  // 90° = π/2 radians
  expect(Vec3.X_AXIS.angleTo(Vec3.Y_AXIS)).toBeCloseTo(Math.PI / 2);
});

it('angleTo returns 0 for parallel vectors', () => {
  expect(Vec3.X_AXIS.angleTo(Vec3.X_AXIS)).toBeCloseTo(0);
});

it('angleTo returns PI for opposite vectors', () => {
  expect(Vec3.X_AXIS.angleTo(Vec3.X_AXIS.negate())).toBeCloseTo(Math.PI);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all new tests pass.

**Why clamping matters — verify with a test:**

```ts
it('angleTo does not return NaN due to floating-point errors', () => {
  // A unit vector dot itself should be exactly 1, but floating-point:
  const v = new Vec3(1, 0, 0);
  // Without clamping: Math.acos(1.0000000000000002) = NaN
  // With clamping: Math.acos(1) = 0
  expect(v.angleTo(v)).not.toBeNaN();
});
```

---

## The Cross Product — The "Right-Hand Rule" Product

The cross product `a × b` produces a vector PERPENDICULAR to both `a` and `b`.
The direction is determined by the right-hand rule:

```
Point your right hand's fingers from a toward b (curl them).
Your thumb points in the direction of a × b.

Example:
  a = X (pointing right)
  b = Y (pointing up)
  Curl fingers from right to up → thumb points OUT OF THE SCREEN (+Z)

  X × Y = Z  (confirmed by the right-hand rule)
```

**Why the formula `(ay*bz - az*by, az*bx - ax*bz, ax*by - ay*bx)`?**

This formula is derived by requiring that the result is perpendicular to both inputs
(their dot products with the result equal zero). You do not need to derive it — but you
should know it encodes the right-hand rule.

---

## Step 2 — Add `cross` to Vec3

```ts
cross(other: Vec3): Vec3 {
  // The formula computes a vector perpendicular to both this and other.
  // The component formulas come from the definition of the determinant:
  return new Vec3(
    this.y * other.z - this.z * other.y,   // x component
    this.z * other.x - this.x * other.z,   // y component
    this.x * other.y - this.y * other.x,   // z component
  );
}
```

Add tests that verify the RIGHT-HAND RULE:

```ts
it('X cross Y equals Z — right-hand rule', () => {
  // Point fingers right (X), curl up (toward Y), thumb points out (+Z):
  const result = Vec3.X_AXIS.cross(Vec3.Y_AXIS);
  expect(result.x).toBeCloseTo(0);
  expect(result.y).toBeCloseTo(0);
  expect(result.z).toBeCloseTo(1);  // +Z, not -Z
});

it('Y cross Z equals X', () => {
  // Right-hand rule: fingers toward Y, curl toward Z, thumb points +X
  const result = Vec3.Y_AXIS.cross(Vec3.Z_AXIS);
  expect(result.x).toBeCloseTo(1);
  expect(result.y).toBeCloseTo(0);
  expect(result.z).toBeCloseTo(0);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all new tests pass. Add the anti-commutative test:

```ts
it('cross product is anti-commutative: A×B = -(B×A)', () => {
  // Reversing the order flips the direction (right-hand rule reverses):
  const a  = new Vec3(1, 2, 3);
  const b  = new Vec3(4, 5, 6);
  const ab = a.cross(b);
  const ba = b.cross(a);
  expect(ab.x).toBeCloseTo(-ba.x);
  expect(ab.y).toBeCloseTo(-ba.y);
  expect(ab.z).toBeCloseTo(-ba.z);
});

it('cross product of parallel vectors is the zero vector', () => {
  // Parallel vectors form no plane — no perpendicular vector exists:
  const v    = new Vec3(1, 2, 3);
  const same = v.scale(2);  // parallel
  const result = v.cross(same);
  expect(result.magnitude()).toBeCloseTo(0);
});

it('result is perpendicular to both inputs', () => {
  const a = new Vec3(1, 2, 0);
  const b = new Vec3(3, 0, 0);
  const c = a.cross(b);
  // c · a = 0 (c is perpendicular to a)
  // c · b = 0 (c is perpendicular to b)
  expect(Math.abs(c.dot(a))).toBeLessThan(1e-10);
  expect(Math.abs(c.dot(b))).toBeLessThan(1e-10);
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

### Concept: Cross Product for Triangle Normals

**What it is:** The most common use of the cross product in 3D graphics is computing
the surface normal of a triangle — the vector that points "out of" the face.

**The mechanism — why cross product gives the normal:**

A triangle has three vertices: A, B, C. Two edges from A:
- Edge 1: `AB = B - A` (a vector along the triangle's surface)
- Edge 2: `AC = C - A` (another vector along the triangle's surface)

`AB × AC` is perpendicular to BOTH edges — therefore perpendicular to the triangle's surface.
That is the definition of a normal.

**Which way does it point?** The right-hand rule with CCW winding:

```
Vertices A, B, C ordered counter-clockwise when viewed from the front.
AB points along the bottom edge. AC points to the upper-left.
Curl fingers from AB toward AC → thumb points TOWARD YOU (+Z for a face in the XY plane).

Result: outward-facing normal for CCW-wound triangles.
```

```ts
it('triangle normal points toward the viewer for CCW vertices in XY plane', () => {
  // Counter-clockwise triangle in the XY plane:
  const A = new Vec3(0, 0, 0);
  const B = new Vec3(1, 0, 0);
  const C = new Vec3(0, 1, 0);

  const AB = B.sub(A);    // edge vector along the triangle
  const AC = C.sub(A);    // another edge vector

  const normal = AB.cross(AC).normalise();

  // For CCW winding in XY plane: normal should point toward +Z:
  expect(normal.z).toBeGreaterThan(0);   // pointing toward viewer
  expect(normal.magnitude()).toBeCloseTo(1);  // normalised
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: test passes.

**Change something:** Swap B and C (making the winding clockwise):

```ts
const normal_CW = AC.cross(AB).normalise();  // or: swap B and C in the test
expect(normal_CW.z).toBeLessThan(0);  // now points AWAY from viewer
```

This is why winding order matters in 3D graphics — it determines which direction the
normal points, which determines which face is "front" and which is "back."

---

## 🎯 Challenge: Compute Triangle Area With Cross Product

**The geometric connection:**

The magnitude of `AB × AC` equals the AREA OF THE PARALLELOGRAM formed by AB and AC.
The triangle is half the parallelogram.

```
|AB × AC| = area of parallelogram = base × height
Triangle area = |AB × AC| / 2
```

**Task:** Implement `triangleArea(A: Vec3, B: Vec3, C: Vec3): number` using the cross
product. Write 2 tests before implementing:
- A right triangle with legs 3 and 4 has area 6
- A unit square triangle (half of a 1×1 square) has area 0.5

---

<details>
<summary>▶ Show Solution</summary>

```ts
function triangleArea(A: Vec3, B: Vec3, C: Vec3): number {
  const AB = B.sub(A);
  const AC = C.sub(A);
  return AB.cross(AC).magnitude() / 2;
  // |AB × AC| = area of the parallelogram. Triangle = half of that.
}
```

**Tests:**
```ts
it('area of a 3-4-5 right triangle is 6', () => {
  const A = new Vec3(0, 0, 0);
  const B = new Vec3(3, 0, 0);  // 3 units along X
  const C = new Vec3(0, 4, 0);  // 4 units along Y
  // base=3, height=4, area = 0.5 × 3 × 4 = 6
  expect(triangleArea(A, B, C)).toBeCloseTo(6);
});

it('area of a unit right triangle is 0.5', () => {
  const A = new Vec3(0, 0, 0);
  const B = new Vec3(1, 0, 0);
  const C = new Vec3(0, 1, 0);
  expect(triangleArea(A, B, C)).toBeCloseTo(0.5);
});
```

</details>

---

## Final Check

| Product | Formula | Result type | Example |
|---|---|---|---|
| Dot | `x₁x₂ + y₁y₂ + z₁z₂` | Scalar | Alignment check, lighting |
| Cross | `(ay*bz-az*by, ...)` | Vector (perpendicular) | Normals, winding order |

---

## Quick Check Answers

**1. Dot product approaches what as angle → 90°?**

It approaches 0. The formula `a · b = |a||b|cos(θ)`. As θ → 90°, `cos(θ) → 0`,
so `a · b → 0`. At exactly 90°, the vectors are perpendicular and the dot product
is exactly 0. This is the most useful property of the dot product for geometry:
checking if two vectors are perpendicular.

**2. `a × a` — a vector crossed with itself?**

The zero vector (0, 0, 0). The cross product magnitude is `|a||b|sin(θ)`. When you
cross a vector with itself, θ = 0°, so `sin(0°) = 0`, and the magnitude is 0.
Also from the right-hand rule: there is no unique perpendicular direction when both
vectors are the same — the result is undefined, so it is defined as the zero vector.

**3. `(B-A) × (C-A)` — swap B and C, how does the result change?**

The result is negated — it points in the opposite direction. The cross product is
anti-commutative: `(C-A) × (B-A) = -((B-A) × (C-A))`. This is why winding order
(CW vs CCW) matters: swapping vertices reverses the normal direction, flipping which
face is "front" and which is "back" in back-face culling.
