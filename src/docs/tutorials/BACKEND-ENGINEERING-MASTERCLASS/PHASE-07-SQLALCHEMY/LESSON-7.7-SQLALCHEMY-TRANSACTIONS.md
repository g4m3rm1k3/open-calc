# Lesson 7.7: SQLAlchemy Transactions

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Two real, run labs proving `db.session` connects every real ORM operation added to it to one shared, real transaction boundary, regardless of how many separate `.add()` calls built it up: the first stages one real, valid `Machine` and one real, invalid one (missing a required `name`) together, and proves the real, otherwise-valid row never persists either, once the shared real `commit()` fails; the second proves the identical real session is fully usable again, immediately after a real `rollback()`, for a genuinely new, valid operation. The transferable problem: a `Session`'s own real pending state, not any single `.add()` call, is what a real transaction boundary actually wraps.

**What you need to know first:** What `db.session.add()`/`.flush()`/`.commit()` each individually do; what a real SQL transaction is, and what a real `COMMIT`/`ROLLBACK` each finalize or discard; what a real `NOT NULL` constraint enforces.

## Terms used in this lesson

- **rollback** — The real, specific operation that discards every real, pending change the current real transaction was holding, restoring the real database to the state it was in before that transaction began - and, on this project's own real `Session`, also clears the session's own pending/failed state so it can be used again for new, real work. It exists as the real, necessary counterpart to `commit`: without it, a real transaction that already failed has no real way to be un-stuck.

## Objects and methods used

- **`db.session.rollback`**
  - *What it is:* A real method on this project's own live `db.session` object - SQLAlchemy's own `Session.rollback` - discarding every real pending change in the current transaction.
  - *Implementation:* `db.session.rollback()` issues a real `ROLLBACK` against the real, currently open transaction, discarding every real pending object the session was tracking, and resets the session's own internal state so it's immediately usable for new, real work afterward.
  - *Its use:* Both of this lesson's own labs call this once, directly after a real `commit()` raises a real `IntegrityError`, before doing anything else with the session.
  - *Type:* A real instance method on SQLAlchemy's `Session` class (`db.session`).
  - *Responsibility:* Discarding every real, pending change from a failed or abandoned real transaction, and returning the session itself to a real, usable state.
  - *Depends on:* A real, currently open transaction with real pending state to discard (calling it with nothing pending is a real, harmless no-op).
  - *Connects to:* Follows a real, caught exception from `commit()` in both of this lesson's own labs; the second lab's own new, valid `Machine` is added and committed only after this call already ran.
  - *Shape:* Takes nothing in; returns nothing; has the real, observable side effect of discarding pending state and clearing the session's own failed status.

## Concept Unit: Multiple Real ORM Operations, One Real Transaction Boundary

### The Problem

`db.session.add(valid)` and `db.session.add(invalid)` are two separate, real Python calls, on two entirely separate real objects. If the second one violates a real database constraint, does the first one - which, on its own, is completely valid - still get committed, or does it get pulled down with the second?

Before reading on:

- Nothing about calling `db.session.add(valid)` a second time, for a different object, opens a second, separate real transaction. Given both real objects are staged in the identical real session before `commit()` ever runs, what would that suggest about how many real transactions this whole sequence actually involves?
- Before running this, would you predict the real, valid `Machine` survives on its own, or that the real failure "reaches back" and undoes it too?

### Project Change

- **Reference Source:** Real specimen: `backend/app/models/machine.py:41-86` (`Machine`), specifically `name = db.Column(db.String(100), nullable=False)`, read again this session - the real constraint this unit's own invalid row deliberately violates.
- **Files affected:** `verification/phase-07/lab_transaction_boundary.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real `Machine` model; SQLAlchemy's own real `IntegrityError` exception class.

### The New Code

One real, valid `Machine` and one real, invalid one, staged together, committed together, with the real failure and its real consequence for the valid row both observed directly:

**File:** `verification/phase-07/lab_transaction_boundary.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from sqlalchemy.exc import IntegrityError

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")

with app.app_context():
    valid = Machine(id="M-TXN-001", name="Haas VF-2", category="mill", sub_type="3_axis")
    invalid = Machine(id="M-TXN-002", category="mill", sub_type="3_axis")  # no name - NOT NULL

    db.session.add(valid)
    db.session.add(invalid)

    try:
        db.session.commit()
        print("commit() succeeded - unexpected")
    except IntegrityError as e:
        print("commit() raised a real IntegrityError:", repr(e.orig))
        db.session.rollback()
        print("db.session.rollback() called")

    print()
    print("after rollback(), querying the DATABASE directly for the real, otherwise-valid row:")
    reloaded_valid = Machine.query.get("M-TXN-001")
    print("  Machine.query.get('M-TXN-001'):", reloaded_valid)
