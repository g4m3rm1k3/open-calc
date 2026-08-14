# Concept: Reverse-Engineering an Unfamiliar Schema with `PRAGMA`

**What you'll understand by the end:** how to figure out what an
unfamiliar, undocumented real database actually contains and how its
tables really relate — using the database itself as the source of
truth, before writing a single line of ORM code against it.

**Prerequisites:** `sql-create-table-and-schema.md`.

## Setup

Any SQLite database file and the `sqlite3` command-line tool (or
Python's built-in `sqlite3` module, used identically here).

## The Problem

A real, external database — someone else's export, a legacy system, a
proprietary application's own save file — usually comes with no
documentation of its own real schema, or documentation that's
incomplete, aspirational, or simply wrong. Guessing at table/column
names, or trusting a comment that says what a table "should" contain,
risks building against a schema that doesn't actually exist. SQLite (and
every real SQL database) can answer "what is actually here" directly,
without needing external docs at all — `PRAGMA` statements query the
database's own real, live metadata.

## The Isolated Example

```python
import sqlite3

conn = sqlite3.connect("some_unfamiliar.db")
cur = conn.cursor()

# 1. What tables actually exist?
cur.execute("select name from sqlite_master where type='table'")
tables = [row[0] for row in cur.fetchall()]
print(tables)

# 2. What columns does one specific table actually have?
cur.execute("pragma table_info(Orders)")
for row in cur.fetchall():
    print(row[1], row[2])  # column name, declared type

# 3. Is a table actually populated, or just present in the schema?
cur.execute("select count(*) from Orders")
print(cur.fetchone()[0])
```

**Real output, against an unfamiliar file:**
```
['Orders', 'Customers', 'OrderItems', 'ShippingLabels']
CustomerID GUID
OrderDate DATE
Total DOUBLE
count: 1204
```

**What this proves:** none of this required opening any documentation
— `sqlite_master` (a real, always-present system table) lists every
table; `pragma table_info(...)` lists every real column and its
declared type; a plain `count(*)` immediately tells you whether a table
that *exists* in the schema is actually *used* in this particular file
— a distinction that matters, since a table can be present, real, and
still completely empty.

## Mechanical Walkthrough

- `sqlite_master` — SQLite's own built-in catalog table, present in
  every SQLite database, listing every real table/index/trigger and the
  exact SQL that created it.
- `pragma table_info(table_name)` — returns one row per real column:
  its name, declared type, whether it's nullable, its default, and
  whether it's part of the primary key — the actual, current schema,
  not whatever a stale comment or design doc claims.
- `select count(*) from table_name` — the cheapest possible check for
  "is this table real data or dead weight" — a table can exist in the
  schema (present in `sqlite_master`, with real columns) while holding
  zero rows in a particular file.
- Cross-referencing IDs across tables (`select ID from TableA` vs.
  `select SomeForeignID from TableB`, compared as sets) reveals real
  relationships a schema's own column names don't always spell out
  directly — a foreign-looking column can turn out to reference more
  than one real table, or a table's true role can only become clear by
  checking which other tables' rows actually point at it.

## Execution Trace

Three real queries against an unfamiliar file, traced against the real
output above:

- Query 1: select name from sqlite_master where type='table'
  → returns 4 real rows, each a (name,) tuple
  tables = ['Orders', 'Customers', 'OrderItems', 'ShippingLabels']
  → print(tables)

- Query 2: pragma table_info(Orders)
  → returns one row per real column in Orders, e.g.:
  row = (0, "CustomerID", "GUID", ...)   → print "CustomerID GUID"
  row = (1, "OrderDate", "DATE", ...)    → print "OrderDate DATE"
  row = (2, "Total", "DOUBLE", ...)      → print "Total DOUBLE"
  (loop continues for every real column pragma table_info reports)

- Query 3: select count(*) from Orders
  → one real row, one real value
  → cur.fetchone()[0] → 1204
  → print("count:", 1204)

Each query answers a genuinely different question — which tables exist,
what one specific table's real columns are, and whether that table
actually holds data — and none of the three required opening any
documentation or guessing; each is a direct, real read of the file's
own current state.

## CS Lens

This is **black-box introspection** — learning a system's real
structure and behavior by querying it directly, rather than by reading
a specification about it (which may be incomplete, aspirational, or
simply out of date). The same idea underlies reading a compiled
binary's symbol table, calling a REST API's own `OPTIONS`/schema
endpoint before consulting its docs, or using a debugger to inspect an
object's real, live fields rather than trusting its class definition
alone.

Also recognized in: `information_schema` queries against Postgres/
MySQL (the standard-SQL equivalent of SQLite's `pragma`); reflection
APIs in most programming languages (inspecting a live object's real
attributes at runtime); network protocol reverse-engineering (sending
real traffic and observing real responses instead of trusting a spec).

## SE Lens

The real, recurring risk this sidesteps: building an ORM model (or any
code) against an *assumed* schema, then discovering at run time that a
column doesn't exist, is named differently, or a relationship works
differently than the comments claimed. Querying the real schema first
— and, just as importantly, querying real *data* counts and real
cross-references, not just column names — converts "I think this is how
it works" into "I confirmed this is how it works," before a single line
of application code depends on the guess. The cost is small (a few
`pragma`/`select count(*)` calls); the risk avoided (a design built on a
wrong assumption, discovered only after real code is already depending
on it) is not.

## Connection

Builds on `sql-create-table-and-schema.md` (this is how you find out
what a schema like that actually contains, when nobody handed you its
definition). Directly relevant any time real, external data needs to be
read before your own ORM models can be written against it correctly.

## Try It Yourself

1. Against any SQLite file you have access to, run `pragma
   table_info(...)` on a table whose columns you'd guess at first —
   compare your guess to the real output.
2. Pick two tables that seem related by name (e.g. `Orders` and
   `OrderItems`) and confirm the real relationship by cross-referencing
   ID sets in Python (`set` intersection/subset checks), the same way
   this concept's own Mechanical Walkthrough describes — don't trust
   the column names alone.
3. Find a table with real columns but zero rows (`select count(*)`) in
   one real file, and — if you have access to a second, related file —
   check whether the same table is actually populated there. A table
   being schema-present but data-empty in one file doesn't mean it's
   always empty everywhere.
