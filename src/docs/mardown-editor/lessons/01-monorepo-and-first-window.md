# Lesson 1 — The Monorepo and the First Window

## What You Will Build

By the end of this lesson you will have an Electron window on your screen showing the
heading **"Codex"** in white text on a dark background. That is all. No content, no sidebar,
no code execution. One window. One heading. The point is not the heading — the point is
that every tool in the chain is working: TypeScript compiles, Electron launches, and you
have a visual surface onto which every subsequent lesson will add something.

The repository you scaffold here — three packages in a monorepo — is the structure every
later lesson builds inside. You will not reorganise it again.

---

## What You Need to Know First

This is the first lesson. No prior lessons are required. Everything that appears here is
introduced here.

If you have used a terminal before, the concepts will feel familiar — but read the
explanations anyway. The definitions here are precise in ways that matter later.

---

## The Lesson

### Step 1 — What is a Terminal?

A terminal (also called a shell, a command prompt, or a console) is a program that lets
you type commands and receive text responses. On macOS it is called Terminal or iTerm2.
On Windows it is PowerShell or Windows Terminal. On Linux it is your distribution's
terminal emulator.

The terminal runs a **shell** — a program that interprets the commands you type. The most
common shell on macOS and Linux is `bash` or `zsh`. On Windows it is `PowerShell`.

When documentation shows a command like this:

```
$ mkdir codex
```

The `$` is a prompt symbol — it means "type what comes after this." You do not type the
`$` itself. The prompt symbol shows you that this is a command to run, not output to read.

### Step 2 — What is Node.js and npm?

**Node.js** is a JavaScript runtime — a program that executes JavaScript files outside a
browser. When you run `node script.js` in the terminal, Node.js reads your file and runs
the JavaScript in it. Node.js is built on the V8 engine (the same engine inside Chrome)
but adds APIs for reading files, creating network servers, and spawning child processes.

**npm** (Node Package Manager) is a command-line tool installed alongside Node.js. It
does two things:

1. Downloads packages from the npm registry (a public database of JavaScript libraries)
   and installs them into your project
2. Runs scripts you define in a configuration file called `package.json`

When you type `npm install react`, npm looks up `react` in the registry, downloads it,
and places it inside a directory called `node_modules` in your current folder.

**Install Node.js** if you have not already. Go to nodejs.org and install the LTS version.
After installing, verify it worked:

```
$ node --version
v20.11.0

$ npm --version
10.2.4
```

The numbers will differ — that is fine. What matters is that both commands respond without
an error.

**What a failure looks like:**

```
$ node --version
zsh: command not found: node
```

This means Node.js is not installed, or its installation directory is not on your `PATH`.
PATH is the ordered list of directories the shell searches when you type a command name.
If `node` is installed in `/usr/local/bin` but `/usr/local/bin` is not in your PATH, the
shell cannot find it. The fix is usually to restart your terminal after installation, or
to follow the PATH setup instructions in the Node.js installer.

### Step 3 — Create the Project Folder

```
$ mkdir codex
$ cd codex
```

`mkdir` creates a directory. `cd` (change directory) moves the shell into it. Every
command you run from this point forward is run from inside the `codex` directory unless
stated otherwise.

### Step 4 — What is a Monorepo?

A **monorepo** is a single version-controlled repository that contains multiple packages.
Each package is a self-contained module with its own `package.json`, its own dependencies,
and its own single responsibility.

The alternative — one repository per package — is called a **polyrepo**. Polyrepos work
but create friction: changing two packages at once requires two pull requests, two
version bumps, and publishing one package before the other can use it.

In a monorepo, all packages are in the same repository. A change that touches both the
`core` package and the `renderer` package is one commit, one code review, one deployment.

The Codex monorepo has this structure:

```
codex/
├── package.json              ← workspace root — manages all packages
├── packages/
│   ├── core/                 ← reads the file system, owns the content model
│   └── renderer/             ← React components for displaying content
└── apps/
    └── electron/             ← the Electron shell (desktop app)
```

