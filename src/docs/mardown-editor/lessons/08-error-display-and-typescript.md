# Lesson 8 — Error Display and TypeScript Execution

## What You Will Build

Two things. First: errors from Python and JavaScript display with meaningful context —
the error type, message, and line number are clearly formatted in the output panel, styled
in red, and the exit code is shown. A bare `NameError: name 'x' is not defined` does not
tell a beginner where to look; this lesson makes the output actionable. Second: TypeScript
code blocks run via `tsx`, and the TypeScript compiler's errors are displayed with the
same formatting.

---

## What You Need to Know First

- Lesson 6: `LocalExecutor`, `ExecutionResult`, `stdout`/`stderr` arrays, exit codes
- Lesson 5: `OutputPanel`, `RunState` FSM
- Lesson 4: `CodeBlock`, the `components` prop

---

## The Lesson

### Step 1 — Exit Codes as Communication

An exit code is an integer a process returns when it finishes. By convention:
- `0` — success
- Non-zero — failure

The specific non-zero code varies by program and error type. Python uses:
- `1` — unhandled exception (syntax error, runtime error, explicit `sys.exit(1)`)
- `2` — bad command-line arguments

The exit code is the first signal the parent process receives. Before reading any output,
the exit code tells you: did this succeed or fail? This is why the `ExecutionResult`
includes `exitCode` — the renderer uses it to decide whether to render output in white or
in red.

**CS lens:** Exit codes are a protocol — a contract between a program and its caller.
Programs that follow the convention (`0` = success, non-zero = failure) can be composed
in shell pipelines: `command1 && command2` means "run command2 only if command1 succeeded."
`command1 || fallback` means "run fallback only if command1 failed." The shell reads
exit codes to implement `&&` and `||`. Our renderer reads exit codes to colour output.

**SE lens:** Error as data, not as exception. The `LocalExecutor.execute` method resolves
(not rejects) with a result that contains `exitCode !== 0`. The calling code does not need
`try/catch` to handle a script failure — it just checks `result.exitCode`. Rejection is
reserved for failures of the executor itself (e.g., `ENOENT` — Python is not installed).
This is a clean separation: "the code ran but failed" is a valid result; "we couldn't run
the code" is an error.

### Step 2 — Parsing Python Error Output

Python errors have a consistent format:

```
Traceback (most recent call last):
  File "/tmp/codex-1234.py", line 3, in <module>
    print(x)
NameError: name 'x' is not defined
```

The structure is:
1. `Traceback (most recent call last):` — the header
2. One or more `File ..., line N` frames — the call stack
3. The error type and message on the final line

For a learning tool, this format is valuable. But the file path (`/tmp/codex-1234.py`)
is internal — the student's code has no file, so the path is meaningless to them. We
clean it up.

Add a parsing function to `packages/renderer/src/errorParser.ts`:

```typescript
export interface ParsedError {
  readonly errorType: string
  readonly message: string
  readonly lineNumber: number | null
  readonly context: string | null
}

export function parsePythonError(stderrLines: string[]): ParsedError | null {
  const lastLine = stderrLines[stderrLines.length - 1]?.trim()
  if (lastLine === undefined || !lastLine.includes(':')) return null

  const colonIndex = lastLine.indexOf(':')
  const errorType = lastLine.slice(0, colonIndex).trim()
  const message = lastLine.slice(colonIndex + 1).trim()

  let lineNumber: number | null = null
  let context: string | null = null

  for (const line of stderrLines) {
    const lineMatch = /line (\d+)/.exec(line)
    if (lineMatch) {
      lineNumber = parseInt(lineMatch[1], 10)
    }
    if (line.startsWith('    ') && !line.startsWith('  File')) {
      context = line.trim()
    }
  }

  return { errorType, message, lineNumber, context }
}

export function parseNodeError(stderrLines: string[]): ParsedError | null {
  for (const line of stderrLines) {
    const match = /([A-Za-z]+Error|[A-Za-z]+Exception): (.+)/.exec(line)
    if (match) {
      const lineMatch = /:(\d+)/.exec(stderrLines[0] ?? '')
      return {
        errorType: match[1],
        message: match[2],
        lineNumber: lineMatch ? parseInt(lineMatch[1], 10) : null,
        context: null,
      }
    }
  }
  return null
}
```

**`parseInt(lineMatch[1], 10)` explained:**
`parseInt(string, radix)` converts a string to an integer. The second argument, `10`, is
the radix — base 10 (decimal). Always provide the radix. Without it, strings starting with
`0` may be interpreted as octal (base 8) in older JavaScript engines: `parseInt('010')` was
`8`, not `10`. With explicit `10`, the behaviour is always decimal.

