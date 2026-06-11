# Lesson 27 — Running SQL Locally

## What You Will Build

SQL code blocks run against a local SQLite database. Each code block gets its own fresh
in-memory database — state does not bleed between blocks. A `SELECT` result renders as a
formatted table in the output panel, not as plain text. `CREATE TABLE`, `INSERT`, and
`SELECT` in one block all work. The student sees real SQL output, not a wall of text.

---

## What You Need to Know First

- Lesson 6: the `Executor` interface, `ExecutionResult`
- Lesson 14: SQL via WASM (sql.js) — this lesson adds the local SQLite executor alongside it
- Lesson 7: runtime detection — `sqlite3` is optional; `better-sqlite3` is a Node.js binding

---

## The Lesson

### Step 1 — SQLite and `better-sqlite3`

SQLite is an **embedded database**. Unlike PostgreSQL, MySQL, or any other server-based
database, SQLite has no separate server process. The entire database engine is a C library
that runs inside your application's process. A database is a single file on disk — or, for
ephemeral use, entirely in memory.

SQLite is used by:
- Chrome and Firefox (browser storage)
- iOS and Android (local app data)
- Electron apps (VS Code, Slack, Notion use it for caching)
- Every programming tutorial that does not want to explain how to install and configure
  a database server

For Codex, the correct choice is an **in-memory** SQLite database per code block. This means:
- No file is created on disk
- The database is fresh for every Run click — no state from previous runs persists
- The student can make mistakes, click Reset, and start clean

**`better-sqlite3` vs the `sqlite3` package:**
The `sqlite3` npm package is asynchronous — every operation returns a callback or Promise.
`better-sqlite3` is synchronous — operations complete immediately. This is safe because
SQLite is an in-process library with no network I/O; there is no actual asynchronous work
happening. The synchronous API is simpler and eliminates a class of async-related bugs.

```bash
$ npm install better-sqlite3
$ npm install --save-dev @types/better-sqlite3
```

### Step 2 — The SQL Executor

SQL output is fundamentally different from program output. A `SELECT` result is a table —
rows and columns — not a stream of text. The executor needs to return this structured data
so the output panel can render it correctly.

Extend `ExecutionResult` in `packages/executor/src/types.ts`:

```typescript
export interface SqlTable {
  readonly columns: string[]
  readonly rows: unknown[][]
}

export interface ExecutionResult {
  readonly stdout: string[]
  readonly stderr: string[]
  readonly exitCode: number
  readonly durationMs: number
  readonly tables?: SqlTable[]   // populated only by SQL executors
}
```

Now the SQL executor:

```typescript
// packages/executor/src/SqlExecutor.ts
import Database from 'better-sqlite3'
import type { Executor, ExecutionOptions, ExecutionResult, SqlTable } from './types'

export class SqlExecutor implements Executor {
  readonly name = 'sql-local'

  canHandle(language: string): boolean {
    return language === 'sql'
  }

  execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { code } = options
    const startTime = Date.now()
    const tables: SqlTable[] = []
    const stdout: string[] = []
    const stderr: string[] = []

    // new Database(':memory:') creates a fresh, empty, in-memory database.
    // It is destroyed when the variable goes out of scope.
    const db = new Database(':memory:')

    try {
      // Split on semicolons to handle multiple statements
      const statements = splitStatements(code)

      for (const stmt of statements) {
        if (stmt.trim().length === 0) continue

        const upperStmt = stmt.trim().toUpperCase()
        const isSelect = upperStmt.startsWith('SELECT') || upperStmt.startsWith('WITH')

        if (isSelect) {
          const prepared = db.prepare(stmt)
          const rows = prepared.all() as Record<string, unknown>[]

          if (rows.length === 0) {
            stdout.push('[0 rows]')
          } else {
            const columns = Object.keys(rows[0])
            const rowData = rows.map(row => columns.map(col => row[col]))
            tables.push({ columns, rows: rowData })
          }
        } else {
          // DDL and DML: CREATE TABLE, INSERT, UPDATE, DELETE, DROP
          const prepared = db.prepare(stmt)
          const info = prepared.run()

          if (info.changes > 0) {
            stdout.push(`[${info.changes} row(s) affected]`)
          }
        }
      }

      return Promise.resolve({
        stdout,
        stderr,
        exitCode: 0,
        durationMs: Date.now() - startTime,
        tables,
      })
    } catch (err) {
      return Promise.resolve({
        stdout,
        stderr: [err instanceof Error ? err.message : String(err)],
        exitCode: 1,
        durationMs: Date.now() - startTime,
        tables,
      })
    } finally {
      db.close()
    }
  }
}

function splitStatements(sql: string): string[] {
  // Naive split on semicolons outside of string literals
  // Does not handle all edge cases, but works for typical SQL lessons
  const statements: string[] = []
  let current = ''
  let inString = false
  let stringChar = ''

  for (const char of sql) {
    if (!inString && (char === "'" || char === '"')) {
      inString = true
      stringChar = char
      current += char
    } else if (inString && char === stringChar) {
      inString = false
      current += char
    } else if (!inString && char === ';') {
      statements.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  if (current.trim().length > 0) {
    statements.push(current.trim())
  }

  return statements
}
```