**Why this structure?** The renderer package — the React components that display a chapter,
render code blocks, and draw the sidebar — will be reused in a web browser shell (Lesson
12) and a VS Code extension (Lesson 22) without any changes. The monorepo makes that
reuse possible without publishing the package to npm.

**CS lens:** The monorepo enforces separation of concerns at the package level. Each
package has one job. `core` knows about files; it does not know about React. `renderer`
knows about React; it does not know about Electron. Electron knows about the OS; it does
not know how content is parsed.

**SE lens:** This is the single responsibility principle applied at the package level —
the same principle that applies to functions and classes, scaled up. A package that does
too many things is hard to test, hard to reuse, and hard to reason about. A package with
one job can be replaced, tested in isolation, and reused elsewhere.

### Step 5 — npm Workspaces

npm workspaces is a feature that lets a single `package.json` at the root of a monorepo
manage multiple packages. Without it, you would need to run `npm install` separately in
every package directory. With it, one `npm install` at the root installs everything.

Create the root `package.json`:

```
$ touch package.json
```

`touch` creates an empty file. Open it in your editor and type:

```json
{
  "name": "codex",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

**Every field explained:**

- `"name": "codex"` — the name of the root package. This is not published to npm
  (`"private": true` prevents that), so the name is only for reference.
- `"version": "1.0.0"` — the starting version. We follow semantic versioning: `MAJOR.MINOR.PATCH`.
  MAJOR changes mean breaking changes. MINOR changes add features without breaking anything.
  PATCH changes fix bugs without adding features.
- `"private": true` — prevents this root package from being accidentally published to the
  npm registry. Always set this for monorepo roots.
- `"workspaces": ["packages/*", "apps/*"]` — tells npm that every directory inside
  `packages/` and every directory inside `apps/` is a workspace package. When you run
  `npm install` at the root, npm installs dependencies for all of them and creates
  symlinks so packages can import each other by name.

### Step 6 — Create the Package Directories

```
$ mkdir -p packages/core packages/renderer apps/electron
```

`-p` (parents) creates all intermediate directories in one command. Without it, you would
need to create `packages/` first, then `packages/core`, then `packages/renderer`, which
is three commands.

### Step 7 — What is TypeScript?

**TypeScript** is a programming language that adds a type system on top of JavaScript.
You write TypeScript (`.ts` files), and a compiler called `tsc` converts it to JavaScript
(`.js` files) that Node.js or a browser can run.

The type system lets you declare what kind of data a variable holds:

```typescript
const chapterTitle: string = "Introduction"
const lineCount: number = 42
const isVisible: boolean = true
```

If you try to assign the wrong type:

```typescript
const chapterTitle: string = 42  // TypeScript error: Type 'number' is not assignable to type 'string'
```

TypeScript catches this before you run the code. This is called **static type checking** —
the types are checked without executing the program.

**Why TypeScript instead of JavaScript?** In a project with multiple packages, TypeScript
catches the category of error where one package passes data of the wrong shape to another.
Without types, these errors appear at runtime — often far from where the mistake was made.
With types, they appear at compile time, at the exact line of the mistake.

### Step 8 — The core Package

Create the `core` package configuration:

```
$ touch packages/core/package.json
```

```json
{
  "name": "@codex/core",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  }
}
```

**Every field explained:**

- `"name": "@codex/core"` — the `@codex/` prefix is a **scoped package name**. Scopes
  group related packages. Any package in this monorepo can import from `@codex/core`
  with `import { ... } from '@codex/core'` — npm's workspace symlinking makes this work
  without publishing.
- `"main": "dist/index.js"` — when another package writes `import { ... } from '@codex/core'`,
  Node.js looks in this file. `dist/` is the compiled output directory — TypeScript compiles
  `.ts` source files to `.js` files there.
- `"types": "dist/index.d.ts"` — when TypeScript compiles code that imports `@codex/core`,
  it reads this declaration file (`.d.ts`) to know the types of everything exported.

Now create the TypeScript configuration for `core`:

```
$ touch packages/core/tsconfig.json
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

**Every field explained:**

