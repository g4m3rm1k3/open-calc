# OpenMAT — Lesson 01 — The Canvas

## What You Will Build

An HTML page containing two things: a canvas with a triangle drawn on it, and
an empty panel where the console will live. Neither the triangle nor the panel
does anything yet. The point of this lesson is to build the visible skeleton of
the application on day one, so that every lesson after this adds to something
real — not toward a reveal that only arrives at lesson 18.

When you open the page you will see:

- A dark canvas on the left with a filled triangle drawn in a highlighted colour
- An empty panel on the right where the console will go in lesson 02
- The page title "OpenMAT" in the browser tab
- No hardcoded colour values anywhere — every colour is a CSS custom property

---

## Before You Begin: Version Control

Before writing a single line of code, you need a version control system. Git is
that system — and it is not optional, not "just housekeeping," and not something
to set up later. It is set up first, before anything else exists, because its
value begins the moment you write your first file.

### What version control is and why it exists

Version control records every change made to a project as a named snapshot in
time. Each snapshot has a message explaining why it was taken. This gives you
four capabilities that nothing else provides:

- **Return to any prior state.** If you break something and cannot work out how
  to fix it, you can restore the exact state from before you broke it. Not an
  approximation — the exact state.
- **See what changed and why.** You can inspect the difference between any two
  snapshots and read the message that explains the reason for each change. Six
  months from now, when you ask "why is this code here?", the history tells you.
- **Work on two things at once without mixing them.** You can create a separate
  line of development (a *branch*) for each new feature and merge them when they
  are ready. The main branch stays clean.
- **Understand your own history.** For a self-taught learner working alone, this
  matters most. You will make wrong decisions. You will change your mind. The
  history is how you learn from that — not from memory, but from record.

Git is the version control system used by almost all professional software
development. It was created by Linus Torvalds in 2005 to manage the Linux kernel
codebase, and is now the default choice for every kind of software project. When
you push code to GitHub or GitLab, you are pushing a Git repository.

### The three states of a file

At any point in time, a file tracked by Git is in one of three states:

- **Modified** — you have changed the file, but Git does not yet know about the
  change. The change exists only in your working directory.
- **Staged** — you have marked the change for inclusion in the next snapshot.
  Git knows about the change and has set it aside, but has not yet recorded it
  permanently.
- **Committed** — the change has been permanently recorded in the repository's
  history. It now has a unique identifier and can always be retrieved.

The staging step exists so that you can group related changes together and record
them as a single, coherent snapshot — even if you changed multiple files at
different times. You stage the files that belong together, then commit them as a
unit.

### The commands

**`git init`** — creates a Git repository in the current folder. Git creates a
hidden `.git` directory that stores the entire history of the project. You run
this once per project. It does not upload anything or require an internet
connection — it is purely local.

**`git add <file>`** — stages a file. Git reads the current state of `<file>`
and marks it for the next commit. If you change `<file>` again after staging,
you need to `git add` it again — staging captures the file at the moment of
the `add` call.

**`git commit -m "message"`** — records all staged files as a permanent snapshot.
The `-m` flag provides the commit message inline. The snapshot is assigned a
unique identifier (a 40-character hash) and stored in the repository history.

### What a commit message communicates

The commit message is not a summary of what files you changed. Git records that
automatically — you can see the exact diff of every line added or removed from
every file. The message exists to communicate something Git cannot record: *why
this state is worth saving*.

"Add canvas" describes files. It tells a future reader (often you, six months
from now) nothing about purpose, intent, or context.

"Establish the canvas skeleton: the two visible halves of the application exist
so every subsequent lesson adds to something real" explains what now exists and
why it matters. A reader who has never seen this project understands what the
commit achieved and what it enables.

Write messages that would still be meaningful when you have forgotten what this
week looked like.

### What `.gitignore` is

`.gitignore` is a file that tells Git which files and directories it should never
track, regardless of whether they are present in the project folder.

When you install packages in lesson 03, a `node_modules/` directory will appear
containing hundreds of thousands of files — the source code of every package you
depend on. These files must never be committed. First, they make the repository
enormous and slow. Second, they do not need to be committed, because they can
always be regenerated exactly from `package.json` by running `npm install`. The
same repository on a different machine produces the same `node_modules/` from
`package.json`. Committing them would be storing something derived, not something
original — and storing it at great cost.

When `node_modules/` appears in lesson 03, a `.gitignore` file with that entry
will be created. For now, the entry is not needed yet.

