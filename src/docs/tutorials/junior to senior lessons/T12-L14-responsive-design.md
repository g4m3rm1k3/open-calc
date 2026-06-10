# Junior to Senior — T12·L14 — Responsive Design

**Prerequisites:** T12·L13 (Design Tokens). You have a complete token system.
This lesson teaches responsive design — how to make layouts adapt to different
screen sizes, from phones to large monitors.

**What this lab adds:**
- What the viewport is and what the `<meta name="viewport">` tag does
- Media queries — the syntax, the breakpoints, and when to use them
- Mobile-first vs desktop-first — which approach and why
- Container queries — style based on the component's container, not the viewport
- The `clamp()` function revisited for fluid typography
- Building a complete responsive layout

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You build a page that looks great on desktop. You open it on a phone and it is
>    zoomed out and tiny. No media queries are wrong. What single HTML tag is missing?
> 2. Mobile-first CSS: you start with styles for the smallest screen and use
>    `min-width` media queries. Desktop-first: you start wide and use `max-width`.
>    Which approach produces less CSS overall and why?
> 3. `@container` vs `@media` — what question does each answer?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You build a three-column layout on a desktop. On a phone, the three columns are each 33%
of a 390px screen — about 130px each. Text wraps into one-word lines. The layout is unusable.

Responsive design means the layout CHANGES based on the screen size. Not the styles —
the layout. You decide at which screen widths the structure should shift.

---

## Step 1 — The Missing Meta Tag

Create `responsive.html` in your `css-foundations` folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- WITHOUT this tag, mobile browsers zoom out to show the "desktop" page: -->
  <!-- <meta name="viewport" content="width=device-width, initial-scale=1.0"> -->
  <title>Responsive</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: sans-serif; padding: 16px; }
    h1 { font-size: 2rem; }
    p { font-size: 1rem; max-width: 60ch; }
  </style>
</head>
<body>
  <h1>Responsive Design</h1>
  <p>This is what your page looks like without the viewport meta tag on mobile.</p>
</body>
</html>
```

### CSS AND SEE

Open this in your browser. It looks fine on desktop. Now open DevTools → toggle device
toolbar (the phone/tablet icon) → select "iPhone SE". The page is zoomed out — tiny text,
the whole page shrunk to fit the screen width.

**The cause:** Without the viewport meta tag, mobile browsers assume the page is designed
for a 980px desktop. They zoom out to show it all. Text becomes unreadably small.

**The fix:** Add the viewport meta tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### CSS AND SEE

Add the tag, refresh in device mode.

**You should see:** The page fills the phone screen at normal text size. The heading and
paragraph render at readable sizes.

`width=device-width` tells the browser: the viewport width is the actual device width,
not 980px. `initial-scale=1.0` means no zoom applied on load.

**This tag is required for every web page that should be usable on mobile.** Without it,
all your responsive CSS is ignored because the browser uses a fake wide viewport.

---

## Concept: Media Queries — Conditional CSS

**What it is:** A block of CSS that only applies when a condition is true — usually
a viewport width condition.

**The syntax:**

```css
/* Applies when viewport is 768px or wider: */
@media (min-width: 768px) {
  .container { max-width: 720px; margin: 0 auto; }
}

/* Applies when viewport is 1200px or wider: */
@media (min-width: 1200px) {
  .container { max-width: 1140px; }
}
```

**Common breakpoints:**

| Name | Width | Typical device |
|---|---|---|
| xs | < 480px | Small phones |
| sm | 480px–767px | Large phones |
| md | 768px–1023px | Tablets |
| lg | 1024px–1279px | Small laptops |
| xl | 1280px–1535px | Desktops |
| 2xl | 1536px+ | Large monitors |

**These are conventions, not requirements.** You choose breakpoints based on where YOUR
layout breaks — not based on which device is which size. Breakpoints should come from
the content, not from device categories.

**Media query operators:**

```css
@media (min-width: 768px) and (max-width: 1023px) { /* tablet only */ }
@media (prefers-color-scheme: dark) { /* dark mode */ }
@media (prefers-reduced-motion: reduce) { /* accessibility: skip animations */ }
@media (orientation: landscape) { /* wide orientation */ }
@media print { /* print styles */ }
```

**You will see this again in:**
- T12·L15 (Accessibility): `prefers-reduced-motion` disables animations for vestibular disorders
- T12·L16 (Motion): animations check `prefers-reduced-motion` before running
- Every CSS framework: Tailwind's responsive prefixes (`md:`, `lg:`) are media query wrappers

---

## Concept: Mobile-First vs Desktop-First

**What it is:** The direction in which you write responsive CSS.

**Desktop-first:**

```css
/* Full desktop layout by default */
.grid { display: grid; grid-template-columns: 240px 1fr; }

