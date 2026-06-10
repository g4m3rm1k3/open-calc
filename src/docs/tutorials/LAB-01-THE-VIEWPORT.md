# Lab 01 — The Viewport

### CAM System Masterclass

---

## What You Will Build

By the end of this lab you have a single HTML file that opens in a browser and
shows:

- A dark canvas filling the entire window
- A grid drawn from pure math — no shortcuts, no libraries
- A status bar at the bottom showing live X/Y coordinates in "world units" as
  you move the mouse
- The ability to pan (drag to move) and zoom (scroll wheel)
- A `Home` key that snaps back to the default view
- A light/dark theme toggle

Every line of code you write here is the permanent foundation of the CAM
application. You will never throw this away. You will only add to it.

**Time:** 3–5 hours if you read everything. Less if you skim — but don't skim.
This lab contains the concepts that every later lab builds on.

---

## Part 0 — What We Are Actually Doing

Before a single line of code, you need a clear picture of what software
development is and what you are specifically building.

### What is software development?

You write text files that contain instructions. A program reads those files
and executes the instructions. That is the whole thing. Everything else —
frameworks, databases, compilers, build systems — is infrastructure built on
that simple idea.

For web development specifically:

- **HTML files** describe the structure of a page (what elements exist)
- **CSS files** describe the appearance (what those elements look like)
- **JavaScript files** describe the behavior (what happens when the user
  interacts)

The browser reads all three and produces what you see on screen. The browser
is just a very sophisticated program that interprets those three file formats.

### What is a pixel?

A monitor is a grid of tiny lights. Each light is one pixel. A typical monitor
has 1920 × 1080 pixels — 1920 across and 1080 tall. Each pixel can display
any color, represented as three numbers: how much red, how much green, how much
blue (RGB). Each number is 0–255. White is (255, 255, 255). Black is (0, 0, 0).
Red is (255, 0, 0).

Your job, as a graphics programmer, is to decide what color each pixel should
be and communicate that to the hardware. Everything — every UI, every game,
every CAD tool — is just a program that fills pixels with colors.

### What is a Canvas?

HTML has a special element called `<canvas>`. It is a rectangular region of
pixels that JavaScript can draw into directly, one pixel at a time if necessary,
or using higher-level drawing commands (lines, rectangles, arcs).

A canvas is your drawing surface. Your CAD viewport is a canvas. The grid on
screen is drawn by JavaScript calling canvas drawing commands. The geometry
(lines, circles) will be drawn by more canvas commands. Nothing magical happens —
it is a grid of pixels, and your code decides what color each one is.

### Why build this in a browser?

The browser gives you a working rendering surface, event system, and UI
toolkit, instantly, on every operating system, with no install and no compile
step. A change to your JavaScript file is visible in the browser within a
second. This speed of iteration is invaluable when learning geometry and
rendering concepts.

Later (Lab 10), you will port the geometry engine to C++. At that point you
will already understand every algorithm — you will only be learning the language
and the native rendering pipeline. The browser is a fast-feedback prototype
environment, not the final destination.

---

## Part 1 — Tools Setup

Do this once. If you have done it already, skip to Part 2.

### VS Code

VS Code is a code editor. Free. Download from `code.visualstudio.com`.

When you open it:

- `File → Open Folder` opens a folder as a project
- The left sidebar shows files
- The bottom panel has a terminal (`Terminal → New Terminal`)

You need to know three things: how to create a file, how to edit a file, how
to open the terminal. If those are unfamiliar, watch any "VS Code beginners"
video (under 20 minutes) before continuing.

### Live Server

A VS Code extension that serves your files over HTTP. You need this because:

1. Starting in Lab 03 you will use JavaScript modules (`import`/`export`)
2. Browsers block module imports when files are opened directly (`file:///`)
3. Modules need a real server (`http://`)

Install it:

- Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac) to open
  Extensions
- Search `Live Server` — install the one by Ritwick Dey
- To use: right-click `index.html` in the file explorer → `Open with Live
Server`. The URL in the browser should start with `http://127.0.0.1:5500`

You can use it now even though you don't need modules yet. Form the habit.

### Chrome or Edge

Use one of these for DevTools. Press `F12` to open DevTools.
You need:

- **Console tab** — shows errors and `console.log` output
- **Elements tab** — inspect the HTML structure
- **Reload without cache** — `Ctrl+Shift+R` (Windows/Linux), `Cmd+Shift+R`
  (Mac). Always use this when testing changes.

---

## Part 2 — Your First File

Create a folder called `cam` somewhere on your computer. This is your project.
Open it in VS Code (`File → Open Folder`).

Create one file inside it: `index.html`

Type this. Do not copy-paste. Typing forces you to read every character:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CAM</title>
  </head>
  <body>
    <p>Hello</p>
  </body>
</html>
```

Open it in Chrome via Live Server (right-click → Open with Live Server).
You see "Hello" on a white background. That is a working web page.

### What every line means

`<!DOCTYPE html>` — tells the browser this is HTML5. Required. Always first.
Without it, some browsers enter "quirks mode" and behave unpredictably.

`<html lang="en">` — the root element. All content lives inside it. `lang`
tells screen readers and search engines what language the content is in.

`<head>` — contains metadata about the page. Nothing in `<head>` is visible
on screen directly. It contains the page title, links to CSS files, charset
declarations.

`<meta charset="UTF-8">` — declares the text encoding. UTF-8 can represent
every character in every language. Without it, accented characters and symbols
(°, ×, →) may display as garbage. Always include it.

`<title>CAM</title>` — the text shown in the browser tab.

`<body>` — the visible content of the page. Everything you see on screen comes
from elements inside `<body>`.

`<p>Hello</p>` — a paragraph element. `<p>` opens it, `</p>` closes it.

---

## BUILD 1 — Verify

Open `index.html` in Chrome (via Live Server). You should see "Hello" on a
white page. Open DevTools (`F12`). Click the Console tab. There should be no
red errors. If there are, fix them before continuing.

---

## Part 3 — Adding a Canvas

Replace the `<p>Hello</p>` line with this:

```html
<body>
  <canvas id="viewport"></canvas>
</body>
```

Save. The page is now blank — the canvas exists but has no default visual.

Now add a `<script>` tag at the bottom of `<body>` to draw something:

```html
<body>
  <canvas id="viewport"></canvas>

  <script>
    // Get a reference to the canvas element
    const canvas = document.getElementById("viewport");

    // Get the 2D drawing context
    // The context is the object with all the drawing methods
    const ctx = canvas.getContext("2d");

    // Draw a filled blue rectangle
    // fillRect(x, y, width, height)
    ctx.fillStyle = "blue";
    ctx.fillRect(10, 10, 100, 50);
  </script>
</body>
```

Save and reload. You see a blue rectangle in the top-left area of the page.

### What just happened

`document.getElementById('viewport')` searches the HTML document for the
element with `id="viewport"` and returns it. This is how JavaScript accesses
HTML elements — by their ID.

`canvas.getContext('2d')` returns the 2D rendering context. This is the object
that has all the drawing methods. You never draw on the canvas directly — you
draw through the context.

`ctx.fillStyle = 'blue'` sets the current fill color. It stays blue for all
subsequent fill operations until you change it.

`ctx.fillRect(10, 10, 100, 50)` draws a filled rectangle. The four numbers are:

- `10` — X position of the top-left corner (10 pixels from the left edge)
- `10` — Y position of the top-left corner (10 pixels from the top)
- `100` — width in pixels
- `50` — height in pixels

**This is your first encounter with canvas coordinates.** Notice: `(10, 10)`
is near the top-left. We will address the coordinate system in the next part.

---

## BUILD 2 — Experiment

Change the four numbers in `fillRect` and reload to confirm your understanding:

- `fillRect(0, 0, 50, 50)` — should be in the very top-left corner
- `fillRect(200, 100, 30, 30)` — should be further right and down
- `ctx.fillStyle = 'red'` — should change the color

---

## Part 4 — The Coordinate System Problem

This is the most important concept in this entire lab. Read it carefully.

### Canvas coordinates vs math coordinates

In school mathematics, coordinates work like this:

- `(0, 0)` is at the center (or wherever you define the origin)
- X increases to the **right**
- Y increases **upward**
- So the point `(3, 4)` is 3 units right and 4 units up from the origin

The HTML canvas works differently:

- `(0, 0)` is at the **top-left corner**
- X increases to the right (same)
- Y increases **downward** — the further down, the higher the Y value
- So `(3, 4)` is 3 pixels right and 4 pixels _down_ from the top-left

This is not an accident. It comes from how CRT monitors worked: the electron
beam scanned from top-left to bottom-right, row by row. Row 0 was the top.
This convention persisted into every 2D graphics API.

**The consequence:** if you draw a triangle with points `(0,0), (100,0), (50,100)`
on a canvas, it points _downward_. In math coordinates, the same points
describe a triangle pointing _upward_. They are mirror images along the Y axis.

For a CAD system, this is a real problem. When a machinist types "move the tool
to Y = 50mm," they mean 50mm upward from the part datum — not 50mm down from
the screen's top edge. The math must be right, and that means Y must increase
upward in our geometry system, even though the screen has Y increasing downward.

The solution is a **coordinate transform** — a function that converts between
two different coordinate systems. You will build this in Part 7. For now,
you need to feel the problem.

### Demonstrate the problem

Add this to your script (after the fillRect):

```js
// Draw a triangle using canvas coordinates
ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // semi-transparent red
ctx.beginPath();

