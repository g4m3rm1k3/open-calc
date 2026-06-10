# TypeScript Tower Defense — LAB 17 — Modules

**Prerequisites:** Lab 16 complete. The game has three tower types, three enemy types, wave progression, score, and game state.

**What this lab adds:**
- `export` — making code available to other files
- `import` — using code from other files
- Splitting one large file into focused modules
- Understanding which code belongs where
- **No new game behavior** — this lab is pure organization. The game plays identically before and after.

**Time:** 45–60 minutes.

---

## What You Will Build

`src/main.ts` is currently ~350 lines covering types, classes, setup, game logic, and the render loop — everything in one place. After this lab, those concerns live in separate files:

```
src/
├── types.ts          ← interfaces and type aliases
├── EventEmitter.ts   ← EventCallback and EventEmitter class
├── entities/
│   ├── Enemy.ts      ← EnemyConfig, Enemy (abstract), three subclasses
│   └── Tower.ts      ← TowerConfig, Tower (abstract), three subclasses
└── main.ts           ← Three.js setup, constants, game logic, event loop
```

`main.ts` shrinks to ~250 lines of wiring and behavior — no class definitions, no type interfaces. Each module is readable on its own.

---

> **Quick Check — try to answer before reading further:**
>
> 1. `main.ts` is currently ~350 lines. Is that large? How large do files get in real applications?
> 2. If two files both need the `Tile` interface, where should `Tile` be defined? What would happen if it were defined in both?
> 3. You already use `import * as THREE from 'three'` at the top of `main.ts`. What does that line do? How does it relate to what you are about to learn?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand Modules Before Touching Code

---

### Concept: What a Module Is

A **module** is any file that uses `export` or `import`. In TypeScript (and modern JavaScript), every file is its own scope — variables and functions defined in one file do not automatically exist in another. The only way to share code between files is to explicitly export from one and import into the other.

```
File A defines something          File B needs it
─────────────────────            ──────────────────────
export const PI = 3.14;   →      import { PI } from './A';
                                  console.log(PI); // 3.14
```

**Before modules** (the old way), all scripts on a page shared one global scope. A variable named `score` in one file would collide with a variable named `score` in another. Modules eliminate this problem by default.

---

### Concept: Named Exports

You make something available to other files with the `export` keyword:

```ts
// src/math.ts
export function square(x: number): number {
  return x * x;
}

export const PI = 3.14159;

// Not exported — private to this module:
function internalHelper(): void { /* ... */ }
```

`export` can be placed directly before `const`, `let`, `function`, `class`, `interface`, `type`, or `enum`. Anything without `export` stays private to the file.

---

### Concept: Named Imports

To use an exported value in another file:

```ts
// src/main.ts
import { square, PI } from './math';
//       ──────  ──     ──────────
//       names            path to the file (no .ts extension needed)

console.log(square(4)); // 16
console.log(PI);        // 3.14159
```

**The path:** `'./math'` means "look in the same directory for a file called `math.ts`." `'../types'` means "go up one directory, then look for `types.ts`." `'three'` (no dot) means "look in `node_modules/three`" — which is how `import * as THREE from 'three'` works.

**`import * as THREE`:** Imports everything exported from `'three'` as a single namespace object called `THREE`. When you write `THREE.Mesh`, you are accessing the `Mesh` export of the `three` package through that namespace. Named imports (`import { Mesh }`) do the same thing but without the prefix — `import * as` is just a convenient shorthand when you need many things from one package.

---

### Concept: The `import type` Keyword

When you only need a type annotation (not the runtime value), TypeScript offers `import type`:

```ts
import type { Tile } from './types';
// Tile is only used in type positions — TypeScript erases it at compile time
```

`import type` is erased entirely when TypeScript compiles to JavaScript — it leaves no trace in the output. This is an optimization, not a correctness requirement. Regular `import` works fine for types too. You will use `import type` in this lab for types that are only needed for annotations, but either form works.

---

### Concept: What Belongs in a Module?

A good rule of thumb for this project:

| Should be in a module | Should stay in main.ts |
|---|---|
| Class definitions | Three.js renderer, scene, camera, lights setup |
| Interfaces and type aliases | Game constants (GRID_ROWS, etc.) |
| Pure utility functions | State variables (towers[], enemies[], etc.) |
| Classes with no external side effects | Event subscriptions and listeners |
| | Game loop (animate, update, render) |

The distinction: modules define **what things are**. `main.ts` defines **what the game does** — it wires the pieces together and runs them.

---

## Step 2 — Create `src/types.ts`

Create a new file: `src/types.ts`. In VS Code, right-click on the `src` folder and choose "New File," then type `types.ts`.

Start with just the `Tile` interface:

```ts
import * as THREE from 'three';

export interface Tile {
  row: number;
  col: number;
  walkable: boolean;
  occupied: boolean;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}
```

**What is happening here:**
- `import * as THREE from 'three'` — this file needs Three.js types for the `mesh` and `material` fields. The same import you already have in `main.ts`.
- `export interface Tile` — the `export` before `interface` makes `Tile` available to any file that imports from `'./types'`.

