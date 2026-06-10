# TypeScript Tower Defense — LAB 09 — Inheritance

**Prerequisites:** Lab 08 complete. You can place and remove blue cylinder towers by clicking tiles.

**What this lab adds:**
- The `Tower` class becomes an abstract base class
- `BasicTower` and `SniperTower` extend it — each with different appearance and range
- Press `1` for basic towers, `2` for sniper towers
- String literal types and the `type` keyword
- `abstract` classes — a class you cannot directly instantiate

**Time:** 60–90 minutes.

---

## What You Will Build

Press `1` on the keyboard, then click tiles — short blue cylinders appear. Press `2`, then click tiles — tall grey towers appear. Both are stored in the same `towers` array. Both are removed the same way.

```
  Press 1: Basic Tower        Press 2: Sniper Tower
      ╻                             ┃
     ╺╋╸  (short, wide, blue)      ┃  (tall, narrow, grey)
      ╹                             ┃
   ───────                        ─────
```

The two tower types share all the placement, removal, and raycasting logic — because they are both `Tower`s. The only thing that differs is what they look like and how far they can shoot. That is the point of inheritance.

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 08, every tower used the same hardcoded geometry and color. What would happen to the code if you needed five tower types — would you copy the `Tower` class five times?
> 2. What do you think `extends` means in programming? What does it imply about the relationship between two classes?
> 3. The `Tower` class in Lab 08 could be created directly with `new Tower(tile)`. After this lab, you will not be able to do that. What do you think prevents it, and why might that be useful?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand Inheritance Before Touching Code

---

### Concept: Inheritance and `extends`

**What it is:** A way to create a new class based on an existing one. The new class (called the *subclass* or *child*) automatically gets everything the existing class (called the *superclass* or *parent*) has — all its properties and methods. The subclass can then add new things or change existing behavior.

**The relationship:** "A BasicTower IS A Tower. A SniperTower IS A Tower." Both share the common Tower behavior. Each adds its own specifics.

**The syntax:**
```ts
class BasicTower extends Tower {
  // BasicTower automatically has everything Tower has.
  // It can also add new properties and methods.
}
```

**What the subclass inherits:**
- All properties declared in the parent (`tile`, `mesh`, `range`)
- All methods on the parent (`dispose`)
- The parent constructor's logic — but the subclass must call it explicitly

**What the subclass must do:**
Provide its own constructor. And inside that constructor, call `super(...)` before anything else.

**Why inheritance here:**
Without it:
```ts
class BasicTower {
  readonly tile: Tile;
  readonly mesh: THREE.Mesh;
  readonly range: number;
  constructor(tile: Tile) { /* 30 lines of setup */ }
  dispose(scene: THREE.Scene): void { scene.remove(this.mesh); }
}

class SniperTower {
  readonly tile: Tile;   // same
  readonly mesh: THREE.Mesh;  // same
  readonly range: number;  // same
  constructor(tile: Tile) { /* same 30 lines, different 3 numbers */ }
  dispose(scene: THREE.Scene): void { scene.remove(this.mesh); } // same
}
```

With inheritance:
```ts
class BasicTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { /* the 3 numbers that differ */ });
  }
  // dispose() inherited from Tower — no need to repeat it
}
```

**You will see this again in:** Every game entity that shares behavior with a base type.

---

### Concept: `super()`

**What it is:** A call to the parent class's constructor. Inside a subclass constructor, `super(...)` must be called before anything else — before accessing `this`, before setting properties.

**Why it must be first:**
The parent constructor is responsible for setting up the properties declared in the parent (`tile`, `mesh`, `range`). Until `super()` runs, those properties do not exist. Accessing `this` before `super()` runs would mean accessing an incompletely constructed object — TypeScript prevents this.

**The syntax:**
```ts
class SniperTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { /* config values */ }); // MUST be first — sets up tile, mesh, range
    // only after super() can you access this.tile, this.mesh, etc.
  }
}
```

**What super receives:**
Whatever arguments the parent constructor expects. The parent `Tower` constructor takes `(tile: Tile, config: TowerConfig)`. So every subclass passes `super(tile, config)`.

**Watch for:** Forgetting `super()` is a TypeScript error: "Constructors for derived classes must contain a 'super' call." This is enforced — you cannot create a subclass instance without running the parent constructor.

---

### Concept: `abstract` Classes

**What it is:** A class marked with the `abstract` keyword that cannot be instantiated directly. You can only instantiate its concrete subclasses.

