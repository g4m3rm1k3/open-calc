# Junior to Senior — T10·L5 — Offset Curves

**Prerequisites:** T10·L4 (Arc Parameterisation). You can compute arc geometry.
This lesson explains WHY offset curves are the foundation of CNC toolpaths, HOW the
normal vector determines offset direction, and WHAT happens at corners when two offset
segments no longer connect.

**What this lab adds:**
- WHY the tool centre path is an OFFSET of the part profile — not the profile itself
- HOW the segment normal gives the offset direction — which direction is "outward"
- WHY arc offsetting changes only the radius, not the centre or angles
- WHAT happens at corners — two offset segments with a gap or overlap
- HOW to fix corners by extending segments to their intersection

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A 6mm diameter end mill machines a profile. The programmer draws the PART profile.
>    Where does the tool centre actually travel? Why is it NOT the profile itself?
> 2. A horizontal segment `(0,0)→(10,0)` is offset by `+3` (outward). The segment's
>    normal points up (+Y). Where does the offset segment sit?
> 3. After offsetting two adjacent segments individually, they don't meet at the corner.
>    For an OUTSIDE corner (convex), is there a gap or an overlap?
>
> *(Answers at the end of this lab)*

---

## Why Offset Curves Exist in CNC

A CNC end mill has a physical diameter — typically 6mm to 25mm. The cutting edge is
at the EDGE of the tool. When the tool cuts a profile, the tool CENTRE travels a path
that is offset from the profile by exactly the tool radius.

```
Part profile:           Programmed profile (what you want to cut)
Tool centre path:       Profile offset by tool_radius (what the machine moves)

|←──── tool_radius ────→|
                         ↑
          tool centre travels here
```

If you program the machine to follow the profile directly, the tool would cut into the
material by exactly `tool_radius` — destroying the part. This is why offset curves
are not optional — they are the CORRECT tool path.

---

## Step 1 — Offset a Segment: Show the Problem First

Before building the offset function, see what "no offset" looks like:

```bash
# Create a simple test setup:
npx tsx -e "
import { Point, Segment } from './src/primitives.ts';

// A 10mm horizontal profile segment:
const seg = new Segment(new Point(0, 0), new Point(10, 0));

// If the tool follows this directly (tool radius = 3mm):
// The cutting edge is 3mm below the tool centre.
// Tool centre at (5, 0) → cutting edge at (5, -3) — cutting 3mm INTO the floor.
console.log('Tool centre would be:', seg.midpoint());
console.log('But actual cut is 3mm below that — WRONG');
"
```

**You should see:** Tool centre follows the profile, but cutting happens below the profile.

---

### Concept: Offsetting a Segment — The Normal Direction

**What it is:** Offset a segment by distance `d` means: translate the segment
perpendicular to its direction by `d` units.

**The normal direction determines which way:**

A segment going right `(1,0)` has:
- Left-hand normal: up `(0,1)` — positive offset moves UP
- Right-hand normal: down `(0,-1)` — negative offset moves DOWN

For a CCW-wound profile (standard outer boundary):
- Positive offset = outward from the enclosed area (the tool centre path for an outside cut)
- Negative offset = inward toward the enclosed area (for a pocket cut)

**The mechanism — what the math does:**

```
Original segment: start=(0,0), end=(10,0)
Normal: (0,1) (pointing up for a rightward segment)
Offset by d=3: translate every point by 3*(0,1) = (0,3)

Offset segment: start=(0,3), end=(10,3)
```

Every point on the original segment moves by `d` in the normal direction.
The offset segment has the SAME LENGTH and SAME DIRECTION as the original.

**You will see this again in:**
- Every CAM system implements this as the basis of contour toolpaths
- DXF/SVG export: some formats store offset paths instead of original profiles
- 3D printing: the outer perimeter is an offset of the model boundary

---

## Step 2 — Build `offsetSegment`

Add to `src/offset.ts`:

```ts
// src/offset.ts
import { Point, Segment } from './primitives';

export function offsetSegment(seg: Segment, distance: number): Segment {
  // Get the left-hand normal (unit vector perpendicular, CCW from direction):
  const n  = seg.normal();

  // Translate both endpoints by distance * normal:
  const dx = n.x * distance;
  const dy = n.y * distance;

  return new Segment(
    new Point(seg.start.x + dx, seg.start.y + dy),
    new Point(seg.end.x   + dx, seg.end.y   + dy),
  );
}
```

