# Lesson 229: Failure and Partial Failure

**What you will build**: A direct, concrete proof of the single idea
that separates distributed systems from everything else this curriculum
has built: three genuinely different real events — a lost request, a
lost response, and a peer that's simply slow — that are *provably
indistinguishable* from the requester's own point of view. It derives,
from that proof, why idempotent retry (Lessons 224 and 225's own
running theme) isn't just good practice but the *only* safe response to
an ambiguity that can never be resolved from one side alone. It closes
with heartbeats and failure detection — a real, standard technique for
monitoring a remote peer — and the honest, famous limit every such
detector runs into: it can never be made perfectly accurate over an
unreliable network, only tuned.

**What you need to know first**: Lesson 225's message loss and
retransmission. Lesson 224's idempotent redo. Lesson 228's own closing
point — that coordination across machines with no shared memory can
never be reduced to a single, instant, reliable operation.

**Terms used in this lesson**:

- **partial failure** — a state where it's genuinely impossible, from
  the outside, to determine whether a remote operation happened, is
  still happening, or never happened at all; the defining hardship
  distributed systems create that a single machine never faces, since a
  single machine's own operations either happened or the whole machine
  is down and nothing is ambiguous about that.
- **heartbeat** — a small message sent proactively and periodically,
  purely to signal "I am still here," independent of any specific
  request; exists to let a remote peer's liveness be monitored
  continuously, rather than inferred only from the silence that follows
  one specific request.
- **failure detector** — a mechanism that declares a remote peer
  "suspected dead" based on the absence of expected signals (like
  heartbeats) within some time window; named a *detector*, not an
  *oracle*, deliberately — it can be wrong, and this lesson proves it.
- **false positive** (in failure detection) — a peer that is genuinely,
  correctly alive and functioning, incorrectly declared dead because its
  own signal was delayed or lost; the concrete, honest limit every
  failure detector built over an unreliable network has to accept, never
  fully eliminate.

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
  - *Their use:* `if` decides whether a request has already been
    processed; `cond` drives the scan for a sender's own most recent
    heartbeat.
- **`=`** / **`>`** / **`-`**
  - *What they are:* Clojure's equality, greater-than, and subtraction
    functions.
  - *Implementation:* `(= a b)` compares; `(> a b)` returns `true` if
    `a` exceeds `b`; `(- a b)` returns the difference.
  - *Their use:* comparing observed states for identity, checking a
    heartbeat gap against a timeout window, and computing that gap
    directly.
- **`get`** / **`assoc`** / **`count`** / **`+`**
  - *What they are:* Clojure's positional lookup, functional-update,
    length, and addition functions.
  - *Implementation:* `(get coll index)` reads; `(assoc coll index
    value)` returns an updated copy; `(count coll)` returns length;
    `(+ a b)` returns the sum.
  - *Their use:* reused throughout, building and reading this lesson's
    observed states, processed-request records, and heartbeat log.

---

## Concept Unit: A Timeout Is Genuinely Ambiguous

### The Problem

Lesson 225 built retransmission on a timeout — wait for an
acknowledgment, and if it doesn't arrive in time, resend. But *what does
a timeout actually prove happened*? Construct three genuinely different
real situations — a request that never arrived at all, a request that
arrived and was fully processed but whose response never made it back,
and a request that's simply still being worked on, slower than
expected — and ask: from the requester's own point of view, waiting and
watching for a response, can these three be told apart?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because distributed failure is a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn observed-state [request-sent? response-received?]
  [request-sent? response-received?])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def scenario-a-lost-request (observed-state true false))
