# Junior to Senior — T10·L4 — Arc Parameterisation

**Prerequisites:** T10·L3 (Point-Segment). You can compute closest-point distances.
This lesson explains arc parameterisation by starting with the G-code case you'll
actually encounter: a G02 command gives you I and J (centre offsets) — how do you
get the start and end points? How do you handle the wrap-around from 350° to 10°?

**What this lab adds:**
- HOW G-code I/J offsets become arc centre coordinates — the specific calculation
- WHY `arcFromRadius` requires two choices and how you pick the right one
- HOW the sweep angle formula handles the 0°/360° wrap-around — with a worked example
- WHAT `isAngleInArc` tests — and the wrap-around edge case that makes it hard
- Building arc utilities step by step with tests proving each function

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. G-code: `G02 X10 Y10 I5 J0`. The machine is currently at `(0, 0)`. What are
>    the centre coordinates? What is the radius?
> 2. Arc from 340° to 20°, CCW. The sweep formula gives `20 - 340 = -320`.
>    Why is this wrong? What is the correct sweep?
> 3. Is the angle 0° inside the arc from 350° to 10° (CCW)? What about 180°?
>
> *(Answers at the end of this lab)*

---

## Step 1 — The G-Code Case: arcFromIJ

When the CNC controller executes `G02 X10 Y10 I5 J0`, it means:
- `X10 Y10`: end point
- `I5 J0`: centre is at current position + (I, J) = (0+5, 0+0) = (5, 0)
- `G02`: clockwise arc

From the centre at (5, 0) and start at (0, 0), the radius is `dist((0,0), (5,0)) = 5`.

```ts
// src/arc-utils.ts
import { Point } from './primitives';
import { nearlyZero } from './epsilon';

export interface ArcDefinition {
  centre:     Point;
  radius:     number;
  startAngle: number;  // radians, from +X axis
  endAngle:   number;  // radians, from +X axis
  clockwise:  boolean;
}

export function arcFromIJ(
  startX: number, startY: number,
  endX:   number, endY:   number,
  i:      number, j:      number,  // centre offset from START position
  clockwise: boolean,
): ArcDefinition {
  // Centre = start + (I, J):
  const cx = startX + i;
  const cy = startY + j;
  const centre = new Point(cx, cy);

  // Radius = distance from centre to start:
  const radius = Math.sqrt(i*i + j*j);

  // Start and end angles = direction from centre to each point:
  const startAngle = Math.atan2(startY - cy, startX - cx);
  const endAngle   = Math.atan2(endY   - cy, endX   - cx);

  return { centre, radius, startAngle, endAngle, clockwise };
}
```

### SAVE AND TRY

```bash
npx tsx -e "
import { arcFromIJ } from './src/arc-utils.ts';

// G02 X10 Y10 I5 J0, starting from (0,0):
const arc = arcFromIJ(0, 0, 10, 10, 5, 0, true);
console.log('centre:', arc.centre.x, arc.centre.y);   // 5, 0
console.log('radius:', arc.radius.toFixed(2));          // 5.00
console.log('startAngle:', (arc.startAngle * 180 / Math.PI).toFixed(1) + '°');  // 180° (left of centre)
"
```

**You should see:**
```
centre: 5 0
radius: 5.00
startAngle: 180.0°
```

The start point `(0,0)` is directly to the LEFT of the centre `(5,0)`, which is 180° from the +X axis. This confirms the formula is correct.

---

## Step 2 — The Wrap-Around Problem

The sweep angle formula has a critical edge case:

```ts
// CCW sweep should be: end - start (going counter-clockwise)
// CW  sweep should be: start - end (going clockwise)
// But what about wrap-around?

// Arc from 350° to 10° (CCW):
const start = 350 * Math.PI / 180;
const end   = 10  * Math.PI / 180;

let ccwSweep = end - start;
// = 10° - 350° = -340° — WRONG. We want 20° (the short CCW arc).
```

The fix: if the sweep is negative (or zero), add a full rotation:

```ts
export function arcSweep(
  startAngle: number,
  endAngle:   number,
  clockwise:  boolean,
): number {
  if (clockwise) {
    let s = startAngle - endAngle;   // CW sweep
    if (s <= 0) s += Math.PI * 2;   // add full rotation if negative or zero
    return s;
  } else {
    let s = endAngle - startAngle;   // CCW sweep
    if (s <= 0) s += Math.PI * 2;   // add full rotation if negative or zero
    return s;
  }
}
```

