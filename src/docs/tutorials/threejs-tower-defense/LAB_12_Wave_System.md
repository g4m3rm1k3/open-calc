# TypeScript Tower Defense — LAB 12 — Wave System

**Prerequisites:** Lab 11 complete. Enemies walk the path, lives decrease when they exit.

**What this lab adds:**
- `WaveConfig` interface — describing a group of enemies
- The **accumulator pattern** — using delta time to build a timer
- Automatic timed spawning — the game sends enemies at regular intervals
- Multi-wave progression — harder waves follow easier ones
- Wave state variables — tracking whether a wave is active
- HUD updates — showing the current wave number and enemy count

**Time:** 60–90 minutes.

---

## What You Will Build

Instead of pressing `Space` for each individual enemy, you press `Space` once to start a wave. The game then spawns enemies automatically at timed intervals. After all enemies in the wave are spawned and cleared, you can start the next wave:

```
[Space] → Wave 1 starts
           ↓ (2 seconds)  enemy spawns
           ↓ (2 seconds)  enemy spawns
           ↓ (2 seconds)  enemy spawns  ← 3 enemies total
           ...enemies walk and exit...
           Wave 1 complete → press Space for Wave 2

[Space] → Wave 2 starts  (faster, more enemies)
```

The HUD always shows: `Wave: 1/3  |  Enemies: 3  |  Lives: 10`

---

> **Quick Check — try to answer before reading further:**
>
> 1. You want to spawn an enemy every 2 seconds. You cannot use `setTimeout` because the game loop runs every frame. How might you use delta time — the seconds since the last frame — to build up to 2 seconds over multiple frames?
> 2. What information would you need to describe one wave of enemies? Think about what varies between an easy wave and a hard wave.
> 3. After a wave's last enemy is spawned, the wave is not yet complete — enemies are still on the path. What two conditions must both be true for a wave to be considered finished?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand the Concepts Before Touching Code

---

### Concept: The Accumulator Pattern

The game loop runs as fast as the monitor refreshes — typically 60 times per second. You cannot say "wait 2 seconds then do something" because the loop cannot stop. Instead, you add up the delta time each frame until the total reaches your threshold:

```
Frame 1: timer += 0.016   → timer = 0.016
Frame 2: timer += 0.016   → timer = 0.032
Frame 3: timer += 0.017   → timer = 0.049
...
Frame 125: timer += 0.016 → timer = 2.001  ← threshold reached!
```

When the timer exceeds the threshold, you trigger the action and reset the timer. The reset is important: if you reset to `0`, small rounding errors accumulate over time. Resetting to `timer - threshold` carries the overshoot into the next interval:

```ts
spawnTimer += deltaTime;
if (spawnTimer >= spawnInterval) {
  spawnTimer -= spawnInterval;  // carry the overshoot forward
  spawnEnemy();
}
```

**This is one of the most important patterns in game development.** You will use it for enemy spawning, projectile firing, animation frame advancement, cooldown timers, and any other time-based event.

---

### Concept: Wave State — Tracking Where You Are

A wave goes through distinct phases:

```
IDLE ──[Space]──► ACTIVE ──[all spawned + all cleared]──► COMPLETE
                    │                                           │
                    └──────────[next Space]─────────────────────┘
```

You do not need a formal enum for this — three simple variables capture the state clearly:

```ts
let waveActive: boolean = false;        // is a wave currently running?
let enemiesSpawnedThisWave: number = 0; // how many have been sent so far?
let spawnTimer: number = 0;             // seconds since last spawn
```

Combined with `currentWaveIndex` (which wave you are on) and `enemies.length` (how many are still alive), these four values tell you everything about wave state at any moment.

---

### Concept: Interface for Data-Driven Design

Right now the Tower classes use `TowerConfig` to separate "what values" from "what code." The same idea applies to waves. Instead of hardcoding enemy counts and intervals:

```ts
// hardcoded — adding a new wave means editing the function
function startWave1() { spawnCount = 3; interval = 2; speed = 2; }
function startWave2() { spawnCount = 5; interval = 1.5; speed = 2.5; }
```

You define an interface and an array of data:

```ts
interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
}

const WAVES: WaveConfig[] = [
  { enemyCount: 3, spawnInterval: 2.0, enemySpeed: 1.5 },
  { enemyCount: 5, spawnInterval: 1.5, enemySpeed: 2.0 },
  { enemyCount: 8, spawnInterval: 1.0, enemySpeed: 2.5 },
];
```

Adding a fourth wave is one line of data, not a new function. The spawning code that reads from `WAVES[currentWaveIndex]` never changes. **Data-driven design** is the separation of *behavior* (code) from *configuration* (data). You will see it constantly in game engines, web frameworks, and enterprise systems (configuration files, database-driven behavior, feature flags).

---

### Concept: Two Conditions for Wave Completion

A wave is complete when:
1. **All enemies have been spawned** — `enemiesSpawnedThisWave >= wave.enemyCount`
2. **All spawned enemies have cleared the path** — `enemies.length === 0`

Both must be true simultaneously. If only condition 1 is true, enemies are still walking. If only condition 2 is true, more enemies are still queued to spawn.

```ts
const allSpawned = enemiesSpawnedThisWave >= wave.enemyCount;
const allCleared = enemies.length === 0;

if (allSpawned && allCleared) {
  // wave is complete
}
```

The `&&` (AND) operator evaluates the left side first. If it is false, the right side is never evaluated — this is called **short-circuit evaluation**. It is not just a style choice; it prevents errors when the left side being false would make the right side invalid.

---

## Step 2 — Add the WaveConfig Interface and Wave Data

Open `src/main.ts`. Find the `// --- Grid Types ---` comment near the top. Add the wave types after the enemy section:

```ts
// --- Wave Types ---

interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
}

const WAVES: WaveConfig[] = [
  { enemyCount: 3, spawnInterval: 2.0, enemySpeed: 1.5 },
  { enemyCount: 5, spawnInterval: 1.5, enemySpeed: 2.0 },
  { enemyCount: 8, spawnInterval: 1.0, enemySpeed: 2.8 },
];
```

**What each field means:**

`enemyCount` — how many enemies this wave sends in total.

`spawnInterval` — seconds between each spawn. `2.0` means one enemy every two seconds. `1.0` means one per second — noticeably faster.

`enemySpeed` — the movement speed passed to `new Enemy(path, speed)`. `1.5` is slow and manageable. `2.8` is fast enough to feel threatening.

The three waves escalate: fewer, slower, spread-out enemies → more, faster, rapid-fire enemies. This is the core tuning loop of every tower defense game.

> **SAVE AND TRY:** `WaveConfig` and `WAVES` are defined. No TypeScript errors expected. No visible change.

---

## Step 3 — Add Wave State Variables

Find the `// --- State ---` section. It currently looks like this:

```ts
const towers: Tower[] = [];
const enemies: Enemy[] = [];
let activeTowerType: TowerType = 'basic';
let lives: number = 10;
```

Add the wave state variables below:

```ts
let currentWaveIndex: number = -1;
let waveActive: boolean = false;
let enemiesSpawnedThisWave: number = 0;
let spawnTimer: number = 0;
```

**Line by line:**

`currentWaveIndex: number = -1`
Starts at `-1` because no wave has started. When the first wave begins, it increments to `0` (the index of the first element in `WAVES`). Using `-1` as "no wave yet" is a common convention — it means "not yet pointing at any valid index."

`waveActive: boolean = false`
Guards the spawner. The spawner only runs when this is `true`. Also used to prevent starting a new wave while one is in progress.

`enemiesSpawnedThisWave: number = 0`
Counts how many enemies have been created in the current wave. Compared against `wave.enemyCount` to know when spawning is done.