// Three points: (200,10), (300,10), (250,80)
// In canvas coordinates, (250,80) is BELOW the first two points
ctx.moveTo(200, 10); // start here
ctx.lineTo(300, 10); // line to here
ctx.lineTo(250, 80); // line to here
ctx.closePath(); // line back to start
ctx.fill();
```

The triangle points downward. In math, a point with a larger Y would be higher
up — this triangle's apex would point upward. The Y axis is flipped.

We will fix this in Part 7 with a proper world-to-canvas conversion. For now,
keep this discrepancy in mind at every step.

---

## Part 5 — CSS: Making the Canvas Fill the Window

Our CAD viewport needs to fill the entire browser window, not sit as a tiny
element in the top-left. This requires CSS.

### What CSS is

CSS (Cascading Style Sheets) controls how HTML elements look and behave on
screen — their size, color, position, spacing, font. Without CSS, every web
page looks like plain text on a white background with default browser styling.

CSS rules look like this:

```css
selector {
  property: value;
}
```

The `selector` targets HTML elements. The `property: value` pairs set style
properties on those elements.

### The box model — the fundamental CSS concept

Every HTML element is a box. Every box has four regions, from inside out:

```
┌──────────────────────────────┐
│  margin (space outside)      │
│  ┌────────────────────────┐  │
│  │  border                │  │
│  │  ┌──────────────────┐  │  │
│  │  │  padding         │  │  │
│  │  │  ┌────────────┐  │  │  │
│  │  │  │  content   │  │  │  │
│  │  │  └────────────┘  │  │  │
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**Content** — the actual stuff (text, an image, a canvas drawing surface).

**Padding** — space between the content and the border. Background color
fills padding. Clicking anywhere in padding triggers mouse events on the element.

**Border** — a visible line around the element. Has a width, style, and color.

**Margin** — space outside the border, between this element and its neighbors.
Margins are transparent — they do not have a background color.

By default, `width` and `height` in CSS apply only to the content area. This
is confusing: if you set `width: 100px` and then add `padding: 10px`, the
element's total visual width becomes 120px. This surprises everyone.

The fix: `box-sizing: border-box` makes `width` and `height` include padding
and border. The content area shrinks to compensate. This is almost always
what you want, and we will apply it globally.

### Add a `<style>` block

Replace your entire `index.html` with this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CAM</title>
    <style>
      /* Apply box-sizing: border-box to every element.
       *         = every element
       *::before  = pseudo-elements (decorative content added via CSS)
       *::after   = same
       Without this, adding padding to an element changes its size unexpectedly. */
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      /* Make html and body fill the full window height.
       By default they are only as tall as their content.
       overflow: hidden prevents scrollbars from appearing. */
      html,
      body {
        height: 100%;
        overflow: hidden;
        background: #13131f;
      }

      /* Make the canvas element itself fill its container.
       display: block removes a small inline gap below the canvas.
       The actual drawing resolution is set in JavaScript. */
      #viewport {
        display: block;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <canvas id="viewport"></canvas>

    <script>
      const canvas = document.getElementById("viewport");
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "blue";
      ctx.fillRect(10, 10, 100, 50);
    </script>
  </body>
</html>
```

Save and reload. The background turns dark. The canvas fills the window.
The blue rectangle is still there in the top-left.

---

## Part 6 — The Two Sizes of a Canvas

Here is a subtle bug you must understand and fix before going further.

A `<canvas>` element has **two completely separate sizes**:

1. **CSS size** — how large the element appears on screen, controlled by CSS.
   In our code, `width: 100%; height: 100%` makes the canvas fill the window.

2. **Drawing resolution** — the actual pixel grid JavaScript draws into,
   controlled by the `canvas.width` and `canvas.height` JavaScript properties.
   If you never set these, they default to **300 × 150 pixels**, regardless of
   how large the canvas appears on screen.

What happens with defaults: your canvas is visually 1920 × 1080 pixels (or
whatever your screen is), but JavaScript is drawing into a 300 × 150 pixel
grid. The browser stretches that tiny grid to fill the large area. Everything
looks blurry. And mouse coordinates are completely wrong — a mouse position of
(960, 540) in screen pixels would map to pixel (150, 75) in the drawing buffer.

**The fix:** read the canvas's actual CSS-rendered size and set the drawing
resolution to match.

Update the `<script>` block:

```html
<script>
  const canvas = document.getElementById("viewport");
  const ctx = canvas.getContext("2d");

  // Fix the canvas resolution to match its CSS size.
  // getBoundingClientRect() returns the element's actual rendered position
  // and size on screen, accounting for all CSS.
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
  }

  // Run once at page load
  resizeCanvas();

  // Run again whenever the browser window is resized
  window.addEventListener("resize", resizeCanvas);

  // Draw something to verify it fills the window at full resolution
  ctx.fillStyle = "#2255ff";
  ctx.fillRect(10, 10, 100, 50);
</script>
```

Save and reload. Try resizing the browser window. The canvas adjusts.

> **Note on high-DPI (Retina) screens:** On a Retina display, one CSS pixel is
> two physical pixels. A canvas set to CSS 500px wide draws into 500 logical
> pixels, but the screen has 1000 physical pixels in that space. The result is
> slightly soft drawing on Retina. The fix involves `window.devicePixelRatio`.
> We will add this in Lab 09 when we build the final production viewport. For
> now, understand the concept exists and move on.

---

## BUILD 3 — Confirm resolution

Open DevTools → Console. Type:

```js
console.log(canvas.width, canvas.height);
```

You should see numbers matching your browser window size. If you see `300 150`,
the resize is not working. Fix it before continuing.

---

## Part 7 — The Coordinate System: Designing World Space

Now we solve the Y-flipped coordinate problem properly.

### Three spaces

At any moment in this application, a position can be in one of three spaces:

**Screen space (browser pixels):**
The raw pixel coordinates of the browser window. `(0, 0)` is the top-left
corner of the _window_. X increases right, Y increases _down_. Mouse events
give you screen-space coordinates. You almost never use these directly.

**Canvas space (drawing buffer pixels):**
Like screen space but relative to the canvas element's top-left corner, not
the window's. `(0, 0)` is the top-left of the canvas. To convert from screen
to canvas: subtract the canvas's position on the screen (using
`getBoundingClientRect()`).

**World space (your coordinate system — in millimeters):**
This is the coordinate system geometry lives in. `(0, 0)` is the origin — by
default, we place it at the center of the viewport. X increases right. Y
increases _upward_ (opposite of canvas). When a machinist says "the line goes
from (0, 0) to (50, 30)," those are world-space millimeters.

The canvas API speaks canvas space. Your geometry speaks world space. The
**coordinate transform** is the bridge.

### Deriving the transform

Let's derive the formula from scratch. Suppose:

- The canvas is `W` pixels wide and `H` pixels tall
- We want world origin `(0, 0)` at the center of the canvas
- We want `zoom` pixels per world unit (1 world unit = 1 mm, so `zoom=50`
  means 50 pixels = 1mm)
- We want to be able to pan: `panX` and `panY` are pixel offsets of the origin

**Question: where should the world point `(wx, wy)` appear on the canvas?**

Step 1 — Start at the canvas center: `(W/2, H/2)`

Step 2 — Move right by `wx * zoom` pixels (one world unit = `zoom` pixels):

- Canvas X = `W/2 + wx * zoom`

Step 3 — Y is flipped: world Y up = canvas Y down. Move _up_ by `wy * zoom`
means decreasing canvas Y (since canvas Y increases downward):

- Canvas Y = `H/2 - wy * zoom`

Step 4 — Apply pan offset:

- Canvas X = `W/2 + wx * zoom + panX`
- Canvas Y = `H/2 - wy * zoom + panY`

**That is the world-to-canvas formula.** Written as a function:

```
canvasX = canvas.width/2  + wx * zoom + panX
canvasY = canvas.height/2 - wy * zoom + panY
```

**The inverse — canvas to world:**

Solving for `wx` and `wy`:

```
canvasX = canvas.width/2  + wx * zoom + panX
wx = (canvasX - canvas.width/2  - panX) / zoom

