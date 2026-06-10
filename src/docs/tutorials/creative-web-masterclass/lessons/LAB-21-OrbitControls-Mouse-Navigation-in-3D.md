# Creative Web Masterclass — LAB 21 — OrbitControls: Mouse Navigation in 3D

**Prerequisites:** LAB-20. You have a Three.js scene with the clock and animation loop.

**What this lab adds:**
- `OrbitControls` — a Three.js add-on for mouse/touch camera navigation
- Importing from the Three.js `addons` path
- `controls.update()` — required each frame for damping to work
- `controls.target` — what the camera orbits around
- Damping — smooth camera deceleration after releasing the mouse

**Time:** 35–45 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │              ★ ← interesting 3D scene                │
 │           ●     ●                                    │
 │        ●     ◎     ●                                 │
 │           ●     ●                                    │
 │                                                      │
 │   Left drag: orbit  │  Right drag: pan  │  Scroll: zoom │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. `OrbitControls` is not in Three.js's core bundle. Why would the Three.js team keep
>    some tools separate from the core library?
> 2. When you use `OrbitControls`, who moves the camera — your code, or OrbitControls?
>    Can you still manually set `camera.position` in the animation loop?
> 3. What is "damping" in the context of camera controls? What would the controls feel
>    like without damping?
>
> *(Answers at the end)*

---

## Concept: Three.js Add-ons

**What they are:** Three.js ships with a large set of utilities in its `addons` (previously
`examples/jsm`) directory — things like `OrbitControls`, `GLTFLoader`, `EffectComposer`,
and post-processing passes. These are not in the core `three` bundle because not every
project needs them. They are imported from a different path.

