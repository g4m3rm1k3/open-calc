# Lesson 18: The Real Race Condition

**What you will build:** direct, run proof that Lesson 17's own,
honestly-named TOCTOU gap is real — two, genuine, simultaneous
checkout attempts for the identical file, and the real, concrete,
sometimes-surprising outcome, reproduced deliberately rather than
merely asserted.

**What you need to know first:** [Lesson 17](lesson-17-the-checkout-domain-function.md)
— `checkout_file`'s own real logic, and its own closing SE Lens, naming
this exact gap directly. `sqlite-mastery`'s own [Lesson 50](../sqlite-mastery/lesson-50-concurrency-and-locking.md)
— the real threading technique reused directly below to widen a
genuinely narrow, real race into something reliably reproducible.

**Terms introduced in this lesson:** none new — this lesson proves
Lesson 17's own already-named **TOCTOU** gap concretely.

**Objects and methods used:** none new — this lesson reuses
`sqlite-mastery` Lesson 50's own real `threading.Thread` technique
directly.

---

## Concept Unit: Two Real, Simultaneous Checkouts

### The Problem

Lesson 17 named a real gap honestly, without proving it. What actually
happens when two, real, genuinely simultaneous checkout attempts hit
the identical file?

### Introduce the Concept in Isolation

A real, deliberate, artificial delay, inserted only to widen a
genuinely narrow, real race window into something reliably
reproducible — the identical real technique `sqlite-mastery` Lesson 50
already used for exactly this purpose:

```python
import sqlite3
import threading
import time
from functools import partial

from src.data.locks_repository import create_lock, get_lock
from src.domain.checkout import checkout_file


def get_lock_slow(conn, file_id):
    lock = get_lock(conn, file_id)
    time.sleep(0.5)
    return lock


def attempt_checkout(file_id, user_id, results, index):
    conn = sqlite3.connect("forge.db")
    try:
        result = checkout_file(
            file_id, user_id,
            get_lock=partial(get_lock_slow, conn),
            create_lock=partial(create_lock, conn),
        )
        results[index] = result
    except Exception as e:
        results[index] = e
    conn.close()


results = [None, None]
t1 = threading.Thread(target=attempt_checkout, args=(1, 1, results, 0))  # Alice
t2 = threading.Thread(target=attempt_checkout, args=(1, 2, results, 1))  # Bob
t1.start()
t2.start()
t1.join()
t2.join()
print(results)
```

```
$ python race_lab.py
[CheckoutResult(success=True, error=None), IntegrityError('UNIQUE constraint failed: locks.file_id')]
```

A real, genuine, honest outcome — not "both silently succeed," but
something arguably worse: Alice's real attempt correctly reports
`success=True`, and Bob's real attempt **crashes**, with a real,
unhandled `sqlite3.IntegrityError`. Both real threads' own
`get_lock_slow` calls ran before either one's `create_lock` did —
both saw "no lock exists yet" — but `locks.file_id`'s own real,
`UNIQUE` constraint (Lesson 05) correctly refused the second, real,
physical `INSERT`. `checkout_file` itself had no way to know that
would happen; it had already, incorrectly, decided to proceed.

### Discard

`race_lab.py` is real, disposable proof — never a real, permanent part
of this project; `get_lock_slow`'s own artificial delay exists only to
make a genuinely narrow real race reliably observable, never for real,
permanent use.

### Mechanical Walkthrough

- `def get_lock_slow(conn, file_id): lock = get_lock(conn, file_id);
  time.sleep(0.5); return lock` — **(b) hard concept reappearing**,
  `sqlite-mastery` Lesson 50's own real, artificial-delay technique,
  applied here to widen this project's own real checkout race
  specifically.
- `threading.Thread(target=attempt_checkout, args=(...))` — **(b) hard
  concept reappearing**, `sqlite-mastery` Lesson 42/50's own real
  threading pattern, unchanged.
- `except Exception as e: results[index] = e` — **(a) first
  appearance** of this real, deliberate pattern: capturing a real,
  raised exception as real, ordinary data, specifically so both real
  threads' own outcomes — success or crash — can be inspected together
  afterward, rather than one real thread's own crash silently
  terminating only itself with no visible record.

### CS Lens

This is real, direct, hands-on proof of a **race condition**: two real,
concurrent operations, each individually correct in isolation,
producing a genuinely incorrect, or at least unintended, real result
purely because of their own real, relative timing — the identical
underlying category `sqlite-mastery` Lesson 50 already proved for two
competing SQLite writers, here occurring one real layer up, inside
this project's own domain logic instead of directly at the database.

### SE Lens

