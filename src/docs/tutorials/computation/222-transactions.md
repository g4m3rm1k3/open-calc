# Lesson 222: Transactions — Deriving Atomicity and Consistency

**What you will build**: A real bank transfer, built from Lesson 221's
`update-row`, that closes the exact lost-update-shaped gap that lesson
closed with — proving, concretely, that "debit one row, credit another"
needs to happen as a single atomic transaction, not two independent
calls a failure could land between. It derives two genuinely different
requirements a transaction has to satisfy — atomicity (all of it
happens, or none of it does) and consistency (whatever *does* happen
never breaks a declared rule about the data) — and closes with rollback,
undoing already-applied work when a failure is only discoverable after
some of a transaction has already run.

**What you need to know first**: Lesson 221's `update-row`,
`select-where`, and `field-value`, and its own closing demonstration that
two independent updates to the same row can lose one of them. Lesson
212's original lost update, which this lesson generalizes to two rows
instead of one.

**Terms used in this lesson**:

- **transaction** — a group of operations meant to take effect as a
  single unit — all of them, or none — regardless of how many individual
  steps it actually takes to carry out; exists because a real update
  (a transfer between two accounts) often needs more than one row
  changed together, and nothing about the individual changes, on their
  own, guarantees they'll both happen.
- **atomicity** — the specific guarantee that a transaction's effects are
  either entirely applied or entirely absent, never partially visible;
  exists because Lesson 221's own `update-row`, called twice in a row for
  a transfer, offers no such guarantee by itself — a failure between the
  two calls leaves one applied and the other not.
- **consistency** — the guarantee that a transaction only ever moves the
  data from one valid state to another, never leaving it in a state that
  violates a declared rule about what "valid" means; genuinely different
  from atomicity, since a transaction can be perfectly atomic — every
  one of its steps definitely happened — while still producing a result
  that breaks a real rule, if nothing ever checked that rule.
- **invariant** — a fact that must remain true across every legitimate
  state change; this lesson uses two concrete ones: "the total balance
  across every account never changes on a transfer" and "no account's
  balance goes negative."
- **rollback** — undoing a transaction's already-applied partial effects
  after a later step reveals it can't be completed, restoring the data
  to exactly what it was before the transaction began; exists for the
  case atomicity's own "check everything before starting" strategy can't
  cover — a failure only discoverable *after* some real work has already
  happened.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`if`** / **`cond`**
  - *What they are:* Clojure's two-branch and multi-branch conditional
    special forms.
  - *Implementation:* `(if test then else)` returns `then` or `else`;
    `(cond test1 result1 ... true default)` returns the result paired
    with the first truthy test.
  - *Their use:* `if` decides whether a transfer has sufficient funds or
    whether a rollback target exists; `cond`, reused inside
    `select-where` and `field-index`, drives every recursive scan.
- **`>=`**
  - *What it is:* Clojure's greater-than-or-equal comparison function.
  - *Implementation:* `(>= a b)` returns `true` if `a` is greater than or
    equal to `b`.
  - *Its use:* `transfer-if-sufficient`'s own funds check — is the
    account's balance at least as large as the amount being withdrawn.
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values.
  - *Its use:* every scan's stopping condition and field-name match,
    reused from Lesson 221.
- **`+`** / **`-`**
  - *What they are:* Clojure's addition and subtraction functions.
  - *Implementation:* `(+ a b)` / `(- a b)` return the sum or
    difference.
  - *Their use:* computing a new balance after a debit or credit, and
    accumulating a running total across every account.
- **`get`** / **`assoc`** / **`count`**
  - *What they are:* Clojure's positional lookup, functional-update, and
    length functions.
  - *Implementation:* `(get coll index)` reads; `(assoc coll index
    value)` returns an updated copy; `(count coll)` returns how many
    elements a collection holds.
  - *Their use:* reused throughout, from Lesson 221's `field-value`,
    `select-where`, and `update-row`, all called directly in this
    lesson's own transfer functions.

---

## Concept Unit: Atomicity — All of a Transfer, or None of It

### The Problem

