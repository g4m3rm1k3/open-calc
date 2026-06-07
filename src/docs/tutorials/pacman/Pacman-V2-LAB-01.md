# Pac-Man V2 — LAB 01 — The Canvas and a Moving Square

**Prerequisites:** Basic HTML and JavaScript (variables, functions, if-statements).
No Pac-Man knowledge required. No prior canvas experience required.

**What this lab builds:**
- An HTML file with a canvas element you can see immediately
- A black game area (the screen)
- A yellow square (your future Pac-Man) that moves with the arrow keys

**Time:** 45–60 minutes.

---

> **Quick Check — try to answer before reading:**
> 1. If you draw a rectangle at `(0, 0)` on a canvas, which corner of the screen does it appear at?
> 2. What do you think happens if you don't clear the canvas each frame before drawing?
> 3. `setInterval(fn, 16)` and `requestAnimationFrame(fn)` both call a function repeatedly. Why might one be better for games?
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, you open `index.html` in a browser and see:

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         █                       │
│                                 │
│                                 │
└─────────────────────────────────┘
```

A black rectangle with a yellow square inside. Press an arrow key — the square
slides smoothly in that direction. It stops at the canvas edge.

This is the foundation. Everything in Pac-Man — the maze, the dots, the ghost —
is drawn onto this same canvas using the same game loop you build here.

---

## Concept: The HTML Canvas Element

**What it is:** An HTML element that gives JavaScript a rectangular drawing
surface. Unlike a `<div>` or `<p>`, the canvas has no built-in content — you
draw everything yourself with JavaScript.

**The problem before:** Early browser games used `<div>` elements moved with
CSS — one `<div>` per game object, hundreds of them, slow and inflexible.

**The solution:** One `<canvas>` element, one drawing context, draw everything
each frame.

**Canonical example:** A physical whiteboard. The `<canvas>` tag is the board
mounted on the wall. JavaScript is your hand holding the marker. You can draw
anything, erase it, and draw again. The board itself has no content until you
mark it.

```html
<!-- The canvas: 400 pixels wide, 300 pixels tall -->
<canvas id="gameCanvas" width="400" height="300"></canvas>
```

**Why it matters here:** Every pixel in Pac-Man — maze walls, dots, ghosts,
Pac-Man himself — is drawn onto one canvas element.

**Watch for:** The `width` and `height` attributes on `<canvas>` set the
drawing resolution in pixels. The CSS `width` and `height` stretch the canvas
visually. They are different. Always set both, or use only the HTML attributes
and let CSS handle layout separately.

---

## Step 1 — Create the HTML File

Create a new folder called `pacman-v2`. Inside it, create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pac-Man</title>
  <style>
    body {
      margin: 0;
      background-color: #1a1a2e;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    canvas {
      display: block;
      border: 2px solid #333366;
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script src="main.js"></script>
</body>
</html>
```

### CSS AND SEE

Save. Open `index.html` in your browser (no server needed yet — just
double-click the file).

**You should see:** A dark navy page. A thin bordered rectangle in the center —
the canvas. It has no size yet because `width` and `height` are not set in
the HTML. The border is there so you can confirm the element exists.

**Notice:** The canvas is tiny (default browser size: 300×150 pixels). We'll
set the correct size in the next step when JavaScript runs.

---

## Concept: `canvas.getContext('2d')` — The Drawing Context

**What it is:** A JavaScript object that holds all the drawing tools —
functions to draw rectangles, circles, lines, and text on the canvas.

**The problem before:** Nothing. This is how the canvas API works — you must
request the context before you can draw.

**The solution:** `canvas.getContext('2d')` returns a `CanvasRenderingContext2D`
object. Store it in a variable. Every drawing call goes through this object.

**Canonical example:** The canvas is a whiteboard. `getContext('2d')` is the
act of picking up the marker. You can't draw anything until you have the marker
in hand. Once you have it, every drawing method (`fillRect`, `arc`, `stroke`,
etc.) is a different thing you can do with that marker.

