---
series: css-layout
level: 4
title: "position: fixed and sticky"
lang: css
---

# position: fixed and sticky

`position: fixed` and `position: sticky` extend the positioning system into scroll behaviour. Fixed elements stay anchored to the viewport regardless of scrolling. Sticky elements behave like normal flow elements until a scroll threshold is crossed, then "stick" to a specified edge until their parent scrolls out of view.

## position: fixed — stays put during scroll

A fixed element is removed from normal flow and positioned relative to the **viewport** — the visible browser window. It does not scroll with the page. Run this and scroll the content area to see `#nav` stay at the top.

```html
<div style="position:relative;height:300px;overflow-y:auto;border:1px solid #334155;">
  <nav id="nav">Fixed Nav</nav>
  <div style="height:600px;padding:80px 16px 16px;color:#e2e8f0;font-family:system-ui;">
    <p>Scroll me — the nav stays fixed at the top of the viewport.</p>
    <p style="margin-top:200px;">Still scrolling...</p>
    <p style="margin-top:200px;">And the nav is still there.</p>
  </div>
</div>
```

```css
#nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-family: system-ui;
  font-weight: 600;
  z-index: 100;
}
```

The containing block for `position: fixed` is always the **viewport** — never an ancestor element, even if the ancestor has `position: relative`. One exception: if any ancestor has `transform`, `filter`, or `perspective` applied, the fixed element anchors to that ancestor instead.

**CS lens:** Fixed positioning is a paint-only operation after layout. The element is laid out in a zero-size slot (it is out of flow), then the rendering engine paints it at the viewport-relative position on every frame independently of the scroll offset.

## position: sticky — scroll-triggered pin

A sticky element flows normally **until it reaches a defined scroll position**, then it "sticks" at that position until its parent scrolls out of view. It must have at least one offset property (`top`, `bottom`, `left`, or `right`) or it never sticks.

```html
<div style="height:300px;overflow-y:auto;border:1px solid #334155;font-family:system-ui;">
  <div style="padding:8px;color:#94a3b8;">Scroll down inside this box</div>
  <h3 id="section-head">Section Header — I am sticky</h3>
  <div style="height:400px;padding:8px 16px;color:#e2e8f0;">
    <p>Content below the sticky header.</p>
    <p style="margin-top:150px;">Keep scrolling...</p>
    <p style="margin-top:150px;">The header follows until the parent exits the viewport.</p>
  </div>
</div>
```

```css
#section-head {
  position: sticky;
  top: 0;
  margin: 0;
  padding: 10px 16px;
  background: #1e293b;
  color: #e2e8f0;
}
```

Sticky is the combination of `relative` and `fixed`: it occupies space in normal flow (like relative) and can pin to a scroll position (like fixed). Its "stuck" behaviour ends when the parent element scrolls out of view.

**SE lens:** `position: fixed` is standard for navigation bars, cookie banners, and floating action buttons. `position: sticky` is standard for table headers, section navigation, filter bars, and sticky sidebars — anything that should contextually pin as the user scrolls past.

**Common mistakes:**
- An ancestor with `overflow: hidden` or `overflow: auto` breaks `position: sticky` — sticky elements can only stick within their scroll container, and `overflow: hidden/auto` creates a new scroll container that blocks the sticking behaviour.
- Forgetting to set `top` (or another offset) on a sticky element — without it, the element never sticks, with no error or warning.
- Using `position: fixed` inside a transformed ancestor and wondering why it is not viewport-relative — `transform` creates a new containing block and overrides the viewport anchor.

**Debug tip:** For sticky not working: in DevTools, select the sticky element and look at the Computed tab — if `position` shows as `static` instead of `sticky`, an ancestor with `overflow: hidden/auto/scroll` is blocking it. Walk the ancestor chain checking `overflow` values.

**Next:** Floats — the legacy positioning tool for text wrapping and the original multi-column layout technique, still found in millions of production stylesheets.

## Challenge: fixed and sticky

Apply fixed positioning to `#nav` and sticky positioning to `#section-head`.

1. Set `position` of `#nav` to `fixed`, `top` to `0`, and `background-color` to `rgb(15, 23, 42)`
2. Set `position` of `#section-head` to `sticky`, `top` to `60px`
3. Set `background-color` of `#section-head` to `rgb(30, 41, 59)`

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
