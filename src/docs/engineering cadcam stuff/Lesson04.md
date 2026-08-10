# Lesson 4: A Picture That Keeps Being Redrawn

**What you will build:** a point that moves across the canvas over time —
not by animating one drawing, but by clearing the canvas and redrawing it
from scratch, tens of times a second, at a slightly different position each
time. The transferable problem: **there is no such thing as canvas
animation** — only a still picture, erased and redrawn fast enough that a
human eye perceives motion. Every motion-profile and toolpath-simulation
lesson later in this curriculum is built on exactly this loop.

**What you need to know first:** Lesson 3 (Arc 0) — `beginPath`, `arc`, and
`fill`, used again here to draw the moving point each frame.

> Verification for this lesson uses `jsdom` with its `pretendToBeVisual`
> option enabled, which gives it a real, working `requestAnimationFrame`
> implementation — not a mock. Timestamps and frame timing shown below are
> genuine values from this session, not invented ones.

---

## Concept Unit: `clearRect()` — Erasing Before Redrawing

### The Problem

If a moving point is drawn at position 50, then later redrawn at position
70 without first erasing position 50, both dots stay on screen — the
"movement" would actually look like a trail of dots being added, never
removed. Before redrawing anything, the previous frame's pixels need to be
erased.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** will be used inside the frame function built later in this
  lesson; introduced here on its own first
- **Dependencies:** `canvas`, `ctx`, from Lesson 2

### The New Code

```js
ctx.clearRect(0, 0, canvas.width, canvas.height);
```

*(No "Updated Project" step yet — this line doesn't have a permanent home
in the file until the frame function exists, later in this lesson. It's
taught here in isolation first because it's the first of several pieces
that function needs.)*

### Isolating the Concept

```js
ctx.fillStyle = "black";
ctx.fillRect(100, 100, 50, 50);
console.log("before clear:", Array.from(ctx.getImageData(120, 120, 1, 1).data));

ctx.clearRect(0, 0, canvas.width, canvas.height);
console.log("after clearRect (full canvas):", Array.from(ctx.getImageData(120, 120, 1, 1).data));
```

Real output:

```
before clear: [ 0, 0, 0, 255 ]
after clearRect (full canvas): [ 0, 0, 0, 0 ]
```

What this proves: a solid black square really did exist at that pixel
before the call, and is fully transparent — genuinely erased, not just
covered — after it. This is called **clearing a rectangular region** —
unlike `fillRect`, which paints a region a color, `clearRect` resets a
region back to fully transparent, regardless of what was there.

### Discarding

Discarded — this exact black square never appears in the real project;
only the `clearRect` call itself carries forward.

### Mechanical Walkthrough

- **`ctx.clearRect(x, y, width, height)`** — (a) first appearance. Erases
  every pixel in the given rectangle back to fully transparent.
- **`0, 0, canvas.width, canvas.height`** — (b) a concept reappearing:
  `canvas.width`/`canvas.height` were already read once, in Lesson 2's
  isolation step, to confirm the canvas's real pixel dimensions — here
  they're reused as arguments, to make sure the *entire* canvas gets
  cleared, corner to corner, not just some fixed region that might not
  match its actual size.

### CS Lens

Not a hard concept on its own — this is a straightforward erase operation;
no broader lens needed.

### SE Lens

The alternative not chosen: redraw a solid background-colored rectangle
over the whole canvas instead of using `clearRect`. That works visually if
the background is a flat, known color, but it stops working the moment
this project draws over a background image or a gradient later — painting
over it with a flat rectangle would erase *that* too. `clearRect` resets to
transparency regardless of what the background actually is, which is the
more general, future-proof choice for one extra method name to remember.

### Run It

Real output already shown above.

### Connecting

Erasing alone doesn't animate anything — the next two units cover how to
get this call, and a redraw, to actually run repeatedly over time.

---

## Concept Unit: Passing a Function as a Value

### The Problem

Every function called so far in this project has been called immediately,
the moment its line executes. Animation needs something different: a
function whose *code* gets handed to something else now, to be run *later*,
possibly many times, by that something else — not by this code directly.
JavaScript needs a way to refer to a function without running it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none yet — this is a language concept, demonstrated
  before it's used for real in the next unit.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** none

### Isolating the Concept

```js
function callTwice(fn) {
  fn();
  fn();
}

function sayHello() {
  console.log("hello");
}

console.log("calling callTwice, passing sayHello WITHOUT parens:");
callTwice(sayHello);
```

Real output:

```
calling callTwice, passing sayHello WITHOUT parens:
hello
hello
```

