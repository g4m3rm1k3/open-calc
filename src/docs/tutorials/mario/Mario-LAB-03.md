# Mario Platformer — LAB 03 — The Player Class

**Prerequisites:** LAB-02 complete. A teal rectangle falls and lands on brown
ground. Physics debug mode has been turned off. You understand `StaticGroup`,
`collider`, and gravity as constant acceleration.

**What this lab adds:**
- `class Player extends Phaser.Physics.Arcade.Sprite` — the player is a typed OOP class
- `src/Player.ts` — a dedicated file so player logic is separate from scene logic
- `isOnGround()` — a predicate method that reports whether the player touches ground
- `GameScene` uses `new Player(...)` instead of the raw `physics.add.image` call

**Time:** 45–60 minutes

---

## What You Will Build

```
Before: a raw Phaser.Physics.Arcade.Image called 'playerBody' — no methods,
        no OOP structure, all future player logic would pile into GameScene

After:  a Player class instance — same teal rectangle, same physics,
        but now it carries its own state and can hold its own methods.
        GameScene.update() calls player.update() — one line.
```

Visually identical to LAB-02. The change is architectural — the player becomes
a typed object that can grow without making `GameScene` unmanageable.

---

> **Quick Check — try to answer before reading further:**
>
> 1. Tetris V3 had a `Piece` class with `private cells` and `public position`.
>    What are the equivalent private and public members for a `Player` class
>    in a platformer?
> 2. `extends Phaser.Physics.Arcade.Sprite` — what does the player class
>    inherit? Name three specific things it gains from the parent.
> 3. *(Prediction)* If you write `new Player(scene, x, y)` without calling
>    `scene.add.existing(this)` inside the constructor, what is missing?
>
> *(Answers at the end of this lab)*

---

## Concept: Class Inheritance — `extends`

**What it is:** `class Player extends Phaser.Physics.Arcade.Sprite` creates
a new class that has every property and method of `Phaser.Physics.Arcade.Sprite`,
plus whatever you add. The Player IS a sprite — it can be used anywhere a
sprite is expected.

**The problem before:**

In LAB-02, the player was a raw `Phaser.Physics.Arcade.Image`. All future
player logic — keyboard input, jump, animation state, health — would have to
live in `GameScene.update()`. `GameScene` would grow to hundreds of lines,
mixing scene management with player logic. Changing one breaks the other.

**The solution — player logic in the Player class:**

```ts
// GameScene.update() before:
update() {
  if (cursors.left.isDown) this.playerBody.setVelocityX(-200);
  else if (cursors.right.isDown) this.playerBody.setVelocityX(200);
  else this.playerBody.setVelocityX(0);
  if (Phaser.Input.Keyboard.JustDown(cursors.space) && onGround) { ... }
  // ...animation logic...
  // ...health logic...
  // ...100 more lines...
}

// GameScene.update() after:
update() {
  this.player.update(this.cursors);   // one line — Player handles itself
}
```

**What it hides:** The Player class hides all player-specific logic from
`GameScene`. The scene does not know how jumping works, what animation states
exist, or what the jump speed value is. It only knows: "tell the player to
update itself."

**The protected invariant:** `GameScene` can only interact with the player
through the Player's public interface (public methods and properties).
Private fields and private methods inside `Player` cannot be accessed or
corrupted from outside the class.

**Term: parent class** — The class being extended (`Phaser.Physics.Arcade.Sprite`).
Also called the **superclass** or **base class**.

**Term: child class** — The class doing the extending (`Player`). Also called
the **subclass** or **derived class**.

**Term: inherit** — The child class automatically has all non-private members
of the parent class. The Player inherits `setVelocityX`, `setVelocityY`,
`this.body`, `this.anims`, `this.x`, `this.y`, and dozens more.

**Watch for:** The child class inherits only what the parent makes accessible.
`private` members of the parent are NOT inherited — they are completely hidden.
`protected` members ARE inherited (visible to child classes but not to outside
code). Phaser's sprite properties are mostly `public` — the Player can use all
of them.

