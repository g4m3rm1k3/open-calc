# TypeScript Tower Defense — LAB 08 — Classes and Towers

**Prerequisites:** Lab 07 complete. You have a clickable grid with orbit camera controls working.

**What this lab adds:**
- The `Tower` class — your first class in the series
- Click an empty tile to place a tower (a blue cylinder appears)
- Click a tower tile to remove it
- `occupied: boolean` added to the `Tile` interface
- `Array.find()` — locating an item in an array by a condition

**Time:** 60–90 minutes.

---

## What You Will Build

Click any tile on the grid — a blue cylinder tower appears on it. Click the same tile again — the tower is removed. The click handler from previous labs is replaced with this new tower-placement logic.

```
     ┌──┬──┬──┬──┬──┬──┬──┬──┐
     │  │  │  │  │  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │  │ T│  │  │  │  │  │   T = tower (blue cylinder)
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │ T│  │  │ T│  │  │  │
     └──┴──┴──┴──┴──┴──┴──┴──┘

Click empty tile  → tower appears (tile turns grey)
Click tower tile  → tower removed  (tile returns to green)
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. What is the difference between a *class* and an *instance* of a class? Use a real-world analogy in your answer.
> 2. A class has a *constructor*. What do you think a constructor does, and when does it run?
> 3. You have an array of towers and you want to find the one on a specific tile. What would you need to check about each tower to find the right one?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand What a Class Is

Before writing any code, read this section carefully. Classes are the most important concept in this lab.

---

### Concept: Classes — Blueprint vs Instance

**What it is:** A class is a *blueprint* that describes the shape and behavior of objects you want to create. An *instance* is one specific object built from that blueprint.

**The real-world analogy:**
A house blueprint describes how every house of that design will look — number of rooms, position of windows, where the kitchen is. The blueprint itself is not a house. When you build from the blueprint, each building is an instance — it follows the same design but exists independently. Changing the color of one house does not change the others.

In code:
```ts
class Tower {
  // blueprint: every Tower will have these things
}

const tower1 = new Tower(...); // instance 1 — a real Tower object
const tower2 = new Tower(...); // instance 2 — another real Tower, independent of tower1
```

**What a class contains:**
- **Properties** — data the object holds (like `row`, `col`, `mesh`)
- **Constructor** — code that runs once when `new Tower(...)` is called, sets up the properties
- **Methods** — functions attached to the object (like `dispose()`)

**The `this` keyword:**
Inside a class, `this` refers to the specific instance being worked on. When you write `this.mesh = new THREE.Mesh(...)`, you are setting the `mesh` property on that particular tower, not on all towers.

```ts
class Tower {
  mesh: THREE.Mesh; // property declaration

  constructor() {
    this.mesh = new THREE.Mesh(...); // 'this' = the new Tower being created
  }
}

const t1 = new Tower();
const t2 = new Tower();
// t1.mesh and t2.mesh are different objects — each instance has its own
```

**Class vs interface:**

| | Interface | Class |
|---|---|---|
| Creates values? | No — type only | Yes — `new Tower()` creates an object |
| Has methods? | Can declare, not implement | Yes — full implementation |
| Compiled to JavaScript? | No — erased completely | Yes — appears in JS output |
| Used for | Describing shape, contracts | Creating objects with behavior |

**Watch for:** Interfaces describe shapes. Classes create objects. A class *can* implement an interface — you will do this in later labs. For now, the distinction is: interfaces are for TypeScript's type checker only; classes produce real JavaScript objects.

---

### Concept: The Constructor

**What it is:** A special method named `constructor` that runs automatically when `new ClassName(...)` is called. Its job is to set up the new instance — assign initial values to all properties.

**The syntax:**
```ts
class Tower {
  row: number;
  col: number;

  constructor(row: number, col: number) {
    // 'this' refers to the new Tower being created
    this.row = row;
    this.col = col;
  }
}

const t = new Tower(3, 5);
// Constructor ran with row=3, col=5
// t.row === 3, t.col === 5
```

**The constructor has no return type annotation.** It always returns the new instance. Writing `: void` or any other type on a constructor is a TypeScript error.

**Watch for:** If you forget to assign a property inside the constructor, TypeScript (with `strict: true`) will flag an error: "Property 'row' has no initializer and is not definitely assigned in the constructor." Every property declared on the class must be assigned in the constructor.

---

### Concept: `readonly` Properties

**What it is:** A property modifier that allows assignment only in the constructor. Once constructed, the property cannot be changed.

**The problem before:**
```ts
class Tower {
  tile: Tile;
  constructor(tile: Tile) { this.tile = tile; }
}

