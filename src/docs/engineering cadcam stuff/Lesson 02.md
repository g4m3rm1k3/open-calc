# Lesson 2: A Surface With Its Own Rules

**What you will build:** a `<canvas>` element added to the page, a JavaScript
reference to it, and its 2D drawing API pulled out of it — plus a conversion
function that translates ordinary math coordinates (y grows upward) into the
coordinates the canvas actually uses internally (y grows downward). The
transferable problem this lesson is about: **the canvas does not share your
coordinate system**, and every geometry lesson from here through the rest of
this curriculum draws points that were computed in math space onto a surface
that expects canvas space. Getting this translation right, once, now, means
never silently drawing something upside-down later.

**What you need to know first:** Lesson 1 (Arc -1) — the `index.html`
skeleton and `script.js`, the file this lesson's code will live in.

> **A note on verification for this lesson and the ones like it:** this
> sandbox still has no real browser tab to open. Starting this lesson,
> verification instead uses two real Node packages — `jsdom` (a genuine,
> if simulated, DOM implementation) and `canvas` (a genuine 2D rendering
> engine with real pixel output) — wired together. This is **not** a
> fabrication or a guess at what would happen: `jsdom` builds a real
> `document`, `canvas` really rasterizes pixels, and `getImageData` reads
> real color values back out. It stands in for a browser tab the same way
> Node stood in for one in Lesson 1. You'll still confirm the true version
> yourself by opening `index.html` in an actual browser.

---

## Concept Unit: The `<canvas>` Element

### The Problem

Every tag used so far — `<title>`, `<script>` — either carried metadata or
loaded behavior; none of them gave the page a place to actually draw
pixels. Toolpaths, transformed points, and rendered shapes all need a
literal rectangular surface to be drawn onto, and HTML has one purpose-built
element for exactly that.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `index.html` (modified)
- **Change type:** add (a new line)
- **Location:** inside `<body>`, before the existing `<script src="script.js">` line
- **Dependencies:** the `index.html` skeleton from Lesson 1

### The New Code

```html
<canvas id="viewport" width="800" height="600"></canvas>
```

### The Updated Project

`index.html`, in full, new line marked:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>CAD/CAM Engine</title>
  </head>
  <body>
    <canvas id="viewport" width="800" height="600"></canvas>  <!-- ← new -->
    <script src="script.js"></script>
  </body>
</html>
```

The body, which previously only loaded a script, now also declares an
800×600 drawable surface, given an `id` so JavaScript can find it — which is
exactly what the next unit does. The `<canvas>` line has to come *before*
`<script src="script.js">` in the file: the browser parses top to bottom, and
the script (which is about to look for this canvas) needs the canvas to
already exist by the time it runs.

### Isolating the Concept

Parsed the same way Lesson 1 verified the skeleton, to confirm the browser's
parser sees this as one element with two attributes, not three separate
things:

```python
from html.parser import HTMLParser

class Tracker(HTMLParser):
    def handle_starttag(self, tag, attrs):
        print(f'START <{tag}> attrs={attrs}')
    def handle_endtag(self, tag):
        print(f'END   </{tag}>')

