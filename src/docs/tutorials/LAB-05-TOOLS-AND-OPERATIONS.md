# Lab 05 — Tools and Operations

### CAM System Masterclass

---

## What You Will Build

By the end of this lab, the app has a suite of **transformation operations**:

- **Offset** — move a geometry inward or outward by a distance
- **Mirror** — reflect geometry across the X or Y axis (or a custom line)
- **Array** — create linear or polar copies of geometry
- **Trim/Extend** — shorten or lengthen lines to a boundary

You will also learn:

- How to structure operations as distinct from tools (operations transform
  existing geometry, tools create new geometry)
- How to apply operations through the existing Command system so every
  operation is automatically undoable
- The mathematics of offsets, reflection, and rotation

**Time:** 4–6 hours.

---

## Part 1 — Operations vs Tools: the Conceptual Difference

A **tool** interacts with the canvas to create new geometry from scratch (you
click on empty space). An **operation** takes existing selected geometry and
produces new or modified geometry from it (you select first, then trigger the
operation).

| Tool                     | Operation                                     |
| ------------------------ | --------------------------------------------- |
| Needs canvas interaction | Needs selected geometry                       |
| Creates geometry         | Creates derived geometry or modifies existing |
| Driven by mouse events   | Driven by panel form or shortcut              |
| Lives in `tools/`        | Lives in `operations/`                        |

Both tools and operations produce **Commands**. That's what keeps everything
undoable uniformly.

---

## Part 2 — The Operation Interface

Operations are simpler than tools: they take a geometry object (or set of
objects) and some parameters, and return a new geometry object.

Create `cam/js/operations/Operation.js`:

```js
// Operation.js
// An operation is a pure function: geometry + params → new geometry (or null).
// Operations do NOT modify the input geometry — they return new objects.
// The caller wraps the result in an AddGeometryCommand.

export class Operation {
  constructor(name) {
    this.name = name;
  }

  // Apply the operation. Returns new geometry object(s) or null if invalid.
  // geom: the source geometry object
  // params: operation-specific parameters
  apply(geom, params) {
    throw new Error(`${this.name}.apply() not implemented`);
  }
}
```

---

## Part 3 — Offset Operation

### What offset means

An **offset** moves every point of a geometry object by a fixed distance
perpendicular to the geometry. For:

- **A line**: the offset line is parallel to the original, separated by
  `distance` mm
- **A circle**: the offset circle has radius `radius ± distance`
- **An arc**: the offset arc has the same center, radius `± distance`, same angles

The direction (inward or outward) depends on the sign of `distance`.

### Line offset math

Given a line from $A$ to $B$, the offset direction is the unit normal:

$n = \text{normalize}(B - A).\text{perp}()$

The offset line goes from $A + d \cdot n$ to $B + d \cdot n$ (where $d$ is
the offset distance). This is a pure translation perpendicular to the line.

Create `cam/js/operations/OffsetOperation.js`:

```js
// OffsetOperation.js
// Offset a geometry object by a perpendicular distance.

import { Operation } from "./Operation.js";
import { Vector2 } from "../math/Vector2.js";
import { Line } from "../geometry/Line.js";
import { Circle } from "../geometry/Circle.js";
import { Arc } from "../geometry/Arc.js";

export class OffsetOperation extends Operation {
  constructor() {
    super("offset");
  }

  // params: { distance: number (mm, positive = left/outward, negative = right/inward) }
  apply(geom, { distance }) {
    if (typeof distance !== "number" || isNaN(distance)) return null;
    if (Math.abs(distance) < 1e-10) return null; // zero offset → no change

    if (geom.type === "line") {
      return this._offsetLine(geom, distance);
    }
    if (geom.type === "circle") {
      return this._offsetCircle(geom, distance);
    }
    if (geom.type === "arc") {
      return this._offsetArc(geom, distance);
    }

    console.warn(`OffsetOperation: unsupported type "${geom.type}"`);
    return null;
  }

  _offsetLine(line, d) {
    // 1. Compute the unit direction vector along the line
    const dir = line.p2.sub(line.p1).normalize();

    // 2. The perpendicular (90° counterclockwise of direction)
    //    perp() returns (-y, x) — left side of travel direction
    const normal = dir.perp();

    // 3. Translate both endpoints by d × normal
    const offset = normal.scale(d);
    const newP1 = line.p1.add(offset);
    const newP2 = line.p2.add(offset);

    return new Line(newP1, newP2);
  }

  _offsetCircle(circle, d) {
    // Offset a circle: just change the radius.
    // Positive d = larger circle (offset outward from center)
    const newRadius = circle.radius + d;
    if (newRadius <= 0) {
      console.warn(
        "OffsetOperation: offset would produce zero or negative radius",
      );
      return null;
    }
    return new Circle(circle.center, newRadius);
  }

  _offsetArc(arc, d) {
    // Same as circle: change radius, keep center and angles.
    const newRadius = arc.radius + d;
    if (newRadius <= 0) {
      console.warn(
        "OffsetOperation: offset would produce zero or negative radius",
      );
      return null;
    }
    return new Arc(arc.center, newRadius, arc.startAngle, arc.endAngle);
  }
}
```

