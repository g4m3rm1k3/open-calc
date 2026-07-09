# Display Something

## What you will build

A page that shows a message sourced from reactive JavaScript state — not hardcoded HTML.

```
Browser: Hello from Vue!
```

After this lesson: change the string in JavaScript, click Run — the browser updates automatically. No `document.getElementById`. No `element.textContent = ...`. No synchronisation code of any kind.

---

## What you need to know first

This is lesson 1. No prior Vue knowledge required. The only prerequisites are JavaScript variables and a rough understanding that the browser turns HTML into a visual page. This lesson explains everything else from the ground up: what a `.vue` file is, what TypeScript adds, what `<script setup>` means, how `ref()` works, and how the application bootstraps.

---

## What a `.vue` file is

A `.vue` file is a **Single File Component** (SFC). It is not valid JavaScript or HTML on its own — it is a format Vue's compiler understands. The compiler reads the file, separates its three sections, processes them, and outputs a JavaScript module that the browser can run.

An SFC has three sections, each optional:

```html
<script setup lang="ts">
  // JavaScript (or TypeScript) logic for this component
</script>

<template>
  <!-- The HTML-like markup this component renders -->
</template>

<style scoped>
  /* CSS that applies only to this component's elements */
</style>
```

When you click **▶ Run** in Vue Studio, the studio compiles your `.vue` files, resolves module imports, and feeds the output to the browser. This is exactly what Vite (Vue's official build tool) does in production.

---

## What TypeScript adds

`lang="ts"` on the script tag tells the compiler to treat the code as TypeScript. TypeScript is JavaScript with a type system: a layer that checks your code for type-level errors before it runs.

```typescript
let count = 0
count = "hello"   // TypeScript error: Type 'string' is not assignable to type 'number'
```

Without TypeScript, `count = "hello"` is valid JavaScript — the error only surfaces at runtime when something tries to multiply `count` by a number and gets `NaN`. TypeScript surfaces it immediately, at the line where you wrote it.

**What TypeScript does NOT do:** it does not change how the code runs. TypeScript compiles to plain JavaScript. At runtime, the browser runs JavaScript — there are no type annotations left. TypeScript is entirely a write-time tool: it makes bugs visible before execution, not during.

**Type inference:** TypeScript does not always need you to write the type. It infers it:

```typescript
const name = 'Alice'           // inferred: string
const count = 0                // inferred: number
const message = ref('hello')   // inferred: Ref<string>
```

Inference means you write types only when TypeScript cannot figure them out on its own — which is less often than you think.

---

## What `<script setup>` is

`<script setup>` is a compiler shorthand for Vue's **Composition API**. Without it, you would write:

```typescript
export default {
  setup() {
    const message = ref('Hello')
    // must explicitly return everything the template uses:
    return { message }
  }
}
```

With `<script setup>`:

```typescript
// Just declare it — it's automatically available in the template
const message = ref('Hello')
```

The compiler generates the `setup()` function, the return statement, and the exports automatically. Everything you declare at the top level of `<script setup>` is automatically available in `<template>`. This is not magic — it is a well-specified compile step. But the result is significantly less boilerplate.

---

## Step 1 — The manual approach, and why it breaks under you

Before writing a single line of Vue, see what the problem looks like without it. Open `src/App.vue` and replace the template with a hardcoded string:

```html
<template>
  <h1>Hello from Vue!</h1>
</template>
```

Click **▶ Run**. The browser shows the heading. Now change the string to something else and click Run again — it updates. This technically works, as long as the content never needs to change based on data.

Now try sourcing the message from a JavaScript variable:

```html
<script setup lang="ts">
let message = 'Hello from Vue!'

setTimeout(() => {
  message = 'Updated after 1 second!'
}, 1000)
</script>

<template>
  <h1>{{ message }}</h1>
</template>
```

Click **▶ Run**. The heading shows "Hello from Vue!" — good. Wait one second. The heading does not change.

Open the Console tab in the RuntimePanel. Add `console.log(message)` inside the timeout callback. Run again. After one second: the console shows the new string. The variable changed. The browser's DOM has no idea.

**This is the core problem:** JavaScript variables and browser DOM text nodes are in two separate systems. Changing one does not automatically notify the other. Before reactive frameworks, every developer solved this manually — call `element.textContent = newValue` every time the underlying data changed. In a small app, that is manageable. In a real app with dozens of pieces of state and hundreds of DOM nodes, it becomes a maintenance nightmare where one missed update means the UI shows stale data.

**CS lens — the synchronisation problem, precisely.** JavaScript runs in a single-threaded environment with an event loop. Variables live in the JavaScript heap. DOM nodes live in the browser's rendering engine (often a separate process). These are different data stores. When you write `message = 'Updated'`, the JavaScript engine updates a slot in memory. There is no mechanism by which this assignment signals anything to the DOM renderer — they do not share memory. Frameworks solve this by inserting themselves between your code and the DOM: instead of assigning to a plain variable, you call a method on a reactive container, and the container notifies the framework, which updates the DOM.

**SE lens — a structural bug class, not a bug.** The hardcoded approach and the plain-variable approach share the same weakness: the displayed value and the source value are two different things that can diverge. Discipline does not fix structural problems. The fix is removing the possibility of divergence — making it so that the display *always* reflects the current value of the source, automatically. That is what `ref()` provides.

---

## Step 2 — `ref()`: a variable Vue can watch

Replace the entire `src/App.vue`:

```html
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello from Vue!')

setTimeout(() => {
  message.value = 'Updated after 1 second!'
}, 1000)
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

Click **▶ Run**. Wait one second. The heading updates automatically.

**Walkthrough, line by line:**

`import { ref } from 'vue'` — a named import from the `'vue'` module. `{ ref }` means: from this module, give me the export named `ref`. The curly braces are the named-import syntax. A module can export many named things; you pick exactly what you need. `'vue'` is the Vue library — Vue Studio pre-loads it.

`const message = ref('Hello from Vue!')` — creates a **reactive container** holding the string. `ref()` takes any value and wraps it in an object whose `.value` property is tracked by Vue. Writing `ref('Hello from Vue!')` creates an object like `{ value: 'Hello from Vue!' }` — but with invisible instrumentation: every read and write of `.value` is intercepted.

`message.value = 'Updated after 1 second!'` — writes through the container. The assignment triggers Vue's internal notification system, which schedules a re-render of every template that read from this ref.

`{{ message }}` — a template expression. Vue evaluates the expression and inserts the result as text. In templates, Vue **auto-unwraps** refs: `{{ message }}` is equivalent to `{{ message.value }}`. This auto-unwrapping only applies in templates — in `<script setup>`, you always need `.value`.

**What `ref()` actually is:** `ref(x)` creates a JavaScript `Proxy` — a wrapper object that intercepts property access. When code reads `message.value`, the Proxy getter records: "whoever is currently rendering depends on this ref." When code writes `message.value = newValue`, the Proxy setter fires and tells Vue's scheduler: "queue a re-render for everything that depends on me." The scheduler runs on the next microtask — after the current synchronous code finishes.

**Why `.value` in scripts but not in templates?** In `<script setup>`, you work directly with the ref object. The ref is the object; `.value` is the data inside it. In templates, Vue automatically calls `.value` for you — this is part of the template compiler's work. It reduces template noise: you write `{{ message }}` instead of `{{ message.value }}` everywhere. The trade-off: switching between `<script setup>` (`.value` required) and `<template>` (`.value` not needed) can be confusing at first. It becomes automatic with practice.

**CS concept — the observer pattern.** `ref()` implements the **observer pattern**: one object (the ref) notifies registered observers (templates, computed values, watchers) when its value changes. The ref is the **subject** or **publisher**. Each template that reads from it is a **subscriber**. Vue manages subscriptions automatically: when a component renders and reads a ref, Vue registers that component as a subscriber. When the ref changes, Vue notifies all subscribers. When a component unmounts, Vue removes its subscriptions. You never register or deregister manually.

**CS concept — reactivity as a directed graph.** When `{{ message }}` renders, Vue records a directed edge: "this template node depends on this ref node." When `message.value` is written, Vue traverses outward from that ref node and schedules re-renders for everything connected. As the application grows with more refs and more templates, this forms a dependency graph — Vue's reactivity system is a live, automatically-maintained DAG (directed acyclic graph).

**SE principle — declarative over imperative.** The template says *what* to show: "show the value of `message` here." It does not say *when* to update or *how* to reach into the DOM. The when and how are Vue's responsibility. Declarative code is shorter, harder to get wrong, and easier to reason about — there is no sequence of imperative update calls to order correctly, and no risk of forgetting one.

**What breaks if you use `let message = 'Hello'` without `ref`:** Vue cannot observe plain variables. There is no Proxy, no interception, no notification. The template renders the initial string value but never re-renders when `message` changes. No error, no warning — the UI silently shows stale data. This is the bug from Step 1.

**What breaks if you forget `import { ref } from 'vue'`:** `ref` is `undefined` at runtime. Calling `undefined('Hello')` throws: `TypeError: ref is not a function`. Vue Studio's TypeScript support will also flag this at write time: "Cannot find name 'ref'."

---

## Step 3 — The entry point: `main.ts`

Open `src/main.ts`. This file is complete; you do not need to change it. Understand it.

```typescript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

**Walkthrough:**

`import { createApp } from 'vue'` — loads `createApp`, the function that creates a Vue application instance. Named import, same syntax as `{ ref }`.

`import App from './App.vue'` — loads your root component. This is a **default import** — no curly braces. A module's default export is received under whatever name you choose; `App` is the conventional name for the root component. `'./App.vue'` means "relative to this file's location." The Vue compiler has already processed `App.vue` into a JavaScript module by the time this import runs.

`createApp(App)` — creates the Vue application instance. `App` is the root component — the starting point of the component tree. Every component in the application is ultimately a descendant of `App`.

`.mount('#app')` — finds `<div id="app">` in the HTML page and hands control of that element to Vue. Every re-render Vue performs replaces the contents of this div. The application is now running.

**CS concept — module system and the dependency graph.** Before JavaScript modules, every script file shared one global scope. A `function format()` in one file silently overwrote another file's `format()`. Modules solve this: each file has its own scope; only what is explicitly `export`ed can be `import`ed by others. Your `.vue` and `.ts` files form a **module dependency graph** — a directed acyclic graph where nodes are files and edges are `import` statements. Vue Studio traverses this graph starting from `main.ts` when you click ▶ Run.

**CS concept — entry point.** Every program has exactly one execution starting point. In C it is `main()`. In a browser JavaScript app it is the first `<script>` that runs. In a Vue application it is `main.ts`. Everything else — components, composables, utilities — is wired together through imports originating here.

**SE principle — separation of concerns.** `main.ts` has one job: bootstrap the application (create + mount). `App.vue` has one job: define the root component. They have different reasons to change: modifying the startup process (add plugins, configure global state) touches `main.ts`; modifying the root layout touches `App.vue`. Keeping them in separate files means either can change without touching the other.

**What breaks without `.mount('#app')`:** `createApp(App)` creates the Vue instance but never connects it to the HTML. The browser shows the raw `<div id="app">` — empty. No error — Vue waits for something to mount into that never comes. The application exists in memory but is invisible.

**What breaks if `#app` does not exist in the HTML:** `.mount('#app')` finds no element and warns: `[Vue warn]: Failed to mount app: mount target selector "#app" returned null.` The application does not render. Vue Studio's sandbox HTML already contains `<div id="app">` — you do not need to add it.

---

## Connect the pieces

```
src/main.ts
  createApp(App)     ← Vue runtime created; App.vue is the root
  .mount('#app')     ← connected to <div id="app"> in the sandbox HTML

src/App.vue
  ref('Hello…')      ← reactive container Vue watches
  {{ message }}      ← reads the container; re-renders when it changes
```

Data flows one way: JavaScript state → template rendering. This one-way flow is the foundation every other Vue concept builds on.

The full render path: `message.value` changes → Proxy setter fires → Vue scheduler queues re-render → on next microtask, Vue re-runs the template function → virtual DOM diff → Vue patches only the text node inside `<h1>`. The text node updates without touching any surrounding element.

**In the real world:** `createApp(RootComponent).mount(selector)` is not Vue Studio syntax — it is how every Vue application bootstraps, in development or production. Vite (Vue's official build tool) does what the ▶ Run button does here: compiles TypeScript, processes `.vue` files, resolves the module graph, and produces browser-ready JavaScript bundles. Vue Studio runs this on demand so you focus on Vue code, not tooling configuration.

---

## Definition of done

Click **▶ Run** and verify:

- [ ] The browser shows `Hello from Vue!`
- [ ] After one second it automatically changes to `Updated after 1 second!`
- [ ] Remove the `setTimeout` — change `ref('Hello from Vue!')` to any other string, click Run — the browser shows the new text
- [ ] You can explain why the plain `let message` version never updated
- [ ] You can explain what `ref()` does and why `.value` is required in `<script setup>` but not in `<template>`
- [ ] You can explain what `mount('#app')` connects Vue to and what happens without it
- [ ] You can explain the difference between a named import (`{ ref }`) and a default import (`App from './App.vue'`)
