# Mario Platformer — LAB 06 — Sprite Animations

**Prerequisites:** LAB-05 complete. Real tile art renders. Player moves and
jumps on tile ground. The player is still a teal placeholder rectangle.

**What this lab adds:**
- Kenney character spritesheet loaded as a named Phaser spritesheet
- Three animations defined: `idle`, `walk`, `jump` — each a named frame sequence
- `PlayerAnimState` enum on the Player class — picks the correct animation each frame
- The teal rectangle is gone; the player is a real animated character sprite

**Time:** 60 minutes

---

## What You Will Build

```
After LAB-06:

  Standing still  → idle animation: frames cycle at 6 fps
  Running         → walk animation: legs cycle at 12 fps
  In the air      → jump pose: single frame held until landing
  Landing         → transitions immediately back to idle or walk
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. A spritesheet has frames 16px wide on a 192×16px image. How many frames
>    does it contain?
> 2. `anims.play('walk')` vs `anims.play('walk', true)` — what is different?
> 3. *(Prediction)* If you call `anims.play('walk')` every frame inside
>    `update()` without any guard, what happens to the walk animation?
>
> *(Answers at the end of this lab)*

---

## Concept: Spritesheet — A Grid of Animation Frames

**What it is:** A spritesheet is one PNG image that contains multiple
animation frames packed side-by-side in a regular grid. Phaser divides it
into frames by applying `frameWidth` and `frameHeight`, then numbers them
left-to-right, top-to-bottom starting at 0.

**Term: frame** — One image in the spritesheet. Frame 0 is the first
sub-image (top-left). Frame 1 is the next to the right. The last frame of
one row is followed by the first frame of the next row.

**Term: frame rate** — How many frames play per second during an animation.
`frameRate: 12` means the animation advances to the next frame every
`1000/12 ≈ 83ms`.

**Term: `repeat: -1`** — Loop the animation forever. `repeat: 0` plays once
and stops. `repeat: 2` plays three times total (once + 2 repeats).

**Loading a spritesheet:**

```ts
// In preload():
this.load.spritesheet('player', 'assets/player.png', {
  frameWidth: 32,   // each frame is 32 pixels wide
  frameHeight: 48,  // each frame is 48 pixels tall
});
// 'player': the texture key — used when creating a sprite and in anims.create()
```

**Watch for:** The `frameWidth` and `frameHeight` must exactly match the
actual dimensions of each frame in the PNG. If they are wrong, Phaser
slices the image incorrectly and frames bleed into each other.

---

## Concept: `Phaser.Animations.AnimationManager` — Named Frame Sequences

**What it is:** A scene-level system that defines animations by name.
An animation is a sequence of frames from a spritesheet, played at a given
frame rate. Any sprite with the same texture can play the animation by name.

**What it hides:** The frame counter, timing, and frame-advance logic.
Without the AnimationManager, you would track `currentFrame`, `elapsedMs`,
and `frameRate` in every class that animates. The AnimationManager handles
all of that and exposes a single call: `sprite.anims.play('walk')`.

**The protected invariant:** Animations are global — defined once per game,
available to all sprites with the matching texture. You cannot accidentally
define the same animation twice with different frame data if you call
`this.anims.create()` in multiple scenes.

**Defining an animation:**

```ts
// In GameScene.create(), after creating the player:
this.anims.create({
  key: 'walk',
  // 'walk': the name used to play this animation: sprite.anims.play('walk').

  frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
  // generateFrameNumbers: returns an array of frame objects for indices 4, 5, 6, 7.
  // 'player': must match the spritesheet key used in load.spritesheet().

  frameRate: 12,    // advance to the next frame every 83ms (1000/12)
  repeat: -1,       // loop forever
});
```

**Playing an animation:**

```ts
sprite.anims.play('walk', true);
// Second arg (ignoreIfPlaying): true = do not restart if already playing.
// Without this, calling play() every frame resets to frame 0 every frame —
// the sprite appears frozen on frame 0 (never advances).
```

**Watch for:** `anims.create()` is called on the scene (`this.anims.create()`),
not on an individual sprite. The animation is registered globally. Playing is
called on the sprite (`this.anims.play()`), not the scene.

---

## Concept: Animation State Machine — Choosing the Right Clip

**What it is:** A set of rules that decides which animation plays based on the
player's current physical state, evaluated every frame.

**The problem before:**

Without a state machine, animation calls pile up in `update()` with bugs like
the walk animation continuing to play during a jump:

```ts
// Bug-prone without state machine:
if (cursors.left.isDown) this.anims.play('walk', true);
if (cursors.right.isDown) this.anims.play('walk', true);
// Forgot to check ground state — walk plays during jumps too
```

**The solution — one clear decision per frame:**

```ts
// Determine what state we are in:
let newState: PlayerAnimState;
if (!this.isOnGround()) {
  newState = PlayerAnimState.Jump;      // air overrides everything
} else if (Math.abs(body.velocity.x) > 10) {
  newState = PlayerAnimState.Walk;      // moving on ground
} else {
  newState = PlayerAnimState.Idle;      // standing still
}

