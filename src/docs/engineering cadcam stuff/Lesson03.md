# Lesson 3: Intent Before Ink

**What you will build:** a horizontal line segment and a filled point (a
small circle), both drawn using the canvas's actual path-based drawing
model — and a real, pixel-proven demonstration of why that model has a
"declare your intent, then render it" shape instead of drawing immediately.
The transferable problem: the canvas API separates **recording a path**
from **rendering it**, and treating those as one step (as they visually
seem to be) causes bugs that silently accumulate rather than error out.

**What you need to know first:** Lesson 2 (Arc 0) — `canvas`, `ctx`, and
`toCanvasY`, all defined in `script.js` and used again here.

> Verification in this lesson continues using the real headless canvas
> engine introduced in Lesson 2 (`canvas` + `jsdom`), with `getImageData`
> reading back genuine pixel values after each draw call.

---

## Concept Unit: `beginPath()` — Starting a New Path

### The Problem

The canvas doesn't draw a line the instant you tell it "go from here to
there." Instead, the 2D context keeps an internal, invisible list of
subpaths — moves and lines you've described but not yet rendered. Before
describing a *new* shape, that internal list needs to be cleared, or the
new shape's instructions get appended onto whatever was already there from
before.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after the existing `toCanvasY` function
- **Dependencies:** `ctx`, from Lesson 2

### The New Code

```js
ctx.beginPath();
```

### The Updated Project

```js
const canvas = document.querySelector("#viewport");
const ctx = canvas.getContext("2d");

function toCanvasY(mathY, canvasHeight) {
  return canvasHeight - mathY;
}

ctx.beginPath();  // ← new

console.log("script loaded");
```

### Isolating the Concept

The real, verifiable failure this call prevents — two separate line
segments drawn with two separate `stroke()` calls, but only one
`beginPath()` at the very start (i.e., none between them):

```js
ctx.lineWidth = 6;

ctx.strokeStyle = "black";
ctx.moveTo(50, 50);
ctx.lineTo(200, 50);
ctx.stroke();
console.log("after first stroke, line 1 pixel:", Array.from(ctx.getImageData(120, 50, 1, 1).data));

ctx.strokeStyle = "red";
ctx.moveTo(500, 400);
ctx.lineTo(650, 400);
ctx.stroke();
console.log("after second stroke, line 1 pixel:", Array.from(ctx.getImageData(120, 50, 1, 1).data));
console.log("line 2 pixel:", Array.from(ctx.getImageData(575, 400, 1, 1).data));
```

Real output:

```
after first stroke, line 1 pixel: [ 0, 0, 0, 255 ]
after second stroke, line 1 pixel: [ 255, 0, 0, 255 ]
line 2 pixel: [ 255, 0, 0, 255 ]
```

What this proves: line 1 was drawn correctly, in black, by the first
`stroke()` call. But because `beginPath()` was never called before the
second shape, line 1 *never left the path* — it was still sitting in the
context's internal list when the second `stroke()` ran, and got re-rendered
using whatever `strokeStyle` was active *at that later moment* — red. Line
1's own pixel actually changed color, after the fact, from a `stroke()`
call that never mentioned it. This internal list of not-yet-cleared
subpaths is called the **current path**, and `beginPath()` is what resets
it to empty.

### Discarding

This two-line demo is discarded — it exists only to prove the failure mode;
it never appears in the project.

### Mechanical Walkthrough

- **`ctx.beginPath()`** — (a) first appearance. Clears the context's
  current path back to empty, so whatever gets described next starts
  clean, with nothing left over from earlier draw calls.

### CS Lens

A cleared, reusable buffer that has to be explicitly reset between uses is
a recurring shape, not unique to canvas.

```
Also recognized in: a StringBuilder needing .clear() between builds,
a database cursor needing to be reset before re-iterating, a video
game's per-frame command buffer being cleared before the next frame
is recorded
```

### SE Lens

