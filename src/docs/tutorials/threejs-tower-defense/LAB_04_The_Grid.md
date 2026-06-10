# TypeScript Tower Defense — LAB 04 — The Grid

**Prerequisites:** Lab 03 complete. You have a working game loop with `update()`, `render()`, delta time, and a rotating cube.

**What this lab adds:**
- A flat grid of tiles — the game board
- 2D arrays — the data structure that represents a grid
- Coordinate math — converting grid positions to world positions
- A repositioned camera looking down at the board from an angle
- Nested `for` loops to create many objects efficiently

**Time:** 60–90 minutes.

---

## What You Will Build

The rotating cube is gone. In its place: a flat grid of tiles viewed from an elevated angle, like a board game seen from above.

```
         camera
            ↓  (looking down at an angle)

     ┌──┬──┬──┬──┬──┬──┬──┬──┐
     │  │  │  │  │  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │  │  │  │  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │  │  │  │  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │  │  │  │  │  │  │  │
     └──┴──┴──┴──┴──┴──┴──┴──┘
         8 × 8 grid of tiles
     (alternating dark/light green)
```

The tiles are flat planes in 3D space. The camera sits above and behind the grid, giving a 2.5D perspective view. This is the game board that towers, enemies, and paths will be added to in later labs.

---

> **Quick Check — try to answer before reading further:**
>
> 1. An 8×8 grid has 64 tiles. What loop structure would you use to create all 64 tiles without writing 64 separate lines of code?
> 2. In Three.js, position `(0, 0, 0)` is the center of the world. If your grid is 8 tiles wide and each tile is 1 unit, what should the X position of the leftmost tile be? (Think: how far left of center is the left edge of the grid?)
> 3. `PlaneGeometry` creates a flat plane. By default, which way does it face — up toward the sky, or toward you like a wall? Write your best guess.
>
> *(Answers at the end of this lab)*

---

## Step 1 — Reposition the Camera

The cube used a camera looking straight ahead at the origin from `z = 5`. For a grid viewed from above, the camera needs to be elevated and tilted downward.

---

### Concept: `camera.lookAt()`

**What it is:** A method that rotates the camera to point at a specific position in the world.

**The problem before:**
When you move the camera (`camera.position`), it keeps its original rotation — it does not automatically point at anything new. After `camera.position.set(0, 10, 8)`, the camera would look straight ahead into empty space, not down at the grid.

**The solution:**
```ts
camera.position.set(0, 10, 8);  // move the camera
camera.lookAt(0, 0, 0);          // point it at the origin
```

`lookAt` rotates the camera automatically so its Z axis points toward the target.

**Smallest possible example:**
```ts
camera.position.set(0, 5, 5); // 5 units up, 5 units back
camera.lookAt(0, 0, 0);       // looking at the origin — camera tilts ~45° downward
```

**Why it matters here:** The grid will be centered at the origin, lying flat on the XZ plane. The camera needs to be above and behind it, looking down at an angle. `lookAt` handles the rotation automatically — no manual angle calculation needed.

**Watch for:** `lookAt` sets the rotation at the time you call it. If you later move the camera in `update()`, you need to call `lookAt` again to keep it pointed at the same target. This lab does not animate the camera, so one call is enough.

---

### Concept: The Three.js Coordinate System

**What it is:** A set of three axes that define directions in 3D space. Every position, rotation, and direction is expressed in terms of these three axes.

**The axes:**

```
        Y (up)
        │
        │
        └──────── X (right)
       /
      /
     Z (toward you)
```

| Axis | Direction |
|---|---|
| X | Left (negative) and right (positive) |
| Y | Down (negative) and up (positive) |
| Z | Into the screen (negative) and toward you (positive) |

**Where the grid will live:**
The grid lies flat on the XZ plane — it has X and Z coordinates, but Y is 0 (ground level). This matches how floors work in 3D games. The camera sits at a positive Y (above the ground) and a positive Z (behind the grid).

**Why it matters here:** When you position tiles, you set their `position.x` and `position.z`. Their `position.y` is `0` — they sit on the ground. The camera looks down from above, which means it has a large positive Y position.

**Watch for:** The Y axis is "up" in Three.js — this is true for most game engines. In some mathematics and CAD tools, Z is "up" instead. Three.js uses Y-up.

---

In `src/main.ts`, find the camera setup and replace it with this. Remove the box, lights, and clock for now — you will not need the box in this lab:

