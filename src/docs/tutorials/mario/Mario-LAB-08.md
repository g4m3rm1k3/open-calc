# Mario Platformer — LAB 08 — The Enemy Class

**Prerequisites:** LAB-07 complete. Camera follows player. Level has real tiles.
Player animates correctly. No enemies exist yet.

**What this lab adds:**
- `class Enemy extends Phaser.Physics.Arcade.Sprite` in `src/Enemy.ts`
- Patrol behavior: enemy moves horizontally, reverses on wall contact
- `time.delayedCall` — a Phaser timer used for the death sequence
- Stomp detection: landing on enemy from above kills it; side contact kills the player

**Time:** 60–75 minutes

---

## What You Will Build

```
┌──────────────────────────────┐
│                              │
│  [Player]                    │
│       ↓ (jumps on enemy)     │
│    [Enemy] → ← patrol →      │ ← enemy reverses at walls
│                              │
│██████████████████████████████│
└──────────────────────────────┘

Stomp: enemy flashes white, disappears after 200ms
Side touch: player placeholder death flash (full death in LAB-10)
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. How can we tell if a player-enemy contact is a stomp vs a side-hit —
>    what two conditions together identify a stomp?
> 2. Should the player-enemy interaction use `collider` or `overlap`? Why?
> 3. *(Prediction)* If the enemy spawns at x=0 (touching the left wall), what
>    happens on the very first frame given the current patrol logic?
>
> *(Answers at the end of this lab)*

---

## Concept: `this.scene.time.delayedCall` — A One-Shot Timer

**What it is:** `time.delayedCall(delay, callback)` schedules a function to
run once after a specified number of milliseconds.

**What it hides:** The alternative — tracking a timer manually in `update()`:

```ts
// Manual timer (what you would write without delayedCall):
private deathTimer: number = 0;
update(delta) {
  if (this.isDying) {
    this.deathTimer += delta;
    if (this.deathTimer >= 200) {
      this.destroy();
    }
  }
}
```

`delayedCall` replaces all of that with one line:

```ts
this.scene.time.delayedCall(200, () => { this.destroy(); });
```

**The protected invariant:** The timer is registered with the scene. If the
scene stops before the delay expires, the callback is never called. You never
need to cancel it manually on scene shutdown.

**Term: callback** — A function passed as a value to be called later.
The arrow function `() => { this.destroy(); }` is a callback — it is not
called now; it is called by `delayedCall` after 200ms.

**Watch for:** `this.scene.time.delayedCall` — note `this.scene`. Inside the
`Enemy` class, `this` refers to the enemy sprite. The `time` system belongs
to the scene, not to the sprite. Access it through `this.scene.time`.

---

## Logic: The Stomp Condition

**What it decides:** Whether a player-enemy contact is a stomp (from above,
player wins) or a side-hit (from the side, player loses).

**Truth table:**

```
player.y < enemy.y - 8   player.body.velocity.y > 0   → Result
  false                    (any)                        → side-hit (player too low or level)
  true                     false                        → side-hit (player above but not falling)
  true                     true                         → STOMP (player above AND falling down)
```

**The two conditions explained:**

```
Condition 1: player.y < enemy.y - 8
  player.y: the CENTER y of the player sprite.
  enemy.y:  the CENTER y of the enemy sprite.
  If player center is 8+ pixels above enemy center, the player is clearly above.
  The -8 tolerance prevents the condition from triggering when player and enemy
  are side-by-side at the same y height.

Condition 2: player.body.velocity.y > 0
  velocity.y > 0 means the player is moving DOWNWARD (positive y = downward in Phaser).
  This distinguishes "standing next to a taller object" from "falling onto it."
  A player standing at y=100 next to an enemy at y=108 satisfies condition 1 but
  NOT condition 2 (velocity.y ≈ 0 when standing) → correctly identified as side-hit.
```

**The code:**

```ts
const isStomping =
  player.y < enemy.y - 8 &&
  (player.body as Phaser.Physics.Arcade.Body).velocity.y > 0;
```

---

## Step 1 — Create `src/Enemy.ts`

Create `src/Enemy.ts`. Write the constructor and `die()` method first, leaving
`update()` as a stub:

```ts
// src/Enemy.ts

const ENEMY_SPEED: number = 80;    // patrol speed in px/s
const ENEMY_WIDTH: number = 24;    // physics body width
const ENEMY_HEIGHT: number = 24;   // physics body height

