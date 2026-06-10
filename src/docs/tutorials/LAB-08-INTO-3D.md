# Lab 08 — Into 3D: WebGL and Three.js

### CAM System Masterclass

---

## What You Will Build

By the end of this lab you can:

- **Understand why 3D requires WebGL** — the 2D canvas API cannot project,
  clip, and shade a 3D scene efficiently
- **Set up a Three.js scene** with a camera, renderer, and lights
- **Display CAD geometry in 3D** — your existing lines, arcs, and circles as
  Three.js `Line` objects
- **Orbit, pan, and zoom** the 3D view with `OrbitControls`
- **Show a ground plane grid** with depth cues
- **Run both views side-by-side** — toggle between the 2D canvas and the 3D WebGL view

**Time:** 5–7 hours.

---

## Part 1 — Why WebGL?

### What the 2D canvas can and cannot do

The `<canvas>` 2D context you have used since Lab 01 can draw:

- Lines, arcs, filled shapes
- Text, images
- Transformations (translate, scale, rotate)

It draws in **screen space** — flat, 2D pixels. There is no concept of depth,
perspective, or a camera looking at a scene from an angle.

To do 3D you need:

1. A **model** — 3D coordinates for every object
2. A **view matrix** — how the camera is positioned and oriented
3. A **projection matrix** — how 3D coordinates map to 2D screen pixels
   (perspective foreshortening)
4. A **depth buffer** (z-buffer) — to correctly draw nearer things on top of farther ones
5. Optional: **lighting** — shading based on surface normals and light positions

Implementing this from scratch is hundreds of lines of matrix math. The browser
provides **WebGL** — a low-level GPU API — but it is very verbose. **Three.js**
is the standard JavaScript library that wraps WebGL in a high-level API.

### The Three.js mental model

```
Scene
  ├── Camera         (where we look from)
  ├── Lights         (sun, ambient, etc.)
  ├── Mesh           (geometry + material — visible solid objects)
  └── Line           (BufferGeometry + LineBasicMaterial — wireframe/CAD lines)

Renderer          (draws the Scene from the Camera's perspective onto a <canvas>)
```

A **Mesh** combines:

- `BufferGeometry` — the raw vertex data (array of x,y,z triplets)
- `Material` — how the surface looks (colour, shininess, texture)

---

## Part 2 — Setting Up Three.js

### Installing via CDN (no build tools required)

We continue using ES modules with no bundler. Three.js is available from a CDN
as ES modules.

Update `cam/index.html` to add the Three.js import map and the 3D canvas:

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <title>CAM System</title>
    <link rel="stylesheet" href="css/theme.css" />
    <link rel="stylesheet" href="css/layout.css" />

    <!-- Import map: tells the browser where to find bare module specifiers -->
    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"
        }
      }
    </script>
  </head>
  <body>
    <!-- ... existing toolbar, left panel, etc. ... -->

    <!-- Main content area: two canvases, one visible at a time -->
    <main class="viewport-area">
      <canvas id="cam-canvas" class="viewport-canvas"></canvas>
      <canvas id="cam-canvas-3d" class="viewport-canvas hidden"></canvas>
    </main>

    <!-- View toggle buttons (add to toolbar) -->
    <button class="btn-tool" id="btn-view-2d" title="2D View">2D</button>
    <button class="btn-tool" id="btn-view-3d" title="3D View">3D</button>

    <!-- ... rest of existing HTML ... -->
    <script type="module" src="js/main.js"></script>
  </body>
</html>
```

Add CSS for the hidden canvas:

```css
/* in layout.css */
.viewport-canvas.hidden {
  display: none;
}
```

### Import map explained

An **import map** is a JSON object in a `<script type="importmap">` tag that
maps **module specifiers** (names) to URLs.

Without an import map, `import { Scene } from 'three'` would fail because the
browser does not know where to fetch `three`. The import map tells it:
`'three'` → fetch from the CDN URL.

The `three/addons/` entry maps the path prefix, so
`import { OrbitControls } from 'three/addons/controls/OrbitControls.js'`
becomes a fetch from the CDN.

---

## Part 3 — Your First Three.js Scene

Create `cam/js/renderer/Renderer3D.js`:

```js
// Renderer3D.js
// Three.js scene setup and management.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ── Scene, camera, renderer ────────────────────────────────────────────────────

let scene, camera, renderer, controls, gridHelper;
let _canvas3d = null;
let _animId = null;

