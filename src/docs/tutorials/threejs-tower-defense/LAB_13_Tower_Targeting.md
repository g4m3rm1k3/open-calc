# TypeScript Tower Defense — LAB 13 — Tower Targeting

**Prerequisites:** Lab 12 complete. Waves of enemies walk the path. Towers exist but deal no damage.

**What this lab adds:**
- `health` on `Enemy` — enemies can die before reaching the exit
- `takeDamage()` — reduces health and shifts the enemy's color from orange to red
- The `escaped` flag — cleanly separates "died to a tower" from "reached the exit"
- `damage` in `TowerConfig` — each tower type has a damage-per-second value
- `Tower.update()` — each frame a tower scans for the nearest enemy in range and damages it
- Distance formula on the XZ plane — the math behind "is this enemy close enough?"

**Time:** 60–90 minutes.

---

## What You Will Build

Place towers next to the path and start a wave. Enemies enter orange-red. As towers deal damage the color shifts toward deep red. When health reaches zero the enemy vanishes — no life lost. Only enemies that reach the far exit cost a life. For the first time the game is actually playable.

```
Enemy at full health:  🟠  (orange-red)
Enemy at half health:  🔴  (red-orange)
Enemy at zero health:  ✕   (removed, no life lost)
Enemy reaches exit:    ✕   (removed, life lost)
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. Two points on the grid: tower at `(x=1, z=0)`, enemy at `(x=4, z=4)`. How far apart are they? How would you calculate that?
> 2. A tower deals 30 damage per second. The game loop runs 60 times per second, so each frame `deltaTime ≈ 0.0167`. How much damage does the tower deal per frame?
> 3. A tower has `range = 2.0`. There are three enemies at distances 1.5, 2.5, and 1.8 from the tower. Which one should the tower target, and why might "nearest" be the standard choice?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand the Concepts Before Touching Code

---

### Concept: Distance Formula in 2D

Two points on a flat plane: `(x1, z1)` and `(x2, z2)`. The distance between them is:

```
distance = √((x2 - x1)² + (z2 - z1)²)
```

This is the Pythagorean theorem applied to 2D: the two legs of a right triangle are the horizontal separation (`dx = x2 - x1`) and the vertical separation (`dz = z2 - z1`). The hypotenuse is the straight-line distance.

```ts
const dx = enemyX - towerX;   // horizontal separation
const dz = enemyZ - towerZ;   // depth separation
const distance = Math.sqrt(dx * dx + dz * dz);
```

The Y axis (height) is ignored. The tower is taller than the enemy sphere, but both move on the same flat plane — only XZ distance matters for "is this enemy in range?".

---

### Concept: Per-Second Damage Scaled by Delta Time

A tower's `damage` property represents **damage per second** — not damage per frame. This keeps game design simple: when you write `damage: 30`, you know exactly what it means without caring about frame rate.

To apply it each frame:

```ts
const damageThisFrame = this.damage * deltaTime;
enemy.takeDamage(damageThisFrame);
```

At 60 FPS: `deltaTime ≈ 0.0167`, so `30 * 0.0167 ≈ 0.5` damage per frame. Over 60 frames (1 second): `0.5 * 60 = 30` — exactly 30 damage per second, as intended.

This is the same principle as Lab 11's movement: multiply a per-second value by deltaTime to get a per-frame value that stays consistent across frame rates.

---

### Concept: Nearest Enemy in Range

A tower should target the one enemy within range that is closest to it. The standard approach initializes the "closest distance so far" to the range itself — a clever trick:

```ts
let target: Enemy | null = null;
let closestDist = this.range; // start at the range limit, not Infinity

