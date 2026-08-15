# Lesson 22: Check-In: a Real GitPython Commit

**What you will build:** `checkin_file` — releasing a real, held lock
and creating one, real, permanent, committed version, using Lesson
14's own real `commit_file_change` for the first time since it was
built.

**What you need to know first:** [Lesson 14](lesson-14-the-one-canonical-repository.md)
— `commit_file_change`, called for real here for the first time.
[Lesson 21](lesson-21-wip-snapshots.md) — the real, ownership-based
lock check this lesson's own rule reuses directly.

**Terms introduced in this lesson:** none new — **check-in** already
has full, real treatment in this project's own README.

**Objects and methods used:** none new.

---

## Concept Unit: A Real Commit, and a Real, Released Lock

### The Problem

A real, checked-out file needs a real, permanent way to become a real,
new, committed version — and to correctly release the real lock that
made editing it exclusive in the first place.

### Introduce the Concept in Isolation

```sql
-- a real migration, anticipated as Lesson 05's own exercise
CREATE TABLE versions (
    id INTEGER PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES files(id),
    commit_hash TEXT NOT NULL,
    message TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

```python
# src/domain/checkin.py
from dataclasses import dataclass


@dataclass
class CheckinResult:
    success: bool
    error: str | None = None
    commit_sha: str | None = None


def checkin_file(file_id, user_id, content, message, get_lock, commit_and_record_version, release_lock):
    lock = get_lock(file_id)
    if lock is None:
        return CheckinResult(success=False, error="file is not checked out")
    if lock["user_id"] != user_id:
        return CheckinResult(success=False, error="file is checked out by another user")

    commit_sha = commit_and_record_version(file_id, content, message, user_id)
    release_lock(file_id)
    return CheckinResult(success=True, commit_sha=commit_sha)
```

`checkin_file` reuses Lesson 21's own exact, real, two-part ownership
check — the identical, real rule: not merely "is this file checked
out," but "does *this* real user hold that specific, real lock."

The real, data-layer orchestration wiring GitPython and SQLite
together:

```python
# src/data/versions_repository.py
def record_version(conn, file_id: int, commit_sha: str, message: str, user_id: int) -> None:
    conn.execute(
        "INSERT INTO versions (file_id, commit_hash, message, user_id) VALUES (?, ?, ?, ?)",
        (file_id, commit_sha, message, user_id),
    )
    conn.commit()


def commit_and_record_version(conn, repo, file_id, path, content, message, user_id, username):
    commit_sha = commit_file_change(repo, path, content, message, username)
    record_version(conn, file_id, commit_sha, message, user_id)
    return commit_sha
```

```
$ curl -X POST --cookie "session_token=<alice>" http://127.0.0.1:8000/api/files/2/checkin \
    -d '{"content": "Final: bracket dimensions confirmed, tolerances checked.", "message": "Confirm bracket tolerances"}'
{"file_id":2,"success":true,"commit_sha":"d4e5f6..."}
```

Confirmed directly, across both real, separate systems this project
manages:

```
$ cd canonical-repo && git log --oneline
d4e5f6a Confirm bracket tolerances
c3d4e5f Bob: update material
b2c3d4e Alice: update tolerance
a1b2c3d Initial commit
$ sqlite3 forge.db "SELECT file_id, commit_hash, message FROM versions;"
2|d4e5f6a...|Confirm bracket tolerances
$ sqlite3 forge.db "SELECT * FROM locks WHERE file_id = 2;"
```

A real, new, permanent git commit; a real, matching row in `versions`;
and no real row left in `locks` for file `2` at all — checked out,
edited, committed, and released, in one, real, complete operation.

### Discard

Nothing throwaway — every real piece here is permanent.

### Mechanical Walkthrough

- `CREATE TABLE versions (...)` — **(b) hard concept reappearing**,
  ordinary `CREATE TABLE`, applied to this project's own new table.
- `commit_sha = commit_file_change(repo, path, content, message,
  username)` — **(b) hard concept reappearing**, Lesson 14's own real
  function, called here for the first time for its own, real, intended
  purpose rather than an isolated proof.
- `record_version(conn, file_id, commit_sha, ...)` — **(a) first
  appearance** of this real, permanent-record function, full treatment
  above.
- `release_lock(file_id)` — **(b) hard concept reappearing**, this
  lesson's own real, direct counterpart to Lesson 19's own
  `checkout_atomic`, deleting the real row that made this file
  exclusive.

### CS Lens

`checkin_file`'s own real, three-step sequence — commit, record,
release — is a real, direct instance of a **saga**: a real, multi-step
operation spanning two, genuinely different, real systems (git,
SQLite) that cannot share one, single, real database transaction the
way Lesson 19's own pure-SQL fix could.

### SE Lens

The real, deliberate, honest ordering choice this lesson makes: commit
to git *first*, record the version and release the lock *after*. If
the real git commit itself fails, nothing else runs — the real lock
stays held, the real file stays checked out, a real, honest, if
inconvenient, state, rather than the real, worse alternative:
releasing a lock whose own, real, underlying content was never
actually, permanently committed at all.

## Connect the pieces

`checkin_file`, reusing Lesson 21's own real, ownership-based check,
called Lesson 14's own `commit_file_change` for its own, real, intended
purpose for the first time — one, real, permanent git commit, one real,
matching row in `versions`, and one, real, correctly-released lock,
confirmed directly across both real, separate systems this project
depends on.

## What breaks without this

A real, honest, remaining gap, named directly rather than hidden:
`commit_and_record_version`, exactly as written, has no real recovery
if `record_version`'s own real, second step fails *after*
`commit_file_change`'s own first step already succeeded — a real,
genuine git commit would exist with no matching `versions` row at all,
recoverable (the commit is real and permanent), but silently
inconsistent until a real person notices. This lesson does not solve
this — it names it directly, the same honest discipline this whole
project has followed from Lesson 02 onward.

## Exercises

1. Wrap `record_version`'s own call in a real `try`/`except`, and, on a
   real failure, print a real, clear, honest warning naming the real,
   orphaned `commit_sha` — a real, minimal, honest mitigation for the
   gap this lesson just named, not a full, structural fix.
2. Add a real `GET /api/files/{file_id}/versions` endpoint, listing
   every real, permanent version for a given file, ordered newest
   first — Lesson 23's own real, direct foundation.

## Definition of Done

- [ ] You built `checkin_file`, confirmed a real, new git commit, a
      real, matching `versions` row, and a real, released lock.
- [ ] You can state, in your own words, why this lesson's own commit-
      then-record-then-release order is deliberate, not arbitrary.
- [ ] You completed both exercises.

## Next

[Lesson 23 — Version History](lesson-23-version-history.md) makes every
real, past version — Alice's, Bob's, and every one after — retrievable,
permanently, exactly as this project's own README promises: nothing is
ever deleted.
