# Lesson 217: Atomics — Indivisible Operations

**What you will build**: A concrete proof that Lesson 213's own
`lock-acquire` — built from an ordinary check step and an ordinary write
step — carries exactly the same race condition Lesson 212 found in a
naive counter increment, one level further down. Then two real hardware
primitives that close that gap by making "read the current value and
write a new one" a single, indivisible step no other thread's operation
can land in the middle of: `test-and-set`, which fixes the lock, and the
more general `compare-and-swap`, which goes back and fixes Lesson 212's
original counter bug directly, without needing a lock at all.

**What you need to know first**: Lesson 212's race condition and
interleaving (two threads' individual steps, reordered against each
other, some orderings correct and some producing a lost update). Lesson
213's lock, acquire, and release. Lesson 214's vector-as-pair convention
for a function returning two related results at once.

**Terms used in this lesson**:

- **race condition** — a bug that only appears under a specific,
  timing-dependent ordering of two or more threads' individual steps,
  where some legal orderings produce a correct result and others don't;
  the underlying problem this whole lesson traces one level deeper than
  Lesson 212 first found it.
- **atomic operation** (also **indivisible operation**) — an operation
  that, from every other thread's point of view, either hasn't happened
  yet or has completely finished — never observable partway through;
  exists because Lesson 213's own `lock-acquire`, built from two
  ordinary separate steps, turns out to have exactly the race condition
  it was supposed to prevent, one level down.
- **test-and-set** — a specific atomic operation that reads a memory
  location's current value and unconditionally writes a new fixed value
  into it, both as one indivisible step, reporting the value that was
  there immediately before the write; exists to give software a genuine
  building block for mutual exclusion that isn't itself built from two
  separate, interleavable steps.
- **compare-and-swap** (**CAS**) — a more general atomic operation: it
  writes a new value into a location only if that location currently
  still holds a specific expected value, reporting whether the write
  actually happened; exists because `test-and-set` can only ever write
  one fixed constant, while many real updates — incrementing a counter,
  for instance — need the new value to depend on whatever the current
  one turns out to be.
- **retry** — trying an operation again after a failed attempt, using
  freshly re-read information instead of the stale information the
  failed attempt was based on; the standard response to a failed
  `compare-and-swap`, and the reason CAS-based code needs no lock at
  all — a failure just means "try again with the truth," not "something
  went wrong."

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson — `naive-check`,
    `naive-commit`, `test-and-set`, `tas-acquired?`, `compare-and-swap`.
- **`if`**
  - *What it is:* Clojure's two-branch conditional special form.
  - *Implementation:* `(if test then else)` evaluates `test`; returns
    `then` if truthy, `else` otherwise.
  - *Its use:* `compare-and-swap` decides between a successful write and
    a refused one with a single `if`.
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values.
  - *Its use:* `naive-check` asks whether the lock reads as free;
    `compare-and-swap` asks whether the current value still matches what
    the caller last saw.
- **`+`**
  - *What it is:* Clojure's addition function.
  - *Implementation:* `(+ a b)` returns the sum of `a` and `b`.
  - *Its use:* every counter-increment attempt computes its proposed new
    value as one more than the value it last read.
- **`get`**
  - *What it is:* Clojure's positional lookup function for an indexed
    collection.
  - *Implementation:* `(get coll index)` returns the value at `index`.
  - *Its use:* reading the old value or the success flag back out of a
    `test-and-set` or `compare-and-swap` result pair.
- **`def`**
  - *What it is:* Clojure's top-level name-binding form, used here only
    at the REPL to hold example state between steps.
  - *Implementation:* `(def name value)` evaluates `value` once and
    binds `name` to the result.
  - *Its use:* every `user=>` transcript in this lesson uses `def` to
    carry a lock's or counter's state from one thread's turn to the
    next.

---

## Concept Unit: The Race Inside Lock-Acquire Itself

### The Problem

