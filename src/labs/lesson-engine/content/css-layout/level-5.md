---
series: css-layout
level: 5
title: Floats
lang: css
---

# Floats

`float` was the first CSS mechanism for placing elements side by side. Introduced in CSS 1 to replicate magazine-style text wrapping around images, it became the dominant multi-column layout tool before flexbox and grid existed. Understanding floats is essential for reading legacy code, understanding BFC behaviour, and knowing why clearfix patterns exist.

## Text wraps around a float

A floated element is shifted to the left or right of its line box and allows inline content to wrap around it. Block elements ignore it (their backgrounds can underlap it), but inline content wraps around the float's edge. Run this and see how the text wraps around the image.

```html
<div id="article">
  <div id="image">Image</div>
  <p>This text wraps around the floated element just like text wraps around an image in a magazine layout. The block background of this paragraph underlaps the float, but the text lines clear it.</p>
  <p>This second paragraph also wraps if there is room, then continues below once the float is cleared.</p>
</div>
```

```css
#article { background: #1e293b; color: #e2e8f0; padding: 16px; font-family: system-ui; }
#image   { float: left; width: 100px; height: 80px; background: #6366f1; color: white; margin: 0 16px 8px 0; display: flex; align-items: center; justify-content: center; }
```

**CS lens:** The browser runs a two-pass layout for floats. In the first pass (block layout), floated elements are skipped. In the second pass (inline layout), the browser checks for active floats and adjusts each line box's available width to avoid overlapping the float. This is why block backgrounds underlap a float while text wraps.

## Clearing floats

`clear: left`, `clear: right`, or `clear: both` forces an element to start below any active float on the specified side. Remove `clear: both` from `#footer` below and watch it slide up next to the float.

```html
<div id="container">
  <div id="sidebar">Sidebar</div>
  <p>Main content that flows next to the sidebar.</p>
  <div id="footer">Footer — clear: both keeps me below all floats</div>
</div>
```

```css
#container { background: #0f172a; color: #e2e8f0; padding: 16px; font-family: system-ui; }
#sidebar   { float: left; width: 120px; height: 100px; background: #6366f1; margin-right: 16px; padding: 8px; color: white; }
#footer    { clear: both; background: #1e293b; padding: 12px; margin-top: 8px; }
```

When you need to clear floats without a visible element, the clearfix pseudo-element is the old pattern:
`container::after { content: ''; display: table; clear: both; }` — before `display: flow-root` was added in 2017.

## BFC avoidance of floats

A block that establishes a BFC will not overlap a sibling float — it shrinks its width to sit beside the float. Remove `display: flow-root` from `#main` and watch it slide under the sidebar.

```html
<div id="page">
  <div id="sidebar">Sidebar</div>
  <div id="main">
    <p>With display: flow-root, I create a BFC and avoid overlapping the sidebar. Remove it and my background slides underneath.</p>
  </div>
</div>
```

```css
#page    { background: #0f172a; color: #e2e8f0; padding: 16px; font-family: system-ui; overflow: hidden; }
#sidebar { float: left; width: 140px; background: #6366f1; padding: 12px; color: white; margin-right: 12px; height: 100px; }
#main    { display: flow-root; background: #1e293b; padding: 12px; }
```

**SE lens:** Float-based layouts are legacy code. Flexbox replaced floats for layout in ~2015; grid largely replaced both by 2020. You will encounter floats extensively in older codebases and CSS frameworks like Bootstrap 3. When writing new code, use flexbox or grid.

**Common mistakes:**
- Applying `float` for layout and being confused when the parent collapses to zero height — add `display: flow-root` to the parent.
- Using `clear: both` on the wrong element — `clear` must be on the element you want to appear *below* the float, not on the float itself.
- Expecting floated elements to respect `vertical-align` — vertical-align only applies within inline formatting contexts.

**Debug tip:** In DevTools, select a parent that should contain floats — if its height is `0` or smaller than expected, it is not a BFC. Look for `display: flow-root` or an `::after` clearfix. If neither is present, the parent is not containing its floats.

**Next:** The containing block — the full ruleset for which ancestor determines an element's position origin, depending on both the element's `position` value and its ancestor chain.

## Challenge: float

Float `#sidebar` left so that text in `#main` wraps around it, and contain the float with a BFC.

1. Set `float` of `#sidebar` to `left`
2. Set `width` of `#sidebar` to `120px` and `height` to `80px`
3. Set `background-color` of `#sidebar` to `rgb(59, 130, 246)`
4. Set `display` of `#container` to `flow-root` (contains the float)
5. Set `background-color` of `#container` to `rgb(30, 41, 59)`

```html
<div id="container">
  <div id="sidebar">Sidebar</div>
  <p id="main">Main content that wraps around the floated sidebar element.</p>
</div>
```

```challenge
/* Float the sidebar and contain it */

```

```test
var sidebar = document.querySelector('#sidebar')
var container = document.querySelector('#container')
var sS = getComputedStyle(sidebar)
var sC = getComputedStyle(container)
assert sS.float === 'left'
assert sS.width === '120px'
assert sS.backgroundColor === 'rgb(59, 130, 246)'
assert sC.display === 'flow-root'
assert sC.backgroundColor === 'rgb(30, 41, 59)'
```
