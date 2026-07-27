# Concept: Framing a Camera From an Object's Own Real Size

**What you'll understand by the end:** how to point a camera at
*whatever* content a scene currently holds — regardless of how big or
small it really is — by measuring the content itself, rather than
guessing a fixed camera position that only happens to work for one
particular size.

**Prerequisites:** `threejs-renderer-scene-camera.md`.

## Setup

A browser, plus Three.js:
```
npm install three
```

## The Problem

A camera placed at a fixed position/distance only frames whatever's in
the scene correctly by coincidence — the moment the real content is
much bigger or much smaller than whatever size the fixed position
happened to assume, it's either microscopically small on screen or the
camera is inside it, clipped through. This is a real, recurring problem
any time a scene's content isn't a known, constant size in advance — a
user-uploaded model, a search result thumbnail, or, concretely, one CNC
tool's own real assembly, which can honestly range from a fraction of
an inch (a small drill) to several inches (a large face mill and its
holder) in the exact same viewer.

## The Isolated Example

```typescript
import * as THREE from "three";

function frameCamera(camera: THREE.PerspectiveCamera, object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 0.001);
  const distance = maxDimension * 2;

  camera.position.set(center.x + distance, center.y - distance, center.z + distance * 0.6);
  camera.near = maxDimension / 100;
  camera.far = maxDimension * 100;
  camera.updateProjectionMatrix();
  return center; // hand this to OrbitControls' own `target`
}

const tiny = new THREE.Mesh(new THREE.SphereGeometry(0.05));
const huge = new THREE.Mesh(new THREE.SphereGeometry(50));
const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100000);

const centerTiny = frameCamera(camera, tiny);
console.log("tiny object camera distance:", camera.position.distanceTo(centerTiny));

const centerHuge = frameCamera(camera, huge);
console.log("huge object camera distance:", camera.position.distanceTo(centerHuge));
```

**Real output — corrected, this session (re-run directly against the
project's own `three` package; the previous values here were never
actually produced by this code):**
```
tiny object camera distance: 0.307245834493064
huge object camera distance: 307.2458299147443
```

**What this proves:** the *same* function correctly frames both a
sphere a fraction of a unit across and one a thousand times larger,
with no size-specific code anywhere — the camera's own distance is
always derived from the real object it's looking at, never assumed in
advance.

## Mechanical Walkthrough

- `new THREE.Box3().setFromObject(object)` — computes the smallest
  axis-aligned box that fully contains every real vertex in `object`
  (and its children), by actually reading their real, current geometry
  — not a guess, a measurement.
- `box.getSize(...)` / `box.getCenter(...)` — the box's own real
  dimensions and midpoint; `maxDimension` is the largest of the three,
  a single real number standing in for "how big is this, overall."
- `distance = maxDimension * 2` — a real, empirically reasonable
  multiplier: far enough that a roughly cube-shaped object of that size
  fits comfortably in a typical field of view, without being so far
  that it looks tiny. The right multiplier depends on the camera's own
  FOV and the typical shape of what's being framed — tuned by eye once,
  not re-derived per object.
- `camera.near`/`camera.far` are *also* scaled from `maxDimension`, not
  left at whatever fixed values were fine for a different-sized scene —
  a `near` plane fixed at, say, `0.1` would clip straight through an
  object whose entire size is `0.05`.

## Execution Trace

`frameCamera` run against two objects 1000× apart in size, each call
independent of the other except that both write into the same shared
`camera` object:

```
frameCamera(camera, tiny):  tiny = Mesh(SphereGeometry(radius=0.05))
  box.setFromObject(tiny) → size = (0.1, 0.1, 0.1), center = (0, 0, 0)
  maxDimension = max(0.1, 0.1, 0.1, 0.001) = 0.1
  distance = 0.1 * 2 = 0.2
  camera.position = (0+0.2, 0-0.2, 0+0.12) = (0.2, -0.2, 0.12)
  camera.near = 0.1/100 = 0.001; camera.far = 0.1*100 = 10
  return center = (0, 0, 0)
distance from camera.position to (0,0,0) = sqrt(0.2² + 0.2² + 0.12²) ≈ 0.3072

frameCamera(camera, huge):  huge = Mesh(SphereGeometry(radius=50))
  box.setFromObject(huge) → size = (100, 100, 100), center = (0, 0, 0)
  maxDimension = max(100, 100, 100, 0.001) = 100
  distance = 100 * 2 = 200
  camera.position = (0+200, 0-200, 0+120) = (200, -200, 120)  ← overwrites the tiny-object values
  camera.near = 100/100 = 1; camera.far = 100*100 = 10000
  return center = (0, 0, 0)
distance from camera.position to (0,0,0) = sqrt(200² + 200² + 120²) ≈ 307.25
```

The second call doesn't combine with or average against the first —
`camera.position`, `.near`, and `.far` are simply overwritten wholesale,
which is exactly why calling `frameCamera` again on a different object
correctly re-frames the view instead of leaving stale values behind.
The two real distances (`0.307...`, `307.245...`) differ by exactly
1000×, the same ratio as the two spheres' own radii (`0.05` vs `50`) —
confirming the formula scales linearly with object size, with no
hidden size-specific branch anywhere in `frameCamera`.

## CS Lens

This is **fit-to-content** — computing a view transform from the real,
current bounds of what's being displayed, rather than from a fixed
assumption. The same underlying idea as an image viewer's own "fit to
window," a PDF reader's "fit page," or a code editor's "zoom to
selection" — in every case, the real content is measured first, and the
view is derived from that measurement, not the other way around.

## SE Lens

The real, concrete failure a fixed camera position produces isn't a
crash — it's a silently wrong-looking result: an object that's
technically rendered correctly, just impossible to actually see at a
useful scale. This is easy to miss during development if every test
object happens to be a similar size, and only surfaces once real,
varied-sized content (here: real tools ranging from a fraction of an
inch to several inches) is actually exercised — a real argument for
testing with realistically varied real data, not just one convenient
example.

## Connection

Builds on `threejs-renderer-scene-camera.md` (the camera/scene
relationship this technique adjusts). Pairs with `OrbitControls`
(`threejs-orbitcontrols.md`) by feeding its own `target` from the same
bounding-box center, so orbiting rotates around the content itself, not
around whatever fixed point a camera happened to start at.

## Try It Yourself

1. Change `distance`'s own multiplier (try `1.2` and `4`) and observe
   how tightly vs. loosely the same real object gets framed — confirm
   there's a real, visible tradeoff, not a single objectively correct
   value.
2. Add a second object far away from the first (e.g. at `position.x =
   1000`) before calling `frameCamera` on their shared parent group —
   observe the camera zooming out dramatically to fit both, and reason
   about whether that's actually the desired behavior for every real
   use case (sometimes "fit everything" is wrong, and "fit just the
   thing the user is looking at" is what's actually needed).
3. Remove the `, 0.001` fallback from `maxDimension` and pass an empty
   `THREE.Group` (no real content at all) to `frameCamera` — observe
   what happens to `camera.near`/`camera.far` when `maxDimension` is
   allowed to be exactly `0`, and explain why the fallback exists.
