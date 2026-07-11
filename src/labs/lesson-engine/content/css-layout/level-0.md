---
series: css-layout
level: 0
title: Normal Flow
lang: css
---

# Normal Flow

Before you write a single line of CSS, the browser already has a layout algorithm running. It is called **normal flow** — the default system for placing block and inline elements. Every CSS layout technique (flexbox, grid, positioning) is a modification of or escape from normal flow. Understanding how flow works by default tells you exactly what you are overriding and why.

## Block Formatting — stacking vertically

Block-level elements participate in the **block formatting context**. Each block element generates a box that stretches the full width of its containing block, then forces the next element to start below it.

```css
div {
  background: #1e293b;
  padding: 16px;
  /* display: block is the default for div */
}
```

```text
Block elements in normal flow:
  ┌──────────────────────────────────────┐
  │  div A  (full-width, height = content)│
  └──────────────────────────────────────┘
  ┌──────────────────────────────────────┐
  │  div B  (starts on a NEW line)       │
  └──────────────────────────────────────┘
```

A block element claims the full available width even if its content is only 10px wide. The remaining space is not offered to the next element — it belongs to the block.

**CS lens:** Normal flow is a sequential layout algorithm. The browser makes one pass through the element tree, top to bottom. Each block element computes its width (from the parent), computes its height (from its content), then records where the next element must start (directly below).

## Inline Formatting — flowing horizontally

Inline elements participate in the **inline formatting context**. They flow left to right like words in a sentence, wrapping to the next line when the container runs out of width.

```css
span {
  background: #3b82f6;
  color: white;
  padding: 2px 6px;
  /* display: inline is the default for span */
}
```

```text
Inline elements in normal flow:
  ┌────────────────────────────────────────┐
  │ [span A] [span B] [span C] [span D]   │  ← flow left to right
  │ [span E] [span F]                      │  ← wrap when container full
  └────────────────────────────────────────┘
```

Key difference from block: inline elements do not force a new line before or after themselves. Multiple inline elements share the same horizontal line.

## Width and Height in Normal Flow

```css
.block-el {
  /* width: 100% is the default — stretches to fill parent */
  /* height: auto is the default — shrinks to wrap content */
  width: 300px;   /* override: fixed width, rest of line is empty */
  height: auto;   /* height still grows with content */
}
```

```text
Overriding width:
  Parent (600px wide)
  ┌────────────┬────────────────┐
  │  300px box │  (empty space) │
  └────────────┴────────────────┘

Height is always content-driven unless you set it explicitly.
Setting a fixed height risks overflow (covered in CSS Box Model).
```

**SE lens:** The reason most beginners fight with CSS is that they expect elements to size and position themselves like desktop UI widgets — side by side, sized to content. Block flow does the opposite by default: full width, stacked. Understanding this default makes every override make sense.

**Common mistakes:**
- Expecting two `<div>` elements to sit side by side in normal flow — they cannot, because block elements claim the full width. You need flexbox, grid, `inline-block`, or `float` to place them side by side.
- Setting `width` on an inline element (`<span>`, `<a>`) — inline elements ignore `width` and `height`. You must change `display` to `inline-block` or `block` first.
- Confusing the element's content height with its full box height — by default `height: auto` means the content area height, not including padding or margin in the way `box-sizing: content-box` counts it.

**Debug tip:** To understand flow visually, add `outline: 1px dashed red` to elements you are debugging — outlines take no space and immediately reveal the box boundaries. In DevTools, hover over any element in the Elements panel to see its box highlighted on the page, including which direction it flows.

**Next:** Block formatting contexts — the invisible rules that determine when blocks create isolated layout environments, contain floats, and prevent margin collapse.

## Challenge: normal_flow

Style the two elements so they demonstrate block and inline behaviour clearly.

1. Set `display` of `#block-a` to `block`, `background-color` to `rgb(59, 130, 246)`, and `padding` to `16px`
2. Set `display` of `#block-b` to `block`, `background-color` to `rgb(16, 185, 129)`, and `padding` to `16px`
3. Set `display` of `#inline-a` to `inline` and `background-color` to `rgb(245, 158, 11)`
4. Set `display` of `#inline-b` to `inline` and `background-color` to `rgb(239, 68, 68)`

```html
<div id="block-a">Block A</div>
<div id="block-b">Block B</div>
<span id="inline-a">Inline A</span>
<span id="inline-b">Inline B</span>
```

```challenge
/* Style block and inline elements */

```

```test
var bA = document.querySelector('#block-a')
var bB = document.querySelector('#block-b')
var iA = document.querySelector('#inline-a')
var iB = document.querySelector('#inline-b')
assert getComputedStyle(bA).display === 'block'
assert getComputedStyle(bA).backgroundColor === 'rgb(59, 130, 246)'
assert getComputedStyle(bB).backgroundColor === 'rgb(16, 185, 129)'
assert getComputedStyle(iA).display === 'inline'
assert getComputedStyle(iA).backgroundColor === 'rgb(245, 158, 11)'
assert getComputedStyle(iB).backgroundColor === 'rgb(239, 68, 68)'
```
