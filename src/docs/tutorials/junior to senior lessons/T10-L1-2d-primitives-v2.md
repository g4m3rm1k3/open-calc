# Junior to Senior — T10·L1 — 2D Primitive Types

**Prerequisites:** T10·L0 (Floating-Point Precision). You have `nearlyEqual` and `GEOMETRY_EPSILON`.
This lesson builds the 2D geometry types by starting with the SIMPLEST case first — a single
point — and explaining every decision that goes into it before moving to more complex types.

**What this lab adds:**
- WHY Point must be a value object (not a plain `{x, y}`) — what breaks without it
- HOW Segment derives its direction and normal from its endpoints — the geometry
- WHY Arc needs both start angle AND end angle AND direction (CW/CCW) — what's ambiguous without direction
- WHAT a closed profile means for the CNC toolpath algorithm
- Building each type incrementally with tests before moving to the next

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `const p = { x: 3, y: 4 }`. Your code does `p.x = 5`. Is this intentional
>    or a bug? How can you prevent accidental mutation?
> 2. A segment runs from `(0,0)` to `(10,0)`. Its direction is `(1, 0)`.
>    What is the "left-hand normal" (90° counter-clockwise from the direction)?
> 3. Arc from 350° to 10°, CCW. Is the sweep 20° or 340°? How do you decide?
>
> *(Answers at the end of this lab)*

---

## The Problem With Plain `{x, y}` Objects

Before building the `Point` class, see what breaks with plain objects:

```ts
// Two functions that both receive coordinate pairs:
function distanceBetween(a: {x:number, y:number}, b: {x:number, y:number}): number {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function distanceToOrigin(p: {x:number, y:number}): number {
  return distanceBetween(p, {x:0, y:0});
}

// Problem 1: accidental mutation
const centre = { x: 5, y: 5 };
doSomethingWithPoint(centre);
console.log(centre);  // → { x: 99, y: 99 }  ← was mutated! How? Who did this?

// Problem 2: equality comparison
const p1 = { x: 3, y: 4 };
const p2 = { x: 3, y: 4 };
console.log(p1 === p2);   // → false (different objects)
console.log(p1.x === p2.x && p1.y === p2.y);  // → true (but verbose everywhere)

// Problem 3: no useful methods
// To check if p1 is close to p2, every caller writes:
if (Math.abs(p1.x - p2.x) < EPSILON && Math.abs(p1.y - p2.y) < EPSILON) { ... }
// That's 5 things to write and get right, every time.
```

A `Point` class fixes all three: immutable (cannot be mutated), has `equals()` (value comparison),
has `distanceTo()` (method, not scattered helper functions).

---

## Step 1 — Build `Point`

Create a new project:

```bash
mkdir geometry-lib && cd geometry-lib
npm init -y && npm install -D vitest typescript
```

Create `src/epsilon.ts` (copy from T10-L0) and `src/point.ts`:

```ts
// src/point.ts
import { nearlyEqual } from './epsilon';

export class Point {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {
    Object.freeze(this);   // prevents accidental mutation — the problem from above
  }

  equals(other: Point): boolean {
    // Uses nearlyEqual, not ===, because floating-point (from T10-L0):
    return nearlyEqual(this.x, other.x) && nearlyEqual(this.y, other.y);
  }

  distanceTo(other: Point): number {
    // Pythagorean theorem: d = sqrt((x2-x1)² + (y2-y1)²)
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }

  translate(dx: number, dy: number): Point {
    // Returns a NEW Point — original unchanged (immutable):
    return new Point(this.x + dx, this.y + dy);
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  static readonly ORIGIN = new Point(0, 0);
}
```

Create `src/point.test.ts` — write tests BEFORE checking if they pass:

```ts
import { describe, it, expect } from 'vitest';
import { Point }                 from './point';

describe('Point', () => {

  it('two points with the same coordinates are equal', () => {
    const p1 = new Point(3, 4);
    const p2 = new Point(3, 4);
    expect(p1.equals(p2)).toBe(true);    // value-based equality
    expect(p1 === p2).toBe(false);        // different objects — demonstrates why we need .equals()
  });

  it('nearlyEqual is used — floating-point drift does not break equality', () => {
    const p1 = new Point(0.1 + 0.2, 0);
    const p2 = new Point(0.3, 0);
    expect(p1.equals(p2)).toBe(true);    // nearlyEqual handles 0.30000000000000004
  });

  it('distanceTo uses the Pythagorean theorem', () => {
    const origin = Point.ORIGIN;
    const p      = new Point(3, 4);
    // 3-4-5 right triangle: sqrt(9+16) = sqrt(25) = 5
    expect(origin.distanceTo(p)).toBeCloseTo(5);
  });

  it('is immutable — cannot be mutated', () => {
    const p = new Point(1, 2);
    expect(() => {
      (p as any).x = 99;   // attempt mutation
    }).toThrow();
    expect(p.x).toBe(1);   // unchanged
  });

  it('translate returns a NEW point without changing the original', () => {
    const p       = new Point(1, 2);
    const shifted = p.translate(5, 3);
    expect(shifted.x).toBe(6);
    expect(shifted.y).toBe(5);
    expect(p.x).toBe(1);    // original unchanged
    expect(p.y).toBe(2);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/point.test.ts
```

Expected: all 5 tests pass.

**Change something:** Remove `Object.freeze(this)` from Point. Re-run the immutability test.
Expected: it PASSES (Object.freeze causes the mutation to fail, but without it, the mutation
silently succeeds). But now add a check:

```ts
(p as any).x = 99;
console.log(p.x);  // 99! — mutated without error in non-strict mode
```

This demonstrates why `Object.freeze` matters — it enforces the value object contract.
Add it back.

---

## Step 2 — Build `Segment`

A segment has two endpoints and derived properties (direction, normal). These are computed
FROM the endpoints — not stored separately.

```ts
// src/segment.ts
import { Point }    from './point';
import { nearlyZero } from './epsilon';

export class Segment {
  constructor(
    readonly start: Point,
    readonly end:   Point,
  ) {}

  length(): number {
    return this.start.distanceTo(this.end);
  }

  midpoint(): Point {
    return new Point(
      (this.start.x + this.end.x) / 2,
      (this.start.y + this.end.y) / 2,
    );
  }

  direction(): { x: number; y: number } {
    // Unit vector from start to end — shows which way the segment points:
    const len = this.length();
    if (nearlyZero(len)) throw new Error('Zero-length segment has no direction');
    return {
      x: (this.end.x - this.start.x) / len,
      y: (this.end.y - this.start.y) / len,
    };
  }

  normal(): { x: number; y: number } {
    // Left-hand normal: perpendicular, rotated 90° counter-clockwise
    // If direction is (dx, dy), the CCW perpendicular is (-dy, dx)
    const d = this.direction();
    return { x: -d.y, y: d.x };
  }

  pointAt(t: number): Point {
    // t=0: start, t=1: end, t=0.5: midpoint
    return new Point(
      this.start.x + t * (this.end.x - this.start.x),
      this.start.y + t * (this.end.y - this.start.y),
    );
  }

  reversed(): Segment {
    return new Segment(this.end, this.start);
  }
}
```

### SAVE AND TRY

```bash
npx tsx -e "
import { Segment } from './src/segment.ts';
import { Point }   from './src/point.ts';

const seg = new Segment(new Point(0, 0), new Point(4, 0));
console.log('length:', seg.length());         // 4
console.log('direction:', seg.direction());   // {x:1, y:0} — pointing right
console.log('normal:', seg.normal());          // {x:0, y:1} — pointing up (CCW from right)
console.log('midpoint:', seg.midpoint());      // (2, 0)
"
```

**You should see:**
```
length: 4
direction: { x: 1, y: 0 }
normal: { x: 0, y: 1 }
midpoint: Point { x: 2, y: 0 }
```

**Change something:** Try `direction()` on a zero-length segment:

```bash
npx tsx -e "
import { Segment } from './src/segment.ts';
import { Point }   from './src/point.ts';
const zero = new Segment(new Point(0,0), new Point(0,0));
zero.direction();
"
```

Expected: `Error: Zero-length segment has no direction` — the guard prevents nonsense
computation instead of returning NaN or infinity.

---

### Concept: WHY Arcs Need Direction

