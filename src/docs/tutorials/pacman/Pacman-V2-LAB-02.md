# Pac-Man V2 — LAB 02 — The Tile Grid and Coordinate Spaces

**Prerequisites:** LAB 01 — a moving yellow square on a black canvas.

**What this lab builds:**
- The tile grid system that underlies every Pac-Man mechanic
- Two coordinate transform functions: `pixelToTile` and `tileToPixel`
- A visible grid drawn over the canvas so you can see the tile system
- A highlight showing which tile the player square is currently on

**Time:** 45–60 minutes.

---

> **Quick Check — try to answer before reading:**
> 1. What does "coordinate space" mean? Why might you need more than one?
> 2. If each tile is 16 pixels wide, and Pac-Man is at pixel X=80, which tile column is that?
> 3. You have `maze[row][column]`. If you access `maze[2][5]`, is that row 2 column 5, or column 2 row 5?
> *(Answers at the end of this lab)*

---

## What You Will Build

A faint grid overlaid on the canvas, dividing it into 28 columns × 31 rows of
16×16 pixel tiles. As the yellow square moves, one tile highlights in dim yellow —
the tile the square currently occupies.

```
┌──┬──┬──┬──┐        Every Pac-Man mechanic
│  │  │  │  │        uses TILE positions, not
├──┼──┼──╔══╗        pixel positions.
│  │  │  ║ █║   ←─── square is at tile (col 3, row 2)
├──┼──┼──╚══╝
│  │  │  │  │
└──┴──┴──┴──┘
```

---

## Concept: The 2D Array as a Grid Data Structure

**What it is:** An array where each element is itself an array — creating rows
and columns of data. The most natural structure for any grid-based game.

**The problem before:** Storing maze data as a long flat list means calculating
`index = row * width + column` every time you want a specific cell — error-prone
and unreadable.

**The solution:** A 2D array where `grid[row][column]` directly gives you the
value at that grid position.

**Canonical example — a spreadsheet:** Every spreadsheet is a 2D array.
Cell B3 = column 2, row 3. `grid[3][2]` in JavaScript. The rows are the outer
array (you pick the row first), columns are the inner arrays.

```js
// A 3-row, 4-column grid of numbers:
const grid = [
  [0, 1, 0, 1],   // row 0
  [1, 0, 1, 0],   // row 1
  [0, 1, 0, 1],   // row 2
];

grid[1][2]   // → 1  (row 1, column 2)
grid[0][3]   // → 1  (row 0, column 3)
```

**Why it matters here:** The Pac-Man maze is a 31-row × 28-column 2D array.
Every wall, path, dot, and power pellet is stored as a number in this array.
Wall = 1, path = 0. All AI, collision, and movement logic reads from this array.

**Watch for:** Array index order is `[row][column]`, which maps to `[y][x]` in
pixel space. New developers often accidentally write `[column][row]` and get
unexpected results. When in doubt: row first, column second.

---

## Concept: Two Coordinate Spaces — Pixels and Tiles

**What it is:** The same location described in two different units.

The canvas uses **pixel coordinates** — exact pixel positions for drawing.
The maze logic uses **tile coordinates** — which row and column a thing is in.

**Canonical example — a city map:** You can describe a location as GPS
coordinates (precise, in degrees) or as "3rd Avenue and 42nd Street" (grid
coordinates). GPS is for navigation hardware (drawing). Street addresses are
for giving directions (logic). Same location, two systems, two purposes.

In Pac-Man:
- **Pixel space:** `pacman.pixelX = 224`, `pacman.pixelY = 336` — used for drawing
- **Tile space:** `pacman.tileColumn = 14`, `pacman.tileRow = 21` — used for wall collision, dot eating, ghost targeting

Converting between them requires two functions — one for each direction.

**Watch for:** Never mix the two spaces in one calculation. `maze[pixelY][pixelX]`
is wrong. `maze[tileRow][tileColumn]` is correct.

---

## Concept: `pixelToTile` — The Forward Transform

**What it computes:** Which tile index contains a given pixel coordinate.

