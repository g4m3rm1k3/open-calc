# CAD/CAM — Lesson 13 — Face Selection

## What You Will Build

Hovering over a face of a 3D solid highlights it in a lighter colour. Clicking a
face selects it and shows its **face area** and **normal direction** in the properties
panel. The normal is displayed as a small arrow drawn on the face. Face selection
is the prerequisite for sketching on a face (lesson 14) and for selecting faces for
machining operations (lesson 22).

## What You Need to Know First

Lessons 01–12. The solid mesh exists in the scene. Raycasting (lesson 05) already
handles object selection; this lesson extends it to individual faces.

---

## The Problem

Raycasting in lesson 05 identified which object was clicked. For a solid with multiple
faces, we also need to know which face was clicked. Three.js's `Raycaster.intersectObjects`
returns not just the mesh but the `faceIndex` — the index of the intersected triangle.

The challenge: a complex solid mesh may have hundreds or thousands of faces. Testing
every face with Möller–Trumbore is O(n) per raycast. For large meshes, this is too
slow for hover events that fire on every mouse move.

The solution: a **Bounding Volume Hierarchy** (BVH) — a tree of axis-aligned bounding
boxes (AABBs) that groups faces into hierarchical regions. Instead of testing every
face, the BVH traverses the tree and quickly eliminates large groups of faces that
the ray does not touch.

---

## Step 1 — Maths: Bounding Volumes and the BVH

### Axis-Aligned Bounding Box (AABB)

An AABB is a rectangular box aligned with the world axes, defined by minimum and
maximum extents:

```
AABB = { xMin, xMax, yMin, yMax, zMin, zMax }
```

**Ray-AABB intersection** is fast — it tests three pairs of slab planes
(min/max for each axis) using the parametric ray equation:

```
t_enter = max( (xMin - O.x) / D.x,  (yMin - O.y) / D.y,  (zMin - O.z) / D.z )
t_exit  = min( (xMax - O.x) / D.x,  (yMax - O.y) / D.y,  (zMax - O.z) / D.z )
```

If `t_enter > t_exit`, the ray misses the box. This test requires 6 divisions and
3 comparisons — much cheaper than Möller–Trumbore (which involves multiple dot and
cross products for each triangle).

### The BVH structure

A BVH is a binary tree:
- **Leaf node**: contains a small group of faces (typically 1–8) and their bounding box
- **Interior node**: contains two child nodes and the bounding box of both children

**Traversal**: cast a ray against the root AABB. If the root is missed, zero faces
are tested. If hit, test both children. For each child that is hit, test its children.
Continue until leaf nodes. Test the actual faces in reached leaf nodes.

For a balanced BVH with `n` faces, traversal takes O(log n) time instead of O(n).
For 1000 faces, that is ~10 tests instead of 1000.

**CS lens — the BVH in production:**
Every major game engine (Unity, Unreal), ray tracing renderer (OptiX, Embree), and
CAD application (OpenCASCADE, OCCT) uses a BVH for ray-mesh intersection. The exact
construction algorithm varies (SAH — Surface Area Heuristic — is the production
standard), but the structure is the same. This lesson uses a simple median-split
BVH for clarity; lesson 22's toolpath generation will use Three.js's `MeshBVH` add-on
for production performance.

### Face area from vertices

The area of a triangle with vertices `A`, `B`, `C` is half the magnitude of the
cross product of two edge vectors:

```
area = |  (B - A) × (C - A)  | / 2
```

The cross product `(B - A) × (C - A)` has magnitude equal to the parallelogram area
formed by the two edges. Half of that is the triangle area.

For a face with `normalX, normalY, normalZ` already computed (lesson 12), the face
area can be computed directly from `|cross_product| / 2` using the vertices.

---

## Step 2 — Face Hit Data

### Update `src/scene/solid.ts`

