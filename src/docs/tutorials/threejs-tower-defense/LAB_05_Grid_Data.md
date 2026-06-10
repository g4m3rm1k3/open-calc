# TypeScript Tower Defense — LAB 05 — Grid Data

**Prerequisites:** Lab 04 complete. You have an 8×8 checkerboard grid of tiles, a working game loop, and a camera looking down at an angle.

**What this lab adds:**
- A `Tile` interface — a typed data object for each tile
- A 2D array (`Tile[][]`) that stores every tile so you can read and write them by position
- The ability to change any tile's appearance by accessing `grid[row][col]`

**Time:** 45–60 minutes.

---

## What You Will Build

The grid looks the same as Lab 04 — same camera, same checkerboard. But one tile will be visually different: the tile at `grid[3][3]` is highlighted yellow. You produce that result by writing one line of code *after* the loop, not by changing the loop itself. This proves the grid data structure is working.

```
     ┌──┬──┬──┬──┬──┬──┬──┬──┐
     │  │  │  │  │  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │  │  │  │  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │  │  │  │  │  │  │  │
     ├──┼──┼──┼──┼──┼──┼──┼──┤
     │  │  │  │ Y│  │  │  │  │   ← grid[3][3] is yellow
     └──┴──┴──┴──┴──┴──┴──┴──┘
```

The yellow tile was not created differently — it was changed after the loop by reading `grid[3][3]` and calling `setHex` on its material. That is the goal of this lab.

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 04, 64 tile meshes were created inside the loop and added to the scene. After the loop, can you access any individual tile? Why or why not?
> 2. An array stores items in a numbered list. A grid has rows and columns. How would you represent a grid using only arrays?
> 3. If `grid` is a 2D array, how would you access the tile in row 3, column 5?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Define the `Tile` Interface

Before changing the loop, define what a tile *is* as a data type.

---

### Concept: Arrays

**What it is:** A list of values stored in order, accessed by index (position number). The first item is at index `0`, the second at `1`, and so on.

**The syntax:**
```ts
const scores: number[] = [10, 20, 30];
//                        ↑   ↑   ↑
//              index:    0   1   2

scores[0]  // → 10
scores[1]  // → 20
scores[2]  // → 30
scores[3]  // → undefined — there is no item at index 3
```

**The type `number[]` means "an array of numbers."** For an array of strings: `string[]`. For an array of tiles: `Tile[]`.

**Creating an empty array:**
```ts
const scores: number[] = []; // empty — length is 0
scores.push(10);              // add to the end — length is now 1
scores.push(20);              // length is now 2
scores[0]                     // → 10
```

**`array.length`:** The number of items currently in the array.

**Watch for:** Array indices start at `0`, not `1`. An array with 8 items has indices `0` through `7`. Accessing index `8` returns `undefined`, not an error.

---

### Concept: 2D Arrays

**What it is:** An array where every element is itself another array. Used to represent grids, tables, and matrices.

**The type notation `Tile[][]` means "an array of arrays of Tiles":**
```ts
const grid: Tile[][] = [];
//    ↑ outer array (rows)
//              ↑ inner arrays (columns within each row)
```

**Building a 2D array:**
```ts
const grid: number[][] = [];

grid[0] = [];       // row 0 is an empty array
grid[0][0] = 10;    // row 0, column 0 = 10
grid[0][1] = 20;    // row 0, column 1 = 20

grid[1] = [];
grid[1][0] = 30;    // row 1, column 0 = 30

grid[0][0] // → 10
grid[1][0] // → 30
```

**The mental model — a grid on paper:**
```
          col 0   col 1   col 2
row 0: [   10,     20,     30   ]
row 1: [   30,     40,     50   ]
row 2: [   60,     70,     80   ]

grid[1][2] → 50  (row 1, column 2)
```

**Why it matters here:** Every tile in the game needs a grid address. When an enemy walks to row 3, column 5 — you look up `grid[3][5]` to check if that tile is walkable. When the player clicks on a tile to place a tower, you find the tile by its row and column. Without a 2D array, you would have no way to look up a tile by position.

**Watch for:** The convention in this series is `grid[row][col]` — outer index is row, inner index is column. This matches how you think about a grid (row first, then column), but you must be consistent. If you flip it, looking up `grid[col][row]` produces the wrong tile.

