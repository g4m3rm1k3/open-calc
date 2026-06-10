# Creative Web Masterclass — LAB 13 — Scroll Parallax: Two Layers at Different Speeds

**Prerequisites:** LAB-12. You know IntersectionObserver, requestAnimationFrame, and CSS transforms.

**What this lab adds:**
- `window.scrollY` — reading the current scroll position
- Parallax: moving elements at different scroll speeds to create depth
- `requestAnimationFrame` + scroll — a safe pattern for smooth updates
- `will-change: transform` — a performance hint to the browser

**Time:** 40–55 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  ●   ●     ●          ●      ●      (slow layer)     │
 │                                                      │
 │  HERO TEXT  — scrolls at normal speed                │
 │                                                      │
 │   ●   ●          ●         ●        (fast layer)     │
 └──────────────────────────────────────────────────────┘
     As you scroll, the dot layers move at different
     speeds, creating a sense of depth behind the text.
```

---

> **Quick Check — answer before reading further:**
>
> 1. When you scroll a page down 100px, every element moves up 100px relative to the screen.
>    What would it look like if a background element only moved 30px up for that same 100px
>    scroll? What visual effect does that create?
> 2. `window.scrollY` gives you the scroll position. What is its value when the page is at the
>    top? What happens to it as you scroll down?
> 3. You want to animate a background on scroll. Should you update it inside the `scroll` event
>    handler, or inside a `requestAnimationFrame` loop? Why?
>
> *(Answers at the end)*

---

## Concept: `window.scrollY` and Scroll Position

**What it is:** `window.scrollY` is a number representing how many pixels the document
has been scrolled vertically from the top. At the top of the page, `window.scrollY === 0`.
As you scroll down, it increases.

**Canonical example:**

```js
window.addEventListener('scroll', function () {
  console.log(window.scrollY);   // 0 at top, increases as you scroll down
});
```

**What it hides:** The scrolling mechanism, page layout reflow, and the browser's internal
scroll position tracking. You read a single number and it is always current.

**Project Application:**
The portfolio hero (LAB-30) uses `window.scrollY` to fade out the hero content as the user
scrolls away from it. The ribbon nav (LAB-29) uses it to decide which section is "active."

**Watch for:** `window.scrollY` can only be read — you cannot write to it directly to scroll
the page. To programmatically scroll, use `window.scrollTo()` or `element.scrollIntoView()`.

---

## Concept: Parallax — Speed-Scaled Translation

**What it is:** Parallax is the visual effect where objects at different distances move by
different amounts when you move. A mountain far away seems to move slowly while a nearby tree
moves quickly. In web parallax, you simulate this by translating elements by different fractions
of the scroll distance.

**The math:**

```
Normal scroll: element moves -scrollY pixels (up by 100% of the scroll)
Slow layer:    element moves -scrollY * 0.3 (up by 30% of the scroll — appears farther away)
Fast layer:    element moves -scrollY * 0.6 (up by 60% of the scroll — appears closer)
```

```js
// scrollY = 200 (user has scrolled 200px down)
slowLayer.style.transform = 'translateY(' + (-scrollY * 0.3) + 'px)';  // moves up 60px
fastLayer.style.transform = 'translateY(' + (-scrollY * 0.6) + 'px)';  // moves up 120px
```

The layer that moves *less* feels like it is farther away — it barely reacts to scrolling.
The layer that moves *more* feels closer — it reacts strongly to scrolling.

**Watch for:** This only works visually when the parallax layers are in a container with
`overflow: hidden`. Otherwise the slow layer slides out of the frame and looks wrong.

---

## Concept: Scroll + requestAnimationFrame

**What it is:** The `scroll` event fires very frequently. Reading `window.scrollY` there is
fine, but updating DOM properties (like `style.transform`) directly in the scroll handler
can force layout recalculation mid-scroll, causing jank. The safe pattern: record the scroll
value in the event, apply it in `requestAnimationFrame`.

**The problem:**

```js
// Dangerous — DOM write inside scroll event
window.addEventListener('scroll', function () {
  element.style.transform = 'translateY(' + (-scrollY * 0.3) + 'px)';
});
```

`scroll` can fire multiple times between frames. Each write to `style.transform` may force
a layout recalculation, even if nothing will be painted yet.

**The solution:**

```js
let currentScrollY = 0;    // stores the latest scroll value
let ticking = false;       // prevents scheduling multiple RAF calls per scroll burst

window.addEventListener('scroll', function () {
  currentScrollY = window.scrollY;   // just record the value — no DOM writes here
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;           // prevent scheduling another RAF until this one runs
  }
});

