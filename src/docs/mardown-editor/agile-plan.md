# Codex — Agile Curriculum Plan (Contract-Compliant)

**Contract:** Every lesson in this plan is written to the [Lesson Contract](../LESSON_CONTRACT.md).
This document is the plan. The lessons are the implementation. Before writing any lesson,
verify it satisfies every item in the contract checklist. "Goes beyond, never falls short" is
the bar. The lesson count is whatever the content requires — not a target.

---

## How This Plan Maps to the Contract

### The Agile Rule (non-negotiable)

> *"Every lesson must end with something the student can run and see."*

Every lesson in this plan is labelled with its **Visible Output** — the exact thing on screen
at the end of the lesson. If a lesson cannot be described this way, it is not a lesson.
It is documentation, and it belongs in the project README, not the curriculum.

### The Six Required Sections

Every lesson must have these sections in this order:

1. **What you will build** — the working software this lesson produces
2. **What you need to know first** — explicit prerequisites
3. **The lesson** — code in smallest-runnable steps, each with walkthrough + both lenses
4. **Connect the pieces** — new code mapped to the full system
5. **What breaks without this** — one concrete, specific failure mode
6. **Definition of done** — verifiable checklist including a git commit

### First Appearances

The contract requires every concept to be defined at its first use. This table
records which lesson introduces each domain. A lesson may not assume prior knowledge
of these domains unless the lesson below has already been completed.

| Domain | Lesson | First concept introduced |
|--------|--------|--------------------------|
| Version control | 1 | What git is, three file states, commits, commit messages |
| Package management | 1 | npm, `package.json`, dependencies vs devDependencies, semver, lock file |
| Terminal commands | 1 | `npm`, `npx`, flags, expected output, failure modes |
| Tooling | 1 | What Vite does (dev vs prod), what tsc does |
| File structure | 1 | Monorepo layout, why each file lives where it does |
| Code syntax (TypeScript) | 1 | Arrow functions, interfaces, generics — explained at first use |
| Imports as contracts | 1 | Module responsibility, named vs default, why not `import *` |
| Data types as decisions | 2 | TypeScript types: what they hold, what they prevent, why this over alternatives |
| Browser / runtime APIs | 2 | Electron's `BrowserWindow`, `ipcMain`, `ipcRenderer` |
| Debugging | 3 | Which tool reveals which error; how to read a stack trace |
| Security | 5 | First user input = first XSS / injection explanation |
| Performance | 9 | Hot paths, debouncing, 16.6ms budget |
| Networking | 13 | `localhost`, ports, dev server vs production server |
| Professional practices | 1 | Commit messages: why, not what |

### The Two Lenses (required on every significant code block)

- **CS lens:** Name the concept. Hash map. Recursive descent. State machine. Do not leave it implicit.
- **SE lens:** Name the principle. SRP, open/closed, dependency inversion. Explain the decision.

### Walkthroughs (required on every significant code block)

Not a comment on every line — a prose trace of execution. What values go in, what decisions
are made, what comes out. The student should be able to trace the code in their head after
reading it.

---

## Sprints

---

### Sprint 1 — Read a Curriculum

**Outcome:** A student opens a folder of markdown files in an Electron window, sees a
sidebar of chapters, clicks one, and reads it with syntax-highlighted code and rendered
math.

**Why this first:** The contract says build the visual output first. Every subsequent
lesson adds to something already visible. A reader with no execution capability is still a
useful tool.

**Contract obligations specific to this sprint:**
- Git, npm, and the terminal are introduced for the first time — the contract requires full
  treatment of all three
- The monorepo layout is explained at its first appearance (file structure domain)
- Every import in every lesson is explained fully — module responsibility, what is imported, why

---

#### Lesson 1 — The Monorepo and the First Window

**Visible output:** An Electron window opens showing a hardcoded heading: "Codex." Nothing
else. The simplest possible proof that the app shell works.

**Why this is the first lesson:** The contract says never build invisible infrastructure.
A working window is not infrastructure — it is the skeleton onto which everything else will
be added. The student runs `npm run dev` and sees a window. Every lesson after this will
add to that window.

