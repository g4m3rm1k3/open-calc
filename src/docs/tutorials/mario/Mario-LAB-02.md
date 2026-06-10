# Mario Platformer — LAB 02 — Ground and Arcade Physics

**Prerequisites:** LAB-01 complete. You have a Vite + TypeScript + Phaser 3
project with a sky-blue `BootScene` class running in the browser. You understand
`preload`, `create`, and `update`.

**What this lab adds:**
- A `GameScene` class — the scene that will contain all gameplay
- A brown ground platform created as a physics static body
- A teal rectangle that falls from above under gravity and lands on the ground
- Physics debug mode — colored outlines that reveal collision boxes

**Time:** 60 minutes

---

## What You Will Build

```
After Step 4 (ground only):     After Step 6 (with falling rectangle):

┌─────────────────────────┐     ┌─────────────────────────┐
│                         │     │                         │
│      sky blue           │     │    ▓  ← teal rectangle  │
│                         │     │    │  (falling)          │
│                         │     │    ↓                     │
│                         │     │                         │
│  ████████████████████   │     │  ████████████████████   │
│  ground (brown)         │     │  ▓  ← lands here        │
└─────────────────────────┘     └─────────────────────────┘
```

The rectangle falls, hits the ground, and stops. No keyboard input yet.
This confirms the physics engine works before adding any player logic.

---

> **Quick Check — try to answer before reading further:**
>
> 1. Gravity in the config is `y: 600`. What unit is that, and how far does
>    an object fall in the first second from a standing start?
> 2. What is the difference between a physics `collider` and a physics `overlap`?
> 3. *(Prediction)* If you create a rectangle with a dynamic physics body but
>    do NOT add a `collider` between it and the ground, what happens?
>
> *(Answers at the end of this lab)*

---

## Math: Gravity as Constant Acceleration

**What it computes:** Gravity adds the same amount of downward velocity every
second, regardless of how fast the object is already moving. The result is that
speed grows steadily while the object falls — this is called constant acceleration.

**The real-world analogy:** Dropping a ball from a roof. On Earth, gravity
is 9.8 m/s². After the first second the ball moves at 9.8 m/s. After the
second, 19.6 m/s. After the third, 29.4 m/s. The speed increase is constant
(9.8 m/s each second) even though the speed itself keeps growing.

**The kinematics formula:**

```
velocity at time t:
  v = v₀ + a × t
  (starting velocity + acceleration × elapsed seconds)

distance fallen after time t:
  d = v₀ × t + ½ × a × t²
  (initial velocity × time + half × acceleration × time squared)

With v₀ = 0 (starting from rest) and a = 600 (Phaser gravity):
  after 1 second: v = 600 px/s,    d = ½ × 600 × 1² = 300 pixels fallen
  after 0.5s:     v = 300 px/s,    d = ½ × 600 × 0.25 = 75 pixels fallen
```

**Why 600 and not 9.8?** Phaser uses pixels, not meters. "600 px/s²" has no
physical meaning — it is tuned to feel like a platformer. Real-world gravity
(9.8 m/s²) would make objects fall far too slowly across a 600px screen.

**How Phaser applies it each frame:**

```
new_velocity_y = current_velocity_y + (600 × delta_seconds)
new_y          = current_y          + (new_velocity_y × delta_seconds)
```

This runs every frame (~60 times per second). The small per-frame additions
accumulate into smooth, accelerating motion.

**Watch for:** Every physics body has gravity applied by default. To make an
object ignore gravity (e.g., a floating coin), call
`body.setAllowGravity(false)` on that specific body. Gravity is opt-out,
not opt-in.

---

## Concept: `Phaser.Physics.Arcade.StaticGroup` — A Collection of Unmoving Bodies

**What it is:** A group of physics bodies that never move. They collide with
dynamic bodies (things that do move) but have zero velocity themselves. They
are cheaper to compute than dynamic bodies because their positions never need
to be recalculated.

**What it hides:** Phaser internally builds a spatial index over all static
bodies in the group when the group is first used in a collider. This index
lets collision detection skip objects that are far away from the dynamic body
being tested — without it, every dynamic body would have to be tested against
every static body every frame.

