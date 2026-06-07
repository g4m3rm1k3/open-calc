# Tetris V3 — LAB 01 — TypeScript Setup and Canvas on Screen

**Prerequisites:** Tetris V2 complete. You know how to create a canvas, call
`getContext('2d')`, and draw with `fillRect`. This lab builds on that knowledge
and explains the layer TypeScript adds on top.

**What this lab adds:**
- A Vite + TypeScript project that hot-reloads in the browser
- Type annotations on every variable and constant
- A typed canvas reference (TypeScript knows what `canvas` *is*)
- A black 300×600 canvas centered on a dark page — your V3 starting point

**Time:** 45–60 minutes

---

## What You Will Build

When this lab is complete, your browser shows:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                      #1a1a2e                        │   ← dark page background
│                                                     │
│               ┌──────────────┐                      │
│               │              │                      │
│               │   #000000    │  300 × 600 px        │
│               │              │                      │
│               │    canvas    │                      │
│               │              │                      │
│               └──────────────┘                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Visually identical to V2 LAB-01. What is different is under the hood: TypeScript
is watching every value, and will refuse to compile if you write the wrong kind
of data into the wrong place.

---

> **Quick Check — try to answer before reading further:**
>
> 1. JavaScript lets you write `let x = 5; x = "hello"` — the variable changes
>    type at runtime. What problem does this cause in a large program?
> 2. In V2 you wrote `document.getElementById('game-canvas')`. The return type of
>    that function is `HTMLElement | null`. Why `null`?
> 3. *(Prediction)* If you set a canvas element's CSS `width` to `300px` but set
>    its `canvas.width` property to `600`, what do you predict happens to drawings
>    on the canvas?
>
> *(Answers at the end of this lab)*

---

## Concept: TypeScript — A Type-Safe Layer Over JavaScript

**What it is:** TypeScript is JavaScript with an extra compile step that checks
whether the *kind* of data (number, string, object, null) flowing through your
program matches what each variable and function expects.

**The problem before:**

In JavaScript, nothing stops this:

```js
let score = 0;
score = "Game Over";         // silently allowed
score + 10;                  // "Game Over10" — not what you wanted
```

The bug appears at runtime — possibly in a shipped game. TypeScript catches it
at write time:

```ts
let score: number = 0;
score = "Game Over";         // ❌ ERROR: Type 'string' is not assignable to type 'number'
```

**The solution:** TypeScript adds **type annotations** — labels that tell the
compiler what kind of data a variable is allowed to hold. If code tries to put
the wrong kind of data in, compilation fails before the browser ever runs anything.

**Canonical example (General Explanation):**

Think of a type annotation like a labeled box at a post office. The box is labeled
"NUMBERS ONLY." If someone tries to put a letter in it, the postal worker stops
them before it goes in the truck — not after it arrives at the wrong address.

```ts
// Without TypeScript — any box accepts anything (chaos):
let playerCount = 4;
playerCount = "four";   // JS: fine. Runtime bugs later.

// With TypeScript — labeled boxes:
let playerCount: number = 4;
playerCount = "four";   // TS: ❌ caught immediately
```

**Project Application (The "Why" here):**

In Tetris, the board is a 2D array of numbers. Without TypeScript, nothing stops
a function from accidentally writing a string `"X"` into a cell — and the bug
only surfaces as a visual glitch when a row fails to detect as full. TypeScript
makes `board: number[][]` a hard contract. Labs 02 onward will show exactly where
TypeScript prevents these class of bugs.

**Smallest possible example:**

```ts
const BOARD_WIDTH: number = 10;   // : number is the annotation
const PLAYER_NAME: string = "Player 1";
const IS_RUNNING: boolean = false;

BOARD_WIDTH = 20;       // ❌ ERROR: Cannot assign to 'BOARD_WIDTH' — it is const
```

**Why it matters here:** Every constant in this lab — canvas size, cell size,
colors — will be given a type annotation. TypeScript will then enforce those
types everywhere those constants are used.

