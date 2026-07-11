---
series: html-dom
level: 5
title: Removing & Replacing Elements
lang: javascript
---

# Removing & Replacing Elements

Adding elements is only half the picture. Real UIs also delete rows, swap components, and empty containers. The DOM provides three operations: `remove()` removes a node entirely, `replaceWith()` swaps it for something else, and assigning `innerHTML = ""` or `replaceChildren()` empties a parent.

## remove() — Delete a Node

`element.remove()` — removes the element from the DOM and from memory (once no references remain):

```html
<ul id="list">
  <li id="a">Apple</li>
  <li id="b">Banana</li>
  <li id="c">Cherry</li>
</ul>
<button id="remove-b">Remove Banana</button>
```

```css
#list { padding-left: 20px; }
li { padding: 4px 0; }
button { margin-top: 8px; padding: 8px 14px; cursor: pointer; }
```

```javascript
const list = document.querySelector("#list")
const removeBtn = document.querySelector("#remove-b")

removeBtn.addEventListener("click", () => {
  const banana = document.querySelector("#b")
  if (banana) {
    banana.remove()
    console.log("Removed. Children remaining:", list.children.length)
  }
})
```

```text
Removed. Children remaining: 2
```

`if (banana)` — guards against calling `.remove()` on `null` if the element does not exist or was already removed. After `remove()`, querying `#b` returns `null`.

**CS lens:** `remove()` unlinks the node from its parent and siblings in O(1) by updating the parent's `children` list and the adjacent siblings' `nextSibling`/`previousSibling` pointers. The node object itself remains in memory until the last JavaScript reference to it is dropped, at which point the garbage collector reclaims it.

## replaceWith() — Swap One Node for Another

`element.replaceWith(...nodes)` — removes the element and inserts the new nodes in its place (as siblings of the parent):

```html
<div id="container">
  <p id="placeholder">Loading...</p>
</div>
<button id="load">Load content</button>
```

```css
#container { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
.loaded { color: #166534; font-weight: 600; }
button { margin-top: 12px; padding: 8px 14px; cursor: pointer; }
```

```javascript
const loadBtn = document.querySelector("#load")

loadBtn.addEventListener("click", () => {
  const placeholder = document.querySelector("#placeholder")
  if (!placeholder) return

  const content = document.createElement("article")
  content.className = "loaded"
  content.textContent = "Content loaded successfully!"

  placeholder.replaceWith(content)
  loadBtn.disabled = true
  loadBtn.textContent = "Loaded"
})
```

`placeholder.replaceWith(content)` — the `<p>` is removed; the `<article>` takes its exact position in the parent.
`loadBtn.disabled = true` — the `disabled` attribute on a button prevents further clicks. Setting the property to `true` is equivalent to `<button disabled>` in HTML.

**SE lens:** `replaceWith` is the right tool when you want to swap element types — e.g., replacing a skeleton placeholder with real content. Prefer it over setting `innerHTML` because it keeps surrounding siblings intact and does not force a re-parse of the whole parent's content.

## Emptying a Container

Two patterns for removing all children:

`element.innerHTML = ""` — fast, but causes an HTML re-parse (no-op here since the string is empty, but the engine does not know that upfront).

`element.replaceChildren()` — called with no arguments, removes all children without any parsing. Preferred:

```html
<ul id="items">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
<button id="clear">Clear list</button>
<button id="refill">Refill</button>
```

```css
#items { padding-left: 20px; min-height: 60px; }
li { padding: 4px 0; }
button { margin: 8px 4px 0; padding: 8px 12px; cursor: pointer; }
```

```javascript
const items = document.querySelector("#items")
const clearBtn = document.querySelector("#clear")
const refillBtn = document.querySelector("#refill")

clearBtn.addEventListener("click", () => {
  items.replaceChildren()
  console.log("Children after clear:", items.children.length)
})

refillBtn.addEventListener("click", () => {
  items.replaceChildren()
  const newItems = ["Alpha", "Beta", "Gamma"].map(text => {
    const li = document.createElement("li")
    li.textContent = text
    return li
  })
  items.append(...newItems)
})
```

```text
Children after clear: 0
```

`items.replaceChildren()` — zero arguments means "replace all children with nothing."
`items.replaceChildren(...newItems)` — the same method, with arguments, replaces all children with the provided nodes in one atomic operation.

`["Alpha", "Beta", "Gamma"].map(text => { ... })` — creates an array of `<li>` nodes using `Array.map` (JavaScript Fundamentals Level 3). The spread `...newItems` passes them as individual arguments to `append`.

## Removing From a List — Event Delegation Ahead

A common pattern: each item in a list has a delete button. The naive approach is to add one listener per button. But if the list grows at runtime, new items would have no listeners.

```html
<ul id="deletable">
  <li>First item <button class="del" data-target="li">✕</button></li>
  <li>Second item <button class="del" data-target="li">✕</button></li>
</ul>
```

```css
#deletable { padding-left: 20px; }
#deletable li { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; }
.del { border: none; background: #fee2e2; color: #b91c1c; border-radius: 4px; cursor: pointer; padding: 2px 6px; }
```

```javascript
const list = document.querySelector("#deletable")

list.addEventListener("click", event => {
  if (event.target.classList.contains("del")) {
    event.target.closest("li").remove()
  }
})
```

`event.target` — the exact element that was clicked (covered in depth in Level 8).
`element.closest(selector)` — walks up the DOM from the element, returning the first ancestor (or self) that matches `selector`. `event.target.closest("li")` finds the `<li>` containing the button.

This is **event delegation** — one listener on the parent handles clicks from all children. New list items added later automatically work because they are children of the same parent. Event delegation is covered fully in Level 8.

## Challenge: remove_completed

Write a function `removeCompleted(listId)` that removes every `<li>` with the class `"done"` from the list identified by `listId`.

`element.querySelectorAll(selector)` — searches within the element, not the whole document. Use `list.querySelectorAll(".done")` to find only items inside that specific list.

Iterating a `NodeList` and removing nodes during iteration is safe when you convert to an array first: `Array.from(nodeList).forEach(...)`.

```challenge
function removeCompleted(listId) {
  // TODO
}
```

```test
document.body.innerHTML = '<ul id="tasks"><li class="done">Done 1</li><li>Pending</li><li class="done">Done 2</li></ul>'
removeCompleted("tasks")
const remaining = document.querySelectorAll("#tasks li")
assert remaining.length === 1
assert remaining[0].textContent === "Pending"
assert document.querySelectorAll("#tasks .done").length === 0
```