What this proves: writing `sayHello` with **no parentheses** passes the
function itself — as a value, the same way a number or a string gets
passed — into `callTwice`, which then decides when (and how many times) to
actually run it, using the parentheses itself, inside its own body. This is
called a **callback** — a function passed into another function to be
invoked later, by that other function, rather than by the code that passed
it.

The easy mistake, and what it actually does:

```js
console.log("calling callTwice, passing sayHello() WITH parens (a common mistake):");
try {
  callTwice(sayHello());
} catch (e) {
  console.log("threw:", e.constructor.name + ":", e.message);
}
```

Real output:

```
calling callTwice, passing sayHello() WITH parens (a common mistake):
hello
threw: TypeError: fn is not a function
```

What this proves: `sayHello()`, *with* parentheses, runs immediately —
right there, as the argument is being evaluated, which is why `"hello"`
printed before `callTwice` even started — and passes its return value
(`undefined`, since `sayHello` returns nothing) into `callTwice` instead of
the function itself. `callTwice` then tries to call `undefined` as if it
were a function, and the environment refuses, with a real, genuine error.
This exact mistake — an extra pair of parentheses — is one of the most
common bugs in callback-based code, and now it's been seen, deliberately,
with its real error message, rather than discovered by accident later.

### Discarding

Both examples above are discarded — `callTwice` and `sayHello` never
appear in the real project; only the underlying no-parentheses pattern
carries forward.

### CS Lens

Treating functions as ordinary values — able to be passed as arguments,
stored in variables, returned from other functions — is called **first-
class functions**, a genuinely load-bearing idea for the rest of this
curriculum.

```
Also recognized in: every event listener ever attached in a browser,
Python's functions-as-objects (the same idea, different language), a
sort() call taking a custom comparison function, React components
themselves being ordinary JavaScript functions
```

### SE Lens

Not applicable in the usual "alternative implementation" sense — this is a
language capability, not a design decision made within this project. The
real cost worth naming instead: the parentheses mistake above is silent
and easy in exactly the way earlier bugs in this curriculum have been
silent — it produces a genuine error message this time, which is actually
the *better* failure mode compared to, say, the missing-`beginPath()` bug
from Lesson 3, which produced no error at all.

### Run It

Real output already shown above.

### Connecting

With callbacks understood, the next unit hands one to the actual browser
API that repeatedly redraws the screen.

---

## Concept Unit: `requestAnimationFrame()` — Scheduling a Redraw

### The Problem

A callback needs *something* to call it repeatedly, at a sensible rate —
not a naive loop running as fast as possible (which would burn CPU for no
visual benefit) and not a fixed `setTimeout` guess. Browsers provide a
built-in scheduler tuned to the screen's own actual refresh rate.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after the point-drawing code from Lesson 3
- **Dependencies:** callbacks (previous unit), `clearRect` (first unit of
  this lesson)

### The New Code

```js
function draw(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(point.x, toCanvasY(point.y, canvas.height), 15, 0, Math.PI * 2);
  ctx.fill();
}

requestAnimationFrame(draw);
```

### The Updated Project

```js
const point = { x: 400, y: 300 };

function draw(timestamp) {                                                   // ← new
  ctx.clearRect(0, 0, canvas.width, canvas.height);                          // ← new
  ctx.beginPath();                                                           // ← new
  ctx.arc(point.x, toCanvasY(point.y, canvas.height), 15, 0, Math.PI * 2);   // ← new
  ctx.fill();                                                                // ← new
}                                                                             // ← new

requestAnimationFrame(draw);                                                 // ← new
```

Lesson 3's one-shot point-drawing code has moved inside a named function,
`draw`, preceded by the clear this lesson's first unit introduced. Passed
by name — no parentheses, per the previous unit — to
`requestAnimationFrame`, which the browser will call once, right before its
next actual repaint.

### Isolating the Concept

```js
console.log("has requestAnimationFrame:", typeof requestAnimationFrame);

function frame(timestamp) {
  console.log("frame ran, timestamp =", Math.round(timestamp) + "ms");
}
requestAnimationFrame(frame);
```

Real output (captured with `pretendToBeVisual: true`, described above):

```
has requestAnimationFrame: function
frame ran, timestamp = 41ms
```

What this proves: `frame` genuinely was *not* called immediately (there's
a real, measurable delay — 41ms here — before it runs, unlike a plain
function call, which happens instantly) and it received a real numeric
argument on its own, without anything passing one explicitly. That
argument is called the **frame timestamp** — the time, in milliseconds,
since the page loaded, supplied automatically by the browser so animation
code can measure real elapsed time between frames rather than just
counting how many times it's been called. This project isn't using the
timestamp for real timing yet — Arc 5's motion-profile lessons are where
it becomes essential — but it exists starting now.

