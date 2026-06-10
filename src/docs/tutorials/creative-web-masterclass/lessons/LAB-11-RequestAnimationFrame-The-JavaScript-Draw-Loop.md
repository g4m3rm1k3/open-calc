# Creative Web Masterclass — LAB 11 — requestAnimationFrame: The JavaScript Draw Loop

**Prerequisites:** LAB-10. You know events, querySelector, classList, and textContent.

**What this lab adds:**
- `requestAnimationFrame` — the browser's frame-synchronized animation callback
- The animation loop pattern: schedule → update → render → schedule again
- Delta time — making animation speed independent of frame rate
- A square that moves smoothly across the screen and wraps at the edges

**Time:** 50–65 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │                                                      │
 │          ■                                           │
 │                    → moves steadily rightward →      │
 │                                        ■             │
 │                                                      │
 └──────────────────────────────────────────────────────┘
  When the square reaches the right edge, it wraps to the left.
  The speed is consistent at 60fps and at 10fps.
```

---

> **Quick Check — answer before reading further:**
>
> 1. `setInterval(fn, 16)` calls `fn` every 16ms — roughly 60 times per second. Why is
>    this a bad way to animate things in the browser?
> 2. On a fast computer (120fps) vs. a slow one (30fps), what happens to an animation
>    that moves 3px per frame?
> 3. What do you think "delta time" means? Why would an animation loop need to know how
>    long the previous frame took?
>
> *(Answers at the end)*

---

## Concept: `requestAnimationFrame`

**What it is:** `requestAnimationFrame(callback)` asks the browser to call `callback`
once, immediately before painting the next frame. To animate, call `requestAnimationFrame`
again at the end of each callback, creating a loop.

**The problem before:**

```js
// setInterval-based animation — the wrong approach
setInterval(function () {
  box.style.left = (parseFloat(box.style.left) + 3) + 'px';
}, 16);
```

`setInterval` runs on a JavaScript timer, not synchronized with the browser's repaint cycle.
If the browser needs to skip a frame (because the system is busy), `setInterval` still fires —
updating a value that will never be painted. This wastes CPU and causes stuttering.
If the tab is hidden, `setInterval` still fires, burning battery.

**The solution:**

```js
function animate() {
  // ...update and render...
  requestAnimationFrame(animate);  // schedule the next call
}
requestAnimationFrame(animate);    // start the loop
```

The browser calls `animate` once per frame, synchronized with the screen's refresh. When
the tab is hidden, the browser stops calling `animate` automatically — no wasted work.

**What it hides:** `requestAnimationFrame` hides the screen synchronization logic —
the vertical sync (vsync) mechanism that prevents tearing, the frame budget tracking that
tells the browser whether it has time for another frame, and the tab-visibility optimization.
The invariant: `animate` is called at most once per screen refresh. You cannot accidentally
get two renders in one frame.

**Canonical example (General Explanation):**
- **Real-world analogy:** A flipbook — you flip to the next page only when you are ready
  to see it, not on a fixed timer. `requestAnimationFrame` says "I am ready; show me the
  next page when you are."
- **Minimal form:**
  ```js
  function loop() {
    // update state
    // render to screen
    requestAnimationFrame(loop);  // ask for next call
  }
  requestAnimationFrame(loop);    // first call
  ```
- **Why obvious:** Remove the `requestAnimationFrame(loop)` inside the function and the
  loop runs once. Add it back and it runs continuously.

**Project Application:**
Every Canvas 2D animation (LAB-14–16) and every Three.js scene (LAB-17–23) uses this exact
loop. The pattern is always: `animate()` function, `requestAnimationFrame(animate)` inside
it, `requestAnimationFrame(animate)` to start.

**Smallest possible example:**
```js
function animate() {
  box.style.left = (parseInt(box.style.left) + 2) + 'px';
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

**Why it matters here:** This is the single most important animation pattern in browser
JavaScript. Everything visual that moves uses this.

**Watch for:** `requestAnimationFrame` passes a `DOMHighResTimeStamp` argument to the callback.
This is the time (in milliseconds, with sub-millisecond precision) of the current frame.
Use it to calculate delta time (next concept).

---

## Concept: The Animation Loop Mental Model

**What it is:** The animation loop is a pattern where a single function runs repeatedly,
advancing the state of the world by one frame each call — update, render, repeat.

**The problem before:** Without the loop mental model, animation code gets scattered: event
handlers updating positions, timers doing rendering, CSS transitions handling some motion.
When multiple animations interact, their separate timers create race conditions and
inconsistent state.

**The solution:** Centralize all state changes in one loop:

```
animate() called by browser
  │
  ├─ UPDATE: advance every object's state by one frame
  │   (move the square, update the particle positions, etc.)
  │
  ├─ RENDER: draw the current state to the screen
  │   (set CSS properties, draw to canvas, update DOM text)
  │
  └─ SCHEDULE: request the next frame
       requestAnimationFrame(animate)
```

**What it hides:** The loop hides the frame timing. You only see "one step forward" per
call — you never deal with vsync, frame skipping, or synchronization.

**Canonical example:**
- **Real-world analogy:** A film projector. Each frame is the current state of every object
  in the scene. The projector (browser) shows one frame, then asks for the next. The "animate"
  function is the process of developing each frame.

**Project Application:**
The portfolio's Three.js scene, canvas particle system, and scroll-tracking code all follow
this exact structure: update state, render state, request next frame.

**Watch for:** Never read from the DOM in the render phase and write back to it in the same
frame — this forces synchronous layout recalculation (called "layout thrashing"), which can
drop frames significantly. Always read first, write second.

---

## Math: Modulo Wrapping

**What it computes:** Given a value that keeps increasing, modulo (`%`) brings it back to
zero when it exceeds a maximum — producing a repeating cycle.

**The real-world analogy:** A 12-hour clock. After 12:00, the hour does not become 13:00 —
it wraps back to 1:00. `13 % 12 = 1`. The number wraps at the boundary.

**Canonical example:**

```
Hours on a clock:      0  1  2  ...  11  12  13  14  ...
After % 12:            0  1  2  ...  11   0   1   2  ...
```

For wrapping an X position across a canvas width:
```
x (increasing)   →   0  100  200  ...  799  800  801  ...
x % 800          →   0  100  200  ...  799    0    1  ...
```

```js
box.x = (box.x + SPEED) % CANVAS_WIDTH;
// When box.x reaches CANVAS_WIDTH, it wraps to 0
```

**Why it matters here:** The square must wrap from right edge back to the left edge.

**Watch for:** For movement in both directions (the square can also move left), add the
width before the modulo to handle negative values: `(x + CANVAS_WIDTH) % CANVAS_WIDTH`.
If `x = -1`, then `(-1 + 800) % 800 = 799` — correctly wrapped at the right edge.

---

## Step 1 — Create Files

`projects/lab-11/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 11 — requestAnimationFrame</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <div class="track">
      <div class="box" id="moving-box"></div>
    </div>

    <div class="info-panel">
      <p>Frame: <span id="frame-count">0</span></p>
      <p>Box X: <span id="box-x">0</span>px</p>
    </div>

    <script src="main.js"></script>
  </body>
</html>
```

---

> **CSS AND SEE**
>
> Open with Live Server.
>
> **You should see:** An empty page — the box and track have no styles yet.

---

## Step 2 — Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
:root {
  --color-primary: #6c63ff;
  --color-bg: #0d0d1a;
}
body { margin: 0; background: var(--color-bg); font-family: system-ui, sans-serif; color: white; }

.track {
  width: 100%;
  height: 200px;
  border-bottom: 1px solid #2a2a4a;   /* visual rail for the box to move along */
  position: relative;                  /* positions children relative to this element */
  overflow: hidden;                    /* clip box when it exits this area */
}

.box {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  border-radius: 6px;
  position: absolute;                  /* take out of normal flow — we control position */
  top: 50%;                            /* vertical center in the track */
  transform: translateY(-50%);         /* offset by half own height — true vertical center */
}

.info-panel {
  padding: 24px;
  font-family: monospace;
  color: #8888aa;
}

.info-panel p { margin: 0 0 8px 0; }
```

---

> **CSS AND SEE**
>
> **You should see:** A purple square in the middle-left of the track area. Static — no
> JavaScript yet. The track has a bottom border like a runway. The info panel shows
> "Frame: 0" and "Box X: 0px" as static text.

---

## Step 3 — The Basic Animation Loop

`main.js`:

```js
const boxEl = document.querySelector('#moving-box');   // the purple square
const frameCountEl = document.querySelector('#frame-count');
const boxXEl = document.querySelector('#box-x');

const TRACK_WIDTH = window.innerWidth;   // total width the box can travel
const BOX_SPEED = 3;                     // pixels per frame (NOT per second — fixed for now)

// The box's state — we control position in JS, not CSS
let boxX = 0;    // current X position, starts at the left edge
let frameCount = 0;

function animate() {
  // --- UPDATE: advance the box position ---
  boxX = boxX + BOX_SPEED;
  // Wrap: when boxX exceeds the track width, start over from 0
  // (boxX + TRACK_WIDTH) % TRACK_WIDTH handles the negative case if BOX_SPEED is negative
  boxX = (boxX + TRACK_WIDTH) % TRACK_WIDTH;

  frameCount = frameCount + 1;

  // --- RENDER: apply the new position to the DOM ---
  boxEl.style.left = boxX + 'px';   // set the CSS left property as a pixel string
  frameCountEl.textContent = frameCount;
  boxXEl.textContent = Math.round(boxX);

  // --- SCHEDULE: request the next frame ---
  requestAnimationFrame(animate);   // tell the browser: "call animate again next frame"
}

// Start the loop
requestAnimationFrame(animate);
```

---

> **SAVE AND TRY**
>
> **You should see:** The purple square moving steadily from left to right, wrapping back
> to the left when it reaches the right edge. The frame counter increments continuously.
>
> **In DevTools Console:**
> ```js
> boxX   // type this and press Enter while the animation runs
> ```
> **Expected:** A number between 0 and the window width. Run again — a different number.
>
> **Change something:** Change `const BOX_SPEED = 3` to `const BOX_SPEED = 12`. Save.
> The box moves much faster. Change to `const BOX_SPEED = 1`. Very slow. Change back to `3`.

---

## Step 4 — Understand the Frame Rate Problem

The current animation moves `BOX_SPEED` pixels *per frame*, not per second. On a 60fps
monitor, `3px/frame × 60fps = 180px/second`. On a 120fps monitor, `3px/frame × 120fps =
360px/second` — twice as fast. On a slow computer running at 30fps, it is 90px/second.

This is frame-rate-dependent animation. It works fine for a single-player demo but would be
unfair in a game or inconsistent in a UI that must look the same everywhere.

---

## Step 5 — Add Delta Time for Frame-Rate Independence

`requestAnimationFrame` passes the current timestamp to the callback. Comparing
successive timestamps gives us the duration of the last frame — **delta time** (`dt`).
Multiplying speed by `dt` ensures consistent speed regardless of frame rate.

Update `main.js`:

```js
const BOX_SPEED_PER_SECOND = 200;   // ← was BOX_SPEED = 3 (per frame). Now per second.

let lastTimestamp = null;   // stores the timestamp of the previous frame

function animate(timestamp) {   // ← add `timestamp` parameter (provided by the browser)
  // Calculate delta time: time since the last frame, in seconds
  if (lastTimestamp === null) {
    lastTimestamp = timestamp;   // first frame — no previous time yet
  }
  const deltaTime = (timestamp - lastTimestamp) / 1000;   // convert ms to seconds
  lastTimestamp = timestamp;                               // save for next frame

  // Update: move by speed × time (distance = speed × time)
  boxX = boxX + BOX_SPEED_PER_SECOND * deltaTime;
  boxX = (boxX + TRACK_WIDTH) % TRACK_WIDTH;
  frameCount = frameCount + 1;

  // Render
  boxEl.style.left = boxX + 'px';
  frameCountEl.textContent = frameCount;
  boxXEl.textContent = Math.round(boxX);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

`distance = speed × time` is the physics formula for constant-velocity motion. If `dt =
0.016s` (60fps), the box moves `200 × 0.016 = 3.2px` per frame — about 200px per second.
If `dt = 0.033s` (30fps), it moves `200 × 0.033 = 6.6px` per frame — still ~200px per
second. The distance per second is constant regardless of frame rate.

---

> **SAVE AND TRY**
>
> **You should see:** The box moving at the same visual speed as before — approximately
> 200px per second. It still wraps at the edges.
>
> **To verify frame-rate independence:** Open DevTools → Performance tab → click the
> three-dot menu → "Enable CPU throttling" → set to `4x slowdown`. The frame counter
> updates more slowly but the box covers the same distance per second.
> Remove the throttle when done.
>
> **Change something:** Change `BOX_SPEED_PER_SECOND` from `200` to `500`. Save. The box
> now crosses the screen in about half a second — noticeably faster. Change back to `200`.

---

## 🎯 Challenge: Two Boxes, Opposite Directions

**You know:** The animation loop, delta time, modulo wrapping, `requestAnimationFrame`.

**Task:** Add a second box that moves in the opposite direction (right to left) at 150px/s.
Both boxes should wrap at both edges. The second box should start at `x = TRACK_WIDTH / 2`
so they are not overlapping at the start.

**Starting HTML to add:**
```html
<div class="box box-two" id="moving-box-two"></div>
```

**Hint:** A negative speed moves left. For wrapping with negative speed: `(x + TRACK_WIDTH) % TRACK_WIDTH` works for both positive and negative values.

---

<details>
<summary>▶ Show Solution</summary>

```js
const boxTwoEl = document.querySelector('#moving-box-two');
let boxTwoX = TRACK_WIDTH / 2;        // start in the middle
const BOX_TWO_SPEED = -150;           // negative = moves left

// In the animate function's update section, add:
boxTwoX = boxTwoX + BOX_TWO_SPEED * deltaTime;
boxTwoX = (boxTwoX + TRACK_WIDTH) % TRACK_WIDTH;

// In the render section, add:
boxTwoEl.style.left = boxTwoX + 'px';
```

In `styles.css` add:
```css
.box-two { background: #ff6b6b; }   /* red so the two boxes are visually distinct */
```

**Key insight:** The animation loop's update-render-schedule structure means adding a
second animated object requires zero structural change. You add state variables (`boxTwoX`)
and update/render them inside the existing `animate` function. The loop handles both objects
simultaneously at 60fps without any additional `requestAnimationFrame` calls.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Box moves smoothly without stutter | Steady leftward motion, no jumps or pauses |
| Box wraps at both edges | Reaches right edge → appears at left edge |
| Frame counter increments | Number increases continuously |
| Box X display updates | Number changes to match box position |
| Delta time is used | Speed defined in px/s, not px/frame |

---

## What's Next

LAB 12 introduces `IntersectionObserver` — a way to trigger animations when elements
scroll into the viewport. Instead of watching every scroll event, the browser notifies you
only when elements cross the viewport threshold.

---

## Transfer Exercise

`requestAnimationFrame` is the browser's game loop. Every game engine has an equivalent:
Unity's `Update()`, Godot's `_process(delta)`, Pygame's event loop, Love2D's `love.update(dt)`.

Describe the equivalent of `requestAnimationFrame` in Unity. What is `Time.deltaTime` in
Unity, and how does it correspond to the `deltaTime` variable in this lab? What happens in
Unity if you multiply a speed by `Time.deltaTime`?

---

## Quick Check Answers

**1. Why is `setInterval` bad for animations?**
`setInterval` fires on a JavaScript timer that is not synchronized with the screen's
refresh cycle. If the browser needs to skip a frame (due to heavy JavaScript or GC),
`setInterval` still fires — it updates state that will never be rendered, wasting CPU.
In a hidden tab, `setInterval` still fires, consuming battery. `requestAnimationFrame`
is browser-managed: it skips hidden tabs automatically and aligns with vsync.

**2. What happens on 120fps vs 30fps with `px/frame` speed?**
On 120fps, the box moves `speed × 120 = 2× as many pixels per second` as on 60fps.
On 30fps, it moves half as many. The animation is frame-rate-dependent — faster hardware
makes the animation faster. Delta time (multiplying by the duration of each frame)
normalizes this: the box always moves `speed × time_in_seconds` pixels, regardless of
how many frames that time contains.

**3. What is delta time?**
Delta time (`dt`) is the duration of the previous frame in seconds. On a 60fps display,
`dt ≈ 0.0167s`. On 30fps, `dt ≈ 0.033s`. Multiplying speed by `dt` gives distance:
`px/s × s = px`. Since `dt` is proportionally larger on slower machines (more time per
frame), slower machines move the object further per frame — exactly compensating for the
lower frame count. The result: the same number of pixels per second on all hardware.