**The problem before:**
```ts
class Tower { ... }
const t = new Tower(tile, { ... }); // allowed — but undesirable
// "Tower" is meant to be a base — it should never appear on the board.
// A raw Tower has no identity — is it basic? sniper? something else?
```

**The solution:**
```ts
abstract class Tower { ... }
const t = new Tower(tile, { ... }); // ERROR: Cannot create an instance of an abstract class
const b = new BasicTower(tile);     // OK — BasicTower is concrete
```

`abstract` communicates intent clearly: "Tower" is the concept. "BasicTower" and "SniperTower" are the real things. Nobody should create a "generic tower."

**Watch for:** `abstract` classes can still have implemented methods (like `dispose`). Only methods marked `abstract` must be implemented by subclasses. In this lab, no methods are abstract — only the class itself is.

---

### Concept: The `TowerConfig` Interface

**What it is:** An object containing all the parameters that vary between tower types. Rather than having a parent constructor with six individual parameters, you group them into a single object.

**The problem before:**
```ts
constructor(tile: Tile, topRadius: number, bottomRadius: number, height: number, color: number, range: number)
// Which number is which? Easy to pass them in the wrong order.
```

**The solution:**
```ts
interface TowerConfig {
  topRadius:    number;
  bottomRadius: number;
  height:       number;
  color:        number;
  range:        number;
}

constructor(tile: Tile, config: TowerConfig)
// Each value is named. You cannot confuse them.
// Adding a new property to TowerConfig does not change the constructor signature.
```

**This pattern — a config object instead of many parameters — appears constantly in enterprise code.** React components, Three.js constructors, database clients, HTTP libraries — all accept config objects. Learning to recognize and write this pattern now pays off immediately in future labs.

**Watch for:** The interface `TowerConfig` is erased at runtime. It is only for TypeScript's type checking. The object literal `{ topRadius: 0.25, ... }` is the actual value passed at runtime.

---

## Step 2 — Refactor `Tower` Into an Abstract Base

Replace the Lab 08 `Tower` class entirely. The code below replaces the old class definition.

First, add the `TowerConfig` interface just above the `Tower` class:

```ts
// ── Tower Config Interface ────────────────────────────────────────────────────
// Groups all the values that differ between tower types.
// The abstract Tower constructor takes one of these instead of many parameters.
interface TowerConfig {
  topRadius:    number; // cylinder top radius in world units
  bottomRadius: number; // cylinder base radius in world units
  height:       number; // cylinder height in world units
  color:        number; // hex color for the material
  range:        number; // attack range in world units (not used visually yet)
}

// ── Tower Base Class ──────────────────────────────────────────────────────────
// abstract: cannot be instantiated directly. Always use BasicTower or SniperTower.
abstract class Tower {
  readonly tile:  Tile;
  readonly mesh:  THREE.Mesh;
  readonly range: number;

  constructor(tile: Tile, config: TowerConfig) {
    this.tile  = tile;
    this.range = config.range;

    const geometry = new THREE.CylinderGeometry(
      config.topRadius,
      config.bottomRadius,
      config.height,
      8 // radial segments — 8 looks round at game distances
    );
    const material = new THREE.MeshStandardMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, material);

    // Position the cylinder so its base sits on the tile surface.
    // CylinderGeometry is centered — shift up by half the height.
    this.mesh.position.x = tile.mesh.position.x;
    this.mesh.position.y = config.height / 2;
    this.mesh.position.z = tile.mesh.position.z;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}
```

---

### SAVE AND TRY

Save. The browser may show a TypeScript error: "Cannot create an instance of an abstract class" — because `placeTower` in Lab 08 called `new Tower(tile)`. That is expected. You will fix it in Step 3.

**In VS Code:**
Hover over `abstract class Tower`. The tooltip confirms the `abstract` modifier. Try typing `new Tower(grid[0][0], {...})` somewhere — VS Code immediately shows the error. Delete the test line.

---

## Step 3 — Add `BasicTower` and `SniperTower`

---

Add both subclasses immediately after the abstract `Tower` class:

```ts
// ── Concrete Tower Types ──────────────────────────────────────────────────────
// BasicTower: short, wide, blue. Short range.
class BasicTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius:    0.25,
      bottomRadius: 0.35,
      height:       1.2,
      color:        0x3355ff, // blue
      range:        1.5,      // attacks enemies within 1.5 units
    });
  }
}

// SniperTower: tall, narrow, grey. Long range.
class SniperTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius:    0.15,
      bottomRadius: 0.20,
      height:       2.2,
      color:        0x778899, // steel grey
      range:        3.5,      // attacks enemies within 3.5 units
    });
  }
}
```

