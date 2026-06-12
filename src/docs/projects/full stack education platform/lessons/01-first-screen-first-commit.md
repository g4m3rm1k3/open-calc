# Lesson 01 — Your First Screen, Your First Commit

## What You Will Build

One screen with a heading and a button, visible in a web browser at `localhost:8081`.
Nothing more. The goal of this lesson is not to build an impressive app — it is to get
every tool working and understand what each tool does before any feature code is written.
By the end, you will have a running app, a git repository, and a commit explaining why
this state of the project exists.

---

## What You Need to Know First

Nothing. This is the first lesson. Every concept is introduced here from scratch.

---

## The Lesson

### Step 1 — The Terminal

Before writing a single line of code, you need to be comfortable in the terminal — the
text-based interface to your computer.

**What the terminal is:** The terminal (also called the shell, the command line, or the
console) is a program that accepts text commands and runs them. The graphical interface
you normally use (clicking icons, dragging windows) is built on top of the same system
the terminal exposes directly. The terminal is faster for certain tasks and is required
for developer tools that have no graphical interface.

**How to open it:**
- macOS: Press `Cmd+Space`, type `Terminal`, press Enter.
- Windows: Press the Windows key, type `cmd` or `PowerShell`, press Enter.
- Linux: `Ctrl+Alt+T` on most distributions.

**The working directory:** When the terminal opens, you are in a **working directory** —
a folder on your computer. Every command you type runs relative to this directory.
The terminal shows the working directory in the prompt, usually at the left of each
line. `cd path/to/folder` changes the working directory.

**What a path is:** A path is the location of a file or folder. `/Users/alice/projects`
is an **absolute path** (starting from the root of the filesystem). `projects/myapp` is
a **relative path** (relative to wherever you currently are). `..` means "go up one folder."

**What `ls` and `dir` do:**
- macOS/Linux: `ls` lists all files and folders in the current directory.
- Windows: `dir` does the same thing.

### Step 2 — Node.js and npm

**Install Node.js from `nodejs.org`.** The installer also installs npm automatically.

**What Node.js is:** JavaScript was invented to run inside web browsers. Node.js is a
separate program that lets JavaScript run outside the browser — on your computer directly,
as a server, as a build tool. Node.js is a **runtime**: a program that executes your code.
Without Node.js, JavaScript only runs in browsers.

**What npm is:** npm (Node Package Manager) is a tool installed alongside Node.js. It
does two things:
1. Downloads packages — reusable code written by others — and puts them in your project
2. Runs scripts defined in `package.json` (explained below)

npm is a **package manager**, not a runtime. It manages what code you have; Node.js
executes it. These are two separate tools with two separate responsibilities.

**Verify the installation:**
```bash
$ node --version
v20.10.0

$ npm --version
10.2.4
```

The `$` character represents the terminal prompt — you type the part after it.
`node --version` asks Node.js to print its version number and exit. `--version` is
a **flag** — an argument that changes a command's behaviour. The output confirms
Node.js is installed correctly.

### Step 3 — Creating the App

**What Expo is:** Expo is a framework built on top of React Native that makes it easier
to run one codebase on web, iOS, and Android. The framework handles the build configuration
so you do not have to.

**What `npx` is:** `npx` runs a package without installing it globally. `npm install -g expo`
would install Expo globally on your machine. `npx create-expo-app` downloads and runs
`create-expo-app` once, without installing it permanently. This is preferred for project
scaffolding tools because you always get the latest version.

**Run:**
```bash
$ npx create-expo-app@latest codex-edu --template blank-typescript
```

Every argument explained:
- `create-expo-app@latest` — the package to run, pinned to the most recent release
- `codex-edu` — the name of the project directory to create
- `--template blank-typescript` — start with a minimal TypeScript template (no extra screens,
  just what is needed to get running)

**Successful output looks like:**
```
✔ Your project is ready!
  cd codex-edu
  npm run start
```

**What was created:** Expo creates a `codex-edu` directory with:
- `App.tsx` — the entry point (the first file your app runs)
- `package.json` — project metadata and dependency list
- `tsconfig.json` — TypeScript compiler configuration
- `node_modules/` — downloaded packages (several hundred megabytes; do not look through these)

Navigate into the project:
```bash
$ cd codex-edu
```

### Step 4 — `package.json` Explained

Open `package.json`. It is a JSON file (JavaScript Object Notation — a text format for
structured data using key-value pairs, arrays, and nested objects). Every Node.js project
has one.

```json
{
  "name": "codex-edu",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "react": "18.2.0",
    "react-native": "0.74.1"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "typescript": "^5.3.0"
  }
}
```

**`dependencies` vs `devDependencies`:**
- `dependencies` — packages required to run the app (shipped to users). React, Expo, and
  React Native belong here because the app cannot run without them.
- `devDependencies` — packages required to build or test the app, but not to run it.
  TypeScript belongs here because users run the compiled JavaScript, not the TypeScript source.
  The compiler is a developer tool, not a runtime requirement.

