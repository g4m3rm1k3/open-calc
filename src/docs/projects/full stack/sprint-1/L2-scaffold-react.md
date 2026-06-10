# Sprint 1 · Lesson 2 — Scaffold a React app, read every file

## What you will build

By the end of this lesson, a React application is running in your browser at `localhost:5173`. You will have read and understood every file the scaffold generated — nothing will be left as "boilerplate you don't need to understand." You will know what Vite is doing, what TypeScript is, what JSX compiles to, and what every field in `package.json` controls. The app will update in the browser the moment you save a change.

---

## What you need to know first

- You completed Lesson 1: Node.js and npm are installed and on PATH, git is initialised in `fullstack-project`.
- You have the `fullstack-project` directory from Lesson 1. All commands in this lesson run inside it.

**Concepts carried forward from Lesson 1:** PATH, environment variables, working directory, npm as a package manager, `node_modules`, the terminal as a process launcher.

---

## The lesson

---

### 1. Create the React application

**The problem:** You need a React application. React is a JavaScript library — it cannot scaffold a project on its own. You need a tool that creates the folder structure, installs React as a dependency, configures TypeScript, and starts a development server. That tool is **Vite**.

Inside your `fullstack-project` directory, run:

```
npm create vite@latest frontend -- --template react-ts
```

When prompted for a project name, press Enter to accept `frontend`.

Expected output:
```
Scaffolding project in /Users/yourname/fullstack-project/frontend...

Done. Now run:

  cd frontend
  npm install
  npm run dev
```

Follow those instructions:

```
cd frontend
npm install
npm run dev
```

Expected output of `npm run dev`:
```
  VITE v5.2.0  ready in 312 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Open your browser and go to `http://localhost:5173`. You will see the Vite + React starter page.

**Walkthrough of `npm create vite@latest frontend -- --template react-ts`:**

`npm` — the Node Package Manager, installed alongside Node.js in Lesson 1.

`create` — a subcommand of npm. It downloads a package whose name starts with `create-` and runs it as a program. `create vite@latest` downloads the package `create-vite` at its latest published version and runs it immediately, without permanently installing it on your machine.

`@latest` — a version specifier. npm's package registry assigns a `latest` tag to the most recent stable release of every package. `@latest` means "use whatever version is tagged latest right now." This ensures you scaffold with the most recent version of Vite.

`frontend` — the name of the directory to create. The scaffold will be placed inside `fullstack-project/frontend/`.

`--` — a double dash is a Unix convention meaning "end of flags for this program." Everything after `--` is passed as arguments to the program being run (in this case, `create-vite`), not to `npm` itself. Without it, npm would try to interpret `--template` as its own flag.

`--template react-ts` — tells `create-vite` which template to use. `react-ts` means: React framework, TypeScript language. Without this flag, the scaffolder would ask you interactively.

**Walkthrough of `npm install`:**

`npm install` with no package name means: read `package.json` in the current directory, find all listed dependencies, download them from the npm registry, and place them in `node_modules/`. This is why `node_modules` does not exist in the scaffolded project until you run `npm install` — the scaffold only writes `package.json` (the manifest), not the actual packages (the implementations).

The download might take 30–60 seconds on the first run. Subsequent runs are faster because npm caches packages on your machine. After it completes, `node_modules/` appears.

**Walkthrough of `npm run dev`:**

`run` is another npm subcommand. It reads the `scripts` field in `package.json` and runs the script named `dev`. You will see what that script contains when you read `package.json` below.

**CS lens — package management as dependency resolution.** npm performs **dependency resolution**: given a list of packages you want and the packages those packages depend on, find a set of versions that satisfies every constraint simultaneously. This is computationally equivalent to the Boolean satisfiability problem (NP-complete in the general case), but npm uses heuristics that work well in practice. The result is written to `package-lock.json` — a file that records the exact version of every package installed, so that anyone who runs `npm install` on any machine gets identical output.

**SE lens — scaffolding as a convention enforcer.** Vite's scaffold makes a decision you did not make: the file structure, the TypeScript configuration, the ESLint setup. This is deliberate. A team of dozens of projects that all use the same scaffold can navigate any project's codebase because the structure is identical. The cost is that the scaffold makes some opinionated choices. The benefit is that you do not spend days on setup decisions that do not differentiate your project. You will read and understand every decision the scaffold made — which is exactly what this lesson does.

