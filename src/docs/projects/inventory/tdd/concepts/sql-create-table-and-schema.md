# Concept: SQL `CREATE TABLE` and Schema Constraints

**What you'll understand by the end:** how to define a table's real structure in SQL — its columns, their types, and constraints the database itself enforces.

**Prerequisites:** `sqlite-file-based-database.md`.

## Setup

Python 3 with its standard-library `sqlite3` module — no install needed.

## The Problem

Before any data can be stored, something has to define *what shape* that data takes — which fields exist, what type each one holds, and which ones are actually required. Without this, a database would just be an unstructured blob, unable to catch an obviously wrong insert (a name where a number belongs) or guarantee two rows in the same table share a consistent structure.

## The Isolated Example

```python
import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("""
    CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER
    )
""")

connection.execute("INSERT INTO pets (name, age) VALUES (?, ?)", ("Rex", 3))
connection.execute("INSERT INTO pets (name) VALUES (?)", ("Milo",))
connection.commit()

for row in connection.execute("SELECT * FROM pets"):
    print(tuple(row))

try:
    connection.execute("INSERT INTO pets (age) VALUES (?)", (5,))
    connection.commit()
except sqlite3.IntegrityError as e:
    print("rejected:", e)
```

**Real output:**
```
(1, 'Rex', 3)
(2, 'Milo', None)
rejected: NOT NULL constraint failed: pets.name
```

**What this proves:** `id` was assigned automatically for both rows (`AUTOINCREMENT`), `age` was allowed to be missing (no constraint on it, so it stored as `NULL`/`None`), and the database itself — not any Python code — rejected the third insert, because `name` is declared `NOT NULL` and that insert never provided one.

## Mechanical Walkthrough

- `CREATE TABLE IF NOT EXISTS pets (...)` defines a new table named `pets`; `IF NOT EXISTS` makes the statement safe to run every time an application starts, silently doing nothing if the table is already there, rather than erroring on every run after the first.
- Each line inside the parentheses declares one **column**: a name (`name`, `age`), a **type** (`INTEGER`, `TEXT` — SQLite's real, if famously flexible, type system), and optional **constraints**.
- `PRIMARY KEY` marks the column that uniquely identifies each row; `AUTOINCREMENT` (paired with `INTEGER PRIMARY KEY`) tells SQLite to assign each new row an automatically incrementing value, never reused even if earlier rows are deleted.
- `NOT NULL` is a real, database-enforced constraint: any `INSERT` that would leave this column empty is rejected outright, raising a real error (`sqlite3.IntegrityError`) rather than silently storing an incomplete row — enforced at the storage layer itself, independent of whatever validation application code may or may not have already done.
- A column with no explicit constraint (`age` here) is allowed to be `NULL` — SQL's real representation of "no value," distinct from `0` or an empty string, and distinct from Python's own `None` only in name (SQLite converts between them automatically).

## Execution Trace

Two real inserts, a real read-back loop, then a real rejected insert —
traced against the real output above:

```
INSERT (name="Rex", age=3)   → id auto-assigned 1 → row (1, "Rex", 3)
INSERT (name="Milo", no age) → id auto-assigned 2 → age has no
  constraint → stored as NULL → row (2, "Milo", None)
commit()

for row in SELECT * FROM pets:
  Row 1: (1, "Rex", 3)   → print (1, 'Rex', 3)
  Row 2: (2, "Milo", None) → print (2, 'Milo', None)
  (loop ends — only 2 rows exist)

try: INSERT (age=5, no name)
  → the database checks the NOT NULL constraint on `name` BEFORE
    storing anything → name is missing → constraint violated
  → raises sqlite3.IntegrityError("NOT NULL constraint failed: pets.name")
except sqlite3.IntegrityError as e:
  → print("rejected:", e)
```

The loop only ever sees the 2 rows that actually made it into the
table — the third, rejected insert never became a row at all, so it
never appears in the loop's own output; the rejection happened at
`INSERT` time, not as a later filtering step.

## CS Lens

A schema is a **contract enforced by the storage layer itself** — the same general idea as a type system (see `typescript-interfaces.md`) or a function's own input validation, applied specifically to what a database will accept as a stored row. Enforcing structure here, in addition to (not instead of) any validation happening in application code, is a real instance of **defense in depth**: even a bug that lets bad data slip past every check *above* the database is still caught by the schema itself.

Also recognized in: JSON Schema (validating a JSON document's structure independently of whatever code produces or consumes it), and every other relational database's own schema system (PostgreSQL, MySQL — the exact syntax varies, the underlying idea of a database-enforced structural contract does not).

## SE Lens

Declaring constraints like `NOT NULL` at the schema level means a mistake in application code (a route that forgets to validate a required field, a script run directly against the database) still can't produce structurally broken data — the cost of catching the error later, at insert time, rather than never, is a real, worthwhile tradeoff for data that must stay reliably shaped for as long as it exists. The real limit, worth naming honestly: `CREATE TABLE IF NOT EXISTS` alone provides no way to *change* an existing table's columns later without writing that migration by hand — a real, separate concern from defining the schema in the first place.

## Connection

Builds on `sqlite-file-based-database.md`. `sql-parameterized-queries-injection.md` covers how values are safely inserted into a table defined this way.

## Try It Yourself

1. Add a `UNIQUE` constraint to `name` (`name TEXT NOT NULL UNIQUE`) and attempt to insert two pets with the same name — read the real `IntegrityError` this produces, and reason about the difference between `UNIQUE` (no two rows may share this value) and `PRIMARY KEY` (uniquely identifies the row, and there can only be one per table).
2. Try inserting a string into the `age` column (`INSERT INTO pets (name, age) VALUES ('Fido', 'young')`) and observe SQLite's real, famously permissive behavior here (it succeeds, storing the string as-is) — research SQLite's own "type affinity" documentation to understand why this differs from most other SQL databases, which would reject it outright.
3. Add a `DEFAULT` value to a column (`age INTEGER DEFAULT 0`) and insert a row omitting `age` entirely — confirm it's stored as `0`, not `NULL`, demonstrating a third real option (beyond "required" and "nullable") for how a column can handle a missing value.
