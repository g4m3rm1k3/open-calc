# Creative Web Masterclass — LAB 27 — Scroll Reveals: Sections Animate Into View

**Prerequisites:** LAB-26 (visual hierarchy layout) and LAB-12 (IntersectionObserver).

**What this lab adds:**
- Applying IntersectionObserver to the full visual-hierarchy layout from LAB-26
- Multiple reveal animation types: fade-up, fade-left, scale-in
- `data-reveal` attribute pattern — driving animation type from HTML
- Stagger groups — multiple children inside one parent animate in sequence
- The complete technique used in the portfolio (LAB-28–34)

**Time:** 45–55 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │ [Hero: visible instantly, no reveal needed]          │
 │                                                      │
 │ [Stats: fades up as a group]                         │
 │                                                      │
 │ [Work card 1] ← fades left    [Card 2] ← fades left  │
 │               [Card 3] ← fades left (staggered)      │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. In LAB-12, each `.reveal-section` had the same animation. How would you give different
>    elements different entrance animations using only CSS and a data attribute?
> 2. The hero section is immediately visible when the page loads. Should it have a scroll
>    reveal animation? Why or why not?
> 3. What is the difference between revealing a parent element and revealing individual
>    children one by one? Which looks more sophisticated?
>
> *(Answers at the end)*

---

## Concept: `data-reveal` Attribute Pattern

**What it is:** Instead of separate CSS classes for each animation type, use a single
`data-reveal` attribute on the element and CSS attribute selectors to apply the right
animation:

```html
<section data-reveal="fade-up">...</section>
<div data-reveal="fade-left">...</div>
<div data-reveal="scale-in">...</div>
```

```css
/* Base hidden state — all reveal elements start hidden */
[data-reveal] {
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* Each type has a different starting transform */
[data-reveal="fade-up"]   { transform: translateY(40px); }
[data-reveal="fade-left"] { transform: translateX(-40px); }
[data-reveal="scale-in"]  { transform: scale(0.9); }

/* When revealed: all types become visible at natural position */
[data-reveal].is-visible  { opacity: 1; transform: none; }
```

The JavaScript only adds `is-visible` — it does not need to know which animation type
each element uses. HTML declares the intent; CSS handles the visuals.

---

## Concept: Stagger Groups

**What it is:** A stagger group is a parent whose children all animate in with increasing
delay. The parent is observed; when it becomes visible, its children get staggered delays.

```js
// When a stagger parent is observed:
const children = entry.target.querySelectorAll('[data-stagger-child]');
children.forEach(function (child, index) {
  child.style.transitionDelay = (index * 0.1) + 's';
  child.classList.add('is-visible');
});
```

The parent itself does not animate — it is just the observation target. The children
have `[data-stagger-child]` attribute and use the same `[data-reveal]` CSS rules.

---

## Step 1 — Create Files

`projects/lab-27/index.html` — same structure as LAB-26 but with `data-reveal` attributes added:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 27 — Scroll Reveals</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="page">

      <!-- Hero: no reveal — it's immediately visible -->
      <section class="hero">
        <p class="eyebrow" data-reveal="fade-up">Available for work</p>
        <h1 class="display-title" data-reveal="fade-up" style="transition-delay: 0.1s">Hi, I'm Alex.</h1>
        <p class="hero-role" data-reveal="fade-up" style="transition-delay: 0.2s">Creative Web Developer</p>
        <p class="hero-body" data-reveal="fade-up" style="transition-delay: 0.3s">
          I build interactive web experiences using Three.js, Canvas 2D, and modern CSS.
        </p>
        <div class="hero-cta" data-reveal="fade-up" style="transition-delay: 0.4s">
          <a href="#work" class="btn btn-primary">See My Work</a>
          <a href="#contact" class="btn btn-ghost">Get In Touch</a>
        </div>
      </section>

      <!-- Stats: fade up as a group -->
      <section class="stats-section" data-reveal="fade-up">
        <div class="stats-row">
          <div class="stat"><span class="stat-value">12</span><span class="stat-label">Projects</span></div>
          <div class="stat"><span class="stat-value">3</span><span class="stat-label">Years</span></div>
          <div class="stat"><span class="stat-value">5</span><span class="stat-label">Technologies</span></div>
        </div>
      </section>

      <!-- Work section header -->
      <section class="work-section" id="work">
        <div class="section-header" data-reveal="fade-up">
          <p class="section-label">Selected Work</p>
          <h2 class="section-title">What I've Built</h2>
        </div>

        <!-- Stagger group: cards animate in one by one -->
        <div class="work-grid" data-stagger-parent>
          <article class="work-item work-item-featured" data-reveal="fade-left" data-stagger-child>
            <div class="work-meta">Three.js + WebGL</div>
            <h3 class="work-title">3D Portfolio Background</h3>
            <p class="work-desc">Floating particle system behind HTML content.</p>
          </article>
          <article class="work-item" data-reveal="fade-left" data-stagger-child>
            <div class="work-meta">Canvas 2D</div>
            <h3 class="work-title">Particle Engine</h3>
            <p class="work-desc">200 particles with velocity, friction, and mouse interaction.</p>
          </article>
          <article class="work-item" data-reveal="fade-left" data-stagger-child>
            <div class="work-meta">CSS + JS</div>
            <h3 class="work-title">Scroll Reveals</h3>
            <p class="work-desc">IntersectionObserver entrance animations with stagger.</p>
          </article>
        </div>
      </section>

    </main>
    <script src="main.js"></script>
  </body>