`spawnTimer: number = 0`
The accumulator. Starts at 0 each wave. Grows by `deltaTime` each frame. When it reaches `spawnInterval`, a spawn fires and the timer resets.

> **SAVE AND TRY:** Variables declared. No errors. No visible change.

---

## Step 4 — Write the Wave Spawner Function

Add a new function after `spawnEnemy`. This function is called every frame from `update()`:

```ts
function updateWaveSpawner(deltaTime: number): void {
  if (!waveActive) return;

  const wave = WAVES[currentWaveIndex];

  spawnTimer += deltaTime;

  if (spawnTimer >= wave.spawnInterval && enemiesSpawnedThisWave < wave.enemyCount) {
    spawnTimer -= wave.spawnInterval;
    spawnEnemy(wave.enemySpeed);
    enemiesSpawnedThisWave++;
    gameEvents.emit('waveProgress', { spawned: enemiesSpawnedThisWave, total: wave.enemyCount });
  }

  const allSpawned = enemiesSpawnedThisWave >= wave.enemyCount;
  const allCleared = enemies.length === 0;

  if (allSpawned && allCleared) {
    waveActive = false;
    gameEvents.emit('waveComplete', currentWaveIndex);
  }
}
```

**Line by line:**

`if (!waveActive) return;`
Early return if no wave is running. This makes the function safe to call every frame — when idle, it costs almost nothing.

`const wave = WAVES[currentWaveIndex];`
Grabs the current wave's config. All spawning decisions (interval, speed, count) come from here.

`spawnTimer += deltaTime;`
The accumulator grows by however many seconds passed since the last frame.

`if (spawnTimer >= wave.spawnInterval && enemiesSpawnedThisWave < wave.enemyCount)`
Two guards in one:
- Has the timer reached the interval? (`>=`)
- Are there still enemies left to spawn in this wave? (`<`)

The second guard is important: without it, the timer would keep firing spawns after the wave count was exhausted. The `&&` short-circuits — if the timer has not fired, the count check is not evaluated.

`spawnTimer -= wave.spawnInterval;`
Reset by subtracting rather than setting to 0. If `deltaTime` was 0.02 and `spawnInterval` was 2.0, the timer might be `2.003` — subtracting `2.0` leaves `0.003`, which carries into the next interval and keeps spawning accurate over time.

`spawnEnemy(wave.enemySpeed);`
Creates the enemy with the wave's configured speed. `spawnEnemy` now always receives an explicit speed — the default parameter (`= 2`) still exists but is not used during wave play.

`enemiesSpawnedThisWave++;`
Increment the count. Once this reaches `wave.enemyCount`, no more spawns fire.

`gameEvents.emit('waveProgress', { ... })`
Emits an object — not just a number or string, but a small data package. The HUD will use `spawned` and `total` to show enemy count.

`if (allSpawned && allCleared)`
The wave completion check. Runs every frame, but only triggers once: the frame where the last enemy both finishes and the spawner is exhausted.

`gameEvents.emit('waveComplete', currentWaveIndex)`
Announces the finished wave number. The HUD will react, and in later labs an achievement or score system could subscribe here.

> **SAVE AND TRY:** Function is written but never called. No TypeScript errors. No change in browser.

---

## Step 5 — Wire the Spawner into the Game Loop

Find the `update` function:

```ts
function update(deltaTime: number): void {
  controls.update();

  for (let i = enemies.length - 1; i >= 0; i--) {
    // ...
  }
}
```

