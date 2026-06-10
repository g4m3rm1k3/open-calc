# Creative Web Masterclass — LAB 28 — Portfolio Shell: Full-Viewport Scroll Sections

**Prerequisites:** LAB-27. You have all CSS and JS techniques. Now we assemble the portfolio.

**What this lab adds:**
- The full portfolio HTML structure with all sections
- `scroll-behavior: smooth` — anchor links scroll smoothly
- `scroll-snap-type` — optional section snapping
- Active section tracking via IntersectionObserver
- The CSS shell that subsequent labs (LAB-29–34) will build inside

**Time:** 40–50 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  [Nav] ←─────── fixed left ribbon nav               │
 │  ┌────────────────────────────────────────────────┐  │
 │  │  #hero — Three.js background + text            │  │
 │  ├────────────────────────────────────────────────┤  │
 │  │  #work — Card grid with projects               │  │
 │  ├────────────────────────────────────────────────┤  │
 │  │  #canvas — Interactive particle widget         │  │
 │  ├────────────────────────────────────────────────┤  │
 │  │  #terminal — Typewriter animation              │  │
 │  ├────────────────────────────────────────────────┤  │
 │  │  #contact — Contact form                       │  │
 │  └────────────────────────────────────────────────┘  │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. `scroll-behavior: smooth` makes anchor link clicks scroll smoothly. Does it affect
>    programmatic `window.scrollTo()` calls? What CSS property controls this for programmatic
>    scrolling?
> 2. `scroll-snap-type: y mandatory` on a container makes scroll snap to sections. What
>    is the downside of using mandatory snap on a portfolio with long sections?
> 3. How would you track which section the user is currently scrolled to — without listening
>    to the scroll event?
>
> *(Answers at the end)*

---

## Concept: Portfolio Section Architecture

**What it is:** The portfolio is a single HTML page with five sections, each taking at
least one full viewport height. Navigation is via anchor links (`<a href="#work">`) and
a fixed sidebar nav that highlights the current section.

```html
<!-- Each section has an id for anchor linking -->
<section id="hero" class="port-section">...</section>
<section id="work" class="port-section">...</section>
<section id="canvas" class="port-section">...</section>
<section id="terminal" class="port-section">...</section>
<section id="contact" class="port-section">...</section>
```

```css
.port-section {
  min-height: 100vh;   /* at least full viewport height */
  position: relative;  /* for absolute-positioned children */
}
```

**Why `min-height: 100vh` not `height: 100vh`:** Some sections (work, contact) may have
more content than one viewport. `min-height` allows them to grow; `height: 100vh` would
clip the content.

---

## Step 1 — Create Files

`projects/lab-28/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Portfolio</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>

    <!-- Ribbon nav — built in LAB-29 -->
    <nav class="ribbon-nav" aria-label="Portfolio sections">
      <ul class="ribbon-list">
        <li><a href="#hero"     class="ribbon-link" data-section="hero">Hero</a></li>
        <li><a href="#work"     class="ribbon-link" data-section="work">Work</a></li>
        <li><a href="#canvas"   class="ribbon-link" data-section="canvas">Canvas</a></li>
        <li><a href="#terminal" class="ribbon-link" data-section="terminal">Terminal</a></li>
        <li><a href="#contact"  class="ribbon-link" data-section="contact">Contact</a></li>
      </ul>
    </nav>

    <!-- Main content -->
    <main class="portfolio">

      <section id="hero" class="port-section section-hero">
        <div class="section-inner">
          <h1 class="placeholder-heading">Hero Section</h1>
          <p class="placeholder-sub">Three.js background + animated text — built in LAB-30</p>
        </div>
      </section>

      <section id="work" class="port-section section-work">
        <div class="section-inner">
          <h2 class="placeholder-heading">Work Section</h2>
          <p class="placeholder-sub">Card grid with projects — built in LAB-31</p>
        </div>
      </section>

      <section id="canvas" class="port-section section-canvas">
        <div class="section-inner">
          <h2 class="placeholder-heading">Canvas Section</h2>
          <p class="placeholder-sub">Interactive particle widget — built in LAB-32</p>
        </div>
      </section>

      <section id="terminal" class="port-section section-terminal">
        <div class="section-inner">
          <h2 class="placeholder-heading">Terminal Section</h2>
          <p class="placeholder-sub">Typewriter animation — built in LAB-33</p>
        </div>
      </section>

      <section id="contact" class="port-section section-contact">
        <div class="section-inner">
          <h2 class="placeholder-heading">Contact Section</h2>
          <p class="placeholder-sub">Contact form with validation</p>
        </div>
      </section>

    </main>

    <script src="main.js"></script>
  </body>
</html>
```

---

## Step 2 — Styles

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
  --nav-width: 60px;   /* width of the left ribbon nav */
}

html { scroll-behavior: smooth; }   /* smooth anchor link scrolling */

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
}

/* ---- Portfolio layout ---- */
.portfolio {
  margin-left: var(--nav-width);   /* push content right to make room for nav */
}

/* ---- Each section ---- */
.port-section {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--color-border);
}

.section-inner {
  max-width: 900px;
  width: 100%;
  padding: 80px 40px;
}

