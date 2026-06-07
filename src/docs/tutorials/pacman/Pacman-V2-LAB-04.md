# Pac-Man V2 — LAB 04 — Pac-Man Moves Through the Maze

**Prerequisites:** LAB 03 — maze drawn from data, `pixelToTile`, `tileToPixel`.

**What this lab builds:**
- Pac-Man as a proper object (position, direction, speed)
- Tile-based wall collision — can't walk through walls
- Tunnel wrapping — disappears left, appears right (and vice versa)
- The square becomes a proper Pac-Man circle shape

**Time:** 60–75 minutes.

---

> **Quick Check — try to answer before reading:**
> 1. To check if Pac-Man can move right, which tile do you check — the tile he's ON, or the tile he's trying to ENTER?
> 2. What is a "direction vector" and why use `{dx: 1, dy: 0}` instead of a string like `"right"`?
> 3. The maze has tunnels on row 14. Pac-Man exits the right side at column 27. Where should he reappear?
> *(Answers at the end of this lab)*

---

## What You Will Build

Pac-Man (a yellow circle, not a square) navigates the maze with arrow keys.
He cannot walk through blue walls. At the left and right tunnel exits, he wraps
to the other side of the screen.

---

## Concept: Object Literals — Grouping Related State

**What it is:** A JavaScript object `{}` that groups related values under one
named variable.

**The problem before:** Separate variables for each piece of player state:
```js
let playerX = 224;
let playerY = 408;
let playerDirX = 0;
let playerSpeed = 2;
// What if you have two players? playerX_1, playerX_2... ❌
```

**The solution:** Group everything belonging to Pac-Man into one object:
```js
const pacman = {
  pixelX: 224,
  pixelY: 408,
  directionX: 0,
  directionY: 0,
  speed: 2,
};
pacman.pixelX += pacman.speed;   // reads cleanly
```

**Canonical example — a passport:** A passport groups many pieces of identity
data (name, photo, nationality, expiry) under one physical document. You hand
someone their passport, not a stack of separate cards. Same idea: `pacman`
holds all Pac-Man's state in one place.

**Why it matters here:** Pac-Man and the ghost objects have the same shape —
position, direction, speed. Using objects makes them consistent and allows
them to be passed to shared functions.

**Watch for:** `const pacman` means the variable `pacman` cannot be
reassigned — but the object's properties CAN be changed: `pacman.pixelX += 2`
is legal. `const` prevents `pacman = somethingElse`, not property mutation.

---

## Concept: Direction Vectors `{dx, dy}`

**What it is:** A pair of numbers representing a direction of movement in 2D.
`dx` is the change per step in X, `dy` is the change per step in Y.

**The four directions in tile-based movement:**

| Direction | `dx` | `dy` | Why |
|-----------|------|------|-----|
| Right | `+1` | `0` | X increases right |
| Left | `-1` | `0` | X decreases left |
| Down | `0` | `+1` | Y increases downward |
| Up | `0` | `-1` | Y decreases upward |

**Canonical example — compass directions on a map:** North = (0, -1), East = (1, 0),
South = (0, 1), West = (-1, 0). Movement is applying the direction vector: if
you're at (3, 3) and move North (0, -1), you end up at (3, 2).

```js
const DIRECTION = {
  RIGHT: { dx:  1, dy:  0 },
  LEFT:  { dx: -1, dy:  0 },
  DOWN:  { dx:  0, dy:  1 },
  UP:    { dx:  0, dy: -1 },
};
```

**Why it matters here:** Using `{dx, dy}` instead of strings means we can
do arithmetic: `nextColumn = currentColumn + direction.dx`. With a string
`"right"` we'd need an if-statement. Vectors are directly usable in math.

**Watch for:** Y is inverted on canvas — "up" on screen means negative Y.
`dy: -1` for up is correct.

---

## Concept: Tile-Based Collision — Check the Tile You're Entering

**What it is:** Before moving an entity, check whether the destination tile
is passable. If not, cancel the move.

**The problem before:** Checking if the current tile is a wall after moving —
the entity is already inside the wall.

