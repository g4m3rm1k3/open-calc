---
series: html-dom
level: 1
title: querySelector & the DOM Tree
lang: javascript
---

# querySelector & the DOM Tree

The DOM is a tree. Every HTML element is a node; nodes have parents, children, and siblings. To change anything on a page, you first have to find it. `querySelector` is the standard tool: it accepts a CSS selector and returns the first matching element, or `null` if nothing matches.

This lesson teaches how to find elements, what the DOM tree structure looks like, and how to read basic properties off the nodes you find.

## querySelector — Finding One Element

`document.querySelector(selector)` — searches the entire document for the first element that matches `selector`. Returns the element, or `null` if nothing matches.

The selector syntax is identical to CSS:

```text
"h1"          — first <h1> element
"#title"      — element with id="title"
".highlight"  — first element with class="highlight"
"button"      — first <button>
"ul li"       — first <li> inside a <ul>
"[data-id]"   — first element with a data-id attribute
```

```html
<main>
  <h1 id="title">Hello, DOM</h1>
  <p class="intro">This is the introduction.</p>
  <button>Click me</button>
</main>
```

```css
body { font-family: system-ui; padding: 24px; }
#title { color: #2563eb; }
.intro { color: #475569; }
```

```javascript
const title = document.querySelector("#title")
const intro = document.querySelector(".intro")
const button = document.querySelector("button")

console.log(title.tagName)
console.log(intro.textContent)
console.log(button.tagName)
```

```text
H1
This is the introduction.
BUTTON
```

`element.tagName` — the HTML tag name, always uppercase: `"H1"`, `"BUTTON"`, `"DIV"`.
`element.textContent` — all the text inside the element (and its descendants), with no HTML markup. Reading it is covered fully in Level 2.

**Open the Tree tab** — you can see the full DOM tree for the HTML above. `#title`, `.intro`, and the `<button>` are all children of `<main>`.

**CS lens:** `querySelector` traverses the DOM tree using a depth-first search from the root (`document`) until it finds the first match. `querySelectorAll` returns every match as a `NodeList`. Both are O(n) in the worst case where n is the number of nodes. For large pages, caching the result in a variable (as in the example above) avoids repeated traversals.

## querySelectorAll — Finding Multiple Elements

`document.querySelectorAll(selector)` — returns a `NodeList` of all matching elements. A `NodeList` is array-like: it has `.length` and you can loop over it with `for...of`.

```html
<ul id="list">
  <li class="item">Apples</li>
  <li class="item">Bananas</li>
  <li class="item">Cherries</li>
</ul>
```

```css
#list { padding: 0; list-style: none; }
.item { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
```

```javascript
const items = document.querySelectorAll(".item")

console.log(items.length)

for (const item of items) {
  console.log(item.textContent)
}
```

```text
3
Apples
Bananas
Cherries
```

`for (const item of items)` — `NodeList` supports `for...of` iteration directly. Each `item` is a DOM element.

**SE lens:** `querySelectorAll` returns a **static** `NodeList` — a snapshot at the moment of the call. If JavaScript later adds or removes matching elements, the `NodeList` does not update. `getElementsByClassName` and `getElementsByTagName` return **live** `HTMLCollections` that do update, but they are older APIs and the static snapshot is almost always what you want.

## Null Safety — When querySelector Returns null

If no element matches, `querySelector` returns `null`. Calling any property on `null` throws a `TypeError`:

```javascript
const missing = document.querySelector("#does-not-exist")

console.log(missing)
console.log(missing === null)
```

```text
null
true
```

`missing.textContent` would throw: `TypeError: Cannot read properties of null`. In real applications, always check for `null` before accessing properties: `if (element) { ... }`.

## The DOM Tree Structure

Every node has properties describing its position in the tree:

```html
<section>
  <h2 id="heading">Section Title</h2>
  <p>First paragraph.</p>
  <p>Second paragraph.</p>
</section>
```

```css
section { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
```

```javascript
const heading = document.querySelector("#heading")
const section = heading.parentElement

console.log(heading.parentElement.tagName)
console.log(section.children.length)
console.log(section.firstElementChild.textContent)
console.log(section.lastElementChild.textContent)
```

```text
SECTION
3
Section Title
Second paragraph.
```

Tree navigation properties:
- `element.parentElement` — the immediate parent node
- `element.children` — an `HTMLCollection` of child *elements* (no text nodes)
- `element.firstElementChild` — the first child element
- `element.lastElementChild` — the last child element
- `element.nextElementSibling` — the next sibling element
- `element.previousElementSibling` — the previous sibling element

**Open the Tree tab** — verify these relationships visually. `#heading` is the first child of `<section>`, and the two `<p>` tags are its siblings.

## Challenge: find_and_count

Write a function `findAndCount(selector)` that returns an object with two properties:
- `found` — `true` if `document.querySelector(selector)` finds an element, `false` if it returns `null`
- `count` — the number of elements matching `selector` (from `document.querySelectorAll(selector).length`)

`NodeList` has a `.length` property, identical to arrays.

```challenge
function findAndCount(selector) {
  // TODO
}
```

```test
const r1 = findAndCount("body")
assert r1.found === true
assert r1.count >= 1
const r2 = findAndCount("#__no_such_element_xyz")
assert r2.found === false
assert r2.count === 0
assert typeof findAndCount("p") === "object"
```
