# Lesson 6: What to Draw, Separate From How

**What you will build:** the same line and point from earlier lessons, but
restructured so the *shapes themselves* live in one array of plain data
objects, and a single small function decides how to render whichever kind
of shape it's handed. The transferable problem: right now, `draw()` has
"line" and "point" logic physically welded together into one function body
— which does not scale. Every lesson from Arc 1 onward is going to add new
kinds of things to draw (vectors, transformed shapes, toolpaths). This
lesson builds the one small structural pattern — **data describing what
exists, separate from code describing how to render it** — that everything
later gets added onto, instead of `draw()` growing a new `if` branch
forever.

**What you need to know first:** Lesson 5 (Arc 0) — the existing `draw()`
function, `point`, `lineStart`/`lineEnd`, and `toCanvasY`, all of which get
restructured (not thrown away) in this lesson.

---

## Concept Unit: Representing a Shape as Data

### The Problem

`draw()`, as it stands, draws one specific line and one specific point by
calling canvas methods directly, inline, in a fixed sequence. There's
nowhere to *store* "a shape that should exist" separately from the code
that draws it — which means adding a third shape means copy-pasting more
imperative drawing code into `draw()`, and a fourth means doing it again.
The fix starts with a different question: what if a shape were just a
small piece of *data*, describing itself, that some separate code could
read later?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified — this and the next three
  units together restructure the file; each is shown as its own step)
- **Change type:** refactor
- **Location:** replaces the standalone `lineStart`/`lineEnd`/`point`
  variables
- **Dependencies:** none new

### The New Code

```js
const line = { type: "line", start: { x: 50, y: 100 }, end: { x: 700, y: 100 } };
const point = { type: "point", x: 400, y: 300 };
```

*(No "Updated Project" step yet — these two objects don't have a
permanent home in the file until the array in the next unit holds them.)*

### Isolating the Concept

```js
const shape = { type: "point", x: 10, y: 20 };
console.log("shape.type:", shape.type);
console.log("shape.x:", shape.x, "shape.y:", shape.y);
```

Real output:

```
shape.type: point
shape.x: 10 shape.y: 20
```

What this proves: `shape` carries both *what kind* of thing it is
(`type`) and the data specific to that kind (`x`, `y`) — readable back out
individually, without any drawing having happened at all. This is called a
**tagged data object** — `type` is the "tag" that says which kind of shape
this is, which is exactly the field a renderer will read later to decide
what to do with it.

### Discarding

Discarded — the standalone `shape` example above never appears in the
project; `line` and `point`, defined above, are the real versions.

### Mechanical Walkthrough

- **`{ type: "line", start: {...}, end: {...} }`** — (b) a concept
  reappearing: object literals were already used for `lineStart` and
  `lineEnd` back in Lesson 3. What's new is only the *shape* of this
  particular object: a `type` field alongside the geometric data, rather
  than just the geometric data alone.
- **`{ type: "point", x: 400, y: 300 }`** — (c) genuinely basic, given the
  above — the same pattern, applied a second time.

### CS Lens

