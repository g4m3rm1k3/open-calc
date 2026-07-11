---
series: css-layout
level: 7
title: Stacking Contexts and z-index
lang: css
---

# Stacking Contexts and z-index

When elements overlap, the browser needs rules for which element is painted on top. `z-index` controls paint order, but only within a **stacking context** — an isolated layer in the paint tree. Understanding stacking contexts explains every case where `z-index: 9999` still appears behind another element.

## Paint Order Without z-index

Without any positioning, the browser paints elements in document order — elements later in the HTML are painted on top of earlier ones.

```text
Document order:
  1. Background / borders
  2. Block elements (non-positioned)
  3. Float elements
  4. Inline elements (text, images)
  5. Positioned elements (z-index: auto)
  6. Positioned elements (positive z-index, ascending)
```

Positioned elements (`position: relative/absolute/fixed/sticky`) are painted above non-positioned elements, even without a `z-index` value.

## z-index and Stacking Order

`z-index` applies to positioned elements (and flex/grid items) and controls their paint order within a **stacking context**:

```css
.below { position: relative; z-index: 1; }
.above { position: relative; z-index: 2; } /* painted on top */
.modal { position: fixed;    z-index: 100; }
```

```text
Paint order (bottom to top):
  ──────────────────  non-positioned elements
  ──────────────────  z-index: 1  (.below)
  ──────────────────  z-index: 2  (.above)
  ──────────────────  z-index: 100 (.modal)
```

Negative `z-index` values place elements below their stacking context (even below the background of their parent).

**CS lens:** The browser builds a stacking context tree before painting. Each stacking context is flattened and composited onto its parent as a single bitmap. `z-index` comparisons only happen within the same stacking context — a child in a low-z-index stacking context can never appear above an element in a higher stacking context, regardless of the child's own `z-index` value.

## What Creates a Stacking Context

Many CSS properties create a new stacking context:

```css
/* All of these create a new stacking context */
.sc-1 { position: relative; z-index: 1; }     /* z-index ≠ auto on positioned elem */
.sc-2 { position: fixed; }                     /* fixed/sticky always create one */
.sc-3 { opacity: 0.99; }                       /* opacity < 1 */
.sc-4 { transform: translateX(0); }            /* any transform */
.sc-5 { filter: blur(0); }                     /* any filter */
.sc-6 { will-change: transform; }              /* will-change for compositing props */
.sc-7 { isolation: isolate; }                  /* explicit isolation */
```

```text
Stacking context tree:
  Root stacking context
  ├── .wrapper (z-index: 1, creates SC)
  │   ├── .child (z-index: 9999)   ← CANNOT be above .modal below
  │   └── .other (z-index: 1)
  └── .modal (z-index: 10)         ← entire .wrapper SC paints below .modal
```

This is why `z-index: 9999` inside a low-z-index parent still appears behind other elements — the parent's stacking context is compared, not the child's.

## isolation: isolate

`isolation: isolate` creates a stacking context without any visible side effects — no transform, no opacity change, just a new paint boundary:

```css
.component {
  isolation: isolate; /* children's z-index is now scoped to this component */
}
```

This is the clean way to scope z-index values to a component so they don't interact with the rest of the page.

**SE lens:** Stacking context bugs are among the most confusing in CSS. The symptoms are always the same: "Why is my `z-index: 9999` element appearing below that other element?" The diagnosis is always the same: find the stacking context ancestor of both elements and compare *those* z-index values. Tools like `stacking-context-helper` browser extensions or the DevTools Layer panel visualise the stacking context tree directly.

**Common mistakes:**
- Setting `z-index` on a non-positioned element and expecting it to work — `z-index` is ignored on `position: static` elements. Add `position: relative` to make it apply.
- Applying `opacity`, `transform`, or `filter` to a container and not realising it creates a stacking context that caps the z-index of all children.
- Trying to solve z-index problems by increasing the value — if two elements are in different stacking contexts, the child's z-index is irrelevant. Fix the context, not the value.

**Debug tip:** Open DevTools → Layers panel (or in the Elements panel, look for the "Stacking context" indicator). Select the element that isn't appearing correctly and find its stacking context root. Then find the competing element's stacking context root and compare their z-index values — that comparison is what actually determines paint order.

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
