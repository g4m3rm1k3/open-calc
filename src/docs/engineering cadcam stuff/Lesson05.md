# Lesson 5: Three Coordinate Systems, One Mouse Click

**What you will build:** code that listens for mouse movement over the
canvas and converts the raw position the browser reports into the
math-space coordinates this project actually reasons in. The transferable
problem: a single mouse position passes through **three different
coordinate systems** before it means anything to this project — the page's
own coordinates, the canvas's internal pixel coordinates, and math space —
and each conversion in that chain is a real, separate step, not one
automatic translation.

**What you need to know first:** Lesson 2 (Arc 0) — `canvas`, `ctx`, and
`toCanvasY`, which this lesson writes the inverse of.

> This lesson's event-handling code is verified using `jsdom`'s real,
> dispatchable `MouseEvent` and `addEventListener` implementations. One
> piece — `getBoundingClientRect()` — has no real value in `jsdom`, since
> `jsdom` has no actual layout engine to measure where an element sits on
> a page; that's called out explicitly where it matters, with a realistic
> simulated value used to prove the surrounding math, rather than silently
> passing off `jsdom`'s always-zero default as if it were real.

---

## Concept Unit: `addEventListener()` — Listening for Events

### The Problem

Right now, nothing in this project reacts to anything the user does — the
point animates on its own, oblivious to the mouse. Before any position can
be read, the browser needs to be told, explicitly, which events on which
element this code cares about.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after the existing `draw`/`requestAnimationFrame` code
- **Dependencies:** `canvas`, from Lesson 2; callbacks, from Lesson 4

### The New Code

```js
canvas.addEventListener("mousemove", handleMouseMove);
```

*(No "Updated Project" step yet — `handleMouseMove` doesn't exist until the
next unit defines it; this line is shown fully in context once that
exists.)*

### Isolating the Concept

```js
function handler() {
  console.log("mousemove fired");
}
canvas.addEventListener("mousemove", handler);

const evt = new MouseEvent("mousemove", { clientX: 150, clientY: 220 });
canvas.dispatchEvent(evt);
```

Real output:

```
mousemove fired
```

What this proves: `handler` really was invoked — but only *after*
`dispatchEvent` actually fired a `mousemove` event, not the moment
`addEventListener` was called. This is called **registering an event
listener** — `addEventListener` doesn't run anything itself; it tells the
browser "when this kind of event happens on this element, call this
function" and then returns immediately, exactly like `requestAnimationFrame`
from Lesson 4 didn't run `draw` immediately either.

### Discarding

Discarded — `handler` is a stand-in; the real project defines
`handleMouseMove` with actual behavior in the next unit.

### Mechanical Walkthrough

- **`canvas.addEventListener(...)`** — (a) first appearance. Registers a
  callback to run whenever the named event occurs on `canvas`.
- **`"mousemove"`** — (a) first appearance, as a specific event name — the
  string the browser uses internally to categorize what just happened;
  other event names (`"click"`, `"mousedown"`) will appear later in this
  curriculum the same way.
- **`handleMouseMove`** — (b) a concept reappearing: passed with no
  parentheses, exactly the callback-by-reference pattern proven in Lesson
  4.

### CS Lens

Reacting to named events rather than polling for changes is the
**observer / publish-subscribe pattern** — genuinely worth naming broadly.

```
Also recognized in: a UI framework's onClick handlers, a message queue's
subscribers, a filesystem watcher reacting to file-change events, a
stock-trading system's price-alert callbacks
```

### SE Lens

The alternative not chosen: check the mouse position inside the existing
`draw` loop, every frame, by polling some globally-updated variable. The
real tradeoff: polling means position data is only ever as fresh as the
last animation frame, and couples input handling to the animation loop's
own lifecycle — if `draw` ever stops running, so does all mouse tracking.
Event listeners decouple the two entirely: input handling keeps working
regardless of what the render loop is doing.

### Run It

Real output already shown above.

### Connecting

The browser now knows to call something on every mouse move — the next
unit defines what that something actually receives.

---

## Concept Unit: The Event Object — `clientX` / `clientY`

### The Problem

A callback registered for `"mousemove"` needs to know *where* the mouse
actually is — that information has to arrive as data passed into the
callback, the same way `requestAnimationFrame`'s callback automatically
received a timestamp in Lesson 4.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** defines `handleMouseMove`, referenced by the previous
  unit's `addEventListener` call
- **Dependencies:** the previous unit

### The New Code

```js
function handleMouseMove(event) {
  console.log(event.clientX, event.clientY);
}
```

### The Updated Project

```js
function handleMouseMove(event) {          // ← new
  console.log(event.clientX, event.clientY); // ← new
}                                            // ← new

canvas.addEventListener("mousemove", handleMouseMove);
```

