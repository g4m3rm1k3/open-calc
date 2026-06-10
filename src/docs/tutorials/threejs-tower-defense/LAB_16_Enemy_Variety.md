# TypeScript Tower Defense — LAB 16 — Enemy Variety

**Prerequisites:** Lab 15 complete. Three tower types with different abilities.

**What this lab adds:**
- `EnemyConfig` interface — the same config-object pattern used for towers, now for enemies
- `Enemy` becomes `abstract` — the same refactor as Lab 09, now applied to enemies
- `BasicEnemy`, `ArmoredEnemy`, `FastEnemy` — three concrete subclasses
- `EnemyType` — a string literal union for enemy names
- `WaveConfig` gains an `enemyType` field — each wave sends a specific enemy type
- `spawnEnemy` becomes a factory function — creates the right subclass based on type
- Updated score formula — harder enemies are worth more points

**Time:** 60–90 minutes.

---

## What You Will Build

```
  BasicEnemy          ArmoredEnemy          FastEnemy
  ────────────        ─────────────         ──────────
  Orange-red           Brown, large          Yellow, tiny
  Health: 100          Health: 200           Health: 50
  Speed: (wave)        Speed: 0.8× wave      Speed: 1.6× wave
  Score: ~100          Score: ~160           Score: ~175

Wave 1: 3 basic enemies  — learner wave
Wave 2: 6 fast enemies   — speed challenge
Wave 3: 4 armored enemies — health challenge
```

The same tower code handles all three types. No changes to `Tower.update()`, `onKill`, or `onDamageDealt` — the enemy polymorphism is invisible from the tower's perspective.

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 09, `Tower` became abstract because no tower should be "just a Tower" — every tower is a specific type. Does the same reasoning apply to `Enemy`?
> 2. `spawnEnemy` currently calls `new Enemy(WORLD_PATH, speed)`. After this lab, `Enemy` is abstract. What is the error you will see if you forget to update that call?
> 3. The score formula is currently `Math.round(enemy.speed * 50)`. An ArmoredEnemy has 200 health and a slow speed — it gives less score than a fast enemy but is harder to kill because it takes more damage. How would you update the formula to also reward health?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand What Changes and What Does Not

Before touching code, trace through what needs to change and what stays the same.

**What changes:**
- `Enemy` class gains an `EnemyConfig` parameter and becomes `abstract`
- Three concrete subclasses replace direct `new Enemy()` calls
- `WaveConfig` gets a new `enemyType` field
- `WAVES` data updated
- `spawnEnemy` becomes a factory

**What does NOT change:**
- `Tower.update()` — still calls `enemy.takeDamage()`, `enemy.done`, `enemy.escaped`
- `onKill` chain shot — still calls `enemy.takeDamage()`
- `onDamageDealt` slow — still calls `enemy.applySlowEffect()`
- The enemy loop in `update()` — still calls `enemy.update()` and reads `enemy.done`
- The backwards-loop removal pattern — unchanged

Every property and method that towers and the game loop interact with (`done`, `escaped`, `health`, `maxHealth`, `speed`, `mesh`, `slowTimer`, `takeDamage`, `update`, `dispose`) lives on the base `Enemy` class. Subclasses only change how the enemy is initialized — size, health, color. The behavior is inherited.

This is **polymorphism** in practice: code that was written to work with `Enemy` automatically works with `BasicEnemy`, `ArmoredEnemy`, and `FastEnemy` — because they are all `Enemy`.

---

### Concept: Factory Functions

A **factory function** is a function whose job is to decide which class to instantiate and return the result. It centralizes the "which type do I create?" logic in one place:

```ts
function createEnemy(type: EnemyType, path: THREE.Vector3[], speed: number): Enemy {
  if (type === 'basic')   return new BasicEnemy(path, speed);
  if (type === 'armored') return new ArmoredEnemy(path, speed);
  return new FastEnemy(path, speed);
}
```

Every caller gets an `Enemy` back. They do not need to know which subclass was created. When you add a fourth enemy type, you update the factory in one place, not every call site.

