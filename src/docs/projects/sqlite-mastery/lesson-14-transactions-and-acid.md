# Lesson 14: Transactions and ACID

**What you will build:** real, deliberate proof that `ROLLBACK` and
`COMMIT` genuinely control whether a change survives — and a real,
run-this-yourself discovery that a failed statement mid-transaction
does **not** automatically poison the whole transaction the way it does
in several other real databases.

**What you need to know first:** [Lesson 06](lesson-06-update-and-delete.md)
— `UPDATE`'s own real mutation mechanics, wrapped here inside a real
transaction for the first time. [Lesson 07](lesson-07-constraints.md) —
the real `CHECK` constraint this lesson's own failure proof deliberately
triggers.

**Terms introduced in this lesson:**
- **Transaction** — a real, explicitly-bounded group of statements
  SQLite treats as one unit: either every real change inside it survives
  together, or none of them do.
- **ACID** — four real, named guarantees a transactional database makes:
  **Atomicity** (a transaction is all-or-nothing), **Consistency**
  (every constraint, Lesson 07's own subject, still holds once a
  transaction finishes), **Isolation** (one transaction's in-progress
  changes are invisible to others until it finishes — this series' own
  Lesson 50 proves this one directly, since it needs two real,
  simultaneous connections), and **Durability** (once committed, a
  change survives even a real crash immediately after).
- **Autocommit** — SQLite's own real default mode: every single
  statement not explicitly wrapped in `BEGIN`/`COMMIT` is automatically
  its own one-statement transaction.

**Objects and methods used:**

**`BEGIN`**
- *What it is:* the real statement opening an explicit, multi-statement
  transaction, ending SQLite's own default autocommit mode until a
  matching `COMMIT` or `ROLLBACK`.
- *Implementation:* `BEGIN;` — every statement afterward is grouped
  into this one transaction, until it's explicitly closed.
- *Its use:* grouping this lesson's own real, multi-step changes so
  they succeed or fail together.

**`COMMIT`**
- *What it is:* the real statement that permanently, durably applies
  every change made since the matching `BEGIN`.
- *Implementation:* `COMMIT;` — after this, every change inside the
  transaction is as real and permanent as any ordinary autocommit
  statement.
- *Its use:* making this lesson's own quantity change permanent.

**`ROLLBACK`**
- *What it is:* the real statement that discards every change made
  since the matching `BEGIN`, as if none of them had ever run.
- *Implementation:* `ROLLBACK;` — every real row touched since `BEGIN`
  reverts to its exact prior state.
- *Its use:* undoing this lesson's own deliberate test change.

---

## Concept Unit: `BEGIN`/`COMMIT`/`ROLLBACK` — Grouping Changes, Real Proof of Both Outcomes

### The Problem

Every statement this series has run so far has been its own,
independent, immediately-permanent change — Lesson 06's own `UPDATE`
took effect the instant it ran, with no way to reconsider before it
did. A real, deliberate multi-step change — one this lesson is about to
prove can go either way — needs a way to try something and still be
able to walk it back.

### Introduce the Concept in Isolation

No throwaway table — `parts`' own real `Hammer` row, quantity `4`,
changed and reverted for real:

```
$ sqlite3 pocket_hardware.db
sqlite> .headers on
sqlite> .mode column
sqlite> SELECT quantity FROM parts WHERE name = 'Hammer';
quantity
--------
4
sqlite> BEGIN;
sqlite> UPDATE parts SET quantity = 999 WHERE name = 'Hammer';
sqlite> SELECT quantity FROM parts WHERE name = 'Hammer';
quantity
--------
999
sqlite> ROLLBACK;
sqlite> SELECT quantity FROM parts WHERE name = 'Hammer';
quantity
--------
4
```

`999` was real and visible *inside* the open transaction, then genuinely
reverted to `4` the instant `ROLLBACK` ran — proof the change was never
truly permanent until a real decision was made either way.

The identical sequence, `COMMIT` in place of `ROLLBACK`:

```
sqlite> BEGIN;
sqlite> UPDATE parts SET quantity = 999 WHERE name = 'Hammer';
sqlite> COMMIT;
sqlite> SELECT quantity FROM parts WHERE name = 'Hammer';
quantity
--------
999
```

This time `999` survives — real, permanent, exactly as durable as any
ordinary autocommit `UPDATE` from every earlier lesson. (Restored back
to the real `4` afterward, so the rest of this series' own data stays
consistent.)