// Only change animation when state actually changes:
if (newState !== this.animState) {
  this.animState = newState;
  this.anims.play(this.animState, true);
}
```

**What it hides:** The if/else logic that checks all combinations of ground
state and velocity. The guard `if (newState !== this.animState)` hides the
"only call play() when the animation should actually change" rule — without
it, every frame calls `play()` and the animation restarts from frame 0.

**The `> 10` threshold:** `Math.abs(body.velocity.x) > 10` rather than `> 0`.
At rest, floating-point velocity is "almost zero" but rarely exactly zero.
The threshold prevents flickering between idle and walk when the player is
standing but the physics solver produces a tiny residual x velocity.

---

## Step 1 — Find and Copy the Player Spritesheet

Inside the Kenney Platformer Pack (downloaded in LAB-05), look for a
`Player/` folder or `Characters/` folder. Find a PNG spritesheet with:
- A walking/running cycle (at least 4 frames)
- A jump or airborne pose
- An idle or standing frame

Common file names: `player_spritesheet.png`, `character_spritesheet.png`.

Copy it to `public/assets/player.png`.

Open `http://localhost:5173/assets/player.png` in the browser.

**You should see:** The character spritesheet — multiple poses/frames in one image.

Note the exact pixel dimensions of each frame (hover over the image in the
browser to see its full size, then divide by the number of frames per row to
get the frame width).

For this lab, assume:
- Frame size: **32 × 48 pixels**
- Frames 0–3: idle cycle (4 frames)
- Frames 4–7: walk/run cycle (4 frames)
- Frame 8: jump pose (1 frame)

Adjust frame indices in Step 4 to match your actual spritesheet if different.

### SAVE AND TRY

**You should see:** The spritesheet PNG at `http://localhost:5173/assets/player.png`.

**Change something:** The Kenney pack may have multiple character color variants.
Try a different color variant's PNG. Only the frame layout matters for this lab —
the code works with any Kenney character sheet that has the same frame structure.

---

## Step 2 — Load the Spritesheet in `GameScene.preload()`

Open `src/scenes/GameScene.ts`. In `preload()`, replace the player placeholder
texture generation with a real spritesheet load:

```ts
  preload(): void {
    this.load.spritesheet('tiles', 'assets/spritesheet_ground.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.tilemapTiledJSON('level1', 'assets/level1.tmj');

    this.load.spritesheet('player', 'assets/player.png', {  // ← replace playerGfx block with this
      frameWidth: 32,    // adjust to match your actual spritesheet frame width
      frameHeight: 48,   // adjust to match your actual spritesheet frame height
    });
    // Remove the this.make.graphics / playerGfx block entirely — no longer needed.
  }
```

### SAVE AND TRY

Save. The browser may show a broken-looking player (the Player constructor
still references `'player-placeholder'` which no longer exists). That is
expected — we fix it in Step 3.

**In DevTools Console:**

Look for any load errors. If `player.png` loaded correctly, no errors appear.

---

## Step 3 — Update `Player.ts` to Use the Real Texture Key

Open `src/Player.ts`. Change the texture key in the `super()` call:

```ts
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');   // ← was: 'player-placeholder'
    // 'player': matches the key used in this.load.spritesheet('player', ...) in GameScene.
    // ...rest of constructor unchanged...
  }
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** The real character sprite at the player spawn position.
It is probably stuck on a single frame and does not animate yet — that is
correct. Animations are defined in Step 4.

**In DevTools Console:**

```js
// Expose player temporarily in create(): (window as any).player = this.player;
player.texture.key
```

**Expected:** `'player'` — confirms the real texture is loaded and applied.

**Change something:** In `Player.ts`, change `'player'` back to
`'player-placeholder'` temporarily. Save. The sprite becomes a magenta square
(Phaser's missing-texture indicator). Change it back to `'player'`.

---

## Step 4 — Define Animations in `GameScene.create()`

Open `src/scenes/GameScene.ts`. Add animation definitions at the END of
`create()`, after the player and colliders are set up:

```ts
    // ── Animations ────────────────────────────────────────────────────────
    // Defined here (on the scene) not inside Player — animations are global
    // assets, shared across all sprites that use the 'player' texture.

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      // Frames 0–3 from the 'player' spritesheet — adjust to your sheet's layout.
      frameRate: 6,   // slow idle: one frame every 167ms
      repeat: -1,     // loop continuously
    });

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      // Frames 4–7: the run cycle.
      frameRate: 12,  // faster: one frame every 83ms — legs move visibly
      repeat: -1,
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', { start: 8, end: 8 }),
      // Frame 8 only: a single jump pose. start === end = one frame.
      frameRate: 1,
      repeat: 0,      // play once — it is a static pose, not a cycle
    });
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** The player sprite still shows a single frame — animations
are defined but not started yet. No errors in the console means the frame
indices are valid.

**In DevTools Console:**

```js
// Expose player if not already: (window as any).player = this.player;
player.anims.play('walk');
```

**Expected:** The walk animation starts playing — you should see the character's
legs moving in the browser. This confirms the animation frames are correct.

**Change something:** Run `player.anims.play('idle')` in the console. The idle
animation plays (slower cycle). Run `player.anims.play('jump')` — the jump
pose appears and stays (repeat: 0). Confirm all three animation keys work.

---

## Step 5 — Add `PlayerAnimState` and Animation Logic to the Player Class

Open `src/Player.ts`. Add the enum before the class, then the animState property
and animation logic inside the update method:

```ts
// Add this enum BEFORE the class declaration:

// PlayerAnimState: the three visual states the player can be in.
// String enum: each value is the animation key string — this.anims.play(this.animState)
// works directly without a switch statement to translate enum → string.
enum PlayerAnimState {
  Idle = 'idle',   // matches the 'idle' key in this.anims.create()
  Walk = 'walk',   // matches 'walk'
  Jump = 'jump',   // matches 'jump'
}
```

Add the `animState` property to the class:

```ts
export class Player extends Phaser.Physics.Arcade.Sprite {

  private animState: PlayerAnimState = PlayerAnimState.Idle;  // ← add property
  // Tracks which animation is currently playing — used to detect state changes.
  // Initialized to Idle — the player spawns standing still.

  // ...constructor, isOnGround unchanged...
```

Add animation logic at the END of `Player.update()`, after the jump logic:

```ts
  public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {

    // ...existing horizontal movement code (unchanged)...
    // ...existing jump code (unchanged)...

    // ── Animation state machine ───────────────────────────────────────────
    const body = this.body as Phaser.Physics.Arcade.Body;

    let newState: PlayerAnimState;

    if (!this.isOnGround()) {
      newState = PlayerAnimState.Jump;
      // In the air — always show jump pose regardless of x velocity.
    } else if (Math.abs(body.velocity.x) > 10) {
      newState = PlayerAnimState.Walk;
      // On the ground and moving horizontally (threshold >10 prevents idle/walk
      // flicker from near-zero floating-point residual velocity).
    } else {
      newState = PlayerAnimState.Idle;
      // On the ground and still.
    }

    if (newState !== this.animState) {  // ← add this block
      this.animState = newState;
      this.anims.play(this.animState, true);
      // Second arg 'true' (ignoreIfPlaying): do not restart if this animation
      // is already playing. The state-change guard above makes this a safety net.
    }
  }
```

### SAVE AND TRY

Save. Play the game.

**You should see:**
- Standing: idle animation cycles slowly
- Running: walk cycle plays with leg movement
- Jumping: jump pose appears and holds until landing
- Landing: transitions immediately back to idle or walk

**In DevTools Console:**

```js
// Expose player: (window as any).player = this.player;
player.anims.currentAnim.key   // while standing → 'idle'
// Move right, then check: → 'walk'
// Jump, then check immediately: → 'jump'
```

