# Fetch Data

## What you will build

A post list that fetches real JSON from a public API when the component mounts, shows a loading spinner while the request is in flight, shows an error message if it fails, and includes a retry button.

```
⏳ Loading...
           ↓ (after ~200ms)
• Why JavaScript Is Great
• The Best Coffee
• Learning Vue
           [Retry]
```

---

## What you need to know first

Lessons 01–07 used only local reactive data. This lesson introduces the first external boundary: `fetch()`. Any time your component talks to the outside world — an API, localStorage, a WebSocket — you are crossing a system boundary where timing, errors, and state management become real concerns. The lesson starts by showing what the "obvious" approach produces and exactly why it is inadequate.

---

## What `fetch()` is

`fetch(url)` sends an HTTP request to a URL and returns a **Promise** — a JavaScript object representing a value that will be available in the future. The browser initiates the network request asynchronously and calls your callback when the response arrives.

```javascript
// fetch returns a Promise
const responsePromise = fetch('https://api.example.com/data')

// .then() registers a callback to run when the promise resolves
responsePromise.then(response => {
  console.log('got response', response.status)
})
```

`async`/`await` is syntactic sugar over `.then()`:

```javascript
async function loadData() {
  const response = await fetch('https://api.example.com/data')  // pauses here
  console.log('got response', response.status)                  // runs after
}
```

`await` pauses execution of the async function until the Promise resolves, then continues with the result. The rest of the JavaScript engine keeps running while waiting — `await` does not block.

**What a fetch call actually does:** sends a request over the network (or localhost). The request has a method (GET by default), headers, and optionally a body. The server processes it and sends back a response with a status code (`200 OK`, `404 Not Found`, `500 Internal Server Error`) and a body (JSON, HTML, binary).

`response.json()` reads the response body as text and parses it as JSON. It is also asynchronous — the body may arrive in multiple chunks.

---

## Step 1 — The natural approach, and where it fails

The natural instinct is to `await fetch()` directly at the top of `<script setup>`:

```html
<script setup lang="ts">
import { ref } from 'vue'

const posts = ref([])

// Attempt: await at the top level of <script setup>
const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
posts.value = await res.json()
</script>

<template>
  <ul>
    <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
  </ul>
</template>
```

Click **▶ Run**. Several problems:

**Problem 1 — no loading state.** While the fetch is in flight, the template renders an empty list. Users see nothing. They cannot tell whether the data is loading or genuinely absent.

**Problem 2 — no error handling.** If the network fails, `fetch()` rejects the Promise. An unhandled rejection becomes an uncaught error. The page shows nothing. No message, no retry button.

**Problem 3 — no control over timing.** `<script setup>` runs synchronously during component creation — before the component's DOM exists. Top-level `await` suspends the entire component until the fetch completes. No other component can mount while this one is suspended. In complex component trees this creates blocking stalls.

**Problem 4 — the three states collapse into one.** A network request has exactly three states at any moment: loading, success, error. This code has no model for them. `posts` is an empty array during loading and after an error — indistinguishable. The UI cannot tell the user what is happening.

**CS lens — the execution context problem.** `<script setup>` code runs during the **synchronous setup phase** of the component — before the component has a DOM element, before it is mounted, before any lifecycle hooks. Code that should respond to the component becoming visible (fetching data to display) should not run in setup. Vue's lifecycle hooks were designed precisely to let you attach code to specific moments in a component's life. `onMounted` is the hook for "the component is in the DOM and ready."

**SE lens — the missing state machine.** Every real-world async operation is a **state machine** with three states: in-progress, succeeded, failed. Code that does not model these states cannot display them. The UI has no way to show "loading" if there is no `loading` state, no way to show "network error" if there is no `error` state. A model that does not represent a state cannot produce correct UI for that state.

---

## Step 2 — `onMounted` and the three-state pattern

Replace the entire `src/App.vue`:

```html
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Post {
  id: number
  title: string
  body: string
  userId: number
}

const posts   = ref<Post[]>([])
const loading = ref(true)
const error   = ref<string | null>(null)

async function fetchPosts() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    posts.value = await res.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPosts)
</script>

<template>
  <div class="app">
    <h2>Posts</h2>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>Loading…</span>
    </div>

    <div v-else-if="error" class="error">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchPosts">Retry</button>
    </div>

    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        <strong>{{ post.title }}</strong>
        <p>{{ post.body }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; }
h2 { font-size: 22px; margin-bottom: 20px; }
.loading { display: flex; align-items: center; gap: 10px; color: #64748b; }
.spinner {
  width: 18px; height: 18px; border-radius: 50%;
  border: 3px solid #e2e8f0; border-top-color: #41b883;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error { padding: 16px; background: #fef2f2; border-radius: 8px; }
.error p { color: #dc2626; margin-bottom: 10px; }
.error button { padding: 8px 16px; background: #41b883; color: white; border: none; border-radius: 6px; cursor: pointer; }
ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 16px; }
li { padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
li strong { display: block; margin-bottom: 6px; }
li p { margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; }
</style>
```

**Walkthrough — the three reactive refs:**

```typescript
const posts   = ref<Post[]>([])
const loading = ref(true)
const error   = ref<string | null>(null)
```

Each ref represents one of the three states, independently:

- `posts` starts as `[]` — empty, not yet loaded
- `loading` starts as `true` — the "Loading…" message appears immediately on mount
- `error` starts as `null` — no error yet

The three states are **mutually exclusive** but independently tracked. A properly written async operation always transitions between them in a predictable sequence:

```
Initial:  loading=true, error=null, posts=[]
Success:  loading=false, error=null, posts=[...data]
Error:    loading=false, error='message', posts=[]
```

`ref<Post[]>([])` — the explicit `<Post[]>` generic overrides TypeScript's inference. Without it, TypeScript infers `Ref<never[]>` from the empty array literal — a type that refuses to accept any objects. `Post[]` tells TypeScript this ref is intended to hold an array of Post objects. After `posts.value = await res.json()`, TypeScript knows `posts.value` is `Post[]` and gives you `.map()`, `.filter()`, and property access on the items.

**Walkthrough — `fetchPosts` as an extractable function:**

```typescript
async function fetchPosts() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('...')
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    posts.value = await res.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPosts)
```

Extracting the fetch logic into a named function `fetchPosts` — rather than writing the `async` callback directly inside `onMounted` — gives you the retry button for free: `@click="fetchPosts"` reuses the exact same function. It also resets `loading` and `error` at the start: a retry should clear the previous error and show the spinner again.

**Walkthrough — `onMounted(fetchPosts)`:**

`onMounted(callback)` registers `callback` to be called once, after the component's DOM elements have been created and inserted into the page. Vue calls it during the component's **mount** phase — after the first render completes.

`onMounted(fetchPosts)` — notice: no parentheses on `fetchPosts`. This passes the *function reference* to `onMounted`, which will call it later. `onMounted(fetchPosts())` would *call* `fetchPosts` immediately and pass the resulting Promise to `onMounted` — Vue would receive a Promise, not a function, and the callback would never be called. This is the same distinction as `@click="fn"` vs `@click="fn()"` from Lesson 02.

**Walkthrough — `if (!res.ok) throw new Error(...)`:**

`fetch()` only rejects its Promise on network failures (no internet connection, DNS lookup failure, CORS block). A server responding with `404 Not Found` or `500 Internal Server Error` resolves the Promise successfully — `fetch` considers a server response, any response, to be a successful fetch. The `res.ok` property is `true` for `2xx` status codes and `false` for everything else. Checking `!res.ok` is the standard way to detect HTTP errors that `fetch` would otherwise treat as success.

`throw new Error(...)` — throwing inside the `try` block jumps execution directly to `catch (e)`. The `error.value = e.message` line runs; `posts.value` is not updated; `loading.value` is set to `false` in `finally`.

**Walkthrough — `finally`:**

```typescript
} finally {
  loading.value = false
}
```

`finally` runs in all outcomes: when `try` completes normally (no error), and when `catch` completes after handling an error. Without `finally`:
- On success: you would need `loading.value = false` at the end of `try` 
- On error: you would need `loading.value = false` at the end of `catch`

