---
series: browser-apis
level: 1
title: Events and the Event Loop
lang: javascript
---

# Events and the Event Loop

Every interactive browser application is event-driven: it responds to clicks, keystrokes, network responses, timer completions, and scroll events. These are not random — they follow a precise model called the event loop, which determines when event handlers run and why they run in the order they do.

You worked with the event loop in the debugging series (async code). This lesson goes deeper: how the browser event loop works at the browser level, how DOM events propagate through the document, how to use event delegation to handle events efficiently, and why event handling code must remain fast to keep the UI responsive.

## How DOM events work

When something happens in the browser — a button is clicked, a key is pressed, the page finishes loading — the browser creates an **Event** object describing what happened and dispatches it through the DOM.

```javascript
// Adding an event listener:
const button = document.querySelector('#submit-btn')

button.addEventListener('click', function handleClick(event) {
  // event: the Event object — describes what happened
  console.log(event.type)           // 'click'
  console.log(event.target)         // the element that was clicked (the button)
  console.log(event.clientX)        // X coordinate of the click in the viewport
  console.log(event.timeStamp)      // when the event occurred (ms since page load)
})
```

```text
Event object properties (common to all events):
  event.type:           'click', 'keydown', 'submit', 'load', 'resize', etc.
  event.target:         The element that TRIGGERED the event (where it originated).
  event.currentTarget:  The element whose listener is currently running.
                        (Differs from target when using event delegation — see below.)
  event.preventDefault(): Prevents the browser's default action (e.g., stops form submission,
                          stops a link from navigating).
  event.stopPropagation(): Stops the event from propagating further up the DOM tree.
  event.timeStamp:      When the event occurred.
```

## Event propagation: capturing and bubbling

When an event fires on a DOM element, it does not just fire on that element. It propagates through the DOM in two phases:

```text
DOM structure:
  <div id="container">
    <button id="btn">Click me</button>
  </div>

PHASE 1 — CAPTURING (top-down):
  The event travels DOWN from the document root to the target element.
  document → html → body → #container → #btn (the target)
  Listeners registered with { capture: true } fire during this phase.
  Rare in practice — most code uses bubbling.

PHASE 2 — BUBBLING (bottom-up):
  After reaching the target, the event travels BACK UP through ancestors.
  #btn → #container → body → html → document
  Listeners registered with addEventListener(type, handler) [no options] fire during bubbling.
  This is the default — most event handling uses bubbling.

Example:
  container.addEventListener('click', () => console.log('container clicked'))
  btn.addEventListener('click', () => console.log('button clicked'))

  User clicks the button:
    Button listener fires:    "button clicked"
    Container listener fires: "container clicked"   (the click bubbles up to container)
```

```javascript
// event.stopPropagation(): prevents the event from continuing to bubble
btn.addEventListener('click', (event) => {
  event.stopPropagation()   // event stops at the button; container listener does NOT fire
  console.log('button clicked')
})
```

**CS lens:** Event bubbling was designed to solve a fundamental UI problem: a container element often needs to react to events that originate in its children. Without bubbling, you would need to add listeners to every child element. With bubbling, one listener on the container receives events from all descendants. This is the basis of event delegation — and it makes adding and removing children from the DOM easy without managing individual listeners.

## Event delegation: one listener for many elements

Event delegation uses bubbling to handle events from many elements with a single listener on their parent.

```javascript
// WITHOUT delegation: a listener per list item (expensive if the list is dynamic)
const items = document.querySelectorAll('.list-item')
items.forEach(item => {
  item.addEventListener('click', handleItemClick)
})
// Problem: if items are added dynamically, they do not get a listener.
// Problem: 1000 items = 1000 listeners.

// WITH delegation: one listener on the parent handles all items
const list = document.querySelector('#item-list')
list.addEventListener('click', function(event) {
  const item = event.target.closest('.list-item')
  if (!item) return   // click was not on a list item (clicked the gap between items)
  handleItemClick(item)
})
```

```text
closest(selector) — Element method:
  Searches from the current element UP through its ancestors.
  Returns the first element that matches the selector.
  Returns null if no ancestor matches.

  event.target.closest('.list-item'):
    If a .list-item was clicked: returns that element.
    If the .list-item's child text was clicked: travels up, finds the .list-item parent.
    If something outside a .list-item was clicked: returns null.

Event delegation advantages:
  → One listener per container, not per item.
  → Works automatically for dynamically added items — they are already inside the container.
  → Easier cleanup: remove one listener instead of many.
```

