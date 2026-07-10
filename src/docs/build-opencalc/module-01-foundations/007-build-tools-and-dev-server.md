# 007 — Build Tools and the Dev Server

*Bundling, compilation, hot reload, and the gap between source code and what browsers run*

---

## What You Will Build

You will install Vite, scaffold the project structure, write your first TypeScript file, and start the dev server. Opening `localhost:5173` in a browser will show a page served from Vite — the first time any code in this project runs through a build tool.

You will also understand what Vite does at each stage — in development (compile-on-demand), in production (bundle and minify) — and why both behaviours exist.

---

## What You Need to Know First

Lesson 005 — JavaScript Modules. Vite follows the module graph to find every file to compile and bundle.

Lesson 006 — Package Management. Vite is installed via npm. `package.json` and `package-lock.json` from that lesson are prerequisites.

---

## The Lesson

### Why build tools exist

In lesson 004, you wrote HTML and JavaScript that the browser ran directly. That approach has limits:

**TypeScript.** Browsers run JavaScript, not TypeScript. TypeScript's types exist only at compile time — they are erased before the browser sees the code. You need a tool that compiles TypeScript to JavaScript.

**JSX.** React's component syntax (`<div>`, `<Button />`) is not valid JavaScript. Browsers cannot parse it. You need a tool that transforms JSX into `React.createElement(...)` calls (lesson 010).

**Imports from node_modules.** Browsers cannot resolve bare specifiers like `import React from 'react'` on their own — they do not know where `node_modules` is. You need a tool that resolves those paths and bundles the code.

**Performance.** Shipping 200 separate JavaScript files (one per module) to a browser is slow — each file is a separate HTTP request. Bundling combines them into a smaller number of larger files.

**Dead code elimination.** If you import one function from a 10,000-line library, you want to ship only that function, not the whole library. Build tools analyse the module graph and eliminate code that is never used (called **tree shaking**).

Vite is the build tool used in this series. It is the same tool powering the existing open-calc project.

---

**CS lens — the role of a compiler:**

A **compiler** is a program that reads source code in one language and produces code in another. The TypeScript compiler (`tsc`) reads `.ts` files and produces `.js` files. Vite uses a faster alternative (`esbuild`) that compiles TypeScript and JSX to JavaScript without running the full TypeScript type checker.

In development, Vite compiles files **on demand** — it only compiles what the browser asks for. If you have 100 files but only open one page, Vite compiles only the files that page needs.

In production (`npm run build`), Vite compiles everything, bundles it into optimised chunks, and minifies the output (removes whitespace, shortens variable names, applies optimisations). The output is a folder of static files ready for deployment.

---

**SE lens — the dev/prod gap and why it matters:**

The dev server (localhost:5173) and the production build are different environments with different behaviours. The dev server is optimised for developer experience: instant feedback, readable code, detailed error messages. The production build is optimised for user experience: fast loading, small files, no source exposure.

This means something that works on the dev server may behave differently in production. The most common example: the dev server is permissive about import paths; the production build is strict. Code that imports `date-fns` in development works; code that relies on some quirk of the dev server's module resolution may fail when built.

This gap is why the non-functional requirement "any lab loads within 2 seconds on a 4G connection" must be measured using the production build, not the dev server.

---

### Install Vite and the project structure

Install Vite and the React plugin:

```bash
npm install --save-dev vite @vitejs/plugin-react
```

`vite` — the build tool. Installed as a dev dependency because it is only used during development and building, not at runtime.

`@vitejs/plugin-react` — a Vite plugin that adds support for React's JSX syntax and fast refresh (hot module replacement for React components). The `@vitejs/` prefix is a **scoped package** — packages prefixed with `@organisation-name/` are published under that organisation's namespace on npm. They are regular packages with an additional namespace for organisation.

`--save-dev` — both are development tools, not runtime dependencies. They go in `devDependencies`.

Add scripts to `package.json`:

```json
{
  "name": "my-platform",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":   "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node show-date.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  }
}
```