**What breaks without this:** If `npm install` fails with `ERESOLVE unable to resolve dependency tree`, there is a version conflict between packages. This is rare with a fresh scaffold but possible. Fix: add `--legacy-peer-deps` to the install command. If `npm run dev` fails with `sh: vite: command not found`, the install did not complete. Run `npm install` again.

---

### 2. Understand what Vite does

**The problem:** Something is serving your React app at `localhost:5173`. You typed `npm run dev` and a browser tab appeared with running code. You need to understand what is happening between that command and the pixels on screen — otherwise every error Vite produces will be mysterious.

Vite does two entirely different things depending on context:

**In development** (what you are doing now): Vite runs a local web server. When your browser requests a file — for example, `GET /src/App.tsx` — Vite compiles that TypeScript file to JavaScript on demand and returns the compiled result. The browser never sees TypeScript; it only ever receives JavaScript. Vite also injects a small script into every page that connects to a WebSocket. When you save a file, Vite detects the change, recompiles only the changed file and its dependents, and sends the updated module to the browser over that WebSocket. The browser replaces just the changed module without reloading the page. This is called **hot module replacement** (HMR).

**In production** (Sprint 8): Vite bundles all your files into a small set of optimised output files. It runs dead-code elimination (removes exports that nothing imports), minification (shortens variable names to save bytes), and tree-shaking (removes entire modules that are never used). The output is a `dist/` folder containing static files that can be served by any web server.

**CS lens — on-demand compilation.** In traditional compiled languages, you compile your entire program before running it. Vite applies a different model: compile only what is requested, at the moment it is requested. This works because browsers load files via HTTP — each `import` statement in your TypeScript becomes an HTTP request to Vite's server. Vite intercepts the request, compiles that specific file, and returns it. This is the same model as a JIT (just-in-time) compiler, applied to a development server instead of a runtime.

**SE lens — dev vs prod as two modes of the same tool.** The dev server and the production bundler are both Vite, but they make opposite tradeoffs. The dev server prioritises speed of iteration: it compiles only what is needed, preserves file names for readability, and includes source maps so errors point to your TypeScript source. The production bundler prioritises size and performance: it combines files, shortens names, and removes everything unused. Understanding that these are two modes of the same tool — not two separate tools — explains why `npm run dev` and `npm run build` behave so differently.

**Real-world connection:** Vite is used in production toolchains at companies including Shopify, Bloomberg, and the Vue.js and Svelte core teams. Before Vite, Webpack was the dominant bundler — it is slower because it bundles everything upfront even in development. Vite's design exploits native ES module support in modern browsers (the ability to `import` modules via HTTP without a bundler) to make the dev server fast.

**What breaks without this:** If you save a file and the browser does not update, HMR has disconnected. Reload the page manually (`Cmd+R` / `F5`). If reloading does not fix it, check the terminal where `npm run dev` is running for a compile error — Vite prints errors in the terminal when HMR fails to update.

---

### 3. What `localhost` and ports are

**The problem:** Vite told you the app is at `http://localhost:5173`. You navigated there in a browser and it worked. You need to understand what `localhost` and `5173` mean — because you are about to run a second server (FastAPI) on a different port, and understanding ports is the prerequisite to understanding why they must be different numbers.

`localhost` is the **loopback address**. It is a special hostname that always resolves to the machine you are currently using. Your computer is both the client (the browser making requests) and the server (Vite receiving them). No traffic leaves your machine. The full IP address of the loopback interface is `127.0.0.1`. When a browser navigates to `http://localhost:5173`, it resolves `localhost` to `127.0.0.1` and opens a TCP connection to port `5173` on that address.

A **port** is a 16-bit number (0–65535) that the operating system uses to route an incoming network connection to the correct program. Multiple programs can listen for connections on the same IP address simultaneously, as long as they use different port numbers. When Vite starts, it calls a system function that says "I want to receive TCP connections on port 5173." The OS records this. When a browser opens a connection to `127.0.0.1:5173`, the OS delivers the connection to Vite.

Common ports you will encounter in this curriculum:
- `5173` — Vite's React dev server
- `8000` — FastAPI / uvicorn (Lesson 3)
- `5432` — PostgreSQL (Sprint 3)
- `80` — HTTP (production web traffic)
- `443` — HTTPS (production encrypted web traffic)

