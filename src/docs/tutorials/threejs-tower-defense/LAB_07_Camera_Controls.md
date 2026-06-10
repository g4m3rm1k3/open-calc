# TypeScript Tower Defense — LAB 07 — Camera Controls

**Prerequisites:** Lab 06 complete. You have a clickable grid with tile selection working.

**What this lab adds:**
- `OrbitControls` — click and drag to rotate around the grid, scroll to zoom, right-click to pan
- A fix so orbiting does not accidentally trigger tile selection
- The distance formula — used to tell the difference between a drag and a click

**Time:** 45–60 minutes.

---

## What You Will Build

The grid and click-to-select both still work. What is new: you can now rotate the camera around the grid by clicking and dragging, zoom in and out with the scroll wheel, and pan by right-clicking and dragging. Crucially, dragging to orbit does not accidentally select tiles — only a clean click does.

```
       drag left/right → rotate around grid
       scroll up/down  → zoom in / zoom out
       right-drag      → pan the view

     ┌──┬──┬──┬──┬──┬──┬──┬──┐
     │  │  │  │  │  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤    ← rotate: see the grid from any angle
     │  │  │  │ O│  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤    ← zoom: get closer to inspect tiles
     │  │  │  │  │  │  │  │  │
     └──┴──┴──┴──┴──┴──┴──┴──┘    click still selects (orange)
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. When you drag the mouse to orbit, the browser fires a `click` event when you release the mouse button. How do you think you could tell the difference between a drag and a real click?
> 2. `OrbitControls` has a feature called "damping" — the camera eases to a stop instead of stopping instantly. Why do you think this requires calling `controls.update()` inside the animation loop?
> 3. What two pieces of information do you need to calculate the distance between two points?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Import `OrbitControls`

`OrbitControls` is part of the Three.js package but lives in a subfolder of examples. It is not in the main Three.js file.

---

### Concept: Importing From a Sub-Path

**What it is:** A specific location inside a package, reached by adding a path after the package name. Instead of `'three'` (the main file), you write `'three/addons/controls/OrbitControls.js'` (a specific file inside the package).

**The problem before:**
```ts
import * as THREE from 'three';
// This imports the core Three.js library. OrbitControls is not in the core.
// It lives in Three.js's "examples" — optional extras that ship with the package.
```

**The solution:**
```ts
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 'three/addons/*' is a shortcut Three.js defines in its package.json
// It resolves to: node_modules/three/examples/jsm/controls/OrbitControls.js
```

**Named vs default imports:**
In Lab 01 you used `import * as THREE from 'three'` — everything bundled under the name `THREE`. Here you use `import { OrbitControls }` — a *named* import that pulls out exactly one thing by name. The `{ }` means "give me just this specific export."

```ts
import * as THREE from 'three';            // everything → access as THREE.Something
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // one thing → access as OrbitControls
```

**Watch for:** The `.js` extension is required in the import path even though the file is TypeScript internally. This is a quirk of the ES module system — you write the extension of the JavaScript file that will exist after compilation.

---

Add the import at the top of `src/main.ts`, below the Three.js import:

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // ← add this
```

---

### SAVE AND TRY

Save. The browser refreshes. Grid still works. No errors in the console.

**In VS Code:** Hover over `OrbitControls`. The tooltip shows its type signature — TypeScript loaded the type definitions from `@types/three` and knows exactly what `OrbitControls` is.

If you see a red error like `Cannot find module`, check that `three` is installed (`npm install three` in the terminal) and that you typed the path exactly.

---

## Step 2 — Create and Configure OrbitControls

---

### Concept: `OrbitControls`

**What it is:** A Three.js addon that takes control of the camera's position and rotation in response to mouse input. It handles the math of orbiting around a target point, zooming, and panning — all in a few lines of setup.

**What it does to the camera:**
`OrbitControls` *owns* the camera's rotation from the moment it is created. It reads the camera's starting position, and from then on, every `controls.update()` call may modify `camera.position` and `camera.rotation` based on mouse input. You should not manually change `camera.rotation` after creating `OrbitControls` — the controls will immediately override it.

**The important properties:**

