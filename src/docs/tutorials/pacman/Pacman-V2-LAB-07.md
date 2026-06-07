# Pac-Man V2 — LAB 07 — The Ghost Chases (Manhattan Distance)

**Prerequisites:** LAB 06 — Ghost wanders randomly through the maze.

**What this lab builds:**
- The Manhattan distance formula for grid math
- Target-based direction selection (Ghost AI)
- The ghost stops wandering randomly and starts chasing Pac-Man directly

**Time:** 45–60 minutes.

---

> **Quick Check — try to answer before reading:**
> 1. In a city grid, why is the straight-line distance (bird flies) between two intersections shorter than the driving distance?
> 2. The ghost wants to reach Pac-Man. When it arrives at an intersection, how does it use distance to decide which way to turn?
> 3. Does the ghost need to check every path all the way to Pac-Man, or just the immediate next tiles?
> *(Answers at the end of this lab)*

---

## What You Will Build

The ghost's movement changes from random to intelligent. When it reaches a
tile center, it calculates which of the valid neighboring tiles is closest to
Pac-Man, and picks that direction. It will actively chase you.

---

## Math: Manhattan Distance

**What it computes:** The distance between two points measured along axes at
right angles.

**The real-world analogy:** Taxicab geometry. If you are driving a taxi in
Manhattan, you cannot drive diagonally through skyscrapers. You must drive
horizontal blocks, then vertical blocks. The distance is the sum of the
horizontal distance and vertical distance.

**Canonical example:** Two points on a grid. Point A is at (0, 0). Point B
is at (3, 4).
- The straight-line "crow-flies" distance is 5 (a 3-4-5 right triangle).
- The Manhattan distance is 3 + 4 = 7 blocks.

  ```text
  A ── 1 ── 2 ── 3
                 │
                 4
                 │
                 5
                 │
                 6
                 │
                 B(7)
  ```
  `distance = abs(x2 - x1) + abs(y2 - y1)`
  `distance = Math.abs(3 - 0) + Math.abs(4 - 0) = 7`

**Why it matters here:** Pac-Man and ghosts are bound to a grid. They can
only move horizontally and vertically. Therefore, the true distance between
two tiles in the maze is the Manhattan distance, not the straight-line distance.

**Watch for:** Do not use the Pythagorean theorem (Euclidean distance) for grid
pathfinding. It undervalues diagonal paths that don't actually exist in a maze.

---

## Logic: Choosing the Minimum Distance

**What it decides:** Which of the 4 possible directions puts the ghost closest
to its target?

**Truth table or plain-English breakdown:**
  Check UP: next tile distance = 10
  Check DOWN: next tile distance = 12
  Check LEFT: next tile distance = 9
  Check RIGHT: (Wall - invalid)
  Result: Pick LEFT (9 is the minimum distance).

**Canonical example:** You are at an intersection. You pull out your GPS. You
check the estimated time from the intersection to your destination via the
North road (10 mins), South road (12 mins), and West road (9 mins). You turn West.

**The code:**
```js
let bestDirection = null;
let bestDistance = Infinity;

for (const dir of validDirections) {
  const dist = tileDistance(nextTileX, nextTileY, targetX, targetY);
  if (dist < bestDistance) {
    bestDistance = dist;
    bestDirection = dir;
  }
}
```

**Watch for:** `Infinity` is a built-in JS number. We use it as the starting
value for `bestDistance` so that the very first valid direction checked will
always be smaller and become the new `bestDistance`.

---

## Step 1 — Add the Manhattan Distance Function

Add this helper function anywhere before `chooseTargetDirection`:

```js
// ── Ghost AI Helpers ─────────────────────────────────────────────────────────

// tileDistance: Computes the Manhattan distance between two tile coordinates.
// Used by ghosts to determine which neighboring tile is closest to their target.
function tileDistance(column1, row1, column2, row2) {
  return Math.abs(column2 - column1) + Math.abs(row2 - row1);
}
```

### SAVE AND TRY

Save. Reload.

**In DevTools Console:**
```js
tileDistance(0, 0, 3, 4)
```
**Expected:** `7`

```js
tileDistance(10, 10, 10, 10)
```
**Expected:** `0` (distance to yourself is 0)

---

## Step 2 — Choose Direction by Target

Replace the old `chooseRandomDirection` function with a new function called
`chooseDirectionToTarget`. It uses the logic we just defined.