for (const enemy of activeEnemies) {
  const dist = /* distance to enemy */;
  if (dist <= closestDist) {  // within range AND closer than current best
    closestDist = dist;
    target = enemy;
  }
}
```

After the loop: if `target` is still `null`, no enemy was within range. If `target` is set, it is the nearest enemy inside the range.

**Why start at `this.range` instead of `Infinity`?** Enemies beyond the range automatically fail `dist <= closestDist` — no extra check needed. The range serves as both the upper bound and the initial threshold.

---

### Concept: Storing Material as a Class Property

In Lab 11, the Enemy class created a material and passed it to `new THREE.Mesh(geometry, material)`. Once inside the Mesh, the material type becomes `Material | Material[]` — a union type. To call `.color.setRGB()` on it later, you would need to cast it.

The cleaner solution is to store the material in its own `private` property alongside the mesh:

```ts
class Enemy {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial; // stored separately

  constructor(...) {
    this.material = new THREE.MeshStandardMaterial({ color: 0xff6600 });
    this.mesh = new THREE.Mesh(geometry, this.material);
    // now this.material always has the full MeshStandardMaterial type
  }

  takeDamage(...) {
    this.material.color.setRGB(...); // no cast needed
  }
}
```

The material is stored as a `private readonly` property. `readonly` because the material object itself is never swapped out — you only change properties on it (`color`). `private` because nothing outside Enemy needs to access the material.

---

## Step 2 — Add Health to the Enemy Class

Open `src/main.ts`. Find the `Enemy` class. You will make several additions to it in this step and the next two.

### 2a — Add properties and update the constructor

Find the top of the `Enemy` class:

```ts
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

Replace it with:

```ts
class Enemy {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly worldPath: THREE.Vector3[];
  private waypointIndex: number = 0;
  readonly speed: number;
  readonly maxHealth: number = 100;
  health: number = 100;
  done: boolean = false;
  escaped: boolean = false;

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

**What changed and why:**

`private readonly material`
Stores the material separately so `takeDamage` can call `this.material.color.setRGB()` without a type cast.

`readonly maxHealth: number = 100`
`health: number = 100`
Both start at 100. `maxHealth` is `readonly` — it never changes. `health` changes as damage is taken. The ratio `health / maxHealth` drives the color.

`done: boolean = false`
`escaped: boolean = false`
`done` is already familiar — it triggers cleanup. `escaped` is new. It starts `false`. When an enemy reaches the exit, both become `true`. When a tower kills an enemy, only `done` becomes `true` — `escaped` stays `false`. The main loop uses this to decide whether to subtract a life.

`color: 0xff6600`
Orange-red for a healthy enemy. As health decreases, `takeDamage` will shift it toward pure red `0xff0000`.

> **SAVE AND TRY:** New properties are declared. The constructor stores the material. Check the Vite terminal — no TypeScript errors expected. In the browser, enemies should now spawn orange-red instead of pure red. Functionally, nothing else changed yet.

---

### 2b — Add the `takeDamage` method

Add this method inside the `Enemy` class, after the constructor and before `update`:

```ts
  takeDamage(amount: number): void {
    if (this.done) return;
    this.health = Math.max(0, this.health - amount);
    const t = this.health / this.maxHealth;
    this.material.color.setRGB(1.0, t * 0.4, 0.0);
    if (this.health <= 0) {
      this.done = true;
    }
  }