```

### Mechanical Walkthrough

- `db.session.add(valid); db.session.add(invalid)` — Stages two real, separate objects as pending - both, at this point, sitting in the identical real session's pending state; neither has been sent to the database yet.
- `db.session.commit()` — Attempts to flush and finalize both real pending objects together, in the identical real transaction - the real moment a `NOT NULL` violation on `invalid` actually surfaces.
- `except IntegrityError as e: print(repr(e.orig))` — Catches the real, specific exception SQLAlchemy raises when a real constraint is violated, and prints the real, original database error wrapped inside it.
- `db.session.rollback()` — Discards every real pending change the failed transaction was holding - not just `invalid`, the one that actually violated a constraint, but everything staged in the identical real session, including `valid`.
- `Machine.query.get('M-TXN-001')` — Queries the real database directly, fresh, for the row that was never actually invalid on its own - returning real `None`, direct proof that the real transaction boundary covered both staged objects together, not one at a time.

### Mental Model

```text
db.session.add(valid)      -- staged, same session
db.session.add(invalid)    -- staged, same session
        |
        v
db.session.commit()   <- ONE real transaction, both objects
        |
        v (NOT NULL violation on invalid)
IntegrityError -> db.session.rollback()
        |
        v
neither valid nor invalid exists in the real database
```

### CS Lens

This is **atomicity**: a group of real operations either all take effect together or none of them do - there is no real, observable state where only some of them happened. Also recognized in: a real filesystem "rename" used to atomically replace one file with another, so no reader ever observes a half-written file; a real multi-statement database migration wrapped in one transaction, so a failure partway through never leaves a schema half-changed; and, in this project's own domain, this project's own real `PDMService.checkout_file`'s five field mutations, all committed together in one real call, for the identical real reason.

### SE Lens

The design principle is that a `Session`'s own real pending state, not any single `.add()` call, is the real unit of "did this happen." The real alternative not chosen here - committing after every single real `.add()` call, individually - would have let `valid` survive on its own, real row already durable before `invalid` was ever attempted; the honest cost of that real alternative: it gives up the exact real guarantee this unit just proved - that a set of real, related changes either all land together or none do - in exchange for nothing this specific scenario actually needed.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-07/lab_transaction_boundary.py` — Runs this as a plain script, from the repository root; uses this app's own real `"testing"` config, so it leaves no real file behind.

### Verification

```text
Seeding default users...
before commit(): two real, pending ORM operations - one valid, one not.
commit() raised a real IntegrityError: IntegrityError('NOT NULL constraint failed: machines.name')
db.session.rollback() called

after rollback(), querying the DATABASE directly for the real, otherwise-valid row:
  Machine.query.get('M-TXN-001'): None
```

Full saved run: `verification/phase-07/lab_transaction_boundary_output.txt`.

### Connection to the previous unit

This lesson's own first unit; it establishes the real, shared boundary a whole `Session`'s pending state is committed or rolled back as - the next unit examines what real state the session is left in once that rollback actually happens.

## Concept Unit: The Session Is Fully Usable Again, Immediately After Rollback

### The Problem

The previous unit's own real `db.session.rollback()` call recovered from a failed commit. But is the identical `db.session` object actually safe to keep using for genuinely new, real work right after - or does a failed transaction leave some real, lingering damage behind?

Before reading on:

- `db.session.rollback()`'s own real job, per its name, is undoing a failed transaction. Given that's its stated job, would you expect calling `db.session.add()` again, immediately after, to work normally, or would you expect some real, extra step to be required first?
- This lesson's own first unit proved a real, previously-valid row (`M-TXN-001`) was rolled back along with the real, invalid one. If this unit adds and commits a completely new, valid `Machine` afterward, would you expect it to succeed on its own merits, unaffected by the earlier, unrelated failure?

### Project Change

- **Reference Source:** Real specimen: the identical real `Machine.name` `NOT NULL` constraint from the previous unit, reused here to force the identical real kind of failure once more.
- **Files affected:** `verification/phase-07/lab_transaction_recovery.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real `Machine` model; SQLAlchemy's own real `IntegrityError` exception class.

### The New Code

A real, failed commit and rollback, immediately followed by a genuinely new, valid real operation on the identical session:

**File:** `verification/phase-07/lab_transaction_recovery.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from sqlalchemy.exc import IntegrityError

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")

