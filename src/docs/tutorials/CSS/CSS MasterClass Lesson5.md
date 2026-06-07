# CSS Masterclass — Lesson 5: Positioning, Stacking & Overflow

---

## 1. The `position` Property

```css
position: static;    /* default — in normal document flow */
position: relative;  /* offset from where it would normally be */
position: absolute;  /* removed from flow, positioned relative to nearest positioned ancestor */
position: fixed;     /* removed from flow, positioned relative to viewport */
position: sticky;    /* in flow, but sticks when scrolling past a threshold */
```

---

## 2. `relative` — Offset Without Disruption

```css
.item {
  position: relative;
  top: 10px;     /* nudge down 10px from normal position */
  left: -5px;    /* nudge left 5px */
}
```

- Still occupies its original space in the document flow
- Nudging with `top`/`left` doesn't push other elements
- **Most common use:** establish a **positioning context** for absolutely positioned children

---

## 3. `absolute` — Escape the Flow

```css
.parent {
  position: relative;  /* ← establishes positioning context */
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  /* positioned relative to .parent, not the viewport */
}
```

**The containing block rule:** An absolutely positioned element is positioned relative to its **nearest ancestor with `position` set to anything other than `static`**. If no such ancestor exists, it positions relative to the initial containing block (essentially the viewport/`<html>`).

```css
/* Common patterns */
.card { position: relative; }

/* Corner badge */
.badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
}

/* Full overlay */
.overlay {
  position: absolute;
  inset: 0;           /* shorthand for top: 0; right: 0; bottom: 0; left: 0 */
  background: rgb(0 0 0 / 0.5);
}

/* Centered tooltip */
.tooltip {
  position: absolute;
  top: 100%;           /* just below parent */
  left: 50%;
  transform: translateX(-50%);  /* center horizontally */
}
```

---

## 4. `fixed` — Lock to Viewport

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.floating-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
}
```

- Removed from document flow (page doesn't reserve space for it)
- Unaffected by scrolling
- Positioned relative to viewport always
- **Gotcha:** `transform`, `filter`, or `perspective` on an ancestor breaks `fixed` positioning — the element becomes positioned relative to that ancestor instead

---

## 5. `sticky` — Scroll-Aware Positioning

```css
.sticky-header {
  position: sticky;
  top: 0;           /* sticks when top edge would go past this value */
  z-index: 10;
}

.sticky-sidebar {
  position: sticky;
  top: 1rem;        /* 1rem gap from viewport top when stuck */
}
```

**How sticky works:**
1. Behaves like `relative` until you scroll it to the threshold
2. Then behaves like `fixed` until you scroll out of its parent container
3. Unsticks when the parent scrolls out of view

**Common gotcha:** Sticky doesn't work if the parent has `overflow: hidden` or `overflow: auto`.

```css
/* Sticky table headers */
thead th {
  position: sticky;
  top: 0;
  background: white;  /* needed — otherwise content shows through */
  z-index: 1;
}
```

---

## 6. The `inset` Shorthand

```css
/* Long form */
top: 0; right: 0; bottom: 0; left: 0;

/* Shorthand */
inset: 0;                /* all four = 0 */
inset: 1rem;             /* all four = 1rem */
inset: 1rem 2rem;        /* top/bottom: 1rem, left/right: 2rem */
inset: 0 0 auto 0;       /* top/right/bottom/left individually */
inset-block: 0;          /* top + bottom = 0 */
inset-inline: 0;         /* left + right = 0 */
```

---

## 7. `z-index` and Stacking Contexts

`z-index` controls which elements paint on top of others. But it only works on **positioned elements** or elements with certain properties.

```css
/* z-index only works when position != static */
.modal   { position: fixed; z-index: 1000; }
.tooltip { position: absolute; z-index: 100; }
.overlay { position: fixed; z-index: 999; }
```

### Stacking contexts — the tricky part

A **stacking context** is an independent z-index universe. Elements can only be compared by z-index if they're in the **same stacking context**.

**What creates a stacking context:**
- `position` + `z-index` (any value other than `auto`)
- `opacity` less than 1
- `transform` (any value other than `none`)
- `filter`, `backdrop-filter` (any value other than `none`)
- `isolation: isolate`
- `will-change: transform` (or other animatable properties)
- `contain: layout` or `contain: paint`

```css
/* Problem: modal appears BEHIND header */
.header { position: fixed; z-index: 100; transform: translateZ(0); }
/* transform creates stacking context! Everything inside .header
   is confined to that context, no matter how high their z-index */

