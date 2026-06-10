# Vault PDM — Lesson 01 — The Shell

## What You Will Build

An Electron desktop window opens showing a hardcoded filename ("housing-v3.step") and
a green "Checked In" badge. Nothing is interactive yet. But the four-layer folder
structure is in place, every tool is installed and explained, and you can launch the
app with one command. This is the blank canvas that every subsequent lesson builds on —
visible from day one.

## What You Need to Know First

This is the first lesson. You need a computer with internet access and a terminal.
Everything else is installed and explained here.

---

## The Problem

Every software project accumulates a hidden cost: **architectural debt**. When code
is written without a deliberate structure, each new feature has to find its own place.
Over time, every piece of the system touches every other piece. Nobody can change one
thing without understanding everything. The system becomes a **ball of mud** — the
formal name for a system with no recognisable structure.

The previous Vault system became a ball of mud. Rebuilding it requires making the
structural decision before writing a single feature: where does each piece of code
live, and what is it allowed to know about?

Vault's answer is a **layered architecture**: four layers, each with one job, each
talking only to the layer directly below it. This structure is established in lesson
one and enforced throughout the curriculum.

---

## Step 1 — The Four Layers

Before writing any code, the architecture is named:

```
┌──────────────────────────────────────────────────┐
│  PRESENTATION  — React components in Electron     │
│  Job: show state, capture user intent             │
├──────────────────────────────────────────────────┤
│  API            — Express HTTP server             │
│  Job: receive intent, validate, delegate          │
├──────────────────────────────────────────────────┤
│  DOMAIN         — TypeScript business logic       │
│  Job: enforce business rules                      │
├──────────────────────────────────────────────────┤
│  DATA           — PostgreSQL + GitLab API         │
│  Job: persist and retrieve data                   │
└──────────────────────────────────────────────────┘
```

**The architecture rule — stated once, applied everywhere:**

> Every piece of code has a home. The home is determined by what the code *knows about*.
> - Knows about HTTP → API layer
> - Knows about business rules → Domain layer
> - Knows about SQL or the GitLab API → Data layer
> - Knows about the DOM, React, or the user's screen → Presentation layer

A piece of code that knows about two layers is in the wrong place. This rule is not
optional — it is the single decision that prevents the mud from forming.

**SE lens — layered architecture:**
The **layered architecture** pattern gives every module a defined dependency direction:
upward layers depend on downward layers, never the reverse. The presentation layer can
call the API layer; the API layer cannot call the presentation layer. This constraint
makes every layer independently testable: you can test domain logic without a running
Electron window. You can test the API layer without a real database.

**CS lens — separation of concerns:**
Each layer has a single concern — one reason to change. If the checkout UI changes,
only the presentation layer changes. If the checkout rule changes (a file can only be
checked out for 48 hours), only the domain layer changes. These are independent
reasons to change; keeping them in separate layers means changes are localised.

---

## Step 2 — Create the Project

### The problem

Before writing code, we need a project directory, a version control repository, and
a `package.json` file. These three things are the foundation every lesson builds on.

### Create the project directory

Open a terminal. Navigate to wherever you keep your projects:

```
mkdir vault
cd vault
```

**`mkdir` and `cd` — if this is your first time:**
`mkdir name` creates a new directory. `cd name` moves the terminal into that directory.
All subsequent commands run inside `vault`. The terminal shows your current directory
in its prompt — verify it shows `vault` before continuing.

### Initialise git

```
git init
git branch -M main
```

**Git — first appearance:**
**Git** is the most widely used version control system. It records a history of every
change made to a project. You can return to any previous state, see who changed what
and when, and understand why a change was made.

**`git init`:** Creates a hidden `.git` directory that tracks all changes from this
point forward. Every file you create becomes trackable.

**`git branch -M main`:** Renames the default branch to `main`. Older git defaults
to `master`; `main` is the current standard.

Create `.gitignore` at the project root:

```
node_modules/
dist/
.env
*.nc
```

**`.gitignore` — first appearance:**
`.gitignore` lists files that git should never track. `node_modules/` contains
hundreds of thousands of downloaded package files — never commit them (they are
always reproducible by running `npm install`). `dist/` is compiled output,
reproducible by building. `.env` holds secrets — **never commit secrets to git**.

