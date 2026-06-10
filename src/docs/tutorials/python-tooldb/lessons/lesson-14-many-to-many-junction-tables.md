# Python Tool Database — LAB 14 — Many-to-Many Relationships and Junction Tables

**Prerequisites:** Lab 13. You have `insert_tool`, `insert_holder`, `insert_assembly` in `queries.py`, with FK enforcement tested and passing. You understand one-to-many relationships and referential integrity.

**What this lab adds:**
- The many-to-many relationship pattern and why it requires a junction table
- `job_assemblies` — inserting, removing, and querying through the junction table
- `add_assembly_to_job`, `remove_assembly_from_job`, `list_assemblies_for_job` in `queries.py`
- Extra data on the junction row (`tool_position`, `added_at`)
- The principle that relationships are first-class data — they can be created and deleted independently of the entities they connect

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A job uses 8 assemblies. An assembly can be used in many jobs. Why can't you store this with a single `job_id` column in `assemblies`?
> 2. You delete a row from `job_assemblies`. What happens to the job? What happens to the assembly?
> 3. `tool_position` in `job_assemblies` stores values like `1`, `2`, `3`. Why is this stored on the junction table rather than on the assembly itself?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have:

```
tooldb/
    queries.py   ← adds: add_assembly_to_job, remove_assembly_from_job,
                          list_assemblies_for_job, insert_job
tests/
    test_junction.py  ← NEW: 6 tests verifying many-to-many behavior
```

Running `pytest tests/test_junction.py -v` will show:

```
PASSED tests/test_junction.py::test_insert_job_returns_id
PASSED tests/test_junction.py::test_add_assembly_to_job
PASSED tests/test_junction.py::test_list_assemblies_for_job_returns_correct_count
PASSED tests/test_junction.py::test_assembly_appears_in_multiple_jobs
PASSED tests/test_junction.py::test_remove_assembly_from_job_removes_only_link
PASSED tests/test_junction.py::test_add_same_assembly_twice_to_same_job_fails
```

---

## Step 1 — Why Many-to-Many Cannot Use a Single Column

One-to-many is straightforward. A tool appears in many assemblies. Each assembly has exactly one tool. You store `tool_id` on the assembly row — one column holds the reference.

```
tools:           assemblies:
id | name        id | name         | tool_id  (← one column, one reference)
1  | EM-0500     1  | setup A      | 1
2  | DR-0250     2  | setup B      | 1        (same tool in two assemblies)
                 3  | setup C      | 2
```

Now consider jobs and assemblies. One job uses many assemblies. One assembly can be used in many jobs. This is many-to-many.

**Attempt 1: Store job_id on assemblies:**

```
assemblies:
id | name    | tool_id | job_id
1  | setup A | 1       | 5      ← locked to job 5 only
```

Problem: the assembly can only be in one job. If the same setup is used in jobs 5 AND 7, you must duplicate the row:

```
assemblies:
id | name    | tool_id | job_id
1  | setup A | 1       | 5
4  | setup A | 1       | 7   ← exact duplicate — what if the stickout changes?
```

Now you have two rows for the same physical setup. If the stickout changes, you must update both. Redundancy and update anomalies — the exact problems normalization was designed to prevent.

**Attempt 2: Store a list of job_ids on assemblies:**

```
assemblies:
id | name    | job_ids
1  | setup A | "5,7,12"   ← violates 1NF: multiple values in one cell
```

This violates First Normal Form. You cannot index inside a string, cannot enforce FK constraints on values in a string, and cannot delete a single job without string parsing. This approach breaks everything.

**The correct solution: a junction table that makes the relationship itself a row.**

---

### Concept: The Junction Table — Making Relationships First-Class Data

**What it is:** A table whose rows represent the *relationship* between two other entities, rather than the entities themselves. Each row in the junction table records one pairing.

**What it hides:** The decision of where to store many-to-many relationship data. Without a junction table, you either duplicate entity rows or put multiple values in a single column — both break normalization. The junction table hides this impossible choice by giving the relationship its own home. The invariant it protects: each entity row represents exactly one entity, and the junction table exclusively owns the association between entities. Changing a relationship never changes the entity rows.

