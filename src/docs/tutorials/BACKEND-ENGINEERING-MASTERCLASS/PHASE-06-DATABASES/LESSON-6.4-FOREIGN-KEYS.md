# Lesson 6.4: Foreign Keys

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Three real scripts, run against this project's own real Flask app and real SQLAlchemy models (`create_app("testing")`, a real in-memory SQLite database, no invented toy schema) - not more plain-Python simulation, since this project already has the real mechanism this lesson is about. The first proves a genuinely new, real finding: this project's own declared `db.ForeignKey('parts.id')` is NOT actually enforced by the real, running database today, and shows exactly what would make it real. The second navigates a real parent/child pair in both directions using `backend/app/models/part.py`'s own real relationship. The third deletes a real parent row two different real ways - once where cascading behavior is configured, and once where it is not - and gets two genuinely different real outcomes.

**What you need to know first:** This project's own real `Machine`, `Part`, and `CAMFile` models and their already-declared columns; catching a raised exception with `try`/`except`; that this curriculum's own Relational Model lesson already established a relation as a set of tuples sharing the same attributes.

## Terms used in this lesson

- **foreign key** — A column in one relation whose declared job is to hold a real value from ANOTHER relation's own primary key - not a copy of that row, only a pointer to it. It exists so one relation can refer to a specific row of a different relation without duplicating that row's own data everywhere it needs to be referenced.
- **referential integrity** — The specific guarantee that every value stored in a foreign-key column actually matches a real, currently-existing row in the relation it points at - never a value that resolves to nothing. It exists as a distinct, checkable property from merely declaring a column `ForeignKey(...)`: as this lesson's own first unit proves directly, declaring where a column is SUPPOSED to point and a real system actually CHECKING that it does are two separate things, and one does not automatically imply the other.
- **parent/child relationship** — The relationship a foreign key creates between two relations: the relation being pointed AT is the parent, and the relation holding the pointing column is the child - one parent row can have many real child rows, but each child row points at exactly one real parent. It exists as directional vocabulary because a foreign key only lives on one side of the relationship (the child), which is exactly why navigating from parent to children and from child to parent are two genuinely different real operations, not the same one read backward.
- **cascading behavior** — What a real system is configured to do to a child row when its real parent row is deleted - automatically delete the child too (cascade), leave it referencing nothing (an orphan), or refuse the parent's own deletion outright until the child is dealt with. It exists as a deliberate, configured choice because a parent's deletion always has to resolve one of these three ways for every real child that still references it - there is no default that avoids picking one.

## Objects and methods used

- **`db.ForeignKey`**
  - *What it is:* A real SQLAlchemy construct, passed as an argument to `db.Column`, declaring that a column's own values are meant to reference another table's primary key.
  - *Implementation:* `db.ForeignKey('table_name.column_name')` - a string naming the real target table and column. By itself, in SQLite specifically, this declares the relationship in the schema but - as this lesson's own first unit proves by actually running it - does not, on its own, force the database to reject a value that does not match any real row there.
  - *Its use:* This project's own real code uses this on every real child column this lesson cites - `CAMFile.part_id`, `CAMFile.machine_id`, `Sequence.cam_file_id` - to declare, in the schema itself, which parent relation each one is meant to reference.
  - *Type:* A real SQLAlchemy construct, used as an argument to `db.Column`.
  - *Responsibility:* Declaring, in one place, which parent table and column a given column is supposed to reference - the schema's own stated intent, independent of whether anything actually enforces it.
  - *Depends on:* A string naming a real, already-declared table and column.
  - *Connects to:* Declared directly inside a real `db.Column(...)` call; this lesson's own first unit shows directly that its enforcement depends on a separate, real SQLite setting, not on this declaration alone.
  - *Shape:* Takes a `"table.column"` string; produces a schema-level declaration with no return value of its own significance.