</html>
```

---

## Step 2 — Styles

`styles.css` — same as LAB-26 plus the reveal system:

```css
/* ---- Copy all styles from lab-26/styles.css ---- */
/* ... (same :root, body, .page, .hero, .stats-section, .work-grid, etc.) ... */

/* ---- Reveal system: added at the bottom ---- */

/* All elements with data-reveal start hidden */
[data-reveal] {
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* Each reveal type has a different starting position */
[data-reveal="fade-up"]   { transform: translateY(36px); }
[data-reveal="fade-left"] { transform: translateX(-36px); }
[data-reveal="fade-right"] { transform: translateX(36px); }
[data-reveal="scale-in"]  { transform: scale(0.88); }

/* Visible state: reset to natural position */
[data-reveal].is-visible {
  opacity: 1;
  transform: none;
}
```

The `transform: none` in `.is-visible` covers all transform types — `translateY`,
`translateX`, and `scale` are all overridden to "no transform" by `none`.

---

> **CSS AND SEE**
>
> **You should see:** A blank page! All elements with `data-reveal` are hidden (opacity: 0).
> The hero text, stats, section header, and work cards are all invisible. This is correct
> — the JavaScript will reveal them based on viewport position.

---

## Step 3 — The Reveal Observer

`main.js`:

```js
// Observe all elements with data-reveal
const revealElements = document.querySelectorAll('[data-reveal]');

// Observe stagger parent containers
const staggerParents = document.querySelectorAll('[data-stagger-parent]');

// Standard reveal observer
const revealObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealElements.forEach(function (el) {
  // Skip elements inside stagger parents — those are handled separately
  if (!el.closest('[data-stagger-parent]')) {
    revealObserver.observe(el);
  }
});

// Stagger group observer
const staggerObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // Find all children marked data-stagger-child inside this parent
        const children = entry.target.querySelectorAll('[data-stagger-child]');
        children.forEach(function (child, index) {
          child.style.transitionDelay = (index * 0.12) + 's';
          child.classList.add('is-visible');
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

staggerParents.forEach(function (parent) {
  staggerObserver.observe(parent);
});
```

`el.closest('[data-stagger-parent]')` walks up the DOM tree from `el` looking for an
ancestor matching the selector. If a `[data-reveal]` element is inside a stagger parent,
we skip it for the normal observer — the stagger observer handles it instead.

---

> **SAVE AND TRY**
>
> **You should see:** A page that starts blank, then reveals content as it enters the
> viewport. The hero elements animate up one by one (staggered by inline `transition-delay`).
> Scroll down — the stats fade up, the section header fades up, the work cards slide in
> from the left one by one.
>
> **Verify:** Reload the page and quickly scroll to the bottom before animations finish.
> The elements still animate in — IntersectionObserver fires when they enter view, not
> only on initial load.

---

## 🎯 Challenge: Scale-In Hero Stats

**You know:** `data-reveal`, `transition-delay`, stagger observer.

**Task:** Change the `.stats-section` from a single `data-reveal="fade-up"` on the parent
to individual `data-reveal="scale-in"` on each `.stat` with stagger delays of 0s, 0.15s,
0.3s. The numbers should pop in one by one with a scale-from-90%-to-100% entrance.

---

<details>
<summary>▶ Show Solution</summary>

In HTML, remove `data-reveal="fade-up"` from `.stats-section` and add to each `.stat`:
```html
<div class="stat" data-reveal="scale-in">...</div>
<div class="stat" data-reveal="scale-in" style="transition-delay: 0.15s">...</div>
<div class="stat" data-reveal="scale-in" style="transition-delay: 0.3s">...</div>
```

These will now be picked up by the standard `revealObserver` since they are not inside
a `data-stagger-parent`. The scale-in CSS is already defined.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Hero elements stagger in on load | Reload — eyebrow, title, role, body animate up sequentially |
| Stats reveal on scroll | Scroll down — stats block fades up |
| Work cards stagger in from left | Cards appear one by one, sliding from left |
| Already-visible elements reveal | Viewport items reveal without scrolling |
| Revealed elements stay visible | Scroll up — revealed content remains visible |

---

## What's Next

LAB 28 builds the complete portfolio shell — a full multi-section page with smooth
scroll navigation between sections. This assembles everything learned in LAB-24 through
LAB-27 into a real portfolio structure.

---

## Quick Check Answers

**1. How to give different elements different entrance animations with only CSS and data attributes?**
Use `[data-reveal="fade-up"]`, `[data-reveal="fade-left"]` etc. CSS attribute selectors
apply different `transform` starting values to each. The JavaScript only adds `is-visible`
— it does not need to know which type. HTML declares the animation intent; CSS implements
it. This separation keeps the JavaScript simple (one class toggle) and the HTML declarative.

**2. Should the hero have a scroll reveal animation?**
No. The hero is immediately visible — the user sees it the moment the page loads. A scroll
reveal (start hidden, animate in when entering viewport) would cause the page to appear
blank for a moment then animate in — a bad first impression. Instead, use CSS `animation`
with a short `animation-delay` for hero elements (they animate in as the page loads, not
as you scroll). Only use scroll reveals for content *below* the initial viewport.

**3. Revealing individual children vs the parent?**
Individual children with stagger looks more sophisticated. When the entire parent reveals
at once, it feels like a block appearing. When children appear sequentially, the eye is
guided — each element draws attention in turn, then the next. Staggered reveals mimic how
humans naturally scan a page (top to bottom, left to right) and reinforces the visual
hierarchy.
