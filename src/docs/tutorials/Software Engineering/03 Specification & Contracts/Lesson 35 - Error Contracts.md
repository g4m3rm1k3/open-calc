# Lesson 35: Error Contracts

**What you will build.** A batch username registration function, built
the obvious way — loop through a list, register each one, stop if any of
them is already taken. It works, until the username partway through the
list is the one that's taken: by then, two earlier usernames have already
been silently registered, and the exception the caller sees says nothing
about that. You'll fix it not by changing what error is raised, but by
changing what's true of the system *when* it's raised — either every
username in the batch gets registered, or none of them do.

**What you need to know first.** Lesson 19's `register_username`, and
Lesson 28 through 31's preconditions, postconditions, and Design by
Contract — an error contract is what those three become once a function
is allowed to fail partway through doing real work.

**Terms introduced in this lesson**

- **error contract** — the part of a function's contract specifying not
  just *that* it can fail, but precisely *how*: what signal a caller
  receives (an exception, a return value, a checkable flag — see
  `exception-vs-return-value-invalid-input-signaling.md` for a full,
  real treatment of that specific design choice), and, just as
  importantly, what remains true of the system's state at the moment of
  failure. A function whose documentation says "raises `ValueError` on
  invalid input" has stated only half its error contract if it never
  says whether anything it already changed before hitting that error is
  still safely in place.
- **atomicity** — a guarantee that an operation either completes
  entirely or leaves no partial effect at all, with no in-between state
  ever visible to a caller. An atomic `register_many` either registers
  every username in a batch or registers none of them; it never leaves a
  caller unsure how many actually went through.

**Objects and methods used.** `try`/`except`, first full treatment in
this curriculum, given below alongside `raise` and `ValueError`.

Pipeline: this lesson continues in the *Specification* stage, restated
per Lesson 28's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: An Error That Says Less Than It Seems To

### The Problem

Extend Lesson 19's single-username `register_username` to handle a whole
batch at once — a real, plausible feature, registering several accounts
from one signup form or one import.

### The Code, Run for Real

```python
def register_many(usernames, existing_usernames):
    for username in usernames:
        normalized = normalize_username(username)
        if normalized in existing_usernames:
            raise ValueError("username already taken: " + username)
        register_username(username, existing_usernames)
```

Call it with a batch where the third name is already taken:

```python
existing_usernames = {"alice"}
try:
    register_many(["Dave", "Eve", "alice", "Frank"], existing_usernames)
except ValueError as e:
    print("registration failed:", e)

print("existing_usernames after the failed call:", existing_usernames)
```

Running it:

```text
$ python register_many.py
registration failed: username already taken: alice
existing_usernames after the failed call: {'dave', 'eve', 'alice'}
```

The error message says exactly one thing failed: `"alice"` was already
taken. It says nothing about `"Dave"` and `"Eve"` — and the second printed
line shows they were, in fact, silently registered before the failure
ever happened. A caller who only reads the exception has no way to know
this without separately inspecting `existing_usernames` themselves.

### Mechanical Walkthrough

- `try:` / `except ValueError as e:` — first full treatment of Python's
  exception-handling syntax in this curriculum, though earlier lessons'
  tracebacks already showed what happens *without* a `try`: an unhandled
  exception stops the program and prints a traceback. `try` wraps code
  that might raise; `except ValueError as e:` catches specifically a
  `ValueError`, binding it to `e`, and runs its own block instead of
  letting the program stop.
- `raise ValueError("...")` — already implicitly demonstrated by every
  earlier lesson's real tracebacks (Lesson 1's `KeyError`, Lesson 6's
  `ZeroDivisionError`); this is the first time this curriculum has
  written the `raise` statement itself, deliberately triggering a
  specific, named exception rather than one an underlying operation
  raised on its own.
- The loop's own structure — worth tracing precisely: `register_username`
  runs, for real, inside the loop, *before* the check on the next
  username, so any registration that already happened before the failing
  one is fully committed by the time the exception is raised.

### CS Lens

`ValueError`, raised here, is one half of a choice
`exception-vs-return-value-invalid-input-signaling.md` covers in full —
raising immediately versus returning a checkable result — a real,
legitimate design decision in its own right. This lesson's failure isn't
about which of those two `register_many` chose. It's about a second,
separate question that choice alone never answers: regardless of *how*
the failure is signaled, what has the operation already done by the time
it's signaled?

### SE Lens

The realistic risk here isn't that `register_many` raises the wrong
exception type, or even that it fails on a taken username — failing on
that input is exactly correct. The risk is that its error contract, as
written, is silent about partial completion, and a caller relying on
"the batch either worked or it didn't" — a completely reasonable
assumption for a function named `register_many` — is wrong, in a way
nothing in the exception itself warns them about.

---

## Concept Unit: Making Partial Failure Impossible Instead of Undocumented

### The Problem

Rebuild `register_many` so its error contract can be stated simply and
be actually true: *either every username in the batch is registered, or
none of them are.*

### The New Code

