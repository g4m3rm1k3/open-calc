# Junior to Senior — T10·L4 — Arc Parameterisation

**Prerequisites:** T10·L3 (Point-Segment). You can compute point-segment distances.
This lesson handles arcs — the curved segments that appear in every CNC profile.

**What this lab adds:**
- Computing start/end points from centre/radius/angles
- Computing centre from start point, end point, radius, and direction
- Arc length: `L = r × |sweep_angle|`
- Three-point arc: finding the circumscribed circle
- Angle wrap-around: handling arcs that cross the 0°/360° boundary

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Arc: centre=(0,0), radius=5, start=0°, end=90°, CCW. What is the start point?
>    The end point?
> 2. An arc going CW from 10° to 350°. What is the sweep angle?
> 3. A G02 (CW arc) command has `X10 Y10 I5 J0`. What is the centre?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Arc Computations

Add to `src/arc-utils.ts`:

```ts
import { Point }          from './primitives';
import { nearlyZero }     from './epsilon';

export interface ArcDefinition {
  centre:     Point;
  radius:     number;
  startAngle: number;  // radians
  endAngle:   number;  // radians
  clockwise:  boolean;
}

/**
 * Given start point, end point, and centre offset (I, J), compute the arc.
 * This is the G02/G03 interpretation in G-code.
 */
export function arcFromIJ(
  startX:    number, startY:    number,
  endX:      number, endY:      number,
  i:         number, j:         number,  // centre offset from start point
  clockwise: boolean,
): ArcDefinition {
  const cx = startX + i;
  const cy = startY + j;
  const centre = new Point(cx, cy);

  const radius     = Math.sqrt(i * i + j * j);
  const startAngle = Math.atan2(startY - cy, startX - cx);
  const endAngle   = Math.atan2(endY   - cy, endX   - cx);

  return { centre, radius, startAngle, endAngle, clockwise };
}

/**
 * Given start point, end point, radius, and direction, compute the two possible
 * centres and return the one that produces the correct arc direction.
 */
export function arcFromRadius(
  start:     Point,
  end:       Point,
  radius:    number,
  clockwise: boolean,
): ArcDefinition {
  const dx   = end.x - start.x, dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 2 * radius + 1e-10) {
    throw new Error(`Radius ${radius} is too small — chord ${dist.toFixed(4)} > diameter`);
  }
  if (nearlyZero(dist)) {
    throw new Error('Start and end points are the same — arc is undefined');
  }

  // Midpoint:
  const mx = (start.x + end.x) / 2, my = (start.y + end.y) / 2;

  // Perpendicular direction from midpoint to centre:
  const h       = Math.sqrt(Math.max(0, radius * radius - (dist / 2) ** 2));
  const perpX   = -dy / dist, perpY = dx / dist;

  // Two candidate centres:
  const c1 = new Point(mx + h * perpX, my + h * perpY);
  const c2 = new Point(mx - h * perpX, my - h * perpY);

  // Choose the correct centre based on winding:
  const cross1 = (end.x - start.x) * (c1.y - start.y) - (end.y - start.y) * (c1.x - start.x);
  const centre  = clockwise ? (cross1 > 0 ? c1 : c2) : (cross1 < 0 ? c1 : c2);

  const startAngle = Math.atan2(start.y - centre.y, start.x - centre.x);
  const endAngle   = Math.atan2(end.y   - centre.y, end.x   - centre.x);

  return { centre, radius, startAngle, endAngle, clockwise };
}

/**
 * Computes the sweep angle of an arc (always positive).
 */
export function arcSweep(startAngle: number, endAngle: number, clockwise: boolean): number {
  if (clockwise) {
    let s = startAngle - endAngle;
    if (s <= 0) s += Math.PI * 2;
    return s;
  } else {
    let s = endAngle - startAngle;
    if (s <= 0) s += Math.PI * 2;
    return s;
  }
}

/**
 * Checks if an angle is within the arc's angular span.
 */
export function isAngleInArc(
  angle:      number,
  startAngle: number,
  endAngle:   number,
  clockwise:  boolean,
): boolean {
  const twoPI = Math.PI * 2;

  // Normalise all angles to [0, 2π):
  const norm = (a: number) => ((a % twoPI) + twoPI) % twoPI;

  const s = norm(startAngle);
  const e = norm(endAngle);
  const a = norm(angle);

  if (clockwise) {
    return s >= e ? (a >= e && a <= s) : (a >= e || a <= s);
  } else {
    return s <= e ? (a >= s && a <= e) : (a >= s || a <= e);
  }
}
```

---

## Step 2 — Write Tests