**CS concepts introduced:** None yet — this lesson is about environment, not algorithms.

**SE concepts introduced:** Monorepo — one repository, multiple packages with clear
boundaries. Why: so the `renderer` package can later be reused in the web shell and the
VSCode extension without copying code.

**Define at use — first appearances:**

*Version control (domain 10):*
Git is introduced here because the definition of done requires a commit. Full treatment:
what version control is and why it exists, the three states of a file (modified/staged/
committed), what a commit is, what a commit message communicates (why, not what). The
commit message format is taught once and required in every subsequent lesson.

*Package management (domain 9):*
`npm workspaces` appears in the `package.json`. Full treatment: what npm is, what a
workspace is, `dependencies` vs `devDependencies`, semver (`^5.0.0` means `>=5 <6`),
`package-lock.json` (committed, never hand-edited), `node_modules` (never committed).

*Terminal commands (domain 5):*
`npm install`, `npm run dev` — full treatment: what program, what subcommand, what flags,
what successful output looks like, what a failure looks like and how to diagnose it.

*Tooling (domain 6):*
Vite: what it does in development (dev server + on-demand compile) vs production (bundle).
Electron: what it is, what problem it solves (a web app that has access to the file system
and native OS APIs).

*File structure (domain 8):*
`packages/core`, `packages/renderer`, `apps/electron` — each explained: its responsibility,
why it lives where it does, what would break if it were missing.

*Imports (domain 2):*
Every import in the Electron entry file explained: which module, its single responsibility,
what is imported and why.

*Code syntax (domain 1):*
Arrow functions at first use. TypeScript `interface` at first use.

**Definition of done:**
- [ ] `npm run dev` opens an Electron window with a heading
- [ ] `npm install` from a clean clone works without errors
- [ ] The terminal output is explained and understood
- [ ] `git commit` with a message that explains why this commit exists, not what files changed

---

#### Lesson 2 — Open a Folder and List Chapters

**Visible output:** A sidebar on the left of the Electron window lists the names of every
`.md` file in a folder the student selects using a native file picker dialog.

**CS concepts introduced:** File system traversal — reading a directory recursively.
The `fs` module as an interface to the OS file system.

**SE concepts introduced:** The core package as the single source of truth for content.
No other package reads the file system directly. Why: so changing the storage format later
(e.g., from files to a database) requires changing only `core`.

**Define at use — first appearances:**

*Browser/runtime APIs (domain 11):*
`dialog.showOpenDialog` — what it does, what it returns (a `Promise<string[]>`), what happens
if the user cancels (empty array). IPC — Inter-Process Communication. What Electron's
main/renderer process split means. Why the renderer cannot call `dialog.showOpenDialog`
directly (security model: renderer processes are sandboxed; only the main process has OS
access). The preload script: the narrow bridge between renderer and main process.

*Data types (domain 3):*
The `Chapter` type — what it holds (title, path, order), what it cannot hold, why a
plain `string[]` would not be enough.

**Definition of done:**
- [ ] Clicking "Open Folder" shows a native folder picker
- [ ] After selecting a folder, the sidebar lists `.md` files sorted by filename
- [ ] Selecting a folder with no `.md` files shows an empty sidebar with a message
- [ ] `git commit`

---

#### Lesson 3 — Render a Chapter

**Visible output:** Clicking a chapter in the sidebar replaces the main area with the
rendered markdown — headings, paragraphs, bold text, inline code, and fenced code blocks
(unstyled for now).

**CS concepts introduced:** The abstract syntax tree (AST) — `react-markdown` parses
markdown text into a tree of nodes. The renderer walks this tree and converts each node
to a React element. Parsing as a two-stage process: text → AST → output.

**SE concepts introduced:** The component override as an adapter — `react-markdown`'s
`components` prop maps node types to React components. This is the open/closed principle:
`react-markdown` is closed for modification; we extend it for rendering by providing
adapters, not by forking it.

**Define at use — first appearances:**

*Debugging (domain 13):*
React DevTools — how to open them, how to read the component tree, what a stack trace
looks like when a React component throws. This is introduced here because lesson 3 is
the first place a React error is likely.

