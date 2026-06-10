# Python Tool Database — LAB 16 — Transactions and Data Integrity

**Prerequisites:** Lab 15b. You have `insert_tool`, `insert_holder`, `insert_assembly`, `insert_job`, `add_assembly_to_job` in `queries.py`. All tests pass. You understand INSERT, SELECT, foreign keys, and GROUP BY.

**What this lab adds:**
- What a transaction is and why it exists
- `BEGIN` / `COMMIT` / `ROLLBACK` — explicit transaction control in Python
- Atomicity in practice: both inserts succeed or neither does
- Python's `with conn:` context manager for automatic transaction management
- When `conn.commit()` is not enough — and when it is
- `create_assembly_with_transaction` in `queries.py` — a function that combines multiple inserts atomically

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A function inserts a tool, then inserts an assembly linking that tool to a holder. The tool insert succeeds, then Python raises an exception before the assembly insert. What is the state of the database? Is this a problem?
> 2. Every `insert_tool` call in `queries.py` ends with `conn.commit()`. What does `commit()` do? What happens without it?
> 3. What is the difference between `conn.commit()` and `conn.rollback()`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have:

```
tooldb/
    queries.py   ← adds create_assembly_with_transaction:
                    creates tool + holder + assembly atomically
tests/
    test_transactions.py  ← NEW: 4 tests verifying atomic behavior
```

Running `pytest tests/test_transactions.py -v` will show:

```
PASSED tests/test_transactions.py::test_successful_transaction_creates_all_three
PASSED tests/test_transactions.py::test_failed_transaction_creates_nothing
PASSED tests/test_transactions.py::test_rollback_leaves_database_empty
PASSED tests/test_transactions.py::test_context_manager_rolls_back_on_exception
```

---

## Step 1 — The Problem Without Transactions

Consider a function that creates a complete setup: tool, holder, and assembly, together.

```python
def create_full_setup(conn, tool_name, holder_name, stickout):
    tool_id = insert_tool(conn, name=tool_name, ...)   # inserts and commits
    holder_id = insert_holder(conn, name=holder_name, ...)  # inserts and commits
    assembly_id = insert_assembly(conn, tool_id=tool_id, holder_id=holder_id, ...)  # inserts and commits
    return assembly_id
```

Each function calls `conn.commit()` individually. What happens if `insert_assembly` raises an exception?

```
Tool "EM-0500" → inserted and committed ✓
Holder "CAT40-ER32" → inserted and committed ✓
Assembly → IntegrityError (duplicate name, or holder_id wrong) ✗

Result: tool and holder exist in the database, but there is no assembly connecting them.
```

This is a partial write — data in an inconsistent state. The database now contains a tool and a holder that were meant to be used together, but without the assembly linking them, the user has no way to know they belong together. The logical unit of work ("create a complete setup") was broken in the middle.

---

### Concept: Transaction — An Atomic Unit of Work

**What it is:** A transaction is a group of SQL statements that the database treats as a single, indivisible unit. Either every statement in the transaction succeeds and the changes are saved, or the entire group is undone as if nothing happened.

**The four guarantees (ACID — introduced in lesson-10):**

- **Atomicity:** All statements in the transaction succeed, or none do. No partial writes.
- **Consistency:** The database moves from one valid state to another valid state.
- **Isolation:** Uncommitted changes are not visible to other connections.
- **Durability:** Once committed, the changes survive crashes.

**The three SQL transaction statements:**

```sql
BEGIN;      -- start a transaction: changes after this are not yet saved
COMMIT;     -- save all changes since BEGIN permanently
ROLLBACK;   -- undo all changes since BEGIN as if they never happened
```

**What it hides:** The journal (or WAL — Write-Ahead Log) that SQLite uses to track pending changes. Before commit, changes are written to a journal file. On COMMIT, the journal is applied. On ROLLBACK, the journal is discarded. On a crash mid-transaction, the journal is discarded on recovery. The invariant: a transaction either applies completely to the database file, or leaves it completely unchanged.

**Canonical example (General Explanation):**