```ts
// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene: THREE.Scene = new THREE.Scene();

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  CONFIG.cameraFov,
  CONFIG.canvasWidth / CONFIG.canvasHeight,
  CONFIG.cameraNear,
  CONFIG.cameraFar
);

// Position the camera above and behind the grid, looking down at an angle.
// Y = height above the ground, Z = distance behind the grid center.
camera.position.set(0, 10, 8);
camera.lookAt(0, 0, 0); // point at the center of the grid
```

Also update `CONFIG` — the camera properties need new values, and you can remove `cameraZ` since it is replaced by `camera.position.set()`:

```ts
interface GameConfig {
  canvasWidth:  number;
  canvasHeight: number;
  cameraFov:    number;
  cameraNear:   number;
  cameraFar:    number;
}

const CONFIG: GameConfig = {
  canvasWidth:  800,
  canvasHeight: 600,
  cameraFov:    60,    // narrower FOV suits a top-down view
  cameraNear:   0.1,
  cameraFar:    100,
};
```

Also simplify `update()` and `render()` — there is no box to rotate:

```ts
function update(_deltaTime: number): void {
  // Nothing to update yet — grid tiles are static.
}

function render(): void {
  renderer.render(scene, camera);
}
```

(The `_` prefix on `_deltaTime` is a TypeScript convention meaning "this parameter exists but is intentionally unused right now." Without the `_`, TypeScript may warn about an unused variable.)

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** A completely black canvas. The scene is empty — no box, no lights, nothing to draw. This is correct and expected.

**In the console:**
```js
camera.position
```
**Expected:** `{x: 0, y: 10, z: 8}` — the camera is above and behind the origin.

**Change something:** Change the camera position to `camera.position.set(0, 20, 0)` and `camera.lookAt(0, 0, 0)`. This puts the camera directly overhead looking straight down — a pure top-down view. You cannot see anything yet, but you will see the difference once tiles are added. Change it back to `(0, 10, 8)`.

---

## Step 2 — Add One Tile

Before building the full grid, build one tile. Get one thing working first, then repeat it.

---

### Concept: `PlaneGeometry`

**What it is:** A flat rectangular plane — a 3D shape that has width and height but no depth. It is the shape used for flat surfaces: floors, walls, water, UI panels.

**The problem with `PlaneGeometry`:**
By default, `PlaneGeometry` faces you like a wall — it lies in the XY plane, standing upright. For a floor tile, you need it lying flat in the XZ plane.

**Before rotation:**
```
Y
│   ┌───┐
│   │   │   ← facing toward you (the Z axis)
│   └───┘
└────────── X
        (Z is toward you, out of screen)
```

**After rotation `x = -Math.PI / 2`:**
```
Y
│
│  ┌─────────┐   ← now flat, facing up
│  └─────────┘
└──────────────── X
     (laid flat on the XZ plane)
```

```ts
const tile = new THREE.PlaneGeometry(1, 1);
tile.rotation.x = -Math.PI / 2; // rotate -90 degrees to lay flat
```

**`Math.PI / 2` = 90 degrees:**
As you learned in Lab 03, Three.js uses radians. A quarter rotation is `π/2 ≈ 1.5708` radians. The negative sign rotates downward (tilts the top away from you) which lays the plane flat on the ground.

**Smallest possible example:**
```ts
const geometry = new THREE.PlaneGeometry(1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
const tile     = new THREE.Mesh(geometry, material);
tile.rotation.x = -Math.PI / 2; // lay flat on the XZ plane
scene.add(tile);
```

**Why it matters here:** Every tile in the grid is a `PlaneGeometry`. You create one geometry and share it across all 64 tiles. The rotation is applied to each mesh, not the geometry.

**Watch for:** The rotation is on `tile.rotation.x`, not `geometry.rotation.x`. Geometry is just data — the mesh is the positioned, rotated object in the scene.

---

Add lights and one tile to `main.ts`. Place this after the camera setup:

