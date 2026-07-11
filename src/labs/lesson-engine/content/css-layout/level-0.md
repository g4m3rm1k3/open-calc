---
series: css-layout
level: 0
title: Normal Flow
lang: css
---

# Normal Flow

Before you write a single line of CSS, the browser already has a layout algorithm running. It is called **normal flow** — the default system for placing block and inline elements. Every CSS layout technique (flexbox, grid, positioning) is a modification of or escape from normal flow. Understanding how flow works by default tells you exactly what you are overriding and why.

## Block elements stack vertically

Block-level elements participate in the **block formatting context**. Each block element generates a box that stretches the full width of its containing block, then forces the next element to start below it. Run this and see how two divs stack even though there is room for both on the same line.

```html
<div id="a">Block A</div>
<div id="b">Block B</div>
```

```css
#a { background: #3b82f6; color: white; padding: 16px; }
#b { background: #10b981; color: white; padding: 16px; }
```

A block element claims the full available width even if its content is only a few characters wide. The remaining space is not offered to the next element.

**CS lens:** Normal flow is a sequential layout algorithm. The browser makes one pass through the element tree, top to bottom. Each block element computes its width (from the parent), computes its height (from its content), then records where the next element must start — directly below.

## Inline elements flow horizontally

Inline elements participate in the **inline formatting context**. They flow left to right like words in a sentence, wrapping to the next line when the container runs out of width. Multiple inline elements share the same horizontal line — they never force a line break before or after themselves.

```html
<span id="a">Inline A</span>
<span id="b">Inline B</span>
<span id="c">Inline C</span>
<span id="d">Inline D — this one is longer to show wrapping when the container runs out of room</span>
```

```css
span { background: #3b82f6; color: white; padding: 2px 8px; margin: 2px; }
```

**SE lens:** The reason most beginners fight with CSS is that they expect elements to size and position themselves like desktop UI widgets — side by side, sized to content. Block flow does the opposite by default: full width, stacked. Understanding this default makes every override make sense.

**Common mistakes:**
- Expecting two `<div>` elements to sit side by side in normal flow — they cannot because block elements claim the full width. You need flexbox, grid, `inline-block`, or `float`.
- Setting `width` on an inline element (`<span>`, `<a>`) — inline elements ignore `width` and `height`. Change `display` to `inline-block` or `block` first.
- Confusing content height with full box height — `height: auto` means the content area height, not including how `box-sizing` counts padding.

**Debug tip:** Add `outline: 1px dashed red` to elements you are debugging — outlines take no space and immediately reveal box boundaries. In DevTools, hover over any element in the Elements panel to see its box highlighted on the page.

**Next:** Block formatting contexts — the invisible rules that determine when blocks create isolated layout environments, contain floats, and prevent margin collapse.

## Challenge: normal_flow

Style the four elements to demonstrate block and inline behaviour.

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