A bank transfer. Moving $100 from account A to account B:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;   -- debit A
UPDATE accounts SET balance = balance + 100 WHERE id = 2;   -- credit B
COMMIT;
```

If the machine crashes after the debit but before the credit, ROLLBACK undoes the debit on recovery — the $100 never left account A. Without a transaction, the money would be permanently gone from A and never arrive at B.

**Project Application:** Creating a complete setup (tool + holder + assembly) is a logical unit of work. Either all three rows exist and are linked, or none do. A partial state — tool and holder with no assembly — is invalid from the user's perspective. Wrapping all three inserts in one transaction guarantees atomicity.

**You will see this again in:** Every database-backed application that writes related data. SQLAlchemy: `session.commit()` commits the entire session's changes. Django ORM: `transaction.atomic()` decorator. Flask: request-level transactions. Any financial system, booking system, or inventory system — anything where half-done state is worse than no change at all.

**Career signal:** "What is a database transaction? What does ACID stand for?" is a standard backend interview question. Being able to explain atomicity with a concrete example — not just reciting the acronym — signals experience with real production systems.

**Watch for:** SQLite's autocommit behavior. By default, Python's `sqlite3` module runs in autocommit mode for DDL statements (`CREATE TABLE`, `DROP TABLE`), but wraps DML statements (`INSERT`, `UPDATE`, `DELETE`) in an implicit transaction. This means calling `conn.execute("INSERT ...")` without `conn.commit()` leaves the insert in a pending transaction that may be rolled back if the connection closes unexpectedly.

---

## Step 2 — Transaction Control in Python's `sqlite3`

Python's `sqlite3` module has two modes for transaction management:

**Mode 1 — Explicit `commit()` after each statement (current approach):**

```python
conn.execute("INSERT INTO tools ...")
conn.commit()   # saves this insert immediately — starts a new implicit transaction
```

Each `commit()` ends the current transaction and starts a new one. This is safe but does not give you atomicity across multiple inserts.

**Mode 2 — Explicit `BEGIN` / `COMMIT` / `ROLLBACK`:**

```python
conn.execute("BEGIN")                    # start transaction explicitly
conn.execute("INSERT INTO tools ...")    # pending — not yet saved
conn.execute("INSERT INTO holders ...")  # pending — not yet saved
conn.execute("INSERT INTO assemblies ...")  # pending — not yet saved
conn.commit()   # COMMIT saves all three at once — atomic
```

If an exception occurs between `BEGIN` and `COMMIT`:

```python
conn.execute("BEGIN")
conn.execute("INSERT INTO tools ...")
raise Exception("something went wrong")  # ← exception
conn.execute("INSERT INTO holders ...")  # never reached
conn.commit()                            # never reached
# The tools insert is still pending — not yet saved.
# When the connection closes, the pending transaction is rolled back automatically.
```

**Mode 3 — `with conn:` context manager (recommended):**

Python's `sqlite3.Connection` supports the context manager protocol. `with conn:` automatically commits on success and rolls back on exception:

```python
with conn:                               # BEGIN (implicit)
    conn.execute("INSERT INTO tools ...")
    conn.execute("INSERT INTO holders ...")
    conn.execute("INSERT INTO assemblies ...")
# COMMIT (if no exception was raised)

# If an exception is raised inside the block:
with conn:
    conn.execute("INSERT INTO tools ...")
    raise ValueError("bad data")          # exception raised
    conn.execute("INSERT INTO holders ...") # never reached
# ROLLBACK (automatic — tools insert is undone)
```

**`with conn:` is the preferred pattern.** It is shorter, safer (you cannot forget to rollback on error), and expresses intent clearly.

**Important:** `with conn:` manages the *transaction*, not the *connection*. The connection stays open after the `with` block. To close the connection, call `conn.close()` separately.

---

## Step 3 — Red: Write the Tests

Create `tests/test_transactions.py`:

```python
import sqlite3
import pytest
from tooldb.schema import create_schema
from tooldb.queries import create_assembly_with_transaction  # ← new: doesn't exist yet


def make_db(tmp_path):
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    create_schema(conn)
    return conn


def test_successful_transaction_creates_all_three(tmp_path):
    conn = make_db(tmp_path)

    assembly_id = create_assembly_with_transaction(
        conn,
        tool_name="EM-0500",
        tool_diameter=0.5,
        tool_material="carbide",
        tool_type="endmill",
        holder_name="CAT40-ER32",
        holder_taper="CAT40",
        holder_collet=0.787,
        assembly_name='EM-0500 in CAT40-ER32 1.5"',
        stickout_inches=1.5,
    )

    assert assembly_id is not None

    # All three rows exist
    tool_count = conn.execute("SELECT COUNT(*) FROM tools").fetchone()[0]
    holder_count = conn.execute("SELECT COUNT(*) FROM holders").fetchone()[0]
    assembly_count = conn.execute("SELECT COUNT(*) FROM assemblies").fetchone()[0]
    assert tool_count == 1
    assert holder_count == 1
    assert assembly_count == 1


