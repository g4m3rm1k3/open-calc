# SE Masterclass — LAB-67 — Vectors

**Language: TypeScript (Browser)** — the runtime for all of Phase 6. Same Vite setup as Phase 3.

**Prerequisites:** All of Phase 5. LAB-33's component pattern renders this lab's canvas visualizations.

**What this lab adds:**
- A vector as DIRECTION + MAGNITUDE — not a "point," even though it's often drawn as an arrow from one
- Addition, subtraction, and scaling — building movement and combined forces
- Magnitude (length) and normalization — turning any vector into a pure direction
- The dot product — what it actually measures, and why it reveals "facing toward" vs. "facing away"

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A point `(3, 4)` and a vector `(3, 4)` LOOK identical as two numbers. What's the conceptual difference?
> 2. If you ADD a velocity vector to a position every frame, what real-world motion does that simulate?
> 3. Two vectors point in EXACTLY the same direction. What should their dot product's SIGN tell you? What about two pointing in OPPOSITE directions?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows arrows drawn on a canvas, and DevTools console shows:

```
=== Vector Basics ===
v1 = (3, 4), v2 = (1, 2)
v1 + v2 = (4, 6)
v1 - v2 = (2, 2)
v1 * 2 = (6, 8)

=== Magnitude and Normalization ===
magnitude of (3, 4): 5   ← the classic 3-4-5 right triangle
normalized (3, 4): (0.6, 0.8)
magnitude of normalized vector: 1.0000  ← always exactly 1, by definition

=== Dot Product ===
(1, 0) . (1, 0) = 1     ← same direction: positive
(1, 0) . (-1, 0) = -1   ← opposite direction: negative
(1, 0) . (0, 1) = 0     ← perpendicular: exactly zero
(2, 3) . (4, -1) = 5    ← general case

=== Application: Is the Enemy In Front of Me? ===
facing direction: (1, 0) (facing right)
enemy at (5, 0) relative to me: dot = 5 -> IN FRONT
enemy at (-5, 0) relative to me: dot = -5 -> BEHIND
```

---

### Concept: A Vector Is Direction + Magnitude, Not a Point

**What it is:** A **vector** represents a DISPLACEMENT — "3 units right, 4 units up" — not a location. It's often DRAWN as an arrow from the origin (or from wherever it's being applied) to make it visually resemble a point, but conceptually, `(3, 4)` as a vector means "move 3 right and 4 up from wherever you currently are," while `(3, 4)` as a POINT means "the specific location 3 right and 4 up from the origin." The confusion is common because they use the SAME numbers — the difference is entirely in how you USE them.

---

## Step 1 — A Vector2 Class

```ts
// vector2.ts
export class Vector2 {
  constructor(public x: number, public y: number) {}

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y)
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y)
  }

  scale(factor: number): Vector2 {
    return new Vector2(this.x * factor, this.y * factor)
  }

  toString(): string {
    return `(${this.x}, ${this.y})`
  }
}
```

```ts
// main.ts
import { Vector2 } from './vector2'

console.log('=== Vector Basics ===')
const v1 = new Vector2(3, 4)
const v2 = new Vector2(1, 2)
console.log(`v1 = ${v1}, v2 = ${v2}`)
console.log(`v1 + v2 = ${v1.add(v2)}`)
console.log(`v1 - v2 = ${v1.subtract(v2)}`)
console.log(`v1 * 2 = ${v1.scale(2)}`)
```

### SAVE AND TRY

```bash
npm run dev
```

Check DevTools console.

**Expected:**
```
=== Vector Basics ===
v1 = (3, 4), v2 = (1, 2)
v1 + v2 = (4, 6)
v1 - v2 = (2, 2)
v1 * 2 = (6, 8)
```

**Confirm `add`/`subtract`/`scale` each return a NEW `Vector2`, never mutating the originals:** This is LAB-01's value-semantics instinct, deliberately preserved for objects — `v1.add(v2)` doesn't change `v1` or `v2`, exactly like `3 + 4` doesn't change `3`. This matters enormously once vectors represent things like VELOCITY that get combined and reused across many calculations — accidental mutation would be a very hard bug to track down.

---

## Step 2 — Magnitude and Normalization