### Why `perp()` gives the "left" side

When walking from $A$ to $B$, "left" is 90° counterclockwise from the travel
direction. `perp()` is defined as $(-y, x)$ which IS a 90° counterclockwise
rotation. So for positive `d`, the offset line is to the left of the original
line when walking from P1 to P2. Negative `d` offsets to the right.

---

## Part 4 — Mirror Operation

### Reflection math

To reflect a point $P$ across a **line passing through the origin** in direction $d$:

$P' = 2(P \cdot d)d - P$

This is the reflection formula. It decomposes $P$ into its component along $d$
(kept) and perpendicular to $d$ (flipped).

For reflection across **the X axis**: direction $d = (1, 0)$. So $P' = (P.x, -P.y)$.

For reflection across **the Y axis**: direction $d = (0, 1)$. So $P' = (-P.x, P.y)$.

For reflection across **an arbitrary line through origin** at angle $\theta$:
$d = (\cos\theta, \sin\theta)$.

Create `cam/js/operations/MirrorOperation.js`:

```js
// MirrorOperation.js
// Reflect geometry across an axis.

import { Operation } from "./Operation.js";
import { Vector2 } from "../math/Vector2.js";
import { Line } from "../geometry/Line.js";
import { Circle } from "../geometry/Circle.js";
import { Arc } from "../geometry/Arc.js";

export class MirrorOperation extends Operation {
  constructor() {
    super("mirror");
  }

  // params: {
  //   axis: 'x' | 'y' | 'line',
  //   angle: number (radians, used when axis === 'line', default 0)
  //   origin: Vector2 (the line passes through this point, default (0,0))
  // }
  apply(geom, { axis = "x", angle = 0, origin = null }) {
    // Default origin: world origin
    const o = origin ?? new Vector2(0, 0);

    // Compute the reflection direction vector
    let dir;
    if (axis === "x")
      dir = new Vector2(1, 0); // reflect across X axis
    else if (axis === "y")
      dir = new Vector2(0, 1); // reflect across Y axis
    else dir = Vector2.fromAngle(angle); // custom angle

    const reflect = (pt) => this._reflectPoint(pt, o, dir);

    if (geom.type === "line") {
      return new Line(reflect(geom.p1), reflect(geom.p2));
    }

    if (geom.type === "circle") {
      return new Circle(reflect(geom.center), geom.radius);
    }

    if (geom.type === "arc") {
      // Reflecting an arc: the center reflects normally. The angles flip.
      // When we reflect across the X axis, a counterclockwise arc becomes
      // a clockwise arc (because Y is negated). We represent this by swapping
      // and negating the angles.
      const newCenter = reflect(geom.center);

      // Flip and negate angles for X/Y reflection
      // For a general reflection, the angle transforms as:
      //   new angle = 2 * axis_angle - old_angle
      // where axis_angle is the angle of the mirror line.
      const axisAngle = dir.angle();
      const newStart = 2 * axisAngle - geom.endAngle;
      const newEnd = 2 * axisAngle - geom.startAngle;

      return new Arc(newCenter, geom.radius, newStart, newEnd);
    }

    return null;
  }

  // Reflect point P across a line through origin O in direction D.
  _reflectPoint(p, o, d) {
    // Translate so the line passes through the origin
    const v = p.sub(o);

    // Reflect: P' = 2(P·d)d - P
    const dot2 = d.dot(v) * 2;
    const reflected = new Vector2(dot2 * d.x - v.x, dot2 * d.y - v.y);

    // Translate back
    return reflected.add(o);
  }
}
```

---

## Part 5 — Array (Copy) Operation

### Types of arrays

A **linear array** repeats geometry $N$ times along a direction vector:
each copy is offset by a fixed `(dx, dy)` from the previous one.

A **polar array** repeats geometry $N$ times around a center point:
each copy is rotated by $360° / N$ from the previous.

### Rotation math

Rotating a point $P$ by angle $\theta$ around the origin:

$x' = x \cos\theta - y \sin\theta$
$y' = x \sin\theta + y \cos\theta$

This is the 2D rotation matrix. For rotation around a center $C$:

1. Translate so $C$ is at origin: $v = P - C$
2. Rotate: $v' = $ rotation of $v$
3. Translate back: $P' = v' + C$

Create `cam/js/operations/ArrayOperation.js`:

```js
// ArrayOperation.js
// Create linear or polar arrays of geometry.

import { Operation } from "./Operation.js";
import { Vector2 } from "../math/Vector2.js";
import { Line } from "../geometry/Line.js";
import { Circle } from "../geometry/Circle.js";
import { Arc } from "../geometry/Arc.js";

export class ArrayOperation extends Operation {
  constructor() {
    super("array");
  }

  // Returns an array of geometry objects (not just one).
  // params for linear: { type: 'linear', count, dx, dy }
  // params for polar:  { type: 'polar',  count, cx, cy, includeOriginal: bool }
  apply(geom, params) {
    if (params.type === "linear") {
      return this._linearArray(geom, params);
    }
    if (params.type === "polar") {
      return this._polarArray(geom, params);
    }
    return null;
  }

  _linearArray(geom, { count, dx, dy }) {
    count = Math.max(1, Math.round(count));
    const results = [];

    for (let i = 1; i <= count; i++) {
      const offset = new Vector2(dx * i, dy * i);
      results.push(this._translateGeom(geom, offset));
    }

    return results;
  }

  _polarArray(geom, { count, cx, cy, includeOriginal = false }) {
    count = Math.max(2, Math.round(count));
    const center = new Vector2(cx, cy);
    const results = [];

    const start = includeOriginal ? 0 : 1;
    for (let i = start; i < count; i++) {
      const angle = ((2 * Math.PI) / count) * i;
      results.push(this._rotateGeom(geom, center, angle));
    }

    return results;
  }

  // ── Geometry transforms ───────────────────────────────────────────────────

  _translateGeom(geom, offset) {
    if (geom.type === "line") {
      return new Line(geom.p1.add(offset), geom.p2.add(offset));
    }
    if (geom.type === "circle") {
      return new Circle(geom.center.add(offset), geom.radius);
    }
    if (geom.type === "arc") {
      return new Arc(
        geom.center.add(offset),
        geom.radius,
        geom.startAngle,
        geom.endAngle,
      );
    }
    return null;
  }

  _rotateGeom(geom, center, angle) {
    const rotPt = (p) => this._rotatePoint(p, center, angle);

    if (geom.type === "line") {
      return new Line(rotPt(geom.p1), rotPt(geom.p2));
    }
    if (geom.type === "circle") {
      return new Circle(rotPt(geom.center), geom.radius);
    }
    if (geom.type === "arc") {
      return new Arc(
        rotPt(geom.center),
        geom.radius,
        geom.startAngle + angle,
        geom.endAngle + angle,
      );
    }
    return null;
  }

  _rotatePoint(p, center, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const v = p.sub(center);
    return new Vector2(cos * v.x - sin * v.y, sin * v.x + cos * v.y).add(
      center,
    );
  }
}
```

---

## Part 6 — Trim and Extend

Trim and extend are fundamental CAD operations. They modify existing geometry
to meet a boundary rather than creating new objects. This means they use the
`MoveGeometryCommand` from Lab 04.

### Intersection: where two infinite lines meet

Given line segment $AB$ (treated as infinite for trim purposes) and line
segment $CD$:

Find $t$ and $u$ such that:
$A + t(B - A) = C + u(D - C)$

Solving:
$r = B - A$, $s = D - C$

$t = \frac{(C - A) \times s}{r \times s}$
$u = \frac{(C - A) \times r}{r \times s}$

Where $r \times s$ is the 2D cross product ($r.x \cdot s.y - r.y \cdot s.x$).

If $r \times s = 0$, the lines are parallel (no intersection). Otherwise the
intersection point is $A + t \cdot r$.

Create `cam/js/operations/TrimExtendOperation.js`:

```js
// TrimExtendOperation.js
// Trim a line to a boundary geometry, or extend a line to meet a boundary.

import { Operation } from "./Operation.js";
import { Vector2 } from "../math/Vector2.js";
import { Line } from "../geometry/Line.js";

export class TrimExtendOperation extends Operation {
  constructor() {
    super("trim-extend");
  }

  // Find the intersection of two lines (infinite).
  // Returns { point: Vector2, t: number, u: number } or null (parallel).
  // t is the parametric position on line A (0=start, 1=end, can exceed [0,1]).
  // u is the parametric position on line B.
  _lineLineIntersection(a1, a2, b1, b2) {
    const r = a2.sub(a1);
    const s = b2.sub(b1);

    const rxs = r.cross(s);
    if (Math.abs(rxs) < 1e-10) return null; // parallel

    const t = b1.sub(a1).cross(s) / rxs;
    const u = b1.sub(a1).cross(r) / rxs;

    return {
      point: a1.add(r.scale(t)),
      t,
      u,
    };
  }

  // Trim lineA to where it meets boundary (another line).
  // Shortens the END of lineA to the intersection point.
  // Returns new Line, or null if no intersection.
  trim(lineA, boundary, trimEnd = "p2") {
    const result = this._lineLineIntersection(
      lineA.p1,
      lineA.p2,
      boundary.p1,
      boundary.p2,
    );
    if (!result) return null;

    const { point, t, u } = result;

    // Only trim if the intersection is on the boundary line (u in [0,1])
    if (u < -1e-6 || u > 1 + 1e-6) return null;

    if (trimEnd === "p2") {
      return new Line(lineA.p1, point);
    } else {
      return new Line(point, lineA.p2);
    }
  }

  // Extend lineA to where it would meet boundary (infinite extension).
  // Returns new Line, or null if no solution.
  extend(lineA, boundary, extendEnd = "p2") {
    const result = this._lineLineIntersection(
      lineA.p1,
      lineA.p2,
      boundary.p1,
      boundary.p2,
    );
    if (!result) return null;

    // For extension, t can be outside [0,1] — that's the whole point.
    // But we only extend in the correct direction.
    if (extendEnd === "p2" && result.t < 1) return null; // intersection is behind p2
    if (extendEnd === "p1" && result.t > 0) return null; // intersection is ahead of p1

    if (extendEnd === "p2") {
      return new Line(lineA.p1, result.point);
    } else {
      return new Line(result.point, lineA.p2);
    }
  }
}
```

