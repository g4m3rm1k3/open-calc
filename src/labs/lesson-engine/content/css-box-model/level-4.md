---
series: css-box-model
level: 4
title: Overflow
lang: css
---

# Overflow

When content is larger than its container, the browser has to decide what to do. By default it lets content spill out. The `overflow` property gives you control over this.

## The problem — content bleeds out

Set a fixed height and add too much text. The content spills over the next element. Change `overflow` from `visible` to `hidden`, `auto`, or `scroll` and see the behaviour switch.

```html
<div id="card">
  <p>This paragraph has more text than the fixed-height card can hold. By default it bleeds out and overlaps the element below.</p>
  <p>This is even more text that really drives the point home.</p>
</div>
<div id="below">I am the element below. Watch how overflow affects me.</div>
```

```css
#card  { height: 80px; overflow: visible; background: #1e293b; color: #e2e8f0; padding: 12px; font-family: system-ui; font-size: 14px; }
#below { background: #0f172a; color: #94a3b8; padding: 12px; font-family: system-ui; font-size: 14px; margin-top: 8px; }
```

**CS lens:** `overflow` is fundamentally a paint and layout decision. `hidden` creates a clipping mask at the box boundary. `auto`/`scroll` creates a scroll container — a new formatting context that manages the layout of its children independently.

## overflow: hidden — clip to the box

The content is cut at the boundary. The box stays the declared size. The element below is unaffected. Also the mechanism for clipping images to rounded corners.

```html
<div id="card">
  <img src="https://picsum.photos/300/80" style="display:block;width:100%;" />
  <div id="overlay">overflow: hidden clips the image to the rounded corners</div>
</div>
```

```css
#card    { overflow: hidden; border-radius: 12px; width: 300px; background: #1e293b; color: white; font-family: system-ui; position: relative; }
#overlay { padding: 8px 12px; font-size: 13px; background: rgba(0,0,0,0.6); }
```

## overflow: auto — scroll only when needed

A scrollbar appears only when the content actually overflows. The most common value for scrollable panels.

```html
<div id="feed">
  <div class="post">Post 1 — lots of content in a scrollable feed</div>
  <div class="post">Post 2 — more content here</div>
  <div class="post">Post 3 — and more</div>
  <div class="post">Post 4 — getting long</div>
  <div class="post">Post 5 — almost there</div>
  <div class="post">Post 6 — last item</div>
</div>
```

```css
#feed  { height: 150px; overflow-y: auto; background: #0f172a; padding: 8px; }
.post  { background: #1e293b; color: #e2e8f0; font-family: system-ui; font-size: 13px; padding: 10px; margin-bottom: 6px; border-radius: 4px; }
```

## Text truncation — ellipsis

Single-line text cutoff with `…`. Three properties work together: `nowrap` prevents line breaks, `hidden` clips the text, `ellipsis` shows the `…` marker.

```html
<ul id="list">
  <li>Short title</li>
  <li>A much longer title that exceeds the width of this list item and should be truncated</li>
  <li>Medium length title here</li>
  <li>Another very long title that would otherwise break the layout of this component</li>
</ul>
```

```css
#list { width: 250px; background: #1e293b; padding: 8px; list-style: none; margin: 0; }
#list li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #e2e8f0; font-family: system-ui; font-size: 14px; padding: 6px 8px; border-bottom: 1px solid #334155; }
```

**SE lens:** Truncation is the right pattern for table cells, card titles, and nav items where you want consistent layout regardless of content length. Always ensure the full text is accessible via a `title` attribute or expandable UI.

**Common mistakes:**
- Using `overflow: hidden` and wondering why a child's `box-shadow` is clipped — `hidden` clips everything at the border edge. Use `overflow: clip` (no formatting-context side effects) or move the shadow element outside the clipping parent.
- Setting `overflow: auto` on the wrong axis — `overflow-x: hidden; overflow-y: auto` is sometimes needed, but setting just `overflow: hidden` clips both axes.
- Forgetting all three properties for ellipsis truncation — `white-space: nowrap` is the one most often missed.

**Debug tip:** In DevTools, elements with `overflow: hidden` show a "scroll" badge in the Elements panel. If content is unexpectedly clipped, look for `overflow: hidden` anywhere in the ancestor chain.

**Next:** The `display` property — how elements participate in document flow: block, inline, inline-block, and none.

## Challenge: overflow

Style the containers so overflow is handled correctly.

1. Set `height` to `80px` on `#clipped` and `overflow` to `hidden`
2. Set `height` to `80px` on `#scrollable` and `overflow-y` to `auto`
3. On `#truncated`: set `white-space` to `nowrap`, `overflow` to `hidden`, `text-overflow` to `ellipsis`, and `width` to `150px`

```html
<div id="clipped">
  <p>This text is longer than the box. It should be clipped at the boundary.</p>
</div>
<div id="scrollable">
  <p>This text is longer than the box. A scrollbar should appear so the user can scroll to read it all.</p>
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