canvasY = canvas.height/2 - wy * zoom + panY
wy = (canvas.height/2 - canvasY + panY) / zoom
   = -(canvasY - canvas.height/2 - panY) / zoom
```

Verify this mentally:

- At `zoom=50, panX=0, panY=0`:
  - World `(0, 0)` → canvas `(W/2, H/2)` — the center. ✓
  - World `(1, 0)` → canvas `(W/2 + 50, H/2)` — 50px right. ✓
  - World `(0, 1)` → canvas `(W/2, H/2 - 50)` — 50px _above_ center. ✓

Now implement this. Add an application state object and the two functions:

```html
<script>
  const canvas = document.getElementById("viewport");
  const ctx = canvas.getContext("2d");

  // ── Application state ───────────────────────────────────────────────────────
  // All mutable data for the app lives in one place.
  // This mirrors how real applications work: one authoritative state object.
  // To know what the app looks like: read state.
  // To change the app: modify state and call render().
  const state = {
    view: {
      panX: 0, // pixel offset of world origin from canvas center (right = +)
      panY: 0, // pixel offset of world origin from canvas center (down = +)
      zoom: 50, // pixels per world unit. zoom=50 means 1mm = 50 pixels.
    },
  };

  // ── Canvas resize ───────────────────────────────────────────────────────────
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
  }

  resizeCanvas();
  window.addEventListener("resize", () => {
    resizeCanvas();
    render();
  });

  // ── Coordinate transforms ───────────────────────────────────────────────────

  // World space → canvas pixel.
  // wx, wy: position in world units (mm).
  // Returns: { x, y } in canvas pixels.
  function worldToCanvas(wx, wy) {
    const { panX, panY, zoom } = state.view;
    return {
      x: canvas.width / 2 + wx * zoom + panX,
      y: canvas.height / 2 - wy * zoom + panY,
    };
  }

  // Canvas pixel → world space.
  // cx, cy: position in canvas pixels.
  // Returns: { x, y } in world units (mm).
  function canvasToWorld(cx, cy) {
    const { panX, panY, zoom } = state.view;
    return {
      x: (cx - canvas.width / 2 - panX) / zoom,
      y: -(cy - canvas.height / 2 - panY) / zoom,
    };
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  function render() {
    // Clear the canvas
    ctx.fillStyle = "#13131f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Test: draw a circle at world origin (0, 0)
    const origin = worldToCanvas(0, 0);
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Test: draw a line from world (0,0) to world (10, 10)
    const a = worldToCanvas(0, 0);
    const b = worldToCanvas(10, 10);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  render();
</script>
```

Save and reload. You should see:

- A dark background
- A small red dot near the center-left of the window (the world origin)
- A yellow line going up and to the right from that dot

The dot is near center because `panX=0, panY=0, zoom=50`. The line goes to
world `(10, 10)` which is 10 units right and 10 units _up_ — so it goes
upper-right on screen. Y-up is working.

---

## BUILD 4 — Test the coordinate transforms

Open DevTools Console and type these one at a time to verify:

```js
// Where does world (0,0) appear? Should be near center.
console.log(worldToCanvas(0, 0));

// Where does world (10, 0) appear? Should be further right.
console.log(worldToCanvas(10, 0));

// What world point is at canvas center?
console.log(canvasToWorld(canvas.width / 2, canvas.height / 2));
// Should print: { x: 0, y: 0 }
```

If the results don't match expectations, the bug is in your formula. Fix it now.

---

## Part 8 — Design Tokens: Professional CSS

Before drawing the grid, we need to set up the color system properly. This is
not cosmetic — it is how professional apps maintain visual consistency and
support themes.

### What is a design token?

A design token is a named value in your design system. Instead of writing
`color: #13131f` in 40 places (and then having to find and change all 40 when
you want a slightly different dark shade), you define one CSS custom property
(variable) and reference it everywhere.

CSS custom properties look like this:

```css
:root {
  --bg: #13131f;
}

/* Usage */
body {
  background: var(--bg);
}
```

`:root` is a pseudo-class that matches the `<html>` element. Custom properties
defined there are accessible everywhere in the document. The `--` prefix is
required (it is how the browser distinguishes custom properties from built-in
ones like `color` or `width`).

To change the dark theme to a slightly different dark: change `--bg` in one
place, and every element using `var(--bg)` updates automatically.

### Add design tokens to your CSS

Replace the `<style>` block in your `index.html` with this:

```html
<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── Design tokens ─────────────────────────────────────────────────────────
     Named values for every color, size, and spacing used in this app.
     Change the theme by changing these values.
     Add a light theme by overriding them on [data-theme="light"].          */
  :root {
    /* Background colors */
    --color-bg: #13131f; /* main canvas background */
    --color-surface: #111120; /* panels, sidebars */
    --color-border: #252538; /* borders between regions */

    /* Text colors */
    --color-text: #ccccdd; /* primary text */
    --color-text-dim: #778899; /* secondary text */
    --color-text-faint: #445566; /* disabled / placeholder text */

    /* Accent colors */
    --color-accent: #4aaeff; /* active elements, highlights */
    --color-geometry: #4aaeff; /* drawn geometry */
    --color-selected: #ff9944; /* selected geometry */
    --color-axis-x: #ff4455; /* X axis line */
    --color-axis-y: #44ff77; /* Y axis line */

    /* Grid colors */
    --color-grid: #1a1a2e; /* minor grid lines */
    --color-grid-major: #222238; /* major grid lines */

    /* Sizing */
    --statusbar-height: 24px;
    --font-body: "Segoe UI", system-ui, sans-serif;
    --font-mono: "Cascadia Code", "Consolas", monospace;
  }

  /* ── Light theme override ───────────────────────────────────────────────────
     When html has data-theme="light", these values override the defaults above.
     Every element using var(--color-bg) etc. automatically picks up the change.
     No other CSS needs to change.                                            */
  [data-theme="light"] {
    --color-bg: #f5f5fa;
    --color-surface: #ebebf5;
    --color-border: #c8c8d8;
    --color-text: #222233;
    --color-text-dim: #445566;
    --color-text-faint: #8899aa;
    --color-grid: #d8d8e8;
    --color-grid-major: #c0c0d4;
  }

  html,
  body {
    height: 100%;
    overflow: hidden;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: 13px;
  }

  #viewport {
    display: block;
    width: 100%;
    height: 100%;
    cursor: crosshair;
  }
</style>
```

Now update `render()` to use CSS variables for the background color:

```js
function render() {
  // Read the current background color from the CSS design tokens.
  // getComputedStyle reads the actual computed value of a CSS property,
  // including any custom property value. .trim() removes whitespace.
  const bg =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-bg")
      .trim() || "#13131f";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // (test shapes from before remain here)
}
```

---

## Part 9 — Drawing the Grid

The grid is a visual coordinate reference. It shows where world space units
are and lets you visually judge distances. We draw it with pure math —
no canvas grid shortcuts, no library functions.

### What a grid is

A grid is a set of evenly-spaced horizontal lines and evenly-spaced vertical
lines. In world space, we want a line every `unit` millimeters — for example,
every 10mm. In canvas pixels, those lines are `unit * zoom` pixels apart.

The challenge: the world is conceptually infinite, but the canvas has finite
size. We only draw lines that are currently visible.

**Finding the visible world range:**
The visible portion of the world is determined by the canvas size and the view
transform. The canvas top-left corner `(0, 0)` corresponds to a world position.
The canvas bottom-right corner `(canvas.width, canvas.height)` corresponds to
another. Everything between those two world positions is visible.

```
worldTopLeft     = canvasToWorld(0, 0)
worldBottomRight = canvasToWorld(canvas.width, canvas.height)
```

**Iterating grid lines:**
For vertical grid lines, we need every world X value that is a multiple of
`unit` within `[worldTopLeft.x, worldBottomRight.x]`. The first one to the
left of the left edge:

```
firstX = Math.floor(worldTopLeft.x / unit) * unit
```

`Math.floor(n / unit) * unit` rounds down to the nearest multiple of `unit`.
Then we step by `unit` until we pass the right edge.

### Adaptive grid spacing — why it matters

At very low zoom (zoomed far out), drawing a line every 1mm would mean drawing
tens of thousands of lines — so many they would paint the canvas solid. At very
high zoom (zoomed far in), drawing every 1mm would put lines 5000 pixels apart
— effectively no grid.

The solution: adapt the grid spacing to the current zoom level so there are
always a reasonable number of lines visible (roughly 5–15).

The target: about 8 grid divisions across the narrower dimension of the viewport.
The world width visible is `canvas.width / zoom`. We want to divide that into
~8 sections:

```
roughUnit = (canvas.width / zoom) / 8
```

Then round to a "nice" number — 1, 2, 5, 10, 20, 50, 100, etc. Humans find
these easier to read than 7 or 13 or 23.

```js
function niceGridUnit(rough) {
  const niceValues = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  // Find the first nice value that is >= rough
  for (const n of niceValues) {
    if (n >= rough) return n;
  }
  return niceValues[niceValues.length - 1];
}
```

This same adaptive logic exists in every professional CAD viewer, every map
renderer (Google Maps does exactly this with grid labels), and every charting
library.

### Why `+ 0.5` for sharp lines

Canvas draws lines centered on the coordinate. A line at X = 100 is drawn half
on pixel 99 and half on pixel 100, producing a 2-pixel-wide blurry line. A line
at X = 100.5 is exactly on the boundary between pixel 100 and 101, producing a
crisp 1-pixel line. Always snap grid line coordinates to half-pixel:

```js
const snapped = Math.round(rawCoord) + 0.5;
```

### Why `ctx.save()` and `ctx.restore()`

The canvas has global drawing state: current color, line width, transform, font,
etc. If `drawGrid()` sets `lineWidth = 1` and `render()` later needs
`lineWidth = 3`, the grid function will have broken the state. `save()` pushes
all current state onto a stack. `restore()` pops it back. Every drawing function
that changes canvas state should save/restore.

### Now add the grid

Add these functions to your script. Replace the test shapes in `render()` with
the `drawGrid()` call:

```js
// ── Grid ────────────────────────────────────────────────────────────────────

function niceGridUnit(rough) {
  const niceValues = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  for (const n of niceValues) {
    if (n >= rough) return n;
  }
  return niceValues[niceValues.length - 1];
}

function getToken(name) {
  // Read a CSS custom property value from the root element.
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function drawGrid() {
  const { zoom } = state.view;

  // Find the visible world extent by inverting the view transform
  const topLeft = canvasToWorld(0, 0);
  const bottomRight = canvasToWorld(canvas.width, canvas.height);

  // Visible world width (note: Y is flipped, so bottomRight.y < topLeft.y)
  const worldWidth = bottomRight.x - topLeft.x;

  // Target: ~8 grid divisions across the viewport
  const roughUnit = worldWidth / 8;
  const unit = niceGridUnit(roughUnit);

  ctx.save();
  ctx.lineWidth = 1;

  // ── Minor grid lines ───────────────────────────────────────────────────────
  ctx.strokeStyle = getToken("--color-grid");
  ctx.beginPath();

  // Vertical lines (constant world X, varying Y from top to bottom of canvas)
  const firstX = Math.floor(topLeft.x / unit) * unit;
  for (let wx = firstX; wx <= bottomRight.x + unit; wx += unit) {
    const sx = Math.round(worldToCanvas(wx, 0).x) + 0.5;
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, canvas.height);
  }

  // Horizontal lines (constant world Y, varying X from left to right)
  // Note: bottomRight.y < topLeft.y because Y is flipped
  const firstY = Math.floor(bottomRight.y / unit) * unit;
  for (let wy = firstY; wy <= topLeft.y + unit; wy += unit) {
    const sy = Math.round(worldToCanvas(0, wy).y) + 0.5;
    ctx.moveTo(0, sy);
    ctx.lineTo(canvas.width, sy);
  }

  ctx.stroke();

  // ── Axes ───────────────────────────────────────────────────────────────────
  // Draw X axis (world Y = 0) and Y axis (world X = 0) more prominently.
  ctx.strokeStyle = getToken("--color-grid-major");
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  // X axis: the horizontal line where world Y = 0
  const axisY = Math.round(worldToCanvas(0, 0).y) + 0.5;
  ctx.moveTo(0, axisY);
  ctx.lineTo(canvas.width, axisY);

  // Y axis: the vertical line where world X = 0
  const axisX = Math.round(worldToCanvas(0, 0).x) + 0.5;
  ctx.moveTo(axisX, 0);
  ctx.lineTo(axisX, canvas.height);

  ctx.stroke();

  // ── Axis labels ────────────────────────────────────────────────────────────
  // Show the origin marker
  ctx.fillStyle = getToken("--color-text-faint");
  ctx.font = `11px ${getToken("--font-mono")}`;
  ctx.fillText("0", axisX + 4, axisY - 4);

  ctx.restore();
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const bg = getToken("--color-bg") || "#13131f";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
}

render();
```

Save and reload. You should see a dark canvas with a subtle grid and slightly
brighter axis lines crossing at the center.

---

## BUILD 5 — Test the grid

In DevTools Console, test the zoom response:

```js
state.view.zoom = 5;
render(); // zoomed far out, should see more grid
state.view.zoom = 500;
render(); // zoomed far in, grid lines far apart
state.view.zoom = 50;
render(); // reset to default
```

At every zoom level, the grid should show a reasonable number of lines — never
so many they paint the screen solid, never so few the grid disappears. That is
`niceGridUnit` working correctly.

Also test pan:

```js
state.view.panX = 200;
render(); // grid shifts right
state.view.panY = -100;
render(); // grid shifts up
state.view.panX = 0;
state.view.panY = 0;
render(); // reset
```

---

## Part 10 — The Status Bar

The status bar is a narrow strip at the bottom showing the current world
coordinates of the mouse cursor. This is essential for a CAD tool: the user
needs to see exactly where in the coordinate system they are pointing.

### Add the status bar to the HTML

We need to restructure the HTML. The page now has two regions: the canvas
(fills remaining space) and the status bar (fixed height at the bottom).

This is a layout problem. We solve it with CSS Flexbox.

### What Flexbox is

Flexbox is a CSS layout mode designed for one-dimensional layouts (either a row
or a column). When a container has `display: flex`, its direct children become
**flex items** that lay out according to flex rules.

Key properties:

- `flex-direction: column` — children stack vertically (top to bottom)
- `flex: 1` on a child — "take all remaining space after other children have
  taken what they need"
- `flex-shrink: 0` — "do not shrink even if space is tight"

Our layout:

- `<div id="app">` is the flex container, `flex-direction: column`, fills window
- `<canvas>` is `flex: 1` — takes all space not used by status bar
- `<div id="statusbar">` is `flex-shrink: 0` with a fixed height

Update the HTML body and style:

```html
<body>
  <!-- App container: a flex column filling the window -->
  <div id="app">
    <!-- Canvas: flex: 1 means "take all remaining height" -->
    <canvas id="viewport"></canvas>

    <!-- Status bar: fixed height, pinned to bottom -->
    <div id="statusbar">
      <span id="sb-x">X: —</span>
      <span id="sb-y">Y: —</span>
      <span id="sb-zoom">1.00×</span>
      <span id="sb-msg">Ready</span>
    </div>
  </div>

  <script>
    // ... (JavaScript from before, unchanged)
  </script>
</body>
```

Add these CSS rules:

```css
/* App container: flex column filling the full window */
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Canvas: take all space above the status bar */
#viewport {
  display: block;
  flex: 1; /* ← fills remaining space */
  cursor: crosshair;
  /* Remove the width/height: 100% we had before — flex: 1 handles size */
}

/* Status bar: fixed height, flex-shrink: 0 means it won't compress */
#statusbar {
  flex-shrink: 0;
  height: var(--statusbar-height);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex; /* status bar itself is also a flex row */
  align-items: center; /* vertically center the spans */
  padding: 0 12px;
  gap: 20px; /* space between spans */
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-faint);
  user-select: none; /* prevent text selection when clicking */
}

/* Coordinate displays: slightly brighter than status bar base */
#sb-x,
#sb-y,
#sb-zoom {
  color: var(--color-text-dim);
}

/* Message: pushed to the right edge using margin-left: auto */
#sb-msg {
  margin-left: auto;
}
```

Save and reload. You should see the canvas filling most of the window with a
thin dark status bar at the bottom.

---

## Part 11 — Mouse Tracking and Live Coordinates

Now make the status bar show live world coordinates as the mouse moves.

### How mouse events work

When the user moves the mouse over an element, the browser fires a `mousemove`
event. You can attach a **listener function** that runs every time this event
fires:

```js
element.addEventListener("eventType", function (e) {
  // e is the event object — contains information about what happened
});
```

For mouse events, `e.clientX` and `e.clientY` are the mouse position in screen
pixels, relative to the browser viewport (not the canvas).

To get the position in canvas pixels, subtract the canvas's position on screen
using `getBoundingClientRect()`.

### The security note on status bar content

When you display content from user input (or from any external data) in HTML,
you must be careful about **Cross-Site Scripting (XSS)**. If you put untrusted
content directly into `element.innerHTML`, malicious input could inject
JavaScript. Always use `element.textContent` for plain text — it never executes
scripts, only sets text.

We use `textContent` here, not `innerHTML`.

Add the mouse tracking to your script:

```js
// ── Status bar references ────────────────────────────────────────────────────
const sbX = document.getElementById("sb-x");
const sbY = document.getElementById("sb-y");
const sbZoom = document.getElementById("sb-zoom");
const sbMsg = document.getElementById("sb-msg");

// ── Mouse tracking ────────────────────────────────────────────────────────────

// Convert a MouseEvent to canvas-space pixel coordinates.
// e.clientX/Y is relative to the browser viewport.
// rect.left/top is the canvas's offset within the viewport.
// Subtracting gives coordinates relative to the canvas top-left.
function eventToCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

canvas.addEventListener("mousemove", (e) => {
  const cp = eventToCanvas(e); // canvas pixels
  const world = canvasToWorld(cp.x, cp.y); // world mm

  // padStart(9) left-pads the string to 9 characters total.
  // This keeps the display from jumping as the sign or digit count changes.
  // 'X:   12.500' and 'X:  -12.500' have the same width.
  sbX.textContent = `X: ${world.x.toFixed(3).padStart(9)}`;
  sbY.textContent = `Y: ${world.y.toFixed(3).padStart(9)}`;
});

// When mouse leaves the canvas, show dashes
canvas.addEventListener("mouseleave", () => {
  sbX.textContent = "X:       —";
  sbY.textContent = "Y:       —";
});
```

Save and reload. Move your mouse over the canvas. The X/Y values should update
in real time. Move to the center — should read approximately `X: 0.000 Y: 0.000`.
Move right — X increases. Move up — Y increases. If Y decreases when you move
up, your `canvasToWorld` formula has a sign error.

---

## BUILD 6 — Verify coordinates

Move your mouse to:

- The center of the canvas → should be near `X: 0.000  Y: 0.000`
- Far right edge → large positive X
- Top edge → large positive Y (because Y-up)
- Bottom edge → large negative Y
- Left edge → large negative X

If any of these are wrong, find the bug in `canvasToWorld` before continuing.

---

## Part 12 — Pan: Moving the View

Pan lets the user drag the view to see different parts of the world. The
mechanic: when the user right-clicks and drags (or middle-clicks and drags),
each pixel the mouse moves shifts the world by the same amount.

### The math

Pan is stored in `state.view.panX` and `state.view.panY` as pixel offsets.
When the mouse moves by `(dx, dy)` canvas pixels during a drag, we add that
to the pan:

```
panX += dx
panY += dy
```

No coordinate conversion needed — pan is in pixels, mouse delta is in pixels.
They add directly.

### The implementation

We need three event listeners:

- `mousedown` — start drag (record starting position)
- `mousemove` — update pan while dragging
- `mouseup` — end drag

`mouseup` should be on `window`, not `canvas`, because the user might release
the mouse button outside the canvas.

Add to your script:

```js
// ── Pan (drag to move) ────────────────────────────────────────────────────────
let isPanning = false;
let panStart = { x: 0, y: 0 }; // canvas pixel position when drag started

canvas.addEventListener("mousedown", (e) => {
  // Right button (2) or middle button (1) initiates pan
  if (e.button === 1 || e.button === 2) {
    isPanning = true;
    panStart = eventToCanvas(e);
    e.preventDefault(); // prevent right-click context menu from appearing
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isPanning) {
    const now = eventToCanvas(e);

    // How far did the mouse move?
    const dx = now.x - panStart.x;
    const dy = now.y - panStart.y;

    // Add that to the pan (in pixels, directly)
    state.view.panX += dx;
    state.view.panY += dy;

    // Update our reference position for the next move event
    panStart = now;

    render();
  }

  // (coordinate display update stays here, inside this handler)
  const cp = eventToCanvas(e);
  const world = canvasToWorld(cp.x, cp.y);
  sbX.textContent = `X: ${world.x.toFixed(3).padStart(9)}`;
  sbY.textContent = `Y: ${world.y.toFixed(3).padStart(9)}`;
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 1 || e.button === 2) isPanning = false;
});

// Prevent the right-click context menu from appearing over the canvas
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
```

Save. Right-drag to pan. The grid should move with you.

---

## Part 13 — Zoom: Scaling the View

Zoom changes how many pixels represent one world unit. Zooming in (larger zoom
value) means fewer world units fit on screen but they appear larger and more
detailed. Zooming out (smaller zoom value) means more world units fit on screen.

### The naive approach and why it fails

The simplest zoom: multiply `state.view.zoom` by a factor. But this zooms
around the canvas center — the center of the screen stays fixed, but everything
else moves. If you were looking at a detail in the corner, it flies away after
zooming.

**Professional behavior:** the point under the cursor stays fixed. As you zoom
in, the thing you're hovering over stays exactly under the mouse. Everything
else contracts toward it. This is how every professional tool (Google Maps,
Figma, Fusion 360) works. It is the correct and expected behavior.

### Deriving the anchor-point zoom

The algorithm:

1. Record the world position of the cursor _before_ changing zoom
2. Change `zoom`
3. The cursor's world position now maps to a _different_ canvas position
4. Compensate by adjusting `panX`/`panY` so the world point returns to the
   cursor's canvas position

Step by step:

```
before = canvasToWorld(cursor.x, cursor.y)    // world point under cursor

zoom = zoom * factor                          // change zoom

after = worldToCanvas(before.x, before.y)    // where does that point now appear?
// It moved! We need to shift it back.

panX += cursor.x - after.x                   // shift by how far it moved
panY += cursor.y - after.y
```

After these adjustments, converting `before` back to canvas should give
exactly `(cursor.x, cursor.y)`. The cursor's world point is pinned.

### Wheel events and `{ passive: false }`

The browser fires `wheel` events for scroll wheel input. By default, browsers
mark wheel events as "passive" — this is an optimization that lets the browser
scroll smoothly without waiting for JavaScript. But a passive event listener
cannot call `e.preventDefault()`, which we need to stop the page from scrolling.

Setting `{ passive: false }` opts out of the optimization and lets us call
`preventDefault()`. Required for viewport zoom.

Add to your script:

```js
// ── Zoom (scroll wheel) ───────────────────────────────────────────────────────
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault(); // stop page from scrolling

    const cp = eventToCanvas(e);

    // Record where the cursor is in world space BEFORE changing zoom
    const worldBefore = canvasToWorld(cp.x, cp.y);

    // Apply zoom factor.
    // e.deltaY < 0: scrolled up = zoom in (larger zoom value)
    // e.deltaY > 0: scrolled down = zoom out (smaller zoom value)
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;

    // Clamp zoom between 1px/unit (far out) and 5000px/unit (far in)
    state.view.zoom = Math.max(1, Math.min(5000, state.view.zoom * factor));

    // Find where the cursor's world point now appears on screen
    const canvasAfter = worldToCanvas(worldBefore.x, worldBefore.y);

    // Compensate: shift pan so the cursor's world point is back under the cursor
    state.view.panX += cp.x - canvasAfter.x;
    state.view.panY += cp.y - canvasAfter.y;

    // Update the zoom indicator in the status bar
    // zoom / 50 gives a multiplier relative to 1:1 (where 50px = 1mm)
    sbZoom.textContent = `${(state.view.zoom / 50).toFixed(2)}×`;

    render();
  },
  { passive: false },
); // ← required to call preventDefault()
```

Save. Scroll over the canvas. The grid should zoom in and out. The grid point
under your cursor should stay under your cursor as you zoom.

---

## BUILD 7 — Pan + zoom verification

Right-drag to a distinctive grid intersection. Then scroll to zoom in on it.
The intersection must stay exactly under your cursor. If it drifts, the pan
compensation math is wrong — the most common error is forgetting that `after`
must be computed _after_ setting the new zoom.

---

## Part 14 — Keyboard Shortcuts

Two keyboard shortcuts are immediately useful:

- `Home` or `F` — reset view to default (zoom=50, pan=0)
- `G` — go to origin (reset pan but keep zoom)
- `T` — toggle theme

### Guarding shortcuts against text input

If you attach a `keydown` listener globally and the user happens to be focused
on a form input field, pressing `F` would reset the view instead of typing "F"
in the field. Always check `document.activeElement.tagName`:

```js
// ── Keyboard shortcuts ────────────────────────────────────────────────────────

document.addEventListener("keydown", (e) => {
  // If the user is typing in a form field, ignore all shortcuts.
  const tag = document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

  switch (e.key) {
    case "Home":
    case "f":
    case "F":
      // Reset view: center origin, default zoom
      state.view.panX = 0;
      state.view.panY = 0;
      state.view.zoom = 50;
      sbZoom.textContent = "1.00×";
      render();
      break;

    case "g":
    case "G":
      // Go to origin: keep zoom, center on (0,0)
      state.view.panX = 0;
      state.view.panY = 0;
      render();
      break;

    case "t":
    case "T":
      toggleTheme();
      break;
  }
});

// ── Theme toggle ──────────────────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.dataset.theme;
  html.dataset.theme = currentTheme === "light" ? "dark" : "light";
  // render() re-reads CSS tokens, so it automatically picks up the new theme
  render();
}
```

Save. Test:

- Press `F` — view resets to center
- Scroll out, then press `F` — snaps back
- Press `T` — background toggles between dark and light
- Pan away, press `G` — pans back to center without changing zoom

---

## Part 15 — The Complete Lab 01 File

Here is the complete `index.html`. Make sure yours matches this exactly.
Everything you've built incrementally is assembled here:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CAM</title>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      :root {
        --color-bg: #13131f;
        --color-surface: #111120;
        --color-border: #252538;
        --color-text: #ccccdd;
        --color-text-dim: #778899;
        --color-text-faint: #445566;
        --color-accent: #4aaeff;
        --color-geometry: #4aaeff;
        --color-selected: #ff9944;
        --color-axis-x: #ff4455;
        --color-axis-y: #44ff77;
        --color-grid: #1a1a2e;
        --color-grid-major: #222238;
        --statusbar-height: 24px;
        --font-body: "Segoe UI", system-ui, sans-serif;
        --font-mono: "Cascadia Code", "Consolas", monospace;
      }

      [data-theme="light"] {
        --color-bg: #f5f5fa;
        --color-surface: #ebebf5;
        --color-border: #c8c8d8;
        --color-text: #222233;
        --color-text-dim: #445566;
        --color-text-faint: #8899aa;
        --color-grid: #d8d8e8;
        --color-grid-major: #c0c0d4;
      }

      html,
      body {
        height: 100%;
        overflow: hidden;
        background: var(--color-bg);
        color: var(--color-text);
        font-family: var(--font-body);
        font-size: 13px;
      }

      #app {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      #viewport {
        display: block;
        flex: 1;
        cursor: crosshair;
      }

      #statusbar {
        flex-shrink: 0;
        height: var(--statusbar-height);
        background: var(--color-surface);
        border-top: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        padding: 0 12px;
        gap: 20px;
        font-size: 11px;
        font-family: var(--font-mono);
        color: var(--color-text-faint);
        user-select: none;
      }

      #sb-x,
      #sb-y,
      #sb-zoom {
        color: var(--color-text-dim);
      }
      #sb-msg {
        margin-left: auto;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <canvas id="viewport"></canvas>
      <div id="statusbar">
        <span id="sb-x">X: —</span>
        <span id="sb-y">Y: —</span>
        <span id="sb-zoom">1.00×</span>
        <span id="sb-msg">Ready</span>
      </div>
    </div>

    <script>
      // ── DOM references ──────────────────────────────────────────────────────────
      const canvas = document.getElementById("viewport");
      const ctx = canvas.getContext("2d");
      const sbX = document.getElementById("sb-x");
      const sbY = document.getElementById("sb-y");
      const sbZoom = document.getElementById("sb-zoom");
      const sbMsg = document.getElementById("sb-msg");

      // ── Application state ───────────────────────────────────────────────────────
      const state = {
        view: {
          panX: 0,
          panY: 0,
          zoom: 50,
        },
      };

      // ── Canvas resize ───────────────────────────────────────────────────────────
      function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
      }

      resizeCanvas();
      window.addEventListener("resize", () => {
        resizeCanvas();
        render();
      });

      // ── CSS token reader ────────────────────────────────────────────────────────
      function getToken(name) {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(name)
          .trim();
      }

      // ── Coordinate transforms ───────────────────────────────────────────────────
      function worldToCanvas(wx, wy) {
        const { panX, panY, zoom } = state.view;
        return {
          x: canvas.width / 2 + wx * zoom + panX,
          y: canvas.height / 2 - wy * zoom + panY,
        };
      }

      function canvasToWorld(cx, cy) {
        const { panX, panY, zoom } = state.view;
        return {
          x: (cx - canvas.width / 2 - panX) / zoom,
          y: -(cy - canvas.height / 2 - panY) / zoom,
        };
      }

      // ── Grid ────────────────────────────────────────────────────────────────────
      function niceGridUnit(rough) {
        const vals = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
        return vals.find((n) => n >= rough) ?? vals[vals.length - 1];
      }

      function drawGrid() {
        const { zoom } = state.view;
        const tl = canvasToWorld(0, 0);
        const br = canvasToWorld(canvas.width, canvas.height);
        const unit = niceGridUnit((br.x - tl.x) / 8);

        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = getToken("--color-grid");
        ctx.beginPath();

        for (
          let wx = Math.floor(tl.x / unit) * unit;
          wx <= br.x + unit;
          wx += unit
        ) {
          const x = Math.round(worldToCanvas(wx, 0).x) + 0.5;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
        }
        for (
          let wy = Math.floor(br.y / unit) * unit;
          wy <= tl.y + unit;
          wy += unit
        ) {
          const y = Math.round(worldToCanvas(0, wy).y) + 0.5;
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        ctx.strokeStyle = getToken("--color-grid-major");
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const axisX = Math.round(worldToCanvas(0, 0).x) + 0.5;
        const axisY = Math.round(worldToCanvas(0, 0).y) + 0.5;
        ctx.moveTo(axisX, 0);
        ctx.lineTo(axisX, canvas.height);
        ctx.moveTo(0, axisY);
        ctx.lineTo(canvas.width, axisY);
        ctx.stroke();

        ctx.fillStyle = getToken("--color-text-faint");
        ctx.font = `11px ${getToken("--font-mono")}`;
        ctx.fillText("0", axisX + 4, axisY - 4);
        ctx.restore();
      }

      // ── Render ──────────────────────────────────────────────────────────────────
      function render() {
        ctx.fillStyle = getToken("--color-bg") || "#13131f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();
      }

      // ── Mouse utilities ─────────────────────────────────────────────────────────
      function eventToCanvas(e) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }

      // ── Mouse tracking ──────────────────────────────────────────────────────────
      canvas.addEventListener("mousemove", (e) => {
        const cp = eventToCanvas(e);
        const world = canvasToWorld(cp.x, cp.y);
        sbX.textContent = `X: ${world.x.toFixed(3).padStart(9)}`;
        sbY.textContent = `Y: ${world.y.toFixed(3).padStart(9)}`;

        if (isPanning) {
          const dx = cp.x - panStart.x;
          const dy = cp.y - panStart.y;
          state.view.panX += dx;
          state.view.panY += dy;
          panStart = cp;
          render();
        }
      });

      canvas.addEventListener("mouseleave", () => {
        sbX.textContent = "X:       —";
        sbY.textContent = "Y:       —";
      });

      // ── Pan ─────────────────────────────────────────────────────────────────────
      let isPanning = false;
      let panStart = { x: 0, y: 0 };

      canvas.addEventListener("mousedown", (e) => {
        if (e.button === 1 || e.button === 2) {
          isPanning = true;
          panStart = eventToCanvas(e);
          e.preventDefault();
        }
      });

      window.addEventListener("mouseup", (e) => {
        if (e.button === 1 || e.button === 2) isPanning = false;
      });

      canvas.addEventListener("contextmenu", (e) => e.preventDefault());

      // ── Zoom ────────────────────────────────────────────────────────────────────
      canvas.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          const cp = eventToCanvas(e);
          const worldBefore = canvasToWorld(cp.x, cp.y);
          const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
          state.view.zoom = Math.max(
            1,
            Math.min(5000, state.view.zoom * factor),
          );
          const after = worldToCanvas(worldBefore.x, worldBefore.y);
          state.view.panX += cp.x - after.x;
          state.view.panY += cp.y - after.y;
          sbZoom.textContent = `${(state.view.zoom / 50).toFixed(2)}×`;
          render();
        },
        { passive: false },
      );

      // ── Keyboard shortcuts ──────────────────────────────────────────────────────
      document.addEventListener("keydown", (e) => {
        const tag = document.activeElement.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        switch (e.key) {
          case "Home":
          case "f":
          case "F":
            state.view.panX = 0;
            state.view.panY = 0;
            state.view.zoom = 50;
            sbZoom.textContent = "1.00×";
            render();
            break;
          case "g":
          case "G":
            state.view.panX = 0;
            state.view.panY = 0;
            render();
            break;
          case "t":
          case "T":
            toggleTheme();
            break;
        }
      });

      // ── Theme toggle ────────────────────────────────────────────────────────────
      function toggleTheme() {
        const html = document.documentElement;
        html.dataset.theme = html.dataset.theme === "light" ? "dark" : "light";
        render();
      }

      // ── Startup ─────────────────────────────────────────────────────────────────
      render();
    </script>
  </body>
