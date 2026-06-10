# Codex — Markdown LMS

## Business Requirements Document & Curriculum

**Version:** 1.0
**Date:** June 2026
**Stack:** Electron + React + Express + Monaco Editor + React Markdown
**Shells:** Electron app (primary), Web app (secondary), VSCode extension (phase 3)
**Auth:** None — this application has no login. Auth belongs to a separate project.
**Teaching contract:** Full contract applied — every concept taught at first use.

---

## Part 1 — Business Requirements Document

### 1.1 Problem Statement

Programming curricula written in markdown have a structural flaw: the code blocks
are inert. A student reads a lesson, copies the code into a separate editor, runs
it somewhere else, reads an error somewhere else, and loses the thread of the lesson
entirely. The context switch is the enemy of learning.

The second problem is that most LMS tools are either too heavy (a full learning
platform with video hosting, enrollment, grading, billing) or too light (a static
site generator with no interactivity). Neither is right for a curriculum that is
primarily code.

Codex solves both problems. It reads a folder of markdown files, renders them as
a book with chapters, and replaces every fenced code block that has a language
tag with a live Monaco editor backed by a real code executor. The lesson and the
code live in the same viewport. The student never leaves the page.

### 1.2 System Name

**Codex** — a local-first, markdown-driven, code-executing learning environment.

### 1.3 What Codex Does

- **Reads a content folder.** A folder on disk is a library. A subfolder is a book.
  A markdown file in a subfolder is a chapter. The folder structure is the curriculum.
  Codex reads it at startup and whenever it changes.

- **Renders markdown faithfully.** Headings, paragraphs, bold, italic, blockquotes,
  tables, inline code, horizontal rules — all rendered correctly. LaTeX math
  (inline `$...$` and block `$$...$$`) rendered via KaTeX. No surprises.

