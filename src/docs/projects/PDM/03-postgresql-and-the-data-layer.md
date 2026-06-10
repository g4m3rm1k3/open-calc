# Vault PDM — Lesson 03 — PostgreSQL and the Data Layer

## What You Will Build

The Express server connects to a PostgreSQL database. The `/api/health` endpoint
queries the database and includes its version in the response. The UI status bar
shows "API: connected | DB: PostgreSQL 16.x". Database credentials live in a `.env`
file that is never committed to git.

## What You Need to Know First

Lessons 01–02. The Express server is running. This lesson adds the data layer — the
PostgreSQL connection that all subsequent lessons use to store metadata.

---

## The Problem

Vault stores metadata: who has what file checked out, what versions exist, who the
users are. This data must persist across app restarts. An in-memory store (a
JavaScript object) would be lost every time the app closes. A file on disk would
require inventing a storage format, a query language, and a concurrency model.
PostgreSQL already provides all three.

More importantly: file checkout requires **atomic locking** — the check "is this file
available?" and the act "mark it as taken" must happen together, with no possibility
of two users both seeing "available" and both marking it as taken. PostgreSQL's
transaction system handles this correctly. JavaScript cannot.

---

## Step 1 — What a Relational Database Is

**Relational database — first appearance:**
A **relational database** stores data in **tables** — two-dimensional structures
with named columns and zero or more rows. Tables are related to each other through
**foreign keys**: a column in one table references the primary key of another.

Example: The `locks` table has a column `file_id` that references the `id` column
of the `files` table. This relationship enforces referential integrity — you cannot
create a lock record for a file that does not exist.

**SQL (Structured Query Language) — first appearance:**
SQL is the language for interacting with relational databases. Every operation —
creating tables, inserting rows, querying data, updating records — is expressed in
SQL. SQL has two main parts:
- **DDL (Data Definition Language):** `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` —
  defines the structure
- **DML (Data Manipulation Language):** `SELECT`, `INSERT`, `UPDATE`, `DELETE` —
  manipulates the data

PostgreSQL — the database Vault uses — is an open-source relational database. It is
the most widely used SQL database in production engineering software systems.

---

## Step 2 — Installing PostgreSQL

### For macOS (using Homebrew)

```
brew install postgresql@16
brew services start postgresql@16
```

### For Windows (installer)

Download the PostgreSQL 16 installer from https://www.postgresql.org/download/windows/
and run it. Accept all defaults. When asked for a password for the `postgres`
superuser, use `postgres` for development (you will use a separate database user for
Vault).

### For Linux (Ubuntu/Debian)

```
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**`psql` — the PostgreSQL command-line client:**
`psql` is PostgreSQL's interactive terminal. You type SQL and it sends it to the
database. Open a psql session:

```
psql -U postgres
```

**`-U postgres`:** Connect as the `postgres` user — the superuser created during
installation. You may be prompted for the password you set during installation.

When psql starts, you see a prompt like `postgres=#`. Commands starting with `\`
are psql-specific meta-commands:
- `\l` — list all databases
- `\dt` — list all tables in the current database
- `\d tablename` — describe a table's columns
- `\q` — quit psql

### Create the Vault database and user

Inside psql:

```sql
CREATE DATABASE vault;
CREATE USER vault_user WITH PASSWORD 'vault_dev_password';
GRANT ALL PRIVILEGES ON DATABASE vault TO vault_user;
\q
```

**`CREATE DATABASE`:** Creates a new database. Every PostgreSQL server hosts multiple
databases. Vault gets its own.

**`CREATE USER ... WITH PASSWORD`:** Creates a database user separate from the
operating-system user. Using a dedicated database user (not `postgres`) limits blast
radius: if `vault_user`'s password is compromised, the attacker can only access the
`vault` database, not all databases on the server.

**`GRANT ALL PRIVILEGES ON DATABASE vault TO vault_user`:** Gives `vault_user` full
control over the `vault` database. In production you would grant more fine-grained
permissions; for development, full access simplifies setup.

---

## Step 3 — The `.env` File and Secrets

### The problem

The database connection requires a password. That password must not appear in the
source code (where it would be committed to git) or in environment variables that
could appear in logs.

### Create `.env` at the project root

```
DATABASE_URL=postgresql://vault_user:vault_dev_password@localhost:5432/vault
VAULT_API_PORT=3001
```

