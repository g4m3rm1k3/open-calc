# Lesson 14: Real Persistence — A Real Database

## What you will build

Real, file-backed persistence: `core/storage.py`'s SQLite database and
`core/tools.py`'s SQL-backed `list_tools()`/`get_tool_by_name()`/
`insert_tool()`, replacing Lesson 13's hardcoded Python list entirely. A
new tool created through `POST /api/tools` genuinely survives a full
server restart — proven live, this session, by killing the process and
starting it again. The transferable problem: **an in-memory Python list
is not persistence — it's a fact about one running process, gone the
moment that process ends** — and **string-building a query out of raw
user input is the single most well-known way to lose control of what a
database actually executes**.

## What you need to know first

Lesson 13: `core/tools.py`'s hardcoded `TOOLS` list and `GET /api/tools`
— this lesson replaces the list, keeps the route contract identical.
Lesson 2's request-validation pattern, reused for the new `POST` route.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/sqlite-file-based-database.md`
- `../concepts/sql-create-table-and-schema.md`
- `../concepts/sql-insert-select-where.md`
- `../concepts/sql-parameterized-queries-injection.md`
- `../concepts/sql-transactions-and-commit.md`
- `../concepts/declarative-vs-imperative-queries.md`
- `../concepts/flask-url-path-parameters.md`
- `../concepts/idempotent-initialization-guard.md`
- `../concepts/http-status-codes.md` — extended (`201 Created` added)
  while auditing this lesson, the code's own real first use.
- `../concepts/database-migrations.md`, `../concepts/connection-pooling.md`,
  `../concepts/repository-pattern.md` — added retroactively, found
  missing while cross-referencing a professional-software-engineering-
  concepts checklist: this lesson's own text already named the
  migration and connection-pooling gaps honestly in passing, and
  `insert_tool`/`list_tools`/`get_tool_by_name` already are a
  repository, just unnamed.

## No pipeline diagram change

Tools/persistence are a separate concern from the G-code pipeline.

---

## Concept Unit: Why a Python List Was Never Really "Data"

### The Problem

Lesson 13's `TOOLS` was real Python, real values, faithfully cited from
the reference — and completely gone the instant the server process
exited, recreated fresh, identical, every single restart. Nothing a user
adds can outlive one run of `python app.py`. Real persistence means a
fact written down survives independently of any one running program —
which is what a real database file, sitting on disk, actually provides.

### Reference Source