</html>
```

---

## Part 16 — The Python Parallel

Every lab includes a Python implementation of the same concepts. Python is your
prototyping and verification language. The math is identical — only the syntax
and environment differ.

### Why two languages?

When you learn the math only in JavaScript, you might not know whether a bug is
a language misunderstanding or a math error. Building the same thing in Python
first (or alongside) gives you a reference implementation. If they disagree,
you've found a bug. If they agree, you've understood the concept.

### Setting up Python for this project

You need Python 3.10 or newer. Check your version:

```bash
python3 --version
```

For drawing, we will use `tkinter` — Python's built-in GUI library. It ships
with Python on Windows and Mac. On Linux: `sudo apt install python3-tk`.

No pip, no virtual environments yet. We use only the standard library until we
have a reason to add something.

### The coordinate transform in Python

```python
# cam_viewport.py
# Run with: python3 cam_viewport.py
# This implements the same coordinate system as index.html

import tkinter as tk
import math

# ── Application state ──────────────────────────────────────────────────────────
state = {
    'view': {
        'pan_x': 0,    # pixel offset of world origin from canvas center
        'pan_y': 0,    # pixel offset of world origin from canvas center
        'zoom':  50,   # pixels per world unit
    }
}

# ── Coordinate transforms ──────────────────────────────────────────────────────

