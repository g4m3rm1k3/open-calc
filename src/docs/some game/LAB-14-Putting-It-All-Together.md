# TypeScript — LAB 14 — Putting It All Together

**Prerequisites:** LABs 08–13 (the full TypeScript series). You know: all primitive types, interfaces, typed arrays, generics, function types, union types, type guards, exhaustiveness checking.

**What this lab adds:**
- TypeScript `import` / `export` — splitting code into typed modules
- Converting the complete LAB 07 Asteroids game to TypeScript
- Resolving every type error the compiler finds — a real-world refactoring workflow
- A `tsconfig.json` tuned for canvas game development

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Why would you split a large TypeScript file into multiple files? What problem does splitting solve?
> 2. The `canvas.getContext('2d')` function returns `CanvasRenderingContext2D | null` — not just `CanvasRenderingContext2D`. Why might it return `null`, and how should you handle it?
> 3. `Math.random()` always returns a `number`. The canvas `width` and `height` are always `number`. Would TypeScript find any errors in the LAB 07 game logic, or would everything pass?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The complete Asteroids game from LAB 07 — with Observer pattern, Strategy pattern, FSM, splitting asteroids, score, lives — fully converted to TypeScript across four files:

```
src/
  types.ts       — all interfaces and type aliases (Ship, Bullet, Asteroid, GameState...)
  constants.ts   — all game constants (typed)
  game.ts        — all game logic (typed functions, Observer, Strategy)
  main.ts        — entry point (canvas setup, game loop)
dist/
  (compiled JS — browser loads these)
index.html       — loads dist/main.js
```

After conversion: `npx tsc` produces zero errors. The game plays identically to LAB 07.

---

## Concept: Modules — `import` and `export`

**What it is:** A system for splitting TypeScript (and JavaScript) code across multiple files. A **module** is any file that uses `import` or `export`. Values, functions, types, and interfaces can be exported from one file and imported into another.

**The problem before (one giant file):**
```ts
// main.ts — 800 lines, everything in one file
interface Ship { ... }
interface Bullet { ... }
interface Asteroid { ... }
type GameState = ...;
const SHIP_SIZE = 15;
// ... 800 more lines
// Problems:
// - Impossible to navigate — everything is global
// - Can't reuse interfaces in tests or other projects
// - Two developers editing the same file = conflicts
```

**The solution — modules:**
```ts
// types.ts — only type definitions
export interface Ship { x: number; y: number; angle: number; vx: number; vy: number; }
export type GameState = 'title' | 'playing' | 'paused' | 'gameOver';

// game.ts — imports and uses the types
import { Ship, GameState } from './types';
// The { Ship, GameState } syntax: named imports — take exactly these exports

function moveShip(ship: Ship): void { ... }
```

**The `export` keyword:**
```ts
// Named exports — exported by name, imported by name:
export const SHIP_SIZE = 15;       // export a constant
export interface Ship { ... }      // export an interface
export function fireBullet() { ... } // export a function
export type GameState = ...;       // export a type alias

// Default export — one per file, imported without braces:
export default function main() { ... }
// import main from './main'; // imported without {}
```

**The `import` syntax:**
```ts
// Named imports — must match the export names exactly:
import { Ship, Bullet, GameState } from './types';
//       ^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^
//       what you want               where to find it

// Rename on import (if names conflict):
import { Ship as ShipEntity } from './types';

// Import everything as a namespace:
import * as Types from './types';
Types.Ship; Types.GameState; // access via namespace
```

**What it hides:**
Modules hide the need for globally unique names across all files. The invariant: **names in one module cannot accidentally conflict with names in another** — each file has its own scope, and only explicitly exported names are accessible from outside.

**Canonical example:**
```ts
// math-utils.ts:
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
export const PI = Math.PI;

// game.ts:
import { clamp, PI } from './math-utils';
const angle = clamp(rawAngle, 0, PI * 2);
```

**Project Application (The "Why" here):**
The LAB 07 codebase has three distinct concerns: type definitions (interfaces, type aliases), constants (game balance values), and logic (functions). Separating them into files means: changing a type shows exactly which functions need updating (TypeScript reports errors in `game.ts` when `types.ts` changes), and constants can be tuned without touching logic.

**Why it matters here:** Every professional TypeScript project uses modules. Understanding `import`/`export` is not optional — it's how all non-trivial TypeScript is structured.

**Watch for:** Module paths start with `./` or `../` for local files. `from './types'` means "the file `types.ts` in the same directory." Without `./`, TypeScript looks for an installed npm package. Getting this wrong produces "Cannot find module" errors.

---

## Step 1 — Create the Project Structure

Create a new folder: **`asteroids-typescript`**. Inside it:

```bash
mkdir asteroids-typescript
cd asteroids-typescript
npm init -y
npm install typescript --save-dev
mkdir src dist
```

Create **`tsconfig.json`**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noEmitOnError": false,
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src/**/*"]
}
```

**New options explained:**

```json
"module": "ES2020"
```
Use ES modules (`import`/`export`) rather than older CommonJS (`require`/`module.exports`). Required for `import` to work in the browser.

```json
"rootDir": "./src"
```
All source files must be inside `src/`. TypeScript rejects imports from outside.

```json
"lib": ["ES2020", "DOM"]
```
Include type definitions for the browser DOM — this gives TypeScript types for `canvas`, `document`, `window`, `HTMLCanvasElement`, `CanvasRenderingContext2D`, and all other browser APIs. Without `"DOM"`, TypeScript doesn't know `document` or `canvas` exist.

**Create `index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Asteroid Field — TypeScript</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #000; }
    #game-canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="game-canvas"></canvas>
  <script type="module" src="./dist/main.js"></script>
  <!--
    type="module" is required for ES module imports to work in the browser.
    Without it, the browser treats the script as a classic (non-module) script
    and 'import' statements cause errors.
  -->
