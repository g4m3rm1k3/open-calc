# Mario Platformer — LAB 12 — HUD, Particles, and Game Feel

**Prerequisites:** LAB-11 complete. Full scene flow: Menu → Game → Win.
Death and respawn work. Score tracked but only visible in console.

**What this lab adds:**
- `UIScene` running in parallel with `GameScene` — the HUD overlay
- Score, lives, and a level timer displayed at the top of the screen
- Particle burst on coin collection and enemy stomp
- Camera screen shake on player death
- `GameScene` ↔ `UIScene` communication via Phaser's event emitter

**Time:** 60–75 minutes

---

## What You Will Build

```
┌────────────────────────────────────────────┐
│  ♥ ♥ ♥    Score: 1400    Time: 48         │ ← UIScene (fixed, always on top)
├────────────────────────────────────────────┤
│                                            │
│  [Player]   ○ ○ ○           ○ ○ ○          │ ← GameScene (scrolling)
│         [Enemy] ←→                         │
│                                            │
│████████████████████████████████████████████│
└────────────────────────────────────────────┘

On coin collect: burst of gold particles at coin position
On stomp: burst of white particles at enemy position
On death: camera shakes for 0.5s
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why put HUD in a separate `UIScene` instead of adding text directly to
>    `GameScene` with `setScrollFactor(0)`?
> 2. Phaser scenes communicate via an event emitter. What is an event emitter?
> 3. *(Prediction)* If `UIScene` reads `this.score` from `GameScene` directly
>    every frame, what architectural problem does that create?
>
> *(Answers at the end of this lab)*

---

## Concept: Parallel Scenes — `scene.launch()` vs `scene.start()`

**What it is:** `scene.launch('UI')` starts `UIScene` WITHOUT stopping
`GameScene`. Both scenes update and render simultaneously. `UIScene` renders
on top of `GameScene` (later in the scene array = drawn on top).

**What it hides:** The alternative is mixing HUD rendering directly into
`GameScene.render()` — which couples UI code with game code, makes the
HUD scroll with the camera if `setScrollFactor(0)` is ever forgotten, and
makes it impossible to pause the game while keeping the HUD visible.
A separate UIScene can be paused/unpaused independently from the game.

**The protected invariant:** Objects in `UIScene` are in their own physics
world and display list. They cannot accidentally be destroyed by `GameScene`
operations. A `scene.restart()` in `GameScene` does not touch `UIScene`.

**Scene layering order:**

```ts
scene: [MenuScene, GameScene, UIScene, WinScene]
//      index 0     index 1   index 2   index 3
// Higher index = rendered on top.
// UIScene (index 2) renders above GameScene (index 1).
```

---

## Concept: Phaser Event Emitter — Scene Communication

**What it is:** Phaser's global event emitter (`this.game.events`) is a
publish/subscribe bus shared across all scenes. One scene emits a named event;
another scene listens and reacts.

**What it hides:** Direct scene references — `this.scene.get('Game').score`.
Accessing another scene's private properties couples scenes tightly: if
`GameScene` renames `score` to `points`, `UIScene` breaks. Events decouple
them: `GameScene` emits `'scoreChanged'`; `UIScene` listens to `'scoreChanged'`
without knowing who emitted it or what internal name the score uses.

**The protected invariant:** A scene cannot access another scene's private
members through the event system. Only the emitted data (what the emitter
chooses to share) crosses the scene boundary.

```ts
// In GameScene — emit when score changes:
this.game.events.emit('scoreChanged', this.score);
this.game.events.emit('livesChanged', this.lives);

// In UIScene — listen and update:
this.game.events.on('scoreChanged', (score: number) => {
  this.scoreText.setText(`Score: ${score}`);
});
```

**Watch for:** Clean up listeners when the scene stops using `this.events.once('shutdown', cleanup)`.
If `UIScene` listens on `this.game.events` and then restarts, old listeners
accumulate — each restart adds a new listener without removing the old one.

---

## Step 1 — Create `UIScene`

Create `src/scenes/UIScene.ts`:

```ts
// src/scenes/UIScene.ts

export class UIScene extends Phaser.Scene {

  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;

  private elapsedSeconds: number = 0;

  constructor() { super({ key: 'UI' }); }

  preload(): void {}