Lesson 213 built a lock — a single `true`/`false` value — and an
`acquire` operation around it. But look at what that acquire operation
actually does, as two separate actions in sequence: first, check whether
the lock currently reads as free; second, if it did, write it to
`true`. Those are two distinct steps, performed one after the other, by
whichever thread is trying to acquire. That's the exact same shape as
Lesson 212's own naive increment — a separate read step, then a separate
write step, with a gap between them that another thread's own steps
could land inside. Does the identical danger apply here too?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because atomics are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn naive-check [locked?]
  (= locked? false))

(defn naive-commit [locked?]
  true)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

The unsafe ordering — both threads check before either commits:

```
user=> (def locked-a false)
#'user/locked-a
user=> (def a-saw-free? (naive-check locked-a))
#'user/a-saw-free?
user=> a-saw-free?
true
user=> (def locked-b locked-a)
#'user/locked-b
user=> (def b-saw-free? (naive-check locked-b))
#'user/b-saw-free?
user=> b-saw-free?
true
user=> (def locked-after-a (naive-commit locked-a))
user=> (def locked-after-b (naive-commit locked-b))
user=> [a-saw-free? b-saw-free?]
[true true]
```

The safe ordering, for contrast — A finishes completely before B even
checks:

```
user=> (def locked0 false)
#'user/locked0
user=> (def a-saw-free2? (naive-check locked0))
#'user/a-saw-free2?
user=> a-saw-free2?
true
user=> (def locked1 (naive-commit locked0))
#'user/locked1
user=> locked1
true
user=> (def b-saw-free2? (naive-check locked1))
#'user/b-saw-free2?
user=> b-saw-free2?
false
```

### Mechanical Walkthrough

`(defn naive-check [locked?] (= locked? false))` — `defn`, reappearing,
names the read step: `=`, reappearing, asks whether the lock's current
value is `false` — free. This is exactly the observation a thread makes
before deciding whether it's allowed to proceed.

`(defn naive-commit [locked?] true)` — the write step: takes whatever
state is passed in and returns `true` unconditionally. This is what a
thread does *after* its own check told it the lock was free — it writes
`locked?` to `true`, believing it has just become the exclusive holder.

Trace the unsafe ordering: `locked-a` starts `false`. `(naive-check
locked-a)` — thread A's check — sees `false`, so `a-saw-free?` is
`true`: A believes it can proceed. `locked-b` is set to `locked-a`'s
value directly — this line represents thread B's check happening *before
A has written anything at all*, so B is reading the exact same
still-unlocked state A read a moment ago. `(naive-check locked-b)` —
thread B's check — also sees `false`; `b-saw-free?` is also `true`. Both
threads have now independently concluded "the lock is free, I may take
it," and neither one has any way of knowing the other reached the same
conclusion, because neither has committed anything yet. `naive-commit`
is then called for both — each write, on its own, looks completely
ordinary — but the real damage already happened at the check step: two
threads both believe they hold a lock that, by definition, only one
thread may ever correctly hold at a time.

Trace the safe ordering, for direct comparison: `locked0` starts
`false`. A checks, sees `false`, and — critically, this time — *commits
fully* via `naive-commit` before B ever gets a turn: `locked1` is `true`.
Only now does B check, against `locked1`, and `(naive-check locked1)`
correctly returns `false` — B sees the lock as taken and, per its own
logic, does not proceed. The only difference between these two traces is
*when* B's check happened relative to A's commit — nothing in
`naive-check` or `naive-commit` themselves prevents the first, unsafe
ordering from happening; both orderings are equally legal sequences of
the same two threads' own individually-ordered steps.

### CS Lens

This is a **race condition**, restated in exactly the shape Lesson 212
first found it: two threads, each performing a read then a write, with a
timing-dependent gap between the two where the other thread's own steps
can land. The specific damage here — two threads both believing they
hold a lock meant for one — is a direct structural cousin of Lesson
212's lost update, just at a different layer: there, a value was
supposed to be incremented twice and was only incremented once; here, a
lock is supposed to be held by one thread and ends up believed-held by
two.