def test_failed_transaction_creates_nothing(tmp_path):
    conn = make_db(tmp_path)

    # First call creates the tool and holder
    create_assembly_with_transaction(
        conn,
        tool_name="EM-0500", tool_diameter=0.5, tool_material="carbide", tool_type="endmill",
        holder_name="CAT40-ER32", holder_taper="CAT40", holder_collet=0.787,
        assembly_name='EM-0500 setup', stickout_inches=1.5,
    )

    # Second call with the SAME assembly name should fail (UNIQUE constraint)
    # The tool and holder names also conflict (UNIQUE) — all three inserts should fail atomically
    with pytest.raises(sqlite3.IntegrityError):
        create_assembly_with_transaction(
            conn,
            tool_name="EM-0500",          # ← UNIQUE conflict: tool already exists
            tool_diameter=0.5, tool_material="carbide", tool_type="endmill",
            holder_name="CAT40-ER32",     # ← UNIQUE conflict: holder already exists
            holder_taper="CAT40", holder_collet=0.787,
            assembly_name='EM-0500 setup',  # ← UNIQUE conflict: assembly already exists
            stickout_inches=2.0,
        )

    # Database state is unchanged — still exactly 1 of each
    assert conn.execute("SELECT COUNT(*) FROM tools").fetchone()[0] == 1
    assert conn.execute("SELECT COUNT(*) FROM holders").fetchone()[0] == 1
    assert conn.execute("SELECT COUNT(*) FROM assemblies").fetchone()[0] == 1


def test_rollback_leaves_database_empty(tmp_path):
    conn = make_db(tmp_path)

    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("BEGIN")
    conn.execute("INSERT INTO tools (name, diameter_inches, material, tool_type) "
                 "VALUES ('EM-0500', 0.5, 'carbide', 'endmill')")

    # Explicitly rollback — tool insert is undone
    conn.rollback()

    count = conn.execute("SELECT COUNT(*) FROM tools").fetchone()[0]
    assert count == 0   # rollback undid the insert


def test_context_manager_rolls_back_on_exception(tmp_path):
    conn = make_db(tmp_path)

    conn.execute("PRAGMA foreign_keys = ON")
    with pytest.raises(ValueError):
        with conn:                           # begins implicit transaction
            conn.execute("INSERT INTO tools (name, diameter_inches, material, tool_type) "
                         "VALUES ('EM-0500', 0.5, 'carbide', 'endmill')")
            raise ValueError("simulated error before commit")  # triggers rollback
            # the insert above is never committed

    count = conn.execute("SELECT COUNT(*) FROM tools").fetchone()[0]
    assert count == 0   # context manager rolled back the insert on exception
```

Run:

```
pytest tests/test_transactions.py -v
```

**You should see:** All 4 failing (first two fail on ImportError; last two will pass once you run them). Red.

---

## Step 4 — Green: Add `create_assembly_with_transaction`

Add to `tooldb/queries.py`:

```python
def create_assembly_with_transaction(
    conn: sqlite3.Connection,
    tool_name: str,
    tool_diameter: float,
    tool_material: str,
    tool_type: str,
    holder_name: str,
    holder_taper: str,
    holder_collet: float,
    assembly_name: str,
    stickout_inches: float,
    tool_flutes: int = None,
    assembly_notes: str = None,
) -> int:
    """Create a tool, holder, and assembly atomically.

    Either all three rows are created, or none are.
    Raises sqlite3.IntegrityError if any name conflicts with an existing row.
    """
    conn.execute("PRAGMA foreign_keys = ON")

    with conn:
        # BEGIN is implicit at the start of `with conn:`
        cursor_tool = conn.execute(
            "INSERT INTO tools (name, diameter_inches, material, tool_type, flutes) "
            "VALUES (?, ?, ?, ?, ?)",
            (tool_name, tool_diameter, tool_material, tool_type, tool_flutes),
        )
        tool_id = cursor_tool.lastrowid

        cursor_holder = conn.execute(
            "INSERT INTO holders (name, taper, collet_size_inches) VALUES (?, ?, ?)",
            (holder_name, holder_taper, holder_collet),
        )
        holder_id = cursor_holder.lastrowid

        cursor_assembly = conn.execute(
            "INSERT INTO assemblies (name, tool_id, holder_id, stickout_inches, notes) "
            "VALUES (?, ?, ?, ?, ?)",
            (assembly_name, tool_id, holder_id, stickout_inches, assembly_notes),
        )
        assembly_id = cursor_assembly.lastrowid
        # COMMIT happens automatically when the `with` block exits without exception
        # ROLLBACK happens automatically if any of the above raises an exception

    return assembly_id
