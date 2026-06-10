# Python Tool Database — LAB 11 — CREATE TABLE, Data Types, and Constraints

**Prerequisites:** Lab 10. You have the schema design from the previous lesson. You know what a relational database is and why it exists. No SQL experience required.

**What this lab adds:**
- SQL syntax: `CREATE TABLE` with columns and types
- SQLite's four storage types: `INTEGER`, `REAL`, `TEXT`, `BLOB`
- Constraints: `NOT NULL`, `UNIQUE`, `DEFAULT`, `PRIMARY KEY AUTOINCREMENT`
- The SQLite type affinity system — why it is more relaxed than other databases
- Creating `tools.db` with the `tools` table and verifying it with Python

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the difference between `NOT NULL` and `DEFAULT 0` on a column? Can a column have both?
> 2. If `id INTEGER PRIMARY KEY`, can two rows have the same `id`? What happens if you try?
> 3. SQLite stores `0.5` as a `REAL`, `"EM-0500"` as `TEXT`, and `1` as `INTEGER`. What does it store `True` as?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have `tools.db` — a real SQLite database file — with a `tools` table that enforces your schema constraints. You will verify it works by inserting and reading back a row using Python:

```python
conn = sqlite3.connect("tools.db")
cursor = conn.execute("SELECT name, diameter_inches, tool_type FROM tools")
print(cursor.fetchone())
# → ('EM-0500', 0.5, 'endmill')
```

---

## Step 1 — SQL as a Language

**SQL** (Structured Query Language) is the language used to define, modify, and query relational databases. It is declarative — you describe what you want, not how to get it.

SQL has three main groups of statements:

| Group | Name | What it does | Examples |
|-------|------|-------------|---------|
| DDL | Data Definition Language | Defines the structure | `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` |
| DML | Data Manipulation Language | Changes the data | `INSERT`, `UPDATE`, `DELETE` |
| DQL | Data Query Language | Reads the data | `SELECT` |

This lesson covers DDL — specifically `CREATE TABLE`.

SQL keywords are conventionally written in UPPERCASE. Column names and table names are in `snake_case`. SQL is not case-sensitive for keywords, but the convention makes statements easier to read.

---

### Concept: `CREATE TABLE` — Defining Structure

**What it is:** A SQL statement that creates a new table with specified columns, types, and constraints.

**The syntax:**

```sql
CREATE TABLE table_name (
    column_name  DATA_TYPE  CONSTRAINTS,
    column_name  DATA_TYPE  CONSTRAINTS,
    ...
);
```

**Minimal example:**

```sql
CREATE TABLE tools (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL
);
```

This creates a table named `tools` with two columns: an auto-incrementing integer id and a required text name.

**`CREATE TABLE IF NOT EXISTS`:** The safe version. If the table already exists, it does nothing. Without `IF NOT EXISTS`, running the statement twice raises an error.

```sql
CREATE TABLE IF NOT EXISTS tools (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL
);
```

**Canonical example (General):**

Creating a table is like filing a form to define a new spreadsheet: "This spreadsheet has columns A (number, required), B (text, required), C (date, optional)." The definition is the schema; the rows are the data you will add later. The definition enforces what can go in each column.

**Project application:** The tools table defines the structure for every cutting tool record in the database. Every insert must provide `name`, `diameter_inches`, `material`, and `tool_type`. The database rejects inserts that violate these constraints.

**You will see this again in:** Every SQL-based project. In Block 18 (migrations): `ALTER TABLE` adds columns to existing tables. In SQLAlchemy (Block 5): `create_all()` runs `CREATE TABLE` statements generated from Python class definitions.

**Watch for:** `CREATE TABLE` fails if the table already exists (without `IF NOT EXISTS`). In development, you will often want to drop and recreate tables during schema iteration. In production, you use migrations instead.

---

## Step 2 — SQLite Data Types

SQLite has four storage types:

| SQLite type | Stores | Python equivalent |
|-------------|--------|-----------------|
| `INTEGER` | Whole numbers | `int` |
| `REAL` | Floating-point numbers | `float` |
| `TEXT` | Unicode text strings | `str` |
| `BLOB` | Raw bytes, uninterpreted | `bytes` |

There is no separate `BOOLEAN`, `DATE`, or `DATETIME` type in SQLite. The standard workarounds:

- **Boolean**: store as `INTEGER` — `0` is false, `1` is true
- **Date/datetime**: store as `TEXT` in ISO 8601 format: `"2024-01-15"` or `"2024-01-15T09:30:00"`
- **Decimal money**: store as `INTEGER` cents (avoid float rounding errors)