---

## Concept: `super()` — Calling the Parent Constructor

**What it is:** `super(...)` inside a constructor calls the parent class's
constructor, passing the required arguments. It must be the first line in
any constructor that extends another class.

**The problem before:**

When you write `class Player extends Phaser.Physics.Arcade.Sprite`, TypeScript
knows that `Phaser.Physics.Arcade.Sprite` requires certain initialization to
work (it needs to know which scene it belongs to, where it is positioned, and
which texture to display). Without calling `super()`, those initializations
never happen — the sprite is broken.

**The rule:** If your class extends another class and defines a `constructor`,
`super()` must be the very first statement.

```ts
constructor(scene: Phaser.Scene, x: number, y: number) {
  super(scene, x, y, 'player-placeholder');
  // Calls Phaser.Physics.Arcade.Sprite's constructor with these four arguments.
  // After super() returns, 'this' is a fully initialized Phaser sprite.
  // Now safe to set player-specific properties:
  this.setCollideWorldBounds(true);
}
```

**Watch for:** If you forget `super()`, TypeScript shows: "Constructors for
derived classes must contain a 'super' call." If you call `super()` after any
`this.` reference, TypeScript shows: "'super' must be called before accessing
'this' in the constructor of a derived class." Both are compile errors —
caught before the code ever runs.

---

## Concept: `scene.add.existing()` and `scene.physics.add.existing()`

**What they are:** Two registration calls that tell Phaser a manually
constructed game object should be rendered and simulated.

**The problem before (why these calls are needed):**

When you use `this.physics.add.sprite(x, y, key)` in a scene, Phaser creates
the sprite AND registers it in two internal lists automatically:
1. The **display list** — what gets rendered each frame
2. The **physics world** — what gets gravity, velocity, and collision applied

When you use `new Player(scene, x, y)` directly (bypassing Phaser's factory
methods), Phaser does NOT automatically register the object. It exists in
memory but participates in nothing — it does not render, and physics does
not apply to it.

**The solution — register manually inside the constructor:**

```ts
constructor(scene: Phaser.Scene, x: number, y: number) {
  super(scene, x, y, 'player-placeholder');

  scene.add.existing(this);
  // Adds 'this' to the scene's display list → renders each frame.

  scene.physics.add.existing(this);
  // Adds 'this' to the physics world → gravity + collision apply.
}
```

**What `scene.add.existing()` hides:** The scene maintains a sorted list of
everything to render. `add.existing()` inserts the object at the correct position
in that list. Without it, the object has no entry in the list — it is invisible
even though the texture is loaded and the position is set.

**What `scene.physics.add.existing()` hides:** The physics world maintains a
separate list of all bodies to simulate each frame. `physics.add.existing()`
registers the object's physics body in that list. Without it, gravity is not
applied, velocity does nothing, and collision detection ignores the object.

**The protected invariant:** Once both calls are made, the object's full
lifecycle is managed by the scene — it renders every frame and physics is
applied every frame until the object is destroyed. Destruction removes it
from both lists automatically.

**Watch for:** Both calls must happen AFTER `super()`. Before `super()`,
`this` is not initialized and neither call would have a valid object to register.

---

## Step 1 — Create `src/Player.ts`

Create a new file `src/Player.ts`. Write the constructor only — we add methods
one at a time in the following steps:

```ts
// src/Player.ts

// PLAYER_WIDTH, PLAYER_HEIGHT: the player's physics body and texture dimensions.
// Named constants so both the texture generation (in GameScene.preload) and any
// future code that checks player size can reference the same values.
export const PLAYER_WIDTH: number = 32;   // pixels wide
export const PLAYER_HEIGHT: number = 48;  // pixels tall

// JUMP_VELOCITY: the upward impulse applied when the player jumps.
// Negative because Phaser's y-axis increases downward — upward = negative y.
// -520 produces a jump arc of ~220 pixels, roughly 1/3 of the 600px screen height.
const JUMP_VELOCITY: number = -520;

// MOVE_SPEED: horizontal pixels per second while a movement key is held.
const MOVE_SPEED: number = 200;

export class Player extends Phaser.Physics.Arcade.Sprite {
  // 'extends': Player inherits the full Phaser sprite API — x, y, body, anims,
  // setVelocityX, setVelocityY, setFlipX, setCollideWorldBounds, and more.

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-placeholder');
    // super(): calls Phaser.Physics.Arcade.Sprite's constructor.
    // Must be first — 'this' is not valid until super() returns.
    // 'player-placeholder': the texture key generated in GameScene.preload().

    scene.add.existing(this);
    // Registers this sprite with the scene's display list → it will be rendered.

    scene.physics.add.existing(this);
    // Registers this sprite with the physics world → gravity and collision apply.

    // ── Physics body configuration ─────────────────────────────────────────

    this.setCollideWorldBounds(true);
    // Prevents the player from leaving the 800×600 game boundary.
    // Without this: the player can walk off the left/right edges into empty space.

    const body = this.body as Phaser.Physics.Arcade.Body;
    // this.body is typed as Phaser.Physics.Arcade.Body | Phaser.Physics.MatterJS.BodyType
    // because Phaser supports multiple physics engines.
    // 'as Phaser.Physics.Arcade.Body': we tell TypeScript this is definitely an
    // Arcade body (because we are using arcade physics) — unlocking Arcade-specific
    // properties like body.blocked, body.setMaxVelocityY, etc.

    body.setMaxVelocityY(800);
    // Cap downward speed at 800 px/s. Without this cap, long falls accelerate
    // indefinitely — the player could reach thousands of px/s and pass through
    // platforms in a single frame (a collision detection failure called "tunneling").
  }
}
```

Now open `src/scenes/GameScene.ts` and replace the `playerBody` approach with
the `Player` class. Make all four changes shown below:

```ts
import { Player, PLAYER_WIDTH, PLAYER_HEIGHT } from '../Player';   // ← add this import

export class GameScene extends Phaser.Scene {

  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Player;   // ← was: private playerBody!: Phaser.Physics.Arcade.Image;

  constructor() { super({ key: 'Game' }); }

  preload(): void {
    const groundGfx = this.make.graphics({ x: 0, y: 0 });
    groundGfx.fillStyle(0x8B4513);
    groundGfx.fillRect(0, 0, 800, 32);
    groundGfx.generateTexture('ground', 800, 32);
    groundGfx.destroy();

    // The player-placeholder texture must use the exported constants so the
    // texture size matches the physics body size set in the Player constructor:
    const playerGfx = this.make.graphics({ x: 0, y: 0 });
    playerGfx.fillStyle(0x008080);
    playerGfx.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);  // ← was: 32, 48 (magic numbers)
    playerGfx.generateTexture('player-placeholder', PLAYER_WIDTH, PLAYER_HEIGHT);
    playerGfx.destroy();
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#87CEEB');

    this.platforms = this.physics.add.staticGroup();
    const ground = this.platforms.create(400, 584, 'ground') as Phaser.Physics.Arcade.Image;
    ground.setOrigin(0.5, 0.5);
    ground.refreshBody();

    this.player = new Player(this, 100, 100);   // ← was: this.physics.add.image(100, 100, 'player-placeholder')
    // 'this' = the current scene — Player registers itself with it inside the constructor.

    this.physics.add.collider(this.player, this.platforms);   // ← same, but 'player' not 'playerBody'
  }

  update(_time: number, _delta: number): void {
    // Empty for now — player.update() added in Step 3.
  }
}
```

### SAVE AND TRY

Save both files. Look at the browser.

**You should see:** The teal rectangle falls from (100, 100) and lands on the
ground — identical behavior to LAB-02. The visible result has not changed;
the architecture has.