Now open `src/main.ts`. Find the `Tile` interface:

```ts
interface Tile {
  row: number;
  col: number;
  walkable: boolean;
  occupied: boolean;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}
```

Delete it entirely from `main.ts`. Then add an import at the top of `main.ts`, after the existing imports:

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Tile } from './types';
```

`import type { Tile }` — we only use `Tile` as a type annotation in `main.ts`. `import type` communicates this clearly and causes TypeScript to verify it.

> **SAVE AND TRY:** Save both files. Check the Vite terminal. Zero TypeScript errors expected. The game looks and plays identically — `Tile` is defined in one place and imported where needed.

---

## Step 3 — Move All Remaining Types into `src/types.ts`

Open `src/types.ts`. Add the remaining interfaces and type aliases below `Tile`:

```ts
export interface TowerConfig {
  topRadius: number;
  bottomRadius: number;
  height: number;
  color: number;
  range: number;
  damage: number;
}

export interface EnemyConfig {
  health: number;
  radius: number;
  color: number;
  speedMultiplier: number;
}

export interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
  enemyType: EnemyType;
}

export type TowerType = 'basic' | 'sniper' | 'cannon';
export type EnemyType = 'basic' | 'armored' | 'fast';
export type GameState = 'playing' | 'gameover' | 'won';
```

Note: `WaveConfig` references `EnemyType`, which is defined in the same file — no import needed.

Now remove all of these from `src/main.ts`. Then update the import in `main.ts`:

```ts
import type { Tile, TowerConfig, EnemyConfig, WaveConfig, TowerType, EnemyType, GameState } from './types';
```

> **SAVE AND TRY:** Save both files. Zero TypeScript errors. Game unchanged. The type section of `main.ts` is now one import line instead of six declarations.

---

## Step 4 — Create `src/EventEmitter.ts`

Create `src/EventEmitter.ts`. Move the `EventCallback` type and `EventEmitter` class there:

```ts
export type EventCallback = (data: unknown) => void;

export class EventEmitter {
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
```

No imports needed — `EventEmitter` only uses built-in TypeScript types (`Map`, `string`, `unknown`).

Delete `EventCallback` and the `EventEmitter` class from `main.ts`. Update `main.ts` imports:

```ts
import { EventEmitter } from './EventEmitter';
import type { EventCallback } from './EventEmitter';
```

Or combine them — since `EventCallback` is used as a type annotation, you can also write:

```ts
import { EventEmitter, type EventCallback } from './EventEmitter';
```

`{ EventEmitter, type EventCallback }` — the `type` keyword inside the braces applies only to `EventCallback`, not `EventEmitter`. This is the inline `import type` syntax added in TypeScript 4.5.

> **SAVE AND TRY:** Save both files. Zero errors. Game unchanged. The EventEmitter is now self-contained and reusable — you could copy `EventEmitter.ts` to any project.

---

## Step 5 — Create `src/entities/Enemy.ts`

Create the directory `src/entities/` (right-click `src`, New Folder, type `entities`). Then create `src/entities/Enemy.ts`.

Move everything related to `Enemy` into this file:

```ts
import * as THREE from 'three';
import type { EnemyConfig, EnemyType } from '../types';

export abstract class Enemy {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly worldPath: THREE.Vector3[];
  private waypointIndex: number = 0;
  readonly speed: number;
  readonly maxHealth: number;
  health: number;
  done: boolean = false;
  escaped: boolean = false;
  slowTimer: number = 0;
  slowMultiplier: number = 1.0;

  constructor(worldPath: THREE.Vector3[], speed: number, config: EnemyConfig) {
    this.worldPath = worldPath;
    this.speed = speed * config.speedMultiplier;
    this.maxHealth = config.health;
    this.health = config.health;

    const geometry = new THREE.SphereGeometry(config.radius, 12, 8);
    this.material = new THREE.MeshStandardMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, this.material);

    if (worldPath.length > 0) {
      this.mesh.position.copy(worldPath[0]);
    }
  }

  private updateColor(): void {
    const t = this.health / this.maxHealth;
    if (this.slowTimer > 0) {
      this.material.color.setRGB(t * 0.5, t * 0.3, 1.0);
    } else {
      this.material.color.setRGB(1.0, t * 0.4, 0.0);
    }
  }

  takeDamage(amount: number): void {
    if (this.done) return;
    this.health = Math.max(0, this.health - amount);
    this.updateColor();
    if (this.health <= 0) {
      this.done = true;
    }
  }

  applySlowEffect(duration: number, multiplier: number): void {
    this.slowTimer = duration;
    this.slowMultiplier = multiplier;
    this.updateColor();
  }

  update(deltaTime: number): void {
    if (this.done) return;
    if (this.waypointIndex >= this.worldPath.length) {
      this.escaped = true;
      this.done = true;
      return;
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= deltaTime;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowMultiplier = 1.0;
        this.updateColor();
      }
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
    const currentSpeed = this.speed * this.slowMultiplier;
    this.mesh.position.x += nx * currentSpeed * deltaTime;
    this.mesh.position.z += nz * currentSpeed * deltaTime;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

export class BasicEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, { health: 100, radius: 0.3,  color: 0xff6600, speedMultiplier: 1.0 });
  }
}