export function init3D(canvas) {
  _canvas3d = canvas;

  // ── Renderer ─────────────────────────────────────────────────────────────────
  // WebGLRenderer takes the canvas element so it renders into our existing DOM element.
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true, // smooth edges (MSAA)
  });
  renderer.setPixelRatio(window.devicePixelRatio); // crisp on HiDPI screens
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x1a1a2e, 1); // dark blue-black background

  // ── Scene ─────────────────────────────────────────────────────────────────────
  scene = new THREE.Scene();

  // ── Camera ────────────────────────────────────────────────────────────────────
  // PerspectiveCamera(fov, aspect, near, far)
  // fov   = vertical field of view in degrees (45-75 is typical)
  // aspect = width / height (we update this on resize)
  // near  = anything closer than this is clipped (not drawn)
  // far   = anything farther than this is clipped
  const aspect = canvas.clientWidth / canvas.clientHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 10000);

  // Position the camera: above and slightly angled — like looking at a table
  camera.position.set(0, -200, 150);
  camera.lookAt(0, 0, 0); // look at the origin

  // ── Orbit controls ────────────────────────────────────────────────────────────
  // OrbitControls let the user rotate, pan, and zoom with mouse/touch.
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // smooth deceleration
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true; // pan in screen plane (not around up-axis)

  // ── Grid ─────────────────────────────────────────────────────────────────────
  // GridHelper(size, divisions, centerColour, gridColour)
  // Draws a flat grid on the XY plane (Z=0 in Three.js = Y=0 in our 2D world)
  gridHelper = new THREE.GridHelper(500, 50, 0x444466, 0x333355);
  // GridHelper is flat on Y=0 by default. Rotate to XZ plane to match our XY world.
  // Actually: our world is XY (Z is depth), Three.js default is XZ (Y is up).
  // We choose to keep Three.js Y-up and display our geometry with Z=0.
  scene.add(gridHelper);

  // ── Ambient light ─────────────────────────────────────────────────────────────
  // Ambient light illuminates all surfaces equally (no shadows).
  // Without any light, MeshStandardMaterial would be completely black.
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // ── Directional light ─────────────────────────────────────────────────────────
  // Like sunlight: parallel rays from a direction. Creates shading.
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(100, 200, 100);
  scene.add(dirLight);

  // ── Start the render loop ─────────────────────────────────────────────────────
  animate();

  // ── Resize handling ───────────────────────────────────────────────────────────
  new ResizeObserver(() => onResize()).observe(canvas.parentElement);
}

