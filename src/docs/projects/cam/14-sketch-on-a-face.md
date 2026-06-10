# CAD/CAM — Lesson 14 — Sketch on a Face

## What You Will Build

Click a face of a 3D solid, then click "Sketch on Face" in the properties panel.
The camera aligns to look directly at the selected face. A 2D grid appears on the
face. Drawing tools activate as in lesson 06, but the sketch plane is the face's
plane — not the world XY plane. Lines drawn in this mode lie on the face. Pressing
Escape returns to 3D. This is the mechanism by which features can be added on top
of existing solids.

## What You Need to Know First

Lessons 01–13. Face selection (lesson 13) must return the face's normal and position.
The sketch mode camera lock (lesson 06) must be generalisable to arbitrary planes.

---

## The Problem

Sketch mode in lesson 06 locked the camera to a predefined axis-aligned view (XY,
XZ, YZ). A face selected by the user can have any orientation — its normal may
point in any direction. The sketch must lie on that face's plane, not on any
world-aligned plane.

This requires two things:
1. **A local coordinate frame** for the face: origin, U axis (local X), V axis
   (local Y). All sketch coordinates are expressed relative to this frame.
2. **A camera orientation** aligned to look directly at the face.

Both are computed from the face's normal vector and a reference point (the face
centroid).

---

## Step 1 — Maths: Change of Basis

### The local coordinate frame

A coordinate frame is defined by:
- **Origin** `O`: the face centroid (average of the three triangle vertices)
- **Normal** `N`: the face's outward normal (unit vector)
- **U axis**: a vector perpendicular to `N` pointing in a horizontal direction
- **V axis**: perpendicular to both `N` and `U`

Computing `U` and `V` from `N`:

**Step 1: Pick an arbitrary "up" reference.** Choose `world_up = (0, 1, 0)` unless
`N` is nearly parallel to `world_up` (within 5°), in which case use `(0, 0, 1)`.
This avoids the degenerate case where the cross product would be near zero.

**Step 2: U = normalise(world_up × N)**
The cross product of `world_up` and `N` gives a vector perpendicular to both —
the local "right" direction in the face plane.

**Step 3: V = N × U**
The cross product of `N` and `U` gives the local "up" direction in the face plane.
Since `N`, `U`, and `V` are mutually perpendicular unit vectors, they form a
right-handed orthonormal basis.

```
    N (normal, pointing out)
    |
    |  V (local up)
    | /
    |/_____ U (local right)
    O (origin)
```

### Converting world to local coordinates

A world point `P_world` converts to local coordinates `(u, v)` by:

```
P_local = P_world - O
u = P_local · U
v = P_local · V
```

The dot product projects `P_local` onto each axis. This is the same formula
derived in lesson 06 for the XY plane — generalised to any coordinate frame.

### Converting local to world coordinates

The inverse:
```
P_world = O + u × U + v × V
```

Starting at the origin, move `u` units along U and `v` units along V.

**CS lens — change of basis:**
`(U, V, N)` is a 3×3 rotation matrix. Converting from world to local multiplies by
the **inverse** (for rotation matrices, the inverse is the **transpose**):
```
[u]   [Ux Uy Uz] [Px - Ox]
[v] = [Vx Vy Vz] [Py - Oy]
[n]   [Nx Ny Nz] [Pz - Oz]
```
And local to world multiplies by the original matrix:
```
[Px]   [Ux Vx Nx] [u]   [Ox]
[Py] = [Uy Vy Ny] [v] + [Oy]
[Pz]   [Uz Vz Nz] [n]   [Oz]
```

This **change of basis** is the same concept as the 4×4 transform matrix (lesson 04)
— the U, V, N vectors become the column vectors of the rotation part of the matrix,
and the origin becomes the translation part.

---

## Step 2 — Face Coordinate Frame

### Create `src/scene/faceFrame.ts`

