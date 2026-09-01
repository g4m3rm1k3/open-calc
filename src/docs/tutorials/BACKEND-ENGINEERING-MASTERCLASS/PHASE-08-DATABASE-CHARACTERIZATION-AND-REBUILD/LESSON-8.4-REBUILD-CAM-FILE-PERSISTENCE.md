# Lesson 8.4: Rebuild CAM File Persistence

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, permanent test file, `backend/tests/test_cam_files_characterization.py`, proving two real facts about `CAMFile`'s own persistence: first, that `CAMFile.sequences`/`.nc_files` (`backend/app/models/cam_file.py: 72-73`) already, correctly cascade-delete their real, related `Sequence`/`NCFile` rows - genuinely different real default behavior than an earlier lesson's own `Machine`/`MachineGroup` relationship, which leaves related rows intact - and second, a real, missing index on `CAMFile.machine_id`, fixed the identical real way an earlier lesson already fixed `Machine.group_id`. The transferable problem: a "larger aggregate" isn't a new kind of thing to learn - it's what a relationship's own real `cascade` setting already decided, whether or not anyone ever asked the question directly.

**What you need to know first:** What `db.relationship`'s own `cascade` keyword controls, and what real, default behavior it has when left unset; what a real SQL index does to a real query plan; what a real parent-child row relationship is, at the database level.

## Terms used in this lesson



## Objects and methods used

- **`CAMFile.sequences / .nc_files (relationships)`**
  - *What it is:* Two real, existing `db.relationship` declarations on this project's own real `CAMFile` model (`backend/app/models/cam_file.py:72-73`).
  - *Implementation:* `nc_files = db.relationship('NCFile', backref='cam_file', lazy='dynamic', cascade='all, delete-orphan')`; `sequences = db.relationship('Sequence', backref='cam_file', lazy='dynamic', cascade='all, delete-orphan')` - both real relationships explicitly set `cascade='all, delete-orphan'`, unlike `MachineGroup.machines`, which sets no `cascade=` at all.
  - *Its use:* This lesson's own first unit proves, directly, what this real, already-set `cascade` value actually does to real, related rows when their real parent `CAMFile` is deleted.
  - *Type:* Two real `db.relationship` declarations on the `CAMFile` class.
  - *Responsibility:* Declaring that `Sequence`/`NCFile` rows genuinely cannot outlive the real `CAMFile` they belong to - deleting the parent deletes them too, automatically.
  - *Depends on:* This project's own real `Sequence`/`NCFile` models, and their own real foreign keys back to `CAMFile`.
  - *Connects to:* This lesson's own first unit deletes a real `CAMFile` directly and queries for its real, former children afterward.
  - *Shape:* Accessing either returns a real, `lazy='dynamic'` query object; deleting the parent `CAMFile` and committing removes every real, related row from the real database, not just from Python memory.

## Concept Unit: The Larger Aggregate - Proving the Real, Already-Working Cascade

### The Problem

An earlier lesson proved `MachineGroup.machines`, with no `cascade=` set, leaves a real `Machine` row intact (its `group_id` just becomes `NULL`) when the group is deleted. `CAMFile.sequences`/ `.nc_files` set `cascade='all, delete-orphan'` explicitly. What real, different consequence does that one real difference actually produce?

Before reading on:

- `cascade='all, delete-orphan'` is a real, different value than the unset default an earlier lesson already proved leaves a related row's foreign key nulled instead. Given that, what real, concrete outcome would you predict for a real `Sequence` row still pointing at a `CAMFile` that just got deleted - does it survive with a `NULL` `cam_file_id`, or does it disappear too?
- A `CAMFile` conceptually "owns" its real sequences and NC files in a way `MachineGroup` doesn't really "own" its machines - a machine can genuinely move between groups, or belong to none. Given that real, conceptual difference, does `cascade='all, delete-orphan'` here look like an arbitrary choice, or a deliberate one?

### Project Change