**CS lens — multiplexing over a single address.** The problem ports solve is: how do you run multiple network services on a single computer? A computer has one IP address (or a few), but it needs to run a web server, a database, an SSH server, and your application simultaneously. Ports are the solution — they are a 16-bit namespace that the OS uses to demultiplex incoming connections. A connection to `127.0.0.1:5173` goes to Vite; a connection to `127.0.0.1:8000` goes to FastAPI; a connection to `127.0.0.1:5432` goes to PostgreSQL. Same address, different programs, different ports.

**SE lens — ports as a configuration decision.** Port numbers below 1024 are "well-known" ports reserved by convention (HTTP is 80, HTTPS is 443, SSH is 22). Ports above 1024 are available for applications to use. The specific port a dev server uses is arbitrary — it just needs to be a number that no other program is using. Vite chose 5173 (it spells VITE on a phone keypad). If port 5173 is already in use, Vite automatically tries 5174, 5175, etc. You will configure ports explicitly in production (Sprint 8).

**Real-world connection:** In production, your FastAPI server will listen on port 8000, but users will visit `https://yourdomain.com` — port 443. Nginx (the production web server you configure in Sprint 8) listens on port 443, receives the HTTPS connection, decrypts it, and forwards the plain HTTP request to FastAPI on port 8000. This is a **reverse proxy** — Nginx proxies requests from the public internet to internal services. The internal port (8000) is never exposed to the internet.

**What breaks without this:** If `localhost:5173` returns "This site can't be reached," Vite is not running — check the terminal where you ran `npm run dev`. If it shows a compile error, fix the error. If Vite is running but port 5173 is in use by another program, Vite will have printed an alternative port (`5174`, etc.) — use that URL instead.

---

### 4. Read `index.html`

**The problem:** The browser loaded your app. Every web page starts with an HTML file. Where is it, and what does it do?

Open `frontend/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Walkthrough:** The browser loads this file first. It reads every element top to bottom.

`<!doctype html>` — tells the browser this is HTML5, not an older HTML version. Without it, browsers enter "quirks mode" and apply compatibility rules from the 1990s that break modern CSS layouts.

`<meta charset="UTF-8">` — declares the character encoding. UTF-8 can represent every character in every human language. Without this declaration, some browsers default to ASCII and cannot display non-English characters.

`<div id="root"></div>` — a single empty `<div>` element with the id `root`. This is the mount point for the entire React application. When React starts, it finds this element and replaces its contents with the app. The entire React application renders inside this one div.

`<script type="module" src="/src/main.tsx">` — this is where the React application starts. `type="module"` tells the browser to load the script as an ES module (a modern JavaScript file that can use `import` and `export`). The `src` is `/src/main.tsx` — a TypeScript file. The browser does not know how to execute TypeScript. When it makes a GET request to `/src/main.tsx`, Vite intercepts it, compiles the TypeScript to JavaScript, and returns the compiled result. The browser receives and executes valid JavaScript.

**CS lens — the DOM as the browser's tree.** When the browser parses `index.html`, it builds a tree data structure in memory called the **DOM** (Document Object Model). Every HTML element becomes a node in the tree. `<html>` is the root. `<head>` and `<body>` are its children. `<div id="root">` is a child of `<body>`. React manipulates this tree: when your React components render, React computes which DOM nodes need to change and applies only those changes. This selective updating — rather than rebuilding the entire tree on every state change — is what makes React performant.

**SE lens — the single HTML file as the architecture of SPAs.** There is only one `index.html` in a React application. Every "page" — login, dashboard, settings — is a different React component rendered inside that single `<div id="root">`. When you navigate from the login page to the dashboard, the browser does not load a new HTML file. React swaps components in and out of the DOM. This architecture is called a **Single Page Application** (SPA). The tradeoff: faster navigation between pages (no full page reload), but the initial page load must download the entire application's JavaScript. In Sprint 8 you will address the initial load time.

**What breaks without this:** If you delete or rename `<div id="root">`, React cannot find its mount point and the app renders nothing. The error in the browser console will be: `Target container is not a DOM element` — React's way of saying "I could not find the element you told me to mount into."

---

### 5. Read `src/main.tsx`

**The problem:** The browser loaded `main.tsx` via the `<script>` tag. This file starts React. You need to understand every line of it.

Open `frontend/src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Walkthrough line by line:**

