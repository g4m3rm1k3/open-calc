# Composables

## What you will build

Three composables — `useCounter`, `useLocalStorage`, and `useFetch` — and an app that uses all three. Each composable encapsulates reusable reactive behavior. Your component imports and calls them like building blocks.

```
useCounter      →  count, doubled, increment, decrement, reset
useLocalStorage →  value (persisted across page refreshes, typed)
useFetch        →  data, loading, error  (the Lesson 08 pattern, extracted)
```

---

## What you need to know first

Every lesson in this series introduced a piece of Vue's Composition API: `ref` (01), events (02), `computed` (03), `watch` (09), `onMounted` (08), `provide`/`inject` (11). A composable is a function that uses these pieces to implement a reusable behavior. This lesson starts by showing the problem a composable solves — duplication of reactive logic — before extracting the solution.

---

## Step 1 — Logic without composables, and where duplication appears

Build two counters in `App.vue`. Without composables, you write the entire counter logic twice:

```html
<script setup lang="ts">
import { ref, computed } from 'vue'

// Counter 1: page views
const pageCount    = ref(0)
const pageDoubled  = computed(() => pageCount.value * 2)
function incPage()   { pageCount.value++ }
function decPage()   { if (pageCount.value > 0) pageCount.value-- }
function resetPage() { pageCount.value = 0 }

// Counter 2: score
const scoreCount   = ref(0)
const scoreDoubled = computed(() => scoreCount.value * 2)
function incScore()   { scoreCount.value++ }
function decScore()   { if (scoreCount.value > 0) scoreCount.value-- }
function resetScore() { scoreCount.value = 0 }
</script>

<template>
  <div>
    <h3>Pages: {{ pageCount }} (doubled: {{ pageDoubled }})</h3>
    <button @click="decPage">−</button>
    <button @click="resetPage">Reset</button>
    <button @click="incPage">+</button>

    <h3>Score: {{ scoreCount }} (doubled: {{ scoreDoubled }})</h3>
    <button @click="decScore">−</button>
    <button @click="resetScore">Reset</button>
    <button @click="incScore">+</button>
  </div>
</template>
```

Twelve lines of logic, six for each counter, identical in structure. Now a bug: `decrement` should allow going below zero (scores can be negative). Fix `decPage` and `decScore`. A new requirement: "doubled" should be "tripled." Update `pageDoubled` and `scoreDoubled`. Add a third counter. Add a fourth. Each addition multiplies the edit surface.

**CS lens — generalization.** Lesson 03 showed `computed` generalizing from "manually recalculate total in every function" to "declare what total is." Lesson 05 showed components generalizing from "copy the `<li>` template" to "define it once." A composable applies the same generalization to reactive *logic*: declare the behavior once as a function; call it from anywhere. The same pattern — one rule covering every case — applies at every level of abstraction.

**SE lens — duplication as a maintenance obligation.** Each copy of the counter logic is a contract: "this copy must remain synchronized with every other copy, forever." Every change, fix, and extension must be applied to all copies. As copies multiply, the probability that at least one is out of sync after any change approaches 1. The maintenance cost scales with the number of copies. A composable brings the copy count to 1.

---

## Step 2 — `useCounter.ts`: extracting reactive logic

Create `src/composables/useCounter.ts`:

```typescript
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count   = ref(initialValue)
  const doubled = computed(() => count.value * 2)

  function increment() { count.value++ }
  function decrement() { count.value-- }
  function reset()     { count.value = initialValue }

  return { count, doubled, increment, decrement, reset }
}
```

Replace `App.vue`'s script:

```typescript
import { useCounter } from './composables/useCounter.ts'

const {
  count: pageCount, doubled: pageDoubled,
  increment: incPage, decrement: decPage, reset: resetPage
} = useCounter(0)

const {
  count: scoreCount, doubled: scoreDoubled,
  increment: incScore
} = useCounter(0)
```

Twelve lines become two. Fix a bug in `useCounter` once — both counters benefit instantly.

**Walkthrough — a composable is a function.** `useCounter` is a plain TypeScript function. Nothing about it is specific to Vue *yet* — until you notice that its body calls `ref` and `computed`, which are Vue composition API functions. A composable is precisely this: **a function that uses Vue composition API functions**. That is the complete definition.

**Walkthrough — closure and independence:**

```typescript
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)   // created in this call's scope

  function increment() { count.value++ }  // closes over this call's count
  function decrement() { count.value-- }
  function reset()     { count.value = initialValue }

  return { count, doubled, increment, decrement, reset }
}
```

