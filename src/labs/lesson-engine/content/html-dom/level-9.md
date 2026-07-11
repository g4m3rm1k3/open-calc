---
series: html-dom
level: 9
title: Data Attributes
lang: javascript
---

# Data Attributes

HTML elements can carry arbitrary data through `data-*` attributes. These are custom attributes you define — the browser ignores their content but stores them in the DOM where JavaScript can read and write them through `element.dataset`. They are the standard bridge between the data stored in your HTML and the logic in your JavaScript, without using IDs or classes for things they were not meant for.

## Reading data-* with dataset

Any `data-*` attribute is accessible on `element.dataset` with the `data-` prefix removed and hyphens converted to camelCase:

```html
<ul id="user-list">
  <li data-user-id="1" data-role="admin">Alice</li>
  <li data-user-id="2" data-role="member">Bob</li>
  <li data-user-id="3" data-role="member">Carol</li>
</ul>
```

```css
#user-list { list-style: none; padding: 0; }
li { padding: 10px; border-bottom: 1px solid #e2e8f0; cursor: pointer; }
li:hover { background: #f8fafc; }
```

```javascript
const users = document.querySelectorAll("#user-list li")

for (const user of users) {
  console.log(user.dataset.userId, user.dataset.role, user.textContent)
}
```

```text
1 admin Alice
2 member Bob
3 member Carol
```

`data-user-id` → `dataset.userId` — the hyphen disappears and the following letter is capitalised. This is camelCase conversion of the attribute name after stripping `data-`.

All `dataset` values are **strings**. `user.dataset.userId` is `"1"`, not `1`. Convert with `Number()` or `parseInt()` when you need arithmetic.

**CS lens:** `dataset` is a `DOMStringMap` — a live, writable object backed by the element's attributes. Reading `dataset.foo` is equivalent to `getAttribute("data-foo")`. Writing `dataset.foo = "bar"` is equivalent to `setAttribute("data-foo", "bar")`. The `DOMStringMap` proxy makes the attribute interface look like a plain object.

## Writing and Deleting data-* with dataset

```html
<div id="player" data-score="0" data-level="1">
  <p>Score: <span id="score-display">0</span></p>
  <p>Level: <span id="level-display">1</span></p>
</div>
<button id="score-btn">+10 points</button>
<button id="level-btn">Level up</button>
```

```css
#player { padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; }
button { padding: 8px 14px; margin-right: 8px; cursor: pointer; }
```

```javascript
const player = document.querySelector("#player")
const scoreDisplay = document.querySelector("#score-display")
const levelDisplay = document.querySelector("#level-display")

document.querySelector("#score-btn").addEventListener("click", () => {
  const current = Number(player.dataset.score)
  player.dataset.score = current + 10
  scoreDisplay.textContent = player.dataset.score
})

document.querySelector("#level-btn").addEventListener("click", () => {
  player.dataset.level = Number(player.dataset.level) + 1
  levelDisplay.textContent = player.dataset.level
})
```

`player.dataset.score = current + 10` — writing to `dataset` sets the `data-score` attribute. The value is automatically converted to a string.

**Open the Tree tab** — after clicking the buttons, the `data-score` and `data-level` attributes on `#player` will have updated values visible in the attribute section.

## data-* as Event Delegation Payload

The most powerful pattern: store what an action should do in the HTML, then read it in a delegated listener. This eliminates per-element logic from the event handler:

```html
<div id="toolbar">
  <button data-action="bold">B</button>
  <button data-action="italic">I</button>
  <button data-action="underline">U</button>
  <button data-action="strikethrough">S</button>
</div>
<p id="status">No action yet</p>
```

```css
#toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
#toolbar button { width: 36px; height: 36px; font-weight: bold; cursor: pointer; border: 1px solid #e2e8f0; border-radius: 6px; }
```

```javascript
const toolbar = document.querySelector("#toolbar")
const status = document.querySelector("#status")

toolbar.addEventListener("click", event => {
  const action = event.target.dataset.action
  if (!action) return
  status.textContent = `Applied: ${action}`
})
```

`event.target.dataset.action` — reads `data-action` from the button that was actually clicked. The listener does not need a separate branch for each button — the data attribute carries the instruction.

`if (!action) return` — guards against clicks on the toolbar itself (not a button), where `dataset.action` would be `undefined`.

**SE lens:** This pattern keeps behaviour descriptions in HTML and behaviour implementation in JavaScript, but eliminates the need for a lookup table or `switch` statement. Adding a new button means adding one line of HTML (`<button data-action="newAction">`), not touching the JavaScript. This is the same principle behind HTML `type` attributes and ARIA `role` attributes — declarative configuration in markup, interpreted by scripts.

## Deleting a data-* Attribute

`delete element.dataset.propertyName` — removes the attribute:

```javascript
const item = document.querySelector("#player")
delete item.dataset.level
console.log(item.dataset.level)
```

```text
undefined
```

## Challenge: filter_by_tag

Write a function `filterByTag(listId, tag)` that shows only list items whose `data-tag` attribute matches `tag`, and hides the rest by setting their `style.display` to `"none"` (hide) or `""` (show).

`item.dataset.tag` reads the `data-tag` attribute. Comparing with `=== tag` checks for an exact match.

```challenge
function filterByTag(listId, tag) {
  // TODO
}
```

```test
document.body.innerHTML = '<ul id="items"><li data-tag="fruit">Apple</li><li data-tag="veg">Broccoli</li><li data-tag="fruit">Cherry</li><li data-tag="veg">Daikon</li></ul>'
filterByTag("items", "fruit")
const all = document.querySelectorAll("#items li")
assert all[0].style.display !== "none"
assert all[1].style.display === "none"
assert all[2].style.display !== "none"
assert all[3].style.display === "none"
filterByTag("items", "veg")
assert all[0].style.display === "none"
assert all[1].style.display !== "none"
```