You have already seen a factory pattern implicitly in `placeTower` — it decides which tower class to construct based on `activeTowerType`. `spawnEnemy` is the same idea, but driven by wave data instead of player input.

---

## Step 2 — Add the `EnemyConfig` Interface

Find the `// --- Enemy ---` comment. Just before the `Enemy` class, add:

```ts
interface EnemyConfig {
  health: number;
  radius: number;
  color: number;
  speedMultiplier: number;
}
```

**Each field:**

`health: number`
Maximum (and starting) health for this enemy type. Replaces the hardcoded `maxHealth: number = 100` currently on `Enemy`.

`radius: number`
The sphere geometry radius. `0.3` for basic, `0.42` for armored (visibly larger), `0.2` for fast (visibly smaller).

`color: number`
The starting material color before any damage or slow effects.

`speedMultiplier: number`
A per-type modifier applied to the wave's base speed. `1.0` = full wave speed, `0.8` = slightly slower (armored), `1.6` = much faster (fast).

**Why `speedMultiplier` instead of a fixed speed?** Because waves define the base speed, and each enemy type scales it. An armored enemy in Wave 3 runs at `2.8 * 0.8 = 2.24` — fast enough to be threatening, but slower than a fast enemy in the same wave at `2.8 * 1.6 = 4.48`. The difficulty difference between types scales naturally with the wave.

> **SAVE AND TRY:** Interface declared. No errors. No visible change.

---

## Step 3 — Refactor the `Enemy` Constructor to Accept `EnemyConfig`

Find the `Enemy` class constructor:

```ts
  constructor(worldPath: THREE.Vector3[], speed: number) {
    this.worldPath = worldPath;
    this.speed = speed;

    const geometry = new THREE.SphereGeometry(0.3, 12, 8);
    this.material = new THREE.MeshStandardMaterial({ color: 0xff6600 });
    this.mesh = new THREE.Mesh(geometry, this.material);

    if (worldPath.length > 0) {
      this.mesh.position.copy(worldPath[0]);
    }
  }
```

Replace it with:

```ts
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
```

Also update the property declarations at the top of the class. Find:

```ts
  readonly maxHealth: number = 100;
  health: number = 100;
```

Change them to:

```ts
  readonly maxHealth: number;
  health: number;
```

The `= 100` default is removed because the values now come from the config.

**What changed:**

`speed: number * config.speedMultiplier`
The stored `speed` is the wave speed scaled by this enemy type's multiplier. The rest of the class uses `this.speed` as before — it does not need to know about the wave speed or the multiplier.

`this.maxHealth = config.health` / `this.health = config.health`
Both initialized from config. `maxHealth` is still `readonly` — set once in the constructor, never changed.

`new THREE.SphereGeometry(config.radius, 12, 8)`
Radius comes from config — armored enemies will be visibly larger, fast enemies smaller.

`new THREE.MeshStandardMaterial({ color: config.color })`
Starting color from config — each type has its own base color.

> **SAVE AND TRY:** TypeScript will now show an error on `new Enemy(WORLD_PATH, speed)` in `spawnEnemy` — the constructor requires a third argument. That is expected — you will fix it in Step 5 after the subclasses exist. Do not fix it yet. For now, confirm only one error appears (the missing argument) and no other errors.

---

## Step 4 — Make `Enemy` Abstract and Add the Three Subclasses

### 4a — Make `Enemy` abstract

Find:

```ts
class Enemy {
```

Change to:

```ts
abstract class Enemy {
```

TypeScript will now show an error anywhere you write `new Enemy(...)`. The one error in `spawnEnemy` from Step 3 is still the same call. No new errors should appear from the `abstract` change alone.

> **SAVE AND TRY:** Still one error (the `new Enemy()` call). No new errors from `abstract`. Confirming this tells you the rest of the class is intact.

---

### 4b — Add `BasicEnemy`

Directly after the closing `}` of the `Enemy` class, add:

```ts
class BasicEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, {
      health: 100,
      radius: 0.3,
      color: 0xff6600,
      speedMultiplier: 1.0,
    });
  }
}
```

This is identical to what `Enemy` used to produce with hardcoded values. It is the baseline.

> **SAVE AND TRY:** One error still exists (`spawnEnemy` calls `new Enemy`). The `BasicEnemy` class itself has no errors. No visible change yet.

---

### 4c — Add `ArmoredEnemy`

After `BasicEnemy`, add:

```ts
class ArmoredEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, {
      health: 200,
      radius: 0.42,
      color: 0x886644,
      speedMultiplier: 0.8,
    });
  }
}
```

**The design choices:**

`health: 200`
Double the basic enemy. Towers need twice as long to kill one — two towers covering the same area, or one tower with twice the exposure time.

`radius: 0.42`
Noticeably larger sphere. Players can visually identify armored enemies at a glance.

`color: 0x886644`
Earthy brown. Distinct from the orange-red of basic enemies.

`speedMultiplier: 0.8`
80% of the wave speed. At Wave 3's 2.8 base: `2.8 * 0.8 = 2.24` actual speed. Slower than basic in the same wave, which partially compensates for the higher health — they are in range longer.

> **SAVE AND TRY:** No new errors. One error still exists (spawnEnemy).

---

### 4d — Add `FastEnemy`

After `ArmoredEnemy`, add:

```ts
class FastEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, {
      health: 50,
      radius: 0.2,
      color: 0xffdd00,
      speedMultiplier: 1.6,
    });
  }
}
```

**The design choices:**

`health: 50`
Half the basic enemy. Towers kill them in two seconds instead of four. But they spend far less time in range.

`radius: 0.2`
Small sphere. They look quick and nimble. Visually distinguishable from the larger armored enemies.

`color: 0xffdd00`
Bright yellow. Stands out clearly against the brown path and green grid.

`speedMultiplier: 1.6`
160% of wave speed. Wave 2's base is 2.0: `2.0 * 1.6 = 3.2` actual speed. They sprint across the path faster than anything else. A sniper tower becomes valuable for picking them off at long range before they slip through.

> **SAVE AND TRY:** Three subclasses defined. One error remains: `spawnEnemy` calls `new Enemy()`. Fix that next.

---

## Step 5 — Update `WaveConfig` and `spawnEnemy`

### 5a — Add `EnemyType` and update `WaveConfig`

Find the `type TowerType` declaration. Add the new type nearby:

```ts
type EnemyType = 'basic' | 'armored' | 'fast';
```

Find the `WaveConfig` interface:

```ts
interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
}
```

Add the new field:

```ts
interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
  enemyType: EnemyType;
}
```

TypeScript will now show errors on every element of `WAVES` — they are missing the `enemyType` field. Fix that next.

---

### 5b — Update the `WAVES` data

Find `const WAVES`. Replace it entirely:

```ts
const WAVES: WaveConfig[] = [
  { enemyCount: 3, spawnInterval: 2.0, enemySpeed: 1.5, enemyType: 'basic'   },
  { enemyCount: 6, spawnInterval: 0.9, enemySpeed: 2.0, enemyType: 'fast'    },
  { enemyCount: 4, spawnInterval: 2.5, enemySpeed: 1.8, enemyType: 'armored' },
];
```

**Wave design:**

Wave 1 — `basic`, slow interval: learner wave. Same as before. Gives the player time to place towers before the real challenge.

Wave 2 — `fast`, fast interval, 6 enemies: a swarm of yellow sprinters. They run at `2.0 * 1.6 = 3.2` speed. Sniper towers earn their keep here. Cannons slow them but fast enemies spend very little time in range even when slowed.

Wave 3 — `armored`, slow interval, 4 enemies: a small squad of tough brown tanks. They move at `1.8 * 0.8 = 1.44` speed. Basic towers barely dent them. Snipers and cannons working together are needed.

