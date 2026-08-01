# SE Masterclass — LAB-68 — Matrices and Transforms

**Language: TypeScript (Browser)** — same setup as LAB-67.

**Prerequisites:** LAB-67 (`Vector2` — matrices transform vectors/points, this lab's entire subject).

**What this lab adds:**
- A matrix as a REUSABLE RECIPE for transforming points — translate, rotate, scale — expressed uniformly
- `Matrix3` (a 2D "homogeneous" 3×3 matrix) applied to a point, producing a transformed point
- Composing MULTIPLE transforms into ONE matrix via multiplication
- Why the ORDER of composition matters — rotate-then-translate is NOT the same as translate-then-rotate

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Moving a shape 10 pixels right can be done by adding `(10, 0)` to every point directly. Why bother with a MATRIX for something this simple?
> 2. Rotating a shape AROUND THE ORIGIN, then translating it 100 pixels right, vs. translating FIRST, then rotating — do these produce the SAME final shape?
> 3. What does "composing" two transforms into ONE matrix let you do that applying them SEPARATELY, one after another, does not?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows a shape being translated, rotated, and scaled on a canvas, and DevTools console shows:

```
=== Identity Matrix: No Change ===
point (5, 3) through identity matrix: (5, 3)

=== Translation ===
translate(10, 20) applied to (5, 3): (15, 23)

=== Rotation ===
rotate(90°) applied to (1, 0): (0.00, 1.00)   ← "right" becomes "up" after a 90° turn
rotate(90°) applied to (0, 1): (-1.00, 0.00)  ← "up" becomes "left"

=== Scale ===
scale(2, 3) applied to (5, 4): (10, 12)

=== Composition: Order Matters ===
rotate-then-translate: (1,0) -> rotate 90° -> (0,1) -> translate(10,0) -> (10, 1)
translate-then-rotate: (1,0) -> translate(10,0) -> (11,0) -> rotate 90° -> (0, 11)
  ← DIFFERENT final points from the SAME two operations, different ORDER
```

---

### Concept: A Matrix Is a Reusable Transform Recipe

**What it is:** A **matrix** encodes a spatial transformation (translate, rotate, scale, or a combination) as a fixed set of numbers, which can be APPLIED to any point via a defined multiplication rule. The power: once built, the SAME matrix can transform a shape's HUNDREDS of points identically, and MULTIPLE matrices can be COMBINED into one before ever touching a single point.

---

## Step 1 — A Matrix3 Class and the Identity Matrix

```ts
// matrix3.ts
import { Vector2 } from './vector2'

export class Matrix3 {
  // stored as a flat array, row-major: [a, b, c, d, e, f, 0, 0, 1] — a 2D "homogeneous" 3x3 matrix
  constructor(public m: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1]) {}   // default: the IDENTITY matrix

  static identity(): Matrix3 {
    return new Matrix3()
  }

  apply(point: Vector2): Vector2 {
    const [a, b, c, d, e, f] = this.m
    return new Vector2(
      a * point.x + b * point.y + c,
      d * point.x + e * point.y + f,
    )
  }
}
```

```ts
// main.ts
import { Vector2 } from './vector2'
import { Matrix3 } from './matrix3'

console.log('=== Identity Matrix: No Change ===')
const identity = Matrix3.identity()
const p1 = new Vector2(5, 3)
console.log(`point (5, 3) through identity matrix: (${identity.apply(p1).x}, ${identity.apply(p1).y})`)
```

### SAVE AND TRY

Check DevTools console.

**Expected:**
```
=== Identity Matrix: No Change ===
point (5, 3) through identity matrix: (5, 3)
```

**Confirm the identity matrix is a genuine "do nothing" recipe:** `[1,0,0, 0,1,0]` produces `a*x + b*y + c = 1*x + 0*y + 0 = x` and `d*x + e*y + f = 0*x + 1*y + 0 = y` — the point comes out UNCHANGED. This is the matrix equivalent of multiplying a number by `1`, or adding `0` — the "no-op" baseline every OTHER transform builds from.

---

## Step 2 — Translation

```ts
// Add to Matrix3:
  static translation(tx: number, ty: number): Matrix3 {
    return new Matrix3([1, 0, tx, 0, 1, ty, 0, 0, 1])          // ← add: the 'c' and 'f' slots hold the offset
  }
```

Add to `main.ts`:

```ts
console.log('\n=== Translation ===')
const translate = Matrix3.translation(10, 20)
const translated = translate.apply(p1)
console.log(`translate(10, 20) applied to (5, 3): (${translated.x}, ${translated.y})`)
```

### SAVE AND TRY

**Expected:**
```
=== Translation ===
translate(10, 20) applied to (5, 3): (15, 23)
```

**Confirm the math by hand:** `a*x + b*y + c = 1*5 + 0*3 + 10 = 15`. `d*x + e*y + f = 0*5 + 1*3 + 20 = 23`. The `c` and `f` slots are EXACTLY the translation offset — everything else in the matrix stays at identity's values, contributing nothing but "pass the coordinate through unchanged" before the offset is added.

---

## Step 3 — Rotation

```ts
// Add to Matrix3:
  static rotation(angleRadians: number): Matrix3 {
    const cos = Math.cos(angleRadians)
    const sin = Math.sin(angleRadians)
    return new Matrix3([cos, -sin, 0, sin, cos, 0, 0, 0, 1])     // ← add: the standard 2D rotation matrix
  }
```

Add to `main.ts`:

```ts
console.log('\n=== Rotation ===')
const rotate90 = Matrix3.rotation(Math.PI / 2)          // 90 degrees, in radians
const right = new Vector2(1, 0)
const up = new Vector2(0, 1)
const rotatedRight = rotate90.apply(right)
const rotatedUp = rotate90.apply(up)
console.log(`rotate(90°) applied to (1, 0): (${rotatedRight.x.toFixed(2)}, ${rotatedRight.y.toFixed(2)})   ← "right" becomes "up" after a 90° turn`)
console.log(`rotate(90°) applied to (0, 1): (${rotatedUp.x.toFixed(2)}, ${rotatedUp.y.toFixed(2)})  ← "up" becomes "left"`)
```

### SAVE AND TRY

**Expected:**
```
=== Rotation ===
rotate(90°) applied to (1, 0): (0.00, 1.00)   ← "right" becomes "up" after a 90° turn
rotate(90°) applied to (0, 1): (-1.00, 0.00)  ← "up" becomes "left"
```

**Confirm the rotation visually, not just numerically:** Rotating `(1, 0)` (pointing "right") by 90° (counter-clockwise, in standard math convention) produces `(0, 1)` ("up") — exactly what turning a compass needle a quarter-turn counter-clockwise from East gives you: North. `cos`/`sin` of the rotation ANGLE, arranged in this specific pattern, is what every 2D graphics library uses internally for rotation — you just built the exact formula by hand.

---

## Step 4 — Scale and Composition

```ts
// Add to Matrix3:
  static scale(sx: number, sy: number): Matrix3 {
    return new Matrix3([sx, 0, 0, 0, sy, 0, 0, 0, 1])
  }

  multiply(other: Matrix3): Matrix3 {                        // ← add: COMBINE two matrices into ONE
    const [a1, b1, c1, d1, e1, f1] = this.m
    const [a2, b2, c2, d2, e2, f2] = other.m
    return new Matrix3([
      a1 * a2 + b1 * d2,       a1 * b2 + b1 * e2,       a1 * c2 + b1 * f2 + c1,
      d1 * a2 + e1 * d2,       d1 * b2 + e1 * e2,       d1 * c2 + e1 * f2 + f1,
      0, 0, 1,
    ])
  }
```

Add to `main.ts`:

```ts
console.log('\n=== Scale ===')
const scaleMatrix = Matrix3.scale(2, 3)
const scaled = scaleMatrix.apply(new Vector2(5, 4))
console.log(`scale(2, 3) applied to (5, 4): (${scaled.x}, ${scaled.y})`)
```

### SAVE AND TRY

**Expected:**
```
=== Scale ===
scale(2, 3) applied to (5, 4): (10, 12)
```

**Confirm scale is the SIMPLEST transform:** `sx`/`sy` directly multiply `x`/`y` — `5*2=10`, `4*3=12` — no cross-terms, no offset, just per-axis stretching.

---

### Concept: Composition and Why Order Matters

**What it is:** `matrixA.multiply(matrixB)` produces ONE new matrix representing "first apply B, then apply A" (matrix multiplication is conventionally applied RIGHT-TO-LEFT when reading `A * B`). Because rotation happens AROUND THE ORIGIN, rotating an ALREADY-TRANSLATED shape spins it around a DIFFERENT center than rotating FIRST and translating after — the two orders produce genuinely different results.

---

## Step 5 — Confirm Order Matters

```ts
console.log('\n=== Composition: Order Matters ===')

const rotateThenTranslate = Matrix3.translation(10, 0).multiply(Matrix3.rotation(Math.PI / 2))
const result1 = rotateThenTranslate.apply(new Vector2(1, 0))
console.log(`rotate-then-translate: (1,0) -> rotate 90° -> (0,1) -> translate(10,0) -> (${result1.x.toFixed(0)}, ${result1.y.toFixed(0)})`)

const translateThenRotate = Matrix3.rotation(Math.PI / 2).multiply(Matrix3.translation(10, 0))
const result2 = translateThenRotate.apply(new Vector2(1, 0))
console.log(`translate-then-rotate: (1,0) -> translate(10,0) -> (11,0) -> rotate 90° -> (${result2.x.toFixed(0)}, ${result2.y.toFixed(0)})`)
console.log('  ← DIFFERENT final points from the SAME two operations, different ORDER')
```

### SAVE AND TRY

**Expected:**
```
=== Composition: Order Matters ===
rotate-then-translate: (1,0) -> rotate 90° -> (0,1) -> translate(10,0) -> (10, 1)
translate-then-rotate: (1,0) -> translate(10,0) -> (11,0) -> rotate 90° -> (0, 11)
  ← DIFFERENT final points from the SAME two operations, different ORDER
```

**Confirm WHY the results diverge, geometrically:** Rotating `(1,0)` by 90° FIRST gives `(0,1)`; translating THAT by `(10,0)` gives `(10,1)`. Translating `(1,0)` by `(10,0)` FIRST gives `(11,0)`; rotating THAT by 90° AROUND THE ORIGIN gives `(0,11)` — because rotation always pivots around `(0,0)`, and the point was ALREADY far from the origin by the time rotation applied, it swings much FARTHER. This is EXACTLY why CSS `transform: translate(...) rotate(...)` and `transform: rotate(...) translate(...)` produce visually different results, and why game engines/CAD software are always explicit about transform ORDER — it is never a cosmetic detail.

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `Matrix3` | Every 2D graphics library's transform matrix (Canvas's own `transform()`, CSS `matrix()`) |
| Rotation/scale/translation matrices | The building blocks behind CSS `transform`, SVG `transform`, game engine object transforms |
| Composition order | Why "parent transform × child transform" in a scene graph must be applied consistently |

