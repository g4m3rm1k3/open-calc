# Conditionals & Lists

## What you will build

A filterable todo list: renders each item from a reactive array, shows an empty state when nothing matches, and lets you filter between All / Active / Done.

```
[all] [active] [done]

• Learn Vue components
• Build something real   ✓ (strikethrough)
• Ship it

2 remaining
```

---

## Connects backward

Lessons 01–03 built up reactive state and event handling. This lesson adds the two directives that render different markup depending on what that state contains: `v-if` for conditional branches and `v-for` for lists.

---

## The lesson

### Step 1 — Reactive array and computed filter

**The problem:** We have a list of todos in reactive state. Displaying only the items that match the current filter is derived data — a job for `computed()`.

**File:** `src/App.vue` — replace the entire `<script setup>` section with:

```typescript
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

const filtered = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.done)
  if (filter.value === 'done')   return todos.value.filter(t => t.done)
  return todos.value
})

function toggle(id: number) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}
```

**Walkthrough:**
- `interface Todo` — a TypeScript interface describing each item's shape; `ref<Todo[]>([])` tells TypeScript the array holds `Todo` objects
- `ref<'all' | 'active' | 'done'>('all')` — a string ref with a union type; TypeScript will reject any other string assigned to `filter.value`
- `computed(() => {...})` — re-runs whenever `filter` or `todos` changes; returns the matching subset
- `todos.value.filter(t => !t.done)` — `Array.prototype.filter` returns a new array containing only items where the callback returns `true`
- `toggle(id)` — finds the item by id and flips its `done` property; because `todos` is a reactive ref, Vue detects the mutation and re-renders

**What is `ref<Todo[]>([])` doing?** The `<Todo[]>` is a TypeScript generic parameter that overrides type inference. Without it, TypeScript would infer `Ref<never[]>` from the empty array, which refuses to hold `Todo` items. Explicit generics are how you tell TypeScript what a ref is *intended to hold*.

**CS concept — data model separation:** The array is the model. The filter is a control. The `filtered` computed is a view projection. The template renders the projection. Separating *what data exists* from *what subset is shown* is fundamental data modelling.

**SE principle — immutability at the edges:** `filter()` returns a new array — it does not modify `todos`. This is important: computed values should never mutate their dependencies. If `filtered` mutated `todos`, reading `filtered` would change `todos`, which would trigger `filtered` to re-run, infinitely.

**What breaks if `filtered` mutates `todos`:** Replace `return todos.value.filter(...)` with `todos.value = todos.value.filter(...)`. Now activating the "done" filter *deletes* the active todos from the list permanently. Never mutate source state inside a computed getter.

---

### Step 2 — Template: `v-if`/`v-else` for empty state

**The problem:** When no todos match the filter, the list is empty. We should show a helpful message instead of a blank area.

**File:** `src/App.vue` — replace the entire `<template>` section with:

```html
<template>
  <div class="app">
    <h2>Todo List</h2>

    <div class="filters">
      <button
        v-for="f in ['all', 'active', 'done']"
        :key="f"
        :class="{ active: filter === f }"
        @click="filter = f"
      >
        {{ f }}
      </button>
    </div>

    <p v-if="filtered.length === 0" class="empty">
      Nothing here yet.
    </p>

    <ul v-else>
      <li
        v-for="todo in filtered"
        :key="todo.id"
        :class="{ done: todo.done }"
        @click="toggle(todo.id)"
      >
        {{ todo.text }}
      </li>
    </ul>

    <div class="summary">
      {{ todos.filter(t => !t.done).length }} remaining
    </div>
  </div>
</template>
```

**Walkthrough of each directive:**

`v-if` / `v-else`:
```html
<p v-if="filtered.length === 0">Nothing here yet.</p>
<ul v-else>...</ul>
```
`v-if="expression"` renders the element only when the expression is truthy. `v-else` (immediately following) renders when it is not. Vue **removes the element from the DOM entirely** when the condition is false — not `display: none`, but full removal. A `v-else` must immediately follow a `v-if` or `v-else-if` element with no other elements in between.

`v-for` for lists:
```html
<li v-for="todo in filtered" :key="todo.id">
```
`v-for="item in array"` renders the element once per item. `item` is scoped to that element and its children. `:key` is required (see next point).

`:key` — stable identity for list items:
```html
:key="todo.id"
```
Vue uses the key to match DOM nodes to array items across renders. Without a key, Vue guesses by position — if you filter or reorder, it reassigns DOM nodes to the wrong data. With a stable, unique key (always an `id`, never the array index), Vue patches only the items that actually changed.

`:class` with an object:
```html
:class="{ done: todo.done }"
```
An object value applies each key as a CSS class when the value is truthy. The `done` class is added when `todo.done === true`, removed when false. This is cleaner than `todo.done ? 'done' : ''`.

**CS concept — virtual DOM diffing:** When `todos` changes, Vue does not re-render the entire list. It compares the new virtual DOM tree to the previous one (diffing). Keys let the differ identify which `<li>` nodes moved, which were added, which were removed. Without keys the differ assumes everything at a given position is the same element — wrong after filtering.

**SE principle — declarative rendering over imperative DOM manipulation:** Notice there is no `document.createElement`, no `list.innerHTML = ''`, no manually building HTML strings. You declare the desired structure; Vue figures out the minimum DOM operations.

**What breaks without `:key`:** Remove `:key="todo.id"`. Mark two todos as done then switch to the "active" filter. You may see the wrong items with strikethrough, or items losing their done state when the filter changes. Vue is reusing the wrong DOM nodes.

---

### Step 3 — Style

**File:** `src/App.vue` — replace the `<style>` section with:

```html
<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 380px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.filters { display: flex; gap: 6px; margin-bottom: 16px; }
.filters button { padding: 4px 12px; border-radius: 16px; border: 1px solid #cbd5e1; background: none; cursor: pointer; font-size: 13px; text-transform: capitalize; }
.filters button.active { background: #41b883; color: white; border-color: #41b883; }
.empty { color: #94a3b8; font-style: italic; }
ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
li { padding: 12px 16px; background: #f8fafc; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; }
li.done { opacity: 0.4; text-decoration: line-through; }
.summary { margin-top: 16px; font-size: 13px; color: #64748b; }
</style>
```

---

## `v-if` vs `v-show`

| `v-if` | `v-show` |
|--------|----------|
| Removes element from DOM | Adds `display: none` — element stays in DOM |
| Destroyed and recreated | Always mounted, just hidden |
| Right for: expensive components that may never be needed | Right for: elements that toggle frequently |
| Right for: conditional that is false on first render | Right for: always initialized, sometimes hidden |

The discount badge in Lesson 03 used `v-if` — correct, because the element is genuinely absent in the base case. A dropdown menu you show/hide on every click is a better fit for `v-show`.

---

## Connects forward

Lesson 05 extracts `<TodoItem>` into its own component and passes data down via `defineProps`. The `v-for` + `:key` pattern you learned here is used everywhere components are rendered in a list.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Clicking a todo marks it done (strikethrough + fade)
- [ ] Filter buttons show correct subsets; empty state shows when nothing matches
- [ ] "N remaining" updates when you mark items done
- [ ] You can explain the difference between `v-if` and `v-show`
- [ ] You can explain why `:key` is required on `v-for` and why the array index is a bad key