Tracker().feed('<canvas id="viewport" width="800" height="600"></canvas>')
```

Real output:

```
START <canvas> attrs=[('id', 'viewport'), ('width', '800'), ('height', '600')]
END   </canvas>
```

What this proves: `id`, `width`, and `height` are all just attributes on one
element — the same *kind* of thing `src` was on `<script>` in Lesson 1, not
three new concepts. This is called the **canvas element** — a real,
addressable HTML element like any other, that additionally happens to own a
drawable bitmap the size given by `width`/`height`.

### Mechanical Walkthrough

- **`<canvas>` … `</canvas>`** — (a) first appearance. An element whose
  whole purpose is owning a raster surface you can draw pixels into via
  JavaScript — nothing renders from markup alone.
- **`id="viewport"`** — (b) a concept reappearing: this is the same
  *attribute* idea `src` was in Lesson 1 (a name/value pair modifying a
  tag), just a different attribute — `id` gives this specific element a
  name JavaScript can look it up by.
- **`width="800"` / `height="800"`** — (b) attribute, reappearing per the
  same reasoning as `id`. Specific to `<canvas>`: these set the actual
  pixel dimensions of the drawable bitmap, not just its on-page display
  size (a distinction that matters the moment CSS sizing enters the
  picture, later in this curriculum).

### CS Lens

Routine syntax — a second attribute usage doesn't need a fresh CS lens; the
concept was already covered when `src` was introduced.

### SE Lens

The alternative not chosen: give the canvas no `id`, and locate it later by
tag name or position (`document.querySelector("canvas")`, or `body.children[0]`).
That works while there's exactly one canvas on the page. The real tradeoff
is fragility: position-based lookup silently breaks the moment a second
canvas or an unrelated element gets added anywhere earlier in the body,
whereas `id`-based lookup keeps working regardless of what else changes
around it. One extra attribute now avoids a lookup bug that would show up
only after the page has grown enough to make it confusing to trace.

### Run It

Structural proof already shown above. In your own browser: opening
`index.html` now shows an 800×600 blank rectangle roughly where `<canvas>`
was placed — visually indistinguishable from empty page background, but a
real element (right-click it — "Inspect" will show a genuine `<canvas>` node
now, where there wasn't one in Lesson 1).

### Connecting

There's now a real drawable surface on the page — nothing can be drawn onto
it yet, because nothing in JavaScript has a reference to it, which the next
unit fixes.

---

## Concept Unit: Querying the DOM for an Element

### The Problem

`script.js` runs completely independently of the HTML around it — it has no
built-in awareness that a `<canvas id="viewport">` exists. Before any drawing
code can touch it, JavaScript needs a way to search the page's element tree
(the same tree Lesson 1 traced with the HTML parser) and get back a direct
reference to that one specific element.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add (replacing the existing single line)
- **Location:** top of `script.js`, before the existing `console.log` line
- **Dependencies:** the `<canvas id="viewport">` element from the previous unit

### The New Code

```js
const canvas = document.querySelector("#viewport");
```

### The Updated Project

`script.js`, in full, new line marked:

```js
const canvas = document.querySelector("#viewport");  // ← new
console.log("script loaded");
```

The file now does two things in order: find the canvas element, then log —
the log line hasn't moved, it's just no longer the only statement.

### Isolating the Concept

Run against a real (simulated) DOM, to see exactly what comes back:

```js
const { JSDOM } = require("jsdom");
const dom = new JSDOM(
  '<!DOCTYPE html><html><body><canvas id="viewport" width="800" height="600"></canvas></body></html>'
);
const document = dom.window.document;

const el = document.querySelector("#viewport");
console.log("found element:", el.tagName, "id=" + el.id, "width=" + el.width, "height=" + el.height);
```

Real output:

```
found element: CANVAS id=viewport width=800 height=600
```

What this proves: `querySelector` didn't return text, or `true`/`false` —
it returned the actual live element node from the tree, with its real
tag name and attributes still attached and readable. This is called
**querying the DOM** — searching the parsed element tree using a CSS-style
selector string, here `"#viewport"` (the `#` means "match by `id`", the
same syntax CSS itself uses to target an element by `id`).

### Mechanical Walkthrough

- **`document`** — (a) first appearance. The global object every script
  running in a page automatically has access to, representing the entire
  parsed page — the root of the same tree Lesson 1's parser traced.
- **`.querySelector(...)` method call** — (a) first appearance. Searches
  that tree for the first element matching a CSS-style selector string,
  and returns it — or `null` if nothing matches.
- **`"#viewport"` string literal** — (b) a concept reappearing: a string
  literal, same as `"script loaded"` in Lesson 1. What's new is only the
  *content* — CSS-selector syntax, where `#` prefixes an `id` to match
  against.
- **`const canvas = ...`** — (a) first appearance. `const` declares a
  variable whose binding can't be reassigned after this line — appropriate
  here because this script will never need `canvas` to point at a
  different element.

### CS Lens

Searching a tree structure by a query string is one of the most-reused
ideas in software.

```
Also recognized in: CSS selectors themselves, XPath queries against XML,
SQL's WHERE clause searching rows, a file system's find/glob patterns
```

