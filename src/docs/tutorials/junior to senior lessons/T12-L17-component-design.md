# Junior to Senior — T12·L17 — Component Design

**Prerequisites:** T12·L16 (Motion and Animation). You have the full CSS toolkit.
This lesson applies it by building real, production-quality components from first
principles — no library, no framework. Each component teaches a pattern you will
use repeatedly.

**What this lab adds:**
- The BEM naming methodology — why class names matter at scale
- Building a Button component with variants (primary, secondary, danger, ghost)
- Building a Card component with compound elements
- Building a Badge component
- Building a Modal component using `dialog` element and CSS backdrop
- How components compose into layouts

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have `.card`, `.card-title`, `.card-body` and `.card .title`. In a team codebase,
>    `.card .title` causes a problem. What is it?
> 2. You have 20 buttons on a page. All use `.btn`. You need ONE button to be danger-red.
>    You have two options: add a class `.btn-danger` or use an inline style. What are
>    the tradeoffs?
> 3. HTML has a `<dialog>` element. Before CSS `backdrop`, how did developers create
>    the darkened overlay behind a modal?
>
> *(Answers at the end of this lab)*

---

## The Problem This Lesson Solves

You have the CSS knowledge. Now you need to know how to STRUCTURE it so components
are reusable, nameable, and composable. Without a naming convention, class names collide.
Without a variant system, you create dozens of near-identical rules. Without composition,
small components cannot build into large interfaces.

---

## Concept: BEM — Block Element Modifier

**What it is:** A naming convention for CSS classes that encodes the component structure
in the class name. BEM stands for Block, Element, Modifier.

**The syntax:**

```
.block {}                    /* the component itself */
.block__element {}           /* a part of the component */
.block--modifier {}          /* a variant of the component */
.block__element--modifier {} /* a part in a variant state */
```

**Examples:**

```css
.card {}                     /* the card block */
.card__title {}              /* the title element INSIDE a card */
.card__body {}               /* the body element INSIDE a card */
.card--featured {}           /* a featured variant of the card */
.card__title--large {}       /* a large title variant */
```

**Why BEM instead of nested selectors:**

```css
/* Nested — breaks specificity, hard to compose: */
.card .title { color: red; }

/* BEM — flat, predictable specificity: */
.card__title { color: red; }
```

`.card .title` has specificity (0,2,0). If you later write `.card__title { color: blue; }`,
the (0,2,0) selector wins. Nested selectors create unpredictable specificity stacks as
the codebase grows.

**BEM keeps all classes at specificity (0,1,0)** — one class. Any two classes are equal,
and source order is the tiebreaker. Specificity wars do not start.

**What BEM does NOT mean:**

- You do not have to be strict about double-underscore/double-dash. The concept matters;
  the exact syntax varies by team.
- Component-scoped CSS (CSS Modules, styled-components) solves the same problem differently —
  we cover this in the React context.
- Tailwind abandons BEM entirely in favor of single-purpose utility classes.

**The alternative that was not chosen:** Nested selectors (`div.card > h2.title`).
They express HTML structure in CSS, creating tight coupling. Change the HTML and the CSS
breaks. BEM names the role (`__title`) not the HTML element, so HTML can change freely.

**You will see this again in:**
- Every CSS framework uses some form of block/element naming
- React component class names: `className="card__title"` in JSX
- Third-party libraries often use data attributes instead of BEM classes — `data-part="title"`

---

## Step 1 — Button Component with Variants

Create `components.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Components</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    :root {
      /* Tokens */
      --color-primary:       hsl(219, 79%, 60%);
      --color-primary-hover: hsl(219, 79%, 42%);
      --color-danger:        hsl(0, 70%, 48%);
      --color-danger-hover:  hsl(0, 70%, 36%);
      --color-text:          hsl(0, 0%, 10%);
      --color-border:        hsl(0, 0%, 84%);

      --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
      --space-4: 1rem;    --space-5: 1.5rem;

      --radius-sm: 4px;
      --radius-md: 6px;
    }

    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 60px auto; padding: 0 var(--space-5); background: #f9f9f9; }
    h2 { font-size: 1rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin: var(--space-5) 0 var(--space-3); }
    .row { display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap; }

    /* ── BTN COMPONENT ─────────────────────────── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      border: 2px solid transparent;
      border-radius: var(--radius-md);
      font-family: inherit;
      font-size: 0.9375rem;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s, transform 0.1s;
    }

    /* Primary variant (default style): */
    .btn { background: var(--color-primary); color: white; }
    .btn:hover:not(:disabled) { background: var(--color-primary-hover); }

    /* Secondary variant: */
    .btn--secondary { background: transparent; color: var(--color-primary); border-color: var(--color-primary); }
    .btn--secondary:hover:not(:disabled) { background: hsl(219 79% 60% / 0.08); }

    /* Ghost variant: */
    .btn--ghost { background: transparent; color: var(--color-text); border-color: transparent; }
    .btn--ghost:hover:not(:disabled) { background: hsl(0 0% 0% / 0.06); }

    /* Danger variant: */
    .btn--danger { background: var(--color-danger); color: white; }
    .btn--danger:hover:not(:disabled) { background: var(--color-danger-hover); }

    /* Sizes: */
    .btn--sm { padding: var(--space-1) var(--space-3); font-size: 0.8125rem; }
    .btn--lg { padding: var(--space-3) var(--space-5); font-size: 1.0625rem; }

    /* States: */
    .btn:active:not(:disabled) { transform: scale(0.97); }
    .btn:focus-visible { outline: 3px solid var(--color-primary); outline-offset: 3px; }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn--danger:focus-visible { outline-color: var(--color-danger); }
  </style>
</head>
<body>
  <h2>Buttons</h2>

  <div class="row">
    <button class="btn">Primary</button>
    <button class="btn btn--secondary">Secondary</button>
    <button class="btn btn--ghost">Ghost</button>
    <button class="btn btn--danger">Danger</button>
  </div>

  <div class="row" style="margin-top: var(--space-3);">
    <button class="btn btn--sm">Small</button>
    <button class="btn">Default</button>
    <button class="btn btn--lg">Large</button>
    <button class="btn" disabled>Disabled</button>
  </div>
</body>
</html>
```