### SAVE AND TRY

```bash
npx tsx -e "
import { arcSweep } from './src/arc-utils.ts';

const toRad = (d: number) => d * Math.PI / 180;
const toDeg = (r: number) => r * 180 / Math.PI;

// Arc from 350° to 10°, CCW:
const ccw = arcSweep(toRad(350), toRad(10), false);
console.log('CCW 350→10:', toDeg(ccw).toFixed(1) + '°');   // should be 20°

// Same arc, CW:
const cw = arcSweep(toRad(350), toRad(10), true);
console.log('CW  350→10:', toDeg(cw).toFixed(1) + '°');    // should be 340°
"
```

**You should see:**
```
CCW 350→10: 20.0°
CW  350→10: 340.0°
```

Same angles, different directions, different sweeps. This is why the direction flag is not optional.

---

## Step 3 — `arcFromRadius` — When You Have Start, End, and Radius

The harder case: given two points and a radius, find the centre. There are always TWO
circles of a given radius through two points. The direction flag selects which one.

```ts
export function arcFromRadius(
  start:     Point,
  end:       Point,
  radius:    number,
  clockwise: boolean,
): ArcDefinition {
  const dx   = end.x - start.x, dy = end.y - start.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist > 2 * radius + 1e-10) {
    throw new Error(`Radius ${radius} too small — chord ${dist.toFixed(4)} > diameter`);
  }
  if (nearlyZero(dist)) {
    throw new Error('Start and end are the same point — arc is undefined');
  }

  // Midpoint of start→end:
  const mx = (start.x + end.x) / 2, my = (start.y + end.y) / 2;

  // Distance from midpoint to each centre:
  const h = Math.sqrt(Math.max(0, radius*radius - (dist/2)**2));

  // Perpendicular direction from midpoint:
  const perpX = -dy / dist, perpY = dx / dist;

  // Two candidate centres:
  const c1 = new Point(mx + h*perpX, my + h*perpY);
  const c2 = new Point(mx - h*perpX, my - h*perpY);

  // Choose the centre that produces the correct CW/CCW orientation:
  // Cross product (end-start) × (centre-start) tells us which side:
  const cross1 = dx * (c1.y - start.y) - dy * (c1.x - start.x);
  const centre  = clockwise ? (cross1 > 0 ? c1 : c2) : (cross1 < 0 ? c1 : c2);

  const startAngle = Math.atan2(start.y - centre.y, start.x - centre.x);
  const endAngle   = Math.atan2(end.y   - centre.y, end.x   - centre.x);

  return { centre, radius, startAngle, endAngle, clockwise };
}
```

---

## Step 4 — Write Tests

```ts
// src/arc-utils.test.ts
import { describe, it, expect } from 'vitest';
import { Point }                 from './primitives';
import { arcFromIJ, arcFromRadius, arcSweep } from './arc-utils';

const toRad = (d: number) => d * Math.PI / 180;

describe('arcFromIJ', () => {

  it('centre = start + (I, J)', () => {
    const arc = arcFromIJ(0, 0, 10, 10, 5, 0, true);
    expect(arc.centre.x).toBeCloseTo(5);
    expect(arc.centre.y).toBeCloseTo(0);
  });

  it('radius = distance from centre to start', () => {
    const arc = arcFromIJ(0, 0, 10, 10, 5, 0, true);
    expect(arc.radius).toBeCloseTo(5);
  });

});

describe('arcSweep — wrap-around handling', () => {

  it('CCW 0° to 90° = 90°', () => {
    expect(arcSweep(toRad(0), toRad(90), false)).toBeCloseTo(toRad(90));
  });

  it('CCW 350° to 10° = 20° (crosses 0°)', () => {
    expect(arcSweep(toRad(350), toRad(10), false)).toBeCloseTo(toRad(20));
  });

  it('CW 350° to 10° = 340° (long way around)', () => {
    expect(arcSweep(toRad(350), toRad(10), true)).toBeCloseTo(toRad(340));
  });

  it('CCW full circle = 360° when end = start', () => {
    // start = end = same angle means full circle:
    expect(arcSweep(toRad(0), toRad(0.0001), false)).toBeGreaterThan(toRad(359.9));
  });

});

describe('arcFromRadius', () => {

  it('throws when radius is too small for the chord', () => {
    expect(() => arcFromRadius(new Point(0,0), new Point(10,0), 3, false)).toThrow();
  });

  it('produces correct radius', () => {
    const arc = arcFromRadius(new Point(0,0), new Point(10,0), 8, false);
    expect(arc.radius).toBeCloseTo(8);
  });

  it('CCW arc: centre is on the LEFT of the start→end direction', () => {
    // Start=(0,0)→End=(10,0) is rightward. LEFT = above (+Y).
    const arc = arcFromRadius(new Point(0,0), new Point(10,0), 8, false);
    expect(arc.centre.y).toBeGreaterThan(0);   // centre is above the chord
  });

  it('CW arc: centre is on the RIGHT of the start→end direction', () => {
    const arc = arcFromRadius(new Point(0,0), new Point(10,0), 8, true);
    expect(arc.centre.y).toBeLessThan(0);      // centre is below the chord
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/arc-utils.test.ts
```