**The solution:** Calculate the destination tile before moving. Check it.
Only move if it's passable.

**Canonical example — a sliding puzzle:** Before sliding a piece left, you
check if the space to its left is empty. You check the DESTINATION, not the
current position. Same rule: look before you move.

```js
// What tile would Pac-Man's CENTER be in after moving?
const nextTileColumn = pixelToTile(pacman.pixelX + direction.dx * TILE_SIZE);
const nextTileRow    = pixelToTile(pacman.pixelY + direction.dy * TILE_SIZE);

// Check if that tile is passable:
if (maze[nextTileRow][nextTileColumn] !== TILE_WALL) {
  // Safe to move
  pacman.pixelX += direction.dx * pacman.speed;
  pacman.pixelY += direction.dy * pacman.speed;
}
```

**Why it matters here:** This check runs every frame for Pac-Man and every
frame per ghost. Getting it right once means all entities use the same logic.

**Watch for:** Checking one tile but Pac-Man's body overlaps multiple tiles
at wide speeds. We solve this by keeping speed small relative to tile size.

---

## Step 1 — Replace the Player Square with a Pac-Man Object

Remove the old `playerX`, `playerY`, `PLAYER_SIZE`, `PLAYER_COLOR`, and
`PLAYER_SPEED` variables. Replace with:

```js
// ── Pac-Man state ──────────────────────────────────────────────────────────────

const PACMAN_RADIUS = 7;     // visual radius in pixels (slightly smaller than half tile)
const PACMAN_SPEED  = 1.5;   // pixels per frame
const PACMAN_COLOR  = '#ffff00';

// Pac-Man's starting position: tile (14, 23) is the classic spawn location.
// tileToPixel converts the tile coordinate to the center pixel of that tile.
const PACMAN_SPAWN_COLUMN = 14;
const PACMAN_SPAWN_ROW    = 23;

// pacman object: all Pac-Man state in one place.
const pacman = {
  pixelX:     tileToPixel(PACMAN_SPAWN_COLUMN),   // pixel X of center
  pixelY:     tileToPixel(PACMAN_SPAWN_ROW),       // pixel Y of center
  directionX: 0,    // current horizontal direction: -1, 0, or 1
  directionY: 0,    // current vertical direction:   -1, 0, or 1
  nextDirX:   0,    // queued next direction (pressed but not yet applied)
  nextDirY:   0,
};
```

### SAVE AND TRY

Save. Reload.

**In DevTools Console:**
```js
pacman
```
**Expected:** The pacman object with all its properties.

```js
pacman.pixelX
```
**Expected:** A number around 232 (`tileToPixel(14)` = 14×16 + 8 = 232).

---

## Step 2 — Draw Pac-Man as a Circle

Replace `drawPlayerTileHighlight` and the `ctx.fillRect` player draw with a
proper `drawPacman` function:

```js
// drawPacman: draws Pac-Man as a yellow circle at his current pixel position.
// ctx.arc draws a circle arc. Parameters: (centerX, centerY, radius, startAngle, endAngle)
// Math.PI * 2 is a full circle (2π radians = 360°). The mouth animation comes in LAB-05.
function drawPacman() {
  ctx.beginPath();
  ctx.arc(pacman.pixelX, pacman.pixelY, PACMAN_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = PACMAN_COLOR;
  ctx.fill();
}
```

Update `render()`:
```js
function render() {
  ctx.fillStyle = COLOR_PATH;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawMaze();
  drawPacman();   // ← replaces the fillRect player draw
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** A yellow circle near the center of the maze. Pac-Man does
not move yet — we removed the old movement code. That's fine. Visible first.

**In DevTools Console:**
```js
Math.PI * 2
```
**Expected:** `6.283185307...` — this is 2π radians, a full circle.

---

## Concept: `ctx.arc` — Drawing Circles

**What it is:** Draws an arc (part of a circle or a full circle) on the canvas.

**Parameters:** `ctx.arc(x, y, radius, startAngle, endAngle)`
- `x, y` — the center of the circle in pixels
- `radius` — radius in pixels
- `startAngle` — where the arc starts, in radians (0 = 3 o'clock position)
- `endAngle` — where the arc ends (Math.PI * 2 = full circle back to 3 o'clock)

**Canonical example — a clock face:** Radians measure angles like a clock.
Start at 3 o'clock (0 radians). Go clockwise. 6 o'clock = π/2. 9 o'clock = π.
12 o'clock = 3π/2. Back to 3 o'clock = 2π. A full clock face = 0 to 2π.

```js
// Full circle (Pac-Man body):
ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

