# Mario Platformer — LAB 07 — The Camera

**Prerequisites:** LAB-06 complete. Player animates correctly. Level renders
with real tile art. The world is 1600px wide but the camera stays fixed — the
player walks off the right edge of the screen.

**What this lab adds:**
- Camera follows the player smoothly through the wide level
- Camera bounds stop scrolling at the tilemap edges — no black bars
- A fixed-position text overlay demonstrates screen-space vs world-space

**Time:** 30–45 minutes

---

## What You Will Build

```
Before: player walks off the right side of the 800px screen — camera stays still

After:
  ┌──────────────────────────────┐
  │    camera view (800×240)     │
  │                              │
  │       [Player] →→→→         │  camera shifts right as player moves
  │                              │
  │  ████████████████████████   │
  └──────────────────────────────┘
  ←──────── full world (1600px) ────────→

  At the right edge: camera stops — no blank space shown past the level.
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. If the player is at world x=1200 and the camera viewport is 800px wide,
>    what range of world x does the camera currently show?
> 2. `this.add.text(16, 16, 'Score: 0')` — are those coordinates in world space
>    or screen space?
> 3. *(Prediction)* If camera bounds are set to 1600px wide but the player walks
>    past x=1600, what happens?
>
> *(Answers at the end of this lab)*

---

## Math: World Space vs Screen Space

**What it computes:** Two coordinate systems that describe positions in a game
with a scrolling camera.

**The real-world analogy:** A road map and a car window. The map has absolute
coordinates — every city has a fixed position. Your car window shows only a
portion of the map. As you drive, the window moves over the map. The cities
do not move — only the window does.

**World space** — the absolute position of an object in the full game world.
A coin at world position (900, 100) is always at (900, 100) regardless of
where the camera is looking.

**Screen space** — the position of a pixel on the player's screen. The same
coin at world (900, 100), when the camera has scrolled to `scrollX = 700`,
appears at screen position `900 - 700 = 200` from the left.

**The transform:**

```
screen_x = world_x - camera.scrollX
screen_y = world_y - camera.scrollY
```

**Phaser applies this automatically.** You place objects at world coordinates.
The camera transform converts them to screen coordinates for rendering. You
never adjust object positions to account for scrolling.

**Fixed-to-screen objects:** Some objects should not move with the camera
(HUD text, score display). Two approaches:

```ts
// Option A: setScrollFactor(0) — object ignores camera scroll:
const scoreText = this.add.text(16, 16, 'Score: 0', { ... });
scoreText.setScrollFactor(0);
// Object is positioned at screen (16, 16) regardless of camera scroll.

// Option B: UIScene — a separate scene rendered on top (LAB-12).
// Better for complex HUDs; used in the final lab.
```

**Why it matters here:** If you forgot `setScrollFactor(0)` on a score display,
it would appear at world position (16, 16) — visible only when the camera is
near the left edge of the world. As the camera scrolls right, the text scrolls
off screen to the left.

---

## Concept: `camera.startFollow()` — Making the Camera Track a Sprite

**What it is:** `this.cameras.main.startFollow(target, roundPixels, lerpX, lerpY)`
tells the camera to reposition itself every frame so that `target` stays near
the center of the viewport.

**What it hides:** The scroll calculation each frame:
`camera.scrollX = target.x - camera.width / 2`. Clamping that scroll value
to `camera.getBounds()`. Applying optional lerp (smooth lag). All of this
runs automatically after `startFollow` — you write one call, the camera
follows for the entire scene.

**The protected invariant:** The camera never shows coordinates outside the
bounds set by `camera.setBounds()`. Once bounds are set, `startFollow` cannot
scroll the camera past them — no blank space is ever visible.

**Parameter explanation:**

```ts
this.cameras.main.startFollow(
  this.player,   // target: the game object to track
  true,          // roundPixels: snap camera to integer pixels.
                 // Prevents sub-pixel blurring on pixel-art tiles —
                 // without this, tiles can look fuzzy at non-integer offsets.
  0.1,           // lerpX: horizontal lerp factor (0 = never moves, 1 = instant).
                 // 0.1 means camera moves 10% of the remaining distance each frame.
                 // At 60fps: smooth lag that catches up quickly.
  0.1            // lerpY: same for vertical axis.
);
```

**Term: lerp** — short for linear interpolation. Moving 10% toward a target
each frame produces exponential approach: the camera gets closer and closer
without ever quite stopping, which looks like smooth deceleration.

**Watch for:** `lerpX: 1.0` (or omitting the lerp) causes instant camera
snapping — the player is always centered, which can feel disorienting during
fast movement. `lerpX: 0.05` creates a heavy lag effect — the player walks
far ahead of the camera. `0.1` is a commonly used value for a moderately
responsive follow.

---

## Step 1 — Set Camera Bounds and Start Following

Open `src/scenes/GameScene.ts`. In `create()`, add these two lines at the
very end (after all other setup):

```ts
    // ── Camera ────────────────────────────────────────────────────────────

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // setBounds(x, y, width, height): restricts how far the camera can scroll.
    // 0, 0: the camera cannot scroll left of x=0 or above y=0.
    // map.widthInPixels, map.heightInPixels: cannot scroll right or below the map.
    // 'map' must be accessible here — if create() uses a local 'const map',
    // ensure this line is inside the same create() function body.

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);  // ← add this
    // See concept block above for parameter explanation.