```ts
// Add to Vector2:
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)      // ← add: the Pythagorean theorem, directly
  }

  normalize(): Vector2 {
    const mag = this.magnitude()
    if (mag === 0) return new Vector2(0, 0)                    // guard — LAB-09's boundary instinct: no division by zero
    return new Vector2(this.x / mag, this.y / mag)
  }
```

Add to `main.ts`:

```ts
console.log('\n=== Magnitude and Normalization ===')
console.log(`magnitude of (3, 4): ${v1.magnitude()}   ← the classic 3-4-5 right triangle`)
const normalized = v1.normalize()
console.log(`normalized (3, 4): (${normalized.x}, ${normalized.y})`)
console.log(`magnitude of normalized vector: ${normalized.magnitude().toFixed(4)}  ← always exactly 1, by definition`)
```

### SAVE AND TRY

**Expected:**
```
=== Magnitude and Normalization ===
magnitude of (3, 4): 5   ← the classic 3-4-5 right triangle
normalized (3, 4): (0.6, 0.8)
magnitude of normalized vector: 1.0000  ← always exactly 1, by definition
```

**Confirm `magnitude()` is LITERALLY the Pythagorean theorem:** `sqrt(x² + y²)` computes the length of the HYPOTENUSE of a right triangle with legs `x` and `y` — a vector's magnitude IS that hypotenuse length, geometrically. `(3, 4)` is the classic case where this comes out to a clean whole number (`5`), which is why it's used as the canonical teaching example.

**Confirm normalization produces a PURE direction:** A normalized vector ALWAYS has magnitude exactly `1` (a "unit vector") — dividing EVERY component by the ORIGINAL magnitude scales the vector down (or up) until its length is exactly 1, while its DIRECTION stays unchanged. This is why normalized vectors are used to represent "facing direction" independent of speed or distance.

---

### Concept: The Dot Product

**What it is:** The **dot product** of two vectors, `a · b = a.x * b.x + a.y * b.y`, produces a SINGLE NUMBER (not a vector) that measures how much the two vectors point in the SAME direction. Geometrically, `a · b = |a| |b| cos(θ)`, where `θ` is the angle between them — but the PRACTICAL, memorable takeaway is the SIGN: positive means "generally the same direction," negative means "generally opposite," and exactly zero means "perpendicular."

---

## Step 3 — The Dot Product

```ts
// Add to Vector2:
  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y
  }
```

Add to `main.ts`:

```ts
console.log('\n=== Dot Product ===')
const right = new Vector2(1, 0)
const left = new Vector2(-1, 0)
const up = new Vector2(0, 1)

console.log(`(1, 0) . (1, 0) = ${right.dot(right)}     ← same direction: positive`)
console.log(`(1, 0) . (-1, 0) = ${right.dot(left)}   ← opposite direction: negative`)
console.log(`(1, 0) . (0, 1) = ${right.dot(up)}     ← perpendicular: exactly zero`)

const a = new Vector2(2, 3)
const b = new Vector2(4, -1)
console.log(`(2, 3) . (4, -1) = ${a.dot(b)}    ← general case`)
```

### SAVE AND TRY

**Expected:**
```
=== Dot Product ===
(1, 0) . (1, 0) = 1     ← same direction: positive
(1, 0) . (-1, 0) = -1   ← opposite direction: negative
(1, 0) . (0, 1) = 0     ← perpendicular: exactly zero
(2, 3) . (4, -1) = 5    ← general case
```

**Confirm the three SIGN cases by hand:** `(1,0)·(1,0) = 1*1 + 0*0 = 1` (positive — identical vectors always point the "same" way). `(1,0)·(-1,0) = 1*(-1) + 0*0 = -1` (negative — exactly opposite). `(1,0)·(0,1) = 1*0 + 0*1 = 0` (zero — perpendicular, the RIGHT ANGLE case, is EXACTLY where the dot product crosses from positive to negative). This zero-at-90-degrees property is what makes the dot product so useful for "is this roughly facing that way?" checks.

---

## 🎯 Challenge: Is the Enemy In Front of Me?

**You know:** The dot product's sign reveals "same direction" vs. "opposite direction." A game character's FACING direction, dotted with the direction TOWARD another object, reveals whether that object is roughly IN FRONT or BEHIND.

**Task:** Given a facing direction and an enemy's RELATIVE position (enemy position minus your position), use the dot product to determine "in front" or "behind."

