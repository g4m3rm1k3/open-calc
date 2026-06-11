# Lesson 14 — WASM for SQL, Lua, Ruby, and C

## What You Will Build

SQL, Lua, Ruby, and C code blocks run in the browser with no local runtimes needed.
An SQL block renders query results as a formatted table. Lua, Ruby, and C blocks produce
text output. Each WASM runtime is loaded lazily — the CDN download happens only when a
language is first run. The `WASMExecutor` dispatches to the correct runtime via a registry.

---

## What You Need to Know First

- Lesson 13: `WASMExecutor`, CDN lazy loading pattern, `pyodidePromise` module-level singleton
- Lesson 6: `ExecutionResult`, the `Executor` interface, exit codes

---

## The Lesson

### Step 1 — The Registry Pattern

In Lesson 13, `WASMExecutor` handled only Python. Adding more languages by extending a
series of `if/else` conditions would create a maintenance problem: every new language adds
two conditions (one in `canHandle`, one in `execute`). The code becomes hard to read and
the languages are scattered through the class body.

The **registry pattern** replaces scattered conditions with a data structure that maps
keys to values. Adding a new language is adding one entry to the registry. The dispatch
logic does not change.

```typescript
const wasmRunners: Map<string, () => Promise<WASMRunner>> = new Map([
  ['python', () => loadPyodideRunner()],
  ['py',     () => loadPyodideRunner()],
  ['sql',    () => loadSQLRunner()],
  ['sqlite', () => loadSQLRunner()],
  ['lua',    () => loadLuaRunner()],
  ['ruby',   () => loadRubyRunner()],
  ['rb',     () => loadRubyRunner()],
  ['c',      () => loadCRunner()],
  ['cpp',    () => loadCRunner()],
  ['c++',    () => loadCRunner()],
])
```

**CS lens:** The registry is a **dispatch table** — a data structure that maps operation
names (language identifiers) to the functions that implement them. You have seen this
pattern before as `LANGUAGE_COMMANDS` in `LocalExecutor` (Lesson 6). Here it maps language
names to factory functions that create runners. Factory functions (functions that create
objects) are named for the **factory pattern** — they abstract the creation of an object
behind a function call.

**SE lens:** `Map` is used instead of a plain `Record<string, ...>` because:
1. `Map.has(key)` is the semantic operation — we are testing membership, not accessing a property
2. `Map` preserves insertion order (useful if we ever iterate over runners)
3. `Map` keys can be any type; we do not accidentally conflict with inherited Object properties
   like `constructor`, `toString`, or `hasOwnProperty`

A `Record` would work, but `Map` communicates the intent more clearly.

### Step 2 — SQL via sql.js

**What sql.js is:**
sql.js is SQLite compiled to WASM. SQLite is the world's most widely deployed database —
it is embedded in every iOS and Android device, every Chromium browser, and most desktop
applications. sql.js makes it available in the browser.

Each execution gets a fresh `new SQL.Database()` — a clean, empty database. This is correct
for a learning environment: code block isolation is a feature, not a limitation.

```typescript
// In packages/executor/src/runners/sqlRunner.ts

type SQLjs = {
  Database: new (data?: null) => SQLDatabase
}

type SQLDatabase = {
  run: (sql: string) => void
  exec: (sql: string) => SQLResult[]
}

type SQLResult = {
  columns: string[]
  values: unknown[][]
}

const SQL_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js'
const SQL_WASM_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm'

let sqlPromise: Promise<SQLjs> | null = null

function loadSQL(): Promise<SQLjs> {
  if (sqlPromise !== null) return sqlPromise

  sqlPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SQL_CDN

    script.onload = () => {
      ;(window as any).initSqlJs({
        locateFile: (filename: string) =>
          filename.endsWith('.wasm') ? SQL_WASM_CDN : filename,
      }).then(resolve).catch(reject)
    }

    script.onerror = () => reject(new Error('Failed to load sql.js'))
    document.head.appendChild(script)
  })

  return sqlPromise
}

export async function runSQL(
  code: string
): Promise<{ stdout: string[]; stderr: string[]; exitCode: number }> {
  const SQL = await loadSQL()
  const db = new SQL.Database()
  const stdout: string[] = []

  try {
    const results = db.exec(code)

    for (const result of results) {
      if (result.columns.length === 0) continue

      const colWidths = result.columns.map((col, i) => {
        const maxDataWidth = Math.max(
          ...result.values.map(row => String(row[i] ?? '').length)
        )
        return Math.max(col.length, maxDataWidth)
      })

      const separator = colWidths.map(w => '-'.repeat(w + 2)).join('+')
      const header = result.columns.map((col, i) => col.padEnd(colWidths[i])).join(' | ')

      stdout.push(header)
      stdout.push(separator)

      for (const row of result.values) {
        stdout.push(
          row.map((cell, i) => String(cell ?? '').padEnd(colWidths[i])).join(' | ')
        )
      }
    }

    if (stdout.length === 0) {
      stdout.push('[Query executed successfully — no rows returned]')
    }

    return { stdout, stderr: [], exitCode: 0 }
  } catch (err) {
    return {
      stdout,
      stderr: [err instanceof Error ? err.message : String(err)],
      exitCode: 1,
    }
  }
}
```