**`db.prepare(stmt).all()` vs `db.exec(sql)` explained:**
- `db.exec(sql)` runs one or more statements sequentially, returns nothing. Use for DDL
  (CREATE, DROP) and DML (INSERT, UPDATE, DELETE).
- `db.prepare(stmt).all()` prepares a single statement and returns all result rows as an
  array of plain objects. Use for SELECT.

`better-sqlite3`'s `prepare` is synchronous — it compiles the SQL to an internal representation
once. `.all()` runs the compiled statement and returns results. For a one-shot execution like
this, the compile overhead is negligible.

**Why `new Database(':memory:')`?**
The string `':memory:'` is SQLite's special path for an in-memory database. It is not a file
path — it is interpreted by the SQLite library itself. Each call to `new Database(':memory:')`
creates a completely independent database. When `db.close()` is called (in `finally`), the
database is destroyed and all its memory is freed. There is no way for one code block's
data to persist into another block's execution.

**`splitStatements` explained:**
SQL code often contains multiple statements separated by semicolons:
```sql
CREATE TABLE users (id INTEGER, name TEXT);
INSERT INTO users VALUES (1, 'Alice');
SELECT * FROM users;
```
The function splits on `;` characters, but not inside string literals (a name like
`O'Brien` contains a semicolon-adjacent apostrophe). The state machine tracks whether
the parser is inside a single-quoted or double-quoted string. This handles typical lesson
SQL without supporting all edge cases of the SQL grammar.

### Step 3 — The `<TableOutput>` Component

The renderer needs to display SQL table results. Add a new component to
`packages/renderer/src/TableOutput.tsx`:

```typescript
import React from 'react'
import type { SqlTable } from '@codex/executor'

interface TableOutputProps {
  readonly table: SqlTable
}

export function TableOutput({ table }: TableOutputProps) {
  if (table.rows.length === 0) {
    return <div style={{ color: '#888', fontStyle: 'italic' }}>[0 rows]</div>
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontFamily: 'Menlo, Consolas, monospace',
          fontSize: '0.8rem',
        }}
      >
        <thead>
          <tr>
            {table.columns.map((col) => (
              <th
                key={col}
                style={{
                  padding: '4px 12px',
                  textAlign: 'left',
                  borderBottom: '1px solid #444',
                  color: '#aaa',
                  fontWeight: 'normal',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    padding: '4px 12px',
                    borderBottom: '1px solid #222',
                    color: '#e2e8f0',
                  }}
                >
                  {cell === null ? <span style={{ color: '#666' }}>NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

Update `OutputPanel` in `CodeBlock.tsx` to render tables when present:

```typescript
import { TableOutput } from './TableOutput'

