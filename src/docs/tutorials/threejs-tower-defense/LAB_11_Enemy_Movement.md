# TypeScript Tower Defense — LAB 11 — Enemy Movement

**Prerequisites:** Lab 10 complete. You have a live HUD, two tower types selectable by keyboard, and a full event system.

**What this lab adds:**
- A fixed path across the grid — enemies walk this route
- Path tiles visually marked; towers cannot be placed on them
- The `Enemy` class — a sphere that follows the path using delta time
- Direction vector math: turning a "where do I need to go?" into "how do I move there?"
- The backwards loop pattern for safe array removal
- A lives system — enemies that reach the exit cost lives

**Time:** 60–90 minutes.

---

## What You Will Build

A brown dirt path winds across the grid. Press `Space` to spawn an enemy — a red sphere that enters from the left and walks the path tile by tile toward the exit on the right. Each enemy that reaches the exit costs one life. The HUD tracks both tower count and remaining lives.

```
Col:  0 1 2 3 4 5 6 7
Row 0: . . . . . . . .
Row 1: P P P . . . . .   ← enemy enters here (col 0)
Row 2: . . P . . . . .
Row 3: . . P . . . . .
Row 4: . . P P P P . .
Row 5: . . . . . P . .
Row 6: . . . . . P P P   ← enemy exits here (col 7)
Row 7: . . . . . . . .

P = path tile   . = tower tile
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 04 you positioned tiles using `GRID_OFFSET_X + col * TILE_SIZE`. An enemy on the grid needs a world position too — how would you convert a `{ row, col }` into an `x` and `z` coordinate?
> 2. If an enemy is at position `(2.0, 5.0)` and its target waypoint is at `(5.0, 5.0)`, what direction should it move? What if the target was at `(5.0, 9.0)` instead?
> 3. The `towers` array uses `splice` to remove a tower. What problem arises if you loop forwards through an array with `for (let i = 0; i < arr.length; i++)` and call `splice` inside the loop?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand Movement Before Touching Code

---

### Concept: `SphereGeometry`

You have used `PlaneGeometry` (flat tile), `CylinderGeometry` (tower), and `BoxGeometry` (cube from Lab 01). A sphere uses `SphereGeometry`:

```ts
new THREE.SphereGeometry(radius, widthSegments, heightSegments)
```

- `radius` — how large the sphere is. `0.3` gives a sphere 0.6 units in diameter — small enough to fit on a tile.
- `widthSegments` — how many vertical slices. More segments = smoother but heavier. `12` is fine for a small game object.
- `heightSegments` — how many horizontal slices. `8` is fine.

```ts
const geometry = new THREE.SphereGeometry(0.3, 12, 8);
const material = new THREE.MeshStandardMaterial({ color: 0xff3333 });
const mesh = new THREE.Mesh(geometry, material);
```

---

### Concept: Waypoints and Path-Following

A **waypoint** is a destination point in world space. Path-following means: "move toward the current waypoint; when you arrive, advance to the next one; when there are no more, you are done."

```
Start ──► Waypoint 0 ──► Waypoint 1 ──► Waypoint 2 ──► Exit
```

The enemy tracks `waypointIndex` — an integer that starts at `0` and increments each time the enemy arrives at a waypoint. When `waypointIndex >= path.length`, the enemy has completed the path.

This requires two decisions on each frame:
1. **Have I arrived?** — Am I close enough to the current waypoint to call it "reached"?
2. **Which direction should I move?** — Based on where the current waypoint is.

---

### Concept: Direction Vectors — Turning "Where to Go" Into "How to Move"

Suppose an enemy is at position `(1.0, 3.5)` (x, z) and its target waypoint is at `(4.0, 3.5)`. You want to move toward the target at a fixed speed regardless of how far away it is.

**Step 1 — Find the difference (the vector from current to target):**
```
dx = target.x - current.x = 4.0 - 1.0 = 3.0
dz = target.z - current.z = 3.5 - 3.5 = 0.0
```

This vector `(3.0, 0.0)` points in the right direction, but its length (distance) is 3.0. If you moved by this vector each frame, movement speed would depend on distance — far away means fast, close means slow. That is wrong.

**Step 2 — Find the distance (the length of that vector):**
```
distance = √(dx² + dz²) = √(9.0 + 0.0) = 3.0
```

**Step 3 — Normalize (divide by distance to get a unit vector of length 1):**
```
nx = dx / distance = 3.0 / 3.0 = 1.0
nz = dz / distance = 0.0 / 3.0 = 0.0
```

Now `(nx, nz)` has length exactly 1. It points in the right direction, but its magnitude does not depend on how far away the target is.

**Step 4 — Scale by speed and delta time:**
```
moveX = nx * speed * deltaTime
moveZ = nz * speed * deltaTime
```

This gives frame-rate-independent movement at a consistent speed regardless of distance.

**What "normalizing" means:** Dividing a vector by its own length to make it exactly length 1. A vector of length 1 is called a **unit vector** or **normalized vector**. It encodes only direction, not magnitude.

---

### Concept: Distance Checking for Arrival

How do you know when an enemy has "arrived" at a waypoint? You check the distance:

```ts
const distance = Math.sqrt(dx * dx + dz * dz);
if (distance < ARRIVAL_THRESHOLD) {
  waypointIndex++;  // advance to the next waypoint
}
```

`ARRIVAL_THRESHOLD` is a small value like `0.05`. Using exact equality (`distance === 0`) would almost never trigger, because floating-point movement steps will almost never land exactly on the target. A small threshold is the standard approach.

**Important:** Check arrival *before* moving. If the enemy overshoots a waypoint in one frame (rare at normal speeds but possible with large delta times), the threshold catches it on the next frame.

---

### Concept: The Backwards Loop — Safe Array Removal

When you need to remove elements from an array while iterating it, iterating *backwards* is the safest approach.

**The problem with a forwards loop:**
```ts
// WRONG — items shift when you splice
for (let i = 0; i < enemies.length; i++) {
  if (enemies[i].done) {
    enemies.splice(i, 1); // removes item at i
    // now what was at i+1 is at i
    // the loop increments i anyway — you skip one item
  }
}
```

**The fix — iterate backwards:**
```ts
// CORRECT — splice at higher indices doesn't affect lower indices
for (let i = enemies.length - 1; i >= 0; i--) {
  if (enemies[i].done) {
    enemies.splice(i, 1); // removing at i doesn't affect items at 0..i-1
  }
}
```

When you splice item `i` from a backwards loop, you have already processed all items from `length-1` down to `i`. The items from `0` to `i-1` haven't been touched yet, and their indices are unchanged by the splice. The loop continues downward safely.

**You will see this pattern in:** Every game loop that processes and removes entities (enemies, projectiles, particles, effects).

---

## Step 2 — Define the Path

Open `src/main.ts`. Near the top, in the `// --- Constants ---` section, add the path color:

```ts
const COLOR_PATH = 0xa08060;
```

After the constants block, add the path definition:

```ts
// --- Path ---

const PATH: Array<{ row: number; col: number }> = [
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 2 }, { row: 3, col: 2 },
  { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 },
  { row: 5, col: 5 },
  { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 },
];
```

**What this is:** An ordered array of grid coordinates. Each `{ row, col }` is one tile on the path. The enemy visits them in this exact order — index 0 is the entry point, the last index is the exit.

**Why inline the tiles rather than just the corners?** Because each tile center becomes one waypoint. The enemy moves from center to center in a straight line, which produces clean grid-aligned movement with no diagonal shortcuts. You can trace the S-curve in the ASCII diagram above by reading the coordinates.

Next, add the world-space version of the path — converting grid coordinates to Three.js positions:

```ts
const ENEMY_Y = 0.35;

const WORLD_PATH: THREE.Vector3[] = PATH.map(({ row, col }) =>
  new THREE.Vector3(
    GRID_OFFSET_X + col * TILE_SIZE,
    ENEMY_Y,
    GRID_OFFSET_Z + row * TILE_SIZE
  )
);
```

**Line by line:**

`ENEMY_Y = 0.35`
The y-position for enemy centers. Tiles sit at y = 0. The sphere radius is 0.3, so y = 0.35 places the sphere just above the tile surface.

`PATH.map(({ row, col }) => ...)`
`Array.map` transforms every element of an array into something else, returning a new array of the same length. Here, every `{ row, col }` becomes a `THREE.Vector3`. The resulting array has the same number of entries as `PATH`, in the same order.

