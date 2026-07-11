---
series: css-selectors
level: 7
title: Cascade Layers
lang: css
---

# Cascade Layers

`@layer` gives you explicit control over the cascade. Rules in a higher-priority layer always win — regardless of specificity. This ends specificity battles at scale.

## The problem — specificity fights

Without layers, a class selector in a library can lose to an ID in your code, or win unexpectedly when you least want it. See the specificity battle play out and imagine managing hundreds of these.

```html
<p id="msg" class="highlight">Who wins? ID (#msg) vs class (.highlight)?</p>
<p id="note">Higher specificity always wins without layers — even if it is the wrong rule.</p>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
.highlight { color: #10b981; font-weight: 600; }
#msg { color: #ef4444; }  /* ID beats class — specificity 1-0-0 vs 0-1-0 */
#note { color: #94a3b8; font-size: 13px; margin-top: 8px; }
```

**CS lens:** `@layer` is explicit prioritisation. You define the cascade order once at the top; the rest of the file respects it. No more counting IDs to figure out why a rule wins.

## @layer — declare order, rules always follow

Layers declared last have highest priority. `theme` wins over `base` even when `base` uses an ID and `theme` uses a class. Edit the layer order declaration and see the winner change.

```html
<p id="layered" class="message">I am styled by layers. Theme (class) wins over Base (ID).</p>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
@layer base, theme;

@layer base {
  #layered { color: #ef4444; font-size: 14px; }  /* ID selector — high specificity */
}

@layer theme {
  .message { color: #3b82f6; font-weight: 700; } /* class — lower specificity but higher LAYER */
}
```

## Framework layers — your code always wins

Put a third-party library in a lower layer so your styles always override it, regardless of its selectors' specificity.

```html
<button class="btn">
  Button — framework sets grey, app layer overrides to blue
</button>
<p class="text-muted">Muted text — framework base sets grey, unchanged</p>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
@layer framework, app;

@layer framework {
  .btn        { background: #334155; color: #94a3b8; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
  .text-muted { color: #64748b; }
}

@layer app {
  .btn { background: #3b82f6; color: white; font-weight: 600; } /* always wins over framework */
}
```

## Unlayered styles always beat all layers

CSS not inside any `@layer` sits above all layers. Use it for emergency overrides or critical rules.

```html
<p id="el" class="styled">This element is styled by a layer, but the unlayered rule wins.</p>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
@layer base {
  .styled { color: #ef4444; font-size: 18px; }  /* inside a layer */
}

/* NOT in any layer — always wins regardless of specificity */
#el { color: #10b981; }
```

**SE lens:** `@layer` is the CSS equivalent of import ordering in module bundlers. Just as webpack resolves module conflicts by controlling which import runs last, `@layer` controls which CSS rule wins by controlling layer order.

**Common mistakes:**
- Declaring layers with `@layer base, components` then writing rules before the declaration — the declaration order in the `@layer` statement sets priority.
- Forgetting that unlayered CSS always beats layered CSS — if you add a rule outside any `@layer`, it wins over everything inside a layer.
- Confusing layer order with priority: the *last* declared layer has the *highest* priority (`@layer a, b, c` — `c` wins).

**Debug tip:** Chrome DevTools (as of 2022) shows cascade layers in the Styles panel — each rule is grouped under its layer name. You can see exactly which layer a rule belongs to and why it wins or loses.

**Next series:** CSS Box Model — how every element's size is calculated, what padding/margin/border actually do, and why `box-sizing: border-box` is the first rule in every professional stylesheet.

## Challenge: layers

Define two layers — `base` and `theme` — so that `theme` rules always win even when `base` rules have higher specificity.

1. Declare layers in order: `base`, `theme`
2. In `@layer base`: set `color` of `#msg` to `rgb(148, 163, 184)` using an ID selector
3. In `@layer base`: set `font-size` of `#msg` to `14px`
4. In `@layer theme`: set `color` of `.message` to `rgb(59, 130, 246)` using a class selector
5. In `@layer theme`: set `font-weight` of `.message` to `700`

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
