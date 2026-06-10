# TypeScript Tower Defense — LAB 06 — Raycasting

**Prerequisites:** Lab 05 complete. You have an 8×8 grid stored as `Tile[][]` with one yellow tile at `grid[3][3]`.

**What this lab adds:**
- Mouse click detection on 3D tiles using raycasting
- Selecting a tile highlights it; clicking again deselects it
- `null` — the TypeScript type for "no value"
- Event listeners — responding to user input

**Time:** 60–75 minutes.

---

## What You Will Build

Click any tile — it turns orange. Click it again or click a different tile — the previous one returns to its original color. The grid responds to your mouse.

```
     ┌──┬──┬──┬──┬──┬──┬──┬──┐
     │  │  │  │  │  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │  │ O│  │  │  │  │  │   ← clicked tile is orange
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │  │  │  │  │  │  │  │
     └──┴──┴──┴──┴──┴──┴──┴──┘

Click a tile → orange highlight
Click it again → returns to checkerboard color
Click a different tile → previous deselects, new one selects
```

This is exactly how CAD applications implement "click to select geometry." The technique — casting a ray from the camera through the mouse position to find what it hits — is called raycasting, and it is used in every 3D application that responds to mouse clicks.

---

> **Quick Check — try to answer before reading further:**
>
> 1. When you click the mouse on the canvas, the browser gives you pixel coordinates like `(clientX: 450, clientY: 320)`. Three.js raycasting needs different coordinates. What do you think those look like, and why can't pixel coordinates be used directly?
> 2. What two pieces of information do you think define a ray in 3D space?
> 3. The raycaster might return multiple hits (if objects are stacked behind each other). Which hit do you think you want — the first or the last?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Store a Back-Reference on Each Mesh

The raycaster returns a Three.js `Mesh` object when you click. But you need a `Tile` — the data object that has `row`, `col`, `walkable`, and `material`. You need a way to go from mesh → tile.

---

### Concept: `userData`

**What it is:** A plain JavaScript object on every Three.js object (`Object3D`) that exists specifically for storing your own custom data. Three.js never reads from it or writes to it — it is entirely yours.

**The problem before:**
When the raycaster reports "the user clicked this mesh," you have a reference to the mesh. But the mesh itself contains no information about which tile it belongs to. To find the tile, you would have to loop through all 64 entries in `grid` comparing references — slow and fragile.

**The solution:**
```ts
mesh.userData['tile'] = tile; // store a reference from mesh → tile
```

Later, when raycasting gives you a mesh:
```ts
const tile = hitMesh.userData['tile'] as Tile; // go from mesh → tile instantly
```

**`userData` in Three.js:**
Every `Object3D` (meshes, lights, cameras, groups) has `userData: { [key: string]: any }`. The `[key: string]: any` type means you can store any value under any string key. Three.js intentionally makes this untyped so it stays flexible.

**The `as Tile` cast:**
Because `userData` is typed as `any`, TypeScript does not know the type of what you stored. The `as Tile` cast tells TypeScript: "I know this is a Tile — treat it as one." You are responsible for ensuring this is correct. In this case it always is — you stored a `Tile` and you are reading it back as a `Tile`.

**Watch for:** `userData` is a good place to store small, tile-specific data. Do not use it to store large objects, arrays, or anything that changes frequently. For frequently-updated data, use the `Tile` interface properties directly.

---

In the grid loop in `main.ts`, add one line after the tile is created and stored in `grid`:

```ts
    const tile: Tile = { row, col, walkable: true, mesh, material };
    grid[row][col] = tile;

    // Store a back-reference so raycasting can go from mesh → tile.
    mesh.userData['tile'] = tile;
```

---

### SAVE AND TRY

Save. Browser refreshes. Grid looks the same.

**In the console:**
```js
// Get the first tile mesh from the scene (index 2 = first tile, after 2 lights)
scene.children[2].userData
```
**Expected:** An object containing `{ tile: { row: 0, col: 0, walkable: true, ... } }`.

