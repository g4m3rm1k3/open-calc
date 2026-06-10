# Python Tool Database — LAB 13 — Foreign Keys and Referential Integrity

**Prerequisites:** Lab 12. You have `tooldb/queries.py` with `insert_tool` and three SELECT functions. You have `tooldb/schema.py` with all five tables including `holders` and `assemblies`. All tests in `test_queries.py` pass.

**What this lab adds:**
- `FOREIGN KEY` / `REFERENCES` — what referential integrity means and how the database enforces it
- `ON DELETE CASCADE` vs `RESTRICT` — the two deletion behaviors and when each is appropriate
- Why `PRAGMA foreign_keys = ON` is required every time you open a SQLite connection
- Normalization in plain language: why splitting data into tables eliminates update anomalies
- `insert_holder`, `insert_assembly` in `queries.py`, with tests that prove FK enforcement works

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You insert an assembly with `tool_id = 999`. No tool with id 999 exists. What should happen? What actually happens in SQLite if you forget to enable foreign keys?
> 2. You have 50 assemblies that all reference holder id 3 ("CAT40-ER32"). You rename the holder to "CAT40-ER32-SHORT". How many UPDATE statements do you need? Why?
> 3. What is `ON DELETE CASCADE`? Give one example from this project where it is the right choice, and one where it would be dangerous.
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have:

```
tooldb/
    queries.py      ← adds insert_holder, insert_assembly
tests/
    test_fk.py      ← NEW: 5 tests verifying FK enforcement and cascade behavior
```

Running `pytest tests/test_fk.py -v` will show:

```
PASSED tests/test_fk.py::test_insert_holder_returns_id
PASSED tests/test_fk.py::test_insert_assembly_references_existing_tool_and_holder
PASSED tests/test_fk.py::test_assembly_rejects_nonexistent_tool_id
PASSED tests/test_fk.py::test_assembly_rejects_nonexistent_holder_id
PASSED tests/test_fk.py::test_cannot_delete_tool_used_in_assembly
```

---

## Step 1 — The Problem Foreign Keys Solve

Look at the `assemblies` table from `schema.py`:

```sql
CREATE TABLE IF NOT EXISTS assemblies (
    id              INTEGER  PRIMARY KEY AUTOINCREMENT,
    name            TEXT     NOT NULL UNIQUE,
    tool_id         INTEGER  NOT NULL REFERENCES tools(id),   -- ← references tools
    holder_id       INTEGER  NOT NULL REFERENCES holders(id), -- ← references holders
    stickout_inches REAL     NOT NULL,
    notes           TEXT
)
```

`tool_id` and `holder_id` are integers. Without `REFERENCES`, these are just numbers — no different from storing a tool's weight. Any integer would be accepted:

```sql
-- Without REFERENCES, this succeeds even though tool 999 does not exist:
INSERT INTO assemblies (name, tool_id, holder_id, stickout_inches)
VALUES ('mystery assembly', 999, 999, 1.5)
```

The result is an **orphaned record** — an assembly that references a tool and holder that do not exist. When you later try to look up the tool for this assembly, you get nothing. The data model has silently broken.

Foreign keys are the database-level mechanism that prevents this:

```sql
-- With REFERENCES enforced:
INSERT INTO assemblies (name, tool_id, holder_id, stickout_inches)
VALUES ('mystery assembly', 999, 999, 1.5)
-- → IntegrityError: FOREIGN KEY constraint failed
```

The insert fails with a clear error. The orphan never enters the database.

---

### Concept: `FOREIGN KEY` / `REFERENCES` — Referential Integrity

**What it is:** A `REFERENCES` declaration on a column that tells the database: "the value in this column must exist as a primary key in the named table." The database enforces this on every insert and update.

**The term "referential integrity":** The guarantee that every reference in the database points to something real. An integer in `tool_id` is meaningful only if a row with that id exists in `tools`. Referential integrity is the property that this guarantee always holds.

