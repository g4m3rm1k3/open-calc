# Lesson 7 — Runtime Detection and Status

## What You Will Build

A small status bar appears at the bottom of the Electron window. It shows a coloured dot
and label for every supported language runtime: `● python`, `● node`, `○ gcc`. Green dots
(●) indicate an available runtime; grey dots (○) indicate it is not installed. The student
knows immediately which languages they can run without clicking a button and seeing an error.
This status is computed once at startup and never recomputed.

---

## What You Need to Know First

- Lesson 6: `LocalExecutor`, child processes, `ENOENT`, `LANGUAGE_COMMANDS`
- Lesson 1: Electron main process, IPC, preload script
- Lesson 2: the `Window` type declaration, `useState`

---

## The Lesson

### Step 1 — What PATH Is and Why It Matters

When you type `python3` in a terminal, the shell does not search your entire disk for a
file named `python3`. It searches only a list of directories called `PATH`.

`PATH` is an environment variable — a named string accessible to every process. It contains
a colon-separated list of directories:

```
/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

The shell checks each directory in order. If `python3` is found in `/usr/local/bin`, it
stops there. If not found anywhere, the shell prints `command not found`.

**Why does the app need to understand PATH?**

The app's process inherits `PATH` from its parent process. On macOS, when an app is
launched by double-clicking its icon (not from a terminal), the inherited `PATH` is minimal:
`/usr/bin:/bin:/usr/sbin:/sbin`. This often does not include `/usr/local/bin` where Homebrew
installs `python3`. An app that launches from a terminal gets the full user `PATH`.

This means `python3` can work in your terminal but fail in the app. Understanding `PATH`
explains this discrepancy and informs the fix (explicitly resolving the binary path using
`which`).

### Step 2 — The Probe Function

In `packages/executor/src/probeRuntime.ts`:

```typescript
import { spawn } from 'child_process'

export interface RuntimeProbeResult {
  readonly available: boolean
  readonly resolvedPath: string | null
  readonly version: string | null
}

export async function probeRuntime(binary: string): Promise<RuntimeProbeResult> {
  return new Promise(resolve => {
    const probeProcess = spawn(binary, ['--version'], {
      timeout: 2000,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const outputLines: string[] = []

    probeProcess.stdout.on('data', (chunk: Buffer) => {
      outputLines.push(chunk.toString('utf-8').trim())
    })

    probeProcess.stderr.on('data', (chunk: Buffer) => {
      outputLines.push(chunk.toString('utf-8').trim())
    })

    probeProcess.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') {
        resolve({ available: false, resolvedPath: null, version: null })
      } else {
        resolve({ available: false, resolvedPath: null, version: null })
      }
    })

    probeProcess.on('close', (exitCode) => {
      const version = outputLines.join(' ').trim() || null
      resolve({
        available: exitCode === 0,
        resolvedPath: binary,
        version,
      })
    })
  })
}
```

**`NodeJS.ErrnoException` explained:**
Node.js extends the standard JavaScript `Error` type with an `errno` number and a `code`
string. `err.code === 'ENOENT'` identifies the specific error "no such file or directory" —
the binary does not exist at the given path. Other common codes:
- `EACCES` — permission denied (the file exists but cannot be executed)
- `ETIMEDOUT` — the process did not respond within the timeout

**`stdio: ['ignore', 'pipe', 'pipe']` explained:**
The `stdio` option configures the child's three streams:
- `'ignore'` for stdin — the probe does not read input
- `'pipe'` for stdout — we capture the version string
- `'pipe'` for stderr — some tools (like Python 2's `--version`) write to stderr instead
  of stdout

Without `stdio: ['pipe', 'pipe', 'pipe']`, Node.js creates the streams but does not pipe
them to the parent. Without `'ignore'` for stdin, a process that waits for input would
hang until the timeout fires.

**`timeout: 2000` explained:**
The spawn `timeout` option (different from the `setTimeout` pattern used in Lesson 6)
tells the OS to kill the child after 2000ms. This is a safety net — `--version` should
respond instantly. A probe that hangs for 2 seconds at startup is unacceptable. The 2000ms
timeout prevents this.

**Why both stdout and stderr are collected:**
`python3 --version` prints to stdout. `python --version` (Python 2) prints to stderr.
`ruby --version` prints to stdout. Some tools print version information to stderr as a
convention. Collecting both and joining them captures the version string regardless of
which stream the tool uses.

### Step 3 — Probing All Runtimes in Parallel

In `packages/executor/src/RuntimeRegistry.ts`:

```typescript
import { probeRuntime, type RuntimeProbeResult } from './probeRuntime'