---

### SAVE AND TRY

Save. Browser refreshes. No TypeScript errors yet — but `placeTower` still tries to call `new Tower(...)`, so the game is not working yet. You fix that in Step 4.

**In VS Code — try this:**
Type `new BasicTower(grid[0][0])` somewhere temporarily. VS Code is happy — `BasicTower` is a concrete class. Type `new Tower(grid[0][0], {...})` — VS Code shows the abstract error. Delete both test lines.

---

## Step 4 — Type Aliases and Keyboard Tower Selection

Before fixing `placeTower`, introduce the keyboard selection system.

---

### Concept: Type Aliases and String Literal Types

**What it is:** The `type` keyword creates a named alias for any type — including combinations of specific string values.

**The problem:**
```ts
let activeTowerType: string = 'basic';
activeTowerType = 'snipre'; // typo — TypeScript cannot catch this because the type is just 'string'
```

**The solution — a string literal union type:**
```ts
type TowerType = 'basic' | 'sniper';
//   ↑ creates a new type name
//                ↑ this specific string value
//                         ↑ or this one
//              ↑ a union — either value is valid

let activeTowerType: TowerType = 'basic';
activeTowerType = 'snipre'; // ERROR: Type '"snipre"' is not assignable to type 'TowerType'
activeTowerType = 'sniper'; // OK
```

**`type` vs `interface`:**

| | `interface` | `type` |
|---|---|---|
| Used for | Object shapes | Any type, including unions and primitives |
| Extensible? | Yes — can be merged | No — defined once |
| For object shapes | Preferred | Works but less conventional |
| For unions/literals | Cannot do this | The right tool |

`TowerType = 'basic' | 'sniper'` is a type that cannot be expressed as an interface. Use `type` for unions and literal values.

**Watch for:** String literal types become a key tool in later labs — game states (`'menu' | 'playing' | 'paused'`), tile types (`'grass' | 'path' | 'water'`), event names, command types. You will see this pattern constantly.

---

### Concept: Keyboard Events

**What it is:** Responding to key presses with an event listener on `window`.

```ts
window.addEventListener('keydown', (event: KeyboardEvent) => {
  console.log(event.key); // prints 'a', 'Enter', 'ArrowLeft', '1', etc.
});
```

**`event.key`** returns the key that was pressed as a string. For letter keys it is the character. For number keys it is the digit as a string (`'1'`, `'2'`). For special keys it is a name (`'Enter'`, `'Escape'`, `'ArrowUp'`).

**Why listen on `window` and not the canvas:**
Keyboard events are not tied to a specific element the way mouse events are. `window` captures all key presses in the browser tab. If you listened on the canvas element, it would only respond when the canvas has keyboard focus — which requires clicking it first.

---

Add the tower type state and keyboard listener. Place this after the towers array and before the drag detection:

```ts
// ── Active Tower Type ─────────────────────────────────────────────────────────
// Which tower type is placed when the player clicks a tile.
// Press 1 for basic, press 2 for sniper.
type TowerType = 'basic' | 'sniper';
let activeTowerType: TowerType = 'basic'; // default

window.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === '1') {
    activeTowerType = 'basic';
    console.log('Tower type: Basic (range 1.5)');
  }
  if (event.key === '2') {
    activeTowerType = 'sniper';
    console.log('Tower type: Sniper (range 3.5)');
  }
});
```

Now update `placeTower` to create the right type:

```ts
function placeTower(tile: Tile): void {
  if (!tile.walkable) return;

  // Create the correct tower type based on the player's current selection.
  const tower: Tower = activeTowerType === 'basic'
    ? new BasicTower(tile)
    : new SniperTower(tile);

  scene.add(tower.mesh);
  tile.occupied = true;
  setTileColor(tile, 0x555555); // darker grey for occupied tiles
  towers.push(tower);
}
```

---

### SAVE AND TRY

Save. Browser refreshes. The TypeScript error is gone.

**You should see:** The checkerboard grid. No towers initially.

**Click any tile.** A short blue cylinder (BasicTower) appears.

**Press `2`, then click another tile.** A tall grey cylinder (SniperTower) appears.

**Press `1`, then click another tile.** A short blue cylinder again.

**In the console:**
When you press `1` or `2`, the console prints which type is active and its range.