**`.env` — first appearance:**
A `.env` file stores **environment variables** — key=value pairs that configure
the application without hardcoding values into source files. The format: one
`KEY=value` per line. No quotes needed for simple values. No spaces around `=`.

**`DATABASE_URL` — the connection string format:**
`postgresql://user:password@host:port/dbname`

- `postgresql://` — the protocol (PostgreSQL)
- `vault_user` — the database user
- `vault_dev_password` — the password (after the `:`)
- `@localhost` — the database host
- `:5432` — PostgreSQL's default port (5432 is the standard)
- `/vault` — the database name

**Why `.env` must never be committed to git:**
A `.env` file in a public or shared git repository exposes every secret it contains
to every person who can read the repository — including past commits. Even if you
remove the file later, git history preserves every version. GitHub, GitLab, and
similar services actively scan pushed code for database connection strings and API
keys.

**The rule:** `.env` is in `.gitignore` (added in lesson 01). Secrets never enter
git. A project should have a `.env.example` file (with placeholder values, no real
credentials) committed to git so new developers know what variables to set.

Create `.env.example` (safe to commit):
```
DATABASE_URL=postgresql://vault_user:YOUR_PASSWORD@localhost:5432/vault
VAULT_API_PORT=3001
```

**Security lens — secrets at rest:**
Even on your local machine, the database password in `.env` is sensitive. If your
machine is compromised (malware, stolen laptop), the attacker can read `.env`. More
advanced setups use the OS keychain (the same `safeStorage` Electron API used in
lesson 10) or a secrets manager (HashiCorp Vault, AWS Secrets Manager) to store
credentials encrypted. For local development, `.env` in `.gitignore` is the minimum
acceptable practice.

### Load the `.env` file

Install `dotenv`:
```json
"dotenv": "^16.4.0"
```

At the top of `src/main/main.ts` (before any other imports):

```typescript
import 'dotenv/config'
```

**`import 'dotenv/config'` — what it does:**
This is a side-effect import. Importing `'dotenv/config'` runs dotenv's `config()`
function, which reads the `.env` file and sets each key as a property on
`process.env`. After this import, `process.env.DATABASE_URL` returns the connection
string. `process.env.VAULT_API_PORT` returns `'3001'` (always a string — environment
variables are strings).

**`import 'module'` without a name — side-effect imports:**
When importing a module only for its side effects (what it does when loaded, not what
it exports), write `import 'module-name'`. This is the TypeScript/ES module
equivalent of `require('module-name')` in CommonJS. dotenv, polyfill loaders, and
CSS files are all imported this way.

---

## Step 4 — The Database Connection Pool

### The problem

Every database query requires a TCP connection to PostgreSQL. Opening a new connection
for every query is slow (TCP handshake + PostgreSQL authentication = ~5–20ms overhead
per query). A **connection pool** maintains a set of open connections and reuses them.

### Create `src/data/database.ts`

```typescript
import pg from 'pg'

const { Pool } = pg
```

**`pg` (node-postgres) — first appearance:**
`pg` is the Node.js client library for PostgreSQL. It handles:
- Establishing TCP connections to the PostgreSQL server
- Sending SQL queries over the connection
- Receiving query results and converting them to JavaScript values
- Managing a connection pool

The `Pool` class manages a pool of connections. The `Client` class is a single
connection. Almost always use `Pool`.

```typescript
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max:              10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
})
```

**`new Pool({ ... })` — connection pool configuration:**

`connectionString` — the full `postgresql://...` URL from `.env`. Parsed by `pg`
into individual connection parameters.

`max: 10` — the maximum number of open connections. If 11 concurrent queries arrive,
the 11th waits until one of the 10 connections is available. Setting `max` too high
exhausts PostgreSQL's connection limit (default 100); too low creates queuing. 10
is a reasonable development value.

`idleTimeoutMillis: 30_000` — close connections that have been idle for 30 seconds.
Prevents accumulating connections that are not being used.

`connectionTimeoutMillis: 2_000` — fail with an error if a connection cannot be
acquired from the pool within 2 seconds. Without a timeout, a pool exhaustion bug
would hang the application silently.

**`30_000` — numeric separators:**
JavaScript (ES2021) allows `_` as a visual separator in number literals.
`30_000` is identical to `30000` but is more readable for large numbers. The
underscore has no runtime meaning — it is removed by the compiler.