**The real-world analogy:** Given a GPS coordinate (precise), find which
city block you're on. You divide by the block size and drop the remainder.

**Canonical example:**
```
Tile size = 16 pixels.
Pixel 0–15  → tile 0  (first tile)
Pixel 16–31 → tile 1  (second tile)
Pixel 32–47 → tile 2  (third tile)

Formula: tileIndex = Math.floor(pixel / tileSize)

pixelToTile(0)  = Math.floor(0  / 16) = 0
pixelToTile(15) = Math.floor(15 / 16) = 0  ← still tile 0
pixelToTile(16) = Math.floor(16 / 16) = 1  ← now tile 1
pixelToTile(80) = Math.floor(80 / 16) = 5  ← tile 5
```

**The code:**
```js
function pixelToTile(pixelCoordinate) {
  return Math.floor(pixelCoordinate / TILE_SIZE);
}
```

**Why it matters here:** Every wall collision check, every dot pickup, every
ghost AI decision starts with `pixelToTile` — converting the entity's pixel
position to a tile address to look up in the maze array.

**Watch for:** `Math.floor` is critical — `15 / 16 = 0.9375`, which rounds to
tile 1 without `floor`. Using `Math.round` instead of `Math.floor` causes
entities to jump to the next tile before they've actually reached it.

---

## Math: `Math.floor` — Rounding Down to an Integer

**What it computes:** The largest integer less than or equal to the input.
Always rounds toward negative infinity (never up).

**Canonical example:** Cutting a ribbon into equal pieces.
You have 35cm of ribbon and cut it into 16cm pieces. `35 / 16 = 2.1875`.
You get **2 full pieces** — the 0.1875 is a partial piece that doesn't count.
`Math.floor(2.1875) = 2`.

```js
Math.floor(2.9)    // → 2   (rounds down, not to nearest)
Math.floor(2.1)    // → 2
Math.floor(-2.1)   // → -3  (toward negative infinity — watch for this with negative coords)
Math.floor(16/16)  // → 1
Math.floor(15/16)  // → 0   (still tile 0)
```

**Watch for:** Negative pixel coordinates (which can occur with wrapping) give
unexpected tile indices with `Math.floor`. `Math.floor(-1 / 16) = -1`, not 0.

---

## Concept: `tileToPixel` — The Inverse Transform (Tile Center)

**What it computes:** The pixel coordinate of the CENTER of a given tile.

**Canonical example:** Given "3rd city block," find its center GPS coordinate.
`centerPixel = tileIndex * tileSize + tileSize / 2`

```
Tile 0 center = 0  * 16 + 8 = 8   (pixel 8)
Tile 1 center = 1  * 16 + 8 = 24  (pixel 24)
Tile 5 center = 5  * 16 + 8 = 88  (pixel 88)
```

**The code:**
```js
function tileToPixel(tileIndex) {
  return tileIndex * TILE_SIZE + TILE_SIZE / 2;
}
```

**Why it matters here:** When Pac-Man or a ghost needs to snap to a tile center
(for wall checking or direction decisions), `tileToPixel` gives the exact pixel
they should snap to.

**Watch for:** `tileToPixel` returns the CENTER of the tile. For drawing a
rectangle at the top-left of a tile: `tileIndex * TILE_SIZE` (no `+ TILE_SIZE/2`).

---

## Step 1 — Add Tile Constants and Transform Functions

Add at the top of `main.js`, before the canvas setup:

```js
// ── Tile grid constants ────────────────────────────────────────────────────────

// TILE_SIZE: every tile in the maze is a 16×16 pixel square.
// All maze coordinates are measured in tiles. All rendering uses pixels.
// These two constants define the two coordinate spaces.
const TILE_SIZE    = 16;    // pixels per tile
const MAZE_COLUMNS = 28;    // maze width in tiles
const MAZE_ROWS    = 31;    // maze height in tiles

// CANVAS_WIDTH and CANVAS_HEIGHT now come from the tile grid:
// (overwrite the values from LAB-01)
const CANVAS_WIDTH  = MAZE_COLUMNS * TILE_SIZE;   // 28 * 16 = 448 pixels
const CANVAS_HEIGHT = MAZE_ROWS    * TILE_SIZE;   // 31 * 16 = 496 pixels
```