### Running `git init` now

Open a terminal in the project folder (the folder that will contain `index.html`)
and run:

```
git init
```

You will see output similar to:

```
Initialized empty Git repository in /path/to/your/project/.git/
```

`git init` created the hidden `.git/` directory in your project folder. This
directory is the repository — it stores the full history of every change you
commit. Do not edit or delete it. Everything else in the lesson will be committed
at the end.

---

## What You Need to Know First

No prior lessons. This is lesson one.

You will write HTML, CSS, and a small amount of TypeScript. If you have not
written HTML before: HTML is a document structure language. You write tags
(`<canvas>`, `<div>`) to describe what exists on the page; CSS describes how
it looks; TypeScript (JavaScript with types) describes what it does. The three
are separate concerns by design — this lesson shows you exactly why that
separation matters.

---

## Maths: Cartesian Coordinates

Before any code, we need to agree on what a point on a canvas actually is.

A *point* in two-dimensional space is a location described by two numbers: how
far along the horizontal axis it is, and how far along the vertical axis it is.
We call these numbers *coordinates*, and we write them as a pair `(x, y)`.

```
         y
         ↑
         |
    100  ├─ ─ ─ ─ ─ •  (250, 100)
         |
    ─────┼──────────────────→ x
  (0,0)  0    250
```

This is called the *Cartesian coordinate system*, named after René Descartes
who formalised it in the 1600s. Every branch of mathematics that deals with
space — geometry, calculus, linear algebra — uses this system. `x` is the
conventional name for the horizontal coordinate. `y` is the conventional name
for the vertical coordinate. These are not abbreviations. They are the standard
mathematical names for these two dimensions, used in every textbook, every
geometry library, and every discussion of coordinates you will ever encounter.

This is the one place in this project where single-letter names are acceptable:
`x` and `y` are not abbreviations of longer words — they *are* the concept.

**Screen coordinates are upside down.** In mathematics, larger y values are
higher. On a computer screen, y increases *downward*: `y = 0` is the top of
the screen, and larger y means lower on the page. This is a historical artefact
from how early computer displays were built (scanning top-to-bottom).

```
 (0,0) ──────────────────────→  x increases right
   |
   |     •  (100, 80)        ← small y = near the top
   |
   |             •  (300, 250)  ← large y = lower on screen
   ↓
  y increases down
```

Know this now because it will be relevant in every lesson that draws anything:
when a mathematical formula says "y increases upward" and your canvas draws it
"downward," you will know exactly why — and you will know how to fix it.

---

## Step 1 — Create the HTML Structure

**The problem:** We need a page with a canvas and a side panel visible when
the browser opens. Nothing else exists yet.

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenMAT</title>
  <link rel="stylesheet" href="src/style.css">
</head>
<body>
  <div class="layout">
    <canvas class="visualiser" id="visualiser"></canvas>
    <div class="console-panel" id="console-panel"></div>
  </div>
  <script type="module" src="src/main.ts"></script>
</body>
</html>
```

Open this file in a browser now. You will see an empty page — no styles, no
visible content. That is correct. A blank page is already working software: the
HTML structure exists, the elements exist, the browser has parsed and rendered
something. It just has no appearance yet. In lesson 02, we will add the console
to `id="console-panel"`. In lesson 06, we will add evaluation output to it.
Every future change targets one of these two elements. The HTML does not change
after this lesson.

**SE lens — HTML before CSS: structure before style.**

We write HTML first because HTML is structure and CSS is appearance. A page
with structure and no style is ugly but functional. A page with style and no
structure is nothing — CSS has nowhere to attach. This ordering is not
preference; it is the only ordering that produces a runnable result at every step.

**The IDs and classes:**

Both elements have both an `id` and a `class`. The class is used by CSS
(`canvas.visualiser { ... }`). The ID is used by TypeScript
(`document.getElementById('visualiser')`). This separation means renaming the
class for styling reasons never breaks the TypeScript that looks for the ID.
A change in the appearance concern does not propagate to the behaviour concern.

---

## Concept: CSS Custom Properties

Before writing any CSS, we need to establish why every colour, size, and spacing
value in this project lives in one place and nowhere else.

A *CSS custom property* is a named value defined once and used everywhere. You
define one with a double-dash prefix and read it with `var()`:

```css
:root {
  --colour-canvas-background: #1a1a2e;
  --colour-triangle:          #e94560;
}