### Discarding

Discarded — `frame` above never appears in the project; `draw` is the real
version.

### Mechanical Walkthrough

- **`function draw(timestamp) { ... }`** — (b) a concept reappearing:
  function declarations were already introduced for `toCanvasY` in Lesson
  2. What's new here is only that this particular function is never called
  directly by name in this file — it's called *by* `requestAnimationFrame`
  instead, per the callback concept from the previous unit.
- **`timestamp`** — (a) first appearance, as a specific idea: a parameter
  this function never has to supply an argument for itself — the browser
  fills it in automatically when it invokes the callback.
- **`requestAnimationFrame(draw)`** — (a) first appearance. Asks the
  browser to call `draw` exactly once, right before the browser's next
  actual screen repaint, passing that repaint's timestamp.

### CS Lens

Deferring work to run at the "right moment" rather than immediately, on
demand, is worth naming as its own idea.

```
Also recognized in: a database's deferred trigger firing after a
transaction commits, a UI framework batching several state updates into
one re-render, an OS scheduler deciding when a ready process actually runs,
Node's own event loop deferring a setTimeout callback
```

### SE Lens

The alternative not chosen: `setInterval(draw, 16)`, guessing "roughly 60
frames per second" as a fixed delay. The real tradeoff:
`requestAnimationFrame` is synchronized to the actual display's refresh
rate (which isn't always 60Hz), automatically pauses when the tab isn't
visible (saving battery and CPU for no visual benefit), and hands back a
real timestamp for free. `setInterval` does none of that — it runs on a
fixed wall-clock timer regardless of whether the browser can actually
paint that often, drifting out of sync with the display over time.

### Run It

Real output already shown above.

### Connecting

`draw` now runs exactly once, at the right moment — the last unit makes it
keep happening, which is what actually makes this an animation and not a
single delayed drawing.

---

## Concept Unit: Creating the Loop — Scheduling the Next Frame from Within

### The Problem

`requestAnimationFrame(draw)` schedules exactly one future call to `draw`.
Once that single call finishes, nothing else happens — the animation would
run for one frame and then simply stop. Continuous animation needs `draw`
to ask for its *own* next frame, every time it runs.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** inside `draw`, at its end; also modifies `point.x` each
  frame so movement is visible
- **Dependencies:** `requestAnimationFrame`, from the previous unit

### The New Code

```js
point.x += 2;
requestAnimationFrame(draw);
```

### The Updated Project

```js
const point = { x: 400, y: 300 };

function draw(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(point.x, toCanvasY(point.y, canvas.height), 15, 0, Math.PI * 2);
  ctx.fill();

  point.x += 2;                 // ← new
  requestAnimationFrame(draw);  // ← new
}

requestAnimationFrame(draw);
```

`draw` now ends by moving the point slightly and scheduling *itself* again
— the one line at the very bottom of the file still only kicks the whole
process off once; every call after that is `draw` re-scheduling its own
next run.

### Isolating the Concept

A real 4-frame run, on a real canvas, with pixel checks before and after:

```js
let pointX = 50;
let frameCount = 0;

function draw(timestamp) {
  frameCount++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(pointX, toCanvasY(300, canvas.height), 15, 0, Math.PI * 2);
  ctx.fill();

  console.log("frame", frameCount, "timestamp=" + Math.round(timestamp) + "ms", "pointX=" + pointX);
  pointX += 20;

  if (frameCount < 4) {
    requestAnimationFrame(draw);
  }
}
requestAnimationFrame(draw);
```

Real output:

```
frame 1 timestamp=53ms pointX=50
frame 2 timestamp=92ms pointX=70
frame 3 timestamp=109ms pointX=90
frame 4 timestamp=126ms pointX=110
```

And, checked after the loop finished:

```
final pixel check at last drawn position (110, 300): [ 0, 0, 0, 255 ]
pixel check at FIRST position (50, 300) - should be clear now: [ 0, 0, 0, 0 ]
```

What this proves, concretely: four real, separately-timestamped frames
ran, each roughly 20-40ms apart (real scheduler timing, not evenly spaced
— proof this is genuinely tied to actual repaint timing, not a fixed
counter). `pointX` really did increase each frame. And critically: the
*first* position, `50`, is fully transparent by the end — proof that
`clearRect` (first unit of this lesson) genuinely erased each prior frame,
rather than the dot just visually appearing to move while old copies piled
up underneath.

### Discarding

Discarded — `pointX`/`frameCount` were a standalone check; the real project
uses `point.x` and no frame counter, running indefinitely rather than
stopping at 4.

### Mechanical Walkthrough

- **`point.x += 2;`** — (a) first appearance of `+=`, compound assignment
  — shorthand for `point.x = point.x + 2`. Everything else in the
  statement (`point.x` property access) is (c) genuinely basic, already
  established when `point` was created in Lesson 3.
- **`requestAnimationFrame(draw);`** — (b) a concept reappearing: the same
  call from the previous unit, at the same place in the code — the only
  difference is *where* it's written this time (inside `draw` itself,
  making it self-perpetuating) rather than at the top level of the file.