**Syntax:**

```sql
-- Short form (column-level):
column_name  INTEGER  REFERENCES other_table(other_column)

-- Long form (table-level — required for composite foreign keys):
FOREIGN KEY (col1, col2) REFERENCES other_table(col1, col2)
```

**What it hides:** The check that would otherwise be written in application code: "before inserting this assembly, verify that `tool_id` exists in `tools`." Without the constraint, this check must appear in every code path that creates an assembly — and it must be re-verified if data is ever inserted directly by a migration script or database tool. With `REFERENCES`, the check is in the database itself and fires on every write, regardless of source.

**The invariant it protects:** Every `tool_id` value in `assemblies` is guaranteed to have a corresponding row in `tools`. This invariant cannot be violated through any INSERT or UPDATE — the engine rejects the write if it would break the invariant.

**Canonical example (General Explanation):**

A bank's account table and transaction table. Every transaction references an account by `account_id`. Without a foreign key constraint, a bug could create transactions that reference `account_id = 99999`, which does not exist. These are ghost transactions — they affect no real account balance. Referential integrity prevents this: `account_id` in `transactions` must exist in `accounts`, or the transaction is rejected.

```sql
CREATE TABLE accounts (
    id      INTEGER PRIMARY KEY,
    balance REAL    NOT NULL
);

CREATE TABLE transactions (
    id         INTEGER PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id),  -- enforced
    amount     REAL    NOT NULL
);

INSERT INTO transactions (account_id, amount) VALUES (99999, 100.00);
-- → IntegrityError: FOREIGN KEY constraint failed
-- The transaction cannot reference an account that does not exist.
```

**Project Application:** `assemblies` references both `tools(id)` and `holders(id)`. Before this lesson's code runs, you can insert an assembly with `tool_id = 999` and the database will store it — because the schema exists but the `PRAGMA foreign_keys = ON` statement has not been run yet in the connection. This lesson demonstrates exactly what happens in both cases, and adds tests that verify FK enforcement works.

**Smallest possible example:**

```python
import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("PRAGMA foreign_keys = ON")   # required — see Step 2
conn.execute("CREATE TABLE parent (id INTEGER PRIMARY KEY)")
conn.execute("CREATE TABLE child (id INTEGER PRIMARY KEY, parent_id INTEGER REFERENCES parent(id))")

conn.execute("INSERT INTO parent VALUES (1)")
conn.execute("INSERT INTO child VALUES (10, 1)")    # ok — parent 1 exists

conn.execute("INSERT INTO child VALUES (11, 999)")  # → IntegrityError: FOREIGN KEY constraint failed
```