.visualiser {
  background-color: var(--colour-canvas-background);
}
```

**Why not just write the colour directly?**

If `#e94560` appears in ten places and you want to change the theme, you change
ten places — and miss at least two. With a custom property, you change it once
in `:root` and every use updates automatically. This is the *single source of
truth* principle: each design decision is recorded in exactly one place.

**The connection to TypeScript:**

TypeScript can read CSS custom properties at runtime:

```typescript
getComputedStyle(document.documentElement).getPropertyValue('--colour-triangle')
```

This means the triangle's fill colour is defined in CSS (where colour belongs)
and TypeScript reads it when drawing (so drawing and styling always agree). If
the colour were a separate string in TypeScript, the CSS theme and the drawn
triangle could silently diverge. Custom properties prevent that class of bug.

The requirement in this project is absolute: **no hardcoded colour, size, or
spacing value anywhere in CSS or TypeScript.** Every value is a custom property.

**Real-world connection — design tokens:**

This exact pattern is used in every major design system. Google's Material
Design defines its full colour palette as CSS custom properties — `--md-sys-color-primary`,
`--md-sys-color-secondary` — so that switching between light and dark themes is
a single reassignment on `:root`. GitHub's Primer design system defines not just
colours but spacing, typography, and border radii as variables. When a designer
says "change the brand primary colour," the engineer changes one line. No
find-and-replace, no missed instances. This is not an academic principle; it is
what every production interface does.

---

## Step 2 — Write the CSS

**The problem:** The canvas and panel need visible dimensions and colours. An
unstyled `<canvas>` has a default size of 300×150 pixels and no background —
it is invisible against a white page.

Create `src/style.css`:

```css
/* ── Design tokens ──────────────────────────────────────────────────────── */
/* Every colour, dimension, and spacing value is defined here — once.       */
/* TypeScript reads --colour-triangle when it draws. It never owns a copy.  */

:root {
  --colour-page-background:   #0f0f23;
  --colour-canvas-background: #1a1a2e;
  --colour-panel-background:  #16213e;
  --colour-triangle:          #e94560;
  --colour-border:            #0f3460;

  --canvas-width:  600px;
  --canvas-height: 400px;
  --panel-width:   360px;
  --gap:           1px;
}

/* ── Reset ──────────────────────────────────────────────────────────────── */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Page ───────────────────────────────────────────────────────────────── */

body {
  background-color: var(--colour-page-background);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* ── Layout ─────────────────────────────────────────────────────────────── */

.layout {
  display: flex;
  gap: var(--gap);
  border: 1px solid var(--colour-border);
}

/* ── Canvas ─────────────────────────────────────────────────────────────── */

.visualiser {
  width:            var(--canvas-width);
  height:           var(--canvas-height);
  background-color: var(--colour-canvas-background);
  display: block;
}

/* ── Console panel ───────────────────────────────────────────────────────── */

.console-panel {
  width:            var(--panel-width);
  height:           var(--canvas-height);
  background-color: var(--colour-panel-background);
}
```

Save and open the page. You now see a dark canvas on the left and a dark panel
on the right. The triangle does not exist yet — we have not drawn it.

**A note on `display: block` on the canvas:**

`<canvas>` is an inline element by default. Inline elements have a small gap
below them caused by the text baseline. `display: block` removes that gap so
the canvas sits flush against its container. Without it, there is a few-pixel
strip of page background visible below the canvas. It is a quirk worth knowing.

**CS lens — two different kinds of size on a `<canvas>`.**

The CSS `width` and `height` set the *display* size — how large the element
appears on screen. The HTML `width` and `height` *attributes* set the
*drawing surface* size — the resolution of the pixel grid you draw on. If the
display is 600×400 but the drawing surface is 300×150 (the default when no
attributes are set), everything drawn is scaled up by 2× and looks blurry.
TypeScript will set the drawing surface to match the display in the next step.

---

## Concept: Representing Points in Code

We know a point is an `(x, y)` pair. Now we decide how to represent that in
TypeScript.

**Option A — an array:** `[250, 100]`

Arrays store values by *position*. `point[0]` is 250 and `point[1]` is 100.
Nothing about position `0` tells the reader "this is x." The reader must
remember the convention: first element is x, second is y. For two values, this
is manageable. For three values (x, y, z in lesson 18), or when reading code
months later, position-based conventions are a source of silent errors.

**Option B — an object with named properties:** `{ x: 250, y: 100 }`

