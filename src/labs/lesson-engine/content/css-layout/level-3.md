---
series: css-layout
level: 3
title: "position: absolute"
lang: css
---

# position: absolute

`position: absolute` removes an element completely from normal flow and places it at an exact position relative to its **containing block** — the nearest ancestor with a `position` value other than `static`. It is the tool for badges, tooltips, dropdowns, and any element that must be placed precisely without affecting surrounding layout.

## Removed from flow entirely

When an element is absolutely positioned, the document behaves as if it does not exist. Other elements reflow as if the absolutely positioned element was never there. Run this and notice how `#content` jumps up to fill the space `#badge` would have occupied.

```html
<div id="card">
  <span id="badge">New</span>
  <p id="content">This content ignores the badge entirely — the badge is out of flow.</p>
</div>
```

```css
#card    { position: relative; background: #1e293b; color: #e2e8f0; padding: 16px; width: 280px; }
#badge   { position: absolute; top: 8px; right: 8px; background: #ef4444; color: white; font-size: 11px; padding: 2px 8px; border-radius: 12px; }
#content { margin: 0; }
```

**CS lens:** Absolutely positioned elements form their own layer in the layout tree. They are excluded from the block formatting context of their parent. Their coordinates are computed in a separate pass relative to the containing block, then painted at the specified position.

## The containing block

The **containing block** of an absolutely positioned element is the **nearest ancestor with `position` set to anything other than `static`**. Remove `position: relative` from `#card` below and watch the badge jump to the top-right of the page (the `<body>` becomes the containing block).

```html
<div id="outer" style="padding: 40px; background: #0f172a;">
  <div id="card">
    Card content here
    <span id="badge">Badge</span>
  </div>
</div>
```

```css
#card  { position: relative; background: #1e293b; color: #e2e8f0; padding: 24px 16px; width: 220px; }
#badge { position: absolute; top: 8px; right: 8px; background: #6366f1; color: white; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
```

This is why `position: relative` (with no offsets) is so common — it exists solely to establish a containing block for absolutely positioned children.

## Filling the containing block with inset

Absolutely positioned elements shrink to their content width by default. Use the offset properties to stretch them, or use the `inset` shorthand to fill the containing block completely.

```html
<div id="card">
  <img src="https://picsum.photos/300/180" style="display:block;width:100%;" />
  <div id="overlay">Hover overlay pattern</div>
</div>
```

```css
#card    { position: relative; width: 300px; overflow: hidden; }
#overlay { position: absolute; inset: 0; background: rgba(99,102,241,0.85); color: white; display: flex; align-items: center; justify-content: center; font-family: system-ui; font-weight: 600; }
```

`inset: 0` is shorthand for `top: 0; right: 0; bottom: 0; left: 0`. An absolutely positioned element with `inset: 0` fills its containing block exactly.

**SE lens:** Absolute positioning is the right tool for UI overlays — badges, tooltips, dropdown menus, modal close buttons — anywhere the element logically belongs to a parent but visually appears on top of normal content. The pattern is always: `position: relative` on the parent, `position: absolute` on the overlay.

**Common mistakes:**
- Forgetting to set `position: relative` on the intended parent — the element jumps to the nearest positioned ancestor higher up (often `<body>`).
- Setting `position: absolute` and expecting `width: 100%` to mean the parent width — it means 100% of the **containing block** width.
- Using absolute positioning for layout (placing multiple content columns) — absolute elements are outside normal flow and do not push content aside. Use flexbox or grid for layout.

**Debug tip:** In DevTools, select an absolutely positioned element. The Layout tab (Chrome) shows a purple dashed border around its containing block — this immediately reveals which ancestor is acting as the reference.

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
