# Lesson 214: Deadlocks — Deriving the Four Necessary Conditions

**What you will build**: A small simulation of multiple threads competing
for multiple resources — extending Lesson 213's single-lock
acquire/release model out to many locks and many threads at once — plus a
real detector that finds a deadlock by tracing who is waiting on whom.
Along the way, this lesson derives, from the actual running code rather
than from a memorized list, the four conditions that every deadlock — in
this simulation or in a real operating system — must satisfy
simultaneously: mutual exclusion, hold-and-wait, no preemption, and
circular wait. It closes by showing a real, standard fix (lock ordering)
that works specifically because it breaks exactly one of those four
conditions, and no more than that one.

**What you need to know first**: Lesson 213's lock, mutual exclusion, and
acquire/release (a resource belongs to at most one thread at a time, and
only ever changes hands through those two explicit calls). Lesson 123's
graph representation (nodes, edges, an array-indexed structure for O(1)
lookup instead of scanning). Lesson 126's idea of tracing a path through a
graph to check whether it loops back on itself.

**Terms used in this lesson**:

- **lock** — a piece of state that grants at most one thread permission to
  proceed into a critical section at a time; exists to make an unsafe
  shared resource safe to touch from multiple threads.
- **mutual exclusion** — the guarantee a lock provides: only one thread
  may hold it at a time; exists because a shared resource touched by more
  than one thread at once produces a lost update.
- **acquire** — the operation that claims a lock, succeeding only when the
  lock is free; exists as the one legitimate way to gain permission to use
  a shared resource.
- **release** — the operation that gives a lock back, making it available
  to some other waiting thread; exists as the one legitimate way to give
  up permission once a thread is done.
- **deadlock** — a state where two or more threads are each waiting for a
  resource that another one of them is holding, and none of them can ever
  proceed, because progress for any one of them depends on a resource
  release that will never happen; exists as the name for the specific
  failure this whole lesson derives, piece by piece.
- **resource** — anything a thread needs exclusive access to before it can
  proceed: a lock, a file handle, a device, memory. This lesson uses
  "resource" for what Lesson 213 called a "lock," because a deadlock can
  happen over any of these, not only mutexes specifically.
- **hold-and-wait** — a thread simultaneously holding at least one
  resource while blocked waiting to acquire another; one of the four
  conditions a deadlock requires, because a thread that never holds
  anything while it waits can't be part of a cycle of mutual blocking.
- **no preemption** — the property that a resource can only be given up
  voluntarily by the thread holding it, never forcibly taken away by the
  system or another thread; one of the four conditions, because if a
  stuck thread's resource could just be seized, the deadlock would
  resolve itself.
- **circular wait** — a chain of threads T1, T2, ..., Tn where T1 waits on
  a resource held by T2, T2 waits on a resource held by T3, and so on,
  until Tn waits on a resource held by T1 — a closed loop with no way
  out; the fourth condition, and the one this lesson builds a real
  detector for.
- **wait-for graph** — a graph where each node is a thread and an edge
  from Ti to Tj means "Ti is currently blocked waiting for a resource that
  Tj currently holds"; exists because a deadlock is exactly a cycle in
  this graph, which turns "is there a deadlock" into a question this
  lesson already knows how to answer mechanically: does a path through
  this graph return to where it started.