</body>
</html>
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```

**Expected:** No errors (no source files yet — clean state).

---

## Step 2 — Create `src/types.ts`

This file contains all interfaces and type aliases. Everything is exported.

Create **`src/types.ts`**:

```ts
// types.ts — all game type definitions
// Every interface and type alias used across the game lives here.

// ─── Union Type Aliases ───────────────────────────────────────────────────────
export type GameState    = 'title' | 'playing' | 'paused' | 'gameOver';
export type AsteroidTier = 'large' | 'medium' | 'small';
export type ChildTier    = AsteroidTier | null;

// ─── Entity Interfaces ────────────────────────────────────────────────────────
export interface Ship {
  x:     number;
  y:     number;
  angle: number; // radians
  vx:    number;
  vy:    number;
}

export interface Bullet {
  x:        number;
  y:        number;
  vx:       number;
  vy:       number;
  lifetime: number; // frames remaining
}

export interface Asteroid {
  x:      number;
  y:      number;
  radius: number;
  vx:     number;
  vy:     number;
  tier:   AsteroidTier; // was: string — now union type
  moveFn: MoveFn;       // strategy function — see below

  // Orbit strategy data (large asteroids):
  orbitCentreX?: number;
  orbitCentreY?: number;
  orbitAngle?:   number;
  orbitSpeed?:   number;
  orbitRadius?:  number;

  // Sine-wave strategy data (small asteroids):
  phase?: number;
}

// ─── Movement Strategy Function Type ─────────────────────────────────────────
export type MoveFn = (asteroid: Asteroid) => void;
// A movement strategy is a function that receives an Asteroid and modifies it.
// Each tier stores its own MoveFn — see constants.ts.

// ─── Tier Configuration ───────────────────────────────────────────────────────
export interface TierData {
  readonly radius:     number;
  readonly childTier:  ChildTier;
  readonly childCount: number;
  readonly speed:      number;
  readonly moveFn:     MoveFn;
}

// ─── Observer / Event System ──────────────────────────────────────────────────
export type AsteroidHitCallback = (asteroid: Asteroid) => void;
export type ShipHitCallback     = ()                   => void;

// ─── Game State Container ─────────────────────────────────────────────────────
export interface GameData {
  ship:            Ship;
  asteroids:       Asteroid[];
  bullets:         Bullet[];
  spawnQueue:      Asteroid[];
  gameState:       GameState;
  score:           number;
  highScore:       number;
  lives:           number;
  canFire:         boolean;
  flashFrames:     number;
  invincibleFrames: number;
}
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```

**Expected:** No errors. The types file compiles cleanly.

---

## Step 3 — Create `src/constants.ts`

Create **`src/constants.ts`**:

```ts
// constants.ts — all game balance and configuration values

import type { TierData, AsteroidTier } from './types';
// 'import type' — imports ONLY the type, not any runtime value.
// This is a TypeScript-only syntax: tells the compiler this import
// is purely for type checking and produces no output in the compiled JS.

// ─── Ship ─────────────────────────────────────────────────────────────────────
export const SHIP_SIZE:       number = 15;
export const SHIP_COLOR:      string = '#ffffff';
export const EXHAUST_COLOR:   string = '#ff6600';
export const ROTATION_SPEED:  number = 0.05;  // radians per frame
export const THRUST_FORCE:    number = 0.15;  // velocity per frame while thrusting
export const DRAG:            number = 0.99;  // velocity multiplier per frame
export const MAX_SHIP_SPEED:  number = 6;     // pixels per frame

// ─── Bullets ──────────────────────────────────────────────────────────────────
export const BULLET_SPEED:    number = 8;
export const BULLET_RADIUS:   number = 3;
export const BULLET_LIFETIME: number = 90;    // frames
export const BULLET_COLOR:    string = '#ffff00';

// ─── Asteroids ────────────────────────────────────────────────────────────────
export const ASTEROID_COUNT:     number = 5;
export const ASTEROID_MIN_SPEED: number = 0.3;
export const ASTEROID_MAX_SPEED: number = 1.2;
export const SAFE_SPAWN_DISTANCE: number = 120;

// ─── Movement strategy constants ──────────────────────────────────────────────
export const SINE_AMPLITUDE:  number = 1.5;
export const SINE_FREQUENCY:  number = 0.08;

// ─── Scoring ──────────────────────────────────────────────────────────────────
export const SCORE_TABLE: Record<AsteroidTier, number> = {
  large:  20,
  medium: 50,
  small:  100,
};
// Record<AsteroidTier, number>: an object where EVERY key is an AsteroidTier
// and every value is a number. TypeScript checks all three keys are present.

// ─── Visual ───────────────────────────────────────────────────────────────────
export const BG_COLOR:       string = '#000000';
export const ASTEROID_COLOR: string = '#aaaaaa';
export const TITLE_COLOR:    string = '#44ff88';
export const SUBTITLE_COLOR: string = '#aaaaaa';