  create(): void {
    // UIScene renders on a transparent background — GameScene shows through.
    // (No setBackgroundColor call = transparent.)

    const textStyle = {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    };

    this.livesText = this.add.text(16, 16, '♥ ♥ ♥', textStyle);
    // '♥ ♥ ♥': three heart characters for 3 lives.
    // We replace individual hearts in the lives update handler.

    this.scoreText = this.add.text(this.cameras.main.centerX, 16, 'Score: 0', textStyle)
      .setOrigin(0.5, 0);   // center-top alignment

    this.timerText = this.add.text(this.cameras.main.width - 16, 16, 'Time: 0', textStyle)
      .setOrigin(1, 0);     // right-top alignment

    // ── Event listeners ───────────────────────────────────────────────────

    // Listen for score updates from GameScene:
    this.game.events.on('scoreChanged', (score: number) => {
      this.scoreText.setText(`Score: ${score}`);
    }, this);

    // Listen for lives updates:
    this.game.events.on('livesChanged', (lives: number) => {
      const hearts = Array(lives).fill('♥').join(' ');
      // Array(3).fill('♥') = ['♥', '♥', '♥'] → join(' ') = '♥ ♥ ♥'
      // Array(1).fill('♥') = ['♥']            → join(' ') = '♥'
      this.livesText.setText(hearts || 'GAME OVER');
    }, this);

    // Clean up listeners when this scene shuts down:
    this.events.once('shutdown', () => {
      this.game.events.off('scoreChanged');
      this.game.events.off('livesChanged');
      // 'off': removes all listeners for these event names.
    });
  }

  update(_time: number, delta: number): void {
    // Update timer — count elapsed seconds since UIScene started:
    this.elapsedSeconds += delta / 1000;
    // delta is in ms; divide by 1000 → seconds.
    this.timerText.setText(`Time: ${Math.floor(this.elapsedSeconds)}`);
  }
}
```

---

## Step 2 — Launch `UIScene` from `GameScene` and Emit Events

Open `src/scenes/GameScene.ts`. In `create()`:

```ts
// At the very end of create():
this.scene.launch('UI');
// launch(): start UIScene in parallel — GameScene keeps running.
// UIScene renders on top because 'UI' has a higher index in the scene array.
```

Emit events when score and lives change. Update `collectCoin()`:

```ts
private collectCoin(_playerObj, coinObj): void {
  (coinObj as Phaser.Physics.Arcade.Image).destroy();
  this.score += 100;
  this.scoreText?.setText(`Score: ${this.score}`);  // ← keep local text if added
  this.game.events.emit('scoreChanged', this.score); // ← add this
}
```

Update `killPlayer()`:

```ts
private killPlayer(): void {
  if (this.player.lifeState !== PlayerLifeState.Playing) return;
  this.lives -= 1;
  this.game.events.emit('livesChanged', this.lives);  // ← add this

  // Camera shake on death:
  this.cameras.main.shake(500, 0.02);
  // shake(duration_ms, intensity): shakes the camera.
  // 500ms duration, 0.02 intensity (2% of screen size offset per frame).

  if (this.lives <= 0) {
    this.time.delayedCall(500, () => {
      this.scene.stop('UI');   // ← stop UIScene before restarting GameScene
      this.scene.restart();
    });
  } else {
    this.player.takeDamage();
  }
}
```

Register UIScene in `main.ts`:

```ts
import { UIScene } from './scenes/UIScene';   // ← add

scene: [MenuScene, GameScene, UIScene, WinScene],
```

### SAVE AND TRY

Save. Start the game (press Space on MenuScene). Look at the top of the screen.

**You should see:** "♥ ♥ ♥" in the top-left. "Score: 0" centered at the top.
"Time: 0" counting up in the top-right. All three stay fixed while the camera
scrolls. Collecting a coin updates "Score: 100" etc. in the top center.

**Test screen shake:** Die (fall in a pit). Camera shakes for 0.5 seconds.

---

## Step 3 — Add Particles on Coin Collection

Phaser 3.60+ includes a built-in particle system. Add a coin burst effect:

```ts
// In GameScene.create(), after loading coins:
// Create a particle emitter for coin collection bursts:
// We use a simple colored circle particle (same as our coin texture).

