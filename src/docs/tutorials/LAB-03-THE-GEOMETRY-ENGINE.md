# Lab 03 — The Geometry Engine

### CAM System Masterclass

---

## What You Will Build

By the end of this lab, the app has a real geometry system. You can:

- Add lines, circles, and arcs through the panel form
- See them drawn on the canvas at their correct world positions
- See them listed in the "Objects" panel section
- Delete them from the list
- Watch the canvas re-render from the geometry array whenever anything changes

More importantly, the code is split across multiple files for the first time.
You will learn what ES modules are, why we need them, and how to use them.
This lab also introduces the most important math object in 2D geometry: the
**Vector2**.

**Time:** 4–6 hours.

---

## Part 1 — The Problem with One File

Right now everything is in `index.html`. That was fine for 200 lines. But
geometry, rendering, and UI interaction code are fundamentally different concerns.
As the app grows, a single file becomes impossible to navigate and impossible
to test in isolation.

More concretely: if you define a function `drawLine` in your script and then
someone adds a plugin that also defines `drawLine`, they conflict. This is the
**global scope problem**.

### What the global scope is

When you write `function render() { ... }` in a `<script>` tag, `render` is
attached to the global object — `window` in a browser. Every script tag shares
this same namespace. If two scripts both define `render`, the second one silently
overwrites the first.

In a 50-line app this is fine. In a 5000-line app with 20 modules, it is
catastrophic. And you can't reason about it statically — you have to read all
the code to know what is in scope.

### ES Modules: private scopes, explicit dependencies

ES Modules (introduced in ES2015, well-supported since 2018) solve this by
giving each file its **own private scope**. Nothing defined in a module is
visible outside unless explicitly `export`ed. Nothing external is visible inside
unless explicitly `import`ed.

```js
// math.js
export function add(a, b) {
  return a + b;
}
const secret = 42; // not exported, not visible outside
```

```js
// main.js
import { add } from "./math.js";
console.log(add(2, 3)); // 5
// console.log(secret); // ReferenceError: secret is not defined
```

This is **explicit dependency management**: the file says exactly what it
imports and what it exports. You can read `import` statements at the top of a
file and immediately know all of its dependencies.

### The HTTP requirement

Modules only work when files are served over HTTP, not opened directly from
disk (`file:///`). This is a browser security restriction: `file://` origins
are not allowed to read sibling files (for security reasons).

When you use **Live Server**, files are served at `http://127.0.0.1:5500`.
That is an HTTP origin — modules work. Check your browser tab URL before
continuing. If it starts with `file:///`, right-click `index.html` → Open with
Live Server.

---

## Part 2 — Restructuring into Modules

We are going to create this file structure:

```
cam/
  index.html
  js/
    state.js       ← the single shared application state
    math/
      Vector2.js   ← 2D vector math
    geometry/
      Geometry.js  ← base class
      Line.js
      Circle.js
      Arc.js
    renderer/
      Renderer2D.js
    ui/
      panel.js     ← panel form wiring
    main.js        ← entry point, wires everything together
```

We build this incrementally. Each file we add, we run the app and verify it
still works.

### Step 1 — Create the `js/` folder structure

In your file explorer, create these folders inside `cam/`:

```
cam/js/
cam/js/math/
cam/js/geometry/
cam/js/renderer/
cam/js/ui/
```

### Step 2 — Update `index.html` to use a module script

In `index.html`, change the `<script>` tag from:

```html
<script>
  // all code
</script>
```

to:

```html
<script type="module" src="js/main.js"></script>
```

The `type="module"` attribute is what tells the browser to treat this script
as an ES module. It will:

- Load `js/main.js`
- See any `import` statements and load those files too
- Give each file its own scope
- Defer execution until the DOM is ready (so you do not need `DOMContentLoaded`)

---

## Part 3 — The State Module

The first file to extract: the shared application state. This is the single
source of truth that all other modules read from and write to.

Create `cam/js/state.js`:

```js
// state.js
// The single source of truth for all application state.
// Every module that needs to read or modify app data imports this.
// There is only ONE state object for the entire application.

export const state = {
  view: {
    panX: 0,
    panY: 0,
    zoom: 50,
  },
  mode: "select",

  // geometry: array of geometry objects.
  // Each object has: { id, type, ...props }
  // type can be 'line', 'circle', 'arc'
  // Properties vary by type — see geometry classes below.
  geometry: [],

  // Next ID to assign. Increments with each new geometry object.
  nextId: 1,
};
```

This file has no logic — only data. It exports one thing: `state`.

---

## Part 4 — Vector2: 2D Math from Scratch

Vector2 is the mathematical foundation of everything in 2D geometry. A Vector2
is simply a pair of numbers `(x, y)` with specific operations defined on it.

But before building Vector2, you need to understand what a vector is and why
we need math operations on it.

### What is a vector?

A vector is a quantity with both **magnitude** (size) and **direction**. In 2D,
a vector is represented as `(x, y)` — think of it as an arrow pointing from
the origin to that point.

Vectors describe:

- **Positions** — "the center of this circle is at (30, 20)"
- **Directions** — "move in the direction (0.6, 0.8)"
- **Offsets** — "point B is 15mm right and 10mm up from point A"

### Why not just use plain `{x, y}` objects?

We do use plain `{x, y}` in some places (the coordinate transform functions
in Lab 01). But for geometric calculations, we need operations like "normalize
this vector" or "dot product of these two." We can either write those as
standalone functions every time, or define them once as methods on a class.
The class approach is cleaner and more readable.

### The operations you need

**Magnitude (length):** The distance from origin to the point. By the
Pythagorean theorem: $\|v\| = \sqrt{x^2 + y^2}$

**Normalization:** A vector with the same direction but length exactly 1.
Divide each component by the magnitude: $\hat{v} = v / \|v\|$. Normalized
vectors are used to represent pure direction without size information.

**Dot product:** $a \cdot b = a.x \cdot b.x + a.y \cdot b.y$. This scalar
tells you how much of `a` is in the direction of `b`. When both are normalized,
it equals the cosine of the angle between them. Dot product = 0 means
perpendicular.

**Perpendicular:** In 2D, rotating a vector 90° counterclockwise gives its
perpendicular: $(-y, x)$. Used to find normals to lines.

**Distance:** Distance between two points $= \|b - a\|$

**Lerp (linear interpolation):** A point between $a$ and $b$: $a + t(b - a)$
where $t \in [0, 1]$. At $t=0$ you get $a$, at $t=1$ you get $b$, at
$t=0.5$ you get the midpoint.

Create `cam/js/math/Vector2.js`:

```js
// Vector2.js
// A 2D vector/point. Immutable: all operations return new Vector2 instances.
// Immutability prevents bugs where modifying a vector accidentally affects
// other code that holds a reference to the same object.

export class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    // Freeze the object: make x and y read-only.
    // Any attempt to set v.x = 5 will silently fail (or throw in strict mode).
    // This enforces immutability.
    Object.freeze(this);
  }

  // ── Arithmetic ─────────────────────────────────────────────────────────────

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  scale(s) {
    return new Vector2(this.x * s, this.y * s);
  }

  negate() {
    return new Vector2(-this.x, -this.y);
  }

  // ── Properties ─────────────────────────────────────────────────────────────

  // Magnitude (length). Uses the Pythagorean theorem.
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Alias: length() is an intuitive alternative name
  length() {
    return this.magnitude();
  }

  // Squared magnitude. Avoids the sqrt when only comparing magnitudes.
  // "Is |a| > |b|?" → "Is |a|^2 > |b|^2?" — same answer, no sqrt needed.
  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  // ── Direction ──────────────────────────────────────────────────────────────

  // Normalize: return a vector with the same direction, length = 1.
  // If the vector is zero-length, returns a zero vector (no safe divide-by-zero).
  normalize() {
    const m = this.magnitude();
    if (m < 1e-10) return new Vector2(0, 0); // avoid division by near-zero
    return new Vector2(this.x / m, this.y / m);
  }

  // Perpendicular (90° counterclockwise rotation)
  perp() {
    return new Vector2(-this.y, this.x);
  }

  // ── Products ──────────────────────────────────────────────────────────────

  // Dot product: a·b = ax*bx + ay*by
  // If both vectors are normalized, dot product = cos(angle between them)
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  // 2D "cross product": returns the Z component of the 3D cross product.
  // positive = v is counterclockwise from this
  // negative = v is clockwise from this
  // zero = parallel
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  // ── Distance ──────────────────────────────────────────────────────────────

  distanceTo(v) {
    return this.sub(v).magnitude();
  }

  distanceSquaredTo(v) {
    return this.sub(v).magnitudeSquared();
  }

  // ── Interpolation ─────────────────────────────────────────────────────────

  // Linear interpolation between this and v.
  // t=0 → this, t=1 → v, t=0.5 → midpoint
  lerp(v, t) {
    return new Vector2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
    );
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  // Return a plain {x, y} object.
  // Useful when interfacing with code that expects plain objects.
  toPlain() {
    return { x: this.x, y: this.y };
  }

  // Angle of this vector from the positive X axis (radians)
  angle() {
    return Math.atan2(this.y, this.x);
  }

  toString() {
    return `Vector2(${this.x.toFixed(4)}, ${this.y.toFixed(4)})`;
  }

  // ── Static factory methods ─────────────────────────────────────────────────

  // Create from a plain {x, y} object
  static fromPlain(p) {
    return new Vector2(p.x, p.y);
  }

  // Create a unit vector at a given angle (radians)
  static fromAngle(radians) {
    return new Vector2(Math.cos(radians), Math.sin(radians));
  }

  // The zero vector (0, 0)
  static get ZERO() {
    return new Vector2(0, 0);
  }

  // Unit vector along X
  static get X() {
    return new Vector2(1, 0);
  }

  // Unit vector along Y
  static get Y() {
    return new Vector2(0, 1);
  }
}
```

---

## BUILD 1 — Test Vector2

Before connecting it to the app, verify the math manually. Create a temporary
`test.html` in your `cam/` folder:

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      import { Vector2 } from "./js/math/Vector2.js";

      // Basic arithmetic
      const a = new Vector2(3, 4);
      const b = new Vector2(1, 2);

      console.assert(a.add(b).x === 4, "add x");
      console.assert(a.add(b).y === 6, "add y");
      console.assert(a.sub(b).x === 2, "sub x");
      console.assert(a.sub(b).y === 2, "sub y");

      // Magnitude: 3-4-5 triangle
      console.assert(a.magnitude() === 5, "magnitude 3-4-5");

      // Normalization: result should have length 1
      const n = a.normalize();
      console.assert(
        Math.abs(n.magnitude() - 1) < 1e-10,
        "normalized length = 1",
      );

      // Dot product
      // (1,0) · (0,1) = 0 → perpendicular
      const x = new Vector2(1, 0);
      const y = new Vector2(0, 1);
      console.assert(x.dot(y) === 0, "perpendicular dot = 0");
      // (1,0) · (1,0) = 1 → parallel unit vectors
      console.assert(x.dot(x) === 1, "parallel unit dot = 1");

      // Distance
      console.assert(
        a.distanceTo(Vector2.ZERO) === 5,
        "distance to origin = 5",
      );

      // Lerp midpoint
      const mid = new Vector2(0, 0).lerp(new Vector2(10, 20), 0.5);
      console.assert(mid.x === 5, "lerp midpoint x");
      console.assert(mid.y === 10, "lerp midpoint y");

      // Perpendicular
      const perp = new Vector2(1, 0).perp();
      console.assert(perp.x === 0, "perp x");
      console.assert(perp.y === 1, "perp y");

      console.log("All Vector2 tests passed!");
    </script>
  </body>
</html>
```

Open this in the browser via Live Server. The Console should show:
`All Vector2 tests passed!`

Any failed assert indicates a bug in your Vector2 implementation. Fix it before
continuing.

---

## Part 5 — Geometry Objects: What They Are and Why

A geometry object represents one piece of drawn geometry: a line, a circle,
an arc. It stores all the information needed to:

1. Draw itself on the canvas
2. Serialize to/from JSON (for save/load in Lab 07)
3. Generate toolpaths (for CAM operations in Lab 07)
4. Participate in boolean operations (Lab 07)

### The base class pattern

All geometry types share common properties: an ID, a type identifier, and
display attributes (color, layer). We define a base class `Geometry` with
these common properties. Subclasses (`Line`, `Circle`, `Arc`) extend it
with type-specific data.

This is the **inheritance** pattern. It is one way to handle variation
while sharing common code. (Another way is **composition**, which we will
encounter in Lab 06 with operations. Both have their place.)

### Why use classes for geometry?

Alternative: plain objects `{ type: 'line', x1: 0, y1: 0, ... }`. These work
fine and are actually used in many production codebases (Redux stores, JSON APIs,
etc.). The downside: no encapsulation, no methods, no type safety.

Classes give us:

- Methods on the object: `line.midpoint()`, `circle.containsPoint(p)`
- A type you can check with `instanceof`
- A clear place for derived values (midpoint, bounding box) to live
- Encapsulation — internal data doesn't leak

For a learning project that's also the eventual production app, classes are
the right choice.

---

## Part 6 — The Geometry Base Class

Create `cam/js/geometry/Geometry.js`:

```js
// Geometry.js
// Base class for all geometry objects.
// You never instantiate Geometry directly — always use Line, Circle, or Arc.

export class Geometry {
  // idCounter: static class-level counter.
  // Static means it belongs to the class, not to instances.
  // There is one counter for all geometry objects.
  static idCounter = 1;

  constructor(type) {
    // Assign a unique integer ID to this geometry object.
    this.id = Geometry.idCounter++;

    // Type string: 'line', 'circle', 'arc'
    // Used for rendering dispatch and serialization.
    this.type = type;

    // Display properties
    this.color = null; // null = use the default from CSS tokens
    this.selected = false;
    this.visible = true;
    this.label = ""; // optional user label
  }

  // ── Subclasses must implement these ──────────────────────────────────────

  // bounding box: { minX, minY, maxX, maxY } in world mm
  getBoundingBox() {
    throw new Error(`${this.type}.getBoundingBox() not implemented`);
  }

  // JSON-serializable representation
  toJSON() {
    throw new Error(`${this.type}.toJSON() not implemented`);
  }

  // ── Common utility ────────────────────────────────────────────────────────

  // Human-readable description of this object
  describe() {
    return `${this.type} #${this.id}`;
  }
}
```

The `throw new Error(...)` pattern is called an **abstract method sentinel**.
JavaScript has no language-level concept of abstract methods, so we enforce it
at runtime: if a subclass forgets to implement `getBoundingBox`, the first
call will throw a clear error message pointing exactly to what is missing.

---

## Part 7 — The Line Geometry

Create `cam/js/geometry/Line.js`:

```js
// Line.js
// A straight line segment defined by two endpoints (world mm).