Also recognized in: two people each glancing at an unclaimed seat, both
concluding it's free, and both sitting down before either notices the
other; a ticket-reservation system's naive "check availability, then
book" flow selling the same seat twice when two purchases happen close
together; any "check, then act" pattern anywhere in software, which is
the general shape this specific bug is one instance of.

### SE Lens

Lesson 213 didn't fail to notice this — its own closing section named it
directly and deferred the fix here on purpose, rather than pretending
`lock-acquire` was already fully safe. The honest alternative at the
time would have been to build a more elaborate `lock-acquire`, adding
more checks around the existing check-then-write shape — but no amount
of additional software-level checking closes this gap, because the gap
is *between* two separate operations, and any additional check is itself
just another separate operation with its own gaps. The real fix has to
come from somewhere that isn't just "more careful sequential code" — it
has to come from an operation that is, by construction, not made of two
separate steps at all. That's what the rest of this lesson builds.

---

## Concept Unit: Test-and-Set — A Real Atomic Fix

### The Problem

`naive-check` and `naive-commit` are two separate function calls, and
the whole problem traced above comes from exactly that separation —
another thread's own call can happen in the gap between them. What if
"read the current value and write a new one" were a single call
instead — one operation, with no gap inside it for anything else to land
in?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because atomics are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn test-and-set [locked?]
  [locked? true])

(defn tas-acquired? [tas-result]
  (= (get tas-result 0) false))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def resultA (test-and-set false))