### SE Lens

The alternative not chosen: `document.getElementById("viewport")`, an older
API that does almost the same thing but only matches by `id`, with no CSS
selector syntax. `querySelector` was chosen instead because the same
mental model (CSS selector strings) will get reused constantly later — to
select by class, by tag, by nested structure — so learning selector syntax
once here pays off repeatedly, instead of learning several separate,
narrower lookup methods over time.

### Run It

Real output already shown above. In your own browser's console, typing
`document.querySelector("#viewport")` directly will print the live canvas
element.

### Connecting

`canvas` is now a real reference to the drawable surface built in the
previous unit — but it's still just an element, with no drawing methods of
its own; the next unit gets the actual API surface used to draw onto it.

---

## Concept Unit: The 2D Rendering Context

### The Problem

The `canvas` element itself has almost no drawing methods — `<canvas>` is
deliberately generic, because browsers support more than one way to draw
into it (2D, or 3D via WebGL, which Three.js will use much later in this
curriculum). Before drawing anything, code has to explicitly ask the canvas
which drawing API it wants, and get back an object built specifically for
that mode.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add (one new line)
- **Location:** directly after the `const canvas = ...` line from the
  previous unit
- **Dependencies:** `canvas`, the element reference from the previous unit

### The New Code

```js
const ctx = canvas.getContext("2d");
```

### The Updated Project

`script.js`, in full, new line marked:

```js
const canvas = document.querySelector("#viewport");
const ctx = canvas.getContext("2d");  // ← new
console.log("script loaded");
```

The file now holds two things: a reference to the element itself, and a
separate reference to its 2D drawing API — every drawing instruction from
this point in the curriculum forward is a method call on `ctx`, never on
`canvas` directly.

### Isolating the Concept

```js
const { createCanvas } = require("canvas");
const c = createCanvas(800, 300);
const ctx = c.getContext("2d");
console.log("context type:", typeof ctx);
console.log("canvas.width:", c.width, "canvas.height:", c.height);
```

Real output:

```
context type: object
canvas.width: 800 canvas.height: 300
```

What this proves: `getContext("2d")` hands back a whole object, not a
boolean or a simple value — an object carrying every 2D drawing method
(`fillRect`, `getImageData`, and everything used for the rest of this
curriculum) already bound to this specific canvas's pixels. This object is
called the **2D rendering context** — it's what actually draws; the canvas
element itself just owns the bitmap the context draws into.

### Mechanical Walkthrough

- **`canvas.getContext("2d")`** — (a) first appearance for `getContext`
  itself. `"2d"` is (a) first appearance too, as a specific value — it's
  the string naming which drawing API to request; passing `"webgl"` here
  instead, later in the curriculum, is how Three.js gets its own access to
  the same canvas.
- **`const ctx = ...`** — (c) genuinely basic — `const` was already fully
  explained in the previous unit; this is a second, ordinary use of it.

### CS Lens

Asking an object which capability/interface you want, and getting back a
different object scoped to exactly that capability, is worth naming on its
own.

```
Also recognized in: a database connection object handing back a
transaction-scoped cursor, an OS file handle vs. the file descriptor it
wraps, a browser's WebGL context vs. its 2D context on the same canvas
```

### SE Lens

The alternative not chosen: `<canvas>` could have exposed drawing methods
directly on the element itself, with no separate context object. The real
reason it doesn't: the same canvas can be drawn into two fundamentally
different ways (2D and WebGL), each with entirely different method sets and
internal rendering pipelines. Keeping them as separate context objects
means neither API has to carry methods that only make sense for the other —
the cost is one extra line to fetch the context; the benefit is `ctx`
having *only* 2D-relevant methods on it, later in this curriculum, when
autocomplete and type-checking start to matter.

### Run It

Real output already shown above.

### Connecting

`ctx` is now the real, working handle this whole curriculum draws through —
the next unit uses it to prove something that matters more than drawing a
shape: *where* on the canvas a given coordinate actually lands.

---

## Concept Unit: Canvas Space vs. Math Space

### The Problem