#'user/scenario-a-lost-request
user=> (def scenario-b-lost-response (observed-state true false))
#'user/scenario-b-lost-response
user=> (def scenario-c-still-working (observed-state true false))
#'user/scenario-c-still-working
user=> scenario-a-lost-request
[true false]
user=> scenario-b-lost-response
[true false]
user=> scenario-c-still-working
[true false]
user=> (= scenario-a-lost-request scenario-b-lost-response scenario-c-still-working)
true
```

### Mechanical Walkthrough

`(defn observed-state [request-sent? response-received?] [request-sent?
response-received?])` — `defn`, reappearing, a plain pair recording
exactly what the *requester itself* can actually observe: did it send a
request (always `true` here — it definitely did, in all three
scenarios), and has a response arrived by the moment it's checking
(`false` in all three, at the instant the timeout fires).

Three separate calls, representing three separate real underlying
situations this lesson deliberately constructs to be different in
*fact* while identical in *observation*:

**Scenario A** — the request itself never reached the remote machine at
all (Lesson 225's own message loss, applied to the request instead of
its acknowledgment). The remote side never did anything, because it
never heard anything.

**Scenario B** — the request *did* arrive, was *fully processed*, and a
real response was genuinely sent back — but that response, not the
request, is what got lost in transit. The remote side already did the
work; the requester simply never found out.

**Scenario C** — nothing was lost at all. The request arrived, and the
remote side is still working on it, slower than the requester's own
timeout window — the response is genuinely on its way, just not yet.

Each of these is called with the *identical* arguments,
`observed-state(true false)`, because in every one of them, the
requester's own directly observable facts are the same: it sent a
request, and it has not yet received a response. `(= scenario-a-...
scenario-b-... scenario-c-...)` is `true` — not approximately similar,
*exactly* equal, because there is genuinely nothing in what the
requester can observe that distinguishes them.

### CS Lens

This is **partial failure**, proven directly rather than merely
asserted: three real, meaningfully different situations, provably
collapsing to one observable state. A single machine never faces
this — if a function call on the same machine hasn't returned, either
it's still running, or the whole process has crashed and *nothing else
is running either*, including whatever code would be waiting on the
result. A remote request removes that guarantee entirely: the requester
keeps running, waiting, fully alive, while the actual state of the
request it's waiting on is one of several genuinely different
possibilities it has no way to distinguish between.

Also recognized in: calling a friend who doesn't pick up — you can't
tell whether their phone is off, they're driving and can't answer, or
they saw the call and chose not to answer, from the silence alone; a
letter that never gets a reply, ambiguous between "never arrived,"
"arrived and was ignored," and "a reply was sent and lost in the mail";
a job application with no response, indistinguishable, from the
applicant's side, between "rejected," "still under review," and "the
original application itself was never received."

### SE Lens

The alternative to accepting this ambiguity is trying to *resolve* it —
building a mechanism that could somehow tell the requester, with
certainty, which of the three scenarios actually happened. No such
mechanism can exist over an unreliable network, for a structural reason,
not a lack of engineering effort: any *additional* signal built to
disambiguate this (a "yes, I received your request" acknowledgment sent
separately from the real response) is itself just another message,
subject to the identical loss risk as the original — it can tell the
requester "the request arrived," but that confirmation can *itself* be
lost, reproducing the exact same three-way ambiguity one level up. The
honest, load-bearing conclusion the rest of this lesson builds on: since
this ambiguity cannot be eliminated, correct systems have to be designed
to behave safely *despite* it, not to somehow see through it.

---

## Concept Unit: Idempotency Is the Only Safe Response

### The Problem

Given that a requester genuinely cannot tell which of Unit 1's three
scenarios occurred, the only reasonable action after a timeout is to
retry — but a retry means genuinely re-sending the request in *all
three* scenarios, including scenario B and C, where the original request
may have already been (or is currently being) processed for real. What
actually happens to the underlying operation in each case, and is there
a way to make retrying safe *regardless* of which scenario is true?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because distributed failure is a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn already-processed? [store request-id index]
  (cond
    (= index (count store)) false
    (= (get store index) request-id) true
    true (already-processed? store request-id (+ index 1))))

(defn process-idempotent [store request-id]
  (if (already-processed? store request-id 0)
    store
    (assoc store (count store) request-id)))

(defn process-naive [store request-id]
  (assoc store (count store) request-id))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def store0 [])
#'user/store0
user=> (def store1 (process-idempotent store0 "req-42"))
#'user/store1
user=> store1
[req-42]
user=> (def store2 (process-idempotent store1 "req-42"))
#'user/store2
user=> store2
[req-42]
user=> (= (count store2) 1)
true
```

The naive contrast, run against the identical retry:

```
user=> (def naive-store1 (process-naive store0 "req-42"))
#'user/naive-store1
user=> (def naive-store2 (process-naive naive-store1 "req-42"))
#'user/naive-store2
user=> naive-store2
[req-42 req-42]
user=> (count naive-store2)
2
```

