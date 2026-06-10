# Junior to Senior — T10·L0 — Floating-Point Precision

**Prerequisites:** T9·L5 (Testing Parsers). You have a working parser. This
lesson starts Topic 10 — Computational Geometry — with the foundational issue
that affects every geometry calculation: floating-point precision.

**What this lab adds:**
- IEEE 754: why `0.1 + 0.2 !== 0.3`
- Machine epsilon: the smallest representable difference
- Epsilon comparison: `abs(a - b) < EPSILON` instead of `a === b`
- Absolute vs relative tolerance
- Why CAD uses tolerances everywhere

**Time:** 30–45 minutes (mostly conceptual)

---

> **Quick Check — try to answer before reading:**
>
> 1. `0.1 + 0.2 === 0.3` in JavaScript. Is this true or false? Why?
> 2. You test if a point is "on" a line: `distance === 0`. Why will this almost
>    never be true even when the point IS on the line?
> 3. `Number.EPSILON` in JavaScript is ~2.2e-16. Is this a good tolerance for
>    millimetre-level geometry? Why or why not?
>
> *(Answers at the end of this lab)*

---

## The Problem

```ts
console.log(0.1 + 0.2);         // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
```

This is not a JavaScript bug. It is a fundamental property of IEEE 754
double-precision floating-point arithmetic.

**Why:** Decimal fractions like `0.1` have no exact binary representation
(just as `1/3` has no exact decimal representation). The stored value is the
nearest representable binary fraction. When you add two approximate values, the
result is also approximate — not the exact mathematical answer.

---

### Concept: Machine Epsilon

**What it is:** `Number.EPSILON` is the smallest value such that `1 + Number.EPSILON !== 1`.
For IEEE 754 doubles: ~2.22e-16.

**What it means for geometry:** Two coordinates computed through different paths
can differ by many times `Number.EPSILON` and still represent the same geometric point.

**The right tolerance for CNC geometry:**

```ts
// Geometry in millimetres:
// - Machine precision: ±0.001mm (1 micron)
// - Floating-point drift over many operations: ~1e-10 to 1e-12
// - A tolerance of 1e-10 is appropriate for geometric comparisons

const GEOMETRY_EPSILON = 1e-10;  // 0.0000000001 mm — below any physical meaning

function areEqual(a: number, b: number, epsilon = GEOMETRY_EPSILON): boolean {
  return Math.abs(a - b) < epsilon;
}
```

---

### Concept: Absolute vs Relative Tolerance

**Absolute tolerance:** `|a - b| < epsilon`
- Works well for values near 0 (coordinates, small angles)
- Breaks for large values: two numbers 1e12 and 1e12 + 1 differ by 1, which is above epsilon, even though they're essentially equal proportionally

**Relative tolerance:** `|a - b| / max(|a|, |b|) < epsilon`
- Works well for large values
- Breaks for values near 0 (division by near-zero)

**For CAD/CAM geometry (millimetre coordinates):** Use absolute tolerance.
Coordinates are usually in the range 0–1000mm. Absolute epsilon of `1e-10` is
appropriate — far below physical precision but above floating-point drift.

```ts
export const GEOMETRY_EPSILON = 1e-10;

export function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < GEOMETRY_EPSILON;
}

export function nearlyZero(a: number): boolean {
  return Math.abs(a) < GEOMETRY_EPSILON;
}
```

---

## Step 1 — Build the Epsilon Utilities

Create a new project for Topic 10:

```bash
mkdir geometry-lib
cd geometry-lib
npm init -y
npm install -D vitest typescript
```

Create `src/epsilon.ts`:

```ts
export const GEOMETRY_EPSILON = 1e-10;

export function nearlyEqual(a: number, b: number, eps = GEOMETRY_EPSILON): boolean {
  if (a === b) return true;  // handles Infinity and exact equality
  return Math.abs(a - b) < eps;
}

export function nearlyZero(a: number, eps = GEOMETRY_EPSILON): boolean {
  return Math.abs(a) < eps;
}

export function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
```

---

## Step 2 — Write Tests

