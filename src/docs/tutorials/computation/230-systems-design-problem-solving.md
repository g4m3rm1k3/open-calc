# Lesson 230: Systems Design Problem-Solving

This is Section X's checkpoint lesson — a different format from every
lesson before it, matching the format Lesson 108 established: a
**Challenge**, a real prompt to **attempt it yourself** before reading
further, a **companion implementation** with one real, deliberately
planted mistake, and a **reveal**. No new Clojure construct is
introduced here — every function below reuses tools this section
already built and fully explained — so, per the same convention Lesson
108 used, this lesson carries no Terms/Objects header of its own.

**What this lesson is really testing**: not whether you can write new
code, but whether you can *decompose* a system description into five
specific things — **state** (what data exists and where it lives),
**interface** (what operations are allowed, and their exact shape),
**invariants** (what must always remain true), **failure modes** (what
can concretely go wrong, and how), and **resource constraints** (what's
bounded or limited) — using nothing but the vocabulary Section X spent
twenty-two lessons building: locks, deadlocks, semaphores, atomics,
transactions, indexes, logs, messages, sockets, protocols, distributed
state, and partial failure.

---

## The Challenge

Design a **distributed lock service**: a small, separate system that
lets multiple independent client machines coordinate exclusive access to
named resources (think: "file:notes.txt," "row:account-42") without
ever having those clients share memory directly — everything happens
over the network, using messages.

The service must satisfy these requirements, stated exactly as a real
system's requirements would be:

1. At most one client may hold the lock on any given named resource at
   a time.
2. A client asks for a lock with a `LOCK-REQUEST` message and is told
   `LOCK-GRANTED` or `LOCK-DENIED`.
3. If a client crashes while holding a lock, the lock must eventually
   become available again — the service cannot let one dead client
   block every other client forever.
4. Every message in this system — a request, a grant, a denial, a
   release, a heartbeat — travels over the same kind of unreliable
   channel this section has assumed since Lesson 225: it can be lost,
   and a client that doesn't hear back in time has no way to know
   whether its own request was lost, its response was lost, or the
   server is just slow.

### Attempt It Yourself

Before reading any further, work through this decomposition on your
own, in your own words, using the five categories named above:

- **State**: what does the lock service itself need to remember, and in
  what shape? (Which named resources are currently locked, and by whom;
  what else, if anything, does it need to track to satisfy requirement
  3?)
- **Interface**: what messages does this system need, beyond
  `LOCK-REQUEST`/`LOCK-GRANTED`/`LOCK-DENIED`? What does requirement 3
  imply the service needs to hear from clients on an ongoing basis, not
  just when they want a lock?
- **Invariants**: state requirement 1 as a real, checkable fact about
  the state you just designed — not just "only one holder," but
  specifically what that means about the data structure itself.
- **Failure modes**: using Lesson 229's own vocabulary, name at least
  two genuinely different things that can go wrong with a
  `LOCK-REQUEST` or its response, and what a correctly-built client
  and server each have to do about each one.
- **Resource constraints**: name at least one real, bounded quantity
  this system has to reason about (hint: Lesson 229's own heartbeat
  mechanism has one built directly into it).

Write your own answer before reading the companion implementation
below. The value of this exercise is entirely in doing the
decomposition yourself first — reading the answer before attempting it
teaches nothing beyond what reading already taught.

---

## A Companion Implementation

Here is one real, worked decomposition and implementation. It contains
**one genuine, planted mistake** — not a typo, a real logic error that
produces a wrong result under a specific, realistic scenario this
lesson constructs on purpose. Read it looking for the mistake before
the Reveal section names it.

### State

A `locks` table: a vector of `[resource holder-id]` pairs — reusing
Lesson 221's own row-of-fields convention, with exactly two fields.
Alongside it, a `heartbeat-log`, exactly Lesson 229's own structure: a
vector of `[client-id tick]` pairs, one entry per heartbeat received.

### Interface

Four message types, following Lesson 227's own command-and-payload
convention: `LOCK-REQUEST` (payload: `[resource client-id]`), `RELEASE`
(payload: `[resource client-id]`), `HEARTBEAT` (payload: `[client-id
tick]`), and the server's own responses, `LOCK-GRANTED` and
`LOCK-DENIED`.

### Invariant

At every point, for any specific `resource`, `locks` contains **at
most one** entry whose first field equals that `resource`. This is
Lesson 213's mutual exclusion, restated as a fact about a table instead
of a single boolean.

### The Code

