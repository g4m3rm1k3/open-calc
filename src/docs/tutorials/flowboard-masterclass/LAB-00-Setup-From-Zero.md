# FlowBoard Masterclass — LAB 00 — Setup: From Zero to Running App

**Series:** FlowBoard Masterclass — Learn Software Engineering by Building a Real Product  
**Lab:** 00 of 10  
**Prerequisites:** None. This is the first lab.  
**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. When you run a web app locally, who is serving the files to your browser? Is it the internet, or something on your machine?
> 2. A project folder has files called `package.json`, `tsconfig.json`, and `vite.config.ts`. What do you think each one does?
> 3. You open a `.tsx` file and see HTML-looking tags inside a JavaScript function. What do you think that is and why might it exist?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will have a running FlowBoard app in your browser, served locally from your machine. You will understand exactly what every file in the project does, why it exists, how the pieces connect, and how to verify the whole system is working. Every subsequent lab will build on this foundation — so understanding this deeply is the most important thing you can do.

The app will look minimal right now. That is intentional. A working skeleton is the correct starting point — you cannot build on something that doesn't run.

---

## Concept: What a Local Development Environment Is

**What it is:** A local development environment is a complete system running on your own machine that simulates what happens when a user visits your app in a browser — without publishing anything to the internet.

**The problem before:**

You have source code — TypeScript files, CSS files, HTML. A browser cannot run TypeScript. It cannot understand modern JavaScript module syntax the way you write it. It needs plain JavaScript, already assembled, already linked. How does your source code become something a browser can run?

**The solution:** A build tool. In this project, that tool is **Vite**. Vite does two jobs:

1. **Development mode:** Watches your files, converts TypeScript to JavaScript on the fly, and serves the result to your browser over a local network address (`http://localhost:5173`). Every time you save a file, Vite instantly updates the browser — no manual refresh needed. This is called Hot Module Replacement (HMR).

2. **Production build:** When you're ready to deploy, Vite compiles and bundles everything into plain HTML, CSS, and JavaScript files that any web host can serve.

In this series, we only use development mode. Production deployment is a separate topic.

**The full picture of what happens when you run `npm run dev`:**

```
Your .tsx/.ts files
        ↓
    Vite reads them
        ↓
    TypeScript compiler checks types (reports errors if any)
        ↓
    Vite converts TypeScript → JavaScript
        ↓
    Vite starts a local HTTP server on port 5173
        ↓
    You open http://localhost:5173 in your browser
        ↓
    Browser requests files → Vite serves them → App appears
        ↓
    You edit a file → Vite detects the change → Browser updates instantly
```

**What `localhost` means:** `localhost` is a special hostname that always means "this machine". Port `5173` is just the door number — like an apartment number in a building. `http://localhost:5173` means: "connect to a server running on this machine, at door 5173." Vite opens that door when you run `npm run dev`.

**What `npm` is:** Node Package Manager. It manages the libraries your project depends on (React, TypeScript, Vite, etc.), stores them in `node_modules/`, and provides commands like `npm run dev` to start the dev server.

---

## Concept: The Project File Structure

**What it is:** A map of every file and folder in the project, what it does, and what type of file it is.

Before writing any code, you need to know where everything lives and why. Files in the wrong place don't work. Concepts in the wrong file create confusion that compounds over time.

**The top-level structure:**

```
flowbard/
├── index.html              ← The single HTML page the browser loads
├── package.json            ← Project manifest: name, dependencies, scripts
├── package-lock.json       ← Exact versions of every installed package (auto-generated)
├── tsconfig.json           ← TypeScript configuration (root)
├── tsconfig.app.json       ← TypeScript configuration (app source)
├── tsconfig.node.json      ← TypeScript configuration (build tools)
├── vite.config.ts          ← Vite configuration
├── eslint.config.js        ← ESLint (code quality checker) configuration
├── public/                 ← Static files served as-is (images, fonts, favicons)
│   └── vite.svg
└── src/                    ← All your application source code lives here
    ├── main.tsx            ← Entry point: mounts React into index.html
    ├── App.tsx             ← Root component: the top of your component tree
    ├── App.css             ← Styles for the App component
    ├── index.css           ← Global styles (applied to the whole page)
    └── assets/             ← Images and other assets imported by components
        └── react.svg
```

