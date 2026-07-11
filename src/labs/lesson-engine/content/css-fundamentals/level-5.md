---
series: css-fundamentals
level: 5
title: Inheritance
lang: css
---

# Inheritance

Not every CSS property you set on a parent element stays on that parent. Some properties automatically pass down to all child elements — this is **inheritance**. Understanding which properties inherit (and which do not) is the key to writing efficient CSS and understanding why a style does or does not apply.

## What Inheritance Means

Setting `color`, `font-family`, `font-size`, and `line-height` on `body` gives you consistent typography across the whole page — all children inherit these values unless they set their own. See how the `<strong>` and `<a>` inside the `<p>` pick up the parent's font without being explicitly targeted.

```html
<body>
  <h1>Heading — inherits font-family and line-height, NOT font-size</h1>
  <p>Paragraph — inherits color, font-family, font-size, line-height.
    <strong>Bold text inherits everything, adds font-weight.</strong>
    <a href="#">Link inherits font-family and size — but NOT color.</a>
  </p>
</body>
```

```css
body {
  background: #0f172a;
  color: #94a3b8;
  font-family: system-ui;
  font-size: 1rem;
  line-height: 1.7;
  padding: 24px;
}
h1 { color: #e2e8f0; margin-bottom: 12px; }
strong { color: #e2e8f0; }
a { color: #60a5fa; }
```

Setting four properties on `body` gives you consistent typography across the whole page. Without inheritance, you would repeat these declarations on every element.

**CS lens:** Inheritance is implemented in the browser's cascade algorithm. When computing the final value for a property, the browser checks: (1) does any rule directly target this element for this property? (2) if not, does the property inherit? (3) if yes, take the parent's computed value; (4) if not, use the property's initial value.

## Which Properties Inherit

Properties that relate to **text and reading** inherit by default. Properties that relate to **box and layout** do not. Here both boxes inherit `color` and `font-family` from `.card` — but `background-color`, `border`, and `padding` do NOT.

```html
<div class="card">
  <p class="content">I inherit color and font-family — no explicit rule on me.</p>
  <span class="tag">Tag — also inherits text properties, not box properties.</span>
  <div class="inner">border and background-color do NOT inherit — I have no border/bg from .card</div>
</div>
```

```css
body { background: #0f172a; padding: 24px; }
.card {
  color: #e2e8f0;
  font-family: system-ui;
  font-size: 1rem;
  line-height: 1.6;
  background-color: #1e293b;
  border: 2px solid #334155;
  padding: 20px;
  border-radius: 8px;
}
.content { margin: 0 0 8px; }
.tag { font-size: 0.75rem; font-weight: 600; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; }
.inner { margin-top: 12px; padding: 12px; border-radius: 6px; background: #0f172a; color: #64748b; font-size: 13px; }
```

The mental model: if the property affects how **text looks or reads**, it probably inherits. If it affects how the element's **box is sized or positioned**, it does not.

## Controlling Inheritance — inherit, initial, unset, revert

You can explicitly control inheritance with four special keywords. Here three links show the difference: the first gets browser default blue, the second forces inheritance, the third resets to the initial spec value.

```html
<div class="container">
  <p>Text colour is dark navy in this container.</p>
  <a href="#" class="default-link">Default — browser overrides inherited color with blue</a>
  <a href="#" class="inherit-link">color: inherit — takes parent's dark navy</a>
  <a href="#" class="initial-link">color: initial — resets to spec default (black)</a>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.container {
  color: #1e3a5f;
  background: #e2e8f0;
  padding: 20px;
  border-radius: 8px;
}
.container p { margin: 0 0 12px; font-weight: 600; }
a { display: block; margin: 6px 0; font-size: 15px; }
.inherit-link { color: inherit; text-decoration: underline; }
.initial-link { color: initial; text-decoration: none; }
```

`inherit` — force the element to take the parent's computed value. `initial` — reset to the CSS spec's default. `unset` — if the property inherits, behave like `inherit`; if not, behave like `initial`. `revert` — restore to the browser's default stylesheet value.

## A Practical Example — Fixing Link Colour

The most common inheritance issue is links not matching surrounding text. Inside `.card`, the link should match the surrounding navy text — but the browser's default link rule wins unless you force inheritance.

```html
<div class="card">
  <p>Read our <a class="default-a" href="#">documentation</a> for details. — link is browser blue</p>
  <p>Read our <a class="fixed-a" href="#">documentation</a> for details. — link inherits navy</p>
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; }
.card {
  color: #1e3a5f;
  background: #e2e8f0;
  padding: 20px;
  border-radius: 8px;
}
.card p { margin: 0 0 12px; }
.fixed-a { color: inherit; text-decoration: underline; }
```

Without `color: inherit`, the link's browser-default rule has higher specificity than nothing, so the link stays blue even though the surrounding text is navy.

## The currentColor Keyword

`currentColor` always equals the element's current `color` value. Change `color` once and the border and icon fill all update together automatically.

```html
<button class="btn blue-btn">Blue — border and bg use currentColor</button>
<button class="btn green-btn">Green — change one color, everything updates</button>
<div class="icon-card">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
  SVG icon fills with currentColor automatically
</div>
```

```css
body { background: #0f172a; padding: 24px; font-family: system-ui; display: flex; flex-direction: column; gap: 12px; }
.btn {
  padding: 10px 20px;
  border: 2px solid currentColor;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
  width: fit-content;
}
.blue-btn  { color: #60a5fa; }
.green-btn { color: #6ee7b7; }
.icon-card {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #818cf8;
  background: #1e293b;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
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
