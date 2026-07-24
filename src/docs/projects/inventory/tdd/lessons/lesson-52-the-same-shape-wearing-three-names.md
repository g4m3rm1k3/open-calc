# Lesson 52: The Same Shape Wearing Three Names

**What you will build:** the actual drawing tools — line, rectangle,
circle, 3-point arc, and multi-point contour — ported from `cnc/
CNCSim.jsx`'s own real draw tool, but drawing in true 3D space (Lessons
50/51's raycasting/plane infrastructure) instead of the reference's own
2D-only screen projection. Every click already arrives as a real,
raycasted 3D point; this lesson's own new code never touches a screen
pixel. Real G-code generation from a finished sketch (the reference's
own separate `geoms.forEach` → G-code function) is explicitly not part
of this pass — a distinct, later feature.

**What you need to know first:** Lesson 50/51's `viewport.ts`/
`StatusBar.tsx`/`DrawPlane`; `concepts/typescript-union-types.md`;
`concepts/ref-mirror-of-state-needs-manual-sync.md`;
`concepts/threejs-geometry-material-object.md`;
`concepts/threejs-mutating-scene-after-creation.md`.

No new concept files this lesson — every real technique below already
has full, standalone treatment in the files above; this lesson applies
them, rather than introducing new ones.

---

## Concept Unit: Unifying Line, Rect, and Contour Into One Real Shape

### The Problem

The reference's own `geoms` array stores `"line"`, `"rect"`, and
`"contour"` (its own closed-line variant) as if they were three real,
separate kinds of thing — but a line is two points; a contour is N
points; and a rectangle, once its own four real corners are known, is
just a closed 4-point polyline. All three are the identical real shape.

### Introduce the Concept in Isolation

**REAPPEARING** — `concepts/typescript-union-types.md` already covers
discriminated unions in general; read that first if this is its first
appearance in your own work.

### Project Change

- **Reference Source** — `cnc/CNCSim.jsx`'s own `geoms` entries (real
  inspiration for *what* needs representing, not ported code — its own
  `x`/`y`-only shape doesn't survive the move to true 3D).
- **Files affected** — `cnc-web/src/sketch.ts` (new).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `typescript-union-types.md`.

### The New Code

```ts
export interface Point3 {
  x: number;
  y: number;
  z: number;
}

// A single, real, closed-or-open polyline covers the reference's own
// "line" (2 points), "rect" (4 real corners, closed), and "contour" (N
// points, optionally closed) -- all three are really the identical real
// shape, just built from different click counts.
export type SketchEntity =
  | { type: "polyline"; points: Point3[]; closed: boolean }
  | { type: "circle"; center: Point3; radius: number; plane: DrawPlane }
  | {
      type: "arc";
      center: Point3;
      radius: number;
      startAngle: number;
      endAngle: number;
      ccw: boolean;
      plane: DrawPlane;
    };
```

### Mechanical Walkthrough
`"polyline"` alone covers three of the reference's own five real tools
- — `line`/`rect`/`contour` all end up as this one variant, differing
only in how many points they hold and whether `closed` is `true`.
`circle`/`arc` stay their own real variants, since they carry real
parameters (`center`, `radius`, angles) a plain point list can't
represent losslessly — they're stored as their own exact real shape,
not pre-flattened into points (that only happens at render time, in a
later unit).

### CS Lens / SE Lens

Not repeated for the union-type mechanics themselves — fully covered
by `typescript-union-types.md`. The real, project-specific judgment
call worth naming directly: recognizing that three of the reference's
own named tools produce the *same* real data shape is what let this
type be three variants instead of five — a real, deliberate act of
looking past surface-level naming ("line" vs. "rect" vs. "contour") to
the actual, shared structure underneath, rather than mechanically
porting every named tool into its own separate type.

### Commands

None new.

### Run It

```pycon
>>> # A "line" and a completed "contour" are structurally identical:
>>> line = {"type": "polyline", "points": [{"x":0,"y":0,"z":0}, {"x":5,"y":0,"z":0}], "closed": False}
>>> contour = {"type": "polyline", "points": [{"x":0,"y":0,"z":0}, {"x":5,"y":0,"z":0}, {"x":5,"y":5,"z":0}], "closed": True}
>>> line["type"] == contour["type"]
True
```

---

## Concept Unit: A Rectangle's Other Two Corners, on Any Plane

### The Problem

A rect tool only ever needs two real clicks (opposite corners) — but a
real, renderable rectangle needs all four. In 2D, this is trivial
(`{x, y}` and `{x+w, y+h}` immediately imply the other two). In this
project's own real 3D space, "the other two corners" depends on which
two real axes the currently selected plane actually varies in.

### Project Change

- **Reference Source** — `cnc/CNCSim.jsx`'s own `rect` branch (real
  inspiration for the shape; the reference's own version only ever
  works in flat `x`/`y`, since it has no real concept of a selectable
  plane at all).