export interface RuntimeRegistry {
  readonly [language: string]: RuntimeProbeResult
}

const BINARIES_TO_PROBE = ['python3', 'node', 'gcc', 'lua5.4', 'ruby']

let registryPromise: Promise<RuntimeRegistry> | null = null

export function getRuntimeRegistry(): Promise<RuntimeRegistry> {
  if (registryPromise === null) {
    registryPromise = buildRegistry()
  }
  return registryPromise
}

async function buildRegistry(): Promise<RuntimeRegistry> {
  const results = await Promise.all(
    BINARIES_TO_PROBE.map(async binary => {
      const result = await probeRuntime(binary)
      return [binary, result] as const
    })
  )

  return Object.freeze(Object.fromEntries(results))
}
```

**`Promise.all` explained (deepened from Lesson 2):**
`Promise.all` takes an array of Promises and resolves when all of them resolve, returning
an array of their values in the same order. Here, five probes run simultaneously — they do
not wait for each other. If each probe takes up to 2 seconds and they ran sequentially,
startup would take up to 10 seconds. In parallel, startup takes as long as the slowest probe.

**Why we probe five binaries simultaneously:**
Each probe is I/O-bound: it waits for the OS to spawn a process and return. JavaScript is
single-threaded, but I/O operations run in the background (in the OS and Node.js's libuv
thread pool). `Promise.all` lets all five I/O operations be in-flight at the same time
without any one blocking the others.

**`Object.freeze` explained:**
`Object.freeze` makes an object immutable: no properties can be added, changed, or removed.
The registry is computed once at startup and must not change. Freezing it makes this intent
explicit and catches accidental mutations at runtime (in development, attempts to modify a
frozen object throw a `TypeError`).

**`as const` on the tuple:**
`[binary, result] as const` tells TypeScript to infer the type as a readonly tuple
`readonly [string, RuntimeProbeResult]` rather than `(string | RuntimeProbeResult)[]`. This
is required for `Object.fromEntries` to correctly infer the result type.

### Step 4 — The Status Bar Component

In `packages/renderer/src/StatusBar.tsx`:

```typescript
import React from 'react'

interface RuntimeStatus {
  readonly binary: string
  readonly available: boolean
  readonly version: string | null
}

interface StatusBarProps {
  readonly runtimes: RuntimeStatus[]
}

export function StatusBar({ runtimes }: StatusBarProps) {
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '28px',
        background: '#0d0d1a',
        borderTop: '1px solid #1a1a3e',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0 1rem',
        fontSize: '0.75rem',
        fontFamily: 'Menlo, Consolas, monospace',
        zIndex: 100,
      }}
    >
      {runtimes.map(runtime => (
        <span
          key={runtime.binary}
          title={runtime.version ?? `${runtime.binary} not found`}
          style={{ color: runtime.available ? '#68d391' : '#718096' }}
        >
          {runtime.available ? '●' : '○'} {runtime.binary}
        </span>
      ))}
    </footer>
  )
}
```

**`title` attribute explained:**
The HTML `title` attribute sets a tooltip — the text appears when the user hovers over
the element. Here it shows the version string (e.g., `Python 3.11.4`) or the "not found"
message. This gives the student more detail without cluttering the status bar.

**`position: fixed` explained:**
`position: fixed` removes the element from the normal document flow and positions it
relative to the viewport. `bottom: 0; left: 0; right: 0` pins it to the bottom of the
window regardless of scroll position. `zIndex: 100` ensures it appears above scrolled
content.

### Step 5 — Loading the Registry via IPC

The registry must be built in the main process (which can spawn child processes) and sent
to the renderer.

Add to `registerIpcHandlers` in `main.ts`:

```typescript
import { getRuntimeRegistry } from '@codex/executor'