function onResize() {
  if (!_canvas3d) return;
  const w = _canvas3d.clientWidth;
  const h = _canvas3d.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// ── Render loop ────────────────────────────────────────────────────────────────

function animate() {
  _animId = requestAnimationFrame(animate);
  controls.update(); // required for damping
  renderer.render(scene, camera);
}

export function stop3D() {
  if (_animId !== null) {
    cancelAnimationFrame(_animId);
    _animId = null;
  }
}

// ── Public: update geometry ────────────────────────────────────────────────────

// Call this whenever state.geometry changes.
// Replaces all CAD geometry objects in the scene.
export function updateGeometry(geometryList, gcodeGeometryList = []) {
  // Remove old CAD objects (everything tagged with userData.cadObject)
  const toRemove = [];
  scene.traverse((obj) => {
    if (obj.userData.cadObject) toRemove.push(obj);
  });
  toRemove.forEach((obj) => scene.remove(obj));

  // Add new CAD geometry
  for (const geom of geometryList) {
    const obj = geomToThree(geom, false);
    if (obj) scene.add(obj);
  }

  // Add G-code geometry
  for (const geom of gcodeGeometryList) {
    const obj = geomToThree(geom, true);
    if (obj) scene.add(obj);
  }
}
```

---

## Part 4 — Converting CAD Geometry to Three.js Objects

Every geometry type needs a conversion function.

**Key difference:** Our 2D world has Y pointing up. Three.js has Y pointing up
too — but our geometry is flat (Z=0). We display it lying flat, which in
Three.js means our world XY maps directly to Three.js XZ (with Y=0) — OR we
keep our XY and just set Z=0 for all points and orient the camera looking
"downish" from above.

We choose the simpler option: **keep X and Y, set Z=0**. The camera starts above
the XY plane, looking down and slightly forward. Users rotate with OrbitControls.

Add to `Renderer3D.js`:

```js
// ── Geometry conversion ────────────────────────────────────────────────────────

function geomToThree(geom, isGcode) {
  const colour = pickColour(geom, isGcode);

  if (geom.type === "line") {
    return makeLine([geom.p1, geom.p2], colour, geom);
  }

  if (geom.type === "circle") {
    const pts = sampleCircle(geom.centre, geom.radius, 64);
    return makeLine(pts, colour, geom);
  }

  if (geom.type === "arc") {
    const pts = sampleArc(
      geom.centre,
      geom.radius,
      geom.startAngle,
      geom.endAngle,
      64,
    );
    return makeLine(pts, colour, geom);
  }

  return null;
}

// ── Colour selection ───────────────────────────────────────────────────────────

function pickColour(geom, isGcode) {
  if (geom.selected) return 0x44aaff; // selected: blue
  if (geom.moveType === "rapid") return 0xff4444; // rapid: red
  if (geom.moveType === "feed") return 0x44ddff; // feed: cyan
  if (isGcode) return 0xaaaaaa; // generic gcode: grey
  return 0x88ff88; // normal geometry: green
}

// ── Three.js Line builder ─────────────────────────────────────────────────────

// points: array of {x, y} (our 2D world points, z=0)
function makeLine(points, colour, sourceGeom) {
  const positions = new Float32Array(points.length * 3);
  for (let i = 0; i < points.length; i++) {
    positions[i * 3] = points[i].x;
    positions[i * 3 + 1] = points[i].y;
    positions[i * 3 + 2] = 0; // flat in the XY plane
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({ color: colour });

  const line = new THREE.Line(geometry, material);
  line.userData.cadObject = true;
  line.userData.sourceGeom = sourceGeom;
  return line;
}

// ── Sampling helpers ───────────────────────────────────────────────────────────

// Sample N points on a circle (closed loop)
function sampleCircle(centre, radius, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push({
      x: centre.x + radius * Math.cos(a),
      y: centre.y + radius * Math.sin(a),
    });
  }
  return pts;
}

// Sample N points on an arc from startAngle to endAngle (CCW)
function sampleArc(centre, radius, startAngle, endAngle, n) {
  // Normalise: endAngle should be >= startAngle for CCW
  let ea = endAngle;
  while (ea < startAngle) ea += Math.PI * 2;

  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = startAngle + (ea - startAngle) * (i / n);
    pts.push({
      x: centre.x + radius * Math.cos(a),
      y: centre.y + radius * Math.sin(a),
    });
  }
  return pts;
}
```

### Why `BufferGeometry`?

Three.js uses `BufferGeometry` for all geometry. A buffer geometry stores vertex
data as a flat typed array (`Float32Array`) that lives in GPU memory. This is
far more efficient than an array of JavaScript objects for large meshes.

`BufferAttribute` wraps the typed array and tells Three.js how to interpret it:
`new THREE.BufferAttribute(positions, 3)` means "3 floats per vertex (x, y, z)".

---

## Part 5 — Wiring the View Toggle

Add view-switching logic to `main.js`:

```js
import { init3D, stop3D, updateGeometry } from "./renderer/Renderer3D.js";

const canvas2d = document.getElementById("cam-canvas");
const canvas3d = document.getElementById("cam-canvas-3d");
let _view3dInit = false;
let _currentView = "2d";

function switchTo2D() {
  canvas2d.classList.remove("hidden");
  canvas3d.classList.add("hidden");
  _currentView = "2d";
  document.getElementById("btn-view-2d")?.classList.add("active");
  document.getElementById("btn-view-3d")?.classList.remove("active");
}

function switchTo3D() {
  canvas2d.classList.add("hidden");
  canvas3d.classList.remove("hidden");
  _currentView = "3d";
  document.getElementById("btn-view-2d")?.classList.remove("active");
  document.getElementById("btn-view-3d")?.classList.add("active");

  if (!_view3dInit) {
    init3D(canvas3d);
    _view3dInit = true;
  }
  // Sync geometry to 3D scene
  updateGeometry(state.geometry, state.gcodeGeometry ?? []);
}

document.getElementById("btn-view-2d")?.addEventListener("click", switchTo2D);
document.getElementById("btn-view-3d")?.addEventListener("click", switchTo3D);

// Also update the 3D view whenever geometry changes (if 3D is visible)
// Extend the existing render() function:
const _orig_render = render;
window.render = function () {
  _orig_render(); // always update 2D
  if (_currentView === "3d" && _view3dInit) {
    updateGeometry(state.geometry, state.gcodeGeometry ?? []);
  }
};
```

---

## BUILD 1 — See Your Drawing in 3D

1. Draw some geometry in the 2D view (lines, circles, arcs)
2. Click the **3D** button in the toolbar
3. The 3D view should appear, showing the same geometry as green lines flat on the grid
4. **Orbit**: left-click drag to rotate
5. **Pan**: right-click drag (or middle-click drag)
6. **Zoom**: scroll wheel
7. Click **2D** to return to the flat view

---

## Part 6 — Displaying the Toolpath in 3D

Toolpaths are not flat — they have Z variation (plunge and retract). When we
display them in 3D, we want to show the Z depth.

The backplotted G-code geometry has Z=0 (because our backplotter only captures
XY). For a real toolpath preview, we use the `moves` array directly.

Add to `Renderer3D.js`:

```js
// ── Toolpath display ───────────────────────────────────────────────────────────