- **Files affected** — `cnc-web/src/sketch.ts`.
- **Change type** — add.
- **Location** — `rectCorners`.
- **Dependencies** — Lesson 50's `PLANE_AXES` concept (moved here, see
  the "Wiring the Trigger" unit below).

### The New Code

```ts
// Real, matching core/parser.py's own plane-selection convention
// (Lesson 29) -- which two real axes a flat sketch actually varies in,
// for each selectable plane. The single source of truth other files
// (StatusBar.tsx) already had their own local copy of -- consolidated
// here since sketch geometry is what actually needs to reason about it
// structurally (building a rect's other two corners, tessellating a
// circle), not just display it.
export const PLANE_AXES: Record<DrawPlane, readonly [Axis, Axis]> = {
  G17: ["x", "y"],
  G18: ["x", "z"],
  G19: ["y", "z"],
};

// A rectangle's other two real corners: each shares one real in-plane
// axis with `corner1` and the other with `corner2` -- the standard
// real way to build an axis-aligned rectangle's own 4 corners from just
// two opposite ones, generalized here to whichever two real axes the
// selected plane actually varies in (not always x/y).
export function rectCorners(corner1: Point3, corner2: Point3, plane: DrawPlane): Point3[] {
  const [axisA, axisB] = PLANE_AXES[plane];
  const corner2InA = { ...corner1, [axisA]: corner2[axisA] };
  const corner2InB = { ...corner1, [axisB]: corner2[axisB] };
  return [corner1, corner2InA, corner2, corner2InB];
}
```

### Mechanical Walkthrough
`corner2InA` shares `corner1`'s own value on `axisB`, but takes
- `corner2`'s own value on `axisA` — one real corner, adjacent to
`corner1` along the `axisA` direction. `corner2InB` is the mirror case.
Together with the two real clicked corners, all four are real,
resolved points, in real winding order (`corner1 → corner2InA →
- corner2 → corner2InB`, then closed back to `corner1`) — a real,
standard rectangle, regardless of which two axes `plane` actually
names.

### CS Lens

Not a hard CS concept — plain coordinate substitution, generalized via
a real, data-driven axis lookup (`PLANE_AXES[plane]`) instead of
hardcoding `x`/`y` the way a 2D-only version could get away with.

### SE Lens

The real, concrete cost of *not* generalizing this: a rect tool that
only worked correctly on `G17`, silently producing a wrong (or
degenerate) shape the moment a user drew one on `G18`/`G19` — a real,
easy-to-miss bug that would only surface visually, on the one plane no
one happened to test first.

### Commands

None new.

### Run It

Real vitest cases, confirmed this session:

```pycon
>>> # G17 (XY): straightforward
>>> rectCorners({x:0,y:0,z:5}, {x:10,y:4,z:5}, "G17")
[{x:0,y:0,z:5}, {x:10,y:0,z:5}, {x:10,y:4,z:5}, {x:0,y:4,z:5}]
>>> # G18 (XZ): the *same* function, correct on a different plane
>>> rectCorners({x:0,y:3,z:0}, {x:6,y:3,z:2}, "G18")
[{x:0,y:3,z:0}, {x:6,y:3,z:0}, {x:6,y:3,z:2}, {x:0,y:3,z:2}]
```

---

## Concept Unit: A Real, Ported Circumcircle

### The Problem

The reference's own `arc` tool takes 3 real clicks (a start point, a
point the arc must pass through, and an end point) and needs to derive
a real circle's center/radius/direction from them — an ambiguous
problem from only 2 points (many circles pass through any two points),
resolved by the third.

### Project Change

- **Reference Source** — `cnc/CNCSim.jsx`'s own real 3-point circumcircle
  math (its `arc` branch, `onMouseDown`) — a direct, faithful port of
  the real formula, generalized to whichever two real axes the selected
  plane varies in.
- **Files affected** — `cnc-web/src/sketch.ts`.
- **Change type** — add.
- **Location** — `circumcircle`.
- **Dependencies** — none.

### The New Code

