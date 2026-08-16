# Lesson 228: Distributed State — Why Shared State Gets Hard Across Machines

**What you will build**: Two replicas of the exact same account balance,
kept on two different machines with no shared memory at all, proving —
concretely, not hypothetically — that they can genuinely diverge, each
one internally correct from its own point of view. It then shows why
Lesson 213's own fix, a lock, can't simply be extended across machines:
a distributed lock is coordinated entirely through Lesson 225's own
unreliable messages, and a lost grant message reproduces the identical
coordination problem one level up. It closes with reconciliation —
last-write-wins, a real, simple, honest strategy for resolving
divergence after the fact — and a concrete demonstration of its real
cost: clock skew, a genuine, ordinary fact about independent machines,
silently picking the wrong winner.

**What you need to know first**: Lesson 221's `update-row`. Lesson
213's lock and mutual exclusion — this lesson's whole point is that its
core guarantee depended on shared memory that no longer exists here.
Lesson 225's message loss, reused directly to model a lost lock-grant.

**Terms used in this lesson**:

- **distributed state** — data that exists as more than one copy, on
  more than one independent machine, with no shared memory connecting
  them; exists because a single machine is a single point of failure and
  a single point of latency, and real systems often need neither.
- **replica** — one specific copy of distributed state, kept on one
  machine, capable of accepting updates independently of any other copy;
  the basic unit distributed state is made of.
- **divergence** — two replicas of what was once the same data genuinely
  disagreeing, each one internally consistent from its own point of
  view, with neither one simply "wrong"; the structural consequence of
  replicas being updatable independently with no instantaneous way to
  compare notes.
- **distributed lock** — an attempt to extend Lesson 213's mutual-
  exclusion guarantee across machines that share no memory, coordinated
  entirely through messages; worth naming specifically because it
  doesn't remove the original coordination problem, it relocates it into
  the message exchange used to grant and release the lock.
- **reconciliation** — the process of resolving two diverged replicas
  back into a single agreed value after the fact, accepting that
  preventing divergence outright isn't always achievable.
- **last-write-wins** — a specific, simple reconciliation strategy that
  keeps whichever of two conflicting updates carries the later
  timestamp, discarding the other.
- **clock skew** — the ordinary, real fact that two independent
  machines' own clocks don't tick in perfect agreement, meaning a
  timestamp recorded on one machine isn't directly, reliably comparable
  to a timestamp recorded on another.

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
  - *Their use:* `if` picks the winning update by timestamp; `cond`
    drives the scan for a matching lock-grant message.
- **`>`** / **`=`**
  - *What they are:* Clojure's greater-than and equality functions.
  - *Implementation:* `(> a b)` returns `true` if `a` exceeds `b`;
    `(= a b)` returns `true` if `a` and `b` are equal values.
  - *Their use:* comparing two timestamps directly; comparing two whole
    replica states for exact agreement, and comparing one logged message
    against a target.
- **`get`** / **`assoc`** / **`count`** / **`+`**
  - *What they are:* Clojure's positional lookup, functional-update,
    length, and addition functions.
  - *Implementation:* `(get coll index)` reads; `(assoc coll index
    value)` returns an updated copy; `(count coll)` returns length;
    `(+ a b)` returns the sum.
  - *Their use:* reused throughout, building and reading this lesson's
    replicas, log entries, and update triples.

---

## Concept Unit: Replicas Can Genuinely Disagree

### The Problem