**Orbit the camera** to see both tower types from different angles — notice the height difference clearly.

**In the console:**
```js
towers[0] instanceof BasicTower
towers[0] instanceof SniperTower
```
**Expected:** `true` then `false` for the first tower (if it was a BasicTower), or vice versa.

---

## Step 5 — `instanceof` and Polymorphism

---

### Concept: `instanceof`

**What it is:** An operator that checks whether an object is an instance of a specific class (or any of its parent classes).

```ts
const tower: Tower = new SniperTower(tile);

tower instanceof Tower        // → true  (SniperTower extends Tower)
tower instanceof SniperTower  // → true  (it is a SniperTower)
tower instanceof BasicTower   // → false (it is not a BasicTower)
```

**Why `instanceof Tower` is true for a SniperTower:**
Because `SniperTower extends Tower`. Every `SniperTower` IS a `Tower`. The inheritance chain means `instanceof` checks up the chain. A `SniperTower` is simultaneously a `SniperTower`, a `Tower`, and an `Object`.

**Used for type narrowing:**
```ts
function inspectTower(tower: Tower): void {
  if (tower instanceof SniperTower) {
    // TypeScript now knows tower is a SniperTower inside this block
    console.log('Sniper range:', tower.range);
  }
}
```

**Watch for:** `instanceof` is a runtime check — it works in the browser console and in running code. TypeScript's type narrowing after `instanceof` is a compile-time benefit — TypeScript recognizes the narrower type inside the `if` block.

---

### Concept: Polymorphism

**What it is:** The ability to treat objects of different classes the same way because they share a common parent. Code written for the parent type works for all subclasses automatically.

**In this lab:**
```ts
const towers: Tower[] = [];
// This array holds Tower objects — which means it can hold BasicTower OR SniperTower.
// Both are Tower subclasses. The array does not care which specific type they are.

towers.push(new BasicTower(tile));  // OK — BasicTower is a Tower
towers.push(new SniperTower(tile)); // OK — SniperTower is a Tower

// removeTower works on any tower, regardless of type:
function removeTower(tile: Tile): void {
  const tower = towers.find(t => t.tile === tile); // finds BasicTower or SniperTower equally
  if (tower === undefined) return;
  tower.dispose(scene); // calls Tower.dispose — works on both types
}
```

**The value of polymorphism:**
`removeTower` was written before `SniperTower` existed. It works on `SniperTower` without modification — because `SniperTower` is a `Tower`, and `removeTower` only uses `Tower` methods. Adding a third tower type in Lab 11 will not require changing `removeTower` at all.

**You will see this again in:** Every system in the game that processes "all towers" or "all enemies" — the code loops over a `Tower[]` and each item responds correctly according to its actual type.

---

### SAVE AND TRY

Try this in the console after placing one of each tower type:

```js
towers.map(t => ({
  type:  t instanceof SniperTower ? 'Sniper' : 'Basic',
  range: t.range,
  row:   t.tile.row,
  col:   t.tile.col
}))
```

**Expected:** An array of objects describing each placed tower — type, range, and position. The `instanceof` check correctly identifies each one.

**Change something:** Remove all towers. Press `2`, place three towers. Check:
```js
towers.every(t => t instanceof SniperTower)
```
**Expected:** `true` — all towers are SniperTower instances. `Array.every()` returns `true` if all elements pass the test. Remove those towers and press `1` to switch back to basic.

---

## Challenge: Add a `CannonTower`

**You know:** `extends Tower`, `super(tile, config)`, `TowerConfig` properties.

**Task:** Add a third tower type — `CannonTower`. It should be:
- Medium height: `1.6` units tall
- Wide: `topRadius: 0.35`, `bottomRadius: 0.45`
- Dark orange color: `0xcc4400`
- Medium range: `2.2`

Assign it to key `3` in the keyboard handler. Test that pressing `3` then clicking places a wide orange tower.

**Starting code:**
```ts
// Add this after SniperTower:
class CannonTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      // fill in the config values
    });
  }
}
```