---

### Concept: The `Tile` Interface — Data and Visual Together

**What it is:** A typed object that represents one tile in the game grid. It stores both the tile's *data* (row, column, whether enemies can walk on it) and a *reference* to its visual representation (the Three.js mesh and material).

**Why store both together:**
In Lab 04, the mesh was created and immediately added to the scene — no reference was kept. After the loop finished, there was no way to find "the mesh at row 3, column 5." You would have to search through `scene.children` and hope you could identify it.

By storing `{ row, col, walkable, mesh, material }` together as one object, you can look up a tile by position and immediately access both its game properties and its visual object. One lookup gives you everything.

**The interface:**
```ts
interface Tile {
  row:      number;                      // grid row (0 = back row)
  col:      number;                      // grid column (0 = left column)
  walkable: boolean;                     // can enemies walk here?
  mesh:     THREE.Mesh;                  // the 3D object in the scene
  material: THREE.MeshStandardMaterial; // stored separately for easy color access
}
```

**Why store `material` separately:**
`mesh.material` is typed as `THREE.Material | THREE.Material[]` — a union of all possible material types. Accessing `.color` on that type requires a type cast. Storing a typed reference to the exact material avoids the cast every time you want to change the color.

**The Mental Model: Entity**

This is the first time a game concept and its visual representation are stored together as one object. This is the **Entity** pattern.

**Official name:** Entity (or Game Object in some engines)

**Why it exists:** Games are collections of things — tiles, towers, enemies, bullets. Each thing has data (health, position, type) and appearance (a 3D mesh). Keeping them together means "get the tile" gives you everything about that tile. You do not maintain a separate list of data and a separate list of meshes and try to keep them in sync.

**In this lab:** A `Tile` is an entity — it holds its data and its visual object together. In later labs, `Tower` and `Enemy` will follow the same pattern.

**You will see this again in:** Lab 08 (Tower entity), Lab 09 (Enemy entity), and every entity in the game.

**Watch for:** The entity pattern is NOT the Entity-Component System (ECS) pattern used in large game engines like Unity. Here, each entity type has its own interface with the properties it needs. The full ECS is introduced later.

---

Add the `Tile` interface to `src/main.ts`, immediately after the `GameConfig` interface:

```ts
// ── Tile Interface ────────────────────────────────────────────────────────────
// One tile in the game grid. Holds both game data and its visual representation.
interface Tile {
  row:      number;
  col:      number;
  walkable: boolean;
  mesh:     THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}
```

---

### SAVE AND TRY

Save. The browser refreshes. The grid looks the same — the interface produces no visual output.

**In VS Code — try this:**
Somewhere below the interface, type `const test: Tile = {` and pause. VS Code shows autocomplete with all five required properties — `row`, `col`, `walkable`, `mesh`, `material`. This is the interface working.

Delete the test line (do not save it) — it was just a demonstration.

**Try a type error:**
Type this temporarily:
```ts
const test: Tile = { row: 0, col: 0, walkable: 'yes', mesh: null, material: null };
```

VS Code underlines `'yes'` — `boolean` expected, `string` provided. And underlines both `null` values — Three.js objects expected. Delete this line before continuing.

---

## Step 2 — Create the Empty Grid Array

Declare the `grid` variable before the loop. The loop will fill it.

---

### Concept: Declaring a Variable Before Assigning It

**What it is:** Separating the declaration (`const grid: Tile[][] = []`) from the work of filling it (done inside the loop). This lets other code below the loop read from `grid` — functions, event handlers, anything that runs after setup.

**The problem with declaring inside a loop:**
```ts
for (let row = 0; row < GRID_ROWS; row++) {
  for (let col = 0; col < GRID_COLS; col++) {
    const tile: Tile = { ... }; // ← exists only inside this block
  }
}

grid[3][3].walkable; // ← ERROR: grid does not exist here
```

**The solution:**
```ts
const grid: Tile[][] = []; // ← declared outside — exists everywhere below this line

for (let row = 0; row < GRID_ROWS; row++) {
  grid[row] = [];           // ← initialize each row as an empty array
  for (let col = 0; col < GRID_COLS; col++) {
    // build tile, store at grid[row][col]
  }
}

grid[3][3].walkable; // ← works — grid is filled and accessible
```