// Display a toolpath as 3D lines.
// moves: array of { type, from: {x,y,z}, to: {x,y,z} }
export function updateToolpath(moves) {
  // Remove old toolpath
  const toRemove = [];
  scene.traverse((obj) => {
    if (obj.userData.toolpathObject) toRemove.push(obj);
  });
  toRemove.forEach((obj) => scene.remove(obj));

  if (!moves || moves.length === 0) return;

  // Split by move type for colour coding
  const rapidPoints = [];
  const feedPoints = [];

  for (const m of moves) {
    const pts = [m.from, m.to];
    if (m.type === "rapid") {
      rapidPoints.push(...pts, null); // null = break the line
    } else {
      feedPoints.push(...pts, null);
    }
  }

  if (rapidPoints.length > 0) {
    const obj = makeToolpathLine(rapidPoints, 0xff4444);
    if (obj) {
      obj.userData.toolpathObject = true;
      scene.add(obj);
    }
  }

  if (feedPoints.length > 0) {
    const obj = makeToolpathLine(feedPoints, 0x44ddff);
    if (obj) {
      obj.userData.toolpathObject = true;
      scene.add(obj);
    }
  }
}

// ── Build a line from an array of {x,y,z} points, with nulls as breaks ────────

function makeToolpathLine(points, colour) {
  // Filter out nulls, building separate line segments
  const nonNull = points.filter((p) => p !== null);
  if (nonNull.length < 2) return null;

  const positions = new Float32Array(nonNull.length * 3);
  for (let i = 0; i < nonNull.length; i++) {
    positions[i * 3] = nonNull[i].x;
    positions[i * 3 + 1] = nonNull[i].y;
    positions[i * 3 + 2] = nonNull[i].z ?? 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({ color: colour });
  return new THREE.Line(geometry, material);
}
```

In `cam-panel.js`, after generating a toolpath:

```js
import { updateToolpath } from "../renderer/Renderer3D.js";
// ...
// After generating moves:
updateToolpath(_lastMoves);
```

Now when you generate a toolpath and switch to 3D view, you see the full
3D path — plunges going down, feeds cutting at depth, rapids racing back up to safe Z.

---

## BUILD 2 — Toolpath in 3D

1. Draw a square in 2D, generate a contour toolpath in the CAM panel
2. Switch to 3D view
3. You should see:
   - Green lines: the CAD geometry (flat at Z=0)
   - Cyan lines: the cutting moves (dipping below Z=0 to the cut depth)
   - Red lines: the rapid moves (at safe Z height)
4. Orbit the view to see the depth clearly

---

## Part 7 — Material Stock Visualisation

A professional CAM system shows a 3D block of material (the stock) and the
tool cutting into it. We implement a simple version: a flat box representing
the stock.

Add to `Renderer3D.js`:

```js
let _stockMesh = null;

// Show a transparent stock block.
// bounds: { minX, maxX, minY, maxY }
// depth:  the machining depth (negative, e.g. -5 for 5mm deep)
// thickness: total stock thickness (e.g. 20mm)
export function showStock(bounds, depth, thickness = 20) {
  if (_stockMesh) {
    scene.remove(_stockMesh);
    _stockMesh = null;
  }

  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;

  // BoxGeometry(width, height, depth)
  // In our world: X is right, Y is up (in 2D), Z is into the screen.
  // We display the stock as a box in the XY plane, extending downward in Z.
  const geometry = new THREE.BoxGeometry(w + 20, h + 20, thickness);
  const material = new THREE.MeshStandardMaterial({
    color: 0x8899aa,
    transparent: true,
    opacity: 0.25,
    wireframe: false,
  });

  _stockMesh = new THREE.Mesh(geometry, material);
  _stockMesh.position.set(cx, cy, -(thickness / 2));
  scene.add(_stockMesh);
}

export function hideStock() {
  if (_stockMesh) {
    scene.remove(_stockMesh);
    _stockMesh = null;
  }
}
```

Add a **Stock** toggle button to the CAM panel:

```html
<button class="btn-tool" id="btn-show-stock">Show Stock</button>
```

```js
// In cam-panel.js:
import { showStock, hideStock } from "../renderer/Renderer3D.js";

let _stockVisible = false;

document.getElementById("btn-show-stock")?.addEventListener("click", () => {
  if (_stockVisible) {
    hideStock();
    document.getElementById("btn-show-stock").textContent = "Show Stock";
  } else {
    // Compute bounds from the profile
    const profiles = detectProfiles(_state.geometry);
    if (profiles.length === 0) return;
    const pts = profiles[0].geoms.flatMap((g) => [g.p1, g.p2].filter(Boolean));
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    showStock(
      {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      },
      parseFloat(document.getElementById("cam-depth")?.value ?? "-3"),
    );
    document.getElementById("btn-show-stock").textContent = "Hide Stock";
  }
  _stockVisible = !_stockVisible;
});
```

---

## Part 8 — Axes Helper and Camera Presets

Add visual feedback for orientation:

```js
// In init3D():

// Axes helper: red=X, green=Y, blue=Z (standard RGB = XYZ convention)
const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);
```

Add preset camera positions:

```js
// Camera presets
export function setCameraPreset(preset) {
  switch (preset) {
    case "top":
      camera.position.set(0, 0, 400);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 0, 0);
      break;
    case "front":
      camera.position.set(0, -400, 0);
      camera.up.set(0, 0, 1);
      camera.lookAt(0, 0, 0);
      break;
    case "isometric":
      camera.position.set(200, -200, 150);
      camera.up.set(0, 0, 1);
      camera.lookAt(0, 0, 0);
      break;
  }
  controls.update();
}
```

Add preset buttons to the toolbar (visible only in 3D mode):

```html
<span id="view3d-controls" class="hidden">
  <button class="btn-tool" onclick="setCameraPreset('top')">Top</button>
  <button class="btn-tool" onclick="setCameraPreset('front')">Front</button>
  <button class="btn-tool" onclick="setCameraPreset('isometric')">Iso</button>