def world_to_canvas(wx, wy, canvas_width, canvas_height):
    """Convert world-space (mm) to canvas pixel coordinates.

    wx, wy: world position in mm
    Returns: (cx, cy) in canvas pixels
    """
    pan_x = state['view']['pan_x']
    pan_y = state['view']['pan_y']
    zoom  = state['view']['zoom']

    cx = canvas_width  / 2 + wx * zoom + pan_x
    cy = canvas_height / 2 - wy * zoom + pan_y  # note: minus, Y is flipped
    return cx, cy


def canvas_to_world(cx, cy, canvas_width, canvas_height):
    """Convert canvas pixel coordinates to world-space (mm).

    cx, cy: canvas pixel position
    Returns: (wx, wy) in world mm
    """
    pan_x = state['view']['pan_x']
    pan_y = state['view']['pan_y']
    zoom  = state['view']['zoom']

    wx =  (cx - canvas_width  / 2 - pan_x) / zoom
    wy = -(cy - canvas_height / 2 - pan_y) / zoom  # note: minus, Y is flipped
    return wx, wy


# ── Grid ───────────────────────────────────────────────────────────────────────

def nice_grid_unit(rough):
    """Round a rough grid unit up to the nearest 'nice' value."""
    nice_values = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
    for n in nice_values:
        if n >= rough:
            return n
    return nice_values[-1]


