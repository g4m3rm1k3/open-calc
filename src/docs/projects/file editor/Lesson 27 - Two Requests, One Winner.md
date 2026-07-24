# Lesson 27: Two Requests, One Winner

## What you will build

A real, reproducible bug in last lesson's `/checkout` route, found by
firing many simultaneous checkout requests at the same file and
watching some of them crash the server — and the fix, which turns that
crash into the same clean `409 Conflict` a slower duplicate request
already gets. The transferable idea is **TOCTOU** (time-of-check to
time-of-use): a gap between checking a condition and acting on it, wide
enough for another request to land in between.

## What you need to know first

`Lesson 26 - Check In, Check Out.md` — the `/checkout` route and
`checkout_file`, both being fixed directly in this lesson, and the
`locks` table's `PRIMARY KEY` constraint whose violation this lesson
catches. `Lesson 16 - A Real User Store.md` — `sqlite3.IntegrityError`,
first surfaced there via `create_user`'s own `username UNIQUE`
constraint.

---

## Concept Unit: a check that isn't as safe as it looks

### The Problem

`/checkout` (Lesson 26) does two separate things in sequence: it calls
`get_lock` to check whether a file is already claimed, and — only if
that check comes back empty — it calls `checkout_file` to claim it.
Those are two separate database round trips, not one atomic operation.
Nothing stops a second `/checkout` request for the same file from
arriving *between* them.

### Concept Lab

```python
import concurrent.futures
import urllib.request
import json

usernames = [f"racer{i}" for i in range(15)]
for username in usernames:
    request = urllib.request.Request(
        "http://127.0.0.1:8001/signup",
        data=json.dumps({"username": username, "password": "racepassword123"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(request)
    except urllib.error.HTTPError:
        pass

def login(username):
    request = urllib.request.Request(
        "http://127.0.0.1:8001/login",
        data=json.dumps({"username": username, "password": "racepassword123"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    return json.load(urllib.request.urlopen(request))["token"]

tokens = [login(username) for username in usernames]

def checkout(token):
    request = urllib.request.Request(
        "http://127.0.0.1:8001/checkout?path=src/main.py",
        headers={"Authorization": "Bearer " + token},
        method="POST",
    )
    try:
        response = urllib.request.urlopen(request)
        return response.status, response.read().decode()
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode()

with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
    results = list(executor.map(checkout, tokens))

for status, body in results:
    print(status, body)
```

Run against a real running server — actual output, this exact run:

```
200 {"path":"src/main.py","checked_out_by":"racer0"}
500 Internal Server Error
409 {"detail":"Already checked out by racer0"}
500 Internal Server Error
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
409 {"detail":"Already checked out by racer0"}
```

The server's own log, for one of the two `500`s:

```
sqlite3.IntegrityError: UNIQUE constraint failed: locks.path
  File "backend\db.py", line 54, in checkout_file
  File "backend\main.py", line 180, in checkout
```

### What This Proves

Fifteen accounts fire `/checkout` for the exact same path at
(approximately) the same instant, via
`concurrent.futures.ThreadPoolExecutor` — a first appearance of running
several requests genuinely in parallel from Python, rather than one
after another. One request wins cleanly (`200`). Twelve lose cleanly —
Lesson 26's existing `get_lock` check catches them, since by the time
they run it, racer0's row already exists. But two requests raise a raw
`500 Internal Server Error`, not a clean `409` — the real traceback
shows exactly why: both of those two requests called `get_lock` and
found *nothing* (racer0's `INSERT` hadn't committed yet when they
checked), so both proceeded to call `checkout_file`, and the second of
those two collided with the `PRIMARY KEY` constraint from Lesson 26,
raising `sqlite3.IntegrityError` — an exception nothing in `/checkout`
catches, so FastAPI turns it into a bare `500`, with no useful message
reaching the client at all.

### Discard

This lab's exact fifteen-account setup is deleted now — it never
appears in the project. The real fix, in the next unit, changes
`checkout_file` itself, verified afterward by rerunning this identical
scenario.

---

## Concept Unit: letting the constraint be the actual source of truth

### The Problem

The `get_lock`-then-`checkout_file` sequence in `/checkout` is a
**check, then act** pattern — and the gap between the check and the act
is exactly where the previous unit's race lives. The fix isn't to make
that gap smaller (there is no reliable way to do that from application
code); it's to stop treating the check as the actual guarantee. The
`PRIMARY KEY` constraint Lesson 26 added is already the real guarantee
— `checkout_file` just needs to handle what happens when that guarantee
is the thing that actually fires.

### Project Change

- **Files affected** — `backend/db.py`, `backend/main.py`, both
  existing files.
- **Change type** — replace, `checkout_file`'s body; add, a new
  exception class in `db.py`, a `try`/`except` in `main.py`'s
  `/checkout` route, and `LockConflictError` added to `main.py`'s
  existing `from db import ...` line.