function OutputPanel({ stdout, stderr, exitCode, tables }: {
  stdout: string[]
  stderr: string[]
  exitCode: number
  tables?: SqlTable[]
}) {
  return (
    <div style={{ /* existing styles */ }}>
      {stdout.map((line, i) => <div key={i} style={{ color: '#e2e8f0' }}>{line}</div>)}
      {stderr.map((line, i) => <div key={i} style={{ color: '#fc8181' }}>{line}</div>)}
      {tables?.map((table, i) => <TableOutput key={i} table={table} />)}
      {exitCode !== 0 && (
        <div style={{ color: '#fc8181', marginTop: '0.5rem', fontSize: '0.75rem' }}>
          [Exit code: {exitCode}]
        </div>
      )}
    </div>
  )
}
```

**`cell === null ? <span>NULL</span> : String(cell)` explained:**
SQLite supports NULL values — a cell with no data. Rendering `null` as the string `"null"`
is confusing. Rendering it as a styled `NULL` label (in grey, to distinguish it from the
string `"NULL"`) is conventional for database tools.

### Step 4 — Register SQL and Update RUNNABLE_LANGUAGES

In `packages/executor/src/index.ts`:
```typescript
export { SqlExecutor } from './SqlExecutor'
```

In `apps/electron/src/main.ts`:
```typescript
import { LocalExecutor, GoExecutor, CExecutor, RustExecutor, SqlExecutor } from '@codex/executor'
const executors = [new LocalExecutor(), new GoExecutor(), new CExecutor(), new RustExecutor(), new SqlExecutor()]
```

In `packages/renderer/src/CodeBlock.tsx`:
```typescript
export const RUNNABLE_LANGUAGES = new Set([
  'python', 'py',
  'javascript', 'js',
  'typescript', 'ts',
  'go', 'c', 'rust', 'rs', 'sql',
])
```

---

## Security: SQL Code Scope and `ATTACH DATABASE`

The in-memory database design (`new Database(':memory:')`) means user SQL cannot persist
data or read existing database files — each block starts with a completely empty database.
This is the primary security property of the local SQL executor.

**What SQL code in Codex CAN do:**
- Create tables, insert data, run arbitrary SELECT/UPDATE/DELETE — all scoped to the
  in-memory database.
- Use SQLite's `ATTACH DATABASE` command to attach an external file:
  ```sql
  ATTACH DATABASE '/Users/you/important.db' AS external;
  SELECT * FROM external.sensitive_table;
  ```
  `better-sqlite3` does not disable `ATTACH DATABASE`. A malicious SQL block could read
  any SQLite database file the user has read access to.

**The mitigation for the local executor:** The in-memory database prevents *writing* to
external files, but not reading them. This is the same trust model as the local executor
for other languages: the code runs with the user's permissions. Only run SQL from
curricula you trust.

**The contrast with WASM (Lesson 14):** `sql.js` runs in the browser's WASM sandbox, which
has no filesystem access whatsoever. `ATTACH DATABASE` with a local file path fails silently.
For untrusted SQL, the WASM executor is the safe choice. For local execution, the trust model applies.

**SQL injection in the executor code:**
Our executor code calls `db.prepare(stmt).all()` and `db.exec(sql)` with the student's
raw SQL. This is not an injection vulnerability here because we are *deliberately executing
the student's code* — the student's SQL IS the input. This is different from a web
application where user-provided data is inserted into a query template. The executor has
no query template; the student's entire block is the query.

---

## Connect the Pieces

The local `SqlExecutor` uses `better-sqlite3` (a Node.js binding, works in Electron).
The WASM `SqlExecutor` from Lesson 14 uses `sql.js` (a WASM port of SQLite, works in the
browser). Both implement the same `Executor` interface and return `tables` in `ExecutionResult`.
In the fallback chain, the local executor runs first; the WASM executor is the Tier 2 fallback.
The output panel renders the table the same way regardless of which tier ran the SQL.

This is the open/closed principle: adding table output to `ExecutionResult` and `OutputPanel`
opened the system for extension (any executor can return tables) without modifying how
non-SQL executors work.

---

## What Breaks Without This

The `better-sqlite3` package includes a native Node.js addon (a `.node` binary file). When
packaging the Electron app (Lesson 29), this addon must be built for the correct platform
and Electron version using `electron-rebuild`. Without this step, the packaged app will fail
to load `better-sqlite3` at runtime. The packaging lesson covers this.

---

## Definition of Done

- [ ] A SQL block with `CREATE TABLE`, `INSERT`, and `SELECT` runs and shows a table
- [ ] A `SELECT` with no results shows `[0 rows]`
- [ ] `INSERT` shows `[1 row(s) affected]`
- [ ] NULL values display as grey `NULL` in the table, not as the string "null"
- [ ] Two separate SQL blocks do not share state — changes in one do not appear in another
- [ ] A SQL syntax error shows the error message in red
- [ ] You can answer: what is `:memory:` in SQLite?
- [ ] You can answer: why is `better-sqlite3` synchronous when most Node.js APIs are async?
- [ ] `git commit` with a message explaining why