Objects store values by *name*. `.x` is always the horizontal coordinate; `.y`
is always the vertical coordinate. The names are visible in the code. TypeScript
can enforce that `.x` and `.y` exist and are numbers. A typo like `.X` produces
a compile error; accessing `point[2]` on a 2-element array does not.

We use objects. The names `x` and `y` are the standard mathematical names for
coordinates — using them here is both correct and expected.

**What is `apex`?**

*Apex* is the geometric term for the tip of a triangle — the vertex at the
highest point, opposite the base. It comes from Latin: *apex* means tip or
summit. Our triangle has two base vertices at the bottom and one apex at the
top. That top vertex is the apex.

The name is not invented. It is the correct geometric term, findable in any
geometry reference. A reader who does not know it can look it up. A reader who
sees `p1` or `topPoint` has only this file to explain it.

---

## Step 3 — Set Up TypeScript and Get the Canvas Context

**The problem:** TypeScript needs to find the canvas element and get a drawing
object from it. The drawing object — called the *context* — is the gateway to
every drawing operation.

Create `src/main.ts`:

```typescript
// Find the canvas element by its ID.
const canvasElement = document.getElementById('visualiser') as HTMLCanvasElement;

// Match the drawing surface size to the CSS display size.
// Without this, coordinates do not map 1:1 to screen pixels.
canvasElement.width  = canvasElement.clientWidth;
canvasElement.height = canvasElement.clientHeight;

// Get the 2D drawing context.
// This is the object through which all drawing operations are issued.
const drawingContext = canvasElement.getContext('2d')!;
```

**CS lens — what `as HTMLCanvasElement` means.**

`document.getElementById('visualiser')` is a browser API call that searches
the DOM tree — the browser's in-memory representation of the HTML document —
for an element whose `id` attribute equals `'visualiser'`. It returns the first
match, or `null` if none is found. TypeScript gives its return type as
`HTMLElement | null`: either some HTML element, or nothing.

The `as HTMLCanvasElement` after the call is a *type assertion*. A type assertion
tells TypeScript: "I know more about this value's type than you do right now."
`document.getElementById()` returns `HTMLElement | null` because it cannot know
at compile time whether the element in the HTML is specifically a canvas — or a
`<div>`, an `<input>`, or anything else. We know it is a canvas because we wrote
the HTML. The `as HTMLCanvasElement` assertion narrows the type so TypeScript
knows that `.getContext()` and `.width` exist on it. Without this assertion,
TypeScript would refuse to let you call `.getContext()` — `HTMLElement` does
not have that method; only `HTMLCanvasElement` does.

At runtime, TypeScript removes the assertion completely. It is compile-time-only.
The generated JavaScript contains no trace of it. The assertion does nothing to
the value at runtime — it only changes what TypeScript believes about the value
while compiling.

**CS lens — what the `!` means.**

`getContext('2d')` returns `CanvasRenderingContext2D | null`. The method returns
`null` if the browser does not support the canvas 2D API — which no modern
browser does. TypeScript does not know this. The `!` is a non-null assertion: it
tells the TypeScript compiler "I know this is not null; stop treating it as
possibly null." If TypeScript sees `null` remain possible, every drawing call
would need a null check first. The assertion keeps the code clean while being
accurate about the real-world behaviour.

---

## Concept: The Canvas Rendering Pipeline

Understanding the path API requires a mental model of what happens between
"you call a method" and "pixels appear on screen."

The canvas uses a *path buffer* model:

```
Your code calls:               What happens internally:
─────────────────              ──────────────────────────────────────────────
beginPath()           →        clear the path buffer
moveTo(x, y)          →        add "move to (x,y)" instruction to buffer
lineTo(x, y)          →        add "draw line to (x,y)" instruction to buffer
lineTo(x, y)          →        add "draw line to (x,y)" instruction to buffer
closePath()           →        add "return to start" instruction to buffer
fill()                →        rasterise the path buffer → composite → display
```

**Rasterisation** is the process of converting the path description (three line
instructions) into actual pixels. A line from (100, 400) to (400, 400) covers
300 pixels. Rasterisation determines which pixels those are and colours them.

**Nothing appears on screen until `fill()` or `stroke()` is called.** The
instructions in the buffer are just a description. The render happens at `fill()`
or `stroke()`.

`fill()` paints the interior of the closed shape.
`stroke()` paints only the outline — the lines themselves, not the area inside.

For this triangle we want a solid shape, so we use `fill()`.

**Real-world connection — the rendering pipeline is universal:**