None — named explicitly, again: the reference app has no backend and no
database at all (client-only, browser `localStorage`, per
`CURRICULUM.md`'s own already-recorded finding). This entire lesson is
real, deliberate work *beyond* the reference, exactly as
`CURRICULUM.md`'s target architecture always planned: *"SQLite to
start — file-based, zero server setup, still real SQL — replacing the
reference app's `localStorage`."*

---

## Concept Unit: SQL, From First Principles — a Disposable Table

*(Full standalone treatments: ../concepts/sqlite-file-based-database.md,
../concepts/sql-create-table-and-schema.md,
../concepts/sql-insert-select-where.md,
../concepts/sql-transactions-and-commit.md.)*

### The Concept, Isolated

```python
import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")
connection.execute("INSERT INTO pets (name, age) VALUES (?, ?)", ("Rex", 3))
connection.execute("INSERT INTO pets (name, age) VALUES (?, ?)", ("Milo", 5))
connection.commit()

rows = connection.execute("SELECT * FROM pets").fetchall()
print("all pets:", [tuple(r) for r in rows])

older = connection.execute("SELECT * FROM pets WHERE age > ?", (4,)).fetchall()
print("older than 4:", [tuple(r) for r in older])
```
**Real output, run this session:**
```
all pets: [(1, 'Rex', 3), (2, 'Milo', 5)]
older than 4: [(2, 'Milo', 5)]
```
**What this proves, piece by piece:**
- `sqlite3` is **(a) first appearance** of Python's own **standard
  library** SQLite module — no `pip install` needed at all (a real,
  worth-naming contrast with Lesson 7's `flask-cors`: this dependency
  ships with Python itself).
- `sqlite3.connect(":memory:")` — **(a) first appearance** — `":memory:"`
  is a special, real path meaning "don't write to disk at all — create
  a temporary database that exists only for this connection's lifetime,"
  used here deliberately so this disposable lab leaves nothing behind.
- `CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)` —
  **(a) first appearance of SQL itself** in this project — a real,
  separate language, not Python. `CREATE TABLE` defines a table's real
  structure once: `pets` is the table name; `id`/`name`/`age` are
  **columns**, each with a **type** (`INTEGER`, `TEXT`) constraining
  what it can hold; `PRIMARY KEY` marks `id` as the column that uniquely
  identifies each row, and SQLite automatically assigns it an
  incrementing number if left unspecified on insert.
- `INSERT INTO pets (name, age) VALUES (?, ?)` — **(a) first
  appearance** of SQL's `INSERT` statement: adds one new row.
  `(name, age)` names which columns are being given real values (`id` is
  omitted — SQLite assigns it automatically); `VALUES (?, ?)` — **(a)
  first appearance of a parameterized query** — `?` is a **placeholder**,
  not a literal character sent to the database; the real values
  (`("Rex", 3)`, a Python tuple) are passed *separately*, as
  `.execute`'s second argument, and SQLite substitutes them safely —
  the entire mechanism the next unit's real security lesson depends on.
- `connection.commit()` — **(a) first appearance** — SQLite groups
  changes into a **transaction**; nothing written by `INSERT` is
  actually saved to the database until `.commit()` is called (skipping
  it here would silently discard both inserted rows).
- `SELECT * FROM pets` — **(a) first appearance** of SQL's `SELECT`:
  `*` means "every column"; `FROM pets` names the table being read.
  `.fetchall()` — **(a) first appearance** — runs the query and returns
  every matching row as a real Python list.
- `SELECT * FROM pets WHERE age > ?` — **(a) first appearance** of
  `WHERE`, SQL's real filtering clause — only rows where the condition
  is true are returned; `?` here is the same safe placeholder mechanism,
  substituting the real value `4`.

### Discard

This `pets` table and every line above are deleted now. They will not
appear in the project again — they existed only to prove SQL's own real
syntax (`CREATE TABLE`, `INSERT`, `SELECT`, `WHERE`, parameterized `?`
placeholders) before meeting this project's real schema.

### CS Lens

*(Full standalone treatment: ../concepts/declarative-vs-imperative-queries.md.)*

A table with typed columns and rows that persist independently of any
one program's lifetime is **relational storage** — data organized as
named, typed columns and identifiable rows, queried by declaring *what*
you want (`SELECT * FROM pets WHERE age > 4`) rather than *how* to get
it (looping, comparing) — a fundamentally different model from every
in-memory Python `list`/`dict` this project has used since Lesson 1.

Also recognized in: literally every real production application that
outlives a single process — bank balances, user accounts, this
project's own future program/job history (`CURRICULUM.md`'s own
persistence plan) — none of it could survive a server restart stored
only as Python variables.

---

## Concept Unit: A Real File, a Real Schema

### The New Code

```python
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "instance" / "cnc.db"


def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    connection = get_connection()
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            subtype TEXT,
            diameter_mm REAL NOT NULL,
            corner_radius_mm REAL NOT NULL,
            flute_length_mm REAL NOT NULL,
            total_length_mm REAL NOT NULL,
            shank_diameter_mm REAL NOT NULL,
            flute_count INTEGER NOT NULL,
            material TEXT NOT NULL,
            description TEXT NOT NULL,
            point_angle_deg REAL
        )
        """
    )
    connection.commit()
    connection.close()
```

### Project Change

- **Reference Source** — none (see above).
- **Files affected** — new `cnc-service/core/storage.py`; new, real
  file created at runtime, `cnc-service/instance/cnc.db`.
