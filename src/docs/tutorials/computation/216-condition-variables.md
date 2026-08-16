# Lesson 216: Condition Variables — Coordinating Threads Around Predicates

**What you will build**: A bounded buffer (a fixed-capacity queue that can
be neither over-filled nor drained past empty) coordinated with a real
condition-variable model — `wait`, `signal`, and `broadcast` — that
generalizes Lesson 215's semaphore from "wait for exactly one fixed
condition, the count being positive" to "wait for any specific predicate
over shared state." It closes with the single most important, most
commonly-gotten-wrong real fact about condition variables, demonstrated
as a concrete, reproducible bug: waking up is never a guarantee the
condition you were waiting for is still true, and code that forgets to
re-check it after waking corrupts state in a way this lesson can show
happening, on purpose.

**What you need to know first**: Lesson 215's semaphore, permit, and the
non-blocking convention of returning `[new-state succeeded?]` from an
attempt rather than pausing execution. Lesson 214's sentinel-value
convention (`-1` meaning "nothing here"). Lesson 94's vector-append
pattern, `(assoc v (count v) value)`, and Lesson 94/96's `pop`, removing
a vector's last element.

**Terms used in this lesson**:

- **condition variable** — a coordination primitive that lets a thread
  block until an arbitrary predicate over shared state becomes true, and
  lets another thread wake blocked threads once it changes that state;
  exists because a semaphore can only ever wait for one fixed condition
  (its own count being positive), never an arbitrary one.
- **predicate** — a function that answers a true-or-false question about
  the current shared state; this lesson's actual condition a thread is
  waiting for, more general than a semaphore's single built-in count
  check.
- **wait (on a condition variable)** — the operation a thread performs to
  register itself as blocked until the shared state it cares about
  changes; the condition-variable analogue of Lesson 215's
  `sem-acquire`, but carrying no built-in notion of what it's actually
  waiting for.
- **signal / notify** — waking exactly one currently-waiting thread;
  exists for the ordinary case where only one waiter's condition could
  plausibly now be satisfiable.
- **broadcast / notify-all** — waking every currently-waiting thread at
  once; exists for the case where a single change might satisfy more
  than one waiter, or where it isn't known in advance which one, if any,
  it will actually satisfy.
- **spurious wakeup** — being woken from a wait without the condition
  actually still being true by the time the woken thread runs; the
  reason no condition-variable code may ever assume that waking up means
  its condition is guaranteed true.
- **bounded buffer** — a fixed-capacity queue that can be neither
  over-filled nor drained past empty; this lesson's concrete running
  example, standing in for anything a producer and a consumer share.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson — `buffer-not-full?`,
    `buffer-not-empty?`, `produce-checked`, `consume-checked`,
    `cv-wait`, `cv-signal`, `cv-broadcast`, `consume-naive`.
- **`if`**
  - *What it is:* Clojure's two-branch conditional special form.
  - *Implementation:* `(if test then else)` evaluates `test`; returns
    `then` if truthy, `else` otherwise.
  - *Its use:* every checked operation in this lesson decides between a
    success path and a refusal path with one `if`.
- **`<`** / **`>`**
  - *What they are:* Clojure's less-than and greater-than comparison
    functions.
  - *Implementation:* `(< a b)` / `(> a b)` return `true` exactly when
    the numeric comparison holds.
  - *Their use:* `buffer-not-full?` checks `(< filled capacity)`;
    `buffer-not-empty?` checks `(> filled 0)` — the two arbitrary
    predicates this lesson's whole point is built around.
- **`+`** / **`-`**
  - *What they are:* Clojure's addition and subtraction functions.
  - *Implementation:* `(+ a b)` / `(- a b)` return the sum or
    difference.
  - *Their use:* `produce-checked` adds one filled slot on success;
    `consume-checked` and `consume-naive` both subtract one.
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values.
  - *Its use:* `cv-signal` checks whether the waiters vector is empty,
    `(= (count waiters) 0)`.
- **`count`**
  - *What it is:* Clojure's function returning how many elements a
    collection holds.
  - *Implementation:* `(count coll)` returns an integer, the number of
    elements currently in `coll`.
  - *Its use:* both to check whether any thread is waiting, and, with
    `assoc`, to append a new thread onto the end of the waiters vector.