- **Location** — `checkout_file`, added last lesson, directly below
  `get_user`; `/checkout`'s single `checkout_file(...)` call, added last
  lesson; the `from db import ...` line at the top of `main.py`, present
  since Lesson 16.
- **Dependencies** — `sqlite3.IntegrityError`, already surfaced by
  SQLite itself (no new import).

### The New Code — type this

A new, empty exception class, giving this specific failure a name of
its own instead of leaking SQLite's own exception type up to `main.py`:

```python
class LockConflictError(Exception):
    pass
```

`checkout_file` now catches the real `IntegrityError` and converts it:

```python
def checkout_file(path: str, username: str) -> None:
    connection = get_connection()
    try:
        connection.execute(
            "INSERT INTO locks (path, username, checked_out_at) VALUES (?, ?, datetime('now'))",
            (path, username),
        )
        connection.commit()
    except sqlite3.IntegrityError:
        raise LockConflictError(path)
    finally:
        connection.close()
```

`/checkout` catches that new exception and turns it into the same clean
`409` a slower duplicate already gets:

```python
try:
    checkout_file(relative_path, current_user)
except LockConflictError:
    raise HTTPException(status_code=409, detail="Already checked out by someone else")
```

### The Updated Project — where this lives

`checkout_file`, in full, in `backend/db.py`:

```python
class LockConflictError(Exception):
    pass


def checkout_file(path: str, username: str) -> None:
    connection = get_connection()
    try:
        connection.execute(
            "INSERT INTO locks (path, username, checked_out_at) VALUES (?, ?, datetime('now'))",
            (path, username),
        )
        connection.commit()
    except sqlite3.IntegrityError:
        raise LockConflictError(path)
    finally:
        connection.close()
```

`main.py`'s import line grows to include the new exception class:

```python
from db import init_db, create_user, get_user, checkout_file, checkin_file, get_lock, LockConflictError   # ← changed: added LockConflictError
```

`/checkout`, in full, in `backend/main.py`, with the changed lines
marked:

```python
@app.post("/checkout")
def checkout(path: str, current_user: str = Depends(require_auth)):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    relative_path = target_file.relative_to(CONTENT_DIR).as_posix()
    existing_lock = get_lock(relative_path)

    if existing_lock is not None:
        lock_path, lock_username, checked_out_at = existing_lock
        raise HTTPException(status_code=409, detail=f"Already checked out by {lock_username}")

    try:                                                                  # ← new
        checkout_file(relative_path, current_user)                       # ← changed
    except LockConflictError:                                            # ← new
        raise HTTPException(status_code=409, detail="Already checked out by someone else")  # ← new

    return {"path": path, "checked_out_by": current_user}
```

`checkout_file` no longer lets a `PRIMARY KEY` violation escape as a raw
database exception — it translates that violation into
`LockConflictError`, a name specific to this project's own domain.
`/checkout` still does its fast, friendly `get_lock` check first (most
callers hit that path, and it names the actual current holder), but now
also survives the rare case where a second request slips past that
check — the `try`/`except` around `checkout_file` is what actually makes
the route race-safe, not the `get_lock` check above it.

### Mechanical Walkthrough
- `class LockConflictError(Exception): pass` — first appearance of
defining a custom exception type in this project: `Exception` is
Python's built-in base class every exception ultimately inherits from,
and `pass` means this new class adds no behavior of its own, existing
purely to be a distinct, catchable name. `try: ... except
- sqlite3.IntegrityError: raise LockConflictError(path)` — first
appearance of one exception being caught and *re-raised as a different
type*: `sqlite3.IntegrityError` is SQLite's own generic exception,
reused here from `create_user`'s existing exposure to it; catching it
and raising `LockConflictError(path)` in its place hides the
database-specific detail from anything upstream, so `main.py` never
needs to know SQLite specifically is involved. `finally: connection.close()`
- — first appearance of a `finally` block: unlike the code before this
fix, which only closed the connection after a successful `commit()`,
`finally` runs whether the `try` block succeeded or raised, guaranteeing
the connection is always closed either way. `try: checkout_file(...)
- except LockConflictError:` in `/checkout` — the same `try`/`except`
shape already used throughout this project for expected failure modes,
here catching this lesson's own new exception rather than a bare
database one.

### Execution trace

Two requests, call them A and B, arrive close enough together that both
run before either commits:

```
A: get_lock("src/main.py") → None (no row yet)
B: get_lock("src/main.py") → None (A hasn't inserted yet)
A: checkout_file("src/main.py", "racerA") → INSERT succeeds, commits
B: checkout_file("src/main.py", "racerB") → INSERT raises IntegrityError
B: caught, re-raised as LockConflictError("src/main.py")
B: /checkout catches LockConflictError → HTTPException(409, "Already checked out by someone else")
```

A ends up holding the lock; B receives a clean `409`, exactly as if B's
request had simply arrived a moment later and hit the ordinary
`get_lock` check instead.

