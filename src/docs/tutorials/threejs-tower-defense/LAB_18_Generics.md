# Lab 18 — Generics

## Quick Check

Answer these before you start. Check your answers at the bottom of the lab.

1. You have written `Array<Tower>`, `Map<string, Callback>`, and `Record<EnemyType, string>` in earlier labs. What do the angle brackets mean?
2. What does `<T>` declare in `function findNearest<T>(...)`?
3. Why does `<T extends { mesh: THREE.Mesh }>` include the `extends` part?
4. TypeScript says `const x = findNearest(enemies, pos, range)`. Did you have to write `findNearest<Enemy>(...)` explicitly?
5. What is the difference between `new Stack<Enemy>()` and `new Stack<Tower>()`?

---

## What You Will Build

Right now `Tower.update()` contains a manual distance loop that finds the nearest living enemy. You are going to extract that logic into a reusable generic function called `findNearest<T>` and put it in a new file `src/utils.ts`. Once the function exists, you will also simplify `SniperTower.onKill()` with it.

After that you will write a `Stack<T>` generic class in the same file and use it in `main.ts` to record every tower placement. Pressing **Ctrl+Z** will remove the most recently placed tower.

New files touched this lab:

```
src/
├── utils.ts          ← NEW — findNearest<T> and Stack<T>
├── entities/
│   └── Tower.ts      ← updated — uses findNearest
└── main.ts           ← updated — Stack, undoStack, Ctrl+Z
```

No new visual feature until Step 7. Steps 1–6 are pure refactor and class work that leave the game looking identical.

---

## Concept: The Angle Brackets You Have Already Been Writing

Every time you wrote `Array<Tower>`, TypeScript slotted `Tower` into the Array definition as its element type. The angle bracket is a **type argument** — you are filling in a blank that the definition left open.

```
Array<Tower>
      ^^^^^
      type argument — fills in the T blank inside Array's definition
```

The built-in `Array<T>`, `Map<K, V>`, and `Record<K, V>` were written by the TypeScript team using generics. You can write your own the same way.

The letter `T` is just a convention (short for "Type"). You could write `U`, `Item`, or anything else. `T` is used everywhere because it is short.

---

## Step 1: Create `src/utils.ts`

You are creating a new file. Start with just the Three.js import.

**src/utils.ts — starting skeleton:**

```typescript
import * as THREE from 'three';
```

That is the entire file for now.

**SAVE AND TRY**
Open your terminal and run `tsc --noEmit`. No errors. The file compiles fine even though it is empty — TypeScript only checks what is there.

---

## Concept: Generic Functions

A generic function declares a **type parameter** in angle brackets right after the function name:

```typescript
function wrap<T>(value: T): T[] {
  return [value];
}
```

When you call `wrap(42)`, TypeScript sees that `value` is `number`, so it fills `T = number` automatically. The return type becomes `number[]`. You never had to write `wrap<number>(42)` — TypeScript inferred it.

The problem with `<T>` alone is that it means "absolutely any type". Inside the function you cannot call any methods on `T` because TypeScript does not know what type it will be at runtime. If you try to access `.mesh` on a plain `<T>`, TypeScript will refuse.

**Constraints** solve this. `extends` after the type parameter acts as a requirement:

```typescript
function findNearest<T extends { mesh: THREE.Mesh }>(
  candidates: T[],
  origin: THREE.Vector3,
  range: number
): T | null
```

This says: "T can be any type at all, **as long as it has a `mesh` property of type `THREE.Mesh`**." Inside the function you can now safely write `candidate.mesh.position` — TypeScript knows the constraint guarantees it exists.

Both `Enemy` and `Tower` have a `mesh` property, so both would satisfy this constraint. The function works for either.

---

## Step 2: Write `findNearest<T>` in `src/utils.ts`

Add the full function to the file you just created.

**src/utils.ts:**

```typescript
import * as THREE from 'three';

// ---- findNearest -------------------------------------------------------

export function findNearest<T extends { mesh: THREE.Mesh }>(
  candidates: T[],
  origin: THREE.Vector3,
  range: number
): T | null {
```

`export` makes the function importable elsewhere.  
`<T extends { mesh: THREE.Mesh }>` is the type parameter with its constraint.  
`candidates: T[]` is the list to search — could be `Enemy[]`, `Tower[]`, or anything with a mesh.  
`origin` is the point to measure distance from.  
`range` is the maximum distance we care about.  
Return type `T | null` means we hand back either the nearest candidate or nothing.

```typescript
  let target: T | null = null;
  let closest = range;
```

`target` starts empty. `closest` starts at `range` — this is the same trick as before: any candidate farther than `range` will never become the target because `dist < closest` will never be true for it.

