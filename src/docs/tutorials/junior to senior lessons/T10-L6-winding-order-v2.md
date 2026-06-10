# Junior to Senior — T10·L6 — Winding Order and Orientation

**Prerequisites:** T10·L5 (Offset Curves). You can offset profiles. This lesson
explains winding order by connecting it to what you can PHYSICALLY SEE — walk the
boundary and notice which side the interior is on.

**What this lab adds:**
- HOW to "walk" a polygon boundary to determine winding — the physical intuition
- WHERE the Shoelace formula comes from — not just "use this formula"
- WHY the sign of the Shoelace result tells you CW vs CCW
- WHAT the specific CNC implication is — G41/G42, contour vs pocket
- Demonstrating with a failing test first, then the working formula

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Walk the vertices of a rectangle: `(0,0) → (10,0) → (10,10) → (0,10)`.
>    As you walk, is the interior of the rectangle to your LEFT or RIGHT?
>    What does this tell you about the winding order?
> 2. The Shoelace formula returns `-25` for a polygon. Is it CW or CCW?
>    What is its area?
> 3. G41 is "cutter compensation left" — the tool moves left of the programmed path.
>    For a CCW outer boundary, does G41 cut inside or outside the profile?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Walk the Boundary to Feel the Winding

Before writing any code, physically trace a polygon:

```
Walk the rectangle: (0,0) → (10,0) → (10,10) → (0,10) → back to (0,0)

At (0,0): facing right (toward (10,0))
  Left hand points UP — interior is UP and to the LEFT
At (10,0): facing up (toward (10,10))
  Left hand points LEFT — interior is to the LEFT
At (10,10): facing left (toward (0,10))
  Left hand points DOWN — interior is below
At (0,10): facing down (toward (0,0))
  Left hand points RIGHT — interior is to the right

The interior is always to the LEFT as you walk → COUNTER-CLOCKWISE winding
```

Now try the SAME rectangle but reversed: `(0,0) → (0,10) → (10,10) → (10,0)`:

```
At (0,0): facing up
  Left hand points LEFT — interior is to the LEFT
Wait — but left is OUTSIDE the rectangle here...

The interior is to the RIGHT → CLOCKWISE winding
```

**This is the physical definition:**
- **CCW:** walk the boundary; interior is to your LEFT
- **CW:** walk the boundary; interior is to your RIGHT

---

### Concept: The Shoelace Formula — WHERE It Comes From

**What it is:** The Shoelace formula computes the SIGNED area of a polygon.
The sign tells you the winding order.

**The derivation (simplified):**

The formula computes the sum of signed areas of triangles from the origin to each edge:

```
For each edge from vertex i to vertex j:
  signed_area += (xi * yj) - (xj * yi)

This is the 2D cross product of the two position vectors.
Positive cross product = CCW direction; negative = CW.

Sum all edges, divide by 2: 2A = Σ (xi*yj - xj*yi)
```

For a CCW polygon, the sum is positive (total area is positive).
For a CW polygon, the sum is negative (total area is negative).

**Why the formula works:** Each edge contributes a "signed trapezoid" area. Walking CCW, the
contributions add up positively. Walking CW, they add up negatively.

---

## Step 2 — See the Problem Without Winding Detection

```bash
npx tsx -e "
import { Point } from './src/primitives.ts';

// Two identical rectangles but different winding:
const ccw = [new Point(0,0), new Point(10,0), new Point(10,10), new Point(0,10)];
const cw  = [new Point(0,0), new Point(0,10), new Point(10,10), new Point(10,0)];

// Without winding detection, both look like the same shape:
console.log('CCW area (guessing):', 10 * 10);  // can't tell which is which
console.log('CW  area (guessing):', 10 * 10);
"
```

You cannot tell CW from CCW just by looking at the vertices — you need the Shoelace formula.

---

## Step 3 — Build the Winding Functions

Create `src/winding.ts`:

```ts
// src/winding.ts
import { Point } from './primitives';
import { nearlyZero } from './epsilon';

/**
 * Computes signed area using the Shoelace formula.
 * Positive → CCW winding
 * Negative → CW winding
 */
export function signedArea(points: readonly Point[]): number {
  let area = 0;
  const n  = points.length;

  for (let i = 0; i < n; i++) {
    const j  = (i + 1) % n;   // next vertex (wraps to 0 at the end)
    area += points[i].x * points[j].y;   // xi * y(i+1)
    area -= points[j].x * points[i].y;   // x(i+1) * yi
  }

  return area / 2;
}

export function area(points: readonly Point[]): number {
  return Math.abs(signedArea(points));
}

export function isCounterClockwise(points: readonly Point[]): boolean {
  return signedArea(points) > 0;
}

export function isClockwise(points: readonly Point[]): boolean {
  return signedArea(points) < 0;
}

export function reverseProfile(points: readonly Point[]): Point[] {
  return [...points].reverse();
}

export function ensureCounterClockwise(points: readonly Point[]): Point[] {
  return isClockwise(points) ? reverseProfile(points) : [...points];
}

export function ensureClockwise(points: readonly Point[]): Point[] {
  return isCounterClockwise(points) ? reverseProfile(points) : [...points];
}
```

---

## Step 4 — Write Tests That Verify the Physical Definition

```ts
// src/winding.test.ts
import { describe, it, expect } from 'vitest';
import { Point }                 from './primitives';
import { signedArea, area, isCounterClockwise, isClockwise, reverseProfile, ensureCounterClockwise } from './winding';

// The CCW rectangle from Step 1:
const ccwRect = [
  new Point(0, 0), new Point(10, 0),
  new Point(10, 10), new Point(0, 10),
];

// The CW rectangle (reversed):
const cwRect = [
  new Point(0, 0), new Point(0, 10),
  new Point(10, 10), new Point(10, 0),
];

describe('Shoelace formula', () => {

  it('CCW polygon has positive signed area', () => {
    // Walking the CCW rectangle, interior is to the LEFT → positive
    expect(signedArea(ccwRect)).toBeGreaterThan(0);
  });

  it('CW polygon has negative signed area', () => {
    // Walking the CW rectangle, interior is to the RIGHT → negative
    expect(signedArea(cwRect)).toBeLessThan(0);
  });

  it('area of a 10×10 square is 100 regardless of winding', () => {
    expect(area(ccwRect)).toBeCloseTo(100);
    expect(area(cwRect)).toBeCloseTo(100);
  });

  it('signed area of CCW and CW are negatives of each other', () => {
    // Same shape, opposite winding → same magnitude, opposite sign:
    expect(signedArea(ccwRect)).toBeCloseTo(-signedArea(cwRect));
  });

});

describe('winding detection', () => {

  it('ccwRect is counter-clockwise', () => {
    expect(isCounterClockwise(ccwRect)).toBe(true);
    expect(isClockwise(ccwRect)).toBe(false);
  });

  it('cwRect is clockwise', () => {
    expect(isClockwise(cwRect)).toBe(true);
    expect(isCounterClockwise(cwRect)).toBe(false);
  });

});

describe('profile reversal', () => {

  it('reversing a CCW profile produces CW', () => {
    const reversed = reverseProfile(ccwRect);
    expect(isClockwise(reversed)).toBe(true);
  });

  it('does not mutate the original array', () => {
    const copy = [...ccwRect];
    reverseProfile(ccwRect);
    expect(ccwRect[0].x).toBe(copy[0].x);   // original unchanged
  });

});

describe('ensureCounterClockwise', () => {

  it('returns CCW profile unchanged', () => {
    const result = ensureCounterClockwise(ccwRect);
    expect(isCounterClockwise(result)).toBe(true);
  });

  it('reverses a CW profile to CCW', () => {
    const result = ensureCounterClockwise(cwRect);
    expect(isCounterClockwise(result)).toBe(true);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/winding.test.ts
```

Expected: all tests pass.

