---
series: css-selectors
level: 2
title: Structural Pseudo-classes
lang: css
---

# Structural Pseudo-classes

Structural pseudo-classes select elements based on their **position in the document tree** — first child, last child, every nth item. They let you style document structure without position-tracking classes on every element.

## :first-child and :last-child

Remove the top border from the first list item and the bottom border from the last — classic pattern for avoiding "double borders" in any list of unknown length.

```html
<ul id="nav">
  <li>Dashboard</li>
  <li>Projects</li>
  <li>Reports</li>
  <li>Settings</li>
</ul>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
#nav { list-style: none; padding: 0; background: #1e293b; border-radius: 8px; overflow: hidden; }
#nav li { padding: 12px 16px; color: #e2e8f0; border-bottom: 1px solid #334155; }
#nav li:last-child  { border-bottom: none; }
#nav li:first-child { color: #3b82f6; font-weight: 600; }
```

**CS lens:** The `An+B` formula is a linear sequence where `n` starts at 0. For `3n+1`: n=0→1, n=1→4, n=2→7. The browser computes this and matches the position.

## :nth-child() — zebra stripes and periodic patterns

`:nth-child(even)` / `:nth-child(odd)` are the classic table stripe patterns. Edit `even` to `3n` or `3n+1` to see different periodic selections.

```html
<table>
  <tr><th>Name</th><th>Status</th><th>Score</th></tr>
  <tr><td>Alice</td><td>Active</td><td>92</td></tr>
  <tr><td>Bob</td><td>Active</td><td>87</td></tr>
  <tr><td>Carol</td><td>Pending</td><td>78</td></tr>
  <tr><td>Dave</td><td>Active</td><td>95</td></tr>
  <tr><td>Eve</td><td>Inactive</td><td>61</td></tr>
</table>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
table { width: 100%; border-collapse: collapse; }
th { background: #334155; color: #94a3b8; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 10px 12px; color: #e2e8f0; }
tr:nth-child(even) { background: #1e293b; }
tr:nth-child(odd)  { background: #0f172a; }
```

## :first-of-type vs :first-child

`:first-child` matches only if the element is the *first child of its parent* — regardless of type. `:first-of-type` matches the first element of that *type* within the parent. The `<p>` here is not the first child (the `<h2>` is), but it is the first `<p>`.

```html
<article>
  <h2>Title</h2>
  <p id="lead">First paragraph — p:first-of-type matches this</p>
  <p id="body">Second paragraph — p:first-child would NOT have matched lead either</p>
  <p id="footer">Third paragraph</p>
</article>
```

```css
body { background: #0f172a; padding: 16px; font-family: system-ui; }
article { background: #1e293b; padding: 20px; border-radius: 8px; }
h2 { color: #e2e8f0; margin-bottom: 12px; }
p  { color: #94a3b8; margin: 8px 0; }
p:first-of-type { font-size: 1.1rem; font-weight: 500; color: #e2e8f0; }
p:last-of-type  { font-size: 0.85rem; color: #475569; border-top: 1px solid #334155; padding-top: 8px; }
```

**SE lens:** Structural pseudo-classes remove the need for JavaScript to add position-based classes. Before `:nth-child`, developers used JS to add `class="even"` to every other row. The pseudo-class does this in the stylesheet with zero JS.

**Common mistakes:**
- `:nth-child` counts *all* siblings, not just elements of the same type. `p:nth-child(2)` matches a `<p>` only if it is the second child of its parent — not the second `<p>`. Use `:nth-of-type(2)` to count only `<p>` elements.
- The `An+B` formula uses `n` starting at **0**, so `3n+1` gives positions 1, 4, 7 — not 1, 3, 4.
- `:first-child` is about the parent context, not the page — `li:first-child` means the first child of *its* parent, not the first `<li>` on the page.

**Debug tip:** Test in the DevTools Console: `document.querySelectorAll('li:nth-child(2n)')` — returns a NodeList of matched elements so you can verify the formula.

**Next:** Form pseudo-classes — styling inputs based on their interactive state (`:disabled`, `:checked`, `:required`, `:valid`) without JavaScript.

## Challenge: structure

Style the 5-item list using structural pseudo-classes.

1. Set `color` of the **first** `<li>` to `rgb(59, 130, 246)`
2. Set `color` of the **last** `<li>` to `rgb(239, 68, 68)`
3. Set `background-color` of **even** `<li>` elements to `rgb(30, 41, 59)`
4. Set `font-weight` of the **3rd** `<li>` to `700`

```html
<ul>
  <li id="a">Item 1</li>
  <li id="b">Item 2</li>
  <li id="c">Item 3</li>
  <li id="d">Item 4</li>
  <li id="e">Item 5</li>
</ul>
```

```challenge
/* Style by position — no classes or IDs */

```

```test
var a = document.querySelector('#a')
var b = document.querySelector('#b')
var c = document.querySelector('#c')
var d = document.querySelector('#d')
var e = document.querySelector('#e')
assert getComputedStyle(a).color === 'rgb(59, 130, 246)'
assert getComputedStyle(e).color === 'rgb(239, 68, 68)'
assert getComputedStyle(b).backgroundColor === 'rgb(30, 41, 59)'
assert getComputedStyle(d).backgroundColor === 'rgb(30, 41, 59)'
assert getComputedStyle(c).fontWeight === '700'
```
