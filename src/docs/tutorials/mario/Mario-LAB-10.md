# Mario Platformer — LAB 10 — Death, Lives, and Respawn

**Prerequisites:** LAB-09 complete. Coins collectible, score tracked. Enemies
patrol and can be stomped. Player side-hit currently just flashes red.

**What this lab adds:**
- `PlayerLifeState` FSM: `Playing → Dying → Respawning → Playing`
- Pit detection (player falls below the world bottom)
- Real death: player flashes, freezes, then respawns at the level start
- Lives system: 3 lives; reaching 0 transitions to Game Over
- Game Over: scene restarts cleanly

**Time:** 60 minutes

---

## What You Will Build

```
Normal play:    [Player] runs and jumps

Die (pit):      [Player] falls below y=worldHeight → death sequence

Die (enemy):    [Player] touches enemy side → death sequence

Death sequence: Player freezes (no input) → flashes red 3× over 1.5s
                → respawns at spawn point with brief invincibility

Lives:          3 lives displayed (console for now, HUD in LAB-12)
                Lives reach 0 → scene.restart() (Game Over)
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why is "Dying" a separate state instead of just calling `respawn()` immediately?
> 2. What does `scene.restart()` do to all scene objects, physics state, and score?
> 3. *(Prediction)* If the player can take damage while already in the Dying state,
>    what bug occurs?
>
> *(Answers at the end of this lab)*

---

## DSA / OOP: Player Life Cycle as a Finite State Machine

**What it is:** The player's life cycle has exactly three states with defined
transitions — exactly the FSM model from Tetris V3 LAB-10.

```
States:      Playing, Dying, Respawning
Events:      TakeDamage, DeathAnimDone, SpawnInvincibilityDone

Transitions:
  Playing    + TakeDamage          → Dying
  Dying      + DeathAnimDone       → Respawning
  Respawning + SpawnInvincibilityDone → Playing
```

**What it hides:** Without an FSM, death logic is scattered through `update()`
as `if (isDying && !isRespawning && invincibilityTimer <= 0)` chains that
interact in unpredictable ways. The FSM makes the valid states explicit and
makes illegal states (Dying AND Respawning at the same time) impossible.

**The protected invariant:** Only one state is active at a time. Code inside
`if (lifeState === PlayerLifeState.Playing)` never accidentally runs during
a death animation.

---

## Concept: `this.scene.tweens.add()` — Property Interpolation Over Time

**What it is:** A tween smoothly changes a numeric property of a game object
from one value to another over a specified duration, without manual `update()`
tracking.

**The problem before:** To fade a sprite out and back in (for a death flash),
you would track the state manually:

```ts
// Manual approach — fading in update():
private flashTimer: number = 0;
private flashPhase: number = 0;   // 0 = fading out, 1 = fading in
update(delta: number): void {
  if (this.isFlashing) {
    this.flashTimer += delta;
    if (this.flashPhase === 0) {
      this.alpha = 1 - (this.flashTimer / 150);  // fade out over 150ms
      if (this.flashTimer >= 150) { this.flashPhase = 1; this.flashTimer = 0; }
    } else {
      this.alpha = this.flashTimer / 150;  // fade in over 150ms
      if (this.flashTimer >= 150) { /* repeat or finish */ }
    }
  }
}
// This is only one yoyo — three repeats, plus an onComplete callback,
// would require even more state variables.
```

**The solution — `tweens.add()`:**

```ts
this.scene.tweens.add({
  targets: this,          // the object to animate
  alpha: 0,               // property to change, and its end value
  duration: 150,          // ms to complete the change
  yoyo: true,             // reverse back to start value after completing
  repeat: 3,              // repeat the forward+back cycle 3 times
  ease: 'Linear',         // interpolation curve (linear = constant rate)
  onComplete: () => { /* fires after all repeats finish */ },
});
```

**What it hides:** The frame-by-frame interpolation math, the yoyo reversal,
repeat counting, and the `onComplete` timing. All of that runs inside Phaser's
tween manager.

**The protected invariant:** Tweens registered with `this.scene.tweens` are
automatically stopped and cleaned up when the scene stops. No memory leaks
from orphaned tweens.

**Term: `yoyo`** — When `true`, the tween plays forward (start → end), then
plays backward (end → start) as one cycle. One yoyo cycle with `alpha: 0` fades
out then fades back in.

**Term: `ease`** — The interpolation curve. `'Linear'` means constant speed.
`'Quad.easeOut'` means fast at start, slow at end. For a flashing effect,
`'Linear'` is correct — we want even fades, not ones that slow down.

**Watch for:** `tweens.add()` runs asynchronously — it returns immediately
and runs in the background each frame. Do not write code after `tweens.add()`
that assumes the tween is finished. Use `onComplete` for any logic that must
wait until the tween ends.

---

## Step 1 — Add `PlayerLifeState` to the Player Class

Open `src/Player.ts`. Add the FSM enum and state:

```ts
// After PlayerAnimState enum:

export enum PlayerLifeState {
  Playing    = 'playing',
  Dying      = 'dying',
  Respawning = 'respawning',
}
// Exported so GameScene can read the player's current life state.

export class Player extends Phaser.Physics.Arcade.Sprite {

  private animState: PlayerAnimState = PlayerAnimState.Idle;
  public lifeState: PlayerLifeState = PlayerLifeState.Playing;
  // 'public' so GameScene can check player.lifeState to decide
  // whether to process input or show a game-over screen.

  private spawnX: number;   // remembers where to respawn
  private spawnY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    this.spawnX = x;   // save spawn position
    this.spawnY = y;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setMaxVelocityY(800);
  }

  // takeDamage: transitions from Playing to Dying.
  // Ignored if already Dying or Respawning (FSM guard).
  public takeDamage(): void {
    if (this.lifeState !== PlayerLifeState.Playing) return;
    // Guard: only transition from Playing. Prevents double-damage during animation.

    this.lifeState = PlayerLifeState.Dying;
    this.setVelocityX(0);      // stop horizontal movement
    this.setVelocityY(-200);   // small upward pop — classic Mario death bounce

    // Disable physics body so the player can't be hit again during the animation:
    (this.body as Phaser.Physics.Arcade.Body).enable = false;

    // Flash red 3 times over 900ms, then transition to Respawning:
    this.scene.tweens.add({
      targets: this,
      alpha: 0,                // fade to invisible
      duration: 150,           // 150ms per flash
      yoyo: true,              // fade back to visible
      repeat: 3,               // 3 full flashes
      ease: 'Linear',
      onComplete: () => {
        this.lifeState = PlayerLifeState.Respawning;
        this.respawn();
      },
    });
    // tweens.add: Phaser's animation tween system. Interpolates any property
    // (here: alpha) over time. onComplete fires after all repeats finish.
  }

  // respawn: moves player back to spawn point, brief invincibility.
  private respawn(): void {
    this.setPosition(this.spawnX, this.spawnY);   // teleport to spawn
    this.setAlpha(1);                              // restore visibility
    (this.body as Phaser.Physics.Arcade.Body).enable = true;  // re-enable physics

    // Brief invincibility: flash faster for 1.5s, then return to Playing:
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 7,
      ease: 'Linear',
      onComplete: () => {
        this.setAlpha(1);
        this.lifeState = PlayerLifeState.Playing;
        // FSM transition complete: back to Playing.
      },
    });
  }

  public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    // FSM guard: ignore input while not in Playing state:
    if (this.lifeState !== PlayerLifeState.Playing) return;

    // ... existing movement and animation code unchanged ...
  }

  public isOnGround(): boolean {
    return (this.body as Phaser.Physics.Arcade.Body).blocked.down;
  }
}
```

### SAVE AND TRY

Save both files. The game should still run normally — the FSM defaults to
`Playing` so nothing visibly changes yet. Verify the new methods work by
testing them from the console.

Temporarily expose the player in `GameScene.create()`:
```ts
(window as any).player = this.player;   // ← add temporarily
```

Save. Then in the DevTools Console:

```js
player.lifeState           // Expected: 'playing'
player.takeDamage()        // triggers death sequence
```

**Expected after `takeDamage()`:** The player sprite flashes (alpha pulses 0 → 1
three times over ~900ms), then teleports back to the spawn position and flashes
faster for ~1.5s, then returns to normal. The full death-respawn cycle runs.

```js
player.lifeState           // Expected: 'dying' (during animation), then 'respawning', then 'playing'
```

**In the browser:** Stand on the ground. Call `player.takeDamage()` in the console
while the game is running. The player character should visibly flash and respawn.

**Change something:** Change `repeat: 3` in the death tween to `repeat: 1`. Save.
Call `player.takeDamage()` again — the flash is shorter (one cycle instead of three).
Change back to `repeat: 3`.

Remove the `(window as any).player = this.player` line after testing.

---

## Step 2 — Add Lives to `GameScene` and Pit Detection

First, ensure the import at the top of `GameScene.ts` includes `PlayerLifeState`:

```ts
import { Player, PlayerLifeState } from '../Player';   // ← add PlayerLifeState to import
// PlayerLifeState: the enum exported from Player.ts — used in killPlayer() below.
```

Open `src/scenes/GameScene.ts`. Add lives tracking and pit detection:

```ts
private lives: number = 3;           // ← add property
private readonly SPAWN_X: number = 2 * 16;   // ← spawn tile positions
private readonly SPAWN_Y: number = 10 * 16;