export class Enemy extends Phaser.Physics.Arcade.Sprite {

  private isDead: boolean = false;
  // isDead: prevents the overlap callback from calling die() multiple times
  // during the same death frame. Without this guard, one stomp could trigger
  // die() repeatedly before the sprite is removed.

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-placeholder');
    // 'enemy-placeholder': generated in GameScene.preload() — a red square.

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    // Stop the enemy at world edges rather than walking off into empty space.

    this.setVelocityX(-ENEMY_SPEED);
    // Start moving left immediately. reverseDirection() flips this when needed.
  }

  // reverseDirection: flips horizontal velocity and sprite facing.
  private reverseDirection(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.setVelocityX(-body.velocity.x);
    // Negate current x velocity:
    // If moving at -80 (left), new velocity = +80 (right).
    // If moving at +80 (right), new velocity = -80 (left).

    this.setFlipX(body.velocity.x < 0);
    // After velocity is set: if now moving right (positive), flip = false.
    // If now moving left (negative), flip = true (face left).
    // Note: flip is set AFTER the velocity change — reads the new velocity.
  }

  // die: called when the player stomps this enemy.
  public die(): void {
    if (this.isDead) return;     // guard: only die once
    this.isDead = true;

    this.setVelocityX(0);        // stop patrol movement

    this.setTint(0xffffff);      // flash white — visual feedback for the player
    // setTint(0xffffff): white tint overlays the sprite's original colors.

    this.scene.time.delayedCall(200, () => {
      this.destroy();
      // destroy(): removes this sprite from the display list, physics world,
      // and any groups it belongs to. After 200ms the enemy disappears.
    });
  }

  // update: called by GameScene every frame. Handles patrol logic.
  public update(): void {
    // Added in Step 2.
  }
}
```

### SAVE AND TRY

Save `src/Enemy.ts`. No visual change — the file exists but is not imported.

**In DevTools Console:** No test yet. TypeScript errors (if any) appear in
the editor's Problems panel — fix before proceeding.

---

## Step 2 — Generate Enemy Texture and Spawn Enemies in `GameScene`

Open `src/scenes/GameScene.ts`. Add an `enemies` property and the enemy texture,
then spawn two enemies — but leave `Enemy.update()` empty for now. We want to
see enemies standing still before adding patrol logic.

```ts
import { Player, PLAYER_WIDTH, PLAYER_HEIGHT } from '../Player';
import { Enemy } from '../Enemy';   // ← add this import

export class GameScene extends Phaser.Scene {

  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;   // ← add property
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
```

In `preload()`, generate the enemy placeholder texture:

```ts
    // After existing load calls, add:
    const enemyGfx = this.make.graphics({ x: 0, y: 0 });  // ← add this block
    enemyGfx.fillStyle(0xFF4444);    // red — distinct from player (teal) and ground (brown)
    enemyGfx.fillRect(0, 0, 24, 24);
    enemyGfx.generateTexture('enemy-placeholder', 24, 24);
    enemyGfx.destroy();
```

In `create()`, after the player collider, add:

```ts
    // ── Enemies ───────────────────────────────────────────────────────────

    // A physics Group holds dynamic bodies. Unlike StaticGroup, Group members
    // can move — velocity and gravity apply to them.
    this.enemies = this.physics.add.group();   // ← add this

    // Spawn two enemies at tile positions:
    const enemy1 = new Enemy(this, 20 * 16, 12 * 16);   // ← add
    const enemy2 = new Enemy(this, 40 * 16, 12 * 16);   // ← add
    this.enemies.add(enemy1);   // ← add — registers enemy with the group
    this.enemies.add(enemy2);   // ← add