Create `src/arc-utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Point, Arc }            from './primitives';
import { arcFromIJ, arcFromRadius, arcSweep, isAngleInArc } from './arc-utils';

const toRad = (d: number) => d * Math.PI / 180;
const toDeg = (r: number) => r * 180 / Math.PI;

describe('arcFromIJ', () => {

  it('computes centre as start + (I, J)', () => {
    const arc = arcFromIJ(10, 0, 0, 10, -10, 0, true);  // CW quarter circle
    expect(arc.centre.equals(new Point(0, 0))).toBe(true);
    expect(arc.radius).toBeCloseTo(10);
  });

  it('start angle from centre to start point', () => {
    const arc = arcFromIJ(10, 0, 0, 10, -10, 0, false);
    expect(arc.startAngle).toBeCloseTo(0);  // start is at angle 0 from centre
  });

});

describe('arcFromRadius', () => {

  it('computes arc with matching radius', () => {
    const arc = arcFromRadius(new Point(0, 0), new Point(10, 0), 10, false);
    expect(arc.radius).toBeCloseTo(10);
  });

  it('throws when radius is too small', () => {
    expect(() => arcFromRadius(new Point(0, 0), new Point(10, 0), 3, false)).toThrow();
  });

  it('CCW arc has the centre to the left of the start→end direction', () => {
    const arc = arcFromRadius(new Point(0, 0), new Point(10, 0), 8, false);
    // CCW: centre should be above the segment (positive Y):
    expect(arc.centre.y).toBeGreaterThan(0);
  });

});

describe('arcSweep', () => {

  it('CCW from 0 to 90° sweeps 90°', () => {
    expect(arcSweep(toRad(0), toRad(90), false)).toBeCloseTo(toRad(90));
  });

  it('CCW from 350° to 10° sweeps 20° (crosses 0)', () => {
    expect(arcSweep(toRad(350), toRad(10), false)).toBeCloseTo(toRad(20));
  });

  it('CW from 90° to 0° sweeps 90°', () => {
    expect(arcSweep(toRad(90), toRad(0), true)).toBeCloseTo(toRad(90));
  });

  it('full circle sweep is 360°', () => {
    // Start = end (same angle) → swept nothing, but > 0 for a full circle:
    // Here tested via a 359° arc approaching full:
    expect(arcSweep(toRad(0.001), toRad(0), false)).toBeCloseTo(toRad(359.999));
  });

});

describe('isAngleInArc', () => {

  it('45° is within a CCW arc from 0° to 90°', () => {
    expect(isAngleInArc(toRad(45), toRad(0), toRad(90), false)).toBe(true);
  });

  it('180° is NOT within a CCW arc from 0° to 90°', () => {
    expect(isAngleInArc(toRad(180), toRad(0), toRad(90), false)).toBe(false);
  });

  it('0° is within a CCW arc that wraps (350° to 10°)', () => {
    expect(isAngleInArc(toRad(0), toRad(350), toRad(10), false)).toBe(true);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Distance from Point to Arc

**You know:** Arc parameterisation, closest point computation.

**Task:** Implement `distanceToArc(P: Point, arc: Arc): number` that returns
the minimum distance from P to any point on the arc. This is used for snapping
the cursor to arc curves.

Algorithm:
1. Find the angle from the arc centre to P
2. If this angle is within the arc's span, the closest point is on the arc at that angle
3. If not, the closest point is one of the endpoints

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function distanceToArc(P: Point, arc: Arc): number {
  const angle = Math.atan2(P.y - arc.centre.y, P.x - arc.centre.x);

  if (isAngleInArc(angle, arc.startAngle, arc.endAngle, arc.clockwise)) {
    // Closest point is on the arc at this angle:
    const closest = new Point(
      arc.centre.x + arc.radius * Math.cos(angle),
      arc.centre.y + arc.radius * Math.sin(angle),
    );
    return P.distanceTo(closest);
  }

  // Closest point is one of the endpoints:
  return Math.min(
    P.distanceTo(arc.startPoint()),
    P.distanceTo(arc.endPoint()),
  );
}
```

**Tests:**
```ts
it('distance to arc centre is radius for a point radially aligned', () => {
  const arc = new Arc(new Point(0,0), 5, 0, Math.PI/2, false);
  const P   = new Point(3, 0);  // on the X axis, inside the arc span
  expect(distanceToArc(P, arc)).toBeCloseTo(2);  // 5 - 3 = 2
});

it('distance to arc endpoint when P is outside the arc span', () => {
  const arc = new Arc(new Point(0,0), 5, 0, Math.PI/2, false);
  const P   = new Point(0, -5);  // below — outside the CCW 0-90° span
  // Closest endpoint is startPoint (5, 0):
  const startDist = P.distanceTo(arc.startPoint());
  expect(distanceToArc(P, arc)).toBeCloseTo(startDist);
});
```

</details>

---

## Final Check

| Function | Input | Output |
|---|---|---|
| `arcFromIJ(sx,sy,ex,ey,i,j,cw)` | G-code style | ArcDefinition |
| `arcFromRadius(start,end,r,cw)` | Start/end/radius | ArcDefinition |
| `arcSweep(start,end,cw)` | Angles + direction | Sweep angle (radians) |
| `isAngleInArc(a,start,end,cw)` | Angle + arc params | boolean |

---

## Quick Check Answers

**1. Arc: centre=(0,0), r=5, start=0°, end=90°, CCW. Start and end points?**

Start point: `(5*cos(0°), 5*sin(0°)) = (5, 0)`.
End point: `(5*cos(90°), 5*sin(90°)) = (0, 5)`.
The arc goes CCW from the positive X axis to the positive Y axis — a quarter circle
in the first quadrant.

**2. CW arc from 10° to 350°. Sweep angle?**

CW sweep = `startAngle - endAngle = 10° - 350° = -340°`. Since this is negative,
add 360°: `-340° + 360° = 20°`. The CW arc from 10° to 350° sweeps 20° — going
clockwise through 0°. (Without wrap correction: it would wrongly report 340°.)

**3. G02 (CW) with `X10 Y10 I5 J0`. What is the centre?**

Centre = start point + (I, J). The current position is the start point — let's say
the machine is at `(0, 0)`. Then centre = `(0 + 5, 0 + 0) = (5, 0)`. The arc
moves CW from `(0, 0)` to `(10, 10)` with centre at `(5, 0)`.
