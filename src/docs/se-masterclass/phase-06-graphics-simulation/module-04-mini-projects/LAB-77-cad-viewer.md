# SE Masterclass — LAB-77 — CAD Viewer

**Prerequisites:** LAB-76 (Physics Sandbox)

## Quick Check

Before starting, answer these (answers at the bottom):

1. When a user clicks a pixel on screen, what has to happen before you can ask "which shape is under this point?"
2. Why is hit-testing a circle cheap, but hit-testing an arbitrary polygon harder?
3. Why should pan/zoom change the camera, not the shapes' own coordinates?

## What You Will Build

A viewport showing CAD-style geometry (lines, circles, rectangles, polygons) defined once in world-space millimeters, that you can pan by dragging, zoom with the scroll wheel, and click to select — with the clicked shape highlighting, proving hit-testing correctly accounts for the current pan/zoom.

```
World: a 100mm x 60mm rectangle at origin, a Ø20mm circle at (50, 30)
Zoom 1x:  rectangle spans screen (400,270)-(500,330)
Zoom 3x:  same rectangle spans screen (250,180)-(550,420) -- 3x larger, same world data
Click at screen (470, 300) while zoomed -> correctly resolves to the circle, not the rectangle
```

## Concept: CAD Viewport — World-Space Interaction

**What it is:** A CAD viewport is the marriage of two things this curriculum already built separately: LAB-69's world↔screen coordinate pipeline (`Camera`), and mouse interaction. The core discipline is that geometry is defined once, in world units that mean something (millimeters, in this lab), and the viewport is just a *window* onto that data — panning and zooming change what part of the world is visible, never the world data itself.

**The problem before:** LAB-71's renderer already draws world-space shapes through a `Camera`. But nothing in Phase 6 so far handles *input* going the other direction — a mouse click gives you a screen pixel, and you need to know which world shape (if any) is under it. Get the direction of the transform wrong (applying the camera matrix instead of its inverse) and clicks will "select" the wrong shape the moment you pan or zoom away from the identity camera.

**The solution:** Use `Camera.screenToWorld()` (built in LAB-69) to convert the click's screen coordinates into world coordinates first, then run hit-testing entirely in world space, against the same undistorted shape data used for rendering. Hit-testing never needs to know about zoom or pan at all — it just answers "is this world point inside this world shape," a purely geometric question.

**Canonical example:**

```typescript
function pick(shapes: Shape[], screenPoint: Vector2, camera: Camera, canvasW: number, canvasH: number): Shape | null {
  const worldPoint = camera.screenToWorld(screenPoint, canvasW, canvasH)
  for (const shape of shapes) {
    if (hitTest(shape, worldPoint)) return shape
  }
  return null
}
```

**Project Application:** LAB-78's G-code backplotter renders toolpaths inside this exact viewport — pan/zoom/hit-test all reused unchanged, only the shape data (parsed G-code moves) is new.

**Watch for:** Hit-testing against screen-space shape coordinates instead of world-space. It "works" at the default zoom (where world and screen coordinates happen to be close) and then silently breaks the moment the user zooms or pans — a bug that's invisible until someone actually uses the pan/zoom you built.

## Step 1: World-space shapes and the viewport camera

```typescript
import { Vector2 } from "../module-01-math/LAB-67-vectors"
import { Camera } from "../module-01-math/LAB-69-coordinate-systems"

type CadShape =
  | { kind: "circle"; center: Vector2; radius: number; selected: boolean }
  | { kind: "rect"; topLeft: Vector2; width: number; height: number; selected: boolean }
  | { kind: "line"; from: Vector2; to: Vector2; selected: boolean }

const shapes: CadShape[] = [
  { kind: "rect", topLeft: new Vector2(0, 0), width: 100, height: 60, selected: false },
  { kind: "circle", center: new Vector2(50, 30), radius: 10, selected: false },
  { kind: "line", from: new Vector2(0, 0), to: new Vector2(100, 60), selected: false },
]

const camera = new Camera(0, 0, 4) // zoom 4x so millimeter-scale geometry is visible on screen
```

All coordinates here are millimeters, not pixels — a 100-wide rectangle is 100mm, and `camera.zoom = 4` is what makes 100mm span 400 screen pixels. This separation is exactly why LAB-69 built `Camera` as a distinct thing from the shape data: the shapes don't know or care what zoom level they're being viewed at.

### SAVE AND TRY