    // Enemies collide with the ground layer (so they stand on tiles):
    this.physics.add.collider(this.enemies, this.groundLayer);   // ← add
```

Update `GameScene.update()` to call `Enemy.update()`:

```ts
  update(_time: number, delta: number): void {
    this.player.update(this.cursors);
    this.enemies.getChildren().forEach(obj => (obj as Enemy).update());
    // getChildren(): returns all members of the group as Phaser.GameObjects.GameObject[].
    // We cast each to Enemy to call Enemy.update() — the group stores the base type.
  }
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** Two red squares appear at their spawn positions. They fall
under gravity and land on the ground tiles. They do NOT move yet — `Enemy.update()`
is still empty. This confirms the texture, spawning, and ground collider all work
before we add patrol behavior.

**In DevTools Console:**

```js
// Expose enemies temporarily in create(): (window as any).enemies = this.enemies;
enemies.getChildren().length
```

**Expected:** `2` — both enemies are in the group.

**Change something:** In `Enemy.ts`, change `0xFF4444` to `0x00FF00` (bright green).
Save. The squares are now green. Change back to `0xFF4444` — red is distinct from
the player (teal) and ground (brown).

---

## Step 3 — Add Patrol Logic to `Enemy.update()`

The enemies exist and stand on the ground. Now give them movement.

Open `src/Enemy.ts`. Replace the empty `update()` with:

```ts
  public update(): void {
    if (this.isDead) return;   // skip update logic after die() is called

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Reverse direction when blocked by a wall tile on either side:
    if (body.blocked.left || body.blocked.right) {
      this.reverseDirection();
      // body.blocked.left/right: set by Phaser's collision pass each frame.
      // True when the physics body is touching a solid surface on that side.
    }

    // Flip sprite to face direction of movement:
    this.setFlipX(body.velocity.x < 0);
    // velocity.x < 0 means moving left → flip horizontally (face left).
    // velocity.x > 0 means moving right → no flip (face right, default).
  }
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** Both red squares move horizontally and reverse when they hit
a wall tile. The constructor set `setVelocityX(-ENEMY_SPEED)` so they begin moving
left immediately. When they reach the world left edge or a wall, `body.blocked.left`
fires and `reverseDirection()` flips them to move right.

**In DevTools Console:**

```js
// With enemies exposed: (window as any).enemies = this.enemies;
(enemies.getChildren()[0]).body.velocity.x
```

**Expected:** A non-zero number (close to `±80`) — the enemy is moving. The sign
changes each time it reverses.

**Change something:** Change `ENEMY_SPEED` from `80` to `200`. Save. Enemies move
noticeably faster and harder to avoid. Change back to `80`.

---

## Step 4 — Add Player-Enemy Contact Detection

Now enemies patrol. Add the interaction: stomp from above kills the enemy; side
contact flashes the player.

Open `src/scenes/GameScene.ts`. In `create()`, after the `enemies.add()` calls, add:

```ts
    // Player-enemy contact — handled by an overlap (not collider):
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerEnemyContact,   // ← callback method defined below
      undefined,   // processCallback: undefined = always process (no pre-filter)
      this         // context: 'this' inside handlePlayerEnemyContact = this GameScene
    );   // ← add this block
```

Add the contact handler method to `GameScene`:

```ts
  private handlePlayerEnemyContact(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const player = playerObj as Player;
    const enemy = enemyObj as Enemy;

    // See Logic block above for the truth table:
    const isStomping =
      player.y < enemy.y - 8 &&
      (player.body as Phaser.Physics.Arcade.Body).velocity.y > 0;

    if (isStomping) {
      enemy.die();
      player.setVelocityY(-300);
      // Small upward bounce after stomp — satisfying feedback and
      // lets the player jump off the enemy to reach higher platforms.
    } else {
      // Side hit — placeholder damage (full death FSM in LAB-10):
      player.setTint(0xff0000);    // red flash
      this.time.delayedCall(400, () => player.clearTint());
      // clearTint(): removes the tint overlay, restoring the sprite's original colors.
    }
  }
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** Two red squares patrolling at their spawn positions. They
reverse direction when hitting wall tiles. Jump on top of a red square — it
flashes white and disappears after 200ms. Walk into the side of a red square
— the player briefly turns red.

**In DevTools Console:**

```js
// Expose enemies: (window as any).enemies = this.enemies; in create()
enemies.getChildren().length   // Expected: 2 (or 1 after stomping one)
```

**Change something:** In `handlePlayerEnemyContact`, change `player.setVelocityY(-300)`
to `player.setVelocityY(-600)`. Save. Stomping an enemy launches the player much
higher — a bigger bounce reward. Change back to `-300`.

---

## 🎯 Challenge: Edge Detection — Enemy Turns Before Walking Off Platforms

**You know:** `body.blocked.left` and `body.blocked.right` handle wall reversal.
But enemies on floating platforms walk off the edge unless stopped.

**Task:** Add edge detection to `Enemy.update()`. Each frame, use
`groundLayer.getTileAtWorldXY(x, y)` to check one tile ahead of the enemy and
one tile below the enemy's feet. If there is no tile below the next step,
call `reverseDirection()` before the enemy walks off.