`import { StrictMode } from 'react'` — imports the `StrictMode` component from the `react` package. The `react` package is installed in `node_modules/` by `npm install`. `StrictMode` is a React component that activates additional runtime checks: it deliberately renders components twice (in development only) to help you find side effects that should not exist, and it warns when deprecated APIs are used. It produces no visible output.

This is the first `import` statement in this curriculum. An `import` statement has three parts: **what** is being imported (`StrictMode`), **from where** it is imported (`'react'`), and **why** it is needed here. The curly braces `{}` mean a **named export** — `StrictMode` is one of several things the `react` package exports, and you are importing it by name. You will see both named exports (`{ useState }`) and **default exports** (`import App from './App.tsx'`) throughout this curriculum.

`import { createRoot } from 'react-dom/client'` — `react-dom` is a separate package from `react`. The `react` package defines how components work; `react-dom` is the **renderer** that knows how to translate React components into actual DOM nodes in the browser. `react-dom/client` is a sub-path of the package containing the browser-specific rendering API. `createRoot` is the function that connects React to the DOM.

`import './index.css'` — imports a CSS file. Vite handles this: when it sees a `.css` import, it injects the styles into the page during development. This is not standard JavaScript — JavaScript cannot import CSS — but Vite transforms it. During production build, Vite collects all imported CSS into a single stylesheet file.

`import App from './App.tsx'` — a **default import**. `App.tsx` exports one thing as its default export (the `App` component). Default imports do not use curly braces. The name `App` here is chosen by you — you could write `import MyApp from './App.tsx'` and it would work identically. Default exports are used for a file's primary export; named exports are used for secondary exports.

`document.getElementById('root')` — `document` is a global object that the browser provides in every JavaScript environment. It represents the entire HTML document as the DOM tree. `.getElementById('root')` is a method that searches the DOM tree for an element with the attribute `id="root"`. It returns the first match, or `null` if none exists. This is the same `<div id="root">` from `index.html`.

`!` — the TypeScript non-null assertion operator. `getElementById` can return `null` (if no element with that id exists). TypeScript knows this and would produce a type error: "you cannot pass a possibly-null value to `createRoot`." The `!` tells TypeScript: "I know this will not be null at runtime." This is a tradeoff: you suppress the type error, but you take on the responsibility of guaranteeing the element exists. In this case, you can guarantee it — `index.html` always has `<div id="root">`.

`createRoot(...)` — creates a React **root** attached to the DOM element. A root is React's internal state for managing a tree of components. You call `.render()` on it to render content into that DOM node.

`.render(<StrictMode><App /></StrictMode>)` — renders the component tree into the root. `<StrictMode>` and `<App />` are **JSX** — this will be explained in the next section.

**CS lens — the entry point.** Every runnable program has an entry point: the first line of code the runtime executes. In Python scripts it is `if __name__ == "__main__"`. In C it is `main()`. In a browser SPA it is the `<script>` tag in `index.html` pointing to `main.tsx`. Understanding the entry point is the first step to reading any codebase — follow the entry point and you can trace every code path the program takes.

**SE lens — separating the framework from the renderer.** React separates `react` (component logic, the virtual DOM, diffing algorithm) from `react-dom` (browser rendering). This is the separation of concerns principle applied at the library level. The same `react` package runs in React Native (renders to mobile native components), React Three Fiber (renders to WebGL), and server-side rendering (renders to HTML strings). Only the renderer changes. If React had hard-coded browser DOM operations into the core library, none of these other targets would be possible.

**What breaks without this:** If `document.getElementById('root')` returns `null` (because you removed the div from `index.html`), the `!` assertion makes TypeScript trust you — but `createRoot(null!)` throws a runtime error. The browser console shows: `Target container is not a DOM element`. The fix is to ensure `index.html` has `<div id="root">`.

---

### 6. Read `src/App.tsx` — what JSX is

**The problem:** `main.tsx` renders `<App />`. You need to understand what the `App` component is and what JSX syntax means. If you have seen HTML before, JSX looks like HTML — but it is not HTML.

Open `frontend/src/App.tsx` (the generated file will have some starter content — focus on the structure):

```typescript
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Hello from React</h1>
      <button onClick={() => setCount(count + 1)}>
        Count is {count}
      </button>
    </div>
  )
}

export default App
```

(Replace the generated content with the above to start with a clean example.)