</span>
```

Show/hide these with the view toggle:

```js
// In switchTo3D():
document.getElementById("view3d-controls")?.classList.remove("hidden");
// In switchTo2D():
document.getElementById("view3d-controls")?.classList.add("hidden");
```

---

## Part 9 — Performance Considerations

### The render loop

Three.js uses `requestAnimationFrame` to run a continuous render loop —
typically 60 frames per second. For a CAD viewer this is slightly wasteful
(nothing moves unless the user orbits), but it is the simplest approach and
is fine for a learning project.

For a production CAD app you would use **on-demand rendering**: only call
`renderer.render()` when something changes (user input, geometry update).
Three.js supports this by not calling `requestAnimationFrame` automatically.

### Geometry disposal

Three.js geometry and materials allocate GPU memory. When you remove an object
from the scene, the GPU memory is not freed automatically. You must call
`geometry.dispose()` and `material.dispose()`:

```js
function removeFromScene(obj) {
  scene.remove(obj);
  obj.geometry?.dispose();
  obj.material?.dispose();
}
```

For a learning project this matters less, but knowing this will save you from
GPU memory leaks in production.

### BufferGeometry vs legacy Geometry

Older Three.js tutorials (before r125) use `THREE.Geometry` (not `Buffer`). This
was removed in r125. Always use `THREE.BufferGeometry`. If you see old tutorials
using `new THREE.Geometry()`, translate them to use `BufferGeometry` with
`BufferAttribute`.

---

## Part 10 — Python Parallel: 3D Vectors and Matrices

While Python does not have WebGL, the 3D math is universal. We implement the
key 3D primitives.

```python
# vec3_matrix.py
# 3D vector and 4×4 matrix math.
# This is the math behind the camera and model transforms in Three.js.
# Run: python3 vec3_matrix.py

import math
from dataclasses import dataclass


@dataclass
class Vec3:
    x: float
    y: float
    z: float

    def add(self, other: 'Vec3') -> 'Vec3':
        return Vec3(self.x + other.x, self.y + other.y, self.z + other.z)

    def sub(self, other: 'Vec3') -> 'Vec3':
        return Vec3(self.x - other.x, self.y - other.y, self.z - other.z)

    def scale(self, s: float) -> 'Vec3':
        return Vec3(self.x * s, self.y * s, self.z * s)

    def dot(self, other: 'Vec3') -> float:
        return self.x * other.x + self.y * other.y + self.z * other.z

    def cross(self, other: 'Vec3') -> 'Vec3':
        """Cross product: a vector perpendicular to both self and other.
        Used to compute normals, camera axes, etc."""
        return Vec3(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y * other.x,
        )

    def magnitude(self) -> float:
        return math.sqrt(self.x**2 + self.y**2 + self.z**2)

    def normalize(self) -> 'Vec3':
        m = self.magnitude()
        if m < 1e-10: return Vec3(0, 0, 0)
        return Vec3(self.x/m, self.y/m, self.z/m)

    def __repr__(self) -> str:
        return f'({self.x:.3f}, {self.y:.3f}, {self.z:.3f})'


