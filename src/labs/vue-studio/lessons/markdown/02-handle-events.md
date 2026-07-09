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

## What you need to know first

Lesson 01 established `ref()` as a reactive container: Vue watches it and re-renders any template expression that reads from it when the value changes. That lesson used `setTimeout` to mutate `message.value` after one second and the DOM updated automatically. This lesson adds the missing piece: how does *user input* trigger that same mutation?

The mechanism is the browser's event system. Before using Vue's version of it, you need to understand what it actually is.

---

## What the browser's event system is, and why it exists

The browser does not run your code continuously. After a script finishes, the browser becomes idle — waiting. When something happens (a key is pressed, a button is clicked, a network response arrives), the browser places a notification in a queue. Your code is called in response to that notification. This model is called **event-driven programming**, and it is the execution model of every JavaScript program that runs in a browser.

The notification itself is an **event** — a plain JavaScript object that describes what happened:

```javascript
// A MouseEvent, produced when the user clicks something
{
  type: 'click',
  target: <button element>,
  clientX: 240,
  clientY: 180,
  timeStamp: 1720000000000,
  // ... many more properties
}
```

You register a function to be called when an event fires. That function is called an **event listener** or **event handler**. The browser calls it, passing the event object as the argument.

In plain JavaScript:

```javascript
const button = document.querySelector('button')
button.addEventListener('click', function(event) {
  console.log('clicked at', event.clientX, event.clientY)
})
```

Vue's `@click` directive does the same thing — registers a handler — but with less code and a reactive result. Understanding that `@click` is addEventListener in disguise means you will never be confused by what is actually happening at runtime.

---

## Step 1 — The obvious approach, and why it silently fails

You know from Lesson 01 that changing a reactive ref updates the template. The natural first attempt at a counter is:

```html
<script setup lang="ts">
let count = 0
</script>

<template>
  <div>
    <h1>Count: {{ count }}</h1>
    <button @click="count++">Click me</button>
  </div>
</template>
```

Click **▶ Run**. Click the button. Nothing changes on screen.

The count is changing — prove it by adding `console.log(count)` to the click handler and opening the Console tab. You will see it incrementing. The variable is changing. The template is not. This is the exact same bug from Lesson 01 restated with a click handler instead of a `setTimeout`.

Now try something subtly different: replace `let count = 0` with `const count = ref(0)` and keep `@click="count++"` as the inline handler:

```html
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <div>
    <h1>Count: {{ count }}</h1>
    <button @click="count++">Click me</button>
  </div>
</template>
```

Click **▶ Run**. Click the button. The count increments and the template updates.

Notice that `count++` in a template expression works. That is because `{{ count }}` in a template auto-unwraps the ref — but `count++` in a template expression works differently from `count++` in a script. In template expressions, Vue evaluates `count` as `count.value`, so `count++` effectively does `count.value++`. This is a template-only shorthand and does not apply in `<script setup>`.

The point is clear: `let count = 0` is invisible to Vue's reactivity system. `const count = ref(0)` is not. The event handler (`@click`) is not the problem — it is what the handler writes to that matters.

**CS lens — the notification problem stated precisely.** Vue's reactivity system tracks dependencies by intercepting reads and writes through JavaScript Proxies. When you do `ref(0)`, Vue creates a Proxy object. When code reads `.value`, the Proxy records "this code depends on this ref." When code writes `.value`, the Proxy notifies every dependent. A plain `let count = 0` is not a Proxy. There is nothing to intercept. No notification is sent. Vue never finds out the variable changed. This is not a limitation of Vue — it is a fundamental property of JavaScript: assignment to a plain variable produces no observable side effect for other code to detect.

---

## Step 2 — `ref(0)` with a named handler function

Replace the entire `src/App.vue`:

```html
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <div class="app">
    <h1>Count: {{ count }}</h1>
    <button @click="increment">Click me</button>
  </div>
</template>

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

Click **▶ Run**. Click the button. The count increments and the heading updates instantly.

**Walkthrough, line by line:**

`const count = ref(0)` — creates a reactive container holding `0`. TypeScript infers the type as `Ref<number>`. The number `0` is wrapped in a Proxy object; reading and writing always goes through `.value`.

`count.value++` — the `++` operator desugars to `count.value = count.value + 1`. The read half (`count.value`) triggers dependency tracking. The write half (`count.value = ...`) triggers the Proxy setter, which tells Vue's scheduler to queue a re-render of every component that read this ref.

`function increment()` — a plain JavaScript function. Vue does not instrument or transform it. The reactivity comes from what happens *inside* the function when it runs, not from the function declaration itself. Vue calls `increment()` when the button is clicked; `increment` writes to `count.value`; the Proxy fires; Vue re-renders. The function is just the trigger.

`@click="increment"` — Vue's shorthand for `addEventListener('click', increment)` on this button. When the button is clicked, Vue calls `increment()`. The `@` is shorthand for `v-on:`. These two are identical in every way:

```html
<button @click="increment">...</button>
<button v-on:click="increment">...</button>
```

`{{ count }}` — Vue auto-unwraps refs in templates. You write `count`, not `count.value`. This unwrapping only applies inside `{{ }}` and directive values in the template — not in `<script setup>`.

**What is `@click="increment"` vs `@click="increment()"`?**

```html
<button @click="increment">Click me</button>    <!-- calls increment(event) -->
<button @click="increment()">Click me</button>  <!-- calls increment() — no event object -->
```

Without parentheses, Vue passes the browser's `MouseEvent` as the first argument to `increment`. With parentheses, `increment()` is called with no arguments — the event object is discarded. Use the no-parentheses form when you want the event; use the parentheses form when you need to pass arguments other than the event. To pass arguments *and* get the event, use `$event`:

```html
<button @click="handleClick('submit', $event)">Click me</button>
```

Inside `handleClick(action: string, event: MouseEvent)`, both are available.

**What breaks if you write `count++` in the script instead of `count.value++`:**

`count` is the reactive wrapper object — an object reference, not the number. `count++` does `count = count + 1`. The right side: `count + 1` coerces the object to `NaN`, so `count + 1` is `NaN`. The left side: Vue's Proxy is bypassed entirely — the assignment target is the local binding `count`, not the Proxy's `.value`. Vue never detects the write. The template stays at `0`. Vue may also log a warning: "Set operation on key 'value' failed: target is readonly."

**CS concept — the observer pattern, completed.** Lesson 01 introduced the observer pattern: a ref is a *publisher*; templates are *subscribers*; Vue manages subscriptions automatically. `increment` is a third role: the *producer* of mutations. The full data-flow chain for this counter is:

```
user click
  → browser fires click event
  → Vue dispatches to increment()
  → count.value++ (write through Proxy)
  → Proxy setter fires
  → Vue's scheduler receives notification
  → scheduler queues re-render
  → on next microtask: template re-runs with new count value
  → virtual DOM diff: only the text node for {{ count }} changed
  → Vue patches that one text node in the real DOM
```

Every interactive Vue feature follows this exact chain. Knowing each step lets you debug any break in it.

**SE principle — named functions over inline expressions.**

`@click="count++"` works for single-expression handlers. Named functions are better as soon as any of these are true: the handler does more than one thing, it needs to be called from multiple places, it needs to be tested, or it needs to appear in a stack trace with a meaningful name. A counter increment is a border case. Once you add "don't go below zero" or "log the increment" the inline form becomes unreadable. Default to named functions.

---

## Step 3 — Add decrement and reset

Extend the counter to show more of the pattern:

```html
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() { count.value++ }
function decrement() { if (count.value > 0) count.value-- }
function reset()     { count.value = 0 }
</script>