def draw_grid(canvas_widget, w, h):
    """Draw the coordinate grid on a tkinter Canvas widget."""
    zoom = state['view']['zoom']

    # Find visible world extent
    wx_left,  wy_top    = canvas_to_world(0, 0, w, h)
    wx_right, wy_bottom = canvas_to_world(w, h, w, h)

    # Adaptive grid unit
    world_width = wx_right - wx_left
    unit = nice_grid_unit(world_width / 8)

    # Draw minor grid lines
    # Vertical lines
    wx = math.floor(wx_left / unit) * unit
    while wx <= wx_right + unit:
        cx, _ = world_to_canvas(wx, 0, w, h)
        canvas_widget.create_line(cx, 0, cx, h, fill='#1a1a2e', width=1)
        wx += unit

    # Horizontal lines
    wy = math.floor(wy_bottom / unit) * unit
    while wy <= wy_top + unit:
        _, cy = world_to_canvas(0, wy, w, h)
        canvas_widget.create_line(0, cy, w, cy, fill='#1a1a2e', width=1)
        wy += unit

    # Axes
    ax, ay = world_to_canvas(0, 0, w, h)
    canvas_widget.create_line(ax, 0, ax, h, fill='#222238', width=2)  # Y axis
    canvas_widget.create_line(0, ay, w, ay, fill='#222238', width=2)  # X axis