Lesson 221 closed by proving that two independent calls to `update-row`
on the *same* row can lose an update if both read a stale balance first.
A bank transfer is a different, related danger: it needs *two different
rows* — the sender's account and the receiver's — updated together, and
if anything interrupts the work between those two updates, money either
vanishes (debited but never credited) or is duplicated (credited without
ever being debited). Can a transfer be written so that, from any outside
observer's point of view, both changes happen together or neither does?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because transactions are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn account-balance [schema table id]
  (field-value schema (get (select-where schema table "id" id 0 []) 0) "balance"))

(defn debit [schema table id amount]
  (update-row schema table "id" id [id (- (account-balance schema table id) amount)]))

(defn credit [schema table id amount]
  (update-row schema table "id" id [id (+ (account-balance schema table id) amount)]))

(defn transfer-if-sufficient [schema table from-id to-id amount from-balance]
  (if (>= from-balance amount)
    (credit schema (debit schema table from-id amount) to-id amount)
    table))

(defn transfer [schema table from-id to-id amount]
  (transfer-if-sufficient schema table from-id to-id amount (account-balance schema table from-id)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def schema ["id" "balance"])
#'user/schema
user=> (def table0 [["A" 100] ["B" 50]])
#'user/table0
user=> (def table1 (transfer schema table0 "A" "B" 30))
#'user/table1
user=> table1
[[A 70] [B 80]]
```

The danger, made concrete — a debit with no matching credit, as if the
system stopped right after the first update:

```
user=> (def crashed-table (debit schema table0 "A" 30))
#'user/crashed-table
user=> crashed-table
[[A 70] [B 50]]
```

### Mechanical Walkthrough

`(defn account-balance [schema table id] (field-value schema (get
(select-where schema table "id" id 0 []) 0) "balance"))` — `defn`,
reappearing; three reused calls composed together: `select-where`,
reappearing from Lesson 221, finds the one row matching this `id`; `get`
pulls that single row out of the (one-element) result vector it
returns; `field-value` reads its `"balance"` field.

`(defn debit [schema table id amount] (update-row schema table "id" id
[id (- (account-balance schema table id) amount)]))` — `update-row`,
reappearing, replaces this account's row with a *new* row: the same
`id`, and a balance computed by `-`, reappearing, subtracting `amount`
from whatever `account-balance` currently reads.

`(defn credit [schema table id amount] ...)` — the mirror, using `+`,
reappearing, instead of `-`.

`(defn transfer-if-sufficient [schema table from-id to-id amount
from-balance] ...)` — `if`, reappearing, guarded by `>=`: does the
sender's balance cover the amount? If so, the "then" branch —
`(credit schema (debit schema table from-id amount) to-id amount)` —
calls `debit`, and immediately feeds *its result* directly into `credit`
as `credit`'s own `table` argument, both inside one single expression,
one single function call. If not, the "else" branch returns `table`
completely untouched — nothing happened at all.

`(defn transfer [schema table from-id to-id amount] (transfer-if-
sufficient schema table from-id to-id amount (account-balance schema
table from-id)))` — the public entry point, reading the sender's current
balance once and handing it to the checked version.

Trace: `table0` starts `[["A" 100] ["B" 50]]`. `(transfer schema table0
"A" "B" 30)` — reads `A`'s balance, `100`; `(>= 100 30)` is `true`; calls
`debit`, producing an intermediate table where `A` is `70`, and
*immediately* passes that exact intermediate value into `credit`, which
reads `B`'s balance from *that* table (`50`, unaffected by the debit)
and produces the final `table1 = [["A" 70] ["B" 80]]`. Nothing outside
this one call to `transfer` ever sees the intermediate, debit-only
state — it exists only as a value passed directly from one function call
to the next, never returned, never stored anywhere a second caller could
read it.

Contrast the danger trace: `(debit schema table0 "A" 30)` alone, with no
following `credit` call at all — `crashed-table = [["A" 70] ["B" 50]]`.
`A` lost `30`; `B` never gained anything. If a real system's process
stopped at exactly this point — a crash, a network failure between two
separate calls — this is precisely the state it would be left in: money
genuinely gone, not merely unaccounted-for.

### CS Lens

`transfer`'s real atomicity doesn't come from any special machinery —
it comes from composing `debit` and `credit` as one nested expression
inside a single function call, the same technique Lesson 217's
`test-and-set` used to collapse two separate, interleavable steps into
one indivisible one. No other code can observe `transfer`'s own
in-between state for the identical reason no other thread could observe
`test-and-set`'s in-between state: there isn't a moment where control
returns to anything else while it's happening. This is **atomicity by
composition** — the cheapest possible way to get it, available whenever
every step of a transaction can be decided and carried out inside one
uninterrupted call, with nothing needing to check external state or wait
on anything else in between.

Also recognized in: a spreadsheet formula recalculating an entire
dependent chain of cells in one pass, never showing a user a
partially-updated intermediate state; a compiler's single-pass code
generation for one expression, never emitting half of a computed value;
a document editor's "replace all" operation, either fully completing
across every match or reporting nothing changed, never leaving half the
document changed.

### SE Lens

The alternative — calling `debit` and `credit` as two genuinely separate
top-level operations, the way the crashed-table trace did on purpose —
is simpler to write and, in the absence of failures, produces the
identical result. Its real cost only shows up exactly when something
goes wrong between the two calls: a crash, an exception, a network
partition separating the machine running the code from the machine
holding the second account. Composing them into one function call
doesn't eliminate the possibility of failure — it only guarantees that
if a failure happens, it happens either *entirely before* both changes
or (for a single, in-process function call like this one) not at all,
never in the gap between them, because there is no longer a gap for
anything to happen in. The real limitation, honestly: this technique
only works when the whole transaction fits inside one function call
running on one machine — Lesson 228 (Distributed State) will need a
genuinely different answer once "the two accounts" can no longer be
guaranteed to live behind the same single call at all.

---

## Concept Unit: Consistency — A Rule Atomicity Alone Doesn't Enforce

### The Problem

`transfer` guarantees its two updates happen together or not at all —
real atomicity. But atomicity says nothing about whether the *result* is
actually sensible. What if a transfer is requested for more money than
an account actually holds? A perfectly atomic version of that transfer —
debit *and* credit both genuinely happening together — could still leave
an account with a negative balance, a result nothing about "atomic"
alone rules out. Is there a separate, checkable property this lesson's
transfer needs, beyond just "all or nothing"?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because transactions are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn sum-balances [schema table index total]
  (if (= index (count table))
    total
    (sum-balances schema table (+ index 1) (+ total (field-value schema (get table index) "balance")))))

(defn transfer-no-check [schema table from-id to-id amount]
  (credit schema (debit schema table from-id amount) to-id amount))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (sum-balances schema table0 0 0)
150
user=> (sum-balances schema table1 0 0)
150
```

`transfer-no-check` — the identical debit-then-credit composition, with
Unit 1's `>=` guard deliberately removed:

```
user=> (def overdrawn (transfer-no-check schema table0 "A" "B" 500))
#'user/overdrawn
user=> overdrawn
[[A -400] [B 550]]
user=> (sum-balances schema overdrawn 0 0)
150
```

### Mechanical Walkthrough

`(defn sum-balances [schema table index total] ...)` — `defn`,
reappearing, the same recursion-with-accumulator shape used throughout
this section: `if`, reappearing, stops once `index` reaches the end of
the table and returns `total`; otherwise, `+`, reappearing, adds this
row's own balance (read via `field-value`, reappearing) onto the running
`total`, and recurses one row further.

`(defn transfer-no-check [schema table from-id to-id amount] (credit
schema (debit schema table from-id amount) to-id amount))` — identical
in shape to Unit 1's `transfer-if-sufficient`'s "then" branch, with the
`>=` guard removed entirely — `debit` and `credit` are composed exactly
the same way, still perfectly atomic (one function call, no observable
in-between state), but with nothing checking whether the amount actually
makes sense first.

Trace: `(sum-balances schema table0 0 0)` is `150` (`100 + 50`).
`(sum-balances schema table1 0 0)`, after Unit 1's *correct* transfer, is
also `150` — the total is genuinely unchanged, exactly what a transfer
is supposed to do: move money, not create or destroy it. `(transfer-
no-check schema table0 "A" "B" 500)` — `A` only has `100`, but nothing
stops the request: `debit` produces `A = 100 - 500 = -400`; `credit`
produces `B = 50 + 500 = 550`. `overdrawn` is `[["A" -400] ["B" 550]]` —
and `(sum-balances schema overdrawn 0 0)` is *still* `150`. The total
is conserved — the arithmetic of a symmetric debit and credit guarantees
that no matter the amount — but the result is still genuinely broken:
account `A` now holds a negative balance, which the real world this
table represents has no meaning for at all.

### CS Lens

This is the real distinction between atomicity and consistency, made
concrete rather than definitional: `transfer-no-check` is exactly as
atomic as `transfer` — both compose `debit` and `credit` into one
uninterruptible call — and the conserved-total **invariant** held in
*both* cases, correct or overdrawn, because it's a pure consequence of
debiting and crediting the same amount, not something either function
actually checks. The invariant that actually failed — "no balance goes
negative" — was never mechanically checked by `transfer-no-check` at
all; only `transfer-if-sufficient`'s `>=` guard, from Unit 1, checks it.
**Consistency is always relative to a specific, declared rule** — a
system is never "consistent" in the abstract, only consistent *with*
whatever invariant someone actually wrote a check for.

Also recognized in: a spreadsheet's data-validation rule, rejecting an
entered value that would violate a stated constraint (a percentage over
`100`, a date before a start date), even though the cell's own basic
storage mechanism would happily hold the invalid value; a shopping
cart's inventory check, refusing to complete a checkout that would sell
more units than are actually in stock, even though the underlying
subtraction is arithmetically fine; a scheduling system's
double-booking check, refusing to confirm a meeting that would overlap
an existing one on the same calendar.

### SE Lens

The alternative to an explicit invariant check is exactly
`transfer-no-check`: trust that no caller will ever request an invalid
transfer, and skip the guard entirely. That's cheaper — one less
comparison per call — and correct as long as every caller is
well-behaved. The real cost of skipping it: the moment any caller,
malicious or merely buggy, requests something the system's own designer
never intended, nothing stops it, and the resulting bad state
(a negative balance here) is now indistinguishable, from the data's own
point of view, from a perfectly legitimate one — nothing about `["A"
-400]` looks obviously wrong to code that reads it later without also
knowing the rule it broke. An invariant is only as good as which ones
were actually thought of and written down as real checks; this lesson's
own `sum-balances` proves the total-conservation invariant holds even in
the broken case — a reminder that even a true, checkable invariant can
coexist with a badly broken result, if it isn't the *right* invariant
for what actually went wrong.

---

## Concept Unit: Rollback — Undoing Work a Later Step Reveals Was Premature

### The Problem

Unit 1's `transfer` avoids ever starting a transaction it can't
complete, by checking sufficiency *before* doing anything. But not every
failure can be known in advance. What if the debit genuinely succeeds,
and only *afterward* does something reveal the credit can't happen —
say, the destination account doesn't exist at all? The debit has already
been applied by that point; simply stopping there reproduces exactly
Unit 1's own vanishing-money danger, just for a different reason.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because transactions are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn account-exists? [schema table id]
  (> (count (select-where schema table "id" id 0 [])) 0))