/* Override for small screens: */
@media (max-width: 767px) {
  .grid { grid-template-columns: 1fr; }
}
```

**Mobile-first:**

```css
/* Mobile layout by default (no media query) */
.grid { display: grid; grid-template-columns: 1fr; }

/* Override for large screens: */
@media (min-width: 768px) {
  .grid { grid-template-columns: 240px 1fr; }
}
```

**Why mobile-first produces less CSS:**

Mobile layouts are simpler: single column, larger touch targets, hidden sidebars.
Desktop layouts add complexity: multi-column, hover interactions, sidebars.

With mobile-first, the default styles (no media query) are simple. You ADD complexity
at larger breakpoints. The base CSS is small.

With desktop-first, the default styles are complex. You REMOVE and override at smaller
breakpoints. You write more overrides.

**The principle: add, do not override.** Mobile-first lets you layer on complexity.
Desktop-first makes you undo complexity. Adding is easier to understand and maintain.

**The alternative — no media queries:** Using `flex-wrap`, `auto-fit minmax`, and `clamp()`
for fluid layouts that respond without breakpoints. This is increasingly viable for
component-level responsiveness. Media queries remain necessary for major layout shifts
(sidebar appearing/disappearing, navigation becoming a hamburger menu).

---

## Step 2 — Build a Mobile-First Layout

Update `responsive.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Layout</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --space-3: 0.75rem; --space-4: 1rem; --space-5: 1.5rem; --space-6: 2rem;
    }

    body {
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: var(--space-4);
      background: #f5f5f5;
    }

    /* ── MOBILE BASE (no media query) ──────────── */
    .page-header {
      background: #1a1a2e;
      color: white;
      padding: var(--space-4);
      margin: calc(-1 * var(--space-4));   /* bleed to edges */
      margin-bottom: var(--space-5);
    }

    .page-header h1 { margin: 0; font-size: 1.25rem; }

    .main-grid {
      display: grid;
      grid-template-columns: 1fr;           /* single column on mobile */
      gap: var(--space-4);
    }

    .sidebar {
      background: white;
      border-radius: 8px;
      padding: var(--space-4);
    }

    .content {
      display: grid;
      grid-template-columns: 1fr;           /* single column on mobile */
      gap: var(--space-4);
    }

    .card {
      background: white;
      border-radius: 8px;
      padding: var(--space-4);
    }

    /* ── TABLET (768px+) ───────────────────────── */
    @media (min-width: 768px) {
      body { padding: var(--space-5); }

      .page-header {
        margin: calc(-1 * var(--space-5));
        margin-bottom: var(--space-5);
        padding: var(--space-5);
      }

      .content {
        grid-template-columns: repeat(2, 1fr);   /* 2-column card grid */
      }
    }

    /* ── DESKTOP (1024px+) ─────────────────────── */
    @media (min-width: 1024px) {
      body {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--space-6);
      }

      .page-header { border-radius: 8px; }

      .main-grid {
        grid-template-columns: 220px 1fr;   /* sidebar + content */
      }

      .content {
        grid-template-columns: repeat(3, 1fr);   /* 3-column card grid */
      }
    }
  </style>
