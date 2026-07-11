---
series: css-layout
level: 2
title: "position: relative"
lang: css
---

# position: relative

The `position` property changes how an element is placed in the document. Its default value is `static` — the element is placed by normal flow with no ability to use `top`, `right`, `bottom`, `left`, or `z-index`. Setting `position: relative` is the first step into the positioning system.

## Space stays reserved

`position: relative` moves an element from its normal flow position by a specified offset, while **keeping its space in the document flow reserved**. The surrounding elements behave as if the element is still exactly where normal flow put it. Run this and drag the `top` value to see how `#shifted` moves without affecting `#other`.

```html
<div id="shifted">I am shifted down 30px but my space is still reserved</div>
<div id="other">I am unaffected — I stay where I would be in normal flow</div>
```

```css
#shifted { position: relative; top: 30px; background: #3b82f6; color: white; padding: 12px; margin-bottom: 4px; }
#other   { background: #1e293b; color: #e2e8f0; padding: 12px; }
```

The space the element would have occupied is **preserved** — other elements do not rush in to fill it.

**CS lens:** `position: relative` does not change the layout tree. The element's normal-flow position is computed first, then a translation offset is applied as a paint operation. This is why surrounding elements are unaffected — the layout algorithm uses the original position; only the rendering step applies the offset.

## The two reasons to use position: relative

**1. Visual nudging** — shifting an element slightly from its flow position without affecting surrounding layout.

```html
<p>Price: <span id="currency">$</span><span id="amount">99</span></p>
```

```css
p { font-size: 32px; color: #e2e8f0; font-family: system-ui; }
#currency { position: relative; top: -8px; font-size: 16px; color: #94a3b8; }
```

**2. Creating a positioned ancestor** — making an element the reference point for absolutely positioned children. This is the far more common use in production code.

```html
<div id="card">
  Card content
  <span id="badge">New</span>
</div>
```

```css
#card  { position: relative; background: #1e293b; color: #e2e8f0; padding: 24px; width: 200px; }
#badge { position: absolute; top: 8px; right: 8px; background: #ef4444; color: white; font-size: 11px; padding: 2px 6px; border-radius: 4px; }
```

Without `position: relative` on `#card`, the badge would jump to the nearest positioned ancestor further up the tree (often `<body>`). Covered in depth in the next lesson.

**SE lens:** A `position: relative` with no offsets is the most common use in production code — it exists purely to make absolutely positioned children attach to the correct parent. Search any large codebase and you will find many `position: relative` declarations with nothing else.

**Common mistakes:**
- Using `position: relative` with large offsets and being surprised that other elements don't reflow — the space is always reserved. Use margin or padding to push surrounding content.
- Forgetting that `top: 20px` moves the element **down**, not up — "top" names the edge the offset is measured from, not the direction of movement.
- Setting `position: relative` on a child expecting it to affect the parent's layout — it only affects the child's rendered position.

**Debug tip:** In DevTools, select a relatively positioned element and look at the Styles panel — the `top`, `left` etc. values appear under `position: relative`. If an element appears visually shifted but surrounding elements haven't moved, that is `position: relative` at work.

**Next:** `position: absolute` — removing an element from flow entirely and placing it at a precise position relative to its nearest positioned ancestor.

## Challenge: relative

Apply `position: relative` to `#badge` to shift it visually without affecting surrounding layout.

1. Set `position` of `#card` to `relative` (makes it a positioned ancestor)
2. Set `position` of `#badge` to `relative`, `top` to `-4px`, and `left` to `8px`
3. Set `background-color` of `#badge` to `rgb(59, 130, 246)`

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
var sC = getComputedStyle(card)
var sB = getComputedStyle(badge)
assert sC.position === 'relative'
assert sB.position === 'relative'
assert sB.top === '-4px'
assert sB.left === '8px'
assert sB.backgroundColor === 'rgb(59, 130, 246)'
```