In ordinary math — and in every vector/transformation lesson coming up in
Arc 1 and Arc 2 — increasing `y` moves a point *up*. The canvas's 2D context
does the opposite: its origin `(0, 0)` is the **top-left** corner, and
increasing `y` moves *down* the page. Any point computed in math space and
handed directly to `ctx` as if it were already canvas space will render
correctly on the x-axis and **upside-down** on the y-axis. This has to be
solved once, here, with one small conversion function — not rediscovered as
a bug partway through Arc 2.

### By Hand

Take a point in math space, `(x=100, y=50)` — meaning "50 units up from the
bottom" — and a canvas 300 pixels tall. To find which row of pixels that
actually corresponds to, by hand:

```
canvasY = canvasHeight - mathY
canvasY = 300 - 50
canvasY = 250
```

Row 250 out of 300 rows *is* close to the bottom — which matches the
intent ("50 units up from the bottom" should land near the bottom, not the
top). The x-coordinate needs no such conversion — canvas x and math x both
increase rightward; only y disagrees.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add (a new function)
- **Location:** after the `ctx` line, before `console.log`
- **Dependencies:** `ctx`, from the previous unit

### The New Code

```js
function toCanvasY(mathY, canvasHeight) {
  return canvasHeight - mathY;
}
```

### The Updated Project

`script.js`, in full, new lines marked:

```js
const canvas = document.querySelector("#viewport");
const ctx = canvas.getContext("2d");

function toCanvasY(mathY, canvasHeight) {   // ← new
  return canvasHeight - mathY;              // ← new
}                                            // ← new

console.log("script loaded");
```

The file now carries a reusable conversion function, alongside the element
and context references — every later lesson that plots a math-space point
calls `toCanvasY` on its `y` value before handing it to `ctx`.

### Isolating the Concept

The by-hand result above, proven with real pixels instead of just arithmetic
— drawing one square using the converted coordinate, and a second square
using the *unconverted* `mathY` directly, to see them land in genuinely
different places on the same real canvas:

```js
const { createCanvas } = require("canvas");
const canvas = createCanvas(800, 300);
const ctx = canvas.getContext("2d");

const mathPoint = { x: 100, y: 50 };

// Correct: convert math-space y into canvas-space y before drawing
const canvasY = canvas.height - mathPoint.y;
console.log("hand math: canvasHeight - mathY =", canvas.height, "-", mathPoint.y, "=", canvasY);
ctx.fillStyle = "red";
ctx.fillRect(mathPoint.x, canvasY, 10, 10);

// Wrong: draw using mathY directly as if it were already canvas-space
ctx.fillStyle = "blue";
ctx.fillRect(mathPoint.x + 50, mathPoint.y, 10, 10);

const redSample = ctx.getImageData(mathPoint.x + 5, canvasY + 5, 1, 1).data;
console.log("red square center, canvas (" + (mathPoint.x + 5) + "," + (canvasY + 5) + "):", Array.from(redSample));

const blueSample = ctx.getImageData(mathPoint.x + 55, mathPoint.y + 5, 1, 1).data;
console.log("blue square center, canvas (" + (mathPoint.x + 55) + "," + (mathPoint.y + 5) + "):", Array.from(blueSample));
```

Real output:

```
hand math: canvasHeight - mathY = 300 - 50 = 250
red square center, canvas (105,255): [ 255, 0, 0, 255 ]
blue square center, canvas (155,55): [ 0, 0, 255, 255 ]
```

What this proves, concretely, with real pixel data and not just a claim:
the red pixel — drawn using `toCanvasY`'s formula — really is solid red
`(255,0,0,255)` at row 250, near the bottom of a 300-tall canvas, matching
the hand calculation exactly. The blue pixel — drawn from the same original
`mathY = 50`, but *without* converting it — is solid blue at row 55, near
the *top*. Same original `y` value, two very different real locations on
the canvas, 200 pixels apart vertically. This is what "canvas space" and
"math space" being different coordinate systems actually means, in pixels
you can measure, not just in the abstract.

### Mechanical Walkthrough

- **`function toCanvasY(mathY, canvasHeight) { ... }`** — (a) first
  appearance of a function *declaration* in this project — a named,
  reusable block of code taking inputs (`mathY`, `canvasHeight`) and
  producing an output.
