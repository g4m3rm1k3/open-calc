---
series: css-fundamentals
level: 3
title: Units
lang: css
---

# Units

Every numeric value in CSS needs a unit. `font-size: 16` is invalid; `font-size: 16px` is not. CSS has two categories of units: **absolute** (fixed, like physical measurements) and **relative** (proportional to something else). Choosing the right unit determines whether a design adapts correctly to different screens, user preferences, and contexts.

## Absolute Units — px

Pixels (`px`) are the only absolute unit you need in everyday CSS. One CSS pixel is not necessarily one physical screen pixel — on a retina display, one CSS pixel maps to 4 physical pixels. The browser handles this conversion.

```css
.box {
  width: 300px;
  height: 200px;
  border: 2px solid #3b82f6;
  padding: 16px;
  font-size: 18px;
}
```

```text
width: 300px  — always 300 CSS pixels wide, regardless of screen or zoom level
font-size: 18px — 18px, regardless of the user's browser font preference
```

`px` is predictable and maps directly to your mental model of size. It is correct for borders, shadows, and elements that must remain a fixed size. It is **wrong** for font sizes and spacing — those should scale with user preferences.

**CS lens:** The browser has a "device pixel ratio" (DPR). On a standard screen DPR=1; on retina DPR=2 or 3. When you write `border: 2px`, the browser multiplies by DPR to determine physical pixels. This is why CSS pixel measurements feel consistent across devices even though screen densities vary enormously.

## Relative Units — em

`em` is relative to the **font size of the current element**:

```css
.parent {
  font-size: 20px;
}

.child {
  font-size: 0.8em;   /* 80% of 20px = 16px */
  padding: 1em;       /* 1 × 16px = 16px (based on child's own font-size) */
  margin: 0.5em;      /* 0.5 × 16px = 8px */
}
```

```text
.parent font-size: 20px
.child  font-size: 16px   (0.8 × 20)
.child  padding:   16px   (1 × 16 — child's own font size)
.child  margin:    8px    (0.5 × 16)
```

`em` compounds when nested: a `.child` at `0.8em` inside a `.parent` at `0.8em` inside a `body` at `16px` is `16 × 0.8 × 0.8 = 10.24px`. This compounding is the main reason `em` is tricky.

Use `em` for spacing that should scale proportionally with the element's own text size — button padding, icon sizes inside text.

## Relative Units — rem

`rem` (root em) is relative to the **root element's** (`<html>`) font size, not the current element's. This eliminates the compounding problem:

```css
html {
  font-size: 16px;  /* the root — 1rem = 16px everywhere */
}

h1 { font-size: 2rem; }    /* 32px */
p  { font-size: 1rem; }    /* 16px */
.small { font-size: 0.875rem; } /* 14px */
```

```text
2rem is always 2 × root font size — not affected by nesting.
```

`rem` is the preferred unit for **font sizes and spacing** in modern CSS. If the user changes their browser's base font size (accessibility setting), `rem` values scale proportionally — `px` values do not.

**SE lens:** A common professional pattern: set `html { font-size: 62.5%; }` which makes `1rem = 10px` (62.5% of the browser default 16px). Then `1.6rem = 16px`, `2.4rem = 24px` — the mental arithmetic becomes simple. Many teams instead use a CSS custom property for scale.

## Percentage — %

Percentage is relative to the **parent element's** corresponding property:

```css
.container {
  width: 800px;
}

.column {
  width: 50%;  /* 50% of 800px = 400px */
  padding: 5%; /* 5% of parent width = 40px */
}
```

```text
50% width means half the parent's width.
Padding percentage is always relative to the parent's WIDTH, even for top/bottom padding.
```

That last point is important and surprising: `padding-top: 10%` is 10% of the **parent's width**, not its height. This is specified behaviour used to create responsive aspect ratios.

## Viewport Units — vw, vh

`vw` (viewport width) and `vh` (viewport height) are relative to the browser's visible area:

```css
.hero {
  width: 100vw;   /* 100% of the viewport width */
  height: 60vh;   /* 60% of the viewport height */
}

.sidebar {
  width: 25vw;
}
```

```text
100vw = the full width of the browser window
100vh = the full height of the browser window
```

Viewport units are the right choice for full-page layouts, hero sections, and elements that should fill or proportion the screen regardless of content. They are covered in depth in the Responsive Design series.

## Choosing the Right Unit

```text
Borders, shadows, icons         → px
Font sizes                      → rem
Spacing (margin/padding)        → rem or em
Layout widths                   → % or vw
Layout heights                  → % or vh
Component-relative spacing      → em
```

The rule of thumb: anything that should scale with user font preferences → `rem`. Anything that should scale with the viewport → `vw`/`vh`. Anything that should scale with the parent element → `%`.

## Challenge: units_mix

The HTML below has a container with children. Write CSS so that:
1. `#container` has `width: 400px` and `font-size: 20px`
2. `#title` has `font-size: 2rem` (relative to root, not container)
3. `#subtitle` has `font-size: 1em` relative to the container — which means it should compute to the container's `font-size` of 20px
4. `#box` has `width: 50%` (half the container width = 200px)

```html
<div id="container">
  <h2 id="title">Title</h2>
  <p id="subtitle">Subtitle</p>
  <div id="box" style="height:40px;background:#dbeafe;"></div>
</div>
```

```challenge
html {
  font-size: 16px;
}

#container {

}

#title {

}

#subtitle {

}

#box {

}
```

```test
var root = getComputedStyle(document.documentElement)
var container = getComputedStyle(document.querySelector('#container'))
var title = getComputedStyle(document.querySelector('#title'))
var subtitle = getComputedStyle(document.querySelector('#subtitle'))
var box = getComputedStyle(document.querySelector('#box'))
assert container.width === '400px'
assert container.fontSize === '20px'
assert title.fontSize === '32px'
assert subtitle.fontSize === '20px'
assert box.width === '200px'
```
