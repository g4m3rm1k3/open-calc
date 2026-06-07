# 2D Asteroids — LAB 01 — A Dot That Moves

**What this lab builds:** A white circle that moves across a black canvas and
wraps to the other side when it reaches an edge. No ship, no bullets, no
asteroids yet — just one moving object and the complete game loop infrastructure.

**Why start with a dot:** Every game in this series is built on three pieces:
state, update, and render. A moving dot needs all three. Once you can move a
dot, you can move anything.

**What you will learn in this lab:**
- The canvas element and what a drawing context is
- `requestAnimationFrame` — how games loop without blocking the browser
- The update-then-render pattern
- How the canvas coordinate system works (Y goes down, not up)

**Time:** 45–60 minutes.

---

## What You Will Build

Open `index.html` in your browser. You see:
- A solid black rectangle
- A white circle moving from left to right
- When the circle reaches the right edge, it appears at the left edge again

Nothing responds to keyboard input yet. The circle moves on its own. That
single moving circle proves the entire game loop works.

---

## Project Setup

Create a new folder called `asteroids`. Inside it, create two empty files:

```
asteroids/
  index.html
  main.js
```

Open both files in your editor. Leave them empty for now — we fill them step by step.

---

## Concept: The `<canvas>` Element

**What it is:** An HTML element that gives JavaScript a rectangular area to
draw on. Unlike other HTML elements (`<p>`, `<div>`, `<button>`), a canvas does
not display any content by default. It is a blank rectangle — a pixel grid
you control entirely with JavaScript.

**The problem before it existed:** Before canvas (pre-2010), web pages could
only show static HTML and CSS. To draw a circle, you had to use a `<div>` with
border-radius. Games were impossible without browser plugins (Flash, Silverlight).

**The solution:** `<canvas>` exposes a drawing API. JavaScript calls functions
like `ctx.fillRect(x, y, width, height)` and pixels appear on screen.

**Minimal example:**
```html
<canvas id="my-canvas" width="400" height="300"></canvas>
```

```js
const canvas = document.getElementById('my-canvas');
// canvas is the HTML element — like picking up a physical canvas.
// It has .width and .height properties, and you can set its size.
```

**The width and height attributes matter:**
```html
<!-- These are NOT the same thing: -->

<canvas width="800" height="600"></canvas>
<!-- This sets the actual pixel grid — 800×600 pixels to draw on. -->

<canvas style="width: 800px; height: 600px;"></canvas>
<!-- This sets the CSS display size but the canvas itself is 300×150 by default. -->
<!-- Drawing at 400,400 would be outside the canvas — nothing appears. -->
```

Always set `width` and `height` as HTML attributes (or in JavaScript via
`canvas.width = 800`), not as CSS styles.

**Watch for:** The canvas coordinate origin `(0, 0)` is the **top-left corner**.
X increases going **right**. Y increases going **down**. This is the opposite
of the math you learned in school where Y goes up. Every canvas calculation
in this series uses this coordinate system.

```
(0, 0) ──────────────── (width, 0)
   │                          │
   │    positive Y is DOWN    │
   │                          │
(0, height) ──────── (width, height)
```

---

## Concept: `canvas.getContext('2d')`

**What it is:** The method that returns a drawing context — the object with
all the drawing functions (`fillRect`, `arc`, `fill`, etc.).

**Why you call it:** A canvas element alone cannot draw anything. You need a
context — a specific drawing mode. `'2d'` gives you 2D drawing functions.
(There is also `'webgl'` for 3D graphics — that is what Three.js uses in the
Asteroids 3D series.)

**Example — smallest possible:**
```js
const canvas = document.getElementById('my-canvas');
const ctx    = canvas.getContext('2d');
// ctx is the object with all drawing methods.
// Every drawing call goes through ctx.

ctx.fillStyle = '#ff0000';          // set fill color to red
ctx.fillRect(10, 10, 100, 50);     // draw a red rectangle
// fillRect(x, y, width, height) — top-left corner at (10, 10), 100px wide, 50px tall
```

**Why `ctx` and not the canvas directly:** The canvas stores the pixel data.
The context provides the drawing commands. You talk to the context to draw;
the result appears on the canvas.

**Watch for:** `canvas.getContext('2d')` returns `null` if the canvas does not
exist in the DOM yet, or if you spelled the ID wrong. If ctx is null, every
drawing call will crash with "Cannot read property 'fillRect' of null." Check
the ID spelling first.

---

## Step 1 — The HTML Structure