const t = new Tower(grid[3][3]);
t.tile = grid[5][5]; // accidentally moves the tower to a different tile
```

**The solution:**
```ts
class Tower {
  readonly tile: Tile; // can only be assigned in the constructor
  constructor(tile: Tile) { this.tile = tile; }
}

const t = new Tower(grid[3][3]);
t.tile = grid[5][5]; // TypeScript error: Cannot assign to 'tile' because it is a read-only property
```

**Why it matters here:** A tower's tile does not change after placement — it is fixed to the tile it was placed on. `readonly` makes this intent explicit and catches bugs where code accidentally tries to move a tower.

**Watch for:** `readonly` is a TypeScript concept only. It compiles away to plain JavaScript. At runtime, the property is technically assignable — but TypeScript prevents it at write-time, which is when you want the protection.

---

## Step 2 — Update the `Tile` Interface

Towers need to know whether a tile is already occupied. Add `occupied` to the `Tile` interface.

---

Add `occupied: boolean` to the `Tile` interface:

```ts
interface Tile {
  row:      number;
  col:      number;
  walkable: boolean;
  occupied: boolean; // ← add this: true if a tower sits on this tile
  mesh:     THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}
```

Update the tile creation inside the grid loop to include `occupied: false`:

```ts
    const tile: Tile = { row, col, walkable: true, occupied: false, mesh, material };
```

TypeScript will show an error on the old line — `occupied` is missing from the object literal. Adding it fixes the error. This is TypeScript's interface enforcement at work.

---

### SAVE AND TRY

Save. The browser refreshes. Grid looks the same.

**In the console:**
```js
grid[0][0].occupied
```
**Expected:** `false` — all tiles start unoccupied.

---

## Step 3 — Write the `Tower` Class

Now write the class. Read the concept blocks first, then the code.

---

### Concept: Methods

**What it is:** A function defined inside a class, which belongs to every instance. Methods can read and write the instance's properties via `this`.

**The syntax:**
```ts
class Tower {
  mesh: THREE.Mesh;

  constructor(...) { ... }

  // A method: belongs to every Tower instance
  dispose(): void {
    // 'this' refers to the specific Tower whose dispose() was called
    scene.remove(this.mesh);
  }
}

const t = new Tower(...);
t.dispose(); // runs on this specific tower only
```

**Methods vs functions:**
A standalone function has no `this`. A method on a class has `this` pointing to the instance it was called on. If you have ten towers, calling `tower3.dispose()` runs `dispose` with `this === tower3`.

**`dispose()` naming convention:**
`dispose` is the conventional name in Three.js for "clean up this object's resources and remove it from the scene." You will see `.dispose()` used on geometries, materials, and textures throughout Three.js. Using the same name for tower cleanup is consistent with that convention.

---

### Concept: `CylinderGeometry`

**What it is:** A Three.js geometry that creates a cylinder or cone shape.

```ts
new THREE.CylinderGeometry(
  radiusTop,     // radius at the top (0 = cone tip)
  radiusBottom,  // radius at the bottom
  height,        // total height
  radialSegments // number of sides (8 = octagonal cross-section)
)
```

**For a tower:**
```ts
new THREE.CylinderGeometry(0.25, 0.35, 1.2, 8)
// Slightly wider at the base (0.35) than the top (0.25) — like a turret
// 1.2 units tall
// 8 sides — looks round from a distance
```

**Why `radialSegments = 8`:** A true circle would require infinite segments. Eight gives a good approximation with minimal geometry. At game distances, 8-sided cylinders look round.

**Positioning the cylinder:** A `CylinderGeometry` is centered at the origin — its midpoint is at `y = 0`. To make it sit on top of the tile (tile is at `y = 0`), position the cylinder at `y = height / 2` so its bottom aligns with the tile surface.

---

Add the `Tower` class to `main.ts`, just after the `getTileBaseColor` helper function:

```ts
// ── Tower Class ───────────────────────────────────────────────────────────────
class Tower {
  readonly tile: Tile;        // the tile this tower sits on — never changes
  readonly mesh: THREE.Mesh;  // the visual cylinder

