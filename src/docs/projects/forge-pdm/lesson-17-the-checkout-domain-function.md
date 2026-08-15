# Lesson 17: The Checkout Domain Function

**What you will build:** `checkout_file` — this project's own real,
central business rule, in exactly one, real, pure place: a file can be
checked out only if no real lock already exists for it. Correct in
isolation, and honestly, explicitly flagged as not yet safe under real,
concurrent load — Lesson 18's own real subject, not solved here.

**What you need to know first:** [Lesson 05](lesson-05-schema-migrations.md)
— the real `locks` table, with its own real `file_id UNIQUE` constraint,
this lesson's own rule sits directly on top of. [Lesson 02](lesson-02-the-domain-layer-for-real.md)
— the real domain-layer rule this lesson upholds once more: no FastAPI,
no SQL, inside `checkout_file` itself.

**Terms introduced in this lesson:**
- **TOCTOU (time-of-check to time-of-use)** — a real, named race
  condition: the real moment a condition is *checked* (is this file
  already locked?) and the real moment an action is *taken* based on
  that check (create the lock) are two, separate, real steps — and
  nothing yet stops another, real, concurrent request from acting in
  between them.

**Objects and methods used:**

**`functools.partial`**
- *What it is:* a real, standard-library Python function.
- *Implementation:* `partial(func, *args)` returns a real, new,
  callable object — calling it later supplies any real, remaining
  arguments `func` still needs, with `args` already, permanently bound.
- *Its use:* binding a real, live database connection into a real
  repository function, producing something `checkout_file` can call
  with only a real `file_id`, never needing to know a connection
  exists at all.

---

## Concept Unit: The Real Rule, in One Real, Pure Place

### The Problem

Lesson 14 and Lesson 16 both proved, directly, that this project's own
real, central promise — one person holds a file at a time — is not yet
enforced anywhere. That real rule needs exactly one, real, correct
home.

### Introduce the Concept in Isolation

```python
# src/domain/checkout.py
from dataclasses import dataclass


@dataclass
class CheckoutResult:
    success: bool
    error: str | None = None


def checkout_file(file_id: int, user_id: int, get_lock, create_lock) -> CheckoutResult:
    existing_lock = get_lock(file_id)
    if existing_lock is not None:
        return CheckoutResult(success=False, error="file is already checked out")
    create_lock(file_id, user_id)
    return CheckoutResult(success=True)
```

`get_lock` and `create_lock` are not real, concrete data-access calls —
they're real, plain function *parameters*, following the identical
real pattern Vault's own Lesson 16 already established: `checkout_file`
receives whatever real function can answer "is this file locked" and
"create a lock," rather than importing `sqlite3` or `files_repository`
directly, upholding Lesson 02's own real rule once more.

A real, isolated proof, using two, real, trivial, in-memory stand-ins
— no real database at all:

```
$ python -c "
from src.domain.checkout import checkout_file

locks = {}
get_lock = lambda file_id: locks.get(file_id)
create_lock = lambda file_id, user_id: locks.__setitem__(file_id, user_id)

print(checkout_file(1, user_id=1, get_lock=get_lock, create_lock=create_lock))
print(checkout_file(1, user_id=2, get_lock=get_lock, create_lock=create_lock))
"
CheckoutResult(success=True, error=None)
CheckoutResult(success=False, error='file is already checked out')
```

The real, correct rule, proven directly, with zero real SQL and zero
real HTTP anywhere in sight — a real, plain Python dictionary standing
in for real, persistent storage is entirely sufficient to prove
`checkout_file`'s own real logic is correct.

Wired through this project's own real repository and a real endpoint:

```python
# src/data/locks_repository.py
def get_lock(conn, file_id: int):
    return conn.execute("SELECT * FROM locks WHERE file_id = ?", (file_id,)).fetchone()


def create_lock(conn, file_id: int, user_id: int) -> None:
    conn.execute("INSERT INTO locks (file_id, user_id) VALUES (?, ?)", (file_id, user_id))
    conn.commit()
```