- `"target": "ES2022"` — the JavaScript version to compile to. ES2022 supports modern
  syntax (async/await, optional chaining) natively. Node.js 18+ understands it.
- `"module": "CommonJS"` — the module system to use. CommonJS uses `require()` and
  `module.exports`. Electron and Node.js use CommonJS by default.
- `"outDir": "dist"` — where TypeScript puts compiled files.
- `"rootDir": "src"` — where TypeScript looks for source files.
- `"strict": true` — enables a group of checks that prevent the most common type errors.
  Specifically: `noImplicitAny` (every variable must have a known type), `strictNullChecks`
  (null and undefined are not valid unless declared), and `strictFunctionTypes` (function
  parameter types are checked precisely). Always enable this.
- `"declaration": true` — generates `.d.ts` type declaration files alongside the compiled
  `.js` files. Required so other TypeScript packages can import `@codex/core` with type
  checking.
- `"esModuleInterop": true` — allows `import React from 'react'` syntax for packages that
  use CommonJS exports. Without this, you would need `import * as React from 'react'`.

Now create the source file:

```
$ mkdir packages/core/src
$ touch packages/core/src/index.ts
```

```typescript
export const CODEX_VERSION = '1.0.0'
```

**CS lens:** This is a module — a unit of code with a defined public interface. Everything
`export`ed is public; everything not exported is private to the module. The module system
is JavaScript's answer to encapsulation: callers see only what the module chooses to expose.

**SE lens:** `@codex/core` will own the content model and file system access. Right now it
exports one constant. That is correct — we are building the smallest thing that works at
each step, then adding to it. Starting with an empty-but-working package ensures the
package wiring is correct before we add complexity.

**Walkthrough:** When another package writes `import { CODEX_VERSION } from '@codex/core'`,
Node.js follows the `@codex/core → dist/index.js` path set in `core/package.json`. The
`dist/index.js` file (compiled from `index.ts`) exports a constant named `CODEX_VERSION`
with value `'1.0.0'`. TypeScript reads `dist/index.d.ts` to confirm the type is `string`.

**What breaks without the `export` keyword:** If you write `const CODEX_VERSION = '1.0.0'`
without `export`, the constant exists inside the module but is invisible to importers.
TypeScript would give: `Module '"@codex/core"' has no exported member 'CODEX_VERSION'`.

### Step 9 — The renderer Package

```
$ touch packages/renderer/package.json
```

```json
{
  "name": "@codex/renderer",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "@codex/core": "*"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

**`peerDependencies` explained:** A peer dependency says "I need this package to exist, but
I expect the application that uses me to provide it." The renderer expects the Electron app
to install React. If `renderer` declared React as a regular `dependency`, npm might install
two copies of React — one in `renderer/node_modules/react` and one in
`apps/electron/node_modules/react`. React breaks when two copies exist in the same app.
Peer dependencies prevent the double-install.

```
$ touch packages/renderer/tsconfig.json
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "jsx": "react-jsx",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

**`"jsx": "react-jsx"` explained:** JSX is a syntax extension that lets you write HTML-like
markup inside JavaScript/TypeScript. `<div className="sidebar">` in a `.tsx` file is JSX.
TypeScript does not understand JSX natively — `"jsx": "react-jsx"` tells TypeScript to
transform JSX into calls to `React.createElement` (or its modern equivalent). Without this,
TypeScript would give a syntax error on any JSX expression.

```
$ mkdir packages/renderer/src
$ touch packages/renderer/src/index.tsx
```

```typescript
export { App } from './App'
```

```
$ touch packages/renderer/src/App.tsx
```

```typescript
import React from 'react'

export function App() {
  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h1>Codex</h1>
    </div>
  )
}
```

**CS lens:** `App` is a React component — a function that returns a description of what
should be on screen (the JSX). React calls this function and uses the returned description
to update the DOM. The component is a pure function: given the same inputs (props), it
always returns the same output (JSX). This makes components easy to test and reason about.

**SE lens:** The `App` component is the root of the component tree. Everything else in the
renderer will be a child of `App`, or a child of a child. Starting with a single `App`
component and hardcoded content is correct — we are proving the render pipeline works
before adding dynamic data.

