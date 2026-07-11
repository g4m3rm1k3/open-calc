---
series: css-box-model
level: 0
title: The Box Model
lang: css
---

# The Box Model

Every element in CSS is a rectangular box. Understanding what that box is made of — and how its dimensions are calculated — is the foundation of all CSS layout work.

## The Four Layers

Each element's box has four layers, from inside to outside:

```text
┌─────────────────────────────────────┐
│              MARGIN                 │  ← transparent space outside the border
│  ┌───────────────────────────────┐  │
│  │           BORDER              │  │  ← the visible edge (can have width/colour)
│  │  ┌─────────────────────────┐  │  │
│  │  │        PADDING          │  │  │  ← space between border and content
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │      CONTENT      │  │  │  │  ← text, images, child elements
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

```css
div {
  content: /* controlled by width and height */;
  padding: 16px;       /* inside the border */
  border: 2px solid #334155;
  margin: 24px;        /* outside the border */
}
```

**CS lens:** This is a compositional data structure. Each box nests inside the next. The browser lays out the page by computing these four values for every element and placing the resulting rectangles in space.

## Default Box Sizing

By default, `width` and `height` set the size of the **content box only**. Padding and border are added on top.

```css
.box {
  width: 300px;
  padding: 20px;
  border: 2px solid #3b82f6;
}
```

```text
Total rendered width:
  300px (content)
+ 20px left padding + 20px right padding
+ 2px left border  + 2px right border
= 344px
```

This surprises nearly every developer the first time. You say `width: 300px` but the element is 344px wide.

## Margin vs Padding

Both create space, but in different places:

```css
.card {
  padding: 24px;  /* space INSIDE the card — part of the card's background */
  margin: 16px;   /* space OUTSIDE the card — transparent, shows parent background */
}
```

```text
padding: 24px  → background-color fills the padded area
margin: 16px   → always transparent (shows parent/body background)
```

## The DevTools Box Model Inspector

Every browser's DevTools has a visual box model inspector. Select an element, look at the "Computed" tab (Chrome/Edge) or "Box Model" panel (Firefox), and you see the actual content/padding/border/margin values as a diagram.

**SE lens:** When a layout behaves unexpectedly, the first step is always to open DevTools and inspect the box model. Wrong element size almost always means unexpected padding, border, or margin — not a CSS logic error.

**Common mistakes:**
- Thinking `width: 300px` means the element is 300px on screen — by default it is 300px *content* plus padding plus border.
- Confusing padding and margin: padding has the element's background-color; margin is always transparent. If a space has the background color, it is padding. If it is transparent, it is margin.
- Forgetting that `background-color` fills the padding area but NOT the margin area.

**Debug tip:** Open DevTools → Elements → select any element → look at the box at the bottom of the Computed tab. It shows the exact pixel values for content, padding, border, and margin in the classic nested-box diagram. Hover over each box to highlight that layer on the page.

**Next:** `box-sizing: border-box` — a single line that makes the width and height properties mean what you actually want them to mean.

## Challenge: box_model

Apply box model properties to `#box` so the tests pass.

1. Set `width` to `200px`
2. Set `padding` to `20px` on all sides
3. Set `border` width to `4px` solid `rgb(59, 130, 246)`
4. Set `margin` to `32px` on all sides

```html
<div id="box">Box</div>
```

```challenge
#box {
  /* Set width, padding, border, and margin */
}
```

```test
var box = document.querySelector('#box')
var s = getComputedStyle(box)
assert s.width === '200px'
assert s.paddingTop === '20px'
assert s.paddingRight === '20px'
assert s.borderTopWidth === '4px'
assert s.borderTopColor === 'rgb(59, 130, 246)'
assert s.marginTop === '32px'
```
