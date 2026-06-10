# Junior to Senior — T7·L7 — Perspective vs Orthographic Projection

**Prerequisites:** T7·L6 (Ray Casting). You can compute 3D positions from screen clicks.
This lesson finalises Topic 7 by comparing the two projection types — and explaining
why CAD tools default to orthographic.

**What this lab adds:**
- Perspective projection: objects further appear smaller (human vision)
- Orthographic projection: no foreshortening — dimensions look accurate
- Field of view (FOV) and its effect
- The camera frustum vs the ortho box
- Near and far clip planes and their effect on depth buffer precision

**Time:** 30–45 minutes (shorter — mostly conceptual)

---

> **Quick Check — try to answer before reading:**
>
> 1. A 10mm cube at the front of the scene and an identical cube at the back.
>    In perspective, which appears larger? In orthographic?
> 2. FOV = 90° vs FOV = 30°. Which produces a "zoomed in" look? Why?
> 3. Near clip = 0.001, far clip = 100,000. What problem does this cause?
>
> *(Answers at the end of this lab)*

---

## The Two Projections Compared

```
Perspective (frustum):        Orthographic (box):

Camera                        Camera
  │                             │
  │\                            │─────────
  │  \                          │
  │    ──── near               │─────────
  │      ────────── far
  │           (frustum)         (rectangular box)
```

### Perspective

- Objects further from the camera appear smaller
- Parallel lines converge (railroad tracks meeting at the horizon)
- Matched human vision — gives a sense of 3D depth
- Default for games, 3D renderers, architectural visualisation

### Orthographic

- All objects appear the same size regardless of distance
- Parallel lines remain parallel
- No sense of depth — looks "flat"
- Default for **engineering, CAD/CAM, technical drawings**

---

### Concept: Why CAD Uses Orthographic

**The problem with perspective for engineering:**

```
In perspective: a 10mm feature at 100mm distance appears X pixels.
The same feature at 200mm distance appears X/2 pixels.
A measurement ruler in the viewport gives WRONG values.
```

**With orthographic:**

```
In orthographic: a 10mm feature always appears the same size.
A measurement in the viewport is proportional to the actual dimension.
```

CAD/CAM applications need accurate dimension perception. An engineer looking at
the viewport must be able to judge sizes and relationships correctly. Orthographic
projection provides this.

**When CAD uses perspective:** When presenting the design (walkthroughs, customer
demos), some CAD tools switch to perspective for a realistic view. The machinist
uses orthographic; the marketing team uses perspective.

---

### Concept: Field of View

**For perspective cameras only.** FOV is the angle of the view cone.

```
Wide FOV (90°+): more visible, distorted edges — "fisheye lens"
Normal FOV (60°): natural human vision
Narrow FOV (30°): telephoto lens — objects appear closer, less depth distortion
```

**For CAD tools that offer a perspective view:** A narrow FOV (30°–45°) reduces
perspective distortion — objects look more like what an engineer expects.

**Orthographic has no FOV.** It has an extent (width and height in world units).
Zooming in orthographic increases the extent.

---

### Concept: Near and Far Clip Planes

**What they are:** The near clip plane is the minimum distance from the camera at
which geometry is rendered. The far clip plane is the maximum. Geometry outside
this range is invisible ("clipped").

**The depth buffer problem:** The depth buffer (Z buffer) stores the depth of each
pixel with limited precision (usually 24 bits = ~16 million values). This precision
is distributed between the near and far planes.

**Non-linear distribution:** Perspective projection compresses more precision near
the near plane and less near the far plane. With `near = 0.001` and `far = 100,000`:

```
Near values (0.001 → 1.0):   uses ~50% of the depth buffer precision
Far values  (1.0 → 100,000): uses ~50% of the depth buffer precision
```

This means two surfaces at depth 50,000 that are 1 unit apart may be indistinguishable
— both hash to the same depth buffer value. They will "Z-fight" (flickering artifacts).

**Best practice:** Set near as large as possible and far as small as possible.
For a CNC machine tool (typical workspace: 600mm × 600mm × 300mm):

```ts
near: 0.1   // 0.1mm minimum visibility
far:  1000  // 1000mm = 1 meter maximum visibility
```

---

## Step 1 — Demonstrate the Projection Difference

Create `src/math/projection-demo.ts`:

```ts
import { Vec3 }                                      from './Vec3';
import { Mat4 }                                      from './Mat4';
import { makePerspectiveMatrix, makeOrthographicMatrix, worldToScreen } from './transforms';

const WIDTH  = 800;
const HEIGHT = 600;

// Camera at Z = 10, looking at origin:
const view = Mat4.lookAt(new Vec3(0, 0, 10), Vec3.ZERO, Vec3.Y_AXIS);

// Two identical cubes — one at Z=0, one at Z=-8 (further away):
const nearBox = Mat4.translation(0, 0,  0);  // model matrix for near box
const farBox  = Mat4.translation(0, 0, -8);  // model matrix for far box

// A corner of a 1×1 unit box:
const corner = new Vec3(0.5, 0.5, 0);

// ── Perspective projection ───────────────────────────────────────────────

const perspective = makePerspectiveMatrix({
  fovYRad:     Math.PI / 3,  // 60°
  aspectRatio: WIDTH / HEIGHT,
  near:        0.1,
  far:         100,
});

const nearPerspScreen = worldToScreen(corner, nearBox, view, perspective, WIDTH, HEIGHT);
const farPerspScreen  = worldToScreen(corner, farBox,  view, perspective, WIDTH, HEIGHT);

// ── Orthographic projection ──────────────────────────────────────────────

const orthoExtent = 5;
const ortho = makeOrthographicMatrix({
  left:   -orthoExtent * (WIDTH/HEIGHT),
  right:   orthoExtent * (WIDTH/HEIGHT),
  bottom: -orthoExtent,
  top:     orthoExtent,
  near:   -50,
  far:     50,
});

const nearOrthoScreen = worldToScreen(corner, nearBox, view, ortho, WIDTH, HEIGHT);
const farOrthoScreen  = worldToScreen(corner, farBox,  view, ortho, WIDTH, HEIGHT);

console.log('=== Perspective Projection ===');
console.log('Near corner screen pos:', nearPerspScreen);
console.log('Far  corner screen pos:', farPerspScreen);
console.log('Size ratio (near/far):', nearPerspScreen.x / farPerspScreen.x);

console.log('\n=== Orthographic Projection ===');
console.log('Near corner screen pos:', nearOrthoScreen);
console.log('Far  corner screen pos:', farOrthoScreen);
console.log('Size ratio (near/far):', nearOrthoScreen.x / farOrthoScreen.x);
```

