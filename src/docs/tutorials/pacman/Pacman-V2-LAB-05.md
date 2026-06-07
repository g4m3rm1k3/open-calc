# Pac-Man V2 — LAB 05 — Dots, Eating, and Score

**Prerequisites:** LAB 04 — Pac-Man moves through the maze with wall collision.

**What this lab builds:**
- Small dots drawn in every path tile
- Pac-Man eats dots as he passes over them
- Score that updates when a dot is eaten
- Score displayed on screen
- The Set data structure for tracking eaten dots

**Time:** 45–60 minutes.

---

> **Quick Check — try to answer before reading:**
> 1. The maze has ~240 dots. If you use an array to track eaten dots, why might searching it every frame be slow?
> 2. `Set.has(key)` vs `Array.includes(value)` — what's different?
> 3. How do you know when Pac-Man is "on" a dot tile vs just "near" it?
> *(Answers at the end of this lab)*

---

## What You Will Build

Small white dots fill every path tile. As Pac-Man moves over them, they
disappear and the score counter in the top-left increments by 10.

---

## Concept: The Set Data Structure

**What it is:** A collection of unique values where membership can be checked
in constant time — checking if a value is in the Set takes the same time
whether the Set has 1 item or 10,000 items.

**The problem before:** Using an array of eaten dot positions:
```js
const eatenDots = [];
// To check if a dot was eaten, search the whole array:
eatenDots.includes('14,21')  // scans ALL eaten dots — gets slower as you eat more
```

**The solution:** A `Set` — designed exactly for "is this in the collection?" checks:
```js
const eatenDots = new Set();
eatenDots.add('14,21');   // add the dot at tile (14,21)
eatenDots.has('14,21');   // instant check — always O(1), regardless of Set size
```

**Canonical example — a guest list with a highlighter:** A nightclub bouncer
with an alphabetically sorted list and a highlighter. Each guest's name gets
highlighted when they arrive. Checking if someone has arrived means looking
for their highlighted name — instant if you know where to look (no scanning
from the beginning). A Set is that highlighted list — membership checks are
always instant.

**The key-as-string pattern:** `'column,row'` converts a 2D tile position to
a unique string key. `'14,21'` means tile column 14, row 21. No two tiles share
the same key because no two tiles have the same column AND row.

```js
function dotKey(column, row) {
  return `${column},${row}`;
}
```

**Why it matters here:** 240 dots, checked 60 times per second = 14,400 checks
per second. With an Array, that's up to 240 × 14,400 = 3.4M comparisons/second.
With a Set, it's 14,400 instant lookups. Sets are the right tool for membership.

**Watch for:** A Set only stores each value once — adding the same key twice
has no effect. This is exactly what we want: eating a dot twice doesn't double
its effect.

---

## Step 1 — Build the Set of All Dot Positions

Add this code after the `maze` array definition, before the game loop:

```js
// ── Dot system ─────────────────────────────────────────────────────────────────

// dotKey: creates a unique string identifier for a tile position.
// Used as a key in the eatenDots Set.
// Example: dotKey(14, 21) = '14,21'
function dotKey(column, row) {
  return `${column},${row}`;
}

// eatenDots: a Set of dot keys that have been eaten.
// Starts empty — no dots have been eaten yet.
// When Pac-Man eats a dot, its key is added here.
const eatenDots = new Set();

// Score: increases by 10 each time a dot is eaten.
let score = 0;
```

### SAVE AND TRY

Save. Reload.

**In DevTools Console:**
```js
eatenDots.size
```
**Expected:** `0` — no dots eaten yet.

```js
eatenDots.add('14,21');
eatenDots.has('14,21');
```
**Expected:** `true` — the key is now in the Set.

```js
eatenDots.has('0,0');
```
**Expected:** `false` — not in the Set.

---

## Step 2 — Draw the Dots

Add a `drawDots` function that loops through the maze and draws a small circle
at every dot tile that has NOT been eaten:

```js
const DOT_RADIUS   = 2;     // small dot radius in pixels
const DOT_COLOR    = '#ffb8ae'; // slightly pink-white — classic Pac-Man dot color

// drawDots: draws a small circle at every TILE_DOT tile that is not in eatenDots.
function drawDots() {
  for (let row = 0; row < MAZE_ROWS; row++) {
    for (let column = 0; column < MAZE_COLUMNS; column++) {

      // Only draw dots in TILE_DOT tiles:
      if (maze[row][column] !== TILE_DOT) continue;

      // Skip dots that have already been eaten:
      if (eatenDots.has(dotKey(column, row))) continue;

      // The dot is drawn at the CENTER of the tile:
      const dotPixelX = tileToPixel(column);
      const dotPixelY = tileToPixel(row);

      ctx.beginPath();
      ctx.arc(dotPixelX, dotPixelY, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = DOT_COLOR;
      ctx.fill();
    }
  }
}
```