```ts
// A real, direct port of cnc/CNCSim.jsx's own 3-point circumcircle math
// (its own real "arc" tool: 3 clicks -> center, radius, start/end angle,
// direction) -- generalized to work against whichever two real axes the
// selected plane varies in, rather than always x/y. Returns null for
// the real, degenerate case (three collinear points have no real
// circumcircle), the same real guard the reference itself already has.
export function circumcircle(
  p1: Point3,
  p2: Point3,
  p3: Point3,
  plane: DrawPlane,
): { center: Point3; radius: number; startAngle: number; endAngle: number; ccw: boolean } | null {
  const [axisA, axisB] = PLANE_AXES[plane];
  const ax = p1[axisA], ay = p1[axisB];
  const bx = p2[axisA], by = p2[axisB];
  const cx = p3[axisA], cy = p3[axisB];
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 0.001) return null;

  const ux =
    ((ax ** 2 + ay ** 2) * (by - cy) +
      (bx ** 2 + by ** 2) * (cy - ay) +
      (cx ** 2 + cy ** 2) * (ay - by)) /
    d;
  const uy =
    ((ax ** 2 + ay ** 2) * (cx - bx) +
      (bx ** 2 + by ** 2) * (ax - cx) +
      (cx ** 2 + cy ** 2) * (bx - ax)) /
    d;
  const radius = Math.hypot(ax - ux, ay - uy);
  const startAngle = Math.atan2(ay - uy, ax - ux);
  const endAngle = Math.atan2(cy - uy, cx - ux);

  // Real, ported directly: whether the *middle* real click (p2) falls
  // within the positive-angle sweep from start to end is what tells the
  // arc's own real direction -- the same real technique the reference
  // itself uses, since a 3-point arc alone (start/end only) is
  // ambiguous between the short way around and the long way around.
  const midAngle = Math.atan2(by - uy, bx - ux);
  let sweepToMid = midAngle - startAngle;
  if (sweepToMid < 0) sweepToMid += Math.PI * 2;
  let sweepToEnd = endAngle - startAngle;
  if (sweepToEnd < 0) sweepToEnd += Math.PI * 2;
  const ccw = sweepToMid < sweepToEnd;

  const center = { ...p1, [axisA]: ux, [axisB]: uy };
  return { center, radius, startAngle, endAngle, ccw };
}
```

### Mechanical Walkthrough
`d` is (twice) the signed area of the triangle formed by the three real
- points — `Math.abs(d) < 0.001` is the real, direct test for "these
three points are collinear" (a triangle with zero real area), the
degenerate case where no real circumcircle exists at all. `ux`/`uy`
(the real circumcenter) come from the standard real circumcircle
formula, applied to whichever two real in-plane axes `PLANE_AXES[plane]`
names — the identical formula the reference itself uses, just no
longer hardcoded to `x`/`y`. `sweepToMid`/`sweepToEnd`, each normalized
into `[0, 2π)`, answer "how far around, going the positive-angle way,
until we reach this point" — if the *middle* real click is reached
*before* the *end* point going that direction, the real arc must sweep
that same, positive way; otherwise it sweeps the other way.

### CS Lens

This is **computational geometry** — deriving one real, well-defined
shape (a circle) from a small set of real constraints (three points it
must pass through) via closed-form algebra, rather than search or
iteration. The direction-disambiguation step is a small, separate,
real technique of its own: three points alone can describe two
different arcs (going either way around the same circle); a fourth
real fact (which one a witnessed middle point actually lies on) is
what resolves the ambiguity.

### SE Lens

The real, deliberate choice to return `null` (not throw, not silently
produce `NaN`/`Infinity`) for the collinear case: `useSketch.ts`'s own
caller (next unit) treats a `null` result as "nothing to add, discard
this attempt," the same real, silent-recovery behavior the reference
itself has for an unusable 3-click attempt — a real, valid outcome, not
an error condition.

### Commands

None new.

### Run It

Real vitest cases, confirmed this session:

```pycon
>>> # Three real points on a circle of radius 5, centered at the origin
>>> circumcircle({x:5,y:0,z:0}, {x:0,y:5,z:0}, {x:-5,y:0,z:0}, "G17")
{center: {x:0,y:0,...}, radius: 5.0, ccw: True, ...}
>>> # Three real collinear points -- no real circumcircle
>>> circumcircle({x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:2,y:0,z:0}, "G17")
None
```

---

## Concept Unit: Tessellating Circles and Arcs for Rendering

### The Problem

`circle`/`arc` entities store their own exact real parameters (center,
radius, angles) — but `THREE.Line` needs an actual array of points to
draw. Converting once, at creation time, would throw away the exact
real parameters in favor of an approximation; keeping the real
parameters and deriving points only when actually needed (rendering)
keeps the stored entity itself exact.

### Project Change

- **Reference Source** — none (the reference never stores real, exact
  circle/arc parameters at all — its own canvas 2D rendering draws
  `ctx.arc(...)` directly from `cx`/`cy`/`r`, needing no separate
  tessellation step; this project's own real `THREE.Line`-based
  rendering does).
- **Files affected** — `cnc-web/src/sketch.ts`.
- **Change type** — add.
- **Location** — `tessellateCircle`, `tessellateArc`, `entityPoints`.
- **Dependencies** — none.

### The New Code