**Walkthrough:**

`import { useState } from 'react'` — imports the `useState` hook from React. `useState` is a function that adds state to a component. State will be explained fully when it is used below.

`function App()` — a regular JavaScript function. A React **component** is just a function that returns JSX. The function name starts with a capital letter — this is required. React distinguishes between HTML elements (`<div>`, `<button>`) and custom components (`<App>`, `<StrictMode>`) by capitalisation. A lowercase name is treated as an HTML element; an uppercase name is looked up as a component function.

`const [count, setCount] = useState(0)` — calls `useState` with an initial value of `0`. `useState` returns an array with exactly two elements: the current value of the state (`count`), and a function to change it (`setCount`). The `const [count, setCount]` syntax is **destructuring assignment** — it unpacks the array's two elements into two named variables in one step. This is shorthand for:

```typescript
const stateArray = useState(0)
const count = stateArray[0]
const setCount = stateArray[1]
```

**What state is:** State is data that belongs to a component and can change over time. When state changes, React re-renders the component — calls the `App` function again and updates the DOM to match the new output. `count` starts at `0`. When you click the button, `setCount(count + 1)` is called, `count` becomes `1`, React re-renders `App`, and the button now shows "Count is 1".

`return (...)` — the function returns JSX, which React will render to the DOM.

**What JSX is:** JSX is a syntax extension to JavaScript. `<div>`, `<h1>`, and `<button>` look like HTML but they are not HTML — they are JavaScript function calls in disguise. Vite compiles JSX to JavaScript before the browser sees it. The compiled output for:

```jsx
<button onClick={() => setCount(count + 1)}>
  Count is {count}
</button>
```

is:

```javascript
React.createElement(
  'button',
  { onClick: () => setCount(count + 1) },
  'Count is ',
  count
)
```

`React.createElement` is a function that creates a **virtual DOM node** — a plain JavaScript object describing what the DOM element should look like. React builds a tree of these objects (the virtual DOM), compares it to the previous tree, and applies only the changes to the real DOM.

`{count}` inside JSX — curly braces switch from JSX back to JavaScript. `{count}` inserts the current value of the `count` variable as a text node. `{count + 1}` would insert the value of the expression `count + 1`. Any valid JavaScript expression can go inside `{}`.

`onClick={() => setCount(count + 1)}` — the `onClick` prop attaches a click event handler. `() => setCount(count + 1)` is an **arrow function** — `() =>` is the parameter list (empty, the click event takes no parameters here), and `setCount(count + 1)` is the body. When the button is clicked, React calls this function.

`export default App` — makes `App` the default export of this file. This is what `import App from './App.tsx'` in `main.tsx` receives.

**CS lens — the virtual DOM and reconciliation.** React maintains two trees: the current virtual DOM (what is on screen) and the new virtual DOM (what the component returned after re-rendering). React's **reconciler** diffs these two trees and computes the minimum set of real DOM operations to bring the screen up to date. This diffing algorithm runs every time state changes. It is the core CS contribution of React: making UI updates fast by minimising DOM writes, which are the slowest operations in the browser.

**SE lens — components as composable units.** A React component is a function that takes inputs (called **props**) and returns UI. This is the same as a pure function in mathematics: given the same inputs, it always produces the same output. Pure components are easy to test (call with known props, assert on the output), easy to reason about (no hidden state), and easy to compose (combine small components into larger ones). The entire React model is built on this principle: build a complex UI by composing many small, pure components.

**Real-world connection:** JSX and the virtual DOM are not React inventions that other libraries ignored. Vue uses a virtual DOM. SolidJS uses a fine-grained reactivity model (no virtual DOM) but JSX. Flutter (for mobile apps) uses a widget tree that is conceptually identical to React's component tree. The idea — describe what the UI should look like and let the framework figure out the minimal DOM changes — is the dominant UI programming model across the industry.

**What breaks without this:** If you capitalise a built-in HTML element — `<Div>` instead of `<div>` — React looks for a component named `Div`, does not find it, and throws `React.createElement: type is invalid`. If you forget `export default App`, `main.tsx` imports `undefined` and React throws `Element type is invalid: expected a string or a class/function but got: undefined`.

---

### 7. Read `package.json`

**The problem:** `npm install` read a file named `package.json` to know what to download. `npm run dev` read it to know what command to run. Every npm project is defined by this file.

