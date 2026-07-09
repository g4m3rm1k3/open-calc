# Watchers

## What you will build

A notes editor that automatically saves to `localStorage` whenever content changes, shows "Saved at HH:MM:SS" for two seconds after each save, restores the last saved content on load, and displays a live character and word count.

```
┌─ Notes ──────────────── ✓ Saved at 3:41:22 PM ─┐
│                                                  │
│  Type here…                                      │
│                                                  │
└──────────── 23 characters · 4 words ─────────────┘
```

---

## What you need to know first

Lesson 03 showed `computed()` — declare what a value *is* in terms of other reactive values; Vue keeps it current automatically. This lesson introduces `watch()` — run arbitrary code *when* a reactive value changes. The lesson starts by putting the save logic in the wrong place to show precisely why `computed` cannot do it and what `watch` solves.

---

## Step 1 — The wrong abstraction: saving inside a computed getter

After Lesson 03, the instinct is to use `computed` whenever you want to react to state changes:

```typescript
import { ref, computed } from 'vue'

const STORAGE_KEY = 'vue-notes-v1'
const content = ref(localStorage.getItem(STORAGE_KEY) ?? '')

// Attempt: save to localStorage inside a computed getter
const savedAt = computed(() => {
  localStorage.setItem(STORAGE_KEY, content.value)   // side effect!
  return new Date().toLocaleTimeString()
})
```

Display `{{ savedAt }}` in the template and type in a textarea.

The saving appears to work — the computed runs when `content` changes. But Vue may warn: "Computed property should not have side effects." This is not a style warning. Here is why the behavior is genuinely broken:

**Why computed getters cannot have side effects:**

1. **Vue can run the getter multiple times.** For performance, Vue may evaluate computed values during hydration (server-side rendering), during DevTools inspection, or to check for dirty dependencies. Each evaluation calls `localStorage.setItem` — potentially overwriting saved data at unexpected times.

2. **Computed getters can be skipped.** If Vue determines that none of the dependencies have changed since the last evaluation (the cache is still valid), it returns the cached result without running the getter. The save does not happen. You cannot rely on a cached function to produce reliable side effects.

3. **A getter with a side effect is not a pure function.** Its behavior depends on *when* Vue calls it, not just on `content.value`. You cannot reason about what the code does without understanding Vue's internal scheduler — a significant coupling.

4. **The return value and the side effect have different semantics.** `computed` is asking: "what is the current timestamp?" But you are also doing something: "save the current content." These are two different operations with different triggers: the timestamp should update every time it is read; the save should happen every time `content` changes. Putting them together creates code that does two things for one conceptual reason.

**CS lens — pure functions and referential transparency.** A pure function takes inputs and produces an output, with no observable side effects. Given the same inputs, it returns the same output. `computed` is designed for pure derivations: same dependency values → same computed result. A getter that calls `localStorage.setItem` is not pure: two calls with the same `content.value` produce the same return string *and* both write to storage — the storage write is a hidden second output. Functions with hidden effects violate **referential transparency** — you cannot substitute a call to the function with its return value without changing behavior.

**SE lens — using the right abstraction.** `computed` answers: "what is this value, given current state?" `watch` answers: "when this value changes, what should happen?" These are different questions. Computed is a query; watch is a trigger. Putting a trigger inside a query — putting a "do this" inside a "what is this?" — mixes concerns that should be separated.

---

## Step 2 — `watch()`: side effects in the right place

Replace the entire `src/App.vue`:

```html
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'vue-notes-v1'

const content = ref(localStorage.getItem(STORAGE_KEY) ?? '')
const savedAt = ref<string | null>(null)
let saveTimer: ReturnType<typeof setTimeout>

// Derived values: pure, no side effects
const charCount = computed(() => content.value.length)
const wordCount  = computed(() => content.value.trim() === '' ? 0 : content.value.trim().split(/\s+/).length)

// Side effects: in watch, not computed
watch(content, (newValue) => {
  clearTimeout(saveTimer)
  localStorage.setItem(STORAGE_KEY, newValue)
  savedAt.value = new Date().toLocaleTimeString()
  saveTimer = setTimeout(() => { savedAt.value = null }, 2000)
})
</script>

<template>
  <div class="editor">
    <div class="header">
      <span class="title">Notes</span>
      <span v-if="savedAt" class="saved">✓ Saved at {{ savedAt }}</span>
    </div>
    <textarea v-model="content" placeholder="Start typing…" />
    <div class="footer">
      {{ charCount }} characters · {{ wordCount }} words
    </div>
  </div>
</template>

<style scoped>
.editor { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.title { font-weight: 700; font-size: 14px; }
.saved { font-size: 12px; color: #16a34a; font-weight: 500; }
textarea { width: 100%; min-height: 200px; padding: 16px; border: none; resize: vertical; font-size: 14px; font-family: inherit; line-height: 1.6; box-sizing: border-box; outline: none; }
.footer { padding: 8px 16px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; text-align: right; background: #f8fafc; }
</style>
```