Add one call at the end:

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

  updateWaveSpawner(deltaTime);  // ← add this
}
```

`updateWaveSpawner(deltaTime)` is placed after the enemy loop so that newly spawned enemies begin receiving `update()` calls on the very next frame, not the current one. This avoids a subtle issue where a freshly spawned enemy's `update()` would be called before its `done` state is properly initialized.

> **SAVE AND TRY:** The spawner now runs every frame. Pressing `Space` still spawns a single enemy using the old behavior (no wave has started). No TypeScript errors.

---

## Step 6 — Add the `startNextWave` Function

Add this function after `updateWaveSpawner`:

```ts
function startNextWave(): void {
  if (waveActive) return;
  if (currentWaveIndex >= WAVES.length - 1) return;

  currentWaveIndex++;
  waveActive = true;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;

  gameEvents.emit('waveStarted', currentWaveIndex);
}
```

**Line by line:**

`if (waveActive) return;`
Guards against starting a wave while one is already running. Without this, rapid `Space` presses would increment `currentWaveIndex` and reset the counter mid-wave.

`if (currentWaveIndex >= WAVES.length - 1) return;`
Guards against going past the last wave. `WAVES.length - 1` is the index of the last element (2, for a 3-element array). When `currentWaveIndex` is already at or past that, there are no more waves. Silently ignore the keypress.

`currentWaveIndex++;`
Advance to the next wave. On the first press, this goes from `-1` to `0`.

`waveActive = true;`
Turns on the spawner. `updateWaveSpawner` will now run its logic each frame.

`enemiesSpawnedThisWave = 0;`
`spawnTimer = 0;`
Reset both accumulators for the new wave. Without resetting `enemiesSpawnedThisWave`, the new wave would start with a non-zero count. Without resetting `spawnTimer`, it might carry over leftover time from the previous wave.

`gameEvents.emit('waveStarted', currentWaveIndex)`
Announces which wave just started. The HUD can use this index to display "Wave 1/3", "Wave 2/3", etc.

---

## Step 7 — Wire Spacebar to `startNextWave`

Find the `keydown` event listener. It currently has this case for spacebar:

```ts
if (event.key === ' ') {
  event.preventDefault();
  spawnEnemy();
}
```

Change it to:

```ts
if (event.key === ' ') {
  event.preventDefault();
  startNextWave();
}
```

`spawnEnemy()` is no longer called directly from the keyboard — the wave system calls it automatically. `startNextWave` handles the spacebar from now on.

> **SAVE AND TRY:** Press `Space`. After a 2-second pause, the first enemy appears. Two more follow at 2-second intervals. After all three have walked the path and exited, pressing `Space` again starts Wave 2. Try it — Wave 2 enemies are faster and there are 5 of them. The HUD does not yet show wave info, but enemies spawn automatically.

---

## Step 8 — Update the HUD for Waves

The HUD needs to show which wave is active and how many enemies remain. Update `updateHUD` and add wave event subscriptions.

First, update the function:

```ts
function updateHUD(): void {
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';

  let waveLabel: string;
  if (currentWaveIndex < 0) {
    waveLabel = 'Press Space to start';
  } else if (waveActive) {
    const wave = WAVES[currentWaveIndex];
    const remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length;
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + '/' + WAVES.length +
                '  Enemies: ' + remaining;
  } else if (currentWaveIndex >= WAVES.length - 1) {
    waveLabel = 'All waves complete!';
  } else {
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + ' complete — Space for next';
  }

  hudEl.textContent =
    waveLabel + '  |  Towers: ' + towers.length +
    '  |  ' + typeLabel +
    '  |  Lives: ' + lives;
}
```

**What each branch shows:**

`currentWaveIndex < 0`
No wave has started yet. Prompt the player.

`waveActive`
A wave is in progress. Show the wave number and a remaining enemy count.

`remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length`
The total enemies still coming: those not yet spawned *plus* those already on the path. This gives the player an accurate picture of how much threat remains.

`currentWaveIndex >= WAVES.length - 1` (and wave not active)
All waves are done and the last wave has cleared. Victory state.

`else`
Between waves: a wave finished, but not the last one. Prompt to start the next.

`currentWaveIndex + 1`
Converts from 0-based index to 1-based display. Players expect "Wave 1", not "Wave 0".

Then add event subscriptions below the others:

```ts
gameEvents.on('waveStarted',  () => { updateHUD(); });
gameEvents.on('waveComplete', () => { updateHUD(); });
gameEvents.on('waveProgress', () => { updateHUD(); });
```

> **CSS AND SEE:** Save and check the browser. The HUD should now show "Press Space to start" on load. After pressing `Space`, it shows "Wave 1/3  Enemies: 3". As enemies spawn and walk, the count decrements. After the wave clears, it shows "Wave 1 complete — Space for next."

---

## Step 9 — Verify the Full Wave Cycle

Walk through the complete game sequence:

1. Page loads → HUD shows "Press Space to start"
2. Press `Space` → "Wave 1/3  Enemies: 3" — enemies spawn every 2 seconds
3. Watch 3 enemies walk the path, each taking a life when they exit
4. Wave 1 complete → HUD shows "Wave 1 complete — Space for next"
5. Press `Space` → "Wave 2/3  Enemies: 5" — faster enemies, shorter intervals
6. Place towers on green tiles while enemies walk — HUD updates tower count
7. Wave 2 complete → Press `Space` → "Wave 3/3  Enemies: 8" — hardest wave
8. Wave 3 clears → HUD shows "All waves complete!"
9. Press `Space` again → nothing happens (all waves exhausted)

> **SAVE AND TRY:** Run the complete sequence above. Confirm each transition is reflected in the HUD accurately.

---

## Step 10 — Edge Cases to Test

**Rapidly pressing Space at wave start:**
Try pressing `Space` twice quickly at the beginning. The `if (waveActive) return;` guard should prevent double-starting.

**Pressing Space during a wave:**
Press `Space` mid-wave. Nothing should happen. Enemy spawning should continue undisturbed.

**No lives remaining:**
Let all enemies through until `lives === 0`. The lives counter should stop at 0. Waves can still be started (the game does not have a game-over condition yet — that is a future challenge).

**Tabbing away during a wave:**
Tab to another browser tab for 5 seconds, then return. Because of the `Math.min(rawDelta, MAX_DELTA)` clamp from Lab 03, the game should not spike — enemies should be at reasonable positions, not teleported across the grid.

---

## Challenges

---

**Challenge 1 — First Spawn is Immediate**

Currently the first enemy in each wave waits `spawnInterval` seconds before appearing. Change the spawner so the first enemy spawns immediately when the wave starts.

Hints:
- The spawner fires when `spawnTimer >= spawnInterval`
- If `spawnTimer` starts at `spawnInterval` instead of `0`, the first spawn fires on the first frame

<details>
<summary>Solution</summary>

In `startNextWave()`, change:
```ts
spawnTimer = 0;
```
to:
```ts
spawnTimer = wave.spawnInterval;
```

Wait — `wave` is not in scope in `startNextWave`. You need to read it first:
```ts
function startNextWave(): void {
  if (waveActive) return;
  if (currentWaveIndex >= WAVES.length - 1) return;

  currentWaveIndex++;
  waveActive = true;
  enemiesSpawnedThisWave = 0;
  spawnTimer = WAVES[currentWaveIndex].spawnInterval; // immediately ready
  gameEvents.emit('waveStarted', currentWaveIndex);
}
```

Now `spawnTimer` starts at the threshold — the very first frame of `updateWaveSpawner` sees `spawnTimer >= wave.spawnInterval` and spawns immediately.

</details>

---

**Challenge 2 — Between-Wave Countdown**

After a wave completes, show a countdown in the HUD ("Next wave in: 3... 2... 1...") before the player can start the next wave. The next `Space` press only works after the countdown finishes.

Hints:
- Add a `betweenWaveCooldown: number` variable (seconds remaining in the cooldown)
- In `updateWaveSpawner`, after the wave complete check, set `betweenWaveCooldown = 5`
- In `update`, if `betweenWaveCooldown > 0`, decrement it by `deltaTime` and emit an event
- In `startNextWave`, add `if (betweenWaveCooldown > 0) return;`

<details>
<summary>Solution</summary>

```ts
let betweenWaveCooldown: number = 0;