> **SAVE AND TRY:** `WAVES` errors clear. One remaining error: `new Enemy()` in `spawnEnemy`.

---

### 5c — Convert `spawnEnemy` to a factory

Find `spawnEnemy`:

```ts
function spawnEnemy(speed: number = 2): void {
  const enemy = new Enemy(WORLD_PATH, speed);
  enemies.push(enemy);
  scene.add(enemy.mesh);
}
```

Replace it:

```ts
function spawnEnemy(speed: number, type: EnemyType): void {
  let enemy: Enemy;
  if (type === 'basic') {
    enemy = new BasicEnemy(WORLD_PATH, speed);
  } else if (type === 'fast') {
    enemy = new FastEnemy(WORLD_PATH, speed);
  } else {
    enemy = new ArmoredEnemy(WORLD_PATH, speed);
  }
  enemies.push(enemy);
  scene.add(enemy.mesh);
}
```

**What changed:**

`speed: number` — the default `= 2` is removed. `spawnEnemy` is always called with explicit values from the wave system now.

`type: EnemyType` — the new required parameter. The factory uses it to decide which class to instantiate.

`let enemy: Enemy` — typed as the abstract base class. The factory assigns a concrete subclass, but the declared type is `Enemy` — the code that follows (`enemies.push`, `scene.add`) does not need to know the specific subclass.

> **SAVE AND TRY:** The `new Enemy()` error is gone. All TypeScript errors should be clear at this point.

---

## Step 6 — Wire the Enemy Type into the Wave Spawner

Find `updateWaveSpawner`. The `spawnEnemy` call currently only passes speed:

```ts
    spawnEnemy(wave.enemySpeed);
```

Update it to also pass the enemy type:

```ts
    spawnEnemy(wave.enemySpeed, wave.enemyType);
```

One word added. The wave config now controls both speed and type — all the decision logic is in the data.

> **SAVE AND TRY:** This is the main moment. Start a wave. Wave 1 spawns orange-red basic enemies as before. Press Space after Wave 1 — Wave 2 spawns small yellow sprinters that visibly move faster. Press Space again — Wave 3 spawns large brown armored enemies that are noticeably slower and harder to kill.

---

## Step 7 — Update the Score Formula

The current formula is `Math.round(enemy.speed * 50)`. This is based on `enemy.speed` — which is already scaled by `speedMultiplier`. But it ignores health, which is the other axis of difficulty.

Find the score calculation in the enemy cleanup block inside `update()`:

```ts
        const points = Math.round(enemy.speed * 50);
```

Replace it:

```ts
        const points = Math.round(enemy.speed * 30 + enemy.maxHealth * 0.5);
```

**The new formula:**

`enemy.speed * 30` — rewards stopping fast enemies. A fast enemy at 3.2 speed earns 96 from this term.

`enemy.maxHealth * 0.5` — rewards killing tough enemies. An armored enemy with 200 health earns 100 from this term.

**Resulting scores:**
- BasicEnemy (speed 1.5, health 100): `1.5*30 + 100*0.5 = 45 + 50 = 95`
- FastEnemy (speed 3.2, health 50): `3.2*30 + 50*0.5 = 96 + 25 = 121`
- ArmoredEnemy (speed 1.44, health 200): `1.44*30 + 200*0.5 = 43 + 100 = 143`

Armored enemies are worth the most — they require the most resources to kill. Fast enemies reward skilled placement. Basic enemies are the baseline.

> **SAVE AND TRY:** Kill enemies from each wave and watch the score increment. Armored kills should give the largest jumps.

---

## Step 8 — Show Enemy Type in the HUD During a Wave

The player does not currently know what type is coming. Add the enemy type to the wave label in `updateHUD`.

Find the `waveActive` branch inside `updateHUD`:

```ts
  } else if (waveActive) {
    const wave = WAVES[currentWaveIndex];
    const remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length;
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + '/' + WAVES.length + '  Enemies: ' + remaining;
```

Update it:

```ts
  } else if (waveActive) {
    const wave = WAVES[currentWaveIndex];
    const remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length;
    const typeNames: Record<EnemyType, string> = {
      basic:   'Basic',
      fast:    'Fast',
      armored: 'Armored',
    };
    waveLabel =
      'Wave ' + (currentWaveIndex + 1) + '/' + WAVES.length +
      '  [' + typeNames[wave.enemyType] + ']' +
      '  Enemies: ' + remaining;
```

**What is `Record<EnemyType, string>`?**

`Record<K, V>` is a TypeScript utility type for an object where every key in `K` maps to a value of type `V`. `Record<EnemyType, string>` means: an object that has exactly the keys `'basic'`, `'fast'`, and `'armored'`, each mapping to a `string`.

This is safer than a plain `{}` because TypeScript checks exhaustiveness: if you add `'armored'` to `EnemyType` but forget to add it to the `typeNames` object, TypeScript errors. You cannot accidentally leave a key out.

`typeNames[wave.enemyType]`
Looks up the display name for the current wave's enemy type. Produces `'Basic'`, `'Fast'`, or `'Armored'`.

> **CSS AND SEE:** Save and check the browser. During a wave, the HUD should now show e.g. "Wave 2/3  [Fast]  Enemies: 4". The player knows what is coming before the enemies appear.

---

## Step 9 — Verify All Three Waves

Play through the complete game deliberately:

**Wave 1 — Basic:**
- Orange-red spheres, medium speed, medium size
- A pair of basic towers should handle it comfortably
- HUD shows `[Basic]`

**Wave 2 — Fast:**
- Yellow spheres, noticeably smaller and faster
- They slip through basic tower fire easily — try repositioning a sniper at long range to pick them off before they reach the bend
- Cannon slow makes them manageable: `3.2 * 0.5 = 1.6` slowed speed
- HUD shows `[Fast]`

**Wave 3 — Armored:**
- Brown spheres, visibly larger and slower
- A single sniper kills them in ~3.3 seconds; they spend ~2.5 seconds in range at that speed — close but not reliable
- Two overlapping towers (sniper + basic, or sniper + cannon slow) handle them cleanly
- HUD shows `[Armored]`

**Win condition:** Clearing all three waves with lives remaining should trigger the win overlay.

---

## Challenges

---

**Challenge 1 — Wave Preview**

Before the player presses Space, show what the next wave contains: `Next: Wave 2/3 [Fast] ×6`. This prepares the player to adjust their tower layout.

Hints:
- The "between waves" branch in `updateHUD` already exists — update it
- `currentWaveIndex + 1` is the *next* wave's index
- Guard: only show the preview if `currentWaveIndex + 1 < WAVES.length`

<details>
<summary>Solution</summary>

```ts
  } else if (currentWaveIndex >= WAVES.length - 1) {
    waveLabel = 'All waves complete!';
  } else {
    const nextWave = WAVES[currentWaveIndex + 1];
    const typeNames: Record<EnemyType, string> = {
      basic: 'Basic', fast: 'Fast', armored: 'Armored',
    };
    waveLabel =
      'Wave ' + (currentWaveIndex + 1) + ' complete' +
      '  |  Next: Wave ' + (currentWaveIndex + 2) + '/' + WAVES.length +
      '  [' + typeNames[nextWave.enemyType] + '] ×' + nextWave.enemyCount +
      '  — Space to start';
  }
```

`currentWaveIndex + 2` for the displayed wave number (1-based from a 0-based index already incremented by 1).

</details>

---

**Challenge 2 — Per-Type Color Blending on Damage**

Each enemy type has a different base color. The damage tint currently blends toward a fixed orange→red. Update `updateColor()` so the damage tint is relative to each type's own base color — armored enemies fade from brown to dark brown, fast enemies fade from yellow to dark yellow.

Hints:
- Store the base color components (R, G, B as 0–1 values) in the Enemy base class
- Add them to `EnemyConfig`: `baseR: number; baseG: number; baseB: number`
- In `updateColor`, multiply each component by `t` rather than blending toward a fixed red target

