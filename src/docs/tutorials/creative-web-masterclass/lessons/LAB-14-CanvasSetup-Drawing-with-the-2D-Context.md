# Creative Web Masterclass — LAB 14 — Canvas Setup: Drawing with the 2D Context

**Prerequisites:** LAB-13. You know requestAnimationFrame, the animation loop, and scroll events.

**What this lab adds:**
- `<canvas>` element — a bitmap drawing surface in the HTML document
- `getContext('2d')` — the 2D drawing API object
- Drawing primitives: rectangles, circles (arcs), lines, and text
- Clearing and resizing the canvas on window resize
- The canvas coordinate system

**Time:** 50–65 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  ████  ●   /        Canvas drawing demo              │
 │            /   Drawing primitives, lines, text        │
 │       ●                                               │
 │  ████                                                 │
 └──────────────────────────────────────────────────────┘
   A canvas that fills the browser window and draws
   rectangles, circles, lines, and text.
```

---

> **Quick Check — answer before reading further:**
>
> 1. CSS can create boxes, circles, and text. Why would you need a `<canvas>` element?
>    What can canvas do that CSS cannot?
> 2. In CSS, the origin (0,0) is the top-left corner and Y increases downward. Does the
>    same apply to the canvas coordinate system?
> 3. `getContext('2d')` returns a drawing API object. What would `getContext('webgl')` return?
>
> *(Answers at the end)*

---

## Concept: The `<canvas>` Element

**What it is:** `<canvas>` is an HTML element that exposes a pixel-level drawing surface.
You draw onto it using JavaScript drawing commands. Unlike DOM elements (which persist and
can be re-styled), canvas draws pixels — once drawn, they are just colored pixels with no
memory of what drew them.

**The contrast with DOM:**

| DOM | Canvas |
|---|---|
| Elements persist — the button still "exists" | Pixels persist — the circle is just colored pixels |
| CSS can re-style elements at any time | You must redraw every frame to change anything |
| Layout is automatic | You control every pixel's position |
| Optimized for text and UI | Optimized for graphics, particles, games |

**Canonical example:**

```html
<canvas id="my-canvas" width="800" height="400"></canvas>
```

```js
const canvas = document.querySelector('#my-canvas');
const ctx = canvas.getContext('2d');   // ctx is the drawing API

ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 100, 50);   // draws a blue rectangle at (10,10), 100×50 pixels
```

**What it hides:** The pixel buffer, GPU rasterization, anti-aliasing, pixel format
conversion. You call drawing commands; the browser handles turning them into pixels.

**Project Application:**
LAB-15 and LAB-16 use canvas for the particle system — hundreds of dots that must be
re-drawn every frame. The portfolio's background canvas (LAB-30) is a Three.js canvas,
but its setup is the same concept.

**Watch for:** The `width` and `height` attributes of `<canvas>` set the drawing surface
resolution. CSS `width` and `height` scale it visually. If you set `canvas.width = 800`
but CSS makes it 1600px wide, drawings are stretched 2×. Always set `canvas.width` and
`canvas.height` to match the actual pixel dimensions.

---

## Concept: The Canvas Coordinate System

**What it is:** The canvas coordinate origin (0, 0) is the **top-left corner**. X increases
to the right. Y increases **downward**. This matches CSS, but is opposite to math (where Y
increases upward).

```
(0,0) ──────────────────────→ X increases right
  │
  │
  │
  │
  ↓
  Y increases down
```

**Canonical example:**

```
Canvas: 800×600 pixels

