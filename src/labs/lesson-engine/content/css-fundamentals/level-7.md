---
series: css-fundamentals
level: 7
title: Specificity Deep Dive
lang: css
---

# Specificity Deep Dive

Specificity is the most misunderstood part of CSS. Level 6 introduced the basics. This lesson covers the full system: how to calculate specificity precisely, what the `:is()`, `:not()`, `:has()`, and `:where()` pseudo-classes contribute, why the "specificity war" is a design smell, and how to write CSS that does not fight itself.

## The Full Calculation

Specificity is a three-column score: **(a, b, c)** where:

```text
a = ID selectors                  #header → (1,0,0)
b = class, attribute, pseudo-class .card, [type="text"], :hover → (0,1,0) each
c = type selector, pseudo-element  div, p, ::before → (0,0,1) each
```

The universal selector `*` and combinators (`>`, `+`, `~`, ` `) contribute **zero** to specificity.

```css
*                  /* (0,0,0) */
p                  /* (0,0,1) */
div p              /* (0,0,2) — two type selectors */
.card              /* (0,1,0) */
.card p            /* (0,1,1) */
.card .title       /* (0,2,0) */
#header            /* (1,0,0) */
#header .nav a     /* (1,1,1) */
a:hover            /* (0,1,1) — :hover is a pseudo-class (b) */
::before           /* (0,0,1) — pseudo-element (c) */
```

Comparison is lexicographic: `(1,0,0)` beats `(0,99,99)`. There is no overflow — 256 class selectors do not add up to one ID.

## Pseudo-Classes and Specificity

Most pseudo-classes count as class selectors (b=1):

```css
:hover          /* (0,1,0) */
:focus          /* (0,1,0) */
:nth-child(2)   /* (0,1,0) */
:not(.active)   /* (0,1,0) — the :not() itself is 0; .active inside adds (0,1,0) */
:is(.nav, a)    /* takes the highest specificity of its argument list */
:where(.nav, a) /* always (0,0,0) — specificity escape hatch */
:has(> img)     /* (0,0,1) — img is a type selector inside :has() */
```

## :is(), :not(), :has() — They Take Their Argument's Specificity

These three "functional pseudo-classes" use the **specificity of the most specific argument** inside them:

```css
:is(#header, .nav, p) a  /* (1,0,1) — #header gives a=1 */
:not(#header)            /* (1,0,0) — #header contributes a=1 */
:has(#logo)              /* (1,0,0) — #logo contributes a=1 */
```

This is a common surprise: `:is(h1, #title)` has specificity `(1,0,0)` everywhere it is used, even when matching an `h1`.

## :where() — Zero Specificity

`:where()` matches the same elements as `:is()` but contributes **zero** specificity:

```css
:where(#header, .nav, p) a  /* (0,0,1) — only the `a` counts */
```

This is the standard tool for library and framework CSS. If you write a utility class library and want users to easily override your styles, wrap your selectors in `:where()`:

```css
/* Easy to override — (0,0,0) specificity */
:where(h1, h2, h3) {
  font-weight: bold;
}

/* Hard to override — (0,0,3) */
h1, h2, h3 {
  font-weight: bold;
}
```

## !important Revisited

`!important` is not a specificity score — it is a separate flag that takes priority over all non-`!important` declarations. When two `!important` declarations compete, specificity breaks the tie between them. This is the only time specificity matters inside the `!important` layer.

```css
p { color: blue !important; }       /* wins over any non-!important rule */
.note { color: red !important; }    /* .note (0,1,0) vs p (0,0,1): .note wins */
```

## The Specificity War — A Design Smell

When you find yourself writing `#main #content .card .title span` to override a style, something has gone wrong:

```css
/* The war starts here */
.card .title { color: blue; }       /* (0,2,0) */
.featured .card .title { color: red; } /* (0,3,0) */
#hero .featured .card .title { color: green; } /* (1,2,0) */
```

Each override requires a more specific selector. The fix is to flatten the selectors and use classes:

```css
/* Flat and manageable */
.card-title        { color: blue; }
.card-title--featured { color: red; }
.card-title--hero  { color: green; }
```

**SE lens:** High-specificity selectors create coupling between HTML structure and CSS. If you rename or restructure the HTML, the CSS breaks. Flat class selectors are independent of structure. This is the core motivation behind BEM (Block–Element–Modifier) naming, covered in the Professional CSS series.

## Layers — The Modern Specificity Solution

CSS `@layer` (2022) lets you group rules into named layers with controlled priority:

```css
@layer base, components, utilities;

@layer base {
  p { color: black; }          /* (0,0,1) inside 'base' layer */
}

@layer utilities {
  .text-red { color: red; }   /* wins over 'base' even at (0,1,0) */
}
```

Rules in a later-declared layer win over earlier layers, **regardless of specificity**. A class in `utilities` beats an ID in `base`. Cascade layers are covered in depth in the Professional CSS series.

## Challenge: specificity_calculation

Write three rules targeting the `#output` element. The test checks that the element's colour is `rgb(220, 38, 38)` — red. That means the red rule must have the highest specificity.

Requirements:
- One rule must use only a type selector (`p`) with `color: blue`
- One rule must use a class selector (`.info`) with `color: green`
- One rule must target `#output` (or use `#output` within a compound selector) with `color: rgb(220, 38, 38)` — this must win

```html
<p id="output" class="info">Which colour wins?</p>
```

```challenge
p {

}

.info {

}

/* The winning rule — must target #output */

```

```test
var el = getComputedStyle(document.querySelector('#output'))
assert el.color === 'rgb(220, 38, 38)'
```