This confirms the back-reference is stored on the mesh and accessible from the scene.

---

## Step 2 — Add a Click Event Listener

Before raycasting, you need to detect mouse clicks on the canvas.

---

### Concept: Event Listeners

**What it is:** A function you register with the browser that gets called automatically when a specific thing happens — a click, a key press, a mouse move. This is how all user interaction works in browsers.

**The syntax:**
```ts
element.addEventListener('eventName', handlerFunction);
```

- `element` — which HTML element to listen on
- `'eventName'` — what to listen for (`'click'`, `'mousemove'`, `'keydown'`, etc.)
- `handlerFunction` — your function, called when the event fires

**The event object:**
When your handler is called, the browser passes it an event object containing details about what happened. For a click event, this is a `MouseEvent` — it has `clientX` and `clientY` (mouse position in pixels).

**Smallest possible example:**
```ts
document.addEventListener('click', (event: MouseEvent) => {
  console.log('clicked at:', event.clientX, event.clientY);
});
```

**Arrow functions:**
The handler is written as `(event: MouseEvent) => { ... }`. This is an *arrow function* — a compact syntax for writing a function inline.

```ts
// Arrow function:
(event: MouseEvent) => {
  console.log(event.clientX);
}

// Is equivalent to:
function handler(event: MouseEvent): void {
  console.log(event.clientX);
}
```

Arrow functions and regular functions work the same for event handlers. Arrow functions are more common in this pattern because they are written at the point where they are used — no need to name and declare them separately.

**Listening on `renderer.domElement`:**
You listen on the canvas element specifically, not the whole document. This ensures you only respond to clicks inside the game, not clicks on any other part of the page.

**Watch for:** `addEventListener` does not return anything. Once registered, the listener stays active until you explicitly remove it with `removeEventListener`. For a game that runs for the lifetime of the page, you typically never remove the listeners.

---

Add a click listener after the grid and before the clock. Start by just logging the coordinates to confirm it works:

```ts
// ── Input ─────────────────────────────────────────────────────────────────────
renderer.domElement.addEventListener('click', (event: MouseEvent) => {
  // Temporary: log the raw pixel coordinates of the click.
  // Remove after confirming the listener fires.
  console.log('clicked at pixel:', event.clientX, event.clientY);
});
```

---

### SAVE AND TRY

Save. Browser refreshes. Click anywhere on the canvas.

**You should see in the console:**
```
clicked at pixel: 412 298
```
(Your numbers will differ based on where you clicked.)

**Click several different spots.** Notice the numbers change with each click. `clientX` increases as you move right. `clientY` increases as you move down.

**Change something:** Change the event from `'click'` to `'mousemove'`. Save. Move your mouse over the canvas. The console floods with messages — one per pixel of movement. Change it back to `'click'`.

---

## Step 3 — Convert Pixel Coordinates to NDC

The raycaster does not work with pixel coordinates. It needs Normalized Device Coordinates (NDC).

---

### Concept: Normalized Device Coordinates (NDC)

**What it is:** A coordinate system where the top-left of the canvas is `(-1, 1)`, the bottom-right is `(1, -1)`, and the center is `(0, 0)`. Every point on the canvas maps to a value between -1 and +1 on both axes.

**Why "normalized":** The values are normalized — scaled to a fixed range regardless of the canvas's actual pixel size. A 400px canvas and an 800px canvas both use -1 to +1. The math inside Three.js does not need to know the canvas dimensions.

**The conversion formula:**
```
ndcX = (pixelX / canvasWidth)  * 2 - 1
ndcY = (pixelY / canvasHeight) * -2 + 1   ← Y is negated
```

**Why Y is negated:**
Browser pixel coordinates have `y = 0` at the top — Y increases downward. NDC has `y = 1` at the top — Y increases upward. The negation flips the axis.

```
Browser pixels:          NDC:
(0,0) ─────── (800,0)     (-1,+1) ────── (+1,+1)
  │                          │
  │                          │
(0,600) ──── (800,600)    (-1,-1) ────── (+1,-1)

Y increases downward      Y increases upward
```

