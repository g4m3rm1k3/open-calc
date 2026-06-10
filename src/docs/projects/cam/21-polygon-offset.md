# CAD/CAM — Lesson 21 — Polygon Offset

## What You Will Build

Select a closed polygon sketch and click "Offset." A new curve appears inside the
original polygon, uniformly inset by the selected tool's radius. Convex corners
(the majority in a typical part outline) produce a mitered vertex — the two inset
edges meet at their intersection point. The offset polygon is displayed in the
viewport in cyan. Clicking "Offset" again with a different tool selected updates the
display. The offset polygon is the path the tool centre must follow for the edge of
the tool to trace the part boundary exactly.

## What You Need to Know First

Lessons 01–20. Lesson 07 covered 2D geometry and parametric lines. Lesson 10 covered
vectors: direction, normalisation, the dot product. Lesson 20 introduced `CuttingTool`
and `toolRadius`. This lesson derives all maths from first principles using vectors —
no prior knowledge of polygon offset is required.

---

## The Problem

A 6mm end mill has a radius of 3mm. If the tool centre follows the part boundary,
the tool's cutting edge removes 3mm of material on each side — material that should
remain. To machine the exact profile, the tool centre must be offset inward from each
edge by 3mm, perpendicular to the edge. At corners where two edges meet, the two
offset edges must be connected.

This is the **polygon offset problem**. It appears in every CAM system, PCB
design tool, packaging design tool, and font rendering engine — any application that
computes buffered regions around geometry.

There are two corner cases:

1. **Convex corner** (the polygon turns outward — the interior angle is less than
   180°): the two offset edges diverge when extended. Their intersection gives the
   correct offset vertex. This is called a **mitered joint**.

2. **Concave corner** (the polygon turns inward — the interior angle is greater than
   180°): the two offset edges cross each other. The intersection still gives the
   mathematically correct offset vertex, though at large offsets relative to the
   corner's tightness the result degenerates. Production offsetters add arc fillets
   at concave corners; this learning implementation uses the intersection for all
   corners.

---

## Step 1 — 2D Vector Mathematics

### The problem

Polygon offset requires: perpendicular directions, unit vectors, line-line
intersection. We build a small focused module of 2D vector operations. Every function
is a pure function returning a new `Vec2` — none of them mutate their arguments.

### Create `src/cam/vec2.ts`

```typescript
export interface Vec2 {
  x: number
  y: number
}

export function vec2(x: number, y: number): Vec2 {
  return { x, y }
}

export function subtract(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function scale(vector: Vec2, factor: number): Vec2 {
  return { x: vector.x * factor, y: vector.y * factor }
}

export function length(vector: Vec2): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
}

export function normalise(vector: Vec2): Vec2 {
  const magnitude = length(vector)
  if (magnitude === 0) return { x: 0, y: 0 }
  return { x: vector.x / magnitude, y: vector.y / magnitude }
}

export function cross2d(a: Vec2, b: Vec2): number {
  return a.x * b.y - a.y * b.x
}

export function inwardPerpendicular(edgeStart: Vec2, edgeEnd: Vec2): Vec2 {
  const direction = subtract(edgeEnd, edgeStart)
  return normalise({ x: -direction.y, y: direction.x })
}
```

**Each function — what it computes and why it exists:**

`vec2(x, y)` — a **factory function** that constructs a `Vec2`. `{ x: 3, y: 4 }` is
valid JavaScript, but `vec2(3, 4)` reads better in arithmetic-heavy code. This is the
**factory pattern**: a function that creates and returns an object, giving callers a
readable interface without `new`.

`subtract(a, b)` — `a − b` componentwise. Used to compute edge direction vectors:
`edgeDirection = subtract(edgeEnd, edgeStart)`.

`add(a, b)` — `a + b` componentwise. Used to displace a point by a vector: the offset
point on an edge is `add(pointOnEdge, scale(inwardUnit, offsetDistance))`.

`scale(vector, factor)` — multiply every component by `factor`. Converts a unit vector
to a vector of a specific length: `scale(inwardUnit, toolRadius)` gives the
displacement needed to move a point from the edge to the offset edge.

`length(vector)` — the Euclidean length: `√(x² + y²)`. This is the **magnitude** of
the vector. Geometrically, it is the distance from the origin to the point `(x, y)`.

