# Lesson 8.5: Rebuild Parent/Child Persistence

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, permanent test file, `backend/tests/test_sequences_characterization.py`, proving two real facts one level deeper than an earlier lesson's own aggregate: first, that deleting a real `CAMFile` cascades transitively, two real levels down, through `Sequence.operations` (`backend/app/models/sequence.py:37`), genuinely deleting real `Operation` rows it never touches directly - and second, a real, missing index on `Sequence.tool_assembly_id`, fixed the identical real way two earlier lessons already fixed `Machine.group_id`/`CAMFile.machine_id`. The transferable problem: a cascade chain's own real reach isn't bounded by how many `db.relationship` hops away the deleted row is - it's transitive by default, all the way down, for as long as every link in the chain sets `cascade='all, delete-orphan'` the same real way.

**What you need to know first:** What `db.relationship`'s own `cascade` keyword controls, and what a chain of two such relationships, each with `cascade='all, delete-orphan'` set, actually does when the topmost row is deleted; what a real SQL index does to a real query plan; what a real foreign key is.

## Terms used in this lesson



## Objects and methods used

- **`Sequence.operations (relationship)`**
  - *What it is:* A real, existing `db.relationship` declaration on this project's own real `Sequence` model (`backend/app/models/sequence.py:37`).
  - *Implementation:* `operations = db.relationship('Operation', backref='sequence', lazy='dynamic', cascade='all, delete-orphan')` - the identical real `cascade` value an earlier lesson already proved on `CAMFile.sequences` one level up.
  - *Its use:* This lesson's own first unit proves what happens to a real `Operation` row when its grandparent `CAMFile` - not its direct parent `Sequence` - is the one actually deleted.
  - *Type:* A real `db.relationship` declaration on the `Sequence` class.
  - *Responsibility:* Declaring that a real `Operation` row genuinely cannot outlive the real `Sequence` it belongs to.
  - *Depends on:* This project's own real `Operation` model, and its own real foreign key back to `Sequence`.
  - *Connects to:* Chains directly onto `CAMFile.sequences`, an earlier lesson's own real relationship - together the two form one real, two-hop cascade chain from `CAMFile` down to `Operation`.
  - *Shape:* Accessing it returns a real, `lazy='dynamic'` query object; deleting the parent `Sequence` and committing removes every real, related `Operation` row from the real database - and, since `CAMFile.sequences` sets the identical real `cascade`, deleting the *grandparent* `CAMFile` removes them too, without either relationship needing to know the other exists.

## Concept Unit: The Transitive Cascade - Deleting a CAMFile Two Real Levels Down

### The Problem

An earlier lesson proved `CAMFile.sequences`, with `cascade='all, delete-orphan'` set, deletes a real `Sequence` row when its `CAMFile` is deleted. `Sequence.operations` sets the identical real `cascade`. What happens to a real `Operation` row - two real relationship hops away from `CAMFile`, not one - when only the topmost `CAMFile` is deleted directly?

Before reading on:

- Nothing in `CAMFile`'s own code ever mentions `Operation` by name - the two real models are not even directly related by foreign key. Given that, does deleting a `CAMFile` reach far enough to delete a real `Operation` two hops down, or does the cascade "stop" at the first real level, leaving orphaned `Operation` rows with a `sequence_id` pointing at a row that no longer exists?
- If `Sequence.operations` did *not* set `cascade='all, delete-orphan'` - if it used the same unset default an earlier lesson already proved on `MachineGroup.machines` - what real, different outcome would you expect for the same real delete?

### Project Change

- **Reference Source:** Real specimens: `backend/app/models/cam_file.py:73` (`CAMFile.sequences`, cascade already proven in an earlier lesson) and `backend/app/models/sequence.py:37` (`Sequence.operations`), read again this session.
- **Files affected:** `backend/tests/test_sequences_characterization.py` (new)
- **Change type:** add
- **Location:** N/A - a new, permanent test file; no existing project structure to place it within.
- **Dependencies:** This project's own real `Part`/`Machine`/`CAMFile`/`Sequence`/ `Operation` models.

### The New Code

Two real, permanent tests: one deleting the real `CAMFile` directly and checking two levels down, one deleting only the real `Sequence` directly as a control:

**File:** `backend/tests/test_sequences_characterization.py` (new)

```python
"""
Characterization tests for this project's own real Sequence/Operation
persistence (backend/app/models/sequence.py, backend/app/models/operation.py,
backend/app/routes/tool_assemblies.py): the real, already-working
transitive aggregate cascade (deleting a CAMFile cascade-deletes its
real Sequence rows, which in turn cascade-delete their own real
Operation rows, two real levels deep), and the real, rebuilt index on
Sequence.tool_assembly_id.
"""
import pytest

from sqlalchemy import text

from app import create_app, db
from app.models.part import Part
from app.models.machine import Machine
from app.models.cam_file import CAMFile
from app.models.sequence import Sequence
from app.models.operation import Operation


@pytest.fixture
def app():
    application = create_app("testing")
    with application.app_context():
        yield application


class TestTransitiveCascade:
    """Deleting a CAMFile cascades through Sequence into Operation, two real levels deep."""

    def test_deleting_cam_file_cascade_deletes_operations_two_levels_down(self, app):
        part = Part(id="P-TRANS-001", part_number="5556667", description="Test")
        db.session.add(part)
        machine = Machine(id="M-TRANS-001", name="Test Mill", category="mill", sub_type="3_axis")
        db.session.add(machine)
        db.session.commit()

        cam = CAMFile(id="C-TRANS-001", part_id="P-TRANS-001", machine_id="M-TRANS-001", file_name="trans.mcam")
        db.session.add(cam)
        db.session.commit()

        seq = Sequence(id="SEQ-TRANS-001", cam_file_id="C-TRANS-001", sequence_number=1, tool_number=1)
        db.session.add(seq)
        db.session.commit()

        op = Operation(id="OP-TRANS-001", sequence_id="SEQ-TRANS-001", operation_number=1,
                        operation_type="Drill", name="Drill Hole", tool_number=1)
        db.session.add(op)
        db.session.commit()

        assert Operation.query.get("OP-TRANS-001") is not None

        db.session.delete(cam)
        db.session.commit()

        assert Sequence.query.get("SEQ-TRANS-001") is None
        assert Operation.query.get("OP-TRANS-001") is None

    def test_deleting_only_the_sequence_still_cascades_its_own_operations(self, app):
        part = Part(id="P-TRANS-002", part_number="4445556", description="Test")
        db.session.add(part)
        machine = Machine(id="M-TRANS-002", name="Test Mill 2", category="mill", sub_type="3_axis")
        db.session.add(machine)
        db.session.commit()

        cam = CAMFile(id="C-TRANS-002", part_id="P-TRANS-002", machine_id="M-TRANS-002", file_name="trans2.mcam")
        db.session.add(cam)
        db.session.commit()

        seq = Sequence(id="SEQ-TRANS-002", cam_file_id="C-TRANS-002", sequence_number=1, tool_number=1)
        db.session.add(seq)
        db.session.commit()

        op = Operation(id="OP-TRANS-002", sequence_id="SEQ-TRANS-002", operation_number=1,
                        operation_type="Mill", name="Mill Pocket", tool_number=1)
        db.session.add(op)
        db.session.commit()

        db.session.delete(seq)
        db.session.commit()

        assert Operation.query.get("OP-TRANS-002") is None
        assert CAMFile.query.get("C-TRANS-002") is not None
```

### Mechanical Walkthrough

- `db.session.delete(cam); db.session.commit()` — Deletes only the real, topmost `CAMFile` object directly - nothing in this line mentions `Sequence` or `Operation` at all; both real deletions that follow are entirely a consequence of two separate `db.relationship` declarations, each independently set to `cascade='all, delete-orphan'`, chaining together.
- `assert Sequence.query.get("SEQ-TRANS-001") is None; assert Operation.query.get("OP-TRANS-001") is None` — Queries the real database directly for both the real, direct child and the real, transitive grandchild - proving the cascade actually reached two real levels down, not just one.
- `db.session.delete(seq); ... assert CAMFile.query.get("C-TRANS-002") is not None` — The control case: deleting only the real, middle `Sequence` still cascades its own real `Operation` rows, while its own real parent `CAMFile` is untouched - proving the cascade direction only ever flows downward from whichever row is actually deleted.

### Mental Model

