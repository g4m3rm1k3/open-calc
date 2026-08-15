# Lesson 27: The Audit Log

**What you will build:** a real, permanent `audit_log` table, and a
real, deliberate decision to record every checkout inside the exact,
same, real, atomic transaction that creates the lock itself — closing
Lesson 07's own real, third "Accounting" piece of the AAA framework, for
good.

**What you need to know first:** [Lesson 07](lesson-07-what-authentication-actually-means.md)
— its own real CS Lens, already naming Accounting as the real, third
piece this lesson finally builds. [Lesson 19](lesson-19-atomic-locking-with-a-real-transaction.md)
— `checkout_atomic`'s own real transaction, extended directly here.

**Terms introduced in this lesson:** none new.

**Objects and methods used:** none new.

---

## Concept Unit: One Real Transaction, Two Real Writes

### The Problem

This project's own real, permission-sensitive actions — checkout,
check-in, creating an admin — currently leave no real, permanent record
of who did what, or when.

### Introduce the Concept in Isolation

```sql
-- a real, new migration
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    target TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

`checkout_atomic` (Lesson 19), extended to record its own real audit
entry inside the identical, same, real `BEGIN IMMEDIATE` transaction
that creates the lock:

```python
def checkout_atomic(conn, file_id: int, user_id: int) -> bool:
    conn.execute("BEGIN IMMEDIATE")
    try:
        existing = conn.execute("SELECT * FROM locks WHERE file_id = ?", (file_id,)).fetchone()
        if existing is not None:
            conn.rollback()
            return False
        conn.execute("INSERT INTO locks (file_id, user_id) VALUES (?, ?)", (file_id, user_id))
        conn.execute(
            "INSERT INTO audit_log (user_id, action, target) VALUES (?, 'checkout', ?)",
            (user_id, str(file_id)),
        )
        conn.commit()
        return True
    except Exception:
        conn.rollback()
        raise
```

```
$ sqlite3 forge.db "SELECT user_id, action, target, created_at FROM audit_log;"
1|checkout|2|2026-01-15 09:00:00
```

A real, permanent record, created *only* if the real checkout itself
genuinely succeeded — both real writes, the lock and its own audit
entry, commit together, or neither one does at all.

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

- `CREATE TABLE audit_log (...)` — **(b) hard concept reappearing**,
  ordinary `CREATE TABLE`.
- `conn.execute("INSERT INTO audit_log (...) VALUES (...)")` inside
  `checkout_atomic`'s own, already-existing transaction — **(b) hard
  concept reappearing** for `INSERT` itself; its real, deliberate
  *placement*, inside the identical, already-open transaction rather
  than a real, separate call afterward — **(a) first appearance** of
  this specific, real pattern.

### CS Lens

Recording a real audit entry inside the identical, real transaction as
the action it describes is a direct, concrete instance of **atomicity
extended to a compound write**: the real guarantee `BEGIN IMMEDIATE`
already provides for the lock alone (Lesson 19) now covers both real
writes together — the identical underlying principle
`sqlite-mastery`'s own Lesson 14 already named directly: every
operation in a real transaction succeeds, or none of them do.

### SE Lens

The real, deliberate reason this lesson bundles the audit write into
the same, real transaction, rather than a real, separate call after
`checkout_atomic` returns: this specific case — unlike Lesson 22's own,
real, honest, cross-system git-plus-SQL gap — involves two, real writes
to the *same* real database, which genuine SQL transactions can, and
therefore should, cover together completely.

## Concept Unit: What a Separate, Real Call Would Risk

### The Problem

Does the real, specific choice to bundle these two writes together
actually matter, or would a real, separate call afterward have worked
just as well?

### Introduce the Concept in Isolation

The real, tempting, separate-call alternative:

```python
def checkout_and_audit_separately(conn, file_id: int, user_id: int) -> bool:
    success = checkout_atomic_without_audit(conn, file_id, user_id)
    if success:
        record_audit_event(conn, user_id, "checkout", str(file_id))
    return success