---

### Concept: SQLite Type Affinity

**What it is:** SQLite's relaxed approach to types — instead of strict enforcement, it uses "affinity" (preference) while still allowing any type in any column.

**What most databases do:** PostgreSQL enforces types strictly. Inserting `"hello"` into an `INTEGER` column raises a type error.

**What SQLite does:** SQLite tries to convert the value to the column's preferred type. If it cannot convert, it stores the value as-is.

```sql
CREATE TABLE test (num INTEGER);
INSERT INTO test VALUES ('42');    -- SQLite converts "42" to integer 42
INSERT INTO test VALUES ('hello'); -- Cannot convert — stores TEXT 'hello' in INTEGER column!
```

SQLite stores `'hello'` in an `INTEGER` column without error. This is called **type affinity** — the column has a preference for integers, but it is not enforced.

**Why this matters:**

1. It means you can store any value in any column unless you use the `STRICT` keyword (SQLite 3.37+)
2. It means Python's `sqlite3` module returns the original Python type, not necessarily what you declared

```python
conn.execute("INSERT INTO tools VALUES ('hello')")   # no error in SQLite
row = conn.execute("SELECT * FROM tools").fetchone()
type(row[0])   # → str, not int — because the value stored was a string
```

**The practical rule:** Treat SQLite type affinity as a known quirk. Your Python application code is responsible for sending the right types. Do not rely on SQLite to catch type mismatches.

**You will see this again in:** This matters when debugging unexpected query results. In SQLAlchemy (Block 5): SQLAlchemy adds its own type enforcement layer on top of SQLite's permissive behavior.

**Watch for:** `REAL` columns in SQLite have floating-point precision limits — the same as Python's `float`. Storing `0.1 + 0.2` as a REAL will give `0.30000000000000004`. For tool diameters this is acceptable (sub-nanometer error). For financial calculations, use INTEGER cents.

---

## Step 3 — Constraints

Constraints are rules the database enforces on every write.

| Constraint | What it enforces |
|-----------|-----------------|
| `NOT NULL` | Column must have a value — NULL is rejected |
| `UNIQUE` | No two rows can have the same value in this column |
| `PRIMARY KEY` | Uniquely identifies each row — implies `NOT NULL` and `UNIQUE` |
| `AUTOINCREMENT` | Auto-assigns the next available integer (only on `INTEGER PRIMARY KEY`) |
| `DEFAULT value` | If no value provided, use this default |
| `REFERENCES table(col)` | Value must exist as a key in the referenced table (foreign key) |
| `CHECK(expr)` | Value must satisfy this Boolean expression |

---

### Concept: `NOT NULL` vs `DEFAULT`

**What they are:** Two different ways of handling "no value provided."

**`NOT NULL`:** The column must have a value. If the insert omits this column or explicitly inserts `NULL`, the database raises an error.

```sql
CREATE TABLE tools (
    name TEXT NOT NULL   -- required: INSERT must include name
);

INSERT INTO tools (name) VALUES (NULL);   -- ConstraintError: NOT NULL constraint failed
INSERT INTO tools (diameter_inches) VALUES (0.5);  -- ConstraintError: name is required
```

**`DEFAULT value`:** If the insert omits this column, use this value automatically. The column can still be set to `NULL` explicitly.

```sql
CREATE TABLE tools (
    material TEXT DEFAULT 'carbide'   -- uses 'carbide' if not specified
);

INSERT INTO tools (name) VALUES ('EM-0500');  -- material defaults to 'carbide'
INSERT INTO tools (name, material) VALUES ('EM-0500', NULL);  -- material is NULL
```

**Both together:** A column can be `NOT NULL DEFAULT 'carbide'` — required AND has a default. If the insert omits the column, it uses `'carbide'`. If the insert sets it to `NULL`, the database rejects it.

**Why this matters here:** `tool_type` is `NOT NULL` — every tool must have a type. `notes` is nullable — a note is optional. `material` could have a default or be required; we choose required because "unknown material" is not useful data.

---

### Concept: `PRIMARY KEY AUTOINCREMENT`

**What it is:** A column declaration that automatically assigns a unique, incrementing integer to each new row.

**The problem without it:** You must track and provide a unique ID for every insert. With concurrent inserts, two processes might try to use the same ID.

**The solution:**

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

Every new row gets the next available integer. SQLite tracks the counter internally. You never provide a value for `id` in an insert — the database assigns it.