- **sentinel value** — a value from the same type as the data it lives
  inside, reserved to mean "nothing here," so a lookup never has to
  special-case a missing entry; this lesson uses `-1` for "this resource
  is free" and "this thread isn't waiting on anything," since thread and
  resource IDs are themselves non-negative integers and `-1` can never
  collide with a real one.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body` with
    `params` bound to whatever arguments are passed, and binds `name` to
    the resulting function in the current namespace.
  - *Its use:* every real function in this lesson — `acquire-resource`,
    `request-wait`, `request-resource`, `release-resource`,
    `wait-for-edge`, `deadlocked-from` — is defined this way.
- **`get`**
  - *What it is:* Clojure's positional lookup function for an indexed
    collection.
  - *Implementation:* `(get coll index)` returns the value at `index` in
    `coll`; for a vector, this is direct array-style indexing, not a
    scan.
  - *Its use:* every read of `held-by` or `waiting-for` in this lesson —
    "what does resource `r` currently hold" or "what is thread `t`
    waiting on" — is a `get` call.
- **`assoc`**
  - *What it is:* Clojure's functional-update function for an indexed or
    keyed collection.
  - *Implementation:* `(assoc coll index value)` returns a *new*
    collection, identical to `coll` except at `index`, which now holds
    `value` — the original `coll` is untouched.
  - *Its use:* every state change in this lesson — a resource becoming
    held, a thread starting to wait, a resource being freed — is an
    `assoc` producing a new vector rather than mutating one in place,
    since this curriculum has never had a mutation construct to write
    with.
- **`if`**
  - *What it is:* Clojure's two-branch conditional special form.
  - *Implementation:* `(if test then else)` evaluates `test`; if it's
    truthy, evaluates and returns `then`, otherwise evaluates and returns
    `else`.
  - *Its use:* `acquire-resource` and `request-resource` each use one `if`
    to decide between "the resource is free, take it" and "the resource
    is busy, do something else instead."
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values, `false` otherwise; for numbers, this is ordinary numeric
    equality.
  - *Its use:* every comparison against the `-1` sentinel, and every check
    for "has the chain returned to where it started," is an `=` call.
- **`cond`**
  - *What it is:* Clojure's multi-branch conditional special form.
  - *Implementation:* `(cond test1 result1 test2 result2 ... true
    default)` checks each test in order and returns the result paired
    with the first truthy one; this curriculum's own convention,
    established because keywords like `:else` were never taught, is to
    write a bare `true` as the final, always-matching test.
  - *Its use:* `deadlocked-from` has three distinct stopping outcomes plus
    a fourth case that keeps going — exactly the shape `cond` exists for.
- **`-`**
  - *What it is:* Clojure's subtraction function.
  - *Implementation:* `(- a b)` returns `a` minus `b`.
  - *Its use:* `deadlocked-from` counts down its own step budget with
    `(- steps-remaining 1)` on every recursive call.
- **`def`**
  - *What it is:* Clojure's top-level name-binding form, used here only at
    the REPL to build up example state step by step.
  - *Implementation:* `(def name value)` evaluates `value` once and binds
    `name` to the result in the current namespace; unlike `assoc`, which
    returns a new value and changes nothing, `def` is what actually
    attaches a name to a value in the environment.
  - *Its use:* every `user=>` transcript in this lesson uses `def` to hold
    onto an intermediate state between one step and the next, purely for
    readability at the REPL — never inside a real function body.

---

## Concept Unit: Modeling Multi-Resource State — Hold-and-Wait, Made Concrete

### The Problem

Lesson 213 built `lock-acquire` and `lock-release` for exactly one lock.
That was enough to prove a single critical section behaves like ordinary
sequential code once it's protected. But a deadlock, by definition, needs
at least two threads and at least two resources — Lesson 213's own
closing section named this directly, previewing today's lesson: a lock
held forever locks everyone out forever, but that alone is just "a badly
written program," not a deadlock. A deadlock specifically requires each of
several threads to be stuck waiting on a resource that a *different* one
of them is holding. One lock, in isolation, can never produce that —
there's nothing else to be waiting on. Before anything about the four
conditions can be derived, the system needs a way to represent the state
of *many* resources and *many* threads at once: who holds what, and who
is waiting for what.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because deadlocks are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn acquire-resource [held-by thread-id resource-id]
  (if (= (get held-by resource-id) -1)
    (assoc held-by resource-id thread-id)
    held-by))

(defn request-wait [waiting-for thread-id resource-id]
  (assoc waiting-for thread-id resource-id))

(defn request-resource [state thread-id resource-id]
  (if (= (get (get state 0) resource-id) -1)
    [(acquire-resource (get state 0) thread-id resource-id) (get state 1)]
    [(get state 0) (request-wait (get state 1) thread-id resource-id)]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def state0 [[-1 -1] [-1 -1]])
#'user/state0
user=> (def state1 (request-resource state0 0 0))
#'user/state1
user=> state1
[[0 -1] [-1 -1]]
user=> (def state2 (request-resource state1 0 1))
#'user/state2
user=> state2
[[0 0] [-1 -1]]
```

