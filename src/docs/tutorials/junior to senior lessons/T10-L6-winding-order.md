# Junior to Senior — T10·L6 — Winding Order and Orientation

**Prerequisites:** T10·L5 (Offset Curves). You can offset profiles. This lesson
covers winding order — the fundamental property that determines whether a CNC
operation cuts a pocket or a contour.

**What this lab adds:**
- CW vs CCW winding: which side the enclosed area is on
- Shoelace formula: computing signed area to determine winding
- Reversing a profile to flip winding
- Why it matters for CNC: G41 vs G42, pocket vs contour
- Nested profiles: outer CCW + inner CW = standard pocket with islands

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Walking a rectangle CCW (left turns). Is the enclosed area to your left or right?
> 2. The shoelace formula gives area = -25. What does the negative sign indicate?
> 3. In G-code, G41 (cutter compensation left) is used with which winding order?
>
> *(Answers at the end of this lab)*

---

## The Shoelace Formula

The signed area of a polygon with vertices `(x₀,y₀), (x₁,y₁), ..., (xₙ,yₙ)`:

```
2 × Area = Σᵢ (xᵢ × yᵢ₊₁ - xᵢ₊₁ × yᵢ)
```

- Positive result → CCW winding
- Negative result → CW winding
- Zero → degenerate (collinear points)

```ts
function signedArea(points: Point[]): number {
  let area = 0;
  const n  = points.length;
  for (let i = 0; i < n; i++) {
    const j  = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return area / 2;
}

function isCounterClockwise(points: Point[]): boolean {
  return signedArea(points) > 0;
}
```

---

## Step 1 — Implement Winding Functions

Add to `src/winding.ts`:

```ts
import { Point, Polyline }  from './primitives';
import { nearlyZero }        from './epsilon';

export function signedArea(points: readonly Point[]): number {
  let area = 0;
  const n  = points.length;
  for (let i = 0; i < n; i++) {
    const j  = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
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

## Step 2 — Write Tests

Create `src/winding.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Point }                 from './primitives';
import {
  signedArea, area, isCounterClockwise, isClockwise,
  reverseProfile, ensureCounterClockwise,
} from './winding';

// CCW square (vertices going counter-clockwise):
const ccwSquare = [
  new Point(0, 0), new Point(10, 0), new Point(10, 10), new Point(0, 10),
];

// CW square (same vertices in reverse):
const cwSquare = [
  new Point(0, 0), new Point(0, 10), new Point(10, 10), new Point(10, 0),
];

describe('signedArea', () => {

  it('CCW polygon has positive signed area', () => {
    expect(signedArea(ccwSquare)).toBeGreaterThan(0);
  });

  it('CW polygon has negative signed area', () => {
    expect(signedArea(cwSquare)).toBeLessThan(0);
  });

  it('area of a 10×10 square is 100', () => {
    expect(area(ccwSquare)).toBeCloseTo(100);
  });

  it('absolute area is the same regardless of winding', () => {
    expect(area(ccwSquare)).toBeCloseTo(area(cwSquare));
  });

});

describe('isCounterClockwise / isClockwise', () => {

  it('ccwSquare is CCW', () => {
    expect(isCounterClockwise(ccwSquare)).toBe(true);
    expect(isClockwise(ccwSquare)).toBe(false);
  });

  it('cwSquare is CW', () => {
    expect(isClockwise(cwSquare)).toBe(true);
    expect(isCounterClockwise(cwSquare)).toBe(false);
  });

});

describe('reverseProfile', () => {

  it('reverses a CCW profile to CW', () => {
    const reversed = reverseProfile(ccwSquare);
    expect(isClockwise(reversed)).toBe(true);
  });

  it('does not mutate the original', () => {
    const original = [...ccwSquare];
    reverseProfile(ccwSquare);
    expect(ccwSquare.map(p => `${p.x},${p.y}`)).toEqual(original.map(p => `${p.x},${p.y}`));
  });

});

describe('ensureCounterClockwise', () => {

  it('returns CCW profile unchanged', () => {
    const result = ensureCounterClockwise(ccwSquare);
    expect(isCounterClockwise(result)).toBe(true);
  });

  it('reverses a CW profile to CCW', () => {
    const result = ensureCounterClockwise(cwSquare);
    expect(isCounterClockwise(result)).toBe(true);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Detect Nested Profiles

**You know:** Winding order, signed area.

**Task:** Given a list of closed profiles (arrays of Points), identify which are
"outer" profiles (CCW, the part boundary) and which are "island" profiles (CW,
holes inside the outer boundary):

```ts
function classifyProfiles(profiles: Point[][]): {
  outer:   Point[][];  // CCW profiles (part boundaries)
  islands: Point[][];  // CW profiles (holes)
}
```

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function classifyProfiles(profiles: Point[][]): {
  outer: Point[][]; islands: Point[][];
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
it('classifies a CCW profile as outer', () => {
  const result = classifyProfiles([ccwSquare]);
  expect(result.outer).toHaveLength(1);
  expect(result.islands).toHaveLength(0);
});

it('classifies a CW profile as island', () => {
  const result = classifyProfiles([cwSquare]);
  expect(result.outer).toHaveLength(0);
  expect(result.islands).toHaveLength(1);
});
```

**Key insight:** In standard CNC CAM systems, a valid pocket consists of one CCW
outer boundary (what gets cut) plus zero or more CW island boundaries (what is left
standing). The offset algorithm is applied to the outer boundary going inward
(reducing the area), and the islands are offset outward (increasing them) to account
for the tool radius.

</details>

---

## Final Check

| Winding | Shoelace area sign | CNC meaning |
|---|---|---|
| CCW | Positive (+) | Outer boundary, contour |
| CW | Negative (−) | Island, hole inside a pocket |
| Zero | Zero | Degenerate / collinear |

---

## Quick Check Answers

**1. Walking CCW rectangle. Is the enclosed area to your left or right?**

To your left. When walking CCW (each turn is a left turn), the interior of the
shape is always on your left side. This is the mathematical definition: a CCW
polygon has its interior on the left of each directed edge.

**2. Shoelace formula gives area = -25. What does the negative sign indicate?**

CW winding. The magnitude (25) is the area of the polygon. The negative sign means
the vertices are ordered clockwise. A positive result indicates CCW ordering.
This is consistent regardless of the polygon's position, size, or shape.

**3. G41 (cutter compensation left) is used with which winding?**

G41 (tool to the left of the programmed path) is used for a CCW profile when
cutting a contour. When the tool walks along a CCW path with the cutting edge
to its left, it compensates for the tool radius outward. G42 (tool to the right)
is used for a CW path, or for cutting the inside of a CCW profile (pocket).
The mnemonic: G41 = cut on the left = CCW outer contour.