- **Change type** — add.
- **Location** — `core/`, alongside `lexer.py`/`parser.py`/`machine.py`/
  `path.py`/`tools.py`.
- **Dependencies** — none beyond Python's standard library.

### Mechanical Walkthrough
- `DB_PATH = Path(__file__).resolve().parent.parent / "instance" /
- "cnc.db"` — **(b) reappearing** `Path`/`__file__` navigation (the same
  real pattern used implicitly by Flask's own `templates`/`static`
  lookup since Lesson 1, now written explicitly); `.parent.parent` walks
  up from `core/storage.py` to `cnc-service/`, then into a new
- `instance/` folder — **(a) a real, named convention, not Flask's own
  mechanism**: `instance/` is a common real-world convention for "local,
  environment-specific data that shouldn't be committed to version
  control" (Flask itself has a similar, same-named concept,
- `app.instance_path` — deliberately not used here, since `core/` must
  never import `flask` at all, the Lesson 2 boundary, so this project
  borrows the *name* as a plain folder, not Flask's own API).
- `get_connection()` / `DB_PATH.parent.mkdir(parents=True,
- exist_ok=True)` — **(a) first appearance** of `Path.mkdir` with these
  two real keyword arguments: `parents=True` creates any missing parent
  directories too (not just the final one); `exist_ok=True` means "don't
  raise an error if it already exists" — together, safe to call on
  *every* connection, not just the first.
- `sqlite3.connect(DB_PATH)` — **(b) reappearing**, now a **real file
- path** instead of `":memory:"` — SQLite creates the file itself, on
  disk, the first time this runs, if it doesn't already exist.
- `connection.row_factory = sqlite3.Row` — **(a) first appearance.** By
  default, `sqlite3` rows behave like plain tuples (positional access
- only, `row[0]`, `row[1]`) — the disposable `pets` lab used exactly
  this default. `sqlite3.Row` changes returned rows to support
  **both** positional *and* name-based access (`row["name"]`), and,
- critically, `dict(row)` — used throughout this project's real
  functions to hand back plain dicts, the same shape every other route
  already returns.
- `CREATE TABLE IF NOT EXISTS tools (...)` — **(b) reappearing** `CREATE
- TABLE` syntax; **(a) the `IF NOT EXISTS` clause is new** — makes this
  statement safe to run every time the app starts, not just the first —
  real, if genuinely simple: this is **not** a real migration system
  (there's no way to *change* an existing table's columns later without
  writing that by hand) — named honestly as current, deliberate debt,
  matching exactly the kind of gap a later, dedicated migrations lesson
  (or, per your own stated next step, an ORM) would close properly.
  *(Added retroactively, found missing while cross-referencing a real
  "what every professional developer should know" checklist: full
  standalone treatment of what a real migration tool actually adds
  beyond `IF NOT EXISTS`: ../concepts/database-migrations.md.)*
- Column types — **(a) first appearance** of `NOT NULL` (rejects a row
  missing this value, at the database level, independent of any Python
  validation) and `AUTOINCREMENT` (SQLite assigns each new row's `id`
  one higher than the last, automatically — the same real convention
  the disposable `pets` lab already relied on implicitly via bare
  `PRIMARY KEY`).

### CS Lens

A schema that rejects invalid data at the storage layer itself
(`NOT NULL`) is **defense in depth** — the same principle already named
for this project's request validation (Lesson 2) and parser validation
(Lesson 4), applied at one layer deeper: even if a bug somewhere let a
missing required field slip past every check above it, the database
itself refuses to store an incomplete row.

### SE Lens

`get_connection()` opens a fresh connection every call, used once, then
closed — rather than one shared, long-lived connection kept open for
the whole server's lifetime. The real, honest tradeoff: a fresh
connection per call has a small, real overhead; a single shared
connection would risk real concurrency bugs if two requests ever
executed at the same moment (SQLite connections are not safely shared
across threads by default) — the simpler, safer choice for this
project's current, real scale, matching its own repeated "simplicity now,
named optimization later" pattern (Lesson 6, Lesson 8's own SE lens).

