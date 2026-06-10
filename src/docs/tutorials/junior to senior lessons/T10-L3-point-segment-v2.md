# Junior to Senior — T10·L3 — Point-Segment Relationships

**Prerequisites:** T10·L2 (Line-Line Intersection). You can find segment intersections.
This lesson derives the closest-point-on-segment formula from the projection concept —
you will understand WHERE `t = (P-A)·(B-A) / |B-A|²` comes from, not just that it works.

**What this lab adds:**
- HOW dot product projects a point onto a line — the geometric meaning
- WHY `t` is clamped to `[0,1]` — what "closest point on the LINE" vs "on the SEGMENT" means
- WHY distance from a point to a segment is used for cursor snapping
- What signed distance means — positive on one side, negative on the other
- Building a snap function that uses these operations

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Point P is at `(5, 3)`. Segment goes from `(0,0)` to `(10,0)`. Without computing,
>    where is the closest point on the segment? Why is the distance exactly 3?
> 2. The projection formula gives `t = -0.3`. What does this mean? What is the
>    closest point on the SEGMENT (not the line)?
> 3. Signed distance: positive on the LEFT, negative on the RIGHT of a directed segment.
>    For a segment going right (+X direction), which side is "left"?
>
> *(Answers at the end of this lab)*

---

## Deriving the Projection Formula

To find the closest point on segment A→B to point P:

**Step 1: Project P onto the LINE through A and B.**

The "shadow" of P on the line is the point where a perpendicular from P meets the line.
In terms of the parametric form `Q(t) = A + t*(B-A)`, we need the `t` that minimises
`|P - Q(t)|`.

**Step 2: Take the derivative and set it to zero.**

```
Minimise: |P - Q(t)|²  (squared distance — easier to differentiate)

= |P - A - t*(B-A)|²

Let d = B - A (the direction vector).

= |P-A|² - 2t*(P-A)·d + t²*|d|²

Derivative with respect to t:
  d/dt [...] = -2*(P-A)·d + 2t*|d|² = 0

Solving:
  t = (P-A)·d / |d|²
  t = (P-A)·(B-A) / |B-A|²
```

This is the dot product `(P-A)·(B-A)` divided by the squared length of the segment.

**Why the dot product?** `(P-A)·(B-A)` measures "how far along the direction (B-A) is the
vector (P-A)"? It's the signed length of the shadow of `(P-A)` onto the segment direction.

**Step 3: Clamp t to [0,1] for the segment (not the full line).**

- `t < 0`: the foot of the perpendicular is before A — closest point IS A
- `t > 1`: the foot is beyond B — closest point IS B
- `0 ≤ t ≤ 1`: foot is within the segment — closest point is the foot

---

## Step 1 — Verify By Hand

```
Segment A=(0,0), B=(10,0). Point P=(5,3).

d = B - A = (10, 0)
P - A = (5, 3)

(P-A) · d = 5*10 + 3*0 = 50
|d|² = 10² + 0² = 100

t = 50 / 100 = 0.5

Closest point: Q(0.5) = A + 0.5*(B-A) = (5, 0)

Distance: |P - (5,0)| = |(0, 3)| = 3
```

The closest point is `(5, 0)` and the distance is 3. Makes geometric sense — P is
directly above the midpoint of the segment, at height 3.

---

## Step 2 — Implement

Create `src/point-segment.ts`:

```ts
// src/point-segment.ts
import { Point, Segment }         from './primitives';
import { nearlyZero, GEOMETRY_EPSILON } from './epsilon';

export interface ClosestPointResult {
  point:    Point;   // the closest point ON the segment
  t:        number;  // parameter in [0,1]: 0=start, 1=end
  distance: number;  // distance from P to the closest point
}

export function closestPointOnSegment(
  P:   Point,
  seg: Segment,
): ClosestPointResult {
  const { start: A, end: B } = seg;

  const abx = B.x - A.x, aby = B.y - A.y;   // segment direction vector
  const len2 = abx * abx + aby * aby;          // squared length of segment

  if (nearlyZero(len2)) {
    // Degenerate segment (zero length) — closest point is the start:
    return { point: A, t: 0, distance: P.distanceTo(A) };
  }

  // t = (P-A)·(B-A) / |B-A|²  — the projection formula derived above:
  const apx = P.x - A.x, apy = P.y - A.y;   // vector from A to P
  const t   = (apx * abx + apy * aby) / len2;  // dot product / squared length

  // Clamp to [0,1] — keeps the result ON the segment, not beyond it:
  const tc      = Math.max(0, Math.min(1, t));
  const closest = seg.pointAt(tc);

  return { point: closest, t: tc, distance: P.distanceTo(closest) };
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
 * Positive = to the LEFT of the directed segment (A → B)
 * Negative = to the RIGHT
 *
 * Formula: cross product (B-A) × (P-A), normalised by segment length
 */
export function signedDistanceToLine(P: Point, seg: Segment): number {
  const { start: A, end: B } = seg;
  const len = seg.length();
  if (nearlyZero(len)) return P.distanceTo(A);

  // 2D cross product gives signed area of parallelogram:
  // positive = P is CCW from the segment direction = LEFT
  return ((B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x)) / len;
}
```

---

## Step 3 — Write Tests Verifying the Derivation

Create `src/point-segment.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Point, Segment }        from './primitives';
import { closestPointOnSegment, distanceToSegment, isPointOnSegment, signedDistanceToLine } from './point-segment';

describe('closestPointOnSegment', () => {

  it('returns the foot of the perpendicular for P above the segment', () => {
    // From the hand calculation: P=(5,3), segment (0,0)→(10,0)
    const P   = new Point(5, 3);
    const seg = new Segment(new Point(0, 0), new Point(10, 0));

    const result = closestPointOnSegment(P, seg);

    expect(result.point.x).toBeCloseTo(5);   // foot is directly below P
    expect(result.point.y).toBeCloseTo(0);
    expect(result.t).toBeCloseTo(0.5);         // midpoint of segment
    expect(result.distance).toBeCloseTo(3);    // vertical distance to P
  });

  it('clamps to t=0 when P is before the start', () => {
    // P is to the LEFT of A — t would be negative without clamping
    const P   = new Point(-5, 0);
    const seg = new Segment(new Point(0, 0), new Point(10, 0));

    const result = closestPointOnSegment(P, seg);

    expect(result.t).toBe(0);                  // clamped to start
    expect(result.point.x).toBeCloseTo(0);     // closest point IS the start
    expect(result.distance).toBeCloseTo(5);    // P is 5 units left of A
  });

  it('clamps to t=1 when P is beyond the end', () => {
    const P   = new Point(15, 0);
    const seg = new Segment(new Point(0, 0), new Point(10, 0));

    const result = closestPointOnSegment(P, seg);

    expect(result.t).toBe(1);                  // clamped to end
    expect(result.point.x).toBeCloseTo(10);    // closest point IS the end
    expect(result.distance).toBeCloseTo(5);    // P is 5 units past B
  });

  it('distance is zero for a point ON the segment', () => {
    const P   = new Point(5, 0);
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    expect(distanceToSegment(P, seg)).toBeCloseTo(0);
  });

});

describe('signedDistanceToLine', () => {

  it('is positive for a point LEFT of the directed segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));  // points RIGHT
    const P   = new Point(5, 1);  // ABOVE = LEFT of rightward segment

    expect(signedDistanceToLine(P, seg)).toBeGreaterThan(0);
  });

  it('is negative for a point RIGHT of the directed segment', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    const P   = new Point(5, -1);  // BELOW = RIGHT of rightward segment

    expect(signedDistanceToLine(P, seg)).toBeLessThan(0);
  });

  it('is zero for a point on the line', () => {
    const seg = new Segment(new Point(0, 0), new Point(10, 0));
    const P   = new Point(15, 0);  // on the line but beyond segment end

    expect(signedDistanceToLine(P, seg)).toBeCloseTo(0);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/point-segment.test.ts
```

