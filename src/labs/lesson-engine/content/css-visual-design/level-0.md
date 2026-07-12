---
series: css-visual-design
level: 0
title: Color Theory for the Web
lang: css
---

# Color Theory for the Web

Pick colors by intuition and your UI will feel arbitrary. Someone who knows color theory will look at your palette and be able to tell you exactly why certain color combinations feel wrong — and how to fix them.

Color is not decoration. Every color decision carries meaning: hierarchy (which element draws the eye first), state (is this button primary or secondary?), brand (consistent identity), and accessibility (is this text readable by people with color blindness?). Design systems encode these decisions as variables so every component benefits automatically.

By the end of this lesson you will understand HSL color notation and why it makes relationships between colors visible in code, be able to build a color scale using lightness, and define semantic color roles that survive brand changes and dark mode.

## The color wheel and harmony

```html
<div class="palette">
  <div class="swatch primary">Primary</div>
  <div class="swatch complementary">Complementary</div>
  <div class="swatch analogous-1">Analogous 1</div>
  <div class="swatch analogous-2">Analogous 2</div>
</div>
```

```css
/* HSL makes color relationships visible in code */
:root {
  --hue: 220;               /* blue */
  --primary:       hsl(var(--hue),        70%, 50%);
  --complementary: hsl(calc(var(--hue) + 180), 70%, 50%);  /* opposite on wheel */
  --analogous-1:   hsl(calc(var(--hue) - 30),  70%, 50%);  /* adjacent */
  --analogous-2:   hsl(calc(var(--hue) + 30),  70%, 50%);  /* adjacent */
}

.palette { display: flex; gap: 1rem; }
.swatch { padding: 1rem 1.5rem; border-radius: 8px; color: white; font-weight: bold; font-size: 0.85rem; }
.primary       { background: var(--primary); }
.complementary { background: var(--complementary); }
.analogous-1   { background: var(--analogous-1); }
.analogous-2   { background: var(--analogous-2); }
```

**CS lens:** HSL (Hue, Saturation, Lightness) is a cylindrical coordinate system over RGB color space. Hue is an angle (0–360°) around the color wheel. Complementary colors are 180° apart. Analogous colors are ±30°. Using HSL with `calc()` makes these mathematical relationships directly expressible in code — changing `--hue` shifts the entire palette consistently.

## Tints, shades, and tones

```html
<div class="scale">
  <div class="step s100">100</div>
  <div class="step s300">300</div>
  <div class="step s500">500</div>
  <div class="step s700">700</div>
  <div class="step s900">900</div>
</div>
```

```css
/* A color scale: same hue, lightness varies from light to dark */
:root { --h: 220; --s: 70%; }

.scale { display: flex; gap: 0.5rem; }
.step { width: 80px; height: 80px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
.s100 { background: hsl(var(--h), var(--s), 95%); color: hsl(var(--h), var(--s), 30%); }
.s300 { background: hsl(var(--h), var(--s), 75%); color: hsl(var(--h), var(--s), 20%); }
.s500 { background: hsl(var(--h), var(--s), 50%); color: white; }
.s700 { background: hsl(var(--h), var(--s), 30%); color: white; }
.s900 { background: hsl(var(--h), var(--s), 15%); color: hsl(var(--h), 30%, 80%); }
```

## Semantic color roles

```html
<div class="alerts">
  <div class="alert alert-info">ℹ Info — a neutral message</div>
  <div class="alert alert-success">✓ Success — action completed</div>
  <div class="alert alert-warning">⚠ Warning — needs attention</div>
  <div class="alert alert-danger">✕ Danger — something went wrong</div>
</div>
```

```css
/* Semantic roles — meaning, not just color */
:root {
  --color-info:    hsl(210, 70%, 50%);
  --color-success: hsl(142, 60%, 40%);
  --color-warning: hsl(38,  90%, 48%);
  --color-danger:  hsl(0,   70%, 50%);
}

.alerts { display: flex; flex-direction: column; gap: 0.5rem; }
.alert { padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; font-weight: 500; border-left: 4px solid currentColor; }
.alert-info    { background: hsl(210, 70%, 96%); color: hsl(210, 70%, 30%); }
.alert-success { background: hsl(142, 60%, 95%); color: hsl(142, 60%, 25%); }
.alert-warning { background: hsl(38,  90%, 95%); color: hsl(38,  80%, 25%); }
.alert-danger  { background: hsl(0,   70%, 96%); color: hsl(0,   70%, 30%); }
```

**SE lens:** Production design systems (Tailwind, Material, Radix) don't pick colors arbitrarily — they define semantic roles (primary, success, warning, danger) that map to color scales. When the brand color changes, you update one variable, not 200 class names. Semantic naming also communicates intent: `color-danger` tells the next developer "this is for destructive or error states" in a way that `color-red` does not.

**Common mistakes:**
- Using literal color names (`--red`, `--blue`) instead of semantic roles — literal names break when brand colors change or when dark mode inverts meanings.
- Building a palette with too many unique colors — most products need 1-2 brand hues, plus semantic roles, plus neutrals. Everything else is noise.

**Debug tip:** Browser devtools color picker shows HSL values and lets you adjust hue/saturation/lightness live. Use it to explore your palette before writing code.

**Next:** Typography — how font choices, scale, and weight create visual hierarchy.

## Challenge: color_scale

Build a 3-step color scale using HSL.

```html
<div id="scale-demo">
  <div class="light-swatch"></div>
  <div class="mid-swatch"></div>
  <div class="dark-swatch"></div>
</div>
```

```css
#scale-demo {
  display: flex;
  gap: 0.5rem;
}
#scale-demo div {
  width: 60px;
  height: 60px;
  border-radius: 6px;
}
.light-swatch { background: hsl(200, 60%, 80%); }
.mid-swatch   { background: hsl(200, 60%, 50%); }
.dark-swatch  { background: hsl(200, 60%, 25%); }
```

```test
const swatches = document.querySelectorAll('#scale-demo div')
assert swatches.length === 3
const light = getComputedStyle(swatches[0]).backgroundColor
const mid   = getComputedStyle(swatches[1]).backgroundColor
const dark  = getComputedStyle(swatches[2]).backgroundColor
assert light !== mid && mid !== dark && light !== dark
assert light !== 'transparent' && mid !== 'transparent' && dark !== 'transparent'
const lightLum = light.match(/\d+/g).slice(0,3).reduce((a,b) => a + +b, 0)
const darkLum  = dark.match(/\d+/g).slice(0,3).reduce((a,b) => a + +b, 0)
assert lightLum > darkLum
assert getComputedStyle(swatches[0]).width === getComputedStyle(swatches[1]).width
```
