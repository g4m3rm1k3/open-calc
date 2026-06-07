# Pac-Man V2 — LAB 06 — The First Ghost (Visible, Then Moving)

**Prerequisites:** LAB 05 — dots, eating, score.

**What this lab adds — one feature at a time:**
- Step 1: Ghost appears on screen (just drawn — doesn't move)
- Step 2: Ghost moves randomly — one random valid direction at each tile center
- Step 3: Ghost cannot walk through walls (same `isTilePassable` reused)

No chase AI yet. No collision with Pac-Man yet. No frightened mode. One thing per step.

**Time:** 60–75 minutes.

---

> **Quick Check — try to answer before reading:**
> 1. Why is it useful to draw the ghost before making it move?
> 2. What is a "tile center" and why does a ghost only choose a new direction there?
> 3. Reusing `isTilePassable` for ghosts — what does that say about the function design?
> *(Answers at the end of this lab)*

---

## What You Will Build

After Step 1: A red circle (ghost) appears near the center of the maze.
After Step 2: It drifts around randomly — may walk through walls (expected).
After Step 3: It navigates the corridors without passing through walls.

---

## Concept: The Entity Object — Same Shape as Pac-Man

**What it is:** The ghost object has the same data fields as Pac-Man: pixel
position, direction, speed. This is not a coincidence — it's a design choice.

**Why it matters:** A function that works on "any object with pixelX, pixelY,
directionX, directionY" works for both Pac-Man and ghosts. You don't write
two versions. This is called **structural typing** — two objects with the
same shape can be used interchangeably.

**Canonical example — a power outlet:** Every device with a standard plug
(the right shape) can use any standard outlet. The outlet doesn't care if it's
a lamp or a phone — it cares about the plug shape. `isTilePassable` doesn't
care if the entity is Pac-Man or a ghost — it cares about having x and y.

```js
const ghost = {
  pixelX:     tileToPixel(GHOST_SPAWN_COLUMN),
  pixelY:     tileToPixel(GHOST_SPAWN_ROW),
  directionX: 0,
  directionY: -1,   // starts moving up
  speed:      1.5,
  color:      '#ff0000',   // red — Blinky
};
```

**Watch for:** The ghost does NOT have `isFrightened` yet. That property
gets added in LAB-09 when frightened mode is actually built. Adding it now
would be writing code we can't test.

---

## Concept: Entity List (Pattern — first appearance for ghosts)

**Pattern name:** Entity List
**Category:** Game architecture (non-GoF)

**What it is:** A list of objects representing a category of game entity.
All objects in the list have the same shape and are processed by the same
functions.

**First seen:** LAB-05, where dots were looped to draw and check eating.

**Now applied to:** Ghosts — `const ghosts = [ghost]`. The `forEach` loop
draws and updates all ghosts. When we add more ghosts in LAB-10, only the
array changes — the loop stays the same.

**Canonical example — a bus route:** One bus driver follows the same rules
for every passenger — check the ticket, open the door. Whether there's 1
passenger or 50, the process is the same. The entity list is the passenger
list. The loop is the driver's process.

**Tradeoff:** All ghosts update every frame even if they're far from Pac-Man.
Acceptable at 4 ghosts.

**You will see this again in:** LAB-10 when we add all four ghost personalities.

---

## Step 1 — Ghost Appears (Just Draw It)

Add ghost constants and state after the Pac-Man constants:

```js
// ── Ghost constants ────────────────────────────────────────────────────────────

const GHOST_RADIUS = 8;    // visual radius in pixels

// Classic ghost house position — center of the maze.
const GHOST_SPAWN_COLUMN = 13;
const GHOST_SPAWN_ROW    = 14;

// ── Ghost state ────────────────────────────────────────────────────────────────

// createGhost: builds one ghost object.
// All ghosts have the same shape — position, direction, speed, color.
// No isFrightened here — that is added in LAB-09 when frightened mode is built.
function createGhost(spawnColumn, spawnRow, color) {
  return {
    pixelX:     tileToPixel(spawnColumn),
    pixelY:     tileToPixel(spawnRow),
    directionX: 0,
    directionY: -1,   // initial direction: up
    speed:      1.5,
    color:      color,
  };
}

// ghosts: Entity List — all ghost objects.
// Starts with one ghost (Blinky). More added in LAB-10.
const ghosts = [
  createGhost(GHOST_SPAWN_COLUMN, GHOST_SPAWN_ROW, '#ff0000'),  // Blinky — red
];
```

Add a `drawGhost` function and a `drawGhosts` loop:

```js
// drawGhost: draws one ghost as a colored circle with a flat bottom.
// Full ghost shape (dome + skirt) comes in LAB-10.
// Simple circle is sufficient to see the ghost and verify position.
function drawGhost(ghost) {
  ctx.beginPath();
  ctx.arc(ghost.pixelX, ghost.pixelY, GHOST_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = ghost.color;
  ctx.fill();
}

// drawGhosts: loops through the entity list and draws each ghost.
// Adding more ghosts to the array later requires no change here.
function drawGhosts() {
  ghosts.forEach(ghost => drawGhost(ghost));
}
```

Update `render()`:
```js
function render() {
  ctx.fillStyle = COLOR_PATH;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawMaze();
  drawDots();
  drawGhosts();   // ← ghosts drawn BEFORE Pac-Man (Pac-Man appears on top)
  drawPacman();
  drawScore();
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** A red circle near the center of the maze. It does NOT move.
Pac-Man still moves normally. The ghost is drawn but has no `update` call yet.

**In DevTools Console:**
```js
ghosts[0]
```
**Expected:** The ghost object with all its properties.

```js
ghosts[0].pixelX
```
**Expected:** `tileToPixel(13)` = 13×16 + 8 = 216.

**Change something:** Change the ghost color from `'#ff0000'` to `'#ff8800'`
(orange). Save — ghost turns orange. Change it back.

---

## Concept: Tile Alignment — When Ghosts Decide Their Next Direction

**What it is:** Ghosts do not choose a new direction every frame. They only
choose when they are at (or very near) the center of a tile. This prevents
ghosts from changing direction mid-corridor.

**Why this matters:** A ghost moving right at speed 1.5 passes through several
pixels per frame. If it could turn at any pixel, it would spin erratically.
By restricting direction changes to tile centers, movement is clean and
predictable — the same way real Pac-Man works.

**How to detect tile center alignment:**

```js
const tileCenterX = tileToPixel(pixelToTile(ghost.pixelX));
const tileCenterY = tileToPixel(pixelToTile(ghost.pixelY));

// "Aligned" means within TILE_SIZE/2 pixels of the tile center:
const distanceFromCenterX = Math.abs(ghost.pixelX - tileCenterX);
const distanceFromCenterY = Math.abs(ghost.pixelY - tileCenterY);
const threshold = ghost.speed + 1;

const isAligned = distanceFromCenterX <= threshold &&
                  distanceFromCenterY <= threshold;
```

**Canonical example — a train station:** A train can only switch tracks at
a station (tile center). Between stations, it moves straight ahead on its
current track. Ghosts are trains; tile centers are stations.

**Watch for:** The threshold must be at least `ghost.speed` — if the ghost
moves 1.5 pixels per frame, it can overshoot the center by up to 1.5 pixels.
Setting threshold to `ghost.speed + 1` ensures we never miss a center.

---

## Step 2 — Ghost Moves Randomly

Add a random direction picker and `updateGhost`. The ghost picks a random valid
direction when it reaches a tile center — no targeting, no AI. Just movement.

```js
// The four possible movement directions as {dx, dy} vector pairs.
// Defined once here — reused by both random movement and AI targeting (LAB-07).
const DIRECTIONS = [
  { dx:  0, dy: -1 },  // up
  { dx:  0, dy:  1 },  // down
  { dx: -1, dy:  0 },  // left
  { dx:  1, dy:  0 },  // right
];

// chooseRandomDirection: picks a random valid direction for the ghost.
// "Valid" means: not a wall, and not directly backward (no reversals).
// If no valid direction exists (trapped), returns null.
function chooseRandomDirection(ghost) {
  const currentColumn = pixelToTile(ghost.pixelX);
  const currentRow    = pixelToTile(ghost.pixelY);

  // Build a list of valid directions (no wall, no reversal):
  const validDirections = DIRECTIONS.filter(dir => {
    // A reversal would negate both components of the current direction:
    const isReversal = (dir.dx === -ghost.directionX && dir.dy === -ghost.directionY);
    if (isReversal) return false;

    // Check if the next tile in this direction is passable:
    const nextColumn = currentColumn + dir.dx;
    const nextRow    = currentRow    + dir.dy;
    return isTilePassable(nextColumn, nextRow);
  });

  if (validDirections.length === 0) return null;

  // Pick a random direction from the valid options:
  const randomIndex = Math.floor(Math.random() * validDirections.length);
  return validDirections[randomIndex];
}

// updateGhost: moves one ghost one step.
// Called every frame per ghost.
function updateGhost(ghost) {
  // Move in the current direction:
  ghost.pixelX += ghost.directionX * ghost.speed;
  ghost.pixelY += ghost.directionY * ghost.speed;

  // Check if the ghost has reached a tile center:
  const tileCenterX = tileToPixel(pixelToTile(ghost.pixelX));
  const tileCenterY = tileToPixel(pixelToTile(ghost.pixelY));

  const distFromCenterX = Math.abs(ghost.pixelX - tileCenterX);
  const distFromCenterY = Math.abs(ghost.pixelY - tileCenterY);
  const threshold       = ghost.speed + 1;

  const isAligned = distFromCenterX <= threshold && distFromCenterY <= threshold;

  if (isAligned) {
    // Snap to exact tile center to prevent pixel drift accumulating over time:
    ghost.pixelX = tileCenterX;
    ghost.pixelY = tileCenterY;

    // Choose a new random direction for the next segment:
    const newDirection = chooseRandomDirection(ghost);
    if (newDirection) {
      ghost.directionX = newDirection.dx;
      ghost.directionY = newDirection.dy;
    }
  }
}
```

Update `update()` to call ghost updates:
```js
function update() {
  if (keysHeld['ArrowRight']) { pacman.nextDirX =  1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowLeft'])  { pacman.nextDirX = -1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowDown'])  { pacman.nextDirX =  0; pacman.nextDirY =  1; }
  if (keysHeld['ArrowUp'])    { pacman.nextDirX =  0; pacman.nextDirY = -1; }

  updatePacman();
  checkDotEaten();
  ghosts.forEach(ghost => updateGhost(ghost));   // ← add this
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** The ghost drifts around the maze randomly. It may pass
through walls at first — that is acceptable at this step because we haven't
added wall collision yet. Watch it move tile-by-tile, pausing at each tile
center to choose the next direction.

**In DevTools Console:**
```js
ghosts[0].directionX
ghosts[0].directionY
```
**Expected:** One is ±1, the other is 0 — the ghost is always moving in
exactly one direction at a time.

```js
// Stop the ghost temporarily to inspect:
ghosts[0].speed = 0;
```
Ghost freezes. Set back: `ghosts[0].speed = 1.5`.

---

## Math: `Math.random()` — Uniform Random Number

**What it computes:** A pseudo-random floating-point number in the range
[0, 1) — meaning 0 is possible but 1 is never returned.

**Canonical example — rolling a fair die:** `Math.floor(Math.random() * 6)`
gives 0, 1, 2, 3, 4, or 5 with equal probability — like a 6-sided die.
Each face has 1/6 probability. `Math.floor` chops the decimal, giving an integer.

```js
Math.random()                          // → 0.0 to 0.9999...
Math.floor(Math.random() * 4)          // → 0, 1, 2, or 3
Math.floor(Math.random() * array.length)  // → valid random index into array
```

**Watch for:** `Math.random()` is not truly random — it's pseudo-random
(deterministic given a seed). For game behavior this is fine. For cryptography,
use `crypto.getRandomValues()` instead.

---

## Step 3 — Wall Collision (No Code Change Needed)

Look at `chooseRandomDirection` — it already calls `isTilePassable`. The ghost
only chooses directions that are passable. If `isTilePassable` is correct
(which it is, from LAB-04), the ghost already respects walls.

### SAVE AND TRY

Save. Reload.

**You should see:** The ghost navigates the maze corridors cleanly. It does
not walk through blue walls. It turns at intersections — sometimes left,
sometimes up, whichever random valid direction it picks.

**In DevTools Console:**
```js
// Check if a tile the ghost is near is passable:
isTilePassable(pixelToTile(ghosts[0].pixelX), pixelToTile(ghosts[0].pixelY))
```
**Expected:** `true` — the ghost is always on a passable tile.

**Change something:** Temporarily change `Math.floor(Math.random() * validDirections.length)`
to always return `0` (first valid direction). Ghost always picks the same
ordered direction (up > down > left > right priority). Change it back.

---

## 🎯 Challenge: Make the Ghost Wrap in the Tunnel

**You know:** Pac-Man wraps horizontally when `pixelX < 0` or `pixelX > CANVAS_WIDTH`.
The ghost should do the same.

**Task:** Add tunnel wrapping to `updateGhost` — if the ghost's pixelX
exits the canvas, wrap it to the other side.

**Hint:** Add the same two `if` conditions from `updatePacman` to `updateGhost`.

---

<details>
<summary>▶ Show Solution</summary>

At the end of `updateGhost`, after the alignment check:
```js
  // Tunnel wrapping — same as Pac-Man:
  if (ghost.pixelX < 0)             ghost.pixelX = CANVAS_WIDTH;
  if (ghost.pixelX > CANVAS_WIDTH)  ghost.pixelX = 0;
```

**Key insight:** Wrapping is a reusable rule — the same two lines work for
Pac-Man and for every ghost. When logic can be shared between entities with
the same shape (same fields), that's a sign the entity design is correct.
If wrapping required different code for each entity, the design would be wrong.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Red ghost appears in maze | Visible red circle at ghost spawn |
| Ghost moves (random) | Ghost drifts around without key input |
| Ghost respects walls | Ghost navigates corridors, never enters blue tiles |
| Ghost doesn't reverse | Watch ghost — it never immediately u-turns |
| Pac-Man still works | Arrow keys still move Pac-Man correctly |
| Dots still eaten | Eating dots still scores correctly |

---

## Quick Check Answers

**1. Why draw the ghost before making it move?**
Because Step 1 is immediately testable: open the page, ghost is visible. If it
doesn't appear, the problem is in the draw code — isolated and easy to fix.
If movement was added at the same time, a bug could be in the draw code OR
the movement code OR the update wiring — three places to check instead of one.
The spec's Law 3 says: the minimum code that shows the next thing working.

**2. What is a "tile center" and why only change direction there?**
A tile center is the pixel at the exact middle of a tile:
`tileToPixel(pixelToTile(ghost.pixelX))`. Ghosts that change direction only
at tile centers always enter and exit corridors aligned to the grid. If they
could turn at any pixel, they would try to enter walls diagonally and get
stuck. Tile centers are "safe decision points" where the grid guarantees a
full corridor is available in each valid direction.

**3. What does reusing `isTilePassable` for ghosts say about the function?**
It says the function is **pure** — it only depends on its inputs (column, row)
and the maze data. It has no dependency on what entity is calling it. Pure
functions are reusable because they have no hidden assumptions about who is
asking. This is a software engineering design principle: write functions that
answer a question ("is this tile passable?"), not functions that ask "is Pac-Man
allowed to move here?" The second version would need rewriting for ghosts.

---

## What Is Next — LAB 07

LAB 07 makes the ghost target Pac-Man. You'll learn Manhattan distance — the
natural distance measure for grid-based movement — and write a direction-picking
function that chooses the direction minimizing distance to a target tile.
The ghost changes from random wanderer to determined chaser.

*Continue to Pac-Man V2 — LAB 07 — The Ghost Chases (Manhattan Distance).*
