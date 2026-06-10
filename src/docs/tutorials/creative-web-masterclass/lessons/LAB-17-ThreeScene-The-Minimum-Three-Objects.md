# Creative Web Masterclass — LAB 17 — Three.js Scene: The Minimum Three Objects

**Prerequisites:** LAB-16. You know canvas setup, the animation loop, and requestAnimationFrame.

**What this lab adds:**
- Three.js loaded from CDN — no npm needed
- `scene` — the container that holds everything
- `camera` — defines what the viewer sees and from where
- `renderer` — draws the scene to a `<canvas>` using WebGL
- `BoxGeometry` + `MeshBasicMaterial` + `Mesh` — your first 3D object
- The Three.js animation loop

**Time:** 55–70 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │                                                      │
 │              ╔══════════╗                            │
 │              ║          ║                            │
 │              ║   cube   ║  ← rotating purple box     │
 │              ║          ║                            │
 │              ╚══════════╝                            │
 │                                                      │
 └──────────────────────────────────────────────────────┘
   A purple wireframe box rotating in 3D space.
   Minimum possible Three.js scene: 3 objects, 1 mesh.
```

---

> **Quick Check — answer before reading further:**
>
> 1. The Canvas 2D API (`ctx.fillRect`) draws rectangles — you control every pixel. WebGL
>    draws GPU-accelerated 3D graphics. What is Three.js's relationship to WebGL?
> 2. To show anything in 3D, you need something to look at, a point to look from, and
>    something to show it on. What do these correspond to in Three.js?
> 3. In 3D space, every object has three types of transformation: position, rotation, and
>    scale. How many axes does each have?
>
> *(Answers at the end)*

---

## Concept: Scene, Camera, Renderer — The Three Mandatory Objects

**What they are:** Every Three.js project starts with exactly three objects. Without all
three, nothing is visible.

```
scene    = a container that holds everything (objects, lights, cameras)
camera   = defines the viewpoint and projection (what is visible and how)
renderer = takes the scene + camera and draws the result to a canvas
```

**The relationship:**

```
scene ───contains──→ mesh (the cube)
camera ─knows about→ scene (what to look at)
renderer ─takes────→ scene + camera → draws to <canvas>
```

You call `renderer.render(scene, camera)` to draw one frame. In the animation loop, you
call this every frame.

**Canonical example:**

```js
import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);  // adds the <canvas> to the page

renderer.render(scene, camera);   // draw one frame
```

**What it hides:** WebGL context creation, shader compilation, GPU buffer allocation,
draw call batching, depth testing, clipping. `renderer.render(scene, camera)` performs
all of these. You see: "draw this scene from this camera angle."

**Project Application:**
Every Three.js scene in this course (LAB-17 through LAB-23 and LAB-30) starts with exactly
these three objects. The names `scene`, `camera`, and `renderer` are always used — never
renamed.

**Watch for:** `renderer.domElement` is the actual `<canvas>` element. You append it to
the document. Unlike LAB-14's canvas (which you created in HTML), Three.js creates the
canvas for you — you just add it to the page.

---

## Concept: `PerspectiveCamera`

**What it is:** The most common camera type. It simulates the way human eyes see —
objects farther away appear smaller. Defined by four numbers:

```js
new THREE.PerspectiveCamera(fov, aspect, near, far)
```

| Parameter | Meaning | Typical value |
|---|---|---|
| `fov` | Field of view in degrees — how wide the "lens" is | 60–75 |
| `aspect` | Width / height — prevents distortion | `canvas.width / canvas.height` |
| `near` | Objects closer than this distance are clipped | `0.1` |
| `far` | Objects farther than this distance are clipped | `1000` |

**Canonical example:**

```js
const camera = new THREE.PerspectiveCamera(
  75,                       // 75 degree field of view
  window.innerWidth / window.innerHeight,  // aspect ratio
  0.1,                      // clip objects closer than 0.1 units
  1000                      // clip objects farther than 1000 units
);
camera.position.z = 5;      // move camera back 5 units along Z axis
```

Three.js uses a **right-hand coordinate system**: X points right, Y points up, Z points
toward the viewer. Moving the camera to `z = 5` places it 5 units in front of the scene
origin. The cube (at origin) is now visible.

**Watch for:** If you forget `camera.position.z = 5` (or some positive Z), the camera
sits at the origin — inside the cube — and you see nothing (you are inside the geometry).
Always move the camera back before rendering.

---

## Concept: Geometry + Material + Mesh

**What they are:** Three.js separates the *shape* from its *surface appearance*:

```
Geometry = the shape (a box, sphere, plane — pure mathematics, no color)
Material = the surface appearance (color, texture, how it reacts to light)
Mesh     = geometry + material combined into a drawable object
```

**Canonical example:**

```js
const geometry = new THREE.BoxGeometry(1, 1, 1);    // a 1×1×1 unit cube
const material = new THREE.MeshBasicMaterial({ color: 0x6c63ff });  // purple, ignores lighting
const cube = new THREE.Mesh(geometry, material);    // combine them

