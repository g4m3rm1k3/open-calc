---
series: html-dom
level: 10
title: Rendering Lists from Data
lang: javascript
---

# Rendering Lists from Data

Every real application starts with data — an array of users, products, tasks, or messages — and needs to turn it into DOM nodes. Doing this manually (one `createElement` call per field per item) does not scale. The pattern that scales: `Array.map` over the data, create an element for each item, and use `replaceChildren` to put them all in at once. This is how React, Vue, and Svelte work internally — this lesson teaches the principle they are built on.

## Data → DOM: The Basic Pattern

```html
<div id="app">
  <ul id="product-list"></ul>
</div>
```

```css
#product-list { list-style: none; padding: 0; }
.product { padding: 14px; border-bottom: 1px solid #e2e8f0; }
.product h4 { margin: 0 0 4px; }
.product .price { color: #16a34a; font-weight: 600; }
.product .sku { color: #94a3b8; font-size: 12px; }
```

```javascript
const products = [
  { id: 1, name: "Mechanical Keyboard", price: 129.99, sku: "KB-001" },
  { id: 2, name: "USB-C Hub",           price: 49.95,  sku: "HB-007" },
  { id: 3, name: "Monitor Stand",       price: 79.00,  sku: "MS-012" },
]

function renderProduct(product) {
  const li = document.createElement("li")
  li.className = "product"
  li.dataset.id = product.id

  const name = document.createElement("h4")
  name.textContent = product.name

  const price = document.createElement("div")
  price.className = "price"
  price.textContent = `$${product.price.toFixed(2)}`

  const sku = document.createElement("div")
  sku.className = "sku"
  sku.textContent = product.sku

  li.append(name, price, sku)
  return li
}

const list = document.querySelector("#product-list")
const nodes = products.map(renderProduct)
list.replaceChildren(...nodes)
```

`products.map(renderProduct)` — transforms the data array into a DOM node array. Each call to `renderProduct` creates a fully configured `<li>` subtree.
`list.replaceChildren(...nodes)` — atomically replaces the list's contents with all new nodes in one DOM operation. Faster and cleaner than appending one by one.
`price.toFixed(2)` — formats the number to exactly 2 decimal places as a string. `49.95.toFixed(2)` → `"49.95"`.

**CS lens:** This is the **map** operation (JavaScript Fundamentals Level 3) applied to DOM construction. The data array is the source of truth; the DOM is a derived view. When the data changes, re-render by calling `map` again and `replaceChildren` again. This is the mental model React introduced and every modern framework follows.

## Re-rendering on State Change

The pattern becomes powerful when combined with state that changes over time:

```html
<div id="app">
  <input id="search" placeholder="Search..." style="padding:8px;border:1px solid #e2e8f0;border-radius:6px;width:220px;margin-bottom:12px;">
  <ul id="results"></ul>
</div>
```

```css
#results { list-style: none; padding: 0; }
.result-item { padding: 10px; border-bottom: 1px solid #e2e8f0; }
.result-item .match { color: #2563eb; font-weight: 600; }
```

```javascript
const languages = [
  "Python", "JavaScript", "TypeScript", "Rust",
  "Go", "Java", "C++", "Swift", "Kotlin", "Ruby",
]

const searchInput = document.querySelector("#search")
const results = document.querySelector("#results")

function renderItem(name) {
  const li = document.createElement("li")
  li.className = "result-item"
  li.textContent = name
  return li
}

function render(query) {
  const filtered = query
    ? languages.filter(lang => lang.toLowerCase().includes(query.toLowerCase()))
    : languages
  results.replaceChildren(...filtered.map(renderItem))
}

render("")

searchInput.addEventListener("input", () => render(searchInput.value.trim()))
```

Every keystroke calls `render()` which filters the data and rebuilds the DOM from scratch. This is simple, correct, and fast enough for small datasets.

`lang.toLowerCase().includes(query.toLowerCase())` — case-insensitive substring match. `String.includes(substring)` returns `true` if `substring` appears anywhere in the string.

## Sorting

Add a sort control by re-rendering with a different comparison function:

```html
<div id="app2">
  <div style="margin-bottom:10px;">
    <button class="sort-btn" data-sort="name">Sort by name</button>
    <button class="sort-btn" data-sort="price">Sort by price</button>
  </div>
  <table id="item-table" style="border-collapse:collapse;width:100%;"></table>
</div>
```

```css
.sort-btn { padding: 6px 12px; margin-right: 6px; cursor: pointer; border: 1px solid #e2e8f0; border-radius: 6px; }
.sort-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
td, th { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
```

```javascript
const items = [
  { name: "Pencil", price: 0.99 },
  { name: "Notebook", price: 4.99 },
  { name: "Eraser", price: 0.49 },
  { name: "Ruler", price: 2.49 },
]

const table = document.querySelector("#item-table")
const sortBtns = document.querySelectorAll(".sort-btn")
let sortKey = "name"

function renderTable(data, key) {
  const sorted = [...data].sort((a, b) => {
    if (typeof a[key] === "string") return a[key].localeCompare(b[key])
    return a[key] - b[key]
  })

  const rows = sorted.map(item => {
    const tr = document.createElement("tr")
    tr.innerHTML = `<td>${item.name}</td><td>$${item.price.toFixed(2)}</td>`
    return tr
  })

  const header = document.createElement("tr")
  header.innerHTML = "<th>Name</th><th>Price</th>"

  table.replaceChildren(header, ...rows)
}

sortBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    sortKey = btn.dataset.sort
    sortBtns.forEach(b => b.classList.remove("active"))
    btn.classList.add("active")
    renderTable(items, sortKey)
  })
})

renderTable(items, sortKey)
```

`[...data].sort(...)` — spreads `data` into a new array before sorting. `Array.sort` mutates in place; spreading creates a copy to avoid modifying the original.
`a[key].localeCompare(b[key])` — compares strings in locale-aware order. Returns negative, 0, or positive — the values `Array.sort` expects from its comparator.
`tr.innerHTML = ...` — safe here because `item.name` and `item.price` come from the developer-controlled `items` array, not user input.

## Challenge: render_scoreboard

Write a function `renderScoreboard(containerId, scores)` where `scores` is an array of `{ name: string, score: number }` objects. Render an ordered list (`<ol>`) inside the container, with one `<li>` per entry showing `"Name: Score"`, sorted by score descending (highest first).

`[...scores].sort((a, b) => b.score - a.score)` sorts descending. Append the `<ol>` to the container using `appendChild`.

```challenge
function renderScoreboard(containerId, scores) {
  // TODO
}
```

```test
document.body.innerHTML = '<div id="board"></div>'
renderScoreboard("board", [{ name: "Ada", score: 95 }, { name: "Grace", score: 88 }, { name: "Linus", score: 99 }])
const ol = document.querySelector("#board ol")
assert ol !== null
assert ol.children.length === 3
assert ol.children[0].textContent === "Linus: 99"
assert ol.children[1].textContent === "Ada: 95"
assert ol.children[2].textContent === "Grace: 88"
```