**Where you will see this again:** LAB-69 (Coordinate Systems) uses `Matrix3` to convert between world space and screen space. LAB-71 (2D Renderer) and LAB-77 (CAD Viewer) both rely on composed transforms for pan/zoom.

---

## Final Check

| Feature | How to verify |
|---|---|
| The identity matrix leaves a point unchanged | Step 1 |
| Translation correctly offsets a point by `(tx, ty)` | Step 2 |
| Rotation correctly turns `(1,0)` into `(0,1)` at 90° | Step 3 |
| Scale correctly stretches a point per-axis | Step 4 |
| `multiply` correctly composes two matrices into one | Step 4 |
| Rotate-then-translate and translate-then-rotate produce genuinely different results | Step 5 |

---

## Quick Check Answers

**1. Why use a matrix for a simple translation, instead of just adding `(10, 0)`?**

Because a matrix UNIFORMLY represents translate, rotate, AND scale (and combinations of all three) using the SAME `apply(point)` interface — code that transforms a shape doesn't need to special-case "is this a translation or a rotation?"; it just calls `matrix.apply(point)` regardless. This uniformity is what makes COMPOSITION (Step 4–5) possible at all — you can't "compose" a raw addition and a raw multiplication the same clean way you can multiply two matrices together into one combined transform.

**2. Rotate-then-translate vs. translate-then-rotate — same final shape?**

No — demonstrated directly in Step 5: the SAME two operations, in different orders, produced `(10, 1)` vs. `(0, 11)` for the identical starting point. Rotation always pivots around the ORIGIN, so WHERE a point is relative to the origin AT THE TIME rotation is applied fundamentally changes the outcome — this is why transform order is never an implementation detail to gloss over.

**3. What does composing two transforms into ONE matrix let you do that applying them separately doesn't?**

Apply the COMBINED transform to MANY points using a SINGLE multiplication each, instead of running BOTH original transforms on EVERY point individually — for a shape with thousands of points (common in CAD/3D graphics), pre-composing transforms into one matrix is a real, meaningful performance win (LAB-08's complexity lens: the expensive composition work happens ONCE, not once per point), and it also makes REASONING about a combined transform (like a whole hierarchy of parent/child object transforms) cleaner, since the ENTIRE chain collapses to one matrix before ever touching actual geometry.

---

*Next: [LAB-69 — Coordinate Systems](LAB-69-coordinate-systems.md) — TypeScript (Browser), same module*
