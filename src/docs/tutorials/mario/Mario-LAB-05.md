# Mario Platformer — LAB 05 — Tilemaps: Building the World

**Prerequisites:** LAB-04 complete. Player moves and jumps on a brown
rectangle floor. The floor and player are both placeholder colored textures.

**What this lab adds:**
- Free Kenney platformer tile art loaded from a PNG file
- A level designed in Tiled Map Editor and exported as a JSON file
- The brown rectangle floor replaced by real ground tiles
- Collision registered on the Ground layer so the player stands on real tiles
- The world is now wider than the 800px viewport — camera scroll in LAB-07

**Time:** 75–90 minutes (includes Tiled editor setup)

---

## What You Will Build

```
Before:                         After:

┌──────────────────┐            ┌──────────────────────────────────────────┐
│  sky blue        │            │  ☁  ☁       ☁          ☁   ☁            │
│                  │            │                                           │
│  [teal rect]     │            │  [teal player rect]                      │
│                  │            │                                           │
│██████████████████│            │  ═══════════════  ← floating platform    │
│ brown rectangle  │            │                                           │
└──────────────────┘            │##################################         │
                                │ real ground tiles                         │
                                └──────────────────────────────────────────┘
```

The player still uses a placeholder teal rectangle — real character art is
added in LAB-06. Everything else is real tile art from the Kenney pack.

---

> **Quick Check — try to answer before reading further:**
>
> 1. A tilemap stores integer indices, not pixel positions. If each tile is
>    16×16 pixels and a tile is at grid position (col=5, row=3), what are its
>    pixel coordinates?
> 2. What is the difference between the tileset image (PNG) and the tilemap
>    JSON? What does each file contain?
> 3. *(Prediction)* If you call `setCollisionByExclusion([-1])` on a layer
>    that contains both ground tiles and decorative cloud tiles, what happens
>    when the player jumps into a cloud?
>
> *(Answers at the end of this lab)*

---

## Concept: Tilemap — A Grid of Integer Indices

**What it is:** A tilemap is a 2D grid of integers. Each integer is a tile
index that references a specific sub-image inside a tileset image. Phaser
reads the grid and draws the matching sub-image at each grid position.

**What it hides:** Without tilemaps, a 200-tile-wide level would require 200
individual sprite objects per row — 3000+ sprites for a 15-row level. Each
sprite would need its own physics body. Phaser's tilemap layer renders the
entire grid in a single draw call and batch-processes collision with the physics
engine in O(1) time (only tiles near the physics body are tested).

**The protected invariant:** A tilemap layer's tile data is read once at load
time and cached. Tiles do not move. A tile marked collidable stays collidable
for the lifetime of the layer without ongoing cost.

**Terms defined before use:**

- **Tileset** — the PNG image file that contains all tile sub-images, arranged
  in a regular grid. Example: a 192×192 PNG with 16×16 tiles = 144 individual
  tile images (12 × 12 grid).
- **Tile index** — the integer stored at each position in the tilemap. Index 0
  in Phaser means "empty" (no tile). Index 1 = first tile in the tileset image,
  reading left-to-right, top-to-bottom.
- **Tilemap JSON** — the file exported by Tiled. Contains the grid of tile
  indices, the names of all layers, and references to which tileset PNG file
  to use. Phaser reads this JSON to reconstruct the level.
- **Layer** — a named 2D grid within a tilemap. A level usually has at least
  two: a **Ground** layer (collidable tiles) and a **Decoration** layer
  (visual-only background tiles like clouds and vines).
- **TMJ** — the Tiled Map JSON file format. The file extension is `.tmj`.
  Phaser's `load.tilemapTiledJSON()` reads TMJ files directly.

**Canonical example:**

```
Tileset image (64×16 px, 4 tiles of 16×16):
  [Tile 1: dirt] [Tile 2: grass-top] [Tile 3: cloud] [Tile 4: brick]

Tilemap grid (4 columns × 3 rows):
  Row 0: [0, 0, 3, 0]      → empty, empty, cloud, empty
  Row 1: [0, 0, 0, 0]      → all empty
  Row 2: [1, 2, 2, 1]      → dirt, grass, grass, dirt

Phaser draws: cloud at (2,0), grass at (1,2) and (2,2), dirt at (0,2) and (3,2)
```

**Watch for:** Tiled exports tile indices starting at 1 (tile ID 1 = first tile
in the set). Phaser internally subtracts 1 when indexing into the tileset image.
Index 0 in Phaser always means "empty." If you read raw tile data from Phaser
and compare to Tiled's display — they differ by 1.