Open `frontend/package.json`:

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.0",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "eslint": "^9.9.0",
    "globals": "^15.9.0",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.0.1",
    "vite": "^5.4.1"
  }
}
```

**Walkthrough of every field:**

`"name": "frontend"` — the package name. If you published this to npm, this would be its name. For an application (as opposed to a library), this is mostly metadata.

`"private": true` — prevents this package from being accidentally published to the npm registry. An application is not a library; it should never be published. This field is the safeguard.

`"version": "0.0.0"` — semantic version. For an application, this is largely cosmetic. For a library, it follows the contract: breaking changes increment the major version, new features increment the minor version, bug fixes increment the patch version.

`"type": "module"` — tells Node.js to interpret `.js` files in this directory as ES modules (files that use `import`/`export`) rather than CommonJS modules (files that use `require`/`module.exports`). This is the modern JavaScript module system. Without this field, Node.js would reject `import` statements in `.js` files.

**`"scripts"` — every entry is a command alias:**

`"dev": "vite"` — when you run `npm run dev`, npm runs the program `vite` in the `node_modules/.bin/` directory. You do not need `vite` installed globally; npm automatically adds `node_modules/.bin/` to PATH when running scripts.

`"build": "tsc -b && vite build"` — runs two commands in sequence. `tsc -b` runs the TypeScript compiler (`tsc`) in build mode — it type-checks all your TypeScript files and reports errors. The `&&` means "only run the second command if the first succeeds." If there are type errors, the build stops before Vite runs. `vite build` produces the optimised production output in `dist/`.

`"lint": "eslint ."` — runs ESLint on every file in the current directory (`.`). Run this before committing to catch issues the editor might have missed.

`"preview": "vite preview"` — serves the production build locally so you can test it before deploying.

**`"dependencies"` — packages required to run the app:**

`"react": "^18.3.1"` — the React core library. The `^` prefix means "compatible with 18.3.1" — npm will install any version `≥18.3.1` and `<19.0.0`. The caret allows automatic minor and patch updates but blocks major version changes, which may break the API.

`"react-dom": "^18.3.1"` — the React browser renderer.

**`"devDependencies"` — packages required only to build and test, not to run:**

`"typescript": "^5.5.3"` — the TypeScript compiler. TypeScript is not in `dependencies` because the compiled output (JavaScript) does not need TypeScript at runtime. TypeScript is a build-time tool.

`"vite": "^5.4.1"` — the build tool. Also a dev dependency — the production server (Nginx, in Sprint 8) serves the compiled static files and never runs Vite.

`"@types/react": "^18.3.1"` and `"@types/react-dom"` — TypeScript type definitions for React. The `react` package is written in JavaScript, not TypeScript. The `@types/react` package contains a separate `.d.ts` file that describes the types of every function and component React exports. Without it, TypeScript would not know that `useState` takes an initial value and returns a tuple.

**CS lens — declarative dependency specification.** `package.json` is a **declarative** specification: it says what is needed, not how to get it. npm is the **imperative** implementation: it reads the declaration and figures out the steps. The declaration is committed to git; the imperative result (`node_modules/`) is not. This separation — declare intent, let the tool implement it — is a recurring pattern in software. Dockerfile, docker-compose.yml, Terraform configs: all declarative specifications interpreted by imperative tools.

**SE lens — `dependencies` vs `devDependencies`.** This distinction exists for production deployment. When you deploy a Node.js server to production, you run `npm install --production`, which installs only `dependencies` — not `devDependencies`. TypeScript, Vite, and ESLint are not needed at runtime; including them in production would waste disk space and increase attack surface. For a React SPA (which is compiled before deployment), it makes less practical difference — the production artifact is the compiled `dist/` folder, not the source files — but the convention exists and should be followed.

**What breaks without this:** If you move a dev dependency into dependencies or vice versa, `npm install --production` on a server might include unnecessary packages or miss required ones. If you remove the `^` from a version and pin to an exact version (e.g., `"18.3.1"` instead of `"^18.3.1"`), npm will never automatically update that package, which means you will not receive security patches unless you manually update the version.

---

### 8. What TypeScript is

**The problem:** Every file has a `.tsx` extension instead of `.jsx`. The scaffolded project includes `tsconfig.json`. TypeScript is being used, and you need to understand what it is and why — not just to use it, but to understand what the compiler is doing when it reports errors.

**TypeScript is JavaScript with types.** Every valid JavaScript file is also a valid TypeScript file. TypeScript adds one thing: **type annotations** — syntax that describes what type of value a variable, parameter, or function return holds. The TypeScript compiler (`tsc`) reads these annotations and verifies that every assignment, function call, and property access is type-safe. If you pass a string to a function that expects a number, `tsc` catches it before you run the code.

At runtime, TypeScript does not exist. The compiler strips all type annotations and produces plain JavaScript. The browser never sees TypeScript. TypeScript is entirely a development-time tool — a static analysis layer that sits between your editor and the JavaScript runtime.

A small example to make this concrete:

```typescript
function add(a: number, b: number): number {
  return a + b
}