```

Run:

```
pytest tests/test_transactions.py -v
```

**You should see:**

```
PASSED tests/test_transactions.py::test_successful_transaction_creates_all_three
PASSED tests/test_transactions.py::test_failed_transaction_creates_nothing
PASSED tests/test_transactions.py::test_rollback_leaves_database_empty
PASSED tests/test_transactions.py::test_context_manager_rolls_back_on_exception
```

All green.

### SAVE AND TRY

```
pytest tests/ -v
```

**You should see:** All tests passing.

**Change something:** Remove the `with conn:` block from `create_assembly_with_transaction` and replace it with three separate `conn.commit()` calls (one after each insert). Run `test_failed_transaction_creates_nothing`. The test fails — the tool insert succeeds and is committed before the assembly fails, leaving the database with 1 tool, 1 holder, and 0 assemblies. The atomicity guarantee is gone. Restore `with conn:` and run again.

---

### Refactor: The `with conn:` Pattern vs Nested Transactions

Look at the current `insert_tool` function:

```python
def insert_tool(conn, name, ...):
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.execute("INSERT INTO tools ...")
    conn.commit()   # ← individual commit
    return cursor.lastrowid
```

And `create_assembly_with_transaction`:

```python
def create_assembly_with_transaction(conn, ...):
    conn.execute("PRAGMA foreign_keys = ON")
    with conn:
        cursor_tool = conn.execute("INSERT INTO tools ...")
        ...
```

There is a conflict: `create_assembly_with_transaction` does NOT call `insert_tool` because `insert_tool` calls `conn.commit()` individually — which would commit the tool insert before the holder and assembly inserts, breaking atomicity.

This is the limitation of mixing explicit `commit()` with `with conn:` — the individual-commit functions cannot be reused inside a transaction without modification.

**The clean fix** (a future refactor): split each function into a "write to database" layer (no commit) and a "transaction boundary" layer (commits). This is the repository pattern introduced in Block 3.

For now, `create_assembly_with_transaction` duplicates the SQL from `insert_tool`, `insert_holder`, `insert_assembly`. This is intentional — the lesson is about transactions. The duplication will be cleaned up in Block 3 when we build the proper repository layer.

---

## 🎯 Challenge: `transfer_assembly_to_job`

**You know:** Transactions with `with conn:`, `add_assembly_to_job`, the junction table pattern.

**Task:** Add `transfer_assembly_to_job(conn, assembly_id, from_job_id, to_job_id)` that atomically:
1. Removes the assembly from `from_job_id` (delete from `job_assemblies`)
2. Adds the assembly to `to_job_id` (insert into `job_assemblies`)

Both operations must succeed together or neither does. Write a test that verifies if the insert into the new job fails (due to a UNIQUE conflict — the assembly is already in the target job), the removal from the old job is also undone.

**Starting code:**

```python
def transfer_assembly_to_job(
    conn: sqlite3.Connection,
    assembly_id: int,
    from_job_id: int,
    to_job_id: int,
    new_tool_position: int = None,
) -> None:
    """Move an assembly from one job to another atomically.

    If adding to the new job fails, the removal from the old job is undone.
    """
    conn.execute("PRAGMA foreign_keys = ON")
    with conn:
        conn.execute(
            "DELETE FROM job_assemblies WHERE job_id = ? AND assembly_id = ?",
            ???,
        )
        from datetime import datetime
        conn.execute(
            "INSERT INTO job_assemblies (job_id, assembly_id, tool_position, added_at) "
            "VALUES (?, ?, ?, ?)",
            ???,
        )
```

**Hints:**

1. The DELETE removes the old link. The INSERT creates the new link.
2. To force a failure, try to add the assembly to a job it is already in.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def transfer_assembly_to_job(
    conn: sqlite3.Connection,
    assembly_id: int,
    from_job_id: int,
    to_job_id: int,
    new_tool_position: int = None,
) -> None:
    """Move an assembly from one job to another atomically."""
    conn.execute("PRAGMA foreign_keys = ON")
    added_at = datetime.now().isoformat()
    with conn:
        conn.execute(
            "DELETE FROM job_assemblies WHERE job_id = ? AND assembly_id = ?",
            (from_job_id, assembly_id),
        )
        conn.execute(
            "INSERT INTO job_assemblies (job_id, assembly_id, tool_position, added_at) "
            "VALUES (?, ?, ?, ?)",
            (to_job_id, assembly_id, new_tool_position, added_at),
        )
```