**The rule:** Application code goes in `src/`. Configuration goes at the root. Static assets go in `public/` or `src/assets/`. This isn't arbitrary — Vite only processes files under `src/`. Files in `public/` are copied as-is without processing. Files at the root are configuration that tools (TypeScript, Vite, ESLint) read directly.

---

## Concept: File Types in This Project

**What it is:** An explanation of each file extension you'll encounter and what role it plays.

### `.html` — HyperText Markup Language

The only HTML file in the project is `index.html` at the root. It is the shell that the browser loads first. It contains almost nothing — just a `<div id="root"></div>` where React will inject your app, and a `<script>` tag that loads `src/main.tsx`. React replaces the contents of `#root` with your component tree. You will rarely edit `index.html`.

### `.tsx` — TypeScript + JSX

This is the most important file type in the project. `.tsx` files contain TypeScript code that includes JSX — an extension to JavaScript that lets you write HTML-like syntax directly inside your functions.

```tsx
// This is valid TypeScript + JSX (.tsx file)
function Greeting() {
  const name = "FlowBoard"
  return <h1>Welcome to {name}</h1>
  //     ↑ looks like HTML but it's JSX — Vite converts it to JS
}
```

JSX is not magic — Vite compiles `<h1>Welcome to {name}</h1>` into `React.createElement("h1", null, "Welcome to ", name)` before the browser ever sees it. JSX is just a readable shorthand for function calls that create UI elements.

**Rule:** Any file that contains JSX must have the `.tsx` extension (not `.ts`). Files with only TypeScript logic and no UI use `.ts`.

### `.ts` — TypeScript

Pure TypeScript, no JSX. Used for utility functions, type definitions, configuration helpers — any code that is logic only, no UI.

### `.css` — Cascading Style Sheets

Plain CSS. Imported directly into `.tsx` files:

```tsx
import "./App.css"    // applies these styles when this component is loaded
```

Vite handles CSS imports. When you import a CSS file in a component, Vite injects those styles into the page automatically. In this project we use plain CSS; later labs can introduce CSS Modules or other approaches.

### `.json` — JavaScript Object Notation

Configuration files. `package.json` and `tsconfig.json` are the most important. You read these but usually don't write them by hand — tools manage them.

### `vite.config.ts` — Vite Configuration

A TypeScript file that configures how Vite behaves — which plugins to use, which port to serve on, how to resolve imports. You will not edit this in the early labs.

---

## Concept: How the Code Connects — The Execution Path

**What it is:** A precise description of how the browser goes from a URL to your running React app, tracing every file involved.

This is the single most important mental model for working in this codebase. When something breaks, knowing this path tells you exactly where to look.

**Step 1: Browser requests `http://localhost:5173`**

Vite responds with `index.html`. The browser parses it and finds:

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

**Step 2: Browser requests `/src/main.tsx`**

Vite intercepts this request. It compiles `main.tsx` from TypeScript to JavaScript and serves the result. `main.tsx` contains:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**What each line does:**
- `import React` — loads the React library (required for JSX to work)
- `import ReactDOM` — loads React's DOM renderer (the part that writes to the browser's HTML)
- `import App from './App.tsx'` — loads your root component
- `import './index.css'` — injects global styles into the page
- `ReactDOM.createRoot(...)` — finds the `<div id="root">` in `index.html`
- `.render(<App />)` — renders your `App` component into that div, replacing its contents

**Step 3: `App.tsx` is loaded**

`App` is a function that returns JSX. React calls it, gets back a description of the UI, and writes the actual DOM elements to the page.