- **`assoc`**
  - *What it is:* Clojure's functional-update function for an indexed or
    keyed collection.
  - *Implementation:* `(assoc coll index value)` returns a new
    collection identical to `coll` except at `index`, which now holds
    `value`.
  - *Its use:* `cv-wait` appends a thread ID onto the waiters vector by
    `assoc`-ing at exactly `(count waiters)` — one past the current last
    index, the established append idiom.
- **`pop`**
  - *What it is:* Clojure's function removing a vector's last element.
  - *Implementation:* `(pop v)` returns a new vector identical to `v`
    but with its final element removed; it never touches the front.
  - *Its use:* `cv-signal` removes whichever thread was added most
    recently from the waiters vector — an honest implementation choice,
    not a claim that real condition variables always wake the
    most-recently-added waiter; real implementations make no order
    guarantee at all.
- **`get`**
  - *What it is:* Clojure's positional lookup function for an indexed
    collection.
  - *Implementation:* `(get coll index)` returns the value at `index`.
  - *Its use:* reading a result back out of a `[new-state result]` pair,
    and reading the last element of the waiters vector before it's
    popped.
- **`def`**
  - *What it is:* Clojure's top-level name-binding form, used here only
    at the REPL to hold example state between steps.
  - *Implementation:* `(def name value)` evaluates `value` once and
    binds `name` to the result.
  - *Its use:* every `user=>` transcript uses `def` to carry buffer and
    waiter state from one call to the next.

---

## Concept Unit: Predicates Over Shared State — Generalizing Beyond ">0"

### The Problem

Lesson 215's semaphore always checks exactly one fixed thing: is the
permit count greater than zero. That's enough for a resource pool, but
plenty of real coordination needs a much more specific condition — "does
this buffer have room for one more item," which depends on both how many
items are in it *and* a separate capacity limit, not just a single
number's sign. A semaphore's own `sem-acquire` has no way to express
that second piece of information at all. Before threads can coordinate
around an arbitrary condition, that condition needs to be a real,
callable thing in its own right — not baked into one fixed comparison the
way `(> permits 0)` is baked into `sem-acquire`.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because condition variables are a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn buffer-not-full? [filled capacity]
  (< filled capacity))

(defn buffer-not-empty? [filled]
  (> filled 0))

(defn produce-checked [filled capacity]
  (if (buffer-not-full? filled capacity)
    [(+ filled 1) true]
    [filled false]))

