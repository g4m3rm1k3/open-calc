# eCaM v2 — LAB 01 — The Math, The Graph, and The Engine

**Read your previous Canvas 2D tutorials first.** This lab assumes you understand the DOM, the concept of a "render loop", and basic JavaScript objects.

**What this lab adds over 2D Canvas:**
- A deep understanding of 3D mathematical space (Vectors and Matrices).
- The Scene Graph: A hierarchical Tree data structure holding your objects.
- Bridging JavaScript memory to GPU memory via the `WebGLRenderer`.
- Abstracting raw WebGL state machines using Three.js.

---

## What You Will Build

By the end of this lab, you will have built the absolute core foundation of a CAD/Game engine. You will see a 3D coordinate grid, color-coded X/Y/Z axes, and a geometric primitive (a cube) rendering in the center of the screen.

More importantly, you will understand the exact data structures JavaScript is holding in memory, and how they mathematically translate into the pixels you see.

---

### Concept: The Right-Handed 3D Coordinate System

**What it is:** The mathematical space where all your geometry lives. Three.js uses a "Right-Handed" coordinate system.
- `+X` points to the Right.
- `+Y` points Up.
- `+Z` points OUT of the screen, towards your face.

**The problem before:** In 2D Canvas, `(0,0)` is the top-left corner, and `+Y` goes *down*. In 3D, if you mix up your axes, your CAD assemblies will build themselves inside out or upside down.

**The solution:** Adopt the Right-Hand Rule. Hold your right hand out. Point your thumb Right (X). Point your index finger Up (Y). Point your middle finger towards yourself (Z). 

**Example — smallest possible:**
```js
// Moving an object 5 units towards the camera
object.position.z = 5; 
// Moving an object 5 units UP
object.position.y = 5;
```

**Why it matters here:** Every position, rotation, and camera placement we write from now on requires you to visualize this exact 3D grid in your head.

**Watch for:** Other software (like Blender or Unity) sometimes use Left-Handed or Z-Up systems. When importing models later, you must remember that Three.js is strictly Y-Up, Right-Handed.

---

### Concept: Vectors (`THREE.Vector3`)

**What it is:** A JavaScript object containing `x`, `y`, and `z` properties, bundled with dozens of mathematical methods (like calculating distance, dot products, or normalizing). It represents either a *Point* in space, or a *Direction* and *Magnitude*.

**The problem before:** 
```js
// Managing math with primitive numbers
let obj1X = 5, obj1Y = 10, obj1Z = 0;
let obj2X = 2, obj2Y = -4, obj2Z = 1;
// Calculating distance requires writing the Pythagorean theorem manually
let dist = Math.sqrt(Math.pow(obj2X - obj1X, 2) + Math.pow(obj2Y - obj1Y, 2) + Math.pow(obj2Z - obj1Z, 2));
```

**The solution:** Use a Vector object that encapsulates the math.
```js
const pos1 = new THREE.Vector3(5, 10, 0);
const pos2 = new THREE.Vector3(2, -4, 1);
const dist = pos1.distanceTo(pos2);
```

**Why it matters here:** Three.js uses `Vector3` internally for *everything*. An object's `position` property is a `Vector3`. Its `scale` is a `Vector3`. 

**Watch for:** Vectors are Objects (reference types) in JavaScript. If you do `const a = b.position; a.x = 10;`, you just modified `b`'s position. You did not make a copy. Use `a.copy(b.position)` to copy values without linking references.

---

## Step 1 — The Engine Shell and Imports

Let's set up the blank HTML and the JavaScript entry point. We do not write a `<canvas>` tag in HTML; WebGL is heavily dependent on specific contexts, so we let Three.js generate the canvas for us.

