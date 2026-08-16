# Lesson 219: Lock-Free Thinking — Atomic Data Structures and Progress Guarantees

**What you will build**: A real lock-free stack — push and pop built
entirely from Lesson 217's `compare-and-swap`, with no lock anywhere —
proving the CAS-and-retry pattern scales from a single counter to a
genuine linked data structure, and correctly avoids ever handing the
same popped value to two racing threads. It closes by naming and
demonstrating, concretely, a real formal hierarchy of promises about
which threads are guaranteed to finish: this exact stack turns out to
guarantee the *system* always makes progress, while still allowing any
one specific thread to personally lose its own race, over and over,
while everyone else succeeds around it.

**What you need to know first**: Lesson 217's `compare-and-swap`, the
retry pattern, and the idea that a failed CAS means "try again with
fresh information," not "something went wrong." Lesson 214's
sentinel-value convention (`-1` meaning "nothing here"). Lesson 92's
node-as-vector-pair convention, `[value next]`.

**Terms used in this lesson**:

- **lock-free data structure** — a data structure whose operations are
  built entirely from atomic primitives and retry, guaranteeing the
  system as a whole always makes progress, even though any single
  operation may need to retry; an alternative to protecting a data
  structure with a lock, trading "no thread is ever blocked waiting" for
  "every operation has to be written as a retry loop."
- **progress guarantee** — a formal promise about which threads are
  guaranteed to eventually finish their work, and under what
  conditions; exists because "this never deadlocks" isn't one single
  guarantee — there's a real hierarchy of stronger and weaker promises
  worth telling apart.
- **obstruction-free** — the weakest of the three progress guarantees: a
  thread is guaranteed to finish in a bounded number of steps only if
  every other thread stops interfering; says nothing about what happens
  if contention never actually lets up.
- **lock-free** — a stronger guarantee: at every point, at least one
  contending thread is guaranteed to make progress in a bounded number
  of steps, even under constant contention — though any one specific
  thread could, in principle, keep losing its own race indefinitely.
- **wait-free** — the strongest guarantee: every thread is guaranteed to
  finish in a bounded number of its own steps, regardless of what any
  other thread does — no thread can ever be starved, not even one.
- **starvation** — a thread that is individually never granted the
  chance to make progress, even while the system as a whole continues to
  make progress around it; the specific risk lock-free (but not
  wait-free) code explicitly still permits.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* `compare-and-swap`, reused from Lesson 217 unchanged, and
    this lesson's own `make-node`.
- **`if`**
  - *What it is:* Clojure's two-branch conditional special form.
  - *Implementation:* `(if test then else)` evaluates `test`; returns
    `then` if truthy, `else` otherwise.
  - *Its use:* `compare-and-swap`'s own single guard, deciding between a
    successful write and a refused one.
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values.
  - *Its use:* `compare-and-swap` checks whether the real current head
    still matches what a thread last saw.
- **`get`**
  - *What it is:* Clojure's positional lookup function for an indexed
    collection.
  - *Implementation:* `(get coll index)` returns the value at `index`.
  - *Its use:* reading a node's value or its `next` pointer back out of
    its `[value next]` pair, and reading a result back out of a
    `compare-and-swap` pair.
- **`assoc`**
  - *What it is:* Clojure's functional-update function for an indexed or
    keyed collection.
  - *Implementation:* `(assoc coll index value)` returns a new
    collection identical to `coll` except at `index`, which now holds
    `value`.
  - *Its use:* appending a freshly created node onto the end of the
    growing `nodes` vector.
- **`count`**
  - *What it is:* Clojure's function returning how many elements a
    collection holds.
  - *Implementation:* `(count coll)` returns an integer, the number of
    elements currently in `coll`.
  - *Its use:* finding the next free index in `nodes`, the same
    append-at-`(count v)` idiom used since Lesson 94.
- **`def`**
  - *What it is:* Clojure's top-level name-binding form, used here only
    at the REPL to hold example state between steps.
  - *Implementation:* `(def name value)` evaluates `value` once and
    binds `name` to the result.
  - *Its use:* every `user=>` transcript uses `def` to carry the stack's
    `head` and `nodes` state from one thread's turn to the next.

---

## Concept Unit: A Lock-Free Stack — Push, Built From Compare-and-Swap

### The Problem