```python
def register_many_atomic(usernames, existing_usernames):
    normalized = [normalize_username(u) for u in usernames]
    for n in normalized:
        if n in existing_usernames:
            raise ValueError("username already taken, no usernames were registered: " + n)
    for n in normalized:
        existing_usernames.add(n)
```

Run the identical failing call against it:

```python
existing_usernames = {"alice"}
try:
    register_many_atomic(["Dave", "Eve", "alice", "Frank"], existing_usernames)
except ValueError as e:
    print("registration failed:", e)

print("existing_usernames after the failed call:", existing_usernames)
```

Running it:

```text
$ python register_many.py
registration failed: username already taken, no usernames were registered: alice
existing_usernames after the failed call: {'alice'}
```

`existing_usernames` is exactly what it was before the call —
`{'alice'}`, unchanged. `"Dave"`, `"Eve"`, and `"Frank"` were never
registered, and the error message itself now states that plainly:
*"no usernames were registered."*

### Mechanical Walkthrough

- `normalized = [normalize_username(u) for u in usernames]` —
  already-assumed list comprehension; performs every normalization
  up front, before anything is checked or written, so the check loop
  that follows has everything it needs without touching
  `existing_usernames` at all yet.
- **Two separate loops**, not one — the first only checks, raising
  before any mutation happens if anything is wrong; the second only
  writes, and only runs at all if the first loop completed without
  raising. This split is the entire mechanism behind the new guarantee:
  nothing is added to `existing_usernames` until every single username in
  the batch has already been confirmed available.

### The Concept

Nothing about *how* the failure is signaled changed — it's still a
raised `ValueError`, still caught the same way. What changed is the
**atomicity** of the operation: the original version interleaved
checking and writing, one username at a time, so a failure partway
through left whatever had already been written in place. The new version
separates checking from writing entirely, so a failure during the check
phase happens before any writing has occurred at all. This is the real
content an error contract has to specify, beyond the exception type
alone — not just "this can fail, and here's the exception," but "here is
exactly what remains true of the system when it does."

### CS Lens

This is a real, direct instance of the same guarantee database
transactions are built around — a multi-step operation either commits
completely or has no effect at all, with no observer ever able to see a
halfway state. `register_many_atomic`'s two-pass structure is a small,
manual version of the identical idea, built with nothing but a list
comprehension and two loops.

### SE Lens

The atomic version costs something real: it makes two passes over the
batch instead of one, and it can no longer report partial success even in
cases where that might have been useful (imagine a caller who'd genuinely
prefer "register everyone you can, tell me who failed" over "all or
nothing"). Neither design is universally correct — this is Lesson 11's
tradeoff vocabulary again, applied to error handling specifically: the
right choice depends on what callers actually need to be true when
something goes wrong, which is exactly the kind of decision an error
contract exists to make explicit instead of leaving implicit and
discoverable only by accident, the way this lesson's first version did.

---

## Connect the Pieces

One batch operation, one silent gap, one explicit guarantee:

1. **The gap** — `register_many` raises correctly on a taken username,
   but two earlier usernames were already silently committed, invisible
   from the exception alone.
2. **The fix, not in the exception, but in the guarantee** —
   `register_many_atomic` raises the identical kind of exception, but
   checks the entire batch before writing any of it, so a failure always
   leaves `existing_usernames` completely unchanged.
3. **The lesson** — an error contract has to state not just what error is
   raised, but what remains true of the system when it is; the first
   without the second is an incomplete promise.

## What Breaks Without This

Ship `register_many` as originally written, documented only as "raises
`ValueError` if a username is taken." A real signup import processes a
hundred usernames, fails on the fortieth, and the caller — trusting the
documented contract, which never mentioned partial completion — retries
the entire batch from the start. Thirty-nine usernames that already
succeeded the first time now hit `register_many`'s own "already taken"
check on the retry, and the operation that was supposed to recover from
a failure fails again immediately, for a completely different reason than
anyone expected.

## Exercises

1. Modify `register_many_atomic` to also reject a batch containing the
   same username twice, before any writing happens, keeping the identical
   all-or-nothing guarantee. Confirm it with real output.
2. Read `exception-vs-return-value-invalid-input-signaling.md` and
   rewrite `register_many_atomic` to return a checkable result — for
   example, `(True, None)` on success or `(False, "username already
   taken: ...")` on failure — instead of raising. Keep the atomicity
   guarantee identical; only the signaling mechanism should change.
3. Write the error contract, in a sentence or two, for Lesson 32's
   `remove_item` — what should happen, and what should remain true of the
   cart's state, if it's asked to remove a price that was never added?
   (The current implementation doesn't handle this correctly — writing
   the contract first, before fixing it, is the point of this exercise.)

## Definition of Done

- [ ] You can define "error contract" in your own words, distinguishing
      it from simply naming which exception a function raises.
- [ ] You've reproduced the real partial-registration bug and confirmed
      the atomic version leaves no partial state behind.
- [ ] You've completed all three exercises.
- [ ] Commit `register_many_atomic`, replacing the original
      `register_many`. Commit message should explain *why*: for example,
      `Lesson 35 — batch registration is now atomic; a failure partway
      through no longer leaves earlier usernames silently registered.`
