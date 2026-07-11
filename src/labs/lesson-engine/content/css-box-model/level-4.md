---
series: css-box-model
level: 4
title: Overflow
lang: css
---

# Overflow

When content is larger than its container, the browser has to decide what to do. By default it lets content spill out. The `overflow` property gives you control over this.

## The Default: visible

```css
.box {
  height: 100px;
  /* overflow: visible — the default */
}
```

```text
Content that exceeds the box's height/width spills outside the box boundary.
It is still visible, but it overlaps adjacent elements. The box itself is not enlarged.
```

This is why a card with a fixed height and too much text bleeds into the element below it.

## overflow: hidden

```css
.card {
  height: 200px;
  overflow: hidden;
}
```

```text
Content that exceeds the boundary is clipped — it becomes invisible past the edge.
The box stays at its declared size. No scrollbar appears.
```

`overflow: hidden` is also commonly used to contain floats (the "clearfix" technique) and to create stacking contexts.

## overflow: auto and scroll

```css
.sidebar {
  height: 400px;
  overflow: auto;   /* scrollbar appears only when content overflows */
}

.code-block {
  overflow-x: auto; /* horizontal scroll only */
  overflow-y: hidden;
  white-space: pre; /* prevent text wrapping so overflow triggers */
}
```

```text
overflow: auto    — scrollbar appears only if needed
overflow: scroll  — scrollbar always appears (even when content fits)
overflow-x / overflow-y — control each axis independently
```

**CS lens:** `overflow` is fundamentally a paint and layout decision. `hidden` creates a clipping mask at the box boundary. `auto`/`scroll` creates a scroll container — a new formatting context that manages the layout of its children independently.

## overflow: clip

A newer value: like `hidden` but without creating a scroll container or a block formatting context:

```css
.decorative { overflow: clip; }
```

Use `clip` when you need visual clipping but don't want the side effects of `hidden` (particularly the block formatting context that `hidden` creates, which can affect margin collapsing and stacking).

## text-overflow

For single-line text truncation, combine three properties:

```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

```text
white-space: nowrap   → prevent wrapping to a second line
overflow: hidden      → clip the content
text-overflow: ellipsis → show "…" at the cut point
```

**SE lens:** Truncation is the right pattern for table cells, card titles, and navigation items where you want consistent layout regardless of content length. Always ensure the full text is accessible via tooltip (`title` attribute) or by expansion.

**Common mistakes:**
- Using `overflow: hidden` and then wondering why a child's `box-shadow` is clipped — `hidden` clips everything at the border edge, including box shadows. Use `overflow: clip` (no formatting context side effects) or restructure so the shadow element is not inside the clipping parent.
- Forgetting that `overflow: hidden` on a parent creates a block formatting context, which contains floats and collapses margins differently. This is useful (the "clearfix" behaviour) but can surprise you if unexpected.
- Setting `overflow: auto` on the wrong axis — `overflow-x: hidden; overflow-y: auto` is sometimes needed, but setting just `overflow: hidden` also hides x-overflow when you wanted only y-scroll.

**Debug tip:** In DevTools, elements with `overflow: hidden` show a "scroll" badge next to them in the Elements panel (Firefox) or a dashed border (Chrome). If content is unexpectedly clipped, look for `overflow: hidden` anywhere in the ancestor chain — it applies to all descendants, not just direct children.

**Next:** The `display` property — how elements participate in document flow: block, inline, inline-block, and none.

## Challenge: overflow

Style the containers so overflow is handled correctly.

1. Set `height` to `80px` on `#clipped` and `overflow` to `hidden`
2. Set `height` to `80px` on `#scrollable` and `overflow-y` to `auto`
3. On `#truncated`: set `white-space` to `nowrap`, `overflow` to `hidden`, `text-overflow` to `ellipsis`, and `width` to `150px`

```html
<div id="clipped">
  <p>This text is longer than the box. It should be clipped at the boundary and not visible beyond the container edge.</p>
</div>
<div id="scrollable">
  <p>This text is longer than the box. A scrollbar should appear so the user can scroll to read it all without the text overflowing.</p>
</div>
<div id="truncated">This text should be truncated with an ellipsis</div>
```

```challenge
/* Control overflow */

```

```test
var clipped = document.querySelector('#clipped')
var scrollable = document.querySelector('#scrollable')
var truncated = document.querySelector('#truncated')
var sC = getComputedStyle(clipped)
var sS = getComputedStyle(scrollable)
var sT = getComputedStyle(truncated)
assert sC.height === '80px'
assert sC.overflow === 'hidden'
assert sS.height === '80px'
assert sS.overflowY === 'auto' || sS.overflowY === 'scroll'
assert sT.textOverflow === 'ellipsis'
assert sT.whiteSpace === 'nowrap'
```