.modal { position: fixed; z-index: 9999; }  /* still behind .header */
```

**Fix:** Move the modal element outside of any stacking context containers, or use `isolation: isolate` strategically.

```css
/* Deliberately create a stacking context to contain child z-indexes */
.card {
  isolation: isolate;   /* children's z-index doesn't bleed out */
}
```

### Z-index scale convention

```css
:root {
  --z-base: 0;
  --z-raised: 10;      /* cards, dropdowns */
  --z-sticky: 100;     /* sticky headers */
  --z-overlay: 500;    /* overlays, backdrops */
  --z-modal: 1000;     /* modals */
  --z-toast: 2000;     /* notifications */
  --z-tooltip: 3000;   /* tooltips */
}
```

---

## 8. `overflow`

```css
overflow: visible;  /* default — content can bleed outside (doesn't create scroll) */
overflow: hidden;   /* clip overflow — also creates a new block formatting context */
overflow: scroll;   /* always show scrollbar */
overflow: auto;     /* show scrollbar only when needed */
overflow: clip;     /* clip without creating BFC (modern) */

overflow-x: auto;   /* horizontal only */
overflow-y: hidden; /* vertical only */
```

**`overflow: hidden` side effects:**
- Creates a block formatting context (BFCs affect float clearing, margin collapse)
- Clips absolutely positioned children
- Breaks `position: sticky` on descendants
- Clips `box-shadow` and `outline` that exceed the box

```css
/* Scrollable containers */
.scroll-container {
  overflow-y: auto;
  max-height: 400px;
}

/* Horizontal scroll (common for tab bars, code blocks) */
.code-block {
  overflow-x: auto;
  white-space: pre;  /* don't wrap */
}

/* Hide overflow but don't create BFC side effects */
.clip-only {
  overflow: clip;  /* new in modern CSS — clips but no BFC */
}
```

### `scrollbar-gutter`

```css
/* Reserve space for scrollbar so layout doesn't shift when it appears */
.container {
  overflow-y: auto;
  scrollbar-gutter: stable;  /* always reserves scrollbar space */
}
```

---

## 9. `transform` — The Positioning Power Tool

`transform` doesn't affect layout — it moves/scales/rotates the element's pixels without affecting sibling elements.

```css
transform: translateX(20px);     /* move right 20px */
transform: translateY(-10px);    /* move up 10px */
transform: translate(50%, -50%); /* move right 50% of own width, up 50% of own height */
transform: rotate(45deg);
transform: scale(1.05);          /* 5% bigger */
transform: scaleX(0);            /* squish to invisible */
transform: skewX(10deg);

/* Multiple transforms — apply RIGHT to LEFT */
transform: translateX(100px) rotate(45deg);
/* = first rotate 45deg, then translate right 100px */
```

**The classic absolute-center technique:**

```css
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* top/left moves top-left corner to center,
     then translate moves it back by half its own size */
}
```

**`transform-origin`** — point of rotation/scale:

```css
transform-origin: center;          /* default */
transform-origin: top left;
transform-origin: 0 0;
transform-origin: 100% 50%;        /* right center */
```

---

## Quick Reference Card

```
position values:
  static   → normal flow (default)
  relative → offset from normal, creates positioning context
  absolute → relative to nearest positioned ancestor
  fixed    → relative to viewport, scroll-immune
  sticky   → relative until threshold, then fixed-ish

Containing block:
  nearest ancestor with position != static

inset shorthand:
  inset: 0 → top/right/bottom/left: 0

z-index:
  only works on positioned elements
  stacking contexts trap child z-indexes
  creates a context: opacity<1, transform, filter, isolation:isolate

overflow:
  hidden → clip (also breaks sticky, creates BFC)
  auto   → scroll when needed (prefer this)
  clip   → clip without BFC (modern)

Common patterns:
  Corner badge:   position:absolute; top:-0.5rem; right:-0.5rem
  Full overlay:   position:absolute; inset:0
  Center tooltip: position:absolute; left:50%; transform:translateX(-50%)
  Sticky header:  position:sticky; top:0; z-index:10
```

---