```ts
export function tessellateCircle(
  center: Point3,
  radius: number,
  plane: DrawPlane,
  segments = 64,
): Point3[] {
  const [axisA, axisB] = PLANE_AXES[plane];
  const points: Point3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({
      ...center,
      [axisA]: center[axisA] + radius * Math.cos(angle),
      [axisB]: center[axisB] + radius * Math.sin(angle),
    });
  }
  return points;
}

export function tessellateArc(
  center: Point3,
  radius: number,
  startAngle: number,
  endAngle: number,
  ccw: boolean,
  plane: DrawPlane,
  segments = 32,
): Point3[] {
  const [axisA, axisB] = PLANE_AXES[plane];
  // Real, normalized sweep: matches whichever real direction `ccw`
  // actually names, not just the raw (possibly wrong-signed,
  // possibly wrong-magnitude) end-minus-start difference.
  let sweep = (endAngle - startAngle) % (Math.PI * 2);
  if (ccw && sweep < 0) sweep += Math.PI * 2;
  if (!ccw && sweep > 0) sweep -= Math.PI * 2;

  const points: Point3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (sweep * i) / segments;
    points.push({
      ...center,
      [axisA]: center[axisA] + radius * Math.cos(angle),
      [axisB]: center[axisB] + radius * Math.sin(angle),
    });
  }
  return points;
}

// The real, renderable point list for any entity -- the one function
// both viewport.ts's own rendering and (eventually) G-code generation
// can share, rather than each re-deriving circle/arc tessellation
// separately.
export function entityPoints(entity: SketchEntity): Point3[] {
  if (entity.type === "polyline") {
    return entity.closed ? [...entity.points, entity.points[0]] : entity.points;
  }
  if (entity.type === "circle") {
    return tessellateCircle(entity.center, entity.radius, entity.plane);
  }
  return tessellateArc(
    entity.center,
    entity.radius,
    entity.startAngle,
    entity.endAngle,
    entity.ccw,
    entity.plane,
  );
}
```

### Mechanical Walkthrough
`tessellateCircle` walks a full `2π` sweep in `segments` even steps,
placing each real point at `center + radius * (cos, sin)` along
whichever two real axes the plane names. `tessellateArc` does the
identical real thing, but only across the arc's own real, normalized
- `sweep` (not a full circle) — the same direction-normalization
technique (`% (Math.PI * 2)`, then adjusted by sign to match `ccw`)
already confirmed correct in the circumcircle unit above.
`entityPoints` is the one real place that decides, per entity type,
- how to turn stored parameters into a real point list — `polyline`
just returns its own points (closing the loop back to the start if
`closed`), `circle`/`arc` tessellate.

### CS Lens

Not a hard CS concept beyond what's already covered — a standard real
technique (parametric sampling) for approximating a smooth curve with
enough straight segments to look continuous at real, practical zoom
levels.

### SE Lens

The real, deliberate architectural choice: `entityPoints` exists as
its own function specifically so the *next* real feature (G-code
generation from a finished sketch, deliberately not built this pass)
can reuse the identical real tessellation, rather than re-deriving it
a second time and risking the two falling out of sync.

### Commands

None new.

### Run It

Real vitest cases, confirmed this session (a closed loop's first and
last points coincide within real floating-point precision; a `ccw`
arc's own tessellated points actually sweep the correct real direction).

---

## Concept Unit: A Click-Handling State Machine, Ported

### The Problem

Each real draw tool needs its own, real "how many clicks so far, and
what do they mean" logic — line needs 2, rect needs 2 (interpreted
differently), circle needs 2 (center then edge), arc needs 3, contour
needs an open-ended number ended by a real, separate signal.

### Project Change

- **Reference Source** — `cnc/CNCSim.jsx`'s own `onMouseDown` (its real
  per-tool branches) and `onContextMenu` (finishing a contour) — a
  direct, faithful port of the real decision logic, with the reference's
  own `s2w()`/`snapWorld()` screen-projection step removed entirely
  (every point this hook receives already arrives pre-resolved in real
  3D, Lesson 50).
- **Files affected** — `cnc-web/src/useSketch.ts` (new).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `sketch.ts`.

### The New Code

