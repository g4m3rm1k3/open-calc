---
series: css-box-model
level: 2
title: Margin & Margin Collapsing
lang: css
---

# Margin & Margin Collapsing

Margin controls the space **outside** an element's border. It is the most frequently misunderstood spacing tool in CSS — particularly because of a behaviour called margin collapsing that surprises almost every developer.

## Margin Syntax

Margin uses the same one-to-four value shorthand as padding:

```css
margin: 24px;               /* all four sides */
margin: 16px 32px;          /* top/bottom, left/right */
margin: 8px 16px 24px;      /* top, left/right, bottom */
margin: 8px 16px 24px 32px; /* top, right, bottom, left */

/* Individual sides */
margin-top: 24px;
margin-right: 0;
margin-bottom: 24px;
margin-left: auto;
```

```text
margin: auto  — on block elements with a fixed width, centres the element
              horizontally by distributing available space equally on both sides.
```

## Margin Collapsing

When two vertical margins meet, they **collapse** into a single margin equal to the larger of the two.

```css
.paragraph { margin-bottom: 24px; }
.next      { margin-top: 16px; }
```

```text
Expected gap between them: 24px + 16px = 40px
Actual gap:                max(24, 16)  = 24px
```

Margins collapse between siblings, between parent and first/last child, and on empty elements. They never collapse horizontally.

**CS lens:** Margin collapsing was designed for typographic documents: adjacent paragraphs should have one comfortable gap, not doubled spacing. The model makes sense in documents but surprises developers building UI components.

## When Margins Do NOT Collapse

Collapsing is blocked by several things:

```css
/* Flexbox and grid children never collapse */
.flex-container { display: flex; }

/* Elements with padding between parent and child */
.parent { padding-top: 1px; }

/* Elements with borders */
.parent { border-top: 1px solid transparent; }

/* Absolutely positioned elements */
.absolute { position: absolute; }

/* overflow other than visible */
.overflow { overflow: hidden; }
```

The most practical fix: when a parent's margin "leaks" through to contain its child's margin, add `overflow: hidden` or `padding: 1px` to the parent.

## Negative Margins

CSS allows negative margins. Negative margins pull elements toward each other:

```css
.card { margin-bottom: -1px; }  /* overlap the element below by 1px */
.overlap { margin-top: -32px; } /* pull this element 32px upward */
```

Negative margins are sometimes used to create overlapping card effects or to compensate for borders that would create double lines in a list.

**SE lens:** Margin is the right tool for **layout spacing** — the space between components. Padding is the right tool for **internal spacing** — the breathing room inside a component. A good rule of thumb: padding lives inside the component; margin lives in the context that uses the component.

**Common mistakes:**
- Expecting `margin-top` on a child to push the child away from its parent — if the parent has no border or padding, the child's margin collapses through and pushes the *parent* away from *its* parent instead.
- Using `margin: auto` on an inline element — `auto` only works for block elements with a defined width. Set `display: block` or `display: inline-block` first.
- Adding top+bottom margin and being surprised the gap is only the larger value — this is margin collapsing. Use `gap` in a flex or grid container to avoid collapsing entirely.

**Debug tip:** In DevTools, the box model diagram shows margin in orange. If a margin isn't creating the space you expect, look for collapsing: select the parent element and check whether its own top margin equals the child's collapsed margin leaking through.

**Next:** Border and outline — the visible edges of the box, and why focus rings use `outline` instead of `border`.

## Challenge: margins

Centre `#box` horizontally in its parent and apply spacing.

1. Set `width` to `200px` on `#box`
2. Set `margin-left` and `margin-right` to `auto` (centres it)
3. Set `margin-top` and `margin-bottom` to `40px`
4. Set `padding` to `16px`

```html
<div id="container" style="width:400px;background:#1e293b;">
  <div id="box">Centered</div>
</div>
```

```challenge
#box {
  /* Centre horizontally, add vertical margin and padding */
}
```

```test
var box = document.querySelector('#box')
var s = getComputedStyle(box)
assert s.width === '200px'
assert s.marginLeft === '100px'
assert s.marginRight === '100px'
assert s.marginTop === '40px'
assert s.paddingTop === '16px'
```