**Getting the canvas position:**
The canvas may not be at pixel `(0, 0)` on the screen — the browser may have margin, other elements above it, or the page may be scrolled. `getBoundingClientRect()` gives you the canvas's actual position:

```ts
const rect = renderer.domElement.getBoundingClientRect();
const pixelX = event.clientX - rect.left; // position within the canvas
const pixelY = event.clientY - rect.top;

const ndcX = (pixelX / rect.width)  *  2 - 1;
const ndcY = (pixelY / rect.height) * -2 + 1;
```

**Smallest possible example:**
```ts
renderer.domElement.addEventListener('click', (event: MouseEvent) => {
  const rect = renderer.domElement.getBoundingClientRect();
  const ndcX = ((event.clientX - rect.left) / rect.width)  *  2 - 1;
  const ndcY = ((event.clientY - rect.top)  / rect.height) * -2 + 1;
  console.log('NDC:', ndcX, ndcY);
});
```

**Watch for:** Always subtract `rect.left` and `rect.top` before dividing. If you divide the raw `event.clientX` by `rect.width` without subtracting the offset, clicks near the canvas work but clicks far from it are wrong.

---

Update the click handler to compute and log NDC coordinates:

```ts
renderer.domElement.addEventListener('click', (event: MouseEvent) => {
  // Step 1: Get the canvas position on screen.
  const rect: DOMRect = renderer.domElement.getBoundingClientRect();

  // Step 2: Convert pixel coordinates to canvas-local coordinates.
  const pixelX: number = event.clientX - rect.left;
  const pixelY: number = event.clientY - rect.top;

  // Step 3: Convert to NDC (-1 to +1 on both axes, Y flipped).
  const ndcX: number = (pixelX / rect.width)  *  2 - 1;
  const ndcY: number = (pixelY / rect.height) * -2 + 1;

  // Temporary log — remove after the SAVE AND TRY.
  console.log('NDC:', ndcX.toFixed(3), ndcY.toFixed(3));
});
```

---

### SAVE AND TRY

Save. Browser refreshes. Click different parts of the canvas.

**You should see:**
- Center of canvas: `NDC: 0.000 0.000`
- Top-left corner: `NDC: -1.000 1.000`
- Bottom-right corner: `NDC: 1.000 -1.000`
- Left edge, middle height: `NDC: -1.000 0.000`

**Change something:** Click the very center of the canvas. The NDC values should be close to `0.000, 0.000`. If they are not exactly 0 that is fine — your click was probably slightly off center.

Remove the `console.log('NDC:', ...)` line before the next step.

---

## Step 4 — Create the Raycaster and Cast a Ray

Now that you have NDC coordinates, you can cast a ray and find what it hits.

---

### Concept: Raycasting

**What it is:** Shooting an invisible ray from a point in a direction and detecting which 3D objects the ray passes through. The ray is defined by two things: an origin (a point in space) and a direction (which way it travels).

**The problem raycasting solves:**
The screen is 2D. The world is 3D. When you click at NDC `(0.3, 0.1)`, you want to know: what 3D object is under that point? But "under a 2D point" means "somewhere along a line that goes from the camera through that screen point into the scene." That line is the ray.

```
Camera
  │
  │  ray goes from camera through the
  │  clicked screen point into the scene
  ↓
 NDC point (0.3, 0.1) ──────────────────────→ hits tile at (row 3, col 5)
```

**`THREE.Raycaster`:**
```ts
const raycaster = new THREE.Raycaster();

// Set the ray's origin and direction from a camera + NDC point:
raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

// Test which objects the ray intersects:
const intersections = raycaster.intersectObjects(objectsToTest);
// intersections is an array, sorted nearest-first
```

**`THREE.Vector2`:** A Two.js object holding an (x, y) pair. Used here to pass the NDC coordinates to `setFromCamera`.

**`intersectObjects(objects)`:** Takes an array of `Object3D` items and returns an array of intersections — each containing the hit object, the distance, and the 3D point of intersection. The array is sorted by distance — the first entry is the nearest hit.

