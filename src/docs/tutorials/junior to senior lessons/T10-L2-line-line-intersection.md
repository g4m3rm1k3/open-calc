# Junior to Senior — T10·L2 — Line-Line Intersection

**Prerequisites:** T10·L1 (2D Primitives). You have the geometry types. This
lesson implements segment-segment intersection — the algorithm behind trim
operations and polygon clipping.

**What this lab adds:**
- Parametric form: `P(t) = A + t*(B-A)` where `t ∈ [0,1]` spans the segment
- Solving for t where two parametric lines intersect
- Three cases: parallel, one point, coincident
- Checking t₁ and t₂ are in [0,1] — within both segments
- Epsilon for parallelism detection

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `t = 0.5` on segment A→B means what?
> 2. Two horizontal segments at the same Y level. Are they parallel? Coincident?
>    What is the difference?
> 3. Intersection test finds `t₁ = 0.3`, `t₂ = 1.5`. Do the segments intersect?
>
> *(Answers at the end of this lab)*

---

## The Algorithm

Two segments: `A→B` and `C→D`.

Parametric form:
```
P₁(t₁) = A + t₁ * (B - A)
P₂(t₂) = C + t₂ * (D - C)
```

Set equal and solve for `t₁` and `t₂`:
```
A + t₁*(B-A) = C + t₂*(D-C)
```

