# CAD/CAM — Lesson 07 — Lines and Vectors

## What You Will Build

In sketch mode, click once to start a line, move the mouse to see a live preview
line following the cursor, click again to commit the line. Committed lines appear
in the sketch as white line segments. Pressing Escape during drawing cancels the
in-progress line without committing it. Multiple lines can be drawn in a single
sketch session. The line segments persist after returning to 3D mode.

## What You Need to Know First

Lessons 01–06. Sketch mode must be working: the camera locks, orbit is disabled.
The XY plane raycasting from lesson 05 gives the 3D world position of cursor clicks
on the grid plane.

---

## The Problem

Drawing a line requires two clicks: a start point and an end point. Between clicks,
the user moves the mouse. The application must show the line as it will appear before
the second click confirms it — this is called a **preview**. A preview that is not
committed is temporary; one that is committed is permanent data in the sketch model.

The challenge: the same mouse move event that previously updated the status bar
cursor position now also needs to update the preview line endpoint. The same click
event that previously selected objects now needs to record sketch points. The **modal
state machine** from lesson 06 ensures that the same events produce different results
in different modes.

---

## Step 1 — Maths: Parametric Lines in 2D

A line segment from point `A` to point `B` can be described parametrically:

```
P(t) = A + t × (B - A)    where 0 ≤ t ≤ 1
```

At `t = 0`, the point is at `A`. At `t = 1`, it is at `B`. At `t = 0.5`, it is
the midpoint. The parametric form is useful for:
- Finding the midpoint of a line (set `t = 0.5`)
- Finding the length of a line: `|B - A|`
- Finding if a point is on the line (solve for `t`, check if it is in [0, 1])

The **direction vector** of the line is `D = B - A`. The **unit direction** is
`D / |D|` — the direction with magnitude 1. The unit direction is used in snapping
(lesson 09) to detect if the cursor is near horizontal or vertical.

**Vector operations used in this lesson:**

**Subtraction:** `B - A = (B.x - A.x, B.y - A.y)` — the vector from A to B.

**Magnitude (length):** `|V| = sqrt(V.x² + V.y²)` — the Pythagorean theorem.
`Math.hypot(V.x, V.y)` computes this. `Math.hypot` is preferred over
`Math.sqrt(V.x**2 + V.y**2)` because it handles overflow better for large values.

**CS lens — the preview pattern:**
Showing a line that follows the cursor before committing it is a fundamental
interaction pattern in every drawing application. Adobe Illustrator, AutoCAD, Figma,
and every CAD tool use it. The implementation is always the same:
1. **Provisional state**: the in-progress line that is not yet part of the model
2. **Committed state**: the line that has been added to the model

The provisional state lives in a React `useRef` or `useState` and is rendered
with a distinct visual style (dashed, lighter colour). The committed state lives in
the sketch data model and is rendered normally. The distinction between "what I might
do" and "what I did" is a universal UX principle.

---

## Step 2 — The Sketch Data Model

### Create `src/scene/sketch.ts`

```typescript
export interface SketchPoint {
  x: number
  y: number
}

export interface SketchLine {
  readonly id:    string
  readonly start: SketchPoint
  readonly end:   SketchPoint
}

export interface Sketch {
  readonly lines: readonly SketchLine[]
}

let nextLineId = 0

export function createSketch(): Sketch {
  return { lines: [] }
}

export function addLineToSketch(
  sketch:    Sketch,
  start:     SketchPoint,
  end:       SketchPoint,
): Sketch {
  const newLine: SketchLine = {
    id:    `line-${nextLineId++}`,
    start: { x: start.x, y: start.y },
    end:   { x: end.x,   y: end.y   },
  }
  return { ...sketch, lines: [...sketch.lines, newLine] }
}
```

**What `src/scene/sketch.ts` is:**
`sketch.ts` owns the 2D sketch data model. It knows nothing about Three.js, React,
or the 3D scene. A sketch is a collection of geometry elements — initially just lines.
Circles and arcs are added in lesson 08. Constraints are added in lesson 10.

**`SketchPoint` vs `THREE.Vector2`:**
Sketch points are plain `{ x, y }` objects, not Three.js types. This is deliberate:
the sketch data model is independent of the rendering library. The Python backend
(lesson 15) will receive sketches as JSON; Three.js types cannot be serialised to
JSON without custom handling. Plain objects serialise trivially.

