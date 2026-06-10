# Mario Platformer — LAB 04 — Keyboard Controls and Jumping

**Prerequisites:** LAB-03 complete. `Player` class exists, falls under gravity,
stands on ground, and has an `isOnGround()` method. `Player.update()` is called
from `GameScene.update()` every frame.

**What this lab adds:**
- `CursorKeys` — Phaser's pre-built input object for the four arrow keys and Space
- Left/right movement: constant horizontal velocity while a key is held
- Jumping: an upward velocity impulse that only fires when on the ground
- Sprite facing direction: flips horizontally to match movement direction

**Time:** 45–60 minutes

---

## What You Will Build

```
After this lab:

  ← Arrow:  player slides left, faces left, stops immediately on release
  → Arrow:  player slides right, faces right, stops immediately on release
  Space:    player launches upward, arcs under gravity, lands back on ground
            (cannot jump again until landed — no double jump)
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. Setting velocity vs setting acceleration for horizontal movement — what
>    does each produce and which feels more like Mario?
> 2. Why must we check `isOnGround()` before allowing a jump?
> 3. *(Prediction)* If left AND right arrow are both held simultaneously,
>    what happens with the current `if / else if` structure?
>
> *(Answers at the end of this lab)*

---

## Concept: `Phaser.Types.Input.Keyboard.CursorKeys`

**What it is:** A pre-built object that holds typed references to the four
arrow keys and the Shift and Space keys. Each key has an `isDown` property
that is `true` while the key is held.

**What it hides:** Without `CursorKeys`, registering each key requires a
separate call:
```ts
const leftKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
const rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
// ...repeat for every key...
```
`createCursorKeys()` registers all six common platformer keys at once and
returns them in one typed object.

**The protected invariant:** `CursorKeys` is scene-scoped. When a scene stops,
Phaser automatically removes all key listeners that scene registered. A `window.addEventListener('keydown', ...)` call, by contrast, is global — it
survives scene transitions and causes bugs where input from a dead scene
fires during a live one.

**The two ways to read a key:**

```ts
cursors.right.isDown
// true EVERY frame the key is held.
// Use for movement — you want continuous velocity while held.

Phaser.Input.Keyboard.JustDown(cursors.space)
// true only on the FIRST frame the key is pressed.
// Returns false on all subsequent frames while it is held.
// Use for actions (jump, attack) — you want one trigger, not one per frame.
```

**Term: `isDown`** — a boolean property on a Phaser Key object. `true` while
the physical key is held down.

**Term: `JustDown`** — a Phaser static function that checks whether a key
transitioned from up to down THIS frame. It reads an internal "pressed this
frame" flag that is cleared after the first check.

**Watch for:** Create `CursorKeys` in `create()`, not in `update()`.
`createCursorKeys()` registers event listeners each time it is called. Calling
it in `update()` creates 60 sets of listeners per second — a memory leak.
Create once, read every frame.

---

## Math: Velocity Impulse vs Continuous Acceleration

**What it computes:** Two different ways to cause horizontal motion, producing
very different movement feels.

**The real-world analogy:**

- **Impulse** — hitting a billiard ball. One strike sets the ball moving at a
  fixed speed instantly. No ramp-up, no ramp-down.
- **Continuous acceleration** — pressing a car's gas pedal. Speed grows over
  time. Release the pedal and a separate braking force is needed to stop.

**In Phaser:**

```ts
// Impulse (what we use):
this.setVelocityX(200);
// The player moves at exactly 200 px/s immediately.
// When the key is released, setVelocityX(0) stops them instantly.
// Feel: crisp, snappy, responsive. Classic Mario.

