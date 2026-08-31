# Lesson 6.11: Transactions

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Three real scripts against this project's own real Flask app and SQLAlchemy models. The first proves atomicity directly: one real, otherwise-valid row, committed in the SAME transaction as one real, invalid row, is refused right along with it - not partially saved. The second proves what `db.session.rollback()` - already called, unexplained until now, in this curriculum's own Constraints lesson - actually recovers a session from, including a real `PendingRollbackError` this project's own session raises the moment something tries to keep going without it. The third proves isolation directly, using a real, second, independent database connection that cannot see this project's own uncommitted row until the first connection actually commits.

**What you need to know first:** This curriculum's own Constraints and Foreign Keys lessons - `db.session.commit()`, `db.session.add()`, and catching a real `IntegrityError`, all already used without yet being named as parts of a transaction.

## Terms used in this lesson

- **transaction** — A group of one or more real database operations treated as a single, indivisible unit - either every real operation in the group actually takes effect, or none of them do. It exists because some real changes only make sense together - inserting a `CAMFile` and its first real `Sequence` in the same real save, for instance - and a database that only ever applied SOME of a related group of writes could leave data in a state nothing ever intended.
- **atomicity** — The specific guarantee a transaction makes: "all or nothing" - if any real operation inside it fails, every other operation in that SAME transaction is undone too, even ones that were themselves perfectly valid. It exists as the most fundamental transaction guarantee because without it, a transaction would only be a grouping in name - a single real failure partway through could leave some of the group's changes applied and others not, which is the exact opposite of what grouping them was supposed to prevent.
- **commit** — The real, explicit action that makes every operation in the current transaction permanent, all at once - `db.session.commit()` in this project's own real code. It exists as a distinct, separate step from staging changes (`db.session.add(...)`) specifically so several real operations can be staged first and only actually take effect together, at one single, deliberate point, rather than one at a time as each is staged.
- **rollback** — The real, explicit action that discards every operation staged in the current transaction, returning the database to the state it was in before that transaction began. It exists as commit's own real counterpart - the way a transaction that cannot, or should not, be made permanent is undone cleanly, rather than left half-applied or leaving the session unable to do anything further at all.
- **isolation** — The guarantee that one, real, in-progress transaction's own uncommitted changes are invisible to every other real connection, until that transaction actually commits. It exists so a second, real reader can never observe a transaction's changes partway through - only the state before it began, or the complete state after it commits, never an in-between moment nothing was ever supposed to be visible.
- **consistency** — The guarantee that a transaction can only ever move a database from one state that satisfies every real constraint to another state that also satisfies every real constraint - never to a state that violates one. It exists as the natural, combined consequence of atomicity and this curriculum's own Constraints lesson: because an invalid write is refused, and because atomicity ensures a failed write undoes its whole transaction, a committed transaction can never leave behind a row that breaks a real, enforced constraint.

## Objects and methods used

- **`db.session.commit()`**
  - *What it is:* The real SQLAlchemy session method that ends the current transaction by making every staged change permanent, already used throughout this curriculum without being separately named.
  - *Implementation:* Flushes every staged change to the real database connection, then issues a real `COMMIT`, ending the transaction. If the database itself rejects any part of the flush (a real constraint violation), `commit()` raises the real exception instead - already seen as `IntegrityError` in this curriculum's own Foreign Keys and Constraints lessons - and nothing in that failed transaction takes effect at all.
  - *Its use:* This lesson's own Atomicity unit calls it once, on a transaction staging two real rows at once, specifically to observe what happens to BOTH when only one of them is actually invalid.
  - *Type:* A real SQLAlchemy session method.
  - *Responsibility:* Ending a transaction by making its own staged changes permanent, all at once, or raising if the database itself refuses any part of them.
  - *Depends on:* One or more staged changes, already added to the session via `db.session.add(...)`.
  - *Connects to:* Called once per real transaction throughout this curriculum; raises the same real `IntegrityError` this curriculum's own Foreign Keys and Constraints lessons already caught.
  - *Shape:* Takes nothing; returns nothing on success; raises a real exception on failure.

