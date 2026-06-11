# Lesson 13 — The Fallback Executor

## What You Will Build

Python blocks run in the browser via Pyodide — even on machines where Python is not installed.
The output panel shows `[Loading Python runtime — ~10 MB, first use only]` while Pyodide
initialises, then streams output line by line. If Pyodide fails to load, the block falls
to read-only with a clear message. This is the chain of responsibility pattern: Tier 1 (local
process) is tried first; Tier 2 (WASM) is tried second; Tier 3 (read-only) is the fallback.

---

## What You Need to Know First

- Lesson 6: `Executor` interface, `ExecutionResult`, `ExecutionOptions`
- Lesson 7: `RuntimeRegistry`, `canHandle`
- Lesson 12: the web shell, `WebApp.tsx`, the adapter pattern

---

## The Lesson

### Step 1 — WebAssembly (First Appearance)

**What WebAssembly is:**
WebAssembly (WASM) is a binary instruction format that browsers can compile and execute
at near-native speed. It is not JavaScript. It is not a plugin. The browser treats it as
a sandboxed execution environment: no file system access, no network access by default.

WASM was designed as a compilation target — you write code in C, C++, Rust, or another
language, compile it to WASM, and the result runs in any browser. The browser's WASM
runtime is standardised: the same WASM binary runs identically in Chrome, Firefox, and
Safari.

**Why WASM matters for Codex:**
Python is a C program. The CPython interpreter is ~8MB of C code. Compiling it to WASM
produces a ~8MB binary that the browser can run. The result: a full Python interpreter,
running in a browser tab, with no Python installed on the machine.

**Pyodide:**
Pyodide is CPython 3.11 compiled to WASM via Emscripten — a compiler toolchain that
converts C and C++ to WASM. Pyodide also includes:
- The Python standard library (as a `.zip` file loaded into the WASM virtual filesystem)
- numpy, pandas, scipy (pre-compiled to WASM, loaded on demand via `micropip`)
- A bridge between Python and JavaScript: Python can call JavaScript APIs and vice versa

**The sandbox:**
Pyodide's Python cannot access your real file system (the WASM sandbox prevents it).
It cannot make network requests directly. It is isolated — student code runs without
risk of touching real system resources.

**First load cost:**
The first time Pyodide runs, it downloads ~10MB from a CDN: the WASM binary and the
standard library. Subsequent runs are immediate — the browser caches the download. The
loading message is essential: without it, the student clicks Run and sees nothing for 3–10
seconds, depending on connection speed.

**CS lens:** WASM is a **portable bytecode format** — the same concept as Java bytecode
(runs on the JVM), .NET bytecode (runs on the CLR), and Lua bytecode (runs on the Lua VM).
The browser is the virtual machine that executes the bytecode. Portability is the key
property: compile once, run anywhere (that has a browser).

### Step 2 — The Chain of Responsibility Pattern

The chain of responsibility pattern defines a linked sequence of handlers. A request is
passed down the chain until a handler processes it. Handlers do not know about each other —
each only decides whether to handle the request or pass it on.

**In code:**
```
FallbackExecutor
  ├── try LocalExecutor (if python3 is installed → success, stop)
  ├── try WASMExecutor  (if CDN reachable → success, stop)
  └── try ReadOnlyExecutor (always → returns "not available" message)
```

Each executor in the chain implements the same `Executor` interface. The `FallbackExecutor`
is itself an `Executor` — the calling code does not know it is talking to a chain.

**CS lens:** This pattern appears throughout software:
- **HTTP middleware** (Express, Koa) — each middleware function can handle the request
  or call `next()` to pass to the next middleware
- **Event bubbling in the DOM** — a click event travels from the target element up to
  the document root; each ancestor can handle or ignore it
- **Exception handling** — a `try/catch` block handles the exception or lets it propagate
  to the outer block
- **Unix exit code conventions** — a shell script tries commands in sequence with `||`

**SE lens:** The chain of responsibility is the correct pattern here because:
1. The handlers are ordered by preference, not by capability
2. The first handler that succeeds terminates the chain
3. Adding a new tier (e.g., a remote Docker executor) is adding a new link in the chain —
   no existing handler changes
4. The calling code (`WebApp.tsx`) does not know how many tiers exist

This is the open/closed principle applied to execution tiers.

### Step 3 — The WASM Executor

In `packages/executor/src/WASMExecutor.ts`:

```typescript
import type { Executor, ExecutionOptions, ExecutionResult } from './types'

type PyodideAPI = {
  runPythonAsync: (code: string) => Promise<void>
  setStdout: (config: { batched: (text: string) => void }) => void
  setStderr: (config: { batched: (text: string) => void }) => void
  loadPackagesFromImports: (code: string) => Promise<void>
}

const WASM_LANGUAGES = new Set(['python', 'py'])

let pyodidePromise: Promise<PyodideAPI> | null = null

function loadPyodide(): Promise<PyodideAPI> {
  if (pyodidePromise !== null) return pyodidePromise

  pyodidePromise = new Promise<PyodideAPI>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js'

    script.onload = () => {
      ;(window as unknown as { loadPyodide: () => Promise<PyodideAPI> })
        .loadPyodide()
        .then(resolve)
        .catch(reject)
    }

    script.onerror = () => reject(new Error('Failed to load Pyodide from CDN'))
    document.head.appendChild(script)
  })

  return pyodidePromise
}

export class WASMExecutor implements Executor {
  readonly name = 'wasm'

  canHandle(language: string): boolean {
    return WASM_LANGUAGES.has(language)
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { code, timeoutMs = 30_000 } = options
    const startTime = Date.now()

    const pyodide = await loadPyodide()

    const stdout: string[] = []
    const stderr: string[] = []

    pyodide.setStdout({
      batched: (text: string) => {
        for (const line of text.split('\n')) {
          if (line.length > 0) stdout.push(line)
        }
      }
    })

    pyodide.setStderr({
      batched: (text: string) => {
        for (const line of text.split('\n')) {
          if (line.length > 0) stderr.push(line)
        }
      }
    })

    try {
      await pyodide.loadPackagesFromImports(code)
    } catch {
      // Package loading failure is non-fatal — the code may still work
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeoutMs)
    )

    try {
      await Promise.race([
        pyodide.runPythonAsync(code),
        timeoutPromise,
      ])

      return {
        stdout,
        stderr,
        exitCode: 0,
        durationMs: Date.now() - startTime,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      const isTimeout = errorMessage === 'timeout'

      return {
        stdout,
        stderr: [
          ...stderr,
          isTimeout ? `[Execution timed out after ${timeoutMs}ms]` : errorMessage,
        ],
        exitCode: 1,
        durationMs: Date.now() - startTime,
      }
    }
  }
}
```

**CDN lazy loading explained:**
The Pyodide script (~600KB, just the JS loader; the WASM binary loads later) is inserted
into `document.head` as a `<script>` tag. The browser downloads and executes it, which
makes `window.loadPyodide` available. `script.onload` fires when the browser finishes.

The `pyodidePromise` module-level variable ensures the script is only injected once.
If `loadPyodide()` is called from 5 code blocks on the same page, only one `<script>` tag
is created. All 5 callers get the same Promise and the same Pyodide instance.

**`pyodide.setStdout({ batched: ... })` explained:**
By default, Pyodide redirects Python's `print()` output to the browser console. `setStdout`
replaces that with a custom function. The `batched` option calls the function with a
batch of text (multiple `print()` calls may be batched together for performance). We split
on `'\n'` to recover individual lines.

**`loadPackagesFromImports` explained:**
Pyodide scans the code for `import` statements and downloads the corresponding packages
from a WebAssembly package repository. `import numpy as np` causes Pyodide to download
the numpy WASM build (~8MB, cached after first download). This must complete before
`runPythonAsync` — otherwise the import fails.

**`Promise.race` for timeout explained:**
`Promise.race([A, B])` resolves or rejects with whichever of `A` or `B` settles first.
We race the Python execution against a timeout Promise that rejects after `timeoutMs`.
If Python finishes first, `Promise.race` resolves with Python's result and the timeout
is never triggered. If the timeout fires first, `Promise.race` rejects and we stop
waiting for Python. Note: Pyodide is still running in the background (we cannot cancel
WASM execution from JavaScript). The timeout aborts our wait, not the execution itself.

### Step 4 — The Fallback Executor

In `packages/executor/src/FallbackExecutor.ts`:

```typescript
import type { Executor, ExecutionOptions, ExecutionResult } from './types'

export class FallbackExecutor implements Executor {
  readonly name = 'fallback'

  private readonly chain: Executor[]

  constructor(chain: Executor[]) {
    this.chain = chain
  }

  canHandle(language: string): boolean {
    return this.chain.some(executor => executor.canHandle(language))
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { language } = options

    for (const executor of this.chain) {
      if (!executor.canHandle(language)) continue

      try {
        return await executor.execute(options)
      } catch (err) {
        if (this.isLastHandler(executor, language)) {
          throw err
        }
        // Log and try next executor
        console.warn(`[${executor.name}] failed, trying next:`, err)
      }
    }

    return {
      stdout: [],
      stderr: [
        `No executor available for language: ${language}`,
        'Install the runtime locally, or check your internet connection for browser-based execution.',
      ],
      exitCode: -1,
      durationMs: 0,
    }
  }

  private isLastHandler(executor: Executor, language: string): boolean {
    const handlersForLanguage = this.chain.filter(e => e.canHandle(language))
    return handlersForLanguage[handlersForLanguage.length - 1] === executor
  }
}
```

**`this.chain.some(...)` explained:**
`Array.prototype.some` returns `true` if at least one element satisfies the predicate.
`this.chain.some(executor => executor.canHandle(language))` asks: "is there any executor
in the chain that can handle this language?" This is used in `canHandle` so the
`FallbackExecutor` can correctly report its capabilities to callers.

**Error propagation strategy:**
When an executor throws (as opposed to returning a result with a non-zero exit code),
we log the error and try the next executor. The exception means the executor failed to
run (e.g., Pyodide CDN was unreachable), not that the code ran and produced an error.
If it is the last handler for this language, we re-throw — the caller should know
execution is completely unavailable.

### Step 5 — Wiring the Fallback Executor in the Web Shell

In `apps/web/src/WebApp.tsx`:

```typescript
import { FallbackExecutor, WASMExecutor, LocalExecutor } from '@codex/executor'

const executor = new FallbackExecutor([
  new WASMExecutor(),
])
```

The web shell does not include `LocalExecutor` (which requires Node.js child processes).
The Electron shell (updated in this lesson) includes both:

```typescript
// In apps/electron/src/main.ts, the IPC handler now uses:
const executor = new FallbackExecutor([
  new LocalExecutor(),
  new WASMExecutor(),
])
```

Pass the executor to `ChapterView` via the `onRun` prop:

```typescript
onRun={async (lang, code) => executor.execute({ language: lang, code })}
```

**Why the web shell omits `LocalExecutor`:**
`LocalExecutor` uses `child_process.spawn`, which is a Node.js API. Node.js does not run
in the browser. Attempting to import `child_process` in a Vite web build would fail.
Vite's browser build strips Node.js-specific modules, but attempting to call `spawn`
would throw at runtime.

The executor package must handle this cleanly. In Lesson 18, an optional peer dependency
pattern separates the Node.js-specific executor from the WASM executor.

---

## Connect the Pieces

The `FallbackExecutor` is the architecture of the entire execution system from this lesson
forward. Every execution lesson adds either a new executor (a new chain link) or modifies
an existing one.

Lesson 14 adds SQL, Lua, Ruby, and C to `WASMExecutor`. Lesson 18 adds `RemoteExecutor`
for Go and Rust. Lesson 19 adds a circuit breaker around `RemoteExecutor`.

---

## What Breaks Without This

If `pyodidePromise` is not module-level — if `loadPyodide()` creates a new Promise on
every call — clicking Run on two Python blocks simultaneously creates two Pyodide instances.
Pyodide's `setStdout` is a global — the second instance overwrites the first instance's
stdout capture. Output from both scripts is captured by whichever stdout handler was set
last. The first script's output disappears or is misattributed to the second script.

---

## Definition of Done

- [ ] `npm run dev:web`: click Run on a Python block → `[Loading Python runtime…]` appears,
      then `hello world` appears
- [ ] Run a second Python block immediately — it is instant (Pyodide is cached)
- [ ] A Python `NameError` shows correctly in the web shell
- [ ] Block the Pyodide CDN URL in DevTools (Network tab → block URL) → Run shows a
      clear "unavailable" message, not a crash
- [ ] In the Electron shell: Python runs via `LocalExecutor`; confirm via status bar
- [ ] You can answer: what is the chain of responsibility pattern and how does it differ
      from the strategy pattern?
- [ ] You can answer: why can `Promise.race` timeout on WASM execution but not cancel it?
- [ ] `git commit` with a message explaining why