**The connection map:**

```
index.html
    └── loads src/main.tsx
            ├── imports ./App.tsx       ← your root component
            ├── imports ./index.css     ← global styles
            └── mounts App into #root

App.tsx
    ├── imports ./App.css               ← component styles
    └── returns JSX → React renders it into the DOM
```

Every component you create in later labs will be imported into this tree somewhere. If a component is not imported anywhere in this chain, it will never appear on screen. This is the single most common reason a component "doesn't show up" — it was created but never connected.

---

## Step 1 — Verify Node and npm Are Installed

Open a terminal. In VSCode: `` Ctrl+` `` on Windows.

```
node --version
```

**Expected:** A version number like `v20.11.0` or higher. If you see "command not found", install Node.js from [nodejs.org](https://nodejs.org) — download the LTS version.

```
npm --version
```

**Expected:** A version number like `10.2.0` or higher.

### SAVE AND TRY

If both commands print version numbers, your environment is ready. If either fails, install Node.js before continuing. Everything in this series depends on it.

---

## Step 2 — Navigate to the Project and Install Dependencies

In the terminal, navigate to the `flowbard` folder:

```
cd "c:\Users\g4m3r\Documents\testing tutorials\cadcam\flowboard-masterclass\flowbard"
```

Then install dependencies:

```
npm install
```

**What this does:** Reads `package.json`, downloads every listed dependency from the npm registry, and stores them in `node_modules/`. This step is required once after cloning or creating the project. If `node_modules/` already exists and is complete, `npm install` verifies it and exits quickly.

**Expected output:** A progress log ending with something like:
```
added 243 packages in 12s
```

No `npm ERR!` lines. If you see errors, the most common cause is a bad network connection — try again.

**What `node_modules/` is:** A folder containing the source code of every library your project depends on. It can be hundreds of megabytes. It is listed in `.gitignore` because it is always regenerated from `package.json` — you never commit it to version control.

### SAVE AND TRY

After `npm install` completes, run:

```
dir node_modules
```

You should see a long list of folder names — one per installed package. If the folder is empty or missing, `npm install` did not complete successfully.

---

## Step 3 — Start the Development Server

```
npm run dev
```

**Expected output:**

```
  VITE v6.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Now open your browser and go to `http://localhost:5173`.

**Expected:** The default Vite + React page — a Vite logo, a React logo, a counter button, and "Vite + React" as a heading.

This confirms:
- Node and npm are working
- Dependencies are installed
- Vite is running and serving files
- React is mounted and rendering

### SAVE AND TRY

With the server running, open `src/App.tsx` in VSCode. Find the `<h1>` tag and change the text inside it. Save the file. Watch the browser — it should update instantly without you refreshing. If it does, Hot Module Replacement is working. This is how you will develop for the rest of the series.

---

## Step 4 — Read Every File

Do not skip this step. Open each file and read it. You will not understand every line — that is fine. The goal is to build a mental map so you know where to look when you need to.

**`index.html`** — Read the `<div id="root">` and the `<script>` tag. Everything else is boilerplate.

**`src/main.tsx`** — Read the `ReactDOM.createRoot` call. This is where your app starts.

**`src/App.tsx`** — Read the component function. Notice it returns JSX. Notice the `useState` import — we'll cover that in a later lab.

**`src/App.css`** and **`src/index.css`** — Skim these. Note which one has global resets (`index.css`) and which has component-specific styles (`App.css`).

**`package.json`** — Find the `scripts` section. Note `dev`, `build`, and `preview`. Note the `dependencies` (React) and `devDependencies` (TypeScript, Vite, ESLint).

**`tsconfig.app.json`** — Find `"strict": true`. This means TypeScript's strictest type checking is on. You will encounter type errors — that is intentional and correct.

### SAVE AND TRY

After reading, answer these without looking:
1. Which file mounts React into the HTML?
2. Which file is the root component?
3. Which file do you edit to change global styles?
4. Where do new component files go?