**Immutability throughout:**
`addLineToSketch` returns a new `Sketch` object, just as `bindVariable` returned a
new `Environment` in the calculator project. The existing sketch is not mutated.
Immutable sketch data enables undo (future), diff (detect what changed), and
serialisation without snapshotting.

---

## Step 3 — Drawing Tool State

### Create `src/state/drawingTool.ts`

```typescript
export const DrawingTool = {
  NONE:   'NONE',
  LINE:   'LINE',
  CIRCLE: 'CIRCLE',
  ARC:    'ARC',
} as const

export type DrawingTool = typeof DrawingTool[keyof typeof DrawingTool]

export interface LineToolState {
  tool:          DrawingTool
  startPoint:    { x: number; y: number } | null
  previewEnd:    { x: number; y: number } | null
}

export function createLineToolState(): LineToolState {
  return { tool: DrawingTool.NONE, startPoint: null, previewEnd: null }
}
```

**Why drawing tool state is separate from sketch data:**
`LineToolState` is **ephemeral** — it records what is currently happening
(which tool is active, where the first click was) but produces no persistent result
until the line is committed. Committing a line moves the data from `LineToolState`
into `Sketch`. Cancelling discards `LineToolState` entirely. Keeping ephemeral
interaction state separate from persistent model data prevents the two from
becoming entangled.

---

## Step 4 — Sketch Rendering

### Create `src/viewport/sketchRenderer.ts`

```typescript
import * as THREE from 'three'
import type { Sketch, SketchLine, SketchPoint } from '../scene/sketch.js'
```

**Import explanation:**
`import * as THREE from 'three'` — Three.js (lesson 01), for `THREE.Line`,
`THREE.BufferGeometry`, and `THREE.LineBasicMaterial`.

`import type { Sketch, SketchLine, SketchPoint } from '../scene/sketch.js'` —
`scene/sketch.ts` owns the sketch data model (this lesson). `import type` because
only the types are needed here, not any runtime values.

```typescript
export function buildSketchLineObject(
  line:    SketchLine,
  colour:  number,
): THREE.Line {
  const points = [
    new THREE.Vector3(line.start.x, line.start.y, 0),
    new THREE.Vector3(line.end.x,   line.end.y,   0),
  ]

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: colour })
  const lineObj  = new THREE.Line(geometry, material)
  lineObj.name   = line.id

  return lineObj
}

export function buildPreviewLine(
  start:   SketchPoint,
  end:     SketchPoint,
): THREE.Line {
  const points = [
    new THREE.Vector3(start.x, start.y, 0),
    new THREE.Vector3(end.x,   end.y,   0),
  ]

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color:       0x6b7280,
    transparent: true,
    opacity:     0.6,
  })
  return new THREE.Line(geometry, material)
}
```

**`THREE.BufferGeometry().setFromPoints(points)` — first appearance:**
`setFromPoints` creates a geometry from an array of `THREE.Vector3` points. For a
`THREE.Line`, this connects the points in order. A two-point array produces a single
line segment. Unlike `BoxGeometry` (lesson 03), which creates a complete mesh,
`BufferGeometry` is lower-level — it stores exactly the vertices you provide.

**`THREE.Line` vs `THREE.LineSegments` vs `THREE.Mesh`:**
`THREE.Line` renders a single connected polyline (each vertex connects to the next).
`THREE.LineSegments` renders disconnected pairs (vertex 0–1 is one segment, 2–3 is
the next — used for edge highlights in lesson 05). `THREE.Mesh` renders filled
triangles. Sketch lines use `THREE.Line` because they are polylines.

**`transparent: true, opacity: 0.6`:**
The preview line is semi-transparent to visually distinguish it from committed lines.
Three.js renders transparent objects in a separate pass after opaque objects. Setting
`transparent: true` on a material opts into this pass.