**The protected invariant:** Static bodies do not move. If you call
`create()` on a `StaticGroup` after the game loop has started, you must call
`group.refresh()` to rebuild the spatial index — otherwise the new body has
no collision. Bodies added during `create()` (before the loop starts) are
indexed automatically.

**Term: dynamic body** — A physics body that can move. Gravity applies to it.
You can set its velocity. The player, enemies, and projectiles are dynamic bodies.

**Term: static body** — A physics body that never moves. Gravity does not
apply to it. It blocks dynamic bodies from passing through. Ground, walls,
and platforms are static bodies.

**The two kinds of physics interactions:**

```
collider(A, B):  A and B cannot occupy the same space.
                 When A touches B, they push each other apart (or stop).
                 Used for: player standing on ground, player blocked by wall.

overlap(A, B, callback):  Detects when A and B touch but does NOT
                 push them apart — A passes through B.
                 The callback fires when they overlap.
                 Used for: collecting coins, entering a door zone.
```

**Watch for:** A body must be part of the collider or overlap call to
participate in that interaction. Creating a static group and a dynamic sprite
without calling `this.physics.add.collider(sprite, group)` means they will
pass through each other — the physics bodies exist, but no interaction
between them is registered.

---

## Step 1 — Create `GameScene`

Create `src/scenes/GameScene.ts`:

```ts
// src/scenes/GameScene.ts

export class GameScene extends Phaser.Scene {

  constructor() {
    super({ key: 'Game' });
    // key: 'Game' — the name used to start this scene: this.scene.start('Game').
  }

  preload(): void {
    // No real image assets yet — this lab uses generated colored rectangles.
    // Real tile images are loaded here in LAB-05.
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#87CEEB');
    // Each scene sets its own background color in create().
  }

  update(_time: number, _delta: number): void {
    // Empty for now — player movement is added in LAB-03.
  }
}
```

### SAVE AND TRY

Save `src/scenes/GameScene.ts`. No visual change yet — the file exists but
is not registered with `Phaser.Game`.

**In DevTools Console:**

```js
typeof GameScene
```

**Expected:** `'undefined'` — `GameScene` is not imported in `main.ts` yet,
so the browser does not know about it. We wire it in the next step.

**Change something:** Temporarily add `console.log('GameScene loaded')` at the
top of the file (outside the class). Save. Nothing appears in the console —
the file is not imported yet, so its code never runs. Remove the log line.

---

## Step 2 — Register `GameScene` in `main.ts`

Open `src/main.ts`. Add the import and update the scene array:

```ts
import './style.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';   // ← add this line

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene, BootScene],   // ← was: [BootScene] — GameScene first so it starts
});
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** Identical to LAB-01 — the sky-blue canvas. `GameScene`
is now running (not `BootScene`), but both produce a sky-blue background so
the visual is the same.

**In DevTools Console:**

```js
typeof GameScene
```

**Expected:** `'function'` — the import now works; the class is defined.

**Change something:** In `GameScene.create()`, change the background to
`'#FF0000'` (red). Save. Canvas turns red — confirming `GameScene.create()`
is the active scene. Change it back to `'#87CEEB'`.

---

## Concept: `Phaser.GameObjects.Graphics` — Drawing Shapes as Textures

**What it is:** A `Graphics` object lets you draw shapes (rectangles, circles,
lines) using code, then convert the result into a reusable texture image.

**The problem:** Phaser sprites require a texture (a named image). We do not
have any image files yet. `Graphics` lets us generate placeholder textures
in code — a brown rectangle becomes the "ground" texture, a teal rectangle
becomes the "player" texture — without needing any external image files.

**The two Graphics creation methods:**

```ts
this.add.graphics()    // Creates a Graphics object AND adds it to the scene.
                       // It renders as a visible object each frame.

this.make.graphics({ x: 0, y: 0 })
                       // Creates a Graphics object WITHOUT adding it to the scene.
                       // Used only to generate a texture, then destroyed.
                       // The texture persists; the Graphics object does not.
