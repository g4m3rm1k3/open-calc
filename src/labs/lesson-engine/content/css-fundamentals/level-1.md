---
series: css-fundamentals
level: 1
title: Selectors — Type, Class & ID
lang: css
---

# Selectors — Type, Class & ID

A selector identifies which HTML elements a CSS rule applies to. The three fundamental selector types — type, class, and ID — cover the majority of everyday CSS. This lesson teaches each one, explains when to use each, and introduces the principle that selectors differ in **specificity** (which one wins when two rules conflict).

## Type Selectors

A type selector targets every element of a given HTML tag name. Here one rule sets all `<p>` elements grey, another sets all `<h2>` blue, and another sets all `<a>` purple. Edit any rule to change every element of that type at once.

```html
<h2>Section heading</h2>
<p>First paragraph — grey text, 1.6× line height.</p>
<p>Second paragraph — same rule applies to both.</p>
<a href="#">A link — purple</a>
```

```css
body { background: #0f172a; padding: 24px; }
p {
  color: #94a3b8;
  line-height: 1.6;
  font-family: system-ui;
}
h2 {
  color: #60a5fa;
  font-size: 1.5rem;
  font-family: system-ui;
}
a {
  color: #a78bfa;
  font-family: system-ui;
}
```

Type selectors are broad — they apply to **all** elements of that type. Use them for global baseline styles: the font everywhere, the default colour of links, the margin on paragraphs.

## Class Selectors

A class selector targets every element that has a given `class` attribute. Classes start with `.`. An element can have multiple classes and the same class can appear on any number of elements — this is what makes classes the primary tool for component-level styling.

```html
<p class="highlight">This paragraph is highlighted.</p>
<p>This paragraph is normal — no class, no highlight.</p>
<span class="error-text">Invalid input</span>
<p class="highlight error-text">Both classes applied at once.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
p, span { color: #e2e8f0; margin: 8px 0; }
.highlight {
  background-color: #713f12;
  border-left: 4px solid #f59e0b;
  padding: 12px 16px;
  border-radius: 4px;
}
.error-text {
  color: #fca5a5;
  font-weight: bold;
}
```

## ID Selectors

An ID selector targets the single element with a given `id` attribute. IDs start with `#`. An `id` must be unique per page — only one element should ever have a given ID. Because of this, ID selectors are high-specificity but low-reusability.

```html
<header id="site-header">UpskillOS</header>
<main id="main-content">
  <p>Content here is constrained to 600px wide and centred.</p>
</main>
```

```css
body { background: #0f172a; padding: 0; font-family: system-ui; margin: 0; }
#site-header {
  background-color: #1e293b;
  color: #f1f5f9;
  padding: 24px;
  font-size: 1.25rem;
  font-weight: 700;
}
#main-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  color: #94a3b8;
}
```

**SE lens:** In modern CSS, most developers avoid ID selectors for styling (preferring classes) because IDs have very high specificity, making them hard to override later. Reserve `id` attributes for JavaScript targeting and page anchors.

## Combining Selectors

Multiple selectors can share the same declarations using a comma. All three headings get the same font-family and colour with one rule instead of three.

```html
<h1>H1 heading</h1>
<h2>H2 heading</h2>
<h3>H3 heading</h3>
<p>A paragraph — not targeted by the heading rule</p>
```

```css
body { background: #0f172a; padding: 24px; }
h1, h2, h3 {
  font-family: Georgia, serif;
  color: #c7d2fe;
}
p {
  font-family: system-ui;
  color: #94a3b8;
}
```

## Specificity Intro

When two rules target the same element and set the same property, the one with higher **specificity** wins. Here three rules compete for the same `<p>` — the ID selector wins because ID specificity outranks class, which outranks type.

```html
<p id="intro" class="note">What colour am I? — Red, because #intro wins.</p>
<p class="note">I have only class="note" — so I am blue.</p>
<p>I have no class or ID — so I am black.</p>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
p            { color: #e2e8f0; }   /* type selector — lowest */
.note        { color: #60a5fa; }   /* class selector — medium */
#intro       { color: #f87171; }   /* ID selector — highest */
```

The specificity ranking: **ID > class > type**. The full specificity system is covered in its own lesson (Level 7). For now: if a style isn't applying, a more specific rule is probably overriding it.

**CS lens:** Specificity is a sorting function the browser's CSS cascade applies before choosing which declaration to use. It computes a three-part score (a, b, c) where `a` counts IDs, `b` counts classes and attributes, and `c` counts type selectors. Higher scores beat lower scores. This is deterministic — given the same stylesheet, every browser produces the same result.

## Challenge: selector_types

The HTML below has three elements. Write CSS so that:
1. The `<h1>` has `color: #1d4ed8` (blue)
2. The element with class `"card"` has `background-color: #f0f9ff`
3. The element with id `"cta"` has `background-color: #0ea5e9` (sky blue)

Use a type selector for the `<h1>`, a class selector for `.card`, and an ID selector for `#cta`.

```html
<h1>Welcome</h1>
<div class="card" style="padding:16px;">Card content</div>
<button id="cta" style="padding:12px 24px;border:none;cursor:pointer;">Sign Up</button>
```

```challenge
/* h1 — type selector */

/* .card — class selector */

/* #cta — ID selector */

```

```test
var h1 = document.querySelector('h1')
var card = document.querySelector('.card')
var cta = document.querySelector('#cta')
assert getComputedStyle(h1).color === 'rgb(29, 78, 216)'
assert getComputedStyle(card).backgroundColor === 'rgb(240, 249, 255)'
assert getComputedStyle(cta).backgroundColor === 'rgb(14, 165, 233)'
assert getComputedStyle(card).backgroundColor !== getComputedStyle(cta).backgroundColor   // targeted independently