Expected: all 6 tests pass.

**Change something:** In `closestPointOnSegment`, remove the clamping (`const tc = t` instead
of `Math.max(0, Math.min(1, t))`). Run the test for "P before the start". Expected: the test
FAILS because `t=-0.5` and the "closest point" is at `x=-5` (outside the segment). This shows
why clamping is essential for the SEGMENT case vs the LINE case.

---

## 🎯 Challenge: Build a Snap Function

**You know:** `closestPointOnSegment`, `distanceToSegment`.

**The application:** In the CAD viewport, when the user moves the cursor near a segment,
the cursor should "snap" to the closest point on that segment.

**Task:** Implement `snapToSegments(cursor: Point, segments: Segment[], snapRadius: number): { point: Point; segment: Segment } | null`

Returns the closest snappable point (within `snapRadius`) across all segments, or null if
no segment is within range.

Write 3 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function snapToSegments(
  cursor:     Point,
  segments:   Segment[],
  snapRadius: number,
): { point: Point; segment: Segment } | null {
  let best: { point: Point; segment: Segment; dist: number } | null = null;

  for (const seg of segments) {
    const { point, distance } = closestPointOnSegment(cursor, seg);

    if (distance <= snapRadius) {
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
it('returns null when no segment is within snap radius', () => {
  const cursor = new Point(100, 100);
  const seg    = new Segment(new Point(0, 0), new Point(10, 0));
  expect(snapToSegments(cursor, [seg], 5)).toBeNull();
});

it('snaps to the closest point within radius', () => {
  const cursor  = new Point(5, 3);   // 3 units above midpoint of segment
  const seg     = new Segment(new Point(0, 0), new Point(10, 0));
  const result  = snapToSegments(cursor, [seg], 5);   // snap radius 5
  expect(result).not.toBeNull();
  expect(result!.point.x).toBeCloseTo(5);
  expect(result!.point.y).toBeCloseTo(0);
});

it('returns the CLOSEST segment when two are within radius', () => {
  const cursor  = new Point(5, 1);
  const near    = new Segment(new Point(0, 0), new Point(10, 0));   // 1 unit away
  const far     = new Segment(new Point(0, 4), new Point(10, 4));   // 3 units away
  const result  = snapToSegments(cursor, [near, far], 5);
  expect(result!.segment).toBe(near);   // snaps to nearer segment
});
```

</details>

---

## Final Check

| Function | What it returns |
|---|---|
| `closestPointOnSegment(P, seg)` | `{ point, t, distance }` — point always ON segment |
| `distanceToSegment(P, seg)` | `number` — minimum distance to any point on segment |
| `isPointOnSegment(P, seg)` | `boolean` — distance < epsilon |
| `signedDistanceToLine(P, seg)` | `number` — positive=left, negative=right, zero=on line |

---

## Quick Check Answers

**1. P at `(5,3)`, segment `(0,0)→(10,0)`. Closest point and distance?**

Closest point: `(5, 0)` — directly below P, on the segment. Distance: 3. Geometrically:
P is directly above the midpoint of the segment (at `x=5`), so the perpendicular from P
to the horizontal segment hits at `(5,0)`. The distance is just the vertical coordinate of P.

**2. Projection gives `t = -0.3`. What does it mean? Closest point on SEGMENT?**

`t = -0.3` means the foot of the perpendicular is 30% of the segment LENGTH before A —
outside the segment, before the start. The closest point ON THE SEGMENT is A itself
(the start point), because you cannot go "before" the start. Clamping: `t = max(0, -0.3) = 0`.
Closest point = `seg.pointAt(0) = A`.

**3. Segment going right (+X). "Left" side is which direction?**

Up (+Y direction). When facing right (east), your left hand points north (up). The signed
distance formula uses the 2D cross product, which gives positive values for points CCW from
the segment direction — which is UP for a rightward-pointing segment.
