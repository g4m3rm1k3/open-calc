---
series: css-fundamentals
level: 1
title: Selectors — Type, Class & ID
lang: css
---

# Selectors — Type, Class & ID

A selector identifies which HTML elements a CSS rule applies to. The three fundamental selector types — type, class, and ID — cover the majority of everyday CSS. This lesson teaches each one, explains when to use each, and introduces the principle that selectors differ in **specificity** (which one wins when two rules conflict).

## Type Selectors

A type selector targets every element of a given HTML tag name:

```css
p {
  color: #374151;
  line-height: 1.6;
}

h2 {
  color: #1d4ed8;
  font-size: 24px;
}

a {
  color: #7c3aed;
}
```

```text
Every <p> — grey text, 1.6× line height
Every <h2> — blue text, 24px
Every <a> — purple text
```

Type selectors are broad. They apply to **all** elements of that type in the document. Use them for global baseline styles — the font used everywhere, the default colour of links, the margin on paragraphs.

## Class Selectors

A class selector targets every element that has a given `class` attribute. Classes start with `.`:

```css
.highlight {
  background-color: #fef08a;
  border-left: 4px solid #ca8a04;
  padding: 12px 16px;
}

.error-text {
  color: #dc2626;
  font-weight: bold;
}
```

```html
<p class="highlight">This paragraph is highlighted.</p>
<p>This paragraph is normal.</p>
<span class="error-text">Invalid input</span>
```

```text
Only the first <p> gets the yellow highlight.
Only the <span> gets the red bold text.
The second <p> is unstyled.
```

An element can have multiple classes: `class="highlight error-text"` applies both rules.

Classes are **reusable** — the same class can appear on any number of elements across the page. They are the primary tool for component-level styling.

## ID Selectors

An ID selector targets the single element with a given `id` attribute. IDs start with `#`:

```css
#site-header {
  background-color: #0f172a;
  color: white;
  padding: 24px;
}

#main-content {
  max-width: 800px;
  margin: 0 auto;
}
```

```html
<header id="site-header">UpskillOS</header>
<main id="main-content">...</main>
```

An `id` must be unique per page — only one element should ever have a given ID. Because of this, ID selectors are high-specificity but low-reusability.

**SE lens:** In modern CSS, most developers avoid ID selectors for styling (preferring classes) because IDs have very high specificity, making them hard to override later. Reserve `id` attributes for JavaScript targeting and page anchors.

## Combining Selectors

Multiple selectors can share the same declarations using a comma:

```css
h1, h2, h3 {
  font-family: 'Georgia', serif;
  color: #1e3a5f;
}
```

This is identical to three separate rules with the same declarations — just shorter.

## Specificity Intro

When two rules target the same element and set the same property, the one with higher **specificity** wins:

```css
p            { color: black; }   /* type selector — lowest specificity */
.note        { color: blue;  }   /* class selector — medium specificity */
#intro       { color: red;   }   /* ID selector — high specificity */
```

```html
<p id="intro" class="note">What colour am I?</p>
```

```text
Red — #intro wins because ID specificity outranks class, which outranks type.
```

The specificity ranking: **ID > class > type**. The full specificity system is covered in its own lesson (Level 8). For now: if a style isn't applying, a more specific rule is probably overriding it.

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
```
