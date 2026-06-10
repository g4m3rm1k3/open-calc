# CAD/CAM — Lesson 05 — Raycasting and Selection

## What You Will Build

Clicking the box selects it. A selected box shows highlighted edges in white over
its coloured faces. Clicking empty space deselects. The properties panel shows the
word "Selected" above the properties when the box is selected, and "No selection"
when it is not. The status bar updates with the cursor's approximate 3D position
as the mouse moves over the grid.

## What You Need to Know First

Lessons 01–04. The box exists with a complete transform. This lesson adds hit-testing
(determining which object the user clicked) and the selection state that drives
visual feedback.

---

## The Problem

The user clicks a pixel on the screen. The viewport is a flat 2D image of a 3D scene.
How does the application know which 3D object was clicked?

The answer: cast a **ray** from the camera through the clicked pixel into the scene.
The ray is a half-line: it starts at the camera position and extends through the
clicked pixel into the depth of the scene. The first 3D object the ray intersects
is the clicked object.

This technique is called **raycasting**, and it is the universal approach for mouse
interaction in 3D viewports — used in game engines, CAD tools, medical imaging
software, and every 3D application that allows clicking objects.

---

## Step 1 — Maths: Parametric Rays and Ray-Triangle Intersection

### Parametric ray

A ray is defined by an origin point `O` and a direction vector `D`:

```
P(t) = O + t × D      where t ≥ 0
```

At `t = 0`, the ray is at the origin. As `t` increases, `P(t)` moves along the
direction `D`. Every point along the ray corresponds to a unique value of `t`.

The clicked pixel, projected from screen space into 3D space, gives a point on the
**near plane** of the camera frustum. The direction from the camera to that point
is `D`. The camera position is `O`. Three.js's `Raycaster` computes `O` and `D`
from the mouse position and camera automatically.

### Ray-plane intersection

To find where a ray hits the XZ plane (y=0, the grid), solve for `t` where
`P(t).y = 0`:

```
O.y + t × D.y = 0
t = -O.y / D.y       (valid when D.y ≠ 0)
```

Then the intersection point is `P(t) = O + t × D`.

### Möller–Trumbore ray-triangle intersection

A 3D mesh is made of triangles. Raycasting a mesh means testing each triangle.
The **Möller–Trumbore algorithm** (1997) finds whether a ray intersects a triangle
and — if so — where. It is the fastest known algorithm for this test and is used
in Three.js, game engines, and ray tracing renderers.

Given a ray `P(t) = O + t×D` and a triangle with vertices `V0`, `V1`, `V2`:

```
edge1 = V1 - V0
edge2 = V2 - V0
h     = D × edge2          (cross product)
a     = edge1 · h          (dot product)
```

If `|a| < ε` (near zero), the ray is parallel to the triangle — no intersection.

```
f = 1 / a
s = O - V0
u = f × (s · h)
```

If `u < 0` or `u > 1`, the intersection is outside the triangle.

```
q = s × edge1
v = f × (D · q)
```

If `v < 0` or `u + v > 1`, outside the triangle.

```
t = f × (edge2 · q)
```

If `t > ε`, there is an intersection at `P(t)`.

You do not need to implement this — Three.js's `Raycaster` calls it for every
triangle in every mesh. But knowing what it computes is essential for understanding
why raycasting a dense mesh is expensive (each triangle requires one Möller–Trumbore
test) and why lesson 13 introduces a BVH (bounding volume hierarchy) to accelerate
it.

**CS lens — the cross product:**
`D × edge2` is the **cross product** of two vectors. In 3D, the cross product of
`A = (ax, ay, az)` and `B = (bx, by, bz)` is a third vector perpendicular to both:

```
A × B = (ay·bz - az·by,  az·bx - ax·bz,  ax·by - ay·bx)
```