**Import pattern:**

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
```

For this to work with the importmap, you need to add the addons path:

```json
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
```

The trailing `/` in `"three/addons/"` is important — it tells the browser to resolve
any path starting with `"three/addons/"` as a CDN URL prefix. This is called a path
prefix mapping.

**Watch for:** The version number in the importmap (`0.160.0`) must be the same for both
`three` and `three/addons/`. Mixing versions causes import resolution failures.

---

## Concept: `OrbitControls`

**What it is:** `OrbitControls` intercepts mouse events on the renderer's canvas and
translates them into camera movements:

| Mouse action | Camera effect |
|---|---|
| Left button drag | Orbit (rotate around target) |
| Right button drag | Pan (translate camera and target) |
| Scroll wheel | Zoom (dolly in/out) |
| Two-finger pinch (touch) | Zoom |

```js
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;    // smooth deceleration after mouse release
controls.dampingFactor = 0.05;    // 5% friction per frame — lower = slower stop
controls.target.set(0, 0, 0);    // what the camera orbits around
controls.update();                // required for initial setup
```

**In the animation loop:**

```js
function animate() {
  controls.update();   // must be called every frame for damping to work
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

**What it hides:** The spherical coordinate math for orbit, the pan offset calculation,
the dolly distance clamping, and the touch event handling.

**Watch for:** If `enableDamping = true`, you must call `controls.update()` in the
animation loop. Without this call, the camera stops immediately when you release the
mouse instead of smoothly decelerating.

---

## Step 1 — Update index.html importmap

`projects/lab-21/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 21 — OrbitControls</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
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

The only change from previous labs is adding `"three/addons/": "..."` to the importmap.

---

## Step 2 — Styles

Same as previous Three.js labs.

---

## Step 3 — Scene with OrbitControls

`main.js`:

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0d1a);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 4, 8);   // starting position — user can then orbit from here
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

// ---- OrbitControls ----
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);   // orbit around the origin
controls.minDistance = 2;        // cannot zoom in closer than 2 units
controls.maxDistance = 30;       // cannot zoom out farther than 30 units
controls.maxPolarAngle = Math.PI * 0.85;   // prevent going below the floor
controls.update();
```

`controls.maxPolarAngle = Math.PI * 0.85` limits the vertical orbit so the camera cannot
go below the floor plane. `Math.PI * 0.5` would be exactly the equator (looking straight
at the side). `Math.PI * 0.85` allows the camera to dip slightly below horizontal but
not go underground.

---

> **SAVE AND TRY**
>
> **You should see:** A dark background. Try dragging with the left mouse button — the
> camera orbits. Scroll to zoom. Nothing is visible yet because no objects are added.
> But the controls already work.

---

## Step 4 — Add Objects and Lights

```js
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

// Central torus knot — complex geometry, interesting from all angles
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({
    color: 0x6c63ff,
    roughness: 0.2,
    metalness: 0.6,
    emissive: 0x1a0044,
    emissiveIntensity: 0.3
  })
);
scene.add(torusKnot);

// Surrounding spheres
const SPHERE_COUNT = 8;
for (let i = 0; i < SPHERE_COUNT; i++) {
  const angle = (i / SPHERE_COUNT) * Math.PI * 2;
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('hsl(' + (i * 45) + ', 70%, 60%)'),
      roughness: 0.4,
      metalness: 0.1
    })
  );
  sphere.position.x = Math.cos(angle) * 3.5;
  sphere.position.z = Math.sin(angle) * 3.5;
  sphere.position.y = 0;
  scene.add(sphere);
}

// Floor grid
const gridHelper = new THREE.GridHelper(20, 20, 0x2a2a4a, 0x2a2a4a);
scene.add(gridHelper);
```

`THREE.TorusKnotGeometry` is a complex self-intersecting torus shape. It looks interesting
from every angle — making it ideal for an OrbitControls demo.

`THREE.GridHelper(size, divisions, centerColor, gridColor)` adds a reference grid on the
floor. It is a visual utility object.

---

> **SAVE AND TRY**
>
> **You should see:** A complex purple torus knot in the center, eight colored spheres
> surrounding it in a ring, and a subtle grid on the floor. Orbit with the left mouse
> button to view from different angles. Scroll to zoom. Right-drag to pan.
>
> **Verify damping:** Drag quickly and release — the camera should continue moving briefly
> and then decelerate to a stop. Without `enableDamping = true`, it would stop instantly.

---

## Step 5 — Animation Loop

```js
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  // Slow rotation of the torus knot
  torusKnot.rotation.x = t * 0.3;
  torusKnot.rotation.y = t * 0.5;

  controls.update();   // REQUIRED for damping — must call every frame

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
```

`controls.update()` is called before `renderer.render()` so the camera position is fully
updated before the frame is drawn.

---

> **SAVE AND TRY**
>
> **You should see:** The torus knot rotating slowly. You can orbit around it at the same
> time — your mouse input and the code rotation both work simultaneously. OrbitControls
> and manual animation coexist without conflict.

---

## 🎯 Challenge: Auto-Rotate

**You know:** OrbitControls, `controls.update()`.

**Task:** Enable `OrbitControls`'s built-in auto-rotate feature. Set:
```js
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;
```

When the user moves the mouse, auto-rotate pauses. When they stop interacting, it resumes.
This is built into `OrbitControls` — you do not need to write any extra code.

Also add a toggle button in HTML that enables/disables auto-rotate when clicked. Use
`controls.autoRotate = !controls.autoRotate` in a click handler.

---

<details>
<summary>▶ Show Solution</summary>

In `main.js`:
```js
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;
```

In `index.html`, add before `</body>`:
```html
<button id="toggle-rotate" style="position:fixed;top:16px;right:16px;padding:8px 16px;background:#6c63ff;color:white;border:none;border-radius:6px;cursor:pointer;">
  Pause Rotation
</button>
```

In `main.js`:
```js
const toggleBtn = document.querySelector('#toggle-rotate');
toggleBtn.addEventListener('click', function () {
  controls.autoRotate = !controls.autoRotate;
  toggleBtn.textContent = controls.autoRotate ? 'Pause Rotation' : 'Resume Rotation';
});
```

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Left drag orbits camera | Drag — scene rotates around origin |
| Scroll zooms | Scroll — camera moves toward/away |
| Damping active | Fast drag then release — smooth deceleration |
| Max polar angle works | Try to look straight up — camera stops before ground |
| Objects visible from all angles | Orbit all the way around — objects visible |

---

## What's Next

LAB 22 adds raycasting — detecting which Three.js object the mouse cursor is hovering over.
This is the foundation for interactive 3D scenes where clicking objects triggers events.

---

## Quick Check Answers

**1. Why are add-ons separate from the core library?**
Bundle size. The core Three.js library is already large. Including every utility (controls,
loaders, post-processing, debugging tools) would make even the simplest project download
megabytes of unused code. Add-ons let you import only what you need, keeping bundles small.

**2. Who moves the camera when using OrbitControls?**
`OrbitControls` does. It attaches mouse/touch event listeners to `renderer.domElement`
and updates `camera.position` and `camera.quaternion` directly. You should not manually
set `camera.position` in the animation loop while OrbitControls is active — it would
conflict. The `camera.position.set(...)` you wrote at setup time is the starting position;
after that, OrbitControls takes over.

**3. What is damping? What would the controls feel like without it?**
Damping is velocity-based deceleration — after the mouse is released, the camera keeps
moving at decreasing speed until it stops. Without damping (`enableDamping = false`), the
camera stops instantly the moment you release the mouse button — a very abrupt, mechanical
feeling. Damping makes the controls feel like they have physical inertia — smooth and
natural like a gyroscope or a trackball with friction.
