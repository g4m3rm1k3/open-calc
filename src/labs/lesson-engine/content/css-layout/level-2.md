---
series: css-layout
level: 2
title: "position: relative"
lang: css
---

# position: relative

The `position` property changes how an element is placed in the document. Its default value is `static` — the element is placed by normal flow with no ability to use `top`, `right`, `bottom`, `left`, or `z-index`. Setting `position: relative` is the first step into the positioning system.

## What "relative" Means

`position: relative` moves an element from its normal flow position by a specified offset, while **keeping its space in the document flow reserved**. The surrounding elements behave as if the element is still exactly where normal flow put it.

```css
.shifted {
  position: relative;
  top: 20px;
  left: 30px;
}
```

```text
Before (normal flow):
  ┌──────────────┐
  │  element A   │
  └──────────────┘
  ┌──────────────┐  ← .shifted occupies this space in flow
  │  .shifted    │     (physically moved down 20px, right 30px)
  └──────────────┘
  ┌──────────────┐  ← element C still positioned as if .shifted is in its original spot
  │  element C   │
  └──────────────┘
```

The space the element would have occupied in normal flow is **preserved** — it is as if a ghost of the element remains there. Other elements do not rush in to fill the vacated position.

**CS lens:** `position: relative` does not change the layout tree. The element's normal-flow position is computed first, then a translation offset is applied as a paint operation. This is why surrounding elements are unaffected — the layout algorithm uses the original position; only the rendering step applies the offset.

## The Two Reasons to Use position: relative

**1. Visual nudging** — shifting an element slightly from its flow position without affecting surrounding layout.

```css
.superscript {
  position: relative;
  top: -4px;     /* nudge up 4px */
  font-size: 0.75em;
}
```

**2. Creating a positioned ancestor** — making an element the reference point for absolutely positioned children. This is by far the more important use.

```css
.card {
  position: relative; /* establishes a coordinate origin for children */
}

.badge {
  position: absolute; /* positions relative to .card, not the document */
  top: 8px;
  right: 8px;
}
```

```text
Without position: relative on .card:
  .badge positions relative to the nearest positioned ancestor
  (possibly the <body>) — jumps to a completely different part of the page.

With position: relative on .card:
  .badge positions relative to .card's top-right corner — stays attached.
```

Covered in depth in the next lesson. The key insight here: `position: relative` with no offsets is legitimate and useful — it creates a positioned ancestor without moving anything.

## Offset Properties: top, right, bottom, left

`top`, `right`, `bottom`, and `left` describe the offset from the element's **normal flow position**:

```css
.el { position: relative; top: 20px; }   /* moves DOWN 20px from its flow position */
.el { position: relative; top: -20px; }  /* moves UP 20px from its flow position */
.el { position: relative; left: 20px; }  /* moves RIGHT 20px from its flow position */
.el { position: relative; left: -20px; } /* moves LEFT 20px from its flow position */
```

```text
top: 20px means "20px from the top edge" — which pushes the element downward.
This is counterintuitive: positive top = moves down, positive left = moves right.
Think of it as "distance from the top" not "direction to move".
```

**SE lens:** A `position: relative` with no offsets is the most common use in production code — it exists purely to make absolutely positioned children attach to the correct parent. Search any large codebase and you will find many `position: relative` declarations with nothing else.

**Common mistakes:**
- Using `position: relative` with large offsets and being surprised that other elements don't reflow — they never do. The space is always reserved. Use margin or padding to push surrounding content; use `position: relative` only when you need the visual offset to not affect layout.
- Forgetting that `top: 20px` moves the element **down**, not up — "top" names the edge the offset is measured from, not the direction of movement.
- Setting `position: relative` on a child expecting it to affect the parent's layout — it only affects the child's rendered position and makes the child a positioned ancestor for its own children.

**Debug tip:** In DevTools, select a relatively positioned element and look at the Styles panel — the `top`, `left`, etc. values appear under `position: relative`. In the Layout tab (Chrome), you can inspect the element's bounding box vs its offset position. If an element appears visually shifted but other elements haven't moved, that is `position: relative` at work.

**Next:** `position: absolute` — removing an element from flow entirely and placing it at a precise position relative to its nearest positioned ancestor.

## Challenge: relative

Apply `position: relative` to `#badge` to shift it visually without affecting the layout of surrounding elements.

1. Set `position` of `#card` to `relative` (makes it a positioned ancestor)
2. Set `position` of `#badge` to `relative`, `top` to `-4px`, and `left` to `8px`
3. Set `background-color` of `#badge` to `rgb(59, 130, 246)`
4. Verify `#text` is unaffected — its `display` must remain `block`

```html
<div id="card">
  <span id="badge">New</span>
  <p id="text">Card content below the badge</p>
</div>
```

```challenge
/* Use position: relative */

```

```test
var card = document.querySelector('#card')
var badge = document.querySelector('#badge')
var text = document.querySelector('#text')
var sC = getComputedStyle(card)
var sB = getComputedStyle(badge)
assert sC.position === 'relative'
assert sB.position === 'relative'
assert sB.top === '-4px'
assert sB.left === '8px'
assert sB.backgroundColor === 'rgb(59, 130, 246)'
```
