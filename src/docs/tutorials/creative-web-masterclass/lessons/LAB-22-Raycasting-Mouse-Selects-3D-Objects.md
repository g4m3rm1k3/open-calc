# Creative Web Masterclass — LAB 22 — Raycasting: Mouse Selects 3D Objects

**Prerequisites:** LAB-21. You have OrbitControls and a Three.js scene.

**What this lab adds:**
- `THREE.Raycaster` — casting a ray from the camera through the mouse position
- `raycaster.setFromCamera()` — aims the ray at the current mouse position
- `raycaster.intersectObjects()` — finds which objects the ray hits
- Hover highlight — changing material color when the mouse is over an object
- Click detection — identifying which 3D object was clicked

**Time:** 50–60 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  ●   ●   ●   ●   ●    ← normal color                 │
 │                                                      │
 │  ●   ●   ✦ ← cursor hovering here (highlighted)      │
 │                                                      │
 │  Info: "Sphere 7"  ← updates when hovered            │
 └──────────────────────────────────────────────────────┘
   Move the cursor — spheres light up on hover.
   Click — the info panel shows which sphere was clicked.
```

---

> **Quick Check — answer before reading further:**
>
> 1. The mouse position is in 2D (pixels on screen). Three.js objects are in 3D space.
>    How does Three.js figure out which 3D object is "under" the 2D cursor position?
> 2. `raycaster.intersectObjects(objects)` returns an array. Why an array, not a single
>    object? What is the array sorted by?
> 3. If you have OrbitControls on the same canvas, both OrbitControls and your raycaster
>    respond to mouse events. Is there a conflict? How do you handle it?
>
> *(Answers at the end)*

---

## Concept: Raycasting

**What it is:** Raycasting projects a ray from the camera through the cursor's position
into 3D space. Every object that the ray intersects is a candidate for the cursor hit.

```
Camera position  ────────────────────────────────→  infinite 3D space
                     \    (the ray)
                      \
                       \
                        ● ← object hit (first intersection)
                              ● ← second object (behind the first)
```

**Three steps:**

```js
// 1. Create the raycaster and mouse vector (do this once, outside the loop)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 2. Update the mouse vector on mousemove
renderer.domElement.addEventListener('mousemove', function (event) {
  const rect = renderer.domElement.getBoundingClientRect();
  // Convert pixel coords to Three.js's NDC (-1 to +1 on both axes)
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
});

// 3. Cast the ray (inside the animation loop or mousemove handler)
raycaster.setFromCamera(mouse, camera);
const hits = raycaster.intersectObjects(meshArray);
if (hits.length > 0) {
  const firstHit = hits[0];   // closest object
  firstHit.object    // the THREE.Mesh that was hit
  firstHit.distance  // how far from the camera
  firstHit.point     // THREE.Vector3 — exact 3D world position of the hit
}
```

**NDC (Normalized Device Coordinates):** Three.js expects mouse coordinates in the range
(-1, -1) to (1, 1) — center of the canvas is (0, 0). The conversion formula:
- X: `(pixelX / canvasWidth) * 2 - 1` → maps 0→width to -1→1
- Y: `-(pixelY / canvasHeight) * 2 + 1` → maps 0→height to 1→-1 (Y is flipped — canvas Y goes down, NDC Y goes up)

**What it hides:** The ray-sphere intersection math, ray-triangle intersection, BVH (bounding
volume hierarchy) for spatial acceleration, and the near/far clipping calculations.

---

## Step 1 — Create Files

`index.html` — same as LAB-21 with the addons importmap. Add a `<div>` for the info panel:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 22 — Raycasting</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <div class="info-panel" id="info-panel">
      <p id="hover-info">Hover over a sphere</p>
      <p id="click-info">Click to select</p>
    </div>

    <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
      }
    }
    </script>
    <script type="module" src="main.js"></script>
  </body>
</html>
```

---

## Step 2 — Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; overflow: hidden; }
canvas { display: block; }

.info-panel {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(13, 13, 26, 0.85);
  border: 1px solid #2a2a4a;
  border-radius: 8px;
  padding: 16px 20px;
  color: #e8e8f0;
  font-family: monospace;
  font-size: 0.85rem;
  pointer-events: none;   /* do not block mouse events to the canvas below */
  z-index: 10;
}

.info-panel p { margin: 0 0 4px 0; }
.info-panel p:last-child { margin: 0; }
```

`pointer-events: none` is critical — the overlay panel must not intercept mouse events
that should reach the Three.js canvas below it.

---

> **CSS AND SEE**
>
> **You should see:** A small info panel in the top-left corner with static text.

---

## Step 3 — Scene Setup

`main.js`:

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

// ---- Create a grid of spheres ----
const spheres = [];   // track all meshes for raycasting

const COLS = 6;
const ROWS = 3;

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const hue = (col / COLS) * 240 + 180;   // blue to teal range
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 24, 24),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('hsl(' + hue + ', 70%, 55%)'),
        roughness: 0.3,
        metalness: 0.2
      })
    );
    mesh.position.set(
      (col - COLS / 2 + 0.5) * 2,
      (row - ROWS / 2 + 0.5) * 2,
      0
    );
    mesh.userData.label = 'Sphere [' + col + ',' + row + ']';
    mesh.userData.originalColor = mesh.material.color.clone();  // save original color
    scene.add(mesh);
    spheres.push(mesh);
  }
}
```

`mesh.material.color.clone()` creates a copy of the color object. Without `.clone()`,
`userData.originalColor` would reference the same Color object as `material.color` —
when you change the material color, the "original" would change too.

