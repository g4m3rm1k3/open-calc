# Watchers

## What you will build

A notes editor that automatically saves to `localStorage` whenever content changes, shows "Saved at HH:MM:SS" for two seconds after each save, and restores the last saved content on load.

```
┌─ Notes ─────────────────────────── Saved at 3:41:22 PM ─┐
│                                                          │
│  Type here…                                              │
│                                                          │
└──────────────────────────── 23 characters ───────────────┘
```

---

## Connects backward

Lesson 03 showed `computed()` — derive a new value from existing state. This lesson shows `watch()` — run a side effect *when* state changes. They look similar but serve different purposes.

---

## The lesson

### Step 1 — Watch content and save to localStorage

**The problem:** Every time `content` changes (on each keystroke), we need to save it to `localStorage` and briefly show a timestamp. This is a side effect — it has no return value, it reaches outside Vue's reactivity system to interact with the browser's storage API. That is what `watch` is for.

**File:** `src/App.vue` — replace the entire `<script setup>` section with:

```typescript
import { ref, watch } from 'vue'

const STORAGE_KEY = 'vue-notes-v1'

const content = ref(localStorage.getItem(STORAGE_KEY) ?? '')
const savedAt = ref<string | null>(null)
let saveTimer: ReturnType<typeof setTimeout>

watch(content, (newValue) => {
  clearTimeout(saveTimer)
  localStorage.setItem(STORAGE_KEY, newValue)
  savedAt.value = new Date().toLocaleTimeString()
  saveTimer = setTimeout(() => { savedAt.value = null }, 2000)
})
```

**Walkthrough:**
- `localStorage.getItem(STORAGE_KEY) ?? ''` — reads the saved note on startup; `??` (nullish coalescing) falls back to empty string if nothing is stored; this runs synchronously during setup, before the component mounts
- `watch(content, (newValue) => { ... })` — registers a callback that runs whenever `content.value` changes; `newValue` is the new string after the change
- `clearTimeout(saveTimer)` — cancels any pending "hide the Saved message" timer; without this, rapid typing stacks multiple timers
- `localStorage.setItem(STORAGE_KEY, newValue)` — the side effect: writes to browser storage; this would be illegal inside a `computed()` getter
- `saveTimer = setTimeout(...)` — starts a 2-second countdown to hide the timestamp; plain `let` variable, not reactive (we never display `saveTimer` in the template)

**What is `ReturnType<typeof setTimeout>`?** A TypeScript utility type. `setTimeout` returns a timer ID — a `number` in browsers, a `NodeJS.Timeout` object in Node.js. `ReturnType<typeof setTimeout>` infers the correct type in either environment without importing Node.js types.

**What is `??` (nullish coalescing)?** Returns the left side if it is not `null` or `undefined`, otherwise the right side. `localStorage.getItem(key)` returns `null` when the key does not exist. `?? ''` provides the empty-string fallback. It is different from `||` which also treats `0`, `false`, and `''` as falsy.

**CS concept — side effects:** A pure function returns a value and has no other observable effect. A function with side effects changes something outside its own scope — writing to a file, updating the DOM, making a network request. `watch` is Vue's designated place for side effects triggered by reactive state. Putting side effects in `computed()` is a bug — computed functions run unpredictably (cached, may run multiple times).

**SE principle — single responsibility:** `watch` has one job: call a callback when a source changes. The callback has one job: save. These are separate pieces of logic. If saving logic becomes complex (batching, compression, encryption), it can be extracted into a function without changing the watch setup.

**What breaks without `clearTimeout`:** Type quickly. Multiple timeouts stack. The "Saved" message disappears and reappears as each timer fires. The debounce behavior breaks. `clearTimeout(saveTimer)` before `setTimeout(...)` ensures only the most recent keystroke's timer is running.

---

### Step 2 — Template

**File:** `src/App.vue` — replace the `<template>` and `<style>` sections with:

```html
<template>
  <div class="editor">
    <div class="header">
      <span class="title">Notes</span>
      <span v-if="savedAt" class="saved">Saved at {{ savedAt }}</span>
    </div>
    <textarea v-model="content" placeholder="Start typing..." />
    <div class="footer">
      {{ content.length }} characters
    </div>
  </div>
</template>

<style scoped>
.editor {
  font-family: system-ui, sans-serif;
  max-width: 560px;
  margin: 40px auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.title { font-weight: 600; font-size: 14px; }
.saved { font-size: 12px; color: #41b883; font-weight: 500; }
textarea {
  width: 100%;
  height: 240px;
  padding: 16px;
  border: none;
  resize: none;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  outline: none;
  box-sizing: border-box;
}
.footer {
  padding: 8px 16px;
  font-size: 12px;
  color: #94a3b8;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  text-align: right;
}
</style>
```

**Walkthrough:**
- `v-model="content"` on `<textarea>` — same two-way binding as `<input>` from Lesson 07
- `v-if="savedAt"` — `savedAt` is `null` by default; when the watcher sets it to a time string it becomes truthy; `setTimeout` sets it back to `null` after 2 seconds
- `{{ content.length }}` — computed inline; Vue unwraps the ref and calls `.length` on the string; re-renders on every keystroke

---

## `watch` vs `computed` — the complete picture

| | `computed` | `watch` |
|--|-----------|---------|
| **Use when** | Deriving a value from state | Running a side effect when state changes |
| **Returns** | A reactive value you read | Nothing (runs a callback) |
| **Cached** | Yes — only reruns when deps change | No — runs every time source changes |
| **Async** | No | Yes — callback can be `async` |
| **Touches outside world** | No — pure | Yes — file I/O, fetch, DOM, timers |

If you write `return something` → `computed`. If you write `doSomething()` with no return → `watch`.

---

## Watch options reference

```typescript
// Immediate: run callback once on setup, then on every change
watch(content, save, { immediate: true })

// Deep: watch nested properties inside an object
const settings = ref({ theme: 'dark', fontSize: 14 })
watch(settings, (newSettings) => save(newSettings), { deep: true })

// Watching multiple sources at once
watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log(`${newFirst} ${newLast}`)
})
```

## `watchEffect` — simpler alternative

```typescript
watchEffect(() => {
  // Vue tracks every reactive read inside this function automatically
  localStorage.setItem(STORAGE_KEY, content.value)
})
```

No explicit source list. Runs immediately, then re-runs when any reactive value read inside changes. Use `watchEffect` for simple fire-and-forget effects. Use `watch` when you need the old value, need `immediate`/`deep` control, or need to watch specific sources without tracking everything inside the callback.

---

## Connects forward

Lesson 10 introduces slots — passing markup into a component from its parent. `watch` and `onMounted` are the building blocks for composables in Lesson 12, where you will extract this save-to-localStorage pattern into a reusable `useLocalStorage` function.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] Typing updates the character count in real time
- [ ] "Saved at HH:MM:SS" appears after each keystroke and disappears after 2 seconds
- [ ] Refreshing the page restores the last saved content
- [ ] You can explain the difference between `watch` and `computed`
- [ ] Add `{ immediate: true }` to the watch options and observe: the watcher fires on mount (logs or saves the initial value immediately)