*(Added retroactively, found missing while cross-referencing a real
"what every professional developer should know" checklist: this is a
deliberate **non-pooling** decision, and the real reason it's cheap here
— SQLite has no network round-trip to pay for — wouldn't hold for a real
client-server database. Full standalone treatment:
../concepts/connection-pooling.md.)*

---

## Concept Unit: A Real, Live SQL Injection — Caused, Read, Fixed

*(Full standalone treatment: ../concepts/sql-parameterized-queries-injection.md.)*

### Caused for Real, This Session

```python
def vulnerable_lookup(name):
    connection = get_connection()
    query = f"SELECT * FROM tools WHERE name = '{name}'"
    rows = connection.execute(query).fetchall()
    connection.close()
    return rows
```
```
--- normal input ---
real query sent to SQLite: SELECT * FROM tools WHERE name = 'drill_hss'
1 row(s)

--- malicious input: "x' OR '1'='1" ---
real query sent to SQLite: SELECT * FROM tools WHERE name = 'x' OR '1'='1'
4 row(s) returned for a name that does not exist!
```
**What this proves:** `f"...{name}..."` treats whatever `name` contains
as *literal SQL text*, not just a value. The real input
`"x' OR '1'='1"` closes the intended string early (`'x'`), then adds a
real, always-true condition (`OR '1'='1'`) — the database faithfully
executes exactly what was asked, which is precisely the danger: the
query itself was rewritten by the input, matching *every* row instead of
none.

```python
def safe_lookup(name):
    connection = get_connection()
    rows = connection.execute("SELECT * FROM tools WHERE name = ?", (name,)).fetchall()
    connection.close()
    return rows
```
```
--- same malicious input, parameterized ---
0 row(s) returned - correctly zero
```
**What this proves:** with `?`, the real value (however it's spelled,
including every quote character it contains) is sent to SQLite
*separately* from the query's structure — SQLite treats it purely as
data to compare against, never as SQL syntax to execute, so no input
can ever change *what the query does*, only *what value it's compared
against*.

### Discard

`vulnerable_lookup` is deleted now — it never enters this project's real
code. **Named, explicitly:** every real function this lesson ships
(`insert_tool`, `list_tools`, `get_tool_by_name`) already used `?`
placeholders from the moment they were written — this vulnerable version
was never live, not even briefly; it exists solely to make the danger
concrete before trusting the safe pattern blindly.

### CS Lens

This is **injection** — the general vulnerability class of letting
untrusted input be interpreted as *code or structure* rather than pure
*data*, named explicitly back in `LessonContract`'s own security
section. SQL injection is the best-known real instance, but the exact
same failure shape appears anywhere a string is built by concatenating
trusted structure with untrusted content: shell commands, HTML (this
project's own Lesson 1 `.textContent`-vs-`.innerHTML` XSS note), regular
expressions built from user input.

Also recognized in: OWASP's own real top-10 vulnerability list (SQL
injection has appeared on it for over two decades), every real database
driver's own parameterized-query API (`?` in SQLite, `%s` in
psycopg2/PostgreSQL, `$1` in some others — the mechanism generalizes
even though the exact placeholder syntax doesn't).

### SE Lens

Parameterized queries cost nothing extra to use correctly — `?` is not
more code than string interpolation, just a different, safe habit. The
real cost is entirely on the other side: retrofitting safety into a
codebase already built with string-built queries means auditing every
single query by hand, the same real, larger-scope problem Lesson 10's
own named validation debt describes for request bodies. Building this
project's real functions with `?` from their very first line is what
keeps that retrofit unnecessary here.

---

## Concept Unit: Real Functions, Backed by Real SQL

*(Added retroactively, found missing while cross-referencing a real
"what every professional developer should know" checklist:
`insert_tool`/`list_tools`/`get_tool_by_name` are, functionally, this
project's first real **repository** — a small, named, domain-vocabulary
interface hiding real storage details from every caller — never named as
one. Full standalone treatment: ../concepts/repository-pattern.md.)*