```typescript
  for (const c of candidates) {
    const dx = c.mesh.position.x - origin.x;
    const dz = c.mesh.position.z - origin.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < closest) {
      closest = dist;
      target = c;
    }
  }
```

Standard nearest-search loop. Because of the constraint, `c.mesh.position` is safe.

```typescript
  return target;
}
```

Complete `src/utils.ts` so far:

```typescript
import * as THREE from 'three';

export function findNearest<T extends { mesh: THREE.Mesh }>(
  candidates: T[],
  origin: THREE.Vector3,
  range: number
): T | null {
  let target: T | null = null;
  let closest = range;
  for (const c of candidates) {
    const dx = c.mesh.position.x - origin.x;
    const dz = c.mesh.position.z - origin.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < closest) {
      closest = dist;
      target = c;
    }
  }
  return target;
}
```

**SAVE AND TRY**
Run `tsc --noEmit`. Zero errors. The function is written but nothing imports it yet so the game is unchanged.

---

## Step 3: Use `findNearest` in `Tower.ts`

Open `src/entities/Tower.ts`. You are making two changes: adding an import and replacing two distance loops.

**Change 1 — add the import** at the top of the file, after the existing imports:

```typescript
import { findNearest } from '../utils';
```

The path goes up one directory (`..`) to reach `src/`, then into `utils`.

**Change 2 — replace the targeting loop in `Tower.update()`.**

Find the current `update()` method. It contains a `for` loop that walks `activeEnemies`, skips `enemy.done`, calculates distance, and tracks `closestDist`. Remove that entire loop and the `target`/`closestDist` declarations. Replace with two lines:

```typescript
update(deltaTime: number, activeEnemies: Enemy[]): void {
  const aliveEnemies = activeEnemies.filter(e => !e.done);
  const target = findNearest(aliveEnemies, this.mesh.position, this.range);
  if (!target) return;
  target.takeDamage(this.damage * deltaTime);
  this.onDamageDealt(target);
  if (target.done) {
    this.onKill(target, activeEnemies);
  }
}
```

`filter(e => !e.done)` removes dead enemies before passing to `findNearest`.  
TypeScript infers `T = Enemy` from `aliveEnemies: Enemy[]` — no angle brackets needed at the call site.

**Change 3 — simplify `SniperTower.onKill()`.**

The sniper's `onKill` also has a manual distance loop. It can use `findNearest` too, filtering out the just-killed target and any dead enemies:

```typescript
protected override onKill(target: Enemy, allEnemies: Enemy[]): void {
  const candidates = allEnemies.filter(e => e !== target && !e.done);
  const nearest = findNearest(candidates, target.mesh.position, this.range);
  if (nearest) {
    nearest.takeDamage(this.damage * 0.5);
  }
}
```

**SAVE AND TRY**
Run `tsc --noEmit`. No errors. Start the game. Place towers, start waves. Enemies still get damaged and killed — behavior is identical. The refactor is complete.

---

## Concept: Generic Classes

A class can have a type parameter the same way a function can:

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}
```

`T` is available to every method in the class.  
`push` accepts only a `T`.  
`pop` returns either a `T` or `undefined` (the array might be empty).

When you create an instance, you provide the type argument:

```typescript
const s = new Stack<number>();
s.push(1);          // fine
s.push('hello');    // TypeScript error — wrong type
```

`Stack<number>` and `Stack<string>` are completely separate types even though they share the same class definition. This is exactly like how `Array<number>` and `Array<string>` are separate.

---

## Step 4: Add `Stack<T>` to `src/utils.ts`

Open `src/utils.ts` and add the class below `findNearest`. The class needs six members.

```typescript
// ---- Stack -------------------------------------------------------------

export class Stack<T> {
  private items: T[] = [];
```

The private array holds all items. No one outside the class can reach it directly.

```typescript
  push(item: T): void {
    this.items.push(item);
  }
```

Add one item to the top.

```typescript
  pop(): T | undefined {
    return this.items.pop();
  }
```

Remove and return the top item. Returns `undefined` if the stack is empty (Array.pop() behaves this way).

```typescript
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
```

Read the top item without removing it.

```typescript
  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }
```

`get` makes these read-only properties rather than method calls. You write `stack.isEmpty` not `stack.isEmpty()`.

```typescript
  clear(): void {
    this.items = [];
  }
}
```

`clear()` replaces the array with a new empty one. This will be called when the game resets.

**SAVE AND TRY**
Run `tsc --noEmit`. Zero errors. Nothing imports `Stack` yet.

---

## Step 5: Add `PlacementRecord` and `undoStack` to `main.ts`

Open `src/main.ts`. You are adding four small things in this step.

**Change 1 — add the import** at the top of the file, after the other imports:

```typescript
import { Stack } from './utils';
```

**Change 2 — define the record type.** Add this just before the line that creates `gameEvents`:

```typescript
interface PlacementRecord {
  tile: Tile;
  tower: Tower;
}
```

This interface lives in `main.ts` because nothing else needs it. Each record stores the tile (so you can mark it unoccupied on undo) and the tower (so you can remove it from the scene).

`Tile` is already imported from `./types`. `Tower` is the abstract base class — you need to add it to the Tower import line. Find:

```typescript
import { BasicTower, SniperTower, CannonTower } from './entities/Tower';
```

Change it to:

```typescript
import { BasicTower, SniperTower, CannonTower, type Tower } from './entities/Tower';
```

The `type` keyword before `Tower` tells TypeScript this import is only used as a type annotation, not as a runtime value (you never call `new Tower()`).

**Change 3 — create the stack.** Add this line right after `PlacementRecord`:

```typescript
const undoStack = new Stack<PlacementRecord>();
```

**Change 4 — push when a tower is placed.** Find the `placeTower` function. Near its end, after `towers.push(tower)`, add:

```typescript
undoStack.push({ tile, tower });
```

**SAVE AND TRY**
Run `tsc --noEmit`. Zero errors. Start the game, place towers. They still appear normally. The undo stack is growing silently — but pressing Ctrl+Z does nothing yet.

---

## Step 6: Write `undoLastPlacement`

Add this function to `main.ts`. Place it right after `placeTower`:

```typescript
function undoLastPlacement(): void {
  if (undoStack.isEmpty) return;
```

Guard: if nothing was placed, there is nothing to undo.

```typescript
  const record = undoStack.pop()!;
```

`pop()` returns `T | undefined`. The `!` after the call is a **non-null assertion** — you are telling TypeScript "I already checked `isEmpty`, so this is definitely not undefined." Only use `!` when you have genuinely verified the value exists, as here.

```typescript
  scene.remove(record.tower.mesh);
  record.tile.occupied = false;
  const idx = towers.indexOf(record.tower);
  if (idx !== -1) towers.splice(idx, 1);
  gameEvents.emit('towerRemoved', towers.length);
}
```

`scene.remove` takes the tower's mesh off the scene.  
Setting `tile.occupied = false` lets the player place a new tower on that tile again.  
`indexOf` finds the position in the array; `splice` removes it.  
`emit('towerRemoved', ...)` updates the HUD via the observer.

**SAVE AND TRY**
Run `tsc --noEmit`. No errors. The function exists but nothing calls it yet.

---

## Step 7: Wire Ctrl+Z in the Keydown Handler

Find the `keydown` event listener in `main.ts`. It currently handles digit keys (`1`, `2`, `3`), spacebar, and `r`/`R`. Add this block inside the handler, after the existing cases:

```typescript
if ((event.key === 'z' || event.key === 'Z') && event.ctrlKey) {
  event.preventDefault();
  if (gameState === 'playing') undoLastPlacement();
}
```

`event.ctrlKey` is `true` when Ctrl is held.  
`event.preventDefault()` stops the browser from doing its own Ctrl+Z (undo in the text cursor, etc.).  
The `gameState` guard keeps undo from running during game-over or win screens.

**SAVE AND TRY**

1. Start the game in the browser.
2. Place three towers.
3. Press **Ctrl+Z** once. The most recently placed tower disappears. The tile is empty again and can be clicked.
4. Press **Ctrl+Z** again. The second tower disappears.
5. Keep pressing until all towers are gone. Nothing crashes when the stack is empty.

---

## Step 8: Clear the Undo Stack on Reset

Find `resetGame()` in `main.ts`. It already removes all towers and enemies and resets state variables. Add one line at the end of the function body:

```typescript
undoStack.clear();
```

**SAVE AND TRY**

1. Place a few towers.
2. Press **R** to reset.
3. Press **Ctrl+Z**. Nothing happens — the stack was cleared, which is correct. Undoing into the previous session makes no sense after a full reset.

---

## Challenges

**Challenge 1 — Show undo hint in HUD**

Update `updateHUD()` so it appends `Ctrl+Z: undo (N)` to the status line when `undoStack.size > 0`, or `nothing to undo` when the stack is empty. Use `undoStack.size` and `undoStack.isEmpty`.

<details>
<summary>Solution</summary>

In `updateHUD()`, find where the HUD string is built. Add a line:

```typescript
const undoHint = undoStack.isEmpty
  ? 'Ctrl+Z: nothing to undo'
  : `Ctrl+Z: undo (${undoStack.size} move${undoStack.size === 1 ? '' : 's'})`;