**Walkthrough:** When Electron loads the renderer, it calls `App()`. React evaluates the
JSX: `<div style={...}>` becomes a React element describing a `div` node with inline
styles. `<h1>Codex</h1>` becomes a React element describing an `h1` node with the text
"Codex". React compares this description to the current DOM state and applies the minimum
necessary changes. On first render, the DOM is empty, so React creates both elements.

### Step 10 — The Electron App

```
$ touch apps/electron/package.json
```

```json
{
  "name": "@codex/electron",
  "version": "1.0.0",
  "main": "src/main.ts",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build"
  },
  "dependencies": {
    "@codex/core": "*",
    "@codex/renderer": "*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-vite": "^2.0.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.0.0"
  }
}
```

**`dependencies` vs `devDependencies` explained:**
- `dependencies` are packages needed when the app runs. `react`, `react-dom`, and our own
  `@codex/core` and `@codex/renderer` packages are needed at runtime.
- `devDependencies` are packages needed only during development and build. `typescript`,
  `electron-vite`, and TypeScript type definitions (`@types/...`) are not shipped to users.
  They are tools used to build the app, not parts of the app itself.

**`electron-vite` explained:** `electron-vite` is a build tool that combines Electron and
Vite. Vite is a development server and bundler: in development it compiles TypeScript files
on demand as they are requested (fast); for production it bundles all files into optimised
output. `electron-vite` configures Vite specifically for Electron's main/renderer process split.

**What Electron is:** Electron is a framework for building desktop applications using web
technologies (HTML, CSS, JavaScript). It embeds the Chromium browser engine and the Node.js
runtime in a single executable. The result: an app that has a browser window (for the UI)
and access to the file system and OS APIs (via Node.js). VS Code is built with Electron.
Slack is built with Electron. Figma's desktop app is built with Electron.

Now create the Electron configuration:

```
$ touch apps/electron/electron.vite.config.ts
```

```typescript
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [react()]
  }
})
```

**CS lens:** This configuration file is a **declarative specification** — it describes what
the build system should produce, not how to produce it. `electron-vite` reads this and
handles the implementation. Declarative configuration separates the what from the how.

Create the main process file — the Node.js process that owns the OS-level window:

```
$ mkdir -p apps/electron/src
$ touch apps/electron/src/main.ts
```

```typescript
import { app, BrowserWindow } from 'electron'
import { join } from 'path'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

**CS lens:** This file responds to **events** emitted by the Electron `app` object.
`app.whenReady()` resolves when Electron has finished starting up and the OS is ready to
create windows. `app.on('window-all-closed', ...)` fires when the user closes all windows.
Event-driven programming: instead of checking a condition in a loop, you register a
callback and the system calls it when the event occurs.

**SE lens:** The main process and the renderer process are deliberately separated.
`contextIsolation: true` means the renderer's JavaScript cannot directly call Node.js APIs.
`nodeIntegration: false` means the renderer cannot `require()` Node.js modules. Why: a
renderer process loads HTML and JavaScript — if a malicious website loaded in the renderer
could call `require('fs').rm('/', { recursive: true })`, the user's files would be deleted.
Isolation prevents this. It is a security boundary baked into the architecture.

**Walkthrough:**
1. Electron starts, calls `app.whenReady()`.
2. The promise resolves; `createWindow()` is called.
3. A new `BrowserWindow` is created — a native OS window backed by a Chromium renderer.
4. `backgroundColor: '#1a1a2e'` sets the window colour before any HTML loads, preventing a
   white flash while the page renders.
5. In development, `ELECTRON_RENDERER_URL` is set by `electron-vite` to the Vite dev server
   URL. The window loads the React app from the dev server.
6. In production, the compiled HTML file is loaded from disk.

**`join(__dirname, '../preload/index.js')` explained:** `__dirname` is a Node.js variable
that holds the absolute path of the directory containing the current file. `join` assembles
a path from parts, using the correct separator for the current OS (`/` on macOS/Linux,
`\` on Windows). The preload script is one directory up and then into `preload/index.js`.

Create the preload script — the bridge between the main process and renderer:

```
$ touch apps/electron/src/preload.ts
```

```typescript
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('codexAPI', {
  version: '1.0.0'
})
```

**What the preload script is:** The preload script runs before the renderer's JavaScript,
in a privileged context that has access to both Node.js APIs and the browser's `window`
object. It is the only place where these two worlds can interact safely.

`contextBridge.exposeInMainWorld('codexAPI', { ... })` places an object named `codexAPI`
on the renderer's `window` object. The renderer can call `window.codexAPI.version` and
get `'1.0.0'`. It cannot access anything else from Node.js — only what is explicitly
exposed through `contextBridge`.

**SE lens:** The `contextBridge` is the open/closed principle applied to security.
The main process is closed for direct access from the renderer. It is open for interaction
through the narrow interface defined in the preload script. Anything not in that interface
is inaccessible. This means the attack surface — the code a malicious script could exploit —
is exactly as wide as the preload script's API, and no wider.

Create the renderer HTML entry point:

```
$ mkdir -p apps/electron/src/renderer
$ touch apps/electron/src/renderer/index.html
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'"
    />
    <title>Codex</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #1a1a2e; font-family: system-ui, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
  </body>
