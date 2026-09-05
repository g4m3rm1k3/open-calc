# Lesson M3.1: A Real Test Against a Real, In-Memory Database

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. All new code in this lesson goes into verification/mastercam-app-copy/mastercam-app/tests/ - not the real mastercam-app/tests/, per this phase's rule.*

**What you will build:** The first real, permanent tests against Database.save_part - proving, not assuming, the two claims the module's own docstring makes about parts: a save creates a real row, and re-uploading the same part number replaces that row instead of creating a second one.

**What you need to know first:** The real schema from the lesson before this one - specifically that parts.partnumber is a PRIMARY KEY.

## Terms used in this lesson

- **In-memory SQLite database** — Passing ':memory:' instead of a real file path to sqlite3.connect creates a real, fully-functional database that exists only in RAM and vanishes when the connection closes - real SQL, zero filesystem risk, and fast enough to create a brand new one per test.
- **Fixture** — A pytest function decorated with @pytest.fixture that a test can request as a parameter - pytest calls it and hands the test the return value. Here, it's what creates a fresh, empty Database for every single test, so tests can't leak state into each other.

## Objects and methods used

- **`Database.save_part`**
  - *What it is:* The method that turns a parsed part dict into real database rows
  - *Implementation:* mastercam_app/db/database.py:431
  - *Its use:* Called once per real XML upload, after Phase M1's parser builds the part dict
  - *Type:* method
  - *Responsibility:* Upsert the parts row, then process every sequence's tool/TA data
  - *Depends on:* self._conn, self._validate_and_upsert_ta
  - *Connects to:* Called from the UI after a successful parse
  - *Shape:* one upsert, then a loop over sequences

## Concept Unit: A Fresh, In-Memory Database Per Test

### The Problem

Testing against the real mastercam.db file (a real, shared network file with real production data) is out of the question. Testing needs a real database that's cheap to create, guaranteed empty, and thrown away automatically after each test.

Before reading on:

- Database(':memory:') is a real, normal instance of Database - what real difference is there between it and Database('mastercam.db'), other than where the file lives?
- If two tests both used the same in-memory database, what real problem could show up in the second test that has nothing to do with a bug in save_part?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:117-119 (Database.__init__), quoted verbatim:
def __init__(self, db_path: str = "mastercam.db"):
    self._path = db_path
    self._conn = sqlite3.connect(db_path, check_same_thread=False)
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_save_part.py` (new)
- **Change type:** add
- **Location:** new test file
- **Dependencies:** pytest, mastercam_app.db.database.Database

### The New Code

The fixture and a helper that builds a minimal, valid part dict - every test in this file will use both.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_save_part.py` (new)

```python
import pytest

from mastercam_app.db.database import Database


@pytest.fixture
def db():
    return Database(":memory:")


def make_part(**overrides):
    part = {
        "partnumber": "P100",
        "rev": "A",
        "description": "Test Bracket",
        "programnumber": "1234",
        "programmer": "MFG",
        "machine": "HAAS-1",
        "sequences": [],
    }
    part.update(overrides)
    return part
```

### Mechanical Walkthrough

- `def db(): return Database(':memory:')` — No yield, no teardown - a plain return is enough, because there's nothing to clean up. The in-memory database and its one open connection are garbage-collected the moment the test function that used it returns; nothing on disk exists to leave behind.
- `def make_part(**overrides): ...; part.update(overrides)` — A test that only cares about rev doesn't need to spell out partnumber/description/programnumber/programmer/machine every time - make_part(rev='B') gets a full, valid part dict with just that one field changed.

### CS Lens

This is **test isolation** - each test getting its own fresh state instead of sharing one - the same principle behind why a unit test shouldn't depend on another test having run first. An in-memory database is what makes real isolation cheap here: no file to delete, no leftover rows to clean up.

### SE Lens

The real alternative is one shared test database file, reset between tests (DELETE FROM every table, or reopen from a fixed seed file). That's what you'd need if the real code under test required a real file on disk. Here it doesn't - Database takes any path string - so the simpler, faster in-memory version has no real cost, only benefit.

### Commands needed

- `python -m pytest tests/test_database_save_part.py -v` — Run from verification/mastercam-app-copy/mastercam-app/

### Verification

```text
collected 2 items

tests/test_database_save_part.py::test_save_part_inserts_a_real_row_with_no_validation_warnings PASSED [ 50%]
tests/test_database_save_part.py::test_save_part_twice_replaces_the_row_instead_of_duplicating_it PASSED [100%]

============================== 2 passed in 0.10s ==============================
```

Full saved run: `verification/mastercam-phase-03/lab_test_database_save_part_output.txt`.

### Connection to the previous unit

The schema from the previous lesson said partnumber is a PRIMARY KEY; this unit sets up the real, isolated place to actually prove what that means in practice.