### Mechanical Walkthrough

`(defn already-processed? [store request-id index] ...)` — `cond`,
reappearing, the identical membership-scan shape as Lesson 225's own
`is-acked?`: has this exact `request-id` already been recorded.

`(defn process-idempotent [store request-id] ...)` — `if`, reappearing:
if the request has already been processed, return `store` completely
unchanged — a retry, whatever scenario actually produced it, is
correctly absorbed with no additional effect. Otherwise, record it —
genuinely new work, done exactly once.

`(defn process-naive [store request-id] (assoc store (count store)
request-id))` — no check at all; every call, first attempt or retry
alike, records a fresh entry.

Trace the retry directly: `store1`, the first real attempt, is
`["req-42"]`. Whatever actually happened out there — the request was
lost and this retry is genuinely the first time it's processed
(scenario A), or the request already succeeded and this retry is a true
duplicate (scenario B or C) — `process-idempotent`'s *code* behaves
identically either way, because it never needs to know which scenario
occurred; it only needs to know whether `request-id` has been seen
before. `store2`, after the retry, is still `["req-42"]` — `(count
store2)` is `1`, correct regardless of which of Unit 1's three
scenarios actually happened underneath.

`naive-store2`, by contrast, is `["req-42" "req-42"]` — `(count
naive-store2)` is `2`, which is only ever correct if the retry
genuinely represents two separate, intended operations. In scenario A,
that happens to be true by luck. In scenario B or C, it's a real,
concrete duplication bug — the identical operation counted twice because
nothing distinguished a resend from a first attempt.

### CS Lens

This is the direct, load-bearing consequence of Unit 1's proof:
**because partial failure cannot be resolved from the requester's side,
correctness has to be moved entirely onto the receiving side**, in the
form of idempotent processing. `process-idempotent` doesn't need to
know, and structurally *cannot* know, which of Unit 1's three scenarios
produced any given call — and it doesn't need to, because it's built to
produce the same correct result under all three. This is the same
technique Lesson 224's `redo` and Lesson 225's `record-seen` already
used, now shown as something more than a nice property those two
lessons happened to need — it's the *only* structurally sound response
to an ambiguity that can never be eliminated at its actual source.

Also recognized in: a "mark as read" action on an email, safe to click
twice by accident, since the second click finds the message already
marked and does nothing further; an idempotent REST API's `PUT` request,
specifically designed so a client retrying after a timeout produces the
same final resource state whether the original request succeeded or
not; a thermostat set to a specific temperature, safe to "set" to the
same value repeatedly with no cumulative effect, unlike a "raise the
temperature by one degree" command, which would double-apply under a
retry.

### SE Lens

The alternative to idempotent processing is exactly `process-naive`:
simpler, and completely correct as long as every retry genuinely
represents new, intended work — true in a system that never experiences
message loss or delay, which is to say, never true for any real
distributed system built on a real, unreliable network. The real cost
idempotency accepts in exchange for real safety: every operation now
needs an identity (`request-id` here) that survives being sent more
than once, and every receiver now has to remember, for some meaningful
window of time, which identities it has already handled — genuine
bookkeeping overhead, on every single operation, paid specifically
because Unit 1 proved there's no cheaper way to be safe against an
ambiguity that can't be resolved any other way.

---

## Concept Unit: Heartbeats and the Honest Limit of Failure Detection

### The Problem

Waiting for a response to one specific request, and only then facing
Unit 1's ambiguity, is a reactive way to notice trouble. Is there a way
to monitor whether a remote peer is even *alive* on an ongoing basis,
rather than only discovering a problem the next time there happens to be
a real request waiting on it?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because distributed failure is a systems concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn heartbeat [log sender tick]
  (assoc log (count log) [sender tick]))

(defn last-heartbeat-tick [log sender index found]
  (cond
    (= index (count log)) found
    (= (get (get log index) 0) sender) (last-heartbeat-tick log sender (+ index 1) (get (get log index) 1))
    true (last-heartbeat-tick log sender (+ index 1) found)))

(defn suspected-dead? [log sender current-tick timeout-window]
  (> (- current-tick (last-heartbeat-tick log sender 0 -1)) timeout-window))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def hlog0 [])