// Half circle (open mouth facing right):
ctx.arc(centerX, centerY, radius, 0.3, Math.PI * 2 - 0.3);
// The 0.3 radian gap = the open mouth area (LAB-05)
```

**Watch for:** `ctx.arc` draws the path but does not fill it. Always call
`ctx.beginPath()` first to clear the previous path, then `ctx.fill()` or
`ctx.stroke()` after to actually paint the circle.

---

## Step 3 — Add Wall Collision and Movement

Add the `isTilePassable` and `updatePacman` functions:

```js
// isTilePassable: returns true if an entity can enter the given tile.
// Returns false for wall tiles or tiles outside the maze bounds.
function isTilePassable(tileColumn, tileRow) {
  // Check bounds first — out-of-bounds indices crash array access.
  if (tileRow    < 0 || tileRow    >= MAZE_ROWS)    return false;
  if (tileColumn < 0 || tileColumn >= MAZE_COLUMNS) return false;

  // Look up the tile type and check it is not a wall:
  return maze[tileRow][tileColumn] !== TILE_WALL;
}

// updatePacman: moves Pac-Man in his current direction, checking for walls.
// Called once per frame from the game loop.
function updatePacman() {
  // Check if input has set a new direction (nextDirX/nextDirY).
  // Try to apply the queued direction if the next tile is passable:
  const nextDirTileColumn = pixelToTile(pacman.pixelX + pacman.nextDirX * TILE_SIZE);
  const nextDirTileRow    = pixelToTile(pacman.pixelY + pacman.nextDirY * TILE_SIZE);

  if (isTilePassable(nextDirTileColumn, nextDirTileRow)) {
    // Queued direction is valid — apply it:
    pacman.directionX = pacman.nextDirX;
    pacman.directionY = pacman.nextDirY;
  }

  // Move in the current direction, but only if the next tile is passable:
  const moveTileColumn = pixelToTile(pacman.pixelX + pacman.directionX * TILE_SIZE);
  const moveTileRow    = pixelToTile(pacman.pixelY + pacman.directionY * TILE_SIZE);

  if (isTilePassable(moveTileColumn, moveTileRow)) {
    pacman.pixelX += pacman.directionX * PACMAN_SPEED;
    pacman.pixelY += pacman.directionY * PACMAN_SPEED;
  }

  // Tunnel wrapping: if Pac-Man exits the left or right edge, wrap to the other side.
  // Row 14 is the tunnel row. Columns 0 and 27 are the tunnel exits.
  if (pacman.pixelX < 0)            pacman.pixelX = CANVAS_WIDTH;
  if (pacman.pixelX > CANVAS_WIDTH) pacman.pixelX = 0;
}
```

Update `keysHeld` handling — replace the old movement block in `update()`:

```js
function update() {
  // Set Pac-Man's queued next direction based on held keys.
  // The direction is queued, not applied immediately — applied in updatePacman
  // when the next tile is passable (allows smooth cornering).
  if (keysHeld['ArrowRight']) { pacman.nextDirX =  1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowLeft'])  { pacman.nextDirX = -1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowDown'])  { pacman.nextDirX =  0; pacman.nextDirY =  1; }
  if (keysHeld['ArrowUp'])    { pacman.nextDirX =  0; pacman.nextDirY = -1; }

  updatePacman();
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** Yellow circle in the maze. Press an arrow key — Pac-Man
moves in that direction and stops when hitting a wall. He does NOT walk through
blue tiles anymore.

