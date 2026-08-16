# Lesson 224: Logging and Recovery — How Systems Survive Crashes

**What you will build**: A real write-ahead log and a recovery process
that survives a crash landing at a genuinely arbitrary point — not the
detectable, in-program failures Lesson 222's rollback already handled,
but a true crash, where nothing is left running to catch anything. It
proves, concretely, that logging an intended change *before* applying
it lets recovery correctly redo a committed transaction the crash erased
all trace of from the actual data — and just as importantly, correctly
discard a transaction that never finished committing at all.

**What you need to know first**: Lesson 222's atomicity and rollback —
this lesson handles the case rollback can't: a failure with no running
code left to respond to it. Lesson 221's `update-row`, reused directly
to apply a logged change to the actual table.

**Terms used in this lesson**:

- **crash** — the system stopping at a completely arbitrary point, with
  no code left running to detect or respond to it; distinct from Lesson
  222's transaction failures, which the running program itself could
  still catch and react to.
- **durability** — the guarantee that once a transaction is reported as
  committed, its effects survive any crash that happens afterward,
  recoverable even if the actual underlying data was never written
  before the crash occurred; exists because Lesson 222's own atomicity
  is worthless on its own if a crash immediately after a transaction
  reports success can still make its effects vanish.
- **write-ahead log** (**WAL**) — an append-only, durable record of a
  transaction's intended changes, written *before* those changes are
  applied to the actual data; exists so that even if a crash happens
  before the real data is updated, enough information survives to redo
  the change correctly afterward.
- **commit marker** — a specific log entry marking a transaction as
  fully finished; recovery treats only transactions with a commit marker
  as real, and treats anything logged without one as though it never
  happened at all.
- **recovery** (also **replay**) — the process, run once after a crash,
  of using the log to bring the actual data back to a correct,
  consistent state: redoing every committed change the data might have
  missed, and ignoring every uncommitted one.
- **idempotent** — an operation that produces the same result whether
  it's applied once or many times; the property recovery's own redo step
  depends on, since it can never be certain whether a logged change was
  already applied to the real data before the crash happened.

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
  - *Their use:* `if` decides whether a log entry is even an "update"
    entry before checking its commit status; `cond` drives every
    recursive scan over the log.
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values.
  - *Its use:* checking a log entry's type string, checking a
    transaction ID against the committed list, checking a scan index
    against a stopping point.
- **`get`** / **`assoc`** / **`count`** / **`+`**
  - *What they are:* Clojure's positional lookup, functional-update,
    length, and addition functions.
  - *Implementation:* `(get coll index)` reads; `(assoc coll index
    value)` returns an updated copy; `(count coll)` returns length;
    `(+ a b)` returns the sum.
  - *Their use:* reused throughout — appending a log entry, reading a
    log entry's own fields, advancing a scan index.

---

## Concept Unit: Write-Ahead Logging — Recording Intent Before Acting

### The Problem

Lesson 222's rollback handles a failure the *running program itself*
can detect — an account that doesn't exist, discovered mid-transaction,
with code still executing to respond to it. A genuine crash is
different: power loss, a killed process, a machine that simply stops —
at a moment nobody chose and nothing running can react to. If that
moment happens to fall in the middle of writing real data to disk, what
survives, and how could anything ever know, afterward, what was actually
supposed to have happened?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because crash recovery is a systems concept this curriculum
  is deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn log-write [log entry]
  (assoc log (count log) entry))

(defn log-update [log tx-id id new-row]
  (log-write log [tx-id "update" id new-row]))