// ─── Note: ASTEROID_TIERS is defined in game.ts, not here ────────────────────
// It references the movement strategy functions, which must be defined first.
// Circular dependency would occur if constants.ts tried to import from game.ts.
// The rule: constants.ts has no game-logic imports.
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```

**Expected:** No errors. Note the `Record<AsteroidTier, number>` type — TypeScript checks that all three tier keys are present. Remove `small: 100` temporarily and verify the error.

---

## Concept: `Record<K, V>` — Typed Object Maps

**What it is:** A built-in generic type for objects where every key is type `K` and every value is type `V`. TypeScript checks both the key names and the value types.

**The problem before:**
```ts
const scoreTable = { large: 20, medium: 50, small: 100 };
// TypeScript infers this as { large: number; medium: number; small: number }
// This works but doesn't enforce that ALL AsteroidTier keys are present.
// Missing 'small'? TypeScript shrugs.
```

**The solution:**
```ts
const scoreTable: Record<AsteroidTier, number> = {
  large:  20,
  medium: 50,
  small:  100,
  // Removing any of these: TypeScript error — key missing
  // Adding 'huge': TypeScript error — key not in AsteroidTier
};
```

**Smallest possible example:**
```ts
type Direction = 'north' | 'south' | 'east' | 'west';
const moves: Record<Direction, [number, number]> = {
  north: [0, -1],
  south: [0,  1],
  east:  [1,  0],
  west:  [-1, 0],
};
// All four directions required. Values are [x, y] tuples.
```

**Why it matters here:** `SCORE_TABLE` must have an entry for every asteroid tier. `Record<AsteroidTier, number>` ensures this — if a new tier is added to the union, TypeScript immediately flags that `SCORE_TABLE` is missing the new tier's score.

---

## Step 4 — Create `src/game.ts`

This is the largest file — all game logic. We'll build it in sections, each with a SAVE AND TRY.

### Step 4a — Imports and Movement Strategies

Create **`src/game.ts`**:

```ts
// game.ts — all game logic

import {
  Ship, Bullet, Asteroid, GameData, GameState, AsteroidTier,
  TierData, MoveFn, AsteroidHitCallback, ShipHitCallback,
} from './types';

import {
  SHIP_SIZE, ROTATION_SPEED, THRUST_FORCE, DRAG, MAX_SHIP_SPEED,
  BULLET_SPEED, BULLET_RADIUS, BULLET_LIFETIME,
  ASTEROID_COUNT, ASTEROID_MIN_SPEED, ASTEROID_MAX_SPEED,
  SAFE_SPAWN_DISTANCE, SINE_AMPLITUDE, SINE_FREQUENCY,
  SCORE_TABLE,
} from './constants';

// ─── Movement Strategies ──────────────────────────────────────────────────────
// Each function satisfies the MoveFn type: (asteroid: Asteroid) => void

export const driftMovement: MoveFn = (asteroid: Asteroid): void => {
  asteroid.x += asteroid.vx;
  asteroid.y += asteroid.vy;
};

export const orbitMovement: MoveFn = (asteroid: Asteroid): void => {
  asteroid.orbitAngle = (asteroid.orbitAngle ?? 0) + (asteroid.orbitSpeed ?? 0);
  // ?? 0: if orbitAngle is undefined (shouldn't be for large asteroids), default to 0
  // TypeScript requires null-checking because orbitAngle is optional on Asteroid
  const centreX = asteroid.orbitCentreX ?? asteroid.x;
  const centreY = asteroid.orbitCentreY ?? asteroid.y;
  const radius  = asteroid.orbitRadius  ?? 50;
  asteroid.x = centreX + Math.cos(asteroid.orbitAngle) * radius;
  asteroid.y = centreY + Math.sin(asteroid.orbitAngle) * radius;
};

export const sineWaveMovement: MoveFn = (asteroid: Asteroid): void => {
  asteroid.x    += asteroid.vx;
  asteroid.y    += asteroid.vy;
  asteroid.phase = (asteroid.phase ?? 0) + SINE_FREQUENCY;
  asteroid.y    += Math.sin(asteroid.phase) * SINE_AMPLITUDE;
};
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```

**Expected:** No errors. The `?? 0` patterns handle the optional properties — TypeScript requires these because `orbitAngle` is `number | undefined` on the `Asteroid` interface.

---

### Step 4b — Tier Table and `assertNever`

Add to **`src/game.ts`**:

```ts
// ─── Exhaustiveness helper ────────────────────────────────────────────────────
export function assertNever(value: never): never {
  throw new Error('Unhandled case: ' + JSON.stringify(value));
}

// ─── Asteroid Tier Table ──────────────────────────────────────────────────────
export const ASTEROID_TIERS: Record<AsteroidTier, TierData> = {
  large:  { radius: 40, childTier: 'medium', childCount: 2, speed: 0.8, moveFn: orbitMovement },
  medium: { radius: 22, childTier: 'small',  childCount: 2, speed: 1.4, moveFn: driftMovement },
  small:  { radius: 12, childTier: null,      childCount: 0, speed: 2.0, moveFn: sineWaveMovement },
};
// Record<AsteroidTier, TierData>: all three tiers required — TypeScript enforces it.
// Adding a tier to the union without updating this table: compile error.
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```

**Expected:** No errors.

---

### Step 4c — Observer Event System

Add to **`src/game.ts`**:

```ts
// ─── Observer Event System ────────────────────────────────────────────────────