The real, honest, concrete cost this unit proves directly: Lesson 17's
own real, correct-*looking* logic — check, then act — is not safe
under real, genuine concurrency, and the real, observed failure mode is
not the tidy, expected `CheckoutResult(success=False, ...)` a careful
reader might assume; it's an entirely real, unhandled exception,
because the domain layer's own real assumption (nothing changes
between the check and the act) turned out false.

## Concept Unit: The Same Real Race, at the Real API Layer

### The Problem

This lesson's own first unit proved the real race exists inside
`checkout_file` directly. Does the same real problem reach an actual,
real user, through the real, live HTTP endpoint Lesson 17 already
built?

### Introduce the Concept in Isolation

The identical, real race, reproduced against the real, running server
instead of an isolated function call — two real, near-simultaneous
`curl` requests, launched together:

```
$ (curl -s -X POST --cookie "session_token=<alice>" http://127.0.0.1:8000/api/files/1/checkout &
   curl -s -X POST --cookie "session_token=<bob>" http://127.0.0.1:8000/api/files/1/checkout &
   wait)
{"file_id":1,"checked_out_by":"alice"}
Internal Server Error
```

A real, genuine `500`, reaching a real, actual user — not the real,
correct `409 Conflict` Lesson 17 already proved works cleanly in the
*non-racing* case. This is real, concrete, further proof this project's
own real gap is not merely a theoretical concern confined to an
isolated lab: the identical, real crash this lesson's own first unit
already caused deliberately can genuinely reach a real, live request,
under real, ordinary, everyday concurrent use — no artificial delay
required at real, production scale, only enough, real, simultaneous
traffic.

### Discard

Nothing throwaway beyond this unit's own real, deliberate
reproduction — no real, permanent project code exists yet to fix this;
Lesson 19 provides it.

### Mechanical Walkthrough

- `(curl ... & curl ... & wait)` — **(a) first appearance** of this
  real, standard shell pattern: `&` backgrounds each real command,
  launching both nearly simultaneously, and `wait` blocks until both
  have genuinely finished — a real, direct way to fire two, real,
  concurrent HTTP requests without writing a dedicated real script.

### CS Lens

A raw, unhandled `500` reaching a real, external caller is a real,
direct instance of an **implementation detail leaking through an
API boundary** — the identical real principle Lesson 02 already named
for a domain-layer violation, occurring here for a genuinely different,
real reason: not a broken layer boundary, but a real, unhandled
exception from a genuine, unanticipated race, surfacing raw and
unexplained instead of as `sqlite-mastery` Lesson 35's own deliberately
vague, but honest, `500` response.

### SE Lens

The real, honest, concrete stakes this lesson closes with: this
project's own real, central promise — one person holds a file at a
time — is not merely *incorrect* under this real race; it fails in the
single, real, worst possible way for a genuine user to experience,
an opaque crash, at the exact real moment two real engineers happen to
click "check out" close enough together. Lesson 19's own real fix is
not a refinement; it is the one, real, remaining piece closing this
project's own central promise completely.

## Connect the pieces

An artificially widened, real race, run twice — once against
`checkout_file` directly, once against the real, live HTTP endpoint —
proved the identical, real, concrete result both times: one real
request succeeds correctly, and the other crashes, raw and unhandled,
rather than failing cleanly. This is real, direct, undeniable proof
Lesson 17's own honestly-named TOCTOU gap is not theoretical.

## What breaks without this

Not applicable in this lesson's own usual sense — this entire lesson
*is* the real, deliberate "what breaks" demonstration Lesson 17's own
closing SE Lens promised.

## Exercises

1. Reproduce this lesson's own real, threaded race yourself, and
   confirm, directly, that swapping which real thread starts first
   (Bob's `attempt_checkout` launched before Alice's) still produces
   the identical, real *pattern* — one success, one crash — regardless
   of which specific real user "wins."
2. Wrap this lesson's own real, live-server reproduction's checkout
   route in a real, temporary `try`/`except Exception` (catching
   *everything*, deliberately, only to observe the real outcome more
   safely) and confirm, directly, the real, raw `sqlite3.
   IntegrityError` message it was actually hiding underneath FastAPI's
   own generic `Internal Server Error` text.

## Definition of Done

- [ ] You reproduced the real race directly against `checkout_file`,
      and observed the real, unhandled `IntegrityError` firsthand.
- [ ] You reproduced the identical real race against the real, live
      HTTP endpoint, and observed a real, raw `500` reach an actual
      request.
- [ ] You completed both exercises.

## Next

[Lesson 19 — Atomic Locking With a Real Transaction](lesson-19-atomic-locking-with-a-real-transaction.md)
closes this exact, real gap for good, reusing `sqlite-mastery`'s own
real transaction and locking knowledge directly.
