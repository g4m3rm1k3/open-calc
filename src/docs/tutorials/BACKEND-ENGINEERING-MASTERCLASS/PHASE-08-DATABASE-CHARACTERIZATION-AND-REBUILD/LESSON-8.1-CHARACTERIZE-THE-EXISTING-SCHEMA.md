# Lesson 8.1: Characterize the Existing Schema

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, permanent test file, `backend/tests/test_schema_characterization.py`, pinning five real, current facts about this project's own real `Machine`/`MachineGroup` schema before any rebuild work touches it: its real, existing table shape (read directly from `sqlite_master`, not assumed from the model source); its real, working `relationship`; its real, enforced `NOT NULL` constraint; three real, applied column defaults; and `Machine.to_dict()`'s own real, current serialization shape. The transferable problem: a rebuild can only prove it preserved required behavior if that behavior was pinned, in a real, running test, before the rebuild started - this lesson builds that pin, not the rebuild itself.

**What you need to know first:** What a characterization test is - a real test asserting what code actually does, not what it should do; every real SQLAlchemy construct this schema's own model file uses (`db.Column`, `db.relationship`, `db.ForeignKey`, `to_dict`); what a real pytest fixture is.

## Terms used in this lesson

- **characterization test** — A real, permanent test asserting what a real, existing system actually does right now, run against the real system to find out - not a test derived from a specification of what it should do. It exists so a later rebuild has a real, objective, already-passing contract to keep passing, rather than relying on memory or documentation of what the old behavior supposedly was.

## Objects and methods used

- **`sqlite_master (queried via db.session.execute)`**
  - *What it is:* SQLite's own real, built-in table, recording every other real table's name and the literal, real DDL text SQLite used to create it.
  - *Implementation:* `db.session.execute(text("SELECT sql FROM sqlite_master WHERE type='table' AND name='machines'")).fetchone()` returns one real row whose single real column, `sql`, is the exact, literal `CREATE TABLE` statement SQLite itself stored.
  - *Its use:* This lesson's own first unit queries this directly, three separate times, to assert real, specific substrings actually appear in that real DDL text - the real columns, the real primary key, and the real foreign key.
  - *Type:* A real, built-in SQLite table, queried through SQLAlchemy's own real `text()`/`db.session.execute`.
  - *Responsibility:* Recording the real, authoritative DDL for every real table - the same real source this project's own database would use to recreate its schema from scratch.
  - *Depends on:* A real, live SQLite connection - `db.session`, already bound to this app's own configured database.
  - *Connects to:* Nothing else in this project's own real code queries it directly; this lesson's own tests are the first real, permanent code to do so.
  - *Shape:* Queried like any real table; its own real `sql` column holds one real string per real table, or `NULL` for tables SQLite creates implicitly.

- **`pytest.raises`**
  - *What it is:* A real, top-level context-manager function from pytest itself, asserting that the code inside its own `with` block raises a real, specific exception.
  - *Implementation:* `with pytest.raises(IntegrityError): db.session.commit()` - the real test only passes if a real `IntegrityError` is actually raised inside the block; if none is raised, or a different real exception type is, the real test fails.
  - *Its use:* This lesson's own third unit uses this once, to assert this project's own real `NOT NULL` constraint on `Machine.name` genuinely still rejects a missing value.
  - *Type:* A real context-manager function in the `pytest` package.
  - *Responsibility:* Turning "this code is expected to raise X" into a real, direct assertion, rather than a manual `try`/`except`/`fail()` block written out by hand.
  - *Depends on:* A real, specific exception class to check for (`IntegrityError`, imported from `sqlalchemy.exc`).
  - *Connects to:* Wraps the identical real `db.session.commit()` call this lesson's own other units already use, here expecting it to fail rather than succeed.
  - *Shape:* Takes a real exception class in; the `with` block either raises that real exception (test continues) or doesn't (test fails).