## Concept Unit: Proving Both of save_part's Real Claims

### The Problem

The module docstring claims two things about parts: a save creates a row, and re-uploading the same part number replaces it instead of duplicating it. Claims in a docstring aren't proof - only a real, executed test is.

Before reading on:

- If save_part used a plain INSERT instead of ON CONFLICT DO UPDATE, what real exception would the second test below hit, and on which line?
- The second test checks len(rows) == 1 before checking rev == 'B' - why does the row count matter as a separate assertion from the value being right?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:441-462 (Database.save_part, the upsert), quoted verbatim:
self._conn.execute(
    """INSERT INTO parts
        (partnumber, rev, description, programnumber,
            programmer, machine, uploaded_at)
    VALUES (?,?,?,?,?,?,?)
    ON CONFLICT(partnumber) DO UPDATE SET
        rev           = excluded.rev,
        description   = excluded.description,
        programnumber = excluded.programnumber,
        programmer    = excluded.programmer,
        machine       = excluded.machine,
        uploaded_at   = excluded.uploaded_at""",
    (
        partnumber,
        part_dict.get("rev", ""),
        part_dict.get("description", ""),
        part_dict.get("programnumber", ""),
        part_dict.get("programmer", ""),
        machine,
        now,
    )
)
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_save_part.py` (modified)
- **Change type:** add
- **Location:** end of test_database_save_part.py
- **Dependencies:** the db fixture and make_part helper from the unit above

### The New Code

The two real tests, using the fixture and helper already in the file.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_database_save_part.py` (new)

```python
def test_save_part_inserts_a_real_row_with_no_validation_warnings(db):
    warnings = db.save_part(make_part())

    assert warnings == []
    row = db._conn.execute(
        "SELECT * FROM parts WHERE partnumber = ?", ("P100",)
    ).fetchone()
    assert row["partnumber"] == "P100"
    assert row["rev"] == "A"
    assert row["description"] == "Test Bracket"


def test_save_part_twice_replaces_the_row_instead_of_duplicating_it(db):
    db.save_part(make_part(rev="A", description="First"))
    db.save_part(make_part(rev="B", description="Second"))

    rows = db._conn.execute(
        "SELECT * FROM parts WHERE partnumber = ?", ("P100",)
    ).fetchall()
    assert len(rows) == 1
    assert rows[0]["rev"] == "B"
    assert rows[0]["description"] == "Second"
```

### Mechanical Walkthrough

- `ON CONFLICT(partnumber) DO UPDATE SET rev = excluded.rev, ...` — excluded is a real, special SQLite name inside an ON CONFLICT clause - it refers to the row that was *about to be inserted* before the conflict happened. So excluded.rev means "the rev value from this save_part call," not the row already in the table - this is what makes the second test's rev == 'B' true.
- `assert len(rows) == 1` — This assertion is what actually tests the upsert - without it, a broken save_part that used a plain INSERT (raising nothing visible here because sqlite3 wouldn't raise until the second insert - which it would, on the PRIMARY KEY) would still be caught, but for the wrong reason. This test is checking the *design intent* (one row, always), not just "did it not crash."

### CS Lens

ON CONFLICT ... DO UPDATE is **idempotent by construction** for the identity column - calling save_part with the same partnumber any number of times always leaves exactly one row for it. That's a stronger guarantee than "insert, and hope nothing else already inserted it."

### SE Lens

The real alternative is check-then-act: SELECT to see if the row exists, then either INSERT or UPDATE based on the answer. That's two round-trips instead of one, and worse, it's not safe if two processes could race between the SELECT and the write - the upsert is a single, atomic statement, so there's no window for another write to land in between.

### Commands needed

- `python -m pytest tests/test_database_save_part.py -v` — Run from verification/mastercam-app-copy/mastercam-app/, both tests

### Verification

```text
collected 2 items

tests/test_database_save_part.py::test_save_part_inserts_a_real_row_with_no_validation_warnings PASSED [ 50%]
tests/test_database_save_part.py::test_save_part_twice_replaces_the_row_instead_of_duplicating_it PASSED [100%]

============================== 2 passed in 0.10s ==============================
```

Full saved run: `verification/mastercam-phase-03/lab_test_database_save_part_output.txt`.

### Connection to the previous unit

The fixture and helper from the unit above exist entirely so these two tests could be this short - no setup logic mixed in with the actual assertions being made.

## Connect the pieces

Trace partnumber "P100" through both units: the db fixture creates a brand-new, empty database; make_part(rev="A") then make_part(rev="B") both target "P100"; the ON CONFLICT clause is what turns "insert twice" into "one row, latest values" - proven by len(rows) == 1 and rev == "B" both passing for real.

**Next lesson:** Next: what save_part does with a sequence's tool data - the TA/NA resolution logic, the densest real logic in this whole file.