  constructor(tile: Tile) {
    this.tile = tile;

    // A slightly tapered cylinder: narrower at top than at base.
    const geometry = new THREE.CylinderGeometry(
      0.25, // top radius
      0.35, // base radius — slightly wider for a turret look
      1.2,  // height
      8     // sides — 8 gives a round appearance at game distances
    );
    const material = new THREE.MeshStandardMaterial({ color: 0x3355ff });
    this.mesh = new THREE.Mesh(geometry, material);

    // CylinderGeometry is centered at y=0. Shift up by half height
    // so the base sits on the tile surface instead of sinking through it.
    this.mesh.position.x = tile.mesh.position.x;
    this.mesh.position.y = 0.6; // height / 2 = 1.2 / 2 = 0.6
    this.mesh.position.z = tile.mesh.position.z;
  }

  // Removes this tower's mesh from the scene.
  // Called when the tower is destroyed or the player removes it.
  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}
```

---

### SAVE AND TRY

Save. The browser refreshes. Grid looks the same — no towers are placed yet. The class exists but no instances have been created.

**In VS Code — try this:**
After the class declaration, temporarily type:
```ts
const testTower = new Tower(grid[0][0]);
```

Hover over `testTower`. VS Code shows `const testTower: Tower`. Hover over `testTower.tile` — it shows `readonly tile: Tile`. The `readonly` keyword is visible in the tooltip.

Delete the test line before continuing.

---

## Step 4 — Place Towers on Click

Replace the selection logic from Labs 05–06 with tower placement.

---

### Concept: `Array.find()`

**What it is:** An array method that searches for the first element matching a condition. It takes a function (called a *predicate*) and returns the first element for which the predicate returns `true`. If nothing matches, it returns `undefined`.

**The syntax:**
```ts
const found = array.find(item => condition);
```

**The arrow function as a predicate:**
```ts
towers.find(t => t.tile === tile)
// For each tower t in the array:
//   check if t.tile === tile
//   return the first tower where this is true
```

Breaking it down:
```ts
towers.find(
  (t: Tower) => t.tile === tile
//  ↑ each item   ↑ the condition to check
//  in the array
)
```

**What it returns:**
- If found: the matching `Tower`
- If not found: `undefined`

So the return type is `Tower | undefined` — you must check for `undefined` before using the result.

**`===` for object comparison:**
`t.tile === tile` checks if `t.tile` is the *exact same object* in memory as `tile`. Since each `Tile` is a unique object created in the grid loop, this comparison correctly identifies "the tower whose tile is this specific tile." Two different tile objects at the same row/col would not be `===` to each other.

**Smallest possible example:**
```ts
const numbers = [10, 20, 30, 40];
const found = numbers.find(n => n > 25); // → 30 (first number greater than 25)
const notFound = numbers.find(n => n > 100); // → undefined
```

**Watch for:** `find` returns the first match. If multiple items match, it returns only the first. For towers, there is at most one tower per tile, so this is always correct.

---

### Concept: `Array.indexOf()` and `Array.splice()`

**What they are:** Two array methods used together to remove an item.

**`indexOf(item)`:** Returns the index (position number) of `item` in the array. Returns `-1` if not found.

**`splice(index, count)`:** Removes `count` items starting at `index`, modifying the array in place.

**Removing an item by value:**
```ts
const towers: Tower[] = [towerA, towerB, towerC];

const index = towers.indexOf(towerB); // → 1
towers.splice(index, 1);              // removes 1 item at index 1

// towers is now [towerA, towerC]
```

**Why not just set it to `null`?**
Setting `towers[1] = null` leaves a hole — the array still has length 3 but `towers[1]` is `null`. Every loop over the array would need to check for `null`. `splice` actually removes the element, keeping the array clean.

**Watch for:** Always check that `indexOf` returned something other than `-1` before calling `splice`. `splice(-1, 1)` removes the *last* element — not what you want.

---

Add the towers array and replace the entire click handler section. First, remove the selection state variable (`let selectedTile: Tile | null = null`) and the `selectedTile`-based click handler. Replace with:

```ts
// ── Towers ────────────────────────────────────────────────────────────────────
// Flat list of all placed towers. Used to find which tower is on a given tile.
const towers: Tower[] = [];

// Places a tower on a tile and marks it occupied.
function placeTower(tile: Tile): void {
  const tower = new Tower(tile);
  scene.add(tower.mesh);     // add the mesh to the scene so it renders
  tile.occupied = true;
  setTileColor(tile, 0x888888); // grey — visually shows the tile is occupied
  towers.push(tower);
}