### Isolating the Concept

```js
function handler(event) {
  console.log("clientX=" + event.clientX + ", clientY=" + event.clientY);
}
canvas.addEventListener("mousemove", handler);

const evt = new MouseEvent("mousemove", { clientX: 150, clientY: 220 });
canvas.dispatchEvent(evt);
```

Real output:

```
clientX=150, clientY=220
```

What this proves: `handler` never computed these numbers itself — they
arrived, automatically, as properties on the argument the browser passed
in. This is called the **event object** — every event listener receives
one, carrying data specific to what happened; `clientX`/`clientY` specifically
report the mouse's position measured from the top-left corner of the
entire browser viewport (the visible page area), not from the canvas.
That distinction is exactly the problem the next unit solves.

### Discarding

Discarded — the real version is `handleMouseMove`, already shown above.

### Mechanical Walkthrough

- **`function handleMouseMove(event) { ... }`** — (b) a concept
  reappearing: another function declaration receiving an automatically-
  supplied parameter, the same shape `draw(timestamp)` had in Lesson 4.
- **`event.clientX` / `event.clientY`** — (a) first appearance. Properties
  on the event object reporting the cursor's horizontal and vertical
  position, in pixels, relative to the browser viewport's own top-left
  corner.

### CS Lens

Not a new hard concept — this is the event object filling in the
callback-parameter shape Lesson 4 already established for
`requestAnimationFrame`'s timestamp.

### SE Lens

Not applicable — no design alternative here; `clientX`/`clientY` are what
the browser provides, not a choice this project makes.

### Run It

Real output already shown above.

### Connecting

A real mouse position now reaches this code — but it's measured from the
wrong corner for this project's purposes, which the next unit fixes.

---

## Concept Unit: `getBoundingClientRect()` — Page Coordinates vs. Canvas Coordinates

### The Problem

`event.clientX`/`clientY` are measured from the browser viewport's corner —
but the canvas might not start at the viewport's corner at all; it could
sit anywhere on the page, below a heading, indented by a margin, scrolled
partway down. A mouse position of `(150, 220)` in viewport terms could
correspond to a completely different position *within* the canvas,
depending on where the canvas happens to be sitting.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** inside `handleMouseMove`
- **Dependencies:** `event.clientX`/`clientY`, from the previous unit

### The New Code

```js
const rect = canvas.getBoundingClientRect();
const canvasX = event.clientX - rect.left;
const canvasY = event.clientY - rect.top;
```

### The Updated Project

```js
function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();       // ← new
  const canvasX = event.clientX - rect.left;          // ← new
  const canvasY = event.clientY - rect.top;           // ← new
  console.log(canvasX, canvasY);
}

canvas.addEventListener("mousemove", handleMouseMove);
```

### Isolating the Concept