```

**Line by line:**

`if (this.done) return;`
Guard: if the enemy is already dead or escaped, ignore further damage calls. This prevents multiple towers from piling damage onto an already-dead enemy before the cleanup loop runs.

`this.health = Math.max(0, this.health - amount);`
Subtract damage and clamp to zero. `Math.max(0, value)` ensures health never goes negative — a negative health value would break the ratio calculation below.

`const t = this.health / this.maxHealth;`
A ratio from `0.0` (dead) to `1.0` (full health). This drives the color.

`this.material.color.setRGB(1.0, t * 0.4, 0.0);`
`setRGB(red, green, blue)` takes three values from 0.0 to 1.0.
- Red channel: always `1.0` — the enemy stays red
- Green channel: `t * 0.4` — at full health, green is `0.4` (orange tint); at zero health, green is `0.0` (pure red)
- Blue channel: always `0.0`

Full health: RGB(1.0, 0.4, 0.0) = orange-red.
Zero health: RGB(1.0, 0.0, 0.0) = pure red.

`if (this.health <= 0) { this.done = true; }`
The enemy is flagged for removal. On the next frame, the enemy loop will catch `done === true`, remove the mesh from the scene, and splice it from the array. Note: `escaped` stays `false` here — this enemy was killed, not escaped.

> **SAVE AND TRY:** `takeDamage` is written. Nothing calls it yet, so no visual change. No TypeScript errors expected.

---

### 2c — Update `Enemy.update()` to set `escaped`

Find the `update` method inside `Enemy`. It currently sets `this.done = true` when the path is complete:

```ts
    if (this.waypointIndex >= this.worldPath.length) {
      this.done = true;
      return;
    }
```

Change it to:

```ts
    if (this.waypointIndex >= this.worldPath.length) {
      this.escaped = true;
      this.done = true;
      return;
    }
```

`this.escaped = true` is set first, then `this.done = true`. When the main loop checks `enemy.done`, it also checks `enemy.escaped` to decide whether to subtract a life. Both are set atomically in one frame — there is no window where one is true without the other.

> **SAVE AND TRY:** No visible change yet. The `escaped` flag is now set correctly when an enemy reaches the exit — the main loop just has not been updated to use it yet. No TypeScript errors.

---

## Step 3 — Update the Main Loop to Use `escaped`

Find the enemy cleanup block inside `update()`:

```ts
    if (enemy.done) {
      enemy.dispose(scene);
      enemies.splice(i, 1);
      lives = Math.max(0, lives - 1);
      gameEvents.emit('livesChanged', lives);
    }
```

Replace it with:

```ts
    if (enemy.done) {
      enemy.dispose(scene);
      enemies.splice(i, 1);
      if (enemy.escaped) {
        lives = Math.max(0, lives - 1);
        gameEvents.emit('livesChanged', lives);
      } else {
        gameEvents.emit('enemyKilled', enemy);
      }
    }
```

**What changed:**

`if (enemy.escaped)`
Only subtract a life if the enemy actually made it to the exit. A tower-killed enemy has `escaped === false`, so no life is lost.

`gameEvents.emit('enemyKilled', enemy)`
Announces that a tower killed an enemy. Nothing subscribes to this event yet — it is wired up in Lab 14 to award score. For now it fires into the void.

> **SAVE AND TRY:** Start a wave and let all enemies walk the path — you still lose a life for each one (towers don't fire yet). This confirms the escape path works. In the next steps, once towers fire, you will see enemies die without costing lives. No TypeScript errors.

---

## Step 4 — Add `damage` to `TowerConfig`

Find the `TowerConfig` interface:

```ts
interface TowerConfig {
  topRadius: number;
  bottomRadius: number;
  height: number;
  color: number;
  range: number;
}
```

Add one field:

```ts
interface TowerConfig {
  topRadius: number;
  bottomRadius: number;
  height: number;
  color: number;
  range: number;
  damage: number;
}
```

`damage: number` — damage per second this tower deals to its target.

TypeScript will immediately underline the `super(tile, { ... })` calls in `BasicTower` and `SniperTower` because the object literal no longer satisfies the interface. Fix that next.

---

### 4a — Add damage values to BasicTower and SniperTower

Find `BasicTower`:

```ts
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
```

Add `damage`:

```ts
class BasicTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.25,
      bottomRadius: 0.35,
      height: 1.2,
      color: 0x3355ff,
      range: 1.5,
      damage: 25,
    });
  }
}
```

Find `SniperTower` and add `damage`:

```ts
class SniperTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.15,
      bottomRadius: 0.20,
      height: 2.2,
      color: 0x778899,
      range: 3.5,
      damage: 60,
    });
  }
}
```

**The values:**
- `BasicTower damage: 25` — kills a 100hp enemy in 4 seconds of sustained fire. Short range (1.5), so enemies spend only 1–2 seconds inside that range. Needs two or three overlapping basic towers to reliably kill.
- `SniperTower damage: 60` — kills a 100hp enemy in about 1.7 seconds. Long range (3.5), so enemies spend more time in range. One well-placed sniper can handle most enemies.

> **SAVE AND TRY:** TypeScript errors should disappear — both subclasses now satisfy the interface. No visible change in the browser, but the damage values are defined.

---

## Step 5 — Add `damage` Property and `update()` to the Tower Class

Find the `Tower` abstract class. Find where `range` is declared and the constructor sets it:

```ts
abstract class Tower {
  readonly tile: Tile;
  readonly mesh: THREE.Mesh;
  readonly range: number;