- **`db.relationship`**
  - *What it is:* A real SQLAlchemy construct that adds a Python-level, virtual attribute connecting two real models, without itself adding a column to the database.
  - *Implementation:* `db.relationship('OtherModel', backref='name', lazy='dynamic', cascade='all, delete-orphan')` - `backref` creates the REVERSE attribute on the other model automatically (a child accessing its parent); `lazy='dynamic'` makes the parent-to-children attribute return a query object, requiring `.all()` to actually load rows; `cascade` (only set on some of this project's own real relationships) controls what happens to children when the parent is deleted, fully treated in this lesson's own Header.
  - *Its use:* This lesson's own Parent and Child unit navigates a real relationship in both directions using exactly this construct, already declared on `Part.cam_files` (`backend/app/models/part.py:346`); its own Cascading Behavior unit directly contrasts two real, different `cascade` configurations already present in this project's own schema.
  - *Type:* A real SQLAlchemy construct, called once per relationship, at class-definition time.
  - *Responsibility:* Providing real, Python-level navigation between two related models in both directions, and - only where `cascade` is explicitly set - real, automatic cleanup behavior on delete.
  - *Depends on:* A real, already-declared target model class, and a real foreign key connecting the two tables.
  - *Connects to:* This lesson cites three separate real declarations of it: `Part.cam_files` (no `cascade` set), `CAMFile.sequences` and `CAMFile.nc_files` (both `cascade='all, delete-orphan'`).
  - *Shape:* Takes a model name and keyword options; produces a virtual attribute whose own shape (a single object, or a query/list of them) depends on which side of a one-to-many relationship it is declared on.

- **`IntegrityError`**
  - *What it is:* A real exception class SQLAlchemy raises when a real database operation violates a constraint the database itself enforces - a `UNIQUE`, `NOT NULL`, `CHECK`, or (when actually turned on) foreign key constraint.
  - *Implementation:* Raised by SQLAlchemy when the underlying real database driver reports a constraint violation; its own `.orig` attribute carries the real, original error the database driver itself produced - this lesson's own labs read `e.orig` directly to show the real, underlying SQLite message.
  - *Its use:* This lesson's own first and third units both catch this real exception - once when a `PRAGMA foreign_keys = ON` connection genuinely refuses an invalid reference, and once when deleting a parent row leaves a real child's own `NOT NULL` foreign-key column with nothing to hold.
  - *Type:* A real exception class from `sqlalchemy.exc`.
  - *Responsibility:* Representing, as a real Python exception with a traceable cause, the specific fact that a real database-level constraint was violated by a specific, real operation.
  - *Depends on:* A real constraint actually being enforced by the underlying database connection.
  - *Connects to:* Raised by `db.session.commit()` itself, the moment the real database driver reports a violation; caught directly in a `try`/`except` in both labs that trigger it.
  - *Shape:* Carries the real, underlying driver exception as `.orig`; never a return value - its raising IS the signal a caller reacts to.

- **`sqlalchemy.text`**
  - *What it is:* A real SQLAlchemy function that wraps a plain string as an executable statement, for the rare case a raw statement - not expressed through the ORM's own Python API - needs to run directly.
  - *Implementation:* `text("...")` returns an object `db.session.execute(...)` can run directly against the real, current database connection.
  - *Its use:* This lesson's own first unit uses it for exactly one real statement, `PRAGMA foreign_keys = ON` - a SQLite-specific configuration directive, not general SQL (SQL itself is this curriculum's own later, dedicated lesson) - to actually turn on the real enforcement this unit's own first half shows missing.
  - *Type:* A real SQLAlchemy function.
  - *Responsibility:* Letting one specific, real statement run directly against the database connection, when nothing in the ORM's own Python API already expresses it.
  - *Depends on:* A real, valid statement string, and an open real database connection to run it against.
  - *Connects to:* Passed directly to `db.session.execute(...)` in this lesson's own first unit, immediately before the two real machine/CAM-file rows that unit's second half creates.
  - *Shape:* Takes a string in, returns an executable statement object; `db.session.execute(...)` runs it and returns its real result.

## Concept Unit: Foreign Keys and Referential Integrity - A Constraint That Isn't Actually Enforced

### The Problem

`backend/app/models/cam_file.py`'s real `part_id` column is declared `db.ForeignKey('parts.id')`. This project's own real configuration, read this session, never sets SQLite's own `PRAGMA foreign_keys = ON` anywhere. Given that SQLite, unlike several other real databases, does NOT enforce foreign-key constraints unless that PRAGMA is explicitly turned on for a given connection - what does this project's own real, running database actually do today if a `CAMFile` is committed with a `part_id` that matches no real `Part` at all?

Before reading on:

- A real `db.ForeignKey('parts.id')` declaration exists on `CAMFile.part_id`. Does declaring it automatically mean this project's real, running database refuses a `part_id` that matches nothing real - or could a schema declare that and still not enforce it?
- If turning on `PRAGMA foreign_keys = ON` for a real connection changes the outcome of committing an invalid `part_id`, what does that prove about where referential integrity actually lives - in the `ForeignKey(...)` declaration itself, or somewhere else?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/cam_file.py:22-24`: ``` id = db.Column(db.String(50), primary_key=True) part_id = db.Column(db.String(50), db.ForeignKey('parts.id'), nullable=False, index=True) machine_id = db.Column(db.String(50), db.ForeignKey('machines.id'), nullable=False) ``` Real, confirmed this session by grepping this project's own `backend/app/` and `backend/config.py` for `PRAGMA` and `foreign_keys`: no match anywhere - this project's own real database connections never turn SQLite's own foreign-key enforcement on. The lab below runs the real, actual consequence of that, directly against this project's own real app and models.
- **Files affected:** `verification/phase-06/lab_foreign_key_integrity.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real backend, and its already-installed `sqlalchemy`.

### The New Code

This project's own real `create_app("testing")`, a real in-memory database, and a real `CAMFile` committed with a `part_id` matching no real `Part` - first with SQLite's own default settings, then with `PRAGMA foreign_keys` explicitly turned on:

**File:** `verification/phase-06/lab_foreign_key_integrity.py` (new)

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app import create_app, db
from app.models.machine import Machine
from app.models.cam_file import CAMFile

app = create_app("testing")

with app.app_context():
    machine = Machine(id="m1", name="Haas VF-2", category="mill", sub_type="3_axis")
    db.session.add(machine)
    db.session.commit()

    orphan = CAMFile(id="cf1", part_id="does-not-exist", machine_id="m1", file_name="test.nc")
    db.session.add(orphan)
    db.session.commit()
    print("committed a real CAMFile whose part_id points at no real Part row - no error raised")
    print(f"real row still exists: part_id={db.session.get(CAMFile, 'cf1').part_id!r}")

with app.app_context():
    db.session.execute(text("PRAGMA foreign_keys = ON"))

    machine = Machine(id="m2", name="Okuma Genos", category="lathe", sub_type="single_turret")
    db.session.add(machine)
    db.session.commit()

    orphan2 = CAMFile(id="cf2", part_id="also-does-not-exist", machine_id="m2", file_name="test2.nc")
    db.session.add(orphan2)
    try:
        db.session.commit()
        print("committed anyway - no error")
    except IntegrityError as e:
        print(f"with PRAGMA foreign_keys = ON: IntegrityError raised - {e.orig}")
