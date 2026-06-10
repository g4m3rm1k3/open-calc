# Creative Web Masterclass — LAB 26 — Visual Hierarchy: Size, Contrast, and Spacing

**Prerequisites:** LAB-25. You have micro-interactions. This lab is pure CSS/design.

**What this lab adds:**
- The three tools of visual hierarchy: size, contrast, and spacing
- Type scale in practice — applied to a real page layout
- Whitespace as a design element — generous spacing feels premium
- Grid and alignment — how invisible grids organize information
- A complete "about me" section layout

**Time:** 35–50 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │                                                      │
 │  Hi, I'm Alex ← large, high contrast (primary)      │
 │  Creative Web Developer                              │
 │  ─────────────────────                               │
 │  I build interactive... ← body copy, muted           │
 │                                                      │
 │  [Skills]  [Projects]  [Contact]  ← stats row        │
 │   React     12          hello@     ← data, muted     │
 │                                                      │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. You have two pieces of text: a heading and supporting copy. Without changing color,
>    font weight, or spacing — only using size — which one gets a larger font?
> 2. "Contrast" in visual hierarchy does not just mean color contrast. What other
>    properties can you use to create contrast between elements?
> 3. Why does generous whitespace feel "premium"? What psychological effect does it have?
>
> *(Answers at the end)*

---

## Concept: The Three Tools of Visual Hierarchy

**What they are:** Visual hierarchy is the arrangement of elements so the viewer's eye
moves through them in the intended order. Three tools create hierarchy:

**1. Size** — larger elements demand more attention. The heading is the first thing seen
because it is largest. Supporting text is smaller. Meta-text (dates, categories) is smallest.

```
h1: clamp(3rem, 7vw, 5.5rem)   ← most important
h2: clamp(2rem, 4vw, 3rem)
h3: 1.5rem
body: 1rem
meta: 0.8rem                   ← least important
```

**2. Contrast** — elements that differ from their surroundings draw attention. Contrast
comes from color, weight, size, and spacing. A bright purple heading on a dark background
has high contrast — it is seen first. A gray paragraph on dark gray has low contrast —
it is read second.

**3. Spacing** — distance communicates relationship. Elements close together feel related.
Elements far apart feel separate. Leading (line-height) inside a block communicates that
the lines belong together. The gap between blocks communicates section separation.

---

## Concept: Whitespace as a Design Tool

**What it is:** Whitespace (empty space) is not wasted space — it is active. More
whitespace around an element increases perceived importance and "breathing room."

```css
/* Tight — feels crowded, rushed, low-budget */
.section { padding: 24px; }

/* Generous — feels spacious, premium, intentional */
.section { padding: 120px 24px; }
```

The same content at `padding: 120px 24px` feels more premium than at `padding: 24px`
because luxury brands (Apple, fashion houses) use generous whitespace to signal that
every element is important enough to stand alone.

**Rule of thumb:** If you think the padding is too large, double it.

---

## Step 1 — Create Files

`projects/lab-26/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 26 — Visual Hierarchy</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <main class="page">

      <!-- Hero: maximum hierarchy contrast -->
      <section class="hero">
        <div class="hero-inner">
          <p class="eyebrow">Available for work</p>
          <h1 class="display-title">Hi, I'm Alex.</h1>
          <p class="hero-role">Creative Web Developer</p>
          <p class="hero-body">
            I build interactive web experiences using Three.js, Canvas 2D, and
            modern CSS. I believe the web should feel alive.
          </p>
          <div class="hero-cta">
            <a href="#work" class="btn btn-primary">See My Work</a>
            <a href="#contact" class="btn btn-ghost">Get In Touch</a>
          </div>
        </div>
      </section>

      <!-- Stats: low hierarchy, supporting information -->
      <section class="stats-section">
        <div class="stats-row">
          <div class="stat">
            <span class="stat-value">12</span>
            <span class="stat-label">Projects</span>
          </div>
          <div class="stat">
            <span class="stat-value">3</span>
            <span class="stat-label">Years</span>
          </div>
          <div class="stat">
            <span class="stat-value">5</span>
            <span class="stat-label">Technologies</span>
          </div>
        </div>
      </section>

      <!-- Work section: medium hierarchy -->
      <section class="work-section" id="work">
        <div class="section-header">
          <p class="section-label">Selected Work</p>
          <h2 class="section-title">What I've Built</h2>
        </div>
        <div class="work-grid">
          <article class="work-item work-item-featured">
            <div class="work-meta">Three.js + WebGL</div>
            <h3 class="work-title">3D Portfolio Background</h3>
            <p class="work-desc">Floating particle system behind HTML content with mouse repulsion and scroll parallax.</p>
          </article>
          <article class="work-item">
            <div class="work-meta">Canvas 2D</div>
            <h3 class="work-title">Particle Engine</h3>
            <p class="work-desc">A 200-particle field with velocity, friction, and mouse interaction.</p>
          </article>
          <article class="work-item">
            <div class="work-meta">CSS + JS</div>
            <h3 class="work-title">Scroll Reveals</h3>
            <p class="work-desc">IntersectionObserver-powered entrance animations with stagger.</p>
          </article>
        </div>
      </section>

    </main>

  </body>
</html>
```

---

## Step 2 — Styles: Visual Hierarchy in Practice

