# PhaserJS — LAB 01 — The Game Loop

**Prerequisites:** Basic HTML. You know what a `<script>` tag is and how to open a file in a browser. No JavaScript experience required — everything is explained from scratch.

**What this lab adds:**
- A black canvas that fills your browser window
- A white dot that moves smoothly and wraps at the edges
- Your first working game loop — the heartbeat of every game ever made

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If you draw a circle on screen, then draw a new circle 1 pixel to the right every millisecond, what would you actually see?
> 2. A game needs to move 60 objects every second. Should it update all 60 at once, or one at a time?
> 3. What do you think happens if you draw a new frame without erasing the previous one?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will see this in your browser:

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│          ●  ←  white dot             │
│              moving right →          │
│                                      │
│  (when it exits the right edge,      │
│   it reappears at the left)          │
│                                      │
└──────────────────────────────────────┘
  Black background, full browser window
```

The dot moves smoothly and continuously. No clicks needed. This is the foundation every future lab builds on.

---

## Concept: The Game Loop

**What it is:** A function that runs repeatedly — roughly 60 times per second — updating the game state and redrawing the screen on every pass.

**The problem before:**
```html
<!-- Without a loop, you draw once and nothing moves: -->
<canvas id="game"></canvas>
<script>
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(100, 100, 20, 0, Math.PI * 2);
  ctx.fill();
  // The dot is drawn. It sits there. Forever. Nothing moves.
</script>
```

**The solution:** Call an update-and-draw function over and over, changing the dot's position slightly each time. The human eye perceives this rapid sequence of still frames as smooth motion — the same trick film and animation use.

**What it hides:**
The game loop hides the complexity of *timing* — deciding exactly when to run each frame, how to keep that timing consistent across different hardware, and how to prevent the browser from starving or freezing. The invariant it protects: **every frame of game logic runs exactly once per screen refresh**, in the correct order (update state → draw state). Outside code cannot accidentally call draw before update, or skip an update cycle, without going through the loop's own mechanism.

**Canonical example (General Explanation):**

Imagine a flip-book animation. Each page is a still drawing. Flip the pages fast enough and the drawing appears to move. A game loop is the mechanism that "flips the page" — it:
1. Moves everything slightly (update)
2. Draws the new page (render)
3. Immediately starts again

```js
function loop() {
  update(); // move things
  render(); // draw things
  requestAnimationFrame(loop); // ask the browser: "call me again next frame"
}
requestAnimationFrame(loop); // start the loop
```

**Project Application (The "Why" here):**
Our dot needs to move a few pixels to the right every frame. Without the loop, it moves once and stops. With the loop running 60 times per second, moving 3 pixels per frame means the dot travels 180 pixels per second — smooth, continuous motion.

**Smallest possible example:**
```js
let x = 0; // dot's horizontal position