Update `render()`:
```js
function render() {
  ctx.fillStyle = COLOR_PATH;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawMaze();
  drawDots();     // ← add this, after maze and before Pac-Man
  drawPacman();
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** Small white/pink dots filling all the paths in the maze.
Pac-Man can move over them — they don't disappear yet (eating comes next).

**In DevTools Console:**
```js
// Manually eat the dot at tile (1,1) and watch it disappear:
eatenDots.add(dotKey(1, 1));
```
**Expected:** The dot at (1,1) disappears immediately on the next frame.

---

## Concept: When Is Pac-Man "On" a Tile?

**What it is:** The rule that determines when Pac-Man has eaten a dot — when
his position is close enough to the dot's tile center.

**The problem before:** Checking if Pac-Man's pixel position exactly equals
the dot's pixel position — this almost never happens because Pac-Man moves
1.5 pixels per frame, so he usually skips over the exact center pixel.

**The solution:** Check if Pac-Man's CENTER tile matches the dot's tile. Two
entities are "on the same tile" when `pixelToTile(pacman.pixelX)` equals the
dot's column AND `pixelToTile(pacman.pixelY)` equals the dot's row.

**Canonical example — a checkerboard:** A chess piece "occupies" a square
when it is physically anywhere within that square's boundaries. You don't need
the piece to be exactly centered — just inside the square's borders. Tile-based
collision works the same way: if `pixelToTile` puts you in tile (5, 3), you
occupy tile (5, 3) for all game-logic purposes.

```js
const pacmanColumn = pixelToTile(pacman.pixelX);
const pacmanRow    = pixelToTile(pacman.pixelY);

if (maze[pacmanRow][pacmanColumn] === TILE_DOT) {
  const key = dotKey(pacmanColumn, pacmanRow);
  if (!eatenDots.has(key)) {
    eatenDots.add(key);
    score += 10;
  }
}
```

**Watch for:** This check runs every frame. The `if (!eatenDots.has(key))`
guard is critical — without it, Pac-Man scores 10 points every frame while
standing on a dot tile (60 points per second from one dot!).

---

## Step 3 — Eat Dots

Add a `checkDotEaten` function and call it from `update`:

```js
const DOT_POINTS = 10;    // score value of a single dot

