# CSS Masterclass — Lesson 1: The Mental Model & The Cascade

> **Series overview:** This is a 9-lesson reference series. Each lesson is self-contained but builds on the last. Use them as a read-once foundation and a search-later reference when you're debugging or directing agents.

---

## 1. What CSS Actually Is

CSS is a **declarative constraint system**, not a procedural script. You don't say *"move this box 20px left"* — you declare *"this box should have a left margin of 20px"*, and the browser figures out how to satisfy all your constraints simultaneously.

That mental shift matters. When layouts break, it's usually because two constraints are fighting each other, not because a command failed.

---

## 2. How the Browser Builds a Page

```
HTML parsed → DOM tree
CSS parsed  → CSSOM tree
            ↓
       Render tree (DOM + CSSOM merged)
            ↓
       Layout (position & size every box)
            ↓
       Paint (fill pixels)
            ↓
       Composite (layers, GPU, transforms)
```

**Why this matters for debugging:**
- `color`, `background` changes → repaint only (cheap)
- `width`, `height`, `margin` changes → layout + repaint (expensive)
- `transform`, `opacity` changes → composite only (GPU, cheapest — use for animation)

---

## 3. The Cascade: How CSS Decides Which Rule Wins

When two rules target the same element and same property, the **cascade** picks the winner. It checks in this order:

### 3.1 Origin & Importance

| Priority | Source |
|----------|--------|
| 1 (highest) | `!important` user agent styles |
| 2 | `!important` author styles |
| 3 | `!important` user styles |
| 4 | Normal author styles ← **where you live** |
| 5 | Normal user styles |
| 6 (lowest) | User agent (browser defaults) |

> **Rule:** Almost never use `!important`. It breaks the cascade and creates debt. The only legit uses are utility classes (`.sr-only`) and overriding third-party CSS you can't touch.

### 3.2 Specificity

If origin is equal, **specificity** wins. Specificity is a score computed as `(A, B, C)`:

| Selector | A (IDs) | B (classes/attrs/pseudo-classes) | C (elements/pseudo-elements) |
|----------|---------|----------------------------------|------------------------------|
| `h1` | 0 | 0 | 1 |
| `.card` | 0 | 1 | 0 |
| `h1.card` | 0 | 1 | 1 |
| `#hero` | 1 | 0 | 0 |
| `#hero .card h1` | 1 | 1 | 1 |
| `style=""` (inline) | wins over all above | | |

**Specificity is compared left-to-right.** `(1,0,0)` beats `(0,99,99)`.

```css
/* These two target the same <p class="intro"> */
p.intro      { color: blue; }  /* (0,1,1) */
.intro       { color: red;  }  /* (0,1,0) */

/* p.intro wins → text is blue */
```

### 3.3 Source Order

If specificity is also equal, **the later rule wins**.

```css
.btn { background: blue; }
.btn { background: green; } /* ← this wins */
```

### 3.4 The `@layer` Rule (Modern CSS)

`@layer` lets you explicitly define cascade layers so you stop fighting specificity wars:

```css
@layer reset, base, components, utilities;

@layer reset {
  * { box-sizing: border-box; margin: 0; }
}

@layer components {
  .card { padding: 1rem; background: white; }
}

@layer utilities {
  .mt-4 { margin-top: 1rem; } /* utilities always win, regardless of specificity */
}
```

Rules in later-declared layers always beat earlier layers, specificity ignored.

---

## 4. Inheritance

Some properties **inherit** down the DOM tree automatically; most don't.

**Inherited by default:** `color`, `font-*`, `line-height`, `letter-spacing`, `text-align`, `cursor`, `visibility`, `list-style-*`

**NOT inherited:** `background`, `border`, `margin`, `padding`, `width`, `height`, `display`, `position`, `flex-*`, `grid-*`

```css
body {
  font-family: 'Georgia', serif; /* all text inherits this */
  color: #1a1a1a;                /* all text inherits this */
}

.card {
  background: white; /* does NOT inherit — each element needs its own */
}
```

### Forcing inheritance

```css
.child {
  color: inherit;      /* force inherit even when it normally wouldn't */
  border: inherit;
  all: inherit;        /* nuclear — inherit everything */
  all: unset;          /* nuclear — strip all styles back to UA default */
  all: revert;         /* strip back to UA default, respecting user styles */
}
```

---

## 5. The Box Model

Every element is a box. The box model defines how size is calculated.

```
┌─────────────────────────────────┐  ← margin edge
│           margin                │
│  ┌───────────────────────────┐  │  ← border edge
│  │         border            │  │
│  │  ┌─────────────────────┐  │  │  ← padding edge
│  │  │       padding       │  │  │
│  │  │  ┌───────────────┐  │  │  │  ← content edge
│  │  │  │    content    │  │  │  │
│  │  │  └───────────────┘  │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### `box-sizing` — the most important reset you'll ever write

```css
/* Default (confusing): width = content only */
/* box-sizing: content-box */
.box { width: 200px; padding: 20px; border: 2px solid; }
/* actual rendered width = 200 + 20*2 + 2*2 = 244px */

/* Sane mode: width = content + padding + border */
/* box-sizing: border-box */
.box { box-sizing: border-box; width: 200px; padding: 20px; border: 2px solid; }
/* actual rendered width = 200px exactly */
```

**Always start every project with:**

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

## 6. Display: The Foundation of Layout

`display` controls how an element participates in layout.

| Value | Behavior |
|-------|----------|
| `block` | Full width, stacks vertically, respects all margin/padding |
| `inline` | Flows with text, ignores width/height, top/bottom margin ignored |
| `inline-block` | Flows with text, BUT respects width/height/margin |
| `none` | Removed from layout entirely (not just hidden) |
| `flex` | Enables Flexbox on the element (lesson 3) |
| `grid` | Enables Grid on the element (lesson 4) |
| `contents` | Element itself vanishes, children promoted to parent layout |

```css
/* Classic gotcha: <span> is inline by default */
span {
  width: 100px;      /* ignored! */
  margin-top: 20px;  /* ignored! */
}

span {
  display: inline-block; /* now it works */
  width: 100px;
  margin-top: 20px;
}
```

---

## 7. The `@layer` + Specificity Strategy for Agent-Friendly CSS

When directing AI agents to write CSS for you, give them a layer structure upfront. It prevents specificity wars and makes overrides predictable:

```css
/* Put this in your global CSS / design system */
@layer reset, tokens, base, layout, components, variants, utilities;

/* Agents write components into @layer components */
/* You override with @layer variants or @layer utilities */
/* Utilities always win, no !important needed */
```

---

## Quick Reference Card

```
Cascade order (highest wins):
  !important → specificity → source order

Specificity score: (IDs, classes, elements)
  inline style > #id > .class > element

Box model (use always):
  *, *::before, *::after { box-sizing: border-box; }

Display cheat sheet:
  block       → stack + full width
  inline      → text flow, no size control
  inline-block → text flow + size control
  flex/grid   → layout containers
  none        → gone from layout
  contents    → disappear, promote children
```

---