function loop() {
  x += 2;             // move 2 pixels right
  console.log(x);    // in a real game: draw here
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

**Why it matters here:** Every moving object in every future lab — bullets, asteroids, enemies — lives inside this loop.

**Watch for:** `requestAnimationFrame` is NOT `setInterval`. It syncs to the monitor's refresh rate (usually 60fps) and pauses automatically when the tab is hidden, saving battery and preventing bugs.

---

### Concept: `requestAnimationFrame`

**What it is:** A browser function that schedules another function to run just before the next screen repaint — approximately 60 times per second.

**The problem before:**
```js
// Old approach — setInterval runs on a fixed timer, ignoring the screen
setInterval(loop, 16); // ~60fps but not synced to monitor
// Problem: can run between screen repaints, causing visual tearing
// Problem: keeps running when tab is hidden, wasting CPU
```

**The solution:**
```js
requestAnimationFrame(loop);
// Runs in sync with the monitor's refresh
// Automatically pauses when the tab is not visible
// Passes a timestamp to the function (useful later for delta time)
```

**What it hides:**
`requestAnimationFrame` hides the complexity of synchronising JavaScript execution with the display hardware's refresh cycle. The invariant it protects: **your draw code always runs at the right moment** — after the browser has finished its layout and style work, and right before it paints the screen. You cannot accidentally draw at the wrong moment.

**Smallest possible example:**
```js
function tick() {
  console.log('frame!');
  requestAnimationFrame(tick); // schedule the next call
}
requestAnimationFrame(tick); // start
```
Open the console and you'll see "frame!" printed ~60 times per second.

**Why it matters here:** This is what makes our game loop tick without us managing timers manually.

**Watch for:** You must call `requestAnimationFrame` again inside the function to continue the loop. If you forget, the loop runs once and stops — a very common beginner mistake.

---

### Concept: The HTML5 Canvas

**What it is:** An HTML element that gives JavaScript a rectangular drawing surface — a blank pixel grid you can paint on with code.

**The problem before:**
Standard HTML elements (divs, imgs) can be moved with CSS, but drawing arbitrary shapes, animations, and game graphics with them is impractical. The canvas gives us a direct pixel-level drawing API.

**The solution:**
```html
<canvas id="game"></canvas>
```
```js
const canvas = document.getElementById('game'); // grab the element
const ctx = canvas.getContext('2d');             // get the 2D drawing context
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 100, 50); // draw a red rectangle
```

**What it hides:**
The canvas API hides the complexity of talking to the GPU and managing the pixel buffer. The invariant: **you describe shapes in 2D coordinates** and the canvas handles converting those coordinates into actual screen pixels at the correct resolution.

**Canonical example:**
Think of a canvas as a whiteboard. `ctx` is your marker. Every drawing command you make — `fillRect`, `arc`, `stroke` — is like drawing on the whiteboard. The whiteboard does not remember individual shapes; it only knows its current pixel state.

**Why it matters here:** All our game graphics live on this canvas.

**Watch for:** Canvas width and height in HTML are NOT the same as CSS width and height. The HTML attributes set the drawing resolution (how many pixels you can draw). CSS sets the display size on screen. If you set the canvas to 300×150px via CSS but never set the HTML attributes, your drawings will be blurry or stretched.

---

### Concept: The Coordinate System

**What it is:** The grid that defines where things are on the canvas. Every point has an `x` (horizontal) and `y` (vertical) value.

**The surprise:** Canvas Y-axis is flipped compared to what you learned in maths class. The origin (0, 0) is the **top-left corner**. Y increases going **downward**.

```
(0,0) ───────────────► x increases →
  │
  │      ● (200, 150)
  │
  ▼
  y increases ↓
```

**Canonical example:**
```js
ctx.arc(200, 150, 30, 0, Math.PI * 2);
//      x    y   radius  start  end angle
// Draws a circle centered at x=200, y=150
// x=200: 200 pixels from the left edge
// y=150: 150 pixels from the TOP edge (not bottom!)
```

**Why it matters here:** When we move our dot downward, we ADD to y. Moving upward means SUBTRACTING from y. This trips up everyone coming from maths.

**Watch for:** If your dot moves in the opposite vertical direction from what you expected, you've probably got the y-axis backwards.

---

### Math: Modulo Wrapping (`%`)

**What it computes:** The remainder after division. Used to make a value "wrap around" between 0 and a maximum.

**The real-world analogy:** A clock. After 12, you don't go to 13 — you go back to 1. Hours "wrap" around 12. Modulo does the same thing for any maximum value.

```
Clock: 13 o'clock → 13 % 12 = 1 (1pm)
Clock: 24 o'clock → 24 % 12 = 0 (midnight)
```

**Canonical example:**

Imagine a counter that goes 0, 1, 2, 3, 4... but must wrap back to 0 after reaching 5:

```
value:         0  1  2  3  4  5  6  7  8  9  10
value % 5:     0  1  2  3  4  0  1  2  3  4   0
                                ▲
                          wraps here
```

In code:
```js
let counter = 0;
counter = (counter + 1) % 5; // always stays between 0 and 4
```

**The wrapping formula for a moving object:**

When a dot exits the right edge (x = canvasWidth), we want it to reappear at x = 0. When it exits the left edge (x = -1), we want it to reappear at x = canvasWidth - 1.

The formula that handles BOTH directions:
```js
dot.x = (dot.x + canvas.width) % canvas.width;
//        ▲ adding canvas.width prevents negative numbers breaking modulo
```

Why add `canvas.width` first? If `dot.x` is `-1` and canvas is `800px` wide:
- Without the fix: `-1 % 800 = -1` — still negative, dot stays offscreen
- With the fix: `(-1 + 800) % 800 = 799` — correct, dot wraps to the right edge

**Why it matters here:** This is how we make the dot wrap at the canvas edge in Step 3.

**Watch for:** In JavaScript, `%` on a negative number returns a negative result. Always add the maximum value before applying `%` to prevent off-screen objects.

---

## Step 1 — Create the Project Files

Create a new folder called `phaser-lab-01`. Inside it, create two files:

**`index.html`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LAB 01 — The Game Loop</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <canvas id="game-canvas"></canvas>   <!-- ← the drawing surface -->
  <script src="main.js"></script>      <!-- ← all our game code goes here -->
</body>
</html>
```

**`style.css`**
```css
/* Remove default margins so the canvas touches every edge */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Hide scrollbars — the canvas will fill the window exactly */
body {
  overflow: hidden;
  background: #000000; /* fallback while canvas loads */
}

/* Make the canvas fill the full browser window */
#game-canvas {
  display: block;       /* removes the small gap below inline elements */
  width: 100vw;         /* CSS display width = full viewport width */
  height: 100vh;        /* CSS display height = full viewport height */
}
```

**`main.js`** (start empty — we'll build it up step by step)
```js
// LAB 01 — The Game Loop
// We'll add code here step by step
```

### CSS AND SEE

Save all three files. Open `index.html` directly in your browser (no server needed yet).

**You should see:** A completely black window. No scrollbars. The black fills the entire browser.

**Compare:** Before the CSS, the page had white background with default browser margins. Now the black `body` background fills everything.

**Change something:** Change `background: #000000` in `style.css` to `background: #1a0033`. Save. The background turns dark purple. Change it back to `#000000`.

