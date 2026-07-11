---
series: css-selectors
level: 4
title: ":not(), :is(), :where()"
lang: css
---

# :not(), :is(), :where()

Three functional pseudo-classes for negation and grouping that eliminate repetitive selectors and specificity problems.

## :not() — style everything except

Add a border between list items without a double border at the bottom. Remove `li:not(:last-child)` and see the double border appear.

```html
<ul id="list">
  <li>Dashboard</li>
  <li>Projects</li>
  <li>Reports</li>
  <li>Settings — no border below me</li>
</ul>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
#list { list-style: none; padding: 0; background: #1e293b; border-radius: 8px; overflow: hidden; }
#list li { padding: 12px 16px; color: #e2e8f0; }
#list li:not(:last-child) { border-bottom: 1px solid #334155; }
```

`:not()` accepts any valid selector. Use it to exclude classes, states, types:

```html
<div class="toolbar">
  <button>Save</button>
  <button disabled>Delete</button>
  <button>Export</button>
  <button disabled>Publish</button>
</div>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
.toolbar { display: flex; gap: 8px; }
button { padding: 8px 16px; border-radius: 6px; border: none; font-size: 14px; font-weight: 500; }
button:not(:disabled) { background: #3b82f6; color: white; cursor: pointer; }
button:disabled       { background: #1e293b; color: #475569; cursor: not-allowed; }
```

**CS lens:** `:not()` is logical negation. The set of matched elements is "everything this selector would match, minus what `:not()` says to exclude."

## :is() — group selectors without repetition

Without `:is()`: `h1 a, h2 a, h3 a, h4 a { }` — four selectors for one rule. With `:is()`: one selector, same result. Change the heading colour in one place.

```html
<article>
  <h1>H1 with <a href="#">link</a></h1>
  <h2>H2 with <a href="#">link</a></h2>
  <h3>H3 with <a href="#">link</a></h3>
  <p>Paragraph with <a href="#">link</a> — not matched by heading rule</p>
</article>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; }
article { background: #1e293b; padding: 16px; border-radius: 8px; }
h1, h2, h3 { color: #e2e8f0; margin: 8px 0; }
p { color: #94a3b8; }
a { color: #94a3b8; text-decoration: none; }
:is(h1, h2, h3) a { color: #6366f1; text-decoration: underline; }
```

## :where() — same as :is() but zero specificity

`:where()` groups selectors like `:is()` but contributes **zero specificity** — making it easy to override. Use it for base styles and design system resets that downstream components should always win against.

```html
<header><a href="#">Header link</a></header>
<footer><a href="#">Footer link</a></footer>
<main>
  <a href="#">Main link — override works here</a>
  <div class="card"><a href="#">Card link — overridden to orange</a></div>
</main>
```

```css
body { background: #0f172a; font-family: system-ui; padding: 16px; color: #e2e8f0; }
header, footer, main { background: #1e293b; padding: 12px; margin-bottom: 8px; border-radius: 6px; }
:where(header, footer, main) a { color: #3b82f6; text-decoration: none; }
.card a { color: #f59e0b; } /* overrides :where() because .card a has higher specificity */
```

**SE lens:** `:where()` is the tool for writing design system base styles that downstream components can always override. Libraries like Tailwind's preflight use it so their resets never fight your actual styles.

**Common mistakes:**
- `:is()` takes the specificity of its most specific argument — `:is(#id, .class)` has ID-level specificity even when matching a class. Use `:where()` to avoid this.
- Thinking `:not(.foo)` means "not an element with class foo" — it means any element that doesn't match `.foo`, including elements of other types. `p:not(.foo)` is a `<p>` without class `foo`.

**Debug tip:** Run `document.querySelectorAll('li:not(:last-child)')` in the Console to see which elements match before applying CSS.

**Next:** `:has()` — the parent selector. Select an element based on what its descendants contain.

## Challenge: not-is-where

Style the elements using `:not()` and `:is()`.

1. Set `border-bottom` of every `<li>` **except** `.skip` to `1px solid rgb(51, 65, 85)`
2. Set `color` of `<a>` inside any heading (`h1`, `h2`, `h3`) to `rgb(148, 163, 184)`
3. Set `font-style` of every `<p>` that is **not** `.note` to `italic`

```html
<ul>
  <li id="a">Item 1</li>
  <li id="b" class="skip">Skip me</li>
  <li id="c">Item 3</li>
</ul>
<h2><a id="link" href="#">Heading link</a></h2>
<p id="p1">Normal paragraph</p>
<p id="p2" class="note">Note paragraph</p>
```

```challenge
/* Use :not(), :is(), or :where() */

```

```test
var a = document.querySelector('#a')
var b = document.querySelector('#b')
var link = document.querySelector('#link')
var p1 = document.querySelector('#p1')
var p2 = document.querySelector('#p2')
assert getComputedStyle(a).borderBottomColor === 'rgb(51, 65, 85)'
assert getComputedStyle(b).borderBottomStyle === 'none'
assert getComputedStyle(link).color === 'rgb(148, 163, 184)'
assert getComputedStyle(p1).fontStyle === 'italic'
assert getComputedStyle(p2).fontStyle === 'normal'
```