// In updateWaveSpawner, after the wave complete block:
if (allSpawned && allCleared) {
  waveActive = false;
  betweenWaveCooldown = 5;
  gameEvents.emit('waveComplete', currentWaveIndex);
}

// In update(), after updateWaveSpawner():
if (betweenWaveCooldown > 0) {
  betweenWaveCooldown = Math.max(0, betweenWaveCooldown - deltaTime);
  gameEvents.emit('cooldownTick', Math.ceil(betweenWaveCooldown));
}

// In startNextWave:
if (betweenWaveCooldown > 0) return;

// In updateHUD, update the between-wave branch:
} else if (betweenWaveCooldown > 0) {
  waveLabel = 'Next wave in: ' + Math.ceil(betweenWaveCooldown);
} else {
  waveLabel = 'Wave ' + (currentWaveIndex + 1) + ' complete — Space for next';
}

// Subscribe to the new event:
gameEvents.on('cooldownTick', () => { updateHUD(); });
```

`Math.ceil` rounds up: `4.7` becomes `5`, `0.1` becomes `1`. This makes the countdown show whole numbers.

`Math.max(0, betweenWaveCooldown - deltaTime)` prevents the cooldown from going negative.

</details>

---

**Challenge 3 — Replay**

After all waves complete (or when lives reach 0), pressing `R` resets the entire game: clears all enemies and towers, restores lives to 10, and resets the wave state back to "Press Space to start."

Hints:
- You already know how to clear enemies from the Challenge in Lab 11
- Towers need the same treatment: loop backwards, call `dispose` on each, set `tile.occupied = false`
- After clearing, reset: `currentWaveIndex = -1`, `waveActive = false`, `enemiesSpawnedThisWave = 0`, `spawnTimer = 0`, `lives = 10`

<details>
<summary>Solution</summary>

```ts
function resetGame(): void {
  // Remove all enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].dispose(scene);
  }
  enemies.length = 0;

  // Remove all towers
  for (let i = towers.length - 1; i >= 0; i--) {
    towers[i].tile.occupied = false;
    towers[i].dispose(scene);
  }
  towers.length = 0;

  // Reset wave state
  currentWaveIndex = -1;
  waveActive = false;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;
  lives = 10;

  gameEvents.emit('livesChanged', lives);
  gameEvents.emit('waveComplete', -1); // triggers HUD refresh
}