**Watch for:** TypeScript is a *compile-time* tool only. Your browser runs
JavaScript — TypeScript is compiled away. TypeScript cannot catch bugs that
depend on runtime values it cannot see (like user input or network responses).

---

## Concept: Type Annotations on Variables

**What it is:** The `: TypeName` syntax that tells TypeScript what kind of data
a variable can hold.

**Canonical example (General Explanation):**

```ts
//   variable  annotation   value
//      ↓          ↓          ↓
const width:    number   =   300;
const title:    string   =   "Tetris";
const playing:  boolean  =   true;
```

The annotation comes after the variable name, separated by a colon. TypeScript
will infer the type from the value if you omit it — but for constants at the top
of a file (like canvas size), explicit annotations make the intent clear.

**Project Application (The "Why" here):**

We annotate canvas dimensions as `number` so that if a future lab accidentally
passes them to a function expecting a string, TypeScript stops it. Numbers are
drawn to canvas with pixel math — passing a string would silently produce `NaN`
coordinates in JavaScript.

**Smallest possible example:**

```ts
const CELL_SIZE: number = 30;    // each cell is 30px wide and tall
const CELL_SIZE2 = 30;           // TypeScript infers number — also valid
```

Both are correct. The explicit annotation is preferred for top-level constants
because it makes the intent self-documenting.

**Watch for:** You cannot annotate `let` and `const` differently — the annotation
always goes right after the name, before the `=`. Writing `const: number width`
is a syntax error.

---

## Concept: `HTMLCanvasElement` — Why Elements Have Specific Types

**What it is:** A TypeScript type that describes a `<canvas>` element specifically
— with `width`, `height`, and `getContext()` properties that only canvas elements have.

**The problem before:**

`document.getElementById('game-canvas')` returns `HTMLElement | null`. The type
`HTMLElement` is the base type for ALL elements — it has `id`, `className`, and
`style`, but it does NOT have `getContext()`. That method only exists on canvas
elements.

In JavaScript, you call `canvas.getContext('2d')` and hope the element you
grabbed was actually a canvas. If you got a `<div>` by mistake, you get
`undefined is not a function` at runtime.

```js
// JavaScript — no protection:
const canvas = document.getElementById('game-canvas');
canvas.getContext('2d');   // runtime crash if canvas is null or wrong type
```

**The solution:** TypeScript lets you tell the compiler: "I know this is
specifically a canvas element, not just any element." The type `HTMLCanvasElement`
unlocks the `getContext`, `width`, and `height` properties and checks their usage.

**Canonical example (General Explanation):**

Imagine a shipping dock with three workers: a generic dock worker (handles any
package), a fragile-goods specialist (only handles fragile items, knows the
special procedures), and a hazmat specialist. You would not send fragile goods
to the generic worker — they do not know the procedures.

```ts
// Generic — loses the canvas-specific abilities:
const el: HTMLElement = document.getElementById('game-canvas')!;
el.getContext('2d');   // ❌ ERROR: 'getContext' does not exist on 'HTMLElement'

// Specific — canvas abilities unlocked:
const canvas: HTMLCanvasElement = document.getElementById('game-canvas') as HTMLCanvasElement;
canvas.getContext('2d');   // ✅ TypeScript knows this is valid
```

**Project Application (The "Why" here):**

We annotate `canvas` as `HTMLCanvasElement` so TypeScript can verify every
canvas operation we write — `canvas.width`, `canvas.height`, `canvas.getContext('2d')`.
Without this annotation, none of those properties would type-check.

**Watch for:** `HTMLElement` and `HTMLCanvasElement` are related but different.
`HTMLCanvasElement` extends `HTMLElement` — it has everything `HTMLElement` has,
plus canvas-specific properties. Always use the most specific type available.

---

## Concept: `null`, Non-Null Assertion `!`, and the `as` Cast

**What it is:** Two ways to tell TypeScript "I know this value is not null, even
though the type says it could be."

**The problem before:**