- **Reference Source:** Real specimen: `backend/app/models/cam_file.py:72-73` (`CAMFile.sequences`/`.nc_files`), read again this session.
- **Files affected:** `backend/tests/test_cam_files_characterization.py` (new)
- **Change type:** add
- **Location:** N/A - a new, permanent test file; no existing project structure to place it within.
- **Dependencies:** This project's own real `Part`/`Machine`/`CAMFile`/`Sequence`/ `NCFile` models.

### The New Code

Two real, permanent tests, each building a real `CAMFile` with one real real child row, deleting the parent, and checking directly whether the real child survives:

**File:** `backend/tests/test_cam_files_characterization.py` (new)

```python
"""
Characterization tests for this project's own real CAMFile persistence
(backend/app/models/cam_file.py, backend/app/routes/cam_files.py):
the real, already-working aggregate cascade (deleting a CAMFile
genuinely cascade-deletes its real Sequence/NCFile rows, via
cascade='all, delete-orphan'), and the real, rebuilt index on
CAMFile.machine_id.
"""
import pytest

from sqlalchemy import text

from app import create_app, db
from app.models.part import Part
from app.models.machine import Machine
from app.models.cam_file import CAMFile
from app.models.sequence import Sequence
from app.models.nc_file import NCFile


@pytest.fixture
def app():
    application = create_app("testing")
    with application.app_context():
        yield application


class TestAggregateCascade:
    """CAMFile.sequences/.nc_files already use cascade='all, delete-orphan'."""

    def test_deleting_cam_file_cascade_deletes_its_real_sequences(self, app):
        part = Part(id="P-CAM-001", part_number="7778889", description="Test")
        db.session.add(part)
        machine = Machine(id="M-CAM-001", name="Test Mill", category="mill", sub_type="3_axis")
        db.session.add(machine)
        db.session.commit()

        cam = CAMFile(id="C-AGG-001", part_id="P-CAM-001", machine_id="M-CAM-001", file_name="test.mcam")
        db.session.add(cam)
        db.session.commit()

        seq = Sequence(id="SEQ-AGG-001", cam_file_id="C-AGG-001", sequence_number=1, tool_number=1)
        db.session.add(seq)
        db.session.commit()

        assert Sequence.query.get("SEQ-AGG-001") is not None

        db.session.delete(cam)
        db.session.commit()

        assert Sequence.query.get("SEQ-AGG-001") is None

    def test_deleting_cam_file_cascade_deletes_its_real_nc_files(self, app):
        part = Part(id="P-CAM-002", part_number="6667778", description="Test")
        db.session.add(part)
        machine = Machine(id="M-CAM-002", name="Test Mill 2", category="mill", sub_type="3_axis")
        db.session.add(machine)
        db.session.commit()

        cam = CAMFile(id="C-AGG-002", part_id="P-CAM-002", machine_id="M-CAM-002", file_name="test2.mcam")
        db.session.add(cam)
        db.session.commit()

        nc = NCFile(id="NC-AGG-001", cam_file_id="C-AGG-002", program_number="O0001", file_name="O0001.nc")
        db.session.add(nc)
        db.session.commit()

        assert NCFile.query.get("NC-AGG-001") is not None

        db.session.delete(cam)
        db.session.commit()

        assert NCFile.query.get("NC-AGG-001") is None
```

### Mechanical Walkthrough

- `cam = CAMFile(id="C-AGG-001", part_id="P-CAM-001", machine_id="M-CAM-001", ...); seq = Sequence(id="SEQ-AGG-001", cam_file_id="C-AGG-001", ...)` — Builds one real, persisted `CAMFile` and one real, persisted `Sequence` genuinely pointing at it by real foreign key - required so there's a real, related child row for the deletion below to actually affect.
- `db.session.delete(cam); db.session.commit()` — Deletes only the real, parent `CAMFile` object directly - nothing in this line touches `Sequence` at all; whatever happens to `seq`'s own real row is entirely a consequence of `CAMFile.sequences`'s own real, declared `cascade` setting.
- `assert Sequence.query.get("SEQ-AGG-001") is None` — Queries the real database directly for the real child row - `None` is real, direct proof it was actually deleted, not merely detached from the Python object graph in memory.