// Acceleration (not used here):
this.setAccelerationX(200);
// The player gains 200 px/s of speed each second.
// After 1 second: 200 px/s. After 2s: 400 px/s.
// Requires friction (setDrag) to slow down after key release.
// Feel: slippery, momentum-based. Like driving on ice or an air hockey puck.
```

**For this game:** Impulse. `setVelocityX(MOVE_SPEED)` while the key is held,
`setVelocityX(0)` when released. The player has no inertia.

**The jump impulse:**

```ts
this.setVelocityY(JUMP_VELOCITY);   // JUMP_VELOCITY = -520
// Instantly sets upward velocity to 520 px/s.
// Gravity (600 px/s²) then decelerates the player each frame:
//   After 0.5s: velocity = -520 + (600 × 0.5) = -220 px/s (still going up)
//   After 0.87s: velocity = -520 + (600 × 0.87) ≈ 0 (peak — momentarily still)
//   After 1s:   velocity = -520 + (600 × 1.0) = +80 px/s (now falling)
// Peak height ≈ 225 pixels above the jump point.
```

**Why it matters here:** This is a single `setVelocityY` call. Gravity handles
the entire arc automatically — no manual arc calculation needed.

---

## Logic: The Jump Condition

**What it decides:** Whether the player is allowed to jump right now.

**Truth table:**

```
jumpPressed   isOnGround()   → Jump fires?
  false           false      → No  (key not pressed AND not on ground)
  false           true       → No  (key not pressed, even though grounded)
  true            false      → No  (key pressed but in the air — no double jump)
  true            true       → YES (key just pressed AND on the ground)
```

**The code:**

```ts
const jumpPressed = Phaser.Input.Keyboard.JustDown(cursors.space);
if (jumpPressed && this.isOnGround()) {
  this.setVelocityY(JUMP_VELOCITY);
}
```

**Why `JustDown` (not `cursors.space.isDown`):**

If we used `isDown`, the check fires EVERY frame while Space is held. On the
frame the player lands, `isDown` is still `true` — the jump would immediately
re-fire, making the player bounce continuously. `JustDown` is `true` only once
per press — the player must release Space and press it again to jump again.

**Watch for:** `JustDown(key)` returns `true` once and then `false` for all
subsequent frames of that key press — even if checked multiple times in the same
frame. It reads and clears an internal "pressed this frame" flag. This means you
can only call `JustDown` once per frame per key — calling it a second time in
the same frame will always return `false`.

---

## Step 1 — Create `CursorKeys` in `GameScene`

Open `src/scenes/GameScene.ts`. Add the `cursors` property and create it in `create()`:

```ts
export class GameScene extends Phaser.Scene {

  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;   // ← add property

  // ...constructor unchanged...

  create(): void {
    this.cameras.main.setBackgroundColor('#87CEEB');

    this.platforms = this.physics.add.staticGroup();
    const ground = this.platforms.create(400, 584, 'ground') as Phaser.Physics.Arcade.Image;
    ground.setOrigin(0.5, 0.5);
    ground.refreshBody();

    this.player = new Player(this, 100, 100);
    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard!.createCursorKeys();   // ← add this line
    // createCursorKeys(): registers arrow keys + Space + Shift as a group.
    // The '!' asserts keyboard is not null — Phaser always creates the
    // keyboard manager when a scene starts.
    // Called in create() — NOT in update() — to avoid creating new listeners every frame.
  }