```

**The texture generation flow:**

```ts
const gfx = this.make.graphics({ x: 0, y: 0 });
// Step 1: set the fill color.
// 0x8B4513: Phaser's hex color format — 0x + RRGGBB (no '#').
// 0x8B4513 = R:0x8B (139), G:0x45 (69), B:0x13 (19) = dark brown.
gfx.fillStyle(0x8B4513);

// Step 2: describe the shape.
// fillRect(x, y, width, height) — x,y is local to the Graphics object.
gfx.fillRect(0, 0, 800, 32);

// Step 3: bake into a texture with a unique string key.
gfx.generateTexture('ground', 800, 32);

// Step 4: destroy the Graphics object — only the texture is needed.
gfx.destroy();
// 'ground' texture now lives in Phaser's texture cache.
// Any sprite can use it with: this.add.sprite(x, y, 'ground').
```

**Watch for:** `generateTexture(key, width, height)` — the key must be unique.
If you call it twice with the same key, the second call silently overwrites the
first. Name keys descriptively: `'ground'`, `'player-placeholder'`, not `'texture1'`.

---

## Step 3 — Generate the Ground Texture in `GameScene.preload()`

Open `src/scenes/GameScene.ts`. Add texture generation in `preload()`:

```ts
  preload(): void {
    // Generate a brown ground texture — 800px wide, 32px tall.
    // Done in preload() so the texture is ready before create() runs.
    const groundGfx = this.make.graphics({ x: 0, y: 0 });  // ← add this block
    groundGfx.fillStyle(0x8B4513);           // dark brown
    groundGfx.fillRect(0, 0, 800, 32);       // full-width rectangle, 32px tall
    groundGfx.generateTexture('ground', 800, 32);
    groundGfx.destroy();                     // texture saved; Graphics object removed
  }
```

### SAVE AND TRY

Save. No visual change — the texture exists in memory but is not drawn yet.

**In DevTools Console:**

```js
// Phaser stores textures in a cache accessible from the game object.
// We cannot easily inspect it from the console at this stage.
// Verification happens in the next step when we draw the ground.
```

**Change something:** Temporarily change `0x8B4513` to `0x228B22` (forest
green). Save. No visual change — the texture is generated but not drawn. This
shows that `preload()` runs silently; only `create()` produces visible output.
Change back to `0x8B4513`.

---

## Concept: `setOrigin` — The Sprite's Anchor Point

**What it is:** `setOrigin(x, y)` defines which point of a sprite its
`(x, y)` position refers to. Both values are fractions from 0 to 1.

**Canonical example:**

```
setOrigin(0.5, 0.5) — center (Phaser default):
    ┌──────────┐
    │    ·     │   · = the position (x, y) refers to this point
    └──────────┘

setOrigin(0, 0) — top-left:
    ·──────────┐
    │          │   · = the position (x, y) refers to this point
    └──────────┘

setOrigin(0.5, 1) — bottom-center:
    ┌──────────┐
    │          │
    └────·─────┘   · = the position (x, y) refers to this point
```

**Why the default is center (0.5, 0.5):** Centering makes rotation and
scaling work intuitively — a sprite rotates around its center, not its
corner. It also makes positioning by center easier: "put the sprite at
position (400, 584)" means the center of the sprite is at (400, 584).

**Project Application (The "Why" here):**

The ground is 32px tall. We position it at `y = 584`. With `setOrigin(0.5, 0.5)`:
- Top of ground: `584 - 16 = 568`
- Bottom of ground: `584 + 16 = 600` (the canvas bottom edge)

If we used `setOrigin(0, 0)` (top-left), the same `y = 584` would place
the top at 584 and the bottom at 616 — 16px outside the canvas.

**Watch for:** After calling `setOrigin` on a static physics body, you must
call `refreshBody()`. The physics collision box is a separate rectangle from
the visual sprite. `refreshBody()` syncs the box to the new origin position.
Forgetting this causes the collision box to be offset from the visible sprite
— the player appears to hover above the ground or fall through it.

---

## Step 4 — Create the Ground Platform

Open `src/scenes/GameScene.ts`. Add the `platforms` property and ground creation:

```ts
export class GameScene extends Phaser.Scene {

  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  // '!': definite assignment assertion — TypeScript is told that this property
  // will be assigned in create() before update() ever runs, even though it is
  // not assigned in the constructor. Without '!', TypeScript errors: "Property
  // 'platforms' has no initializer and is not definitely assigned in the constructor."