```ts
// ── Lights ────────────────────────────────────────────────────────────────────
// Same lights as before — directional for shading, ambient for fill.
const sunLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);

const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// ── First Tile ────────────────────────────────────────────────────────────────
// One tile at the origin — 1 unit wide, 1 unit deep.
// PlaneGeometry faces up after rotation. Y stays at 0 (ground level).
const tileGeometry: THREE.PlaneGeometry       = new THREE.PlaneGeometry(1, 1);
const tileMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
const tile: THREE.Mesh                         = new THREE.Mesh(tileGeometry, tileMaterial);
tile.rotation.x = -Math.PI / 2; // rotate to lay flat on XZ plane
scene.add(tile);
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** A small green square in the center of the black canvas, viewed at an angle. It looks like a floor tile seen from slightly above.

**In the console:**
```js
tile.rotation.x
```
**Expected:** `-1.5707...` — that is `-Math.PI / 2`, which is -90 degrees.

**Change something:** Remove the `tile.rotation.x = -Math.PI / 2` line temporarily. Save. The tile disappears — it is now standing upright like a wall, edge-on to the camera (a flat surface with no depth is invisible when viewed edge-on). Add the line back.

---

## Challenge: Move the Tile

**You know:** `mesh.position.set(x, y, z)` positions a mesh in the scene.

**Task:** Move the tile to position `(2, 0, 2)` — 2 units to the right and 2 units back. Notice where it appears relative to center. Then move it to `(-2, 0, -2)` and observe. Then back to `(0, 0, 0)`.

**This is an observation challenge — just experiment.**

**Starting code:**
```ts
const tile = new THREE.Mesh(tileGeometry, tileMaterial);
tile.rotation.x = -Math.PI / 2;
// add position here
scene.add(tile);
```

---

<details>
<summary>▶ Show Answer</summary>

```ts
tile.position.set(2, 0, 2);  // right and toward you
tile.position.set(-2, 0, -2); // left and away from you
tile.position.set(0, 0, 0);  // back to center (default)
```

**Key insight:** The XZ plane is the ground. Moving on X goes left/right. Moving on Z goes toward/away from the camera. Moving on Y goes up/down — which is not what you want for ground tiles. In the grid, each tile's position is calculated from its column (X) and row (Z).

</details>

---

## Step 3 — Create a Row With a Loop

One tile works. Now create a row of 8 tiles using a `for` loop.

---

### Concept: `for` Loops

**What it is:** A control structure that repeats a block of code a specific number of times, with a counter variable that changes each iteration.

**The syntax:**
```ts
for (let i = 0; i < 8; i++) {
  // this block runs 8 times
  // i starts at 0, ends at 7
}
```

Breaking it down:
```ts
for (
  let i = 0;   // initialization — create counter, start at 0
  i < 8;       // condition — keep going while i is less than 8
  i++          // increment — add 1 to i after each iteration
) {
  // body — runs once per iteration
}
```

**`i++` means `i = i + 1`:**
After each iteration the counter increases by 1. When `i` reaches `8`, the condition `i < 8` is false and the loop stops. The loop runs for `i = 0, 1, 2, 3, 4, 5, 6, 7` — that is 8 iterations.

**Using `i` to calculate position:**
```ts
for (let col = 0; col < 8; col++) {
  const tile = new THREE.Mesh(tileGeometry, tileMaterial);
  tile.rotation.x = -Math.PI / 2;
  tile.position.x = col; // col 0 → x=0, col 1 → x=1, col 2 → x=2 ...
  scene.add(tile);
}
```

**Why `col` not `i`:**
The spec rule: no unexplained single-letter variables (except `i` in simple loops). `col` describes what the counter means — it is the current column index. When you read it later, `col` tells you exactly what the number represents.

**Watch for:** The loop creates a new `tile` variable on each iteration — that is correct and intentional. Each iteration creates a new `Mesh` object. They all share the same `tileGeometry` and `tileMaterial`, which saves memory.

---

Remove the single tile from the previous step and add a row loop instead. Replace everything from `// ── First Tile ──` onward in your file:

```ts
// ── Grid Constants ────────────────────────────────────────────────────────────
const GRID_COLS: number = 8;  // number of columns
const TILE_SIZE: number = 1;  // world units per tile

// ── Shared Tile Geometry ──────────────────────────────────────────────────────
// Created once, shared across all tile meshes — saves memory.
// Slightly smaller than TILE_SIZE to leave a visible gap between tiles.
const TILE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(
  TILE_SIZE - 0.05, // width: slightly less than full tile size
  TILE_SIZE - 0.05  // height (depth on the ground): same
);

// ── One Row of Tiles ──────────────────────────────────────────────────────────
for (let col = 0; col < GRID_COLS; col++) {
  const tileMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5a27, // dark green
  });
  const tile: THREE.Mesh = new THREE.Mesh(TILE_GEOMETRY, tileMaterial);

  tile.rotation.x = -Math.PI / 2; // lay flat on the XZ plane
  tile.position.x = col;          // each column is 1 unit apart
  tile.position.y = 0;            // ground level
  tile.position.z = 0;            // all in row 0 for now

  scene.add(tile);
}
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** A row of 8 green tiles stretching to the right. The camera is above and to the right, so the row recedes into the distance slightly.

**In the console:**
```js
scene.children.length
```
**Expected:** `10` — 8 tiles + 2 lights.

**Change something:** Change `GRID_COLS` to `4`. Save. Four tiles. Change it to `12`. Twelve tiles. Change it back to `8`. Notice that changing one number changes the entire row — because the loop uses `GRID_COLS` as its limit.

---

## Step 4 — Center the Row

The row starts at `x = 0` and goes right. It should be centered on the origin. This requires coordinate math.

---

### Concept: Centering a Grid

**What it is:** Calculating the starting offset so that the grid is centered at the origin rather than starting at the corner.

**The problem:**
```
col = 0 → x = 0
col = 1 → x = 1
col = 2 → x = 2
...
col = 7 → x = 7

Grid starts at x=0 and extends to x=7.
Center of the grid is at x=3.5.
But the world origin is at x=0 — so the grid is off-center.
```

**The solution — calculate the offset:**
```
gridWidth = GRID_COLS × TILE_SIZE = 8 × 1 = 8 units

To center: shift left by half the grid width
offset = -(gridWidth / 2) = -4

But each tile's position is its center, not its left edge.
So shift right by half a tile to land on the center:
offset = -(gridWidth / 2) + (TILE_SIZE / 2) = -4 + 0.5 = -3.5

col 0: x = 0  + (-3.5) = -3.5
col 1: x = 1  + (-3.5) = -2.5
col 2: x = 2  + (-3.5) = -1.5
...
col 7: x = 7  + (-3.5) =  3.5

Center of the grid: (-3.5 + 3.5) / 2 = 0  ✓
```

**The general formula:**
```ts
tile.position.x = col * TILE_SIZE - (GRID_COLS / 2) * TILE_SIZE + TILE_SIZE / 2;
```

Or more readably, calculate the offset once outside the loop:
```ts
const gridOffsetX = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;
tile.position.x   = col * TILE_SIZE + gridOffsetX;
```

**Why it matters here:** The camera looks at the origin. If the grid is not centered at the origin, it will be off to one side. The same math applies to the Z axis for rows. You will use this formula again every time you center a group of objects.

---

Update the loop section to center the row:

```ts
// ── Grid Constants ────────────────────────────────────────────────────────────
const GRID_COLS:  number = 8;
const TILE_SIZE:  number = 1;

// Offset to center the grid on the origin.
// Without this, the grid starts at (0,0) and extends right and forward.
const GRID_OFFSET_X: number = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;

// ── Shared Tile Geometry ──────────────────────────────────────────────────────
const TILE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(
  TILE_SIZE - 0.05,
  TILE_SIZE - 0.05
);

// ── One Centered Row of Tiles ─────────────────────────────────────────────────
for (let col = 0; col < GRID_COLS; col++) {
  const tileMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5a27,
  });
  const tile: THREE.Mesh = new THREE.Mesh(TILE_GEOMETRY, tileMaterial);

  tile.rotation.x = -Math.PI / 2;
  tile.position.x = col * TILE_SIZE + GRID_OFFSET_X; // ← centered
  tile.position.y = 0;
  tile.position.z = 0;

  scene.add(tile);
}
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** The row of 8 tiles now centered in the view — half the tiles to the left of center, half to the right.

**In the console:**
```js
// Check the first tile's x position (scene.children[0] is the first light,
// scene.children[2] is the first tile):
scene.children[2].position.x
```
**Expected:** `-3.5` — the leftmost tile center is 3.5 units left of the origin.

**Change something:** Temporarily set `GRID_OFFSET_X` to `0`. Save. The row shifts right — starts at the origin. Change it back to the formula.

---

## Step 5 — Add All Rows With a Nested Loop

One row works. A full grid is rows repeated, one for each row index.

---

### Concept: Nested `for` Loops

**What it is:** A `for` loop inside another `for` loop. The inner loop runs completely for every single iteration of the outer loop.