// In update():
update(_time: number, delta: number): void {
  this.player.update(this.cursors);
  this.enemies.getChildren().forEach(obj => (obj as Enemy).update());

  // ── Pit detection ─────────────────────────────────────────────────────
  // If the player falls below the world bottom (y > world height):
  if (this.player.y > this.physics.world.bounds.height + 100) {
    this.killPlayer();
  }
  // +100: small buffer so the player fully exits the screen before dying —
  // gives visual confirmation they fell before the death sequence starts.
}

// killPlayer: decrements lives and triggers player death or game over.
private killPlayer(): void {
  if (this.player.lifeState !== PlayerLifeState.Playing) return;
  // Guard: only kill if currently in Playing state — same FSM principle.

  this.lives -= 1;
  console.log(`Lives remaining: ${this.lives}`);

  if (this.lives <= 0) {
    // No lives left — game over:
    this.time.delayedCall(500, () => {
      this.scene.restart();
      // restart(): destroys and re-creates this scene from scratch.
      // Resets all scene state: score, player, enemies, coins.
      // Lives will reset to 3 because the class property initializes to 3.
    });
  } else {
    // Lives remaining — trigger death then respawn:
    this.player.takeDamage();
  }
}
```

### SAVE AND TRY

Save. Walk the player off the edge of a platform into a gap below.

**You should see:** Player falls below the screen, then the death/respawn sequence
fires. Console: `"Lives remaining: 2"`.

**In DevTools Console:**

```js
// Expose player: (window as any).player = this.player; in create()
player.lifeState   // Expected: 'playing' normally, 'dying' during death animation
```

**Change something:** Change `this.physics.world.bounds.height + 100` to
`this.physics.world.bounds.height + 500`. Save. The player now falls much further
off-screen before dying — you can see them falling longer. Change back to `+ 100`.

---

## Step 3 — Wire Side-Hit to `killPlayer()`

Update `handlePlayerEnemyContact()` to call `killPlayer()`:

```ts
private handlePlayerEnemyContact(playerObj, enemyObj): void {
  const player = playerObj as Player;
  const enemy = enemyObj as Enemy;
  const playerBody = player.body as Phaser.Physics.Arcade.Body;

  const isStomping = player.y < enemy.y - 8 && playerBody.velocity.y > 0;

  if (isStomping) {
    enemy.die();
    player.setVelocityY(-300);
  } else {
    this.killPlayer();   // ← replace the old setTint placeholder
  }
}
```

### SAVE AND TRY

Save. Run the game.

**Test pit death:** Walk the player off the right edge of a platform into a gap.
**You should see:** Player falls below the screen → flashes red → reappears at
spawn. Console: "Lives remaining: 2".

**Test enemy death:** Walk into the side of a patrolling enemy.
**You should see:** Same flash → respawn sequence.

**Test game over:** Die 3 times.
**You should see:** Scene restarts — score resets to 0, player at spawn, all
coins and enemies reset.

**Change something:** Change `this.lives = 3` to `this.lives = 1`. Save. One
death immediately restarts the level. Change back to `3`.

---

## 🎯 Challenge: Checkpoint System

**You know:** `player.spawnX` and `player.spawnY` determine where respawn happens.
Currently the spawn is hardcoded in the Player constructor.

**Task:** Add a checkpoint system. Place checkpoint objects in a Tiled object layer
called `Checkpoints`. When the player overlaps a checkpoint, update the player's
respawn position to the checkpoint's location. The next death respawns the player
at the checkpoint, not the level start.

**Hints:**

1. Add a `setSpawn(x: number, y: number): void` public method to the Player class
   that updates `this.spawnX` and `this.spawnY`.
2. In GameScene, read the `Checkpoints` object layer the same way as coins.
3. Use `physics.add.overlap` between player and checkpoint StaticGroup.
4. Once a checkpoint is triggered, remove it from the group (or mark it as visited)
   so it cannot trigger again.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In Player.ts:
public setSpawn(x: number, y: number): void {
  this.spawnX = x;
  this.spawnY = y;
}

// In GameScene.create():
const checkpoints = this.physics.add.staticGroup();
const checkpointLayer = map.getObjectLayer('Checkpoints');
if (checkpointLayer) {
  checkpointLayer.objects.forEach(obj => {
    const cp = checkpoints.create(obj.x!, obj.y!, undefined);
    // undefined texture: invisible checkpoint trigger zone
    cp.setVisible(false);   // or use a flag sprite for visibility
    cp.setOrigin(0.5, 1);
    cp.refreshBody();
  });
}

this.physics.add.overlap(
  this.player,
  checkpoints,
  (_player, cpObj) => {
    const cp = cpObj as Phaser.Physics.Arcade.Image;
    this.player.setSpawn(cp.x, cp.y);
    cp.destroy();   // one-time trigger — remove after activation
    console.log(`Checkpoint set at (${cp.x}, ${cp.y})`);
  },
  undefined,
  this
);
```

