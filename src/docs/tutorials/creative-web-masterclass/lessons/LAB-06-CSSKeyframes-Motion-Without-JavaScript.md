# Creative Web Masterclass — LAB 06 — CSS Keyframe Animations: Motion Without JavaScript

**Prerequisites:** LAB-05. You know transitions, transform, easing, and custom properties.

**What this lab adds:**
- `@keyframes` — a named timeline of style snapshots
- The `animation` shorthand property — which keyframe, how long, how many times
- Entrance animations — elements that animate in when the page loads
- Loop animations — elements that move continuously without JavaScript

**Time:** 45–60 minutes

---

## What You Will Build

```
  Page loads → heading fades up into position (entrance animation)

  ┌──────────────────────────────────────┐
  │                                      │
  │    Hello.            ← fades in 0.6s │
  │                                      │
  │    ●                 ← floats up/down │
  │    ●                    continuously  │
  │    ●                                 │
  └──────────────────────────────────────┘
```

A heading that enters smoothly on page load, and three dots that float in staggered
loops — all CSS, no JavaScript.

---

> **Quick Check — answer before reading further:**
>
> 1. A CSS transition requires a *trigger* — a state change like `:hover`. What do you
>    think happens if you want an animation to play automatically without any trigger?
> 2. You want three identical dots to float, but each one starts at a different point in
>    its loop so they look staggered. What property do you think controls when an
>    animation starts?
> 3. If `animation-iteration-count: infinite` plays the animation forever, what happens
>    if you set it to `2`?
>
> *(Answers at the end)*

---

## Concept: `@keyframes`

**What it is:** `@keyframes` defines a named animation timeline — a list of style
snapshots at specific points in time, from `0%` (start) to `100%` (end).

**The problem before:**

CSS `transition` requires a trigger — it only animates when a value changes because of a
state change like `:hover` or a class swap. To animate something automatically on page load,
or loop it infinitely, transitions cannot help. You would need JavaScript to toggle a class
every N milliseconds to simulate looping — ugly and inefficient.

**The solution:**

```css
@keyframes float {
  0%   { transform: translateY(0px); }    /* start position */
  50%  { transform: translateY(-12px); }  /* peak of the float */
  100% { transform: translateY(0px); }    /* back to start */
}

.dot {
  animation: float 2s ease-in-out infinite; /* run "float" for 2s, loop forever */
}
```

**What it hides:** `@keyframes` hides the interpolation between every declared snapshot.
Between `0%` and `50%`, the browser calculates smooth intermediate `translateY` values at
60fps. You only declare the moments that matter — the browser fills in every frame between them.

**Canonical example (General Explanation):**
- **Real-world analogy:** Flip-book animation. Each page is a keyframe. The `@keyframes`
  rule is the entire flip book. The `animation` property is the instruction "flip through
  these pages at 24 pages/second."
- **Minimal form:**
  ```css
  @keyframes pulse {
    from { opacity: 1; }
    to   { opacity: 0.4; }
  }
  .icon { animation: pulse 1s ease-in-out alternate infinite; }
  ```
- **Why obvious:** `from` and `to` are aliases for `0%` and `100%`. The animation cycles
  between fully visible and dim. `alternate` reverses direction on each cycle.

**Project Application:**
The portfolio hero section will use a keyframe animation to fade the heading text in on
load. The Three.js background will use JavaScript animation, but CSS keyframes handle
everything that does not need dynamic values.

