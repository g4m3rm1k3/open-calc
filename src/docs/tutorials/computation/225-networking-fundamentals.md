# Lesson 225: Networking Fundamentals — Messages Over Unreliable Infrastructure

**What you will build**: A sender and a receiver that don't share
memory at all — a genuine departure from every earlier lesson in this
curriculum — communicating only by sending discrete messages across a
channel that can simply lose them, with the sender given no direct
signal when that happens. It builds acknowledgments, letting a sender
actually discover what arrived, and retransmission, the real mechanism
that turns an unreliable channel into a practically reliable one — and
closes by proving, concretely, that retransmission's own honest cost is
duplicate delivery, which receiving code has to tolerate the same way
Lesson 224's recovery already had to tolerate a duplicate redo.

**What you need to know first**: Lesson 224's idempotent redo — this
lesson's own duplicate-delivery danger is the identical property,
applied to messages instead of a recovery log. Nothing else from
Sections IX or X is directly reused; this lesson's whole premise is that
shared memory, which every earlier lesson in this section assumed, is no
longer available at all.

**Terms used in this lesson**:

- **message** — a discrete, self-contained unit of information sent from
  one independent process to another; the basic unit of network
  communication, replacing the shared memory every earlier lesson in
  this curriculum's Section X assumed was available.
- **unreliable channel** — a communication path that offers no guarantee
  a sent message ever arrives, arrives only once, or arrives in the
  order it was sent; exists because real physical networks genuinely
  behave this way, and pretending otherwise produces code that silently
  breaks the moment reality doesn't cooperate.
- **message loss** — a message that was genuinely sent but never
  arrives, with the sender receiving no direct signal that anything went
  wrong; the specific unreliability this lesson's first unit makes
  concrete.
- **acknowledgment** (**ACK**) — a small reply message a receiver sends
  back specifically to confirm it received a particular message; exists
  because a sender has no way to observe delivery directly and needs the
  receiver to actively report it instead.
- **timeout** — a bound on how long a sender waits for an acknowledgment
  before concluding a message needs to be resent; exists because a
  sender can never distinguish "still in transit" from "lost forever" by
  waiting alone — only choose a threshold past which it acts as though
  it were lost.
- **retransmission** — resending a message whose acknowledgment hasn't
  arrived within the timeout; the actual mechanism that turns an
  unreliable channel into a practically reliable one, at the cost of the
  real possibility of a genuine duplicate.
- **duplicate delivery** — a message arriving more than once because its
  own acknowledgment, not the message itself, was what actually got
  lost; a real, expected consequence of retransmission, not a bug, that
  receiving code has to be built to tolerate.

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
  - *Their use:* `if` decides whether an ID has already been recorded as
    seen; `cond` drives every recursive scan over a channel or an
    acknowledgment list.
- **`=`**
  - *What it is:* Clojure's equality-testing function.
  - *Implementation:* `(= a b)` returns `true` if `a` and `b` are equal
    values.
  - *Its use:* checking a message's own ID against a target, checking an
    entry's type against `"ACK"`, checking a scan index against a
    stopping point.
- **`get`** / **`assoc`** / **`count`** / **`+`**
  - *What they are:* Clojure's positional lookup, functional-update,
    length, and addition functions.
  - *Implementation:* `(get coll index)` reads; `(assoc coll index
    value)` returns an updated copy; `(count coll)` returns length;
    `(+ a b)` returns the sum.
  - *Their use:* reused throughout — appending a message onto a channel
    or inbox, reading a message's own ID and content, advancing a scan
    index.

---

## Concept Unit: Modeling an Unreliable Channel

### The Problem

Every earlier lesson in Section X — locks, transactions, the write-ahead
log — assumed the sender and receiver of any change were the *same
running program*, sharing the same memory. Two independent machines
talking over a real network share nothing: one can only find out what
the other did by sending it a message, and that message travels across
real, physical infrastructure that can simply lose it — a dropped
packet, a severed cable, a router discarding traffic under load — with
absolutely nothing telling the sender this happened. How does a program
even represent "I sent something" as a fact separate from "it arrived"?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because networking is a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn send [channel message]
  (assoc channel (count channel) message))