- **`db.session.rollback()`**
  - *What it is:* The real SQLAlchemy session method that discards every staged change in the current transaction, already used once in this curriculum's own Constraints lesson without being explained.
  - *Implementation:* Issues a real `ROLLBACK`, undoing every staged, uncommitted change and returning the session to a clean, usable state - required after a failed `commit()`, since the session otherwise refuses any further real operation.
  - *Its use:* This lesson's own Commit and Rollback unit calls this directly after a failed commit, proving both that it is genuinely required (via the real `PendingRollbackError` raised without it) and that it genuinely restores the session to working order.
  - *Type:* A real SQLAlchemy session method.
  - *Responsibility:* Cleanly discarding a transaction's own staged changes and resetting the session, rather than leaving it stuck.
  - *Depends on:* A session whose current transaction has staged changes, committed or not.
  - *Connects to:* Called directly after catching a real `IntegrityError` in this lesson's own Atomicity unit, and again in its own Commit and Rollback unit.
  - *Shape:* Takes nothing; returns nothing - its effect is entirely the side effect of resetting the session.

- **`PendingRollbackError`**
  - *What it is:* A real SQLAlchemy exception raised when code tries to use a session whose current transaction has already failed, before that session's own required `rollback()` has been called.
  - *Implementation:* Raised by any real operation attempted on the session - even a plain read - once a previous `commit()` has already failed; its own message states plainly that `Session.rollback()` must be called first.
  - *Its use:* This lesson's own Commit and Rollback unit deliberately triggers this, attempting one more real operation right after a failed commit and before calling `rollback()`, to prove the session really does refuse to proceed on its own.
  - *Type:* A real SQLAlchemy exception class.
  - *Responsibility:* Making a broken transaction's own unresolved state impossible to silently ignore - any further real use of the session is refused until it is explicitly cleaned up.
  - *Depends on:* A prior, real, failed `commit()` on the same session, with no `rollback()` called since.
  - *Connects to:* Raised directly by `db.session.get(...)`, in this lesson's own lab, the moment it is called on a session left in this state.
  - *Shape:* A real exception, carrying no return value - its raising is itself the signal.

## Concept Unit: Atomicity - All or Nothing, Even Across Multiple Real Rows

### The Problem

Suppose two real `Machine` rows are staged together, in the same transaction - one with every required field, one missing its real, required `name`. This curriculum's own Constraints lesson already proved the invalid one alone would be refused. What happens to the OTHER, perfectly valid row, staged in that same transaction?

Before reading on:

- If `db.session.add()` merely queues changes and `db.session.commit()` is the one, real, single point everything actually takes effect, what should happen to an otherwise-valid row queued in the SAME transaction as one that gets refused?
- Before running the lab below: does staging two rows one after another, then committing once, behave differently from staging and committing each one separately?

### Project Change

- **Reference Source:** Real, verbatim, read this session, `backend/app/models/machine.py:50`, already cited in this curriculum's own Constraints lesson: ``` name = db.Column(db.String(100), nullable=False) ``` This unit stages a valid `Machine` and an invalid one (missing `name`) in the identical transaction, to observe what atomicity actually does to the valid one.
- **Files affected:** `verification/phase-06/lab_atomicity.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real backend, and its already-installed `sqlalchemy`.

### The New Code

One valid `Machine`, one invalid `Machine`, staged together and committed once:

**File:** `verification/phase-06/lab_atomicity.py` (new)

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from sqlalchemy.exc import IntegrityError

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")

with app.app_context():
    valid = Machine(id="m1", name="Haas VF-2", category="mill", sub_type="3_axis")
    invalid = Machine(id="m2", category="mill", sub_type="3_axis")  # no name - violates NOT NULL
    db.session.add(valid)
    db.session.add(invalid)
    try:
        db.session.commit()
        print("committed both - no error")
    except IntegrityError as e:
        print(f"IntegrityError on the second, invalid row: {e.orig}")
        db.session.rollback()

    print(f"m1 (the OTHER, otherwise-valid row) after rollback: {db.session.get(Machine, 'm1')}")
```

### Mechanical Walkthrough

- `db.session.add(valid) / db.session.add(invalid)` — Two real calls to `db.session.add`, each only STAGING a row - neither one, by itself, touches the real database yet; both rows are pending in the identical, single transaction at this point.
- `db.session.commit() (raises)` — One single, real call attempts to make BOTH staged rows permanent at once. Because `invalid` violates a real `NOT NULL` constraint, the entire real `commit()` fails - not just the one bad row.
- `db.session.rollback()` — Fully treated in this lesson's own Header - discards the entire failed transaction, `valid` included, returning the session to a clean state.
- `db.session.get(Machine, 'm1')` — A real, fresh query against the actual database, confirming `m1` - which was never itself invalid - does not exist either. The database has no memory of `m1` ever having been staged at all.

### CS Lens