**Walkthrough — `watch(source, callback)`:**

```typescript
watch(content, (newValue) => {
  localStorage.setItem(STORAGE_KEY, newValue)
  ...
})
```

`watch(source, callback)` registers a callback that Vue calls whenever `source` changes. `source` can be:
- A ref: `watch(count, cb)` — watches `count.value`
- A computed ref: `watch(filtered, cb)` — watches the computed result
- A getter function: `watch(() => obj.nested.prop, cb)` — watches any expression
- An array of sources: `watch([ref1, ref2], ([v1, v2]) => ...)` — watches multiple

The callback receives two arguments: `(newValue, oldValue)`. For a ref, `newValue` is the new `.value`; `oldValue` is the previous `.value`. Here `newValue` is the string content — it is passed directly to `localStorage.setItem`.

**Walkthrough — computed for derived state, watch for side effects:**

```typescript
// Pure derivations — computed
const charCount = computed(() => content.value.length)
const wordCount  = computed(() => content.value.trim() === '' ? 0 : content.value.trim().split(/\s+/).length)

// Side effect — watch
watch(content, (newValue) => {
  localStorage.setItem(STORAGE_KEY, newValue)
  savedAt.value = new Date().toLocaleTimeString()
})
```

`charCount` and `wordCount` are pure: they derive a number from `content.value` with no side effects. They can safely be computed, cached, and called any number of times. The localStorage save is a side effect: it interacts with a system outside the reactive graph. It belongs in `watch`.

The split between computed and watch here is the fundamental division in Vue's reactive model: **pure state** (refs, computed) vs **effects** (watch, onMounted, DOM updates). Side effects only belong in effects.

**Walkthrough — debouncing with `clearTimeout`:**

```typescript
let saveTimer: ReturnType<typeof setTimeout>

watch(content, (newValue) => {
  clearTimeout(saveTimer)           // cancel the previous timer
  localStorage.setItem(...)         // save immediately
  savedAt.value = ...               // show "Saved" message
  saveTimer = setTimeout(() => {    // schedule hiding the message
    savedAt.value = null
  }, 2000)
})
```

`clearTimeout(saveTimer)` cancels the previous timer before starting a new one. This prevents the "Saved" message from flickering: without it, typing "hello" fires five watchers, each starting its own 2-second timer. The message disappears and reappears five times in sequence. With `clearTimeout`, only the most recent keystroke's timer is active; the message hides 2 seconds after the user *stops* typing.

This pattern — cancel the previous timer before starting the next — is called **debouncing**. It applies any time you want "do this, but only after the user has paused for N milliseconds." Common uses: search-as-you-type (don't query the API on every keystroke), autosave (don't write to the server on every character).

Note: the save itself (`localStorage.setItem`) is not debounced — it runs on every keystroke. Only the "Saved" message display is debounced. Debouncing the save itself would also be valid, using the same pattern.

**What is `ReturnType<typeof setTimeout>`?** `setTimeout` returns a timer ID — type `number` in browsers, `NodeJS.Timeout` in Node.js environments. `ReturnType<typeof setTimeout>` is a TypeScript utility type that infers the correct type from the function's return type, regardless of environment. This avoids needing to import Node.js types or hardcode `number`.

**Walkthrough — restore on load:**

```typescript
const content = ref(localStorage.getItem(STORAGE_KEY) ?? '')
```

`localStorage.getItem` runs synchronously during component setup — before `onMounted`, before the first render. The stored text is the initial value of `content`. When the user returns to this page, their notes are already in the textarea when it first appears.

