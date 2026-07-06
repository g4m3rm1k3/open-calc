# Emit Events

## What you will build

Move the click-to-toggle interaction *into* `TodoItem.vue`. When the item is clicked, it emits a `toggle` event with the todo's `id`. `App.vue` listens and updates the data.

```
TodoItem                    App.vue
────────                    ───────
@click → emit('toggle', id) ──►  toggle(id) updates todos
```

---

## Connects backward

Lesson 05 showed that props flow down (parent → child) and that children cannot mutate props. This lesson introduces the complementary mechanism: children signal upward through `emit`. Together, props and emit form Vue's "data down, events up" pattern.

---

## The lesson

### Step 1 — Declare the emit and fire it in `TodoItem`

**The problem:** `TodoItem` currently handles clicks via `@click` in `App.vue`'s template. That works, but it means `App` must know the implementation detail of *how* a todo item registers clicks. If the item gains a more complex interaction (keyboard, long-press), every consumer has to update. The responsibility belongs in `TodoItem`.

**File:** `src/components/TodoItem.vue` — replace the entire `<script setup>` section with:

```typescript
const props = defineProps<{
  id: number
  text: string
  done: boolean
}>()

const emit = defineEmits<{
  toggle: [id: number]
}>()
```

**Walkthrough:**
- `id: number` — a new prop is added; the component now knows its own id
- `const emit = defineEmits<{ toggle: [id: number] }>()` — declares one custom event named `toggle` that carries one argument of type `number`
- The generic syntax `{ eventName: [arg1Type, arg2Type, ...] }` is Vue 3's TypeScript-idiomatic form; it validates the event name and argument types at compile time

**What is `defineEmits`?** Another Vue compiler macro (like `defineProps`). It declares what events a component can fire. Without it, Vue still lets you fire events, but TypeScript cannot type-check the arguments and Vue DevTools cannot list the events in its component inspector.

**CS concept — interface segregation:** `defineProps` defines the component's input interface. `defineEmits` defines its output interface. Together they form the complete component contract — what it needs and what it produces. Any parent can use `TodoItem` by knowing only this contract, not the internal implementation.

**SE principle — tell, don't ask:** Instead of `App.vue` asking the item "which id are you?", `TodoItem` tells `App.vue` "the user toggled item with this id." Push behaviour to where the information lives. `TodoItem` knows its own `id` — it is the right place to package and send it.

**What breaks without `defineEmits`:** Remove `defineEmits` but keep `emit('toggle', props.id)` in the template. Vue logs: `[Vue warn]: Extraneous non-emits event listeners (toggle)...`. The event may still fire (Vue is lenient), but you lose TypeScript checking and the explicit declaration. The declaration is the published contract.

---

### Step 2 — Fire the emit from the template

**File:** `src/components/TodoItem.vue` — replace the entire `<template>` section with:

```html
<template>
  <li
    :class="{ done: props.done }"
    @click="emit('toggle', props.id)"
  >
    {{ props.text }}
  </li>
</template>
```

**Walkthrough:**
- `@click="emit('toggle', props.id)"` — when clicked, calls `emit` with the event name `'toggle'` and the value of `props.id`
- `emit` was returned by `defineEmits` — it is a function you call to fire a declared event

**CS concept — event buses vs component events:** This is a local event — from one specific child to its direct parent. Vue's `emit` is not a global event bus. The event is sent to *this component's parent only*. The parent catches it with `@toggle`. Nothing else in the app hears it. This containment makes the event easy to trace.

---

### Step 3 — Listen in `App.vue`

**The problem:** `App.vue` currently registers `@click` on `<TodoItem>`. That worked before because click events bubble up from the `<li>` inside. Now that `TodoItem` handles the click internally and emits a custom event, `App.vue` needs to listen for `@toggle` instead.

**File:** `src/App.vue` — in the `<template>`, find the `<TodoItem>` block and replace it with:

```html
<TodoItem
  v-for="todo in todos"
  :key="todo.id"
  :id="todo.id"
  :text="todo.text"
  :done="todo.done"
  @toggle="toggle"
/>
```

The `<script setup>` and `<style>` sections are unchanged from Lesson 05.

**Walkthrough:**
- `:id="todo.id"` — the new `id` prop (added in Step 1) must be passed
- `@toggle="toggle"` — Vue routes the `toggle` custom event to the `toggle` function; the `id` argument is passed automatically

**What is `@toggle`?** The same `@` syntax as `@click`. Vue uses it for both native DOM events and custom component events. When used on a component (`<TodoItem>`), it listens for custom events declared in that component's `defineEmits`. When used on a native element (`<button>`), it listens for DOM events.

**CS concept — inversion of control:** `App.vue` no longer drives the interaction ("listen for clicks on TodoItems"). `TodoItem` drives it ("I'm telling you a toggle happened"). This inversion reduces coupling — `App.vue` does not need to know how `TodoItem` detects user interaction, only what it announces.

**SE principle — single responsibility:** `App.vue`'s responsibility: manage the todos array. `TodoItem.vue`'s responsibility: detect user intent and announce it. Mixing these would mean `App.vue` has to understand every interaction pattern `TodoItem` uses.

**What breaks if `App.vue` listens for `@click` instead of `@toggle`:** Change `@toggle="toggle"` back to `@click="toggle(todo.id)"`. The `click` bubbles from the `<li>` inside `TodoItem` up to the parent — so it *appears to work*. But you are relying on DOM event bubbling, not the declared component API. If `TodoItem` ever wraps the `<li>` in a container div that catches clicks, the bubbled event stops reaching `App.vue`. Using `@toggle` is explicit and doesn't depend on DOM structure.

---

## The full pattern

```
App.vue                           TodoItem.vue
─────────────────────────────     ─────────────────────────────
todos (state)                     defineProps: id, text, done
                                  defineEmits: toggle
:text="todo.text"  ──props──►
:done="todo.done"  ──props──►     @click → emit('toggle', id)

◄──── @toggle="toggle" ────────   (event fired upward)

toggle(id) updates todos.value
```

Data flows down. Events flow up. The parent owns the state. The child owns the interaction.

---

## Connects forward

Lesson 07 introduces `v-model`, which is syntactic sugar over a specific pair of prop + emit: `modelValue` + `update:modelValue`. After Lesson 06, `v-model` on a component will make complete sense.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Clicking a todo still marks it done
- [ ] `TodoItem` emits `toggle` — you can verify by adding `console.log('toggled', id)` inside `toggle()` in `App.vue` and checking the console
- [ ] You can explain why `@toggle` is used instead of `@click` and what the difference is
- [ ] Add a `delete` button inside `TodoItem` that emits a `'delete': [id: number]` event; handle it in `App.vue` by removing the todo from the array