```

Include `undoHint` in the string assigned to `hudDiv.textContent`.

</details>

---

**Challenge 2 — Limit undo history to 5 moves**

Add an optional `maxSize` parameter to `Stack<T>`. When `push` is called and `items.length` already equals `maxSize`, remove the oldest item from the bottom of the array before pushing the new one, so the stack never grows beyond the limit.

<details>
<summary>Solution</summary>

```typescript
export class Stack<T> {
  private items: T[] = [];
  private readonly maxSize: number;

  constructor(maxSize = Infinity) {
    this.maxSize = maxSize;
  }

  push(item: T): void {
    if (this.items.length >= this.maxSize) {
      this.items.shift();   // remove oldest from bottom
    }
    this.items.push(item);
  }
  // rest unchanged
}
```

Then change the declaration in `main.ts`:

```typescript
const undoStack = new Stack<PlacementRecord>(5);
```

</details>

---

**Challenge 3 — Typed event data**

The `EventEmitter` from Lab 10 uses `unknown` for event data. Create a generic `TypedEventEmitter<EventMap extends Record<string, unknown>>` class where the `emit` and `on` methods enforce that the data type matches the event name. For example:

```typescript
type GameEvents = {
  towerPlaced: number;
  livesChanged: number;
  gameOver: number;
  gameWon: number;
};

const gameEvents = new TypedEventEmitter<GameEvents>();
gameEvents.emit('towerPlaced', 'oops');  // TypeScript error — should be number
```

<details>
<summary>Solution</summary>

```typescript
type TypedEventCallback<T> = (data: T) => void;

export class TypedEventEmitter<EventMap extends Record<string, unknown>> {
  private listeners = new Map<string, Array<TypedEventCallback<unknown>>>();

  on<K extends keyof EventMap>(
    eventName: K,
    callback: TypedEventCallback<EventMap[K]>
  ): void {
    const key = eventName as string;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback as TypedEventCallback<unknown>);
  }

  emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void {
    const key = eventName as string;
    if (!this.listeners.has(key)) return;
    this.listeners.get(key)!.forEach(cb => cb(data));
  }
}
```

`K extends keyof EventMap` constrains the event name to only keys that exist in the map. `EventMap[K]` looks up the corresponding data type.

</details>

---

## Quick Check Answers

1. Angle brackets pass a **type argument** to a generic type or function — they fill in the type placeholder `T` that the definition left open.
2. `<T>` **declares a type parameter** named T. T is a variable that holds a type rather than a value.
3. The `extends` constraint restricts what T can be. Without it, TypeScript refuses to let you access `.mesh` because T might be a `number` or a `string` that has no such property.
4. No. TypeScript **inferred** `T = Enemy` from the type of `enemies`. You only need to write the angle brackets manually when inference cannot determine the type.
5. `Stack<Enemy>` accepts only `Enemy` items. `Stack<Tower>` accepts only `Tower` items. Same class definition, two separate typed instances — pushing the wrong type into either is a compile error.

---

## Final Check

| Behaviour | Pass? |
|---|---|
| `tsc --noEmit` reports zero errors after each step | |
| `findNearest` is in `src/utils.ts` and exported | |
| `Tower.update()` uses `findNearest` instead of a manual loop | |
| `SniperTower.onKill()` uses `findNearest` instead of a manual loop | |
| `Stack<T>` is in `src/utils.ts` with push / pop / peek / isEmpty / size / clear | |
| Placing a tower pushes a `PlacementRecord` to `undoStack` | |
| Ctrl+Z removes the most recently placed tower from scene and frees its tile | |
| Pressing Ctrl+Z when the stack is empty does not crash | |
| Pressing R then Ctrl+Z does nothing (stack was cleared) | |
| Wave behaviour and enemy movement are unchanged | |

---

## Complete File Listings

### `src/utils.ts` (new file)

```typescript
import * as THREE from 'three';

export function findNearest<T extends { mesh: THREE.Mesh }>(
  candidates: T[],
  origin: THREE.Vector3,
  range: number
): T | null {
  let target: T | null = null;
  let closest = range;
  for (const c of candidates) {
    const dx = c.mesh.position.x - origin.x;
    const dz = c.mesh.position.z - origin.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < closest) {
      closest = dist;
      target = c;
    }
  }
  return target;
}

export class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  get size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}
```

---

### `src/entities/Tower.ts` (updated)

```typescript
import * as THREE from 'three';
import type { TowerConfig } from '../types';
import { Enemy } from './Enemy';
import { findNearest } from '../utils';