with app.app_context():
    invalid = Machine(id="M-TXN-003", category="lathe", sub_type="single_turret")  # no name

    db.session.add(invalid)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        print("real IntegrityError caught and rolled back")

    print()
    print("session used again, right after rollback(), for a genuinely new, valid operation:")
    fresh = Machine(id="M-TXN-004", name="Okuma Genos", category="lathe", sub_type="single_turret")
    db.session.add(fresh)
    db.session.commit()
    print("  commit() succeeded")

    reloaded = Machine.query.get("M-TXN-004")
    print("  Machine.query.get('M-TXN-004'):", reloaded)
    print("  Machine.query.get('M-TXN-003') (the earlier, rolled-back row):", Machine.query.get("M-TXN-003"))
```

### Mechanical Walkthrough

- `db.session.add(invalid); ... except IntegrityError: db.session.rollback()` — The identical real failure-and-recovery sequence as the previous unit, on a fresh, unrelated invalid row - set up purely to put the session into a real, just-recovered state before the real question this unit actually asks.
- `fresh = Machine(id="M-TXN-004", name="Okuma Genos", ...); db.session.add(fresh); db.session.commit()` — A genuinely new, valid `Machine`, added and committed on the identical `db.session` object that just rolled back a failure - no real re-creation of the session, no extra real recovery step beyond the `rollback()` already called.
- `Machine.query.get('M-TXN-004') / Machine.query.get('M-TXN-003')` — Confirms both real facts directly against the database: the new row genuinely exists, and the earlier, rolled-back row genuinely still doesn't - the earlier failure left no real, lingering trace once `rollback()` ran.

### CS Lens

This is **state recovery**: an operation that fails partway through returns the whole real system to a known-good state, rather than leaving it in an undefined, in-between condition. Also recognized in: a real text editor's own "undo" restoring a document to exactly its pre-edit state, not a "close enough" approximation; a real process crash handled by a supervisor that restarts it clean, rather than leaving a half-initialized process running; and, in this project's own domain, this project's own real `PDMService.checkout_file`, whose own early, real `if cam_file.checkout_status == 'checked_out':` check returns a real, structured error before mutating anything at all - a different real technique reaching the identical real goal, never leaving a real half-checked-out row behind.

### SE Lens

The design principle is that `rollback()` doesn't just undo the database's own real state - it also resets the `Session` object itself, so the identical, real, long-lived session (the one this app's own request lifecycle actually reuses) stays usable. The real alternative not chosen here - discarding the whole session and building a fresh one after any real failure - would also work; the honest cost of that real alternative: a fresh `Session` loses real, useful state beyond just pending changes (its own identity map of already-loaded objects), work `rollback()`'s own, narrower real reset preserves wherever it safely can.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-07/lab_transaction_recovery.py` — Runs this as a plain script, from the repository root; uses this app's own real `"testing"` config, so it leaves no real file behind.

### Verification

```text
Seeding default users...
real IntegrityError caught and rolled back

session used again, right after rollback(), for a genuinely new, valid operation:
  commit() succeeded
  Machine.query.get('M-TXN-004'): <Machine Okuma Genos (lathe/single_turret)>
  Machine.query.get('M-TXN-003') (the earlier, rolled-back row): None
```

Full saved run: `verification/phase-07/lab_transaction_recovery_output.txt`.

### Connection to the previous unit

The previous unit proved a failed transaction pulls every pending real operation down with it; this unit closes the lesson by proving that failure is fully, real recoverable - the identical session, not a replacement one, goes right back to normal real work the moment `rollback()` runs.

## Connect the pieces

Two real `Machine` rows, `M-TXN-001` and `M-TXN-002`, staged together in the identical real session - one fully valid, one missing a real, required `name`. `commit()` raises a real `IntegrityError` for both together, and `Machine.query.get( 'M-TXN-001')` returns real `None` afterward, proving the otherwise- valid row was pulled down by the invalid one, because both shared the identical real transaction boundary, not two separate ones. `db.session.rollback()` then clears that real failure completely - proven directly by staging and committing a genuinely new, valid `Machine` (`M-TXN-004`) on the identical session immediately after, which succeeds on its own, real merits, with the earlier failure leaving no real trace behind at all.

**Next lesson:** Every real transaction this lesson built ran against a single, real, already-configured database connection. Next, this curriculum turns to characterizing this project's own real, existing schema in full, before any of it gets rebuilt.