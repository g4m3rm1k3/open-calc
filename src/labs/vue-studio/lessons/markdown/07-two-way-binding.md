# Two-Way Binding

## What you will build

An `AddTodo` component with a text input. As the user types, a ref updates. When the form is submitted, the new todo is added to the list and the input clears. Additionally: a select filter that uses `v-model`, and a checkbox that demonstrates how `v-model` adapts to different input types.

```
[ What needs doing? _________ ] [ Add ]
```

After this: every form input in every Vue app you write uses this pattern.

---

## What you need to know first

Lesson 06 completed the "data down, events up" pattern: props carry data into a component; emits carry events out. This lesson shows a very specific props + emit pair — syncing a text input with a ref — that is common enough to deserve its own shorthand. The lesson starts by wiring the input manually so the shorthand becomes obvious, not magical.

---

## Step 1 — Wiring an input by hand, and the boilerplate it produces

Create `src/components/AddTodo.vue`. Paste the manual, fully-explicit approach:

```html
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  add: [text: string]
}>()

const inputText = ref('')
</script>

<template>
  <form @submit.prevent="emit('add', inputText)">
    <input
      :value="inputText"
      @input="inputText = ($event.target as HTMLInputElement).value"
      placeholder="What needs doing?"
    />
    <button type="submit" :disabled="!inputText.trim()">Add</button>
  </form>
</template>
```

**Walkthrough — what these two bindings do:**

`:value="inputText"` — a one-way binding from ref to DOM. The input element's displayed text is always `inputText.value`. Without this, the input is **uncontrolled**: the browser owns the text; Vue has no say in what is displayed. If `inputText.value` is set to `''` programmatically (to clear after submit), an uncontrolled input would not clear.

`@input="inputText = ($event.target as HTMLInputElement).value"` — a one-way binding from DOM to ref. Every time the user types a character, the browser fires an `input` event. The event's `target` is the `<input>` element; its `.value` property is the current text. This assignment copies the text into the ref.

Together these two bindings form a **synchronisation loop**:

```
User types
  → @input fires
  → inputText.value = current text
  → Vue re-renders
  → :value updates the DOM input to match
  → (cycle continues)
```

Both bindings must be present. Without `:value`, Vue doesn't control what the input shows — programmatic clears fail. Without `@input`, typing doesn't update the ref — submitting sends the initial empty string.

**The type cast `($event.target as HTMLInputElement)`:** TypeScript knows `event.target` can be any `EventTarget` — an element, a document, a window. It does not know it is specifically an `HTMLInputElement` with a `.value` property. The cast narrows the type so TypeScript allows `.value`. At runtime this does nothing — JavaScript has no type information.

**SE lens — the synchronisation boilerplate problem.** Two lines of code for one conceptually simple thing: "this input and this ref stay in sync." In a form with ten inputs, that is twenty lines of identical structure. The structure is always the same — `:value="ref"` + `@input="ref = $event.target.value"` — but the ref name changes. This is precisely the kind of mechanical repetition that a named abstraction should eliminate.

---

## Step 2 — `v-model`: the shorthand for the synchronisation loop

Replace the entire `src/components/AddTodo.vue`:

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
    <button type="submit" :disabled="!inputText.trim()">Add</button>
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

`v-model="inputText"` replaces both `:value` and `@input`. The two-line boilerplate collapses to one directive.

**What `v-model` expands to — exactly:**

```html
<!-- This: -->
<input v-model="inputText" />

<!-- Is exactly: -->
<input
  :value="inputText"
  @input="inputText = ($event.target as HTMLInputElement).value"
/>
```

This is pure syntactic sugar. There is no new mechanism — `v-model` is a named abbreviation for a pattern you just wrote manually. Understanding what it expands to means you will never be confused by its behavior.

**Walkthrough — `@submit.prevent`:**

```html
<form @submit.prevent="submit">
```

