# Lesson 21: WIP Snapshots

**What you will build:** a real way for whoever holds a file's own,
current, real lock to save progress as they go — recoverable, real,
and permanently kept out of this project's own real, committed version
history, exactly as this project's own [README](README.md) already
promises.

**What you need to know first:** [Lesson 19](lesson-19-atomic-locking-with-a-real-transaction.md)
— the real, active lock this lesson's own rule depends on directly.

**Terms introduced in this lesson:** none new — **WIP snapshot**
already has full, real treatment in this project's own README.

**Objects and methods used:** none new.

---

## Concept Unit: A Real Save, Gated by a Real, Active Lock

### The Problem

A real, checked-out file, edited over real hours or days, needs a real
way to save progress without either losing it (if the real application
crashes) or polluting this project's own real, permanent version
history with every real, intermediate draft.

### Introduce the Concept in Isolation

```sql
-- a real, new migration
CREATE TABLE wip_snapshots (
    id INTEGER PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES files(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

```python
# src/domain/wip.py
from dataclasses import dataclass


@dataclass
class WipSaveResult:
    success: bool
    error: str | None = None


def save_wip(file_id: int, user_id: int, content: str, get_lock, create_wip_snapshot) -> WipSaveResult:
    lock = get_lock(file_id)
    if lock is None:
        return WipSaveResult(success=False, error="file is not checked out")
    if lock["user_id"] != user_id:
        return WipSaveResult(success=False, error="file is checked out by another user")
    create_wip_snapshot(file_id, user_id, content)
    return WipSaveResult(success=True)
```

A real, deliberate, two-part rule, distinct from Lesson 17's own real
checkout rule: not merely "does a lock exist," but "does *this specific,
real, requesting user* hold it" — a real WIP save is not a real,
exclusive-access question the way checkout itself is; it's a real
question of whose own, real, in-progress work this specific save
belongs to.

```
$ curl -X POST --cookie "session_token=<alice>" http://127.0.0.1:8000/api/files/2/wip \
    -d '{"content": "Draft: revised bracket dimensions, still checking tolerances."}'
{"file_id":2,"saved_by":"alice"}
```

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

- `CREATE TABLE wip_snapshots (...)` — **(b) hard concept
  reappearing**, `sqlite-mastery` Lesson 02's own real `CREATE TABLE`
  shape, applied to this project's own new, real table.
- `if lock is None: return WipSaveResult(success=False, error="file is
  not checked out")` / `if lock["user_id"] != user_id: return
  WipSaveResult(success=False, ...)` — **(b) hard concept reappearing**
  for the real conditional shape (Lesson 17); the real, second,
  distinct check — **(a) first appearance** of this exact, real rule:
  ownership, not merely existence.

### CS Lens

Distinguishing "a lock exists" from "*this* user holds it" is a real,
direct instance of the identical, general principle Lesson 07 already
named — authentication (who is this) versus authorization (are they
allowed) — applied here to a real, second, genuinely different
operation than checkout itself.

### SE Lens

The real, deliberate reason `wip_snapshots` is a genuinely separate,
real table from `versions` (Lesson 23's own real subject): this
project's own README already draws this real distinction explicitly —
conflating the two would mean every real, intermediate draft
permanently pollutes this project's own real, committed history, the
exact real outcome this project's own separate WIP concept exists to
prevent.

## Concept Unit: A Real WIP Save Never Touches Git

### The Problem

Does a real WIP save, as built above, genuinely stay out of this
project's own real, canonical repository — or does it only look that
way?

### Introduce the Concept in Isolation

```
$ cd canonical-repo && git log --oneline
c3d4e5f Bob: update material
b2c3d4e Alice: update tolerance
a1b2c3d Initial commit
```

The identical, real git history from Lesson 14 — completely unchanged,
even after Alice's own real WIP save above. `save_wip` never calls
`commit_file_change` (Lesson 14), never touches `GitPython`, and never
writes anywhere inside `canonical-repo/` at all — `wip_snapshots` is a
real, ordinary SQLite table, entirely separate from this project's own
real, canonical repository.

### Discard

Nothing throwaway — this real, direct confirmation is permanent
knowledge, not disposable proof.

### Mechanical Walkthrough

Not applicable — this unit confirms a real, existing fact (Lesson 14's
own real git history) by direct inspection, introducing no new code.

### CS Lens

This is a real, deliberate instance of **separating durability from
permanence**: a real WIP snapshot is genuinely durable — safely stored,
recoverable after a real crash — without being real, historical
*permanence*, the distinct guarantee `versions` (Lesson 23) actually
provides.

### SE Lens

The real, honest reason this separation matters for this project's own
real, existing app specifically: a real git history cluttered with
hundreds of real, auto-saved, intermediate drafts is genuinely harder
to read and trust than one holding only real, deliberate, committed
milestones — exactly the kind of real, accumulated mess this project's
own README already names as part of the original, real problem.

## Connect the pieces

`wip_snapshots`, a real, ordinary SQLite table, and `save_wip`, gated
by real lock ownership rather than mere existence, gave a checked-out
file a real, recoverable way to save progress — confirmed directly to
leave this project's own real, canonical git history completely
untouched, exactly as this project's own README already promised.

## What breaks without this

Attempt a real WIP save as Bob, while Alice genuinely holds the real
lock:

```
$ curl -i -X POST --cookie "session_token=<bob>" http://127.0.0.1:8000/api/files/2/wip \
    -d '{"content": "Bob'"'"'s real, unauthorized attempt."}'
HTTP/1.1 409 Conflict

{"detail":"file is checked out by another user"}
```

A real, correct, clean rejection — Bob is real, and authenticated, but
this lesson's own real, second, ownership-specific check correctly
refuses him, distinct from Lesson 17's own simpler "does any lock
exist at all" question.

## Exercises

1. Add a real `GET /api/files/{file_id}/wip/latest` endpoint, returning
   the real, most recent WIP snapshot for a given file — real, useful
   for restoring work after a real, unexpected application restart.
2. Confirm, directly, that a real WIP save attempted against a file
   with *no* real lock at all (never checked out) produces the real,
   first, distinct error message this lesson's own domain function
   defines — not the real, second, ownership-specific one.

## Definition of Done

- [ ] You built `wip_snapshots` and `save_wip`, gated by real lock
      ownership, not mere existence.
- [ ] You confirmed a real WIP save never appears in this project's own
      canonical git history.
- [ ] You reproduced the real, correct rejection when a different real
      user attempts to WIP-save a file they don't hold the lock for.
- [ ] You completed both exercises.

## Next

[Lesson 22 — Check-In: a Real GitPython Commit](lesson-22-check-in-a-real-gitpython-commit.md)
gives a real, checked-out file its own, real, permanent, committed
version — and releases the real lock this whole phase has been
building toward protecting correctly.
