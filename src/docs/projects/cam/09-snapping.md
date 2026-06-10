# CAD/CAM — Lesson 09 — Snapping

## What You Will Build

When drawing in sketch mode, the cursor snaps to existing line endpoints and circle
centres if the cursor is within a tolerance radius. A yellow dot appears at the snap
target. The cursor also snaps to horizontal and vertical extensions from the last
drawn point — a dotted guide line appears when the cursor is near horizontal or
vertical with any existing endpoint. Snap is a pre-processing step: it modifies the
cursor position before it is used for drawing or preview, and it is disabled by
holding Shift.

## What You Need to Know First

Lessons 01–08. Lines, circles, and arcs exist in the sketch. The cursor position is
computed by raycasting onto the sketch plane. This lesson intercepts that position
before it reaches the drawing tools.

---

## The Problem

CAD sketches require precision. A line must start exactly where the previous line
ended — not almost where it ended. Without snapping, the user must type exact
coordinates for every point, which is correct but slow. Snapping provides a
middle ground: for common cases (connecting to an existing point, drawing a
horizontal/vertical line), the snap mechanism provides the precise coordinate
automatically.

Snap must be **transparent to the drawing logic**: the drawing tools in lessons 07
and 08 should not need to know whether snap is active. The snap system transforms
the cursor position and passes the result down — the drawing tools see a potentially-
modified cursor position and use it.

This is the **pre-processing pipeline** pattern: a chain of steps that can each
modify an input before the final consumer sees it. The cursor position passes through
snap (which may modify it), then reaches the drawing tool. New steps can be inserted
into the chain without changing either end.

---

## Step 1 — Maths: Nearest-Neighbour Search and Angular Tolerance

### Nearest-neighbour search

Given a query point `Q` and a set of candidate points `P₀, P₁, ..., Pₙ`, find the
candidate closest to `Q` within a distance threshold `d_max`:

```
for each Pi:
    if distance(Q, Pi) < d_max and distance(Q, Pi) < best_distance:
        best = Pi
        best_distance = distance(Q, Pi)
return best (or null if no candidate was within threshold)
```

For `n` candidate points, this is O(n) — linear in the number of points. A sketch
with 100 elements has at most ~200 endpoints; O(n) linear search is fast enough that
optimisation (such as a k-d tree) is not needed until thousands of elements.

