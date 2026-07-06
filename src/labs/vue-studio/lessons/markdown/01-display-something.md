# Display Something

## What you will build

A page that shows a message sourced from reactive JavaScript state — not hardcoded HTML.

```
Browser: Hello from Vue!
```

After this lesson: change the string in JavaScript, click Run, the browser updates. No `document.getElementById`. No manual DOM manipulation.

---

## What you need to know first

This is lesson 1. No prior Vue knowledge is needed. The only prerequisites are JavaScript variables and a rough understanding that the browser turns HTML into a visual page.

---

## The lesson

### Step 1 — The entry point

**The problem:** The browser needs a JavaScript file to execute first. That file creates the Vue application and connects it to the HTML page.

**File:** `src/main.ts` (already open in the editor — this file is complete, you do not need to change it)

```typescript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

**Walkthrough, line by line:**
- `import { createApp } from 'vue'` — loads the `createApp` function from the Vue package
- `import App from './App.vue'` — loads your root component
- `createApp(App)` — creates the Vue application; `App` is the root component every other component lives inside
- `.mount('#app')` — finds `<div id="app">` in the HTML page and hands control to Vue

**What is `import`?** A JavaScript module statement. `import { createApp } from 'vue'` means: find the npm package called `vue` and give me the named export called `createApp`. Curly braces = named import. Without curly braces = default import (like `import App from './App.vue'`).

**CS concept — entry point:** Every program has exactly one place execution begins. In C it is `main()`. In a Vue app it is `main.ts`. Everything else is wired together from here.

**SE principle — separation of concerns:** `main.ts` has one job: bootstrap the application. `App.vue` has one job: define the root component's UI. Different reasons to change → different files.

**What breaks without `.mount('#app')`:** The application is created but never connected to the HTML. The page stays blank. No error — Vue just waits for something to mount into.

---

### Step 2 — The root component

**The problem:** We need a file that describes what the browser should display. A Vue component combines state (JavaScript data), template (HTML description), and style (CSS) in one place.

**File:** `src/App.vue` — replace the entire file contents with:

```html
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello from Vue!')
</script>

<template>
  <h1>{{ message }}</h1>
</template>

<style scoped>
h1 {
  color: #41b883;
  font-family: system-ui, sans-serif;
}
</style>
```

**Walkthrough:**
- `<script setup lang="ts">` — the script block for this component; `lang="ts"` means TypeScript; `setup` means Composition API
- `import { ref } from 'vue'` — loads the `ref` function from Vue
- `const message = ref('Hello from Vue!')` — creates a reactive container holding the string
- `<template>` — the HTML structure this component renders
- `{{ message }}` — a mustache expression: Vue evaluates this and inserts its string value as text
- `<style scoped>` — CSS that only applies to elements in this component's template

**What is `ref()`?** `ref()` creates a **reactive container** around a value. Vue watches this container. When the value inside changes, Vue automatically updates every template that reads from it. To read or write the value in JavaScript, use `.value`: `message.value = 'New text'`. In the template, Vue unwraps it automatically — write `{{ message }}`, not `{{ message.value }}`.

**What is `{{ message }}`?** Double curly braces are Vue's **interpolation** syntax. They evaluate a JavaScript expression and render the result as text. They work anywhere inside a `<template>`. They escape HTML characters (so user-supplied content cannot inject HTML tags — this is safe by default).

**CS concept — reactive programming:** A reactive system tracks dependencies automatically. When the template reads `message`, Vue records "this template depends on `message`." When `message.value` changes, Vue re-renders only the parts that depend on it. The CS term for a value that notifies observers when it changes is an **observable**. Vue's reactivity is built on JavaScript Proxies.

**SE principle — declarative rendering:** You describe the desired output in terms of data (`{{ message }}`), not the steps to produce it. The alternative — imperative rendering — requires manually calling `element.textContent = value` every time data changes. Declarative rendering is more reliable because Vue handles the synchronisation.

**What breaks without `ref()`:** Change `const message = ref('Hello from Vue!')` to `const message = 'Hello from Vue!'`. The page still shows the message — but if anything later changes `message`, the template does not update. Without `ref()`, Vue cannot track the value, so it cannot re-render when it changes.

---

## Connect the pieces

```
src/main.ts
  createApp(App)       ← Vue runtime created, App.vue is the root
  .mount('#app')       ← connected to <div id="app"> in the HTML

src/App.vue
  ref('Hello…')        ← reactive container Vue watches
  {{ message }}        ← reads the container; re-renders when it changes
```

Data flows one way: JavaScript state → template rendering. This one-way flow is the foundation every other Vue concept builds on.

**In production:** Every Vue app created with `npm create vue@latest` has exactly these two files to start. `createApp` and `mount` appear in every Vue app in the world.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] The browser shows `Hello from Vue!`
- [ ] Change `'Hello from Vue!'` to any other string, click Run — the browser shows the new text
- [ ] You can explain what `ref()` does and why `{{ }}` shows its value without `.value`
- [ ] You can explain why `main.ts` and `App.vue` are separate files