`normalise(vector)` — divide by length to produce a unit vector (length exactly 1).
A unit vector encodes **direction only**, with no magnitude. The guard
`if (magnitude === 0) return { x: 0, y: 0 }` handles degenerate edges (two
coincident vertices) without producing `NaN` from dividing by zero.

`cross2d(a, b)` — the **2D pseudo-cross product**: `a.x × b.y − a.y × b.x`. This
is the Z component of the 3D cross product of two vectors embedded in 3D with `z=0`.
It is a signed scalar:
- Positive: `b` is counterclockwise from `a`
- Negative: `b` is clockwise from `a`
- Zero: `a` and `b` are parallel (same or opposite directions)

`inwardPerpendicular(edgeStart, edgeEnd)` — computes the unit vector pointing inward
perpendicular to the edge, for counterclockwise-wound polygons.

### The maths — why `(-dy, dx)` is inward for CCW polygons

For a counterclockwise polygon, the interior is always to the **left** of the
direction of travel along the boundary.

Given edge direction `d̂ = (dx, dy)` (a unit vector along the edge):

- 90° **counterclockwise** rotation of `(dx, dy)` = `(-dy, dx)` → points **left** → points inward
- 90° **clockwise** rotation of `(dx, dy)` = `(dy, -dx)` → points **right** → points outward

The formula `{ x: -direction.y, y: direction.x }` is the 90° CCW rotation — the
inward direction for a CCW polygon.

**Verification on a square:**
Square vertices CCW: `(0,0) → (20,0) → (20,20) → (0,20)`.

- Edge `(0,0) → (20,0)`: direction `(1,0)`. CCW rotation: `(-0,1) = (0,1)`. Points
  upward — into the square interior. ✓
- Edge `(20,0) → (20,20)`: direction `(0,1)`. CCW rotation: `(-1,0)`. Points leftward
  — into the square interior. ✓

**CS lens — immutable data:**
Every function returns a new `Vec2` without modifying its arguments. This is the
**immutable data** pattern. JavaScript objects are references — you could write
`a.x = ...` inside `add` and modify the caller's object. Choosing not to means:
any `Vec2` can be passed to any function and the caller knows it will be unchanged.
This eliminates a class of bugs where shared references cause unexpected mutations.

---

## Step 2 — Line-Line Intersection

### The maths — how two lines are represented and intersected

An **infinite line** passing through point `P` in direction `D` can be written as:
```
L(t) = P + t × D    for any real number t
```
`t = 0` gives `P`. `t = 1` gives `P + D`. Negative `t` extends the line in the
opposite direction.

Given two lines:
```
Line₁: A + t × D₁
Line₂: B + s × D₂
```
We want the value of `t` where they meet. Setting them equal:
```
A + t × D₁ = B + s × D₂
```
Taking the 2D cross product of both sides with `D₂` (the cross product of `D₂` with
itself is zero, eliminating `s`):
```
(A + t × D₁) × D₂ = B × D₂
A × D₂ + t × (D₁ × D₂) = B × D₂
t = (B × D₂ − A × D₂) / (D₁ × D₂)
t = ((B − A) × D₂) / (D₁ × D₂)
```
The intersection point is `A + t × D₁`.

If `D₁ × D₂ = 0`, the lines are parallel and never intersect (or are the same line —
infinitely many intersections). In polygon offset, parallel adjacent edges mean the
corner is a straight continuation — the offset edge at the corner is simply the
displaced point.

---

## Step 3 — The Offset Function

### Create `src/cam/polygonOffset.ts`

```typescript
import type { Vec2 } from './vec2.js'
import {
  subtract,
  add,
  scale,
  cross2d,
  inwardPerpendicular,
} from './vec2.js'
```

**Import explanation:**
`vec2.ts` owns all 2D vector operations. We import only the five functions we need.
`inwardPerpendicular` gives us the offset direction for each edge. `subtract` computes
edge direction vectors. `add` and `scale` displace points. `cross2d` handles the
line-line intersection denominator.

