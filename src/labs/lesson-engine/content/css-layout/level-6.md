---
series: css-layout
level: 6
title: The Containing Block
lang: css
---

# The Containing Block

Every CSS element has a **containing block** — the reference rectangle used to compute its position, size, and percentage values. Understanding the rules eliminates the "why is it there?" confusion for all positioning scenarios.

## Normal flow: parent content box

For elements in normal flow (`position: static` or `position: relative`), the containing block is the **content box of the nearest block ancestor**. Percentages resolve against this. Change `#child` width to `50%` and see it take half of `#parent`'s content width.

```html
<div id="parent">
  <div id="child">50% of parent content width</div>
</div>
<p style="color:#94a3b8;font-size:13px;font-family:system-ui;">Parent is 400px wide. Child at 50% = 200px.</p>
```

```css
#parent { width: 400px; padding: 20px; background: #1e293b; }
#child  { width: 50%; background: #6366f1; color: white; padding: 8px; font-family: system-ui; }
```

Note: padding is **not** part of the containing block for normal-flow children. `width: 50%` is 50% of the content width (400px), not the padding box.

**CS lens:** The containing block is a computed value, not a DOM property. During layout, the browser walks the ancestor chain applying the rules and records the result. Percentages for `width`, `height`, `top`, `left`, `margin`, `padding` are all resolved against this stored rectangle.

## Absolute: padding box of nearest positioned ancestor

For `position: absolute`, the containing block is the **padding box** of the nearest ancestor where `position ≠ static`. This means `top: 0; left: 0` aligns with the top-left of the parent's **padding area**, not the content area. Remove `position: relative` from `#box` and watch `#inner` jump to the page corner.

```html
<div id="outer" style="padding:40px;background:#0f172a;">
  <div id="box">
    <div id="inner">top: 0, left: 0</div>
  </div>
</div>
```

```css
#box   { position: relative; width: 300px; height: 160px; padding: 24px; background: #1e293b; color: #e2e8f0; font-family: system-ui; }
#inner { position: absolute; top: 0; left: 0; background: #6366f1; color: white; padding: 4px 8px; font-size: 12px; }
```

## Rules by position value

Each `position` value has a different containing block rule:

```html
<div id="rules" style="font-family:system-ui;font-size:13px;color:#e2e8f0;background:#1e293b;padding:16px;border-radius:8px;line-height:1.8;">
  <strong style="color:#818cf8;">static / relative</strong> → content box of nearest block ancestor<br>
  <strong style="color:#818cf8;">absolute</strong> → padding box of nearest ancestor where position ≠ static<br>
  <strong style="color:#818cf8;">fixed</strong> → viewport (except when ancestor has transform/filter/perspective)<br>
  <strong style="color:#818cf8;">sticky</strong> → scroll container (for the stuck-position reference)
</div>
```

```css
/* No edits needed — this step shows the rule table */
```

## transform breaks fixed positioning

A transformed ancestor becomes the containing block for `position: fixed` descendants — the fixed element anchors to the transformed element instead of the viewport. Try adding `transform: translateX(0)` to `#wrapper` and see `#modal` shift.

```html
<div id="wrapper">
  <p style="color:#e2e8f0;font-family:system-ui;padding:8px;">Wrapper (try adding transform)</p>
  <div id="modal">Fixed — but to what?</div>
</div>
```

```css
#wrapper { background: #1e293b; padding: 40px; height: 120px; position: relative; /* transform: translateX(0); */ }
#modal   { position: fixed; top: 16px; right: 16px; background: #6366f1; color: white; padding: 8px 16px; border-radius: 6px; font-family: system-ui; }
```

**SE lens:** Containing block rules explain why `position: absolute; inset: 0` fills the positioned parent but not the viewport. They explain why `width: 100%` on an absolute element gives the parent's padding-box width. They explain why a fixed modal inside an animated container breaks.

**Common mistakes:**
- Assuming `top: 0; left: 0` on an absolute element aligns with the content area — it aligns with the padding edge.
- Using `height: 50%` on a child in a parent with `height: auto` — the containing block has no resolved height, so 50% computes to `auto`. The parent needs an explicit height first.
- Applying `transform` to a wrapper and being surprised that fixed children stop being viewport-relative.

**Debug tip:** In Chrome DevTools, select a positioned element and open the Layout panel — it draws a purple dashed border around the containing block. This is the fastest way to verify which ancestor is the actual reference.

**Next:** Stacking contexts and z-index — the rules that determine which element paints on top when elements overlap.

## Challenge: containing block

Demonstrate the absolute-vs-relative containing block distinction. `#inner` must be positioned relative to `#box`, not the viewport.

1. Set `position` of `#box` to `relative`
2. Set `position` of `#inner` to `absolute`, `bottom` to `0`, `right` to `0`
3. Set `background-color` of `#box` to `rgb(30, 41, 59)`
4. Set `background-color` of `#inner` to `rgb(99, 102, 241)`
5. Set `width` of `#inner` to `50%`

```html
<div id="box" style="width:300px;height:200px;padding:16px;">
  <div id="inner" style="height:60px;color:white;padding:8px;">Inner</div>
</div>
```

```challenge
/* Make #inner position relative to #box */

```

```test
var box = document.querySelector('#box')
var inner = document.querySelector('#inner')
var sBox = getComputedStyle(box)
var sIn = getComputedStyle(inner)
assert sBox.position === 'relative'
assert sIn.position === 'absolute'
assert sIn.bottom === '0px'
assert sIn.right === '0px'
assert sBox.backgroundColor === 'rgb(30, 41, 59)'
assert sIn.backgroundColor === 'rgb(99, 102, 241)'
```