`{ row, col }` in the parameter
This is **destructuring**: instead of writing `(point) => ... point.row ... point.col`, you pull `row` and `col` out of the object directly in the parameter list.

`new THREE.Vector3(x, y, z)`
A Three.js 3D point. The x and z use the same centering math from Lab 04. The y is fixed at `ENEMY_Y`.

> **SAVE AND TRY:** No visible change yet — the path exists in memory but is not drawn. No TypeScript errors expected.

---

## Step 3 — Mark Path Tiles Visually

Path tiles need to look different from normal tiles. They also need to be marked `walkable: false` so towers cannot be placed on them.

Find the section after the grid-building loop where you might have a comment like `// after grid is built`. If there is no such comment, add this block right after the closing `}` of the grid loop:

```ts
// Mark path tiles
for (const { row, col } of PATH) {
  const tile = grid[row][col];
  tile.walkable = false;
  tile.material.color.setHex(COLOR_PATH);
}
```

**Line by line:**

`for (const { row, col } of PATH)`
A `for...of` loop iterates over every item in an array. The `const { row, col }` destructures each item — the same shorthand as in the `map()` call above.

`tile.walkable = false`
Flags this tile as impassable. The click handler will check this before allowing tower placement.

`tile.material.color.setHex(COLOR_PATH)`
Changes the tile's color to the sandy/dirt color. You used `setHex` in Lab 06 for selection highlighting — same method.

> **CSS AND SEE:** Save and check the browser. You should see an S-shaped brown/tan path winding across the green grid. The path tiles are visible and distinct from the green tiles.

---

## Step 4 — Update the Click Handler

Currently the click handler places a tower on any unoccupied tile. Now path tiles must also be excluded.

Find this block inside the click handler:

```ts
if (tile.occupied) {
  removeTower(tile);
} else {
  placeTower(tile);
}
```

Change it to:

```ts
if (!tile.walkable) return;
if (tile.occupied) {
  removeTower(tile);
} else {
  placeTower(tile);
}
```

`if (!tile.walkable) return;`
Early return — if the tile is on the path, do nothing. The click is silently ignored. `!tile.walkable` is true when `walkable` is `false`.

> **SAVE AND TRY:** Click on a brown path tile — nothing should happen. Click on a green tile — tower placement still works normally.

---

## Step 5 — The Enemy Class

Add the `Enemy` class after the tower classes (after `SniperTower`) and before the `// --- Constants ---` section.

### 5a — Class skeleton and properties

```ts
// --- Enemy ---

class Enemy {
  readonly mesh: THREE.Mesh;
  private readonly worldPath: THREE.Vector3[];
  private waypointIndex: number = 0;
  readonly speed: number;
  done: boolean = false;

  constructor(worldPath: THREE.Vector3[], speed: number) {
    this.worldPath = worldPath;
    this.speed = speed;

    const geometry = new THREE.SphereGeometry(0.3, 12, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff3333 });
    this.mesh = new THREE.Mesh(geometry, material);

    if (worldPath.length > 0) {
      this.mesh.position.copy(worldPath[0]);
    }
  }
```

**Line by line:**

`private readonly worldPath: THREE.Vector3[]`
`private` — the path is internal; nothing outside needs to read it.
`readonly` — assigned once in the constructor, never changed.

`private waypointIndex: number = 0`
Starts at 0 — the enemy targets the first waypoint when spawned. `private` because nothing outside the Enemy needs to read or write it.

`done: boolean = false`
Not private — the game loop needs to read this to know when to remove the enemy. Starts `false`; set to `true` when the enemy completes the path.

`this.mesh.position.copy(worldPath[0])`
`Vector3.copy()` copies the x, y, z values from another Vector3 into this one — a convenience over setting three properties separately. This places the enemy mesh at the first waypoint immediately.

`if (worldPath.length > 0)`
Guards against an empty path, which would make `worldPath[0]` undefined.

> **SAVE AND TRY:** Class is defined but not used yet. No TypeScript errors expected.

---

### 5b — The `update` method

Add the `update` method inside the `Enemy` class, after the constructor:

```ts
  update(deltaTime: number): void {
    if (this.done) return;
    if (this.waypointIndex >= this.worldPath.length) {
      this.done = true;
      return;
    }

    const target = this.worldPath[this.waypointIndex];
    const dx = target.x - this.mesh.position.x;
    const dz = target.z - this.mesh.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.05) {
      this.waypointIndex++;
      return;
    }

    const nx = dx / distance;
    const nz = dz / distance;
    this.mesh.position.x += nx * this.speed * deltaTime;
    this.mesh.position.z += nz * this.speed * deltaTime;
  }
```

**Line by line:**

`if (this.done) return;`
Guard: if the enemy already finished, ignore further update calls. The game loop will clean it up.

`if (this.waypointIndex >= this.worldPath.length)`
When `waypointIndex` reaches or exceeds the array length, there are no more waypoints. Set `done = true` and return. The game loop reads `done` and removes the enemy.

`const target = this.worldPath[this.waypointIndex]`
The waypoint the enemy is currently moving toward.

`const dx = target.x - this.mesh.position.x`
`const dz = target.z - this.mesh.position.z`
The difference vector. X and Z only — Y is fixed at `ENEMY_Y` and does not factor into movement.

`const distance = Math.sqrt(dx * dx + dz * dz)`
The length of the difference vector — how far away the target waypoint is.

`if (distance < 0.05) { this.waypointIndex++; return; }`
Arrival check. When the enemy is within 0.05 units of the waypoint center, it counts as arrived. Increment the waypoint index and return — the enemy will start moving toward the next waypoint on the next frame.

`const nx = dx / distance`
`const nz = dz / distance`
Normalize: divide each component by the distance. Now `(nx, nz)` is a unit vector pointing toward the target.

`this.mesh.position.x += nx * this.speed * deltaTime`
`this.mesh.position.z += nz * this.speed * deltaTime`
Move in the direction of the unit vector, scaled by speed and delta time. Frame-rate independent.

---

### 5c — The `dispose` method

Add after `update`, still inside the `Enemy` class:

```ts
  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}
```

Same pattern as `Tower.dispose`. Removes the mesh from the scene when the enemy is done.

> **SAVE AND TRY:** Class is complete. No TypeScript errors expected. Still no visible change — no enemies exist yet.

---

## Step 6 — Enemies Array, Lives, and Spawning

### 6a — Add state variables

Find the `// --- State ---` section where `towers` and `activeTowerType` are declared. Add two more:

```ts
const enemies: Enemy[] = [];
let lives: number = 10;
```

`enemies: Enemy[]`
An array that holds all currently active Enemy instances. Starts empty. As enemies are spawned, they are pushed in. As they finish or die, they are spliced out.

`lives: number = 10`
The player starts with 10 lives. Each enemy that exits the map costs 1.

---

### 6b — The `spawnEnemy` function

Add this after `removeTower` and before the `// --- HUD Logic ---` section:

```ts
function spawnEnemy(speed: number = 2): void {
  const enemy = new Enemy(WORLD_PATH, speed);
  enemies.push(enemy);
  scene.add(enemy.mesh);
}
```

`speed: number = 2`
A default parameter. If `spawnEnemy()` is called with no argument, `speed` is `2`. If called with `spawnEnemy(3.5)`, speed is `3.5`. Default parameters have been available since ES6 — TypeScript supports them fully.

`new Enemy(WORLD_PATH, speed)`
Creates the enemy with the shared world-space path computed in Step 2.

---

### 6c — Add spacebar to the keyboard listener

Find the `window.addEventListener('keydown', ...)` block. Add a spacebar case:

```ts
window.addEventListener('keydown', (event) => {
  if (event.key === '1') {
    activeTowerType = 'basic';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === '2') {
    activeTowerType = 'sniper';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === ' ') {
    event.preventDefault();
    spawnEnemy();
    gameEvents.emit('enemySpawned', enemies.length);
  }
});
```

`event.key === ' '`
The space key's string value is a single space character.

`event.preventDefault()`
Prevents the browser's default spacebar behavior, which is to scroll the page down.

`gameEvents.emit('enemySpawned', enemies.length)`
Announces the spawn so the HUD can update.

> **SAVE AND TRY:** Press `Space`. A red sphere should appear at the top-left of the path — but it does not move yet. The update loop does not call enemy updates. Fix that next.

---

## Step 7 — Update All Enemies in the Game Loop

Find the `update` function:

```ts
function update(deltaTime: number): void {
  controls.update();
  void deltaTime;
}
```

Replace it with:

```ts
function update(deltaTime: number): void {
  controls.update();

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(deltaTime);

    if (enemy.done) {
      enemy.dispose(scene);
      enemies.splice(i, 1);
      lives = Math.max(0, lives - 1);
      gameEvents.emit('livesChanged', lives);
    }
  }
}
```

**Line by line:**

`for (let i = enemies.length - 1; i >= 0; i--)`
Backwards loop. Starts at the last index, counts down to 0. Safe to splice inside because splicing at index `i` does not shift any indices below `i`.

`enemy.update(deltaTime)`
Calls the enemy's movement logic for this frame.

`if (enemy.done)`
After `update()`, check if the enemy finished the path.

`enemy.dispose(scene)`
Remove the mesh from the Three.js scene.

`enemies.splice(i, 1)`
Remove the enemy from the array. Using `i` (not `enemies.indexOf(enemy)`) because in a backwards loop, `i` is already the correct index — no search needed.

`lives = Math.max(0, lives - 1)`
Subtract one life, clamped to a minimum of 0. `Math.max(0, value)` prevents lives from going negative.

`gameEvents.emit('livesChanged', lives)`
Announces the lives change. The HUD will react.

> **SAVE AND TRY:** Press `Space`. The red sphere should now walk the path from top-left to bottom-right, following the S-curve tile by tile. When it exits off the right edge, it disappears. The HUD does not update yet — add that next.

---

## Step 8 — Update the HUD

Find `updateHUD()`. Update it to show lives:

```ts
function updateHUD(): void {
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';
  hudEl.textContent =
    'Towers: ' + towers.length +
    '  |  ' + typeLabel +
    '  |  Lives: ' + lives;
}
```

Then add two more event subscriptions:

```ts
gameEvents.on('enemySpawned', () => { updateHUD(); });
gameEvents.on('livesChanged', () => { updateHUD(); });
```

> **SAVE AND TRY:** Press `Space` several times to spawn multiple enemies. Watch them walk the path simultaneously. Each time one exits, the Lives counter decrements. Spawn enough to reach 0 lives — the counter stops at 0 (it does not go negative).

---

## Step 9 — Verify Everything Together

Confirm these behaviors work in combination:

1. Place towers on green tiles — path tiles refuse placement
2. Spawn enemies with `Space` — multiple enemies can be on the path at once
3. Switch tower types with `1` and `2` — HUD updates, subsequent towers use the new type
4. Orbit the camera while enemies move — movement continues correctly
5. Tab away and back — enemies do not teleport (delta time clamping from Lab 03)

---

## Challenges

---

**Challenge 1 — Enemy Speed Variation**

Spawn alternating slow and fast enemies: odd-numbered spawns at speed 1.5, even-numbered spawns at speed 3.

Hints:
- Track a `spawnCount` variable that increments each time `spawnEnemy` is called
- Use the modulo operator `%` to determine odd/even

<details>
<summary>Solution</summary>

```ts
let spawnCount = 0;

function spawnEnemy(speed?: number): void {
  if (speed === undefined) {
    spawnCount++;
    speed = spawnCount % 2 === 0 ? 3 : 1.5;
  }
  const enemy = new Enemy(WORLD_PATH, speed);
  enemies.push(enemy);
  scene.add(enemy.mesh);
}
```

`speed?: number` — the `?` makes the parameter optional. If omitted, `speed` is `undefined`. The guard inside sets it based on spawn count.

</details>

---

**Challenge 2 — Enemy Color by Speed**

Fast enemies are red (`0xff3333`). Slow enemies are orange (`0xff8800`). Very slow enemies (below 1.5) are yellow (`0xffdd00`). Modify the `Enemy` class to color itself based on its speed.

Hints:
- Add a helper inside the constructor that picks a color based on `speed`
- Use two `if` checks (no `else`) or a ternary chain

<details>
<summary>Solution</summary>

```ts
constructor(worldPath: THREE.Vector3[], speed: number) {
  this.worldPath = worldPath;
  this.speed = speed;

  let color = 0xff3333;
  if (speed < 2.0) color = 0xff8800;
  if (speed < 1.5) color = 0xffdd00;

  const geometry = new THREE.SphereGeometry(0.3, 12, 8);
  const material = new THREE.MeshStandardMaterial({ color });
  this.mesh = new THREE.Mesh(geometry, material);

  if (worldPath.length > 0) {
    this.mesh.position.copy(worldPath[0]);
  }
}
```