### SAVE AND TRY

```bash
npx ts-node src/math/projection-demo.ts
```

Expected output (approximate):
```
=== Perspective Projection ===
Near corner screen pos: { x: 490.4, y: 238.2, depth: ... }
Far  corner screen pos: { x: 450.9, y: 278.9, depth: ... }
Size ratio (near/far): ~1.09  ← near box appears larger

=== Orthographic Projection ===
Near corner screen pos: { x: 493.3, y: 246.7, depth: ... }
Far  corner screen pos: { x: 493.3, y: 246.7, depth: ... }
Size ratio (near/far): 1.0  ← identical positions regardless of depth
```

**The orthographic ratio is exactly 1.0** — both boxes project to the same screen
position regardless of their Z distance. This is the key property.

---

## 🎯 Challenge: Design the CAD Viewport Camera

**You know:** Both projection types, FOV, clip planes, camera parameters.

**Task (design, not code):** Design the camera parameters for the CAD/CAM
application viewport. Justify each choice:

1. **Projection type**: perspective or orthographic (default)?
2. **Near clip**: what is the minimum meaningful geometry size for a CNC machine?
3. **Far clip**: a typical CNC machine workspace is 600mm × 600mm × 500mm. How far does the camera need to see?
4. **Initial camera position**: where should the camera start? What is a natural default view?
5. **Orthographic extent**: what real-world extent (in mm) should the initial view show?

Write your choices with justifications before revealing the reference answer.

---

<details>
<summary>▶ Reference Design</summary>

**1. Projection type: Orthographic (default)**

Engineers need accurate dimension perception. Orthographic is the standard for
CAD/CAM tools. A perspective option can be added for presentations. Default to
orthographic.

**2. Near clip: 0.1mm**

The smallest meaningful feature in CNC machining is typically ~0.1mm (tool radius,
corner radius). Setting near = 0.1 ensures all relevant geometry is visible.
Setting it smaller (0.001) would waste depth buffer precision on invisible ranges.

**3. Far clip: 2,000mm**

With a 600mm workspace, objects are never further than ~1,000mm from the camera
in a typical top-down view. Adding 2× headroom for zooming out: far = 2,000mm.

**4. Initial camera position:**

Top-down view (looking straight down at the XY plane from +Z) is the standard for
2D profile work. The camera should be at `(0, 0, 1000)` looking at `(0, 0, 0)` with
up = `(0, 1, 0)` (Y axis as up in the viewport).

Alternatively, an isometric view (`position = (500, 400, 500)`) for 3D work.

**5. Orthographic extent: 400mm × 300mm (or proportional to a 4:3 / 16:9 viewport)**

The initial view should show approximately the full machine workspace (600mm wide).
With viewport aspect ratio 4:3, setting `orthoHeight = 400mm` shows 400mm tall and
533mm wide — fitting a 500mm workspace with some margin.

Zoom in/out scales the extent uniformly.

</details>

---

## Final Check

| | Perspective | Orthographic |
|---|---|---|
| Depth perception | Strong | None |
| Size at distance | Smaller further away | Same at all distances |
| Measurements in viewport | Inaccurate | Accurate |
| FOV parameter | Yes | No (uses extent) |
| Default for CAD | No | Yes |

---

## Quick Check Answers

**1. 10mm cube at front vs back. Perspective size? Orthographic size?**

Perspective: the front cube appears larger (closer = bigger in perspective).
The back cube appears smaller. The ratio is proportional to the distance ratio.
Orthographic: both cubes appear exactly the same size — distance has no effect
on projected size.

**2. FOV = 90° vs 30°. Which is "zoomed in"?**

30° is zoomed in (telephoto). A narrow FOV means only objects within a narrow
cone are visible — they fill more of the screen. 90° is wide-angle — a large
cone is visible but each object is relatively smaller. Telephoto lenses (narrow
FOV) appear to "compress" depth — objects at different distances look similar
in size.

**3. Near = 0.001, far = 100,000. What problem?**

Poor depth buffer precision at medium and large distances. The depth buffer's
non-linear distribution gives ~50% of precision to the 0.001–1.0 range (near zone)
and ~50% to 1.0–100,000 (everything else). Two surfaces at distance 10,000 that
are 0.1 units apart will Z-fight because they map to the same depth buffer value.
The fix: always make near as large as possible. For a viewport where nothing closer
than 1mm matters, use near = 1.0 instead of 0.001.
