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

| Library | What it does | Why this one |
|---|---|---|
| `react-markdown` | Parses a markdown string and renders React elements | The standard; has a component override API we depend on |
| `@monaco-editor/react` | Embeds the Monaco editor (the VS Code editor engine) as a React component | The only production-quality embeddable code editor |
| `katex` | Renders LaTeX math to HTML | Faster than MathJax; works without a server |
| `remark-math` | Teaches react-markdown to find `$...$` and `$$...$$` syntax | The remark plugin ecosystem is how react-markdown is extended |
| `rehype-katex` | Renders the math nodes KaTeX finds as HTML | Works with remark-math as a pair |
| `remark-gfm` | GitHub Flavoured Markdown — tables, strikethrough, task lists | The standard markdown dialect; your lessons likely use it |
| `chokidar` | File system watcher | The standard Node.js file watcher; used by Vite internally |
| `shiki` | Syntax highlighting for static code blocks | Tree-sitter based; supports every language; used by VS Code |
| `electron` | Desktop shell | Chosen in the PDM project; consistent toolchain |
| `vite` | Build tool and dev server | Consistent with the PDM project toolchain |

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

| Concept | First Introduced |
|---|---|
| Monorepo and npm workspaces | Lesson 01 |
| React and JSX | Lesson 02 |
| Props and component design | Lesson 02 |
| `react-markdown` | Lesson 02 |
| Markdown parse tree / AST | Lesson 03 |
| Component overrides as adapters | Lesson 03 |
| `shiki` syntax highlighting | Lesson 03 |
| Content model as types | Lesson 04 |
| IPC in Electron (recap/intro) | Lesson 05 |
| Context isolation and preload | Lesson 05 |
| `dialog.showOpenDialog` | Lesson 06 |
| Promises and async/await | Lesson 06 |
| `fs.readdir`, `path.join` | Lesson 06 |
| Lazy loading | Lesson 08 |
| Adapter pattern | Lesson 08 |
| Observer pattern | Lesson 09 |
| `chokidar` | Lesson 09 |
| Debouncing | Lesson 09 |
| Strategy pattern | Lesson 10 |
| Monaco editor | Lesson 11 |
| Controlled vs uncontrolled | Lesson 11 |
| `useRef` | Lesson 13 |
| Child processes, stdin/stdout | Lesson 15 |
| `child_process.spawn` | Lesson 15 |
| Compilation vs interpretation | Lesson 16 |
| Transpilation | Lesson 16 |
| SQLite and `better-sqlite3` | Lesson 20 |
| Browser security model | Lesson 22 |
| remark/rehype plugin pipeline | Lesson 23 |
| KaTeX | Lesson 23 |
| Streams and event-driven I/O | Lesson 24 |
| React Context API | Lesson 26 |
| CSS custom properties | Lesson 26 |
| VSCode extension API | Lesson 28 |

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