export interface TowerConfig {
  topRadius: number;
  bottomRadius: number;
  height: number;
  color: number;
  range: number;
  damage: number;
}

export abstract class Tower {
  readonly mesh: THREE.Mesh;
  protected readonly range: number;
  protected readonly damage: number;

  constructor(scene: THREE.Scene, position: THREE.Vector3, config: TowerConfig) {
    const geometry = new THREE.CylinderGeometry(
      config.topRadius,
      config.bottomRadius,
      config.height,
      8
    );
    const material = new THREE.MeshPhongMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.mesh.position.y = config.height / 2;
    scene.add(this.mesh);
    this.range = config.range;
    this.damage = config.damage;
  }

  update(deltaTime: number, activeEnemies: Enemy[]): void {
    const aliveEnemies = activeEnemies.filter(e => !e.done);
    const target = findNearest(aliveEnemies, this.mesh.position, this.range);
    if (!target) return;
    target.takeDamage(this.damage * deltaTime);
    this.onDamageDealt(target);
    if (target.done) {
      this.onKill(target, activeEnemies);
    }
  }

  protected onDamageDealt(_target: Enemy): void {}
  protected onKill(_target: Enemy, _allEnemies: Enemy[]): void {}
}

const BASIC_TOWER_CONFIG: TowerConfig = {
  topRadius: 0.25,
  bottomRadius: 0.35,
  height: 0.8,
  color: 0x228833,
  range: 2.5,
  damage: 25,
};

export class BasicTower extends Tower {
  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    super(scene, position, BASIC_TOWER_CONFIG);
  }
}

const SNIPER_TOWER_CONFIG: TowerConfig = {
  topRadius: 0.15,
  bottomRadius: 0.2,
  height: 1.2,
  color: 0x334488,
  range: 5.0,
  damage: 60,
};

export class SniperTower extends Tower {
  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    super(scene, position, SNIPER_TOWER_CONFIG);
  }

  protected override onKill(target: Enemy, allEnemies: Enemy[]): void {
    const candidates = allEnemies.filter(e => e !== target && !e.done);
    const nearest = findNearest(candidates, target.mesh.position, this.range);
    if (nearest) {
      nearest.takeDamage(this.damage * 0.5);
    }
  }
}

const CANNON_TOWER_CONFIG: TowerConfig = {
  topRadius: 0.3,
  bottomRadius: 0.42,
  height: 0.9,
  color: 0x885522,
  range: 2.0,
  damage: 20,
};

export class CannonTower extends Tower {
  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    super(scene, position, CANNON_TOWER_CONFIG);
  }

  protected override onDamageDealt(target: Enemy): void {
    target.applySlowEffect(1.0, 0.5);
  }
}
```

---

### `src/main.ts` (updated — diff summary)

The full file is long; shown here are the four insertions. Everything else stays the same as after Lab 17.

**New import (add to top with other imports):**

```typescript
import { Stack } from './utils';
```

**Updated Tower import (add `type Tower` inline):**

```typescript
import { BasicTower, SniperTower, CannonTower, type Tower } from './entities/Tower';
```

**New interface and stack (add before `const gameEvents`):**

```typescript
interface PlacementRecord {
  tile: Tile;
  tower: Tower;
}
const undoStack = new Stack<PlacementRecord>();
```

**Inside `placeTower` (add after `towers.push(tower)`):**

```typescript
undoStack.push({ tile, tower });
```

**New function (add after `placeTower`):**

```typescript
function undoLastPlacement(): void {
  if (undoStack.isEmpty) return;
  const record = undoStack.pop()!;
  scene.remove(record.tower.mesh);
  record.tile.occupied = false;
  const idx = towers.indexOf(record.tower);
  if (idx !== -1) towers.splice(idx, 1);
  gameEvents.emit('towerRemoved', towers.length);
}
```

**Inside `keydown` handler (add after the `r`/`R` block):**

```typescript
if ((event.key === 'z' || event.key === 'Z') && event.ctrlKey) {
  event.preventDefault();
  if (gameState === 'playing') undoLastPlacement();
}
```

**Inside `resetGame` (add at the end of the function body):**

```typescript
undoStack.clear();
```

---

## What Is Next

Lab 19 covers **async/await and the Fetch API**. Right now all game data — wave configs, path layout, and enemy stats — is hard-coded in `main.ts`. You will move that data into a JSON file (`game-data.json`), fetch it at startup with `fetch()` and `await`, and start the game only after the data loads. You will see what `Promise<T>` means, why functions marked `async` always return a Promise, and why `await` only works inside `async` functions.
