# Your First Component

## What you will build

Extract the todo item rendering into its own file — `src/components/TodoItem.vue`. `App.vue` passes data down using props; `TodoItem` renders it.

```
App.vue                      TodoItem.vue
────────                     ────────────
todos (array) ──:id──────►   owns its own click handling
               ──:text──►    applies strikethrough
               ──:done──►    uses scoped CSS
```

After this lesson: every Vue app you build follows this shape — parent owns state, child renders a piece of it.

---

## What you need to know first

Lesson 04 left the `<li>` rendering logic inside `App.vue`'s template. This works for a single use. The lesson starts by showing what happens when you need the same rendering in two different places — the structural problem every component solves.

---

## Step 1 — The duplication problem, made concrete

You have a todo list in `App.vue`. Now imagine a product requirement: add a sidebar showing only completed todos.

Without components, you copy the `<li>` template:

```html
<!-- In the main list -->
<li
  v-for="todo in filtered"
  :key="todo.id"
  :class="{ done: todo.done }"
  @click="toggle(todo.id)"
>
  <span class="check">{{ todo.done ? '✓' : '○' }}</span>
  {{ todo.text }}
</li>

<!-- In the sidebar — identical template, different array -->
<li
  v-for="todo in completedTodos"
  :key="todo.id"
  :class="{ done: todo.done }"
  @click="toggle(todo.id)"
>
  <span class="check">{{ todo.done ? '✓' : '○' }}</span>
  {{ todo.text }}
</li>
```

Two identical templates. Every subsequent change to how a todo item looks must be applied twice. A product change: add a due date badge. Edit both. A bug fix: screen readers need `aria-checked` on the checkbox span. Edit both. A new design: items get a priority color band. Edit both. A typo in the text class name. Find and fix both.

This is not a hypothetical risk — it is a certainty. With two copies, the probability of exactly one copy being correct after any future change is high. With ten copies (search results, dashboard, notification list, recent items) it approaches one.

**SE lens — the unit of change.** The question to ask is: "is there a piece of behavior that has exactly one reason to change?" `<li>` rendering is one piece: how a single todo item looks and responds to interaction. It should have exactly one definition. A component creates that definition.

**CS lens — abstraction over a pattern.** The two `<li>` templates are instances of the same *pattern*: given `text` and `done`, render a list item. Abstraction means naming a pattern and giving it parameters. `<TodoItem :text="..." :done="..." />` calls the named pattern with specific arguments. The definition lives in one place; each use is a call. This is the function abstraction principle applied to rendered UI. Functions are the most fundamental unit of abstraction in programming; components are the equivalent in Vue.