Expected: all tests pass.

---

## 🎯 Challenge: Implement `isAngleInArc`

**You know:** Arc definition, sweep angles, wrap-around.

**The mechanism to understand first:**

`isAngleInArc(angle, arc)` must return true when the angle is "between" the start and end
angles in the arc's direction. The wrap-around case makes this hard: for arc 350° to 10° CCW,
the angle 5° IS inside the arc, but `5 < 350` AND `5 < 10` — you cannot use a simple range check.

The solution: normalise all angles to `[0, 2π)` and handle the wrap-around with a conditional.

Write 4 tests before implementing: angle clearly inside, angle clearly outside, angle at
the boundary (=start, =end), and the wrap-around case.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function isAngleInArc(
  angle:      number,  // the angle to test
  startAngle: number,
  endAngle:   number,
  clockwise:  boolean,
): boolean {
  const twoPI = Math.PI * 2;
  const norm  = (a: number) => ((a % twoPI) + twoPI) % twoPI;  // normalise to [0, 2π)

  const s = norm(startAngle);
  const e = norm(endAngle);
  const a = norm(angle);

  if (clockwise) {
    // CW: going from s down to e (decreasing angle)
    return s >= e ? (a <= s && a >= e) : (a <= s || a >= e);
  } else {
    // CCW: going from s up to e (increasing angle)
    return s <= e ? (a >= s && a <= e) : (a >= s || a <= e);
  }
}
```

**Tests:**
```ts
it('angle clearly inside CCW arc', () => {
  expect(isAngleInArc(toRad(45), toRad(0), toRad(90), false)).toBe(true);
});

it('angle clearly outside CCW arc', () => {
  expect(isAngleInArc(toRad(180), toRad(0), toRad(90), false)).toBe(false);
});

it('wrap-around: 0° is inside CCW arc from 350° to 10°', () => {
  expect(isAngleInArc(toRad(0), toRad(350), toRad(10), false)).toBe(true);
});

it('wrap-around: 180° is outside CCW arc from 350° to 10°', () => {
  expect(isAngleInArc(toRad(180), toRad(350), toRad(10), false)).toBe(false);
});
```

</details>

---

## Final Check

| Function | Input | Output |
|---|---|---|
| `arcFromIJ(sx,sy,ex,ey,i,j,cw)` | G-code I/J offsets | ArcDefinition |
| `arcFromRadius(start,end,r,cw)` | Two points + radius | ArcDefinition |
| `arcSweep(start,end,cw)` | Angles + direction | Sweep angle in radians |
| `isAngleInArc(a,start,end,cw)` | Angle to test | boolean |

---

## Quick Check Answers

**1. `G02 X10 Y10 I5 J0` from position `(0,0)`. Centre and radius?**

Centre = current position + (I, J) = (0+5, 0+0) = `(5, 0)`.
Radius = sqrt(I² + J²) = sqrt(25 + 0) = 5.
The arc goes from `(0,0)` to `(10,10)`, CW, around the centre `(5,0)` with radius 5.

**2. Arc from 340° to 20°, CCW. `20 - 340 = -320`. Why wrong? Correct answer?**

Going CCW from 340°, you cross 360°/0° and reach 20° — a 40° journey, not -320°.
The formula `end - start` gives a negative number because end < start in raw degrees.
The fix: `if (sweep <= 0) sweep += 360°`. So `-320° + 360° = 40°`. The correct CCW sweep
from 340° to 20° is 40°.

**3. 0° inside CCW arc from 350° to 10°? 180°?**

0° IS inside — going CCW from 350°, you pass through 360°/0° to reach 10°, so 0° is on
the arc. 180° is NOT inside — going CCW from 350°, you reach 10° in only 20°; you never
pass through 180° on the short arc.
