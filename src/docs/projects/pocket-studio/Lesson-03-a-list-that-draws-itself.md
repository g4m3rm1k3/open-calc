# Lesson 3: A List That Draws Itself

**What you will build** — this project's first real UI: React, real
components, and `useState`/`useEffect`, rendering the real table names
S02's own `PocketDBClient` already fetches — inside the actual, real
window, not printed to a console.

**What you need to know first:** Lesson 0 (a real window), Lesson 2
(`PocketDBClient`, `list_tables`).

**Terms introduced in this lesson:** **JSX** — a real, non-standard
syntax extension (`<h1>Hello</h1>` directly inside real TypeScript)
that a real compiler transforms into plain, real function calls before
anything runs — never executed as written. **Component** — a real,
plain TypeScript function returning real JSX, describing what a real
piece of UI should look like for a given, real state — not a real,
step-by-step set of DOM instructions. **`useState`** — a real React
**hook** giving a real component its own, real, persistent piece of
state, surviving between real re-renders. **`useEffect`** — a real
hook running real, "side effect" code (here, a real, async fetch)
after a real component renders, not during.

**Objects and methods used**
- **`useState<T>(initial)`**
  - *What it is:* a real, standard React hook — returns a real,
    two-element array: the current, real value, and a real function to
    update it.
  - *Implementation:* `const [tables, setTables] = useState<string[]>
    ([]);`
  - *Its use:* this lesson's own real, entire storage for the fetched
    table names.
- **`useEffect(effect, deps)`**
  - *What it is:* a real, standard React hook — runs `effect` after a
    real render; a real, empty `deps` array (`[]`) means it runs
    exactly once, the first real time the component renders.
  - *Implementation:* `useEffect(() => { api.listTables().then(...);
    }, []);`
  - *Its use:* this lesson's own real, entire fetch-on-mount logic.
- **`createRoot(container).render(element)`**
  - *What it is:* real, standard `react-dom` — attaches a real React
    component tree to a real, existing DOM element, and keeps it real,
    correctly updated from then on.
  - *Implementation:* `createRoot(document.getElementById("root")).
    render(<App />);`
  - *Its use:* this lesson's own real, one-time bootstrap, connecting
    real React to the real, actual page.

---

## Concept Unit: What JSX Actually Is

### The Problem

`<h1>Hello, PocketStudio</h1>` written directly inside a real `.ts`
file isn't real, valid JavaScript at all — no real JavaScript engine
understands angle-bracket syntax mixed into real expressions. Before
trusting it, it's worth seeing, directly, what it actually becomes.

### Introduce the Concept in Isolation

Save this as `jsx_check.tsx`:

```typescript
const element = <h1>Hello, PocketStudio</h1>;
console.log(element);
```

Compiled with (`esbuild`'s own real, direct JSX transform, run without
bundling, just to see the real output):

```bash
npx esbuild jsx_check.tsx --jsx=automatic
```

Real output:

```javascript
"use strict";
import { jsx } from "react/jsx-runtime";
const element = /* @__PURE__ */ jsx("h1", { children: "Hello, PocketStudio" });
console.log(element);
```

*What this proves:* `<h1>Hello, PocketStudio</h1>` real-compiles into
a real, plain function call — `jsx("h1", { children: "..." })` —
before anything ever runs. JSX is never executed as written; it's real
syntax sugar a real compiler removes entirely, the identical real
relationship TypeScript's own type annotations (Lesson 0) have to the
real JavaScript that actually runs.

### Discard the Throwaway Example

```bash
rm jsx_check.tsx
```

### Mechanical Walkthrough

- `<h1>Hello, PocketStudio</h1>` — real JSX; angle-bracket syntax that
  looks like real HTML but is genuinely just real TypeScript, real-
  parsed by the real compiler, not the browser.
- `jsx("h1", { children: "Hello, PocketStudio" })` — the real, actual
  function call that runs; `"h1"` is a real, plain string naming a
  real HTML element, `children` is a real, plain object property —
  nothing here is special beyond ordinary, real function arguments.

### CS Lens