  update(_time: number, delta: number): void {
    this.player.update(this.cursors);   // ← was: this.player.update()
    // Pass cursors to the player each frame — Player reads them inside its own update().
  }
}
```

### SAVE AND TRY

Save `src/scenes/GameScene.ts`. TypeScript will now show an error in `Player.ts`
because `Player.update()` does not yet accept a `cursors` argument. That is
expected — we fix it in the next step.

**In DevTools Console:**

```js
// The game may show a TypeScript compile error in Vite's overlay.
// This is expected — it will be resolved in Step 2.
```

---

## Step 2 — Add Movement and Jump to `Player.update()`

Open `src/Player.ts`. Update the `update()` method signature and body:

```ts
  // update: called every frame by GameScene. Reads cursors and applies movement.
  // Parameter type: Phaser.Types.Input.Keyboard.CursorKeys — the pre-built
  // input bundle from this.input.keyboard!.createCursorKeys().
  public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {  // ← was: update(): void

    // ── Horizontal movement ───────────────────────────────────────────────

    if (cursors.left.isDown) {
      this.setVelocityX(-MOVE_SPEED);   // negative x = leftward movement
      this.setFlipX(true);
      // setFlipX(true): mirrors the sprite horizontally.
      // The texture was drawn facing right — flipping makes it face left.
    } else if (cursors.right.isDown) {
      this.setVelocityX(MOVE_SPEED);    // positive x = rightward movement
      this.setFlipX(false);             // normal orientation — faces right
    } else {
      this.setVelocityX(0);
      // Neither key held: stop horizontal movement immediately.
      // Impulse-style control: constant speed while held, instant stop on release.
      // (Acceleration-based would require drag to stop: body.setDrag(...).)
    }

    // ── Jump ─────────────────────────────────────────────────────────────

    const jumpPressed = Phaser.Input.Keyboard.JustDown(cursors.space);
    // JustDown: true only on the first frame Space is pressed.
    // Prevents Space being held from re-triggering the jump every frame.

    if (jumpPressed && this.isOnGround()) {
      this.setVelocityY(JUMP_VELOCITY);
      // JUMP_VELOCITY = -520: instant upward velocity (negative = upward in Phaser).
      // Gravity decelerates this each frame, producing the arc.
      // isOnGround() prevents double-jumping — only valid when touching ground.
    }
  }
```

Also remove the tint logic from the challenge (if you added it) — it was
a temporary verification tool:

```ts
  public isOnGround(): boolean {
    return (this.body as Phaser.Physics.Arcade.Body).blocked.down;
    // Remove any setTint / clearTint calls added in the LAB-03 challenge.
  }
```

### SAVE AND TRY

Save. Click the browser canvas to give it keyboard focus (required for input).

**You should see:**
- Hold left arrow: player slides left, stops at the left wall
- Hold right arrow: player slides right, stops at the right wall
- Release arrow: player stops immediately
- Press Space while standing: player launches upward, falls back under gravity
- Press Space mid-air: nothing happens

**In DevTools Console:**

```js
// While holding right arrow, expose the player temporarily in create():
// (window as any).player = this.player;
// Then in console:
player.body.velocity.x
```

**Expected while right is held:** A positive number close to `200`. Exactly
`200` between frames; may show slight variation due to physics timing.

**Change something:** Change `MOVE_SPEED` from `200` to `400`. Save. Movement
feels noticeably faster. Change back to `200` — `400` is too fast for the
narrow 800px game width.

---

## 🎯 Challenge: Coyote Time

**You know:** `isOnGround()` uses `body.blocked.down`. `JustDown` gives a
one-frame window for the jump press.

**What coyote time is:** A deliberate "lie" to the physics — the player is
allowed to jump for a brief window after walking off a ledge, even though
`isOnGround()` is already `false`. Named after Wile E. Coyote who runs off
cliffs and keeps going for a moment. Used in Mario, Celeste, Hollow Knight,
and most modern platformers.

**Task:** Add a `coyoteTimer` to the Player class. When the player transitions
from on-ground to in-air (was grounded last frame, is not grounded this frame),
set `coyoteTimer = 150` (150 milliseconds). Decrement it each frame using
the `delta` parameter (ms since last frame, passed from `GameScene.update()`).
The jump condition becomes: `jumpPressed && (this.isOnGround() || coyoteTimer > 0)`.
After jumping, set `coyoteTimer = 0` so it cannot be used again until the
next time the player leaves the ground.

**You need to:**
1. Add `private coyoteTimer: number = 0` and `private wasOnGround: boolean = false` to the class
2. Add `delta: number` as a second parameter to `update(cursors, delta)`
3. Update the coyoteTimer logic each frame
4. Update the jump condition

**Hint for the timer logic:**

```ts
const onGround = this.isOnGround();
if (this.wasOnGround && !onGround) {
  this.coyoteTimer = 150;   // just left the ground — open the window
}
if (this.coyoteTimer > 0) {
  this.coyoteTimer -= delta;  // count down using real elapsed ms
}
this.wasOnGround = onGround;
```

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In Player class — add properties:
private coyoteTimer: number = 0;
private wasOnGround: boolean = false;

// Update method signature:
public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number): void {

  const onGround = this.isOnGround();

  // Track coyote window:
  if (this.wasOnGround && !onGround) {
    this.coyoteTimer = 150;   // ms — 150ms is the standard coyote window
  }
  if (this.coyoteTimer > 0) {
    this.coyoteTimer -= delta;   // delta: ms since last frame
  }
  this.wasOnGround = onGround;

  // Horizontal movement (unchanged):
  if (cursors.left.isDown) { this.setVelocityX(-MOVE_SPEED); this.setFlipX(true); }
  else if (cursors.right.isDown) { this.setVelocityX(MOVE_SPEED); this.setFlipX(false); }
  else { this.setVelocityX(0); }

  // Jump with coyote time:
  const jumpPressed = Phaser.Input.Keyboard.JustDown(cursors.space);
  const canJump = onGround || this.coyoteTimer > 0;   // ← modified condition
  if (jumpPressed && canJump) {
    this.setVelocityY(JUMP_VELOCITY);
    this.coyoteTimer = 0;   // consume the window — cannot use it again mid-air
  }
}

// In GameScene.update(), pass delta:
this.player.update(this.cursors, delta);
```