- **`Session (.add / .commit)`**
  - *What it is:* The real, live session object this project's own `db` extension exposes as `db.session`, and two of its real methods every test in this lesson's own file uses to build the real rows each real assertion checks.
  - *Implementation:* `db.session.add(instance)` registers one real, new object as pending; `db.session.commit()` flushes every real pending change into real SQL and finalizes the real transaction.
  - *Its use:* Every real test function in this lesson's own file calls this identical real pair at least once, to persist the real `Machine`/ `MachineGroup` rows each test then makes a real assertion about.
  - *Type:* A real instance of SQLAlchemy's `Session` class (`db.session`).
  - *Responsibility:* Staging a real, new object as pending, then, on `commit`, compiling and sending the real SQL that actually persists it.
  - *Depends on:* A real, open connection from this app's own real `Engine`.
  - *Connects to:* Every real assertion in this lesson's own tests checks state that only exists because this identical pair already ran.
  - *Shape:* `.add` takes a real object in, returns nothing; `.commit` takes nothing, returns nothing, but has the real, observable side effect of persisting every pending change (or raising a real `IntegrityError`, as this lesson's own third unit proves).

## Concept Unit: Characterizing Existing Tables - the Real DDL, Not the Model Source

### The Problem

`backend/app/models/machine.py`'s own real `db.Column` declarations describe what `Machine`'s table should compile into. A characterization test that only reads the model source would be checking the model against itself. What real, independent source can a permanent test check the schema against instead?

Before reading on:

- If a future rebuild changed `Machine`'s own real `db.Column` declarations, but this hypothetical test also just re-read those same declarations to check itself, would it ever be possible for that test to fail? What does that tell you about whether it would actually be characterizing anything?
- `sqlite_master` is a real, built-in table SQLite itself maintains, entirely independent of this project's own Python model source. Given that, what would a real test reading `sqlite_master` directly actually be proving that reading `machine.py` again wouldn't?

### Project Change

- **Reference Source:** Real specimen: `backend/app/models/machine.py:11-86` (`MachineGroup`, `Machine`), read again this session - the real model whose real, compiled DDL this unit's own tests check independently.
- **Files affected:** `backend/tests/test_schema_characterization.py` (new)
- **Change type:** add
- **Location:** N/A - a new, permanent test file; no existing project structure to place it within.
- **Dependencies:** This project's own real `Machine`/`MachineGroup` models; a real, running pytest, already configured for this project (`backend/tests/test_health.py` already establishes the real `app` fixture pattern this file reuses).

### The New Code

The real file's own header, its shared `app` fixture, and its first real test class, checking the real, current DDL directly:

**File:** `backend/tests/test_schema_characterization.py` (new)

```python
"""
Characterization tests for this project's own real, existing database
schema (backend/app/models/), pinning current, real behavior before any
Phase 8 rebuild touches it - not what the schema should do, what it
actually does, verified against a real, running SQLite database.

Covers, using Machine/MachineGroup (backend/app/models/machine.py) as
the representative real model pair: existing tables (real columns and
types, read back from sqlite_master), relationships (real, two-
directional navigation), constraints (real NOT NULL enforcement),
defaults (real, applied default values), and serialization
(Machine.to_dict()'s own real, current shape).
"""
import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app import create_app, db
from app.models.machine import Machine, MachineGroup


@pytest.fixture
def app():
    application = create_app("testing")
    with application.app_context():
        yield application


class TestExistingTables:
    """The real, current DDL SQLite itself stores for machines/machine_groups."""

    def test_machines_table_has_the_real_current_columns(self, app):
        row = db.session.execute(
            text("SELECT sql FROM sqlite_master WHERE type='table' AND name='machines'")
        ).fetchone()
        ddl = row[0]
        for real_column in ("id", "name", "category", "sub_type", "group_id", "status"):
            assert real_column in ddl

    def test_machines_table_has_a_real_primary_key(self, app):
        row = db.session.execute(
            text("SELECT sql FROM sqlite_master WHERE type='table' AND name='machines'")
        ).fetchone()
        assert "PRIMARY KEY (id)" in row[0]

    def test_machines_table_has_a_real_foreign_key_to_machine_groups(self, app):
        row = db.session.execute(
            text("SELECT sql FROM sqlite_master WHERE type='table' AND name='machines'")
        ).fetchone()
        assert "FOREIGN KEY(group_id) REFERENCES machine_groups (id)" in row[0]
```

### Mechanical Walkthrough

- `@pytest.fixture def app(): application = create_app("testing"); with application.app_context(): yield application` — A real, shared pytest fixture, providing a real, fresh `Flask` app (and its own real `app_context`) to every real test function in this file that requests it by name - the identical real pattern `test_health.py` already established for this project's own test suite.
- `db.session.execute(text("SELECT sql FROM sqlite_master WHERE type='table' AND name='machines'")).fetchone()` — Queries SQLite's own real, built-in metadata table directly - a real source of truth entirely independent of this project's own Python model source, since a future rebuild could change `machine.py` without touching this query at all.
- `for real_column in (...): assert real_column in ddl` — Asserts every real, currently-expected column name literally appears in the real, returned DDL text - a real, direct check against the actual schema, not an assumption about what the model file currently declares.
- `assert "PRIMARY KEY (id)" in row[0] / assert "FOREIGN KEY(group_id) REFERENCES machine_groups (id)" in row[0]` — Two more real, independent assertions against the identical real DDL text, pinning the real primary key and real foreign key clauses specifically - both real, structural facts a rebuild must preserve, not just the bare list of column names.

### CS Lens

This is a **golden master**: a real, current snapshot of actual behavior, captured and pinned as the thing future changes are checked against, rather than a specification of intended behavior written in advance. Also recognized in: a real visual regression test comparing a rendered screenshot against a previously-approved one, pixel for pixel; a real API contract test recorded from an actual, live response rather than written from documentation; and, in this project's own domain, this project's own real `verification/` folder's own saved `_output.txt` files, pinning real, actually-observed output the identical way, just outside the permanent test suite.

### SE Lens

The design principle is that a characterization test checks an independent, real source (`sqlite_master`) rather than the same source a rebuild would also change (`machine.py`'s own declarations) - so the test can actually fail when real behavior changes, instead of silently passing because it was checking itself. The real alternative not chosen here - asserting against `Machine.__table__.columns` directly, SQLAlchemy's own in-memory representation of the model - would be simpler to write and faster to run; the honest cost of that real alternative: it would still be checking SQLAlchemy's own compiled understanding of the model, one step closer to the model source than the real, independent database itself, the same real distinction the previous phase's own real DDL-reading labs were built around.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_schema_characterization.py -v` — Runs this real, permanent test file with pytest, from the repository root, showing each real test function's own pass/fail individually.

### Verification

```text
backend/tests/test_schema_characterization.py::TestExistingTables::test_machines_table_has_the_real_current_columns PASSED
backend/tests/test_schema_characterization.py::TestExistingTables::test_machines_table_has_a_real_primary_key PASSED
backend/tests/test_schema_characterization.py::TestExistingTables::test_machines_table_has_a_real_foreign_key_to_machine_groups PASSED
```

Full saved run: `N/A - real, permanent test file; run directly via pytest, not a saved verification/ output pair.`.

### Connection to the previous unit

This lesson's own first unit; it establishes the real file and its shared fixture every later unit in this lesson adds to.

## Concept Unit: Characterizing Relationships - Both Real Directions, Pinned

### The Problem

`MachineGroup.machines`/`Machine.group` already work, right now, in the real, running application. What real, permanent test proves both real directions still work, rather than trusting that a future rebuild won't quietly break one of them?

Before reading on:

- `group.machines.all() == [m]` compares a real, executed query result against a real, literal Python list. Given `m` is the identical real object already created earlier in the same real test, what would have to go wrong in a future rebuild for this real assertion to start failing?
- `m.group is group` uses real Python identity (`is`), not equality (`==`). Given both `m` and `group` are real, already-loaded objects in the identical real session, what would you expect to happen if `m.group` triggered a completely new, separate real query instead of returning the identical, already-loaded object?

### Project Change

- **Reference Source:** Real specimen: `backend/app/models/machine.py:27` (`machines = db.relationship('Machine', backref='group', lazy='dynamic')`), read again this session.
- **Files affected:** `backend/tests/test_schema_characterization.py` (modified)
- **Change type:** add
- **Location:** Appended directly after the `TestExistingTables` class already added in this lesson's first unit.
- **Dependencies:** The identical real `app` fixture already defined earlier in this same file.

### The New Code

A real, second test class, pinning both real directions of the existing relationship:

**File:** `backend/tests/test_schema_characterization.py` (already exists — read-only, nothing to type)

```python
class TestRelationships:
    """MachineGroup.machines = db.relationship('Machine', backref='group', lazy='dynamic')."""

    def test_group_machines_returns_every_real_related_machine(self, app):
        group = MachineGroup(id="G-CHAR-001", name="Mill Room", type="location")
        db.session.add(group)
        db.session.commit()
        m = Machine(id="M-CHAR-001", name="Haas VF-2", category="mill", sub_type="3_axis", group_id="G-CHAR-001")
        db.session.add(m)
        db.session.commit()

        assert group.machines.all() == [m]

    def test_machine_group_backref_navigates_the_opposite_direction(self, app):
        group = MachineGroup(id="G-CHAR-002", name="Lathe Room", type="location")
        db.session.add(group)
        db.session.commit()
        m = Machine(id="M-CHAR-002", name="Okuma Genos", category="lathe", sub_type="single_turret", group_id="G-CHAR-002")
        db.session.add(m)
        db.session.commit()

        assert m.group is group
```

### Mechanical Walkthrough

- `assert group.machines.all() == [m]` — A real, direct equality check between the real query's own executed result and a real, literal one-element list - a future rebuild that stops populating `group.machines` correctly, or returns the real rows in a different order, fails this real assertion immediately.
- `assert m.group is group` — Uses real Python identity, not equality, specifically because both objects already live in the identical real session's own identity map - a genuinely different, real object here (even one that happened to be equal) would mean the backref stopped returning the session's own already-loaded instance.

### CS Lens

This is **regression pinning** applied specifically to a real relationship: capturing the real, current bidirectional behavior as an assertion, so any future change that silently breaks either real direction fails a real test immediately, rather than surfacing as a real bug discovered later, in production. Also recognized in: a real compiler's own test suite pinning that a specific real syntax still parses into the identical real AST shape release after release; a real API client library's own tests pinning that a specific real response shape still deserializes correctly; and, in this project's own domain, this exact real file's own `TestExistingTables` class, pinning the identical kind of "still works, still shaped this way" fact one layer down, at the DDL level instead of the relationship level.

### SE Lens

The design principle is that a relationship's own real, bidirectional behavior is exactly the kind of thing worth pinning explicitly, because it depends on real, non-obvious configuration (`backref`, `lazy='dynamic'`) that a rebuild could change without anyone noticing until something downstream breaks. The real alternative not chosen here - trusting that any rebuild "obviously" keeps `Machine.group` working, with no permanent test checking it - costs nothing until the day it actually breaks; the honest cost already paid by choosing to write this real test instead: two more real assertions a future rebuild has to satisfy, on top of everything `TestExistingTables` already requires.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_schema_characterization.py -v` — Identical real command as the previous unit; now also runs this unit's own two new real tests.

### Verification

```text
backend/tests/test_schema_characterization.py::TestRelationships::test_group_machines_returns_every_real_related_machine PASSED
backend/tests/test_schema_characterization.py::TestRelationships::test_machine_group_backref_navigates_the_opposite_direction PASSED
```

Full saved run: `N/A - real, permanent test file; run directly via pytest, not a saved verification/ output pair.`.

### Connection to the previous unit

The previous unit pinned the real schema's own DDL shape; this unit pins the real, bidirectional behavior built on top of it.

## Concept Unit: Characterizing Constraints and Defaults - What the Database Enforces Without Being Asked

### The Problem

`Machine.name` is declared `nullable=False`, and `Machine.axes` defaults to `3` when left unset - real behavior that happens automatically, with no application code deciding it at the moment a `Machine` is created. What real, permanent test proves both of these keep happening, without a human re-reading `machine.py` to check?

Before reading on:

- `pytest.raises(IntegrityError)` only passes if the wrapped code genuinely raises that real exception. If a future rebuild accidentally dropped the real `nullable=False` constraint from `Machine.name`, what would happen to this specific real test - would it still pass, or would it fail, and why?
- `Machine(id=..., name=..., category=..., sub_type=...)` never mentions `axes` at all. Given that, what real, specific mechanism is actually responsible for `m.axes` being `3` once the row is committed?

### Project Change

- **Reference Source:** Real specimen: `backend/app/models/machine.py:50` (`name = db.Column(db.String(100), nullable=False)`) and `:63` (`axes = db.Column(db.Integer, default=3)`), read again this session.
- **Files affected:** `backend/tests/test_schema_characterization.py` (modified)
- **Change type:** add
- **Location:** Appended directly after the `TestRelationships` class already added in this lesson's second unit.
- **Dependencies:** The identical real `app` fixture and real `pytest.raises` mechanism already introduced earlier in this same file/lesson.

### The New Code

Two more real test classes - one proving the real `NOT NULL` constraint still fires, one proving three real, current default values still apply:

**File:** `backend/tests/test_schema_characterization.py` (already exists — read-only, nothing to type)

```python
class TestConstraints:
    """Real, current NOT NULL enforcement on machines.name."""

    def test_missing_name_raises_a_real_integrity_error(self, app):
        m = Machine(id="M-CHAR-003", category="mill", sub_type="3_axis")
        db.session.add(m)
        with pytest.raises(IntegrityError):
            db.session.commit()
        db.session.rollback()


class TestDefaults:
    """Real, current default values applied when a column is left unset."""

    def test_axes_defaults_to_3(self, app):
        m = Machine(id="M-CHAR-004", name="Test Mill", category="mill", sub_type="3_axis")
        db.session.add(m)
        db.session.commit()
        assert m.axes == 3

    def test_status_defaults_to_available(self, app):
        m = Machine(id="M-CHAR-005", name="Test Mill 2", category="mill", sub_type="3_axis")
        db.session.add(m)
        db.session.commit()
        assert m.status == "available"

    def test_has_tool_changer_defaults_to_false(self, app):
        m = Machine(id="M-CHAR-006", name="Test Mill 3", category="mill", sub_type="3_axis")
        db.session.add(m)
        db.session.commit()
        assert m.has_tool_changer is False
```

### Mechanical Walkthrough

- `with pytest.raises(IntegrityError): db.session.commit()` — Asserts that committing a `Machine` with no real `name` set genuinely raises a real `IntegrityError` - proof the database itself, not application code, is what's actually enforcing this real constraint.
- `db.session.rollback()` — Recovers the real session immediately after the real, expected failure - the identical real necessity proven directly in the previous phase's own transaction-recovery work, needed here so this test doesn't leave the session unusable for whatever real test pytest runs next.
- `assert m.axes == 3 / assert m.status == "available" / assert m.has_tool_changer is False` — Three separate, real assertions, each pinning one real column's own current default value - proof these values come from the real `db.Column(..., default=...)` declarations themselves, applied automatically at commit time, never passed explicitly by any of these three real tests.

### CS Lens

This is **implicit behavior made explicit**: a real default value or a real constraint fires automatically, with no calling code deciding to invoke it - characterizing it means writing a real test specifically to surface behavior that would otherwise stay invisible until something depended on it and broke. Also recognized in: a real compiler's own implicit type coercion rules, invisible until a test deliberately exercises the exact case that triggers one; a real framework's own implicit request timeout, invisible until a real test forces a slow response; and, in this project's own domain, this project's own real, already-known finding that `PRAGMA foreign_keys` is never turned on anywhere in this app's own real runtime code - an implicit, real absence, the identical kind of fact worth characterizing explicitly rather than assuming.

### SE Lens

The design principle is that a real default or constraint is part of a table's own real, observable contract, exactly as much as its column names are - and deserves the identical, explicit pinning `TestExistingTables` already gave the schema's own shape. The real alternative not chosen here - trusting that "the model obviously still has `nullable=False`" without a real test - costs nothing until a future rebuild's own refactor accidentally drops it; the honest cost already paid by writing these five real tests instead: any future change to `Machine`'s own real defaults or constraints now has to either preserve this exact real behavior or consciously update a real, visible test, never drift silently.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_schema_characterization.py -v` — Identical real command as the previous two units; now also runs this unit's own four new real tests.

### Verification

```text
backend/tests/test_schema_characterization.py::TestConstraints::test_missing_name_raises_a_real_integrity_error PASSED
backend/tests/test_schema_characterization.py::TestDefaults::test_axes_defaults_to_3 PASSED
backend/tests/test_schema_characterization.py::TestDefaults::test_status_defaults_to_available PASSED
backend/tests/test_schema_characterization.py::TestDefaults::test_has_tool_changer_defaults_to_false PASSED
```

Full saved run: `N/A - real, permanent test file; run directly via pytest, not a saved verification/ output pair.`.

### Connection to the previous unit

The previous unit pinned real, bidirectional relationship behavior; this unit pins two more kinds of real, automatic behavior - what the database refuses, and what it fills in on its own.

## Concept Unit: Characterizing Serialization - What to_dict() Actually Produces, Right Now

### The Problem

`Machine.to_dict()` already renames `sub_type` to `'subType'` and converts every real `datetime` field with `.isoformat()`. What real, permanent test closes this lesson by pinning that exact, current output shape, completing every real dimension this lesson's own title promised?

Before reading on:

- Given the previous phase's own real lab already proved `'sub_type' in d` is `False` while `'subType' in d` is `True`, what real, permanent test would turn that one-off, already- discarded observation into something a future rebuild is actually held to?
- `d["createdAt"]` is asserted to be a real `str` containing `"T"`, not compared against one specific, exact timestamp string. Given the real value genuinely changes every time this test runs (it's the real commit time), what would a test asserting an exact string literal have gotten wrong?

### Project Change

- **Reference Source:** Real specimen: `backend/app/models/machine.py:88-113` (`Machine.to_dict`), read again this session.
- **Files affected:** `backend/tests/test_schema_characterization.py` (modified)
- **Change type:** add
- **Location:** Appended directly after the `TestDefaults` class already added in this lesson's third unit - the real file's own, final class.
- **Dependencies:** The identical real `app` fixture already defined earlier in this same file.

### The New Code

The real file's own final test class, pinning `to_dict()`'s current, real serialization shape:

**File:** `backend/tests/test_schema_characterization.py` (already exists — read-only, nothing to type)

```python
class TestSerialization:
    """Machine.to_dict()'s own real, current shape."""

    def test_to_dict_renames_sub_type_to_camelCase(self, app):
        m = Machine(id="M-CHAR-007", name="Test Mill 4", category="mill", sub_type="5_axis")
        db.session.add(m)
        db.session.commit()
        d = m.to_dict()
        assert "sub_type" not in d
        assert d["subType"] == "5_axis"

    def test_to_dict_converts_datetimes_to_isoformat_strings(self, app):
        m = Machine(id="M-CHAR-008", name="Test Mill 5", category="mill", sub_type="3_axis")
        db.session.add(m)
        db.session.commit()
        d = m.to_dict()
        assert isinstance(d["createdAt"], str)
        assert "T" in d["createdAt"]
```

### Mechanical Walkthrough

- `assert "sub_type" not in d / assert d["subType"] == "5_axis"` — Two real, paired assertions - the real, snake_case key is asserted absent, and the real, camelCase key is asserted present with the correct real value - pinning both halves of the real rename together, not just one.
- `assert isinstance(d["createdAt"], str) / assert "T" in d["createdAt"]` — Asserts the real *shape* of the value (a real `str`, containing ISO 8601's own real `"T"` date/time separator) rather than one specific, real timestamp - the correct real way to pin a value that's genuinely, legitimately different every time this test runs.

### CS Lens

This is **contract testing at a serialization boundary**: pinning not the internal object's own state, but the exact, real, external shape a consumer on the other side of a boundary actually receives. Also recognized in: a real API consumer's own contract test, pinning the real JSON shape a producer must keep returning; a real file-format parser's own test suite, pinning that a specific real input still decodes into the identical real structure; and, in this project's own domain, this exact lesson's own first unit, pinning the identical kind of external contract one layer earlier - the real DDL a database client sees, instead of the real JSON an API client sees.

### SE Lens

The design principle is that a rebuild is free to change `Machine.to_dict()`'s own internal implementation in any real way it likes, as long as this real, external contract - these exact real keys, these exact real value shapes - keeps holding. The real alternative not chosen here - characterizing serialization by comparing an entire, real dict literal for exact equality - would also work, but the honest cost of that real alternative: it would force a future rebuild's own test update every time any unrelated real field's default value changed, even when the actual behavior this lesson cares about (the rename, the `isoformat` conversion) never changed at all.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_schema_characterization.py -v` — Identical real command as every previous unit in this lesson; now runs the complete, real file - all eleven real tests.

### Verification

```text
backend/tests/test_schema_characterization.py::TestExistingTables::test_machines_table_has_the_real_current_columns PASSED [  9%]
backend/tests/test_schema_characterization.py::TestExistingTables::test_machines_table_has_a_real_primary_key PASSED [ 18%]
backend/tests/test_schema_characterization.py::TestExistingTables::test_machines_table_has_a_real_foreign_key_to_machine_groups PASSED [ 27%]
backend/tests/test_schema_characterization.py::TestRelationships::test_group_machines_returns_every_real_related_machine PASSED [ 36%]
backend/tests/test_schema_characterization.py::TestRelationships::test_machine_group_backref_navigates_the_opposite_direction PASSED [ 45%]
backend/tests/test_schema_characterization.py::TestConstraints::test_missing_name_raises_a_real_integrity_error PASSED [ 54%]
backend/tests/test_schema_characterization.py::TestDefaults::test_axes_defaults_to_3 PASSED [ 63%]
backend/tests/test_schema_characterization.py::TestDefaults::test_status_defaults_to_available PASSED [ 72%]
backend/tests/test_schema_characterization.py::TestDefaults::test_has_tool_changer_defaults_to_false PASSED [ 81%]
backend/tests/test_schema_characterization.py::TestSerialization::test_to_dict_renames_sub_type_to_camelCase PASSED [ 90%]
backend/tests/test_schema_characterization.py::TestSerialization::test_to_dict_converts_datetimes_to_isoformat_strings PASSED [100%]
======================= 11 passed, 73 warnings in 5.07s =======================
```

Full saved run: `N/A - real, permanent test file; run directly via pytest, not a saved verification/ output pair.`.

### Connection to the previous unit

The previous unit pinned constraints and defaults; this unit closes the lesson's own five-part list with the last real dimension - serialization - completing a real, permanent, already-passing contract for every rebuild in this phase to keep satisfying.

## Connect the pieces

One real, permanent file, `backend/tests/test_schema_characterization.py`, built up across four real test classes: `TestExistingTables` queries `sqlite_master` directly, independent of the model source, to pin the real DDL - real columns, a real primary key, a real foreign key; `TestRelationships` pins both real directions of `MachineGroup.machines`/`Machine.group`; `TestConstraints` pins the real `NOT NULL` failure on a missing `name`, and `TestDefaults` pins three real, automatic default values; `TestSerialization` closes it by pinning `to_dict()`'s own real key-renaming and `datetime`-to-`isoformat` conversion. All eleven real tests pass, right now, against the real, current, unmodified schema - the real, concrete contract every later rebuild lesson in this same curriculum now has to keep satisfying, not a description of it.

**Next lesson:** This lesson pinned real, current behavior with nothing rebuilt yet. Next, this curriculum characterizes one real, complete route - `/api/parts` - the same way, then actually rebuilds its own persistence boundary for the first time in this phase.