---

> **SAVE AND TRY**
>
> **You should see:** An 3×6 grid of spheres in blue-teal colors. Orbit works via the mouse.

---

## Step 4 — Raycaster + Hover Detection

```js
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

const hoverInfoEl = document.querySelector('#hover-info');
const clickInfoEl = document.querySelector('#click-info');

// Update mouse position on every move
renderer.domElement.addEventListener('mousemove', function (event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
});

// Handle click on canvas
renderer.domElement.addEventListener('click', function () {
  if (hoveredObject) {
    clickInfoEl.textContent = 'Selected: ' + hoveredObject.userData.label;
  }
});
```

The `mousemove` handler only updates the `mouse` vector — it does not do any raycasting.
Raycasting happens in the `animate` loop so it is synchronized with the render.

---

## Step 5 — Raycasting in the Animation Loop

```js
const HOVER_COLOR = new THREE.Color(0xffffff);   // white highlight on hover

function animate() {
  // Cast ray from camera through current mouse position
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(spheres);

  // Restore previous hovered object to its original color
  if (hoveredObject) {
    hoveredObject.material.color.copy(hoveredObject.userData.originalColor);
    hoveredObject = null;
    hoverInfoEl.textContent = 'Hover over a sphere';
    renderer.domElement.style.cursor = 'default';
  }

  // Apply hover effect to the closest hit object
  if (hits.length > 0) {
    hoveredObject = hits[0].object;
    hoveredObject.material.color.copy(HOVER_COLOR);
    hoverInfoEl.textContent = 'Hovering: ' + hoveredObject.userData.label;
    renderer.domElement.style.cursor = 'pointer';
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
```

Each frame: first restore any previously hovered object to its original color, then
cast the ray and check for new hits. If a hit is found, set the new `hoveredObject` and
apply the highlight color.

`material.color.copy(color)` sets the material's color to match another `THREE.Color`
object — modifying in place without creating a new object each frame.

---

> **SAVE AND TRY**
>
> **You should see:** Spheres that turn white when the cursor is over them. The info panel
> shows the sphere's label. Move the cursor — the highlight follows. Click — the click info
> updates. Orbit still works — OrbitControls and raycasting coexist.
>
> **Change something:** Change `HOVER_COLOR = new THREE.Color(0xffffff)` to
> `new THREE.Color(0xff4488)`. Hovered spheres turn pink.

---

## 🎯 Challenge: Sphere Info on Hover

**You know:** `userData`, click events, DOM manipulation.

**Task:** When a sphere is hovered, add a `<div>` "tooltip" that follows the mouse and
shows the sphere's label. Position it just above the cursor using `event.clientX`
and `event.clientY` in the `mousemove` handler. Give it a CSS `position: fixed` and
update its `left` and `top` on every `mousemove`. Hide it when no sphere is hovered.

---

<details>
<summary>▶ Show Solution</summary>

In `index.html` add:
```html
<div class="tooltip" id="tooltip"></div>
```

In `styles.css` add:
```css
.tooltip {
  position: fixed;
  background: rgba(13,13,26,0.9);
  border: 1px solid #6c63ff;
  border-radius: 4px;
  padding: 4px 10px;
  color: #e8e8f0;
  font-family: monospace;
  font-size: 0.8rem;
  pointer-events: none;
  display: none;
  z-index: 20;
}
```

In `main.js`:
```js
const tooltip = document.querySelector('#tooltip');

renderer.domElement.addEventListener('mousemove', function (event) {
  // existing mouse.x / mouse.y update...
  tooltip.style.left = (event.clientX + 12) + 'px';
  tooltip.style.top = (event.clientY - 28) + 'px';
});

// In animate, after setting hoveredObject:
if (hoveredObject) {
  tooltip.textContent = hoveredObject.userData.label;
  tooltip.style.display = 'block';
} else {
  tooltip.style.display = 'none';
}
```

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Hover changes sphere color | Move cursor over spheres — white highlight |
| Cursor changes to pointer | Default cursor over canvas, pointer over sphere |
| Info panel updates on hover | Label shows current sphere coordinates |
| Click updates info | Click a sphere — "Selected:" text updates |
| Orbit still works | Left drag still orbits the scene |

---

## What's Next

LAB 23 puts Three.js behind HTML content — a transparent canvas rendered absolutely
behind the page, so DOM sections scroll over the 3D background.

---

## Quick Check Answers

**1. How does Three.js figure out which 3D object is under the cursor?**
Three.js computes a ray starting at the camera position, passing through the cursor's
2D screen position, and extending infinitely into 3D space. Then it tests each object
for intersection with that ray — for meshes, it tests each triangle. The objects that
the ray passes through are returned as hits. This is the same algorithm used in ray-traced
rendering, physics engines, and game selection systems.

**2. Why does `intersectObjects` return an array? Sorted by what?**
Multiple objects can be on the same ray — one can be behind another. The array contains
all intersecting objects, sorted by distance from the camera (closest first). Checking
`hits[0]` gives the front-most object. If you only care about the top object, check
`hits.length > 0` and use `hits[0]`.

**3. Is there a conflict between OrbitControls and raycasting?**
No direct conflict — OrbitControls responds to `pointerdown` and `pointermove` events,
while raycasting is driven by the `mouse` vector updated in `mousemove`. They do not
interfere with each other's event handlers. The only practical issue: when OrbitControls
is being actively used (dragging), you may not want raycasting to register hover — but for
this lab's use case (hover highlight), it's acceptable for both to be active simultaneously.