Open `index.html` and type this exactly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asteroids</title>
  <style>

    /* Remove default browser margins and make the page fill the window. */
    *, *::before, *::after {
      margin:     0;
      padding:    0;
      box-sizing: border-box;
    }

    html, body {
      width:      100%;
      height:     100%;
      background: #000;   /* black page background */
      display:    flex;
      justify-content: center;
      align-items:     center;
    }

    /* The canvas itself — no extra styling needed. */
    #game-canvas {
      display: block;
    }

  </style>
</head>
<body>

  <!-- The canvas is 800 pixels wide and 600 pixels tall.
       These are the pixel counts — the actual drawing grid dimensions. -->
  <canvas id="game-canvas" width="800" height="600"></canvas>

  <!-- We load main.js at the bottom so the canvas element exists in the DOM
       before the script runs. If the script ran before the canvas element,
       document.getElementById('game-canvas') would return null. -->
  <script src="main.js"></script>

</body>
</html>
```

---

### SAVE AND TRY — Step 1

Save `index.html`. Open it with Live Server (VS Code) or just open the file in
your browser directly.

**You should see:** A completely black page. No errors.

**In DevTools Console (F12), type:**
```js
document.getElementById('game-canvas')
```
**Expected:** The canvas element prints — something like `<canvas id="game-canvas" width="800" height="600">`.

**Change something:** Change `width="800"` to `width="400"`. Save. Reload.
The black rectangle shrinks to half width. Change it back to `800`.

---

## Concept: `requestAnimationFrame`

**What it is:** A browser function that schedules your function to run just
before the next screen repaint — typically 60 times per second.

**The problem before understanding it:**
```js
// WRONG — this blocks the browser forever:
while (true) {
  update();
  render();
}
// JavaScript runs in a single thread. An infinite while loop prevents the
// browser from doing anything else — handling clicks, scrolling, even rendering.
// The page freezes immediately.

// ALSO WRONG — setInterval is unpredictable:
setInterval(function() { update(); render(); }, 16);
// 16ms ≈ 60fps, but setInterval fires even if the previous frame didn't finish.
// It can cause frames to pile up and does not sync to screen refresh rate.
```

**The solution:**
```js
function gameLoop() {
  update();   // change the game state
  render();   // draw the new state
  requestAnimationFrame(gameLoop);  // schedule this function for the NEXT frame
}

requestAnimationFrame(gameLoop);  // start the loop
```

`requestAnimationFrame` does three things that matter:
1. It waits until the browser is ready to draw (syncs to screen refresh rate)
2. It pauses automatically when the tab is hidden (saves battery)
3. It does NOT block — the browser can process other events between frames

**The timing:** `requestAnimationFrame` passes the current time (in milliseconds
since page load) as an argument to your function. We use this for delta time
in LAB-02.

**Watch for:** `requestAnimationFrame(gameLoop)` takes the function itself —
no parentheses. `requestAnimationFrame(gameLoop())` would call `gameLoop` immediately
and pass its return value (which is `undefined`) — the loop would never repeat.

---

## Concept: The Update-Then-Render Pattern

**What it is:** Every frame, the game does exactly two things in order:
1. **Update** — change the state (move things, check collisions, apply physics)
2. **Render** — draw the current state to the canvas

These are always separate functions. Never draw inside the update function.
Never change state inside the render function.

**Why separate:**
```js
// If update and render are mixed:
function gameLoop() {
  dot.x += 3;            // move
  ctx.arc(dot.x, dot.y, 10, 0, Math.PI * 2);  // draw
  ctx.fill();
  dot.x += 3;            // move again?
  // Which position is "correct"? This becomes a mess immediately.
}

// Separated — always clear:
function update() {
  dot.x += 3;   // all state changes here
}

function render() {
  ctx.arc(dot.x, dot.y, 10, 0, Math.PI * 2);  // only reads state, never changes it
  ctx.fill();
}
```

**You will see this pattern in every lab.** The update function changes the
numbers. The render function reads the numbers and draws. They never mix.

**Pattern category:** Non-GoF (game loop pattern)
**Official name:** Game Loop with Update/Render separation
**Tradeoff:** Two functions instead of one — worth it because you can reason
about each phase independently.
**You will see this again in:** Every lab in this series.

---

## Step 2 — JavaScript: The Moving Dot

Open `main.js` and type:

```js
// ── Canvas setup ──────────────────────────────────────────────────────────────

// Get the canvas element from the HTML.
// We use getElementById because the canvas has the id "game-canvas".
const canvas = document.getElementById('game-canvas');