```js
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
// Now ctx is your marker. Every drawing goes through ctx.
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 50, 50);   // draw a red 50×50 square at (10, 10)
```

**Why it matters here:** `ctx` is the only variable you need for every single
drawing operation in this entire game.

**Watch for:** `getContext('2d')` returns `null` if the canvas element is not
found. Always get the element by its exact `id` attribute value.

---

## Concept: The Canvas Coordinate System

**What it is:** A grid where `(0, 0)` is the **top-left** corner. X increases
to the right. Y increases **downward**.

**Canonical example — the whiteboard analogy breaks here:** In math class, Y
goes up (positive is above the X-axis). On a canvas, Y goes down (positive is
below the top edge). This confuses everyone the first time.

```
(0,0) ──────────────────→ X increases right
  │
  │   (100, 50) is 100px right, 50px DOWN from top-left
  │
  ↓
  Y increases DOWN
```

**Why it matters here:** When you move a character "up" on screen, you
**subtract** from its Y position. When you move "down," you **add** to Y.
This will come up in every movement calculation.

**Watch for:** If your object moves in the wrong vertical direction, you
probably have the Y sign backwards.

---

## Step 2 — Set Up the Canvas in JavaScript

Create `main.js` in the same folder as `index.html`:

```js
// ── Canvas setup ───────────────────────────────────────────────────────────────

// Get the canvas element from the HTML by its id.
const canvas = document.getElementById('gameCanvas');

// Request the 2D drawing context — the "marker" for all drawing operations.
const ctx = canvas.getContext('2d');

// Set the canvas drawing resolution.
// These numbers define the pixel grid we draw on.
const CANVAS_WIDTH  = 448;   // 28 tiles × 16 pixels per tile = 448px (standard Pac-Man width)
const CANVAS_HEIGHT = 496;   // 31 tiles × 16 pixels per tile = 496px (standard Pac-Man height)

canvas.width  = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ── Clear and fill with black ──────────────────────────────────────────────────

ctx.fillStyle = '#000000';                          // fillStyle: the color to fill with (persists until changed)
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);   // fill the entire canvas black
```

### SAVE AND TRY

Save both files. Reload `index.html` in the browser.

**You should see:** A large black rectangle in the center of the navy page.
The canvas is now 448×496 pixels.

**In DevTools Console** (press F12, click Console tab):
```js
canvas.width
```
**Expected:** `448`

```js
ctx.fillStyle
```
**Expected:** `'#000000'` — the fill color is stored on the context and persists.

**Change something:** Change `'#000000'` to `'#003300'` (dark green). Save.
Reload. The canvas turns dark green. Change it back to `'#000000'`.

---

## Concept: `ctx.fillStyle` — A Persistent Property

**What it is:** A property on the drawing context that sets the color used for
all subsequent filled shapes. It does not change until you set it again.

**Canonical example — a paint roller:** When you load a roller with blue paint,
everything you paint is blue until you reload it with a different color. You
don't specify the color on each stroke — you set the color once, then apply it.

```js
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 50, 50);    // red square
ctx.fillRect(60, 0, 50, 50);   // also red — fillStyle hasn't changed

ctx.fillStyle = 'blue';
ctx.fillRect(120, 0, 50, 50);  // blue square
```

**Why it matters here:** Every shape in the game requires setting `fillStyle`
before drawing. Forgetting to set it means the previous color is used — often
a surprise.

**Watch for:** Unexpected colors on shapes usually mean you set `fillStyle`
for shape A and forgot to reset it before drawing shape B.

---

## Step 3 — Draw the Player Square

Add below the canvas setup in `main.js`:

```js
// ── Player (Pac-Man placeholder) ───────────────────────────────────────────────

// Player position — stored as pixel coordinates of the top-left corner.
// We start the player near the center of the canvas.
let playerX = CANVAS_WIDTH  / 2 - 8;   // 8 = half of PLAYER_SIZE, to center the square
let playerY = CANVAS_HEIGHT / 2 - 8;

const PLAYER_SIZE  = 16;       // width and height of the square in pixels
const PLAYER_COLOR = '#ffff00'; // yellow — Pac-Man's color

// ── Draw function ──────────────────────────────────────────────────────────────

function render() {
  // Step 1: Fill the entire canvas black — this erases the previous frame.
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Step 2: Draw the player square.
  // fillRect(x, y, width, height) — x,y is the TOP-LEFT corner of the rectangle.
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);
}

// Call render once to show the initial frame.
render();
```

### SAVE AND TRY

Save. Reload.

**You should see:** A yellow square near the center of the black canvas.

**In DevTools Console:**
```js
playerX
playerY
```
**Expected:** Two numbers near 216 and 240 (half the canvas dimensions minus 8).

```js
playerX = 10; render();
```
**Expected:** The yellow square jumps to near the left edge. The canvas clears
and redraws — you can see the "erase then draw" happening.

**Change something:** Change `PLAYER_COLOR` to `'#ff8800'` (orange). Save.
Reload. Square is orange. Change it back to `'#ffff00'`.

---

## Concept: The Game Loop — `requestAnimationFrame`

**What it is:** A browser function that calls your code once before the next
screen repaint — approximately 60 times per second on most monitors.

**The problem before:**

```js
// WRONG: setInterval is not synchronized with the screen's refresh rate.
setInterval(gameLoop, 16);
// If the game takes 17ms to compute one frame, setInterval fires anyway
// and queues up calls — causing stuttering and frozen frames.
```

**The solution:** `requestAnimationFrame` (RAF) tells the browser "call me
when you're about to repaint." If the game is slow, RAF waits — no queue
buildup, no frozen frames.

**Canonical example — a flip-book animator:** You're drawing a flip-book. You
draw one frame. The browser "flips" the page (repaints the screen). Then you
draw the next frame. RAF is the browser tapping your shoulder to say "ready for
the next page." `setInterval` is you drawing frames on a timer regardless of
whether the browser is ready.

```js
function loop() {
  update();    // change game state
  render();    // draw the new state
  requestAnimationFrame(loop);   // ask browser to call loop again next frame
}

requestAnimationFrame(loop);   // start the loop
```

**Why it matters here:** Every game in this series uses this exact pattern.
The loop runs, Pac-Man moves, ghosts move, canvas is redrawn — 60 times per
second.

**Watch for:** If you call `requestAnimationFrame(loop)` inside `loop`, the
loop runs forever. That is intentional. If you forget to call it, the loop
runs once and stops — everything freezes.

---

## Concept: Held Key Input — Tracking Which Keys Are Pressed

**What it is:** A pattern for detecting which keys are currently held down,
not just which key was pressed last.

**The problem before:**

```js
// WRONG: only detects one keypress at a time.
document.addEventListener('keydown', (event) => {
  if (event.code === 'ArrowRight') playerX += 4;
});
// Problem: fires once, then repeats slowly after a OS delay.
// Player movement is jerky, not smooth.
```

**The solution:** Track a set of currently-held keys. On `keydown`, mark the
key as held. On `keyup`, unmark it. Every frame, check which keys are held.

**Canonical example — a light switch vs a button:** A button `keydown` event
is like tapping a button — one action. A held key is like a light switch
held on — continuous state. We need to know "is this switch on right now"
every frame, not "did someone tap it."

```js
// The set of key codes currently being held down.
const keysHeld = {};

document.addEventListener('keydown', (event) => {
  keysHeld[event.code] = true;   // mark this key as held
});

document.addEventListener('keyup', (event) => {
  keysHeld[event.code] = false;  // mark this key as released
});

// In the game loop:
function update() {
  if (keysHeld['ArrowRight']) playerX += PLAYER_SPEED;
}
```