Add the transform functions (add these before `update`):

```js
// pixelToTile: converts a pixel coordinate to the tile index containing it.
// This is a COORDINATE SPACE TRANSFORM — it converts from pixel space to tile space.
// The same concept appears in CAD (world coordinates → screen coordinates)
// and in 3D graphics (3D world space → 2D screen space).
function pixelToTile(pixelCoordinate) {
  return Math.floor(pixelCoordinate / TILE_SIZE);
}

// tileToPixel: converts a tile index to the pixel coordinate of that tile's CENTER.
// This is the INVERSE TRANSFORM — tile space back to pixel space.
function tileToPixel(tileIndex) {
  return tileIndex * TILE_SIZE + TILE_SIZE / 2;
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** Same as LAB-01 — moving square on black canvas. Nothing
visually changed yet because we only added constants and functions.

**In DevTools Console:**
```js
pixelToTile(0)
```
**Expected:** `0`

```js
pixelToTile(80)
```
**Expected:** `5`

```js
tileToPixel(5)
```
**Expected:** `88` (tile 5 center = 5×16 + 8)

```js
pixelToTile(tileToPixel(5))
```
**Expected:** `5` — converts tile → pixel → tile. Round-trip should return the original tile.

---

## Step 2 — Draw the Tile Grid

Add a `drawGrid` function and call it from `render`:

```js
// drawGrid: draws faint lines dividing the canvas into the tile grid.
// This is a DEBUGGING TOOL — remove it in LAB-03 once the maze is drawn.
// Seeing the grid makes coordinate transforms concrete and verifiable.
function drawGrid() {
  ctx.strokeStyle = '#222222';   // very dark grey — subtle grid lines
  ctx.lineWidth   = 0.5;

  // Draw vertical lines (one per column boundary):
  for (let column = 0; column <= MAZE_COLUMNS; column++) {
    const x = column * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Draw horizontal lines (one per row boundary):
  for (let row = 0; row <= MAZE_ROWS; row++) {
    const y = row * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
}
```

Update `render()` to call `drawGrid` after the background and before the player:

```js
function render() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawGrid();    // ← add this — draw grid over background, under player

  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** The faint dark-grey grid lines dividing the canvas into
28 columns × 31 rows of 16×16 pixel cells.

**In DevTools Console:**
```js
MAZE_COLUMNS * TILE_SIZE === CANVAS_WIDTH
```
**Expected:** `true`

**Change something:** Change `ctx.strokeStyle = '#222222'` to `'#444444'`.
Save. Grid lines are more visible. Change it back to `'#222222'`.

---

## Step 3 — Highlight the Tile the Player Is On

Add a `drawPlayerTileHighlight` function that shows which tile the player square
currently occupies:

```js
// drawPlayerTileHighlight: shades the tile containing the player's center.
// This makes the pixelToTile transform VISIBLE — you can watch it update in real time.
function drawPlayerTileHighlight() {
  // Player center in pixel space:
  const playerCenterX = playerX + PLAYER_SIZE / 2;
  const playerCenterY = playerY + PLAYER_SIZE / 2;

  // Convert to tile space using the coordinate transform:
  const playerTileColumn = pixelToTile(playerCenterX);
  const playerTileRow    = pixelToTile(playerCenterY);

  // Convert back to pixel space to draw the highlight:
  // (tile top-left corner = tileIndex * TILE_SIZE, no center offset)
  const highlightX = playerTileColumn * TILE_SIZE;
  const highlightY = playerTileRow    * TILE_SIZE;

  ctx.fillStyle = '#333300';   // dim yellow — tile highlight color
  ctx.fillRect(highlightX, highlightY, TILE_SIZE, TILE_SIZE);
}
```

Update `render()`:

```js
function render() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawGrid();
  drawPlayerTileHighlight();    // ← add this, before drawing the player

  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** As you move the square with arrow keys, the tile it occupies
dims slightly yellow. When the square crosses a tile boundary, the highlight
jumps to the next tile.

**In DevTools Console:**
```js
pixelToTile(playerX + PLAYER_SIZE / 2)
```
**Expected:** The current tile column. Move the player and run again — the
number changes.

**Change something:** Change `'#333300'` to `'#330000'` (dim red). The highlight
turns red. Change it back.

---

## 🎯 Challenge: Show the Tile Coordinates as Text

**You know:** `pixelToTile` converts pixel coordinates to tile coordinates.
`ctx.fillText(text, x, y)` draws text at a pixel position.

**Task:** Draw the current tile column and row as text in the top-left of the
canvas, like: `col: 14  row: 21`

**Starting code (add inside `render()`):**
```js
// Draw tile coordinate text here:
ctx.fillStyle = '???';
ctx.font = '???';
ctx.fillText('col: ' + ??? + '  row: ' + ???, 8, 16);
```

**Hints:**
1. `ctx.font = '12px monospace'` sets the font to 12-pixel monospaced text.
2. The player's center tile column is `pixelToTile(playerX + PLAYER_SIZE / 2)`.
3. Draw this text LAST in `render()` so it appears on top of everything.

---

<details>
<summary>▶ Show Solution</summary>

At the end of `render()`:
```js
  // Draw tile coordinate HUD:
  const playerTileColumn = pixelToTile(playerX + PLAYER_SIZE / 2);
  const playerTileRow    = pixelToTile(playerY + PLAYER_SIZE / 2);

  ctx.fillStyle = '#ffffff';
  ctx.font      = '12px monospace';
  ctx.fillText(`col: ${playerTileColumn}  row: ${playerTileRow}`, 8, 16);
```

**Key insight:** This is a HUD — Heads-Up Display. It shows internal state
(tile coordinates) visually so you can verify that `pixelToTile` is working
correctly as you move around. Good developers add HUDs while building and
remove them before shipping. In CAD software, this is how "coordinate readout"
displays work — the cursor's world position converted to screen position and
shown in the UI.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Grid visible | 28 columns × 31 rows of dark lines on canvas |
| `pixelToTile(0)` returns 0 | DevTools Console test |
| `pixelToTile(80)` returns 5 | DevTools Console test |
| `tileToPixel(5)` returns 88 | DevTools Console test |
| Tile highlight follows player | Move with arrow keys — highlight jumps tile by tile |
| Tile coordinates in HUD | (challenge) Text shows current col and row |
| Player still moves and stops at edges | LAB-01 behavior unchanged |

---

## Quick Check Answers

**1. What does "coordinate space" mean?**
A coordinate space is a system for describing positions using numbers. Two
coordinate spaces mean two different unit systems for the same physical canvas.
Pixel space describes exact pixel positions (used for drawing). Tile space
describes which grid cell an entity is in (used for game logic). Having both
allows drawing code and logic code to work independently — drawing uses pixels
for precision, logic uses tiles for simplicity.

**2. Pac-Man at pixel X=80, tile size=16 — which tile column?**
`Math.floor(80 / 16) = Math.floor(5.0) = 5`. Tile column 5. The `Math.floor`
ensures that pixel 79 is still tile 4, and pixel 80 is the first pixel of tile 5.

**3. `maze[2][5]` — row 2 column 5, or column 2 row 5?**
Row 2, column 5. The outer array index is always the row (Y direction) and the
inner array index is always the column (X direction). This maps to `[y][x]` in
pixel terms — Y first, then X. This is the opposite of how we usually say
coordinates (`x, y`), so it trips people up. Always read it as: "go to row 2,
then within that row go to index 5."

---

## What Is Next — LAB 03

LAB 03 loads the actual Pac-Man maze as a 2D array and draws it. You will see
the complete maze rendered from data — walls as blue rectangles, paths as black
space. The grid lines from this lab disappear and the maze data takes their
place. Every wall collision, every dot position, and every ghost path is defined
by this array.

*Continue to Pac-Man V2 — LAB 03 — The Maze from Data.*
