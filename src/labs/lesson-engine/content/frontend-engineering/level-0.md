---
series: frontend-engineering
level: 0
title: The Frontend Engineering Model
lang: javascript
---

# The Frontend Engineering Model

A web application frontend is a running JavaScript program that lives in the user's browser. It has a DOM, handles user events, manages state, communicates with a server, and must stay responsive while doing all of these things. Frontend engineering is the discipline of building this system well: with maintainable state, responsive UI, accessible interactions, and good performance.

This series focuses on the patterns and practices that distinguish professional frontend code from basic DOM manipulation: component thinking, state management, the render cycle, performance, and accessibility. By the end you will have a mental model for building robust browser applications that scales to large codebases.

## What a frontend application is

```text
A FRONTEND APPLICATION IS:
  A long-running JavaScript program that:
    1. Maintains STATE (what the user sees and has done)
    2. RENDERS that state to the DOM (what's on screen)
    3. Handles EVENTS (user input, network responses)
    4. Transitions STATE in response to events
    5. RE-RENDERS when state changes

THE CORE LOOP:
  State → Render → Event → New State → Re-render → Event → ...

  This is the fundamental cycle of every frontend framework:
    React: useState + useEffect
    Vue:   reactive data + watchers
    Svelte: $: reactive statements
    Angular: components + change detection
    Vanilla: manual DOM updates after event handlers

  Understanding this cycle is more important than knowing any specific framework.
  Frameworks are different implementations of the same pattern.
```

## State: the source of truth

```javascript
// WRONG: state scattered across DOM (the DOM IS the state)
function addItem() {
  const list = document.getElementById('item-list')
  const text = document.getElementById('item-input').value
  const li = document.createElement('li')
  li.textContent = text
  list.appendChild(li)
  // To know how many items exist: count DOM nodes!
  // To reset the list: clear the DOM!
  // The DOM is the source of truth → fragile, hard to test
}

// CORRECT: state in JavaScript objects, DOM derived from state
const state = {
  items: [],
  inputValue: '',
}

function addItem() {
  state.items.push(state.inputValue)
  state.inputValue = ''
  render(state)   // derive the DOM from state
}

function render(state) {
  document.getElementById('item-list').innerHTML =
    state.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')
  document.getElementById('item-input').value = state.inputValue
}
```

```text
STATE MANAGEMENT PRINCIPLES:
  → State lives in JavaScript objects, NOT in the DOM
  → The DOM is derived from state (a view of state)
  → To change what the user sees: change state, then render
  → To know the current state of the app: read state objects, not DOM nodes

  WHY THIS MATTERS:
  → You can test state transitions without a browser (pure function tests)
  → You can serialize state (localStorage, server sync, undo/redo)
  → You can reproduce any UI state by setting state and rendering
  → Complex interactions are manageable: they are state transitions
```

**CS lens:** The state→render→event loop is the **model-view-controller** (MVC) pattern applied to single-page applications, with a reactive rendering layer. State is the model. The DOM is the view. Events are the controller. The key innovation in modern frameworks (React, Vue, Svelte) is **reactive rendering**: instead of manually calling `render()` after every state change, the framework observes state changes and re-renders automatically. The underlying principle — derive the view from the model — is the same.

## Component thinking

A large frontend application cannot be one function that renders everything. Components are the units of decomposition: each component owns a piece of the state and knows how to render itself.

```javascript
// A component: a function that renders a piece of state and handles its events
function createTodoItem(container, { text, done, onToggle, onDelete }) {
  const el = document.createElement('li')
  el.className = done ? 'done' : ''
  el.innerHTML = `
    <span>${escapeHtml(text)}</span>
    <button class="toggle">Toggle</button>
    <button class="delete">Delete</button>
  `

  el.querySelector('.toggle').onclick = onToggle
  el.querySelector('.delete').onclick = onDelete

  container.appendChild(el)

  return {
    update({ text, done }) {
      el.className = done ? 'done' : ''
      el.querySelector('span').textContent = text
    },
    destroy() {
      el.remove()
    },
  }
}
```