**Key insight:** `coyoteTimer -= delta` uses frame-rate-independent timing.
`delta` is the actual ms elapsed since the last frame — at 60fps this is ~16.7ms,
at 30fps it is ~33ms. The timer counts down at the same real-world speed
regardless of frame rate. If you used a frame counter instead (`coyoteFrames--`),
the window would be shorter on fast hardware and longer on slow hardware.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Left arrow moves left | Player slides leftward, stops at x=0 boundary |
| Right arrow moves right | Player slides rightward, stops at right boundary |
| Sprite flips on direction | Left = sprite faces left; Right = faces right (if spritesheet is directional) |
| No movement on key release | Release arrow — player stops immediately (no slide) |
| Space jumps from ground | Press Space while standing — visible upward arc |
| No double jump | Press Space mid-air — no second jump |
| `CursorKeys` created in `create()` | Verify `this.cursors` is assigned in `create()` not `update()` |

---

## Quick Check Answers

**1. Velocity vs acceleration for horizontal movement — which is Mario?**

`setVelocityX` is impulse — the player moves at exactly `MOVE_SPEED` the moment
the key is held, and stops instantly when released. No ramp-up, no ramp-down.
`setAccelerationX` requires also setting `setDrag` or manually decelerating —
the player builds speed gradually and slides after releasing. Mario uses
velocity-style control: instantaneous speed, instantaneous stop. It feels
responsive because there is zero delay between input and motion. Acceleration
would feel like walking on ice.

**2. Why check `isOnGround()` before jumping?**

Without the check, `setVelocityY(JUMP_VELOCITY)` fires every frame Space is
held (or every frame via `JustDown`, once per press regardless of ground state).
If pressed mid-air, the player gets a second upward impulse — a double jump.
For a Mario-style game this is unintended. `isOnGround()` makes the jump
condition: "Space was just pressed AND the player is currently touching the
ground." Only when both are true does the impulse fire.

**3. (Prediction) Both left and right held simultaneously with `if / else if`?**

`if (cursors.left.isDown)` runs first. If left is held, `setVelocityX(-MOVE_SPEED)`
fires and the `else if` block never runs — right is ignored. Left takes priority.
An alternative: check both keys, and if both are held, call `setVelocityX(0)` —
the forces cancel. Both approaches are valid; priority-to-left is the current
behavior. Many games let the last-pressed key win (requires tracking which was
pressed more recently), but that is more complex than this series requires.

---

*Next: LAB-05 — Tilemaps. We replace the placeholder ground rectangle with a
real tiled level built in Tiled Map Editor, loaded from a JSON file. The player
will stand on tile-art ground and floating platforms. The colored rectangles
are gone.*