### Create `package.json`

```json
{
  "name": "vault",
  "version": "0.1.0",
  "private": true,
  "main": "dist/main/main.js",
  "scripts": {
    "dev":   "vite build --watch & electron .",
    "build": "vite build",
    "test":  "vitest run"
  },
  "dependencies": {
    "electron": "^31.0.0",
    "express":  "^4.19.0",
    "react":    "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/express":         "^4.17.21",
    "@types/react":           "^18.3.0",
    "@types/react-dom":       "^18.3.0",
    "@vitejs/plugin-react":   "^4.3.0",
    "typescript":             "^5.4.0",
    "vite":                   "^5.3.0",
    "vite-plugin-electron":   "^0.28.0",
    "vitest":                 "^1.6.0"
  }
}
```

**`package.json` — first appearance:**
Every Node.js project has a `package.json` manifest. Key fields:

`"main": "dist/main/main.js"` — this field is read by Electron (not npm). It tells
Electron which JavaScript file to run as the **main process** when the app opens.
We will explain main vs renderer process in step 3.

`"scripts"` — named commands you can run with `npm run scriptName`. The `dev` script
runs two commands: `vite build --watch` (recompiles TypeScript whenever a file
changes) and `electron .` (launches Electron, passing `.` as the project directory
so Electron reads `package.json` to find `main`).

`"&"` in the dev script — runs both commands in parallel in the same terminal session
(Unix/Mac). On Windows, use `concurrently` instead:
```json
"dev": "concurrently \"vite build --watch\" \"electron .\""
```

`"private": true` — prevents accidentally publishing this package to npm.

`"dependencies"` vs `"devDependencies"`:
- `"dependencies"` — packages required at runtime (shipped with the app)
- `"devDependencies"` — packages used only during development (compiler, test runner, build tool)

Electron ships everything — when you package the app in lesson 29, `dependencies`
are bundled with the installer.

**Semantic versioning — first appearance:**
`"^31.0.0"` means "any version ≥31.0.0 and <32.0.0." The `^` (caret) allows
automatic minor and patch updates but not breaking major version changes.

---

## Step 3 — What Electron Is

### The problem

Vault is a desktop application. Web applications run in a browser. Desktop
applications run directly on the OS. How does a TypeScript/React application become
a desktop app?

**Electron — first appearance:**
Electron is a framework that packages a Chromium browser and a Node.js runtime into
a single desktop application. Your TypeScript code runs inside this bundled Chromium
instance — which is why Electron apps look like web apps but run without a browser.

Electron has two types of processes that **always both exist simultaneously**:

**The main process:**
- Runs in Node.js. Has full access to the OS, file system, and native APIs.
- Creates windows (`BrowserWindow`).
- Manages the application lifecycle (startup, shutdown, dock).
- Runs the Express server in Vault.
- There is exactly one main process per Electron app.

**The renderer process:**
- Runs in Chromium. Has access to browser APIs (DOM, `fetch`, `localStorage`).
- Renders the UI — HTML, CSS, React components.
- **Cannot** access the file system directly (this is intentional — explained in the
  security section below).
- There is one renderer process per open window.

**Why two processes?**
Security. Electron renders web content (HTML/CSS/JavaScript). Web content is
untrusted — it might load external scripts, render user-provided content, or be
injected with malicious code. If the renderer had full Node.js access (file system,
network, OS calls), a script injection in the renderer could read your SSH keys, send
files to an attacker, or modify system files. Separating renderer (browser sandbox)
from main (Node.js) means the renderer's power is limited to what a browser can do.

**Security lens — context isolation:**
Electron's **context isolation** further prevents renderer code from accessing
Node.js APIs even if enabled. The renderer lives in a browser context. The main
process lives in a Node.js context. Code that needs Node.js access (file system, IPC)
must live in the main process. The renderer communicates with the main process via
**IPC (Inter-Process Communication)** — a controlled message-passing channel
introduced in lesson 19.

This is the **principle of least privilege** applied to the process architecture:
each process has only the capabilities it needs, and no more.

---

## Step 4 — The Folder Structure

Create the following directory structure. Create the directories with your editor or
terminal (`mkdir -p src/main src/renderer src/api src/domain src/data`):