```typescript
export function offsetPolygon(
  vertices:      Vec2[],
  offsetDistance: number,
): Vec2[] {
  const vertexCount = vertices.length
  if (vertexCount < 3) return []

  const offsetVertices: Vec2[] = []

  for (let index = 0; index < vertexCount; index++) {
    const previousVertex = vertices[(index - 1 + vertexCount) % vertexCount]
    const currentVertex  = vertices[index]
    const nextVertex     = vertices[(index + 1) % vertexCount]

    const incomingPerpUnit = inwardPerpendicular(previousVertex, currentVertex)
    const outgoingPerpUnit = inwardPerpendicular(currentVertex,  nextVertex)

    const offsetAlongIncoming = add(
      currentVertex,
      scale(incomingPerpUnit, offsetDistance),
    )
    const incomingEdgeDirection = subtract(currentVertex, previousVertex)

    const offsetAlongOutgoing = add(
      currentVertex,
      scale(outgoingPerpUnit, offsetDistance),
    )
    const outgoingEdgeDirection = subtract(nextVertex, currentVertex)

    const denominator = cross2d(incomingEdgeDirection, outgoingEdgeDirection)

    if (Math.abs(denominator) < 1e-10) {
      offsetVertices.push(offsetAlongIncoming)
    } else {
      const difference = subtract(offsetAlongOutgoing, offsetAlongIncoming)
      const parameter  = cross2d(difference, outgoingEdgeDirection) / denominator
      const intersection = add(
        offsetAlongIncoming,
        scale(incomingEdgeDirection, parameter),
      )
      offsetVertices.push(intersection)
    }
  }

  return offsetVertices
}
```

**`(index - 1 + vertexCount) % vertexCount` — wrapping array index:**
For vertex 0, the previous vertex is the last vertex (`vertexCount - 1`). Subtracting
1 from index 0 gives `-1`, which is an invalid array index. Adding `vertexCount`
before taking modulo ensures the result is always non-negative: `(-1 + 5) % 5 = 4`.
This wraps the polygon from first vertex back to last.

**The three key steps for each vertex:**
For each vertex `currentVertex` at index `index`:

1. Compute the **inward unit perpendicular** for the incoming edge (`previous → current`)
   and for the outgoing edge (`current → next`).

2. Displace `currentVertex` along each perpendicular by `offsetDistance` to get a
   point on each offset line — `offsetAlongIncoming` and `offsetAlongOutgoing`.

3. Find where the two offset lines intersect using the formula derived above. That
   intersection is the offset vertex.

**Why the intersection works at both convex and concave corners:**
At a convex corner, the two offset edges diverge — extending them backward finds the
intersection behind the corner. The formula gives the correct mitered vertex regardless
of whether the corner is convex or concave.

At a concave corner with a large offset, the intersection may fall outside the polygon
— the offset curve self-intersects. Production polygon offsetters detect and trim
self-intersections (the **Minkowski sum** approach). This implementation does not,
which is acceptable for the learning context; the G-code preview will show the
crossing, alerting the operator.

**`Math.abs(denominator) < 1e-10` — the parallel-edges guard:**
`1e-10` is scientific notation for `10⁻¹⁰ = 0.0000000001`. When `denominator` is
close to zero, the edges are nearly parallel — division by a near-zero number produces
an enormous (or infinite) `parameter`, placing the intersection far from the polygon.
In practice, nearly parallel adjacent edges in a sketch are straight-line continuations:
the offset vertex should just be the point displaced along the incoming edge. Using
`offsetAlongIncoming` is the correct fallback.

**Walkthrough — offsetting a 20×20 square by 3mm:**
Vertices CCW: `A=(0,0)`, `B=(20,0)`, `C=(20,20)`, `D=(0,20)`. Offset = 3.

At vertex `B=(20,0)` (index 1):
- `previousVertex = A=(0,0)`, `nextVertex = C=(20,20)`
- Incoming edge `A→B`: direction `(20,0)`. Inward perp: `(0,1)`.
  `offsetAlongIncoming = (20,0) + 3×(0,1) = (20,3)`. Direction: `(20,0)`.
- Outgoing edge `B→C`: direction `(0,20)`. Inward perp: `(-1,0)`.
  `offsetAlongOutgoing = (20,0) + 3×(-1,0) = (17,0)`. Direction: `(0,20)`.
- `denominator = cross2d((20,0), (0,20)) = 20×20 − 0×0 = 400`
- `difference = (17,0) − (20,3) = (-3,-3)`
- `parameter = cross2d((-3,-3), (0,20)) / 400 = ((-3×20) − (-3×0)) / 400 = -60/400 = -0.15`
- `intersection = (20,3) + (-0.15)×(20,0) = (20−3, 3) = (17,3)`