**`PRIMARY KEY` alone vs `PRIMARY KEY AUTOINCREMENT`:**

- `INTEGER PRIMARY KEY` alone: SQLite automatically uses the rowid (an internal row number) as the primary key. If a row is deleted, the deleted number can be reused.
- `INTEGER PRIMARY KEY AUTOINCREMENT`: strictly increments, never reuses deleted numbers. Safer for referential integrity — a deleted ID is never assigned to a new row.

**For this project:** Use `AUTOINCREMENT`. Tool IDs that are referenced in assemblies and jobs must never be reused, even after deletion.

**You will see this again in:** Every table in this project. In PostgreSQL: the equivalent is `SERIAL` or `GENERATED ALWAYS AS IDENTITY`. In SQLAlchemy (Block 5): autoincrement behavior is configured on the model column.

---

## Step 4 — Red: Write the Test

Create `tests/test_schema.py`:

```python
import sqlite3
import tempfile
import os
from pathlib import Path

from tooldb.schema import create_schema    # ← will fail


def test_tools_table_exists(tmp_path):
    db_path = tmp_path / "test.db"          # tmp_path is a pytest fixture: temp directory
    conn = sqlite3.connect(str(db_path))
    create_schema(conn)                     # run schema creation

    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='tools'"
    )
    assert cursor.fetchone() is not None    # table exists


def test_tools_table_has_required_columns(tmp_path):
    db_path = tmp_path / "test.db"
    conn = sqlite3.connect(str(db_path))
    create_schema(conn)

    cursor = conn.execute("PRAGMA table_info(tools)")   # PRAGMA returns column metadata
    columns = {row[1] for row in cursor.fetchall()}     # row[1] is the column name

    assert "id" in columns
    assert "name" in columns
    assert "diameter_inches" in columns
    assert "material" in columns
    assert "tool_type" in columns


def test_name_not_null_constraint(tmp_path):
    db_path = tmp_path / "test.db"
    conn = sqlite3.connect(str(db_path))
    create_schema(conn)

    with pytest.raises(sqlite3.IntegrityError):   # NOT NULL violation → IntegrityError
        conn.execute(
            "INSERT INTO tools (diameter_inches, material, tool_type) VALUES (0.5, 'carbide', 'endmill')"
        )   # name is omitted — should fail


def test_can_insert_and_retrieve_tool(tmp_path):
    db_path = tmp_path / "test.db"
    conn = sqlite3.connect(str(db_path))
    create_schema(conn)

    conn.execute(
        "INSERT INTO tools (name, diameter_inches, material, tool_type) "
        "VALUES ('EM-0500', 0.5, 'carbide', 'endmill')"
    )
    conn.commit()

    row = conn.execute("SELECT name, diameter_inches FROM tools WHERE name='EM-0500'").fetchone()
    assert row is not None
    assert row[0] == "EM-0500"
    assert row[1] == 0.5


import pytest   # ← add at top of file
```

Fix the import — move `import pytest` to the top of the file:

```python
import sqlite3
import pytest
from tooldb.schema import create_schema
```

Run:

```powershell
pytest tests/test_schema.py
```

**You should see:**

```
ModuleNotFoundError: No module named 'tooldb.schema'
```

Red.

---

## Step 5 — Green: Write the Schema

Create `tooldb/schema.py`:

```python
import sqlite3

TOOLS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS tools (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    name            TEXT     NOT NULL UNIQUE,
    diameter_inches REAL     NOT NULL,
    flutes          INTEGER,
    material        TEXT     NOT NULL,
    tool_type       TEXT     NOT NULL,
    notes           TEXT
)
"""
# UNIQUE on name: two tools cannot have the same name in this database
# flutes is nullable: not all tool types use flute count
# notes is nullable: optional free-text annotation
```

Add the `create_schema` function:

```python
def create_schema(conn: sqlite3.Connection) -> None:
    conn.execute(TOOLS_TABLE_SQL)   # creates the tools table if it doesn't exist
    conn.commit()                   # persist the schema change to the file
```

Run:

```powershell
pytest tests/test_schema.py
```

**You should see:** 4 passed.

---

## Step 6 — Extend the Schema

The full schema from the design in lesson 10 includes four more tables. Add them to `tooldb/schema.py`:

```python
HOLDERS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS holders (
    id                  INTEGER  PRIMARY KEY AUTOINCREMENT,
    name                TEXT     NOT NULL UNIQUE,
    taper               TEXT     NOT NULL,
    collet_size_inches  REAL     NOT NULL
)
"""

ASSEMBLIES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS assemblies (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    name            TEXT     NOT NULL UNIQUE,
    tool_id         INTEGER  NOT NULL REFERENCES tools(id),
    holder_id       INTEGER  NOT NULL REFERENCES holders(id),
    stickout_inches REAL     NOT NULL,
    notes           TEXT
)
"""
# REFERENCES enforces referential integrity:
# tool_id must exist in tools(id); holder_id must exist in holders(id)

JOBS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS jobs (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    name        TEXT     NOT NULL,
    part_number TEXT,
    created_at  TEXT     NOT NULL,
    source_file TEXT
)
"""
# created_at is TEXT in ISO 8601 format: "2024-01-15T09:30:00"
# SQLite has no native datetime type; ISO 8601 strings sort correctly

JOB_ASSEMBLIES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS job_assemblies (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT,
    job_id        INTEGER  NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    assembly_id   INTEGER  NOT NULL REFERENCES assemblies(id),
    tool_position INTEGER,
    added_at      TEXT     NOT NULL
)
"""
# ON DELETE CASCADE on job_id: deleting a job removes its assembly links automatically
# No CASCADE on assembly_id: assemblies are independent and must be explicitly managed
```

Update `create_schema` to create all five tables:

```python
ALL_TABLES = [
    TOOLS_TABLE_SQL,
    HOLDERS_TABLE_SQL,
    ASSEMBLIES_TABLE_SQL,
    JOBS_TABLE_SQL,
    JOB_ASSEMBLIES_TABLE_SQL,
]


def create_schema(conn: sqlite3.Connection) -> None:
    conn.execute("PRAGMA foreign_keys = ON")    # ← add this: SQLite foreign keys are OFF by default
    for table_sql in ALL_TABLES:
        conn.execute(table_sql)                 # create each table
    conn.commit()
```

**Important:** `PRAGMA foreign_keys = ON` must be run every time you open a connection. SQLite disables foreign key enforcement by default for backward compatibility. Without this pragma, `REFERENCES` constraints are defined but not enforced — inserts with invalid foreign keys succeed silently.

Add tests for the additional tables:

```python
def test_holders_table_exists(tmp_path):
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)
    cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='holders'")
    assert cursor.fetchone() is not None


def test_foreign_key_enforced(tmp_path):
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)

    with pytest.raises(sqlite3.IntegrityError):
        conn.execute(
            "INSERT INTO assemblies (name, tool_id, holder_id, stickout_inches) "
            "VALUES ('test', 999, 999, 1.5)"
        )   # tool_id 999 does not exist — foreign key violation
```

Run:

```powershell
pytest tests/test_schema.py
```

**You should see:** 6 passed.

---

## Step 7 — Create the Real Database File

Now create the actual `tools.db` file that the application will use:

```powershell
python -c "
import sqlite3
from tooldb.schema import create_schema
conn = sqlite3.connect('python-tooldb/tools.db')
create_schema(conn)
conn.close()
print('Database created: tools.db')
"
```

**You should see:** `Database created: tools.db`

Verify the schema with Python's sqlite3:

```python
python
import sqlite3
conn = sqlite3.connect("python-tooldb/tools.db")
cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
print([row[0] for row in cursor.fetchall()])
```

**You should see:** `['tools', 'holders', 'assemblies', 'jobs', 'job_assemblies']`

Run the full test suite:

```powershell
pytest tests/
```

**You should see:** All tests pass.

---

### SAVE AND TRY

```powershell
pytest tests/test_schema.py -v
```

**You should see:** All 6 schema tests with their names.

**Console test:** In the REPL:

```python
import sqlite3
from tooldb.schema import create_schema

conn = sqlite3.connect(":memory:")          # in-memory database for exploration
create_schema(conn)

# Check the column types declared for tools:
cursor = conn.execute("PRAGMA table_info(tools)")
for row in cursor.fetchall():
    print(f"  {row[1]:20s} {row[2]:10s} NOT NULL={row[3]}  DEFAULT={row[4]}")
```

**Expected:** Five columns with their types and NOT NULL flags.

**Change something:** Remove `conn.execute("PRAGMA foreign_keys = ON")` from `create_schema`. Run `test_foreign_key_enforced`. Does it still pass? **Expected:** No — the test expects an `IntegrityError` but without the pragma, SQLite accepts the bad foreign key silently. The test fails because no exception is raised. Add the pragma back.