```typescript
export interface FaceHit {
  solid:        Solid
  faceIndex:    number
  point:        { x: number; y: number; z: number }
  faceArea:     number
}

export function computeFaceArea(
  solid:     Solid,
  faceIndex: number,
): number {
  const face = solid.faces[faceIndex]
  if (face === undefined) return 0

  const vA = solid.vertices[face.vertexIndices[0]]!
  const vB = solid.vertices[face.vertexIndices[1]]!
  const vC = solid.vertices[face.vertexIndices[2]]!

  // Edge vectors
  const abX = vB.x - vA.x;  const abY = vB.y - vA.y;  const abZ = vB.z - vA.z
  const acX = vC.x - vA.x;  const acY = vC.y - vA.y;  const acZ = vC.z - vA.z

  // Cross product AB × AC
  const crossX = abY * acZ - abZ * acY
  const crossY = abZ * acX - abX * acZ
  const crossZ = abX * acY - abY * acX

  return Math.hypot(crossX, crossY, crossZ) / 2
}
```

---

## Step 3 — Face Raycasting

### Update `src/viewport/raycaster.ts`

```typescript
export function castRayForFace(
  ndcPosition: THREE.Vector2,
  camera:      THREE.PerspectiveCamera,
  solidMeshes: THREE.Mesh[],
  meshSolidMap: Map<THREE.Mesh, Solid>,
): FaceHit | null {
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(ndcPosition, camera)

  const intersections = raycaster.intersectObjects(solidMeshes, false)
  if (intersections.length === 0) return null

  const firstHit = intersections[0]!
  const mesh     = firstHit.object as THREE.Mesh
  const solid    = meshSolidMap.get(mesh)
  if (solid === undefined) return null

  const faceIndex = firstHit.faceIndex ?? 0
  const point     = firstHit.point

  return {
    solid,
    faceIndex,
    point:    { x: point.x, y: point.y, z: point.z },
    faceArea: computeFaceArea(solid, faceIndex),
  }
}
```

**`firstHit.faceIndex`:**
Three.js's `Intersection` object includes `faceIndex` — the index of the intersected
triangle in the geometry. For a non-indexed geometry (each triangle's vertices stored
separately), `faceIndex` is the triangle number (0 = first triangle, 1 = second, etc.).
For an indexed geometry, it refers to the index buffer.

---

## Step 4 — Face Highlight

Face highlighting uses a technique different from the object highlight (lesson 05).
Rather than adding edge lines, a semi-transparent overlay face is drawn:

```typescript
export function buildFaceHighlight(
  solid:     Solid,
  faceIndex: number,
  colour:    number,
): THREE.Mesh {
  const face = solid.faces[faceIndex]!
  const vertices = face.vertexIndices.map((index) => {
    const v = solid.vertices[index]!
    return new THREE.Vector3(v.x, v.y, v.z)
  })

  const geometry = new THREE.BufferGeometry().setFromPoints(vertices)
  geometry.setIndex([0, 1, 2])
  geometry.computeVertexNormals()

  const material = new THREE.MeshBasicMaterial({
    color:       colour,
    transparent: true,
    opacity:     0.3,
    side:        THREE.DoubleSide,
    depthWrite:  false,
  })

  const highlightMesh = new THREE.Mesh(geometry, material)
  highlightMesh.name  = 'face-highlight'
  highlightMesh.renderOrder = 1

  return highlightMesh
}
```

**`depthWrite: false`:**
Setting `depthWrite: false` prevents the transparent overlay from writing to the
depth buffer. Without this, the overlay would occlude faces behind it — the face
behind the highlighted one would disappear when the overlay is rendered first.

**`renderOrder = 1`:**
`renderOrder` controls when the object is rendered in the frame. Higher `renderOrder`
values render after lower ones. Setting `renderOrder = 1` ensures the highlight mesh
renders after the solid (`renderOrder = 0`), preventing z-fighting between the
highlight and the face it covers.

---

## Step 5 — Normal Arrow

The face normal is visualised as an arrow pointing away from the face centre:

```typescript
export function buildNormalArrow(
  solid:     Solid,
  faceIndex: number,
): THREE.ArrowHelper {
  const face = solid.faces[faceIndex]!
  const vertices = face.vertexIndices.map((index) => solid.vertices[index]!)

  const centreX = (vertices[0]!.x + vertices[1]!.x + vertices[2]!.x) / 3
  const centreY = (vertices[0]!.y + vertices[1]!.y + vertices[2]!.y) / 3
  const centreZ = (vertices[0]!.z + vertices[1]!.z + vertices[2]!.z) / 3

  const origin    = new THREE.Vector3(centreX, centreY, centreZ)
  const direction = new THREE.Vector3(face.normalX, face.normalY, face.normalZ)

  return new THREE.ArrowHelper(direction, origin, 1.5, 0xfbbf24, 0.3, 0.2)
}
```