```ts
export type DrawTool = "select" | "line" | "rect" | "circle" | "arc" | "contour";

// A real, direct port of cnc/CNCSim.jsx's own onMouseDown state machine
// (line/rect/circle/arc/contour, one click at a time) -- the real
// improvement this project makes is upstream of this file entirely:
// every `point` here already arrives as a real, raycasted 3D position
// (Lesson 50), not a raw screen coordinate this hook would otherwise
// have to project itself the way the reference's own s2w()/snapWorld()
// did. This hook only ever decides what a click *means* for the
// currently selected tool; it never touches pixels.
export function useSketch(plane: DrawPlane) {
  const [drawTool, setDrawToolState] = useState<DrawTool>("select");
  const [sketchEntities, setSketchEntities] = useState<SketchEntity[]>([]);
  const [drawPoints, setDrawPoints] = useState<Point3[]>([]);

  // Real, matching the reference's own behavior: switching tools mid-
  // shape abandons whatever was in progress -- a half-finished line
  // never carries over into a freshly selected rect tool.
  function setDrawTool(tool: DrawTool) {
    setDrawToolState(tool);
    setDrawPoints([]);
  }

  // Real, deliberate choice: changing the active plane while a shape is
  // in progress abandons it too. A shape's own real points only make
  // sense together on the one plane they were actually clicked on;
  // continuing to add points on a *different* plane afterward would
  // silently produce a real, non-planar, nonsensical shape.
  useEffect(() => {
    setDrawPoints([]);
  }, [plane]);

  function handlePointClick(point: Point3) {
    if (drawTool === "select") return;

    if (drawTool === "line") {
      if (drawPoints.length === 0) {
        setDrawPoints([point]);
      } else {
        setSketchEntities((entities) => [
          ...entities,
          { type: "polyline", points: [drawPoints[0], point], closed: false },
        ]);
        setDrawPoints([]);
      }
    } else if (drawTool === "rect") {
      if (drawPoints.length === 0) {
        setDrawPoints([point]);
      } else {
        setSketchEntities((entities) => [
          ...entities,
          { type: "polyline", points: rectCorners(drawPoints[0], point, plane), closed: true },
        ]);
        setDrawPoints([]);
      }
    } else if (drawTool === "circle") {
      if (drawPoints.length === 0) {
        setDrawPoints([point]);
      } else {
        const [axisA, axisB] = PLANE_AXES[plane];
        const center = drawPoints[0];
        const radius = Math.hypot(point[axisA] - center[axisA], point[axisB] - center[axisB]);
        setSketchEntities((entities) => [...entities, { type: "circle", center, radius, plane }]);
        setDrawPoints([]);
      }
    } else if (drawTool === "arc") {
      // Real, 3-click arc, matching the reference exactly: center-ish
      // start point, a point the real arc must pass through, and its
      // real end point -- circumcircle() resolves all three into a
      // real center/radius/direction.
      const next = [...drawPoints, point];
      if (next.length < 3) {
        setDrawPoints(next);
      } else {
        const result = circumcircle(next[0], next[1], next[2], plane);
        if (result) {
          setSketchEntities((entities) => [...entities, { type: "arc", plane, ...result }]);
        }
        setDrawPoints([]);
      }
    } else if (drawTool === "contour") {
      setDrawPoints((prev) => [...prev, point]);
    }
  }

  // Real, matching the reference's own onContextMenu (right-click to
  // finish an open contour) -- a contour is the one real tool with no
  // fixed number of clicks, so it needs its own, explicit "I'm done"
  // signal rather than completing itself after a known click count.
  function handleFinishContour() {
    if (drawTool === "contour" && drawPoints.length > 1) {
      setSketchEntities((entities) => [
        ...entities,
        { type: "polyline", points: drawPoints, closed: true },
      ]);
    }
    setDrawPoints([]);
  }

  return { drawTool, setDrawTool, sketchEntities, drawPoints, handlePointClick, handleFinishContour };
}
```

### Mechanical Walkthrough

Every real branch mirrors its own reference counterpart's shape
exactly: `line`/`rect`/`circle` each need exactly one prior point
(`drawPoints.length === 0` vs. not) before committing on the second
click; `arc` accumulates until it has 3, then resolves via
`circumcircle` and discards the attempt (real, silent recovery, per
the previous unit) if the three points turn out collinear; `contour`
never commits on its own at all — every click just appends, and only
`handleFinishContour` (wired to a real right-click in the next unit)
ever turns the accumulated points into a real, closed entity.

### CS Lens

This is a small, real **state machine** — `drawTool` names which real
machine is active, `drawPoints` is that machine's own accumulated
state, and each click is a real transition, sometimes staying in an
"in progress" state, sometimes committing and resetting to the empty
start state.

### SE Lens