  constructor() {
    super({ key: 'Game' });
  }

  preload(): void {
    const groundGfx = this.make.graphics({ x: 0, y: 0 });
    groundGfx.fillStyle(0x8B4513);
    groundGfx.fillRect(0, 0, 800, 32);
    groundGfx.generateTexture('ground', 800, 32);
    groundGfx.destroy();
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Create an empty StaticGroup — members added next:
    this.platforms = this.physics.add.staticGroup();  // ← add this

    // Add the ground as a static physics image inside the group:
    const ground = this.platforms.create(400, 584, 'ground') as Phaser.Physics.Arcade.Image;
    // create(x, y, textureKey): places a static physics body at (x, y)
    // using the named texture. Returns a Phaser.Physics.Arcade.Image.
    // x = 400: horizontal center (800 / 2).
    // y = 584: vertical center of the ground bar (600 - 16 = 584).

    ground.setOrigin(0.5, 0.5);  // ← add this
    // Center-aligned (Phaser default, but stated explicitly for clarity).

    ground.refreshBody();         // ← add this
    // Syncs the physics collision box with the sprite's current origin and position.
    // Required after setOrigin on a static body — without it, the collision box
    // stays at its default position and the ground cannot be stood on.
  }

  update(_time: number, _delta: number): void {}
}
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** A brown horizontal bar spanning the full width at the bottom
of the canvas. The sky-blue background fills the rest.

**In DevTools Console:**

```js
// We cannot directly inspect the physics body from here.
// Visual confirmation — the brown bar IS the ground. Physics verified in Step 5.
```

**Change something:** Change the `y` position from `584` to `300`. Save. The
ground bar moves to the vertical center of the canvas. Change it back to `584`.

---

## Step 5 — Enable Physics Debug to See Collision Boxes

Open `src/main.ts`. Add the `physics` block to the game config:

```ts
new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {                     // ← add this block
    default: 'arcade',
    // 'arcade': Phaser's built-in physics engine. Uses axis-aligned bounding
    // boxes (rectangles) for all collision detection. Fast and sufficient for
    // a Mario-style platformer.
    // The alternative 'matter' supports polygon/circle shapes but is slower
    // and more complex. We use 'arcade' for this entire series.
    arcade: {
      gravity: { x: 0, y: 600 },
      // gravity: constant acceleration applied to all dynamic bodies every frame.
      // x: 0 — no horizontal gravity (objects do not drift sideways).
      // y: 600 — 600 px/s² downward. See the Math block at the top of this lab.
      debug: true,
      // debug: true — draws colored outlines around every physics body.
      // Green outline = static body. Blue/red outline = dynamic body.
      // Use this to verify collision boxes match sprites. Turn off when not debugging.
    },
  },                             // ← end of physics block
  scene: [GameScene, BootScene],
});
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** The brown ground bar with a **bright green rectangle outline**
drawn around it. That green outline is the physics collision box. Any dynamic body
that enters this box will be stopped.

**In DevTools Console:**

```js
// The green outline is the verification — if you see it, the static body
// is registered and indexed in the physics world.
```

**Change something:** Move the ground `y` to `500`. Save. The brown bar moves
up — and the green outline moves with it, perfectly aligned. This confirms
`refreshBody()` is working. Move it back to `584`.

---

## Concept: The Definite Assignment Assertion `!`

**What it is:** The `!` suffix on a TypeScript property declaration tells the
compiler: "I know this looks uninitialized, but I guarantee it will be assigned
before it is read. Do not warn me."

**The problem before:**

```ts
class GameScene extends Phaser.Scene {
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  // TypeScript error: "Property 'platforms' has no initializer and is not
  // definitely assigned in the constructor."
  // TypeScript cannot see that create() always runs before update().
}
```

TypeScript is right to warn — if `platforms` were read before `create()` runs,
it would be `undefined`. But Phaser guarantees `create()` runs before `update()`.

**The solution:**

```ts
private platforms!: Phaser.Physics.Arcade.StaticGroup;
// '!': "I am asserting this will be assigned. Do not error."
```

**Watch for:** `!` is a promise to TypeScript, not a runtime guarantee. If you
read `this.platforms` before `create()` runs (e.g., in the constructor), it
IS undefined — TypeScript will not warn you, but the code will crash. Only use
`!` when you are certain the property will be assigned in `create()` before any
other method reads it.

---

## Step 6 — Add the Falling Rectangle

Open `src/scenes/GameScene.ts`. Add a player placeholder property and create it:

```ts
export class GameScene extends Phaser.Scene {

  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private playerBody!: Phaser.Physics.Arcade.Image;   // ← add property