```typescript
export function renderSketch(
  sketch:          Sketch,
  scene:           THREE.Scene,
  existingObjects: Map<string, THREE.Line>,
): void {
  // Remove lines no longer in the sketch
  for (const [lineId, lineObj] of existingObjects) {
    if (!sketch.lines.some((line) => line.id === lineId)) {
      scene.remove(lineObj)
      lineObj.geometry.dispose()
      ;(lineObj.material as THREE.LineBasicMaterial).dispose()
      existingObjects.delete(lineId)
    }
  }

  // Add new lines
  for (const sketchLine of sketch.lines) {
    if (!existingObjects.has(sketchLine.id)) {
      const lineObj = buildSketchLineObject(sketchLine, 0xe2e8f0)
      scene.add(lineObj)
      existingObjects.set(sketchLine.id, lineObj)
    }
  }
}
```

**`Array.some(predicate)` — first appearance:**
`Array.some(fn)` returns `true` if at least one element in the array satisfies the
predicate function. `sketch.lines.some((line) => line.id === lineId)` is `true` if
any line in the sketch has the given ID. Used here to find lines that have been
removed from the sketch (they are in the map but not in `sketch.lines`).

**Reconciliation pattern:**
`renderSketch` compares the current sketch data to the current Three.js scene and
makes the minimal changes — removing objects no longer needed, adding objects not yet
present. This is called **reconciliation** — the same process React performs when
re-rendering a component tree. Reconciliation is more efficient than clearing and
rebuilding the entire scene on every change.

---

## Step 5 — Wiring Drawing in ViewportComponent

### Add drawing state to `src/components/ViewportComponent.tsx`

```tsx
import { DrawingTool, createLineToolState } from '../state/drawingTool.js'
import type { LineToolState }               from '../state/drawingTool.js'
import { Sketch, createSketch,
         addLineToSketch }                  from '../scene/sketch.js'
import { renderSketch, buildPreviewLine }   from '../viewport/sketchRenderer.js'
```

Add to component state:

```tsx
const sketchRef      = useRef<Sketch>(createSketch())
const toolStateRef   = useRef<LineToolState>(createLineToolState())
const sketchLinesRef = useRef<Map<string, THREE.Line>>(new Map())
const previewLineRef = useRef<THREE.Line | null>(null)
```

**Why refs, not state, for sketch and tool state:**
Drawing produces dozens of mouse-move events per second. Storing the sketch in
`useState` would trigger a React re-render on every mouse move — hundreds of
unnecessary re-renders per second, each reconciling the entire component tree.

Using `useRef` stores the value without triggering re-renders. Three.js handles
rendering — React does not need to re-render for every sketch update. The sketch
data is also propagated to the parent (for the properties panel) only when a line
is committed — not on every mouse move.

**When to use `useState` vs `useRef`:**
- `useState`: when the value change must cause a visual re-render of React components
- `useRef`: when the value needs to persist between renders but the change itself
  does not require a React re-render

Here: `useRef` for the sketch (Three.js renders it, React does not need to),
`useState` for `selectedId` (React's PropertiesPanel needs to re-render on selection
change).

Add to the viewport init `useEffect`, after the viewport is created:

```tsx
// Click handler for sketch drawing
function handleSketchClick(event: MouseEvent): void {
  const viewport = viewportRef.current
  if (viewport === null) return
  if (
    appMode !== AppMode.SKETCH_XY &&
    appMode !== AppMode.SKETCH_XZ &&
    appMode !== AppMode.SKETCH_YZ
  ) return

  const ndcPosition = screenToNDC(
    event.offsetX, event.offsetY,
    container.clientWidth, container.clientHeight,
  )
  const worldPosition = castRayToPlane(ndcPosition, viewport.camera, 0)
  if (worldPosition === null) return

  const clickPoint = { x: worldPosition.x, y: worldPosition.y }
  const toolState  = toolStateRef.current

  if (toolState.startPoint === null) {
    toolStateRef.current = {
      ...toolState,
      tool:       DrawingTool.LINE,
      startPoint: clickPoint,
    }
  } else {
    // Commit the line
    sketchRef.current = addLineToSketch(
      sketchRef.current,
      toolState.startPoint,
      clickPoint,
    )
    renderSketch(
      sketchRef.current,
      viewport.scene,
      sketchLinesRef.current,
    )
    toolStateRef.current = {
      ...toolState,
      startPoint: clickPoint,  // next line starts here (chained drawing)
    }

    // Remove preview
    if (previewLineRef.current !== null) {
      viewport.scene.remove(previewLineRef.current)
      previewLineRef.current = null
    }
  }
}

// Mouse move handler for preview line
function handleSketchMouseMove(event: MouseEvent): void {
  const viewport = viewportRef.current
  if (viewport === null) return

  const toolState = toolStateRef.current
  if (toolState.startPoint === null) return

  const ndcPosition = screenToNDC(
    event.offsetX, event.offsetY,
    container.clientWidth, container.clientHeight,
  )
  const worldPosition = castRayToPlane(ndcPosition, viewport.camera, 0)
  if (worldPosition === null) return

  const endPoint = { x: worldPosition.x, y: worldPosition.y }

  // Remove old preview
  if (previewLineRef.current !== null) {
    viewport.scene.remove(previewLineRef.current)
    previewLineRef.current.geometry.dispose()
    ;(previewLineRef.current.material as THREE.LineBasicMaterial).dispose()
  }

  // Add new preview
  const preview = buildPreviewLine(toolState.startPoint, endPoint)
  viewport.scene.add(preview)
  previewLineRef.current = preview
}
```