**Why the result is an array:**
The ray might pass through multiple objects (imagine stacked tiles). You get all of them so you can decide which one matters. For a flat grid with nothing stacked, there is always only 0 or 1 intersection.

**Smallest possible example:**
```ts
const raycaster = new THREE.Raycaster();

raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
const hits = raycaster.intersectObjects(scene.children);

if (hits.length > 0) {
  console.log('hit:', hits[0].object); // the nearest hit object
}
```

**Watch for:** Create the raycaster once (outside the event handler) and reuse it. Creating `new THREE.Raycaster()` on every click wastes memory. The raycaster is stateless between calls — `setFromCamera` replaces its previous state completely.

---

Add the raycaster before the event listener, and update the handler to cast the ray:

```ts
// ── Raycaster ─────────────────────────────────────────────────────────────────
// Created once and reused on every click.
const raycaster: THREE.Raycaster = new THREE.Raycaster();

// ── Input ─────────────────────────────────────────────────────────────────────
renderer.domElement.addEventListener('click', (event: MouseEvent) => {
  const rect: DOMRect = renderer.domElement.getBoundingClientRect();
  const ndcX: number  = ((event.clientX - rect.left) / rect.width)  *  2 - 1;
  const ndcY: number  = ((event.clientY - rect.top)  / rect.height) * -2 + 1;

  // Aim the ray from the camera through the clicked NDC point.
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

  // Test against all objects in the scene.
  const intersections: THREE.Intersection[] = raycaster.intersectObjects(scene.children);

  if (intersections.length > 0) {
    // Temporary: log what was hit. Remove after SAVE AND TRY.
    console.log('hit:', intersections[0].object);
    console.log('userData:', intersections[0].object.userData);
  }
});
```

---

### SAVE AND TRY

Save. Browser refreshes. Click a tile.

**You should see in the console:**
```
hit: Mesh { ... }
userData: { tile: { row: 2, col: 3, walkable: true, ... } }
```

The `row` and `col` values change depending on which tile you clicked.

**Click outside the grid.** The console shows nothing — `intersections.length === 0` when the ray hits empty space.

**Click the yellow tile at row 3, col 3.** The userData shows `{ row: 3, col: 3 }`.

Remove both `console.log` lines before the next step.

---

## Step 5 — Select and Deselect Tiles

Now wire the raycasting to the tile color system.

---

### Concept: `null` and Union Types

**What it is:** `null` is a value that explicitly means "no value." It is different from `0`, `false`, or `""` — those are values. `null` means "this variable intentionally holds nothing."

**The problem:**
You want a variable `selectedTile` that either holds the currently selected `Tile`, or holds nothing (when nothing is selected). In TypeScript, a variable typed as `Tile` must always hold a `Tile` — you cannot set it to `null`.

**The solution — a union type:**
```ts
let selectedTile: Tile | null = null;
//                ↑ either a Tile, or null
//                          ↑ starts as null (nothing selected)
```

The `|` operator means "or" in TypeScript types. `Tile | null` means "this variable holds either a Tile or null."

**Null checking — required by TypeScript:**
```ts
if (selectedTile !== null) {
  // Inside this block, TypeScript KNOWS selectedTile is a Tile (not null)
  // so you can safely access selectedTile.row, selectedTile.material, etc.
  console.log(selectedTile.row); // ← safe
}

// Outside the block:
console.log(selectedTile.row); // ← ERROR: selectedTile might be null
```

This is TypeScript's null safety — it forces you to check before accessing. Without this check, code that runs when `selectedTile` is `null` would throw a runtime error.

**Why it matters here:** When a tile is clicked, the previously selected tile (if any) needs to be deselected. `selectedTile` starts as `null`. After the first click, it holds a `Tile`. After clicking the same tile again, it goes back to `null`.

**Watch for:** `null` and `undefined` are different in TypeScript. `null` means "intentionally no value." `undefined` means "this variable was never assigned." For "currently nothing selected," use `null` — it is intentional and explicit.