import { Geometry } from "./Geometry.js";
import { Vector2 } from "../math/Vector2.js";

export class Line extends Geometry {
  // p1, p2: Vector2 endpoints in world mm
  constructor(p1, p2) {
    super("line"); // call Geometry's constructor with type = 'line'
    this.p1 = p1; // Vector2
    this.p2 = p2; // Vector2
  }

  // ── Derived geometry ──────────────────────────────────────────────────────

  // Midpoint of the line
  midpoint() {
    return this.p1.lerp(this.p2, 0.5);
  }

  // Length of the line
  length() {
    return this.p1.distanceTo(this.p2);
  }

  // Direction vector (from p1 to p2), normalized
  direction() {
    return this.p2.sub(this.p1).normalize();
  }

  // Normal vector (perpendicular to line, normalized)
  normal() {
    return this.direction().perp();
  }

  // ── Geometry interface ────────────────────────────────────────────────────

  getBoundingBox() {
    return {
      minX: Math.min(this.p1.x, this.p2.x),
      minY: Math.min(this.p1.y, this.p2.y),
      maxX: Math.max(this.p1.x, this.p2.x),
      maxY: Math.max(this.p1.y, this.p2.y),
    };
  }

  toJSON() {
    return {
      id: this.id,
      type: "line",
      p1: this.p1.toPlain(),
      p2: this.p2.toPlain(),
      label: this.label,
    };
  }

  describe() {
    return `Line #${this.id}: (${this.p1.x.toFixed(2)}, ${this.p1.y.toFixed(2)}) → (${this.p2.x.toFixed(2)}, ${this.p2.y.toFixed(2)})`;
  }

  // ── Static factory ────────────────────────────────────────────────────────

  // Create a Line from plain {x, y} objects (useful when loading from JSON)
  static fromJSON(data) {
    const line = new Line(
      Vector2.fromPlain(data.p1),
      Vector2.fromPlain(data.p2),
    );
    line.id = data.id;
    line.label = data.label ?? "";
    return line;
  }
}
```

---

## Part 8 — The Circle Geometry

Create `cam/js/geometry/Circle.js`:

```js
// Circle.js
// A full circle defined by its center point and radius (world mm).

import { Geometry } from "./Geometry.js";
import { Vector2 } from "../math/Vector2.js";

export class Circle extends Geometry {
  // center: Vector2 in world mm
  // radius: number in world mm (must be positive)
  constructor(center, radius) {
    super("circle");
    this.center = center; // Vector2
    this.radius = radius; // number, mm

    if (radius <= 0) {
      throw new Error(`Circle radius must be positive, got ${radius}`);
    }
  }

  // ── Derived geometry ──────────────────────────────────────────────────────

  // Area: π r²
  area() {
    return Math.PI * this.radius * this.radius;
  }

  // Circumference: 2π r
  circumference() {
    return 2 * Math.PI * this.radius;
  }

  // Point on the circle at angle (radians), measured from positive X axis
  pointAtAngle(radians) {
    return new Vector2(
      this.center.x + this.radius * Math.cos(radians),
      this.center.y + this.radius * Math.sin(radians),
    );
  }

  // Does the given point lie inside the circle?
  containsPoint(p) {
    return this.center.distanceSquaredTo(p) <= this.radius * this.radius;
  }

  // ── Geometry interface ────────────────────────────────────────────────────

  getBoundingBox() {
    return {
      minX: this.center.x - this.radius,
      minY: this.center.y - this.radius,
      maxX: this.center.x + this.radius,
      maxY: this.center.y + this.radius,
    };
  }

  toJSON() {
    return {
      id: this.id,
      type: "circle",
      center: this.center.toPlain(),
      radius: this.radius,
      label: this.label,
    };
  }

  describe() {
    return `Circle #${this.id}: center (${this.center.x.toFixed(2)}, ${this.center.y.toFixed(2)}), r=${this.radius.toFixed(2)}`;
  }

  static fromJSON(data) {
    const c = new Circle(Vector2.fromPlain(data.center), data.radius);
    c.id = data.id;
    c.label = data.label ?? "";
    return c;
  }
}
```

---

## Part 9 — The Arc Geometry

An arc is the trickiest geometry type because it requires understanding angles.

### Angles and radians

In CAD systems, angles are measured in **radians**, not degrees. One full
revolution = 2π radians = 360 degrees.

$\text{radians} = \text{degrees} \times \frac{\pi}{180}$
$\text{degrees} = \text{radians} \times \frac{180}{\pi}$

An arc is defined by:

- A center point
- A radius
- A start angle (radians from positive X axis)
- An end angle (radians from positive X axis)
- A direction: clockwise or counterclockwise

In canvas's `ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise)`:

- Angles are measured counterclockwise from positive X axis
- The `anticlockwise` flag (default `false`) means the arc sweeps from
  `startAngle` to `endAngle` in the standard mathematical direction

One subtlety: because canvas Y is flipped (Y increases downward), what the
canvas calls "counterclockwise" is visually clockwise. In **world space** where
Y increases upward, we define arcs the mathematical way (counterclockwise is
positive). The renderer handles the Y-flip.

Create `cam/js/geometry/Arc.js`:

```js
// Arc.js
// A circular arc defined by center, radius, start angle, and end angle.
// All angles in radians. Positive direction is counterclockwise (math convention).

import { Geometry } from "./Geometry.js";
import { Vector2 } from "../math/Vector2.js";

export class Arc extends Geometry {
  // center: Vector2 world mm
  // radius: number mm
  // startAngle, endAngle: radians, counterclockwise from positive X axis
  constructor(center, radius, startAngle, endAngle) {
    super("arc");
    this.center = center;
    this.radius = radius;
    this.startAngle = startAngle;
    this.endAngle = endAngle;

    if (radius <= 0) {
      throw new Error(`Arc radius must be positive, got ${radius}`);
    }
  }

  // ── Derived geometry ──────────────────────────────────────────────────────

  // The angular span of the arc (radians, always positive, counterclockwise)
  // We normalize to [0, 2π]
  sweepAngle() {
    let sweep = this.endAngle - this.startAngle;
    // Normalize to [0, 2π)
    while (sweep < 0) sweep += 2 * Math.PI;
    while (sweep > 2 * Math.PI) sweep -= 2 * Math.PI;
    return sweep;
  }

  // Arc length: r × sweep
  length() {
    return this.radius * this.sweepAngle();
  }

  // Start point (world mm)
  startPoint() {
    return new Vector2(
      this.center.x + this.radius * Math.cos(this.startAngle),
      this.center.y + this.radius * Math.sin(this.startAngle),
    );
  }

  // End point (world mm)
  endPoint() {
    return new Vector2(
      this.center.x + this.radius * Math.cos(this.endAngle),
      this.center.y + this.radius * Math.sin(this.endAngle),
    );
  }

  // Midpoint of the arc
  midPoint() {
    const midAngle = this.startAngle + this.sweepAngle() / 2;
    return new Vector2(
      this.center.x + this.radius * Math.cos(midAngle),
      this.center.y + this.radius * Math.sin(midAngle),
    );
  }

  // ── Geometry interface ────────────────────────────────────────────────────