**Regex explained:**
`/line (\d+)/` is a regular expression — a pattern that matches text. `/` delimiters mark
the start and end. `line ` matches the literal string "line " (with a space). `(\d+)` is
a **capture group** — `\d` matches any digit (0–9), `+` means one or more. The parentheses
capture the matched digits so we can retrieve them with `lineMatch[1]`.

`/([A-Za-z]+Error|[A-Za-z]+Exception): (.+)/` matches an error type (`TypeError`,
`ReferenceError`, `SyntaxError`, etc.), a colon and space, and the message. `[A-Za-z]+`
matches one or more letters. `|` is alternation — match either the left or right pattern.

### Step 3 — Enhanced Output Panel

Replace the simple `OutputPanel` in `CodeBlock.tsx` with a version that shows structured errors:

```typescript
import { parsePythonError, parseNodeError } from './errorParser'

function OutputPanel({
  stdout,
  stderr,
  exitCode,
  language,
}: {
  stdout: string[]
  stderr: string[]
  exitCode: number
  language: string
}) {
  const hasError = exitCode !== 0 && stderr.length > 0
  const hasOutput = stdout.length > 0

  const parsedError = hasError
    ? language === 'python' || language === 'py'
      ? parsePythonError(stderr)
      : language === 'javascript' || language === 'js'
        ? parseNodeError(stderr)
        : null
    : null

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
        lineHeight: '1.6',
      }}
    >
      {!hasOutput && !hasError && (
        <span style={{ color: '#718096' }}>[No output]</span>
      )}

      {stdout.map((line, index) => (
        <div key={index} style={{ color: '#e2e8f0' }}>{line}</div>
      ))}

      {hasError && parsedError !== null ? (
        <div style={{ marginTop: stdout.length > 0 ? '0.75rem' : 0 }}>
          <div style={{ color: '#fc8181', fontWeight: 600 }}>
            {parsedError.errorType}: {parsedError.message}
          </div>
          {parsedError.lineNumber !== null && (
            <div style={{ color: '#fc8181', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Line {parsedError.lineNumber}
            </div>
          )}
          {parsedError.context !== null && (
            <div
              style={{
                color: '#a0aec0',
                marginTop: '0.25rem',
                paddingLeft: '0.75rem',
                borderLeft: '2px solid #fc8181',
              }}
            >
              {parsedError.context}
            </div>
          )}
        </div>
      ) : hasError ? (
        stderr.map((line, index) => (
          <div key={index} style={{ color: '#fc8181' }}>{line}</div>
        ))
      ) : null}

      {exitCode !== 0 && (
        <div style={{ color: '#718096', marginTop: '0.5rem', fontSize: '0.75rem' }}>
          [Exit code: {exitCode}]
        </div>
      )}
    </div>
  )
}
```

**Ternary operator explained (first appearance):**
`condition ? valueIfTrue : valueIfFalse` is the ternary operator — a compact way to express
`if/else` as an expression. In JSX, expressions (not statements) are used inside `{}`.
The ternary allows conditional rendering inline.

Nested ternaries (as above — `hasError && parsedError !== null ? X : hasError ? Y : null`)
can be hard to read. When you find yourself nesting three or more levels, consider extracting
a helper function. We accept it here because each branch is clearly labelled by its condition.

### Step 4 — TypeScript Execution via tsx

`tsx` is a Node.js enhancement that understands TypeScript files. It compiles TypeScript
to JavaScript on the fly using esbuild (a fast bundler) and runs the result.

**Why `tsx` and not `tsc && node`?**
The `tsc` compiler produces `.js` files and then you run `node output.js`. This is a
two-step process that requires an output directory and leaves `.js` files behind. `tsx`
runs `.ts` files directly, producing no output files. For a learning tool where the student
writes a code block and clicks Run, the direct execution model is simpler.

**Why not `ts-node`?**
`ts-node` is similar to `tsx` but uses the full TypeScript compiler — it validates types
before running. This means a TypeScript type error (like a variable assigned the wrong type)
prevents execution. For a learning tool, this can be frustrating: the student may be in
the middle of writing code and not yet have types right. `tsx` uses esbuild to strip types
and run immediately, without type checking. The student sees runtime output, not compiler
errors about incomplete code.

Extend `LANGUAGE_COMMANDS` in `LocalExecutor.ts`:

```typescript
const LANGUAGE_COMMANDS: Record<string, { binary: string; extension: string }> = {
  python:     { binary: 'python3', extension: 'py' },
  py:         { binary: 'python3', extension: 'py' },
  javascript: { binary: 'node',    extension: 'js' },
  js:         { binary: 'node',    extension: 'js' },
  typescript: { binary: 'tsx',     extension: 'ts' },
  ts:         { binary: 'tsx',     extension: 'ts' },
}
```

Add `tsx` to the binaries to probe in `RuntimeRegistry.ts`:

```typescript
const BINARIES_TO_PROBE = ['python3', 'node', 'tsx', 'gcc', 'lua5.4', 'ruby']
```

