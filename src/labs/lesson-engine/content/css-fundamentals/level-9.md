---
series: css-fundamentals
level: 9
title: Reading & Debugging CSS
lang: css
---

# Reading & Debugging CSS

Knowing how to write CSS is not enough. Knowing how to read it — and how to diagnose why it is not working — is equally important. This lesson teaches the DevTools workflows that experienced developers use every day and the patterns behind common CSS bugs.

## The Browser's DevTools — Styles Panel

Open DevTools (F12), select any element, and look at the Styles panel on the right. Rules that **lost the cascade** appear struck through. Rules that **won** show their applied values. Click any value to edit it live.

```html
<p id="loser">Three rules compete for my color — only one wins. The others appear struck through in DevTools.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* These three all target #loser */
p         { color: #94a3b8; }    /* (0,0,1) — struck through in DevTools */
.loser    { color: #60a5fa; }    /* (0,1,0) — struck through in DevTools */
#loser    { color: #6ee7b7; }    /* (1,0,0) — WINS — shown at top in DevTools */
```

Right-click the element and choose "Inspect". The Styles panel shows all matching rules, most-specific first. The Computed panel shows the final, resolved value for every property.

## Bug 1: A Rule That Is Not Applying

The most common bug. Three causes: higher specificity is overriding it, a typo makes the value invalid, or the selector doesn't match. Here `.highlight` is overridden by `#msg` — see the orange applied, not yellow.

```html
<p id="msg" class="highlight">I should be yellow (.highlight) but #msg wins — ID beats class.</p>
<p class="highlight">I have no ID — yellow highlight applies correctly.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.highlight { background-color: #713f12; color: #fef08a; padding: 12px; border-radius: 6px; margin: 8px 0; }
/* Higher specificity — overrides .highlight on #msg */
#msg { background-color: #7c2d12; color: #fb923c; }
```

**Debug steps:** Open DevTools Styles → find your property struck through → look at what's above it → check its selector and specificity.

## Bug 2: An Inherited Value Is Applying Unexpectedly

When a child element has an unwanted style, it may be inheriting from a parent. Here `.inner` inherits `color` from `.outer` even though no rule directly targets `.inner`.

```html
<div class="outer">
  Outer text is crimson (direct rule)
  <div class="inner">
    Inner text — I inherit crimson from .outer. No rule targets me directly.
  </div>
  <div class="inner reset">
    Inner reset — color: initial restores to spec default (black).
  </div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.outer { color: #f87171; background: #1e293b; padding: 20px; border-radius: 8px; }
.inner { background: #0f172a; padding: 12px; border-radius: 6px; margin-top: 8px; }
.reset { color: initial; }
```

**Fix:** In DevTools Computed panel → expand the property → "Inherited from .outer" tells you the source. Set the property explicitly to `initial`, `unset`, or a specific value on the child.

## Bug 3: Margin Collapse Surprise

Adjacent vertical margins collapse into one — the larger wins. This surprises every developer at least once. The gap between the two cards below is 24px (the larger), not 48px (24+24).

```html
<div class="card" id="card1">Card 1 — margin-bottom: 24px</div>
<div class="card" id="card2">Card 2 — margin-top: 24px — gap is only 24px, not 48px</div>
<div class="no-collapse">
  <div class="card">Wrapped in flex — collapse prevented, gap is 48px</div>
  <div class="card">Both margins apply independently</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.card { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 6px; margin: 24px 0; font-size: 14px; }
.no-collapse { display: flex; flex-direction: column; margin-top: 24px; }
```

**Fix:** Wrap elements in a flex or grid container to prevent margin collapse, or use padding instead of margin.

## Bug 4: Element Not Visible or Has No Size

Four common causes — all visible here in one demo. Each box demonstrates a different invisibility scenario.

```html
<div id="vis-none">display: none — completely removed from layout, takes no space</div>
<div id="vis-hidden">visibility: hidden — space reserved, content invisible</div>
<div id="zero-size">width: 0 — takes no space (overflow: hidden clips content)</div>
<div id="same-color">color and background-color are both white — text is invisible</div>
<div id="working">This one is fine — all properties set correctly</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
div { padding: 12px; border-radius: 6px; margin: 8px 0; font-size: 14px; min-height: 20px; }
#vis-none    { display: none; background: #1e293b; color: #f87171; }
#vis-hidden  { visibility: hidden; background: #1e293b; color: #f87171; height: 44px; }
#zero-size   { width: 0; overflow: hidden; background: #713f12; color: #fef08a; white-space: nowrap; }
#same-color  { background: white; color: white; border: 1px solid #334155; }
#working     { background: #064e3b; color: #6ee7b7; }
```

Open DevTools to inspect `#vis-none` — it won't appear in the rendered output but you can find it in the HTML tree.

## The Cascade Debugging Checklist

When a style is not applying, work through this checklist in order. Here the element has a wrong style — walk through each step.

```html
<div id="debug-target" class="styled-box">
  Debug target — supposed to be blue but something is wrong. Open DevTools and follow the checklist.
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* Step 1: Is the selector matching? → Yes, #debug-target exists */
.styled-box { color: #60a5fa; background: #1e293b; padding: 16px; border-radius: 8px; font-size: 14px; }
/* Step 2: Is a higher-specificity rule overriding it? → Yes, this ID rule wins */
#debug-target { color: #f87171; }
/* Step 3: Is the value valid? → coloR is invalid — browser ignores it silently */
#debug-target { coloR: #6ee7b7; }
```

The DevTools Styles panel shows a yellow ⚠ icon next to `coloR` — unknown property. That's your cue for step 3 in the checklist: typo.

## Reading Someone Else's CSS

When you open a codebase you did not write, start at `:root`. The variable names tell you the intent of every colour and spacing value — the whole design system in one block.

```html
<div class="existing-card">
  <span class="existing-badge">New</span>
  <p>This card uses the existing design system. Read :root to understand all the values before editing.</p>
  <button class="existing-btn">Action</button>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* Start here when reading this codebase */
:root {
  --brand: #6366f1;
  --surface: #1e293b;
  --text: #e2e8f0;
  --muted: #64748b;
  --radius: 10px;
  --space: 1rem;
}
.existing-card { background: var(--surface); padding: var(--space); border-radius: var(--radius); }
.existing-badge { display: inline-block; background: var(--brand); color: white; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
.existing-card p { color: var(--text); line-height: 1.6; font-size: 14px; margin: 8px 0; }
.existing-btn { background: var(--brand); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
```

Never edit until you understand what you are editing. Changing one rule can cascade to dozens of elements.

## Challenge: debugging_scenario

The HTML and CSS below have a deliberate bug: the `.message` element should be green, but something is overriding it. Fix the CSS so the element's text colour is `rgb(22, 163, 74)` (green) and `font-size` is `1rem` (16px).

You can add, change, or remove any rule — but you must use at least one selector.

```html
<div id="container">
  <p class="message">Status: OK</p>
</div>
```

```challenge
#container p {
  color: rgb(220, 38, 38); /* red — this should lose */
  font-size: 0.875rem;
}

/* Fix the cascade so .message is green at 16px */

```

```test
var el = getComputedStyle(document.querySelector('.message'))
assert el.color === 'rgb(22, 163, 74)'   // green wins
assert el.color !== 'rgb(220, 38, 38)'   // the buggy red rule no longer applies
assert el.fontSize === '16px'
assert el.fontSize !== '14px'   // the buggy 0.875rem no longer applies
```
