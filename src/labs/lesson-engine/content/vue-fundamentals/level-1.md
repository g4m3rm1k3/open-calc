---
series: vue-fundamentals
level: 1
title: The Composition API and ref/reactive
lang: javascript
---

# The Composition API and ref/reactive

The Composition API (introduced in Vue 3) is an alternative way to write Vue components. Instead of organising code by option type (data, computed, methods), the Composition API lets you organise code by feature. All related logic — the state, computed values, and methods for one feature — lives together.

The Composition API is now the recommended way to write Vue 3 components. The Options API remains fully supported but the Composition API solves a key problem: in large components with the Options API, related logic is scattered across `data`, `computed`, `methods`, and `watch` sections. The Composition API lets you co-locate all logic for a feature in one place.

## ref and reactive: two ways to declare reactive state

```javascript
import { ref, reactive, computed } from 'vue'

// ref: wraps a single value in a reactive container
// Access or update the value via .value
const count = ref(0)
console.log(count.value)    // 0
count.value++               // triggers reactive update
console.log(count.value)    // 1

// reactive: wraps an object; all its properties become reactive
// Access properties directly (no .value needed)
const user = reactive({
  name: 'Alice',
  email: 'alice@example.com',
  role: 'user',
})
user.name = 'Alice Smith'   // triggers reactive update
console.log(user.name)      // 'Alice Smith'

// In templates: ref is automatically unwrapped (no .value needed)
// <p>{{ count }}</p>       — not <p>{{ count.value }}</p>
// <p>{{ user.name }}</p>   — works directly
```

```text
ref vs reactive — WHEN TO USE WHICH:

  ref:
    → Primitives: strings, numbers, booleans
    → When you need to replace the whole value (reassign, not mutate)
      count.value = 0   ← reassigning the ref's value
      reactive objects can't be reassigned without losing reactivity
    → In the Composition API, ref is preferred for clarity
    
  reactive:
    → Objects and arrays that you only mutate (not reassign)
    → When the object structure is complex and you don't want .value everywhere
    
  REACTIVE GOTCHA — destructuring breaks reactivity:
    const { name, email } = user    // ✗ WRONG: name and email are now plain strings
    name = 'Bob'                    //   this does NOT update user.name
    
    const { name } = toRefs(user)   // ✓ CORRECT: name is a ref linked to user.name
    name.value = 'Bob'              //   this DOES update user.name
```

**CS lens:** `ref` is a **value container with change notification** — it wraps a value and intercepts reads and writes (via a getter/setter on `.value`) to trigger Vue's reactivity. This is the classic **Box** monad pattern: the value is wrapped in a context (the ref) that adds behaviour (reactivity) to simple reads and writes. `reactive` uses a Proxy (as covered in level-0) to add reactivity to the whole object. The `.value` requirement on `ref` exists because JavaScript primitives (numbers, strings) cannot be proxied — they must be wrapped in an object first.

## setup() and <script setup>

The Composition API code lives in the `setup()` function, or in the `<script setup>` block (Single File Component syntax).

```javascript
// LONG FORM: using setup() function
export default {
  props: { userId: Number },
  setup(props) {
    // All Composition API code goes here
    const count = ref(0)
    const message = computed(() => `Count is ${count.value}`)
    
    function increment() {
      count.value++
    }
    
    // Return values to make them available in the template
    return { count, message, increment }
  },
  template: `<button @click="increment">{{ message }}</button>`
}

// <script setup>: concise syntax for Single File Components (preferred)
// Everything declared at the top level is automatically available in the template
```

```html noplay
<!-- UserCounter.vue — Single File Component with <script setup> -->
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props are declared with defineProps
const props = defineProps({
  initialCount: { type: Number, default: 0 }
})

// Reactive state
const count = ref(props.initialCount)

// Computed value
const message = computed(() => `Count: ${count.value}`)

// Methods (just functions)
function increment() { count.value++ }
function decrement() { count.value-- }
// No return statement needed — <script setup> auto-exposes everything
</script>

<style scoped>
/* CSS scoped to this component only */
button { margin: 4px; }
</style>
```

```text
SINGLE FILE COMPONENT (SFC):
  Vue's .vue files combine template, script, and scoped CSS in one file.
  
  <template>: the HTML structure (Vue template syntax)
  <script setup>: the Composition API logic
  <style scoped>: CSS that only applies to this component
  
  <style scoped> compiles to something like:
    button[data-v-f3f3eg9] { margin: 4px; }
    The data-v-xxx attribute is unique per component.
    Buttons in OTHER components are not affected.
  
  SFC benefits:
    → Co-location: template, logic, and styles together
    → Scoped CSS: no class name collisions between components
    → Better tooling: Volar (VS Code) provides type checking in templates
```

## Lifecycle hooks in the Composition API

