# Lesson 24: Deciding Later Instead of Deciding Now

**What you will build** — no new C++: `Database.begin()`, returning a
real `Transaction` — a real, in-memory staging area for `insert`
calls. Nothing staged touches a real page at all until `commit()` is
called; `rollback()` throws the staged work away with no real write
ever happening. Built on this, a real experiment runner — the exact,
real use case `README.md`'s own S10 row names — that only ever records
a trial's own real results if the whole real experiment actually
finished.

**What you need to know first:** Lesson 6 (`insert`), Lesson 17
(`database_insert_many`'s own honest, documented partial-success
behavior — this lesson's own real starting point).

**Terms introduced in this lesson:** **transaction** — a real, named
group of operations treated as one logical unit: either every real
part of it is kept, or none of it is, from the caller's own point of
view. **Atomicity** — the real property a transaction provides: no
real, observable in-between state where only *some* of a transaction's
own work has happened.

**Objects and methods used**
- **`Transaction`**
  - *What it is:* this lesson's own real, new class — a real,
    in-memory buffer of `(table, values)` pairs, not yet real rows.
  - *Implementation:* covered fully in this lesson's own first unit,
    below.
  - *Its use:* `Database.begin()`'s own real return value — every real
    `insert` call on it stages, `commit()` actually writes, `rollback()`
    discards.

---

## Concept Unit: Staging Real Writes Before They're Real

### The Problem

`database_insert_many` (Lesson 17) already proved a bulk operation can
fail partway, honestly reporting how many rows actually landed — but
every row it *does* manage to insert is immediately, permanently real.
There's no real way to say "insert these three rows, but only if all
three genuinely make sense together — otherwise, none of them."

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `transaction.py` (new), `pocketdb.py` (modified
  — `Database.begin()` added).
- **Change type:** Add.
- **Dependencies:** Lesson 6's own `insert`.

### The New Code — `transaction.py`

```python
from pocketdb import PocketDBError


class Transaction:
    def __init__(self, db):
        self._db = db
        self._staged = []
        self._active = True

    def insert(self, table, *values):
        if not self._active:
            raise PocketDBError("This transaction is no longer active")
        self._staged.append((table, values))

    def commit(self):
        if not self._active:
            raise PocketDBError("This transaction is no longer active")

        for table, values in self._staged:
            self._db.insert(table, *values)

        self._active = False
        self._staged = []

    def rollback(self):
        self._active = False
        self._staged = []
```

### The New Code — `pocketdb.py`, One New Method

```python
    def begin(self):
        from transaction import Transaction
        return Transaction(self)
```

Proven for real — nothing real happens until `commit()`, and
`rollback()` genuinely undoes nothing because nothing real was ever
done:

```python
from pocketdb import Database, INTEGER, TEXT

db = Database("txtest.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)

tx = db.begin()
tx.insert("games", 1, "Alice", 100)
tx.insert("games", 2, "Bob", 85)
print("before commit, row count:", len(db.query("games")))
tx.commit()
print("after commit, row count:", len(db.query("games")))

tx2 = db.begin()
tx2.insert("games", 3, "Carol", 92)
tx2.rollback()
print("after rollback, row count:", len(db.query("games")))

db.close()
db2 = Database("txtest.pdb")
print("reopened, row count:", len(db2.query("games")))
db2.close()
```

Real output:

```text
before commit, row count: 0
after commit, row count: 2
after rollback, row count: 2
reopened, row count: 2
```

### Discard the Throwaway Example

```bash
rm verify_transaction.py txtest.pdb
```

`transaction.py` and the real change to `pocketdb.py` are kept —
permanent project files.

### Mechanical Walkthrough

- `self._staged.append((table, values))` — reappearing shape
  (`list.append`, Lesson 6) — a real *tuple*, not a real database
  operation; `Transaction.insert` never calls the real `Database.insert`
  it's named after.
- `before commit, row count: 0` — the real, direct proof: two real
  `tx.insert` calls happened, and the real table genuinely still has
  zero rows — nothing crossed the real `extern "C"` boundary at all
  yet.
- `for table, values in self._staged: self._db.insert(table, *values)`
  — `commit`'s own real work — every real, staged tuple becomes a real
  `Database.insert` call, in the real order they were staged.
- `reopened, row count: 2` — reappearing shape (every persistence-
  adjacent lesson since S02) — `commit`'s own real writes are exactly
  as real and durable as any other `insert`, because that's genuinely
  all `commit` does.

### CS Lens

Buffering real operations and only applying them on a later, explicit
signal is a real, general technique with a name — **deferred
execution** — used far beyond databases (a real UI's own "Apply"
button versus every real field updating live, a real compiler's own
optimization passes deferred until a whole function is seen). A
transaction is one real, specific application of it: defer real writes
until the caller explicitly says "I'm sure."

### SE Lens

Why does `Transaction.insert` raise a real error if called after
`commit()`/`rollback()`, rather than silently staging a real operation
that will never actually run? Because a real, silent no-op here would
be a genuinely dangerous kind of bug — real code that looks correct
(it calls `tx.insert(...)`) but has no real effect at all, with nothing
to signal that. The real, loud `_active` check turns a real, silent
mistake into an immediate, honest, catchable one.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

Staging and committing works. Whether it's *genuinely* all-or-nothing
— even when something goes wrong partway through a real `commit()` —
is a real, separate, honest question, answered next.

---

## Concept Unit: What "All or Nothing" Actually Costs

### The Problem

`commit()` loops over every real, staged insert and calls
`Database.insert` for each. If the *third* real insert in a five-insert
transaction hits Lesson 15's own real page-full failure, what happens
to the first two, already-real, already-written rows?

### The New Code — `run_experiment.py`

```python
from pocketdb import Database, PocketDBError, INTEGER

db = Database("experiments.pdb")
db.create_table("trials", trial=INTEGER, result=INTEGER)


def simulate_trial(trial_number):
    if trial_number == 3:
        return None  # a real, simulated failure partway through the experiment
    return trial_number * 10


def run_experiment(db, trial_count):
    tx = db.begin()
    for trial in range(trial_count):
        result = simulate_trial(trial)
        if result is None:
            tx.rollback()
            raise PocketDBError(f"Experiment failed at trial {trial}; nothing was recorded")
        tx.insert("trials", trial, result)
    tx.commit()


try:
    run_experiment(db, 5)
except PocketDBError as e:
    print(f"expected failure: {e}")

print(f"rows recorded after the failed experiment: {len(db.query('trials'))}")

run_experiment(db, 3)
print(f"rows recorded after a successful experiment: {len(db.query('trials'))}")

db.close()
```

Real output:

```text
expected failure: Experiment failed at trial 3; nothing was recorded
rows recorded after the failed experiment: 0
rows recorded after a successful experiment: 3
```

Then, the real, honest limit — deliberately triggering a failure
*inside* `commit()` itself, not before it, using the identical real
page-overflow condition Lesson 15 first proved:

```python
db2 = Database("partialtest.pdb")
db2.create_table("blobs", id=INTEGER, data=TEXT)

tx = db2.begin()
big = "x" * 500
for i in range(20):
    tx.insert("blobs", i, big)

try:
    tx.commit()
except PocketDBError as e:
    print("commit raised:", e)

print("rows actually written despite the failed commit:", len(db2.query("blobs")))
db2.close()
```

Real output:

```text
commit raised: Failed to insert into table 'blobs'
rows actually written despite the failed commit: 7
```

*What this proves:* `run_experiment`'s own real rollback protects
against exactly the real failure it's designed for — a trial that
fails *before* anything is staged for it, meaning `rollback()` runs
while every earlier trial's own result is still real, only in-memory,
easily discarded. The second, deliberate proof shows the real, honest
edge this lesson does *not* solve: a real failure **inside** `commit()`
itself — after some staged inserts already became real, permanent rows
— leaves those real rows in place. `7` rows survive a `commit()` call
that itself raised a real error.

### Discard the Throwaway Example

```bash
rm verify_partial.py experiments.pdb partialtest.pdb
```

`run_experiment.py` is worth keeping as a real, reusable pattern.

### Mechanical Walkthrough

- `if result is None: tx.rollback(); raise ...` — the real case this
  lesson's `Transaction` genuinely, fully solves: a failure detected
  *before* the failing trial is ever staged, while every earlier
  trial's own result still exists only as a real, in-memory tuple.
- `for i in range(20): tx.insert(...)` then `tx.commit()` — every real
  insert is staged first, `commit()` runs *after* the whole loop — the
  real failure happens partway *through* `commit()`'s own real,
  internal loop, not before it, which is exactly why this case behaves
  differently.

### CS Lens

The real gap this unit exposes — a mid-`commit()` failure leaving
partial, real writes behind — is precisely why production databases
maintain a real **write-ahead log (WAL)**: every real change is
recorded in a separate, real, sequential log *before* being applied to
the real, actual data pages, so a real failure partway through can be
real, mechanically undone by replaying the log backward. This project
doesn't have one — a genuine, honest, deliberately deferred piece of
real, future scope, not something this lesson claims to have solved.

### SE Lens

Why does this lesson still call its own real mechanism a
"transaction" at all, given this real, honest limitation? Because it
genuinely does provide real atomicity for the case that matters most in
practice — deciding *not* to commit, for any real reason, before
`commit()` is ever called — which is exactly `README.md`'s own real,
stated goal ("an experiment runner that depends on writes being
reliable"). Real software rarely ships every real guarantee a word
like "transaction" might suggest all at once; this project's own
established practice is naming exactly what's real and what isn't,
not overclaiming — the identical real honesty Lesson 17's own
`database_insert_many` already modeled for a smaller, related problem.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — a full, real experiment run, a real, deliberate
failure caught *before* staging, and a real, deliberate failure caught
*during* `commit()` itself, with different, honestly-explained real
outcomes.

### Connection

S10 is complete. The engine now has a real, if honestly scoped,
transaction mechanism — solving the exact, real problem `README.md`'s
own S10 row named, while naming clearly what it doesn't yet solve. With
that, the engine itself is done, for now: S11, next, is the first of
three slices that stop building the database and start *using* it —
NumPy and pandas, layered on top of `query()`, for real, would-be data
analysis at a scale this project's own S02 one-page-per-table limit
will finally have to be felt.

---

## Closing

### Connect the Pieces

This lesson's first unit built `Transaction` — a real, in-memory
buffer between `insert` calls and the real, permanent writes they
eventually become, proven by a real row count staying at zero until
`commit()` runs, and a real `rollback()` that has nothing real to
undo. The second unit used it for its own, real, intended purpose — an
experiment runner that only ever records real results if the whole
real experiment actually finished — then, deliberately, honestly,
showed where the real guarantee actually ends: a failure *inside*
`commit()` itself still leaves whatever real rows already landed in
place, a genuine, named gap this lesson doesn't paper over, the same
real honesty this project has practiced since Lesson 17.

### What Breaks Without This

In `run_experiment`, remove the `tx.rollback()` call from the failure
branch (keep the `raise`), rebuild nothing (pure Python), and rerun
this lesson's own experiment proof. The real, printed row count after
the *failed* experiment is still `0` — because nothing was ever staged
for trial `3`, and the earlier, staged trials were never committed
either; the real, observable behavior doesn't change. Explain, from
this lesson's own Mechanical Walkthrough, why `rollback()`'s own real
effect here is invisible — and then construct a real, different
scenario (hint: calling `tx.insert` again on the *same* transaction
object after the failure) where skipping `rollback()` genuinely does
produce a real, different, wrong result.

### Exercises

- Extend `Transaction` with a real `__enter__`/`__exit__` pair, so it
  can be used as `with db.begin() as tx:` — committing automatically if
  the real `with` block finishes normally, rolling back automatically
  if a real exception propagates out of it. Explain what real Python
  concept this requires beyond what this lesson introduced.
- `Transaction` only stages `insert` calls. Extend it to also stage
  `create_table` calls, and explain what real, additional bookkeeping
  `commit()` needs if a transaction stages both a `create_table` and an
  `insert` into the table it just (not-yet-really) created.
- Using this lesson's own real, deliberate `commit()`-failure proof as
  a starting point, sketch (in comments, not real working code) what a
  real, minimal write-ahead log would need to record *before* each
  staged insert actually runs, and how `rollback()` would use it to
  undo already-real writes after a mid-commit failure.

### Definition of Done

- [ ] `transaction.py` exists as a real, permanent file;
      `Database.begin()` returns a real, working `Transaction`.
- [ ] You staged inserts, confirmed the real row count stayed at zero
      before `commit()`, then confirmed it updated correctly after.
- [ ] You staged inserts, called `rollback()`, and confirmed the real
      row count never changed.
- [ ] You ran the real experiment-runner proof, and separately, the
      real mid-`commit()` failure proof, and can explain why they
      behave differently.
- [ ] You can explain, from memory, what a real write-ahead log would
      add that this lesson's own `Transaction` doesn't have —
      referencing this lesson's own CS Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add staged transactions: commit/rollback for insert"`.
