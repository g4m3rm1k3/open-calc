# Creative Web Masterclass — LAB 32 — Canvas Section: Interactive Particle Widget

**Prerequisites:** LAB-31 (portfolio with hero + work section), LAB-16 (mouse-reactive particles).

**What this lab adds:**

- A real Canvas section replacing the LAB-31 placeholder
- The mouse-reactive Canvas 2D particle system from LAB-16, embedded inside the portfolio
- Section-scoped canvas — `position: absolute` inside `position: relative`, not full-page
- A text overlay heading that sits above the canvas

**Time:** 35–45 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  Playground                                          │
 │  ────────────────────────                            │
 │  Move your cursor to interact                        │
 │                                                      │
 │  [· · · · · · · · ·  particles drift across  · · ·] │
 │  [· ·  · mouse pushes particles away  · · · · · · ] │
 │  [· · · · · · · · · · · · · · · · · · · · · · · · ] │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. In LAB-16, the canvas covered the whole page. Here we want it scoped to one section.
>    What two CSS properties on the section make an `absolute`-positioned canvas stay inside it?
> 2. The canvas `.width` and `.height` attributes must match the pixel size of the element.
>    In LAB-16 we used `window.innerWidth`. What should we use for a section-scoped canvas?
> 3. Why does mouse position need to be recalculated relative to the canvas element rather
>    than using `clientX` directly?
>
> *(Answers at the end)*

---

## Concept: Embedding a Canvas Widget in a Section

**What it is:** In LAB-16, the canvas covered the full browser window. You used
`canvas.width = window.innerWidth` and listened for `mousemove` on `window`. When the
canvas is scoped to a single section, those same global values are wrong:

```
Page layout (simplified):
  ┌─────────────────────┐  ← top of page
  │  Hero section       │
  │  (100vh)            │
  ├─────────────────────┤
  │  Work section       │
  │  (100vh)            │
  ├─────────────────────┤
  │  Canvas section     │  ← canvas lives here
  │  (100vh)            │
  └─────────────────────┘

window.innerWidth  = full browser width  ✓ (same as section width)
window.innerHeight = full browser height ✗ (section is 100vh but starts further down)
clientX / clientY  = position from browser top-left ✗ (canvas starts at section's top)
```

The fix uses the section's own dimensions and `getBoundingClientRect()`:

```js
const canvasSection = document.querySelector('#canvas');

canvas.width  = canvasSection.clientWidth;   // section's pixel width
canvas.height = canvasSection.clientHeight;  // section's pixel height

canvasSection.addEventListener('mousemove', function (e) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;   // subtract canvas's distance from left edge
  mouse.y = e.clientY - rect.top;    // subtract canvas's distance from top edge
  mouse.onCanvas = true;
});
```

`getBoundingClientRect()` returns the canvas element's position relative to the viewport.
`rect.left` is how many pixels from the left of the viewport to the left edge of the canvas.
Subtracting it from `e.clientX` converts from "distance from left of browser window" to
"distance from left of canvas". Same for `top`.

Without this conversion, `mouse.x = 0` would mean "far left of the browser window",
but the canvas drawing code treats 0 as "far left of the canvas". If the canvas starts
800px from the left of the window, a cursor at the left edge of the canvas would give
`clientX = 800` — and pushing `800` into a canvas that is only 600px wide would place
the cursor (and its repulsion zone) completely off the right side of the canvas.

---

## Step 1 — Update index.html (Canvas Section)

Replace the canvas section placeholder:

```html
<section id="canvas" class="port-section section-canvas">

  <!-- Canvas is appended here by JavaScript (same as hero in LAB-30) -->

  <div class="canvas-content">
    <p class="section-eyebrow">Interactive demo</p>
    <h2 class="section-title">Playground</h2>
    <p class="canvas-hint">Move your cursor over the canvas to interact</p>
  </div>

</section>
```