### Mechanical Walkthrough

Enumerate `acquire-resource`, `request-wait`, and `request-resource` in
order.

`(defn acquire-resource [held-by thread-id resource-id] ...)` — names a
function taking three arguments: the current `held-by` vector, the ID of
the thread requesting a resource, and the ID of the resource being
requested. `defn`, reappearing, is Clojure's form for naming a reusable
function; a full call and return happens every time this is invoked,
exactly the same as any other Clojure function call.

`(if (= (get held-by resource-id) -1) ...)` — `get`, reappearing, indexes
directly into `held-by` at position `resource-id`; this is a plain
array-style lookup, `O(1)`, not a scan through the vector. `=`,
reappearing, compares that value against the sentinel `-1`. `if`,
reappearing, branches: if the resource's slot holds the sentinel, it's
free.

`(assoc held-by resource-id thread-id)` — `assoc`, reappearing, is the
"then" branch: it builds a brand-new vector, identical to `held-by`
except that position `resource-id` now holds `thread-id` instead of
`-1`. This is the moment a thread actually gains a resource. The original
`held-by` passed in is untouched — this curriculum has never had a way to
mutate a vector in place, so "acquiring" a resource always means "produce
the next version of the world," not "change the current one."

`held-by` (the "else" branch, bare) — if the resource wasn't free,
`acquire-resource` just hands back the exact same `held-by` it was given,
unchanged. Acquiring fails silently at this level; nothing here decides
what a thread should do about a failed acquire yet — that's
`request-resource`'s job, next.

`(defn request-wait [waiting-for thread-id resource-id] (assoc
waiting-for thread-id resource-id))` — a second, much smaller function:
given the `waiting-for` vector, it records, at position `thread-id`, that
this thread is now waiting for `resource-id`. Same `assoc` pattern as
above, applied to the other half of the state.

`(defn request-resource [state thread-id resource-id] ...)` — the
function that actually gets called from the REPL. It takes `state`, a
two-element vector pairing `held-by` and `waiting-for` together (the same
vector-as-pair convention this curriculum has used since Lesson 85,
extended here to hold two whole vectors instead of two plain values).

`(get (get state 0) resource-id)` — a nested `get`: the outer call pulls
`held-by` out of the pair at position `0`; the inner call then checks
that specific resource's slot, exactly as `acquire-resource` does
internally. This check happens again, separately, here — not because
`acquire-resource` doesn't already know how to fail safely, but because
`request-resource` needs to decide which *whole branch* to take before
calling anything, since the two branches update completely different
pieces of state.

`[(acquire-resource (get state 0) thread-id resource-id) (get state 1)]`
— the "then" branch, if the resource is free: build a new pair. The
first slot is the result of actually acquiring the resource (a new
`held-by`); the second slot is `waiting-for`, passed through completely
unchanged, via `(get state 1)`, because a thread that got what it wanted
has nothing to wait for.

`[(get state 0) (request-wait (get state 1) thread-id resource-id)]` —
the "else" branch: the opposite split. `held-by` passes through unchanged
via `(get state 0)` — nothing was acquired — while `waiting-for` is
updated to record the new wait.

### CS Lens

This is the **hold-and-wait** condition, made concrete for the first
time: after `state2` above, `held-by` shows thread `0` holding resource
`0`, and if a third call had it request a resource already held by
someone else, `waiting-for` would *simultaneously* show thread `0`
waiting, while `held-by` still shows it holding resource `0` — one
thread, in one piece of state, holding something and waiting for
something else at the same instant. Every real deadlock needs at least
one thread in exactly this position; a thread that always finishes and
releases everything before ever requesting anything new can never be
part of one.