  constructor(tile: Tile, config: TowerConfig) {
    this.tile = tile;
    this.range = config.range;
    // ... geometry, material, mesh ...
  }
```

Add `readonly damage: number` and assign it in the constructor:

```ts
abstract class Tower {
  readonly tile: Tile;
  readonly mesh: THREE.Mesh;
  readonly range: number;
  readonly damage: number;

  constructor(tile: Tile, config: TowerConfig) {
    this.tile = tile;
    this.range = config.range;
    this.damage = config.damage;
    // ... geometry, material, mesh — no changes here ...
  }
```

Now add the `update` method to `Tower`, after the constructor and before `dispose`:

```ts
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
    }
  }
```

**Line by line:**

`let target: Enemy | null = null;`
The enemy this tower will shoot this frame. Starts as `null` — meaning "no target found yet." TypeScript knows it might be null; the check at the bottom handles it safely.

`let closestDist = this.range;`
The search threshold. Any enemy farther than `this.range` fails the comparison below. This doubles as the tracker for "closest so far among those in range" — as a nearer enemy is found, `closestDist` narrows.

`for (const enemy of activeEnemies)`
Iterates all currently active enemies. This is the outer array passed in from the game loop — enemies that have already been cleaned up this frame are not in it.

`if (enemy.done) continue;`
Skip enemies that were just killed this same frame (their `done` flag is true but the array splice happens next frame). Without this, two towers could both target the same enemy in the frame it dies, applying redundant damage.

`const dx = enemy.mesh.position.x - this.mesh.position.x;`
`const dz = enemy.mesh.position.z - this.mesh.position.z;`
Separation along each axis. Note: it does not matter which direction you subtract — `dx * dx` squares it, so the sign cancels.

`const dist = Math.sqrt(dx * dx + dz * dz);`
2D distance on the XZ plane. Y is ignored — the tower is tall and the enemy sphere is small, but they occupy the same horizontal region.

`if (dist <= closestDist)`
Two checks in one: `dist <= this.range` (is it in range?) and `dist <= closestDist` (is it closer than the current best?). Both are true only for enemies that are both in range and nearer than the previous winner.

`closestDist = dist; target = enemy;`
Update both. After the loop, `target` is the nearest in-range enemy.

`target.takeDamage(this.damage * deltaTime);`
Deals damage scaled by delta time. `this.damage` is per-second; multiplying by `deltaTime` makes it per-frame.

> **SAVE AND TRY:** The `update` method is written but still not called anywhere. No TypeScript errors expected. No visible change yet.

---

## Step 6 — Call Tower Updates in the Game Loop

Find the `update` function in the game loop section. It currently has the enemy loop and the wave spawner call. Add the tower loop between them:

```ts
function update(deltaTime: number): void {
  controls.update();

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
        gameEvents.emit('enemyKilled', enemy);
      }
    }
  }

  for (const tower of towers) {
    tower.update(deltaTime, enemies);
  }

  updateWaveSpawner(deltaTime);
}
```

The only new code is:

```ts
  for (const tower of towers) {
    tower.update(deltaTime, enemies);
  }