There is no `.section-inner` wrapper here. In the Work section, `.section-inner` constrained
the content to 900px. Here the canvas needs to fill the *entire* section — 100% width and
100% height. A `.section-inner` with `max-width: 900px` would clip the canvas.

The `.canvas-content` overlay uses `position: absolute` (added in CSS) to sit in the
top-left corner above the canvas without affecting layout.

---

## Step 2 — Styles

Add these new rules to `styles.css`. Keep everything from LAB-31.

### Canvas fills the section

```css
.section-canvas canvas {
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 0;
}
```

`.section-canvas canvas` targets any `<canvas>` element that is a descendant of `.section-canvas`.
We use this because JavaScript creates the canvas with `document.createElement('canvas')`
and appends it — there is no canvas in the HTML. The selector still works because CSS does
not care whether the element was in the original HTML or added by JS.

`position: absolute !important` — we need `!important` here because Three.js (in the hero
section) sets its canvas to `position: static` by default. If we ever add a Three.js canvas
to this section, `!important` prevents the library from overriding our positioning. For a
plain 2D canvas, it is not strictly necessary, but it makes the rule bulletproof.

`top: 0; left: 0` — with the canvas absolutely positioned, these properties anchor it to
the top-left corner of the *containing block*. The containing block is the nearest ancestor
with `position` set. That is `.section-canvas`, which already has `position: relative`
from the base `.port-section` styles.

`width: 100% !important; height: 100% !important` — these control the *display* size of the
canvas (how large it appears on screen). The canvas element's actual `width` and `height`
*attributes* (set by JavaScript) control the drawing resolution. Both must match or the
drawing will appear stretched or compressed. We set CSS width/height here; JavaScript sets
the attributes.

`z-index: 0` — places the canvas behind `.canvas-content` which will use `z-index: 1`.
The section's default `z-index` is `auto`, which is treated as 0 in the same stacking
context. Because `.canvas-content` uses `position: absolute`, it participates in the
stacking context and can use `z-index`.

### Text overlay

```css
.canvas-content {
  position: absolute;
  top: 60px;
  left: 80px;
  z-index: 1;
  pointer-events: none;
}

.canvas-hint {
  color: var(--color-muted);
  font-size: 0.85rem;
  margin: 8px 0 0 0;
}
```

`position: absolute; top: 60px; left: 80px` — the overlay is positioned 60px from the
top and 80px from the left of the section (its containing block is `.section-canvas`
which has `position: relative`). These numbers are a design decision: enough inset to
clear the ribbon nav (60px wide) and leave breathing room.

`z-index: 1` — puts the overlay above `z-index: 0` (the canvas). Without this, both would
be at the same z-index and the browser would paint them in DOM order — canvas first (it
comes first in HTML), overlay second. In this case it would actually work, but being
explicit is safer.

`pointer-events: none` — the overlay sits on top of the canvas visually, but the canvas
needs to receive mouse events for the particle interaction. Without `pointer-events: none`,
moving the cursor over the heading text would trigger `mousemove` on the overlay, not the
canvas — and the particles would stop reacting. Setting `pointer-events: none` makes the
overlay transparent to mouse events: clicks and moves pass through it to the canvas below.

`.canvas-hint` uses `var(--color-muted)` and a small font size to make it a secondary note
rather than a competing heading. `margin: 8px 0 0 0` gives a small gap below the
`.section-title` without space on the other sides.

### Don't forget overflow

The `.section-canvas` needs `overflow: hidden` to clip the canvas at the section boundary.
Update the existing rule (originally from LAB-29/30):

```css
.section-canvas { border-left: 4px solid hsl(28, 95%, 58%); overflow: hidden; }
```

Without `overflow: hidden`, if the canvas is even 1px larger than the section (due to
rounding or resize timing), it would visually bleed outside the section boundary.

---