ipcMain.handle('runtime:getRegistry', async () => {
  return getRuntimeRegistry()
})
```

The registry is serialised through IPC as a plain JSON object. IPC data must be JSON-
serialisable — no class instances, no functions. `RuntimeProbeResult` is a plain object
with primitive fields, so it passes through without issues.

Add to `preload.ts`:

```typescript
getRuntimeRegistry: (): Promise<unknown> =>
  ipcRenderer.invoke('runtime:getRegistry'),
```

### Step 6 — Integrating the Status Bar in App

In `App.tsx`:

```typescript
import React, { useState, useCallback, useEffect } from 'react'
import { StatusBar } from './StatusBar'
// ... other imports

export function App() {
  const [library, setLibrary] = useState<Library | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [runtimeStatuses, setRuntimeStatuses] = useState<
    Array<{ binary: string; available: boolean; version: string | null }>
  >([])

  useEffect(() => {
    window.codexAPI.getRuntimeRegistry().then((registry: any) => {
      const statuses = Object.entries(registry).map(([binary, result]: [string, any]) => ({
        binary,
        available: result.available,
        version: result.version,
      }))
      setRuntimeStatuses(statuses)
    })
  }, [])

  // ... rest of component, add bottom padding to main content for status bar

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingBottom: '28px' }}>
      {/* sidebar and main content */}
      <StatusBar runtimes={runtimeStatuses} />
    </div>
  )
}
```

**`useEffect` with empty dependency array `[]`:**
When the dependency array is `[]`, the effect runs only once: after the first render.
This is correct for loading the runtime registry: the registry is built once at startup
and does not change. There is no condition under which we would want to re-probe runtimes
during a session.

---

## Connect the Pieces

The `RuntimeRegistry` is the input to the fallback chain in Lesson 13. When the
`FallbackExecutor` decides which tier to use, it consults the registry:
- `registry['python3'].available` is `true` → try `LocalExecutor` first
- `registry['python3'].available` is `false` → skip to `WASMExecutor`

The status bar dots serve the same function for the student: they see which tier is active
before they click Run.

The `BINARIES_TO_PROBE` list will grow in Lesson 14 when C, Lua, and Ruby are added.

---

## What Breaks Without This

If the runtime probe is not done at startup and we instead try to run the binary when
the student clicks Run, the first click for each language incurs a 0–2000ms delay while
the probe happens. The student sees the "Running…" indicator but nothing happens for up
to 2 seconds. On slow hardware or with many installed but slow-to-start runtimes, startup
can appear to hang. Probing eagerly at startup pays the cost once, invisibly, while the
student is reading.

---

## Definition of Done

- [ ] The status bar shows a dot for each probed binary
- [ ] Green dots appear for runtimes that are installed; grey for those that are not
- [ ] Hovering a dot shows the version string (e.g., `Python 3.11.4`)
- [ ] The status bar is fixed to the bottom and does not scroll away
- [ ] The main content area does not overlap the status bar (has bottom padding)
- [ ] The registry is built once — a second `window.codexAPI.getRuntimeRegistry()` call
      returns immediately (verify by adding a `console.time` around the call)
- [ ] You can answer: what is PATH and why might `python3` work in the terminal but not
      in the Electron app?
- [ ] You can answer: why does `Object.freeze` matter for the registry?
- [ ] `git commit` with a message explaining why