### Discard

Nothing throwaway — both real outcomes (`ROLLBACK` reverting, `COMMIT`
persisting) are permanent facts this lesson proved against the real
project's own data, with `Hammer`'s quantity correctly restored to `4`
once the proof was complete.

### Mechanical Walkthrough

- `BEGIN;` — **(a) first appearance**, full treatment above.
- `UPDATE parts SET quantity = 999 WHERE name = 'Hammer';` — **(c)
  already basic**, Lesson 06's own `UPDATE` shape, unchanged — the only
  real difference is that it now runs *inside* an open transaction
  instead of autocommitting alone.
- `ROLLBACK;` — **(a) first appearance**, full treatment above.
- `COMMIT;` — **(a) first appearance**, full treatment above.

### CS Lens

A transaction is a real instance of **atomicity** in the formal ACID
sense: a group of operations that must be observed as a single,
indivisible unit — either every one of them took effect, or none did —
with no real, observable state in between ever left half-applied.

Also recognized in: a bank transfer that must debit one account and
credit another together or not at all (the textbook real-world ACID
example, for a real reason), a filesystem's own atomic rename operation
(a file appears fully renamed or not at all, never half-way), a Git
commit itself (every changed file is committed together, or the commit
doesn't happen), an all-or-nothing package installation that rolls back
completely on any single file's failure.

### SE Lens

SQLite's own real default — **autocommit** — silently wraps every
single statement in its own implicit one-statement transaction unless
`BEGIN` says otherwise. The real alternative not chosen as the default
— requiring every statement to sit inside an explicit `BEGIN`/`COMMIT`,
always — would make simple, one-off changes (most of Lessons 01–13)
needlessly verbose; autocommit's real cost, honestly stated, is that a
genuinely multi-step change (this lesson's own two-`UPDATE` case,
Lesson 24's own multi-step migrations) must remember to explicitly
`BEGIN` first, or each statement silently commits on its own, one at a
time, with no way to undo the first if the second fails.

## Concept Unit: A Failed Statement Mid-Transaction — SQLite's Own Real, Surprising Behavior

### The Problem

Several other real databases (Postgres among them) place an entire
transaction into a "you must `ROLLBACK`, no further statements allowed"
state the instant *any* statement inside it fails. Does SQLite do the
same?

### Introduce the Concept in Isolation

A real, valid change, alongside a real, deliberately invalid one, in
the same open transaction:

```
sqlite> BEGIN;
sqlite> UPDATE parts SET quantity = 500 WHERE name = 'Wrench';
sqlite> INSERT INTO suppliers (name, email, rating) VALUES ('Broken Co.', 'bad@example.com', 99);
Runtime error: CHECK constraint failed: rating BETWEEN 1 AND 5
sqlite> SELECT quantity FROM parts WHERE name = 'Wrench';
quantity
--------
500
```

The `INSERT` genuinely failed — Lesson 07's own real `CHECK` constraint,
unchanged, correctly rejected `rating = 99`. And yet `Wrench`'s own
quantity change, `500`, is still visible, still real, still sitting
inside the same open transaction the failed `INSERT` was part of. The
real, surprising question this proves worth asking directly: can this
transaction still be committed?

```
sqlite> COMMIT;
sqlite> SELECT quantity FROM parts WHERE name = 'Wrench';
quantity
--------
500
```

It can — and did. No error on `COMMIT` itself, and `500` is now real
and permanent. SQLite's own real, documented behavior: by default, a
failed statement inside a transaction aborts *only that one statement*
— the transaction itself stays open and perfectly committable, with
every other real change made inside it still intact. This is a genuine,
real difference from Postgres's own default behavior, where the
identical sequence would leave the whole transaction unable to do
anything except `ROLLBACK`.

(`Wrench`'s quantity was restored to its real `10` immediately after
this proof, keeping the rest of this series' own data consistent —
confirmed with a follow-up `SELECT`.)

### Discard

Nothing throwaway — `Broken Co.` never became a real row (its own
`INSERT` genuinely failed and was never retried), and `Wrench`'s
quantity is back to its correct real value.

### Mechanical Walkthrough

- `INSERT INTO suppliers (name, email, rating) VALUES ('Broken Co.',
  'bad@example.com', 99);` — **(b) hard concept reappearing**, Lesson
  07's own `CHECK` constraint, unchanged; the real point of this unit is
  not the constraint itself but *where* its failure leaves the
  surrounding open transaction.
- `COMMIT;` — **(b) hard concept reappearing**, this lesson's own first
  unit; succeeding here, with no error, despite an earlier statement in
  the same transaction having failed, is this unit's entire real point.

### CS Lens

This is a real, concrete instance of **failure isolation granularity**
— the question of exactly how large a blast radius one failure is
allowed to have. SQLite's own real choice scopes a constraint failure
to the one statement that caused it; Postgres's own real choice scopes
it to the entire enclosing transaction. Neither is objectively "more
correct" — they're two different, real, documented designs answering
the identical question differently.

Also recognized in: one failed test in a test suite that still lets
every other independent test run and report its own result (a common,
real design), versus a build system that halts an entire pipeline the
instant any single step fails (an equally real, equally valid, opposite
design) — the same underlying question, "does one failure poison
everything around it, or only itself," recurring with genuinely
different real answers depending on the system.

### SE Lens

The real, honest, load-bearing consequence for this project's own
future code (Arc 2 onward): never assume a caught exception from one
failed statement inside a Python-managed transaction (this series' own
Lesson 20) means the whole transaction is already dead and safe to
simply abandon — SQLite's own real default keeps it alive and
committable, meaning a careless `except: pass` around one failed
statement can silently `COMMIT` a transaction that's missing one change
its own calling code assumed had failed *along with* everything else in
it. The real, correct pattern this project commits to from here
onward: catch the specific failure, and explicitly decide — call
`ROLLBACK` yourself if the whole group should be undone — rather than
relying on SQLite to make that decision automatically, the way Postgres
would.

## Connect the pieces

Two real proofs, one shared mechanism: `BEGIN`/`ROLLBACK` and
`BEGIN`/`COMMIT` each ran the identical `UPDATE parts SET quantity =
999`, and produced two genuinely different, both fully real outcomes —
proof a transaction's changes are provisional until explicitly resolved
one way or the other. The second, more surprising proof used the
identical `BEGIN`/`COMMIT` shape around a transaction containing one
real, valid change and one real, rejected one — and showed SQLite's own
default lets the valid change through on `COMMIT` regardless, a real,
load-bearing fact about this specific database that a reader coming
from Postgres would otherwise assume, incorrectly, works the other way.

## What breaks without this

Attempt `ROLLBACK` a second time, after a transaction has already been
resolved:

```
$ sqlite3 pocket_hardware.db "COMMIT;"
Runtime error: cannot commit - no transaction is active
```

(Run standalone, with no open `BEGIN` beforehand — the identical real
error this lesson's own isolated lab produced when `ROLLBACK` was
attempted after the preceding `COMMIT` had already closed the
transaction.) A real, specific rejection: SQLite tracks whether a
transaction is genuinely open, and refuses to resolve one that isn't —
direct proof `BEGIN`/`COMMIT`/`ROLLBACK` aren't independent commands
free to run in any order, but a real, stateful pair that must nest
correctly, exactly once each, per real transaction.

## Exercises

1. Reproduce this lesson's own `ROLLBACK`-reverts / `COMMIT`-persists
   proof yourself, using a different real `parts` row and column than
   `Hammer`'s quantity.
2. Reproduce this lesson's own surprising mid-transaction-failure proof
   yourself, but this time call `ROLLBACK` instead of `COMMIT` once the
   deliberate `CHECK` failure has happened. Confirm the *valid* change
   made earlier in that same transaction is undone too, even though it
   never itself failed — direct, real proof that once you choose
   `ROLLBACK`, it discards everything in the transaction, valid changes
   included, not just the part that actually failed.

## Definition of Done

- [ ] You proved `ROLLBACK` reverts a real change and `COMMIT` makes an
      identical one permanent.
- [ ] You reproduced the real mid-transaction `CHECK` failure and
      confirmed the transaction stayed open and committable afterward.
- [ ] You can state, from memory, the real, specific way this differs
      from Postgres's own default behavior.
- [ ] You caused the real "cannot commit - no transaction is active"
      error and understand why `BEGIN`/`COMMIT`/`ROLLBACK` must nest
      correctly.
- [ ] You completed both exercises.

## Next

[Lesson 15 — Triggers](lesson-15-triggers.md) gives `parts` a real,
automatic side effect — logging every price change on its own, with no
application code remembering to do it — the first time this series
writes SQL that runs without being asked to, directly.
