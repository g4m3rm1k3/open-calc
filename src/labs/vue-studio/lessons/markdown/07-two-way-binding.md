# Two-Way Binding

## What you will build

An `AddTodo` component with a text input. As the user types, a ref updates. When the form is submitted, the new todo is added to the list and the input clears.

```
[ What needs doing? ________________ ] [ Add ]
```

After this: every form input in every Vue app you write will use this pattern.

---

## Connects backward

Lesson 06 showed the `emit` half of component communication. This lesson introduces `v-model` — which is shorthand for a specific prop + emit pair. After this lesson the `v-model` contract (Lesson 06 mechanics + a naming convention) will be fully transparent to you.

---

## The lesson

### Step 1 — Create `AddTodo.vue`

**The problem:** A form input needs to do two things simultaneously: display the current value and update a ref when the user types. Doing this manually requires `:value` (display) and `@input` (update). `v-model` is shorthand for both.

**File:** Create `src/components/AddTodo.vue` (use the `+` button) — paste the entire file contents:

```html
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  add: [text: string]
}>()

const inputText = ref('')

function submit() {
  const trimmed = inputText.value.trim()
  if (!trimmed) return
  emit('add', trimmed)
  inputText.value = ''
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <input
      v-model="inputText"
      placeholder="What needs doing?"
      class="input"
    />
    <button type="submit" :disabled="!inputText.trim()">
      Add
    </button>
  </form>
</template>

<style scoped>
.add-form { display: flex; gap: 8px; margin-bottom: 16px; }
.input { flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; }
.input:focus { border-color: #41b883; box-shadow: 0 0 0 3px rgba(65,184,131,0.15); }
button { padding: 10px 18px; background: #41b883; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
```

**Walkthrough — `v-model`:**

```html
<input v-model="inputText" />
```

`v-model` is syntactic sugar. This expands to:

```html
<input
  :value="inputText"
  @input="inputText = ($event.target as HTMLInputElement).value"
/>
```

`:value="inputText"` — the input displays the ref's current value.
`@input="..."` — every keystroke updates the ref.
Together they create a loop: type → ref updates → input shows new value.

**CS concept — two-way data binding:** Classic MVC separated model (data) from view (display). A two-way binding synchronises them automatically in both directions. User input updates the model; model changes update the view. Vue's reactivity system makes this zero-cost: only the input element re-renders when `inputText` changes.

**SE principle — derived state at the boundary:** The Add button's disabled state is derived from `inputText.trim()` — it is computed inline as `:disabled="!inputText.trim()"`. We do not store a separate `isDisabled` ref. Storing derived booleans in refs creates synchronisation problems; expressing them as computed expressions keeps a single source of truth.

**What breaks if you use `:value` + `@input` manually but forget one:**
- Only `:value="inputText"`: input displays the value but the ref never updates when you type → the button is always enabled, nothing ever submits correctly
- Only `@input="..."`: the ref updates but the input's displayed value is not controlled → the input shows what the browser tracks, not what Vue tracks, causing desync after a reset

---

**Walkthrough — form submission:**

```html
<form @submit.prevent="submit">
```

`@submit.prevent` is two things chained: `@submit` listens for the form's `submit` event; `.prevent` calls `event.preventDefault()` before running `submit`. Without `.prevent`, clicking the button or pressing Enter causes the browser to navigate to a new URL (the old HTML form behavior). In a Vue SPA, the page must never reload on form submit.

```typescript
function submit() {
  const trimmed = inputText.value.trim()
  if (!trimmed) return
  emit('add', trimmed)
  inputText.value = ''   // clear after emit
}
```

Order matters: emit the value *before* clearing, otherwise the parent receives an empty string.

**What breaks if you remove `.prevent`:** Remove `.prevent` from `@submit.prevent`. Submit the form. The page reloads. All Vue state is destroyed and re-initialized. The todo was never added because the emit never fired — the reload happened first.

---

### Step 2 — Update `App.vue`

**The problem:** `App.vue` needs to import `AddTodo`, render it, and handle the `@add` event by pushing a new item to the todos array.

**File:** `src/App.vue` — replace the entire `<script setup>` section with:

```typescript
import { ref } from 'vue'
import TodoItem from './components/TodoItem.vue'
import AddTodo from './components/AddTodo.vue'

const todos = ref([
  { id: 1, text: 'Learn Vue components', done: false },
  { id: 2, text: 'Build something real', done: false },
])

let nextId = 3

function addTodo(text: string) {
  todos.value.push({ id: nextId++, text, done: false })
}

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
    <AddTodo @add="addTodo" />
    <ul>
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :id="todo.id"
        :text="todo.text"
        :done="todo.done"
        @toggle="toggle"
      />
    </ul>
  </div>
</template>
```

**File:** `src/App.vue` — the `<style>` section is unchanged from Lesson 06.

**Walkthrough:**
- `import AddTodo from './components/AddTodo.vue'` — import the new component
- `let nextId = 3` — a non-reactive counter; it does not need to be reactive because we never display it in the template; plain `let` is fine for internal counters
- `addTodo(text: string)` — the handler for `@add`; `todos.value.push(...)` mutates the array in place; Vue detects this and re-renders the list
- `<AddTodo @add="addTodo" />` — renders the form and connects the `add` event to `addTodo`

**CS concept — functional component boundary:** `AddTodo` is a pure input component. It owns `inputText` locally. It never holds a reference to the todos array. The text flows out through `emit('add', text)` as a plain string. The parent decides what to do with that string. This is the same functional boundary principle as pure functions — no hidden state, no side effects on shared data.

---

## `v-model` on components

`v-model` on a native `<input>` uses `value`/`input`. On a component it uses a different convention:

```html
<!-- Parent -->
<MyInput v-model="searchText" />

<!-- Expands to: -->
<MyInput
  :modelValue="searchText"
  @update:modelValue="searchText = $event"
/>

<!-- Inside MyInput.vue -->
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
```

This is the pattern every Vue UI library uses (Vuetify, PrimeVue, Headless UI). When you see `v-model` on a component, you now know exactly what props and emits it requires.

---

## Connects forward

Lesson 08 introduces `onMounted` for loading data. The three-state async pattern (loading/error/data) is the fetch equivalent of the submit pattern here: user initiates → component signals → parent responds.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Typing and clicking Add appends a new todo
- [ ] The input clears after submission
- [ ] The Add button is disabled when the input is empty
- [ ] You can explain what `v-model` expands to and why `.prevent` is on `@submit`
- [ ] Add `@keyup.escape="inputText = ''"` to the input — pressing Escape clears it