**`event.code`:** The physical key identifier — `'ArrowLeft'`, `'ArrowRight'`,
`'ArrowUp'`, `'ArrowDown'`, `'Space'`, etc. Use `event.code` not `event.key`
for movement keys — `event.key` can vary by keyboard layout.

**Why it matters here:** Pac-Man moves smoothly because we check held keys
every frame. The ghost AI also responds to Pac-Man's held direction, not
just the last key that was pressed.

**Watch for:** `keysHeld[key]` is `undefined` (not `false`) for keys that
were never pressed. The condition `if (keysHeld['ArrowRight'])` treats
`undefined` as false — this is intentional. Do not initialize all keys to
false; just check truthiness.

---

## Step 4 — Add the Game Loop and Keyboard Input

Replace the `render()` call at the bottom of `main.js` with:

```js
// ── Keyboard input ─────────────────────────────────────────────────────────────

// keysHeld: an object where keys are key codes (strings) and values are true/false.
// true = this key is currently held down.
const keysHeld = {};

document.addEventListener('keydown', (event) => {
  keysHeld[event.code] = true;
  event.preventDefault();   // prevent arrow keys from scrolling the page
});

document.addEventListener('keyup', (event) => {
  keysHeld[event.code] = false;
});

// ── Player movement constants ──────────────────────────────────────────────────

const PLAYER_SPEED = 3;   // pixels per frame the player moves

// ── Update function ────────────────────────────────────────────────────────────

function update() {
  // Check which arrow keys are held and move the player.
  // Y is inverted: ArrowUp subtracts from Y (moves toward top of canvas).
  if (keysHeld['ArrowRight']) playerX += PLAYER_SPEED;
  if (keysHeld['ArrowLeft'])  playerX -= PLAYER_SPEED;
  if (keysHeld['ArrowDown'])  playerY += PLAYER_SPEED;
  if (keysHeld['ArrowUp'])    playerY -= PLAYER_SPEED;

  // Keep the player inside the canvas using Math.max and Math.min.
  // Math.max(0, playerX) prevents playerX from going below 0 (left edge).
  // Math.min(CANVAS_WIDTH - PLAYER_SIZE, playerX) prevents going past the right edge.
  playerX = Math.max(0, Math.min(CANVAS_WIDTH  - PLAYER_SIZE, playerX));
  playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, playerY));
}

// ── Game loop ──────────────────────────────────────────────────────────────────

function gameLoop() {
  update();   // 1. update state (move things, check input)
  render();   // 2. draw the new state
  requestAnimationFrame(gameLoop);   // 3. ask browser to call gameLoop again next frame
}

// Start the loop.
requestAnimationFrame(gameLoop);
```

### SAVE AND TRY

Save. Reload.

**You should see:** The yellow square in the center. Press an arrow key — it
moves smoothly in that direction. Hold it — it keeps moving. It stops at the
canvas edge.

**In DevTools Console:**
```js
keysHeld
```
Hold an arrow key while checking — **Expected:** `{ArrowRight: true}` or
similar. Release the key — object shows `false`.

```js
playerX = 0; playerY = 0;
```
**Expected:** Square jumps to top-left corner on the next frame (update and
render are still running).

**Change something:** Change `PLAYER_SPEED = 3` to `PLAYER_SPEED = 10`. Save.
Reload. Square moves much faster. Change it back to `3`.

---

## 🎯 Challenge: Add Canvas Edge Bounce

**You know:** `playerX` and `playerY` are updated in `update()`.
The clamping currently stops the player at the edge.

**Task:** Instead of stopping, make the square bounce — when it hits the
right edge, it reverses horizontal direction and moves left. When it hits the
left edge, it reverses back to right. Same for top and bottom.