export class ArmoredEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, { health: 200, radius: 0.42, color: 0x886644, speedMultiplier: 0.8 });
  }
}

export class FastEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, { health: 50,  radius: 0.2,  color: 0xffdd00, speedMultiplier: 1.6 });
  }
}
```

**The path in the import:** `'../types'` — Enemy.ts is inside `src/entities/`, so `..` goes up to `src/`, then finds `types.ts`.

Now delete the `EnemyConfig` interface and all enemy classes from `main.ts`. The `EnemyConfig` interface is now in `types.ts` (moved in Step 3), so do not add it here again — it is already exported from there.

Update `main.ts` imports:

```ts
import { Enemy, BasicEnemy, ArmoredEnemy, FastEnemy } from './entities/Enemy';
```

`Enemy` is used as a runtime value (the array `Enemy[]` is typed, and `enemy.update()` is called), not just as a type, so a regular import (not `import type`) is correct.

> **SAVE AND TRY:** Save all modified files. Zero TypeScript errors. All three enemy types still walk the path and take damage. The game is unchanged.

---

## Step 6 — Create `src/entities/Tower.ts`

Create `src/entities/Tower.ts`. Move all tower-related code there:

```ts
import * as THREE from 'three';
import type { Tile, TowerConfig } from '../types';
import { Enemy } from './Enemy';

export abstract class Tower {
  readonly tile: Tile;
  readonly mesh: THREE.Mesh;
  readonly range: number;
  readonly damage: number;

  constructor(tile: Tile, config: TowerConfig) {
    this.tile = tile;
    this.range = config.range;
    this.damage = config.damage;

    const geometry = new THREE.CylinderGeometry(
      config.topRadius, config.bottomRadius, config.height, 8
    );
    const material = new THREE.MeshStandardMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.x = tile.mesh.position.x;
    this.mesh.position.y = config.height / 2;
    this.mesh.position.z = tile.mesh.position.z;
  }

  update(deltaTime: number, activeEnemies: Enemy[]): void {
    let target: Enemy | null = null;
    let closestDist = this.range;

    for (const enemy of activeEnemies) {
      if (enemy.done) continue;
      const dx = enemy.mesh.position.x - this.mesh.position.x;
      const dz = enemy.mesh.position.z - this.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= closestDist) {
        closestDist = dist;
        target = enemy;
      }
    }

    if (target !== null) {
      target.takeDamage(this.damage * deltaTime);
      this.onDamageDealt(target);
      if (target.done) {
        this.onKill(target, activeEnemies);
      }
    }
  }

  protected onDamageDealt(target: Enemy): void {}
  protected onKill(target: Enemy, allEnemies: Enemy[]): void {}

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

export class BasicTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.25, bottomRadius: 0.35, height: 1.2, color: 0x3355ff, range: 1.5, damage: 25 });
  }
}

export class SniperTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.15, bottomRadius: 0.20, height: 2.2, color: 0x778899, range: 3.5, damage: 60 });
  }

  protected override onKill(target: Enemy, allEnemies: Enemy[]): void {
    for (const enemy of allEnemies) {
      if (enemy === target) continue;
      if (enemy.done) continue;
      const dx = enemy.mesh.position.x - this.mesh.position.x;
      const dz = enemy.mesh.position.z - this.mesh.position.z;
      if (Math.sqrt(dx * dx + dz * dz) <= this.range) {
        enemy.takeDamage(this.damage * 0.5);
        break;
      }
    }
  }
}

