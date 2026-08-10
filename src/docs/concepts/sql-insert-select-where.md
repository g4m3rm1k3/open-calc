# Concept: SQL `INSERT`, `SELECT`, `WHERE`, `ORDER BY`, and `COUNT`

**What you'll understand by the end:** the core SQL statements for adding rows and reading them back, filtered, ordered, and counted.

**Prerequisites:** `sql-create-table-and-schema.md`.

## Setup

Python 3 with its standard-library `sqlite3` module — no install needed.

## The Problem

Once a table's structure exists (`sql-create-table-and-schema.md`), something is needed to actually add real rows to it, and to read them back — not necessarily every row, not necessarily in storage order, and sometimes only a count rather than the rows themselves.

## The Isolated Example

```python
import sqlite3

connection = sqlite3.connect(":memory:")
connection.execute("CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)")
connection.execute("INSERT INTO pets (name, age) VALUES (?, ?)", ("Rex", 3))
connection.execute("INSERT INTO pets (name, age) VALUES (?, ?)", ("Milo", 5))
connection.execute("INSERT INTO pets (name, age) VALUES (?, ?)", ("Fido", 1))
connection.commit()

print("all, by age:", connection.execute("SELECT * FROM pets ORDER BY age").fetchall())
print("older than 2:", connection.execute("SELECT * FROM pets WHERE age > ?", (2,)).fetchall())
print("count:", connection.execute("SELECT COUNT(*) FROM pets").fetchone()[0])
```

**Real output:**
```
all, by age: [(3, 'Fido', 1), (1, 'Rex', 3), (2, 'Milo', 5)]
older than 2: [(1, 'Rex', 3), (2, 'Milo', 5)]
count: 3
```

**What this proves:** `ORDER BY age` returned rows sorted by age, not by insertion or id order (Fido, inserted last, appears first — it's youngest); `WHERE age > 2` returned only genuinely matching rows; `COUNT(*)` returned a single number, not the rows themselves, computed by SQLite directly rather than requiring Python to fetch and count every row.

## Mechanical Walkthrough

- `INSERT INTO table (col1, col2) VALUES (?, ?)` adds one new row — the column list states which columns are being given explicit values (any omitted column gets its default, or `NULL` if it has none); the actual values are passed separately as parameters (see `sql-parameterized-queries-injection.md`), never embedded directly in the query text.
- `SELECT * FROM table` reads rows back; `*` means "every column" — a specific column list (`SELECT name, age FROM table`) reads only those, useful when a table has more columns than a specific query actually needs.
- `WHERE condition` filters which rows are returned — only rows where the condition evaluates true are included; without a `WHERE` clause, every row in the table is returned.
- `ORDER BY column` sorts the result set by that column, ascending by default (`ORDER BY column DESC` for descending) — **without** an explicit `ORDER BY`, SQL makes no guarantee whatsoever about row order, even though it may often *appear* consistently ordered in practice; relying on unspecified order is a real, common, easy-to-miss bug.
- `COUNT(*)` is an **aggregate function** — it computes a single summary value across a set of rows (here, how many) rather than returning the rows themselves; `.fetchone()[0]` retrieves that one resulting value (the query returns exactly one row, with exactly one column).

## CS Lens

This is **declarative querying** — a `SELECT` statement describes *what* result is wanted (rows matching a condition, sorted a certain way) without specifying *how* the database should actually go find and sort them; the database engine's own query planner decides the actual execution strategy (a full table scan, an index lookup, a particular sort algorithm), invisibly, and can change that strategy later (adding an index, for instance) with zero changes to the query itself. This is a fundamentally different programming model from an imperative loop iterating over an in-memory Python list — see `declarative-vs-imperative-queries.md` for the fuller treatment of this contrast.

Also recognized in: every relational database's identical core SQL vocabulary (this exact `SELECT`/`WHERE`/`ORDER BY` shape works nearly unchanged against PostgreSQL, MySQL, SQL Server), and, more distantly, any other declarative query language (GraphQL, XPath) that separates "what result is wanted" from "how to compute it."

## SE Lens

`COUNT(*)` computed directly by the database, rather than `len(connection.execute("SELECT * FROM pets").fetchall())` (fetching every row into Python memory just to count them), is a real, meaningful efficiency difference once a table has any real size — the database can often compute a count far more efficiently than transferring and materializing every row first, and the difference only grows as row counts grow. The same principle applies to `WHERE`/`ORDER BY`: letting the database filter and sort, rather than fetching everything and filtering/sorting in Python, is both less code and, for any non-trivial data volume, meaningfully faster.

## Connection

Builds on `sql-create-table-and-schema.md`. `sql-parameterized-queries-injection.md` covers the safe way to supply the actual values used in `INSERT`'s `VALUES` and `WHERE`'s comparisons.

## Try It Yourself

1. Add `ORDER BY age DESC` and confirm the result reverses — oldest pet first.
2. Combine `WHERE` and `ORDER BY` in one query (`SELECT * FROM pets WHERE age > 1 ORDER BY name`) and confirm both the filter and the sort apply correctly together.
3. Look up SQL's `LIMIT` clause, add `ORDER BY age DESC LIMIT 1` to a query, and confirm it returns only the single oldest pet — a real, common pattern for "give me just the top N results" without fetching everything and slicing in application code.