**Change something:** Manually compute the Shoelace formula for the CCW rectangle:

```bash
npx tsx -e "
// Shoelace by hand for [(0,0),(10,0),(10,10),(0,10)]:
// Edge (0,0)→(10,0):  0*0  - 10*0  =  0 - 0  = 0
// Edge (10,0)→(10,10): 10*10 - 10*0  = 100 - 0  = 100
// Edge (10,10)→(0,10): 10*10 - 0*10 = 100 - 0  = 100
// Edge (0,10)→(0,0):  0*0  - 0*10 = 0 - 0   = 0
// Sum = 200. Area = 200/2 = 100. Positive → CCW.
console.log('Expected area: 100, Expected sign: positive (CCW)');

import { signedArea } from './src/winding.ts';
import { Point }      from './src/primitives.ts';
const ccw = [new Point(0,0), new Point(10,0), new Point(10,10), new Point(0,10)];
console.log('Computed signed area:', signedArea(ccw));
"
```

**Expected:** `100` — matches the hand calculation.

---

## 🎯 Challenge: Classify Profiles for Pocket Machining

**You know:** Winding order, Shoelace formula.

**The CNC context:**
- A POCKET needs: one CCW outer boundary + zero or more CW island boundaries
- Classifying incoming profiles (possibly from a DXF file with unknown winding) is the first
  step before generating toolpaths

**Task:** Implement `classifyProfiles(profiles: Point[][]): { outer: Point[][]; islands: Point[][] }`
where:
- `outer` = CCW profiles (outer boundary)
- `islands` = CW profiles (holes/islands inside the pocket)

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function classifyProfiles(profiles: Point[][]): {
  outer:   Point[][];
  islands: Point[][];
} {
  const outer:   Point[][] = [];
  const islands: Point[][] = [];

  for (const profile of profiles) {
    if (isCounterClockwise(profile)) {
      outer.push(profile);
    } else {
      islands.push(profile);
    }
  }

  return { outer, islands };
}
```

**Tests:**
```ts
it('classifies CCW profile as outer', () => {
  const result = classifyProfiles([ccwRect]);
  expect(result.outer).toHaveLength(1);
  expect(result.islands).toHaveLength(0);
});

it('classifies CW profile as island', () => {
  const result = classifyProfiles([cwRect]);
  expect(result.outer).toHaveLength(0);
  expect(result.islands).toHaveLength(1);
});
```

**Key insight:** In standard CNC CAM systems, a valid pocket definition requires exactly one
CCW outer boundary plus any number of CW island boundaries. If the incoming profiles have
wrong winding, the toolpath generator produces incorrect paths. Classifying winding order
is always the first step when importing geometry.

</details>

---

## Final Check

| Winding | Shoelace sign | CNC meaning | In code |
|---|---|---|---|
| CCW | Positive (+) | Outer boundary, contour | `signedArea > 0` |
| CW | Negative (−) | Island, hole inside pocket | `signedArea < 0` |
| Zero | Zero | Degenerate / collinear | `nearlyZero(area)` |

---

## Quick Check Answers

**1. Walk `(0,0)→(10,0)→(10,10)→(0,10)`. Interior to LEFT or RIGHT?**

LEFT. When you stand at `(0,0)` facing toward `(10,0)` (right), the interior of the
rectangle is above you (to your left). This persists around the whole boundary.
Interior to the LEFT = CCW winding.

**2. Shoelace returns `-25`. CW or CCW? Area?**

CW (negative sign = clockwise). Area = `|−25| = 25`. The absolute value gives the area;
the sign gives the winding order.

**3. G41 (cutter left) for a CCW outer boundary — inside or outside?**

Outside the profile. G41 means the tool is to the LEFT of its programmed path. For a CCW
boundary (tool walks the boundary CCW), the LEFT side is OUTWARD — the tool cuts outside
the profile. This is the correct setting for machining the outer contour of a part.
G42 (cutter right) would be for the inside/pocket operation.