### Visual demo — what trim does

```
Before:
────────────────────          ←── lineA (too long)
            │
            │  ←── boundary
            │

After (trim p2 to boundary):
────────────                  ←── lineA shortened to boundary
            │
            │
            │
```

---

## Part 7 — Operations Panel UI

Now wire the operations into the panel. Create a new panel section "Operations"
with dropdowns for each operation type.

Update the HTML to add an Operations section in the left panel:

```html
<details open>
  <summary class="section-header">Operations</summary>
  <div class="section-body" id="section-operations">
    <div class="form-field">
      <label class="form-label">Operation</label>
      <select class="form-select" id="op-type">
        <option value="offset">Offset</option>
        <option value="mirror">Mirror</option>
        <option value="array-linear">Array (Linear)</option>
        <option value="array-polar">Array (Polar)</option>
      </select>
    </div>

    <!-- Offset params -->
    <div id="op-offset-params">
      <div class="form-field">
        <label class="form-label">Distance (mm)</label>
        <input
          class="form-input"
          type="number"
          id="op-offset-dist"
          value="5"
          step="0.5"
        />
      </div>
    </div>

    <!-- Mirror params -->
    <div id="op-mirror-params" style="display:none">
      <div class="form-field">
        <label class="form-label">Axis</label>
        <select class="form-select" id="op-mirror-axis">
          <option value="x">X axis</option>
          <option value="y">Y axis</option>
        </select>
      </div>
    </div>

    <!-- Array Linear params -->
    <div id="op-array-linear-params" style="display:none">
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Count</label>
          <input
            class="form-input"
            type="number"
            id="op-lin-count"
            value="3"
            min="1"
            step="1"
          />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">dX (mm)</label>
          <input
            class="form-input"
            type="number"
            id="op-lin-dx"
            value="20"
            step="1"
          />
        </div>
        <div class="form-field">
          <label class="form-label">dY (mm)</label>
          <input
            class="form-input"
            type="number"
            id="op-lin-dy"
            value="0"
            step="1"
          />
        </div>
      </div>
    </div>

    <!-- Array Polar params -->
    <div id="op-array-polar-params" style="display:none">
      <div class="form-field">
        <label class="form-label">Count</label>
        <input
          class="form-input"
          type="number"
          id="op-pol-count"
          value="6"
          min="2"
          step="1"
        />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Center X</label>
          <input
            class="form-input"
            type="number"
            id="op-pol-cx"
            value="0"
            step="1"
          />
        </div>
        <div class="form-field">
          <label class="form-label">Center Y</label>
          <input
            class="form-input"
            type="number"
            id="op-pol-cy"
            value="0"
            step="1"
          />
        </div>
      </div>
    </div>

    <button class="btn-primary form-submit" type="button" id="btn-apply-op">
      Apply to Selected
    </button>
    <div id="op-status" class="panel-empty"></div>
  </div>
</details>
```

---

## Part 8 — Operations Panel JavaScript

Create `cam/js/ui/operations-panel.js`:

```js
// operations-panel.js
// Wires the Operations panel to the operation classes.

import { state } from "../state.js";
import { OffsetOperation } from "../operations/OffsetOperation.js";
import { MirrorOperation } from "../operations/MirrorOperation.js";
import { ArrayOperation } from "../operations/ArrayOperation.js";
import { AddGeometryCommand } from "../history/Command.js";
import { Vector2 } from "../math/Vector2.js";

// Safe float parser
function readFloat(id, fallback = 0) {
  const val = parseFloat(document.getElementById(id)?.value ?? "");
  return isNaN(val) ? fallback : val;
}

function readInt(id, fallback = 1) {
  const val = parseInt(document.getElementById(id)?.value ?? "", 10);
  return isNaN(val) ? fallback : val;
}

// Operation singletons
const offset = new OffsetOperation();
const mirror = new MirrorOperation();
const array = new ArrayOperation();

// onCommit: (command) => void — provided by main.js
let onCommit = () => {};

export function init(commitCallback) {
  onCommit = commitCallback;

  document
    .getElementById("op-type")
    ?.addEventListener("change", updateParamVisibility);
  document
    .getElementById("btn-apply-op")
    ?.addEventListener("click", applyOperation);

  updateParamVisibility();
}

function updateParamVisibility() {
  const opType = document.getElementById("op-type")?.value ?? "offset";
  const sections = ["offset", "mirror", "array-linear", "array-polar"];

  for (const s of sections) {
    const el = document.getElementById(`op-${s}-params`);
    if (el) el.style.display = s === opType ? "" : "none";
  }
}

function setStatus(msg, isError = false) {
  const el = document.getElementById("op-status");
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "#ff4455" : "";
}

function applyOperation() {
  const selected = state.geometry.filter((g) => g.selected);

  if (selected.length === 0) {
    setStatus("Select geometry first.", true);
    return;
  }

  const opType = document.getElementById("op-type")?.value ?? "offset";
  const results = [];

  for (const geom of selected) {
    let newGeoms = null;

    if (opType === "offset") {
      const dist = readFloat("op-offset-dist", 5);
      const result = offset.apply(geom, { distance: dist });
      if (result) newGeoms = [result];
    } else if (opType === "mirror") {
      const axis = document.getElementById("op-mirror-axis")?.value ?? "x";
      const result = mirror.apply(geom, { axis });
      if (result) newGeoms = [result];
    } else if (opType === "array-linear") {
      const count = readInt("op-lin-count", 3);
      const dx = readFloat("op-lin-dx", 20);
      const dy = readFloat("op-lin-dy", 0);
      newGeoms = array.apply(geom, { type: "linear", count, dx, dy });
    } else if (opType === "array-polar") {
      const count = readInt("op-pol-count", 6);
      const cx = readFloat("op-pol-cx", 0);
      const cy = readFloat("op-pol-cy", 0);
      newGeoms = array.apply(geom, { type: "polar", count, cx, cy });
    }

    if (newGeoms) results.push(...newGeoms);
  }

  if (results.length === 0) {
    setStatus("Operation produced no result.", true);
    return;
  }

  // Wrap all new geometry in a single AddGeometryCommand per object.
  // We execute them all through the history so they're all undoable.
  // Wrapping multiple adds in one undo step requires a CompositeCommand
  // (see DIVERGE POINTS).
  for (const g of results) {
    onCommit(new AddGeometryCommand(g));
  }

  setStatus(`Added ${results.length} object(s).`);
}
```

Add to `main.js`:

```js
import { init as initOperationsPanel } from "./ui/operations-panel.js";

// After initPanel:
initOperationsPanel(commitCommand);
```

---

## BUILD 1 — Testing Operations

1. Draw a line from (−30, 0) to (30, 0) by clicking on the canvas
2. Click the line to select it
3. Operations panel → Offset → Distance 10 → Apply to Selected
   - A new line appears 10mm above the original
4. Undo (Ctrl+Z) — the offset line disappears
5. Select the original line again
6. Mirror → Axis: Y axis → Apply
   - A mirrored copy appears (for a horizontal line, mirroring across Y axis
     puts it on the opposite side of the Y axis)
7. Array (Linear) → Count 3, dX 40, dY 0 → Apply
   - Three copies of the selected line appear at +40, +80, +120 offset
8. Draw a circle, select it, Polar array, Count 6, Center 0,0
   - Six copies appear arranged in a circle around the origin

---

## Part 9 — Save/Load to JSON

Now that geometry has `toJSON()` / `fromJSON()`, we can persist the drawing to
the browser's `localStorage` or download it as a file.

Add to `cam/js/ui/file-operations.js`:

```js
// file-operations.js
// Save geometry to JSON and load it back.

import { state } from "../state.js";
import { Line } from "../geometry/Line.js";
import { Circle } from "../geometry/Circle.js";
import { Arc } from "../geometry/Arc.js";
import { history } from "../history/History.js";

// ── Serialize ──────────────────────────────────────────────────────────────
export function saveToJSON() {
  return JSON.stringify(
    {
      version: 1,
      geometry: state.geometry.map((g) => g.toJSON()),
      view: { ...state.view },
    },
    null,
    2,
  );
}

// ── Deserialize ────────────────────────────────────────────────────────────
const TYPE_MAP = {
  line: Line.fromJSON,
  circle: Circle.fromJSON,
  arc: Arc.fromJSON,
};

export function loadFromJSON(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }

  if (!data.geometry || !Array.isArray(data.geometry)) {
    throw new Error("Invalid file: missing geometry array");
  }

  const loaded = [];
  for (const item of data.geometry) {
    const factory = TYPE_MAP[item.type];
    if (!factory) {
      console.warn(`loadFromJSON: unknown type "${item.type}", skipping`);
      continue;
    }
    // fromJSON is a static method on each class
    loaded.push(factory(item));
  }

  return { geometry: loaded, view: data.view };
}

// ── localStorage persistence ───────────────────────────────────────────────
const STORAGE_KEY = "cam-autosave";

export function autoSave() {
  try {
    localStorage.setItem(STORAGE_KEY, saveToJSON());
  } catch (e) {
    // localStorage can throw if storage is full or in private browsing mode.
    // Silently ignore — auto-save is a convenience, not critical.
    console.warn("AutoSave failed:", e.message);
  }
}

export function autoLoad() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return loadFromJSON(saved);
  } catch (e) {
    console.warn("AutoLoad failed:", e.message);
    return null;
  }
}

// ── File download ──────────────────────────────────────────────────────────
export function downloadFile() {
  const json = saveToJSON();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `cam-drawing-${Date.now()}.json`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Release the object URL after a moment
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── File upload ────────────────────────────────────────────────────────────
// Returns a Promise<string> that resolves with the file content.
export function promptOpenFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      document.body.removeChild(input);

      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      // Security: we only accept JSON. We never execute the file content.
      // FileReader.readAsText gives us a plain string, not evaluated code.
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsText(file);
    });

    input.click();
  });
}
```