**In DevTools Console:**
```js
isTilePassable(0, 0)
```
**Expected:** `false` — tile (0,0) is a wall.

```js
isTilePassable(1, 1)
```
**Expected:** `true` — tile (1,1) is a path.

```js
pacman.directionX
```
**Expected:** `1`, `-1`, or `0` depending on which way Pac-Man is moving.

**Change something:** Change `PACMAN_SPEED` from `1.5` to `4`. Save. Pac-Man
moves much faster. At high speeds you may pass through thin walls — this is why
speed must be smaller than tile size. Change it back to `1.5`.

---

## 🎯 Challenge: Visualize the Tile Pac-Man Is Trying to Enter

**You know:** `pixelToTile` converts Pac-Man's position to a tile. The
"next tile" he'd enter moving right is one tile to the right of his current tile.

**Task:** During development, draw a small red dot on the tile Pac-Man is
trying to enter in his current direction. This makes collision checking visible.

**Hints:**
1. Calculate `moveTileColumn` and `moveTileRow` from Pac-Man's position and direction.
2. Convert back to pixel position with `column * TILE_SIZE` and `row * TILE_SIZE`.
3. Draw a small red `fillRect` (or `arc`) at that position in `render()`.
4. Remove it when satisfied it works.

---

<details>
<summary>▶ Show Solution</summary>

In `render()`, after `drawMaze()` and before `drawPacman()`:
```js
  // Debug: highlight the tile Pac-Man is trying to enter:
  const targetColumn = pixelToTile(pacman.pixelX + pacman.directionX * TILE_SIZE);
  const targetRow    = pixelToTile(pacman.pixelY + pacman.directionY * TILE_SIZE);
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.fillRect(targetColumn * TILE_SIZE, targetRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
```

**Key insight:** Making invisible logic visible is a core debugging technique.
You're not just guessing if collision works — you can SEE which tile the
game thinks Pac-Man is heading toward. Remove this when confident. The same
technique (render debug state) is used in physics engines, path-finding AI,
and CAD constraint solvers.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Pac-Man is a yellow circle | Round yellow shape visible in maze |
| Arrow keys change direction | Hold key — Pac-Man moves that way |
| Wall collision works | Move toward a wall — stops, doesn't pass through |
| Tunnel wrapping works | Navigate to row 14 tunnel — disappear left, appear right |
| `isTilePassable(0,0)` returns false | Console test |
| `isTilePassable(1,1)` returns true | Console test |
| No console errors | DevTools shows no red messages |

---

## Quick Check Answers

**1. Check the tile he's ON or the tile he's trying to ENTER?**
The tile he's trying to enter. If you check the current tile, he's already there
and the wall is behind him. The movement guard must check the destination before
any position change happens — "look before you step."

**2. Why `{dx: 1, dy: 0}` instead of the string `"right"`?**
Because vectors support arithmetic directly: `nextX = pacman.pixelX + dir.dx * speed`.
A string would require an if-statement to convert it to numbers first. The ghost
AI picks the best direction by computing `nextTile = currentTile + dir.dx` — that
works instantly with direction vectors. It's the same reason physics engines
store velocity as vectors, not as direction strings.

**3. Pac-Man exits the right side at column 27. Where does he reappear?**
At the left side — pixel X = 0 (or column 0, pixel = TILE_SIZE/2). The maze
tunnel row (row 14) connects both sides. `if (pacman.pixelX > CANVAS_WIDTH) pacman.pixelX = 0`
handles this wrapping. It's the same modulo wrapping principle as the screen-edge
wrap in LAB-01's bounce challenge.

---

## What Is Next — LAB 05

LAB 05 adds dots and a score. Every path tile (`TILE_DOT`) in the maze array
already has a value of 2 — the data is already there. We'll draw the dots as
small circles and remove them when Pac-Man's tile matches a dot tile. First
new pattern: tracking which dots have been eaten using a Set data structure.

*Continue to Pac-Man V2 — LAB 05 — Dots, Eating, and Score.*