If you can answer all four, you have the mental map you need.

---

## Concept: Where New Code Lives

**What it is:** The rule for where to create files as the project grows.

This is the question you will ask most often: **where does this code go?**

| What you're creating | Where it goes | Extension |
|---|---|---|
| A new UI component | `src/components/ComponentName.tsx` | `.tsx` |
| Styles for that component | `src/components/ComponentName.css` | `.css` |
| A type definition shared across files | `src/types/` | `.ts` |
| A utility function (pure logic, no UI) | `src/utils/functionName.ts` | `.ts` |
| Mock data or constants | `src/data/` | `.ts` |
| Global styles | `src/index.css` | `.css` |

**The `src/components/` folder does not exist yet.** You will create it in Lab 01 when you write your first component. Folders are created as needed, not up front.

**How a new component connects to the app:**

Creating a file is not enough. To make a component appear on screen, you must:

1. Create the file: `src/components/Card.tsx`
2. Write and export the component function
3. Import it in the parent: `import Card from './components/Card'`
4. Use it in JSX: `<Card />`

If any step is missing, the component does not appear. This pattern repeats for every component you ever write.

---

## Step 5 — Stop and Restart the Server

Press `Ctrl+C` in the terminal to stop the dev server. Then start it again:

```
npm run dev
```

Open the browser. The app should appear exactly as before. This confirms the server can be stopped and restarted cleanly — which you will do whenever you need to install new packages or reset state.

---

## Final Check

| Checkpoint | How to verify |
|---|---|
| Node installed | `node --version` prints a version number |
| npm installed | `npm --version` prints a version number |
| Dependencies installed | `node_modules/` folder exists and is populated |
| Dev server starts | `npm run dev` shows the localhost URL |
| App loads in browser | `http://localhost:5173` shows the React app |
| HMR works | Editing `App.tsx` updates the browser without refresh |
| Can stop/start server | `Ctrl+C` stops it; `npm run dev` starts it again |
| File structure understood | Can name where components, styles, and utilities live |

---

## Quick Check Answers

**1. Who is serving the files to your browser?**

Vite — a local HTTP server running on your machine, started by `npm run dev`. It listens on `localhost:5173` and serves your compiled TypeScript to the browser. The internet is not involved during development.

**2. What do `package.json`, `tsconfig.json`, and `vite.config.ts` do?**

`package.json` is the project manifest — it declares the project name, the scripts you can run (`npm run dev`, etc.), and the libraries the project depends on. Running `npm install` reads this file and downloads those libraries.

`tsconfig.json` tells the TypeScript compiler how to check your code — which strictness rules to enforce, which files to include, which JavaScript features to target.

`vite.config.ts` tells Vite how to behave — which plugins to use, how to handle imports, which port to use. You configure the build tool here without touching your application code.

**3. HTML-looking tags inside a JavaScript function?**

That is JSX — JavaScript XML. It is a syntax extension that lets you describe UI structure directly inside a function. Vite compiles it to `React.createElement(...)` calls before the browser sees it. The browser only ever receives plain JavaScript — it never sees JSX. JSX exists because writing `React.createElement("div", null, React.createElement("h1", null, "Hello"))` for every piece of UI would be unreadable. JSX is the readable shorthand.

---

## What You Can Build Now

You now have a running React + TypeScript + Vite project and the mental model to navigate it. With only this knowledge you could:

- Edit `App.tsx` to display any static content
- Add global styles in `index.css`
- Create a new `.tsx` file, write a component, import it into `App.tsx`, and see it on screen

You cannot yet: build reusable components with props, manage state, or fetch data. Those are the next labs.

---

## Next Session Prompt