**`"dev": "vite"`** — starts the development server. `vite` with no arguments runs the dev server. When npm runs this script, it adds `node_modules/.bin` to PATH, so `vite` resolves to `node_modules/.bin/vite` — the Vite executable installed by npm.

**`"build": "vite build"`** — compiles and bundles the project for production. Writes output to the `dist/` folder.

**`"preview": "vite preview"`** — serves the contents of `dist/` over a local server. Used to verify the production build locally before deploying. Different from `dev` — this serves the compiled output, not the source.

---

### Create the Vite configuration

Create `vite.config.js` in the project root:

```javascript
// vite.config.js
//
// Configuration for the Vite build tool.
// This file is read by Vite at startup — both for the dev server and for builds.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Walkthrough:**

`import { defineConfig } from 'vite'` — imports the `defineConfig` helper from Vite. `defineConfig` does not do anything special at runtime — it is an identity function that returns its argument unchanged. Its value is that editors (VS Code with TypeScript intelligence) can provide autocompletion and type checking on the configuration object because `defineConfig` is typed.

`import react from '@vitejs/plugin-react'` — imports the React plugin as a default import. The plugin is a function that returns a Vite plugin object.

`export default defineConfig({ ... })` — exports the configuration as the default export. Vite reads this file and uses the exported object. `export default` exports one value without a name; the importer (Vite internally) gives it any name it wants.

`plugins: [react()]` — the `plugins` array is where you register Vite plugins. `react()` calls the plugin factory function, which returns the plugin object. The React plugin adds:
- JSX compilation (transforms `<Button />` into `React.createElement(Button, null)`)
- Fast refresh (when you save a React component file, only that component re-renders — the page does not reload)

---

**CS lens — plugins as a transformation pipeline:**

Vite's plugin system is a transformation pipeline. When Vite processes a file, it passes the file through each registered plugin in order. Each plugin can read the file, transform it, and pass the result to the next plugin.

The React plugin intercepts `.jsx` and `.tsx` files and transforms their JSX syntax into `React.createElement` calls. Without the plugin, Vite would encounter JSX and fail with a syntax error because JSX is not valid JavaScript.

This pipeline pattern is common in build tools. Webpack uses loaders. Babel uses transforms. They all implement the same idea: a file enters the pipeline as source, passes through a sequence of transformations, and exits as executable code.

---

### Create the entry point

Vite needs an HTML file as the entry point — the file the browser loads first, which references the JavaScript module that starts the application.

Create `index.html` (replace the one from lesson 004):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Two differences from lesson 004's `index.html`:

`<div id="root"></div>` — an empty container div. React will render the entire application into this div. React applications typically have one root element in the HTML; everything else is created by React as DOM nodes. The body is essentially empty HTML — the content is built by JavaScript.

`<script type="module" src="/src/main.jsx">` — the path starts with `/src/`, not `./`. The leading slash means "relative to the project root, as served by Vite." Vite intercepts requests to `/src/main.jsx`, compiles the file (including JSX), and responds with JavaScript the browser can run. This is the "compile on demand" behaviour — Vite does not pre-compile everything; it compiles each file when the browser first requests it.

---

Create the `src/` directory and `src/main.jsx`:

```bash
mkdir src
```

```jsx
// src/main.jsx
//
// Entry point of the React application.
// This file is what index.html loads.
// Its job: mount the React root into the #root div.

import { StrictMode }    from 'react'
import { createRoot }    from 'react-dom/client'
import App               from './App.jsx'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Root element #root not found. Check index.html.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**Walkthrough:**

`import { StrictMode } from 'react'` — imports the `StrictMode` component from the React library. `react` is a bare specifier — Node.js and Vite look in `node_modules/react`. React must be installed first (done in the next step). `StrictMode` is a wrapper component that activates additional runtime checks during development — it intentionally runs some code twice to catch side effects, and it logs warnings for deprecated APIs. It has no effect in production builds.

