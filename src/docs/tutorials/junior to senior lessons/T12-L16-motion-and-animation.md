# Junior to Senior — T12·L16 — Motion and Animation

**Prerequisites:** T12·L15 (Accessibility). You know `prefers-reduced-motion`.
This lesson teaches CSS animation — the `@keyframes` syntax, timing functions,
and the principle that animation should serve a purpose, not decorate.

**What this lab adds:**
- `@keyframes` — defining multi-step animation sequences
- `animation` shorthand and its eight sub-properties
- Timing functions: `ease`, `ease-in-out`, `cubic-bezier`, `steps()`
- `transform` — the properties you should animate for performance
- What composite layers are and why `transform` and `opacity` are GPU-accelerated
- `transition` revisited — A→B vs multi-step `@keyframes`
- Purposeful animation: feedback, state, attention — not decoration

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A developer wants to animate a box from `left: 0` to `left: 300px` using CSS
>    transitions. A second developer suggests using `transform: translateX(300px)` instead.
>    The visual result is the same. Why is the second approach better?
> 2. `animation-fill-mode: forwards` — what does it change about the element after
>    the animation completes?
> 3. `steps(4)` timing function. An animation runs for 0.4s. What does the element
>    look like at 0.1s, 0.2s, 0.3s?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

Animation can make an interface feel alive and communicative. It can also make it feel
slow, nauseating, and unprofessional. The difference is whether animation has a purpose
or exists for its own sake.

Good animation:
- Communicates state (a button shrinks on press → "this registered")
- Guides attention (a notification slides in → "something happened")
- Provides context (a list item slides out when deleted → "this is gone, not hidden")

Bad animation:
- Everything fades in on page load (this is delay, not design)
- Hover effects that take 0.5s (every hover feels like wading through mud)
- Spinning decorations on a loading screen with no functional purpose

This lesson teaches you to do the first category.

---

## Step 1 — `@keyframes` Syntax

Create `animation.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animation</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem; --space-5: 1.5rem;
    }

    body { font-family: system-ui, sans-serif; max-width: 700px; margin: 60px auto; padding: 0 var(--space-4); }

    /* A simple keyframe: */
    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* A multi-step keyframe: */
    @keyframes bounce {
      0%   { transform: translateY(0); }
      50%  { transform: translateY(-20px); }
      100% { transform: translateY(0); }
    }

    .demo-box {
      width: 80px;
      height: 80px;
      background: cornflowerblue;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
    }

    .box-fade-in {
      animation: fade-in 1s ease;
    }

    .box-bounce {
      animation: bounce 0.6s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <h2>@keyframes demos:</h2>

  <div style="display: flex; gap: var(--space-5); align-items: center; padding: var(--space-5); background: #f5f5f5; border-radius: 8px;">
    <div>
      <p style="font-size: 0.875rem; color: #666; margin: 0 0 var(--space-2);">fade-in</p>
      <div class="demo-box box-fade-in">A</div>
    </div>

    <div>
      <p style="font-size: 0.875rem; color: #666; margin: 0 0 var(--space-2);">bounce</p>
      <div class="demo-box box-bounce">B</div>
    </div>
  </div>
</body>
</html>
```

### CSS AND SEE

**You should see:** Box A fades in when the page loads. Box B bounces continuously.

**Change something:** Remove `infinite` from `.box-bounce`'s animation.

**Expected:** The bounce runs once and stops. The box returns to its starting position.

---

## Concept: The `animation` Shorthand

**What it is:** The `animation` property is shorthand for eight sub-properties:

```css
animation: name duration timing-function delay iteration-count direction fill-mode play-state;

/* Example: */
animation: bounce 0.6s ease-in-out 0s 3 normal forwards running;
```

**The eight sub-properties:**

| Property | Values | Default | Meaning |
|---|---|---|---|
| `animation-name` | keyframe name | `none` | Which `@keyframes` to use |
| `animation-duration` | time (`0.3s`, `300ms`) | `0s` | How long one cycle takes |
| `animation-timing-function` | `ease`, `linear`, etc. | `ease` | Easing curve |
| `animation-delay` | time | `0s` | Wait before starting |
| `animation-iteration-count` | number or `infinite` | `1` | How many times to play |
| `animation-direction` | `normal`, `reverse`, `alternate` | `normal` | Playback direction |
| `animation-fill-mode` | `none`, `forwards`, `backwards`, `both` | `none` | State before/after animation |
| `animation-play-state` | `running`, `paused` | `running` | Can pause/resume |