**Starting code (current clamping section):**
```js
playerX = Math.max(0, Math.min(CANVAS_WIDTH  - PLAYER_SIZE, playerX));
playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, playerY));
```

You'll need to store the current movement direction as variables, not read
directly from `keysHeld`.

**Hints:**
1. Add `let autoVelocityX = 2` and `let autoVelocityY = 2` near the player state.
2. In `update()`, add `playerX += autoVelocityX` and `playerY += autoVelocityY`.
3. When `playerX` reaches the right or left edge, multiply `autoVelocityX` by `-1` to reverse it.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

Add near the player variables:
```js
let autoVelocityX = 2;
let autoVelocityY = 2;
```

In `update()`, before or instead of the clamping code:
```js
// Auto movement (remove keyboard movement if you want pure bounce):
playerX += autoVelocityX;
playerY += autoVelocityY;

// Bounce at edges: reverse velocity when hitting a wall.
if (playerX <= 0 || playerX >= CANVAS_WIDTH - PLAYER_SIZE) {
  autoVelocityX *= -1;   // flip direction
  // Clamp position so the square doesn't escape the canvas:
  playerX = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_SIZE, playerX));
}
if (playerY <= 0 || playerY >= CANVAS_HEIGHT - PLAYER_SIZE) {
  autoVelocityY *= -1;
  playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, playerY));
}
```

**Key insight:** `velocity *= -1` is the simplest physics simulation — reversing
a velocity makes an object bounce. The same formula works for bullets, balls,
and any object that should reflect off a surface. You will use this again in
the 2D Asteroids series when bullets wrap, and in the 3D series for reflection vectors.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Black canvas visible | Open `index.html` — black rectangle on navy background |
| Canvas is 448×496 pixels | DevTools Console: `canvas.width` → 448, `canvas.height` → 496 |
| Yellow square visible | Square appears near center of black canvas |
| Arrow keys move the square | Hold any arrow key — smooth movement |
| Square stops at edges | Move to any edge — stops, does not escape |
| Game loop running | Square still visible after 30 seconds — loop hasn't stopped |
| `keysHeld` tracks state | Console: hold key, check `keysHeld` object |

---

## Quick Check Answers

**1. If you draw a rectangle at `(0, 0)`, which corner does it appear at?**
The top-left corner. Canvas coordinates start at `(0, 0)` in the top-left.
X increases to the right, Y increases downward. This is the opposite of the
Y-axis in math class (where Y goes up). `ctx.fillRect(0, 0, 50, 50)` draws a
50×50 square flush against the top-left corner.

**2. What happens if you don't clear the canvas each frame?**
Every frame's drawing stacks on top of the previous frame. If the square moves
right, you see a trail of yellow rectangles across the screen — every position
the square has ever been in, still drawn. The `ctx.fillRect(0, 0, width, height)`
call at the start of `render()` erases everything so only the current frame
is visible.

**3. Why is `requestAnimationFrame` better than `setInterval` for games?**
`setInterval` fires on a fixed timer regardless of whether the browser is
ready to repaint. If a frame takes longer than expected, calls queue up and
the game stutters or freezes. `requestAnimationFrame` only calls your function
when the browser is about to repaint the screen — it automatically pauses when
the tab is in the background and syncs to the monitor's refresh rate (60hz,
144hz, etc.), giving smooth animation and no wasted CPU.

---

## What Is Next — LAB 02

LAB 02 introduces the **tile grid** — converting the canvas into a map of
rows and columns. This is the foundational data structure for the entire game.
The maze, dots, walls, and ghost positions are all stored as tile coordinates,
not pixel coordinates. You will learn the `pixelToTile` and `tileToPixel`
coordinate transforms — and why having two coordinate spaces (pixels for
drawing, tiles for logic) is a design pattern that appears in CAD software,
game engines, and mapping applications.

*Continue to Pac-Man V2 — LAB 02 — The Tile Grid and Coordinate Spaces.*