Each call to `useCounter()` creates a **new scope** with a **new `ref`**. `increment`, `decrement`, and `reset` **close over** the `count` ref created in their enclosing scope — the call that created them. This is JavaScript closure: the inner functions carry a reference to the specific `count` from their creation context, and that reference is fixed for the lifetime of the returned object.

Two calls to `useCounter()` produce two independent `count` refs. Incrementing `pageCount` does not affect `scoreCount` — they close over different refs. The closure is what makes each composable call independent.

**Walkthrough — destructuring with rename:**

```typescript
const { count: pageCount, increment: incPage } = useCounter()
```

`{ count: pageCount }` means: destructure the property `count` from the returned object, and bind it to the local name `pageCount`. This is standard JavaScript destructuring rename syntax — not Vue-specific. It allows using the same composable twice in the same component without name collisions: `count` from both calls would collide; `pageCount` and `scoreCount` do not.

**CS concept — closure, precisely.** A **closure** is a function that retains access to variables from its lexical scope even after that scope has exited. `increment` is created inside the `useCounter` function call. The call returns — the stack frame exits — but `increment` still refers to `count` from that frame. JavaScript keeps the frame's variables alive as long as any function references them. Two calls to `useCounter()` create two frames, each with its own `count`, producing two independent closures. This is the mechanism that makes composables stateful and isolated per call.

**SE principle — cohesion.** All the pieces of counter logic live together in `useCounter.ts`: the state, the derivation, the mutations. They have the same reason to change — they are all about "counter." **High cohesion** means a file or module contains things that belong together. **Low cohesion** means a file mixes unrelated concerns. The scattered counter logic in Step 1 was low cohesion: counter behavior was mixed with two different counters' declarations, in the same file as the template. `useCounter.ts` is high cohesion: everything inside is specifically about counter behavior.

---

## Step 3 — `useLocalStorage.ts`: extracting the Lesson 09 pattern

The save-to-localStorage pattern from Lesson 09 is identical for any serialisable type:

Create `src/composables/useLocalStorage.ts`:

```typescript
import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  const value  = ref<T>(stored !== null ? JSON.parse(stored) : defaultValue)

  watch(value, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  return value
}
```

Use it:

```typescript
const notes     = useLocalStorage<string>('notes', '')
const savedCount = useLocalStorage<number>('count', 0)
const settings  = useLocalStorage<{ dark: boolean; size: number }>('settings', { dark: false, size: 14 })
```

The read-parse-watch-save pattern from Lesson 09 — which was 5 lines — now applies to any JSON-serialisable type with one line.

**Walkthrough — `<T>` generics:**

```typescript
export function useLocalStorage<T>(key: string, defaultValue: T)
```

`<T>` is a **generic type parameter** — a placeholder for a type that the caller fills in. When you write `useLocalStorage<string>('key', '')`, TypeScript substitutes `string` everywhere `T` appears: `defaultValue` is `string`, and the return value is `Ref<string>`. A separate call with `<number>` gets `Ref<number>`. The same function body serves all types; the type system guarantees correctness at each call site.

Without generics you would need: `useStringLocalStorage`, `useNumberLocalStorage`, `useBooleanLocalStorage` — or a version that returns `Ref<unknown>` and loses all type safety. Generics allow you to write an algorithm once and let the type system specialize it for each use.

**Walkthrough — `{ deep: true }`:**

```typescript
watch(value, (newVal) => {
  localStorage.setItem(key, JSON.stringify(newVal))
}, { deep: true })
```

Without `{ deep: true }`, the watcher fires only when `value.value` is *replaced* — a new object or array assigned to `.value`. Mutating a property inside the object (`settings.value.dark = true`) does not replace the ref's value — it mutates a property inside it — and a shallow watcher would miss this. `{ deep: true }` traverses the value recursively and fires whenever any nested property changes.

**Walkthrough — `JSON.parse` and `JSON.stringify`:**

`localStorage` only stores strings. Complex values must be serialised. `JSON.stringify` converts any JSON-compatible value to a string; `JSON.parse` converts it back. Values that are not JSON-compatible (functions, `undefined`, circular references, `Date` objects) lose information through serialisation — `JSON.parse(JSON.stringify(new Date()))` produces a string, not a Date. For simple data (strings, numbers, booleans, plain objects, arrays), this is transparent.

**CS concept — generic programming.** `useLocalStorage<T>` works for any type `T` that can be JSON-serialised. Writing the algorithm once and parameterizing it over types is **generic programming** — the same principle behind `Array<T>`, `Promise<T>`, `Ref<T>`. The alternative to generics is either code duplication (one function per type) or loss of type safety (all values typed as `any`). Generics allow you to write "this algorithm works the same way for any type in this category" — *and* have the type system verify it at every call site.