scene.add(cube);   // add to the scene — now the renderer knows it exists
```

`0x6c63ff` is a hex color in JavaScript's numeric format (same as CSS `#6c63ff` but with
`0x` prefix instead of `#`).

**`MeshBasicMaterial`:** Does not need lighting — the object appears flat and fully bright
at all times. Good for prototyping and wireframes. Later labs use `MeshStandardMaterial`
which responds to lights.

**Watch for:** You must call `scene.add(cube)` or the mesh is never rendered. Creating
a `Mesh` does not automatically add it to the scene — the scene is just a container, you
must explicitly place objects in it.

---

## Concept: The Three.js Coordinate System

**What it is:** Three.js uses a right-hand coordinate system. Looking at the scene:
- X points right
- Y points up
- Z points toward you (out of the screen)

The scene origin is (0, 0, 0). New objects are placed there by default.

```
        Y (up)
        │
        │
        │
        └──────── X (right)
       /
      /
     Z (toward viewer)
```

Transformations:
```js
cube.position.set(2, 0, 0);     // move 2 units to the right
cube.rotation.y = Math.PI / 4;  // rotate 45 degrees around the Y axis
cube.scale.set(2, 2, 2);        // double in all dimensions
```

Rotation is in **radians**. `Math.PI` is 180°. `Math.PI / 2` is 90°. `Math.PI * 2` is
a full 360° rotation.

---

## Step 1 — Create Files

`projects/lab-17/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 17 — Three.js Scene</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <!-- Three.js from CDN — always import maps for clean import syntax -->
    <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      }
    }
    </script>

    <!-- main.js must be type="module" to use import statements -->
    <script type="module" src="main.js"></script>
  </body>
</html>
```

The `<script type="importmap">` tells the browser how to resolve `import * as THREE from 'three'`
— it maps the bare name `'three'` to the CDN URL. Without the importmap, the browser would
look for a file literally named `'three'` and fail.

`<script type="module">` is required for ES module `import` syntax. Modules also have strict
mode and isolated scope by default.

---

> **CSS AND SEE**
>
> Open with Live Server.
>
> **You should see:** An empty page. The Three.js library loads silently. No errors in
> the Console (if you see `Failed to load` errors, check that you are using Live Server —
> `type="module"` requires a real HTTP server, not opening the HTML file directly).

---

## Step 2 — Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: #0d0d1a;
  overflow: hidden;
}

/* Three.js creates the canvas — select it by element type */
canvas {
  display: block;
}
```

---

## Step 3 — Scene, Camera, Renderer

`main.js`:

```js
import * as THREE from 'three';

// ---- SCENE ----
// The container — all objects, lights, and cameras go in here
const scene = new THREE.Scene();

// ---- CAMERA ----
const camera = new THREE.PerspectiveCamera(
  75,                                        // field of view: 75 degrees
  window.innerWidth / window.innerHeight,    // aspect ratio
  0.1,                                       // near clip
  1000                                       // far clip
);
camera.position.z = 5;   // move camera back — without this we are inside the cube

// ---- RENDERER ----
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);   // sharp on high-DPI screens
document.body.appendChild(renderer.domElement);    // add the canvas to the page

// ---- RESIZE HANDLER ----
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();   // must call this after changing camera properties
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

After `renderer.setSize`, the renderer has created a `<canvas>` element. `renderer.domElement`
is that canvas. `document.body.appendChild(renderer.domElement)` adds it to the page.

The resize handler does three things: updates the camera aspect ratio, calls
`updateProjectionMatrix()` to recalculate the camera's projection (required after any
camera property change), and resizes the renderer.

---

> **SAVE AND TRY**
>
> **You should see:** A solid dark background — the Three.js canvas covering the entire
> window. Nothing else yet — we have a scene, camera, and renderer, but no objects and no
> render call.
>
> **In DevTools Elements panel:** You should see a `<canvas>` element inside `<body>` —
> Three.js added it. It has `width` and `height` attributes matching the window size.

---

## Step 4 — Add a Cube and Render One Frame

```js
// ---- GEOMETRY ----
const geometry = new THREE.BoxGeometry(1, 1, 1);   // 1×1×1 unit cube

// ---- MATERIAL ----
const material = new THREE.MeshBasicMaterial({
  color: 0x6c63ff,     // purple — using hex number, not hex string
  wireframe: false     // solid fill (set to true for wireframe outline)
});

// ---- MESH ----
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);   // add to scene — the renderer will now include it

// ---- RENDER ONE FRAME ----
renderer.render(scene, camera);
```

---

> **SAVE AND TRY**
>
> **You should see:** A solid purple square in the center of the screen. It looks like a
> 2D square — because `MeshBasicMaterial` is unlit and the cube is axis-aligned (face-on
> to the camera). Rotate it to see the 3D shape.
>
> **In DevTools Console:**
> ```js
> cube.rotation.y = 0.5   // does NOT update the screen — no render loop yet
> ```
> Nothing changes — `renderer.render` was called once and the scene is now static.
>
> **Change something:** Change `wireframe: false` to `wireframe: true`. A purple wireframe
> outline of the cube appears — you can see all 12 edges. Change back to `false`.

