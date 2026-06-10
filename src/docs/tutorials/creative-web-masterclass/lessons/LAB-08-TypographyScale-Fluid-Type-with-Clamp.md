# Creative Web Masterclass — LAB 08 — Typography Scale: Fluid Type with clamp()

**Prerequisites:** LAB-07. You know CSS custom properties, gradients, and modern effects.

**What this lab adds:**
- `clamp(min, preferred, max)` — a CSS function that confines a value between a floor and ceiling
- A type scale: a system where all font sizes relate mathematically
- Fluid typography: sizes that scale proportionally with viewport width, no breakpoints
- `line-height`, `letter-spacing`, and font pairing basics

**Time:** 45–60 minutes

---

## What You Will Build

```
  Narrow window (375px)            Wide window (1400px)

  ██ Heading — 48px                ██████ Heading — 72px
  ████ Subheading — 24px           ████████ Subheading — 32px
  Body text — 16px                 Body text — 16px (unchanged)
  ▪ label — 12px                   ▪ label — 12px (unchanged)
```

Drag the window wider: heading and subheading grow smoothly. Body and label stay fixed.
No media query, no JavaScript — just one CSS function.

---

> **Quick Check — answer before reading further:**
>
> 1. A heading is `font-size: 5vw`. On a 400px screen it's 20px. On a 1600px screen it's
>    80px. What problem does this create at both extremes?
> 2. What do you think `clamp(24px, 5vw, 72px)` does differently from plain `5vw`?
> 3. If you want all font sizes to scale together, where would you define the base size?
>
> *(Answers at the end)*

---

## Concept: `clamp()`

**What it is:** `clamp(min, preferred, max)` returns the `preferred` value if it falls
between `min` and `max`. If `preferred` is below `min`, it returns `min`. If above `max`,
it returns `max`.

**The problem before:**

```css
/* Fluid but unbounded — extremes are unusable */
h1 { font-size: 5vw; }
/* 5vw on 320px = 16px — too small to read as a heading */
/* 5vw on 2000px = 100px — absurdly large */

/* Fixed with breakpoints — jerky, not smooth */
h1 { font-size: 36px; }
@media (min-width: 768px) { h1 { font-size: 56px; } }
@media (min-width: 1200px) { h1 { font-size: 72px; } }
/* Jumps at each breakpoint instead of flowing */
```

**The solution:**

```css
h1 { font-size: clamp(36px, 5vw, 72px); }
/* Never smaller than 36px, never larger than 72px, scales smoothly between */
```

**What it hides:** `clamp()` hides the conditional logic: if viewport is narrow enough
that `5vw < 36px`, use `36px`; if viewport is wide enough that `5vw > 72px`, use `72px`;
otherwise use `5vw`. You describe the intent (fluid between these limits); the browser
evaluates the condition every time the viewport resizes.

**Canonical example (General Explanation):**
- **Real-world analogy:** A thermostat with a minimum and maximum temperature setting.
  The *preferred* is what the room "wants" to be based on outside temperature, but it
  cannot go below the minimum or above the maximum.
- **Minimal form:**
  ```css
  font-size: clamp(1rem, 4vw, 3rem);
  /* min: 1rem (16px), preferred: 4% of viewport, max: 3rem (48px) */
  ```
- **Why obvious:** Remove the min and max — `font-size: 4vw` — and the font becomes
  tiny on phones and enormous on 4K displays. `clamp` keeps it sane at both extremes.

**Project Application:**
Every headline in the portfolio uses `clamp()`. The hero heading goes from 48px on mobile
to 80px on desktop. No breakpoints. One value per heading level.

**Smallest possible example:**
```css
:root {
  --font-size-h1: clamp(2.5rem, 6vw, 5rem);
}
h1 { font-size: var(--font-size-h1); }
```

**Why it matters here:** The portfolio is designed to look great at any window size.
Fluid typography is the single most important tool for achieving that.

**Watch for:** The `preferred` value is usually a `vw` unit. `1vw = 1% of viewport width`.
On a 1200px viewport, `6vw = 72px`. A common mistake is using too large a `vw` value —
`font-size: 10vw` makes the heading change from 30px (300px viewport) to 140px (1400px
viewport), which is way too much range.

---

## Concept: Type Scale

**What it is:** A type scale is a system where every font size in the design is derived
from a ratio applied to a base size, creating mathematical harmony between sizes.

**The problem before:**

```css
h1 { font-size: 52px; }   /* why 52? */
h2 { font-size: 36px; }   /* why 36? */
h3 { font-size: 26px; }   /* why 26? */
p  { font-size: 17px; }   /* why 17? */
```

Arbitrary values that do not relate to each other visually. Changing the base size requires
updating every heading manually.

**The solution:** Use a **scale ratio** (commonly `1.25` — Major Third, or `1.333` — Perfect
Fourth). Each size is the previous size multiplied by the ratio:

```
base:    1rem   (16px)
×1.25 → 1.25rem (20px)  — small heading
×1.25 → 1.563rem (25px) — medium heading
×1.25 → 1.953rem (31px) — large heading
×1.25 → 2.441rem (39px) — display heading
```