---

### Concept: `getTileBaseColor` — A Pure Function with a Return Type

**What it is:** A function that calculates a tile's original checkerboard color from its position, without reading or writing any external state.

**Why it is needed:**
When you deselect a tile, you need to restore its original color. You could store the original color in the `Tile` interface, but you already have everything needed to calculate it: `row` and `col`. A function that recalculates from data is simpler and avoids storing redundant information.

**A function with a return type:**
```ts
function getTileBaseColor(tile: Tile): number {
//                                     ↑ return type: number
  return (tile.row + tile.col) % 2 === 0 ? 0x2d5a27 : 0x4a8f3f;
}
```

The `return` statement produces a value that is passed back to the caller:
```ts
const color = getTileBaseColor(grid[3][3]); // color = 0x2d5a27 or 0x4a8f3f
setTileColor(grid[3][3], getTileBaseColor(grid[3][3])); // restore color
```

**Pure function definition:** `getTileBaseColor` takes a `Tile` and returns a `number`. It reads `tile.row` and `tile.col` — both come from the parameter. It writes nothing. The same input always produces the same output. This makes it trivially testable — you will write a test for it in Lab 23.

---

Add these to `main.ts`:

**1. Add `getTileBaseColor` helper after `setTileColor`:**

```ts
// Returns the checkerboard color a tile should have based on its position.
// Used to restore a tile's color after deselecting it.
function getTileBaseColor(tile: Tile): number {
  return (tile.row + tile.col) % 2 === 0 ? 0x2d5a27 : 0x4a8f3f;
}
```

**2. Add the selected tile variable before the raycaster:**

```ts
// ── Selection State ───────────────────────────────────────────────────────────
// null = nothing selected. Tile = the currently highlighted tile.
let selectedTile: Tile | null = null;
```

**3. Replace the click handler body with the full selection logic:**

```ts
renderer.domElement.addEventListener('click', (event: MouseEvent) => {
  const rect: DOMRect = renderer.domElement.getBoundingClientRect();
  const ndcX: number  = ((event.clientX - rect.left) / rect.width)  *  2 - 1;
  const ndcY: number  = ((event.clientY - rect.top)  / rect.height) * -2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

  const intersections: THREE.Intersection[] = raycaster.intersectObjects(scene.children);

  if (intersections.length === 0) {
    // Clicked empty space — deselect whatever is selected.
    if (selectedTile !== null) {
      setTileColor(selectedTile, getTileBaseColor(selectedTile));
      selectedTile = null;
    }
    return; // nothing more to do
  }

  // Get the Tile stored in the hit mesh's userData.
  const hitTile = intersections[0].object.userData['tile'] as Tile | undefined;

  if (hitTile === undefined) {
    return; // hit something that is not a tile (e.g., a light helper)
  }

  if (selectedTile !== null) {
    // Deselect the previously selected tile.
    setTileColor(selectedTile, getTileBaseColor(selectedTile));
  }

  if (selectedTile === hitTile) {
    // Clicked the already-selected tile — deselect it.
    selectedTile = null;
  } else {
    // Select the new tile.
    selectedTile = hitTile;
    setTileColor(selectedTile, 0xff8800); // orange highlight
  }
});
```

---

### SAVE AND TRY

Save. Browser refreshes. Remove or comment out the `setTileColor(grid[3][3], 0xffff00)` line from Lab 05 — we no longer need the manual highlight.

**You should see:** The plain checkerboard grid.

**Click any tile.** It turns orange.

**Click a different tile.** The previous one restores to its checkerboard color. The new one turns orange.

**Click the same tile twice.** First click: orange. Second click: returns to checkerboard (deselected).

**Click outside the grid.** The selected tile (if any) deselects.

**In the console:**
```js
selectedTile
```
**Expected:** After clicking a tile, this returns the `Tile` object. After deselecting, it returns `null`.

**Change something:** Change the selection color from `0xff8800` (orange) to `0x0088ff` (blue). Save. Selected tiles now turn blue. Change it back to `0xff8800`.