export class CannonTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.3, bottomRadius: 0.42, height: 0.9, color: 0x885522, range: 2.0, damage: 20 });
  }

  protected override onDamageDealt(target: Enemy): void {
    target.applySlowEffect(1.0, 0.5);
  }
}
```

**The `Enemy` import:** Tower.ts imports `Enemy` as a regular (non-type) import. This is needed because `Tower.update()` calls methods on `Enemy` instances at runtime. TypeScript needs the full class definition to verify method calls, not just the type.

Delete all tower class definitions from `main.ts`. Update `main.ts` imports:

```ts
import { Tower, BasicTower, SniperTower, CannonTower } from './entities/Tower';
```

Again `Tower` is used as a runtime value (array, method calls), so a regular import.

> **SAVE AND TRY:** Save all files. Zero TypeScript errors. All three tower types place, target, and shoot correctly. The sniper chain and cannon slow still work. Game unchanged.

---

## Step 7 — Review What Remains in `main.ts`

Open `main.ts`. Read it top to bottom. It should now contain:

1. Imports (Three.js, OrbitControls, modules you just created)
2. `const gameEvents = new EventEmitter()`
3. Constants (GRID_ROWS, TILE_SIZE, colors, etc.)
4. PATH and WORLD_PATH
5. WAVES data array
6. Renderer setup
7. HUD and Overlay element creation
8. Scene, Camera, Lights, Controls setup
9. Grid building loop
10. State variables (towers[], enemies[], lives, etc.)
11. Game logic functions (placeTower, removeTower, spawnEnemy, etc.)
12. Event subscriptions (gameEvents.on(...))
13. Input handlers (click, keydown, resize)
14. Game loop (update, render, animate)

This is the **wiring** of the game. It says what happens, in what order, connecting the pieces defined elsewhere. Each section has a clear purpose. You can read just the grid-building loop without wading through class definitions.

**What to notice:** `main.ts` no longer defines any classes or interfaces. It only *uses* them. The definitions live in focused files where they are easy to find, read in isolation, and eventually test independently.

> **SAVE AND TRY:** Play a complete game — place towers of all three types, run all three waves, lose lives, win or lose, reset. Every feature works identically to Lab 16. The refactor was successful.

---

## Challenges

---

**Challenge 1 — Barrel Export**

Create `src/entities/index.ts` that re-exports everything from `Enemy.ts` and `Tower.ts`. Then update `main.ts` to import from `'./entities'` instead of `'./entities/Enemy'` and `'./entities/Tower'`.

A barrel file centralizes all exports from a directory, so importers do not need to know which sub-file defines what.

Hints:
- `export { Enemy, BasicEnemy, ArmoredEnemy, FastEnemy } from './Enemy';`
- `export { Tower, BasicTower, SniperTower, CannonTower } from './Tower';`
- In `main.ts`: `import { Enemy, BasicEnemy, ..., Tower, BasicTower, ... } from './entities';`

<details>
<summary>Solution</summary>

```ts
// src/entities/index.ts
export { Enemy, BasicEnemy, ArmoredEnemy, FastEnemy } from './Enemy';
export { Tower, BasicTower, SniperTower, CannonTower } from './Tower';
```

```ts
// In main.ts, replace two import lines with one:
import {
  Enemy, BasicEnemy, ArmoredEnemy, FastEnemy,
  Tower, BasicTower, SniperTower, CannonTower,
} from './entities';
```

`'./entities'` resolves to `./entities/index.ts` automatically. TypeScript (and Node.js/Vite) treats `index.ts` as the default entry point for a directory.

The advantage: if you later move `BasicEnemy` from `Enemy.ts` into its own `BasicEnemy.ts`, the barrel re-export in `index.ts` changes, but `main.ts` does not. Importers are insulated from internal reorganization.

</details>

---

**Challenge 2 — `src/game/waves.ts`**

Move the `WAVES` constant and `spawnEnemy` function to `src/game/waves.ts`. What imports does `waves.ts` need? What does `main.ts` need to import from it?

This requires thinking about what `spawnEnemy` depends on: it reads `WORLD_PATH` and writes to `enemies[]` and `scene`. How would you pass those in without creating circular dependencies?

Hints:
- `spawnEnemy` needs `WORLD_PATH`, `enemies`, and `scene` — all defined in `main.ts`
- Instead of reaching into `main.ts` (circular), change `spawnEnemy` to accept them as parameters
- `function spawnEnemy(worldPath, scene, enemies, speed, type)` — caller provides all dependencies

<details>
<summary>Solution</summary>

```ts
// src/game/waves.ts
import * as THREE from 'three';
import type { WaveConfig } from '../types';
import { Enemy, BasicEnemy, ArmoredEnemy, FastEnemy } from '../entities/Enemy';
import type { EnemyType } from '../types';

export const WAVES: WaveConfig[] = [
  { enemyCount: 3, spawnInterval: 2.0, enemySpeed: 1.5, enemyType: 'basic'   },
  { enemyCount: 6, spawnInterval: 0.9, enemySpeed: 2.0, enemyType: 'fast'    },
  { enemyCount: 4, spawnInterval: 2.5, enemySpeed: 1.8, enemyType: 'armored' },
];

export function createEnemy(
  worldPath: THREE.Vector3[],
  speed: number,
  type: EnemyType
): Enemy {
  if (type === 'basic')   return new BasicEnemy(worldPath, speed);
  if (type === 'fast')    return new FastEnemy(worldPath, speed);
  return new ArmoredEnemy(worldPath, speed);
}
```

```ts
// In main.ts:
import { WAVES, createEnemy } from './game/waves';

function spawnEnemy(speed: number, type: EnemyType): void {
  const enemy = createEnemy(WORLD_PATH, speed, type);
  enemies.push(enemy);
  scene.add(enemy.mesh);
}
```

`createEnemy` is a pure factory function — given inputs, return an `Enemy`. It does not touch `scene` or `enemies`. The side effects (`enemies.push`, `scene.add`) stay in `main.ts` where the state lives. This is the **dependency inversion** principle: the factory does not depend on the caller's state; the caller provides everything.

</details>

---

**Challenge 3 — Move Constants**

Create `src/constants.ts` and move all the game constants there (`GRID_ROWS`, `GRID_COLS`, `TILE_SIZE`, `TILE_GAP`, `GRID_OFFSET_X`, `GRID_OFFSET_Z`, `DRAG_THRESHOLD_PX`, `COLOR_TILE_LIGHT`, `COLOR_TILE_DARK`, `COLOR_PATH`, `ENEMY_Y`).

What is the complication with `GRID_OFFSET_X` and `GRID_OFFSET_Z`? They are computed from other constants. Can computed constants be exported?

<details>
<summary>Solution</summary>

```ts
// src/constants.ts
export const GRID_ROWS = 8;
export const GRID_COLS = 8;
export const TILE_SIZE = 1;
export const TILE_GAP = 0.05;
export const GRID_OFFSET_X = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;
export const GRID_OFFSET_Z = -(GRID_ROWS * TILE_SIZE) / 2 + TILE_SIZE / 2;
export const DRAG_THRESHOLD_PX = 5;

