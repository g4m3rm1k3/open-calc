# PyX — LAB 14 — Running the Output with Vite

**Prerequisites:** Lab 13 complete. `pyxc build examples/counter.pyx` produces a valid JSX file.

**What this lab adds:**
- A Vite project that loads the compiled `.jsx` file
- Understanding of how Vite handles JSX compilation and module resolution
- The import chain: `index.html` → `main.jsx` → `counter.jsx` → `pyx-runtime` (missing)
- An `h` function stub that lets the browser run until the full runtime is built

**Time:** 45–60 minutes.

---

## What You Will Build

A minimal Vite project alongside the compiler. Running `npm run dev` serves the counter component at `localhost:5173`. The runtime (`pyx-runtime`) does not exist yet — the browser will show a "Cannot find module 'pyx-runtime'" error. But the build chain works, and you will add an `h` stub to make the page render a static version.

```
pyx/
├── compiler/       ← the Python compiler (what you built so far)
├── runtime/        ← the TypeScript runtime (Labs 16-25)
└── app/            ← the Vite project (this lab)
    ├── index.html
    ├── src/
    │   ├── main.jsx        ← entry point
    │   └── counter.jsx     ← copied from compiler output
    └── package.json
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. Vite handles `.jsx` files automatically. What does it do to a JSX element like `<div className="app">` — what does it compile it to?
> 2. The counter JSX imports from `'pyx-runtime'`. Vite tries to find this package in `node_modules`. It is not there. What does Vite show in the browser?
> 3. The JSX pragma tells Vite which function to use instead of `React.createElement`. What pragma comment do you add to a JSX file to tell Vite to use `h` from `pyx-runtime`?
>
> *(Answers at the end of this lab)*

---

## Concept: The JSX Pragma

**What it is:** By default, Vite compiles JSX to `React.createElement(...)` calls. But PyX does not use React — it uses its own `h` function from `pyx-runtime`. The **JSX pragma** is a comment at the top of a JSX file that tells the compiler to use a different function.

**The automatic JSX transform (React 17+):**

Modern React uses a "new JSX transform" that does not require `import React` at the top of every file. Vite uses this by default. When it sees `<div>`, it emits `_jsx("div", ...)` using an auto-imported function.

**For PyX, we use the classic pragma:**

```jsx
/** @jsx h */
import { h } from 'pyx-runtime';
```

This comment tells the compiler: "instead of `React.createElement`, use the `h` variable." Vite respects this comment.

Alternatively, you can configure Vite globally (in `vite.config.js`) to use `h` as the JSX factory for all `.jsx` files in the project — which avoids needing the pragma in every file.

**Watch for:** The pragma comment must be `/** @jsx h */` (with the double asterisk that makes it a JSDoc comment) — not `// @jsx h`. Some tools do not recognise the single-slash version.

---

## Step 1 — Create the Vite Project

In your terminal, from the `pyx/` folder:

```
> cd app   (or mkdir app && cd app)
> npm create vite@latest . -- --template react
```

The `.` installs into the current directory. The `--template react` chooses the React + JavaScript template (not TypeScript — the compiler output is `.jsx`, not `.tsx`).

When the setup finishes:

```
> npm install
```

---

## Step 2 — Configure the JSX Factory

Open `vite.config.js` and update it:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'pyx-runtime'`,
  },
})
```

This tells Vite: for every `.jsx` file, use `h` as the element factory and automatically inject the import — no pragma comment needed in every file.

---

## Step 3 — Copy the Counter Component

Copy `examples/counter.jsx` (from your compiler output) into `app/src/counter.jsx`.

Create `app/src/main.jsx`:

```jsx
import { Counter } from './counter.jsx';

const root = document.getElementById('root');
// placeholder — the real render function comes in Lab 17
document.getElementById('root').innerHTML = '<p>Loading PyX runtime...</p>';
```

Update `app/index.html` to have a `#root` div:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PyX Counter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## Step 4 — Add an `h` Stub

The `pyx-runtime` package does not exist yet. Create a temporary stub at `app/src/pyx-runtime-stub.js`:

```js
// Temporary stub — replaced by the real runtime in Labs 16-25

export function h(type, props, ...children) {
  // Create a real DOM element
  if (typeof type === 'function') {
    return type(props || {});
  }
  const el = document.createElement(type);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === 'className') {
        el.className = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }
  return el;
}

export function useState(initial) {
  // Static stub — no re-rendering yet
  return [initial, () => {}];
}

export function useEffect(fn, deps) {
  fn();
}

export function render(element, container) {
  container.innerHTML = '';
  if (element instanceof Node) {
    container.appendChild(element);
  }
}
```

Update `vite.config.js` to use the stub:

```js
export default defineConfig({
  resolve: {
    alias: {
      'pyx-runtime': '/src/pyx-runtime-stub.js',
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'pyx-runtime'`,
  },
})
```

Update `app/src/main.jsx` to mount the component:

```jsx
import { Counter } from './counter.jsx';
import { render } from 'pyx-runtime';