(0, 0)    = top-left corner
(800, 0)  = top-right corner
(0, 600)  = bottom-left corner
(400, 300) = exact center
```

To draw at the center:
```js
ctx.fillRect(canvas.width / 2 - 25, canvas.height / 2 - 25, 50, 50);
// Offset by half the rectangle's size to center it
```

**Watch for:** When drawing circles, the position you give is the *center* of the circle
(using `arc`), not the top-left corner. Rectangles use the top-left corner. Keep these
distinct — a common mistake is placing a circle at (0,0) and only seeing a quarter of it.

---

## Concept: The 2D Drawing API (`CanvasRenderingContext2D`)

**What it is:** `ctx` (from `canvas.getContext('2d')`) is an object with methods for
drawing shapes, paths, text, and images. Every drawing operation uses the current state
of `ctx` (fill color, stroke color, line width, font) set before the draw call.

**The most-used methods:**

```js
// Rectangles
ctx.fillStyle = '#6c63ff';
ctx.fillRect(x, y, width, height);          // filled rectangle
ctx.strokeRect(x, y, width, height);        // outlined rectangle

// Circles (using arc path)
ctx.beginPath();                             // start a new path
ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);   // full circle
ctx.fill();                                  // fill the current path
ctx.stroke();                                // or stroke (outline)

// Lines
ctx.beginPath();
ctx.moveTo(x1, y1);                          // start point
ctx.lineTo(x2, y2);                          // end point
ctx.stroke();                                // draw the line

// Text
ctx.font = '24px system-ui';
ctx.fillStyle = 'white';
ctx.fillText('Hello', x, y);                 // x, y is the text baseline position

// Clear
ctx.clearRect(0, 0, canvas.width, canvas.height);   // erase everything
```

**What it hides:** The actual pixel writes, path triangulation, font rendering, anti-aliasing,
blending. You call commands; the browser handles the pixel math.

**Watch for:** `ctx.beginPath()` is required before drawing a new arc or path sequence.
Without it, the new path is added to the previous one — they share fill/stroke calls and
create unexpected shapes. Always `beginPath()` before each new arc or line sequence.

---

## Step 1 — Create Files

`projects/lab-14/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 14 — Canvas Setup</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <!-- The canvas element — JavaScript will size it to fill the window -->
    <canvas id="main-canvas"></canvas>

    <script src="main.js"></script>
  </body>
</html>
```

---

> **CSS AND SEE**
>
> Open with Live Server.
>
> **You should see:** An empty white page. The canvas exists in the DOM but has no size
> set and no drawings yet.

---

## Step 2 — Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: #0d0d1a;
  overflow: hidden;        /* prevent scrollbars from appearing as canvas fills the window */
}

#main-canvas {
  display: block;          /* removes the small baseline gap under inline elements */
  /* width and height come from JavaScript — canvas.width / canvas.height */
}
```

Short CSS — canvas sizing is handled by JavaScript, not CSS, so there is almost nothing
to declare here. The important rules are `margin: 0` on body (no default margin) and
`display: block` on canvas (prevents a small gap).

---

> **CSS AND SEE**
>
> **You should see:** A dark page. The canvas is still invisible — it has no size assigned
> yet. That happens in JavaScript.

---

## Step 3 — Set Up the Canvas

`main.js`:

```js
const canvas = document.querySelector('#main-canvas');
const ctx = canvas.getContext('2d');   // get the 2D drawing API

// Size the canvas to fill the window
function resizeCanvas() {
  canvas.width = window.innerWidth;    // set drawing surface width in pixels
  canvas.height = window.innerHeight;  // set drawing surface height in pixels
  // Note: resizing clears the canvas — redraw after resize
}

resizeCanvas();   // run once on startup

// Resize when the window changes size
window.addEventListener('resize', resizeCanvas);
```

`canvas.width = window.innerWidth` sets the *drawing resolution*, not the CSS display
size. This makes one canvas pixel equal one screen pixel — no stretching.

`window.addEventListener('resize', resizeCanvas)` makes the canvas refill the window
when the user resizes their browser. Resizing automatically clears the canvas (the browser
resets the pixel buffer when dimensions change), so you will need to redraw after resize.

---