| Property | What it does | Typical value |
|---|---|---|
| `controls.target` | The point the camera orbits around | `(0, 0, 0)` for a centered grid |
| `controls.enableDamping` | Smooth deceleration instead of instant stop | `true` |
| `controls.dampingFactor` | How quickly the damping settles (0–1) | `0.05` |
| `controls.minDistance` | Closest the camera can zoom | `3` |
| `controls.maxDistance` | Furthest the camera can zoom | `25` |
| `controls.maxPolarAngle` | How far down you can tilt — prevents going underground | `Math.PI / 2` |

**`maxPolarAngle` explained:**
`Math.PI / 2` is 90 degrees — straight down. Setting `maxPolarAngle` to `Math.PI / 2` prevents the camera from tilting past horizontal (past the ground plane). Without this limit, you could drag the camera under the grid and look up at it from below, which is disorienting.

**`controls.update()` and damping:**
Damping does not happen instantaneously — it is an ongoing calculation. On each frame, `controls.update()` applies a small deceleration to any ongoing movement. Without calling it every frame, damping does not work and the camera stops dead instead of easing.

**Watch for:** `OrbitControls` and `camera.lookAt()` conflict. Once you create `OrbitControls`, remove any manual `camera.lookAt()` calls after the controls are set up — the controls will handle orientation from the `target` property.

---

Add OrbitControls to `main.ts` immediately after the camera setup. Remove `camera.lookAt(0, 0, 0)` from the camera section — replace it with the controls setup:

```ts
// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene: THREE.Scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  CONFIG.cameraFov,
  CONFIG.canvasWidth / CONFIG.canvasHeight,
  CONFIG.cameraNear,
  CONFIG.cameraFar
);
camera.position.set(0, 10, 8);
// No camera.lookAt here — OrbitControls takes over camera orientation.

// ── Camera Controls ───────────────────────────────────────────────────────────
const controls: OrbitControls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);        // orbit around the grid center
controls.enableDamping = true;        // smooth deceleration on release
controls.dampingFactor = 0.05;        // how fast damping settles
controls.minDistance   = 3;           // closest zoom
controls.maxDistance   = 25;          // furthest zoom
controls.maxPolarAngle = Math.PI / 2; // prevent going underground
controls.update();                    // apply initial state
```

Also update `update()` to call `controls.update()`:

```ts
function update(_deltaTime: number): void {
  controls.update(); // required every frame for damping to work
}
```

---

### SAVE AND TRY

Save. Browser refreshes.

**You should see:** The same grid. Now drag left/right on the canvas — the camera rotates around the grid. Scroll to zoom in and out. Right-click and drag to pan.

**Test the limits:**
- Zoom in very close — the camera stops at `minDistance = 3` and will not go closer.
- Zoom out far — the camera stops at `maxDistance = 25`.
- Tilt the camera downward by dragging down — it stops at horizontal level (you cannot go underground).

**Test selection still works:** Click a tile without dragging. It highlights orange. This works because the click was a clean click, not a drag. But drag the mouse slightly and release — the tile near your cursor may incorrectly turn orange. This is the bug you fix in the next step.

**Change something:** Change `dampingFactor` from `0.05` to `0.5`. Save. Drag and release. The camera stops very quickly — almost no damping. Change it to `0.01` — very slow deceleration. Change it back to `0.05`.

---

## Step 3 — Fix the Drag vs Click Conflict

When you drag to orbit and release the mouse button, the browser fires a `click` event. This accidentally triggers tile selection. You need to tell the difference between a drag and a deliberate click.

---

### Concept: The Distance Formula

**What it is:** A formula that calculates the straight-line distance between two points. In 2D, between point A and point B:

```
distance = √( (Bx - Ax)² + (By - Ay)² )
```

In code:
```ts
const dx: number = pointB.x - pointA.x;
const dy: number = pointB.y - pointA.y;
const distance: number = Math.sqrt(dx * dx + dy * dy);
```

**Where this formula comes from:**
This is the Pythagorean theorem — the distance is the hypotenuse of a right triangle whose legs are `dx` and `dy`.

```
A (mousedown position)
│\
│  \  distance (hypotenuse)
│dy  \
│      \
└──────── B (mouseup position)
    dx
```

**`Math.sqrt(n)`:** Returns the square root of `n`. `Math.sqrt(25) = 5`.

**Used here to detect drags:**
Record where the mouse was pressed. On click, measure the distance from the press point to the release point. If the distance is greater than a threshold (a few pixels), it was a drag. If small, it was a genuine click.