# ── 4×4 matrix (column-major, like OpenGL/WebGL) ──────────────────────────────

class Mat4:
    """A 4×4 homogeneous transformation matrix.

    Homogeneous coordinates: a 3D point (x,y,z) is represented as (x,y,z,1).
    A 3D direction (vector, no translation) is represented as (x,y,z,0).
    This lets translation, rotation, and scaling all be represented as matrix multiply.
    """

    def __init__(self, data=None):
        # Identity matrix by default
        if data is None:
            self.m = [
                1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1,
            ]
        else:
            self.m = list(data)

    def __getitem__(self, rc):
        row, col = rc
        return self.m[row * 4 + col]

    def __mul__(self, other: 'Mat4') -> 'Mat4':
        result = [0.0] * 16
        for row in range(4):
            for col in range(4):
                for k in range(4):
                    result[row * 4 + col] += self.m[row * 4 + k] * other.m[k * 4 + col]
        return Mat4(result)

    def transform_point(self, v: Vec3) -> Vec3:
        """Multiply this matrix by a point (w=1)."""
        x = self[0,0]*v.x + self[0,1]*v.y + self[0,2]*v.z + self[0,3]
        y = self[1,0]*v.x + self[1,1]*v.y + self[1,2]*v.z + self[1,3]
        z = self[2,0]*v.x + self[2,1]*v.y + self[2,2]*v.z + self[2,3]
        w = self[3,0]*v.x + self[3,1]*v.y + self[3,2]*v.z + self[3,3]
        if abs(w) > 1e-10:
            return Vec3(x/w, y/w, z/w)
        return Vec3(x, y, z)


# ── Standard transforms ────────────────────────────────────────────────────────

def translation(tx: float, ty: float, tz: float) -> Mat4:
    m = Mat4()
    m.m[3]  = tx
    m.m[7]  = ty
    m.m[11] = tz
    return m


def rotation_z(angle: float) -> Mat4:
    """Rotation around the Z axis by angle (radians)."""
    c, s = math.cos(angle), math.sin(angle)
    return Mat4([
        c, -s, 0, 0,
        s,  c, 0, 0,
        0,  0, 1, 0,
        0,  0, 0, 1,
    ])


def rotation_x(angle: float) -> Mat4:
    """Rotation around the X axis by angle (radians)."""
    c, s = math.cos(angle), math.sin(angle)
    return Mat4([
        1, 0,  0, 0,
        0, c, -s, 0,
        0, s,  c, 0,
        0, 0,  0, 1,
    ])


def scale(sx: float, sy: float, sz: float) -> Mat4:
    return Mat4([
        sx, 0,  0,  0,
        0,  sy, 0,  0,
        0,  0,  sz, 0,
        0,  0,  0,  1,
    ])


# ── View matrix (lookAt) ───────────────────────────────────────────────────────

def look_at(eye: Vec3, target: Vec3, up: Vec3) -> Mat4:
    """
    Compute the view matrix for a camera at 'eye' looking at 'target'.
    'up' is the world-space up direction.

    The view matrix transforms world coordinates into camera coordinates:
    - Camera Z axis points AWAY from the target (toward the eye)
    - Camera X axis points right
    - Camera Y axis points up

    This is the same computation Three.js does internally.
    """
    # Forward vector: eye - target (points AWAY from the scene in OpenGL convention)
    f = eye.sub(target).normalize()
    # Right vector: cross of up and forward
    r = up.cross(f).normalize()
    # True up vector: cross of forward and right (may differ from world up)
    u = f.cross(r)

    return Mat4([
        r.x,  r.y,  r.z,  -r.dot(eye),
        u.x,  u.y,  u.z,  -u.dot(eye),
        f.x,  f.y,  f.z,  -f.dot(eye),
        0,    0,    0,     1,
    ])


# ── Tests ──────────────────────────────────────────────────────────────────────