```typescript
export async function query<T extends pg.QueryResultRow>(
  sql:    string,
  params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(sql, params)
}

export async function checkDatabaseConnection(): Promise<string> {
  const result = await query<{ version: string }>('SELECT version()')
  return result.rows[0].version
}
```

**`async` / `await` — first appearance:**
`async` and `await` are syntactic sugar over Promises. An `async` function always
returns a Promise. Inside an `async` function, `await` pauses execution until a
Promise resolves and gives you the value directly, without `.then()` chaining.

```typescript
// Without async/await (Promise chaining):
function getVersion(): Promise<string> {
  return pool.query('SELECT version()').then(result => result.rows[0].version)
}

// With async/await (same logic, more readable):
async function getVersion(): Promise<string> {
  const result = await pool.query('SELECT version()')
  return result.rows[0].version
}
```

Both are equivalent. `async/await` reads like synchronous code while remaining
asynchronous. Use `async/await` for all database operations in this project.

**`Promise<pg.QueryResult<T>>` — generic return type:**
`query<T>` is a **generic function** — the `<T>` is a type parameter that the caller
fills in. `query<{ version: string }>` tells TypeScript that the rows in the result
have a `version: string` field. TypeScript then type-checks `result.rows[0].version`
as `string`. Without the generic, the rows would be typed as `any`.

**Generics — first appearance:**
Generics allow a function or type to be parameterised by another type. `Array<string>`
is an array of strings; `Array<number>` is an array of numbers — same structure,
different element type. The `<T>` syntax declares a type parameter that is resolved
at the call site. Generics allow type-safe code that works with multiple types without
repeating the function for each type.

**`result.rows[0]` — how pg returns query results:**
`pool.query(sql)` returns a `QueryResult` object. The `rows` property is an array
of row objects — one JavaScript object per database row, with column names as keys.
`result.rows[0]` is the first row. `result.rows[0].version` is the value of the
`version` column in the first row.

**SQL injection — first appearance:**
Never build SQL strings with string concatenation:
```typescript
// DANGEROUS — SQL injection:
const result = await query(`SELECT * FROM users WHERE email = '${userEmail}'`)
```
If `userEmail` is `' OR '1'='1`, the query becomes:
`SELECT * FROM users WHERE email = '' OR '1'='1'` — returns all users.
If `userEmail` is `'; DROP TABLE users; --`, the query deletes your user table.

Always use **parameterised queries**:
```typescript
// SAFE — parameterised query:
const result = await query('SELECT * FROM users WHERE email = $1', [userEmail])
```
PostgreSQL receives the query and the parameters separately. The `$1` placeholder
is never interpreted as SQL syntax — it is always treated as a data value. The driver
handles proper escaping automatically. This is the mandatory approach for any query
that incorporates user-provided data.

---

## Step 5 — Updating the Health Endpoint

### Update `src/api/server.ts`

```typescript
import express                   from 'express'
import cors                      from 'cors'
import { checkDatabaseConnection } from '../data/database.js'

const app = express()

app.use(cors({ origin: process.env.RENDERER_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', async (_request, response) => {
  try {
    const dbVersion = await checkDatabaseConnection()
    response.json({
      status:    'ok',
      timestamp:  new Date().toISOString(),
      database:  dbVersion,
    })
  } catch (error) {
    response.status(500).json({
      status:  'error',
      message: error instanceof Error ? error.message : 'Database unavailable',
    })
  }
})

export { app }
```

**`try/catch` around async operations — first appearance:**
Any `async` function call can throw. Database connections fail (PostgreSQL is not
running), queries time out, SQL syntax errors. Without `try/catch`, an unhandled
rejection crashes the Express route handler and sends no response to the client —
the client's `fetch` call hangs indefinitely.

`try { ... } catch (error) { ... }`:
- `try` block — the normal path; runs the awaited operation
- `catch` block — runs if anything in the `try` block throws or rejects
- `error instanceof Error` — type narrowing (introduced in lesson 22 of the CAM
  project): the thrown value could be anything; checking for `Error` instance allows
  accessing `.message` safely

**`response.status(500).json(...)` — chaining status and json:**
`response.status(code)` sets the HTTP status code and returns the response object.
Chaining `.json(data)` sends the body. Without `.status(500)`, the response status
defaults to 200 even though the content describes an error — incorrect. Always set
the appropriate status code.