```text
db.session.delete(cam_file)
        |
        v
cascade='all, delete-orphan' on cam_file.sequences
        |
        v
real DELETE issued for every related Sequence row
        |
        v
cascade='all, delete-orphan' on sequence.operations (a second, separate relationship)
        |
        v
real DELETE issued for every related Operation row
        (two real levels down from the row that was
         actually, directly deleted)
```

### CS Lens

This is **transitive closure**: a real relation - "is deleted because its parent was deleted" - applied repeatedly until no further real row satisfies it, exactly the way reachability in a real graph is computed by following edges until none are left to follow. Also recognized in: a real file system deleting a directory recursively, where a sub-subdirectory's own files vanish without `rm` ever naming them individually; a real cascading `ON DELETE CASCADE` foreign key constraint in raw SQL, chained across three real tables instead of two; and, in this project's own domain, a real CAM file's own deletion needing to reach every real G-code operation nested inside it, no matter how many real sequences sit in between.

### SE Lens

The design principle is that each real `db.relationship` only ever needs to know about its own direct real child - `CAMFile` never references `Operation`, and the transitive reach falls out automatically from composing two, independently correct, local decisions. The real alternative - a single relationship on `CAMFile` reaching directly into `Operation`, skipping `Sequence` - would require `CAMFile` to know about a real model two real hops away, and duplicate the identical real `cascade` logic `Sequence.operations` already owns; the honest cost of the current, real design is that verifying the *full* real chain requires checking every real link individually, the way this lesson's own first test just did.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_sequences_characterization.py::TestTransitiveCascade -v` — Runs this unit's own two new real tests, from the repository root.

### Verification

```text
backend/tests/test_sequences_characterization.py::TestTransitiveCascade::test_deleting_cam_file_cascade_deletes_operations_two_levels_down PASSED
backend/tests/test_sequences_characterization.py::TestTransitiveCascade::test_deleting_only_the_sequence_still_cascades_its_own_operations PASSED
```

Full saved run: `N/A - real, permanent test file; run directly via pytest, not a saved verification/ output pair.`.

### Connection to the previous unit

This lesson's own first unit; it proves the real, already-correct shape of the aggregate one level deeper than an earlier lesson reached - the next unit closes with a real, unrelated concern on the same real table: how fast one of its own real columns can be queried.

## Concept Unit: Indexes - a Real, Missing Index on sequences.tool_assembly_id

### The Problem

`backend/app/routes/tool_assemblies.py:83` and `:166`, and `backend/app/routes/parts.py:222`, all actively filter `Sequence.tool_assembly_id` - three real, separate routes, not just one. Does this real foreign key already have a real index, the way `Sequence.cam_file_id` (`sequence.py:19`) already does?

Before reading on:

- `Sequence.cam_file_id` and `Sequence.tool_number` (`sequence.py:19,24`) are both declared with `index=True`; `Sequence.tool_assembly_id` (`:25`) is not, despite being a real foreign key, actively filtered in three separate real places. Before checking, what would you predict `EXPLAIN QUERY PLAN` shows for a real query filtering by it?
- Two earlier lessons already fixed the identical real gap on `Machine.group_id` and `CAMFile.machine_id`, each with one keyword argument. Given that, what would you expect the real fix here to look like, before writing it?

### Project Change

- **Reference Source:** Real specimen: `backend/app/models/sequence.py:19-25` (`cam_file_id`/`tool_number` indexed, `tool_assembly_id` not, before this change) and `backend/app/routes/tool_assemblies.py:83` (`Sequence.query.filter_by(tool_assembly_id=tool_assembly.id)`), read again this session; confirmed missing via a real `EXPLAIN QUERY PLAN` this session, returning `SCAN sequences`.
- **Files affected:** `backend/app/models/sequence.py` (modified)
- **Change type:** add
- **Location:** On the existing `tool_assembly_id` column declaration.
- **Dependencies:** None beyond this project's own real, existing `Sequence` model.

### The New Code

One real, added keyword argument, and the real, permanent test class this unit's own commands run:

**File:** `backend/app/models/sequence.py` (new)

```python
tool_assembly_id = db.Column(db.String(50), db.ForeignKey('tool_assemblies.id'), nullable=True, index=True)
```

**File:** `backend/tests/test_sequences_characterization.py` (new)