**Smallest possible example:**
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.heading { animation: fade-up 0.6s ease-out forwards; }
```
`forwards` means hold the final state after the animation ends instead of snapping back.

**Why it matters here:** Page load entrance animations are one of the most visible polish
elements of a portfolio. They are entirely CSS — no JavaScript required.

**Watch for:** Without `animation-fill-mode: forwards`, the element snaps back to its
`from` state after the animation ends. Always add `forwards` to entrance animations.

---

## Concept: The `animation` Shorthand

**What it is:** The `animation` shorthand property applies a `@keyframes` animation to
an element with a single line specifying the name, duration, easing, delay, iteration
count, direction, and fill mode.

**The problem before:**

```css
/* Longhand — 7 separate properties */
animation-name: float;
animation-duration: 2s;
animation-timing-function: ease-in-out;
animation-delay: 0s;
animation-iteration-count: infinite;
animation-direction: alternate;
animation-fill-mode: none;
```

Each animation requires 7 lines. Multiply by every animated element on the page.

**The solution:**

```css
/* Shorthand — all seven in one line */
animation: float 2s ease-in-out 0s infinite alternate none;
/*         name  dur  easing   delay  count    dir   fill */
```

Or more commonly, only the values you care about:
```css
animation: float 2s ease-in-out infinite;
/* Omitted values get their defaults: 0s delay, normal direction, none fill */
```

**Canonical example (General Explanation):**
- **Minimal form:** `animation: keyframe-name duration easing iteration;`
- **Order matters:** name must come before duration; otherwise, follow the order above.

**Project Application:**
Every animation in this course uses the shorthand. The only exception is when you need
to animate multiple properties with different timings — then separate `animation-name` and
`animation-duration` are clearer.

**Smallest possible example:**
```css
.loader { animation: spin 1s linear infinite; }
```

**Why it matters here:** You will write the shorthand for every animated element in this lab.

**Watch for:** If two time values appear in the shorthand, the first is always `duration`
and the second is `delay`. `animation: spin 1s 0.5s linear` means: 1s duration, 0.5s delay.

---

## Concept: `animation-delay` for Stagger

**What it is:** `animation-delay` sets how long the browser waits before starting the
animation, allowing multiple elements with the same keyframe to start at different offsets.

**The problem before:**

```css
.dot { animation: float 2s ease-in-out infinite; }
```

All three dots start at the same point in the float cycle — they move together as a block
rather than as three independent objects.

**The solution:** Negative delays let elements *start mid-cycle* as if the animation has
already been running:

```css
.dot-1 { animation: float 2s ease-in-out infinite; }          /* starts at 0s */
.dot-2 { animation: float 2s ease-in-out -0.67s infinite; }   /* starts 0.67s in */
.dot-3 { animation: float 2s ease-in-out -1.33s infinite; }   /* starts 1.33s in */
```

**Canonical example:**
- **Real-world analogy:** Three singers in a round ("Row your boat") — each one starts
  singing after the previous one has gone a few bars. Negative delay is starting in the
  middle of the song rather than waiting for the beginning.

**Project Application:**
The three floating dots in this lab use negative delays to stagger their phase in the float
cycle, making them feel like independent objects.

**Smallest possible example:**
```css
.dot-2 { animation: float 2s ease-in-out -0.67s infinite; }
```

**Why it matters here:** Staggered animations are a staple of polished UI design. They
suggest life and individuality in otherwise identical elements.

**Watch for:** Positive delay waits before starting. Negative delay starts mid-animation.
Use negative delay for staggered loops (you don't want the page to be static for 0.67s
while waiting for the second dot to begin).

---

## Step 1 — Create Files

Create `projects/lab-06/index.html` and `projects/lab-06/styles.css`.

`index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 06 — Keyframe Animations</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="scene">

      <h1 class="entrance-heading">Hello.</h1>
      <p class="entrance-sub">I build things for the web.</p>

      <div class="dots-row">
        <span class="dot dot-1"></span>
        <span class="dot dot-2"></span>
        <span class="dot dot-3"></span>
      </div>

    </div>
  </body>
</html>
```

---

> **CSS AND SEE**
>
> Open with Live Server.
>
> **You should see:** "Hello." as a large heading, the subtext below, and "  " (three
> empty span elements with no visual form yet). Default unstyled.

---

## Step 2 — Base Scene Styles

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --color-primary: #6c63ff;
  --color-bg: #0d0d1a;
  --color-text: #e8e8f0;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: system-ui, sans-serif;
}

.scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 24px;
}

.entrance-heading {
  font-size: clamp(3rem, 8vw, 6rem);  /* fluid size — large on desktop, smaller on mobile */
  margin: 0;
}

.entrance-sub {
  color: #8888aa;
  margin: 0;
  font-size: 1.25rem;
}
```

`clamp(3rem, 8vw, 6rem)` sets a minimum size (3rem), a preferred size (8% of viewport
width), and a maximum (6rem). The font scales with the screen without breakpoints.

---

> **CSS AND SEE**
>
> **You should see:** "Hello." large and centered on a dark background. The subtext below.
> No dots visible (they have no size yet). The text appears instantly with no animation.

---

## Step 3 — Define the Entrance Keyframe

```css
/* Entrance animation: fade up from below into place */
@keyframes fade-in-up {
  from {
    opacity: 0;                    /* start invisible */
    transform: translateY(24px);   /* start 24px below final position */
  }
  to {
    opacity: 1;                    /* end fully visible */
    transform: translateY(0);      /* end at normal position */
  }
}
```

This keyframe has only two snapshots: `from` (0%) and `to` (100%). The browser fills in
every intermediate frame.

---

## Step 4 — Apply the Entrance Animation

```css
.entrance-heading {
  font-size: clamp(3rem, 8vw, 6rem);
  margin: 0;
  animation: fade-in-up 0.6s ease-out forwards;  /* ← add: play once, hold final state */
}

.entrance-sub {
  color: #8888aa;
  margin: 0;
  font-size: 1.25rem;
  animation: fade-in-up 0.6s ease-out 0.2s forwards;  /* ← add: 0.2s delay for stagger */
}
```

`forwards` keeps the element at the `to` state after the animation ends. Without it, both
elements would snap back to `opacity: 0` and `translateY(24px)` after 0.6 seconds.

The `0.2s` delay on the subtext makes it start 200ms after the heading — they enter in
sequence rather than simultaneously.

---

> **CSS AND SEE**
>
> Save and reload the page.
>
> **You should see:** The heading fades up into place over 0.6 seconds. 0.2 seconds later,
> the subtext follows. Both then hold their final positions.
>
> **Try it:** Reload several times to see the entrance play each time.
>
> **Change something:** Change the heading's delay from `0s` (default) to `0.5s`. Save
> and reload. The page is blank for half a second before the heading appears. This is
> actually a common technique — a brief pause before content appears feels intentional.
> Change the delay back (remove it, defaulting to `0s`).