Render `shapes` through `camera.getMatrix()` (reusing LAB-71's `projectShape`) at `zoom = 4`, then again at `zoom = 1`. The rectangle visually shrinks to a quarter of its screen size — while `shapes[0].width` is still exactly `100` in the array, unchanged. Confirms the camera, not the data, controls what's on screen.

## Step 2: Pan and zoom from user input

```typescript
function setupPanZoom(canvas: HTMLCanvasElement, camera: Camera, render: () => void) {
  let isDragging = false
  let lastMouse = new Vector2(0, 0)

  canvas.addEventListener("mousedown", (event) => {
    isDragging = true
    lastMouse = new Vector2(event.clientX, event.clientY)
  })

  canvas.addEventListener("mousemove", (event) => {
    if (!isDragging) return
    const current = new Vector2(event.clientX, event.clientY)
    const screenDelta = current.subtract(lastMouse)
    // convert screen-pixel drag distance into world units, so pan speed matches zoom level
    camera.panX += screenDelta.x / camera.zoom
    camera.panY -= screenDelta.y / camera.zoom // world-Y grows upward (LAB-69), screen-Y grows downward
    lastMouse = current
    render()
  })

  canvas.addEventListener("mouseup", () => { isDragging = false })

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault()
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9
    camera.zoom = Math.max(0.1, Math.min(50, camera.zoom * zoomFactor))
    render()
  })
}
```

Dividing the screen-pixel drag distance by `camera.zoom` keeps pan speed visually consistent — a 10-pixel mouse drag should move the world the same *apparent* amount whether zoomed in or out, meaning it must correspond to fewer world units when zoomed in (everything's bigger on screen) and more world units when zoomed out.

### SAVE AND TRY

Call `setupPanZoom` on a live canvas, zoom in heavily (scroll up many times), then drag slowly. Motion should feel proportionally the same as dragging at default zoom — if `screenDelta` weren't divided by `zoom`, dragging at high zoom would send the camera flying across the world for a tiny mouse movement, since a screen-pixel would then represent far more world distance than intended relative to what's visible.

## Step 3: Hit-testing in world space

```typescript
function hitTestCircle(shape: Extract<CadShape, { kind: "circle" }>, worldPoint: Vector2): boolean {
  return worldPoint.subtract(shape.center).magnitude() <= shape.radius
}

function hitTestRect(shape: Extract<CadShape, { kind: "rect" }>, worldPoint: Vector2): boolean {
  return (
    worldPoint.x >= shape.topLeft.x &&
    worldPoint.x <= shape.topLeft.x + shape.width &&
    worldPoint.y >= shape.topLeft.y &&
    worldPoint.y <= shape.topLeft.y + shape.height
  )
}

function hitTestLine(shape: Extract<CadShape, { kind: "line" }>, worldPoint: Vector2, tolerance = 2): boolean {
  const lineVec = shape.to.subtract(shape.from)
  const lineLength = lineVec.magnitude()
  const t = Math.max(0, Math.min(1, worldPoint.subtract(shape.from).dot(lineVec) / (lineLength * lineLength)))
  const closestPoint = shape.from.add(lineVec.scale(t))
  return worldPoint.subtract(closestPoint).magnitude() <= tolerance
}

function hitTest(shape: CadShape, worldPoint: Vector2): boolean {
  switch (shape.kind) {
    case "circle": return hitTestCircle(shape, worldPoint)
    case "rect": return hitTestRect(shape, worldPoint)
    case "line": return hitTestLine(shape, worldPoint)
  }
}
```

Circle hit-testing (LAB-67's `magnitude`, reused directly) is a single distance comparison — cheap and exact. Line hit-testing needs `tolerance` because a mathematically zero-width line is nearly impossible to click exactly — `t` (LAB-67's `dot`, used to project the click onto the line) finds the closest point *on the segment* (clamped to `[0,1]` so it doesn't hit-test the infinite line the segment lies on), and `tolerance` gives that point a small clickable radius. A polygon would need each edge tested this way, or a more general point-in-polygon algorithm — meaningfully more code than a circle, which is why the concept section calls circles "cheap" and arbitrary polygons "harder."

### SAVE AND TRY

Call `hitTest(shapes[1], new Vector2(50, 30))` (dead center of the circle) — `true`. Call it with `new Vector2(65, 30))` (5mm outside a 10mm-radius circle centered at x=50) — `false`. Confirms the boundary is exactly at `radius`, not off by a pixel-derived fudge factor.

## Step 4: Wiring picking through the camera

```typescript
function pick(allShapes: CadShape[], screenPoint: Vector2, camera: Camera, canvasW: number, canvasH: number): CadShape | null {
  const worldPoint = camera.screenToWorld(screenPoint, canvasW, canvasH)
  for (const shape of allShapes) {
    if (hitTest(shape, worldPoint)) return shape
  }
  return null
}

function setupSelection(canvas: HTMLCanvasElement, allShapes: CadShape[], camera: Camera, render: () => void) {
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect()
    const screenPoint = new Vector2(event.clientX - rect.left, event.clientY - rect.top)
    const clicked = pick(allShapes, screenPoint, camera, canvas.width, canvas.height)

    for (const shape of allShapes) shape.selected = false
    if (clicked) clicked.selected = true
    render()
  })
}
```

`camera.screenToWorld` is the same method LAB-69 wrote and proved via round-trip — this lab is its first real caller. Every shape's `selected` flag is cleared before applying the new selection, so clicking empty space deselects everything (a common CAD UX expectation this lab is deliberately building in).

### SAVE AND TRY

Pan and zoom the viewport arbitrarily (Step 2), then click directly on the circle's visual position on screen. It should highlight (its `selected` becomes `true` and, assuming `render()` draws selected shapes differently — e.g. outlined in yellow), regardless of the current pan/zoom — proving the screen-to-world conversion correctly compensates for whatever camera state is active, not just the default one.

## 🎯 Challenge

Add a `measureDistance(shapeA, shapeB)` readout: when two shapes are both selected (shift-click to multi-select), display the distance in millimeters between their centers (or nearest points, for the rectangle/line cases if you want to go further) — a real CAD-viewer feature, and a natural use of LAB-67's `Vector2.subtract().magnitude()`.

<details>
<summary>Solution</summary>

```typescript
function shapeCenter(shape: CadShape): Vector2 {
  switch (shape.kind) {
    case "circle": return shape.center
    case "rect": return new Vector2(shape.topLeft.x + shape.width / 2, shape.topLeft.y + shape.height / 2)
    case "line": return shape.from.add(shape.to).scale(0.5)
  }
}

function measureDistance(shapeA: CadShape, shapeB: CadShape): number {
  return shapeCenter(shapeB).subtract(shapeCenter(shapeA)).magnitude()
}

function setupMultiSelectMeasure(canvas: HTMLCanvasElement, allShapes: CadShape[], camera: Camera, render: () => void) {
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect()
    const screenPoint = new Vector2(event.clientX - rect.left, event.clientY - rect.top)
    const clicked = pick(allShapes, screenPoint, camera, canvas.width, canvas.height)
    if (!clicked) return

    if (!event.shiftKey) for (const shape of allShapes) shape.selected = false
    clicked.selected = !clicked.selected

    const selected = allShapes.filter(s => s.selected)
    if (selected.length === 2) {
      console.log(`Distance: ${measureDistance(selected[0], selected[1]).toFixed(2)}mm`)
    }
    render()
  })
}
```

`shapeCenter` normalizes all three shape kinds down to one `Vector2`, so `measureDistance` doesn't need a switch of its own — the same "reduce to a common representation" instinct LAB-71's `Shape` union relied on for drawing.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Where geometry lives | Screen pixels | World units (millimeters), independent of zoom |
| Panning | Move each shape's coordinates | Move the camera; shapes stay fixed |
| Hit-testing | Compare click's screen pixel to shape's screen pixel | Convert click to world space first, hit-test in world space |
| Line clicking | Require an exact pixel-perfect hit | Use a small `tolerance` around the segment |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why convert a click to world space before hit-testing, instead of hit-testing in screen space? | |
| 2 | Why divide pan distance by `camera.zoom` when converting a mouse drag to a pan delta? | |
| 3 | Why does line hit-testing need a `tolerance`, but circle hit-testing doesn't? | |

## Quick Check Answers

1. You need to convert the screen pixel into the same coordinate space the shape data is defined in (world space via `camera.screenToWorld`), so the comparison is apples-to-apples regardless of the current pan/zoom.
2. Hit-testing a circle is one distance-to-center comparison against a known radius; an arbitrary polygon needs point-in-polygon logic or per-edge testing, since there's no single "center and radius" shortcut for irregular shapes.
3. Because shapes are described once in world coordinates and only converted to screen pixels at render time (via the camera matrix) — panning and zooming change the camera's transform, not the shape data itself, so the same shapes render correctly at any camera state.

*Next: [LAB-78 — G-code Backplotter](LAB-78-gcode-backplotter.md)*