**`animation-fill-mode` — the most-missed property:**

- `none` (default): after animation, element returns to its pre-animation state
- `forwards`: after animation, element STAYS in the final keyframe state
- `backwards`: before animation (during delay), element starts at the first keyframe state
- `both`: combines both

```css
/* Without forwards: element fades in, then jumps back to opacity: 0 */
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.item { animation: fade-in 0.3s ease; }

/* With forwards: element fades in and stays visible */
.item { animation: fade-in 0.3s ease forwards; }
```

Almost every entrance animation needs `fill-mode: forwards` — otherwise the element
disappears after animating in.

**`animation-direction: alternate`:**

Bouncing without reversing the keyframe:
```css
@keyframes move { from { transform: translateX(0); } to { transform: translateX(100px); } }
.item { animation: move 0.5s ease-in-out infinite alternate; }
```

`alternate` plays the animation forward, then backward, creating a continuous back-and-forth.

---

## Step 2 — Practical Fill Mode

Add:

```html
<h2 style="margin-top: var(--space-5);">fill-mode: forwards — element stays after animation:</h2>  <!-- ← add -->

<div style="display: flex; gap: var(--space-5); padding: var(--space-5); background: #f5f5f5; border-radius: 8px;">
  <div>
    <p style="font-size: 0.875rem; color: #666; margin: 0 0 var(--space-2);">No fill-mode (returns to start)</p>
    <div class="demo-box" style="animation: fade-in 1s ease 0.5s;">A</div>
  </div>
  <div>
    <p style="font-size: 0.875rem; color: #666; margin: 0 0 var(--space-2);">fill-mode: forwards (stays visible)</p>
    <div class="demo-box" style="animation: fade-in 1s ease 0.5s forwards;">B</div>
  </div>
  <div>
    <p style="font-size: 0.875rem; color: #666; margin: 0 0 var(--space-2);">fill-mode: both (starts hidden)</p>
    <div class="demo-box" style="animation: fade-in 1s ease 0.5s both;">C</div>
  </div>
</div>
```

### CSS AND SEE

Refresh the page.

**You should see:**
- Box A: fades in, then immediately becomes fully visible (no fill-mode, no delay visible in result)
- Box B: fades in after 0.5s delay and stays visible (`forwards`)
- Box C: is invisible for 0.5s (the delay), then fades in and stays visible (`both` — starts at `from` state during delay)

---

## Concept: `transform` — Why You Should Animate This, Not `left`/`top`/`margin`

**What it is:** `transform` applies visual transformations — translate, rotate, scale,
skew — WITHOUT changing the element's position in the layout.

**The four transform functions:**

```css
transform: translateX(100px);    /* move 100px right — does NOT affect layout */
transform: translateY(-20px);    /* move 20px up */
transform: rotate(45deg);        /* rotate clockwise */
transform: scale(1.2);           /* enlarge 20% */

/* Combined: */
transform: translateX(100px) rotate(45deg) scale(0.8);
```

**Why `transform` for animation, not `left`/`margin`/`top`:**

When you animate `left: 100px`, the browser triggers the LAYOUT stage of rendering
(recalculates positions of other elements) on every frame — potentially 60 times per second.
This is expensive.

When you animate `transform: translateX(100px)`, the browser can promote the element to
a **composite layer** — handled entirely by the GPU. The LAYOUT and PAINT stages do not
run. The animation runs at 60fps even under heavy CPU load.

**The two properties that are always GPU-composited:**
- `transform`
- `opacity`

**Everything else causes layout or paint:**
- `width`, `height`, `margin`, `padding` → layout recalculation
- `background-color`, `color`, `box-shadow` → paint operation (not layout, but still CPU)
- `left`, `top`, `right`, `bottom` on positioned elements → layout recalculation

**The rule for smooth animations:** If possible, animate only `transform` and `opacity`.

**What `transform` hides:** The complexity of 2D and 3D matrix math. `translateX(100px)`
is equivalent to `matrix(1, 0, 0, 1, 100, 0)`. The GPU applies this as a matrix
multiplication, which it is extremely fast at.

**You will see this again in:**
- React animation libraries: Framer Motion defaults to using `transform` and `opacity`
  for exactly this reason
- CSS `will-change: transform` — a hint to the browser to pre-promote an element to a
  composite layer before the animation starts, preventing a frame of janking on start

---

## Step 3 — Performance-Correct Animation

Add a comparison:

```html
<h2 style="margin-top: var(--space-5);">Performance: transform vs left:</h2>  <!-- ← add -->

<style>
  @keyframes slide-left-wrong  { from { left: 0; } to { left: 300px; } }
  @keyframes slide-left-right  { from { transform: translateX(0); } to { transform: translateX(300px); } }

  .mover { width: 60px; height: 60px; border-radius: 6px; color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; }

  .mover-wrong {
    background: #e63946;
    position: relative;           /* required for left to work */
    animation: slide-left-wrong 1.5s ease-in-out infinite alternate;
  }

  .mover-right {
    background: #27ae60;
    animation: slide-left-right 1.5s ease-in-out infinite alternate;
  }
</style>

<div style="padding: var(--space-5); background: #f5f5f5; border-radius: 8px; overflow: hidden;">
  <p style="font-size: 0.875rem; color: #e63946; margin: 0 0 var(--space-2);">Animating `left` (causes layout):</p>
  <div class="mover mover-wrong">!</div>

  <p style="font-size: 0.875rem; color: #27ae60; margin: var(--space-4) 0 var(--space-2);">Animating `transform` (GPU composited):</p>
  <div class="mover mover-right">✓</div>
</div>
```

### CSS AND SEE

Both boxes slide back and forth. They look identical. In DevTools (Performance tab →
Record → watch the timeline), the `left` animation triggers layout recalculations;
`transform` does not. On a simple page you cannot see the difference. On a complex page
with many elements, `left` causes jank; `transform` stays smooth.

---

## Concept: Purposeful Animation — The Five Roles

**The rule:** Every animation must serve one of five communicative purposes.
If it does not fit any of these, cut it.

| Role | Example | CSS technique |
|---|---|---|
| **Feedback** | Button shrinks on press, bounces on error | `transform: scale` |
| **State change** | Toggle slides from off to on | `transform: translateX`, `transition` |
| **Attention** | Notification badge pulses once | `@keyframes` with `animation-count: 1` |
| **Continuity** | Item slides out when deleted | `transition` on `max-height` or `opacity` |
| **Loading** | Spinner while processing | `@keyframes spin` |

**What does NOT belong:**

- Page-load fade-ins on every element (causes delay, provides no information)
- Hover wiggle effects (decorative, adds noise)
- Parallax scrolling on background images (vestibular trigger, rarely meaningful)
- Hero section text that types out letter by letter (delay before the user can read)

**The 100ms rule for feedback:** State change feedback must be visible within 100ms or
the user perceives the system as unresponsive. A button that takes 300ms to visually
respond to a click feels broken.

---

## Step 4 — Purposeful Animations

Add a notification toast and a delete animation:

```html
<h2 style="margin-top: var(--space-5);">Purposeful animations:</h2>  <!-- ← add -->

<style>
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes toast-out {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-8px); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60%  { transform: translateX(-6px); }
    40%, 80%  { transform: translateX(6px); }
  }
  @keyframes pulse-once {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.15); }
  }

  .toast {
    background: #1a1a2e;
    color: white;
    padding: var(--space-2) var(--space-4);
    border-radius: 6px;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    animation: toast-in 0.2s ease forwards;
  }

  .btn-error {
    animation: shake 0.4s ease;
  }

  .badge-pulse {
    animation: pulse-once 0.3s ease;
  }

  /* Motion guard: */
  @media (prefers-reduced-motion: reduce) {
    .toast, .btn-error, .badge-pulse { animation: none; }
  }
</style>

<div style="display: flex; flex-direction: column; gap: var(--space-4); padding: var(--space-4); background: #f5f5f5; border-radius: 8px;">
  <div>
    <p style="font-size: 0.875rem; color: #666; margin: 0 0 var(--space-2);">Toast notification (attention — slides in once):</p>
    <div class="toast">✓ Job completed in 2.3s</div>
  </div>

  <div>
    <p style="font-size: 0.875rem; color: #666; margin: 0 0 var(--space-2);">Error button (feedback — shake on wrong input):</p>
    <button style="
      padding: var(--space-2) var(--space-4);
      background: #e63946; color: white; border: none; border-radius: 6px; cursor: pointer;
      font-weight: 600;
    " onclick="this.classList.remove('btn-error'); void this.offsetWidth; this.classList.add('btn-error');">
      Wrong input — click me
    </button>
  </div>
</div>
```

### CSS AND SEE

**You should see:**
- The toast slides up and fades in once — attention
- Clicking the error button shakes it — feedback (the `onclick` removes and re-adds the class
  so the animation plays each time)

Enable `prefers-reduced-motion: reduce` in DevTools — both animations stop. The toast
appears instantly; the button still responds to clicks but with no shake.