function updateParallax() {
  slowLayer.style.transform = 'translateY(' + (-currentScrollY * 0.3) + 'px)';
  fastLayer.style.transform = 'translateY(' + (-currentScrollY * 0.6) + 'px)';
  ticking = false;            // ready for the next scroll burst
}
```

The `ticking` flag ensures you never schedule more than one `requestAnimationFrame` per
frame. The scroll handler only records the value. All DOM writes happen in the RAF callback,
safely synchronized with the browser's repaint.

**Watch for:** Some tutorials skip the `ticking` flag and call `requestAnimationFrame` on
every scroll event. That works visually but schedules redundant RAF calls. The flag is a
good habit.

---

## Concept: `will-change: transform`

**What it is:** The CSS property `will-change: transform` is a hint to the browser: "this
element's `transform` will change frequently." The browser can promote it to its own
compositor layer, so transform updates happen on the GPU thread and do not require main-thread
layout recalculation.

```css
.parallax-layer {
  will-change: transform;   /* promotes to GPU layer — cheap transform updates */
}
```

**What it hides:** GPU layer promotion, compositor thread scheduling, layer memory
allocation.

**Watch for:** Do not use `will-change` on every element — each promoted layer uses GPU
memory. Use it only for elements that actually animate continuously (parallax layers,
Three.js canvases, fixed overlays). More than ~10–15 promoted layers on one page wastes
memory.

---

## Step 1 — Create Files

`projects/lab-13/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 13 — Scroll Parallax</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <!-- Hero section with parallax layers inside it -->
    <section class="hero">

      <!-- Two dot layers — same HTML structure, different CSS and parallax speed -->
      <div class="parallax-layer layer-slow" id="layer-slow">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>

      <div class="parallax-layer layer-fast" id="layer-fast">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>

      <!-- Hero text — sits on top of the layers -->
      <div class="hero-content">
        <h1 class="hero-title">Scroll Parallax</h1>
        <p class="hero-sub">Two background layers. One scroll. Different speeds.</p>
      </div>

    </section>

    <!-- Content below so there is something to scroll toward -->
    <section class="content-section">
      <h2>Below the Hero</h2>
      <p>Scroll up to see the parallax layers move at different speeds.</p>
    </section>

    <script src="main.js"></script>
  </body>
</html>
```

---

> **CSS AND SEE**
>
> Open with Live Server.
>
> **You should see:** Unstyled text. The dots are inline `<span>` elements — they will look
> like bullet characters. No parallax yet.

---

## Step 2 — Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
:root {
  --color-primary: #6c63ff;
  --color-accent: #ff6b6b;
  --color-bg: #0d0d1a;
  --color-surface: #161628;
  --color-border: #2a2a4a;
  --color-text: #e8e8f0;
  --color-muted: #7070a0;
}

body { margin: 0; font-family: system-ui, sans-serif; background: var(--color-bg); color: var(--color-text); }

/* ---- Hero: the parallax container ---- */
.hero {
  position: relative;      /* layers inside will position relative to this */
  height: 100vh;           /* full viewport height — gives space to scroll through */
  overflow: hidden;        /* clip layers as they move out of frame */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- Parallax layers ---- */
.parallax-layer {
  position: absolute;      /* pulled out of flow — sits inside .hero */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;  /* hint: this will animate frequently */
}

/* ---- Dot positioning: spread dots across the layer ---- */
.dot {
  position: absolute;
  border-radius: 50%;
}

/* Slow layer dots — large, dim, far away feeling */
.layer-slow .dot:nth-child(1)  { width: 80px;  height: 80px;  top: 15%;  left: 10%;  background: rgba(108, 99, 255, 0.15); }
.layer-slow .dot:nth-child(2)  { width: 60px;  height: 60px;  top: 60%;  left: 75%;  background: rgba(108, 99, 255, 0.12); }
.layer-slow .dot:nth-child(3)  { width: 120px; height: 120px; top: 30%;  left: 55%;  background: rgba(108, 99, 255, 0.08); }
.layer-slow .dot:nth-child(4)  { width: 40px;  height: 40px;  top: 75%;  left: 30%;  background: rgba(108, 99, 255, 0.18); }
.layer-slow .dot:nth-child(5)  { width: 90px;  height: 90px;  top: 50%;  left: 85%;  background: rgba(108, 99, 255, 0.10); }

/* Fast layer dots — smaller, brighter, closer feeling */
.layer-fast .dot:nth-child(1)  { width: 20px;  height: 20px;  top: 25%;  left: 20%;  background: rgba(255, 107, 107, 0.5); }
.layer-fast .dot:nth-child(2)  { width: 14px;  height: 14px;  top: 70%;  left: 60%;  background: rgba(255, 107, 107, 0.6); }
.layer-fast .dot:nth-child(3)  { width: 10px;  height: 10px;  top: 45%;  left: 40%;  background: rgba(255, 107, 107, 0.4); }
.layer-fast .dot:nth-child(4)  { width: 18px;  height: 18px;  top: 20%;  left: 80%;  background: rgba(255, 107, 107, 0.55); }
.layer-fast .dot:nth-child(5)  { width: 12px;  height: 12px;  top: 80%;  left: 15%;  background: rgba(255, 107, 107, 0.45); }

/* ---- Hero text: sits above layers using z-index ---- */
.hero-content {
  position: relative;      /* z-index only works on positioned elements */
  z-index: 10;             /* render above the parallax layers (z-index 0) */
  text-align: center;
}

.hero-title {
  font-size: clamp(2.5rem, 7vw, 5rem);
  margin: 0 0 16px 0;
  color: var(--color-text);
}

.hero-sub { color: var(--color-muted); margin: 0; font-size: 1.1rem; }

/* ---- Content section below the hero ---- */
.content-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 120px 24px;
  text-align: center;
}

.content-section h2 { color: var(--color-primary); margin-bottom: 12px; }
.content-section p { color: var(--color-muted); line-height: 1.6; }
```