```ts
const dx = event.clientX - mouseDownX;
const dy = event.clientY - mouseDownY;
const dragDistance = Math.sqrt(dx * dx + dy * dy);

if (dragDistance > DRAG_THRESHOLD_PX) {
  return; // was a drag — ignore it
}
```

**The threshold value:**
A few pixels of tolerance prevents accidental misses when the user's hand moves slightly on click. `5` pixels is a common value — enough to absorb small movement, not so large that real drags are treated as clicks.

**Why it matters here:** This exact pattern — "record the starting point of an interaction, measure how far the cursor moved, decide whether it was a drag or a click" — is used in every CAD application, every drawing tool, every canvas editor. You will use it again when building the full CAD interface.

---

### Concept: Module-Level Variables for State

**What it is:** Variables declared at the top level of the file (outside any function) that persist for the lifetime of the page. Any function in the file can read and write them.

**For the drag detection, two variables are needed:**

```ts
let mouseDownX: number = 0; // X position when the mouse button was pressed
let mouseDownY: number = 0; // Y position when the mouse button was pressed
```

These are `let` (not `const`) because they are reassigned every time the mouse button is pressed.

**Watch for:** Module-level variables are global within the file. This is acceptable for small amounts of input state. As the codebase grows, state gets organized into objects — but for two numbers, a top-level `let` is fine.

---

Add the drag detection variables and a `mousedown` listener. Place these just before the raycaster:

```ts
// ── Drag Detection ────────────────────────────────────────────────────────────
// Records where the mouse was pressed so the click handler can tell
// whether the mouse moved (drag = orbit) or stayed still (click = select).
const DRAG_THRESHOLD_PX: number = 5; // pixels of movement that counts as a drag

let mouseDownX: number = 0;
let mouseDownY: number = 0;

renderer.domElement.addEventListener('mousedown', (event: MouseEvent) => {
  mouseDownX = event.clientX;
  mouseDownY = event.clientY;
});
```

Then add a drag check at the very top of the click handler:

```ts
renderer.domElement.addEventListener('click', (event: MouseEvent) => {
  // Ignore this click if the mouse moved more than the drag threshold.
  // This prevents orbiting from accidentally selecting tiles.
  const dx: number = event.clientX - mouseDownX;
  const dy: number = event.clientY - mouseDownY;
  const dragDistance: number = Math.sqrt(dx * dx + dy * dy);

  if (dragDistance > DRAG_THRESHOLD_PX) {
    return; // was a drag — do not treat as a selection click
  }

  // ... rest of the click handler unchanged
```

---

### SAVE AND TRY

Save. Browser refreshes.

**Test the fix:**
1. Click a tile without moving the mouse — it selects (orange). ✓
2. Drag to orbit — the camera moves and no tile selects. ✓
3. Drag just a tiny amount and release — the tile does not select (mouse moved). ✓

**In the console:**
```js
DRAG_THRESHOLD_PX
```
**Expected:** `5`

**Change something:** Change `DRAG_THRESHOLD_PX` to `50`. Save. Now you can drag quite a distance and it still registers as a click. The selection triggers after long drags. Change it back to `5`.

---

## Challenge: Log the Drag Distance

**You know:** `dx`, `dy`, and `dragDistance` are calculated inside the click handler.

**Task:** Add a `console.log` that prints the drag distance every time the click handler runs, before the early return. Drag the camera a medium amount and release. Note the distance. Click normally and note the distance. What is the typical drag distance for a "real" orbit gesture?

After observing, decide if `DRAG_THRESHOLD_PX = 5` is the right value for your mouse, or if you would change it. Then remove the `console.log` before continuing.

**This is an observation challenge — no solution block needed.**

---

## Step 4 — Restrict the Polar Angle Further

The default maximum polar angle of `Math.PI / 2` lets the camera tilt all the way to horizontal. For a tower defense game, extremely low angles make the grid hard to use. Add a minimum polar angle too.

---

### Concept: `minPolarAngle`

**What it is:** The minimum angle between the camera and straight down (the Y axis). Setting a minimum prevents the camera from tilting so far it looks straight down at the grid.

**Polar angles in Three.js:**
- `0` = looking straight down at the grid from directly above
- `Math.PI / 2` = horizontal — camera at the same height as the grid
- `Math.PI` = looking straight up (from below — already prevented by `maxPolarAngle`)

