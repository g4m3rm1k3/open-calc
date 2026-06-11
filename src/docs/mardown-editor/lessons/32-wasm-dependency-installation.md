# Lesson 32 — WASM Dependency Installation

## What You Will Build

A code block can declare Python packages it needs:

````markdown
```python deps=numpy,pandas
import numpy as np
import pandas as pd
print(pd.Series([1, 2, 3]).sum())
```
````

Before running, the WASM executor installs the declared packages via `micropip`. A loading
indicator shows each package as it installs. Packages already installed in the session are
not re-downloaded. The `deps=` modifier works for both the Electron shell (Pyodide is the
WASM fallback) and the web shell.

---

## What You Need to Know First

- Lesson 13: `WASMExecutor`, Pyodide, `pyodide.runPythonAsync`, `loadPackagesFromImports`
- Lesson 4: the `meta` field of a code block node in `react-markdown`
- Lesson 9: `CodeBlock`, the code block props interface

---

## The Lesson

### Step 1 — The `deps=` Syntax

React Markdown passes the raw "meta string" of a fenced code block as a `meta` property
on the code block node. For:

````markdown
```python deps=numpy,pandas
```
````

The code block node has:
- `className`: `"language-python"`
- `meta`: `"deps=numpy,pandas"`

We parse this in the `components.code` override in `ChapterView.tsx`:

```typescript
function parseCodeBlockMeta(meta: string | undefined): {
  deps: string[]
  isProject: boolean
} {
  if (meta === undefined || meta.trim().length === 0) {
    return { deps: [], isProject: false }
  }

  const depsMatch = meta.match(/deps=([^\s]+)/)
  const deps = depsMatch !== null
    ? depsMatch[1].split(',').filter(d => d.length > 0)
    : []

  const isProject = /\bproject\b/.test(meta)

  return { deps, isProject }
}
```

Pass `deps` to `CodeBlock` as a prop:

```typescript
// In CodeBlockProps:
readonly deps?: string[]
```

### Step 2 — How `micropip` Works