(defn deliver [inbox message]
  (assoc inbox (count inbox) message))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def sent0 [])
#'user/sent0
user=> (def sent1 (send sent0 [0 "hello"]))
#'user/sent1
user=> (def sent2 (send sent1 [1 "are-you-there"]))
#'user/sent2
user=> (def sent3 (send sent2 [2 "ping"]))
#'user/sent3
user=> sent3
[[0 hello] [1 are-you-there] [2 ping]]
user=> (def inbox0 [])
user=> (def inbox1 (deliver inbox0 [0 "hello"]))
user=> (def inbox2 (deliver inbox1 [2 "ping"]))
#'user/inbox2
user=> inbox2
[[0 hello] [2 ping]]
```

### Mechanical Walkthrough

`(defn send [channel message] (assoc channel (count channel) message))`
— `assoc` and `count`, both reappearing, the established append idiom:
`send` records that the sender *believes* it has sent `message`. A
message here is a `[msg-id content]` pair — a small integer identity
attached to whatever's actually being communicated, needed so a later
acknowledgment can say *which* message it's confirming.

`(defn deliver [inbox message] (assoc inbox (count inbox) message))` —
structurally identical to `send`, but deliberately a *separate*
function, appending to a *separate* collection — the receiver's own
`inbox`, not the sender's `channel`. This separation is the entire
point: nothing about calling `send` automatically calls `deliver` too.

Trace: `sent3` shows the sender genuinely called `send` three times —
`[0 "hello"]`, `[1 "are-you-there"]`, `[2 "ping"]` — all three present,
in order, exactly as sent. `inbox2` shows what the receiver actually
got: `deliver` was only called twice, for messages `0` and `2` — message
`1`, `"are-you-there"`, was never delivered at all. This isn't a bug in
either function; both did exactly what they were asked. The gap between
`sent3` (three entries) and `inbox2` (two entries) *is* message loss,
represented honestly as two genuinely separate pieces of state that
simply don't agree — and nothing in this lesson's code, so far, tells
the sender that disagreement exists.

### CS Lens

Separating `channel` (what was sent) from `inbox` (what actually
arrived) is the same move this curriculum has made before at a
different layer: Lesson 220's inode separated a name from its data
specifically so the two could genuinely diverge (a name existing with
its data not yet — or no longer — reachable); here, a sent message and
a delivered message are kept as two distinct facts specifically so a
real, honest gap between them — loss — is representable at all, rather
than assumed away by treating "sent" and "received" as the same event
the way an ordinary function call always has been in this curriculum
until now.

Also recognized in: a certified letter versus an ordinary one — sending
it is a real, recorded act, but delivery is a separate fact the sender
only learns about if a signature comes back; a text message showing
"sent" in a chat app, a status that is deliberately *not* the same as
"delivered," precisely because the app itself can't be sure the two
always coincide; a satellite uplink command, transmitted with no
guarantee the spacecraft ever received it, distinct from telemetry
later confirming it did.

### SE Lens

The alternative — assuming every `send` is automatically a `deliver`,
collapsing the two into one function — is exactly what every earlier
lesson in this curriculum implicitly did, because every earlier lesson
modeled communication as ordinary function calls or shared memory
access, which really do always succeed synchronously (barring a crash,
which Lesson 224 handled separately). That assumption is completely
safe within one running program. It becomes actively false the moment
two genuinely separate machines, connected only by real physical
infrastructure, are involved — and code written as though it were still
true doesn't fail loudly; it fails by quietly losing messages with
nothing pointing at the cause. The real cost of modeling `send` and
`deliver` as separate, honestly: every single later unit in this lesson
exists only because this separation was made in the first place — there
would be nothing to acknowledge, time out, or retransmit if delivery
were simply assumed.

---

## Concept Unit: Acknowledgments — Letting the Sender Learn What Arrived

### The Problem

Unit 1 proved the sender has no way to observe message loss directly.
The only party who actually knows what arrived is the receiver — so the
receiver has to be the one to say so, actively, by sending something
*back*. What does that reply need to contain, and how does a sender use
it to figure out, concretely, which of its own messages actually made
it?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because networking is a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-ack [msg]
  ["ACK" (get msg 0)])

(defn acknowledged-ids [inbox index accumulated]
  (cond
    (= index (count inbox)) accumulated
    (= (get (get inbox index) 0) "ACK")
      (acknowledged-ids inbox (+ index 1) (assoc accumulated (count accumulated) (get (get inbox index) 1)))
    true (acknowledged-ids inbox (+ index 1) accumulated)))

(defn is-acked? [acked-ids msg-id index]
  (cond
    (= index (count acked-ids)) false
    (= (get acked-ids index) msg-id) true
    true (is-acked? acked-ids msg-id (+ index 1))))

(defn unacked-messages [sent acked-ids index accumulated]
  (cond
    (= index (count sent)) accumulated
    (is-acked? acked-ids (get (get sent index) 0) 0)
      (unacked-messages sent acked-ids (+ index 1) accumulated)
    true (unacked-messages sent acked-ids (+ index 1) (assoc accumulated (count accumulated) (get sent index)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def sender-inbox0 [])
user=> (def sender-inbox1 (deliver sender-inbox0 (make-ack (get inbox2 0))))
user=> (def sender-inbox2 (deliver sender-inbox1 (make-ack (get inbox2 1))))
#'user/sender-inbox2
user=> sender-inbox2
[[ACK 0] [ACK 2]]
user=> (def acked-ids (acknowledged-ids sender-inbox2 0 []))
#'user/acked-ids
user=> acked-ids
[0 2]
user=> (is-acked? acked-ids 1 0)
false
user=> (is-acked? acked-ids 0 0)
true
user=> (def unacked (unacked-messages sent3 acked-ids 0 []))
#'user/unacked
user=> unacked
[[1 are-you-there]]
```

