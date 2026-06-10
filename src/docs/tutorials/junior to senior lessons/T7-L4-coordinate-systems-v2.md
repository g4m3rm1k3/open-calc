# Junior to Senior — T7·L4 — Coordinate Systems

**Prerequisites:** T7·L3 (Matrices and Transforms). You can build and multiply 4×4 matrices.
This lesson traces a single vertex through every transformation step from "in the object's
local file" to "a pixel on screen." Each step is explained by what changes and why.

**What this lab adds:**
- Local space: why objects have their own origin at their pivot
- World space: how the model matrix places the object in the shared scene
- Camera/view space: what it means for the camera to "be at the origin looking down -Z"
- Clip space and NDC: what the GPU needs before it can draw pixels
- Why the full pipeline exists — what would go wrong if each step were skipped

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. An object's local space has its origin at the object's centre. After applying
>    the model matrix, where is the origin? What changed?
> 2. The view matrix is the INVERSE of the camera's model matrix. Why? What would
>    you see without the view matrix?
> 3. After the projection matrix divides by W (perspective divide), coordinates are
>    in NDC: X from -1 to +1, Y from -1 to +1. Why -1 to +1 and not 0 to 1?
>
> *(Answers at the end of this lab)*

---

## Tracing One Vertex Through the Pipeline

Take vertex `V = (1, 0, 0)` in local space. Walk it through every transformation.

```
Local → [Model matrix] → World → [View matrix] → Camera → [Projection] → Clip → ÷W → NDC → [Viewport] → Pixels
```

By the end, `(1, 0, 0)` in local space might be pixel `(423, 289)` on screen.

---

## Step 1 — Local Space and the Model Matrix

**Local space:** Every object has its own coordinate system. A cube's corners at
`(±1, ±1, ±1)` are in local space — these numbers never change regardless of where
the cube sits in the scene. The origin is at the cube's pivot point (usually its centre).

**The model matrix:** Transforms local space coordinates into world space. It encodes
the object's position, rotation, and scale in the world.

```ts
// Object at world position (10, 5, 0), rotated 45° around Y, scaled 2×:
const modelMatrix = Mat4.translation(10, 5, 0)
  .multiply(Mat4.rotationY(Math.PI / 4))
  .multiply(Mat4.scale(2, 2, 2));

// A vertex at (1, 0, 0) in local space:
const localVertex = new Vec3(1, 0, 0);

// The same vertex in world space:
const worldVertex = modelMatrix.transformPoint(localVertex);
```

### SAVE AND TRY

```bash
npx tsx -e "
import { Mat4 } from './src/math/Mat4.js';
import { Vec3 }  from './src/math/Vec3.js';

const model  = Mat4.translation(10, 5, 0);  // just translate, no rotate/scale
const local  = new Vec3(1, 0, 0);
const world  = model.transformPoint(local);
console.log('Local:', local.x, local.y, local.z);
console.log('World:', world.x, world.y, world.z);
// Expected: Local (1,0,0) → World (11,5,0) — translated by (10,5,0)
"
```

**Expected:** `World: 11 5 0` — the local vertex moved by the translation.

**Change something:** Add `Mat4.scale(3, 3, 3)` to the model matrix:

```bash
npx tsx -e "
import { Mat4 } from './src/math/Mat4.js';
import { Vec3 }  from './src/math/Vec3.js';

const model = Mat4.translation(10, 5, 0).multiply(Mat4.scale(3, 3, 3));
const local = new Vec3(1, 0, 0);
console.log('World:', model.transformPoint(local));
// After scale: (3, 0, 0). After translate: (13, 5, 0)
"
```

Expected: `13 5 0` — scale applied first (local 1 → 3), then translate (+10 → 13).

---

## Step 2 — World Space to Camera Space (View Matrix)

**World space:** All objects share one coordinate system. The sun at `(0, 100, 0)`,
the hero at `(5, 0, 0)`, the camera at `(0, 0, 10)` — all in the same space.

**The problem:** The GPU expects the camera to be at the origin, looking down the
negative Z axis. Real cameras are not at the origin.

**The view matrix:** Transforms world space so the camera IS at the origin. It is
the INVERSE of the camera's model matrix. If the camera is at `(0, 0, 10)`, the
view matrix moves EVERYTHING 10 units in the -Z direction so the camera lands at origin.