This is **atomicity**, fully named in this lesson's own Header - "all or nothing," proven directly rather than merely asserted. Also recognized in: a bank transfer that must both debit one account and credit another, never just one; a file-system rename implemented as "create new, then delete old," which a crash partway through could leave in an inconsistent state without a transactional guarantee; an installer that rolls back every file it already copied if a later step fails, rather than leaving a half-installed program; and, in this project's own domain, checking in a new `CAMFile` revision alongside its own first `Sequence` - both should exist, or neither should, never one without the other.

### SE Lens

The design principle is letting several real operations be treated as one, so a partial failure can never leave data in a state nothing intended. The real alternative NOT chosen here - committing `valid` and `invalid` as two SEPARATE transactions instead of one - would let `valid` survive even if `invalid` failed, at the real cost that a caller must then explicitly decide whether that partial outcome is acceptable, every single time. The honest cost of atomicity itself: grouping operations into one transaction means a single, unrelated-seeming failure can force even perfectly good work in the same transaction to be discarded, exactly as this unit's own lab shows happening to `m1`.

### Commands needed

- `backend\.venv\Scripts\python.exe verification\phase-06\lab_atomicity.py` — Run from the manufacturing-platform repository root, using this project's own real backend virtual environment.

### Verification

```text
Seeding default users...
IntegrityError on the second, invalid row: NOT NULL constraint failed: machines.name
m1 (the OTHER, otherwise-valid row) after rollback: None
```

Full saved run: `verification/phase-06/lab_atomicity_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it proves atomicity directly; the next unit studies commit and rollback themselves, the two real actions that make a transaction's outcome permanent or undo it.

## Concept Unit: Commit and Rollback - Making an Outcome Permanent, or Undoing It

### The Problem

This curriculum's own Constraints lesson already called `db.session.rollback()` once, right after a failed commit, without ever explaining why. What specifically does a failed `commit()` leave behind that makes calling `rollback()` necessary, rather than optional?

Before reading on:

- After a `commit()` fails with a real `IntegrityError`, is the session simply back to normal on its own - or does it need something more before it can be used again?
- If code tried to run one more real query on a session left in that state, without calling `rollback()` first, what would you expect to happen?

### Project Change

- **Reference Source:** No new reference source - this unit studies `db.session.commit()` and `db.session.rollback()` themselves, both already used without explanation in this curriculum's own earlier lessons.
- **Files affected:** `verification/phase-06/lab_commit_rollback.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real backend, and its already-installed `sqlalchemy`.

### The New Code

A failed commit, an attempted real query BEFORE calling `rollback()`, then the same query again AFTER:

**File:** `verification/phase-06/lab_commit_rollback.py` (new)

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from sqlalchemy.exc import IntegrityError, PendingRollbackError

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")

with app.app_context():
    invalid = Machine(id="m2", category="mill", sub_type="3_axis")  # no name - violates NOT NULL
    db.session.add(invalid)
    try:
        db.session.commit()
    except IntegrityError as e:
        print(f"commit failed: IntegrityError - {e.orig}")

    try:
        db.session.get(Machine, "m1")
        print("query ran fine, no rollback needed")
    except PendingRollbackError:
        print("PendingRollbackError - session refuses further work until rollback() is called")

    db.session.rollback()
    print("called db.session.rollback() - the session is usable again")

    db.session.add(Machine(id="m3", name="Okuma Genos", category="lathe", sub_type="single_turret"))
    db.session.commit()
    print(f"committed m3 successfully after rollback: {db.session.get(Machine, 'm3')}")
```

### Mechanical Walkthrough

- `db.session.commit() (fails, inside try/except IntegrityError)` — The identical real failure mode from this lesson's own previous unit - one invalid row, refused.
- `db.session.get(Machine, 'm1') (raises PendingRollbackError)` — A plain, real read - not even a write - attempted on the session immediately after its failed commit, with no `rollback()` called yet. `PendingRollbackError`, fully treated in this lesson's own Header, is raised instead of running the query at all.
- `db.session.rollback()` — Fully treated in this lesson's own Header - the one real action that actually clears the broken transaction state `PendingRollbackError` was just refusing to let anything else proceed past.
- `db.session.add(Machine(id='m3', ...)) / db.session.commit() (succeeds)` — A brand-new, valid `Machine`, staged and committed in a FRESH transaction, now that `rollback()` has actually reset the session - succeeds cleanly, proving the session is genuinely usable again, not merely appearing to be.

### Mental Model

```text
commit() fails (IntegrityError)
      │
      ▼