### CSS AND SEE

**You should see:** Four button variants and three sizes, all from the same `.btn` base
class with modifier classes. Hover and focus states work on all variants.

**Change something:** Add `--color-primary: hsl(280, 70%, 55%)` to `:root` (purple).

**Expected:** All primary, secondary, and focus states update simultaneously — every
variant consumes from the token.

---

## Step 2 — Card Component

Add to `components.html`:

```html
<h2>Cards</h2>

<div class="row" style="align-items: flex-start;">
  <!-- Basic card: -->
  <div class="card">
    <div class="card__header">
      <h3 class="card__title">Job #1742</h3>
      <span class="badge badge--success">Running</span>
    </div>
    <p class="card__body">Toolpath generation for part-A.dxf. Estimated completion in 45 seconds.</p>
    <div class="card__footer">
      <button class="btn btn--sm btn--secondary">Details</button>
      <button class="btn btn--sm btn--danger">Cancel</button>
    </div>
  </div>

  <!-- Featured variant: -->
  <div class="card card--featured">
    <div class="card__header">
      <h3 class="card__title">Pro License</h3>
      <span class="badge">Popular</span>
    </div>
    <p class="card__body">Unlimited jobs, priority queue, 24/7 support.</p>
    <div class="card__footer">
      <button class="btn">Upgrade Now</button>
    </div>
  </div>
</div>
```

Add to CSS:

```css
/* ── CARD COMPONENT ─────────────────────────── */
.card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card--featured {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px hsl(219 79% 60% / 0.15);
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.card__body {
  margin: 0;
  font-size: 0.875rem;
  color: #555;
  line-height: 1.5;
  flex: 1;
}

.card__footer {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
}

/* ── BADGE COMPONENT ─────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  background: hsl(0 0% 88%);
  color: hsl(0 0% 28%);
  white-space: nowrap;
}

.badge--success { background: hsl(140 55% 88%); color: hsl(140 55% 28%); }
.badge--danger  { background: hsl(0   70% 90%); color: hsl(0   70% 36%); }
.badge--info    { background: hsl(219 79% 90%); color: hsl(219 79% 32%); }
```

### CSS AND SEE

**You should see:** Two cards — one job card with action buttons and a status badge,
one featured card with a subtle blue border and glow.

**Observe the composition:** The card uses `.btn` for its buttons and `.badge` for
its status indicator. Components compose inside other components.

---

## Step 3 — Modal Component

Add the modal HTML and CSS:

```html
<h2>Modal (dialog element):</h2>

<button class="btn" onclick="document.getElementById('demo-modal').showModal()">
  Open Modal
</button>

<dialog id="demo-modal" class="modal">
  <div class="modal__header">
    <h2 class="modal__title">Confirm Cancellation</h2>
    <button class="btn btn--ghost modal__close" onclick="document.getElementById('demo-modal').close()">✕</button>
  </div>
  <div class="modal__body">
    <p>Cancel job #1742? This action cannot be undone. The partially generated toolpath will be discarded.</p>
  </div>
  <div class="modal__footer">
    <button class="btn btn--ghost" onclick="document.getElementById('demo-modal').close()">Keep Job</button>
    <button class="btn btn--danger">Cancel Job</button>
  </div>
</dialog>
```

Add to CSS:

```css
/* ── MODAL COMPONENT ─────────────────────────── */
.modal {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0;
  width: min(90vw, 480px);
  box-shadow: 0 20px 60px hsl(0 0% 0% / 0.2);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

/* The built-in backdrop pseudo-element on <dialog>: */
.modal::backdrop {
  background: hsl(0 0% 0% / 0.5);
  backdrop-filter: blur(2px);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.modal__title { margin: 0; font-size: 1.125rem; font-weight: 700; }

.modal__close {
  padding: var(--space-1);
  width: 32px;
  height: 32px;
  justify-content: center;
}

.modal__body {
  padding: var(--space-5);
}

.modal__body p { margin: 0; color: #555; line-height: 1.5; }

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--color-border);
}
```

