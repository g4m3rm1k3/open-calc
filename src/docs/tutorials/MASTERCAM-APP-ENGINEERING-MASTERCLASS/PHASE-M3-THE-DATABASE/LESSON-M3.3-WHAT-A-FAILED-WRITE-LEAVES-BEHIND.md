# Lesson M3.3: What a Failed Write Leaves Behind

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. All new code in this lesson goes into verification/mastercam-app-copy/mastercam-app/tests/ - not the real mastercam-app/tests/, per this phase's rule.*

**What you will build:** Real proof of two different real behaviors this file mixes: save_part wraps its writes in `with self._conn:`, so a mid-write exception rolls back everything, cleanly. update_ta doesn't - it issues separate execute() calls with a single commit() at the end, and a real, reproducible failure shows exactly what that leaves dangling: two already-executed, uncommitted ta_changes rows, visible to that same connection, with nothing in update_ta itself ever cleaning them up.

**What you need to know first:** _validate_and_upsert_ta's real, no-exception-on-conflict behavior from the previous lesson - this lesson is the other place a failure's consequences matter in this file.

## Terms used in this lesson

- **Transaction** — A group of writes that either all happen or none do. sqlite3 starts one implicitly on the first write after a commit, and it stays open - uncommitted - until something calls commit() or rollback() on that connection.
- **with conn: (as a context manager)** — sqlite3.Connection supports the `with` statement directly - on success it commits everything done inside the block; if any exception escapes the block, it rolls back everything done inside it, automatically, before letting the exception continue upward.

## Objects and methods used

- **`Database.save_part`**
  - *What it is:* Wraps its writes in with self._conn: - already covered in Lesson M3.1
  - *Implementation:* mastercam_app/db/database.py:438
  - *Its use:* Every real XML upload
  - *Type:* method
  - *Responsibility:* All-or-nothing: a part's rows and every valid sequence's rows, or none of them
  - *Depends on:* self._conn
  - *Connects to:* the context-manager pattern this lesson names directly
  - *Shape:* with self._conn: wraps the whole method body

- **`Database.update_ta`**
  - *What it is:* Updates a TA's fields and logs each change - using separate execute() calls and one final commit()
  - *Implementation:* mastercam_app/db/database.py:823
  - *Its use:* Called when a user edits a TA's details directly in the UI
  - *Type:* method
  - *Responsibility:* Log what changed to ta_changes, then apply the update
  - *Depends on:* self._conn, self.get_ta
  - *Connects to:* the manual-commit pattern this lesson contrasts against save_part
  - *Shape:* loop of execute() calls, then one UPDATE, then one commit() - no with block

## Concept Unit: with self._conn: Rolls Back Everything, Automatically

### The Problem

save_part inserts a parts row, then loops inserting a ta_parts row per sequence. If sequence 5 of 8 has bad data and raises partway through that loop, what happens to the parts row and the four ta_parts rows already inserted before the failure?

Before reading on:

- Lesson M3.1 already showed save_part uses `with self._conn:` - before running the code below, predict: does the parts row from a failed save_part call exist afterward?
- The exception in the test below is re-raised after the with block exits - what real evidence would you look at to tell whether the rollback happened before or after that re-raise?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:438-439 (Database.save_part, the opening of the write), quoted verbatim:
with self._conn:

    # ── 1. Upsert part ────────────────────────────────────────────────
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_transactions.py` (new)
- **Change type:** add
- **Location:** new test file
- **Dependencies:** mastercam_app.db.database.Database, pytest

### The New Code

A minimal, real demonstration using the same sqlite3.Connection this codebase uses - not save_part itself yet, just the with-conn mechanism in isolation.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_transactions.py` (new)

```python
import sqlite3

import pytest

from mastercam_app.db.database import Database


def test_with_conn_rolls_back_everything_on_a_raised_exception():
    db = Database(":memory:")
    conn = db._conn

    with pytest.raises(RuntimeError):
        with conn:
            conn.execute("INSERT INTO tas (ta_number, holder_name) VALUES ('TA_A', 'X')")
            raise RuntimeError("boom inside with-block")

    rows = conn.execute("SELECT * FROM tas WHERE ta_number='TA_A'").fetchall()
    assert len(rows) == 0
```