**For a tower defense game, a comfortable range:**
- `minPolarAngle = Math.PI / 6` — 30 degrees from top-down (close to overhead but not completely flat)
- `maxPolarAngle = Math.PI / 2.5` — about 72 degrees from top-down (slightly below horizontal)

This keeps the grid clearly visible at all camera angles.

**Smallest possible example:**
```ts
controls.minPolarAngle = Math.PI / 6;   // can't go more overhead than 30°
controls.maxPolarAngle = Math.PI / 2.5; // can't go more sideways than 72°
```

---

Add both polar angle limits to the controls setup:

```ts
controls.minPolarAngle = Math.PI / 6;   // ~30°: not completely top-down
controls.maxPolarAngle = Math.PI / 2.5; // ~72°: not completely sideways
```

---

### SAVE AND TRY

Save. Browser refreshes.

**Test the limits:** Drag the camera to tilt it. It stops before going completely overhead or completely sideways. The grid stays readable at all angles.

**Change something:** Change `minPolarAngle` to `0`. Save. Now drag to completely top-down — the grid looks like a flat square with no perspective. Change it back to `Math.PI / 6`.

---

## Final Check

| Feature | How to verify |
|---|---|
| Drag rotates camera | Click and drag on the canvas — the camera orbits the grid |
| Scroll zooms | Mouse wheel zooms in and out |
| Right-drag pans | Right-click and drag moves the view |
| Zoom limits work | Cannot zoom closer than 3 or farther than 25 units |
| Polar angle limits work | Cannot tilt completely overhead or completely sideways |
| Damping works | Release after drag — camera eases to stop, not instant |
| Drag does not select | Orbiting does not accidentally highlight tiles |
| Clean click still selects | A short click without dragging still highlights orange |

---

## Your Complete `src/main.ts`

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── GameConfig Interface ──────────────────────────────────────────────────────
interface GameConfig {
  canvasWidth:  number;
  canvasHeight: number;
  cameraFov:    number;
  cameraNear:   number;
  cameraFar:    number;
}

// ── Tile Interface ────────────────────────────────────────────────────────────
interface Tile {
  row:      number;
  col:      number;
  walkable: boolean;
  mesh:     THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setTileColor(tile: Tile, color: number): void {
  tile.material.color.setHex(color);
}

function getTileBaseColor(tile: Tile): number {
  return (tile.row + tile.col) % 2 === 0 ? 0x2d5a27 : 0x4a8f3f;
}

// ── Configuration ─────────────────────────────────────────────────────────────
const CONFIG: GameConfig = {
  canvasWidth:  800,
  canvasHeight: 600,
  cameraFov:    60,
  cameraNear:   0.1,
  cameraFar:    100,
};

// ── Renderer ──────────────────────────────────────────────────────────────────
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(CONFIG.canvasWidth, CONFIG.canvasHeight);
document.body.appendChild(renderer.domElement);

// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene: THREE.Scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  CONFIG.cameraFov,
  CONFIG.canvasWidth / CONFIG.canvasHeight,
  CONFIG.cameraNear,
  CONFIG.cameraFar
);
camera.position.set(0, 10, 8);

// ── Camera Controls ───────────────────────────────────────────────────────────
const controls: OrbitControls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping  = true;
controls.dampingFactor  = 0.05;
controls.minDistance    = 3;
controls.maxDistance    = 25;
controls.minPolarAngle  = Math.PI / 6;
controls.maxPolarAngle  = Math.PI / 2.5;
controls.update();

// ── Lights ────────────────────────────────────────────────────────────────────
const sunLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);

const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// ── Grid Constants ────────────────────────────────────────────────────────────
const GRID_COLS: number = 8;
const GRID_ROWS: number = 8;
const TILE_SIZE: number = 1;

const GRID_OFFSET_X: number = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const GRID_OFFSET_Z: number = -(GRID_ROWS * TILE_SIZE) / 2 + TILE_SIZE / 2;

const TILE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(
  TILE_SIZE - 0.05,
  TILE_SIZE - 0.05
);

// ── Grid Data ─────────────────────────────────────────────────────────────────
const grid: Tile[][] = [];