#'user/resultA
user=> resultA
[false true]
user=> (tas-acquired? resultA)
true
user=> (def resultB (test-and-set (get resultA 1)))
#'user/resultB
user=> resultB
[true true]
user=> (tas-acquired? resultB)
false
```

### Mechanical Walkthrough

`(defn test-and-set [locked?] [locked? true])` — `defn`, reappearing.
The body is a two-element vector, the same vector-as-pair convention
this curriculum has used throughout: slot `0` is `locked?`, the value
that was there *before* this call — read once, before anything changes;
slot `1` is the bare literal `true` — the new value, written
unconditionally, every single time this function is called, regardless
of what `locked?` was. Both the read and the write happen inside this
one function call. There is no second, separate call for another
thread's own call to be scheduled in between — a single Clojure function
call is never observed half-finished by anything else, which is exactly
the property real hardware guarantees for a genuine `test-and-set`
instruction, and exactly the property `naive-check`/`naive-commit`
lacked by being two calls instead of one.

`(defn tas-acquired? [tas-result] (= (get tas-result 0) false))` — `get`,
reappearing, reads slot `0` back out of the pair — the *old* value.
`=`, reappearing, checks whether that old value was `false`. A thread
"acquired" the lock exactly when the value it displaced, at the instant
of its own call, was free — not when the lock's value happens to be
`true` *afterward*, since `test-and-set` writes `true` regardless of who
called it or how many times.

Trace: `(test-and-set false)` — A's call, on a genuinely free lock —
returns `[false true]`: the old value really was `false`, so
`tas-acquired?` correctly reports `true`. `(test-and-set (get resultA
1))` — B's call, using the *actual current* state after A's call, `true`
— returns `[true true]`: the old value was already `true`, so
`tas-acquired?` correctly reports `false` for B. Exactly one of the two
threads acquired the lock — the double-acquire from Unit 1 cannot
happen here, because there is no ordering of two single, complete
function calls that lets both of them see `false` as the old value,
unless the lock genuinely was free twice, which it never can be once one
call has already run.

One honest caveat, worth stating directly: nothing stops a reader from
calling `(test-and-set false)` twice in a row, both times passing the
literal `false`, and getting `[false true]` both times — that would look
exactly like Unit 1's bug again. That isn't test-and-set failing; it's
feeding it stale information on purpose, the same mistake as pretending
`locked-b` in Unit 1 wasn't really `locked-a`'s exact value. The real
guarantee `test-and-set` provides is about two *genuinely concurrent*
calls against the *same real memory location* — the hardware itself
ensures that whichever call actually happens first is the only one that
can ever see the pre-call value, because the hardware, not the calling
software, is what enforces there being no gap inside the operation. This
lesson's Clojure model can only demonstrate that guarantee by correctly
threading each thread's own state forward, as `resultB`'s use of `(get
resultA 1)` does above — it cannot manufacture the guarantee itself,
because on real hardware, that guarantee is a fact about the machine,
not a fact this simulation's own code proves from more basic parts.

### CS Lens

**Atomicity**, the property test-and-set provides, means "appears
instantaneous to every observer" — never "no time passes," which would
be physically impossible, but "no other operation can ever observe a
state partway between this operation's start and its finish." This is a
genuinely different kind of guarantee than anything built earlier in
this section: Lesson 213's lock provided mutual exclusion for a whole
*critical section*, a whole stretch of a thread's own code; atomicity is
about a single, specific low-level operation being indivisible in the
first place — the raw material Lesson 213's own lock, and everything
built from it, ultimately has to rest on *something* being atomic at the
bottom, or none of it would actually work.

Also recognized in: a bank's real funds transfer, which must debit one
account and credit another as a single unit no other transaction can
observe half-done; a database transaction's commit, which either
publishes every one of its writes at once or none of them; a file
rename on most real filesystems, implemented so that any process looking
at the directory sees either the old name or the new one, never a
moment with neither.

### SE Lens

The alternative to a genuine hardware atomic is exactly what Lesson 213
already tried and this lesson's first unit just found broken: building
mutual exclusion entirely out of ordinary, separately-interleavable
steps, no matter how carefully arranged. That approach can't ever fully
succeed, for a structural reason, not a carelessness one — any two
separate operations can always, in principle, have a third operation
scheduled between them. The tradeoff of reaching for a hardware atomic
instead: it isn't something this curriculum's own code can build from
scratch out of ordinary reads and writes — it has to be taken as a given,
provided by the processor itself, the same way this whole curriculum has
always taken some things as given rather than re-deriving them from
first principles (Lesson 188's IEEE-754 bit layout, Lesson 196's
addressing modes). The debt honestly acknowledged: this lesson's
`test-and-set` is a *model* of that hardware guarantee, useful for
reasoning about what it makes possible, but the real safety comes from
silicon, not from anything Clojure code — this lesson's or any other —
can enforce on its own.

---

## Concept Unit: Compare-and-Swap — A More General Atomic

### The Problem

`test-and-set` only ever writes one fixed value, `true` — perfect for a
lock, which only ever needs to represent "held" or "free." But Lesson
212's original bug wasn't about a lock at all — it was about safely
*incrementing a shared counter*, where the new value a thread wants to
write depends entirely on whatever the counter's current value happens
to be, not on some fixed constant. Can an atomic operation express "write
this new value, but only if the current value is still what I last saw
it to be" — something general enough to fix an increment, not just a
lock?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because atomics are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn compare-and-swap [current expected new-value]
  (if (= current expected)
    [new-value true]
    [current false]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def counter-real 0)
#'user/counter-real
user=> (def seen-a 0)
user=> (def seen-b 0)
user=> (def a-cas (compare-and-swap counter-real seen-a (+ seen-a 1)))
#'user/a-cas
user=> a-cas
[1 true]
user=> (def counter-real (get a-cas 0))
#'user/counter-real
user=> counter-real
1
user=> (def b-cas1 (compare-and-swap counter-real seen-b (+ seen-b 1)))
#'user/b-cas1
user=> b-cas1
[1 false]
user=> (def seen-b counter-real)
#'user/seen-b
user=> (def b-cas2 (compare-and-swap counter-real seen-b (+ seen-b 1)))
#'user/b-cas2
user=> b-cas2
[2 true]
user=> (def counter-real (get b-cas2 0))
user=> counter-real
2
```