  getBoundingBox() {
    // The bounding box of an arc is non-trivial: we need to check all
    // the "extreme" angles (0, 90, 180, 270 degrees) that the arc passes through.
    const pts = [this.startPoint(), this.endPoint()];

    // Check each cardinal angle
    const cardinals = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    for (const angle of cardinals) {
      if (this._containsAngle(angle)) {
        pts.push(
          new Vector2(
            this.center.x + this.radius * Math.cos(angle),
            this.center.y + this.radius * Math.sin(angle),
          ),
        );
      }
    }

    return {
      minX: Math.min(...pts.map((p) => p.x)),
      minY: Math.min(...pts.map((p) => p.y)),
      maxX: Math.max(...pts.map((p) => p.x)),
      maxY: Math.max(...pts.map((p) => p.y)),
    };
  }

  // Does this arc pass through the given angle?
  _containsAngle(angle) {
    // Normalize angle to [0, 2π)
    const twoPi = 2 * Math.PI;
    let a = ((angle % twoPi) + twoPi) % twoPi;
    let s = ((this.startAngle % twoPi) + twoPi) % twoPi;
    let e = ((this.endAngle % twoPi) + twoPi) % twoPi;

    if (s <= e) {
      return a >= s && a <= e;
    } else {
      // Arc wraps around 0°
      return a >= s || a <= e;
    }
  }

  toJSON() {
    return {
      id: this.id,
      type: "arc",
      center: this.center.toPlain(),
      radius: this.radius,
      startAngle: this.startAngle,
      endAngle: this.endAngle,
      label: this.label,
    };
  }

  describe() {
    const toDeg = (r) => ((r * 180) / Math.PI).toFixed(1);
    return `Arc #${this.id}: center (${this.center.x.toFixed(2)}, ${this.center.y.toFixed(2)}), r=${this.radius.toFixed(2)}, ${toDeg(this.startAngle)}°→${toDeg(this.endAngle)}°`;
  }

  static fromJSON(data) {
    const a = new Arc(
      Vector2.fromPlain(data.center),
      data.radius,
      data.startAngle,
      data.endAngle,
    );
    a.id = data.id;
    a.label = data.label ?? "";
    return a;
  }
}
```

---

## BUILD 2 — Test the geometry classes

Create `cam/test-geometry.html`:

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      import { Vector2 } from "./js/math/Vector2.js";
      import { Line } from "./js/geometry/Line.js";
      import { Circle } from "./js/geometry/Circle.js";
      import { Arc } from "./js/geometry/Arc.js";

      // ── Line tests ────────────────────────────────────────────────────────────
      const line = new Line(new Vector2(0, 0), new Vector2(3, 4));
      console.assert(line.type === "line", "type");
      console.assert(Math.abs(line.length() - 5) < 1e-10, "line length 3-4-5");
      const mid = line.midpoint();
      console.assert(mid.x === 1.5 && mid.y === 2, "line midpoint");
      const bbox = line.getBoundingBox();
      console.assert(bbox.minX === 0 && bbox.maxX === 3, "line bbox x");
      console.assert(bbox.minY === 0 && bbox.maxY === 4, "line bbox y");

      // ── Circle tests ──────────────────────────────────────────────────────────
      const circle = new Circle(new Vector2(5, 5), 10);
      console.assert(circle.type === "circle", "type");
      console.assert(Math.abs(circle.area() - Math.PI * 100) < 1e-10, "area");
      console.assert(
        circle.containsPoint(new Vector2(5, 5)),
        "center is inside",
      );
      console.assert(
        !circle.containsPoint(new Vector2(20, 5)),
        "far point is outside",
      );

      const ptAt0 = circle.pointAtAngle(0);
      console.assert(
        Math.abs(ptAt0.x - 15) < 1e-10,
        "point at 0°: x=center.x+r",
      );

      // ── Arc tests ─────────────────────────────────────────────────────────────
      const arc = new Arc(
        new Vector2(0, 0),
        10,
        0, // start: 0° (positive X axis)
        Math.PI / 2, // end: 90° (positive Y axis)
      );
      console.assert(arc.type === "arc", "type");

      const sp = arc.startPoint();
      console.assert(
        Math.abs(sp.x - 10) < 1e-10 && Math.abs(sp.y) < 1e-10,
        "arc start point",
      );

      const ep = arc.endPoint();
      console.assert(
        Math.abs(ep.x) < 1e-10 && Math.abs(ep.y - 10) < 1e-10,
        "arc end point",
      );

      console.assert(
        Math.abs(arc.sweepAngle() - Math.PI / 2) < 1e-10,
        "quarter-circle sweep",
      );
      console.assert(
        Math.abs(arc.length() - (Math.PI * 10) / 2) < 1e-10,
        "quarter-circle length",
      );

      // JSON round-trip
      const lineJson = line.toJSON();
      const lineBack = Line.fromJSON(lineJson);
      console.assert(
        lineBack.p1.x === 0 && lineBack.p2.x === 3,
        "line JSON round-trip",
      );

      console.log("All geometry tests passed!");
    </script>
  </body>
</html>
```

---

## Part 10 — The 2D Renderer

The renderer is the module that reads `state.geometry` and draws everything
onto the canvas. It owns the `render()` function. The key design principle:
**the renderer reads state but never writes it**. It is a pure "state → pixels"
function.

Create `cam/js/renderer/Renderer2D.js`:

```js
// Renderer2D.js
// Reads state and renders all geometry to the 2D canvas context.
// Does NOT modify state. Is called by main.js whenever state changes.

import { state } from "../state.js";

// ── Module-level references (set by init) ──────────────────────────────────
let canvas;
let ctx;

export function init(canvasElement) {
  canvas = canvasElement;
  ctx = canvasElement.getContext("2d");
}

// ── CSS token reader ───────────────────────────────────────────────────────
function getToken(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// ── Coordinate transforms ──────────────────────────────────────────────────
// These are the same formulas from Lab 01, now living in the renderer module.

export function worldToCanvas(wx, wy) {
  const { panX, panY, zoom } = state.view;
  return {
    x: canvas.width / 2 + wx * zoom + panX,
    y: canvas.height / 2 - wy * zoom + panY,
  };
}

export function canvasToWorld(cx, cy) {
  const { panX, panY, zoom } = state.view;
  return {
    x: (cx - canvas.width / 2 - panX) / zoom,
    y: -(cy - canvas.height / 2 - panY) / zoom,
  };
}

// ── Grid ───────────────────────────────────────────────────────────────────

function niceGridUnit(rough) {
  const v = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  return v.find((n) => n >= rough) ?? v[v.length - 1];
}

function drawGrid() {
  const tl = canvasToWorld(0, 0);
  const br = canvasToWorld(canvas.width, canvas.height);
  const unit = niceGridUnit((br.x - tl.x) / 8);

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = getToken("--color-grid");
  ctx.beginPath();

  for (let wx = Math.floor(tl.x / unit) * unit; wx <= br.x + unit; wx += unit) {
    const x = Math.round(worldToCanvas(wx, 0).x) + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  for (let wy = Math.floor(br.y / unit) * unit; wy <= tl.y + unit; wy += unit) {
    const y = Math.round(worldToCanvas(0, wy).y) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();

  ctx.strokeStyle = getToken("--color-grid-major");
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const axX = Math.round(worldToCanvas(0, 0).x) + 0.5;
  const axY = Math.round(worldToCanvas(0, 0).y) + 0.5;
  ctx.moveTo(axX, 0);
  ctx.lineTo(axX, canvas.height);
  ctx.moveTo(0, axY);
  ctx.lineTo(canvas.width, axY);
  ctx.stroke();
  ctx.restore();
}

// ── Geometry drawing ───────────────────────────────────────────────────────

function getGeomColor(geom) {
  if (geom.selected) return getToken("--color-selected");
  if (geom.color) return geom.color;
  return getToken("--color-geometry");
}

function drawLine(geom) {
  const p1 = worldToCanvas(geom.p1.x, geom.p1.y);
  const p2 = worldToCanvas(geom.p2.x, geom.p2.y);

  ctx.save();
  ctx.strokeStyle = getGeomColor(geom);
  ctx.lineWidth = geom.selected ? 2 : 1.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // Draw endpoint dots
  ctx.fillStyle = getGeomColor(geom);
  for (const p of [p1, p2]) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCircle(geom) {
  const c = worldToCanvas(geom.center.x, geom.center.y);
  const edge = worldToCanvas(geom.center.x + geom.radius, geom.center.y);
  const r = edge.x - c.x; // radius in pixels

  if (r < 0.5) return; // too small to see

  ctx.save();
  ctx.strokeStyle = getGeomColor(geom);
  ctx.lineWidth = geom.selected ? 2 : 1.5;
  ctx.beginPath();
  ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
  ctx.stroke();

  // Center cross-hair
  ctx.strokeStyle = getGeomColor(geom);
  ctx.lineWidth = 1;
  const ch = 4; // crosshair size in pixels
  ctx.beginPath();
  ctx.moveTo(c.x - ch, c.y);
  ctx.lineTo(c.x + ch, c.y);
  ctx.moveTo(c.x, c.y - ch);
  ctx.lineTo(c.x, c.y + ch);
  ctx.stroke();
  ctx.restore();
}

function drawArc(geom) {
  const c = worldToCanvas(geom.center.x, geom.center.y);
  const edge = worldToCanvas(geom.center.x + geom.radius, geom.center.y);
  const r = edge.x - c.x;

  if (r < 0.5) return;

  // In canvas space, Y is flipped: angles go clockwise visually.
  // We negate the Y-component of angles to compensate for the Y-flip.
  // Result: arcs in world space appear in the correct visual orientation.
  //
  // World angle θ corresponds to canvas angle -θ
  // (positive X axis stays the same; positive Y world → negative Y canvas)

  ctx.save();
  ctx.strokeStyle = getGeomColor(geom);
  ctx.lineWidth = geom.selected ? 2 : 1.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(
    c.x,
    c.y,
    r,
    -geom.startAngle, // negate for Y-flip
    -geom.endAngle, // negate for Y-flip
    true, // anticlockwise in canvas = counterclockwise in world
  );
  ctx.stroke();

  // Draw arc endpoints
  const { startPoint, endPoint } = geom;
  for (const p of [geom.startPoint(), geom.endPoint()]) {
    const cp = worldToCanvas(p.x, p.y);
    ctx.fillStyle = getGeomColor(geom);
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Dispatch table: type string → draw function
const DRAW_DISPATCH = {
  line: drawLine,
  circle: drawCircle,
  arc: drawArc,
};

function drawGeometry() {
  for (const geom of state.geometry) {
    if (!geom.visible) continue;
    const drawFn = DRAW_DISPATCH[geom.type];
    if (drawFn) {
      drawFn(geom);
    } else {
      console.warn(`Renderer: unknown geometry type: ${geom.type}`);
    }
  }
}

// ── Main render function ───────────────────────────────────────────────────

export function render() {
  ctx.fillStyle = getToken("--color-bg") || "#13131f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawGeometry();
}
```

The **dispatch table** pattern (`DRAW_DISPATCH`) is worth understanding: instead
of a long `if/else if` chain, we use an object where keys are type names and
values are functions. To add a new geometry type (e.g., `rectangle`), we just
add `rectangle: drawRectangle` to the dispatch table and write `drawRectangle`.
Nothing else changes. This is the **Open/Closed Principle**: open for extension,
closed for modification.

---

## Part 11 — The Panel UI Module

The panel UI module wires the HTML form controls in the left panel to the
geometry state.

Create `cam/js/ui/panel.js`:

```js
// panel.js
// Wires the left panel form controls to state.geometry.
// Calls the provided render() callback whenever geometry changes.

import { state } from "../state.js";
import { Line } from "../geometry/Line.js";
import { Circle } from "../geometry/Circle.js";
import { Arc } from "../geometry/Arc.js";
import { Vector2 } from "../math/Vector2.js";

// ── Safe float parser ──────────────────────────────────────────────────────
// Always validate user input. parseFloat('') is NaN. parseFloat('abc') is NaN.
// We return a fallback value instead.
function readFloat(id, fallback = 0) {
  const val = parseFloat(document.getElementById(id)?.value ?? "");
  return isNaN(val) ? fallback : val;
}

// ── Callbacks (set by init) ────────────────────────────────────────────────
let onGeometryChange = () => {};

export function init(renderCallback) {
  onGeometryChange = renderCallback;

  // Wire the "Add Line" button
  document.getElementById("btn-add-line")?.addEventListener("click", addLine);

  // Wire the type selector to show/hide relevant fields
  document
    .getElementById("geom-type")
    ?.addEventListener("change", updateFormVisibility);

  updateFormVisibility();
}

// ── Form visibility ────────────────────────────────────────────────────────
// The form fields shown depend on the selected geometry type.

function updateFormVisibility() {
  const type = document.getElementById("geom-type")?.value ?? "line";

  const lineFields = document.getElementById("line-fields");
  const circleFields = document.getElementById("circle-fields");
  const arcFields = document.getElementById("arc-fields");

  if (lineFields) lineFields.style.display = type === "line" ? "" : "none";
  if (circleFields)
    circleFields.style.display = type === "circle" ? "" : "none";
  if (arcFields) arcFields.style.display = type === "arc" ? "" : "none";

  // Update the button text
  const btn = document.getElementById("btn-add-line");
  if (btn)
    btn.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
}

// ── Add geometry ───────────────────────────────────────────────────────────

function addLine() {
  const type = document.getElementById("geom-type")?.value ?? "line";

  let geom;

  try {
    if (type === "line") {
      const x1 = readFloat("inp-x1");
      const y1 = readFloat("inp-y1");
      const x2 = readFloat("inp-x2");
      const y2 = readFloat("inp-y2");

      // Validation: a line with zero length is not valid geometry
      if (Math.abs(x2 - x1) < 1e-10 && Math.abs(y2 - y1) < 1e-10) {
        alert("A line must have two different endpoints.");
        return;
      }

      geom = new Line(new Vector2(x1, y1), new Vector2(x2, y2));
    } else if (type === "circle") {
      const cx = readFloat("inp-cx");
      const cy = readFloat("inp-cy");
      const r = readFloat("inp-r", 10);

      if (r <= 0) {
        alert("Radius must be greater than zero.");
        return;
      }

      geom = new Circle(new Vector2(cx, cy), r);
    } else if (type === "arc") {
      const cx = readFloat("inp-arc-cx");
      const cy = readFloat("inp-arc-cy");
      const r = readFloat("inp-arc-r", 10);
      const start = readFloat("inp-arc-start", 0) * (Math.PI / 180); // deg→rad
      const end = readFloat("inp-arc-end", 90) * (Math.PI / 180);

      if (r <= 0) {
        alert("Arc radius must be greater than zero.");
        return;
      }

      geom = new Arc(new Vector2(cx, cy), r, start, end);
    }
  } catch (err) {
    // Catch any unexpected errors from geometry constructors
    console.error("Error creating geometry:", err);
    alert(`Could not create geometry: ${err.message}`);
    return;
  }

  if (!geom) return;

  state.geometry.push(geom);
  updateObjectsList();
  onGeometryChange();
}

// ── Objects list ───────────────────────────────────────────────────────────
// The "Objects" panel section shows all geometry objects with delete buttons.

export function updateObjectsList() {
  const container = document.getElementById("section-objects");
  if (!container) return;

  if (state.geometry.length === 0) {
    container.innerHTML = '<p class="panel-empty">Nothing drawn yet.</p>';
    return;
  }

  // Build the list.
  // We use createElement instead of innerHTML for the item rows
  // to avoid XSS if geometry labels ever come from external data.
  const fragment = document.createDocumentFragment();

  for (const geom of state.geometry) {
    const row = document.createElement("div");
    row.className = "geom-item";
    row.dataset.id = String(geom.id);

    // Selected state
    if (geom.selected) row.classList.add("selected");

    // Description text — textContent is safe (no XSS)
    const label = document.createElement("span");
    label.className = "geom-label";
    label.textContent = geom.describe();

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.className = "geom-delete";
    delBtn.textContent = "×";
    delBtn.title = "Delete";
    delBtn.dataset.id = String(geom.id);
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // don't trigger row click
      deleteGeometry(geom.id);
    });

    row.addEventListener("click", () => selectGeometry(geom.id));

    row.appendChild(label);
    row.appendChild(delBtn);
    fragment.appendChild(row);
  }

  // Replace old content with new content.
  // We clear and append instead of innerHTML to preserve any event listeners
  // on the container itself.
  container.textContent = "";
  container.appendChild(fragment);
}

function deleteGeometry(id) {
  const idx = state.geometry.findIndex((g) => g.id === id);
  if (idx !== -1) {
    state.geometry.splice(idx, 1);
    updateObjectsList();
    onGeometryChange();
  }
}

function selectGeometry(id) {
  // Deselect all, then select the clicked one
  for (const g of state.geometry) {
    g.selected = false;
  }
  const target = state.geometry.find((g) => g.id === id);
  if (target) target.selected = true;
  updateObjectsList();
  onGeometryChange();
}
```