```

`for (const tower of towers)`
Iterates every placed tower. `for...of` is the clean way to iterate arrays when you do not need the index.

`tower.update(deltaTime, enemies)`
Passes the current delta time and the full enemies array. The tower scans the enemies array internally for its target.

**Why towers after enemies, not before?**
The enemy loop runs first and removes enemies that escaped or died in previous frames. By the time towers run, the `enemies` array contains only currently-alive enemies. Towers cannot accidentally target an enemy that was cleaned up in this same frame.

> **SAVE AND TRY:** This is the big moment. Place several towers next to the path, start a wave, and watch. Enemies should now turn from orange-red to deeper red as they walk through tower range. If health reaches zero before the exit, the enemy disappears with no life lost. The lives counter only decrements when an enemy walks past all your towers. Play through a full wave — the game is now actually functional.

---

## Step 7 — Check the Numbers Feel Right

With the current setup:
- Enemy health: 100
- BasicTower damage: 25/sec, range: 1.5
- SniperTower damage: 60/sec, range: 3.5
- Wave 1 enemy speed: 1.5 tiles/sec
- Wave 3 enemy speed: 2.8 tiles/sec

A BasicTower's range covers roughly one tile on each side of where it stands. At speed 1.5, an enemy spends about 1 second crossing that range — receiving ~25 damage. A single basic tower chips enemies but rarely kills.

A SniperTower with range 3.5 covers 3+ tiles. At speed 1.5, an enemy spends roughly 2.3 seconds in range — receiving ~138 damage. One sniper kills Wave 1 enemies cleanly. Against Wave 3 at 2.8 speed: ~1.5 seconds in range → ~90 damage. A sniper barely kills fast enemies — two overlapping towers are needed.

**Test this:** Place one sniper near the middle of the path on row 4. Start Wave 1. Enemies should die cleanly. Start Wave 3. Enemies should barely survive the single sniper. Add a basic tower next to the sniper — together they should handle it. This is the core of tower defense tuning.

---

## Step 8 — Verify

Play through all three waves with a mix of towers.

| Behavior to confirm | Expected result |
|---|---|
| Enemy enters path | Orange-red sphere |
| Enemy enters tower range | Shifts toward deep red |
| Enemy health reaches 0 | Sphere disappears, no life lost |
| Enemy passes all towers | Sphere exits, life decremented |
| Wave progress count | Accurate — counts both in-queue and on-path enemies |
| Multiple towers | Each independently targets nearest in-range enemy |
| Fast enemies (Wave 3) | Harder to kill — spend less time in range |

---

## Challenges

---

**Challenge 1 — First Target Strategy**

The current targeting picks the **nearest** enemy. Change it to pick the enemy that has traveled the **furthest along the path** (i.e., has the highest `waypointIndex`). This is the "first" targeting strategy used in many tower defense games — it prevents enemies from slipping past while towers are shooting at ones still far away.

Hints:
- `waypointIndex` is `private` on Enemy — you would need to make it `readonly` (and remove `private`) to read it from outside, or add a `readonly progress` getter
- The search becomes: track the enemy with the highest `waypointIndex` among those in range

<details>
<summary>Solution</summary>

Add a public getter to Enemy (or change `private waypointIndex` to just `waypointIndex`):

```ts
// In Enemy class — change this:
private waypointIndex: number = 0;
// To:
waypointIndex: number = 0;  // now readable externally (but still writable — acceptable for now)
```

Change Tower.update() to target the furthest-along enemy in range:

```ts
update(deltaTime: number, activeEnemies: Enemy[]): void {
  let target: Enemy | null = null;
  let furthestProgress = -1;

  for (const enemy of activeEnemies) {
    if (enemy.done) continue;
    const dx = enemy.mesh.position.x - this.mesh.position.x;
    const dz = enemy.mesh.position.z - this.mesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist <= this.range && enemy.waypointIndex > furthestProgress) {
      furthestProgress = enemy.waypointIndex;
      target = enemy;
    }
  }

  if (target !== null) {
    target.takeDamage(this.damage * deltaTime);
  }
}
```

`furthestProgress` starts at `-1` so any valid `waypointIndex` (starting at 0) beats it. The range check `dist <= this.range` is now separate from the progress check.

</details>

---

**Challenge 2 — Tower Range Indicator**

When you hover over a placed tower, draw a ring on the ground showing its range. Remove the ring when the mouse moves away.

Hints:
- `THREE.RingGeometry(innerRadius, outerRadius, segments)` creates a flat ring mesh
- The ring should be flat on the XZ plane: `rotation.x = -Math.PI / 2`, positioned at y = 0.01 (just above the tiles)
- Listen for `mousemove` on `renderer.domElement`; use the raycaster to find which tower mesh was hovered (you will need to collect tower meshes the same way you collect tile meshes)
- Add `showRange()` and `hideRange()` methods to `Tower`, or store the ring in a module-level variable and reuse it

<details>
<summary>Solution</summary>

```ts
// After tower classes, before constants:
const rangeRingMesh = (() => {
  const geo = new THREE.RingGeometry(0, 1, 48);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.01;
  mesh.visible = false;
  scene.add(mesh);
  return mesh;
})();