---

## Step 2 — Set Up the Canvas and Context

Now we'll give the canvas its actual drawing resolution and get the drawing context.

Add to **`main.js`** (replace the comment):
```js
// LAB 01 — The Game Loop

// ─── Constants ───────────────────────────────────────────────────
const DOT_RADIUS = 12;   // size of the dot in pixels
const DOT_SPEED  = 3;    // pixels the dot moves right per frame
const DOT_COLOR  = '#ffffff'; // white
const BG_COLOR   = '#000000'; // black background

// ─── Canvas Setup ─────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas'); // grab the HTML element
const ctx    = canvas.getContext('2d');                // get the 2D drawing API

function resizeCanvas() {
  // Set the canvas RESOLUTION to match the window size.
  // This is separate from the CSS size (which already fills the window).
  // Without this, all drawings use the default 300×150px resolution
  // and appear stretched or blurry.
  canvas.width  = window.innerWidth;  // drawing resolution = window width
  canvas.height = window.innerHeight; // drawing resolution = window height
}

resizeCanvas(); // ← call it once immediately so the first frame draws correctly

// Re-run resizeCanvas whenever the user resizes the browser window
window.addEventListener('resize', resizeCanvas);
// browsers don't automatically update canvas resolution on resize
```

### SAVE AND TRY

Save. Refresh the browser.

**You should see:** Still a black screen — correct. Nothing visible has changed yet because we haven't drawn anything.

**In DevTools Console** (press F12 → Console tab), type:
```js
canvas.width
```
**Expected:** A number matching your window's width (e.g. `1440` or `1920`).

```js
canvas.height
```
**Expected:** A number matching your window's height (e.g. `900` or `1080`).

**Change something:** Resize your browser window. Then type `canvas.width` in the console again. The number should have updated to match the new size. Resize back to full screen.

---

## Step 3 — Draw the Dot (One Frame)

Before we animate anything, let's draw the dot once and confirm it appears.

### Concept: `ctx.beginPath()` — The Path Buffer

**What it is:** A canvas method that clears the internal path buffer and starts a fresh drawing path.

**The problem before:**
```js
// Frame 1 — draw a circle at (100, 100):
ctx.arc(100, 100, 20, 0, Math.PI * 2);
ctx.fill();

// Frame 2 — move the circle to (300, 100):
ctx.arc(300, 100, 20, 0, Math.PI * 2);
ctx.fill();
// BUG: BOTH circles appear. The canvas remembers the old path.
```

**The solution:** `ctx.beginPath()` clears the path buffer before describing a new shape.

**What it hides:**
The path buffer is an internal list of drawing commands (move here, draw arc here, draw line there) that the canvas accumulates until you call `fill()` or `stroke()`. `beginPath()` hides the need to manually clear this list. The invariant: after `beginPath()`, the path buffer is empty — no previous drawing commands can bleed into the new shape.

