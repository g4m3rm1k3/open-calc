# Render a Cell

## What you will build

A single spreadsheet cell displayed in the browser — a white box with a border containing the number `42`. No interaction. No reactive data. One visible thing on screen.

This is the foundation every future lesson builds on. The grid (lesson 2), editing (lesson 3), and formulas (lesson 4) all add to what you build here. The `Cell.vue` component you write today appears unchanged in lesson 12.

```
┌──────┐
│  42  │
└──────┘
```

---

## What you need to know first

This lesson assumes no prior knowledge of Vue, TypeScript, or web development. Every tool, command, and concept introduced here is explained at the moment it appears.

If you have completed the Vue Essentials series, you know `ref`, `<script setup>`, and templates. The new concept here is component extraction — pulling a piece of UI into its own file so it can be reused independently.

---

## The lesson

### The problem

Before there can be a grid, there must be a cell. Before there can be a cell, we need to understand how a Vue project is structured and how Vue turns code into something visible in a browser.

We will build from the outside in: first the tools, then the project structure, then the entry point, then the component. Every step produces something you can see.

---

### Step 1 — The tools

**npm — the Node Package Manager**

Vue is a package written by other people. `npm` is the command-line tool that downloads and manages packages for your project. When you run `npm install`, npm reads `package.json` (the project's dependency list), downloads all listed packages from the internet, and places them in a folder called `node_modules/`. Every package in `node_modules/` is code you can import.

**`package.json` — the project manifest**

`package.json` is a JSON file. Two fields matter now:

```json
{
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0"
  }
}
```

- `dependencies` — packages the browser needs to run the finished app. `vue` lives here because the browser loads it.
- `devDependencies` — packages used *while building* but not shipped to the browser. `vite` and `typescript` run on your machine during development.
- `"^3.4.0"` — semantic versioning. The caret (`^`) means "any version ≥3.4.0 and <4.0.0." Minor and patch updates install automatically; a major version change (which may break the API) does not.

**`node_modules/`** — where npm places downloaded packages. This folder is never committed to git — it can be fully reproduced by running `npm install`. On any machine, `npm install` is always the first command.

**`package-lock.json`** — records the exact version of every package installed, including the packages that *those* packages depend on. Committed to git so that `npm install` on every machine produces bit-for-bit identical output. Never hand-edited.

**TypeScript — typed JavaScript**

TypeScript is JavaScript with a type system added. You write `.ts` and `.vue` files; the TypeScript compiler checks that values match their declared types, then strips the types and produces plain JavaScript for the browser. The browser never sees TypeScript.

Why use it? When `Cell.vue` declares `value: number | string`, TypeScript prevents a parent component from accidentally passing `undefined` or an array. A bug caught while writing code costs seconds; the same bug caught in production costs hours.

**Vite — the build tool**

Vite does two distinct things:

1. **Development** (`npm run dev`): Vite starts a local web server. When your browser requests `/src/App.vue`, Vite compiles that file on demand and returns it as JavaScript. No waiting for a full build. Changes appear in the browser within milliseconds.

2. **Production** (`npm run build`): Vite bundles all files into a single optimised output — minified JavaScript, one CSS file — that a static web server can deliver.

**`localhost`** — the loopback address. A network name that routes back to the same machine. When Vite starts on `localhost:5173`, your computer is simultaneously the server (Vite) and the client (your browser). No traffic leaves your machine.

**A port** — a number that routes a network connection to a specific program. Port 5173 is where Vite listens. Port 443 is HTTPS traffic globally. Two programs cannot share a port — if something is already on 5173, Vite will try 5174.

**`vite.config.ts`** — Vite's configuration file:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
```

- `defineConfig` — a wrapper that gives TypeScript type checking for Vite config options.
- `plugins: [vue()]` — registers the Vue plugin, which teaches Vite how to compile `.vue` SFC files. Without this plugin, Vite does not know what to do with `import App from './App.vue'`.

**`tsconfig.json`** — the TypeScript compiler configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

- `"strict": true` — enables the strictest TypeScript checks. Specifically: `noImplicitAny` (every variable must have a known type), `strictNullChecks` (null and undefined are not valid unless declared). These two catch the most common category of bugs.
- `"target": "ESNext"` — compile to modern JavaScript. Vite handles browser compatibility.
- `"module": "ESNext"` — use ES module syntax (import/export). The current web standard.
- `"moduleResolution": "Bundler"` — resolve import paths the way Vite does, not the way Node.js does.

---

### Step 2 — The project structure

```
spreadsheet/
├── src/
│   ├── App.vue          ← the root component — Vue starts here
│   ├── main.ts          ← the entry point — the first file that runs
│   └── components/
│       └── Cell.vue     ← our first component — one spreadsheet cell
├── index.html           ← the HTML page the browser loads
├── package.json         ← project metadata and dependency list
├── package-lock.json    ← exact installed versions, committed to git
├── tsconfig.json        ← TypeScript compiler settings
└── vite.config.ts       ← Vite configuration
```

**`src/`** — all source code lives here. Vite compiles everything inside `src/` for the browser. Config files outside `src/` run on your machine, not in the browser.

**`src/components/`** — by convention, reusable UI components live here. The name communicates: "these are composable pieces of the interface, not pages."

**Why `Cell.vue` not `cell.vue`?** Vue components use PascalCase (every word capitalised). This distinguishes them from HTML elements in templates: `<Cell />` in a Vue template is a component. `<cell>` would be an unknown HTML element the browser ignores. PascalCase for components is universal across every Vue codebase.

**`index.html`** — the only HTML file:

```html
<!DOCTYPE html>
<html lang="en">
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`<div id="app">` is the mount point — Vue takes control of this element and everything inside it. `<script type="module">` tells the browser to load `main.ts` as an ES module. Vite intercepts this request, compiles the TypeScript, and returns JavaScript.

**What breaks without `index.html`:** The browser has nothing to load. No HTML, no script, no app. Vite serves `index.html` as the entry point for every route — without it, `localhost:5173` returns 404.

**What breaks without `<div id="app">`:** `main.ts` calls `.mount('#app')`, which searches for an element with `id="app"`. If it does not exist, Vue logs a warning and the app renders nowhere. The browser shows a blank page.

---

### Step 3 — The entry point

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

**The problem this file solves:** Something must start the Vue runtime and connect it to the HTML page. `main.ts` is that something. It has one job and only one job.

**Walkthrough:** When the browser loads `index.html`, it encounters `<script type="module" src="/src/main.ts">` and requests that file from Vite. Vite compiles `main.ts` to JavaScript and returns it. Three things happen in sequence:

1. `import { createApp } from 'vue'` — the JavaScript module system asks Vite for the `vue` package. Vite resolves this to `node_modules/vue/`. The named export `createApp` is extracted.
2. `import App from './App.vue'` — Vite compiles `App.vue` (an SFC) to a JavaScript component object. That object is now available as `App`.
3. `createApp(App).mount('#app')` — `createApp(App)` creates a Vue application using `App` as its root component. `.mount('#app')` connects it to `<div id="app">` in the DOM. Vue takes control of that div and renders `App` inside it. JavaScript's DOM APIs are now unnecessary — Vue manages all updates from here.

**CS concept — the entry point:** Every program has exactly one place where execution begins. In C it is `main()`. In Python it is the first top-level line. In a Vue app it is `main.ts`. Every other file is called from here, directly or indirectly.

**SE principle — separation of concerns:** `main.ts` bootstraps the app. It does not define components, manage state, or contain business logic. When we add Vue Router (lesson 11) or a plugin (lesson 12), we add them here — because "startup" is this file's single responsibility.

**What breaks without `.mount('#app')`:** `createApp(App)` creates the application object, but it is immediately discarded — nothing connects it to the page. No error is thrown. The page stays blank. This is one of the harder Vue bugs to diagnose because there is no error message, only a blank page.

**What breaks without `import App from './App.vue'`:** `createApp(undefined)` throws `TypeError: Component is missing`. The app never starts.

**Named imports vs default imports:**
- `import { createApp } from 'vue'` — named import. Vue exports dozens of functions; `{ createApp }` imports only this one. Named imports make dependencies explicit.
- `import App from './App.vue'` — default import. No curly braces. Imports whatever `App.vue` designates as its primary export. We can name it anything: `import RootComponent from './App.vue'` works identically.

---

### Step 4 — The Cell component: smallest runnable unit first

We build `Cell.vue` in three steps. Each step can be run in the browser before moving to the next.

**Step 4a — Template only: get something visible**

```vue
<!-- src/components/Cell.vue -->
<template>
  <div class="cell">
    42
  </div>
</template>
```

**The problem:** Is a template with a hardcoded number a valid Vue component? Yes. A component with only a `<template>` section is the minimum valid SFC.

**Walkthrough:** Vue renders this as `<div class="cell">42</div>`. The value `42` is hardcoded text, not reactive data — that comes in step 4b. The div exists on the page and can be inspected in DevTools.

**What is an SFC?** A Vue Single File Component (SFC) is a `.vue` file containing up to three sections: `<script>` (logic), `<template>` (structure), `<style>` (appearance). Vite's Vue plugin compiles each section separately — the template becomes a render function, the style becomes a CSS rule, the script becomes a JavaScript module. All three sections are optional. This component has only `<template>` and is complete.

**CS concept — encapsulation:** The cell's structure is defined in one file. If we later change the HTML structure of a cell, we change it in `Cell.vue` and only there. The rest of the app does not need to know what HTML a cell uses internally.

**SE principle — Single Responsibility (SRP):** `Cell.vue` has one job: render one cell value. It does not manage grid layout. It does not handle editing (yet). SRP says: one reason to change. If the cell's appearance needs to change, we edit `Cell.vue`. If the grid layout needs to change, we edit something else.

**What breaks without this file:** `App.vue` will import `Cell` in step 4c. If `Cell.vue` does not exist, Vite throws: `Failed to resolve import "./components/Cell.vue"`. The entire app fails to start.

Now wire it into `App.vue`:

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import Cell from './components/Cell.vue'
</script>

<template>
  <div class="spreadsheet">
    <Cell />
  </div>
</template>
```

**Walkthrough:** `import Cell from './components/Cell.vue'` loads the compiled component object. `<Cell />` in the template renders it — Vue knows it is a component (not an HTML element) because it starts with a capital letter. In the browser, `<Cell />` becomes the HTML that `Cell.vue`'s template produces.

**What is `<script setup lang="ts">`?**
- `<script>` — the component's logic section
- `setup` — the Composition API shorthand. Everything declared inside is automatically available in the template without a `return {}` statement
- `lang="ts"` — compile this block as TypeScript. Without `lang="ts"`, TypeScript syntax (type annotations, generic calls) causes a parse error

**Run it now:** `npm run dev` → open `localhost:5173` → see "42" in the browser. No styling yet, but visible.

**What `npm run dev` does:** `npm run dev` reads the `scripts.dev` field in `package.json` — in a Vite project this is `"vite"` — and executes that command. The terminal prints:

```
  VITE v5.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
```

Open the URL in your browser. The browser requests `index.html`. Vite intercepts, serves the file. The browser follows the `<script>` tag, requests `main.ts`. Vite compiles and returns it. The Vue app mounts. Stop the server with `Ctrl+C`.

---

**Step 4b — Add props: accept a value from the parent**

A hardcoded `42` is not useful. Props are Vue's mechanism for passing data from a parent component to a child.

```vue
<!-- src/components/Cell.vue -->
<script setup lang="ts">
defineProps<{
  value: number | string
}>()
</script>

<template>
  <div class="cell">
    {{ value }}
  </div>
</template>
```

**The problem this solves:** The parent (`App.vue`) knows which value to display in each cell. The child (`Cell.vue`) knows how to display a value. Props are the contract between them — the child declares what it needs, the parent provides it.

**Walkthrough:** `defineProps` is a Vue compiler macro — it looks like a function call but the Vite Vue plugin transforms it before the code runs. The generic syntax `<{ value: number | string }>()` passes a TypeScript type as a type parameter. Vue reads this type at build time to validate incoming props.

After `defineProps`, `value` is available in the template. `{{ value }}` reads the current `value` and renders it as text.

**What is TypeScript generic syntax?** A generic is a type placeholder filled in at the call site. `defineProps<T>()` means "the props have type `T`." We supply `T` by writing the type inline between `< >`:

```ts
defineProps<{
  value: number | string
}>()
// T = { value: number | string }
```

This is the same `< >` you see in `Array<string>` (an array of strings) or `Promise<number>` (a promise that resolves to a number). The angle brackets are TypeScript's syntax for "fill in this type parameter with this concrete type."

**The type `number | string`:** A TypeScript union type. `|` reads as "or." `number | string` means "this prop accepts a number OR a string, and nothing else." TypeScript rejects `:value="true"` (boolean) and `:value="[1,2,3]"` (array) at compile time. We use `number | string` because spreadsheet cells hold both numbers (for arithmetic) and text labels.

**`{{ value }}` — template interpolation and XSS safety:**

`{{ }}` reads the value of `value` and sets `textContent` of the host element — not `innerHTML`. This is the security-critical distinction.

**XSS — Cross-Site Scripting:** An attacker provides malicious HTML or JavaScript as a cell value — for example, `<img src=x onerror="alert(document.cookie)">`. If the template used `v-html="value"` (which sets `innerHTML`), the browser would parse and execute this HTML, running the attacker's JavaScript and leaking the user's session. `{{ value }}` uses `textContent`, which treats the value as literal text. The browser displays `<img src=x onerror="...">` as visible characters — never as markup. Always use `{{ }}` for user-provided content. Use `v-html` only for trusted, pre-sanitised HTML, and document the decision.

**What breaks without `defineProps`:** `value` is undefined. `{{ value }}` renders as empty text. Vue emits a console warning: "Property 'value' was accessed during render but is not defined." No crash — the cell just shows nothing.

Update `App.vue` to pass the prop:

```vue
<!-- src/App.vue <template> -->
<template>
  <div class="spreadsheet">
    <Cell :value="42" />
  </div>
</template>
```

**What is `:value="42"`?** The colon (`:`) before a prop name is shorthand for `v-bind:`. It tells Vue: "evaluate the right side as a JavaScript expression, not a string literal." `:value="42"` passes the *number* 42. Without the colon, `value="42"` passes the *string* "42". This distinction matters in lesson 4 when formulas must check whether a cell's value is numeric.

---

**Step 4c — Add styles: make it look like a cell**

```vue
<!-- src/components/Cell.vue — final -->
<script setup lang="ts">
defineProps<{
  value: number | string
}>()
</script>

<template>
  <div class="cell">
    {{ value }}
  </div>
</template>

<style scoped>
.cell {
  width: 80px;
  height: 32px;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 14px;
  font-family: system-ui, sans-serif;
  background: white;
  box-sizing: border-box;
}
</style>
```

**Walkthrough:** `<style scoped>` adds CSS that applies only to elements rendered by this component. Vite generates a unique data attribute (like `data-v-7f5a1b`) for every element in a scoped component and rewrites `.cell` to `.cell[data-v-7f5a1b]`. This means `.cell` in `Cell.vue` cannot accidentally match a `.cell` element in `Grid.vue` or `App.vue`.

**The CSS box model:** Every HTML element is a rectangular box with four layers — content → padding → border → margin. By default, `width: 80px` sets the *content* width only; padding and border are added on top, making the total element wider than 80px. `box-sizing: border-box` changes this: `width` and `height` include the padding and border. The total painted size is exactly 80×32px regardless of padding. Without `border-box`, cell widths would depend on their content size, and the grid in lesson 2 would have misaligned columns.

**Flexbox — `display: flex; align-items: center`:** Flexbox is a CSS layout model that arranges children along an axis. `display: flex` makes `.cell` a flex container; its children (the text node from `{{ value }}`) are laid out in a row. `align-items: center` vertically centres those children within the 32px height. Without it, text would sit at the top of the cell.

**What breaks without `scoped`:** If you remove `scoped`, `.cell` becomes a global rule. When lesson 2 adds `Row.vue` and `Grid.vue`, any element with class `cell` in those components — and anywhere else in the app — gets these styles applied. In a large application, unscoped CSS is one of the hardest bugs to trace: a style change in one component silently breaks the appearance of another.

**CS concept — scoped styles as encapsulation at the CSS layer:** Encapsulation means keeping implementation details private. `scoped` applies this to CSS: the visual implementation of `Cell` is private to `Cell.vue`. The same principle that makes `defineProps` the only way to pass data into a component makes `scoped` the only way the cell's CSS affects the outside world.

---

## Connect the pieces

The execution path: `index.html` loads `main.ts` → `main.ts` creates the Vue app and mounts it to `#app` → Vue renders `App.vue` → `App.vue` renders `<Cell :value="42" />` → `Cell.vue` renders `<div class="cell">42</div>` → Vite compiles every `.vue` file → the browser displays a white box with a border.

This path — entry point → root component → child component → template → DOM — is the same in every Vue application. Lesson 2 inserts `Grid` and `Row` between `App` and `Cell`. Lesson 3 adds reactive data in `App`. The path grows; the pattern does not change.

**In production:** This exact component tree is used in every Vue project created with `npm create vue@latest`. The SFC format, `defineProps`, scoped styles, and the `createApp().mount()` bootstrap are part of the Vue 3 standard. Code written this way will be immediately recognisable to any Vue developer.

---

## What breaks without this

**If you remove `scoped` from `<style scoped>`:** CSS for `.cell` becomes global. Any future component with a `.cell` element gets the 80px width and 1px border — whether you intended it or not. In a 10,000-line codebase, this causes misaligned UI in unexpected places with no clear error. The fix — adding `scoped` back — is instant; discovering the cause takes time.

**If you use `innerHTML` instead of `{{ }}`:** In lesson 3, cells accept user input. A user could type `<script>alert(document.cookie)</script>`. With `{{ }}` (textContent), the browser displays that as literal text. With `innerHTML`, the browser executes the script and sends the user's session cookie to the attacker. The choice made in lesson 1 determines the security posture of the entire spreadsheet.

---

## Definition of done

- [ ] `npm run dev` starts without errors and the terminal shows the localhost URL
- [ ] The browser at `localhost:5173` shows a white box with a border containing `42`
- [ ] Changing `:value="42"` to `:value="'Hello'"` shows "Hello" in the cell without restarting the server
- [ ] Open DevTools (F12) → Elements tab → click the cell element → the box model panel shows 80px width and 32px height
- [ ] No errors in the Console tab (F12 → Console)
- [ ] **Git commit:**

```
git add src/ index.html
git commit -m "Render a single Cell component — first visible slice of the spreadsheet"
```

**Version control — what git is and why it exists:**

Version control records a history of every change made to a project. You can return to any previous state. You can see exactly what changed between any two points. You can work on two different things in parallel (branches) and merge them later. For a self-taught developer working alone, git is not optional — it is how you recover from mistakes and how you understand your own history six months from now.

**The three states of a file in git:**
1. **Modified** — you changed the file; git knows it exists but has not been told to include this change
2. **Staged** — you ran `git add` to tell git: "include this file in the next snapshot"
3. **Committed** — git created a permanent snapshot of all staged files

**What `git add src/ index.html` does:** Stages all files inside `src/` and the `index.html` file. Only staged files are included in the commit.

**What `git commit -m "..."` does:** Creates a permanent snapshot of everything staged. The message explains *why* this snapshot exists. Git records *what* changed automatically (you can see it with `git diff HEAD~1`). The message records the *reason*: "first visible slice of the spreadsheet" tells a future reader — including your future self — what this commit meant in the context of the project, not just which files changed.

**`&&` in the shell:** The `&&` operator runs the second command only if the first succeeds. `git add src/ && git commit -m "..."` stages files, then commits them — and if staging fails (e.g., no files to stage), the commit does not run.