`styles.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
:root {
  --color-primary: hsl(244, 95%, 65%);
  --color-bg: hsl(240, 20%, 8%);
  --color-surface: hsl(240, 18%, 13%);
  --color-border: hsl(240, 14%, 20%);
  --color-text: hsl(240, 5%, 94%);
  --color-muted: hsl(240, 8%, 42%);
  --color-subtle: hsl(240, 8%, 30%);

  /* Type scale — size ratios create automatic hierarchy */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.25rem;
  --text-xl:   1.5rem;
  --text-2xl:  2rem;
  --text-3xl:  clamp(2.5rem, 5vw, 3.5rem);
  --text-hero: clamp(3.5rem, 8vw, 6rem);
}

body { margin: 0; font-family: system-ui, sans-serif; background: var(--color-bg); color: var(--color-text); line-height: 1.6; }

.page { max-width: 1100px; margin: 0 auto; padding: 0 40px; }

/* ---- Hero: maximum visual weight ---- */
.hero { padding: 160px 0 100px; }

.eyebrow {
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.eyebrow::before {
  content: '';
  display: block;
  width: 32px;
  height: 1px;
  background: var(--color-primary);
}

.display-title {
  font-size: var(--text-hero);
  line-height: 1.0;
  font-weight: 800;
  margin: 0 0 12px 0;
  letter-spacing: -0.03em;   /* tight tracking on large type looks more refined */
}

.hero-role {
  font-size: var(--text-xl);
  color: var(--color-muted);
  margin: 0 0 32px 0;
  font-weight: 400;
}

.hero-body {
  font-size: var(--text-base);
  color: var(--color-muted);
  max-width: 50ch;            /* 50 characters wide — comfortable reading width */
  line-height: 1.7;
  margin: 0 0 40px 0;
}

.hero-cta { display: flex; gap: 16px; }

.btn {
  display: inline-block;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(108,99,255,0.35); }

.btn-ghost { color: var(--color-primary); border: 1px solid var(--color-border); }
.btn-ghost:hover { border-color: var(--color-primary); transform: translateY(-2px); }

/* ---- Stats: low hierarchy (supporting) ---- */
.stats-section {
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 48px 0;
  margin-bottom: 120px;
}

.stats-row { display: flex; gap: 64px; }

.stat { display: flex; flex-direction: column; }

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1;
  color: var(--color-text);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ---- Work section: medium hierarchy ---- */
.section-label {
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-primary);
  margin: 0 0 12px 0;
}

.section-title {
  font-size: var(--text-2xl);
  margin: 0 0 56px 0;
  font-weight: 700;
}

.work-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;   /* first item is twice as wide — emphasis */
  gap: 20px;
  margin-bottom: 120px;
}

.work-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 32px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.work-item:hover {
  border-color: rgba(108, 99, 255, 0.4);
  transform: translateY(-3px);
}

.work-item-featured { padding: 40px; }   /* featured item has more padding = more space = more weight */

.work-meta { font-size: var(--text-xs); color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 12px; }

.work-title { font-size: var(--text-lg); margin: 0 0 12px 0; font-weight: 600; }

.work-item-featured .work-title { font-size: var(--text-xl); }

.work-desc { font-size: var(--text-sm); color: var(--color-muted); line-height: 1.6; margin: 0; }
```

Notice the hierarchy layers at work:
- `.display-title` at `var(--text-hero)` (up to 6rem) — most important
- `.hero-role` at `var(--text-xl)` — secondary, muted color
- `.hero-body` at base size, muted color — supporting copy
- `.section-label` at small size, uppercase, spaced — navigation aid
- `.work-meta` at extra-small, uppercase — least important

Each step down reduces both size and color saturation — a consistent hierarchy signal.

---

> **CSS AND SEE**
>
> **You should see:** A hero with a very large name, subtitle, and two buttons. Below it,
> three stat numbers in large bold type. Then a work grid with the featured item wider
> than the others. The page feels spacious — notice the `160px` top padding in `.hero`.

---

## 🎯 Challenge: Responsive Hierarchy Adjustments

**You know:** `clamp()`, `grid-template-columns`, media queries.

**Task:** Below 768px viewport width, make the work grid single-column:
```css
@media (max-width: 768px) {
  .work-grid { grid-template-columns: 1fr; }
  .hero { padding: 80px 0 60px; }
  .stats-row { gap: 32px; }
}
```

Add this media query and observe how the layout adapts. The hierarchy should still be
clear even at mobile width.

---

## Final Check

| Feature | How to verify |
|---|---|
| Name is largest element | Display title is visually dominant |
| Color hierarchy (bright → muted) | Primary > role > body text contrast reduces |
| Stats numbers large, labels small | Size communicates value vs. label |
| Featured work item wider | First card takes 2x column |
| Generous whitespace between sections | Sections feel separated, premium |

---

## What's Next

LAB 27 combines IntersectionObserver from LAB-12 with the visual hierarchy from this lab
to create scroll-triggered entrance animations — entire sections animate into view as the
user scrolls.

---

## Quick Check Answers

**1. Which text gets a larger font?**
The heading. In a hierarchy, the most important information is largest. The heading
communicates what the section is about — it must be seen first. Supporting copy is smaller
because the reader has already been oriented by the heading and is now reading for detail.

**2. Other properties that create contrast besides color:**
Font weight (bold vs regular), font size, letter-spacing (wide tracking vs tight),
text transform (uppercase vs lowercase), whitespace/spacing around elements, border
or underline vs none. An uppercase, wide-spaced "SELECTED WORK" label contrasts strongly
with regular-case body copy even at the same font size.

**3. Why does generous whitespace feel premium?**
Whitespace signals intentionality. When a designer fills every pixel, it reads as "we
needed to use all this space." When elements have generous space around them, it reads as
"this element is important enough to stand alone." Premium brands use whitespace to
communicate exclusivity and focus. Psychologically, whitespace reduces cognitive load —
the viewer processes one thing at a time rather than being overwhelmed.