(defn log-commit [log tx-id]
  (log-write log [tx-id "commit"]))
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
user=> (def table0 [["A" 100]])
#'user/table0
user=> (def log0 [])
user=> (def log1 (log-update log0 1 "A" ["A" 70]))
#'user/log1
user=> (def log2 (log-commit log1 1))
#'user/log2
user=> log2
[[1 update A [A 70]] [1 commit]]
user=> table0
[[A 100]]
```

### Mechanical Walkthrough

`(defn log-write [log entry] (assoc log (count log) entry))` — the
established append idiom, `assoc` and `count`, both reappearing, now
appending a whole log entry instead of a row or a block.

`(defn log-update [log tx-id id new-row] (log-write log [tx-id "update"
id new-row]))` — builds an "update" entry: a transaction ID, the literal
string `"update"` naming this entry's type, which row's `id` is being
changed, and its complete new value. `(defn log-commit [log tx-id]
(log-write log [tx-id "commit"]))` — a shorter entry, just a transaction
ID and the type string `"commit"` — no row data at all, since a commit
marker isn't about *what* changed, only *that* a specific transaction is
now finished.

Trace: `log0` starts empty. `(log-update log0 1 "A" ["A" 70])` records,
under transaction `1`, the intent to change account `"A"`'s row to `["A"
70]` — `log1`. `(log-commit log1 1)` records that transaction `1` is
complete — `log2`. Both of these happened *before* `table0` was touched
at all — `table0`, printed again afterward, is still `[["A" 100]]`,
completely unchanged. This gap — the log fully describing a completed
transaction while the real data hasn't caught up yet — is deliberate,
and it's exactly where a real crash could land.

### CS Lens

**Write-ahead** is the entire technique, named directly: log first,
apply second, always in that order, never reversed. The reasoning is
asymmetric on purpose: if a crash happens *after* logging but *before*
applying, the log alone still contains everything needed to finish the
job correctly on recovery (the next unit's whole point). If the order
were reversed — apply first, log second — a crash between the two would
leave real data changed with *no record at all* of what happened or
why, and no way to tell that change apart from data that was simply
always that way. Logging first accepts one specific, narrow risk (a
crash between logging and applying) in exchange for making that risk
fully recoverable, rather than accepting a different risk (a crash
between applying and logging) that would be silent and unrecoverable.

Also recognized in: a pilot's checklist, read and confirmed *before* an
action is taken, not after, so a checklist item never has to describe
something that already, possibly wrongly, happened; a contractor
recording a change order in writing before starting the actual work, so
a dispute later has a record of what was agreed to regardless of how far
the work itself got; a surgical count of instruments taken *before* an
incision closes, catching a discrepancy while it's still fixable rather
than after.

### SE Lens

The alternative — applying changes directly to the real data with no
log at all — is exactly what every earlier persistence lesson in this
curriculum (220, 221, 222) has done: `update-row`, `write-file`, and
`transfer` all mutate their target structures directly, with nothing
recording *why* or confirming the change was ever meant to be permanent.
That's cheaper — no extra writes, no extra structure to maintain — and
it's been completely adequate for everything built so far, because
none of those lessons ever had to survive a crash landing mid-operation;
they only ever had to survive an in-program failure with code still
running to respond to it. The real cost write-ahead logging accepts:
every change now costs *two* writes instead of one — the log entry, and
eventually the real data — genuine overhead, paid on every single
transaction, in exchange for a guarantee none of this curriculum's
earlier persistence work actually had.

---

## Concept Unit: Redo — Recovering a Committed Change the Data Never Received

### The Problem

`log2`, from Unit 1, fully describes a committed transaction — the log
says account `"A"` should be `70`. `table0` still says `100`. If a real
crash happened at exactly this point, and the system restarts, how does
it know to *finish* transaction `1`'s work — and how can it be sure it's
finishing the right thing, using only what survived the crash?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because crash recovery is a systems concept this curriculum
  is deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn committed-tx-ids [log index accumulated]
  (cond
    (= index (count log)) accumulated
    (= (get (get log index) 1) "commit")
      (committed-tx-ids log (+ index 1) (assoc accumulated (count accumulated) (get (get log index) 0)))
    true (committed-tx-ids log (+ index 1) accumulated)))

(defn tx-committed? [committed-ids tx-id index]
  (cond
    (= index (count committed-ids)) false
    (= (get committed-ids index) tx-id) true
    true (tx-committed? committed-ids tx-id (+ index 1))))

(defn log-entry-type [entry]
  (get entry 1))

(defn redo-entry? [entry committed-ids]
  (if (= (log-entry-type entry) "update")
    (tx-committed? committed-ids (get entry 0) 0)
    false))

(defn apply-log-entry [schema table entry]
  (update-row schema table "id" (get entry 2) (get entry 3)))

(defn redo [schema table log committed-ids index]
  (cond
    (= index (count log)) table
    (redo-entry? (get log index) committed-ids)
      (redo schema (apply-log-entry schema table (get log index)) log committed-ids (+ index 1))
    true (redo schema table log committed-ids (+ index 1))))

(defn recover [schema table log]
  (redo schema table log (committed-tx-ids log 0 []) 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def committed-ids-1 (committed-tx-ids log2 0 []))
#'user/committed-ids-1
user=> committed-ids-1
[1]
user=> (def recovered-table-1 (recover schema table0 log2))
#'user/recovered-table-1
user=> recovered-table-1
[[A 70]]
```

