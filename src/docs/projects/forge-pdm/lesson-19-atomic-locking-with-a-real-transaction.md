# Lesson 19: Atomic Locking With a Real Transaction

**What you will build:** a real, genuinely atomic checkout operation —
reusing `sqlite-mastery`'s own real `BEGIN IMMEDIATE` knowledge
directly — closing Lesson 18's own real, proven race condition for
good, plus a real, honest refinement to `checkout_file`'s own domain-
layer shape that true atomicity actually requires.

**What you need to know first:** [Lesson 18](lesson-18-the-real-race-condition.md)
— the real race this lesson closes, proven, not assumed.
`sqlite-mastery`'s own [Lesson 14](../sqlite-mastery/lesson-14-transactions-and-acid.md)
(`BEGIN`/`COMMIT`/`ROLLBACK`) and [Lesson 50](../sqlite-mastery/lesson-50-concurrency-and-locking.md)
(`BEGIN IMMEDIATE`, real SQLite locking) — both reused directly below.

**Terms introduced in this lesson:** none new — `BEGIN IMMEDIATE`
already has full, real treatment from `sqlite-mastery` Lesson 50; this
lesson applies it to its own real, intended, production purpose for
the first time in this series.

**Objects and methods used:** none new.

---

## Concept Unit: One Real, Atomic Operation, Not Two

### The Problem

Lesson 17's own real `get_lock`/`create_lock` split — two, separate,
real database operations — is exactly why Lesson 18's own race was
possible at all: nothing stopped another, real, concurrent request
from running its own `get_lock` in the real gap between them.

### Introduce the Concept in Isolation

The real, correct fix moves the entire real check-and-act sequence
into one, single, real, atomic data-layer operation:

```python
# src/data/locks_repository.py (extended)
def checkout_atomic(conn, file_id: int, user_id: int) -> bool:
    conn.execute("BEGIN IMMEDIATE")
    try:
        existing = conn.execute("SELECT * FROM locks WHERE file_id = ?", (file_id,)).fetchone()
        if existing is not None:
            conn.rollback()
            return False
        conn.execute("INSERT INTO locks (file_id, user_id) VALUES (?, ?)", (file_id, user_id))
        conn.commit()
        return True
    except Exception:
        conn.rollback()
        raise
```

