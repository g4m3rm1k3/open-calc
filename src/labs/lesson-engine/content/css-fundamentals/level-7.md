---
series: css-fundamentals
level: 7
title: Specificity Deep Dive
lang: css
---

# Specificity Deep Dive

Specificity is the most misunderstood part of CSS. Level 6 introduced the basics. This lesson covers the full system: how to calculate specificity precisely, what `:is()`, `:not()`, `:has()`, and `:where()` contribute, and how to write CSS that does not fight itself.

## The Full Calculation

Specificity is a three-column score **(a, b, c)**: `a` = ID selectors, `b` = class/attribute/pseudo-class selectors, `c` = type selectors/pseudo-elements. The universal selector `*` and combinators contribute zero. See how the scores change as selectors grow more complex.

```html
<div id="outer" class="container">
  <p class="text" id="para">Which rule wins on me? — The last one with (1,1,1).</p>
  <span class="text">I only match the class rule — (0,1,0).</span>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* (0,0,1) — type */
p             { color: #94a3b8; }
/* (0,1,0) — class */
.text         { color: #60a5fa; }
/* (0,1,1) — class + type */
p.text        { color: #6ee7b7; }
/* (1,0,0) — ID */
#para         { color: #f59e0b; }
/* (1,1,1) — ID + class + type — wins */
p#para.text   { color: #818cf8; font-weight: 700; }
span          { font-size: 15px; }
```

Comparison is lexicographic: `(1,0,0)` beats `(0,99,99)`. There is no overflow — 256 class selectors do not add up to one ID.

## Pseudo-Classes and Specificity

Most pseudo-classes count as class selectors (b=1). Compare how `:hover` and `:nth-child` add to the score and how that affects which rule wins.

```html
<ul class="nav">
  <li class="item">Item 1 — class (0,1,0)</li>
  <li class="item">Item 2 — :nth-child adds (0,1,0) each</li>
  <li class="item active">Item 3 — .active is (0,1,0); combined: (0,2,1)</li>
  <li class="item">Item 4 — hover me to see :hover add (0,1,0)</li>
</ul>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.nav { list-style: none; padding: 0; margin: 0; }
.item          { padding: 10px 16px; color: #94a3b8; border-bottom: 1px solid #1e293b; }
.item:nth-child(2) { color: #60a5fa; }   /* (0,2,1) — class + pseudo-class + type */
.item.active   { color: #6ee7b7; font-weight: 600; }  /* (0,2,1) — two classes + type */
.item:hover    { color: #f59e0b; background: #1e293b; }  /* (0,2,1) */
```

## :is(), :not(), :has() — They Take Their Argument's Specificity

These three functional pseudo-classes use the **specificity of the most specific argument** inside them — a common surprise. Try changing `:is(#header, .nav)` to `:is(.nav)` to see the specificity drop from (1,0,0) to (0,1,0).

```html
<nav id="header" class="nav">
  <a href="#" class="link">Link inside #header.nav — :is(#header, .nav) a has specificity (1,0,1)</a>
</nav>
<div class="nav">
  <a href="#" class="link">Link inside .nav only — same :is() rule still applies with ID-level specificity</a>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.nav { background: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 12px; }
/* (1,0,1) — #header inside :is() contributes a=1, `a` type selector adds c=1 */
:is(#header, .nav) a { color: #818cf8; text-decoration: none; font-weight: 600; }
/* Try overriding with a plain class — it loses to the ID-level specificity above */
.link { color: #f87171; }
```

This is a common surprise: `:is(h1, #title)` has specificity `(1,0,0)` everywhere it is used, even when matching an `h1`.

## :where() — Zero Specificity

`:where()` matches the same elements as `:is()` but contributes **zero** specificity — making it trivially easy to override. This is the standard tool for library and framework base styles.

```html
<section>
  <h1>Heading styled by :where() — (0,0,0) specificity</h1>
  <h2>Also :where() — any class overrides it</h2>
  <h2 class="special">Override with .special (0,1,0) — easily beats :where()</h2>
</section>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* Zero specificity — any other selector beats this */
:where(h1, h2, h3) {
  font-weight: bold;
  color: #64748b;
  margin: 8px 0;
}
/* (0,1,0) — easily overrides :where() */
.special {
  color: #818cf8;
  font-size: 1.25rem;
}
```

`:where()` is the standard tool for library and framework CSS. Wrap your selectors in `:where()` and users can always override your styles without fighting specificity.

## !important Revisited

`!important` is not a specificity score — it is a separate flag. When two `!important` declarations compete, specificity breaks the tie between them. Here both rules use `!important`, so the class `(0,1,0)` beats the type `(0,0,1)` within the `!important` layer.

```html
<p class="note">I match both rules — both !important. Class (0,1,0) beats type (0,0,1) within !important layer.</p>
<p>I only match the type rule — red !important.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
p     { color: #f87171 !important; margin: 8px 0; }       /* !important + (0,0,1) */
.note { color: #60a5fa !important; font-weight: 600; }    /* !important + (0,1,0) — wins */
```

## The Specificity War — A Design Smell

When you find yourself writing `#main #content .card .title span` to override a style, something has gone wrong. Each override requires a more specific selector. The fix is to flatten the selectors and use classes.

```html
<div id="hero">
  <div class="featured">
    <div class="card">
      <span class="card-title war-title">Specificity war — deeply nested selectors</span>
    </div>
  </div>
</div>
<span class="card-title--flat">Flat BEM class — no nesting needed</span>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
/* The war starts */
.card .card-title              { color: #60a5fa; }   /* (0,2,0) */
.featured .card .card-title    { color: #f59e0b; }   /* (0,3,0) */
#hero .featured .card .card-title { color: #f87171; } /* (1,2,0) — wins the war */
.war-title                     { display: block; margin-bottom: 16px; font-weight: 600; }
/* Flat and manageable */
.card-title--flat { display: block; color: #6ee7b7; font-weight: 600; }
```

**SE lens:** High-specificity selectors create coupling between HTML structure and CSS. If you rename or restructure the HTML, the CSS breaks. Flat class selectors are independent of structure — the core motivation behind BEM naming.

## Layers — The Modern Specificity Solution

CSS `@layer` (2022) lets you group rules into named layers with controlled priority. Rules in a later-declared layer win over earlier layers **regardless of specificity**. A class in `utilities` beats an ID in `base`.

```html
<p id="output" class="text-red">I am styled by two @layer rules — which wins?</p>
<p class="text-red">Same class, no ID — utilities (later layer) wins.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
@layer base, utilities;

@layer base {
  #output { color: #64748b; }     /* ID selector (1,0,0) inside 'base' */
  p       { font-size: 15px; margin: 8px 0; }
}

@layer utilities {
  .text-red { color: #f87171; }   /* class (0,1,0) inside 'utilities' — later layer wins */
}
```

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
assert el.color === 'rgb(220, 38, 38)'   // #output rule wins
assert el.color !== 'rgb(0, 0, 255)'   // p's blue lost
assert el.color !== 'rgb(0, 128, 0)'   // .info's green lost
assert el.fontSize === '15px'   // unrelated cascade-layer rule still applies
```