### Mechanical Walkthrough

- `with pytest.raises(RuntimeError): with conn: ...` — Two nested with-blocks doing two different jobs: the inner `with conn:` is the real thing being tested - sqlite3's own transaction handling. The outer `with pytest.raises(...)` is just how the test tells pytest "yes, an exception escaping here is the expected, correct outcome" - without it, the raised RuntimeError would fail the test instead of being the point of it.
- `assert len(rows) == 0` — This is the real proof, not an assumption: the INSERT genuinely ran (it's a real, syntactically valid statement) but `with conn:` caught the exception on the way out and issued a real rollback before re-raising - so by the time this line runs, the row is gone.

### CS Lens

This is **atomicity** - the "all or nothing" property of a transaction. `with conn:` is Python's context-manager protocol (the same `__enter__`/`__exit__` shape as `with open(...)`) applied to a real database transaction: `__exit__` is where the commit-or-rollback decision actually happens, based on whether an exception is propagating through it.

### SE Lens

The real alternative is what the next unit shows - separate execute() calls with commit() at the end, and no automatic cleanup if something fails before reaching it. `with conn:` costs nothing here (it's the same execute() calls, just wrapped) and removes an entire class of "partially-applied write" bugs for free - which makes the next unit's contrast a real design inconsistency, not a necessary tradeoff.

### Commands needed

- `python -m pytest tests/test_database_transactions.py::test_with_conn_rolls_back_everything_on_a_raised_exception -v` — Run from verification/mastercam-app-copy/mastercam-app/

### Verification

```text
collected 1 item

tests/test_database_transactions.py::test_with_conn_rolls_back_everything_on_a_raised_exception PASSED [100%]
```

Full saved run: `verification/mastercam-phase-03/lab_test_database_transactions_output.txt`.

### Connection to the previous unit

Lesson M3.1 already used save_part's `with self._conn:` without naming it - this unit is that same mechanism, isolated and proven directly.

## Concept Unit: update_ta Doesn't Roll Back - a Real, Reproducible Dangling Write

### The Problem

update_ta issues several execute() calls (one INSERT per changed field into ta_changes, then one UPDATE) and calls commit() only once, at the very end - no with block. What real state is left behind if it fails after some of those execute() calls have already run, but before reaching that final commit()?

Before reading on:

- update_ta's ta_changes loop calls str(new_value) before inserting - a Python list converts to a string just fine ('[...]'). So which specific line is where the real ProgrammingError below actually fires?
- After the exception, db._conn.rollback() is called explicitly in the test, not by update_ta itself - what does that tell you about whether update_ta cleans up after its own failures?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:855-868 (end of Database.update_ta, the raw UPDATE and final commit), quoted verbatim:
updates = [] values = [] for field, value in fields.items():
    if field in allowed_fields:
        updates.append(f"{field} = ?")
        values.append(value)

if not updates:
    return

values.append(ta_number) query = f"UPDATE tas SET {', '.join(updates)} WHERE ta_number = ?" self._conn.execute(query, values) self._conn.commit()
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_transactions.py` (modified)
- **Change type:** add
- **Location:** end of test_database_transactions.py
- **Dependencies:** Database, sqlite3, pytest

### The New Code

The real, reproducible failure - a bad field type update_ta never validates.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_transactions.py` (new)

```python
def test_update_ta_leaves_a_dangling_uncommitted_ta_changes_row_on_a_mid_call_failure():
    db = Database(":memory:")
    db._conn.execute(
        "INSERT INTO tas (ta_number, holder_name, tool_code) VALUES ('TA0099', 'OLD_HOLDER', 'OLD_CODE')"
    )
    db._conn.commit()

    with pytest.raises(sqlite3.ProgrammingError):
        db.update_ta("TA0099", {"holder_name": "NEW_HOLDER", "tool_code": ["not", "a", "string"]})

    row = db._conn.execute("SELECT * FROM tas WHERE ta_number='TA0099'").fetchone()
    assert row["holder_name"] == "OLD_HOLDER"

    dangling = db._conn.execute(
        "SELECT * FROM ta_changes WHERE ta_number='TA0099'"
    ).fetchall()
    assert len(dangling) == 2

    db._conn.rollback()
    after_rollback = db._conn.execute(
        "SELECT * FROM ta_changes WHERE ta_number='TA0099'"
    ).fetchall()
    assert len(after_rollback) == 0
```

### Mechanical Walkthrough

- `{'holder_name': 'NEW_HOLDER', 'tool_code': ['not', 'a', 'string']}` — Both fields differ from what's stored, so update_ta's loop logs BOTH as ta_changes rows - str(['not','a','string']) is a real, valid string ("['not', 'a', 'string']"), so that INSERT succeeds too. The real failure only happens later, at `self._conn.execute(query, values)` - the raw UPDATE - because `values` there holds the unconverted list, not its str(), and sqlite3 can only bind None/int/float/str/bytes.
- `assert len(dangling) == 2` — This is the real, measured count - not assumed. Two ta_changes rows already exist in the database, from that same connection's point of view, even though update_ta raised and never reached its own commit(). They're real rows sitting in an open transaction nobody closed.
- `db._conn.rollback()` — This line is doing update_ta's own job for it, from outside the method - proving the dangling rows are still just an open transaction (a real rollback makes them disappear), not already-committed data. update_ta has no equivalent cleanup of its own.

### Mental Model

```text
update_ta("TA0099", {holder_name: ..., tool_code: [...]}):
  INSERT ta_changes (holder_name row)   -- executes, uncommitted
  INSERT ta_changes (tool_code row)     -- executes, uncommitted
  UPDATE tas SET ... WHERE ta_number=?  -- raises ProgrammingError
  self._conn.commit()                   -- never reached

Connection state right after the raise:
  2 real ta_changes rows sitting in an open transaction
  tas.holder_name still OLD_HOLDER (the UPDATE never completed)
  no rollback() called by update_ta itself
```

### CS Lens

This is the real risk atomicity (the unit above) is supposed to prevent - a **partial write**, where some effects of an operation happened and others didn't, with no guarantee about which. Here it's an audit log (ta_changes) getting entries for a change that never actually applied.

### SE Lens

Because Database is a singleton with exactly one shared connection (Lesson M3.0), this isn't contained to update_ta's own caller - the dangling transaction sits on the connection every other part of the app shares. The real alternative, wrapping update_ta's body in `with self._conn:` the same way save_part already does, costs nothing here either; the inconsistency between the two methods looks like an oversight, not a deliberate choice, since nothing in update_ta needs manual commit control.

### Commands needed

- `python -m pytest tests/test_database_transactions.py -v` — Run from verification/mastercam-app-copy/mastercam-app/, both tests

### Verification

```text
collected 2 items

tests/test_database_transactions.py::test_with_conn_rolls_back_everything_on_a_raised_exception PASSED [ 50%]
tests/test_database_transactions.py::test_update_ta_leaves_a_dangling_uncommitted_ta_changes_row_on_a_mid_call_failure PASSED [100%]

============================== 2 passed in 0.10s ==============================
```

Full saved run: `verification/mastercam-phase-03/lab_test_database_transactions_output.txt`.

### Connection to the previous unit

The unit above proved `with conn:` cleans up after itself automatically; this unit proves update_ta has no equivalent - the dangling rows only disappeared because the test called rollback() manually, standing in for cleanup update_ta doesn't do.

## Concept Unit: Applying the Same with self._conn: Pattern to update_ta

### The Problem

Unit one already proved `with self._conn:` gives save_part automatic rollback for free. update_ta needs exactly the same thing - wrapping its body is the whole fix, and the real test is whether that's actually true.

Before reading on:

- update_ta has two early `return` statements inside what becomes the with-block (one for a missing TA, one for no allowed fields) - does returning from inside a with block skip the commit, or still trigger it correctly?
- Before this fix, the test asserted 2 dangling ta_changes rows after the failure. What should that same assertion become once the fix is applied?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:807-811 (Database.update_ta, right before the fix), quoted verbatim:
now = datetime.now().isoformat()
# Log changes for field, new_value in fields.items():
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/db/database.py` (modified), `verification/mastercam-app-copy/mastercam-app/tests/test_database_transactions.py` (modified)
- **Change type:** refactor
- **Location:** Database.update_ta, from the ta_changes loop through the final UPDATE
- **Dependencies:** none - the same self._conn already in scope

### The New Code

The real fix - one `with self._conn:` wrapping the ta_changes loop and the UPDATE, replacing the manual commit() at the end - and the test rewritten to prove the new, correct behavior.

**File:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/db/database.py` (already exists — modified)

```python
now = datetime.now().isoformat()

with self._conn:
    # Log changes
    for field, new_value in fields.items():
        if field in allowed_fields:
            old_value = str(current.get(field, ""))
            new_value_str = str(new_value)
            if old_value != new_value_str:
                self._conn.execute(
                    """INSERT INTO ta_changes
                        (ta_number, changed_at, changed_by, field_name, old_value, new_value)
                        VALUES (?, ?, ?, ?, ?, ?)""",
                    (ta_number, now, changed_by, field, old_value, new_value_str)
                )

    # Perform the update
    updates = []
    values = []
    for field, value in fields.items():
        if field in allowed_fields:
            updates.append(f"{field} = ?")
            values.append(value)

    if not updates:
        return

    values.append(ta_number)
    query = f"UPDATE tas SET {', '.join(updates)} WHERE ta_number = ?"
    self._conn.execute(query, values)
```

### Mechanical Walkthrough

- `self._conn.execute(query, values)  # no more self._conn.commit() after it` — The manual commit() is gone entirely - `with self._conn:`'s own __exit__ handles it now, exactly like save_part. Removing the old commit() isn't optional cleanup - leaving both would mean committing twice in the success case (harmless) but would defeat the whole point if the block still had a standalone commit() sitting after a possible failure point.
- `if not updates: return  (now inside the with block)` — A `return` inside a `with` block still runs `__exit__` correctly - Python guarantees this the same way a `return` inside a `try/finally` still runs the finally. Since nothing was written yet at this early return, `__exit__` commits an empty transaction, which is a real no-op, not a bug.

### CS Lens

This is the same **atomicity** fix as the unit above, applied to a second, independent method - proof that the pattern generalizes rather than being a one-off patch specific to save_part's shape.

### SE Lens

The real alternative - leaving update_ta as-is and just documenting the dangling-row risk - would mean every future caller has to remember an undocumented gotcha. Wrapping the method costs one keyword and a re-indent; it's the same cost save_part already paid.

### Commands needed

- `python -m pytest tests/test_database_transactions.py -v` — Run from verification/mastercam-app-copy/mastercam-app/ - both tests, including the rewritten second one

### Verification

```text
collected 2 items

tests/test_database_transactions.py::test_with_conn_rolls_back_everything_on_a_raised_exception PASSED [ 50%]
tests/test_database_transactions.py::test_update_ta_now_rolls_back_everything_on_a_mid_call_failure PASSED [100%]

============================== 2 passed in 0.10s ==============================
```

Full saved run: `verification/mastercam-phase-03/lab_all_fixes_verified_output.txt`.

### Connection to the previous unit

The unit above found the gap; this unit closes it, using the exact mechanism unit one already proved works - not a new idea, the same one applied a second place.

## Connect the pieces

Trace ta_number "TA0099" through all three units: unit one proves the general mechanism; unit two finds update_ta doesn't use it and shows the real, measured consequence (2 dangling rows); unit three applies the identical fix and the same test now proves 0 dangling rows, verified by an actual re-run, not assumed from the pattern matching.

**Next lesson:** Next: connection.py's resilience layer - what happens when the database file itself is corrupted, tested by actually corrupting one and watching the real repair path run.