**What "abstraction" actually means here:** you are not just reducing line count. You are creating a *boundary* — a separation between "how items are rendered" (inside the component) and "which items to render" (the caller's concern). The boundary means the two sides can change independently. The caller adds a new feature (search results); the component fixes a bug (focus ring). Neither side needs to know about the other's change.

---

## Step 2 — Create `TodoItem.vue`

Click the `+` button in the file tabs to create a new file. Name it `src/components/TodoItem.vue`. Paste the entire content:

```html
<script setup lang="ts">
const props = defineProps<{
  id: number
  text: string
  done: boolean
}>()
</script>

<template>
  <li :class="{ done: props.done }">
    <span class="check">{{ props.done ? '✓' : '○' }}</span>
    {{ props.text }}
  </li>
</template>

<style scoped>
li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  user-select: none;
}
li.done {
  opacity: 0.45;
  text-decoration: line-through;
}
.check {
  font-size: 16px;
  color: #41b883;
  min-width: 16px;
}
</style>
```

**Walkthrough — `defineProps<T>()`:**

```typescript
const props = defineProps<{
  id: number
  text: string
  done: boolean
}>()
```

`defineProps<T>()` is a **Vue compiler macro** — a function that the Vue compiler processes at build time, not at runtime. The TypeScript generic `<{ id: number; text: string; done: boolean }>` is the type definition for the props this component accepts. The compiler reads it to:

1. Validate what the parent template passes in (TypeScript error if you pass the wrong type)
2. Generate the runtime prop definition (Vue's internal prop validation)
3. Make the prop names available as template variables

The return value — `const props = defineProps<...>()` — is the props object. In the template you can write `props.text` or just `text` (both work). Writing `props.text` is more explicit and recommended for clarity.

**What happens without `defineProps`:** The component has no declared interface. `props` is `undefined`. `{{ props.text }}` throws a runtime error. TypeScript cannot type-check what the parent passes in. The published contract — "this component needs id, text, done" — exists nowhere.

**Walkthrough — `<style scoped>`:**

```html
<style scoped>
li.done { opacity: 0.45; text-decoration: line-through; }
</style>
```

`scoped` means these styles only apply to elements rendered by *this component's template*. Vue adds a unique data attribute to every element in this component (like `data-v-7ba5bd90`) and rewrites each selector to include it:

```css
/* What you write: */
li.done { opacity: 0.45; }

/* What Vue outputs: */
li.done[data-v-7ba5bd90] { opacity: 0.45; }
```

If `App.vue` also has a `.done` class, there is no collision — each file's `.done` selector targets only its own elements. Styles from `App.vue` cannot reach inside `TodoItem`; `TodoItem`'s styles cannot leak into `App.vue`. CSS is encapsulated at the component boundary.

**What breaks without `scoped`:** Remove `scoped`. The `.done` selector from `TodoItem.vue` is global. If any other component anywhere in the application has an element with class `done`, it gets the strikethrough. This is the classic CSS specificity and collision problem that scoped styles prevent.

**CS concept — encapsulation.** `TodoItem` is a black box with a defined interface: inputs (props `id`, `text`, `done`) and output (a rendered `<li>` element). The parent does not know how it is styled, what HTML structure it uses, or how it handles the `done` state visually. `<style scoped>` enforces this at the CSS level — the interior is opaque. This is the same encapsulation principle as a class with private fields: external code sees the public interface; internal details are hidden.

**SE principle — single responsibility.** `App.vue` manages the *list*: the array, the filter, the count, the add-todo action. `TodoItem.vue` manages *one item*: its visual representation. These responsibilities have different reasons to change. If the list logic changes (add sorting, change the filter options), only `App.vue` changes. If the item design changes (add a priority indicator, change the done animation), only `TodoItem.vue` changes. The files are independently modifiable because they have independent responsibilities.

---

## Step 3 — Update `App.vue` to use `<TodoItem>`

Replace the `<ul>` contents in `App.vue` with `<TodoItem>`:

```html
<script setup lang="ts">
import { ref, computed } from 'vue'
import TodoItem from './components/TodoItem.vue'

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
      <TodoItem
        v-for="todo in filtered"
        :key="todo.id"
        :id="todo.id"
        :text="todo.text"
        :done="todo.done"
        @click="toggle(todo.id)"
      />
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
.summary { margin-top: 16px; font-size: 13px; color: #64748b; }
</style>
```

**Walkthrough:**

`import TodoItem from './components/TodoItem.vue'` — imports the component. Once imported, it is available as `<TodoItem>` in the template. This is a **default import** — `TodoItem.vue` exports itself as the default export, and the import receives it under the name `TodoItem`. Vue convention: component names are PascalCase.

`:id="todo.id"`, `:text="todo.text"`, `:done="todo.done"` — pass props. The `:` prefix (shorthand for `v-bind:`) evaluates the right side as a JavaScript expression. Without `:`, the attribute passes a *string literal*: `text="todo.text"` passes the seven-character string `"todo.text"`, not the variable. With `:`, `text` and `todo.text` are the actual values from the component's reactive state.

**The `:` vs no-`:` distinction matters for every type:** Without `:`, every value is a string. `:done="true"` passes the boolean `true`. `done="true"` passes the string `"true"` — which is truthy, but it is the *string* `"true"`, not the boolean. `:done="false"` passes the boolean `false`. `done="false"` passes the string `"false"` — which is *also* truthy, so `:class="{ done: props.done }"` would apply the done class when it should not.

`v-for` and `:key` — unchanged from Lesson 04. The pattern is unchanged; only the rendered element changed from `<li>` to `<TodoItem>`.

`@click="toggle(todo.id)"` — the click handler is in `App.vue`, not in `TodoItem.vue`. `TodoItem` renders the item; `App.vue` decides what happens when the item is clicked. This is intentional and temporary — Lesson 06 moves the click into `TodoItem` using `emit`, making the component self-contained.

**Why PascalCase component names?** All native HTML elements are lowercase: `div`, `span`, `button`, `input`. Vue's template compiler distinguishes native elements from components by casing: `<TodoItem>` cannot be an HTML element, so it must be a component. This convention makes templates readable without a lookup table: lowercase = HTML native, PascalCase = Vue component.

**CS concept — substitution principle.** Before this lesson, the template directly contained a `<li>` element. After this lesson, it contains `<TodoItem>`, which renders a `<li>`. From `App.vue`'s perspective, the two are interchangeable — the same `:done` prop toggles the strikethrough, the same click event fires, the same visual result appears. This is **behavioral substitution**: `<TodoItem :done="true" />` behaves identically to the inline `<li class="done">` it replaced. The substitution is transparent to the caller.

**SE principle — open/closed.** `App.vue` is now *closed* to changes in how a single todo item looks — that concern moved entirely into `TodoItem.vue`. But `TodoItem.vue` is *open* to being used in new places without modification. Add a sidebar, a search results panel, a "recently completed" widget — each uses `<TodoItem :text="..." :done="..." />` without requiring changes to either file. The open/closed principle: closed to modification, open to extension.

**What about optional props?** If a prop has a default value and should not be required, use a function default:

```typescript
const props = withDefaults(defineProps<{
  text: string
  done: boolean
  priority?: 'low' | 'medium' | 'high'
}>(), {
  priority: 'low'
})
```

`withDefaults` wraps `defineProps` and provides default values. Props without defaults in `defineProps` are required — the parent must pass them. TypeScript will error if they are missing.

---

## Connects forward

`<TodoItem>` currently only renders. Lesson 06 adds the ability for `TodoItem` to signal back to its parent using `defineEmits` — moving the click-toggle logic inside the component where it belongs.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] The todo list renders identically to Lesson 04
- [ ] Adding, filtering, and toggling all work
- [ ] Clicking a todo toggles its done state (the click handler is in `App.vue`)
- [ ] You can explain what `defineProps` does and why removing it breaks the component
- [ ] You can explain what `<style scoped>` prevents and how it works mechanically
- [ ] You can explain the difference between `:done="false"` (boolean) and `done="false"` (string)
- [ ] Add a `priority?: 'low' | 'medium' | 'high'` prop (optional) to `TodoItem` and display a colored left border based on it (green/yellow/red)