// Get the 2D drawing context.
// ctx is the object with all drawing methods: fillRect, arc, fill, etc.
// We name it 'ctx' by convention — short for context.
const ctx = canvas.getContext('2d');

// ── Constants ─────────────────────────────────────────────────────────────────
// Named constants for every number that defines the game.
// If you want to change the dot's speed, you change ONE place — here.
// Magic numbers (literal values scattered in the code) make changes hard.

const DOT_RADIUS = 10;     // the dot's radius in pixels
const DOT_SPEED  = 3;      // pixels the dot moves per frame (rightward, for now)

// ── State ─────────────────────────────────────────────────────────────────────
// All mutable game data lives in state objects.
// dot.x and dot.y are the center position of the dot in pixels.
// We use an object instead of two separate variables (dot_x, dot_y) because:
//   - Related data stays together
//   - We can pass the whole dot to functions
//   - Later, we'll have many dots (bullets, asteroids) in an array

const dot = {
  x: canvas.width  / 2,   // start at horizontal center (400)
  y: canvas.height / 2,   // start at vertical center   (300)
};

// ── Update ────────────────────────────────────────────────────────────────────

// update() changes the game state each frame.
// It only changes numbers — it never draws anything.
function update() {
  dot.x += DOT_SPEED;   // move the dot rightward by DOT_SPEED pixels
  // After enough frames, dot.x will exceed canvas.width.
  // That means the dot has gone off the right edge.
  // We will handle wrapping in the challenge below.
}

// ── Render ────────────────────────────────────────────────────────────────────

// render() draws the current game state to the canvas.
// It only reads state — it never changes any numbers.
function render() {

  // Step 1: clear the canvas.
  // Without clearing, every frame's drawing stacks on top of the previous frame.
  // The dot would leave a trail instead of moving cleanly.
  // We fill the entire canvas with black to clear it.
  ctx.fillStyle = '#000000';                              // set fill color: black
  ctx.fillRect(0, 0, canvas.width, canvas.height);       // fill entire canvas

  // Step 2: draw the dot.
  // ctx.arc describes a circular arc:
  //   arc(centerX, centerY, radius, startAngle, endAngle)
  // A full circle: startAngle = 0, endAngle = 2 * Math.PI (a full turn in radians).
  ctx.beginPath();                                       // start a new path (required before arc)
  ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, 2 * Math.PI);   // describe the circle
  ctx.fillStyle = '#ffffff';                             // set fill color: white
  ctx.fill();                                            // paint the described shape
}

// ── Game loop ─────────────────────────────────────────────────────────────────

// gameLoop runs every frame.
// The order is always: update state → render state → schedule next frame.
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);   // schedule this function for the next frame
}