This path buffer model — accumulate instructions, then rasterise — is used by
every browser-based graphics library. Phaser, PixiJS, and Konva (three of the
most widely used browser game and graphics engines) all build on the same
`CanvasRenderingContext2D` API. When you learn `beginPath()`, `fill()`, and
`stroke()` here, you are learning the substrate that every browser canvas
library sits on top of.

---

## Step 4 — Draw the Triangle

**The problem:** We need to draw a filled triangle. We have the drawing context
and we know the three vertex positions. We trace a path around the vertices and
fill it.

Add this to `src/main.ts` after the context setup:

```typescript
// ── Triangle geometry ────────────────────────────────────────────────────
// Three vertices define the triangle. Named objects rather than arrays
// because the names x and y communicate which coordinate is which.
// 'apex' is the correct geometric term for the highest vertex.

const triangleApex        = { x: 250, y: 100 };
const triangleBottomLeft  = { x: 100, y: 400 };
const triangleBottomRight = { x: 400, y: 400 };

// ── Drawing ───────────────────────────────────────────────────────────────

function drawTriangle(): void {
  // Read the fill colour from the CSS custom property.
  // This is the only correct way to get it — CSS owns the colour; we read it.
  const fillColour = getComputedStyle(document.documentElement)
    .getPropertyValue('--colour-triangle')
    .trim();

  drawingContext.fillStyle = fillColour;

  // Trace the triangle path and fill it.
  drawingContext.beginPath();
  drawingContext.moveTo(triangleApex.x,        triangleApex.y);
  drawingContext.lineTo(triangleBottomLeft.x,  triangleBottomLeft.y);
  drawingContext.lineTo(triangleBottomRight.x, triangleBottomRight.y);
  drawingContext.closePath();
  drawingContext.fill();
}

drawTriangle();
```

**Walkthrough — what happens when `drawTriangle()` runs:**

`getComputedStyle(document.documentElement).getPropertyValue('--colour-triangle').trim()`
asks the browser for the computed style of the root HTML element (the `:root` in
CSS). `.getPropertyValue('--colour-triangle')` reads the value assigned to that
custom property — in this case, `'#e94560'`. Browsers sometimes return the value
with leading or trailing whitespace, so `.trim()` strips it. The result is the
clean colour string `'#e94560'`.

`.fillStyle = fillColour` queues the colour for all subsequent fill operations.
It does not draw anything — it is a state assignment that says "use this colour
the next time you fill a path."

`beginPath()` clears the path buffer. Any previous path instructions are
discarded. Every call to `drawTriangle()` starts with a clean slate.

`moveTo(triangleApex.x, triangleApex.y)` moves the invisible pen to the apex
coordinates `(250, 100)` without drawing anything. This sets the starting point
of the path.

`lineTo(triangleBottomLeft.x, triangleBottomLeft.y)` draws a line from the
current pen position — the apex — to `(100, 400)`. The left edge of the triangle
is now in the buffer. The pen is now at `(100, 400)`.

`lineTo(triangleBottomRight.x, triangleBottomRight.y)` draws a line from
`(100, 400)` to `(400, 400)`. The base of the triangle is now in the buffer.
The pen is now at `(400, 400)`.

`closePath()` draws a line from `(400, 400)` — the current pen position, the
bottom-right vertex — back to `(250, 100)`, the first point in the path. The
right edge of the triangle is now in the buffer. The path is closed.

`fill()` rasterises the closed path. The browser calculates which pixels fall
inside the closed shape and paints them with `fillColour`. This is the single
call where pixels actually appear on the canvas. Everything before this was
preparation.

**Teaching the path operations:**

`beginPath()` clears the path buffer. Every `drawTriangle()` call starts fresh.
Without it, paths accumulate: the second call adds its three lines to the first
call's three lines and produces a six-sided shape. In lesson 11, when
`drawTriangle()` is called in a loop, `beginPath()` inside the function ensures
each triangle is a separate path.

`moveTo(x, y)` positions the pen without drawing. This is the starting point.

`lineTo(x, y)` draws from the current position to `(x, y)`. After
`moveTo(apex)` and `lineTo(bottomLeft)`, the current position is `bottomLeft`.
The next `lineTo(bottomRight)` draws the base.

`closePath()` draws from the current position back to the first point in the
path — from `bottomRight` back to `apex`. This is the third side of the
triangle. You could instead write a third `lineTo(triangleApex.x, triangleApex.y)`,
and it would look identical — but `closePath()` marks the path as explicitly
closed. When the path is closed, `fill()` knows exactly what the interior is.
With three open line segments, the fill algorithm has to guess where the shape
ends. For simple triangles the result is the same; for complex paths it matters.