Also recognized in: a car stopped in an intersection while holding a
parking spot it refuses to give up until the light changes; a database
transaction holding one row lock while waiting to acquire a second; a
build system's worker holding a partial-output lock while waiting on a
dependency another worker owns.

### SE Lens

The alternative design here would be to let one thread's
`acquire-resource` call *block* — literally pause execution until the
resource frees up — the way a real OS thread calling a real mutex's
`lock()` actually does. This lesson deliberately doesn't do that:
`request-resource` always returns immediately, either having acquired the
resource or having recorded a wait, and control returns to whoever's
driving the simulation. The tradeoff is real: a blocking model is closer
to how production code actually reads, but it would make the *system's*
state invisible mid-block — there'd be no way to inspect "who is waiting
for what, right now" from outside, which is exactly the information the
rest of this lesson needs to detect a deadlock at all. Modeling waiting
as *data* (a vector entry) instead of as *control flow* (a paused thread)
is what makes deadlock detection a function you can call, rather than
something you can only infer from a stack trace after the system has
already frozen.

---

## Concept Unit: The Wait-For Graph and Circular Wait

### The Problem

Two threads can each be in a hold-and-wait state at the same time
without anything being wrong — thread `0` holding resource `0` and
waiting for resource `1`, while thread `1` is off doing something
unrelated with resource `2`, is just normal contention, not a deadlock.
Hold-and-wait alone isn't sufficient. A real deadlock needs the waiting
to loop: thread `0` waiting on a resource thread `1` holds, while thread
`1` is *simultaneously* waiting on a resource thread `0` holds. Given
only `held-by` and `waiting-for`, how does the code actually decide
whether the current waiting has looped back on itself?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because deadlocks are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn wait-for-edge [state thread-id]
  (if (= (get (get state 1) thread-id) -1)
    -1
    (get (get state 0) (get (get state 1) thread-id))))