---

## Part 12 — The Main Entry Point

`main.js` is the module that wires everything together. It imports all other
modules and connects them.

Create `cam/js/main.js`:

```js
// main.js
// Entry point for the CAM application.
// This module is the only one that touches DOM elements directly for setup.
// It wires together: state, renderer, panel UI, and events.

import { state } from "./state.js";
import {
  init as initRenderer,
  render,
  worldToCanvas,
  canvasToWorld,
} from "./renderer/Renderer2D.js";
import { init as initPanel, updateObjectsList } from "./ui/panel.js";

// ── DOM references ─────────────────────────────────────────────────────────
const canvas = document.getElementById("viewport");
const sbX = document.getElementById("sb-x");
const sbY = document.getElementById("sb-y");
const sbZoom = document.getElementById("sb-zoom");
const sbMsg = document.getElementById("sb-msg");

// ── Initialization ─────────────────────────────────────────────────────────

// Pass the canvas element to the renderer
initRenderer(canvas);

// Pass the render callback to the panel
initPanel(render);

// ── Canvas resize ──────────────────────────────────────────────────────────
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width);
  canvas.height = Math.round(rect.height);
}

resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  render();
});

// ── Mouse utilities ────────────────────────────────────────────────────────
function eventToCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

// ── Pan ────────────────────────────────────────────────────────────────────
let isPanning = false;
let panStart = { x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 1 || e.button === 2) {
    isPanning = true;
    panStart = eventToCanvas(e);
    e.preventDefault();
  }
});

canvas.addEventListener("mousemove", (e) => {
  const cp = eventToCanvas(e);
  const world = canvasToWorld(cp.x, cp.y);
  sbX.textContent = `X: ${world.x.toFixed(3).padStart(9)}`;
  sbY.textContent = `Y: ${world.y.toFixed(3).padStart(9)}`;

  if (isPanning) {
    state.view.panX += cp.x - panStart.x;
    state.view.panY += cp.y - panStart.y;
    panStart = cp;
    render();
  }
});

canvas.addEventListener("mouseleave", () => {
  sbX.textContent = "X:       —";
  sbY.textContent = "Y:       —";
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 1 || e.button === 2) isPanning = false;
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

// ── Zoom ───────────────────────────────────────────────────────────────────
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const cp = eventToCanvas(e);
    const before = canvasToWorld(cp.x, cp.y);
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    state.view.zoom = Math.max(1, Math.min(5000, state.view.zoom * factor));
    const after = worldToCanvas(before.x, before.y);
    state.view.panX += cp.x - after.x;
    state.view.panY += cp.y - after.y;
    sbZoom.textContent = `${(state.view.zoom / 50).toFixed(2)}×`;
    render();
  },
  { passive: false },
);

// ── Keyboard shortcuts ─────────────────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  const tag = document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

  switch (e.key) {
    case "Home":
    case "f":
    case "F":
      state.view.panX = 0;
      state.view.panY = 0;
      state.view.zoom = 50;
      sbZoom.textContent = "1.00×";
      render();
      break;
    case "g":
    case "G":
      state.view.panX = 0;
      state.view.panY = 0;
      render();
      break;
    case "t":
    case "T":
      toggleTheme();
      break;
    case "Delete":
    case "Backspace":
      deleteSelectedGeometry();
      break;
  }
});

// ── Theme ──────────────────────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === "light" ? "dark" : "light";
  render();
}

document.getElementById("btn-theme")?.addEventListener("click", toggleTheme);

// ── Panel ──────────────────────────────────────────────────────────────────
const panelLeft = document.getElementById("panel-left");
const btnTogglePanel = document.getElementById("btn-toggle-panel");

btnTogglePanel?.addEventListener("click", () => {
  panelLeft.classList.toggle("collapsed");
  btnTogglePanel.textContent = panelLeft.classList.contains("collapsed")
    ? "›"
    : "‹";
  resizeCanvas();
  render();
});

// ── Delete selected geometry ───────────────────────────────────────────────
function deleteSelectedGeometry() {
  const before = state.geometry.length;
  // Keep all non-selected geometry
  state.geometry = state.geometry.filter((g) => !g.selected);
  if (state.geometry.length < before) {
    updateObjectsList();
    render();
  }
}

// ── Startup ────────────────────────────────────────────────────────────────
render();
```

---

## Part 13 — The Updated HTML

The `index.html` needs:

1. A `<script type="module" src="js/main.js">` (instead of inline script)
2. Updated panel form to include type selector, and fields for all geometry types

Replace the panel body in `index.html` and the script tag:

The form in the "Add Geometry" section:

```html
<div class="section-body" id="section-add">
  <div class="form-field">
    <label class="form-label">Type</label>
    <select class="form-select" id="geom-type">
      <option value="line">Line</option>
      <option value="circle">Circle</option>
      <option value="arc">Arc</option>
    </select>
  </div>

  <!-- Line fields -->
  <div id="line-fields">
    <div class="form-row">
      <div class="form-field">
        <label class="form-label">X1 (mm)</label>
        <input
          class="form-input"
          type="number"
          id="inp-x1"
          value="0"
          step="1"
        />
      </div>
      <div class="form-field">
        <label class="form-label">Y1 (mm)</label>
        <input
          class="form-input"
          type="number"
          id="inp-y1"
          value="0"
          step="1"
        />
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label class="form-label">X2 (mm)</label>
        <input
          class="form-input"
          type="number"
          id="inp-x2"
          value="50"
          step="1"
        />
      </div>
      <div class="form-field">
        <label class="form-label">Y2 (mm)</label>
        <input
          class="form-input"
          type="number"
          id="inp-y2"
          value="0"
          step="1"
        />
      </div>
    </div>
  </div>

  <!-- Circle fields -->
  <div id="circle-fields" style="display:none">
    <div class="form-row">
      <div class="form-field">
        <label class="form-label">CX (mm)</label>
        <input
          class="form-input"
          type="number"
          id="inp-cx"
          value="0"
          step="1"
        />
      </div>
      <div class="form-field">
        <label class="form-label">CY (mm)</label>
        <input
          class="form-input"
          type="number"
          id="inp-cy"
          value="0"
          step="1"
        />
      </div>
    </div>
    <div class="form-field">
      <label class="form-label">Radius (mm)</label>
      <input
        class="form-input"
        type="number"
        id="inp-r"
        value="20"
        step="1"
        min="0.001"
      />
    </div>
  </div>

  <!-- Arc fields -->
  <div id="arc-fields" style="display:none">
    <div class="form-row">
      <div class="form-field">
        <label class="form-label">CX (mm)</label>
        <input
          class="form-input"
          type="number"
          id="inp-arc-cx"
          value="0"
          step="1"
        />
      </div>
      <div class="form-field">
        <label class="form-label">CY (mm)</label>
        <input
          class="form-input"
          type="number"
          id="inp-arc-cy"
          value="0"
          step="1"
        />
      </div>
    </div>
    <div class="form-field">
      <label class="form-label">Radius (mm)</label>
      <input
        class="form-input"
        type="number"
        id="inp-arc-r"
        value="20"
        step="1"
        min="0.001"
      />
    </div>
    <div class="form-row">
      <div class="form-field">
        <label class="form-label">Start (°)</label>
        <input
          class="form-input"
          type="number"
          id="inp-arc-start"
          value="0"
          step="15"
        />
      </div>
      <div class="form-field">
        <label class="form-label">End (°)</label>
        <input
          class="form-input"
          type="number"
          id="inp-arc-end"
          value="90"
          step="15"
        />
      </div>
    </div>
  </div>

  <button class="btn-primary form-submit" type="button" id="btn-add-line">
    Add Line
  </button>
</div>
```

Add CSS for the objects list:

```css
/* ── Objects list ──────────────────────────────────────────────────────── */

.geom-item {
  display: flex;
  align-items: center;
  padding: 5px 6px;
  border-radius: var(--radius-sm);
  margin-bottom: 2px;
  cursor: pointer;
  transition: background 0.1s;
  gap: 6px;
}

.geom-item:hover {
  background: var(--color-surface-alt);
}

.geom-item.selected {
  background: var(--color-accent-dim);
}

.geom-label {
  flex: 1;
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.geom-item.selected .geom-label {
  color: var(--color-accent);
}

.geom-delete {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  background: transparent;
  border: none;
  color: var(--color-text-faint);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  border-radius: 2px;
  opacity: 0;
  transition:
    opacity 0.1s,
    color 0.1s,
    background 0.1s;
}

.geom-item:hover .geom-delete {
  opacity: 1;
}

.geom-delete:hover {
  color: #ff4455;
  background: rgba(255, 68, 85, 0.15);
}
```

And the script tag at the very end of `<body>`:

```html
<script type="module" src="js/main.js"></script>
```

---

## BUILD 3 — End-to-end test

1. Open `index.html` via Live Server
2. Add a line: leave defaults (0,0)→(50,0), click "Add Line"
   - The line should appear on the canvas at world coordinates
   - The object appears in the Objects list
3. Add a circle: change type to Circle, set CX=25, CY=20, R=15, click
4. Add an arc: type=Arc, CX=0, CY=0, R=30, Start=0, End=90, click
5. Click an item in the Objects list → it highlights orange on canvas
6. Delete an item using the × button → it disappears from canvas and list
7. Press Delete key → removes selected geometry
8. Right-drag to pan, scroll to zoom — geometry stays in world position

---

## Part 14 — Python Parallel: Geometry Classes

