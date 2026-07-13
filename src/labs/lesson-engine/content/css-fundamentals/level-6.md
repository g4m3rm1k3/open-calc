---
series: css-fundamentals
level: 6
title: The Cascade
lang: css
---

# The Cascade

When two CSS rules target the same element and set the same property, something has to decide which one wins. That something is the **cascade** — the algorithm the browser uses to sort competing declarations and choose one. Cascade is not random; it is a deterministic priority system. Understanding it means never again wondering "why isn't my style applying?"

## The Four Cascade Layers (in priority order)

The cascade resolves conflicts by checking in order: origin & importance, specificity, then source order. Here two rules compete for the same `<p>` — they are from the same origin so specificity decides. `.note` (class, b=1) beats `p` (type, c=1).

```html
<p class="note">I have class="note" — the class rule wins over the type rule.</p>
<p>No class — only the type rule applies. Colour is slate.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* Type selector — lowest specificity */
p { color: #94a3b8; font-size: 16px; margin: 8px 0; }
/* Class selector — beats type when both apply */
.note { color: #818cf8; font-weight: 600; }
```

Higher cascade layers override lower layers completely. A more specific selector does not matter if `!important` from a different origin already won.

## Layer 1 — Origin

CSS rules come from three origins. Author styles (your stylesheet) beat browser defaults (user-agent). Here `.paragraph` overrides the browser's built-in `p { color: black; margin: 1em 0 }` without any special tricks — author rules simply win.

```html
<p class="paragraph">Author rule wins — overrides browser default black and margin.</p>
<h1 class="heading">Author rule also wins over browser's bold/2em default.</h1>
<a href="#" class="link">Author rule overrides browser's blue underline default.</a>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.paragraph { color: #6ee7b7; margin: 0 0 12px; font-size: 15px; }
.heading   { color: #818cf8; font-size: 1.5rem; font-weight: 500; margin: 0 0 12px; }
.link      { color: #f59e0b; text-decoration: none; font-size: 15px; }
```

For `!important` rules, the origin order **reverses** — user-agent `!important` beats author `!important`. This protects accessibility settings — if a user forces large fonts via their browser, no author stylesheet can override that preference.

## Layer 2 — Specificity

Within the same origin, specificity determines which selector wins. Specificity is a three-part score (a, b, c): `a` = IDs, `b` = classes/attributes/pseudo-classes, `c` = type selectors. The `#intro` rule here has a=1 and wins over all others.

```html
<p id="intro" class="note">What colour am I? — Orange, because #intro.note (1,1,0) wins.</p>
<p class="note">I have class="note" but no ID — green (0,1,0).</p>
<p>I have no class or ID — black type selector (0,0,1).</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
p              { color: #e2e8f0; margin: 8px 0; }     /* (0,0,1) */
.note          { color: #6ee7b7; }                     /* (0,1,0) */
#intro         { color: #f59e0b; }                     /* (1,0,0) */
#intro.note    { color: #fb923c; }                     /* (1,1,0) — wins */
```

Comparison is done left-to-right: a higher `a` always beats any `b` or `c`. Only if `a` is equal do you compare `b`, and only if both are equal do you compare `c`.

**CS lens:** Specificity is computed once per declaration and cached. The browser never "recalculates" it dynamically — it runs the cascade once during style recalculation, and the result is stored in the style structure. This is why CSS is generally performant even on large documents.

## Layer 3 — Source Order

When origin and specificity are equal, the **later** rule wins. Both rules below are type selectors (`p`) with the same specificity — the second one wins because it appears later in the stylesheet.

```html
<p>Both rules target me. The second one (blue) wins because it appears last.</p>
<p class="override">But a class selector beats both — specificity wins over source order.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
p { color: #f87171; margin: 8px 0; }  /* declared first — loses */
p { color: #60a5fa; }                  /* declared later — wins on source order */
.override { color: #6ee7b7; }          /* class > type — specificity beats source order */
```

This is why the order of your CSS rules matters. Rules for specific components at the bottom of the file will override general rules at the top — which is usually what you want.

## !important — Escaping the Cascade

`!important` bypasses the normal cascade priority and promotes a declaration to the highest priority within its origin. Here the `.error !important` rule wins even though `#special` has higher specificity normally.

```html
<p id="special" class="error">I should be red because .error uses !important — even though #special normally wins.</p>
<p class="error">Normal case — !important works here too.</p>
<p id="special">ID wins normally here — no !important to beat it.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
p { color: #e2e8f0; margin: 8px 0; }
#special { color: #6ee7b7; }                  /* (1,0,0) — normally wins */
.error   { color: #f87171 !important; }        /* !important — beats ID */
```

`!important` is not a tool to use regularly. It signals "this must always win" — a decision that creates future maintenance problems. Reserve it for utility classes that must always apply, and accessibility overrides.

## Practical Debugging

When a style is not applying, open DevTools → Elements → Styles. Losing rules appear struck through. Here three rules compete — look at the one that would be struck through in DevTools.

```html
<p id="debug-me" class="info">Open DevTools and select me to see which rules win and which are struck through.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* These three all target #debug-me — only one can win per property */
p        { color: #94a3b8; font-size: 14px; }        /* lowest — struck through */
.info    { color: #60a5fa; font-size: 16px; }        /* medium — font-size wins here */
#debug-me { color: #6ee7b7; }                         /* highest — color wins here */
```

The Computed panel shows the winning value; the Styles panel shows all competing rules, with losing ones struck through. This is the fastest path from "why isn't this working?" to "oh, that's why."

## Challenge: cascade_order

The HTML element `#message` has multiple rules competing for the same properties. Write rules so that:
1. A type selector `p` sets `color: black` and `font-size: 14px`
2. A class selector `.info` sets `color: blue` and `font-size: 16px`
3. The `#message` ID selector sets `color: green` — which should win due to higher specificity

The test verifies the computed result (what actually wins), not how many rules you wrote.

```html
<p id="message" class="info">Status message</p>
```

```challenge
p {

}

.info {

}

#message {

}
```

```test
var el = getComputedStyle(document.querySelector('#message'))
assert el.color === 'rgb(0, 128, 0)'   // #message (ID) wins over p and .info
assert el.color !== 'rgb(0, 0, 0)' && el.color !== 'rgb(0, 0, 255)'   // p's and .info's color lost
assert el.fontSize === '16px'   // .info (class) wins over p for font-size
assert el.fontSize !== '14px'   // p's font-size lost
```