---

## Challenge: Show the Row and Column of the Selected Tile

**You know:** `selectedTile` holds the currently selected `Tile | null`. A `Tile` has `row` and `col` properties. `console.log` prints to the console.

**Task:** When a tile is selected, print its row and column to the console in the format: `Selected tile: row 3, col 5`. When a tile is deselected (by clicking it again or clicking empty space), print: `Deselected`.

**Starting code — modify the click handler:**
```ts
// After selectedTile = hitTile:
// print "Selected tile: row X, col Y"

// After selectedTile = null (both deselect paths):
// print "Deselected"
```

**Hint:** Template literals — strings with embedded expressions — use backticks and `${}`:
```ts
console.log(`Selected tile: row ${hitTile.row}, col ${hitTile.col}`);
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

In the click handler, add log lines:

```ts
  if (selectedTile === hitTile) {
    selectedTile = null;
    console.log('Deselected');           // ← add this
  } else {
    selectedTile = hitTile;
    setTileColor(selectedTile, 0xff8800);
    console.log(`Selected tile: row ${selectedTile.row}, col ${selectedTile.col}`); // ← add this
  }
```

And in the empty-space click:
```ts
  if (selectedTile !== null) {
    setTileColor(selectedTile, getTileBaseColor(selectedTile));
    selectedTile = null;
    console.log('Deselected');           // ← add this
  }
```

**Key insight:** Template literals (backtick strings with `${}`) are the standard way to build strings from values in TypeScript. `\`row ${tile.row}\`` is more readable than `'row ' + tile.row` and is used throughout the series for log messages and UI text.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `userData['tile']` stored on each mesh | `scene.children[2].userData` in console shows `{ tile: {...} }` |
| Click a tile → turns orange | Click any tile — it highlights orange |
| Click same tile again → deselects | Second click on same tile restores checkerboard |
| Click different tile → previous deselects | New tile selects, previous one restores |
| Click empty space → deselects | Click black area — selected tile restores |
| `selectedTile` is `Tile | null` | `selectedTile` in console is `null` when nothing selected |
| No console errors | Console is clean during normal use |

---

## Your Complete `src/main.ts`

```ts
import * as THREE from 'three';

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
camera.lookAt(0, 0, 0);

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

// ── Raycaster ─────────────────────────────────────────────────────────────────
const raycaster: THREE.Raycaster = new THREE.Raycaster();

// ── Input ─────────────────────────────────────────────────────────────────────
renderer.domElement.addEventListener('click', (event: MouseEvent) => {
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

  if (hitTile === undefined) {
    return;
  }

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
  // Nothing to update yet.
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

**1. Why can't pixel coordinates be used directly for raycasting?**
Pixel coordinates depend on the canvas size — a click at `(400, 300)` on an 800×600 canvas means something different than the same pixel position on a 400×300 canvas. Three.js raycasting needs coordinates that are independent of canvas size, in a range it understands. NDC normalizes the coordinates to -1..+1 on both axes regardless of canvas dimensions. This way the raycaster math works the same whether your canvas is 400 pixels wide or 4000 pixels wide.

**2. What two pieces of information define a ray?**
An origin (a point in 3D space where the ray starts) and a direction (a vector pointing where the ray travels). In `setFromCamera`, Three.js computes both automatically from the camera position and the NDC point — the origin is the camera's position, and the direction points from the camera through the clicked screen coordinate into the scene.

**3. Which intersection do you want — the first or the last?**
The first — `intersections[0]`. The array is sorted by distance from the camera (nearest first). The first entry is the closest object the ray hit, which is the one the user visually clicked on. Objects behind it are occluded. In a flat grid with nothing stacked, there is typically only one intersection anyway — but always using `[0]` is correct regardless.

---

*End of Lab 06.*

*Lab 07 adds camera orbit controls — click and drag to rotate around the grid, scroll to zoom in and out. This is the core navigation that every 3D application including your CAD/CAM system needs.*
