---
series: html-dom
level: 4
title: Creating & Inserting Elements
lang: javascript
---

# Creating & Inserting Elements

Every element you have touched so far already existed in the HTML. Real applications build UI at runtime — from API data, user actions, state changes. `document.createElement` creates a new element that exists in memory but is not yet on the page. Inserting it is a separate step. Understanding why matters: the detached node is a real DOM element with all its properties, but it is invisible until placed in the tree.

## createElement — A Node That Does Not Exist Yet

`document.createElement(tagName)` — creates a new element. It is not attached to the document. It has no parent. It is invisible. It is a real element object — you can set properties on it before inserting it.

```html
<ul id="list">
  <li>Existing item</li>
</ul>
<button id="add">Add item</button>
```

```css
#list { padding-left: 20px; }
#list li { padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
button { margin-top: 8px; padding: 8px 14px; cursor: pointer; }
```

```javascript
const list = document.querySelector("#list")
const addBtn = document.querySelector("#add")
let count = 1

addBtn.addEventListener("click", () => {
  const item = document.createElement("li")
  item.textContent = `Item added: ${count}`
  count++
  list.appendChild(item)
})
```

`document.createElement("li")` — creates a detached `<li>` node. It exists in memory only.
`item.textContent = ...` — sets the text on the detached node. This is safe to do before insertion.
`list.appendChild(item)` — moves the node from detached to inside `#list`, as the last child. The moment this line runs, the item appears on the page.

**Open the Tree tab and click Add item.** The tree does not update automatically (it shows the initial HTML snapshot), but the DOM tab renders the live result after each run.

**CS lens:** The DOM tree is a linked list of nodes. `appendChild` updates three pointers: the new node's `parentNode`, the previous last child's `nextSibling`, and the parent's `lastChild`. These pointer updates are O(1) regardless of how many children already exist. Creating then inserting is always cheaper than serialising HTML and assigning `innerHTML`, because `innerHTML` parses the whole string, tears out the old subtree, and replaces it.

## append — Multiple Children at Once

`element.append(...nodes)` — appends one or more nodes or strings to the end of the element. Strings are converted to text nodes automatically (no HTML parsing):

```html
<div id="output"></div>
<button id="build">Build list</button>
```

```css
#output { margin-top: 12px; }
```

```javascript
const output = document.querySelector("#output")
const buildBtn = document.querySelector("#build")

buildBtn.addEventListener("click", () => {
  const heading = document.createElement("h3")
  heading.textContent = "Languages"

  const python = document.createElement("p")
  python.textContent = "Python"

  const javascript = document.createElement("p")
  javascript.textContent = "JavaScript"

  output.append(heading, python, javascript)
})
```

`output.append(heading, python, javascript)` — inserts all three in one call, in the given order, as the last children of `output`.

## prepend, before, after — Precise Placement

`element.prepend(...nodes)` — inserts before the first existing child.
`element.before(...nodes)` — inserts before the element itself (as a sibling).
`element.after(...nodes)` — inserts after the element itself (as a sibling).

```html
<ol id="steps">
  <li id="step2">Step 2</li>
  <li id="step3">Step 3</li>
</ol>
```

```css
#steps { padding-left: 20px; }
#steps li { padding: 4px 0; }
```

```javascript
const list = document.querySelector("#steps")
const step2 = document.querySelector("#step2")

const step1 = document.createElement("li")
step1.textContent = "Step 1"
list.prepend(step1)

const step2b = document.createElement("li")
step2b.textContent = "Step 2b"
step2.after(step2b)

console.log(list.children.length)
```

```text
4
```

`list.prepend(step1)` — inserts `step1` before `step2` (the current first child).
`step2.after(step2b)` — inserts `step2b` immediately after `step2`.

## Building Elements with a Helper

When creating many elements of the same shape, extract the pattern into a function:

```html
<div id="card-container"></div>
<button id="add-card">Add card</button>
```

```css
#card-container { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
.card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; min-width: 140px; background: #f8fafc; }
.card h4 { margin: 0 0 4px; }
.card p { margin: 0; font-size: 14px; color: #64748b; }
button { padding: 8px 14px; cursor: pointer; }
```

```javascript
const container = document.querySelector("#card-container")
const addBtn = document.querySelector("#add-card")
let cardCount = 0

function makeCard(title, description) {
  const card = document.createElement("div")
  card.className = "card"

  const heading = document.createElement("h4")
  heading.textContent = title

  const body = document.createElement("p")
  body.textContent = description

  card.append(heading, body)
  return card
}

addBtn.addEventListener("click", () => {
  cardCount++
  const card = makeCard(`Card ${cardCount}`, `Created at click ${cardCount}`)
  container.append(card)
})
```

`card.className = "card"` — sets the element's `class` attribute. `className` is the DOM property that corresponds to the HTML `class` attribute.

**SE lens:** `makeCard` is a **factory function** — it constructs and returns a configured DOM subtree. The caller knows nothing about the internal structure. Keeping element creation in factory functions rather than inline at every call site is the first step toward the component model that React, Vue, and other frameworks formalise.

## Challenge: build_list

Write a function `buildList(containerId, items)` that creates a `<ul>` element containing one `<li>` for each string in `items`, then appends the `<ul>` to the element with id `containerId`.

Each `<li>` should have `textContent` equal to the corresponding item string. The `<ul>` must not exist in the HTML before `buildList` runs — create it entirely with `createElement`.

```challenge
function buildList(containerId, items) {
  // TODO
}
```

```test
document.body.innerHTML = '<div id="root"></div>'
buildList("root", ["Alpha", "Beta", "Gamma"])
const ul = document.querySelector("#root ul")
assert ul !== null
assert ul.children.length === 3
assert ul.children[0].textContent === "Alpha"
assert ul.children[2].textContent === "Gamma"
assert ul.tagName === "UL"
```
