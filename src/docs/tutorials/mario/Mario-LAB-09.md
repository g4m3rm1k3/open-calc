# Mario Platformer — LAB 09 — Collectibles and Coins

**Prerequisites:** LAB-08 complete. Enemies patrol and respond to stomps.
Camera follows player. No collectibles exist yet.

**What this lab adds:**
- Coins placed in Tiled via an object layer (not tile layer)
- Coins loaded as a `StaticGroup` in Phaser
- `overlap` detects player-coin contact — coin disappears, score increments
- Score tracked in `GameScene` state and logged to console (HUD in LAB-12)
- Coin spin animation

**Time:** 45–60 minutes

---

## What You Will Build

```
┌─────────────────────────────────┐
│  ○  ○  ○  ○         ○  ○       │ ← coins (yellow circles/sprites)
│                                 │
│         [Player]                │
│                                 │
│  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  │ ← coins on a platform
│█████████████████████████████████│ ← ground
└─────────────────────────────────┘
Collecting a coin: it disappears, Console: "Score: 100"
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. Why use a Tiled object layer for coin positions instead of placing coin
>    tiles in the tile layer?
> 2. A `StaticGroup` is used for coins even though they disappear when collected.
>    Is that the right choice? Why?
> 3. *(Prediction)* If you call `coin.destroy()` inside an overlap callback, can
>    the same coin trigger the callback again on the next frame?
>
> *(Answers at the end of this lab)*

---

## Concept: Tiled Object Layers — Placing Game Entities

**What it is:** An Object Layer in Tiled stores free-form objects (points,
rectangles, ellipses) with arbitrary properties — not tiles. It is used to
mark where game entities (coins, enemies, spawn points, checkpoints) should
appear, without embedding entity data into the tile grid.

**What it hides:** The alternative is hardcoding spawn positions in TypeScript:
`spawnCoin(100, 200); spawnCoin(250, 200); ...` — dozens of function calls that
are hard to visualize and impossible to edit without re-compiling. An object
layer externalizes level data: level designers edit Tiled, export JSON, and
Phaser reads the positions — no code changes needed for level edits.

**The protected invariant:** Object layer data is read-only at runtime. Phaser
reads positions from the JSON and creates game objects, but does not write back
to the layer. Deleting a coin in the game (on collection) does not modify the
Tiled JSON — it modifies the live Phaser StaticGroup.

**In Tiled — creating an object layer:**

1. Layers panel → New Layer → Object Layer → name it `Coins`
2. Select the Coins layer
3. Choose the "Insert Point" tool (P key)
4. Click anywhere in the level to place coin spawn points
5. Each click creates an object with an `x, y` position

**In Phaser — reading the object layer:**

```ts
const coinObjects = map.getObjectLayer('Coins')!.objects;
// Returns: an array of Phaser.Types.Tilemaps.TiledObject
// Each object has: { x, y, name, type, properties }

coinObjects.forEach(obj => {
  const coin = coins.create(obj.x!, obj.y!, 'coin') as Phaser.Physics.Arcade.Image;
  coin.setOrigin(0.5, 1);
  // setOrigin(0.5, 1): Tiled object points use bottom-center as their anchor,
  // so we align Phaser's origin to match — preventing a half-tile vertical offset.
  coin.refreshBody();
});
```

---

## DSA: `StaticGroup` — O(1) Spatial Lookup

**What it is:** A Phaser group of static physics bodies that uses an internal
spatial index for O(1) collision checks — regardless of how many coins exist.

**The problem before:**

Without a group, you would check each coin individually each frame:

```ts
coins.forEach(coin => {
  if (overlaps(player, coin)) collectCoin(coin);
});
// O(n) per frame — 100 coins = 100 overlap checks every frame at 60fps.
```

**What it hides:** The `StaticGroup` hides the spatial partitioning data
structure that makes overlap checks constant time. Phaser internally uses a
broad-phase detection step (checking only objects in the same spatial partition
as the player) before the expensive precise overlap test.

**The protected invariant:** Objects added to a `StaticGroup` before the game
loop starts have their bounds indexed. After that, overlap checks are O(1).
Objects added AFTER the game loop starts require `group.refresh()` to update
the index.

**Watch for:** After calling `coin.destroy()`, the coin is removed from both
the scene and the StaticGroup automatically. No manual cleanup needed. However,
if you check `coin.active` before destroying, be aware it stays `true` until
`destroy()` is called — there is no automatic deactivation on collection.

---

## Step 1 — Add Coin Object Layer in Tiled

Open your Tiled level. In the Layers panel:

1. Add → Object Layer → name it `Coins`
2. Select the Coins layer
3. Use Insert Point (press P) to place coin positions throughout the level
4. Place 15–20 coins in reachable locations: on platforms, above the ground
5. Export → overwrite `public/assets/level1.tmj`

---

## Step 2 — Load a Coin Texture

Open `src/scenes/GameScene.ts`. In `preload()`:

```ts
// Generate a coin texture (yellow circle placeholder):
const coinGfx = this.make.graphics({ x: 0, y: 0 });
coinGfx.fillStyle(0xFFD700);   // gold color (hex: 255, 215, 0)
coinGfx.fillCircle(8, 8, 8);  // circle with radius 8, centered at (8, 8)
coinGfx.generateTexture('coin', 16, 16);  // 16×16 texture
coinGfx.destroy();