<details>
<summary>Solution</summary>

Add to `EnemyConfig`:
```ts
interface EnemyConfig {
  health: number;
  radius: number;
  color: number;
  speedMultiplier: number;
  baseR: number;
  baseG: number;
  baseB: number;
}
```

Add to `Enemy`:
```ts
  private readonly baseR: number;
  private readonly baseG: number;
  private readonly baseB: number;

  constructor(worldPath, speed, config: EnemyConfig) {
    // ... existing ...
    this.baseR = config.baseR;
    this.baseG = config.baseG;
    this.baseB = config.baseB;
  }
```

Update `updateColor`:
```ts
  private updateColor(): void {
    const t = this.health / this.maxHealth;
    if (this.slowTimer > 0) {
      this.material.color.setRGB(this.baseR * t * 0.5, this.baseG * t * 0.3, 1.0);
    } else {
      this.material.color.setRGB(this.baseR * t, this.baseG * t, this.baseB * t);
    }
  }
```

`setRGB(r * t, g * t, b * t)` darkens toward black as health drops. Each type fades into its own dark variant. Update all three subclasses to pass the base RGB components:

```ts
class FastEnemy extends Enemy {
  constructor(worldPath, speed) {
    super(worldPath, speed, {
      health: 50, radius: 0.2, color: 0xffdd00,
      speedMultiplier: 1.6,
      baseR: 1.0, baseG: 0.87, baseB: 0.0,  // 0xffdd00 in 0-1 range
    });
  }
}
```

`0xffdd00`: R = 0xff/0xff = 1.0, G = 0xdd/0xff = 0.867, B = 0.0

</details>

---

**Challenge 3 — Regenerating Enemy**

Add a `RegenEnemy` that slowly restores health over time as long as it is not in a tower's range (i.e., not currently taking damage). Add it as a fourth `EnemyType`.

Hints:
- Add a `lastDamageTime: number = 0` property to track when damage was last received
- In `takeDamage`, set `this.lastDamageTime = 0` (use a timer you increment in `update`)
- In `update`, increment a `timeSinceDamage` counter; if it exceeds a threshold (e.g., 1.5 seconds), restore `health` at a rate of `15 * deltaTime`
- Regeneration should not push health above `maxHealth`
- Update `updateColor()` to reflect regenerating health (perhaps a green tint when healing)

<details>
<summary>Solution</summary>

Add to `Enemy`:
```ts
  protected regenRate: number = 0;   // hp per second; 0 = no regen
  private timeSinceDamage: number = 0;
  private readonly regenDelay: number = 1.5; // seconds before regen starts
```

In `takeDamage`, add:
```ts
    this.timeSinceDamage = 0;
```

In `update`, before or after the slow timer block:
```ts
    this.timeSinceDamage += deltaTime;
    if (this.regenRate > 0 && this.timeSinceDamage > this.regenDelay && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + this.regenRate * deltaTime);
      this.updateColor();
    }
```

Add `RegenEnemy`:
```ts
class RegenEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, {
      health: 120,
      radius: 0.32,
      color: 0x44ff88,
      speedMultiplier: 1.0,
    });
    this.regenRate = 15;
  }
}
```

Update `EnemyType` and `spawnEnemy` factory to include `'regen'`. `regenRate` is `protected` so `RegenEnemy` can set it in the constructor body after `super()`.

`this.regenRate = 15` sets 15 hp/sec regen. Against a 25 dps BasicTower, net damage is only 10 dps — needs a 100hp enemy killed at 10dps = 10 seconds of sustained fire. Players need multiple overlapping towers.

</details>

---

## Quick Check Answers

1. **Does abstract make sense for Enemy?** Yes, for the same reason as Tower: there is no game entity that is "just an Enemy" — every enemy in the game is one of the specific types. Making it abstract enforces this and prevents accidentally writing `new Enemy()` without a config, which would leave health and radius undefined.

