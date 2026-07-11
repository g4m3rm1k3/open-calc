---
series: html-dom
level: 11
title: State & Re-rendering
lang: javascript
---

# State & Re-rendering

Every interactive application has **state** — data that changes over time and drives what the user sees. The pattern that makes this manageable: store state in a plain JavaScript object, write a `render` function that builds the full UI from that state, and call `render` after every state change. This is the pattern that React, Vue, Svelte, and every other modern framework is built on. This lesson teaches it in raw DOM so you understand what frameworks are doing for you.

## State Is Just an Object

```html
<div id="app">
  <div id="counter-ui"></div>
</div>
```

```css
#counter-ui { text-align: center; padding: 24px; }
#counter-ui .value { font-size: 48px; font-weight: bold; color: #2563eb; margin: 16px 0; }
#counter-ui .controls { display: flex; gap: 12px; justify-content: center; }
button { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
.dec { background: #fee2e2; color: #b91c1c; }
.inc { background: #dcfce7; color: #166534; }
.reset { background: #e2e8f0; color: #475569; }
```

```javascript
const state = { count: 0, step: 1 }

function render() {
  const root = document.querySelector("#counter-ui")

  const title = document.createElement("h2")
  title.textContent = "Counter"

  const value = document.createElement("div")
  value.className = "value"
  value.textContent = state.count

  const controls = document.createElement("div")
  controls.className = "controls"

  const dec = document.createElement("button")
  dec.className = "dec"
  dec.textContent = `−${state.step}`
  dec.addEventListener("click", () => { state.count -= state.step; render() })

  const inc = document.createElement("button")
  inc.className = "inc"
  inc.textContent = `+${state.step}`
  inc.addEventListener("click", () => { state.count += state.step; render() })

  const reset = document.createElement("button")
  reset.className = "reset"
  reset.textContent = "Reset"
  reset.addEventListener("click", () => { state.count = 0; render() })

  controls.append(dec, inc, reset)
  root.replaceChildren(title, value, controls)
}

render()
```

The loop is: **event fires → state updates → render() → new DOM**. `render()` always produces the correct DOM for the current `state`. You never have to think about which elements to update — re-rendering the whole thing is correct and fast for small UIs.

`root.replaceChildren(...)` — atomically swaps all children. Each call to `render()` creates fresh elements. Event listeners are added to the new elements, so they always reference current state.

**CS lens:** This is the **model-view** pattern. `state` is the model — the authoritative source of truth. `render()` is the view — a pure function from state to DOM. Keeping them separate means: to debug, inspect `state`. To change what users see, change `state` and call `render()`. You never hunt through DOM nodes asking "what did I set this to?"

## A Todo App

A more realistic example: a todo list with add and complete functionality.

```html
<div id="todo-app">
  <form id="todo-form" style="display:flex;gap:8px;margin-bottom:16px;">
    <input id="todo-input" placeholder="New task..." style="flex:1;padding:8px;border:1px solid #e2e8f0;border-radius:6px;">
    <button type="submit" style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;">Add</button>
  </form>
  <ul id="todo-list" style="list-style:none;padding:0;"></ul>
  <p id="todo-count" style="color:#64748b;font-size:14px;"></p>
</div>
```

```css
.todo-item { display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid #e2e8f0; }
.todo-item.done span { text-decoration:line-through;color:#94a3b8; }
.todo-item button { border:none;background:#fee2e2;color:#b91c1c;border-radius:4px;padding:2px 8px;cursor:pointer; }
```

```javascript
const todoState = {
  items: [],
  nextId: 1,
}

function renderTodos() {
  const list = document.querySelector("#todo-list")
  const count = document.querySelector("#todo-count")

  const nodes = todoState.items.map(item => {
    const li = document.createElement("li")
    li.className = "todo-item" + (item.done ? " done" : "")

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.checked = item.done
    checkbox.addEventListener("change", () => {
      item.done = checkbox.checked
      renderTodos()
    })

    const text = document.createElement("span")
    text.textContent = item.text

    const del = document.createElement("button")
    del.textContent = "✕"
    del.addEventListener("click", () => {
      todoState.items = todoState.items.filter(i => i.id !== item.id)
      renderTodos()
    })

    li.append(checkbox, text, del)
    return li
  })

  list.replaceChildren(...nodes)

  const remaining = todoState.items.filter(i => !i.done).length
  count.textContent = `${remaining} of ${todoState.items.length} remaining`
}

document.querySelector("#todo-form").addEventListener("submit", event => {
  event.preventDefault()
  const input = document.querySelector("#todo-input")
  const text = input.value.trim()
  if (!text) return
  todoState.items.push({ id: todoState.nextId++, text, done: false })
  input.value = ""
  renderTodos()
})

renderTodos()
```

`todoState.items = todoState.items.filter(i => i.id !== item.id)` — creates a new array with the deleted item removed. Replacing the array (rather than mutating it with `.splice`) is a habit from functional programming: immutable state updates are easier to reason about and debug.

## Why This Scales

The pattern — one state object, one render function, re-render on every change — has three properties that make it the foundation of modern UI development:

```text
1. Predictability:  render(state) always produces the same DOM.
                    No hidden state in the DOM elements themselves.

2. Debuggability:   console.log(state) tells you everything.
                    No need to inspect DOM nodes to understand app state.

3. Correctness:     You cannot get stale DOM.
                    Every render starts from the current state.
```

The cost is performance: rebuilding DOM on every change is wasteful for large lists. React's virtual DOM, Vue's reactive system, and Svelte's compiled updates are all optimisations of this exact pattern — they avoid rebuilding elements that have not changed. But the mental model is the same.

## Challenge: make_toggle_list

Write a function `makeToggleList(containerId, items)` that:
1. Renders a `<ul>` in the container with one `<li>` per item from the `items` array (array of strings)
2. Each `<li>` starts without the class `"active"`
3. Clicking a `<li>` toggles its `"active"` class using the state-driven pattern: update a state array of which indices are active, then re-render

The state must be an array of booleans (one per item). Clicking `<li>` at index `i` toggles `state[i]` and calls render again.

```challenge
function makeToggleList(containerId, items) {
  // TODO
}
```

```test
document.body.innerHTML = '<div id="c"></div>'
makeToggleList("c", ["Apple", "Banana", "Cherry"])
const lis = () => document.querySelectorAll("#c li")
assert lis().length === 3
lis()[0].click()
assert lis()[0].classList.contains("active") === true
assert lis()[1].classList.contains("active") === false
lis()[0].click()
assert lis()[0].classList.contains("active") === false
lis()[2].click()
assert lis()[2].classList.contains("active") === true
```