**The pattern:**

```
entities A (jobs):           junction (job_assemblies):    entities B (assemblies):
id | name                    id | job_id | assembly_id     id | name
5  | Part-001-Rev2           1  | 5      | 1               1  | setup A
7  | Part-002-Rev1           2  | 5      | 3               3  | setup C
                             3  | 7      | 1
```

Reading the junction:
- Job 5 uses assemblies 1 and 3
- Job 7 uses assembly 1
- Assembly 1 appears in both job 5 and job 7 — **the junction table is the only place this many-to-many relationship is recorded**

**Adding a relationship:** Insert a row into `job_assemblies`.
**Removing a relationship:** Delete that row. The job and assembly are untouched.
**Deleting a job:** The `ON DELETE CASCADE` on `job_id` removes all its junction rows. The assemblies survive.

**Extra columns on the junction:** The junction row can carry data that belongs to the *relationship*, not to either entity. `tool_position` (T01, T02...) belongs to the junction — it is the position this assembly occupies in *this specific job*, not a property of the assembly itself. The same setup might be T03 in one job and T07 in another.

**Canonical example (General Explanation):**

A movie database. Movies and actors. One movie has many actors; one actor appears in many movies. The junction table is `cast`:

```
movies:              cast:                          actors:
id | title           id | movie_id | actor_id       id | name
1  | "Inception"     1  | 1        | 101            101 | DiCaprio
2  | "Titanic"       2  | 1        | 102            102 | Hardy
                     3  | 2        | 101            (DiCaprio in both movies)
```

Extra data on the junction: `cast.character_name` — the character name DiCaprio plays belongs to the specific movie-actor pairing, not to the movie or the actor separately.

**Project Application:** `job_assemblies` is the junction between `jobs` and `assemblies`. Every time a machinist uses an assembly in a job, a row is inserted into `job_assemblies`. When the job ends and that setup is no longer needed for that job, the row is deleted — but the assembly itself persists, ready to be used in the next job.

**You will see this again in:** Every many-to-many relationship in any database. Users and roles (a user has many roles; a role is held by many users). Students and courses (a student enrolls in many courses; a course has many students). Tags and posts (a post has many tags; a tag appears on many posts). This pattern appears in essentially every non-trivial application schema. In SQLAlchemy (Block 5): `relationship(..., secondary=junction_table)`. In React query caches: the normalized state shape uses the same pattern.

**Career signal:** "Design a schema for users with multiple roles" is a common database design interview question. The correct answer — a junction table — is what distinguishes candidates who understand relational design from those who just know SQL syntax.

**Watch for:** A junction row should represent a unique pairing. Two rows with the same `(job_id, assembly_id)` would mean the same assembly is used twice in the same job in the same position. This is usually a bug. Add a `UNIQUE` constraint on `(job_id, assembly_id)` if each assembly can only appear once per job.

---

## Step 2 — The `job_assemblies` Schema Review

From `schema.py` (written in lesson-11):

```sql
CREATE TABLE IF NOT EXISTS job_assemblies (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT,
    job_id        INTEGER  NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    assembly_id   INTEGER  NOT NULL REFERENCES assemblies(id),
    tool_position INTEGER,           -- nullable: T01, T02... not always tracked
    added_at      TEXT     NOT NULL  -- ISO 8601 datetime when link was created
)
```

And the `jobs` table:

```sql
CREATE TABLE IF NOT EXISTS jobs (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    name        TEXT     NOT NULL,
    part_number TEXT,
    created_at  TEXT     NOT NULL,
    source_file TEXT
)
```

Both tables already exist. This lesson adds the Python functions that use them.

---

## Step 3 — Red: Write the Tests

Create `tests/test_junction.py`:

```python
import sqlite3
import pytest
from datetime import datetime
from tooldb.schema import create_schema
from tooldb.queries import (
    insert_tool,
    insert_holder,
    insert_assembly,
    insert_job,                  # ← new: doesn't exist yet
    add_assembly_to_job,         # ← new
    remove_assembly_from_job,    # ← new
    list_assemblies_for_job,     # ← new
)


def make_db(tmp_path):
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)
    return conn


def seed_assembly(conn, name="EM-0500 setup"):
    """Insert one complete assembly chain: tool → holder → assembly."""
    tool_id = insert_tool(conn, name=f"tool-{name}", diameter_inches=0.5,
                          material="carbide", tool_type="endmill")
    holder_id = insert_holder(conn, name=f"holder-{name}", taper="CAT40",
                               collet_size_inches=0.787)
    return insert_assembly(conn, name=name, tool_id=tool_id, holder_id=holder_id,
                           stickout_inches=1.5)


def test_insert_job_returns_id(tmp_path):
    conn = make_db(tmp_path)

    job_id = insert_job(conn, name="Part-001-Rev2", part_number="P001")
    assert job_id == 1


def test_add_assembly_to_job(tmp_path):
    conn = make_db(tmp_path)
    job_id = insert_job(conn, name="Part-001-Rev2")
    assembly_id = seed_assembly(conn)

    link_id = add_assembly_to_job(conn, job_id=job_id, assembly_id=assembly_id,
                                  tool_position=1)
    assert link_id is not None

    count = conn.execute(
        "SELECT COUNT(*) FROM job_assemblies WHERE job_id = ? AND assembly_id = ?",
        (job_id, assembly_id),
    ).fetchone()[0]
    assert count == 1


def test_list_assemblies_for_job_returns_correct_count(tmp_path):
    conn = make_db(tmp_path)
    job_id = insert_job(conn, name="Part-001-Rev2")

    a1 = seed_assembly(conn, "setup A")
    a2 = seed_assembly(conn, "setup B")
    a3 = seed_assembly(conn, "setup C")

    add_assembly_to_job(conn, job_id=job_id, assembly_id=a1, tool_position=1)
    add_assembly_to_job(conn, job_id=job_id, assembly_id=a2, tool_position=2)
    add_assembly_to_job(conn, job_id=job_id, assembly_id=a3, tool_position=3)

    results = list_assemblies_for_job(conn, job_id)
    assert len(results) == 3


def test_assembly_appears_in_multiple_jobs(tmp_path):
    conn = make_db(tmp_path)

    job1_id = insert_job(conn, name="Job-001")
    job2_id = insert_job(conn, name="Job-002")
    assembly_id = seed_assembly(conn, "shared setup")

    add_assembly_to_job(conn, job_id=job1_id, assembly_id=assembly_id, tool_position=1)
    add_assembly_to_job(conn, job_id=job2_id, assembly_id=assembly_id, tool_position=2)

    # The assembly appears in both jobs
    in_job1 = list_assemblies_for_job(conn, job1_id)
    in_job2 = list_assemblies_for_job(conn, job2_id)
    assert len(in_job1) == 1
    assert len(in_job2) == 1
    # Both reference the same assembly_id
    assert in_job1[0]["assembly_id"] == assembly_id
    assert in_job2[0]["assembly_id"] == assembly_id


def test_remove_assembly_from_job_removes_only_link(tmp_path):
    conn = make_db(tmp_path)
    job_id = insert_job(conn, name="Part-001-Rev2")
    assembly_id = seed_assembly(conn, "setup A")
    add_assembly_to_job(conn, job_id=job_id, assembly_id=assembly_id, tool_position=1)

    remove_assembly_from_job(conn, job_id=job_id, assembly_id=assembly_id)

    # The link is gone
    link_count = conn.execute(
        "SELECT COUNT(*) FROM job_assemblies WHERE job_id = ? AND assembly_id = ?",
        (job_id, assembly_id),
    ).fetchone()[0]
    assert link_count == 0

    # The assembly itself still exists
    assembly_row = conn.execute(
        "SELECT id FROM assemblies WHERE id = ?", (assembly_id,)
    ).fetchone()
    assert assembly_row is not None   # assembly was not deleted — only the link was


def test_add_same_assembly_twice_to_same_job_fails(tmp_path):
    conn = make_db(tmp_path)
    job_id = insert_job(conn, name="Part-001-Rev2")
    assembly_id = seed_assembly(conn)

    add_assembly_to_job(conn, job_id=job_id, assembly_id=assembly_id, tool_position=1)

    with pytest.raises(sqlite3.IntegrityError):
        add_assembly_to_job(conn, job_id=job_id, assembly_id=assembly_id, tool_position=1)
        # same (job_id, assembly_id) pair — should be rejected as a duplicate
```

