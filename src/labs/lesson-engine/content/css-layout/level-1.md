---
series: css-layout
level: 1
title: Block Formatting Contexts
lang: css
---

# Block Formatting Contexts

A **block formatting context** (BFC) is an isolated layout region inside which the browser applies its own set of block-flow rules independently from the surrounding document. Once you understand what creates a BFC and what it changes, three previously mysterious CSS behaviours — float containment, margin collapse prevention, and overlap avoidance — all become predictable.

## What a BFC Is

In normal flow, block boxes interact with each other freely: margins collapse between siblings, floated children escape their parents, and adjacent elements can overlap floats. A BFC creates a boundary that stops all of these cross-element interactions.

```css
.container {
  overflow: hidden; /* creates a BFC */
}
```

```text
Without BFC:
  ┌──────────────────────────┐  ← parent
  │  [float left]             │
  └──────────────────────────┘
     text overflows out       ← float not contained

With BFC (overflow: hidden):
  ┌──────────────────────────┐  ← parent (BFC)
  │  [float left]  text here │
  │  parent grows to contain │
  └──────────────────────────┘
```

**CS lens:** A BFC is a sub-tree in the layout tree that resolves its own coordinate system. Its children's positions are computed independently, and the BFC's bounding box is determined after all children are placed. No external element participates in the BFC's layout, and no internal element participates in the external layout.

## What Creates a BFC

Several CSS properties create a BFC on the element they are applied to:

```css
/* All of these create a BFC */
.bfc-1 { overflow: hidden; }
.bfc-2 { overflow: auto; }
.bfc-3 { display: flow-root; }   /* cleanest — no side effects */
.bfc-4 { display: flex; }        /* flex containers create a BFC */
.bfc-5 { display: grid; }        /* grid containers create a BFC */
.bfc-6 { position: absolute; }   /* positioned elements create a BFC */
.bfc-7 { float: left; }          /* floats create a BFC */
```

```text
display: flow-root is the modern, purpose-built BFC trigger.
It has no visual side effects (unlike overflow: hidden which clips).
Use flow-root when you want a BFC and nothing else.
```

## BFC Behaviour 1 — Float Containment

A parent element does not grow to contain floated children unless it establishes a BFC. This is the "clearfix" problem every CSS developer hits.

```css
.parent { /* no BFC — height collapses to 0 even with floated children */ }
.parent { overflow: hidden; } /* BFC — height grows to contain the float */
.parent { display: flow-root; } /* BFC — same effect, cleaner approach */
```

## BFC Behaviour 2 — Margin Collapse Prevention

Margins collapse between a parent and its first/last child when there is no barrier between them. A BFC on the parent prevents this.

```css
.parent { padding: 1px; } /* prevents collapse — adds a barrier */
.parent { display: flow-root; } /* prevents collapse — BFC */
.parent { overflow: hidden; }   /* prevents collapse — BFC */
```

## BFC Behaviour 3 — No Overlap with Floats

A block that establishes a BFC will not overlap a sibling float — it shrinks and shifts aside.

```css
.float { float: left; width: 120px; }
.sibling { display: flow-root; } /* stays beside the float, does not overlap */
```

**SE lens:** The BFC is why `overflow: hidden` was the old clearfix technique — it had the desired side effect of creating a BFC. `display: flow-root` was added in 2017 precisely to give developers a way to create a BFC with no other visual consequence. Always prefer `flow-root` over `overflow: hidden` when float containment or margin isolation is the goal.

**Common mistakes:**
- Using `overflow: hidden` to contain floats and then being surprised that content is clipped — `overflow: hidden` creates a BFC but also hides any overflow. Use `display: flow-root` instead.
- Thinking a `<div>` always creates a BFC — it does not. A plain `<div>` is a block box in normal flow. A BFC is created by specific CSS property values, not by element type.
- Confusing "the element is a BFC" with "the element is inside a BFC" — every element is inside some BFC (the root BFC at minimum), but not every element creates its own.

**Debug tip:** There is no direct DevTools indicator for BFC. To diagnose float containment problems, inspect the parent element in DevTools — if its height is `0` despite having floated children, it is not a BFC. Add `display: flow-root` and watch the height update in the Computed tab.

**Next:** `position: relative` — displacing an element from its normal flow position while keeping its space reserved in the layout.

## Challenge: bfc

Create a BFC on `#parent` to contain its floated child, and prevent margin collapse between `#parent` and `#child`.

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
