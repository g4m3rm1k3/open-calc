---
series: css-flexbox
level: 0
title: The Flex Container
lang: css
---

# The Flex Container

Flexbox is a one-dimensional layout system — it arranges items along a single **main axis** (row or column). Before flexbox, getting elements to sit side-by-side required floats or inline-blocks, both of which had significant quirks. `display: flex` turns a container into a flexbox, and its direct children become **flex items**.

## display: flex — the switch

Adding `display: flex` to a container is all you need to start. Immediately, children line up horizontally in a row, sized to fit their content, instead of stacking vertically as blocks. Edit the CSS to see what the children look like without `display: flex`.

```html
<div class="without">
  <div class="item">Alpha</div>
  <div class="item">Beta</div>
  <div class="item">Gamma</div>
</div>
<div class="with">
  <div class="item">Alpha</div>
  <div class="item">Beta</div>
  <div class="item">Gamma</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.item { background: #3b82f6; color: white; padding: 12px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; }
.without { background: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 12px; }
.without .item { margin-bottom: 8px; }
.with    { background: #1e293b; padding: 16px; border-radius: 8px; display: flex; gap: 8px; }
```

Before: each item is a block — they stack vertically. After: all three items sit on a row, side by side.

**CS lens:** `display: flex` creates a **block-level flex container**. The container itself is a block (takes full width, starts on a new line). Its children exit normal block flow and become flex items governed by the flex formatting context instead.

## flex-direction — choosing the axis

`flex-direction` controls which direction is the **main axis** — the axis items are laid out along. `row` (default) puts items left-to-right. `column` stacks them top-to-bottom. `row-reverse` and `column-reverse` flip the order.

```html
<p class="label">row (default)</p>
<div class="flex-row">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div>
</div>
<p class="label">column</p>
<div class="flex-col">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div>
</div>
<p class="label">row-reverse</p>
<div class="flex-row-rev">
  <div class="item">1</div><div class="item">2</div><div class="item">3</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.label { color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
.item  { background: #6366f1; color: white; padding: 10px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; }
.flex-row, .flex-col, .flex-row-rev { display: flex; gap: 8px; background: #1e293b; padding: 12px; border-radius: 8px; }
.flex-col    { flex-direction: column; }
.flex-row-rev { flex-direction: row-reverse; }
```

The cross axis is always perpendicular to the main axis. When `flex-direction: row`, items flow left-to-right and the cross axis runs top-to-bottom.

## flex-direction: column — the card stack

The most common use of `flex-direction: column` is a card that needs to push a button to the bottom regardless of content length. See how items within each card align vertically.

```html
<div class="cards">
  <div class="card">
    <h2>Short Card</h2>
    <p>One line of content.</p>
    <button>Action</button>
  </div>
  <div class="card">
    <h2>Tall Card</h2>
    <p>This card has more content — multiple lines of text to make it taller than the short card.</p>
    <button>Action</button>
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.cards { display: flex; gap: 16px; align-items: flex-start; }
.card  { display: flex; flex-direction: column; background: #1e293b; padding: 20px; border-radius: 10px; width: 200px; }
.card h2 { color: #e2e8f0; margin: 0 0 8px; font-size: 1rem; }
.card p  { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 16px; flex: 1; }
.card button { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
```

`flex: 1` on the `<p>` makes it grow to fill available space — pushing the button to the bottom no matter how much text is in the paragraph. This is the classic "card with footer button" pattern.

**SE lens:** Before flexbox, "equal height columns with a footer pinned to the bottom" required JavaScript measurement or CSS hacks. `display: flex; flex-direction: column` with `flex: 1` on the growing element solves it in two lines.

**Common mistakes:**
- Applying flex properties to the flex items instead of the container — `justify-content` goes on the container, not the items.
- Forgetting that flex only lays out **direct children** — grandchildren are not flex items.
- Using `flex-direction: row-reverse` for visual reordering without considering tab/reading order — the DOM order and visual order will differ.

**Debug tip:** In Chrome DevTools, selecting a flex container shows a "flex" badge next to it in the Elements panel. Clicking the badge opens the Flexbox inspector with axis visualisation.

**Next:** `justify-content` — controlling how items are distributed along the main axis.

## Challenge: flex_container

Make `.container` a flexbox with items arranged in a column. The test checks the computed layout.

1. Set `display: flex` on `.container`
2. Set `flex-direction: column` on `.container`
3. Set `gap: 12px` on `.container`

```html
<div class="container">
  <div class="box" id="b1">Box 1</div>
  <div class="box" id="b2">Box 2</div>
  <div class="box" id="b3">Box 3</div>
</div>
```

```challenge
.container {

}

.box {
  background: #3b82f6;
  color: white;
  padding: 16px;
  border-radius: 6px;
}
```

```test
var c = getComputedStyle(document.querySelector('.container'))
assert c.display === 'flex'
assert c.flexDirection === 'column'
assert c.gap === '12px'
```