`jsdom` has no real layout engine, so `getBoundingClientRect()` always
reports every value as `0` in this sandbox — that's `jsdom`'s own honest
limitation, not this project's. To prove the *math* genuinely works, here
it is with a realistic simulated rectangle standing in for what a real
browser would measure (a canvas sitting 20px from the page's left edge and
50px down from its top, which is an entirely ordinary position for an
element that isn't the very first thing on the page):

```js
console.log("jsdom's real default (no layout engine):", JSON.stringify(canvas.getBoundingClientRect()));

canvas.getBoundingClientRect = () => ({ left: 20, top: 50, right: 820, bottom: 650, width: 800, height: 600 });
const rect = canvas.getBoundingClientRect();

const clientX = 150, clientY = 220;
const canvasX = clientX - rect.left;
const canvasY = clientY - rect.top;
console.log("simulated rect:", JSON.stringify(rect));
console.log("page coords (" + clientX + "," + clientY + ") -> canvas coords (" + canvasX + "," + canvasY + ")");
```

Real output:

```
jsdom's real default (no layout engine): {"x":0,"y":0,"bottom":0,"height":0,"left":0,"right":0,"top":0,"width":0}
simulated rect: {"left":20,"top":50,"right":820,"bottom":650,"width":800,"height":600}
page coords (150,220) -> canvas coords (130,170)
```

What this proves: the same raw mouse position, `(150, 220)`, becomes a
*different* number, `(130, 170)`, once the canvas's own offset on the page
is subtracted out. This is called finding the canvas's **bounding
rectangle** — its actual position and size on the current page, which can
change any time the page is scrolled or resized, which is exactly why this
gets computed fresh on every mouse move rather than measured once and
reused.

### Discarding

Discarded — the simulated rectangle above never appears in the project;
the real code calls the browser's genuine `getBoundingClientRect()`, which
this sandbox simply can't produce a non-zero value for.

### Mechanical Walkthrough

- **`canvas.getBoundingClientRect()`** — (a) first appearance. Returns an
  object describing exactly where the element currently sits on the page,
  measured the same way `clientX`/`clientY` are — from the viewport's
  corner.
- **`rect.left` / `rect.top`** — (a) first appearance, as specific
  properties: the rectangle's own position, which gets subtracted from the
  raw mouse position to find where within the canvas itself the mouse
  actually is.
- **`event.clientX - rect.left`** — (c) genuinely basic — ordinary
  subtraction, same operator already used in `toCanvasY`.

### CS Lens

Subtracting one coordinate system's origin offset from another to express
a position relative to a *different* frame of reference is the same
change-of-basis idea Lesson 2 named for `toCanvasY` — reapplied here to a
second, unrelated pair of coordinate systems (page vs. element, rather
than math vs. canvas).

### SE Lens

The alternative not chosen: assume the canvas always sits at the page's
very top-left corner, `(0, 0)`, and use `event.clientX`/`clientY` directly
with no offset subtracted. That happens to work only for the specific,
fragile case of a canvas with nothing above or to the left of it on the
entire page — which stops being true the moment a single heading, nav bar,
or margin gets added anywhere before it, later in this curriculum.
Computing the real rectangle costs one method call and works regardless of
page layout.

### Run It

Real output already shown above.

### Connecting

The mouse position is now correctly expressed in canvas-space pixels — the
final unit converts that into the same math-space coordinates the rest of
this project already reasons in.

---

## Concept Unit: `toMathY()` — Converting Canvas Space Back to Math Space

### The Problem

Lesson 2 built `toCanvasY`, converting math-space `y` into canvas-space `y`
for *drawing*. Mouse input needs the exact opposite direction: a real
canvas-space `y` (from the previous unit) converted back into math-space
`y`, so the rest of the project — which thinks entirely in math space — can
compare a mouse position against, say, a toolpath point computed in Arc 1.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** alongside `toCanvasY`, near the top of the file
- **Dependencies:** `toCanvasY`, from Lesson 2, as the transform being
  inverted

### The New Code

```js
function toMathY(canvasY, canvasHeight) {
  return canvasHeight - canvasY;
}
```

### The Updated Project

```js
function toCanvasY(mathY, canvasHeight) {
  return canvasHeight - mathY;
}

function toMathY(canvasY, canvasHeight) {   // ← new
  return canvasHeight - canvasY;            // ← new
}                                            // ← new
```

`handleMouseMove`, in full, now that every piece exists:

```js
function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const canvasX = event.clientX - rect.left;
  const canvasY = event.clientY - rect.top;

  const mathX = canvasX;
  const mathY = toMathY(canvasY, canvas.height);

  console.log("mouse at math coords:", mathX, mathY);
}

canvas.addEventListener("mousemove", handleMouseMove);
```

### Isolating the Concept

By hand first: if `toCanvasY(mathY, height) = height - mathY`, then
undoing it means solving that same equation for `mathY` — which, since
it's already `height` minus something, is its own inverse:

```
canvasY = height - mathY
mathY   = height - canvasY     (rearranged — same formula, swapped roles)
```

Proven as a real round trip, not just algebra on paper:

```js
function toCanvasY(mathY, canvasHeight) { return canvasHeight - mathY; }
function toMathY(canvasY, canvasHeight) { return canvasHeight - canvasY; }

const originalMathY = 300;
const canvasHeight = 600;
const flipped = toCanvasY(originalMathY, canvasHeight);
const roundTrip = toMathY(flipped, canvasHeight);
console.log("original mathY:", originalMathY);
console.log("toCanvasY ->", flipped);
console.log("toMathY(that) ->", roundTrip);
console.log("round trip matches original:", roundTrip === originalMathY);
```

Real output:

```
original mathY: 300
toCanvasY -> 300
toMathY(that) -> 300
round trip matches original: true
```

*(`300` converts to itself here because it's exactly half of `600` — the
canvas's own vertical center is a fixed point of this particular flip.
The exercises below have you check a non-center value, where the two
numbers genuinely differ.)*

What this proves: converting to canvas space and back with `toMathY`
returns the exact original value — confirming `toMathY` really is the
mathematical inverse of `toCanvasY`, not just a similarly-named function
that happens to look right.

The full mouse-to-math chain, traced end to end with real numbers:

```js
const rect = { left: 20, top: 50 };
const mouseEvent = { clientX: 150, clientY: 220 };
const canvasX = mouseEvent.clientX - rect.left;
const canvasY = mouseEvent.clientY - rect.top;
const mathX = canvasX;
const mathY = toMathY(canvasY, canvasHeight);
console.log("mouse client (" + mouseEvent.clientX + "," + mouseEvent.clientY + ") -> canvas (" + canvasX + "," + canvasY + ") -> math (" + mathX + "," + mathY + ")");
```

Real output:

```
mouse client (150,220) -> canvas (130,170) -> math (130,430)
```

### Discarding

Discarded — the standalone round-trip check never appears in the project;
`toMathY` itself, and its use inside `handleMouseMove`, are the real code.

### Mechanical Walkthrough

- **`function toMathY(canvasY, canvasHeight) { ... }`** — (b) a concept
  reappearing: identical shape to `toCanvasY` from Lesson 2 — same
  reasoning applies, not re-explained in full here per the Repetition
  Rule.
- **`return canvasHeight - canvasY;`** — (c) genuinely basic — the same
  subtraction operator already established.

### CS Lens

A function whose formula is its own inverse (`f(f(x)) = x`) is called an
**involution** — worth naming since it recurs constantly in geometry work
ahead.

```
Also recognized in: negation (-(-x) = x), a bitwise NOT operation applied
twice, reflecting a point across a line twice, XOR-based swap algorithms
```

### SE Lens

The alternative not chosen: skip a named `toMathY` function, and let mouse-
handling code work directly in canvas-space instead. The real cost: this
project's actual geometry (points, toolpaths, transforms, all of Arc 1 and
Arc 2 ahead) is defined entirely in math space. Mixing canvas-space mouse
coordinates into that code means every comparison — "is the mouse near this
toolpath point?" — would need its own ad hoc conversion, scattered wherever
mouse input meets geometry, instead of converting once, at the boundary,
right after the mouse position is read.