session left in a broken, "pending rollback" state
      │
      ├── try to use it anyway ──> PendingRollbackError, every time
      │
      └── call rollback() ──> broken state cleared ──> usable again
```

### CS Lens

This is **commit** and **rollback**, both fully named in this lesson's own Header - the two real actions that resolve a transaction's own outcome, one way or the other. Also recognized in: a text editor's own "undo," reverting exactly the changes made since the last save; a version-control `git reset`, discarding staged changes back to the last real commit; a game's own "load last save," undoing everything since that checkpoint; and, in this project's own domain, `db.session.rollback()`'s own real, necessary role every time this curriculum's own earlier labs caught a real `IntegrityError` and needed to keep the session usable afterward.

### SE Lens

The design principle is that a failed transaction must be explicitly resolved, not silently forgotten - `PendingRollbackError` exists specifically so a broken transaction can never be accidentally built on top of. The real alternative NOT chosen here - automatically rolling back on any failure, with no explicit step required - would remove one real line of code from every one of this curriculum's own earlier labs, at the real cost of hiding exactly when and why a transaction failed from whoever is debugging it later. The honest cost of the explicit approach actually used: every single real place in this project's own code that might hit a constraint violation has to remember to call `rollback()` itself, or the session becomes unusable the moment anything else tries to run.

### Commands needed

- `backend\.venv\Scripts\python.exe verification\phase-06\lab_commit_rollback.py` — Run from the repository root, using this project's own real backend virtual environment.

### Verification

```text
Seeding default users...
commit failed: IntegrityError - NOT NULL constraint failed: machines.name
PendingRollbackError - session refuses further work until rollback() is called
called db.session.rollback() - the session is usable again
committed m3 successfully after rollback: <Machine Okuma Genos (lathe/single_turret)>
```

Full saved run: `verification/phase-06/lab_commit_rollback_output.txt`.

### Connection to the previous unit

The previous unit showed atomicity's own real outcome; this unit names the two real actions - commit, rollback - responsible for that outcome, and what happens if rollback is skipped. The final unit studies what a SECOND, real connection can see while all of this is happening.

## Concept Unit: Isolation - What a Second Real Connection Cannot See Yet

### The Problem

Every transaction this lesson has shown so far involved only one real database connection. If a SECOND, completely separate real connection queried the identical database WHILE the first connection's own transaction was still uncommitted, what would it actually see?

Before reading on:

- This lesson's own previous units showed a failed transaction leaving no trace at all once rolled back. Before it fails or succeeds - while it is merely staged - should a SEPARATE, real connection be able to see it early?
- If a second connection COULD see another transaction's uncommitted changes, what real, false conclusion might it draw if that transaction then failed and rolled back?

### Project Change

- **Reference Source:** No real project file changes - this unit demonstrates a general guarantee every real transaction in this project's own database depends on, using two genuinely separate real connections to a shared, real, file-backed database (not the in-memory database this curriculum's own other labs use, specifically so a second, independent connection can reach the identical real data).
- **Files affected:** `verification/phase-06/lab_isolation.py` (new)
- **Change type:** add
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real backend, and its already-installed `sqlalchemy`.

### The New Code

This project's own real app session (session A) adds a row without committing yet; a second, independent real SQLAlchemy connection (session B) queries the same real database file in between:

**File:** `verification/phase-06/lab_isolation.py` (new)

```python
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

DB_PATH = str(Path(__file__).resolve().parent / "isolation_demo.db")
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
os.environ["DATABASE_URL"] = f"sqlite:///{DB_PATH}"
os.environ["SERVE_FRONTEND"] = "0"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import create_app, db
from app.models.machine import Machine

app = create_app("development")

second_connection = create_engine(f"sqlite:///{DB_PATH}")
session_b = sessionmaker(bind=second_connection)()

with app.app_context():
    db.session.add(Machine(id="m1", name="Haas VF-2", category="mill", sub_type="3_axis"))
    db.session.flush()
    print("session A added and flushed a real Machine row - not committed yet")

    print(f"session B, a separate real connection, sees before A commits: {session_b.query(Machine).all()}")

    db.session.commit()
    print("session A commits")

    print(f"session B sees after A commits (a fresh query): {session_b.query(Machine).all()}")