### CS Lens — TOCTOU, and letting the database be the lock

**Time-of-check to time-of-use (TOCTOU)** names exactly this shape: a
condition is checked, then acted on, and the world can change in
between. The fix here doesn't shrink that gap — it accepts the gap will
always exist in a check written in application code, and instead relies
on an operation the database performs atomically: a single `INSERT`
either fully succeeds or fully fails, with no window for a second
request to observe a half-finished state. The `get_lock` check stays,
purely as a fast, user-friendly path; the actual correctness guarantee
now lives entirely in the `PRIMARY KEY` constraint and this unit's
`try`/`except`.

Also recognized in: `os.path.exists()` followed by `open()` in file
handling (the file can be deleted in between — Python's own
`FileNotFoundError` handling exists for this reason), check-then-set
race conditions in caching layers, double-spending in early,
naively-designed payment systems, optimistic concurrency control in
databases generally (checking a version number, then updating, and
retrying on conflict).

### SE Lens — a fast path that's honest about not being the whole story

Keeping `get_lock` as a first check, rather than deleting it and relying
solely on the `try`/`except`, is a deliberate choice: it makes the
*common* case (a file that's been locked for a while) return a fast,
specific error naming the actual current holder, without needing to
provoke a database exception on every single rejected attempt.
Exceptions are more expensive than a plain conditional in most runtimes,
including Python's. The tradeoff being named honestly: this is now two
layers of the same guarantee, one fast and slightly-stale, one slow and
authoritative — worth the small duplication, since the alternative
(trusting the fast layer alone) is exactly the bug this lesson found.

### Commands needed to make this unit real

None new — the fix uses `sqlite3.IntegrityError`, already available
through the `sqlite3` import at the top of `db.py` since Lesson 16.

### Run It

The previous unit's exact fifteen-account race, rerun against this
fix — actual output, this exact run:

```
409 {"detail":"Already checked out by someone else"}
200 {"path":"src/main.py","checked_out_by":"racer1"}
409 {"detail":"Already checked out by someone else"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
409 {"detail":"Already checked out by racer1"}
```

Exactly one `200`, fourteen `409`s, zero `500`s — the server's own log
for this run contains no `IntegrityError` and no `ERROR` line at all,
confirmed by grepping it directly. The two requests that previously
crashed the server now receive the honest `"Already checked out by
someone else"` message instead.

---

## Connect the pieces

Fifteen requests for the same file, fired at once: FastAPI runs each
one's `get_lock` check, and — because of real timing, not anything
predictable or controllable — a small number of them (racer0 in the
first run, two of the fifteen requests in total) pass that check before
any of them has actually inserted a row. Every one of those requests
then calls `checkout_file`. Exactly one of them wins the underlying
`INSERT`; every other one racing it hits the `PRIMARY KEY` constraint,
raises `sqlite3.IntegrityError`, and — because of this lesson's fix —
that exception is caught inside `checkout_file`, re-raised as
`LockConflictError`, and caught again in `/checkout`, becoming a clean
`409` instead of a server crash. The requests that lost the *earlier*
`get_lock` check (the other thirteen, in the actual run above) never
reach this code path at all — they were already rejected before ever
calling `checkout_file`.

## What breaks without this

Already demonstrated with real, pasted output above, not hypothetical:
without the `try`/`except` around `checkout_file`'s `INSERT`, a real
concurrent request race produces a raw `500 Internal Server Error` —
confirmed twice in this lesson's first unit, from an actual
`ThreadPoolExecutor` run against the real server, with the real
`sqlite3.IntegrityError` traceback pasted directly from the server log.

## Exercises

1. Temporarily remove the `try`/`except` from `checkout_file`, rerun
   this lesson's race scenario against a fresh checked-in file, and
   confirm real `500`s reappear — then restore the fix.
2. Increase the concept lab's `max_workers` and account count (try 50)
   and confirm the fix still produces exactly one `200` and the rest
   `409`s, regardless of how many requests race.
3. Explain, without looking back at this lesson, why keeping the
   `get_lock` check in `/checkout` is still worth doing even though the
   `try`/`except` alone would already be correct.
4. Find one other place in this project where a check and a later
   action are separated by a database round trip (`/checkin` is one
   candidate) — decide, and justify, whether the same race is possible
   there and whether it matters.

## Definition of done

- [ ] You've reproduced the real `500` yourself, with the fix removed,
      using this lesson's concept lab against your own running server
- [ ] You've confirmed the fix eliminates the `500`s under the same
      real concurrent load
- [ ] You can explain TOCTOU in your own words, using this exact
      `/checkout` race as the concrete example
- [ ] You can explain why the fix relies on catching
      `sqlite3.IntegrityError` rather than trying to close the timing
      gap between `get_lock` and `checkout_file`
- [ ] `git commit` this lesson's code with a message explaining why
