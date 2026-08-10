# Concept: Raycasting — Turning a 2D Cursor Into a Real 3D Point

**What you'll understand by the end:** why a mouse position on screen
can never, by itself, name a single point in a 3D scene — and the real
technique (casting a ray from the camera through the cursor, then
intersecting it with something real) that every 3D editor, game, and
CAD tool uses to resolve that ambiguity.

**Prerequisites:** `threejs-renderer-scene-camera.md`.

## Setup

A browser, plus Three.js:
```
npm install three
```

## The Problem

A perspective camera projects a whole 3D scene down onto a flat, 2D
screen — which means the reverse direction is fundamentally ambiguous:
a single screen pixel corresponds to an entire, infinite line through
3D space (every point along the camera's own line of sight through that
pixel projects to the exact same screen position). A mouse cursor can
never, by itself, say *which* point along that line is the one meant —
resolving that requires intersecting the line with something real: a
surface in the scene, or an explicitly chosen reference plane.

## The Isolated Example

```typescript
import * as THREE from "three";

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(0, -10, 10);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();

// A screen click at the exact center of the canvas -- normalized
// device coordinates (NDC): x/y both range -1 to +1, (0,0) is center.
const ndc = new THREE.Vector2(0, 0);

const raycaster = new THREE.Raycaster();
raycaster.setFromCamera(ndc, camera);

// The real, chosen reference: the XY ground plane (z = 0).
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const hit = new THREE.Vector3();
raycaster.ray.intersectPlane(groundPlane, hit);

console.log(hit);
```

**Real output:**
```
Vector3 {x: 0, y: 0, z: 0}
```

**What this proves:** the center of the screen, with the camera looking
directly at the origin, really does correspond to the origin on the
ground plane — but this only produced *one specific* real point because
a specific plane (`z = 0`) was chosen to intersect against. The exact
same screen click, against a *different* plane, would produce a
completely different, equally valid real point.

## Mechanical Walkthrough

- **Normalized device coordinates (NDC)** — a screen position expressed
  independent of actual pixel resolution: `x`/`y` both range from `-1`
  (left/bottom) to `+1` (right/top), `(0, 0)` is dead center. Converting
  a real mouse event's pixel position into NDC is the first real step
  (`((clientX - rect.left) / rect.width) * 2 - 1` for `x`; the `y` axis
  is flipped, since screen pixels count down from the top while NDC
  counts up from the bottom).
- `raycaster.setFromCamera(ndc, camera)` — builds a real ray, starting
  at the camera's own position, passing through the exact 3D point that
  NDC coordinate corresponds to on the camera's own near plane.
- `raycaster.ray.intersectPlane(plane, target)` — finds where that ray
  crosses a specific, real, infinite plane, writing the result into
  `target` (a real `THREE.Vector3`) and returning it — or `null` if the
  ray happens to run parallel to the plane and never crosses it at all.
- Nothing here can work without deciding *which* plane (or which
  real surface in the scene) to intersect against first — that decision
  is what actually resolves the original 2D-to-3D ambiguity; raycasting
  itself only computes the *consequence* of that decision.

## CS Lens

This is the standard **ray casting** technique underlying picking/
selection in essentially every real 3D application — a camera defines a
perspective (or orthographic) projection; reversing it for a single
screen point produces a ray, not a point, and turning that ray into a
real point always requires intersecting it with *something* (a plane, a
mesh, a bounding volume). The same underlying math also drives
ray-traced rendering (casting a ray *per pixel* to find what's visible
there) — picking is the identical idea, run once, on demand, for a
single chosen pixel instead of the whole screen.

Also recognized in: clicking to select an object in a 3D modeling tool
or game editor (the ray is intersected against every real mesh in the
scene, taking the closest hit); a first-person game's own "what am I
looking at" check (a ray straight down the camera's own forward
direction); GPS/mapping software converting a screen tap into a real
map coordinate (intersecting against the ground, a simpler, 2D-only
version of the identical idea).

## SE Lens

The real, easy mistake this technique exists to prevent: assuming a
screen position and a 3D position are the same kind of thing, or trying
to derive one from the other with ad hoc 2D trigonometry that only
happens to work for one specific, unstated camera angle. That kind of
shortcut can look correct during development (whenever the camera
happens to be in the one orientation it was tested against) and
silently produce wrong results the moment a user rotates the view —
real raycasting against an explicitly chosen plane is correct for
*every* camera angle, because it works from the camera's own real,
current projection, not an assumption about what that projection
happens to look like right now.

## Connection

Builds on `threejs-renderer-scene-camera.md` (the camera/projection this
technique reverses). Directly relevant to any interactive 3D feature
where a user needs to indicate a real 3D position with a 2D input
device (a mouse, a touch point) — sketching/drawing tools, object
placement, measurement tools.

## Try It Yourself

1. Change the chosen plane's own normal/constant (try a vertical plane,
   `new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)`) and confirm the
   identical screen click now produces a completely different real 3D
   point — the ray itself didn't change, only what it was intersected
   against.
2. Move the camera to a different position/orientation and re-run the
   same NDC coordinate against the same ground plane — confirm the
   result still lands correctly at a real point on that plane, proving
   this approach (unlike fixed 2D trigonometry) stays correct regardless
   of camera angle.
3. Pick an NDC coordinate and a plane that are parallel to the camera's
   own line of sight (so the ray never actually crosses the plane) and
   observe `intersectPlane` return `null` — a real, valid "no
   intersection" case a real application has to handle explicitly, not
   an error.
