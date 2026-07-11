---
series: css-layout
level: 1
title: Block Formatting Contexts
lang: css
---

# Block Formatting Contexts

A **block formatting context** (BFC) is an isolated layout region inside which the browser applies its own block-flow rules independently from the surrounding document. Once you understand what creates a BFC and what it changes, three previously mysterious CSS behaviours — float containment, margin collapse prevention, and float overlap avoidance — all become predictable.

## The float containment problem

In normal flow, floated children escape their parent — the parent collapses as if the float is not there. Run this and see the parent shrink to zero height even though it has a floated child inside it.

```html
<p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">Without BFC — parent collapses:</p>
<div id="parent">
  <div id="floated">Float</div>
</div>
<div style="background:#ef4444;color:white;padding:8px;">I appear right after the collapsed parent</div>
```

```css
#parent  { background: #1e293b; padding: 8px; }
#floated { float: left; width: 100px; height: 80px; background: #3b82f6; color: white; padding: 8px; }
```

Now add `display: flow-root` to `#parent` and watch the parent grow to contain the float. `flow-root` creates a BFC with no visual side effects.

**CS lens:** A BFC is a sub-tree in the layout tree that resolves its own coordinate system. Its children's positions are computed independently. No external element participates in the BFC's layout, and no internal element participates in the external layout.

## What creates a BFC

Several CSS property values create a BFC on the element they are applied to. Edit the CSS below and try switching between them.

```html
<div id="container">
  <div id="float-child">Float</div>
  <p>Text that wraps next to the float inside the BFC.</p>
</div>
```

```css
#container  { display: flow-root; background: #1e293b; padding: 8px; color: #e2e8f0; }
#float-child { float: left; width: 100px; height: 60px; background: #6366f1; margin-right: 12px; }
```

All of these also create a BFC: `overflow: hidden`, `overflow: auto`, `display: flex`, `display: grid`, `position: absolute`, `float: left`. `display: flow-root` is the modern choice — no clipping, no layout side effects.

## Margin collapse prevention

Margins collapse between a parent and its first child when there is no barrier between them. A BFC on the parent prevents this. Try removing `display: flow-root` from `#outer` and watch the child's top margin punch through the parent.

```html
<div id="outer">
  <div id="inner">Child with margin-top: 24px</div>
</div>
<p style="color:#94a3b8;font-size:13px;">Without flow-root on #outer, the child margin collapses into the parent margin.</p>
```

```css
#outer { display: flow-root; background: #1e293b; padding: 0 12px; color: #e2e8f0; }
#inner { margin-top: 24px; background: #6366f1; padding: 12px; color: white; }
```

**SE lens:** The BFC is why `overflow: hidden` was the old clearfix technique — it had the desired side effect of creating a BFC. `display: flow-root` was added in 2017 precisely to give developers a way to create a BFC with no other visual consequence. Always prefer `flow-root` over `overflow: hidden` when float containment or margin isolation is the goal.

**Common mistakes:**
- Using `overflow: hidden` to contain floats and then being surprised that content is clipped — use `display: flow-root` instead.
- Thinking a `<div>` always creates a BFC — it does not. A plain `<div>` is a block box in normal flow. A BFC is created by specific CSS property values, not by element type.
- Confusing "the element is a BFC" with "the element is inside a BFC" — every element is inside some BFC (the root BFC at minimum), but not every element creates its own.

**Debug tip:** There is no direct DevTools indicator for BFC. To diagnose float containment problems, inspect the parent element — if its height is `0` despite having floated children, it is not a BFC. Add `display: flow-root` and watch the height update in the Computed tab.

**Next:** `position: relative` — displacing an element from its normal flow position while keeping its space reserved in the layout.

## Challenge: bfc

Create a BFC on `#parent` to contain its floated child.

1. Set `display` of `#parent` to `flow-root` (creates a BFC)
2. Set `float` of `#floated` to `left`
3. Set `width` of `#floated` to `100px` and `height` to `80px`
4. Set `background-color` of `#parent` to `rgb(30, 41, 59)`

With `flow-root`, `#parent` must grow tall enough to contain `#floated`.

```html
<div id="parent">
  <div id="floated">Float</div>
  <div id="child" style="margin-top:20px;">Child</div>
</div>
```

```challenge
/* Create a BFC to contain the float */

```

```test
var parent = document.querySelector('#parent')
var floated = document.querySelector('#floated')
var sP = getComputedStyle(parent)
var sF = getComputedStyle(floated)
assert sP.display === 'flow-root'
assert sP.backgroundColor === 'rgb(30, 41, 59)'
assert sF.float === 'left'
assert sF.width === '100px'
assert parseFloat(sP.height) >= 80
```
