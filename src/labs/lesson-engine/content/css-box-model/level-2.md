---
series: css-box-model
level: 2
title: Margin & Margin Collapsing
lang: css
---

# Margin & Margin Collapsing

Margin controls the space **outside** an element's border. It is the most frequently misunderstood spacing tool in CSS — particularly because of a behaviour called margin collapsing that surprises almost every developer.

## Margin vs padding — see the difference

Both add space, but in different places. Padding is inside the background. Margin is outside it and always transparent. Edit the values and watch each layer change.

```html
<div id="outer">
  <div id="card">Card with padding inside and margin outside</div>
</div>
```

```css
#outer { background: #0f172a; padding: 4px; }
#card  {
  background: #3b82f6;
  color: white;
  font-family: system-ui;
  padding: 24px;   /* space inside — blue background fills this */
  margin: 32px;    /* space outside — shows #outer's dark background */
  border: 3px solid #60a5fa;
}
```

The blue area (background) covers content + padding. Margin is the dark transparent gap around the card — always shows the parent background through it.

**CS lens:** Margin collapsing was designed for typographic documents: adjacent paragraphs should have one comfortable gap, not doubled spacing. The model makes sense in documents but surprises developers building UI components.

## Margin collapsing — two margins become one

When two vertical margins meet, they collapse into the larger of the two — not the sum. Change `margin-bottom` on `#a` and `margin-top` on `#b` and observe that the gap is always `max(a, b)`, never `a + b`.

```html
<div id="a">Paragraph A — margin-bottom: 40px</div>
<div id="b">Paragraph B — margin-top: 16px</div>
<p id="note">Gap between them is max(40, 16) = 40px — not 56px</p>
```

```css
#a    { background: #1e293b; color: #e2e8f0; padding: 12px; margin-bottom: 40px; font-family: system-ui; }
#b    { background: #1e293b; color: #e2e8f0; padding: 12px; margin-top: 16px; font-family: system-ui; }
#note { color: #94a3b8; font-size: 12px; font-family: system-ui; }
```

## Stopping collapse with flexbox or padding

Margins inside a flex container never collapse. Switch between `display: block` and `display: flex` on `#container` to see the gap change.

```html
<div id="container">
  <div class="item">Item with margin-bottom: 32px</div>
  <div class="item">Item with margin-top: 32px</div>
</div>
<p id="note">In block: gap = 32px (collapsed). In flex: gap = 64px (not collapsed).</p>
```

```css
#container { display: flex; flex-direction: column; background: #0f172a; padding: 4px; }
.item      { background: #1e293b; color: #e2e8f0; padding: 12px; margin-bottom: 32px; margin-top: 32px; font-family: system-ui; }
#note      { color: #94a3b8; font-size: 12px; font-family: system-ui; }
```

## margin: auto — centre a block element

`margin: auto` on left and right distributes the remaining space equally on both sides, centering the element. Width must be set for this to work.

```html
<div id="container">
  <div id="centered">I am centered with margin: auto</div>
</div>
```

```css
#container { background: #0f172a; padding: 16px; }
#centered  { width: 240px; margin: 0 auto; background: #6366f1; color: white; padding: 16px; font-family: system-ui; text-align: center; }
```

**SE lens:** Margin is the right tool for layout spacing — the space between components. Padding is the right tool for internal spacing — the breathing room inside a component. Padding lives inside the component; margin lives in the context that uses the component.

**Common mistakes:**
- Expecting `margin-top` on a child to push the child away from its parent — if the parent has no border or padding, the child's margin collapses through and pushes the *parent* away from *its* parent instead.
- Using `margin: auto` on an inline element — `auto` only works for block elements with a defined width.
- Adding top+bottom margin and being surprised the gap is only the larger value — use `gap` in a flex/grid container to avoid collapsing entirely.

**Debug tip:** In DevTools, the box model diagram shows margin in orange. If a margin isn't creating the space you expect, look for collapsing: select the parent element and check whether its own top margin equals the child's collapsed margin leaking through.

**Next:** Border and outline — the visible edges of the box, and why focus rings use `outline` instead of `border`.

## Challenge: margins

Centre `#box` horizontally in its parent and apply spacing.

1. Set `width` to `200px` on `#box`
2. Set `margin-left` and `margin-right` to `auto`
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
