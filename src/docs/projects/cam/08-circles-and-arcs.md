# CAD/CAM — Lesson 08 — Circles and Arcs

## What You Will Build

Selecting the Circle tool and clicking the canvas defines the centre; a second click
on the circumference fixes the radius and commits the circle. A preview circle expands
as the cursor moves away from the centre. Selecting the Arc tool uses three clicks:
centre, start angle, end angle. Committed circles and arcs appear as smooth curves
drawn with many small line segments. Arcs respect sweep direction — always
counter-clockwise by default.

## What You Need to Know First

Lessons 01–07. The line drawing tool exists. This lesson extends the sketch with two
new geometry types using the same data model and interaction patterns established
for lines.

---

## The Problem

A circle cannot be fully defined by two points the way a line is — a circle requires
a centre and a radius. An arc requires a centre, a start angle, and an end angle.
Both require cursor distance calculations during the preview phase (radius = distance
from centre to cursor). Both require sampling the curve at multiple points to render
a smooth visual representation.

---

## Step 1 — Maths: Circle and Arc Parametrisation

### Circle

A circle with centre `C = (cx, cy)` and radius `r` is the set of all points at
distance `r` from `C`. Its **parametric form** uses the angle `θ`:

```
x(θ) = cx + r × cos(θ)
y(θ) = cy + r × sin(θ)
```

For `θ` from `0` to `2π` (a full rotation), this traces the entire circle.

To render a circle as a polyline: sample `θ` at `N` equally spaced angles, compute
each point, connect them. The more samples, the smoother the circle. For a radius
of `r` world units rendered at screen resolution, the number of segments needed for
a visually smooth result is approximately `max(32, 2π × r × pixelsPerUnit / 3)`.
For a typical sketch radius, `64` segments is sufficient.

**`Math.cos` and `Math.sin` — first use in geometry:**
`Math.cos(θ)` and `Math.sin(θ)` accept angles in radians and return values in
`[-1, 1]`. They are the unit circle coordinates: at angle `θ`, the unit circle point
is `(cos θ, sin θ)`. Multiplying by `r` and offsetting by `(cx, cy)` scales and
positions the circle.

### Arc

An arc is a portion of a circle, swept from start angle `θ_start` to end angle
`θ_end`. The parametric form is the same circle equation, with `θ` ranging from
`θ_start` to `θ_end`:

```
x(θ) = cx + r × cos(θ),  θ_start ≤ θ ≤ θ_end
y(θ) = cy + r × sin(θ)
```

**Sweep direction:**
"Counter-clockwise" means `θ` increases from `θ_start` to `θ_end`. If
`θ_end > θ_start`, the arc sweeps counter-clockwise (standard mathematical direction).
If `θ_end < θ_start`, add `2π` to `θ_end` to get the counter-clockwise sweep:
`θ_end += 2π`.

**Angle from two points:**
Given centre `C` and a point `P` on the circle, the angle is:
```
θ = Math.atan2(P.y - C.y, P.x - C.x)
```

`Math.atan2(y, x)` — first appearance — computes the angle of the vector `(x, y)`
from the positive X axis, in radians in `(-π, π]`. It handles all four quadrants
correctly (unlike `Math.atan(y/x)` which cannot distinguish opposite quadrants). The
arguments are in `(y, x)` order — the Y component first. This is a historical
convention from Fortran, preserved in every language's standard library.

---

## Step 2 — Sketch Data Types

### Update `src/scene/sketch.ts`

```typescript
export interface SketchCircle {
  readonly id:     string
  readonly centre: SketchPoint
  readonly radius: number
}

export interface SketchArc {
  readonly id:         string
  readonly centre:     SketchPoint
  readonly radius:     number
  readonly startAngle: number  // radians
  readonly endAngle:   number  // radians
}

export interface Sketch {
  readonly lines:   readonly SketchLine[]
  readonly circles: readonly SketchCircle[]
  readonly arcs:    readonly SketchArc[]
}
```