Tagging a piece of data with a field naming its own kind, so code
elsewhere can branch on it, is a **discriminated union** (or "tagged
union") — worth naming clearly, since Arc 4.5's G-code parser will lean on
this same pattern heavily (a parsed move tagged `"G0"` vs. `"G1"` vs.
`"G2"`, for instance).

```
Also recognized in: JSON API responses with a "type" or "kind" field,
Redux actions (every action has a "type"), a compiler's AST nodes (each
tagged with what kind of syntax it represents), network protocol message
headers naming their own payload type
```

### SE Lens

The alternative not chosen: keep shapes as separate, untagged variables
(`lineStart`, `lineEnd`, `pointX`, `pointY`, as they existed until this
lesson) with no unifying structure. That works for exactly two shapes,
hardcoded by name. The real cost: it can't be looped over, stored in a
list, added to at runtime, or treated generically by any shared code — a
third shape means a fourth set of loose variables and a fourth hand-written
block of drawing calls, forever. Tagging shapes as uniform data objects is
what makes the next two units — an array, and a loop — possible at all.

### Run It

Real output already shown above.

### Connecting

Two shapes now exist as self-describing data — the next unit groups them
into one collection, instead of two independent variables.

---

## Concept Unit: An Array of Shapes — the Scene

### The Problem

`line` and `point` are still two entirely separate variables. Nothing
connects them as "the set of things currently on screen" — which means
there's still no single thing to loop over, and no way to add a third
shape without inventing a third independent variable name.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** replace (the two separate variables become one)
- **Location:** where `line` and `point` were just defined
- **Dependencies:** the previous unit

### The New Code

```js
const scene = [
  { type: "line", start: { x: 50, y: 100 }, end: { x: 700, y: 100 } },
  { type: "point", x: 400, y: 300 },
];
```

### The Updated Project

```js
const scene = [                                                          // ← new
  { type: "line", start: { x: 50, y: 100 }, end: { x: 700, y: 100 } },   // ← new
  { type: "point", x: 400, y: 300 },                                     // ← new
];                                                                        // ← new
```

Both shapes from the previous unit are now elements of one array, `scene`
— which is meant literally: this is the entire set of things that exist to
be drawn, all in one place.

### Isolating the Concept

```js
const numbers = [10, 20, 30];
console.log("numbers.length:", numbers.length);
console.log("numbers[0]:", numbers[0]);
console.log("numbers[2]:", numbers[2]);
```

Real output:

```
numbers.length: 3
numbers[0]: 10
numbers[2]: 30
```

What this proves: an array holds an ordered sequence of values, each
reachable by a numeric position starting at `0`, with its own `.length`
telling you how many there are — none of which needed a loop to
demonstrate. This is called an **array literal**. `scene`, built above,
is exactly this same structure — just holding shape objects instead of
plain numbers.

### Discarding

Discarded — `numbers` never appears in the project; `scene` is the real
version.

### Mechanical Walkthrough

- **`[ ..., ... ]`** — (a) first appearance. An array literal — an ordered
  list of values, here two shape objects, written directly.
- **The two object literals inside it** — (c) genuinely basic, given the
  previous unit — the same `line`/`point` shapes, just relocated into the
  array instead of standing alone.

### CS Lens

Not a new hard concept — arrays are the same idea covered generically as
soon as the next unit actually iterates one; no separate lens needed here.

### SE Lens

The alternative not chosen: two separate top-level variables, `line` and
`point`, left as they were after the previous unit. The real tradeoff:
separate variables mean any code that wants "everything currently drawn"
has to know, by name, every variable that currently exists — which breaks
the moment a new shape is added and that new code forgets to also handle
it. One array means "everything to draw" is just "the contents of
`scene`," automatically including anything ever pushed into it, with
nothing else to remember to update.

### Run It

Real output already shown above.

### Connecting

Both shapes are now one collection — the next unit is what actually walks
through it.

---

## Concept Unit: Iterating the Scene — `for...of`

### The Problem

Having `scene` as one array doesn't automatically process its contents —
something still has to visit each element in order and do something with
it. Every drawing loop in this project, from here forward, needs a way to
say "for each thing in this collection" without hardcoding how many things
there are.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** will replace the old inline line/point drawing calls
  inside `draw()`, once the next unit gives it something to call per
  shape; introduced here first, on its own
- **Dependencies:** `scene`, from the previous unit

### The New Code

```js
for (const shape of scene) {
  console.log(shape.type);
}
```

*(No "Updated Project" step yet — this loop's real body, calling a
renderer, doesn't exist until the next unit.)*

### Isolating the Concept

```js
const nums = [10, 20, 30];
for (const n of nums) {
  console.log("n =", n);
}
```

Real output:

```
n = 10
n = 20
n = 30
```

What this proves: the loop body ran three separate times — once per
array element, in order, with `n` bound to that element's own value each
time. This is called a **`for...of` loop** — it visits every element of an
array (or other iterable structure) in order, without ever needing to know
the array's length up front the way an index-counting loop would.

### Discarding

Discarded — `nums` never appears in the project.

### Mechanical Walkthrough

- **`for (const shape of scene) { ... }`** — (a) first appearance. Runs
  the loop body once per element of `scene`, binding `shape` to that
  element on each pass.
- **`const shape`** — (b) a concept reappearing: `const` was already fully
  explained in Lesson 2; what's new is only that here it's re-declared
  fresh on *every* pass through the loop, rather than once for the whole
  program.

### CS Lens

Visiting every element of a collection, one at a time, in order, without
manual index bookkeeping, is **iteration** — foundational enough to name
broadly.

```
Also recognized in: Python's for x in list, SQL's implicit row-by-row
cursor semantics, a stream processor consuming events one at a time, a
G-code interpreter reading one command line after another (exactly what
Arc 4.5 builds)
```

### SE Lens

The alternative not chosen: a traditional counting loop —
`for (let i = 0; i < scene.length; i++) { const shape = scene[i]; ... }`.
That works identically here, but carries real, well-known failure modes
(an off-by-one in the comparison, forgetting to increment `i`, accidentally
mutating `i` inside the loop body) that simply don't exist with
`for...of`, because there's no index to manage at all. The tradeoff: a
counting loop is still occasionally necessary later, whenever an index
value itself is genuinely needed (say, numbering toolpath segments) — but
for the common case of "do something to every element," `for...of` removes
an entire category of bug for free.

### Run It

Real output already shown above.

### Connecting

`scene` can now genuinely be walked through, one shape at a time — the
final unit gives each visit something real to do.

---

## Concept Unit: Dispatching by `type` — the Renderer

### The Problem

The loop from the previous unit can visit every shape, but doesn't yet
know what a `"line"` looks like versus what a `"point"` looks like — that
decision, and the actual canvas calls for each, need to live somewhere.
This is where the tagged `type` field from the first unit finally gets
read, not just stored.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add (a new function), replace (`draw()`'s body)
- **Location:** `renderShape` defined near `scene`; `draw()`'s old inline
  line/point drawing calls replaced with a loop calling it
- **Dependencies:** every previous unit in this lesson

### The New Code

```js
function renderShape(shape) {
  if (shape.type === "line") {
    ctx.beginPath();
    ctx.moveTo(shape.start.x, toCanvasY(shape.start.y, canvas.height));
    ctx.lineTo(shape.end.x, toCanvasY(shape.end.y, canvas.height));
    ctx.lineWidth = 6;
    ctx.stroke();
  } else if (shape.type === "point") {
    ctx.beginPath();
    ctx.arc(shape.x, toCanvasY(shape.y, canvas.height), 15, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### The Updated Project

`script.js`, in full, at the end of this lesson:

```js
const canvas = document.querySelector("#viewport");
const ctx = canvas.getContext("2d");

function toCanvasY(mathY, canvasHeight) {
  return canvasHeight - mathY;
}

function toMathY(canvasY, canvasHeight) {
  return canvasHeight - canvasY;
}

const scene = [
  { type: "line", start: { x: 50, y: 100 }, end: { x: 700, y: 100 } },
  { type: "point", x: 400, y: 300 },
];

function renderShape(shape) {                                                    // ← new
  if (shape.type === "line") {                                                   // ← new
    ctx.beginPath();                                                             // ← new
    ctx.moveTo(shape.start.x, toCanvasY(shape.start.y, canvas.height));          // ← new
    ctx.lineTo(shape.end.x, toCanvasY(shape.end.y, canvas.height));              // ← new
    ctx.lineWidth = 6;                                                           // ← new
    ctx.stroke();                                                                // ← new
  } else if (shape.type === "point") {                                          // ← new
    ctx.beginPath();                                                             // ← new
    ctx.arc(shape.x, toCanvasY(shape.y, canvas.height), 15, 0, Math.PI * 2);     // ← new
    ctx.fill();                                                                  // ← new
  }                                                                               // ← new
}                                                                                 // ← new

function draw(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const shape of scene) {        // ← new (replaces the old inline drawing calls)
    renderShape(shape);                // ← new
  }                                     // ← new

  scene[1].x += 2;                     // ← new (was: point.x += 2)
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const canvasX = event.clientX - rect.left;
  const canvasY = event.clientY - rect.top;

  const mathX = canvasX;
  const mathY = toMathY(canvasY, canvas.height);

  console.log("mouse at math coords:", mathX, mathY);
}

canvas.addEventListener("mousemove", handleMouseMove);

console.log("script loaded");
```

`draw()` no longer contains a single hardcoded call to draw a line or a
point — it clears the canvas, then hands every shape in `scene`, one at a
time, to `renderShape`, which is the only place that knows what a
`"line"` or a `"point"` actually looks like on screen. `scene[1].x += 2`
still moves the point shape each frame — `scene[1]` is the point object,
by its position in the array.

### Isolating the Concept

```js
const scene = [
  { type: "line", start: { x: 50, y: 100 }, end: { x: 700, y: 100 } },
  { type: "point", x: 400, y: 300 },
];

function renderShape(shape) {
  if (shape.type === "line") {
    ctx.beginPath();
    ctx.moveTo(shape.start.x, toCanvasY(shape.start.y, canvas.height));
    ctx.lineTo(shape.end.x, toCanvasY(shape.end.y, canvas.height));
    ctx.lineWidth = 6;
    ctx.stroke();
  } else if (shape.type === "point") {
    ctx.beginPath();
    ctx.arc(shape.x, toCanvasY(shape.y, canvas.height), 15, 0, Math.PI * 2);
    ctx.fill();
  } else {
    console.log("unknown shape type:", shape.type);
  }
}

for (const shape of scene) {
  renderShape(shape);
}

console.log("line pixel (400,500):", Array.from(ctx.getImageData(400, 500, 1, 1).data));
console.log("point pixel (400,300):", Array.from(ctx.getImageData(400, 300, 1, 1).data));
```

Real output:

```
line pixel (400,500): [ 0, 0, 0, 255 ]
point pixel (400,300): [ 0, 0, 0, 255 ]
```

What this proves: driving both shapes through one loop and one dispatch
function produces pixel-identical results to the hand-written, one-off
drawing code from earlier lessons — the restructuring changed *how* the
code is organized, not what actually renders.

The real, silent failure this pattern can still have — a typo in a
shape's `type` field:

```js
const sceneWithTypo = [
  { type: "line", start: { x: 50, y: 100 }, end: { x: 700, y: 100 } },
  { typo: "point", x: 400, y: 300 },   // "typo" instead of "type"
];

for (const shape of sceneWithTypo) {
  renderShape(shape);
}
console.log("point pixel, shape had a typo'd field:", Array.from(ctx.getImageData(400, 300, 1, 1).data));
```

Real output:

```
point pixel, shape had a typo'd field: [ 0, 0, 0, 0 ]
```

What this proves: a shape whose `type` field is misspelled matches neither
`if` branch, and `renderShape` — as written here, with no trailing `else`
— simply does nothing, silently. No error, no warning: the shape just
never appears. This is worth knowing now, deliberately, rather than
discovering it by staring at a missing shape later wondering why.

### Discarding

Both scratch scenes above are discarded — the real, permanent `scene` is
the one shown in "The Updated Project."

### Mechanical Walkthrough

- **`function renderShape(shape) { ... }`** — (b) a concept reappearing:
  an ordinary function declaration, same shape as `toCanvasY`.
- **`if (shape.type === "line") { ... } else if (shape.type === "point") { ... }`**
  — (a) first appearance of `if`/`else if` as a *dispatch* mechanism —
  reading a tagged object's own `type` field to decide which code path
  runs, rather than using `if` to check a simple boolean condition.
  `===` itself is (a) first appearance: strict equality, checking that
  both the value and its type match exactly (as opposed to `==`, which
  performs type coercion first) — the safer default for comparing strings
  like this.
- **The bodies of each branch** — (b) concepts reappearing: identical
  drawing calls to the ones already fully explained in Lesson 3, just
  relocated inside the matching branch.

### CS Lens

Branching on a tagged field to decide behavior is called **dynamic
dispatch by tag** — a lightweight, manual version of a broader idea.

```
Also recognized in: a compiler's "visit" logic switching on AST node
type, a game engine choosing update logic per entity type, a JSON
message router branching on a "type" field, virtual method dispatch in
object-oriented languages (a more automatic version of this same idea)
```

### SE Lens

The alternative not chosen: keep `draw()` calling hardcoded, shape-specific
drawing code directly, as it did before this lesson. The real tradeoff, now
made concrete: with the old structure, adding a third kind of shape meant
editing `draw()` itself, mixing new drawing logic into the same function
responsible for clearing the canvas and scheduling the next frame. With
`renderShape` as a separate function, `draw()` never needs to change again
to support a new shape kind — only `renderShape` gains a new `else if`
branch, and `scene` gains new tagged objects. The debt this project is
knowingly carrying: the silent "no matching branch" failure demonstrated
above. A `switch` statement with no `default` case has the identical
problem — naming it here means it can be watched for deliberately as more
shape types get added in Arc 1 and beyond, rather than rediscovered as a
confusing bug.

### Commands Needed

None new.

### Run It

Real output already shown above.

### Connecting

The project's entire visible output is now driven by one array of tagged
data and one small function that knows how to render each tag — this is
the shape (data-driven scene, dispatch-by-type renderer) that every future
lesson in this curriculum adds to, rather than restructures again.

---

## Closing

### Connect the Pieces

One value traced through the whole lesson: the point shape,
`{ type: "point", x: 400, y: 300 }`. It starts as a tagged object (Unit 1),
becomes `scene[1]` once placed in the array (Unit 2), gets visited by the
`for...of` loop (Unit 3) on every single animation frame, and is handed to
`renderShape` (Unit 4), which reads its `type` field and calls `arc`/`fill`
— the exact same two calls Lesson 3 first proved with raw pixel data,
now reached through four extra layers of structure that make room for
everything still to come.

### What Breaks Without This

Reproducing the typo bug from Unit 4's isolation step, but against the
*real* project's `renderShape` and a scene with the point's `type`
misspelled:

```js
console.log(scene[1]);          // the real point shape, unmodified
scene[1].type = "pointt";       // simulate a typo introduced by editing
draw(0);                        // run one real frame
console.log("point pixel after the typo:", Array.from(ctx.getImageData(400, 300, 1, 1).data));
```

The point silently stops rendering — exactly as shown in Unit 4 — with
nothing in the console pointing at the cause. Fixing the spelling back to
`"point"` restores it immediately; there's no other state to repair.

### Exercises

- Add a third shape to `scene`: a second point, anywhere on the canvas,
  that does not move. Confirm both points render.
- Add an `else` branch (not `else if`) to `renderShape` that
  `console.log`s a warning whenever a shape's `type` matches neither
  `"line"` nor `"point"` — turning this lesson's silent failure into a
  visible one for every shape kind that exists so far.
- `scene[1].x += 2` reaches into the array by its numeric position to find
  the point. Rewrite `draw()` so it instead uses `for...of` to find the
  shape whose `type` is `"point"` and updates that one directly, without
  relying on it always being at index `1`.

### Definition of Done

- [ ] `scene` is an array of tagged shape objects; no shape-specific
      drawing code remains directly inside `draw()`
- [ ] `renderShape(shape)` dispatches on `shape.type` and reproduces both
      the line and the point exactly as before this lesson
- [ ] The animation still moves visibly in a real browser, with no visual
      change from before this refactor
- [ ] You can explain, without looking, what happens if a shape's `type`
      field is misspelled, and why nothing errors when it is
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Restructure drawing around a scene array and a type-dispatching renderer

  Shapes are now tagged data objects in one scene array, walked with
  for...of and rendered by a single renderShape function that switches on
  shape.type. Verified pixel-identical output to the prior hardcoded
  version, plus the silent failure mode of a misspelled type field."
  ```

This closes Arc 0. Every lesson from Arc 1 forward adds new shape types,
new math, and new rendering logic onto exactly this structure — the canvas,
the coordinate conversions, the animation loop, and the data-driven scene
built across these six lessons.