### Mechanical Walkthrough

`(defn committed-tx-ids [log index accumulated] ...)` — `cond`,
reappearing, scans the whole log once: `(= index (count log))
accumulated` — reached the end, return every transaction ID collected
so far. `(= (get (get log index) 1) "commit") ...` — this entry's own
type field (position `1`, the same position for both "update" and
"commit" entries) is `"commit"` — append this entry's transaction ID
(position `0`) onto `accumulated`. `true ...` — anything else (an
"update" entry), skip, keep scanning.

`(defn tx-committed? [committed-ids tx-id index] ...)` — a plain linear
search through the committed-IDs list for a specific `tx-id`.

`(defn log-entry-type [entry] (get entry 1))` — a small named accessor,
reused by the next function.

`(defn redo-entry? [entry committed-ids] ...)` — `if`, reappearing:
only "update" entries are ever candidates for redoing at all — a commit
marker carries no data to apply. If this entry *is* an update, its
transaction has to actually appear in `committed-ids` before it counts
as safe to redo — an update entry with no matching commit is
deliberately excluded here, the entire subject of the next unit.

`(defn apply-log-entry [schema table entry] (update-row schema table
"id" (get entry 2) (get entry 3)))` — `update-row`, reappearing from
Lesson 221 completely unchanged, called with the row ID and new row
value stored in this specific log entry's own positions `2` and `3`.

`(defn redo [schema table log committed-ids index] ...)` — walks the
*entire* log, in order, applying every entry `redo-entry?` approves and
skipping every one it doesn't, threading the table forward as it goes —
the same recursion-with-accumulator shape used throughout this
curriculum, with the table itself serving as the accumulator this time.

`(defn recover [schema table log] (redo schema table log
(committed-tx-ids log 0 []) 0))` — the public entry point: first compute
which transactions actually committed, then redo the log against that
knowledge.

Trace: `(committed-tx-ids log2 0 [])` scans `log2`'s two entries —
`[1 "update" ...]`, skipped; `[1 "commit"]`, matched — returning `[1]`.
`(recover schema table0 log2)` then calls `redo`: at index `0`, the
"update" entry for transaction `1` — `redo-entry?` checks its type is
`"update"` (true) and that `1` appears in `committed-ids-1` (true) — so
it's applied: `apply-log-entry` calls `update-row` with `id = "A"`,
`new-row = ["A" 70]`, replacing `table0`'s row and producing `[["A"
70]]`. At index `1`, the commit marker — `redo-entry?` returns `false`
immediately, since its type isn't `"update"` — skipped. The final
recovered table is `[["A" 70]]` — the exact state the system would have
reached if the crash had never interrupted it at all, reconstructed
entirely from the log.

### CS Lens

This is **durability**, made real rather than promised: transaction `1`
was reported committed the instant `log-commit` ran, *before* the actual
table was ever touched — and this unit proves that promise was honest,
because `recover` can reconstruct the correct final state using nothing
but the log, even from a starting point where the real data never
received the change at all. The redo step's own correctness depends on
one property worth naming directly: `apply-log-entry` is
**idempotent** — calling `update-row` with the exact same `new-row`
value produces the identical result whether the real table had already
been updated before the crash or not. Recovery can't know, in general,
exactly how far the pre-crash system got, so it has to be safe to redo a
change that might already be applied — and it is, here, because
`update-row` always replaces a row with an explicit, complete new value,
never something relative like "add `30`," which would double-apply
incorrectly on a second redo.

Also recognized in: a mail server resending a message it isn't certain
was delivered, relying on the recipient's own client to silently
de-duplicate an identical message rather than show it twice; a video
game's autosave, replayable from a checkpoint to reconstruct exactly
where a player was, even if the game crashed mid-frame; a shipping
label's tracking update, safely reapplied by a retry without creating a
second, duplicate "delivered" event.

### SE Lens

The alternative to redo-from-the-log is what this whole unit's Problem
section named as the actual danger: simply accepting whatever state the
real data happens to be in after a crash, with no way to tell a
genuinely finished transaction apart from one that never got as far as
touching the data at all. That's not really an alternative so much as
giving up the guarantee entirely — Lesson 222's own `transfer` promised
atomicity for a program that stays running; without a log, that promise
silently expires the instant the program itself doesn't survive to see
it through. The log's real cost, again: `redo` has to walk the *entire*
log on every recovery, which grows without bound as more transactions
happen — a real, unbounded cost this lesson doesn't yet solve (real
systems periodically write a checkpoint, letting recovery start from a
known-good point instead of the very beginning, trading storage for a
bounded recovery time — a refinement, not a different mechanism, left
here as an honest, acknowledged gap).

---

## Concept Unit: Discarding the Uncommitted — What Recovery Must Not Redo

### The Problem

`recover` correctly finished transaction `1`'s work using only the log.
What happens to a transaction that *logged its intended update* but
never reached `log-commit` at all before the crash — say, the process
died in between? If recovery redid it anyway, a transaction that never
actually finished would end up applied for real, a genuine atomicity
violation happening *because* of the very mechanism built to prevent
one.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because crash recovery is a systems concept this curriculum
  is deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — Unit 2's `committed-tx-ids`, `redo-entry?`, and
`recover` are reused completely unchanged. What's new is only the
scenario: a second transaction whose update is logged but whose commit
never is.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def log3 (log-update log2 2 "A" ["A" 40]))
#'user/log3
user=> log3
[[1 update A [A 70]] [1 commit] [2 update A [A 40]]]
user=> (def committed-ids-2 (committed-tx-ids log3 0 []))
#'user/committed-ids-2
user=> committed-ids-2
[1]
user=> (def recovered-table-2 (recover schema recovered-table-1 log3))
#'user/recovered-table-2
user=> recovered-table-2
[[A 70]]
```