(defn consume-checked [filled]
  (if (buffer-not-empty? filled)
    [(- filled 1) true]
    [filled false]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (produce-checked 0 2)
[1 true]
user=> (produce-checked 1 2)
[2 true]
user=> (produce-checked 2 2)
[2 false]
user=> (consume-checked 2)
[1 true]
```

### Mechanical Walkthrough

`(defn buffer-not-full? [filled capacity] (< filled capacity))` —
`defn`, reappearing, names a two-argument predicate: `filled`, the
buffer's current occupancy, and `capacity`, its fixed maximum size. `<`,
reappearing, is the actual condition — true exactly when there's still
room for one more item. Two pieces of information, not one, unlike
`sem-acquire`'s single count.

`(defn buffer-not-empty? [filled] (> filled 0))` — a second predicate,
`>` reappearing, true exactly when there's something to take out. Note
this one takes only `filled`, not `capacity` — whether the buffer is
empty has nothing to do with how big it can get.

`(defn produce-checked [filled capacity] ...)` — mirrors Lesson 215's
`sem-release-checked` in shape, but checks `buffer-not-full?`, this
lesson's own predicate, instead of a fixed comparison written inline.
`(if (buffer-not-full? filled capacity) ...)` calls the predicate
function by name — `if`, reappearing, branches on whatever it returns.

`[(+ filled 1) true]` — the "then" branch: `+`, reappearing, one more
item added; paired with `true`, reporting success.

`[filled false]` — the "else" branch: `filled` passed through
unchanged, paired with `false` — the buffer was full, nothing happened.

`(defn consume-checked [filled] ...)` — the mirror operation, checking
`buffer-not-empty?` instead. `(if (buffer-not-empty? filled) ...)`, same
shape.

`[(- filled 1) true]` / `[filled false]` — `-`, reappearing, one fewer
item on success; unchanged state and `false` on failure, exactly
parallel to `produce-checked`.

Trace the transcript: `(produce-checked 0 2)` — `(< 0 2)` is `true` —
succeeds, `[1 true]`. `(produce-checked 1 2)` — `(< 1 2)` is `true` —
succeeds again, `[2 true]`, buffer now full. `(produce-checked 2 2)` —
`(< 2 2)` is `false` — correctly refused, `[2 false]`. `(consume-checked
2)` — `(> 2 0)` is `true` — succeeds, `[1 true]`.

### CS Lens

A semaphore's `sem-acquire` is exactly `produce-checked`/`consume-checked`
with the predicate hard-coded to one specific comparison — this lesson's
own predicates are the same *shape* of check, generalized to be about
whatever the actual shared state is, not just a single count. Naming a
condition as its own callable thing, separate from the code that acts on
it, is the real idea a condition variable is built around.

Also recognized in: a database `WHERE` clause, an arbitrary boolean
expression evaluated against row data rather than one fixed comparison
built into the query engine; a `CHECK` constraint in a schema, enforcing
whatever condition the table's designer wrote, not a fixed built-in
rule; an elevator's dispatch logic waiting for "car available AND going
the right direction," a compound condition no single sensor reading
could express alone.

### SE Lens

The alternative here would be to keep extending `sem-acquire`/
`sem-release` themselves — adding more parameters, more built-in
comparisons, trying to make the semaphore itself flexible enough to
express "is there room" as well as "is there something to take." That
path leads to a function whose signature grows every time a new kind of
condition shows up, and whose own code has to know about every condition
it might ever be asked to check. Separating the predicate out as its own
small function instead means `cv-wait` and `cv-signal`, built next, never
need to know *what* condition a thread is actually waiting for at all —
they only need to know *that* it's waiting. The real cost: this shifts
responsibility for re-checking the condition entirely onto the calling
code, since the waiting mechanism itself has no way to check it
automatically — precisely the gap this lesson's third unit shows going
wrong.

---

## Concept Unit: Waiting and Signaling

### The Problem

`consume-checked` correctly reports failure when the buffer is empty —
but a failed attempt, on its own, doesn't coordinate anything. A
consumer that just tries once and gives up has no way to be told when an
item finally shows up; it would have to keep calling `consume-checked`
over and over on its own, wasting effort every time it happens to check
too early. What's needed is a way for a thread to register "I'm blocked,
waiting for this to become true," and for whichever other thread changes
the state to be able to find and wake exactly the threads that might now
be unblocked.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because condition variables are a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn cv-wait [waiters thread-id]
  (assoc waiters (count waiters) thread-id))

(defn cv-signal [waiters]
  (if (= (count waiters) 0)
    [waiters -1]
    [(pop waiters) (get waiters (- (count waiters) 1))]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def cf0 0)
#'user/cf0
user=> (consume-checked cf0)
[0 false]
user=> (def w1 (cv-wait [] 0))
#'user/w1
user=> w1
[0]
user=> (def pf1 (produce-checked cf0 1))
#'user/pf1
user=> pf1
[1 true]
user=> (def sig1 (cv-signal w1))
#'user/sig1
user=> sig1
[[] 0]
user=> (consume-checked (get pf1 0))
[0 true]
```

### Mechanical Walkthrough

`cf0` starts at `0`, an empty capacity-`1` buffer. `(consume-checked
cf0)` correctly fails, `[0 false]` — nothing to take.

`(defn cv-wait [waiters thread-id] (assoc waiters (count waiters)
thread-id))` — `defn`, reappearing, takes the current waiters vector and
the ID of the thread that's about to block. `count`, reappearing, reads
how many threads are already waiting — that number is exactly the next
free index at the end of the vector. `assoc`, reappearing, places
`thread-id` there, growing the vector by one — the identical
append-at-`(count v)` idiom Lesson 94's heap used to grow an array.

`(cv-wait [] 0)` — thread `0`, having just failed its `consume-checked`
attempt, registers itself as waiting: `[0]`.

`(def pf1 (produce-checked cf0 1))` — reusing Unit 1's function
unchanged: `(< 0 1)` is `true`, so this succeeds, `[1 true]` — one item
now in the buffer.

`(defn cv-signal [waiters] ...)` — `defn`, reappearing. `(if (= (count
waiters) 0) ...)` — `=`, reappearing, checks whether anyone is even
waiting.

`[waiters -1]` — the "then" branch: nobody to wake, waiters passed
through unchanged, `-1` reused as the sentinel for "no thread," the same
value Lesson 214 used for exactly this meaning.

`[(pop waiters) (get waiters (- (count waiters) 1))]` — the "else"
branch: `pop`, reappearing, removes the last thread from the waiters
vector; `get` together with `(- (count waiters) 1)` reads that same last
thread's ID *before* it's removed, so it can be reported as who got
woken. Two separate operations on the same starting vector, one to know
who's leaving and one to actually remove them.

`(cv-signal w1)` — `w1` is `[0]`, one waiter. `(= (count [0]) 0)` is
`false`, so this takes the "else" branch: `(pop [0])` is `[]`, `(get [0]
(- 1 1))` is `(get [0] 0)`, which is `0` — the result, `[[] 0]`, says
"no one is waiting anymore, and the thread that was woken is `0`."

`(consume-checked (get pf1 0))` — thread `0`, now woken, does exactly
what Unit 1 already established every consumer must do: call
`consume-checked` again, for real, rather than assuming the wakeup alone
means it's safe to proceed. `(get pf1 0)` reads the buffer's actual
current state, `1`; `(> 1 0)` is `true`, so it succeeds, `[0 true]` —
the item thread `0` was waiting for is now correctly consumed.

### CS Lens

`cv-wait` and `cv-signal` are structurally the mirror image of
`request-resource`/`release-resource` from Lesson 214: one function
records "something is blocked," the other resolves exactly one blocked
thing. The difference is what they're blocked *on* — Lesson 214's
threads waited for a specific resource to become free; this lesson's
threads wait for an arbitrary predicate over shared state to become
true. Waiting-as-data, not waiting-as-paused-control-flow, is the same
design choice made again for a more general problem.

Also recognized in: a restaurant's waitlist, called by name in the order
seats free up; a `Promise` chain's `.then` callbacks, each one only
running once its specific upstream value actually resolves; a job
scheduler holding a queue of tasks blocked on a dependency, released one
at a time as each dependency finishes.

### SE Lens

The alternative to `cv-wait`/`cv-signal` is the loop this unit's own
Problem section named: a consumer just calling `consume-checked`
repeatedly, over and over, until it happens to succeed — commonly called
"busy waiting" or "spinning." That approach needs no coordination
machinery at all, but it burns real CPU time on every failed check,
proportional to how long the wait lasts, and every one of those checks
that finds nothing is pure waste. `cv-wait`/`cv-signal` costs more
machinery — a waiters vector, a signaling call some other thread has to
remember to make — but a waiting thread does no work at all until it's
specifically told something changed. The debt this project is carrying:
`cv-signal` only fires because `produce-checked`'s caller remembers to
call it right afterward — nothing here connects the two automatically,
so a producer that forgets to signal leaves a correctly-waiting consumer
stuck forever, even though the item it wanted is sitting right there.

---

## Concept Unit: Broadcast and the Re-Check Requirement

### The Problem

`cv-signal` wakes exactly one waiting thread — correct when only one
waiter could possibly benefit from what just changed. But sometimes a
single change could satisfy more than one waiter at once, or it isn't
known in advance which waiter, if any, it will actually satisfy — waking
only one in that situation risks leaving some other waiter correctly
unblockable but never even checked. What happens when every waiter is
woken at once instead, and does each one actually get what it was
promised?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because condition variables are a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn cv-broadcast [waiters]
  [[] waiters])

(defn consume-naive [filled]
  (- filled 1))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def bw0 (cv-wait (cv-wait [] 0) 1))