### CSS AND SEE

Click "Open Modal". A confirmation dialog appears with a blurred, darkened backdrop.
The close button and "Keep Job" button dismiss it.

**The `<dialog>` element:** HTML's native dialog element manages focus trapping and
keyboard accessibility (Escape key closes it) automatically. The `::backdrop` pseudo-element
is built into `<dialog>` — no extra HTML needed for the overlay.

**Change something:** Remove `backdrop-filter: blur(2px)` from `.modal::backdrop`.

**Expected:** The backdrop is still dark but no longer blurred. The blur effect is purely
decorative — the modal works without it.

---

## 🎯 Challenge: Build a Dropdown Menu Component

**Task:** Build a dropdown menu using:
1. A trigger button (`.dropdown__trigger`)
2. A menu that appears below (`position: absolute`)
3. Menu items with hover states
4. CSS-only show/hide using `:focus-within` on the container

No JavaScript for showing/hiding — use `:focus-within` to show the menu when the
container has focus.

---

<details>
<summary>▶ Show Solution</summary>

```html
<div class="dropdown">
  <button class="btn dropdown__trigger">
    Options ▾
  </button>
  <ul class="dropdown__menu">
    <li><a class="dropdown__item" href="#">Edit</a></li>
    <li><a class="dropdown__item" href="#">Duplicate</a></li>
    <li class="dropdown__divider"></li>
    <li><a class="dropdown__item dropdown__item--danger" href="#">Delete</a></li>
  </ul>
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown__menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    list-style: none;
    margin: 0;
    padding: var(--space-1) 0;
    background: white;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: 0 8px 24px hsl(0 0% 0% / 0.12);
    min-width: 160px;
    z-index: 10;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-4px);
    transition: opacity 0.15s, transform 0.15s;
  }

  /* Show when container or any descendant has focus: */
  .dropdown:focus-within .dropdown__menu {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .dropdown__item {
    display: block;
    padding: var(--space-2) var(--space-4);
    color: var(--color-text);
    text-decoration: none;
    font-size: 0.9rem;
  }

  .dropdown__item:hover { background: hsl(0 0% 96%); }
  .dropdown__item--danger { color: var(--color-danger); }
  .dropdown__item--danger:hover { background: hsl(0 70% 97%); }

  .dropdown__divider {
    height: 1px;
    background: var(--color-border);
    margin: var(--space-1) 0;
  }
</style>
```

**Key insight:** `:focus-within` is true on `.dropdown` whenever ANY descendant has focus —
including the trigger button and the menu items. This keeps the menu open while tabbing
through items. When focus leaves the dropdown entirely, `:focus-within` becomes false
and the menu closes. Pure CSS — no JavaScript needed.

The limitation: clicking outside the dropdown does not close it (there is no "click outside"
detector in CSS). For production, JavaScript handles this. The CSS-only version works
for keyboard-accessible, hover-accessible menus.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| BEM naming | `.card__title` — flat specificity (0,1,0); `.card .title` — (0,2,0) |
| Modifier variant | `.btn--danger` applied — button is red without extra CSS |
| Token in variants | Change `--color-primary` — all primary variants update |
| Card composition | `.badge` inside `.card` — components compose without conflict |
| Modal backdrop | `<dialog>::backdrop` — built-in overlay without extra HTML |
| Dropdown `:focus-within` | Tab through dropdown items — menu stays open |

---

## Quick Check Answers

**1. `.card .title` causes a problem in a team codebase. What?**

Specificity escalation. `.card .title` has specificity (0,2,0) — two classes.
Any later override needs at least (0,2,0) to win. If you have `.card__title { color: blue; }`
with specificity (0,1,0), it CANNOT override `.card .title { color: red; }`. You must add
more specificity to override — starting the arms race. Also: `.title` is a global class
name that might exist elsewhere on the page. BEM's `.card__title` is unique to the card
and has predictable specificity.

**2. `.btn-danger` class vs inline style. Tradeoffs?**

`.btn-danger` class: reusable (can apply to any button), theme-responsive (reads from tokens),
stateful (can have `:hover`, `:focus`, `:active` states), visible in DevTools as a class.
Inline style: overrides everything (specificity 1,0,0,0), no pseudo-class states possible,
not reusable, not visible as a semantic class in DevTools. For a one-off scenario, inline
is fast; for anything reusable, the class is correct.

**3. How did developers create modal overlays before CSS `::backdrop`?**

A separate `<div class="overlay">` was inserted into the DOM, positioned fixed over the
whole viewport with `z-index` below the modal. Its background was `rgba(0,0,0,0.5)`.
When the modal was hidden, the overlay div was also removed or hidden. JavaScript managed
both elements. The `<dialog>::backdrop` pseudo-element is the browser-native replacement —
no extra HTML, no JavaScript, part of the dialog's own rendering.