/* ---- Section accent colors (left border) ---- */
.section-hero     { border-left: 4px solid hsl(244, 95%, 65%); }
.section-work     { border-left: 4px solid hsl(175, 80%, 50%); }
.section-canvas   { border-left: 4px solid hsl(28, 95%, 58%); }
.section-terminal { border-left: 4px solid hsl(152, 60%, 55%); }
.section-contact  { border-left: 4px solid hsl(8, 90%, 62%); }

/* ---- Ribbon nav: stub styles — detailed in LAB-29 ---- */
.ribbon-nav {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--nav-width);
  height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.ribbon-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ribbon-link {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  text-indent: -9999px;   /* hide text — show only dot */
  transition: background 0.2s ease, transform 0.2s ease;
}

.ribbon-link:hover { background: var(--color-primary); }
.ribbon-link.is-active { background: var(--color-primary); transform: scale(1.5); }

/* ---- Placeholder content ---- */
.placeholder-heading {
  font-size: clamp(2rem, 5vw, 4rem);
  margin: 0 0 16px 0;
  font-weight: 700;
  color: var(--color-primary);
}
.placeholder-sub { margin: 0; color: var(--color-muted); font-size: 1rem; }
```

---

> **CSS AND SEE**
>
> **You should see:** Five tall sections with left-side accent borders. A narrow left column
> (the ribbon nav) showing five dots. Click the dots — smooth scroll to each section.
> The active dot is not yet highlighted — that is the JavaScript task.

---

## Step 3 — Active Section Tracking

`main.js`:

```js
const sections = document.querySelectorAll('.port-section');
const navLinks = document.querySelectorAll('.ribbon-link');

// Map section IDs to their nav links for fast lookup
const linkMap = {};
navLinks.forEach(function (link) {
  linkMap[link.dataset.section] = link;
});

function setActive(sectionId) {
  navLinks.forEach(function (link) { link.classList.remove('is-active'); });
  if (linkMap[sectionId]) {
    linkMap[sectionId].classList.add('is-active');
  }
}

// Track which section is in view
const sectionObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  },
  {
    threshold: 0.3,   // section must be 30% visible before it activates
    rootMargin: '0px 0px -30% 0px'   // only consider the upper 70% of viewport
  }
);

sections.forEach(function (section) {
  sectionObserver.observe(section);
});
```

---

> **SAVE AND TRY**
>
> **You should see:** The nav dots highlight as you scroll — the dot for the current section
> is white/purple and larger. Click a dot — smooth scroll to that section and its dot activates.

---

## 🎯 Challenge: Keyboard Navigation

**You know:** `keydown` events, `window.scrollTo()`, section IDs.

**Task:** Add keyboard navigation — pressing `ArrowDown` scrolls to the next section,
`ArrowUp` to the previous. Track `currentSectionIndex` as a number and use
`sections[currentSectionIndex].scrollIntoView({ behavior: 'smooth' })`.

---

<details>
<summary>▶ Show Solution</summary>

```js
let currentIndex = 0;

document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowDown' && currentIndex < sections.length - 1) {
    currentIndex++;
    sections[currentIndex].scrollIntoView({ behavior: 'smooth' });
  } else if (event.key === 'ArrowUp' && currentIndex > 0) {
    currentIndex--;
    sections[currentIndex].scrollIntoView({ behavior: 'smooth' });
  }
});
```

Update `setActive` to also track `currentIndex`:
```js
function setActive(sectionId) {
  navLinks.forEach(function (link) { link.classList.remove('is-active'); });
  if (linkMap[sectionId]) {
    linkMap[sectionId].classList.add('is-active');
  }
  sections.forEach(function (s, i) { if (s.id === sectionId) currentIndex = i; });
}
```

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| 5 sections visible | Scroll — 5 distinct sections with accent borders |
| Smooth scroll on nav click | Click dot — smooth animation to section |
| Active dot highlights | Current section's dot is highlighted and larger |
| Content offset by nav width | Sections not hidden behind nav |

---

## What's Next

LAB 29 builds the full ribbon nav — with section labels, tooltips, and a progress indicator.
LAB 30 replaces the hero placeholder with the Three.js background.

---

## Quick Check Answers

**1. Does `scroll-behavior: smooth` affect `window.scrollTo()`?**
Yes, if set on the `html` element. `scroll-behavior: smooth` on `html` applies to all
scrolling — both anchor link clicks and programmatic `window.scrollTo()` calls. To override
for a specific programmatic scroll, pass `{ behavior: 'instant' }` as an option:
`window.scrollTo({ top: 0, behavior: 'instant' })`.

**2. Downside of `scroll-snap-type: y mandatory`?**
Mandatory snapping forces the viewport to always land on a snap point. For sections taller
than one viewport, the user cannot freely scroll within the section — the page snaps to
the top of the section and then to the next. This makes long content sections (like a work
grid with many projects) inaccessible. Use `scroll-snap-type: y proximity` instead — snap
only when close to a snap point, allowing free scrolling within sections.

**3. Track current section without scroll events?**
IntersectionObserver. Observe each section with a threshold (e.g., 0.3). When a section
becomes 30% visible, it is "current." This fires the callback without listening to the
scroll event directly, avoiding per-scroll-pixel calculations.