add(1, 2)     // TypeScript: OK
add("1", 2)   // TypeScript: Error — Argument of type 'string' is not assignable to parameter of type 'number'
```

The `: number` after each parameter is the type annotation. `: number` after the parameter list and before `{` is the return type annotation. TypeScript reads these and verifies every call to `add`.

The `.tsx` extension means "TypeScript file containing JSX." A `.ts` file is TypeScript without JSX. A `.jsx` file is JavaScript with JSX. A `.js` file is plain JavaScript.

**CS lens — static vs dynamic typing.** JavaScript is **dynamically typed**: types are checked at runtime. If you call `add("1", 2)` in JavaScript, the code runs — you get `"12"` instead of `3`, and there is no error until something downstream breaks. TypeScript is **statically typed**: types are checked at compile time, before the code runs. Static typing catches entire categories of bugs — wrong argument types, missing properties, null pointer dereferences — that dynamic typing can only find by running the code and hitting the failure. The tradeoff: static typing requires more code (the annotations) but provides much earlier feedback.

**SE lens — TypeScript as a communication tool.** Type annotations are documentation that the compiler enforces. A function signature like `function fetchOrders(userId: number): Promise<Order[]>` tells every reader exactly what it accepts and what it returns, and the compiler prevents any caller from violating that contract. In a team, this means you can change a function's signature and the compiler tells you every caller that needs to be updated. In this curriculum, it means the editor tells you when you are calling a function incorrectly before you run anything.

**What breaks without this:** TypeScript errors do not prevent the development server from running — Vite shows the TypeScript error as a browser overlay but still serves the page. The production build (`npm run build`) runs `tsc -b` first and will fail with type errors. This is intentional: you can iterate quickly in development and fix type errors in batches, but you cannot ship code with type errors.

---

### 9. Read `tsconfig.json`

Open `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

**Walkthrough of every field you will encounter:**

`"target": "ES2020"` — the JavaScript version to compile to. `ES2020` supports modern features like optional chaining (`?.`) and nullish coalescing (`??`). Targeting an older version (like `ES5`) would make TypeScript transpile modern syntax to equivalent older syntax — useful for supporting old browsers, unnecessary for modern ones.

`"lib": ["ES2020", "DOM", "DOM.Iterable"]` — which built-in type definitions TypeScript includes. `ES2020` includes types for built-in JavaScript objects (`Array`, `Promise`, `Map`). `DOM` includes types for browser APIs (`document`, `window`, `HTMLElement`). Without `DOM`, TypeScript would not know that `document.getElementById` exists.

`"moduleResolution": "bundler"` — tells TypeScript to resolve imports the way Vite does. Without this, TypeScript would use Node.js's resolution algorithm, which does not understand Vite's ability to import `.tsx` files directly.

`"noEmit": true` — tells TypeScript to not produce any `.js` output files. In this project, Vite handles the compilation. TypeScript is used only for type-checking. `noEmit` says: check types, report errors, but do not write output. This prevents duplicate compilation.

`"jsx": "react-jsx"` — tells TypeScript how to transform JSX. `react-jsx` uses the new React 17+ JSX transform, which does not require `import React from 'react'` at the top of every file. The transform is handled by `@vitejs/plugin-react`.

`"strict": true` — enables a group of checks that catch the most common type errors. It is shorthand for several individual flags: `noImplicitAny` (every variable must have a known type — TypeScript will not silently assume `any`), `strictNullChecks` (null and undefined are not valid values unless explicitly allowed — this catches the most common runtime crash pattern: calling a method on a null value), and `strictFunctionTypes` (function parameter types are checked precisely). Disabling `strict` is technically possible but is universally considered bad practice.

`"noUnusedLocals": true` and `"noUnusedParameters": true` — error on variables and function parameters that are declared but never used. This catches one of the most common categories of bugs: code that was written for a feature that was then changed, leaving dead code that confuses future readers.

`"include": ["src"]` — tells TypeScript which files to include in the compilation. Only files inside `src/` are type-checked. Configuration files in the root directory are excluded.

**CS lens — the compiler as a static analyser.** `tsc` is not just a transpiler (a program that converts one language to another). It is a full static analyser: it builds a type graph of your entire program, resolves every reference, and verifies type compatibility. The `strict` option enables the most valuable checks because they catch the most common runtime errors. `strictNullChecks` in particular enforces that you cannot call `.someMethod()` on a value that might be `null` or `undefined` — which is the cause of the single most common class of production JavaScript crashes.

**SE lens — checked in early, paid in full.** The principle behind TypeScript's strictness options is: pay the cost of correctness upfront (writing type annotations, handling null checks) rather than downstream (production crashes, debugging sessions). The strictness options are a policy: this codebase requires type safety. Every file added to the project is automatically enrolled. A team that disables strict options trades short-term convenience for long-term fragility.

**What breaks without this:** Removing `"strict": true` from `tsconfig.json` allows TypeScript to silently infer `any` for untyped variables, which defeats the purpose of using TypeScript. `any` is a type that disables all checking — a variable of type `any` can be used as a string, a number, a function, or anything else. TypeScript treats it as a hole in the type system. Professional TypeScript codebases ban `any` with the `noImplicitAny` rule (which `strict: true` enables).

---

## Connect the pieces

You now have a running React application. The chain from `npm run dev` to pixels on screen is:

1. npm reads `package.json` and runs the `dev` script: `vite`
2. Vite starts an HTTP server on port 5173
3. The browser navigates to `localhost:5173`
4. Vite serves `index.html`
5. The browser parses `index.html` and finds `<script src="/src/main.tsx">`
6. The browser requests `/src/main.tsx` from Vite
7. Vite compiles `main.tsx` (TypeScript → JavaScript, JSX → `React.createElement` calls) and returns it
8. The browser executes `main.tsx`, which calls `createRoot` and `render`
9. React renders `<App />` — calls the `App` function, gets back JSX, converts it to DOM nodes
10. The DOM nodes appear in `<div id="root">` and the page becomes visible

When you save `App.tsx`, Vite detects the change, recompiles the file, and sends the updated module to the browser over a WebSocket — the browser replaces the old module without a full reload.

In Lesson 4, the `App` component will call your FastAPI server and render data returned from Python. The `fetch()` call goes to `localhost:8000`; the data comes back as JSON; React renders it. The chain you just learned is the React half of that integration.

---

## What breaks without this

**Hot reload stops updating the browser:** Vite's WebSocket connection has dropped — usually because you have been idle for a long time or the Vite process was restarted. Reload the page once (`Cmd+R`) to reconnect.

**`node_modules not found` when running `npm run dev`:** You cloned the project but did not run `npm install`. The project only stores the manifest (`package.json`), not the packages themselves. Run `npm install` first.

**TypeScript error overlay in the browser:** Vite shows TypeScript errors as a red overlay in development. The page still renders behind it (you can press Escape to dismiss). Fix the error shown — Vite includes the file path and line number. The most common cause is a missing return type or a property access on a possibly-null value.

---

## Definition of done

- [ ] `npm run dev` starts without errors
- [ ] `http://localhost:5173` shows the React app in the browser
- [ ] You edited `App.tsx` and the browser updated without a manual reload (hot reload confirmed)
- [ ] You can explain what Vite does in development vs production
- [ ] You can explain what `<div id="root">` is and why there is only one
- [ ] You can explain the difference between `import { useState }` and `import App from`
- [ ] You can explain what JSX compiles to
- [ ] You can explain `dependencies` vs `devDependencies`
- [ ] You can explain what `"strict": true` enables and why it matters

**Git commit** (from `fullstack-project/`, not `fullstack-project/frontend/`):

```
git add frontend
git commit -m "Add React frontend scaffold: Vite + React + TypeScript, all generated files read and understood"
```

Run `git status` before committing to confirm only `frontend/` files are staged.
