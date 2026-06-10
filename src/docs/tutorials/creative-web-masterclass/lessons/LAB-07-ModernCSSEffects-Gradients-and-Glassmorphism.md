# Creative Web Masterclass — LAB 07 — Modern CSS Effects: Gradients and Glassmorphism

**Prerequisites:** LAB-06. You know custom properties, transitions, keyframes, and transform.

**What this lab adds:**
- `linear-gradient` and `radial-gradient` — declarative color transitions
- `backdrop-filter: blur()` — the frosted-glass effect
- Layered `box-shadow` — depth without images
- The glassmorphism card used in the portfolio hero

**Time:** 50–65 minutes

---

## What You Will Build

```
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║   Gradient background (purple → blue mesh)       ║
  ║                                                  ║
  ║      ┌────────────────────────────────┐          ║
  ║      │░░░░░░░░░░ frosted glass ░░░░░░│          ║
  ║      │░                              ░│          ║
  ║      │░   Michael McLean             ░│          ║
  ║      │░   Creative Developer         ░│          ║
  ║      │░                              ░│          ║
  ║      │░   [ View Work ]              ░│          ║
  ║      │░                              ░│          ║
  ║      └────────────────────────────────┘          ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
```

The frosted-glass card sits over a rich gradient background. The card is semi-transparent
with a blur effect that makes the gradient visible through it.

---

> **Quick Check — answer before reading further:**
>
> 1. A gradient is a smooth transition between colors. What two things do you think you
>    need to specify to define a gradient — what colors and what else?
> 2. The glassmorphism effect shows a blurred version of what is behind the element.
>    Which element do you think needs the blur property — the card or the background?
> 3. How many `box-shadow` values do you think one element can have?
>
> *(Answers at the end)*

---

## Concept: CSS Gradients

**What it is:** A CSS gradient is a programmatically generated image that transitions
smoothly between two or more colors across a direction or shape.

**The problem before:** Before CSS gradients, background color transitions required actual
image files — a 1px wide PNG exported from Photoshop, stretched to fill the element.
Every gradient update required opening an image editor.

**The solution:**

```css
background: linear-gradient(135deg, #6c63ff, #3a3a8a);
```

The browser generates the gradient at render time. Change the colors in CSS, see the
change immediately. No image files, no exports.

**Canonical example (General Explanation):**
- **Real-world analogy:** Paint mixed on a canvas from one color at the top to another at
  the bottom — except the "mixing" is calculated mathematically from the color definitions.
- **Minimal form:**
  ```css
  background: linear-gradient(to right, #6c63ff, #ff6b6b);
  /* "from left, goes to right, purple to red" */
  ```
- **The direction argument:**
  - `to right` — left to right
  - `to bottom` — top to bottom (default)
  - `135deg` — diagonal (0deg = upward, clockwise from there)

**Project Application:**
The portfolio background is a diagonal gradient. The hero overlay uses a radial gradient
for a "glowing center" effect. Both are CSS gradients with custom property colors.

**Smallest possible example:**
```css
body {
  background: linear-gradient(135deg,
    hsl(250, 70%, 20%),   /* deep purple */
    hsl(220, 70%, 15%)    /* deep blue */
  );
}
```

**Why it matters here:** The entire background of the portfolio hero section is a CSS
gradient — nothing more.

**Watch for:** Gradients accept any CSS color value: hex, rgb, hsl, `rgba` with transparency.
They also accept `color-stop` positions: `linear-gradient(red 0%, blue 60%, green 100%)`
places each color at a specific percentage of the gradient.

---

## Concept: `backdrop-filter`

**What it is:** `backdrop-filter` applies a visual filter to everything *behind* an element,
visible through the element's background — most commonly used with `blur()` for glassmorphism.

**The problem before:** Creating a frosted-glass effect required:
1. A screenshot of the background
2. A blurred version of the screenshot
3. Careful positioning and masking

Every time the background changed, the screenshot needed updating.