Test:

```python
from tooldb.queries import (
    insert_tool, insert_holder, insert_assembly, insert_job,
    add_assembly_to_job, transfer_assembly_to_job
)

def test_transfer_assembly_to_job_is_atomic(tmp_path):
    conn = make_db(tmp_path)
    tool_id = conn.execute(
        "INSERT INTO tools (name, diameter_inches, material, tool_type) VALUES ('T', 0.5, 'carbide', 'endmill')"
    ).lastrowid
    holder_id = conn.execute(
        "INSERT INTO holders (name, taper, collet_size_inches) VALUES ('H', 'CAT40', 0.787)"
    ).lastrowid
    conn.commit()
    assembly_id = insert_assembly(conn, name="setup", tool_id=tool_id,
                                  holder_id=holder_id, stickout_inches=1.5)
    job_a = insert_job(conn, name="Job-A")
    job_b = insert_job(conn, name="Job-B")
    add_assembly_to_job(conn, job_id=job_a, assembly_id=assembly_id, tool_position=1)
    add_assembly_to_job(conn, job_id=job_b, assembly_id=assembly_id, tool_position=1)
    # assembly is already in job_b — transferring to job_b will fail (UNIQUE)

    with pytest.raises(sqlite3.IntegrityError):
        transfer_assembly_to_job(conn, assembly_id=assembly_id,
                                 from_job_id=job_a, to_job_id=job_b)

    # Verify rollback: assembly is still in job_a (delete was undone)
    count = conn.execute(
        "SELECT COUNT(*) FROM job_assemblies WHERE job_id = ? AND assembly_id = ?",
        (job_a, assembly_id)
    ).fetchone()[0]
    assert count == 1   # assembly is still in job_a — the transaction rolled back
```

**Key insight:** `with conn:` wraps both the DELETE and the INSERT in one transaction. When the INSERT fails (UNIQUE conflict), the context manager catches the exception and calls `conn.rollback()` automatically — undoing the DELETE too. The assembly never left `job_a`. This is atomicity: both operations succeed together or neither takes effect.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `create_assembly_with_transaction` creates all three rows | Run `test_successful_transaction_creates_all_three` |
| Failure in assembly insert leaves database unchanged | Run `test_failed_transaction_creates_nothing` — still 1 of each after failure |
| Explicit `ROLLBACK` undoes pending inserts | Run `test_rollback_leaves_database_empty` — tools count is 0 |
| `with conn:` rolls back on exception | Run `test_context_manager_rolls_back_on_exception` — tools count is 0 |
| All tests pass | `pytest tests/ -v` — all PASSED |

---

## Quick Check Answers

**1. Tool inserted and committed, then exception before assembly insert — is this a problem?**

Yes — it is a partial write. The tool exists in the database but the assembly does not. From the user's perspective, they requested a complete setup (tool + assembly) and got only a partial result. The tool is now "orphaned" — it exists with no connection to the rest of the database, and there is no indication to the user that anything went wrong. This is the problem transactions solve: wrapping both inserts in a transaction means either both succeed (commit) or neither does (rollback on exception). The database stays in a clean state.

**2. What does `conn.commit()` do? What happens without it?**

`conn.commit()` ends the current transaction and writes all pending changes to the database file permanently. Without `conn.commit()`, the changes exist in memory (SQLite's journal) as a pending transaction. They are not visible to other connections (isolation), and if the connection closes or the process crashes, the pending changes are automatically rolled back — as if the writes never happened. Python's `sqlite3` starts an implicit transaction for DML statements (`INSERT`, `UPDATE`, `DELETE`); you must explicitly commit to persist them.

**3. What is the difference between `conn.commit()` and `conn.rollback()`?**

`conn.commit()` permanently saves all changes made since the last commit (or since BEGIN). The changes are written to the database file and become visible to other connections. `conn.rollback()` discards all changes made since the last commit (or since BEGIN) and returns the database to its state before those changes. Both end the current transaction. `commit()` saves; `rollback()` undoes.