## Removing event listeners: preventing memory leaks

Event listeners keep a reference to the handler function. If the handler captures variables (via closure), those variables stay alive as long as the listener exists. Unremoved listeners on removed DOM elements cause memory leaks.

```javascript
// WRONG: anonymous function cannot be removed (no reference to pass to removeEventListener)
button.addEventListener('click', () => { /* ... */ })
button.removeEventListener('click', () => { /* ... */ })   // this is a DIFFERENT function — does nothing

// CORRECT: named function can be removed
function handleClick() { /* ... */ }
button.addEventListener('click', handleClick)
button.removeEventListener('click', handleClick)   // removes the exact same function reference

// AbortController: modern, clean way to remove many listeners at once
const controller = new AbortController()
button.addEventListener('click', handleClick, { signal: controller.signal })
input.addEventListener('input', handleInput, { signal: controller.signal })
// When done (e.g., component unmounts):
controller.abort()   // removes both listeners atomically
```

**SE lens:** Event listener leaks are the most common category of browser memory leaks. The pattern: a component or page adds listeners on a global element (window, document) and never removes them. When the user navigates away, the page is logically gone — but the listeners persist on window, keeping the component's variables alive. Over time (multiple navigation cycles), memory accumulates. The discipline: every `addEventListener` on a non-local element must have a corresponding `removeEventListener` or an AbortController that signals cleanup.

**Common mistakes:**
- Using `event.target` when `event.currentTarget` is needed — in delegation, `event.target` is the element that was clicked (possibly a child); `event.currentTarget` is the element the listener is attached to. Use `event.target.closest(selector)` to find the delegate target.
- Calling `event.preventDefault()` when the default is not a problem — stopping link navigation is useful when building SPA routing; stopping it everywhere causes links to break unexpectedly.
- Forgetting that `addEventListener` adds listeners cumulatively — calling `button.addEventListener('click', fn)` three times adds three listeners. All three fire on each click. Check whether you are adding listeners in a loop or on each render.

**Debug tip:** When an event fires too many times (2x, 3x, 4x the expected number), you have added the listener multiple times. In DevTools, open the Elements panel → Event Listeners tab for the element. It shows every listener currently attached, including duplicates. Remove the duplicate `addEventListener` calls.

## Challenge: event_delegation

Implement a task list that uses event delegation to handle add, complete, and delete operations.

```challenge
function createTaskList(container) {
  // container: a DOM element (the parent for delegation)
  // 
  // Sets up ONE click listener on container using event delegation.
  // Buttons inside task items have data attributes: data-action='complete' or data-action='delete'
  // and data-id='<taskId>'.
  //
  // Returns an object with:
  //   addTask(id, text): appends a <li data-task-id="id"> with two buttons and the text
  //   getCompletedIds(): returns array of task ids that have been completed
  //   getDeletedIds():   returns array of task ids that have been deleted

  const completedIds = []
  const deletedIds   = []

  container.addEventListener('click', function(event) {
    const btn = event.target.closest('[data-action]')
    if (!btn) return
    const action = btn.dataset.action
    const id     = btn.dataset.id
    if (action === 'complete') completedIds.push(id)
    if (action === 'delete')   deletedIds.push(id)
  })

  return {
    addTask(id, text) {
      const li = document.createElement('li')
      li.dataset.taskId = id
      li.innerHTML = `${text}
        <button data-action="complete" data-id="${id}">Complete</button>
        <button data-action="delete"   data-id="${id}">Delete</button>`
      container.appendChild(li)
    },
    getCompletedIds: () => [...completedIds],
    getDeletedIds:   () => [...deletedIds],
  }
}
```

```test
// Simulate a minimal DOM environment for the challenge
const events = {}
const container = {
  _children: [],
  addEventListener(type, fn) { events[type] = fn },
  appendChild(el) { this._children.push(el) },
}

const list = createTaskList(container)
list.addTask('t1', 'Buy milk')
list.addTask('t2', 'Read book')

// Simulate clicking "Complete" on task t1
const completeBtn = { dataset: { action: 'complete', id: 't1' }, closest(sel) { return this } }
events['click']({ target: completeBtn })

// Simulate clicking "Delete" on task t2
const deleteBtn = { dataset: { action: 'delete', id: 't2' }, closest(sel) { return this } }
events['click']({ target: deleteBtn })

assert list.getCompletedIds().includes('t1')
assert list.getDeletedIds().includes('t2')
assert !list.getCompletedIds().includes('t2')
assert container._children.length === 2
```