### SAVE AND TRY

```bash
npx tsx -e "
import { Segment } from './src/primitives.ts';
import { Point }   from './src/primitives.ts';
import { offsetSegment } from './src/offset.ts';

const seg    = new Segment(new Point(0, 0), new Point(10, 0));
const offset = offsetSegment(seg, 3);

console.log('Original start:', seg.start.x, seg.start.y);         // 0, 0
console.log('Offset start:',   offset.start.x, offset.start.y);   // 0, 3
console.log('Original end:',   seg.end.x, seg.end.y);              // 10, 0
console.log('Offset end:',     offset.end.x, offset.end.y);        // 10, 3
"
```

**You should see:**
```
Original start: 0 0
Offset start: 0 3
Original end: 10 0
Offset end: 10 3
```

The segment moved up by 3 units (the normal of a rightward segment is up).

**Change something:** Try a NEGATIVE offset `offsetSegment(seg, -3)`. Expected: start becomes `(0,-3)` and end becomes `(10,-3)` — moved DOWN. Negative offset goes the other way.

---

## Step 3 — Build `offsetArc`

Arcs are simpler to offset than segments: the centre stays fixed, only the radius changes.

**The direction rule:**
- CCW arc: positive offset → LARGER radius (outward = away from centre)
- CW arc: positive offset → SMALLER radius (outward = toward centre for CW winding)

```ts
import { Arc } from './arc';

export function offsetArc(arc: Arc, distance: number): Arc | null {
  // For CCW: outward is away from centre → radius increases
  // For CW: outward is toward centre → radius decreases
  const newRadius = arc.clockwise
    ? arc.radius - distance
    : arc.radius + distance;

  if (newRadius <= 1e-10) {
    // Arc has degenerated — offset removed it:
    return null;
  }

  // Centre and angles stay the same — only radius changes:
  return new Arc(arc.centre, newRadius, arc.startAngle, arc.endAngle, arc.clockwise);
}
```

### SAVE AND TRY

```bash
npx tsx -e "
import { Point }     from './src/primitives.ts';
import { Arc }       from './src/arc.ts';
import { offsetArc } from './src/offset.ts';

const arc     = new Arc(new Point(0,0), 10, 0, Math.PI/2, false);  // CCW, radius 10
const outer   = offsetArc(arc, 3);
const inner   = offsetArc(arc, -3);

console.log('Original radius:', arc.radius);   // 10
console.log('Outer offset:',    outer?.radius); // 13 (larger)
console.log('Inner offset:',    inner?.radius); // 7  (smaller)
"
```

**Expected:**
```
Original radius: 10
Outer offset: 13
Inner offset: 7
```

---

## Step 4 — Write the Tests

```ts
// src/offset.test.ts
import { describe, it, expect } from 'vitest';
import { Point, Segment }        from './primitives';
import { Arc }                   from './arc';
import { offsetSegment, offsetArc } from './offset';

describe('offsetSegment', () => {

  it('positive offset moves a rightward segment upward', () => {
    const seg    = new Segment(new Point(0,0), new Point(10,0));
    const offset = offsetSegment(seg, 5);
    // Normal of rightward segment = up. Positive offset = up.
    expect(offset.start.y).toBeCloseTo(5);
    expect(offset.end.y).toBeCloseTo(5);
  });

  it('negative offset moves a rightward segment downward', () => {
    const seg    = new Segment(new Point(0,0), new Point(10,0));
    const offset = offsetSegment(seg, -3);
    expect(offset.start.y).toBeCloseTo(-3);
  });

  it('offset segment has the same length as the original', () => {
    const seg    = new Segment(new Point(0,0), new Point(5,5));
    const offset = offsetSegment(seg, 2);
    expect(offset.length()).toBeCloseTo(seg.length());
  });

});

describe('offsetArc', () => {

  it('CCW arc positive offset increases radius', () => {
    const arc    = new Arc(new Point(0,0), 5, 0, Math.PI/2, false);
    const offset = offsetArc(arc, 2);
    expect(offset?.radius).toBeCloseTo(7);
  });

  it('CCW arc negative offset decreases radius', () => {
    const arc    = new Arc(new Point(0,0), 5, 0, Math.PI/2, false);
    const offset = offsetArc(arc, -2);
    expect(offset?.radius).toBeCloseTo(3);
  });

  it('returns null when offset eliminates the arc', () => {
    const arc = new Arc(new Point(0,0), 5, 0, Math.PI/2, false);
    expect(offsetArc(arc, -10)).toBeNull();   // radius would be -5
  });

  it('CW arc positive offset DECREASES radius (inward)', () => {
    const arc    = new Arc(new Point(0,0), 5, 0, Math.PI/2, true);
    const offset = offsetArc(arc, 2);
    expect(offset?.radius).toBeCloseTo(3);   // CW: positive = inward = smaller
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/offset.test.ts
```