**`const` on an array:**
`const` means you cannot *reassign* the variable — `grid = []` a second time would be an error. But you *can* modify the array's contents — pushing items, setting `grid[row]`, etc. `const` locks the binding, not the array itself.

**Watch for:** Always initialize each row with `grid[row] = []` before setting `grid[row][col]`. Without this, `grid[row]` is `undefined` and `grid[row][col] = tile` will throw an error.

---

Add the grid declaration to `main.ts`, just before the grid constants:

```ts
// ── Grid Data ─────────────────────────────────────────────────────────────────
// Declared here so any code below the loop can access tiles by position.
const grid: Tile[][] = [];
```

---

### SAVE AND TRY

Save. Browser refreshes. Grid looks the same.

**In the console:**
```js
grid.length
```
**Expected:** `0` — the array exists but is empty. The loop has not run yet (it runs at page load, so by the time you open the console it has run — but the important point is the variable exists and is accessible). Actually after page load the loop has run, so it will show the filled count. Let's check after filling it in the next step.

---

## Step 3 — Fill the Grid in the Loop

Now rewrite the loop to create `Tile` objects and store them in `grid`.

---

### Concept: Shorthand Property Syntax

**What it is:** When an object property name matches the variable name you are assigning from, you can write the name once instead of twice.

**The long form:**
```ts
const row = 3;
const col = 5;
const tile = { row: row, col: col }; // property name : variable name
```

**The shorthand:**
```ts
const row = 3;
const col = 5;
const tile = { row, col }; // same result — TypeScript infers { row: row, col: col }
```

**Rules:** Only works when the property name and the variable name are identical. `{ row }` is shorthand for `{ row: row }`. If the property should have a different value, you must use the long form: `{ row: row + 1 }`.

**Why it matters:** You will see this shorthand constantly in TypeScript and JavaScript codebases. It is not a trick — it is standard syntax. Understanding it makes code easier to read.

---

Replace the existing loop section in `main.ts`. The loop now creates `Tile` objects and stores them in `grid`:

```ts
// ── Grid ──────────────────────────────────────────────────────────────────────
for (let row = 0; row < GRID_ROWS; row++) {
  grid[row] = []; // initialize this row as an empty array before filling it

  for (let col = 0; col < GRID_COLS; col++) {
    const isDarkTile: boolean = (row + col) % 2 === 0;
    const tileColor: number   = isDarkTile ? 0x2d5a27 : 0x4a8f3f;

    // Create the material first so we can store a typed reference in the Tile.
    const material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: tileColor,
    });

    const mesh: THREE.Mesh = new THREE.Mesh(TILE_GEOMETRY, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.x = col * TILE_SIZE + GRID_OFFSET_X;
    mesh.position.y = 0;
    mesh.position.z = row * TILE_SIZE + GRID_OFFSET_Z;
    scene.add(mesh);

    // Build the Tile object — data + visual reference together.
    const tile: Tile = {
      row,              // shorthand for row: row
      col,              // shorthand for col: col
      walkable: true,   // all tiles start walkable
      mesh,             // shorthand for mesh: mesh
      material,         // shorthand for material: material
    };

    grid[row][col] = tile; // store in the 2D array
  }
}
```

---

### SAVE AND TRY

Save. Browser refreshes. Grid looks the same.

**In the console:**
```js
grid.length
```
**Expected:** `8` — 8 rows.

```js
grid[0].length
```
**Expected:** `8` — 8 columns in row 0.

```js
grid[0][0]
```
**Expected:** An object with `row: 0`, `col: 0`, `walkable: true`, and references to the mesh and material.

```js
grid[3][5].row
grid[3][5].col
grid[3][5].walkable
```
**Expected:** `3`, `5`, `true` — the tile at row 3, column 5.

**Change something:** In the console, type:
```js
grid[3][5].walkable = false
grid[3][5].walkable
```
**Expected:** `false`. You just changed a tile's game data from the console. The tile looks the same visually (we have not wired appearance to data yet) but the data changed. This is the foundation for tower placement and pathfinding.

---

## Challenge: Count the Walkable Tiles

**You know:** `grid` is a `Tile[][]` — you can loop over it with nested `for` loops. Each `Tile` has a `walkable: boolean` property.