renderer.domElement.addEventListener('mousemove', (event) => {
  const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
  const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

  const towerMeshes = towers.map((t) => t.mesh);
  const hits = raycaster.intersectObjects(towerMeshes);

  if (hits.length > 0) {
    const hitTower = towers.find((t) => t.mesh === hits[0].object);
    if (hitTower) {
      rangeRingMesh.position.x = hitTower.mesh.position.x;
      rangeRingMesh.position.z = hitTower.mesh.position.z;
      rangeRingMesh.scale.set(hitTower.range, hitTower.range, 1);
      rangeRingMesh.visible = true;
    }
  } else {
    rangeRingMesh.visible = false;
  }
});
```

`scale.set(range, range, 1)` scales the ring's radius from 1 unit to `range` units. The ring geometry has outer radius 1, so scaling it by `range` gives a ring of the correct size. The Z scale is 1 because the ring is flat.

The IIFE (`(() => { ... })()`) creates the ring once immediately. It is always in the scene but hidden; only the position and scale change.

</details>

---

**Challenge 3 — Enemy Health Bar**

Add a small health bar above each enemy sphere. The bar should shrink from full width to zero as health decreases.

Hints:
- Two `BoxGeometry` meshes: one grey background bar and one green/yellow/red foreground bar
- Both bars are children of the enemy mesh: `this.mesh.add(backgroundBar)` — child meshes move with their parent automatically
- Position bars at `y = 0.6` (above the sphere center)
- In `takeDamage`, update the foreground bar's `scale.x` to `this.health / this.maxHealth`
- Child mesh positions are relative to the parent mesh's center

<details>
<summary>Solution</summary>

In the Enemy constructor, after creating `this.mesh`:

```ts
// Background bar (grey, full width)
const bgGeo = new THREE.BoxGeometry(0.6, 0.06, 0.06);
const bgMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
const bgBar = new THREE.Mesh(bgGeo, bgMat);
bgBar.position.y = 0.6;
this.mesh.add(bgBar);