### Mechanical Walkthrough

`(defn compare-and-swap [current expected new-value] ...)` — `defn`,
reappearing, three arguments: `current`, the shared value as it actually
is right now; `expected`, what the calling thread last saw it to be
(possibly stale); `new-value`, what the caller wants to write.

`(if (= current expected) ...)` — `=`, reappearing, the entire guard:
has anyone changed the shared value since this thread last looked at it?

`[new-value true]` — the "then" branch: nobody else has touched it since
this thread's own last read, so the write is safe — commit `new-value`,
report success.

`[current false]` — the "else" branch: someone else's write landed in
between this thread's read and this attempt — the write is refused, the
real `current` value is handed back unchanged, along with `false`,
telling the caller to look again before trying anything further.

Trace: `counter-real` starts `0`; both threads read it, `seen-a = 0` and
`seen-b = 0` — this is the exact same race Lesson 212 demonstrated, both
threads working from the same stale snapshot. A moves first: `(compare-
and-swap counter-real seen-a (+ seen-a 1))` — `current` is `0`,
`expected` is `0` — they match, so this succeeds, `[1 true]`, and
`counter-real` genuinely becomes `1`. Now B attempts its own increment,
still working from its own stale `seen-b = 0`: `(compare-and-swap
counter-real seen-b (+ seen-b 1))` — `current` is `counter-real`'s real,
current value, `1`; `expected` is B's stale `0`. They don't match —
`(= 1 0)` is `false` — so this correctly refuses, returning `[1 false]`:
B's attempted increment did *not* happen, and the count was not
corrupted. B's own code responds to that `false` by retrying: `(def
seen-b counter-real)` re-reads the actual current value, `1`, replacing
the stale `0`. B's second attempt, `(compare-and-swap counter-real
seen-b (+ seen-b 1))`, now has `current = 1` and `expected = 1` — they
match — succeeds, `[2 true]`. The final `counter-real` is `2` — both
threads' increments landed, nothing lost, because the second thread's
stale read was *caught and rejected* instead of being trusted and
written anyway.

### CS Lens

This is Lesson 212's original lost-update bug, fixed with no lock
anywhere in sight. Compare-and-swap doesn't prevent the race from
happening — both threads still read the same stale value, exactly as
before — it prevents the race from *corrupting anything*, by refusing
any write that's based on information that's gone stale, and handing
that failure back to the caller as an honest, checkable result instead
of silently overwriting real data. This is the foundation of what's
called **lock-free** programming: correctness comes from detecting and
retrying past a lost race, not from preventing threads from racing in
the first place.

Also recognized in: optimistic concurrency control in a database, where
a transaction reads a row's version number, computes its update, and
commits only if the version hasn't changed — retrying from scratch if it
has; a version-controlled file save that refuses to overwrite a file if
its on-disk contents have changed since it was last read, forcing a
merge instead of silently discarding someone else's edit; HTTP's
conditional `PUT` with an `If-Match` header, which the server refuses if
the resource's current version doesn't match what the client last saw.

### SE Lens

The alternative to compare-and-swap-with-retry is exactly Lesson 213's
own lock: wrap the entire read-modify-write sequence in `lock-acquire`/
`lock-release`, guaranteeing no other thread's steps can interleave at
all, at the cost of every other thread being fully blocked, doing
nothing, for the duration. CAS's tradeoff runs the other way: no thread
is ever blocked waiting for another one to finish — a failed attempt
just means "retry, right now, with fresh information" — but the calling
code has to actually be written to retry, and in a system with enough
threads contending for the same value at once, a thread's retries can,
in principle, keep losing the race indefinitely, a real cost a lock
never has (a lock, once acquired, is never *revoked* by a competitor —
the current holder always eventually finishes and releases it). Neither
approach is strictly better; the choice trades "some threads pay with
blocked waiting" against "some threads pay with repeated wasted retries
under very high contention," and real systems reach for CAS specifically
when contention is expected to be low and blocking's own cost — a full
context switch, Lesson 211's own measured overhead — would outweigh an
occasional wasted retry.

---

## Connect the Pieces

Follow a single shared value through all three units, playing out the
worst case each time: start with `locked? = false` (Unit 1). Two
threads' naive check-then-commit sequence, interleaved unsafely, both
read `false` and both commit `true` — both now wrongly believe they hold
the lock, with nothing in the code able to tell them apart. Replace the
same two operations with `test-and-set` (Unit 2): A's call reads the real
old value, `false`, and atomically writes `true`, all in one step with no
gap; B's call, whenever it actually runs, sees the real current value —
`true`, since A's call, being a single indivisible step, has either
fully happened or not at all by the time B's own call begins — and
correctly finds itself refused. Now imagine the shared value isn't a
lock at all, but Lesson 212's original counter, starting at `0`, with
both threads racing to increment it (Unit 3): both read the same stale
`0`, but this time neither commits blindly — each calls `compare-and-
swap`, and whichever one runs second finds its `expected` value no
longer matches `current`, is refused, and retries with the real, fresh
value instead of overwriting it. The exact same race — two threads,
one shared value, a gap where their steps could interleave — gets a
different fix in each unit: naive code lets it corrupt state silently;
`test-and-set` prevents the unsafe ordering from being representable at
all; `compare-and-swap` lets the ordering happen but catches and
corrects for it after the fact.

## What Breaks Without This

Replace `compare-and-swap`'s guard with a version that always succeeds,
regardless of whether `expected` still matches `current`:

```clojure
(defn compare-and-swap-broken [current expected new-value]
  [new-value true])