### CS Lens

A function that schedules its own next invocation, rather than being
called in an external loop, is a **recursive scheduling** pattern.

```
Also recognized in: a game engine's core update loop, a server's
event-driven request loop, a Node.js worker that re-queues itself after
each job, physical control systems that re-sample themselves every fixed
interval
```

### SE Lens

The alternative not chosen: a real `for` or `while` loop wrapping the
`draw` logic, running as fast as the CPU allows. The real cost: without
`requestAnimationFrame` pacing it, such a loop would run thousands of times
per second, doing work the screen can't even display that fast, burning
CPU and battery for zero additional visible smoothness — and would never
yield control back to the browser, freezing the page's ability to respond
to anything else (clicks, scrolling, the console) while it runs. The
self-rescheduling pattern costs one extra line per frame in exchange for
staying synchronized with what the screen can actually show and never
blocking the page.

### Commands Needed

None new.

### Run It

Real output already shown above, from this session.

### Connecting

The point now genuinely animates — the canvas gets erased and redrawn,
continuously, at a rate the browser itself controls, using nothing but
concepts this lesson introduced and proved individually.

---

## Closing

### Connect the Pieces

One value traced through the whole lesson: `point.x`, starting at `400`.
Each time `draw` (Unit 3) runs — because something called
`requestAnimationFrame(draw)` (Unit 3), which only works because `draw` was
passed *by reference*, unevaluated, per the callback concept (Unit 2) — it
first erases the entire canvas with `clearRect` (Unit 1), so the previous
frame's dot at the old `point.x` is genuinely gone, then redraws the dot at
the current `point.x`, then increments it and reschedules itself (Unit 4).
Take away any one piece and the animation either never starts, runs once
and stops, or degenerates into a trail of un-erased dots.

### What Breaks Without This

Removing just the `ctx.clearRect(...)` line while leaving everything else
intact — rerunning the exact 4-frame demo above, without clearing:

```js
let pointX2 = 50;
let frameCount2 = 0;

function drawNoClear(timestamp) {
  frameCount2++;
  // no clearRect this time
  ctx2.beginPath();
  ctx2.arc(pointX2, toCanvasY(300, canvas2.height), 15, 0, Math.PI * 2);
  ctx2.fill();
  pointX2 += 20;
  if (frameCount2 < 4) requestAnimationFrame(drawNoClear);
}
requestAnimationFrame(drawNoClear);
```

After this runs, checking the *first* position again — `(50, 300)`, where
frame 1 drew its dot — shows it's still solid black, unlike the working
version, where that same pixel came back transparent. Without `clearRect`,
every past frame's dot is still sitting there; what looks like "a moving
point" is actually four separate, permanent dots. Restoring the
`clearRect` call fixes this immediately.

### Exercises

- Change `point.x += 2` to `point.x -= 2` and confirm, in your browser, the
  point moves left instead of right.
- Add a boundary check: once `point.x` exceeds `canvas.width`, reset it
  back to `0`, so the point wraps around instead of moving off-screen
  forever.
- Log `timestamp` inside `draw` for real, in your browser's console, and
  watch how the gaps between consecutive timestamps are *not* perfectly
  even — this is the real repaint timing the SE Lens above described,
  visible firsthand rather than just asserted.

### Definition of Done

- [ ] `script.js` defines `draw(timestamp)`, which clears the canvas,
      redraws the point, moves it, and reschedules itself
- [ ] The animation is kicked off once, at the top level, outside `draw`
- [ ] Opening `index.html` in a real browser shows the point continuously
      moving, with no trail left behind
- [ ] You can explain, without looking, why `requestAnimationFrame(draw)`
      (no parentheses after `draw`) is correct and `requestAnimationFrame(draw())`
      would break
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Animate the point using requestAnimationFrame

  draw() now clears the canvas, redraws the point at its current position,
  moves it, and reschedules its own next frame. Verified with a real
  4-frame run that clearRect genuinely erases prior frames rather than
  leaving a trail."
  ```