**Task:** Write code in the console (not in the file — just type it into the console) that counts how many tiles currently have `walkable === true`. The answer should be `64` before any tiles are made non-walkable.

**Starting point:**
```js
// Type this in the browser console:
let count = 0;
// your loops and check here
console.log(count);
```

**Hint:** You already know how to write nested `for` loops and access `grid[row][col]`.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
let count = 0;
for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[row].length; col++) {
    if (grid[row][col].walkable === true) {
      count++;
    }
  }
}
console.log(count); // → 64
```

**Key insight:** `grid.length` and `grid[row].length` are used instead of the constants `GRID_ROWS` and `GRID_COLS`. This is intentional — code that reads the actual array dimensions cannot go wrong if the grid size changes. Hard-coding `8` would break if you later change the grid to 10×10. Always iterate over the actual length of the array, not a constant you think matches it.

</details>

---

## Step 4 — Change a Tile's Appearance via the Grid

Now prove the grid works: change a specific tile's color *after* the loop, by looking it up in `grid`.

---

### Concept: `color.setHex()`

**What it is:** A method on Three.js `Color` objects that changes the color to a new hexadecimal value.

**The problem:**
You cannot write `material.color = 0xff0000`. `material.color` is a `THREE.Color` object, not a number. Assigning a number to it would replace the object with a number — TypeScript prevents this.

**The solution:**
```ts
material.color.setHex(0xff0000); // changes the color to red
```

`setHex` takes a hex number and updates the Color object in place. Three.js picks up the change on the next render frame.

**You can also set it from a string:**
```ts
material.color.set('#ff0000');   // from CSS hex string
material.color.set('red');       // from CSS color name
material.color.setHex(0xff0000); // from hex number — most common in this series
```

**Why it matters here:** Every time a tile's state changes (selected, blocked, hovered) you update its material color with `setHex`. No need to create a new material — you modify the existing one.

**Watch for:** If you have multiple meshes sharing the same material, `setHex` changes the color for all of them. In the grid, each tile has its own material (created inside the loop) so this is not a concern. If geometry is shared (one `TILE_GEOMETRY` used by all tiles), that is fine — geometry sharing is safe.

---

Add this block after the loop, before the clock:

```ts
// ── Highlight One Tile ────────────────────────────────────────────────────────
// Access grid[3][3] and change its color.
// This proves the data structure works — the tile was not created differently,
// it was changed after the fact by looking it up in the grid.
const highlightedTile: Tile = grid[3][3];
highlightedTile.material.color.setHex(0xffff00); // yellow
```

---

### SAVE AND TRY

Save. Browser refreshes.

**You should see:** The checkerboard grid with one yellow tile at position row 3, column 3.

**In the console:**
```js
grid[3][3].material.color
```
**Expected:** A `THREE.Color` object. Expand it — you will see `r`, `g`, `b` values in the 0–1 range. Yellow is `{r: 1, g: 1, b: 0}`.

**Change something:** Change `grid[3][3]` to `grid[0][0]`. Save. The yellow tile moves to the top-left corner of the grid. Change it back to `grid[3][3]`.

---

## Challenge: Mark a Column as Non-Walkable

**You know:** `grid[row][col]` accesses any tile. `tile.walkable` is a boolean. `tile.material.color.setHex()` changes color. A `for` loop repeats code.

**Task:** After the grid loop, write code that:
1. Sets `walkable = false` on every tile in column 4 (all 8 rows)
2. Changes those tiles' color to brown (`0x8B4513`)

After this change, the grid should show a brown vertical stripe down column 4.

**Starting code:**
```ts
// After the loop:
// your code here — loop through rows, access grid[row][4]
```

**Hint:** You need only one `for` loop (over rows) since the column is fixed at `4`.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
for (let row = 0; row < GRID_ROWS; row++) {
  const tile: Tile = grid[row][4];
  tile.walkable = false;
  tile.material.color.setHex(0x8B4513);
}
```

**Key insight:** You changed 8 tiles with 3 lines of logic. Without the 2D array, you would have no way to find "the tile at column 4, any row" — you would have to search through all 64 meshes in `scene.children` and guess which ones were in column 4. The grid array makes position-based access trivial and fast.

Remove this code after verifying — the final state for this lab is just the single yellow tile at `grid[3][3]`.