**Smallest possible example:**
```js
ctx.beginPath();                         // clear the path buffer
ctx.arc(200, 200, 30, 0, Math.PI * 2); // describe a circle
ctx.fillStyle = 'red';
ctx.fill();                              // paint the path
```

**Why it matters here:** Every frame, we describe a new circle at a new position. Without `beginPath()`, old positions stack up and we see a smear, not a moving dot.

**Watch for:** `beginPath()` goes BEFORE `arc()`. The order matters — you clear first, describe second, fill third.

---

Add to the bottom of **`main.js`**:
```js
// ─── Draw Test ─────────────────────────────────────────────────────
// Temporary: draw the dot once in the center to confirm it works.
// We'll replace this with the game loop in the next step.

function drawDot(x, y) {
  ctx.beginPath();                            // clear the path buffer — start fresh
  ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2); // describe a full circle
  // ctx.arc(x, y, radius, startAngle, endAngle)
  // Math.PI * 2 = 360 degrees = full circle
  ctx.fillStyle = DOT_COLOR;                  // set the fill colour to white
  ctx.fill();                                 // paint the described path
}

drawDot(canvas.width / 2, canvas.height / 2); // draw once, right in the center
```

### SAVE AND TRY

Save. Refresh.

**You should see:** A white circle in the exact centre of the black screen.

**In DevTools Console:**
```js
canvas.width / 2
```
**Expected:** Half your window width. That's where the dot's center is.

**Change something:** Change `DOT_RADIUS = 12` to `DOT_RADIUS = 60`. Save. The dot is now huge. Change it back to `12`.

---

## 🎯 Challenge: Draw a Second Dot

**You know:** How to call `drawDot(x, y)` with coordinates.

**Task:** Draw a second dot in each corner of the canvas — top-left, top-right, bottom-left, and bottom-right. Each dot should sit just inside the edge (not cut off by the edge).

**Starting code (current bottom of main.js):**
```js
drawDot(canvas.width / 2, canvas.height / 2); // center dot — keep this
// Add your four corner dots below:
```

**Hint:** The top-left corner is `(0, 0)`. A dot at exactly `(0, 0)` will be half off-screen. Offset by `DOT_RADIUS` to keep it fully visible.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
drawDot(canvas.width / 2, canvas.height / 2); // center

// Corners — offset by DOT_RADIUS so the dot isn't clipped by the edge
drawDot(DOT_RADIUS, DOT_RADIUS);                              // top-left
drawDot(canvas.width - DOT_RADIUS, DOT_RADIUS);              // top-right
drawDot(DOT_RADIUS, canvas.height - DOT_RADIUS);             // bottom-left
drawDot(canvas.width - DOT_RADIUS, canvas.height - DOT_RADIUS); // bottom-right
```

**Key insight:** Coordinates are the dot's CENTER, not its edge. A circle at `(0, 0)` is half off-screen because its center is at the corner. Offsetting by the radius keeps the entire circle inside the canvas.

</details>

---

## Step 4 — Add the Game State

Before we can animate, we need to store the dot's current position somewhere. That "somewhere" is game state — data that changes over time and describes the world right now.

### Concept: State Object

**What it is:** A plain JavaScript object that holds the current values of everything that can change — position, speed, score, health. It is the "memory" of the game at this instant.

**The problem before:**
```js
// Storing position as loose variables — works for one dot but breaks fast
let dotX = 400;
let dotY = 300;
// For 10 bullets: dot1X, dot1Y, dot2X, dot2Y ... 20 variables
// Impossible to loop over, pass to functions, or reason about together
```

**The solution:** Group related data into one object.
```js
const dot = { x: 400, y: 300 };
// Now you can pass the whole dot to any function
// Later: an array of dots is trivially loopable
```

**What it hides:**
A state object hides the scattered loose variables that would otherwise represent a single entity. The invariant: all properties that belong to one entity live in one place — you cannot accidentally update `dot1X` when you meant `dot2X`.

**Canonical example:**
A player in a simple game:
```js
const player = {
  x: 400,       // horizontal position
  y: 300,       // vertical position
  speed: 3,     // pixels per frame
  health: 100,  // hit points
};
```
Every function that needs to read or change the player touches `player.something` — nothing is global or scattered.

**Project Application (The "Why" here):**
Our dot needs an `x` and `y`. In lab 2 we'll add velocity. In lab 5 we'll have an array of these objects. Starting with an object makes all of that easy.

**Why it matters here:** Step 5 (the loop) will read and write `dot.x` every frame.

**Watch for:** Using `const` for the object does not make its properties immutable. `const dot = { x: 0 }` means you cannot reassign `dot`, but `dot.x = 99` is perfectly legal.

---

Remove the `drawDot(...)` test calls from the bottom of `main.js` and add the state object:

```js
// ─── Remove the drawDot test calls you added in Step 3 ─────────────
// (delete those lines — we're replacing them with real game state)