// When you have a real coin spritesheet, replace with:
// this.load.spritesheet('coin', 'assets/coin.png', { frameWidth: 16, frameHeight: 16 });
```

### SAVE AND TRY

Save. Look at the browser. No visual change — the texture is generated in
`preload()` but nothing draws it yet.

**In DevTools Console:**

```js
// No visible output. Verify no console errors (red text).
// If Phaser cannot generate the texture, it logs an error here.
```

**Expected:** No red errors. The texture key `'coin'` is now stored in Phaser's
texture cache, ready for use in the next step.

**Change something:** Temporarily change `0xFFD700` (gold) to `0xFF0000` (red).
Save. No visual change yet — the texture is cached but not drawn. This confirms
that `preload()` runs silently. Change back to `0xFFD700`.

---

## Step 3 — Spawn Coins as Gold Circles

Add a `coins` property and spawn coins from the Tiled object layer. Do NOT add
the overlap callback yet — we want to see coins appearing first.

```ts
private coins!: Phaser.Physics.Arcade.StaticGroup;  // ← add property
private score: number = 0;   // ← add score tracker

// In create(), after building the tilemap:

this.coins = this.physics.add.staticGroup();
// StaticGroup for coins: they do not move and we need O(1) overlap detection.

// Read coin positions from the Tiled object layer:
const coinLayer = map.getObjectLayer('Coins');
if (coinLayer) {
  coinLayer.objects.forEach((obj) => {
    // Each obj has x and y set by Tiled — the click position in the editor.
    // obj.x and obj.y are 'number | undefined' — the ! asserts they exist.
    const coin = this.coins.create(obj.x!, obj.y!, 'coin') as Phaser.Physics.Arcade.Image;
    coin.setOrigin(0.5, 1);
    // Origin (0.5, 1): Tiled object points are bottom-center anchored.
    // This aligns Phaser's rendering anchor with Tiled's placement point.
    coin.refreshBody();
    // refreshBody(): synchronizes the physics body bounds after setOrigin.
    // Required for StaticGroup members whose origin has been changed.
  });
}
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** Gold circles appear at every position you clicked in Tiled.
The player passes through them — no collection logic yet. This confirms the
object layer is loading correctly and the texture is applied.

**In DevTools Console:**

```js
// Expose coins: (window as any).coins = this.coins; in create()
coins.getChildren().length
```

**Expected:** The number of points you placed in Tiled (15–20).

**Change something:** In Tiled, move one coin to a different position. Re-export
`level1.tmj`. Refresh the browser (F5 for static file changes). The coin appears
in its new position — confirming the positions come from Tiled data, not hardcoded
TypeScript.

---

## Step 4 — Add Collection Logic

The coins are visible and positioned correctly. Now make them collectible.

Open `src/scenes/GameScene.ts`. After the coin spawn loop, add the overlap:

```ts
// After the coinLayer.objects.forEach(...) block:

// Overlap: player collects coins on contact:
this.physics.add.overlap(
  this.player,
  this.coins,
  this.collectCoin,   // ← method defined below
  undefined,
  this
);
```

Add the `collectCoin` method to `GameScene`:

```ts
private collectCoin(
  _playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  coinObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
): void {
  const coin = coinObj as Phaser.Physics.Arcade.Image;

  coin.destroy();
  // Immediately removes the coin from the scene and StaticGroup.
  // The overlap callback will NOT fire again for this coin because it no longer
  // exists in the group. destroy() is safe to call inside an overlap callback.

  this.score += 100;   // 100 points per coin
  console.log(`Score: ${this.score}`);
  // Temporary — replaced with HUD text in LAB-12.
}
```

### SAVE AND TRY

Save. Walk the player through a coin.

**You should see:** The gold circle disappears on contact. Check DevTools
Console — "Score: 100" appears. Collect more coins — score increments by 100
each time.

**In DevTools Console:**

```js
// After collecting some coins:
// Score: 100
// Score: 200
// Score: 300  (etc.)
```