def run_tests():
    # Cross product
    x_axis = Vec3(1, 0, 0)
    y_axis = Vec3(0, 1, 0)
    z_axis = x_axis.cross(y_axis)
    assert abs(z_axis.z - 1) < 1e-10, f'X cross Y should be Z: {z_axis}'
    print('✓ Cross product: X × Y = Z')

    # Rotation
    p = Vec3(1, 0, 0)
    rot90 = rotation_z(math.pi / 2)
    p2 = rot90.transform_point(p)
    assert abs(p2.x) < 1e-10, f'After 90° rot, X should be ~0: {p2.x}'
    assert abs(p2.y - 1) < 1e-10, f'After 90° rot, Y should be ~1: {p2.y}'
    print('✓ Rotation: rotate (1,0,0) by 90° → (0,1,0)')

    # Translation
    p3 = translation(5, 10, 0).transform_point(Vec3(1, 2, 0))
    assert abs(p3.x - 6)  < 1e-10, f'Translate X: {p3.x}'
    assert abs(p3.y - 12) < 1e-10, f'Translate Y: {p3.y}'
    print('✓ Translation: (1,2,0) + (5,10,0) = (6,12,0)')

    # LookAt produces a valid matrix
    view = look_at(Vec3(0, -200, 150), Vec3(0, 0, 0), Vec3(0, 0, 1))
    # The origin should map to a finite point
    orig_cam = view.transform_point(Vec3(0, 0, 0))
    assert math.isfinite(orig_cam.x), 'LookAt: origin maps to finite point'
    print('✓ LookAt matrix computed')

    print('\nAll 3D math tests passed!')


if __name__ == '__main__':
    run_tests()
```

---

## Part 11 — C++ Track: Week 8 — Inheritance and Virtual Functions

```cpp
// renderer_base.cpp
// Abstract base class for 2D and 3D renderers.
// Demonstrates: inheritance, virtual functions, pure virtual, override,
//               abstract classes, polymorphism.
//
// Compile: g++ -std=c++17 -Wall renderer_base.cpp -o renderer_base
// Run:     ./renderer_base

#include <iostream>
#include <string>
#include <vector>
#include <memory>

// ── Abstract base class ────────────────────────────────────────────────────────

// A class with at least one 'pure virtual' function (= 0) cannot be instantiated.
// It is an interface contract — any derived class MUST implement all pure virtuals.
class Renderer {
public:
    // Virtual destructor: essential for base classes.
    // Without it, deleting a derived object through a base pointer leaks memory.
    virtual ~Renderer() = default;

    // Pure virtual functions: no implementation here.
    // Derived classes MUST override these.
    virtual void clear()     = 0;
    virtual void drawLine(double x1, double y1, double x2, double y2,
                          const std::string& colour) = 0;
    virtual void present()   = 0;

    // Regular virtual function: has a default implementation.
    // Derived classes MAY override it.
    virtual std::string name() const {
        return "Renderer (base)";
    }

    // Non-virtual function: the same for all renderers.
    void drawRect(double x, double y, double w, double h, const std::string& colour) {
        drawLine(x,   y,   x+w, y,   colour);
        drawLine(x+w, y,   x+w, y+h, colour);
        drawLine(x+w, y+h, x,   y+h, colour);
        drawLine(x,   y+h, x,   y,   colour);
    }
};

// ── Concrete 2D renderer ───────────────────────────────────────────────────────

class Canvas2DRenderer : public Renderer {
private:
    int _width, _height;
    int _drawCallCount = 0;

public:
    Canvas2DRenderer(int w, int h) : _width(w), _height(h) {}

    void clear() override {
        std::cout << "[Canvas2D] clear " << _width << "x" << _height << "\n";
        _drawCallCount = 0;
    }

    void drawLine(double x1, double y1, double x2, double y2,
                  const std::string& colour) override {
        std::cout << "[Canvas2D] line ("
                  << x1 << "," << y1 << ")->("
                  << x2 << "," << y2 << ") colour=" << colour << "\n";
        _drawCallCount++;
    }

    void present() override {
        std::cout << "[Canvas2D] present (" << _drawCallCount << " draw calls)\n";
    }

    std::string name() const override {
        return "Canvas2DRenderer";
    }
};

// ── Concrete 3D renderer ───────────────────────────────────────────────────────

class WebGLRenderer : public Renderer {
private:
    bool _antialias;
    int  _drawCallCount = 0;

public:
    explicit WebGLRenderer(bool antialias = true) : _antialias(antialias) {}

    void clear() override {
        std::cout << "[WebGL] clear (antialias=" << std::boolalpha << _antialias << ")\n";
        _drawCallCount = 0;
    }

    void drawLine(double x1, double y1, double x2, double y2,
                  const std::string& colour) override {
        // In WebGL this would create a BufferGeometry with two vertices
        std::cout << "[WebGL] drawLine (" << x1 << "," << y1 << ")->"
                  << "(" << x2 << "," << y2 << ") colour=" << colour << "\n";
        _drawCallCount++;
    }

    void present() override {
        std::cout << "[WebGL] render scene (" << _drawCallCount << " objects)\n";
    }

    std::string name() const override {
        return "WebGLRenderer";
    }
};

// ── Polymorphic usage ──────────────────────────────────────────────────────────