**Canonical example:**
- **Real-world analogy:** Musical notes on a scale — each note is a fixed ratio above the
  previous. The result is harmonious because the ratios are consistent.
- **Minimal form with custom properties:**
  ```css
  :root {
    --font-size-sm:   0.875rem;  /* 14px */
    --font-size-base: 1rem;      /* 16px */
    --font-size-lg:   1.25rem;   /* 20px */
    --font-size-xl:   1.563rem;  /* 25px */
    --font-size-2xl:  clamp(2rem, 4vw, 3rem);   /* fluid heading */
    --font-size-3xl:  clamp(2.5rem, 5vw, 4rem); /* fluid display */
  }
  ```

**Project Application:**
The portfolio design system uses a 6-level type scale. Every text element references
one of the six levels. No arbitrary font sizes anywhere.

**Smallest possible example:**
```css
:root {
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-xl: 1.5rem;
  --text-3xl: clamp(2rem, 4vw, 3.5rem);
}
```

**Why it matters here:** Once the scale is defined, you choose levels rather than pixels.
The design always feels consistent because all sizes are related.

**Watch for:** Using too many levels creates confusion. Six levels is the practical maximum
for most projects: `sm`, `base`, `md`, `lg`, `xl`, `display`.

---

## Concept: `line-height` and Readability

**What it is:** `line-height` sets the height of each line of text — effectively controlling
the vertical space between lines (leading).

**The problem before:**

```css
p { font-size: 1rem; }
/* Default line-height varies by browser but is often ~1.2 */
/* At 1.2, lines are cramped — reading long text is tiring */
```

**The solution:**

```css
body { line-height: 1.7; }    /* 1.7 × font-size = space between baselines */
h1   { line-height: 1.1; }    /* tighter for large headings — generous for body */
```

**Rule of thumb:**
- Body text: `1.5`–`1.8` — generous for readability
- Headings: `1.0`–`1.3` — tight, since large letters need less leading

**Canonical example:**
- **Real-world analogy:** Notebook with wide ruled vs. college ruled lines. Wide ruled
  (high `line-height`) is easier to read; college ruled (low `line-height`) packs more lines.

**Project Application:**
All body copy in the portfolio uses `line-height: 1.7`. Headings use `line-height: 1.1`.

**Smallest possible example:**
```css
p { line-height: 1.7; }
h1 { line-height: 1.1; }
```

**Why it matters here:** Typography is 95% of the portfolio's readability. Getting line height
right is not decoration — it is the difference between a comfortable read and an exhausting one.

**Watch for:** `line-height` is unitless by default and that is intentional — it is a ratio
relative to the element's own font size. `line-height: 1.7` scales correctly when font size
changes. `line-height: 27px` does not.

---

## Step 1 — Create Files

`projects/lab-08/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 08 — Typography Scale</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="page">
      <header class="type-demo">
        <p class="label">Creative Developer</p>
        <h1 class="display-heading">Building things people love to use.</h1>
        <p class="subheading">CSS, JavaScript, and Three.js — from idea to pixel-perfect.</p>
        <p class="body-text">
          Great interfaces are not an accident. They are the result of deliberate
          choices about type, space, color, and motion — decisions that most users
          never consciously notice but always feel.
        </p>
        <p class="caption">Available for freelance from January 2026 · London, UK</p>
      </header>
    </div>
  </body>
</html>
```

---

> **CSS AND SEE**
>
> Open with Live Server. Five text elements stacked in default browser type.
> Every heading looks similar because no scale is applied yet.

---

## Step 2 — Declare the Type Scale

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  /* Type scale — each level is used by exactly one role */
  --text-caption:  0.75rem;                           /* 12px — smallest */
  --text-sm:       0.875rem;                          /* 14px — labels, metadata */
  --text-base:     1rem;                              /* 16px — body */
  --text-lg:       1.25rem;                           /* 20px — lead text */
  --text-subhead:  clamp(1.25rem, 2.5vw, 1.75rem);   /* 20–28px — fluid subheading */
  --text-display:  clamp(2.5rem, 6vw, 5rem);          /* 40–80px — fluid headline */

  /* Line heights — different for heading vs body */
  --lh-heading: 1.1;   /* tight — headings don't need breathing room between lines */
  --lh-body:    1.7;   /* generous — body needs room for comfortable reading */

  /* Colors */
  --color-bg: #ffffff;
  --color-text: #1a1a2e;
  --color-muted: #6b6b8a;
  --color-accent: #6c63ff;
}
```

---

> **CSS AND SEE**
>
> The page looks unchanged — you have declared tokens but not applied them yet.

---

## Step 3 — Apply Base Body Styles

```css
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;  /* OS native font — no loading */
  font-size: var(--text-base);
  line-height: var(--lh-body);
  color: var(--color-text);
  background: var(--color-bg);
}

.page {
  max-width: 760px;           /* comfortable reading width — never wider than this */
  margin: 0 auto;
  padding: 80px 32px;
}
```

---

> **CSS AND SEE**
>
> **You should see:** Clean body text with better spacing. All content still looks like
> default browser type because headings have not been sized yet.

---

## Step 4 — Apply the Scale to Each Element

```css
.label {
  font-size: var(--text-sm);
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;    /* wider spacing for small-caps style labels */
  font-weight: 600;
  margin: 0 0 12px 0;
}

