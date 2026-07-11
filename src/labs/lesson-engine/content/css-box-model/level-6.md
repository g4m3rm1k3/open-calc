---
series: css-box-model
level: 6
title: Sizing — min, max, clamp
lang: css
---

# Sizing — min, max, clamp

Fixed pixel sizes break on different screen sizes. Percentage sizes can become too small or too large. CSS gives you three functions — `min()`, `max()`, and `clamp()` — that express constraints instead of fixed values.

## min-width, max-width, min-height, max-height

Start with the constraint properties:

```css
.container {
  width: 100%;
  max-width: 1200px;  /* never wider than 1200px */
}

.sidebar {
  width: 300px;
  min-width: 200px;   /* never narrower than 200px */
  max-width: 400px;   /* never wider than 400px */
}

.card {
  min-height: 120px;  /* tall enough for content minimums */
  /* no max-height — grows with content */
}
```

```text
max-width  — sets an upper bound (good for containers on wide screens)
min-width  — sets a lower bound (good for preventing too-narrow components)
max-height — use carefully: it can cause overflow if content is taller
```

## The min() and max() Functions

CSS functions that pick from a set of values:

```css
.column {
  width: min(100%, 600px);  /* whichever is SMALLER */
}

.hero {
  font-size: max(1rem, 2vw); /* whichever is LARGER */
}
```

```text
min(a, b)  → takes the smaller value
max(a, b)  → takes the larger value
```

`min(100%, 600px)` means: "use 100% of the parent, but never more than 600px." This replaces the common `max-width: 600px; width: 100%;` pattern in a single value.

## clamp() — Fluid Sizing

`clamp(minimum, preferred, maximum)` constrains a value within a range:

```css
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}

.card {
  padding: clamp(16px, 4%, 32px);
}
```

```text
clamp(MIN, PREFERRED, MAX)
  → if preferred < min: use min
  → if preferred > max: use max
  → otherwise: use preferred
```

`clamp(1.5rem, 5vw, 3rem)` means: "font-size grows with the viewport (`5vw`), but never below `1.5rem` or above `3rem`." One declaration covers all screen sizes.

**CS lens:** These functions move sizing from absolute values to **relational constraints** — the same mental model as min/max in algorithms. `clamp` is equivalent to `max(min, min(preferred, max))`.

## aspect-ratio

Maintains a width-to-height ratio as the element resizes:

```css
.video-embed {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.avatar {
  width: 48px;
  aspect-ratio: 1 / 1; /* square */
}
```

```text
aspect-ratio: 16 / 9  → height = width × (9/16)
As width changes, height automatically tracks.
```

**SE lens:** Before `aspect-ratio`, making a responsive 16:9 video container required a padding-top hack. `aspect-ratio` replaces that pattern entirely and makes intent obvious.

**Common mistakes:**
- Using `min()` and `max()` with the wrong mental model — `min(100%, 600px)` means "the smaller of 100% and 600px", which caps at 600px. People sometimes confuse it with `max-width` semantics.
- Passing unitless numbers to `clamp()` — all three values must have compatible units. `clamp(16, 5vw, 32)` is invalid; use `clamp(16px, 5vw, 32px)`.
- Using `max-height` to constrain growing content — `max-height` can cause overflow if the content is taller. Use `overflow: hidden` or `auto` alongside it.

**Debug tip:** In DevTools Computed tab, the resolved value of `clamp(1rem, 5vw, 3rem)` is shown as a plain pixel number (e.g., `24px`). Resize the browser window and watch the value update in real time to verify the clamp behaviour.

**Next:** Stacking contexts and `z-index` — why some elements appear above others, and why `z-index: 9999` sometimes does nothing.

## Challenge: responsive sizing

Apply fluid sizing to make the elements responsive.

1. Set `width: 100%` and `max-width: 500px` on `#container` (the `min(100%, 500px)` pattern)
2. Set `min-height` of `#card` to `120px`
3. Set `padding` of `#card` to `clamp(12px, 3%, 24px)` — test verifies padding is between 12px and 24px inclusive
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