// Foreground bar (green, shrinks with health)
const fgGeo = new THREE.BoxGeometry(0.6, 0.06, 0.06);
this.healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
this.healthBar = new THREE.Mesh(fgGeo, this.healthBarMaterial);
this.healthBar.position.y = 0.6;
this.mesh.add(this.healthBar);
```

Add to Enemy class properties:
```ts
private healthBar!: THREE.Mesh;
private healthBarMaterial!: THREE.MeshBasicMaterial;
```

In `takeDamage`, after the color update:
```ts
const t = this.health / this.maxHealth;
this.healthBar.scale.x = Math.max(0.001, t); // avoid zero scale (Three.js issue)
// Color: green → yellow → red
if (t > 0.5) {
  this.healthBarMaterial.color.setRGB((1 - t) * 2, 1, 0); // green to yellow
} else {
  this.healthBarMaterial.color.setRGB(1, t * 2, 0);       // yellow to red
}
```

`scale.x = t` shrinks the bar left-to-right as health drops. Because the box is centered, it shrinks from both sides — to fix that, offset the bar's x position to keep it left-aligned. That is a minor cosmetic detail; the core behavior works without it.

The `!` in `private healthBar!: THREE.Mesh` is the *definite assignment assertion* — it tells TypeScript "I promise this will be assigned before it is used," even though TypeScript cannot verify that just by reading the constructor sequentially.

</details>

---

## Quick Check Answers

1. **Distance between tower `(1, 0)` and enemy `(4, 4)`:**
`dx = 4 - 1 = 3`, `dz = 4 - 0 = 4`. Distance = `√(3² + 4²)` = `√(9 + 16)` = `√25` = `5.0`.

2. **Damage per frame at 60 FPS:** `30 damage/sec * 0.0167 sec/frame ≈ 0.5 damage/frame`. Over 200 frames (about 3.3 seconds): `0.5 * 200 = 100` — enough to kill a 100hp enemy.

3. **Which enemy to target:** The one at distance 1.8 (nearest in range). Distance 2.5 is outside range 2.0, so it is excluded. Among 1.5 and 1.8, the nearest is 1.5. The "nearest" strategy focuses fire on enemies that have the best chance of being in range long enough to kill — enemies just entering range at 1.8 might exit before dying, while the one at 1.5 is deeper in the kill zone.

---

## Final Check

| # | Check | Expected result |
|---|---|---|
| 1 | Enemy spawns | Orange-red sphere at path start |
| 2 | Enemy enters tower range | Sphere shifts toward deeper red |
| 3 | Tower kills enemy | Sphere vanishes, no life lost |
| 4 | Enemy escapes all towers | Sphere exits path, life decremented |
| 5 | Multiple towers placed | Each targets its own nearest in-range enemy |
| 6 | SniperTower vs Wave 1 | Kills enemies cleanly with range to spare |
| 7 | SniperTower vs Wave 3 | Enemies survive with a sliver of health — need a second tower |
| 8 | Wave progress count | Counts down correctly even when enemies die mid-path |
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
    }
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
      damage: 25,
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
      damage: 60,
    });
  }
}

type TowerType = 'basic' | 'sniper';

// --- Enemy ---

class Enemy {
  readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly worldPath: THREE.Vector3[];
  private waypointIndex: number = 0;
  readonly speed: number;
  readonly maxHealth: number = 100;
  health: number = 100;
  done: boolean = false;
  escaped: boolean = false;

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

  takeDamage(amount: number): void {
    if (this.done) return;
    this.health = Math.max(0, this.health - amount);
    const t = this.health / this.maxHealth;
    this.material.color.setRGB(1.0, t * 0.4, 0.0);
    if (this.health <= 0) {
      this.done = true;
    }
  }

  update(deltaTime: number): void {
    if (this.done) return;
    if (this.waypointIndex >= this.worldPath.length) {
      this.escaped = true;
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
      if (enemy.escaped) {
        lives = Math.max(0, lives - 1);
        gameEvents.emit('livesChanged', lives);
      } else {
        gameEvents.emit('enemyKilled', enemy);
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

> **Lab 14 Preview:** The game can now be won (all waves cleared with lives remaining) or lost (lives reach zero). Lab 14 introduces game state — a `GameState` type that moves from `'playing'` to `'gameover'` or `'won'`. Input is locked out in non-playing states. A score system rewards killing enemies. A full-screen overlay announces the outcome. Press `R` to reset everything and play again.