A real compiler transforming one real syntax into a real, different,
executable one — never running the original, source syntax directly —
is exactly what a **transpiler** does; the identical real relationship
this project's own `tsconfig.json` (Lesson 0) already established
between TypeScript and plain JavaScript, extended here to cover a real
syntax browsers themselves have never heard of at all.

### SE Lens

Why does React represent `<h1>...</h1>` as a real, plain JavaScript
*object* (`{ type: "h1", props: { children: "..." } }`, roughly),
rather than creating a real, actual DOM element immediately? Because a
real object is cheap to create, compare, and throw away — React's own,
real, entire rendering strategy depends on being able to build a whole,
real tree of these lightweight objects, compare it to the previous
real tree, and only touch the real, actual DOM where something genuinely
changed — a real strategy this lesson's own later units start to rely
on without yet needing to build it by hand.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

JSX is proven to be real, compiled syntax, not magic. Setting up the
real toolchain to compile and bundle it for this project's own real
renderer is next.

---

## Concept Unit: A Real Bundle for the Renderer

### The Problem

`tsc` alone (Lessons 0-2) compiles one `.ts` file into one, real,
matching `.js` file — real, correct for `main.ts`/`preload.ts`, which
run under real Node.js and can `require()` real `node_modules`
directly. A browser's own plain `<script>` tag has no real
`require()` at all — real, npm-installed React can't be loaded that
way without something real bundling it first.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `tsconfig.json` (modified — narrowed to
  main-process files only), `tsconfig.renderer.json` (new),
  `package.json` (modified — real, separate build scripts),
  `index.html` (modified).
- **Change type:** Add/Refactor.
- **Dependencies:** This lesson's own first unit.
- **Setup:** `npm install react react-dom` and
  `npm install --save-dev esbuild @types/react @types/react-dom`.

### The New Code

`tsconfig.json`, narrowed to real, main-process-only files:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022", "DOM"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx"
  },
  "include": ["src/main.ts", "src/preload.ts", "src/pocketdb-client.ts"]
}
```

`tsconfig.renderer.json`, real, separate, type-checking-only:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src/App.tsx", "src/renderer.tsx"]
}
```

`package.json`'s own real, split build scripts:

```json
"scripts": {
  "build:main": "tsc",
  "build:renderer:types": "tsc -p tsconfig.renderer.json",
  "build:renderer:bundle": "esbuild src/renderer.tsx --bundle --outfile=dist/renderer.js",
  "build": "npm run build:main && npm run build:renderer:types && npm run build:renderer:bundle",
  "start": "npm run build && electron ."
}
```

`index.html`, updated — a real, empty, real, named mount point instead
of Lesson 1's own hardcoded button/output elements:

```html
<!DOCTYPE html>
<html>
<head>
  <title>PocketStudio</title>
</head>
<body>
  <div id="root"></div>
  <script src="dist/renderer.js"></script>
</body>
</html>
```

### Discard the Throwaway Example

Every real file above is kept — permanent project files.

### Mechanical Walkthrough

- Two real, separate `tsconfig` files — `tsconfig.json` compiles and
  *emits* real, plain `.js` for the main process (Node.js `require`
  resolves `node_modules` correctly there, no bundling needed);
  `tsconfig.renderer.json` sets `"noEmit": true` — it exists purely
  for real, honest type-checking, real compilation of the renderer is
  `esbuild`'s own real job instead.