*Code syntax:*
`useEffect`, `useState` at first use — full explanations.

**Definition of done:**
- [ ] All six markdown text types render correctly (heading, paragraph, bold, italic, inline code, list)
- [ ] Code blocks render as `<pre><code>` with no styling yet
- [ ] Clicking a different chapter re-renders the content area
- [ ] `git commit`

---

#### Lesson 4 — Syntax Highlighting and Math

**Visible output:** Code blocks are syntax-highlighted with colours. A fenced block
labelled ` ```python ``` ` renders Python with Python colours. A `$E=mc^2$` expression
renders as a properly typeset equation.

**CS concepts introduced:** The remark/rehype pipeline — remark transforms markdown AST
to HTML AST (hast); rehype transforms hast to React. Plugins hook into this pipeline.
`remark-math` adds a math node type. `rehype-katex` converts math nodes to typeset HTML.

**SE concepts introduced:** The plugin pipeline as a chain of transformers. Each plugin
does one thing. Composing them produces complex behaviour from simple pieces. This is the
same principle as Unix pipes.

**Define at use:**
`shiki` — what it is (a syntax highlighter using TextMate grammars), how it differs from
other highlighters (it loads grammar files, which are large; lazy-loading matters here).
KaTeX — what it is, why it is not MathJax (faster, smaller, synchronous rendering).

**Definition of done:**
- [ ] A Python code block shows Python syntax colours
- [ ] `$x^2 + y^2 = r^2$` renders as a typeset equation
- [ ] A `yaml` block renders with YAML colours
- [ ] `git commit`

---

### Sprint 2 — Run Code Inline

**Outcome:** A student clicks Run on a Python or JavaScript code block and sees output
stream below it. Errors show the line number and message. The student can edit the code
and re-run.

---

#### Lesson 5 — The Run Button

**Visible output:** Python and JavaScript code blocks have a Run button. Clicking it on
a Python block shows: `[Running Python…]`. No actual execution yet — just the button and
a placeholder.

**Why this order:** The contract says build the visible output first. The button is the
visual contract. The actual execution wiring comes next. A student who has a button that
does nothing visible is frustrated; a student who has a button that shows "Running..." is
motivated.

**CS concepts introduced:** The code block contract — a specification for which languages
show a Run button and which are static. This is a design decision, not an accident.
`bash` is runnable; `yaml` is not. The distinction: does running this produce output a
student learns from?

**SE concepts introduced:** Separation of concerns between the component (shows the button)
and the executor (runs the code). The `CodeBlock` component does not know how to run Python.
It knows only that a run was requested. Why: so swapping the executor later does not require
changing the component.

**Define at use — first appearances:**