**What it is:** Given a start angle of 350° and end angle of 10°, there are TWO valid arcs:
- Go CCW (counter-clockwise): 350° → 360° → 10° = 20° sweep
- Go CW (clockwise): 350° → 270° → 180° → 90° → 10° = 340° sweep

Both arcs pass through the same start and end points on the circle. The direction flag
is what distinguishes them.

**Why this matters for CNC:** G02 means CW arc. G03 means CCW arc. An arc without a
direction flag is ambiguous — the machine cannot know which path to take. All 340°
of the wrong path would mean cutting through solid material you didn't intend to cut.

**The sweep formula with direction:**

```
CCW sweep (from start to end, going counter-clockwise):
  sweep = end - start
  if sweep <= 0: sweep += 360°  (add full rotation to get positive)

CW sweep (from start to end, going clockwise):
  sweep = start - end
  if sweep <= 0: sweep += 360°
```

---

## Step 3 — Build `Arc`

```ts
// src/arc.ts
import { Point } from './point';

export class Arc {
  constructor(
    readonly centre:     Point,
    readonly radius:     number,
    readonly startAngle: number,  // radians
    readonly endAngle:   number,  // radians
    readonly clockwise:  boolean, // true = CW, false = CCW
  ) {
    if (radius <= 0) throw new Error(`Arc radius must be positive, got ${radius}`);
  }

  sweepAngle(): number {
    if (this.clockwise) {
      let s = this.startAngle - this.endAngle;
      if (s <= 0) s += Math.PI * 2;
      return s;
    } else {
      let s = this.endAngle - this.startAngle;
      if (s <= 0) s += Math.PI * 2;
      return s;
    }
  }

  length(): number {
    return this.radius * this.sweepAngle();
  }

  // Point on the arc at parameter t (0=start, 1=end):
  pointAt(t: number): Point {
    const angle = this.clockwise
      ? this.startAngle - t * this.sweepAngle()
      : this.startAngle + t * this.sweepAngle();
    return new Point(
      this.centre.x + this.radius * Math.cos(angle),
      this.centre.y + this.radius * Math.sin(angle),
    );
  }

  startPoint(): Point { return this.pointAt(0); }
  endPoint():   Point { return this.pointAt(1); }

  static fromHours(startHour: number, endHour: number, cw = false): Arc {
    // Convenience: create arc using hours (0=right, 3=bottom, 6=left, 9=top)
    return new Arc(
      Point.ORIGIN,
      1,
      (startHour / 12) * Math.PI * 2,
      (endHour / 12) * Math.PI * 2,
      cw,
    );
  }
}
```

Add tests:

```ts
// src/arc.test.ts
import { describe, it, expect } from 'vitest';
import { Arc }   from './arc';
import { Point } from './point';

describe('Arc', () => {

  it('throws for non-positive radius', () => {
    expect(() => new Arc(Point.ORIGIN, 0, 0, Math.PI/2, false)).toThrow();
    expect(() => new Arc(Point.ORIGIN, -5, 0, Math.PI/2, false)).toThrow();
  });

  it('CCW arc from 0 to PI/2 has sweep angle PI/2', () => {
    const arc = new Arc(Point.ORIGIN, 1, 0, Math.PI/2, false);
    expect(arc.sweepAngle()).toBeCloseTo(Math.PI / 2);
  });

  it('CCW arc that wraps (350° to 10°) has sweep angle 20°', () => {
    const toRad = (d: number) => d * Math.PI / 180;
    const arc   = new Arc(Point.ORIGIN, 1, toRad(350), toRad(10), false);
    expect(arc.sweepAngle()).toBeCloseTo(toRad(20));
  });

  it('CCW arc that wraps differently from CW arc with same endpoints', () => {
    const toRad = (d: number) => d * Math.PI / 180;
    const ccw   = new Arc(Point.ORIGIN, 1, toRad(350), toRad(10), false);
    const cw    = new Arc(Point.ORIGIN, 1, toRad(350), toRad(10), true);
    expect(ccw.sweepAngle()).toBeCloseTo(toRad(20));    // short arc
    expect(cw.sweepAngle()).toBeCloseTo(toRad(340));   // long arc
    // Same endpoints, different direction = different paths!
  });

  it('arc length equals radius times sweep angle', () => {
    const arc = new Arc(Point.ORIGIN, 5, 0, Math.PI, false);  // half circle
    expect(arc.length()).toBeCloseTo(5 * Math.PI);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/arc.test.ts
```

