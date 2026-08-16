# Lesson 215: Semaphores — Counting-Based Synchronization

**What you will build**: A counting semaphore — a generalization of
Lesson 213's lock from "one holder or none" to "up to N holders at
once" — with real `acquire`/`release` functions, a demonstration of the
resource-pool-exhaustion case a plain lock can't represent, a real bug
(releasing more times than was ever acquired) and its fix, and a second,
genuinely different use of the identical code: a semaphore starting at
zero, used to signal a one-time event from one piece of code to another
rather than to guard a pool of resources at all.

**What you need to know first**: Lesson 213's lock, mutual exclusion, and
acquire/release (a single held/free bit, changed only by those two
calls). Lesson 214's non-blocking convention for modeling waiting as
data — an acquire attempt returns immediately with a success/failure
result rather than pausing execution, so the caller's own code stays in
control of what happens next.

**Terms used in this lesson**:

- **semaphore** — a piece of state holding an integer count of available
  permits, generalizing a lock's single free/held bit to "how many are
  currently available"; exists because many real resources come in
  interchangeable pools bigger than one.
- **permit** — one unit of availability a semaphore's count represents;
  not tied to any specific physical resource by the semaphore itself —
  only by whatever convention the calling code agrees on.
- **counting semaphore** — a semaphore whose maximum permit count is
  greater than one; the general case this lesson builds first.
- **binary semaphore** — a semaphore whose maximum permit count is
  exactly one; behaves the same way as Lesson 213's lock, a specific case
  of the general one.
- **invariant** — a fact that's supposed to remain true across every
  legitimate state change a piece of code can make; exists as the
  standard a semaphore's count is judged against — this lesson finds it's
  only actually enforced on one side.
- **over-release** — calling a semaphore's release operation more times
  than there were matching, successful acquires; a real bug class, not a
  hypothetical one, because nothing about a release call's own arguments
  reveals whether an acquire actually preceded it.
- **signaling semaphore** — a semaphore used to represent whether a
  specific one-time event has happened yet, not how many interchangeable
  resources remain; the same code as a counting semaphore, distinguished
  only by its starting value and how the calling code treats it.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, and binds `name` to the
    resulting function.
  - *Its use:* `sem-acquire`, `sem-release`, and `sem-release-checked` are
    each defined this way.
- **`if`**
  - *What it is:* Clojure's two-branch conditional special form.
  - *Implementation:* `(if test then else)` evaluates `test`; if truthy,
    evaluates and returns `then`, otherwise evaluates and returns `else`.
  - *Its use:* every one of this lesson's functions decides between a
    success path and a refusal path with exactly one `if`.
- **`>`**
  - *What it is:* Clojure's greater-than comparison function.
  - *Implementation:* `(> a b)` returns `true` if `a` is strictly greater
    than `b`.
  - *Its use:* `sem-acquire` checks `(> permits 0)` — is there anything
    left to hand out.
- **`<`**
  - *What it is:* Clojure's less-than comparison function.
  - *Implementation:* `(< a b)` returns `true` if `a` is strictly less
    than `b`.
  - *Its use:* `sem-release-checked` checks `(< permits max-permits)` —
    is there still room below the pool's real ceiling.
- **`+`**
  - *What it is:* Clojure's addition function.
  - *Implementation:* `(+ a b)` returns the sum of `a` and `b`.
  - *Its use:* every legitimate release increments the permit count by
    one.
- **`-`**
  - *What it is:* Clojure's subtraction function.
  - *Implementation:* `(- a b)` returns `a` minus `b`.
  - *Its use:* every successful acquire decrements the permit count by
    one.
- **`get`**
  - *What it is:* Clojure's positional lookup function for an indexed
    collection.
  - *Implementation:* `(get coll index)` returns the value at `index` in
    `coll`.
  - *Its use:* reading the new permit count back out of the two-element
    `[new-permits succeeded?]` pair `sem-acquire` and
    `sem-release-checked` each return.
