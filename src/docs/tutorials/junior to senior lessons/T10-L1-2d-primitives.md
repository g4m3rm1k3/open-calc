# Junior to Senior — T10·L1 — 2D Primitive Types

**Prerequisites:** T10·L0 (Floating-Point Precision). You have epsilon utilities.
This lesson defines the fundamental 2D geometry types that every CAD operation works with.

**What this lab adds:**
- Point: `(x, y)` — a position; immutable value object
- Line segment: two endpoints with direction
- Arc: centre, radius, start angle, end angle, direction (CW/CCW)
- Polyline: ordered list of points connected by segments
- Closed profile: polyline where last point equals first

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two `Point` objects: `P1 = (3, 4)` and `P2 = (3, 4)`. Are they equal?
>    Using `===`? Using a value-based `equals()`?
> 2. An arc has start angle 350° and end angle 10°, going counter-clockwise.
>    What is the sweep angle?
> 3. A "closed profile" is a polyline where the last point equals the first.
>    Why does this matter for CNC toolpath generation?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The foundational types for the 2D geometry library:

```ts
const p1 = new Point(0, 0);
const p2 = new Point(50, 0);
const seg = new Segment(p1, p2);

console.log(seg.length());    // 50
console.log(seg.midpoint());  // Point(25, 0)
console.log(seg.direction()); // Vec2(1, 0) — unit vector along segment

const arc = new Arc(
  new Point(0, 0),   // centre
  5,                 // radius
  0,                 // start angle (radians)
  Math.PI,           // end angle
  false,             // CCW (false = CCW)
);
console.log(arc.length());    // PI * 5 (half circumference)
```

---

### Concept: Point as Value Object

```ts
export class Point {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {
    Object.freeze(this);
  }

  equals(other: Point): boolean {
    return nearlyEqual(this.x, other.x) && nearlyEqual(this.y, other.y);
  }

  distanceTo(other: Point): number {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }

  translate(dx: number, dy: number): Point {
    return new Point(this.x + dx, this.y + dy);
  }

  toString(): string {
    return `(${this.x.toFixed(4)}, ${this.y.toFixed(4)})`;
  }
}
```

`Point` is a value object — immutable, equality by value, creation returns new instance.

---

### Concept: Segment

```ts
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

  // Unit vector from start to end:
  direction(): { x: number; y: number } {
    const len = this.length();
    if (nearlyZero(len)) throw new Error('Cannot get direction of a zero-length segment');
    return {
      x: (this.end.x - this.start.x) / len,
      y: (this.end.y - this.start.y) / len,
    };
  }

  // Normal vector (perpendicular, left-hand side):
  normal(): { x: number; y: number } {
    const d = this.direction();
    return { x: -d.y, y: d.x };  // rotated 90° CCW
  }

  // Point at parameter t ∈ [0, 1] along the segment:
  pointAt(t: number): Point {
    return new Point(
      this.start.x + t * (this.end.x - this.start.x),
      this.start.y + t * (this.end.y - this.start.y),
    );
  }
}
```

---

### Concept: Arc Direction and Sweep Angle

**The angle wrap problem:** An arc from 350° to 10° CCW spans only 20°, not 340°.

```ts
export class Arc {
  constructor(
    readonly centre:     Point,
    readonly radius:     number,
    readonly startAngle: number,  // radians
    readonly endAngle:   number,  // radians
    readonly clockwise:  boolean, // true = CW, false = CCW
  ) {
    if (radius <= 0) throw new Error('Arc radius must be positive');
  }

  sweepAngle(): number {
    if (this.clockwise) {
      let sweep = this.startAngle - this.endAngle;
      if (sweep <= 0) sweep += Math.PI * 2;  // wrap
      return sweep;
    } else {
      let sweep = this.endAngle - this.startAngle;
      if (sweep <= 0) sweep += Math.PI * 2;  // wrap
      return sweep;
    }
  }

  length(): number {
    return this.radius * this.sweepAngle();
  }

  pointAt(t: number): Point {
    // t ∈ [0, 1]: t=0 → start, t=1 → end
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
}
```

---

## Step 1 — Build All Primitives

Create `src/primitives.ts`:

```ts
import { nearlyEqual, nearlyZero } from './epsilon';

export class Point {
  constructor(readonly x: number, readonly y: number) {
    Object.freeze(this);
  }

  equals(other: Point): boolean {
    return nearlyEqual(this.x, other.x) && nearlyEqual(this.y, other.y);
  }

  distanceTo(other: Point): number {
    return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
  }

  translate(dx: number, dy: number): Point {
    return new Point(this.x + dx, this.y + dy);
  }

  toString(): string {
    return `Point(${this.x}, ${this.y})`;
  }

  static readonly ORIGIN = new Point(0, 0);
}

export class Segment {
  constructor(readonly start: Point, readonly end: Point) {}

  length(): number { return this.start.distanceTo(this.end); }

  midpoint(): Point {
    return new Point(
      (this.start.x + this.end.x) / 2,
      (this.start.y + this.end.y) / 2,
    );
  }

  direction(): { x: number; y: number } {
    const len = this.length();
    if (nearlyZero(len)) throw new Error('Zero-length segment has no direction');
    return { x: (this.end.x - this.start.x) / len, y: (this.end.y - this.start.y) / len };
  }

  normal(): { x: number; y: number } {
    const d = this.direction();
    return { x: -d.y, y: d.x };
  }

  pointAt(t: number): Point {
    return new Point(
      this.start.x + t * (this.end.x - this.start.x),
      this.start.y + t * (this.end.y - this.start.y),
    );
  }

  reversed(): Segment { return new Segment(this.end, this.start); }
}

export class Arc {
  constructor(
    readonly centre:     Point,
    readonly radius:     number,
    readonly startAngle: number,
    readonly endAngle:   number,
    readonly clockwise:  boolean,
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

  length(): number { return this.radius * this.sweepAngle(); }

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
}

export class Polyline {
  constructor(readonly points: readonly Point[]) {
    if (points.length < 2) throw new Error('Polyline requires at least 2 points');
  }

  isClosed(): boolean {
    return this.points[0].equals(this.points[this.points.length - 1]);
  }

  segments(): Segment[] {
    return this.points.slice(0, -1).map(
      (p, i) => new Segment(p, this.points[i + 1])
    );
  }

  totalLength(): number {
    return this.segments().reduce((sum, seg) => sum + seg.length(), 0);
  }

  vertexCount(): number { return this.points.length; }
}
```

---

## Step 2 — Write Tests

Create `src/primitives.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Point, Segment, Arc, Polyline } from './primitives';

describe('Point', () => {
  it('two points with same coordinates are equal', () => {
    expect(new Point(3, 4).equals(new Point(3, 4))).toBe(true);
  });

  it('two points with different coordinates are not equal', () => {
    expect(new Point(3, 4).equals(new Point(3, 5))).toBe(false);
  });

  it('distanceTo computes Pythagorean distance', () => {
    expect(new Point(0, 0).distanceTo(new Point(3, 4))).toBeCloseTo(5);
  });

  it('translate creates a new point', () => {
    const p = new Point(1, 2).translate(3, 4);
    expect(p.x).toBe(4);
    expect(p.y).toBe(6);
  });
});

describe('Segment', () => {
  const seg = new Segment(new Point(0, 0), new Point(4, 0));

  it('length is the Euclidean distance between endpoints', () => {
    expect(seg.length()).toBe(4);
  });

  it('midpoint is at the midpoint of the segment', () => {
    expect(seg.midpoint().equals(new Point(2, 0))).toBe(true);
  });

  it('direction is a unit vector from start to end', () => {
    const d = seg.direction();
    expect(d.x).toBeCloseTo(1);
    expect(d.y).toBeCloseTo(0);
  });

  it('normal is perpendicular to the segment (rotated 90° CCW)', () => {
    const n = seg.normal();
    // Segment goes right (+X), normal should go up (+Y):
    expect(n.x).toBeCloseTo(0);
    expect(n.y).toBeCloseTo(1);
  });

  it('pointAt(0) returns start, pointAt(1) returns end', () => {
    expect(seg.pointAt(0).equals(new Point(0, 0))).toBe(true);
    expect(seg.pointAt(1).equals(new Point(4, 0))).toBe(true);
  });
});

describe('Arc', () => {
  it('throws for non-positive radius', () => {
    expect(() => new Arc(new Point(0,0), 0, 0, Math.PI, false)).toThrow();
  });

  it('CCW arc from 0 to PI has sweep angle PI', () => {
    const arc = new Arc(new Point(0,0), 1, 0, Math.PI, false);
    expect(arc.sweepAngle()).toBeCloseTo(Math.PI);
  });

  it('CCW arc from 350° to 10° has sweep angle 20°', () => {
    const toRad = (d: number) => d * Math.PI / 180;
    const arc   = new Arc(new Point(0,0), 1, toRad(350), toRad(10), false);
    expect(arc.sweepAngle()).toBeCloseTo(toRad(20));
  });

  it('length equals radius × sweep angle', () => {
    const arc = new Arc(new Point(0,0), 5, 0, Math.PI, false);
    expect(arc.length()).toBeCloseTo(5 * Math.PI);
  });

  it('startPoint is on the arc at startAngle', () => {
    const arc = new Arc(new Point(0,0), 5, 0, Math.PI/2, false);
    expect(arc.startPoint().equals(new Point(5, 0))).toBe(true);
  });
});

describe('Polyline', () => {
  it('isClosed returns true when last point equals first', () => {
    const pl = new Polyline([
      new Point(0, 0), new Point(1, 0), new Point(0, 0),
    ]);
    expect(pl.isClosed()).toBe(true);
  });

  it('totalLength sums all segment lengths', () => {
    const pl = new Polyline([
      new Point(0, 0), new Point(3, 0), new Point(3, 4),
    ]);
    expect(pl.totalLength()).toBeCloseTo(3 + 5);  // 3 + √(9+16) = 3 + 5
  });
});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Add `Arc.fromThreePoints`

**You know:** Arc, centre, radius, three-point circumscribed circle.

**Task:** Implement `Arc.fromThreePoints(p1: Point, p2: Point, p3: Point): Arc`
that constructs an arc passing through three points. The winding direction is
determined by whether p1→p2→p3 is CW or CCW (use the cross product sign).

Algorithm: circumscribed circle of three points gives the centre and radius.

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
static fromThreePoints(p1: Point, p2: Point, p3: Point): Arc {
  // Find circumscribed circle (centre and radius):
  const ax = p1.x, ay = p1.y;
  const bx = p2.x, by = p2.y;
  const cx = p3.x, cy = p3.y;

  const D = 2 * (ax*(by - cy) + bx*(cy - ay) + cx*(ay - by));
  if (Math.abs(D) < 1e-10) throw new Error('Points are collinear — no arc');

  const ux = ((ax*ax + ay*ay)*(by - cy) + (bx*bx + by*by)*(cy - ay) + (cx*cx + cy*cy)*(ay - by)) / D;
  const uy = ((ax*ax + ay*ay)*(cx - bx) + (bx*bx + by*by)*(ax - cx) + (cx*cx + cy*cy)*(bx - ax)) / D;

  const centre = new Point(ux, uy);
  const radius = centre.distanceTo(p1);

  // Winding order via cross product:
  const cross = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  const clockwise = cross < 0;

  const startAngle = Math.atan2(p1.y - uy, p1.x - ux);
  const endAngle   = Math.atan2(p3.y - uy, p3.x - ux);

  return new Arc(centre, radius, startAngle, endAngle, clockwise);
}
```