// Start the loop. This first call schedules the first frame.
// After that, gameLoop schedules itself at the end of each frame.
requestAnimationFrame(gameLoop);
```

---

### SAVE AND TRY — Step 2

Save `main.js`. Reload the browser.

**You should see:** A white circle starting at the center, moving steadily to the right.
When it reaches the right edge, it disappears — there is no wrapping yet.

**In DevTools Console, type:**
```js
dot.x
```
**Expected:** A number between 0 and 800, changing as the dot moves.
(Run it multiple times — the number increases.)

**Change something:** Change `const DOT_SPEED = 3` to `const DOT_SPEED = 10`.
Save. Reload. The dot moves much faster. Change it back to `3`.

**Change something else:** Change `const DOT_RADIUS = 10` to `const DOT_RADIUS = 30`.
Save. The dot is much larger. Change it back to `10`.

---

## Concept: Wrapping with Modulo (%)

**What it is:** The modulo operator `%` returns the remainder after division.

**The math:**
```
800 % 800 = 0    (800 divides evenly — no remainder)
801 % 800 = 1    (801 = 1 × 800, remainder 1)
850 % 800 = 50
```

**Using modulo to wrap a position:**

When `dot.x` exceeds `canvas.width`, we want it to jump back to 0:
```js
dot.x = dot.x % canvas.width;
// dot.x = 800: 800 % 800 = 0    → jumps to left edge ✓
// dot.x = 801: 801 % 800 = 1    → 1 pixel from left edge ✓
// dot.x = 850: 850 % 800 = 50   → 50 pixels from left edge ✓
```

**The edge case — negative numbers:**

Modulo of a negative number in JavaScript gives a negative result:
```js
-1 % 800    // = -1 in JavaScript, not 799
```

If `dot.x` moves left past 0, we need `799`, not `-1`. Fix:
```js
dot.x = (dot.x + canvas.width) % canvas.width;
// dot.x = -1:   (-1 + 800) % 800   = 799 % 800 = 799   ✓
// dot.x = 0:    (0 + 800) % 800    = 800 % 800 = 0      ✓
// dot.x = 801:  (801 + 800) % 800  = 1601 % 800 = 1     ✓
```

This works for all cases — positive, negative, and exactly zero.

---

## 🎯 Challenge: Wrap the Dot at All Four Edges

You now know everything needed to make the dot wrap correctly at all four edges.

**Current behavior:** The dot disappears at the right edge.
**Target behavior:** When the dot exits any edge, it reappears at the opposite edge.

**Your task:** Modify the `update()` function to wrap `dot.x` AND `dot.y` at all four edges.

**Starter code (current update function):**
```js
function update() {
  dot.x += DOT_SPEED;
  // Add wrapping here
}
```

**Hints:**
1. Wrap `dot.x` using the modulo formula shown above.
2. Wrap `dot.y` using the same formula with `canvas.height`.
3. The dot currently only moves right. To test all 4 edges, temporarily add
   `dot.y += DOT_SPEED` (moving diagonally) — then remove it after testing.

**Give it a try before reading the solution.** A good attempt is more valuable
than a perfect copy.

---

<details>
<summary>▶ Solution — Wrapping at All Four Edges</summary>

```js
function update() {
  dot.x += DOT_SPEED;

  // Wrap horizontally: when dot exits right, reappear at left, and vice versa.
  dot.x = (dot.x + canvas.width)  % canvas.width;

  // Wrap vertically: when dot exits bottom, reappear at top, and vice versa.
  dot.y = (dot.y + canvas.height) % canvas.height;
}
```

**Key insight:** The `(value + max) % max` formula handles all four cases:
- Going off the right: `dot.x > canvas.width` → wraps to near 0
- Going off the left: `dot.x < 0` → wraps to near `canvas.width`
- Going off the bottom: `dot.y > canvas.height` → wraps to near 0
- Going off the top: `dot.y < 0` → wraps to near `canvas.height`

The same two-line formula works for any object in the game — bullets, asteroids,
the ship. When we have 20 asteroids all needing to wrap, we call the same formula
for each one.

</details>

---

**After verifying the dot wraps correctly in all directions** (add diagonal
movement temporarily: `dot.y += DOT_SPEED`), remove the `dot.y` movement so
the dot only moves right again. Wrapping is now built and proven.

---

## Concept: `ctx.beginPath()` — Why It Is Required

**What it is:** A call that clears the current path buffer and starts a new one.

**The problem without it:**

```js
// Frame 1: draw circle at (100, 100)
ctx.arc(100, 100, 10, 0, Math.PI * 2);
ctx.fill();

// Frame 2: draw circle at (200, 100)
// WITHOUT beginPath():
ctx.arc(200, 100, 10, 0, Math.PI * 2);
ctx.fill();
// Both the OLD path (circle at 100,100) AND the new path (circle at 200,100) are filled.
// The old circle reappears even though you "moved" it.
```

**The fix:**
```js
// Frame 2:
ctx.beginPath();                           // clear the old path
ctx.arc(200, 100, 10, 0, Math.PI * 2);   // describe new circle
ctx.fill();                                // fill ONLY the new circle
```

**The two-phase model:**
1. `beginPath()` — clear and start describing
2. `arc()`, `moveTo()`, `lineTo()`, etc. — describe the shape
3. `fill()` or `stroke()` — paint what was described

You MUST call `beginPath()` before every new shape. Without it, shapes from
previous frames or previous drawing calls accumulate in the path buffer and
all get painted at once.

**Watch for:** This is the most common canvas beginner bug. If you see shapes
that should have moved still appearing at their old position, `beginPath()` is
missing.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Black canvas appears | Page background is solid black |
| White dot is visible | A circle appears — centered initially |
| Dot moves continuously | Circle slides to the right without input |
| Dot wraps at right edge | Exits right, reappears at left |
| No trail | Each frame is clean — no smearing |
| Console: `dot.x` changes | Value increases each time you type it |
| Speed constant works | Changing `DOT_SPEED` changes movement speed |

---

## What Is Next — LAB 02

LAB 02 turns the dot into an Asteroids ship: a triangle that rotates left and
right with the arrow keys, and thrusts in the direction it faces. This requires
learning how to rotate shapes on the canvas — a technique used for the ship,
asteroids, and every object that can face a direction.

*Continue to 2D Asteroids — LAB 02 — The Ship and Rotation.*