```

Note: `map` is a local variable declared inside `create()`. Both lines above
use it and must remain inside `create()` while `map` is in scope.

### SAVE AND TRY

Save. Walk the player to the right.

**You should see:** The camera follows the player. The level scrolls left as
the player moves right, revealing hidden tile art. At the world's right edge,
the camera stops — no black bars appear.

**In DevTools Console:**

```js
// Expose camera: (window as any).cam = this.cameras.main; in create()
cam.scrollX   // run this while the player is moving right
```

**Expected:** A positive number that increases as the player moves right,
then stops increasing when the camera reaches the right world boundary.

**Change something:** Change `lerpX` and `lerpY` from `0.1` to `1.0`. Save.
The camera snaps instantly to center the player — no lag at all. Move the
player quickly and notice the stiff feel. Change back to `0.1`.

**Experiment — Deadzone:** After the `startFollow` call, temporarily add:
```ts
this.cameras.main.setDeadzone(200, 100);
// 200px wide deadzone: player can move 100px left/right of center before camera follows.
// 100px tall deadzone: same for vertical.
```
Save. Walk the player left and right within the center 200px — the camera does
NOT scroll. Walk past that boundary — the camera catches up. Remove the line
after experimenting. Classic Mario uses a narrow horizontal deadzone; no deadzone
makes the camera feel "glued" to the player.

---

## Step 2 — Add a Fixed Screen-Space Text Object

Add a temporary text label to verify `setScrollFactor(0)` works:

```ts
    // At the end of create(), after startFollow():

    const debugLabel = this.add.text(16, 16, 'World scrolling — I stay fixed', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    debugLabel.setScrollFactor(0);   // ← this line locks it to screen space
    // Without this: text is placed at world (16, 16) and scrolls with the camera.
    // With this: text is at screen (16, 16) — top-left corner — always.
```

### SAVE AND TRY

Save. Walk the player right.

**You should see:** The text "World scrolling — I stay fixed" remains at the
top-left corner of the screen regardless of how far the camera scrolls.

**In DevTools Console:**

No console test needed — the visual behavior is the verification.

**Change something:** Remove `debugLabel.setScrollFactor(0)` temporarily. Save.
Walk the player right — the text scrolls away to the left (it is at world
position 16, 16 which moves off-screen as the camera scrolls right). Restore
the line.

---

## Step 3 — Remove the Debug Label

The debug label will be replaced by a proper HUD in LAB-12. Remove it now
to keep `create()` clean:

```ts
    // Remove these lines from create():
    // const debugLabel = this.add.text(...);
    // debugLabel.setScrollFactor(0);
```

### SAVE AND TRY

Save. The game looks clean — camera follows player, no text overlay.

**You should see:** Smooth camera following, correct world bounds, no text.

---

## 🎯 Challenge: Camera Look-Ahead

**You know:** `this.cameras.main.scrollX` is the world x position the camera's
left edge is currently at. `this.player.body.velocity.x` is the player's current
horizontal speed (positive = right, negative = left).

**Task:** Remove `startFollow` and implement manual camera positioning in
`GameScene.update()`. Each frame, shift the camera's center target slightly
ahead of the player in the direction they are moving. Use a lookahead distance
of 120px, applied smoothly with lerp (10% per frame):

```
targetX = player.x + (velocity.x > 0 ? 120 : velocity.x < 0 ? -120 : 0) - 400
camera.scrollX = camera.scrollX + (targetX - camera.scrollX) * 0.1
```

The player should appear slightly left of center when running right (the camera
leads ahead to reveal what is coming), and slightly right of center when running
left.

**Starting code (replace `startFollow` with this in `create()`):**
```ts
// Remove: this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
// Keep:   this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
```

**Hints:**

1. In `update()`, read `(this.player.body as Phaser.Physics.Arcade.Body).velocity.x`
   to get the current horizontal velocity.
2. Clamp `camera.scrollX` between `0` and `map.widthInPixels - 800` to prevent
   scrolling past world edges (or rely on `setBounds` — it clamps automatically).

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In GameScene — add property:
private map!: Phaser.Tilemaps.Tilemap;   // store map reference for update()

// In create(), save map reference before using it for bounds:
this.map = this.make.tilemap({ key: 'level1' });
// ... rest of tilemap setup unchanged, using this.map instead of map ...
this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
// Remove startFollow — camera is driven manually below.

// In update():
update(_time: number, delta: number): void {
  this.player.update(this.cursors);
  this.enemies.getChildren().forEach(obj => (obj as Enemy).update());

  // ── Manual look-ahead camera ──────────────────────────────────────────
  const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
  const LOOKAHEAD: number = 120;   // pixels to lead ahead of the player
  const HALF_VIEWPORT: number = 400;  // half of 800px viewport width

  // Where we WANT the camera left-edge to be:
  let targetScrollX: number;
  if (playerBody.velocity.x > 10) {
    targetScrollX = this.player.x + LOOKAHEAD - HALF_VIEWPORT;
  } else if (playerBody.velocity.x < -10) {
    targetScrollX = this.player.x - LOOKAHEAD - HALF_VIEWPORT;
  } else {
    targetScrollX = this.player.x - HALF_VIEWPORT;  // centered when still
  }

  // Lerp 10% toward target each frame — smooth catch-up:
  this.cameras.main.scrollX +=
    (targetScrollX - this.cameras.main.scrollX) * 0.1;
  // setBounds clamps scrollX automatically — no manual clamping needed.
}
```

**Key insight:** `startFollow` is a convenience wrapper around exactly this
calculation. Implementing it manually reveals what the camera system is actually
doing every frame — computing a target position and lerping toward it. The
lookahead version biases the target by `LOOKAHEAD` pixels in the movement
direction, revealing more of the world the player is moving toward. Classic
Mario (SNES) used a lookahead of about 80–120 pixels.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Camera follows player | Walk right — level tiles scroll left, revealing more world |
| Smooth lerp visible | Accelerate quickly — camera briefly lags then catches up |
| Right world boundary | Walk to end of level — camera stops before showing black space |
| Left world boundary | Walk to x=0 — camera stops at left edge |
| `setScrollFactor(0)` works | Add debug text with factor 0, walk far right — text stays top-left |

---

## Quick Check Answers

**1. Player at world x=1200 — what world x range does the 800px camera show?**

With `startFollow`, the camera centers on the player: `scrollX = player.x - cameraWidth/2 = 1200 - 400 = 800`. The camera shows world x from 800 to 1600 (800 + 800). If world bounds are set to 1600px wide, the camera is clamped at `scrollX = 800` — the right edge (1600) exactly fills the right side of the viewport. Walking further right: the player moves but `scrollX` stays at 800 (can't scroll past the bound), so the player appears to walk toward the right edge of the screen.

**2. `this.add.text(16, 16, ...)` — world space or screen space?**

World space. All `this.add.*` objects are placed in world coordinates. At
`scrollX = 0`, world (16, 16) = screen (16, 16). At `scrollX = 500`, world
(16, 16) appears at screen `16 - 500 = -484` — off screen to the left. The
text would scroll out of view as the camera moves right. To fix: call
`text.setScrollFactor(0)` to lock it to screen space, or place it in a UIScene
that has no camera scroll (LAB-12).

**3. (Prediction) Player walks past x=1600 with camera bounds set to 1600px?**

The camera stops at `scrollX = 1600 - 800 = 800` — it cannot show beyond the
world boundary. The player continues moving in world space (their x increases
past 1600), but the camera no longer tracks them. The player appears to walk
into the right side of the screen and disappear off the edge. To prevent this,
`setCollideWorldBounds(true)` in the Player constructor already stops the player
at the physics world bounds — which should be set to the same `map.widthInPixels`
as the camera bounds.

---

*Next: LAB-08 — The Enemy Class. We create `class Enemy extends
Phaser.Physics.Arcade.Sprite`, implement left-right patrol behavior,
and handle the two player-enemy contact outcomes: stomping from above
kills the enemy; touching from the side kills the player.*