<template>
  <div class="app">
    <h1>Count: {{ count }}</h1>
    <div class="controls">
      <button @click="decrement" :disabled="count === 0">−</button>
      <button @click="reset">Reset</button>
      <button @click="increment">+</button>
    </div>
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 300px; margin: 60px auto; text-align: center; }
h1 { font-size: 52px; font-weight: 800; color: #41b883; margin-bottom: 20px; }
.controls { display: flex; justify-content: center; gap: 12px; }
button { padding: 10px 22px; border: none; border-radius: 8px; background: #41b883; color: white; font-size: 20px; cursor: pointer; font-weight: 700; transition: background 0.15s; }
button:hover:not(:disabled) { background: #33a06f; }
button:disabled { background: #cbd5e1; cursor: not-allowed; }
</style>
```

**Walkthrough of the new pieces:**

`:disabled="count === 0"` — a bound attribute. `:disabled` (shorthand for `v-bind:disabled`) evaluates the expression as JavaScript and sets the `disabled` HTML attribute when the result is truthy. `count === 0` uses Vue's template auto-unwrapping — it evaluates as `count.value === 0`. When `count.value` is `0`, the `-` button is disabled and cannot be clicked.

`decrement()` guards against going below zero with `if (count.value > 0)`. This check runs every time the button is clicked, but when `count.value` is `0`, the button is also `:disabled` — so the guard is defensive redundancy, not the primary protection.

`reset()` sets `count.value = 0` directly. This is a direct assignment through the Proxy, triggering the same re-render chain as `++`.

**Three handlers, one reactive ref, zero synchronisation code.** Adding `decrement` and `reset` required zero changes to the template's display of `count`. The count heading always shows `count.value`. Every handler that changes `count.value` automatically causes the heading to re-render. This is the payoff of reactive state — new behaviour is added by writing new mutation functions, not by updating rendering logic.

---

## Step 4 — Event modifiers

Vue extends event directives with `.modifier` suffixes that call common `Event` methods automatically:

```html
<!-- event.preventDefault() — prevents default browser action -->
<form @submit.prevent="handleSubmit">

<!-- event.stopPropagation() — stops the event bubbling to parent elements -->
<div @click.stop="handleInnerClick">

<!-- Only fires if the click was directly on this element, not a child -->
<div @click.self="handleSelf">

<!-- Only fires once, then removes itself -->
<button @click.once="handleOnce">

<!-- Key modifiers — only fires when Enter is pressed -->
<input @keyup.enter="submit">
<input @keyup.escape="clearInput">
```

The modifier that matters most for lessons ahead is `.prevent`. HTML forms navigate to a new URL when submitted — this is the original form behaviour from 1993. In a Vue SPA, that navigation destroys all application state and reloads the page. The todo is never added because the reload fires before the handler completes. `@submit.prevent` stops the navigation; your handler runs cleanly.

**CS concept — event bubbling, named and demonstrated.**

Browser events propagate upward through the DOM tree by default. A click on a `<button>` inside a `<div>` fires a click event on the button first, then on the div, then on every ancestor up to `document`. This is called **event bubbling** — the event bubbles upward through the tree.

```html
<div @click="outerClicked">       <!-- fires second -->
  <button @click="innerClicked">  <!-- fires first -->
    Click me
  </button>
</div>
```

Clicking the button calls both `innerClicked` and `outerClicked`. This is often surprising. `.stop` (`event.stopPropagation()`) halts the bubble at the current element — `outerClicked` does not fire. `.self` fires the handler only when the click's target is this exact element — not a child that bubbled up.

Knowing about bubbling explains why you occasionally need `.stop`, why global click listeners catch all clicks everywhere, and why modals close when you click the backdrop but not the modal itself (the backdrop's handler fires; the modal's `.stop` prevents it from reaching the backdrop).

**Key modifiers for keyboard events:**

```html
<input @keyup.enter="submit" @keyup.escape="cancel">
<input @keydown.arrow-up="moveUp" @keydown.arrow-down="moveDown">
```

Key modifiers filter the event to a specific key. `@keyup.enter` only fires when the key released was Enter. Without the modifier, the handler fires for every key release and you must check `event.key === 'Enter'` yourself. Vue's key modifiers do that check for you.

---

## Connects forward

Lesson 03 shows `computed()` — a reactive value that derives from other reactive values automatically. The `increment` pattern here (mutation triggers re-render) is the half of the loop that *changes* state. Computed values are the half that *derives* state without manual synchronisation. After Lesson 03, the counter could have a `doubled` computed ref that is always `count.value * 2`, with no manual update anywhere.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Clicking `+` increments the count; clicking `−` decrements it; clicking Reset sets it to `0`
- [ ] The `−` button is visually disabled when count is `0`
- [ ] You can explain why `let count = 0` with `count++` does not update the template
- [ ] You can explain the full chain: click → handler → Proxy setter → scheduler → re-render
- [ ] You can explain the difference between `@click="fn"` and `@click="fn()"` and when to use each
- [ ] You can explain what event bubbling is and what `.stop` does
- [ ] Add `@keydown.plus="increment"` and `@keydown.minus="decrement"` — the keyboard should also work (click the preview first to give it focus)
