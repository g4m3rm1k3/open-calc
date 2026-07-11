---
series: html-dom
level: 2
title: Reading & Writing DOM Properties
lang: javascript
---

# Reading & Writing DOM Properties

Once you have an element, you can read what is in it and write new content to it. The two most important properties are `textContent` (the text inside, no HTML) and `innerHTML` (the full HTML markup inside). A third, `value`, reads the current content of form inputs. Each works differently, and choosing the wrong one is one of the most common browser JavaScript bugs.

## textContent — Plain Text In and Out

`element.textContent` — reads all the text inside an element and its descendants, stripping all HTML tags. When you write to it, whatever you assign becomes the raw text content — any HTML characters are escaped and displayed literally.

```html
<main>
  <h1 id="greeting">Hello, World</h1>
  <p id="info">Current time: <strong>unknown</strong></p>
</main>
```

```css
body { font-family: system-ui; padding: 24px; }
#greeting { color: #2563eb; }
```

```javascript
const greeting = document.querySelector("#greeting")
const info = document.querySelector("#info")

console.log(greeting.textContent)
console.log(info.textContent)

greeting.textContent = "Hello, DOM"
info.textContent = "Updated by JavaScript"

console.log(greeting.textContent)
```

```text
Hello, World
Current time: unknown
Hello, DOM
```

`info.textContent` strips the `<strong>` tags — it returns only `"Current time: unknown"`, not the markup. Writing `info.textContent = "Updated by JavaScript"` replaces all child nodes with a single text node.

**Open the DOM tab and run this.** Watch the `<h1>` text change. Check the Tree tab before and after — the `<strong>` node inside `#info` disappears when `textContent` is assigned.

**CS lens:** `textContent` sets a raw text node — no HTML parsing, no XSS risk. The browser treats the assigned string as literal characters, never as markup. `<script>alert(1)</script>` assigned via `textContent` appears as visible text, not as executable code. This is why `textContent` is always preferred over `innerHTML` when you are inserting data that came from a user or an external API.

## innerHTML — Markup In and Out

`element.innerHTML` — reads the element's content including all HTML markup. Writing to it causes the browser to **parse the string as HTML** and replace all child nodes with the resulting element tree.

```html
<section id="card">
  <h2>Original title</h2>
  <p>Original paragraph.</p>
</section>
```

```css
#card { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
#card h2 { margin-top: 0; color: #0f172a; }
```

```javascript
const card = document.querySelector("#card")

console.log(card.innerHTML)

card.innerHTML = `
  <h2 style="color: #2563eb;">New Title</h2>
  <p>Replaced by <strong>JavaScript</strong>.</p>
  <small>Added dynamically</small>
`

console.log(card.querySelector("strong").textContent)
```

```text
(the original HTML markup)
JavaScript
```

`card.innerHTML = ...` — replaces all children with the parsed result of the template literal string. The browser parses the string as HTML, creates element nodes, and inserts them. `card.querySelector("strong")` then works because those nodes are now in the DOM.

**SE lens:** Never assign `innerHTML` from untrusted sources (user input, API responses, URL parameters). If user input contains `<script>`, `innerHTML` will execute it — this is a **Cross-Site Scripting (XSS)** vulnerability. Use `textContent` for user-supplied text. Use `innerHTML` only for developer-authored markup.

## getAttribute and setAttribute

HTML attributes (like `src`, `href`, `class`, `id`, `disabled`) can be read and written with `getAttribute` and `setAttribute`:

```html
<img id="logo" src="placeholder.png" alt="Company logo" width="120">
<a id="link" href="https://example.com">Visit site</a>
```

```css
#logo { border: 2px solid #e2e8f0; border-radius: 8px; }
#link { color: #2563eb; }
```

```javascript
const logo = document.querySelector("#logo")
const link = document.querySelector("#link")

console.log(logo.getAttribute("alt"))
console.log(logo.getAttribute("width"))
console.log(link.getAttribute("href"))

logo.setAttribute("alt", "Updated logo description")
link.setAttribute("href", "https://updated-example.com")

console.log(logo.getAttribute("alt"))
```

```text
Company logo
120
https://example.com
Updated logo description
```

`getAttribute(name)` — returns the attribute value as a string, or `null` if the attribute does not exist.
`setAttribute(name, value)` — sets the attribute. Adds it if it does not exist.
`removeAttribute(name)` — removes the attribute entirely.

Note: some attributes have shortcut properties. `img.src`, `a.href`, `input.value` are direct properties that mirror their HTML attributes. These are covered where they arise naturally in subsequent lessons.

## style — Inline CSS

`element.style` — an object representing the element's inline style. Reading `style.color` gives the inline color (empty string if none). Writing to it applies an inline style:

```html
<div id="box">I am a box</div>
<button id="toggle">Toggle style</button>
```

```css
#box {
  width: 160px;
  height: 80px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}
button { margin-top: 12px; padding: 8px 16px; cursor: pointer; }
```

```javascript
const box = document.querySelector("#box")
const toggle = document.querySelector("#toggle")

let active = false

toggle.addEventListener("click", () => {
  active = !active
  box.style.background = active ? "#2563eb" : "#e2e8f0"
  box.style.color = active ? "white" : "black"
  box.textContent = active ? "Active!" : "I am a box"
})
```

CSS property names with hyphens become camelCase in JavaScript: `background-color` → `backgroundColor`, `font-size` → `fontSize`, `border-radius` → `borderRadius`.

`toggle.addEventListener("click", handler)` — runs `handler` when the button is clicked. Events are covered fully in Level 7.

**SE lens:** Setting `element.style.property` applies an inline style, which has the highest specificity and overrides any stylesheet rule. This makes inline styles a blunt instrument — they cannot be overridden by a CSS file. Prefer toggling CSS classes (Level 4) over setting inline styles for state-based appearance changes. Reserve `style` for dynamic values that cannot be predetermined (like pixel positions from mouse events).

## Challenge: swap_content

Write a function `swapContent(idA, idB)` that swaps the `textContent` of two elements identified by their IDs.

`document.getElementById(id)` — returns the element with the given `id`, or `null` if not found. Equivalent to `document.querySelector('#' + id)` but slightly faster.

The swap must be symmetric: the text that was in `idA` ends up in `idB` and vice versa. Store one value in a temporary variable before overwriting.

```challenge
function swapContent(idA, idB) {
  // TODO
}
```

```test
document.body.innerHTML = '<div id="a">Alpha</div><div id="b">Beta</div>'
swapContent("a", "b")
assert document.querySelector("#a").textContent === "Beta"
assert document.querySelector("#b").textContent === "Alpha"
swapContent("a", "b")
assert document.querySelector("#a").textContent === "Alpha"
```