The `Enemy` class needs a reference to `groundLayer`. Pass it as a constructor
parameter.

**Coordinate to check:**

```ts
const lookAheadX = this.x + (body.velocity.x > 0 ? this.width + 2 : -2);
const lookBelowY = this.y + this.height + 8;
const tileBelow = groundLayer.getTileAtWorldXY(lookAheadX, lookBelowY);
// getTileAtWorldXY: returns the Tile at world position (x, y), or null if empty.
if (!tileBelow && !this.isDead) {
  this.reverseDirection();
}
```

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Updated Enemy constructor — add groundLayer parameter:
constructor(
  scene: Phaser.Scene,
  x: number,
  y: number,
  private groundLayer: Phaser.Tilemaps.TilemapLayer   // shorthand: creates this.groundLayer
) {
  super(scene, x, y, 'enemy-placeholder');
  scene.add.existing(this);
  scene.physics.add.existing(this);
  this.setCollideWorldBounds(true);
  this.setVelocityX(-ENEMY_SPEED);
}

// In Enemy.update(), add after the blocked check:
const body = this.body as Phaser.Physics.Arcade.Body;
if (!body.blocked.left && !body.blocked.right) {  // only if not already reversing
  const lookAheadX = this.x + (body.velocity.x > 0 ? this.width + 2 : -2);
  const lookBelowY = this.y + this.height + 8;
  const tileBelow = this.groundLayer.getTileAtWorldXY(lookAheadX, lookBelowY);
  if (!tileBelow && !this.isDead) {
    this.reverseDirection();
  }
}

// In GameScene.create(), pass groundLayer to Enemy constructor:
const enemy1 = new Enemy(this, 20 * 16, 12 * 16, this.groundLayer);
const enemy2 = new Enemy(this, 40 * 16, 12 * 16, this.groundLayer);
```

**Key insight:** `getTileAtWorldXY` returns `null` when there is no tile —
meaning the ground ends. Checking one tile-width ahead and one tile below
the enemy's feet is a lookahead: "check before you step." The same principle
as `isValidPosition` in Tetris V3 — propose the next state, validate it,
only commit if valid.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Enemies appear | Two red squares visible at spawn positions |
| Patrol behavior | Enemies move horizontally, reverse at walls |
| Stomp kills enemy | Jump on top — enemy flashes white, disappears after 200ms |
| Side contact triggers | Walk into side — player briefly turns red |
| Enemies stand on ground | Enemies do not fall through floor tiles |
| `isDead` guard works | Cannot stomp same enemy twice (it is destroyed) |

---

## Quick Check Answers

**1. What two conditions together identify a stomp?**

(1) `player.y < enemy.y - 8` — the player's center is at least 8 pixels above
the enemy's center. This means the player is clearly above the enemy, not beside
it. The `-8` tolerance prevents side-by-side contacts at similar heights from
triggering this. (2) `player.body.velocity.y > 0` — the player is moving
downward (positive y = down in Phaser). This distinguishes "standing next to"
(velocity.y ≈ 0) from "landing on" (velocity.y > 0). Both conditions must be
true simultaneously for a stomp to register.

**2. `collider` or `overlap` for player-enemy contact?**

`overlap`. A `collider` physically prevents the player from occupying the same
space as an enemy — the player would be pushed back on contact and could never
get close enough to land on top. An `overlap` detects the contact without
physical separation, and our callback decides the outcome: stomp → enemy dies;
side → player flashes. The player's physical response (bounce after stomp) is
manually applied inside the callback with `player.setVelocityY(-300)`.

**3. (Prediction) Enemy spawns at x=0 touching the left wall?**

`body.blocked.left` is `true` on the very first frame. `reverseDirection()` is
called immediately — the enemy starts moving right before ever going left. This
is correct behavior. If the spawn position is inside a wall tile (x=0 is the
wall boundary), the enemy may oscillate: blocked left → reverse → blocked right
→ reverse → stuck. Always spawn enemies at least one tile away from walls.

---

*Next: LAB-09 — Collectibles and Coins. We read coin positions from a Tiled
object layer, create a StaticGroup of coins, detect player-coin overlap, and
increment a score counter. We explain why StaticGroup provides O(1) spatial
lookup for large collections of stationary physics bodies.*