> **SAVE AND TRY**
>
> **You should see:** A fully dark background. The canvas fills the window — you can confirm
> by opening DevTools and inspecting `#main-canvas`: its `width` and `height` attributes
> match the window size.
>
> **In DevTools Console:**
> ```js
> document.querySelector('#main-canvas').width   // matches window.innerWidth
> ```

---

## Step 4 — Draw Shapes

Now that the canvas is set up, draw with `ctx`. Add the drawing code after `resizeCanvas()`:

```js
// ---- Draw a filled rectangle ----
ctx.fillStyle = '#6c63ff';                       // purple
ctx.fillRect(60, 60, 120, 80);                   // x=60, y=60, width=120, height=80

// ---- Draw a second rectangle (outlined only) ----
ctx.strokeStyle = '#ff6b6b';                     // red
ctx.lineWidth = 3;
ctx.strokeRect(220, 60, 120, 80);

// ---- Draw a circle ----
ctx.fillStyle = '#4ecdc4';                       // teal
ctx.beginPath();                                 // start a new path
ctx.arc(500, 100, 50, 0, Math.PI * 2);           // center (500,100), radius 50, full circle
ctx.fill();                                      // fill the path

// ---- Draw an outlined circle ----
ctx.strokeStyle = '#ffe66d';                     // yellow
ctx.lineWidth = 4;
ctx.beginPath();
ctx.arc(640, 100, 40, 0, Math.PI * 2);
ctx.stroke();                                    // stroke (outline) the path

// ---- Draw a line ----
ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';   // semi-transparent white
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(60, 200);                             // start point
ctx.lineTo(700, 200);                            // end point
ctx.stroke();

// ---- Draw text ----
ctx.font = 'bold 28px system-ui';
ctx.fillStyle = '#e8e8f0';
ctx.fillText('Canvas Drawing API', 60, 260);     // x, y is the text baseline

ctx.font = '16px system-ui';
ctx.fillStyle = '#7070a0';
ctx.fillText('fillRect  strokeRect  arc  lineTo  fillText', 60, 300);
```

Each shape follows the same pattern: set the style (`fillStyle` or `strokeStyle`), then
call the draw method (`fillRect`, `arc`+`fill`, etc.). For paths (arcs, lines), always
call `beginPath()` first to start fresh.

---

> **SAVE AND TRY**
>
> **You should see:** Two rectangles (one filled purple, one outlined red), two circles
> (one filled teal, one outlined yellow), a horizontal line, and two lines of text — all
> drawn on the dark canvas.
>
> **Change something:** Change `ctx.fillStyle = '#6c63ff'` to `ctx.fillStyle = '#ff6b6b'`.
> Save. The first rectangle is now red.
>
> **In DevTools Console:**
> ```js
> const c = document.querySelector('#main-canvas');
> const x = c.getContext('2d');
> x.fillStyle = 'lime';
> x.fillRect(200, 400, 80, 80);
> ```
> A lime green square appears on the canvas. This is drawing directly from the console.

---

## Step 5 — Draw Function + Clear + Redraw on Resize

Right now the drawings are in a flat sequence — they run once and never update. The correct
pattern is a `draw` function that can be called any time to redraw everything.

Move all the drawing code into a function, call it after `resizeCanvas`, and call it again
in the resize handler:

```js
function draw() {
  // Clear everything first — otherwise old drawings remain when we redraw
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Center of canvas — use for relative positioning
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Filled rectangle — centered
  ctx.fillStyle = '#6c63ff';
  ctx.fillRect(cx - 200, cy - 120, 120, 80);

  // Outlined rectangle
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 3;
  ctx.strokeRect(cx - 60, cy - 120, 120, 80);

  // Filled circle — centered
  ctx.fillStyle = '#4ecdc4';
  ctx.beginPath();
  ctx.arc(cx + 120, cy - 80, 50, 0, Math.PI * 2);
  ctx.fill();

  // Dividing line
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 250, cy);
  ctx.lineTo(cx + 250, cy);
  ctx.stroke();

  // Text centered on canvas
  ctx.font = 'bold 22px system-ui';
  ctx.fillStyle = '#e8e8f0';
  ctx.textAlign = 'center';   // text anchors at center, not left edge
  ctx.fillText('Canvas 2D Drawing API', cx, cy + 60);

  ctx.font = '14px system-ui';
  ctx.fillStyle = '#7070a0';
  ctx.fillText(canvas.width + ' × ' + canvas.height + ' px', cx, cy + 90);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();   // redraw after resize
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
```