Update `createSketch`:

```typescript
export function createSketch(): Sketch {
  return { lines: [], circles: [], arcs: [] }
}
```

Add factory functions:

```typescript
let nextCircleId = 0
let nextArcId    = 0

export function addCircleToSketch(
  sketch: Sketch,
  centre: SketchPoint,
  radius: number,
): Sketch {
  const newCircle: SketchCircle = {
    id:     `circle-${nextCircleId++}`,
    centre: { ...centre },
    radius,
  }
  return { ...sketch, circles: [...sketch.circles, newCircle] }
}

export function addArcToSketch(
  sketch:     Sketch,
  centre:     SketchPoint,
  radius:     number,
  startAngle: number,
  endAngle:   number,
): Sketch {
  let normalisedEnd = endAngle
  if (normalisedEnd < startAngle) normalisedEnd += 2 * Math.PI

  const newArc: SketchArc = {
    id:         `arc-${nextArcId++}`,
    centre:     { ...centre },
    radius,
    startAngle,
    endAngle:   normalisedEnd,
  }
  return { ...sketch, arcs: [...sketch.arcs, newArc] }
}
```

**`normalisedEnd < startAngle → += 2 * Math.PI`:**
Ensures the arc sweeps counter-clockwise. If the user clicks a start point at 300°
and an end point at 60°, the raw angles are `5π/3` and `π/3`. Since `π/3 < 5π/3`,
adding `2π` gives `π/3 + 2π = 7π/3` — the arc sweeps from 300° to 420° (= 60°
by wrapping), counter-clockwise through 0°.

---

## Step 3 — Rendering Circles and Arcs

### Update `src/viewport/sketchRenderer.ts`

```typescript
export function buildCircleObject(
  circle:  SketchCircle,
  colour:  number,
): THREE.Line {
  const segments   = 64
  const points: THREE.Vector3[] = []

  for (let index = 0; index <= segments; index++) {
    const angle = (index / segments) * 2 * Math.PI
    points.push(new THREE.Vector3(
      circle.centre.x + circle.radius * Math.cos(angle),
      circle.centre.y + circle.radius * Math.sin(angle),
      0,
    ))
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: colour })
  const lineObj  = new THREE.Line(geometry, material)
  lineObj.name   = circle.id
  return lineObj
}

export function buildArcObject(
  arc:    SketchArc,
  colour: number,
): THREE.Line {
  const totalAngle = arc.endAngle - arc.startAngle
  const segments   = Math.max(8, Math.ceil(totalAngle / (2 * Math.PI) * 64))
  const points: THREE.Vector3[] = []

  for (let index = 0; index <= segments; index++) {
    const angle = arc.startAngle + (index / segments) * totalAngle
    points.push(new THREE.Vector3(
      arc.centre.x + arc.radius * Math.cos(angle),
      arc.centre.y + arc.radius * Math.sin(angle),
      0,
    ))
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: colour })
  const lineObj  = new THREE.Line(geometry, material)
  lineObj.name   = arc.id
  return lineObj
}
```

**Segments proportional to arc angle:**
`Math.ceil(totalAngle / (2 * Math.PI) * 64)` computes segments proportionally.
A full circle (2π radians) gets 64 segments. A quarter circle (π/2) gets 16. A tiny
arc (π/16) gets the minimum of 8. This prevents over-sampling small arcs (wasting
vertices) and under-sampling large ones.

**`Math.ceil` recap (first used in lesson 11 of the calculator):**
`Math.ceil(x)` rounds up to the nearest integer. Used here to ensure the segment
count is always a whole number and at least 8.

---

## Step 4 — Drawing Tool State for Circle and Arc

### Update `src/state/drawingTool.ts`

```typescript
export interface CircleToolState {
  tool:       DrawingTool
  centre:     { x: number; y: number } | null
  previewEnd: { x: number; y: number } | null
}

export interface ArcToolState {
  tool:        DrawingTool
  centre:      { x: number; y: number } | null
  startPoint:  { x: number; y: number } | null
  previewEnd:  { x: number; y: number } | null
}
```