Run:

```
pytest tests/test_junction.py -v
```

**You should see:** All 6 tests fail with `ImportError`. Red.

---

## Step 4 — Green: Add the Junction Functions

Add to `tooldb/queries.py`:

```python
from datetime import datetime   # ← add this import at the top of the file


def insert_job(
    conn: sqlite3.Connection,
    name: str,
    part_number: str = None,
    source_file: str = None,
) -> int:
    """Insert a job and return its id. created_at is auto-set to now."""
    conn.execute("PRAGMA foreign_keys = ON")
    created_at = datetime.now().isoformat()   # "2024-01-15T09:30:00.123456"
    cursor = conn.execute(
        """
        INSERT INTO jobs (name, part_number, created_at, source_file)
        VALUES (?, ?, ?, ?)
        """,
        (name, part_number, created_at, source_file),
    )
    conn.commit()
    return cursor.lastrowid
```

Run the first test:

```
pytest tests/test_junction.py::test_insert_job_returns_id -v
```

**You should see:** `PASSED`. Now add the junction functions:

```python
def add_assembly_to_job(
    conn: sqlite3.Connection,
    job_id: int,
    assembly_id: int,
    tool_position: int = None,
) -> int:
    """Link an assembly to a job. Returns the new job_assemblies row id.

    Raises sqlite3.IntegrityError if:
    - job_id or assembly_id does not exist (FK violation)
    - this (job_id, assembly_id) pair already exists (UNIQUE violation)
    """
    conn.execute("PRAGMA foreign_keys = ON")
    added_at = datetime.now().isoformat()
    cursor = conn.execute(
        """
        INSERT INTO job_assemblies (job_id, assembly_id, tool_position, added_at)
        VALUES (?, ?, ?, ?)
        """,
        (job_id, assembly_id, tool_position, added_at),
    )
    conn.commit()
    return cursor.lastrowid


def remove_assembly_from_job(
    conn: sqlite3.Connection,
    job_id: int,
    assembly_id: int,
) -> None:
    """Remove the link between a job and an assembly.

    Does not delete the job or the assembly — only the link between them.
    If the link does not exist, this is a no-op (no error).
    """
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute(
        "DELETE FROM job_assemblies WHERE job_id = ? AND assembly_id = ?",
        (job_id, assembly_id),
    )
    conn.commit()


def list_assemblies_for_job(conn: sqlite3.Connection, job_id: int) -> list:
    """Return all job_assemblies rows for a given job, ordered by tool_position."""
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT id, job_id, assembly_id, tool_position, added_at
        FROM job_assemblies
        WHERE job_id = ?
        ORDER BY tool_position
        """,
        (job_id,),
    ).fetchall()
    return list(rows)
```

Run:

```
pytest tests/test_junction.py -v
```

**You should see:**

```
PASSED tests/test_junction.py::test_insert_job_returns_id
PASSED tests/test_junction.py::test_add_assembly_to_job
PASSED tests/test_junction.py::test_list_assemblies_for_job_returns_correct_count
PASSED tests/test_junction.py::test_assembly_appears_in_multiple_jobs
PASSED tests/test_junction.py::test_remove_assembly_from_job_removes_only_link
FAILED tests/test_junction.py::test_add_same_assembly_twice_to_same_job_fails
```

Five pass. One fails — the duplicate test. Adding the same assembly twice to the same job should fail, but the insert currently succeeds because there is no UNIQUE constraint on `(job_id, assembly_id)`.

