# TypeScript Tower Defense — LAB 15 — Template Method Pattern

**Prerequisites:** Lab 14 complete. The game has win/lose states, score, and a reset function.

**What this lab adds:**
- `protected` — a third access level between `public` and `private`
- The `override` keyword — explicitly marking that a method replaces a parent method
- The **Template Method Pattern** — the base class defines an algorithm's shape; subclasses fill in optional steps
- Slow debuff on `Enemy` — `applySlowEffect()` reduces movement speed temporarily
- `SniperTower` gets an `onKill` override — a chain shot damages a second nearby enemy
- New `CannonTower` class — wide, low, brown; applies the slow debuff on every damage tick
- Key `3` selects the cannon tower

**Time:** 60–90 minutes.

---

## What You Will Build

Three distinct tower types with genuinely different behaviors:

```
Basic Tower [1]      Sniper Tower [2]      Cannon Tower [3]
─────────────────    ─────────────────    ─────────────────
Blue, mid height     Grey, tall            Brown, short/wide
Range: 1.5           Range: 3.5            Range: 2.0
Damage: 25/s         Damage: 60/s          Damage: 20/s
No special           On kill: chain        Always: slows target
                     50% damage to         to 50% speed for
                     a second enemy        1 second
```

Slowed enemies turn blue-purple and visibly move slower. Fast Wave 3 enemies stopped in a cannon's range become easy pickings for a sniper behind it — the first real synergy between tower types.

---

> **Quick Check — try to answer before reading further:**
>
> 1. The `dispose()` method on `Tower` is useful from outside the class — the game loop calls it. Should it be `public`, `protected`, or `private`? What about an `onKill()` hook that only subclasses should call or override?
> 2. You want to add an `onKill()` behavior to `SniperTower`. You could copy-paste the entire `Tower.update()` method into `SniperTower` and add your logic there. What is the problem with that approach?
> 3. The word "override" means to replace an inherited definition with a new one. TypeScript has an `override` keyword — why bother with it if the method would be replaced automatically anyway?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand the Concepts Before Touching Code

---

### Concept: `protected` — The Middle Ground

You have seen two access levels:
- `private` — only accessible within the declaring class
- `public` (the default) — accessible everywhere

`protected` sits between them:

```ts
class Animal {
  private heartRate: number = 60;       // only Animal can read this
  protected breathe(): void { /* ... */ } // Animal AND subclasses can call this
  public eat(): void { /* ... */ }       // anyone can call this
}

class Dog extends Animal {
  bark(): void {
    this.breathe(); // ✓ allowed — protected, and Dog is a subclass
    this.heartRate; // ✗ error — private to Animal only
  }
}

const dog = new Dog();
dog.breathe(); // ✗ error — protected, not accessible from outside the class hierarchy
dog.eat();     // ✓ allowed — public
```

**When to use `protected`:** For methods or properties that are implementation details shared between a class and its subclasses, but that external code should not depend on. Hook methods are the canonical example — they exist to be overridden, not to be called directly from outside.

---

### Concept: The `override` Keyword

When a subclass defines a method with the same name as a method in its parent class, that method is overridden. TypeScript will silently accept this — but if you mistype the name, you accidentally create a new method instead of overriding the intended one:

```ts
class SniperTower extends Tower {
  onKill(target: Enemy): void { /* logic */ }  // typo check: is 'onKill' right?
}
```

The `override` keyword makes TypeScript verify that the method actually exists in the parent:

```ts
class SniperTower extends Tower {
  override onKill(target: Enemy): void { /* logic */ } // ✓ parent has onKill — confirmed
}

class SniperTower extends Tower {
  override onkill(target: Enemy): void { /* logic */ } // ✗ ERROR: 'onkill' not in Tower
}
```

`override` catches the bug at compile time. Without it, the bug would be invisible — `onkill` would exist but never be called, since `Tower.update()` calls `onKill`.

**Rule of thumb:** Always write `override` when intentionally replacing a parent method. It is cheap to type and prevents a category of silent bugs.

---

### Concept: The Template Method Pattern

The Template Method Pattern is a way to define the skeleton of an algorithm in a base class while letting subclasses supply specific steps without changing the skeleton itself.

In plain terms: the base class says "here is how the algorithm works — but step 3 and step 5 are hooks that subclasses can replace."