`document.getElementById()` returns `HTMLElement | null` — the `| null` means
"this might not find anything." If you search for an ID that doesn't exist in
the HTML, you get `null`. TypeScript forces you to deal with this possibility.

**The problem in concrete terms:**

```ts
const canvas = document.getElementById('game-canvas'); // type: HTMLElement | null
canvas.width = 300;   // ❌ ERROR: 'canvas' is possibly 'null'
```

TypeScript is saying: "What if that element doesn't exist? You'd be setting
`.width` on `null`, which crashes at runtime."

**The two solutions:**

1. **Non-null assertion `!`** — tells TypeScript "I guarantee this is not null."
   Place it immediately after the expression that might be null:

```ts
const canvas = document.getElementById('game-canvas')!;
//                                                    ↑ "trust me, it exists"
```

2. **Type cast `as`** — tells TypeScript "treat this value as this specific type":

```ts
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
//                                                     ↑ "it's a canvas, not just an element"
```

**Combined (what we will use):**

```ts
const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
```

`querySelector<HTMLCanvasElement>` passes the target type as a **generic** (the
`<HTMLCanvasElement>` part). TypeScript then knows the return is either
`HTMLCanvasElement` or `null`. The `!` tells TypeScript it will not be `null`
because our HTML always includes the canvas.

**Project Application (The "Why" here):**

We use `querySelector<HTMLCanvasElement>` instead of `getElementById` because:
1. The generic syntax is more readable than a separate `as` cast
2. `querySelector` accepts any CSS selector, so the same pattern works in every
   project regardless of element ID vs class vs tag name

**Watch for:** `!` is a promise to TypeScript, not a runtime check. If the element
genuinely does not exist, the `!` will not save you — you will still get a
runtime crash. Only use `!` when you can see in the HTML that the element exists.

---

## Step 1 — Create the Vite + TypeScript Project

Vite is a build tool that handles TypeScript compilation and hot-reloads the
browser every time you save a file. You write TypeScript — Vite compiles it to
JavaScript and serves it instantly.

Open a terminal in your `cadcam/tetris` folder and run:

```bash
npm create vite@latest tetris-v3 -- --template vanilla-ts
```

When it finishes, run:

```bash
cd tetris-v3
npm install
npm run dev
```

You will see a localhost URL (usually `http://localhost:5173`). Open it in
your browser.

### SAVE AND TRY

Open the browser at the URL the terminal printed.

**You should see:** The Vite + TypeScript welcome page — a Vite logo, a
TypeScript logo, and a counter button. This confirms the project is running.

**In the terminal:** No errors. The last line says something like
`Local: http://localhost:5173/`.

**Change something:** Open `src/main.ts`. Change the number on the first line
of the counter click handler from `0` to `99`. Save. The browser updates
immediately without a manual refresh — this is Vite's hot reload.

**Change it back** — we will replace this file entirely in the next step.

---

## What Vite Generated

Before editing anything, understand what each file does:

```
tetris-v3/
  index.html          ← the page the browser loads
  src/
    main.ts           ← TypeScript entry point (we rewrite this)
    style.css         ← global styles (we rewrite this)
    counter.ts        ← Vite demo file (we delete this)
    vite-env.d.ts     ← tells TypeScript about Vite's special import types
  tsconfig.json       ← TypeScript configuration (leave it alone)
  package.json        ← project dependencies and scripts
```

**`vite-env.d.ts`** — do not touch this. It contains a single line:
`/// <reference types="vite/client" />` which tells TypeScript about Vite-specific
features like `import.meta.hot`. You will never write code in it.

**`tsconfig.json`** — leave it as-is. The `"strict": true` option inside is
important: it enables the strictest TypeScript checks, including requiring you
to handle `null` values.

---

## Step 2 — Clear the Template, Add the Canvas HTML

First, delete the demo file Vite created — we do not need it:

```bash
# Run in your terminal while still in tetris-v3/:
rm src/counter.ts
```

On Windows PowerShell: `Remove-Item src/counter.ts`

Now replace the entire `index.html` with a clean canvas page.