**Semantic versioning (`~51.0.0`, `^7.24.0`, `18.2.0`):**
Version numbers follow the pattern `MAJOR.MINOR.PATCH`.
- `~51.0.0` — allow patch updates only (≥51.0.0, <51.1.0). The `~` allows `51.0.1` but
  not `51.1.0`.
- `^7.24.0` — allow minor and patch updates (≥7.24.0, <8.0.0). The `^` allows `7.25.0`
  but not `8.0.0`.
- `18.2.0` — exact version, no flexibility. This is used when a package's authors expect
  exact compatibility with another pinned package.

**Why not just use the latest version of everything?** Breaking changes. Major version
bumps (1.x.x → 2.x.x) are allowed to change the API in ways that break your code. The
version range restricts automatic updates to safe territory.

**`package-lock.json`:** After `npm install`, npm creates `package-lock.json`. This file
records the exact versions of every package installed — not just your direct dependencies
but every package your dependencies depend on. When another developer runs `npm install`,
they get the exact same versions. Without `package-lock.json`, two machines could install
different versions and behave differently. Always commit `package-lock.json`. Never
hand-edit it.

### Step 5 — TypeScript

**What TypeScript is:** TypeScript is a **type system** built on top of JavaScript.
TypeScript adds one thing JavaScript lacks: **types** — rules about what kind of data a
variable can hold. The TypeScript compiler (`tsc`) reads your `.ts` and `.tsx` files,
checks the types, reports any type errors, and then strips the types to produce plain
JavaScript that browsers and Node.js can run.

**Why types matter:** JavaScript is **dynamically typed** — a variable's type is checked
at runtime (when the code runs). TypeScript is **statically typed** — types are checked
at compile time (before the code runs), catching whole categories of error before any user
sees them.

```typescript
// JavaScript: no error until this runs and crashes
function greet(name) {
  return "Hello, " + name.toUpperCase()
}
greet(42) // TypeError at runtime: name.toUpperCase is not a function

// TypeScript: error caught before running
function greet(name: string): string {
  return "Hello, " + name.toUpperCase()
}
greet(42) // TypeScript error: Argument of type 'number' is not assignable to parameter of type 'string'
```

**What the compiler does:** `tsc` is the TypeScript compiler binary. It reads TypeScript
source files, validates types, and outputs JavaScript. Expo/React Native runs the compiler
automatically when you run `npm start`.

**`tsconfig.json`:** The TypeScript compiler reads its configuration from `tsconfig.json`.
The key fields:
- `"strict": true` — enables the full set of strict type checks. The most important:
  `strictNullChecks` (a value cannot be `null` or `undefined` unless explicitly declared
  as such), and `noImplicitAny` (every variable must have a known type, not `any`).
- `"jsx": "react-native"` — tells TypeScript how to compile JSX syntax (the HTML-like
  syntax used in React components). The `react-native` target preserves JSX for the
  React Native transformer to process.

### Step 6 — Writing the First Screen

Replace the contents of `App.tsx` with this:

```typescript
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Codex Education</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
```

**`import` explained:** `import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'`
is a module import. The module `'react-native'` is a package (installed in `node_modules/`
when you ran `npx create-expo-app`). We import four named exports from it:
- `View` — the fundamental container component; renders as a `<div>` on web, as a native
  `UIView` on iOS
- `Text` — the component for displaying text
- `TouchableOpacity` — a pressable area that fades slightly when tapped
- `StyleSheet` — a utility for defining styles

**`export default function App()`:** The `export default` makes this function available
to the rest of the app as its main export. Expo looks for the default export of `App.tsx`
as the entry point — the first thing that runs.

**JSX:** The return value looks like HTML but it is **JSX** — JavaScript XML. JSX is
syntactic sugar (a shorthand) that the TypeScript compiler transforms into function calls:
`<Text>Hello</Text>` becomes `React.createElement(Text, null, "Hello")`. JSX exists
because writing nested `createElement` calls for complex UIs is unreadable.

**`StyleSheet.create()`:** On React Native, styles are JavaScript objects, not CSS.
`StyleSheet.create()` takes a plain object and returns an optimised version that React
Native can process efficiently. The style names (like `container`, `heading`) are just
keys in an object — you choose them.

**CS lens — functions as values:** `App` is a function that returns a tree of components.
Every time React needs to display this component, it calls the function. The return value
describes what to show. This is the **declarative model**: you describe the desired state;
React figures out how to make the screen match that description.

**SE lens — separation of concerns:** Logic (what the app does) and presentation (what
it looks like) are already in separate places. `App` handles structure; `styles` handles
appearance. This separation will matter when the app grows: changing a colour means
touching only the `styles` object.

### Step 7 — Running the App

```bash
$ npm run start
```

`npm run start` reads the `scripts.start` field from `package.json`
(`"start": "expo start"`) and executes it. Expo starts its **development server** —
a local HTTP server on port 8081.

**What the dev server does:** The Expo dev server does two things simultaneously:
1. Serves the app bundle (the compiled JavaScript) to browsers or devices on request
2. Watches for file changes and automatically recompiles and refreshes the browser