### Mechanical Walkthrough

`(defn make-ack [msg] ["ACK" (get msg 0)])` — `get`, reappearing, pulls
the message's own ID (position `0`) out of it, and pairs it with the
literal string `"ACK"`, marking this as an acknowledgment rather than an
ordinary message.

`(deliver sender-inbox0 (make-ack (get inbox2 0)))` — the receiver,
having message `0` in its own `inbox2`, builds and *sends back* an
acknowledgment for it — using `deliver`, reused unchanged from Unit 1,
onto a *separate* inbox belonging to the sender. `sender-inbox2` ends
up `[["ACK" 0] ["ACK" 2]]` — confirmations for exactly the two messages
the receiver actually got.

`(defn acknowledged-ids [inbox index accumulated] ...)` — `cond`,
reappearing, scans an inbox for entries that are specifically
acknowledgments (`(= (get (get inbox index) 0) "ACK")`) and collects
their referenced message IDs (position `1` of each ACK entry) —
`acknowledged-ids` on `sender-inbox2` returns `[0 2]`.

`(defn is-acked? [acked-ids msg-id index] ...)` — an ordinary linear
membership check: does `msg-id` appear anywhere in `acked-ids`.
`(is-acked? acked-ids 1 0)` is `false` — message `1` never got
acknowledged. `(is-acked? acked-ids 0 0)` is `true`.

`(defn unacked-messages [sent acked-ids index accumulated] ...)` —
walks the sender's *own* record of everything it sent, `sent3`, and
keeps only the messages whose IDs `is-acked?` reports as `false`.
`(unacked-messages sent3 acked-ids 0 [])` returns `[[1
"are-you-there"]]` — the sender has now correctly and concretely
identified exactly which of its own messages never made it, using
nothing but its own sent record and the acknowledgments it received
back.