The cross product appears in 3D geometry wherever perpendicularity is needed:
computing face normals (a normal is perpendicular to the triangle's edges), detecting
backfaces, and in the Möller–Trumbore algorithm to test if a point is inside a
triangle.

The **dot product** `A · B = ax·bx + ay·by + az·bz` gives the cosine of the angle
between two vectors (scaled by their magnitudes). It is used here to project vectors
onto each other — a key step in the barycentric coordinate test.

---

## Step 2 — Selection State in React

### The problem

Selection is application-level state: it affects the viewport (which box is highlighted)
and the properties panel (what is displayed). It must live in `App`, shared between
`ViewportComponent` and `PropertiesPanel`.

### Update `src/App.tsx`

Add selection state:

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null)
```

**`string | null` — nullable state:**
`selectedId` is either the `id` of the selected object or `null` (nothing selected).
`null` is the explicit representation of "nothing selected" — not an empty string,
not `-1`, not `undefined`. TypeScript enforces that every code path that reads
`selectedId` handles the `null` case.

Pass to children:

```tsx
<ViewportComponent
  box={box}
  selectedId={selectedId}
  onSelect={setSelectedId}
/>
<PropertiesPanel
  box={box}
  onBoxChange={setBox}
  selectedId={selectedId}
/>
```

---

## Step 3 — The Raycaster

### Create `src/viewport/raycaster.ts`

```typescript
import * as THREE from 'three'
```

**`import * as THREE from 'three'`:**
`three` is the Three.js library (lesson 01). `Raycaster` and `Vector2` are needed
here to cast rays and represent normalised device coordinates.

```typescript
export interface RaycastHit {
  objectId: string
  point:    THREE.Vector3
  distance: number
}

export function screenToNDC(
  screenX:      number,
  screenY:      number,
  canvasWidth:  number,
  canvasHeight: number,
): THREE.Vector2 {
  return new THREE.Vector2(
     (screenX / canvasWidth)  * 2 - 1,
    -(screenY / canvasHeight) * 2 + 1,
  )
}
```

**What `src/viewport/raycaster.ts` is:**
`raycaster.ts` owns the hit-testing logic. It does not know about React state or
which objects are in the scene. It takes a set of meshes and a camera and returns
hits. The caller decides what to do with the result.

**Normalised Device Coordinates (NDC):**
The Three.js `Raycaster` expects the mouse position in **NDC** (Normalised Device
Coordinates): a coordinate system where the screen centre is `(0, 0)`, the top-left
is `(-1, 1)`, and the bottom-right is `(1, -1)`.

Converting from screen pixels to NDC:
```
ndcX =  (screenX / canvasWidth)  * 2 - 1
ndcY = -(screenY / canvasHeight) * 2 + 1   (Y is flipped: screen Y down, NDC Y up)
```

The Y axis is negated because screen coordinates increase downward (origin at
top-left) while NDC Y increases upward (origin at centre).

```typescript
export function castRay(
  ndcPosition:  THREE.Vector2,
  camera:       THREE.PerspectiveCamera,
  meshes:       THREE.Mesh[],
  idMap:        Map<THREE.Mesh, string>,
): RaycastHit | null {
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(ndcPosition, camera)

  const intersections = raycaster.intersectObjects(meshes, false)

  if (intersections.length === 0) return null

  const firstHit = intersections[0]!
  const hitMesh  = firstHit.object as THREE.Mesh
  const objectId = idMap.get(hitMesh)

  if (objectId === undefined) return null

  return {
    objectId,
    point:    firstHit.point,
    distance: firstHit.distance,
  }
}
```

**`THREE.Raycaster` — first appearance:**
`Raycaster` encapsulates the ray-casting process. `setFromCamera(ndc, camera)` computes
the ray origin and direction from the NDC position and the camera's current position
and orientation. `intersectObjects(meshes, recursive)` runs Möller–Trumbore against
every triangle in every mesh and returns an array of intersections sorted by distance
(closest first). The second argument `false` means "do not recurse into children" —
the meshes passed are the exact objects to test, not their children.

**`Map<THREE.Mesh, string>` — first appearance:**
`Map<K, V>` is a JavaScript built-in key-value store. Unlike a plain object
(`Record<string, V>`), a `Map` can use any type as a key — including object
references. `Map<THREE.Mesh, string>` maps Three.js mesh objects to their data model
IDs. When a raycast returns a `THREE.Mesh`, looking it up in the map gives the
corresponding `id` string from `BoxObject`.

Why not store the ID directly on the mesh? Three.js's `Object3D.userData` property
allows attaching arbitrary data to meshes. We could write
`mesh.userData['id'] = boxId`. This works, but it couples the scene management code
to the Three.js API — the ID lookup is hidden in an untyped property. Using a `Map`
with typed keys is explicit, type-safe, and does not require reading Three.js
internal properties.

```typescript
export function castRayToPlane(
  ndcPosition: THREE.Vector2,
  camera:      THREE.PerspectiveCamera,
  planeY:      number,
): THREE.Vector3 | null {
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(ndcPosition, camera)

  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY)
  const intersection = new THREE.Vector3()

  const hit = raycaster.ray.intersectPlane(groundPlane, intersection)
  return hit
}
```

**`THREE.Plane` — first appearance:**
`new THREE.Plane(normal, constant)` defines an infinite plane by its normal vector
and a scalar constant. The plane equation is `normal · point + constant = 0`. For
the XZ plane at `y = planeY`: normal is `(0, 1, 0)` (pointing up), constant is
`-planeY`. `raycaster.ray.intersectPlane(plane, target)` computes the intersection
point and writes it into `target`. Returns `null` if the ray is parallel to the plane.

---

## Step 4 — Wiring Selection in ViewportComponent

### Update `src/components/ViewportComponent.tsx`

Add imports and prop types:

```tsx
import { screenToNDC, castRay, castRayToPlane } from '../viewport/raycaster.js'
```

**`import { screenToNDC, castRay, castRayToPlane } from '../viewport/raycaster.js'`:**
`viewport/raycaster.ts` owns the hit-testing logic (this lesson). We import all three
functions because `ViewportComponent` uses all three: `castRay` for object selection,
`castRayToPlane` for cursor position on the grid, and `screenToNDC` for the
coordinate conversion needed by both.

Update props interface:

```typescript
interface ViewportComponentProps {
  box:        BoxObject
  selectedId: string | null
  onSelect:   (id: string | null) => void
}
```

Add to the viewport initialisation `useEffect`:

```tsx
const meshIdMap = new Map<THREE.Mesh, string>()