```
Series: FlowBoard Masterclass
Completed: Lab 00 — Setup: From Zero to Running App

What we established:
  - Local dev environment: Node + npm + Vite + React + TypeScript
  - How npm run dev works: Vite compiles TS → JS, serves on localhost:5173
  - Full file structure: index.html, src/main.tsx, src/App.tsx, config files
  - Execution path: index.html → main.tsx → App.tsx → DOM
  - Where new code lives: src/components/, src/utils/, src/data/, src/types/
  - How a new component connects: create → export → import → use in JSX

Key insight: a component that is not imported anywhere never appears on screen.

Lab 01 will cover:
  - What a React component is as an abstraction
  - Props: how data flows into a component
  - TypeScript interfaces: how to define the shape of props
  - Writing a Card component with typed props
  - Where the file lives, how to import it, how to use it

Start Lab 01.
```
 — LAB 00 — React + TypeScript Setup From Zero

Prerequisites: none.

What this lab adds:
- A working React + TypeScript project scaffold from zero
- Full understanding of what generated boilerplate files do
- A verified run loop so later lessons are not magic

Time: 60-90 minutes

---

## What You Will Build

Before:
- No project
- No src folder
- No App component

After:
- A working project that runs in browser
- You can edit a component and see hot reload
- You understand what each core boilerplate file is for

---

Quick Check — answer before reading further:
1. Why does React code not run by itself in a browser without a build tool?
2. What does TypeScript add that plain JavaScript does not?
3. What file is responsible for mounting React into the page?
4. What is the difference between .ts and .tsx?

(Answers at the end)

---

## Concept: Toolchain

What it is:
A toolchain is the set of tools that turn source code into runnable browser code.

The problem before:
React and TypeScript source code are not directly executable by the browser as authored in modern projects.

The solution:
Use Vite + TypeScript + npm scripts to compile and serve the app.

What it hides:
- Hidden complexity: module resolution, JSX transform, TypeScript compile, dev server reload logic
- Protected invariant: source edits produce consistent browser output through one command path

Canonical example:
You write in TypeScript and JSX, but the browser receives JavaScript and HTML it can execute.

Project application:
Your app development loop depends on one command that always runs the same pipeline.

Smallest possible example:
A .tsx component edited in src updates the browser immediately when dev server is running.

Why it matters here:
Without this, every future lesson is brittle.

Constraints:
Node and npm must be installed and available in terminal PATH.

Failure modes:
Wrong Node version or missing npm causes setup commands to fail.

Operational reality:
Teams standardize on one toolchain so everyone can run the same commands.

You will see this again in:
- React projects
- Vue and Svelte projects
- TypeScript backend tooling
- CI pipelines

Watch for:
Running commands in the wrong folder.

---

## Step 1 — Verify Node and npm Exist

Run in terminal:
- node -v
- npm -v

SAVE AND TRY

You should see:
- A Node version string
- An npm version string

If it breaks:
- If command is not found, install Node LTS from nodejs.org, reopen terminal, rerun checks.

Change something:
- Close and reopen terminal and rerun version commands to confirm PATH is stable.

---

## Step 2 — Create the Project

From the folder where you want the project:
- npm create vite@latest my-app -- --template react-ts

Notes:
- my-app is your folder name. You can choose any name.

SAVE AND TRY

You should see:
- A new folder named my-app
- Inside it: package.json, tsconfig files, src folder, index.html

If it breaks:
- If prompt hangs due network: retry command
- If permissions error: run terminal as normal user in a writable directory

Change something:
- Use a different project name once and verify folder name changes only container naming, not behavior.

---

## Step 3 — Install Dependencies

Enter project folder:
- cd my-app

Install:
- npm install

Concept: Dependencies

What it is:
External packages your project needs to run and build.

The problem before:
Source imports packages that are not present locally.

The solution:
npm install resolves and downloads dependencies declared in package.json.

What it hides:
- Hidden complexity: version resolution, package graph installation
- Protected invariant: node_modules matches lockfile resolution

SAVE AND TRY

You should see:
- node_modules created
- package-lock.json created or updated