**In DevTools Console:**

```js
typeof Player
```

**Expected:** `'function'` — the Player class is compiled to a constructor
function at runtime.

**Change something:** In `Player.ts`, change `MOVE_SPEED` from `200` to `500`.
Save. No visible change — the constant is defined but not used yet. TypeScript
compiles without errors. Change it back to `200`. This confirms that unused
constants are not errors.

---

## Step 2 — Add `isOnGround()`

Open `src/Player.ts`. Add the method inside the `Player` class, after the constructor:

```ts
  // isOnGround: returns true when the player's physics body is touching a surface below it.
  // Used in the jump check (LAB-04): only allow jumping when this returns true.
  public isOnGround(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down;
    // body.blocked: an object with four booleans: left, right, up, down.
    // Each is true when the physics body is in contact with another body on that side.
    // body.blocked.down = true: something solid is directly below the player.
    // Phaser sets these flags AFTER the collision pass each frame.
    // Reading them in update() (which runs after physics) is always safe.
  }
```

### SAVE AND TRY

Save `src/Player.ts`. No visual change.

**In DevTools Console:**

Phaser classes are not automatically exposed to the console. To test
`isOnGround()`, temporarily expose the player in `GameScene.create()`:

```ts
// Temporary — add at the bottom of create() in GameScene.ts:
(window as any).player = this.player;   // ← add this line temporarily
```

Save. Then in the DevTools Console:

```js
player.isOnGround()
```

**Expected while standing on ground:** `true`

Click the console after the game loads and wait for the player to land, then run:

```js
player.isOnGround()
```

**Expected:** `true` (player is standing). If you could manually move the player
into the air and run it again, you would see `false`.

Remove the `(window as any).player = this.player` line from `GameScene.ts` after testing.

**Change something:** In `Player.ts`, temporarily change `return body.blocked.down`
to `return body.blocked.up`. Save. In the console: `player.isOnGround()` now
returns `false` (nothing is above the player). Change it back to `body.blocked.down`.

---

## Step 3 — Add the `update()` Stub and Call It from `GameScene`

Open `src/Player.ts`. Add the `update` method after `isOnGround()`:

```ts
  // update: called by GameScene every frame. Player handles its own logic here.
  // 'public' — GameScene calls this. Movement and animation added in LAB-04.
  public update(): void {
    // Placeholder — movement and input handling added in LAB-04.
  }
```

Open `src/scenes/GameScene.ts`. Update `GameScene.update()`:

```ts
  update(_time: number, delta: number): void {
    this.player.update();   // ← add this line (was: empty body)
    // Delegates player logic to the Player class each frame.
    // As Player.update() grows (input, animation, physics), GameScene.update()
    // stays this: one line, clean.
  }
```

### SAVE AND TRY

Save both files. Look at the browser.

**You should see:** Identical to previous steps — teal rectangle falls and lands.
Behavior is unchanged because `Player.update()` is currently empty.

**In DevTools Console:**

Add a temporary log inside `Player.update()` to confirm it is being called:

```ts
// Temporarily in Player.update():
public update(): void {
  console.log('player update running');   // ← temporary
}
```

Save. Open DevTools Console. You should see `player update running` appearing
approximately 60 times per second. Remove the log line.

**Change something:** In `GameScene.update()`, comment out the `this.player.update()`
call. Save. The console log stops (if you have it) — confirming that `GameScene`
drives `Player.update()`. Uncomment it.

---

## 🎯 Challenge: Tint Indicator for `isOnGround()`

**You know:** `isOnGround()` returns `true` when the player touches ground.
Phaser sprites have `this.setTint(hexColor)` which overlays a color on the
sprite, and `this.clearTint()` which removes it.

**Task:** Inside `Player.update()`, check `this.isOnGround()` each frame.
When the player is on the ground, apply a yellow tint: `this.setTint(0xFFFF00)`.
When in the air (not on ground), clear the tint: `this.clearTint()`.