const asteroidHitCallbacks: AsteroidHitCallback[] = [];
const shipHitCallbacks:     ShipHitCallback[]     = [];
// Typed arrays of callbacks — push() only accepts correctly-typed functions

export function onAsteroidHit(callback: AsteroidHitCallback): void {
  asteroidHitCallbacks.push(callback);
}

export function onShipHit(callback: ShipHitCallback): void {
  shipHitCallbacks.push(callback);
}

export function emitAsteroidHit(asteroid: Asteroid): void {
  for (const callback of asteroidHitCallbacks) {
    callback(asteroid); // TypeScript: callback is (Asteroid) => void ✓
  }
}

export function emitShipHit(): void {
  for (const callback of shipHitCallbacks) {
    callback(); // TypeScript: callback is () => void ✓
  }
}
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```

**Expected:** No errors.

---

### Step 4d — Core Game Logic Functions

Add to **`src/game.ts`**:

```ts
// ─── Collision Detection ──────────────────────────────────────────────────────
export function circlesOverlap(
  ax: number, ay: number, ar: number,
  bx: number, by: number, br: number
): boolean {
  const dx = bx - ax;
  const dy = by - ay;
  return (dx * dx + dy * dy) < (ar + br) * (ar + br);
}

export function isSafeToSpawn(x: number, y: number, ship: Ship): boolean {
  const dx = x - ship.x;
  const dy = y - ship.y;
  return (dx * dx + dy * dy) > SAFE_SPAWN_DISTANCE * SAFE_SPAWN_DISTANCE;
}

// ─── Spawn Functions ──────────────────────────────────────────────────────────
export function createAsteroid(
  canvasWidth:  number,
  canvasHeight: number
): Asteroid {
  const tierData = ASTEROID_TIERS['large'];
  const angle    = Math.random() * Math.PI * 2;
  const speed    = ASTEROID_MIN_SPEED + Math.random() * (ASTEROID_MAX_SPEED - ASTEROID_MIN_SPEED);
  const x        = Math.random() * canvasWidth;
  const y        = Math.random() * canvasHeight;

  return {
    x, y,
    radius: tierData.radius,
    tier:   'large',
    vx:     Math.cos(angle) * speed,
    vy:     Math.sin(angle) * speed,
    moveFn: tierData.moveFn,
    orbitCentreX: x, orbitCentreY: y,
    orbitAngle: angle, orbitSpeed: (Math.random() - 0.5) * 0.02,
    orbitRadius: 40 + Math.random() * 60,
  };
}

export function createChildAsteroid(parent: Asteroid, childTier: AsteroidTier): Asteroid {
  const childTierData = ASTEROID_TIERS[childTier];
  const parentAngle   = Math.atan2(parent.vy, parent.vx);
  const spreadAngle   = parentAngle + (Math.random() - 0.5) * Math.PI;

  return {
    x:      parent.x,
    y:      parent.y,
    radius: childTierData.radius,
    tier:   childTier,
    vx:     Math.cos(spreadAngle) * childTierData.speed,
    vy:     Math.sin(spreadAngle) * childTierData.speed,
    moveFn: childTierData.moveFn,
    orbitCentreX: parent.x, orbitCentreY: parent.y,
    orbitAngle: spreadAngle, orbitSpeed: (Math.random() - 0.5) * 0.02,
    orbitRadius: 10 + Math.random() * 30,
    phase: Math.random() * Math.PI * 2,
  };
}

export function fireBullet(ship: Ship): Bullet {
  return {
    x:        ship.x,
    y:        ship.y,
    vx:       Math.cos(ship.angle) * BULLET_SPEED,
    vy:       Math.sin(ship.angle) * BULLET_SPEED,
    lifetime: BULLET_LIFETIME,
  };
}
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```

**Expected:** No errors.

---

### Step 4e — Update and Collision Logic

Add to **`src/game.ts`**:

```ts
// ─── Game Update Logic ────────────────────────────────────────────────────────