export const COLOR_TILE_LIGHT = 0x4a7c59;
export const COLOR_TILE_DARK  = 0x2d5a3d;
export const COLOR_PATH       = 0xa08060;

export const ENEMY_Y = 0.35;
```

Computed constants (`GRID_OFFSET_X = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2`) export just fine. The computation happens once when the module is first imported. The result is cached — no recomputation on subsequent imports.

In main.ts:
```ts
import {
  GRID_ROWS, GRID_COLS, TILE_SIZE, TILE_GAP,
  GRID_OFFSET_X, GRID_OFFSET_Z, DRAG_THRESHOLD_PX,
  COLOR_TILE_LIGHT, COLOR_TILE_DARK, COLOR_PATH, ENEMY_Y,
} from './constants';
```

</details>

---

## Quick Check Answers

1. **Is 350 lines large?** Not particularly — it is near the lower end of common file sizes. Real application files routinely run 500–2000 lines, and files in large systems can exceed 10,000 lines. The goal is not to minimize lines but to minimize the number of unrelated concerns in one file. A 350-line file that defines seven classes is harder to navigate than a 350-line file that does one thing well.

2. **Where should `Tile` be defined if two files need it?** In a shared module that both import from — `types.ts`. If it were defined in two files, you would have two independent interfaces with the same name. Code that uses one would be incompatible with code that uses the other, even if the definitions looked identical. TypeScript's structural typing means they would be compatible *in practice* for simple types, but it is still wrong conceptually and leads to maintenance confusion.

3. **What `import * as THREE from 'three'` does:** It loads the `three` package (from `node_modules/three`) and exposes all its named exports under the `THREE` namespace. When you write `import { X } from './file'`, you access one named export. `import * as NS` accesses all of them under a single object. The `three` package exports dozens of classes, so using `* as THREE` is conventional — `THREE.Mesh`, `THREE.Scene`, etc. are more readable than listing every import individually.

---

## Final Check

| # | Check | Expected result |
|---|---|---|
| 1 | Vite terminal after all splits | Zero TypeScript errors |
| 2 | Browser — page loads | Game looks identical to Lab 16 |
| 3 | Tower placement | All three types place correctly |
| 4 | Enemy waves | All three types walk, take damage, die |
| 5 | Cannon slow | Enemies turn blue-purple and slow |
| 6 | Sniper chain | Second enemy takes damage on kill |
| 7 | Win / lose / reset | All state transitions work |
| 8 | `src/types.ts` | Contains 3 interfaces + 3 type aliases, no class definitions |
| 9 | `src/EventEmitter.ts` | Contains only EventCallback and EventEmitter |
| 10 | `src/entities/Enemy.ts` | Contains Enemy + 3 subclasses, no main.ts references |
| 11 | `src/entities/Tower.ts` | Contains Tower + 3 subclasses, no main.ts references |

---

## Complete File Listings

### `src/types.ts`

```ts
import * as THREE from 'three';

export interface Tile {
  row: number;
  col: number;
  walkable: boolean;
  occupied: boolean;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}

export interface TowerConfig {
  topRadius: number;
  bottomRadius: number;
  height: number;
  color: number;
  range: number;
  damage: number;
}

export interface EnemyConfig {
  health: number;
  radius: number;
  color: number;
  speedMultiplier: number;
}

export interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
  enemyType: EnemyType;
}

export type TowerType = 'basic' | 'sniper' | 'cannon';
export type EnemyType = 'basic' | 'armored' | 'fast';
export type GameState = 'playing' | 'gameover' | 'won';
```

---

### `src/EventEmitter.ts`

```ts
export type EventCallback = (data: unknown) => void;

export class EventEmitter {
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
```

---

### `src/entities/Enemy.ts`

```ts
import * as THREE from 'three';
import type { EnemyConfig } from '../types';

export abstract class Enemy {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly worldPath: THREE.Vector3[];
  private waypointIndex: number = 0;
  readonly speed: number;
  readonly maxHealth: number;
  health: number;
  done: boolean = false;
  escaped: boolean = false;
  slowTimer: number = 0;
  slowMultiplier: number = 1.0;

