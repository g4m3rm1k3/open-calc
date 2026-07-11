---
series: css-fundamentals
level: 2
title: Colors
lang: css
---

# Colors

Colour is the most immediate visual property in CSS. There are five ways to specify a colour: named keywords, hexadecimal, `rgb()`, `hsl()`, and `oklch()`. Each has trade-offs in readability, precision, and manipulability. Understanding all five — and knowing when to use each — is a foundational CSS skill.

## Named Keywords

CSS defines 140+ named colour keywords:

```css
.box {
  background-color: tomato;
  color: white;
  border: 2px solid darkred;
}
```

```text
background-color: tomato   → rgb(255, 99, 71)
color: white               → rgb(255, 255, 255)
border: 2px solid darkred  → rgb(139, 0, 0)
```

Named colours are readable but imprecise — `tomato` is not the same as `red`, and there is no programmatic relationship between related names. Use them for quick experiments and prototypes, not design systems.

Special keywords that always work: `transparent` (fully invisible), `currentColor` (inherits the element's text colour), `inherit`, `initial`, `unset`.

## Hexadecimal

Hex is the most common format in web development:

```css
.palette {
  color: #1e3a5f;           /* dark navy */
  background-color: #f8fafc; /* near-white */
  border-color: #3b82f6;    /* brand blue */
}
```

```text
Format: #RRGGBB
Each pair is 0–9, a–f (hexadecimal, base 16)
Range: #000000 (black) to #ffffff (white)
```

**Short form:** `#rgb` expands each digit: `#f0a` → `#ff00aa`. Only valid when both digits are the same.

**With alpha:** `#RRGGBBAA` adds an opacity byte. `#1e3a5f80` is navy at 50% opacity.

**CS lens:** Each hex pair is an 8-bit integer (0–255). `#3b82f6` is `R=59, G=130, B=246`. The browser converts hex to rgb() internally before painting. Understanding this makes colour arithmetic easier — mixing `#ff0000` (R=255) and `#0000ff` (B=255) at equal weight gives `#800080` (`R=128, B=128`), which is purple.

## rgb() and rgba()

`rgb()` uses decimal values (0–255) and is more readable for programmatic colours:

```css
.rgb-examples {
  color: rgb(30, 58, 95);         /* same as #1e3a5f */
  background-color: rgb(248, 250, 252);
  border-color: rgb(59, 130, 246, 0.5); /* 50% opacity */
}
```

The fourth argument (0–1 or 0%–100%) controls **alpha** (opacity). `rgb(0, 0, 0, 0)` is fully transparent; `rgb(0, 0, 0, 1)` is fully opaque black.

Modern CSS merges `rgb()` and `rgba()` — all four values work in a single `rgb()` function. Both forms are valid; new code should use `rgb()`.

## hsl()

`hsl()` is the most human-readable format for creating and adjusting colours:

```css
.hsl-examples {
  /* hsl(hue, saturation, lightness) */
  color: hsl(213, 52%, 24%);         /* dark blue */
  background-color: hsl(213, 52%, 97%); /* same hue, almost white */
  border-color: hsl(213, 52%, 50%);     /* same hue, mid blue */
}
```

```text
Hue:        0–360° on the colour wheel (0/360=red, 120=green, 240=blue)
Saturation: 0% (grey) to 100% (vivid)
Lightness:  0% (black) to 100% (white); 50% is the "pure" colour
```

The power of `hsl()`: all three values in the example above share the same hue (`213`) and saturation (`52%`). To create a colour palette — dark, mid, and light variants of one colour — just vary the lightness. This is impossible to do intuitively with hex.

**SE lens:** Design systems store colour palettes as HSL families. A button might be `hsl(213, 52%, 45%)` at rest, `hsl(213, 52%, 38%)` on hover, and `hsl(213, 52%, 30%)` when active — the same hue and saturation, just darker.

## oklch() — The Modern Choice

`oklch()` is a newer format designed for perceptually uniform colour (equal numerical changes produce visually equal changes):

```css
.oklch {
  color: oklch(45% 0.15 250);  /* lightness, chroma, hue */
  background-color: oklch(97% 0.01 250);
}
```

`oklch` is better for generating accessible colour palettes automatically and for colour mixing. Browser support is strong (all modern browsers). For a first pass, `hsl()` is more intuitive; `oklch` matters when you need perceptual uniformity.

## The opacity Property

`opacity` sets the transparency of the **entire element** (including its children), not just one colour:

```css
.faded {
  opacity: 0.5; /* 0 = invisible, 1 = fully opaque */
}
```

`opacity: 0.5` on a box with text makes both the box AND the text 50% transparent. If you only want the background to be transparent (keeping text fully opaque), use `background-color: rgb(0, 0, 0, 0.5)` instead.

## Challenge: color_palette

The HTML below has three `<div>` elements. Apply colours so that:
1. `#primary` has `background-color: hsl(213, 80%, 45%)`
2. `#secondary` has `background-color: rgb(16, 185, 129)` (emerald green)
3. `#accent` has `background-color: #f59e0b` (amber)

All three should have `color: white`.

```html
<div id="primary" style="padding:20px;margin:8px;">Primary</div>
<div id="secondary" style="padding:20px;margin:8px;">Secondary</div>
<div id="accent" style="padding:20px;margin:8px;">Accent</div>
```

```challenge
#primary {

}

#secondary {

}

#accent {

}

```

```test
var p = getComputedStyle(document.querySelector('#primary'))
var s = getComputedStyle(document.querySelector('#secondary'))
var a = getComputedStyle(document.querySelector('#accent'))
assert p.backgroundColor === 'rgb(20, 114, 222)'
assert s.backgroundColor === 'rgb(16, 185, 129)'
assert a.backgroundColor === 'rgb(245, 158, 11)'
assert p.color === 'rgb(255, 255, 255)'
assert s.color === 'rgb(255, 255, 255)'
assert a.color === 'rgb(255, 255, 255)'
```