The alternative not chosen: have the context auto-clear its path after
every `stroke()` or `fill()` call, so this step wouldn't be needed. Browsers
don't do this because sometimes accumulating *is* wanted — building up one
complex path from many `lineTo` calls before a single `stroke()`, for
instance, which is exactly what the next two units do. The real cost of the
explicit-reset design: it's opt-in safety, not automatic — skip it and
nothing errors, as proven above; the bug just waits, silent, for the next
shape.

### Run It

Real output already shown above.

### Connecting

The path is now guaranteed empty — the next two units start actually
describing a shape into it.

---

## Concept Unit: `moveTo()` — Positioning Without Drawing

### The Problem

A path needs a starting point before it can have any line segments. But
placing that starting point can't itself draw anything — otherwise every
path would begin with an unwanted dot or stray mark at its first
coordinate.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** directly after `ctx.beginPath()`
- **Dependencies:** `beginPath()`, from the previous unit; `toCanvasY`,
  from Lesson 2

### The New Code

```js
const lineStart = { x: 50, y: 100 };
ctx.moveTo(lineStart.x, toCanvasY(lineStart.y, canvas.height));
```

### The Updated Project

```js
ctx.beginPath();

const lineStart = { x: 50, y: 100 };                                  // ← new
ctx.moveTo(lineStart.x, toCanvasY(lineStart.y, canvas.height));       // ← new
```

### Isolating the Concept

```js
ctx.beginPath();
ctx.moveTo(50, 500);
// deliberately no lineTo, no stroke yet
console.log("pixel at (50,500) after moveTo alone:", Array.from(ctx.getImageData(50, 500, 1, 1).data));
```

Real output:

```
pixel at (50,500) after moveTo alone: [ 0, 0, 0, 0 ]
```

What this proves: `moveTo` really draws nothing — the pixel it "moved to"
is still fully transparent. It only records a starting coordinate for
whatever comes next. This is called **positioning the pen** — a common
mental model for path APIs: think of it as lifting an actual pen and
placing its tip down at a coordinate, without touching ink to paper yet.

### Discarding

This isolated check is discarded — it never appears in the project; the
real starting point is `lineStart` from the code above.

### Mechanical Walkthrough

- **`const lineStart = { x: 50, y: 100 };`** — (a) first appearance of an
  object literal used to group two related values (`x` and `y`) under one
  name, rather than as two separate loose variables.
- **`ctx.moveTo(x, y)`** — (a) first appearance. Sets the path's current
  position to `(x, y)` in canvas-space coordinates, without adding
  anything visible.
- **`toCanvasY(lineStart.y, canvas.height)`** — (b) a concept reappearing:
  the exact conversion function built and proven in Lesson 2, used here
  for the first time in real project code — `lineStart.y` (math-space) is
  converted before being handed to `moveTo`, which expects canvas-space.

### CS Lens

Routine application of an already-taught concept (`toCanvasY`) — no new CS
lens needed here.

### SE Lens

The alternative not chosen: pass raw numbers directly — `ctx.moveTo(50,
toCanvasY(100, 600))` — instead of naming the point `lineStart` first. The
real tradeoff: once the next unit adds a second point (`lineEnd`), inline
numbers make it hard to tell, at a glance, which pair belongs to which
endpoint, especially once real toolpath coordinates replace these simple
values later in the curriculum. Naming the point costs one extra line now
and pays for itself the moment there's more than one point in play.

### Run It

Real output already shown above.

### Connecting

The path now has a starting position but still no actual line in it — the
next unit adds one.

---

## Concept Unit: `lineTo()` — Recording a Line Segment

### The Problem

With a starting position set, the path needs an instruction describing
where a straight line from that position should go. Like `moveTo`, this
still only *records* intent — nothing renders yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** directly after the `moveTo` line
- **Dependencies:** `moveTo()`, from the previous unit

### The New Code