.display-heading {
  font-size: var(--text-display);     /* fluid: scales from 40px to 80px */
  line-height: var(--lh-heading);     /* tight: headings need less leading */
  font-weight: 800;
  margin: 0 0 24px 0;
  color: var(--color-text);
}

.subheading {
  font-size: var(--text-subhead);     /* fluid: scales from 20px to 28px */
  line-height: 1.4;
  color: var(--color-muted);
  margin: 0 0 32px 0;
  font-weight: 400;
}

.body-text {
  font-size: var(--text-base);
  line-height: var(--lh-body);       /* generous leading for comfortable reading */
  color: var(--color-text);
  max-width: 65ch;                   /* 65 character measure — optimal reading length */
  margin: 0 0 24px 0;
}

.caption {
  font-size: var(--text-caption);
  color: var(--color-muted);
  letter-spacing: 0.02em;
  margin: 0;
}
```

`max-width: 65ch` limits the line length to 65 characters wide. `ch` is the width of the
"0" character in the current font. Research shows 50–75 characters per line is the optimal
reading width for body text.

---

> **CSS AND SEE**
>
> **You should see:** A clear visual hierarchy — the label is tiny and accented, the display
> heading is large and bold, the subheading is medium and muted, the body text is comfortable
> reading width, and the caption is small and quiet.
>
> **Fluid test:** Drag the browser window narrower. Watch the display heading shrink
> smoothly from ~80px to ~40px. The body text stays 16px — it does not need to scale.
>
> **Change something:** Change `--text-display: clamp(2.5rem, 6vw, 5rem)` to
> `clamp(2.5rem, 10vw, 5rem)`. Save. At medium viewport widths, the heading is now much
> larger. Drag the window to test the range. Change back to `6vw`.

---

## 🎯 Challenge: Load a Google Font

**You know:** `font-family` uses a font name. `@import` or `<link>` can load external fonts.

**Task:** Add a Google Font to the page. Choose a display font (try "Space Grotesk" or
"DM Sans") and apply it to `.display-heading` only. Body text should stay `system-ui`.
The font should be bold weight (700 or 800).

**Hint:** Go to fonts.google.com, select your font, choose the weights you want, and copy
the `<link>` tags into the `<head>` of your HTML. Then use `font-family: 'Font Name', sans-serif`.

---

<details>
<summary>▶ Show Solution</summary>

In `index.html` `<head>`, before `<link rel="stylesheet">`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet">
```

In `styles.css`:
```css
.display-heading {
  font-family: 'Space Grotesk', system-ui, sans-serif;  /* ← add font-family */
  /* all other properties remain the same */
}
```

**Key insight:** `rel="preconnect"` tells the browser to open a TCP connection to
`fonts.googleapis.com` immediately, before the font is requested. This saves the
connection setup time when the actual font CSS loads. `display=swap` tells the browser
to show fallback text immediately and swap to the custom font when it loads, preventing
a blank text flash.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Display heading uses `clamp()` | Resize window — heading scales smoothly with viewport |
| Body text stays 16px | Resize window — body text does not change size |
| Visual hierarchy clear | Label < body < subheading < heading at a glance |
| 65ch reading width | Body text paragraph does not extend full page width |
| Tight line-height on heading | Lines of heading text are close together |
| Generous line-height on body | Body text has comfortable breathing room between lines |

---

## What's Next

LAB 09 shifts from pure CSS to JavaScript. You will use `document.querySelector` to select
elements and change their content and styles dynamically — the foundation of every
interactive interface.

---

## Transfer Exercise

Type scales are used in design systems beyond the web. iOS's Human Interface Guidelines
defines a "Dynamic Type" system with named sizes (largeTitle, title1, body, caption1, etc.)
that scale based on the user's accessibility preferences.

How is iOS Dynamic Type equivalent to CSS custom property type tokens? What is the key
difference: what does the iOS system handle automatically that you have to implement
manually with CSS?

---

## Quick Check Answers

**1. The problem with pure `vw` font sizes?**
Without minimum/maximum constraints, `5vw` on a 300px phone screen = 15px — a heading
that is the same size as body text, barely readable as a heading. On a 4K monitor at
3840px wide, `5vw = 192px` — so large it cannot fit a word without wrapping. The
useful range of `vw` is narrow, and the extremes are both broken.

**2. What does `clamp(24px, 5vw, 72px)` do differently from `5vw`?**
It guarantees the result is never less than 24px (keeps headings readable on small screens)
and never more than 72px (keeps them from becoming cartoonishly huge on large screens). The
fluid scaling still happens — it just has enforced bounds. The browser evaluates the
condition on every resize event.

**3. Where would you define a base font size so all sizes scale together?**
On `:root` or `html` as a `font-size` value. All `rem` units in the page are relative to
this root font size. Change `:root { font-size: 18px }` and every element using `rem` units
scales proportionally. This is why the type scale uses `rem` for fixed levels — they
inherit scaling from the root.