---

## 🎯 Challenge: Add a CHECK Constraint

**You know:** `CREATE TABLE`, constraints, SQLite types.

**Task:** Add a `CHECK` constraint to the `tools` table that enforces `diameter_inches > 0`. A tool with a zero or negative diameter is physically impossible.

Write a test first:

```python
def test_negative_diameter_rejected(tmp_path):
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)

    with pytest.raises(sqlite3.IntegrityError):
        conn.execute(
            "INSERT INTO tools (name, diameter_inches, material, tool_type) "
            "VALUES ('BAD', -0.5, 'carbide', 'endmill')"
        )   # negative diameter — should be rejected
```

Add the constraint to `TOOLS_TABLE_SQL`. The syntax is:

```sql
diameter_inches REAL NOT NULL CHECK(diameter_inches > 0)
```

---

<details>
<summary>▶ Show Solution</summary>

**Test first** (add to `tests/test_schema.py`):

```python
def test_negative_diameter_rejected(tmp_path):
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)
    with pytest.raises(sqlite3.IntegrityError):
        conn.execute(
            "INSERT INTO tools (name, diameter_inches, material, tool_type) "
            "VALUES ('BAD', -0.5, 'carbide', 'endmill')"
        )
```

**Updated `TOOLS_TABLE_SQL`** in `tooldb/schema.py`:

```python
TOOLS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS tools (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    name            TEXT     NOT NULL UNIQUE,
    diameter_inches REAL     NOT NULL CHECK(diameter_inches > 0),
    flutes          INTEGER           CHECK(flutes IS NULL OR flutes > 0),
    material        TEXT     NOT NULL,
    tool_type       TEXT     NOT NULL,
    notes           TEXT
)
"""
```

Note the second CHECK: `flutes IS NULL OR flutes > 0` — flutes is nullable (no flute count for a drill), but if provided, it must be positive. The `IS NULL OR` allows the nullable case while still rejecting zero or negative flute counts.

**Key insight:** CHECK constraints move invariant enforcement from application code into the database schema. Without this constraint, application code must check `diameter > 0` everywhere a tool is created or updated. With the constraint, the database rejects the bad data regardless of how it gets there — even from a direct `sqlite3` command that bypasses the application. Schema-level constraints are the last line of defense against corrupted data.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `tools` table exists in `tools.db` | `pytest tests/test_schema.py::test_tools_table_exists` |
| Required columns present | `test_tools_table_has_required_columns` passes |
| `NOT NULL` constraint enforced | `test_name_not_null_constraint` passes |
| Can insert and retrieve a row | `test_can_insert_and_retrieve_tool` passes |
| Foreign keys enforced | `test_foreign_key_enforced` passes |
| All previous tests still pass | `pytest tests/` — no regressions |
| Can state the four SQLite types | INTEGER, REAL, TEXT, BLOB |
| Can explain why `PRAGMA foreign_keys = ON` is required | SQLite disables FK enforcement by default; pragma enables it per connection |

---

## Quick Check Answers

**1. `NOT NULL` vs `DEFAULT 0` — can a column have both?**

Yes. They address different scenarios. `NOT NULL` says "a value must be provided — NULL is rejected." `DEFAULT 0` says "if no value is provided, use 0 automatically." Together: if the insert omits the column, it gets `0` (from DEFAULT). If the insert explicitly provides `NULL`, it is rejected (by NOT NULL). A column with only `NOT NULL` rejects inserts that omit the column or provide `NULL`. A column with only `DEFAULT 0` accepts explicit `NULL` even though it has a default. Both together: the column always has a value, either provided or defaulted.

**2. Can two rows have the same `id` when `id INTEGER PRIMARY KEY`?**

No. `PRIMARY KEY` implies `UNIQUE`. If you try to insert a row with an `id` that already exists, SQLite raises `sqlite3.IntegrityError: UNIQUE constraint failed: tools.id`. With `AUTOINCREMENT`, you never provide the `id` yourself — SQLite assigns the next available integer and the question never arises.

**3. What does SQLite store `True` as?**

`True` in Python is stored as `INTEGER 1`. Python's `True` is `bool`, which is a subtype of `int` — `True == 1` and `False == 0`. When you insert Python `True` into SQLite, the `sqlite3` module converts it to integer `1`. When you read it back, you get integer `1` unless you add a custom converter. For boolean columns, use `INTEGER` type with `CHECK(col IN (0, 1))` to enforce the two-value constraint.
