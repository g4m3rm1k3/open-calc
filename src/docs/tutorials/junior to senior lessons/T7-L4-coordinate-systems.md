# Junior to Senior — T7·L4 — Coordinate Systems

**Prerequisites:** T7·L3 (Matrices and Transforms). You can build and combine
transformation matrices. This lesson maps the abstract math to the concrete
pipeline that converts an object in your code to pixels on screen.

**What this lab adds:**
- Local → world → view → clip → NDC → screen — the full pipeline
- Model matrix: object's position/rotation/scale in the world
- View matrix: the world seen from the camera
- Projection matrix: 3D to 2D (perspective or orthographic)
- Why CAD tools default to orthographic projection

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A mesh is at position (10, 5, 0) in world space. What does the model matrix contain?
> 2. The camera moves left. From the camera's perspective, the world moves right.
>    Which matrix represents this?
> 3. Two objects at the same position but one is twice as far from the camera.
>    In perspective projection, how big does each appear? In orthographic?
>
> *(Answers at the end of this lab)*

---

## The Full Pipeline

```
Local space
    ↓ × Model matrix (T*R*S of the object)
World space
    ↓ × View matrix (inverse of camera's model matrix)
Camera/View space
    ↓ × Projection matrix (perspective or orthographic)
Clip space
    ↓ ÷ w (perspective divide)
NDC (Normalised Device Coordinates: -1 to 1 in X, Y, Z)
    ↓ × viewport transform
Screen space (pixels)
```

At each stage, a 4×4 matrix multiplication transforms all vertices of all meshes.
The GPU performs these transforms in its vertex shader for every vertex of every
frame.

---

### Concept: Model Matrix

**What it is:** The model matrix places an object in the world. It is the
object's TRS (Translation × Rotation × Scale) combined.

```ts
// Object at position (5, 0, 0), rotated 45° around Y, scale 2×:
const modelMatrix = Mat4.translation(5, 0, 0)
  .multiply(Mat4.rotationY(Math.PI / 4))
  .multiply(Mat4.scale(2, 2, 2));

// A vertex at (1, 0, 0) in object space:
const localVertex = new Vec3(1, 0, 0);

// The same vertex in world space:
const worldVertex = modelMatrix.transformPoint(localVertex);
```

In Three.js, `mesh.position`, `mesh.rotation`, and `mesh.scale` are combined
into `mesh.matrixWorld` automatically.

---

### Concept: View Matrix

**What it is:** The view matrix transforms world coordinates into camera-relative
coordinates. It is the inverse of the camera's model matrix.

```ts
// Camera at (0, 5, 10), looking at the origin:
const cameraPosition = new Vec3(0, 5, 10);
const target         = Vec3.ZERO;
const viewMatrix     = Mat4.lookAt(cameraPosition, target, Vec3.Y_AXIS);

// Transform a world-space point to camera (view) space:
const worldPoint  = new Vec3(0, 0, 0);
const cameraPoint = viewMatrix.transformPoint(worldPoint);
// cameraPoint.z should be negative (in front of the camera)
```

**What view space means:** In camera space, the camera is at the origin, looking
down the negative Z axis (in Three.js convention). Objects in front of the
camera have negative Z values. Objects behind have positive Z. This is the space
where depth calculations happen.

---

### Concept: Projection Matrix

**Perspective projection** — objects further away appear smaller (natural vision):

```
FOV (field of view): 60° — wider = more distortion
Aspect ratio: 16/9
Near clip: 0.1 (geometry closer is invisible)
Far clip:  1000 (geometry further is invisible)
```

**Orthographic projection** — no foreshortening, sizes are accurate:

```
width:  20 (horizontal extent in world units)
height: 15
near:   -500
far:    500
```

**Why CAD tools use orthographic:** When you measure a dimension in the viewport,
you need the displayed size to match the actual model size. Perspective projection
would make a 10mm feature at the back of the model appear smaller than the same
feature at the front — unusable for precise work.

---

### Concept: NDC — the GPU's Coordinate System