---

## Step 5 — Refactor: Add the UNIQUE Constraint

The `job_assemblies` table needs a constraint that prevents the same assembly from being added to the same job twice.

Open `tooldb/schema.py` and update `JOB_ASSEMBLIES_TABLE_SQL`:

```python
JOB_ASSEMBLIES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS job_assemblies (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT,
    job_id        INTEGER  NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    assembly_id   INTEGER  NOT NULL REFERENCES assemblies(id),
    tool_position INTEGER,
    added_at      TEXT     NOT NULL,
    UNIQUE (job_id, assembly_id)    -- ← add this line: each assembly appears at most once per job
)
"""
```

The `UNIQUE (col1, col2)` syntax is a **table-level constraint** — it enforces uniqueness across a combination of columns. Neither `job_id` alone nor `assembly_id` alone is unique. Only the *pair* must be unique.

Run:

```
pytest tests/test_junction.py -v
```

**You should see:** All 6 tests passing.

Run the full test suite:

```
pytest tests/ -v
```

**You should see:** All tests across all files passing. The schema change did not break any existing tests because `CREATE TABLE IF NOT EXISTS` only creates the table if it does not exist — the existing tables in other test databases (created from the old SQL) are unaffected. Each test creates a fresh database from scratch, so all tests pick up the new SQL.

---

### SAVE AND TRY

```
pytest tests/ -v
```

**Change something:** Temporarily remove the `UNIQUE (job_id, assembly_id)` line from `JOB_ASSEMBLIES_TABLE_SQL`. Run `test_add_same_assembly_twice_to_same_job_fails`. The test fails because the second insert now succeeds (no constraint to block it). Add the UNIQUE constraint back and run again — green.

---

## 🎯 Challenge: `list_jobs_for_assembly`

**You know:** SELECT with WHERE, junction tables, `conn.row_factory = sqlite3.Row`.

**Task:** Add `list_jobs_for_assembly(conn, assembly_id)` to `queries.py` that returns all `job_assemblies` rows for a given assembly — the inverse of `list_assemblies_for_job`. Then write a test that creates two jobs, adds the same assembly to both, and verifies the function returns two rows.

**Starting code:**

```python
def list_jobs_for_assembly(conn: sqlite3.Connection, assembly_id: int) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT id, job_id, assembly_id, tool_position, added_at
        FROM job_assemblies
        WHERE ???
        ORDER BY job_id
        """,
        ???,
    ).fetchall()
    return list(rows)
```

**Test to add to `tests/test_junction.py`:**