**The pattern:**
```ts
for (let row = 0; row < GRID_ROWS; row++) {
  for (let col = 0; col < GRID_COLS; col++) {
    // This body runs GRID_ROWS × GRID_COLS times total.
    // For an 8×8 grid: 8 × 8 = 64 times.
  }
}
```

**How it executes:**
```
row = 0: col = 0, 1, 2, 3, 4, 5, 6, 7  → 8 tiles in row 0
row = 1: col = 0, 1, 2, 3, 4, 5, 6, 7  → 8 tiles in row 1
row = 2: col = 0, 1, 2, 3, 4, 5, 6, 7  → 8 tiles in row 2
...
row = 7: col = 0, 1, 2, 3, 4, 5, 6, 7  → 8 tiles in row 7
Total: 64 tiles
```

**The Z axis for rows:**
Tiles in the same row share the same `z` position. Each row is one `TILE_SIZE` further along the Z axis. The centering formula for Z is identical to the formula for X:

```ts
const GRID_OFFSET_Z = -(GRID_ROWS * TILE_SIZE) / 2 + TILE_SIZE / 2;
tile.position.z     = row * TILE_SIZE + GRID_OFFSET_Z;
```

**Watch for:** Nested loops create many objects quickly. An 8×8 grid creates 64 meshes. A 100×100 grid creates 10,000. Keep grids reasonably sized — performance will be addressed in later labs.

---

Replace the one-row loop with the full grid:

```ts
// ── Grid Constants ────────────────────────────────────────────────────────────
const GRID_COLS: number = 8;
const GRID_ROWS: number = 8;
const TILE_SIZE: number = 1;

// Offsets to center the entire grid on the world origin.
const GRID_OFFSET_X: number = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const GRID_OFFSET_Z: number = -(GRID_ROWS * TILE_SIZE) / 2 + TILE_SIZE / 2;

// ── Shared Tile Geometry ──────────────────────────────────────────────────────
const TILE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(
  TILE_SIZE - 0.05,
  TILE_SIZE - 0.05
);

// ── Full Grid ─────────────────────────────────────────────────────────────────
for (let row = 0; row < GRID_ROWS; row++) {
  for (let col = 0; col < GRID_COLS; col++) {
    const tileMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5a27, // dark green — all tiles the same color for now
    });
    const tile: THREE.Mesh = new THREE.Mesh(TILE_GEOMETRY, tileMaterial);

    tile.rotation.x = -Math.PI / 2;
    tile.position.x = col * TILE_SIZE + GRID_OFFSET_X;
    tile.position.y = 0;
    tile.position.z = row * TILE_SIZE + GRID_OFFSET_Z;

    scene.add(tile);
  }
}
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** A full 8×8 grid of green tiles, centered in the view, seen from the elevated camera angle. The tiles are slightly separated by the 0.05-unit gap in the geometry.

**In the console:**
```js
scene.children.length
```
**Expected:** `66` — 64 tiles + 2 lights.

**Change something:** Change `GRID_COLS` to `12` and `GRID_ROWS` to `6`. Save. A wide rectangular grid. Change both back to `8`.

---

## Step 6 — Add a Checkerboard Pattern

All tiles are the same color, which makes it hard to see individual tiles. A checkerboard pattern alternates two colors based on each tile's position — this is a good first use of conditional logic.

---

### Concept: The Modulo Operator `%`

**What it is:** An operator that returns the *remainder* after division.

```ts
5 % 2 = 1   // 5 ÷ 2 = 2 remainder 1
6 % 2 = 0   // 6 ÷ 2 = 3 remainder 0
7 % 2 = 1   // 7 ÷ 2 = 3 remainder 1
8 % 2 = 0   // 8 ÷ 2 = 4 remainder 0
```

**The pattern:** Any number `% 2` is either `0` (even) or `1` (odd). This gives you a way to alternate between two states — even positions get one thing, odd positions get another.

**For a checkerboard:** A tile at `(row, col)` should be dark if `(row + col)` is even, light if it is odd:

```
(0+0)=0 even → dark    (0+1)=1 odd → light   (0+2)=2 even → dark  ...
(1+0)=1 odd  → light   (1+1)=2 even → dark   (1+2)=3 odd  → light ...
(2+0)=2 even → dark    (2+1)=3 odd  → light  (2+2)=4 even → dark  ...
```

**In code:**
```ts
const isDark = (row + col) % 2 === 0;
const color  = isDark ? 0x2d5a27 : 0x4a8f3f; // dark green : light green
```

**The ternary operator `? :`:**
```ts
const result = condition ? valueIfTrue : valueIfFalse;
// equivalent to:
// if (condition) { result = valueIfTrue; } else { result = valueIfFalse; }
```

It is a compact way to choose between two values based on a condition. Used here to pick one of two colors.

**Why it matters here:** The modulo operator appears constantly in game development — wrapping positions at boundaries (Lab 03's edge-wrapping), cycling through animation frames, distributing objects evenly. `% 2` for even/odd is the simplest case; you will use `% n` for n-way cycles later.

---

### Concept: `if` / `else`

**What it is:** A control structure that runs different code depending on whether a condition is true or false.

**The syntax:**
```ts
if (condition) {
  // runs when condition is true
} else {
  // runs when condition is false
}
```

**Combined with `===` (strict equality):**
```ts
if ((row + col) % 2 === 0) {
  // even — dark tile
} else {
  // odd — light tile
}
```

**`===` vs `==`:**
Always use `===` in TypeScript (and JavaScript). `===` checks value AND type — `5 === 5` is `true`, `5 === "5"` is `false`. The double-equals `==` does type coercion — `5 == "5"` is `true`, which is almost never what you want.

**Watch for:** The condition inside `if (...)` must evaluate to a `boolean` — `true` or `false`. TypeScript enforces this with `strict: true`. An expression like `if (someNumber)` is valid JavaScript but TypeScript will warn about it if the type is not already `boolean`.

---

Update the tile color assignment inside the nested loop:

```ts
for (let row = 0; row < GRID_ROWS; row++) {
  for (let col = 0; col < GRID_COLS; col++) {

    // Checkerboard: even sum → dark, odd sum → light.
    const isDarkTile: boolean = (row + col) % 2 === 0;
    const tileColor: number   = isDarkTile ? 0x2d5a27 : 0x4a8f3f;

    const tileMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: tileColor,
    });
    const tile: THREE.Mesh = new THREE.Mesh(TILE_GEOMETRY, tileMaterial);

    tile.rotation.x = -Math.PI / 2;
    tile.position.x = col * TILE_SIZE + GRID_OFFSET_X;
    tile.position.y = 0;
    tile.position.z = row * TILE_SIZE + GRID_OFFSET_Z;

    scene.add(tile);
  }
}
```

---

### SAVE AND TRY

Save. The browser refreshes.

**You should see:** A checkerboard grid — alternating dark green and light green tiles viewed from the elevated camera.

**In the console:**
```js
// Check that the first and second tiles have different colors.
// Children 0 and 1 are the lights. Children 2 and 3 are the first two tiles.
scene.children[2].material.color
scene.children[3].material.color
```
**Expected:** Two different color objects — one for each shade of green.

**Change something:** Change the light tile color from `0x4a8f3f` to `0x7ec850`. Save. The lighter tiles become noticeably brighter. Change it back.

---

## Challenge: Highlight the Border Tiles

**You know:** `if` / `else` checks conditions. `row` and `col` tell you where in the grid you are.

**Task:** Make the tiles on the border of the grid (the outermost row and column on each edge) a different color — `0x8B4513` (brown). The interior tiles keep the checkerboard pattern. The result should look like a wooden frame around the green grid.

**The condition for a border tile:**
A tile is on the border if it is in the first row (`row === 0`), the last row (`row === GRID_ROWS - 1`), the first column (`col === 0`), or the last column (`col === GRID_COLS - 1`).

**Hint 1:** The `||` operator means "or" — `conditionA || conditionB` is true if either condition is true.

**Hint 2:** You need to check `row` and `col` *before* calculating `tileColor` and change the color if it is a border tile.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
for (let row = 0; row < GRID_ROWS; row++) {
  for (let col = 0; col < GRID_COLS; col++) {

    // A tile is on the border if it sits at any outer edge.
    const isBorder: boolean =
      row === 0 ||
      row === GRID_ROWS - 1 ||
      col === 0 ||
      col === GRID_COLS - 1;

    let tileColor: number;

    if (isBorder) {
      tileColor = 0x8B4513; // brown border
    } else {
      // Interior tiles keep the checkerboard.
      const isDarkTile: boolean = (row + col) % 2 === 0;
      tileColor = isDarkTile ? 0x2d5a27 : 0x4a8f3f;
    }

    const tileMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: tileColor,
    });
    const tile: THREE.Mesh = new THREE.Mesh(TILE_GEOMETRY, tileMaterial);

    tile.rotation.x = -Math.PI / 2;
    tile.position.x = col * TILE_SIZE + GRID_OFFSET_X;
    tile.position.y = 0;
    tile.position.z = row * TILE_SIZE + GRID_OFFSET_Z;

    scene.add(tile);
  }
}
```