### Security note on file loading

The loaded JSON is passed through `JSON.parse()`, which is safe — it produces
data structures, never executes code. The type-dispatch uses `TYPE_MAP` (a
whitelist of known types), so an attacker cannot inject arbitrary code through
a crafted JSON file. Always deserialize through a whitelist.

Wire into `main.js`:

```js
import {
  autoSave,
  autoLoad,
  downloadFile,
  promptOpenFile,
  loadFromJSON,
} from "./ui/file-operations.js";

// Auto-load on startup
const saved = autoLoad();
if (saved) {
  state.geometry = saved.geometry;
  if (saved.view) Object.assign(state.view, saved.view);
}

// Auto-save whenever geometry changes (inside commitCommand):
function commitCommand(cmd) {
  history.execute(cmd);
  autoSave();
  updateObjectsList();
  render();
}

// Wire Save/Open buttons (add to toolbar HTML)
document.getElementById("btn-save")?.addEventListener("click", downloadFile);
document.getElementById("btn-open")?.addEventListener("click", async () => {
  try {
    const json = await promptOpenFile();
    const loaded = loadFromJSON(json);
    state.geometry = loaded.geometry;
    if (loaded.view) Object.assign(state.view, loaded.view);
    history.clear();
    updateObjectsList();
    render();
  } catch (e) {
    alert(`Could not open file: ${e.message}`);
  }
});
```

Add to toolbar HTML:

```html
<div class="tg tg-right">
  <button
    class="btn-tool"
    id="btn-open"
    data-tooltip="Open (Ctrl+O)"
    title="Open"
  >
    📂
  </button>
  <button
    class="btn-tool"
    id="btn-save"
    data-tooltip="Save (Ctrl+S)"
    title="Save"
  >
    💾
  </button>
</div>
```

---

## Part 10 — Python Parallel: Operations