# ── GUI ────────────────────────────────────────────────────────────────────────

def render(canvas_widget, w, h):
    canvas_widget.delete('all')  # clear everything
    canvas_widget.configure(bg='#13131f')
    draw_grid(canvas_widget, w, h)


def on_motion(event, canvas_widget, status_label, w, h):
    wx, wy = canvas_to_world(event.x, event.y, w, h)
    # Use textContent equivalent: configure the label's text directly
    status_label.configure(text=f'X: {wx:>9.3f}  Y: {wy:>9.3f}')


def main():
    root = tk.Tk()
    root.title('CAM — Lab 01')
    root.geometry('1200x800')
    root.configure(bg='#13131f')

    W, H = 1200, 770  # canvas dimensions

    # Canvas
    c = tk.Canvas(root, width=W, height=H, bg='#13131f', highlightthickness=0)
    c.pack(fill='both', expand=True)

    # Status bar
    status = tk.Label(
        root, text='X:         —   Y:         —',
        bg='#111120', fg='#778899',
        font=('Consolas', 10), anchor='w', padx=12
    )
    status.pack(fill='x', side='bottom', ipady=4)

    # Initial render
    render(c, W, H)

    # Mouse tracking
    c.bind('<Motion>', lambda e: on_motion(e, c, status, W, H))

    root.mainloop()


