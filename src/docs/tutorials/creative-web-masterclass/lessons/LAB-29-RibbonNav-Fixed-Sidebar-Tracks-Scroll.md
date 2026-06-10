# Creative Web Masterclass — LAB 29 — Ribbon Nav: Fixed Sidebar Tracks Scroll

**Prerequisites:** LAB-28. You have the portfolio shell with stub ribbon nav.

**What this lab adds:**
- Full ribbon nav with section labels that appear on hover
- A scroll progress indicator bar alongside the nav
- Active section highlighting driven by IntersectionObserver
- Tooltip labels that slide in from the nav
- CSS transitions for the label reveal

**Time:** 40–50 minutes

---

## What You Will Build

```
 ┌────────────────────────────────────────────────────────┐
 │ │ ● ← Hero      ← label appears on hover              │
 │ │ ● ← Work                                            │
 │ │ ● ← Canvas    ← active dot is larger, primary color │
 │ │ ● ← Terminal                                        │
 │ │ ● ← Contact                                         │
 │ │                                                      │
 │ │─← thin progress bar fills as page scrolls            │
 └────────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. The nav labels need to appear on hover but not take up space when hidden. What CSS
>    technique lets an element be visually hidden but not affect layout?
> 2. A progress bar fills proportionally with scroll position. If `scrollY = 400` and
>    `maxScroll = 2000`, what percentage should the bar be filled?
> 3. Should the progress bar update in a scroll event handler or in requestAnimationFrame?
>
> *(Answers at the end)*

---

## Concept: Sidebar Label Tooltip

**What it is:** The nav labels are always in the DOM but visually hidden (opacity 0,
translateX pushed off-screen). On hover, they slide in.

```css
.ribbon-label {
  position: absolute;
  left: 100%;              /* just to the right of the nav */
  top: 50%;
  transform: translateY(-50%) translateX(-8px);  /* start slightly inside */
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  /* ... styling ... */
}

.ribbon-item:hover .ribbon-label {
  opacity: 1;
  transform: translateY(-50%) translateX(0);   /* slide to natural position */
}
```

The key: `position: absolute; left: 100%` puts the label at the right edge of the nav.
`pointer-events: none` prevents the label from interfering with mouse events when it
is invisible.

---

## Step 1 — Create Files

Start from LAB-28's project files. `index.html` — extend the ribbon nav HTML:

```html
<!-- Replace the ribbon-nav in lab-28/index.html with this: -->
<nav class="ribbon-nav" aria-label="Portfolio sections">
  <div class="ribbon-progress">
    <div class="ribbon-progress-fill" id="ribbon-progress"></div>
  </div>
  <ul class="ribbon-list">
    <li class="ribbon-item">
      <a href="#hero" class="ribbon-link is-active" data-section="hero">
        <span class="ribbon-dot"></span>
        <span class="ribbon-label">Hero</span>
      </a>
    </li>
    <li class="ribbon-item">
      <a href="#work" class="ribbon-link" data-section="work">
        <span class="ribbon-dot"></span>
        <span class="ribbon-label">Work</span>
      </a>
    </li>
    <li class="ribbon-item">
      <a href="#canvas" class="ribbon-link" data-section="canvas">
        <span class="ribbon-dot"></span>
        <span class="ribbon-label">Canvas</span>
      </a>
    </li>
    <li class="ribbon-item">
      <a href="#terminal" class="ribbon-link" data-section="terminal">
        <span class="ribbon-dot"></span>
        <span class="ribbon-label">Terminal</span>
      </a>
    </li>
    <li class="ribbon-item">
      <a href="#contact" class="ribbon-link" data-section="contact">
        <span class="ribbon-dot"></span>
        <span class="ribbon-label">Contact</span>
      </a>
    </li>
  </ul>
</nav>
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
  --nav-width: 60px;
}

html { scroll-behavior: smooth; }
body { margin: 0; font-family: system-ui, sans-serif; background: var(--color-bg); color: var(--color-text); }
.portfolio { margin-left: var(--nav-width); }
.port-section { min-height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--color-border); }
.section-inner { max-width: 900px; width: 100%; padding: 80px 40px; }
.section-hero     { border-left: 4px solid hsl(244, 95%, 65%); }
.section-work     { border-left: 4px solid hsl(175, 80%, 50%); }
.section-canvas   { border-left: 4px solid hsl(28, 95%, 58%); }
.section-terminal { border-left: 4px solid hsl(152, 60%, 55%); }
.section-contact  { border-left: 4px solid hsl(8, 90%, 62%); }
.placeholder-heading { font-size: clamp(2rem, 5vw, 4rem); margin: 0 0 16px 0; font-weight: 700; color: var(--color-primary); }
.placeholder-sub { margin: 0; color: var(--color-muted); }

/* ---- Ribbon nav ---- */
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

/* Progress bar: thin strip on the left side of the nav */
.ribbon-progress {
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: var(--color-border);
}