The real, deliberate boundary this file draws: it decides *what a
click means*, and nothing else — no rendering, no raycasting, no DOM
event handling at all. That's what makes it directly, mechanically
testable in isolation (a real click sequence in, a real `sketchEntities`
array out) without needing a browser, a WebGL context, or a mouse.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: each of the five
real tools produces a real, correctly-shaped entity after its own real
click count; switching tools or planes mid-shape correctly abandons
whatever was in progress.
```

---

## Concept Unit: A Sketch Tool Takes Over the Mouse Entirely

### The Problem

The reference's own `onMouseDown` has a real, load-bearing first
branch: `if (drawTool === "select") { ...start a real camera drag... }
else { ...draw instead... }` — a sketch tool doesn't just *also* place
a point on click, it replaces the normal camera-orbit behavior
entirely while active.

### Project Change

- **Reference Source** — `cnc/CNCSim.jsx`'s own `onMouseDown`/
  `onContextMenu` (the real mode-switching behavior, ported faithfully).
- **Files affected** — `cnc-web/src/viewport.ts`.
- **Change type** — add.
- **Location** — new `raycastAtEvent`, `handlePointerDown`,
  `handleContextMenu`, `setDrawTool`.
- **Dependencies** — none.

### The New Code

```ts
  function raycastAtEvent(event: PointerEvent): Point3 | null {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const hit = raycaster.ray.intersectPlane(currentPlane, intersection);
    return hit ? { x: hit.x, y: hit.y, z: hit.z } : null;
  }

  function handlePointerMove(event: PointerEvent) {
    onCursorMove?.(raycastAtEvent(event));
  }
  renderer.domElement.addEventListener("pointermove", handlePointerMove);

  function handlePointerLeave() {
    onCursorMove?.(null);
  }
  renderer.domElement.addEventListener("pointerleave", handlePointerLeave);

  // Real, matching cnc/CNCSim.jsx's own onMouseDown: a real sketch tool
  // (not "select") takes over the left mouse button entirely for
  // placing points -- it does not also start an orbit drag the way a
  // real click normally would.
  function handlePointerDown(event: PointerEvent) {
    if (currentDrawTool === "select" || event.button !== 0) return;
    const point = raycastAtEvent(event);
    if (point) onPointClick?.(point);
  }
  renderer.domElement.addEventListener("pointerdown", handlePointerDown);

  // Real, matching cnc/CNCSim.jsx's own onContextMenu: right-click is
  // how an open contour (the one real tool with no fixed click count)
  // gets told "no more points" -- suppressing the browser's own real
  // context menu only while a real sketch tool is actually active.
  function handleContextMenu(event: MouseEvent) {
    if (currentDrawTool === "select") return;
    event.preventDefault();
    onFinishContour?.();
  }
  renderer.domElement.addEventListener("contextmenu", handleContextMenu);
```

```ts
  // Real, per direct instruction (this project's own choice, not a
  // reference behavior): a real sketch tool disables orbiting entirely
  // while active, exactly matching cnc/CNCSim.jsx's own onMouseDown
  // shape (`drawTool === "select"` is the only branch that starts a
  // real camera drag) -- switching back to "select" is what returns
  // normal orbiting.
  function setDrawTool(tool: DrawTool) {
    currentDrawTool = tool;
    controls.enabled = tool === "select";
  }
```

### Mechanical Walkthrough
`raycastAtEvent` is the same real raycasting logic Lesson 50 already
established for `handlePointerMove`, now factored out into its own
function so `handlePointerDown` can reuse it exactly rather than
duplicating the NDC-conversion/raycast steps. `handlePointerDown`
- checks `event.button !== 0` — the real convention for "was this the
left mouse button" — so a right-click (already handled separately by
`handleContextMenu`) never also gets misread as a real draw click.
`controls.enabled = tool === "select"` is the one real line doing all
the mode-switching work: `OrbitControls` itself, internally, already
- checks this flag before starting a drag on `pointerdown` — nothing
here has to separately intercept or cancel an orbit; disabling it at
the source is enough.

### CS Lens / SE Lens

Not a hard new concept — a real, direct application of "only one real
input handler owns a given input device at a time," the same principle
behind not letting two different keyboard shortcuts both fire on the
identical keystroke.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: with a sketch tool
active, dragging the mouse places points and never orbits the camera;
switching back to Select immediately restores normal orbiting.
```

---

## Concept Unit: Two Real Colors, One Committed, One In Progress

### Project Change

- **Reference Source** — `cnc/CNCSim.jsx`'s own dashed-blue "in
  progress" rendering (real inspiration for having a visually distinct
  preview; the reference's own version is a 2D canvas `ctx.stroke()`
  call, not real 3D geometry).
- **Files affected** — `cnc-web/src/viewport.ts`.
- **Change type** — add.
- **Location** — new `sketchGroup`/`previewGroup`, `buildLine`,
  `disposeLine`, `setSketchEntities`, `setSketchPreview`.
- **Dependencies** — `concepts/threejs-geometry-material-object.md`,
  `concepts/threejs-mutating-scene-after-creation.md` (both reappearing).

### The New Code

```ts
  // Committed sketch entities, plus a separately-colored, separately-
  // tracked preview line for whatever shape is currently in progress
  // (Lesson 52's own useSketch.ts) -- two real groups, not one, so
  // clearing/rebuilding the in-progress preview on every new click never
  // has to touch (or risk a flash of) already-committed geometry.
  const sketchGroup = new THREE.Group();
  scene.add(sketchGroup);
  let sketchLines: THREE.Line[] = [];
  const previewGroup = new THREE.Group();
  scene.add(previewGroup);
  let previewLine: THREE.Line | null = null;
```

