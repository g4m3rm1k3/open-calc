# Python Tool Database — LAB 18 — Schema Migrations

**Prerequisites:** Lab 17. You have `ToolRepository` in `tool_repository.py`. You have all five tables in `schema.py`. All tests pass.

**What this lab adds:**
- What a migration is and why it exists
- `ALTER TABLE` — adding columns to an existing table without losing data
- SQLite's limited `ALTER TABLE` and the recreate-and-rename workaround
- Schema version tracking with a `schema_version` table
- A minimal `migrations/` folder with numbered `.sql` files
- A `migrate.py` script that reads the current version and applies pending migrations

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have 500 tools in your production database. You need to add a `preferred_sfm` column to the `tools` table. You cannot drop and recreate the table — why? What do you do instead?
> 2. What happens if you run the same migration script twice? What should happen instead?
> 3. SQLite's `ALTER TABLE` is more limited than PostgreSQL's. Name one thing you can do in PostgreSQL's ALTER TABLE that you cannot do in SQLite's without a workaround.
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A migrations system:

```
python-tooldb/
    migrations/
        0001_initial_schema.sql     ← the initial CREATE TABLE statements
        0002_add_preferred_sfm.sql  ← adds preferred_sfm column to tools
    migrate.py                      ← the migration runner
tests/
    test_migrations.py              ← NEW: 4 tests verifying migration behavior
```

Running `python migrate.py` on a fresh database applies both migrations in order. Running it again does nothing (migrations are idempotent — safe to run twice).

---

## Step 1 — The Problem With `CREATE TABLE IF NOT EXISTS`

The `create_schema` function in `schema.py` uses `CREATE TABLE IF NOT EXISTS`. This works perfectly for a brand-new database. It does not work for an existing database that needs new columns.

**The scenario:**

You have version 1.0 of the tool database deployed. 500 tools are recorded. The machinists have been using it for three months.

You need to add a `preferred_sfm` column to `tools` — the machinist-preferred surface feet per minute for each tool.

**Option A — Drop and recreate:**

```sql
DROP TABLE tools;
CREATE TABLE tools (id INTEGER PRIMARY KEY, ..., preferred_sfm REAL);
```

All 500 tools are gone. Unacceptable.

**Option B — ALTER TABLE:**

```sql
ALTER TABLE tools ADD COLUMN preferred_sfm REAL;
```

Adds the column to the existing table. All 500 tools keep their rows. The new column gets `NULL` as its default value for existing rows.

**The migration pattern:** A series of numbered scripts, each making one change to the schema. They are applied in order, once each, and never rerun.

---

### Concept: Schema Migration — Versioned, Ordered, Idempotent Schema Changes

**What it is:** A migration is a numbered, sequential script that transforms a database schema from one version to the next. A migration runner tracks which migrations have been applied and runs only the ones that haven't.

**What it hides:** The complexity of tracking what state the database is in and what changes it still needs. Without a migration system, deploying a schema change requires remembering to run the right SQL by hand, on every database (dev, test, production). Missing one leaves a database in an inconsistent state. The migration runner owns this bookkeeping — you never run SQL manually for schema changes.

**The invariant:** Every database that has run migrations up to version N is in exactly the same schema state. Version number = schema state. This makes deployment reproducible.

**Three properties of a good migration:**

1. **Forward-only:** Migrations move the schema forward. Rollback migrations (down migrations) are optional and often not implemented — they are rarely needed if you deploy carefully.
2. **Idempotent detection:** The runner checks which migrations have already run and skips them. Running the runner twice is safe.
3. **Atomic:** Each migration runs in a transaction. If a migration fails halfway through, its changes are rolled back. The schema version does not advance.

**Canonical example (General Explanation):**

Software deployment at a company. You have 3 servers running the same application. The database is shared. You need to add a column. With a migration system: commit migration file `0012_add_email_verified.sql`, deploy to all servers, run `python migrate.py` on each — all three databases end up identical. Without it: SSH to each server, remember to run `ALTER TABLE` manually, keep a personal log of which servers you've updated. One missed update and users get a column-not-found error on that server.