---

## Math: Tile Position to Pixel Position

**What it computes:** The pixel coordinate of a tile's top-left corner, given
its column and row in the tilemap grid.

**The real-world analogy:** Graph paper. Each square has a grid address (column,
row). To find the physical location of square (5, 3) on paper where each square
is 16mm: `x = 5 × 16 = 80mm`, `y = 3 × 16 = 48mm`.

**Formula:**

```
pixel_x = tile_col × TILE_SIZE
pixel_y = tile_row × TILE_SIZE

For TILE_SIZE = 16:
  Tile at (col=5, row=3) → top-left pixel at (80, 48)
  Tile at (col=0, row=0) → top-left pixel at (0, 0)   (map top-left corner)
  Tile at (col=12, row=14) → top-left pixel at (192, 224)
```

**Inverse (pixel to tile):**

```
tile_col = Math.floor(pixel_x / TILE_SIZE)
tile_row = Math.floor(pixel_y / TILE_SIZE)
```

**Why it matters here:** When we spawn the player at a tile position in the
level, we convert: `spawnX = 2 * TILE_SIZE`, `spawnY = 10 * TILE_SIZE`.
This places the player at the exact pixel position of grid cell (2, 10).

**Watch for:** Tiles use top-left as their origin (Phaser renders tile layers
from top-left). Sprites use center origin by default. The player spawned at
tile (2, 10) should be at pixel `(2 × 16, 10 × 16) = (32, 160)` — but because
the player's origin is center, the player's feet will be at `160 + PLAYER_HEIGHT/2`.
When precision matters (spawn exactly ON the ground), compute the spawn position
one tile ABOVE the ground row.

---

## Step 1 — Download the Kenney Platformer Assets

1. Open: `https://kenney.nl/assets/platformer-pack-redux`
2. Click Download → a ZIP file downloads
3. Extract the ZIP
4. Inside the extracted folder, locate the `Spritesheet/` directory
5. Copy these two files into your project's `public/assets/` folder
   (create `public/assets/` if it does not exist):
   - `spritesheet_ground.png` — the tile image grid
   - `spritesheet_ground.xml` — the atlas descriptor (maps tile names to pixel regions)

If the URL changes, search "kenney platformer pack redux" — all Kenney assets
are permanently free and public domain.

### SAVE AND TRY

Verify the asset is reachable by the browser:

Open `http://localhost:5173/assets/spritesheet_ground.png` in the browser.

**You should see:** The tileset image — a grid of colored platform tiles on a
transparent or white background.

**If you see a 404 error:** The file is in the wrong folder. It must be directly
inside `public/assets/`, not in a subfolder. `public/` is Vite's static file
root — files there are served at `/`.

**Change something:** Temporarily rename the file to `spritesheet_ground2.png`
and load `http://localhost:5173/assets/spritesheet_ground2.png`. It still loads —
the URL matches the filename. Rename it back to `spritesheet_ground.png`.

---

## Step 2 — Install Tiled Map Editor

Tiled is a free, open-source level design tool.

1. Go to `https://www.mapeditor.org/`
2. Click Download → download the version for your OS (Windows, Mac, Linux)
3. Install and open Tiled

**What Tiled is:** A visual editor for tilemap files. You paint tiles from the
tileset PNG onto a grid. Tiled exports the result as a JSON file that Phaser reads.

**What Tiled does NOT do:** It does not run your game or test physics. It only
produces the data file that describes where tiles are placed.

### CSS AND SEE (Tiled equivalent — describe what you see)

After opening Tiled, you should see an empty editor with panels:
- **Map** panel: the tile grid you paint on (currently empty)
- **Tilesets** panel (bottom): where the PNG tileset appears after import
- **Layers** panel (top-right): lists the layers in the current map

---

## Step 3 — Create the Level in Tiled

### 3a. Create a new map

File → New Map

Settings:
- **Orientation:** Orthogonal
- **Tile layer format:** CSV
- **Tile render order:** Right Down
- **Map size:** Fixed — Width: **100 tiles**, Height: **15 tiles**
- **Tile size:** Width: **16 px**, Height: **16 px**

Click OK. This creates a 100×15 grid (1600px × 240px) — wider than the camera.

### CSS AND SEE

You should see: An empty grid — 100 columns × 15 rows of empty cells.

### 3b. Import the tileset

In the **Tilesets** panel (bottom): click **New Tileset**

- Name: `spritesheet_ground`
- Source: browse to your `spritesheet_ground.png` file
- Tile Width: **16**, Tile Height: **16**, Margin: **0**, Spacing: **0**