### The New Code

```python
def insert_tool(tool):
    connection = get_connection()
    connection.execute(
        """
        INSERT INTO tools (
            name, type, subtype, diameter_mm, corner_radius_mm,
            flute_length_mm, total_length_mm, shank_diameter_mm,
            flute_count, material, description, point_angle_deg
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            tool["name"], tool["type"], tool.get("subtype"),
            tool["diameter_mm"], tool["corner_radius_mm"],
            tool["flute_length_mm"], tool["total_length_mm"],
            tool["shank_diameter_mm"], tool["flute_count"],
            tool["material"], tool["description"], tool.get("point_angle_deg"),
        ),
    )
    connection.commit()
    connection.close()


def list_tools():
    connection = get_connection()
    rows = connection.execute("SELECT * FROM tools ORDER BY id").fetchall()
    connection.close()
    return [dict(row) for row in rows]


def get_tool_by_name(name):
    connection = get_connection()
    row = connection.execute(
        "SELECT * FROM tools WHERE name = ?", (name,)
    ).fetchone()
    connection.close()
    return dict(row) if row else None


def seed_tools_if_empty():
    connection = get_connection()
    count = connection.execute("SELECT COUNT(*) FROM tools").fetchone()[0]
    connection.close()
    if count == 0:
        for tool in SEED_TOOLS:
            insert_tool(tool)
```

### Mechanical Walkthrough
- `tool["name"], ..., tool.get("subtype"), ...` — **(b) reappearing**
  dict indexing/`.get`-with-default (Lesson 2/10); required fields use
  `[...]` (a `KeyError`, a real, if currently uncaught, failure if
  missing — the *route*, next unit, validates this first); optional
  ones (`subtype`, `point_angle_deg`) use `.get(...)`, defaulting to
  `None`, which SQLite stores as real SQL `NULL`.
- `ORDER BY id` — **(a) first appearance** of SQL's `ORDER BY` — without
  it, SQLite makes **no real guarantee** about row order at all (a real,
  easy-to-miss fact — it often *appears* ordered by insertion, but that
  is not a guarantee a real application should depend on).
- `[dict(row) for row in rows]` — **(b) reappearing** list-comprehension
  syntax (already-known basic Python), applied to `sqlite3.Row` objects
  for the first time — converting every row to a plain dict, the same
  shape `/api/tools` (Lesson 13) already promised its caller.
- `connection.execute("SELECT COUNT(*) FROM tools").fetchone()[0]` —
- **(a) first appearance** of SQL's `COUNT(*)` **aggregate function** —
  returns the number of matching rows as a single value, not the rows
  themselves; `.fetchone()` (rather than `.fetchall()`) gets the one
- resulting row; `[0]` reads its first (only) column — real, standard
  SQL, not a Python-side count of an already-fetched list, which would
  require fetching every row just to discard them.
- `if count == 0: for tool in SEED_TOOLS: insert_tool(tool)` — **(a)
  first appearance** of a real, if crude, **seed guard**.
  *(Full standalone treatment: ../concepts/idempotent-initialization-guard.md.)*
  Only inserts
  the reference-cited starting tools if the table is genuinely empty —
  verified, not assumed, to run exactly once per real database file's
  lifetime (confirmed this session: restarting the server after seeding
  did **not** duplicate the four seed tools).

### Commands and Real Output

```
INSERT INTO tools (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```
run for real, once per seed tool, then:
```python
from core.storage import init_db
from core.tools import seed_tools_if_empty, list_tools, get_tool_by_name

init_db()
seed_tools_if_empty()
for t in list_tools():
    print(t)
print(get_tool_by_name("drill_hss"))
print(get_tool_by_name("does_not_exist"))
```
**Real output:** four real tools printed (matching Lesson 13's values,
now with `diameter_mm` etc. as real floats — `10.0`, not `10` — SQLite's
`REAL` column type, a small, honest, real difference from the Python
`int` literals Lesson 13 used, worth naming rather than silently
glossing over), `drill_hss`'s real row, then `None` for a name that
doesn't exist.