```ts
abstract class Tower {
  update(deltaTime: number, activeEnemies: Enemy[]): void {
    // Step 1: find nearest enemy (defined here — same for all towers)
    const target = this.findTarget(activeEnemies);
    if (target === null) return;

    // Step 2: deal damage (defined here — same for all towers)
    target.takeDamage(this.damage * deltaTime);

    // Step 3: subclass hook — optional behavior after damage
    this.onDamageDealt(target);

    // Step 4: check for kill (defined here — same for all towers)
    if (target.done) {
      // Step 5: subclass hook — optional behavior on kill
      this.onKill(target, activeEnemies);
    }
  }

  protected onDamageDealt(target: Enemy): void {}      // default: do nothing
  protected onKill(target: Enemy, allEnemies: Enemy[]): void {} // default: do nothing
}
```

`BasicTower` adds no overrides — the hooks are empty, and that is fine. `CannonTower` overrides `onDamageDealt`. `SniperTower` overrides `onKill`. The `update()` skeleton is defined once and shared by all three.

**You will see this pattern in:** Express.js middleware, React's lifecycle hooks (`componentDidMount`, `componentDidUpdate`), game engine entity hooks (`onStart`, `onUpdate`, `onDestroy`), Django class-based views, and Java Spring controllers.

---

## Step 2 — Add Slow Mechanics to the Enemy Class

Open `src/main.ts`. You will make several small additions to `Enemy` in this step. Go to the `Enemy` class.

### 2a — Add slow properties

Find the existing property declarations at the top of the `Enemy` class:

```ts
  done: boolean = false;
  escaped: boolean = false;
```

Add two more after them:

```ts
  done: boolean = false;
  escaped: boolean = false;
  slowTimer: number = 0;
  slowMultiplier: number = 1.0;
```

`slowTimer: number = 0`
A countdown in seconds. When greater than 0, the enemy is slowed. Each frame, the game loop decrements it by `deltaTime`. When it reaches 0, the slow expires.

`slowMultiplier: number = 1.0`
The fraction of normal speed the enemy currently moves at. `1.0` = full speed. `0.5` = half speed. Applied during movement: `this.speed * this.slowMultiplier`.

> **SAVE AND TRY:** Two new properties added. No visible change. No TypeScript errors.

---

### 2b — Extract `updateColor()` into its own method

Currently `takeDamage()` updates the color inline. With slow now also affecting color, it is cleaner to extract that logic into one private method.

Find `takeDamage()` and locate this block inside it:

```ts
    const t = this.health / this.maxHealth;
    this.material.color.setRGB(1.0, t * 0.4, 0.0);
```

Replace just those two lines with a single call:

```ts
    this.updateColor();
```

Then add the new `private updateColor()` method anywhere inside the `Enemy` class (before or after `takeDamage`, your choice):

```ts
  private updateColor(): void {
    const t = this.health / this.maxHealth;
    if (this.slowTimer > 0) {
      this.material.color.setRGB(t * 0.5, t * 0.3, 1.0);
    } else {
      this.material.color.setRGB(1.0, t * 0.4, 0.0);
    }
  }
```

**Line by line:**

`const t = this.health / this.maxHealth`
Same health ratio as before: 1.0 = full health, 0.0 = dead.

`if (this.slowTimer > 0)`
Are we currently slowed? If yes, use the slow color palette.

`this.material.color.setRGB(t * 0.5, t * 0.3, 1.0)`
Slowed color: blue channel is always `1.0` — the enemy glows blue/purple. Red and green fade with health just like the normal palette, but dominated by the blue channel.

`this.material.color.setRGB(1.0, t * 0.4, 0.0)`
Normal color: unchanged from Lab 13 — orange at full health, red when damaged.

> **SAVE AND TRY:** Behavior is identical to before — `takeDamage` now calls `updateColor()` instead of doing it inline. No TypeScript errors. No visible change.

---

### 2c — Add `applySlowEffect()`

Add this method to `Enemy`:

```ts
  applySlowEffect(duration: number, multiplier: number): void {
    this.slowTimer = duration;
    this.slowMultiplier = multiplier;
    this.updateColor();
  }
```

`slowTimer = duration`
Resets (or sets) the countdown. If the enemy is already slowed and another cannon hits it, the timer is refreshed — the slow does not stack but it does renew.

`slowMultiplier = multiplier`
Sets the speed fraction. `0.5` means half speed. The caller decides the severity.