Click OK. Tiles appear in the Tilesets panel.

### CSS AND SEE

The Tilesets panel now shows the tile grid from the PNG. Click any tile to
select it — the selected tile highlights.

### 3c. Create two layers

In the **Layers** panel (top-right):

1. Click the + button → **Tile Layer** → name it `Decoration`
2. Click + again → **Tile Layer** → name it `Ground`

**Order matters:** Layers render bottom-to-top. Put `Decoration` below `Ground`
in the panel — sky tiles render behind ground tiles.

### 3d. Paint the Ground layer

Select the **Ground** layer in the Layers panel.
Select a solid ground tile from the Tilesets panel.
Paint the entire bottom row (row 14, index 0–99) with ground tiles.
Paint a floating platform: rows 8–9, columns 20–30.

### 3e. Paint the Decoration layer

Select the **Decoration** layer.
Select cloud or sky tiles.
Paint some clouds in the upper rows (rows 0–3).

### 3f. Export

File → Export As → navigate to `public/assets/` → save as `level1.tmj`

**TMJ** format: Tiled's JSON output. Phaser reads `.tmj` files with
`load.tilemapTiledJSON()`.

### SAVE AND TRY

Open `http://localhost:5173/assets/level1.tmj` in the browser.

**You should see:** Raw JSON text. Find the `"layers"` array — it should
contain two objects with `"name": "Decoration"` and `"name": "Ground"`.
Find the `"tilesets"` array — it should reference `"spritesheet_ground"`.

If the JSON is missing layers or shows different names — the layer names in
Tiled must match exactly (case-sensitive) what Phaser will look for in Step 5.

---

## Step 4 — Load Assets in `GameScene.preload()`

Open `src/scenes/GameScene.ts`. Replace the texture generation in `preload()`
with real asset loads:

```ts
  preload(): void {
    // Load the tileset image — a spritesheet where each frame is one tile:
    this.load.spritesheet('tiles', 'assets/spritesheet_ground.png', {  // ← replace ground/player texture generation
      frameWidth: 16,     // each tile is 16 pixels wide
      frameHeight: 16,    // each tile is 16 pixels tall
    });
    // 'tiles': the key used to reference this spritesheet later.
    // 'assets/spritesheet_ground.png': path relative to the public/ folder.
    // frameWidth/frameHeight: Phaser divides the PNG into 16×16 sub-images.

    // Load the tilemap JSON exported from Tiled:
    this.load.tilemapTiledJSON('level1', 'assets/level1.tmj');  // ← add this
    // 'level1': the key used to create the tilemap in create().
    // 'assets/level1.tmj': the JSON file Tiled exported.

    // Keep the player placeholder texture — real sprite added in LAB-06:
    const playerGfx = this.make.graphics({ x: 0, y: 0 });  // ← keep this block
    playerGfx.fillStyle(0x008080);
    playerGfx.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    playerGfx.generateTexture('player-placeholder', PLAYER_WIDTH, PLAYER_HEIGHT);
    playerGfx.destroy();
  }
```

### SAVE AND TRY

Save. Look at the browser. The game should still show a sky-blue canvas.

**In DevTools Console:**

```js
// Phaser logs asset load errors to the console.
// Look for any red error messages mentioning the PNG or TMJ file paths.
```

**Expected:** No errors. If you see `"Failed to load resource"` for the PNG
or TMJ, the file paths are wrong — check that both files are inside `public/assets/`.

**Change something:** Temporarily change `'level1'` to `'level1-typo'` in the
`tilemapTiledJSON` call. Save. Note the key mismatch — no error yet (the load
succeeds; the mismatch only errors when `create()` tries to use the wrong key).
Change it back to `'level1'`.

---

## Step 5 — Build the Tilemap in `GameScene.create()`

Open `src/scenes/GameScene.ts`. Add a `groundLayer` property, then replace the
`platforms` `StaticGroup` setup with tilemap creation:

```ts
export class GameScene extends Phaser.Scene {

  private platforms!: Phaser.Physics.Arcade.StaticGroup;   // keep — may add manual platforms later
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;      // ← add property
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // ...constructor, preload unchanged...

  create(): void {
    this.cameras.main.setBackgroundColor('#87CEEB');

    // ── Tilemap setup ─────────────────────────────────────────────────────

    // Create the tilemap data structure from the loaded JSON:
    const map = this.make.tilemap({ key: 'level1' });
    // make.tilemap: reads the cached JSON and creates a Tilemap object.
    // At this point, nothing is visible — it is just data in memory.

    // Attach the tileset image to the map.
    // First arg: the tileset name as defined in Tiled (the name you gave during import).
    // Second arg: the Phaser texture key ('tiles') loaded in preload().
    // These two strings must match exactly, or tiles render as blank squares.
    const tileset = map.addTilesetImage('spritesheet_ground', 'tiles')!;
    // The '!' asserts the return is not null. It returns null only if the
    // tileset name does not match any tileset in the JSON — a configuration error.

    // Create the Decoration layer (visual only — no collision):
    map.createLayer('Decoration', tileset, 0, 0);
    // 'Decoration': must match the layer name in Tiled exactly (case-sensitive).
    // 0, 0: pixel offset — place the layer at the world origin.

    // Create the Ground layer — store the reference (needed for collision):
    this.groundLayer = map.createLayer('Ground', tileset, 0, 0)!;
    // ← was: this.platforms = this.physics.add.staticGroup(); and ground rect

    // ── Collision ─────────────────────────────────────────────────────────

    this.groundLayer.setCollisionByExclusion([-1]);
    // setCollisionByExclusion([-1]): marks every non-empty tile in this layer
    // as collidable. -1 is Phaser's internal code for "empty cell" (no tile placed).
    // All other tile indices (1, 2, 3, ...) become solid physics surfaces.

    // ── World bounds ──────────────────────────────────────────────────────

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // map.widthInPixels: total pixel width of the map (100 tiles × 16 px = 1600 px).
    // map.heightInPixels: total pixel height (15 tiles × 16 px = 240 px).
    // This tells Phaser: world coordinates are valid from (0,0) to (1600,240).
    // setCollideWorldBounds(true) in the Player constructor uses these limits.

    // ── Player spawn ──────────────────────────────────────────────────────

    const TILE_SIZE: number = 16;
    const spawnX: number = 3 * TILE_SIZE;    // tile column 3 → pixel 48
    const spawnY: number = 12 * TILE_SIZE;   // tile row 12 → pixel 192
    // Row 12 is 2 rows above the ground (row 14) — player spawns just above ground.
    this.player = new Player(this, spawnX, spawnY);

    // Collider with the tilemap layer (not a StaticGroup):
    this.physics.add.collider(this.player, this.groundLayer);
    // physics.add.collider accepts TilemapLayers directly — same API as StaticGroup.
    // Phaser tests only tiles near the player (fast) rather than every tile (slow).

    // ── Input ─────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update(_time: number, delta: number): void {
    this.player.update(this.cursors);
  }
}
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** Real tile art — ground tiles at the bottom, floating
platform tiles in the level, cloud decoration tiles in the sky. The teal
player rectangle spawns above the ground and falls onto the ground tiles.

**In DevTools Console:**

```js
// Verify tilemap dimensions:
// (Expose map temporarily in create(): (window as any).map = map;)
map.widthInPixels    // Expected: 1600 (100 tiles × 16 px)
map.heightInPixels   // Expected: 240  (15 tiles × 16 px)
```

**Change something:** In Tiled, move the floating platform 3 rows higher.
Re-export to `level1.tmj`. Save in your editor. Vite may require a manual
browser refresh (F5) for changes to static files in `public/`. The platform
appears in its new position.

---

## Step 6 — Verify Player Stands on Tile Collision

Move the player with arrow keys. Confirm it stands on ground tiles and can land on
the floating platform.

If the player falls through the ground:
1. Check that `setCollisionByExclusion([-1])` was called on `this.groundLayer`
2. Verify `this.physics.add.collider(this.player, this.groundLayer)` is present
3. Enable `debug: true` in `main.ts` physics config — green boxes should appear
   on every ground tile. If they do not, the layer name `'Ground'` does not match
   Tiled's exported layer name.

### SAVE AND TRY

**You should see:** Arrow keys move the player. Player lands on ground tiles.
Player can jump up to floating platforms and land on them.

**In DevTools Console:**

```js
// Enable debug to count collision tiles (set debug: true in main.ts):
// Green boxes should appear on every non-empty tile in the Ground layer.
// Decoration tiles (clouds) should have NO green boxes.
```

**Change something:** Change `setCollisionByExclusion([-1])` to
`setCollisionByExclusion([-1, 1, 2, 3])` — excluding tile indices 1, 2, and 3
from collision. Some ground tiles become passable (player falls through).
Change it back to `setCollisionByExclusion([-1])`.

---

## 🎯 Challenge: Add a Second Object Layer for Coins (Preview of LAB-09)

**You know:** Tiled has a second layer type called **Object Layer** for placing
free-form entities (not tiles). Object layers store x, y positions with optional
properties — useful for coins, enemies, and checkpoints.

**Task:** In Tiled, add an Object Layer called `Coins`. Use the "Insert Point"
tool (P key) to place 5–10 coin position markers throughout the level.
Re-export the TMJ. In Phaser, read the object layer and log each coin's
position to the console:

```ts
// In create(), after building the tilemap:
const coinLayer = map.getObjectLayer('Coins');
if (coinLayer) {
  coinLayer.objects.forEach(obj => {
    console.log(`Coin at (${obj.x}, ${obj.y})`);
  });
}
```

Verify the logged positions match where you placed points in Tiled. This
prepares the data structure for LAB-09 where coins become collectible physics bodies.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In Tiled:
// 1. Layers panel → + → Object Layer → name "Coins"
// 2. Select "Coins" layer
// 3. Press P (Insert Point tool)
// 4. Click positions in the level to place coin markers
// 5. File → Export As → overwrite level1.tmj

// In GameScene.create(), after tilemap setup:
const coinLayer = map.getObjectLayer('Coins');
if (coinLayer) {
  coinLayer.objects.forEach((obj) => {
    console.log(`Coin at (${obj.x?.toFixed(0)}, ${obj.y?.toFixed(0)})`);
    // obj.x and obj.y are 'number | undefined' — the '?' guards against undefined.
    // toFixed(0): round to integer for cleaner output.
  });
}
```

