# SE Masterclass — LAB-29 — Raw DOM Manipulation

**Language: TypeScript (Browser)** — the runtime for all of Phase 3.
*Why no framework yet:* Every framework (React, Vue, Svelte) ultimately does its work by calling the SAME browser APIs this lab uses directly. Feeling how tedious and error-prone that is BEFORE seeing React makes every abstraction React provides land as "oh, THAT'S the problem this solves" instead of unmotivated syntax to memorize.

**Prerequisites:** All of Phase 2. No browser or DOM experience assumed.

**Environment setup (used for all of Phase 3):**
```bash
npm create vite@latest se-masterclass-frontend -- --template vanilla-ts
cd se-masterclass-frontend
npm install
npm run dev
```
This starts a dev server (usually `http://localhost:5173`) that auto-reloads whenever you save a file. Open that URL in your browser and keep it open — every "SAVE AND TRY" in Phase 3 means "save the file, then look at the browser tab."

**What this lab adds:**
- `document.createElement`, `appendChild`, `removeChild` — building DOM structure with code, no HTML template
- `addEventListener` — wiring user interaction manually
- Manually re-rendering a list when data changes — and feeling exactly how error-prone that is
- The exact pain that motivates every framework covered starting in LAB-32

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `<div>Hello</div>` in HTML and `document.createElement('div')` + setting `.textContent = 'Hello'` in JavaScript — do they produce the same thing?
> 2. If you have a list of 5 items rendered as 5 `<li>` elements, and ONE item's text changes, what's the simplest (if not the most efficient) way to update the DOM?
> 3. What do you think happens if you call `addEventListener('click', fn)` on an element, then later create a BRAND NEW element to replace it, without removing the old listener first?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, `http://localhost:5173` shows a working counter and a working to-do list, built with ZERO HTML written by hand beyond an empty `<div id="app">` — every element is constructed with JavaScript/TypeScript DOM calls.

```
Counter: 0        [+1]

To-Do List
[ new item...        ] [Add]
• Buy milk        [x]
• Walk the dog    [x]
```

Clicking `[+1]` increments the counter. Typing in the input and clicking `[Add]` adds a new to-do item. Clicking `[x]` removes that item.

---

### Concept: The DOM Is Just a Tree (LAB-06, Revisited)

**What it is:** The DOM (Document Object Model) is the browser's IN-MEMORY tree representation of a web page — exactly LAB-06's tree structure, where each node is an element (`<div>`, `<li>`, `<button>`) with children. HTML you write is PARSED into this tree once, at load time; after that, EVERYTHING visible on the page is just this tree being rendered.

**The problem before:** Without understanding the DOM as a tree you can manipulate, "how does JavaScript change what's on screen" seems like magic. It isn't — it's LAB-06's `insert`/traversal operations, just on a tree the BROWSER maintains and re-paints automatically whenever it changes.

**The solution:** `document.createElement(tag)` creates a new tree NODE (LAB-06's `TreeNode`, conceptually). `parent.appendChild(child)` links it in (LAB-06's `insert`). The browser handles re-painting automatically the instant the tree changes — you never call a `render()` function yourself at this raw level.

**Project Application (The "Why" here):** This lab builds UI the same way LAB-06 built a tree by hand — direct node creation and linking — before LAB-32 introduces a system that manages this tree FOR you, the same way a database ORM (LAB-62) manages SQL for you after you've written raw queries by hand.

---

## Step 1 — Create Elements With Code

Replace the contents of `src/main.ts`:

```ts
// main.ts
const app = document.querySelector<HTMLDivElement>('#app')!

const heading = document.createElement('h2')      // ← add: create a node — not yet attached to anything
heading.textContent = 'Counter: 0'                   // ← add: set its text content directly

app.appendChild(heading)                              // ← add: attach it — THIS is what makes it visible
```

