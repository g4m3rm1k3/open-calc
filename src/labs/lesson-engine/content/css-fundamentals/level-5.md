---
series: css-fundamentals
level: 5
title: Inheritance
lang: css
---

# Inheritance

Not every CSS property you set on a parent element stays on that parent. Some properties automatically pass down to all child elements — this is **inheritance**. Understanding which properties inherit (and which do not) is the key to writing efficient CSS and understanding why a style does or does not apply.

## What Inheritance Means

When a property inherits, child elements get the parent's value unless they have their own rule:

```css
body {
  color: #374151;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
}
```

```html
<body>
  <h1>Heading</h1>
  <p>Paragraph with <strong>bold</strong> text and <a href="#">a link</a>.</p>
</body>
```

```text
<h1>       → inherits font-family, line-height. Does NOT inherit font-size (browser has its own default for h1).
<p>        → inherits color, font-family, font-size, line-height.
<strong>   → inherits everything from <p>. Adds font-weight: bold (from browser default).
<a>        → inherits font-family, font-size — but NOT color (browser overrides with link blue).
```

Setting four properties on `body` gives you consistent typography across the whole page. Without inheritance, you would repeat these declarations on every element.

## Which Properties Inherit

Properties that relate to **text and reading** inherit by default. Properties that relate to **box and layout** do not.

```text
INHERIT by default              DO NOT inherit by default
--------------------------      --------------------------
color                           background-color
font-family                     border
font-size                       padding
font-weight                     margin
font-style                      width
line-height                     height
letter-spacing                  display
text-align                      position
text-transform                  overflow
list-style                      box-shadow
cursor                          transform
visibility                      opacity (the element's own opacity)
```

The mental model: if the property affects how text looks or reads, it probably inherits. If it affects how the element's box is sized or positioned, it does not.

**CS lens:** Inheritance is implemented in the browser's cascade algorithm. When computing the final value for a property, the browser checks: (1) does any rule directly target this element for this property? (2) if not, does the property inherit? (3) if yes, take the parent's computed value; (4) if not, use the property's initial value.

## Controlling Inheritance — inherit, initial, unset, revert

You can explicitly control inheritance with four special keywords:

```css
.reset-link {
  color: inherit;    /* force inheritance even when the property would not inherit by default */
}

.reset-font-size {
  font-size: initial; /* restore to the browser's built-in default (medium = 16px) */
}

.full-reset {
  all: unset;        /* remove all styles and fall through to inheritance */
}
```

`inherit` — force the element to take the parent's computed value, even for non-inheriting properties. Used on `<a>` to get link text to match surrounding text colour.

`initial` — reset to the CSS specification's default value (not the browser's default, which may differ). Rarely what you want; prefer `unset`.

`unset` — if the property inherits, behave like `inherit`. If it does not inherit, behave like `initial`. The most useful reset keyword.

`revert` — similar to `unset` but restores to the browser's default stylesheet value (not the spec initial value). Useful in reset stylesheets.

## A Practical Example — Fixing Link Colour

The most common inheritance issue is links not matching surrounding text:

```css
/* Problem: links inside .card are browser-default blue */
.card {
  color: #1e3a5f;
}

/* Solution: force inheritance */
.card a {
  color: inherit;
  text-decoration: underline;
}
```

Without `color: inherit`, the link's browser-default rule (`color: #0000ee`) has higher specificity than nothing, so the link stays blue even though the surrounding text is navy.

## The currentColor Keyword

`currentColor` always equals the element's current `color` value, even as a value for other properties:

```css
.icon-button {
  color: #3b82f6;
  border: 2px solid currentColor; /* same blue as text */
  background-color: currentColor; /* would fill the background blue */
}

.icon-button svg {
  fill: currentColor; /* SVG icon inherits text colour automatically */
}
```

`currentColor` makes properties respond to colour changes automatically — change `color` and the border, fill, and outline all update together.

## Challenge: inheritance_control

The HTML has a `.card` with text and a link inside it. Write CSS so that:
1. `.card` has `color: #0f172a` (very dark navy) and `font-family: Georgia, serif`
2. `.card a` has `color: inherit` (so the link matches the surrounding text) and `text-decoration: underline`
3. `.card .badge` has `color: white` and `background-color: #3b82f6`

```html
<div class="card" style="padding:20px;border:1px solid #e2e8f0;">
  <p>Read our <a href="#">documentation</a> for details.</p>
  <span class="badge" style="padding:4px 10px;border-radius:9999px;font-size:0.75rem;">New</span>
</div>
```

```challenge
.card {

}

.card a {

}

.card .badge {

}
```

```test
var card = getComputedStyle(document.querySelector('.card'))
var link = getComputedStyle(document.querySelector('.card a'))
var badge = getComputedStyle(document.querySelector('.badge'))
assert card.color === 'rgb(15, 23, 42)'
assert card.fontFamily.includes('Georgia') || card.fontFamily.includes('georgia')
assert link.color === 'rgb(15, 23, 42)'
assert link.textDecoration.includes('underline')
assert badge.color === 'rgb(255, 255, 255)'
assert badge.backgroundColor === 'rgb(59, 130, 246)'
```
