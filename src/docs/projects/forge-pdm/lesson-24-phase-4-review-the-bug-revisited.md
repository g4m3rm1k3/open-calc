# Lesson 24: Phase 4 Review — the Bug, Revisited

**What you will build:** nothing new — this lesson's own real
deliverable is a direct, final rerun of Lesson 12's own exact, original
scenario, using every real, permanent piece Phase 4 has built since,
proving this project's own central bug is now genuinely, structurally
impossible.

**What you need to know first:** Lessons 12 and 17–23 — every real
piece this lesson connects, none of them re-explained here.

---

## Concept Unit: The Exact, Original Scenario, Run For Real

### The Problem

Lesson 12 opened this whole phase with a real, deliberate, working
demonstration of this project's own central bug. Phase 4 has since
built a real, complete, working fix. Does it actually hold, end to end,
against the identical, original scenario?

### Introduce the Concept in Isolation

Alice, real and first, checks out the real file:

```
$ curl -X POST --cookie "session_token=<alice>" http://127.0.0.1:8000/api/files/2/checkout
{"file_id":2,"checked_out_by":"alice"}
```

Bob, real and unaware, attempts the identical, real operation Lesson
12's own original bug depended on being possible — writing to the
identical, real file, while Alice is actively, genuinely working on it:

```
$ curl -i -X POST --cookie "session_token=<bob>" http://127.0.0.1:8000/api/files/2/checkout
HTTP/1.1 409 Conflict

{"detail":"file is already checked out"}
```

This is the exact, real, structural difference from Lesson 12: Bob is
never given the chance to make a conflicting real edit *at all* — there
is no real, second, independent clone for him to work in, and no real
way to bypass this project's own real, atomic, database-enforced
check, the way `git push --force` once bypassed git's own real
protection.

Alice, real and genuine, finishes her own real work and checks in:

```
$ curl -X POST --cookie "session_token=<alice>" http://127.0.0.1:8000/api/files/2/checkin \
    -d '{"content": "Tolerance confirmed at +/-0.005 per engineering review.", "message": "Confirm tolerance"}'
{"file_id":2,"success":true,"commit_sha":"e5f6a7b..."}
```

Only now, with the real lock genuinely released, can Bob check out the
identical, real file — and when he does, he sees Alice's own real,
already-committed, genuine change, because he's now editing the real,
current, correct content, not a stale, independent copy from before
Alice's own real work began:

```
$ curl -X POST --cookie "session_token=<bob>" http://127.0.0.1:8000/api/files/2/checkout
{"file_id":2,"checked_out_by":"bob"}
$ curl http://127.0.0.1:8000/api/files/2/versions/1/content
{"content":"Tolerance confirmed at +/-0.005 per engineering review."}
```

Bob's own, real, next edit is a genuine, informed continuation of
Alice's own real work — not a blind, silent overwrite of it, because
the entire, real scenario that once made silent overwriting possible —
two people, two independent copies, no coordination — no longer exists
anywhere in this project's own real, working system.

### Discard

Not applicable — this real, complete, end-to-end proof is this
project's own real, permanent, correct behavior, run once here to
confirm it directly, not disposable example code.

### Mechanical Walkthrough

Not applicable — every real call in this unit reuses already-explained,
real endpoints from Lessons 17–23, unchanged.

### CS Lens

This real, complete sequence is a direct, concrete instance of
**serializability**: Alice's and Bob's own, real, potentially
conflicting operations against the identical file are guaranteed, by
this project's own real, structural design, to happen in some real,
well-defined order — never interleaved in a way that could silently
lose either one's own, genuine work.

### SE Lens

The real, complete, honest cost this project paid for this real
guarantee, stated plainly, one final time: a real, deliberate,
four-layer architecture (Phase 1); real, enforced authentication and
authorization (Phase 2); exactly one, real, canonical repository,
never a second, independent clone (Lesson 14); and a real, atomic,
database-enforced lock, proven correct under genuine, concurrent load
(Lessons 18–19) — every one of them a real, deliberate, necessary
piece, not incidental complexity. This project's own real,
existing application's central bug was never a small, isolated fix;
Phase 4's own real, complete proof shows exactly why.

## Connect the pieces

The exact, real scenario Lesson 12 once used to prove this project's
own central bug — two people, the identical file, one silent overwrite
— was run again here, against this project's own real, complete Phase
4 system, and produced an entirely different, real, correct outcome at
every single step: Bob correctly refused while Alice worked, Alice's
own real, genuine change permanently and correctly committed, and
Bob's own, real, next edit a genuine, informed continuation, never a
blind overwrite.

## What breaks without this

Not applicable — this lesson's own real, complete, successful rerun of
Lesson 12's own original bug scenario *is* Phase 4's own final, real
proof; there is nothing left to break.

## Exercises

1. Reproduce this lesson's own exact, real sequence yourself, start to
   finish, narrating out loud, in your own real words, at each step,
   exactly which earlier lesson's own real work makes that specific
   step correct.
2. Write a real, honest, one-paragraph summary — in your own words, for
   your own future reference — of exactly how this project's own real
   fix differs, architecturally, from your own, real, existing
   application's current, actual behavior.

## Definition of Done — Phase 4 Complete

- [ ] You reproduced Lesson 12's own exact, original scenario against
      this project's own complete Phase 4 system, start to finish.
- [ ] You confirmed Bob is correctly refused while Alice's real lock is
      active, with no real way to bypass it.
- [ ] You confirmed Bob's own, real, next edit is an informed
      continuation of Alice's own real, committed work, never a blind
      overwrite.
- [ ] You completed both exercises.

## Phase 4 complete

Eight lessons, and this project's own real, central bug is closed,
completely, at every real layer: named honestly (Lesson 17), proven
under genuine, concurrent load (Lesson 18), fixed with a real, atomic
transaction (Lesson 19), wired into a real, working checkout button
(Lesson 20), given a real, safe way to save progress (Lesson 21), a
real, permanent, committed version (Lesson 22), a real, retrievable
history (Lesson 23), and finally, directly, proven against the exact,
original scenario that started this whole project (this lesson).
[Phase 5](lesson-25-configurable-file-types-and-form-requirements.md)
turns to this project's own real, remaining, everyday needs: file
types, search, and an audit trail.