**You will see this again in:** Every production database. Alembic (SQLAlchemy's migration tool — Block 5): `alembic upgrade head` runs all pending migrations. Django: `python manage.py migrate`. Rails: `rails db:migrate`. The concept is identical across all frameworks. Every software engineering interview that touches databases may ask about migrations.

**Watch for:** Running migrations inside the application on startup (auto-migrate). This is convenient for development but dangerous in production — a failed migration will crash the entire application on every process start. Production systems run migrations as a separate deployment step, separate from the application start.

---

## Step 2 — `ALTER TABLE` in SQLite

### Concept: SQLite's Limited `ALTER TABLE`

**What most databases support:**

PostgreSQL, MySQL, and SQL Server support a wide range of `ALTER TABLE` operations:

```sql
ALTER TABLE tools ADD COLUMN preferred_sfm REAL;    -- add column
ALTER TABLE tools DROP COLUMN notes;                 -- remove column
ALTER TABLE tools RENAME COLUMN diameter TO diameter_inches;  -- rename column
ALTER TABLE tools ALTER COLUMN material SET NOT NULL; -- change constraint
```

**What SQLite supports (as of SQLite 3.35+):**

```sql
ALTER TABLE tools ADD COLUMN preferred_sfm REAL;    -- supported: add column
ALTER TABLE tools DROP COLUMN notes;                 -- supported (3.35+)
ALTER TABLE tools RENAME COLUMN old TO new;          -- supported (3.25+)
ALTER TABLE tools RENAME TO new_name;               -- supported: rename table
```

**What SQLite does NOT support:**

- Changing a column's type
- Adding a `NOT NULL` constraint to an existing column (unless you provide a default)
- Adding a foreign key constraint to an existing column
- Removing a `UNIQUE` constraint

**The recreate-and-rename workaround** (for unsupported changes):

```sql
-- Goal: rename tool_type to cutting_type and add NOT NULL constraint

-- Step 1: create a new table with the desired schema
CREATE TABLE tools_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    diameter_inches REAL NOT NULL,
    cutting_type TEXT NOT NULL,   -- renamed from tool_type
    ...
);

-- Step 2: copy data from old table
INSERT INTO tools_new SELECT id, name, diameter_inches, tool_type, ... FROM tools;

-- Step 3: drop the old table
DROP TABLE tools;

-- Step 4: rename the new table
ALTER TABLE tools_new RENAME TO tools;
```

This is verbose but correct. All four steps must run in a transaction.

**For this lesson:** We will only use `ADD COLUMN` — the common case. The recreate-and-rename pattern is noted for completeness.

**You will see this again in:** Alembic (Block 5) handles the recreate-and-rename automatically when targeting SQLite — it detects what SQLite supports and generates the workaround SQL when needed.

---

## Step 3 — The `schema_version` Table

To track which migrations have been applied, we add a dedicated table:

```sql
CREATE TABLE IF NOT EXISTS schema_version (
    version     INTEGER NOT NULL,
    applied_at  TEXT    NOT NULL,
    description TEXT
);
```

Each migration inserts one row when it is applied. The current version is the maximum `version` value in the table:

```sql
SELECT MAX(version) FROM schema_version
-- → NULL (no migrations applied, fresh database)
-- → 1   (migration 0001 has been applied)
-- → 2   (migrations 0001 and 0002 have been applied)
```

---

## Step 4 — Red: Write the Tests

Create `tests/test_migrations.py`:

```python
import sqlite3
import pytest
from pathlib import Path
from tooldb.migrate import apply_migrations, get_current_version   # ← new: doesn't exist yet


MIGRATIONS_DIR = Path(__file__).parent.parent / "migrations"   # ../migrations/ relative to tests/


def make_fresh_db(tmp_path):
    """Return a connection to a fresh empty database with no schema."""
    db_path = tmp_path / "test.db"
    return sqlite3.connect(str(db_path))


def test_fresh_database_has_version_zero(tmp_path):
    conn = make_fresh_db(tmp_path)

    # apply_migrations creates schema_version if it doesn't exist
    apply_migrations(conn, MIGRATIONS_DIR)
    version = get_current_version(conn)

    assert isinstance(version, int)


def test_apply_migrations_creates_tools_table(tmp_path):
    conn = make_fresh_db(tmp_path)
    apply_migrations(conn, MIGRATIONS_DIR)

    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='tools'"
    )
    assert cursor.fetchone() is not None   # tools table was created by migration 0001


def test_apply_migrations_is_idempotent(tmp_path):
    conn = make_fresh_db(tmp_path)

    apply_migrations(conn, MIGRATIONS_DIR)
    version_after_first = get_current_version(conn)

    apply_migrations(conn, MIGRATIONS_DIR)   # run again
    version_after_second = get_current_version(conn)

    assert version_after_first == version_after_second   # version did not change on second run


def test_migration_adds_preferred_sfm_column(tmp_path):
    conn = make_fresh_db(tmp_path)
    apply_migrations(conn, MIGRATIONS_DIR)

    cursor = conn.execute("PRAGMA table_info(tools)")
    columns = {row[1] for row in cursor.fetchall()}   # row[1] is column name

    assert "preferred_sfm" in columns   # added by migration 0002
```

Run:

```
pytest tests/test_migrations.py -v
```

**You should see:** All 4 failing with `ModuleNotFoundError: No module named 'tooldb.migrate'`. Red.

---

## Step 5 — Create the Migration Files

Create the `migrations/` folder:

```
python-tooldb/
    migrations/
        0001_initial_schema.sql
        0002_add_preferred_sfm.sql
```

**`migrations/0001_initial_schema.sql`** — the initial schema (extracted from `schema.py`):

```sql
-- Migration 0001: initial schema
-- Creates all five tables for the tool database.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tools (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    name            TEXT     NOT NULL UNIQUE,
    diameter_inches REAL     NOT NULL,
    flutes          INTEGER,
    material        TEXT     NOT NULL,
    tool_type       TEXT     NOT NULL,
    notes           TEXT
);

CREATE TABLE IF NOT EXISTS holders (
    id                  INTEGER  PRIMARY KEY AUTOINCREMENT,
    name                TEXT     NOT NULL UNIQUE,
    taper               TEXT     NOT NULL,
    collet_size_inches  REAL     NOT NULL
);

CREATE TABLE IF NOT EXISTS assemblies (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    name            TEXT     NOT NULL UNIQUE,
    tool_id         INTEGER  NOT NULL REFERENCES tools(id),
    holder_id       INTEGER  NOT NULL REFERENCES holders(id),
    stickout_inches REAL     NOT NULL,
    notes           TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    name        TEXT     NOT NULL,
    part_number TEXT,
    created_at  TEXT     NOT NULL,
    source_file TEXT
);

CREATE TABLE IF NOT EXISTS job_assemblies (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT,
    job_id        INTEGER  NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    assembly_id   INTEGER  NOT NULL REFERENCES assemblies(id),
    tool_position INTEGER,
    added_at      TEXT     NOT NULL,
    UNIQUE (job_id, assembly_id)
);
```

**`migrations/0002_add_preferred_sfm.sql`** — add the new column:

```sql
-- Migration 0002: add preferred_sfm column to tools
-- Stores the machinist-preferred surface feet per minute for this tool.
-- Nullable: not every tool has a manually recorded SFM preference.

ALTER TABLE tools ADD COLUMN preferred_sfm REAL;
```

---

## Step 6 — Green: Create `tooldb/migrate.py`

Create `tooldb/migrate.py`:

```python
import sqlite3
from pathlib import Path
from datetime import datetime


def _ensure_version_table(conn: sqlite3.Connection) -> None:
    """Create the schema_version table if it doesn't exist."""
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_version (
            version     INTEGER NOT NULL,
            applied_at  TEXT    NOT NULL,
            description TEXT
        )
        """
    )
    conn.commit()


def get_current_version(conn: sqlite3.Connection) -> int:
    """Return the highest migration version that has been applied, or 0 if none."""
    _ensure_version_table(conn)
    result = conn.execute("SELECT MAX(version) FROM schema_version").fetchone()[0]
    return result if result is not None else 0   # NULL → 0 for a fresh database


def apply_migrations(conn: sqlite3.Connection, migrations_dir: Path) -> None:
    """Apply all pending migrations from migrations_dir in order.

    Migration files must be named NNNN_description.sql where NNNN is a
    zero-padded integer. Only files with a version number higher than the
    current version are applied.
    """
    _ensure_version_table(conn)

    current_version = get_current_version(conn)

    # Find all .sql files in the migrations directory, sorted by filename
    migration_files = sorted(migrations_dir.glob("*.sql"))
    # sorted() on Path objects sorts alphabetically — "0001_..." comes before "0002_..."
    # which is correct as long as migration numbers are zero-padded to the same length

    for migration_file in migration_files:
        # Extract the version number from the filename: "0002_add_sfm.sql" → 2
        version_str = migration_file.stem.split("_")[0]   # "0002" (stem is filename without .sql)
        version = int(version_str)

        if version <= current_version:
            continue   # already applied — skip

        print(f"Applying migration {migration_file.name}...")

        sql = migration_file.read_text(encoding="utf-8")

        # Apply the migration in a transaction: if it fails, the schema version is not incremented
        with conn:
            # executescript runs multiple SQL statements separated by semicolons
            # It also commits any pending transaction before running
            conn.executescript(sql)

            # Record that this migration was applied
            conn.execute(
                "INSERT INTO schema_version (version, applied_at, description) VALUES (?, ?, ?)",
                (version, datetime.now().isoformat(), migration_file.stem),
            )

        print(f"  Done. Schema version is now {version}.")

    final_version = get_current_version(conn)
    if final_version == current_version:
        print("No pending migrations.")
    else:
        print(f"Migrations complete. Schema version: {final_version}")
```

Run the tests:

```
pytest tests/test_migrations.py -v
```

**You should see:**

```
PASSED tests/test_migrations.py::test_fresh_database_has_version_zero
PASSED tests/test_migrations.py::test_apply_migrations_creates_tools_table
PASSED tests/test_migrations.py::test_apply_migrations_is_idempotent
PASSED tests/test_migrations.py::test_migration_adds_preferred_sfm_column
```

All green.

### SAVE AND TRY

```
pytest tests/ -v
```

**You should see:** All tests passing.

**Change something:** Delete `migrations/0002_add_preferred_sfm.sql` temporarily. Run `test_migration_adds_preferred_sfm_column`. The test fails — `preferred_sfm` column is not created. Restore the file. Run again — green.

---

## Step 7 — The `migrate.py` Entry Point

Add a `__main__` block to `tooldb/migrate.py` so it can be run directly:

```python
if __name__ == "__main__":
    import sys
    import os

    # Find the database and migrations directory relative to this file
    this_dir = Path(__file__).parent        # tooldb/
    project_dir = this_dir.parent           # python-tooldb/
    migrations_dir = project_dir / "migrations"
    db_path = project_dir / "tools.db"

    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA foreign_keys = ON")

    apply_migrations(conn, migrations_dir)

    conn.close()
```

Run it from the `python-tooldb` directory:

```powershell
python -m tooldb.migrate
```

**You should see:**

```
Applying migration 0001_initial_schema.sql...
  Done. Schema version is now 1.
Applying migration 0002_add_preferred_sfm.sql...
  Done. Schema version is now 2.
Migrations complete. Schema version: 2
```

Run again:

```powershell
python -m tooldb.migrate
```

**You should see:**

```
No pending migrations.
```

Idempotent.

---

## 🎯 Challenge: Migration 0003 — Add `created_at` to Tools

**You know:** `ALTER TABLE ADD COLUMN`, migration file naming, `apply_migrations`.

**Task:** Write migration `0003_add_tools_created_at.sql` that adds a `created_at TEXT` column to the `tools` table. The column should be nullable (existing rows do not have a creation timestamp — `NULL` is the correct value for "unknown"). Then write a test that applies migrations and verifies the column exists.

**Rules:**
1. The file must be named `0003_add_tools_created_at.sql`
2. The migration must be valid SQL — test it by running `python -m tooldb.migrate` on a fresh `tools.db`
3. The test must assert `"created_at"` is in the columns of the `tools` table after migration

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

**`migrations/0003_add_tools_created_at.sql`:**

```sql
-- Migration 0003: add created_at column to tools
-- Nullable: existing rows receive NULL (timestamp unknown at time of migration).
-- New rows should be inserted with the current datetime in ISO 8601 format.

ALTER TABLE tools ADD COLUMN created_at TEXT;
```

Test (add to `tests/test_migrations.py`):

```python
def test_migration_0003_adds_created_at(tmp_path):
    conn = make_fresh_db(tmp_path)
    apply_migrations(conn, MIGRATIONS_DIR)

    cursor = conn.execute("PRAGMA table_info(tools)")
    columns = {row[1] for row in cursor.fetchall()}

    assert "created_at" in columns   # added by migration 0003
```

**Key insight:** Each migration adds one change. `ADD COLUMN` is the simplest migration. The column is nullable because you cannot enforce `NOT NULL` on existing rows without providing a default (SQLite would reject the `ALTER TABLE` with a `NOT NULL` constraint unless a `DEFAULT` is also specified). `TEXT` stores ISO 8601 datetimes, consistent with the rest of the schema.

</details>

---

## Step 8 — Relationship to `create_schema`

**Important:** After this lesson, there are now two ways to create the database schema:

1. `tooldb/schema.py → create_schema(conn)` — used by all the tests written in lessons 11–17
2. `tooldb/migrate.py → apply_migrations(conn, migrations_dir)` — the production migration runner

These produce the same result for a fresh database. But they are different mechanisms.

**For the remainder of Block 2:** Tests will continue to use `create_schema` because it is fast (no file I/O). In Block 3, the tests will be migrated to use `apply_migrations` so that the test database matches the production database exactly.

**In production:** Never use `create_schema` directly. Always use `apply_migrations`. This is the only mechanism that handles both fresh installs and upgrades from older versions.

---

## Final Check

| Feature | How to verify |
|---|---|
| `get_current_version` returns 0 on fresh database | Run `test_fresh_database_has_version_zero` |
| Migration 0001 creates all tables | Run `test_apply_migrations_creates_tools_table` — tools table exists |
| `apply_migrations` is idempotent | Run `test_apply_migrations_is_idempotent` — version unchanged on second run |
| Migration 0002 adds `preferred_sfm` column | Run `test_migration_adds_preferred_sfm_column` — column in table |
| Running `migrate.py` twice shows "No pending migrations" | Run `python -m tooldb.migrate` twice — second run prints "No pending migrations." |
| All tests pass | `pytest tests/ -v` — all PASSED |

---

## Quick Check Answers

**1. You have 500 tools. You need to add a column. Why not drop and recreate?**

Dropping the table destroys all data in it. The `CREATE TABLE` recreates the structure, but the 500 tool rows are permanently gone. `ALTER TABLE ... ADD COLUMN` adds the column to the existing table, leaving all existing rows intact. Their value for the new column will be `NULL` (the SQLite default for columns without a declared `DEFAULT`). No data is lost. This is the only safe approach when a production database has existing data.

**2. What happens if you run the same migration script twice? What should happen instead?**

Without an idempotency check, running the same migration twice re-applies its changes. `ALTER TABLE tools ADD COLUMN preferred_sfm REAL` run twice would fail with "duplicate column name: preferred_sfm" — a SQL error that crashes the migration runner. With the version tracking table, the runner checks which migrations have already been applied and skips them. Running `apply_migrations` twice is safe — the second run finds that all migrations have been applied and exits cleanly without executing any SQL.

**3. One thing PostgreSQL's ALTER TABLE does that SQLite cannot:**

Several examples: PostgreSQL can `ALTER COLUMN type` to change a column's data type (e.g., change an INTEGER to BIGINT). SQLite has no such operation — the only workaround is the recreate-and-rename pattern. PostgreSQL can also `ADD CONSTRAINT` to add a foreign key to an existing column. SQLite cannot add constraints to existing columns at all — only to new columns added with `ADD COLUMN`. These limitations exist because SQLite's schema modification system is intentionally minimal to keep the database engine small.