`{ color }` is shorthand for `{ color: color }`. Since the variable name matches the property name, TypeScript (and JavaScript) lets you write just `{ color }`.

</details>

---

**Challenge 3 — Game Over**

When `lives` reaches 0, stop spawning enemies and display "GAME OVER" in the HUD instead of the normal text. Pressing `R` resets lives to 10 and clears all enemies.

Hints:
- Check `if (lives <= 0)` at the top of `spawnEnemy` and return early
- For the reset: loop over `enemies` in reverse, dispose each one, then clear the array with `enemies.length = 0`
- `enemies.length = 0` empties an array in place without creating a new one

<details>
<summary>Solution</summary>

```ts
function spawnEnemy(speed: number = 2): void {
  if (lives <= 0) return;
  const enemy = new Enemy(WORLD_PATH, speed);
  enemies.push(enemy);
  scene.add(enemy.mesh);
}

function updateHUD(): void {
  if (lives <= 0) {
    hudEl.textContent = 'GAME OVER  |  Press R to restart';
    return;
  }
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';
  hudEl.textContent =
    'Towers: ' + towers.length + '  |  ' + typeLabel + '  |  Lives: ' + lives;
}

// Inside the keydown listener:
if (event.key === 'r' || event.key === 'R') {
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].dispose(scene);
  }
  enemies.length = 0;
  lives = 10;
  gameEvents.emit('livesChanged', lives);
}
```

</details>

---

## Quick Check Answers

1. **Converting `{ row, col }` to world position:** `x = GRID_OFFSET_X + col * TILE_SIZE`, `z = GRID_OFFSET_Z + row * TILE_SIZE`. This is the same formula used to place tile meshes in Lab 04 — enemy world positions use the same coordinate system as the grid.

2. **Direction to move:** If at `(2.0, 5.0)` targeting `(5.0, 5.0)`: `dx = 3, dz = 0`, normalized gives `(1, 0)` — move purely in the positive X direction. If targeting `(5.0, 9.0)`: `dx = 3, dz = 4`, distance = 5, normalized gives `(0.6, 0.8)` — move diagonally toward the target.

3. **The problem with forward splicing:** When you splice item at index `i`, every item after it shifts down by one. The item that was at `i+1` is now at `i`. But the loop increments `i` to `i+1` on the next iteration, so the newly-shifted item is skipped entirely. Iterating backwards avoids this because splicing at `i` only affects indices above `i`, which you have already processed.

---

## Final Check

| # | Check | Expected result |
|---|---|---|
| 1 | Page loads | Brown S-curve visible across the grid; green tiles otherwise |
| 2 | Click a path tile | Nothing happens (no tower placed) |
| 3 | Click a green tile | Tower placed normally |
| 4 | Press `Space` | Red sphere appears at `(row:1, col:0)` and starts moving |
| 5 | Enemy walks the path | Follows the S-curve accurately, tile by tile |
| 6 | Enemy exits | Sphere disappears, Lives decrements in HUD |
| 7 | Spawn 3 enemies rapidly | All 3 walk the path simultaneously, independently |
| 8 | Orbit camera while enemies move | Movement continues, no visual glitches |
| 9 | TypeScript terminal | Zero errors |

---

## Complete File Listing

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Event System ---

type EventCallback = (data: unknown) => void;

class EventEmitter {
  private listeners: Map<string, Array<EventCallback>> = new Map();

  on(eventName: string, callback: EventCallback): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    const callbacks = this.listeners.get(eventName)!;
    callbacks.push(callback);
  }

  emit(eventName: string, data: unknown): void {
    if (!this.listeners.has(eventName)) {
      return;
    }
    const callbacks = this.listeners.get(eventName)!;
    callbacks.forEach((callback) => {
      callback(data);
    });
  }
}

const gameEvents = new EventEmitter();

// --- Grid Types ---

interface Tile {
  row: number;
  col: number;
  walkable: boolean;
  occupied: boolean;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}

// --- Tower Types ---

interface TowerConfig {
  topRadius: number;
  bottomRadius: number;
  height: number;
  color: number;
  range: number;
}

abstract class Tower {
  readonly tile: Tile;
  readonly mesh: THREE.Mesh;
  readonly range: number;

