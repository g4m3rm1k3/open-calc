# Concept: The Renderer/Scene/Camera Triad (3D Graphics Fundamentals)

**What you'll understand by the end:** why a 3D picture on a web page always requires three distinct, cooperating objects — none of which is optional, and none of which does either of the others' jobs.

**Prerequisites:** none (a general 3D-graphics/browser concept; the isolated example uses Three.js as a concrete, runnable implementation).

## Setup

A browser, plus Three.js:
```
npm install three
```

## The Problem

There is no single "3D view" object in real-time graphics. A picture requires: something that actually turns 3D data into pixels on a screen (a **renderer**), a data structure holding everything that conceptually exists in the 3D world (a **scene**), and a defined point of view to draw that world *from* (a **camera**). Skipping any one of the three leaves nothing visible: a renderer with no scene has nothing to draw; a scene with no camera has no defined viewpoint to render it from; a camera with no renderer never becomes actual pixels.

## The Isolated Example

```typescript
import * as THREE from "three";

const container = document.body;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(400, 300);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, 400 / 300, 0.1, 1000);
camera.position.set(0, 0, 5);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x46d89f });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

renderer.render(scene, camera);
```

**Real result, loaded in a browser:** a green square (a cube, viewed face-on) rendered into a real `<canvas>` element appended to the page.

**Removing just the `scene.add(cube)` line, everything else unchanged:** the canvas renders — a real, functioning renderer and camera — but shows only the background color: an empty scene, correctly rendered as empty.

**Removing `renderer.render(scene, camera)` instead, restoring `scene.add(cube)`:** the canvas exists (a real, blank rectangle appended to the page) but is never drawn into — proving the renderer only produces pixels when explicitly told to render a specific scene from a specific camera; nothing happens automatically.

**What this proves:** each of the three pieces is independently necessary and independently checkable — removing any one produces a distinct, diagnosable kind of "nothing" (an empty scene renders as background color; an unrendered canvas stays blank), not one single generic failure.

## Mechanical Walkthrough

- The **renderer** (`THREE.WebGLRenderer`) owns a real `<canvas>` DOM element (`.domElement`) and knows how to use the browser's underlying WebGL graphics API to turn a scene, as seen by a camera, into actual pixels. It must be sized (`.setSize`) and inserted into the page (`appendChild`) before anything it draws is visible.
- The **scene** (`THREE.Scene`) is an empty container until objects are explicitly added to it (`scene.add(...)`) — nothing exists in it by default, and nothing outside it is ever drawn, no matter how the camera or renderer are configured.
- The **camera** (`THREE.PerspectiveCamera`) defines a viewpoint: a position, a direction, a field of view, and near/far clipping distances (how close/far something can be before it stops rendering). A camera exists independently of the scene it's used to view — the same camera object could, in principle, be pointed at a different scene.
- `renderer.render(scene, camera)` is the one call that actually combines all three: draw *this* scene, as seen from *this* camera, using *this* renderer — nothing is drawn automatically or continuously without this call (or a repeated call inside a render loop; see `browser-request-animation-frame.md`).

## CS Lens

This is a real, concrete instance of **separation of concerns** applied to a rendering pipeline: "what exists" (scene), "how it's viewed" (camera), and "how it becomes pixels" (renderer) are three genuinely independent responsibilities, each swappable without touching the others — a second camera looking at the same scene from a different angle needs no change to the renderer or the scene's contents at all.

Also recognized in: essentially every real-time 3D API (OpenGL, DirectX, Vulkan, every game engine built on them) uses this same three-part decomposition, sometimes under different names (a "viewport" or "camera component" instead of a bare camera object) but never collapsing the three responsibilities into one. Photography itself is the physical-world version: a scene (what's physically present), a lens/viewpoint (the camera's position and field of view), and film or a sensor (what actually captures the light) are three distinct physical things even outside computing.

## SE Lens

Keeping these three responsibilities in genuinely separate objects (rather than, say, one large object handling scene contents, camera state, and drawing all at once) is what makes each piece independently testable and replaceable — a scene's contents can be constructed and inspected with no renderer or camera involved at all, and a camera's position/orientation logic can be unit-tested with no actual rendering happening. Collapsing them together is a common early mistake in graphics code that makes later changes — swapping renderers, adding a second camera for a minimap, testing scene construction in isolation — far harder than they need to be.

## Connection

Builds on nothing beyond general programming; `threejs-orbitcontrols.md` (an object that manipulates a camera), `threejs-lighting-basics.md` and `threejs-geometry-material-object.md` (things added *to* a scene), and `browser-request-animation-frame.md` (repeatedly calling `renderer.render(...)` over time) all build directly on this triad.

## Try It Yourself

1. Create two different `PerspectiveCamera` objects with different `.position` values, and call `renderer.render(scene, cameraA)` followed immediately by `renderer.render(scene, cameraB)` — confirm the second call's result is what actually ends up on screen (the canvas only ever shows the *most recent* render call's result), and reason about what a real split-screen or minimap view would require instead (rendering to two different canvases, or into different regions of one).
2. Change the camera's field-of-view argument (the first `PerspectiveCamera` constructor argument, in degrees) to a much larger number (e.g. 120) and re-render — observe the visible "fisheye" distortion effect, and connect it back to the identical field-of-view concept in real photography.
3. Add a second `Mesh` to the scene at a different `.position`, and change the camera's `.position` to view the scene from a different angle — confirm both objects render correctly relative to each other, proving the scene's contents and the camera's viewpoint are tracked completely independently.