<details>
<summary>▶ Show Solution</summary>

```ts
function isInFront(facing: Vector2, relativePosition: Vector2): boolean {
  return facing.dot(relativePosition) > 0
}

console.log('\n=== Application: Is the Enemy In Front of Me? ===')
const facing = new Vector2(1, 0)
console.log(`facing direction: ${facing} (facing right)`)

const enemyFront = new Vector2(5, 0)
console.log(`enemy at (5, 0) relative to me: dot = ${facing.dot(enemyFront)} -> ${isInFront(facing, enemyFront) ? 'IN FRONT' : 'BEHIND'}`)

const enemyBehind = new Vector2(-5, 0)
console.log(`enemy at (-5, 0) relative to me: dot = ${facing.dot(enemyBehind)} -> ${isInFront(facing, enemyBehind) ? 'IN FRONT' : 'BEHIND'}`)
```

**Key insight:** This is a REAL technique used in game AI (enemy vision cones), CAD software (surface normal orientation — "does this face point toward the camera?"), and physics engines — a single dot product, checking only its SIGN, answers a genuinely useful spatial question without needing to compute an actual ANGLE (which would require the slower `Math.acos` and matter less than just knowing the sign in most cases).

</details>

### SAVE AND TRY

**Expected:**
```
=== Application: Is the Enemy In Front of Me? ===
facing direction: (1, 0) (facing right)
enemy at (5, 0) relative to me: dot = 5 -> IN FRONT
enemy at (-5, 0) relative to me: dot = -5 -> BEHIND
```

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| `Vector2` add/subtract/scale | Every physics engine, every game's movement code |
| Normalization | "Facing direction" in games, surface normals in 3D graphics |
| Dot product sign check | Vision cones, backface culling, lighting calculations (`surface · light direction`) |

**Where you will see this again:** LAB-68 (Matrices) builds the NEXT layer — transforming vectors (rotating, scaling, translating) via matrix multiplication. LAB-73 (Physics Fundamentals) uses `Vector2` directly for velocity and acceleration.

---

## Final Check

| Feature | How to verify |
|---|---|
| `Vector2` add/subtract/scale produce correct results without mutating originals | Step 1 |
| Magnitude correctly computes vector length via the Pythagorean theorem | Step 2 |
| A normalized vector always has magnitude exactly 1 | Step 2 |
| The dot product's sign correctly distinguishes same/opposite/perpendicular directions | Step 3 |
| The "is in front" check correctly classifies both a front and a behind case | Challenge |
| You can explain, without notes, the conceptual difference between a point and a vector | Concept box |

---

## Quick Check Answers

**1. Point `(3,4)` vs. vector `(3,4)` — conceptual difference?**

A POINT is a specific LOCATION — "the spot 3 right and 4 up from the origin." A VECTOR is a DISPLACEMENT — "move 3 right and 4 up from WHEREVER YOU CURRENTLY ARE." The same two numbers mean genuinely different things depending on which one you're treating them as — this is why `Vector2` operations like `add` make sense for combining DISPLACEMENTS, but "adding" two POINTS together is usually a meaningless operation (though SUBTRACTING two points, giving the displacement BETWEEN them, is exactly how you'd compute a vector FROM two points).

**2. Adding velocity to position every frame — what motion does this simulate?**

Constant-velocity MOVEMENT — each frame, the object's position shifts by its velocity vector, exactly like `position = position.add(velocity)` repeated over time produces smooth, continuous motion in the velocity's direction, at a speed proportional to the velocity's magnitude. This is the most basic building block of LAB-73's physics simulation — position, updated by velocity, every frame.

**3. Same-direction vectors — dot product sign? Opposite-direction?**

Same direction: POSITIVE (Step 3: `(1,0)·(1,0) = 1`). Opposite direction: NEGATIVE (Step 3: `(1,0)·(-1,0) = -1`). And exactly PERPENDICULAR sits precisely at the boundary between them: zero (Step 3: `(1,0)·(0,1) = 0`) — this three-way sign classification (positive/negative/zero) is the single most commonly-used practical application of the dot product, demonstrated directly in the Challenge's "is the enemy in front of me" check.

---

*Next: [LAB-68 — Matrices and Transforms](LAB-68-matrices-transforms.md) — TypeScript (Browser), same module*
