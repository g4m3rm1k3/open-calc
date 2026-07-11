---
series: css-fundamentals
level: 0
title: What CSS Is
lang: css
---

# What CSS Is

HTML describes **what** is on the page — headings, paragraphs, links, images. CSS describes **how** those things look — their colour, size, spacing, and position. Without CSS, every browser would render the same default black-text-on-white-background page for every website on the internet. CSS is the layer that gives the web its visual identity.

## A Rule

CSS is made of **rules**. Each rule says: "find these elements, and apply these styles to them." Here a single rule turns every `<p>` blue at 18px. Edit the values and watch the paragraph update live.

```html
<p>Every paragraph on the page now has blue text at 18 pixels.</p>
<p>This paragraph gets the same rule — selectors are broad.</p>
```

```css
body { background: #0f172a; padding: 24px; }
p {
  color: #60a5fa;
  font-size: 18px;
  font-family: system-ui;
}
```

A rule has two parts:
- **Selector** — `p` — identifies which elements to target
- **Declaration block** — `{ color: #60a5fa; font-size: 18px; }` — the styles to apply

Inside the block, each line is a **declaration**: a **property** and a **value**, separated by a colon, ended with a semicolon.

**CS lens:** CSS is declarative — you describe the desired outcome, not the steps to achieve it. The browser's rendering engine reads your rules and decides how to apply them. You never tell the browser "loop through all paragraphs and set their color" — you describe the end state and the browser handles the rest.

## Connecting CSS to HTML

There are three ways to deliver CSS to a browser. The `<style>` block in the `<head>` is the most common approach for demos. Edit the colour below and see all three headings respond.

```html
<h1>External stylesheet would load from styles.css</h1>
<h2>Style block in the &lt;head&gt; — most common for demos</h2>
<p style="color: #f59e0b; font-family: system-ui;">Inline style — only affects this element</p>
```

```css
body { background: #0f172a; padding: 24px; }
h1 { color: #818cf8; font-family: system-ui; font-size: 1.5rem; }
h2 { color: #6ee7b7; font-family: system-ui; font-size: 1.2rem; }
```

The external stylesheet (`<link rel="stylesheet" href="styles.css">`) is what professional projects use — one stylesheet controls thousands of pages. Inline styles are the last resort: they mix presentation with structure and can't be reused.

**SE lens:** Separating CSS from HTML is the same principle as separating concerns in any software system. You can redesign the entire look of a site by swapping one CSS file without touching a single HTML file.

## Properties and Values

A property is a visual attribute the browser understands. A value is a valid setting for that property. This single `h1` rule uses six properties simultaneously — edit any value to see it change.

```html
<h1>CSS Controls Everything</h1>
```

```css
body { background: #0f172a; padding: 24px; }
h1 {
  color: crimson;
  background-color: #1e293b;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  font-family: system-ui;
}
```

CSS has hundreds of properties. Learning CSS is not memorising them all — it is building a mental model of which category of property to reach for, then looking up the exact syntax.

## The Browser's Default Stylesheet

Before you write a single line of CSS, the browser already applies its own styles. Below shows the browser defaults for common elements — the `<h1>` is large and bold, the `<a>` is blue and underlined. Add your own overrides to beat those defaults.

```html
<h1>Browser gives me bold and 2em size</h1>
<p>Browser gives me block display and 1em top/bottom margins.</p>
<a href="#">Browser gives me blue colour and underline</a>
<ul>
  <li>Browser gives me disc bullets and left padding</li>
  <li>Override any of these with your own rules</li>
</ul>
```

```css
body { background: #0f172a; color: #e2e8f0; padding: 24px; font-family: system-ui; }
/* Try adding: h1 { color: #818cf8; } to override the default */
```

Every style you write either adds to or **overrides** these defaults. When a CSS property behaves unexpectedly, checking the browser's DevTools "Computed" panel shows which rule is actually applying — your rule, a browser default, or something inherited.

**CS lens:** The browser's default stylesheet is a real CSS file. In Chromium it is called `html.css`. Many professional projects start by applying a **CSS reset** — a short stylesheet that zeroes out browser defaults so every browser starts from the same baseline.

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
