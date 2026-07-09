# Conditionals & Lists

## What you will build

A filterable todo list: renders each item from a reactive array, toggles items done, shows an empty state when nothing matches, and filters between All / Active / Done. You can also add new items.

```
[ Add new todo _________ ] [ Add ]

[all] [active] [done]

● Learn Vue components
● Build something real   ✓ (strikethrough)
● Ship it

2 remaining
```

---

## What you need to know first

Lessons 01–03 built reactive state (`ref`), event handling (`@click`), and derived state (`computed`). Every example rendered a *fixed* number of elements — one heading, one counter, three rows. Real applications render a *variable* number of elements based on what the data contains. This lesson adds the directives that make that possible.

---

## Step 1 — Rendering a list without `v-for`, and where it collapses

Before using `v-for`, try the approach you already know. Replace `src/App.vue`:

```html
<script setup lang="ts">
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: 'Learn Vue components', done: false },
  { id: 2, text: 'Build something real', done: false },
  { id: 3, text: 'Ship it', done: false },
])
</script>

<template>
  <ul>
    <li>{{ todos[0].text }}</li>
    <li>{{ todos[1].text }}</li>
    <li>{{ todos[2].text }}</li>
  </ul>
</template>
```

Click **▶ Run**. All three items render. Now add a fourth item in the script:

```typescript
todos.value.push({ id: 4, text: 'Learn composables', done: false })
```

The array has four items. The template has three `<li>` tags. The fourth item is invisible. Now run: the push itself re-renders the template — but the template has no `<li>` for index 3. Nothing shows.

To display the fourth item you would add a fourth `<li>`. A fifth requires a fifth. This approach requires knowing the length of the array at the moment you write the template — which is never true with real data. User input, API responses, filter results — all have unknown lengths.

**SE lens — hardcoding data structure into markup.** Each `<li todos[N].text>` bets that item N exists at render time. It couples the template to the current data length. A template that must be edited every time the data changes is not a *view* of the data — it is a *copy*. Copies drift; views stay current. The fix is to describe how to render *one* item and let Vue apply that description to every item — which is `v-for`.

---

## Step 2 — `v-for` and `:key`: rendering from data

Replace the entire `src/App.vue`:

```html
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Todo {
  id: number
  text: string
  done: boolean
}

const todos = ref<Todo[]>([
  { id: 1, text: 'Learn Vue components', done: false },
  { id: 2, text: 'Build something real', done: false },
  { id: 3, text: 'Ship it', done: false },
])
const filter = ref<'all' | 'active' | 'done'>('all')
const newText = ref('')
let nextId = 4

const filtered = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.done)
  if (filter.value === 'done')   return todos.value.filter(t => t.done)
  return todos.value
})

const remaining = computed(() => todos.value.filter(t => !t.done).length)

function toggle(id: number) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}

function addTodo() {
  const trimmed = newText.value.trim()
  if (!trimmed) return
  todos.value.push({ id: nextId++, text: trimmed, done: false })
  newText.value = ''
}
</script>

<template>
  <div class="app">
    <h2>Todo List</h2>

    <form class="add-row" @submit.prevent="addTodo">
      <input v-model="newText" placeholder="Add new todo…" class="input" />
      <button type="submit" :disabled="!newText.trim()">Add</button>
    </form>

    <div class="filters">
      <button
        v-for="f in ['all', 'active', 'done']"
        :key="f"
        :class="{ active: filter === f }"
        @click="filter = f"
      >{{ f }}</button>
    </div>

    <p v-if="filtered.length === 0" class="empty">Nothing here yet.</p>

    <ul v-else>
      <li
        v-for="todo in filtered"
        :key="todo.id"
        :class="{ done: todo.done }"
        @click="toggle(todo.id)"
      >
        <span class="check">{{ todo.done ? '✓' : '○' }}</span>
        {{ todo.text }}
      </li>
    </ul>

    <div class="summary">{{ remaining }} remaining</div>
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 420px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.add-row { display: flex; gap: 8px; margin-bottom: 16px; }
.input { flex: 1; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
.add-row button { padding: 8px 16px; background: #41b883; color: white; border: none; border-radius: 6px; cursor: pointer; }
.add-row button:disabled { opacity: 0.4; }
.filters { display: flex; gap: 6px; margin-bottom: 16px; }
.filters button { padding: 4px 12px; border-radius: 16px; border: 1px solid #cbd5e1; background: none; cursor: pointer; font-size: 13px; text-transform: capitalize; }
.filters button.active { background: #41b883; color: white; border-color: #41b883; }
.empty { color: #94a3b8; font-style: italic; }
ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
li { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; user-select: none; }
li.done { opacity: 0.45; text-decoration: line-through; }
.check { font-size: 16px; color: #41b883; min-width: 16px; }
.summary { margin-top: 16px; font-size: 13px; color: #64748b; }
</style>
```

