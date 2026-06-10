# Junior to Senior — T10·L0 — Floating-Point Precision

**Prerequisites:** T9·L5 (Testing Parsers). You have a working G-code parser. This
lesson starts Topic 10 — Computational Geometry — by showing the foundational problem
that affects EVERY geometry calculation: floating-point precision. You will see the
problem break code before learning how to fix it.

**What this lab adds:**
- WHY `0.1 + 0.2 !== 0.3` — the binary representation explained with a specific example
- WHAT breaks in geometry code if you use `===` for coordinate comparison
- WHY `Number.EPSILON` is NOT the right tolerance for geometry (too small)
- HOW to choose the right epsilon for CNC-scale geometry (millimetres)
- The difference between absolute and relative tolerance — and which to use when

**Time:** 30–45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Open a browser console right now. Type `0.1 + 0.2`. What do you see?
>    Now type `0.1 + 0.2 === 0.3`. True or false?
> 2. You check if two points are the same: `if (p1.x === p2.x && p1.y === p2.y)`.
>    Both points were computed from the same input through different paths.
>    Mathematically they should be equal. What might actually happen?
> 3. `Number.EPSILON` is ~2.2e-16. A CNC machine has precision of ±0.001mm.
>    Why is `Number.EPSILON` the wrong tolerance to use?
>
> *(Answers at the end of this lab)*

---

## Step 1 — See the Problem Break Real Code

Create `src/epsilon-demo.ts`:

```ts
// Demonstrates how floating-point errors break naive equality checks
console.log('=== The Floating-Point Problem ===');
console.log('0.1 + 0.2 =', 0.1 + 0.2);
console.log('0.1 + 0.2 === 0.3:', 0.1 + 0.2 === 0.3);
```

### SAVE AND TRY

```bash
npx ts-node src/epsilon-demo.ts
```

**You should see:**
```
=== The Floating-Point Problem ===
0.1 + 0.2 = 0.30000000000000004
0.1 + 0.2 === 0.3: false
```

The equality check fails even though the mathematical answer is 0.3. This is not a
TypeScript bug. It happens in every language that uses IEEE 754 floating-point numbers:
JavaScript, Python, C, Java, Rust — all of them.

---

### Concept: Why `0.1 + 0.2 !== 0.3` — The Binary Fraction Problem

**What it is:** Computers store numbers in binary (base 2). Just as `1/3` cannot be
exactly expressed in decimal (0.333...), many simple decimal fractions cannot be
exactly expressed in binary.

**The specific breakdown for 0.1:**

```
0.1 in binary:
  0.1 × 2 = 0.2 → bit 0
  0.2 × 2 = 0.4 → bit 0
  0.4 × 2 = 0.8 → bit 0
  0.8 × 2 = 1.6 → bit 1, remainder 0.6
  0.6 × 2 = 1.2 → bit 1, remainder 0.2
  0.2 × 2 = 0.4 → bit 0  ← we've been here before
  ... repeats forever

Result: 0.00011001100110011... (infinite repeating binary)
```

IEEE 754 doubles have 53 bits of precision — so `0.1` is stored as the nearest
53-bit binary fraction, which is NOT exactly 0.1. When you add two approximate
numbers, you get an approximate result.

**The problem this creates in geometry code:**

```ts
// Two different calculation paths to the "same" point:
const midX_v1 = (0 + 1) / 2;              // 0.5 — exact
const midX_v2 = 0 + (1 - 0) * 0.5;        // 0.5 — exact (lucky)

// Less lucky:
const x1 = 0.1 + 0.2;           // 0.30000000000000004
const x2 = 0.3;                  // exactly 0.3

if (x1 === x2) {                 // false — missed the intersection!
  console.log('points are equal');
}

// In geometry: a line might "not intersect" a plane even though
// mathematically it does — because the computed distance is 0.0000000000000003
// instead of exactly 0.
```

**What it hides:** The problem is INVISIBLE in simple cases. `0.5 + 0.5 === 1.0` is true
(both are exact in binary). The errors appear unpredictably when calculations accumulate
tiny rounding errors. You cannot predict which operations produce exact results.

**Canonical example:** Measuring a wooden beam with a ruler that reads to the nearest millimetre.
You measure twice and get 1,000mm and 1,001mm. Are they the same beam? The measurement tool
has limited precision, so "close enough" is the right comparison — not exact equality.
Floating-point numbers have limited precision; "close enough" is always the right comparison.

**Project Application:** The geometry library computes intersections, distances, and
midpoints. Any function that compares coordinates with `===` will silently fail on
geometrically valid inputs. EVERY comparison must use epsilon.

**Smallest possible example:**

```ts
// WRONG — fails for floating-point values:
if (a === b) { ... }

// CORRECT — works for floating-point values:
if (Math.abs(a - b) < 1e-10) { ... }
```