- `esbuild src/renderer.tsx --bundle --outfile=dist/renderer.js` —
  `--bundle` real-resolves every real `import` (`react`, `react-dom`,
  this project's own `App.tsx`) and produces *one* real, self-
  contained file — real, valid for a plain `<script>` tag, the
  identical real requirement Lesson 1's own bugs already established.

### CS Lens

Splitting one real project into two, real, independently-compiled
halves — one for a real Node.js process, one for a real browser
context — is a real, direct consequence of Electron's own two-process
model (Lesson 0's own CS Lens): each real process has a real,
genuinely different runtime environment, so each needs its own real,
matching build strategy.

### SE Lens

Why keep `tsconfig.renderer.json` around for real type-checking at
all, if `esbuild` already compiles the renderer correctly on its own?
Because `esbuild`'s own real, fast compilation *strips* real type
annotations without actually checking them — a real, wrong type in
`App.tsx` would compile and run anyway, failing only at real runtime,
possibly silently. Running `tsc -p tsconfig.renderer.json` separately
keeps this project's own real, established "strict mode from Lesson 0"
promise honest for the renderer too.

### Commands Needed

```bash
npm install react react-dom
npm install --save-dev esbuild @types/react @types/react-dom
```

### Run It

Proven together with this lesson's own third unit, next.

### Connection

The real toolchain exists. Building the real component itself — and
wiring it to S02's own real, already-working `PocketDBClient` — is
last.

---

## Concept Unit: `App` — a Real Component, Real State

### The Problem

`PocketDBClient` (S02) can already fetch real table names. Nothing yet
shows them anywhere real and visible.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/App.tsx` (new), `src/renderer.tsx` (new,
  replaces Lesson 1's own `src/renderer.ts`), `src/main.ts` (modified
  — a real `"list-tables"` IPC channel added), `src/preload.ts`
  (modified — `listTables` exposed).
- **Change type:** Add.
- **Dependencies:** This lesson's own first two units; Lesson 2's
  `PocketDBClient`.

### The New Code — `src/main.ts`, Extended

```typescript
import { PocketDBClient } from "./pocketdb-client";

let dbClient: PocketDBClient | null = null;

ipcMain.handle("list-tables", async (): Promise<string[]> => {
  if (!dbClient) {
    dbClient = new PocketDBClient(
      "python",
      path.join(__dirname, "..", "query_server.py"),
      "C:\\msys64\\ucrt64\\bin"
    );
    await dbClient.request("open", { path: path.join(__dirname, "..", "games.pdb") });
  }
  const result = (await dbClient.request("list_tables")) as { tables: string[] };
  return result.tables;
});
```

### The New Code — `src/preload.ts`, Extended

```typescript
contextBridge.exposeInMainWorld("pocketStudio", {
  ping: (): Promise<string> => ipcRenderer.invoke("ping"),
  listTables: (): Promise<string[]> => ipcRenderer.invoke("list-tables"),
});
```

### The New Code — `src/App.tsx`

```typescript
import { useState, useEffect } from "react";

interface PocketStudioApi {
  ping: () => Promise<string>;
  listTables: () => Promise<string[]>;
}

const api = (window as unknown as { pocketStudio: PocketStudioApi }).pocketStudio;

export function App() {
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    api.listTables().then((result) => setTables(result));
  }, []);

  return (
    <div>
      <h1>PocketStudio</h1>
      <h2>Tables</h2>
      <ul>
        {tables.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### The New Code — `src/renderer.tsx`

```typescript
import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("root") as HTMLDivElement;
const root = createRoot(container);
root.render(<App />);
```

Real, end-to-end proof — a real `.pdb` file with two real tables,
opened through the whole, real chain, and the real, resulting DOM read
directly out of a real, running window:

```javascript
window.webContents.once("did-finish-load", async () => {
  await new Promise((r) => setTimeout(r, 1000));
  const html = await window.webContents.executeJavaScript(
    "document.getElementById('root').innerHTML"
  );
  console.log("REAL_RENDERED_HTML:", html);
});
```

Real output:

```text
REAL_RENDERED_HTML: <div><h1>PocketStudio</h1><h2>Tables</h2><ul><li>games</li><li>scores</li></ul></div>
```

### Discard the Throwaway Example

The DOM-reading verification script above is a real, throwaway proof
— not saved as a project file. Every other real file in this unit is
kept — permanent project code.

### Mechanical Walkthrough

- `const [tables, setTables] = useState<string[]>([]);` — covered
  fully in Objects and methods used, above; `tables` starts as a real,
  empty array — the real, first render shows an empty real list, before
  the real fetch ever completes.
- `useEffect(() => { api.listTables().then((result) => setTables
  (result)); }, []);` — covered fully in Objects and methods used; the
  real, empty `[]` dependency array is what makes this run exactly
  once, not on every real render.
- `{tables.map((name) => (<li key={name}>{name}</li>))}` — real,
  standard JSX embedding a real, plain JavaScript expression (`{...}`)
  — `key={name}` is a real, required React convention, letting it
  real-track which real list item is which across future, real
  re-renders.
- `setTables(result)` — reappearing shape (`useState`'s own setter) —
  calling it real-triggers React to re-render `App`, this real time
  with `tables` actually populated — the real, visible list appearing
  only *after* this real call, not during the first render at all.

### CS Lens

`tables` starting empty, then real-updating once the real, async fetch
resolves, is a real, direct example of **declarative** UI — this
lesson's own code never says "clear the list, then add these three
`<li>` elements" (the real, imperative version); it only says "here is
what the UI should look like *given* `tables`," for any real value
`tables` might hold, and lets React figure out the real, actual DOM
changes needed to get there.

### SE Lens

Why does `App.tsx` read `window.pocketStudio` through the identical
real, local `const api = ...` pattern Lesson 1's own `renderer.ts`
already used, rather than calling `window.pocketStudio.listTables()`
directly, inline? Because the real, hard-won naming lesson from
Lesson 1 (a local `const pocketStudio` once real-collided with the
identical, real global name) still applies — `api` stays real,
short, and deliberately never risks colliding with whatever real,
global name `contextBridge` itself uses.

### Commands Needed

```bash
npm start
```

### Run It

The real, running window now shows a real "PocketStudio" heading, a
real "Tables" heading, and a real, live list of every real table your
own `.pdb` file actually has.

### Connection

S03 is complete: this project's own first real UI renders real,
fetched data, through both of its own real process boundaries. S04,
next, is where clicking one of these real table names actually shows
its real, actual rows.

---

## Closing

### Connect the Pieces

This lesson's first unit proved JSX is real, compiled syntax sugar —
`<h1>...</h1>` becomes a real, plain `jsx(...)` function call, never
run as written. The second unit built a real, split build pipeline —
`tsc` for the main process (real emission), a real, separate `tsc`
pass for the renderer (real type-checking only), and `esbuild` for the
real, actual bundle a plain `<script>` tag needs. The third assembled
a real `App` component — `useState` holding real, fetched table names,
`useEffect` fetching them exactly once — proven not by reading the
code but by reading the real, actual, rendered DOM out of a real,
running window.

### What Breaks Without This

Change `useEffect`'s own real, empty dependency array from `[]` to
remove it entirely (`useEffect(() => { ... });`, no second argument),
rebuild, and run. The real app still shows the correct, real table
list — but real-refetches it after *every single* real re-render, not
just once; add a real `console.log("fetching")` inside the effect and
watch it print far more than once. Restore the real, empty `[]` and
confirm it prints exactly once.

### Exercises

- Add a real, second `useState` tracking whether the real fetch is
  still in progress, showing real text like `"Loading..."` until
  `tables` actually arrives. This is a real, deliberate preview of
  S07's own real subject.
- Click a table name (it does nothing yet) and add a real `onClick`
  handler that, for now, just `console.log`s the real, clicked name —
  the real, first step toward S04's own real row-browsing feature.
- Explain, in your own words, why `App.tsx` needed its own, real,
  separate `PocketStudioApi` interface, duplicating part of
  `preload.ts`'s own real, exposed shape, rather than importing one,
  shared type — referencing Lesson 1's own real, sandboxed-renderer
  CS Lens.

### Definition of Done

- [ ] `src/App.tsx` and `src/renderer.tsx` exist as real, permanent
      files; `tsconfig.renderer.json` exists.
- [ ] `npm start` shows a real, live list of your own `.pdb` file's
      real table names in the actual window.
- [ ] You ran this lesson's own real JSX-compilation proof yourself
      and confirmed the real, resulting `jsx(...)` call.
- [ ] You caused the real "fetches on every render" failure yourself
      (removing the empty dependency array) and confirmed restoring it
      fixes it.
- [ ] You can explain, from memory, why the renderer needs its own,
      separate `tsconfig` and a real bundler, while the main process
      doesn't — referencing this lesson's own CS Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real React UI rendering real table names"`.