If it breaks:
- If SSL/proxy issues appear, configure npm proxy settings or use a stable network.

Change something:
- Run npm install again; second run should be fast and report up-to-date state.

---

## Step 4 — Run the Dev Server

Run:
- npm run dev

SAVE AND TRY

You should see:
- Local URL in terminal (often http://localhost:5173)
- Browser page with default Vite React content

If it breaks:
- Port in use: Vite prints alternative port
- Script missing: confirm you are inside project root containing package.json

Change something:
- Keep server running for next step.

---

## Step 5 — Understand the Core Boilerplate Files

Read these files and purpose:

1) index.html
- Browser entry HTML shell
- Contains root mount element where React app is injected

2) src/main.tsx
- React entry point
- Imports React and ReactDOM
- Mounts App component into root element

3) src/App.tsx
- Root application component
- First place you change visible app UI

4) src/vite-env.d.ts
- Type declarations for Vite environment support

5) package.json
- Scripts and dependency manifest
- npm run dev and other commands live here

6) tsconfig.json and tsconfig.app.json
- TypeScript compiler behavior and project type-check rules

SAVE AND TRY

You should see:
- You can explain what each file does in one sentence

Change something:
- Open src/App.tsx and change one heading text
- Save and confirm browser hot reload updates immediately

---

## Step 6 — Explain .ts vs .tsx

Concept: .ts vs .tsx

What it is:
- .ts is TypeScript without JSX
- .tsx is TypeScript with JSX syntax

The problem before:
Using JSX in a .ts file can fail parsing.

The solution:
Use .tsx for React component files that return JSX.

What it hides:
- Hidden complexity: parser mode differences
- Protected invariant: JSX-containing files parse correctly under TypeScript rules

Alternative:
Put everything in .tsx files.
Tradeoff:
Works, but blurs intent and reduces clarity for non-UI modules.

SAVE AND TRY

Experiment:
- Create a utility file as .ts with no JSX and import it into App
- Confirm build passes

Change something:
- Move JSX into .ts intentionally and observe error
- Revert to .tsx

---

## Step 7 — First Controlled Type Error (So TS Is Not Magic)

In App, create a deliberate mismatch:
- assign a number where a string is expected in a typed object

SAVE AND TRY

You should see:
- TypeScript error in editor and/or terminal build diagnostics

Why this matters:
- TypeScript is a design feedback system, not runtime magic

Change something:
- Fix the mismatch and confirm error disappears.

---

## Challenge — Prove Setup Understanding

Task:
1) Change app title text
2) Add one new typed object in App
3) Render one value from that object
4) Intentionally create one type error, then fix it

Success criteria:
- Browser updates after save
- You can cause and fix a type error intentionally

---

## Final Check

- Node and npm commands work
- Vite React TypeScript project created
- Dependencies installed successfully
- Dev server runs and serves page
- Hot reload works after editing App
- You can explain purpose of index.html, main.tsx, App.tsx, tsconfig, package.json
- You understand .ts vs .tsx by example
- You can intentionally trigger and fix one type error

---

## Quick Check Answers

1) Why does React code not run by itself in a browser without a build tool?
Because modern React projects use module imports, JSX, and TypeScript that require transformation and bundling for browser execution.

2) What does TypeScript add that plain JavaScript does not?
It adds static type checking so many shape and contract mistakes are caught before runtime.

3) What file mounts React into the page?
src/main.tsx mounts the root App component into the root element in index.html.

4) Difference between .ts and .tsx?
.ts is for TypeScript without JSX. .tsx is for TypeScript files that contain JSX markup.

---

## What You Can Build Now

You now have a fully working React + TypeScript development environment and a concrete mental model for how source code becomes running UI in the browser. You can create components, run the dev server, verify hot reload, and use type errors as feedback instead of treating the setup as magic. If it works: editing App in src immediately updates the browser, and type mismatches are surfaced before runtime behavior fails.
