# Junior to Senior — T10·L2 — Line-Line Intersection

**Prerequisites:** T10·L1 (2D Primitives). You have `Point`, `Segment`, `nearlyEqual`.
This lesson derives the intersection algorithm from first principles — you will see WHERE
the formula `t = (sx*d2y - sy*d2x) / cross` comes from, not just that it works.

**What this lab adds:**
- HOW the parametric line form `P(t) = A + t*(B-A)` describes every point on a segment
- WHERE the intersection formula comes from — solving two parametric equations simultaneously
- WHY the "cross product" value determines parallelism
- WHY `t₁` and `t₂` must both be in `[0,1]` for a segment-segment (not line-line) intersection
- What epsilon is needed to detect parallelism — not the same epsilon as point comparison

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `P(t) = A + t*(B-A)`. At `t=0` you are at A. At `t=1` you are at B. Where
>    are you at `t=0.5`? At `t=2`?
> 2. Two lines intersect at a point where `t₁ = 0.5` and `t₂ = 1.5`. Do the
>    LINE SEGMENTS intersect? Why or why not?
> 3. The denominator in the intersection formula is the "2D cross product" of the
>    direction vectors. When is it zero? What does that mean geometrically?
>
> *(Answers at the end of this lab)*

---

## Deriving the Intersection Formula

Two line segments: A→B and C→D.

**Step 1: Write both as parametric equations:**

```
P₁(t₁) = A + t₁ * (B - A)     for t₁ ∈ [0,1]
P₂(t₂) = C + t₂ * (D - C)     for t₂ ∈ [0,1]
```

At the intersection point, both equations give the same `(x, y)`:

```
A + t₁ * (B - A) = C + t₂ * (D - C)
```

**Step 2: Write as a 2×2 system:**

Let `d1 = B - A` (direction of segment 1) and `d2 = D - C` (direction of segment 2):

```
A + t₁ * d1 = C + t₂ * d2

In components:
  Ax + t₁ * d1x = Cx + t₂ * d2x    ... (i)
  Ay + t₁ * d1y = Cy + t₂ * d2y    ... (ii)
```

**Step 3: Solve for t₁ using Cramer's rule:**

Rearrange to get t₁ and t₂ on the left:

```
t₁ * d1x - t₂ * d2x = Cx - Ax = sx
t₁ * d1y - t₂ * d2y = Cy - Ay = sy
```

The "cross product" of two 2D vectors `(ax, ay)` and `(bx, by)` is `ax*by - ay*bx`.
Using Cramer's rule, the solution is:

```
denominator = d1x * (-d2y) - d1y * (-d2x)
            = -(d1x * d2y - d1y * d2x)
            = -(cross product of d1 and d2)
```

Simplified (absorbing the negation into the formula):

```
cross = d1x * d2y - d1y * d2x

t₁ = (sx * d2y - sy * d2x) / cross
t₂ = (sx * d1y - sy * d1x) / cross
```

**If cross ≈ 0:** The denominator is zero → lines are parallel or coincident → no intersection (or infinite).

This is not magic. It is the result of solving two linear equations for two unknowns.

---

## Step 1 — Verify the Formula By Hand

Before writing code, verify with a specific example:

```
Segment 1: A=(0,0), B=(10,0)   — horizontal segment
Segment 2: C=(5,-5), D=(5,5)   — vertical segment crossing at (5,0)
```

```
d1 = B - A = (10, 0)
d2 = D - C = (0, 10)
s  = C - A = (5, -5)

cross = d1x * d2y - d1y * d2x = 10*10 - 0*0 = 100

t₁ = (sx * d2y - sy * d2x) / cross
   = (5 * 10 - (-5) * 0) / 100
   = 50 / 100
   = 0.5   ← midpoint of segment 1 ✓ (5 is 50% of the way from 0 to 10)

t₂ = (sx * d1y - sy * d1x) / cross
   = (5 * 0 - (-5) * 10) / 100
   = 50 / 100
   = 0.5   ← midpoint of segment 2 ✓ (0 is 50% of the way from -5 to 5)

Intersection point: P₁(0.5) = (0,0) + 0.5*(10,0) = (5, 0) ✓
```

The formula gives `t₁=0.5`, `t₂=0.5`, intersection at `(5,0)`. Matches geometry.

---

## Step 2 — Implement

Create `src/intersection.ts`:

```ts
// src/intersection.ts
import { Point, Segment }  from './primitives';   // or individual files
import { nearlyZero, GEOMETRY_EPSILON } from './epsilon';

export interface SegmentIntersection {
  point: Point;
  t1:    number;   // parameter on segment 1 — always in [0,1]
  t2:    number;   // parameter on segment 2 — always in [0,1]
}

export function segmentSegmentIntersection(
  seg1: Segment,
  seg2: Segment,
): SegmentIntersection | null {
  const { start: A, end: B } = seg1;
  const { start: C, end: D } = seg2;

  // Direction vectors (computed from endpoints):
  const d1x = B.x - A.x, d1y = B.y - A.y;
  const d2x = D.x - C.x, d2y = D.y - C.y;

  // Cross product of direction vectors:
  // If near zero → parallel (or coincident) → no unique intersection
  const cross = d1x * d2y - d1y * d2x;

  if (nearlyZero(cross, GEOMETRY_EPSILON * 10)) {
    // Using GEOMETRY_EPSILON * 10 because this is a cross product of lengths,
    // not a coordinate — the scale is different from point comparison
    return null;
  }

  // Vector from A to C:
  const sx = C.x - A.x;
  const sy = C.y - A.y;

  // Solve for parameters (derived above):
  const t1 = (sx * d2y - sy * d2x) / cross;
  const t2 = (sx * d1y - sy * d1x) / cross;

  // Check that both parameters are within the segments [0,1]:
  const eps = GEOMETRY_EPSILON;
  if (t1 < -eps || t1 > 1 + eps) return null;  // intersection outside segment 1
  if (t2 < -eps || t2 > 1 + eps) return null;  // intersection outside segment 2

  // Clamp to [0,1] to eliminate floating-point overshoot:
  const t1c = Math.max(0, Math.min(1, t1));
  const t2c = Math.max(0, Math.min(1, t2));

  const point = seg1.pointAt(t1c);
  return { point, t1: t1c, t2: t2c };
}
```

---

## Step 3 — Write Tests, One Case at a Time

Create `src/intersection.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Point, Segment }        from './primitives';
import { segmentSegmentIntersection } from './intersection';

describe('segmentSegmentIntersection', () => {

  it('finds the intersection of two crossing segments', () => {
    // From the hand calculation above:
    const s1 = new Segment(new Point(0, 0), new Point(10, 0));  // horizontal
    const s2 = new Segment(new Point(5, -5), new Point(5, 5)); // vertical

    const result = segmentSegmentIntersection(s1, s2);

    expect(result).not.toBeNull();
    expect(result!.point.x).toBeCloseTo(5);
    expect(result!.point.y).toBeCloseTo(0);
    expect(result!.t1).toBeCloseTo(0.5);   // midpoint of s1
    expect(result!.t2).toBeCloseTo(0.5);   // midpoint of s2
  });

  it('returns null for parallel segments', () => {
    const s1 = new Segment(new Point(0, 0), new Point(10, 0));
    const s2 = new Segment(new Point(0, 1), new Point(10, 1));  // parallel, 1 unit above
    expect(segmentSegmentIntersection(s1, s2)).toBeNull();
  });

  it('returns null when lines would intersect but segments are too short', () => {
    // The lines through these segments would cross, but the segments themselves don't:
    const s1 = new Segment(new Point(0, 0), new Point(4, 0));   // ends at x=4
    const s2 = new Segment(new Point(5, -5), new Point(5, 5)); // starts at x=5
    // Intersection would be at x=5, but s1 only goes to x=4:
    expect(segmentSegmentIntersection(s1, s2)).toBeNull();
  });

  it('t1=0 means the intersection is at s1.start', () => {
    // s2 passes exactly through s1's start:
    const s1 = new Segment(new Point(5, 0), new Point(10, 0));
    const s2 = new Segment(new Point(5, -5), new Point(5, 5));
    const result = segmentSegmentIntersection(s1, s2);
    expect(result!.t1).toBeCloseTo(0);
    expect(result!.point.x).toBeCloseTo(5);
  });

  it('t1=1 means the intersection is at s1.end', () => {
    const s1 = new Segment(new Point(0, 0), new Point(5, 0));
    const s2 = new Segment(new Point(5, -5), new Point(5, 5));
    const result = segmentSegmentIntersection(s1, s2);
    expect(result!.t1).toBeCloseTo(1);
    expect(result!.point.x).toBeCloseTo(5);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/intersection.test.ts
```