  constructor(worldPath: THREE.Vector3[], speed: number, config: EnemyConfig) {
    this.worldPath = worldPath;
    this.speed = speed * config.speedMultiplier;
    this.maxHealth = config.health;
    this.health = config.health;

    const geometry = new THREE.SphereGeometry(config.radius, 12, 8);
    this.material = new THREE.MeshStandardMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, this.material);

    if (worldPath.length > 0) {
      this.mesh.position.copy(worldPath[0]);
    }
  }

  private updateColor(): void {
    const t = this.health / this.maxHealth;
    if (this.slowTimer > 0) {
      this.material.color.setRGB(t * 0.5, t * 0.3, 1.0);
    } else {
      this.material.color.setRGB(1.0, t * 0.4, 0.0);
    }
  }

  takeDamage(amount: number): void {
    if (this.done) return;
    this.health = Math.max(0, this.health - amount);
    this.updateColor();
    if (this.health <= 0) {
      this.done = true;
    }
  }

  applySlowEffect(duration: number, multiplier: number): void {
    this.slowTimer = duration;
    this.slowMultiplier = multiplier;
    this.updateColor();
  }

  update(deltaTime: number): void {
    if (this.done) return;
    if (this.waypointIndex >= this.worldPath.length) {
      this.escaped = true;
      this.done = true;
      return;
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= deltaTime;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowMultiplier = 1.0;
        this.updateColor();
      }
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
    const currentSpeed = this.speed * this.slowMultiplier;
    this.mesh.position.x += nx * currentSpeed * deltaTime;
    this.mesh.position.z += nz * currentSpeed * deltaTime;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

export class BasicEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, { health: 100, radius: 0.3,  color: 0xff6600, speedMultiplier: 1.0 });
  }
}

export class ArmoredEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, { health: 200, radius: 0.42, color: 0x886644, speedMultiplier: 0.8 });
  }
}

export class FastEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, { health: 50,  radius: 0.2,  color: 0xffdd00, speedMultiplier: 1.6 });
  }
}
```

---

### `src/entities/Tower.ts`

```ts
import * as THREE from 'three';
import type { Tile, TowerConfig } from '../types';
import { Enemy } from './Enemy';

export abstract class Tower {
  readonly tile: Tile;
  readonly mesh: THREE.Mesh;
  readonly range: number;
  readonly damage: number;

  constructor(tile: Tile, config: TowerConfig) {
    this.tile = tile;
    this.range = config.range;
    this.damage = config.damage;

    const geometry = new THREE.CylinderGeometry(
      config.topRadius, config.bottomRadius, config.height, 8
    );
    const material = new THREE.MeshStandardMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.x = tile.mesh.position.x;
    this.mesh.position.y = config.height / 2;
    this.mesh.position.z = tile.mesh.position.z;
  }

  update(deltaTime: number, activeEnemies: Enemy[]): void {
    let target: Enemy | null = null;
    let closestDist = this.range;

    for (const enemy of activeEnemies) {
      if (enemy.done) continue;
      const dx = enemy.mesh.position.x - this.mesh.position.x;
      const dz = enemy.mesh.position.z - this.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= closestDist) {
        closestDist = dist;
        target = enemy;
      }
    }

    if (target !== null) {
      target.takeDamage(this.damage * deltaTime);
      this.onDamageDealt(target);
      if (target.done) {
        this.onKill(target, activeEnemies);
      }
    }
  }

  protected onDamageDealt(target: Enemy): void {}
  protected onKill(target: Enemy, allEnemies: Enemy[]): void {}

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

export class BasicTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.25, bottomRadius: 0.35, height: 1.2, color: 0x3355ff, range: 1.5, damage: 25 });
  }
}

export class SniperTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.15, bottomRadius: 0.20, height: 2.2, color: 0x778899, range: 3.5, damage: 60 });
  }

  protected override onKill(target: Enemy, allEnemies: Enemy[]): void {
    for (const enemy of allEnemies) {
      if (enemy === target) continue;
      if (enemy.done) continue;
      const dx = enemy.mesh.position.x - this.mesh.position.x;
      const dz = enemy.mesh.position.z - this.mesh.position.z;
      if (Math.sqrt(dx * dx + dz * dz) <= this.range) {
        enemy.takeDamage(this.damage * 0.5);
        break;
      }
    }
  }
}

