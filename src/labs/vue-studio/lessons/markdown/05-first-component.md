# Your First Component

## What you will build

Extract the todo item rendering into its own file — `src/components/TodoItem.vue`. `App.vue` passes data down using props; `TodoItem` renders it.

```
App.vue                      TodoItem.vue
────────                     ────────────
todos (array) ──:text──►     renders one item
               ──:done──►    applies strikethrough
```

After this lesson: every Vue app you build will follow this same shape — parent owns state, child renders a piece of it.

---

## Connects backward

Lesson 04 rendered todos directly in `App.vue`. This lesson extracts that single-item rendering into a separate file, introduces `defineProps`, and makes `TodoItem` reusable from anywhere in the project.

---

## The lesson

### Step 1 — Create the child component

**The problem:** The `<li>` rendering logic is entangled with `App.vue`. To reuse it elsewhere, test it in isolation, or hand it to another developer, it needs its own file.

**File:** Create `src/components/TodoItem.vue` (use the `+` button in the file tabs) — paste the entire file contents:

```html
<script setup lang="ts">
const props = defineProps<{
  text: string
  done: boolean
}>()
</script>

<template>
  <li :class="{ done: props.done }">
    {{ props.text }}
  </li>
</template>

<style scoped>
li {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}
li.done {
  opacity: 0.4;
  text-decoration: line-through;
}
</style>
```

**Walkthrough:**
- `defineProps<{ text: string; done: boolean }>()` — declares what inputs this component accepts; the TypeScript generic is the type definition; Vue reads it at compile time to validate props
- `const props = defineProps<...>()` — the return value is the props object; in the template you write `props.text`, `props.done`
- `<style scoped>` — CSS that only applies to this component's DOM nodes; the `.done` class here cannot conflict with any other component's `.done` class

**What is `defineProps`?** A Vue compiler macro — a special function Vue's compiler processes at build time. It declares a component's public API: which values it accepts from its parent. Without it, values passed from a parent are silently ignored.

**CS concept — encapsulation:** `TodoItem` is a black box. The parent knows: "give it `text` and `done`, it renders a list item." The parent does not know or care how that item is styled. `<style scoped>` enforces this boundary — styles are contained within the component.

**SE principle — separation of concerns:** `App.vue` manages the *list* (the collection). `TodoItem.vue` manages *one item* (the unit). Different reasons to change → different files. If the item's visual design changes (new font, badge added), only `TodoItem.vue` changes. If the list logic changes (filtering, sorting), only `App.vue` changes.

**What breaks without `defineProps`:** Remove the `defineProps` call but keep `{{ props.text }}` in the template. `props` is `undefined`; accessing `props.text` throws a runtime error. `defineProps` is the contract — the component does not know it has inputs without it.

---

### Step 2 — Update `App.vue` to use the component

**The problem:** `App.vue` still renders `<li>` tags directly. We need it to import and use `<TodoItem>` instead.

**File:** `src/App.vue` — replace the entire `<script setup>` section with:

```typescript
import { ref } from 'vue'
import TodoItem from './components/TodoItem.vue'

const todos = ref([
  { id: 1, text: 'Learn Vue components', done: false },
  { id: 2, text: 'Build something real', done: false },
  { id: 3, text: 'Ship it', done: false },
])

function toggle(id: number) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}
```

**File:** `src/App.vue` — replace the `<template>` section with:

```html
<template>
  <div class="app">
    <h2>Todos</h2>
    <ul>
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :text="todo.text"
        :done="todo.done"
        @click="toggle(todo.id)"
      />
    </ul>
  </div>
</template>
```

**File:** `src/App.vue` — replace the `<style>` section with:

```html
<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 380px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
</style>
```

**Walkthrough:**
- `import TodoItem from './components/TodoItem.vue'` — the default import brings in the component; the path is relative to `App.vue`
- `<TodoItem ... />` — in a Vue template, PascalCase names are components; lowercase names are native HTML elements
- `:text="todo.text"` — the `:` prefix binds a JavaScript expression; `todo.text` is the current iteration variable's text property
- `:done="todo.done"` — passes the boolean; without `:`, `done="todo.done"` would pass the *string* `"todo.done"`, not the value
- `@click="toggle(todo.id)"` — listens for click events on the `<li>` rendered by `TodoItem`

**What is `:text` vs `text`?**

```html
<TodoItem text="todo.text" />   <!-- passes the string literal "todo.text" -->
<TodoItem :text="todo.text" />  <!-- passes the JavaScript value of todo.text -->
```

The `:` (shorthand for `v-bind:`) turns the attribute value from a string literal into a JavaScript expression. Always use `:` when passing dynamic data.

**CS concept — component trees:** Vue applications are component trees. Data flows down through props (parent → child). This creates a directed acyclic graph where each node is a component. The structure makes data flow explicit and traceable — if `done` is wrong, you look at who passed it, not at every component in the tree.

**SE principle — one-way data flow:** Props are read-only in the child. `TodoItem` receives `done` but cannot modify it. This constraint keeps data changes localized to the component that owns the state. If components could freely mutate their parents' data, you would have invisible side effects everywhere.

**What breaks if `TodoItem` mutates a prop:**
```typescript
// In TodoItem.vue — DON'T DO THIS
function markDone() { props.done = true }
```
Vue logs a warning and the mutation does not propagate upward. The parent's `todos` array is unaffected. Child components cannot change their parents' data through props — that direction requires `emit` (next lesson).

---

## Connects forward

Lesson 06 adds `defineEmits` to `TodoItem` so it can signal the parent when clicked. This is the other half of the "data down, events up" pattern — props bring data down; emits send signals up.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Todos render using `<TodoItem>` (check: remove the `text` prop — the item should show blank)
- [ ] Clicking an item marks it done (toggle works through `@click`)
- [ ] You can explain the difference between `:text="..."` and `text="..."`
- [ ] Add a `priority?: 'low' | 'high'` prop to `TodoItem` and show a colored dot when `priority === 'high'`