**Change something:** Change the walk `frameRate` from `12` to `3`. Save. The
walk cycle is very slow — clearly one frame every 333ms. Change it back to `12`.

---

## 🎯 Challenge: Add a Fall Animation

**You know:** `body.velocity.y > 0` means the player is moving downward
(falling). `body.velocity.y < 0` means moving upward (after a jump).

**Task:** Add a fourth state `Fall = 'fall'` to `PlayerAnimState`. Define a
`'fall'` animation in `GameScene.create()` — it can reuse the same frame as
jump (`start: 8, end: 8`) or use a different frame if your spritesheet has one.
Update the state machine priority:

```
Not on ground AND velocity.y < 0  → Jump (ascending)
Not on ground AND velocity.y >= 0 → Fall (descending)
On ground AND |velocity.x| > 10  → Walk
On ground AND |velocity.x| <= 10 → Idle
```

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Add to PlayerAnimState enum:
enum PlayerAnimState {
  Idle = 'idle',
  Walk = 'walk',
  Jump = 'jump',
  Fall = 'fall',   // ← new state
}

// In GameScene.create(), add the fall animation:
this.anims.create({
  key: 'fall',
  frames: this.anims.generateFrameNumbers('player', { start: 8, end: 8 }),
  // Reuse frame 8 — or use a dedicated falling frame if your spritesheet has one.
  frameRate: 1,
  repeat: 0,
});

// In Player.update(), updated state machine:
if (!this.isOnGround()) {
  newState = body.velocity.y < 0
    ? PlayerAnimState.Jump    // ascending — negative y = upward
    : PlayerAnimState.Fall;   // descending — positive y = downward
} else if (Math.abs(body.velocity.x) > 10) {
  newState = PlayerAnimState.Walk;
} else {
  newState = PlayerAnimState.Idle;
}
```

**Key insight:** Checking `velocity.y < 0` versus `velocity.y >= 0` splits
the airborne state into "going up" and "going down." This is a common
improvement — many players expect a different pose while falling vs while
jumping. The state machine priority (air states first) ensures ground states
are only reached when `isOnGround()` is true, preventing the walk or idle
frame from flashing for one frame at the apex of a jump.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Real character sprite visible | Teal rectangle is gone — Kenney art appears |
| Idle animation plays | Stand still — frames cycle at 6fps |
| Walk animation plays | Hold an arrow key — character's legs move |
| Jump pose shows | Press Space — single frame appears while airborne |
| No animation restart flicker | Walk continuously — animation flows without resetting |
| State machine prevents duplicates | Console: `player.anims.currentAnim.key` matches visible state |

---

## Quick Check Answers

**1. How many frames in a 192×16px sheet with 16px frame width?**

`192 / 16 = 12` frames. The sheet is one row of 12 frames. Frame indices 0–11
are valid. `generateFrameNumbers('key', { start: 0, end: 11 })` would reference
all 12.

**2. `anims.play('walk')` vs `anims.play('walk', true)` — what is different?**

The second argument is `ignoreIfPlaying`. With `true`: if `'walk'` is already
the active animation, do nothing — do not restart from frame 0. With `false`
(or omitted): always restart from frame 0, even if it is currently playing.
In `update()`, calling `play('walk')` every frame without `true` resets to frame 0
every 16ms — the character is stuck on frame 0 and never walks. The
`if (newState !== this.animState)` guard prevents the call entirely when
the state has not changed; `true` is a second line of defence.

**3. (Prediction) `anims.play('walk')` every frame without a guard?**

The walk animation resets to frame 0 every frame. Since `update()` runs at
~60fps and the animation fires `play('walk')` each call, the animation restarts
60 times per second. Each restart displays frame 0 for ~16ms before the next
restart. The character appears frozen on frame 0 — it looks like a static image.
The walk animation IS playing — it is just restarting before ever reaching
frame 1. The guard `if (newState !== this.animState)` calls `play()` only when
the state actually changes, which is at most once per state transition.

---

*Next: LAB-07 — The Camera. We configure Phaser's camera to follow the player
through the 1600px-wide level, set world and camera bounds, and explain the
difference between world space and screen space — the coordinate transform
that makes scrolling work without touching a single game object position.*