</html>
```

**Content Security Policy (CSP) explained:** The `Content-Security-Policy` header tells
the browser which sources of content are allowed to load. `default-src 'self'` means
only content from the same origin (the app itself) can load. `script-src 'self'` means
only scripts from the app itself can run — inline `<script>` tags and scripts from
external domains are blocked.

This is a security measure. If a malicious string somehow ended up in the rendered HTML,
a CSP prevents it from executing JavaScript. The Electron security documentation
recommends this for all Electron apps.

Create the renderer entry point:

```
$ touch apps/electron/src/renderer/index.tsx
```

```typescript
import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@codex/renderer'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. The HTML must contain <div id="root"></div>.')
}

const root = createRoot(rootElement)
root.render(<App />)
```

**CS lens:** `createRoot` is React 18's concurrent rendering API. It returns a `Root` object
— a reference to the React rendering tree attached to this DOM node. Calling `root.render(<App />)`
tells React to take control of the `#root` element and render the `App` component tree inside it.

**Walkthrough:**
1. `document.getElementById('root')` searches the DOM tree for an element with `id="root"`.
   The DOM tree is the browser's in-memory representation of the HTML document — every element
   in the HTML file becomes a node in this tree.
2. The check `if (!rootElement)` handles the case where the element is missing. Without this
   check, the next line would throw `Cannot read properties of null`. With this check, the
   error message is clear and actionable. TypeScript requires this check because
   `getElementById` returns `HTMLElement | null` — TypeScript knows it can be null.
3. `createRoot(rootElement)` attaches React to the element.
4. `root.render(<App />)` renders the `App` component.

### Step 11 — Install Dependencies

```
$ npm install
```

This command reads the root `package.json` and all workspace package `package.json` files,
downloads every declared dependency from the npm registry, and places them in
`node_modules` at the root of the project.

**What `package-lock.json` is:** After running `npm install`, a file called
`package-lock.json` appears. It records the exact version of every package installed —
not just the packages you declared, but all their dependencies and their dependencies'
dependencies. It exists so that running `npm install` on any machine (a colleague's laptop,
a CI server) produces exactly the same set of packages. **Commit this file to git.**

**What `node_modules/` is:** The directory where npm stores downloaded packages.
`node_modules` typically contains hundreds or thousands of files. **Never commit this
directory** — it can be regenerated from `package-lock.json` by running `npm install`.
Adding it to `.gitignore` prevents it from being accidentally committed.

Create the `.gitignore` file:

```
$ touch .gitignore
```

```
node_modules/
dist/
.DS_Store
```

**Every entry explained:**
- `node_modules/` — never committed; reproduced by `npm install`
- `dist/` — TypeScript compiler output; regenerated by `npm run build`
- `.DS_Store` — macOS creates this file in every directory to store folder view settings.
  It is irrelevant to the project and clutters the repository.