```

### Mechanical Walkthrough

- `sys.path.insert(0, ...) / from app import create_app, db` — Basic Python plus this project's own real package layout: since this lab lives under `verification/`, not `backend/`, this line adds the real `backend/` directory to Python's own import search path so `from app import ...` resolves to this project's actual, real backend package - not a stand-in or a copy.
- `create_app("testing")` — This project's own real application factory, already cited in this curriculum's own Lesson 6.1 and Lesson 5.x work, called with its real `"testing"` configuration - a genuine, real in-memory SQLite database, with every real table this project's own models declare already created.
- `CAMFile(id="cf1", part_id="does-not-exist", machine_id="m1", file_name="test.nc")` — Constructs one real `CAMFile` row - not a dict standing in for one, an actual instance of this project's own real model - with a `part_id` that was never used to create any real `Part` anywhere in this script.
- `db.session.add(orphan) / db.session.commit()` — Real SQLAlchemy session methods: `add` stages the row; `commit` actually writes it to the real, live database and ends the transaction. Nothing here raises - this project's own real, running database, with no `PRAGMA foreign_keys` ever turned on, genuinely accepts the write.
- `db.session.get(CAMFile, 'cf1')` — A real query, re-reading the row back from the real database rather than trusting the in-memory Python object - confirming the invalid `part_id` really was persisted, not merely unvalidated in memory.
- `db.session.execute(text("PRAGMA foreign_keys = ON"))` — `sqlalchemy.text`, fully treated in this lesson's own Header, executed directly against the real, current database connection - the one, real, minimal change between this unit's two halves.
- `try: db.session.commit() except IntegrityError as e: ... e.orig` — With the PRAGMA now on, the identical kind of invalid `part_id` write genuinely raises `IntegrityError`, fully treated in this lesson's own Header; `.orig` surfaces SQLite's own real, underlying message, `FOREIGN KEY constraint failed`, rather than SQLAlchemy's own generic wrapper text.

### CS Lens

This is **referential integrity**, and the real, concrete gap between a schema DECLARING a rule and a system ENFORCING it. Also recognized in: a type hint in Python, which documents an intended type but is never checked at runtime without a separate tool actually enforcing it; a comment claiming what a function does, contrasted against this curriculum's own Lesson 2.1 on executable specifications; a company policy written in a handbook versus one actually audited; and, in this project's own domain, this exact, real, previously-undocumented gap: a `CAMFile` can, today, be committed pointing at a `Part` that was deleted or never existed, and this project's own real database will not object.

### SE Lens

The design principle is that a schema's own stated intent (`ForeignKey(...)`) and a database's own actual, running behavior are two separate things, and confirming which one is really true requires actually running it, not reading the declaration. The real alternative NOT currently chosen by this project - turning on `PRAGMA foreign_keys = ON` for every real connection - would make every declared foreign key in this schema actually enforced, at the real cost of every future write needing a real, existing parent row before it can succeed; today, this project instead relies entirely on its own application code to only ever write real, valid references, with nothing at the database level backing that up if it doesn't. This is a real, verified gap in this project's own current database configuration - not yet fixed here, since fixing it project-wide is a real decision about every other real write path, deferred to wherever this curriculum's own later constraint-hardening work belongs.

### Commands needed

- `backend\.venv\Scripts\python.exe verification\phase-06\lab_foreign_key_integrity.py` — Run from the manufacturing-platform repository root, using this project's own real backend virtual environment directly (the same one `scripts/finish_lesson_check.py` itself uses) - not the system Python, since this lab needs this project's own real, already-installed Flask and SQLAlchemy.

### Verification

```text
Seeding default users...
committed a real CAMFile whose part_id points at no real Part row - no error raised
real row still exists: part_id='does-not-exist'
with PRAGMA foreign_keys = ON: IntegrityError raised - FOREIGN KEY constraint failed
```

Full saved run: `verification/phase-06/lab_foreign_key_integrity_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes that a foreign key's own referential-integrity guarantee is not automatic, which the rest of this lesson's own real relationships are built on top of regardless.

## Concept Unit: Parent and Child - Navigating the Relationship in Both Directions

### The Problem

`backend/app/models/part.py`'s own real `cam_files = db.relationship('CAMFile', backref='part', lazy='dynamic')` is declared once, on `Part` alone - `CAMFile` itself declares no matching relationship back. Given that this one declaration lives on only one side, how does real code ever go the OTHER direction - from a real `CAMFile` back to its own real parent `Part`?

Before reading on:

- `Part.cam_files` is declared with `backref='part'`. Before running the lab below: what real attribute does that create, and on which real model?
- A foreign key column, `CAMFile.part_id`, lives only on the child. Given only that column, what would it take, in real code, to find EVERY child belonging to one specific parent?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/part.py:346`: ``` cam_files = db.relationship('CAMFile', backref='part', lazy='dynamic') ``` This single, real, already-existing line is this entire unit's subject: it creates two real, usable directions of navigation at once, from one declaration on one side of the relationship.
- **Files affected:** `verification/phase-06/lab_parent_child.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real backend, and its already-installed `sqlalchemy`.

### The New Code

One real `Part`, two real `CAMFile` children, navigated both directions using nothing but this project's own already-declared relationship:

**File:** `verification/phase-06/lab_parent_child.py` (new)

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from app import create_app, db
from app.models.part import Part
from app.models.machine import Machine
from app.models.cam_file import CAMFile

app = create_app("testing")

with app.app_context():
    part = Part(id="P-1234567", part_number="1234567", description="Bracket Assembly")
    machine = Machine(id="m1", name="Haas VF-2", category="mill", sub_type="3_axis")
    db.session.add_all([part, machine])
    db.session.commit()

    cf1 = CAMFile(id="cf1", part_id="P-1234567", machine_id="m1", file_name="rev1.nc")
    cf2 = CAMFile(id="cf2", part_id="P-1234567", machine_id="m1", file_name="rev2.nc")
    db.session.add_all([cf1, cf2])
    db.session.commit()

    print(f"parent -> children: part.cam_files.all() = {[c.id for c in part.cam_files.all()]}")
    print(f"child -> parent: cf1.part.id = {cf1.part.id!r}")