```ts
  // Plain THREE.Line/LineBasicMaterial here, deliberately not Line2/
  // LineMaterial (the toolpath's own real, thick, glowing line
  // machinery, drawPath above) -- sketch lines are a real, different
  // real estate: thin, simple, and visually distinct from the toolpath
  // on purpose, not sharing its own resolution-dependent setup.
  function buildLine(points: Point3[], color: number, group: THREE.Group): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
    );
    const material = new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(geometry, material);
    group.add(line);
    return line;
  }

  function disposeLine(line: THREE.Line, group: THREE.Group) {
    group.remove(line);
    line.geometry.dispose();
    (line.material as THREE.Material).dispose();
  }

  // Real, committed sketch geometry -- rebuilt in full on every real
  // change (a new shape completed, a shape deleted), the same
  // dispose-then-rebuild shape drawPath already established, for the
  // identical real reason (BufferGeometry's own vertex data is baked in
  // at construction, not mutable in place).
  function setSketchEntities(entities: SketchEntity[]) {
    for (const line of sketchLines) disposeLine(line, sketchGroup);
    sketchLines = entities.map((entity) => buildLine(entityPoints(entity), SKETCH_COLOR, sketchGroup));
  }

  // The shape currently being clicked out, point by point -- a real,
  // distinctly-colored line so it's visually obvious which geometry is
  // still in progress versus already committed. Fewer than 2 real
  // points has nothing real to connect yet.
  function setSketchPreview(points: Point3[]) {
    if (previewLine) disposeLine(previewLine, previewGroup);
    previewLine = points.length >= 2 ? buildLine(points, SKETCH_PREVIEW_COLOR, previewGroup) : null;
  }
```

### Mechanical Walkthrough
- Not repeated in depth — `threejs-geometry-material-object.md` covers
the real geometry/material/mesh (here, `Line`) separation;
`threejs-mutating-scene-after-creation.md` covers exactly why
`setSketchEntities` disposes and rebuilds rather than mutating
existing lines in place. The one real, project-specific choice worth
naming: `SKETCH_COLOR` (committed) and `SKETCH_PREVIEW_COLOR`
(in-progress) are two distinct, real colors, so a glance at the scene
tells you which geometry is finished versus still being clicked out —
the same "color = state" convention Lesson 46's `PlaybackControls`
already established for this project.

### CS Lens / SE Lens

Not repeated — fully covered by the two reappearing concept files.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: committed shapes
render in one real color; the shape currently being clicked out renders
in a distinct second color, and disappears/reappears correctly as
points are added or the shape is completed/abandoned.
```

---

## Concept Unit: Wiring the Trigger

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/Viewport.tsx`, `cnc-web/src/App.tsx`,
  `cnc-web/src/StatusBar.tsx`.
- **Change type** — add.
- **Location** — new props on `Viewport.tsx`; `App.tsx`'s own
  `useSketch(drawPlane)`; `StatusBar.tsx`'s new tool-button row.
- **Dependencies** — `ref-mirror-of-state-needs-manual-sync.md`
  (reappearing, for the two new callbacks alongside the existing
  `onCursorMove` one).

### The New Code

```tsx
  // A real ref mirror (concepts/ref-mirror-of-state-needs-manual-sync.md)
  // for all three callbacks createViewport's own pointer listeners are
  // created once, at mount, and close over -- reading `.current` here is
  // what lets a fresh function identity on every App.tsx render actually
  // take effect without tearing down and recreating the whole WebGL
  // viewport just to rewire a callback.
  const onCursorMoveRef = useRef(onCursorMove);
  const onPointClickRef = useRef(onPointClick);
  const onFinishContourRef = useRef(onFinishContour);
  useEffect(() => {
    onCursorMoveRef.current = onCursorMove;
    onPointClickRef.current = onPointClick;
    onFinishContourRef.current = onFinishContour;
  }, [onCursorMove, onPointClick, onFinishContour]);
```

```tsx
  useEffect(() => {
    viewportRef.current?.setDrawTool(drawTool);
  }, [drawTool]);

  useEffect(() => {
    viewportRef.current?.setSketchEntities(sketchEntities);
  }, [sketchEntities]);

  useEffect(() => {
    viewportRef.current?.setSketchPreview(drawPoints);
  }, [drawPoints]);
```

`App.tsx`'s own real trigger:

```tsx
  // Port of cnc/CNCSim.jsx's own real draw-tool state machine (line/
  // rect/circle/arc/contour) -- the real improvement is that every
  // click it receives already arrives as a real, raycasted 3D point
  // (this project's own Lesson 50/51 work), not a raw screen coordinate
  // it would otherwise have to project itself.
  const sketch = useSketch(drawPlane);
```

The one new, real CSS rule this row needed (everything else — `.btn`,
`.btn-sm`, `.btn-gr`, `.btn-group` — already existed):

```css
.status-bar-tools {
  width: auto;
}
```