Two places to remember. Miss one and the spinner stays visible forever after the other path. `finally` guarantees a single location.

**Walkthrough — `v-else-if` for the three states:**

```html
<div v-if="loading">Loading…</div>
<div v-else-if="error">{{ error }}</div>
<ul v-else>...</ul>
```

Three mutually exclusive elements: only one is ever in the DOM. `v-if="loading"` is checked first; if true, the loading UI shows. If false, `v-else-if="error"` is checked; if truthy, the error UI shows. If both are false (loading done, no error), `v-else` renders the post list. This maps directly to the three-state model.

**CS concept — lifecycle hooks as a state machine.** A Vue component transitions through defined states: created → mounted → updated* → unmounted. `onMounted` is a callback attached to the created → mounted transition. `onUnmounted` is a callback for the mounted → unmounted transition. Each hook runs once per component instance per transition. The framework manages the state machine; you attach behavior to specific transitions.

Why does this matter? Because work that requires the DOM to exist cannot run before `onMounted`. Work that should clean up (cancel timers, remove event listeners, abort fetches) must run at `onUnmounted`. The lifecycle is not arbitrary — it maps directly to when your code is allowed to do what.

**CS concept — three-state async model.** Every operation that takes an unknown amount of time has exactly three observable states: pending (in progress), fulfilled (succeeded with a value), rejected (failed with a reason). JavaScript's `Promise` type names these same three states. The `loading` / `error` / `data` pattern is the Vue-friendly translation: instead of Promise state, you have three reactive refs that can be combined with `v-if`/`v-else-if`/`v-else` to produce correct UI for all three cases.

**SE principle — explicit over implicit.** `loading` starts as `true`, not inferred from whether `posts` is empty. An empty posts array could mean "loading" or "loaded, no results returned" or "loaded, but filtered to zero." These are different states that need different UI: a spinner, a "no results" message, an "empty server" message. Explicit boolean flags make each state readable from the code. The cost is three extra refs; the payoff is three separable, independently renderable states.

---

## Lifecycle hook reference

| Hook | When it runs | Typical use |
|------|-------------|-------------|
| `onBeforeMount` | Before first render (DOM not created) | Rarely needed |
| `onMounted` | After first render (DOM in page) | Data fetching, DOM measurement, subscriptions |
| `onBeforeUpdate` | Before a reactive update re-renders | Read DOM before it changes |
| `onUpdated` | After a reactive update re-renders | Read updated DOM |
| `onBeforeUnmount` | Before component tears down | Cancel timers, abort fetches |
| `onUnmounted` | After component is removed | Final cleanup |

**Cleanup on unmount:** If a component unmounts while a fetch is in flight (user navigates away), the `async` callback continues executing in the background. When it resolves, it tries to set refs on a component that no longer exists. Vue does not crash on this — the refs exist, writing to them is harmless — but it is wasted work. For production code, use `AbortController`:

```typescript
let controller: AbortController | null = null

onMounted(() => {
  controller = new AbortController()
  fetch(url, { signal: controller.signal })
    .then(...)
    .catch(e => { if (e.name !== 'AbortError') error.value = e.message })
})

onBeforeUnmount(() => {
  controller?.abort()
})
```

`abort()` cancels the in-flight request. The fetch rejects with an `AbortError`, which you catch and ignore.

---

## Connects forward

Lesson 09's `watch()` is the complement: where `onMounted` runs once, `watch` runs whenever a value changes. A component that refetches when its route parameter changes uses both: `onMounted` for the initial fetch, `watch(route.params.id, fetchPosts)` for subsequent navigation.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] "Loading…" with spinner appears immediately
- [ ] The post list renders after the fetch completes
- [ ] Modify the URL to be invalid — the error message and Retry button appear
- [ ] Clicking Retry re-fetches and shows loading again before success or another error
- [ ] You can explain why `loading` starts as `true` and is set to `false` in `finally`
- [ ] You can explain why `!res.ok` must be checked explicitly
- [ ] You can explain the difference between `onMounted(fetchPosts)` and `onMounted(fetchPosts())`
- [ ] You can explain what `AbortController` solves and when you need it