**The solution:**

```css
.card {
  background: rgba(255, 255, 255, 0.12);  /* semi-transparent so the bg shows through */
  backdrop-filter: blur(12px);             /* blur whatever is behind this element */
}
```

The browser composites the blur dynamically — no screenshots, no manual updates.

**What it hides:** `backdrop-filter` hides GPU compositing layer creation, the isolation
of the backdrop, and the multi-pass rendering needed to blur only the area behind the
element. You specify blur radius; the browser promotes the element to its own rendering
layer and runs a Gaussian blur on the composited backdrop pixels. The invariant: the blur
always reflects the current state of whatever is behind the card.

**Canonical example:**
- **Real-world analogy:** Frosted glass in a bathroom window — you see the shapes and
  colors outside but blurred, softened, and slightly lightened.
- **Minimal form:**
  ```css
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
  ```

**Project Application:**
Every floating card in the portfolio hero will use `backdrop-filter: blur(16px)` with a
semi-transparent background. The Three.js scene behind the card stays visible — blurred —
through the card surface.

**Smallest possible example:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Why it matters here:** This is the signature visual effect of the portfolio.

**Watch for:** `backdrop-filter` requires the element's background to not be fully opaque
— if `background: white` is set (no transparency), the blur has nothing to show through.
Use `rgba()` or `hsla()` with an alpha less than 1. Also note: Firefox requires the
`-webkit-backdrop-filter` prefix for some versions.

---

## Concept: Layered `box-shadow`

**What it is:** `box-shadow` accepts a comma-separated list of shadow definitions,
each applied on top of the previous, allowing multiple shadows at different offsets
and blurs to create complex depth effects.

**The problem before:**

```css
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);  /* one shadow — flat and uniform */
```

Real objects have complex shadows — soft far shadows, sharper near shadows, and sometimes
an inner glow. A single shadow definition cannot replicate this.

**The solution:**

```css
box-shadow:
  0 1px 3px rgba(0, 0, 0, 0.4),      /* close, sharp shadow */
  0 8px 24px rgba(0, 0, 0, 0.25),    /* medium shadow */
  0 24px 48px rgba(0, 0, 0, 0.15),   /* far, soft shadow */
  0 0 0 1px rgba(255, 255, 255, 0.1) /* subtle inner border using inset-like trick */
;
```

Each layer paints on top of the previous. The combination creates a sense of genuine depth.

**Canonical example:**
- **Real-world analogy:** Looking at a glass on a table — it casts a hard shadow close to
  the glass edge and a soft, diffuse shadow further away. That requires two layers.
- **Minimal form:**
  ```css
  box-shadow:
    0 2px 4px rgba(0,0,0,0.3),    /* close */
    0 10px 30px rgba(0,0,0,0.15)  /* far */
  ;
  ```

**Project Application:**
The glassmorphism card uses three layers: a close shadow, a medium shadow, and a thin
border-like shadow created with `0 0 0 1px rgba(255,255,255,0.2)` to simulate the refraction
edge of real glass.

**Smallest possible example:**
```css
.elevated { box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.15); }
```

**Why it matters here:** A single shadow makes the card look like a flat sticker. Layered
shadows make it look like it is floating off the gradient background.

**Watch for:** More than three shadows becomes hard to perceive and starts slowing rendering.
Three layers (close + medium + border glow) are the practical maximum for most UI elements.

---

## Step 1 — Create Files