Open `index.html` and replace it with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Masterclass Engine</title>
  <style>
    /* Reset margins so the canvas fills the whole screen without scrollbars */
    body { margin: 0; overflow: hidden; background-color: #000; }
  </style>
</head>
<body>
  <!-- The script MUST be type="module" to support ES6 imports -->
  <script type="module" src="/main.js"></script>
</body>
</html>
```

Open `main.js` and add:

```js
// ── Imports ──────────────────────────────────────────────────────────────────
// We import the entire library into the 'THREE' namespace.
// In a production CAD app, you might import only what you need to save memory,
// but for learning, having the entire THREE object available in the console is invaluable.
import * as THREE from 'three';

console.log("Engine initialized. Three.js version:", THREE.REVISION);
```

### SAVE AND TRY

Save. Run your dev server (`npm run dev`). Open `http://localhost:5173`.

You should see: A completely black screen.

In DevTools Console, type:
  `new THREE.Vector3(0, 5, 0).length()`
Expected: `5` (The length/magnitude of a vector pointing 5 units up is 5).

Change `console.log(...)` to `console.log(new THREE.Vector3(1, 1, 1).length());`. Save. 
You should see `1.7320508...` (the square root of 3).
Change it back or remove it.

---

### Concept: The Scene Graph (Tree Data Structure)

**What it is:** A hierarchical tree of objects. It starts with a root node (the `Scene`), which has children (like `Group` or `Mesh`), which can have their own children.

**The problem before:** In Canvas 2D (Immediate Mode), you write procedural commands: `ctx.fillRect()`. The computer forgets the rectangle immediately. If you want to move the rectangle, you must clear the screen and issue the command again at a new coordinate. In 3D, calculating lighting, depth sorting, and occlusion for millions of polygons procedurally every frame is impossible for a human to manage.

**The solution:** Retained Mode. You create an object in JavaScript memory (a Node), add it to the Scene Tree, and leave it there. When you ask the engine to render, it traverses the tree from the root down to the leaves, mathematically computing where everything is, and draws it all for you.

**Example:**
```js
const scene = new THREE.Scene();
const car = new THREE.Group();
const wheel = new THREE.Mesh(geometry, material);

car.add(wheel); // Wheel is a child of Car
scene.add(car); // Car is a child of Scene
```
If you move the `car`, the `wheel` moves with it, because the math multiplies the child's local coordinates by the parent's world coordinates automatically.

**Why it matters here:** Three.js is entirely driven by the Scene Graph. If an object is not connected to the `Scene` root node, it will never be drawn.

---

## Step 2 — Initializing the Scene

Add this to `main.js`:

```js
// ── Core Engine: The Scene Graph ─────────────────────────────────────────────

// The Scene is the root node of our Tree data structure.
// Everything we want to render MUST be added as a child of this object.
const scene = new THREE.Scene();

// Set a background color (Dark Gray for a CAD software vibe)
scene.background = new THREE.Color('#1e1e1e');
```

### SAVE AND TRY

Save. Open the app.

You should see: Still a black screen! Wait, we set the background to dark gray? Yes, but we haven't created a Renderer yet to actually *paint* the Scene to the monitor. The Scene just exists in invisible JS memory.

In DevTools Console (temporarily add `window.scene = scene;` to your code if you need to access it), type:
  `scene.type`
Expected: `"Scene"`
  `scene.children.length`
Expected: `0` (We haven't added any objects yet).

---

### Concept: The Camera (Frustum and Aspect Ratio)

**What it is:** A mathematical object that defines *what part* of the 3D scene is visible, and *how* that 3D space is projected onto a 2D flat monitor. 

**The problem before:** Converting a 3D point `(x, y, z)` into a 2D pixel `(x, y)` requires multiplying the point by a "Projection Matrix". Building this matrix manually requires hardcore linear algebra involving Field of View (FOV) tangents and clipping planes.

**The solution:** `THREE.PerspectiveCamera`. You give it human-readable parameters, and it builds the Projection Matrix for you.

**Constructor Signature:**
`new THREE.PerspectiveCamera(fov, aspect, near, far)`
- `fov`: Field of View in degrees. How wide the lens is (human eye is roughly 50-60).
- `aspect`: Aspect Ratio. Width divided by Height of your monitor. Prevents stretching.
- `near`: The closest distance the camera can see. Anything closer is "clipped" (cut away).
- `far`: The furthest distance. Anything further is clipped. 

The shape created by FOV, near, and far is a 3D pyramid with the top chopped off. This shape is called a **Frustum**.

**Why it matters here:** Without a camera, the renderer doesn't know from what angle to calculate the image. 

---

## Step 3 — The Camera

Add this to `main.js`:

```js
// ── Core Engine: The Camera ──────────────────────────────────────────────────

const VIEW_ANGLE_DEGREES = 50; // Standard, minimal distortion
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR_CLIP_PLANE = 0.1;   // Don't render things closer than 0.1 units (prevents dividing by zero)
const FAR_CLIP_PLANE = 1000;   // Don't render things further than 1000 units (saves GPU memory)

const camera = new THREE.PerspectiveCamera(
  VIEW_ANGLE_DEGREES,
  ASPECT_RATIO,
  NEAR_CLIP_PLANE,
  FAR_CLIP_PLANE
);

// By default, objects are created at (0, 0, 0).
// If the camera is also at (0, 0, 0), it is INSIDE the objects.
// We pull the camera back +5 units on the Z-axis (towards our face) and +5 on the Y-axis (Up).
camera.position.set(0, 5, 5);

// The camera is now high up, but looking straight forward. We need it to look DOWN at the center.
// lookAt builds a "View Matrix" that rotates the camera to face a specific Vector3.
const ORIGIN = new THREE.Vector3(0, 0, 0);
camera.lookAt(ORIGIN);
```

### SAVE AND TRY

Save. Open the app.
Still no visual change (no renderer yet). 

In DevTools Console (expose `window.camera = camera`), type:
  `camera.position.y`
Expected: `5`

---

### Concept: The `WebGLRenderer` (The State Machine)

**What it is:** The actual engine that translates your JavaScript Scene Graph and Camera into raw GLSL (OpenGL Shading Language) and executes it on your computer's GPU.

**The problem before:** Writing raw WebGL requires defining data buffers, writing C-like shader programs as strings, compiling them at runtime, and manually flipping hundreds of binary switches (state) on the GPU before every draw call. It takes ~200 lines of code just to draw a single colored triangle.

**The solution:** The `WebGLRenderer` automates the GPU state machine. When you call `renderer.render(scene, camera)`, it analyzes the graph, compiles shaders automatically, pushes data to the GPU, and draws the pixels.

**Example:**
```js
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias smooths jagged edges
renderer.setSize(800, 600); // Sets internal canvas resolution
document.body.appendChild(renderer.domElement); // domElement is the actual <canvas>
```

**Why it matters here:** This is the execution step. This is where JavaScript ends and hardware graphics processing begins.

---

## Step 4 — The Renderer

Add this to `main.js`:

```js
// ── Core Engine: The Renderer ────────────────────────────────────────────────

// antialias: true makes diagonal lines smooth instead of stair-stepped.
// This is critical for CAD applications where precision lines matter.
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Tell the renderer how many pixels it has to work with.
renderer.setSize(window.innerWidth, window.innerHeight);

// For crisp rendering on Retina/High-DPI displays (like MacBooks or phones).
// Without this, the canvas will look blurry because 1 CSS pixel != 1 Hardware pixel.
renderer.setPixelRatio(window.devicePixelRatio);

// Extract the <canvas> element the renderer generated and put it in the HTML body.
document.body.appendChild(renderer.domElement);

// Take a single picture of the scene using the camera, and paint it to the canvas.
renderer.render(scene, camera);
```

### SAVE AND TRY

Save. Open the app.

You should see: A dark gray screen! The `scene.background` color is finally being rendered.

In DevTools Console, type:
  `document.querySelector("canvas").width`
Expected: Your screen's physical pixel width (e.g., `1920` or double that if on a Retina display, proving `setPixelRatio` worked).

Change `scene.background = new THREE.Color('#1e1e1e');` (in Step 2) to `'#ff0000'`. Save. 
You should see a bright red screen.
Change it back.

---

### Concept: Primitives and Helpers

**What it is:** Three.js comes with built-in geometry generators (Primitives like `BoxGeometry`, `SphereGeometry`) and visualization aids (Helpers like `AxesHelper`, `GridHelper`).

**The problem before:** Defining a cube requires manually typing an array of 24 vertices (X,Y,Z coordinates) and 36 indices (connecting the vertices into 12 triangles).

**The solution:** `new THREE.BoxGeometry(width, height, depth)` calculates all the vertices, triangles, and Normal vectors for you. 

**Why it matters here:** We need visual reference points. A blank screen tells us nothing about scale or orientation. An `AxesHelper` will draw the X, Y, and Z axes so we can physically see the coordinate system we learned in Concept 1.

---

## Step 5 — Adding a Mesh and Helpers

Before the `renderer.render()` call, add some objects to the scene:

```js
// ── Scene Objects ────────────────────────────────────────────────────────────

// 1. A Grid Helper to show the "floor" (XZ plane)
// 10 units wide, divided into 10 squares.
const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
scene.add(gridHelper);

// 2. An Axes Helper to show the origin (0,0,0) and the Right-Hand Rule
// X is Red, Y is Green, Z is Blue (RGB = XYZ)
const axesHelper = new THREE.AxesHelper(2); // Lines are 2 units long
scene.add(axesHelper);

// 3. A basic Cube (Mesh = Geometry + Material)
const geometry = new THREE.BoxGeometry(1, 1, 1);
// wireframe: true lets us see the geometry's edges (the triangles)
const material = new THREE.MeshBasicMaterial({ color: 0x00ffaa, wireframe: true });
const cube = new THREE.Mesh(geometry, material);

// Move the cube up 0.5 units so it sits ON the grid, not halfway through it.
cube.position.y = 0.5;

scene.add(cube);
```

Make sure `renderer.render(scene, camera);` is still at the absolute bottom of the file.

### SAVE AND TRY

Save. Open the app.

You should see: 
- A dark gray background.
- A flat grid on the "floor".
- A Red line pointing right (+X), a Green line pointing up (+Y), and a Blue line pointing towards you (+Z).
- A wireframe cube sitting exactly on the center of the grid.

In DevTools Console (expose `window.cube = cube`), type:
  `cube.geometry.type`
Expected: `"BoxGeometry"`

Change `axesHelper` length to `10`. Save. The red, green, and blue lines should stretch all the way to the edge of the grid.
Change it back to `2`.

---

### Concept: The Render Loop (`requestAnimationFrame`)

**What it is:** A browser API that asks the browser to execute a function right before the next screen repaint (usually 60 or 120 times per second, matching the monitor's refresh rate).

**The problem before:**
```js
// The single render call at the bottom of our file:
renderer.render(scene, camera);
```
This is a static photograph. If we change `cube.position.x = 5`, nothing happens on screen until we manually call `render()` again. 

**The solution:** Recursively call a loop function using `requestAnimationFrame`. Inside the loop, update your physics/logic, and then call `render()`.

**Example:**
```js
function tick() {
  requestAnimationFrame(tick); // Schedule the next frame
  // ... do logic ...
  renderer.render(scene, camera); // Draw this frame
}
tick(); // Start the cycle
```

**Why it matters here:** 3D engines are fundamentally infinite loops. To make the cube spin, or to allow a user to orbit the camera later, the renderer must be constantly repainting.

---

## Step 6 — The Engine Loop

Delete the single line `renderer.render(scene, camera);` at the bottom of the file.

Replace it with the animation loop:

```js
// ── The Engine Loop ──────────────────────────────────────────────────────────

// This function executes once per frame (ideally 60 FPS)
function animate() {
  // 1. Tell the browser to call 'animate' again on the next available frame
  requestAnimationFrame(animate);

  // 2. Game Logic / Math updates
  // Rotate the cube slightly every frame.
  // Rotation is measured in Radians, not Degrees! (Math.PI radians = 180 degrees)
  cube.rotation.y += 0.01;
  cube.rotation.x += 0.005;

  // 3. Draw the updated Scene Graph to the screen
  renderer.render(scene, camera);
}

// Boot the engine
animate();
```

### SAVE AND TRY

Save. Open the app.

You should see: The wireframe cube is now spinning continuously on its X and Y axes. The grid and axes helpers remain perfectly still, proving that object transforms are local to the object.

Change `cube.rotation.y += 0.01;` to `cube.position.x += 0.01;`. Save. 
You should see the cube slide infinitely to the right until it leaves the screen.
Change it back.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| The WebGL Context | The HTML `<body>` contains a dynamically generated `<canvas>` element. |
| Aspect Ratio | The cube looks like a perfect cube, not stretched or squashed. |
| The Scene Graph | The grid, axes, and cube are all visible. Removing `scene.add(cube)` makes the cube disappear. |
| The Right-Hand Rule | The Red line points Right (X), Green points Up (Y), Blue points Out (Z). |
| The Engine Loop | The cube rotates smoothly without manual intervention. |

---

## Mental Model: Immediate vs Retained Rendering

**What it is:** 
- *Immediate Mode* (Canvas 2D): You issue raw draw commands. Memory is transient. You are responsible for remembering what exists.
- *Retained Mode* (Three.js/Scene Graph): You build an object-oriented data structure (the Scene Tree). You pass the tree to the Renderer. The engine retains the memory of the objects and handles the drawing order.

**Where you will see this again:** In LAB-05, we will use the retained data structure to perform Raycasting. Because the objects exist persistently in memory, we can mathematically calculate if a mouse click intersects with them, something that is incredibly difficult in pure Immediate Mode.

---

## Up Next

**[LAB-02 — Geometry, Topology, and Memory](./THREE-LAB-02-GEOMETRY-AND-TOPOLOGY.md)**

You have a spinning wireframe box. But what exactly is that box made of? In LAB-02, we look under the hood of `BufferGeometry`. We will abandon the helpful primitives and manually construct a 3D shape vertex-by-vertex using `Float32Arrays`. You will learn exactly how JavaScript sends bulk numerical data to the GPU memory without crashing the browser.