- **`def`**
  - *What it is:* Clojure's top-level name-binding form, used here only
    at the REPL to hold example state between steps.
  - *Implementation:* `(def name value)` evaluates `value` once and binds
    `name` to the result in the current namespace.
  - *Its use:* every `user=>` transcript in this lesson uses `def` to
    carry a semaphore's count from one call to the next, purely for
    readability at the REPL — never inside a real function body.

---

## Concept Unit: The Counting Semaphore — Generalizing Mutual Exclusion to N

### The Problem

Lesson 214 modeled a resource whose identity mattered — `held-by`
tracked exactly which thread held exactly which resource. But plenty of
real resources come as an interchangeable pool: three identical database
connections, four identical printer-queue slots. What matters there
isn't "who has which specific one" — any free unit serves any thread
equally well — it's only "how many are left." Lesson 213's lock
represents exactly one bit of information, free or held. There's no way
to stretch a single bit into "how many of three connections remain."
Before a resource pool of size N can be represented at all, `acquire` and
`release` need to generalize from a boolean to a count.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because semaphores are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn sem-acquire [permits]
  (if (> permits 0)
    [(- permits 1) true]
    [permits false]))

(defn sem-release [permits]
  (+ permits 1))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def p0 2)
#'user/p0
user=> (def r1 (sem-acquire p0))
#'user/r1
user=> r1
[1 true]
user=> (def r2 (sem-acquire (get r1 0)))
#'user/r2
user=> r2
[0 true]
user=> (def r3 (sem-acquire (get r2 0)))
#'user/r3
user=> r3
[0 false]
user=> (def p1 (sem-release (get r2 0)))
#'user/p1
user=> p1
1
user=> (sem-acquire p1)
[0 true]
```

### Mechanical Walkthrough

`(defn sem-acquire [permits] ...)` — `defn`, reappearing, names a
function of one argument: the semaphore's current permit count.

`(if (> permits 0) ...)` — `if`, reappearing, branches on `>`,
reappearing: is there at least one permit currently available.

`[(- permits 1) true]` — the "then" branch, a two-element vector
following the same vector-as-pair convention Lesson 214's
`request-resource` used: slot `0` is the new state (`-`, reappearing,
one fewer permit than before), slot `1` is a plain boolean reporting
that the acquire succeeded.

`[permits false]` — the "else" branch: the count passes through
completely unchanged — `permits`, read bare, with nothing subtracted —
paired with `false`, reporting the acquire failed. Nothing here pauses or
retries; exactly like Lesson 214's `request-resource`, the caller gets an
immediate, honest answer and decides for itself what to do next.

`(defn sem-release [permits] (+ permits 1))` — a second, smaller
function: `+`, reappearing, adds one permit back. Unlike `sem-acquire`,
this one has no `if` at all — nothing checks anything before
incrementing, a fact this lesson's second unit comes back to directly.

Trace `p0` through the transcript: `p0` starts at `2`. `r1`, the first
acquire, succeeds (`1 > 0` is `true`) and returns `[1 true]` — one permit
now gone, one thread admitted. `r2`, reading the new count out of `r1`
with `(get r1 0)`, also succeeds, returning `[0 true]` — the pool is now
fully checked out. `r3` attempts a third acquire against `0` permits;
`(> 0 0)` is `false`, so it takes the "else" branch and returns `[0
false]` — the third thread is correctly refused, with the count
unchanged at `0`. `sem-release`, called once, brings the count back to
`1`; a fourth acquire attempt against that `1` succeeds.

### CS Lens

A semaphore with `max-permits` fixed at `1` behaves exactly like Lesson
213's lock — the general N-holder case collapses to the exact single-bit
case already built, a direct generalization rather than a different
mechanism. This lesson's own third unit comes back to that specific case
by name.

Also recognized in: a parking garage's electronic sign switching to
"FULL" once every numbered spot is taken and back to a real count as cars
leave; a restaurant's table-limit queueing system; a thread pool's fixed
worker cap; a TCP connection's flow-control window, a count of
"credits" the receiver has granted the sender before it must pause.

### SE Lens

The alternative to a plain integer count is Lesson 214's own model — a
vector naming exactly which thread holds which specific unit. That works
here too, but it costs more state (an entry per unit, not just a number)
and more bookkeeping, for a benefit — knowing *which* unit a thread has —
that only matters when the units genuinely differ from each other. A
plain count is cheaper and just as correct exactly when the resources
really are interchangeable, which is the whole premise a counting
semaphore is built on. The cost of that cheapness: a plain count, on its
own, can never answer "which specific unit did thread `2` get back?" if a
later step ever needed to know — this lesson's model deliberately doesn't
need that question answered, because releasing never requires naming
which unit is being given back, only that one is.

---

## Concept Unit: The Semaphore Invariant and Over-Release

### The Problem

`sem-acquire` refuses to hand out a permit it doesn't have — its own
`if` guarantees the count can never go below zero. But nothing anywhere
stops `sem-release` from being called more times than there were
matching, successful acquires. What does the count actually mean after
that happens, and does the semaphore still correctly represent the real
resource pool it's supposed to stand in for?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because semaphores are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn sem-release-checked [permits max-permits]
  (if (< permits max-permits)
    [(+ permits 1) true]
    [permits false]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

First, reproduce the failure using only Unit 1's own `sem-release`, with
a pool whose real size is `2`:

```
user=> (def q0 0)
#'user/q0
user=> (def q1 (sem-release q0))
#'user/q1
user=> q1
1
user=> (def q2 (sem-release q1))
#'user/q2
user=> q2
2
```

So far this is legitimate — two permits were checked out earlier, and
these are their two matching releases, correctly bringing the count back
to the pool's real size, `2`. Now watch a third release happen, with no
third acquire anywhere to match it:

```
user=> (def q3 (sem-release q2))
#'user/q3
user=> q3
3
user=> (sem-acquire q3)
[2 true]
```

Compare `sem-release-checked`, called on the correctly-full state instead
of the corrupted one, attempting the exact same unmatched release:

```
user=> (sem-release-checked 2 2)
[2 false]
```

### Mechanical Walkthrough

The bug trace first: `q0` starts at `0` (both of the pool's two permits
already checked out). `q1` and `q2` are two legitimate releases,
correctly bringing the count to `1` then `2` — matching two real prior
acquires. `q3` is a *third* release, called with nothing behind it —
no thread actually holding a third permit gave anything back — and
`sem-release`'s own code, `(+ permits 1)`, has no way to know that;
it just adds one, producing `3`. The semaphore's own count now claims
three permits are available, when the resource pool it represents only
ever had two real units. `(sem-acquire q3)` proves this isn't just a
cosmetic wrong number: `(> 3 0)` is `true`, so a *third* concurrent
acquire succeeds, handing out a permit that doesn't correspond to any
real resource at all.

`(defn sem-release-checked [permits max-permits] ...)` — takes a second
argument, `max-permits`, the pool's real declared size — something
`sem-release` never had any way to know, since a plain integer count
carries no memory of its own ceiling.

`(if (< permits max-permits) ...)` — `<`, reappearing, checks whether
there's still room below that ceiling before allowing the increment at
all.

`[(+ permits 1) true]` — the "then" branch: a legitimate release, `+`
reappearing, count grows by one, reports success.

`[permits false]` — the "else" branch: the count passes through
completely unchanged, and the release is refused outright — reported as
a failure, not silently absorbed the way `sem-release` absorbed `q3`'s
extra call.

`(sem-release-checked 2 2)` — called on the correctly-full state, `2`
out of a max of `2`: `(< 2 2)` is `false`, so this takes the "else"
branch and returns `[2 false]` — the same unmatched release attempt that
silently corrupted `q3` above is caught and rejected here instead.

### CS Lens

A semaphore's real invariant is `0 <= permits <= max-permits`, at every
point in its lifetime. `sem-acquire`'s own `if` enforces the lower bound;
nothing in Unit 1 enforced the upper one — a one-sided enforcement that's
easy to miss precisely because its symptom, an inflated count, doesn't
crash anything on its own. It only produces a wrong answer, later, to
whoever asks "is there room."

Also recognized in: an inventory system whose stock count is checked
against going negative but never checked against exceeding true
warehouse capacity, so a missed count in the other direction quietly
overstates what's on the shelf; a rate limiter's token bucket that keeps
refilling past its own stated cap because the refill logic only checks
for running out, never for topping off past the ceiling; a bank account
with an enforced floor of zero but no matching enforced ceiling on a
promotional credit that was only ever supposed to be grantable once.

### SE Lens

The alternative to `sem-release-checked` is leaving `sem-release` exactly
as Unit 1 built it, on the theory that correct calling code will always
call `release` exactly once per successful `acquire` and never more —
and this is a real, deliberate choice some production semaphore
implementations actually make, because checking costs an extra argument
and an extra branch on a function expected to be called very often,
guarding against a caller mistake that, if the calling code is actually
correct, never happens. The tradeoff is real in both directions: the
unchecked version is cheaper and simpler, but it turns a caller's bug
into silent state corruption instead of an observable failure at the
exact call site where the mistake was made. The debt this project is
carrying, honestly: nothing forces a caller to reach for
`sem-release-checked` instead of the cheaper, unsafe `sem-release` — both
are still callable, side by side, and the faster one is also the more
convenient one to reach for, which is exactly why this bug class survives
in real systems.

---

## Concept Unit: Semaphores as Signals, Not Just Mutexes

### The Problem

Every use of `sem-acquire`/`sem-release` so far has treated a semaphore
as protecting a pool of resources that already exist — the count started
at some number greater than zero, representing real units available from
the very first call. But nothing about either function's own code
requires that framing. They just move an integer up and down inside a
bounded range. What happens if a semaphore starts at `0` — not "the pool
is currently empty," but "the thing this represents hasn't happened
yet at all"?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because semaphores are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(def signal0 0)
(sem-acquire signal0)
```

