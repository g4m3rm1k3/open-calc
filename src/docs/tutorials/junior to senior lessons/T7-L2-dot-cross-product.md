# Junior to Senior — T7·L2 — Dot Product and Cross Product

**Prerequisites:** T7·L1 (Vectors). You have a working `Vec3` class. This lesson
covers the two vector products that power almost every 3D geometry operation —
angle detection, surface normals, and winding order.

**What this lab adds:**
- Dot product: `a · b = |a||b|cos(θ)` — the cosine of the angle between vectors
- Using dot product: checking direction, projecting vectors
- Cross product: `a × b` — a vector perpendicular to both
- Using cross product: computing surface normals, winding order
- Right-hand rule: which way the cross product points

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `a · b = 0`. What does this tell you about the angle between `a` and `b`?
> 2. `a · b = -0.5`. Is the angle between them greater or less than 90°?
> 3. You have three vertices of a triangle: A, B, C in counter-clockwise order
>    when viewed from the front. You need the outward-facing normal. Which cross
>    product gives it?
>
> *(Answers at the end of this lab)*

---

## The Geometric Meaning

### Dot Product: Measuring Alignment

`a · b = |a||b|cos(θ)` — where θ is the angle between the vectors.

For unit vectors (magnitude 1), this simplifies to: `a · b = cos(θ)`.

| Dot product | Angle | Interpretation |
|---|---|---|
| `a · b = 1` | 0° | Same direction (unit vectors) |
| `a · b = 0` | 90° | Perpendicular |
| `a · b = -1` | 180° | Opposite directions |
| `a · b > 0` | < 90° | Generally same direction |
| `a · b < 0` | > 90° | Generally opposite directions |

### Cross Product: Computing Perpendiculars

`a × b = (ay*bz - az*by, az*bx - ax*bz, ax*by - ay*bx)`

The result is a vector perpendicular to both `a` and `b`. Its magnitude is
`|a||b|sin(θ)` — maximum when perpendicular, zero when parallel.

**Right-hand rule:** Point fingers of your right hand from `a` toward `b` (curling).
Your thumb points in the direction of `a × b`.

In Three.js (Y-up, right-handed):
- `X × Y = Z`
- `Y × Z = X`
- `Z × X = Y`
- `X × X = (0,0,0)` (parallel vectors have zero cross product)

---

## Step 1 — Add Cross Product and Angle to `Vec3`

Update `src/math/Vec3.ts`:

```ts
cross(other: Vec3): Vec3 {
  return new Vec3(
    this.y * other.z - this.z * other.y,
    this.z * other.x - this.x * other.z,
    this.x * other.y - this.y * other.x,
  );
}

angleTo(other: Vec3): number {
  // Returns angle in radians between 0 and π:
  const cosAngle = this.normalise().dot(other.normalise());
  // Clamp to [-1, 1] to avoid NaN from floating-point errors:
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

projectOnto(other: Vec3): Vec3 {
  // The component of this vector along the direction of other:
  const n = other.normalise();
  return n.scale(this.dot(n));
}
```

---

## Step 2 — Write Tests

Add to `src/math/Vec3.test.ts`:

```ts
describe('cross product', () => {

  it('X cross Y equals Z (right-hand rule)', () => {
    const result = Vec3.X_AXIS.cross(Vec3.Y_AXIS);
    expect(result.equals(Vec3.Z_AXIS)).toBe(true);
  });

  it('Y cross Z equals X', () => {
    expect(Vec3.Y_AXIS.cross(Vec3.Z_AXIS).equals(Vec3.X_AXIS)).toBe(true);
  });

  it('cross product of identical vectors is the zero vector', () => {
    const v      = new Vec3(1, 2, 3);
    const result = v.cross(v);
    expect(result.equals(Vec3.ZERO)).toBe(true);
  });

  it('cross product is anti-commutative: A×B = -(B×A)', () => {
    const a = new Vec3(1, 2, 3);
    const b = new Vec3(4, 5, 6);
    const ab = a.cross(b);
    const ba = b.cross(a);
    expect(ab.equals(ba.negate())).toBe(true);
  });

  it('result is perpendicular to both inputs', () => {
    const a = new Vec3(1, 2, 0);
    const b = new Vec3(3, 0, 0);
    const c = a.cross(b);
    // c · a = 0 and c · b = 0:
    expect(Math.abs(c.dot(a))).toBeLessThan(1e-10);
    expect(Math.abs(c.dot(b))).toBeLessThan(1e-10);
  });

  it('triangle face normal points outward for CCW winding', () => {
    // Counter-clockwise triangle on XY plane viewed from +Z:
    const A = new Vec3(0, 0, 0);
    const B = new Vec3(1, 0, 0);
    const C = new Vec3(0, 1, 0);

    const AB     = B.sub(A);
    const AC     = C.sub(A);
    const normal = AB.cross(AC).normalise();

    // Normal should point toward +Z (out of the screen for CCW viewing):
    expect(normal.z).toBeGreaterThan(0);
    expect(Math.abs(normal.z)).toBeCloseTo(1);
  });
});

describe('angleTo', () => {

  it('perpendicular vectors have angle π/2', () => {
    const angle = Vec3.X_AXIS.angleTo(Vec3.Y_AXIS);
    expect(angle).toBeCloseTo(Math.PI / 2);
  });

  it('parallel vectors have angle 0', () => {
    expect(Vec3.X_AXIS.angleTo(Vec3.X_AXIS)).toBeCloseTo(0);
  });

  it('opposite vectors have angle π', () => {
    expect(Vec3.X_AXIS.angleTo(Vec3.X_AXIS.negate())).toBeCloseTo(Math.PI);
  });

  it('45-degree vectors', () => {
    const a = new Vec3(1, 0, 0);
    const b = new Vec3(1, 1, 0).normalise();
    expect(a.angleTo(b)).toBeCloseTo(Math.PI / 4);
  });

});

describe('projectOnto', () => {

  it('projects a vector onto an axis', () => {
    const v = new Vec3(3, 4, 0);
    const proj = v.projectOnto(Vec3.X_AXIS);
    expect(proj.equals(new Vec3(3, 0, 0))).toBe(true);
  });

  it('projection onto a perpendicular is the zero vector', () => {
    const proj = Vec3.X_AXIS.projectOnto(Vec3.Y_AXIS);
    expect(proj.magnitude()).toBeCloseTo(0);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## Step 3 — Apply: Triangle Normal and Winding Order

The cross product is the core of surface normal computation — used in every
3D rendering engine for lighting calculations.

```ts
// Given three vertices of a triangle, compute the face normal:
function triangleNormal(A: Vec3, B: Vec3, C: Vec3): Vec3 {
  const AB = B.sub(A);
  const AC = C.sub(A);
  return AB.cross(AC).normalise();
}