```
Camera in world at (0, 0, 10).
To put camera at origin, translate world by (0, 0, -10).
View matrix = inverse of camera's model matrix.
```

```ts
// Camera at (0, 0, 10), looking at origin:
const cameraPos  = new Vec3(0, 0, 10);
const viewMatrix = Mat4.lookAt(cameraPos, Vec3.ZERO, Vec3.Y_AXIS);

// A point at world origin (0, 0, 0):
const worldOrigin = Vec3.ZERO;
const cameraPoint = viewMatrix.transformPoint(worldOrigin);
```

### SAVE AND TRY

```bash
npx tsx -e "
import { Mat4 } from './src/math/Mat4.js';
import { Vec3 }  from './src/math/Vec3.js';

const view  = Mat4.lookAt(new Vec3(0, 0, 10), Vec3.ZERO, Vec3.Y_AXIS);
const world = Vec3.ZERO;
const cam   = view.transformPoint(world);
console.log('Camera space:', cam.x.toFixed(2), cam.y.toFixed(2), cam.z.toFixed(2));
// The origin is 10 units in front of the camera → negative Z in camera space
"
```

**Expected:** `Camera space: 0.00 0.00 -10.00` — the world origin is 10 units in
front of the camera, which in camera space is at z = -10 (camera looks down -Z).

**Change something:** Move the camera to `(5, 0, 10)`. What changes in camera space?

Expected: x becomes -5 (the origin is now 5 units to the left of the camera, which
in camera space is -5 on the x axis).

---

## Step 3 — The Full Pipeline Written As One Multiplication

In 3D rendering, the three matrices are combined into one: `MVP = Projection × View × Model`.

```ts
// A point's journey from local space to NDC:
// worldPos = model × localPos
// cameraPos = view × worldPos = view × model × localPos
// clipPos = projection × cameraPos = projection × view × model × localPos
//         = MVP × localPos
```

In practice, you compute MVP once per frame (not per vertex) and send it to the GPU.

```ts
import { Mat4 } from './Mat4';
import { Vec3 }  from './Vec3';

// Scene setup:
const modelMatrix = Mat4.translation(0, 0, 0);      // object at world origin
const viewMatrix  = Mat4.lookAt(
  new Vec3(0, 0, 5),   // camera at (0, 0, 5)
  Vec3.ZERO,           // looking at origin
  Vec3.Y_AXIS
);
const projMatrix = makePerspectiveMatrix({
  fovYRad:     Math.PI / 3,   // 60° vertical FOV
  aspectRatio: 800 / 600,
  near:        0.1,
  far:         100,
});

// MVP: one matrix that does all three transforms at once:
const MVP = projMatrix.multiply(viewMatrix).multiply(modelMatrix);

// A vertex at the world origin (0, 0, 0):
const localVertex = Vec3.ZERO;
const clipPos     = MVP.transformPoint(localVertex);

// The origin should project to (0, 0) in NDC (centre of screen):
console.log('NDC x:', (clipPos.x / 1).toFixed(3));  // should be ~0
console.log('NDC y:', (clipPos.y / 1).toFixed(3));  // should be ~0
```

---

## Step 4 — Write the Pipeline Tests

Create `src/math/pipeline.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Mat4 }  from './Mat4';
import { Vec3 }  from './Vec3';
import { makePerspectiveMatrix } from './transforms';   // from T7-L4 transforms

describe('Coordinate system pipeline', () => {

  it('model matrix moves an object from local to world space', () => {
    const model       = Mat4.translation(10, 5, 0);
    const localVertex = new Vec3(0, 0, 0);  // origin of the object
    const worldVertex = model.transformPoint(localVertex);

    // The local origin is now at (10, 5, 0) in world space:
    expect(worldVertex.x).toBeCloseTo(10);
    expect(worldVertex.y).toBeCloseTo(5);
    expect(worldVertex.z).toBeCloseTo(0);
  });

  it('view matrix makes the world origin appear in front of the camera', () => {
    // Camera at (0, 0, 5) looking at origin:
    const view = Mat4.lookAt(new Vec3(0, 0, 5), Vec3.ZERO, Vec3.Y_AXIS);
    const worldOrigin = Vec3.ZERO;
    const inCameraSpace = view.transformPoint(worldOrigin);

    // In camera space, objects in front of camera have negative Z:
    expect(inCameraSpace.z).toBeLessThan(0);
  });

  it('an object directly left of camera has negative X in camera space', () => {
    // Camera at (0, 0, 5) looking at origin. Object at (-3, 0, 0) in world.
    const view   = Mat4.lookAt(new Vec3(0, 0, 5), Vec3.ZERO, Vec3.Y_AXIS);
    const object = new Vec3(-3, 0, 0);   // to the left in world space
    const inCam  = view.transformPoint(object);

    // The camera is looking in the -Z direction with +X to the right.
    // An object to the left of the camera should have negative X:
    expect(inCam.x).toBeLessThan(0);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/math/pipeline.test.ts
```

