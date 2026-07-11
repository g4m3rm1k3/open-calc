---
series: css-layout
level: 7
title: Stacking Contexts and z-index
lang: css
---

# Stacking Contexts and z-index

When elements overlap, the browser needs rules for which element is painted on top. `z-index` controls paint order, but only within a **stacking context** — an isolated layer in the paint tree. Understanding stacking contexts explains every case where `z-index: 9999` still appears behind another element.

## z-index controls paint order

`z-index` applies to positioned elements and controls their paint order within a stacking context. Higher values paint on top. Run this and change the `z-index` values to see which element wins.

```html
<div id="container">
  <div id="a">A — z-index: 1</div>
  <div id="b">B — z-index: 2</div>
  <div id="c">C — z-index: 3</div>
</div>
```

```css
#container { position: relative; height: 120px; }
#a { position: absolute; top: 10px;  left: 10px;  width: 160px; height: 80px; background: #3b82f6; color: white; z-index: 1; display: flex; align-items: center; justify-content: center; font-family: system-ui; border-radius: 6px; }
#b { position: absolute; top: 30px;  left: 60px;  width: 160px; height: 80px; background: #6366f1; color: white; z-index: 2; display: flex; align-items: center; justify-content: center; font-family: system-ui; border-radius: 6px; }
#c { position: absolute; top: 50px;  left: 110px; width: 160px; height: 80px; background: #ec4899; color: white; z-index: 3; display: flex; align-items: center; justify-content: center; font-family: system-ui; border-radius: 6px; }
```

Without positioning, elements in the same stacking context are painted in document order — later elements on top. Positioned elements (any value other than `static`) are painted above non-positioned elements even without an explicit `z-index`.

**CS lens:** The browser builds a stacking context tree before painting. Each stacking context is flattened and composited onto its parent as a single bitmap. `z-index` comparisons only happen within the same stacking context.

## What creates a stacking context

Many CSS properties create a new stacking context. Once created, the z-index of children inside is scoped to that context — children can never appear above elements in a higher context regardless of their z-index value.

```html
<div id="page" style="font-family:system-ui;position:relative;">
  <div id="low-parent">
    <div id="high-child">z-index: 9999 inside low-parent</div>
  </div>
  <div id="high-other">z-index: 10 — but wins because parent context is higher</div>
</div>
```

```css
#low-parent  { position: relative; z-index: 1;    background: #1e293b; padding: 16px; width: 280px; color: #e2e8f0; }
#high-child  { position: relative; z-index: 9999; background: #3b82f6; color: white; padding: 8px; margin-top: 8px; }
#high-other  { position: relative; z-index: 10;   background: #ec4899; color: white; padding: 24px; width: 240px; margin-top: -20px; margin-left: 20px; }
```

Other properties that create a stacking context: `opacity < 1`, `transform`, `filter`, `will-change: transform`, `isolation: isolate`.

## isolation: isolate — scope without side effects

`isolation: isolate` creates a stacking context with no visual side effects — no transform, no opacity change. Use it to scope z-index values to a component so they don't interact with the rest of the page.

```html
<div id="component">
  <div id="tooltip">I am z-index: 100 but scoped to #component</div>
  <div id="content">Component content</div>
</div>
<div id="outside">Outside element at z-index: 50 — isolation means the tooltip can't bleed above me if I were in a higher stacking context</div>
```

```css
#component { isolation: isolate; background: #1e293b; padding: 16px; color: #e2e8f0; font-family: system-ui; position: relative; margin-bottom: 8px; }
#tooltip   { position: absolute; top: -10px; right: 8px; background: #6366f1; color: white; padding: 4px 8px; font-size: 12px; z-index: 100; border-radius: 4px; }
#content   { padding-top: 8px; }
#outside   { background: #0f172a; color: #94a3b8; padding: 12px; font-family: system-ui; font-size: 13px; }
```

**SE lens:** Stacking context bugs are among the most confusing in CSS. The symptom is always: "Why is my `z-index: 9999` element appearing below that other element?" The diagnosis is always: find the stacking context ancestor of both elements and compare *those* z-index values. Fix the context, not the value.

**Common mistakes:**
- Setting `z-index` on a non-positioned element and expecting it to work — `z-index` is ignored on `position: static` elements. Add `position: relative`.
- Applying `opacity`, `transform`, or `filter` to a container without realising it creates a stacking context that caps the z-index of all children.
- Trying to solve z-index problems by increasing the value — if two elements are in different stacking contexts, the child's z-index is irrelevant.

**Debug tip:** Open DevTools → Layers panel (or in Elements panel, look for the "Stacking context" indicator). Select the element that isn't appearing correctly and find its stacking context root. Then compare that z-index to the competing element's stacking context root.

**Next:** CSS Flexbox — now that you understand the layout foundation (normal flow, BFCs, positioning, stacking), flexbox builds a clean one-dimensional layout system on top of it.

## Challenge: stacking context

Control paint order using `z-index` and `isolation`.

1. Set `position` of `#a` to `relative`, `z-index` to `1`, `background-color` to `rgb(59, 130, 246)`
2. Set `position` of `#b` to `relative`, `z-index` to `2`, `background-color` to `rgb(239, 68, 68)`
3. Set `isolation` of `#wrapper` to `isolate`
4. Set `background-color` of `#wrapper` to `rgb(15, 23, 42)`

```html
<div id="wrapper" style="padding:16px;">
  <div id="a" style="width:100px;height:60px;margin-bottom:-20px;">A</div>
  <div id="b" style="width:100px;height:60px;margin-left:40px;">B</div>
</div>
```

```challenge
/* Control stacking order */

```

```test
var a = document.querySelector('#a')
var b = document.querySelector('#b')
var wrapper = document.querySelector('#wrapper')
var sA = getComputedStyle(a)
var sB = getComputedStyle(b)
var sW = getComputedStyle(wrapper)
assert sA.position === 'relative'
assert parseInt(sA.zIndex) === 1
assert sA.backgroundColor === 'rgb(59, 130, 246)'
assert sB.backgroundColor === 'rgb(239, 68, 68)'
assert sW.isolation === 'isolate'
assert sW.backgroundColor === 'rgb(15, 23, 42)'
```