```

### Mechanical Walkthrough

- `part.cam_files` — The parent-to-children direction, declared directly by name on `Part`. Because this project's own real declaration sets `lazy='dynamic'`, this attribute is a query object, not already-loaded rows - nothing is fetched from the real database until something further, like `.all()`, actually asks for it.
- `.all()` — A real SQLAlchemy query method, executed here to actually load every real matching `CAMFile` row - both `cf1` and `cf2` - as real Python objects.
- `cf1.part` — The child-to-parent direction - `part`, the exact name given to `backref` in `Part`'s own declaration. This attribute was never separately written anywhere on `CAMFile` itself; SQLAlchemy creates it automatically the moment `Part.cam_files`'s own `backref='part'` is declared.
- `cf1.part.id` — Real attribute access on the real object `cf1.part` resolves to, confirming it genuinely is the same real `Part` row, `'P-1234567'`, that `cf1`'s own `part_id` column names - not merely a value copied from `part_id`, but the actual related row, fetched fresh via a real query.

### Mental Model

```text
Part (parent)                     CAMFile (child)
--------------                     ---------------
id = 'P-1234567'  <───────────────  part_id = 'P-1234567'
      │  .cam_files (declared,                │
      │   backref creates the                 │
      │   reverse direction too)               │
      └──────────────>  .all() ──> [cf1, cf2]  │
                                                 │
                      cf1.part ──────────────────┘
                      (the auto-created backref,
                       going the other way)