.ribbon-progress-fill {
  width: 100%;
  height: 0%;   /* filled by JavaScript */
  background: var(--color-primary);
  transition: height 0.1s linear;
}

/* Nav list */
.ribbon-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 28px; }
.ribbon-item { position: relative; }

.ribbon-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  outline: none;
}

/* The dot */
.ribbon-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  flex-shrink: 0;
  transition: background 0.2s ease, transform 0.2s ease;
}

.ribbon-link:hover .ribbon-dot,
.ribbon-link:focus-visible .ribbon-dot { background: var(--color-primary); }

.ribbon-link.is-active .ribbon-dot {
  background: var(--color-primary);
  transform: scale(1.75);
}

/* The label — hidden by default */
.ribbon-label {
  position: absolute;
  left: calc(100% + 14px);   /* to the right of the nav container */
  top: 50%;
  transform: translateY(-50%) translateX(-6px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 4px 10px;
  border-radius: 4px;
  letter-spacing: 0.04em;
}

/* Label with arrow pointing left */
.ribbon-label::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: var(--color-border);
}

.ribbon-item:hover .ribbon-label,
.ribbon-link:focus-visible .ribbon-label {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}
```

---

> **CSS AND SEE**
>
> **You should see:** The ribbon nav with dots. Hover a dot — a label tooltip slides in
> from the right. The progress bar is at the top (zero scroll). Active dot is not yet
> working — that needs JavaScript.

---

## Step 3 — JavaScript: Active Section + Progress Bar

`main.js`:

```js
const sections = document.querySelectorAll('.port-section');
const navLinks = document.querySelectorAll('.ribbon-link');
const progressFill = document.querySelector('#ribbon-progress');
let currentIndex = 0;

const linkMap = {};
navLinks.forEach(function (link) {
  linkMap[link.dataset.section] = link;
});

function setActive(sectionId) {
  navLinks.forEach(function (link) { link.classList.remove('is-active'); });
  if (linkMap[sectionId]) {
    linkMap[sectionId].classList.add('is-active');
  }
  sections.forEach(function (s, i) { if (s.id === sectionId) currentIndex = i; });
}

// Update progress bar on scroll
window.addEventListener('scroll', function () {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progressFill.style.height = progress + '%';
});

// Track active section
const sectionObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  },
  { threshold: 0.3 }
);

sections.forEach(function (section) {
  sectionObserver.observe(section);
});

// Keyboard navigation
document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowDown' && currentIndex < sections.length - 1) {
    sections[++currentIndex].scrollIntoView({ behavior: 'smooth' });
  } else if (event.key === 'ArrowUp' && currentIndex > 0) {
    sections[--currentIndex].scrollIntoView({ behavior: 'smooth' });
  }
});
```

---

> **SAVE AND TRY**
>
> **You should see:** As you scroll, the thin progress bar on the left edge of the nav
> fills downward. The active dot highlights for the current section. Hover any dot —
> the label slides in. Press ArrowDown/Up to jump between sections.

---

## 🎯 Challenge: Section Color Tinting

**You know:** CSS custom properties, `setProperty`, active section tracking.

**Task:** When a section becomes active, update `--color-primary` on `:root` to match
that section's accent color. When scrolling to "Work" (teal), the nav accent and progress
bar turn teal. Define the color map in JavaScript.

---

<details>
<summary>▶ Show Solution</summary>

```js
const sectionColors = {
  hero: 'hsl(244, 95%, 65%)',
  work: 'hsl(175, 80%, 50%)',
  canvas: 'hsl(28, 95%, 58%)',
  terminal: 'hsl(152, 60%, 55%)',
  contact: 'hsl(8, 90%, 62%)'
};

function setActive(sectionId) {
  navLinks.forEach(function (link) { link.classList.remove('is-active'); });
  if (linkMap[sectionId]) {
    linkMap[sectionId].classList.add('is-active');
    document.documentElement.style.setProperty('--color-primary', sectionColors[sectionId]);
  }
  sections.forEach(function (s, i) { if (s.id === sectionId) currentIndex = i; });
}
```

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Labels appear on hover | Hover dot — label slides in from right |
| Active dot larger | Current section dot is 1.75x bigger |
| Progress bar fills on scroll | Scroll — left bar grows from top |
| Keyboard nav works | ArrowDown/Up moves between sections |

---

## Quick Check Answers

**1. CSS technique for visually hidden but not affecting layout:**
`opacity: 0` with `pointer-events: none`. The element is invisible but still occupies
its position in the flow (unlike `display: none` which removes it from layout). Combined
with `position: absolute`, the label is outside the flow and does not push other elements.

**2. What percentage for scrollY=400, maxScroll=2000?**
`(400 / 2000) * 100 = 20%`. The bar is 20% filled.

**3. Scroll event handler or requestAnimationFrame?**
For the progress bar, the scroll event handler is fine — it updates a single CSS property
(`height`). The browser batches style changes so there is no layout thrashing from a single
`style.height` write. Only use RAF for DOM writes that depend on DOM reads or for
animations driven by scroll (parallax, etc.).