(defn deadlocked-from [state thread-id current steps-remaining]
  (cond
    (= steps-remaining 0) false
    (= current -1) false
    (= current thread-id) true
    true (deadlocked-from state thread-id (wait-for-edge state current) (- steps-remaining 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def d0 [[-1 -1] [-1 -1]])
#'user/d0
user=> (def d1 (request-resource d0 0 0))
#'user/d1
user=> (def d2 (request-resource d1 1 1))
#'user/d2
user=> (def d3 (request-resource d2 0 1))
#'user/d3
user=> (def d4 (request-resource d3 1 0))
#'user/d4
user=> d4
[[0 1] [1 0]]
user=> (wait-for-edge d4 0)
1
user=> (wait-for-edge d4 1)
0
user=> (deadlocked-from d4 0 (wait-for-edge d4 0) 2)
true
user=> (deadlocked-from d4 1 (wait-for-edge d4 1) 2)
true
```

### Mechanical Walkthrough

`d4`, built by running `request-resource` four times in sequence (thread
`0` takes resource `0`; thread `1` takes resource `1`; thread `0` then
wants resource `1`, already held, so it waits; thread `1` then wants
resource `0`, already held, so it waits) — this is the classic
two-thread "deadly embrace," and it's built purely out of Concept Unit
1's own function, called four times, nothing new.

`(defn wait-for-edge [state thread-id] ...)` — a new function: given the
current `state` and a `thread-id`, it answers one question: "if this
thread is blocked, which *other thread* is it effectively blocked on?"
`defn`, reappearing, names it as usual.

`(= (get (get state 1) thread-id) -1)` — `get` twice, nested,
reappearing: the outer pulls `waiting-for` from the pair; the inner reads
this thread's own waiting slot. `=`, reappearing, checks it against the
sentinel.

`-1` (the "then" branch) — if the thread isn't waiting on anything,
there's no wait-for edge to report; `-1` here means "no edge," reusing
the exact same sentinel value as before, now doing double duty as "no
thread" instead of "no resource" — a deliberate reuse, since both are
just "a non-negative integer ID, or nothing."

`(get (get state 0) (get (get state 1) thread-id))` — the "else" branch,
three nested `get` calls: the innermost, `(get (get state 1)
thread-id)`, is the *resource ID* this thread is waiting for (the same
lookup as the check just above). The outer `(get (get state 0) ...)`
then asks `held-by`: "who currently holds that specific resource?" That
thread ID is the answer — this is the actual **wait-for graph edge**:
thread `thread-id` waits for whichever thread this returns.

This is the graph's structure, worth naming explicitly: every node
(thread) has *at most one* outgoing edge, because `waiting-for` only ever
records a single resource per thread at a time — a thread can only be
blocked on one `acquire` call at once. That's a real structural fact
about this simulation, not a coincidence, and it's what makes the next
function simpler than a general graph-cycle check would need to be.

`(defn deadlocked-from [state thread-id current steps-remaining] ...)` —
the detector itself. It walks the chain of wait-for edges starting from
`thread-id`, one hop at a time, asking on every hop: "have I come back to
where I started?" `current` is the thread currently being looked at
(already one hop ahead of `thread-id` by the time this is first called);
`steps-remaining` is a countdown safety bound.

`(cond ...)`, reappearing — four branches, checked top to bottom:

`(= steps-remaining 0) false` — if the countdown hits zero without
finding a cycle back to `thread-id`, stop and report "not deadlocked."
This branch is what makes the whole function safe to run even on a chain
that never returns and never terminates on its own.

`(= current -1) false` — if this hop landed on "no edge" (the thread
currently being examined isn't waiting on anyone), the chain has run out
on its own, naturally, before looping — also "not deadlocked."

`(= current thread-id) true` — the one true-positive case: if the chain
has walked back around to the exact thread it started from, that's a
closed loop of waiting — a real cycle.

`true (deadlocked-from state thread-id (wait-for-edge state current) (-
steps-remaining 1))` — the fallback, reappearing `cond`-with-`true`
convention: none of the three stopping conditions matched, so take one
more hop. `(wait-for-edge state current)` finds the *next* thread in the
chain (who is `current` itself waiting on), and `(- steps-remaining 1)`,
reappearing subtraction, spends one unit of the step budget. This is
recursion carrying an accumulator forward — a function calling itself
with updated arguments, no `loop`, no mutation.

Why `steps-remaining` starts at the number of threads in the system (`2`,
in `d4`'s case): with at most one outgoing edge per node, a chain that
hasn't returned to `thread-id` within that many hops can never return to
it at all — by then it would have visited more distinct threads than
exist, which is only possible by revisiting some *other* thread twice,
meaning it's found a cycle that doesn't include the thread it started
from. That's a real deadlock too, just not one `thread-id` is part of —
call `deadlocked-from` starting from each thread separately to find every
cycle in the system, exactly as `d4`'s transcript does for both thread
`0` and thread `1` above.

Trace `(deadlocked-from d4 0 (wait-for-edge d4 0) 2)` — the initial call
passes `current = (wait-for-edge d4 0) = 1` already:

1. `steps-remaining = 2`, `current = 1`. None of the first three `cond`
   branches match (`1` is neither `0` steps left, nor `-1`, nor
   `thread-id`, which is `0`) — falls to the `true` branch. Recurses with
   `current = (wait-for-edge d4 1) = 0` and `steps-remaining = 1`.
2. `steps-remaining = 1`, `current = 0`. The third branch, `(= current
   thread-id)`, matches — `current` is `0`, and `thread-id` (still `0`,
   unchanged across every recursive call) is also `0`. Returns `true`.

Two hops — thread `0` waits for thread `1`, thread `1` waits for thread
`0` — and the chain is back where it started. That closed loop is
**circular wait**, the fourth condition, and it's exactly what this
function detects.

### CS Lens

A graph where every node has at most one outgoing edge is structurally
identical to a **linked list that might point back into itself** — which
is exactly why `deadlocked-from`'s "follow one link at a time, stop
after visiting more nodes than exist" strategy is enough, without needing
a fuller visited/on-path bookkeeping built for graphs where a node can
have *several* outgoing edges. This is a real, named simplification
available because of a real structural fact about this specific problem
(one wait per thread), not a shortcut taken by ignoring cases — worth
recognizing as its own general principle: a specialized version of an
algorithm, correct because of a genuine property of the specific problem,
can be simpler than the general-purpose version without being any less
rigorous.

Also recognized in: Floyd's cycle-detection ("tortoise and hare") for a
singly linked list; detecting a circular dependency in a spreadsheet's
cell-reference chain; a `git` history walk that has to stop if a
corrupted repository's commit graph ever pointed a "parent" back at one
of its own descendants.

### SE Lens

The alternative here is building a full adjacency-matrix representation —
one row per thread, `O(1)` lookup — and running a general visited/on-path
cycle detection over it, the way a graph with any number of outgoing
edges per node would require. That would still work — a wait-for graph
with out-degree one is a valid input to the general algorithm too. The
tradeoff against doing that here: the general version carries bookkeeping
(a `visited` array, a separate `on-path` flag, an explicit stack or
recursion over every neighbor) that exists specifically to handle a node
with *multiple* outgoing edges correctly — none of which this problem
ever needs, since every thread waits on exactly one resource at a time.
Reaching for the general tool anyway would work, but it would also hide
the actual reason this detector is safe (the step-count bound) behind
machinery built for a harder problem than the one actually being solved.
The real cost of *not* recognizing the simpler structure: a future
maintainer reading a general-graph cycle detector here would reasonably
assume a thread can wait on multiple resources at once, and might build
on that wrong assumption later.

---

## Concept Unit: No Preemption and Lock Ordering

### The Problem

Three of the four conditions are now visible directly in running code:
mutual exclusion is enforced by `acquire-resource`'s own check (a
resource slot holds exactly one thread ID or the free sentinel, never a
set of several); hold-and-wait was shown concretely in Concept Unit 1;
circular wait now has a real detector. The fourth condition, no
preemption, hasn't been shown yet — and until it's named concretely, it's
tempting to assume a deadlock could just be broken by having the system
forcibly grab a stuck resource back. Once all four conditions are
actually visible together, a real question becomes answerable: does
removing just one of them actually prevent the deadlock `d4` hit — and if
so, which one is cheapest to remove in a real system?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because deadlocks are a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn release-resource [held-by resource-id]
  (assoc held-by resource-id -1))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def f0 [[-1 -1] [-1 -1]])
#'user/f0
user=> (def f1 (request-resource f0 0 0))
#'user/f1
user=> f1
[[0 -1] [-1 -1]]
user=> (def f2 (request-resource f1 1 0))
#'user/f2
user=> f2
[[0 -1] [-1 0]]
user=> (def f3 (request-resource f2 0 1))
#'user/f3
user=> f3
[[0 0] [-1 0]]
user=> (deadlocked-from f3 0 (wait-for-edge f3 0) 2)
false
user=> (deadlocked-from f3 1 (wait-for-edge f3 1) 2)
false
user=> (def f4 [(release-resource (get f3 0) 0) (get f3 1)])
#'user/f4
user=> (def f4 [(release-resource (get f4 0) 1) (get f4 1)])
#'user/f4
user=> f4
[[-1 -1] [-1 0]]
user=> (request-resource f4 1 0)
[[1 -1] [-1 0]]
```

### Mechanical Walkthrough

`(defn release-resource [held-by resource-id] (assoc held-by resource-id
-1))` — the mirror image of `acquire-resource`'s successful branch:
`assoc`, reappearing, sets `held-by` at `resource-id` back to the `-1`
sentinel, undoing an acquire. Small, but worth stating exactly what it
doesn't do: `release-resource` only ever exists as a call a thread makes
about the resource *it currently holds*. Nothing in this lesson's code
lets one thread call `release-resource` on behalf of a resource *another*
thread is holding, and nothing calls it automatically on a timer or from
outside. That absence is **no preemption**, and it's a property of which
functions exist and what arguments they accept, not a rule enforced by a
runtime check.

`f0` through `f3` rebuild the same two-thread, two-resource scenario as
`d0` through `d4` — but with one deliberate change: thread `1`'s *first*
request is for resource `0` (matching thread `0`'s own first choice), not
resource `1`. Both threads now request resources in the same fixed
order — resource `0` before resource `1` — instead of the mismatched
order that produced `d4`'s deadlock. This is **lock ordering**: a rule,
agreed on in advance by every thread, that resources are always
requested in the same fixed sequence.

Trace what actually happens differently: after `f2`, thread `1` is
waiting for resource `0` — but critically, `waiting-for` shows thread `1`
waiting while `held-by` shows thread `1` holding *nothing at all* (`f2`'s
own value, `[[0 -1] [-1 0]]`, has resource `1`'s slot still at `-1`).
Thread `1` never entered hold-and-wait this time; it's just plain
blocked, holding zero resources. `deadlocked-from` confirms this for both
threads after `f3`: both calls return `false`. Thread `0` finishes
acquiring both resources uncontested, releases them (`f4`), and only then
does thread `1`'s wait resolve, letting it finally acquire resource `0`
for real — the final `(request-resource f4 1 0)` call above returns
`[[1 -1] [-1 0]]`, resource `0` now held by thread `1`.

### CS Lens

Lock ordering doesn't remove mutual exclusion, hold-and-wait as a
*possibility*, or no-preemption — a thread can still hold one resource
and wait for another under this rule; if thread `1` had already grabbed
some *other* resource before requesting resource `0` in `f2`, that would
still show genuine hold-and-wait. What lock ordering removes is the
specific *interleaving* that lets two threads each hold the resource the
other one wants at the same time. With a fixed global order, whichever
thread reaches the *first* resource in the shared sequence first will
always be the one blocked waiting, never the one being waited on — the
chain can only ever point one direction, never loop back. That's circular
wait, specifically, made structurally impossible, without touching any of
the other three conditions.

Also recognized in: the "acquire locks in address order" rule used by
real database engines and real multithreaded C++ code to prevent exactly
this class of bug; alphabetical or numeric tie-breaking rules used to
make any two-party negotiation protocol converge instead of stalemate; a
four-way stop sign's "whoever arrived first goes first" convention, which
exists specifically to prevent the standoff where every driver is waiting
for someone else to go.

### SE Lens

Of the four conditions, mutual exclusion usually can't be given up at
all (that's the entire reason the lock exists — remove it and the lost
update Lesson 212 demonstrated comes right back). No preemption is close
to that: forcibly taking a resource away from a thread mid-use requires
that thread's in-progress work to be safely abandoned or rolled back at
an arbitrary point, which is only tractable for some kinds of resources
(a CPU time-slice, which Lesson 211 already showed how to context-switch
away from) and dangerous or outright impossible for others (a
half-written file, a partially updated data structure). Hold-and-wait can
be removed by requiring a thread to acquire everything it will ever need
atomically, all at once, up front — but that demands knowing the full set
of resources a thread will want before it starts, which real programs
frequently can't predict, and it forces a thread to hold resources it
isn't using yet, hurting concurrency. Circular wait is the one condition
breakable by a rule that costs almost nothing at runtime — a fixed
acquisition order, agreed on once, at design time — which is exactly why
lock ordering, not the other three options, is the fix real systems reach
for by default. The debt this project is currently carrying, honestly:
nothing in this lesson's code *enforces* the ordering rule —
`request-resource` will happily let a caller violate it, the same way
`d0`-`d4` did on purpose. The discipline lives entirely in the caller's
own hands, which is exactly the kind of convention that erodes over time
in a real codebase as more people touch it without knowing the rule
exists.

---

## Connect the Pieces

Follow thread `1` through every piece built in this lesson, start to
finish, in the *fixed* scenario (`f0` through the end): building `f2`,
thread `1` asks for resource `0`, and `request-resource` (Concept Unit 1)
checks `held-by` at position `0`, finds thread `0` already there, and
takes the "record a wait" branch: `waiting-for` gets `assoc`'d to show
thread `1` waiting on resource `0`, while `held-by` passes through
untouched — thread `1` now holds nothing and waits for one thing, the
ordinary, non-circular shape of hold-and-wait. `(wait-for-edge f3 1)`
(Concept Unit 2) reads that same `waiting-for` entry, then asks `held-by`
who's holding resource `0`, and gets back thread `0` — one edge, thread
`1` pointing at thread `0`. `(deadlocked-from f3 1 0 2)` walks that
single edge, immediately lands on `current = 0`, which is not `1` and not
`-1`, takes the fallback branch, asks `wait-for-edge` again from thread
`0`'s position, gets back `-1` (thread `0` isn't waiting on anything — it
just acquired resource `1` uncontested), and the very next check, `(=
current -1)`, returns `false`. No cycle. Finally `release-resource`,
called twice on thread `0`'s two resources (Concept Unit 3), frees
resource `0`, and the very next `request-resource` call lets thread `1`
finally take it — the wait this whole trace started with actually
resolves, because nothing about this scenario ever gave the wait-for
chain a way to point back at itself.

## What Breaks Without This

Delete the `(= current thread-id) true` branch from `deadlocked-from`'s
`cond` — the one check that actually recognizes a closed loop — leaving
only the step-count and dead-end branches:

```
user=> (deadlocked-from d4 0 (wait-for-edge d4 0) 2)
false
```

Run against `d4`, the exact scenario built and hand-confirmed as
deadlocked in Concept Unit 2, this now silently reports `false` — no
error, no crash, just a wrong answer, and a dangerous one: a monitoring
system built on this broken function would report a genuinely stuck pair
of threads as healthy. Restoring the branch brings the correct `true`
back.

## Exercises

1. Build a three-thread, three-resource deadlock: thread `0` holds
   resource `0` and waits for resource `1`; thread `1` holds resource `1`
   and waits for resource `2`; thread `2` holds resource `2` and waits
   for resource `0`. Confirm `deadlocked-from` returns `true` starting
   from each of the three threads, and hand-trace why the step bound
   needs to be `3`, not `2`, for this case.
2. Construct a scenario where thread `0` is waiting on a chain that leads
   into a cycle *between threads 1 and 2*, without thread `0` itself
   being part of that cycle. Confirm `(deadlocked-from state 0 ...)`
   correctly returns `false` even though thread `0` will, in reality,
   never proceed either — and write one sentence explaining why that's
   still the technically correct answer to the specific question
   `deadlocked-from` asks.
3. Modify `request-resource` so a thread refuses to request any resource
   unless it already holds every resource with a lower ID than the one
   it's requesting (a stricter, self-enforcing version of Concept Unit
   3's lock ordering). Re-run `d0` through `d4`'s original
   mismatched-order sequence through this stricter version and confirm
   the deadlock can no longer be constructed at all.

## Definition of Done

- [ ] `acquire-resource`, `request-wait`, `request-resource`,
      `release-resource`, `wait-for-edge`, and `deadlocked-from` all
      defined and run in a live `bb` REPL, matching every transcript
      shown above exactly.
- [ ] The `d0`-through-`d4` deadlock scenario reproduced, with
      `deadlocked-from` returning `true` from both thread `0` and thread
      `1`.
- [ ] The `f0`-through-`f4` fixed scenario reproduced, with
      `deadlocked-from` returning `false` from both threads, and thread
      `1` shown actually acquiring resource `0` once thread `0` releases.
- [ ] Each of the four conditions — mutual exclusion, hold-and-wait, no
      preemption, circular wait — pointed to as a specific, real fact
      about this session's own code, not recited from memory.
- [ ] Exercise 1 completed and hand-traced.
- [ ] `git commit -m "Add Lesson 214: derive the four necessary conditions
      for deadlock directly from a working detector, not from a
      memorized list"`