No new function — Unit 1's `sem-acquire` and `sem-release` are reused
completely unchanged. What's new is only the starting value and how the
result gets used.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def signal0 0)
#'user/signal0
user=> (sem-acquire signal0)
[0 false]
user=> (def signal1 (sem-release signal0))
#'user/signal1
user=> signal1
1
user=> (sem-acquire signal1)
[0 true]
```

### Mechanical Walkthrough

`(def signal0 0)` — `def`, reappearing, binds `signal0` to `0`: a
semaphore that starts completely empty, not full, representing "this
event has not happened yet," not "this resource pool is temporarily
exhausted."

`(sem-acquire signal0)` — the same function from Unit 1, called with no
changes at all: `(> 0 0)` is `false`, so it takes the "else" branch and
returns `[0 false]`. Read as a resource pool, this would mean "no units
left right now, try later." Read as a signal, it means something more
specific: "the event hasn't happened yet" — a consumer checking in before
anything has occurred.

`(sem-release signal0)` — also unchanged from Unit 1, but now called
from a producer's side, at the exact moment the event actually occurs.
The count goes from `0` to `1`. That `1` doesn't mean "one unit freed
up" the way it did in Unit 1 — it means "one occurrence of the event is
now available to be claimed."

`(sem-acquire signal1)` — the consumer's retry, now succeeding,
returning `[0 true]`: it has consumed exactly the one signal that was
posted, and the count correctly drops back to `0` — not because a
resource was checked out, but because the one event that had occurred
has now been observed.

### CS Lens

This is the **signaling semaphore**, distinguished from the
**resource-counting semaphore** of Units 1 and 2 by nothing in the code
itself — only by starting value (`0` instead of some real pool size) and
by which side calls which operation (a producer releases when something
*happens*; a consumer acquires when it wants to *observe* that it
happened). The same primitive doing two conceptually distinct jobs is
worth recognizing on sight, not just in this one case.

Also recognized in: a `wait`/`notify` pattern from classic operating
systems textbooks; a CI pipeline's "build artifact ready" flag that a
downstream deploy job blocks on before it can start; a `Promise` or
`Future`'s resolution acting as a one-time signal from producing code to
consuming code; a doorbell that is either "not yet pressed" or "pressed,
waiting to be answered."

### SE Lens

The alternative is building a separate, differently-named primitive for
signaling instead of reusing the counting semaphore for it — and real
systems sometimes do exactly that (Windows exposes event objects and
semaphore objects as genuinely different types), specifically because
conflating the two invites a real confusion this unit's own model hasn't
solved: a signaling semaphore is usually meant for exactly one consumer
to see exactly one signal exactly once, but nothing about
`sem-acquire`/`sem-release` enforces that. A *second* consumer calling
`sem-acquire` after the first one already consumed the signal just sees
`[0 false]` again — silently identical to "the event hasn't happened at
all yet." A semaphore can express "wait until this count is positive,"
but it has no idea what a caller actually wants to be true about the
world once it wakes up. Waiting for one specific, arbitrary condition —
not just "is this number greater than zero" — is a different problem
from anything built in this lesson, and it's exactly what Lesson 216
(Condition Variables) takes on next.

---

## Connect the Pieces

Follow one semaphore's permit count through all three units, as if it
were the exact same pool the whole way: start it at `p0 = 2` (Unit 1),
representing two real database connections. Two threads acquire both —
`r1` then `r2` — bringing the count to `0`, correctly refusing a third
attempt (`r3`, `[0 false]`). Now imagine a bug: a third release fires
somewhere, with no matching acquire behind it — exactly Unit 2's `q3`
scenario — and the count is silently corrupted to `3`, a value with no
correct resource behind it, letting a phantom third `sem-acquire` succeed
where it should have failed. Had every release in this system gone
through `sem-release-checked` instead of the plain `sem-release` from the
start, that exact same erroneous third call would have been checked
against `max-permits = 2`, found no room, and returned `[2 false]` —
caught at the exact moment of the mistake instead of corrupting state
silently. And if this same pair of functions, `sem-acquire` and
`sem-release`, had instead been handed a semaphore starting at `0` rather
than `2` — Unit 3's reading — none of this would be about a resource pool
at all: it would be one piece of code waiting to find out whether another
piece of code has done something yet, using the identical two functions
for a completely different purpose.

## What Breaks Without This

Remove the `(> permits 0)` check from `sem-acquire` entirely, letting
every acquire attempt succeed regardless of the count:

```clojure
(defn sem-acquire-broken [permits]
  [(- permits 1) true])
