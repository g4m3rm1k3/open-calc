# CSS Masterclass — Lesson 3: Flexbox

> Flexbox is for **1D layouts** — rows OR columns. It's the best tool for alignment, spacing, and distributing items along a single axis.

---

## 1. The Two Worlds: Container vs Items

Flex properties split into two categories:

- **Container properties** — go on the parent (`display: flex`)
- **Item properties** — go on the children

```css
/* Container */
.parent {
  display: flex;           /* activates flexbox */
  flex-direction: row;     /* row (default) | column | row-reverse | column-reverse */
  flex-wrap: nowrap;       /* nowrap (default) | wrap | wrap-reverse */
  gap: 1rem;               /* space between items */
  justify-content: flex-start;
  align-items: stretch;
}

/* Item */
.child {
  flex: 1;
  align-self: center;
  order: 0;
}
```

---

## 2. The Main Axis vs Cross Axis

This is the core mental model. The axes flip based on `flex-direction`:

```
flex-direction: row (default)
   Main axis →→→→→→→→→→→→→→→→
   ┌────┬────┬────┬────┬────┐
   │ A  │ B  │ C  │ D  │ E  │
   └────┴────┴────┴────┴────┘
   ↑ Cross axis (vertical)

flex-direction: column
   ┌────┐  ↑
   │ A  │  Main axis (vertical)
   ├────┤  ↓
   │ B  │
   ├────┤
   │ C  │
   └────┘
   →→ Cross axis (horizontal)
```

**Rule:** `justify-content` controls the **main axis**. `align-items` controls the **cross axis**.

---

## 3. `justify-content` — Main Axis Distribution

```css
justify-content: flex-start;    /* pack to start (default) */
justify-content: flex-end;      /* pack to end */
justify-content: center;        /* center */
justify-content: space-between; /* first at start, last at end, equal gaps */
justify-content: space-around;  /* equal space around each item */
justify-content: space-evenly;  /* equal space between AND on edges */
```

```
space-between:  [A]----[B]----[C]
space-around:   -[A]--[B]--[C]-
space-evenly:   --[A]--[B]--[C]--
```

---

## 4. `align-items` — Cross Axis Alignment

```css
align-items: stretch;       /* stretch to fill container height (default) */
align-items: flex-start;    /* align to top/left of cross axis */
align-items: flex-end;      /* align to bottom/right */
align-items: center;        /* center on cross axis */
align-items: baseline;      /* align text baselines — great for mixed font sizes */
```

### The perfect center (most common flex pattern)

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

---

## 5. `flex-wrap` and Multi-line Alignment

```css
.container {
  display: flex;
  flex-wrap: wrap;  /* items wrap to next line when they don't fit */
  gap: 1rem;
}

/* align-content controls multi-line alignment (only applies when wrapping) */
align-content: flex-start;
align-content: center;
align-content: space-between;
align-content: stretch;
```

---

## 6. `gap` — Space Between Items

```css
gap: 1rem;           /* equal gap in all directions */
gap: 1rem 2rem;      /* row-gap column-gap */
row-gap: 1rem;
column-gap: 2rem;
```

> **Don't use margin for flex gaps.** `gap` is cleaner — no margin on the first/last item edge, and it works with wrapping.

---

## 7. Item Properties

### `flex` — The Big Three in One

`flex: grow shrink basis` — shorthand for the three item sizing properties.

```css
flex: 1;       /* = flex: 1 1 0   → grow, shrink, start from 0 */
flex: auto;    /* = flex: 1 1 auto → grow, shrink, start from natural size */
flex: none;    /* = flex: 0 0 auto → don't grow or shrink */
flex: 0 0 200px; /* fixed 200px, never grow or shrink */
```

**What each part does:**

```css
flex-grow: 1;    /* how much extra space to absorb (relative to siblings) */
flex-shrink: 1;  /* how much to shrink if container is too small */
flex-basis: 0;   /* starting size before grow/shrink is applied */
```

```css
/* Classic sidebar + main layout */
.layout {
  display: flex;
}
.sidebar { flex: 0 0 280px; }  /* fixed 280px, never grows or shrinks */
.main    { flex: 1; }          /* takes all remaining space */
```

```css
/* Equal-width columns that share space */
.cols { display: flex; gap: 1rem; }
.col  { flex: 1; }  /* each column gets equal share */

/* One column twice as wide */
.col-wide { flex: 2; }  /* gets twice the space of flex: 1 siblings */
```

### `align-self` — Override for One Item

```css
.item { align-self: flex-end; }   /* overrides parent's align-items for this item */
```

### `order` — Visual Reordering

```css
/* Changes visual order without changing DOM order */
.item-1 { order: 2; }
.item-2 { order: 1; }  /* appears first visually */
.item-3 { order: 3; }

/* Negative order to push to front */
.featured { order: -1; }
```

> **Accessibility warning:** `order` changes visual order but NOT keyboard/screen reader order (which follows DOM). Use carefully.

---

## 8. Common Real-World Flex Patterns

### Navigation bar

```css
.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 2rem;
}

.nav-logo { margin-right: auto; }  /* pushes everything else to the right */
```

### Card with footer pinned to bottom

```css
.card {
  display: flex;
  flex-direction: column;
  height: 100%;           /* card fills its grid cell */
}

.card-body  { flex: 1; }  /* body takes all available space */
.card-footer { /* stays at bottom naturally */ }
```

### Responsive wrapping grid (poor man's grid)

```css
.tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.tile {
  flex: 1 1 200px;  /* grow, shrink, but never smaller than 200px */
  /* items wrap naturally when they'd be smaller than 200px */
}
```

### Centering a modal/overlay

```css
.overlay {
  position: fixed;
  inset: 0;            /* shorthand for top/right/bottom/left: 0 */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 0.5);
}
```

### Flex with overflow (scrollable tab bar)

```css
.tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;         /* hide scrollbar Firefox */
}
.tabs::-webkit-scrollbar { display: none; } /* hide scrollbar Chrome */

.tab {
  flex-shrink: 0;   /* tabs don't shrink below their natural width */
  white-space: nowrap;
}
```

---

## 9. The Flex Sizing Algorithm (what actually happens)

When the browser sizes flex items:

1. Items start at their `flex-basis` (or `auto` = natural content size)
2. Calculate remaining space (positive or negative)
3. Distribute remaining space using `flex-grow` ratios (if positive leftover)
4. Shrink items using `flex-shrink` ratios (if negative leftover / overflow)

```css
/* Example: container is 500px, three items */
.container { display: flex; width: 500px; }
.a { flex: 0 0 100px; }   /* stays 100px */
.b { flex: 1; }            /* grows to fill remaining 400px / 3 */
.c { flex: 2; }            /* grows to fill remaining 400px * 2/3 */
/* b = 133px, c = 267px, total = 500px ✓ */
```

---

## Quick Reference Card

```
Container:
  display: flex
  flex-direction: row | column
  flex-wrap: nowrap | wrap
  justify-content: flex-start | center | flex-end | space-between | space-evenly
  align-items:     stretch | center | flex-start | flex-end | baseline
  align-content:   (multi-line only) same values as justify-content
  gap: <row> <col>

Item:
  flex: <grow> <shrink> <basis>
  flex: 1           → take equal share of space
  flex: none        → fixed natural size
  flex: 0 0 200px   → hard 200px
  align-self:       override parent align-items
  order:            visual reorder (careful with a11y)

The center trick:
  display: flex; justify-content: center; align-items: center;

Sidebar + main:
  .sidebar { flex: 0 0 280px; }
  .main    { flex: 1; }

Push to right:
  .logo { margin-right: auto; }
```

---
