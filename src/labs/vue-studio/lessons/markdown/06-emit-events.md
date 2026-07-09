# Emit Events

## What you will build

Move the click-to-toggle interaction *into* `TodoItem.vue`. When the item is clicked, it emits a `toggle` event with the todo's `id`. `App.vue` listens and updates the data.

```
TodoItem                     App.vue
────────                     ───────
@click → emit('toggle', id) ──►  toggle(id) updates todos
```

The component owns its own interaction. The parent owns the state.

---

## What you need to know first

Lesson 05 showed that `TodoItem` receives data from `App.vue` via props. Clicking a todo was handled in `App.vue`'s template with `@click="toggle(todo.id)"`. This works — but it means `App.vue`'s template must reach inside `TodoItem`'s rendered output to catch clicks. This lesson starts by showing what goes wrong when a child takes the shortcut of mutating its own props.

---

## Step 1 — Why props are read-only, and why the obvious fix breaks

`TodoItem` knows it was clicked. It knows `props.id`. The most natural fix — handle the toggle inside `TodoItem` itself — requires writing to `props.done`. Try it:

```html
<script setup lang="ts">
const props = defineProps<{
  id: number
  text: string
  done: boolean
}>()

function handleClick() {
  props.done = !props.done   // attempt to mutate the prop
}
</script>

<template>
  <li :class="{ done: props.done }" @click="handleClick">
    <span class="check">{{ props.done ? '✓' : '○' }}</span>
    {{ props.text }}
  </li>
</template>
```

Click **▶ Run**. Click a todo. Vue logs in the console: `[Vue warn]: Set operation on key "done" failed: target is readonly.` The toggle does not work.

Vue does not *silently* allow prop mutation — it actively prevents it. This is not a technical limitation; Vue could allow it. It is a deliberate design decision with a clear reason.

**Why props are read-only:** `App.vue` holds the source of truth for `todos`. If `TodoItem` could silently change `done`, Vue would have two pieces of code that think they own `done` — `App.vue` (which holds the array) and `TodoItem` (which just mutated a prop). When `todos` next triggers a re-render (because some other todo was added), `App.vue`'s version of `done` would overwrite `TodoItem`'s mutation. The toggle would silently revert. More fundamentally: if any child can write to any parent's state, tracing the cause of any state change requires checking every component in the tree. That makes debugging exponentially harder as the tree grows.

**CS lens — ownership and mutation.** Every piece of mutable state has an *owner* — one actor responsible for its lifecycle. Vue's prop system enforces this: the component that created a value (via `ref`, in `<script setup>`) owns it and is the only one allowed to write to it. Children receive a read-only view. This is the same ownership model as `const` in JavaScript: the declaration site is the owner; others may read but not overwrite. Props declare: "I am sharing a view of this value; it lives with me; mutate it through me."

**SE lens — unidirectional data flow.** Vue enforces a one-way flow: data flows down through props (parent → child); events flow up (child → parent). This asymmetry is not arbitrary — it means that when any state changes, you can always identify the *owner* as the cause. In a system where children can also write to parent state, the cause of any change could be any component anywhere. One-way flow makes "who changed this?" a question with one answer.

---

## Step 2 — `defineEmits`: the child's upward channel

A child that cannot write to its parent's state is not helpless — it can *request* a change. The mechanism is `emit`: fire a named event upward; the parent decides whether and how to respond.

Replace the entire `src/components/TodoItem.vue`:

```html
<script setup lang="ts">
const props = defineProps<{
  id: number
  text: string
  done: boolean
}>()

const emit = defineEmits<{
  toggle: [id: number]
  remove: [id: number]
}>()
</script>

<template>
  <li :class="{ done: props.done }" @click="emit('toggle', props.id)">
    <span class="check">{{ props.done ? '✓' : '○' }}</span>
    <span class="text">{{ props.text }}</span>
    <button class="delete" @click.stop="emit('remove', props.id)">×</button>
  </li>
</template>

<style scoped>
li { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f8fafc; border-radius: 8px; cursor: pointer; transition: opacity 0.2s; user-select: none; }
li.done { opacity: 0.45; text-decoration: line-through; }
.check { font-size: 16px; color: #41b883; min-width: 16px; }
.text { flex: 1; }
.delete { margin-left: auto; background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1; opacity: 0; transition: opacity 0.15s; }
li:hover .delete { opacity: 1; }
.delete:hover { color: #dc2626; }
</style>
```

**Walkthrough — `defineEmits<T>()`:**

```typescript
const emit = defineEmits<{
  toggle: [id: number]
  remove: [id: number]
}>()
```

`defineEmits<T>()` is a Vue compiler macro, like `defineProps`. The generic type `{ toggle: [id: number]; remove: [id: number] }` declares two custom events. Each key is an event name; the value is a tuple of argument types. `toggle: [id: number]` means: the `toggle` event carries one argument of type `number`.

The return value is the `emit` function. `emit('toggle', props.id)` fires the `toggle` event, passing `props.id` as the argument. The value travels upward to whoever is listening with `@toggle="..."`.

**Walkthrough — `@click.stop` on the delete button:**

```html
<button class="delete" @click.stop="emit('remove', props.id)">×</button>
```