- **`return canvasHeight - mathY;`** — (a) first appearance of `return` —
  hands a value back to whatever called the function, ending the
  function's execution at that point. `-` (subtraction) itself is (c)
  genuinely basic arithmetic, already familiar.

### CS Lens

Converting between two coordinate systems that describe the same space
differently is a **change of basis / coordinate transform** — a small
instance of exactly the same idea Arc 2 formalizes with full transformation
matrices.

```
Also recognized in: latitude/longitude vs. screen x/y in mapping software,
a game engine's world space vs. screen space, audio sample index vs.
elapsed time, Celsius vs. Fahrenheit as two coordinate systems for the
same physical quantity
```

### SE Lens

The alternative not chosen: skip a named conversion function, and
subtract from `canvasHeight` inline, everywhere a point gets drawn,
for the rest of the curriculum. That works for one call site. The real
cost: Arc 1 and Arc 2 are about to generate points from vector and matrix
math, in bulk, from many different functions — inlining the same
subtraction dozens of times means a single sign error, if one ever slips
in, has to be hunted down and fixed in every one of those places
individually. One function, written once, means the flip logic exists in
exactly one place to ever be wrong or fixed.

### Commands Needed

None new — running the code follows the same `node` pattern already used
in Lesson 1 and earlier in this lesson.

### Run It

Real output already shown above, captured this session.

### Connecting

`script.js` now holds everything the rest of Arc 0 and Arc 1 depend on: a
real canvas, a real drawing context, and a working, *verified* bridge
between the coordinate system your math will use and the one the canvas
actually renders in.

---

## Closing

### Connect the Pieces

One value traced through the whole lesson: the point `(100, 50)` in math
space. It's meaningless to the canvas on its own — the canvas only
understands its own top-left-origin coordinates. `toCanvasY` (Unit 4)
converts its `y` into `250`, a coordinate the context returned by
`getContext("2d")` (Unit 3) can actually draw at, on the element found by
`querySelector("#viewport")` (Unit 2), which only exists on the page
because of the `<canvas>` tag added in Unit 1. Skip any one unit and this
chain breaks: no tag, nothing to find; no context, nothing to draw with; no
conversion, the point renders in the wrong physical place while looking
"correct" in the code.

### What Breaks Without This

Commenting out the conversion and using `mathY` directly, the way the
"wrong" blue square did above, silently produces a real, working page —
nothing throws an error, nothing looks broken in the code. It just draws
everything upside-down relative to what the math intended, which is
precisely why this needed proving with real pixels rather than trusted on
faith: a bug like this doesn't announce itself.

### Exercises

- By hand, convert the math-space point `(x=400, y=550)` into canvas space
  for an 800×600 canvas. Then write the one line of code that draws a
  small `fillRect` there using `toCanvasY`, and confirm visually (in your
  browser) that it lands near the top of the page, not the bottom.
- Write `toCanvasX` — even though this lesson argued x needs no
  conversion, write the identity version (`return mathX;`) anyway, and
  explain in one sentence why it's still worth having, symmetrically, even
  though it does nothing.
- In your browser's console, run `document.querySelector("#nope")` (a
  selector that matches nothing) and observe what comes back, instead of
  an element — this is the `null` case `querySelector` can return, which
  real code will eventually need to check for.

### Definition of Done

- [ ] `index.html` has a `<canvas id="viewport" width="800" height="600">`
      before the `<script>` tag
- [ ] `script.js` finds it with `querySelector`, gets its 2D context, and
      defines `toCanvasY`
- [ ] Opening `index.html` in a real browser still shows `script loaded` in
      the console, with no errors, and inspecting the page shows a real
      `<canvas>` element
- [ ] You can explain, without looking, why `(100, 50)` in math space is
      *not* the same pixel as canvas coordinate `(100, 50)`
- [ ] Commit:

  ```
  git add index.html script.js
  git commit -m "Add canvas, get its 2D context, and convert math-space y to canvas-space y

  Establishes the drawable surface and the one coordinate conversion every
  later geometry lesson depends on. Verified with real pixel data that a
  converted point and an unconverted point land in different, predictable
  places on the canvas."
  ```