// ─── Game State ──────────────────────────────────────────────────────
const dot = {
  x: 0,                       // start at the left edge    ← add this
  y: 0,                       // will be set after resize  ← add this
};
```

Now update `resizeCanvas` to also recentre the dot vertically whenever the window resizes:

```js
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  dot.y = canvas.height / 2;  // ← add this: keep dot vertically centred on resize
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** A black screen again — we removed our test draw. That's correct.

**In DevTools Console:**
```js
dot
```
**Expected:** `{ x: 0, y: [half your window height] }` — for example `{ x: 0, y: 450 }`.

```js
dot.x = 300; dot.y
```
**Expected:** The number doesn't change (y is still centred). We changed x but nothing drew yet — correct. The state changed but the screen hasn't redrawn.

---

## Step 5 — The Update Function

Now we write the function that advances the game one frame: move the dot, then wrap it.

Add to the bottom of **`main.js`**:
```js
// ─── Update ─────────────────────────────────────────────────────────
function update() {
  dot.x += DOT_SPEED;
  // move the dot right by DOT_SPEED pixels each frame
  // += is shorthand for: dot.x = dot.x + DOT_SPEED

  dot.x = (dot.x + canvas.width) % canvas.width;
  // wrap: when dot exits the right edge, reappear at the left
  // adding canvas.width first ensures negative values also wrap correctly
  // (see the Modulo Wrapping concept block above for the full explanation)
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Still a black screen — `update()` changes the state but nothing draws yet.

**In DevTools Console** — let's manually run a few frames:
```js
dot.x    // before: 0
update()
dot.x    // after one frame: 3
update()
update()
dot.x    // after three frames: 9
```
**Expected:** `dot.x` increases by `DOT_SPEED` (3) each call.

Run it many times until `dot.x` wraps:
```js
dot.x = canvas.width - 2; // set close to the right edge
update();
dot.x; // Expected: 1 (wrapped back to near the left edge)
```

**Change something:** Change `DOT_SPEED = 3` to `DOT_SPEED = 100`. Run `update()` in the console several times. The dot jumps across the screen. Change it back to `3`.

---

## Step 6 — The Render Function

Now we write the function that draws the current state to screen.

### Concept: Clear-and-Redraw (Immediate Mode Rendering)

**What it is:** Each frame, erase everything and redraw the whole scene from scratch based on current state.

**The problem before:**
```js
// If you don't erase: draw dot at x=100, next frame draw at x=103
// Both circles are on screen simultaneously — smearing ghost trail
```

**The solution:** Fill the entire canvas with the background colour before drawing anything. This "clears" the previous frame.

**What it hides:**
Immediate mode rendering hides the complexity of tracking which old drawings need to be erased when objects move. The invariant: **at the start of every render call, the canvas is completely blank** — there are no leftover shapes from previous frames. You never have to manually erase individual old shapes.

**Canonical example:**
```
Frame 1: erase all → draw dot at x=100
Frame 2: erase all → draw dot at x=103
Frame 3: erase all → draw dot at x=106
Viewer sees: smooth movement
```

**Why it matters here:** Without clearing, the dot leaves a white smear across the screen.

**Watch for:** On the very first frame, clearing is harmless — the canvas is already blank. So you can always clear first, even on frame 1.

---

Add to the bottom of **`main.js`**:
```js
// ─── Render ─────────────────────────────────────────────────────────
function render() {
  // Step 1: erase the previous frame
  ctx.fillStyle = BG_COLOR;               // black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // fillRect(x, y, width, height) — draws a filled rectangle
  // (0, 0) to (canvas.width, canvas.height) covers the entire canvas

  // Step 2: draw the dot at its current position
  drawDot(dot.x, dot.y);
  // dot.x and dot.y were just updated by update()
}
```

### SAVE AND TRY

Save. Refresh.

**You should see:** Still a black screen — we have `update` and `render` but nothing is calling them yet. That's next.

**In DevTools Console** — manually call both:
```js
update(); render();
```
**Expected:** A white dot appears somewhere slightly right of the left edge.

```js
update(); render();
update(); render();
update(); render();
```
**Expected:** The dot jumps right a few pixels with each call. You're manually running the game loop!

---

## Step 7 — Wire the Game Loop

Now we connect everything: the loop calls `update` then `render` and reschedules itself.

Add to the bottom of **`main.js`**:
```js
// ─── Game Loop ─────────────────────────────────────────────────────
function loop() {
  update(); // 1. advance the game state one frame
  render(); // 2. draw the new state to screen
  requestAnimationFrame(loop);
  // 3. ask the browser: "call loop() again just before the next screen repaint"
  // This creates the cycle: loop → update → render → loop → ...
}