---

## Step 5 — Animation Loop

Add the `animate` function to make the cube rotate:

```js
function animate() {
  // Rotate the cube a small amount each frame
  cube.rotation.x += 0.005;   // tip forward slowly
  cube.rotation.y += 0.01;    // spin horizontally (faster)

  renderer.render(scene, camera);   // draw the current frame
  requestAnimationFrame(animate);   // schedule the next frame
}

animate();   // start the loop (call animate directly — it schedules itself)
```

`cube.rotation.x += 0.005` adds a small radian value each frame. At 60fps, the cube
completes one full `x` rotation in `(2 * Math.PI) / (0.005 * 60) ≈ 21 seconds`.
`y` rotation at `0.01` completes in about 10.5 seconds.

---

> **SAVE AND TRY**
>
> **You should see:** The purple cube rotating — tipping forward slowly and spinning faster
> on the Y axis. Because it has three visible dimensions, you can see the 3D shape clearly.
>
> **Change something:** Change `cube.rotation.y += 0.01` to `cube.rotation.y += 0.05`.
> The cube spins much faster. Try `cube.rotation.z += 0.008` — the cube also rolls sideways.
>
> **In DevTools Console:**
> ```js
> cube.rotation.y   // current Y rotation value — changes each frame
> cube.position.x = 2   // moves the cube to the right — updates live
> ```
> Moving `cube.position.x` updates live because the animation loop calls
> `renderer.render(scene, camera)` every frame — it reads the current state of all objects
> each time.

---

## 🎯 Challenge: Second Mesh, Different Shape

**You know:** `scene.add`, geometry, material, mesh, `position.set`.

**Task:** Add a second object to the scene — a sphere that orbits the cube. Use
`THREE.SphereGeometry(0.4, 16, 16)` for the geometry. Place it at `position.set(2, 0, 0)`.
Give it a different color. In the `animate` function, make the sphere orbit the cube by
updating its position every frame using `Math.sin` and `Math.cos`:

```js
sphere.position.x = Math.cos(angle) * 2;
sphere.position.z = Math.sin(angle) * 2;
angle += 0.02;
```

You will need to declare `let angle = 0` before the `animate` function.

---

<details>
<summary>▶ Show Solution</summary>

```js
const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

let angle = 0;

function animate() {
  cube.rotation.x += 0.005;
  cube.rotation.y += 0.01;

  angle += 0.02;
  sphere.position.x = Math.cos(angle) * 2;
  sphere.position.z = Math.sin(angle) * 2;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
```

**Key insight:** Both the cube and sphere are updated inside a single `animate` function.
Three.js, like the canvas particle system, uses the same update-render-schedule pattern.
The `renderer.render(scene, camera)` call draws every object in the scene each frame.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Three.js canvas fills window | Canvas covers entire viewport |
| Cube visible and colored | Purple box in center of screen |
| Cube rotates smoothly | Continuous rotation, no stutter |
| Resize redraws correctly | Resize browser — cube stays centered |
| No console errors | DevTools Console shows no red errors |

---

## What's Next

LAB 18 adds proper geometry shapes and materials — `MeshStandardMaterial` reacts to
lights, making objects look truly 3D. You will add ambient and directional light to the
scene.

---

## Transfer Exercise

Three.js's `scene`/`camera`/`renderer` structure maps directly to real-time 3D engines.
In Unity: the `Scene` is Unity's scene, the `Camera` component is the camera, and Unity's
rendering pipeline is the renderer. In Unreal Engine: the World is the scene, `CameraActor`
is the camera, and the renderer is built into the engine.

Describe what `renderer.render(scene, camera)` does at the GPU level. What GPU operations
occur between calling this function and the pixels appearing on screen?

---

## Quick Check Answers

**1. What is Three.js's relationship to WebGL?**
Three.js is a high-level abstraction built on top of WebGL. WebGL is a low-level JavaScript
API that communicates with the GPU — you write GLSL shader code, manually manage vertex
buffers, and handle the full graphics pipeline. Three.js wraps all of this: `new THREE.Mesh()`
hides the vertex buffer creation, shader compilation, and draw call setup. You work with
objects and materials instead of GPU buffers.

**2. What are the three mandatory Three.js objects?**
`scene` (what to look at — contains all objects), `camera` (the viewpoint — where we are
looking from and how the view is projected), and `renderer` (the drawing engine — takes
scene + camera and renders pixels to a canvas). All three are required; without any one
of them, `renderer.render(scene, camera)` fails or produces nothing.

**3. How many axes does each transformation type have?**
All three transformation types have three axes each — X, Y, and Z:
- `position`: `position.x`, `position.y`, `position.z` — location in 3D space
- `rotation`: `rotation.x`, `rotation.y`, `rotation.z` — angle around each axis in radians
- `scale`: `scale.x`, `scale.y`, `scale.z` — size multiplier on each axis
Each axis is independent. You can position an object at `(2, 0, 0)` and rotate it only
on Y without affecting its X/Z rotation.