`import { createRoot } from 'react-dom/client'` — imports `createRoot` from the `react-dom/client` submodule. **React DOM** is the package that knows how to render React components to the browser's DOM. The library has two packages: `react` (the core, framework-agnostic) and `react-dom` (the browser-specific renderer). The `/client` path refers to the browser-side rendering API (as opposed to `/server`, used for server-side rendering).

`createRoot` is the React 18 API for creating a React root — the connection between a DOM element and a React component tree. Older React code uses `ReactDOM.render(...)`, which is deprecated in React 18.

`import App from './App.jsx'` — imports the `App` component from `App.jsx`. The default import gives us the component, which we named `App`. The file does not exist yet — you will create it next.

`document.getElementById('root')` — same DOM API from lesson 004. Finds the `<div id="root">` element in the HTML. Returns the element or `null`.

`createRoot(rootElement).render(...)` — `createRoot` takes a DOM element and returns a React root object. `.render(...)` takes a React element tree and renders it into the DOM element. React takes over the `<div id="root">` — from this point, React manages all the DOM changes inside it.

`<StrictMode><App /></StrictMode>` — JSX. The `<StrictMode>` and `<App />` tags are not HTML — they are JSX that will be compiled into `React.createElement` calls by Vite's React plugin. This lesson uses JSX before fully explaining it — the full explanation is in lesson 010. For now: `<Component />` renders a component, and component names must start with a capital letter to distinguish them from HTML elements.

---

Install React (not yet installed):

```bash
npm install react react-dom
```

`react` — the core React library (components, hooks, the rendering model).  
`react-dom` — the browser renderer (`createRoot`, `render`).

These go in `dependencies`, not `devDependencies` — they are needed at runtime in the browser.

---

Create `src/App.jsx`:

```jsx
// src/App.jsx
//
// The root component of the application.
// Everything visible on the page is rendered from here.

export default function App() {
  return (
    <div>
      <h1>my-platform</h1>
      <p>The build tool is working. React is rendering.</p>
      <p>
        Requirements: run <code>node requirements.js</code> to see the specification.
      </p>
    </div>
  )
}
```

`export default function App()` — declares a function named `App` and immediately exports it as the default export. This is shorthand for declaring the function and then writing `export default App`. React components are functions that return JSX.

`return ( ... )` — the parentheses allow the return value to span multiple lines without JavaScript treating the line ending as an implicit semicolon (which would make `return` return `undefined`). The parentheses group the expression without changing its value.

`<code>node requirements.js</code>` — the `<code>` HTML element renders its contents in a monospace font, indicating code. This is a semantic choice: using `<code>` communicates to both the browser (styling) and assistive technologies (context) that this content is code.

---

### Start the dev server

```bash
npm run dev
```

Expected output:

```
  VITE v5.x.x  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173/` in your browser. You should see:
- Heading: "my-platform"
- Two paragraphs

**What just happened:**

1. npm ran `vite` from `node_modules/.bin/vite`
2. Vite read `vite.config.js` and loaded the React plugin
3. Vite found `index.html` and began serving it
4. Your browser requested `http://localhost:5173/`
5. Vite responded with the HTML
6. Your browser parsed the HTML and found `<script type="module" src="/src/main.jsx">`
7. Your browser requested `/src/main.jsx`
8. Vite compiled `main.jsx` (TypeScript + JSX → JavaScript) and responded
9. Your browser executed the compiled JavaScript
10. `createRoot` mounted React into `<div id="root">`
11. React rendered `<App />`, producing DOM nodes
12. The browser painted those nodes to the screen

All of this happened in under a second. The total number of compiled files: 3 (`main.jsx`, `App.jsx`, and their compiled output from React packages).

---

**CS lens — hot module replacement:**

Make a change to `src/App.jsx` — change the heading text while the browser is open. Save the file. Without reloading the page, the heading updates. This is **hot module replacement (HMR)**.

HMR works by Vite watching your files for changes, recompiling the changed module, and sending the new module to the browser over a WebSocket connection. The browser receives the new module and applies it without reloading the entire page. State in other components is preserved.