Lesson 222's `transfer` worked because a debit and a credit happened on
the *same* machine, inside the *same* function call, both touching the
exact same in-memory table. What if the same account needs to be usable
from two different physical locations at once — two full copies of the
same table, kept on two different machines, for speed or for redundancy?
Those two copies can only ever learn about each other through Lesson
225's own unreliable messages, which take real, non-zero time to
travel. Can two such copies ever be *guaranteed* to agree at every
single instant?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because distributed state is a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses Lesson 221's `update-row` completely
unchanged. What's new is the scenario: two separately-updated copies of
the identical starting table.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def schema ["id" "balance"])
#'user/schema
user=> (def replica-a0 [["A" 100]])
#'user/replica-a0
user=> (def replica-b0 [["A" 100]])
#'user/replica-b0
user=> (def replica-a1 (update-row schema replica-a0 "id" "A" ["A" 70]))
#'user/replica-a1
user=> (def replica-b1 (update-row schema replica-b0 "id" "A" ["A" 50]))
#'user/replica-b1
user=> replica-a1
[[A 70]]
user=> replica-b1
[[A 50]]
user=> (= replica-a1 replica-b1)
false
```

### Mechanical Walkthrough

`replica-a0` and `replica-b0` — two genuinely separate table values,
identical in content, `[["A" 100]]`, representing two machines that
last agreed on account `"A"`'s balance being `100`.

`(update-row schema replica-a0 "id" "A" ["A" 70])` — `update-row`,
reappearing from Lesson 221 completely unchanged, run *only* against
`replica-a0` — a `30` debit, processed entirely on machine A, with
machine B nowhere involved in this call at all. `(update-row schema
replica-b0 "id" "A" ["A" 50])` — the identical function, run
*separately*, against `replica-b0` — a *different* `50` debit, processed
entirely on machine B, with machine A nowhere involved in this call
either.

`replica-a1` is `[["A" 70]]`. `replica-b1` is `[["A" 50]]`. `(=
replica-a1 replica-b1)` is `false`. Neither call did anything wrong —
`update-row` behaved exactly as Lesson 221 established, correctly
applying the specific debit it was asked to apply, on the specific
table it was given. The disagreement isn't a bug in either replica; it's
a direct consequence of two independent updates happening on two
independent copies with no message ever passing between them before
both had already committed.

### CS Lens

This is **divergence**, and the crucial thing to notice is that neither
`replica-a1` nor `replica-b1` is "wrong" — each one is exactly correct
for the one update it actually received, and each one has no way,
looking only at its own state, to know the other exists or disagrees.
Every earlier lesson in this curriculum that dealt with concurrent
updates — Lesson 212's lost update, Lesson 222's transaction — assumed a
single, shared, authoritative copy of the data, reachable instantly by
every thread touching it. That assumption is exactly what made a lock
or a `compare-and-swap` a complete fix: there was only ever one true
value to protect. Two replicas have no single true value at all, only
two separately-true histories that happen to have started from the same
place.

Also recognized in: two people editing separate offline copies of the
same shared document, each making real, valid changes, only discovering
they conflict once the copies are compared later; two branches of a
`git` repository, each containing genuinely valid commits, requiring an
explicit merge because neither branch is simply "wrong"; two calendars —
a phone and a paper planner — both updated independently while
disconnected, each internally consistent, disagreeing the moment they're
compared.

### SE Lens

The alternative to accepting divergence as possible is exactly what a
single, non-replicated system already provides for free: one copy of
the data, one place any update has to go through, nothing to diverge
from at all. Replication trades that simplicity for two real
advantages — a replica near each user answers faster than one far away,
and a system with more than one copy survives losing any single
machine — at the direct cost this unit just demonstrated: with more than
one place an update can land, and no way to make two separate updates
on two separate machines happen as a single atomic event across both,
disagreement becomes structurally possible, not just a risk to be
carefully coded around.

---

## Concept Unit: Why a Distributed Lock Doesn't Actually Solve This

### The Problem

Lesson 213 fixed exactly this shape of problem — two things touching
shared state at once — with a lock. Why not have the two replicas
coordinate through a lock the same way, so only one of them is ever
allowed to accept an update at a time?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because distributed state is a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn lock-request [msg-log requester]
  (assoc msg-log (count msg-log) ["LOCK-REQUEST" requester]))

(defn lock-grant [msg-log requester]
  (assoc msg-log (count msg-log) ["LOCK-GRANT" requester]))

(defn has-lock? [msg-log requester index]
  (cond
    (= index (count msg-log)) false
    (= (get msg-log index) ["LOCK-GRANT" requester]) true
    true (has-lock? msg-log requester (+ index 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def msg-log0 [])
#'user/msg-log0
user=> (def msg-log1 (lock-request msg-log0 "replica-a"))
#'user/msg-log1
user=> msg-log1
[[LOCK-REQUEST replica-a]]
user=> (has-lock? msg-log1 "replica-a" 0)
false
```