```

```
user=> (sem-acquire-broken 0)
[-1 true]
```

Called on an already-empty semaphore, this reports success and produces
a *negative* permit count — a claim that `-1` resources are available,
which is meaningless for any real pool, and a `true` telling a fourth
thread it has been granted a resource that was never there in the first
place. Nothing crashes; the caller has no way to distinguish this from a
legitimate acquire. Restoring the `(> permits 0)` guard brings the
correct `[0 false]` back.

## Exercises

1. Build a `3`-permit pool. Acquire four times in a row and confirm the
   fourth fails. Release once and confirm a fifth attempt now succeeds.
2. Rebuild Unit 2's exact over-release scenario, but route every single
   release through `sem-release-checked` from the very first call
   instead of the plain `sem-release`. Confirm the permit count never
   exceeds `max-permits`, no matter how many extra release attempts are
   made.
3. Build a "two signals" scenario: a producer calls `sem-release` twice
   before any consumer calls `sem-acquire` at all, representing two
   occurrences of an event that happened before anyone was watching.
   Confirm two separate `sem-acquire` calls both succeed afterward — one
   per posted signal — and a third fails.

## Definition of Done

- [ ] `sem-acquire`, `sem-release`, and `sem-release-checked` all defined
      and run in a live `bb` REPL, matching every transcript shown above
      exactly.
- [ ] The `2`-permit pool scenario reproduced: two successful acquires,
      one correctly refused third, one release restoring availability.
- [ ] The over-release bug reproduced with the plain `sem-release`, and
      the same scenario shown correctly rejected by
      `sem-release-checked`.
- [ ] The `0`-start signaling scenario reproduced: a failed acquire
      before the signal, a successful one after.
- [ ] Exercise 1 completed and hand-traced.
- [ ] `git commit -m "Add Lesson 215: semaphores as counting-based
      synchronization, the over-release bug, and the signaling use"`