  constructor(tile: Tile, config: TowerConfig) {
    this.tile = tile;
    this.range = config.range;

    const geometry = new THREE.CylinderGeometry(
      config.topRadius,
      config.bottomRadius,
      config.height,
      8
    );
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
    super(tile, {
      topRadius: 0.25,
      bottomRadius: 0.35,
      height: 1.2,
      color: 0x3355ff,
      range: 1.5,
    });
  }
}

class SniperTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.15,
      bottomRadius: 0.20,
      height: 2.2,
      color: 0x778899,
      range: 3.5,
    });
  }
}

type TowerType = 'basic' | 'sniper';

// --- Enemy ---

class Enemy {
  readonly mesh: THREE.Mesh;
  private readonly worldPath: THREE.Vector3[];
  private waypointIndex: number = 0;
  readonly speed: number;
  done: boolean = false;

  constructor(worldPath: THREE.Vector3[], speed: number) {
    this.worldPath = worldPath;
    this.speed = speed;

    const geometry = new THREE.SphereGeometry(0.3, 12, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff3333 });
    this.mesh = new THREE.Mesh(geometry, material);

    if (worldPath.length > 0) {
      this.mesh.position.copy(worldPath[0]);
    }
  }

  update(deltaTime: number): void {
    if (this.done) return;
    if (this.waypointIndex >= this.worldPath.length) {
      this.done = true;
      return;
    }

    const target = this.worldPath[this.waypointIndex];
    const dx = target.x - this.mesh.position.x;
    const dz = target.z - this.mesh.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.05) {
      this.waypointIndex++;
      return;
    }

    const nx = dx / distance;
    const nz = dz / distance;
    this.mesh.position.x += nx * this.speed * deltaTime;
    this.mesh.position.z += nz * this.speed * deltaTime;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

// --- Constants ---

const GRID_ROWS = 8;
const GRID_COLS = 8;
const TILE_SIZE = 1;
const TILE_GAP = 0.05;
const GRID_OFFSET_X = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const GRID_OFFSET_Z = -(GRID_ROWS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const DRAG_THRESHOLD_PX = 5;

const COLOR_TILE_LIGHT = 0x4a7c59;
const COLOR_TILE_DARK  = 0x2d5a3d;
const COLOR_PATH       = 0xa08060;

// --- Path ---

const PATH: Array<{ row: number; col: number }> = [
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 2 }, { row: 3, col: 2 },
  { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 },
  { row: 5, col: 5 },
  { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 },
];

const ENEMY_Y = 0.35;

const WORLD_PATH: THREE.Vector3[] = PATH.map(({ row, col }) =>
  new THREE.Vector3(
    GRID_OFFSET_X + col * TILE_SIZE,
    ENEMY_Y,
    GRID_OFFSET_Z + row * TILE_SIZE
  )
);

// --- Renderer ---

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const container = document.getElementById('game-container')!;
container.appendChild(renderer.domElement);

// --- HUD ---

const hudEl = document.createElement('div');
hudEl.style.position = 'absolute';
hudEl.style.top = '16px';
hudEl.style.left = '16px';
hudEl.style.color = 'white';
hudEl.style.fontSize = '18px';
hudEl.style.fontFamily = 'monospace';
hudEl.style.pointerEvents = 'none';
hudEl.style.textShadow = '1px 1px 2px black';
container.appendChild(hudEl);

// --- Scene ---

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// --- Camera ---

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 10, 8);

// --- Lights ---

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// --- Controls ---

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 4;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2.2;

// --- Grid ---

const grid: Tile[][] = [];

