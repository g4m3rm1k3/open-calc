---
series: css-fundamentals
level: 3
title: Units
lang: css
---

# Units

Every numeric value in CSS needs a unit. `font-size: 16` is invalid; `font-size: 16px` is not. CSS has two categories of units: **absolute** (fixed, like physical measurements) and **relative** (proportional to something else). Choosing the right unit determines whether a design adapts correctly to different screens, user preferences, and contexts.

## Absolute Units — px

Pixels (`px`) are the only absolute unit you need in everyday CSS. One CSS pixel is not necessarily one physical screen pixel — on a retina display, one CSS pixel maps to 4 physical pixels. The browser handles this conversion. Edit `width: 300px` and watch the box resize precisely.

```html
<div id="box">
  <p>300px wide, 120px tall, 2px border, 16px padding, 18px text</p>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
#box {
  width: 300px;
  height: 120px;
  border: 2px solid #3b82f6;
  padding: 16px;
  font-size: 18px;
  color: #e2e8f0;
  background: #1e293b;
  border-radius: 6px;
  box-sizing: border-box;
}
```

`px` is correct for borders, shadows, and elements that must remain a fixed size. It is **wrong** for font sizes and spacing — those should scale with user preferences.

**CS lens:** The browser has a "device pixel ratio" (DPR). On a standard screen DPR=1; on retina DPR=2 or 3. When you write `border: 2px`, the browser multiplies by DPR to determine physical pixels — so CSS measurements feel consistent across devices even though screen densities vary enormously.

## Relative Units — em

`em` is relative to the **font size of the current element**. Here `.parent` is 20px and `.child` is `0.8em` — that means 80% of 20px = 16px. The padding is `1em` which is relative to the child's own resolved font size (16px).

```html
<div class="parent">
  Parent: font-size 20px
  <div class="child">
    Child: 0.8em = 16px · padding 1em = 16px · margin 0.5em = 8px
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.parent {
  font-size: 20px;
  color: #94a3b8;
  background: #1e293b;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #334155;
}
.child {
  font-size: 0.8em;   /* 80% of 20px = 16px */
  padding: 1em;       /* 1 × 16px = 16px */
  margin: 0.5em;      /* 0.5 × 16px = 8px */
  color: #e2e8f0;
  background: #0f172a;
  border-radius: 6px;
}
```

`em` compounds when nested — a child at `0.8em` inside a parent at `0.8em` is already at 64% of root. Use `em` for spacing that should scale proportionally with the element's own text size.

## Relative Units — rem

`rem` (root em) is relative to the **root element's** (`<html>`) font size, not the current element's. This eliminates the compounding problem. All three headings compute from the same root — 16px — regardless of where they are in the DOM.

```html
<div class="outer">
  Outer div: font-size 24px
  <h1>h1: 2rem = 32px (always, regardless of parent)</h1>
  <p>p: 1rem = 16px</p>
  <div class="inner">
    Inner div: font-size 12px
    <h2>h2: 1.5rem = 24px (still from root, not inner)</h2>
  </div>
</div>
```

```css
html { font-size: 16px; }
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.outer { font-size: 24px; color: #64748b; background: #1e293b; padding: 16px; border-radius: 8px; }
.inner { font-size: 12px; color: #64748b; background: #0f172a; padding: 12px; border-radius: 6px; margin-top: 8px; }
h1 { font-size: 2rem; color: #818cf8; margin: 4px 0; }   /* 32px — always */
h2 { font-size: 1.5rem; color: #6ee7b7; margin: 4px 0; } /* 24px — always */
p  { font-size: 1rem; color: #e2e8f0; margin: 4px 0; }   /* 16px — always */
```

`rem` is the preferred unit for **font sizes and spacing** in modern CSS. If the user changes their browser's base font size, `rem` values scale proportionally — `px` values do not.

## Percentage — %

Percentage is relative to the **parent element's** corresponding property. The two columns are each `50%` of their parent — they always add up to 100% no matter the parent's width.

```html
<div class="container">
  <div class="col left">Left: 50% of 500px = 250px</div>
  <div class="col right">Right: 50% = 250px</div>
</div>
<div class="container narrow">
  <div class="col left">Left: 50% of 300px = 150px</div>
  <div class="col right">Right: 50% = 150px</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; font-size: 13px; }
.container { display: flex; margin-bottom: 12px; border: 1px solid #334155; border-radius: 6px; overflow: hidden; }
.container.narrow { width: 300px; }
.col { width: 50%; padding: 16px; color: #e2e8f0; box-sizing: border-box; }
.left  { background: #1e3a5f; }
.right { background: #1e293b; }
```

Padding percentage is always relative to the parent's **width**, even for `padding-top` and `padding-bottom` — a quirk used to create responsive aspect ratios.

## Viewport Units — vw, vh

`vw` (viewport width) and `vh` (viewport height) are relative to the browser's visible area. The hero below fills 100% of the iframe's width and 40% of its height — resize the iframe to see it adapt.

```html
<div id="hero">
  100vw wide · 40vh tall — always fills the viewport
</div>
<div id="sidebar">25vw wide sidebar</div>
```

```css
body { background: #0f172a; margin: 0; font-family: system-ui; }
#hero {
  width: 100vw;
  height: 40vh;
  background: linear-gradient(135deg, #1e3a5f, #1e1b4b);
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
  box-sizing: border-box;
}
#sidebar {
  width: 25vw;
  background: #1e293b;
  color: #94a3b8;
  padding: 16px;
  font-size: 13px;
  min-height: 60px;
  box-sizing: border-box;
}
```

## Choosing the Right Unit

A quick comparison showing what breaks when you use `px` for font size vs `rem`. The left column uses `px` — it ignores browser preferences. The right uses `rem` — it scales.

```html
<div style="display:flex;gap:16px;">
  <div id="px-col">
    <p class="label">px — ignores user prefs</p>
    <p class="body-px">Body text: 16px</p>
    <h2 class="head-px">Heading: 24px</h2>
    <small class="sm-px">Small: 12px</small>
  </div>
  <div id="rem-col">
    <p class="label">rem — scales with prefs</p>
    <p class="body-rem">Body text: 1rem</p>
    <h2 class="head-rem">Heading: 1.5rem</h2>
    <small class="sm-rem">Small: 0.75rem</small>
  </div>
</div>
```

```css
html { font-size: 16px; }
body { background: #0f172a; padding: 24px; font-family: system-ui; }
#px-col, #rem-col { flex: 1; background: #1e293b; padding: 16px; border-radius: 8px; }
.label { color: #64748b; font-size: 11px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em; }
.body-px, .body-rem { color: #e2e8f0; margin: 4px 0; }
.head-px, .head-rem { color: #818cf8; margin: 4px 0; }
.sm-px, .sm-rem { color: #94a3b8; }
.body-px { font-size: 16px; }
.head-px { font-size: 24px; }
.sm-px   { font-size: 12px; }
.body-rem { font-size: 1rem; }
.head-rem { font-size: 1.5rem; }
.sm-rem   { font-size: 0.75rem; }
```

Rule of thumb: font sizes → `rem`. Viewport fills → `vw`/`vh`. Parent-relative widths → `%`. Component-relative spacing → `em`. Borders and shadows → `px`.

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