// This function accepts ANY renderer — it works through the base class interface.
// At runtime, the correct drawLine/clear/present is called based on the actual type.
// This is runtime polymorphism.
void renderScene(Renderer& r) {
    r.clear();
    r.drawLine(0, 0, 100, 0, "#ff0000");
    r.drawLine(100, 0, 100, 100, "#00ff00");
    r.drawRect(10, 10, 50, 30, "#0000ff");
    r.present();
    std::cout << "  renderer: " << r.name() << "\n\n";
}

int main() {
    std::cout << "=== Canvas 2D ===\n";
    Canvas2DRenderer canvas(800, 600);
    renderScene(canvas);

    std::cout << "=== WebGL ===\n";
    WebGLRenderer webgl(true);
    renderScene(webgl);

    // ── std::unique_ptr and polymorphism ────────────────────────────────────
    // Store different renderer types in the same container using a base class pointer.
    // unique_ptr: owns the object, automatically deletes it when it goes out of scope.
    std::vector<std::unique_ptr<Renderer>> renderers;
    renderers.push_back(std::make_unique<Canvas2DRenderer>(1920, 1080));
    renderers.push_back(std::make_unique<WebGLRenderer>(false));

    std::cout << "=== All renderers ===\n";
    for (auto& r : renderers) {
        std::cout << r->name() << "\n";  // correct name() called for each
    }

    return 0;
}
```

**New concepts:**

**Pure virtual function** (`= 0`): Declares that derived classes must provide an
implementation. A class with any pure virtual function is **abstract** — you
cannot create an instance of it directly.

**`override` keyword**: Tells the compiler "I am overriding a virtual function
from the base class." If you misspell the function name, the compiler warns you
instead of silently creating a new function.

**Virtual destructor**: If you ever delete an object through a base-class
pointer (`Renderer* r = new WebGLRenderer(); delete r;`), the destructor must
be virtual or only the base destructor runs — leaking the derived class's
resources.

**`std::unique_ptr<T>`**: A smart pointer that owns an object. When the
`unique_ptr` goes out of scope or is reset, it automatically calls `delete`.
Use `make_unique<T>(args)` to create one. A `unique_ptr` cannot be copied —
only moved. This prevents double-delete bugs.

---

## Part 12 — Recap: 2D vs 3D Architecture

After Lab 08 your app has two rendering paths:

```
state.geometry + state.gcodeGeometry
        │
        ├── 2D path (Canvas2D)
        │       Renderer2D.js — drawLine/drawArc/drawCircle
        │       Uses 2D canvas context, pan/zoom in pixels
        │       Mouse interactions, snap, tool previews
        │
        └── 3D path (Three.js/WebGL)
                Renderer3D.js — geomToThree/updateGeometry
                Three.js scene graph, OrbitControls
                Z-depth visible, material stock, toolpath in 3D
```

The 2D view is the **primary working environment** (where you draw and interact).
The 3D view is the **verification environment** (where you check the toolpath
looks correct before sending to the machine).

---

## What You Have After Lab 08

```
cam/
  index.html (with importmap for Three.js)
  js/
    renderer/
      Renderer2D.js  (existing)
      Renderer3D.js  (new: Three.js scene, geomToThree, updateGeometry, updateToolpath)
python/
  vec3_matrix.py
```

**Working features:**

- 3D view toggle (2D / 3D buttons)
- CAD geometry displayed as Three.js lines in 3D
- G-code geometry displayed in 3D with move-type colours
- Toolpath displayed in 3D with Z depth visible
- Transparent stock block overlay
- Camera presets (Top, Front, Isometric)
- Axes helper (red=X, green=Y, blue=Z)

---

## DIVERGE POINTS

**1. Custom orbit controls:** Three.js `OrbitControls` is fine but not CAD-style.
Professional CAD uses "Turntable" orbiting (rotation around the world Z axis, not
the camera's local axes). Implement a custom version by modifying the camera
position directly on mouse events.

**2. Rendered solids:** Instead of wireframe lines, represent the geometry as
extruded solids (`THREE.ExtrudeGeometry` + a 2D `ShapePath`). The profile becomes
a filled 3D object.

**3. Simulation in 3D:** Move a sphere (representing the tool tip) along the
toolpath moves over time — a simple machining simulation. Covered in Lab 09.

**4. Measurement in 3D:** Add a `RayCaster` to detect mouse-hover over 3D objects
and display the 3D coordinates of the hover point.

**5. Export to STL:** Generate a 3D mesh from the extruded geometry and export
it as an STL file (the universal format for 3D printing/CAM). STL is just a list
of triangles: `solid name\nfacet normal nx ny nz\nouter loop\nvertex ...\n...`

---

_Continue to [Lab 09 — Simulation](LAB-09-SIMULATION.md)._
