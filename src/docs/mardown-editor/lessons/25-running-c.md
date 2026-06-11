# Lesson 25 — Running C

## What You Will Build

C code blocks compile with `gcc` and run the resulting binary. Compile errors appear in
stderr with line numbers. Runtime errors — a segfault, an abort — show in the output panel
with a clear message. A `hello world` in C compiles and runs. A buffer overflow shows a
crash message without crashing the Electron app.

---

## What You Need to Know First

- Lesson 6: `LocalExecutor`, `runProcess`, temp files, `try/finally`
- Lesson 24: Go executor — the same temp-file pattern applies
- Lesson 7: runtime detection — `gcc` is probed at startup

---

## The Lesson

### Step 1 — The C Compilation Pipeline

C is not interpreted. It is not like Python (which reads source and runs it directly) or
JavaScript (which is compiled at runtime). C has a four-stage pipeline:

```
Source (.c)  →  Preprocessor  →  Compiler  →  Assembler  →  Linker  →  Binary
```

1. **Preprocessor:** Handles `#include`, `#define`, `#ifdef`. Expands macros and includes
   header files. The output is still C source, but with all macros expanded.
2. **Compiler:** Converts C source to assembly language — human-readable machine instructions
   for the target CPU.
3. **Assembler:** Converts assembly to object code — binary instructions the CPU understands,
   but not yet a runnable program.
4. **Linker:** Combines object files and resolves references to library functions (like
   `printf`). The output is the final executable.

`gcc` runs all four stages automatically when invoked as `gcc source.c -o output`. We use
`gcc` rather than `clang` because it is the most universally installed C compiler and
behaves consistently across Linux and macOS.

**CS lens:** This multi-stage pipeline is why C programs can be split across many files
(`.c` and `.h`). Each `.c` file is compiled independently to an object file; the linker
combines them. For single-file snippets in Codex, this is invisible — one command, one output.

**Compile errors vs runtime errors:**
- A **compile error** means `gcc` rejected the code before producing a binary. The error
  message includes file name and line number. No execution occurs.
- A **runtime error** means the code compiled successfully but crashed during execution.
  Common: `Segmentation fault` (accessing memory you do not own), `Abort` (assertion
  failure), integer division by zero.

The executor must handle both cases. `gcc` exits with non-zero on compile failure; the binary
exits with a signal on a segfault. Both surface as stderr output.

### Step 2 — The C Executor

```typescript
// packages/executor/src/CExecutor.ts
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import type { Executor, ExecutionOptions, ExecutionResult } from './types'
import { runProcess } from './runProcess'

const DEFAULT_PREAMBLE = `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n`

function wrapSnippet(code: string): string {
  const hasMain = /\bint\s+main\s*\(/.test(code)
  const hasInclude = /^\s*#include/.test(code)

  if (hasMain) return code  // complete program

  const preamble = hasInclude ? '' : DEFAULT_PREAMBLE
  return `${preamble}int main(void) {\n${indentCode(code)}\n    return 0;\n}\n`
}

function indentCode(code: string): string {
  return code
    .split('\n')
    .map(line => (line.length > 0 ? `    ${line}` : line))
    .join('\n')
}

export class CExecutor implements Executor {
  readonly name = 'c-local'

  canHandle(language: string): boolean {
    return language === 'c'
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { code, timeoutMs = 15_000 } = options
    const wrappedCode = wrapSnippet(code)
    const id = Date.now()
    const sourceFile = join(tmpdir(), `codex-c-${id}.c`)
    const binaryFile = join(tmpdir(), `codex-c-${id}`)

    await writeFile(sourceFile, wrappedCode, 'utf-8')

    try {
      // Step 1: compile
      const compileResult = await runProcess('gcc', [
        '-Wall',
        '-o', binaryFile,
        sourceFile,
      ], 15_000)

      // gcc exits non-zero on compile failure
      if (compileResult.exitCode !== 0) {
        return {
          ...compileResult,
          stderr: ['[Compile error]', ...compileResult.stderr],
        }
      }

      // Step 2: run the binary
      return await runProcess(binaryFile, [], timeoutMs)
    } finally {
      await unlink(sourceFile).catch(() => {})
      await unlink(binaryFile).catch(() => {})
    }
  }
}
```

**Two-step execution explained:**
First `gcc` compiles the source. If it fails (`exitCode !== 0`), we return the compile errors
immediately — there is nothing to run. If it succeeds, we run the binary. The `finally` block
deletes both the source file and the binary regardless of which step failed.

**`-Wall` explained:**
`-Wall` enables "all warnings" in gcc. Warnings are not errors — the code compiles — but
they indicate likely bugs: unused variables, implicit function declarations, pointer type
mismatches. For a learning environment, showing these warnings helps students write better C.

**Snippet wrapping for C:**
The detector looks for `int main(` (with optional whitespace) to decide if the student
wrote a complete program. If not, the snippet's statements are wrapped in a `main()` and
common headers are prepended (`stdio.h` for `printf`, `stdlib.h` for `malloc`, `string.h`
for `strlen`). This handles the most common learning scenarios without the student needing
to write boilerplate for every snippet.