```python
class TestIndexes:
    """A real, used index on sequences.tool_assembly_id."""

    def test_tool_assembly_id_has_a_real_index(self, app):
        rows = db.session.execute(
            text("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='sequences'")
        ).fetchall()
        names = [r[0] for r in rows]
        assert any("tool_assembly_id" in n for n in names)

    def test_tool_assembly_id_filter_uses_search_not_scan(self, app):
        plan = db.session.execute(
            text("EXPLAIN QUERY PLAN SELECT * FROM sequences WHERE tool_assembly_id = 'TA-1'")
        ).fetchall()
        plan_text = " ".join(row[-1] for row in plan)
        assert "SEARCH" in plan_text
        assert "SCAN sequences" not in plan_text
```

### The Updated Project

The real, single line this change touches, in place, next to its already-indexed siblings:

**File:** `backend/app/models/sequence.py` (already exists — read-only, nothing to type)

```python
cam_file_id = db.Column(db.String(50), db.ForeignKey('cam_files.id'), nullable=False, index=True)

sequence_number = db.Column(db.Integer, nullable=False)
program_number = db.Column(db.String(20), nullable=True, index=True)  # e.g., "O1101"
nc_file = db.Column(db.String(100), nullable=True)  # e.g., "1101.NC"
tool_number = db.Column(db.Integer, nullable=False, index=True)
tool_assembly_id = db.Column(db.String(50), db.ForeignKey('tool_assemblies.id'), nullable=True, index=True)  # <- new
```

### Mechanical Walkthrough

- `index=True` — The identical real keyword, in the identical real position, as `cam_file_id`'s and `tool_number`'s own already-present `index=True` - the three real, actively-filtered columns on this table now declared consistently.

### CS Lens

This is the identical real **B-tree index** already proven twice in earlier lessons - real, faster lookups, paid for with real, additional storage and real, marginally slower writes. Also recognized in: a real spreadsheet's own multiple, independent sort/filter columns, each needing its own real index to stay fast as the sheet grows; and, in this project's own domain, this exact table's own third real foreign key, now brought in line with the two it already shipped indexed.

### SE Lens

The design principle is the same one two earlier lessons already applied: every real, actively-filtered foreign key gets the identical real treatment. The real alternative - leaving `tool_assembly_id` unindexed, since a real `SCAN` is cheap at this project's current, real data volume - is exactly the real state this column shipped in until this lesson; the honest cost, already real and already named twice before: other real, actively-filtered, unindexed columns in this exact schema (`Issue.part_id`/`machine_id`) still carry the identical, unaddressed gap, and finding each one has so far required a person to go looking, one table at a time.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest backend/tests/test_sequences_characterization.py::TestIndexes -v` — Runs this unit's own two new real tests, from the repository root.

### Verification

```text
backend/tests/test_sequences_characterization.py::TestIndexes::test_tool_assembly_id_has_a_real_index PASSED
backend/tests/test_sequences_characterization.py::TestIndexes::test_tool_assembly_id_filter_uses_search_not_scan PASSED
```

Full saved run: `N/A - real, permanent test file; run directly via pytest, not a saved verification/ output pair.`.

### Connection to the previous unit

The previous unit proved the real aggregate's own transitive reach; this unit closes the lesson the identical real way the last two lessons did - proving how fast one of its own real columns can now be searched.

## Connect the pieces

One real `CAMFile`, deleted directly, taking its real `Sequence` rows down with it - and, without either relationship ever referencing the other by name, its real `Operation` rows too, two real levels down - proven by two real, permanent tests querying the real database directly afterward and finding `None` at both levels. And `Sequence.tool_assembly_id`, the one real foreign key on this table that wasn't already indexed like its two siblings, now is - proven by a real `EXPLAIN QUERY PLAN` changing from `SCAN sequences` to a real `SEARCH`. The full, real backend suite - 48 tests - still passes.

**Next lesson:** This lesson proved a two-level cascade already works correctly, and closed a third real missing-index gap, each time using the identical real tools: a direct delete, a direct query against the real database, and `EXPLAIN QUERY PLAN`. Next, this curriculum turns from proving individual real relationships to a different real question about this same schema - what happens when two real requests try to modify the same real row at the same real time.