```python
# operations.py
# Python implementations of the geometric operations.
# Run: python3 operations.py

import math
from geometry import Vector2, Line, Circle, Arc


# ── Offset ─────────────────────────────────────────────────────────────────────

def offset_geometry(geom, distance):
    """Offset a geometry object by a perpendicular distance."""
    if isinstance(geom, Line):
        direction = geom.p2.sub(geom.p1).normalize()
        normal    = direction.perp()
        off       = normal.scale(distance)
        return Line(geom.p1.add(off), geom.p2.add(off))

    elif isinstance(geom, Circle):
        new_r = geom.radius + distance
        if new_r <= 0:
            raise ValueError('Offset would produce zero or negative radius')
        return Circle(geom.center, new_r)

    return None


# ── Mirror ─────────────────────────────────────────────────────────────────────

def reflect_point(p: Vector2, origin: Vector2, direction: Vector2) -> Vector2:
    """Reflect point p across a line through origin in direction."""
    v   = p.sub(origin)
    dot = direction.dot(v)
    reflected = Vector2(dot * 2 * direction.x - v.x,
                        dot * 2 * direction.y - v.y)
    return reflected.add(origin)

def mirror_geometry(geom, axis='x', origin=None):
    origin = origin or Vector2(0, 0)
    if axis == 'x':
        dir_vec = Vector2(1, 0)
    elif axis == 'y':
        dir_vec = Vector2(0, 1)
    else:
        raise ValueError(f'Unknown axis: {axis}')

    r = lambda p: reflect_point(p, origin, dir_vec)

    if isinstance(geom, Line):
        return Line(r(geom.p1), r(geom.p2))
    elif isinstance(geom, Circle):
        return Circle(r(geom.center), geom.radius)
    return None


# ── Rotate ─────────────────────────────────────────────────────────────────────

def rotate_point(p: Vector2, center: Vector2, angle: float) -> Vector2:
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    v     = p.sub(center)
    rotated = Vector2(cos_a * v.x - sin_a * v.y,
                      sin_a * v.x + cos_a * v.y)
    return rotated.add(center)

def rotate_geometry(geom, center, angle):
    r = lambda p: rotate_point(p, center, angle)
    if isinstance(geom, Line):
        return Line(r(geom.p1), r(geom.p2))
    elif isinstance(geom, Circle):
        return Circle(r(geom.center), geom.radius)
    return None


# ── Polar Array ─────────────────────────────────────────────────────────────────

def polar_array(geom, count, center):
    results = []
    for i in range(1, count):
        angle = (2 * math.pi / count) * i
        rotated = rotate_geometry(geom, center, angle)
        if rotated:
            results.append(rotated)
    return results


# ── Line-line intersection ─────────────────────────────────────────────────────

def line_line_intersection(a1, a2, b1, b2):
    """Returns (point, t, u) or None if parallel."""
    r = a2.sub(a1)
    s = b2.sub(b1)
    rxs = r.cross(s)
    if abs(rxs) < 1e-10:
        return None
    cb = b1.sub(a1)
    t  = cb.cross(s) / rxs
    u  = cb.cross(r) / rxs
    pt = a1.add(r.scale(t))
    return pt, t, u


# ── Tests ──────────────────────────────────────────────────────────────────────

def run_tests():
    # Offset a horizontal line by +5 mm (should move up 5mm)
    line = Line(Vector2(0, 0), Vector2(10, 0))
    off  = offset_geometry(line, 5)
    assert abs(off.p1.y - 5) < 1e-10, f'offset y: {off.p1.y}'
    assert abs(off.p1.x)     < 1e-10, 'offset x unchanged'

    # Mirror a point across X axis (y should negate)
    line2 = Line(Vector2(2, 3), Vector2(5, 7))
    m     = mirror_geometry(line2, 'x')
    assert abs(m.p1.y - (-3)) < 1e-10, f'mirror y: {m.p1.y}'
    assert abs(m.p1.x - 2)    < 1e-10, 'mirror x unchanged'

    # Polar array: a point at (10, 0), 4 copies, center (0,0)
    # Copy at 90° should be (0, 10)
    pt_line = Line(Vector2(10, 0), Vector2(10, 1))  # just a test object
    copies  = polar_array(pt_line, 4, Vector2(0, 0))
    assert len(copies) == 3, 'polar array count'
    # First copy at 90°
    assert abs(copies[0].p1.x) < 1e-10, f'polar copy x: {copies[0].p1.x}'
    assert abs(copies[0].p1.y - 10) < 1e-10, f'polar copy y: {copies[0].p1.y}'

    # Line-line intersection: (0,0)-(10,0) and (5,-5)-(5,5)
    result = line_line_intersection(
        Vector2(0, 0), Vector2(10, 0),
        Vector2(5, -5), Vector2(5, 5),
    )
    assert result is not None, 'intersection exists'
    pt, t, u = result
    assert abs(pt.x - 5) < 1e-10, f'intersection x: {pt.x}'
    assert abs(pt.y)      < 1e-10, f'intersection y: {pt.y}'

    print('All operations tests passed!')


if __name__ == '__main__':
    run_tests()
```

---

## Part 11 — C++ Track: Week 5 — Classes and Constructors

```cpp
// vec2_class.cpp
// Evolving the Vector2 struct into a full C++ class.
// Compile: g++ -std=c++17 -Wall vec2_class.cpp -o vec2_class
// Run:     ./vec2_class

#include <iostream>
#include <cmath>
#include <vector>

class Vector2 {
public:
    // Public data members (no encapsulation needed for a math type)
    double x;
    double y;

    // Default constructor: initializes to (0, 0)
    Vector2() : x(0), y(0) {}

    // Parameterized constructor
    Vector2(double x, double y) : x(x), y(y) {}

    // ── Operators ─────────────────────────────────────────────────────────────
    // In C++, you can overload operators to make math natural.

    // Vector addition: a + b
    Vector2 operator+(const Vector2& v) const {
        return Vector2(x + v.x, y + v.y);
    }

    // Vector subtraction: a - b
    Vector2 operator-(const Vector2& v) const {
        return Vector2(x - v.x, y - v.y);
    }

    // Scalar multiplication: v * s
    Vector2 operator*(double s) const {
        return Vector2(x * s, y * s);
    }

    // Equality: a == b
    bool operator==(const Vector2& v) const {
        return std::abs(x - v.x) < 1e-10 && std::abs(y - v.y) < 1e-10;
    }

    // ── Member functions ──────────────────────────────────────────────────────

    double magnitude() const {
        return std::sqrt(x*x + y*y);
    }

    Vector2 normalize() const {
        double m = magnitude();
        if (m < 1e-10) return Vector2(0, 0);
        return Vector2(x / m, y / m);
    }

    double dot(const Vector2& v) const {
        return x * v.x + y * v.y;
    }

    double cross(const Vector2& v) const {
        return x * v.y - y * v.x;
    }

    Vector2 perp() const {
        return Vector2(-y, x);
    }

    double distanceTo(const Vector2& v) const {
        return (*this - v).magnitude();
    }

    void print() const {
        std::cout << "(" << x << ", " << y << ")";
    }
};

// ── Non-member operator: s * v (scalar on left side) ─────────────────────────
// Member operators can only have the first operand as 'this'.
// To support 2.0 * v (not just v * 2.0), we define this non-member version.
Vector2 operator*(double s, const Vector2& v) {
    return v * s;
}

int main() {
    Vector2 a(3, 4);
    Vector2 b(1, 2);

    // Now we can write math naturally:
    Vector2 sum  = a + b;
    Vector2 diff = a - b;
    Vector2 scaled = a * 2.0;

    std::cout << "a + b = "; sum.print(); std::cout << "\n";
    std::cout << "a - b = "; diff.print(); std::cout << "\n";
    std::cout << "a * 2 = "; scaled.print(); std::cout << "\n";
    std::cout << "2 * a = "; (2.0 * a).print(); std::cout << "\n";

    // Normalize
    Vector2 n = a.normalize();
    std::cout << "Normalized length: " << n.magnitude() << "\n";  // ~1.0

    // Dot product
    Vector2 x(1, 0), y(0, 1);
    std::cout << "x·y = " << x.dot(y) << "\n";  // 0 (perpendicular)

    return 0;
}
```