---

## 🎯 Challenge: Build an Animated Progress Bar

**Task:** A progress bar that:
1. Starts at 0%
2. Animates to the target value smoothly over 1 second
3. Has a shimmer/pulse effect while loading (uses `@keyframes`)
4. On complete (100%), changes colour from blue to green with a transition
5. All animations guarded with `prefers-reduced-motion`

Use CSS custom properties to accept the target percentage (`--progress: 67`).

---

<details>
<summary>▶ Show Solution</summary>

```html
<style>
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes grow-bar {
    from { width: 0%; }
    to   { width: var(--progress, 0%); }
  }

  .progress-container {
    background: #eee;
    border-radius: 99px;
    height: 10px;
    overflow: hidden;
  }

  .progress-bar {
    --progress: 67%;
    height: 100%;
    width: var(--progress);
    background: cornflowerblue;
    border-radius: 99px;
    animation: grow-bar 1s ease-out forwards;
    transition: background-color 0.3s ease;

    /* Shimmer effect: */
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,0.4) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: grow-bar 1s ease-out forwards, shimmer 1.5s linear infinite;
  }

  /* Complete state — change to green: */
  .progress-bar[data-complete="true"] {
    background: #27ae60;
    animation: shimmer 0s;   /* stop shimmer */
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-bar { animation: none; }
  }
</style>

<div style="padding: var(--space-4); background: #f5f5f5; border-radius: 8px;">
  <p style="font-size: 0.875rem; color: #666; margin: 0 0 var(--space-2);">In progress (67%):</p>
  <div class="progress-container">
    <div class="progress-bar" style="--progress: 67%"></div>
  </div>

  <p style="font-size: 0.875rem; color: #666; margin: var(--space-4) 0 var(--space-2);">Complete (100%):</p>
  <div class="progress-container">
    <div class="progress-bar" style="--progress: 100%" data-complete="true"></div>
  </div>
</div>
```

**Key insight:** `animation: grow-bar 1s ease-out forwards, shimmer 1.5s linear infinite`
runs two animations simultaneously — the bar grows to its target width once, and the
shimmer loops continuously. The `forwards` fill-mode keeps the bar at `--progress` width
after the grow animation completes.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `fill-mode: forwards` | Box without it disappears after animation; with it, stays |
| `transform` vs `left` | Both slide; `transform` is GPU-composited (verifiable via DevTools Performance) |
| Multi-step `@keyframes` | Bounce: 0% → -20px → 0% — three keyframes |
| `animation-direction: alternate` | Back-and-forth without duplicate keyframe |
| Toast entrance | Slides up and fades in, then stays (purposeful: attention) |
| Shake feedback | Button shakes on click (purposeful: error feedback) |
| Motion guard | DevTools reduce → all animations stop; functionality works |

---

## Quick Check Answers

**1. `left: 300px` vs `transform: translateX(300px)`. Why is transform better?**

Both produce the same visual result, but the rendering pipeline cost is different.
Animating `left` triggers the LAYOUT stage on every frame — the browser recalculates
the positions of surrounding elements. This is CPU work done 60 times per second.
Animating `transform: translateX` triggers only the COMPOSITE stage — the element is
promoted to a GPU layer and the transformation is applied as a matrix multiplication
by the GPU. No layout or paint occurs. The animation runs on the GPU at 60fps even
when the CPU is busy. On complex pages, this difference is noticeable.

**2. `animation-fill-mode: forwards`. What changes after the animation?**

Without `forwards`: after the last keyframe runs, the element returns to its pre-animation
style values (the values it would have without any animation). A fade-in animation's element
would appear, then jump back to `opacity: 0` when done.

With `forwards`: the element STAYS in the state defined by the last keyframe. A fade-in
to `opacity: 1` leaves the element at `opacity: 1`. For entrance animations that should
leave the element visible, `forwards` is almost always required.

**3. `steps(4)` timing. 0.4s duration. State at 0.1s, 0.2s, 0.3s?**

`steps(4)` divides the animation into 4 equal discrete jumps (not smooth interpolation).
At 0.1s (step 1 complete): element snaps to 25% of the way through the animation.
At 0.2s (step 2 complete): element snaps to 50%.
At 0.3s (step 3 complete): element snaps to 75%.
At 0.4s (step 4 complete): element snaps to 100%.

Between steps, the element does not move — it jumps. `steps()` is used for sprite sheet
animations (flipbook animation where each step shows a different frame) and for
typewriter effects where each step types one character.