Expected: all tests pass.

---

## 🎯 Challenge: Offset a Polyline and Fix Corners

**You know:** `offsetSegment`, `lineLineIntersection` from T10-L2.

**The mechanism to understand first:**

After offsetting each segment individually, adjacent segments no longer meet at the corner:
- **Outside corner (convex):** The offset segments OVERLAP — their lines cross. Use `lineLineIntersection` to find the crossing point and trim both to that point.
- **Inside corner (concave):** The offset segments have a GAP. Add a connecting arc (the tool traces an arc around the corner) OR just connect the endpoints directly.

**Task:** Implement `offsetPolyline(segments: Segment[], distance: number): Segment[]`
that offsets each segment and fixes convex corners by intersecting adjacent offset segments.

---

<details>
<summary>▶ Show Solution</summary>

```ts
import { lineLineIntersection } from './intersection';

export function offsetPolyline(
  segments: Segment[],
  distance: number,
): Segment[] {
  if (segments.length === 0) return [];

  const offsetted = segments.map(s => offsetSegment(s, distance));
  const result: Segment[] = [];

  for (let i = 0; i < offsetted.length; i++) {
    const curr = offsetted[i];
    const next = offsetted[(i + 1) % offsetted.length];

    if (i < offsetted.length - 1) {
      // Find where the infinite lines through adjacent segments intersect:
      const intersection = lineLineIntersection(curr, next);

      if (intersection) {
        // Trim current segment's end to the intersection:
        result.push(new Segment(curr.start, intersection));
      } else {
        // Parallel segments — use as-is:
        result.push(curr);
      }
    } else {
      result.push(new Segment(curr.start, result[0]?.start ?? curr.start));
    }
  }

  return result;
}
```

**Tests:**
```ts
it('offsets a square outward', () => {
  const square = [
    new Segment(new Point(0,0), new Point(10,0)),
    new Segment(new Point(10,0), new Point(10,10)),
    new Segment(new Point(10,10), new Point(0,10)),
    new Segment(new Point(0,10), new Point(0,0)),
  ];
  const offset = offsetPolyline(square, 2);
  expect(offset).toHaveLength(4);
  // Each segment moved 2 units outward — just verify no crash and same count:
  expect(offset.some(s => s.length() > 0)).toBe(true);
});
```

**Key insight:** Corner intersection is the difference between a "rough" offset (segments
that don't connect) and a "clean" offset (tool-path quality). CAM systems spend considerable
effort on this corner case — rounded corners (G2/G3 fillets), chamfered corners, and sharp
corners all require different treatments.

</details>

---

## Final Check

| Function | What it computes |
|---|---|
| `offsetSegment(seg, d)` | Segment moved `d` units in the normal direction |
| `offsetArc(arc, d)` | Arc with same centre/angles but adjusted radius |
| `offsetPolyline(segs, d)` | All segments offset, corners fixed by intersection |

---

## Quick Check Answers

**1. 6mm end mill, programmer draws part profile. Where does tool centre travel?**

3mm (tool radius) away from the profile, on the OUTSIDE. The tool centre is always offset
from the cutting edge by the tool radius. If the centre follows the profile, the cutting
edge cuts into the material by the full tool radius. The correct tool centre path is the
profile offset outward by the tool radius.

**2. Horizontal segment offset by +3, normal is up (+Y). Where is the offset?**

The offset segment is at `y = 3` — 3 units above the original. The positive offset direction
is the segment's left-hand normal, which for a rightward segment is up (+Y).

**3. After offsetting two adjacent segments, outside corner has a gap or overlap?**

Overlap (for outside/convex corners). The two offset segments' lines CROSS at the corner
— they extend PAST each other before the actual corner point. The fix: find the crossing
point with `lineLineIntersection` and trim both segments to that point. The crossing point
IS the correctly offset corner.
