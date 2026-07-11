---
series: css-box-model
level: 6
title: Sizing — min, max, clamp
lang: css
---

# Sizing — min, max, clamp

Fixed pixel sizes break on different screen sizes. Percentage sizes can become too small or too large. CSS gives you three functions — `min()`, `max()`, and `clamp()` — that express constraints instead of fixed values.

## max-width — cap growth on large screens

The most common sizing pattern: `width: 100%` so the element fills small screens, `max-width` so it stops growing on wide ones. Resize the browser window and see `#container` stop at 600px.

```html
<div id="outer">
  <div id="container">
    I grow to fill the screen but never exceed 600px
  </div>
</div>
```

```css
#outer     { background: #0f172a; padding: 16px; }
#container { width: 100%; max-width: 600px; margin: 0 auto; background: #1e293b; color: #e2e8f0; padding: 16px; font-family: system-ui; box-sizing: border-box; }
```

**CS lens:** These functions move sizing from absolute values to relational constraints — the same mental model as min/max in algorithms. `clamp` is equivalent to `max(min, min(preferred, max))`.

## min() and max() — pick from a set of values

`min(a, b)` picks the smaller, `max(a, b)` picks the larger. `min(100%, 600px)` means "use 100% of parent, but never more than 600px" — the same as `width: 100%; max-width: 600px` in one value. Edit the values and see the column resize.

```html
<div id="page">
  <div id="col-left">min(100%, 200px)</div>
  <div id="col-right">min(100%, 400px)</div>
</div>
```

```css
#page      { display: flex; gap: 8px; background: #0f172a; padding: 12px; }
#col-left  { width: min(100%, 200px); background: #3b82f6; color: white; padding: 12px; font-family: system-ui; font-size: 13px; box-sizing: border-box; }
#col-right { width: min(100%, 400px); background: #6366f1; color: white; padding: 12px; font-family: system-ui; font-size: 13px; box-sizing: border-box; }
```

## clamp() — fluid sizing between a min and max

`clamp(min, preferred, max)` grows with the preferred value but clamps to the min/max bounds. The heading below scales with the viewport — resize the window and watch the font size float between 1.25rem and 3rem.

```html
<div id="hero">
  <h1 id="title">Fluid Heading</h1>
  <p id="body-text">Body text also scales fluidly between 14px and 18px.</p>
</div>
```

```css
#hero      { background: #1e293b; padding: clamp(16px, 4vw, 48px); }
#title     { color: #e2e8f0; font-family: system-ui; margin: 0 0 8px; font-size: clamp(1.25rem, 4vw, 3rem); }
#body-text { color: #94a3b8; font-family: system-ui; margin: 0; font-size: clamp(14px, 2vw, 18px); }
```

## aspect-ratio — maintain proportions

Set `aspect-ratio: 16 / 9` and the height automatically tracks the width. The old approach required a padding-top hack. Change the width and watch the height follow.

```html
<div id="video-wrap">
  <div id="video">16:9 video placeholder — height tracks width automatically</div>
</div>
<div id="avatars">
  <div class="avatar">A</div>
  <div class="avatar">B</div>
  <div class="avatar">C</div>
</div>
```

```css
#video-wrap { background: #0f172a; padding: 12px; margin-bottom: 12px; }
#video      { width: 100%; aspect-ratio: 16 / 9; background: #1e293b; color: #94a3b8; font-family: system-ui; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
#avatars    { display: flex; gap: 8px; padding: 4px; }
.avatar     { width: 48px; aspect-ratio: 1 / 1; background: #6366f1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: system-ui; font-weight: 700; }
```

**SE lens:** Before `aspect-ratio`, making a responsive 16:9 video container required a padding-top hack (padding-top: 56.25%). `aspect-ratio` replaces that entirely and makes intent obvious.

**Common mistakes:**
- Confusing `min()` mental model — `min(100%, 600px)` picks the *smaller* of the two, capping at 600px. People sometimes read it as "minimum 600px."
- Passing unitless numbers to `clamp()` — `clamp(16, 5vw, 32)` is invalid; units must be compatible: `clamp(16px, 5vw, 32px)`.
- Using `max-height` to constrain growing content without handling overflow — if content is taller, it overflows. Add `overflow: hidden` or `auto` alongside it.

**Debug tip:** In DevTools Computed tab, the resolved value of `clamp(1rem, 5vw, 3rem)` shows as a plain pixel number. Resize the browser and watch the value update in real time to verify clamp behaviour.

**Next:** Stacking contexts and `z-index` — why some elements appear above others, and why `z-index: 9999` sometimes does nothing.

## Challenge: responsive sizing

Apply fluid sizing to make the elements responsive.

1. Set `width: 100%` and `max-width: 500px` on `#container`
2. Set `min-height` of `#card` to `120px`
3. Set `padding` of `#card` to `clamp(12px, 3%, 24px)`
4. Set `aspect-ratio` of `#video` to `16 / 9` and `width` to `100%`

```html
<div id="container" style="width:400px;">
  <div id="card">Card</div>
</div>
<div id="video">Video embed</div>
```

```challenge
/* Apply sizing constraints */

```

```test
var container = document.querySelector('#container')
var card = document.querySelector('#card')
var video = document.querySelector('#video')
var sC = getComputedStyle(container)
var sCard = getComputedStyle(card)
var sV = getComputedStyle(video)
assert sC.maxWidth === '500px'
assert parseFloat(sCard.minHeight) >= 120
assert parseFloat(sCard.paddingTop) >= 12 && parseFloat(sCard.paddingTop) <= 24
assert sV.aspectRatio === '16 / 9'
assert sV.width !== '0px'
```
