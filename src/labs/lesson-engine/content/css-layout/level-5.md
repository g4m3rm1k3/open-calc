---
series: css-layout
level: 5
title: Floats
lang: css
---

# Floats

`float` was the first CSS mechanism for placing elements side by side. Introduced in CSS 1 to replicate magazine-style text wrapping around images, it became the dominant multi-column layout tool before flexbox and grid existed. Understanding floats is essential for reading legacy code, understanding how browsers resolve float + block interactions, and knowing why BFCs exist.

## What Float Does

A floated element is shifted to the left or right of its line box and allows inline content (text, inline elements) to wrap around it. It is **partially** removed from normal flow: block elements ignore it, but inline content wraps around it.

```css
.image {
  float: left;
  margin-right: 16px;
}
```

```text
Without float:
  ┌─────────────────────────────┐
  │  ┌────────┐                 │
  │  │ image  │                 │
  │  └────────┘                 │
  │  Text starts here...        │
  └─────────────────────────────┘

With float: left:
  ┌─────────────────────────────┐
  │  ┌────────┐  Text wraps     │
  │  │ image  │  around the     │
  │  └────────┘  floated image  │
  │  like a magazine layout.    │
  └─────────────────────────────┘
```

Block siblings behave as if the float is not there — they overlap with the float's space. But inline content inside those blocks wraps around the float's edge.

**CS lens:** The browser runs a two-pass layout for floats. In the first pass (block layout), floated elements are skipped. In the second pass (inline layout), the browser checks for active floats and adjusts each line box's available width to avoid overlapping the float. This is why block backgrounds can underlap a float while text wraps around it.

## Clearing Floats

`clear: left`, `clear: right`, or `clear: both` forces an element to start below any active float on the specified side.

```css
.footer {
  clear: both; /* will start below all preceding floats */
}
```

```text
Without clear:         With clear: both:
  [float left]           [float left]
  [footer text]    →     
  overlaps float         [footer]     ← starts below float
```

When you need an element to clear floats without adding a visible element, the micro-clearfix technique uses a pseudo-element:

```css
.container::after {
  content: '';
  display: table;
  clear: both;
}
```

This was the dominant clearfix pattern from ~2010–2017, before `display: flow-root` provided a cleaner alternative (as covered in level-1).

## float and Block Formatting Contexts

A floated element creates its own BFC. A block element that also creates a BFC will not overlap a sibling float — it shrinks its width to avoid the float.

```css
.sidebar { float: left; width: 200px; }
.main    { display: flow-root; } /* creates BFC — avoids overlapping .sidebar */
```

```text
Without flow-root on .main:         With flow-root on .main:
  ┌──────┬─────────────────┐          ┌──────┬────────────────┐
  │sidebar│ .main background│          │side  │ .main fills    │
  │      │ underlaps sidebar│          │bar   │ remaining width│
  └──────┴─────────────────┘          └──────┴────────────────┘
```

**SE lens:** Float-based layouts are legacy code. Flexbox replaced floats for layout in ~2015; grid largely replaced both by 2020. You will encounter floats extensively in older codebases and CSS frameworks like Bootstrap 3. When maintaining legacy float layouts, understand `clear` and the BFC-avoidance behaviour before modifying structure. When writing new code, use flexbox or grid.

**Common mistakes:**
- Applying `float` for layout and being confused when the parent collapses to zero height — the parent is not a BFC and does not contain floated children. Add `display: flow-root` to the parent.
- Using `clear: both` on the wrong element — `clear` must be on the element you want to appear *below* the float, not on the float itself.
- Expecting floated elements to respect `vertical-align` — vertical-align only applies within inline formatting contexts. Floats are partially removed from flow and do not participate in inline alignment.

**Debug tip:** In DevTools, select a parent that should contain floats — if its height is `0` or smaller than you expect, it is not a BFC. Look for `display: flow-root` or the old `::after` clearfix. If neither is present, the parent is not containing its floats.

**Next:** The containing block — the full ruleset for which ancestor determines an element's position origin, which depends on both the element's `position` value and its ancestor chain.

## Challenge: float

Float `#sidebar` left so that text in `#main` wraps around it.

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
