---
series: vue-fundamentals
level: 3
title: Watchers and Composables
lang: javascript
---

# Watchers and Composables

Vue's `watch` and `watchEffect` let you run side effects in response to reactive state changes. Composables are the Composition API's answer to code reuse: plain JavaScript functions that use Vue's reactivity APIs and can be shared across components. Together, these patterns replace all of the Options API's `watch` and `mixins` features with something more explicit and composable.

## watch: targeted reactive observation

`watch` observes a specific source and runs a callback when it changes. Unlike `computed`, a watcher runs side effects (API calls, localStorage writes, logging) rather than returning a derived value.

```javascript
import { ref, watch } from 'vue'

const query = ref('')
const results = ref([])
const loading = ref(false)

// watch(source, callback, options)
// source: a ref, a reactive property getter, or an array of sources
watch(query, async (newValue, oldValue) => {
  if (!newValue.trim()) {
    results.value = []
    return
  }
  loading.value = true
  results.value = await searchApi(newValue)
  loading.value = false
})

// WATCHING A REACTIVE OBJECT PROPERTY: must use a getter
const user = reactive({ name: '', email: '' })

watch(
  () => user.name,            // getter — watch this specific property
  (newName, oldName) => {
    console.log(`Name changed: ${oldName} → ${newName}`)
  }
)

// WATCHING MULTIPLE SOURCES
watch(
  [query, () => user.name],   // array of sources
  ([newQuery, newName], [oldQuery, oldName]) => {
    console.log('Either query or user.name changed')
  }
)
```

```javascript
// WATCH OPTIONS
watch(source, callback, {
  // immediate: true → run the callback immediately on mount (don't wait for a change)
  immediate: true,

  // deep: true → watch nested properties of an object
  // Without deep, watch only fires on the object reference changing, not its properties
  deep: true,

  // flush: 'post' → run the callback AFTER Vue has updated the DOM
  // Useful when the callback needs to access the updated DOM (e.g., reading offsetHeight)
  flush: 'post',
})
```

```text
WHEN TO USE watch vs computed:

  computed:
    → Returns a value derived from reactive data
    → No side effects (no API calls, no console.log, no DOM manipulation)
    → Example: const displayName = computed(() => user.value.name.trim() || 'Anonymous')
    
  watch:
    → Runs a side effect when data changes
    → Examples: fetch from an API, save to localStorage, log analytics, start a timer
    
  THE RULE: if you're computing a value → computed.
             if you're reacting to a change → watch.
             
  COMMON MISTAKE: using watch to update another reactive value
    ✗ watch(a, (val) => { b.value = val * 2 })   — use computed instead
    ✓ const b = computed(() => a.value * 2)
```

**CS lens:** `watch` is an explicit subscription to a reactive signal. In reactive programming terms, `ref` and `reactive` are **signals** (sources of change), `computed` is a **derived signal** (a memo), and `watch` is an **effect** (a subscription that runs on signal changes). This is the same model as SolidJS signals, MobX reactions, and Svelte's `$:` reactive declarations. The underlying mechanism is the same: Vue tracks which reactive values the callback reads (or you explicitly specify the source), then re-runs the callback when any of those values change.

## watchEffect: implicit dependency tracking

`watchEffect` is like `watch` but tracks its dependencies automatically — whatever reactive values are read inside the callback become its dependencies.

```javascript
import { ref, watchEffect } from 'vue'

const userId = ref(1)
const userData = ref(null)

// watchEffect: no explicit source — it runs immediately and tracks dependencies
const stopWatch = watchEffect(async (onCleanup) => {
  // onCleanup: register a cleanup function called when the effect is re-run or stopped
  let cancelled = false
  onCleanup(() => { cancelled = true })

  const response = await fetch(`/api/users/${userId.value}`)  // reads userId.value
  // → userId is now a dependency: when userId changes, this effect re-runs

  if (!cancelled) {
    userData.value = await response.json()
  }
})

// Change userId → watchEffect re-runs automatically
userId.value = 2   // fetches /api/users/2

// Stop the watcher (e.g., when you no longer need it)
stopWatch()
```

```text
watch vs watchEffect:

  watch:
    → Explicit sources: you declare what to watch
    → Callback receives old and new values
    → Doesn't run immediately by default (use immediate: true to change this)
    → Better when you need the previous value or want precise control
    
  watchEffect:
    → Implicit sources: reads inside the callback become dependencies
    → Runs immediately (on component mount)
    → No access to previous values
    → Better for side effects that depend on many reactive values and you
      don't need the previous value
    
  PERFORMANCE TIP:
    Each watchEffect re-run discards old dependencies and re-tracks new ones.
    If your effect conditionally reads values, dependencies can change dynamically.
    This is powerful but can be surprising — Vue DevTools shows an effect's current
    dependencies in the reactive tree.
```

**SE lens:** The `onCleanup` pattern in `watchEffect` mirrors React's `useEffect` return function. Both solve the same race condition problem: when an async effect is re-triggered before the previous one finishes, the previous result should be discarded. The mechanism differs: React returns a cleanup function; Vue passes a cleanup registrar as an argument. The Vue approach allows cleanup registration anywhere in the async flow, not just at the return point — useful when you have multiple async operations that each need their own cleanup. Both patterns implement **cancellation tokens** — a standard async pattern where a token signals "this operation is no longer needed; if it finishes, discard the result."

## Composables: extracting reusable logic

A composable is a function that uses Vue's Composition API and encapsulates reusable reactive logic. Composables replace the Options API's `mixins` — they do the same job without the naming collision and unclear data origin problems that mixins had.

