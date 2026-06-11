# Lesson 28 — Streaming Output

## What You Will Build

A Python loop that prints one line per second shows each line as it arrives — not all at
once when the script finishes. The output panel updates in real time. A script that runs
for 10 seconds is readable and informative from the first second. This lesson also names a
design mistake in the current executor interface and fixes it cleanly.

---

## What You Need to Know First

- Lesson 6: `LocalExecutor`, `runProcess`, the `Executor` interface, `ExecutionResult`
- Lesson 9: `CodeBlock`, `runState`, the output panel

---

## The Lesson

### Step 1 — What Streaming Means and Why the Current Design Fails

The current `Executor` interface:

```typescript
interface Executor {
  execute(options: ExecutionOptions): Promise<ExecutionResult>
}
```

This interface accumulates all stdout/stderr lines and resolves the Promise when the process
exits. The UI updates once — when everything is done.

**Why this is wrong for long-running programs:**
A Python script that does this:
```python
import time
for i in range(5):
    print(f"step {i}")
    time.sleep(1)
```

Under the current design, the output panel shows nothing for 5 seconds, then all five
lines appear simultaneously. The student sees no progress. If the script runs for 30 seconds,
there is no indication it is working.

**What we want instead:**
Each line appears as it is printed. The output panel is a live view of the process's stdout,
not a replay at the end.

**The design fix — adding `onOutput`:**
We extend the executor options to accept a callback that is called each time a line arrives:

```typescript
export interface ExecutionOptions {
  readonly language: string
  readonly code: string
  readonly timeoutMs?: number
  readonly onOutput?: (line: string, stream: 'stdout' | 'stderr') => void
}
```

The `Promise<ExecutionResult>` still resolves at the end — for the final exit code and
duration — but the `onOutput` callback fires incrementally. This is an **additive change**:
existing code that does not pass `onOutput` continues to work unchanged.

**CS lens:** This is the **observer pattern** again. The executor is the subject; the
`onOutput` callback is the observer. Each time the child process emits a line, the executor
notifies all registered observers. The observer (the output panel) can update the UI
immediately, rather than waiting for the subject to finish.

**SE lens:** The principle here is **designing for streaming from the start is easier than
retrofitting it**. The change is small — one optional callback in `ExecutionOptions` — but
its effect is large. If we had shipped the product with the non-streaming design, changing
it later would require updating every caller and every test. Adding it now, before users
depend on the old behaviour, costs almost nothing.

### Step 2 — Update `LocalExecutor` to Call `onOutput`

In `packages/executor/src/LocalExecutor.ts`, update `execute`:

```typescript
async execute(options: ExecutionOptions): Promise<ExecutionResult> {
  const { language, code, timeoutMs = 10_000, onOutput } = options
  const command = LANGUAGE_COMMANDS[language]

  if (command === undefined) {
    throw new Error(`LocalExecutor cannot handle language: ${language}`)
  }

  const tempFilePath = join(tmpdir(), `codex-${Date.now()}.${command.extension}`)
  await writeFile(tempFilePath, code, 'utf-8')

  try {
    return await runProcess(command.binary, [tempFilePath], timeoutMs, onOutput)
  } finally {
    await unlink(tempFilePath).catch(() => {})
  }
}
```

Update `runProcess` to accept and call `onOutput`:

```typescript
function runProcess(
  binary: string,
  args: string[],
  timeoutMs: number,
  onOutput?: (line: string, stream: 'stdout' | 'stderr') => void
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
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

    function processChunk(chunk: Buffer, stream: 'stdout' | 'stderr') {
      const lines = chunk.toString('utf-8').split('\n')
      for (const line of lines) {
        if (line.length === 0) continue
        if (stream === 'stdout') stdout.push(line)
        else stderr.push(line)
        onOutput?.(line, stream)  // fire the callback immediately
      }
    }

    childProcess.stdout.on('data', chunk => processChunk(chunk, 'stdout'))
    childProcess.stderr.on('data', chunk => processChunk(chunk, 'stderr'))

    childProcess.on('error', (err) => {
      clearTimeout(timeout)
      onOutput?.(`[spawn error: ${err.message}]`, 'stderr')
      resolve({ stdout, stderr: [...stderr, err.message], exitCode: -1, durationMs: Date.now() - startTime })
    })

    childProcess.on('close', (exitCode, signal) => {
      clearTimeout(timeout)
      const durationMs = Date.now() - startTime
      const signalLine = signal !== null ? [`[Process killed by signal: ${signal}]`] : []
      const timeoutLine = isTimedOut ? [`[Execution timed out after ${timeoutMs}ms]`] : []

      resolve({
        stdout,
        stderr: [...stderr, ...signalLine, ...timeoutLine],
        exitCode: exitCode ?? -1,
        durationMs,
      })
    })
  })
}
```

`onOutput?.(line, stream)` uses optional chaining — if no callback was provided, this
is a no-op. The accumulated `stdout` and `stderr` arrays still collect all output for
the final `ExecutionResult`. Nothing else changes.

### Step 3 — Update the IPC Handler for Streaming

The current IPC handler returns a single result at the end. For streaming, we need to
send incremental events while the process runs.

In `apps/electron/src/main.ts`:

```typescript
// New streaming IPC handler
ipcMain.handle(
  'execute:run',
  async (event, language: string, code: string) => {
    const executor = executors.find(e => e.canHandle(language))
    if (executor === undefined) {
      return { stdout: [], stderr: [`No executor for language: ${language}`], exitCode: 1, durationMs: 0 }
    }

    return executor.execute({
      language,
      code,
      onOutput: (line, stream) => {
        // Send the line to the renderer as it arrives
        event.sender.send('execute:output', { line, stream })
      },
    })
  }
)
```

`event.sender.send('execute:output', payload)` pushes a message from the main process to
the renderer without waiting for a request. This is the **push model** — the main process
pushes output as it arrives.

In `preload.ts`, expose the listener:

```typescript
onExecuteOutput: (callback: (payload: { line: string; stream: 'stdout' | 'stderr' }) => void) => {
  const listener = (_event: IpcRendererEvent, payload: unknown) => callback(payload as any)
  ipcRenderer.on('execute:output', listener)
  return () => ipcRenderer.removeListener('execute:output', listener)  // returns unsubscribe fn
},
```

The return value is an unsubscribe function — the component must call it when unmounted
to avoid memory leaks (a component that is destroyed but still has an active listener will
try to update React state that no longer exists, causing errors).

### Step 4 — Update `CodeBlock` to Show Live Output

In `CodeBlock.tsx`, change the `done` run state to `running` with accumulated output:

```typescript
type RunState =
  | { status: 'idle' }
  | { status: 'running'; stdout: string[]; stderr: string[] }
  | { status: 'done'; stdout: string[]; stderr: string[]; exitCode: number }
```

Update `handleRun`:

```typescript
async function handleRun() {
  if (!isRunnable || runState.status === 'running' || onRun === undefined) return
  const currentCode = editorRef.current?.getValue() ?? children

  // Start with empty output, show panel immediately
  setRunState({ status: 'running', stdout: [], stderr: [] })

  // Subscribe to streaming output
  const unsubscribe = window.codexAPI.onExecuteOutput(({ line, stream }) => {
    setRunState(prev => {
      if (prev.status !== 'running') return prev
      return {
        ...prev,
        stdout: stream === 'stdout' ? [...prev.stdout, line] : prev.stdout,
        stderr: stream === 'stderr' ? [...prev.stderr, line] : prev.stderr,
      }
    })
  })

  try {
    const result = await onRun(normalizedLanguage, currentCode)
    setRunState({
      status: 'done',
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    })
  } finally {
    unsubscribe()
  }
}
```

The output panel renders both `running` and `done` states — during `running`, the panel
shows lines as they arrive. On `done`, the final result (which includes all lines) is set.

**Why set the final result from `result` rather than the accumulated state?**
The streaming output might miss lines due to chunking edge cases (a chunk that spans two
lines at the boundary). The final `ExecutionResult` contains all output collected directly
from the child process streams. Using the final result ensures correctness; the streaming
display is best-effort for UX, not the source of truth.

---

## Security: Streaming Does Not Change the Trust Model

Streaming output makes the execution *experience* different — the student sees results in
real time — but the security model is identical to non-streaming execution (Lesson 05).

**What streaming adds as a surface:** The `onOutput` callback fires for each line of output
while the process is running. This means the renderer receives partial output from a
still-running process. A concern: could a malicious program produce an enormous volume of
output to exhaust memory in the renderer?

**The mitigation:** The timeout kills the process after `timeoutMs` milliseconds regardless
of output volume. The renderer accumulates output lines in React state — React re-renders
are batched, so a program that prints 10,000 lines per second will slow the UI but not
crash it. For production use, consider capping the accumulated output array at a maximum
length (e.g., 5,000 lines) and showing a truncation notice.

**The IPC push model and privilege:** `event.sender.send('execute:output', payload)` pushes
from the main process to the renderer. This is one-directional — the renderer cannot
escalate through this channel. The main process maintains control of when to call
`executor.execute()` and when to stop.

---

## Connect the Pieces

Every language executor automatically gets streaming because `onOutput` is called in
`runProcess`, which all local executors use. The Go, C, and Rust executors from Lessons 24–26
stream output immediately — a long C computation that prints progress will now show it live.

The Docker executor in Lesson 18 needs the same treatment: the `docker run` process also
emits output via stdout, and the same `onOutput` pattern applies.

---

## What Breaks Without This

Without streaming, a Python script that runs a training loop and prints loss every epoch
shows nothing for several minutes, then all loss values at once. The student cannot tell if
the script is running, stuck, or complete. Real-time feedback is a core part of the learning
experience, especially for computationally intensive code.

---

## Definition of Done

- [ ] A Python loop printing one line per second shows each line as it arrives (not all at once)
- [ ] The output panel shows output during the `running` state, not only after `done`
- [ ] The final output matches the streamed output (no lines missing)
- [ ] Calling `unsubscribe()` when the component unmounts does not cause errors
- [ ] JavaScript and TypeScript blocks also stream output
- [ ] You can answer: what is the observer pattern?
- [ ] You can answer: why does the final `result` take precedence over accumulated streaming state?
- [ ] `git commit` with a message explaining why
