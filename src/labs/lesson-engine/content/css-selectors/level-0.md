---
series: css-selectors
level: 0
title: Combinators
lang: css
---

# Combinators

A selector can target a single element type — but CSS also lets you describe **relationships** between elements. Combinators are the characters between selectors that describe those relationships: descendant, child, adjacent sibling, and general sibling.

## The Descendant Combinator (space)

A space between two selectors means "any matching element that is a descendant of the first, at any depth."

```css
nav a {
  color: #3b82f6;
  text-decoration: none;
}
```

```text
Targets every <a> anywhere inside a <nav> — whether it is a direct child,
a grandchild, or nested ten levels deep.
```

The descendant combinator is the most common. Any element that eventually lives inside the first element qualifies.

**CS lens:** This is a tree query. The first selector anchors a subtree root; the second matches any node in that subtree. Depth does not matter — only ancestry does.

## The Child Combinator (>)

`>` means "direct child only."

```css
ul > li {
  list-style: none;
  padding: 8px 0;
}
```

```text
Only <li> elements that are DIRECT children of a <ul> are matched.
An <li> inside a nested <ul> inside the outer <ul> is NOT matched.
```

Use `>` when you want to style only one level deep and avoid accidentally targeting nested elements of the same type.

## The Adjacent Sibling Combinator (+)

`+` means "the element immediately after."

```css
h2 + p {
  font-size: 1.1rem;
  color: #64748b;
  margin-top: 0;
}
```

```text
Targets a <p> that comes IMMEDIATELY after an <h2> in the same parent.
Any other <p> — even one two elements after the <h2> — is not matched.
```

Adjacent sibling is useful for "the first paragraph after a heading" patterns without needing a class.

## The General Sibling Combinator (~)

`~` means "any sibling that comes after."

```css
.active ~ li {
  opacity: 0.5;
}
```

```text
Targets every <li> that follows an <li class="active"> in the same parent.
Unlike +, it matches ALL subsequent siblings, not just the first.
```

**SE lens:** Combinators express document structure in CSS, which reduces the need for extra utility classes. Instead of adding `.nav-link` to every anchor inside a nav, you write `nav a {}` and let structure do the work.

**Common mistakes:**
- Using `>` when you mean a descendant (space) — `nav > a` only matches anchors that are *direct* children of the nav, missing anchors inside `<li>` or `<div>` wrappers.
- Confusing `+` (only the immediately next sibling) with `~` (all subsequent siblings). If you want every item after the active one, use `~` not `+`.
- Adding spaces around `>` when they are optional but forgetting that `a > b` and `a>b` are identical — the spaces are cosmetic only.

**Debug tip:** In Chrome/Firefox DevTools, click any element and look at the "Computed" tab — then search for the property. The matching selector is shown in the "Styles" panel next to each rule. If a combinator rule isn't applying, the Styles panel will show it struck through (overridden) or absent (not matched).

**Next:** Attribute selectors — selecting by an element's `type`, `href`, `data-*`, or any other HTML attribute, without adding classes.

## Challenge: combinators

The HTML below has a card with a heading, a subtitle paragraph, and a list. Style it using only combinators — no classes or IDs.

1. Set the `color` of any `<a>` inside `.card` to `rgb(59, 130, 246)` (blue)
2. Set the `font-size` of the `<p>` that is a **direct child** of `.card` to `0.9rem`
3. Set the `color` of the `<p>` immediately after `<h2>` to `rgb(100, 116, 139)` (slate)
4. Set the `list-style` of direct `<li>` children of `.card ul` to `none`

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