One declaration, on the parent's own side only, produces both
real directions of navigation.
```

### CS Lens

This is a **parent/child relationship**: directional by nature, since the foreign key column lives on only one side. Also recognized in: a filesystem directory (parent) and the files inside it (children), where a file's own path names its parent but a bare directory listing doesn't automatically know every file that names it; a company's org chart, where a manager references no specific report directly, yet every report's own record names exactly one manager; a linked list's own forward pointer, useless for finding "everything pointing at me" without a separate, reverse index; and, in this project's own domain, one real `Part` naturally having many real `CAMFile` revisions, each of which belongs to exactly one real part.

### SE Lens

The design principle is declaring a two-way, navigable relationship from a single, real, one-sided foreign key, instead of maintaining two separate, hand-written attributes that could drift out of sync with each other. The real alternative NOT chosen here - writing a second, explicit relationship directly on `CAMFile` pointing back at `Part` - would work, but now two separate declarations would both have to agree about the same real relationship, and nothing would stop them from silently disagreeing after a future edit to only one of them. The honest cost of the `backref` approach actually used: the reverse attribute's real name, `part`, is declared inside `Part`'s own file, not `CAMFile`'s - a reader looking only at `backend/app/models/cam_file.py` would never discover `cf1.part` exists at all without also reading `part.py`.

### Commands needed

- `backend\.venv\Scripts\python.exe verification\phase-06\lab_parent_child.py` — Run from the repository root, using this project's own real backend virtual environment.

### Verification

```text
Seeding default users...
parent -> children: part.cam_files.all() = ['cf1', 'cf2']
child -> parent: cf1.part.id = 'P-1234567'
```

Full saved run: `verification/phase-06/lab_parent_child_output.txt`.

### Connection to the previous unit

The previous unit showed a foreign key's own reference might not be real at all; this unit shows what real, working navigation looks like when it is - in both directions, from one real declaration.

## Concept Unit: Cascading Behavior - What Happens to Children When a Parent Is Deleted

### The Problem

`backend/app/models/cam_file.py`'s real `sequences` relationship declares `cascade='all, delete-orphan'`; `backend/app/models/part.py`'s real `cam_files` relationship declares no `cascade` at all. Given two real parent/child relationships in the identical project, one configured one way and one the other, what actually, really happens when a parent row that still has real children is deleted - and is the answer the same both times?

Before reading on:

- `CAMFile.sequences` declares `cascade='all, delete-orphan'`. Before running the lab below: if a real `CAMFile` with a real child `Sequence` is deleted, what should happen to that `Sequence` row?
- `Part.cam_files` declares no `cascade` at all. If a real `Part` that still has a real child `CAMFile` is deleted, does the absence of `cascade` mean the child is simply left alone, untouched - or could deleting the parent fail outright instead?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/cam_file.py:72-73`: ``` nc_files = db.relationship('NCFile', backref='cam_file', lazy='dynamic', cascade='all, delete-orphan') sequences = db.relationship('Sequence', backref='cam_file', lazy='dynamic', cascade='all, delete-orphan') ``` and, real, verbatim, `backend/app/models/part.py:346`, already cited in this lesson's own previous unit: ``` cam_files = db.relationship('CAMFile', backref='part', lazy='dynamic') ``` Two real, already-existing relationships in this same project, configured two genuinely different ways - the lab below runs both real outcomes directly.
- **Files affected:** `verification/phase-06/lab_cascade_delete.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real backend, and its already-installed `sqlalchemy`.

### The New Code

A real `CAMFile` with a real child `Sequence`, deleted first - then a real `Part` with a real child `CAMFile`, deleted second:

**File:** `verification/phase-06/lab_cascade_delete.py` (new)

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from sqlalchemy.exc import IntegrityError

from app import create_app, db
from app.models.part import Part
from app.models.machine import Machine
from app.models.cam_file import CAMFile
from app.models.sequence import Sequence

app = create_app("testing")

with app.app_context():
    part = Part(id="P-1234567", part_number="1234567", description="Bracket Assembly")
    machine = Machine(id="m1", name="Haas VF-2", category="mill", sub_type="3_axis")
    db.session.add_all([part, machine])
    db.session.commit()

    cf1 = CAMFile(id="cf1", part_id="P-1234567", machine_id="m1", file_name="rev1.nc")
    db.session.add(cf1)
    db.session.commit()

    seq1 = Sequence(id="seq1", cam_file_id="cf1", sequence_number=1, tool_number=1)
    db.session.add(seq1)
    db.session.commit()

    print(f"before deleting parent CAMFile cf1: Sequence seq1 = {db.session.get(Sequence, 'seq1')}")
    db.session.delete(cf1)
    db.session.commit()
    print("deleted the parent CAMFile cf1 - its own relationship declares cascade='all, delete-orphan'")
    print(f"after deleting parent CAMFile cf1: Sequence seq1 = {db.session.get(Sequence, 'seq1')}")

with app.app_context():
    cf2 = CAMFile(id="cf2", part_id="P-1234567", machine_id="m1", file_name="rev2.nc")
    db.session.add(cf2)
    db.session.commit()

    part_row = db.session.get(Part, "P-1234567")
    print(f"before deleting parent Part {part_row.id!r}: it still has a real child CAMFile, cf2")
    db.session.delete(part_row)
    try:
        db.session.commit()
        print("deleted anyway - no error")
    except IntegrityError as e:
        print(f"Part.cam_files declares no cascade at all - IntegrityError raised instead: {e.orig}")
```

### Mechanical Walkthrough

- `db.session.delete(cf1) / db.session.commit() (first half)` — Real SQLAlchemy session methods, staging and then actually committing the deletion of a real, live `CAMFile` row that still has a real child `Sequence` at the moment it is deleted.
- `db.session.get(Sequence, 'seq1') (after)` — A fresh, real query against the real database - not a check of any Python object still held in memory - confirming the child `Sequence` row itself was genuinely removed, matching what `cascade='all, delete-orphan'` promises: the parent's own deletion really did cascade to its real child.
- `db.session.delete(part_row) / db.session.commit() (second half)` — The identical real delete-and-commit pattern, now on a real `Part` that still has a real child `CAMFile`, `cf2` - but `Part.cam_files` declares no `cascade` at all, so this commit does not simply succeed the way the first one did.
- `except IntegrityError as e: ... e.orig` — `IntegrityError`, fully treated in this lesson's own Header. With no `cascade` configured, SQLAlchemy's own default behavior attempts to detach the child by clearing its foreign key instead of deleting it - but `CAMFile.part_id` is declared `nullable=False`, so the real database itself refuses that write, surfacing as `e.orig`'s own real message, `NOT NULL constraint failed: cam_files.part_id`.

### Mental Model

