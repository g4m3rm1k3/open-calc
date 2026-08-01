# SE Masterclass — LAB-72 — Painter's Algorithm

**Prerequisites:** LAB-71 (2D Renderer)

## Quick Check

Before starting, answer these (answers at the bottom):

1. If two overlapping shapes are drawn in the wrong order, what visually goes wrong?
2. Why is sorting by "depth" (a z-value) more flexible than sorting by "insertion order"?
3. What's the failure case the painter's algorithm can't handle, even with correct sorting?

## What You Will Build

A scene of overlapping circles that all share a `z` value, sorted and drawn back-to-front — reordering `z` at runtime visibly changes which circle appears "on top," with no change to draw call code.

```
Before sort: [z=3, z=1, z=5, z=2]  →  drawn in random overlap order (WRONG)
After sort:  [z=1, z=2, z=3, z=5]  →  drawn back-to-front (CORRECT — highest z always wins overlaps)
```

## Concept: Painter's Algorithm

**What it is:** Named after how a painter physically works — background first, then midground, then foreground, each layer covering parts of the one before it. In rendering, it means: sort every shape by depth (farthest first), then draw them in that order. Whatever's drawn last visually wins any overlap, because its pixels are painted over everything already there.

**The problem before:** LAB-71's layered rendering (Step 4) hardcoded three fixed passes — background, world, HUD — which works when layers are known in advance. But within the "world" layer itself, LAB-71 drew shapes in whatever order the array happened to list them. That's fine for non-overlapping shapes, but the moment two circles overlap, draw order silently becomes "whichever one the array lists last," with no connection to which one should actually appear in front.

**The solution:** Give every shape a depth value (`z`), sort the array by that value before drawing, and let the sort — not array order — control what's on top. This turns "what's in front" from an accident of array construction into an explicit, queryable property of the scene.

**Canonical example:**

```typescript
function paintersAlgorithm(ctx: CanvasRenderingContext2D, shapes: DepthShape[]) {
  const sorted = [...shapes].sort((a, b) => a.z - b.z)
  for (const shape of sorted) drawShape(ctx, shape)
}
```

**Project Application:** LAB-76's physics sandbox needs falling objects to occlude each other correctly regardless of simulation order. LAB-77's CAD viewer needs a coherent front-to-back stacking for overlapping parts. Both build directly on the depth-sort here.

**Watch for:** Mutating the original array with `.sort()` (it sorts in place and returns the same reference) instead of copying first — this quietly reorders the caller's scene data as a side effect of what should be a read-only render operation.

## Step 1: The problem, made visible

```typescript
import { Vector2 } from "../module-01-math/LAB-67-vectors"

interface DepthShape {
  center: Vector2
  radius: number
  color: string
  z: number
}

const scene: DepthShape[] = [
  { center: new Vector2(150, 100), radius: 40, color: "red",   z: 3 },
  { center: new Vector2(170, 110), radius: 40, color: "green", z: 1 },
  { center: new Vector2(190, 100), radius: 40, color: "blue",  z: 2 },
]

function drawUnsorted(ctx: CanvasRenderingContext2D, shapes: DepthShape[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const shape of shapes) {
    ctx.beginPath()
    ctx.arc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI * 2)
    ctx.fillStyle = shape.color
    ctx.fill()
  }
}
```

### SAVE AND TRY

Run `drawUnsorted(ctx, scene)`. The red circle (`z=3`, should be frontmost) is drawn *first* and gets covered by green and blue, which are drawn after it despite having lower `z`. The `z` values exist as data, but nothing reads them — array order alone decided what's visible. Visually, the "wrong" shape appears in front, contradicting the scene's own depth data.

## Step 2: Sort before draw

```typescript
function paintersAlgorithm(ctx: CanvasRenderingContext2D, shapes: DepthShape[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  const sortedByDepth = [...shapes].sort((a, b) => a.z - b.z)
  for (const shape of sortedByDepth) {
    ctx.beginPath()
    ctx.arc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI * 2)
    ctx.fillStyle = shape.color
    ctx.fill()
  }
}
```

`[...shapes]` copies the array before sorting — `Array.sort` mutates in place, and the caller's `scene` array shouldn't change as a side effect of rendering it. `(a, b) => a.z - b.z` sorts ascending, so lowest `z` (farthest away) is drawn first, highest `z` (closest) drawn last — and last-drawn wins overlaps.

### SAVE AND TRY

Run `paintersAlgorithm(ctx, scene)` on the same `scene` from Step 1. Now red (`z=3`) is on top, exactly matching its depth value — reorder the array's declaration order arbitrarily and the visual result stays identical, because sorting, not array position, now controls what's in front.

## Step 3: Depth as a live, changeable property

