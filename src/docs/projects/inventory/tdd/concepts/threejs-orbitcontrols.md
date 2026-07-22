# Concept: Camera-Orbit Controls From a Library

**What you'll understand by the end:** how a real, maintained library turns raw mouse/touch events into smooth camera movement, and why writing that math by hand is rarely the right call.

**Prerequisites:** `threejs-renderer-scene-camera.md`.

## Setup

A browser, plus Three.js and its bundled examples modules:
```
npm install three
```

## The Problem

Letting a user rotate, pan, and zoom a 3D view by dragging with a mouse requires translating raw pixel-delta mouse events into a correct camera rotation/position update — genuinely fiddly geometry (avoiding gimbal lock, correctly handling a camera's "up" direction, smoothly decelerating after a drag ends) that's easy to get subtly wrong and expensive to get exactly right from scratch.

## The Isolated Example

```typescript
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(400, 300);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 400 / 300, 0.1, 1000);
camera.position.set(0, 0, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0, 0);

function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();
```

**Real behavior, in a browser:** dragging inside the canvas rotates the camera around `(0, 0, 0)`; scrolling zooms; releasing the mouse mid-drag lets the camera continue rotating briefly, decelerating smoothly, before coming to rest — all without a single mouse-event handler written by hand.

**What this proves:** `controls.update()`, called once per frame inside the render loop, is the only ongoing work required — `OrbitControls` itself attaches its own real event listeners to `renderer.domElement` when constructed, and manages `camera.position`/`camera.rotation` internally; no application code ever manually reads a mouse event or sets the camera's position after setup.

## Mechanical Walkthrough

- `new OrbitControls(camera, renderer.domElement)` attaches real `mousedown`/`mousemove`/`wheel` (and touch-equivalent) event listeners directly to the given DOM element, and holds a reference to the camera it will modify.
- `controls.target` is the point the camera orbits *around* — not the camera's own position, but the fixed point it continually looks toward and rotates relative to.
- `controls.enableDamping` + `.dampingFactor` add inertia: instead of the camera stopping the instant a drag ends, movement continues and decelerates over subsequent frames — this is *why* `controls.update()` must be called every frame even with no new user input, since the damped motion itself needs to keep progressing.
- `controls.update()` applies one frame's worth of pending movement (from user input, from damping, or both) to the camera it was constructed with — it must run before `renderer.render(...)` each frame for the camera's position to reflect the latest interaction.

## CS Lens

This is a concrete case for **not reimplementing a solved problem**: camera-orbit math is a well-understood, thoroughly-tested piece of logic that a maintained library gets right (correct handling of edge cases like the camera passing directly over its target, consistent behavior across mouse and touch input) in a way a first attempt written under project time pressure is unlikely to match. The engineering judgment isn't "never write your own" — it's recognizing when a problem is common, hard to get subtly right, and already solved well by something maintained and widely used.

Also recognized in: reaching for a regular-expression engine instead of hand-written character-by-character text scanning for a well-defined pattern, or a database's own query planner instead of hand-written data-structure traversal — the same judgment call, applied to a different kind of already-solved problem.

## SE Lens

Depending on a library like this trades a small amount of control (the exact damping curve, the exact input mapping) for a large amount of correctness and maintenance the project never has to own — a real, honest tradeoff, not a free lunch: bugs in the library become the project's bugs too, and an update to the library's own API can require real code changes on the consuming side. The tradeoff is worth it here specifically because camera-orbit interaction is not this project's differentiating feature — the value of building it is entirely in *having it work correctly*, not in how it's implemented internally.

## Connection

Builds directly on `threejs-renderer-scene-camera.md` — `OrbitControls` exists purely to manipulate the camera object that triad already established; it adds no new scene content, only a new way of moving an existing piece.

## Try It Yourself

1. Set `controls.enableDamping = false` and compare the felt difference when releasing a drag mid-motion — with damping off, the camera stops the instant the mouse button is released; with it on, motion continues and decays. Reason about which best matches a real toolpath-viewer's UI expectations.
2. Change `controls.target` to a point away from the origin (e.g. `(50, 0, 0)`) and observe that dragging now orbits around that new point instead — confirm the camera's own `.position` is still what actually moves, `target` only defines what it orbits around.
3. Look up `OrbitControls`' `minDistance`/`maxDistance` and `minPolarAngle`/`maxPolarAngle` options, and add limits that prevent zooming too close or flipping the camera upside down — a real, common refinement for a tool where certain viewing angles wouldn't make sense.