```

A real, deliberate crash, inserted between the two, real, separate
calls, to prove the real, concrete risk directly:

```python
def checkout_and_audit_separately(conn, file_id, user_id):
    success = checkout_atomic_without_audit(conn, file_id, user_id)
    if success:
        raise RuntimeError("simulated crash before the audit call")
        record_audit_event(conn, user_id, "checkout", str(file_id))
    return success
```

```
$ python -c "
from src.data.locks_repository import checkout_and_audit_separately
import sqlite3
conn = sqlite3.connect('forge.db')
checkout_and_audit_separately(conn, 3, 1)
"
Traceback (most recent call last):
  ...
RuntimeError: simulated crash before the audit call
$ sqlite3 forge.db "SELECT * FROM locks WHERE file_id = 3;"
3|1|2026-01-15 09:05:00
$ sqlite3 forge.db "SELECT * FROM audit_log WHERE target = '3';"
```

A real, genuine, silent gap — the real checkout itself genuinely
succeeded, and permanently exists in `locks`, but the real, simulated
crash means its own audit entry was never written at all. This is
direct, provable proof of exactly why this lesson's own first unit
bundles both real writes into one transaction: a real crash between two
separate, sequential calls can leave a genuinely successful action with
no real record of it ever having happened.

### Discard

`checkout_and_audit_separately` is real, disposable proof of this
real risk — never a permanent part of this project; the real, bundled
version from this lesson's own first unit is what remains.

### Mechanical Walkthrough

- `raise RuntimeError("simulated crash before the audit call")` — **(c)
  already basic**, ordinary Python; its real, deliberate placement,
  between two, real, separate writes that should have been one
  transaction, is this unit's own entire point.

### CS Lens

This is real, direct proof of the identical risk Lesson 22's own SE
Lens already named honestly for a genuinely harder, cross-system case
— here occurring within a *single* real database, where the real,
correct fix (one transaction, not two separate calls) is fully,
completely available, and this lesson's own first unit already applies
it.

### SE Lens

The real, honest, general rule this lesson leaves this project with:
whenever two, real, related writes belong to the identical, real
database, and one without the other would leave a genuinely
inconsistent, real state, they belong inside the same, real
transaction — never two, separate, sequential calls trusting nothing
goes wrong in between.

## Connect the pieces

`audit_log`, a real, permanent table, closed Lesson 07's own real,
named "Accounting" gap directly — every real checkout now leaves a
permanent, real trail, written inside the identical, real, atomic
transaction that creates the lock itself. A real, deliberate crash,
inserted into a real, separate-call alternative, proved directly why
that bundling matters: a real action can genuinely succeed while its
own, real audit record silently never exists at all, the instant the
two are pulled apart into separate, sequential writes.

## What breaks without this

Not applicable beyond this lesson's own second unit, which is itself
this lesson's real, concrete proof — the real, silently missing audit
row *is* this lesson's own "what breaks" demonstration.

## Exercises

1. Extend `checkin_atomic` (Lesson 19's own exercise) and `create_admin`
   (Lesson 11) to record their own real audit entries, following this
   lesson's own exact, bundled-transaction pattern.
2. Add a real `GET /api/audit-log` endpoint, protected with
   `require_role("admin")`, listing every real, recorded action,
   newest first, joined against `users` for a real, readable username.

## Definition of Done

- [ ] You built `audit_log` and extended `checkout_atomic` to record
      an entry inside its own, existing transaction.
- [ ] You reproduced the real, silent audit gap a separate-call version
      would risk, and confirmed the bundled version doesn't have it.
- [ ] You completed both exercises.

## Next

[Lesson 28 — Notifications](lesson-28-notifications.md) closes Phase 5
with a real, honest signal the moment a checked-out file becomes
available again.