session_b.close()
second_connection.dispose()
```

### Mechanical Walkthrough

- `os.environ["DATABASE_URL"] = f"sqlite:///{DB_PATH}"` — Basic Python plus this project's own real configuration, already cited in this curriculum's own Why Databases Exist lesson - `config.py`'s own `SQLALCHEMY_DATABASE_URI` reads this exact environment variable, which is why setting it here points this project's own real `create_app` at a real, separate file instead of its usual development database.
- `create_engine(...) / sessionmaker(bind=...)` — Real, direct SQLAlchemy constructs (not routed through Flask's own app context) building a SECOND, completely independent connection and session to the identical real file - deliberately separate from the app's own real session, `db.session`, so the two can be observed independently.
- `db.session.flush()` — A real SQLAlchemy session method that sends staged changes to the database WITHOUT committing - the row genuinely exists in the current transaction at this point, but that transaction is still open.
- `session_b.query(Machine).all() (before commit)` — A real, independent query, from the SECOND connection, executed while session A's own transaction is still open and uncommitted - returns an empty list, the real, direct proof of isolation: session B's own connection to the identical physical file cannot see a transaction that has not committed yet.
- `db.session.commit() / session_b.query(Machine).all() (after)` — Once session A's own transaction actually commits, the IDENTICAL query from session B now returns the real row - proving the row was never invisible because it did not exist; it was invisible specifically because it had not yet been committed.

### Mental Model

```text
session A (real app session)      session B (separate real connection)
-----------------------------      -------------------------------------
add + flush Machine m1
(transaction still open)
                                    query -> [] (m1 not visible yet)
commit()
(transaction now closed)
                                    query -> [m1] (now visible)

The identical physical database file, the identical row - visible
to session B only once session A's own transaction actually ends.
```

### CS Lens

This is **isolation**, fully named in this lesson's own Header - one transaction's own in-progress work staying invisible to every other real connection until it commits. Also recognized in: a shared document editor showing collaborators only the last SAVED version, not every uncommitted keystroke as it happens; a bank's own real balance never showing a pending, not-yet-settled transaction as already complete; a build system never exposing a half-written output file to another process reading it concurrently; and, in this project's own domain, two real, simultaneous users never seeing each other's uncommitted, in- progress edits to the identical real machine record.

### SE Lens

The design principle is that a transaction's own in-progress state should never be observable, so nothing downstream can act on data that might still be rolled back. The real alternative NOT chosen - letting other connections see uncommitted changes as they happen - would let a second, real reader act on data that later turns out to have never actually happened, exactly the scenario this lesson's own earlier Atomicity unit showed a failed transaction undoing entirely. The honest cost of real isolation: a second connection querying at the wrong moment gets a real, temporarily stale answer - "not there yet" - even though, from session A's own point of view, the row already exists; isolation trades an up-to-the-instant view for a guarantee that whatever IS seen is always a real, complete, committed state.

### Commands needed

- `backend\.venv\Scripts\python.exe verification\phase-06\lab_isolation.py` — Run from the manufacturing-platform repository root, using this project's own real backend virtual environment. Creates and removes a real, temporary file database under `verification/phase-06/` for the duration of the run.

### Verification

```text
Seeding default users...
session A added and flushed a real Machine row - not committed yet
session B, a separate real connection, sees before A commits: []
session A commits
session B sees after A commits (a fresh query): [<Machine Haas VF-2 (mill/3_axis)>]
```

Full saved run: `verification/phase-06/lab_isolation_output.txt`.

### Connection to the previous unit

The previous unit named commit and rollback as the two real actions resolving a transaction; this unit shows what stays hidden from every other real connection for as long as neither one has happened yet.

## Connect the pieces

Follow one real transaction through every unit. Staged together with an invalid row, an otherwise-valid `Machine` is refused right along with it - atomicity, proven directly, not merely asserted. The session left behind by that failed `commit()` refuses to do anything further - a real `PendingRollbackError` - until `db.session.rollback()` genuinely resets it, the two real actions, commit and rollback, that decide a transaction's own outcome. And for as long as any single real transaction remains uncommitted - staged, flushed, but not yet resolved either way - a second, genuinely separate real connection to the identical database file cannot see it at all, proven directly by running one alongside it. Consistency, the last term this lesson names, is simply what all three already guarantee together: a committed transaction can never leave a real constraint violated, because atomicity would have already undone it, and no other real connection could have acted on it before it was ever real in the first place.

**Next lesson:** Next, the real language behind every one of this phase's own labs - `SELECT`, `INSERT`, `WHERE`, `JOIN` - finally gets taught directly, named and explained rather than deferred, replacing the ORM's own Python calls this curriculum has relied on since Lesson 6.1 with the real statements SQLite itself actually executes underneath them.