Add TypeScript to `RUNNABLE_LANGUAGES` in `CodeBlock.tsx` (already present from Lesson 5).

Add TypeScript error parsing. TypeScript (via `tsx`) formats errors differently from Python:

```
/tmp/codex-1234.ts:3:7 - error TS2304: Cannot find name 'x'.
```

Add to `errorParser.ts`:

```typescript
export function parseTypeScriptError(stderrLines: string[]): ParsedError | null {
  for (const line of stderrLines) {
    const match = /error TS\d+: (.+)/.exec(line)
    const lineMatch = /:(\d+):\d+/.exec(line)
    if (match) {
      return {
        errorType: 'TypeScriptError',
        message: match[1],
        lineNumber: lineMatch ? parseInt(lineMatch[1], 10) : null,
        context: null,
      }
    }
  }
  return null
}
```

Update the `OutputPanel` to dispatch to the TypeScript parser for `'typescript'` and `'ts'`
language values.

### Step 5 — Reading Errors as a Developer Skill

The contract requires that every new class of error be explained when it first appears.
Now that execution is working, students will encounter three distinct error categories.

**Category 1: TypeScript compile errors**

Appear in the terminal where `npm run dev` runs (Vite's output).

```
src/renderer/App.tsx:42:5 - error TS2339: Property 'executeCode' does not exist
on type '{ openFolder: () => Promise<string | null>; ... }'.
```

How to read it:
- `src/renderer/App.tsx:42:5` — file path, line 42, column 5
- `error TS2339` — TypeScript error code (searchable in the TypeScript docs)
- `Property 'executeCode' does not exist` — the specific problem

Fix: add `executeCode` to the `Window` type declaration.

**Category 2: Runtime errors in Electron DevTools**

Appear in the Electron window's DevTools console (right-click → Inspect Element, or
`Cmd+Option+I`).

```
TypeError: window.codexAPI.executeCode is not a function
    at handleRun (CodeBlock.tsx:67)
```

How to read it:
- `TypeError` — the error category
- `is not a function` — you called something that is not callable
- `CodeBlock.tsx:67` — where in your code the call happened

Fix: check the preload script has exposed `executeCode`.

**Category 3: Main process errors**

Appear in the terminal where you ran `npm run dev`. The main process logs to the terminal,
not to DevTools.

```
Error: spawn python3 ENOENT
    at LocalExecutor.execute (LocalExecutor.ts:34)
```

How to read it:
- `spawn python3 ENOENT` — `spawn` tried to run `python3`, which was not found on PATH
- The stack trace shows the exact line in `LocalExecutor` where `spawn` was called

Fix: install Python 3, or the fallback executor (Lesson 13) handles this automatically.

---

## Security: TypeScript Execution Uses the Same Trust Model

TypeScript code runs via `tsx`, which compiles it to JavaScript and runs it with Node.js.
The security model is identical to the Python executor in Lesson 06 — the code runs with
the user's filesystem and network permissions, the timeout limits runaway execution, and
process isolation prevents a crash from affecting Electron. TypeScript's type system does
not restrict what the compiled code can do at runtime. A type-safe TypeScript program can
delete files just as readily as an unsafe one. Only the WASM and Docker executors (Lessons
13 and 18) provide actual sandboxing.

---

## Connect the Pieces

The `parsePythonError` and `parseNodeError` functions in `errorParser.ts` are used only
by the `OutputPanel` component. In Lesson 13, the WASM executor (Pyodide) produces a
different error format — Python errors from Pyodide are JavaScript exceptions with the
Python traceback as the message. A separate `parsePyodideError` function will be added
at that time.

The structured `ParsedError` type anticipates a future feature: linking the line number
in the error to a line in the Monaco editor (Lesson 9's Monaco integration).

---

## What Breaks Without This

If `parseInt(lineMatch[1])` is written without the `10` radix, Python line numbers like
`line 08` (single-digit lines padded to two digits in some traceback formats) would parse
to `0` in old JavaScript engines that interpret leading-zero strings as octal. Line 8
would be reported as line 0. The student would be told to look at line 0, which does not
exist. The fix is one character: add `, 10`.

---

## Definition of Done

- [ ] A Python `NameError` shows the error type, message, line number, and offending expression
- [ ] A Python `SyntaxError` shows the line number and a caret pointing to the syntax problem
- [ ] `console.log("hi")` in a JavaScript block outputs `hi` with no errors
- [ ] A JavaScript `ReferenceError` shows the variable name and line number
- [ ] A TypeScript block with `const x: string = 42` runs (tsx strips types) and errors if `x` is used in a way that causes a runtime error
- [ ] The exit code is shown for any non-zero exit
- [ ] You can answer: why does `tsx` not check types, and when would that be a problem?
- [ ] You can answer: where do main process errors appear vs renderer process errors?
- [ ] `git commit` with a message explaining why