The layout rests on two CSS rules:
- `.hero { position: relative; overflow: hidden }` — makes it a clipping container for
  the absolute layers.
- `.parallax-layer { position: absolute; will-change: transform }` — takes each layer
  out of flow so they stack on top of each other. JavaScript will move them via `transform`.

The hero text gets `position: relative; z-index: 10` so it renders above the layers.

---

> **CSS AND SEE**
>
> **You should see:** A dark full-viewport hero with large dim purple circles (slow layer)
> and small bright red dots (fast layer) scattered across it. The text "Scroll Parallax"
> is centered. Below the hero is a short content section. Scroll — nothing moves yet.

---

## Step 3 — Add the Parallax Scroll Logic

`main.js`:

```js
const slowLayer = document.querySelector('#layer-slow');
const fastLayer = document.querySelector('#layer-fast');

let currentScrollY = 0;   // scroll value recorded in the event handler
let ticking = false;      // prevents scheduling multiple RAF calls per scroll burst

// Called by requestAnimationFrame — safe to write to DOM here
function updateParallax() {
  // Multiply scrollY by different fractions for each layer
  // Negative because scrolling down moves the layers UP
  const slowY = -(currentScrollY * 0.3);   // 30% of scroll — appears far away
  const fastY = -(currentScrollY * 0.6);   // 60% of scroll — appears close

  slowLayer.style.transform = 'translateY(' + slowY + 'px)';
  fastLayer.style.transform = 'translateY(' + fastY + 'px)';

  ticking = false;   // ready for the next scroll event burst
}

// Record scroll value — do not write to DOM here
window.addEventListener('scroll', function () {
  currentScrollY = window.scrollY;

  // Only schedule one RAF per frame, even if scroll fires many times
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
});
```

The scroll handler does one thing: save `window.scrollY` into `currentScrollY` and schedule
a single RAF. The RAF callback does all the DOM writing. The `ticking` flag prevents
scheduling a new RAF while one is already scheduled.

---

> **SAVE AND TRY**
>
> **You should see:** As you scroll down, the slow layer (dim purple circles) moves up gently
> — about 30% of your scroll distance. The fast layer (red dots) moves up more quickly —
> 60% of scroll distance. The hero text scrolls at normal speed. The visual effect is a
> sense of depth: the large circles feel far away, the small dots feel close.
>
> **Change something:** Change `* 0.3` to `* 0.1` for the slow layer. Reload and scroll.
> The slow layer barely moves — it looks like it is painted on a wall very far away. Change
> back to `* 0.3`.
>
> **In DevTools Console:**
> ```js
> window.scrollY   // check current scroll position
> ```
> Scroll halfway down — run again. The number is roughly half the page height.

---

## Step 4 — Add Smooth Lerp (Optional Enhancement)

Right now the layers jump to their target position instantly. Adding **linear interpolation
(lerp)** makes them ease toward the target smoothly — like a rubber band.

Lerp formula: `current = current + (target - current) * factor`

Each frame, move 10% of the remaining distance toward the target. If `target = 300` and
`current = 0`, the positions are: 30, 57, 81.3, 103.2... — it approaches 300 asymptotically,
fast at first then easing.

Update `main.js`:

```js
const slowLayer = document.querySelector('#layer-slow');
const fastLayer = document.querySelector('#layer-fast');

let targetScrollY = 0;      // the actual scroll position
let smoothScrollY = 0;      // the interpolated (eased) position

const LERP_FACTOR = 0.08;   // 8% of the gap per frame — controls smoothness

function updateParallax() {
  // Move smoothScrollY toward targetScrollY by 8% of the remaining distance
  smoothScrollY = smoothScrollY + (targetScrollY - smoothScrollY) * LERP_FACTOR;

  const slowY = -(smoothScrollY * 0.3);
  const fastY = -(smoothScrollY * 0.6);

  slowLayer.style.transform = 'translateY(' + slowY + 'px)';
  fastLayer.style.transform = 'translateY(' + fastY + 'px)';

  // Keep the loop running so lerp continues even after scrolling stops
  requestAnimationFrame(updateParallax);
}

window.addEventListener('scroll', function () {
  targetScrollY = window.scrollY;   // just update the target
});

// Start the animation loop — runs continuously unlike the ticking version
requestAnimationFrame(updateParallax);
```