2. **The error if you forget to update `spawnEnemy`:** TypeScript will error: "Cannot create an instance of an abstract class." This is a compile-time error — you cannot run the broken code. The abstract keyword specifically prevents direct instantiation, which is what makes the factory pattern safe to enforce.

3. **Score formula with health:** `score = speed * weight_A + maxHealth * weight_B`. The ratio of the two weights determines how much you value stopping fast enemies versus killing tough ones. The lab used `speed * 30 + maxHealth * 0.5`, which produces 143 for armored (toughest) and 121 for fast (quickest) — a reasonable balance.

---

## Final Check

| # | Check | Expected result |
|---|---|---|
| 1 | Wave 1 | Orange-red spheres, same size as before |
| 2 | Wave 2 | Small yellow spheres that visibly sprint |
| 3 | Wave 3 | Large brown spheres that move deliberately |
| 4 | HUD during wave | Shows `[Basic]`, `[Fast]`, or `[Armored]` |
| 5 | Armored enemy killed | Score jump larger than basic kill |
| 6 | Fast enemy killed | Score jump larger than basic kill |
| 7 | Cannon slows fast enemy | Yellow enemy turns blue-purple and slows visibly |
| 8 | Win condition | Clears all 3 waves → overlay appears |
| 9 | Reset | All enemy types are cleaned up correctly |
| 10 | TypeScript terminal | Zero errors |

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
  damage: number;
}

abstract class Tower {
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

class BasicTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.25, bottomRadius: 0.35, height: 1.2, color: 0x3355ff, range: 1.5, damage: 25 });
  }
}

class SniperTower extends Tower {
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

class CannonTower extends Tower {
  constructor(tile: Tile) {
    super(tile, { topRadius: 0.3, bottomRadius: 0.42, height: 0.9, color: 0x885522, range: 2.0, damage: 20 });
  }

  protected override onDamageDealt(target: Enemy): void {
    target.applySlowEffect(1.0, 0.5);
  }
}

type TowerType = 'basic' | 'sniper' | 'cannon';

// --- Enemy Types ---

interface EnemyConfig {
  health: number;
  radius: number;
  color: number;
  speedMultiplier: number;
}

type EnemyType = 'basic' | 'armored' | 'fast';

abstract class Enemy {
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

class BasicEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, { health: 100, radius: 0.3,  color: 0xff6600, speedMultiplier: 1.0 });
  }
}

class ArmoredEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, { health: 200, radius: 0.42, color: 0x886644, speedMultiplier: 0.8 });
  }
}

class FastEnemy extends Enemy {
  constructor(worldPath: THREE.Vector3[], speed: number) {
    super(worldPath, speed, { health: 50,  radius: 0.2,  color: 0xffdd00, speedMultiplier: 1.6 });
  }
}

// --- Wave Types ---

interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
  enemyType: EnemyType;
}

const WAVES: WaveConfig[] = [
  { enemyCount: 3, spawnInterval: 2.0, enemySpeed: 1.5, enemyType: 'basic'   },
  { enemyCount: 6, spawnInterval: 0.9, enemySpeed: 2.0, enemyType: 'fast'    },
  { enemyCount: 4, spawnInterval: 2.5, enemySpeed: 1.8, enemyType: 'armored' },
];

// --- Game State ---

type GameState = 'playing' | 'gameover' | 'won';

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

// --- Camera ---

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
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
let lives: number = 10;
let gameState: GameState = 'playing';
let score: number = 0;

let currentWaveIndex: number = -1;
let waveActive: boolean = false;
let enemiesSpawnedThisWave: number = 0;
let spawnTimer: number = 0;

// --- Tower Logic ---