// Given a normal and a light direction, compute how lit the surface is:
function diffuseLighting(normal: Vec3, lightDir: Vec3): number {
  // Clamp to 0 — surfaces facing away from the light receive no light:
  return Math.max(0, normal.dot(lightDir.normalise()));
}

// Example:
const lightDir  = new Vec3(0, 1, 0);   // light from directly above
const normal1   = new Vec3(0, 1, 0);   // face pointing up
const normal2   = new Vec3(0, -1, 0);  // face pointing down

console.log(diffuseLighting(normal1, lightDir));  // → 1.0 (fully lit)
console.log(diffuseLighting(normal2, lightDir));  // → 0.0 (in shadow)
```

---

## 🎯 Challenge: Compute Triangle Area

**You know:** Cross product, magnitude.

**Task:** Add `triangleArea(A: Vec3, B: Vec3, C: Vec3): number` that computes
the area of the triangle using the cross product.

Mathematical fact: the area of the triangle is half the magnitude of `AB × AC`.

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

**Tests:**
```ts
it('area of a unit right triangle is 0.5', () => {
  const A = new Vec3(0, 0, 0);
  const B = new Vec3(1, 0, 0);
  const C = new Vec3(0, 1, 0);
  expect(triangleArea(A, B, C)).toBeCloseTo(0.5);
});

it('area of a 3-4-5 right triangle is 6', () => {
  const A = new Vec3(0, 0, 0);
  const B = new Vec3(3, 0, 0);
  const C = new Vec3(0, 4, 0);
  // base=3, height=4, area = 0.5*3*4 = 6
  expect(triangleArea(A, B, C)).toBeCloseTo(6);
});
```

**Implementation:**
```ts
function triangleArea(A: Vec3, B: Vec3, C: Vec3): number {
  const AB = B.sub(A);
  const AC = C.sub(A);
  return AB.cross(AC).magnitude() / 2;
}
```

**Key insight:** `|AB × AC| = |AB||AC|sin(θ)` is the area of the parallelogram
formed by AB and AC. The triangle is half the parallelogram. This is a fundamental
formula used in mesh area calculations, UV unwrapping, and collision detection.

</details>

---

## Final Check

| Product | Formula | Result type | Use case |
|---|---|---|---|
| Dot | `ax*bx + ay*by + az*bz` | Scalar | Angle, alignment, lighting |
| Cross | `(ay*bz-az*by, ...)` | Vector (perpendicular) | Normals, winding order |

---

## Quick Check Answers

**1. `a · b = 0`. What does this tell you?**

The vectors are perpendicular (90° angle). `cos(90°) = 0`. This is the most
practically useful dot product result — it tells you two directions are
completely orthogonal. Used in: checking if a ray misses a surface (ray ·
normal = 0 means the ray is parallel to the surface).

**2. `a · b = -0.5`. Greater or less than 90°?**

Greater than 90°. `cos(θ) = -0.5` means `θ = 120°`. Any negative dot product
means the angle between the vectors is obtuse (between 90° and 180°).

**3. Counter-clockwise vertices A, B, C. Which cross product gives the outward normal?**

`(B - A) × (C - A)`. The right-hand rule: curling fingers from AB toward AC
(counter-clockwise when viewed from front) points the thumb toward the viewer
(positive Z in a Y-up coordinate system). This gives the outward-facing normal
for CCW winding. Clockwise winding would require `(C - A) × (B - A)` or just
negate the result.