Without `.prevent`, pressing Enter or clicking the Add button causes the browser to navigate to a new URL (HTML's default `<form>` behavior, unchanged since 1993). In a Vue SPA, that navigation destroys all Vue state and reloads the page. The todo is never added — `submit()` begins to run but the page reload interrupts it before `emit('add', ...)` completes. `.prevent` calls `event.preventDefault()` before `submit()` runs, stopping the navigation.

**Walkthrough — the submit function and order of operations:**

```typescript
function submit() {
  const trimmed = inputText.value.trim()
  if (!trimmed) return        // guard: don't add whitespace-only todos
  emit('add', trimmed)        // send the text upward
  inputText.value = ''        // clear the input AFTER emitting
}
```

Order matters. `emit('add', trimmed)` captures the trimmed text and sends it up. *Then* `inputText.value = ''` clears the ref. If you cleared first, `trimmed` already holds the correct text (it was captured before the clear) — but it communicates intent more clearly to emit before clearing. The `trimmed` constant protects you if you accidentally swap the order.

**Walkthrough — `:disabled="!inputText.trim()"`:**

The Add button is disabled when the input is empty or whitespace-only. `!inputText.trim()` is a derived boolean: `inputText.trim()` returns `''` when the input is blank, and `''` is falsy, so `!''` is `true`, which disables the button. Vue re-evaluates this on every keystroke (because `inputText` is reactive and the template reads it here).

Note: this could be a `computed` value (`const isDisabled = computed(() => !inputText.value.trim())`). For a single instance, the inline expression is fine. Use `computed` when the same derivation is needed in multiple places.

---

## Step 3 — `v-model` adapts to input type

`v-model` expands differently based on the HTML element and `type` attribute. The same directive; different machinery under the hood.

**Text inputs and textarea:**

```html
<input v-model="name" />
<textarea v-model="bio" />
<!-- Both expand to: :value + @input -->
```

**Checkboxes — single boolean:**

```html
<input type="checkbox" v-model="isDone" />
<!-- Expands to: :checked="isDone" + @change="isDone = $event.target.checked" -->
```

`isDone` must be a `ref(false)` (boolean). When checked, `isDone.value` becomes `true`; when unchecked, `false`.

**Checkboxes — array for multiple selection:**

```html
<input type="checkbox" v-model="selectedIds" value="1" />
<input type="checkbox" v-model="selectedIds" value="2" />
<input type="checkbox" v-model="selectedIds" value="3" />
```

When `selectedIds` is `ref<string[]>([])`, checking box "2" adds `"2"` to the array; unchecking removes it. Vue manages array membership automatically.

**Radio buttons:**

```html
<input type="radio" v-model="priority" value="low" />
<input type="radio" v-model="priority" value="medium" />
<input type="radio" v-model="priority" value="high" />
<!-- priority.value becomes 'low', 'medium', or 'high' based on selection -->
```

**Select:**

```html
<select v-model="filter">
  <option value="all">All</option>
  <option value="active">Active</option>
  <option value="done">Done</option>
</select>
<!-- Expands to: :value + @change -->
```

`filter.value` matches whichever `option value` is selected.

**`v-model` modifiers:**

```html
<!-- .trim: strips leading/trailing whitespace from the value -->
<input v-model.trim="name" />

<!-- .number: converts the string to a number (inputs always give strings) -->
<input type="number" v-model.number="quantity" />

<!-- .lazy: syncs on @change instead of @input (fires on blur, not keystroke) -->
<input v-model.lazy="expensive" />
```

`.number` is especially important. `<input type="number">` in HTML still gives you a *string* from `event.target.value` — `"42"`, not `42`. Without `.number`, a calculation like `price.value * quantity.value` where `quantity` is `"3"` (string) would return `NaN`. `.number` automatically converts the string to a number.

---

## Step 4 — `v-model` on components: connecting Lesson 06

`v-model` on a native HTML element uses `:value`/`@input`. On a *component*, it uses a naming convention from the props+emit system:

```html
<!-- Parent: -->
<MyInput v-model="searchText" />

<!-- Expands to: -->
<MyInput
  :modelValue="searchText"
  @update:modelValue="searchText = $event"
/>

<!-- Inside MyInput.vue: -->
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
```

The convention: the prop is named `modelValue`; the emit is named `'update:modelValue'`. This is not magic — it is a pair of names Vue chose as the standard for two-way binding on components.

Every Vue UI library (Vuetify, PrimeVue, Naive UI) uses this convention for its input components. When you see `<DatePicker v-model="selectedDate" />`, you know the component accepts a `modelValue` prop and emits `'update:modelValue'`. You know how to implement `<MyDatePicker v-model="..." />` yourself, because Lesson 06 gave you `defineProps` and `defineEmits`, and this lesson gave you the naming convention.

**Multiple v-model on one component:**

```html
<UserForm v-model:firstName="first" v-model:lastName="last" />

<!-- Expands to: -->
<UserForm
  :firstName="first"
  @update:firstName="first = $event"
  :lastName="last"
  @update:lastName="last = $event"
/>
```

The `v-model:propName` form lets a single component have multiple independently bound values.

---

## Update `App.vue` to use `<AddTodo>`

```typescript
import AddTodo from './components/AddTodo.vue'

function addTodo(text: string) {
  todos.value.push({ id: nextId++, text, done: false })
}
```

```html
<AddTodo @add="addTodo" />
```

`@add="addTodo"` — `AddTodo` emits `'add'` with the text; `App.vue` catches it and pushes to the array.

**CS concept — two-way data binding.** The manual Step 1 approach — `:value` read, `@input` write — is a **data binding**: a live synchronisation between a JavaScript value and a DOM control. **Two-way** binding synchronises both directions: the control always shows the current value; user input always propagates to the value. This eliminates the class of bugs where UI and data diverge (the DOM shows the old value, or the data has a stale string). Vue's reactive system makes two-way binding efficient: only the bound input element re-renders when the ref changes, not the entire form.

**CS concept — controlled vs uncontrolled inputs.** A **controlled** input is one where a JavaScript value is the source of truth — `:value="ref"` ensures the input always shows what the ref contains. An **uncontrolled** input is one where the browser owns the value internally; JavaScript can read it but not push values in. Programmatic clears (`inputText.value = ''`) only work on controlled inputs. Pre-filling from saved data only works on controlled inputs. Vue's `v-model` creates controlled inputs. Use controlled inputs for any form that has state beyond what the user just typed.

**SE principle — single source of truth for form state.** `inputText` is the single source of truth for what the user typed. The DOM input is a view of `inputText.value`. The button's disabled state is derived from `inputText.value`. The submit handler reads `inputText.value`. There is no `inputElement.value` anywhere — the browser's internal DOM state is not consulted directly. This ensures that programmatic changes (clearing, pre-filling) are always reflected correctly in the UI.

---

## Connects forward

Lesson 08 introduces `onMounted` for loading data from an API. Forms (submission) and fetches (data loading) share a common pattern: an async operation puts the component in a loading state, then transitions to a success or error state. The state machine model from Lesson 08 applies to both.

---

## Definition of done

`App.vue` should now include `<AddTodo @add="addTodo" />` above the filters. Verify:

- [ ] Typing in the input and clicking Add (or pressing Enter) appends a new todo to the list
- [ ] The input clears after submission
- [ ] The Add button is disabled when the input is empty or whitespace-only
- [ ] You can write out what `v-model="inputText"` expands to from memory (two attributes)
- [ ] You can explain why `.prevent` is on `@submit` and what happens without it
- [ ] You can explain the difference between a controlled and uncontrolled input
- [ ] You can explain what `v-model.number` does and why it matters for numeric inputs
- [ ] Add `@keyup.escape="inputText = ''"` to the input — pressing Escape should clear it without submitting