```javascript
import { ref, onMounted, onUnmounted, onBeforeUpdate } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const timerId = ref(null)
    
    onMounted(() => {
      // Component is now in the DOM
      // Equivalent to Options API's mounted()
      console.log('Component mounted')
      timerId.value = setInterval(() => count.value++, 1000)
    })
    
    onUnmounted(() => {
      // Component is being removed from the DOM
      // Equivalent to Options API's unmounted()
      clearInterval(timerId.value)   // cleanup: stop the timer
    })
    
    onBeforeUpdate(() => {
      // Called before a reactive update triggers a DOM re-render
      console.log('About to update. Current count:', count.value)
    })
    
    return { count }
  }
}
```

```text
VUE LIFECYCLE:
  
  CREATION:    setup() runs → beforeMount → MOUNTED (component is in DOM)
  UPDATE:      reactive data changes → beforeUpdate → UPDATED (DOM updated)
  DESTRUCTION: beforeUnmount → UNMOUNTED (component removed from DOM)
  
  COMPOSITION API HOOKS      OPTIONS API EQUIVALENT
  onMounted()                mounted()
  onUnmounted()              unmounted()
  onBeforeUpdate()           beforeUpdate()
  onUpdated()                updated()
  onBeforeMount()            beforeMount()
  
  WHEN TO USE WHICH:
  onMounted:   fetch initial data, set up timers, subscribe to events
  onUnmounted: clean up timers, unsubscribe, close connections
  onUpdated:   access updated DOM after a reactive change (rare; prefer computed)
  
  Same rules as React's useEffect:
  → Set up in mounted, tear down in unmounted
  → Not cleaning up = memory leaks (timers fire after component is gone)
```

**SE lens:** The `<script setup>` syntax is an example of **progressive enhancement** applied to developer experience. Vue's philosophy is that you should be able to add complexity incrementally: start with a simple HTML file, add a Vue script tag, then migrate to SFCs when you need components, then add TypeScript when you need type safety. The Options API is the progressive starting point; the Composition API is the more powerful but slightly more complex mode. Neither replaces the other — they're tools for different situations, and Vue supports both in the same project.

**Common mistakes:**
- Destructuring reactive objects without `toRefs` — `const { name } = reactive({name: 'Alice'})` gives a plain string. Changes to `name` don't update the reactive state. Use `toRefs` or access via the reactive object directly: `user.name`.
- Using reactive for primitive values — `const count = reactive(0)` fails (0 is not an object). Use `const count = ref(0)` for primitives.
- Not cleaning up timers in `onUnmounted` — the same memory leak issue as React's `useEffect` without cleanup. Vue doesn't automatically clean up timers or event listeners — you must do it in `onUnmounted`.

**Debug tip:** Vue DevTools shows the component's setup() state in the Components panel. Each `ref` and `reactive` value is listed with its current value. If a computed value shows wrong data, click on it in Vue DevTools to see which reactive sources it depends on and what their current values are. This makes debugging derived state much faster than console logging.

## Challenge: compositionStateManager

Implement a state manager using the Composition API pattern.

```challenge
function createCompositionState() {
  // Simulates Vue's Composition API ref/reactive pattern (no Vue needed — pure logic)
  //
  // .ref(initialValue)
  //   Returns an object with:
  //     .value: current value (readable and writable)
  //     .onChange(fn): register a listener; returns unsubscribe function
  //   Writing to .value notifies all registered listeners.
  //
  // .reactive(obj)
  //   Returns a Proxy where:
  //     Reading any property returns the current value
  //     Writing any property notifies listeners registered for that property
  //     .onChange(property, fn): register a listener for a specific property
  //       (store on the returned proxy as __listeners)
  //   (Simplification: just track by property name, no deep reactivity needed)
  //
  // .computed(fn)
  //   Returns an object with:
  //     .value: the result of calling fn() (lazily evaluated)
  //     Re-evaluates fn() on each .value access (no caching needed for this exercise)
}
```

```test
const vue = createCompositionState()

// ref: reading, writing, and notifying listeners
const count = vue.ref(0)
const updates = []
const unsub = count.onChange(v => updates.push(v))
count.value = 5
assert count.value === 5 && updates[0] === 5

// Unsubscribe stops further notifications
unsub()
count.value = 99
assert updates.length === 1

// reactive: per-property listeners
const user = vue.reactive({ name: 'Alice', role: 'user' })
const nameUpdates = []
user.onChange('name', v => nameUpdates.push(v))
user.name = 'Bob'
assert user.name === 'Bob' && nameUpdates[0] === 'Bob'

// computed: re-evaluates from the underlying ref
const count2 = vue.ref(3)
const doubled = vue.computed(() => count2.value * 2)
assert doubled.value === 6
count2.value = 5
assert doubled.value === 10
```