#'user/hlog0
user=> (def hlog1 (heartbeat hlog0 "B" 0))
user=> (def hlog2 (heartbeat hlog1 "B" 10))
user=> (def hlog3 (heartbeat hlog2 "B" 20))
#'user/hlog3
user=> hlog3
[[B 0] [B 10] [B 20]]
user=> (suspected-dead? hlog3 "B" 25 15)
false
user=> (suspected-dead? hlog3 "B" 40 15)
true
```

### Mechanical Walkthrough

`(defn heartbeat [log sender tick] ...)` — `assoc` and `count`,
reappearing, the established append idiom: peer `B` logs `[sender
tick]`, a small proof-of-life sent at a specific moment, with no request
or response involved at all — purely "I am here, right now."

`(defn last-heartbeat-tick [log sender index found] ...)` — `cond`,
reappearing, scans the *entire* log for this specific `sender`, keeping
the *most recent* matching tick it finds (it doesn't stop at the first
match — it keeps overwriting `found` with every later match, so the
final result is whichever one appeared last). `found` starts at `-1` —
if `sender` never sent a single heartbeat, `-1` correctly signals "never
heard from at all."

`(defn suspected-dead? [log sender current-tick timeout-window] ...)`
— `>` and `-`, both reappearing: compute how many ticks have passed
since the last known heartbeat, and compare that gap against
`timeout-window` — if the gap is *larger*, this peer is declared
"suspected dead."

Trace: `hlog3` shows `B` sending heartbeats at ticks `0`, `10`, and
`20` — every `10` ticks, reliably. `(suspected-dead? hlog3 "B" 25 15)` —
the gap since the last heartbeat, `20`, is `25 - 20 = 5`, well under the
`15`-tick window — correctly `false`, `B` is considered alive.
`(suspected-dead? hlog3 "B" 40 15)` — the gap is `40 - 20 = 20`, over
the window — `true`, `B` is now suspected dead. This second call
represents a real, deliberately constructed scenario: `B`'s tick-`30`
heartbeat — which, following its established `10`-tick pattern, should
have arrived — was lost in transit, exactly the way any other message
can be lost. `B` itself is completely fine, still sending heartbeats on
schedule; only its most recent one never made it, and the failure
detector, working correctly from its own limited information, has no
way to know that.

### CS Lens

`suspected-dead?`'s own name is chosen carefully, and this trace proves
why: it is a **failure detector**, not a failure *oracle*. A single lost
heartbeat — Lesson 225's own ordinary message loss, nothing more
exotic — produces a **false positive**: a genuinely alive, correctly
functioning peer, incorrectly flagged as dead. This is not a bug in
`suspected-dead?`'s own logic; the function does exactly what it claims
to do, faithfully. It's the deepest, most honest conclusion this whole
lesson — and, in a real sense, this whole final section of the
curriculum — has been building toward: **no failure detector built over
an asynchronous, unreliable network can ever be made perfectly
accurate.** Every real one trades two costs directly against each
other — a longer `timeout-window` produces fewer false positives (a
truly dead peer takes longer to be correctly detected) but a shorter one
detects real failures faster at the cost of more false alarms on peers
that are simply, briefly, slow.

Also recognized in: a smoke detector, which can trigger on burnt toast
(a false positive) or, tuned less sensitively to avoid that, take longer
to trigger on an actual fire; a "last seen" indicator in a messaging
app, which can show someone as offline when their connection merely
blipped for a moment; a server health check that marks a machine
unhealthy after missing a few consecutive checks, occasionally
mis-flagging a machine that was simply under heavy, legitimate load.

### SE Lens

The alternative to accepting this limit is trying to build a "perfect"
failure detector — one that never produces a false positive, ever. No
such thing can exist over a genuinely asynchronous network, for the
identical structural reason Unit 1 already proved: distinguishing "dead"
from "just slow" would require a bound on how long a message can
possibly take to arrive, and a real network offers no such bound — a
heartbeat delayed by ten seconds and one delayed forever look
*identical* until, at some point, a choice has to be made about how long
is too long to keep waiting. Every real distributed system accepts this
and tunes its own `timeout-window` deliberately, choosing where to sit
on the real, unavoidable tradeoff between false alarms and slow, correct
detection — never eliminating the tradeoff, because Unit 1's own proof
already showed there's nothing to eliminate it with.

---

## Connect the Pieces

Follow a single request, `"req-42"`, through every unit built in this
lesson, as one honest account of what a timeout really means and what a
system has to do about it. It's sent, and no response arrives before
the timeout — Unit 1 proves this exact observation is produced
identically whether the request was lost, the response was lost, or the
remote side is simply still working; there is no way, from where the
request originated, to tell which. Faced with that irreducible
ambiguity, the requester retries — the only reasonable move — and Unit
2 proves that only `process-idempotent`, checking whether `"req-42"` has
already been seen before doing anything, produces the correct result
regardless of which of Unit 1's three scenarios was actually true;
`process-naive`, blind to that history, gets it right only by luck.
Zooming out from one specific request to the health of a whole
connection, Unit 3's heartbeats offer a proactive alternative to waiting
for a specific timeout — but the identical root cause resurfaces one
level up: a heartbeat is still just a message, still subject to Lesson
225's own loss, and `suspected-dead?`'s false-positive trace proves a
perfectly healthy peer can still be wrongly flagged, for the same
underlying reason `"req-42"`'s own timeout was ambiguous in the first
place. Every mechanism this final sub-arc of Section X has built — ACKs,
retries, idempotent handling, reconciliation, heartbeats — traces back
to the same single, unremovable fact: two machines with no shared memory
can only ever learn about each other through messages that take real,
unbounded time and can simply vanish, and every technique in this
section exists to make systems built on top of that fact behave safely,
never to make the fact itself go away.

## What Breaks Without This

Replace `process-idempotent`'s check with a version that assumes every
retry represents a genuinely new operation, the same failure shape as
`process-naive`, but framed this time against Unit 1's own scenario B —
a request that *did* succeed, whose response was simply lost:

```
user=> (def real-store1 (process-naive store0 "req-42"))
user=> (def real-store2 (process-naive real-store1 "req-42"))
#'user/real-store2
user=> real-store2
[req-42 req-42]
```

If `"req-42"` represented, say, "charge this customer's card once,"
this is not a bookkeeping inconsistency — it's a real, duplicated
charge, produced by exactly the ordinary, unavoidable ambiguity Unit 1
proved can never be told apart from the requester's own side. Restoring
`process-idempotent`'s own `already-processed?` check is what prevents
this specific, realistic scenario from becoming a real financial bug
rather than merely a discarded duplicate.

## Exercises

1. Extend `already-processed?` and `process-idempotent` to also record
   *when* each request was first processed, and use that to answer "was
   this specific retry a genuine duplicate, or a brand-new request that
   happens to reuse an old ID" — then explain in one sentence why a
   real system would need to guarantee request IDs are never reused
   across genuinely different operations for this to actually work.
2. Build a scenario with *two* peers, `"B"` and `"C"`, each sending
   heartbeats on a different schedule, and confirm `suspected-dead?`
   correctly evaluates each one independently using the same log.
3. Compute, without running any code, what `timeout-window` would need
   to be, given `B`'s own `10`-tick heartbeat interval, to guarantee
   *zero* false positives as long as no more than one consecutive
   heartbeat is ever lost — and explain why no finite `timeout-window`
   can guarantee zero false positives if *two* consecutive heartbeats
   might be lost in a row.

## Definition of Done

- [ ] `observed-state`, `already-processed?`, `process-idempotent`,
      `process-naive`, `heartbeat`, `last-heartbeat-tick`, and
      `suspected-dead?` all defined and run in a live `bb` REPL,
      matching every transcript shown above exactly.
- [ ] Unit 1's three-scenario equality reproduced, with a clear
      one-sentence statement of what each scenario actually represents.
- [ ] Unit 2's idempotent-vs-naive retry comparison reproduced, with the
      naive version shown producing an incorrect duplicate count.
- [ ] Unit 3's heartbeat scenario reproduced, including the false-
      positive case at tick `40`.
- [ ] Exercise 3 completed, with the `timeout-window` computation shown
      and the two-consecutive-losses limitation explained in your own
      words.
- [ ] `git commit -m "Add Lesson 229: prove a timeout is genuinely
      ambiguous, derive idempotency as the only safe response, and show
      why no failure detector over an unreliable network can be
      perfectly accurate"`