// Removes the tower from a tile and marks it unoccupied.
function removeTower(tile: Tile): void {
  const tower: Tower | undefined = towers.find(t => t.tile === tile);

  if (tower === undefined) {
    return; // no tower on this tile — nothing to remove
  }

  tower.dispose(scene);      // remove the mesh from the scene

  const index: number = towers.indexOf(tower);
  towers.splice(index, 1);   // remove from the towers array

  tile.occupied = false;
  setTileColor(tile, getTileBaseColor(tile)); // restore checkerboard color
}
```

Now update the click handler to use `placeTower` and `removeTower`:

```ts
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
  if (intersections.length === 0) return;

  const hitTile = intersections[0].object.userData['tile'] as Tile | undefined;
  if (hitTile === undefined) return;

  if (hitTile.occupied) {
    removeTower(hitTile); // click occupied tile → remove tower
  } else {
    placeTower(hitTile);  // click empty tile → place tower
  }
});
```

---

### SAVE AND TRY

Save. Browser refreshes.

**You should see:** The checkerboard grid with no towers initially.

**Click any tile.** A blue cylinder appears on it. The tile turns grey.

**Click the same tile.** The cylinder disappears. The tile returns to its checkerboard color.

**Click several different tiles.** Multiple towers appear. Orbit the camera with drag to see them from different angles. The towers stay in place as the camera moves.

**In the console:**
```js
towers.length
```
**Expected:** The number of towers currently on the board.

```js
towers[0].tile.row
towers[0].tile.col
```
**Expected:** The row and column of the first placed tower.

**Change something:** Change the tower color from `0x3355ff` to `0xff3333`. Save. New towers appear red. Old ones stay blue — they were created before the change. Refresh and place new ones to see red. Change back to `0x3355ff`.

---

## Challenge: Prevent Placing Towers on Non-Walkable Tiles

**You know:** Each `Tile` has a `walkable: boolean` property. `placeTower` currently places a tower on any empty tile. In a tower defense game, towers should not block the enemy path.

**Task:** Modify `placeTower` (or the click handler) so that towers can only be placed on tiles where `tile.walkable === true`. Clicking a non-walkable tile should do nothing.

**To test it:** In the console, set a tile as non-walkable first:
```js
grid[2][2].walkable = false;
```
Then click that tile — no tower should appear.

**Starting code:**
```ts
function placeTower(tile: Tile): void {
  // add a check here before placing
  const tower = new Tower(tile);
  ...
}
```

**No hints — you have everything you need.**

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function placeTower(tile: Tile): void {
  if (!tile.walkable) {
    return; // do not place towers on non-walkable tiles
  }
  const tower = new Tower(tile);
  scene.add(tower.mesh);
  tile.occupied = true;
  setTileColor(tile, 0x888888);
  towers.push(tower);
}
```

**Key insight:** `!tile.walkable` is shorthand for `tile.walkable === false`. The `!` operator negates a boolean — `!true` is `false`, `!false` is `true`. Returning early from a function when a precondition is not met (rather than wrapping everything in an `if`) is called a *guard clause*. Guard clauses keep function bodies flat and readable by eliminating deeply nested `if` blocks.

</details>

---

## Step 5 — Inspect the Tower Class From the Console

This step has no code to write. It is practice using the console to explore objects.

---

### SAVE AND TRY

Place two or three towers on the grid. Then use the console to explore.

**Read tower properties:**
```js
towers[0].tile.row    // which row
towers[0].tile.col    // which column
towers[0].mesh.position // world position of the cylinder
```

**Verify readonly enforcement at runtime:**
```js
towers[0].tile = grid[0][0]
```
**Expected:** No error at runtime (readonly is TypeScript-only), but the value changes. This is why readonly is a *compile-time* protection — it stops you in VS Code and the terminal, not in the browser console. Real protection comes from TypeScript catching it before the code runs.

**Check the scene:**
```js
scene.children.length
```
**Expected:** 2 (lights) + GRID_COLS × GRID_ROWS (tiles) + number of towers placed.

**Check the towers array:**
```js
towers.map(t => ({ row: t.tile.row, col: t.tile.col }))
```
**Expected:** An array of `{ row, col }` objects — one per placed tower. `Array.map()` transforms each item in the array — you will use it extensively in later labs.

---

## Challenge: Count Occupied and Free Tiles

**You know:** `grid` is a `Tile[][]`. Each tile has `occupied: boolean`. You can loop with nested `for` loops.

**Task:** Without modifying the source file, write code in the browser console that prints:
- How many tiles are occupied (have a tower)
- How many tiles are free (no tower)