Confirm `index.html` has an empty `<div id="app"></div>` (Vite's default template already includes this).

### SAVE AND TRY

Save. Look at the browser tab.

**You should see:** The text "Counter: 0" rendered as a heading, with NOTHING written in `index.html` to produce it — every bit of that text came from JavaScript creating and attaching a DOM node.

**In the browser's DevTools console (F12), type:**
```js
document.querySelector('#app').innerHTML
```
**Expected:** `"<h2>Counter: 0</h2>"` — confirming the DOM tree now genuinely contains the node you created, exactly as if you'd typed that HTML by hand.

**Change something:** Change `heading.textContent` to your name. Save. Confirm the page updates (Vite's dev server auto-reloads on save).

---

## Step 2 — Wire a Click Event

```ts
let count = 0                                          // ← add: plain JS variable — the "state," held manually

const button = document.createElement('button')
button.textContent = '+1'

button.addEventListener('click', () => {                // ← add: wire the interaction
  count++                                                 // ← add: update the state
  heading.textContent = `Counter: ${count}`               // ← add: MANUALLY sync the DOM to match — nobody does this for you
})

app.appendChild(button)
```

### SAVE AND TRY

Save. Click the `+1` button several times in the browser.

**You should see:** "Counter: 0" becomes "Counter: 1", "Counter: 2", and so on, with each click.

**Confirm the two-step manual dance:** Notice `count++` (update the DATA) and `heading.textContent = ...` (update the DISPLAY) are TWO SEPARATE lines you had to write TOGETHER, by hand. Nothing automatically kept the DOM in sync with `count` — if you forgot the second line, `count` would silently increment in memory while the SCREEN stayed frozen at "Counter: 0." This exact gap — remembering to manually re-sync every piece of UI whenever ANY piece of state changes — is precisely the problem LAB-31 studies directly, and LAB-32's reactivity model solves structurally.

---

## Step 3 — Render a List by Hand

```ts
interface Todo {
  id: number
  text: string
}

let todos: Todo[] = [
  { id: 1, text: 'Buy milk' },
  { id: 2, text: 'Walk the dog' },
]
let nextId = 3

const list = document.createElement('ul')
app.appendChild(list)

function renderList(): void {
  list.innerHTML = ''                                    // ← add: WIPE every child — the crudest possible "update"
  for (const todo of todos) {                              // ← add: rebuild EVERY item from scratch, every time
    const item = document.createElement('li')
    item.textContent = todo.text
    list.appendChild(item)
  }
}

renderList()                                              // ← add: initial render
```

### SAVE AND TRY

Save. You should see a bulleted list: "Buy milk" and "Walk the dog."

**In the DevTools console:**
```js
document.querySelector('ul').children.length
```
**Expected:** `2`

**Confirm the "wipe and rebuild" strategy works, but notice the cost:** `list.innerHTML = ''` destroys BOTH existing `<li>` elements completely, and the loop creates TWO BRAND NEW ones — even for items whose text never changed. For 2 items, this is invisible. Later labs (LAB-36's virtual DOM) exist specifically because "destroy everything, rebuild everything" becomes genuinely slow and loses things like input focus or scroll position once a list has thousands of items or the items contain interactive elements.

**Change something:** Add a THIRD todo directly to the `todos` array (`todos.push({ id: 3, text: 'Read a book' })`) followed by `renderList()`. Confirm all three items appear — but also confirm (via DevTools' "Elements" panel) that ALL THREE `<li>` DOM nodes are NEW objects after this call, not just one appended node.

---

## Step 4 — Add and Remove Items

```ts
const input = document.createElement('input')
input.placeholder = 'new item...'

const addButton = document.createElement('button')
addButton.textContent = 'Add'

addButton.addEventListener('click', () => {
  if (input.value.trim() === '') return                   // boundary validation — LAB-09's instinct, still here
  todos.push({ id: nextId++, text: input.value })
  input.value = ''
  renderList()                                              // ← re-render EVERYTHING after every single change
})

app.insertBefore(addButton, list)
app.insertBefore(input, addButton)
```

Update `renderList` to include a remove button per item:

```ts
function renderList(): void {
  list.innerHTML = ''
  for (const todo of todos) {
    const item = document.createElement('li')
    item.textContent = todo.text + ' '

    const removeButton = document.createElement('button')    // ← add: a new button, created fresh EVERY render
    removeButton.textContent = 'x'
    removeButton.addEventListener('click', () => {             // ← add: a NEW listener, attached EVERY render
      todos = todos.filter(t => t.id !== todo.id)
      renderList()
    })

    item.appendChild(removeButton)
    list.appendChild(item)
  }
}
renderList()
```

### SAVE AND TRY

Save. Type something in the input, click "Add" — confirm it appears in the list. Click an item's "x" — confirm it disappears.

**Confirm the listener-recreation cost, directly:** Every single `renderList()` call throws away ALL existing `<li>` elements (and their click listeners, which the browser automatically cleans up when a node is removed) and builds BRAND NEW ones with BRAND NEW listeners attached. For a to-do list, this is wasteful but harmless. For an input field mid-typing, this exact pattern would DESTROY the input element the user is actively focused on — a real, common raw-DOM bug.

---

## 🎯 Challenge: Feel the Focus-Loss Bug

**You know:** `renderList()` destroys and recreates every DOM node on every change.

**Task:** Add an `<input>` INSIDE each todo item (for inline editing) instead of just plain text. Click into one item's input to focus it, then trigger `renderList()` from a DIFFERENT action (like adding a new todo). Observe what happens to your focus and cursor position.

<details>
<summary>▶ Show Solution</summary>

```ts
// Inside renderList()'s loop, replace item.textContent with:
const editInput = document.createElement('input')
editInput.value = todo.text
item.appendChild(editInput)
```

**What you'll observe:** The moment `renderList()` runs again (say, from clicking "Add" on a NEW todo), your cursor focus and any partially-typed text in that inline edit input are COMPLETELY LOST — a brand new `<input>` DOM node was created, and the browser has no way to know it's "supposed to be" the same logical input as before. **Key insight:** This is not a contrived example — it is one of THE most common real bugs in hand-rolled DOM code, and it is EXACTLY the problem React's virtual DOM (LAB-36) and its reconciliation algorithm exist to solve: matching up old and new elements by identity/key, updating only what changed, and PRESERVING focus, scroll position, and other DOM-only state across re-renders.

</details>

---

## Mental Model: What You Just Did Manually

| This lab, by hand | What a framework automates |
|---|---|
| `document.createElement` + `appendChild` | JSX/templates compiled down to exactly this |
| `heading.textContent = ...` after `count++` | Automatic re-render when reactive state changes (LAB-32) |
| `list.innerHTML = ''` then rebuild everything | Diffing old vs. new, updating only what changed (LAB-36) |
| Re-attaching a `click` listener every render | Framework-managed event delegation, attached once |
| Losing focus on re-render (the Challenge) | Reconciliation by element identity/key |

**Where you will see this again:** LAB-30 (Event Propagation) goes deeper into HOW `addEventListener` actually works — bubbling, capturing, and delegation. LAB-31 (Manual State Sync) pushes THIS lab's counter/list pattern to a breaking point on purpose, so LAB-32's fix lands as obviously necessary.

---

## Final Check

| Feature | How to verify |
|---|---|
| A heading is created and shown with zero hand-written HTML | Step 1 |
| Clicking "+1" updates both the counter variable AND the visible text | Step 2 |
| A list of 2 todos renders as 2 `<li>` elements | Step 3 |
| Adding a todo appends it to the array AND triggers a full re-render | Step 4 |
| Removing a todo filters the array AND triggers a full re-render | Step 4 |
| You witnessed (or can explain) the focus-loss bug from re-rendering | Challenge |
| You can explain, without notes, why "update data, then manually update DOM" doesn't scale | Step 2 |

---

## Quick Check Answers

**1. `<div>Hello</div>` in HTML vs. `createElement` + `.textContent` — same thing?**

Yes, functionally identical — both produce the exact same DOM node in the tree, confirmed in Step 1 by inspecting `innerHTML` and seeing the created element rendered exactly as if it had been written as HTML directly. HTML is PARSED into the DOM tree once; `createElement`/`appendChild` builds that same tree directly, via code, without ever going through a parsing step.

**2. Simplest way to update ONE changed item in a 5-item list?**

The simplest (though not most efficient) approach, demonstrated in Step 3, is "wipe everything and rebuild everything" (`list.innerHTML = ''` then recreate all 5 `<li>` elements) — simple to write, correct, but wasteful: 4 of the 5 elements didn't need to change at all, yet all 5 get destroyed and recreated. The MORE efficient approach (update only the ONE changed `<li>`'s text directly) requires tracking which DOM node corresponds to which data item — exactly the bookkeeping problem LAB-36's virtual DOM diffing exists to automate.

**3. `addEventListener` on an element, then that element gets replaced — what happens to the listener?**

The OLD listener is attached to the OLD element specifically — once that element is removed from the DOM (and has no other references keeping it alive), the browser garbage-collects it, listener included. But if you create a BRAND NEW element to "replace" it (as this lab's `renderList()` does every time), the new element has NO listeners at all until you explicitly `addEventListener` on IT too — which is exactly why Step 4's `renderList()` had to re-attach a fresh `click` listener to each newly created remove button, every single render, or those buttons would silently do nothing when clicked.

---

*Next: [LAB-30 — Event Propagation](LAB-30-event-propagation.md) — TypeScript (Browser), same module*