### Update `src/renderer/App.tsx`

```typescript
const [dbVersion, setDbVersion] = useState<string | null>(null)

useEffect(() => {
  let cancelled = false

  fetch('http://localhost:3001/api/health')
    .then((response) => response.json())
    .then((data: { status: string; database?: string }) => {
      if (!cancelled) {
        setApiStatus(data.status === 'ok' ? 'connected' : 'error')
        setDbVersion(data.database ?? null)
      }
    })
    .catch(() => {
      if (!cancelled) {
        setApiStatus('error')
      }
    })

  return () => { cancelled = true }
}, [])

// In the status bar JSX:
<span>
  {statusText}
  {dbVersion !== null && ` | DB: ${dbVersion.split(' ')[0]} ${dbVersion.split(' ')[1]}`}
</span>
```

**`data.database ?? null`:**
The `??` (nullish coalescing) operator returns the right side if the left side is
`null` or `undefined`. `data.database` is `string | undefined` (the `database` field
might be absent in error responses). `?? null` normalises `undefined` to `null`,
keeping the type as `string | null` rather than `string | undefined`.

---

## Connect the Pieces

The health check now validates all three layers are working:

```
GET /api/health
  ──► checkDatabaseConnection()
  ──► pool.query('SELECT version()')
  ──► PostgreSQL returns version string
  ──► response.json({ status: 'ok', database: 'PostgreSQL 16.x ...' })
  ──► renderer displays "API: connected | DB: PostgreSQL 16.x"
```

`database.ts` in the data layer owns the PostgreSQL connection. `server.ts` in the
API layer imports and calls it. The API layer is allowed to call the data layer — this
is the correct downward dependency direction.

The `pool` object in `database.ts` is a module-level singleton — one connection pool
for the entire application. All queries go through it. A new pool would be created if
the module were re-imported; since Node.js module cache prevents re-importing, the
pool is truly singleton.

---

## What Breaks Without This

**Without parameterised queries:**
Every SQL query that incorporates user-provided data (usernames, file paths, search
terms) is vulnerable to SQL injection. An attacker who can control input to a query
can extract the entire database, delete all records, or (on some configurations)
execute OS commands. SQL injection is consistently ranked first or second in the OWASP
Top 10 most critical web application security risks.

**Without connection timeout (`connectionTimeoutMillis`):**
If PostgreSQL is unavailable (not running, network issue), every database call waits
indefinitely for a connection. The Express server becomes unresponsive — all API calls
hang. The health endpoint returns no response. The user sees a spinner forever.
`connectionTimeoutMillis: 2_000` fails fast with an error, allowing the API to
return a 503 response rather than hanging.

**Without `.env` in `.gitignore`:**
A developer pushes code with their local database credentials. The credentials are
now in the git history permanently. If the repository is ever made public, or if a
team member's laptop is stolen, the database is accessible to anyone who has the
repository. Credentials in git are considered permanently compromised — they must be
rotated immediately.

---

## Definition of Done

- [ ] PostgreSQL is running locally with the `vault` database and `vault_user` user created
- [ ] `DATABASE_URL` is in `.env`, not in any TypeScript file
- [ ] `.env` is in `.gitignore` and is NOT tracked by git (`git status` should not show it)
- [ ] `.env.example` is committed with placeholder values
- [ ] The Vault app shows "API: connected | DB: PostgreSQL 16.x" in the status bar
- [ ] If PostgreSQL is stopped, the status bar shows an error message (not a hanging spinner)
- [ ] You can explain what a connection pool is and why it exists
- [ ] You can explain SQL injection with a concrete example and show how parameterised queries prevent it
- [ ] You can explain async/await and write an equivalent using `.then()` chaining
- [ ] You can explain why `.env` must never be committed to git, including what git history means for secrets
- [ ] You can run `psql -U vault_user -d vault` and connect successfully
- [ ] Run:
      ```
      git add src/data/ src/api/ .env.example
      git commit -m "Add data layer: PostgreSQL connection pool, parameterised query wrapper, health endpoint now validates database connectivity"
      ```

---

*Next: Lesson 04 — The Domain Layer and TypeScript Types. The domain layer gets its
first module. A `VaultFile` type flows end-to-end from the data layer through the
API to the renderer. All four layers pass real data for the first time.*