`BEGIN IMMEDIATE`, specifically — not a plain `BEGIN` — is the exact,
real reason this closes Lesson 18's own race. `sqlite-mastery` Lesson
50 already proved `BEGIN IMMEDIATE` acquires a real, exclusive
write-intent lock the instant the transaction opens, *before* any
real statement inside it runs — meaning a real, second, concurrent
call to `checkout_atomic` genuinely cannot even begin its own real
`SELECT` until the first one's transaction has fully committed or
rolled back. A plain `BEGIN` (SQLite's own real, deferred default)
would **not** fix this — it only acquires a real write lock at the
moment of the actual write, which is exactly late enough for the
identical, real TOCTOU gap to persist even inside a nominally "real
transaction."

`checkout_file` (Lesson 17), correspondingly, gets one real, honest
refinement — not a contradiction of its own original design, but a
real, necessary consequence of true atomicity:

```python
# src/domain/checkout.py (revised)
def checkout_file(file_id: int, user_id: int, checkout_atomic) -> CheckoutResult:
    success = checkout_atomic(file_id, user_id)
    if not success:
        return CheckoutResult(success=False, error="file is already checked out")
    return CheckoutResult(success=True)
```

`checkout_file` remains exactly as real, pure, and dependency-injected
as Lesson 17 first proved — Lesson 02's own rule, upheld again — but
now depends on exactly *one*, real, atomic operation, rather than two,
separately-composable ones. Lesson 17's own original, two-function
split was the correct real way to teach and isolate this project's own
rule in the clearest possible form; true atomicity, proven necessary
by Lesson 18's own real race, requires the transaction boundary to move
down into the data layer instead.

### Discard

Lesson 17's own real `get_lock`/`create_lock`-based `checkout_file`
signature is retired — this lesson's own real, revised version replaces
it entirely, permanently.

### Mechanical Walkthrough

- `conn.execute("BEGIN IMMEDIATE")` — **(b) hard concept reappearing**,
  `sqlite-mastery` Lesson 50's own real statement, now used for its own
  real, intended, production purpose rather than a deliberate
  demonstration.
- `existing = conn.execute(...).fetchone(); if existing is not None:
  conn.rollback(); return False` — **(b) hard concept reappearing** for
  the real `SELECT`/`fetchone` shape; `conn.rollback()` — **(b) hard
  concept reappearing**, `sqlite-mastery` Lesson 14's own real
  statement, used here to correctly release the real, exclusive lock
  the instant this function discovers it has nothing real left to do.
- `except Exception: conn.rollback(); raise` — **(a) first appearance**
  of this real, deliberate pattern: guaranteeing a real, held
  transaction is always released — even on a genuinely unexpected
  failure — before the real exception propagates further.

### CS Lens

This is real, direct, hands-on proof of **mutual exclusion** enforced
correctly: `BEGIN IMMEDIATE` makes the entire real check-and-act
sequence a single, indivisible, real unit, from the perspective of
every other, real, concurrent connection — the identical underlying
guarantee a real mutex provides for shared memory in a multithreaded
program, here enforced by SQLite's own real, engine-level locking
instead.

### SE Lens

The real, honest reason this fix belongs in the data layer, not the
domain layer: `BEGIN IMMEDIATE`/`COMMIT`/`ROLLBACK` are real,
SQL-specific concepts — moving them into `checkout_file` itself would
be the exact, real violation Lesson 02 already proved dangerous,
reintroducing a real SQL dependency into code that should stay
provably independent of it. `checkout_atomic`'s own real signature —
one function, one real, atomic result — is precisely narrow enough to
cross that boundary safely, carrying nothing SQL-specific across it at
all.

## Concept Unit: The Real Race, Rerun, Fixed

### The Problem

Does this real fix actually close Lesson 18's own proven race, or only
appear to?

### Introduce the Concept in Isolation

The identical, real, threaded reproduction from Lesson 18, unchanged
except for calling this lesson's own real, fixed `checkout_file`:

```python
def attempt_checkout(file_id, user_id, results, index):
    conn = sqlite3.connect("forge.db")
    try:
        result = checkout_file(file_id, user_id, checkout_atomic=partial(checkout_atomic, conn))
        results[index] = result
    except Exception as e:
        results[index] = e
    conn.close()
```

```
$ python race_lab_fixed.py
[CheckoutResult(success=True, error=None), CheckoutResult(success=False, error='file is already checked out')]
```

No crash. Both real, concurrent attempts now produce exactly the real,
correct, clean outcome Lesson 17 originally intended — Alice succeeds,
Bob is correctly, cleanly refused — with the identical, real, artificial
delay Lesson 18 used to reliably force the race still fully in place.
`BEGIN IMMEDIATE` genuinely serialized the two, real, concurrent
attempts: whichever thread's own transaction opened first ran its
entire real check-and-act sequence to completion before the second one
was ever allowed to even begin its own.

### Discard

`race_lab_fixed.py` is real, disposable proof — its own real point,
that this lesson's own fix closes Lesson 18's real race completely, is
now permanent knowledge; the script itself is not real, permanent
project code.

### Mechanical Walkthrough

- Every real line here — **(b) hard concept reappearing**, Lesson 18's
  own exact, real reproduction technique, unchanged except for calling
  this lesson's own real, fixed `checkout_atomic` instead of the
  original, unsafe `get_lock`/`create_lock` pair.

### CS Lens

This real, rerun proof is a direct, concrete instance of **regression
testing** a real concurrency fix specifically: the identical, real
conditions that once reliably caused a real failure are reproduced
again, unchanged, and the real, correct outcome this time is not
assumed — it's observed, directly, exactly as the original failure was.

### SE Lens

The real, honest, complete payoff, stated directly: Lesson 12's own
original bug — a silent, permanent, unrecoverable overwrite — is now
closed at every real layer this project touches: `--force` cannot
happen, because no second, real clone ever exists (Lesson 14); and now,
even a real, genuine race between two, simultaneous, legitimate
requests against the one, real, canonical repository's own metadata
resolves cleanly, correctly, every real time — this project's own
central, real promise, finally, completely enforced.

## Connect the pieces

`checkout_atomic`, wrapped in a real `BEGIN IMMEDIATE` transaction,
closed Lesson 18's own proven race by making the entire real
check-and-act sequence genuinely indivisible — `checkout_file`, revised
to depend on this one, real, atomic operation instead of two, separate
ones, remained exactly as pure and dependency-injected as Lesson 17
first proved. Rerunning Lesson 18's own identical, real, threaded
reproduction confirmed the fix directly: no crash, and both real,
concurrent outcomes now correct.

## What breaks without this

Reproduce this lesson's own real fix with a plain `BEGIN` instead of
`BEGIN IMMEDIATE`, proving the real, precise distinction matters, not
merely "using a transaction at all":

```python
conn.execute("BEGIN")  # deferred — the real, wrong choice here
```

```
$ python race_lab_deferred.py
[CheckoutResult(success=True, error=None), IntegrityError('UNIQUE constraint failed: locks.file_id')]
```

The identical, real crash from Lesson 18 — because a plain, deferred
`BEGIN` does not acquire SQLite's own real, exclusive write lock until
the actual `INSERT` runs, letting both real threads' own `SELECT`
checks still interleave exactly as before. This is direct, provable
proof that `BEGIN IMMEDIATE`'s own specific, real timing — acquiring
the lock *before* the check, not merely somewhere inside the
transaction — is the entire real reason this lesson's own fix works.

## Exercises

1. Reproduce this lesson's own real "what breaks" proof yourself,
   confirming a plain `BEGIN` does not actually close Lesson 18's own
   race, then restore `BEGIN IMMEDIATE` and confirm it does.
2. Apply this lesson's own identical, real pattern to a real
   `checkin_atomic` function — releasing a lock only if it belongs to
   the real, requesting user — following `checkout_atomic`'s own exact,
   real shape.

## Definition of Done

- [ ] You built `checkout_atomic` using `BEGIN IMMEDIATE`, and revised
      `checkout_file` to depend on it as one, single, atomic operation.
- [ ] You reran Lesson 18's own exact, real race reproduction and
      confirmed no crash — both outcomes clean and correct.
- [ ] You reproduced the real failure from a plain `BEGIN` and can
      state precisely why `BEGIN IMMEDIATE`'s own specific timing
      matters.
- [ ] You completed both exercises.

## Next

[Lesson 20 — The Checkout API and UI](lesson-20-the-checkout-api-and-ui.md)
wires this lesson's own real, now-safe checkout logic into a real,
working "Check Out" button — end to end, for the first time.