```javascript
// useWindowSize.js — composable that tracks window dimensions
import { ref, onMounted, onUnmounted } from 'vue'

export function useWindowSize() {
  const width  = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  function update() {
    width.value  = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { width, height }
}
```

```javascript
// useFetch.js — composable for data fetching with loading/error state
import { ref, watch, toValue } from 'vue'

// toValue (Vue 3.3+): unwraps refs OR calls getters — accepts refs, getters, or plain values
export function useFetch(urlSource) {
  const data    = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  watch(
    () => toValue(urlSource),   // urlSource can be a ref, a getter, or a plain string
    async (url) => {
      if (!url) return
      loading.value = true
      error.value   = null
      data.value    = null

      try {
        const r = await fetch(url)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        data.value = await r.json()
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    },
    { immediate: true }
  )

  return { data, loading, error }
}
```

```html noplay
<!-- Using both composables in a component -->
<template>
  <div>
    <p>Window: {{ width }}×{{ height }}</p>
    <div v-if="loading">Loading user...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else-if="data">{{ data.name }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWindowSize } from './useWindowSize'
import { useFetch } from './useFetch'

const { width, height } = useWindowSize()

const userId = ref(1)
// Pass a getter → useFetch automatically re-fetches when userId changes
const { data, loading, error } = useFetch(() => `/api/users/${userId.value}`)
</script>
```

```text
COMPOSABLE CONVENTIONS:
  1. File name starts with 'use': useFetch, useWindowSize, useCart, useAuth
  2. Function name starts with 'use': same reason — signals it uses reactivity hooks
  3. Returns refs (not raw values): consumers can destructure without losing reactivity
     ✓ return { width, height }         — width and height are refs; destructuring is safe
     ✗ return { width: width.value }    — consumers get plain numbers; reactivity lost
  4. Accepts refs as arguments: allows composables to react to parent state changes
     useFetch(userId)         — userId is a ref; useFetch can watch it
     useFetch(() => url)      — getter function; equally reactive

COMPOSABLES vs OPTIONS API MIXINS:
  Mixins: all mixin properties are merged into the component's this context
           → name collisions if two mixins declare the same property
           → unclear which property came from which mixin
  
  Composables: explicit — you destructure what you need and name it yourself
               const { width: windowWidth } = useWindowSize()
               const { width: imageWidth }  = useImageSize(img)
               → no collisions, clear origin
```

**Common mistakes:**
- Calling composables conditionally — `if (condition) { const { data } = useFetch(url) }` — this is the same error as calling React hooks conditionally. Vue's reactivity setup must run in a consistent order. Composables must be called at the top level of `setup()` or `<script setup>`, never inside `if`, `for`, or nested functions.
- Returning raw values from composables — `return { count: count.value }` instead of `return { count }`. Destructuring the return value loses reactivity because you're unwrapping the ref at return time, not at use time. Return the refs themselves.
- Using watch with a reactive object without a getter — `watch(user, callback)` watches the whole object reference. Changes to `user.name` won't trigger it unless you use `deep: true`. To watch a specific property: `watch(() => user.name, callback)`.

**Debug tip:** `watchEffect` and `watch` both return a stop function. In Vue DevTools, the Effects panel shows all active watchers. If an effect is running when you don't expect it, check which reactive values it's reading — Vue DevTools shows each effect's current dependency list. If an effect is NOT running when you expect it, check that the reactive values you're reading are actually reactive (refs or reactive objects, not plain JavaScript values).

## Challenge: createComposableUtils

Implement two composable utilities.

```challenge
function createComposableUtils(vue) {
  // vue is an object that provides: { ref, watch, watchEffect }
  // (same API as importing from 'vue' — lets us test without a real Vue install)
  //
  // useCounter(initial = 0)
  //   Returns { count, increment, decrement, reset }
  //   count: a ref holding the current number
  //   increment(by = 1): increase count by `by`
  //   decrement(by = 1): decrease count by `by`
  //   reset(): set count back to initial value
  //
  // useToggle(initial = false)
  //   Returns { value, toggle, setTrue, setFalse }
  //   value: a ref holding the current boolean
  //   toggle(): flip the value
  //   setTrue(): set value = true
  //   setFalse(): set value = false
  //
  // useStorage(key, defaultValue)
  //   Returns a ref whose value is:
  //     - Initialised from the provided store object (simulates localStorage)
  //     - Automatically written back to store when the ref changes
  //   Accepts: (key, defaultValue, store = {})
  //   The store is a plain object (no real localStorage needed for testing)
}
```

```test
const changes = []
const vue = {
  ref: (v) => {
    let _v = v
    const r = {
      get value() { return _v },
      set value(n) { _v = n; changes.push({ ref: 'any', val: n }) }
    }
    return r
  },
  watch: (src, cb, opts) => {
    if (opts && opts.immediate) cb(typeof src === 'function' ? src() : src.value, undefined)
  },
  watchEffect: (fn) => fn(() => {}),
}

const utils = createComposableUtils(vue)

// useCounter
const counter = utils.useCounter(10)
assert counter.count.value === 10
counter.increment(4)
counter.decrement()
assert counter.count.value === 13
counter.reset()
assert counter.count.value === 10

// useToggle
const toggle = utils.useToggle(false)
toggle.toggle()
toggle.setFalse()
assert toggle.value.value === false

// useStorage
const store = { 'ui-theme': 'dark' }
const theme = utils.useStorage('ui-theme', 'light', store)
const newKey = utils.useStorage('font-size', 16, store)
assert theme.value === 'dark' && newKey.value === 16   // loads existing, defaults when missing
newKey.value = 18
assert store['font-size'] === 18   // written back to the store
```