**You will see this again in:**
- Every numerical algorithm: sorting, intersection, distance calculations
- Unity game engine: `Mathf.Approximately(a, b)` — their epsilon comparison
- Python: `math.isclose(a, b)` — same concept in Python's standard library
- The CAD/CAM application: every geometry comparison uses `nearlyEqual`

**Watch for:** Do NOT use `Number.EPSILON` (~2.2e-16) as your tolerance. That is the
smallest difference representable in floating-point — useful for mathematical analysis,
not for practical geometry. For CNC geometry in millimetres, `1e-10` is appropriate
(below the machine's physical precision, above accumulated floating-point drift).

---

## Step 2 — Build the Epsilon Utilities

Create `src/epsilon.ts`:

```ts
// src/epsilon.ts

// Why 1e-10?
// CNC machine precision: ±0.001mm (1 micron)
// Floating-point drift across multiple operations: ~1e-12 to 1e-10
// 1e-10 is below any physically meaningful distance but above accumulated float errors.
export const GEOMETRY_EPSILON = 1e-10;
```

Add the comparison functions one at a time:

```ts
export function nearlyEqual(a: number, b: number, eps = GEOMETRY_EPSILON): boolean {
  if (a === b) return true;   // exact equality — handles Infinity correctly
  return Math.abs(a - b) < eps;
}
```

### SAVE AND TRY

```bash
npx tsx -e "
import { nearlyEqual } from './src/epsilon.ts';

console.log('0.1+0.2 nearly equals 0.3:', nearlyEqual(0.1 + 0.2, 0.3));
console.log('0.1+0.2 === 0.3:', 0.1 + 0.2 === 0.3);
"
```

**You should see:**
```
0.1+0.2 nearly equals 0.3: true
0.1+0.2 === 0.3: false
```

`nearlyEqual` returns true; `===` returns false. The same numbers, two different answers.
This is why the epsilon function exists.

**Change something:** Change `eps = GEOMETRY_EPSILON` to `eps = 1e-20` (extremely tight).
Expected: `nearlyEqual(0.1 + 0.2, 0.3)` now returns `false` — the tolerance is so tight
that the floating-point error is outside it. Change back to `GEOMETRY_EPSILON`.

Add `nearlyZero`:

```ts
export function nearlyZero(a: number, eps = GEOMETRY_EPSILON): boolean {
  return Math.abs(a) < eps;
}
```

### SAVE AND TRY

```bash
npx tsx -e "
import { nearlyZero } from './src/epsilon.ts';

// In geometry: 'is this point on the line?' means 'is the distance approximately 0?'
const distance = 0.000000000001;  // 1e-12 — floating-point drift, not a real distance
console.log('1e-12 is nearly zero:', nearlyZero(distance));    // true — below epsilon
console.log('0.001 is nearly zero:', nearlyZero(0.001));        // false — meaningful distance
"
```

**You should see:**
```
1e-12 is nearly zero: true
0.001 is nearly zero: false
```

---

### Concept: Absolute vs Relative Tolerance — Which to Use When

**What it is:** There are two ways to define "close enough":

- **Absolute:** `|a - b| < epsilon` — the numbers differ by less than epsilon
- **Relative:** `|a - b| / max(|a|, |b|) < epsilon` — the numbers differ by less than epsilon PERCENT

**The problem with using absolute tolerance for large numbers:**

```ts
// Absolute tolerance = 1e-10 for two large numbers:
const a = 1_000_000_000.0;       // 1 billion
const b = 1_000_000_000.0001;    // 1 billion + 0.0001

nearlyEqual(a, b, 1e-10);  // → FALSE
// But the difference is 0.0001 — which is tiny compared to 1 billion!
// Relatively they are 0.0001/1000000000 = 1e-13 apart — negligibly close.
```

**The problem with using relative tolerance for small numbers near zero:**

```ts
const a = 0.0;
const b = 1e-15;    // tiny but not zero

// Relative tolerance: |0 - 1e-15| / max(0, 1e-15) = 1 (100% different!)
// → NOT equal — even though both are effectively zero in geometry
```

**For CAD/CAM geometry in millimetres:**

Use ABSOLUTE tolerance. Coordinates range from 0–2000mm. At this scale, `1e-10` is:
- Far smaller than machine precision (0.001mm minimum feature size)
- Far larger than floating-point drift (1e-13 typical)
- Safe from the large-number problem (1e-10 of 2000mm is 2e-7mm — still much less than machine precision)

**You will see this again in:**
- Python: `math.isclose(a, b, rel_tol=1e-9, abs_tol=0.0)` — supports both
- NumPy: `np.isclose(a, b, rtol=1e-5, atol=1e-8)` — uses both together
- The general rule: use relative for scientific computing, absolute for fixed-scale geometry

---

## Step 3 — Write the Tests

Create `src/epsilon.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { nearlyEqual, nearlyZero, GEOMETRY_EPSILON } from './epsilon';

describe('floating-point utilities', () => {

  it('0.1 + 0.2 is NOT === 0.3 (the fundamental problem)', () => {
    // This test documents the problem this module solves:
    expect(0.1 + 0.2 === 0.3).toBe(false);   // the bug exists
    expect(nearlyEqual(0.1 + 0.2, 0.3)).toBe(true);  // nearlyEqual fixes it
  });

  it('nearlyEqual returns true for numbers within epsilon', () => {
    const drift = 1e-12;   // typical floating-point drift
    expect(nearlyEqual(1.0, 1.0 + drift)).toBe(true);
  });

  it('nearlyEqual returns false for numbers outside epsilon', () => {
    expect(nearlyEqual(1.0, 2.0)).toBe(false);
    expect(nearlyEqual(0, 0.001)).toBe(false);  // 1 micron — physically meaningful
  });

  it('nearlyEqual handles exact equality (including Infinity)', () => {
    expect(nearlyEqual(Infinity, Infinity)).toBe(true);
    expect(nearlyEqual(5.0, 5.0)).toBe(true);
  });

  it('nearlyZero returns true for floating-point drift', () => {
    const drift = 1e-15;
    expect(nearlyZero(drift)).toBe(true);
  });

  it('nearlyZero returns false for meaningful small values', () => {
    expect(nearlyZero(0.001)).toBe(false);   // 1 micron is meaningful
    expect(nearlyZero(0.0001)).toBe(false);  // 0.1 micron is still meaningful
  });

  it('GEOMETRY_EPSILON is less than 1 micron (0.001mm) — below machine precision', () => {
    expect(GEOMETRY_EPSILON).toBeLessThan(0.001);
  });

  it('GEOMETRY_EPSILON is greater than typical float drift (~1e-15)', () => {
    expect(GEOMETRY_EPSILON).toBeGreaterThan(1e-15);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/epsilon.test.ts
```

**You should see:**
```
✓ 0.1 + 0.2 is NOT === 0.3 (the fundamental problem)
✓ nearlyEqual returns true for numbers within epsilon
✓ nearlyEqual returns false for numbers outside epsilon
...
8 passed
```

---

## 🎯 Challenge: Implement `roundToTolerance`

**You know:** Why floating-point values drift. Why epsilon comparison is needed.

**The mechanism to understand first:**

`roundToTolerance` is for DISPLAY, not for comparison. When showing a coordinate to a
user, you want `1.0000000000000002` to display as `1.0`. This is `Math.round(x * 10^n) / 10^n`.

```ts
roundToTolerance(0.30000000000000004, 6)  // → 0.3
roundToTolerance(25.4000001, 4)            // → 25.4
```

This is NOT a replacement for `nearlyEqual` — it is for output formatting only.

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function roundToTolerance(x: number, decimalPlaces: number): number {
  const factor = 10 ** decimalPlaces;
  return Math.round(x * factor) / factor;
}
```

**Tests:**
```ts
it('rounds floating-point drift to the specified places', () => {
  expect(roundToTolerance(0.1 + 0.2, 6)).toBe(0.3);
});

it('rounds to the specified number of decimal places', () => {
  expect(roundToTolerance(25.4000001, 4)).toBe(25.4);
});

it('does not round meaningful precision away', () => {
  expect(roundToTolerance(25.123, 3)).toBe(25.123);
});
```

**Key insight:** `roundToTolerance` is for displaying coordinates to users. NEVER use
it for geometric comparisons — rounding before comparison loses information and introduces
its own errors. Always use `nearlyEqual` for comparisons.

</details>

---

## Final Check

| Tool | Use for | NOT for |
|---|---|---|
| `nearlyEqual(a, b)` | Comparing coordinates | Displaying to users |
| `nearlyZero(a)` | Checking "is this zero?" | Exact arithmetic |
| `roundToTolerance(x, n)` | Display output | Geometric comparisons |
| `GEOMETRY_EPSILON = 1e-10` | All geometry checks | Scientific computing |

---

## Quick Check Answers

**1. `0.1 + 0.2` in a browser console. What do you see?**

`0.30000000000000004`. The decimal number `0.1` has no exact binary representation,
so the stored value is the nearest 53-bit approximation. Adding two approximations
gives an approximation that is not exactly 0.3. `0.1 + 0.2 === 0.3` returns `false`.

**2. Two points computed through different paths — could `===` fail?**

Yes. Even if both computations start from the same input, intermediate operations
accumulate different rounding errors. Path A might compute `x = 0.1 + 0.2 = 0.30000000000000004`.
Path B might compute `x = 3.0 / 10.0 = 0.3`. These are the same mathematical value
but different floating-point values. `===` returns false. `nearlyEqual` returns true.

**3. Why is `Number.EPSILON` (~2.2e-16) wrong for geometry?**

`Number.EPSILON` is the precision of the floating-point representation itself.
But after multiple arithmetic operations, errors accumulate to 100–10,000 times
`Number.EPSILON` (1e-14 to 1e-12 range). Using `Number.EPSILON` as the tolerance
would cause `nearlyEqual` to return `false` for points that are geometrically
identical — the tolerance is too tight for the actual errors that occur.