**Runtime errors and signal numbers:**
When a process is killed by a signal (e.g., `SIGSEGV` for segfault, `SIGABRT` for abort),
it exits with a negative exit code on macOS/Linux. The `close` event on the child process
receives either the exit code or the signal name. The `runProcess` helper in Lesson 6
captures the exit code; a signal-killed process has `exitCode: null` and a separate `signal`
property. Update `runProcess` to surface this:

```typescript
childProcess.on('close', (exitCode, signal) => {
  clearTimeout(timeout)
  const durationMs = Date.now() - startTime

  const effectiveExitCode = exitCode ?? -1
  const signalLine = signal !== null ? [`[Process killed by signal: ${signal}]`] : []

  resolve({
    stdout,
    stderr: [...stderr, ...signalLine],
    exitCode: effectiveExitCode,
    durationMs,
  })
})
```

Now a segfault shows `[Process killed by signal: SIGSEGV]` in the output panel, which is
far more informative than an empty output with exit code `-1`.

### Step 3 — Register C and Update RUNNABLE_LANGUAGES

In `packages/executor/src/index.ts`:
```typescript
export { CExecutor } from './CExecutor'
```

In `apps/electron/src/main.ts`:
```typescript
import { LocalExecutor, GoExecutor, CExecutor } from '@codex/executor'
const executors = [new LocalExecutor(), new GoExecutor(), new CExecutor()]
```

In `packages/renderer/src/CodeBlock.tsx`:
```typescript
export const RUNNABLE_LANGUAGES = new Set([
  'python', 'py',
  'javascript', 'js',
  'typescript', 'ts',
  'go',
  'c',
])
```

And add to `MONACO_LANGUAGE_MAP`:
```typescript
c: 'c',
```

### Step 4 — Test Cases

**Hello world snippet:**
```c
printf("hello from C\n");
```
Expected output: `hello from C`

**Complete program:**
```c
#include <stdio.h>

int main(void) {
    for (int i = 0; i < 5; i++) {
        printf("line %d\n", i);
    }
    return 0;
}
```

**Compile error:**
```c
int x = "not an int";
printf("%d\n", x);
```
Expected: `[Compile error]` followed by gcc's type mismatch message.

**Segfault:**
```c
int *ptr = NULL;
*ptr = 42;
```
Expected: `[Process killed by signal: SIGSEGV]`

---

## Security: C Code Has No Sandbox

The local execution trust model (Lesson 05, Lesson 24) applies with extra weight for C.
C has no memory safety guarantees and no standard library sandbox. A C block that runs
locally can:

- Call `system("rm -rf ~/Documents")` — spawns a shell command
- Open file descriptors and read any file the user can read
- Allocate memory and crash the process intentionally with `abort()`
- Open network sockets

**What `gcc`'s `-Wall` does and does not do:** `-Wall` warns about common coding mistakes
at compile time. It does not prevent malicious code from compiling and running. A perfectly
clean-compiling C program can be highly destructive.

**The mitigations:** 15-second timeout, process isolation (segfault kills only the child,
not Electron), and the explicit trust model: run only C code from curricula you wrote or
trust. The Docker executor (Lesson 18) with `--network none` and `--memory 64m` is the
correct executor for untrusted C code — the local executor is not.

**The pedagogical point:** The fact that C can do these things is itself a lesson. C is
used for operating system kernels and device drivers because it can access hardware
directly. That power requires trust. Rust (Lesson 26) was designed specifically to provide
the same performance as C while preventing the accidental memory safety bugs that make C
dangerous. Intentional abuse is a different concern that only sandboxing addresses.

---

## Connect the Pieces

The C executor introduces the two-step execution pattern — compile, then run. This same
pattern is used by the Rust executor in Lesson 26 (`rustc` then the binary). The distinction
between compile-time and runtime errors maps directly to what students learn in computer
science courses. Showing gcc's error messages inline — with file name and line numbers —
makes them immediately actionable.

The signal handling added to `runProcess` benefits all language executors, not just C.
A Python script killed by OOM (out-of-memory) or a Go binary killed by the kernel will
also surface the signal name.

---

## What Breaks Without This

Without `-Wall`, students miss warnings that indicate real bugs. A common beginner error in C
is `printf("%d\n", someFloat)` — the format specifier is wrong, and without `-Wall`, gcc
silently compiles code that produces garbage output. With `-Wall`, the student sees
`warning: format specifies type 'int' but the argument has type 'double'` and can fix it.

---

## Definition of Done

- [ ] `printf("hello\n")` in a C snippet outputs `hello`
- [ ] A complete C program with `#include` and `main()` runs unchanged
- [ ] A type mismatch in C shows `[Compile error]` and gcc's message
- [ ] A NULL pointer dereference shows `[Process killed by signal: SIGSEGV]`
- [ ] The Electron app does not crash when a C program segfaults
- [ ] You can answer: what are the four stages of C compilation?
- [ ] You can answer: what is the difference between a compile error and a runtime error?
- [ ] `git commit` with a message explaining why
