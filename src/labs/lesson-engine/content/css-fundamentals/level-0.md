---
series: css-fundamentals
level: 0
title: What CSS Is
lang: css
---

# What CSS Is

HTML describes **what** is on the page — headings, paragraphs, links, images. CSS describes **how** those things look — their colour, size, spacing, and position. Without CSS, every browser would render the same default black-text-on-white-background page for every website on the internet. CSS is the layer that gives the web its visual identity.

## A Rule

CSS is made of **rules**. Each rule says: "find these elements, and apply these styles to them."

```css
p {
  color: blue;
  font-size: 18px;
}
```

```text
Every <p> element on the page now has blue text at 18 pixels.
```

A rule has two parts:
- **Selector** — `p` — identifies which elements to target
- **Declaration block** — `{ color: blue; font-size: 18px; }` — the styles to apply

Inside the block, each line is a **declaration**:
- `color: blue;` — the **property** (`color`) and the **value** (`blue`), separated by a colon, ended with a semicolon
- `font-size: 18px;` — another declaration

**CS lens:** CSS is declarative — you describe the desired outcome, not the steps to achieve it. The browser's rendering engine (layout engine) reads your rules and decides how to apply them. You never tell the browser "loop through all paragraphs and set their color" — you describe the end state and the browser handles the rest.

## Connecting CSS to HTML

There are three ways to deliver CSS to a browser:

```html
<!-- 1. External stylesheet (recommended) -->
<link rel="stylesheet" href="styles.css">

<!-- 2. Style block in the document -->
<style>
  p { color: blue; }
</style>

<!-- 3. Inline style on an element -->
<p style="color: blue;">Hello</p>
```

The external stylesheet (`<link>`) is what professional projects use. The styles live in a separate `.css` file, so one stylesheet can control thousands of pages. The `<style>` block is common in small demos and prototypes. Inline styles are the last resort — they mix presentation with structure and are hard to maintain.

**SE lens:** Separating CSS from HTML is the same principle as separating concerns in any software system. The HTML file describes content (what); the CSS file describes presentation (how). You can redesign the entire look of a site by swapping one CSS file without touching a single HTML file.

## Properties and Values

A property is a visual attribute the browser understands. A value is a valid setting for that property.

```css
h1 {
  color: crimson;
  background-color: #f0f4ff;
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  padding: 16px;
}
```

```text
color: crimson          — text colour (named colour)
background-color: #f0f4ff — background fill (hex colour)
font-size: 32px         — text height in pixels
font-weight: bold       — thickness of the text strokes
text-align: center      — horizontal alignment within the element
padding: 16px           — space between the text and the element's edges
```

CSS has hundreds of properties. Learning CSS is not memorising them all — it is building a mental model of which category of property to reach for, then looking up the exact syntax.

## The Browser's Default Stylesheet

Before you write a single line of CSS, the browser already applies its own styles. These are called **user-agent styles** or **browser defaults**.

```text
<h1>  → font-size: 2em; font-weight: bold; margin: 0.67em 0
<p>   → display: block; margin-top: 1em; margin-bottom: 1em
<a>   → color: #0000ee; text-decoration: underline
<ul>  → list-style-type: disc; padding-left: 40px
```

Every style you write either adds to or **overrides** these defaults. When a CSS property behaves unexpectedly, checking the browser's DevTools "Computed" panel shows you which rule is actually applying — your rule, a browser default, or something inherited.

**CS lens:** The browser's default stylesheet is a real CSS file. In Chromium it is called `html.css`; in Firefox, `html.css` and `forms.css`. Many professional projects start by applying a **CSS reset** — a short stylesheet that zeroes out browser defaults so every browser starts from the same baseline.

## Challenge: first_rule

The HTML below has a `<div id="target">` element. Write a CSS rule that:
1. Makes the background colour of `#target` `steelblue`
2. Sets the text colour to `white`
3. Sets the padding to `20px`

Your CSS can use any valid selector that targets the element — `#target`, `div`, or anything else. The test checks the computed result, not your implementation.

```html
<div id="target">Hello, CSS</div>
```

```challenge
/* Write your CSS rule below */

```

```test
var el = document.querySelector('#target')
var s = getComputedStyle(el)
assert s.backgroundColor === 'rgb(70, 130, 180)'
assert s.color === 'rgb(255, 255, 255)'
assert s.paddingTop === '20px'
```