**What hot reload is:** When you save a file, the dev server detects the change,
recompiles the changed file, and sends the update to the browser — without requiring
a full page reload. The browser applies the change while the app is still running.
This makes development faster: you see changes instantly.

Press `w` in the terminal to open the web version. Your browser opens to
`http://localhost:8081`. You see the heading and button.

**What `localhost` is:** `localhost` is a special hostname that routes back to your own
machine. `localhost:8081` means "connect to port 8081 on this machine." The Expo dev
server is listening on that port. No traffic leaves your computer.

**What a port is:** A port is a number that routes a network connection to a specific
program on a machine. Multiple programs can run simultaneously on the same computer;
ports distinguish them. Port 8081 is where Expo's dev server listens. If you started
another server on 8081, the second one would fail because the port is already occupied.

### Step 8 — Version Control with Git

**What version control is:** Version control records a history of every change made to
a project. It lets you return to any previous state, understand what changed and why,
and work on two different things simultaneously without them interfering.

For a solo developer, version control is not optional — it is how you recover from mistakes,
understand your own history, and maintain a record of decisions.

**Install Git** from `git-scm.com` if it is not already installed:
```bash
$ git --version
git version 2.43.0
```

**Initialise the repository:**
```bash
$ git init
Initialized empty Git repository in /path/to/codex-edu/.git/
```

`git init` creates a `.git` directory (hidden) in the current folder. This directory
stores the entire history of the project. Without it, Git has no memory of changes.

**The three states of a file:**
1. **Modified** — you changed the file but Git does not know about it yet
2. **Staged** — you have told Git to include this change in the next commit (using
   `git add`)
3. **Committed** — the change is permanently recorded in history

**`.gitignore`:** Create a file named `.gitignore` with this content:

```
node_modules/
.expo/
dist/
*.orig
```

`.gitignore` tells Git which files and directories to ignore. `node_modules/` contains
hundreds of thousands of files. You never commit these — anyone can reproduce them from
`package.json` by running `npm install`. Committing `node_modules` would add gigabytes
to the repository and make every operation slow.

**Staging and committing:**
```bash
$ git add App.tsx package.json package-lock.json tsconfig.json .gitignore
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file: App.tsx
        new file: .gitignore
        new file: package.json
        new file: package-lock.json
        new file: tsconfig.json

$ git commit -m "Bootstrap Expo app with TypeScript — one screen with heading and button"
```

**`git add`** moves files from modified to staged. You are telling Git: "include this
change in the next snapshot."

**`git status`** shows the current state: which files are staged, which are modified
but not staged, which are untracked (new files Git does not know about).

**`git commit`** takes a snapshot of all staged files and stores it permanently.
`-m "..."` provides the commit message inline.

**What a good commit message is:** Not what files changed (Git records that automatically).
Why the change was made. "Bootstrap Expo app with TypeScript — one screen with heading and
button" tells a future reader: this is where the project started, what the initial state
was, and what tools were chosen.

---

## Connect the Pieces

The four tools you installed today have four separate responsibilities:
- **Node.js** — executes JavaScript and TypeScript code outside the browser
- **npm** — manages what packages your project depends on
- **TypeScript** — checks your code for type errors before it runs
- **Git** — records the history of every change

None of these can do each other's job. This is **separation of concerns** at the tooling
level — the same principle that will appear repeatedly inside the code you write.

The `package.json` dependency declarations mirror exactly what will be the **repository
pattern** in Lesson 12: instead of copying library code into your project manually, you
declare what you need and let a tool (npm) manage acquiring it. The same principle applies
at every level of the stack.

The combination of version numbers in `package.json` plus exact versions in
`package-lock.json` is the same **determinism** principle that will appear in the lesson
engine (Lesson 21): a process should produce identical output given identical input,
regardless of when or where it runs.

Every major software project in the world uses a package manager, a compiler or
transpiler, a version control system, and a runtime. The tools are different
(Maven vs npm, Java vs TypeScript, Subversion vs Git) but the roles are identical.

---

## What Breaks Without This

Without `package-lock.json` committed, two developers running `npm install` a week apart
may install different patch versions of a dependency. A bug fixed in version 5.0.1 of a
library appears for one developer but not the other. The bug is real, reproducible on one
machine, and invisible on another. The cause is not in your code. Without `package-lock.json`,
you cannot reason about which version is installed.

Without `.gitignore` excluding `node_modules`, `git add .` stages hundreds of thousands
of files. The first commit is gigabytes. Every subsequent `git status` takes seconds.
`git diff` becomes unusable. The repository never recovers its speed.

---

## Definition of Done

- [ ] `npm run start` opens the app in a browser at `localhost:8081` with a heading and button
- [ ] `git status` shows a clean working directory (all files committed)
- [ ] `node_modules/` does not appear in `git status` or `git log --stat`
- [ ] You can answer: what does `npm install` actually do when you run it?
- [ ] You can answer: what is the difference between `dependencies` and `devDependencies`?
- [ ] You can answer: why is `package-lock.json` committed but `node_modules` is not?
- [ ] You can answer: what is the difference between a runtime and a package manager?
- [ ] `git commit` with a message explaining why this commit exists — not "initial commit"