```typescript
export interface FaceFrame {
  origin: { x: number; y: number; z: number }
  uAxis:  { x: number; y: number; z: number }
  vAxis:  { x: number; y: number; z: number }
  normal: { x: number; y: number; z: number }
}

export function computeFaceFrame(
  solid:     Solid,
  faceIndex: number,
): FaceFrame {
  const face     = solid.faces[faceIndex]!
  const vertices = face.vertexIndices.map((index) => solid.vertices[index]!)

  const originX = (vertices[0]!.x + vertices[1]!.x + vertices[2]!.x) / 3
  const originY = (vertices[0]!.y + vertices[1]!.y + vertices[2]!.y) / 3
  const originZ = (vertices[0]!.z + vertices[1]!.z + vertices[2]!.z) / 3

  const normalX = face.normalX
  const normalY = face.normalY
  const normalZ = face.normalZ

  // Choose reference up vector
  const isNearVertical = Math.abs(normalY) > 0.9
  const refX = isNearVertical ? 0 : 0
  const refY = isNearVertical ? 0 : 1
  const refZ = isNearVertical ? 1 : 0

  // U = normalise(ref × N)
  const crossX = refY * normalZ - refZ * normalY
  const crossY = refZ * normalX - refX * normalZ
  const crossZ = refX * normalY - refY * normalX
  const crossLen = Math.hypot(crossX, crossY, crossZ)

  const uX = crossX / crossLen
  const uY = crossY / crossLen
  const uZ = crossZ / crossLen

  // V = N × U
  const vX = normalY * uZ - normalZ * uY
  const vY = normalZ * uX - normalX * uZ
  const vZ = normalX * uY - normalY * uX

  return {
    origin: { x: originX, y: originY, z: originZ },
    uAxis:  { x: uX,      y: uY,      z: uZ      },
    vAxis:  { x: vX,      y: vY,      z: vZ      },
    normal: { x: normalX, y: normalY, z: normalZ },
  }
}

export function worldToLocal(
  worldPoint: { x: number; y: number; z: number },
  frame:      FaceFrame,
): { u: number; v: number } {
  const dx = worldPoint.x - frame.origin.x
  const dy = worldPoint.y - frame.origin.y
  const dz = worldPoint.z - frame.origin.z

  return {
    u: dx * frame.uAxis.x + dy * frame.uAxis.y + dz * frame.uAxis.z,
    v: dx * frame.vAxis.x + dy * frame.vAxis.y + dz * frame.vAxis.z,
  }
}

export function localToWorld(
  localPoint: { u: number; v: number },
  frame:      FaceFrame,
): { x: number; y: number; z: number } {
  return {
    x: frame.origin.x + localPoint.u * frame.uAxis.x + localPoint.v * frame.vAxis.x,
    y: frame.origin.y + localPoint.u * frame.uAxis.y + localPoint.v * frame.vAxis.y,
    z: frame.origin.z + localPoint.u * frame.uAxis.z + localPoint.v * frame.vAxis.z,
  }
}
```

---

## Step 3 — Camera Alignment to Face

### Update `src/viewport/sketchCamera.ts`

Add a face-aligned camera function:

```typescript
import * as THREE from 'three'
import type { FaceFrame } from '../scene/faceFrame.js'

export function alignCameraToFace(
  frame:         FaceFrame,
  camera:        THREE.PerspectiveCamera,
  orbitControls: OrbitControls,
  distance:      number = 15,
): void {
  orbitControls.enabled = false

  const lookAtX = frame.origin.x
  const lookAtY = frame.origin.y
  const lookAtZ = frame.origin.z

  camera.position.set(
    lookAtX + frame.normal.x * distance,
    lookAtY + frame.normal.y * distance,
    lookAtZ + frame.normal.z * distance,
  )
  camera.lookAt(lookAtX, lookAtY, lookAtZ)
  camera.up.set(frame.vAxis.x, frame.vAxis.y, frame.vAxis.z)
  camera.updateProjectionMatrix()
}
```

**`camera.up` as the face's V axis:**
The camera's "up" direction is set to the face's V axis, so "up" in the sketch view
corresponds to "up" in the face's local frame. Without this, the sketch view might
appear rotated relative to the face.

**`distance = 15` for the camera standoff:**
The camera is placed 15 units along the face normal from the face origin. This
distance should be adjusted based on the face size — a large face needs more
standoff to be fully visible. A production implementation would compute the minimum
enclosing sphere of the face and use that radius as the standoff distance.

---

## Step 4 — Sketch Plane Raycasting on a Face

When the user clicks in face sketch mode, the raycast must hit the face plane
(not the XZ world plane). Update `castRayToPlane` to accept an arbitrary plane:

```typescript
export function castRayToFacePlane(
  ndcPosition: THREE.Vector2,
  camera:      THREE.PerspectiveCamera,
  frame:       FaceFrame,
): { x: number; y: number; z: number } | null {
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(ndcPosition, camera)

  const planeNormal   = new THREE.Vector3(frame.normal.x, frame.normal.y, frame.normal.z)
  const planePoint    = new THREE.Vector3(frame.origin.x, frame.origin.y, frame.origin.z)
  const planeConstant = -planeNormal.dot(planePoint)
  const plane         = new THREE.Plane(planeNormal, planeConstant)

  const intersection = new THREE.Vector3()
  const hit          = raycaster.ray.intersectPlane(plane, intersection)

  if (hit === null) return null
  return { x: intersection.x, y: intersection.y, z: intersection.z }
}
```