```

Re-run B's retry scenario from Unit 3 against it, but skip the re-read —
call it with B's original, stale `seen-b = 0` directly against the real
current state of `1`:

```
user=> (compare-and-swap-broken 1 0 1)
[1 true]
```

This reports success and writes `1` — the exact value A already wrote —
discarding A's real increment entirely. The final counter would read
`1`, not `2`, even though two successful-looking increments happened:
Lesson 212's lost update, reproduced through a function whose name
promises exactly the safety it no longer provides. Restoring the `(=
current expected)` check brings the correct refusal, and the correct
retry it forces, back.

## Exercises

1. Run Unit 1's unsafe interleaving with a *third* thread added — C also
   checks before anyone commits. Confirm all three threads believe they
   acquired the lock, and state, in one sentence, whether adding more
   threads makes the underlying bug worse or just more likely to be
   hit.
2. Using `test-and-set`, simulate three threads racing for the same
   lock, in every possible order of their three calls. Confirm exactly
   one of the three ever sees `false` as the old value, no matter which
   order the calls happen in.
3. Extend Unit 3's counter scenario to three threads, all starting from
   `seen = 0`, all racing to increment. Hand-trace how many
   `compare-and-swap` attempts fail and must retry before the final
   count correctly reaches `3`.

## Definition of Done

- [ ] `naive-check`, `naive-commit`, `test-and-set`, `tas-acquired?`, and
      `compare-and-swap` all defined and run in a live `bb` REPL,
      matching every transcript shown above exactly.
- [ ] Unit 1's unsafe and safe interleavings both reproduced, showing the
      exact same two functions producing a bug in one ordering and not
      the other.
- [ ] Unit 2's test-and-set scenario reproduced, confirming exactly one
      of two threads ever sees the old value as `false`.
- [ ] Unit 3's compare-and-swap scenario reproduced end to end, with
      B's first attempt failing, B's retry succeeding, and the final
      counter reaching `2`.
- [ ] Exercise 3 completed and hand-traced.
- [ ] `git commit -m "Add Lesson 217: atomics close the race inside
      lock-acquire itself, and compare-and-swap fixes Lesson 212's
      original lost update without a lock"`
