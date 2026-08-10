# Concept: Idempotent Initialization Guards

**What you'll understand by the end:** how to write setup code that's safe to run every single time a program starts, even though it should really only take effect once, ever.

**Prerequisites:** none.

## Setup

No install needed — any language works. The isolated example uses Python.

## The Problem

Some setup work — creating a starting/seed dataset, provisioning a default configuration — should logically happen exactly once, the very first time a system runs. But a program often can't cleanly distinguish "this is truly the first run" from "this is the fifth restart of an already-running system" without checking real, persistent state first — and running setup unconditionally on every start risks duplicating work that should have stayed one-time.

## The Isolated Example

```python
seeded_log = []  # stands in for a real, persistent table

def current_count():
    return len(seeded_log)

def seed_if_empty():
    if current_count() == 0:
        seeded_log.append("default-item-1")
        seeded_log.append("default-item-2")
        print("seeded:", seeded_log)
    else:
        print("already seeded, skipping. current count:", current_count())

seed_if_empty()  # first "startup"
seed_if_empty()  # second "startup" — simulating a restart
seed_if_empty()  # third "startup"
```

**Real output:**
```
seeded: ['default-item-1', 'default-item-2']
already seeded, skipping. current count: 2
already seeded, skipping. current count: 2
```

**What this proves:** calling `seed_if_empty()` three times — simulating three separate program startups against the same underlying persistent state — produced the two seed items exactly once, not six times; every call after the first correctly recognized real data already existed and did nothing further.

## Mechanical Walkthrough

- The guard (`if current_count() == 0:`) checks real, current, persistent state *before* deciding whether to act — it never assumes "this is the first run" based on anything other than what's actually, currently true in storage.
- This makes the function **idempotent**: calling it once has the same net effect as calling it any number of times — a property specifically valuable for setup code that's genuinely expected to run on every single program start, since there's usually no cheap, reliable way to know in advance whether a given start is really the first one.
- The specific check used (`count == 0`) is simple and works well for "seed a fixed, small starting dataset" — other real scenarios need a different, more specific guard (checking for a particular named record's existence, a version number, a flag file) depending on exactly what "already done" means for that setup step.
- This is a real, if simple, tradeoff against a proper migration/versioning system (see the honest naming in `sql-create-table-and-schema.md`'s own `IF NOT EXISTS` discussion) — a guard like this handles "run this exactly once" correctly, but has no concept of "run this new setup step that was added later, exactly once, for systems that already passed the old check."

## CS Lens

This is the practical, applied meaning of **idempotency**: an operation is idempotent if performing it multiple times produces the same result as performing it once. This property is valuable anywhere an operation might be retried, re-run, or called an unknown number of times — a network request that might be retried after a timeout, a distributed system's message that might be delivered more than once, or, as here, a startup routine that runs every time a process starts, not knowing in advance how many times that's already happened.

Also recognized in: HTTP's own `PUT` method (defined by the HTTP specification to be idempotent — repeating an identical `PUT` should leave the resource in the same state as doing it once), database migration tools (each migration is designed to apply safely exactly once, tracked via a real migrations-applied table), and `IF NOT EXISTS` clauses generally (SQL's own `CREATE TABLE IF NOT EXISTS`, used in this exact project, is itself a small, built-in idempotency guard).

## SE Lens

Writing setup code this way — safe to call on every single startup, rather than requiring some external "only run this once, manually" discipline — removes an entire class of deployment mistake: there's no separate, easy-to-forget manual step ("remember to only run the seed script the first time!"), because the code itself is safe regardless of how many times it's invoked. The real, honest cost, worth naming rather than glossing over: as noted above, a guard this simple has no way to distinguish "already fully set up" from "set up under an older, since-changed version of this same setup logic" — a real limitation that a dedicated migration system exists specifically to solve properly.

## Connection

Directly relevant to `sql-create-table-and-schema.md`'s own `CREATE TABLE IF NOT EXISTS` (a built-in idempotency guard at the SQL level) and `sql-transactions-and-commit.md` (ensuring a guarded operation's check-then-act sequence completes as one consistent unit).

## Try It Yourself

1. Change the guard to check for a *specific* seed item's presence (`"default-item-1" in seeded_log`) rather than a bare count, and reason about a real scenario where this more specific check would behave more correctly than a simple count — for instance, if a user could delete individual seeded items afterward.
2. Simulate two "concurrent startups" by removing the guard's check temporarily and calling `seed_if_empty`'s un-guarded seeding logic twice in a row without checking in between — observe the duplication this produces, and reason about why, in a real system with actual concurrent processes, the check-then-act sequence itself might need additional protection (a database-level unique constraint, or a real lock) beyond a simple guard to be fully safe under real concurrency.
3. Add a second, independent seed step for a different kind of default data, guarded separately from the first — confirming multiple idempotent guards can coexist cleanly, each independently tracking whether its own specific setup has already happened.