export function updateShip(ship: Ship, keys: Record<string, boolean>): void {
  if (keys['ArrowLeft'])  ship.angle -= ROTATION_SPEED;
  if (keys['ArrowRight']) ship.angle += ROTATION_SPEED;
  ship.angle = ((ship.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  if (keys['ArrowUp']) {
    ship.vx += Math.cos(ship.angle) * THRUST_FORCE;
    ship.vy += Math.sin(ship.angle) * THRUST_FORCE;
  }
  ship.vx *= DRAG;
  ship.vy *= DRAG;

  const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
  if (speed > MAX_SHIP_SPEED) {
    ship.vx = (ship.vx / speed) * MAX_SHIP_SPEED;
    ship.vy = (ship.vy / speed) * MAX_SHIP_SPEED;
  }
}

export function updateBullets(
  bullets:      Bullet[],
  canvasWidth:  number,
  canvasHeight: number
): Bullet[] {
  for (const bullet of bullets) {
    bullet.x        += bullet.vx;
    bullet.y        += bullet.vy;
    bullet.lifetime -= 1;
  }
  return bullets.filter(b =>
    b.lifetime > 0 &&
    b.x > 0 && b.x < canvasWidth &&
    b.y > 0 && b.y < canvasHeight
  );
}

export function checkBulletAsteroidCollisions(
  bullets:   Bullet[],
  asteroids: Asteroid[]
): { survivingBullets: Bullet[]; hitAsteroids: Asteroid[] } {
  // Return type: an object with two arrays — survivors and victims
  const hitIndices      = new Set<number>();
  const survivingBullets: Bullet[] = [];

  for (const bullet of bullets) {
    let hit = false;
    for (let ai = 0; ai < asteroids.length; ai++) {
      if (circlesOverlap(
        bullet.x, bullet.y, BULLET_RADIUS,
        asteroids[ai].x, asteroids[ai].y, asteroids[ai].radius
      )) {
        hitIndices.add(ai);
        hit = true;
        break;
      }
    }
    if (!hit) survivingBullets.push(bullet);
  }

  const hitAsteroids = asteroids.filter((_, i) => hitIndices.has(i));
  return { survivingBullets, hitAsteroids };
}

export function splitAsteroid(
  asteroid:   Asteroid,
  spawnQueue: Asteroid[]
): void {
  const tierData = ASTEROID_TIERS[asteroid.tier];
  if (tierData.childTier === null) return;

  const childTier = tierData.childTier; // narrowed: AsteroidTier (not null)
  for (let i = 0; i < tierData.childCount; i++) {
    spawnQueue.push(createChildAsteroid(asteroid, childTier));
  }
}
```

### SAVE AND TRY

```bash
npx tsc --noEmit
```

**Expected:** No errors. Notice `Set<number>` — the generic type for `Set` ensures we only add numbers to it.

---

## Step 5 — Create `src/main.ts`

Create **`src/main.ts`**:

```ts
// main.ts — entry point: canvas setup, event wiring, game loop

import {
  Ship, Bullet, Asteroid, GameState, GameData,
} from './types';

import {
  SHIP_SIZE, SHIP_COLOR, EXHAUST_COLOR, BG_COLOR,
  BULLET_RADIUS, BULLET_COLOR, ASTEROID_COLOR,
  TITLE_COLOR, SUBTITLE_COLOR, SCORE_TABLE,
} from './constants';

import {
  updateShip, updateBullets, checkBulletAsteroidCollisions,
  splitAsteroid, fireBullet, createAsteroid, isSafeToSpawn,
  onAsteroidHit, onShipHit, emitAsteroidHit, emitShipHit,
  circlesOverlap, assertNever,
} from './game';

// ─── Canvas Setup ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
// 'as HTMLCanvasElement': type assertion — we KNOW this element is a canvas.
// document.getElementById returns 'HTMLElement | null' — we narrow it here.
// (LAB note: 'as' is TypeScript's type assertion operator — it tells the compiler
//  "trust me, I know the specific type." Use sparingly — only when YOU know
//  more than TypeScript does.)

const ctx = canvas.getContext('2d');
if (ctx === null) {
  throw new Error('Could not get 2D context — canvas not supported');
}
// canvas.getContext('2d') returns CanvasRenderingContext2D | null.
// After this null check, TypeScript narrows ctx to CanvasRenderingContext2D.
// The throw ensures ctx is never null below — TypeScript understands this.

// ─── Input State ──────────────────────────────────────────────────────────────
const keys: Record<string, boolean> = {};
// Record<string, boolean>: a dictionary where any string key maps to boolean.
// This is the correct type for the key-state tracking pattern.

document.addEventListener('keydown', (event: KeyboardEvent) => {
  keys[event.key] = true;
  event.preventDefault();
  if (event.key === ' ' && data.canFire && data.gameState === 'playing') {
    data.bullets.push(fireBullet(data.ship));
    data.canFire = false;
  }
  if (event.key === 'Enter') {
    if (data.gameState === 'title' || data.gameState === 'gameOver') {
      startNewGame();
    } else if (data.gameState === 'paused') {
      data.gameState = 'title';
    }
  }
  if (event.key === 'p' || event.key === 'P') {
    if (data.gameState === 'playing') data.gameState = 'paused';
    else if (data.gameState === 'paused') data.gameState = 'playing';
  }
});

document.addEventListener('keyup', (event: KeyboardEvent) => {
  keys[event.key] = false;
  if (event.key === ' ') data.canFire = true;
});

// ─── Game Data ────────────────────────────────────────────────────────────────
const initialShip: Ship = { x: 0, y: 0, angle: 0, vx: 0, vy: 0 };

const data: GameData = {
  ship:             initialShip,
  asteroids:        [],
  bullets:          [],
  spawnQueue:       [],
  gameState:        'title',
  score:            0,
  highScore:        parseInt(localStorage.getItem('asteroidHighScore') ?? '0', 10),
  lives:            3,
  canFire:          true,
  flashFrames:      0,
  invincibleFrames: 0,
};

// ─── Canvas Resize ────────────────────────────────────────────────────────────
function resizeCanvas(): void {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  data.ship.x   = canvas.width  / 2;
  data.ship.y   = canvas.height / 2;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── Game Management ──────────────────────────────────────────────────────────
function startNewGame(): void {
  data.ship             = { x: canvas.width / 2, y: canvas.height / 2, angle: 0, vx: 0, vy: 0 };
  data.asteroids        = [];
  data.bullets          = [];
  data.spawnQueue       = [];
  data.score            = 0;
  data.lives            = 3;
  data.flashFrames      = 0;
  data.invincibleFrames = 0;
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    data.asteroids.push(createAsteroid(canvas.width, canvas.height));
  }
  data.gameState = 'playing';
}

// ─── Observer Subscribers ────────────────────────────────────────────────────
onAsteroidHit((asteroid: Asteroid) => {
  splitAsteroid(asteroid, data.spawnQueue);
});

onAsteroidHit((asteroid: Asteroid) => {
  data.score += SCORE_TABLE[asteroid.tier];
});

onAsteroidHit(() => {
  data.flashFrames = Math.max(data.flashFrames, 10);
});

onShipHit(() => {
  data.ship.x = canvas.width / 2; data.ship.y = canvas.height / 2;
  data.ship.vx = 0; data.ship.vy = 0; data.ship.angle = 0;
  data.flashFrames      = 20;
  data.invincibleFrames = 180;
  data.lives -= 1;
  if (data.lives <= 0) {
    if (data.score > data.highScore) {
      data.highScore = data.score;
      localStorage.setItem('asteroidHighScore', data.highScore.toString());
    }
    data.gameState = 'gameOver';
  }
});

// ─── Update ───────────────────────────────────────────────────────────────────
function update(): void {
  if (data.gameState !== 'playing') return;

  if (data.invincibleFrames > 0) data.invincibleFrames -= 1;
  if (data.flashFrames      > 0) data.flashFrames      -= 1;

  updateShip(data.ship, keys);

  for (const asteroid of data.asteroids) {
    asteroid.moveFn(asteroid);
    asteroid.x = (asteroid.x + canvas.width)  % canvas.width;
    asteroid.y = (asteroid.y + canvas.height) % canvas.height;
  }

  data.bullets = updateBullets(data.bullets, canvas.width, canvas.height);

  const { survivingBullets, hitAsteroids } = checkBulletAsteroidCollisions(
    data.bullets, data.asteroids
  );
  data.bullets   = survivingBullets;
  data.asteroids = data.asteroids.filter(a => !hitAsteroids.includes(a));
  for (const hit of hitAsteroids) emitAsteroidHit(hit);

  if (data.invincibleFrames === 0) {
    for (const asteroid of data.asteroids) {
      if (circlesOverlap(data.ship.x, data.ship.y, SHIP_SIZE,
                         asteroid.x, asteroid.y, asteroid.radius)) {
        emitShipHit();
        break;
      }
    }
  }

  if (data.spawnQueue.length > 0) {
    const candidate = data.spawnQueue[0];
    if (isSafeToSpawn(candidate.x, candidate.y, data.ship)) {
      data.spawnQueue.shift();
      data.asteroids.push(candidate);
    }
  }

  if (data.asteroids.length === 0 && data.spawnQueue.length === 0) {
    startNewGame();
  }

  data.ship.x = (data.ship.x + canvas.width)  % canvas.width;
  data.ship.y = (data.ship.y + canvas.height) % canvas.height;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderPlaying(): void {
  for (const asteroid of data.asteroids) {
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
    ctx.strokeStyle = ASTEROID_COLOR;
    ctx.lineWidth   = 2;
    ctx.stroke();
  }
  for (const bullet of data.bullets) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, BULLET_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = BULLET_COLOR;
    ctx.fill();
  }
  const shipVisible = data.invincibleFrames === 0 || (data.invincibleFrames % 12) < 6;
  if (shipVisible) {
    if (keys['ArrowUp']) {
      ctx.save();
      ctx.translate(data.ship.x, data.ship.y);
      ctx.rotate(data.ship.angle);
      ctx.beginPath();
      ctx.moveTo(-SHIP_SIZE, 0);
      ctx.lineTo(-SHIP_SIZE - SHIP_SIZE * (0.5 + Math.random() * 0.5), 0);
      ctx.strokeStyle = EXHAUST_COLOR;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(data.ship.x, data.ship.y);
    ctx.rotate(data.ship.angle);
    ctx.beginPath();
    ctx.moveTo(SHIP_SIZE, 0);
    ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE * 0.6);
    ctx.lineTo(-SHIP_SIZE,  SHIP_SIZE * 0.6);
    ctx.closePath();
    ctx.fillStyle = SHIP_COLOR;
    ctx.fill();
    ctx.restore();
  }
  ctx.font = '20px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('Score: '  + data.score, 20, 40);
  ctx.fillText('Lives: '  + data.lives, 20, 70);
}

function renderTitle(): void {
  ctx.textAlign = 'center';
  ctx.font = '56px monospace';
  ctx.fillStyle = TITLE_COLOR;
  ctx.fillText('ASTEROID FIELD', canvas.width / 2, canvas.height / 2 - 60);
  ctx.font = '22px monospace';
  ctx.fillStyle = SUBTITLE_COLOR;
  ctx.fillText('Press ENTER to play', canvas.width / 2, canvas.height / 2);
  if (data.highScore > 0) {
    ctx.font = '18px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('High Score: ' + data.highScore, canvas.width / 2, canvas.height / 2 + 50);
  }
  ctx.textAlign = 'left';
}

function renderPaused(): void {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.font = '48px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  ctx.textAlign = 'left';
}

function renderGameOver(): void {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.font = '56px monospace';
  ctx.fillStyle = '#ff4444';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);
  ctx.font = '28px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Score: ' + data.score, canvas.width / 2, canvas.height / 2);
  ctx.font = '20px monospace';
  ctx.fillStyle = SUBTITLE_COLOR;
  ctx.fillText('Press ENTER to play again', canvas.width / 2, canvas.height / 2 + 50);
  ctx.textAlign = 'left';
}