for (let row = 0; row < GRID_ROWS; row++) {
  grid[row] = [];
  for (let col = 0; col < GRID_COLS; col++) {
    const geometry = new THREE.PlaneGeometry(
      TILE_SIZE - TILE_GAP,
      TILE_SIZE - TILE_GAP
    );
    const material = new THREE.MeshStandardMaterial({
      color: (row + col) % 2 === 0 ? COLOR_TILE_LIGHT : COLOR_TILE_DARK,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.x = GRID_OFFSET_X + col * TILE_SIZE;
    mesh.position.z = GRID_OFFSET_Z + row * TILE_SIZE;

    scene.add(mesh);

    const tile: Tile = {
      row,
      col,
      walkable: true,
      occupied: false,
      mesh,
      material,
    };

    mesh.userData['tile'] = tile;
    grid[row][col] = tile;
  }
}

// Mark path tiles
for (const { row, col } of PATH) {
  const tile = grid[row][col];
  tile.walkable = false;
  tile.material.color.setHex(COLOR_PATH);
}

// --- State ---

const towers: Tower[] = [];
const enemies: Enemy[] = [];
let activeTowerType: TowerType = 'basic';
let lives: number = 10;

// --- Tower Logic ---

function placeTower(tile: Tile): void {
  const tower: Tower =
    activeTowerType === 'basic' ? new BasicTower(tile) : new SniperTower(tile);
  towers.push(tower);
  scene.add(tower.mesh);
  tile.occupied = true;
  gameEvents.emit('towerPlaced', tower);
}

function removeTower(tile: Tile): void {
  const index = towers.findIndex((t) => t.tile === tile);
  if (index === -1) return;
  const tower = towers[index];
  tower.dispose(scene);
  towers.splice(index, 1);
  tile.occupied = false;
  gameEvents.emit('towerRemoved', tower);
}

// --- Enemy Logic ---

function spawnEnemy(speed: number = 2): void {
  const enemy = new Enemy(WORLD_PATH, speed);
  enemies.push(enemy);
  scene.add(enemy.mesh);
  gameEvents.emit('enemySpawned', enemies.length);
}

// --- HUD Logic ---

function updateHUD(): void {
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';
  hudEl.textContent =
    'Towers: ' + towers.length +
    '  |  ' + typeLabel +
    '  |  Lives: ' + lives;
}

gameEvents.on('towerPlaced',   () => { updateHUD(); });
gameEvents.on('towerRemoved',  () => { updateHUD(); });
gameEvents.on('typeChanged',   () => { updateHUD(); });
gameEvents.on('enemySpawned',  () => { updateHUD(); });
gameEvents.on('livesChanged',  () => { updateHUD(); });

updateHUD();

// --- Raycaster ---

const raycaster = new THREE.Raycaster();

function getTileBaseColor(tile: Tile): number {
  return (tile.row + tile.col) % 2 === 0 ? COLOR_TILE_LIGHT : COLOR_TILE_DARK;
}

// --- Input ---

let mouseDownX = 0;
let mouseDownY = 0;

renderer.domElement.addEventListener('mousedown', (event) => {
  mouseDownX = event.clientX;
  mouseDownY = event.clientY;
});

renderer.domElement.addEventListener('click', (event) => {
  const dx = event.clientX - mouseDownX;
  const dy = event.clientY - mouseDownY;
  if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) return;

  const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
  const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

  const tileMeshes = grid.flat().map((t) => t.mesh);
  const hits = raycaster.intersectObjects(tileMeshes);
  if (hits.length === 0) return;

  const tile = hits[0].object.userData['tile'] as Tile;

  if (!tile.walkable) return;
  if (tile.occupied) {
    removeTower(tile);
  } else {
    placeTower(tile);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === '1') {
    activeTowerType = 'basic';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === '2') {
    activeTowerType = 'sniper';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === ' ') {
    event.preventDefault();
    spawnEnemy();
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Game Loop ---

const clock = new THREE.Clock();
const MAX_DELTA = 0.1;

function update(deltaTime: number): void {
  controls.update();

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(deltaTime);

    if (enemy.done) {
      enemy.dispose(scene);
      enemies.splice(i, 1);
      lives = Math.max(0, lives - 1);
      gameEvents.emit('livesChanged', lives);
    }
  }
}

function render(): void {
  renderer.render(scene, camera);
}

function animate(): void {
  requestAnimationFrame(animate);
  const rawDelta = clock.getDelta();
  const deltaTime = Math.min(rawDelta, MAX_DELTA);
  update(deltaTime);
  render();
}

animate();
```

---

> **Lab 12 Preview:** Enemies now walk the path, but you have to press `Space` for each one. Real tower defense games send **waves** — groups of enemies that spawn automatically on a timer. Lab 12 introduces the wave system: a `WaveConfig` interface that describes how many enemies to send, how fast to send them, and how fast they move. You press `Space` to start the next wave, and the game spawns enemies automatically until the wave is exhausted.
