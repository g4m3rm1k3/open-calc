---
series: css-box-model
level: 7
title: Stacking Contexts & z-index
lang: css
---

# Stacking Contexts & z-index

When elements overlap on screen, the browser needs rules to decide which one appears on top. `z-index` controls the stacking order — but it only works within a **stacking context**, which is where most z-index bugs come from.

## z-index Basics

```css
.modal   { z-index: 1000; }
.overlay { z-index: 999; }
.content { z-index: 1; }
```

```text
Higher z-index → closer to the viewer (painted on top)
z-index only works on POSITIONED elements (position: relative/absolute/fixed/sticky)
z-index has NO EFFECT on position: static (the default)
```

```css
/* This does nothing — element is not positioned */
div { z-index: 999; }

/* This works */
div { position: relative; z-index: 999; }
```

## Stacking Contexts

A stacking context is an isolated group of elements that stack relative to each other. A child's `z-index` only competes within its own stacking context — never against elements in a parent or sibling context.

```text
Stacking context is created by:
• position: relative/absolute/fixed/sticky + z-index (other than auto)
• opacity < 1
• transform, filter, perspective
• isolation: isolate
• will-change: transform (or other composited properties)
```

```css
.parent {
  position: relative;
  z-index: 10;  /* creates a stacking context */
}

.child {
  position: relative;
  z-index: 9999;  /* only stacks within .parent — cannot exceed .parent's z-index */
}

.sibling {
  position: relative;
  z-index: 11;  /* beats .parent AND everything in it, regardless of child z-index */
}
```

**CS lens:** Stacking contexts form a tree that mirrors the DOM hierarchy. A child's `z-index: 9999` means "9999 within my parent context." It cannot escape its parent context. This is why a tooltip inside a transformed parent can appear beneath an unrelated modal.

## The z-index Bug Pattern

The classic bug: "I set `z-index: 9999` and my dropdown still appears under the header."

```css
/* header accidentally creates a stacking context */
header {
  position: relative;
  z-index: 2;     /* ← creates a context with z-index 2 */
  transform: translateZ(0); /* also creates a context */
}

/* dropdown is in a different section */
.dropdown {
  position: absolute;
  z-index: 9999;  /* ← 9999 within its own context, not compared to header */
}
```

```text
Fix options:
1. Remove the stacking context from the ancestor
2. Move the dropdown outside the ancestor (e.g., to document root — React portals)
3. Give the ancestor a higher z-index than the competing element
```

## isolation: isolate

`isolation: isolate` creates a stacking context without any other visual effect — useful when you want to contain the z-index of children without changing appearance:

```css
.card {
  isolation: isolate; /* children z-index stays inside the card */
}
```

**SE lens:** The practical rule: always work with the lowest z-index that solves the problem. High z-index values (`9999`, `99999`) are a sign of fighting the stacking model rather than understanding it. Audit stacking contexts first, then choose the minimal z-index.

**Common mistakes:**
- Setting `z-index` on a non-positioned element (`position: static`) and expecting it to work — it has no effect. Position must be `relative`, `absolute`, `fixed`, or `sticky`.
- Setting `opacity < 1` on a parent and then wondering why the child's z-index can't beat a sibling — `opacity < 1` creates a stacking context that contains the child's z-index.
- Using high z-index values across many components without a system — when every component uses `z-index: 9999`, nothing works. Use a named z-index scale: `z-dropdown: 100`, `z-modal: 200`, `z-toast: 300`.

**Debug tip:** Chrome DevTools has a "3D View" in the Layers panel that visualises stacking contexts as literal layers in 3D space. Open DevTools → More Tools → Layers to see which elements create contexts and in what order. It instantly reveals z-index conflicts.

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