Expected: all 5 tests pass.

**Change something:** In the parallel test, make the segments at the SAME Y level (coincident
lines rather than parallel). Expected: still returns null (coincident lines are also parallel —
the cross product is zero for both cases). Two coincident segments have infinite intersection
points, not one — the function correctly returns null.

---

## 🎯 Challenge: Add `lineLineIntersection` (Infinite Lines)

**You know:** The parametric formula, why t must be in [0,1] for segments.

**For infinite LINES:** The same formula applies but without the `[0,1]` restriction on t.
Infinite lines always intersect (unless parallel). The intersection may be far outside
either segment's range.

**Task:** Implement `lineLineIntersection(seg1, seg2): Point | null` that finds where
the INFINITE LINES through each segment would intersect (null if parallel).

Write 2 tests: one where the lines cross inside the segments, one where they cross
outside the segments (but would cross if extended).

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function lineLineIntersection(
  seg1: Segment,
  seg2: Segment,
): Point | null {
  const { start: A, end: B } = seg1;
  const { start: C, end: D } = seg2;

  const d1x = B.x - A.x, d1y = B.y - A.y;
  const d2x = D.x - C.x, d2y = D.y - C.y;

  const cross = d1x * d2y - d1y * d2x;
  if (nearlyZero(cross, GEOMETRY_EPSILON * 10)) return null;  // parallel

  const sx = C.x - A.x;
  const sy = C.y - A.y;
  const t1 = (sx * d2y - sy * d2x) / cross;

  // No [0,1] check — infinite lines, t can be anything:
  return seg1.pointAt(t1);
}
```

**Tests:**
```ts
it('line-line finds intersection even when outside segments', () => {
  // Segments do not cross, but their LINES do:
  const s1 = new Segment(new Point(0, 0), new Point(3, 0));  // x: 0→3
  const s2 = new Segment(new Point(5, -1), new Point(5, 1)); // vertical at x=5

  // Segments don't overlap (s1 ends at 3, s2 is at 5)
  expect(segmentSegmentIntersection(s1, s2)).toBeNull();

  // But LINES through them do cross at x=5:
  const pt = lineLineIntersection(s1, s2);
  expect(pt).not.toBeNull();
  expect(pt!.x).toBeCloseTo(5);
});

it('line-line returns null for parallel lines', () => {
  const s1 = new Segment(new Point(0, 0), new Point(10, 0));
  const s2 = new Segment(new Point(0, 5), new Point(10, 5));
  expect(lineLineIntersection(s1, s2)).toBeNull();
});
```

**Key insight:** `lineLineIntersection` is used for geometric operations like
"extend these two segments until they meet" — a common CAD operation for corner cleanup.
`segmentSegmentIntersection` is for detecting where two existing segments actually cross.

</details>

---

## Final Check

| Case | Result | Why |
|---|---|---|
| Segments cross | `{ point, t1, t2 }` with both t in [0,1] | Intersection is within both segments |
| Parallel | `null` | Cross product is zero |
| Segments too short | `null` | t outside [0,1] |
| T-intersection | point at endpoint, t=0 or 1 | Endpoint exactly on the other segment |

---

## Quick Check Answers

**1. `P(t)` at `t=0.5`? At `t=2`?**

`t=0.5`: the midpoint of segment A→B. `P(0.5) = A + 0.5*(B-A) = (A+B)/2`.
`t=2`: outside the segment — two full segment-lengths beyond A in the direction of B.
For segment intersection, we only accept `t ∈ [0,1]`. `t=2` means the intersection
point is on the LINE through the segment but not on the segment itself.

**2. `t₁=0.5`, `t₂=1.5`. Do the segments intersect?**

No. `t₂=1.5` is outside `[0,1]` — the intersection is on the LINE through segment 2
but beyond its endpoint. The segments themselves do not cross. Only if BOTH t values
are in `[0,1]` is the intersection within both segments.

**3. Cross product zero — what does it mean geometrically?**

The lines are parallel (or coincident). The cross product `d1x*d2y - d1y*d2x` equals
`|d1||d2|sin(θ)` where θ is the angle between the direction vectors. When θ=0° or 180°
(parallel or anti-parallel), `sin(θ)=0`, so the cross product is zero. Dividing by
zero would give NaN — the parallel check prevents this.