  // ...constructor unchanged...

  preload(): void {
    const groundGfx = this.make.graphics({ x: 0, y: 0 });
    groundGfx.fillStyle(0x8B4513);
    groundGfx.fillRect(0, 0, 800, 32);
    groundGfx.generateTexture('ground', 800, 32);
    groundGfx.destroy();

    // Generate a teal player-placeholder texture — 32×48px (humanoid proportions):
    const playerGfx = this.make.graphics({ x: 0, y: 0 });  // ← add this block
    playerGfx.fillStyle(0x008080);    // teal: R=0, G=128, B=128
    playerGfx.fillRect(0, 0, 32, 48);
    playerGfx.generateTexture('player-placeholder', 32, 48);
    playerGfx.destroy();
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#87CEEB');

    this.platforms = this.physics.add.staticGroup();
    const ground = this.platforms.create(400, 584, 'ground') as Phaser.Physics.Arcade.Image;
    ground.setOrigin(0.5, 0.5);
    ground.refreshBody();

    // Create a dynamic physics image — gravity and velocity apply to it:
    this.playerBody = this.physics.add.image(100, 100, 'player-placeholder');  // ← add this
    // physics.add.image(x, y, textureKey): creates a sprite WITH a physics body.
    // (this.add.image would create a visual-only sprite with NO physics.)
    // x=100, y=100: near top-left — enough room to fall before hitting the ground.

    // Register collision between the player body and the ground:
    this.physics.add.collider(this.playerBody, this.platforms);  // ← add this
    // collider(A, B): prevents A and B from overlapping.
    // When playerBody reaches the ground, physics stops its downward movement.
    // Without this call: playerBody falls through the ground as if it is not there.
  }

  update(_time: number, _delta: number): void {}
}
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** A teal rectangle appears near the top-left and falls
downward. It accelerates as it falls (gravity is building speed). When it
reaches the brown ground, it stops cleanly on top of it.

**In DevTools Console:**

```js
// The teal rectangle stopping on the ground IS the physics verification.
// The collider is working if the rectangle stops — if it falls through, the
// collider call is missing or refreshBody() was not called on the ground.
```

**Change something:** Change `gravity: { y: 600 }` to `gravity: { y: 100 }`.
Save. The rectangle falls visibly more slowly — the lower acceleration takes
longer to build speed. Change it back to `y: 600` and observe how much faster
the fall feels — `600` is the tuned value for Mario-style game feel.

---

## Step 7 — Turn Off Debug Mode

Open `src/main.ts`. Change `debug: true` back to `debug: false`:

```ts
      debug: false,   // ← was: true (turn off after confirming collision boxes)
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** The teal rectangle falls and lands on the ground — same
behavior as Step 6, but the green debug outlines are gone. The game looks clean.

**Change something:** Turn debug back on (`true`), drag a window corner to
confirm the green boxes appear, then turn it off again. Remembering how to
toggle this will save debugging time in later labs.

---

## 🎯 Challenge: Second Platform

**You know:** `this.platforms.create(x, y, textureKey)` adds a new static
physics body to the group. The `collider` call already covers ALL members
of the group — no second `collider` call is needed.

**Task:** Add a second, smaller floating platform. Generate a new texture
for it in `preload()` (200px wide, 20px tall, lighter brown `0xA0522D`).
Then add a `this.platforms.create(...)` call in `create()` to place it at
position `(400, 350)`. Move the player start position to `(400, 200)` so
it lands on the floating platform instead of the ground.

**Starting point:**

```ts
// In preload(), after the ground texture:
const platformGfx = this.make.graphics({ x: 0, y: 0 });
// ... your texture generation here ...