// In collectCoin():
private collectCoin(_playerObj: any, coinObj: any): void {
  const coin = coinObj as Phaser.Physics.Arcade.Image;
  const x = coin.x;
  const y = coin.y;

  coin.destroy();
  this.score += 100;
  this.game.events.emit('scoreChanged', this.score);

  // Particle burst at coin position:
  const particles = this.add.particles(x, y, 'coin', {
    // 'coin': the texture key — particles use the same image as the coin
    speed: { min: 50, max: 150 },    // random speed between 50–150 px/s
    angle: { min: 0, max: 360 },     // emit in all directions
    scale: { start: 0.5, end: 0 },   // shrink from 50% to invisible
    lifespan: 400,                   // each particle lives 400ms
    quantity: 8,                     // emit 8 particles at once
    emitting: false,                 // do not emit continuously — burst only
  });
  particles.explode(8);
  // explode(count): emit 'count' particles at once, then stop.
  // The emitter auto-destroys after all particles expire.
}
```

### SAVE AND TRY

Save. Walk the player into a coin.

**You should see:** The gold circle disappears AND a burst of small gold circles
fans out from the collection point, shrinking to nothing over 400ms.

**In DevTools Console:**

No console test — the particle burst is the visual verification.

**Change something:** Change `quantity: 8` to `quantity: 20`. Save. Collecting a
coin now produces a much denser burst. Change back to `8`.

---

## Step 4 — Add Particles on Enemy Stomp and Screen Shake on Death

In `handlePlayerEnemyContact()`, add stomp particles:

```ts
if (isStomping) {
  enemy.die();
  player.setVelocityY(-300);

  // Particle burst at stomp position:
  this.add.particles(enemy.x, enemy.y, 'coin', {
    // Reuse coin texture — tint it white for a different look:
    tint: 0xffffff,
    speed: { min: 80, max: 200 },
    angle: { min: -150, max: -30 },  // upward burst (negative y = up)
    scale: { start: 0.4, end: 0 },
    lifespan: 300,
    quantity: 6,
    emitting: false,
  }).explode(6);
} else {
  this.killPlayer();
}
```

### SAVE AND TRY

Save. Play the game. Jump on an enemy.

**You should see:** On stomp — white particles burst upward from the enemy position
and the enemy flashes white before disappearing. The upward-angle burst (`-150` to
`-30` degrees) points the particles skyward, giving the stomp impact a distinct
feel from the coin collection's omnidirectional burst.

**In DevTools Console:**

No console test — the visual burst is the verification.

**Change something:** Change `quantity: 6` (stomp particles) to `quantity: 15`.
Save. Stomping an enemy produces a larger burst. Change back to `6`.

---

## 🎯 Challenge: Power-Up (Grow the Player)

**You know:** `player.setScale(x, y)` changes the sprite's visual and physics size.
`player.body.setSize(width, height)` updates the physics hitbox independently.

**Task:** Add a "mushroom" power-up. Place one in Tiled's object layer as a
`Powerups` object layer. When the player touches it:
1. The player grows to 1.5× scale (visual only)
2. The physics body scales to match
3. A second hit from an enemy shrinks the player back to normal instead of killing them
4. Track the power-up state in the Player class: `Normal` or `Super`

**Hints:**

1. Add `enum PlayerPowerState { Normal, Super }` to `Player.ts`.
2. In `takeDamage()`: if `powerState === Super`, downgrade to Normal and bounce
   (no death). If `powerState === Normal`, trigger the full death sequence.
3. `this.setScale(1.5)` scales the sprite; `body.setSize(32 * 1.5, 48 * 1.5)`
   scales the hitbox separately.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In Player.ts:
export enum PlayerPowerState { Normal, Super }

private powerState: PlayerPowerState = PlayerPowerState.Normal;

public growSuper(): void {
  this.powerState = PlayerPowerState.Super;
  this.setScale(1.5);
  (this.body as Phaser.Physics.Arcade.Body).setSize(32 * 1.5, 48 * 1.5);
}

public takeDamage(): void {
  if (this.lifeState !== PlayerLifeState.Playing) return;

  if (this.powerState === PlayerPowerState.Super) {
    // Downgrade: lose power but don't die
    this.powerState = PlayerPowerState.Normal;
    this.setScale(1);
    (this.body as Phaser.Physics.Arcade.Body).setSize(32, 48);
    this.setVelocityY(-150);  // small bounce to show damage was taken
    // Brief invincibility so player can escape:
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.scene.time.delayedCall(1000, () => {
      (this.body as Phaser.Physics.Arcade.Body).enable = true;
    });
    return;  // do not trigger death sequence
  }

  // Normal state: full death sequence
  this.lifeState = PlayerLifeState.Dying;
  // ... rest of takeDamage unchanged ...
}

// In GameScene.create(), read Powerups object layer:
const powerupLayer = map.getObjectLayer('Powerups');
if (powerupLayer) {
  const mushrooms = this.physics.add.staticGroup();
  powerupLayer.objects.forEach(obj => {
    const m = mushrooms.create(obj.x!, obj.y!, 'coin') as Phaser.Physics.Arcade.Image;
    m.setTint(0xFF6B6B);   // red tint to distinguish from coins
    m.setOrigin(0.5, 1);
    m.refreshBody();
  });
  this.physics.add.overlap(this.player, mushrooms, (_p, mushroomObj) => {
    (mushroomObj as Phaser.Physics.Arcade.Image).destroy();
    this.player.growSuper();
  }, undefined, this);
}
```