> **CSS AND SEE**
>
> **You should see:** The Canvas section with its orange left border. The "Playground"
> heading appears in the top-left corner. There is no canvas yet — the section background
> is just the page background colour. Adding the canvas is the JavaScript step.

---

## Step 3 — JavaScript: Particle Widget

Append this block to `main.js` (after the scroll-reveal code):

### Setup: create and size the canvas

```js
const canvasSection = document.querySelector('#canvas');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvasSection.appendChild(canvas);
```

`document.createElement('canvas')` creates a new canvas element in memory — it is not
in the page yet. `getContext('2d')` gets the 2D drawing API from it.
`canvasSection.appendChild(canvas)` inserts it into the DOM as the last child of the
canvas section. This triggers the CSS rule `.section-canvas canvas` which positions it
absolutely to fill the section.

```js
const PARTICLE_COUNT  = 120;
const INFLUENCE_RADIUS = 110;
const PUSH_STRENGTH   = 3.5;
const canvasParticles = [];
const mouse = { x: -999, y: -999, onCanvas: false };
```

Constants at the top so they are easy to tweak. `mouse.x = -999` puts the cursor far
off-canvas at startup, so no particles are pushed before the user moves their mouse.
`onCanvas: false` starts as `false` — the glow ring only draws when the mouse is inside
the section.

```js
function sizeCanvas() {
  canvas.width  = canvasSection.clientWidth;
  canvas.height = canvasSection.clientHeight;
}
sizeCanvas();
window.addEventListener('resize', sizeCanvas);
```

`canvas.width` and `canvas.height` are the HTML attributes, not the CSS properties. They
set the *resolution* of the drawing surface in pixels. `canvasSection.clientWidth` gives
the inner pixel width of the section element (excluding borders). We call `sizeCanvas()`
once on startup and again every time the window resizes — if the canvas resolution doesn't
match the section size, drawings will appear stretched.

### Build the particle array

```js
for (let i = 0; i < PARTICLE_COUNT; i++) {
  const speedTier = Math.random();
  canvasParticles.push({
    x:      Math.random() * canvas.width,
    y:      Math.random() * canvas.height,
    vx:     (Math.random() - 0.5) * 0.5,
    vy:     -(speedTier * 1.5 + 0.2),
    baseVx: (Math.random() - 0.5) * 0.5,
    baseVy: -(speedTier * 1.5 + 0.2),
    radius: speedTier * 2 + 0.5,
    alpha:  speedTier * 0.5 + 0.15,
    hue:    Math.random() * 40 + 160
  });
}
```

`speedTier` is a single random value (0–1) used to correlate size, speed, and opacity.
A particle with a high `speedTier` is larger (`radius: speedTier * 2 + 0.5`), rises faster
(`vy: -(speedTier * 1.5 + 0.2)`), and is more opaque (`alpha: speedTier * 0.5 + 0.15`).
This mimics how bubbles work in liquid — bigger bubbles rise faster.

`baseVx` and `baseVy` store the particle's natural drift velocity. When the mouse pushes a
particle, its `vx` and `vy` temporarily diverge from `baseVx` and `baseVy`. Each frame,
the friction formula `p.vx = p.vx * 0.92 + p.baseVx * 0.08` slowly bleeds `vx` back toward
`baseVx` — so the particle always returns to its original drift path.

`hue: Math.random() * 40 + 160` puts the hue in the 160–200 range — the teal/cyan band —
to match the Canvas section's accent colour.

### Mouse tracking

```js
canvasSection.addEventListener('mousemove', function (e) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.onCanvas = true;
});

canvasSection.addEventListener('mouseleave', function () {
  mouse.onCanvas = false;
});
```

The `mousemove` listener is on `canvasSection`, not `window`. This means it only fires
when the cursor is inside the canvas section — no unnecessary tracking while the user is
reading other sections.