---

## Concept Unit: Three Real Routes

### The New Code

```python
init_db()
seed_tools_if_empty()

REQUIRED_TOOL_FIELDS = (
    "name", "type", "diameter_mm", "corner_radius_mm", "flute_length_mm",
    "total_length_mm", "shank_diameter_mm", "flute_count", "material",
    "description",
)


@app.route("/api/tools")
def get_tools():
    return {"tools": list_tools()}


@app.route("/api/tools/<name>")
def get_tool(name):
    tool = get_tool_by_name(name)
    if tool is None:
        return {"error": f"no tool named {name!r}"}, 404
    return {"tool": tool}


@app.route("/api/tools", methods=["POST"])
def create_tool():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return {"error": "expected a JSON object body"}, 400
    missing = [field for field in REQUIRED_TOOL_FIELDS if field not in body]
    if missing:
        return {"error": f"missing required field(s): {', '.join(missing)}"}, 400
    insert_tool(body)
    return {"tool": get_tool_by_name(body["name"])}, 201
```

### Mechanical Walkthrough
- `init_db()` / `seed_tools_if_empty()` called **at module load time**
  (directly under `app = Flask(__name__)`, not inside any route
  function) — **(a) a real, deliberate placement**: this runs exactly
  once, when the server process starts, guaranteeing the table and seed
  data exist before the very first request can arrive — calling it
  inside a route would re-check (harmlessly, thanks to `IF NOT EXISTS`/
  the count guard, but wastefully) on every single request instead.
- `@app.route("/api/tools/<name>")` — **(a) first appearance** of a
  **URL path parameter** in this project's own routes.
  *(Full standalone treatment: ../concepts/flask-url-path-parameters.md.)*
  `<name>` matches
  any path segment in that position and passes it as a real argument to
- the view function below it (`def get_tool(name):`) — Flask converts
  `/api/tools/drill_hss` into a call to `get_tool("drill_hss")`
  automatically.
- `if tool is None: return {"error": ...}, 404` — **(b) reappearing**
  tuple-return-for-status-code (Lesson 2); **(a) `404`, first real,
  deliberate application-level use** in this project — the standard HTTP
  status for "nothing exists at this specific address," distinct from
- Lesson 2's `400` ("what you sent was malformed") — a real, meaningful
  difference: `/api/tools/does_not_exist` is a well-formed request for a
  resource that genuinely isn't there, not a malformed one.
  *(Full standalone treatment, including this exact deliberate-vs-automatic
  404 distinction: ../concepts/http-status-codes.md.)*
- `[field for field in REQUIRED_TOOL_FIELDS if field not in body]` —
  **(b) reappearing** list comprehension; collects **every** missing
  field at once, not just the first — a real, small usability choice: a
  client fixing one missing field at a time, one error at a time, is a
  worse experience than being told everything wrong in one response.
- `insert_tool(body)` then `get_tool_by_name(body["name"])` — **(a) a
  real, deliberate choice worth naming**: rather than trusting the
  caller's own submitted data as the "created" response, the route
  re-reads the row it just inserted — proof the data that's actually
  in the database (not just what was sent) is what gets returned,
  catching any real, honest discrepancy (a column default applied by
  SQLite itself, for instance) rather than an assumed echo.
- `, 201` — **(a) first appearance** of HTTP `201 Created` (added to
- `../concepts/http-status-codes.md` while auditing this lesson) — the
  specific, correct status for "a new resource now exists," distinct
  from a plain `200` ("here's data, nothing changed on the server"),
  matching real HTTP convention.

### Commands and Real Output — Verified Live, Including Real Persistence

