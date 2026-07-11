---
series: css-layout
level: 6
title: The Containing Block
lang: css
---

# The Containing Block

Every CSS element has a **containing block** — the reference rectangle used to compute its position, size, and percentage values. Most developers learn it implicitly through trial and error. Understanding the explicit rules eliminates the "why is it there?" confusion for all positioning scenarios.

## The Default: Parent Content Box

For elements in normal flow (`position: static` or `position: relative`), the containing block is the **content box of the nearest block ancestor**.

```css
.parent {
  width: 500px;
  padding: 20px; /* padding is NOT part of the containing block */
}

.child {
  width: 50%; /* 50% of 500px = 250px (the content box, not the padding box) */
}
```

```text
Parent element:
  ┌─────────────────────────────────────────┐ ← border edge
  │  padding (20px)                          │
  │  ┌───────────────────────────────────┐  │
  │  │  content box (500px) ← containing │  │
  │  │  block for .child                 │  │
  │  └───────────────────────────────────┘  │
  └─────────────────────────────────────────┘
```

## Rules by Position Value

The containing block changes based on the element's own `position` property:

```text
position: static or relative
  → Content box of nearest block ancestor (normal parent)

position: absolute
  → Padding box of nearest ancestor where position ≠ static
    (relative, absolute, fixed, or sticky)
  → Falls back to initial containing block (<html>) if none exists

position: fixed
  → Viewport (initial containing block)
  → EXCEPTION: transformed/filtered ancestor overrides this

position: sticky
  → Scroll container (the nearest ancestor with overflow scroll/auto/hidden)
    for the "stuck" position reference, but occupies space as if relative
```

**Key distinction for absolute:** The containing block is the **padding box** (includes padding), not just the content box. This means `top: 0; left: 0` on an absolutely positioned element aligns it with the top-left of the parent's padding area, not the content area.

```css
.parent {
  position: relative;
  padding: 20px;
}

.child {
  position: absolute;
  top: 0;   /* top of the PADDING box — above the content */
  left: 0;  /* left of the PADDING box */
}
```

**CS lens:** The containing block is a computed value, not a DOM property. During layout, the browser walks the ancestor chain applying the rules above and records the result. Percentages for `width`, `height`, `top`, `left`, `margin`, `padding` are all resolved against this stored rectangle. The containing block is part of why layout is a top-down one-pass algorithm — a child's percentage size cannot be computed until its containing block is established.

## Percentage Behaviour

Percentage values resolve against specific dimensions of the containing block:

```css
.child {
  width: 50%;      /* 50% of containing block WIDTH */
  height: 50%;     /* 50% of containing block HEIGHT (only works if CB has explicit height) */
  top: 10%;        /* 10% of containing block HEIGHT */
  left: 10%;       /* 10% of containing block WIDTH */
  margin: 5%;      /* 5% of containing block WIDTH — even vertical margins! */
  padding: 5%;     /* 5% of containing block WIDTH — even vertical padding! */
}
```

The fact that vertical `margin` and `padding` percentages resolve against the **width** (not height) of the containing block is one of CSS's more surprising rules.

## transform Breaks fixed

A transformed ancestor becomes the containing block for `position: fixed` descendants:

```css
.wrapper {
  transform: translateX(0); /* now a containing block for fixed children */
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%; /* NOW relative to .wrapper, not the viewport */
}
```

This is a common bug when animating a wrapper that contains a fixed overlay — the overlay appears to jump because its containing block changed.

**SE lens:** Containing block rules explain why `position: absolute; inset: 0` fills the positioned parent but not necessarily the viewport. They explain why `width: 100%` on an absolutely positioned element gives the parent's padding box width. They explain why a fixed modal inside an animated container breaks. Memorising the four-rule table above resolves most "why is it there?" positioning questions.

**Common mistakes:**
- Assuming `top: 0; left: 0` on an absolute element aligns with the content area — it aligns with the padding edge. Add padding to the parent to push the child inward.
- Using `height: 50%` on a child in a parent with `height: auto` — the containing block has no resolved height, so 50% computes to `auto` (or 0). The parent needs an explicit height first.
- Applying `transform` to a wrapper and being surprised that fixed children stop being viewport-relative — any `transform`, `filter`, or `perspective` on an ancestor breaks fixed positioning.

**Debug tip:** In Chrome DevTools, select a positioned element, open the Layout panel, and look for the "Containing block" highlight — it draws a purple dashed border around the element acting as the reference. This is the fastest way to verify which ancestor is the actual containing block.

**Next:** CSS Flexbox — the modern one-dimensional layout system designed to replace float-based layouts and handle dynamic sizing, alignment, and order elegantly.

## Challenge: containing block

Demonstrate the absolute-vs-relative containing block distinction. `#inner` must be positioned relative to `#box`, not the viewport.

1. Set `position` of `#box` to `relative`
2. Set `position` of `#inner` to `absolute`, `bottom` to `0`, `right` to `0`
3. Set `background-color` of `#box` to `rgb(30, 41, 59)`
4. Set `background-color` of `#inner` to `rgb(99, 102, 241)`
5. Set `width` of `#inner` to `50%` (50% of #box width)

```html
<div id="box" style="width:300px;height:200px;padding:16px;">
  <div id="inner" style="height:60px;color:white;padding:8px;">Inner</div>
</div>
```

```challenge
/* Make #inner position relative to #box */

```

```test
var box = document.querySelector('#box')
var inner = document.querySelector('#inner')
var sBox = getComputedStyle(box)
var sIn = getComputedStyle(inner)
assert sBox.position === 'relative'
assert sIn.position === 'absolute'
assert sIn.bottom === '0px'
assert sIn.right === '0px'
assert sBox.backgroundColor === 'rgb(30, 41, 59)'
assert sIn.backgroundColor === 'rgb(99, 102, 241)'
```