Because depth is just a number on each shape, it can change at runtime — a classic "bring to front" interaction (LAB-38's node editor needed the same thing: dragging a node should visually raise it above others).

```typescript
function bringToFront(shapes: DepthShape[], target: DepthShape) {
  const maxZ = Math.max(...shapes.map(s => s.z))
  target.z = maxZ + 1
}
```

### SAVE AND TRY

Call `bringToFront(scene, scene[1])` (the green circle, originally `z=1`, currently the back-most) then re-run `paintersAlgorithm(ctx, scene)`. Green now covers both red and blue — its `z` became the new maximum, with zero changes to array order or draw logic. The sort alone propagates the change.

## Step 4: Where painter's algorithm breaks

Sort-by-depth assumes every shape has one single, consistent depth relative to every other shape. That assumption fails when two shapes mutually overlap in depth — imagine two intersecting planes, where part of A is in front of B and another part of B is in front of A. No single `z` value per shape can represent that; sorting the two shapes puts one entirely in front of the other, which is wrong for part of the intersection.

```typescript
// Two shapes that visually interpenetrate can't be correctly ordered by one z each:
const shapeA: DepthShape = { center: new Vector2(100, 100), radius: 50, color: "red", z: 1 }
const shapeB: DepthShape = { center: new Vector2(130, 100), radius: 50, color: "blue", z: 2 }
// shapeB (z=2) is drawn fully in front of shapeA — correct for a real 3D object like
// two separate spheres, but wrong if these represented, say, two intersecting flat
// panels that should partially occlude each other in BOTH directions at once.
```

This is a real, named limitation (not a bug in this lab's code) — 3D engines solve it with per-pixel depth testing (a z-buffer) instead of per-object sorting, which is out of scope here but worth knowing the algorithm's ceiling.

### SAVE AND TRY

For the 2D shapes this curriculum draws (circles, rects, polygons that don't literally interpenetrate in 3D), painter's algorithm is sufficient and correct — confirm this by drawing several overlapping-but-not-interpenetrating circles at different `z` values and verifying every pairwise overlap looks correct. There's nothing to "fix" here; the point is recognizing where the technique's assumptions hold.

## 🎯 Challenge

Combine this with LAB-71's layered rendering: draw a background layer (no sorting, no camera), then a world layer of `DepthShape[]` sorted and drawn via `paintersAlgorithm` through the camera transform, then an HUD layer (no sorting, no camera) — so depth sorting only applies within the middle layer, not across all three.

<details>
<summary>Solution</summary>

```typescript
import { Camera } from "../module-01-math/LAB-69-coordinate-systems"

function renderFullScene(
  ctx: CanvasRenderingContext2D,
  background: DepthShape[],
  worldShapes: DepthShape[],
  hud: DepthShape[],
  camera: Camera
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  for (const shape of background) drawDepthShape(ctx, shape)

  const cameraMatrix = camera.getMatrix(ctx.canvas.width, ctx.canvas.height)
  const sortedWorld = [...worldShapes].sort((a, b) => a.z - b.z)
  for (const shape of sortedWorld) {
    const projected = { ...shape, center: cameraMatrix.apply(shape.center) }
    drawDepthShape(ctx, projected)
  }

  for (const shape of hud) drawDepthShape(ctx, shape)
}

function drawDepthShape(ctx: CanvasRenderingContext2D, shape: DepthShape) {
  ctx.beginPath()
  ctx.arc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI * 2)
  ctx.fillStyle = shape.color
  ctx.fill()
}
```

Background and HUD stay in their own fixed passes — sorting them by `z` would be meaningless since they're not competing for the same depth space as world objects. Only the world layer, where objects genuinely occlude each other, gets sorted.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| What's "on top" | Whatever's last in the array | Whatever has the highest `z` |
| Sorting | Sort the original array in place | Copy first, then sort (`[...shapes].sort(...)`) |
| "Bring to front" | Move the item in the array | Set its `z` above the current max |
| Algorithm's limits | Assume it handles all 3D cases | Per-object depth fails for interpenetrating geometry |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why sort by `z` instead of relying on array order? | |
| 2 | Why copy the array before sorting instead of sorting in place? | |
| 3 | What kind of overlapping geometry can painter's algorithm not correctly render? | |

## Quick Check Answers

1. The shape drawn later overwrites pixels from the shape drawn earlier, so wrong order makes a "farther" shape visually cover a "nearer" one.
2. Depth-sorting is a property you can compute, update, and query independent of how shapes happen to be listed or created — array-order sorting has no explicit, inspectable rule at all.
3. Two shapes that mutually interpenetrate — part of A in front of B and part of B in front of A simultaneously — since one `z` value per shape can't represent a relationship that varies across the shape's own surface.

*Next: [LAB-73 — Physics Fundamentals](../module-03-simulation/LAB-73-physics-fundamentals.md)*
