# Composables

## What you will build

Three composables — `useCounter`, `useLocalStorage`, and `useFetch` — and an app that uses all three. Each composable encapsulates a reusable behaviour; your component imports and uses them like lego bricks.

```
useCounter    →  count, doubled, increment, decrement, reset
useLocalStorage → value (persisted across page refreshes)
useFetch      →  data, loading, error
```

---

## Connects backward

Every lesson in this series introduced a piece of Vue's composition API: `ref` (01), events (02), `computed` (03), `watch` (09), `onMounted` (08), `provide`/`inject` (11). A composable is just a function that uses these pieces together. `usePosts()` appeared in Lesson 08. This lesson formalizes the pattern.

---

## The lesson

### Step 1 — `useCounter.ts`

**The problem:** A counter with increment/decrement/reset logic appears in multiple places in a real app. If it lives directly in each component, any bug fix or change must be applied everywhere. Extract it once and import it anywhere.

**File:** Create `src/composables/useCounter.ts` (use the `+` button) — paste the entire file contents:

```typescript
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubled = computed(() => count.value * 2)

  function increment() { count.value++ }
  function decrement() { count.value-- }
  function reset() { count.value = initialValue }

  return { count, doubled, increment, decrement, reset }
}
```

**Walkthrough:**
- `export function useCounter(initialValue = 0)` — a plain TypeScript function; the naming convention `use` + noun signals "this function uses Vue's reactivity APIs — call it inside a component"
- `const count = ref(initialValue)` — creates a reactive ref; each call to `useCounter()` creates its own independent ref
- `const doubled = computed(...)` — derived state; re-computes whenever `count` changes
- `return { count, doubled, increment, decrement, reset }` — the public API of this composable; callers destructure what they need

**CS concept — closure:** The returned functions `increment`, `decrement`, and `reset` all close over `count`. When a component calls `useCounter()`, it gets back functions that already have a reference to *this call's* `count` ref. The closure is what makes each use of `useCounter()` independent — two components using `useCounter()` get two separate `count` refs.

**SE principle — cohesion:** All the pieces of counter logic live together: the state, the derived values, the functions. `ref`, `computed`, and the functions are cohesive — they have the same reason to change. High cohesion makes code easier to find, understand, and modify.

**What breaks if you call `useCounter()` at the module level (outside a component):** `computed()` called outside a component setup context still works (it creates a reactive value). But `onMounted` and lifecycle hooks would throw. Convention: composables that use lifecycle hooks must be called during component setup. `useCounter` is safe anywhere; composables that call `onMounted` are not.

---

### Step 2 — `useLocalStorage.ts`

**The problem:** Any reactive value that should persist across page refreshes needs to be saved to `localStorage` on change and read from `localStorage` on mount. This is the exact watcher pattern from Lesson 09 — make it reusable for any type.

**File:** Create `src/composables/useLocalStorage.ts` — paste the entire file contents:

```typescript
import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  const value = ref<T>(stored !== null ? JSON.parse(stored) : defaultValue)

  watch(value, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  return value
}
```

**Walkthrough:**
- `<T>` — a TypeScript generic parameter; the caller decides the type: `useLocalStorage<string>(...)`, `useLocalStorage<number>(...)`, `useLocalStorage<string[]>(...)`
- `localStorage.getItem(key)` — runs synchronously during setup; reads the saved value immediately
- `stored !== null ? JSON.parse(stored) : defaultValue` — `getItem` returns `null` when the key is absent; `JSON.parse` converts the stored string back to the original type
- `watch(value, ..., { deep: true })` — `{ deep: true }` is needed because `value` might be an object or array; without it, mutations to nested properties would not trigger the watcher
- `JSON.stringify(newVal)` — serialises the value to a string for storage; this handles numbers, booleans, arrays, and objects

**What is `<T>` in `useLocalStorage<T>(key: string, defaultValue: T)`?** A generic type parameter. `T` is a placeholder the caller fills in. When you call `useLocalStorage<string>('name', 'Anonymous')`, TypeScript replaces `T` with `string` throughout the function. The return type becomes `Ref<string>`. This is TypeScript generics — the same mechanism as `Array<string>` or `Promise<number>`.

**CS concept — generic programming:** `useLocalStorage<T>` works for any type `T` that can be JSON-serialized. You write the logic once; TypeScript enforces correctness for each specific type at each call site. Without generics you would need `useStringLocalStorage`, `useNumberLocalStorage`, etc. — one function per type.