export class CannonTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.3, bottomRadius: 0.42, height: 0.9, color: 0x885522, range: 2.0, damage: 20 });
  }

  protected override onDamageDealt(target: Enemy): void {
    target.applySlowEffect(1.0, 0.5);
  }
}
```

---

### `src/main.ts`

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EventEmitter } from './EventEmitter';
import type { Tile, WaveConfig, TowerType, EnemyType, GameState } from './types';
import { Enemy, BasicEnemy, ArmoredEnemy, FastEnemy } from './entities/Enemy';
import { Tower, BasicTower, SniperTower, CannonTower } from './entities/Tower';

const gameEvents = new EventEmitter();

// --- Wave Data ---

const WAVES: WaveConfig[] = [
  { enemyCount: 3, spawnInterval: 2.0, enemySpeed: 1.5, enemyType: 'basic'   },
  { enemyCount: 6, spawnInterval: 0.9, enemySpeed: 2.0, enemyType: 'fast'    },
  { enemyCount: 4, spawnInterval: 2.5, enemySpeed: 1.8, enemyType: 'armored' },
];

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

const PATH: Array<{ row: number; col: number }> = [
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 2 }, { row: 3, col: 2 },
  { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 },
  { row: 5, col: 5 },
  { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 },
];

const ENEMY_Y = 0.35;

const WORLD_PATH: THREE.Vector3[] = PATH.map(({ row, col }) =>
  new THREE.Vector3(GRID_OFFSET_X + col * TILE_SIZE, ENEMY_Y, GRID_OFFSET_Z + row * TILE_SIZE)
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

// --- Overlay ---

const overlayEl = document.createElement('div');
overlayEl.style.position = 'absolute';
overlayEl.style.inset = '0';
overlayEl.style.display = 'none';
overlayEl.style.flexDirection = 'column';
overlayEl.style.alignItems = 'center';
overlayEl.style.justifyContent = 'center';
overlayEl.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
overlayEl.style.color = 'white';
overlayEl.style.fontFamily = 'monospace';
overlayEl.style.textAlign = 'center';
overlayEl.style.pointerEvents = 'none';
overlayEl.style.whiteSpace = 'pre';
container.appendChild(overlayEl);

// --- Scene ---

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 10, 8);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

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
    const geometry = new THREE.PlaneGeometry(TILE_SIZE - TILE_GAP, TILE_SIZE - TILE_GAP);
    const material = new THREE.MeshStandardMaterial({
      color: (row + col) % 2 === 0 ? COLOR_TILE_LIGHT : COLOR_TILE_DARK,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.x = GRID_OFFSET_X + col * TILE_SIZE;
    mesh.position.z = GRID_OFFSET_Z + row * TILE_SIZE;
    scene.add(mesh);

    const tile: Tile = { row, col, walkable: true, occupied: false, mesh, material };
    mesh.userData['tile'] = tile;
    grid[row][col] = tile;
  }
}

for (const { row, col } of PATH) {
  const tile = grid[row][col];
  tile.walkable = false;
  tile.material.color.setHex(COLOR_PATH);
}

// --- State ---

const towers: Tower[] = [];
const enemies: Enemy[] = [];
let activeTowerType: TowerType = 'basic';
let lives = 10;
let gameState: GameState = 'playing';
let score = 0;

let currentWaveIndex = -1;
let waveActive = false;
let enemiesSpawnedThisWave = 0;
let spawnTimer = 0;

// --- Tower Logic ---

function placeTower(tile: Tile): void {
  let tower: Tower;
  if (activeTowerType === 'basic')        tower = new BasicTower(tile);
  else if (activeTowerType === 'sniper')  tower = new SniperTower(tile);
  else                                    tower = new CannonTower(tile);
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

function spawnEnemy(speed: number, type: EnemyType): void {
  let enemy: Enemy;
  if (type === 'basic')        enemy = new BasicEnemy(WORLD_PATH, speed);
  else if (type === 'fast')    enemy = new FastEnemy(WORLD_PATH, speed);
  else                         enemy = new ArmoredEnemy(WORLD_PATH, speed);
  enemies.push(enemy);
  scene.add(enemy.mesh);
}

// --- Wave Logic ---

function updateWaveSpawner(deltaTime: number): void {
  if (!waveActive) return;
  const wave = WAVES[currentWaveIndex];
  spawnTimer += deltaTime;

  if (spawnTimer >= wave.spawnInterval && enemiesSpawnedThisWave < wave.enemyCount) {
    spawnTimer -= wave.spawnInterval;
    spawnEnemy(wave.enemySpeed, wave.enemyType);
    enemiesSpawnedThisWave++;
    gameEvents.emit('waveProgress', { spawned: enemiesSpawnedThisWave, total: wave.enemyCount });
  }

  const allSpawned = enemiesSpawnedThisWave >= wave.enemyCount;
  const allCleared = enemies.length === 0;

  if (allSpawned && allCleared) {
    waveActive = false;
    gameEvents.emit('waveComplete', currentWaveIndex);
    if (currentWaveIndex >= WAVES.length - 1 && lives > 0 && gameState === 'playing') {
      gameState = 'won';
      gameEvents.emit('gameWon', score);
    }
  }
}

function startNextWave(): void {
  if (waveActive) return;
  if (currentWaveIndex >= WAVES.length - 1) return;
  currentWaveIndex++;
  waveActive = true;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;
  gameEvents.emit('waveStarted', currentWaveIndex);
}

function resetGame(): void {
  for (let i = towers.length - 1; i >= 0; i--) {
    towers[i].tile.occupied = false;
    towers[i].dispose(scene);
  }
  towers.length = 0;

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].dispose(scene);
  }
  enemies.length = 0;

  lives = 10; score = 0;
  currentWaveIndex = -1; waveActive = false;
  enemiesSpawnedThisWave = 0; spawnTimer = 0;
  gameState = 'playing';
  hideOverlay();
  updateHUD();
}

// --- HUD ---

const typeNames: Record<EnemyType, string> = { basic: 'Basic', fast: 'Fast', armored: 'Armored' };

function updateHUD(): void {
  const typeLabel =
    activeTowerType === 'basic'  ? 'Basic [1]'  :
    activeTowerType === 'sniper' ? 'Sniper [2]' : 'Cannon [3]';

  let waveLabel: string;
  if (currentWaveIndex < 0) {
    waveLabel = 'Press Space to start';
  } else if (waveActive) {
    const wave = WAVES[currentWaveIndex];
    const remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length;
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + '/' + WAVES.length +
                '  [' + typeNames[wave.enemyType] + ']  Enemies: ' + remaining;
  } else if (currentWaveIndex >= WAVES.length - 1) {
    waveLabel = 'All waves complete!';
  } else {
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + ' complete — Space for next';
  }

  hudEl.textContent =
    waveLabel + '  |  Score: ' + score +
    '  |  Towers: ' + towers.length +
    '  |  ' + typeLabel + '  |  Lives: ' + lives;
}

function showOverlay(title: string, subtitle: string): void {
  overlayEl.style.fontSize = '48px';
  overlayEl.textContent = title + '\n\n' + subtitle + '\n\nScore: ' + score + '\n\nPress R to play again';
  overlayEl.style.display = 'flex';
}

function hideOverlay(): void { overlayEl.style.display = 'none'; }

gameEvents.on('towerPlaced',   () => updateHUD());
gameEvents.on('towerRemoved',  () => updateHUD());
gameEvents.on('typeChanged',   () => updateHUD());
gameEvents.on('waveStarted',   () => updateHUD());
gameEvents.on('waveComplete',  () => updateHUD());
gameEvents.on('waveProgress',  () => updateHUD());
gameEvents.on('enemyKilled',   () => updateHUD());

gameEvents.on('livesChanged', () => {
  updateHUD();
  if (lives <= 0 && gameState === 'playing') {
    gameState = 'gameover';
    gameEvents.emit('gameOver', score);
  }
});

gameEvents.on('gameOver', () => showOverlay('GAME OVER', 'Better luck next time'));
gameEvents.on('gameWon',  () => showOverlay('YOU WIN',   'All enemies defeated'));

updateHUD();

// --- Raycaster ---

const raycaster = new THREE.Raycaster();
let mouseDownX = 0;
let mouseDownY = 0;

renderer.domElement.addEventListener('mousedown', (event) => {
  mouseDownX = event.clientX;
  mouseDownY = event.clientY;
});

renderer.domElement.addEventListener('click', (event) => {
  if (gameState !== 'playing') return;
  const dx = event.clientX - mouseDownX;
  const dy = event.clientY - mouseDownY;
  if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) return;

  const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
  const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

  const hits = raycaster.intersectObjects(grid.flat().map((t) => t.mesh));
  if (hits.length === 0) return;

  const tile = hits[0].object.userData['tile'] as Tile;
  if (!tile.walkable) return;
  if (tile.occupied) removeTower(tile);
  else               placeTower(tile);
});

window.addEventListener('keydown', (event) => {
  if (event.key === '1' && gameState === 'playing') { activeTowerType = 'basic';  gameEvents.emit('typeChanged', activeTowerType); }
  if (event.key === '2' && gameState === 'playing') { activeTowerType = 'sniper'; gameEvents.emit('typeChanged', activeTowerType); }
  if (event.key === '3' && gameState === 'playing') { activeTowerType = 'cannon'; gameEvents.emit('typeChanged', activeTowerType); }
  if (event.key === ' ') { event.preventDefault(); if (gameState === 'playing') startNextWave(); }
  if (event.key === 'r' || event.key === 'R') resetGame();
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
  if (gameState !== 'playing') return;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(deltaTime);
    if (enemy.done) {
      enemy.dispose(scene);
      enemies.splice(i, 1);
      if (enemy.escaped) {
        lives = Math.max(0, lives - 1);
        gameEvents.emit('livesChanged', lives);
      } else {
        const points = Math.round(enemy.speed * 30 + enemy.maxHealth * 0.5);
        score += points;
        gameEvents.emit('enemyKilled', { points, score });
      }
    }
  }

  for (const tower of towers) {
    tower.update(deltaTime, enemies);
  }

  updateWaveSpawner(deltaTime);
}

function render(): void { renderer.render(scene, camera); }

function animate(): void {
  requestAnimationFrame(animate);
  const rawDelta = clock.getDelta();
  update(Math.min(rawDelta, MAX_DELTA));
  render();
}

animate();
```

---

> **Lab 18 Preview:** All the angle brackets you have been reading — `Array<Tower>`, `Map<string, Array<EventCallback>>`, `Record<EnemyType, string>` — are generics. Lab 18 explains what they mean and shows how to write your own. You will write a `findNearest<T>` utility function that works for any object with a `mesh`, eliminating the repeated distance loop in `Tower.update()`. Then you will write a `Stack<T>` class and use it to add Ctrl+Z undo for tower placement.