// After creating the box mesh:
meshIdMap.set(mesh, box.id)
```

Add click and mouse-move handlers inside the same `useEffect`:

```tsx
function handleClick(event: MouseEvent): void {
  const viewport = viewportRef.current
  if (viewport === null) return

  const ndcPosition = screenToNDC(
    event.offsetX,
    event.offsetY,
    container.clientWidth,
    container.clientHeight,
  )

  const hit = castRay(
    ndcPosition,
    viewport.camera,
    [meshRef.current!],
    meshIdMap,
  )

  onSelect(hit === null ? null : hit.objectId)
}

function handleMouseMove(event: MouseEvent): void {
  const viewport = viewportRef.current
  if (viewport === null) return

  const ndcPosition = screenToNDC(
    event.offsetX,
    event.offsetY,
    container.clientWidth,
    container.clientHeight,
  )

  const worldPosition = castRayToPlane(ndcPosition, viewport.camera, 0)
  if (worldPosition !== null) {
    onCursorMove?.(worldPosition)
  }
}

container.addEventListener('click', handleClick)
container.addEventListener('mousemove', handleMouseMove)
```

Add cleanup:

```tsx
return () => {
  container.removeEventListener('click', handleClick)
  container.removeEventListener('mousemove', handleMouseMove)
  geometry.dispose()
  material.dispose()
  viewport.dispose()
}
```

**`event.offsetX` and `event.offsetY`:**
`offsetX` and `offsetY` give the mouse position relative to the element that fired
the event — in this case, the canvas. This is correct for the NDC conversion, which
needs position relative to the canvas, not to the page. `clientX`/`clientY` would
give position relative to the browser viewport — wrong if the canvas does not start
at the top-left of the page.

**Edge highlight for selected state:**
Add a selection `useEffect`:

```tsx
useEffect(() => {
  const mesh = meshRef.current
  if (mesh === null) return

  // Remove existing edge highlight
  const existingEdges = mesh.getObjectByName('edges')
  if (existingEdges !== undefined) mesh.remove(existingEdges)

  if (selectedId === box.id) {
    const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry)
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
    const edgeLines     = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    edgeLines.name      = 'edges'
    mesh.add(edgeLines)
  }
}, [selectedId, box.id])
```

**`THREE.EdgesGeometry` — first appearance:**
`EdgesGeometry` computes the edges of a geometry — the line segments at the
boundaries between faces. For a box, this is the 12 edges. The resulting geometry
is used with `THREE.LineSegments` (a mesh variant that draws line pairs rather than
filled triangles) to draw the wireframe outline.

`edgeLines.name = 'edges'` assigns a name to the object. `mesh.getObjectByName('edges')`
searches the mesh's children for an object with that name, enabling removal of the
old highlight before adding a new one.

**`mesh.add(edgeLines)`:**
Adding `edgeLines` as a child of `mesh` means the edges inherit the mesh's transform.
When the box moves or rotates, the edge lines move with it automatically — this is
the scene graph hierarchy (lesson 01) in action.

---

## Step 5 — Update the Properties Panel and Status Bar

### Update `src/components/PropertiesPanel.tsx`

Add `selectedId` to props:

```tsx
interface PropertiesPanelProps {
  box:         BoxObject
  onBoxChange: (updatedBox: BoxObject) => void
  selectedId:  string | null
}
```

Show selection state at the top:

```tsx
return (
  <aside className="properties-panel">
    {selectedId === box.id ? (
      <p className="selection-badge selected">Selected</p>
    ) : (
      <p className="selection-badge">No selection</p>
    )}
    {/* ...existing transform sections... */}
  </aside>
)
```

**`{selectedId === box.id ? (...) : (...)}` — conditional rendering:**
JSX expressions inside `{}` can be any JavaScript expression. The ternary operator
here chooses which `<p>` to render based on whether the box is selected. When
`selectedId === box.id`, the "Selected" badge appears. Otherwise, "No selection"
appears. React renders exactly one of the two paths.

### Update `src/components/StatusBar.tsx`

```tsx
import { useState, useCallback } from 'react'
import type { ViewportCursorPosition } from '../viewport/raycaster.js'
```

Actually — to pass cursor position from `ViewportComponent` to `StatusBar` cleanly,
add it through `App` state:

Add to `src/App.tsx`:

```tsx
const [cursorPosition, setCursorPosition] =
  useState<{ x: number; y: number; z: number } | null>(null)