```
vault/
├── src/
│   ├── main/          ← Electron main process code
│   │   └── main.ts    ← entry point
│   ├── renderer/      ← React UI (runs in renderer process)
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── api/           ← Express routes (runs in main process)
│   ├── domain/        ← Business logic (runs in main process)
│   └── data/          ← Database queries (runs in main process)
├── migrations/        ← SQL migration files
├── index.html         ← Renderer entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Why this folder structure:**
Each folder maps exactly to one layer of the architecture. When you write a new file,
the folder name tells you (and everyone reading the code) which layer it belongs to
and what it is allowed to know about. There is no ambiguity.

`migrations/` is outside `src/` because migration files are SQL, not TypeScript.
They are run once (at database setup or deployment) and never imported by application
code.

**New file at first appearance — the rule:**
Every new file and directory introduced in a lesson is explained: its responsibility,
why it lives where it does, and what would break if it were missing.

---

## Step 5 — TypeScript and Vite Configuration

### Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target":           "ES2022",
    "module":           "ESNext",
    "moduleResolution": "bundler",
    "jsx":              "react-jsx",
    "strict":           true,
    "noUnusedLocals":   true,
    "noUnusedParameters": true,
    "lib":              ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

**TypeScript — first appearance:**
TypeScript is a language that compiles to JavaScript. It adds a **static type system**:
variable types are declared and checked at compile time rather than discovered at
runtime. A JavaScript runtime error "cannot read property 'id' of undefined" becomes
a TypeScript compile error "property 'id' does not exist on type 'undefined'" — caught
before the code runs.

Every field of `tsconfig.json` was introduced in the CAM project. Two fields are new:

`"jsx": "react-jsx"` — tells TypeScript how to compile JSX syntax (the `<Component />`
syntax used in React). `"react-jsx"` uses the modern React 17+ JSX transform, which
does not require `import React from 'react'` at the top of every component file.

**`"strict": true` — what it enables:**
Enables a group of safety checks: `noImplicitAny` (every variable must have a known
type), `strictNullChecks` (null and undefined are not valid values unless declared),
`strictFunctionTypes` (function parameter types are checked precisely). Always enable
strict mode. The type errors it surfaces in early lessons prevent entire categories
of runtime bugs in later lessons.

### Create `vite.config.ts`

```typescript
import { defineConfig }     from 'vite'
import react                from '@vitejs/plugin-react'
import electron             from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/main.ts',
        vite: {
          build: {
            outDir: 'dist/main',
          },
        },
      },
    ]),
  ],
  build: {
    outDir: 'dist/renderer',
  },
})
```

**Vite — recap from CAM project:**
Vite compiles TypeScript on demand and bundles files for production. In an Electron
project, Vite must compile two separate targets: the renderer (React/browser code)
and the main process (Node.js code). `vite-plugin-electron` handles this — it
configures Vite to produce two bundles: one in `dist/renderer/` (browser-compatible)
and one in `dist/main/` (Node.js-compatible).

**Why the main process needs a separate bundle:**
Browser JavaScript and Node.js JavaScript differ significantly. Browser code uses
`fetch`, `window`, and `document`. Node.js code uses `fs`, `path`, and `process`.
The compiler must produce different output for each environment. The `electron`
plugin entry in `vite.config.ts` marks `src/main/main.ts` as a Node.js-target build.

---

## Step 6 — The Main Process

### Create `src/main/main.ts`

```typescript
import { app, BrowserWindow } from 'electron'
import path                    from 'path'
```

**Import explanation:**
`electron` is the Electron package. We import `app` and `BrowserWindow` — the two
objects needed to create and manage an application window.

- `app` — represents the Electron application itself. Manages the lifecycle: startup,
  shutdown, dock badge, menu bar.
- `BrowserWindow` — represents a window. Each window runs its own renderer process.

`path` is a Node.js built-in module. `path.join` builds file paths correctly for the
current OS (using `/` on Mac/Linux, `\` on Windows). We import it here to build the
path to `index.html`.

```typescript
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width:  1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration:  false,
      preload:          path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

**`new BrowserWindow({ ... })` — first appearance:**
`BrowserWindow` is Electron's window. The constructor accepts an options object:

`width` and `height` — the window's initial dimensions in CSS pixels.

`webPreferences` — security settings for the renderer process that lives in this window:

- `contextIsolation: true` — **always set to true**. Context isolation prevents
  renderer code from accessing the Electron/Node.js internals of the preload script.
  Without it, any JavaScript running in the renderer (including injected third-party
  scripts) could call Electron APIs directly.

- `nodeIntegration: false` — **always set to false**. If `true`, Node.js APIs
  (`require`, `fs`, `process`) would be available inside the renderer. An XSS
  attack in the renderer would then have full file system access. Always false.

- `preload: path.join(__dirname, 'preload.js')` — specifies a script that runs
  before the renderer. The preload script is the only place where both Node.js and
  browser APIs are available simultaneously. It is the secure bridge between the
  two processes. We use it in lesson 19 for IPC.

**`__dirname` — first appearance:**
`__dirname` is a Node.js global variable that contains the absolute path of the
directory containing the currently executing file. In `dist/main/main.js`, `__dirname`
is `.../dist/main/`. `path.join(__dirname, 'preload.js')` produces the full path to
`dist/main/preload.js`.

**`process.env.NODE_ENV` — first appearance:**
`process.env` is the Node.js environment variables object. `NODE_ENV` is a
conventional variable that programs use to distinguish development from production.
In development, `NODE_ENV` is `'development'`. In production builds, it is
`'production'`. We use it to load the renderer from Vite's dev server
(`localhost:5173`) in development, or from the compiled file in production.

**`app.whenReady().then(...)` — first appearance:**
`app.whenReady()` returns a Promise that resolves when Electron is ready to create
windows. Electron's initialisation is asynchronous — the window must not be created
until the app is ready. `whenReady` handles this: it resolves immediately if Electron
is already ready, or waits until it is.

**Promise — first appearance:**
A **Promise** is a JavaScript object that represents an asynchronous operation. It
can be in one of three states: **pending** (operation in progress), **fulfilled**
(operation succeeded, with a value), or **rejected** (operation failed, with an
error). `.then(callback)` registers a function to call when the promise fulfils.
`.catch(callback)` handles rejections. Promises are the foundation of all asynchronous
code in Node.js — they replace the older callback pattern.

**`app.on('window-all-closed', ...)` — macOS convention:**
On macOS (`'darwin'`), applications conventionally stay running in the dock even when
all windows are closed. On Windows and Linux, closing the last window typically exits
the app. This listener implements the platform-correct behaviour.

### Create `src/main/preload.ts`

```typescript
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
})
```

**`contextBridge` — first appearance:**
`contextBridge.exposeInMainWorld(name, object)` is the secure way to expose
functionality from the preload script (where Node.js APIs are available) to the
renderer (where they are not). The object passed as the second argument becomes
available as `window.electronAPI` in the renderer. Only what you explicitly expose
is accessible. This is the **principle of least authority** in action: the renderer
only gets exactly what it needs.

We expose `platform` now as a minimal example. Lesson 19 adds IPC channels here.

---

## Step 7 — The Renderer Entry Point

### Create `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline'" />
    <title>Vault</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/renderer/index.tsx"></script>
  </body>
</html>
```

**`Content-Security-Policy` — first appearance:**
The **Content Security Policy (CSP)** is an HTTP header (or `<meta>` tag) that tells
the browser what content is allowed to load. `default-src 'self'` means: by default,
only load resources from the same origin (this app). `script-src 'self' 'unsafe-inline'`
allows scripts from the app itself plus inline scripts (needed for React's dev mode).

CSP prevents **Cross-Site Scripting (XSS)** at the browser level: even if an attacker
injects a `<script src="https://evil.com/steal.js">` into the rendered HTML, the
browser refuses to load it because `evil.com` is not in the allowed script sources.
CSP is the last line of defence against XSS — it should be set in every Electron app
that renders any user-provided content.

### Create `src/renderer/index.tsx`

```typescript
import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'
import App             from './App.js'