Open `index.html`. Replace everything with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tetris V3</title>
    <link rel="stylesheet" href="/src/style.css" />  <!-- ← loads our CSS file -->
  </head>
  <body>
    <canvas id="game-canvas"></canvas>  <!-- ← the canvas element, no size yet -->
    <script type="module" src="/src/main.ts"></script>  <!-- ← Vite compiles this to JS -->
  </body>
</html>
```

Now replace `src/main.ts` with just a console log (so it runs without errors):

```ts
// src/main.ts
console.log('Tetris V3 starting...');   // ← temporary — confirms TypeScript is running
```

### CSS AND SEE

Save both files. Look at the browser.

**You should see:** A white page with a tiny white rectangle in the top-left
corner. The canvas has no size set yet, so it defaults to 300×150 pixels —
just an empty white box.

**Compare:** Before this step, you saw the Vite demo. Now: blank white page.
The canvas is there but invisible because it is white on a white background.

---

## Step 3 — Style the Page and Canvas

Replace `src/style.css` entirely with:

```css
/* src/style.css */

/* Reset: browsers add default margin and padding — we remove it */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;   /* include border in size calculations */
}

/* Page background — the dark behind the canvas */
body {
  background-color: #1a1a2e;  /* deep navy — matches V2 */
  display: flex;              /* flexbox centers children */
  justify-content: center;    /* horizontal center */
  align-items: center;        /* vertical center */
  height: 100vh;              /* full viewport height */
}

/* The canvas visual style — color and border only */
/* NOTE: width and height are NOT set here.
   Canvas dimensions must be set in TypeScript (canvas.width / canvas.height).
   Setting them in CSS only stretches the drawing — it does not add pixels. */
#game-canvas {
  background-color: #000000;  /* black — the empty board */
  border: 2px solid #333333;  /* subtle border to see canvas edges */
  display: block;             /* removes inline whitespace gap below canvas */
}
```

### CSS AND SEE

Save. Look at the browser.

**You should see:** The dark navy background fills the whole page. A small black
rectangle is visible in the center — but it is tiny (still the default 300×150).

**Compare:** The white background is gone. The canvas is now centered on the
dark page, but still the wrong size.

**Change something:** Temporarily change `background-color: #1a1a2e` to
`background-color: red`. Save. The page turns red — you can see the body
background is working. Change it back to `#1a1a2e`.

---

## Concept: Canvas Resolution vs CSS Size

**What it computes:** Two separate dimensions — one controls how many pixels
the canvas *has to draw on*, the other controls how large it *appears on screen*.

**The real-world analogy:** A photo on a screen. The photo file is 100×100
pixels (its resolution). You can display it at 300×300 on screen — it will look
blurry because the same 100 pixels are stretched. Or you can display it at
50×50 — it will look crisp but small. The file's resolution and the display
size are independent.

**Canvas works the same way:**

```
canvas.width  = 300    ← how many pixels the canvas has internally (resolution)
canvas.height = 600    ← TypeScript sets this on the element object

CSS width: 300px       ← how large it appears on screen
CSS height: 600px      ← we are NOT setting this — TypeScript sets canvas.width/height
                          and the browser matches the display size automatically
```

**The rule we follow:** Set `canvas.width` and `canvas.height` in TypeScript —
never in CSS. When the `width` and `height` *properties* are set, the browser
automatically updates the CSS display size to match (unless overridden).
Overriding in CSS causes blurry or distorted drawings.

**Why it matters here:** In the next step we set `canvas.width = CANVAS_WIDTH`
in TypeScript. This both sets the internal resolution AND the displayed size,
so our drawings will be pixel-perfect.

**Watch for:** If you set `width: 300px` in CSS AND `canvas.width = 600` in
TypeScript, the canvas draws at 600 resolution but displays at 300px — every
drawing is scaled down 50%, making everything half-size and potentially blurry
on high-DPI screens.

---

## Step 4 — Connect TypeScript to the Canvas

Replace `src/main.ts` with the following. Read every line — each one is
explained below:

```ts
// src/main.ts

// ── Constants ──────────────────────────────────────────────────────────────
// All canvas dimensions as named constants — no magic numbers anywhere.
// The type annotation ': number' makes it a compile error to assign non-numbers.

const CANVAS_WIDTH: number = 300;    // 10 columns × 30px each = 300px wide
const CANVAS_HEIGHT: number = 600;   // 20 rows × 30px each = 600px tall
const CELL_SIZE: number = 30;        // each grid cell is 30×30 pixels

// These will be used in later labs when we draw the grid:
const BOARD_COLS: number = CANVAS_WIDTH / CELL_SIZE;   // = 10 columns
const BOARD_ROWS: number = CANVAS_HEIGHT / CELL_SIZE;  // = 20 rows

// ── Canvas setup ───────────────────────────────────────────────────────────

// querySelector<HTMLCanvasElement> tells TypeScript:
//   "find this element AND treat it as a canvas element"
// The ! at the end tells TypeScript:
//   "the result will not be null — I guarantee the element exists in index.html"
const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;

// Set the internal resolution — this also sets the displayed size (see concept block above)
canvas.width = CANVAS_WIDTH;    // ← set canvas resolution, not CSS size
canvas.height = CANVAS_HEIGHT;  // ← same for height

// getContext returns CanvasRenderingContext2D | null
// ('2d' is a string literal — passing '3d' would be a runtime error, not caught by TS)
// The ! asserts it is not null — hardware-accelerated contexts are always available
// in modern browsers for 2D
const ctx = canvas.getContext('2d')!;
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** The black canvas is now the correct size — 300×600 pixels,
centered on the dark navy background.

**In DevTools Console** (F12 → Console):

```js
canvas.width
```

**Expected:** `300`

```js
canvas.height
```

**Expected:** `600`

**Change something:** Change `CANVAS_WIDTH` to `150`. Save. The canvas shrinks
to half width. Notice that `BOARD_COLS` automatically becomes `5` — derived
constants update because they are computed from the named constant. Change it
back to `300`.

---

## Step 5 — Draw the Background Color

Right now the black canvas comes from CSS (`background-color: #000000`). In a
game, the canvas background is redrawn every frame to erase the previous frame.
We need to draw it with TypeScript, not rely on CSS.

Add these lines to the bottom of `src/main.ts`:

```ts
// ── Drawing ────────────────────────────────────────────────────────────────

// Background color — same black as the CSS, but now drawn by TypeScript
// This will be called every frame in the game loop (added in a later lab)
const BACKGROUND_COLOR: string = '#000000';  // ← add this

function drawBackground(): void {        // ← add this function
  ctx.fillStyle = BACKGROUND_COLOR;     // set the fill color
  ctx.fillRect(0, 0, canvas.width, canvas.height); // fill entire canvas
}                                        // (x=0, y=0 = top-left corner)

drawBackground();  // ← call it once to verify it works
```

The `: void` annotation on `drawBackground()` means "this function returns
nothing." TypeScript will error if you accidentally write `return 42` inside it.

### SAVE AND TRY

Save. Look at the browser.

**You should see:** No visible change — the canvas is still black. That is
correct. The CSS was already black; now TypeScript draws the same color on top.
The CSS background will be removed in a later lab once the game loop redraws
the canvas every frame.

**In DevTools Console:**

```js
ctx.fillStyle
```

**Expected:** `'#000000'`

**Change something:** Change `BACKGROUND_COLOR` to `'#1a1a2e'` (same as the
page background — the canvas will blend with the page). Save. The canvas border
disappears because canvas and page are the same color. Change back to `'#000000'`.

---

## 🎯 Challenge: Named Color Constants

**You know:** Named constants prevent magic numbers/strings in code. Type
annotations make TypeScript enforce the type of each constant.

**Task:** Add two more named color constants to `main.ts` — one for the cell
border color and one for the grid line color. Use these types:

```ts
const CELL_BORDER_COLOR: string = ???;    // a dark gray like '#333333'
const GRID_LINE_COLOR: string = ???;      // even darker, like '#1a1a1a'
```

Then write a `drawGrid()` function that draws a 1px horizontal line across
the top of the canvas using `ctx.strokeStyle` and `ctx.beginPath()` / `ctx.moveTo()`
/ `ctx.lineTo()` / `ctx.stroke()`. Call it after `drawBackground()`.

You do not need to draw the full grid yet — just one line proves the concept works.

**Hints:**

1. `ctx.strokeStyle = GRID_LINE_COLOR` sets the line color (like `fillStyle`
   but for strokes).
2. `ctx.beginPath()` → `ctx.moveTo(x1, y1)` → `ctx.lineTo(x2, y2)` → `ctx.stroke()`
   draws a single line.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Add these constants near the other color constants:
const CELL_BORDER_COLOR: string = '#333333';  // ← add this
const GRID_LINE_COLOR: string = '#1a1a1a';    // ← add this

function drawGrid(): void {                   // ← add this function
  ctx.strokeStyle = GRID_LINE_COLOR;          // color of the line
  ctx.lineWidth = 1;                          // 1px line

  ctx.beginPath();                            // clear the path buffer before drawing
  ctx.moveTo(0, CELL_SIZE);                   // start at left edge, 1 row down
  ctx.lineTo(canvas.width, CELL_SIZE);        // draw to right edge, same height
  ctx.stroke();                               // paint the path
}

drawGrid();  // call it after drawBackground()
```

**Key insight:** `ctx.beginPath()` clears the previous path buffer. Without it,
every line you draw is added to the same path — when you call `ctx.stroke()`,
all previous lines would be redrawn too, causing unexpected results. Always
`beginPath()` before describing a new shape.

</details>

---

## Final Check

Verify every feature added in this lab before moving to LAB-02:

| Feature | How to verify |
|---------|---------------|
| Vite hot-reload works | Edit a constant, save — browser updates without refresh |
| Canvas is 300×600 | DevTools Console: `canvas.width` → `300`, `canvas.height` → `600` |
| Canvas is centered | Resize the browser window — canvas stays centered |
| Background is drawn by TypeScript | In Console: `ctx.fillStyle` → `'#000000'` |
| TypeScript catches type errors | In `main.ts`, try `canvas.width = "300"` — editor shows red underline immediately |
| Named constants are used | No magic numbers in `main.ts` — every value has a name |

---

## Quick Check Answers

**1. JavaScript lets you write `let x = 5; x = "hello"` — what problem does this cause in a large program?**

When a variable's type changes mid-program, every function that receives that
variable must handle both possibilities — or silently behave wrong. In Tetris,
if `score` accidentally becomes a string, `score + 10` produces `"010"` instead
of `10`. This bug is invisible until a specific game event triggers the
reassignment. TypeScript prevents the reassignment at the type level, so the
bug cannot enter the codebase.

**2. Why does `getElementById` return `HTMLElement | null`?**

Because you might search for an ID that does not exist in the HTML. If you
call `document.getElementById('not-here')`, there is no element — JavaScript
returns `null`. TypeScript reflects this in the return type to force you to
acknowledge the possibility. The `!` non-null assertion (`getElementById(...)!`)
tells TypeScript: "I have verified in my HTML that this ID exists — it will
not be null."

**3. (Prediction) If CSS width is 300px but `canvas.width` is 600, what happens?**

The canvas draws at 600-pixel resolution but is squished into 300px of screen
space. Every `fillRect` coordinate is correct (0–600), but the display scales
everything to half size. On a standard monitor this looks like the canvas is
just smaller. On a high-DPI (Retina) display, it can look blurry because the
browser's pixel ratio is not accounted for. The rule: always set canvas size
via `canvas.width` and `canvas.height` in TypeScript — never in CSS.

---

*Next: LAB-02 — The Board Matrix. We define the `CellValue` type, create the
2D board array with TypeScript's type system enforcing what can go in each cell,
and render the empty grid.*
