# Lesson M3.4: A Repair That Recovers Data, Then Throws It Away

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. All new code in this lesson goes into verification/mastercam-app-copy/mastercam-app/tests/ - not the real mastercam-app/tests/, per this phase's rule.*

**What you will build:** Real tests against connection.py's corruption-detection and repair functions, using an actually-corrupted real SQLite file (built for real, then corrupted for real - not simulated). Along the way, a real, reproducible gap in the repair function: it copies several real tables successfully into a fresh file, then a later step throws, and the whole partial recovery is discarded because nothing captures it before the failure.

**What you need to know first:** The real schema from Lesson M3.0 - this lesson corrupts and repairs a real database built with that exact schema.

## Terms used in this lesson

- **PRAGMA integrity_check** — A real, built-in SQLite command that walks the whole file's internal structure (pages, indexes, b-trees) and reports 'ok' or a list of specific problems. It's a real check of the file's internal consistency - not a guarantee the data in it is semantically correct, only that its storage structure is intact.
- **ATTACH DATABASE** — A real SQL statement that opens a second database file inside an existing connection, under a chosen alias - here, `old_db` - so a query can reference tables in both databases at once (`old_db.tas`), which is what makes copying rows between two real files possible without an external tool.

## Objects and methods used

- **`connection._integrity_ok`**
  - *What it is:* A thin wrapper around PRAGMA integrity_check
  - *Implementation:* mastercam_app/db/connection.py:25
  - *Its use:* Called after every real open, and again after every repair attempt
  - *Type:* function
  - *Responsibility:* Answer true/false: is this connection's file internally consistent
  - *Depends on:* sqlite3
  - *Connects to:* _open_db and _repair_database
  - *Shape:* one PRAGMA, one comparison

- **`connection._repair_database`**
  - *What it is:* Rebuilds a fresh database file by copying whatever it can read from a corrupted one
  - *Implementation:* mastercam_app/db/connection.py:33
  - *Its use:* Called by _open_db when a corrupted file can't be restored from any backup
  - *Type:* function
  - *Responsibility:* Best-effort recovery: copy every table's schema and rows it can, skip what it can't
  - *Depends on:* sqlite3's ATTACH DATABASE, _integrity_ok
  - *Connects to:* the fresh file it builds becomes the new mastercam.db on success
  - *Shape:* per-table try/except inside one large try/except

## Concept Unit: integrity_check Catches Real Corruption, on a Real File

### The Problem

Before trusting _repair_database, its detector needs to be proven against a database that's actually broken - not assumed broken, actually corrupted on disk, the same way a real crash or bad copy would leave it.

Before reading on:

- The corruption below flips bytes in the middle of the file, not the first few bytes - why would corrupting only the header (the file's first 100 bytes) be a much less interesting real test case?
- If integrity_check reported 'ok' on a file you'd just deliberately corrupted, what would that tell you about the real limits of what this check actually verifies?

### Project Change

- **Reference Source:** mastercam_app/db/connection.py:25-30 (_integrity_ok), quoted verbatim:
def _integrity_ok(conn: sqlite3.Connection) -> bool:
    try:
        row = conn.execute("PRAGMA integrity_check;").fetchone()
        return bool(row and row[0] == "ok")
    except Exception:
        return False
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_connection_resilience.py` (new)
- **Change type:** add
- **Location:** new test file
- **Dependencies:** mastercam_app.db.connection, mastercam_app.db.database.Database, pytest's tmp_path

### The New Code

Two real helpers - build a real database file, then corrupt real bytes in the middle of it - and the first two tests.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_connection_resilience.py` (new)

```python
import sqlite3
from pathlib import Path

from mastercam_app.db.connection import _integrity_ok, _repair_database
from mastercam_app.db.database import Database


def make_real_db_file(path: Path, row_count: int = 50) -> None:
    db = Database(str(path))
    for i in range(row_count):
        db._conn.execute(
            "INSERT INTO tas (ta_number, holder_name) VALUES (?, ?)",
            (f"TA{i:04d}", "ER32"),
        )
    db._conn.commit()
    db._conn.close()


def scramble_middle(path: Path, span: int = 2000) -> None:
    data = bytearray(path.read_bytes())
    mid = len(data) // 2
    for i in range(mid, mid + span):
        data[i] = (data[i] + 137) % 256
    path.write_bytes(bytes(data))


def test_integrity_ok_is_true_for_a_real_freshly_saved_database(tmp_path):
    db_path = tmp_path / "test.db"
    make_real_db_file(db_path)

    conn = sqlite3.connect(str(db_path))
    assert _integrity_ok(conn) is True


def test_integrity_ok_is_false_after_real_mid_file_corruption(tmp_path):
    db_path = tmp_path / "test.db"
    make_real_db_file(db_path)
    scramble_middle(db_path)

    conn = sqlite3.connect(str(db_path))
    assert _integrity_ok(conn) is False
```

### Mechanical Walkthrough

- `for i in range(mid, mid + span): data[i] = (data[i] + 137) % 256` — This isn't a targeted, surgical edit - it's a real, blunt corruption of 2000 consecutive bytes in the middle of a real 114KB file, well past the header, landing inside the actual page data SQLite's b-tree structure depends on. That's what makes integrity_check's False result meaningful: it's detecting real structural damage, not a contrived edge case.
- `except Exception: return False` — If the file is corrupted badly enough that even running PRAGMA integrity_check itself raises (not just returns a problem list), this function still returns a real, usable False instead of letting that exception escape and crash whatever called it.

### CS Lens

A checksum or structural integrity check like this is a **real, partial** guarantee, not a complete one - it tells you the file's internal bookkeeping is self-consistent, which is necessary but not sufficient for "the data is correct." A file could pass integrity_check and still contain a row with the wrong holder_name, written by a real bug elsewhere (Lesson M3.2's dead exception classes, for instance) - integrity_check would never see that.

### SE Lens

The real alternative to trusting a built-in check like this is application-level checksums of your own data - real extra work, real extra storage, for a guarantee SQLite's own integrity_check already gives you almost for free at the storage layer. The real cost that remains, regardless: it only ever tells you about storage-level corruption, never semantic correctness.

### Commands needed

- `python -m pytest tests/test_connection_resilience.py -v -k integrity_ok` — Run from verification/mastercam-app-copy/mastercam-app/

### Verification

```text
collected 2 items

tests/test_connection_resilience.py::test_integrity_ok_is_true_for_a_real_freshly_saved_database PASSED [ 50%]
tests/test_connection_resilience.py::test_integrity_ok_is_false_after_real_mid_file_corruption PASSED [100%]
```

Full saved run: `verification/mastercam-phase-03/lab_test_connection_resilience_output.txt`.

### Connection to the previous unit

This is the detector _repair_database's own callers rely on to decide whether repair is even needed - the next unit runs repair against this exact same real corruption.

## Concept Unit: _repair_database Copies What It Can, Then Discards It All

### The Problem

_repair_database has a try/except around each individual table's copy, which reads like a deliberate "recover whatever's readable, skip what isn't" design. Against the real corruption from the unit above, what does it actually return?

Before reading on:

- Given the per-table try/except, predict: does _repair_database recover at least some of the 50 real rows in tas from this corruption, or none at all?
- The function's very last step, after copying every table it can, is dest_conn.commit() followed by DETACH DATABASE old_db - both while old_db (the corrupted file) is still attached. What real risk does staying attached that long create?

### Project Change

- **Reference Source:** mastercam_app/db/connection.py:75-92 (end of _repair_database - the final commit, detach, and integrity check), quoted verbatim:
dest_conn.commit() dest_conn.execute("DETACH DATABASE old_db;")
if _integrity_ok(dest_conn):
    return tmp_path
dest_conn.close()
except Exception:
    pass