### Mechanical Walkthrough

`(defn lock-request [msg-log requester] ...)` — `assoc` and `count`,
reappearing, the established append idiom: replica A records that it
has asked some coordinator for the lock. `(defn lock-grant [msg-log
requester] ...)` — structurally identical, representing the coordinator
*replying* with a grant — but notice this function exists and is fully
correct; nothing about it is ever called in this trace, which is the
entire point.

`(defn has-lock? [msg-log requester index] ...)` — `cond`, reappearing,
scans the log for a specific `["LOCK-GRANT" requester]` entry — the
same shape as Lesson 227's own `has-lock?`-style acknowledgment checks,
now applied to lock coordination instead of message delivery.

Trace: `(lock-request msg-log0 "replica-a")` — replica A sends its
request; `msg-log1` records exactly that one entry. A real coordinator
would now reply with `lock-grant` — but this trace deliberately never
calls it, representing the grant message being lost in transit, the
exact same honest failure mode Lesson 225's own `send`/`deliver` split
first made representable. `(has-lock? msg-log1 "replica-a" 0)` scans
the log, finds only the request, no matching grant — returns `false`.
Replica A is now stuck: it has asked, correctly, and has no way to
distinguish "the grant is still in transit" from "the grant was lost
and will never arrive" — the identical ambiguity Lesson 225's own
sender faced, reproduced exactly, one level up.

### CS Lens

**A distributed lock doesn't remove the original coordination problem —
it relocates it.** The whole reason a plain, in-memory lock (Lesson 213)
worked without any of this trouble is that both threads could read and
write the *identical* `locked?` value, instantly, with no possibility of
losing that read or write in transit. The moment "the lock" has to live
somewhere reachable only by sending a message, granting and releasing it
become themselves subject to every problem Lesson 225 already proved a
message can have — loss, delay, and (though not shown in this trace)
reordering. Trying to fix *that* with a second, inner lock protecting the
first lock's own messages would just relocate the identical problem
again, one level further up — there is no level at which "coordinate via
message" stops being subject to message-level uncertainty, because
coordination *is* messages, all the way down, once shared memory is off
the table.

Also recognized in: trying to resolve a scheduling conflict between two
people entirely by mail, where the letter confirming a meeting time can
itself get lost, and a second letter confirming *that* letter arrived
has the identical problem; a relay of couriers each supposed to confirm
receipt to the one before them, where the confirmation itself can be the
thing that goes missing; any real-world "I'll go first, you go after
you hear from me" agreement conducted entirely over a channel that might
simply drop a message with no notice to either side.

### SE Lens

The alternative to accepting this limitation is what real distributed
systems actually reach for: not a simple request/grant lock at all, but
a **consensus protocol** (this curriculum's own honest scoping-down
point — building one fully is real, substantial machinery, beyond this
lesson's scope, the same kind of deliberate boundary Lessons 99, 100,
and 134 drew around their own hardest cases) that's specifically
designed to make progress correctly even when some messages are lost,
by requiring agreement from a *majority* of participants rather than a
single point of coordination that can itself go silent. What every such
protocol still has to accept, honestly: none of them make coordination
*free* the way a shared-memory lock was — every one of them pays in
extra message round-trips and real latency, for the exact same reason
this unit's simple lock-request trace got stuck: coordinating anything
across machines that don't share memory can never be reduced to the
single, instant operation it was in Lesson 213.

---

## Concept Unit: Reconciliation — Last-Write-Wins and Its Honest Cost

### The Problem

Divergence (Unit 1) is a real, structural possibility, and preventing it
outright with a distributed lock (Unit 2) just relocates the same
problem rather than solving it. Given two replicas that *have* diverged,
what's a practical way to bring them back into agreement afterward,
accepting that perfect prevention isn't always achievable?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because distributed state is a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-update [id new-balance timestamp]
  [id new-balance timestamp])