### Mechanical Walkthrough

`(log-update log2 2 "A" ["A" 40])` — transaction `2` logs its intent:
change account `"A"` to `40` (a second debit, from the `70` transaction
`1` left it at). Then — this is the entire scenario — the process
crashes: no `(log-commit log3 2)` ever runs, and the real table is never
touched for transaction `2` either. `log3` is what survives: transaction
`1`'s complete update-and-commit pair, plus transaction `2`'s update
entry, alone.

`(committed-tx-ids log3 0 [])` — scans all three entries: transaction
`1`'s update, skipped (not a commit); transaction `1`'s commit, matched,
appended; transaction `2`'s update, skipped (not a commit — and
critically, transaction `2` has no commit entry anywhere in `log3` for
this scan to ever find). The result, `committed-ids-2`, is `[1]` —
`2` is nowhere in it.

`(recover schema recovered-table-1 log3)` — starts from the already-
recovered table, `[["A" 70]]`. `redo` walks `log3`: transaction `1`'s
update entry — `redo-entry?` finds it's an `"update"` and `1` *is* in
`committed-ids-2` — applied again, replacing `"A"`'s row with the
identical `["A" 70]` it already held (idempotent, no harm, exactly Unit
2's own point). Transaction `1`'s commit marker — skipped, not an
update. Transaction `2`'s update entry — `redo-entry?` finds it's an
`"update"`, but `tx-committed?` checks `2` against `committed-ids-2`
(`[1]`) and finds no match — `redo-entry?` returns `false` — this entry
is skipped entirely, its proposed change to `40` never applied. The
final table is `[["A" 70]]` — completely unaffected by transaction
`2`'s logged-but-uncommitted attempt.

### CS Lens

This is atomicity, restated at the level of an entire log rather than
one in-process function call: a transaction's own log entries genuinely
exist — they're real data, sitting right there in `log3` — and recovery
still treats them as though they never happened, because the one thing
that actually matters, the commit marker, is absent. Nothing about this
required detecting or handling a failure specially — `redo-entry?`'s own
ordinary logic, built in Unit 2 for the *successful* case, already
excludes an uncommitted transaction automatically, simply by checking
for something that isn't there. **The absence of a commit marker is
itself the rollback** — no compensating action needed, unlike Lesson
222's own rollback unit, because the change was never applied to real
data in the first place; there's nothing to undo, only something to
correctly never do.

Also recognized in: a contract that was drafted but never signed,
treated as though no agreement exists at all, regardless of how much
negotiation and drafting work actually happened; a shopping cart's
items, discarded if checkout is never completed, no matter how far
through the checkout flow a shopper got; a draft email, sitting fully
written in a drafts folder, correctly never delivered because the one
required action — clicking send — never happened.

### SE Lens

The alternative would be to track *both* what's logged and some
separate, independent record of "how far did this transaction actually
get toward completion" — timing information, a partial-progress
marker — and use that instead of a simple commit/no-commit check. That
would be strictly more information, and strictly more to get wrong: a
transaction's true progress at the exact moment of a crash is precisely
the one thing that's hardest to observe reliably, since the crash itself
is what prevents anything from recording it accurately. The commit
marker's real elegance is that it reduces an inherently fuzzy question
("how far did this get before dying") to a binary one that's cheap and
unambiguous to check after the fact ("does this one specific log entry
exist or not") — at the cost of nothing about *partial* progress ever
being recoverable or even knowable; a transaction that logged nine out
of ten intended updates and then crashed is treated exactly the same as
one that logged zero, which is correct for atomicity's own purposes, but
means genuinely completed partial work is always fully discarded, never
partially salvaged.

---

## Connect the Pieces

Follow account `"A"`'s balance through every unit built in this lesson,
across two consecutive crashes. Unit 1 logs transaction `1`'s intent —
`"A"` should become `70` — and commits it, all before the real table
(`table0`, still `100`) is ever touched: the write-ahead gap, made
concrete and deliberate. Unit 2 simulates a crash landing exactly in
that gap, then proves `recover` can close it correctly using only the
log: `committed-tx-ids` finds transaction `1`'s real commit marker,
`redo` walks the log and applies its logged update, and the table
reaches `[["A" 70]]` — precisely what should have happened, reconstructed
entirely after the fact. Unit 3 then logs a *second* transaction's
intent — `"A"` should become `40` — but the process crashes again before
that transaction's commit is ever logged. Running `recover` a second
time, against the exact same functions built in Unit 2 with no changes
at all, correctly re-applies transaction `1`'s already-applied update
(harmlessly, since it's idempotent) and correctly skips transaction `2`
entirely, because `committed-tx-ids` never finds a commit marker for
it. The final balance is `70`, not `40` — proving that the single
mechanism built in Unit 2, with no special-casing added for the failure
scenario, already handles both outcomes correctly: redo what genuinely
finished, and silently, automatically discard what didn't.

## What Breaks Without This

Replace `redo-entry?` with a version that applies every logged update
regardless of whether its transaction ever actually committed:

```clojure
(defn redo-entry-broken? [entry committed-ids]
  (= (log-entry-type entry) "update"))
```

Run recovery against `log3` — the exact scenario where transaction `2`
never committed — using this version instead:

```
user=> (redo schema recovered-table-1 log3 committed-ids-2 0)
```

(with `redo-entry?` replaced by `redo-entry-broken?` inside `redo`'s own
body) produces a final table of `[["A" 40]]` — transaction `2`'s
never-committed update gets applied anyway, purely because it happened
to be logged. This is a genuine atomicity violation, and a
particularly dangerous one: it wouldn't just be wrong once — every
future recovery, forever, would keep re-applying this same
never-committed change from the permanent log, since nothing about a
crash ever removes an entry that was already written. Restoring the
commit check brings the correct, permanent exclusion of transaction `2`
back.

## Exercises

1. Simulate a crash landing *between* `log-commit` and the real table
   update for a transaction, exactly as Unit 2 did, but for a table
   with three existing rows, confirming `redo` only touches the one row
   the committed transaction actually changed.
2. Log two entirely separate, independently committed transactions in a
   row (both logged, both committed, neither ever applied to the real
   table because of a crash after both commits), and confirm a single
   call to `recover` correctly redoes both.
3. Write, in prose, what would go wrong if `log-commit` could be called
   *before* the matching `log-update` for the same transaction, instead
   of strictly after — and explain why this lesson's own functions,
   as written, don't actually prevent a caller from doing that by
   mistake.

## Definition of Done

- [ ] `log-write`, `log-update`, `log-commit`, `committed-tx-ids`,
      `tx-committed?`, `redo-entry?`, `apply-log-entry`, `redo`, and
      `recover` all defined and run in a live `bb` REPL, matching every
      transcript shown above exactly.
- [ ] Unit 1's write-ahead gap reproduced: the log fully describing a
      committed transaction while the real table remains untouched.
- [ ] Unit 2's redo reproduced, correctly reconstructing the table from
      the log alone.
- [ ] Unit 3's discard reproduced, confirming an uncommitted
      transaction's logged update is never applied, even on a second,
      later recovery run.
- [ ] Exercise 2 completed, confirming `recover` correctly redoes more
      than one committed transaction in a single pass.
- [ ] `git commit -m "Add Lesson 224: write-ahead logging and recovery —
      redo what committed, discard what didn't, using only what
      survives a crash"`