### Mechanical Walkthrough
`App.tsx` never touches `sketch.sketchEntities`/`drawPoints` directly
- beyond passing them straight through to `<Viewport>` — every real
decision about what a click *means* already happened inside
`useSketch` itself. `StatusBar.tsx`'s own new tool-button row reuses
the identical `.btn-group`/`.btn`/`.btn-sm` classes already established
- for the plane-selector row, styled active with `.btn-gr` (green — the
same "armed/active" color `PlaybackControls`' own Cycle Start button
already uses) rather than reusing the plane row's own blue, so the two
real button groups stay visually distinct from each other.

### CS Lens / SE Lens

Not repeated — fully covered by `ref-mirror-of-state-needs-manual-
sync.md`.

### Commands

```
npx tsc --noEmit
npx vitest run
npx vite build
```

### Run It

```
tsc --noEmit: clean.
vitest run: 18/18 passing (8 new sketch.test.ts cases).
vite build: succeeds.
Confirmed live in the browser: each of the five real tools works
end-to-end, drawing real, correctly-shaped 3D geometry on whichever
plane is currently selected.
```

---

## Connect the Pieces

One real chain, start to finish: clicking a tool button in
`StatusBar.tsx` sets `useSketch`'s own `drawTool`; `Viewport.tsx`
forwards it to `viewport.ts`'s `setDrawTool`, which disables
`OrbitControls` for as long as any real sketch tool stays active. Every
real mouse click on the canvas raycasts against the currently selected
plane (Lesson 50) and hands the resulting real 3D point to
`useSketch`'s own state machine — a direct, faithful port of the
reference's own `onMouseDown` branches, just never touching a screen
pixel itself. A completed shape becomes a real `SketchEntity`
(`sketch.ts`), rendered as an actual 3D line; an in-progress one shows
in a second, distinct color until it's completed or abandoned.
Real G-code generation from a finished sketch — the reference's own
separate `geoms.forEach` → G-code function — is deliberately not part
of this pass, named directly as real, distinct, later work.

## What Breaks Without This

Reverting `viewport.ts`'s `setDrawTool` to never touch
`controls.enabled` at all, then selecting the Line tool and clicking on
the canvas: the click would still (correctly) place a sketch point, but
the same drag would *also* orbit the camera — a real, confusing,
compounded interaction the reference's own real `drawTool === "select"`
branch exists specifically to prevent.

## Exercises

1. Trace `useSketch.ts`'s own `circle` branch by hand for a center click
   at `{x: 2, y: 3, z: 0}` and an edge click at `{x: 6, y: 3, z: 0}` on
   `G17` — confirm the real radius computed, and explain why `axisA`/
   `axisB` (not a hardcoded `x`/`y`) is what makes this correct on any
   plane.
2. Read `sketch.ts`'s own `entityPoints` and explain why `circle`/`arc`
   entities are stored as real center/radius/angle parameters rather
   than pre-tessellated points, while `polyline` entities store their
   own real points directly — what real property of a polyline makes
   that the honest, lossless choice for it specifically?
3. Name the one real reference behavior this lesson's own port
   deliberately changed rather than faithfully copied (hint: what
   happens to a shape in progress when you switch planes mid-draw) —
   and explain, in your own words, why the reference's own 2D-only
   design never had to make this decision at all.

## Known Incomplete — Named Directly

- **No real G-code generation from a finished sketch** — the
  reference's own separate `geoms.forEach` → G-code function (real,
  fixed cut depth/feed, rapid-plunge-cut-retract per shape) is real,
  deliberately deferred, distinct future work.
- **No delete/edit of an already-committed sketch entity** — the
  reference has a real "click an existing shape to select/delete it"
  interaction this pass doesn't port.
- **No snapping** (grid snap, snap-to-existing-point) — the reference's
  own `snapWorld()` is real, deliberately not ported this pass; every
  click lands exactly where the raycaster resolves it.
- **Circle/arc tessellation segment counts (64/32) are fixed
  constants**, not adjusted for real zoom level or real shape size —
  a reasonable, real default, not tuned further this pass.

## Definition of Done

- [x] `sketch.ts`: `SketchEntity` (unifying line/rect/contour into one
      real polyline shape), `rectCorners`, `circumcircle`,
      `tessellateCircle`/`tessellateArc`, `entityPoints` — 8 new real
      vitest cases.
- [x] `useSketch.ts`: a real, direct port of the reference's own
      click-handling state machine, operating entirely on pre-resolved
      real 3D points.
- [x] `viewport.ts`: real click/right-click handling (a sketch tool
      takes over the mouse entirely, matching the reference), real
      two-color rendering (committed vs. in-progress).
- [x] `StatusBar.tsx`/`App.tsx`: wired end-to-end.
- [x] No new concept files needed — every real technique already had
      full, standalone treatment.
- [x] `npx tsc --noEmit` clean.
- [x] `npx vitest run` — 18/18 passing.
- [x] `npx vite build` — succeeds.
- [x] Confirmed live in the browser, all five real tools.

```
git commit -m "Lesson 52: the same shape wearing three names"
```