Pyodide includes `micropip` — a minimal Python package installer that downloads wheels
from PyPI and installs them into the Pyodide environment. It is equivalent to `pip install`
but runs entirely in the browser (or in Pyodide's WASM sandbox).

Key facts:
- `micropip.install('numpy')` is asynchronous — it downloads the wheel, unpacks it, and
  makes the package importable. This may take several seconds on a slow connection.
- Once installed, the package persists for the lifetime of the Pyodide instance. The Pyodide
  instance is a module-level singleton (from Lesson 13), so packages installed in one block
  are available in all subsequent blocks in the same session.
- `micropip.install(['numpy', 'pandas'])` installs multiple packages in parallel.

**The session cache:**
We maintain a `Set<string>` of packages already installed. Before calling `micropip.install`,
we filter out packages already in the set. This prevents re-downloading on every Run click.

```typescript
// In packages/executor/src/WASMExecutor.ts
const installedPackages = new Set<string>()

async function ensurePackages(pyodide: PyodideInterface, deps: string[]): Promise<void> {
  const toInstall = deps.filter(pkg => !installedPackages.has(pkg))
  if (toInstall.length === 0) return

  const micropip = pyodide.pyimport('micropip')
  await micropip.install(toInstall)
  for (const pkg of toInstall) installedPackages.add(pkg)
}
```

**`pyodide.pyimport('micropip')` explained:**
`micropip` is a Python package, but we need to call it from JavaScript. `pyodide.pyimport`
imports a Python module and returns a JavaScript-accessible proxy. We call Python functions
on it as if they were JavaScript functions — Pyodide handles the bridge.

### Step 3 — Progress Notifications

Installing packages takes time. Show the student what is happening.

Extend `ExecutionOptions`:

```typescript
export interface ExecutionOptions {
  readonly language: string
  readonly code: string
  readonly timeoutMs?: number
  readonly deps?: string[]
  readonly onOutput?: (line: string, stream: 'stdout' | 'stderr') => void
  readonly onStatus?: (message: string) => void   // new
}
```

`onStatus` fires with status messages before execution begins. The output panel shows these
in a distinct style — lighter grey, labelled `[loading]`.

Update `WASMExecutor.execute`:

```typescript
async execute(options: ExecutionOptions): Promise<ExecutionResult> {
  const { language, code, deps = [], onOutput, onStatus } = options

  onStatus?.('[Loading Python runtime…]')
  const pyodide = await getPyodide()

  if (deps.length > 0) {
    const toInstall = deps.filter(pkg => !installedPackages.has(pkg))
    for (const pkg of toInstall) {
      onStatus?.(`[Installing ${pkg}…]`)
    }
    await ensurePackages(pyodide, deps)
  }

  onStatus?.('[Running]')
  // ... rest of execution
}
```

Update `CodeBlock.tsx` to display status messages in the output panel:

```typescript
type RunState =
  | { status: 'idle' }
  | { status: 'loading'; messages: string[] }
  | { status: 'running'; stdout: string[]; stderr: string[] }
  | { status: 'done'; stdout: string[]; stderr: string[]; exitCode: number }
```

In `handleRun`:

```typescript
setRunState({ status: 'loading', messages: [] })

const unsubscribe = window.codexAPI.onExecuteOutput(({ line, stream }) => { /* ... */ })

const result = await onRun(normalizedLanguage, currentCode, {
  deps,
  onStatus: (msg) => {
    setRunState(prev => {
      if (prev.status === 'loading') {
        return { ...prev, messages: [...prev.messages, msg] }
      }
      return prev
    })
  },
})
```

In `OutputPanel`, render loading messages:

```typescript
{runState.status === 'loading' && runState.messages.map((msg, i) => (
  <div key={i} style={{ color: '#888', fontStyle: 'italic' }}>{msg}</div>
))}
```

### Step 4 — Passing `deps` Through the IPC / API Layer

In the Electron shell, the IPC handler for `execute:run` receives `deps` and passes it
to the executor:

```typescript
ipcMain.handle(
  'execute:run',
  async (event, language: string, code: string, options: { deps?: string[] } = {}) => {
    const executor = executors.find(e => e.canHandle(language))
    if (executor === undefined) {
      return { stdout: [], stderr: ['No executor found'], exitCode: 1, durationMs: 0 }
    }

    return executor.execute({
      language,
      code,
      deps: options.deps,
      onOutput: (line, stream) => event.sender.send('execute:output', { line, stream }),
      onStatus: (msg) => event.sender.send('execute:status', { message: msg }),
    })
  }
)
```

In the web shell's Express API (`POST /api/execute`), the request body includes `deps`:

```typescript
app.post('/api/execute', async (req, res) => {
  const { language, code, deps = [] } = req.body
  // ... pass deps to executor
})
```

### Step 5 — Declarative vs Imperative Dependencies

This lesson teaches a concept that goes beyond the code:

**Imperative dependency management:** The code contains the `import` statement, and the
student is responsible for knowing the package is installed.

**Declarative dependency management:** The code block declares what it needs (`deps=numpy`),
and the environment satisfies the declaration before running the code. The student focuses
on the code, not the environment.

This is the same model as:
- `package.json` declaring `"numpy": "^1.26"` — the package manager satisfies it
- A `requirements.txt` — `pip install -r requirements.txt` before running
- Kubernetes pod specs declaring resource requests — the scheduler satisfies them

The `deps=` modifier applies this principle at the code block level. Each block is
self-contained: it declares what it needs, and Codex provides it.

---

## Connect the Pieces

The session cache (`installedPackages`) persists for the lifetime of the Pyodide instance.
Pyodide is a module-level singleton — it is created once per page load (web) or app launch
(Electron). If a lesson has three blocks that all use `pandas`, only the first block
installation pays the download cost.

The `onStatus` callback from this lesson is also useful for the Docker executor in Lesson 18
— it can send `[Starting container…]` and `[Waiting for output…]` messages via `onStatus`
while the container starts.

Declarative dependency management at the block level mirrors how production infrastructure
works. A Kubernetes pod spec declares `cpu: 500m` and `memory: 256Mi` — the scheduler
satisfies those requirements before starting the container. A GitHub Actions workflow
declares `uses: actions/checkout@v4` — the runner installs the action before executing the
step. A Docker Compose file declares `image: postgres:16` — Compose pulls the image before
starting the service. The `deps=numpy` modifier applies the same principle at the smallest
possible scope: a single code block declares what it needs, and Codex satisfies it before
running the code. The student never writes `micropip.install` manually; they write what
they need, and the system provides it.

---

## What Breaks Without This

Without `deps=`, a block that does `import pandas` in Pyodide fails with
`ModuleNotFoundError` unless the student manually calls `micropip.install('pandas')` in
a preceding code block. This is the "invisible prerequisite" problem — the student must
know to install the package before the lesson tells them to use it. The `deps=` modifier
makes the dependency visible and automatic.

---

## Definition of Done

- [ ] A block with `deps=pandas` installs pandas before running and shows a loading message
- [ ] A second block with `deps=pandas` in the same session does not re-install
- [ ] Multiple packages (`deps=numpy,pandas`) install correctly
- [ ] `import pandas as pd; print(pd.Series([1,2,3]).sum())` runs and outputs `6.0`
- [ ] A package that does not exist on PyPI shows an error message
- [ ] You can answer: what is declarative dependency management?
- [ ] You can answer: why does Pyodide use `micropip` instead of `pip`?
- [ ] `git commit` with a message explaining why