**Key insight:** Checkpoints are a great example of the FSM's value — `setSpawn`
changes future behavior (respawn position) without changing current state. The
player continues in `Playing` state; the checkpoint just updates one piece of
data. If death then occurs, `respawn()` reads the updated `spawnX/spawnY` and
the player appears at the checkpoint instead of the start. State mutation for
future behavior, not current behavior.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Pit detection fires | Walk off a platform into a gap — death sequence starts |
| Enemy side-hit fires | Touch enemy side — death sequence starts |
| Death flashes | Player flashes red 3× before respawning |
| Respawn invincibility | After respawn: player flashes fast for ~1.5s, cannot be damaged |
| Lives decrement | Die → Console shows "Lives remaining: 2", then 1, then restart |
| Game over restarts scene | After 3 deaths: level resets completely (score 0, all coins back) |
| FSM guard works | Cannot die twice in one death sequence |

---

## Quick Check Answers

**1. Why is "Dying" a separate state instead of calling `respawn()` immediately?**

The death animation takes time — during that time the player must be visible
(flashing), immobile (velocity zeroed), and immune to further damage. If
`respawn()` were called immediately, the player would teleport to spawn instantly
with no visual feedback, and the "what just happened?" confusion would break
immersion. The Dying state enforces a fixed window where game logic is suspended
for the current player object. It is the same reason a finite state machine was
used in Tetris V3 — state isolation prevents impossible combinations (can't die
AND respawn simultaneously).

**2. What does `scene.restart()` do?**

It destroys all game objects in the scene (sprites, physics bodies, tilemaps,
groups, tweens, timers), then calls `create()` again from scratch. All class
properties are re-initialized as if the game just started. This is why `lives`
resets to 3 — the `private lives: number = 3` initialization runs again. To
persist data across a restart (e.g., high score), store it in `this.scene.manager.game`
or `localStorage` before calling `restart()`.

**3. (Prediction) Player damaged while already Dying?**

Without the FSM guard (`if (this.lifeState !== PlayerLifeState.Playing) return`),
`takeDamage()` would run again during the death animation — starting a second
tween, decrementing lives twice, and potentially producing two overlapping
flashing effects. With the guard, only the first call succeeds; all subsequent
calls are ignored while Dying or Respawning. This is the FSM's core protection:
illegal state combinations become unreachable by construction.

---

*Next: LAB-11 — Scene Management and Level Flow. We add a `MenuScene` (start
screen), wire the goal flag at the end of the level, transition to a
`WinScene`, and pass score and lives between scenes using Phaser's
`scene.start(key, data)` mechanism.*