```text
COMPONENT INTERFACE PATTERN:
  Every component should have:
    create(container, props) → { update(newProps), destroy() }
    or: render(props) → HTML string (for simpler components)

  create: initialises the DOM, attaches event listeners
  update: updates the DOM in response to new props/state
  destroy: removes DOM, cleans up event listeners (prevents leaks)

  This mirrors what React (mount/update/unmount), Vue (created/updated/destroyed),
  and other frameworks provide as lifecycle hooks.
```

## The render cycle and performance

```javascript
// NAIVE: re-render everything on every state change
function render(state) {
  // Destroys and recreates ALL DOM nodes on every keystroke, click, etc.
  document.getElementById('app').innerHTML = buildHtml(state)
  // Problem: scroll position reset, focus lost, animations interrupted,
  //          expensive for large DOMs, accessibility announcements broken
}

// BETTER: update only what changed (targeted updates)
function render(prevState, nextState) {
  // Only update items that changed:
  if (prevState.title !== nextState.title) {
    document.getElementById('title').textContent = nextState.title
  }
  if (prevState.items !== nextState.items) {
    reconcileList(prevState.items, nextState.items)
  }
}

// FRAMEWORK APPROACH: virtual DOM diffing (React, Vue, Inferno)
// 1. Build a virtual tree of the new state (plain JS objects, not real DOM)
// 2. Diff the virtual tree against the previous virtual tree
// 3. Apply only the differences to the real DOM
// Result: minimal DOM mutations, automatic efficiency
```

**SE lens:** The progression from innerHTML replacement to targeted updates to virtual DOM is a tradeoff between simplicity and efficiency. innerHTML replacement is simple but inefficient (destroys all DOM state). Targeted updates are efficient but manual (you must track what changed). Virtual DOM is automatic and efficient but has framework overhead. For small applications, targeted updates are the best tradeoff. For large, complex applications with frequent re-renders, a virtual DOM framework (React, Vue) pays for its overhead. Choose the simplest approach that meets the performance requirement.

**Common mistakes:**
- Storing state in the DOM and reading it back — `const count = parseInt(el.textContent)` — the DOM is not the source of truth for state. If you need to know the current count, read `state.count`, not the DOM.
- Re-rendering on every event without checking if state actually changed — if the user presses a key that doesn't change any state, `render()` should be a no-op. Check `if (newState !== oldState)` before re-rendering.
- Not cleaning up event listeners when components are destroyed — event listeners keep references to component closures. Without cleanup, destroyed components leak memory and may cause bugs (firing events for removed DOM elements).

**Debug tip:** To understand frontend state bugs: open the browser console and inspect the state object directly. Add `window.appState = state` to make it globally accessible from the DevTools console. Then you can query `appState.items.length`, `appState.user`, etc., to verify that the state matches what you see on screen. If state is correct but the DOM looks wrong, the bug is in rendering. If state is wrong, the bug is in event handling.

## Challenge: state_machine

Implement a simple state machine for a form with multiple states.

```challenge
function createFormStateMachine(initialState = 'idle') {
  // States: 'idle' | 'submitting' | 'success' | 'error'
  // Transitions:
  //   idle       → submitting  (on 'submit')
  //   submitting → success     (on 'resolve')
  //   submitting → error       (on 'reject')
  //   error      → idle        (on 'reset')
  //   success    → idle        (on 'reset')
  //
  // Invalid transitions: throw Error('Invalid transition: X → Y via Z')
  //
  // Returns: { getState(), transition(event), canTransition(event), history }
  //   history: array of { from, to, event } objects (most recent last)
}
```

```test
const machine = createFormStateMachine()
assert machine.getState() === 'idle'

machine.transition('submit')
assert machine.getState() === 'submitting' && machine.canTransition('resolve') && !machine.canTransition('submit')

machine.transition('resolve')
assert machine.getState() === 'success'

machine.transition('reset')
assert machine.getState() === 'idle' && machine.history.length === 3
assert machine.history[0].from === 'idle' && machine.history[0].to === 'submitting' && machine.history[0].event === 'submit'

// Invalid transition should throw
let threw = false, errMsg = ''
try { machine.transition('reject') } catch (e) { threw = true; errMsg = e.message }
assert threw && errMsg.includes('Invalid transition')
```