#'user/bw0
user=> bw0
[0 1]
user=> (def bf1 (produce-checked 0 2))
#'user/bf1
user=> bf1
[1 true]
user=> (def bcast (cv-broadcast bw0))
#'user/bcast
user=> bcast
[[] [0 1]]
```

Naive consumers, no re-check:

```
user=> (def naive-t0 (consume-naive (get bf1 0)))
#'user/naive-t0
user=> naive-t0
0
user=> (def naive-t1 (consume-naive naive-t0))
#'user/naive-t1
user=> naive-t1
-1
```

Checked consumers, re-checking the predicate:

```
user=> (def checked-t0 (consume-checked (get bf1 0)))
#'user/checked-t0
user=> checked-t0
[0 true]
user=> (def checked-t1 (consume-checked (get checked-t0 0)))
#'user/checked-t1
user=> checked-t1
[0 false]
user=> (cv-wait [] 1)
[1]
```

### Mechanical Walkthrough

`bw0` is built from two `cv-wait` calls nested inside each other —
thread `0` registers first, then thread `1` registers on top of the
result — producing `[0 1]`, both waiting on an empty buffer.
`(produce-checked 0 2)` succeeds, `[1 true]`: one item now exists, but
the buffer's real capacity is `2`, and there's still only *one* item to
give out, not two.

`(defn cv-broadcast [waiters] [[] waiters])` — `defn`, reappearing. The
body is a two-element vector: the first slot is a bare empty vector
literal `[]`, the new (empty) waiters list, since broadcasting clears
everyone out at once; the second slot is `waiters` itself, unchanged,
now repurposed as the *list of everyone who was just woken*, rather than
the list of who's still waiting.

`(cv-broadcast bw0)` — `bw0` is `[0 1]`; the result is `[[] [0 1]]` —
nobody left waiting, both thread `0` and thread `1` reported as woken at
once. Contrast this directly with `cv-signal`, from Unit 2, which only
ever reports one thread ID in its second slot, never a whole list.

`(defn consume-naive [filled] (- filled 1))` — `defn`, reappearing;
`-`, reappearing. No `if`, no call to `buffer-not-empty?` at all — this
function does exactly what a consumer might wrongly assume is safe once
it's been woken: "I was told to wake up because an item is available, so
I'll just take one," with no check that the item is *actually still
there* by the time it runs.

Trace the naive path: `(consume-naive (get bf1 0))` reads the buffer's
real state, `1`, and blindly subtracts one, producing `0` — this is
thread `0`'s consume, and it's correct by coincidence, since an item
genuinely was there. But `(consume-naive naive-t0)` — thread `1`,
woken by the exact same broadcast, running the exact same unchecked
logic — subtracts one *again*, from `0` this time, producing `-1`. The
buffer's own state now claims negative one items are in it, a value with
no correct real-world meaning at all — the exact shape of corruption
Lesson 215's over-release bug produced, but caused here by a *consumer*
trusting a wakeup instead of a *producer* miscounting releases.

Trace the checked path against the identical broadcast: `(consume-checked
(get bf1 0))` — thread `0`, checking first — `(> 1 0)` is `true`,
succeeds, `[0 true]`, correctly taking the one real item. `(consume-checked
(get checked-t0 0))` — thread `1`, checking the buffer's *actual current*
state instead of assuming the broadcast promised it something — `(> 0
0)` is `false` — correctly refused, `[0 false]`. Thread `1` didn't get
an item, because there genuinely wasn't a second one, and the checked
version caught that instead of hallucinating it. `(cv-wait [] 1)` shows
thread `1`'s correct next move: go back to waiting, `[1]`, rather than
having corrupted anything.

### CS Lens

This is the **spurious wakeup**, made concrete: thread `1` really was
woken — `cv-broadcast` genuinely reported it as one of the threads told
to check again — and the condition it was waiting for really was true
*for somebody*, just not for both waiters at once. Being woken is only
ever a signal to go re-check, never a promise the condition still holds
*for you specifically* by the time your code actually runs. This is why
real condition-variable APIs are used with a loop or an explicit re-check
around the wait, never a bare "if woken, proceed."

Also recognized in: two people racing for the last parking spot after
both see the same "spot open" notification, where only one of them
actually gets it and the other has to notice and go find another; a
distributed cache invalidation broadcast telling every node "this key
might have changed," where each node still has to re-fetch and check for
itself rather than assuming its own copy is now automatically correct; a
fire alarm, which tells everyone in the building to check whether it's
safe to stay, not that it's already been confirmed safe or unsafe for
each specific person.

### SE Lens

The alternative to `consume-checked`'s re-check is trusting the wakeup
outright — exactly what `consume-naive` does — and it's tempting
specifically because it's simpler and, as thread `0`'s own trace shows,
it's *often* correct: most of the time, especially with `cv-signal`
waking only one thread, the condition really is still true when the
woken thread runs. The tradeoff is that "usually correct" is exactly the
shape of bug that survives testing and then fails in production under
real concurrent load, once broadcast wakes more than one waiter, or once
some other thread races in and consumes the item first. The fix costs
almost nothing — one extra predicate call, already written and already
named, per Unit 1 — which is exactly why the standard, load-bearing rule
in real condition-variable code is to never trust a wakeup on its own:
always re-check the actual condition, in a loop if necessary, every
single time control returns from a wait.

---

## Connect the Pieces

Follow the buffer's `filled` count through every piece built in this
lesson, in the broadcast scenario: two consumers, threads `0` and `1`,
both find an empty buffer via `consume-checked` (Unit 1), both correctly
fail, and both register themselves with `cv-wait` (Unit 2), producing
`bw0 = [0 1]`. A producer calls `produce-checked`, `buffer-not-full?`
returns `true`, and the buffer gains its one real item (Unit 1 again,
reused). The producer then calls `cv-broadcast` instead of `cv-signal`
(Unit 3) — a legitimate choice when it doesn't know which waiter, if
any, can actually be satisfied — clearing the waiters list and reporting
both threads `0` and `1` as woken. From here, the entire lesson's real
point turns on what each woken thread does next: `consume-naive` (Unit
3) trusts the wakeup outright and corrupts `filled` to `-1`, a value
this simulation can produce but that describes nothing real; the paired
`consume-checked` calls (Unit 1, reused one more time) instead re-ask
`buffer-not-empty?` fresh, for real, letting thread `0` correctly take
the one item and thread `1` correctly find nothing and return to
`cv-wait` (Unit 2, reused) instead of corrupting anything. Every function
built across all three units touches this one trace — the predicates
from Unit 1, the wait/signal bookkeeping from Unit 2, and the broadcast
that makes Unit 3's whole hazard possible in the first place.

## What Breaks Without This

Replace every checked consumer in the broadcast scenario with the naive
version, as the trace above already showed directly:

```
user=> (consume-naive (get bf1 0))
0
user=> (consume-naive 0)
-1
```

`filled` ends at `-1` — a buffer claiming to hold a negative number of
items, which can't happen in reality and corresponds to no correct state
the real system this buffer represents could ever actually be in. Nothing
crashes; the value is simply wrong, and any code trusting it afterward
(a display showing "buffer: -1 items," a later `produce-checked` call
comparing against it) inherits the corruption silently. Restoring the
`buffer-not-empty?` re-check inside `consume-checked` brings the correct
`[0 false]` refusal back for the second thread.

## Exercises

1. Build a capacity-`3` buffer with two producers and one consumer, all
   three initially blocked (the producers waiting because it starts
   full, the consumer waiting because — construct a case where all three
   are genuinely blocked at once, and hand-trace which predicate each
   one is actually waiting on).
2. Using `cv-signal` instead of `cv-broadcast`, reproduce this lesson's
   Unit 3 scenario (two waiting consumers, one item produced) and
   confirm only one thread is ever woken — showing that the specific bug
   this lesson demonstrated is unique to broadcast, not signal.
3. Write a `cv-wait-and-retry`-style trace (as prose steps, not a new
   function) for a consumer that keeps calling `consume-checked`,
   re-`cv-wait`-ing on every failure, until it finally succeeds — and
   explain in one sentence why this loop, not a single re-check, is
   what real condition-variable code actually needs to be correct
   against an arbitrary number of competing waiters.

## Definition of Done

- [ ] `buffer-not-full?`, `buffer-not-empty?`, `produce-checked`,
      `consume-checked`, `cv-wait`, `cv-signal`, `cv-broadcast`, and
      `consume-naive` all defined and run in a live `bb` REPL, matching
      every transcript shown above exactly.
- [ ] The Unit 2 wait-then-signal scenario reproduced: a failed consume,
      a registered wait, a successful produce, a signal, and a
      successful re-check.
- [ ] The Unit 3 broadcast scenario reproduced with both the naive
      corruption (`filled` reaching `-1`) and the checked correction
      (the second consumer correctly refused and returned to waiting).
- [ ] Exercise 2 completed, confirming `cv-signal` alone doesn't
      reproduce Unit 3's bug.
- [ ] `git commit -m "Add Lesson 216: condition variables generalize
      semaphores to arbitrary predicates, and demonstrate why a wakeup
      must always be re-checked"`
