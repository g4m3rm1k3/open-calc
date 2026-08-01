# SE Masterclass — LAB-71 — 2D Renderer

**Prerequisites:** LAB-70 (Render Loops)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What does "immediate mode" mean, as opposed to "retained mode" (like the DOM in LAB-29)?
2. Why call `ctx.clearRect()` at the start of every frame instead of only drawing new things?
3. What does `ctx.save()` / `ctx.restore()` protect you from?

## What You Will Build

A small drawing library — `drawCircle`, `drawRect`, `drawLine`, `drawText` — wrapping the Canvas 2D API, plus a scene made of shapes described as plain data and rendered fresh every frame using LAB-70's loop and LAB-69's `Camera`.

```
Scene: 3 circles, 1 rectangle, 1 line — redrawn 60 times/second
Each frame: clear canvas → draw background → draw world objects → draw HUD text
```

## Concept: Immediate-Mode Rendering

**What it is:** In immediate mode, there is no persistent scene graph. Every frame, you issue a fresh sequence of draw calls — "draw a circle here, draw a rectangle there" — and the canvas forgets all of it the instant the next frame clears it. Compare to the DOM (LAB-29), which is **retained mode**: you create a `<div>` once, and it persists until you explicitly remove it.

**The problem before:** LAB-29 through LAB-43 built an entire reactive framework around the idea that the DOM retains state — you create nodes once, then patch them (LAB-36's virtual DOM diffing exists specifically to avoid re-creating everything every frame, because DOM node creation is expensive). Canvas has no such retained structure. If you try to apply DOM habits — "create the circle once, update its position" — there's nothing to update. A canvas pixel doesn't know it used to be a circle.

**The solution:** Embrace redrawing everything, every frame. This sounds wasteful compared to DOM patching, but it isn't — canvas pixel operations are cheap, GPU-accelerated, and "draw 500 circles" is a non-issue at 60fps. The mental model inverts: instead of "what changed since last frame, patch just that," it's "here's the current state, draw all of it, discard it, repeat." This is simpler in exactly the way LAB-31's manual DOM sync was *not* simple.

**Canonical example:**

```typescript
function renderFrame(ctx: CanvasRenderingContext2D, shapes: Shape[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const shape of shapes) drawShape(ctx, shape)
}
```

**Project Application:** Everything drawn for the rest of Phase 6 — the physics sandbox (LAB-76), the CAD viewer (LAB-77), the G-code backplotter (LAB-78) — goes through this renderer. LAB-72 (Painter's Algorithm) builds directly on the `drawShape` dispatch built here.

**Watch for:** Forgetting `ctx.clearRect()`. Skip it and every frame draws on top of the last — trails and smears accumulate instead of clean motion. This is the canvas equivalent of forgetting to unmount a DOM node.

## Step 1: Wrapping the primitives

Canvas exposes low-level, mutable-context drawing — you set `ctx.fillStyle`, then call `ctx.fill()`, and the two calls are separated from the shape's data by several lines. Wrap each primitive as a pure function taking data in, so shapes stay describable without a canvas present (useful for testing, and for LAB-77's CAD viewer which needs to serialize shapes to disk).

```typescript
import { Vector2 } from "../module-01-math/LAB-67-vectors"

function drawCircle(ctx: CanvasRenderingContext2D, center: Vector2, radius: number, color: string) {
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

function drawRect(ctx: CanvasRenderingContext2D, topLeft: Vector2, width: number, height: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(topLeft.x, topLeft.y, width, height)
}

function drawLine(ctx: CanvasRenderingContext2D, from: Vector2, to: Vector2, color: string, lineWidth = 1) {
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

function drawText(ctx: CanvasRenderingContext2D, text: string, position: Vector2, color = "black") {
  ctx.fillStyle = color
  ctx.font = "14px monospace"
  ctx.fillText(text, position.x, position.y)
}
```

### SAVE AND TRY

Call `drawCircle(ctx, new Vector2(100, 100), 30, "red")` directly in the console with no loop running. It draws once and sits there — canvas content persists until something clears or overdraws it. Now call it again with a different position. Both circles are visible: nothing "moved," because canvas has no concept of the first circle still existing as an object.

## Step 2: Shapes as data, not draw calls

Hardcoding draw calls means the scene *is* the code. Instead, describe the scene as plain data — a discriminated union, exactly like LAB-11's AST nodes or LAB-63's query plan — and write one dispatcher that turns data into pixels.

```typescript
type Shape =
  | { kind: "circle"; center: Vector2; radius: number; color: string }
  | { kind: "rect"; topLeft: Vector2; width: number; height: number; color: string }
  | { kind: "line"; from: Vector2; to: Vector2; color: string }
  | { kind: "text"; text: string; position: Vector2; color?: string }

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return drawCircle(ctx, shape.center, shape.radius, shape.color)
    case "rect":
      return drawRect(ctx, shape.topLeft, shape.width, shape.height, shape.color)
    case "line":
      return drawLine(ctx, shape.from, shape.to, shape.color)
    case "text":
      return drawText(ctx, shape.text, shape.position, shape.color)
  }
}

function renderScene(ctx: CanvasRenderingContext2D, shapes: Shape[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const shape of shapes) drawShape(ctx, shape)
}
```

Now the scene is just an array you can build, filter, sort, or generate from a simulation's state — `renderScene` doesn't care where the shapes came from.

### SAVE AND TRY

Build a scene array of 5 circles at random positions and call `renderScene(ctx, scene)` inside LAB-70's `tick`. Change one circle's `radius` between frames — since the whole scene redraws every frame from the current data, the change appears instantly with no patching logic required.

## Step 3: World space through the camera

Feeding `drawShape` raw pixel coordinates ties every shape to the screen. Route positions through LAB-69's `Camera.getMatrix()` first, so shapes are described in **world space** (meters, game units, whatever the domain calls for) and only converted to pixels at the last possible moment.

```typescript
import { Camera } from "../module-01-math/LAB-69-coordinate-systems"

function renderWorldScene(
  ctx: CanvasRenderingContext2D,
  worldShapes: Shape[],
  camera: Camera
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  const cameraMatrix = camera.getMatrix(ctx.canvas.width, ctx.canvas.height)

  for (const shape of worldShapes) {
    const screenShape = projectShape(shape, cameraMatrix)
    drawShape(ctx, screenShape)
  }
}

function projectShape(shape: Shape, matrix: ReturnType<Camera["getMatrix"]>): Shape {
  switch (shape.kind) {
    case "circle":
      return { ...shape, center: matrix.apply(shape.center), radius: shape.radius * matrix.m[0] }
    case "rect":
      return { ...shape, topLeft: matrix.apply(shape.topLeft) }
    case "line":
      return { ...shape, from: matrix.apply(shape.from), to: matrix.apply(shape.to) }
    case "text":
      return { ...shape, position: matrix.apply(shape.position) }
  }
}
```

Zoom the camera in `Camera` and every shape scales and repositions together, without any shape's own data changing — the exact separation LAB-69 built the `Camera` class for.

### SAVE AND TRY

Define a scene entirely in world coordinates (e.g., a circle at world `(0, 0)` — the origin) and render it through `renderWorldScene`. Change `camera.zoom` from `1` to `2` between two console calls — the circle's screen radius and position both change, driven entirely by the matrix, with the shape's own `radius` and `center` untouched.

## Step 4: Layered rendering

Real scenes have layers that shouldn't interleave: a static background, world objects that move with the camera, and HUD text that must stay fixed on screen regardless of zoom/pan. Render them as three separate passes.

```typescript
function renderLayered(
  ctx: CanvasRenderingContext2D,
  background: Shape[],
  worldShapes: Shape[],
  hud: Shape[],
  camera: Camera
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  for (const shape of background) drawShape(ctx, shape) // fixed, no camera transform

  const cameraMatrix = camera.getMatrix(ctx.canvas.width, ctx.canvas.height)
  for (const shape of worldShapes) drawShape(ctx, projectShape(shape, cameraMatrix))

  for (const shape of hud) drawShape(ctx, shape) // fixed, no camera transform — always on top
}
```

Background never moves (sky, grid). World shapes move with the camera. HUD (score, FPS counter from LAB-70's challenge) never moves and is always drawn last, so it's always on top. This three-pass structure is exactly what LAB-72 formalizes as the painter's algorithm.

### SAVE AND TRY

Pan the camera (change `camera.panX`) and confirm only the middle layer shifts — background stays put, HUD stays put, world objects slide. If HUD text is drawn *before* world shapes instead of after, a large world shape can cover it — reorder the calls and watch the HUD disappear behind it, then fix it back.

## 🎯 Challenge

Add a `drawPolygon(ctx, points: Vector2[], color: string)` primitive and a `"polygon"` shape variant, so `projectShape` and `drawShape` both handle it. Use it to draw a simple triangle spaceship shape in world space, and confirm it rotates correctly by composing a rotation into the shape's own points before projecting (not via the camera).

<details>
<summary>Solution</summary>

```typescript
function drawPolygon(ctx: CanvasRenderingContext2D, points: Vector2[], color: string) {
  if (points.length === 0) return
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (const point of points.slice(1)) ctx.lineTo(point.x, point.y)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

// add to the Shape union:
// | { kind: "polygon"; points: Vector2[]; color: string }

// add to drawShape:
// case "polygon": return drawPolygon(ctx, shape.points, shape.color)

// add to projectShape:
// case "polygon": return { ...shape, points: shape.points.map(p => matrix.apply(p)) }

import { Matrix3 } from "../module-01-math/LAB-68-matrices-transforms"

function makeShip(center: Vector2, headingRadians: number): Shape {
  const localPoints = [new Vector2(0, -10), new Vector2(6, 8), new Vector2(-6, 8)]
  const rotation = Matrix3.rotation(headingRadians)
  const translation = Matrix3.translation(center.x, center.y)
  const worldMatrix = translation.multiply(rotation)
  return { kind: "polygon", points: localPoints.map(p => worldMatrix.apply(p)), color: "cyan" }
}
```

The ship's points are defined once around a local origin, then `Matrix3.rotation` and `Matrix3.translation` (LAB-68) place it in world space — the same composition trick `Camera.getMatrix` used, one level down.

</details>

## Mental Model

| Concept | DOM (retained mode) | Canvas (immediate mode) |
|---|---|---|
| Persistence | Nodes exist until removed | Nothing persists past the frame |
| Update strategy | Patch just what changed (LAB-36) | Redraw everything, every frame |
| Where state lives | In the DOM tree itself | In your own data structures |
| Coordinate handling | CSS pixels, browser-managed | You control every transform (LAB-69) |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why redraw the whole scene every frame instead of patching changed shapes? | |
| 2 | Why describe shapes as data instead of calling `ctx.fill()` directly? | |
| 3 | Why does HUD get drawn last in the layered render? | |

## Quick Check Answers

1. Immediate mode issues fresh draw calls every frame with nothing retained afterward; retained mode (the DOM) keeps persistent nodes you mutate in place.
2. Without clearing, every frame's draw calls stack on top of the previous frame's pixels — motion becomes a smear instead of clean movement.
3. `save()`/`restore()` push and pop the canvas's style/transform state, so temporary changes (a rotation, a fillStyle) inside one draw call don't leak into unrelated draw calls that follow.

*Next: [LAB-72 — Painter's Algorithm](LAB-72-painters-algorithm.md)*