**CS lens — O(n) is acceptable when n is small:**
Big-O notation describes how cost scales as `n` grows. O(n) means cost doubles when
`n` doubles. For `n = 200`, a linear search is 200 comparisons — microseconds on
modern hardware. A k-d tree (O(log n)) reduces this to ~8 comparisons. For a sketch,
the complexity of a k-d tree is not worth the benefit. For a mesh with 100,000 points
(lesson 13's BVH), the speedup from O(n) to O(log n) is essential. Always evaluate
Big-O relative to the actual scale of `n`.

### Angular tolerance

To detect if the cursor is near horizontal with a reference point `A`, compute the
angle from `A` to the cursor `Q`:

```
θ = Math.atan2(Q.y - A.y, Q.x - A.x)
```

The cursor is "near horizontal" if `|θ|` is within `tolerance` radians of 0 or π.
`tolerance = 0.1` radians ≈ 5.7° works well for typical sketch use.

---

## Step 2 — The Snap Module

### Create `src/sketch/snap.ts`

Create directory `src/sketch/`:

```typescript
import type { Sketch, SketchPoint } from '../scene/sketch.js'
```

**What `src/sketch/` is:**
`sketch/` owns logic that operates on sketch data — snapping, constraint solving,
offset, toolpath generation. It is separate from `scene/` (which owns data types)
and from `viewport/` (which owns rendering). This directory grows in lessons 09–12.

```typescript
export const SNAP_PIXEL_TOLERANCE  = 12  // pixels
export const ANGLE_SNAP_TOLERANCE  = 0.1  // radians (~6°)

export interface SnapResult {
  snappedPoint: SketchPoint
  snapType:     'endpoint' | 'horizontal' | 'vertical' | 'none'
  referencePoint: SketchPoint | null
}

export function computeSnap(
  cursorPoint:     SketchPoint,
  sketch:          Sketch,
  lastPoint:       SketchPoint | null,
  pixelsPerUnit:   number,
): SnapResult {
  const worldTolerance = SNAP_PIXEL_TOLERANCE / pixelsPerUnit

  // Collect all snap candidates (endpoints and centres)
  const candidates: SketchPoint[] = []

  for (const line of sketch.lines) {
    candidates.push(line.start)
    candidates.push(line.end)
  }
  for (const circle of sketch.circles) {
    candidates.push(circle.centre)
  }
  for (const arc of sketch.arcs) {
    candidates.push(arc.centre)
  }

  // Find nearest candidate
  let nearestDistance = Infinity
  let nearestPoint: SketchPoint | null = null

  for (const candidate of candidates) {
    const distance = Math.hypot(
      cursorPoint.x - candidate.x,
      cursorPoint.y - candidate.y,
    )
    if (distance < worldTolerance && distance < nearestDistance) {
      nearestDistance = distance
      nearestPoint    = candidate
    }
  }

  if (nearestPoint !== null) {
    return {
      snappedPoint:   nearestPoint,
      snapType:       'endpoint',
      referencePoint: nearestPoint,
    }
  }

  // Angular snap to last drawn point
  if (lastPoint !== null) {
    const angle = Math.atan2(
      cursorPoint.y - lastPoint.y,
      cursorPoint.x - lastPoint.x,
    )
    const distance = Math.hypot(
      cursorPoint.x - lastPoint.x,
      cursorPoint.y - lastPoint.y,
    )

    const nearHorizontal =
      Math.abs(angle) < ANGLE_SNAP_TOLERANCE ||
      Math.abs(Math.abs(angle) - Math.PI) < ANGLE_SNAP_TOLERANCE

    const nearVertical =
      Math.abs(Math.abs(angle) - Math.PI / 2) < ANGLE_SNAP_TOLERANCE

    if (nearHorizontal) {
      return {
        snappedPoint:   { x: lastPoint.x + distance * Math.cos(0),        y: lastPoint.y },
        snapType:       'horizontal',
        referencePoint: lastPoint,
      }
    }

    if (nearVertical) {
      return {
        snappedPoint:   { x: lastPoint.x, y: lastPoint.y + distance * Math.sin(Math.PI / 2) },
        snapType:       'vertical',
        referencePoint: lastPoint,
      }
    }
  }

  return { snappedPoint: cursorPoint, snapType: 'none', referencePoint: null }
}
```

**`SNAP_PIXEL_TOLERANCE = 12` and `worldTolerance = pixelsPerUnit`:**
Snap tolerance is expressed in **screen pixels** (12px feels natural regardless of
sketch scale), but snap comparison happens in **world units** (sketch coordinates).
Converting: `worldTolerance = 12 / pixelsPerUnit`. `pixelsPerUnit` is computed
from the viewport and camera parameters — how many pixels correspond to one world unit.

Expressing tolerance in pixels is the correct UX choice: if the sketch is zoomed in
so 1mm = 100 pixels, snapping should still activate at 12 pixels — not 12mm. The
pixel tolerance is a user-experience constant; the world tolerance is derived from it.

**`Infinity` for nearest distance initialisation:**
`let nearestDistance = Infinity` initialises the best-found distance to positive
infinity, so the first candidate is always accepted (anything is closer than infinity).
This is a standard pattern for minimum-finding loops.

**Horizontal snap to exact direction:**
When `nearHorizontal` is true, the snapped point has the same Y as `lastPoint` and
an X computed from the distance. `Math.cos(0) = 1` (unit vector pointing right)
gives the direction. The sign is preserved by keeping the direction of `distance`:
if the cursor is to the left, `distance` is negative (x = lastPoint.x + distance * 1 < lastPoint.x). Wait — `Math.hypot` always returns positive. So for horizontal snap, the snapped X should be: `lastPoint.x + (cursorPoint.x - lastPoint.x)` truncated to Y = lastPoint.y. The simplest correct version:

```typescript
if (nearHorizontal) {
  return {
    snappedPoint:   { x: cursorPoint.x, y: lastPoint.y },
    snapType:       'horizontal',
    referencePoint: lastPoint,
  }
}
if (nearVertical) {
  return {
    snappedPoint:   { x: lastPoint.x, y: cursorPoint.y },
    snapType:       'vertical',
    referencePoint: lastPoint,
  }
}
```

Horizontal snap: keep cursor's X, force Y to `lastPoint.y`.
Vertical snap: force X to `lastPoint.x`, keep cursor's Y.

---

## Step 3 — Snap Indicator in the Viewport

### Update `src/viewport/sketchRenderer.ts`

```typescript
export function buildSnapIndicator(
  snapPoint: SketchPoint,
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(0.15, 8, 8)
  const material = new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  const sphere   = new THREE.Mesh(geometry, material)
  sphere.position.set(snapPoint.x, snapPoint.y, 0.01)
  sphere.name = 'snap-indicator'
  return sphere
}
```

**`THREE.SphereGeometry(radius, widthSegments, heightSegments)` — first appearance:**
`SphereGeometry` creates a UV sphere. The three arguments are radius, horizontal
segment count, and vertical segment count. For a 2D snap dot, 8×8 segments is
adequate. A higher segment count produces a rounder sphere at the cost of more
triangles.

**`z: 0.01` — Z-fighting prevention:**
The snap indicator sits 0.01 units above the sketch plane. Without this offset, the
dot's faces would occupy the same depth as the grid lines, causing **Z-fighting** —
flickering between the two surfaces as floating-point precision determines which one
the GPU renders on top. A small positive Z offset ensures the indicator always
renders above the grid. This technique is used in every 3D rendering system to
prevent overlapping coplanar surfaces.

**Snap indicator lifecycle:**
Add to `ViewportComponent` refs:
```tsx
const snapIndicatorRef = useRef<THREE.Mesh | null>(null)
```

In the mouse move handler, after `computeSnap`:
```tsx
// Remove old indicator
if (snapIndicatorRef.current !== null) {
  viewport.scene.remove(snapIndicatorRef.current)
  snapIndicatorRef.current = null
}

// Add new indicator if snapping
if (snapResult.snapType !== 'none') {
  const indicator = buildSnapIndicator(snapResult.snappedPoint)
  viewport.scene.add(indicator)
  snapIndicatorRef.current = indicator
}
```

Use `snapResult.snappedPoint` instead of the raw cursor position for drawing.

---

## Debugging: When Snap Does Not Activate

**Symptom: cursor never snaps to existing endpoints**

`worldTolerance` may be too small. Log `pixelsPerUnit` and verify the computation.
Also verify `candidates` is populated — check that `sketch.lines` is not empty when
drawing the second line.

**Symptom: snap activates at the wrong location**

The tolerance is in world units but the snap candidates are in sketch coordinates.
If there is a mismatch between the coordinate system used in the sketch and the
coordinate system used by the cursor, all distances are wrong. Verify both use the
same coordinate system (world XY coordinates, not normalised or pixel coordinates).

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`computeSnap` is a pure function: same input, same output. It is used in lesson 10
(constraints) to enforce that constraint endpoints match exactly. In lesson 22
(toolpath generation), the same endpoint-finding logic locates arc endpoints for
toolpath chaining.

The `pixelsPerUnit` parameter foreshadows lesson 17 (zoom): when the user zooms in,
`pixelsPerUnit` increases and the world-space snap tolerance decreases accordingly —
the same 12-pixel region covers less world space. Snap naturally becomes more
precise at higher zoom levels without any code changes.

---

## What Breaks Without This

**Without pixel-to-world tolerance conversion:**
Snap tolerance expressed in world units is scale-dependent. At 1:1 zoom, 12 world
units is reasonable. After zooming out to see a 1000mm part, 12mm is too aggressive —
almost every point snaps to everything. After zooming in to a 1mm feature, 12mm is
too large — snap activates from far away. Pixel-based tolerance gives consistent
behaviour at all zoom levels.

**Without Z offset on snap indicator:**
The yellow dot Z-fights with the grid, producing a flickering mess. The 0.01 offset
is not visible to the user but prevents the GPU from having to choose between two
surfaces at the same depth.

---

## Definition of Done

- [ ] Yellow dot appears when cursor is near an existing endpoint
- [ ] Cursor snaps to horizontal extension from the last point
- [ ] Cursor snaps to vertical extension from the last point
- [ ] Holding Shift disables snap for one point
- [ ] Snap indicator disappears when cursor moves away
- [ ] You can explain nearest-neighbour search and its O(n) complexity
- [ ] You can explain why snap tolerance is expressed in pixels and converted to world units
- [ ] You can explain Z-fighting and the 0.01 offset that prevents it
- [ ] Run:
      ```
      git add src/
      git commit -m "Add snapping: endpoint snap within pixel tolerance, horizontal/vertical angle snap, yellow indicator, pixel-to-world conversion"
      ```

---

*Next: Lesson 10 — Constraint Solving. Add a horizontal constraint — the line
adjusts to become exactly horizontal. Newton-Raphson solves the constraint system.
The Jacobian matrix is derived and explained.*