**Key concepts introduced:**

`operator+`, `operator-`, `operator*` — **operator overloading**. The compiler
rewrites `a + b` as `a.operator+(b)`. Only overload operators when the meaning
is natural and obvious. Vector addition is always `+`. Never make `+` mean
something unexpected.

`: x(x), y(y)` — the **member initializer list**. This is the proper C++ way to
initialize member variables in a constructor. It initializes directly instead of
default-constructing then assigning.

`const` at the end of a function declaration — means the function does not
modify any member variables (`this` is effectively a pointer to const). Use
this for all getter-style functions.

---

## Part 12 — Composite Command (Bonus)

Currently each `AddGeometryCommand` is separate, so a polar array of 6 creates
6 separate undo steps. We want a single undo to remove all 6. This requires
a **CompositeCommand** (also called a Macro Command):

```js
// In Command.js — add this class:

export class CompositeCommand extends Command {
  constructor(commands, description = "Composite") {
    super();
    this._commands = commands;
    this._description = description;
  }

  get description() {
    return this._description;
  }

  execute() {
    for (const cmd of this._commands) cmd.execute();
  }

  undo() {
    // Undo in reverse order
    for (let i = this._commands.length - 1; i >= 0; i--) {
      this._commands[i].undo();
    }
  }
}
```

Then in `operations-panel.js`, wrap all the adds in one composite:

```js
// Instead of:
for (const g of results) {
  onCommit(new AddGeometryCommand(g));
}

// Do:
import { CompositeCommand } from "../history/Command.js";
// ...
const cmds = results.map((g) => new AddGeometryCommand(g));
onCommit(new CompositeCommand(cmds, `${opType} ×${results.length}`));
```

---

## What You Have After Lab 05

```
cam/
  js/
    operations/
      Operation.js
      OffsetOperation.js
      MirrorOperation.js
      ArrayOperation.js
      TrimExtendOperation.js
    history/
      Command.js        ← + CompositeCommand
      History.js
    ui/
      panel.js
      operations-panel.js
      file-operations.js
```

**Working features:**

- Offset selected geometry by a distance
- Mirror across X or Y axis
- Linear array (N copies with dx, dy spacing)
- Polar array (N copies around a center point)
- All operations produce undoable commands
- Save drawing as JSON file download
- Open a saved JSON file
- Auto-save to localStorage on every change
- Auto-load on page startup

---

## DIVERGE POINTS

**1. Trim and extend in the UI:** The trim/extend math is written but there is
no UI for it. You could add a "Trim" mode where you click the boundary, then
click which segment to trim. This is a more complex tool interaction.

**2. Fillet:** A fillet rounds the corner where two lines meet, replacing the
corner with an arc. It requires: finding the intersection, computing the arc
center at distance `r` from the intersection, trimming both lines to the arc
tangent points.

**3. Boolean operations on profiles:** When two closed profiles overlap, you
can compute their union, intersection, or difference. This is significantly
more complex geometry (requires segment-splitting at intersections).

**4. Keyboard shortcut for operations:** Press `O` to open offset dialog with
the last used value. Press Enter to confirm. A mini-dialog overlay rather than
the side panel gives faster interaction for power users.

**5. Undo history panel:** List the undo/redo stack in the panel UI. Click any
entry to jump to that state. Requires the history to emit events.

---

_Continue to [Lab 06 — G-code Backplotter](LAB-06-GCODE-BACKPLOTTER.md)._
