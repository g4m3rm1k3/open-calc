---
series: css-selectors
level: 0
title: Combinators
lang: css
---

# Combinators

CSS lets you describe **relationships** between elements. Combinators are the characters between selectors that describe those relationships: descendant (space), child (`>`), adjacent sibling (`+`), and general sibling (`~`).

## Descendant combinator — any depth

A space between selectors targets any matching descendant at any nesting depth. Every `<a>` anywhere inside `<nav>` turns blue — even the one nested inside a `<li>`.

```html
<nav>
  <a href="#">Top-level link</a>
  <ul>
    <li><a href="#">Nested link — still matched</a></li>
    <li><a href="#">Also matched</a></li>
  </ul>
</nav>
<a href="#">Link OUTSIDE nav — not matched</a>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
nav a { color: #3b82f6; text-decoration: none; font-weight: 600; }
a { color: #94a3b8; }
nav, ul { background: #1e293b; padding: 12px; border-radius: 6px; margin-bottom: 8px; }
```

**CS lens:** This is a tree query. The first selector anchors a subtree root; the second matches any node in that subtree. Depth does not matter — only ancestry does.

## Child combinator `>` — direct children only

`>` matches only **direct** children. The nested `<li>` inside the inner `<ul>` is not a direct child of the outer `<ul>` so it is NOT styled. Change `ul > li` to `ul li` (descendant) and watch both levels get styled.

```html
<ul id="outer">
  <li>Direct child — styled</li>
  <li>Direct child — styled
    <ul id="inner">
      <li>Nested child — NOT styled with ul > li</li>
    </ul>
  </li>
</ul>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 12px; color: #e2e8f0; }
ul > li { background: #1e293b; padding: 8px 12px; margin: 4px 0; border-left: 3px solid #3b82f6; list-style: none; }
ul { background: #0f172a; padding: 8px; }
```

## Adjacent sibling `+` — immediately after

`+` matches the element immediately following. The `<p>` right after `<h2>` gets the lead-paragraph style; the second `<p>` does not.

```html
<h2>Article Title</h2>
<p id="lead">Lead paragraph — matched by h2 + p (larger, lighter)</p>
<p id="body">Body paragraph — NOT matched, not immediately after h2</p>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
h2   { color: #e2e8f0; margin-bottom: 8px; }
h2 + p { font-size: 1.15rem; color: #94a3b8; margin-top: 0; }
p    { color: #64748b; font-size: 0.95rem; }
```

## General sibling `~` — all subsequent siblings

`~` matches all siblings that come after. When `#active` is in the list, every `<li>` after it gets dimmed. Change `.active ~ li` to `.active + li` and only the one immediately after gets dimmed.

```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li class="active">Active item</li>
  <li>Item 4 — dimmed</li>
  <li>Item 5 — dimmed</li>
  <li>Item 6 — dimmed</li>
</ul>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 12px; }
li { list-style: none; padding: 8px 12px; color: #e2e8f0; background: #1e293b; margin: 2px 0; }
.active { background: #3b82f6; font-weight: 600; }
.active ~ li { opacity: 0.4; }
```

**SE lens:** Combinators express document structure in CSS, reducing the need for extra utility classes. Instead of adding `.nav-link` to every anchor inside a nav, write `nav a {}` and let structure do the work.

**Common mistakes:**
- Using `>` when you mean a descendant — `nav > a` only matches anchors that are *direct* children of the nav, missing anchors inside `<li>` wrappers.
- Confusing `+` (only the immediately next sibling) with `~` (all subsequent siblings).
- Forgetting that `~` only works forward — CSS cannot select elements before the reference element.

**Debug tip:** In Chrome DevTools Console, test your selector: `document.querySelectorAll('nav a')` — this shows exactly which elements match before writing any CSS.

**Next:** Attribute selectors — selecting by an element's `href`, `type`, `data-*`, or any other HTML attribute, without adding classes.

## Challenge: combinators

Style the card below using only combinators — no classes or IDs on anything except `.card`.

1. Set `color` of any `<a>` inside `.card` to `rgb(59, 130, 246)`
2. Set `font-size` of the `<p>` that is a **direct child** of `.card` to `0.9rem`
3. Set `color` of the `<p>` immediately after `<h2>` to `rgb(100, 116, 139)`
4. Set `list-style` of direct `<li>` children of `.card ul` to `none`

```html
<div class="card">
  <h2>Card Title</h2>
  <p id="sub">Subtitle paragraph</p>
  <ul>
    <li><a href="#">Link One</a></li>
    <li><a href="#">Link Two</a></li>
  </ul>
  <p id="footer">Footer text</p>
</div>
```

```challenge
/* Use combinators — no classes or IDs */

```

```test
var card = document.querySelector('.card')
var link = document.querySelector('.card a')
var directP = document.querySelector('.card > p')
var afterH2 = document.querySelector('h2 + p')
var li = document.querySelector('.card ul > li')
var sLink = getComputedStyle(link)
var sDirectP = getComputedStyle(directP)
var sAfterH2 = getComputedStyle(afterH2)
var sLi = getComputedStyle(li)
assert sLink.color === 'rgb(59, 130, 246)'
assert sDirectP.fontSize === '14.4px'
assert sAfterH2.color === 'rgb(100, 116, 139)'
assert sLi.listStyleType === 'none'
```