- **Injects Monaco editors for code blocks.** Every fenced code block with a
  recognised language tag (` ```python `, ` ```typescript `, ` ```rust `, etc.)
  becomes a Monaco editor. The original code from the markdown file is the
  starting content. The student can edit it freely.

- **Runs the code inline.** A Run button executes the code in the editor. Output
  (stdout, stderr, exit code) appears in an output panel directly below the editor,
  inside the lesson. No separate terminal. No separate window.

- **Supports a wide language set.** Python, JavaScript, TypeScript, C, Rust, Go,
  SQL, and any language added through the executor configuration. Each language has
  its own executor strategy.

- **Resets to the original.** A Reset button returns the editor content to the
  original code from the markdown file. The student can experiment freely and
  always recover the lesson's intended code.

- **Renders math.** LaTeX expressions in markdown are rendered by KaTeX. A lesson
  that teaches a rotation matrix shows the actual matrix, not `\begin{bmatrix}`.

- **Two shells from one core.** The rendering engine, the markdown parser, the
  Monaco integration, and the executor API are all written once in a shared core
  package. The Electron shell and the web app shell both consume the core.

- **File watching.** When a markdown file on disk changes, the chapter re-renders
  automatically. Writing a lesson and reading it in Codex is a live loop — save
  in your editor, see the result immediately.

### 1.4 What Codex Does Not Do (v1.0)

- No authentication or user accounts (that is a separate project)
- No progress tracking or completion state (v2.0)
- No video or audio embedding (v2.0)
- No collaborative editing
- No cloud sync
- No remote code execution (v1.0 is local only — remote sandbox is v2.0)
- No VSCode extension (Phase 3 — after Electron and web are complete)
- No search across the library (v2.0)

### 1.5 The Two Execution Models — Explained

This is the concept the BRD needs to explain before any lesson touches it.

**Local execution** means the code runs as a child process on the same machine
running Codex. When you click Run on a Python block, Codex spawns a `python`
process, pipes your code into it as stdin, captures stdout and stderr, waits for
it to exit, and shows you the output. This is fast, has no infrastructure cost,
and works offline. It requires Python (or the relevant language runtime) to be
installed on the machine.

The risk: the code has access to your file system, your network, and your OS.
For a curriculum you wrote yourself, running on your own machine, this is fine.
You trust the code because you wrote it. This is the v1.0 model.

**Remote execution** means the code is sent to a server that runs it inside a
Docker container — a sandboxed environment that has no access to the host file
system, no network access, and is destroyed after the code finishes. This is safe
for untrusted code (a public LMS where anyone can edit and run code). It requires
a server, adds latency, and costs money to operate.

**Codex v1.0 uses local execution. The executor is an abstraction layer from day
one, so remote execution can be swapped in without changing the editor, the
renderer, or the UI.** This is the strategy pattern: the execution strategy is a
dependency that is injected, not hardcoded. Lesson 14 names this explicitly.

### 1.6 Content Model

The content model is the file system. There is no database.

```
~/my-curriculum/                    ← the library root (user chooses this folder)
  computer-science-foundations/     ← a book
    01-stacks-queues-hashmaps.md    ← a chapter
    02-binary-search-tree.md
    03-virtual-machine.md
  linear-algebra/                   ← another book
    01-vectors.md
    02-matrices.md
  pdm-system/                       ← another book
    01-the-shell.md
    02-the-api-layer.md
```

**Library** — the root folder the user opens. Contains one or more books.
**Book** — a subfolder. Its name becomes the book title (underscores and hyphens
become spaces, numbers are stripped from sort order).
**Chapter** — a markdown file in a book folder. Files are sorted by filename.
Numeric prefixes (`01-`, `02-`) control order and are not displayed in the title.

There are no configuration files, no frontmatter requirements, no YAML headers.
A folder of markdown files is a valid Codex library. This is the zero-friction
design principle: getting your existing curriculum into Codex requires nothing
except pointing Codex at the folder.

### 1.7 The Code Block Contract

A fenced code block becomes a Monaco editor when it has a recognised language tag.

````markdown
```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```
````

This becomes: a Monaco editor pre-filled with that code, a Run button, a Reset
button, and an output panel below. The language tag (`python`) determines which
executor runs the code and which Monaco language mode applies for syntax
highlighting and autocomplete.

A fenced code block with no language tag, or with a tag Codex does not recognise,
renders as a static code block with syntax highlighting only — no editor, no Run
button. This is intentional: not every code block should be editable. Shell
commands, file contents, and output examples should stay static.

**Recognised language tags in v1.0:**
`python`, `javascript`, `typescript`, `c`, `rust`, `go`, `sql`

**Static-only tags** (highlighted but not executable):
`bash`, `shell`, `json`, `yaml`, `toml`, `markdown`, `text`, `plaintext`

The list of recognised tags is configuration, not code. Adding a new executable
language in v2.0 means adding a record to the executor config, not changing
the renderer.

### 1.8 Architecture Overview

Codex has three layers and two shells. The layers are shared across all shells.
The shells are thin wrappers that provide the platform context (file system access,
process spawning, window chrome).

```
┌─────────────────────────────────────────────────────────┐
│  SHELL LAYER                                             │
│  Electron (desktop) · Web app (browser) · VSCode (ext)  │
│  Job: platform APIs, file dialogs, process spawning     │
├─────────────────────────────────────────────────────────┤
│  RENDERER LAYER          │  EXECUTOR LAYER              │
│  React + React Markdown  │  Language runners            │
│  Monaco Editor           │  stdout/stderr capture       │
│  KaTeX                   │  Strategy pattern            │
│  Job: display content    │  Job: run code, return output│
├─────────────────────────────────────────────────────────┤
│  CORE LAYER                                              │
│  Markdown parser · File watcher · Content model         │
│  Job: read the file system, parse content, watch changes│
└─────────────────────────────────────────────────────────┘
```

**Why this shape?**

The renderer layer never spawns processes. It does not know whether it is running
in Electron or a browser. It calls `executor.run(language, code)` and gets back
`{stdout, stderr, exitCode}`. That is the entire interface.

The executor layer never touches the DOM. It does not know about Monaco editors
or React components. It receives code as a string and returns output as a string.

The core layer never knows about rendering or execution. It reads files, parses
markdown, watches for changes, and emits events. That is all.

This separation means: the web app shell cannot spawn child processes (browsers
cannot do that). So in the web app, the executor layer calls a small Express API
server instead. The renderer layer does not change at all. The strategy swap is
one line.

### 1.9 The Monaco + Markdown Integration

This is the central technical decision of the project and deserves its own section.

React Markdown renders a markdown string as React elements. By default, a fenced
code block becomes a `<pre><code>` element. React Markdown's component override
system lets you replace that default renderer with any React component.

Codex's code block override receives the language tag and the code content.
It decides: is this language in the executable set? If yes, render a `CodeBlock`
component (Monaco editor + Run button + output panel). If no, render a
`StaticCodeBlock` component (syntax-highlighted `<pre><code>`).

```
markdown string
    ↓
React Markdown (parses to React elements)
    ↓
code block node detected
    ↓
custom component override called with { language, code }
    ↓
language in executable set?
    ├── yes → <CodeBlock> (Monaco + Run + Output)
    └── no  → <StaticCodeBlock> (highlighted pre/code)
```

This is the adapter pattern: React Markdown's plugin system is the adapter point
where Codex inserts its own behaviour without forking or modifying the library.
Lesson 08 names and explains this pattern.

### 1.10 Libraries and What Each One Does

Every library in this project is taught at first use. This section is the master
reference — the BRD names each library so the lessons know what to explain.

| Library                | What it does                                                              | Why this one                                                  |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `react-markdown`       | Parses a markdown string and renders React elements                       | The standard; has a component override API we depend on       |
| `@monaco-editor/react` | Embeds the Monaco editor (the VS Code editor engine) as a React component | The only production-quality embeddable code editor            |
| `katex`                | Renders LaTeX math to HTML                                                | Faster than MathJax; works without a server                   |
| `remark-math`          | Teaches react-markdown to find `$...$` and `$$...$$` syntax               | The remark plugin ecosystem is how react-markdown is extended |
| `rehype-katex`         | Renders the math nodes KaTeX finds as HTML                                | Works with remark-math as a pair                              |
| `remark-gfm`           | GitHub Flavoured Markdown — tables, strikethrough, task lists             | The standard markdown dialect; your lessons likely use it     |
| `chokidar`             | File system watcher                                                       | The standard Node.js file watcher; used by Vite internally    |
| `shiki`                | Syntax highlighting for static code blocks                                | Tree-sitter based; supports every language; used by VS Code   |
| `electron`             | Desktop shell                                                             | Chosen in the PDM project; consistent toolchain               |
| `vite`                 | Build tool and dev server                                                 | Consistent with the PDM project toolchain                     |

### 1.11 Project Structure

```
codex/
  packages/
    core/           ← markdown parsing, file watching, content model
    renderer/       ← React components, Monaco integration, KaTeX
    executor/       ← language runners, strategy pattern
  apps/
    electron/       ← Electron shell (main process + preload)
    web/            ← Express server + Vite web app
  extension/        ← VSCode extension (Phase 3, not in v1.0)
```

This is a monorepo — one git repository containing multiple packages that depend
on each other. The tool that manages this is npm workspaces. The reason: the core,
renderer, and executor packages are shared between the Electron app and the web app.
Without a monorepo, keeping them in sync requires publishing to npm or copying code.
With a monorepo, `import { parseLibrary } from '@codex/core'` works in both shells.

---

## Part 2 — Curriculum

### Structure

Five phases. Each phase ends with something fully working. Every lesson ends with
something you can run and see.

**Phase 1 — The Shell (Lessons 01–05)**
An Electron window opens and displays a hardcoded markdown string, correctly rendered.
Every tool, every library, every configuration file is installed and explained.

**Phase 2 — The Library (Lessons 06–09)**
The user opens a folder. Codex reads it, builds the book/chapter tree, and displays
it in a sidebar. Clicking a chapter renders its markdown. File watching reloads
changed chapters automatically.

**Phase 3 — Code Blocks (Lessons 10–14)**
Fenced code blocks become Monaco editors. Syntax highlighting works. The Run button
exists. Nothing runs yet — the executor is a stub that returns hardcoded output.

**Phase 4 — Code Execution (Lessons 15–21)**
Real code runs. Python, JavaScript, TypeScript, C, Rust, Go, SQL — each language
gets its own executor. stdout, stderr, and exit codes are displayed. The strategy
pattern is implemented so adding a new language is one file.

**Phase 5 — The Web Shell and Polish (Lessons 22–28)**
The web app shell is built using the same core, renderer, and executor packages.
Math rendering (KaTeX) is added. File watching is wired up. The Electron app gets
polish: keyboard shortcuts, zoom, theme switching, window state persistence.

---

### Phase 1 — The Shell

---

#### Lesson 01 — The Monorepo

**What you will build:**
A working monorepo with three empty packages (`core`, `renderer`, `executor`) and
one empty app (`electron`). Running `npm run dev` in the root starts the Electron
app and shows a white window with the text "Codex". Every tool is installed and
explained. The project is committed to git.

**CS concepts introduced:** None yet — this lesson is all environment.
**SE concepts introduced:** Monorepo, workspaces, the difference between a package
and an application, separation of concerns at the package level.
**Tools introduced:** npm workspaces, Electron, Vite, TypeScript, git (recap from
PDM or first introduction if this is your first project).

**Sections:**

1. What a monorepo is — one repository, multiple packages, shared dependencies.
   Why this project uses one (the renderer is shared between Electron and web).
2. npm workspaces — what the `workspaces` field in the root `package.json` does,
   how npm resolves imports between packages, what hoisting means.
3. The `packages/` vs `apps/` distinction — a package is a library (it exports
   things). An app is a runnable shell (it imports things and runs them).
4. Setting up the folder structure — creating every directory, explaining every
   `package.json` field.
5. Installing Electron and Vite — what each does (Electron recap if covered in PDM,
   first explanation if not).
6. The root `package.json` scripts — `dev`, `build`, `test` — what each runs
   across all packages simultaneously.
7. The white window — the minimal Electron main process, the minimal renderer,
   "Codex" on screen.
8. `.gitignore` for a monorepo — `node_modules` at the root, build outputs.
9. Definition of done: `npm run dev` shows the Electron window, first commit made.

---

#### Lesson 02 — Rendering Markdown

**What you will build:**
The renderer package gets its first component: `<MarkdownRenderer>`. It accepts a
markdown string as a prop and renders it as HTML. A hardcoded markdown string
(headings, paragraphs, bold, a code block) is passed into it from the Electron
shell. The rendered output is visible in the window.

**CS concepts introduced:** The DOM as a tree, React's virtual DOM.
**SE concepts introduced:** Component design — a component accepts data as props
and renders UI. The renderer package has one job: turn content into UI.
**Tools introduced:** React, `react-markdown`, JSX, props, the concept of a React
component.
**Libraries introduced:** `react-markdown` — what it does, how it parses markdown,
what it returns.

**Sections:**

1. What React is — a library for building UI as a tree of components. The virtual
   DOM: React keeps an in-memory copy of the DOM and only updates what changed.
2. JSX — what it is (syntax sugar for `React.createElement`), why it looks like HTML
   but isn't, what the compiler does to it.
3. Props — how a component receives data from its parent. The type of the prop.
4. Installing `react-markdown` — what it does, what it expects, what it returns.
5. The `<MarkdownRenderer>` component — the simplest possible implementation.
6. Passing a hardcoded markdown string from the Electron shell to the renderer.
7. Reading the output: what renders correctly, what does not yet (code blocks,
   math — those are later).
8. `remark-gfm` — what GitHub Flavoured Markdown adds (tables, strikethrough,
   task lists), installing and wiring it up.
9. Definition of done: headings, paragraphs, bold, italic, tables visible in window.

---

#### Lesson 03 — Syntax Highlighting for Static Code Blocks

**What you will build:**
Static fenced code blocks (those without executable language tags) render with
full syntax highlighting. The `<MarkdownRenderer>` component override system is
introduced. A Python block, a TypeScript block, and a bash block all highlight
correctly.

**CS concepts introduced:** Abstract syntax trees (the markdown parse tree),
visitor pattern (how component overrides work).
**SE concepts introduced:** The component override as an extension point — modifying
behaviour without forking the library. The adapter pattern, named here.
**Libraries introduced:** `shiki` — what it is, how tree-sitter grammar works,
why it supports every language without configuration.

**Sections:**

1. The react-markdown component override API — `components` prop, what it receives,
   what it must return.
2. What the markdown parse tree looks like — the `code` node, its `className` prop
   (which contains the language tag), its `children` (the code string).
3. How to extract the language from `className` — the `language-python` convention.
4. Installing shiki — what it is, what tree-sitter grammars are (briefly — A2 covers
   ASTs in depth, this lesson only needs enough to use shiki).
5. The `<StaticCodeBlock>` component — receives language and code, returns
   highlighted HTML.
6. Async initialisation — shiki loads grammar files asynchronously. How to handle
   this in React (`useState`, `useEffect`, loading state).
7. Definition of done: all static code blocks highlight correctly for all languages.

---

#### Lesson 04 — The Content Model in the Core Package

**What you will build:**
The core package gets its content model: TypeScript types for `Library`, `Book`,
and `Chapter`. A hardcoded `Library` object (no file system yet) is passed through
the shell to the renderer. The sidebar shows the book and chapter titles.

**CS concepts introduced:** Type hierarchies, tree-shaped data.
**SE concepts introduced:** The content model as a first-class design artifact —
defined in the core package, used everywhere else. No file system yet because the
type should be designed before it is populated.
**Tools introduced:** TypeScript interfaces, the `@codex/core` import path via
workspaces.

**Sections:**

1. What the core package is for — pure business logic, no UI, no file system yet.
2. The `Library`, `Book`, `Chapter` types — every field, every decision.
3. Why `Chapter` holds a `path` (a file system path) and `content` separately —
   the path is the identity, the content is loaded on demand.
4. Importing from `@codex/core` in the renderer — how workspace package resolution
   works, what `main` in `package.json` means.
5. The hardcoded library passed as a prop to a new `<Sidebar>` component.
6. The `<Sidebar>` component — books as sections, chapters as list items.
7. Definition of done: sidebar shows two hardcoded books with chapters, clicking
   a chapter (does nothing yet) without errors.

---

#### Lesson 05 — Phase 1 Review: The Data Flow

**What you will build:**
A review lesson. The student traces data from a hardcoded `Library` object, through
the Electron main process, across the IPC bridge, into the renderer, through the
`<Sidebar>`, into `<MarkdownRenderer>`, to the visible output. Every step is made
explicit. The architecture diagram is written and committed.

**SE concepts introduced:** IPC in Electron (main process cannot touch the DOM;
renderer cannot touch the file system — IPC is the bridge). The preload script as
a security boundary.
**Security introduced:** Context isolation — why the renderer runs in a sandboxed
context and cannot call Node.js APIs directly. The preload script exposes a
controlled API surface. This is the principle of least privilege applied to the
process model.

**Sections:**

1. IPC recap — what it is, why Electron requires it, the `ipcMain`/`ipcRenderer`
   pair, the preload script.
2. The preload script as a security boundary — `contextBridge.exposeInMainWorld`
   and why only specific, named functions are exposed.
3. Tracing the data flow in full — the student writes this themselves.
4. What would break if the renderer could call Node.js directly (concrete attack:
   a malicious markdown file containing a script tag that calls `fs.rmdir`).
5. Definition of done: the architecture document is written and committed.

---

### Phase 2 — The Library

---

#### Lesson 06 — Opening a Folder

**What you will build:**
A button in the Electron app opens a native folder picker dialog. The selected
folder path is sent to the main process. The main process reads the top-level
subdirectories and returns their names. The sidebar updates to show the real
folder names.

**CS concepts introduced:** Asynchronous programming, promises, async/await.
**SE concepts introduced:** IPC as the boundary between file system concerns and
UI concerns — the renderer requests a folder open, the main process does the work.
**Tools introduced:** Electron's `dialog.showOpenDialog`, `fs.readdir`,
`path.join` — each explained fully.

**Sections:**

1. What a file system dialog is — the OS provides this, Electron wraps it.
2. `dialog.showOpenDialog` — what it returns, the `properties` field, what
   `openDirectory` means.
3. Promises and `async/await` — what they are, why file system operations are
   async (the OS call may take time), the `await` keyword.
4. `fs.readdir` — what it returns, the `withFileTypes` option, `Dirent` objects.
5. `path.join` — what it does, why string concatenation is wrong for paths
   (different separators on Windows vs macOS/Linux).
6. Sending the result back to the renderer via IPC.
7. Updating the sidebar with real folder names.
8. Definition of done: clicking "Open Library" shows a folder dialog, selecting
   a folder shows its subfolders in the sidebar.

---

#### Lesson 07 — Building the Full Library Tree

**What you will build:**
The `parseLibrary` function in the core package reads a library root folder and
returns a fully populated `Library` object — books with chapters, chapter titles
derived from filenames, sorted correctly. The sidebar shows the complete tree.

**CS concepts introduced:** Recursive directory traversal, string manipulation,
sort functions.
**SE concepts introduced:** Pure functions — `parseLibrary` takes a path and
returns a value. It does not emit events, modify state, or cause side effects.
This makes it trivially testable.
**Tools introduced:** `fs.promises` (the async version of the Node.js fs module),
`Array.sort` with a comparator function.

**Sections:**

1. Why `parseLibrary` lives in the core package, not the Electron shell — it is
   logic, not platform code. The web shell will also call it.
2. `fs.promises` vs `fs` — why the promise-based API is preferred over callbacks.
3. Reading markdown files — `fs.readdir` to find `.md` files, filtering by
   extension.
4. Deriving a chapter title from a filename — stripping numeric prefixes,
   replacing hyphens with spaces, capitalising. String methods explained:
   `replace`, `split`, `join`, `charAt`, `toUpperCase`.
5. Sorting chapters — the `Array.sort` comparator, what it returns, why the default
   sort is wrong for filenames with numbers.
6. Building the `Library` object and returning it.
7. Calling `parseLibrary` from the Electron main process via IPC.
8. Definition of done: opening a real curriculum folder shows the complete book
   and chapter tree.

---

#### Lesson 08 — Loading and Rendering a Chapter

**What you will build:**
Clicking a chapter in the sidebar loads the markdown file from disk and renders
it in the main panel. The chapter content is loaded on demand, not all at once
at startup.

**CS concepts introduced:** Lazy loading — loading data only when it is needed.
**SE concepts introduced:** The adapter pattern (named and explained) — the
sidebar does not know how content is loaded, it calls `onChapterSelect(chapter)`
and the shell handles it. The component does not own the data-fetching concern.

**Sections:**

1. Lazy loading — why we do not read all markdown files at startup (a large library
   could have hundreds of files; reading all of them wastes memory and startup time).
2. The adapter pattern — the `onChapterSelect` callback as an abstraction. The
   sidebar calls it; the shell provides the implementation. The component and the
   data source are decoupled.
3. `fs.readFile` — reading a file as a UTF-8 string.
4. React state for the currently selected chapter — `useState` with a `Chapter | null`.
5. Conditional rendering — showing a "select a chapter" placeholder when no chapter
   is selected.
6. Definition of done: clicking any chapter renders its full markdown content.

---

#### Lesson 09 — File Watching

**What you will build:**
When a markdown file on disk changes, the chapter re-renders automatically in
Codex. Saving a file in your text editor updates the rendered view within
milliseconds. This is the live editing loop.

**CS concepts introduced:** Events, the observer pattern (the watcher observes
the file system and notifies listeners), debouncing.
**SE concepts introduced:** The observer pattern named and placed in the codebase —
the file watcher is an event emitter, the main process is a listener.
**Libraries introduced:** `chokidar` — what it does, why it is better than Node's
built-in `fs.watch`, what events it emits.

**Sections:**

1. The observer pattern — an object (the subject) maintains a list of observers
   and notifies them when its state changes. The file system is the subject; the
   watcher is the observer. This is the same pattern as event listeners in the
   browser DOM.
2. `chokidar` — why the built-in `fs.watch` is unreliable (platform differences,
   missing events on macOS), what chokidar normalises.
3. Setting up the watcher on the library root folder.
4. The `change` event — which file changed, when.
5. Sending a file-changed IPC event to the renderer.
6. The renderer reloading the chapter if the changed file is the current chapter.
7. Debouncing — what it is (delaying an action until a burst of events settles),
   why the watcher needs it (a single save can trigger multiple `change` events),
   implementing a debounce function from scratch.
8. Definition of done: edit a markdown file in VS Code, see the change appear in
   Codex without restarting.

---

### Phase 3 — Code Blocks

---

#### Lesson 10 — Detecting Executable Code Blocks

**What you will build:**
The `<MarkdownRenderer>` component override now routes code blocks to either
`<StaticCodeBlock>` or `<CodeBlock>` based on the language tag. `<CodeBlock>` is
a stub — it just shows a placeholder "executable block" box. The routing logic is
complete and tested.

**CS concepts introduced:** The strategy pattern (introduced by name — selecting
behaviour at runtime based on a key).
**SE concepts introduced:** Configuration as data — the list of executable languages
is a constant in the core package, not scattered if/else logic in the renderer.

**Sections:**

1. Extending the component override from Lesson 03 — the same `components.code`
   function, now with routing logic.
2. The `EXECUTABLE_LANGUAGES` constant in the core package — a `Set<string>` of
   recognised language tags. Why a `Set` (O(1) lookup) not an array (O(n) scan).
3. The routing logic — one function, one decision, tested in isolation.
4. The `<CodeBlock>` stub — a placeholder div with the language tag and code length.
5. Definition of done: Python, TypeScript, Go blocks show the stub; bash, json
   blocks show the static highlighter.

---

#### Lesson 11 — The Monaco Editor Component

**What you will build:**
The `<CodeBlock>` component renders a real Monaco editor with the code from the
markdown file as its initial content. Syntax highlighting, autocomplete hints,
and keyboard shortcuts work. The editor is sized to fit its content.

**CS concepts introduced:** Controlled vs uncontrolled components, the editor as
a state machine.
**SE concepts introduced:** The Monaco editor as a dependency — `@monaco-editor/react`
is a React wrapper around a large, complex library. Understanding the abstraction
boundary: what you control (value, language, options) vs what Monaco controls
(the editing experience).
**Libraries introduced:** `@monaco-editor/react` — the Monaco editor engine, what
VS Code is built on, the React wrapper, its props and events.

**Sections:**

1. What Monaco is — the editor engine that powers VS Code, extracted as a library.
   Not a textarea with syntax highlighting — a full language-aware editor.
2. `@monaco-editor/react` — what it wraps, its key props: `value`, `language`,
   `onChange`, `options`, `height`.
3. Controlled vs uncontrolled components — a controlled component's value is driven
   by React state. An uncontrolled component manages its own state. Monaco is
   effectively uncontrolled — we set the initial value and listen for changes.
4. The `defaultValue` vs `value` distinction in Monaco — why we use `defaultValue`
   (we do not need to re-render the editor every time the user types).
5. Sizing the editor to content — the `onMount` callback, measuring line count,
   setting a minimum and maximum height.
6. Editor options — disabling minimap, setting font size, line numbers, scrollbar
   behaviour.
7. The loading state — Monaco loads asynchronously. What to show while it loads.
8. Definition of done: every executable code block shows a real Monaco editor with
   the correct language mode.

---

#### Lesson 12 — The Run Button and Output Panel

**What you will build:**
A Run button appears below the Monaco editor. Clicking it does not run any code yet
— it calls a stub executor that returns hardcoded output after 500ms. The output
panel below the editor shows the result: stdout in white, stderr in red, exit code
labelled.

**CS concepts introduced:** The null object pattern (the stub executor), promises
as a return type.
**SE concepts introduced:** Designing the executor interface before implementing it.
The interface is the contract; the stub is a placeholder that lets the UI be built
and tested independently of real execution. This is how large systems are built:
the interface is agreed first, each side develops independently.

**Sections:**

1. The executor interface — `execute(language: string, code: string): Promise<ExecutionResult>`.
   Every field of `ExecutionResult` defined: `stdout`, `stderr`, `exitCode`,
   `durationMs`.
2. The null object pattern — a stub implementation that always returns a fixed
   result. Why this is better than putting `if (executor === null)` guards everywhere.
3. `Promise<ExecutionResult>` — what a Promise is (a value that will exist in the
   future), `async/await` in the component, what happens while the promise is pending.
4. The output panel layout — stdout section, stderr section (only shown if non-empty),
   exit code badge, execution time.
5. Run button state: idle, running (spinner), complete. `useState` for this.
6. Definition of done: clicking Run shows the stub output after 500ms; errors show
   in red.

---

#### Lesson 13 — The Reset Button

**What you will build:**
A Reset button returns the Monaco editor content to the original code from the
markdown file. The student can edit freely and always recover.

**CS concepts introduced:** Immutability — the original code is stored separately
from the current editor content and never mutated.
**SE concepts introduced:** Separating the source of truth (the markdown file's
original code) from the working copy (what the student has typed). This is the
same design as git's working tree vs committed state.

**Sections:**

1. Immutability — why the original code string must never be modified. The editor
   operates on a copy.
2. The Monaco `setValue` API — how to programmatically set editor content.
3. The `useRef` hook — what it is, why we use it to hold the Monaco editor instance
   (not `useState`, because changing the ref must not trigger a re-render).
4. The confirm dialog — asking the user to confirm before discarding their changes.
   Electron's `dialog.showMessageBox` vs the browser's `confirm()`.
5. Definition of done: edit a code block, click Reset, the original code is restored.

---

#### Lesson 14 — Wiring the Executor to the Shell

**What you will build:**
The executor interface is wired to the Electron shell via IPC. Clicking Run sends
the language and code to the main process. The main process calls the executor.
The result comes back to the renderer. The stub executor is replaced by a real
one — but still does not run code. It echoes the code back as output. This lesson
is about the wiring, not the execution.

**CS concepts introduced:** The strategy pattern (formally named and applied).
**SE concepts introduced:** Why execution cannot happen in the renderer (the renderer
is a sandboxed web context; it cannot spawn child processes). The executor lives
in the main process. The strategy pattern: the main process injects the correct
executor strategy for each language.

**Sections:**

1. The strategy pattern — defining a family of algorithms (executors), encapsulating
   each one, making them interchangeable. The executor interface is the strategy
   interface. Each language runner is a concrete strategy.
2. Why execution happens in the main process — the renderer cannot spawn child
   processes. This is both a security property and a platform constraint.
3. The IPC call for execution — `ipcMain.handle('execute', (event, language, code) => ...)`
4. The executor registry — a `Map<string, Executor>` in the main process. Each
   language has one entry.
5. The echo executor — returns the code as stdout. Used to verify the wiring before
   real execution.
6. Definition of done: clicking Run sends code to the main process and gets a
   response back. The echo is visible in the output panel.

---

### Phase 4 — Code Execution

---

#### Lesson 15 — Running Python

**What you will build:**
The Python executor runs code using the `python` (or `python3`) process on the
machine. `print("hello")` in a Python code block prints `hello` in the output panel.
Errors in the Python code show the traceback in the stderr section.

**CS concepts introduced:** Child processes, stdin/stdout/stderr as file
descriptors, process exit codes.
**SE concepts introduced:** The executor as a thin shell over an OS primitive.
The Python executor does not parse Python — it delegates to the Python interpreter.
**Tools introduced:** Node.js `child_process.spawn`, the difference between
`spawn` and `exec`.

**Sections:**

1. What a child process is — the OS creates a new process, a copy of the parent's
   environment, with its own PID.
2. `child_process.spawn` vs `exec` — `exec` buffers all output in memory and
   returns it when the process exits; `spawn` streams output as it is produced.
   For a code executor, `spawn` is correct: the student may write a program that
   prints output incrementally.
3. stdin as the code delivery mechanism — piping the code string to the process's
   stdin, then closing it (`process.stdin.end()`).
4. Capturing stdout and stderr — `data` events on the stdout and stderr streams.
5. The `close` event — when the process exits, what the exit code means.
6. Timeout — what happens if the code runs forever (`while True: pass`). Sending
   SIGTERM after a configurable timeout. Why infinite loops must be handled.
7. The Python executor implementing the `Executor` interface.
8. Testing: `print("hello")`, arithmetic, a syntax error (shows traceback in stderr),
   an infinite loop (shows "execution timed out").
9. Definition of done: Python code blocks run real Python.

---

#### Lesson 16 — Running JavaScript and TypeScript

**What you will build:**
JavaScript runs via Node.js. TypeScript is compiled to JavaScript by `tsx` (the
TypeScript executor, which runs TypeScript directly without a separate compile step)
and then run. Both work in the output panel.

**CS concepts introduced:** Compilation vs interpretation, transpilation.
**SE concepts introduced:** The executor per language as a separate strategy — the
JavaScript executor and the TypeScript executor are separate classes that both
implement the same interface.
**Tools introduced:** `node`, `tsx` (TypeScript executor).

**Sections:**

1. JavaScript execution — Node.js is the runtime. `node -e "code"` vs piping
   to stdin — why stdin is better for multi-line code.
2. TypeScript execution — TypeScript cannot run directly in Node.js without
   compilation. `tsx` is a tool that compiles TypeScript on the fly and runs it.
   What `tsx` does (uses esbuild under the hood), why it is faster than `tsc`.
3. The difference between compilation and transpilation — compilation produces
   machine code; transpilation produces another high-level language (TypeScript → JavaScript).
4. Two executor classes, one interface — showing the strategy pattern in action.
5. Definition of done: TypeScript type annotations in a code block run correctly;
   type errors show in stderr.

---

#### Lesson 17 — Running Go

**What you will build:**
Go code blocks run using `go run`. A complete Go program (with `package main` and
`func main()`) runs and shows output. The lesson teaches Go's compilation model
and why `go run` exists.

**CS concepts introduced:** Compiled languages vs interpreted languages — Go must
be compiled before it runs. `go run` compiles to a temporary binary and runs it
in one step.
**SE concepts introduced:** The executor handling language-specific requirements —
Go programs require a `package main` declaration. The executor can prepend this
if the code block does not include it (a "snippet mode" for convenience).

**Sections:**

1. Go's compilation model — Go is a compiled language. `go run` is a convenience
   that compiles to a temp file and runs it without keeping the binary.
2. Why Go needs `package main` — Go's module system, the entry point convention.
3. Snippet mode — detecting whether the code block includes `package main`, and
   prepending the boilerplate if not. This lets lessons show just the interesting
   code without ceremony.
4. Writing to a temp file — why `go run` requires a file path, not stdin. The
   `os.tmpdir()` function, `fs.writeFile`, cleanup after execution.
5. Definition of done: a Go snippet with just `fmt.Println("hello")` runs without
   the student having to write `package main`.

---

#### Lesson 18 — Running C

**What you will build:**
C code blocks compile with `gcc` and run the resulting binary. Compile errors
appear in stderr with line numbers. Runtime errors (segfault, abort) show in
the output panel.

**CS concepts introduced:** The compile-link-execute pipeline, what `gcc` produces,
binary executables.
**SE concepts introduced:** Two-step execution — some languages require a separate
compile step. The executor handles both steps, streaming compile errors as stderr
output if compilation fails.

**Sections:**

1. The C compilation pipeline — preprocessing, compilation, assembly, linking.
   What each step does (briefly — the detailed version is in B1 of the curriculum map).
2. `gcc` — what it is, what flags matter (`-o` for output file, `-Wall` for warnings).
3. Compile errors vs runtime errors — gcc exits with non-zero on compile failure,
   before any execution. The executor must handle this case.
4. Temp files for C — source file, output binary, cleanup after execution.
5. Memory errors — what a segfault is (accessing memory you do not own), why it
   produces no stdout.
6. Definition of done: a C `hello world` compiles and runs; a buffer overflow
   shows a segfault message.

---

#### Lesson 19 — Running Rust

**What you will build:**
Rust code blocks compile with `rustc` and run. The Rust compiler's error messages
— famously detailed — appear in full in the stderr panel. Ownership errors are
readable.

**CS concepts introduced:** Ownership and borrowing (introduced conceptually —
the deep version is in C4 of the curriculum map).
**SE concepts introduced:** The Rust compiler as a teacher — its error messages
are designed to explain the problem and suggest a fix. The output panel is a good
place to read them.

**Sections:**

1. Rust's compilation model — similar to C, but `rustc` is the compiler.
2. Rust's ownership system — why the compiler rejects code that other languages
   would accept at runtime (and crash). A brief, honest introduction.
3. The `fn main()` convention — Rust's entry point requirement. Snippet mode as
   in Go.
4. Rust's error messages — reading one in full in the output panel.
5. Definition of done: a Rust snippet runs; a borrow checker error shows the
   full compiler message.

---

#### Lesson 20 — Running SQL

**What you will build:**
SQL code blocks run against a local SQLite database. Each code block gets its
own in-memory database — no state bleeds between blocks. `SELECT` results are
formatted as a table in the output panel.

**CS concepts introduced:** In-memory databases, result sets, how SQL output
differs from program output (it is structured, not a string).
**SE concepts introduced:** SQL is different from every other executor — the output
is tabular, not textual. The output panel renders a table instead of pre-formatted
text. This is the open/closed principle: the output panel is open for extension
(new output types) without modification.
**Libraries introduced:** `better-sqlite3` — the Node.js SQLite binding, why it
is synchronous (SQLite is an embedded database; there is no network call).

**Sections:**

1. SQLite — an embedded database. No separate server process. The entire database
   is a file (or in memory). Used by browsers, mobile apps, Electron apps.
2. `better-sqlite3` — why it is synchronous (no I/O latency; the database is
   in-process), how it differs from the PostgreSQL client in the PDM project.
3. In-memory databases — `new Database(':memory:')`. Created fresh for each
   execution, destroyed after. No persistence between code blocks.
4. Running a SQL block — `db.exec()` for DDL and DML, `db.prepare().all()` for
   SELECT.
5. Rendering a result set as a table in the output panel — the `<TableOutput>`
   component.
6. Definition of done: a SQL block creates a table, inserts rows, and selects
   them — the result appears as a formatted table.

---

#### Lesson 21 — Phase 4 Review: The Executor Registry

**What you will build:**
A review lesson. The student writes a new executor for a language of their choice
(bash is suggested — it runs shell commands). They write it from scratch using only
the interface and the existing executors as reference. No guidance on implementation.

**SE concepts introduced:** The strategy pattern as a closed system — adding bash
requires no changes to the executor registry loader, the IPC handler, the renderer,
or any existing executor. This is the proof that the architecture is open for
extension and closed for modification.

**Sections:**

1. The full executor registry — showing all seven executors and how they compose.
2. The student writes the bash executor alone.
3. The student adds it to the registry and the `EXECUTABLE_LANGUAGES` constant.
4. Testing: a bash block running `echo hello && ls` shows the output.
5. Definition of done: bash blocks run without any changes to existing code.

---

### Phase 5 — Web Shell and Polish

---

#### Lesson 22 — The Web App Shell

**What you will build:**
The same renderer and executor packages power a web app. An Express server serves
the React app and provides an API for file system access and code execution (since
the browser cannot do either directly). Opening a library folder works via a
POST request.

**CS concepts introduced:** The browser security model — why browsers cannot read
the file system or spawn processes.
**SE concepts introduced:** The shell as an adapter — the web shell provides the
same capabilities as the Electron shell through a different mechanism (HTTP API
instead of IPC). The renderer and executor packages are unchanged.

**Sections:**

1. Why the browser cannot read the file system — the browser security model,
   the sandbox, why this is a feature not a bug.
2. The Express API for the web shell — `GET /api/library`, `GET /api/chapter`,
   `POST /api/execute`.
3. Vite as the web dev server — what it does in development, how it differs from
   Electron's setup.
4. Sharing the renderer package between Electron and web — no code changes needed.
5. The executor in the web shell — the same executor strategies, called via HTTP
   instead of IPC.
6. Definition of done: `npm run dev` in the web app opens the LMS in a browser
   tab with full functionality.

---

#### Lesson 23 — KaTeX: Rendering Math

**What you will build:**
LaTeX math in markdown renders correctly. `$e^{i\pi} + 1 = 0$` shows the rendered
equation inline. `$$\begin{bmatrix}...\end{bmatrix}$$` shows a block matrix.
Every lesson in the linear algebra and physics curriculum displays correctly.

**CS concepts introduced:** The remark/rehype plugin pipeline — how react-markdown
processes content in stages.
**SE concepts introduced:** The plugin pipeline as a chain of responsibility — each
plugin transforms the content, passes it to the next. No plugin knows about the
others.
**Libraries introduced:** `remark-math`, `rehype-katex`, `katex` — what each does
and why three libraries are needed for one feature.

**Sections:**

1. The remark/rehype pipeline — remark processes the markdown syntax tree; rehype
   processes the HTML syntax tree. Math spans both.
2. `remark-math` — identifies `$...$` and `$$...$$` in the markdown and marks them
   as math nodes.
3. `rehype-katex` — takes math nodes and renders them using KaTeX.
4. `katex` — the actual math renderer. What KaTeX is (a fast, subset-of-LaTeX
   renderer), what it supports and does not support.
5. Adding the CSS — KaTeX requires a stylesheet for rendered equations.
6. Testing: inline math, block math, a matrix, a fraction, a sum notation.
7. Definition of done: all math in the linear algebra curriculum renders correctly.

---

#### Lesson 24 — Streaming Output

**What you will build:**
Code that produces output incrementally (a loop that prints one line per second)
shows output as it arrives, not all at once at the end. The output panel updates
in real time.

**CS concepts introduced:** Streams, event-driven I/O, backpressure.
**SE concepts introduced:** Designing for streaming from the start is easier than
retrofitting it — this lesson is placed here because the executor interface needs
a small change to support streaming. The lesson names this design mistake and
fixes it cleanly.

**Sections:**

1. Streams — a sequence of data that arrives over time, not all at once. The stdout
   of a process is a stream.
2. Why the current executor interface is wrong for streaming — it returns a Promise
   that resolves when execution is complete. Streaming requires events.
3. Extending the executor interface — adding an `onOutput` callback alongside the
   existing Promise return.
4. Updating the IPC handler to send incremental output events.
5. Updating the output panel to append output as it arrives.
6. Definition of done: a Python loop that prints 1–10 with a 0.5s delay shows
   each number as it is printed.

---

#### Lesson 25 — Keyboard Shortcuts and Command Palette

**What you will build:**
Keyboard shortcuts for common actions: Run (`Ctrl/Cmd+Enter` inside an editor),
Reset (`Ctrl/Cmd+Shift+R`), navigate chapters (`Ctrl/Cmd+[` and `]`). A command
palette (`Ctrl/Cmd+P`) lists all chapters for quick navigation.

**CS concepts introduced:** Event bubbling and capture, keyboard event handling.
**SE concepts introduced:** Keyboard shortcuts as a layer over existing actions —
the shortcuts call the same functions as the buttons, they do not duplicate logic.

---

#### Lesson 26 — Theme Switching (Light/Dark)

**What you will build:**
A theme toggle switches between light and dark mode. Monaco has built-in themes
(`vs` and `vs-dark`). The rest of the UI uses CSS custom properties. The theme
preference is persisted in `localStorage` (web) or Electron's `store` (desktop).

**CS concepts introduced:** CSS custom properties as a theming primitive.
**SE concepts introduced:** Theming as a cross-cutting concern — it touches the
Monaco editor, the markdown renderer, and the shell chrome. The right abstraction
is a `ThemeContext` that all components consume.
**Tools introduced:** React Context API — what it is, when to use it (global state
that many components need), when not to use it.

---

#### Lesson 27 — Packaging the Electron App

**What you will build:**
`npm run build` in the electron app produces a distributable installer for macOS
(`.dmg`) and Windows (`.exe`). The student understands what `electron-builder`
does and why unsigned apps trigger OS security warnings.

**Tools introduced:** `electron-builder` (recap from PDM project Lesson 29, or
first introduction here).

---

#### Lesson 28 — The VSCode Extension (Phase 3 Preview)

**What you will build:**
Not a complete extension — a preview lesson that explains what the VSCode extension
API provides and how the core and renderer packages would plug into it. The student
writes a "Hello from Codex" extension that opens a webview panel. No execution yet.

**Tools introduced:** The VSCode extension API, `vscode.window.createWebviewPanel`,
the extension manifest (`package.json` for extensions), the `.vscodeignore` file.

**SE concepts introduced:** The webview as the same web runtime as the browser —
the renderer package works inside a VSCode webview with no changes. This is the
payoff of the architecture decision in Lesson 01.

---

## Part 3 — Concepts Taught By Lesson

| Concept                         | First Introduced |
| ------------------------------- | ---------------- |
| Monorepo and npm workspaces     | Lesson 01        |
| React and JSX                   | Lesson 02        |
| Props and component design      | Lesson 02        |
| `react-markdown`                | Lesson 02        |
| Markdown parse tree / AST       | Lesson 03        |
| Component overrides as adapters | Lesson 03        |
| `shiki` syntax highlighting     | Lesson 03        |
| Content model as types          | Lesson 04        |
| IPC in Electron (recap/intro)   | Lesson 05        |
| Context isolation and preload   | Lesson 05        |
| `dialog.showOpenDialog`         | Lesson 06        |
| Promises and async/await        | Lesson 06        |
| `fs.readdir`, `path.join`       | Lesson 06        |
| Lazy loading                    | Lesson 08        |
| Adapter pattern                 | Lesson 08        |
| Observer pattern                | Lesson 09        |
| `chokidar`                      | Lesson 09        |
| Debouncing                      | Lesson 09        |
| Strategy pattern                | Lesson 10        |
| Monaco editor                   | Lesson 11        |
| Controlled vs uncontrolled      | Lesson 11        |
| `useRef`                        | Lesson 13        |
| Child processes, stdin/stdout   | Lesson 15        |
| `child_process.spawn`           | Lesson 15        |
| Compilation vs interpretation   | Lesson 16        |
| Transpilation                   | Lesson 16        |
| SQLite and `better-sqlite3`     | Lesson 20        |
| Browser security model          | Lesson 22        |
| remark/rehype plugin pipeline   | Lesson 23        |
| KaTeX                           | Lesson 23        |
| Streams and event-driven I/O    | Lesson 24        |
| React Context API               | Lesson 26        |
| CSS custom properties           | Lesson 26        |
| VSCode extension API            | Lesson 28        |

---

## Part 4 — The Architecture Decision That Makes Everything Work

The decision made in Lesson 01 — separating core, renderer, and executor into
packages, and making the shells thin — is the decision that allows:

- The web shell to work without changing the renderer (Lesson 22)
- The VSCode extension to work without changing the renderer (Lesson 28)
- A new language executor to be added without touching anything else (Lesson 21)
- Math rendering to be added without touching the executor (Lesson 23)
- Streaming output to require changes in only one place (Lesson 24)

Every time the curriculum adds a feature and the existing code does not change,
that is the open/closed principle working. The student will have seen it work
five times by the end of the curriculum. That is how it becomes permanent knowledge.

---

## Part 5 — Extended BRD: Fallback Execution and Beyond

**Version:** 2.0
**Extends:** Part 1–4 above

---

### 5.1 The Problem with a Single Execution Model

The v1.0 BRD described two execution models and said "pick one." That is the wrong
framing. A student running the Electron app on their own machine has Python installed.
A student opening the web app on a school Chromebook does not. A curriculum author
demoing the tool at a conference has no internet connection. A public LMS running
student-submitted code cannot trust any of it.

A single execution model fails at least one of these cases. The right architecture
is a **tiered fallback chain** — the system tries the best available executor for the
current environment and falls back gracefully until it finds one that works.

This is not a compromise. It is a feature. The same markdown file, the same code
block, produces a working Run button in every environment. The student never sees
"Python not found." They see output.

---

### 5.2 The Four Execution Tiers

```
Tier 1 — Local execution
  child_process.spawn — real runtime on the machine
  Fastest. Full capability. Works offline. Requires runtime installed.

Tier 2 — WASM execution
  Pyodide / sql.js / Fengari / Opal / JSCPP / Babel
  Portable. Sandboxed. Works in any browser. CDN on first load, cached after.

Tier 3 — Remote execution
  Code sent to a Docker container via HTTP API
  Full capability for languages without a WASM runtime. Requires backend.
  Sandboxed at the OS level. Rate-limited. For public-facing deployments.

Tier 4 — Read-only
  No runtime available at any tier.
  Run button is disabled. Clear message tells the student why.
  The lesson is still readable and the code is still copyable.
```

The chain runs in order. Tier 1 is tried first. If the runtime is not found
(the `which python3` check fails), Tier 2 is tried. If the CDN is unreachable or
the WASM module fails to initialise, Tier 3 is tried. If the backend is down, the
block falls to Tier 4. The student always gets the best available result.

This is the **chain of responsibility** pattern. Each tier is a handler. Each handler
tries to handle the request and, if it cannot, passes to the next. Lesson 29 names
and implements this pattern.

---

### 5.3 WASM Runtime Table

The Tier 2 fallback exists for every language in the v1.0 executable set, plus
several languages that were static-only in v1.0.

| Language      | Tier 1 runtime | Tier 2 WASM runtime        | Notes                                          |
|---------------|----------------|-----------------------------|------------------------------------------------|
| Python        | `python3`      | Pyodide (CPython 3.11 WASM) | numpy, pandas, matplotlib available via micropip |
| JavaScript    | `node`         | Native (browser runs it)    | No fallback needed — the renderer is JS        |
| TypeScript    | `tsx`          | Babel standalone             | Compiles to JS, then runs natively             |
| SQL           | `sqlite3`      | sql.js (SQLite WASM)        | Each block gets a fresh in-memory database     |
| C             | `gcc`          | JSCPP                       | JSCPP supports most of C99; libc subset        |
| C++           | `g++`          | JSCPP                       | STL subset; no platform headers                |
| Lua           | `lua5.4`       | Fengari (Lua 5.3 in JS)     | Full standard library                          |
| Ruby          | `ruby`         | Opal.js (Ruby → JS)         | Core library; no File, no Process              |
| Brainfuck     | —              | Inline interpreter (30 LOC) | No Tier 1 — trivially implemented in Tier 2   |
| Go            | `go run`       | None yet                    | TinyGo WASM is v3.0 work                       |
| Rust          | `rustc`        | None yet                    | Rust WASM compilation is feasible but heavy    |
| Bash/Shell    | `bash`         | Built-in interpreter (JS)   | Simulates common commands; no real filesystem  |

Languages with no Tier 2 WASM runtime (Go, Rust) fall through to Tier 3
(remote Docker) or Tier 4 (read-only) if local is unavailable.

---

### 5.4 Updated Code Block Contract

The v1.0 BRD listed `bash` and `shell` as static-only. This is revised.

**Tier 1 + Tier 2 runnable:** `python`, `javascript`, `typescript`, `sql`, `c`, `cpp`,
`lua`, `ruby`, `brainfuck`, `bash`, `shell`, `json`

**Static-only (no execution at any tier):** `yaml`, `toml`, `markdown`, `text`,
`plaintext`, `dockerfile`, `nginx`, `xml`

The distinction is not "can we run this" but "does running it produce output a
student learns from." A `bash` block that echoes variables, runs a loop, or pipes
grep through sort teaches the student something. A `yaml` block is a configuration
file — running it produces nothing meaningful.

---

### 5.5 Runtime Detection

Tier 1 requires knowing whether the runtime is installed before trying to spawn it.
Attempting `child_process.spawn('python3', ...)` when Python is not installed does
not return a useful error — it throws `ENOENT` asynchronously, which must be caught
and interpreted.

The correct approach is a one-time probe at startup:

```typescript
// In the executor package, run once at startup
async function probeRuntime(binary: string): Promise<boolean> {
  return new Promise(resolve => {
    const probe = spawn(binary, ['--version'], { timeout: 2000 })
    probe.on('close', code => resolve(code === 0))
    probe.on('error', () => resolve(false))
  })
}

const AVAILABLE_RUNTIMES = {
  python:     await probeRuntime('python3'),
  node:       await probeRuntime('node'),
  go:         await probeRuntime('go'),
  gcc:        await probeRuntime('gcc'),
  rustc:      await probeRuntime('rustc'),
  lua:        await probeRuntime('lua5.4'),
  ruby:       await probeRuntime('ruby'),
}
```

The result is stored in the executor registry. When a code block is run, the
registry consults `AVAILABLE_RUNTIMES` to decide which tier to start from. This
probe runs once at app startup and is never repeated — it is not called on every
Run click.

Lesson 30 implements this probe and explains `ENOENT`, process exit codes, and why
the timeout matters (a slow `--version` call would stall the app's startup).

---

### 5.6 Service Workers and Tier 2 Offline

The WASM runtimes (Pyodide, sql.js, Fengari) are large files downloaded from a CDN
on first use. A student on a slow connection should not wait 30 seconds the first
time they click Run.

The solution is a **service worker** that caches WASM modules after the first
download. On subsequent runs, the WASM file is served from the browser's cache —
instantaneous, works offline.

```
First run:    browser → CDN → WASM module → cache
Second run:   browser → cache → WASM module (CDN not contacted)
Offline:      browser → cache → WASM module (works)
```

The service worker intercepts requests for known WASM CDN URLs and caches the
response. The registration is a one-time setup in the web app shell. Lesson 33
adds this and explains the service worker lifecycle: install, activate, fetch.

---

### 5.7 The Circuit Breaker for Tier 3

If the remote execution backend is consistently unavailable (connection refused,
5xx responses, timeouts), attempting Tier 3 on every Run click wastes the student's
time. The circuit breaker pattern addresses this.

```
State: CLOSED (normal) → all requests go to Tier 3
After 3 consecutive failures → state becomes OPEN
In OPEN state → skip Tier 3 entirely, fall to Tier 4 with a message
After 30 seconds → state becomes HALF-OPEN
One trial request → if success, back to CLOSED; if failure, back to OPEN
```

The circuit breaker is a class in the executor package. Lesson 40 implements it
and names the pattern. The student will have already seen the chain of responsibility
(Lesson 29) and the strategy pattern (Lesson 10) — the circuit breaker is the third
major resilience pattern in the curriculum.

---

### 5.8 Updated Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  SHELL LAYER                                                      │
│  Electron · Web app · VSCode extension                           │
│  Job: platform APIs, file dialogs, process spawning, IPC         │
├──────────────────────────────────────────────────────────────────┤
│  RENDERER LAYER           │  EXECUTOR LAYER                      │
│  React + React Markdown   │  FallbackExecutor                    │
│  Monaco Editor            │    Tier 1: LocalExecutor             │
│  KaTeX                    │    Tier 2: WASMExecutor              │
│  Job: display content     │    Tier 3: RemoteExecutor            │
│                           │    Tier 4: ReadOnlyExecutor          │
│                           │  Circuit breaker (Tier 3)            │
│                           │  Runtime probe cache (Tier 1)        │
├──────────────────────────────────────────────────────────────────┤
│  CORE LAYER                                                       │
│  Content model · File watcher · Runtime availability cache       │
│  Virtual file system (multi-file blocks)                         │
│  Job: read the file system, parse content, manage state          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Part 6 — Extended Curriculum: Phases 6–10

### Structure

Five additional phases. Each phase ends with something fully working.

**Phase 6 — The Fallback Executor (Lessons 29–33)**
The single executor becomes a four-tier fallback chain. The chain of responsibility
pattern is implemented. Service workers cache WASM runtimes offline.

**Phase 7 — Multi-File Projects (Lessons 34–38)**
A code block can declare itself a multi-file project. A virtual file system holds
the files in memory. Python `import`, C `#include`, and SQL `\i` work across files.
The project state persists in localStorage between sessions.

**Phase 8 — Remote Execution (Lessons 39–43)**
A Docker-backed execution API becomes Tier 3. Rate limiting, resource constraints,
and timeout enforcement are implemented. The circuit breaker is added. Go and Rust
blocks now run everywhere.

**Phase 9 — Progress and Persistence (Lessons 44–47)**
The student's progress through the curriculum is tracked. Completed chapters are
marked. Editor state (code the student has written) is saved between sessions.
A progress export/import mechanism lets students carry state across machines.

**Phase 10 — The VSCode Extension (Lessons 48–50)**
The full VSCode extension, not the preview from Lesson 28. The webview hosts the
renderer package unchanged. Extension IPC replaces Electron IPC. Syntax diagnostics
from the language server appear in the editor.

---

### Phase 6 — The Fallback Executor

---

#### Lesson 29 — The Chain of Responsibility

**What you will build:**
The `FallbackExecutor` class wraps the existing executor chain. Given a language and
code, it tries each tier in order and returns the first successful result. The
existing `LocalExecutor` becomes Tier 1. A stub `WASMExecutor` and a stub
`RemoteExecutor` are added. The chain is wired and tested — confirmed to skip Tier 1
when forced unavailable and fall to Tier 2.

**CS concepts introduced:** The chain of responsibility pattern — a linked list of
handlers, each of which may handle a request or pass it to the next.
**SE concepts introduced:** Resilience as a first-class design concern, not an
afterthought. Designing for failure before the failure happens.

**Sections:**

1. The chain of responsibility pattern — definition, diagram, comparison with
   strategy (strategy selects one handler; chain tries each in sequence until one
   succeeds). Real-world examples: middleware pipelines (Express), exception handlers,
   UI event bubbling.
2. The `Executor` interface does not change — the same `execute(language, code)` call.
   The fallback logic is entirely inside `FallbackExecutor`. Nothing in the renderer
   changes.
3. `FallbackExecutor` implementation — an ordered array of executors, each tried in
   sequence. What "unavailable" means for each tier (runtime not found, CDN failure,
   network error).
4. Forcing Tier 1 unavailable in tests — disabling the runtime probe result, confirming
   Tier 2 is called.
5. The error surface — what the student sees when all tiers fail (Tier 4: a clear,
   actionable message, not a stack trace).
6. Definition of done: a Python block runs via Pyodide when `python3` is not found.

---

#### Lesson 30 — Runtime Detection

**What you will build:**
The runtime probe runs at startup. `AVAILABLE_RUNTIMES` is populated. The
`LocalExecutor` consults it before attempting to spawn a process. The probe result
is shown in a small status indicator in the app's footer: `python ✓`, `go ✓`,
`gcc ✗` — the student can see at a glance which Tier 1 runtimes are available on
their machine.

**CS concepts introduced:** `ENOENT` — the OS error for "no such file or directory"
when a binary does not exist on `PATH`. What `PATH` is.
**SE concepts introduced:** Fail-fast detection — checking preconditions at startup
rather than discovering them at the moment of use (which is slower and less clear).

**Sections:**

1. What `PATH` is — the ordered list of directories the OS searches when you run a
   command. Why `python3` works in the terminal but the app cannot find it (the app
   may have a different `PATH` than the shell that launched it).
2. The `probeRuntime` function — `spawn(binary, ['--version'])`, the `error` event
   (ENOENT), the `close` event (exit code), the timeout.
3. Running probes in parallel — `Promise.all` for the full set of binaries. Why
   sequential probing would slow app startup.
4. The status indicator component — reading the probe results, rendering coloured
   dots. The dots are informational only — the student does not need to act on them.
5. Caching the result — the probe runs once, not on every Run click. `Object.freeze`
   to prevent mutation.
6. Definition of done: the status indicator shows the correct state for every
   runtime on the student's machine.

---

#### Lesson 31 — Pyodide: Python in the Browser

**What you will build:**
The `WASMExecutor` for Python is implemented using Pyodide. `print("hello")` in a
Python block works with no Python installation. numpy, pandas, and matplotlib are
available via micropip. The matplotlib shim intercepts `plt.show()` and renders
the plot inline as a base64 PNG.

**CS concepts introduced:** WebAssembly — what it is, why it is not JavaScript,
how the browser sandboxes it. The Emscripten toolchain that compiled CPython to WASM.
**SE concepts introduced:** A sandbox as a feature — Pyodide cannot access the real
file system or network. This is the correct behaviour for a learning environment.
The constraint is designed in, not worked around.

**Sections:**

1. WebAssembly — a binary instruction format the browser compiles and runs at
   near-native speed. Not JavaScript. Not a plugin. The browser treats it as
   a safe sandbox: no file system access, no network access by default.
2. Pyodide — CPython 3.11 compiled to WASM via Emscripten. The Python interpreter,
   the standard library, and numpy/scipy are bundled. The first load is ~10MB;
   subsequent runs use the browser cache.
3. `pyodide.runPythonAsync` — the API for running Python code. Why async
   (Pyodide initialises asynchronously; the WASM module must load before any code runs).
4. stdout/stderr capture — `pyodide.setStdout` / `pyodide.setStderr`. How Pyodide
   redirects Python's I/O to JavaScript callbacks.
5. `loadPackagesFromImports` — Pyodide detects `import numpy` in the code and
   downloads the package before running. How this works (import scanning, micropip).
6. The matplotlib shim — intercepting `plt.show()`, rendering to a PNG via
   `matplotlib.use('Agg')`, encoding as base64, embedding in the output panel.
7. Definition of done: a matplotlib scatter plot renders inline without `plt.show()`
   opening a window.

---

#### Lesson 32 — The WASM Registry: SQL, Lua, Ruby, C, Shell

**What you will build:**
The remaining Tier 2 executors are implemented. The `WASMExecutor` dispatches to
the correct runtime by language. sql.js, Fengari, Opal.js, and JSCPP are each
added as a lazy-loaded module — the CDN script is not fetched until the language
is first run.

**CS concepts introduced:** Lazy loading at the module level — the WASM runtime
is not fetched at app startup, only when the language is first used.
**SE concepts introduced:** The registry pattern — a `Map<string, WASMRunner>`
where each value is a factory function that returns the runner (loading it if not
yet loaded). Adding a new WASM runtime is one record in the map.

**Sections:**

1. The WASM executor registry — structure, how it parallels the local executor
   registry from Lesson 14.
2. sql.js — SQLite compiled to WASM. Each execution gets a fresh `new SQL.Database()`.
   Results are structured (rows and columns), not strings — the output panel renders
   a table. The `locateFile` option points to the WASM binary URL.
3. Fengari — Lua 5.3 reimplemented in JavaScript (not WASM). How to override
   Lua's `print` function to capture output via `lua.lua_pushcfunction`.
4. Opal.js — Ruby compiled to JavaScript (a transpiler, not an interpreter).
   Overriding `Kernel#puts` to capture output. What Opal can and cannot do.
5. JSCPP — a C/C++ interpreter in JavaScript. The `stdio.write` callback for output.
   What subset of C99 it supports and what falls through to Tier 4.
6. The shell interpreter — implemented in pure JavaScript, no CDN. Supports
   variables, for/while/if, pipes, grep, awk, sed, sort, and a defined set of
   built-in commands. Documented limitations: no real filesystem, no subprocesses.
7. Definition of done: a code block for each language runs in a browser with no
   local runtimes installed.

---

#### Lesson 33 — Service Workers and Offline WASM

**What you will build:**
A service worker caches WASM modules after the first download. After the first run
of any WASM-backed language, subsequent runs are instantaneous and work offline.
The app shows a "Ready offline" indicator once the service worker has populated
its cache.

**CS concepts introduced:** The service worker as a programmable HTTP proxy —
it intercepts network requests and can serve cached responses.
**SE concepts introduced:** Cache-aside pattern — check the cache first; if the
resource is there, serve it; if not, fetch it, store it in the cache, then serve it.

**Sections:**

1. What a service worker is — a script that runs in a separate thread, outside the
   page. It intercepts `fetch` events. It is not the same as a web worker (a web
   worker runs JS in a background thread; a service worker intercepts network requests).
2. The service worker lifecycle — `install` (pre-cache known URLs), `activate`
   (take control of pages), `fetch` (intercept requests).
3. The Cache API — `caches.open`, `cache.match`, `cache.put`. The cache is
   persistent across browser sessions.
4. Which URLs to cache — the WASM binary URLs for sql.js, Pyodide, Fengari. The
   cache key is the URL. The cache strategy is cache-first.
5. Registering the service worker from the web shell.
6. The "Ready offline" indicator — the service worker posts a message to the page
   when the install phase completes.
7. Definition of done: turn off the network in DevTools, reload, run a Python block.
   It works.

---

### Phase 7 — Multi-File Projects

---

#### Lesson 34 — The Project Code Block

**What you will build:**
A new fenced code block syntax declares a multi-file project:

````markdown
```python project
# file: main.py
from utils import greet
greet("world")

# file: utils.py
def greet(name):
    print(f"Hello, {name}!")
```
````

The code block splits into multiple files. The Monaco editor shows a tab bar.
Each tab edits one file. Run executes the entry point (`main.py`).

**CS concepts introduced:** File boundaries as a unit of abstraction — `import`
works because the module system knows which file each name lives in.
**SE concepts introduced:** The open/closed principle applied to the code block
contract — the new `project` modifier extends behaviour without changing the
existing `CodeBlock` component. A `ProjectCodeBlock` wraps the existing editor.

**Sections:**

1. The project block syntax — the `project` keyword after the language tag.
   How the markdown parser detects it (the `meta` field in the code node).
2. Parsing the file comments — `# file: filename.py` as a file boundary marker.
   How the `core` package splits one code string into a `Map<string, string>`.
3. The tab bar component — built from scratch, no library. A list of filenames,
   the active one highlighted, click to switch. Only the Monaco editor height
   changes, not its instance — the editor content swaps.
4. The entry point convention — `main.py` for Python, `main.ts` for TypeScript,
   `main.c` for C. The executor knows which file to run.
5. Definition of done: a Python project with two files runs correctly; `import`
   resolves across files.

---

#### Lesson 35 — The Virtual File System

**What you will build:**
WASM runtimes (Pyodide, JSCPP) cannot access the real file system. When a multi-file
project runs under Tier 2, the files are written to an in-memory virtual file
system that the WASM runtime can access.

**CS concepts introduced:** Virtual file systems — an abstraction layer that
presents a file system API backed by something other than a real disk. The
`/proc` file system in Linux is a famous example.
**SE concepts introduced:** The adapter pattern again — the virtual FS presents the
same API as a real FS (read, write, exists), so the executor does not know which it is.

**Sections:**

1. What a virtual file system is — an object that implements `readFile`, `writeFile`,
   `exists`, `readDir`. The caller never knows whether it talks to a real disk or
   a `Map<string, string>`.
2. Pyodide's `FS` API — Pyodide exposes an Emscripten virtual FS. You can call
   `pyodide.FS.writeFile('/home/pyodide/utils.py', content)` and Python can then
   `import utils`.
3. Mounting project files — before running `main.py`, write all project files into
   `/home/pyodide/` via the Pyodide FS API.
4. Setting the working directory — `await pyodide.runPythonAsync("import os; os.chdir('/home/pyodide')")`.
5. JSCPP virtual FS — JSCPP provides `config.includes` for header file content.
   Mapping the project's `.h` files into this structure.
6. Definition of done: a Python project with three files, each importing from the
   others, runs correctly in Pyodide.

---

#### Lesson 36 — Project State Persistence

**What you will build:**
When a student edits code in a project block, their edits are saved automatically
to `localStorage`. When they return to the chapter, their edits are restored.
A "Reset all files" button restores every file to the original markdown content.

**CS concepts introduced:** Serialisation — converting an in-memory state (a
`Map<string, string>`) to a string (JSON) and back.
**SE concepts introduced:** The source of truth hierarchy — the markdown file is
the ground truth; localStorage is a user-layer overlay. The reset operation is
always available because the ground truth is immutable.

**Sections:**

1. `localStorage` — key/value store in the browser. Strings only. Persistent across
   sessions. Scoped to the origin. Synchronous API.
2. The storage key — derived from the chapter's file path and the block's position
   in the document. Deterministic: the same block always maps to the same key.
3. Serialising the project state — `JSON.stringify` the `Map` (after converting to
   a plain object). `JSON.parse` on load.
4. The save trigger — debounced on Monaco's `onChange` event. 300ms delay prevents
   saving on every keystroke.
5. Reset — clearing the localStorage key, restoring all editors to the original
   values from the markdown.
6. Definition of done: edit code, refresh the page, edits are restored. Click
   Reset, original code is back.

---

#### Lesson 37 — Dependency Installation in WASM

**What you will build:**
A code block can declare Python dependencies:

````markdown
```python deps=numpy,pandas,scikit-learn
import numpy as np
import pandas as pd
```
````

Before running, the executor installs the declared packages via micropip. A loading
indicator shows which package is being installed. Packages are cached between runs
within the same session.

**SE concepts introduced:** Declarative dependency management — the code block
declares what it needs; the runtime satisfies the declaration. This is the same
model as `package.json` and `requirements.txt`, applied to a single code block.

**Sections:**

1. The `deps=` modifier syntax — parsed from the code block's meta string.
2. `micropip.install` — Pyodide's package installer. It downloads Python wheels
   from PyPI and installs them into the Pyodide environment.
3. Sequential vs parallel installation — packages without interdependencies can
   be installed in parallel with `Promise.all(deps.map(micropip.install))`.
4. The session cache — a `Set<string>` of already-installed packages. If numpy was
   installed in a previous block, it does not need to be installed again.
5. The loading indicator — per-package progress shown in the output panel before
   the code runs.
6. Definition of done: a block with `deps=pandas` installs pandas and runs a
   DataFrame operation.

---

#### Lesson 38 — Phase 7 Review: The Virtual Project

**What you will build:**
A review lesson. The student builds a complete multi-file Python data science project
as a series of code blocks in a markdown file — data loading, processing, and
visualisation split across three project blocks, each building on the last. The
entire analysis runs in Pyodide with no local Python installation.

**Sections:**

1. The student writes the markdown file with three project blocks.
2. They run each block in sequence, seeing the output inline.
3. They edit a data processing step and re-run — the edited version runs, not the
   original.
4. After a page refresh, their edits are restored from localStorage.
5. Definition of done: a complete data science workflow in a markdown file, fully
   runnable in the browser.

---

### Phase 8 — Remote Execution

---

#### Lesson 39 — Docker as the Execution Sandbox

**What you will build:**
A Docker-backed execution API is added as Tier 3. Code is sent to an Express
endpoint that spawns a Docker container, runs the code inside it, captures output,
destroys the container, and returns the result. Go and Rust blocks now run everywhere.

**CS concepts introduced:** Containers — a process with an isolated view of the
file system, network, and process table. Not a virtual machine (the kernel is shared);
lighter and faster than a VM.
**SE concepts introduced:** The principle of least privilege applied to untrusted
code — the container has no access to the host file system, no network access, a
memory cap, a CPU cap, and a hard timeout. The code cannot escape the sandbox.

**Sections:**

1. What Docker is — images vs containers, the `docker run` command, why containers
   are lightweight (shared kernel, copy-on-write file system).
2. The execution container — a minimal image with the language runtime installed.
   No network access (`--network none`), no file system access beyond the working
   directory, 64MB memory cap (`--memory 64m`), 0.5 CPU (`--cpus 0.5`).
3. The Express endpoint — `POST /api/execute` with `{ language, code }` body.
   Returns `{ stdout, stderr, exitCode, durationMs }`.
4. Passing code to the container — writing to a temp file, mounting it read-only
   into the container. Not via stdin (some runtimes require a file path).
5. Cleanup — always deleting the temp file and stopping the container, even if
   execution errors. `try/finally` in Node.js.
6. Timeout enforcement — killing the container after 10 seconds with `docker stop`.
   Why `SIGTERM` first, then `SIGKILL` after 2 seconds (giving the process a chance
   to clean up).
7. Definition of done: a Go block and a Rust block run via Docker in the web app.

---

#### Lesson 40 — Rate Limiting and Resource Guards

**What you will build:**
The execution API is protected against abuse. Rate limiting rejects more than 10
requests per minute per IP address. The circuit breaker prevents cascading failures
when Docker is unavailable. Resource usage is logged.

**CS concepts introduced:** The circuit breaker pattern — automatically stopping
requests to a failing service and retrying after a cooldown period.
**SE concepts introduced:** Defence in depth — rate limiting, resource limits, and
timeouts each independently limit damage. No single guard is sufficient alone.

**Sections:**

1. Rate limiting — what it is, why it is necessary (a student who writes an infinite
   loop that exhausts Docker containers in 0.1s would bring down the service for
   everyone). `express-rate-limit` implementation.
2. Rate limit headers — `X-RateLimit-Limit`, `X-RateLimit-Remaining`,
   `Retry-After`. The student's app reads these and shows a message.
3. The circuit breaker implementation — three states (CLOSED, OPEN, HALF-OPEN),
   the failure threshold, the reset timeout. Implemented as a class with a `call`
   method that wraps any async function.
4. Logging resource usage — each execution logs language, duration, memory peak,
   exit code. Why structured logs (JSON) are searchable and why plain text is not.
5. The execution queue — if the server is processing 5 containers concurrently,
   the 6th request waits rather than spawning a 6th container. `p-queue`
   implementation with a concurrency limit.
6. Definition of done: hitting the rate limit shows a clear message; a simulated
   Docker failure opens the circuit breaker; the log shows per-execution data.

---

#### Lesson 41 — Language Images

**What you will build:**
Each language has its own Docker image, built from a minimal base. The image is
pre-built and cached — a `go run` block does not download the Go image on every
run. A `Makefile` builds and tags all images.

**SE concepts introduced:** Build caching as a performance strategy — pre-building
images means container startup is measured in milliseconds, not seconds. The cost
is paid once (at deploy time), not on every student click.

**Sections:**

1. Multi-stage Dockerfiles for language images — a builder stage compiles any
   native dependencies; the production stage contains only the runtime and the
   compiled artefacts. The Go image is ~20MB; the full Go toolchain is ~300MB.
2. The image tag convention — `codex/python:3.11`, `codex/go:1.22`, etc. Why
   pinning versions matters (an image tagged `latest` is not reproducible).
3. The `Makefile` — `make build` builds all images; `make push` pushes them to a
   registry. Why a Makefile (it is language-agnostic and universally available).
4. The executor looking up the image tag — `IMAGE_REGISTRY[language]` in the
   remote executor config.
5. Definition of done: `make build` succeeds for all languages; images run in
   under 500ms from first request after pre-pull.

---

#### Lesson 42 — Phase 8 Review: The Full Fallback Chain

**What you will build:**
A review lesson. The student writes a lesson in markdown that contains a Go block.
They open it in the Electron app with Go installed (Tier 1 runs), then in the
web app with Go not installed and the Docker backend available (Tier 3 runs), then
in the web app with the backend unavailable (Tier 4 — helpful error message). Three
environments, one markdown file, three different execution paths, correct behaviour
in all three.

---

### Phase 9 — Progress and Persistence

---

#### Lesson 43 — Chapter Completion Tracking

**What you will build:**
Each chapter has a "Mark complete" checkbox. Completed chapters show a checkmark
in the sidebar. Progress is stored in localStorage (web) or Electron's store
(desktop). An overall progress percentage is shown in the app header.

**CS concepts introduced:** Persistent state vs session state. `localStorage` for
the web, `electron-store` for the desktop — same data, different backing stores.
**SE concepts introduced:** The adapter pattern applied to storage — a `ProgressStore`
interface with two implementations. The components do not know which backing store
they use.

**Sections:**

1. What "completed" means — the student has reached the end of a chapter and chosen
   to mark it. Codex does not automatically mark chapters complete (scroll position
   is not a reliable signal of comprehension).
2. The `ProgressStore` interface — `markComplete(chapterId)`, `isComplete(chapterId)`,
   `getAll()`. Two implementations: `LocalStorageProgressStore` and
   `ElectronProgressStore`.
3. `electron-store` — a simple key/value store that persists to a JSON file in the
   user's app data directory. Why not `localStorage` in Electron (it works, but the
   data is cleared when the user clears browser data; Electron store survives this).