function placeTower(tile: Tile): void {
  let tower: Tower;
  if (activeTowerType === 'basic') {
    tower = new BasicTower(tile);
  } else if (activeTowerType === 'sniper') {
    tower = new SniperTower(tile);
  } else {
    tower = new CannonTower(tile);
  }
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
  if (type === 'basic') {
    enemy = new BasicEnemy(WORLD_PATH, speed);
  } else if (type === 'fast') {
    enemy = new FastEnemy(WORLD_PATH, speed);
  } else {
    enemy = new ArmoredEnemy(WORLD_PATH, speed);
  }
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
    const isLastWave = currentWaveIndex >= WAVES.length - 1;
    if (isLastWave && lives > 0 && gameState === 'playing') {
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

  lives = 10;
  score = 0;
  currentWaveIndex = -1;
  waveActive = false;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;
  gameState = 'playing';
  hideOverlay();
  updateHUD();
}

// --- HUD and Overlay ---

function updateHUD(): void {
  const typeLabel =
    activeTowerType === 'basic'  ? 'Basic [1]'  :
    activeTowerType === 'sniper' ? 'Sniper [2]' :
                                   'Cannon [3]';

  const typeNames: Record<EnemyType, string> = {
    basic: 'Basic', fast: 'Fast', armored: 'Armored',
  };

  let waveLabel: string;
  if (currentWaveIndex < 0) {
    waveLabel = 'Press Space to start';
  } else if (waveActive) {
    const wave = WAVES[currentWaveIndex];
    const remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length;
    waveLabel =
      'Wave ' + (currentWaveIndex + 1) + '/' + WAVES.length +
      '  [' + typeNames[wave.enemyType] + ']' +
      '  Enemies: ' + remaining;
  } else if (currentWaveIndex >= WAVES.length - 1) {
    waveLabel = 'All waves complete!';
  } else {
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + ' complete — Space for next';
  }

  hudEl.textContent =
    waveLabel +
    '  |  Score: ' + score +
    '  |  Towers: ' + towers.length +
    '  |  ' + typeLabel +
    '  |  Lives: ' + lives;
}

function showOverlay(title: string, subtitle: string): void {
  overlayEl.style.fontSize = '48px';
  overlayEl.textContent =
    title + '\n\n' + subtitle + '\n\nScore: ' + score + '\n\nPress R to play again';
  overlayEl.style.display = 'flex';
}

function hideOverlay(): void {
  overlayEl.style.display = 'none';
}

gameEvents.on('towerPlaced',   () => { updateHUD(); });
gameEvents.on('towerRemoved',  () => { updateHUD(); });
gameEvents.on('typeChanged',   () => { updateHUD(); });
gameEvents.on('waveStarted',   () => { updateHUD(); });
gameEvents.on('waveComplete',  () => { updateHUD(); });
gameEvents.on('waveProgress',  () => { updateHUD(); });
gameEvents.on('enemyKilled',   () => { updateHUD(); });

gameEvents.on('livesChanged', () => {
  updateHUD();
  if (lives <= 0 && gameState === 'playing') {
    gameState = 'gameover';
    gameEvents.emit('gameOver', score);
  }
});

gameEvents.on('gameOver', () => { showOverlay('GAME OVER', 'Better luck next time'); });
gameEvents.on('gameWon',  () => { showOverlay('YOU WIN',   'All enemies defeated');  });

updateHUD();

// --- Raycaster ---

const raycaster = new THREE.Raycaster();

// --- Input ---

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
  if (event.key === '1' && gameState === 'playing') {
    activeTowerType = 'basic';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === '2' && gameState === 'playing') {
    activeTowerType = 'sniper';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === '3' && gameState === 'playing') {
    activeTowerType = 'cannon';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === ' ') {
    event.preventDefault();
    if (gameState === 'playing') startNextWave();
  }
  if (event.key === 'r' || event.key === 'R') {
    resetGame();
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

> **Lab 17 Preview:** The game has a complete loop — towers, enemies, waves, state, score. But every tower is isolated: it does not know what the others are targeting, and it wastes fire on enemies other towers are already killing. Lab 17 introduces a `GameManager` class that centralizes game state (towers, enemies, score, lives, wave variables) and exposes controlled methods instead of direct array access. This is the beginning of architecture — separating "the rules of the game" from "the rendering and input code."