**Walkthrough — `v-for`:**

```html
<li v-for="todo in filtered" :key="todo.id">
```

`v-for="item in array"` renders the element once for each item in `array`. The element and all its children have access to `item` (a scoped alias for the current iteration's object). Vue renders as many `<li>` elements as there are items in `filtered`. When `filtered` changes — because `filter` or `todos` changed — Vue re-renders the list automatically.

`v-for` can also iterate over an array of strings, numbers, or objects:

```html
<button v-for="f in ['all', 'active', 'done']" :key="f">{{ f }}</button>
```

This is the filter buttons row — three buttons rendered from a literal array. The items are strings; `:key="f"` uses the string itself as the key.

You can also access the index:

```html
<li v-for="(todo, index) in filtered" :key="todo.id">
  {{ index + 1 }}. {{ todo.text }}
</li>
```

**Walkthrough — `:key` and why it matters deeply:**

```html
:key="todo.id"
```

Vue uses the `key` to match DOM nodes to array items across renders. Without a key, Vue guesses by position — the DOM node at index 0 is assumed to be "whatever is now at index 0." This breaks when items reorder or filter:

**Example without key:** todos array is `[A, B, C]`. Filter to "active" — only `[A, C]` remain. Vue sees: the list now has 2 items. The DOM node at position 0 is reused for A (same), DOM node at position 1 is reused for C (was B). DOM node at position 2 is removed. If B or C had any per-element DOM state (focused, checked, animating), that state stays on the wrong node.

**Example with key:** Vue knows the identity of each item. When filtering to `[A, C]`, Vue knows "B is gone; C moved from index 1 to index 0; A stayed at index 0." It removes B's DOM node and moves C's, or patches the difference. Correct state, minimal operations.

**Why the array index is a bad key:** If `todos` is `[A, B, C]` and you remove B, the new array is `[A, C]`. The index-keyed DOM node at position 1 was B's; it becomes C's. Vue patches B's text to C's text and removes the last node — but any state attached to the node (animation class, checkbox state, input text) belongs to B, and it survives on what is now C's node. Use real object IDs as keys, never positions.

**Walkthrough — `v-if` / `v-else-if` / `v-else`:**

```html
<p v-if="filtered.length === 0" class="empty">Nothing here yet.</p>
<ul v-else>...</ul>
```

`v-if` **removes the element from the DOM** when false — not `display: none`, but actual DOM removal and re-insertion. This has two implications:

1. An element with `v-if="false"` is not in the DOM at all — it has zero event listeners, zero rendered children, zero memory footprint.
2. When `v-if` toggles to `true`, Vue mounts the element from scratch — lifecycle hooks fire, child components initialize.

`v-else` immediately follows a `v-if` (or `v-else-if`) and renders when all preceding conditions are false. Vue will warn if `v-else` is not immediately adjacent to `v-if`.

Multiple branches:

```html
<div v-if="status === 'loading'">Loading…</div>
<div v-else-if="status === 'error'">Error: {{ error }}</div>
<div v-else>{{ data }}</div>
```

Only one branch exists in the DOM at any time.

**Walkthrough — `:class` with an object:**

```html
:class="{ done: todo.done }"
```

Passing an object to `:class` adds each key as a CSS class when the corresponding value is truthy. `{ done: todo.done }` adds the `done` class when `todo.done === true` and removes it when false. This is equivalent to:

```html
:class="todo.done ? 'done' : ''"
```

But `:class="{ ... }"` scales cleanly to multiple conditional classes:

```html
:class="{ done: todo.done, urgent: todo.priority === 'high', new: todo.isNew }"
```

Three conditions, three classes, no string concatenation. You can also mix static and dynamic classes:

```html
<li class="item" :class="{ done: todo.done }">
```

Vue merges them: the element gets `class="item done"` when done, `class="item"` when not.

**Walkthrough — the `filtered` computed:**

```typescript
const filtered = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.done)
  if (filter.value === 'done')   return todos.value.filter(t => t.done)
  return todos.value
})
```

`Array.prototype.filter` returns a *new array*. It does not modify `todos.value`. The `filtered` computed re-runs whenever `filter` or `todos` changes. It is read-only — never assign into `filtered.value`. (The template uses it with `v-for`, which reads from it but never writes back to it.)

**Walkthrough — `toggle(id)`:**

```typescript
function toggle(id: number) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}
```

`todos.value` is a reactive array. When you mutate a property of an object inside that array (`todo.done = !todo.done`), Vue detects the change and re-runs every computed and template that reads from `todos`. The `filtered` computed re-evaluates; if the filter is "active", a newly-done item disappears from the list. This is automatic — no manual refresh.

**Walkthrough — `addTodo()` and `v-model` preview:**

```typescript
function addTodo() {
  const trimmed = newText.value.trim()
  if (!trimmed) return
  todos.value.push({ id: nextId++, text: trimmed, done: false })
  newText.value = ''
}
```

`todos.value.push(...)` mutates the reactive array. Vue's Proxy intercepts array mutations (push, pop, splice, etc.) and triggers re-renders. `newText.value = ''` clears the input after submission. `v-model="newText"` on the input is Lesson 07's topic — it keeps the input field and the ref in sync. For now, know that it works.

`nextId` is a plain number — not a ref, not reactive. It does not need to be reactive because nothing in the template displays it. It is only used to generate unique IDs.

**CS concept — virtual DOM diffing with keys.** When `todos` changes, Vue produces a new virtual DOM tree (a JavaScript object representation of the desired DOM) and compares it to the previous virtual DOM tree. This comparison — the **diff** — determines the minimum set of real DOM operations needed to update the page. Keys are how the differ identifies which virtual node corresponds to which real DOM node:

- Without keys: position-based comparison. Node at index 0 in the new tree is matched to the real node at index 0.
- With keys: identity-based comparison. Node with key `3` in the new tree is matched to the real node with key `3`, wherever it moved.

Identity-based comparison minimizes DOM operations: it can reorder without destroying/recreating, skip unchanged items entirely, and correctly destroy only what actually left.

**CS concept — immutability at the projection boundary.** `todos` is the canonical state. `filtered` is a *projection* — a derived read-only view. The view must not modify its source. If a computed getter could mutate `todos`, reading the computed value would have a side effect. Functions with side effects cannot be memoized safely — Vue might skip a call and miss the side effect. Always treat computed values as read-only windows into the reactive data.

**SE principle — declarative rendering over imperative DOM manipulation.** No `document.createElement`. No `list.innerHTML = ''`. No building HTML strings. The template declares the desired shape of the DOM in terms of the data; Vue produces it. Imperative DOM manipulation requires you to correctly sequence every step — fail to clear the old items before adding new ones and you get duplicates. Declarative rendering is specified once in terms of the desired result; Vue's diffing algorithm handles the rest correctly by construction.

---

## `v-if` vs `v-show`

| `v-if` | `v-show` |
|--------|----------|
| Removes element from DOM when false | Adds `display: none`; element stays in DOM |
| Component lifecycle runs on toggle | Component lifecycle runs once |
| Has real cost each time it toggles | Toggle is cheap (just CSS property) |
| Right for: content rarely toggled or false on first render | Right for: content toggled frequently |

A "no results" message that appears only when a filter has zero matches: `v-if`. A dropdown that opens and closes on every click: `v-show`. A loading spinner that disappears once: `v-if`.

---

## Connects forward

Lesson 05 extracts the `<li>` template into `TodoItem.vue`. The `v-for` + `:key` loop stays in `App.vue` — only the element rendered inside the loop changes from `<li>` to `<TodoItem>`.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Adding a new todo appends it to the list; the input clears
- [ ] Clicking a todo marks it done (strikethrough + fade); clicking again un-marks it
- [ ] Each filter button shows the correct subset; empty state appears when nothing matches
- [ ] "N remaining" counts only active todos and updates when items are toggled
- [ ] You can explain why `:key="todo.id"` is required and why `:key="index"` is a bad substitute
- [ ] You can explain the difference between `v-if` (removes from DOM) and `v-show` (hides with CSS)
- [ ] You can explain why `filtered` must never mutate `todos.value`
- [ ] Add a "Clear done" button that removes all completed todos from the array
