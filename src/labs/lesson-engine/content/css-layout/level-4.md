---
series: css-layout
level: 4
title: "position: fixed and sticky"
lang: css
---

# position: fixed and sticky

`position: fixed` and `position: sticky` extend the positioning system into scroll behaviour. Fixed elements stay anchored to the viewport regardless of scrolling. Sticky elements behave like normal flow elements until a scroll threshold is crossed, then "stick" to a specified edge until their parent scrolls past.

## position: fixed — Viewport-Anchored

A fixed element is removed from normal flow (like absolute) and positioned relative to the **viewport** — the visible browser window. It does not scroll with the page.

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;  /* stretch full width */
  height: 60px;
  background: #0f172a;
  z-index: 100;
}
```

```text
Scroll position 0:                Scroll position 400px:
┌─────────────────────┐          ┌─────────────────────┐
│ [fixed header]      │          │ [fixed header]      │  ← same position
├─────────────────────┤          ├─────────────────────┤
│ page content...     │          │ ...page content...  │  ← scrolled
│                     │          │ (content moved up)  │
└─────────────────────┘          └─────────────────────┘
```

The containing block for `position: fixed` is always the **initial containing block** (the viewport) — never an ancestor element. Even `position: relative` on a parent has no effect on where a fixed child anchors.

**One exception:** If any ancestor has `transform`, `filter`, or `perspective` applied, the fixed element anchors to that ancestor instead of the viewport — a common and frustrating bug.

**CS lens:** Fixed positioning is a paint-only operation after layout. The element is laid out in a zero-width, zero-height slot (it is out of flow), then the rendering engine paints it at the viewport-relative position on every frame independently of the scroll offset.

## position: sticky — Scroll-Triggered Fix

A sticky element flows normally **until it reaches a defined scroll position relative to its scroll container**, then it "sticks" at that position until its parent scrolls out of view.

```css
.section-header {
  position: sticky;
  top: 0;          /* sticks to the top of the scroll container */
  background: #1e293b;
  z-index: 10;
}
```

```text
Scroll behaviour:

  Before threshold:           At threshold:           Parent exits view:
  ┌───────────────┐           ┌───────────────┐       ┌───────────────┐
  │ normal flow   │           │ [STUCK]       │       │               │
  │ Section Hdr   │  scroll → │ Section Hdr   │  →    │ [exits with   │
  │ content...    │           │ content...    │       │  parent]      │
  └───────────────┘           └───────────────┘       └───────────────┘
```

Sticky is the combination of `relative` and `fixed`: it occupies space in normal flow (like relative) and can pin to a scroll position (like fixed). Its "stuck" behaviour ends when the parent element scrolls past — it cannot stick beyond its parent.

## Requiring a Threshold

A sticky element **must have at least one offset property** (`top`, `bottom`, `left`, or `right`) or it never sticks.

```css
/* This never sticks — no threshold defined */
.stuck { position: sticky; }

/* This sticks 16px from the top when scrolled to that point */
.stuck { position: sticky; top: 16px; }
```

**SE lens:** `position: fixed` is standard for navigation bars, cookie banners, floating action buttons, and chatbot launchers — anything that must always be accessible regardless of scroll position. `position: sticky` is standard for table headers, section navigation, filter bars, and sticky sidebars — anything that should contextually pin as the user scrolls past.

**Common mistakes:**
- An ancestor with `overflow: hidden` or `overflow: auto` breaks `position: sticky` — sticky elements can only stick within their scroll container, and `overflow: hidden/auto` creates a new scroll container that blocks the sticking behaviour.
- Forgetting to set `top` (or another offset) on a sticky element — without it, the element never sticks, and there is no error or warning.
- Using `position: fixed` inside a transformed ancestor and wondering why it is not viewport-relative — the `transform` creates a new containing block and overrides the viewport anchor.

**Debug tip:** For sticky not working: in DevTools, select the sticky element and look at the Computed tab — if `position` shows as `static` instead of `sticky`, an ancestor with `overflow: hidden/auto/scroll` is blocking it. Walk the ancestor chain checking `overflow` values.

**Next:** Floats — the legacy positioning tool for text wrapping and the original multi-column layout technique, still found in millions of production stylesheets.

## Challenge: fixed and sticky

Apply fixed positioning to `#nav` and sticky positioning to `#section-head`.

1. Set `position` of `#nav` to `fixed`, `top` to `0`, `left` to `0`
2. Set `background-color` of `#nav` to `rgb(15, 23, 42)`
3. Set `position` of `#section-head` to `sticky`, `top` to `60px`
4. Set `background-color` of `#section-head` to `rgb(30, 41, 59)`

```html
<nav id="nav" style="width:100%;height:60px;padding:0 16px;"></nav>
<div style="height:400px;overflow-y:auto;">
  <h2 id="section-head" style="padding:8px;">Section Header</h2>
  <p>Content below...</p>
</div>
```

```challenge
/* Apply fixed and sticky positioning */

```

```test
var nav = document.querySelector('#nav')
var head = document.querySelector('#section-head')
var sN = getComputedStyle(nav)
var sH = getComputedStyle(head)
assert sN.position === 'fixed'
assert sN.top === '0px'
assert sN.backgroundColor === 'rgb(15, 23, 42)'
assert sH.position === 'sticky'
assert sH.top === '60px'
assert sH.backgroundColor === 'rgb(30, 41, 59)'
```