requestAnimationFrame(loop); // ← start the loop (the very first call)
```

### SAVE AND TRY

Save. Refresh.

**You should see:** A white dot moving smoothly from left to right across the black canvas. When it reaches the right edge, it seamlessly reappears at the left edge.

**In DevTools Console:**
```js
dot.x
```
Run it twice, half a second apart.
**Expected:** A different number each time — the dot's position is updating continuously.

```js
dot.y
```
**Expected:** Exactly half the canvas height (e.g. `450`). The dot stays on the horizontal centreline.

**Change something:** Change `DOT_SPEED = 3` to `DOT_SPEED = 15`. Save. The dot moves much faster. Change it back to `3`.

---

## 🎯 Challenge: Wrap at All Four Edges

**You know:** The modulo wrapping formula for the horizontal axis (x).

**Task:** Make the dot also move diagonally and wrap at all four edges — left, right, top, and bottom.

**Starting code (current `update` function):**
```js
function update() {
  dot.x += DOT_SPEED;
  dot.x = (dot.x + canvas.width) % canvas.width;
  // Add vertical movement and Y wrapping here
}
```

**Hints:**
1. You need to add a `DOT_SPEED_Y` constant (try `2`) and move `dot.y` each frame.
2. The Y-axis maximum is `canvas.height`, not `canvas.width`.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

Add a new constant at the top:
```js
const DOT_SPEED_Y = 2; // pixels the dot moves down per frame  ← add this
```

Update the `update` function:
```js
function update() {
  dot.x += DOT_SPEED;
  dot.x = (dot.x + canvas.width) % canvas.width;    // horizontal wrap

  dot.y += DOT_SPEED_Y;                               // ← add this
  dot.y = (dot.y + canvas.height) % canvas.height;   // ← add this: vertical wrap
}
```

**Key insight:** The same two-line pattern handles both axes. The only thing that changes is whether you use `canvas.width` or `canvas.height` as the maximum. Every object that needs to wrap — bullets, asteroids, enemies — uses this exact formula.

</details>

---

## 🎯 Challenge: Leave a Trail

**You know:** The `render` function clears the canvas on every frame.

**Task:** Make the dot leave a fading trail. The dot's old positions should appear at lower opacity, fading out over about 20 frames.

**Hint:** Instead of filling with solid `BG_COLOR`, fill with a semi-transparent black. This means old drawings fade out slowly rather than disappearing instantly.

**Starting code:**
```js
function render() {
  ctx.fillStyle = BG_COLOR; // ← change this line only
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawDot(dot.x, dot.y);
}
```

**Hint 2:** CSS colour with transparency uses the format `rgba(red, green, blue, opacity)` where opacity is between 0 (invisible) and 1 (fully opaque). Black is `rgba(0, 0, 0, 1)`. A semi-transparent black that fades about 5% each frame is `rgba(0, 0, 0, 0.05)`.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```js
function render() {
  // Replace solid clear with semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // 8% opacity — old frames fade slowly
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawDot(dot.x, dot.y);
}
```

**Key insight:** You're not actually "remembering" old positions. You're just making the erase operation incomplete — each frame, old drawings are 8% more faded, not fully gone. After ~12–15 frames, they've faded to near-invisible. This is an immediate-mode "fake trail" — elegant but approximate.

To make the trail longer: lower the opacity (try `0.03`). To make it shorter: raise it (try `0.2`).

</details>

---

## Final Check

Verify every feature added in this lab:

| Feature | How to verify |
|---|---|
| Black canvas fills window | Open `index.html` — no white edges, no scrollbars |
| Canvas resizes with window | Drag browser window smaller/larger — canvas fills new size |
| Canvas resolution updates on resize | After resize, type `canvas.width` in console — matches window width |
| Dot is visible | A white circle appears in the browser |
| Dot moves right | Watch the dot — it slides continuously to the right |
| Dot wraps at right edge | Wait for the dot to reach the right edge — it reappears at the left |
| Loop is running | Type `dot.x` in console twice, 1 second apart — different values each time |
| Constants control behaviour | Change `DOT_SPEED` or `DOT_RADIUS` — game changes immediately on save |

---

## Complete `main.js` Reference

If anything has gone wrong, here is the complete file. Compare it with yours line by line — don't copy-paste without understanding each section.

```js
// LAB 01 — The Game Loop