// ── Grid ──────────────────────────────────────────────────────────────────────
for (let row = 0; row < GRID_ROWS; row++) {
  grid[row] = [];

  for (let col = 0; col < GRID_COLS; col++) {
    const isDarkTile: boolean = (row + col) % 2 === 0;
    const tileColor: number   = isDarkTile ? 0x2d5a27 : 0x4a8f3f;

    const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: tileColor,
    });
    const mesh: THREE.Mesh = new THREE.Mesh(TILE_GEOMETRY, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.x = col * TILE_SIZE + GRID_OFFSET_X;
    mesh.position.y = 0;
    mesh.position.z = row * TILE_SIZE + GRID_OFFSET_Z;
    scene.add(mesh);

    const tile: Tile = { row, col, walkable: true, mesh, material };
    grid[row][col]   = tile;
    mesh.userData['tile'] = tile;
  }
}

// ── Selection State ───────────────────────────────────────────────────────────
let selectedTile: Tile | null = null;

// ── Drag Detection ────────────────────────────────────────────────────────────
const DRAG_THRESHOLD_PX: number = 5;
let mouseDownX: number = 0;
let mouseDownY: number = 0;

renderer.domElement.addEventListener('mousedown', (event: MouseEvent) => {
  mouseDownX = event.clientX;
  mouseDownY = event.clientY;
});

// ── Raycaster ─────────────────────────────────────────────────────────────────
const raycaster: THREE.Raycaster = new THREE.Raycaster();

// ── Input ─────────────────────────────────────────────────────────────────────
renderer.domElement.addEventListener('click', (event: MouseEvent) => {
  const dx: number = event.clientX - mouseDownX;
  const dy: number = event.clientY - mouseDownY;
  if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) return;

  const rect: DOMRect = renderer.domElement.getBoundingClientRect();
  const ndcX: number  = ((event.clientX - rect.left) / rect.width)  *  2 - 1;
  const ndcY: number  = ((event.clientY - rect.top)  / rect.height) * -2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

  const intersections: THREE.Intersection[] = raycaster.intersectObjects(scene.children);

  if (intersections.length === 0) {
    if (selectedTile !== null) {
      setTileColor(selectedTile, getTileBaseColor(selectedTile));
      selectedTile = null;
    }
    return;
  }

  const hitTile = intersections[0].object.userData['tile'] as Tile | undefined;
  if (hitTile === undefined) return;

  if (selectedTile !== null) {
    setTileColor(selectedTile, getTileBaseColor(selectedTile));
  }

  if (selectedTile === hitTile) {
    selectedTile = null;
  } else {
    selectedTile = hitTile;
    setTileColor(selectedTile, 0xff8800);
  }
});

// ── Clock ─────────────────────────────────────────────────────────────────────
const clock: THREE.Clock = new THREE.Clock();

// ── Game Loop ─────────────────────────────────────────────────────────────────
function update(_deltaTime: number): void {
  controls.update();
}

function render(): void {
  renderer.render(scene, camera);
}

function animate(): void {
  const rawDelta: number  = clock.getDelta();
  const deltaTime: number = Math.min(rawDelta, 0.1);
  requestAnimationFrame(animate);
  update(deltaTime);
  render();
}

animate();
```

---

## Quick Check Answers

**1. How do you tell the difference between a drag and a real click?**
Record the mouse position when the button is pressed (`mousedown`). When the `click` event fires, calculate the distance between the press position and the release position using the distance formula. If the distance is larger than a threshold (a few pixels), the user dragged — ignore the click. If the distance is small, the user clicked in place — proceed normally.

**2. Why does damping require `controls.update()` every frame?**
Damping is a simulation — on each frame it reduces the current velocity by a factor (`dampingFactor`). It is not a one-time calculation. Without calling `update()` each frame, the velocity never gets reduced, and the camera never decelerates. `update()` also reads the current mouse state and adjusts the camera accordingly. Skipping it means the controls become unresponsive.

**3. What two pieces of information do you need to calculate the distance between two points?**
The coordinates of both points. Specifically, the difference in X (`dx = x2 - x1`) and the difference in Y (`dy = y2 - y1`). The distance is `√(dx² + dy²)` — the Pythagorean theorem applied to the differences. In 3D you add a third term: `√(dx² + dy² + dz²)`. The same formula works in any number of dimensions by adding one squared difference per axis.

---

*End of Lab 07.*

*Lab 08 introduces classes — the `Tower` class specifically. Click a tile to place a tower on it. Click a tower tile to remove it. This is the first real game interaction.*