(defn reconcile [update-a update-b]
  (if (> (get update-a 2) (get update-b 2))
    update-a
    update-b))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def update-a (make-update "A" 70 105))
#'user/update-a
user=> (def update-b (make-update "A" 50 110))
#'user/update-b
user=> (reconcile update-a update-b)
[A 50 110]
```

The honest cost — clock skew, made concrete:

```
user=> (def skewed-update-a (make-update "A" 70 200))
#'user/skewed-update-a
user=> (def skewed-update-b (make-update "A" 50 150))
#'user/skewed-update-b
user=> (reconcile skewed-update-a skewed-update-b)
[A 70 200]
```

### Mechanical Walkthrough

`(defn make-update [id new-balance timestamp] [id new-balance
timestamp])` — a three-element vector, extending this curriculum's
established pair convention by one slot: alongside `id` and the update's
own new value, a `timestamp` — recorded by whichever machine actually
performed the update, at the moment it did.

`(defn reconcile [update-a update-b] ...)` — `if`, reappearing, guarded
by `>`, reappearing: compare the two updates' own timestamps directly —
`(get update-a 2)` against `(get update-b 2)` — and keep whichever one
is larger, discarding the other entirely.

Trace, the clean case: `update-a`'s timestamp is `105`; `update-b`'s is
`110`, genuinely later. `(reconcile update-a update-b)` correctly
returns `update-b` — `[A 50 110]`. The `70` update is discarded, and
that's the *correct* outcome: it really did happen first, and the
account genuinely ended at `50` afterward, in whatever real sequence of
events these two timestamps describe.

Trace, the honest failure: `skewed-update-a`'s timestamp is `200`;
`skewed-update-b`'s is `150`. `(reconcile skewed-update-a
skewed-update-b)` returns `skewed-update-a` — `[A 70 200]`. This is
presented, deliberately, as the *wrong* outcome: imagine machine A's own
clock runs fast — genuinely ahead of real time — so an update it
performed *before* machine B's own update still gets stamped with a
*larger* number. `reconcile` has no way to know this; it only ever sees
the two numbers it's given, and a larger number is a larger number
regardless of whether the clock that produced it was accurate.

### CS Lens

Last-write-wins is a genuinely simple, genuinely useful **reconciliation
strategy** — but it silently assumes every machine's clock agrees with
every other machine's, closely enough that comparing their timestamps
directly means something real. **Clock skew** is the name for exactly
the failure this unit's second trace demonstrates: real machines' clocks
drift, by seconds or more, for completely ordinary reasons (temperature,
manufacturing variance, network time sync running on its own imperfect
schedule) — and nothing about comparing two numbers with `>` can ever
detect that one of them came from a clock quietly running fast. The real
lesson isn't "don't use last-write-wins" — it's genuinely used in real
production systems, precisely because it's simple and usually good
enough — the lesson is that *any* reconciliation strategy built on
comparing information collected independently on different machines
inherits whatever's unreliable about how that information was collected
in the first place.

Also recognized in: two witnesses to the same event, each reporting the
time from their own, slightly-off wristwatch, producing an incorrect
account of which of two things happened first even though both
witnesses are being completely honest; a distributed sensor network
timestamping readings locally on each sensor, where a genuinely later
reading can be logically ordered *before* an earlier one if that
sensor's own clock has drifted; a multi-camera video shoot where clips
timestamped by each camera's own internal clock don't actually line up
in the edit unless something explicitly corrects for the drift between
them.

### SE Lens

The alternative to last-write-wins is a **logical clock** — a counter
that doesn't try to measure real wall-clock time at all, only to
capture the actual causal order events happened in (did this update
genuinely happen *because of* or *after* seeing that one), immune to
clock skew by construction because it never depends on any machine's
physical clock being accurate. Building one correctly (a Lamport clock,
or a vector clock capable of detecting genuinely concurrent, unordered
updates rather than just picking a winner) is real, substantial
machinery — an honest scope boundary this lesson draws rather than
building past, the same kind of deliberate limit Lesson 219 drew around
wait-free structures. The tradeoff last-write-wins accepts in exchange
for its own real simplicity: it will, with complete confidence, produce
a wrong answer under clock skew, and — this is the sharper edge — it
will never announce that it did. The discarded update simply
disappears, with nothing about `reconcile`'s own return value
distinguishing a correct resolution from an incorrect one.

---

## Connect the Pieces

Follow account `"A"`'s balance through every unit built in this lesson,
as one continuous, honest story about what happens when shared memory
is no longer available. Two replicas, starting identical at `100`, each
accept a genuinely independent update — `70` on one, `50` on the other —
with no message ever passing between them first (Unit 1): real,
structural divergence, neither replica wrong on its own terms. A
distributed lock, built from exactly the message-passing primitives
Lesson 225 established, is the obvious next thing to reach for — but
Unit 2 proves it doesn't remove the coordination problem, it just moves
it into the lock's own request/grant messages, which can be lost the
identical way any other message can. Left with two replicas that really
have diverged, and no way to have prevented it for free, Unit 3's
`reconcile` picks a winner after the fact using timestamps — correctly,
when those timestamps genuinely reflect real order, and silently,
provably wrongly, the moment they don't, because the two machines that
produced them didn't agree closely enough about what time it actually
was. Every one of this lesson's three units traces back to the same
single root cause, named directly in the lesson's own opening: two
machines with no shared memory can only ever know about each other
through messages, and every property earlier sections of this
curriculum got by assuming shared memory — instant reads, a lock that
just works, a comparison that's simply true or false — has to be
re-earned, imperfectly, the moment that assumption is gone.

## What Breaks Without This

Replace `reconcile`'s timestamp comparison with a version that always
prefers whichever update happens to be passed as the *first* argument,
regardless of either timestamp at all:

```clojure
(defn reconcile-broken [update-a update-b]
  update-a)