</head>
<body>
  <header class="page-header">
    <h1>Dashboard</h1>
  </header>

  <div class="main-grid">
    <aside class="sidebar">
      <h3 style="margin: 0 0 12px; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #888;">Navigation</h3>
      <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px;">
        <li style="padding: 8px; border-radius: 4px; background: #f0f4ff; color: #3b6fe8; font-weight: 500;">Overview</li>
        <li style="padding: 8px;">Jobs</li>
        <li style="padding: 8px;">Settings</li>
      </ul>
    </aside>

    <div class="content">
      <div class="card"><h3 style="margin: 0 0 8px;">Active Jobs</h3><p style="margin: 0; font-size: 1.5rem; font-weight: 700;">3</p></div>
      <div class="card"><h3 style="margin: 0 0 8px;">Completed Today</h3><p style="margin: 0; font-size: 1.5rem; font-weight: 700;">12</p></div>
      <div class="card"><h3 style="margin: 0 0 8px;">Errors</h3><p style="margin: 0; font-size: 1.5rem; font-weight: 700;">0</p></div>
    </div>
  </div>
</body>
</html>
```

### CSS AND SEE

Toggle the device toolbar in DevTools. Resize the viewport.

**Mobile (< 768px):** Single column. Sidebar on top, cards below in a single column.
**Tablet (768px+):** Cards in a 2-column grid.
**Desktop (1024px+):** Sidebar on the left. Cards in a 3-column grid. Max-width container.

The layout shifts at breakpoints defined by where the CONTENT needs to change — not
based on device categories.

---

## Concept: Container Queries — Respond to the Component's Container

**What it is:** A CSS feature that applies styles based on the SIZE OF THE CONTAINER —
not the viewport. Available in all modern browsers since 2023.

**The problem media queries cannot solve:**

A card component might appear in a wide sidebar on one page and a narrow column on another.
With media queries, you check the viewport width — but the card's container width is different
on each page. There is no way to tell the card "when your container is narrow, stack vertically."

**Container queries solve this:**

```css
.card-container {
  container-type: inline-size;   /* enables container queries on this element */
  container-name: card;          /* optional name for targeting */
}

@container card (min-width: 400px) {
  .card {
    display: flex;               /* only when the CONTAINER is 400px+ wide */
    gap: 16px;
  }
}
```

**The difference:**

| Media query | Container query |
|---|---|
| Responds to viewport width | Responds to container width |
| `@media (min-width: 768px)` | `@container (min-width: 400px)` |
| Every component at any viewport size | Each component responds to its own context |

**When to use container queries vs media queries:**

- **Media queries:** Major layout shifts (sidebar appears, navigation changes)
- **Container queries:** Component-level responsiveness (card layout when placed in different contexts)

**You will see this again in:**
- React component libraries are moving to container queries for component-level responsiveness
- Tailwind added `@container` support with `@container` and `container-sm` utilities

---

## Step 3 — Add a Container Query

Add a card that changes layout based on its container:

```html
<div style="                                    <!-- ← add to the bottom of body -->
  margin-top: var(--space-5);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
">
  <!-- Each container enables container queries for its children: -->
  <div style="container-type: inline-size;">
    <article class="stat-card">
      <img src="" alt="" style="width: 48px; height: 48px; background: #ddd; border-radius: 50%;">
      <div>
        <h3 style="margin: 0 0 4px; font-size: 0.9rem;">Toolpath Generator</h3>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">3 jobs running</p>
      </div>
      <span style="margin-left: auto; background: #e8f5e9; color: #27ae60; padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: 600;">Active</span>
    </article>
  </div>

  <div style="container-type: inline-size;">
    <article class="stat-card">
      <img src="" alt="" style="width: 48px; height: 48px; background: #ddd; border-radius: 50%;">
      <div>
        <h3 style="margin: 0 0 4px; font-size: 0.9rem;">Simulation Engine</h3>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">Idle</p>
      </div>
      <span style="margin-left: auto; background: #f5f5f5; color: #888; padding: 2px 8px; border-radius: 99px; font-size: 0.75rem;">Standby</span>
    </article>
  </div>
