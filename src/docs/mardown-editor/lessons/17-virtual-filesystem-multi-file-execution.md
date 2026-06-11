# Lesson 17 — Virtual Filesystem and Multi-File Execution

## What You Will Build

A Python project block where `main.py` imports from `utils.py` runs correctly. The import
resolves across files. In the Electron shell, both files are written to a temp directory
and Python's import system finds them. In the web shell, files are written into Pyodide's
virtual filesystem. Both shells use the same executor interface.

---

## What You Need to Know First

- Lesson 16: `ProjectFile`, `ParsedProject`, the tab bar component, `onRun` for projects
- Lesson 6: `LocalExecutor`, temp file pattern, `child_process.spawn`
- Lesson 13: Pyodide, `pyodide.FS`, WASM sandbox

---

## The Lesson

### Step 1 — What a Virtual File System Is

Python's `import utils` statement works by searching directories on `sys.path` for a
file named `utils.py`. In the normal case, the working directory is on `sys.path`, so
`import utils` finds `utils.py` in the same directory.

In Pyodide's WASM sandbox, there is no real file system. But Pyodide exposes the
**Emscripten virtual filesystem** — an in-memory file system with a POSIX-compatible API
(`readFile`, `writeFile`, `mkdir`). Python inside Pyodide uses this virtual FS as its real
filesystem. If we write `utils.py` to the virtual FS, Python's `import utils` finds it.

**CS lens:** A virtual file system (VFS) is an **abstraction layer** that presents a
consistent API regardless of the underlying storage mechanism. In Linux, the VFS layer
allows ext4, NTFS, tmpfs, and /proc (which is not a real filesystem at all) to be
accessed through the same `open()`, `read()`, `write()` system calls. The Emscripten VFS
does the same for WASM: the Python interpreter uses the same POSIX calls regardless of
whether it is running on Linux or in a browser.

**SE lens:** The adapter pattern. The `LocalProjectExecutor` writes to the OS file system
via Node.js `fs` APIs. The `WASMProjectExecutor` writes to Pyodide's virtual FS via
`pyodide.FS`. Both implement the same `Executor` interface. The calling code does not know
which it is using.

### Step 2 — Multi-File Execution in LocalExecutor

Extend `LocalExecutor` to handle `ProjectFile[]` execution. Add a new method:

```typescript
// In packages/executor/src/LocalExecutor.ts

import { mkdir, writeFile, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import type { ProjectFile } from '@codex/core'

export async function executeProject(
  language: string,
  files: ProjectFile[],
  timeoutMs = 10_000
): Promise<ExecutionResult> {
  const command = LANGUAGE_COMMANDS[language]
  if (command === undefined) {
    throw new Error(`LocalExecutor cannot handle language: ${language}`)
  }

  const projectDir = join(tmpdir(), `codex-project-${Date.now()}`)
  await mkdir(projectDir, { recursive: true })

  try {
    await Promise.all(
      files.map(file =>
        writeFile(join(projectDir, file.name), file.content, 'utf-8')
      )
    )

    const entryFile = files[0]?.name ?? `main.${command.extension}`
    const startTime = Date.now()

    return await runProcess(
      command.binary,
      [join(projectDir, entryFile)],
      timeoutMs,
      { cwd: projectDir }
    )
  } finally {
    await rm(projectDir, { recursive: true, force: true }).catch(() => {})
  }
}
```

**`mkdir(projectDir, { recursive: true })` explained:**
`recursive: true` creates the directory and all intermediate directories. Without it,
`mkdir` would fail if the parent directory does not exist. It also does not throw if
the directory already exists — safe to call even if somehow a directory with the same
name exists.

**`{ cwd: projectDir }` in `runProcess`:**
The `cwd` (current working directory) option to `spawn` sets the working directory of
the child process. Python's `sys.path` includes the current working directory. By setting
`cwd: projectDir`, Python can find `utils.py` (in `projectDir/utils.py`) when
`main.py` does `import utils`.

**`rm(projectDir, { recursive: true, force: true })` explained:**
`rm` with `recursive: true` removes a directory and all its contents. `force: true`
suppresses errors if the directory does not exist. Together, they are the `rm -rf` equivalent.
Without `force: true`, if the directory creation failed (e.g., disk full) and the directory
was not created, the `rm` in `finally` would throw — obscuring the original error.

**`Promise.all` for parallel writes:**
We write all files in parallel. If there are 5 files, we start 5 write operations simultaneously
rather than writing one, waiting, writing the next. File writes are I/O-bound — the CPU
is waiting for the disk, not computing. Parallel I/O is always faster for multiple independent
files.

### Step 3 — Multi-File Execution in WASMExecutor (Pyodide)

Extend the Python runner to accept multiple files:

```typescript
// In packages/executor/src/runners/pythonRunner.ts

import type { ProjectFile } from '@codex/core'

export async function runPythonProject(
  files: ProjectFile[]
): Promise<{ stdout: string[]; stderr: string[]; exitCode: number }> {
  const pyodide = await loadPyodide()
  const stdout: string[] = []
  const stderr: string[] = []

  pyodide.setStdout({ batched: (text: string) => {
    for (const line of text.split('\n')) {
      if (line.length > 0) stdout.push(line)
    }
  }})

  pyodide.setStderr({ batched: (text: string) => {
    for (const line of text.split('\n')) {
      if (line.length > 0) stderr.push(line)
    }
  }})

  const workDir = '/home/pyodide/project'

  try {
    pyodide.FS.mkdir(workDir)
  } catch {
    // Directory may already exist from a previous run
  }

  for (const file of files) {
    pyodide.FS.writeFile(
      `${workDir}/${file.name}`,
      file.content,
      { encoding: 'utf8' }
    )
  }

  const entryFile = files[0]?.name ?? 'main.py'

  try {
    await pyodide.runPythonAsync(`
import sys
import os

os.chdir('${workDir}')
if '${workDir}' not in sys.path:
    sys.path.insert(0, '${workDir}')

with open('${workDir}/${entryFile}') as f:
    exec(compile(f.read(), '${entryFile}', 'exec'))
`)
    return { stdout, stderr, exitCode: 0 }
  } catch (err) {
    return {
      stdout,
      stderr: [err instanceof Error ? err.message : String(err)],
      exitCode: 1,
    }
  }
}
```

**`pyodide.FS.mkdir` and `pyodide.FS.writeFile` explained:**
`pyodide.FS` is the Emscripten file system API exposed to JavaScript. It mirrors the POSIX
API: `mkdir(path)`, `writeFile(path, data, options)`, `readFile(path)`, `unlink(path)`.
Calling these from JavaScript writes to Pyodide's in-memory virtual file system. Python
running inside Pyodide sees these files as real files on disk.

`'/home/pyodide/project'` is the path in the virtual FS. Pyodide's Python process starts
with `/home/pyodide` as its home directory. We create a `project` subdirectory to isolate
each project's files.

**`os.chdir` and `sys.path.insert` explained:**
`os.chdir('${workDir}')` sets Python's current working directory to the project directory.
`sys.path.insert(0, '${workDir}')` adds the project directory to the front of Python's
module search path. Both are needed: `os.chdir` makes relative file paths work,
`sys.path.insert` makes `import utils` find `utils.py`.

**`exec(compile(f.read(), filename, 'exec'))` explained:**
Instead of `import main`, we use `exec` to run the entry file's code. This is necessary
because `import` caches modules — if the student runs the project twice with different code,
the second run would use the cached first-run version. `exec` always re-executes the code.
`compile(source, filename, 'exec')` compiles the source to a code object with the given
filename — this makes tracebacks show the correct filename rather than `<string>`.

### Step 4 — The Unified Project Executor Interface

The executor package needs to expose `executeProject` consistently for both local and WASM.
Extend the `Executor` interface:

```typescript
// In packages/executor/src/types.ts

export interface Executor {
  readonly name: string
  canHandle(language: string): boolean
  execute(options: ExecutionOptions): Promise<ExecutionResult>
  executeProject?(language: string, files: ProjectFile[]): Promise<ExecutionResult>
}
```

`executeProject?` is optional — simple single-file executors do not need it.
`FallbackExecutor` calls `executeProject` if available, falls back to `execute` on the
first file if not:

```typescript
async executeProject(language: string, files: ProjectFile[]): Promise<ExecutionResult> {
  for (const executor of this.chain) {
    if (!executor.canHandle(language)) continue
    if (executor.executeProject) {
      try {
        return await executor.executeProject(language, files)
      } catch {
        continue
      }
    }
  }
  return this.execute({ language, code: files[0]?.content ?? '' })
}
```

---

## Connect the Pieces

`pyodide.FS.writeFile` in this lesson is the Tier 2 equivalent of Lesson 6's `writeFile`
to a temp directory. The pattern is identical — write files, set the working directory,
run the entry point — but the underlying storage differs.

In Lesson 18, the `RemoteExecutor` sends files as a JSON array in the request body, and
the Docker container writes them to a temp directory on the server. The same `ProjectFile[]`
type flows from the UI through to all three tiers.

---

## What Breaks Without This

If `sys.path.insert(0, workDir)` is omitted but `os.chdir(workDir)` is present, Python
can find files in the current directory for `open()` calls, but `import utils` fails.
Python's import machinery searches `sys.path`, not the current directory (on Python 3).
This is a deliberate security decision in Python 3: Python 2's implicit current-directory
search allowed malicious files named `os.py` to shadow the standard library. Python 3
requires the directory to be explicitly on `sys.path`.

---

## Definition of Done

- [ ] A two-file Python project block where `main.py` imports `from utils import greet`
      and calls `greet("world")` → output: `Hello, world!`
- [ ] Edit `utils.py` to change the greeting; click Run → new greeting appears
- [ ] The same project block works in the web shell (Pyodide) and Electron (child process)
- [ ] Edits to each file persist independently (Lesson 10 persistence still works)
- [ ] You can answer: what is `sys.path` and why must the project directory be on it?
- [ ] You can answer: why does `exec(compile(...))` work better than `import` for re-running?
- [ ] `git commit` with a message explaining why