```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/tools/drill_hss"
```
```json
{ "tool": { "id": 4, "name": "drill_hss", ... } }
```
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/tools/does_not_exist"
# 404: {"error": "no tool named 'does_not_exist'"}
```
A new, real tool created:
```
Invoke-RestMethod -Method Post -Uri ".../api/tools" -Body '{ "name": "face_mill_50", "type": "Face Mill", "diameter_mm": 50, ... }'
# 201: {"tool": {"id": 5, "name": "face_mill_50", ...}}
```
**The actual server process killed and started completely fresh, this
session** — not simulated:
```
Invoke-RestMethod -Uri ".../api/tools/face_mill_50"
# still returns the real tool, id 5
# total tool count: 5 (not reseeded back down to 4)
```
Real, physical proof: the tool's data lives in `instance/cnc.db`, a real
file on disk, completely independent of the Python process that created
it.

---

## Concept Unit: A Real File That Should Never Be Committed

### The New Code

```
instance/
```
added to `cnc-service/.gitignore`.

### SE Lens

`instance/cnc.db` is real, local, mutable data — the opposite of source
code. Committing it would mean every clone of this repository starts
with whatever tools happened to exist on whichever machine last
committed it, and every local change would show up as a noisy binary
diff — the identical reasoning Lesson 1 already gave for `node_modules`/
`.venv`: reproducible from code (here, `init_db()` + `seed_tools_if_
empty()`), never itself version-controlled.

## Connect the Pieces

1. Server starts; `init_db()` creates `instance/cnc.db` and the `tools`
   table if either doesn't exist yet; `seed_tools_if_empty()` inserts
   the four real, cited seed tools only if the table was genuinely
   empty.
2. `POST /api/tools` with a real, complete body inserts a fifth row —
   real SQL, real file, real commit.
3. The server process is killed entirely and started again — `init_db`/
   `seed_tools_if_empty` run again, find the table already has five
   rows, and do nothing further.
4. `GET /api/tools/face_mill_50` still returns the real row — proof
   persistence survived independently of the process that created it,
   the entire point of this lesson, demonstrated rather than asserted.

## What Breaks Without This

Already demonstrated as this lesson's central, real security case: a
naively string-built query lets a single crafted input (`"x' OR
'1'='1"`) return every row in the table instead of none — captured with
real output, never shipped in this project's real code.

## Exercises

1. Stop the server, delete `instance/cnc.db` entirely, and start it
   again. Confirm `GET /api/tools` shows exactly the four original seed
   tools (not five) — explain why, from `seed_tools_if_empty`'s own
   guard.
2. `POST` a tool with a numeric field sent as a string (e.g.,
   `"diameter_mm": "ten"`). Confirm what actually happens — is it
   rejected, silently stored wrong, or does SQLite itself complain? —
   and explain what you find in terms of this lesson's own "defense in
   depth" CS lens, honestly, even if the real answer reveals a gap this
   lesson didn't close.
3. Try the real injection payload (`"x' OR '1'='1"`) as a live URL
   segment against the actual running server:
   `GET /api/tools/x' OR '1'='1`. Confirm the real, running server
   (using the safe, parameterized `get_tool_by_name`) correctly returns
   `404`, not every tool.

## Definition of Done

- [ ] `core/storage.py`/`core/tools.py` exist; `core/` still imports
      nothing from `flask`.
- [ ] `instance/cnc.db` is created automatically on first run and
      `.gitignore`d.
- [ ] `GET /api/tools`, `GET /api/tools/<name>` (found and 404 cases),
      and `POST /api/tools` (success and missing-field cases) all
      verified with real requests.
- [ ] You killed the real server process, restarted it, and confirmed a
      tool created before the restart still exists.
- [ ] You reproduced the SQL injection yourself, saw all four rows
      returned incorrectly, then confirmed the real, shipped
      `get_tool_by_name` isn't vulnerable to the same input.
- [ ] You completed Exercises 1–3.
- [ ] Full regression: all prior routes and `segments.test.ts`'s four
      tests still pass, untouched.
- [ ] A git commit exists explaining *why* (tool data is now real,
      file-backed, persistent SQL — not a list that resets on every
      restart — with a live, caused SQL injection demonstrating exactly
      why parameterized queries are non-negotiable, not just convention).