```js
// chooseDirectionToTarget: AI logic for picking the next path.
// Tries all valid directions (no walls, no reversals) and picks the one
// that minimizes the Manhattan distance to the target tile.
function chooseDirectionToTarget(ghost, targetColumn, targetRow) {
  const currentColumn = pixelToTile(ghost.pixelX);
  const currentRow    = pixelToTile(ghost.pixelY);

  // Build list of valid directions (same as random logic)
  const validDirections = DIRECTIONS.filter(dir => {
    const isReversal = (dir.dx === -ghost.directionX && dir.dy === -ghost.directionY);
    if (isReversal) return false;

    const nextColumn = currentColumn + dir.dx;
    const nextRow    = currentRow    + dir.dy;
    return isTilePassable(nextColumn, nextRow);
  });

  if (validDirections.length === 0) return null; // Trapped

  let bestDirection = null;
  let bestDistance  = Infinity;

  // Evaluate each valid direction:
  for (const dir of validDirections) {
    const nextColumn = currentColumn + dir.dx;
    const nextRow    = currentRow    + dir.dy;

    // How far is the NEXT tile from the TARGET tile?
    const distanceToTarget = tileDistance(nextColumn, nextRow, targetColumn, targetRow);

    if (distanceToTarget < bestDistance) {
      bestDistance  = distanceToTarget;
      bestDirection = dir;
    }
  }

  return bestDirection;
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** The ghost is still moving randomly! Why? Because we haven't
updated `updateGhost` to use our new function yet. `chooseRandomDirection` is
still being called (or we replaced the function but `updateGhost` is calling the old name, causing an error).

**In DevTools Console:**
Check for errors. If you deleted `chooseRandomDirection`, the console will show
a ReferenceError. We will fix this in Step 3.

---

## Step 3 — Wire the Ghost to Chase Pac-Man

Update `updateGhost` to call the new function, targeting Pac-Man's tile:

```js
// updateGhost: moves one ghost one step.
function updateGhost(ghost) {
  ghost.pixelX += ghost.directionX * ghost.speed;
  ghost.pixelY += ghost.directionY * ghost.speed;

  const tileCenterX = tileToPixel(pixelToTile(ghost.pixelX));
  const tileCenterY = tileToPixel(pixelToTile(ghost.pixelY));

  const distFromCenterX = Math.abs(ghost.pixelX - tileCenterX);
  const distFromCenterY = Math.abs(ghost.pixelY - tileCenterY);
  const threshold       = ghost.speed + 1;

  const isAligned = distFromCenterX <= threshold && distFromCenterY <= threshold;

  if (isAligned) {
    ghost.pixelX = tileCenterX;
    ghost.pixelY = tileCenterY;

    // TARGET PAC-MAN:
    const pacmanColumn = pixelToTile(pacman.pixelX);
    const pacmanRow    = pixelToTile(pacman.pixelY);

    // Call our new AI function:
    const newDirection = chooseDirectionToTarget(ghost, pacmanColumn, pacmanRow);
    
    if (newDirection) {
      ghost.directionX = newDirection.dx;
      ghost.directionY = newDirection.dy;
    }
  }

  // Tunnel wrapping (unchanged)
  if (ghost.pixelX < 0)             ghost.pixelX = CANVAS_WIDTH;
  if (ghost.pixelX > CANVAS_WIDTH)  ghost.pixelX = 0;
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** The ghost spawns and immediately takes the shortest path
through the maze to reach Pac-Man. It follows you relentlessly.

**Change something:** In `updateGhost`, change the target to `0, 0` (the top-left corner of the maze):
`const newDirection = chooseDirectionToTarget(ghost, 0, 0);`
Save. Reload. The ghost will ignore Pac-Man and navigate directly to the
top-left corner, and then get stuck or circle the area. Change it back to target Pac-Man.

---

## 🎯 Challenge: A Debug Target Marker

**You know:** It's hard to see what a ghost is thinking. We can draw things to debug.

**Task:** In `render()`, after drawing the maze, draw a faint red square on the
tile that the ghost is currently targeting (Pac-Man's tile).

**Hints:**
1. Pac-Man's tile is `pixelToTile(pacman.pixelX)`, `pixelToTile(pacman.pixelY)`.
2. Convert back to pixels with `* TILE_SIZE` to get the top-left corner of the tile.
3. Draw a `fillRect` with `fillStyle = 'rgba(255, 0, 0, 0.5)'`.

---

<details>
<summary>▶ Show Solution</summary>

In `render()`, before `drawPacman()`:
```js
  // Debug: draw ghost target
  const pacCol = pixelToTile(pacman.pixelX);
  const pacRow = pixelToTile(pacman.pixelY);
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.fillRect(pacCol * TILE_SIZE, pacRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
```

**Key insight:** Visualizing AI targets is the standard way to debug pathfinding.
When we add more ghosts with different personalities in LAB-10, they will target
different tiles (e.g., ahead of Pac-Man, or the bottom-left corner). Seeing the
targets rendered on screen proves the math works.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `tileDistance` works | Console test yields correct Manhattan distance |
| Ghost chases Pac-Man | Ghost navigates directly toward Pac-Man |
| No random wandering | Ghost never makes a turn that leads away from Pac-Man (unless forced by walls/no-reversal rule) |
| Ghost respects walls | Pathfinding only considers valid paths |

---

## Quick Check Answers

**1. Why is straight-line distance shorter than driving distance on a grid?**
Straight-line distance (Euclidean) cuts across diagonals. On a grid, you can
only move strictly horizontally or vertically, forcing you to trace the edges
of a bounding box. The driving distance (Manhattan) is the sum of horizontal
and vertical legs.

**2. How does the ghost use distance to decide which way to turn?**
It asks: "If I take the UP path, what is the Manhattan distance from that NEXT
tile to Pac-Man's tile?" It does this for all valid directions, compares the
results, and picks the direction with the smallest resulting distance.

**3. Does the ghost check every path all the way to Pac-Man?**
No! This is "greedy" pathfinding. It only looks one tile ahead and picks the
best option *right now*. It does not calculate the full path to the destination
(like A* pathfinding would). Classic Pac-Man uses this exact greedy algorithm
because it is extremely fast and produces predictable, somewhat flawed movement
that feels fair to the player.

---

## What Is Next — LAB 08

LAB 08 deals with the consequences of the ghost catching you. We'll implement
collision detection using Euclidean distance (circle-to-circle collision) to
detect when Pac-Man and the ghost touch.

*Continue to Pac-Man V2 — LAB 08 — Ghost Catches Pac-Man (Euclidean Distance).*