**`locateFile` explained:**
sql.js needs its `.wasm` binary file. When loaded from a CDN, the JavaScript file tries
to load the WASM file relative to itself. `locateFile` is a callback that sql.js calls
to resolve the WASM file's URL. We intercept it and return the CDN URL for the WASM file.
Without this, sql.js would try to load the WASM file from `localhost:5173/sql-wasm.wasm`,
which does not exist.

**Table formatting explained:**
`padEnd(width)` pads a string with spaces on the right to reach `width` characters.
`colWidths` is the maximum of each column's header width and its maximum data value width.
The separator uses `-` repeated to match the column width, with `+` between columns.
This ASCII art table format is readable in a monospace font.

### Step 3 — Lua via Fengari

**What Fengari is:**
Fengari is a Lua 5.3 interpreter written entirely in JavaScript — not a WASM compilation
of the C Lua interpreter, but a reimplementation of Lua's semantics in JS. This makes
it small (~280KB) and fast to load.

```typescript
// In packages/executor/src/runners/luaRunner.ts

const FENGARI_CDN = 'https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js'

let fengariPromise: Promise<void> | null = null

function loadFengari(): Promise<void> {
  if (fengariPromise !== null) return fengariPromise

  fengariPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = FENGARI_CDN
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Fengari'))
    document.head.appendChild(script)
  })

  return fengariPromise
}

export async function runLua(
  code: string
): Promise<{ stdout: string[]; stderr: string[]; exitCode: number }> {
  await loadFengari()

  const fengari = (window as any).fengari
  const stdout: string[] = []
  const stderr: string[] = []

  const wrappedCode = `
    local _output = {}
    local _original_print = print
    print = function(...)
      local parts = {}
      for i = 1, select('#', ...) do
        table.insert(parts, tostring(select(i, ...)))
      end
      table.insert(_output, table.concat(parts, "\\t"))
    end
    ${code}
    return _output
  `

  try {
    const result = fengari.load(wrappedCode)()
    if (Array.isArray(result)) {
      stdout.push(...result)
    }
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

**Overriding Lua's `print`:**
Fengari runs Lua code but redirects `print` to the browser console by default. We intercept
`print` by redefining it inside the code wrapper: `print = function(...) ... end`. The
`select('#', ...)` idiom counts the number of variadic arguments in Lua. `tostring` converts
any value to its string representation (like Python's `str()`).

The wrapper stores output in a `_output` table and returns it. JavaScript receives the table
as an array of strings.

### Step 4 — Ruby via Opal.js

**What Opal.js is:**
Opal is a Ruby-to-JavaScript transpiler. It compiles Ruby source to JavaScript at runtime
(or ahead of time). The result is JavaScript that implements Ruby semantics — method dispatch,
blocks, symbols. It is not a Ruby interpreter; it is a compiler that produces JS.

```typescript
// In packages/executor/src/runners/rubyRunner.ts

const OPAL_BASE = 'https://cdn.opalrb.com/opal/1.7.4'

let opalPromise: Promise<void> | null = null