`getBoundingClientRect()` returns a DOMRect: `{ left, top, width, height, ... }` all
measured from the viewport's top-left corner. Subtracting `rect.left` from `e.clientX`
converts the viewport-relative position to a canvas-relative position (0 = canvas left edge).

`mouseleave` fires when the cursor exits the section element. Setting `mouse.onCanvas = false`
turns off the glow ring and push force — particles resume normal drift.

### Update function

```js
function updateParticles() {
  canvasParticles.forEach(function (p) {
    if (mouse.onCanvas) {
      const dx   = p.x - mouse.x;
      const dy   = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < INFLUENCE_RADIUS && dist > 0) {
        const force = (1 - dist / INFLUENCE_RADIUS) * PUSH_STRENGTH;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }

    p.vx = p.vx * 0.92 + p.baseVx * 0.08;
    p.vy = p.vy * 0.92 + p.baseVy * 0.08;

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0)              p.x = canvas.width;
    if (p.x > canvas.width)   p.x = 0;
    if (p.y < -p.radius)      p.y = canvas.height + p.radius;
    if (p.y > canvas.height)  p.y = -p.radius;
  });
}
```

`const dist = Math.sqrt(dx * dx + dy * dy)` is the 2D distance formula from LAB-16.
`dx` is the horizontal gap between particle and mouse, `dy` the vertical.
`Math.sqrt(dx² + dy²)` gives the straight-line distance.

`dist < INFLUENCE_RADIUS` — only particles within the radius are pushed.
`dist > 0` — prevents dividing by zero if a particle is exactly on the cursor.

`const force = (1 - dist / INFLUENCE_RADIUS) * PUSH_STRENGTH` — this is a linear falloff.
When `dist = 0` (cursor is on the particle): `force = 1.0 * PUSH_STRENGTH = 3.5`.
When `dist = INFLUENCE_RADIUS` (edge of influence): `force = 0.0 * PUSH_STRENGTH = 0`.
In between, force decreases linearly. The result is a smooth gradient — particles close
to the cursor fly away fast, particles at the edge barely move.

`(dx / dist)` and `(dy / dist)` — dividing by `dist` normalises the direction vector to
unit length (magnitude of exactly 1). Multiplying by `force` then scales it to the right
strength. Without normalisation, particles close to the cursor (small `dist`) would have
a larger-magnitude push than particles far away (large `dist`) independent of the falloff.

`p.vx * 0.92 + p.baseVx * 0.08` — friction formula. Each frame, 92% of the current velocity
survives and 8% of the base velocity is blended in. At 60fps this means:

- After 10 frames (~0.16s): `0.92^10 ≈ 44%` of the original push remains
- After 30 frames (~0.5s): `0.92^30 ≈ 8%` of the original push remains

The particle has almost fully returned to its drift path within half a second. Increase
0.92 (less friction, slower return), decrease it (more friction, faster return).

### Draw function

```js
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvasParticles.forEach(function (p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + p.hue + ', 70%, 65%, ' + p.alpha + ')';
    ctx.fill();
  });

  if (mouse.onCanvas) {
    const grad = ctx.createRadialGradient(
      mouse.x, mouse.y, 0,
      mouse.x, mouse.y, INFLUENCE_RADIUS
    );
    grad.addColorStop(0,   'rgba(78, 205, 196, 0.12)');
    grad.addColorStop(1,   'rgba(78, 205, 196, 0)');
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, INFLUENCE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}
```

`ctx.clearRect(0, 0, canvas.width, canvas.height)` — erases everything from the canvas
before drawing the next frame. Without this, each frame's drawing would layer on top of
the previous one and every particle would leave a trail.

`ctx.beginPath()` — starts a new path. Every `arc`, `lineTo`, etc. adds to the current
path. Calling `beginPath()` first ensures this circle does not connect to whatever was
drawn last. Without it, you'd see unexpected lines connecting circles.

`ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)` — draws a full circle. Parameters:
`(x, y)` centre, `radius`, `startAngle` (0 = 3 o'clock), `endAngle` (Math.PI * 2 = full
circle). The circle is added to the path but not yet drawn.

`ctx.fillStyle = 'hsla(...)' ; ctx.fill()` — sets the fill colour then paints it. The
`hsla` format is `hsla(hue, saturation%, lightness%, alpha)`. Hue is 0–360 (degrees on
a colour wheel). Alpha is 0–1. The per-particle `hue` and `alpha` make each particle
slightly different.

`createRadialGradient(x1, y1, r1, x2, y2, r2)` creates a gradient between two circles.
Inner circle: centre `(mouse.x, mouse.y)`, radius `0` (a point). Outer circle: same
centre, radius `INFLUENCE_RADIUS`. `addColorStop(0, ...)` sets the colour at the inner
circle; `addColorStop(1, ...)` at the outer. Teal fading to transparent — a soft glow.

### Animation loop

```js
function animateParticles() {
  updateParticles();
  drawParticles();
  requestAnimationFrame(animateParticles);
}

animateParticles();
```

Update physics, draw the result, schedule the next frame. The Three.js hero loop and
the canvas particle loop run as separate RAF chains — they don't interfere. The browser
calls both approximately 60 times per second.

---

> **SAVE AND TRY**
>
> **You should see:** The Canvas section is filled with drifting teal particles. Move your
> cursor over the canvas — particles scatter away from the cursor and a soft glow ring
> shows the influence radius. Move the cursor off the section — particles settle back to
> their drift pattern. Scroll away and back — particles are still moving (the RAF loop
> never paused — we'll optimise that in LAB-34).

---

## 🎯 Challenge: Click to Burst

**You know:** Mouse events, velocity, push force logic.

**Task:** On `click` inside the canvas section, burst every particle outward from the
click point with 3× the normal push strength:

```js
canvasSection.addEventListener('click', function (e) {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  canvasParticles.forEach(function (p) {
    const dx   = p.x - cx;
    const dy   = p.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const force = (PUSH_STRENGTH * 3) * (1 - Math.min(dist, 400) / 400);
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }
  });
});
```

`Math.min(dist, 400)` caps the distance used in the falloff at 400px — particles beyond
400px still receive a small nudge rather than zero. Without the cap, the denominator
grows large and very distant particles get essentially no force, making the burst look
localised. The cap spreads the effect across the whole canvas.

---

## Final Check

| Feature | How to verify |
|---|---|
| Particles fill section | Canvas section shows drifting teal particles |
| Mouse push | Move cursor over canvas — particles scatter |
| Glow ring | Soft teal circle follows cursor |
| Cursor leaves | Particles resume drift when mouse exits section |
| Canvas scoped | Particles do not appear outside the Canvas section |

---

## Quick Check Answers

**1. Two CSS properties to keep an absolute canvas inside a section:**
`position: relative` on the section creates a positioning context — absolutely positioned
children are placed relative to this element, not the page. `overflow: hidden` clips
anything that extends outside the section's boundaries.

**2. `canvasSection.clientWidth` instead of `window.innerWidth`:**
`clientWidth` / `clientHeight` give the inner pixel dimensions of a specific element.
`window.innerWidth` gives the browser window width — which happens to be the same as the
section width for full-width sections, but `clientHeight` would be wrong (the section
starts halfway down the page). Using the section's own properties is always correct and
makes the code work even if the section width ever changes (e.g., if a sidebar is added).

**3. Why recalculate mouse position relative to canvas:**
`e.clientX` / `e.clientY` are measured from the top-left corner of the viewport. The
canvas starts at some offset from that corner. Subtracting `rect.left` and `rect.top`
(from `getBoundingClientRect()`) converts to canvas-local coordinates, where `(0, 0)` is
the canvas's own top-left corner. Canvas drawing coordinates always start at `(0, 0)` for
the top-left of the canvas — not the top-left of the page.