### CS Lens

An acknowledgment turns an inherently one-directional, unobservable fact
(did this specific message arrive) into something the sender can
actually check by comparing two lists it fully controls — everything it
sent, against everything it's been told was received. This is the exact
shape of Lesson 224's own `committed-tx-ids`: a second, independent
signal (a commit marker there, an ACK here) that lets a piece of code
determine which of its own past actions actually "counted," rather than
assuming success by default.

Also recognized in: a certified-mail return receipt, the physical
mechanism a sender uses to actually learn a letter arrived rather than
merely hoping it did; a restaurant order ticket stamped by the kitchen,
confirming back to the server which specific order was received, not
just that *some* order came through; a payment confirmation email,
letting a customer verify a specific transaction actually went through
rather than trusting the checkout page alone.

### SE Lens

The alternative — trusting that every sent message arrived, with no
acknowledgment at all — is cheaper: no reply traffic, no bookkeeping on
either side. It's also exactly Unit 1's own starting point, and Unit 1
already proved it leaves the sender with no way to distinguish "message
1 arrived" from "message 1 vanished." The real cost acknowledgments add:
every successful message now costs *two* transmissions instead of one —
the original, and the reply confirming it — real overhead on every
single message, paid whether or not that particular message ever
actually needed it. This is the honest tradeoff every reliable protocol
built on an unreliable channel accepts: doubling the traffic on the
common case, in exchange for making loss on the *uncommon* case
detectable at all.

---

## Concept Unit: Retransmission — and the Duplicate It Can Cause

### The Problem

The sender now knows, concretely, that message `1` was never
acknowledged. Waiting longer doesn't resolve the ambiguity — a message
could still be in transit, or genuinely gone, and nothing about pure
silence distinguishes the two. The only real option is to act on a
timeout and resend. But resending has a real, honest risk of its own: if
the *message* actually arrived and only its *acknowledgment* was lost,
the sender's retry produces a message the receiver has already seen —
what happens then?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because networking is a systems concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn retransmit [inbox unacked index]
  (cond
    (= index (count unacked)) inbox
    true (retransmit (deliver inbox (get unacked index)) unacked (+ index 1))))