**`THREE.ArrowHelper` — first appearance:**
`ArrowHelper` creates a visual arrow from an origin point in a given direction.
Arguments: direction (unit vector), origin point, length, colour, head length,
head width. It is a composite object — a `THREE.Line` for the shaft and a
`THREE.Mesh` (cone) for the arrowhead — grouped under a `THREE.Object3D`.

---

## Step 6 — Properties Panel Update

The properties panel, when a face is selected, shows:
```
FACE SELECTED
Normal: (0, 0, 1)
Area: 25.00 mm²
```

```tsx
{faceHit !== null && (
  <div>
    <p className="panel-section-title">Face Selected</p>
    <div className="property-row">
      <span className="property-label">N</span>
      <span className="property-value">
        ({faceHit.solid.faces[faceHit.faceIndex]!.normalX.toFixed(2)},
         {faceHit.solid.faces[faceHit.faceIndex]!.normalY.toFixed(2)},
         {faceHit.solid.faces[faceHit.faceIndex]!.normalZ.toFixed(2)})
      </span>
    </div>
    <div className="property-row">
      <span className="property-label">A</span>
      <span className="property-value">{faceHit.faceArea.toFixed(2)} mm²</span>
    </div>
  </div>
)}
```

---

## Debugging: When Face Hover Does Not Highlight

**Symptom: hovering produces no highlight**

The `mousemove` event fires but `castRayForFace` returns null. Check that the solid
meshes are registered in `meshSolidMap`. If they are registered but still returning
null, log `intersections.length` to verify the raycaster is hitting the mesh. If
`intersections.length` is 0, the solid mesh may not be in the list passed to `castRayForFace`.

**Symptom: highlight flickers when moving the mouse over a face**

The highlight mesh is being created and destroyed on every mouse-move frame. Add a
ref to track the current highlighted face index and skip update if the same face is
still hovered:
```typescript
if (currentFaceRef.current?.faceIndex === faceHit.faceIndex) return
```

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`castRayForFace` returning a `FaceHit` is the entry point for lesson 14 (sketch on
a face) — clicking a face activates sketch mode with the camera aligned to that face's
coordinate frame. The `FaceHit.solid` and `FaceHit.faceIndex` are passed directly to
the sketch-on-face setup.

Face area computed here is used in lesson 22 (solver panel) to estimate machining
time for face-milling operations.

---

## What Breaks Without This

**Without `depthWrite: false`:**
The transparent highlight face writes to the depth buffer. Faces of the solid that
are behind the highlight but visible through it (at 30% opacity) are erroneously
occluded — they disappear instead of showing through. The transparency is useless.

**Without `renderOrder`:**
Z-fighting between the highlight and the solid face produces flickering. Both occupy
the same depth range, and the GPU alternates between rendering one or the other
depending on floating-point rounding. `renderOrder` ensures a deterministic rendering
order.

---

## Definition of Done

- [ ] Hovering over a face highlights it in a lighter colour
- [ ] Clicking a face selects it and shows area and normal in the properties panel
- [ ] A yellow arrow shows the face normal direction
- [ ] Highlight disappears when hovering over empty space
- [ ] You can explain AABB ray intersection (the slab method)
- [ ] You can explain BVH traversal and the O(log n) complexity
- [ ] You can compute face area from the cross product formula
- [ ] You can explain `depthWrite: false` and `renderOrder`
- [ ] Run:
      ```
      git add src/
      git commit -m "Add face selection: face raycasting returns faceIndex, highlight overlay with depthWrite=false, normal arrow, area display"
      ```

---

*Next: Lesson 14 — Sketch on a Face. Select a face, enter sketch mode — drawing is
constrained to that face's plane. Change of basis from world coordinates to face
coordinates derives the local coordinate frame.*