```clojure
(defn resource-locked-by [locks resource index]
  (cond
    (= index (count locks)) -1
    (= (get (get locks index) 0) resource) (get (get locks index) 1)
    true (resource-locked-by locks resource (+ index 1))))

(defn handle-lock-request [locks resource client-id]
  (if (= (resource-locked-by locks resource 0) -1)
    [(assoc locks (count locks) [resource client-id]) "LOCK-GRANTED"]
    [locks "LOCK-DENIED"]))

(defn remove-lock-entry [locks resource index result]
  (cond
    (= index (count locks)) result
    (= (get (get locks index) 0) resource) (remove-lock-entry locks resource (+ index 1) result)
    true (remove-lock-entry locks resource (+ index 1) (assoc result (count result) (get locks index)))))

(defn release-lock [locks resource]
  (remove-lock-entry locks resource 0 []))

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

### Failure Modes Addressed

`resource-locked-by`, `handle-lock-request`, and `release-lock` are
exactly Lesson 214/220/221's own established patterns, reused directly,
satisfying requirement 1 (the invariant). `heartbeat`,
`last-heartbeat-tick`, and `suspected-dead?` are Lesson 229's own
failure detector, unchanged, satisfying requirement 3: a client that
stops sending heartbeats — because it crashed — will eventually be
suspected dead, at which point (not shown above, left as this lesson's
own exercise) the server can call `release-lock` on its behalf, freeing
the resource for someone else, exactly matching Lesson 214's own
closing point that a lock held forever locks everyone out forever.

### Run It — Real Output

```
user=> (def locks0 [])
#'user/locks0
user=> (def r1 (handle-lock-request locks0 "file:notes.txt" "client-A"))
#'user/r1
user=> r1
[[[file:notes.txt client-A]] LOCK-GRANTED]
```

Now simulate exactly the situation this whole section's final sub-arc
was built around: client A's `LOCK-GRANTED` response is lost in
transit — Lesson 225's own message loss, Lesson 229's own partial
failure. Client A, hearing nothing back, has no way to know whether its
request was lost, its grant was lost, or the server is just slow — so,
correctly, it retries the identical request:

```
user=> (def locks1 (get r1 0))
#'user/locks1
user=> (def r2 (handle-lock-request locks1 "file:notes.txt" "client-A"))
#'user/r2
user=> r2
[[[file:notes.txt client-A]] LOCK-DENIED]
```

---

## Reveal

**The bug**: `handle-lock-request` checks only *whether* `resource` is
locked — `(= (resource-locked-by locks resource 0) -1)` — never *by
whom*. When client A's own retry arrives, the resource genuinely *is*
locked — by client A itself, the exact client asking again. The correct
response to that retry is `"LOCK-GRANTED"` again — an idempotent
re-confirmation of a lock this client already, legitimately holds,
exactly the property Lesson 229 spent its entire second unit deriving
as the *only* safe response to this precise ambiguity. Instead,
`handle-lock-request` returns `"LOCK-DENIED"` — telling client A it
cannot have a lock it is, at this very moment, correctly holding. This
is a real, serious bug: a client that retries after an ordinary,
expected lost response is told its own legitimate lock request failed,
and a real caller built to trust that answer might release work it
should be allowed to continue, or treat a healthy lock service as
broken.

This is the identical failure shape as Lesson 229's own "What Breaks
Without This" section — not a crash, not an obviously malformed
response, a plausible-looking wrong answer that only reveals itself
under the exact realistic condition (a lost response, followed by a
correct retry) this whole section's final lessons were built to take
seriously.

### The Fix

```clojure
(defn handle-lock-request-checked [locks resource client-id current-holder]
  (cond
    (= current-holder -1) [(assoc locks (count locks) [resource client-id]) "LOCK-GRANTED"]
    (= current-holder client-id) [locks "LOCK-GRANTED"]
    true [locks "LOCK-DENIED"]))

(defn handle-lock-request-fixed [locks resource client-id]
  (handle-lock-request-checked locks resource client-id (resource-locked-by locks resource 0)))
```

`cond`, reappearing, now checks three cases instead of `if`'s two: the
resource is genuinely free (`-1`) — grant it, exactly as before. The
resource is held, and held by *this exact client* — grant it again,
idempotently, with no new entry added to `locks` at all. Only in the
third case — held by someone else entirely — is `"LOCK-DENIED"` the
correct answer.

```
user=> (def locksA0 [])
user=> (def rA1 (handle-lock-request-fixed locksA0 "file:notes.txt" "client-A"))
#'user/rA1
user=> rA1
[[[file:notes.txt client-A]] LOCK-GRANTED]
user=> (def locksA1 (get rA1 0))
user=> (def rA2 (handle-lock-request-fixed locksA1 "file:notes.txt" "client-A"))
#'user/rA2
user=> rA2
[[[file:notes.txt client-A]] LOCK-GRANTED]
user=> (def rB1 (handle-lock-request-fixed locksA1 "file:notes.txt" "client-B"))
#'user/rB1
user=> rB1
[[[file:notes.txt client-A]] LOCK-DENIED]
```

Client A's retry is now correctly granted, idempotently, with `locks`
unchanged (no duplicate entry). Client B's genuinely *conflicting*
request, from a different client entirely, is still correctly denied —
the invariant (at most one holder per resource) holds throughout, and
the one case that actually needed special handling — a legitimate
self-retry — is now handled correctly instead of silently, plausibly
wrong.

## Definition of Done

- [ ] Completed your own decomposition (state, interface, invariants,
      failure modes, resource constraints) before reading the companion
      implementation.
- [ ] Found the bug — or, if you didn't, traced back through
      `handle-lock-request` a second time after reading the Reveal and
      confirmed, in your own words, exactly which realistic scenario it
      fails on and why.
- [ ] `resource-locked-by`, `handle-lock-request`,
      `handle-lock-request-checked`, `handle-lock-request-fixed`,
      `remove-lock-entry`, `release-lock`, `heartbeat`,
      `last-heartbeat-tick`, and `suspected-dead?` all run in a live
      `bb` REPL, matching every transcript shown above exactly.
- [ ] Written, as your own exercise, the missing piece this lesson
      explicitly left out: a function that scans `locks`, uses
      `suspected-dead?` against `heartbeat-log` to find any lock held
      by a client with no recent heartbeat, and calls `release-lock` on
      its behalf — closing requirement 3 for real.
- [ ] `git commit -m "Add Lesson 230: Section X checkpoint — a
      distributed lock service, decomposed into state, interface,
      invariants, failure modes, and resource constraints, with one
      planted idempotency bug"`