### Step 12 — What is Git?

**Version control** records a history of every change made to a project. You can return
to any previous state. You can see who changed what and why. You can work on two different
changes in parallel and merge them later.

For a learner working alone, git is not optional. It is how you recover from mistakes
("I broke something yesterday and need to go back"), understand your history ("what changed
when this stopped working?"), and maintain confidence while editing ("I can change anything
because I can always revert").

**The three states of a file in git:**

1. **Modified** — you changed the file but git does not know about the change yet
2. **Staged** — you have told git to include this change in the next commit
   (`git add filename`)
3. **Committed** — the change is permanently recorded in git's history

**What a commit is:** A snapshot of all staged files at a point in time, with a message
explaining why this snapshot exists. The message is not "what files changed" — git
records that automatically. The message is *why* this change was made.

**Example:**
```
Bad:  "Add monorepo and Electron setup"
Good: "Scaffold the three-package monorepo — this layout allows renderer to be reused
       in the web and VSCode shells without duplicating code"
```

The good message will be meaningful six months from now. The bad one describes what git's
diff already shows.

**Initialise the repository:**

```
$ git init
$ git add package.json package-lock.json .gitignore
$ git add packages/ apps/
$ git commit -m "Scaffold the Codex monorepo

Three packages: core (file system and content model), renderer (React components),
and apps/electron (Electron shell). This layout allows renderer to be reused
in web and VSCode shells in later lessons without copying code."
```

**Why add specific files rather than `git add .`?** `git add .` adds everything in the
current directory. If you have accidentally created a file with a secret key or a large
binary, `git add .` would include it. Adding specific files and directories is safer
and more deliberate.

### Step 13 — Run the App

```
$ npm run dev
```

Electron opens. A dark window appears with "Codex" in white text.

**What happened:**
1. `electron-vite dev` started the Vite dev server for the renderer process
2. It compiled `index.tsx` on demand and served it over HTTP
3. It launched Electron, passing the Vite dev server URL as `ELECTRON_RENDERER_URL`
4. Electron created a `BrowserWindow` and loaded the URL
5. The browser in the window loaded `index.tsx`, which imported `App` from `@codex/renderer`
6. React rendered `<App />`, which returned `<div><h1>Codex</h1></div>`
7. The heading appeared on screen

---

## Connect the Pieces

The three packages you built today are the foundation of every subsequent lesson.

- `@codex/core` will grow to own the content model (Chapter, Library types) and all
  file system access. No other package reads the disk.
- `@codex/renderer` will grow to own every React component — the sidebar, the chapter
  view, the code editor, the Run button. No other package renders content.
- `apps/electron` will grow to own Electron IPC, file dialogs, and child process spawning.
  It is a thin shell over `core` and `renderer`.

The split already pays off: `App.tsx` in `renderer` does not contain a single `import`
from `electron`. It will never need to. When you add the web shell in Lesson 12, you will
create `apps/web` and import the same `App` component with no changes.

---

## What Breaks Without This

If you remove `contextIsolation: true` from `BrowserWindow.webPreferences`, the renderer's
JavaScript gains direct access to Node.js APIs. This means that if the renderer ever loads
external content — a lesson file from an untrusted source, a malicious markdown file — that
content can call `require('child_process').execSync('rm -rf ~')` and delete the user's home
directory. Electron's own security documentation calls contextIsolation the most important
Electron security setting. It is not optional.

---

## Definition of Done

- [ ] `npm run dev` opens an Electron window showing "Codex"
- [ ] `npm install` from a clean clone (delete `node_modules/`, run `npm install`) succeeds
- [ ] `node_modules/` and `dist/` are in `.gitignore` and do not appear in `git status`
- [ ] `git log --oneline` shows one commit with a message that explains *why*, not *what*
- [ ] You can answer: what is the difference between `dependencies` and `devDependencies`?
- [ ] You can answer: why is `contextIsolation: true` required?
- [ ] You can answer: what would you do if `npm run dev` printed `command not found: electron`?