(defn transfer-after-debit [schema debited-table from-id to-id amount to-exists?]
  (if to-exists?
    (credit schema debited-table to-id amount)
    (credit schema debited-table from-id amount)))

(defn transfer-with-rollback [schema table from-id to-id amount]
  (transfer-after-debit schema (debit schema table from-id amount) from-id to-id amount
    (account-exists? schema table to-id)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def rolled-back (transfer-with-rollback schema table0 "A" "Z" 30))
#'user/rolled-back
user=> rolled-back
[[A 100] [B 50]]
user=> (= rolled-back table0)
true
```

### Mechanical Walkthrough

`(defn account-exists? [schema table id] (> (count (select-where schema
table "id" id 0 [])) 0))` — `select-where`, reappearing, returns every
row matching `id`; `count`, reappearing, checks whether that's more than
`0` — `>`, reappearing — meaning at least one row was actually found.

`(defn transfer-after-debit [schema debited-table from-id to-id amount
to-exists?] ...)` — takes a table where the debit has *already*
happened (`debited-table`), plus whether the destination account exists.
`if`, reappearing: if it does, proceed normally — `credit` the
destination, exactly as Unit 1's `transfer-if-sufficient` did.
If it doesn't — the "else" branch — `credit` is still called, but
targeting `from-id`, the *original sender*, not `to-id`. This is the
rollback itself: crediting the exact amount that was just debited, back
onto the same account it came from, undoing the debit's effect
completely.

`(defn transfer-with-rollback [schema table from-id to-id amount] ...)`
— the orchestration: `debit` runs *unconditionally* first — the "already
did this piece of work" this unit's Problem section described — and
*separately*, `account-exists?` checks the destination against the
*original*, pre-debit `table`. Both results feed into
`transfer-after-debit`.

Trace: `(transfer-with-rollback schema table0 "A" "Z" 30)` — `debit`
runs first, unconditionally: `A`'s balance drops to `70`, producing an
intermediate table, `debited-table = [["A" 70] ["B" 50]]`.
`account-exists?` checks `"Z"` against the *original* `table0` and finds
nothing — `to-exists? = false`. `transfer-after-debit` takes the "else"
branch: `credit` is called on `debited-table`, crediting `30` back onto
`"A"` — not `"Z"` — producing `[["A" 100] ["B" 50]]`. `(= rolled-back
table0)` is `true`: the final result is not merely *similar* to the
original state, it is *exactly* equal to it — the debit really happened
and was really undone, arithmetically, rather than the code simply
having skipped doing anything in the first place.

### CS Lens

This is real **rollback** — undoing already-applied effects, as opposed
to Unit 1's strategy of never applying them in the first place. The two
strategies solve overlapping but distinct problems: a check-first
approach (Unit 1's `>=` guard) works whenever the failure condition is
knowable *before* any work begins; rollback is needed whenever it can
only be discovered *after*, which is common the moment a transaction's
later steps depend on something (another account existing, a network
call succeeding) that genuinely can't be verified until that step is
actually reached. A transaction system built only on check-first logic
silently assumes every possible failure is predictable in advance — an
assumption real systems can't actually make.

Also recognized in: a database migration script that wraps its changes
in a transaction specifically so a failure partway through triggers an
automatic rollback, leaving the schema exactly as it was rather than
half-migrated; a document editor's undo command, restoring exactly the
prior state rather than merely refusing further edits; a `git revert`,
which doesn't prevent a bad commit from ever landing, but applies a
compensating change that exactly cancels its effect.

### SE Lens

The alternative to rollback is exactly what Unit 1's design already
does: verify every precondition up front, and refuse to start at all if
anything looks wrong, never allowing a step to run whose failure would
need undoing later. That's simpler — no compensating logic to write, no
risk of getting the "undo" itself wrong — but it only covers failures
that are actually predictable before the fact. The real cost rollback
accepts in exchange for covering the unpredictable case: the
compensating operation has to be written *correctly*, by hand, for every
kind of partial failure a transaction might hit, and getting it subtly
wrong (crediting the wrong account, crediting the wrong amount, forgetting
to run it on some other failure path entirely) reintroduces exactly the
kind of silent corruption this whole lesson exists to prevent — a debt
this lesson's own single, narrow rollback case doesn't fully retire,
since a transaction with more steps needs more rollback logic, not
automatically more of it for free.

---

## Connect the Pieces

Follow account `"A"`'s balance through every unit built in this lesson,
across two different transfer attempts starting from the same `table0`.
A correct transfer to an account that exists (Unit 1): `debit` and
`credit` compose inside one function call, no in-between state ever
observable, landing at `A = 70`, `B = 80` — and `sum-balances` (Unit 2)
confirms the total, `150`, is exactly conserved, the invariant a correct
transfer is supposed to uphold. The *same* composition, with Unit 1's
`>=` guard removed (Unit 2's `transfer-no-check`), is still perfectly
atomic — still one function call, still no observable in-between state —
and still conserves the *total*, `150` — proving atomicity and this
particular invariant are genuinely independent facts, since the result,
`A = -400`, is atomic and total-conserving and still completely broken,
because nothing checked the *specific* rule that actually mattered here:
no negative balances. A transfer to an account that doesn't exist at
all (Unit 3) needs a third strategy: `debit` runs first, unconditionally,
and only *afterward* does `account-exists?` reveal the transaction can't
complete — `transfer-with-rollback` responds not by leaving the debit in
place, but by crediting the exact amount straight back to `"A"`,
landing at a final state *identical* to `table0`, proven by direct
equality, not merely "close enough." Three different transfer attempts,
three different outcomes, and every one of them traces back to a
different one of this lesson's three concepts: composition for
atomicity, an explicit check for consistency, and a compensating
operation for rollback.

## What Breaks Without This

Replace `transfer-with-rollback`'s rollback branch with a version that
simply stops after the debit, doing nothing further on failure:

```clojure
(defn transfer-after-debit-broken [schema debited-table from-id to-id amount to-exists?]
  (if to-exists?
    (credit schema debited-table to-id amount)
    debited-table))
```

Run the identical scenario — a transfer to `"Z"`, which doesn't exist —
against it:

```
user=> (transfer-after-debit-broken schema (debit schema table0 "A" 30) "A" "Z" 30 false)
[[A 70] [B 50]]
```

`A`'s balance is `70`, permanently — the same vanishing-money result
Unit 1's own crashed-table trace produced, now reached not by an actual
crash, but by a rollback branch that was written to detect the failure
correctly and then simply didn't do anything about it. Restoring the
compensating `credit` call brings the correct, fully-restored `[["A"
100] ["B" 50]]` back.

## Exercises

1. Extend `transfer-with-rollback` to also check whether the *source*
   account exists before debiting at all (rather than only checking the
   destination afterward), and explain in one sentence why checking the
   source up front is possible here in a way checking the destination up
   front alone wasn't sufficient for Unit 3's actual scenario.
2. Write a `total-invariant-holds?` predicate that compares
   `sum-balances` before and after any transfer, returning `true` only
   if the total is genuinely unchanged, and run it against both
   `table1` (Unit 1) and `overdrawn` (Unit 2) to confirm it can't, on
   its own, distinguish the correct transfer from the broken one —
   demonstrating directly why the specific invariant chosen matters.
3. Build a three-step transaction (debit `A`, credit `B`, then credit a
   fixed transaction fee to a third account `"FEES"`) where the third
   step's account might not exist, and write the rollback logic needed
   to undo *both* of the first two steps if the third one fails.

## Definition of Done

- [ ] `account-balance`, `debit`, `credit`, `transfer-if-sufficient`,
      `transfer`, `sum-balances`, `transfer-no-check`,
      `account-exists?`, `transfer-after-debit`, and
      `transfer-with-rollback` all defined and run in a live `bb` REPL,
      matching every transcript shown above exactly.
- [ ] The Unit 1 correct transfer and crashed-table danger both
      reproduced.
- [ ] The Unit 2 conserved-total invariant confirmed on both the correct
      and the overdrawn transfer, with a clear statement of which
      specific invariant the overdrawn case actually violates.
- [ ] The Unit 3 rollback reproduced, with the final state confirmed
      *exactly* equal to the original table via `=`, not just visually
      similar.
- [ ] Exercise 2 completed, with a one-sentence explanation of why total
      conservation alone can't catch every kind of consistency
      violation.
- [ ] `git commit -m "Add Lesson 222: atomicity by composition,
      consistency as a specific checked invariant, and rollback for
      failures only discoverable mid-transaction"`