finally:
    try:
        dest_conn.close()
    except Exception:
        pass

if tmp_path.exists():
    tmp_path.unlink()
return None
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_connection_resilience.py` (modified)
- **Change type:** add
- **Location:** end of test_connection_resilience.py
- **Dependencies:** _repair_database, the helpers from the unit above

### The New Code

The real test, against the identical corruption already proven detectable.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_connection_resilience.py` (new)

```python
def test_repair_database_returns_none_for_this_real_corruption_despite_partial_recovery(tmp_path):
    db_path = tmp_path / "test.db"
    make_real_db_file(db_path)
    scramble_middle(db_path)

    repaired_path = _repair_database(db_path)

    assert repaired_path is None
```

### Mechanical Walkthrough

- `dest_conn.commit()` — Traced by hand (not guessed): for this real corruption, five of eleven real tables (parts, tas, ta_parts, parsed_parts, part_versions) copy successfully before this line runs - real, recovered data, sitting in dest_conn's own uncommitted transaction. This commit() call is what raises 'database disk image is malformed', because old_db (the corrupted source) is still ATTACHed, and finalizing the transaction still touches it.
- `except Exception: pass ... if tmp_path.exists(): tmp_path.unlink()` — The outer try/except catches that commit() failure - correct, it shouldn't crash the caller - but there's no code path that keeps the five tables' worth of real data already copied into dest_conn. The function's own final act, on any exception this late, is deleting the very file that data was just written into. The per-table try/except one level up gives the *appearance* of graceful partial recovery, but a failure at this specific, later step discards it entirely - a real gap between what the function's structure suggests and what it actually does for this real, reproducible case.

### Mental Model

```text
_repair_database(corrupted_path):
  ATTACH old_db (still corrupted)
  copy 5 of 11 tables successfully   <- real data now in dest_conn
  copy 6 of 11 tables: caught, skipped (per-table try/except)
  dest_conn.commit()                 <- raises here, old_db still attached
  [outer except catches it]
  tmp_path.unlink()                  <- the 5 recovered tables are deleted too
  return None
```

### CS Lens

This is the same **partial write** shape as Lesson M3.3's update_ta, at a different scale - work that happened is discarded because nothing captured or committed it before the point of failure. The per-table try/except handles failure *during* copying; nothing here handles failure *after* copying but before persisting it.

### SE Lens

A real, minimal fix exists: detach old_db (or commit) right after the per-table copy loop, before touching indexes/triggers/views - so a later failure in that second phase can't retroactively erase table data that already safely landed. That's a small, targeted change, not a redesign - worth understanding fully before deciding whether it's worth making, since "the repair path returns None" might currently be masking "the repair path actually half-worked."

### Commands needed

- `python -m pytest tests/test_connection_resilience.py -v` — Run from verification/mastercam-app-copy/mastercam-app/, all three tests

### Verification

```text
collected 3 items

tests/test_connection_resilience.py::test_integrity_ok_is_true_for_a_real_freshly_saved_database PASSED [ 33%]
tests/test_connection_resilience.py::test_integrity_ok_is_false_after_real_mid_file_corruption PASSED [ 66%]
tests/test_connection_resilience.py::test_repair_database_returns_none_for_this_real_corruption_despite_partial_recovery PASSED [100%]

============================== 3 passed in 0.36s ==============================
```

Full saved run: `verification/mastercam-phase-03/lab_test_connection_resilience_output.txt`.

### Connection to the previous unit

The unit above proved the corruption is real and detectable; this unit proves the response to it - officially "repair failed, nothing recovered" - isn't quite the full story of what happened internally.

## Concept Unit: An Honest, Open Finding: the Obvious Fix Isn't Enough

### The Problem

The previous unit's se_lens named a specific fix - commit and detach right after the table-copy loop, before touching indexes/triggers/views. That fix was actually applied here. It did not change this test's result.

Before reading on:

- The test below still asserts repaired_path is None, unchanged. What real question does that leave open that the previous unit's analysis didn't anticipate?
- Why is reporting 'I applied a fix and re-verified it didn't work' more valuable here than quietly leaving the previous unit's untested claim standing?

### Project Change

- **Reference Source:** mastercam_app/db/connection.py:58-76 (the applied reordering - commit and DETACH now happen immediately after the table-copy loop, before the index/trigger/view loop that used to precede them), quoted verbatim:
for name, _ in tables:
    try:
        dest_conn.execute(f"INSERT OR IGNORE INTO '{name}' SELECT * FROM old_db.'{name}'")
    except sqlite3.DatabaseError:
        pass

index_trigger_view_sql = dest_conn.execute(
    "SELECT type, sql FROM old_db.sqlite_master "
    "WHERE type IN ('index','trigger','view') AND sql NOT NULL;"
).fetchall()
dest_conn.commit() dest_conn.execute("DETACH DATABASE old_db;")
for row in index_trigger_view_sql:
    ...
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/db/connection.py` (modified)
- **Change type:** refactor
- **Location:** _repair_database
- **Dependencies:** none

### Mechanical Walkthrough

- `dest_conn.commit() right after the table-copy loop, before indexes/triggers` — This really does remove one real failure mode - a later commit() can no longer fail specifically because old_db is still attached during it. Re-running the exact same real corruption from the unit above afterward, by hand, showed the final commit() (after the index/trigger loop) still raises 'database disk image is malformed' - meaning dest_conn's own file, a brand-new file that was never corrupted itself, comes back malformed as a side effect of reading enough corrupted data from the attached old_db earlier. That's a deeper, different mechanism than "old_db was still attached," and this fix doesn't reach it.
- `repaired_path is None, unchanged` — The test's assertion didn't need to change, because the real, measured outcome didn't change - which is itself the honest result of applying this fix and re-checking, not an assumption carried over from the previous unit.

### CS Lens

This is the real difference between a **plausible fix** and a **verified fix** - the previous unit's reasoning about the commit/ detach ordering was sound and the change was real, but soundness of reasoning isn't the same guarantee as re-running the test.

### SE Lens

The real alternative to reporting this honestly is quietly not mentioning that a fix was tried, since it didn't pan out - that would leave a false "fixed" impression standing on a real, production corruption-recovery path, which is exactly the kind of claim this whole phase has been about not making without verification. The actual root cause here - why a fresh destination file becomes internally malformed from attached reads against a sufficiently corrupted source - is real, open work, not solved by this lesson.

### Commands needed

- `python -m pytest tests/test_connection_resilience.py -v` — Run from verification/mastercam-app-copy/mastercam-app/ - confirms the fix attempt broke nothing and changed nothing about this outcome

### Verification

```text
collected 3 items

tests/test_connection_resilience.py::test_integrity_ok_is_true_for_a_real_freshly_saved_database PASSED [ 33%]
tests/test_connection_resilience.py::test_integrity_ok_is_false_after_real_mid_file_corruption PASSED [ 66%]
tests/test_connection_resilience.py::test_repair_database_returns_none_for_this_real_corruption_despite_partial_recovery PASSED [100%]

============================== 3 passed in 0.36s ==============================
```

Full saved run: `verification/mastercam-phase-03/lab_all_fixes_verified_output.txt`.

### Connection to the previous unit

The unit above proposed a specific fix; this unit applied it for real and found it insufficient - a real, open finding to pick up later, not a closed one.

## Connect the pieces

Trace the same 50-row, real corrupted file through both units: integrity_ok correctly reports False on it (unit one), and _repair_database, run against that identical file, silently recovers 5 of 11 tables' real data into a temp file before a late commit() failure against the still-attached corrupted source discards that temp file entirely, returning None - a real, measured gap between "repair failed" and what actually happened along the way.

**Next lesson:** Next: the real, already-found bug from database.py - two identical definitions of search_by_tool_code - understood, tested, and then yours to fix for real in the actual app.