# Creative Web Masterclass — LAB 05 — CSS Transitions: Smooth State Changes

**Prerequisites:** LAB-04. You know custom properties, box model, and flexbox.

**What this lab adds:**
- The `transition` property — which properties to animate, how long, and with what curve
- Easing functions — why `ease` feels natural and `linear` feels robotic
- Transition on `transform` — the correct property for performance
- Hover, focus, and active states that feel alive

**Time:** 40–55 minutes

---

## What You Will Build

Three buttons that each demonstrate a different transition technique:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  [ View Work ]    ← smooth background color fade │
│                                                  │
│  [ Download CV ]  ← lifts 4px on hover           │
│                                                  │
│  [ Contact ]      ← border grows inward on hover │
│                                                  │
└──────────────────────────────────────────────────┘
```

Each button's hover feels polished and intentional — not because the change is dramatic,
but because it is timed and eased perfectly.

---

> **Quick Check — answer before reading further:**
>
> 1. Without the `transition` property, what happens when you hover a button that has
>    a `:hover` rule changing its background color?
> 2. Why do you think changing `transform: translateY(-4px)` on hover is better for
>    performance than changing `top: -4px`?
> 3. An easing curve goes from 0 to 1 over the transition duration. What do you think
>    the difference is between `ease`, `linear`, and `ease-out`?
>
> *(Answers at the end)*

---

## Concept: CSS `transition`

**What it is:** The `transition` property tells the browser to animate a CSS property's
value change over a set duration and easing curve, whenever the property changes for any
reason (hover, focus, class change, etc.).

**The problem before:**

```css
/* Without transition — instantaneous change */
.button { background: #6c63ff; }
.button:hover { background: #5a52d4; }
```

The color snaps instantly on hover and off hover. This feels mechanical — like a light
switch rather than a smooth dimmer. Every hover interaction on every element snaps.

**The solution:**

```css
.button {
  background: #6c63ff;
  transition: background 0.3s ease;  /* animate "background" over 300ms */
}
.button:hover { background: #5a52d4; }
```

Now the color glides from purple to dark-purple over 300 milliseconds. The transition is
declared on the *base state* — not on `:hover`. This ensures the animation plays both when
hovering *in* and when hovering *out*.

**What it hides:** `transition` hides the interpolation math. Between the start and end
values, the browser calculates intermediate values at 60 times per second (one per frame).
For `background: #6c63ff` to `background: #5a52d4`, it interpolates the R, G, and B
channels separately. You never write those intermediate colors. The invariant it protects:
the animation always starts from the *current* value and ends at the *new* value — even
if the user moves the cursor in the middle of the animation, the transition reverses from
wherever it currently is.

**Canonical example (General Explanation):**
- **Real-world analogy:** A volume knob vs. a toggle switch. A toggle (no transition) jumps
  instantly. A volume knob (with transition) glides smoothly from 0 to 10.
- **Minimal form:**
  ```css
  .el { color: red; transition: color 0.3s ease; }
  .el:hover { color: blue; }
  ```
- **Why obvious:** Remove the transition and the change snaps. Add it back and it glides.
  The `transition` is purely additive — it does not change the *values*, only the *timing*.

**Project Application:**
Every interactive element in the portfolio — buttons, nav links, cards, ribbon dots — will
have a transition. The pattern is always: declare `transition` on the base state, declare
the new value on the state pseudo-class (`:hover`, `:focus`, `:active`).

**Smallest possible example:**
```css
.button {
  opacity: 1;
  transition: opacity 0.2s ease;
}
.button:hover { opacity: 0.8; }
```

**Why it matters here:** Without transitions, every state change in the portfolio feels
abrupt. With consistent transitions, the page feels responsive and polished.

**Watch for:** If you put `transition` on the `:hover` rule instead of the base state,
the animation plays coming *in* but snaps when leaving. Always put `transition` on the
base state.

---

## Concept: Easing Functions

**What it is:** An easing function is a curve that describes how fast the transition
moves at each moment — fast at the start, fast at the end, slow in the middle, etc.

**The problem before:** `transition: background 0.3s linear` moves at a constant speed.
This feels robotic and unnatural because real objects do not move at constant speed —
they accelerate and decelerate.

**The solution:** CSS provides several built-in easing keywords:

| Keyword | Behavior | When to use |
|---|---|---|
| `linear` | Constant speed | Progress bars, loading indicators |
| `ease` | Slow start, fast middle, slow end | Most UI transitions (default) |
| `ease-in` | Starts slow, accelerates | Elements leaving the screen |
| `ease-out` | Starts fast, decelerates | Elements entering the screen |
| `ease-in-out` | Slow start and end | Modal dialogs appearing and disappearing |

**Canonical example (General Explanation):**
- **Real-world analogy:** A car moving through a city. `linear` is a spacecraft in a vacuum —
  constant speed. `ease` is a car pulling away from a stop sign — slow start, gets up to
  speed, slows to park. Humans perceive `ease` as natural because it matches how physical
  objects with mass actually move.
- **Minimal form:** `transition: transform 0.25s ease-out;`
- **Why obvious:** Change `ease-out` to `linear` on the same animation and notice it feels
  more mechanical. The content is identical — only the curve changes.

**Project Application:**
For button hover effects (something *entering* an active state), `ease-out` feels snappy and
responsive. For elements *leaving* an active state, `ease-in` can work. `ease` is a safe
default for most cases.

**Smallest possible example:**
```css
.button {
  transform: translateY(0);
  transition: transform 0.2s ease-out;
}
.button:hover { transform: translateY(-4px); }
```

**Why it matters here:** Using `ease-out` for the lift effect feels snappier than `ease`
for a button — it responds to the cursor immediately and decelerates naturally.

**Watch for:** Custom cubic bezier curves (`cubic-bezier(0.25, 0.46, 0.45, 0.94)`) give
you precise control over the easing curve. Tools like easings.net let you visualize and
copy curves. For now, the built-in keywords are sufficient.

---

## Concept: `transform` and Why It Is Preferred for Animation

**What it is:** `transform` is a CSS property that visually repositions, scales, or rotates
an element without affecting document layout — the surrounding content does not move.

**The problem before:**

```css
/* Animating top/left/margin — causes layout recalculation */
.button { position: relative; top: 0; }
.button:hover { top: -4px; }
```

Changing `top`, `left`, `margin`, or `padding` forces the browser to recalculate the layout
of every affected element — potentially the entire page — on every frame of the animation.
At 60 frames per second, this is expensive.

**The solution:**

```css
.button {
  transform: translateY(0);
  transition: transform 0.2s ease-out;
}
.button:hover { transform: translateY(-4px); }
```

`transform` moves the rendered result without touching layout. The browser can hand it off
to the GPU, which handles pixel operations much faster than the CPU. Other elements are
unaffected by the transformation.

**What it hides:** `transform` hides the GPU compositing layer management. The browser
promotes transformed elements to their own layer when a transition begins and composites
them on the GPU. You declare the transform; the browser handles the GPU handoff.

**Canonical example:**
- **Real-world analogy:** Moving a painting on a wall vs. rebuilding the wall. `top/margin`
  changes rebuild the wall. `transform` moves only the painting.
- **Minimal form:** `transform: translateY(-4px)` — moves the element 4px up visually.

**Project Application:**
All hover lift effects, entrance animations, and parallax movements in this course use
`transform`. You will never animate `top`, `left`, or `margin` for motion effects.

**Smallest possible example:**
```css
.card:hover { transform: translateY(-4px) scale(1.02); }
```

**Why it matters here:** Performance is non-negotiable in the final portfolio. Hundreds of
animated elements that each trigger layout recalculations would make scrolling jank.

**Watch for:** `transform` does not affect layout — the element still occupies its original
space. If a card lifts up 4px, it may overlap whatever is above it. This is usually fine
visually, but if it causes clipping, use `overflow: visible` on the parent.

---

## Step 1 — Create Files

Create `projects/lab-05/index.html` and `projects/lab-05/styles.css`.

`index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 05 — CSS Transitions</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="demo-page">
      <h2>Button Transitions</h2>

      <div class="button-row">
        <button class="btn btn-fade">View Work</button>
        <button class="btn btn-lift">Download CV</button>
        <button class="btn btn-border">Contact</button>
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
> **You should see:** Three plain browser-default buttons in a row. No styling.

---

## Step 2 — Base Styles

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --color-primary: #6c63ff;
  --color-primary-dark: #5a52d4;   /* darker shade for hover state */
  --color-surface: #f0f0f8;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--color-surface);
}

.demo-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 80px 32px;
}

.button-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 28px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;     /* inherit prevents buttons from using browser default font */
}
```

---

> **CSS AND SEE**
>
> **You should see:** Three identically styled buttons (no distinct colors yet) laid out
> in a row with 16px gaps. All are functional — clicking works, but nothing visual happens.

---

## Step 3 — Button 1: Color Fade on Hover

```css
/* Button 1: background color fades on hover */
.btn-fade {
  background: var(--color-primary);
  color: white;
  transition: background 0.3s ease;   /* animate background property, 300ms, ease curve */
}

.btn-fade:hover {
  background: var(--color-primary-dark);   /* darker purple on hover */
}
```

---

> **CSS AND SEE**
>
> Hover over the first button.
>
> **You should see:** The background color fades from purple to darker purple over
> 300 milliseconds. Moving the cursor away fades it back.
>
> **Change something:** Change `0.3s` to `2s`. Save. Hover the button — the fade now
> takes 2 full seconds. Very slow and obvious. Change it back to `0.3s`.
>
> Then change `ease` to `linear`. Hover. It feels slightly more mechanical — constant
> speed instead of a natural slowdown at the end. Change back to `ease`.

---

## Step 4 — Button 2: Lift Effect with `transform`

```css
/* Button 2: lifts upward on hover using transform */
.btn-lift {
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);       /* base shadow */
  transition: transform 0.2s ease-out,              /* lift motion */
              box-shadow 0.2s ease-out;             /* shadow deepens as it lifts */
}

.btn-lift:hover {
  transform: translateY(-4px);                       /* move 4px upward visually */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);       /* larger shadow = more elevation */
}
```

The `transition` can animate multiple properties at once — separate them with commas.
Here both `transform` and `box-shadow` animate simultaneously, giving the illusion that
the button is physically rising off the page and casting a longer shadow.

---

> **CSS AND SEE**
>
> Hover over the second button.
>
> **You should see:** The button smoothly lifts 4px upward and its shadow expands. It
> feels like the button is physically elevated. Moving off snaps back with the ease-out curve.
>
> **Compare:** The surrounding text and the third button do not move when the second button
> lifts. This is `transform` — it lifts visually without affecting layout.
>
> **Change something:** Change `translateY(-4px)` to `translateY(-12px)`. Save. The lift
> is now dramatic — too much for a button. Change back to `-4px`.

---

## Step 5 — Button 3: Inset Border with `box-shadow`

```css
/* Button 3: border grows inward from invisible to visible on hover
   Uses inset box-shadow so the button size stays the same (no layout shift) */
.btn-border {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid transparent;                       /* invisible border in base state */
  box-shadow: inset 0 0 0 0 var(--color-primary);     /* inset shadow starts at 0 size */
  transition: box-shadow 0.25s ease,
              color 0.25s ease;
}

.btn-border:hover {
  box-shadow: inset 0 0 0 2px var(--color-primary);   /* grows to 2px inset */
  color: var(--color-primary);
}
```

`inset` makes the shadow go *inside* the element rather than outside. Growing an inset
shadow from 0 to 2px creates the visual effect of a border drawing itself — without
changing the element's size, which `border` changes would do.

---

> **CSS AND SEE**
>
> Hover over the third button.
>
> **You should see:** A purple border appears to draw itself inward as you hover.
> Moving off dissolves the border.
>
> **Change something:** Change `inset 0 0 0 2px` to `inset 0 0 0 6px`. Save. The border
> is now thick and dramatic. Change back to `2px`.

---

## 🎯 Challenge: Card Hover Effect

**You know:** `transform: translateY()` for lift, `box-shadow` for depth, `transition` for timing.

**Task:** Create a `.feature-card` that has a white background, some padding, a border-radius,
and a subtle shadow. On hover, it should lift 6px and its shadow should grow to feel elevated.
The transition should be 0.25s ease-out. There should be no layout shift when the card lifts.

**Starting HTML:**
```html
<div class="feature-card">
  <h3>Feature</h3>
  <p>Description of what this feature does.</p>
</div>
```

---

<details>
<summary>▶ Show Solution</summary>

```css
.feature-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(0);                    /* explicit start state for transition */
  transition: transform 0.25s ease-out,
              box-shadow 0.25s ease-out;
  cursor: default;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
```

**Key insight:** Declaring `transform: translateY(0)` explicitly on the base state is good
practice even though the default is already 0 — it makes the transition's start and end
states both clearly declared in the code. A future developer reading `.feature-card` knows
exactly what the card's rest position is and what it transitions to.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Button 1 color fades | Hover → background glides from purple to dark-purple over 300ms |
| Button 2 lifts with transform | Hover → button rises 4px, shadow expands |
| No layout shift on lift | Surrounding buttons do not move when Button 2 lifts |
| Button 3 border draws in | Hover → inset border appears smoothly |
| All animations reverse on mouse-off | Move cursor away → each button returns to base state |

---

## What's Next

LAB 06 introduces CSS keyframe animations — motion that plays automatically without user
interaction. You will animate a circle that floats endlessly and a card that fades in on
page load.

---

## Transfer Exercise

CSS transitions are "tweening" — automatically generating intermediate values between two
keyframes. The same concept appears in animation software (Flash, After Effects), game
engines (Unity's `Lerp`), and mobile UI frameworks (SwiftUI's `withAnimation`).

Describe how Unity's `Mathf.Lerp(a, b, t)` does the same job as a CSS transition. What
corresponds to the start value, the end value, the duration, and the easing curve?

---

## Quick Check Answers

**1. Without `transition`, what happens on hover?**
The background color snaps instantly to the hover value — a frame-0-to-frame-1 jump with
nothing in between. The browser calculates the new value and paints it immediately on the
next frame. No interpolation occurs without a `transition` property declaring which
property to interpolate and over how long.

**2. Why is `transform` better than `top` for performance?**
Changing `top`, `margin`, or `padding` triggers the browser's layout engine — it must
recalculate every element's position that could be affected by the change (potentially the
entire page). `transform` operates only on the compositing layer — the GPU moves the
already-painted element without the CPU recalculating layout. At 60fps, the difference
between a layout recalculation and a compositing operation is the difference between a
smooth animation and visible jank.

**3. Difference between `ease`, `linear`, and `ease-out`?**
`linear` moves at constant speed from start to finish. `ease` starts slow, accelerates
through the middle, and slows at the end — mimicking the motion of physical objects with
mass. `ease-out` starts at full speed and decelerates to a stop — good for elements that
feel snappy and responsive to user input. `ease-in` starts slow and accelerates — good for
elements exiting the screen. Human perception finds non-linear motion more natural because
nothing in the physical world moves at constant speed.