After getting the world intersection point, convert it to local UV coordinates
using `worldToLocal(hitPoint, frame)`. These UV coordinates are the sketch point
`{ x: u, y: v }` added to the sketch model. To render the sketch line back in 3D,
convert each point back to world coordinates using `localToWorld`.

---

## Step 5 — App Mode Extension

Add `SKETCH_FACE` to the `AppMode` enum:

```typescript
export const AppMode = {
  NAVIGATE_3D: 'NAVIGATE_3D',
  SKETCH_XY:   'SKETCH_XY',
  SKETCH_XZ:   'SKETCH_XZ',
  SKETCH_YZ:   'SKETCH_YZ',
  SKETCH_FACE: 'SKETCH_FACE',
} as const
```

Store the active `FaceFrame` in App state:

```tsx
const [activeFaceFrame, setActiveFaceFrame] = useState<FaceFrame | null>(null)

function handleSketchOnFace(): void {
  if (faceHit === null) return
  const frame = computeFaceFrame(faceHit.solid, faceHit.faceIndex)
  setActiveFaceFrame(frame)
  setAppMode(AppMode.SKETCH_FACE)
}
```

Pass `activeFaceFrame` to `ViewportComponent`. When `appMode === AppMode.SKETCH_FACE`,
use `alignCameraToFace` and `castRayToFacePlane` with `activeFaceFrame`.

---

## Debugging: When Sketch on Face Shows Wrong Orientation

**Symptom: sketch lines appear tilted relative to the face**

The V axis (local up) is wrong. Log `frame.vAxis` and verify it is perpendicular to
both the normal and the U axis. The cross product `N × U` should give V — check the
order and sign. Add:
```typescript
const dotNV = frame.normal.x * frame.vAxis.x + frame.normal.y * frame.vAxis.y + frame.normal.z * frame.vAxis.z
console.log('N·V (should be 0):', dotNV)
```

**Symptom: clicking on the face produces points in wrong positions**

`worldToLocal` may have incorrect axes. Verify by converting a known world point (the
face origin) to local coordinates — it should return `(0, 0)`.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The `FaceFrame` type and `worldToLocal`/`localToWorld` functions are the foundation
for lesson 22 (contour toolpath generation). A contour toolpath follows the boundary
of a face, projecting each tool position onto the face plane. `localToWorld` converts
the tool positions from face coordinates back to world coordinates for the G-code.

The change-of-basis pattern — building a coordinate frame from normal and reference
vectors — is used throughout computational geometry: UV mapping (texturing), normal
mapping, camera ray generation, and robotics kinematics. Learning it here makes
these fields immediately approachable.

---

## What Breaks Without This

**Without choosing a reference up vector that avoids collinearity:**
If the face normal is `(0, 1, 0)` (pointing straight up) and the reference up is
also `(0, 1, 0)`, their cross product is `(0, 0, 0)` — a zero vector. Normalising
zero produces NaN for all three components. The U and V axes become undefined and
the entire coordinate frame collapses. The reference vector swap prevents this.

**Without `camera.up = vAxis`:**
The camera up vector defaults to `(0, 1, 0)`. For a face with V axis pointing in
a different direction, the sketch view appears rotated — the local "up" direction
in the view does not match the face's local up. Users find this disorienting and
cannot draw lines they intend as horizontal with respect to the face.

---

## Definition of Done

- [ ] Clicking a face and clicking "Sketch on Face" aligns the camera to the face
- [ ] Drawing lines in this mode produces lines that lie on the face's plane
- [ ] The sketch grid appears on the face, not on the world XY plane
- [ ] Pressing Escape returns to 3D with the sketched lines remaining
- [ ] You can derive the U and V axes from a face normal
- [ ] You can trace `worldToLocal` for a specific face and world point
- [ ] You can explain change of basis and how the 3×3 rotation matrix relates to U, V, N
- [ ] Run:
      ```
      git add src/
      git commit -m "Add sketch on face: change-of-basis computes local frame, camera aligns to face normal, raycasting projects onto face plane"
      ```

---

*Next: Lesson 15 — The Python Backend. Geometry computation moves to FastAPI.
The frontend sends sketch JSON and receives solid JSON. Client-server architecture,
REST API design, and JSON as a protocol are introduced.*