const rootElement = document.getElementById('root')
if (rootElement === null) {
  throw new Error('Root element not found in DOM')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**`createRoot` — first appearance in this project:**
`createRoot` from React 18 creates a React root — the container that manages the
component tree. It replaces the older `ReactDOM.render` API. `root.render(<App />)`
mounts the React component tree into `rootElement`.

**`StrictMode` — first appearance:**
`<StrictMode>` is a React developer tool — it has no UI and no effect in production
builds. In development, it activates additional warnings: components that have
side effects in their render function are rendered twice (to surface impurity bugs),
deprecated APIs are flagged, and unexpected state mutations are detected. Always
wrap your app in `<StrictMode>`.

**The null check on `rootElement`:**
`document.getElementById` returns `null` if no element has the given id. TypeScript
requires handling this — `createRoot(null)` would throw. The explicit check with a
clear error message tells the developer exactly what is wrong (the `id="root"` in
`index.html` does not match `'root'` in `index.tsx`).

---

## Step 8 — The First Component

### Create `src/renderer/App.tsx`

```typescript
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <header className="toolbar">
        <span className="app-name">Vault</span>
      </header>

      <main className="content">
        <div className="file-row">
          <span className="file-name">housing-v3.step</span>
          <span className="badge badge--checked-in">Checked In</span>
        </div>
      </main>

      <footer className="status-bar">
        <span>Not connected</span>
      </footer>
    </div>
  )
}
```

**Why the hardcoded file name:**
This lesson produces visible software on day one. The hardcoded `housing-v3.step`
will be replaced with real data in lesson 04. Having something visible now is not
laziness — it validates that the rendering pipeline (Electron → Chromium → React →
DOM) is working before adding complexity.

### Create `src/renderer/App.css`

```css
:root {
  --colour-background:    #0f172a;
  --colour-surface:       #1e293b;
  --colour-border:        #334155;
  --colour-text:          #e2e8f0;
  --colour-text-muted:    #94a3b8;
  --colour-accent:        #38bdf8;
  --colour-checked-in:    #22c55e;
  --colour-checked-out:   #f59e0b;
  --colour-error:         #ef4444;
  --font-ui:              'Inter', system-ui, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin:     0;
  padding:    0;
}

html, body {
  width:            100%;
  height:           100%;
  background-color: var(--colour-background);
  color:            var(--colour-text);
  font-family:      var(--font-ui);
  font-size:        14px;
}

#root {
  height: 100%;
}

.app-shell {
  display:        flex;
  flex-direction: column;
  height:         100%;
}

.toolbar {
  height:           48px;
  background-color: var(--colour-surface);
  border-bottom:    1px solid var(--colour-border);
  display:          flex;
  align-items:      center;
  padding:          0 16px;
  flex-shrink:      0;
}

.app-name {
  font-weight:  700;
  font-size:    1rem;
  color:        var(--colour-text);
  letter-spacing: 0.05em;
}

.content {
  flex:       1;
  padding:    20px;
  overflow-y: auto;
}

.file-row {
  display:         flex;
  align-items:     center;
  gap:             12px;
  padding:         12px 16px;
  background:      var(--colour-surface);
  border-radius:   6px;
  border:          1px solid var(--colour-border);
}

.file-name {
  flex:        1;
  font-family: monospace;
  font-size:   0.875rem;
}

.badge {
  padding:       3px 10px;
  border-radius: 12px;
  font-size:     0.75rem;
  font-weight:   600;
}

.badge--checked-in {
  background-color: color-mix(in srgb, var(--colour-checked-in) 15%, transparent);
  color:            var(--colour-checked-in);
  border:           1px solid var(--colour-checked-in);
}

.status-bar {
  height:           28px;
  background-color: var(--colour-surface);
  border-top:       1px solid var(--colour-border);
  display:          flex;
  align-items:      center;
  padding:          0 12px;
  font-size:        0.75rem;
  color:            var(--colour-text-muted);
  flex-shrink:      0;
}
```

**`color-mix(in srgb, ...)` — first appearance:**
`color-mix(in srgb, colour1 percentage, colour2)` blends two colours in the sRGB
colour space. `color-mix(in srgb, var(--colour-checked-in) 15%, transparent)` creates
a 15% opacity version of the green badge colour. This is the CSS-native way to create
tinted backgrounds without hardcoding a separate colour variable. `color-mix` is
supported in all modern browsers as of 2023.

---

## Step 9 — Installing and Running

```
npm install
npm run dev
```

**`npm install` — what it does:**
Reads `package.json`, downloads every package listed under `dependencies` and
`devDependencies` from the npm registry, places them in `node_modules/`, and creates
`package-lock.json` to record exact versions. The `node_modules/` directory for an
Electron project is large — several hundred megabytes — because Electron itself
includes a full Chromium browser.

**What you should see when `npm run dev` runs:**
Two things happen simultaneously (because of the `&` in the dev script):
1. Vite starts its dev server, compiles TypeScript, and prints `VITE ready in Xms`
2. Electron launches, opens a window, and loads the React app from Vite's dev server

The window should show: the "Vault" toolbar at the top, "housing-v3.step" with a
green "Checked In" badge in the middle, and "Not connected" in the status bar.

**Common failure: "Cannot find module 'electron'"**
If Electron is not in `node_modules`, the `npm install` step failed or was skipped.
Run `npm install` again. If it still fails with network errors, check your internet
connection.

**Common failure: white blank window**
Open Electron's developer tools (View menu → Toggle Developer Tools, or `Ctrl+Shift+I`
/ `Cmd+Option+I`). The Console tab shows any JavaScript errors from the renderer
process. A missing module or JSX syntax error appears here.