The two numbers should add up to `GRID_ROWS × GRID_COLS = 64`.

**Starting point — type in the console:**
```js
let occupied = 0;
let free = 0;
// your loops here
console.log('occupied:', occupied, '  free:', free);
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
let occupied = 0;
let free = 0;
for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col].occupied) {
      occupied++;
    } else {
      free++;
    }
  }
}
console.log('occupied:', occupied, '  free:', free);
```

**Key insight:** `if (grid[row][col].occupied)` is shorthand for `if (grid[row][col].occupied === true)`. For boolean properties, you can omit the `=== true` — the property itself is the condition. This is fine when the property name reads naturally as a yes/no question: "if occupied", "if walkable", "if visible".

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `Tower` class exists | Hover `Tower` in VS Code — shows the class type |
| `Tower` constructor sets `tile` and `mesh` | `towers[0].tile` and `towers[0].mesh` in console after placing |
| `tile` and `mesh` are `readonly` | `towers[0].tile = ...` in VS Code shows a TypeScript error |
| Click empty tile → tower appears | Blue cylinder on tile |
| Tile turns grey when occupied | Grey color replaces green on clicked tile |
| Click tower tile → tower removed | Cylinder disappears, tile returns to green |
| `towers` array updates | `towers.length` changes with each place/remove |
| `tile.occupied` tracks state | `grid[r][c].occupied` is `true` after placing, `false` after removing |
| Orbit still works | Drag still rotates camera |
| Click while dragging does not place | Dragging to orbit does not accidentally place towers |

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
  occupied: boolean;
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

// ── Tower Class ───────────────────────────────────────────────────────────────
class Tower {
  readonly tile: Tile;
  readonly mesh: THREE.Mesh;

  constructor(tile: Tile) {
    this.tile = tile;

    const geometry = new THREE.CylinderGeometry(0.25, 0.35, 1.2, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x3355ff });
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.x = tile.mesh.position.x;
    this.mesh.position.y = 0.6;
    this.mesh.position.z = tile.mesh.position.z;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
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

    const tile: Tile = { row, col, walkable: true, occupied: false, mesh, material };
    grid[row][col]   = tile;
    mesh.userData['tile'] = tile;
  }
}

// ── Towers ────────────────────────────────────────────────────────────────────
const towers: Tower[] = [];

function placeTower(tile: Tile): void {
  if (!tile.walkable) return;
  const tower = new Tower(tile);
  scene.add(tower.mesh);
  tile.occupied = true;
  setTileColor(tile, 0x888888);
  towers.push(tower);
}

function removeTower(tile: Tile): void {
  const tower: Tower | undefined = towers.find(t => t.tile === tile);
  if (tower === undefined) return;
  tower.dispose(scene);
  const index: number = towers.indexOf(tower);
  towers.splice(index, 1);
  tile.occupied = false;
  setTileColor(tile, getTileBaseColor(tile));
}

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
  if (intersections.length === 0) return;

  const hitTile = intersections[0].object.userData['tile'] as Tile | undefined;
  if (hitTile === undefined) return;

  if (hitTile.occupied) {
    removeTower(hitTile);
  } else {
    placeTower(hitTile);
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

**1. What is the difference between a class and an instance?**
A class is the blueprint — the definition of what shape an object will have and what it can do. It exists once in code. An instance is a specific object built from that blueprint. You can have many instances of the same class — each is independent. In this lab, `Tower` is the class. `new Tower(tile)` creates one instance. You can place eight towers on the grid and have eight independent `Tower` instances, each with its own `tile` and `mesh`, all built from the same `Tower` class.

**2. What does a constructor do, and when does it run?**
The constructor initializes a new instance — it assigns values to all the instance's properties so the object is fully set up and ready to use by the time `new Tower(...)` returns. It runs exactly once per instance: the moment `new Tower(tile)` is called. Before the constructor runs, the instance has no properties. After it runs, `this.tile` and `this.mesh` are both assigned and the Tower is ready.

**3. To find the tower on a specific tile, what do you check?**
You check whether `tower.tile === tile` — whether the tower's tile property is the exact same tile object you are looking for. `Array.find()` does this search: it tests each tower with the condition and returns the first one where `t.tile === tile` is true. If no tower has that tile, `find` returns `undefined`.

---

*End of Lab 08.*

*Lab 09 introduces inheritance — a second tower type (`SniperTower`) that extends `Tower` with different geometry and range. This teaches the OOP hierarchy: base class, subclass, method overriding, and `super()`.*