render(Counter({}), document.getElementById('root'));
```

---

### SAVE AND TRY

```
> npm run dev
```

Open `http://localhost:5173`.

**You should see:** The counter component rendered — "Count: 0" and a "+" button. Clicking the button does nothing (the `useState` stub returns `[initial, () => {}]`, so the setter is a no-op). That is expected — the real `useState` comes in Lab 22.

**In the browser console:** No errors. Vite compiles the JSX without errors.

**Key moment:** Your Python code (`counter.pyx`) has been compiled to JSX and is running in a browser. The pipeline works.

---

## Challenge: Make the Counter Actually Count (Without the Runtime)

**You know:** The stub `useState` returns `[initial, () => {}]`. The setter does nothing, so clicking "+" has no effect. The real `useState` needs state storage and re-rendering — which is the entire runtime (Labs 16-25).

But you can make the counter work right now with a much simpler approach: global mutable state and a manual re-render.

**Task:** Update `pyx-runtime-stub.js` so that `useState` stores its value in a module-level object and the setter calls `rerender()` — a function that re-calls `Counter({})` and updates `#root`. This will not be how the real runtime works, but it will make the counter interactive for testing purposes.

---

<details>
<summary>▶ Show Solution</summary>

```js
const _state = {};
let _rerender = null;
let _stateIndex = 0;

export function useState(initial) {
  const index = _stateIndex++;
  if (!(index in _state)) {
    _state[index] = initial;
  }
  const value = _state[index];
  const setter = (newValue) => {
    _state[index] = newValue;
    if (_rerender) {
      _stateIndex = 0;  // reset for next render
      _rerender();
    }
  };
  return [value, setter];
}

export function render(componentFn, container) {
  _rerender = () => {
    const el = componentFn();
    container.innerHTML = '';
    if (el instanceof Node) container.appendChild(el);
  };
  _stateIndex = 0;
  _rerender();
}
```

Update `main.jsx`:
```jsx
import { Counter } from './counter.jsx';
import { render } from 'pyx-runtime';

render(() => Counter({}), document.getElementById('root'));
```

**Key insight:** This stub reinvents `useState` using a global index array — exactly how React's hooks work. The global `_state` array stores values by slot index. The setter writes to a slot and triggers a re-render. When the component re-renders, `_stateIndex` resets to 0 so the first `useState` call gets slot 0 again, the second gets slot 1, and so on. This is the exact mechanism you will implement properly in Lab 22 — the stub is a preview.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Vite project starts | `npm run dev` shows VITE ready at localhost:5173 |
| Counter renders | Browser shows "Count: 0" and a "+" button |
| No console errors | Browser dev tools show no red errors |
| JSX compiled by Vite | `counter.jsx` is served as plain JavaScript (check network tab) |

---

## Your Complete Files

### New files this lab (the Vite project)

**`runtime/index.html`** — the HTML entry point. Full content in Step 1.

**`runtime/vite.config.ts`** — Vite configuration with `jsxFactory: 'h'`. Full content in Step 2.

**`runtime/src/main.tsx`** — the app entry point that imports `counter.jsx` and calls `render`. Full content in Step 3.

**`runtime/package.json`** — Vite project dependencies. Full content in Step 1.

### Project structure at end of Lab 14

```
pyx/
├── .venv/
├── compiler/              ← unchanged
│   └── (all compiler files from Lab 13)
├── runtime/               ← new Vite project
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       └── main.tsx
├── examples/
│   ├── counter.pyx
│   ├── counter.jsx        ← place compiled output here
│   └── hello.pyx
└── pyproject.toml
```

---

## Quick Check Answers

**1. What does Vite do to `<div className="app">`?**

With the `jsxFactory: 'h'` configuration, Vite compiles `<div className="app">` to `h("div", { className: "app" })`. Without that configuration, it would compile to `React.createElement("div", { className: "app" })`. Vite's JSX compilation runs as part of the `esbuild` transform step before the browser ever sees the file.

**2. What does the browser show when `pyx-runtime` is not found?**

A runtime error in the browser console: `Failed to resolve module specifier "pyx-runtime". Relative references must start with either "/", "./", or "../".` or `Cannot find module 'pyx-runtime'`. The page fails to load entirely because the `import { useState } from 'pyx-runtime'` statement at the top of the compiled JSX cannot be resolved.

**3. What pragma comment tells Vite to use `h` instead of `React.createElement`?**

`/** @jsx h */` at the very top of the `.jsx` file (before any imports). However, the `vite.config.js` approach (`esbuild.jsxFactory: 'h'`) applies the pragma globally — every `.jsx` file in the project uses `h` as the factory without needing the comment. The config approach is better for a project where all components use the same factory.

---

*End of LAB 14.*

*Lab 15 adds source maps — when a runtime error occurs in the browser, the stack trace points to the `.pyx` source line, not the generated JSX line. Source maps are the mechanism that makes compiled languages debuggable.*