function loadOpal(): Promise<void> {
  if (opalPromise !== null) return opalPromise

  opalPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${OPAL_BASE}/opal.min.js`

    script.onload = () => {
      const stdlib = document.createElement('script')
      stdlib.src = `${OPAL_BASE}/opal-parser.min.js`
      stdlib.onload = () => resolve()
      stdlib.onerror = () => reject(new Error('Failed to load Opal parser'))
      document.head.appendChild(stdlib)
    }

    script.onerror = () => reject(new Error('Failed to load Opal'))
    document.head.appendChild(script)
  })

  return opalPromise
}

export async function runRuby(
  code: string
): Promise<{ stdout: string[]; stderr: string[]; exitCode: number }> {
  await loadOpal()

  const stdout: string[] = []

  const captureCode = `
    $stdout = StringIO.new
    begin
      ${code}
    rescue => e
      $stderr_capture = e.message
    end
    [$stdout.string, defined?($stderr_capture) ? $stderr_capture : nil]
  `

  try {
    const opal = (window as any).Opal
    const result = opal.run(captureCode)
    const [outStr, errStr] = result.$to_a()

    if (outStr) {
      stdout.push(...String(outStr).split('\n').filter((l: string) => l.length > 0))
    }

    const stderr = errStr ? [String(errStr)] : []
    const exitCode = errStr ? 1 : 0

    return { stdout, stderr, exitCode }
  } catch (err) {
    return {
      stdout,
      stderr: [err instanceof Error ? err.message : String(err)],
      exitCode: 1,
    }
  }
}
```

**`StringIO` explained:**
In Ruby, `$stdout` is the standard output stream — where `puts` and `print` write.
`StringIO.new` creates an in-memory I/O buffer that behaves like `$stdout` but stores
content in a string. Reassigning `$stdout = StringIO.new` redirects all output to the
buffer. `$stdout.string` retrieves the captured output.

### Step 5 — C via JSCPP

**What JSCPP is:**
JSCPP is a C++ interpreter written in JavaScript. It interprets C code directly — it does
not compile C to WASM. This means it is slower than native C but loads instantly and
supports most of C99 (no platform-specific headers, limited stdlib).

```typescript
// In packages/executor/src/runners/cRunner.ts

const JSCPP_CDN = 'https://cdn.jsdelivr.net/npm/JSCPP@2.1.2/dist/JSCPP.es5.min.js'

let jscppPromise: Promise<void> | null = null

function loadJSCPP(): Promise<void> {
  if (jscppPromise !== null) return jscppPromise

  jscppPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = JSCPP_CDN
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load JSCPP'))
    document.head.appendChild(script)
  })

  return jscppPromise
}

export async function runC(
  code: string
): Promise<{ stdout: string[]; stderr: string[]; exitCode: number }> {
  await loadJSCPP()

  const JSCPP = (window as any).JSCPP
  const stdout: string[] = []

  const config = {
    stdio: {
      write: (text: string) => {
        for (const line of text.split('\n')) {
          if (line.length > 0) stdout.push(line)
        }
      }
    }
  }

  try {
    const exitCode = JSCPP.run(code, '', config)
    return { stdout, stderr: [], exitCode: typeof exitCode === 'number' ? exitCode : 0 }
  } catch (err) {
    return {
      stdout,
      stderr: [err instanceof Error ? err.message : String(err)],
      exitCode: 1,
    }
  }
}
```

### Step 6 — Updating WASMExecutor to Use the Registry

In `packages/executor/src/WASMExecutor.ts`, replace the Python-only implementation with
the registry:

```typescript
import { runSQL } from './runners/sqlRunner'
import { runLua } from './runners/luaRunner'
import { runRuby } from './runners/rubyRunner'
import { runC } from './runners/cRunner'
import type { Executor, ExecutionOptions, ExecutionResult } from './types'

type SimpleRunner = (code: string) => Promise<{
  stdout: string[]
  stderr: string[]
  exitCode: number
}>

// Python runner (loadPyodide + setStdout) — same as Lesson 13, extracted to its own file
import { runPython } from './runners/pythonRunner'

const WASM_RUNNERS = new Map<string, SimpleRunner>([
  ['python', runPython],
  ['py',     runPython],
  ['sql',    runSQL],
  ['sqlite', runSQL],
  ['lua',    runLua],
  ['ruby',   runRuby],
  ['rb',     runRuby],
  ['c',      runC],
  ['cpp',    runC],
  ['c++',    runC],
])

export class WASMExecutor implements Executor {
  readonly name = 'wasm'

  canHandle(language: string): boolean {
    return WASM_RUNNERS.has(language)
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { language, code, timeoutMs = 30_000 } = options
    const startTime = Date.now()
    const runner = WASM_RUNNERS.get(language)

    if (runner === undefined) {
      throw new Error(`WASMExecutor cannot handle language: ${language}`)
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeoutMs)
    )

    try {
      const result = await Promise.race([runner(code), timeoutPromise])
      return { ...result, durationMs: Date.now() - startTime }
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === 'timeout'
      return {
        stdout: [],
        stderr: [isTimeout ? `[Timed out after ${timeoutMs}ms]` : String(err)],
        exitCode: 1,
        durationMs: Date.now() - startTime,
      }
    }
  }
}
```

Also add these languages to `RUNNABLE_LANGUAGES` in `CodeBlock.tsx` and to the Monaco
language map.

---

## Connect the Pieces

The `WASM_RUNNERS` map is a direct application of the registry pattern. Compare it to
`LANGUAGE_COMMANDS` in `LocalExecutor` (Lesson 6) — both are dispatch tables that map
language names to implementations. The only difference is that WASM runners are async
and require CDN loading on first use.

The `runSQL` function formats output as an ASCII table — the same approach used by the
`sqlite3` CLI tool. Students who later use a real database will recognise the format.

---

## What Breaks Without This

If the `locateFile` callback is omitted from sql.js's `initSqlJs`, the WASM binary URL
is resolved relative to the JS file's URL on the CDN. The CDN serves the `.wasm` file
at the same path. But in the browser, the page origin is `localhost:5173` — a cross-origin
request for the WASM file. The `Content-Security-Policy` in the HTML (`default-src 'self'`)
blocks it. The result: sql.js loads but the WASM binary fails to fetch and all SQL execution
throws a WASM instantiation error. The fix is `locateFile` — it overrides the URL to the
explicit CDN location.

---

## Definition of Done

- [ ] `SELECT 1 + 1 AS result` renders a table with header `result` and value `2`
- [ ] `SELECT * FROM sqlite_master` runs and shows the schema table (empty initially)
- [ ] A Lua `print("hello from Lua")` shows the output
- [ ] A Ruby `puts 2 + 2` shows `4`
- [ ] A C `printf("hello\n");` shows `hello`
- [ ] All five runtimes load lazily (confirm by checking network tab — no CDN request
      until the first Run click for that language)
- [ ] You can answer: what is the registry pattern and how does it differ from if/else dispatch?
- [ ] You can answer: why does Opal use `StringIO` rather than monkey-patching `puts`?
- [ ] `git commit` with a message explaining why
