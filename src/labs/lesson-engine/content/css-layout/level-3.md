---
series: css-layout
level: 3
title: "position: absolute"
lang: css
---

# position: absolute

`position: absolute` removes an element completely from normal flow and places it at an exact position relative to its **containing block** — which is the nearest ancestor with a `position` value other than `static`. It is the tool for overlapping elements, tooltips, badges, dropdowns, and any element that must be placed precisely without affecting surrounding layout.

## Removed from Flow

When an element is absolutely positioned, the document behaves as if it does not exist:

```css
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

```text
Before (in flow):
  ┌────────────────────────────┐
  │  [badge]                   │
  │  Normal content here       │
  └────────────────────────────┘

After (position: absolute):
  ┌────────────────────────────┐
  │  Normal content here       │  ← content moves up, fills where badge was
  └────────────────────────────┘
  [badge floating at top: 8px, right: 8px of its containing block]
```

Other elements reflow as if the absolutely positioned element was never there.

**CS lens:** Absolutely positioned elements form their own layer in the layout tree. They are excluded from the block formatting context of their parent. Their coordinates are computed in a separate pass relative to the containing block, then painted at the specified position — on top of (or behind, depending on z-index) the normal flow content.

## The Containing Block

The **containing block** of an absolutely positioned element is the **nearest ancestor with `position` set to anything other than `static`**.

```css
.card {
  position: relative; /* ← this element is the containing block */
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  /* "top: 8px from .card's top edge, right: 8px from .card's right edge" */
}
```

```text
If no positioned ancestor exists, the containing block is the initial containing
block — effectively the <html> element. The badge jumps to the top-right of the page.

If .card has position: relative, the badge stays in the top-right of the card.
```

This is why `position: relative` (with no offsets) is so common — it exists solely to establish a containing block for absolutely positioned children.

## Sizing Absolute Elements

Absolutely positioned elements shrink to their content width by default (they no longer inherit 100% width from the flow). You can set explicit dimensions or use the offset properties to stretch them:

```css
/* Explicit size */
.tooltip {
  position: absolute;
  width: 200px;
  top: 40px;
  left: 0;
}

/* Stretch to fill the containing block */
.overlay {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  /* equivalent to: inset: 0 (modern shorthand) */
}
```

```text
inset: 0 is shorthand for top: 0; right: 0; bottom: 0; left: 0.
An absolutely positioned element with inset: 0 fills its containing block exactly.
```

## Stacking with z-index

Absolutely positioned elements accept `z-index` to control paint order. Elements with higher `z-index` are painted on top within the same stacking context (covered in CSS Box Model, level 7).

```css
.dropdown { position: absolute; z-index: 10; }
.tooltip  { position: absolute; z-index: 20; } /* painted above dropdown */
```

**SE lens:** Absolute positioning is the right tool for UI overlays — badges, tooltips, dropdown menus, modal close buttons, floating action buttons — anywhere the element logically belongs to a parent but visually appears on top of or overlapping normal content. The pattern is always: `position: relative` on the parent, `position: absolute` on the overlay.

**Common mistakes:**
- Forgetting to set `position: relative` on the intended parent — the element jumps to the nearest positioned ancestor higher up (often `<body>`), appearing completely out of place.
- Setting `position: absolute` and expecting `width: 100%` to mean the parent width — it means 100% of the **containing block** width, not the nearest block ancestor. These are the same only when the parent has `position: relative`.
- Using absolute positioning for layout (placing multiple content columns) — absolute elements are outside normal flow, so they do not push content aside. Use flexbox or grid for layout; use absolute positioning for overlays.

**Debug tip:** In DevTools, select an absolutely positioned element. The Layout tab (Chrome) shows a purple dashed border around its containing block — this immediately reveals which ancestor is acting as the reference. If the containing block is not what you expected, check the ancestor chain for unexpected `position` values.

**Next:** `position: fixed` — like absolute, but positioned relative to the viewport and unaffected by scrolling.

## Challenge: absolute

Place `#badge` in the top-right corner of `#card` using absolute positioning.

1. Set `position` of `#card` to `relative` (containing block)
2. Set `position` of `#badge` to `absolute`
3. Set `top` to `8px` and `right` to `8px`
4. Set `background-color` of `#badge` to `rgb(239, 68, 68)`
5. Set `color` of `#badge` to `rgb(255, 255, 255)`

```html
<div id="card" style="width:200px;height:120px;background:#1e293b;padding:16px;">
  Card content
  <span id="badge">New</span>
</div>
```

```challenge
/* Position #badge in the top-right of #card */

```

```test
var card = document.querySelector('#card')
var badge = document.querySelector('#badge')
var sC = getComputedStyle(card)
var sB = getComputedStyle(badge)
assert sC.position === 'relative'
assert sB.position === 'absolute'
assert sB.top === '8px'
assert sB.right === '8px'
assert sB.backgroundColor === 'rgb(239, 68, 68)'
assert sB.color === 'rgb(255, 255, 255)'
```