**Key insight:** Conditional logic inside a loop is how you give individual objects in a group different properties based on their position. In the game, this same pattern will distinguish path tiles from buildable tiles, grass tiles from water tiles. The structure — loop over all tiles, check the position, apply the right property — is reused constantly.

Remove the border highlight before continuing — restore the plain checkerboard.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Camera is repositioned | `camera.position` in console shows `{x:0, y:10, z:8}` |
| Grid is visible | 8×8 green checkerboard visible in the browser |
| Grid is centered | Tiles extend equally left and right of center |
| Checkerboard pattern | Adjacent tiles are different shades of green |
| Correct tile count | `scene.children.length` returns `66` (64 tiles + 2 lights) |
| Shared geometry | Only one `TILE_GEOMETRY` created, used by all tiles |
| `update()` exists | `function update(_deltaTime: number): void` is in the file |

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

// ── Configuration ─────────────────────────────────────────────────────────────
const CONFIG: GameConfig = {
  canvasWidth:  800,
  canvasHeight: 600,
  cameraFov:    60,
  cameraNear:   0.1,
  cameraFar:    100,
};

// ── Renderer ─────────────────────────────────────────────────────────────────
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

// ── Shared Tile Geometry ──────────────────────────────────────────────────────
const TILE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(
  TILE_SIZE - 0.05,
  TILE_SIZE - 0.05
);

// ── Grid ──────────────────────────────────────────────────────────────────────
for (let row = 0; row < GRID_ROWS; row++) {
  for (let col = 0; col < GRID_COLS; col++) {
    const isDarkTile: boolean = (row + col) % 2 === 0;
    const tileColor: number   = isDarkTile ? 0x2d5a27 : 0x4a8f3f;

    const tileMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: tileColor,
    });
    const tile: THREE.Mesh = new THREE.Mesh(TILE_GEOMETRY, tileMaterial);

    tile.rotation.x = -Math.PI / 2;
    tile.position.x = col * TILE_SIZE + GRID_OFFSET_X;
    tile.position.y = 0;
    tile.position.z = row * TILE_SIZE + GRID_OFFSET_Z;

    scene.add(tile);
  }
}

// ── Clock ─────────────────────────────────────────────────────────────────────
const clock: THREE.Clock = new THREE.Clock();

// ── Game Loop ─────────────────────────────────────────────────────────────────
function update(_deltaTime: number): void {
  // Tiles are static — nothing to update yet.
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

**1. What loop structure would you use to create all 64 tiles?**
A nested `for` loop — one loop for rows, one inside it for columns. The outer loop runs 8 times (once per row). Each time the outer loop runs, the inner loop runs 8 times (once per column in that row). Total iterations: 8 × 8 = 64. Each iteration creates one tile at the position `(col, row)`.

**2. What should the X position of the leftmost tile be?**
If the grid is 8 tiles wide with 1 unit per tile, the total width is 8 units. To center it on the origin, the left edge should be at `x = -4`. But tile positions refer to the tile's center, not its left edge — so the first tile's center is at `x = -4 + 0.5 = -3.5`. The formula `-(GRID_COLS / 2) * TILE_SIZE + TILE_SIZE / 2` gives this automatically.

**3. Which way does `PlaneGeometry` face by default?**
It faces toward you — standing upright like a wall, in the XY plane. This means if you add it to the scene without rotating it, you see it as a rectangle facing the camera. To use it as a floor tile, you rotate it `-90 degrees` (or `-Math.PI / 2` radians) around the X axis, which tips the top away from you and lays the plane flat on the XZ ground plane.

---

*End of Lab 04.*

*Lab 05 stores the grid in a 2D array of data objects — each tile becomes a typed TypeScript object with properties like `walkable`, `occupied`, and `color`. This is the data structure that pathfinding, tower placement, and game logic will read and write.*