Without `.stop`, clicking the delete button fires two click handlers: the button's `emit('remove', ...)` and the `<li>`'s `emit('toggle', ...)`. The item is removed and toggled simultaneously. `.stop` calls `event.stopPropagation()`, which halts the event before it bubbles from the button to the `<li>`. Only `emit('remove', ...)` fires.

This is the event bubbling mechanism from Lesson 02's Step 4: click events travel from the innermost element upward through all ancestors. Nested clickable elements require `.stop` to prevent the outer handler from also firing.

**Walkthrough — listening in `App.vue`:**

Update `App.vue` to handle both events:

```html
<TodoItem
  v-for="todo in filtered"
  :key="todo.id"
  :id="todo.id"
  :text="todo.text"
  :done="todo.done"
  @toggle="toggle"
  @remove="removeTodo"
/>
```

And add `removeTodo`:

```typescript
function removeTodo(id: number) {
  todos.value = todos.value.filter(t => t.id !== id)
}
```

`@toggle="toggle"` listens for the custom `toggle` event. When `TodoItem` calls `emit('toggle', props.id)`, Vue dispatches the event to `App.vue`'s `toggle` handler, passing the id as the argument. `@remove="removeTodo"` listens for `remove` and calls `removeTodo(id)`.

**The complete round-trip for toggle:**
1. User clicks the `<li>`
2. Vue calls `emit('toggle', props.id)` (inside `TodoItem`)
3. Vue dispatches the `toggle` event to the parent with the id
4. `App.vue`'s `toggle(id)` runs
5. `todos.value.find(t => t.id === id).done = !todo.done` (mutation)
6. `todos` changes → `filtered` recomputes → `TodoItem` receives new `:done` prop → re-renders

Every step is traceable. The mutation always happens in `App.vue` — the owner of `todos`.

**What about `@click` on the component from the outside?** In Lesson 05, `App.vue` used `@click="toggle(todo.id)"` directly on `<TodoItem>`. This used **native click events** — clicking anywhere inside the rendered DOM of `TodoItem` triggered the handler. This is different from `@toggle` — `@toggle` listens for *custom events* that `TodoItem` explicitly emits. Custom events are more precise: the component decides exactly when and with what data to notify the parent.

**CS concept — interface segregation.** `defineProps` defines the *input interface*: what this component accepts. `defineEmits` defines the *output interface*: what custom events it can fire. Together they form the complete **component contract** — the public API. Any parent can use `TodoItem` by understanding only the contract. The internal wiring (how clicks are handled, what the DOM looks like, what CSS is applied) is invisible externally. This is the same interface segregation as a type signature in TypeScript: the type says what's available; the implementation says how.

**CS concept — the event-driven model applied to components.** Browser events (click, input, keydown) are fired by the browser and caught by event listeners. Custom Vue events (`emit`) are fired by child components and caught by parent templates. Both use the same subscription pattern: a producer fires a named event; a consumer registers a handler; the event system routes the event. Vue scopes custom events to the immediate parent relationship — a child can only emit to its direct parent — which prevents the "event bus" anti-pattern where events can travel to unrelated components, making data flow untraceable.

**SE principle — tell, don't ask.** In the Lesson 05 approach, `App.vue` *asked* `TodoItem` for the click event by registering a native click listener on the component from outside. In the Lesson 06 approach, `TodoItem` *tells* `App.vue` which specific thing happened: "the user toggled this specific item by id." `TodoItem` packages the information (the id) and sends it. The parent receives a prepared message rather than a raw browser event that it must interpret. Components that tell their parents what happened are easier to evolve: changing the internal click structure (from `<li>` click to checkbox click) does not require changes in `App.vue`.

**What breaks without `defineEmits`:** Remove `defineEmits` but keep `emit('toggle', ...)`. Vue warns: `[Vue warn]: Component emitted event "toggle" but it is not declared in the emits option.` The event may still bubble in some versions but: TypeScript cannot type-check the arguments; Vue DevTools cannot list the component's events; the contract is undeclared. The published interface exists nowhere.

---

## The full data-down-events-up diagram

```
App.vue
  (owns: todos ref)
       │
       │  props: :id, :text, :done  (data flows down)
       ▼
  TodoItem.vue
  (renders one item)
       │
       │  emit: 'toggle', id        (event flows up)
       │  emit: 'remove', id        (event flows up)
       ▼
  App.vue
  (responds: mutates todos, re-renders)
```

Data flows down through props — always. Events flow up through emit — always. No sideways flow. No child writing to parent state. This directional constraint is what makes data flow in a Vue application traceable.

---

## Connects forward

Lesson 07 introduces `v-model` — syntactic sugar for a specific prop + emit pair (`modelValue` / `update:modelValue`). After Lesson 07, every time you see `v-model` on a component, you will recognize it as the emit pattern from this lesson, formalized into a naming convention.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Clicking a todo toggles its done state; hovering reveals the delete button
- [ ] Clicking the × button removes the todo without also toggling it
- [ ] The toggle and remove logic lives in `App.vue`, not in `TodoItem.vue`
- [ ] You can explain why `props.done = !props.done` fails and why Vue made it that way
- [ ] You can explain what `defineEmits<{ toggle: [id: number] }>()` declares
- [ ] You can explain why `.stop` is needed on the delete button's `@click`
- [ ] You can draw the complete data-flow diagram for a toggle: user click → emit → App.vue handler → mutation → re-render