`this.updateColor()`
Immediately updates the visual — the enemy turns blue the instant the slow is applied, without waiting for the next damage tick.

> **SAVE AND TRY:** `applySlowEffect` is written. Nothing calls it yet. No TypeScript errors.

---

### 2d — Apply the slow in `Enemy.update()`

Find the `update` method inside `Enemy`. Near the top, after the guard checks, add the slow timer countdown:

```ts
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
```

**What changed:**

```ts
    if (this.slowTimer > 0) {
      this.slowTimer -= deltaTime;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowMultiplier = 1.0;
        this.updateColor();
      }
    }
```
Each frame, `slowTimer` counts down. When it reaches zero or below, the slow expires: `slowMultiplier` returns to `1.0` and `updateColor()` removes the blue tint.

```ts
    const currentSpeed = this.speed * this.slowMultiplier;
    this.mesh.position.x += nx * currentSpeed * deltaTime;
    this.mesh.position.z += nz * currentSpeed * deltaTime;
```
The movement uses `currentSpeed` — the base speed scaled by the multiplier — instead of `this.speed` directly.

> **SAVE AND TRY:** Start a wave and let enemies walk. They should look and behave exactly as before — the slow is never triggered yet because nothing calls `applySlowEffect`. This confirms the slow timer machinery does not break normal behavior. No TypeScript errors.

---

## Step 3 — Add Hook Methods to the Tower Base Class

Find the `Tower` abstract class. You will make two changes: add the hooks and refactor `update()` to call them.

### 3a — Add the protected hook methods

Find the `dispose` method in `Tower`. Add the two hooks just before it:

```ts
  protected onDamageDealt(target: Enemy): void {}

  protected onKill(target: Enemy, allEnemies: Enemy[]): void {}

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
```

**Line by line:**

`protected onDamageDealt(target: Enemy): void {}`
Fires every frame a tower deals damage to its target. The default is an empty body — `{}` — meaning "do nothing." Subclasses can override this to add behavior without touching the skeleton.

`protected onKill(target: Enemy, allEnemies: Enemy[]): void {}`
Fires the frame a tower kills its target (the frame `target.done` flips to `true`). Also a no-op default. Takes `allEnemies` so the sniper chain shot can search for a second target.

`protected`
Both hooks are `protected`: subclasses need to override them, but nothing outside the class hierarchy should call `tower.onDamageDealt()` or `tower.onKill()` directly. They are internal implementation details.

> **SAVE AND TRY:** Two empty protected methods added. No TypeScript errors. No visible change.

---

### 3b — Update `Tower.update()` to call the hooks

Find `Tower.update()`. It currently looks like this:

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

Replace the last `if` block with:

```ts
    if (target !== null) {
      target.takeDamage(this.damage * deltaTime);
      this.onDamageDealt(target);
      if (target.done) {
        this.onKill(target, activeEnemies);
      }
    }
```

`this.onDamageDealt(target)`
Called after damage is applied, every frame the tower is firing. For `BasicTower`, this does nothing (empty default). For `CannonTower`, it will apply the slow.

`if (target.done)`
`takeDamage()` sets `done = true` when health hits 0. If the enemy just died from this damage tick, `target.done` is now `true`.

`this.onKill(target, activeEnemies)`
Called once — the frame the kill happens. For `BasicTower` and `CannonTower`, this does nothing. For `SniperTower`, it fires a chain shot.

> **SAVE AND TRY:** The hooks are wired in. Basic and sniper towers behave exactly as before — they call empty default hooks. No TypeScript errors. No visible change.

---

## Step 4 — Override `onKill` on `SniperTower`