// checkDotEaten: checks if Pac-Man's current tile has an uneaten dot.
// If yes, marks the dot as eaten and increases score.
// Called every frame from update().
function checkDotEaten() {
  const pacmanColumn = pixelToTile(pacman.pixelX);
  const pacmanRow    = pixelToTile(pacman.pixelY);

  // Only check dot tiles:
  if (maze[pacmanRow][pacmanColumn] !== TILE_DOT) return;

  const key = dotKey(pacmanColumn, pacmanRow);

  // Guard: skip if this dot was already eaten:
  if (eatenDots.has(key)) return;

  // Eat the dot:
  eatenDots.add(key);
  score += DOT_POINTS;
}
```

Add the call to `update()`:

```js
function update() {
  if (keysHeld['ArrowRight']) { pacman.nextDirX =  1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowLeft'])  { pacman.nextDirX = -1; pacman.nextDirY =  0; }
  if (keysHeld['ArrowDown'])  { pacman.nextDirX =  0; pacman.nextDirY =  1; }
  if (keysHeld['ArrowUp'])    { pacman.nextDirX =  0; pacman.nextDirY = -1; }

  updatePacman();
  checkDotEaten();   // ← add this
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** Move Pac-Man over dots — they disappear as he passes through them.

**In DevTools Console:**
```js
score
```
**Expected:** Current score — increases by 10 per dot eaten.

```js
eatenDots.size
```
**Expected:** Number of dots eaten so far.

---

## Step 4 — Display the Score

Add a `drawScore` function and call it from `render`. The score must be drawn
LAST so it appears on top of everything:

```js
// drawScore: renders the current score in the top-left corner of the canvas.
// ctx.fillText(text, x, y) draws text at the given pixel position.
// y is the BASELINE of the text (bottom of most characters).
function drawScore() {
  ctx.fillStyle = '#ffffff';           // white text
  ctx.font      = 'bold 14px Arial';  // bold, 14px, Arial font
  ctx.fillText(`SCORE  ${score}`, 8, 16);
}
```

Update `render()`:
```js
function render() {
  ctx.fillStyle = COLOR_PATH;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawMaze();
  drawDots();
  drawPacman();
  drawScore();   // ← last — renders on top of everything
}
```

### SAVE AND TRY

Save. Reload.

**You should see:** "SCORE  0" in white text at the top-left. Eat dots — score
increments by 10 each time.

**In DevTools Console:**
```js
score = 9990;
```
**Expected:** Score display jumps to 9990 immediately.

**Change something:** Change `DOT_POINTS = 10` to `DOT_POINTS = 100`. Save.
Score increases by 100 per dot. Change back.

---

## Concept: `ctx.fillText` — Drawing Text on Canvas

**What it is:** Draws a string of text at a given pixel position, using the
font and fill color currently set on the context.

**`ctx.font` format:** `'[style] [size] [family]'` — e.g. `'bold 14px Arial'`.
The size and family are required. Style (`bold`, `italic`) is optional.

**Watch for:** The `y` parameter of `fillText` is the text **baseline**, not
the top-left corner. A 14px font at y=0 draws above the canvas — set y to at
least 14 to see it. Set y=16 for a 14px font to see the full text at the
top of the canvas.

**Canonical example — a rubber stamp:** You set the ink color (`fillStyle`),
choose the stamp font and size (`font`), then press down at a position
(`fillText(text, x, y)`). The stamp leaves text at exactly that position.
Next call uses the same ink unless you change `fillStyle` again.

---

## 🎯 Challenge: Win Condition — All Dots Eaten

**You know:** `eatenDots` is a Set. You can count dots in the maze by scanning
for `TILE_DOT` tiles. When `eatenDots.size` equals the total dot count, all
dots have been eaten.

**Task:** Count the total number of dot tiles in the maze array (once, before
the game loop). In `checkDotEaten`, after incrementing score, check if
`eatenDots.size` equals the total dot count. If yes, log "YOU WIN!" to the
console. (Full win screen comes in LAB-08.)

**Hint:** Count dots the same way you counted walls in LAB-03's challenge —
nested loop checking for `TILE_DOT`.

---

<details>
<summary>▶ Show Solution</summary>

Before the game loop, count total dots:
```js
let totalDots = 0;
for (let row = 0; row < MAZE_ROWS; row++) {
  for (let column = 0; column < MAZE_COLUMNS; column++) {
    if (maze[row][column] === TILE_DOT) totalDots += 1;
  }
}
```

In `checkDotEaten`, after `score += DOT_POINTS`:
```js
if (eatenDots.size === totalDots) {
  console.log('YOU WIN! Score:', score);
  // Full win screen and level reset comes in LAB-08.
}
```

**Key insight:** Counting at startup is more efficient than counting inside
the game loop. Data that doesn't change should be computed once, not every
frame. This is the "precompute" pattern — important in game engines, compilers,
and CAD constraint solvers where some calculations are expensive.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Dots visible in maze | Small circles on all path tiles |
| Dots disappear when eaten | Move Pac-Man over them — dots vanish |
| Score increments by 10 | Eat dots — "SCORE" display updates |
| Score visible on screen | White text top-left of canvas |
| `eatenDots.has(key)` guard works | Eat a dot, move away, return — score doesn't double |
| Console: `score` is correct | DevTools: `score` matches displayed value |

---

## Quick Check Answers

**1. Why is an Array slow for tracking eaten dots?**
`Array.includes` searches the array from start to end — O(n) time. After eating
100 dots, each "is this dot eaten?" check scans up to 100 entries. With 240 dots
and 60 checks per second, that's up to 14,400 linear scans per second. A Set
checks membership in O(1) constant time — one operation, always, regardless of
how many dots are in the Set.

**2. `Set.has(key)` vs `Array.includes(value)` — what's different?**
Both check membership, but `Set.has` is O(1) (instant) and `Array.includes`
is O(n) (proportional to array length). Also, a Set automatically prevents
duplicates — adding the same key twice leaves one entry. An array would have
two entries of the same value. Sets are the right structure when you care about
membership and uniqueness, not about order or position.

**3. How do you know Pac-Man is "on" a dot tile?**
By converting his pixel position to tile coordinates with `pixelToTile`. If
`pixelToTile(pacman.pixelX) === dotColumn` AND `pixelToTile(pacman.pixelY) === dotRow`,
Pac-Man is in that tile's grid cell. He doesn't have to be at the exact center —
any pixel position within the tile's 16×16 area maps to the same tile via `Math.floor`.

---

## What Is Next — LAB 06

LAB 06 adds the first ghost — but in the correct order. Step 1: the ghost
appears (just drawn, visible). Step 2: the ghost moves randomly using modulo
wrapping. Step 3: the ghost cannot pass through walls. The ghost AI, collision
with Pac-Man, and frightened mode are each their own step — not bundled together
before anything can be tested.

*Continue to Pac-Man V2 — LAB 06 — The First Ghost (Visible and Moving).*