```

Pass to components:

```tsx
<ViewportComponent
  box={box}
  selectedId={selectedId}
  onSelect={setSelectedId}
  onCursorMove={setCursorPosition}
/>
<StatusBar cursorPosition={cursorPosition} />
```

Update `src/components/StatusBar.tsx`:

```tsx
interface StatusBarProps {
  cursorPosition: { x: number; y: number; z: number } | null
}

export function StatusBar({ cursorPosition }: StatusBarProps): JSX.Element {
  function formatCoord(value: number): string {
    return value.toFixed(2).padStart(8)
  }

  return (
    <footer className="status-bar">
      <span>Ready</span>
      {cursorPosition !== null ? (
        <>
          <span>X: {formatCoord(cursorPosition.x)}</span>
          <span>Y: {formatCoord(cursorPosition.y)}</span>
          <span>Z: {formatCoord(cursorPosition.z)}</span>
        </>
      ) : (
        <>
          <span>X: —</span>
          <span>Y: —</span>
          <span>Z: —</span>
        </>
      )}
    </footer>
  )
}
```

**`toFixed(2)`:**
`number.toFixed(2)` formats a number with exactly 2 decimal places as a string.
`3.14159.toFixed(2)` → `'3.14'`. `0.5.toFixed(2)` → `'0.50'`. This gives
consistent coordinate display — the status bar width does not jump as the cursor moves.

**Performance — mouse move is a hot path:**
`handleMouseMove` runs on every mouse move event — potentially hundreds of times per
second. Each call fires `castRayToPlane`, calls `setState`, and triggers a React
re-render of `StatusBar`. For three coordinate spans, this re-render is fast. But
if the status bar ever grows complex, **throttling** the mouse event (updating state
at most 60 times per second) or using `useRef` instead of `useState` for cursor
coordinates would reduce re-render frequency. At the current scale, the simpler
approach is correct.

---

## Debugging: When Selection Does Not Work

**Symptom: clicking the box produces no selection**

The click event listener is attached to `container`, but the click coordinates are
wrong. Add a log:
```typescript
console.log('click offsetX:', event.offsetX, 'offsetY:', event.offsetY)
console.log('canvas size:', container.clientWidth, container.clientHeight)
```
Verify `offsetX` and `offsetY` are within the canvas bounds. If they are always
`(0, 0)` or the canvas size is `(0, 0)`, the container element has no dimensions
(CSS issue — see lesson 03's debugging for `clientWidth` returning 0).

**Symptom: `castRay` returns a hit but `objectId` is undefined**

The mesh was not added to `meshIdMap`. Verify `meshIdMap.set(mesh, box.id)` is called
after the mesh is created and before the click handler runs. Both should be inside
the same `useEffect`.

**Symptom: edge highlight does not appear after clicking**

The `useEffect` for edge highlighting has the wrong dependency. Verify
`[selectedId, box.id]` in the dependency array. If `selectedId` is the same type
but the wrong value, check that `onSelect(hit.objectId)` is passing the correct ID.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`castRay` returns a `THREE.Vector3` intersection point. In lesson 06 (sketch mode),
clicking a coordinate plane will use the same function to determine where on the
plane the user clicked — projecting that point to 2D sketch coordinates. In lesson 13
(face selection), `castRay` is extended to test against the mesh faces of extruded
solids. The function written here is not replaced — it is reused.

The `meshIdMap` pattern — mapping Three.js objects to application IDs — is the
bridge between the rendering layer and the data model. Every selectable object in
the scene will be registered in this map. Lesson 13 adds face entries; lesson 22 adds
toolpath curve entries.

---

## What Breaks Without This

**Without NDC conversion:**
Passing raw screen pixel coordinates to `raycaster.setFromCamera` is wrong — the
API expects NDC. Without conversion, the ray points in the wrong direction. Clicking
the centre of the canvas sends a ray at a random angle. Objects are never detected,
or the wrong objects are detected.

**Without removing the event listener in cleanup:**
When `ViewportComponent` unmounts (StrictMode double-mount in development), the old
click handler remains attached to the container. On the second mount, a second handler
is added. Both fire on every click. `onSelect` is called twice, alternating between
setting and unsetting the selection. The user sees erratic selection behaviour.

**Without `edgeLines.name = 'edges'`:**
On each selection state change, a new `EdgesGeometry` is created and added as a child
of the mesh, but the old one is never removed. After 10 selection/deselection cycles,
the mesh has 10 overlapping edge highlight objects. The GPU renders them all, wasting
resources. The solution is `mesh.getObjectByName('edges')` to remove the old one first.

---

## Definition of Done

- [ ] Clicking the box selects it — white edge highlight appears
- [ ] Clicking empty space deselects — highlight disappears
- [ ] Properties panel shows "Selected" badge when box is selected
- [ ] Status bar shows cursor coordinates (X, Y, Z) as the mouse moves over the grid
- [ ] Coordinates update in real time as the mouse moves
- [ ] Selection is preserved when the box's transform changes
- [ ] You can explain what a parametric ray is: `P(t) = O + t × D`
- [ ] You can explain what Möller–Trumbore does at a high level (cross product, barycentric coordinates)
- [ ] You can explain NDC and the conversion formula from screen pixels
- [ ] You can explain `Map<THREE.Mesh, string>` and why it is used instead of `userData`
- [ ] You can explain `EdgesGeometry` and why `edgeLines` is added as a child of the mesh
- [ ] You can explain conditional rendering in JSX with the ternary operator
- [ ] You can explain the performance concern with mouse-move events and what throttling means
- [ ] Run:
      ```
      git add src/
      git commit -m "Add raycasting selection: Möller-Trumbore via Three.js Raycaster, edge highlight on selected box, NDC conversion, cursor position in status bar"
      ```

---

*Next: Lesson 06 — Sketch Mode. Clicking a coordinate plane locks the camera to a
2D view. Drawing tools activate. A finite state machine governs the mode transitions.
Coordinate projection from 3D to 2D is derived.*