You also need to:
1. Add `'cannon'` to the `TowerType` union
2. Handle key `'3'` in the keyboard listener
3. Handle `'cannon'` in `placeTower`

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
class CannonTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius:    0.35,
      bottomRadius: 0.45,
      height:       1.6,
      color:        0xcc4400,
      range:        2.2,
    });
  }
}
```

```ts
type TowerType = 'basic' | 'sniper' | 'cannon'; // add 'cannon'
```

```ts
window.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === '1') { activeTowerType = 'basic';  console.log('Tower type: Basic');  }
  if (event.key === '2') { activeTowerType = 'sniper'; console.log('Tower type: Sniper'); }
  if (event.key === '3') { activeTowerType = 'cannon'; console.log('Tower type: Cannon'); } // add
});
```

```ts
function placeTower(tile: Tile): void {
  if (!tile.walkable) return;
  let tower: Tower;
  if (activeTowerType === 'basic')  tower = new BasicTower(tile);
  else if (activeTowerType === 'sniper') tower = new SniperTower(tile);
  else tower = new CannonTower(tile);
  scene.add(tower.mesh);
  tile.occupied = true;
  setTileColor(tile, 0x555555);
  towers.push(tower);
}
```

**Key insight:** Adding the third tower type required zero changes to `removeTower`, to the raycasting system, to the game loop, or to the grid. Only the places that specifically mention tower type needed updating — the `type` alias, the keyboard handler, and `placeTower`. Everything else worked automatically because of polymorphism. This is the payoff of inheritance: adding new types costs only the new code.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `Tower` is abstract | `new Tower(tile, {...})` in VS Code shows an error |
| `BasicTower` places correctly | Press `1`, click a tile — short blue cylinder appears |
| `SniperTower` places correctly | Press `2`, click a tile — tall grey cylinder appears |
| Removal works on both types | Click any tower tile — it is removed regardless of type |
| `instanceof` identifies types | `towers[0] instanceof BasicTower` returns correct boolean |
| `towers` array holds both types | Place both types, check `towers.length` |
| `TowerType` prevents typos | Try assigning `activeTowerType = 'cannnn'` in VS Code — error |
| Orbit and drag still work | Drag rotates camera, click places towers |

---

## Your Complete `src/main.ts`

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface GameConfig {
  canvasWidth:  number;
  canvasHeight: number;
  cameraFov:    number;
  cameraNear:   number;
  cameraFar:    number;
}

interface Tile {
  row:      number;
  col:      number;
  walkable: boolean;
  occupied: boolean;
  mesh:     THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}

interface TowerConfig {
  topRadius:    number;
  bottomRadius: number;
  height:       number;
  color:        number;
  range:        number;
}

function setTileColor(tile: Tile, color: number): void {
  tile.material.color.setHex(color);
}

function getTileBaseColor(tile: Tile): number {
  return (tile.row + tile.col) % 2 === 0 ? 0x2d5a27 : 0x4a8f3f;
}

abstract class Tower {
  readonly tile:  Tile;
  readonly mesh:  THREE.Mesh;
  readonly range: number;

  constructor(tile: Tile, config: TowerConfig) {
    this.tile  = tile;
    this.range = config.range;
    const geometry = new THREE.CylinderGeometry(config.topRadius, config.bottomRadius, config.height, 8);
    const material = new THREE.MeshStandardMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.x = tile.mesh.position.x;
    this.mesh.position.y = config.height / 2;
    this.mesh.position.z = tile.mesh.position.z;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

class BasicTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.25, bottomRadius: 0.35, height: 1.2, color: 0x3355ff, range: 1.5 });
  }
}

class SniperTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.15, bottomRadius: 0.20, height: 2.2, color: 0x778899, range: 3.5 });
  }
}

const CONFIG: GameConfig = {
  canvasWidth: 800, canvasHeight: 600, cameraFov: 60, cameraNear: 0.1, cameraFar: 100,
};

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(CONFIG.canvasWidth, CONFIG.canvasHeight);
document.body.appendChild(renderer.domElement);

const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
  CONFIG.cameraFov, CONFIG.canvasWidth / CONFIG.canvasHeight, CONFIG.cameraNear, CONFIG.cameraFar
);
camera.position.set(0, 10, 8);

const controls: OrbitControls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true; controls.dampingFactor = 0.05;
controls.minDistance = 3;     controls.maxDistance = 25;
controls.minPolarAngle = Math.PI / 6; controls.maxPolarAngle = Math.PI / 2.5;
controls.update();

const sunLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7);
scene.add(sunLight);
const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const GRID_COLS: number = 8;
const GRID_ROWS: number = 8;
const TILE_SIZE: number = 1;
const GRID_OFFSET_X: number = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const GRID_OFFSET_Z: number = -(GRID_ROWS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const TILE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(TILE_SIZE - 0.05, TILE_SIZE - 0.05);

const grid: Tile[][] = [];
for (let row = 0; row < GRID_ROWS; row++) {
  grid[row] = [];
  for (let col = 0; col < GRID_COLS; col++) {
    const isDarkTile = (row + col) % 2 === 0;
    const material = new THREE.MeshStandardMaterial({ color: isDarkTile ? 0x2d5a27 : 0x4a8f3f });
    const mesh = new THREE.Mesh(TILE_GEOMETRY, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(col * TILE_SIZE + GRID_OFFSET_X, 0, row * TILE_SIZE + GRID_OFFSET_Z);
    scene.add(mesh);
    const tile: Tile = { row, col, walkable: true, occupied: false, mesh, material };
    grid[row][col] = tile;
    mesh.userData['tile'] = tile;
  }
}

const towers: Tower[] = [];

function placeTower(tile: Tile): void {
  if (!tile.walkable) return;
  const tower: Tower = activeTowerType === 'basic' ? new BasicTower(tile) : new SniperTower(tile);
  scene.add(tower.mesh);
  tile.occupied = true;
  setTileColor(tile, 0x555555);
  towers.push(tower);
}

function removeTower(tile: Tile): void {
  const tower = towers.find(t => t.tile === tile);
  if (tower === undefined) return;
  tower.dispose(scene);
  towers.splice(towers.indexOf(tower), 1);
  tile.occupied = false;
  setTileColor(tile, getTileBaseColor(tile));
}

type TowerType = 'basic' | 'sniper';
let activeTowerType: TowerType = 'basic';

window.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === '1') { activeTowerType = 'basic';  console.log('Tower type: Basic');  }
  if (event.key === '2') { activeTowerType = 'sniper'; console.log('Tower type: Sniper'); }
});

const DRAG_THRESHOLD_PX = 5;
let mouseDownX = 0;
let mouseDownY = 0;

renderer.domElement.addEventListener('mousedown', (event: MouseEvent) => {
  mouseDownX = event.clientX;
  mouseDownY = event.clientY;
});

const raycaster = new THREE.Raycaster();

renderer.domElement.addEventListener('click', (event: MouseEvent) => {
  const dx = event.clientX - mouseDownX;
  const dy = event.clientY - mouseDownY;
  if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const ndcX = ((event.clientX - rect.left) / rect.width)  *  2 - 1;
  const ndcY = ((event.clientY - rect.top)  / rect.height) * -2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
  const hits = raycaster.intersectObjects(scene.children);
  if (hits.length === 0) return;

  const hitTile = hits[0].object.userData['tile'] as Tile | undefined;
  if (hitTile === undefined) return;

  if (hitTile.occupied) {
    removeTower(hitTile);
  } else {
    placeTower(hitTile);
  }
});

const clock = new THREE.Clock();

function update(_deltaTime: number): void {
  controls.update();
}

function render(): void {
  renderer.render(scene, camera);
}

function animate(): void {
  const rawDelta = clock.getDelta();
  const deltaTime = Math.min(rawDelta, 0.1);
  requestAnimationFrame(animate);
  update(deltaTime);
  render();
}

animate();
```