`ctx.textAlign = 'center'` changes text drawing so the x coordinate is the *center* of the
text, not the left edge. Set it back to `'left'` if needed.

---

> **SAVE AND TRY**
>
> **You should see:** Shapes centered on the canvas. Resize the browser window — the canvas
> resizes and the shapes redraw, staying centered. The dimensions text updates in real time.
>
> **Change something:** Change `ctx.textAlign = 'center'` to `ctx.textAlign = 'right'` and
> use `cx + 250` instead of `cx` for the x position. The text anchors to its right edge.

---

## 🎯 Challenge: Draw a Grid

**You know:** `ctx.beginPath`, `ctx.moveTo`, `ctx.lineTo`, `ctx.stroke`, canvas dimensions.

**Task:** Draw a grid of lines across the entire canvas — horizontal lines every 60 pixels
and vertical lines every 60 pixels. Use `rgba(255, 255, 255, 0.05)` for the line color.
This will look like faint graph paper on the dark canvas.

**Hint:** Use two `for` loops — one for horizontal lines, one for vertical. Start each line
at 0 and end at `canvas.width` or `canvas.height`.

---

<details>
<summary>▶ Show Solution</summary>

```js
function drawGrid() {
  const SPACING = 60;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x < canvas.width; x += SPACING) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y < canvas.height; y += SPACING) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}
```

Call `drawGrid()` at the top of `draw()` before the shapes — the grid renders under
everything else.

**Key insight:** The `for` loop pattern for grids is the same as the particle loop in
LAB-15. Both iterate over a range of values and draw something at each step.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Canvas fills the window | Canvas `width`/`height` attributes match window size in DevTools |
| Shapes draw on load | Rectangles, circles, line, text visible |
| Resize redraws correctly | Drag window edge — shapes stay centered |
| `clearRect` called on redraw | No ghost shapes from previous sizes |

---

## What's Next

LAB 15 builds a particle system — an array of hundreds of objects, each with a position
and velocity, drawn to canvas every frame using the animation loop. This is the first time
requestAnimationFrame and canvas work together.

---

## Transfer Exercise

`<canvas>` is not the only drawing API. Briefly compare it to three alternatives:
SVG (Scalable Vector Graphics), WebGL, and CSS. For each, give one scenario where you
would choose it over canvas, and one scenario where canvas would be better.

---

## Quick Check Answers

**1. Why use `<canvas>` if CSS can already draw things?**
CSS elements are DOM nodes — they persist, can be re-styled, and the layout engine
positions them. Canvas draws pixels directly — once drawn, they are just colored data in
a buffer. Canvas is better for: thousands of objects (DOM becomes slow above ~100–200
elements), custom drawing algorithms (paths, gradients, pixel manipulation), game loops
that redraw every frame, and visual effects that would be extremely verbose in CSS.

**2. Does the canvas coordinate system match CSS?**
Yes — `(0,0)` is the top-left corner and Y increases downward, exactly as in CSS. This
is opposite to mathematical convention (where Y increases upward), which sometimes confuses
people from a math or game-dev background.

**3. What would `getContext('webgl')` return?**
A `WebGLRenderingContext` — the WebGL drawing API, which gives access to the GPU's graphics
pipeline for 3D rendering. Three.js uses WebGL under the hood. `getContext('2d')` is the
simpler 2D drawing API that works on the CPU. You can only get one context type per canvas —
you cannot mix 2D and WebGL drawing on the same canvas element.