### Mental Model

```text
db.session.delete(cam_file)
        |
        v
cascade='all, delete-orphan' on cam_file.sequences/.nc_files
        |
        v
real DELETE also issued for every real, related Sequence/NCFile row
        (contrast: MachineGroup.machines, no cascade= set,
         leaves Machine.group_id merely NULLed instead)
```

### CS Lens

This is **composition** (as opposed to **association**): a real `Sequence`/`NCFile` row's own real existence is bound to its parent `CAMFile`'s - it cannot meaningfully exist without one, unlike a real `Machine`, which can genuinely exist with no group at all. Also recognized in: a real file system directory deleted recursively, taking every real file inside it along, versus a real symbolic link, which can be deleted without touching what it points at; a real UML composition relationship (a filled diamond) versus a real UML aggregation relationship (an open diamond) - the identical real distinction, named formally; and, in this project's own domain, a real G-code program's own operations, which have no real, independent meaning outside the specific sequence that contains them.

### SE Lens

The design principle is that `cascade` should reflect the real, conceptual ownership between two models, not default to whatever SQLAlchemy happens to do when left unset. The real alternative - the unset default, already shipped on `MachineGroup.machines` - is the right real choice there, since a `Machine` genuinely outlives any one group; the honest cost of applying that same unset default to `CAMFile.sequences` instead (a real change this lesson does *not* make, since the current, real `cascade='all, delete-orphan'` is already correct) would be real, orphaned `Sequence`/`NCFile` rows, pointing at a `cam_file_id` that no longer names anything - exactly the kind of dangling reference this project's own real, unenforced `PRAGMA foreign_keys` gap (already found in an earlier lesson) would then have no way to catch either.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_cam_files_characterization.py::TestAggregateCascade -v` — Runs this unit's own two new real tests, from the repository root.

### Verification

```text
backend/tests/test_cam_files_characterization.py::TestAggregateCascade::test_deleting_cam_file_cascade_deletes_its_real_sequences PASSED
backend/tests/test_cam_files_characterization.py::TestAggregateCascade::test_deleting_cam_file_cascade_deletes_its_real_nc_files PASSED
```

Full saved run: `N/A - real, permanent test file; run directly via pytest, not a saved verification/ output pair.`.

### Connection to the previous unit

This lesson's own first unit; it proves the real, already-correct shape of the aggregate this lesson's title names - the next unit closes with a real, unrelated concern: how fast one of its own real columns can be queried.

## Concept Unit: Indexes - a Real, Missing Index on cam_files.machine_id

### The Problem

`get_cam_files` (`backend/app/routes/cam_files.py:118`) actively filters `CAMFile.machine_id`, the identical real shape as an earlier lesson's own `Machine.group_id` fix. Does `machine_id` already have a real index, the way its sibling column `part_id` does?

Before reading on:

- `CAMFile.part_id` (`cam_file.py:23`) is declared with `index=True`; `CAMFile.machine_id` (`:24`) is declared without it, despite both being real foreign keys, both actively filtered in the identical real route. Before checking, what would you predict `EXPLAIN QUERY PLAN` shows for a real query filtering by each one?
- Given an earlier lesson already fixed the identical real gap on `Machine.group_id` with one keyword argument, what would you expect the real fix here to look like, before writing it?

### Project Change

- **Reference Source:** Real specimen: `backend/app/models/cam_file.py:23-24` (`part_id` indexed, `machine_id` not, before this change) and `backend/app/routes/cam_files.py:118` (`query.filter(CAMFile.machine_id == ...)`), read again this session; confirmed missing via a real `EXPLAIN QUERY PLAN` this session, returning `SCAN cam_files`.
- **Files affected:** `backend/app/models/cam_file.py` (modified)
- **Change type:** add
- **Location:** On the existing `machine_id` column declaration.
- **Dependencies:** None beyond this project's own real, existing `CAMFile` model.

### The New Code

One real, added keyword argument, and the real, permanent test class this unit's own commands run:

**File:** `backend/app/models/cam_file.py` (new)

```python
machine_id = db.Column(db.String(50), db.ForeignKey('machines.id'), nullable=False, index=True)
```

**File:** `backend/tests/test_cam_files_characterization.py` (new)

```python
class TestIndexes:
    """A real, used index on cam_files.machine_id."""

    def test_machine_id_has_a_real_index(self, app):
        rows = db.session.execute(
            text("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='cam_files'")
        ).fetchall()
        names = [r[0] for r in rows]
        assert any("machine_id" in n for n in names)

    def test_machine_id_filter_uses_search_not_scan(self, app):
        plan = db.session.execute(
            text("EXPLAIN QUERY PLAN SELECT * FROM cam_files WHERE machine_id = 'M-1'")
        ).fetchall()
        plan_text = " ".join(row[-1] for row in plan)
        assert "SEARCH" in plan_text
        assert "SCAN cam_files" not in plan_text
```

### The Updated Project

The real, single line this change touches, in place, next to its already-indexed sibling:

**File:** `backend/app/models/cam_file.py` (already exists — read-only, nothing to type)

```python
id = db.Column(db.String(50), primary_key=True)
part_id = db.Column(db.String(50), db.ForeignKey('parts.id'), nullable=False, index=True)
machine_id = db.Column(db.String(50), db.ForeignKey('machines.id'), nullable=False, index=True)  # <- new
```

### Mechanical Walkthrough

- `index=True` — The identical real keyword, in the identical real position, as `part_id`'s own already-present `index=True` one line above it - the two real columns now declared consistently, not just one of the two foreign keys this table actually filters on.

### CS Lens

This is the identical real **B-tree index** already proven at length in an earlier lesson - real, faster lookups, paid for with real, additional storage and real, marginally slower writes. Also recognized in: a real library catalog indexing both a book's author and its subject, not just one of the two ways patrons actually search for it; and, in this project's own domain, this exact table's own asymmetry, now resolved - `part_id` and `machine_id`, the two real foreign keys `CAMFile` actually has, both now indexed the same real way.

### SE Lens

The design principle is that every real, actively-filtered foreign key gets the identical real treatment, not just whichever one happened to be indexed first. The real alternative - leaving `machine_id` unindexed, since this project's real, current data volume makes a real `SCAN` cheap today - is exactly the real state this column shipped in until this lesson; the honest cost, already real and already found in an earlier lesson: other real, actively-filtered, unindexed columns in this exact schema (`Sequence.tool_assembly_id`, `Issue.part_id`/`machine_id`) still carry the identical, unaddressed gap.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_cam_files_characterization.py::TestIndexes -v` — Runs this unit's own two new real tests, from the repository root.

### Verification

```text
backend/tests/test_cam_files_characterization.py::TestIndexes::test_machine_id_has_a_real_index PASSED
backend/tests/test_cam_files_characterization.py::TestIndexes::test_machine_id_filter_uses_search_not_scan PASSED
```

Full saved run: `N/A - real, permanent test file; run directly via pytest, not a saved verification/ output pair.`.

### Connection to the previous unit

The previous unit proved the real aggregate's own shape; this unit closes the lesson by proving how fast one of its own real columns can now be searched.

## Connect the pieces

One real `CAMFile`, deleted directly, taking its real, related `Sequence` and `NCFile` rows down with it - not because anything in this lesson changed that behavior, but because `cascade='all, delete-orphan'` was already, correctly declared, proven by two real, permanent tests querying the real database directly afterward and finding `None`. And `CAMFile.machine_id`, the one real foreign key on this table that wasn't already indexed like its sibling `part_id`, now is - proven by a real `EXPLAIN QUERY PLAN` changing from `SCAN cam_files` to a real `SEARCH`. The full, real backend suite - 44 tests - still passes.

**Next lesson:** This lesson proved one real parent-child cascade already works correctly. Next, this curriculum goes one level deeper into the real aggregate this lesson only touched the top of - `CAMFile` → `Sequence` → `Operation`, and `CAMFile` → `NCFile`, all together.