**SE principle — DRY (Don't Repeat Yourself):** The localStorage read-parse-watch pattern is identical whether you are storing a name, a preference, or a list. Extracting it into a composable means the implementation lives in one place. Bug in `JSON.parse`? Fix it once. New storage requirement (encryption, compression)? Add it once.

---

### Step 3 — `useFetch.ts`

**The problem:** The three-state fetch pattern from Lesson 08 (loading/error/data) is the same in every component that fetches. Extract it as a generic composable.

**File:** Create `src/composables/useFetch.ts` — paste the entire file contents:

```typescript
import { ref, onMounted } from 'vue'

export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      data.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  })

  return { data, loading, error }
}
```

**Walkthrough:**
- `useFetch<T>(url: string)` — `T` is the type of the response data; callers specify it: `useFetch<Post[]>('...')`
- `ref<T | null>(null)` — `null` until the fetch completes; `T` after success
- `onMounted(async () => {...})` — fetches after the component is in the DOM (same as Lesson 08; now it's reusable)
- `e instanceof Error ? e.message : 'Unknown error'` — safe error handling regardless of what was thrown

---

### Step 4 — `App.vue` using all three composables

**File:** `src/App.vue` — replace the entire `<script setup>` section with:

```typescript
import { useCounter } from './composables/useCounter'
import { useLocalStorage } from './composables/useLocalStorage'
import { useFetch } from './composables/useFetch'

interface Post { id: number; title: string }

const { count, doubled, increment, decrement, reset } = useCounter(10)
const name = useLocalStorage<string>('user-name', 'Anonymous')
const { data: posts, loading, error } = useFetch<Post[]>(
  'https://jsonplaceholder.typicode.com/posts?_limit=3'
)
```

**File:** `src/App.vue` — replace the `<template>` section with:

```html
<template>
  <div class="app">

    <section>
      <h3>Counter</h3>
      <p>Count: {{ count }} · Doubled: {{ doubled }}</p>
      <div class="controls">
        <button @click="decrement">−</button>
        <button @click="reset">Reset</button>
        <button @click="increment">+</button>
      </div>
    </section>

    <section>
      <h3>Persisted name</h3>
      <input v-model="name" placeholder="Your name" />
      <p>Hello, {{ name }}! (try refreshing — it persists)</p>
    </section>

    <section>
      <h3>Posts</h3>
      <div v-if="loading">Loading...</div>
      <div v-else-if="error">Error: {{ error }}</div>
      <ul v-else>
        <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </section>

  </div>
</template>
```

**File:** `src/App.vue` — replace the `<style>` section with:

```html
<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 480px; margin: 40px auto; display: flex; flex-direction: column; gap: 24px; }
section { padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
h3 { font-size: 14px; font-weight: 700; margin: 0 0 12px; color: #41b883; }
.controls { display: flex; gap: 8px; }
.controls button { padding: 6px 16px; border: 1px solid #cbd5e1; border-radius: 6px; background: none; cursor: pointer; font-size: 14px; }
input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; width: 100%; box-sizing: border-box; margin-bottom: 8px; }
ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
li { font-size: 13px; color: #475569; }
p { font-size: 13px; color: #64748b; margin: 8px 0 0; }
</style>
```

**Walkthrough — the call site:**
- `const { count, doubled, ... } = useCounter(10)` — starts at 10; `count` and `doubled` are reactive; functions are plain functions
- `const name = useLocalStorage<string>('user-name', 'Anonymous')` — `name` is a `Ref<string>`; `v-model="name"` works directly on it
- `const { data: posts, loading, error } = useFetch<Post[]>(...)` — `data` renamed to `posts` at destructure; `posts` is `Ref<Post[] | null>`

**CS concept — composition:** The power of composables is that they compose. `useLocalStorage` uses `ref` and `watch`. `useFetch` uses `ref` and `onMounted`. You can build composables that use other composables:

```typescript
export function usePersistedCounter(key: string) {
  const stored = useLocalStorage<number>(key, 0)  // uses another composable
  const doubled = computed(() => stored.value * 2)
  function increment() { stored.value++ }
  return { count: stored, doubled, increment }
}
```

This is the same composability model as Unix pipes or React hooks.

**SE principle — reuse without inheritance:** Vue 2 used mixins for shared logic. Mixins had three problems: name collisions, unclear source of origin, implicit dependencies. Composables have none of these — destructuring makes the origin explicit, and there are no shared namespaces. Every imported value has a visible name at the call site.

---

## Three rules of composables

1. **Call during setup:** Composables that use lifecycle hooks (`onMounted`, `watch`) must be called synchronously during `<script setup>`. Not inside a callback, not after an `await`.

2. **Can call other composables:** `usePersistedCounter` can call `useLocalStorage`. Composition applies.

3. **Return reactive values:** The calling component destructures refs and functions and uses them directly in templates. The ref itself (not `.value`) is returned so Vue's template auto-unwrapping works.

---

## Series complete

You have built a full Vue 3 foundation:

| Lesson | Concept |
|--------|---------|
| 01 | `ref`, `{{ }}`, SFC structure |
| 02 | `@click`, event handlers |
| 03 | `computed()`, declarative derivation |
| 04 | `v-if`, `v-for`, `:key` |
| 05 | `defineProps`, component import |
| 06 | `defineEmits`, data down / events up |
| 07 | `v-model`, form handling |
| 08 | `onMounted`, `fetch`, three-state async |
| 09 | `watch`, `watchEffect`, side effects |
| 10 | `<slot>`, named slots, `$slots` |
| 11 | `provide`, `inject`, `InjectionKey` |
| 12 | Composables: encapsulate and reuse |

Every concept in this series appears in production Vue 3 applications daily. The spreadsheet series ahead applies them all to one ambitious, real-world project.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Counter increments, decrements, resets from 10
- [ ] Name persists through page refresh (check the storage in browser DevTools)
- [ ] Posts load from the API
- [ ] You can explain the three rules of composables
- [ ] Build `useDebounce<T>(source: Ref<T>, delayMs: number): Ref<T>` — a composable that returns a ref whose value updates only after the source has been stable for `delayMs` milliseconds