Create `src/epsilon.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { nearlyEqual, nearlyZero, GEOMETRY_EPSILON } from './epsilon';

describe('floating-point utilities', () => {

  it('0.1 + 0.2 is NOT exactly equal to 0.3', () => {
    expect(0.1 + 0.2 === 0.3).toBe(false);
  });

  it('nearlyEqual considers 0.1+0.2 equal to 0.3', () => {
    expect(nearlyEqual(0.1 + 0.2, 0.3)).toBe(true);
  });

  it('nearlyEqual returns false for clearly different values', () => {
    expect(nearlyEqual(1.0, 2.0)).toBe(false);
  });

  it('nearlyZero returns true for floating-point drift', () => {
    const drift = 1e-15;  // typical floating-point drift
    expect(nearlyZero(drift)).toBe(true);
  });

  it('nearlyZero returns false for meaningful small values', () => {
    expect(nearlyZero(0.001)).toBe(false);   // 1 micrometre is meaningful
  });

  it('exact equality still works for integers and exact values', () => {
    expect(nearlyEqual(1.0, 1.0)).toBe(true);
    expect(nearlyEqual(0, 0)).toBe(true);
  });

  it('GEOMETRY_EPSILON is less than 1 micron (0.001mm)', () => {
    expect(GEOMETRY_EPSILON).toBeLessThan(0.001);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Implement `roundToTolerance`

**You know:** Floating-point issues, epsilon comparison.

**Task:** Implement `roundToTolerance(x: number, precision: number): number`
that rounds to a given number of decimal places (useful for output/display):

```ts
roundToTolerance(0.30000000000000004, 6)  // → 0.3
roundToTolerance(25.4000001, 4)            // → 25.4
roundToTolerance(50.12345678, 3)           // → 50.123
```

This is NOT a replacement for epsilon comparison — it is for clean display output.

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
it('rounds floating-point drift at 6 decimal places', () => {
  expect(roundToTolerance(0.1 + 0.2, 6)).toBe(0.3);
});

it('rounds to specified precision', () => {
  expect(roundToTolerance(25.4000001, 4)).toBe(25.4);
});

it('preserves precision for exact values', () => {
  expect(roundToTolerance(50.0, 3)).toBe(50.0);
});
```

**Important:** `roundToTolerance` is for display and output — not for geometric
comparisons. Always use `nearlyEqual(a, b)` for comparing geometric values.
`round(a) === round(b)` can give wrong answers at the rounding boundary.

</details>

---

## Final Check

| Tool | Use for |
|---|---|
| `nearlyEqual(a, b)` | Comparing coordinates, lengths, angles |
| `nearlyZero(a)` | Checking "is this effectively zero?" |
| `roundToTolerance(x, n)` | Display output only |
| `GEOMETRY_EPSILON = 1e-10` | Below CNC precision, above float drift |
| NOT `===` for floats | Direct equality fails due to float drift |

---

## Quick Check Answers

**1. `0.1 + 0.2 === 0.3` in JavaScript — true or false?**

False. `0.1 + 0.2` evaluates to `0.30000000000000004` because neither 0.1 nor
0.2 can be represented exactly in binary. Their binary approximations sum to a
binary approximation that is not exactly `0.3`. This is fundamental IEEE 754
behaviour — not a JavaScript bug, and not fixable without arbitrary precision arithmetic.

**2. `distance === 0` for a point "on" a line — why almost never true?**

Because floating-point distance calculations accumulate rounding errors. A point
geometrically on a line (constructed to be on it) may have a computed distance of
`2.3e-13` instead of exactly `0`. The test `distance === 0` fails even though
the point is geometrically on the line. Use `nearlyZero(distance)` or
`distance < GEOMETRY_EPSILON`.

**3. `Number.EPSILON` (~2.2e-16) — good for millimetre geometry?**

Too small. `Number.EPSILON` is the precision of the floating-point representation
itself. But geometric computations (adding, multiplying coordinates) accumulate
error over many steps, producing drift of ~1e-12 to 1e-10. Using `Number.EPSILON`
as the comparison tolerance would miss these accumulated errors. Use `1e-10` for
geometry — it is below any physical CNC precision (1 micron = 0.001mm) but above
typical floating-point accumulation drift.