After the projection matrix, vertices are in clip space. After the GPU divides
by `w` (perspective divide), they are in NDC (Normalised Device Coordinates):

```
X: -1 (left edge) to +1 (right edge)
Y: -1 (bottom) to +1 (top) — note: Y-up
Z:  0 to 1 (WebGL) or -1 to 1 (OpenGL) — depth buffer range
```

The GPU then maps NDC to pixels using the viewport size:
```
screen_x = (ndc_x + 1) / 2 * viewport_width
screen_y = (1 - ndc_y) / 2 * viewport_height  (Y is flipped — pixels go top-down)
```

---

## Step 1 — Write the Space Conversion

Create `src/math/transforms.ts`:

```ts
import { Vec3 } from './Vec3';
import { Mat4 } from './Mat4';

export interface PerspectiveProjectionParams {
  fovYRad:     number;
  aspectRatio: number;
  near:        number;
  far:         number;
}

export function makePerspectiveMatrix({
  fovYRad, aspectRatio, near, far,
}: PerspectiveProjectionParams): Mat4 {
  const f   = 1 / Math.tan(fovYRad / 2);
  const nf  = 1 / (near - far);

  return new Mat4([
    f / aspectRatio, 0,  0,                      0,
    0,               f,  0,                      0,
    0,               0,  (far + near) * nf,      -1,
    0,               0,  (2 * far * near) * nf,   0,
  ]);
}

export interface OrthographicProjectionParams {
  left:   number;
  right:  number;
  bottom: number;
  top:    number;
  near:   number;
  far:    number;
}

export function makeOrthographicMatrix({
  left, right, bottom, top, near, far,
}: OrthographicProjectionParams): Mat4 {
  const rml = right - left;
  const tmb = top   - bottom;
  const fmn = far   - near;

  return new Mat4([
    2/rml, 0,     0,     0,
    0,     2/tmb, 0,     0,
    0,     0,    -2/fmn, 0,
    -(right+left)/rml, -(top+bottom)/tmb, -(far+near)/fmn, 1,
  ]);
}

export function worldToScreen(
  worldPos:    Vec3,
  model:       Mat4,
  view:        Mat4,
  projection:  Mat4,
  viewportWidth:  number,
  viewportHeight: number,
): { x: number; y: number; depth: number } {
  // World space → View space → Clip space:
  const viewPos = view.transformPoint(model.transformPoint(worldPos));

  // Apply projection (stores result in homogeneous coords):
  const m = projection.m;
  const p = viewPos;
  const cx = m[0]*p.x + m[4]*p.y + m[8]*p.z  + m[12];
  const cy = m[1]*p.x + m[5]*p.y + m[9]*p.z  + m[13];
  const cz = m[2]*p.x + m[6]*p.y + m[10]*p.z + m[14];
  const cw = m[3]*p.x + m[7]*p.y + m[11]*p.z + m[15];

  // Perspective divide → NDC:
  const ndcX = cx / cw;
  const ndcY = cy / cw;
  const ndcZ = cz / cw;

  // NDC → screen pixels:
  return {
    x:     (ndcX + 1) / 2 * viewportWidth,
    y:     (1 - ndcY) / 2 * viewportHeight,
    depth: ndcZ,
  };
}
```

---

## Step 2 — Write Tests