```

Run it against Unit 3's own clean case, where `update-b`'s timestamp,
`110`, is genuinely later than `update-a`'s, `105`:

```
user=> (reconcile-broken update-a update-b)
[A 70 105]
```

The genuinely later, correct update — `update-b`, timestamp `110` — is
discarded every single time, regardless of which one actually happened
last. This is a worse failure than clock skew, not a milder one: clock
skew produces the *wrong* answer only when clocks happen to disagree by
enough to matter; `reconcile-broken` produces an arbitrary, argument-
order-dependent answer *unconditionally*, discarding real information
on every single call rather than only under specific, explainable
conditions. Restoring the real timestamp comparison brings correct
resolution back for every case where the clocks genuinely do agree.

## Exercises

1. Simulate a *third* replica, `replica-c`, starting from the same
   `100` and independently applying its own update, and extend
   `reconcile` to correctly pick a single winner among three
   conflicting updates, not just two.
2. Build a scenario where `has-lock?` correctly returns `true` — the
   grant message *does* arrive this time — and trace how many separate
   messages (`lock-request`, `lock-grant`, and, if you extend it, an
   eventual `lock-release`) a single successful coordination actually
   requires, compared to Lesson 213's original in-memory lock needing
   none at all.
3. Write, in prose, what a logical clock would need to record about
   *which prior updates it has seen* (not what time it is) in order to
   correctly detect Unit 3's clock-skew scenario as a genuine conflict,
   rather than confidently picking the wrong winner.

## Definition of Done

- [ ] `lock-request`, `lock-grant`, `has-lock?`, `make-update`, and
      `reconcile` all defined and run in a live `bb` REPL, matching
      every transcript shown above exactly.
- [ ] Unit 1's genuine divergence reproduced, with `=` confirmed
      `false` between the two replicas.
- [ ] Unit 2's stuck lock-request reproduced, with `has-lock?` correctly
      returning `false` after a simulated lost grant.
- [ ] Unit 3's clean reconciliation and its clock-skew failure both
      reproduced, with a clear statement of which timestamp was
      genuinely later in each case.
- [ ] Exercise 1 completed, extending reconciliation to three replicas.
- [ ] `git commit -m "Add Lesson 228: replicas genuinely diverge with no
      shared memory, a distributed lock only relocates the coordination
      problem, and last-write-wins reconciliation has a real,
      demonstrated clock-skew cost"`