```python
from tooldb.queries import list_jobs_for_assembly   # add to import

def test_list_jobs_for_assembly(tmp_path):
    conn = make_db(tmp_path)
    job1_id = insert_job(conn, name="Job-A")
    job2_id = insert_job(conn, name="Job-B")
    assembly_id = seed_assembly(conn, "shared setup")

    add_assembly_to_job(conn, job_id=job1_id, assembly_id=assembly_id, tool_position=1)
    add_assembly_to_job(conn, job_id=job2_id, assembly_id=assembly_id, tool_position=3)

    results = list_jobs_for_assembly(conn, assembly_id)
    assert len(results) == 2
    job_ids = [row["job_id"] for row in results]
    assert job1_id in job_ids
    assert job2_id in job_ids
```

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def list_jobs_for_assembly(conn: sqlite3.Connection, assembly_id: int) -> list:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT id, job_id, assembly_id, tool_position, added_at
        FROM job_assemblies
        WHERE assembly_id = ?
        ORDER BY job_id
        """,
        (assembly_id,),
    ).fetchall()
    return list(rows)
```

**Key insight:** The junction table is symmetric — you can query it from either side. `WHERE job_id = ?` gives you all assemblies for a job. `WHERE assembly_id = ?` gives you all jobs for an assembly. The table itself does not "belong to" either side; it is the connection between them, queryable from both directions.

</details>

---

## Step 6 — The Relationship Lifecycle

To make the pattern concrete, trace the full lifecycle of an assembly in this project:

**Create the entities (independent):**

```python
tool_id    = insert_tool(conn, "EM-0500", ...)   # creates a tool
holder_id  = insert_holder(conn, "CAT40-ER32", ...) # creates a holder
assembly_id = insert_assembly(conn, "EM-0500 setup", tool_id, holder_id, ...)  # creates a reusable setup
```

**Create a job and add the assembly:**

```python
job_id = insert_job(conn, "Part-001-Rev2")
add_assembly_to_job(conn, job_id=job_id, assembly_id=assembly_id, tool_position=1)
```

**Later: the assembly is no longer needed for this job:**

```python
remove_assembly_from_job(conn, job_id=job_id, assembly_id=assembly_id)
# The assembly still exists in the assemblies table — ready for the next job
```

**Later: the job is completed and deleted:**

```python
conn.execute("PRAGMA foreign_keys = ON")
conn.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
conn.commit()
# ON DELETE CASCADE removes all job_assemblies rows for this job
# The assemblies themselves survive
```

**Later: the tool is retired:**

```python
conn.execute("DELETE FROM tools WHERE id = ?", (tool_id,))
# → IntegrityError: the assembly still references this tool
# Must delete the assembly first, or remove all assemblies using this tool
```

The FK design prevents silent data loss. Retiring a tool requires explicitly clearing its assemblies — which is the correct behavior for a shop floor database.

---

## Final Check

| Feature | How to verify |
|---|---|
| `insert_job` inserts and returns id | Run `test_insert_job_returns_id` — id is 1 |
| `add_assembly_to_job` creates a link | Run `test_add_assembly_to_job` — count in junction is 1 |
| `list_assemblies_for_job` returns correct count | Run `test_list_assemblies_for_job_returns_correct_count` — 3 assemblies for job |
| Same assembly usable in multiple jobs | Run `test_assembly_appears_in_multiple_jobs` — both jobs have 1 result |
| `remove_assembly_from_job` deletes link, not entities | Run `test_remove_assembly_from_job_removes_only_link` — link gone, assembly survives |
| UNIQUE constraint blocks duplicate links | Run `test_add_same_assembly_twice_to_same_job_fails` — IntegrityError |
| All tests pass | `pytest tests/ -v` — all PASSED |

---

## Quick Check Answers

**1. Why can't you store the job-assembly relationship with a single `job_id` column on assemblies?**

Because it is many-to-many: one job uses many assemblies, and one assembly can be used in many jobs. A single `job_id` column on assemblies would only allow each assembly to belong to one job — exactly one, forever. If the same setup is needed for a second job, you would have to either duplicate the entire assembly row (creating redundancy) or change the `job_id` to the new job (losing the link to the first). Neither works. The junction table solves this by recording each pairing as its own row — the same assembly can have one junction row for job 5 and another junction row for job 7, with no duplication of the assembly itself.

**2. You delete a row from `job_assemblies`. What happens to the job and the assembly?**

Nothing. Deleting a `job_assemblies` row removes only the *link* between the job and the assembly. The job row in `jobs` and the assembly row in `assemblies` are completely unaffected — they have no foreign key pointing to `job_assemblies`. This is the point: the junction table exclusively owns the relationship. Adding a relationship (INSERT into junction) and removing a relationship (DELETE from junction) never touch the entities themselves. The job still exists. The assembly still exists. They are simply no longer associated.

**3. Why is `tool_position` stored on the junction row rather than on the assembly?**

Because `tool_position` is a property of the *relationship*, not of the assembly itself. The same assembly (EM-0500 in CAT40-ER32 at 1.5" stickout) might be tool T01 in one job and tool T07 in a different job — the position depends on which job is using it, not on the assembly's own properties. If `tool_position` were on the assembly, you would have to change it every time the assembly is used in a different job, and the old position would be overwritten. On the junction row, each pairing carries its own `tool_position` value independently, so the same assembly can have different positions in different jobs simultaneously.