This is a 2×2 linear system. The solution (using Cramer's rule):

```
let d1 = B - A  (direction of segment 1)
let d2 = D - C  (direction of segment 2)
let cross = d1.x * d2.y - d1.y * d2.x  (2D "cross product")

if abs(cross) < epsilon → parallel (or coincident)

t₁ = ((C - A).x * d2.y - (C - A).y * d2.x) / cross
t₂ = ((C - A).x * d1.y - (C - A).y * d1.x) / cross

If t₁ ∈ [0,1] AND t₂ ∈ [0,1] → segments intersect at P₁(t₁)
```

---

## Step 1 — Implement Intersection

Create `src/intersection.ts`:

```ts
import { Point, Segment }                 from './primitives';
import { nearlyZero, clamp, GEOMETRY_EPSILON } from './epsilon';

export interface SegmentIntersection {
  point: Point;
  t1:    number;   // parameter along segment 1
  t2:    number;   // parameter along segment 2
}

export function segmentSegmentIntersection(
  seg1: Segment,
  seg2: Segment,
): SegmentIntersection | null {
  const { start: A, end: B } = seg1;
  const { start: C, end: D } = seg2;

  const d1x = B.x - A.x,  d1y = B.y - A.y;
  const d2x = D.x - C.x,  d2y = D.y - C.y;

  const cross = d1x * d2y - d1y * d2x;

  if (nearlyZero(cross)) {
    return null;   // parallel or coincident
  }

  const sx = C.x - A.x, sy = C.y - A.y;

  const t1 = (sx * d2y - sy * d2x) / cross;
  const t2 = (sx * d1y - sy * d1x) / cross;

  if (t1 < -GEOMETRY_EPSILON || t1 > 1 + GEOMETRY_EPSILON) return null;
  if (t2 < -GEOMETRY_EPSILON || t2 > 1 + GEOMETRY_EPSILON) return null;

  const point = seg1.pointAt(clamp(t1, 0, 1));
  return { point, t1: clamp(t1, 0, 1), t2: clamp(t2, 0, 1) };
}

export function lineLineIntersection(
  seg1: Segment,
  seg2: Segment,
): Point | null {
  const { start: A, end: B } = seg1;
  const { start: C, end: D } = seg2;

  const d1x = B.x - A.x, d1y = B.y - A.y;
  const d2x = D.x - C.x, d2y = D.y - C.y;
  const cross = d1x * d2y - d1y * d2x;

  if (nearlyZero(cross)) return null;

  const sx = C.x - A.x, sy = C.y - A.y;
  const t = (sx * d2y - sy * d2x) / cross;

  return seg1.pointAt(t);   // no range check — infinite lines
}
```

---

## Step 2 — Write Tests

Create `src/intersection.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Point, Segment }        from './primitives';
import { segmentSegmentIntersection, lineLineIntersection } from './intersection';

describe('segmentSegmentIntersection', () => {

  it('finds intersection of two crossing segments', () => {
    const s1 = new Segment(new Point(0, 0), new Point(10, 0));  // horizontal
    const s2 = new Segment(new Point(5, -5), new Point(5, 5)); // vertical

    const result = segmentSegmentIntersection(s1, s2);

    expect(result).not.toBeNull();
    expect(result!.point.x).toBeCloseTo(5);
    expect(result!.point.y).toBeCloseTo(0);
  });

  it('t1 = 0.5 for an intersection at the midpoint of segment 1', () => {
    const s1 = new Segment(new Point(0, 0), new Point(10, 0));
    const s2 = new Segment(new Point(5, -1), new Point(5, 1));
    const result = segmentSegmentIntersection(s1, s2);
    expect(result!.t1).toBeCloseTo(0.5);
  });

  it('returns null for parallel non-overlapping segments', () => {
    const s1 = new Segment(new Point(0, 0), new Point(10, 0));
    const s2 = new Segment(new Point(0, 1), new Point(10, 1));
    expect(segmentSegmentIntersection(s1, s2)).toBeNull();
  });

  it('returns null when segments do not reach the intersection point', () => {
    // Lines would intersect, but segments are too short:
    const s1 = new Segment(new Point(0, 0), new Point(4, 0));
    const s2 = new Segment(new Point(5, -5), new Point(5, 5));
    // s2 crosses x=5 but s1 ends at x=4
    expect(segmentSegmentIntersection(s1, s2)).toBeNull();
  });

  it('finds intersection at endpoint (t = 0 or t = 1)', () => {
    const s1 = new Segment(new Point(0, 0), new Point(5, 0));
    const s2 = new Segment(new Point(5, -5), new Point(5, 5));  // crosses exactly at s1.end
    const result = segmentSegmentIntersection(s1, s2);
    expect(result).not.toBeNull();
    expect(result!.t1).toBeCloseTo(1);
  });

  it('returns null for T-intersection outside first segment', () => {
    // s2 crosses the LINE through s1, but outside the segment:
    const s1 = new Segment(new Point(0, 0), new Point(3, 0));
    const s2 = new Segment(new Point(5, -1), new Point(5, 1));  // t1 would be 5/3 > 1
    expect(segmentSegmentIntersection(s1, s2)).toBeNull();
  });

});

describe('lineLineIntersection', () => {

  it('finds intersection of extended lines', () => {
    const s1 = new Segment(new Point(0, 0), new Point(1, 0));    // horizontal line
    const s2 = new Segment(new Point(10, -1), new Point(10, 1)); // vertical at x=10

    const result = lineLineIntersection(s1, s2);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(10);  // beyond end of s1 segment
  });

  it('returns null for parallel lines', () => {
    const s1 = new Segment(new Point(0, 0), new Point(1, 0));
    const s2 = new Segment(new Point(0, 1), new Point(1, 1));
    expect(lineLineIntersection(s1, s2)).toBeNull();
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Find All Intersections in a Polygon

**You know:** `segmentSegmentIntersection`, O(n²) algorithm.

**Task:** Given a polygon as a list of `Segment`, find all pairs of non-adjacent
segments that intersect (indicating a self-intersecting polygon):

```ts
function findSelfIntersections(segments: Segment[]): SegmentIntersection[]
```

For a simple (non-self-intersecting) polygon, this returns an empty array.

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function findSelfIntersections(segments: Segment[]): SegmentIntersection[] {
  const results: SegmentIntersection[] = [];

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 2; j < segments.length; j++) {
      // Skip adjacent segments (share an endpoint) and last-to-first pair:
      if (i === 0 && j === segments.length - 1) continue;

      const hit = segmentSegmentIntersection(segments[i], segments[j]);
      if (hit) results.push(hit);
    }
  }

  return results;
}
```

**Tests:**
```ts
it('finds no intersections in a simple square', () => {
  const square = [
    new Segment(new Point(0,0), new Point(1,0)),
    new Segment(new Point(1,0), new Point(1,1)),
    new Segment(new Point(1,1), new Point(0,1)),
    new Segment(new Point(0,1), new Point(0,0)),
  ];
  expect(findSelfIntersections(square)).toHaveLength(0);
});

it('finds intersection in a figure-8 polygon', () => {
  // Two triangles sharing a crossing:
  const crossing = [
    new Segment(new Point(0,0), new Point(2,2)),
    new Segment(new Point(2,2), new Point(2,0)),
    new Segment(new Point(2,0), new Point(0,2)),  // crosses first segment
    new Segment(new Point(0,2), new Point(0,0)),
  ];
  expect(findSelfIntersections(crossing).length).toBeGreaterThan(0);
});
```

</details>

---

## Final Check

| Case | Returns |
|---|---|
| Segments cross | `{ point, t1, t2 }` with both t in [0,1] |
| Parallel segments | `null` |
| Segments too short | `null` (t outside [0,1]) |
| Lines cross (extended) | `{ point }` (no t range check) |
| T-intersection | Point at endpoint, t = 0 or t = 1 |

---

## Quick Check Answers

**1. `t = 0.5` on segment A→B means?**

The midpoint — exactly halfway between A and B. `t = 0` = point A, `t = 1` = point B,
`t = 0.5` = midpoint. Values outside [0,1] are on the extension of the segment
beyond its endpoints. The parametric form `A + t*(B-A)` continuously maps the
scalar `t` to points along the line.

**2. Two horizontal segments, same Y level — parallel or coincident?**

They could be either. Both have zero "cross product" (determinant = 0), so the
algorithm returns `null` for both cases. To distinguish: if the segments overlap
(share any portion), they are coincident; if they don't overlap, they are parallel.
For the intersection algorithm, both cases return `null` — the distinction only
matters for special processing like "detect and merge coincident segments."

**3. `t₁ = 0.3`, `t₂ = 1.5` — do segments intersect?**

No. `t₂ = 1.5` is outside [0, 1] — it is beyond the endpoint of segment 2.
The infinite lines would intersect at this point, but the segments do not reach it.
Both `t₁` and `t₂` must be in [0, 1] (within epsilon) for a segment-segment
intersection.