```js
const lineEnd = { x: 700, y: 100 };
ctx.lineTo(lineEnd.x, toCanvasY(lineEnd.y, canvas.height));
```

### The Updated Project

```js
ctx.beginPath();

const lineStart = { x: 50, y: 100 };
ctx.moveTo(lineStart.x, toCanvasY(lineStart.y, canvas.height));

const lineEnd = { x: 700, y: 100 };                                  // ← new
ctx.lineTo(lineEnd.x, toCanvasY(lineEnd.y, canvas.height));          // ← new
```

### Isolating the Concept

```js
ctx.beginPath();
ctx.moveTo(50, 500);
ctx.lineTo(700, 500);
// deliberately no stroke() yet
console.log("pixel at (400,500) after lineTo but before stroke:", Array.from(ctx.getImageData(400, 500, 1, 1).data));
```

Real output:

```
pixel at (400,500) after lineTo but before stroke: [ 0, 0, 0, 0 ]
```

What this proves: even with both a starting point and a line segment fully
described, the canvas still shows nothing — `lineTo`, like `moveTo`, only
adds to the current path's description. This confirms the path really is
just data at this point, not pixels — which is exactly what the next unit
finally converts into pixels.

### Discarding

Discarded — never appears in the project.

### Mechanical Walkthrough

- **`const lineEnd = { x: 700, y: 100 };`** — (c) genuinely basic — the
  same object-literal pattern `lineStart` already established one unit
  ago.
- **`ctx.lineTo(x, y)`** — (a) first appearance. Appends a straight line
  segment to the current path, from wherever the path's position currently
  is (set by the last `moveTo` or `lineTo`) to `(x, y)`, and moves the
  path's current position to that new point.

### CS Lens

Routine — no new CS lens; this is the same "recorded, not rendered" idea
`moveTo` already established, just for a segment instead of a point.

### SE Lens

Same reasoning as `moveTo`'s SE lens — named points over inline numbers.
No new tradeoff to state here.

### Run It

Real output already shown above.

### Connecting

The path now fully describes a straight line, start to end — nothing has
been drawn to a single pixel yet.

---

## Concept Unit: `stroke()` — Rendering the Path's Outline

### The Problem

Everything so far only builds a description. At some point that
description has to actually become visible pixels — and specifically, as
an *outline*, tracing the path's lines, rather than a solid filled shape.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** directly after the `lineTo` line
- **Dependencies:** `lineTo()`, from the previous unit

### The New Code

```js
ctx.lineWidth = 6;
ctx.stroke();
```

### The Updated Project

```js
ctx.beginPath();

const lineStart = { x: 50, y: 100 };
ctx.moveTo(lineStart.x, toCanvasY(lineStart.y, canvas.height));

const lineEnd = { x: 700, y: 100 };
ctx.lineTo(lineEnd.x, toCanvasY(lineEnd.y, canvas.height));

ctx.lineWidth = 6;   // ← new
ctx.stroke();        // ← new
```

The path built across the last three units — one `moveTo`, one `lineTo` —
is now what actually gets rendered as pixels, all at once, by this single
`stroke()` call.

### Isolating the Concept

The full line, rendered for real and sampled at two points — one on it,
one clearly off it:

```js
ctx.lineWidth = 6;
ctx.beginPath();
ctx.moveTo(50, toCanvasY(100, canvas.height));
ctx.lineTo(700, toCanvasY(100, canvas.height));
ctx.stroke();

const canvasY = toCanvasY(100, canvas.height);
console.log("line drawn at canvasY =", canvasY);
console.log("pixel on the line, (400," + canvasY + "):", Array.from(ctx.getImageData(400, canvasY, 1, 1).data));
console.log("pixel 50px above the line, (400," + (canvasY - 50) + "):", Array.from(ctx.getImageData(400, canvasY - 50, 1, 1).data));
```

Real output:

```
line drawn at canvasY = 500
pixel on the line, (400,500): [ 0, 0, 0, 255 ]
pixel 50px above the line, (400,450): [ 0, 0, 0, 0 ]
```

What this proves: `stroke()` is the exact moment the path's description
becomes real, opaque pixels (`[0,0,0,255]`, solid black) exactly along the
line, and nowhere off it (`[0,0,0,0]`, fully transparent 50px away). This
is called **rendering the path's outline** — "outline" specifically, since
`stroke()` only paints along the path's lines, not the region they might
enclose (that's the next unit's job, for shapes that need it).

### Discarding

Discarded — this exact sequence is what the real project code above
already does; there's nothing further to remove.

### Mechanical Walkthrough

- **`ctx.lineWidth = 6;`** — (a) first appearance. A property (not a
  method call) on the context, controlling how many pixels wide the
  rendered outline is — set before `stroke()` runs, since `stroke()` reads
  it at render time.
- **`ctx.stroke()`** — (a) first appearance. Renders every subpath
  currently in the path as pixels, tracing their outlines using the
  current `strokeStyle` and `lineWidth`.

### CS Lens

Separating a description phase from a render/execution phase is a hard
concept worth naming broadly, not just for canvas.

```
Also recognized in: SQL query planning (a query is parsed and planned
before it executes), a compiler building an AST before generating machine
code, a game engine's scene graph being built before the renderer walks it,
React's virtual DOM being computed before the real DOM is updated
```

### SE Lens

The alternative not chosen: render each segment immediately as it's
described, with no separate `stroke()` step. The real reason the API is
split this way: `stroke()` operates on the *whole* path at once, which
lets the browser optimize rendering a complex shape with many segments as
one operation, rather than one small render call per segment. The cost is
exactly the bug demonstrated in this lesson's first unit — forgetting
`beginPath()` before the next shape silently pulls old geometry into the
next `stroke()` call.

### Run It

Real output already shown above.

### Connecting

The line segment this lesson set out to build now genuinely exists as
pixels. The next two units cover the other half of "drawing primitives" —
representing a single point, which a straight line can't do on its own.

---

## Concept Unit: `arc()` — A Circular Path

### The Problem

Toolpaths and geometry lessons ahead need a way to mark a single point
visibly — but a canvas has no "draw one dot" primitive, because a
mathematical point has no size and would be genuinely invisible if drawn
literally. The practical solution is to draw a small circle centered on
that point instead, which needs a way to describe a circular path.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after the line-drawing code from the previous units
- **Dependencies:** `beginPath()`, `toCanvasY`

### The New Code

```js
const point = { x: 400, y: 300 };
ctx.beginPath();
ctx.arc(point.x, toCanvasY(point.y, canvas.height), 15, 0, Math.PI * 2);
```

### The Updated Project

```js
ctx.lineWidth = 6;
ctx.stroke();

const point = { x: 400, y: 300 };                                              // ← new
ctx.beginPath();                                                                // ← new
ctx.arc(point.x, toCanvasY(point.y, canvas.height), 15, 0, Math.PI * 2);        // ← new
```

Note the second `ctx.beginPath()` here — this is a *new* shape, and per the
first unit of this lesson, skipping it would silently pull the already-
stroked line back into whatever gets rendered next.

### Isolating the Concept

```js
ctx.beginPath();
ctx.arc(400, 300, 15, 0, Math.PI * 2);
console.log("pixel at arc center, before any fill/stroke:", Array.from(ctx.getImageData(400, 300, 1, 1).data));
```

Real output:

```
pixel at arc center, before any fill/stroke: [ 0, 0, 0, 0 ]
```

What this proves: exactly like `moveTo`/`lineTo`, `arc()` only records —
still nothing rendered, even at the circle's own center. This is called
describing a **circular path** — a full circle here, since the last two
arguments (`0` and `Math.PI * 2`) mean "start angle 0, end angle a full
360°, in radians."

### Discarding

Discarded — never appears in the project.