**Key insight:** The power state is a nested FSM — the Player's life cycle FSM
(`Playing → Dying → Respawning`) interacts with the power state FSM
(`Normal → Super → Normal`). The key is that `takeDamage()` checks power state
FIRST and handles the Super → Normal downgrade before touching the life cycle
FSM. This keeps the two state dimensions independent: you can be Super while
Respawning, or Normal while Playing. Neither state machine knows about the other.

</details>

---

## Series Summary — What You Built

After completing all 12 labs, you have a complete Mario-style platformer with:

| System | Implementation |
|--------|---------------|
| Engine | Phaser 3 + TypeScript + Vite |
| Player | `class Player extends Phaser.Physics.Arcade.Sprite` with FSM |
| Enemies | `class Enemy extends Phaser.Physics.Arcade.Sprite` with patrol |
| World | Tiled tilemap with collision + decoration + object layers |
| Camera | Follows player, bounds-clamped, smooth lerp |
| Collectibles | StaticGroup coins with overlap detection |
| Scene flow | MenuScene → GameScene → WinScene with data passing |
| HUD | UIScene overlay with event-emitter communication |
| Game feel | Particle bursts, screen shake, animation state machines |

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| UIScene runs in parallel | HUD visible during gameplay; camera scroll does not move HUD |
| Score updates in HUD | Collect coins — top-center score text updates |
| Lives update in HUD | Die — hearts count down in top-left |
| Timer runs | Time counter increases every second in top-right |
| Coin particles | Collect a coin — gold particle burst appears |
| Stomp particles | Stomp an enemy — white upward burst appears |
| Screen shake on death | Die — camera shakes for 0.5 seconds |
| UIScene stops cleanly | Die 3× (game over) — no HUD ghost after scene restart |

---

## Quick Check Answers

**1. Why put HUD in `UIScene` instead of `GameScene` with `setScrollFactor(0)`?**

Three reasons: (1) Isolation — `scene.restart()` on `GameScene` does not affect
`UIScene`. The HUD survives game-over resets without re-creating text objects.
(2) Decoupling — `UIScene` can be paused independently (pause menu shows HUD,
freezes game). `setScrollFactor(0)` objects in `GameScene` would also freeze on
`scene.pause()`. (3) Cleanliness — `GameScene` handles only game logic; UI code
stays in `UIScene`. Separation of concerns is the OOP principle: each class/scene
has one job.

**2. What is an event emitter?**

A publish/subscribe system: any code can `emit('eventName', data)` without
knowing who is listening. Any code can `on('eventName', callback)` without
knowing who will emit. The emitter is the broker — it connects senders and
receivers without them needing references to each other. Phaser's `game.events`
is a global emitter shared across all scenes. Node.js's `EventEmitter`, the DOM's
`addEventListener`, and React's `useEffect` + `dispatch` all follow the same
model: one side publishes, the other subscribes, no tight coupling.

**3. (Prediction) Reading `GameScene.score` directly from `UIScene` — what problem?**

`UIScene` would hold a direct reference to the `GameScene` instance: `const gs = this.scene.get('Game') as GameScene`. This creates **tight coupling** — UIScene
now depends on GameScene's internal structure. If `GameScene` renames `score`
to `points`, `UIScene` breaks. If `GameScene` is restarted, the reference
becomes stale (points to the old destroyed instance). The event emitter solves
both: UIScene only knows about the `'scoreChanged'` event name and its data
shape — not who emitted it or how that value is stored internally.

---

*Mario series complete! Next series: Metroid Clone. You will build on exactly
this foundation — same Phaser + TypeScript + OOP stack — but add: a graph of
connected rooms, ability-gated doors (missile expansion required), a minimap
that reveals as you explore, and persistent world state (enemies stay dead,
blocks stay broken). The Metroid series assumes all 12 Mario labs as prerequisites.*