---

## Step 4 — `useFetch.ts`: extracting the Lesson 08 pattern

The three-state fetch pattern from Lesson 08 is identical for any URL and any response type:

Create `src/composables/useFetch.ts`:

```typescript
import { ref, onMounted } from 'vue'

export function useFetch<T>(url: string) {
  const data    = ref<T | null>(null)
  const loading = ref(true)
  const error   = ref<string | null>(null)

  onMounted(async () => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      data.value = await res.json() as T
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fetch failed'
    } finally {
      loading.value = false
    }
  })

  return { data, loading, error }
}
```

Use it:

```html
<script setup lang="ts">
import { useFetch } from './composables/useFetch.ts'

interface Post { id: number; title: string }

const { data: posts, loading, error } = useFetch<Post[]>(
  'https://jsonplaceholder.typicode.com/posts?_limit=5'
)
</script>

<template>
  <p v-if="loading">Loading…</p>
  <p v-else-if="error">{{ error }}</p>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
  </ul>
</template>
```

The 15-line `onMounted`/`try`/`catch`/`finally` pattern from Lesson 08 is now one line.

**Walkthrough — `onMounted` inside a composable:**

When `useFetch` is called during a component's setup, Vue knows which component is currently initializing. `onMounted` called inside `useFetch` registers the lifecycle hook on *that component* — the one whose setup is currently running. Vue maintains a reference to the "current instance" during setup; lifecycle hooks and `inject`/`provide` all use this reference. The composable does not need to know which component is using it.

**Walkthrough — `as T` type assertion:**

```typescript
data.value = await res.json() as T
```

`res.json()` returns `Promise<any>` — TypeScript knows a JSON response was parsed, but not its shape. `as T` is a **type assertion**: you are telling TypeScript "trust me, this value is of type T." The runtime does not check this — if the API returns a different shape than T, TypeScript will not catch it. For production code, use a validation library (Zod, Valibot) to verify the shape at runtime.

**CS concept — abstraction boundaries.** Each composable defines a boundary: the **public API** (what is returned) is stable; the **implementation** (how state is managed, how the fetch is performed) is internal. Callers depend on the public API. If `useFetch` later adds caching, retry logic, or request deduplication — callers see no change. The abstraction boundary insulates callers from implementation details.

**CS concept — composing composables.** Composables can call other composables:

```typescript
export function useSearchablePosts(query: Ref<string>) {
  const { data: allPosts, loading, error } = useFetch<Post[]>('/api/posts')
  const filtered = computed(() =>
    allPosts.value?.filter(p => p.title.includes(query.value)) ?? []
  )
  return { posts: filtered, loading, error }
}
```

`useSearchablePosts` builds on `useFetch` and `computed`. This layering — composables that call composables — is how complex behaviors are built from simple ones. Each layer adds one responsibility; no layer knows about layers above it.

**SE principle — DRY, paid in full.** Each behavior has one definition. `useFetch` is defined once; every component that fetches uses it. A bug in the error-catching logic: fixed once, fixed everywhere. A new requirement to add a timeout: added once, applies everywhere. The number of places a change must be applied drops from N (one per component) to 1.

---

## The `use` naming convention

A function that uses Vue Composition API internals (`ref`, `computed`, `watch`, `onMounted`, `provide`, `inject`) is called a **composable** and named with a `use` prefix by convention. This signals: "this function has Vue reactive internals; it must be called during component setup (inside `<script setup>` or a `setup()` function)."

A function without `use` is a plain utility — safe to call anywhere, no Vue internals:

```typescript
// Composable — must be called in setup:
const { count, increment } = useCounter()

// Plain utility — can be called anywhere:
const formatted = formatCurrency(price.value)
```

The `use` prefix is a social contract. Vue does not enforce it. Breaking it — calling a composable outside setup — produces the error: `inject() can only be used inside setup() or functional components.`

---

## Definition of done

Build a page that uses all three composables. Click **▶ Run** and verify:

- [ ] Two counters increment/decrement independently — changing one does not affect the other
- [ ] A textarea backed by `useLocalStorage` persists its content after page refresh
- [ ] Posts from `useFetch` load with a loading state, then display correctly
- [ ] You can explain why two calls to `useCounter()` produce independent counters (closure)
- [ ] You can explain what `<T>` in `useFetch<T>()` does and why `as T` is a runtime risk
- [ ] You can explain why `onMounted` inside a composable registers on the calling component
- [ ] You can explain the `use` naming convention and what it signals to readers
- [ ] Write a `useDebounce(value: Ref<string>, delay: number)` composable that returns a ref that only updates when the input has been stable for `delay` milliseconds