```text
cascade='all, delete-orphan'          no cascade configured
(CAMFile -> Sequence)                 (Part -> CAMFile)
-----------------------------          -----------------------
delete CAMFile cf1                    delete Part P-1234567
      │                                       │
      ▼                                       ▼
SQLAlchemy also deletes            SQLAlchemy tries to clear
the real child Sequence            the child's part_id instead
seq1 - commit succeeds                        │
                                                ▼
                                    CAMFile.part_id is
                                    nullable=False - the real
                                    database refuses -
                                    IntegrityError, commit fails

The identical action (delete a parent with a real child still
attached) resolves two genuinely different real ways, entirely
because of how each relationship's own cascade option is set.
```

### CS Lens

This is **cascading behavior**, one real, concrete instance of a broader idea: what a system does automatically in response to one change rippling outward. Also recognized in: a spreadsheet's own formula recalculating every cell that depends on a changed one; a `git branch -d` refusing to delete a branch with unmerged real commits, rather than silently discarding them; an operating system's own recursive directory delete (`rm -r`) versus refusing to remove a non-empty one without that flag; and, in this project's own real domain, exactly this lesson's own two real, contrasting outcomes: a `CAMFile`'s own child sequences vanishing with it, a `Part`'s own child CAM files blocking its deletion instead.

### SE Lens

The design principle is that cascading behavior is a real, deliberate choice with two opposite failure modes, and neither one is free of risk. The real alternative actually chosen for `CAMFile.sequences` - cascade delete - means a single real delete can silently remove an unbounded number of real child rows with no further confirmation; the real alternative actually chosen for `Part.cam_files` - no cascade - means a legitimate parent deletion can be blocked by a child relationship nobody deleting the part necessarily thought about at that moment, surfacing only as a real `IntegrityError` at commit time. The honest cost either way: this project's own two, real, different choices here were not shown to be documented anywhere as a deliberate policy about when to use which - each was set independently, on its own relationship, by whoever wrote that particular model.

### Commands needed

- `backend\.venv\Scripts\python.exe verification\phase-06\lab_cascade_delete.py` — Run from the repository root, using this project's own real backend virtual environment.

### Verification

```text
Seeding default users...
before deleting parent CAMFile cf1: Sequence seq1 = <Sequence 1 - Tool 1>
deleted the parent CAMFile cf1 - its own relationship declares cascade='all, delete-orphan'
after deleting parent CAMFile cf1: Sequence seq1 = None
before deleting parent Part 'P-1234567': it still has a real child CAMFile, cf2
Part.cam_files declares no cascade at all - IntegrityError raised instead: NOT NULL constraint failed: cam_files.part_id
```

Full saved run: `verification/phase-06/lab_cascade_delete_output.txt`.

### Connection to the previous unit

The previous unit showed real, working navigation between parent and child; this unit shows what happens to that same real relationship at the moment one side of it is deleted - and that this project's own real schema already answers that question two different ways, deliberately or not.

## Connect the pieces

Follow one real `CAMFile` row, `cf1`, through every unit. Its own `part_id` column is declared `db.ForeignKey('parts.id')` - and the first unit's own real, running app commits a `CAMFile` pointing at a `Part` that never existed with zero complaint, proving that declaration alone is not referential integrity; only turning on the real `PRAGMA foreign_keys = ON` makes the identical write actually fail. Given a real, valid `part_id` instead, the second unit navigates the real parent/child relationship it establishes both ways at once - `part.cam_files.all()` forward, `cf1.part` backward - from a single, real declaration on the parent's own side. And the third unit shows what real consequence that relationship's own configuration has at the moment a parent is deleted: `cf1` itself, once it is the PARENT of a real `Sequence`, takes that child down with it, because its own relationship says `cascade='all, delete-orphan'` - while `cf1`'s own real parent, `Part P-1234567`, cannot be deleted at all while `cf1` still exists, because `Part.cam_files` says nothing about cascading whatsoever. One real column, `part_id`, and its declared foreign key, ends up responsible for all three: whether it points at something real, which direction it can be navigated, and what happens on both ends the moment either side is deleted.

**Next lesson:** Next, the specific shape this lesson's own parent/child relationship always took - one parent, many children - gets named and applied directly to the real, four-level chain this project's own schema already builds: a `Part`, its `CAMFile`s, each one's `Sequence`s, and each of those `Sequence`'s own `Operation`s.