`projects/lab-07/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 07 — Glassmorphism</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="hero-bg">

      <div class="glass-card">
        <h1 class="card-name">Michael McLean</h1>
        <p class="card-role">Creative Developer</p>
        <p class="card-desc">
          I build beautiful interfaces with CSS, JavaScript, and Three.js.
        </p>
        <button class="card-btn">View Work</button>
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
> **You should see:** Unstyled text — name, role, description, and button stacked in
> the top-left corner. No gradient, no card, no effects.

---

## Step 2 — Build the Gradient Background

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --color-primary: #6c63ff;
  --gradient-bg: linear-gradient(
    135deg,
    hsl(250, 60%, 12%) 0%,    /* deep purple at top-left */
    hsl(220, 60%, 10%) 50%,   /* deep blue in center */
    hsl(280, 50%, 14%) 100%   /* deep violet at bottom-right */
  );
}

body { margin: 0; font-family: system-ui, sans-serif; }

.hero-bg {
  min-height: 100vh;
  background: var(--gradient-bg);  /* the CSS gradient — no image required */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;              /* needed for pseudo-element orbs in next step */
  overflow: hidden;                /* clip orbs at the edge */
}
```

---

> **CSS AND SEE**
>
> **You should see:** A rich diagonal gradient — dark purple top-left fading to dark violet
> bottom-right. The text content is centered. No card styling yet.
>
> **Change something:** Change `135deg` to `90deg`. Save. The gradient now flows top to
> bottom. Change to `0deg` — left to right. Change back to `135deg`.

---

## Step 3 — Add Soft Glow Orbs with Pseudo-elements

Add to `.hero-bg`:

```css
/* Soft light orbs in the background using pseudo-elements */
.hero-bg::before,
.hero-bg::after {
  content: "";                       /* required for pseudo-elements to render */
  position: absolute;
  border-radius: 50%;                /* circles */
  filter: blur(80px);                /* very heavy blur = soft glow, not hard circle */
  opacity: 0.4;
}

.hero-bg::before {
  width: 500px;
  height: 500px;
  background: hsl(250, 80%, 45%);   /* bright purple orb */
  top: -100px;
  left: -100px;
}

.hero-bg::after {
  width: 400px;
  height: 400px;
  background: hsl(200, 80%, 45%);   /* bright blue orb */
  bottom: -80px;
  right: -80px;
}
```

`::before` and `::after` are **pseudo-elements** — the browser generates them as visual
children of the element without requiring extra HTML. `content: ""` is required (even when
empty) — without it, the pseudo-element does not render. `position: absolute` places them
relative to `.hero-bg` (which has `position: relative`).

---

> **CSS AND SEE**
>
> **You should see:** Two large soft glowing circles — one purple in the top-left, one blue
> in the bottom-right. They bleed off the edges. Together with the gradient, the background
> now has a sense of depth and light.
>
> **Change something:** Change the `::before` blur from `80px` to `20px`. Save. The orb
> becomes a hard circle — visible and distracting. Change back to `80px`.

---

## Step 4 — Style the Glassmorphism Card

```css
.glass-card {
  position: relative;    /* above the orbs which are absolute within hero-bg */
  z-index: 1;            /* sit above the orbs (which have z-index: 0 by default) */
  width: min(440px, 90vw);        /* max 440px, but never wider than 90% of viewport */
  padding: 48px;

  /* Semi-transparent background — the gradient shows through */
  background: rgba(255, 255, 255, 0.08);

  /* Blur everything behind the card */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);   /* Safari prefix */

  /* Three-layer shadow for depth */
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.12);  /* thin white edge — simulates glass refraction */

  border-radius: 20px;
  color: white;
}
```

`min(440px, 90vw)` chooses the smaller of 440px and 90% of the viewport width. On desktop
the card is 440px; on mobile it shrinks to 90% of the screen. This is responsive without
a single media query.

---

> **CSS AND SEE**
>
> **You should see:** A frosted glass card floating over the gradient. The orbs are visible
> through the card, blurred and softened. The white edge line separates the glass from the
> background subtly.
>
> **Change something:** Change `background: rgba(255, 255, 255, 0.08)` to
> `background: rgba(255, 255, 255, 0.5)`. Save. The card becomes opaque white — the
> gradient behind is no longer visible and the glassmorphism effect disappears. Change back
> to `0.08`.
>
> Then try removing `backdrop-filter: blur(16px)`. Save. The background is still visible
> through the card but not blurred. The glass effect disappears — it looks transparent, not
> frosted. Add it back.