The interaction model:

**Circle:** 2 clicks — click 1 sets centre, click 2 commits (radius = distance).

**Arc:** 3 clicks — click 1 sets centre, click 2 sets start angle, click 3 sets end
angle and commits.

The implementation in `ViewportComponent` follows the same pattern as line drawing:
use `useRef` for tool state, update on click and mouse move, call `addCircleToSketch`
or `addArcToSketch` on commit, call `renderSketch` after each commit.

```typescript
export function distanceBetweenPoints(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}
```

**`Math.hypot(dx, dy)` — first appearance in geometry context:**
`Math.hypot(dx, dy)` computes `√(dx² + dy²)` — the Euclidean distance for 2D
vectors. Used in the circle tool to convert the cursor's distance from the centre
into a radius. It is the same Pythagorean theorem used in the parametric ray
distance formula, applied to 2D sketch coordinates.

---

## Debugging: When Circles Render as Polygons

**Symptom: circle looks like a hexagon (too few segments)**

The `segments` constant is too low. A circle with 6 segments has hexagonal appearance;
64 is smooth. Check `buildCircleObject` uses 64 segments. If the circle appears
polygonal at a specific zoom level, the issue may be the grid scale: if 1 unit = 1mm,
a 2mm circle is extremely small on screen — even 64 segments may not be visible as
smooth.

**Symptom: arc sweep goes the wrong way**

The `normalisedEnd < startAngle` check is missing. Verify `addArcToSketch` normalises
the end angle. Add a log:
```typescript
console.log('startAngle:', startAngle, 'endAngle:', endAngle, 'normalised:', normalisedEnd)
```

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`buildCircleObject` and `buildArcObject` are sampling functions: they evaluate the
parametric circle equation at discrete angles. This is exactly what the toolpath
generator does in lesson 22 (contour following) when it samples a circle's circumference
to produce G-code points. The same formula, applied to machining instead of rendering.

`distanceBetweenPoints` is used in lesson 09 (snapping) to find the closest sketch
endpoint to the cursor. In lesson 10 (constraints), it computes the current distance
between two points for the distance constraint equation.

---

## What Breaks Without This

**Without arc normalisation:**
`addArcToSketch` with `startAngle = 5π/3` and `endAngle = π/3` would create an arc
sweeping from 300° back to 60° counter-clockwise — but because `endAngle < startAngle`,
the loop in `buildArcObject` would produce `totalAngle < 0` and generate no points.
The arc would be invisible.

**Without proportional segments:**
A quarter-circle arc with 64 segments and a full circle with 64 segments have the
same vertex count — but the quarter-circle only needed 16. Multiplying by 64 arcs in
a complex sketch wastes significant GPU memory. The proportional calculation scales
appropriately.

---

## Definition of Done

- [ ] Circle tool: two clicks draw a circle; preview shows as cursor moves
- [ ] Arc tool: three clicks draw an arc; preview updates between clicks
- [ ] Arcs always sweep counter-clockwise
- [ ] Circles use 64 segments; arcs use proportional segments
- [ ] All previous drawing tools (line) still work
- [ ] You can derive `x(θ) = cx + r cos θ` from the unit circle definition
- [ ] You can explain `Math.atan2(y, x)` and why argument order is `(y, x)`
- [ ] You can explain arc normalisation — why and how `θ_end += 2π`
- [ ] Run:
      ```
      git add src/
      git commit -m "Add circle and arc drawing: parametric sampling renders smooth curves, arc normalisation enforces counter-clockwise sweep"
      ```

---

*Next: Lesson 09 — Snapping. The cursor snaps to existing endpoints and to
horizontal/vertical directions. Snap tolerance is an explicit design parameter.
Nearest-neighbour search over sketch points explained.*