Find the `SniperTower` class. It currently has only a constructor. Add the override after it:

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

  protected override onKill(target: Enemy, allEnemies: Enemy[]): void {
    for (const enemy of allEnemies) {
      if (enemy === target) continue;
      if (enemy.done) continue;
      const dx = enemy.mesh.position.x - this.mesh.position.x;
      const dz = enemy.mesh.position.z - this.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= this.range) {
        enemy.takeDamage(this.damage * 0.5);
        break;
      }
    }
  }
}
```

**Line by line:**

`protected override onKill(target: Enemy, allEnemies: Enemy[]): void`
`protected` matches the parent's visibility. `override` confirms this replaces `Tower.onKill` — TypeScript will error if the name is misspelled.

`for (const enemy of allEnemies)`
Searches all currently active enemies for a chain target.

`if (enemy === target) continue`
Skips the enemy that was just killed. `===` for objects checks identity — it is `true` only when both sides point to the exact same object in memory.

`if (enemy.done) continue`
Skips any other enemy that is already dead this frame (killed by a different tower).

`if (dist <= this.range)`
The chain only reaches enemies within the same range as the primary shot. The sniper's long range means multiple enemies may qualify — `break` ensures only the first (nearest-to-kill in iteration order) receives the chain damage.

`enemy.takeDamage(this.damage * 0.5)`
Half the sniper's normal damage as a chain hit. `this.damage` is `60`, so `30` chain damage.

`break`
Stops after one chain target. No cascading chains.

> **SAVE AND TRY:** Place a sniper tower and start a wave. When the sniper kills an enemy, the next nearby enemy should receive an instant 30 damage (visible as a sudden color shift). This may be hard to see on fast enemies — place two snipers side by side and watch closely.

---

## Step 5 — Add the `CannonTower` Class

### 5a — The class and config

Find `SniperTower` (or wherever the tower classes end). Add `CannonTower` after it:

```ts
class CannonTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.3,
      bottomRadius: 0.42,
      height: 0.9,
      color: 0x885522,
      range: 2.0,
      damage: 20,
    });
  }
}
```

**The config values:**

`topRadius: 0.3, bottomRadius: 0.42` — wider than Basic (0.25/0.35). Looks short and stocky.
`height: 0.9` — shorter than Basic (1.2). Sits low on the tile.
`color: 0x885522` — earthy brown. Visually distinct from blue Basic and grey Sniper.
`range: 2.0` — medium range. Wide enough to slow enemies for a meaningful duration.
`damage: 20` — lower than Basic. This tower's value is the slow, not raw damage.

> **SAVE AND TRY:** `CannonTower` is defined but not yet selectable. If you temporarily add `new CannonTower(someTile)` and place it, you should see a brown, short, wide cylinder. Remove that test code before continuing. No TypeScript errors.

---

### 5b — Override `onDamageDealt` to apply the slow

Add the override inside `CannonTower`, after the constructor:

```ts
class CannonTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.3,
      bottomRadius: 0.42,
      height: 0.9,
      color: 0x885522,
      range: 2.0,
      damage: 20,
    });
  }

  protected override onDamageDealt(target: Enemy): void {
    target.applySlowEffect(1.0, 0.5);
  }
}
```

`target.applySlowEffect(1.0, 0.5)`
`duration: 1.0` — the slow lasts 1 second after the last cannon hit. Since the cannon fires 60 times per second, the slow is effectively permanent while the enemy is in range.
`multiplier: 0.5` — reduces speed to 50%. Wave 3 enemies at 2.8 speed become 1.4 while slowed.

`onDamageDealt` fires every frame the cannon damages its target — so the slow timer is continuously refreshed. The enemy stays slowed for as long as it remains in range, then recovers 1 second after leaving it.

> **SAVE AND TRY:** Cannon is defined with its behavior. Still not selectable from the keyboard. No TypeScript errors. No visible change yet.

---

## Step 6 — Make Cannon Selectable

### 6a — Update the `TowerType` union

Find:

```ts
type TowerType = 'basic' | 'sniper';
```

Change to:

```ts
type TowerType = 'basic' | 'sniper' | 'cannon';
```

TypeScript will now expect all switch-like constructs over `TowerType` to handle `'cannon'`. If you missed any, TypeScript shows an error — exhaustiveness checking in action.

> **SAVE AND TRY:** TypeScript may now show errors in `placeTower` and `updateHUD` because they don't handle `'cannon'` yet. Fix those in the next two sub-steps.

---

### 6b — Update `placeTower`

Find `placeTower`. It currently uses a ternary:

```ts
function placeTower(tile: Tile): void {
  const tower: Tower =
    activeTowerType === 'basic' ? new BasicTower(tile) : new SniperTower(tile);
```

Replace with an if/else chain that covers all three types:

```ts
function placeTower(tile: Tile): void {
  let tower: Tower;
  if (activeTowerType === 'basic') {
    tower = new BasicTower(tile);
  } else if (activeTowerType === 'sniper') {
    tower = new SniperTower(tile);
  } else {
    tower = new CannonTower(tile);
  }
```

`let tower: Tower` — declared without assignment. TypeScript knows the if/else chain assigns it in all branches, so it is satisfied. `else` covers `'cannon'` since the union has only three values.

---

### 6c — Update `updateHUD` and the keydown listener

Find `updateHUD`. Replace the type label line:

```ts
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';
```

With:

```ts
  const typeLabel =
    activeTowerType === 'basic'  ? 'Basic [1]'  :
    activeTowerType === 'sniper' ? 'Sniper [2]' :
                                   'Cannon [3]';
```

Find the `keydown` listener. Add the `'3'` case:

```ts
  if (event.key === '3' && gameState === 'playing') {
    activeTowerType = 'cannon';
    gameEvents.emit('typeChanged', activeTowerType);
  }
```

> **SAVE AND TRY:** Press `3` — the HUD should show `Cannon [3]`. Click a green tile — a brown, short, wide cylinder appears. Start a wave. Watch enemies enter cannon range: they immediately shift to blue-purple and visibly slow down. Watch them leave cannon range after 1 second — they return to the orange color and accelerate back to full speed.

---

## Step 7 — Try the Tower Synergy

This is the first lab where tower placement strategy matters beyond "more towers = better."

**Setup to try:**
1. Place a cannon tower on row 4, col 1 (just left of the path bend)
2. Place a sniper tower on row 4, col 6 (just right of the long straight)
3. Start Wave 3

The cannon slows enemies through the bend. The sniper picks off slowed enemies in the long straight and chains its kills. Wave 3 enemies that would have blitzed through at speed 2.8 now crawl at 1.4 through the sniper's kill zone.

---

## Challenges

---

**Challenge 1 — Double Slow**

Make the `CannonTower` deal reduced damage to slowed enemies (they are already impeded) but apply a stronger slow of 0.3 multiplier instead of 0.5.

Hints:
- Check `target.slowTimer > 0` inside `onDamageDealt`
- If already slowed, call `applySlowEffect(1.0, 0.3)` instead of `applySlowEffect(1.0, 0.5)`

<details>
<summary>Solution</summary>

```ts
protected override onDamageDealt(target: Enemy): void {
  if (target.slowTimer > 0) {
    target.applySlowEffect(1.0, 0.3); // already slowed — apply stronger slow
  } else {
    target.applySlowEffect(1.0, 0.5); // fresh slow
  }
}
```

`target.slowTimer > 0` reads a public property — `slowTimer` is not `private` or `protected`, so Tower subclasses can read it. The enemy's internal state is accessible from external code.

</details>

---

**Challenge 2 — SniperTower Visual "Pulse" on Kill**

When the sniper kills an enemy, briefly flash the tower's mesh white, then return to grey. This gives visual feedback that the kill chain fired.

Hints:
- The tower mesh material is typed as `Material | Material[]` — cast it with `this.mesh.material as THREE.MeshStandardMaterial`
- Store the original color, set white, then use `setTimeout(() => { ... }, 80)` to restore it after 80ms
- 80ms is fast enough to be a flash but long enough to see

<details>
<summary>Solution</summary>

```ts
protected override onKill(target: Enemy, allEnemies: Enemy[]): void {
  // Chain shot logic (from Step 4) ...

  // Visual flash
  const mat = this.mesh.material as THREE.MeshStandardMaterial;
  const originalColor = mat.color.getHex();
  mat.color.setHex(0xffffff);
  setTimeout(() => {
    mat.color.setHex(originalColor);
  }, 80);
}
```

`mat.color.getHex()` returns the current color as a number (e.g., `0x778899`). This captures it before the flash so it can be restored correctly.

`setTimeout` is the browser's built-in timer: "run this function once after N milliseconds." It does not use the game loop's delta time — it fires independently. For a 80ms cosmetic flash this is fine; for gameplay logic, always use the accumulator pattern instead.

</details>

---

**Challenge 3 — `freezeTime` Property on Tower**

Add an optional `freezeTime` value to `TowerConfig` (default `0`). If a tower has `freezeTime > 0`, it completely stops an enemy's movement (multiplier 0) for that many seconds instead of slowing it. Create an `IceTower` class that uses this.

Hints:
- Add `freezeTime?: number` to `TowerConfig` (the `?` makes it optional)
- In `onDamageDealt`, use `config.freezeTime ?? 0` — `??` returns the right value if the left is `undefined`
- `applySlowEffect(freezeTime, 0)` is "freeze" — multiplier 0 means no movement

<details>
<summary>Solution</summary>

```ts
// Add to TowerConfig:
freezeTime?: number;

class IceTower extends Tower {
  private readonly freezeDuration: number;

  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.2,
      bottomRadius: 0.3,
      height: 1.5,
      color: 0x88ccff,
      range: 1.8,
      damage: 10,
      freezeTime: 0.8,
    });
    this.freezeDuration = 0.8;
  }

  protected override onDamageDealt(target: Enemy): void {
    target.applySlowEffect(this.freezeDuration, 0.01); // nearly zero movement
  }
}
```

`slowMultiplier = 0` would cause a division-by-zero in any code dividing by the multiplier. `0.01` is effectively stopped and avoids that edge case. For a full freeze effect, add an `isFrozen` flag to Enemy and skip movement entirely when set — but that is a larger change.

</details>

---

## Quick Check Answers

1. **Access level for `dispose()` vs `onKill()`:** `dispose()` is called by external game-loop code — it must be `public` (the default). `onKill()` is an implementation detail for subclasses only — it should be `protected`. External code should never need to call `tower.onKill()` directly; only `Tower.update()` calls it as part of the algorithm.

2. **Problem with copy-pasting `update()` into `SniperTower`:** The targeting logic (the `for` loop, distance calculation, closest-dist tracking) is now duplicated. If it needs to change — a bug fix, a performance improvement, a targeting mode switch — it must be changed in every copy. They will drift apart over time. One change is safe; n copies is risky. Inheritance with hooks exists precisely to avoid this.

3. **Why `override` when the method replaces automatically anyway:** Without `override`, a typo like `onkill` silently adds a new method that never gets called — the parent's empty hook runs instead, and the bug is invisible. `override` tells TypeScript to verify the parent actually has that method name, catching the bug at compile time before the code runs.

---

## Final Check

| # | Check | Expected result |
|---|---|---|
| 1 | Page loads | HUD shows "Press Space to start  \|  Basic [1]" |
| 2 | Press `3` | HUD updates to show "Cannon [3]" |
| 3 | Click tile with cannon selected | Short brown cylinder appears |
| 4 | Enemy enters cannon range | Enemy shifts to blue-purple, visibly slows |
| 5 | Enemy leaves cannon range | Returns to orange within 1 second, speed recovers |
| 6 | Sniper kills an enemy with another nearby | Second enemy takes an immediate damage hit |
| 7 | Cannon + sniper together | Slowed enemies die faster — tower synergy works |
| 8 | Press `1`, `2`, `3` | HUD label updates correctly each time |
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

  protected override onKill(target: Enemy, allEnemies: Enemy[]): void {
    for (const enemy of allEnemies) {
      if (enemy === target) continue;
      if (enemy.done) continue;
      const dx = enemy.mesh.position.x - this.mesh.position.x;
      const dz = enemy.mesh.position.z - this.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= this.range) {
        enemy.takeDamage(this.damage * 0.5);
        break;
      }
    }
  }
}

class CannonTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.3,
      bottomRadius: 0.42,
      height: 0.9,
      color: 0x885522,
      range: 2.0,
      damage: 20,
    });
  }

  protected override onDamageDealt(target: Enemy): void {
    target.applySlowEffect(1.0, 0.5);
  }
}

type TowerType = 'basic' | 'sniper' | 'cannon';

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
  slowTimer: number = 0;
  slowMultiplier: number = 1.0;

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

  let waveLabel: string;
  if (currentWaveIndex < 0) {
    waveLabel = 'Press Space to start';
  } else if (waveActive) {
    const wave = WAVES[currentWaveIndex];
    const remaining = (wave.enemyCount - enemiesSpawnedThisWave) + enemies.length;
    waveLabel = 'Wave ' + (currentWaveIndex + 1) + '/' + WAVES.length + '  Enemies: ' + remaining;
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
        const points = Math.round(enemy.speed * 50);
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

> **Lab 16 Preview:** All enemies are identical spheres of the same size and health. Lab 16 applies the same inheritance pattern you used for towers to enemies: `Enemy` becomes an abstract base class with an `EnemyConfig` object, and three concrete subclasses — `BasicEnemy`, `ArmoredEnemy` (double health, large, brown, slow), and `FastEnemy` (half health, small, yellow, very fast) — replace it. The `WaveConfig` interface gains an `enemyType` field, and `spawnEnemy` becomes a factory that creates the right type. You will recognise every step from Lab 09.