The offset vertex at the `(20,0)` corner is `(17,3)` — 3mm inward in X and 3mm
upward in Y. The resulting offset square has corners at `(3,3)`, `(17,3)`, `(17,17)`,
`(3,17)` — a 14×14 square inset by 3mm on every side. Correct. ✓

---

## Step 4 — Tests

### Create `src/cam/polygonOffset.test.ts`

```typescript
import { describe, test, expect } from 'vitest'
import { offsetPolygon }           from './polygonOffset.js'
import type { Vec2 }               from './vec2.js'

const square: Vec2[] = [
  { x: 0,  y: 0  },
  { x: 20, y: 0  },
  { x: 20, y: 20 },
  { x: 0,  y: 20 },
]

describe('offsetPolygon', () => {
  test('returns same vertex count as input', () => {
    const result = offsetPolygon(square, 3)
    expect(result).toHaveLength(4)
  })

  test('offsets a square inward by the correct amount', () => {
    const result = offsetPolygon(square, 3)
    expect(result[0].x).toBeCloseTo(3)
    expect(result[0].y).toBeCloseTo(3)
    expect(result[1].x).toBeCloseTo(17)
    expect(result[1].y).toBeCloseTo(3)
    expect(result[2].x).toBeCloseTo(17)
    expect(result[2].y).toBeCloseTo(17)
    expect(result[3].x).toBeCloseTo(3)
    expect(result[3].y).toBeCloseTo(17)
  })

  test('returns empty array for degenerate polygon', () => {
    expect(offsetPolygon([{ x: 0, y: 0 }, { x: 1, y: 0 }], 1)).toHaveLength(0)
  })

  test('larger offset produces smaller polygon', () => {
    const result5 = offsetPolygon(square, 5)
    const result3 = offsetPolygon(square, 3)
    expect(result5[0].x).toBeGreaterThan(result3[0].x)
  })
})
```

**`toBeCloseTo` — first appearance:**
Floating-point arithmetic accumulates small rounding errors. `expect(x).toBe(3)` would
fail if `x = 2.9999999999` due to a rounding error, even though the computation is
correct. `toBeCloseTo(3)` by default checks that the value is within `10⁻²` — close
enough for geometry. Use `toBeCloseTo` for any test involving floating-point maths.
Use `toBe` for integers and exact string matches.

Run `npm test`. All four tests pass.

---

## Step 5 — Displaying the Offset in the Viewport

### The problem

The offset polygon must be visible in the Three.js scene. We convert the `Vec2[]`
result to a Three.js `Line` object and add it to the scene in cyan, overlaying the
original sketch.

### Create `src/cam/offsetRenderer.ts`

```typescript
import * as THREE    from 'three'
import type { Vec2 } from './vec2.js'

const COLOUR_OFFSET = new THREE.Color(0x22d3ee) // cyan-400
const Y_ELEVATION   = 0.01                       // raise above grid to prevent z-fighting
```

**Z-fighting — first appearance:**
**Z-fighting** is a rendering artefact where two coplanar surfaces flicker between
each other. The GPU's depth buffer stores one depth value per pixel. When two surfaces
are at exactly the same depth, the GPU alternates between them frame to frame based on
floating-point rounding, producing flickering. The offset polygon and the grid are
both at `y = 0` in Three.js. Raising the offset by `0.01` Three.js units (0.01mm)
places it just above the grid, eliminating z-fighting without visibly changing the
diagram.

```typescript
export function buildOffsetLine(
  offsetVertices: Vec2[],
  scene:          THREE.Scene,
): THREE.Line {
  const points: THREE.Vector3[] = offsetVertices.map(
    (vertex) => new THREE.Vector3(vertex.x, Y_ELEVATION, -vertex.y),
  )

  if (points.length > 0) {
    points.push(points[0].clone())
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: COLOUR_OFFSET })
  const line     = new THREE.Line(geometry, material)

  scene.add(line)
  return line
}
```

**`points.push(points[0].clone())` — closing the polygon:**
`THREE.Line` draws a continuous polyline through all points. To close the polygon —
draw the final edge from the last vertex back to the first — we append a copy of the
first point. `points[0].clone()` creates a new `THREE.Vector3` with the same values.
We need a clone, not the same reference, because the geometry buffer stores separate
values for each point.

**`THREE.Vector3` — in this context:**
`new THREE.Vector3(x, y, z)` creates a Three.js 3D point. The coordinate remapping
follows lesson 19: G-code X → Three.js X, G-code Y → Three.js negative-Z (the
ground plane in Three.js uses X and Z, with Y as up). The `Y_ELEVATION` raises the
line above the grid to prevent z-fighting.