### Commands Needed

None new.

### Run It

Real output already shown above.

### Connecting

A raw mouse event is now a real math-space point, ready to be compared
against anything Arc 1's vector math produces — closing the loop this
lesson opened.

---

## Closing

### Connect the Pieces

One value traced through all four units: a mouse event reporting
`clientX=150, clientY=220`. `addEventListener` (Unit 1) is what makes
`handleMouseMove` (Unit 2) run at all, receiving that event object as its
`clientX`/`clientY`. `getBoundingClientRect` (Unit 3) subtracts the
canvas's own page position, turning it into canvas-space `(130, 170)`.
`toMathY` (Unit 4) flips its `y` one final time, arriving at math-space
`(130, 430)` — the coordinate system every future lesson's geometry code
will actually be written in.

### What Breaks Without This

Skipping the `getBoundingClientRect` subtraction — using
`event.clientX`/`clientY` directly as if they were already canvas-relative:

```js
const wrongCanvasX = mouseEvent.clientX;         // no rect.left subtracted
const wrongCanvasY = mouseEvent.clientY;         // no rect.top subtracted
const wrongMathY = toMathY(wrongCanvasY, canvasHeight);
console.log("WITHOUT rect offset -> math (" + wrongCanvasX + "," + wrongMathY + ")");
console.log("WITH rect offset    -> math (130,430)  [from the real chain above]");
```

Real output:

```
WITHOUT rect offset -> math (150,380)
WITH rect offset    -> math (130,430)
```

Both run without error — nothing crashes — but they disagree, by exactly
the canvas's own offset on the page (20px horizontally, 50px vertically).
This is a page-layout-dependent bug: it can go completely unnoticed while
testing with the canvas positioned at the page's top-left corner, and only
appear once something is added above or beside it.

### Exercises

- By hand, convert canvas-space `(400, 100)` to math space for a
  `canvas.height` of `600`, then confirm your answer by calling `toMathY`.
- Trigger a real `mousemove` in your browser and log all three coordinate
  systems side by side — `clientX/clientY`, the canvas-relative values,
  and the final math-space values — to see all three numbers for the
  exact same physical mouse position at once.
- `toCanvasY` and `toMathY` currently have identical bodies. Explain, in
  one sentence, why they still deserve to exist as two separately-named
  functions rather than being collapsed into one.

### Definition of Done

- [ ] `script.js` defines `toMathY`, and `handleMouseMove` converts a raw
      mouse event through `getBoundingClientRect` and `toMathY` into math
      space
- [ ] `canvas.addEventListener("mousemove", handleMouseMove)` is
      registered
- [ ] Moving the mouse over the canvas in a real browser logs sensible
      math-space coordinates (0 near the bottom-left of the canvas, larger
      values moving up and right)
- [ ] You can explain, without looking, why `event.clientX`/`clientY`
      alone aren't enough to know where the mouse is *within* the canvas
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Convert mouse position through page, canvas, and math coordinate spaces

  handleMouseMove reads event.clientX/clientY, subtracts the canvas's own
  page offset via getBoundingClientRect, then converts to math space with
  the new toMathY (the verified inverse of Lesson 2's toCanvasY)."
  ```