**Why `.trim()` on the property value:**

Browsers sometimes return CSS custom property values with leading or trailing
whitespace: `' #e94560'` instead of `'#e94560'`. The Canvas API does not trim
it for you — `fillStyle = ' #e94560'` is silently ignored, and the fill colour
stays whatever it was before (likely black). `.trim()` removes that whitespace.
This is a real browser quirk documented in the Canvas specification. Now you
know why the `.trim()` is there — it is not tidiness, it is correctness.

**SE lens — why a function instead of inline code.**

`drawTriangle()` is called once right now. In lesson 11 a loop calls it five
times with different parameters. In lesson 18 a transformation matrix is applied
before each call. If the drawing code were inline, none of that would be
possible without rewriting it. We write the function now because we know where
the code is going, even if we are not going there yet.

### SAVE AND OPEN

Save all three files and open `index.html` in a browser. You should see a dark
canvas with a filled triangle on the left, and a dark panel on the right.

If nothing appears, open the browser developer console (F12 → Console tab). The
most common cause of a blank canvas is a TypeScript compilation error or a wrong
file path.

---

## Connect the Pieces

```
index.html              HTML structure — does not change after this lesson
src/style.css           Design tokens — extended whenever a new UI element appears
src/main.ts             Application logic — grows every lesson through to 18
drawTriangle()          Called in lesson 11 (loop), lesson 18 (transformation)
--colour-triangle       Defined in CSS, read by TypeScript — a single source
```

The two elements we created — `id="visualiser"` and `id="console-panel"` — are
the two halves of the application. Every subsequent lesson fills in one of them.
The HTML scaffold built here is the permanent skeleton.

---

## What Breaks Without This

**Without `beginPath()` before each `drawTriangle()` call:**

Add a second `drawTriangle()` call and change the triangle coordinates to
produce a different triangle. Both triangles appear, but if you now animate
(lesson 11) or clear and redraw (lesson 18), the accumulated path produces the
wrong shape because the buffer was never cleared. `beginPath()` is not optional.

**Without matching the drawing surface size to the CSS display size:**

Delete the two lines that set `canvasElement.width` and `canvasElement.height`.
The drawing surface defaults to 300×150. The triangle you draw at coordinates
(250, 100), (100, 400), (400, 400) partly falls outside the 300×150 surface —
only the portion that fits is drawn, and it is scaled and blurry. The triangle
you see is not the triangle you coded.

**With a hardcoded fill colour:**

Change `drawingContext.fillStyle = fillColour` to
`drawingContext.fillStyle = '#e94560'`. The triangle still draws. Change
`--colour-triangle` in CSS to `#00ff88`. The page background updates; the
console panel updates — but the triangle stays red. The CSS theme and the
drawing code have diverged silently. This is exactly the bug that reading from
the CSS custom property prevents.

---

## Definition of Done

- [ ] The browser tab title reads "OpenMAT"
- [ ] A filled triangle is visible on the canvas
- [ ] An empty dark panel is visible to the right of the canvas
- [ ] `src/style.css` contains no hardcoded colour values — every colour is `var(--...)`
- [ ] Changing `--colour-triangle` in CSS changes the triangle colour on page refresh
- [ ] You can explain what `beginPath()` does and what breaks without it
- [ ] You can explain why `{ x, y }` objects are used for points instead of arrays
- [ ] You can explain why `x` and `y` are acceptable names for coordinates
- [ ] You can explain what `apex` means geometrically
- [ ] You can explain why y increases downward on the canvas
- [ ] You can explain the difference between `fill()` and `stroke()`
- [ ] You can explain why `.trim()` is needed after `getPropertyValue()`
- [ ] You can explain what a type assertion (`as HTMLCanvasElement`) is, what it does at compile time, and what it does at runtime
- [ ] You can explain what the three states of a Git file are: modified, staged, and committed
- [ ] You can explain what a commit message should communicate and why "Add canvas" is a worse message than one that explains purpose
- [ ] Run `git add index.html src/style.css src/main.ts` then `git commit -m "Add canvas skeleton: hardcoded triangle and empty console panel, CSS design tokens established"`. The message describes what now exists and why, not what files were touched.

---

*Next: Lesson 02 — The Console. An input field appears in the empty panel. The
event loop — the single mechanism that makes every interactive application
respond to user input — is explained before a single event handler is written.*