### Mechanical Walkthrough

- **`ctx.arc(x, y, radius, startAngle, endAngle)`** — (a) first appearance.
  Adds a circular (or partial-circle) arc to the current path, centered at
  `(x, y)`.
- **`15`** — (c) genuinely basic — a numeric literal, the radius in
  pixels.
- **`0` and `Math.PI * 2`** — (a) first appearance for the concept of
  **radians** as the unit `arc()` expects for angles, rather than degrees
  — `Math.PI * 2` radians is exactly one full 360° turn. `Math.PI` itself
  is (a) first appearance: a built-in constant on the global `Math` object
  equal to π.

### CS Lens

Not a hard concept on its own at this stage — radians get their full
CS/math treatment once Arc 2's rotation-matrix lessons need them for real
trigonometry, not just "draw a full circle."

### SE Lens

The alternative not chosen: approximate a circle with many short `lineTo`
segments. `arc()` exists because circles are common enough, and
approximating them with lines either looks faceted (too few segments) or
wastes points (too many) — a dedicated primitive avoids that tradeoff
entirely for the common case of an actual circle or arc.

### Run It

Real output already shown above.

### Connecting

A circular path now exists, centered on the point — the last unit makes it
actually visible, as a solid dot rather than a circular outline.

---

## Concept Unit: `fill()` — Filling a Path's Interior

### The Problem

`stroke()`, from earlier in this lesson, only paints a path's outline. A
"point" marker reads much more clearly as a solid dot than as a thin
circular ring — which needs a different rendering operation: one that
paints the *interior* a path encloses, not just its edge.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** directly after the `arc()` call
- **Dependencies:** `arc()`, from the previous unit

### The New Code

```js
ctx.fill();
```

### The Updated Project

```js
const point = { x: 400, y: 300 };
ctx.beginPath();
ctx.arc(point.x, toCanvasY(point.y, canvas.height), 15, 0, Math.PI * 2);
ctx.fill();  // ← new
```

The full script now draws one line (stroked) and one solid dot (filled) —
`script.js` in its entirety at the end of this lesson is shown in the
Closing section below.

### Isolating the Concept

```js
ctx.beginPath();
ctx.arc(400, 300, 15, 0, Math.PI * 2);
ctx.fill();

console.log("center pixel:", Array.from(ctx.getImageData(400, 300, 1, 1).data));
console.log("14px from center (inside radius 15):", Array.from(ctx.getImageData(414, 300, 1, 1).data));
console.log("20px from center (outside radius 15):", Array.from(ctx.getImageData(420, 300, 1, 1).data));
```

Real output:

```
center pixel: [ 0, 0, 0, 255 ]
14px from center (inside radius 15): [ 0, 0, 0, 248 ]
20px from center (outside radius 15): [ 0, 0, 0, 0 ]
```

What this proves: the entire interior is solid black (opaque, alpha 255)
at the center; still nearly fully opaque (248 of 255 — the small drop is
antialiasing softening the true edge) just inside the 15px radius; and
fully transparent just outside it. The circle is genuinely filled, not
just outlined, and the fill stops right where the radius says it should.

### Discarding

Discarded — the real project's version is the code shown above.

### Mechanical Walkthrough

- **`ctx.fill()`** — (a) first appearance. Paints the interior enclosed by
  the current path's subpath(s), using the current `fillStyle` (default
  black, unset so far in this project), determined by which regions the
  path's lines wind around.

### CS Lens