**`BufferGeometry.setFromPoints(points)` — first appearance:**
`setFromPoints` is a convenience method that builds a `BufferGeometry` from an array
of `THREE.Vector3` objects, setting the position attribute automatically. It is
equivalent to the manual `setAttribute('position', new Float32BufferAttribute(...))` 
from lesson 19, but accepts the Three.js object format rather than raw numbers.

**`THREE.Line` vs `THREE.LineSegments`:**
`THREE.Line` (used here) connects each point to the next in a continuous polyline —
correct for a closed polygon outline. `THREE.LineSegments` (used in lesson 19)
connects pairs of points as disconnected segments — correct for the toolpath where
each segment has independent start/end points. The difference: `LineSegments` treats
vertices 0-1 as segment 0, 2-3 as segment 1. `Line` treats vertices 0,1,2,3 as a
continuous path.

---

## Connect the Pieces

The polygon offset pipeline is:

```
Closed sketch vertices (Vec2[])
  ──► offsetPolygon(vertices, toolRadius(selectedTool))
  ──► offset vertices (Vec2[])
  ──► buildOffsetLine(offsetVertices, scene)
  ──► THREE.Line in the viewport
```

`offsetPolygon` is called with `toolRadius(selectedTool)` from lesson 20. The sketch
vertices come from the sketch model built in lessons 07–09. The offset result feeds
directly into the contour toolpath generator in lesson 22 — which samples the offset
vertices to produce G-code motion blocks.

This lesson's `Vec2` type and vector operations are the foundation for all subsequent
CAM geometry. Lesson 22 uses `subtract` for edge direction, lesson 23 uses `length`
to verify drill cycle positions. Once the abstraction is built, all geometry computes
on `Vec2` without Three.js involvement — the Three.js code is confined to renderer
modules.

---

## What Breaks Without This

**Without the inward perpendicular direction:**
If the perpendicular points outward instead of inward, the offset polygon is larger
than the original — the tool would remove material outside the part, not inside it.
The machined part would be undersize. This is a common off-by-one direction error
in manual CAM implementations.

**Without the parallel-edges guard (`Math.abs(denominator) < 1e-10`):**
Two straight adjacent edges at exactly 180° (a U-shape with parallel arms) produce
`denominator = 0`. Division produces `Infinity`. `Infinity × edgeDirection` gives
`(Infinity, Infinity)` — the offset vertex flies off to infinity. Three.js would
attempt to draw a line of infinite length, producing no visible output and potential
crashes in the geometry pipeline. The guard falls back to `offsetAlongIncoming`,
which places the vertex on the offset edge — correct for parallel edges.

**Without closing the polygon with `points[0].clone()`:**
The offset outline is missing its final edge — the line from the last vertex back to
the first. The polygon appears open. Visually this looks like a cut in the outline.
In the contour toolpath (lesson 22), the missing edge means the tool lifts before
completing the last side of the profile.

---

## Definition of Done

- [ ] `npm test` passes all four tests in `polygonOffset.test.ts`
- [ ] Selecting a tool and clicking "Offset" displays a cyan inset polygon in the viewport
- [ ] The inset distance visually matches the selected tool's radius
- [ ] The offset polygon closes correctly (no gap between last and first vertex)
- [ ] A nearly-parallel edge pair does not produce a vertex at infinity
- [ ] You can explain why the 90° CCW rotation of an edge direction points inward for CCW polygons
- [ ] You can derive the line-line intersection formula from the 2D cross product
- [ ] You can explain z-fighting and why the 0.01 elevation prevents it
- [ ] You can explain what `toBeCloseTo` does and when to use it instead of `toBe`
- [ ] You can explain the difference between `THREE.Line` and `THREE.LineSegments`
- [ ] Run:
      ```
      git add src/cam/
      git commit -m "Add polygon offset: 2D vector module, inward perpendicular derivation, mitered-joint corner resolution with line-line intersection"
      ```

---

*Next: Lesson 22 — Contour Toolpath. The offset polygon becomes a sequence of G-code
motion blocks: rapid to clearance height, rapid over the start point, plunge to cut
depth, cut each edge of the offset polygon, retract. The toolpath appears in the
viewport overlaid on the offset curve and the original sketch.*