**Change something:** Change `this.score += 100` to `this.score += 500`. Save.
Each coin is now worth 500 points. Change back to `100`.

---

## Step 5 — Add a Coin Spin Animation (Optional)

If you replace the placeholder circle with a real coin spritesheet:

```ts
// In GameScene.create(), after spawning coins:
this.anims.create({
  key: 'coin-spin',
  frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
  // 6-frame spin cycle on the coin spritesheet
  frameRate: 10,
  repeat: -1,
});

// After coin.refreshBody():
coin.anims.play('coin-spin');
```

### SAVE AND TRY

With a real spritesheet: coins spin. With the placeholder circle: no visible
change (static graphic). The spin animation fires automatically for all coins
because it is started in the spawn loop.

---

## 🎯 Challenge: Coin Counter on Screen (Preview of LAB-12)

**You know:** `this.add.text(x, y, content, style)` creates screen text.
`setScrollFactor(0)` locks it to screen space. `text.setText(newContent)` updates it.

**Task:** Add a score display text in the top-left corner that updates every
time a coin is collected. No separate UIScene yet — just add text directly
to GameScene and use `setScrollFactor(0)`.

```ts
// In create():
private scoreText!: Phaser.GameObjects.Text;

this.scoreText = this.add.text(16, 16, 'Score: 0', {
  fontSize: '20px',
  color: '#ffffff',
  stroke: '#000000',    // black outline — readable on any background
  strokeThickness: 4,
});
this.scoreText.setScrollFactor(0);
```

Then in `collectCoin()`, update the text:

```ts
this.score += 100;
this.scoreText.setText(`Score: ${this.score}`);
```

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In GameScene class body:
private scoreText!: Phaser.GameObjects.Text;
private score: number = 0;

// In create(), after camera setup:
this.scoreText = this.add.text(16, 16, 'Score: 0', {
  fontSize: '20px',
  color: '#FFD700',     // gold — matches coin color
  stroke: '#000000',
  strokeThickness: 4,
});
this.scoreText.setScrollFactor(0);   // lock to screen space

// In collectCoin():
private collectCoin(_playerObj, coinObj): void {
  (coinObj as Phaser.Physics.Arcade.Image).destroy();
  this.score += 100;
  this.scoreText.setText(`Score: ${this.score}`);
}
```

**Key insight:** `setText()` is O(1) — it replaces the text content and
re-renders only the changed text object, not the entire canvas. Phaser does
not re-render the whole scene when one text object changes — it only redraws
game objects that have changed since the last frame (dirty-flag pattern).

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Coins appear at Tiled positions | Gold circles visible where you placed points in Tiled |
| Collection removes coin | Walk through coin — it disappears instantly |
| Score increments | Console shows "Score: 100", "Score: 200", etc. |
| No double-collect | Cannot collect same coin twice (it is destroyed) |
| All coins collectible | Walk through entire level — all coins can be collected |
| Score text updates (challenge) | Gold "Score: N" text in top-left updates in real time |

---

## Quick Check Answers

**1. Why use object layer for coins instead of tile layer?**

A tile layer stores tile indices — only integers, one per grid cell. An object
layer stores free-form entities with arbitrary positions (not snapped to grid),
names, types, and custom properties. Coins benefit from object layer because:
(a) they may be placed between grid cells (fine-tuned positioning), (b) you can
attach properties like `value: 500` for special gold coins vs `value: 100` for
normal coins, and (c) the data is semantically separate from visual tile data —
a coin is not a visual tile, it is a game entity.

**2. Is `StaticGroup` correct for coins that disappear?**

Yes. `StaticGroup` means the coins do not move, not that they are permanent.
The "static" refers to velocity and position — coins stay where they are placed
until collected. On `coin.destroy()`, Phaser removes the body from the
StaticGroup's internal index automatically. The remaining coins are still
efficiently indexed. You would use a dynamic `Group` only if coins needed to
move (e.g., bouncing coins).

**3. (Prediction) Can a destroyed coin trigger the callback again?**

No. `coin.destroy()` removes the coin from the StaticGroup and the physics
world immediately. On the next frame, the overlap system has no record of that
coin — it cannot fire the callback for an object that does not exist. This is
why calling `destroy()` inside an overlap callback is safe. The Phaser overlap
system defers removal to after the callback completes, then updates the group.

---

*Next: LAB-10 — Death, Lives, and Respawn. We formalize the player's life
cycle as a Finite State Machine: Playing → Dying → Respawning → Playing.
Pit falls, enemy side-hits, and hazards all trigger the Dying state. Lives
count down; reaching 0 transitions to Game Over.*