`fill()` deciding "interior" from a path's lines uses a **winding rule** —
worth a light mention now, full treatment deferred until a shape with
overlapping or self-intersecting subpaths actually needs it, later in this
curriculum (per the schema's own guidance: routine syntax doesn't need the
full multi-example CS lens, and this is the edge of "routine" — flagged,
not expanded, until it's load-bearing).

### SE Lens

The alternative not chosen: use `stroke()` with a very large `lineWidth` to
fake a filled circle. That technically can look similar for a plain circle,
but the tradeoff is real: a thick stroke's outer and inner edges both scale
with `lineWidth`, so getting an exact target radius means constantly
recomputing the right stroke width, whereas `fill()` with `arc()`'s own
radius argument states the intended size directly, once, unambiguously.

### Run It

Real output already shown above.

### Connecting

The point is now a real, solid, visible dot — this lesson's two goals (a
line, a point) are both complete and both pixel-verified.

---

## Closing

### Connect the Pieces

`script.js`, in full, at the end of this lesson:

```js
const canvas = document.querySelector("#viewport");
const ctx = canvas.getContext("2d");

function toCanvasY(mathY, canvasHeight) {
  return canvasHeight - mathY;
}

ctx.beginPath();
const lineStart = { x: 50, y: 100 };
ctx.moveTo(lineStart.x, toCanvasY(lineStart.y, canvas.height));
const lineEnd = { x: 700, y: 100 };
ctx.lineTo(lineEnd.x, toCanvasY(lineEnd.y, canvas.height));
ctx.lineWidth = 6;
ctx.stroke();

const point = { x: 400, y: 300 };
ctx.beginPath();
ctx.arc(point.x, toCanvasY(point.y, canvas.height), 15, 0, Math.PI * 2);
ctx.fill();

console.log("script loaded");
```

One value traced start to finish: `lineEnd = { x: 700, y: 100 }`. Its `y`
passes through `toCanvasY` (Lesson 2) to become `500`; `lineTo` (this
lesson) records it into the path opened by `beginPath`; `stroke` renders
it, using the position `moveTo` set as the line's other end. Every step
between "a math-space coordinate" and "a real black pixel on screen" is now
one this project has built, and proven, itself.

### What Breaks Without This

Removing the second `ctx.beginPath()` — the one before the `arc()` call —
and rerunning:

```js
ctx.lineWidth = 6;
ctx.beginPath();
ctx.moveTo(50, toCanvasY(100, canvas.height));
ctx.lineTo(700, toCanvasY(100, canvas.height));
ctx.stroke();

// no beginPath() here this time
const point = { x: 400, y: 300 };
ctx.arc(point.x, toCanvasY(point.y, canvas.height), 15, 0, Math.PI * 2);
ctx.fill();

console.log("line pixel after the fill():", Array.from(ctx.getImageData(400, 500, 1, 1).data));
```

Real output:

```
line pixel after the fill(): [ 0, 0, 0, 255 ]
```

In this particular case the pixel still comes out black — the line
happened to already be black and the fill's color is also black — which is
exactly what makes this bug dangerous: it can hide for a long time behind
a coincidence, and only surface as a visible glitch the day someone changes
`fillStyle` to something other than black.

Restoring the `beginPath()` call brings the project back to its correct,
committed state.

### Exercises

- Change `lineEnd.x` to `50` (same as `lineStart.x`) — by hand, predict
  what should render (a single point, since start and end coincide), then
  run it and check.
- Draw a second point at math-space `(100, 500)`, remembering both the
  `beginPath()` before it and the coordinate conversion.
- Set `ctx.fillStyle = "blue"` before the `fill()` call, rerun, and confirm
  in your browser that only the dot changes color, not the line (since
  `fillStyle` doesn't affect `stroke()`).

### Definition of Done

- [ ] `script.js` draws one stroked line and one filled point, both using
      `toCanvasY` for their y-coordinates
- [ ] You can state, without looking, what `beginPath()` actually resets
      and why skipping it doesn't produce an immediate error
- [ ] Opening `index.html` in a real browser shows both shapes in the
      expected positions
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Draw a stroked line and a filled point using the path API

  Covers beginPath/moveTo/lineTo/stroke for the line and arc/fill for the
  point. Verified with real pixel sampling, including a deliberate
  reproduction of the silent bug that skipping beginPath() causes."
  ```
