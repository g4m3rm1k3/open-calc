# Fetch Data

## What you will build

A post list that fetches real JSON from a public API when the component mounts, shows a loading spinner while the request is in flight, and shows an error message if it fails.

```
Loading...
           ↓ (after fetch)
• Post title one
• Post title two
• Post title three
```

---

## Connects backward

Lessons 01–07 used only local data. This lesson introduces the first external boundary: `fetch()`. The three-state pattern (loading / error / data) is the standard React/Vue/Angular solution for any async operation. You will use it in every real application.

---

## The lesson

### Step 1 — TypeScript interface and reactive state

**The problem:** The API returns JSON objects with a known shape. TypeScript cannot infer the shape from `fetch()` — we must declare it. The component also needs three reactive values: the posts data, a loading flag, and an error message.

**File:** `src/App.vue` — replace the entire `<script setup>` section with:

```typescript
import { ref, onMounted } from 'vue'

interface Post {
  id: number
  title: string
  body: string
}

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    posts.value = await res.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    loading.value = false
  }
})
```

**Walkthrough — the three refs:**
- `ref<Post[]>([])` — the `<Post[]>` generic tells TypeScript this ref holds an array of `Post` objects; without it TypeScript would infer `Ref<never[]>` which rejects `Post` objects when you assign `res.json()` to it
- `ref(true)` — starts `true` so the template renders "Loading..." immediately, before the request completes
- `ref<string | null>(null)` — `null` means no error; a non-null string means the error message to display

**What is `ref<string | null>(null)`?** A union type in TypeScript — the value is either a `string` or `null`. This is more precise than just `ref('')` because you can distinguish "no error" (null) from "error with empty message" (empty string). Vue's `v-else-if="error"` treats `null` as falsy, so the error section only renders when an error occurred.

**Walkthrough — `onMounted`:**

```typescript
onMounted(async () => {
  // runs once, after the component is in the DOM
})
```

`onMounted` is a **lifecycle hook** — a callback Vue calls at a specific point in a component's life. The component lifecycle:

1. Setup (script runs, refs created)
2. **Mounted** ← `onMounted` fires here — the component is visible in the DOM
3. Updated (re-renders when reactive data changes)
4. Unmounted (component removed from DOM) ← `onUnmounted` fires here

**Why fetch inside `onMounted` and not at the top level of `<script setup>`?** Top-level script runs synchronously during setup. `onMounted` fires *after* the initial render, so the user sees "Loading..." immediately. If you fetched at the top level and awaited it, setup would pause and the user would see nothing until the fetch completed.

**CS concept — program lifecycle events:** Every long-running program has lifecycle events. A server has `startup`/`shutdown`. A mobile app has `foreground`/`background`. A Vue component has `mounted`/`unmounted`. Lifecycle hooks let you attach behaviour at the right moment without polling or timers.

**SE principle — error handling at the boundary:** The `try/catch` wraps the entire fetch operation. `e instanceof Error ? e.message : String(e)` — the `instanceof` check is important: `fetch` can throw non-Error objects in some environments. Always guard with `instanceof Error` before accessing `.message`; fall back to `String(e)` otherwise.

**What breaks if you remove `finally { loading.value = false }`:** The spinner never stops. Even after the fetch succeeds and `posts.value` is populated, `loading` is still `true`, so the template keeps showing "Loading..." indefinitely. `finally` is the right place because it runs whether the fetch succeeded or failed — you always want to stop the spinner.

---

### Step 2 — Template with three-state rendering

**The problem:** The template must show exactly one of three states: loading, error, or data. `v-if / v-else-if / v-else` creates a mutually exclusive choice.

**File:** `src/App.vue` — replace the `<template>` and `<style>` sections with:

```html
<template>
  <div class="app">
    <h2>Latest Posts</h2>

    <div v-if="loading" class="state">
      Loading...
    </div>

    <div v-else-if="error" class="state error">
      Error: {{ error }}
    </div>

    <ul v-else>
      <li v-for="post in posts" :key="post.id" class="post">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.app { font-family: system-ui, sans-serif; max-width: 560px; margin: 40px auto; }
h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.state { text-align: center; padding: 40px; color: #64748b; }
.state.error { color: #dc2626; }
ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.post { padding: 16px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
.post h3 { font-size: 14px; font-weight: 600; margin: 0 0 6px; text-transform: capitalize; }
.post p { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
</style>
```

**Walkthrough:**
- `v-if="loading"` → `v-else-if="error"` → `v-else` — exactly one renders at any moment; these three branches map to the three ref states
- When `loading` becomes `false` and `error` is `null`, the `v-else` branch renders the list
- `v-for="post in posts"` — iterates the `Post[]` array; TypeScript knows `post` is a `Post`, so accessing `post.title` is type-safe

**CS concept — state machine:** The loading/error/data trio is a state machine with three states and three transitions:
- `initial` → `loading` (on mount)
- `loading` → `success` (fetch ok)
- `loading` → `error` (fetch fails)

State machines guarantee only one state is active at a time. This is why `v-if / v-else-if / v-else` is the right pattern — it enforces the same guarantee in the template.

**SE principle — fail visibly:** An error state that shows nothing is worse than a visible error message. The user thinks the app is broken; they have no information to act on. Always render the error. In production, also log it to your error tracker (Sentry, etc.).

---

## Connects forward

Lesson 09 introduces `watch` for running side effects when reactive values change. The `onMounted` lifecycle hook you learned here pairs with `onUnmounted` (covered in Lesson 11) — every resource acquired in `onMounted` should be released in `onUnmounted`.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] "Loading..." appears briefly, then the post list renders
- [ ] Change the URL to something invalid — the error state renders
- [ ] You can explain what `onMounted` is and when it runs relative to the initial render
- [ ] You can explain why `finally` is the right place to set `loading = false`
- [ ] Add a Refresh button that re-fetches: move the fetch logic into a named `load()` function and call it from both `onMounted` and the button's `@click`