This makes `isOnGround()` visually verifiable before adding jump logic in LAB-04.

**Starting point:**

```ts
public update(): void {
  if (this.isOnGround()) {
    // apply yellow tint
  } else {
    // clear tint
  }
}
```

**Note:** `setTint` and `clearTint` are inherited from `Phaser.Physics.Arcade.Sprite`
(via `Phaser.GameObjects.Sprite`). You do not need to import or declare them —
they are already available on `this`.

---

<details>
<summary>▶ Show Solution</summary>

```ts
public update(): void {
  if (this.isOnGround()) {
    this.setTint(0xFFFF00);   // yellow — player is touching ground
  } else {
    this.clearTint();          // original teal color — player is in the air
  }
}
```

To test it: in `GameScene.create()`, temporarily spawn the player high above the
ground (`new Player(this, 400, 50)`). Watch the browser — the teal rectangle falls
(clearTint — in the air), then lands and turns yellow (setTint — on ground).

**Key insight:** `isOnGround()` reads `body.blocked.down` — a value set by the
physics engine AFTER each collision pass. Phaser's frame order is: physics update
→ collision detection → `blocked` flags set → `scene.update()` → render. By the
time `Player.update()` runs, `blocked.down` already reflects the current frame's
contact state. If you read it before the physics pass (e.g., in an early-running
event listener), you would get last frame's value — a subtle timing bug.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `src/Player.ts` exists | File visible in editor |
| Player renders as teal rectangle | Same visual as LAB-02 — teal falls and lands |
| `Player` class extends `Phaser.Physics.Arcade.Sprite` | Console: `player instanceof Phaser.Physics.Arcade.Sprite` → `true` (after exposing `window.player`) |
| `isOnGround()` returns correct value | Challenge: yellow tint on ground, teal in air |
| `GameScene.update()` calls `player.update()` | Add temp log in `Player.update()` — appears 60× per second in console |
| No TypeScript errors | Editor Problems panel: zero errors |
| Old `playerBody` property removed | `GameScene` uses `this.player`, not `this.playerBody` |

---

## Quick Check Answers

**1. Equivalent private and public members for a Player class?**

Private: `jumpVelocity`, `moveSpeed`, `animState` — internal configuration
and state that nothing outside the Player should read or change. Public:
`x`, `y` (inherited from Phaser.Sprite — read by GameScene to set camera bounds),
`isOnGround()` (read by GameScene for stomp detection), `update(cursors)` (called
by GameScene each frame), `takeDamage()` (called by the collision handler). The
pattern is identical to Tetris V3's `Piece` class: private data that defines how
the object works, public interface that lets other objects interact with it.

**2. What does `extends Phaser.Physics.Arcade.Sprite` give Player?**

Everything on the parent class. Three specific examples: (1) `this.x` and `this.y`
— the sprite's position in the game world, automatically updated by physics;
(2) `this.setVelocityX(speed)` and `this.setVelocityY(speed)` — set the physics
body's velocity, causing movement in the next physics pass; (3) `this.anims` —
the animation controller (used in LAB-06) that plays frame sequences from a
spritesheet. All of these work on `this` inside Player with no extra setup.

**3. (Prediction) Missing `scene.add.existing(this)` — what is missing?**

The player is created in memory and physics applies to it (if `physics.add.existing`
was called), but it is invisible. The scene's display list has no record of it —
the renderer skips it every frame. The physics body moves (gravity pulls it
downward), the position updates, but nothing is drawn. The visual result:
the teal rectangle never appears. Only the ground is visible. Adding
`scene.add.existing(this)` inserts the sprite into the renderer's list and it
becomes visible immediately.

---

*Next: LAB-04 — Keyboard Controls and Jumping. We pass Phaser's `CursorKeys`
object into `Player.update()`, implement left/right movement with instant velocity,
and add a jump that fires an upward velocity impulse — but only when
`isOnGround()` is true.*