**Key insight:** Tiled's Object Layer stores entity positions as floating-point
pixel coordinates (not tile indices). `obj.x = 80.5` is valid — the point was
placed halfway across tile column 5 (5 × 16 = 80). In LAB-09, we create a
Phaser `StaticGroup` from these positions: `coins.create(obj.x!, obj.y!, 'coin')`.
The `!` asserts x and y are not undefined — they always exist on a Tiled point object.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Tileset PNG loads | `http://localhost:5173/assets/spritesheet_ground.png` shows tile art |
| Level JSON loads | `http://localhost:5173/assets/level1.tmj` shows JSON with "Ground" and "Decoration" layers |
| Ground tiles render | Browser shows tile art at the bottom of the canvas |
| Decoration tiles render | Cloud or sky tiles visible in the upper area |
| Player stands on tiles | Arrow keys move player; player lands on ground tiles |
| Player lands on floating platform | Jump up to the platform — player stands on it |
| World bounds set | Player cannot walk past x=0 (left world edge) |
| `debug: true` shows tile collision boxes | Green boxes on Ground layer tiles; none on Decoration tiles |

---

## Quick Check Answers

**1. Tile at (col=5, row=3) with 16×16 tiles — pixel position?**

`pixel_x = 5 × 16 = 80`. `pixel_y = 3 × 16 = 48`. The tile's top-left corner
is at world pixel (80, 48). Its bottom-right corner is at (96, 64) — 16 pixels
wide and 16 pixels tall. A sprite positioned at (80, 48) with origin (0, 0)
would perfectly overlay this tile. With the default Phaser origin (0.5, 0.5),
the same sprite would need to be at (88, 56) — the tile's center.

**2. Tileset image vs tilemap JSON — what does each contain?**

The **tileset image** (PNG) contains the visual artwork — all tile sub-images
packed into a regular grid. It is purely visual: pixel colors, no positions, no
logic. The **tilemap JSON** contains the layout — a 2D grid of integer indices
referencing tiles in the PNG, layer definitions (which layer is named what, which
is on top), and references to which PNG file(s) the indices correspond to. Phaser
needs both: the JSON tells it WHERE each tile is, and the PNG tells it WHAT to draw.

**3. (Prediction) `setCollisionByExclusion([-1])` on a layer with cloud tiles?**

Every non-empty tile — including clouds — becomes collidable. The player bumps
into clouds instead of passing through them. This is why using separate layers
matters: the `Decoration` layer (clouds) gets no collision call; the `Ground` layer
gets `setCollisionByExclusion([-1])`. Collision is per-layer, not per-tile-image.
If you want only specific tiles to collide within a single layer, use
`setCollisionBetween(firstIndex, lastIndex)` or `setCollision([array, of, indices])`
instead of `setCollisionByExclusion`.

---

*Next: LAB-06 — Sprite Animations. We load the Kenney character spritesheet,
define `idle`, `walk`, and `jump` animations using Phaser's `AnimationManager`,
and add a `PlayerAnimState` enum state machine to the Player class that picks
the correct animation based on velocity and ground contact.*