---

## Debugging: When Drawing Does Not Work

**Symptom: click in sketch mode does nothing**

Check that the click handler `handleSketchClick` is registered. If it uses a
closure over `appMode` which was the initial value (stale closure), the condition
`appMode !== AppMode.SKETCH_XY` will always be true. Add a log:
```typescript
console.log('sketch click, appMode:', appMode)
```
If `appMode` is `'NAVIGATE_3D'` even after switching to XY, the click handler is
capturing the initial value of `appMode`. Move the handler into its own `useEffect`
with `[appMode]` as a dependency, or use a `ref` for `appMode`.

**Symptom: preview line persists after pressing Escape**

The preview line is not removed in the Escape key handler. Add cleanup:
```typescript
if (previewLineRef.current !== null) {
  viewport.scene.remove(previewLineRef.current)
  previewLineRef.current = null
}
toolStateRef.current = createLineToolState()
```

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`addLineToSketch` produces an immutable `Sketch` value. In lesson 09 (snapping),
the same `Sketch` is passed to the snap calculator, which looks for existing endpoints
to snap to. In lesson 10 (constraints), the same `Sketch` gains a `constraints` array.
In lesson 12 (extrusion), the `Sketch` is sent to the Python backend for solid creation.

The `renderSketch` reconciliation pattern is used for every sketch element type:
circles (lesson 08), arcs (lesson 08), dimension labels (lesson 11). The function
grows but the pattern — compare, remove stale, add new — does not change.

---

## What Breaks Without This

**Without separate sketch and committed line refs:**
If committed lines are re-rendered from scratch on every mouse move (clearing and
rebuilding all Three.js line objects), the canvas flickers on every mouse event.
The reconciliation approach ensures committed lines are never recreated.

**Without disposal in preview line replacement:**
Each mouse move creates a new `BufferGeometry` and `LineBasicMaterial`. If the old
ones are not disposed, each mouse move leaks two GPU objects. After one minute of
drawing (hundreds of moves), hundreds of leaked geometries accumulate in GPU memory.

---

## Definition of Done

- [ ] In sketch mode, clicking once starts a line; cursor shows a preview line
- [ ] Clicking again commits the line; it remains in the sketch
- [ ] Lines persist after returning to 3D mode
- [ ] Pressing Escape cancels in-progress drawing and removes the preview
- [ ] Multiple lines can be drawn in the same sketch session
- [ ] You can explain the preview pattern and distinguish provisional from committed state
- [ ] You can explain `useRef` vs `useState` for sketch data and why `useState` would be wrong here
- [ ] You can explain the reconciliation pattern in `renderSketch`
- [ ] You can explain `Math.hypot` and what it computes
- [ ] Run:
      ```
      git add src/
      git commit -m "Add line drawing tool: two-click commit, preview line follows cursor, sketch model immutable, reconciliation renders only changes"
      ```

---

*Next: Lesson 08 — Circles and Arcs. Click centre then a point on the circumference
to draw a circle. Three-click interaction for arcs. Parametric arc equations derived.*