Expected: all 5 tests pass.

**Change something:** In the wrapping test, change the CCW arc to CW and verify the sweep
becomes 340° instead of 20°. This concretely shows why the direction flag matters —
same angles, completely different arcs.

---

## 🎯 Challenge: Add `Polyline` and Test `isClosed`

**You know:** `Point`, `Segment`, `Arc` — the primitive types.

**Task:** Build `Polyline` with:
- `constructor(points: readonly Point[])` — throws if fewer than 2 points
- `segments(): Segment[]` — returns segments connecting consecutive points
- `totalLength(): number` — sum of all segment lengths
- `isClosed(): boolean` — last point equals first point (using `nearlyEqual`)

Write 4 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
import { Point }    from './point';
import { Segment }  from './segment';

export class Polyline {
  constructor(readonly points: readonly Point[]) {
    if (points.length < 2) throw new Error('Polyline requires at least 2 points');
  }

  segments(): Segment[] {
    return this.points.slice(0, -1).map(
      (p, i) => new Segment(p, this.points[i + 1])
    );
  }

  totalLength(): number {
    return this.segments().reduce((sum, seg) => sum + seg.length(), 0);
  }

  isClosed(): boolean {
    const first = this.points[0];
    const last  = this.points[this.points.length - 1];
    return first.equals(last);
  }

  vertexCount(): number { return this.points.length; }
}
```

**Tests:**
```ts
it('throws when fewer than 2 points', () => {
  expect(() => new Polyline([new Point(0,0)])).toThrow();
});

it('segments connects consecutive points', () => {
  const pl   = new Polyline([new Point(0,0), new Point(3,0), new Point(3,4)]);
  const segs = pl.segments();
  expect(segs).toHaveLength(2);
  expect(segs[0].length()).toBeCloseTo(3);  // 0→3 along X
  expect(segs[1].length()).toBeCloseTo(4);  // 0→4 along Y
});

it('totalLength is sum of segment lengths', () => {
  const pl = new Polyline([new Point(0,0), new Point(3,0), new Point(3,4)]);
  expect(pl.totalLength()).toBeCloseTo(7);  // 3 + 4
});

it('isClosed when last point equals first', () => {
  const closed = new Polyline([new Point(0,0), new Point(5,0), new Point(0,0)]);
  expect(closed.isClosed()).toBe(true);

  const open = new Polyline([new Point(0,0), new Point(5,0), new Point(5,5)]);
  expect(open.isClosed()).toBe(false);
});
```

</details>

---

## Final Check

| Type | Key design decision | Why |
|---|---|---|
| `Point` | `Object.freeze` + `equals()` | Immutable value object, epsilon comparison |
| `Segment` | Direction and normal computed from endpoints | No redundant storage |
| `Arc` | Direction flag (CW/CCW) required | Same angles = two different arcs |
| `Polyline` | Throws for < 2 points | Invariant: a line needs two endpoints |

---

## Quick Check Answers

**1. `p.x = 5` — intentional or bug? How to prevent?**

Almost always a bug. Points are positional values — changing a point's coordinates makes
it a different point. Code that holds a reference to the original point now sees wrong
coordinates. `Object.freeze(this)` in the constructor prevents any mutation, turning
the accidental mutation into a thrown `TypeError` that immediately identifies the bug
rather than silently corrupting data.

**2. Segment `(0,0)→(10,0)`, direction `(1,0)`. Left-hand normal?**

`(0, 1)` — pointing up. The CCW rotation rule: rotate direction vector 90° counter-clockwise.
For `(dx, dy)`, the CCW perpendicular is `(-dy, dx)`. So `(1, 0)` → `(-0, 1)` = `(0, 1)`.
In CAD: the left-hand normal determines the "inside" vs "outside" of a profile.

**3. Arc 350° to 10° CCW — 20° or 340°?**

20°. CCW means going counter-clockwise, which from 350° crosses 0°/360° and reaches 10° — a
20° journey. The 340° path would go CW — in the wrong direction. The `sweepAngle()` formula
handles this: `end - start = 10 - 350 = -340` → add 360° → 20°. The `if (s <= 0) s += 360°`
is the wrap-around correction.