---

## Step 5 — Style the Card Content

```css
.card-name {
  font-size: 2rem;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.card-role {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.65);  /* slightly dimmed for hierarchy */
  margin: 0 0 24px 0;
  letter-spacing: 0.05em;            /* slight letter spacing for label-style text */
  text-transform: uppercase;         /* uppercase for the role label */
  font-size: 0.85rem;
}

.card-desc {
  font-size: 1rem;
  line-height: 1.7;                  /* generous line height for readability */
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
}

.card-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.card-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.5);  /* colored shadow matches button */
}
```

---

> **CSS AND SEE**
>
> **You should see:** The complete glassmorphism card — name, muted role label in uppercase,
> description text, and a purple button that lifts slightly on hover.
>
> The card sits on the gradient with the orbs visible and blurred behind it.

---

## 🎯 Challenge: Second Glass Card

**You know:** Glassmorphism with `backdrop-filter`, `rgba` background, layered `box-shadow`.

**Task:** Add a second, smaller glass card to the bottom-right corner of the hero background.
This card should be `position: absolute`, 200px wide, with a semi-transparent dark
background (not white-tinted — try `rgba(0, 0, 0, 0.4)`), and contain a stat like
"12 Projects Shipped". It should sit in the bottom-right of `.hero-bg` with some padding from the edges.

---

<details>
<summary>▶ Show Solution</summary>

```html
<!-- inside .hero-bg, after .glass-card -->
<div class="stat-card">
  <span class="stat-number">12</span>
  <span class="stat-label">Projects Shipped</span>
</div>
```

```css
.stat-card {
  position: absolute;
  bottom: 32px;
  right: 32px;
  width: 160px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  text-align: center;
  margin-top: 4px;
}
```

**Key insight:** The same `backdrop-filter` technique works on any `position: absolute`
element, not just centered cards. Floating stat cards, tooltips, and overlaid menus all
use the same pattern — `position: absolute`, semi-transparent background, and
`backdrop-filter: blur()`.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Gradient background | Dark diagonal gradient visible behind card |
| Soft orbs visible | Two blurred glow circles at top-left and bottom-right |
| Card is transparent | Gradient visible through card surface |
| Blur effect active | Background visible through card is blurred, not sharp |
| White edge line | Thin outline separates card from background |
| Button lifts on hover | Hover shows 2px lift with colored shadow |

---

## What's Next

LAB 08 introduces fluid typography with `clamp()` — font sizes that scale smoothly with
the viewport width between a minimum and maximum, with no media queries required.

---

## Transfer Exercise

`backdrop-filter: blur()` is a CSS implementation of a technique called "Gaussian blur."
This same blur algorithm is used everywhere: Photoshop's "Gaussian Blur" filter, iOS's
UIVisualEffectView (the frosted glass behind notifications and widgets), and image processing
libraries like Pillow in Python.

Describe what "Gaussian" means in Gaussian blur. Why does the blur look smoother and more
natural than a simple "pixelate" blur effect?

---

## Quick Check Answers

**1. What two things define a gradient?**
The colors (what to transition between) and the direction or shape (how the transition
is oriented). For `linear-gradient`, the direction is an angle or keyword like `to right`.
For `radial-gradient`, the shape is `circle` or `ellipse` and it radiates outward from a
center point.

**2. Which element gets the blur — card or background?**
The card gets `backdrop-filter: blur()`. This filter applies to the backdrop — everything
*behind* the element — as seen through the element's non-opaque areas. The background itself
has no filter. The card is the "window" through which you see the blurred background.

**3. How many `box-shadow` values can one element have?**
As many as you want — they are comma-separated. Practically, 3–4 is the maximum before
the overhead exceeds the visual benefit. Each shadow layer is rendered on every repaint.
For animated elements, use 1–2 shadows maximum to keep performance smooth.