**The Electron Developer Tools — first appearance:**
Electron's developer tools are identical to Chrome's developer tools — the same
panel. They are only available in development builds. Key tabs:
- **Console** — JavaScript errors and `console.log` output from the renderer
- **Network** — all HTTP requests made by the renderer
- **Sources** — browse and debug source files; set breakpoints

---

## Connect the Pieces

The rendering pipeline for this lesson:

```
npm run dev
  ──► Vite compiles src/main/main.ts   → dist/main/main.js
  ──► Vite dev server serves src/renderer/ at localhost:5173
  ──► Electron reads package.json "main" → loads dist/main/main.js
  ──► main.ts calls app.whenReady()
  ──► BrowserWindow.loadURL('http://localhost:5173')
  ──► Chromium renders src/renderer/index.tsx → <App /> → DOM
```

The four-layer folder structure exists but only the presentation layer has code. Each
subsequent lesson adds code to the next layer down:
- Lesson 02: API layer (Express server)
- Lesson 03: Data layer (PostgreSQL connection)
- Lesson 04: Domain layer (TypeScript business types)

---

## What Breaks Without This

**Without `contextIsolation: true`:**
Any JavaScript running in the renderer — including third-party scripts loaded by
React libraries, any user-provided content rendered in the app, or an XSS payload
in a future feature — would have access to Electron's `ipcRenderer` API and could
send arbitrary IPC messages to the main process. The main process trusts IPC
messages, so an attacker who can send IPC messages has main process access. This is
a complete security breach. `contextIsolation: true` is not optional.

**Without `nodeIntegration: false`:**
Same severity: Node.js APIs (file system, network, process execution) would be
available inside the renderer. An XSS in the renderer would be able to read the
user's private key files, execute programs, and exfiltrate data.

**Without the four-layer folder structure:**
Code has no defined home. The first time a developer needs to add a checkout rule,
they have three places to put it: the React component, the API route, or a utility
file. Over time, the same rule ends up in multiple places. Changes to the rule require
finding all copies. This is how the ball of mud forms — not from bad intentions but
from the absence of a structure that answers "where does this code live?"

---

## Definition of Done

- [ ] `npm install` completes without errors
- [ ] `npm run dev` opens an Electron window showing "housing-v3.step" and the badge
- [ ] The badge is green and reads "Checked In"
- [ ] The toolbar shows "Vault" and the status bar shows "Not connected"
- [ ] You can open the Electron developer tools and see no errors in the Console tab
- [ ] You can explain the difference between the main process and the renderer process
- [ ] You can explain why `contextIsolation: true` and `nodeIntegration: false` are required
- [ ] You can explain the four layers and name the one reason each layer can change
- [ ] You can explain what a Promise is and why Electron uses `app.whenReady().then(...)`
- [ ] You can explain the ball-of-mud antipattern and how the folder structure prevents it
- [ ] Run:
      ```
      git add .
      git commit -m "Establish Vault shell: four-layer folder structure, Electron window with hardcoded file, React renderer with CSP header"
      ```

---

*Next: Lesson 02 — The API Layer Skeleton. An Express server starts inside the main
process. The renderer fetches `/api/health` and displays "API: connected." The
two Electron processes communicate for the first time.*
