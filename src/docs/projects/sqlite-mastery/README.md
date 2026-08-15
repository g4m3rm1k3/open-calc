# SQLite Mastery — SQL, Python, a Real Backend, and a Real Desktop App

## What this is

A from-zero curriculum built entirely around one real, growing SQLite
database. It starts with no assumed database knowledge at all — not even
"what is SQL" — and ends with a working desktop application: a Python
backend serving a SQLite database, and a `pywebview` desktop shell
rendering that data through jQuery DataTables, talking to a *second*,
already-existing, deliberately messy database you did not design
yourself.

Every lesson follows this repo's full
[`LESSON SCHEMA.md`](../../reference/LESSON%20SCHEMA.md): every construct
gets its own throwaway isolated lab before it's used for real, every code
block is run for real with real output pasted in, every hard concept gets
a CS lens and an SE lens, nothing is asserted without proof.

## Who this is for

No prior database knowledge assumed — Arc 1 starts at "what even is a
database." Real programming experience in *some* language is assumed
(this repo's other tracks cover that ground); Python syntax itself is not
re-taught, only what's SQLite- or web-specific about using it. Every
other technology this series touches — SQL, the SQLite CLI, the Python
`sqlite3` module, FastAPI, `pywebview`, jQuery, and jQuery DataTables —
gets full first-appearance treatment, the same as every other series in
this curriculum.

## How the lessons are ordered

Seven arcs. Nothing in a later arc is used before the earlier arc that
teaches it. The same one SQLite file — a small hardware-store inventory
database — is built up incrementally across Arcs 1–5; Arc 6 deliberately
switches to a *second*, already-existing database this series did not
design, because "hand it a schema you've never seen" is its own real
skill that building your own schema from scratch cannot teach.

### Arc 1 — SQL and SQLite Foundations (the `sqlite3` CLI only, no app yet)

| # | Lesson | Covers |
|---|---|---|
| 01 | What a Database Is, and Why SQLite | file-based vs. client-server databases, installing/launching the real `sqlite3` CLI, the `.db` file itself |
| 02 | `CREATE TABLE` and SQLite's Type Affinity | dynamic typing, storage classes — SQLite's real, distinctive departure from most other databases |
| 03 | `INSERT` and the Row | `rowid`, `INTEGER PRIMARY KEY` as a real alias for it |
| 04 | `SELECT`, `WHERE`, `ORDER BY`, `LIMIT` | filtering and shaping a result set |
| 05 | `NULL` and Three-Valued Logic | a real query proving `NULL <> NULL` |
| 06 | `UPDATE` and `DELETE` | mutating rows, the real danger of a missing `WHERE` |
| 07 | Constraints | `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`, proven against real constraint-violation errors |
| 08 | Primary and Foreign Keys | referential integrity, `PRAGMA foreign_keys`, `ON DELETE CASCADE` |
| 09 | Inner and Left Joins | combining tables, proven against a real orphaned-row case |
| 10 | Aggregate Functions, `GROUP BY`, `HAVING` | counting, summing, and grouping rows |
| 11 | Subqueries and Common Table Expressions | a query inside a query, and `WITH` as a named, readable alternative |
| 12 | Views | a saved query, proven read-through against a real live table |
| 13 | Indexes and `EXPLAIN QUERY PLAN` | proven with a real full-table-scan vs. index-seek comparison |
| 14 | Transactions and ACID | `BEGIN`/`COMMIT`/`ROLLBACK`, proven against a real partial-write failure |
| 15 | Triggers | a real automatic side effect, proven live |
| 16 | SQLite-Specific Tour | `PRAGMA`s, `VACUUM`, `ATTACH DATABASE`, the JSON1 and FTS5 extensions |

### Arc 2 — Python and SQLite (the `sqlite3` standard-library module)

| # | Lesson | Covers |
|---|---|---|
| 17 | Connecting from Python | `sqlite3.connect`, cursor, `execute`, `fetchone`/`fetchall` |
| 18 | Parameterized Queries and SQL Injection | a real injection attack against string-formatted SQL, then the real fix |
| 19 | `sqlite3.Row` and Dict-Like Access | reading columns by name instead of tuple position |
| 20 | Transactions in Python | `commit`/`rollback`, context managers, `isolation_level` |
| 21 | `executemany` and Bulk Loading | inserting many rows without a Python-level loop of single `INSERT`s |
| 22 | A Repository Pattern in Python | wrapping raw SQL behind functions, proven against a real duplicated-SQL smell |
| 23 | Testing Against an In-Memory Database | `:memory:`, a real `pytest` fixture |
| 24 | Hand-Rolled Schema Migrations | a versions table, proven against a real "column added after data already exists" scenario |

### Arc 3 — The Same File, From Other Languages (a portability tour)

| # | Lesson | Covers |
|---|---|---|
| 25 | Opening the Same `.db` From Node.js | `node:sqlite`, proving the file itself is the interface, not Python |
| 26 | Opening the Same `.db` From C# | `Microsoft.Data.Sqlite`, the same proof from a statically-typed language |
| 27 | Opening the Same `.db` From a Browser | `sql.js` (SQLite compiled to WebAssembly), and why this one is fundamentally different — a copy in memory, not the real file |

### Arc 4 — The Python Backend (FastAPI over SQLite)

| # | Lesson | Covers |
|---|---|---|
| 28 | Why a Backend At All | a real concurrent-write problem, caused on purpose, that direct file access can't safely solve alone |
| 29 | FastAPI Project Setup and the First Endpoint | a real running server, a real HTTP request against it |
| 30 | Pydantic Models | request/response validation, proven against a real rejected bad payload |
| 31 | A Real Database Dependency | FastAPI's `Depends`, a connection scoped to one request |
| 32 | `GET` Endpoints | listing and filtering rows via query parameters |
| 33 | `POST`/`PUT`/`DELETE` Endpoints | full CRUD, proven against real HTTP requests and real database rows |
| 34 | Pagination | `LIMIT`/`OFFSET` wired to query parameters, proven against a real large-result-set problem |
| 35 | Error Handling and HTTP Status Codes | proven against a real 404, a real 422, and a real 500 |
| 36 | CORS | proven against a real browser same-origin failure, then the real fix |

### Arc 5 — `pywebview` Desktop Shell + jQuery DataTables

| # | Lesson | Covers |
|---|---|---|
| 37 | What `pywebview` Is | a native window hosting a real local web page — first isolated hello-window lab |
| 38 | jQuery Fundamentals | selectors, `$.ajax`, DOM events — first appearance, this series' first new client-side library |
| 39 | Rendering the Backend's Data as a DataTable | client-side processing, proven against real rendered rows from a real HTTP response |
| 40 | DataTables Server-Side Processing | the real `draw`/`start`/`length`/`search`/`order` protocol, mapped to a real SQL query |
| 41 | Add/Edit/Delete From the UI | modal forms wired to the backend, a live DataTables reload |
| 42 | Running the Backend and `pywebview` Together | process lifecycle, proven against a real "backend not ready yet" race condition |
| 43 | Packaging the Desktop App | `PyInstaller`, a real standalone distributable |

### Arc 6 — Working With an Already-Created, Complex Database

| # | Lesson | Covers |
|---|---|---|
| 44 | Handed a `.db` With No Docs | `.schema`, `.tables`, `sqlite_master`, `PRAGMA table_info`/`foreign_key_list` against a real, unfamiliar file |
| 45 | Reverse-Engineering an ER Diagram From Schema Alone | recovering the real relationships with no prior documentation |
| 46 | Reading Views and Triggers to Recover Business Rules | the schema as the only source of truth |
| 47 | Messy Legacy Schema Realities | inconsistent naming, redundant columns, proven against a real query that returns *wrong* results until understood |
| 48 | Pointing the Existing App at This New Database | adapting Arc 4/5's backend and UI to a schema they weren't built for, proven against real failing endpoints until fixed |
| 49 | SQLite's Limited `ALTER TABLE`, and the Table-Rebuild Pattern | proven against a real unsupported `ALTER TABLE`, then the real 12-step rebuild that works around it |

### Arc 7 — Production and Mastery Topics

| # | Lesson | Covers |
|---|---|---|
| 50 | Concurrency and Locking | WAL mode, `busy_timeout`, proven against a real "database is locked" error |
| 51 | Query Performance and the N+1 Problem | proven against a real slow endpoint, then fixed |
| 52 | Backup and Restore | `.backup`, `VACUUM INTO`, the online backup API |
| 53 | Full-Text Search in the Real App | FTS5 wired live into the DataTables search box |
| 54 | Encryption Overview | SQLCipher — what it changes, what it doesn't, and why this series' own database doesn't use it |
| 55 | Series Complete | one trace connecting every arc, start to finish |

## Status

In progress.

- [ ] Arc 1 — SQL and SQLite Foundations (01–16)
- [ ] Arc 2 — Python and SQLite (17–24)
- [ ] Arc 3 — The Same File, From Other Languages (25–27)
- [ ] Arc 4 — The Python Backend (28–36)
- [ ] Arc 5 — `pywebview` + jQuery DataTables (37–43)
- [ ] Arc 6 — An Already-Created, Complex Database (44–49)
- [ ] Arc 7 — Production and Mastery Topics (50–55)