**You will see this again in:** Every relational database. PostgreSQL, MySQL, SQL Server all enforce foreign keys by default (unlike SQLite's opt-in approach). SQLAlchemy (Block 5) generates `FOREIGN KEY` constraints from Python relationship declarations. "What is referential integrity?" and "what is a foreign key?" are standard database interview questions.

**Career signal:** Foreign keys and referential integrity are asked in almost every backend interview. Understanding them — not just the syntax, but the invariant they protect — signals that you think about data consistency, not just "make the insert work."

**Watch for:** **SQLite does not enforce foreign keys by default.** Without `PRAGMA foreign_keys = ON`, `REFERENCES` declarations exist in the schema definition but are never checked. Invalid inserts succeed silently. This is SQLite's backward-compatibility concession to existing databases that were built without FK enforcement. You must run this pragma every time you open a connection — it does not persist across connections.

---

## Step 2 — `PRAGMA foreign_keys = ON` — The Required Incantation

**What a PRAGMA is:** A SQLite-specific statement that configures the database engine's behavior for the current connection. PRAGMAs are not standard SQL — they are SQLite extensions.

```sql
PRAGMA foreign_keys = ON;   -- enable FK enforcement for this connection
PRAGMA foreign_keys;         -- query the current setting (returns 0 or 1)
```

**Why it is off by default:** SQLite was designed to be embedded in applications where strict enforcement would break legacy databases that never set up foreign keys correctly. The "off by default" behavior lets old databases keep working. For new databases written with proper FK declarations, you always turn it on.

**The consequence of forgetting it:**

```python
# Without PRAGMA:
conn = sqlite3.connect("tools.db")
# conn.execute("PRAGMA foreign_keys = ON")  ← forgot

conn.execute(
    "INSERT INTO assemblies (name, tool_id, holder_id, stickout_inches) "
    "VALUES ('bad assembly', 999, 999, 1.5)"
)
conn.commit()
# No error. assembly.tool_id = 999 is stored even though no tool with id 999 exists.
# The orphan is permanently in the database.
```

**`create_schema` already does this.** From `tooldb/schema.py` (written in lesson-11):

```python
def create_schema(conn: sqlite3.Connection) -> None:
    conn.execute("PRAGMA foreign_keys = ON")   # ← here
    for table_sql in ALL_TABLES:
        conn.execute(table_sql)
    conn.commit()
```

But `create_schema` is only called once — when creating the database file for the first time. Every subsequent connection to the database must also run this pragma. In this project, we will add it to a `connect_db` helper function in Block 3 (the adapter layer). For now, we add it to every function in `queries.py` that writes to the database.

---

## Step 3 — `ON DELETE`: What Happens When the Referenced Row is Deleted

When you delete a holder that is referenced by assemblies, the database must decide what to do with the assemblies. There are four options:

| Option | SQL | What it does |
|--------|-----|-------------|
| `RESTRICT` | `REFERENCES holders(id)` (default) | Rejects the delete — the holder cannot be deleted while assemblies reference it |
| `CASCADE` | `ON DELETE CASCADE` | Deletes all assemblies that reference the holder |
| `SET NULL` | `ON DELETE SET NULL` | Sets `holder_id` to NULL in all referencing assemblies |
| `NO ACTION` | `ON DELETE NO ACTION` | Defers the check — similar to RESTRICT but timing differs |

---

### Concept: `ON DELETE CASCADE` vs `ON DELETE RESTRICT`

**What they are:** Policies that control what happens to child rows when a parent row is deleted.

**`ON DELETE RESTRICT` (the default):** The database rejects the delete. You cannot delete a tool while assemblies reference it — the assemblies must be updated or deleted first.

```sql
-- assemblies.tool_id has no ON DELETE modifier (default = RESTRICT)
DELETE FROM tools WHERE id = 1;
-- → IntegrityError: FOREIGN KEY constraint failed
-- Tool 1 cannot be deleted — it is referenced by at least one assembly
```

**`ON DELETE CASCADE`:** The database automatically deletes child rows when the parent is deleted.

```sql
-- job_assemblies.job_id has ON DELETE CASCADE
DELETE FROM jobs WHERE id = 5;
-- → job 5 is deleted AND all job_assemblies rows where job_id = 5 are deleted
-- The assemblies themselves are not deleted — only the links between job 5 and its assemblies
```

**The design decision in this project:**

- `assemblies.tool_id REFERENCES tools(id)` — no CASCADE. **Why:** Deleting a tool should be blocked if it is in use. An assembly is a real-world setup that may still be physically in the machine. Silently deleting it would destroy shop floor data.
- `assemblies.holder_id REFERENCES holders(id)` — no CASCADE. **Same reason.**
- `job_assemblies.job_id REFERENCES jobs(id) ON DELETE CASCADE` — CASCADE. **Why:** A job is the "owner" of its assembly links. When a job is deleted, its list of "which assemblies were used" is no longer meaningful. But the assemblies themselves (which are reusable setups) should survive — other jobs may reference them.

**Canonical example (General Explanation):**

A school database. `students` table, `enrollments` table (student_id, course_id). `ON DELETE CASCADE` on `student_id` in `enrollments` means: if a student is expelled (deleted), all their course enrollments are automatically deleted too. `ON DELETE RESTRICT` on `course_id` means: a course cannot be deleted while students are enrolled in it.

**You will see this again in:** Every relational database design involving related tables. SQLAlchemy: `cascade="all, delete-orphan"` on a relationship. PostgreSQL: same `ON DELETE CASCADE` syntax. This design decision appears in every interview involving database schema design.

**Watch for:** `ON DELETE CASCADE` is powerful and can delete data you did not intend to delete. The rule of thumb: only use CASCADE when the child row has no independent meaning apart from the parent row. A `job_assembly` link has no meaning without the job; an assembly has meaning independently. CASCADE on `job_id`, not on `assembly_id`.

---

## Step 4 — Normalization: Why We Split Tables

Before writing code, understand why the schema has separate `tools` and `holders` tables instead of putting everything in one table.

**The update anomaly:**

Imagine storing the holder name inside every assembly record:

```
assemblies table (denormalized):
id | name              | holder_name  | holder_taper | stickout_inches
1  | "EM-0500 setup"   | CAT40-ER32   | CAT40        | 1.5
2  | "DR-0250 setup"   | CAT40-ER32   | CAT40        | 2.0
3  | "EM-0750 setup"   | CAT40-ER32   | CAT40        | 1.75
```

Now the shop orders a shorter version of the same holder and renames it from `"CAT40-ER32"` to `"CAT40-ER32-SHORT"`. You must update every assembly row that references it — 3 here, but potentially 200 in a real shop database. Miss one and the data is inconsistent: two assemblies claim to use `"CAT40-ER32-SHORT"` and one still says `"CAT40-ER32"`, which is now the wrong name for the same physical tool.

**The normalized approach:**

```
holders table:                   assemblies table:
id | name           | taper      id | holder_id | stickout_inches
1  | CAT40-ER32     | CAT40      1  | 1         | 1.5
                                 2  | 1         | 2.0
                                 3  | 1         | 1.75
```

Rename the holder once — `UPDATE holders SET name = 'CAT40-ER32-SHORT' WHERE id = 1`. All three assemblies automatically reflect the new name because they store `holder_id = 1`, not the name string. One update, zero inconsistency.

---

### Concept: Database Normalization (First, Second, Third Normal Form)

**What it is:** A set of rules for structuring tables that eliminate redundancy and update anomalies. Named "normal forms" because they are a sequence of increasingly strict rules.

**First Normal Form (1NF):** Each column holds exactly one atomic value. No repeating groups, no lists in a cell.

```
VIOLATION: tools.materials = "carbide, HSS, cobalt"  (list in one cell)
CORRECT: each tool has exactly one material value
```

**Second Normal Form (2NF):** All non-key columns depend on the entire primary key, not just part of it. (Only relevant for composite primary keys.)

```
In job_assemblies, if the PK is (job_id, assembly_id):
VIOLATION: assembly.stickout_inches in job_assemblies — stickout depends only on assembly, not the job
CORRECT: stickout is in the assemblies table, not job_assemblies
```

**Third Normal Form (3NF):** No non-key column depends on another non-key column (transitive dependency).

```
VIOLATION: storing holder_taper inside assemblies (taper depends on holder, not assembly)
CORRECT: taper lives in holders table; assemblies only stores holder_id
```

**In plain language:** Each fact belongs in exactly one table. If you can derive a value from another table by joining, don't store it redundantly. Store the ID; look up the details when you need them.

**The tool database satisfies 3NF:**
- Tool details (diameter, material) live in `tools`, not copied into `assemblies`
- Holder details (taper, collet size) live in `holders`, not copied into `assemblies`
- An assembly stores only `tool_id`, `holder_id`, and `stickout_inches` (which is truly a property of the specific setup, not of the tool or holder alone)

**You will see this again in:** Every database design interview. "Normalize this schema" is a standard question. Understanding 1NF/2NF/3NF tells you *why* the schema is structured as it is — not just what structure to use.

**Watch for:** Over-normalization. Sometimes redundancy is intentional — an "order snapshot" that stores the product price at order time rather than looking it up from the current product table. If the holder's collet size changes, assemblies should reflect the size at the time they were created. In this project, we assume holders are stable — if this assumption changes, a snapshot column becomes the right design.

---

## Step 5 — Red: Write the FK Tests

Create `tests/test_fk.py`:

```python
import sqlite3
import pytest
from tooldb.schema import create_schema
from tooldb.queries import insert_tool, insert_holder, insert_assembly   # insert_holder and insert_assembly don't exist yet


def make_db(tmp_path):
    """Open a fresh test database with schema applied."""
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)            # creates tables AND runs PRAGMA foreign_keys = ON
    return conn


def test_insert_holder_returns_id(tmp_path):
    conn = make_db(tmp_path)

    holder_id = insert_holder(
        conn,
        name="CAT40-ER32",
        taper="CAT40",
        collet_size_inches=0.787,   # 20mm ER32 collet maximum
    )

    assert holder_id == 1           # AUTOINCREMENT starts at 1
    row = conn.execute("SELECT name FROM holders WHERE id = ?", (holder_id,)).fetchone()
    assert row[0] == "CAT40-ER32"


def test_insert_assembly_references_existing_tool_and_holder(tmp_path):
    conn = make_db(tmp_path)

    tool_id = insert_tool(conn, name="EM-0500", diameter_inches=0.5,
                          material="carbide", tool_type="endmill", flutes=4)
    holder_id = insert_holder(conn, name="CAT40-ER32", taper="CAT40", collet_size_inches=0.787)

    assembly_id = insert_assembly(
        conn,
        name='EM-0500 in CAT40-ER32 1.5"',
        tool_id=tool_id,
        holder_id=holder_id,
        stickout_inches=1.5,
    )

    assert assembly_id == 1
    row = conn.execute("SELECT name, tool_id, holder_id FROM assemblies WHERE id = ?",
                       (assembly_id,)).fetchone()
    assert row[0] == 'EM-0500 in CAT40-ER32 1.5"'
    assert row[1] == tool_id
    assert row[2] == holder_id


def test_assembly_rejects_nonexistent_tool_id(tmp_path):
    conn = make_db(tmp_path)

    holder_id = insert_holder(conn, name="CAT40-ER32", taper="CAT40", collet_size_inches=0.787)

    with pytest.raises(sqlite3.IntegrityError):
        insert_assembly(
            conn,
            name="bad assembly",
            tool_id=999,            # no tool with id 999 exists
            holder_id=holder_id,
            stickout_inches=1.5,
        )


def test_assembly_rejects_nonexistent_holder_id(tmp_path):
    conn = make_db(tmp_path)

    tool_id = insert_tool(conn, name="EM-0500", diameter_inches=0.5,
                          material="carbide", tool_type="endmill")

    with pytest.raises(sqlite3.IntegrityError):
        insert_assembly(
            conn,
            name="bad assembly",
            tool_id=tool_id,
            holder_id=999,          # no holder with id 999 exists
            stickout_inches=1.5,
        )


def test_cannot_delete_tool_used_in_assembly(tmp_path):
    conn = make_db(tmp_path)

    tool_id = insert_tool(conn, name="EM-0500", diameter_inches=0.5,
                          material="carbide", tool_type="endmill")
    holder_id = insert_holder(conn, name="CAT40-ER32", taper="CAT40", collet_size_inches=0.787)
    insert_assembly(conn, name='EM-0500 setup', tool_id=tool_id,
                    holder_id=holder_id, stickout_inches=1.5)

    with pytest.raises(sqlite3.IntegrityError):
        conn.execute("DELETE FROM tools WHERE id = ?", (tool_id,))
        conn.commit()   # commit triggers FK check for DELETE
    # The tool is still in the database — the delete was rejected
    row = conn.execute("SELECT id FROM tools WHERE id = ?", (tool_id,)).fetchone()
    assert row is not None
```

Run:

```
pytest tests/test_fk.py -v
```

**You should see:** All 5 tests fail with `ImportError: cannot import name 'insert_holder' from 'tooldb.queries'`.

Red.

---

## Step 6 — Green: Add `insert_holder` and `insert_assembly`

Add to `tooldb/queries.py`:

```python
def insert_holder(
    conn: sqlite3.Connection,
    name: str,
    taper: str,
    collet_size_inches: float,
) -> int:
    """Insert a holder and return its auto-assigned id."""
    conn.execute("PRAGMA foreign_keys = ON")   # required every connection
    cursor = conn.execute(
        """
        INSERT INTO holders (name, taper, collet_size_inches)
        VALUES (?, ?, ?)
        """,
        (name, taper, collet_size_inches),
    )
    conn.commit()
    return cursor.lastrowid
```

Run the first test:

```
pytest tests/test_fk.py::test_insert_holder_returns_id -v
```

**You should see:** `PASSED`. Now add `insert_assembly`:

```python
def insert_assembly(
    conn: sqlite3.Connection,
    name: str,
    tool_id: int,
    holder_id: int,
    stickout_inches: float,
    notes: str = None,
) -> int:
    """Insert an assembly linking a tool and holder, and return its id.

    Raises sqlite3.IntegrityError if tool_id or holder_id does not exist.
    """
    conn.execute("PRAGMA foreign_keys = ON")   # required — enables FK enforcement
    cursor = conn.execute(
        """
        INSERT INTO assemblies (name, tool_id, holder_id, stickout_inches, notes)
        VALUES (?, ?, ?, ?, ?)
        """,
        (name, tool_id, holder_id, stickout_inches, notes),
        # tool_id and holder_id are checked against tools(id) and holders(id)
        # if either does not exist, sqlite3.IntegrityError is raised
    )
    conn.commit()
    return cursor.lastrowid
```

Run all FK tests:

```
pytest tests/test_fk.py -v
```

**You should see:**

```
PASSED tests/test_fk.py::test_insert_holder_returns_id
PASSED tests/test_fk.py::test_insert_assembly_references_existing_tool_and_holder
PASSED tests/test_fk.py::test_assembly_rejects_nonexistent_tool_id
PASSED tests/test_fk.py::test_assembly_rejects_nonexistent_holder_id
PASSED tests/test_fk.py::test_cannot_delete_tool_used_in_assembly
```

All green.

---

### SAVE AND TRY

```
pytest tests/ -v
```

**You should see:** All tests across all test files passing.

**Change something:** Comment out the `conn.execute("PRAGMA foreign_keys = ON")` line inside `insert_assembly`. Run `test_assembly_rejects_nonexistent_tool_id`. The test FAILS — the insert succeeds when it should fail. The FK constraint is defined in the schema but not enforced without the pragma. Uncomment the line and run again — green. This is the most important experiment in this lesson.

---

### Refactor: The PRAGMA Pattern

Notice that every write function now has:

```python
conn.execute("PRAGMA foreign_keys = ON")
```

at the top. This is necessary but repetitive. There are two ways to avoid it:

**Option A — Run the pragma once when the connection is opened:**

```python
def open_database(path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(path)
    conn.execute("PRAGMA foreign_keys = ON")   # once, at connection open
    return conn
```

All functions receive a connection that already has FK enforcement on. No need to repeat the pragma inside each function.

**Option B — Keep the pragma in each write function (current approach):**

Safer for testing — each function is self-contained and does not depend on the connection being set up correctly before it was passed in. The downside: the pragma line appears in every write function.

**We will use Option A** in Block 3 when we build the `DatabaseAdapter`. For now, keep the pragma in each write function. The tests demonstrate that it is necessary.

---

## 🎯 Challenge: `find_assemblies_for_tool`

**You know:** SELECT with WHERE, REFERENCES, `conn.row_factory = sqlite3.Row`.

**Task:** Add `find_assemblies_for_tool(conn, tool_id)` to `queries.py` that returns all assemblies whose `tool_id` matches the given value. Then write a test that inserts one tool, two assemblies using that tool, and verifies the count.

**Starting code (add to `queries.py`):**

```python
def find_assemblies_for_tool(conn: sqlite3.Connection, tool_id: int) -> list:
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    rows = conn.execute(
        """
        SELECT ???
        FROM assemblies
        WHERE ???
        """,
        ???,
    ).fetchall()
    return list(rows)
```

**Test to add to `tests/test_fk.py`:**

```python
from tooldb.queries import find_assemblies_for_tool   # add to import

def test_find_assemblies_for_tool(tmp_path):
    conn = make_db(tmp_path)
    tool_id = insert_tool(conn, name="EM-0500", diameter_inches=0.5,
                          material="carbide", tool_type="endmill")
    holder_id = insert_holder(conn, name="CAT40-ER32", taper="CAT40", collet_size_inches=0.787)

    insert_assembly(conn, name='setup-A', tool_id=tool_id, holder_id=holder_id, stickout_inches=1.5)
    insert_assembly(conn, name='setup-B', tool_id=tool_id, holder_id=holder_id, stickout_inches=2.0)

    results = find_assemblies_for_tool(conn, tool_id)
    assert len(results) == 2
    for row in results:
        assert row["tool_id"] == tool_id
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def find_assemblies_for_tool(conn: sqlite3.Connection, tool_id: int) -> list:
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    rows = conn.execute(
        """
        SELECT id, name, tool_id, holder_id, stickout_inches
        FROM assemblies
        WHERE tool_id = ?
        ORDER BY name
        """,
        (tool_id,),   # single-element tuple — trailing comma required
    ).fetchall()
    return list(rows)
```

**Key insight:** A foreign key column is just an integer column with an enforcement rule. You query it exactly like any other column — `WHERE tool_id = ?`. The FK constraint only activates on writes (INSERT/UPDATE/DELETE), not on reads. A SELECT on `tool_id` is a plain integer comparison.

</details>

---

## Step 7 — What ON DELETE CASCADE Looks Like in Practice

The `job_assemblies` table uses `ON DELETE CASCADE` on `job_id`:

```sql
CREATE TABLE IF NOT EXISTS job_assemblies (
    ...
    job_id      INTEGER  NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    assembly_id INTEGER  NOT NULL REFERENCES assemblies(id)
    ...
)
```

Verify this behavior with a direct SQL test. Add this test to `tests/test_fk.py`:

```python
def test_cascade_deletes_job_assemblies_when_job_deleted(tmp_path):
    conn = make_db(tmp_path)

    # Insert a job
    from datetime import datetime
    created_at = datetime.now().isoformat()   # ISO 8601: "2024-01-15T09:30:00.123456"
    cursor = conn.execute(
        "INSERT INTO jobs (name, created_at) VALUES (?, ?)",
        ("Job-001", created_at),
    )
    job_id = cursor.lastrowid
    conn.commit()

    # Insert an assembly (needs a tool and holder first)
    tool_id = insert_tool(conn, name="EM-0500", diameter_inches=0.5,
                          material="carbide", tool_type="endmill")
    holder_id = insert_holder(conn, name="CAT40-ER32", taper="CAT40", collet_size_inches=0.787)
    assembly_id = insert_assembly(conn, name="EM-0500 setup", tool_id=tool_id,
                                  holder_id=holder_id, stickout_inches=1.5)

    # Link the assembly to the job
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute(
        "INSERT INTO job_assemblies (job_id, assembly_id, added_at) VALUES (?, ?, ?)",
        (job_id, assembly_id, created_at),
    )
    conn.commit()

    # Verify the link exists
    link_count = conn.execute(
        "SELECT COUNT(*) FROM job_assemblies WHERE job_id = ?", (job_id,)
    ).fetchone()[0]
    assert link_count == 1

    # Delete the job — CASCADE should remove the job_assemblies link
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
    conn.commit()

    # The job_assemblies link is gone
    link_count_after = conn.execute(
        "SELECT COUNT(*) FROM job_assemblies WHERE job_id = ?", (job_id,)
    ).fetchone()[0]
    assert link_count_after == 0   # CASCADE deleted the link

    # But the assembly still exists — it was not deleted, only the link was
    assembly_row = conn.execute(
        "SELECT id FROM assemblies WHERE id = ?", (assembly_id,)
    ).fetchone()
    assert assembly_row is not None   # assembly survives — only the link was deleted
```

Run:

```
pytest tests/test_fk.py -v
```

**You should see:** All 7 tests passing (the 5 from before plus the new cascade test, plus the challenge test if you added it).

### SAVE AND TRY

```
pytest tests/ -v
```

**Change something:** In the cascade test, temporarily change `ON DELETE CASCADE` to `ON DELETE RESTRICT` in `JOB_ASSEMBLIES_TABLE_SQL` in `schema.py`. Run the test — it fails because the delete is now rejected. Change it back and run again.

---

## Final Check

| Feature | How to verify |
|---|---|
| `insert_holder` inserts and returns id | Run `test_insert_holder_returns_id` — id is 1, name matches |
| `insert_assembly` with valid IDs succeeds | Run `test_insert_assembly_references_existing_tool_and_holder` |
| FK rejects invalid `tool_id` | Run `test_assembly_rejects_nonexistent_tool_id` — `IntegrityError` raised |
| FK rejects invalid `holder_id` | Run `test_assembly_rejects_nonexistent_holder_id` — `IntegrityError` raised |
| Delete blocked when tool is in use | Run `test_cannot_delete_tool_used_in_assembly` — delete fails |
| `PRAGMA foreign_keys = ON` is required | Comment out the pragma in `insert_assembly`, run FK test — insert silently succeeds (then restore) |
| ON DELETE CASCADE removes job_assemblies | Run cascade test — link gone, assembly survives |
| All tests pass | `pytest tests/ -v` — all PASSED |

---

## Quick Check Answers

**1. You insert `tool_id = 999`. What should happen? What happens if you forget PRAGMA?**

The insert should raise an `IntegrityError` because no row with `id = 999` exists in the `tools` table — the referential integrity constraint is violated. What actually happens in SQLite if you forget `PRAGMA foreign_keys = ON`: the insert succeeds silently. SQLite defines `REFERENCES` constraints in the schema but does not enforce them unless explicitly enabled per connection. The orphaned assembly row is now permanently in the database, and any query that tries to look up its tool will return nothing.

**2. You rename a holder. How many UPDATE statements do you need?**

One. `UPDATE holders SET name = 'CAT40-ER32-SHORT' WHERE id = 3`. All 50 assemblies that reference holder id 3 automatically reflect the new name — they store `holder_id = 3`, not the name string. This is the normalization payoff: one fact lives in one place. In a denormalized design where the holder name is stored directly in each assembly, you would need 50 UPDATE statements, and missing any one creates an inconsistency with no mechanism to detect it.

**3. What is `ON DELETE CASCADE`? Give one right and one wrong use from this project.**

`ON DELETE CASCADE` means: when a parent row is deleted, automatically delete all child rows that reference it. Right use in this project: `job_assemblies.job_id ON DELETE CASCADE`. When a job is deleted, its assembly links (which job used which assemblies, in what positions) have no independent meaning — they only exist as part of the job. Deleting them automatically makes sense. Wrong use would be: `assemblies.tool_id ON DELETE CASCADE`. Deleting a tool should never automatically delete all assemblies that use it — those assemblies represent real-world setups that may still be physically set up on a machine. The correct behavior is RESTRICT: block the delete and force the user to explicitly decide what to do with the assemblies first.
