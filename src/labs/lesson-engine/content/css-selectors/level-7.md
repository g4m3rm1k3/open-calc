---
series: css-selectors
level: 7
title: Cascade Layers
lang: css
---

# Cascade Layers

The cascade determines which CSS rule wins when multiple rules target the same element with the same property. Until recently, the tools were specificity and source order — and managing them at scale meant careful naming conventions and constant specificity battles. `@layer` gives you a third tool: **explicit ordering**.

## What @layer Does

A cascade layer is a named bucket for CSS rules. Layers are ordered; rules in a higher-priority layer always win, regardless of specificity.

```css
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
}

@layer base {
  p { font-size: 1rem; color: #94a3b8; }
}

@layer components {
  .card p { font-size: 0.875rem; color: #64748b; }
}

@layer utilities {
  .text-white { color: white; }
}
```

```text
Layers are prioritised in the DECLARATION ORDER (last = highest priority).
utilities > components > base > reset, regardless of specificity.
```

**CS lens:** This is explicit prioritisation — you define the cascade order once at the top of your stylesheet, and the rest of the file respects it. No more counting IDs to figure out why a rule wins.

## The Problem @layer Solves

Without layers, a third-party CSS library can accidentally override your styles because its selectors have higher specificity. With layers, you put the library in a lower-priority layer and your code always wins:

```css
@layer framework, app;

@layer framework {
  @import url('bootstrap.css');  /* all bootstrap rules go here */
}

@layer app {
  /* Your styles ALWAYS win over framework — even with low specificity */
  .btn { background: #3b82f6; }
}
```

## Unlayered Styles Always Win

CSS that is not in any layer sits above all layers in the cascade. This makes it easy to write emergency overrides:

```css
@layer base { p { color: red; } }

/* This is NOT in a layer — it ALWAYS wins */
p { color: blue; }
```

## Nesting Layers

Layers can be nested for further organisation:

```css
@layer components {
  @layer button {
    .btn { padding: 8px 16px; }
  }
  @layer card {
    .card { border-radius: 8px; }
  }
}
```

**SE lens:** `@layer` is the CSS equivalent of import ordering in module bundlers. Just as webpack resolves module conflicts by controlling which import runs last, `@layer` controls which CSS rule wins by controlling layer order.

**Common mistakes:**
- Declaring layers with `@layer base, components` at the top but then writing rules *before* the declaration — the declaration order in the `@layer base, components` statement sets priority, not the physical position of rules in the file.
- Forgetting that unlayered CSS always beats layered CSS — if you add a rule outside any `@layer`, it wins over everything inside a layer, regardless of specificity.
- Confusing layer order with layer priority: the *last* declared layer in `@layer a, b, c` has the *highest* priority (`c` wins over `b` wins over `a`).

**Debug tip:** Chrome DevTools (as of 2022) shows cascade layers in the Styles panel — each rule is grouped under its layer name. You can see exactly which layer a rule belongs to and why it wins or loses.

**Next series:** CSS Box Model — how every element's size is calculated, what padding/margin/border actually do, and why `box-sizing: border-box` is the first rule in every professional stylesheet.

## Challenge: layers

Define two layers — `base` and `theme` — so that `theme` rules always win, even when `base` rules have higher specificity.

1. Declare layers in order: `base`, `theme` (so `theme` is higher priority)
2. In `@layer base`: set `color` of `#msg` to `rgb(148, 163, 184)` using an ID selector (`#msg`)
3. In `@layer base`: set `font-size` of `#msg` to `14px`
4. In `@layer theme`: set `color` of `.message` to `rgb(59, 130, 246)` using a class selector
5. In `@layer theme`: set `font-weight` of `.message` to `700`

The computed `color` must be blue (theme wins despite lower specificity) and `font-weight` must be `700`.

```html
<p id="msg" class="message">Which layer wins?</p>
```

```challenge
/* Declare layers so theme beats base */
@layer base, theme;

```

```test
var msg = document.querySelector('#msg')
var s = getComputedStyle(msg)
assert s.color === 'rgb(59, 130, 246)'
assert s.fontWeight === '700'
assert s.fontSize === '14px'
assert s.color !== 'rgb(148, 163, 184)'
```