// ─── Constants ───────────────────────────────────────────────────────────────
const DOT_RADIUS  = 12;       // size of the dot in pixels
const DOT_SPEED   = 3;        // pixels the dot moves right per frame
const DOT_COLOR   = '#ffffff'; // white dot
const BG_COLOR    = '#000000'; // black background

// ─── Canvas Setup ─────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas'); // grab the HTML canvas element
const ctx    = canvas.getContext('2d');                // get the 2D drawing API

// ─── Game State ───────────────────────────────────────────────────────────────
const dot = {
  x: 0,  // horizontal position — starts at left edge
  y: 0,  // vertical position — set by resizeCanvas()
};

// ─── Canvas Resize ────────────────────────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = window.innerWidth;   // drawing resolution = window width
  canvas.height = window.innerHeight;  // drawing resolution = window height
  dot.y = canvas.height / 2;           // recentre dot vertically after resize
}
resizeCanvas(); // call once immediately so first frame is correct
window.addEventListener('resize', resizeCanvas); // re-run on window resize

// ─── Draw Functions ───────────────────────────────────────────────────────────
function drawDot(x, y) {
  ctx.beginPath();                             // clear path buffer
  ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2); // describe full circle
  ctx.fillStyle = DOT_COLOR;                  // set fill colour
  ctx.fill();                                 // paint the path
}

// ─── Update ───────────────────────────────────────────────────────────────────
function update() {
  dot.x += DOT_SPEED;
  dot.x = (dot.x + canvas.width) % canvas.width; // wrap at right/left edge
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  ctx.fillStyle = BG_COLOR;                       // black
  ctx.fillRect(0, 0, canvas.width, canvas.height); // clear previous frame
  drawDot(dot.x, dot.y);                           // draw dot at current position
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function loop() {
  update();                    // advance state
  render();                    // draw state
  requestAnimationFrame(loop); // schedule next frame
}
requestAnimationFrame(loop);   // start the loop
```

---

## What's Next

In **LAB 02** we'll replace the simple `DOT_SPEED` constant with a **velocity vector** — a pair of values (vx, vy) representing direction and speed together. You'll learn:
- What a vector is and why it's more powerful than a single speed value
- How to make the dot move in any direction, not just left/right
- How speed, direction, and distance are related (and how the distance formula proves it)

The dot you built today will become a proper moving body with directional velocity — the foundation for every physics-based mechanic in future labs.

---

## Quick Check Answers

**1. If you draw a circle on screen, then draw a new circle 1 pixel to the right every millisecond, what would you actually see?**

It depends on whether you erase between draws. Without erasing, you'd see a solid white bar — every circle stays on screen. With erasing (clearing the canvas before each draw), you'd see a single circle appearing to move smoothly right. Our game loop always clears first, which is why we see a moving dot and not a smear.

**2. A game needs to move 60 objects every second. Should it update all 60 at once, or one at a time?**

All 60 in the same frame — the `update()` function processes every object before `render()` draws any of them. This keeps all objects in sync: they all advance one frame together, then the screen shows the new state of all 60 at once. If you updated and drew each object independently, some objects would be one frame ahead of others, causing visual inconsistencies.

**3. What do you think happens if you draw a new frame without erasing the previous one?**

The new circle is drawn on top of the old one, but the old one stays visible. Every frame adds a new circle without removing old ones. After a few seconds you'd have hundreds of overlapping circles — a solid smear across the screen. This is exactly why `render()` calls `fillRect` over the entire canvas before drawing anything: it wipes the slate clean so each frame starts fresh.

---

*End of LAB 01. Next: [LAB 02 — Vectors & Movement](LAB-02-Vectors-and-Movement.md)*
