# Lesson 24 — Running Go

## What You Will Build

Go code blocks execute via `go run`. A snippet — just `fmt.Println("hello")` with no
`package main` preamble — runs and shows `hello` in the output panel. The executor
writes code to a temp file, prepends the required boilerplate when absent, and cleans
up. The definition of done is: a Go snippet with only the interesting code, no ceremony.

---

## What You Need to Know First

- Lesson 6: `LocalExecutor`, `LANGUAGE_COMMANDS`, the `runProcess` helper, temp files
- Lesson 7: runtime detection, `AVAILABLE_RUNTIMES`

---

## The Lesson

### Step 1 — Go's Compilation Model

Go is a compiled language. Source code is not interpreted line by line — the Go
toolchain compiles it to a native binary, then runs that binary. Unlike C, you do not
need to manage the intermediate binary yourself: `go run file.go` compiles to a
temporary binary in the OS temp directory and immediately runs it, then deletes the
binary. The effect is indistinguishable from running an interpreted language.

**Why `go run` over `go build`?**
`go build` produces a permanent binary in the current directory. For a learning
environment where the student is running throwaway snippets, we do not want to litter
the filesystem with binaries. `go run` handles both steps and cleans up automatically.

**The `package main` requirement:**
Every executable Go program must begin with:

```go
package main

import "fmt"

func main() {
    fmt.Println("hello")
}
```

The `package main` declaration marks the file as an entry-point package. The `func main()`
is the entry point — execution starts here. Without both, `go run` refuses to compile.

For a learning environment, requiring the student to write this boilerplate in every code
block is friction. We want `fmt.Println("hello")` to work. The executor adds the boilerplate
when it detects the code does not already include `package main`.

**CS lens:** This is the **decorator pattern** — the executor wraps the student's code with
the necessary envelope without modifying the student's visible content.

### Step 2 — The Go Executor

`go run` requires a file path (unlike Python, it does not read from stdin). The executor
writes the code to a temp file with a `.go` extension, runs `go run`, then deletes the file.

In `packages/executor/src/GoExecutor.ts`:

```typescript
import { writeFile, unlink, readdir, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import type { Executor, ExecutionOptions, ExecutionResult } from './types'
import { runProcess } from './runProcess'

const GO_PREAMBLE = `package main\n\n`

function wrapSnippet(code: string): string {
  if (code.trimStart().startsWith('package ')) {
    return code
  }

  // If code has no import block, wrap in a minimal main
  const hasImport = /^\s*import\s/m.test(code)
  if (!hasImport) {
    return `${GO_PREAMBLE}func main() {\n${indent(code)}\n}\n`
  }

  // Has imports but no package declaration
  return `${GO_PREAMBLE}${code}`
}

function indent(code: string): string {
  return code
    .split('\n')
    .map(line => (line.length > 0 ? `\t${line}` : line))
    .join('\n')
}

export class GoExecutor implements Executor {
  readonly name = 'go-local'

  canHandle(language: string): boolean {
    return language === 'go'
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { code, timeoutMs = 15_000 } = options
    const wrappedCode = wrapSnippet(code)
    const tempDir = join(tmpdir(), `codex-go-${Date.now()}`)
    const tempFile = join(tempDir, 'main.go')

    await import('fs/promises').then(fs => fs.mkdir(tempDir, { recursive: true }))
    await writeFile(tempFile, wrappedCode, 'utf-8')

    try {
      return await runProcess('go', ['run', tempFile], timeoutMs)
    } finally {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {})
    }
  }
}
```

**Why a temp directory, not just a temp file?**
`go run` places its build cache and module files relative to the source file's directory.
By creating an isolated temp directory for each run, we ensure no build artifacts from
one run interfere with another. The entire directory is deleted in `finally`.

**`wrapSnippet` explained:**

The function checks for three cases:

1. Code already starts with `package` — return as-is. The student wrote a complete program.
2. Code has no `import` statement — the snippet is a simple block of statements. Wrap it
   in a `func main()`. Indent each line by one tab so it reads correctly in the file.
3. Code has `import` but no `package` — the student wrote the import declarations but not
   the package header. Prepend `package main`.

This covers the common cases. Unusual snippets (multiple functions, custom types) will
typically include `package main` themselves.

**The `indent` function:**
Each line is prepended with a tab if it is non-empty. Empty lines stay empty (a blank line
inside `func main()` should not become a line with just a tab).

### Step 3 — Register Go in the Executor

In `packages/executor/src/index.ts`, export `GoExecutor` and add it to `LANGUAGE_COMMANDS`:

```typescript
export { GoExecutor } from './GoExecutor'
```