// In keydown listener:
if (event.key === 'r' || event.key === 'R') {
  resetGame();
}
```

`enemies.length = 0` and `towers.length = 0` empty the arrays in place. This is equivalent to `enemies = []` except it does not create new arrays — it clears the existing ones.

`gameEvents.emit('waveComplete', -1)` reuses the existing HUD event to trigger a redraw. Passing `-1` is fine because `updateHUD` does not use the data value for this event — it just re-reads all the state variables.

</details>

---

## Quick Check Answers

1. **Building up to 2 seconds using delta time:** Add `deltaTime` to a `spawnTimer` variable each frame. When `spawnTimer >= 2.0`, trigger the spawn and subtract `2.0` from `spawnTimer`. The subtraction (rather than resetting to 0) preserves any overshoot, keeping the spawning rate accurate over many intervals.

2. **What describes a wave:** At minimum: how many enemies (`enemyCount`), how long between spawns (`spawnInterval`), and how fast the enemies move (`enemySpeed`). You could also add enemy health, enemy type, or a delay before the wave starts — all as fields in the interface.

3. **Two conditions for wave completion:** All enemies must have been spawned (`enemiesSpawnedThisWave >= wave.enemyCount`) AND all spawned enemies must have left the field (`enemies.length === 0`). A wave with 8 enemies is not complete just because 8 have been sent — 7 might still be walking the path.

---

## Final Check

| # | Check | Expected result |
|---|---|---|
| 1 | Page loads | HUD shows "Press Space to start" |
| 2 | Press `Space` | Wave 1 begins, HUD shows "Wave 1/3  Enemies: 3" |
| 3 | Watch enemy count | Counts down as enemies spawn and exit |
| 4 | After Wave 1 clears | HUD shows "Wave 1 complete — Space for next" |
| 5 | Press `Space` mid-wave | Nothing happens; wave continues unaffected |
| 6 | Complete all 3 waves | HUD shows "All waves complete!" |
| 7 | Press `Space` after wave 3 | Nothing happens |
| 8 | Place towers while waves run | Tower count updates correctly; towers do not interfere with wave state |
| 9 | Tab away and return | No enemy teleporting; wave timing is not spiked |
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

// --- Wave Types ---

interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
}

const WAVES: WaveConfig[] = [
  { enemyCount: 3, spawnInterval: 2.0, enemySpeed: 1.5 },
  { enemyCount: 5, spawnInterval: 1.5, enemySpeed: 2.0 },
  { enemyCount: 8, spawnInterval: 1.0, enemySpeed: 2.8 },
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

let currentWaveIndex: number = -1;
let waveActive: boolean = false;
let enemiesSpawnedThisWave: number = 0;
let spawnTimer: number = 0;

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
}

// --- Wave Logic ---

function updateWaveSpawner(deltaTime: number): void {
  if (!waveActive) return;

  const wave = WAVES[currentWaveIndex];

  spawnTimer += deltaTime;

  if (spawnTimer >= wave.spawnInterval && enemiesSpawnedThisWave < wave.enemyCount) {
    spawnTimer -= wave.spawnInterval;
    spawnEnemy(wave.enemySpeed);
    enemiesSpawnedThisWave++;
    gameEvents.emit('waveProgress', { spawned: enemiesSpawnedThisWave, total: wave.enemyCount });
  }

  const allSpawned = enemiesSpawnedThisWave >= wave.enemyCount;
  const allCleared = enemies.length === 0;

  if (allSpawned && allCleared) {
    waveActive = false;
    gameEvents.emit('waveComplete', currentWaveIndex);
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

// --- HUD Logic ---

function updateHUD(): void {
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';

  let waveLabel: string;
  if (currentWaveIndex < 0) {
    waveLabel = 'Press Space to start';
  } else if (waveActive) {
    const wave = WAVES[currentWaveIndex];
    const remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length;
    waveLabel =
      'Wave ' + (currentWaveIndex + 1) + '/' + WAVES.length +
      '  Enemies: ' + remaining;
  } else if (currentWaveIndex >= WAVES.length - 1) {
    waveLabel = 'All waves complete!';
  } else {
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + ' complete — Space for next';
  }

  hudEl.textContent =
    waveLabel + '  |  Towers: ' + towers.length +
    '  |  ' + typeLabel +
    '  |  Lives: ' + lives;
}

gameEvents.on('towerPlaced',   () => { updateHUD(); });
gameEvents.on('towerRemoved',  () => { updateHUD(); });
gameEvents.on('typeChanged',   () => { updateHUD(); });
gameEvents.on('livesChanged',  () => { updateHUD(); });
gameEvents.on('waveStarted',   () => { updateHUD(); });
gameEvents.on('waveComplete',  () => { updateHUD(); });
gameEvents.on('waveProgress',  () => { updateHUD(); });

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
    startNextWave();
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

> **Lab 13 Preview:** The game has enemies and towers, but the towers do nothing. Lab 13 adds tower targeting: each frame, a tower scans for the nearest enemy within its range. When one is found, the tower deals damage over time. Enemies now have a `health` property, and when health reaches 0, the enemy is removed before reaching the exit. This introduces distance checking in 3D, the concept of *per-frame damage* scaled by delta time, and your first real interaction between two entity types.