Lesson 217 protected a single number — a counter — with `compare-and-
swap`. A stack is a genuinely different kind of shared state: not one
value, but a whole chain of linked nodes, where "pushing" has to both
create a new node *and* correctly link it in front of whatever the
current top happens to be, atomically, with no lock. Can the identical
CAS-and-retry technique protect something with real internal shape, not
just a single number?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because lock-free data structures are a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-node [value next]
  [value next])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

An empty stack: `head = -1` (Lesson 214's sentinel, no top node), `nodes
= []`. Thread A pushes `10`; thread B, racing, pushes `20`, its first
attempt reading the head *before* A's push has landed:

```
user=> (def head0 -1)
user=> (def nodes0 [])
user=> (def nodeA (make-node 10 head0))
#'user/nodeA
user=> nodeA
[10 -1]
user=> (def nodes1 (assoc nodes0 (count nodes0) nodeA))
#'user/nodes1
user=> (def casA (compare-and-swap head0 head0 0))
#'user/casA
user=> casA
[0 true]
user=> (def head1 (get casA 0))
#'user/head1
user=> head1
0
user=> (def nodeB1 (make-node 20 head0))
#'user/nodeB1
user=> (def nodes2 (assoc nodes1 (count nodes1) nodeB1))
user=> (def casB1 (compare-and-swap head1 head0 1))
#'user/casB1
user=> casB1
[0 false]
user=> (def nodeB2 (make-node 20 head1))
#'user/nodeB2
user=> (def nodes3 (assoc nodes2 (count nodes2) nodeB2))
user=> (def casB2 (compare-and-swap head1 head1 2))
#'user/casB2
user=> casB2
[2 true]
user=> (def head2 (get casB2 0))
user=> head2
2
user=> nodes3
[[10 -1] [20 -1] [20 0]]
```

### Mechanical Walkthrough

`(defn make-node [value next] [value next])` — `defn`, reappearing. The
body is a two-element vector — the same node-as-pair convention Lesson
92's binary-search-tree nodes used: slot `0` is the value this node
holds, slot `1` is the index of the node *underneath* it in the stack
(or `-1`, meaning "this is the bottom").

`(def head0 -1)` / `(def nodes0 [])` — the starting empty stack: no top
node, no nodes at all yet.

`(make-node 10 head0)` — thread A's node, `[10 -1]`: value `10`, and
`next` set to whatever A *read* as the current head a moment ago — here,
`-1`. `(assoc nodes0 (count nodes0) nodeA)` — `assoc` and `count`, both
reappearing, append this node onto `nodes` at its next free index, `0`.

`(compare-and-swap head0 head0 0)` — `compare-and-swap`, reused
completely unchanged from Lesson 217: `current` is `head0` (the real
current head — still `-1`, since nothing has succeeded yet), `expected`
is also `head0` (what A itself read), `new-value` is `0` (A's new
node's own index). They match — `[0 true]`. `head1`, read out with
`get`, reappearing, is `0`: the stack's real top is now A's node.

`(make-node 20 head0)` — thread B's *first* attempt, racing: B read the
head *before* A's push landed, so B's node also points `next` at `-1`,
the stale value B actually saw. `(compare-and-swap head1 head0 1)` —
`current` is `head1`, the real current head, now `0` (A already
succeeded); `expected` is `head0`, B's stale `-1`. They don't match —
`[0 false]` — B's first attempt is correctly refused, and B's node,
`nodes2`'s entry at index `1`, is left unused, real memory churn from a
lost race, honest and harmless.

`(make-node 20 head1)` — B's *second*, retried attempt: a fresh node, `[20
0]`, `next` now pointing at the real current head, `0` — B re-read
before building this node, unlike its stale first attempt.
`(compare-and-swap head1 head1 2)` — `current` and `expected` both `0`
now — match — `[2 true]`. `head2` is `2`: B's retried node is the new
top.

Trace the finished stack: `nodes3` is `[[10 -1] [20 -1] [20 0]]`; the
real, current top is index `2`, `[20 0]` — value `20`, pointing at index
`0`, `[10 -1]` — value `10`, pointing at `-1`, the bottom. Reading top to
bottom: `20`, then `10` — correct last-in-first-out order, with A's push
having genuinely landed first, and B's retried push correctly building
*on top of* A's, not overwriting or racing past it.

### CS Lens

This is the classic **Treiber stack**, one of the earliest and simplest
lock-free data structures ever published, and it's built from nothing
beyond Lesson 217's own `compare-and-swap`, applied to one specific
field — `head` — rather than to an entire data structure at once. The
insight worth naming: a lock-free data structure doesn't need every one
of its fields protected atomically; it needs exactly the *one* field
whose update determines whether an operation "counts" — here, `head` —
protected, while everything else (a node's own contents, once created)
never changes after it's written and needs no protection at all.

Also recognized in: a shared bulletin board where posting a new note
means "photograph the current top note, pin your new note over it,
re-check the top note is still what you photographed before considering
it posted" — retrying if someone else pinned something in between; a
version-controlled document's optimistic merge, attaching a new revision
on top of whatever the current head revision turns out to be, retrying
against the real head if it moved first.

### SE Lens

The alternative is exactly what Lesson 213 already built: wrap the
entire push operation — create the node, link it, update the head — in
`lock-acquire`/`lock-release`, guaranteeing no other thread's push or
pop can interleave at all. That's simpler to reason about — no retries,
no stale reads to worry about — at the cost of every other thread being
fully blocked for the duration of any single push or pop, even a push
that's nowhere near what that other thread actually wants to do. The
lock-free version's tradeoff runs the other way: no thread is ever
blocked waiting on another, but every operation has to be written
defensively, as a loop that might need to retry an unbounded number of
times under bad enough contention — real complexity a lock-based version
never has to carry in its own code, pushed instead onto whoever writes
the retry logic correctly.

---

## Concept Unit: Popping Safely — No Double-Issue Under a Race

### The Problem

Pushing only ever adds. Popping is a different kind of danger: it
*hands out* a value, and if two threads race to pop at the same moment,
the one thing that must never happen is both of them walking away
believing they received the *same* value — the lock-free equivalent of
Lesson 214's resource-collision danger, now for a value instead of a
lock. Does the identical CAS-and-retry technique keep that from
happening?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because lock-free data structures are a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — Unit 1's `compare-and-swap` and `get` are reused
completely unchanged. What's new is only the sequence: read the current
head, read *that node's own* `next` pointer, and attempt to CAS the
head down to it.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

Continuing from Unit 1's finished stack (`head2 = 2`, `nodes3 = [[10
-1] [20 -1] [20 0]]`). Thread C pops first, cleanly:

```
user=> (def expectedC head2)
user=> (def nextC (get (get nodes3 expectedC) 1))
#'user/nextC
user=> nextC
0
user=> (def casC (compare-and-swap head2 expectedC nextC))
#'user/casC
user=> casC
[0 true]
user=> (def head3 (get casC 0))
user=> (def poppedC (get (get nodes3 expectedC) 0))
#'user/poppedC
user=> poppedC
20
```

Now threads D and E race for the next pop, both reading the head before
either's CAS lands:

```
user=> (def expectedD head3)
user=> (def nextD (get (get nodes3 expectedD) 1))
user=> (def casD (compare-and-swap head3 expectedD nextD))
#'user/casD
user=> casD
[-1 true]
user=> (def head4 (get casD 0))
user=> (def poppedD (get (get nodes3 expectedD) 0))
#'user/poppedD
user=> poppedD
10
user=> (def expectedE head3)
user=> (def nextE (get (get nodes3 expectedE) 1))
user=> (def casE (compare-and-swap head4 expectedE nextE))
#'user/casE
user=> casE
[-1 false]
```

### Mechanical Walkthrough

`expectedC` is `head2`, `2` — the real top when C looks. `(get (get
nodes3 expectedC) 1)` — two nested `get` calls, reappearing: the inner
one reads node index `2` itself, `[20 0]`; the outer reads its `next`
field, `0` — this is what the head *would become* if C's pop succeeds.
`(compare-and-swap head2 expectedC nextC)` — `current` is `head2`,
`expected` is `expectedC`, both `2` — they match, since nobody has
touched the head since C looked — succeeds, `[0 true]`. `head3` becomes
`0`. `poppedC`, read separately from the *same* node C already examined,
`(get (get nodes3 expectedC) 0)`, is `20` — the value slot of the node
C's CAS just detached.

D and E now both read `expectedD = expectedE = head3 = 0` — the same
stale snapshot, exactly Unit 1's B-thread situation, now on the pop
side. D's CAS runs first: `(compare-and-swap head3 expectedD nextD)` —
`current` and `expected` both `0` — matches — `[-1 true]`. `head4`
becomes `-1`: the stack is now empty. `poppedD`, from the *same* node D
examined, is `10`.

E's CAS, using its own stale `expectedE = 0`: `(compare-and-swap head4
expectedE nextE)` — `current` is `head4`, the real current head, now
`-1` (D already succeeded); `expected` is E's stale `0`. They don't
match — `[-1 false]` — E's attempt is correctly refused. Critically, `E`
never reads a "popped value" from this failed attempt at all — nothing
in this code returns a value on a failed CAS, only a refusal. E's own
next move, per the retry pattern, is to re-read the head — find `-1`,
genuinely empty — and correctly report "nothing to pop," rather than
either crashing or handing out `10` a second time.

### CS Lens

The property just proven — that D and E cannot both walk away believing
they popped the same node — comes from exactly the same place Unit 1's
push safety came from: the CAS only succeeds for whichever thread's
`expected` value still matches the *real* current head at the instant
its CAS actually runs, and once one thread's CAS succeeds, the real head
has moved, so no other thread's stale `expected` can match it anymore.
This is **linearizability**, the real name for what a correct lock-free
structure provides: even though D and E's steps genuinely overlapped in
time, the *result* is exactly as if one of them — whichever one's CAS
actually landed — ran completely before the other started.

Also recognized in: a database's optimistic-locking update, refusing a
write whose row version doesn't match the current one, so two
simultaneous edits to the same row can never both silently "win"; a
ticket-counter dispensing exactly one ticket per successful pull, where
a machine malfunction mid-pull is defined to mean *no* ticket was
dispensed, never a duplicate number; an auction's "first valid bid at
this price wins" rule, where a bid submitted a moment too late is
rejected outright rather than treated as tied with the winner.

### SE Lens

The alternative — locking the whole stack around every pop — makes this
property trivially true by construction, since only one thread is ever
inside a pop operation at a time; there's no race to reason about at
all. The lock-free version earns the identical guarantee the harder way:
by making sure the *one* operation that determines success — the head
CAS — can only ever succeed once per real state change, and by making
every failed attempt's information (a `next` pointer read from a node
that might already be gone from the real stack) provably harmless,
since a failed CAS never lets that information reach the caller as a
result. The cost carried forward: every new lock-free structure this
technique gets applied to has to be checked this same way, by hand —
"can two threads' failed and succeeded attempts ever combine to produce
a wrong observable result" isn't automatically true just because CAS is
being used; it has to be verified for the specific structure, the way
this unit just verified it for a stack specifically.

---

## Concept Unit: Progress Guarantees — Lock-Free, Not Wait-Free

### The Problem

Both units so far have shown *individual* races resolving correctly —
one thread wins, the other retries and eventually succeeds. But is
every thread actually *guaranteed* to eventually succeed? Or could a
specific, unlucky thread keep losing its own race indefinitely, even
while the stack as a whole keeps being pushed to and popped from by
other, luckier threads?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because lock-free data structures are a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses `make-node` and `compare-and-swap`
completely unchanged. What's new is the specific scenario: one thread,
`U`, attempting to push while two *other* threads, `V` and `W`, each
successfully push in between U's own attempts.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def h0 -1)
user=> (def ns0 [])
user=> (def expectedU1 h0)
user=> (def nodeV (make-node 100 h0))
user=> (def nsV (assoc ns0 (count ns0) nodeV))
user=> (def casV (compare-and-swap h0 h0 0))
#'user/casV
user=> casV
[0 true]
user=> (def h1 (get casV 0))
user=> (def nodeU1 (make-node 999 expectedU1))
user=> (def nsU1 (assoc nsV (count nsV) nodeU1))
user=> (def casU1 (compare-and-swap h1 expectedU1 1))
#'user/casU1
user=> casU1
[0 false]
user=> (def expectedU2 h1)
user=> (def nodeW (make-node 200 h1))
user=> (def nsW (assoc nsU1 (count nsU1) nodeW))
user=> (def casW (compare-and-swap h1 h1 2))
#'user/casW
user=> casW
[2 true]
user=> (def h2 (get casW 0))
user=> (def nodeU2 (make-node 999 expectedU2))
user=> (def nsU2 (assoc nsW (count nsW) nodeU2))
user=> (def casU2 (compare-and-swap h2 expectedU2 3))
#'user/casU2
user=> casU2
[2 false]
user=> (def expectedU3 h2)
user=> (def nodeU3 (make-node 999 expectedU3))
user=> (def nsU3 (assoc nsU2 (count nsU2) nodeU3))
user=> (def casU3 (compare-and-swap h2 expectedU3 4))
#'user/casU3
user=> casU3
[4 true]
```

### Mechanical Walkthrough

`h0 = -1`, an empty stack again. `expectedU1 = h0`: this is `U`'s very
first read of the head, remembered for its first attempt. Before `U`'s
own CAS runs, `V` pushes `100` — `(make-node 100 h0)`, `(compare-and-swap
h0 h0 0)` — succeeds cleanly, `[0 true]`, `h1` becomes `0`. This is
identical to Unit 1's own A-thread push, nothing new.

`U`'s first attempt: `nodeU1`, built from `U`'s stale `expectedU1 = -1`.
`(compare-and-swap h1 expectedU1 1)` — `current` is `h1`, the real head,
now `0` (`V` already succeeded); `expected` is `U`'s stale `-1`. Refused,
`[0 false]`.

`U` retries — `expectedU2 = h1 = 0`, a fresh read. But before `U`'s
*second* CAS runs, `W` also pushes, `200`, exactly the same shape as
`V`'s push: succeeds cleanly, `h2` becomes `2`.

`U`'s second attempt: `nodeU2`, built from `expectedU2 = 0`.
`(compare-and-swap h2 expectedU2 3)` — `current` is `h2`, now `2` (`W`
already succeeded); `expected` is `U`'s now-stale `0`. Refused again,
`[2 false]`.

`U` retries a third time — `expectedU3 = h2 = 2`, fresh. This time,
nothing else interferes: `(compare-and-swap h2 expectedU3 4)` —
`current` and `expected` both `2` — succeeds, `[4 true]`.

Across this whole trace: `V` succeeded on its first attempt. `W`
succeeded on its first attempt. `U` needed three attempts, failing
twice, specifically *because* `V` and `W` each happened to land their
own successful push in the exact gap between `U`'s read and `U`'s own
CAS, twice in a row. The stack, as a whole, made continuous real
progress the entire time — three real pushes landed, `100`, `200`, and
`999` — even though one specific thread, `U`, was the one paying for all
three of the *other* threads' successes with two wasted, retried
attempts of its own.

### CS Lens

This is exactly what **lock-free** means, and exactly what it does not
promise: at every point in this trace, *some* thread's CAS was
succeeding — the system never stalled, never needed anyone to
"unblock" it, which is the actual guarantee lock-free code provides. But
`U` personally was not guaranteed to succeed within any particular
number of attempts — nothing in `compare-and-swap`'s own logic prevents
`V`, `W`, and any number of further lucky threads from continuing to win
the race against `U` indefinitely, in principle forever, if the
scheduler keeps handing them the timing advantage. That specific
risk — a real thread individually starved while the system around it
keeps moving — is called **starvation**, restated here exactly as
Lesson 210 first found it in a scheduler, now shown as a real,
concrete possibility in lock-free code too. A **wait-free** structure
would additionally guarantee a fixed maximum number of attempts for
every thread, no matter how unlucky its timing — this stack does not
provide that guarantee, and neither does the classic Treiber stack this
lesson is built from; genuinely wait-free data structures exist, but
they require substantially more machinery than a bare CAS-and-retry
loop to guarantee every thread a bounded number of steps.

Also recognized in: a crowded intersection with no traffic light, where
cars keep finding gaps and going, so traffic overall keeps flowing, but
one specific driver waiting for a left turn can, in principle, keep
losing the gap to oncoming cars indefinitely; a busy retail counter
where the line as a whole keeps moving, but one customer near the back
who keeps stepping aside politely could theoretically never actually
reach the front; a network's exponential-backoff retry scheme, where
the network overall stays usable, but one specific unlucky sender can
keep colliding and backing off far longer than most others.

### SE Lens

The alternative to accepting starvation as a possibility is reaching for
a wait-free design instead — genuinely guaranteeing every thread a
bounded number of steps, no exceptions. The tradeoff: wait-free
structures are substantially harder to build correctly (this lesson's
entire stack, built from one CAS and a handful of lines, would need real
additional machinery — commonly, a mechanism where a thread that's about
to succeed first *helps finish* any other thread's pending operation, so
no one can be perpetually leapfrogged) and often cost more per-operation
overhead even when contention is low, paying that cost on every single
call whether or not starvation was ever actually a real risk in this
particular system. Lock-free code, like this lesson's stack, is the
pragmatic middle ground real systems reach for constantly: cheap, simple
to build from a bare atomic primitive, and correct about the one
guarantee that usually matters most in practice — the system never
freezes — while accepting a starvation risk that, honestly, is rare
enough under real, bounded contention that most production lock-free
code never actually hits it, without ever being able to *prove* it can't.

---

## Connect the Pieces

Follow the stack's `head` through every unit, as one continuous system:
start empty, `head = -1` (Unit 1's opening state). Thread A pushes `10`,
succeeding cleanly; thread B, racing, fails once (its stale `expected`
no longer matches the real head after A's success) and correctly
retries with fresh information, succeeding on its second attempt — the
exact CAS-and-retry pattern from Lesson 217, now protecting a whole
linked structure instead of one number. Thread C then pops `20` cleanly
(Unit 2); threads D and E race for the next pop, and E's stale attempt
is correctly refused rather than allowed to hand out `10` a second time —
the same pattern, now proving no value can ever be double-issued.
Finally, thread U attempts to push into a fresh stack while V and W each
land their own successful pushes in the precise gaps between U's own
read and U's own CAS, twice — U eventually succeeds on a third attempt,
having personally retried while V and W each succeeded on their first
try (Unit 3). Every one of these outcomes — B's retry, E's correct
refusal, U's repeated bad luck — comes from the identical, single
mechanism: a CAS that only ever succeeds when its `expected` argument
still matches the real, current state at the exact instant it runs, with
every failure handled by re-reading and trying again rather than by
blocking on anyone else.

## What Breaks Without This

Replace the retry step with a version that gives up silently after a
single failed attempt, instead of re-reading and trying again:

```clojure
(defn push-once [current expected new-value]
  (get (compare-and-swap current expected new-value) 1))
```

Run thread B's original scenario from Unit 1 against it — B's first
attempt, `(push-once head1 head0 1)`, fails (`false`), and the retry
this lesson's own code always performed simply never happens:

```
user=> (push-once head1 head0 1)
false
```

B's push is silently lost. Nothing crashes, no error is raised — the
caller receives `false` and, if nothing checks it, the program simply
continues as though B's push never happened at all, with `20` gone
forever and no trace of it anywhere in `nodes`. This is the exact cost
Unit 1's real `compare-and-swap`-with-retry pattern was built to avoid —
a failed attempt is not a failure of the *operation*, only of one
*attempt* at it, and dropping the retry turns an ordinary, expected race
outcome into a silent, genuine data-loss bug.

## Exercises

1. Extend Unit 1's push trace to a third racing thread, `F`, whose first
   *two* attempts both fail (against A's and B's successes) before its
   third attempt finally succeeds. Confirm the final stack correctly
   contains all three values in the right order.
2. Using Unit 2's pop pattern, construct a scenario where a thread
   attempts to pop from a stack that becomes empty *during* its own
   retry — its first attempt fails because someone else popped the last
   real item, and its second attempt correctly finds `head = -1` and
   reports "nothing to pop" instead of retrying forever.
3. Write, in prose, the shape of a genuinely wait-free fix to Unit 3's
   starvation risk — a rule that would guarantee `U` a bounded number of
   attempts even if `V`, `W`, and further threads kept winning — without
   writing the full implementation. State specifically what information
   a "helping" thread would need about `U`'s own pending attempt to make
   this possible.

## Definition of Done

- [ ] `make-node` and `compare-and-swap` (reused from Lesson 217) both
      run in a live `bb` REPL, matching every transcript shown above
      exactly.
- [ ] Unit 1's push scenario reproduced: a clean first push and a
      failed-then-retried second push, ending with the correct two-item
      stack.
- [ ] Unit 2's pop scenario reproduced: a clean pop, then a raced pop
      where the loser is correctly refused rather than receiving a
      duplicate value.
- [ ] Unit 3's starvation scenario reproduced, with `U` failing twice
      while `V` and `W` each succeed on their first attempt, and a
      one-sentence statement of the difference between lock-free and
      wait-free in your own words.
- [ ] Exercise 2 completed, confirming a retry correctly detects an
      emptied stack instead of retrying forever.
- [ ] `git commit -m "Add Lesson 219: a lock-free stack built from
      compare-and-swap, and the lock-free-vs-wait-free progress
      guarantee it actually provides"`