4. The chapter ID — derived from the chapter's file path, not its title. Titles can
   change; paths are stable as long as the file moves.
5. The sidebar checkmarks and progress percentage.
6. Definition of done: mark three chapters complete, restart the app, the marks persist.

---

#### Lesson 44 — Editor State Persistence

**What you will build:**
The student's edits to code blocks are saved automatically. When they return to
a chapter after closing the app, every code block shows their last edited state.
A "Reset all" button in the chapter header clears all edits for that chapter.

**SE concepts introduced:** The event sourcing model, applied simply — rather than
storing the current state (the edited code), store the original state (from the
markdown file) and apply the delta (the student's edits) on load. Reset means
discarding the delta.

**Sections:**

1. The storage key design — `{chapterId}:{blockIndex}:{contentHash}`. The
   `contentHash` is a hash of the original code. If the lesson author changes the
   original code, the stored edit is discarded — the student gets the new version.
2. The content hash — a fast, non-cryptographic hash (FNV-1a). Why we hash the
   original code and not the chapter path: two blocks in the same chapter could
   have the same code; two chapters could have a block with the same code.
3. Debounced saving — saving on every keystroke is too expensive. A 500ms debounce
   saves only when the student pauses.
4. The "Reset all" operation — iterating all storage keys that match the chapter
   pattern and removing them. `localStorage` has no namespace support — key prefix
   scanning is the standard technique.
5. Definition of done: edit a code block, close the tab, reopen it, the edit is there.

---

#### Lesson 45 — Search Across the Library

**What you will build:**
A search box (triggered by `Ctrl/Cmd+K`) searches all chapter content. Results
show the chapter title, a snippet of matching text, and the page number. Clicking
a result navigates to the chapter and highlights the match.

**CS concepts introduced:** Full-text search — the naive approach (scan every
character of every file) vs the index approach (build a lookup table at startup,
query the table). Inverted index as a data structure.
**SE concepts introduced:** Building an index at startup is the right trade-off
when the data is read-often and written-rarely. The library does not change while
the student is using it. Build the index once, query it many times.

**Sections:**

1. Naive search — scanning every file on every query. Time complexity is O(n × m)
   where n is the total character count and m is the query length. Acceptable for
   small libraries; slow for large ones.
2. The inverted index — a map from every word to the list of chapters that contain
   it. `{ 'ownership': ['rust-01', 'rust-04'], 'borrow': ['rust-01'] }`. Lookup
   is O(1) per word. Building the index is O(n × m) once.
3. Building the index at startup — after `parseLibrary` returns the chapter list,
   a background job reads each chapter's content and indexes it. Why a Web Worker
   (the indexing is CPU-intensive; running on the main thread would freeze the UI).
4. Web Workers — a script that runs in a background thread. No DOM access. Communicates
   with the main thread via `postMessage`. The indexer is a perfect use case.
5. Highlighting search results — finding the match position in the content string,
   extracting a snippet, wrapping the match in a `<mark>` element.
6. Definition of done: searching "ownership" in a Rust curriculum returns the correct
   chapters within 50ms for a 200-chapter library.

---

#### Lesson 46 — Export and Import

**What you will build:**
The student can export their progress (completed chapters, all edited code blocks)
as a single JSON file. They can import this file on another machine to restore their
state. This is the cross-machine sync story for v2.0 — no cloud required.

**SE concepts introduced:** Data portability as a design principle — a system that
holds user data should always be able to export it in a readable format and import
it back. This is not a nice-to-have; it is the minimum respect owed to the user.

**Sections:**

1. The export format — a JSON object with two keys: `progress` (a map of chapter
   IDs to completion state) and `edits` (a map of block storage keys to edited
   content). Human-readable, documented, versioned (`"format": "codex-export-v1"`).
2. Triggering the download — `URL.createObjectURL(new Blob([json], { type: 'application/json' }))`.
   The `download` attribute on an `<a>` element. No server required.
3. Importing — a file input that reads the JSON, validates the format version,
   and merges into localStorage. Merge, not replace — importing does not lose
   existing data not in the imported file.
4. Version compatibility — what to do when the format version does not match
   (show a clear error; do not silently corrupt state).
5. Definition of done: export progress on machine A, import on machine B,
   all marks and edits are restored.

---

### Phase 10 — The VSCode Extension

---

#### Lesson 47 — The Full Extension

**What you will build:**
The complete VSCode extension. A command "Codex: Open Library" opens a folder
picker. The selected folder is parsed by the core package. The renderer package
is hosted in a webview panel. The extension communicates with the webview via
`postMessage`. The student reads and runs code blocks without leaving VS Code.

**CS concepts introduced:** Message passing between isolated contexts — the extension
host and the webview cannot share memory. They communicate by sending serialisable
messages.
**SE concepts introduced:** The webview as a second web shell — the renderer package
runs unchanged inside a VSCode webview. The architecture decision from Lesson 01
pays off for the third time (after Electron and web).

**Sections:**

1. The extension host — the process that runs extension code. Has access to the
   VS Code API (`vscode.*`), Node.js, and the file system. Does not have a DOM.
2. The webview — a sandboxed iframe running in a VS Code tab. Has a DOM. Does not
   have access to the file system or the VS Code API.
3. Message passing — the extension calls `panel.webview.postMessage(data)`;
   the webview calls `vscode.postMessage(data)`. JSON-serialisable messages only.
4. Hosting the renderer — the webview's HTML loads the bundled renderer package.
   VS Code converts local file URIs to `vscode-resource:` URIs; the build must
   use relative paths or the resource URI scheme.
5. Extension IPC — mapping the Electron IPC calls (from Lesson 05) to
   `postMessage` calls. The renderer package does not change; only the shell
   adapter changes.
6. The extension manifest — `package.json` with `contributes.commands`,
   `activationEvents`, `engines.vscode`.
7. Definition of done: a VS Code user installs the extension, opens a curriculum
   folder, reads a chapter, and runs a Python code block without leaving VS Code.

---

#### Lesson 48 — Language Server Integration

**What you will build:**
Python and TypeScript code blocks in Codex get language server diagnostics —
red squiggles under type errors, hover-to-see-documentation, Go-to-definition.
In the Electron and web app this requires a language server process; in the
VSCode extension, Monaco can delegate to VS Code's own language servers.

**CS concepts introduced:** The language server protocol (LSP) — a JSON-RPC
protocol over stdin/stdout that separates the language intelligence (the server)
from the editor (the client). Any editor implementing LSP can use any LSP server.
**SE concepts introduced:** Protocol as the boundary — LSP means the Python
language server (Pylance, Pyright) does not know about Codex or Monaco. It speaks
a standard protocol. This is the open/closed principle at the ecosystem level.

**Sections:**

1. What a language server is — a background process that analyses code and answers
   queries: "what are the diagnostics for this file?", "what is the type of this
   variable?", "where is this function defined?".
2. The Language Server Protocol — JSON-RPC messages over stdin/stdout. The editor
   sends `textDocument/didOpen` when a file is opened; the server responds with
   `textDocument/publishDiagnostics`.
3. Monaco's language client API — `monaco-languageclient`, which connects Monaco
   to an LSP server. The connection runs over a WebSocket.
4. Starting the language server as a child process (Electron/web) — pyright-langserver
   for Python, tsserver for TypeScript. The child process reads LSP messages from
   stdin and writes responses to stdout.
5. VSCode extension shortcut — VS Code already runs Pylance. The extension can
   register the webview's Monaco editor as a document in VS Code's workspace, and
   VS Code's existing language server provides diagnostics without running a second
   server.
6. Definition of done: a type error in a TypeScript code block shows a red squiggle
   with the correct message.

---

#### Lesson 49 — Publishing the Extension

**What you will build:**
The extension is packaged with `vsce` and published to the VS Code Marketplace.
The Electron app is rebuilt with code signing for macOS. The web app is deployed
as a static site (the Express server handles only the execution API; the React app
is static).

**SE concepts introduced:** The difference between packaging for distribution and
running in development. Code signing as a trust mechanism — macOS refuses to run
unsigned apps by default. The Marketplace as a distribution channel with its own
review process.

---

#### Lesson 50 — Phase 10 Review: One Codebase, Three Shells

**What you will build:**
A review lesson. The student traces the exact same user action ("run a Python code
block") through all three shells simultaneously:

```
Electron shell:  user → Monaco.onChange → IPC → main process → LocalExecutor
                 → child_process.spawn('python3') → stdout → IPC → output panel

Web shell:       user → Monaco.onChange → HTTP POST /api/execute → Express
                 → FallbackExecutor (Tier1: python3 or Tier2: Pyodide) → stdout
                 → response → output panel

VSCode ext:      user → Monaco.onChange → postMessage → extension host
                 → FallbackExecutor (Tier1: python3 or Tier2: Pyodide) → stdout
                 → postMessage → output panel
```

In all three cases:
- The renderer package (Monaco, the Run button, the output panel) is identical
- The executor package (FallbackExecutor, LocalExecutor, WASMExecutor) is identical
- The core package (content model, types) is identical
- Only the shell adapter changes

This is the proof of the architecture decision made in Lesson 01. It took 49
lessons to get here. Every lesson was a step toward this moment.

**Definition of done:** the student can articulate exactly which lines of code
differ across the three shells, and which lines are identical.

---

## Part 7 — Updated Concepts Table

| Concept                         | First Introduced |
|---------------------------------|------------------|
| Monorepo and npm workspaces     | Lesson 01        |
| React and JSX                   | Lesson 02        |
| Props and component design      | Lesson 02        |
| `react-markdown`                | Lesson 02        |
| Markdown parse tree / AST       | Lesson 03        |
| Component overrides as adapters | Lesson 03        |
| `shiki` syntax highlighting     | Lesson 03        |
| Content model as types          | Lesson 04        |
| IPC in Electron                 | Lesson 05        |
| Context isolation and preload   | Lesson 05        |
| `dialog.showOpenDialog`         | Lesson 06        |
| Promises and async/await        | Lesson 06        |
| Lazy loading                    | Lesson 08        |
| Adapter pattern                 | Lesson 08        |
| Observer pattern                | Lesson 09        |
| Debouncing                      | Lesson 09        |
| Strategy pattern                | Lesson 10        |
| Monaco editor                   | Lesson 11        |
| Controlled vs uncontrolled      | Lesson 11        |
| `useRef`                        | Lesson 13        |
| Child processes, stdin/stdout   | Lesson 15        |
| `child_process.spawn`           | Lesson 15        |
| Compilation vs interpretation   | Lesson 16        |
| Transpilation                   | Lesson 16        |
| SQLite and `better-sqlite3`     | Lesson 20        |
| Browser security model          | Lesson 22        |
| remark/rehype plugin pipeline   | Lesson 23        |
| KaTeX                           | Lesson 23        |
| Streams and event-driven I/O    | Lesson 24        |
| React Context API               | Lesson 26        |
| CSS custom properties           | Lesson 26        |
| VSCode extension API (preview)  | Lesson 28        |
| Chain of responsibility pattern | Lesson 29        |
| `ENOENT`, PATH, runtime probing | Lesson 30        |
| WebAssembly and Pyodide         | Lesson 31        |
| Registry pattern                | Lesson 32        |
| Service workers and Cache API   | Lesson 33        |
| Multi-file code blocks          | Lesson 34        |
| Virtual file system             | Lesson 35        |
| Serialisation and localStorage  | Lesson 36        |
| Declarative dependency mgmt     | Lesson 37        |
| Docker containers               | Lesson 39        |
| Circuit breaker pattern         | Lesson 40        |
| Rate limiting                   | Lesson 40        |
| Multi-stage Docker builds       | Lesson 41        |
| Inverted index                  | Lesson 45        |
| Web Workers                     | Lesson 45        |
| Data portability / export       | Lesson 46        |
| Language Server Protocol        | Lesson 48        |
| Code signing                    | Lesson 49        |

---

## Part 8 — The Complete Execution Decision Tree

```
User clicks Run on a code block
│
├── Is language in EXECUTABLE set?
│   └── No → render static code block, no Run button
│
└── Yes
    │
    ├── Tier 1: Is local runtime available? (AVAILABLE_RUNTIMES[lang] === true)
    │   └── Yes → spawn child process → capture stdout/stderr → return result
    │   └── No  ↓
    │
    ├── Tier 2: Is WASM runtime available for this language?
    │   └── Yes → load WASM module (CDN or cache) → run in sandbox → return result
    │   └── No  ↓
    │
    ├── Tier 3: Is remote executor reachable? (circuit breaker CLOSED)
    │   └── Yes → POST /api/execute → Docker container → return result
    │   └── No  ↓
    │
    └── Tier 4: Read-only
        → Disable Run button
        → Show: "Python is not installed. Install Python 3 from python.org
                 or click here to use the online version (requires internet)."
```

The message in Tier 4 is not a failure. It is a signpost. A student who sees it
knows exactly what to do next.
