---
series: css-fundamentals
level: 2
title: Colors
lang: css
---

# Colors

Colour is the most immediate visual property in CSS. There are five ways to specify a colour: named keywords, hexadecimal, `rgb()`, `hsl()`, and `oklch()`. Each has trade-offs in readability, precision, and manipulability. Understanding all five — and knowing when to use each — is a foundational CSS skill.

## Named Keywords

CSS defines 140+ named colour keywords. Named colours are readable but imprecise — `tomato` is not the same as `red`, and there is no programmatic relationship between related names. Edit any keyword to try a different named colour.

```html
<div class="swatch" id="s1">tomato</div>
<div class="swatch" id="s2">steelblue</div>
<div class="swatch" id="s3">gold</div>
<div class="swatch" id="s4">mediumorchid</div>
```

```css
body { background: #0f172a; padding: 24px; display: flex; gap: 12px; flex-wrap: wrap; font-family: system-ui; }
.swatch { padding: 24px 16px; border-radius: 8px; color: white; font-size: 13px; font-weight: 600; text-align: center; min-width: 100px; text-shadow: 0 1px 2px rgba(0,0,0,0.4); }
#s1 { background-color: tomato; }
#s2 { background-color: steelblue; }
#s3 { background-color: gold; color: #333; }
#s4 { background-color: mediumorchid; }
```

Special keywords: `transparent` (fully invisible), `currentColor` (inherits the element's text colour), `inherit`, `initial`, `unset`.

## Hexadecimal

Hex is the most common format in web development. Format: `#RRGGBB` where each pair is 0–9, a–f (hexadecimal, base 16). These three boxes show dark navy, near-white, and brand blue.

```html
<div id="navy">color: #1e3a5f — dark navy text</div>
<div id="light">background-color: #f8fafc — near-white background</div>
<div id="blue">border-color: #3b82f6 — brand blue border</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
div { padding: 16px; margin: 8px 0; border-radius: 6px; font-size: 14px; }
#navy  { color: #1e3a5f; background: #e2e8f0; }
#light { color: #334155; background-color: #f8fafc; }
#blue  { color: #e2e8f0; background: #1e293b; border: 3px solid #3b82f6; }
```

**Short form:** `#rgb` expands each digit — `#f0a` → `#ff00aa`. **With alpha:** `#RRGGBBAA` adds an opacity byte — `#3b82f680` is brand blue at 50% opacity.

**CS lens:** Each hex pair is an 8-bit integer (0–255). `#3b82f6` is `R=59, G=130, B=246`. The browser converts hex to rgb() internally before painting.

## rgb() and rgba()

`rgb()` uses decimal values (0–255) and is more readable for programmatic colours. The fourth argument (0–1) controls **alpha** (opacity). Edit the last number in `rgb(59, 130, 246, 0.5)` to see the transparency change.

```html
<div id="r1">rgb(30, 58, 95) — same as #1e3a5f</div>
<div id="r2">rgb(248, 250, 252) — near-white</div>
<div id="r3">rgb(59, 130, 246, 0.5) — brand blue at 50% opacity</div>
<div id="r4">rgb(0, 0, 0, 0) — fully transparent (invisible)</div>
```

```css
body { background: #334155; padding: 24px; font-family: system-ui; }
div { padding: 16px; margin: 8px 0; border-radius: 6px; font-size: 14px; font-weight: 500; }
#r1 { background: rgb(30, 58, 95); color: #e2e8f0; }
#r2 { background: rgb(248, 250, 252); color: #334155; }
#r3 { background: rgb(59, 130, 246, 0.5); color: white; }
#r4 { background: rgb(0, 0, 0, 0); color: #e2e8f0; border: 1px dashed #64748b; }
```

Modern CSS merges `rgb()` and `rgba()` — all four values work in a single `rgb()` function.

## hsl()

`hsl()` is the most human-readable format for creating and adjusting colours. The real power: all three boxes share the same **hue (213) and saturation (52%)** — only lightness changes. This is impossible to do intuitively with hex.

```html
<div id="h1">hsl(213, 52%, 24%) — dark blue, same hue family</div>
<div id="h2">hsl(213, 52%, 50%) — mid blue, same hue family</div>
<div id="h3">hsl(213, 52%, 85%) — light blue, same hue family</div>
<p id="info">Change the hue (0–360) and all three stay in the same family</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
div { padding: 16px; margin: 8px 0; border-radius: 6px; font-size: 14px; font-weight: 600; }
#h1 { background-color: hsl(213, 52%, 24%); color: hsl(213, 52%, 85%); }
#h2 { background-color: hsl(213, 52%, 50%); color: white; }
#h3 { background-color: hsl(213, 52%, 85%); color: hsl(213, 52%, 24%); }
#info { color: #64748b; font-size: 13px; margin-top: 12px; }
```

**SE lens:** Design systems store colour palettes as HSL families. A button might be `hsl(213, 52%, 45%)` at rest, `hsl(213, 52%, 38%)` on hover — same hue and saturation, just darker.

## oklch() — The Modern Choice

`oklch()` is a newer format designed for perceptually uniform colour — equal numerical changes produce visually equal changes. The three colours below all differ by the same amount of lightness but look like genuinely equal steps.

```html
<div id="ok1">oklch(40% 0.18 250) — deep blue</div>
<div id="ok2">oklch(60% 0.18 250) — mid blue</div>
<div id="ok3">oklch(80% 0.18 250) — light blue</div>
<p id="ok-note">Try changing the hue (250) to 140 for green or 30 for orange</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
div { padding: 16px; margin: 8px 0; border-radius: 6px; font-size: 14px; font-weight: 600; }
#ok1 { background-color: oklch(40% 0.18 250); color: oklch(90% 0.05 250); }
#ok2 { background-color: oklch(60% 0.18 250); color: white; }
#ok3 { background-color: oklch(80% 0.18 250); color: oklch(30% 0.18 250); }
#ok-note { color: #64748b; font-size: 13px; }
```

## The opacity Property

`opacity` sets the transparency of the **entire element** (including its children). The left card uses `opacity: 0.4` — notice the text fades too. The right card uses `background-color` with alpha, keeping the text fully opaque.

```html
<div style="display:flex;gap:16px;">
  <div id="op-all">
    <strong>opacity: 0.4</strong>
    <p>Both box AND text fade together</p>
  </div>
  <div id="op-bg">
    <strong>background alpha</strong>
    <p>Only the background fades — text stays crisp</p>
  </div>
</div>
```

```css
body { background: #334155; padding: 24px; font-family: system-ui; }
#op-all, #op-bg { padding: 20px; border-radius: 8px; flex: 1; }
#op-all { background-color: #3b82f6; color: white; opacity: 0.4; }
#op-bg  { background-color: rgb(59, 130, 246, 0.4); color: white; }
strong  { display: block; font-size: 14px; margin-bottom: 8px; }
p       { margin: 0; font-size: 13px; }
```

Use `opacity` when you want to fade everything. Use `background-color: rgb(..., alpha)` when you want only the background to be transparent.

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