Create `src/math/transforms.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Vec3 }                  from './Vec3';
import { Mat4 }                  from './Mat4';
import { makePerspectiveMatrix, makeOrthographicMatrix, worldToScreen } from './transforms';

describe('coordinate systems', () => {

  it('perspective projection maps the origin to NDC centre', () => {
    const view  = Mat4.lookAt(new Vec3(0, 0, 5), Vec3.ZERO, Vec3.Y_AXIS);
    const proj  = makePerspectiveMatrix({ fovYRad: Math.PI/3, aspectRatio: 1, near: 0.1, far: 100 });

    const screen = worldToScreen(Vec3.ZERO, Mat4.identity(), view, proj, 800, 600);

    // The origin (looking at it straight on) should project to the centre of the screen:
    expect(screen.x).toBeCloseTo(400, 0);
    expect(screen.y).toBeCloseTo(300, 0);
  });

  it('orthographic projection: same size regardless of distance', () => {
    const ortho  = makeOrthographicMatrix({ left:-10, right:10, bottom:-10, top:10, near:-100, far:100 });
    const view1  = Mat4.lookAt(new Vec3(0, 0,  5), Vec3.ZERO, Vec3.Y_AXIS);
    const view2  = Mat4.lookAt(new Vec3(0, 0, 50), Vec3.ZERO, Vec3.Y_AXIS);
    const model  = Mat4.identity();

    const p = new Vec3(5, 0, 0);  // 5 units to the right

    const s1 = worldToScreen(p, model, view1, ortho, 800, 600);
    const s2 = worldToScreen(p, model, view2, ortho, 800, 600);

    // X screen position is the same regardless of camera distance:
    expect(s1.x).toBeCloseTo(s2.x, 0);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Screen to World (Unprojection)

**You know:** The full MVP pipeline. Inverting the pipeline.

**Task:** Implement `screenToWorldRay(screenX, screenY, viewportW, viewportH, view, projection)` —
given a 2D screen position, compute the 3D ray in world space. This is the
mechanism behind mouse picking in 3D viewports.

Algorithm:
1. Convert screen coords → NDC
2. Create a near plane point (z = -1) and a far plane point (z = 1) in NDC
3. Unproject both points through the inverse of (projection × view)
4. The ray direction is `normalise(far - near)`

Write 1 test: clicking the centre of the screen should produce a ray pointing
straight along -Z (for a camera looking down -Z).

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Approximate matrix inverse for orthogonal matrices (sufficient for our use):
function invertTransform(m: Mat4): Mat4 {
  // For a pure TRS matrix, the inverse is transpose of the rotation part
  // and negated translation. This is a simplified version using Three.js approach.
  // For a full implementation, use the adjugate/determinant method.
  // Here we use brute-force 4x4 inversion:
  const a = m.m;
  // ... (16-element determinant/cofactor inversion — omitted for brevity)
  // In practice, use THREE.Matrix4.getInverse() or similar
  throw new Error('Full matrix inversion not implemented in this lesson — use Three.js');
}
```

**Key insight:** Full 4×4 matrix inversion is ~50 lines of index arithmetic.
In practice, you use Three.js's `Matrix4.invert()` or similar. The important
thing is understanding WHEN and WHY you need the inverse: to convert from
screen coordinates back to world coordinates for mouse picking.

</details>

---

## Final Check

| Space | What it represents | Transform to get here |
|---|---|---|
| Local | Vertex relative to mesh pivot | (start here) |
| World | Vertex in the global scene | × Model matrix |
| Camera | Vertex relative to camera | × View matrix |
| Clip | After projection, before divide | × Projection matrix |
| NDC | -1 to +1 cube | ÷ w |
| Screen | Pixel coordinates | × Viewport transform |

---

## Quick Check Answers

**1. Mesh at (10, 5, 0) in world space. What does the model matrix contain?**

A translation by (10, 5, 0). If the mesh also has rotation and scale, those are
combined into the same matrix. The model matrix transforms vertices from the mesh's
local space (where the mesh is centred at its pivot) to world space (where the mesh
is placed in the scene).

**2. Camera moves left — the world moves right from camera's perspective. Which matrix?**

The view matrix. The view matrix is the inverse of the camera's model matrix.
When the camera moves left (its translation matrix changes), the view matrix
changes so that all world-space points are effectively shifted right in camera space.
The illusion: nothing in the world moves — only the reference frame does.

**3. One object twice as far — perspective vs orthographic sizes?**

Perspective: the farther object appears half as tall/wide (sizes are inversely
proportional to distance). This matches human vision — a car 100m away looks
smaller than one 50m away, even though they are identical. Orthographic: both
objects appear the same size regardless of depth. This is why engineers use
orthographic projections for technical drawings — dimensions are preserved.