function render(): void {
  ctx.fillStyle = data.flashFrames > 0 ? '#222244' : BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  switch (data.gameState) {
    case 'title':
      renderTitle();
      break;
    case 'playing':
      renderPlaying();
      break;
    case 'paused':
      renderPlaying();
      renderPaused();
      break;
    case 'gameOver':
      renderPlaying();
      renderGameOver();
      break;
    default:
      assertNever(data.gameState);
      // Exhaustiveness check — if a new GameState is added without a case,
      // TypeScript errors here: "not assignable to parameter of type 'never'"
  }
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function loop(): void {
  update();
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

### SAVE AND TRY

```bash
npx tsc
```

**Expected:** Zero errors. Every file compiles cleanly.

```bash
ls dist/
```

**Expected:** `constants.js`, `game.js`, `main.js`, `types.js` — one output file per source file.

Open `index.html` in a browser that supports ES modules (any modern browser — or use `npx serve .` to run a local server).

**You should see:** The full Asteroids game — title screen, playing, paused, game over — all working exactly as LAB 07.

---

## Step 6 — Verify TypeScript Is Actually Helping

Let's confirm the type system is actively protecting us.

**Test 1 — Wrong game state:**

In `main.ts`, add temporarily:
```ts
data.gameState = 'manu'; // typo
```

**Expected:**
```
error TS2322: Type '"manu"' is not assignable to type 'GameState'.
```
Remove it.

**Test 2 — Missing bullet property:**

In `game.ts`, in `fireBullet`, remove `lifetime` from the return:
```ts
return {
  x: ship.x, y: ship.y,
  vx: Math.cos(ship.angle) * BULLET_SPEED,
  vy: Math.sin(ship.angle) * BULLET_SPEED,
  // lifetime removed
};
```

**Expected:**
```
error TS2741: Property 'lifetime' is missing in type '...' but required in type 'Bullet'.
```
Restore it.

**Test 3 — Wrong callback type in Observer:**

In `main.ts`, add a wrong subscriber:
```ts
onAsteroidHit((ship: Ship) => { // Ship instead of Asteroid
  console.log(ship.angle);
});
```

**Expected:**
```
error TS2345: Argument of type '(ship: Ship) => void' is not assignable to parameter of type 'AsteroidHitCallback'.
```
Remove it.

**Test 4 — Missing switch case:**

In `main.ts`'s `render` function, delete `case 'paused':` entirely.

**Expected:**
```
error TS2345: Argument of type '"paused"' is not assignable to parameter of type 'never'.
```
The exhaustiveness check caught the missing case. Restore it.

---

## 🎯 Challenge: Add a `'levelSelect'` State

**You know:** Union types, exhaustiveness checking, the FSM, module imports/exports.

**Task:** Add a `'levelSelect'` state to the `GameState` type in `types.ts`. Then fix EVERY compile error this introduces across all files. Implement a minimal `renderLevelSelect()` in `main.ts` that shows "Choose difficulty: 1 = Easy, 2 = Hard" centred on screen. Wire `'1'` keypress to start an easy game (`ASTEROID_COUNT = 3`) and `'2'` to start a hard game (`ASTEROID_COUNT = 8`).

**Hint:** You'll need a mutable `currentAsteroidCount` variable in `main.ts`. Change `startNewGame()` to use this variable instead of the constant directly.

Try for at least 10 minutes — this is a real architecture exercise.

---

<details>
<summary>▶ Show Solution outline</summary>

```ts
// 1. In types.ts:
export type GameState = 'title' | 'playing' | 'paused' | 'gameOver' | 'levelSelect';

// 2. TypeScript will immediately flag every switch missing 'levelSelect':
//    - render() in main.ts — add case 'levelSelect': renderLevelSelect(); break;
//    That's the only exhaustive switch on GameState — one fix required.

// 3. In main.ts — add renderLevelSelect:
function renderLevelSelect(): void {
  ctx.textAlign = 'center';
  ctx.font = '36px monospace';
  ctx.fillStyle = TITLE_COLOR;
  ctx.fillText('SELECT DIFFICULTY', canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = '24px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('1 — Easy (3 asteroids)', canvas.width / 2, canvas.height / 2 + 10);
  ctx.fillText('2 — Hard (8 asteroids)', canvas.width / 2, canvas.height / 2 + 50);
  ctx.textAlign = 'left';
}

// 4. Add transition from title to levelSelect:
// In keydown handler — ENTER from title:
if (data.gameState === 'title') data.gameState = 'levelSelect'; // was: startNewGame()

// 5. Wire 1 and 2 keys in keydown:
if (data.gameState === 'levelSelect') {
  if (event.key === '1') { currentAsteroidCount = 3; startNewGame(); }
  if (event.key === '2') { currentAsteroidCount = 8; startNewGame(); }
}

// 6. In startNewGame — use currentAsteroidCount:
let currentAsteroidCount = ASTEROID_COUNT; // starts at default
// In startNewGame loop: for (let i = 0; i < currentAsteroidCount; i++)
```

**Key insight:** The exhaustiveness check in `render`'s switch was the ONLY thing TypeScript required you to fix. Every other change was voluntary — adding the level select screen, wiring the keys. TypeScript's role was: "you added a new state; here is exactly where you forgot to handle it." One error, one location, zero hunting.

</details>

---

## Series Complete: What TypeScript Added

Look at what changed between the plain JavaScript in LAB 07 and the TypeScript in LAB 14:

| Category | Before (JS) | After (TS) |
|---|---|---|
| Entity types | Inferred from first use | `Ship`, `Bullet`, `Asteroid` interfaces |
| Game state | `let gameState: string` | `let gameState: GameState` — 4 valid values only |
| Asteroid tier | `asteroid.tier: string` | `asteroid.tier: AsteroidTier` — 3 valid values only |
| Wrong state | Silent runtime bug | Compile error with line number |
| Missing Bullet property | `undefined` at runtime | Compile error naming the property |
| Wrong callback type | Silent type mismatch | Compile error in Observer subscriber |
| Missing switch case | Invisible gap | `assertNever` compile error |
| Empty array type | `never[]` or `any[]` | `Bullet[]`, `Asteroid[]` |
| Movement strategy fn | `any` function | `MoveFn = (asteroid: Asteroid) => void` |
| Score table | Any object | `Record<AsteroidTier, number>` — all keys required |

**Every type error TypeScript catches is a bug that would have been:**
- A silent wrong value (NaN, undefined)
- An invisible typo in a string
- A property access on the wrong entity type
- A forgotten switch case

You'd have found each one eventually — in the browser, while playing, after debugging. TypeScript moved them to the editor, with the exact line number and a clear description.

---

## Final Check

| Feature | How to verify |
|---|---|
| Project compiles with zero errors | `npx tsc` → no output (silence = success) |
| Four files output | `ls dist/` → constants.js, game.js, main.js, types.js |
| Game plays correctly | Open index.html → full Asteroids game functional |
| Title/pause/game over FSM works | All states accessible from the game |
| Wrong game state caught | `data.gameState = 'manu'` → immediate error |
| Missing switch case caught | Delete any case in render() switch → assertNever error |
| Wrong Observer callback caught | Push wrong function type → error naming the mismatch |
| `Record<AsteroidTier, number>` enforced | Remove a tier from SCORE_TABLE → error: key missing |
| Canvas context null check | `ctx === null` check before use → no TypeScript error after check |

---

## Quick Check Answers

**1. Why would you split a large TypeScript file into multiple files?**

Three reasons. First, separation of concerns: `types.ts` only defines shapes, `constants.ts` only holds values, `game.ts` only contains logic — each file has one job. Second, when `types.ts` changes, TypeScript immediately reports errors in every file that imports and uses those types — you get a complete list of what needs updating. Third, multiple developers can edit `game.ts` and `main.ts` simultaneously without conflicting. The single-file approach becomes unmanageable at ~300 lines; the module approach scales to millions of lines.

**2. Why might `canvas.getContext('2d')` return `null`?**

In some browser environments — hardware acceleration disabled, very old browsers, some server-side rendering contexts — the 2D canvas context is unavailable. The browser returns `null` rather than throwing an error. TypeScript's `lib: ["DOM"]` includes the accurate type signature `getContext(contextId: "2d"): CanvasRenderingContext2D | null`, which forces you to handle `null`. In practice this almost never happens in modern browsers, but TypeScript requires the check because it can't know your deployment environment. The `if (ctx === null) throw new Error(...)` pattern is the correct response: crash loudly at startup rather than silently later when `ctx.fillRect` fails.

**3. Would TypeScript find any errors in the LAB 07 game logic?**

Yes — several. The most significant: `let bullets = []` becomes `never[]`, breaking every `bullets.push(...)`. `let asteroids: any[] = []` silently allows wrong-type pushes that TypeScript would catch with `Asteroid[]`. `asteroid.moveFn(asteroid)` on an untyped asteroid — `moveFn` could be `any`, so TypeScript would allow calling it with wrong arguments. `gameState = 'manu'` (any typo) passes without error. The `switch(gameState)` has no exhaustiveness guarantee. `SCORE_TABLE[asteroid.tier]` with `tier: string` has no guarantee the key exists. TypeScript doesn't just catch obvious mistakes — it finds subtle structural mismatches that are easy to miss in a 400-line file.

---

*End of LAB 14. End of TypeScript Series.*

---

## TypeScript Series Complete

You've converted a complete game codebase from untyped JavaScript to fully typed TypeScript. Here's what the series taught:

| Lab | Topic | Core Skill |
|---|---|---|
| 08 | What TypeScript Is | Compile vs runtime, first type error |
| 09 | Primitive Types | 7 primitives, null/undefined, any/unknown, inference |
| 10 | Objects & Interfaces | Structural typing, optional/readonly properties |
| 11 | Arrays & Generics | `T[]`, `Array<T>`, `<T extends Constraint>` |
| 12 | Functions | Parameter/return types, void, optional params, callback types |
| 13 | Union Types & Guards | Literal unions, narrowing, exhaustiveness |
| 14 | Full Conversion | Modules, import/export, zero-error codebase |

**What's next:** Series 3 will be Algorithms & Data Structures — building Snake (for linked lists), a sorting visualiser (for comparison algorithms), and a maze game (for pathfinding with A*). Every algorithm becomes visible, interactive, and playable.