**Tests:**
```ts
it('passes through all three given points', () => {
  const p1 = new Point(1, 0);
  const p2 = new Point(0, 1);
  const p3 = new Point(-1, 0);
  const arc = Arc.fromThreePoints(p1, p2, p3);
  expect(arc.startPoint().equals(p1)).toBe(true);
  expect(arc.centre.distanceTo(p1)).toBeCloseTo(arc.radius);
});

it('throws for collinear points', () => {
  expect(() => Arc.fromThreePoints(
    new Point(0,0), new Point(1,0), new Point(2,0)
  )).toThrow();
});
```

</details>

---

## Final Check

| Type | Equality | Mutable? | Key operations |
|---|---|---|---|
| `Point` | By value (epsilon) | No | `distanceTo`, `translate` |
| `Segment` | N/A | No | `length`, `direction`, `normal`, `pointAt` |
| `Arc` | N/A | No | `sweepAngle`, `length`, `pointAt` |
| `Polyline` | N/A | No | `isClosed`, `segments`, `totalLength` |

---

## Quick Check Answers

**1. `P1 = (3, 4)` and `P2 = (3, 4)`. Equal with `===`? With `equals()`?**

`===`: false — compares object references, not values. Two different `new Point(3, 4)`
instances are different objects. `.equals()`: true — compares `x` and `y` values
with `nearlyEqual`. Value objects define equality by their values, not their identity.

**2. Arc from 350° to 10° CCW. Sweep angle?**

20°. CCW means angles increase. Going from 350° to 10° CCW: crossing 360°/0°, the
sweep is `10° - 350° + 360° = 20°`. The `if (sweep <= 0) sweep += 2π` correction
handles the wrap-around. Without it, `10° - 350° = -340°` — the wrong sign and wrong magnitude.

**3. Why does "closed profile" matter for CNC toolpath generation?**

A closed profile defines a complete boundary — the tool can cut a full contour or
pocket. An open polyline only defines a path, not an enclosed area. The pocket
toolpath algorithm requires a closed boundary to determine which area to cut (inside
the profile). Winding order then determines whether to cut inside (pocket) or outside
(contour) the boundary.