This is possible because of the module graph: Vite knows exactly which modules are in use and what depends on what. When `App.jsx` changes, Vite recompiles only `App.jsx` and sends only the new `App.jsx` to the browser. The browser replaces the old module with the new one without affecting anything else.

---

**SE lens — the feedback loop:**

HMR is an engineering investment in feedback loop speed. The time between writing a change and seeing it in the browser goes from 10 seconds (save, switch to browser, reload, wait for full page load) to under 1 second (save, the browser updates automatically). Across hundreds of changes in a working session, this saving compounds.

The feedback loop is also why the dev server exists separately from a production build. Production builds are optimised for the user's experience — small, fast, minified. Dev servers are optimised for the developer's experience — instant, readable, debuggable. These are different goals that are best served by different environments.

---

### Add to .gitignore

The build output `dist/` should already be in `.gitignore` from lesson 003. Verify it:

```
# .gitignore
node_modules/
dist/
build/
.DS_Store
.env
.env.local
.env.production
```

`dist/` is where `vite build` writes its output. Every file in `dist/` is generated — committing it adds churn (it changes on every build) with no benefit (it can be regenerated from the source in seconds).

---

## Connect the Pieces

You now have a working development environment. The build tool chain is complete: TypeScript + JSX source → Vite compiles → browser runs the result.

**Connection to lesson 001:** The non-functional requirement "any lab loads within 2 seconds on a 4G connection" is tested against the production build (`npm run build` + `npm run preview`), not the dev server. From here on, every performance measurement uses the production build.

**Connection to lesson 005:** The module graph from lesson 005 is now handled by Vite. Where the browser followed imports itself (with `type="module"` in HTML), Vite now intercepts those requests, compiles the files, and responds with JavaScript. The concept is the same; the implementation is faster and handles TypeScript and JSX.

**Connection to lesson 008:** The `<App />` component rendered in `src/App.jsx` is the beginning of the React component tree. Lesson 008 will show the DOM manipulation problem that React solves — adding enough interaction to `App` that the imperative approach from lesson 004 becomes unmanageable.

---

## What Breaks Without This

**Without the React plugin in vite.config.js:**

```
Failed to parse source for import analysis because the content contains
invalid JS syntax. If you are using JSX, make sure to name the file
with the .jsx or .tsx extension, or add "plugins: [react()]" to your
Vite configuration.
```

Vite encounters JSX and cannot parse it because JSX is not valid JavaScript. The plugin adds the JSX-to-JavaScript transformation.

**Without `type="module"` on the script tag:**

```
SyntaxError: Cannot use import statement outside a module
```

The browser tries to execute `main.jsx` as a classic script, encounters `import`, and fails. The `type="module"` attribute is what tells the browser to treat the script as a module.

**Running `node src/main.jsx` directly:**

```
SyntaxError: Unexpected token '<'
```

Node.js tries to parse JSX and fails — `<App />` is not valid JavaScript. JSX only works after compilation by a tool like Vite or Babel. Node.js cannot run React components without a transformation step. This is the dev/prod environment distinction from lesson 002: `main.jsx` is browser code, not Node.js code.

---

## Definition of Done

- [ ] `npm install` completes without errors (react, react-dom, vite, @vitejs/plugin-react all in package.json)
- [ ] `vite.config.js` exists with the React plugin configured
- [ ] `src/main.jsx` exists and mounts React into `#root`
- [ ] `src/App.jsx` exists and returns JSX
- [ ] `npm run dev` starts without errors and prints a localhost URL
- [ ] Opening `localhost:5173` shows the app content in the browser
- [ ] Editing `src/App.jsx` and saving updates the browser without a page reload (HMR working)
- [ ] You can explain what Vite does differently in dev mode versus production build
- [ ] You can explain why the React plugin is needed
- [ ] Git commit:
  ```
  git add package.json package-lock.json vite.config.js src/
  git commit -m "Add Vite dev server and React scaffolding

  Vite compiles TypeScript and JSX on demand in development.
  React 18 mounts into #root via createRoot.
  First time any code in the project runs through a build tool.
  localhost:5173 shows the working application."
  ```