</div>
```

Add to `<style>`:

```css
.stat-card {
  background: white;
  border-radius: 8px;
  padding: var(--space-4);
  /* Default: vertical stack for narrow containers */
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* When the CONTAINER is 300px+: horizontal row */
@container (min-width: 300px) {
  .stat-card {
    flex-direction: row;
    align-items: center;
  }
}
```

### CSS AND SEE

Resize the window. When a `.stat-card`'s container is wide, the card is horizontal.
When narrow, it stacks vertically. The container query responds to the card's context,
not the viewport — both cards can be in different layout states simultaneously.

---

## 🎯 Challenge: Make Your Token System Responsive

**Task:** Add two breakpoint-specific token adjustments to your `tokens.html` from L13:

1. At mobile (< 768px): reduce `--space-xl` to `1rem` and `--font-xl` to `1.25rem`
2. At desktop (1200px+): increase `--font-xl` to `2rem` and `--space-xl` to `3rem`

The card from L13 should automatically reflect these changes — no changes to component CSS.

Then add `clamp()` values to `--font-xl` and `--space-xl` so they scale fluidly between
mobile and desktop without media queries.

---

<details>
<summary>▶ Show Solution</summary>

**Media query approach:**
```css
/* In :root, override tokens per breakpoint: */
@media (max-width: 767px) {
  :root {
    --space-xl:  1rem;
    --font-xl:   1.25rem;
  }
}

@media (min-width: 1200px) {
  :root {
    --space-xl:  3rem;
    --font-xl:   2rem;
  }
}
```

**Fluid `clamp()` approach (no media queries needed):**
```css
:root {
  --font-xl:   clamp(1.25rem, 3.5vw, 2rem);    /* 20px → 32px, fluid */
  --space-xl:  clamp(1rem, 4vw, 3rem);          /* 16px → 48px, fluid */
}
```

**Key insight:** Breakpoint-based token overrides are good for discrete changes (layout shifts,
enabling/disabling features). `clamp()` tokens are better for smooth scaling (padding,
font sizes). The two approaches are complementary — use media queries for structure,
`clamp()` for sizing.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Viewport meta tag | Without it — DevTools device mode shows zoomed-out page |
| Mobile-first base styles | Styles apply at all widths; media queries ADD at larger sizes |
| Layout shift at tablet | Card grid changes to 2 columns at 768px |
| Layout shift at desktop | Sidebar appears at 1024px |
| Container query | Narrow container → vertical card; wide container → horizontal card |
| `clamp()` fluid token | Resize window → font/spacing scales smoothly without snap |

---

## Quick Check Answers

**1. Page looks fine on desktop, tiny on phone. Single missing HTML tag?**

`<meta name="viewport" content="width=device-width, initial-scale=1.0">` in the `<head>`.
Without it, mobile browsers use a virtual 980px-wide viewport and zoom out to show it
all. The CSS media queries still fire at their specified pixel widths — but those widths
refer to the virtual 980px viewport, not the physical screen. The viewport meta tag tells
the browser to use the actual device width as the viewport width.

**2. Mobile-first produces less CSS. Why?**

Mobile layouts are the simplest version — single column, no complex grid. With mobile-first,
that simple layout is the base (no media query). You ADD structure at larger breakpoints.
The base CSS is minimal; additions are targeted. With desktop-first, the complex multi-column
layout is the base. At mobile, you must UNDO columns, HIDE sidebars, OVERRIDE padding.
You write more CSS to remove things than to add them. Overrides also increase specificity
conflicts. Mobile-first avoids both problems.

**3. `@container` vs `@media` — what question does each answer?**

`@media` answers: "How wide is the BROWSER WINDOW (viewport)?" — used for major page-level
layout changes.

`@container` answers: "How wide is this ELEMENT'S CONTAINER?" — used for component-level
responsiveness when the same component appears in different layout contexts (a card that
could be in a narrow sidebar OR a wide main area).

The key difference: a component cannot know the viewport width means anything about its
own available space. A sidebar card and a main-area card at the same viewport width have
very different container widths. Container queries let each component respond to its own
context independently.