---

## Step 5 — Define the Float Keyframe and Style the Dots

```css
/* Loop animation: float up and down continuously */
@keyframes float {
  0%   { transform: translateY(0); }      /* resting position */
  50%  { transform: translateY(-14px); }  /* peak float */
  100% { transform: translateY(0); }      /* back to rest */
}

.dots-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.dot {
  display: block;          /* span is inline by default; block allows width/height */
  width: 10px;
  height: 10px;
  border-radius: 50%;      /* 50% makes a perfect circle from a square */
  background: var(--color-primary);
}
```

---

> **CSS AND SEE**
>
> **You should see:** Three purple circles in a row below the subtext. They are static —
> the `float` keyframe is defined but not yet applied to them.

---

## Step 6 — Apply Float with Staggered Delays

```css
/* Apply float animation with staggered negative delays so dots are out of phase */
.dot-1 {
  animation: float 2s ease-in-out infinite;           /* starts at cycle position 0 */
}
.dot-2 {
  animation: float 2s ease-in-out -0.67s infinite;    /* starts 0.67s into the cycle */
}
.dot-3 {
  animation: float 2s ease-in-out -1.33s infinite;    /* starts 1.33s into the cycle */
}
```

The cycle is 2 seconds. Dividing by 3 dots gives 0.667s offset between each. Negative
delays start each dot at a different point in the cycle without any initial pause.

---

> **CSS AND SEE**
>
> **You should see:** Three purple dots floating in a staggered wave pattern, each at a
> different height continuously. The effect suggests gentle breathing or pulsing life.
>
> **Change something:** Change all three delays to `0s` (or remove them). Save. All three
> dots move in perfect lockstep — up together, down together. It looks mechanical and
> uniform. Add the negative delays back.
>
> **Change something:** Change the float duration to `1s`. Save. The float is now twice
> as fast — anxious rather than calm. Change back to `2s`.

---

## 🎯 Challenge: Loading Spinner

**You know:** `@keyframes` with `transform`, `animation-iteration-count: infinite`, and
`animation-timing-function`.

**Task:** Create a `.spinner` — a circle with a partial border that rotates continuously.
It should be a 40px circle with a 4px border, where only part of the border is colored
(the rest is transparent), rotating 360 degrees in an infinite loop.

**Starting code:**
```html
<div class="spinner"></div>
```

**Hints:**
1. `border-radius: 50%` makes any square a circle.
2. To make only part of the border colored, set all four borders to a base color, then
   change one specific side to `transparent`.
3. `transform: rotate(360deg)` is a full rotation.

---

<details>
<summary>▶ Show Solution</summary>

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;                         /* circle */
  border: 4px solid rgba(108, 99, 255, 0.2);  /* light base border all around */
  border-top-color: #6c63ff;                  /* only the top side is fully colored */
  animation: spin 0.8s linear infinite;        /* linear for constant rotation speed */
}
```

**Key insight:** `linear` timing (not `ease`) is correct for rotation — rotational speed
should be constant. Using `ease` on a rotation creates a visible pulse effect because the
rotation accelerates and decelerates with each cycle, which looks unintentional for a
loading indicator.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Heading fades up on load | Reload page — heading animates in from below |
| Subtext enters 0.2s after heading | Subtext appears slightly later than heading |
| Final states hold (no snap-back) | Heading stays visible after animation ends |
| Three dots float independently | Dots are at different heights simultaneously |
| Dots loop continuously | Dots keep floating without stopping |
| Stagger is visible | No two dots are at the same height at the same time |

---

## What's Next

LAB 07 introduces modern CSS effects — gradients, `backdrop-filter` for glassmorphism, and
layered `box-shadow`. You will build the frosted-glass card style that is used throughout the
portfolio's hero section.

---

## Transfer Exercise

CSS `@keyframes` animations are one approach to frame-based animation. Game engines use a
similar concept — Unity's `AnimationClip`, Godot's `AnimationPlayer`, or Roblox's `TweenService`
all define a timeline of property snapshots and interpolate between them.

Describe the equivalent of `animation-fill-mode: forwards` in a game engine — what would it
mean for a character's walk animation to have "forwards fill mode"? When would you want it,
and when would you not?

---

## Quick Check Answers

**1. How do you animate something without a trigger?**
`@keyframes` combined with the `animation` property plays automatically when the element
is rendered — no user interaction needed. The animation begins as soon as the element is
painted (or after `animation-delay` expires). Transitions need a value change; animations
do not.

**2. What property makes staggered animations possible?**
`animation-delay`. Positive delay waits before starting. Negative delay starts mid-cycle,
as if the animation has already been running. The three dots use negative delays to appear
at different positions in the float cycle from the first frame.

**3. What does `animation-iteration-count: 2` do?**
The animation plays exactly twice, then stops. The element rests in the state determined by
`animation-fill-mode` — `forwards` keeps the final `100%` state, `backwards` returns to
the `0%` state, `none` (default) returns to the original CSS property value before the
animation began.
