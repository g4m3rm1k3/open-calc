# Handle Events

## What you will build

A counter: starts at zero, increments on each button click.

```
[ Count: 0 ]  [ Click me ]
              ↓ click
[ Count: 1 ]
```

This is the first lesson where user action changes visible output. After this: every interactive Vue app you write uses exactly this pattern — a function mutates reactive state, Vue re-renders.

---

## Connects backward

Lesson 01 showed `ref()` creating a reactive container and `{{ }}` displaying its value. This lesson adds the missing piece: how do you change that value based on user input?

---

## The lesson

### Step 1 — Add the counter ref and handler function

**The problem:** We need a number that tracks how many times the button was clicked, and a function that increments it.

**File:** `src/App.vue` — inside `<script setup lang="ts">`, replace the entire script section with:

```typescript
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
```

**Walkthrough:**
- `const count = ref(0)` — creates a reactive container holding the number `0`; TypeScript infers the type as `Ref<number>`
- `function increment()` — a plain JavaScript function; Vue does not need to know it exists in order to call it
- `count.value++` — increments the number inside the container; this is what `.value` is for

**What is `count.value`?** `ref()` wraps your value in an object so Vue can intercept reads and writes. In `<script setup>` you always go through `.value` to get or set the value inside. In the template, Vue unwraps it automatically.

**CS concept — observer pattern:** `ref(0)` creates an observable. `count.value++` notifies every observer — in this case, every template expression that reads `count` — that the value changed. Vue re-runs those expressions. The CS term for this is a reactive dependency graph: each template expression is a subscriber; each `ref` is a publisher.

**SE principle — functions as the unit of behaviour:** `increment()` is a named function, not an inline expression. Named functions are testable, debuggable, and can be called from multiple places. For logic that is more than one statement, always extract a named function.

**What breaks if you write `count++` instead of `count.value++`:** `count` is the reactive wrapper object, not the number. `count++` tries to increment the object reference — it converts the object to `NaN` and Vue loses its reactive tracking entirely. The counter stays at zero and Vue logs a warning.

---

### Step 2 — Bind the event to the template

**The problem:** The function exists but nothing calls it. We need to tell Vue: when the button is clicked, run `increment`.

**File:** `src/App.vue` — replace the entire `<template>` section with:

```html
<template>
  <div class="app">
    <h1>Count: {{ count }}</h1>
    <button @click="increment">Click me</button>
  </div>
</template>
```

And replace the `<style>` section with:

```html
<style scoped>
.app {
  font-family: system-ui, sans-serif;
  max-width: 400px;
  margin: 40px auto;
  text-align: center;
}
button {
  padding: 10px 24px;
  background: #41b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
button:hover { background: #33a06f; }
</style>
```

**Walkthrough:**
- `@click="increment"` — the `@` symbol is shorthand for Vue's `v-on:` directive; `@click` listens for the browser's `click` event on this element; `"increment"` is the handler to call
- `{{ count }}` — reads the reactive ref; Vue auto-unwraps it so you write `count`, not `count.value`

**What is `@click`?** `@` is shorthand for `v-on:`. These are identical:
```html
<button @click="increment">Click me</button>
<button v-on:click="increment">Click me</button>
```
Real Vue code always uses `@`. It works for any DOM event: `@input`, `@keyup`, `@submit`, `@mouseover`.

**CS concept — event-driven programming:** The browser fires a `click` DOM Event. Vue intercepts it using an event listener it added behind the scenes. This is the same `addEventListener` you would write in plain JavaScript, but Vue handles attaching and removing it for you.

**SE principle — separation of concerns:** The template says *what* should happen (`@click="increment"`). The function says *how* it happens (`count.value++`). The template does not contain arithmetic. The function does not contain HTML. Each piece has one job.

**What breaks without `@click`:** Remove `@click="increment"`. The button renders but clicking it does nothing — there is no listener attached. `increment` is never called. `count` never changes.

---

### Step 3 — The event object (reference, no edit needed)

**The problem:** Sometimes you need information about the event itself — which key was pressed, which element was clicked, where the mouse was.

Vue automatically passes the DOM event object when you name a parameter:

```typescript
function handleClick(event: MouseEvent) {
  console.log(event.target)   // the clicked element
  console.log(event.clientX)  // x position of click
}
```

For one-liners, you can write the expression directly in the template:

```html
<button @click="count.value++">Click me</button>
```

Use inline expressions for single operations. Extract a named function the moment it needs more than one step.

---

## Event modifier reference

```html
<form @submit.prevent="submit">   <!-- call event.preventDefault() first -->
<a @click.stop="handle">          <!-- call event.stopPropagation() first -->
<input @keyup.enter="search">     <!-- only fire when Enter key released -->
<button @click.once="track">      <!-- only fire the first time -->
```

Modifiers chain: `@keyup.ctrl.enter="save"` fires only when Ctrl+Enter is released.

---

## Connects forward

Lesson 03 introduces `computed()` — values that derive automatically from `count` (or any other reactive state). The `@click` + function pattern you learned here is used in every lesson from now on.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] `Count: 0` appears initially
- [ ] Each click increments the count
- [ ] You can explain what `@` means and why `count.value++` works but `count++` does not
- [ ] Add a decrement button: `<button @click="count.value--">−</button>`