In `apps/electron/src/main.ts`, update the executor registry:

```typescript
import { LocalExecutor, GoExecutor } from '@codex/executor'

// In the IPC handler setup:
const executors = [new LocalExecutor(), new GoExecutor()]

ipcMain.handle('execute:run', async (_event, language: string, code: string) => {
  const executor = executors.find(e => e.canHandle(language))
  if (executor === undefined) {
    return { stdout: [], stderr: [`No executor for language: ${language}`], exitCode: 1, durationMs: 0 }
  }
  return executor.execute({ language, code })
})
```

**SE lens:** The executor registry is the **strategy pattern** in action. The IPC handler
does not know which executor handles Go — it asks each executor `canHandle('go')` and
the first one that returns `true` handles the request. Adding a new language means adding
one executor to the array, not changing the IPC handler.

### Step 4 — Update `RUNNABLE_LANGUAGES`

In `packages/renderer/src/CodeBlock.tsx`, add `'go'` to `RUNNABLE_LANGUAGES`:

```typescript
export const RUNNABLE_LANGUAGES = new Set([
  'python', 'py',
  'javascript', 'js',
  'typescript', 'ts',
  'go',
])
```

And add `'go'` to `MONACO_LANGUAGE_MAP`:

```typescript
go: 'go',
```

### Step 5 — Test the Snippet Mode

Test with these three code blocks:

**Snippet (no package, no import):**
```go
fmt.Println("hello from Go")
```
Expected: `hello from Go`

But this will fail — `fmt` is from the `fmt` package and must be imported. The snippet
mode needs to auto-import `fmt` for standard library usage, or the student needs to
write the import. For now, teach students to include imports in their snippets:

```go
import "fmt"

fmt.Println("hello from Go")
```

**Complete program (student writes it all):**
```go
package main

import "fmt"

func main() {
    for i := 0; i < 5; i++ {
        fmt.Printf("line %d\n", i)
    }
}
```

**A type error:**
```go
import "fmt"

var x int = "not an int"
fmt.Println(x)
```
Expected: Go compiler error in stderr.

---

## Security: The Local Execution Trust Model

Lesson 05 established the trust model for local execution. It applies here unchanged:
Go code in a Codex block runs as a child process with the full permissions of the user
running the app. It can read and write the filesystem, open network connections, spawn
processes, and access environment variables — everything `go run` can normally do.

**The threat:** A malicious Go block in a curriculum file you did not write could
exfiltrate files, damage your filesystem, or make network requests. `exec.Command("rm", "-rf", os.Getenv("HOME"))` would run.

**The mitigations in place:**
- The 15-second timeout kills runaway processes before they complete long-running attacks.
- Process isolation: a crashed Go binary does not crash Electron or the web server.
- The trust model is explicit: v1.0 is for curricula you wrote or trust. Lesson 13's WASM
  executor and Lesson 18's Docker executor are the sandboxed alternatives for untrusted code.

**What there is no protection against:** A Go block that deletes files, opens a socket,
or reads `~/.ssh/id_rsa` in under 15 seconds. If you open a curriculum you did not write,
read the code before clicking Run.

This is not a bug. It is the documented design decision from the BRD (section 1.5):
*"The risk: the code has access to your file system, your network, and your OS. For a
curriculum you wrote yourself, running on your own machine, this is fine."*

---

## Connect the Pieces

The `GoExecutor` slots into the executor registry next to `LocalExecutor`. Lesson 13's
`FallbackExecutor` will try `LocalExecutor` first (Python/JS), then `GoExecutor` — `canHandle`
ensures each executor handles only its language. In Lesson 31, when there is no local Go
runtime, the fallback chain reaches Tier 3 (Docker) because there is no WASM runtime for Go.

---

## What Breaks Without This

Without `wrapSnippet`, the student must write `package main` and `func main()` in every
code block. A lesson teaching Go range loops would have 10 lines of boilerplate for 2 lines
of interesting code. The decorator pattern — wrapping the snippet invisibly — is what makes
code blocks teachable.

---

## Definition of Done

- [ ] A Go snippet with `import "fmt"` and a `fmt.Println` call runs and shows output
- [ ] A complete Go program with `package main` and `func main()` runs unchanged
- [ ] A Go type error shows the compiler message in stderr
- [ ] An infinite loop in Go is killed after 15 seconds
- [ ] The Go block does not appear in the sidebar's runtime status as "unavailable" if Go is installed
- [ ] You can answer: why does `go run` require a file path instead of reading from stdin?
- [ ] You can answer: what does `package main` mean in Go?
- [ ] `git commit` with a message explaining why
