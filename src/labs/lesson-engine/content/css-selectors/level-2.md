---
series: css-selectors
level: 2
title: Structural Pseudo-classes
lang: css
---

# Structural Pseudo-classes

Structural pseudo-classes select elements based on their **position in the document tree** — first child, last child, every third item, even/odd rows. They let you style document structure without adding position-tracking classes to every element.

## :first-child and :last-child

```css
li:first-child { border-top: none; }
li:last-child  { border-bottom: none; }
```

```text
:first-child  — the element is the FIRST child of its parent
:last-child   — the element is the LAST child of its parent
```

These are especially useful for removing border-top from the first item and border-bottom from the last — removing "double borders" without knowing the list length.

## :nth-child()

`:nth-child(n)` takes a formula and selects elements at those positions. Counting starts at 1.

```css
tr:nth-child(even) { background: #1e293b; }  /* zebra stripes */
tr:nth-child(odd)  { background: #0f172a; }

li:nth-child(3)    { font-weight: bold; }    /* exactly the 3rd item */
li:nth-child(3n)   { color: #3b82f6; }       /* every 3rd item */
li:nth-child(3n+1) { color: #10b981; }       /* 1st, 4th, 7th... */
```

```text
even / odd    — shorthand for 2n / 2n+1
An            — every Nth element (3n = 3rd, 6th, 9th...)
An+B          — every Nth starting from B (3n+1 = 1st, 4th, 7th...)
```

**CS lens:** The `An+B` formula is a linear sequence where `n` is a counter starting at 0. For `3n+1`: n=0→1, n=1→4, n=2→7. The browser computes this and matches the position.

## :only-child and :nth-last-child()

```css
li:only-child      { margin: 0 auto; }   /* when list has exactly one item */
li:nth-last-child(2) { font-weight: bold; } /* second from the end */
```

`:nth-last-child()` counts from the end instead of the start — useful when you want to target items relative to the end of a list whose length is unknown.

## :first-of-type and :last-of-type

These are like `:first-child` but filter by element type first.

```css
p:first-of-type { font-size: 1.1rem; font-weight: 500; }
```

```text
:first-child    — first child, regardless of type
:first-of-type  — first child of this element TYPE within the parent
```

```html
<article>
  <h2>Title</h2>
  <p>First paragraph</p>   <!-- p:first-child? NO. p:first-of-type? YES. -->
  <p>Second paragraph</p>
</article>
```

**SE lens:** Structural pseudo-classes remove the need for JavaScript to add position-based classes. Before CSS had `:nth-child`, developers used JS to add `class="even"` to every other row in a table. The pseudo-class does this in the stylesheet with zero JS.

**Common mistakes:**
- `:nth-child` counts *all* siblings, not just elements of the same type. `p:nth-child(2)` matches a `<p>` only if it is the second child of its parent — if a `<h2>` is first, the second `<p>` is actually the third child and won't match. Use `:nth-of-type(2)` to count only `<p>` elements.
- The `An+B` formula uses `n` starting at **0**, so `3n+1` generates positions 1, 4, 7... — not 1, 3, 4.
- `:first-child` and `:last-child` are about the parent context. `li:first-child` means "an `<li>` that is the first child of *its* parent" — not the first `<li>` on the entire page.

**Debug tip:** In DevTools, you can test selectors in the Console with `document.querySelectorAll('li:nth-child(2n)')` — this returns a NodeList of matched elements so you can verify the formula before writing CSS.

**Next:** Form pseudo-classes — styling inputs based on their interactive state (`:disabled`, `:checked`, `:required`, `:valid`) without JavaScript.

## Challenge: structure

The HTML below is a 5-item list. Apply styles using structural pseudo-classes.

1. Set `color` of the **first** `<li>` to `rgb(59, 130, 246)` (blue)
2. Set `color` of the **last** `<li>` to `rgb(239, 68, 68)` (red)
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