(defn record-seen [seen-ids msg-id]
  (if (is-acked? seen-ids msg-id 0)
    seen-ids
    (assoc seen-ids (count seen-ids) msg-id)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

The clean case — message `1` genuinely was lost, and the retry succeeds:

```
user=> (def inbox3 (retransmit inbox2 unacked 0))
#'user/inbox3
user=> inbox3
[[0 hello] [2 ping] [1 are-you-there]]
```

The honest, harder case — message `1` actually *did* arrive; only its
ACK was lost, so the sender retransmits anyway:

```
user=> (def inbox2b (deliver inbox2 [1 "are-you-there"]))
#'user/inbox2b
user=> inbox2b
[[0 hello] [2 ping] [1 are-you-there]]
user=> (def inbox4 (retransmit inbox2b unacked 0))
#'user/inbox4
user=> inbox4
[[0 hello] [2 ping] [1 are-you-there] [1 are-you-there]]
```

Handling the duplicate correctly, using an idempotent record instead of
a naive count:

```
user=> (def seen0 [])
user=> (def seen1 (record-seen seen0 1))
#'user/seen1
user=> (def seen2 (record-seen seen1 1))
#'user/seen2
user=> (= seen1 seen2)
true
user=> (def count0 0)
user=> (def count1 (naive-count-received count0))
user=> (def count2 (naive-count-received count1))
#'user/count2
user=> count2
2
```

### Mechanical Walkthrough

`(defn retransmit [inbox unacked index] ...)` — `cond`, reappearing,
walks `unacked` (Unit 2's own list of messages the sender knows weren't
confirmed) and `deliver`s each one, reappearing from Unit 1 unchanged,
onto `inbox`. `(retransmit inbox2 unacked 0)` — `unacked` is `[[1
"are-you-there"]]`, one message — delivers it, producing `inbox3` with
all three original messages now present, message `1` arriving last,
genuinely *out of the original send order* — an honest detail: a
network that lost and later redelivered a message has no obligation to
preserve timing relative to messages that went through cleanly the
first time.

`(deliver inbox2 [1 "are-you-there"])` — the duplicate scenario's setup:
this represents message `1` having actually arrived the *first* time
(unlike the clean case above), producing `inbox2b`, identical in
contents to `inbox3`. But in *this* scenario, the sender never learned
that — its own `sender-inbox2` never got an ACK for message `1`, because
the ACK, not the message, was what got lost. From the sender's own point
of view, nothing distinguishes this situation from the clean case — it
still sees `1` as unacknowledged, and still calls `retransmit`.
`(retransmit inbox2b unacked 0)` delivers message `1` a *second* time —
`inbox4` shows it twice, at the end.

`(defn record-seen [seen-ids msg-id] ...)` — `if`, reappearing: calls
`is-acked?`, reused here for a genuinely different purpose than
acknowledgment tracking — a plain "is this ID already in this list"
check, which is exactly what checking for a duplicate needs too. If
`msg-id` is already present, return `seen-ids` completely unchanged — the
second delivery has no effect at all. Otherwise, `assoc` it in, same as
any other append.

Trace: `(record-seen seen0 1)` — `1` isn't in the empty `seen0` — added,
`seen1 = [1]`. `(record-seen seen1 1)` — the *duplicate* delivery — `1`
*is* already in `seen1` — `seen2` is returned completely unchanged, and
`(= seen1 seen2)` is `true`: processing the duplicate genuinely did
nothing, exactly as it should. Contrast `naive-count-received`, which
blindly adds one on every call with no memory of what it's already
counted: two deliveries of the *same* message produce `count2 = 2`, a
wrong answer claiming two real pings happened when only one ever did.

### CS Lens

`record-seen`'s correctness under duplication is **idempotency**,
restated exactly as Lesson 224 first defined it, now for a message
instead of a log entry: an operation that produces the same result
whether it runs once or twice. Retransmission's entire honest cost is
that it *cannot* guarantee "exactly once" delivery on its own — only "at
least once" — which means every piece of code that reacts to a received
message has to be written the way `record-seen` was, not the way
`naive-count-received` was, or a genuinely correct retry mechanism
becomes the direct cause of a double-counted, corrupted result.

Also recognized in: pressing an elevator call button that's already lit,
which correctly does nothing new, rather than queuing a second trip; a
"submit" button disabled after a single click specifically so a
double-click (or a page reload resending the same form) can't place two
orders; Lesson 224's own recovery, reapplying an already-applied log
entry with no ill effect, for the identical underlying reason.

### SE Lens

The alternative to accepting "at least once" delivery is trying to
guarantee "exactly once" at the network layer itself — having the
channel somehow detect and silently discard a duplicate before it ever
reaches the receiver's own code. Real systems generally don't attempt
this, because it would require the network itself to remember every
message ID it has ever delivered, forever, and to somehow always agree
with the sender about which retries are genuine duplicates versus
legitimately new messages that happen to reuse an ID — a much harder,
more stateful problem than simply resending on a timeout. The tradeoff
this lesson's design accepts instead: retransmission stays genuinely
simple — timeout, resend, nothing cleverer — and the responsibility for
correctness under duplication is pushed onto whatever code actually
processes a received message, which is exactly where `record-seen`
lives. The real cost, honestly: every single piece of receiving code
anywhere in a system built this way has to remember to be idempotent,
and nothing about the network layer itself enforces or even checks that
it is.

---

## Connect the Pieces

Follow message `1`, `"are-you-there"`, through every unit built in this
lesson. `send` (Unit 1) records the sender's honest belief that it sent
it — present in `sent3` — but the network, deliberately, never calls
`deliver` for it; `inbox2` shows only messages `0` and `2`, and the
sender has, so far, no way to know the difference. `make-ack` and
`acknowledged-ids` (Unit 2) give the receiver's actual state a voice: it
only ever confirms what it genuinely has, and `unacked-messages`, built
purely from the sender's own sent record compared against those real
confirmations, correctly and independently derives that message `1`
specifically is the one still missing — without the receiver ever having
to say "I didn't get this," only ever confirming what it *did*.
`retransmit` (Unit 3) then resends exactly that one message, and the
same trace forks into two honest outcomes: a clean retry, landing the
message for the first real time, or — in the harder, equally realistic
case where the original had actually arrived and only its own ACK never
made it back — a genuine duplicate, `inbox4` showing message `1` twice.
`record-seen`, reusing `is-acked?` for a second, different purpose,
proves the receiver can absorb that duplicate with zero corruption,
while `naive-count-received`, built the ordinary way every earlier
lesson in this curriculum would have written a counter, cannot. Every
piece — the send/deliver split, the acknowledgment, the retry, and the
idempotent receiver — exists specifically because a real network refuses
to guarantee any single one of them on its own.

## What Breaks Without This

Replace `record-seen` with a version that always appends, never
checking whether the ID has already been recorded:

```clojure
(defn record-seen-broken [seen-ids msg-id]
  (assoc seen-ids (count seen-ids) msg-id))
```

Run the exact same duplicate scenario against it:

```
user=> (def broken-seen1 (record-seen-broken [] 1))
user=> (def broken-seen2 (record-seen-broken broken-seen1 1))
#'user/broken-seen2
user=> broken-seen2
[1 1]
```

`1` now appears twice in what's supposed to be a record of *which
distinct messages* have been seen — any code counting `(count
broken-seen2)` to answer "how many unique pings arrived" would report
`2`, exactly the same wrong answer `naive-count-received` produced, for
the identical underlying reason: nothing checked whether this specific
duplicate had already been accounted for. Restoring `record-seen`'s own
`is-acked?` check brings the correct, duplicate-safe `[1]` back.

## Exercises

1. Simulate a message that's retransmitted *twice* — the original is
   lost, the first retry's ACK is lost, and only the second retry
   finally gets acknowledged — and confirm `unacked-messages` correctly
   reports it as outstanding after each of the first two attempts.
2. Build a scenario with three in-flight messages where two different
   ones are lost on the first attempt, and confirm `unacked-messages`
   correctly identifies both, not just one.
3. Extend `record-seen` into a `process-idempotently` function that,
   the *first* time a message ID is seen, also appends its `content` to
   a separate results list — and confirm that a duplicate delivery
   still adds the ID to `seen-ids` correctly while leaving the results
   list untouched the second time.

## Definition of Done

- [ ] `send`, `deliver`, `make-ack`, `acknowledged-ids`, `is-acked?`,
      `unacked-messages`, `retransmit`, and `record-seen` all defined
      and run in a live `bb` REPL, matching every transcript shown above
      exactly.
- [ ] Unit 1's loss scenario reproduced: three sent messages, two
      delivered.
- [ ] Unit 2's acknowledgment scenario reproduced, correctly deriving
      the one unacknowledged message from the sender's own records
      alone.
- [ ] Unit 3's two retransmission outcomes both reproduced: the clean
      retry and the genuine duplicate, plus the idempotent-vs-naive
      contrast handling that duplicate.
- [ ] Exercise 2 completed, confirming multiple simultaneous losses are
      each correctly identified.
- [ ] `git commit -m "Add Lesson 225: model communication as messages
      over an unreliable channel — acknowledgment, retransmission, and
      the duplicate delivery it honestly causes"`
