# CSS Masterclass — Lesson 8: Responsive Design, Media Queries & Container Queries

---

## 1. The Responsive Mindset

Modern CSS is fluid by default — the question is how much you constrain it.

**Two approaches:**

1. **Fluid (preferred):** Design with `clamp()`, `min()`, `auto-fill`, and intrinsic sizing so the layout adapts without breakpoints
2. **Breakpoint-based:** Define explicit breakpoints where the layout restructures

Most real projects use both. Fluid for content, breakpoints for major structural changes.

---

## 2. Media Queries

```css
/* Min-width (mobile-first — recommended) */
@media (min-width: 768px) { ... }

/* Max-width (desktop-first — not recommended) */
@media (max-width: 767px) { ... }

/* Range (modern syntax) */
@media (width >= 768px) { ... }
@media (768px <= width < 1200px) { ... }

/* Height */
@media (min-height: 600px) { ... }

/* Orientation */
@media (orientation: landscape) { ... }
@media (orientation: portrait) { ... }

/* Combining */
@media (min-width: 768px) and (max-width: 1199px) { ... }
@media (min-width: 768px) or (orientation: landscape) { ... }

/* Negation */
@media not (prefers-color-scheme: dark) { ... }
```

### Standard breakpoints

```css
/* Common breakpoint system — adjust to your content */
:root {
  --bp-sm:  640px;   /* Small phones landscape, large phones */
  --bp-md:  768px;   /* Tablets */
  --bp-lg:  1024px;  /* Laptops */
  --bp-xl:  1280px;  /* Desktops */
  --bp-2xl: 1536px;  /* Large desktops */
}

/* Usage (can't use variables in media queries, so write px) */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

> **Breakpoint philosophy:** "Add a breakpoint when the design breaks, not at arbitrary device sizes." Let the content drive the breakpoints.

---

## 3. Mobile-First Development

Write base styles for mobile, override for larger screens.

```css
/* Mobile base */
.layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tablet+ */
@media (min-width: 768px) {
  .layout {
    flex-direction: row;
  }
  .sidebar {
    flex: 0 0 280px;
  }
}

/* Desktop+ */
@media (min-width: 1024px) {
  .layout {
    gap: 2rem;
  }
  .sidebar {
    flex: 0 0 320px;
  }
}
```

**Why mobile-first:**
- Starts with the hardest constraint (small screen) and loosens from there
- Cascades correctly — you add, not remove
- Aligns with how CSS specificity/source order works

---

## 4. User Preference Media Queries

```css
/* Color scheme */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: hsl(220 15% 8%);
    --color-text: hsl(220 10% 90%);
    --color-surface: hsl(220 12% 12%);
    --color-border: hsl(220 10% 22%);
  }
}

/* Motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Contrast preference */
@media (prefers-contrast: more) {
  :root {
    --color-border: hsl(0 0% 40%);
    --color-text-muted: hsl(0 0% 30%);
  }
}

/* Pointer type */
@media (pointer: coarse) {
  /* Touch device — make targets bigger */
  .btn { min-height: 44px; min-width: 44px; }
}

@media (pointer: fine) {
  /* Mouse — can have smaller hover targets */
  .btn { min-height: 32px; }
}

/* Hover capability */
@media (hover: hover) {
  /* Device supports hover (not touch-only) */
  .card:hover { transform: translateY(-4px); }
}

/* Data saver */
@media (prefers-reduced-data: reduce) {
  .hero-bg { background-image: none; }
}

/* Print */
@media print {
  nav, .sidebar, .ads { display: none; }
  body { font-size: 12pt; }
  a[href]::after { content: " (" attr(href) ")"; }
}
```

---

## 5. Container Queries — The Game Changer

Container queries respond to the **container's size**, not the viewport. This means components are truly reusable — they respond to their context, not global screen size.

```css
/* 1. Define a containment context */
.card-wrapper {
  container-type: inline-size;  /* responds to width */
  container-name: card;         /* optional name */
}

/* 2. Write queries against the container */
@container (min-width: 400px) {
  .card {
    display: flex;
    gap: 1.5rem;
  }
  .card-image {
    width: 160px;
    flex-shrink: 0;
  }
}

/* 3. Named containers */
@container card (min-width: 600px) {
  .card-title { font-size: 1.5rem; }
}
```

### Container query units

```css
cqw  /* 1% of container width */
cqh  /* 1% of container height */
cqi  /* 1% of container inline size (= cqw for horizontal text) */
cqb  /* 1% of container block size (= cqh for horizontal text) */
cqmin /* smaller of cqi/cqb */
cqmax /* larger of cqi/cqb */

.card-title {
  font-size: clamp(1rem, 4cqi, 1.5rem);  /* fluid relative to container, not viewport */
}
```

### Real-world pattern: responsive card anywhere

```css
.anywhere {
  container-type: inline-size;
}

.card { display: block; }

@container (min-width: 360px) {
  .card { display: flex; gap: 1rem; }
  .card-img { width: 120px; }
}