Expected: all 3 tests pass.

---

## 🎯 Challenge: Build the NDC → Screen Conversion

**The mechanism:**

After the projection matrix, coordinates are in NDC (Normalised Device Coordinates):
X from -1 (left edge) to +1 (right edge), Y from -1 (bottom) to +1 (top).

To convert to pixel coordinates (origin at top-left):
```
screen_x = (ndcX + 1) / 2 * viewportWidth
screen_y = (1 - ndcY) / 2 * viewportHeight    ← Y is FLIPPED (screen Y grows downward)
```

**Task:** Implement `ndcToScreen(ndcX: number, ndcY: number, width: number, height: number): { x: number; y: number }`

Write 3 tests:
- NDC (-1, -1) = bottom-left = screen (0, height) — bottom-left in NDC, bottom-left in screen pixels
- NDC (0, 0) = centre = screen (width/2, height/2)
- NDC (1, 1) = top-right = screen (width, 0)

---

<details>
<summary>▶ Show Solution</summary>

```ts
function ndcToScreen(
  ndcX: number, ndcY: number,
  width: number, height: number,
): { x: number; y: number } {
  return {
    x: (ndcX + 1) / 2 * width,       // [-1,1] → [0, width]
    y: (1 - ndcY) / 2 * height,      // flip Y: NDC +1 is top, screen 0 is top
  };
}
```

**Tests:**
```ts
it('NDC (0,0) maps to screen centre', () => {
  const { x, y } = ndcToScreen(0, 0, 800, 600);
  expect(x).toBeCloseTo(400);
  expect(y).toBeCloseTo(300);
});

it('NDC (1,1) maps to top-right of screen', () => {
  const { x, y } = ndcToScreen(1, 1, 800, 600);
  expect(x).toBeCloseTo(800);
  expect(y).toBeCloseTo(0);    // top = y=0 in screen space
});

it('NDC (-1,-1) maps to bottom-left', () => {
  const { x, y } = ndcToScreen(-1, -1, 800, 600);
  expect(x).toBeCloseTo(0);
  expect(y).toBeCloseTo(600);  // bottom = y=height in screen space
});
```

**Key insight:** The Y flip is essential. NDC uses mathematical convention (Y up),
but screen pixels use computer convention (Y down — pixel 0 is at the top).
Without the flip, the entire rendered image would be upside down.

</details>

---

## Final Check

| Space | What "zero" means | Transform to get here |
|---|---|---|
| Local | Object's pivot point | (start) |
| World | Shared scene origin | × Model matrix |
| Camera | Camera position | × View matrix |
| Clip | After projection | × Projection matrix |
| NDC | Centre of screen | ÷ W component |
| Screen | Top-left pixel | × Viewport transform |

---

## Quick Check Answers

**1. After applying the model matrix, where is the origin?**

The origin is still at (0, 0, 0) in world space — the model matrix did not move the
world's origin. What changed: the object's vertices that were in local space are now
expressed in world space. The local vertex at (0, 0, 0) — the object's pivot — is now
at whatever position the model matrix's translation specifies in world space.

**2. View matrix = inverse of camera's model matrix. Why?**

The camera's model matrix transforms FROM camera space TO world space (places the camera
in the world). To go the other direction (world → camera), you need the inverse. Without
the view matrix, every object would be rendered as seen from the world origin looking down
-Z — not from where the camera actually is. Moving the camera left would not change the view.

**3. NDC X from -1 to +1, not 0 to 1. Why?**

The -1 to +1 range is symmetric around zero, which simplifies the math. Zero represents
the centre of the viewport. The left edge is -1, right edge is +1, bottom is -1, top is +1.
This makes the centre of the screen exactly (0, 0) in NDC regardless of screen size.
0 to 1 would put the centre at (0.5, 0.5) — less mathematically clean, though both work.
