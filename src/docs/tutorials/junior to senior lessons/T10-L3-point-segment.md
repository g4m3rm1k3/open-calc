# Junior to Senior — T10·L3 — Point-Segment Relationships

**Prerequisites:** T10·L2 (Line-Line Intersection). You can find intersections.
This lesson implements the closest-point-on-segment calculation — the algorithm
behind cursor snapping and "is this point on a line?" checks.

**What this lab adds:**
- Closest point on a segment to a given point
- Distance from a point to a segment
- Point-on-segment: `distance < epsilon`
- Projection formula: `t = (P-A)·(B-A) / |B-A|²`
- Signed distance: positive on one side, negative on the other

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `t = (P-A)·(B-A) / |B-A|²` — what happens if `t < 0`? If `t > 1`?
> 2. A point P is 0.0001mm from a segment. Is it "on" the segment?
> 3. You want to snap the cursor to the nearest segment endpoint within 5mm.
>    Which function do you use?
>
> *(Answers at the end of this lab)*

---

## The Algorithm

Given point `P` and segment `A→B`:

1. Compute `t = (P-A)·(B-A) / |B-A|²` — projection parameter
2. Clamp `t` to [0, 1] — keeps result within the segment
3. Closest point = `A + t * (B-A)` = `seg.pointAt(t)`
4. Distance = `P.distanceTo(closestPoint)`

**Geometric meaning of `t`:**
- `t = 0`: foot of perpendicular is at `A` (P is beside or beyond A)
- `t = 1`: foot of perpendicular is at `B` (P is beside or beyond B)
- `0 < t < 1`: perpendicular foot is within the segment

---

## Step 1 — Implement

Add to `src/intersection.ts`:

```ts
import { nearlyZero } from './epsilon';

export interface ClosestPointResult {
  point:    Point;
  t:        number;    // parameter on segment [0, 1]
  distance: number;
}

export function closestPointOnSegment(
  P:   Point,
  seg: Segment,
): ClosestPointResult {
  const { start: A, end: B } = seg;

  const abx = B.x - A.x, aby = B.y - A.y;
  const len2 = abx * abx + aby * aby;

  if (nearlyZero(len2)) {
    // Degenerate segment — return the start point:
    return { point: A, t: 0, distance: P.distanceTo(A) };
  }

  const apx = P.x - A.x, apy = P.y - A.y;
  const t   = Math.max(0, Math.min(1, (apx * abx + apy * aby) / len2));
  const closest = seg.pointAt(t);

  return { point: closest, t, distance: P.distanceTo(closest) };
}

export function distanceToSegment(P: Point, seg: Segment): number {
  return closestPointOnSegment(P, seg).distance;
}

export function isPointOnSegment(
  P:       Point,
  seg:     Segment,
  epsilon = GEOMETRY_EPSILON,
): boolean {
  return distanceToSegment(P, seg) < epsilon;
}

/**
 * Signed distance from P to the LINE through the segment.
 * Positive = left of the directed line (A→B), negative = right.
 */
export function signedDistanceToLine(P: Point, seg: Segment): number {
  const { start: A, end: B } = seg;
  const len = seg.length();
  if (nearlyZero(len)) return P.distanceTo(A);

  // Cross product (B-A) × (P-A) normalised by length:
  return ((B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x)) / len;
}
```

---

## Step 2 — Write Tests

Add to `src/intersection.test.ts`:

```ts
describe('closestPointOnSegment', () => {

  it('returns the projection for a point beside the segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    const P   = new Point(5, 3);  // directly above the midpoint
    const result = closestPointOnSegment(P, seg);
    expect(result.point.equals(new Point(5, 0))).toBe(true);
    expect(result.t).toBeCloseTo(0.5);
    expect(result.distance).toBeCloseTo(3);
  });

  it('clamps to the start when P is before the segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    const P   = new Point(-5, 0);
    const result = closestPointOnSegment(P, seg);
    expect(result.t).toBe(0);
    expect(result.point.equals(new Point(0, 0))).toBe(true);
  });

  it('clamps to the end when P is beyond the segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    const P   = new Point(15, 0);
    const result = closestPointOnSegment(P, seg);
    expect(result.t).toBe(1);
    expect(result.point.equals(new Point(10, 0))).toBe(true);
  });

  it('distance to the segment is 0 when P is on the segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    const P   = new Point(5, 0);
    expect(distanceToSegment(P, seg)).toBeCloseTo(0);
  });

});

describe('isPointOnSegment', () => {

  it('returns true for a point exactly on the segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    expect(isPointOnSegment(new Point(5, 0), seg)).toBe(true);
  });

  it('returns false for a point not on the segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    expect(isPointOnSegment(new Point(5, 1), seg)).toBe(false);
  });

});

describe('signedDistanceToLine', () => {

  it('is positive for a point to the left of the directed segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));  // points right
    const P   = new Point(5, 1);  // above (to the left of rightward direction)
    expect(signedDistanceToLine(P, seg)).toBeGreaterThan(0);
  });

  it('is negative for a point to the right of the directed segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    const P   = new Point(5, -1);  // below (to the right)
    expect(signedDistanceToLine(P, seg)).toBeLessThan(0);
  });

  it('is zero for a point on the line', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    expect(signedDistanceToLine(new Point(15, 0), seg)).toBeCloseTo(0);  // on the line extension
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Snap to Nearest Segment

**You know:** `closestPointOnSegment`, `distanceToSegment`.

**Task:** Implement `snapToNearestSegment(cursor: Point, segments: Segment[], snapDistance: number)`:
- Returns the closest point on any segment within `snapDistance` of the cursor
- Returns `null` if no segment is within `snapDistance`
- If two segments are equidistant, returns the closest point on the first one

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function snapToNearestSegment(
  cursor:       Point,
  segments:     Segment[],
  snapDistance: number,
): { point: Point; segment: Segment } | null {
  let best: { point: Point; segment: Segment; dist: number } | null = null;

  for (const seg of segments) {
    const { point, distance } = closestPointOnSegment(cursor, seg);
    if (distance <= snapDistance) {
      if (!best || distance < best.dist) {
        best = { point, segment: seg, dist: distance };
      }
    }
  }

  return best ? { point: best.point, segment: best.segment } : null;
}
```

**Tests:**
```ts
it('returns the snap point when cursor is within snap distance', () => {
  const seg   = new Segment(new Point(0, 0), new Point(10, 0));
  const cursor = new Point(5, 3);  // 3mm above the segment
  const snap   = snapToNearestSegment(cursor, [seg], 5);
  expect(snap).not.toBeNull();
  expect(snap!.point.equals(new Point(5, 0))).toBe(true);
});

it('returns null when cursor is beyond snap distance', () => {
  const seg    = new Segment(new Point(0, 0), new Point(10, 0));
  const cursor = new Point(5, 10);  // 10mm above — beyond snap distance of 5
  expect(snapToNearestSegment(cursor, [seg], 5)).toBeNull();
});

it('snaps to the nearest of two segments', () => {
  const seg1   = new Segment(new Point(0, 0), new Point(10, 0));
  const seg2   = new Segment(new Point(0, 4), new Point(10, 4));  // 4mm above
  const cursor = new Point(5, 1);  // 1mm above seg1, 3mm below seg2
  const snap   = snapToNearestSegment(cursor, [seg1, seg2], 5);
  expect(snap!.segment).toBe(seg1);  // closer to seg1
});
```

</details>

---

## Final Check

| Function | Returns | Use case |
|---|---|---|
| `closestPointOnSegment(P, seg)` | `{ point, t, distance }` | Snapping, distance |
| `distanceToSegment(P, seg)` | `number` | Quick distance check |
| `isPointOnSegment(P, seg)` | `boolean` | Geometric containment |
| `signedDistanceToLine(P, seg)` | `number` (+ or -) | Offset direction, winding |

---

## Quick Check Answers

**1. `t = (P-A)·(B-A) / |B-A|²` — what if `t < 0`? If `t > 1`?**

`t < 0`: the foot of the perpendicular from P is beyond endpoint A (before the segment start). Clamp to `t = 0` — the closest point on the segment is A itself.
`t > 1`: the foot is beyond endpoint B. Clamp to `t = 1` — the closest point is B. Without clamping, we'd be computing the closest point on the infinite line, not the segment.

**2. Point P is 0.0001mm from a segment. Is it "on" the segment?**

For CNC purposes: yes. 0.0001mm (0.1 microns) is below the precision of any
physical machine. The `isPointOnSegment` function uses `GEOMETRY_EPSILON = 1e-10`
as the default threshold (even smaller). 0.0001mm is 1e-4 — above GEOMETRY_EPSILON.
Adjust the epsilon based on your application's tolerance requirements.

**3. Snap to nearest segment endpoint within 5mm — which function?**

`closestPointOnSegment` gives the closest point on the segment (which may be an
interior point). For endpoint snapping specifically, check distances to `seg.start`
and `seg.end` separately and return the nearest if within the snap radius. The
signed distance function is not needed here — just `P.distanceTo(endpoint)`.