---

## Quick Check Answers

**1. What would happen without inheritance if you needed five tower types?**
You would copy the `Tower` class five times. Each copy would have the same `tile`, `mesh`, `range` properties — declared five times. The same `dispose` method — written five times. If you needed to fix a bug in `dispose`, you would fix it in five places and risk missing one. Inheritance solves this: the shared code lives in `Tower` once. Each subclass only declares what makes it different.

**2. What does `extends` imply about the relationship?**
It implies an "IS A" relationship. `BasicTower extends Tower` means every `BasicTower` IS A `Tower`. It has everything a `Tower` has, plus potentially more. This is the defining rule of inheritance — the subclass is a more specific version of the parent. If something is not genuinely "a more specific kind of Tower," it should not extend Tower — it should have a Tower as a property instead.

**3. What prevents direct instantiation after `abstract`, and why is that useful?**
The `abstract` keyword. TypeScript enforces it at compile time: `new Tower(...)` is a type error. It is useful because `Tower` represents a concept — it has no specific appearance, range, or identity. Only concrete tower types belong on the board. `abstract` makes this intent explicit and enforces it automatically, preventing a class of bugs where "raw Tower" objects appear on the board by accident.

---

*End of Lab 09.*

*Lab 10 introduces the Observer pattern — a formal event system. When towers are placed or removed, the game emits events. A HUD display listens for those events and shows a live tower count on screen.*