*Security (domain 12):*
The code block accepts user-edited code and sends it for execution. This is the first point
of user-controlled input in the system. Full treatment: name the threat (code injection —
user-submitted code running in the student's own process), how the design prevents damage
(sandboxed execution, no network access inside the executor), what would happen without it.

**Definition of done:**
- [ ] Python and JavaScript blocks show a Run button; YAML, JSON, TOML do not
- [ ] Clicking Run shows `[Running Python…]`
- [ ] The button is disabled while "running"
- [ ] `git commit`

---

#### Lesson 6 — Local Execution via Child Processes

**Visible output:** `print("hello world")` in a Python block produces `hello world` in
the output panel. Output streams line-by-line — the student sees each line as it arrives,
not all at once at the end.

**CS concepts introduced:** Processes and child processes — the OS concept of an isolated
unit of execution with its own memory space. `stdin`, `stdout`, `stderr` — the three
standard streams every process has. Streams as event-driven I/O: data arrives as events,
not as a synchronous return value.

**SE concepts introduced:** The `Executor` interface — `execute(language, code): Promise<Result>`.
The `LocalExecutor` implements it. This is the strategy pattern: the code block calls
`execute()` without knowing whether it will use Python, Node, or a WASM runtime.
Strategy pattern: named, defined, connected to the code.

**Define at use:**
`child_process.spawn` — what it does (starts a new OS process), what arguments it takes,
what it returns (a `ChildProcess` handle), how to listen for stdout data events, how to
detect when the process exits. `ENOENT` — the OS error when the binary does not exist on
PATH. What `PATH` is.

**Definition of done:**
- [ ] `print("hello world")` in Python outputs `hello world`
- [ ] A 5-line Python script that prints in a loop streams all 5 lines
- [ ] A `console.log("hi")` JavaScript block outputs `hi`
- [ ] `git commit`

---

#### Lesson 7 — Runtime Detection and Status

**Visible output:** A small status bar at the bottom of the window shows coloured dots:
`python ✓  node ✓  gcc ✗`. The student knows at a glance which runtimes are available.

**CS concepts introduced:** Fail-fast detection — checking preconditions at startup rather
than at the moment of use. `Promise.all` — running probes in parallel so startup is not
serialised. Process exit codes — convention: 0 means success, non-zero means failure.

**SE concepts introduced:** The probe as a startup contract: the app discovers its
capabilities once and caches the result. This is an application of the flyweight pattern
(shared state computed once and reused) and the principle of least surprise (the user
sees the app's capability immediately, not when they first click Run and get an error).

**Definition of done:**
- [ ] Status bar shows correct state for every runtime on the student's machine
- [ ] Clicking Run on a language with no local runtime shows a clear message (not a crash)
- [ ] `git commit`

---

#### Lesson 8 — Error Display and TypeScript Execution

**Visible output:** A Python syntax error shows the error message and line number in the
output panel, highlighted in red. A TypeScript block runs via `tsx`.

**CS concepts introduced:** Exit codes — a non-zero exit code means the process failed.
`stderr` vs `stdout` — by convention, programs write errors to `stderr` and output to
`stdout`. Why: so programs can be composed in pipelines without errors corrupting data.

**SE concepts introduced:** Error as data, not as exception — the executor returns
`{ stdout, stderr, exitCode }`, not throws. Why: an executor that throws forces every
caller to use try/catch; returning structured data allows callers to decide how to handle
it without coupling them to the control flow.

**Define at use:**
`tsx` — what it is (TypeScript execute — runs TypeScript files directly via esbuild),
why not `tsc && node` (slower, requires output files), how `tsx` finds the TypeScript
version in the project's `node_modules`.

**Definition of done:**
- [ ] A Python file with a syntax error shows the error message and line number in red
- [ ] A TypeScript block that uses a type annotation runs correctly
- [ ] `git commit`

---

### Sprint 3 — Edit and Re-Run

**Outcome:** The student's code edits persist between sessions. The Monaco editor replaces
the textarea. Curriculum authors see changes live without restarting the app.

---

#### Lesson 9 — Monaco Editor

**Visible output:** The code block editor is Monaco — the same editor used in VS Code.
Syntax highlighting, bracket matching, and multi-cursor editing work.

**CS concepts introduced:** The document model — Monaco stores text as a `Model` object,
not a string. The model fires change events; React listens to events rather than polling.

**SE concepts introduced:** Controlled vs uncontrolled components — React's distinction
between components that own their state (uncontrolled) and components driven by props
(controlled). Monaco is an uncontrolled imperative component. `useRef` gives React a
handle to the Monaco instance. Why `useRef` and not `useState`: the editor instance is
not data the component renders; it is an imperative handle to an external API.

**Define at use — first appearances:**

*Performance (domain 14):*
Monaco fires `onChange` on every keystroke — this is a hot path. Running any expensive
computation on every keystroke would freeze the editor. Debouncing is introduced here:
waiting 300ms after the last keystroke before doing anything expensive. The concrete
budget: a keystroke handler must complete in under 16.6ms (one frame) or the editor lags.

**Definition of done:**
- [ ] Monaco renders for every code block with correct language highlighting
- [ ] Typing in Monaco updates the code that will be run when Run is clicked
- [ ] The editor does not lag on fast typing (tested with sustained keyboard input)
- [ ] `git commit`

---

#### Lesson 10 — Code Persistence

**Visible output:** Edit a code block, close the app, reopen it — the edit is there.
A "Reset" button per block restores the original code from the markdown file.

**CS concepts introduced:** Serialisation — converting an in-memory data structure (a
`Map<string, string>`) to a string (JSON) for storage, and deserialising it back.
A content hash as a stable key — hashing the original code rather than using position,
so if the lesson author inserts a new block, existing stored edits are not shifted.

**SE concepts introduced:** The source of truth hierarchy — the markdown file is the
ground truth; `localStorage` is a user-layer overlay. The reset operation is always
available because the ground truth is immutable. This is the same principle as git:
the repository is the truth; the working tree is an overlay.

**Define at use:**
`localStorage` — key/value store, strings only, persistent across sessions, scoped to
the origin, synchronous API. The origin: what it is (`scheme + host + port`), why
`localhost:5173` and `localhost:3000` have different storage.

**Definition of done:**
- [ ] Edit code, reload the page, edit is there
- [ ] Click Reset, original code is back
- [ ] Two blocks with identical original code each store independently
- [ ] `git commit`

---

#### Lesson 11 — Live Reload with chokidar

**Visible output:** The curriculum author edits a markdown file in their editor. The
app updates the rendered content in under 200ms without a page reload.

**CS concepts introduced:** The observer pattern — `chokidar` watches the file system
and emits events when files change. The app subscribes to these events. The observer
pattern: named, defined, connected to the code. The same pattern as DOM event listeners
and React's `useState` setter.

**SE concepts introduced:** Decoupling change detection from change response — `chokidar`
knows when files change; the renderer knows how to re-render. Neither knows about the
other. IPC carries the event. Why this separation: so the renderer could later be
replaced without changing the watcher.

**Definition of done:**
- [ ] Edit a markdown file in a text editor; the Electron app updates in under 200ms
- [ ] Deleting a chapter removes it from the sidebar
- [ ] Adding a new `.md` file adds it to the sidebar
- [ ] `git commit`

---

### Sprint 4 — Works Anywhere

**Outcome:** The curriculum opens in a browser tab (no Electron required). Python blocks
run via Pyodide when Python is not installed. The app works offline after first load.

---

#### Lesson 12 — The Web Shell

**Visible output:** `npm run dev:web` opens the app in a browser. The student can open
a local folder of markdown files and read them. No code execution yet.

**CS concepts introduced:** The browser security model — a browser page cannot access
the local file system without user permission. The File System Access API is the
browser's opt-in mechanism. `showDirectoryPicker()` — the browser equivalent of
Electron's `dialog.showOpenDialog`.

**SE concepts introduced:** The web shell as a second adapter over the same packages.
`renderer` and `core` are unchanged. Only the shell adapter changes. This is the payoff
of the architecture decision from Lesson 1.

**Define at use — first appearances:**

*Networking (domain 15):*
`localhost`, ports, dev server vs production server — introduced here because the web
shell is the first time the student sees an `http://localhost:5173` URL. Full treatment:
what localhost is, what a port is, why `5173` is Vite's default, what the dev server
does, what the gap between dev and production looks like.

**Definition of done:**
- [ ] `npm run dev:web` opens the app in a browser
- [ ] Folder picker works; chapters render
- [ ] Code blocks have a Run button but show "Python requires a local runtime or the
      browser fallback — loading…" (execution is not yet wired)
- [ ] `git commit`

---

#### Lesson 13 — The Fallback Executor

**Visible output:** A Python block in the web app runs and shows output, even with no
Python installed. The output panel shows `[Loading Python runtime — ~10MB, once only]`
while Pyodide initialises, then streams output.

**CS concepts introduced:** WebAssembly — a binary instruction format the browser compiles
and runs at near-native speed. Not JavaScript. Not a plugin. The browser sandboxes it:
no file system access, no network access. Pyodide: CPython 3.11 compiled to WASM via
Emscripten.

**SE concepts introduced:** The chain of responsibility pattern — the `FallbackExecutor`
holds an ordered list of executors. Each is tried in sequence; the first that succeeds
wins. If none succeed, the block falls to read-only. This pattern is the architectural
backbone of the execution tier.

**Define at use:**
`pyodide.runPythonAsync` — why async (the WASM module loads asynchronously; running code
before it loads throws). `pyodide.setStdout` — how Python's `print` is redirected to
a JavaScript callback.

**Definition of done:**
- [ ] Python block runs in browser with no local Python via Pyodide
- [ ] First load shows loading message; second run is immediate
- [ ] If Pyodide fails to load (simulate by blocking the CDN URL in DevTools), the block
      falls to read-only with a clear message
- [ ] `git commit`

---

#### Lesson 14 — WASM for SQL, Lua, Ruby, C

**Visible output:** sql.js renders a query result as a table. A Lua block, a Ruby block,
and a C block each run in the browser with output.

**CS concepts introduced:** The registry pattern — a `Map<string, WASMRunner>` where
each value is a factory function. Lazy loading at the module level — the CDN script is
not fetched until the language is first run.

**SE concepts introduced:** Open/closed applied to the WASM executor — adding a new
language is one entry in the map; no existing code changes. The same principle as the
dispatch table from an earlier lesson, applied to executor registration.

**Definition of done:**
- [ ] An SQL block renders a table of results
- [ ] Lua, Ruby, and C blocks each run with correct output
- [ ] A language with no WASM runtime shows a clear "not available in the browser" message
- [ ] `git commit`

---

#### Lesson 15 — Service Worker and Offline Cache

**Visible output:** Run a Python block once. Disable the network in DevTools. Reload the
app. Run the Python block again — it works.

**CS concepts introduced:** The service worker as a programmable HTTP proxy — it intercepts
`fetch` events and can serve cached responses. The Cache API: `caches.open`, `cache.match`,
`cache.put`. The service worker lifecycle: install → activate → fetch.

**SE concepts introduced:** Cache-aside pattern — check the cache first; if the resource is
there, serve it; if not, fetch, store, serve. This is the same pattern as CPU caches,
DNS resolvers, and the browser's own resource cache — applied at the application level.

**Definition of done:**
- [ ] Run Python block once (online). Disable network. Reload. Run again. Works.
- [ ] The app shows a "Ready offline" indicator after the service worker installs
- [ ] `git commit`

---

### Sprint 5 — Multi-File Projects

**Outcome:** A code block can declare multiple files. Python `import` works across files.
The student edits each file in a tab bar.

---

#### Lesson 16 — The Project Block

**Visible output:** A fenced block with ` ```python project ``` ` shows a tab bar with
multiple file tabs. Clicking a tab switches the Monaco editor to that file.

**CS concepts introduced:** The `meta` field of a fenced code block — the string after
the language tag (e.g., `python project`). The markdown parser exposes this as `node.data.meta`.
Parsing the `# file: name.py` boundary comments to split one string into multiple files.

**SE concepts introduced:** The open/closed principle applied to the code block renderer —
the new `project` modifier extends behaviour without modifying the existing `CodeBlock`
component. A `ProjectCodeBlock` composes the existing editor.

**Definition of done:**
- [ ] A project block with three files shows three tabs
- [ ] Editing one file and switching tabs preserves the edit
- [ ] `git commit`

---

#### Lesson 17 — Virtual Filesystem and Multi-File Execution

**Visible output:** A Python project block where `main.py` imports from `utils.py` runs
correctly. `from utils import greet` works.

**CS concepts introduced:** Virtual file systems — an abstraction layer presenting a
file system API backed by something other than a disk. Pyodide's `FS` API — the Emscripten
virtual FS exposed to JavaScript. `pyodide.FS.writeFile` writes a file the Python process
can then import.

**SE concepts introduced:** The adapter pattern for storage — the virtual FS presents
the same API as a real FS (read, write, exists). The executor does not know which it uses.

**Definition of done:**
- [ ] A two-file Python project with a `from utils import greet` import runs correctly
- [ ] The working directory is set correctly so relative imports resolve
- [ ] `git commit`

---

### Sprint 6 — Remote Execution

**Outcome:** Go and Rust blocks run via a Docker-backed execution API. The system
degrades gracefully when Docker is unavailable.

---

#### Lesson 18 — Docker Execution Sandbox

**Visible output:** A Go block and a Rust block each run in the browser, producing
correct output. Behind the scenes, the code is sent to a local Express server, run
in a Docker container, and the output is returned.

**CS concepts introduced:** Containers — a process with an isolated view of the file
system, network, and process table. Not a virtual machine (the kernel is shared).
Why containers are lightweight: copy-on-write file system, shared kernel.

**SE concepts introduced:** The principle of least privilege applied to untrusted code.
The container has no host file system access, no network access (`--network none`), a
memory cap, a CPU cap, and a hard timeout. Each of these limits is independent — any
one of them alone is insufficient.

**Define at use:**
`child_process.spawn` in Node.js (main process) for Docker commands. `--network none`,
`--memory`, `--cpus`, `docker stop` for cleanup. The `POST /api/execute` endpoint.

**Definition of done:**
- [ ] A Go block and a Rust block each run with correct output
- [ ] A block that exceeds the timeout is stopped; the student sees a timeout message
- [ ] `git commit`

---

#### Lesson 19 — Circuit Breaker and Rate Limiting

**Visible output:** Simulate the Docker backend being down. The Run button shows a clear
message ("Remote execution unavailable — retrying in 30s") rather than hanging or crashing.
After 3 failures, subsequent clicks skip the remote tier entirely and fall to read-only.

**CS concepts introduced:** The circuit breaker pattern — three states (CLOSED, OPEN,
HALF-OPEN). Transitions: 3 failures → OPEN; 30s cooldown → HALF-OPEN; 1 success →
CLOSED. The same pattern used in distributed systems (Netflix Hystrix, Resilience4j).

**SE concepts introduced:** Defence in depth — rate limiting, resource limits, and the
circuit breaker each independently limit damage. No single guard is sufficient. The
circuit breaker prevents cascading failures; rate limiting prevents resource exhaustion;
resource limits prevent runaway processes.

**Definition of done:**
- [ ] 3 simulated failures open the circuit breaker
- [ ] Subsequent Run clicks show the "unavailable" message instantly (no timeout wait)
- [ ] After 30s, the next click makes one trial request (HALF-OPEN)
- [ ] `git commit`

---

### Sprint 7 — Progress and Search

**Outcome:** The student tracks their progress. Completed chapters are marked. Full-text
search finds any term across the entire library.

---

#### Lesson 20 — Chapter Completion

**Visible output:** A "Mark complete" checkbox at the bottom of each chapter. Completed
chapters show a checkmark in the sidebar. A progress percentage is shown in the header.

**CS concepts introduced:** Persistent state vs session state. `localStorage` vs
`electron-store` — same data, different backing stores. The `ProgressStore` interface
abstracts over both.

**SE concepts introduced:** The adapter pattern applied to storage. The component calls
`progressStore.markComplete(chapterId)` — it does not know whether that data goes to
`localStorage` or a JSON file in the user's app data. Why: the web shell and the Electron
shell have different storage capabilities; the adapter isolates that difference.

**Definition of done:**
- [ ] Mark three chapters complete; restart the app; marks persist
- [ ] Progress percentage updates correctly
- [ ] `git commit`

---

#### Lesson 21 — Full-Text Search

**Visible output:** `Cmd+K` (Mac) / `Ctrl+K` (Windows) opens a search dialog. Typing
"closure" shows every chapter that mentions it, with a snippet of the surrounding text.
Results appear within 50ms.

**CS concepts introduced:** The inverted index — a map from every word to the list of
chapters containing it. O(1) lookup per word. Contrast with naive search: O(n × m) per
query. Building the index once at startup and querying the table is the right trade-off
when data is read-often and written-rarely.

**SE concepts introduced:** Web Workers for CPU-intensive background work. The indexing
pass scans every chapter's content — this is too slow for the main thread. A Web Worker
runs the indexer in a background thread. Communication via `postMessage` — serialisable
data only, no shared memory.

**Definition of done:**
- [ ] Search for a term that appears in 3 chapters; all 3 appear in results
- [ ] Results appear within 50ms for a 50-chapter library
- [ ] Clicking a result navigates to the chapter
- [ ] `git commit`

---

### Sprint 8 — The VS Code Extension

**Outcome:** A student installs the Codex extension, opens a curriculum folder from
within VS Code, reads a chapter, and runs a code block without leaving the editor.

---

#### Lesson 22 — The Extension and Webview

**Visible output:** In VS Code, running the command "Codex: Open Library" opens a folder
picker. Selecting a folder opens a panel showing the chapter sidebar and a rendered chapter
with a working Run button.

**CS concepts introduced:** The VS Code extension host — the process that runs extension
code. Has full Node.js access but no DOM. The webview — a sandboxed iframe inside a VS
Code panel. Has a DOM but no file system. They communicate only via `postMessage`.
Message passing between isolated contexts: the fundamental IPC model of the browser
security architecture.

**SE concepts introduced:** The webview as a third shell over the same packages. The
`renderer` and `executor` packages are unchanged. Only the IPC adapter changes. This is
the payoff of the architecture decision from Lesson 1 — seen for the third time in the
curriculum. The open/closed principle at the architecture level.

**Define at use:**
The extension `package.json` manifest — `contributes.commands`, `activationEvents`,
`engines.vscode`. `vscode.window.createWebviewPanel`. `panel.webview.postMessage` and
`window.addEventListener('message')` in the webview. `vsce` — the VS Code Extension
packaging tool.

**Definition of done:**
- [ ] "Codex: Open Library" opens a curriculum folder in VS Code
- [ ] A Python block runs with correct output
- [ ] The extension installs from a `.vsix` file with `code --install-extension`
- [ ] `git commit`

---

#### Lesson 23 — Language Server Diagnostics

**Visible output:** A type error in a TypeScript code block shows a red squiggle with
the correct message. Hovering the squiggle shows the error text.

**CS concepts introduced:** The Language Server Protocol — a JSON-RPC protocol over
stdin/stdout. The editor sends `textDocument/didChange`; the server responds with
`textDocument/publishDiagnostics`. LSP separates language intelligence from the editor.
Any editor implementing LSP can use any LSP server.

**SE concepts introduced:** Protocol as the boundary — the open/closed principle at the
ecosystem level. `tsserver` does not know about Codex or Monaco. It speaks a standard
protocol. This means any LSP-compliant server can be plugged in without changing Codex.

**Definition of done:**
- [ ] A TypeScript type error shows a red squiggle in the Monaco editor
- [ ] Hovering the squiggle shows the error message
- [ ] Correcting the error removes the squiggle
- [ ] `git commit`

---

## Lesson Count

**23 lessons.** Each produces working software. Each is a vertical slice.

The number is not 50 because the contract does not ask for 50 lessons — it asks for
lessons that meet the contract. Every lesson in this plan has a visible output, six
required sections, defined first appearances, and a git commit in its DoD. If a later
pass discovers a lesson is too large (violating the "smallest runnable unit" rule),
it is split. If it is too thin, it is merged with an adjacent lesson.

The right number of lessons is the number of distinct vertical slices the system
contains — no more, no less.

---

## What "Goes Beyond" Means Here

The contract sets a floor. "Goes beyond, never falls short" means:

1. **Maximum extraction** — every code block teaches every concept it contains, not
   just the one named in the lesson title. A lesson about `child_process.spawn` is
   also a lesson about process isolation, `stdout` as a stream, and event-driven I/O.

2. **Real-world connections** — every concept is connected to where it appears in
   production software. The chain of responsibility appears in Express middleware,
   the circuit breaker in Netflix Hystrix, the inverted index in Elasticsearch.

3. **Hard concepts are restated** — the contract requires brief restatement of
   design patterns, SE principles, and algorithms at every appearance. Not just their
   first introduction.

4. **Nothing is assumed** — a student who picks up Lesson 15 and has not done Lesson 8
   must still be able to follow Lesson 15. Prerequisite concepts are recapped, not assumed.
