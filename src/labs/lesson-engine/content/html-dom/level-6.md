---
series: html-dom
level: 6
title: Events & addEventListener
lang: javascript
---

# Events & addEventListener

Everything visible on a webpage that responds to the user is driven by events. A click, a keypress, a form submission, a mouse entering an element — the browser packages each of these as an **event object** and dispatches it to any listeners registered on the target element. Without events, JavaScript can only run once when the page loads and then go silent.

## addEventListener — Registering a Handler

`element.addEventListener(eventType, handler)` — registers `handler` to run whenever `eventType` fires on `element`. `handler` is a function; it receives the event object as its first argument.

```html
<button id="counter-btn">Clicked 0 times</button>
```

```css
#counter-btn {
  padding: 12px 24px;
  font-size: 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
#counter-btn:hover { background: #1d4ed8; }
```

```javascript
const btn = document.querySelector("#counter-btn")
let count = 0

btn.addEventListener("click", () => {
  count++
  btn.textContent = `Clicked ${count} times`
})
```

`"click"` — the event type name. The browser fires this whenever the user clicks the element.
`() => { count++; ... }` — the handler. It runs every time the event fires. `count` is closed over from the outer scope (JavaScript Fundamentals Level 6 — closures).

The browser creates a new event object for every click and passes it to the handler. Here the handler ignores it (no parameter), but it is always available.

**CS lens:** `addEventListener` adds the handler to the element's **event listener list** — an internal array of `{type, handler, options}` records. When an event fires, the browser iterates this list and calls every matching handler in registration order. Multiple listeners on the same element for the same event type all run — they do not overwrite each other.

## Common Event Types

```text
"click"       — mouse button clicked (or tapped on mobile)
"dblclick"    — double-click
"mouseenter"  — mouse cursor enters the element (does not bubble)
"mouseleave"  — mouse cursor leaves the element (does not bubble)
"mouseover"   — mouse cursor enters the element or any descendant (bubbles)
"keydown"     — a key is pressed (fires on the focused element)
"keyup"       — a key is released
"input"       — the value of an input or textarea changes
"change"      — value changed and element lost focus (checkboxes fire immediately)
"submit"      — a form is submitted
"focus"       — an element receives focus
"blur"        — an element loses focus
"load"        — a resource (image, script) finished loading
"DOMContentLoaded" — HTML parsed and DOM ready (fires on document)
```

```html
<input id="search" type="text" placeholder="Type here...">
<p id="live"></p>
```

```css
#search { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; width: 240px; }
#live { color: #475569; margin-top: 8px; }
```

```javascript
const search = document.querySelector("#search")
const live = document.querySelector("#live")

search.addEventListener("input", event => {
  live.textContent = `You typed: "${event.target.value}" (${event.target.value.length} chars)`
})

search.addEventListener("focus", () => {
  search.style.outline = "2px solid #2563eb"
})

search.addEventListener("blur", () => {
  search.style.outline = ""
})
```

`event.target.value` — reads the current value of the input element. `event.target` is the element the event fired on (the input). `.value` is the property containing the current text.

## removeEventListener — Stopping a Handler

`element.removeEventListener(eventType, handler)` — removes a previously registered handler. The handler reference must be the same function object that was passed to `addEventListener`:

```html
<button id="once-btn">Click me (works once)</button>
<p id="status">Waiting...</p>
```

```css
#once-btn { padding: 10px 20px; cursor: pointer; }
#status { margin-top: 8px; color: #475569; }
```

```javascript
const btn = document.querySelector("#once-btn")
const status = document.querySelector("#status")

function handleClick() {
  status.textContent = "Clicked! Button is now disabled."
  btn.removeEventListener("click", handleClick)
  btn.disabled = true
}

btn.addEventListener("click", handleClick)
```

`handleClick` is stored in a named variable so the same reference can be passed to both `addEventListener` and `removeEventListener`. Arrow functions assigned to `const` work identically.

**SE lens:** Arrow functions defined inline as `addEventListener("click", () => { ... })` cannot be removed with `removeEventListener` — you have no reference to the specific function object. For disposable one-shot handlers, the `{ once: true }` option is cleaner: `element.addEventListener("click", handler, { once: true })` — the browser removes the listener automatically after the first fire.

## Listening for Keyboard Events

`"keydown"` fires whenever any key is pressed while the element (or `document`) has focus:

```html
<div id="game-area" tabindex="0">
  <p>Press arrow keys to move the dot</p>
  <div id="dot" style="width:24px;height:24px;background:#2563eb;border-radius:50%;position:relative;left:0;top:0;"></div>
</div>
```

```css
#game-area { border: 2px solid #e2e8f0; padding: 20px; border-radius: 8px; height: 120px; position: relative; outline: none; }
#game-area:focus { border-color: #2563eb; }
```

```javascript
const area = document.querySelector("#game-area")
const dot = document.querySelector("#dot")
let x = 0
let y = 0

area.focus()

area.addEventListener("keydown", event => {
  const step = 10
  if (event.key === "ArrowRight") x += step
  if (event.key === "ArrowLeft")  x -= step
  if (event.key === "ArrowDown")  y += step
  if (event.key === "ArrowUp")    y -= step
  dot.style.left = x + "px"
  dot.style.top  = y + "px"
  event.preventDefault()
})
```

`event.key` — the string name of the key pressed: `"ArrowRight"`, `"Enter"`, `"a"`, `"A"`, `"Escape"`, etc.
`event.preventDefault()` — stops the browser's default action for this event. Arrow keys normally scroll the page; `preventDefault` stops that.
`tabindex="0"` — makes the `div` focusable (normally only form elements and links are). Required for it to receive `keydown` events.

## Challenge: once_counter

Write a function `onceCounter(buttonId, displayId, limit)` that:
1. Finds the button by `buttonId` and the display by `displayId`
2. On each click, increments a counter and shows it in the display as `"Count: N"`
3. When the count reaches `limit`, removes the event listener so further clicks have no effect

Store the handler in a named variable so it can be passed to `removeEventListener`.

```challenge
function onceCounter(buttonId, displayId, limit) {
  // TODO
}
```

```test
document.body.innerHTML = '<button id="b">Click</button><span id="d">Count: 0</span>'
onceCounter("b", "d", 3)
const b = document.querySelector("#b")
b.click(); b.click(); b.click(); b.click(); b.click()
assert document.querySelector("#d").textContent === "Count: 3"
```