```python
# src/api/checkout.py
from functools import partial

from fastapi import APIRouter, Depends, HTTPException

from src.data.database import get_db
from src.data.locks_repository import create_lock, get_lock
from src.domain.checkout import checkout_file

router = APIRouter()


@router.post("/api/files/{file_id}/checkout")
def checkout(file_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    result = checkout_file(
        file_id,
        current_user["id"],
        get_lock=partial(get_lock, db),
        create_lock=partial(create_lock, db),
    )
    if not result.success:
        raise HTTPException(status_code=409, detail=result.error)
    return {"file_id": file_id, "checked_out_by": current_user["username"]}
```

```
$ curl -i --cookie "session_token=<alice>" -X POST http://127.0.0.1:8000/api/files/1/checkout
HTTP/1.1 200 OK

{"file_id":1,"checked_out_by":"alice"}
$ curl -i --cookie "session_token=<bob>" -X POST http://127.0.0.1:8000/api/files/1/checkout
HTTP/1.1 409 Conflict

{"detail":"file is already checked out"}
```

### Discard

Nothing throwaway — every real piece here is permanent; the real,
in-memory dictionary lab is disposable proof of `checkout_file`'s own
correctness in isolation, never real project code itself.

### Mechanical Walkthrough

- `def checkout_file(file_id, user_id, get_lock, create_lock):` —
  **(a) first appearance** of this exact, real, dependency-injected
  shape: real functions passed as real parameters, rather than
  imported directly.
- `existing_lock = get_lock(file_id); if existing_lock is not None:
  return CheckoutResult(success=False, ...)` — **(c) already basic**,
  ordinary Python conditional logic; the real, deliberate *rule* it
  encodes is this unit's own entire point.
- `partial(get_lock, db)` / `partial(create_lock, db)` — **(a) first
  appearance**, full treatment above.
- `raise HTTPException(status_code=409, detail=result.error)` — **(b)
  hard concept reappearing** for `HTTPException` (`sqlite-mastery`
  Lesson 35); `409`, specifically — **(a) first appearance** of this
  real, standard status code, meaning a real request that's
  well-formed but conflicts with the resource's own current, real
  state — genuinely the correct, real code for "this file is already
  checked out," distinct from Lesson 09's own real `401`/`403`.

### CS Lens

Passing `get_lock`/`create_lock` as real, plain parameters, rather than
importing them, is a real, direct instance of **dependency injection**
— the identical real principle this series' own sibling,
[`snake-csharp`](../snake-csharp/), already names directly as "declare
what messages you need answered, don't construct your own concrete
dependencies," applied here in real, plain Python instead.

### SE Lens

The real, honest, and deliberately unfinished state this lesson leaves
`checkout_file` in: `get_lock` and `create_lock`, as written, are two,
real, separate real database operations — a real read, then a real
write — with nothing yet guaranteeing no other, real, concurrent
request runs its own `get_lock` in between them. This is a real,
genuine **TOCTOU** gap, named here directly rather than glossed over —
Lesson 18's own entire real subject is proving this gap is real and
exploitable, before Lesson 19 closes it for good.

## Connect the pieces

`checkout_file`, a real, pure, dependency-injected function, encodes
this project's own real, central rule in exactly one place — proven
correct first against two, real, trivial, in-memory stand-ins, then
against this project's own real `locks` table, through a real, working
endpoint. Alice succeeds; Bob, attempting the identical, real
operation immediately after, is correctly refused with a real `409`.

## What breaks without this

Not applicable in this lesson's own usual sense — this lesson's own
real, honest, unresolved TOCTOU gap, named directly in its own closing
SE Lens, is Lesson 18's own real subject to demonstrate concretely,
not a mistake to cause and fix here.

## Exercises

1. Reproduce this lesson's own real, in-memory proof yourself, with a
   real, third call — attempt to check out a file `2` (never locked)
   after file `1` is already locked, confirming `checkout_file`
   correctly tracks each real file's own, independent lock state.
2. Add a real `checkin_file` function to `src/domain/checkout.py`,
   following this lesson's own exact, real, dependency-injected
   pattern — real rule: refuse if no real lock exists, or if the real
   lock belongs to a different real user than the one attempting to
   release it.

## Next

[Lesson 18 — The Real Race Condition](lesson-18-the-real-race-condition.md)
proves, directly, that this lesson's own honestly-named TOCTOU gap is
not theoretical — two real, simultaneous checkout attempts, and what
actually happens between them.
