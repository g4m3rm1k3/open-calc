---
series: html-dom
level: 7
title: The Event Object & Bubbling
lang: javascript
---

# The Event Object & Bubbling

Every event handler receives an **event object** as its first argument. The event object carries everything the browser knows about the event: what happened, where it happened, which element triggered it, and whether it is still propagating. Understanding `event.target`, bubbling, and `event.preventDefault` unlocks patterns that are impossible without them — including event delegation, the technique that makes dynamic lists work.

## event.target vs event.currentTarget

`event.target` — the element that the event **originated** on (where the user actually clicked).
`event.currentTarget` — the element the **listener is registered** on (always the element you called `addEventListener` on).

These are different when an event bubbles up from a child:

```html
<div id="outer">
  Outer div
  <p id="inner">Inner paragraph — click me</p>
</div>
```

```css
#outer { padding: 20px; background: #f1f5f9; border-radius: 8px; cursor: pointer; }
#inner { background: #dbeafe; padding: 12px; border-radius: 6px; margin-top: 8px; }
```

```javascript
const outer = document.querySelector("#outer")

outer.addEventListener("click", event => {
  console.log("target:", event.target.id)
  console.log("currentTarget:", event.currentTarget.id)
})
```

```text
(if #inner is clicked)
target: inner
currentTarget: outer

(if the outer div itself is clicked)
target: outer
currentTarget: outer
```

When `#inner` is clicked, the click event fires on `#inner` first, then **bubbles up** to `#outer`. The listener on `#outer` fires, but `event.target` is still `#inner` — where the click originated.

**CS lens:** Event bubbling traverses the DOM tree upward from the target to the root (`document`, then `window`). This is the **capture-then-bubble** model: events first travel down from window to target (capture phase), then back up (bubble phase). `addEventListener` registers on the bubble phase by default. Capture-phase listeners can be registered with `{ capture: true }`, but this is rarely needed.

## Event Delegation

Because events bubble, one listener on a parent can handle events from all children — including children added after the listener was registered:

```html
<ul id="todo-list">
  <li>Buy groceries <button class="delete">✕</button></li>
  <li>Write tests <button class="delete">✕</button></li>
  <li>Ship feature <button class="delete">✕</button></li>
</ul>
<button id="add">Add task</button>
```

```css
#todo-list { list-style: none; padding: 0; }
#todo-list li { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #e2e8f0; }
.delete { border: none; background: #fee2e2; color: #b91c1c; border-radius: 4px; padding: 2px 8px; cursor: pointer; }
#add { margin-top: 10px; padding: 8px 14px; cursor: pointer; }
```

```javascript
const list = document.querySelector("#todo-list")
const addBtn = document.querySelector("#add")
let taskCount = 4

list.addEventListener("click", event => {
  if (event.target.classList.contains("delete")) {
    event.target.closest("li").remove()
  }
})

addBtn.addEventListener("click", () => {
  const li = document.createElement("li")
  li.innerHTML = `Task ${taskCount} <button class="delete">✕</button>`
  taskCount++
  list.append(li)
})
```

The single listener on `#todo-list` handles all delete buttons — both existing ones and any added dynamically. The pattern: check `event.target` to identify *what* was clicked, then navigate the tree to find the element to act on.

`event.target.closest("li")` — walks up from the clicked button to find its containing `<li>`. Introduced in Level 5; the pattern appears here in its natural context.

## stopPropagation — Stopping the Bubble

`event.stopPropagation()` — prevents the event from bubbling further up the tree:

```html
<div id="card" style="padding:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;">
  <h3 style="margin:0 0 8px;">Clickable card</h3>
  <button id="action-btn">Action (does not trigger card)</button>
</div>
<p id="log">Click something above</p>
```

```javascript
const card = document.querySelector("#card")
const actionBtn = document.querySelector("#action-btn")
const log = document.querySelector("#log")

card.addEventListener("click", () => {
  log.textContent = "Card was clicked"
})

actionBtn.addEventListener("click", event => {
  event.stopPropagation()
  log.textContent = "Button was clicked (card did NOT fire)"
})
```

`event.stopPropagation()` in the button's listener prevents the click from reaching `#card`. Without it, clicking the button would fire both handlers.

**SE lens:** Use `stopPropagation` sparingly. It creates invisible coupling between components — the button's behavior now depends on the card's listener existing. Event delegation is usually a better pattern: let events bubble and filter by `event.target` at the parent.

## preventDefault — Stopping Default Browser Behavior

`event.preventDefault()` — stops the browser's built-in response to the event. It does not stop the event from bubbling:

```html
<form id="signup" style="display:flex;flex-direction:column;gap:10px;max-width:280px;">
  <input id="email" type="email" placeholder="Enter email" style="padding:8px;border:1px solid #e2e8f0;border-radius:6px;">
  <button type="submit" style="padding:10px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;">Sign up</button>
</form>
<p id="result"></p>
```

```javascript
const form = document.querySelector("#signup")
const result = document.querySelector("#result")

form.addEventListener("submit", event => {
  event.preventDefault()

  const email = document.querySelector("#email").value.trim()

  if (!email.includes("@")) {
    result.textContent = "Invalid email address"
    result.style.color = "#dc2626"
    return
  }

  result.textContent = `Signed up: ${email}`
  result.style.color = "#16a34a"
})
```

Without `event.preventDefault()`, `submit` causes a full page reload (the browser's default form submission). `preventDefault` intercepts this, allowing JavaScript to handle the submission instead.

`event.target.value` on a form input reads the current value. `form.addEventListener("submit", ...)` is the correct place to intercept form submission — not `button.addEventListener("click", ...)`, which misses keyboard submissions (pressing Enter in the input).

## Challenge: delegated_highlight

Write a function `setupHighlight(tableId)` that registers one click listener on the table element. When any `<td>` is clicked, toggle the class `"selected"` on it. Use event delegation — one listener on the table, check `event.target.tagName`.

`element.tagName` returns the tag name in uppercase: `"TD"`, `"TR"`, `"TABLE"`.

```challenge
function setupHighlight(tableId) {
  // TODO
}
```

```test
document.body.innerHTML = '<table id="t"><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>'
setupHighlight("t")
const cells = document.querySelectorAll("td")
cells[0].click()
assert cells[0].classList.contains("selected") === true
cells[0].click()
assert cells[0].classList.contains("selected") === false
cells[2].click()
assert cells[2].classList.contains("selected") === true
```