@container (min-width: 600px) {
  .card-img { width: 200px; }
  .card-title { font-size: 1.25rem; }
}
```

Now drop `.card` in a full-width context, a sidebar, a modal — it adapts correctly everywhere.

---

## 6. `@supports` — Feature Queries

Only apply styles if a feature is supported:

```css
/* Test a property + value */
@supports (display: grid) {
  .layout { display: grid; }
}

/* Test for subgrid */
@supports (grid-template-columns: subgrid) {
  .card { grid-template-columns: subgrid; }
}

/* Negate */
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgb(255 255 255 / 0.9); }
}

/* Combine */
@supports (display: grid) and (gap: 1rem) {
  .grid { display: grid; gap: 1rem; }
}
```

---

## 7. The `clamp()` Strategy — Eliminate Most Breakpoints

For font sizes, spacing, and widths, `clamp()` handles responsiveness automatically:

```css
/* Typography — no breakpoints needed */
body         { font-size: clamp(1rem, 0.9rem + 0.5vw, 1.125rem); }
h1           { font-size: clamp(2rem, 1.5rem + 2.5vw, 4rem); }
h2           { font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem); }

/* Spacing */
.section     { padding: clamp(3rem, 8vw, 8rem); }
.container   { padding-inline: clamp(1rem, 5vw, 3rem); }

/* Width */
.card        { width: clamp(280px, 45%, 480px); }
.container   { width: min(90%, 1200px); }
```

**The formula for any clamp:**
- `min`: value at smallest viewport
- `preferred`: `viewport_ref * vw + constant` (use linear interpolation)
- `max`: value at largest viewport

---

## 8. Viewport Units on Mobile

The problem: `100vh` on mobile includes the browser address bar, causing overflow.

```css
/* Old way — breaks on mobile Safari */
.hero { min-height: 100vh; }

/* Modern way — use svh */
.hero { min-height: 100svh; }  /* small viewport (excludes browser chrome) */
.hero { min-height: 100dvh; }  /* dynamic (updates as chrome shows/hides) */
.hero { min-height: 100lvh; }  /* large viewport (includes chrome) */
```

---

## 9. Intrinsic Web Design — Let the Browser Help

```css
/* Let items wrap naturally without media queries */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

/* Content-driven width */
.btn {
  width: fit-content;     /* shrink-wrap to content */
  width: max-content;     /* never wrap, take full content width */
  width: min-content;     /* wrap as much as possible (shrink to longest word) */
}

/* Two-column auto-wrap with flexbox */
.tiles {
  display: flex;
  flex-wrap: wrap;
}
.tile {
  flex: 1 1 300px;   /* grow/shrink freely, never below 300px */
}
```

---

## 10. Full Responsive Boilerplate

```css
/* ============================================================
   Responsive starter — paste into any project
   ============================================================ */

*, *::before, *::after { box-sizing: border-box; }

:root {
  /* Tokens */
  --color-text: hsl(220 10% 15%);
  --color-bg: white;
  --color-surface: hsl(220 15% 97%);
  --color-border: hsl(220 10% 88%);
  --color-accent: hsl(220 80% 55%);

  /* Spacing */
  --space-sm:  clamp(0.5rem,  1vw,  0.75rem);
  --space-md:  clamp(0.75rem, 2vw,  1.25rem);
  --space-lg:  clamp(1.25rem, 4vw,  2.5rem);
  --space-xl:  clamp(2.5rem,  7vw,  5rem);

  /* Type */
  --text-sm:   clamp(0.8rem,   0.75rem + 0.25vw, 0.875rem);
  --text-base: clamp(1rem,     0.9rem + 0.5vw,   1.125rem);
  --text-lg:   clamp(1.125rem, 1rem + 0.75vw,    1.375rem);
  --text-xl:   clamp(1.25rem,  1rem + 1.5vw,     1.75rem);
  --text-2xl:  clamp(1.5rem,   1.1rem + 2vw,     2.5rem);
  --text-3xl:  clamp(2rem,     1.2rem + 4vw,     4rem);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text: hsl(220 10% 90%);
    --color-bg: hsl(220 15% 8%);
    --color-surface: hsl(220 12% 12%);
    --color-border: hsl(220 10% 22%);
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

html {
  color: var(--color-text);
  background: var(--color-bg);
  font-size: var(--text-base);
  line-height: 1.6;
}

.container {
  width: min(90%, 1200px);
  margin-inline: auto;
  padding-inline: var(--space-md);
}
```

---

## Quick Reference Card

```
Breakpoints (min-width, mobile-first):
  640px / 768px / 1024px / 1280px / 1536px

User preferences:
  prefers-color-scheme: dark
  prefers-reduced-motion: reduce
  prefers-contrast: more
  pointer: coarse / fine
  hover: hover / none

Container queries:
  .wrapper { container-type: inline-size; }
  @container (min-width: 400px) { ... }
  cqi/cqw/cqh = % of container

Feature queries:
  @supports (property: value) { ... }

No-breakpoint techniques:
  clamp(min, preferred, max)
  repeat(auto-fill, minmax(250px, 1fr))
  flex: 1 1 300px

Mobile viewport:
  min-height: 100svh   ← use this, not 100vh

Universal container:
  width: min(90%, 1200px);
  margin-inline: auto;
```

---