</details>

---

## Step 5 — Add a `setTileColor` Function

The pattern `tile.material.color.setHex(value)` will be used constantly. Wrapping it in a named function makes the intent clear at each call site and gives you one place to change the behavior later.

---

### Concept: Pure Functions

**What it is:** A function whose output depends only on its inputs and that produces no side effects other than what it describes.

**Not quite pure (but close enough for now):**
```ts
function setTileColor(tile: Tile, color: number): void {
  tile.material.color.setHex(color); // side effect: mutates the tile's material
}
```

**Why name it anyway:**
Reading `setTileColor(tile, 0xff8800)` is clearer than `tile.material.color.setHex(0xff8800)`. The function name describes *intent* — set the visual color of a tile — rather than the mechanism.

**Function signatures:**
```ts
function setTileColor(
  tile:  Tile,   // the tile to change — must be a Tile
  color: number  // the new color — must be a number (hex)
): void {        // returns nothing
  tile.material.color.setHex(color);
}
```

**Why it matters here:** `setTileColor` will be called from many places — event handlers, the path renderer, tower placement. If you ever need to add a tween animation when a tile changes color, you change it in one function instead of hunting through every call site.

---

Add this function to `main.ts`, just after the `Tile` interface:

```ts
// ── Helpers ───────────────────────────────────────────────────────────────────
function setTileColor(tile: Tile, color: number): void {
  tile.material.color.setHex(color);
}
```

Update the highlight code to use it:

```ts
const highlightedTile: Tile = grid[3][3];
setTileColor(highlightedTile, 0xffff00); // ← cleaner than calling setHex directly
```

---

### SAVE AND TRY

Save. Browser refreshes. Yellow tile at `grid[3][3]`.

**In VS Code — hover over `setTileColor`:**
The tooltip shows the full function signature:
```
function setTileColor(tile: Tile, color: number): void
```

TypeScript documents the function for you from the signature.

**Try a type error:**
Call `setTileColor(grid[3][3], 'yellow')`. VS Code underlines `'yellow'` — `number` expected, `string` provided. The function's type annotation protects every call site.

Remove the type error line before continuing.

---

## Final Check

| Feature | How to verify |
|---|---|
| `Tile` interface defined | VS Code autocompletes `row`, `col`, `walkable`, `mesh`, `material` after `tile.` |
| `grid` is a `Tile[][]` | `grid.length` in console returns `8` |
| Each row has 8 tiles | `grid[0].length` in console returns `8` |
| Tiles store correct position | `grid[3][5].row` = `3`, `grid[3][5].col` = `5` |
| Tiles start walkable | `grid[0][0].walkable` returns `true` |
| `setTileColor` changes color | `grid[3][3]` appears yellow on screen |
| `setTileColor` is typed | Passing a string instead of number shows a TS error in VS Code |

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
    grid[row][col] = tile;
  }
}

// ── Highlight One Tile ────────────────────────────────────────────────────────
setTileColor(grid[3][3], 0xffff00);

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

**1. In Lab 04, can you access any individual tile after the loop? Why or why not?**
No. Each tile's `mesh` variable was declared inside the inner `for` loop with `const tile = new THREE.Mesh(...)`. In JavaScript and TypeScript, `const` and `let` variables declared inside a block `{ }` only exist within that block. Once the loop iteration ends, the variable goes out of scope and is inaccessible. The mesh still exists in `scene.children` — Three.js holds a reference to it — but you have no named way to find "the mesh at row 3, column 5."

**2. How would you represent a grid using only arrays?**
An array of arrays. The outer array holds rows. Each row is an inner array holding the items in that row. `grid[0]` is row 0. `grid[0][3]` is the item at row 0, column 3. This is a 2D array — TypeScript writes the type as `ItemType[][]` (array of arrays of items).

**3. How would you access the tile at row 3, column 5?**
`grid[3][5]` — outer index is the row, inner index is the column. `grid[3]` gives you an array representing row 3. `grid[3][5]` gives you the sixth item in that row (index 5 = sixth item, since indices start at 0).

---

*End of Lab 05.*

*Lab 06 adds mouse click detection — click any tile to highlight it. This uses Three.js raycasting, which is the same technique CAD applications use to select geometry with the mouse.*