// In create(), after the ground:
const floatingPlatform = this.platforms.create(400, 350, ???) as Phaser.Physics.Arcade.Image;
floatingPlatform.setOrigin(0.5, 0.5);
floatingPlatform.refreshBody();  // required — do not forget this
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In preload():
const platformGfx = this.make.graphics({ x: 0, y: 0 });
platformGfx.fillStyle(0xA0522D);         // lighter brown
platformGfx.fillRect(0, 0, 200, 20);     // 200×20 — smaller than the ground
platformGfx.generateTexture('platform', 200, 20);
platformGfx.destroy();

// In create(), after the ground setup:
const floatingPlatform = this.platforms.create(400, 350, 'platform') as Phaser.Physics.Arcade.Image;
floatingPlatform.setOrigin(0.5, 0.5);
floatingPlatform.refreshBody();   // sync physics box with new origin

// Move player start position to above the floating platform:
this.playerBody = this.physics.add.image(400, 200, 'player-placeholder');

// The existing collider covers both platforms:
this.physics.add.collider(this.playerBody, this.platforms);
```

**Key insight:** `StaticGroup` is a collection. One `this.physics.add.collider(player, platforms)`
call handles every member of `platforms` — current and future. When you add
the floating platform to the same group, it automatically participates in the
same collision without any additional code. This is the group abstraction's
value: you reason about "platforms" as a concept, not about each individual
platform separately.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Ground renders | Brown bar visible at bottom of canvas |
| Teal rectangle falls | Appears at (100, 100) and descends visibly |
| Gravity accelerates the fall | Rectangle moves faster as it falls (not constant speed) |
| Rectangle stops on ground | Does not pass through — lands cleanly on top |
| Debug outlines work | Set `debug: true` — green box visible around ground; set back to `false` |
| `refreshBody()` is needed | Omit it, save — verify collision box misaligns (player hovers or falls through) |

---

## Quick Check Answers

**1. What unit is `gravity: { y: 600 }`, and how far does something fall in one second?**

Pixels per second squared (px/s²). Starting from rest (v₀ = 0), after one
second: velocity = 600 px/s downward; distance fallen = ½ × 600 × 1² = 300 pixels.
The value 600 is chosen by game-feel, not physics accuracy. Real gravity (9.8 m/s²)
would require defining a pixels-per-meter scale — unnecessary for a platformer
where "feels right" matters more than physical accuracy.

**2. Difference between `collider` and `overlap`?**

A `collider` physically prevents two bodies from occupying the same space — when
they touch, Phaser pushes them apart (the player stops at the ground surface).
An `overlap` detects that two bodies are touching but takes no physical action —
both objects continue moving as if the other is not there. The overlap fires a
callback so you can respond in code (collect a coin, trigger a door). Use
`collider` for solid surfaces; use `overlap` for trigger zones and collectibles.

**3. (Prediction) What happens without the collider?**

The teal rectangle falls straight through the brown ground as if it does not
exist. Physics bodies do not interact unless a `collider` or `overlap` is
explicitly registered between them. This is intentional — you choose which
objects affect each other. Enemies might not collide with each other (they can
walk through each other) but do collide with the ground. The ground has a
physics body, but no interaction occurs until you call `this.physics.add.collider(...)`.

---

*Next: LAB-03 — The Player Class. We create `class Player extends
Phaser.Physics.Arcade.Sprite`, replacing the raw `Phaser.Physics.Arcade.Image`
placeholder. The Player class owns its own physics body, appearance, and — soon
— its own behavior. We explain why `scene.add.existing()` and
`scene.physics.add.existing()` are required for custom sprite subclasses.*