This switches from the ticking pattern to a continuous `requestAnimationFrame` loop — because
lerp needs to keep running even after scrolling stops (to finish the easing). The scroll
handler only updates `targetScrollY`. The loop runs every frame, easing `smoothScrollY`
toward `targetScrollY`.

---

> **SAVE AND TRY**
>
> **You should see:** The same parallax effect, but now the layers ease smoothly instead of
> jumping instantly. When you stop scrolling, the layers settle into position with a gentle
> deceleration.
>
> **Change something:** Change `LERP_FACTOR` from `0.08` to `0.25`. The easing is much
> faster — the layers almost keep up with your scroll. Change to `0.03` — very slow and
> dreamy. Change back to `0.08`.

---

## 🎯 Challenge: Parallax Hero Text Fade

**You know:** `window.scrollY`, parallax multipliers, `requestAnimationFrame`, CSS transitions.

**Task:** Make the hero text fade out as you scroll down. When `scrollY = 0`, the text is
fully opaque. When `scrollY = window.innerHeight * 0.5` (half a viewport scrolled), the text
is fully transparent (`opacity: 0`).

**Formula hint:** `opacity = 1 - (scrollY / (window.innerHeight * 0.5))`
Use `Math.max(0, ...)` to clamp the result so it never goes below zero.

**Hint:** Select `.hero-content` and set its `opacity` in the `updateParallax` function.

---

<details>
<summary>▶ Show Solution</summary>

In `main.js`, add after selecting `slowLayer` and `fastLayer`:
```js
const heroContent = document.querySelector('.hero-content');
const FADE_DISTANCE = window.innerHeight * 0.5;   // fade out over half a viewport
```

In `updateParallax`, add:
```js
const opacity = Math.max(0, 1 - smoothScrollY / FADE_DISTANCE);
heroContent.style.opacity = opacity;
```

**Key insight:** The formula `1 - (x / max)` maps a value from 0→max to 1→0. `Math.max(0,
...)` prevents it from going negative when scrollY exceeds the fade distance.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Slow layer moves at 30% of scroll | Scroll 100px — slow layer moves ~30px |
| Fast layer moves at 60% of scroll | Scroll 100px — fast layer moves ~60px |
| Layers clip at hero edges | Layer dots do not appear outside the hero box |
| Smooth lerp active | Layers ease into position — no instant jump |
| No jank on scroll | Motion is smooth — no stuttering |

---

## What's Next

LAB 14 introduces the Canvas 2D API — drawing shapes, lines, and paths directly on a
`<canvas>` element with JavaScript. This is the foundation for the particle system in
LAB-15 and LAB-16.

---

## Transfer Exercise

Game engines use the same lerp formula for camera following: the camera "chases" the player
by moving a fraction of the remaining distance each frame. In Unity this is
`Vector3.Lerp(current, target, Time.deltaTime * speed)`.

Explain how the `smoothScrollY + (targetScrollY - smoothScrollY) * LERP_FACTOR` formula
in this lab is equivalent to Unity's `Vector3.Lerp` camera follow. What does each variable
correspond to? What would happen if `LERP_FACTOR = 1.0`?

---

## Quick Check Answers

**1. What does it look like when a background element moves less than the scroll?**
The element appears to lag behind the page scroll. Objects that move less seem farther away
because parallax — the phenomenon where distant objects appear to move less when you move —
is a depth cue the brain uses to perceive 3D space. A background that barely moves looks like
it is far in the distance; a foreground element that moves a lot looks close.

**2. What is `window.scrollY` at the top? What happens as you scroll?**
At the top of the page, `window.scrollY === 0`. As you scroll down, it increases — it equals
the number of pixels scrolled from the top. If the page is 3000px tall and you have scrolled
to the bottom, `window.scrollY` is approximately `3000 - window.innerHeight`.

**3. Should you update the DOM in the scroll handler or in requestAnimationFrame?**
In `requestAnimationFrame`. The `scroll` event fires many times per second during fast
scrolling. Writing to the DOM in the scroll handler forces layout recalculations on every
event — potentially many per frame, even though only one will be painted. Recording the
scroll value in the handler and writing the DOM in RAF ensures exactly one write per paint
cycle, synchronized with the browser's repaint.