```python
# geometry.py
# Python equivalents of the geometry classes.
# Run tests with: python3 geometry.py

import math
from dataclasses import dataclass, field
from typing import Optional, Tuple

# ── Vector2 ────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)  # frozen=True makes it immutable (like Object.freeze)
class Vector2:
    x: float
    y: float

    def add(self, v: 'Vector2') -> 'Vector2':
        return Vector2(self.x + v.x, self.y + v.y)

    def sub(self, v: 'Vector2') -> 'Vector2':
        return Vector2(self.x - v.x, self.y - v.y)

    def scale(self, s: float) -> 'Vector2':
        return Vector2(self.x * s, self.y * s)

    def magnitude(self) -> float:
        return math.sqrt(self.x**2 + self.y**2)

    def normalize(self) -> 'Vector2':
        m = self.magnitude()
        if m < 1e-10:
            return Vector2(0, 0)
        return Vector2(self.x / m, self.y / m)

    def perp(self) -> 'Vector2':
        return Vector2(-self.y, self.x)

    def dot(self, v: 'Vector2') -> float:
        return self.x * v.x + self.y * v.y

    def cross(self, v: 'Vector2') -> float:
        return self.x * v.y - self.y * v.x

    def distance_to(self, v: 'Vector2') -> float:
        return self.sub(v).magnitude()

    def lerp(self, v: 'Vector2', t: float) -> 'Vector2':
        return Vector2(
            self.x + (v.x - self.x) * t,
            self.y + (v.y - self.y) * t,
        )

    def angle(self) -> float:
        return math.atan2(self.y, self.x)

    @classmethod
    def from_angle(cls, radians: float) -> 'Vector2':
        return cls(math.cos(radians), math.sin(radians))


# ── Geometry base ──────────────────────────────────────────────────────────────

class Geometry:
    _id_counter = 1

    def __init__(self, geom_type: str):
        self.id       = Geometry._id_counter
        Geometry._id_counter += 1
        self.type     = geom_type
        self.selected = False
        self.visible  = True
        self.label    = ''
        self.color: Optional[str] = None

    def get_bounding_box(self) -> dict:
        raise NotImplementedError(f'{self.type}.get_bounding_box() not implemented')

    def to_json(self) -> dict:
        raise NotImplementedError(f'{self.type}.to_json() not implemented')

    def describe(self) -> str:
        return f'{self.type} #{self.id}'


# ── Line ───────────────────────────────────────────────────────────────────────

class Line(Geometry):
    def __init__(self, p1: Vector2, p2: Vector2):
        super().__init__('line')
        self.p1 = p1
        self.p2 = p2

    def midpoint(self) -> Vector2:
        return self.p1.lerp(self.p2, 0.5)

    def length(self) -> float:
        return self.p1.distance_to(self.p2)

    def direction(self) -> Vector2:
        return self.p2.sub(self.p1).normalize()

    def get_bounding_box(self) -> dict:
        return {
            'minX': min(self.p1.x, self.p2.x),
            'minY': min(self.p1.y, self.p2.y),
            'maxX': max(self.p1.x, self.p2.x),
            'maxY': max(self.p1.y, self.p2.y),
        }

    def describe(self) -> str:
        return (f'Line #{self.id}: '
                f'({self.p1.x:.2f}, {self.p1.y:.2f}) → '
                f'({self.p2.x:.2f}, {self.p2.y:.2f})')


# ── Circle ─────────────────────────────────────────────────────────────────────

class Circle(Geometry):
    def __init__(self, center: Vector2, radius: float):
        if radius <= 0:
            raise ValueError(f'Circle radius must be positive, got {radius}')
        super().__init__('circle')
        self.center = center
        self.radius = radius

    def area(self) -> float:
        return math.pi * self.radius ** 2

    def contains_point(self, p: Vector2) -> bool:
        return self.center.distance_to(p) <= self.radius

    def point_at_angle(self, radians: float) -> Vector2:
        return Vector2(
            self.center.x + self.radius * math.cos(radians),
            self.center.y + self.radius * math.sin(radians),
        )

    def get_bounding_box(self) -> dict:
        return {
            'minX': self.center.x - self.radius,
            'minY': self.center.y - self.radius,
            'maxX': self.center.x + self.radius,
            'maxY': self.center.y + self.radius,
        }

    def describe(self) -> str:
        return (f'Circle #{self.id}: '
                f'center ({self.center.x:.2f}, {self.center.y:.2f}), '
                f'r={self.radius:.2f}')


# ── Tests ──────────────────────────────────────────────────────────────────────

def run_tests():
    # Vector2
    a = Vector2(3, 4)
    assert abs(a.magnitude() - 5) < 1e-10, 'magnitude 3-4-5'

    n = a.normalize()
    assert abs(n.magnitude() - 1) < 1e-10, 'normalized length = 1'

    x = Vector2(1, 0)
    y = Vector2(0, 1)
    assert x.dot(y) == 0, 'perpendicular dot = 0'

    mid = Vector2(0, 0).lerp(Vector2(10, 20), 0.5)
    assert mid.x == 5 and mid.y == 10, 'lerp midpoint'

    # Line
    line = Line(Vector2(0, 0), Vector2(3, 4))
    assert abs(line.length() - 5) < 1e-10, 'line length'
    mp = line.midpoint()
    assert mp.x == 1.5 and mp.y == 2, 'line midpoint'

    # Circle
    c = Circle(Vector2(5, 5), 10)
    assert abs(c.area() - math.pi * 100) < 1e-10, 'circle area'
    assert c.contains_point(Vector2(5, 5)), 'center inside circle'
    assert not c.contains_point(Vector2(20, 5)), 'far point outside circle'

    print('All Python geometry tests passed!')


if __name__ == '__main__':
    run_tests()
```

---

## Part 15 — C++ Track: Week 3

This week: structs with member functions. Getting from C-style structs to
C++ classes.

```cpp
// vector2.cpp
// A minimal 2D vector struct in C++.
// Compile: g++ -std=c++17 -Wall vector2.cpp -o vector2
// Run:     ./vector2

#include <iostream>
#include <cmath>    // std::sqrt, std::atan2

struct Vector2 {
    double x;
    double y;

    // Member functions
    Vector2 add(Vector2 v) const {
        return { x + v.x, y + v.y };  // aggregate initialization of struct
    }

    Vector2 sub(Vector2 v) const {
        return { x - v.x, y - v.y };
    }

    Vector2 scale(double s) const {
        return { x * s, y * s };
    }

    double magnitude() const {
        return std::sqrt(x * x + y * y);
    }

    Vector2 normalize() const {
        double m = magnitude();
        if (m < 1e-10) return { 0, 0 };
        return { x / m, y / m };
    }

    double dot(Vector2 v) const {
        return x * v.x + y * v.y;
    }

    double distanceTo(Vector2 v) const {
        return sub(v).magnitude();
    }

    void print() const {
        std::cout << "(" << x << ", " << y << ")\n";
    }
};

int main() {
    Vector2 a = { 3, 4 };
    Vector2 b = { 1, 2 };

    // Magnitude: 3-4-5 right triangle
    double len = a.magnitude();
    std::cout << "Magnitude of (3,4): " << len << "\n";  // expect 5

    // Dot product
    Vector2 xAxis = { 1, 0 };
    Vector2 yAxis = { 0, 1 };
    std::cout << "Dot x·y: " << xAxis.dot(yAxis) << "\n";  // expect 0

    // Normalize
    Vector2 n = a.normalize();
    std::cout << "Normalized magnitude: " << n.magnitude() << "\n";  // expect ~1

    std::cout << "Done.\n";
    return 0;
}
```

**Key concepts:**

`const` after member function declaration — this tells the compiler the function
does not modify any member variables. This allows calling it on `const` objects
and is good practice for any function that only reads data. The compiler enforces
it.

`{ x + v.x, y + v.y }` — **aggregate initialization**. Because `Vector2` is a
simple struct (no private members, no user-defined constructors beyond the
default), you can initialize it with a brace-enclosed initializer list in order.

`void print() const` — `void` return type means the function returns nothing.
The equivalent of JavaScript `return undefined` implicitly.

---

## What You Have After Lab 03

```
cam/
  index.html
  js/
    state.js
    main.js
    math/
      Vector2.js
    geometry/
      Geometry.js
      Line.js
      Circle.js
      Arc.js
    renderer/
      Renderer2D.js
    ui/
      panel.js
  test-geometry.html     (temporary test file)
```

```
python/
  geometry.py     (Vector2 + Line + Circle + geometry tests)
```

**Working features:**

- Full module system (ES modules, no global pollution)
- Vector2 with complete math operations
- Line, Circle, Arc geometry classes with bounding boxes and JSON serialization
- Left panel with dynamic form: choose type, fill in fields, click Add
- Objects list: all geometry shown with labels
- Click to select (highlights orange on canvas)
- Delete button per object
- Delete/Backspace key removes selected
- Pan, zoom, theme toggle all unchanged from Lab 02

---

## DIVERGE POINTS

**1. Rectangle geometry:** A rectangle is not in the current set. You could add
a `Rectangle` class with `topLeft`, `width`, `height`, or with two corner
points. The renderer would need a `drawRectangle` entry in the dispatch table.
This is a good exercise in extending the system.

**2. Polylines:** A polyline is an ordered list of points connected by line
segments. It is not a `Line` (which is one segment) — it is a new type. A
`Polyline` class would have `points: Vector2[]` and its render function would
call `ctx.moveTo` then `ctx.lineTo` for each point.

**3. Canvas click-to-draw:** Instead of typing coordinates in the form, you
could click the canvas to set points. The mouse `click` event in `main.js`
would, depending on the current mode, either start or finish a geometry object.
This is the Lab 04 topic.

**4. Undo/redo:** Currently deleting geometry is permanent. Adding undo/redo
requires a Command pattern (Lab 04) where each action (add, delete, modify) is
an object that knows how to do and undo itself. The history is stored as a stack.

---

_Continue to [Lab 04 — Interaction](LAB-04-INTERACTION.md)._
