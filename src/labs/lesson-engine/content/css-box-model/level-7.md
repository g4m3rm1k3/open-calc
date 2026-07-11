---
series: css-box-model
level: 7
title: Stacking Contexts & z-index
lang: css
---

# Stacking Contexts & z-index

When elements overlap on screen, the browser needs rules to decide which one appears on top. `z-index` controls the stacking order — but it only works within a **stacking context**, which is where most z-index bugs come from.

## z-index controls paint order

Higher z-index paints on top. But z-index only works on positioned elements. Change the z-index values on `#a`, `#b`, `#c` and watch the stack order change.

```html
<div id="stage">
  <div id="a">A — z-index: 1</div>
  <div id="b">B — z-index: 3 (on top)</div>
  <div id="c">C — z-index: 2</div>
</div>
```

```css
#stage { position: relative; height: 120px; background: #0f172a; }
#a { position: absolute; top: 10px; left: 10px; width: 160px; height: 80px; background: #3b82f6; color: white; z-index: 1; display: flex; align-items: center; justify-content: center; font-family: system-ui; border-radius: 6px; }
#b { position: absolute; top: 30px; left: 80px; width: 160px; height: 80px; background: #6366f1; color: white; z-index: 3; display: flex; align-items: center; justify-content: center; font-family: system-ui; border-radius: 6px; }
#c { position: absolute; top: 50px; left: 150px; width: 160px; height: 80px; background: #ec4899; color: white; z-index: 2; display: flex; align-items: center; justify-content: center; font-family: system-ui; border-radius: 6px; }
```

**CS lens:** Stacking contexts form a tree that mirrors the DOM hierarchy. A child's `z-index: 9999` means "9999 within my parent context." It cannot escape its parent context.

## The z-index 9999 trap — why it still loses

The classic bug. `#dropdown` is inside `#header` which has its own stacking context. The dropdown's z-index is compared within that context, not against `#modal`. Change `#header`'s `z-index` to `20` and watch the dropdown win.

```html
<div id="header">
  Header
  <div id="dropdown">Dropdown — z-index: 9999 but trapped inside header</div>
</div>
<div id="modal">Modal — z-index: 10 but wins because it's outside header's context</div>
```

```css
#header   { position: relative; z-index: 5; background: #1e293b; color: #e2e8f0; font-family: system-ui; padding: 12px; height: 40px; }
#dropdown { position: absolute; top: 40px; left: 8px; z-index: 9999; background: #334155; color: #e2e8f0; padding: 8px 16px; border-radius: 4px; font-size: 13px; width: 200px; }
#modal    { position: relative; z-index: 10; background: #6366f1; color: white; font-family: system-ui; padding: 16px; margin-top: 48px; border-radius: 8px; }
```

## What creates a stacking context

Many properties trigger a new stacking context. `opacity < 1` is the most surprising one — it silently traps all descendants. Remove `opacity: 0.99` from `#parent` to see `#child` rise above `#outside`.

```html
<div id="container">
  <div id="parent">
    Parent (opacity creates a stacking context)
    <div id="child">z-index: 100 — trapped by parent's stacking context</div>
  </div>
  <div id="outside">z-index: 50 — outside parent, in root context</div>
</div>
```

```css
#container { position: relative; height: 120px; background: #0f172a; padding: 8px; font-family: system-ui; }
#parent    { position: relative; z-index: 1; opacity: 0.99; /* remove this to free #child */ background: #1e293b; color: #e2e8f0; padding: 12px; width: 200px; font-size: 13px; }
#child     { position: relative; z-index: 100; background: #3b82f6; color: white; padding: 6px; margin-top: 4px; font-size: 12px; }
#outside   { position: absolute; top: 20px; left: 180px; z-index: 50; background: #ec4899; color: white; padding: 12px; border-radius: 6px; font-size: 13px; }
```

## isolation: isolate — scope without side effects

Creates a stacking context with no visual effect. Use it to contain a component's z-index values so they don't interact with the rest of the page.

```html
<div id="card-a">
  Card A (isolated — internal z-index stays inside)
  <div id="tooltip-a">Tooltip z-index: 100</div>
</div>
<div id="card-b">
  Card B — z-index: 2, beats card-a's context
</div>
```

```css
#card-a    { isolation: isolate; position: relative; background: #1e293b; color: #e2e8f0; padding: 20px; font-family: system-ui; margin-bottom: 4px; z-index: 1; }
#tooltip-a { position: absolute; top: 0; right: 0; background: #6366f1; color: white; padding: 4px 8px; font-size: 12px; z-index: 100; border-radius: 4px; }
#card-b    { position: relative; z-index: 2; background: #0f172a; color: #94a3b8; padding: 20px; font-family: system-ui; font-size: 13px; }
```

**SE lens:** The practical rule: always use the lowest z-index that solves the problem. High values (`9999`, `99999`) are a sign of fighting the stacking model. Audit stacking contexts first, then choose a minimal z-index.

**Common mistakes:**
- Setting `z-index` on a non-positioned element (`position: static`) — it has no effect. Position must be `relative`, `absolute`, `fixed`, or `sticky`.
- Setting `opacity < 1` on a parent and then wondering why the child's z-index can't beat a sibling — `opacity < 1` silently creates a stacking context.
- Using high z-index values across all components with no system — use a named scale: `--z-dropdown: 100; --z-modal: 200; --z-toast: 300`.

**Debug tip:** Chrome DevTools has a "3D View" in the Layers panel that visualises stacking contexts as literal 3D layers. Open DevTools → More Tools → Layers to see which elements create contexts and in what order.

**Next series:** CSS Layout — normal flow, positioning (relative/absolute/fixed/sticky), and how elements decide where to place themselves on the page.

## Challenge: stacking

Make `#tooltip` appear on top of `#card` using z-index.

1. Set `position` to `relative` on `#card` with `z-index: 1`
2. Set `position` to `absolute` on `#tooltip` with `z-index: 10`
3. Set `background-color` of `#tooltip` to `rgb(15, 23, 42)`

```html
<div id="card" style="width:200px;height:100px;background:#1e293b;">
  Card
  <div id="tooltip">Tooltip</div>
</div>
```

```challenge
/* Make tooltip appear on top */

```

```test
var card = document.querySelector('#card')
var tip = document.querySelector('#tooltip')
var sCard = getComputedStyle(card)
var sTip = getComputedStyle(tip)
assert sCard.position === 'relative'
assert parseInt(sCard.zIndex) >= 1
assert sTip.position === 'absolute'
assert parseInt(sTip.zIndex) > parseInt(sCard.zIndex)
assert sTip.backgroundColor === 'rgb(15, 23, 42)'
```