`??` is the **nullish coalescing operator**. It returns the left side if not `null` or `undefined`; otherwise the right side. `getItem` returns `null` if the key does not exist. `?? ''` provides an empty-string fallback. Using `||` would also treat `0`, `false`, and `''` as falsy — `??` is more precise.

---

## `watch` options

```typescript
// immediate: true — runs once on setup, then again on every change
watch(content, (newValue) => {
  console.log('value:', newValue)
}, { immediate: true })

// deep: true — watches nested object properties
const user = ref({ name: 'Alice', address: { city: 'Dublin' } })
watch(user, (newUser) => {
  console.log('user changed')
}, { deep: true })
// fires when user.value.address.city changes — shallow watcher would miss this

// Watch multiple sources at once
watch([firstName, lastName], ([first, last]) => {
  console.log(`Name: ${first} ${last}`)
})
// fires when either firstName or lastName changes
```

**`immediate: true`:** The callback runs once immediately on setup (before any value has changed), then again on every subsequent change. Use it when you need to perform the same action on both mount and update — for example, syncing a form to URL params on first load and on every change.

**`{ deep: true }`:** Without it, the watcher only fires when the ref's value is *replaced* — a new object or array assigned to `.value`. Mutating a property deep inside the object (`user.value.address.city = 'Cork'`) does not trigger a shallow watcher. `{ deep: true }` makes Vue recursively traverse the object and fire the watcher when any nested property changes. It is more expensive than a shallow watch; use only when needed.

---

## `watchEffect`: automatic dependency tracking

`watchEffect` is a simplified variant that automatically tracks all reactive values read inside it:

```typescript
watchEffect(() => {
  // Vue automatically tracks 'content' and 'savedAt' because they are read here
  localStorage.setItem(STORAGE_KEY, content.value)
  document.title = savedAt.value ? 'Saved' : 'Editing'
})
```

`watchEffect` runs immediately and again whenever any reactive value it reads changes. You do not specify the source — Vue infers it from the reads inside the callback.

**`watchEffect` vs `watch`:**

| `watch` | `watchEffect` |
|---------|---------------|
| Explicit source(s) | Implicit — tracks whatever is read |
| Has oldValue parameter | No oldValue |
| Lazy by default (doesn't run on setup) | Eager (runs immediately) |
| Use when you need previous value or explicit control | Use when tracked dependencies are obvious |

Use `watch` when you need `oldValue`, when you want explicit control over what is watched, or when you need to stop the watcher. Use `watchEffect` when the dependencies are obvious from the callback.

**Stopping a watcher:**

```typescript
const stop = watch(content, callback)
// later:
stop()  // remove the watcher; callback will never fire again
```

`watch` and `watchEffect` return a stop function. Watchers created inside `<script setup>` are automatically stopped when the component unmounts — you rarely need to call the stop function manually. Call it when you need to stop watching before the component unmounts.

---

## CS concept — the effect system

Vue's reactivity is divided into two tiers:
- **Pure reactive state**: refs, computed values. No side effects. Deterministic.
- **Effects**: watch, watchEffect, onMounted, DOM updates. Side effects allowed. Run at specific times.

Effects are the bridge between the pure reactive graph and the outside world. localStorage, network requests, DOM measurements, timers — these live in effects. The restriction on computed (no side effects) is what makes Vue's dependency graph trackable and cacheable: a computed value's result is fully determined by its inputs, with no hidden interactions.

This same division appears in functional programming (pure functions vs. IO monad), in React (pure render functions vs. useEffect), and in most modern reactive systems. The distinction is not arbitrary — it is what makes reactive programs predictable.

---

## Connects forward

Lesson 12 wraps `watch` inside composables — `useLocalStorage` being the canonical example. The pattern here (watch a ref, sync to storage) becomes a reusable function with a generic type parameter, callable from any component with one line.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Typing in the textarea shows "✓ Saved at HH:MM:SS" for two seconds after each keystroke
- [ ] The character count and word count update live as you type
- [ ] Refreshing the page restores the saved notes
- [ ] You can explain why `localStorage.setItem` cannot go inside a `computed` getter
- [ ] You can explain what `clearTimeout(saveTimer)` prevents and what "debouncing" means
- [ ] You can explain the difference between `watch` and `watchEffect` and when to use each
- [ ] Add `watch(content, callback, { immediate: true })` — observe in the console that it fires once on setup even before typing