if __name__ == '__main__':
    main()
```

Run with `python3 cam_viewport.py`. You should see the same grid in a native
window with live coordinate display in the status bar.

The code is structurally identical to the JavaScript version:

- Same `state` dictionary
- Same `world_to_canvas` / `canvas_to_world` formulas
- Same `nice_grid_unit` logic
- Same draw flow

If one version disagrees with the other (coordinates are wrong, grid looks
different), you have found a bug in one of them. Compare them carefully.

---

## Part 17 — Testing What We Have

We are not building a full test suite yet, but it is important to know how you
would test the math functions we have written. Here is the pattern:

### Testing coordinate transforms

The transforms are pure functions: given the same input, they always produce
the same output. Pure functions are the easiest thing to test.

In JavaScript, you can test right now in the console:

```js
// Set known state
state.view = { panX: 0, panY: 0, zoom: 50 };

// worldToCanvas(0, 0) should be exactly the center
const center = worldToCanvas(0, 0);
console.assert(
  Math.abs(center.x - canvas.width / 2) < 0.001,
  "World origin should be at canvas center X",
);
console.assert(
  Math.abs(center.y - canvas.height / 2) < 0.001,
  "World origin should be at canvas center Y",
);

// canvasToWorld of canvas center should be (0, 0)
const world = canvasToWorld(canvas.width / 2, canvas.height / 2);
console.assert(Math.abs(world.x) < 0.001, "Canvas center should be world X=0");
console.assert(Math.abs(world.y) < 0.001, "Canvas center should be world Y=0");

// Round-trip: worldToCanvas then canvasToWorld should return original value
const testPoint = { x: 15.7, y: -8.3 };
const onCanvas = worldToCanvas(testPoint.x, testPoint.y);
const backWorld = canvasToWorld(onCanvas.x, onCanvas.y);
console.assert(
  Math.abs(backWorld.x - testPoint.x) < 0.001 &&
    Math.abs(backWorld.y - testPoint.y) < 0.001,
  "Round-trip transform should be lossless",
);

console.log("All coordinate transform tests passed.");
```

Run these in DevTools Console after loading the page. A failed assert prints
a red message. A correct implementation prints "All coordinate transform tests
passed."

The same tests in Python:

```python
# test_transforms.py
# Run with: python3 test_transforms.py

# Copy the functions here for isolated testing
def world_to_canvas_pure(wx, wy, w, h, pan_x, pan_y, zoom):
    return (
        w / 2 + wx * zoom + pan_x,
        h / 2 - wy * zoom + pan_y,
    )

def canvas_to_world_pure(cx, cy, w, h, pan_x, pan_y, zoom):
    return (
         (cx - w / 2 - pan_x) / zoom,
        -(cy - h / 2 - pan_y) / zoom,
    )

# Test with known values
W, H = 800, 600
PAN_X, PAN_Y, ZOOM = 0, 0, 50

# World origin should map to canvas center
cx, cy = world_to_canvas_pure(0, 0, W, H, PAN_X, PAN_Y, ZOOM)
assert abs(cx - W/2) < 0.001, f'Expected {W/2}, got {cx}'
assert abs(cy - H/2) < 0.001, f'Expected {H/2}, got {cy}'

# Canvas center should map to world origin
wx, wy = canvas_to_world_pure(W/2, H/2, W, H, PAN_X, PAN_Y, ZOOM)
assert abs(wx) < 0.001, f'Expected 0, got {wx}'
assert abs(wy) < 0.001, f'Expected 0, got {wy}'

# Round-trip test
orig_x, orig_y = 15.7, -8.3
cx, cy = world_to_canvas_pure(orig_x, orig_y, W, H, PAN_X, PAN_Y, ZOOM)
rx, ry = canvas_to_world_pure(cx, cy, W, H, PAN_X, PAN_Y, ZOOM)
assert abs(rx - orig_x) < 0.001, f'Round-trip X: expected {orig_x}, got {rx}'
assert abs(ry - orig_y) < 0.001, f'Round-trip Y: expected {orig_y}, got {ry}'

print('All tests passed.')
```

---

## Part 18 — The C++ Track: Week 1

Starting now, one small C++ exercise each lab. You are not building the app in
C++ yet. You are building familiarity with the language so it is not foreign
when you arrive there seriously in Lab 10.

This week: Hello World and the compile/link model.

```cpp
// hello.cpp
// Compile: g++ -std=c++17 -Wall hello.cpp -o hello
// Run:     ./hello   (Mac/Linux)
//          hello.exe (Windows)

#include <iostream>  // provides std::cout

int main() {
    std::cout << "Hello from C++" << std::endl;
    return 0;  // 0 = success. The OS reads this return value.
}
```

**What to understand here:**

`#include <iostream>` — this is a preprocessor directive. Before compilation
begins, the preprocessor literally inserts the content of the `iostream` header
file at this point. `iostream` declares `std::cout`.

`int main()` — the entry point. The OS calls `main()` to start your program.
It returns an `int` — 0 means success, non-zero means an error occurred.

`std::cout << "..."` — write text to standard output. `std::` is the namespace
prefix. `<<` is the "stream insertion" operator — it pushes data into the stream.

`std::endl` — writes a newline and flushes the output buffer. You could also
write `"\n"` for just a newline, which is faster (no flush).

The compile command:

- `g++` — the GNU C++ compiler
- `-std=c++17` — use the C++17 language standard
- `-Wall` — enable all common warnings (treat these as errors while learning)
- `hello.cpp` — the source file
- `-o hello` — name the output executable `hello`

Compile and run it. Then break it deliberately: remove the `#include` and
re-compile. Read the error message. You will see it complain that `std::cout`
is not declared. This is how C++ errors look: specific and often pointing
exactly to the problem.

---

## What You Have After Lab 01

```
cam/
  index.html     ← Full viewport: grid, coordinates, pan/zoom, theme
```

```
python/
  cam_viewport.py    ← Same viewport in Python/tkinter
  test_transforms.py ← Unit tests for coordinate math
```

**Working features:**

- Canvas fills the window at correct resolution
- Dark background with adaptive grid
- World coordinate system: origin at center, Y-up, 1 unit = 1mm
- Mouse shows live world coordinates in status bar
- Right-drag or middle-drag to pan
- Scroll wheel zooms, cursor position stays fixed
- `F` / `Home` to reset view
- `G` to go to origin
- `T` to toggle dark/light theme

**Nothing else.** No geometry objects. No tools. No panels. But the viewport
is complete and correct — every lab from here adds to it without changing it.

---

## DIVERGE POINTS

**1. Touch and mobile input:** The current pan/zoom uses mouse events, which do
not work on touchscreens. To support touch: add `touchstart`/`touchmove`/
`touchend` listeners and compute pan from touch position deltas. Pinch-to-zoom
requires tracking two simultaneous touches and computing their distance. This is
a natural extension but not covered in the main track.

**2. Alternative grid styles:** The current grid uses thin lines. Professional
CAD tools often use dots at intersections instead, or show only major grid lines
at low zoom and both major/minor at higher zoom. The `drawGrid` function is the
right place to explore these variations without touching anything else.

**3. Ruler overlays:** A CAD ruler along the top and left edges of the viewport
(showing world-space tick marks and labels) is a common feature. It requires
rendering outside the canvas or drawing on the canvas's edges. A natural next
step after you are comfortable with the coordinate system.

**4. Persistent zoom/pan:** The view state is lost on page reload. Storing
`state.view` in `localStorage` and restoring it on load makes the viewport
remember where you were. Use `JSON.stringify` to save and `JSON.parse` to
restore. Security note: always validate data read from `localStorage` before
using it, since it can be modified by other code.

---

_Continue to [Lab 02 — The App Shell](LAB-02-THE-APP-SHELL.md)._
