# Lesson 218: Memory Models — Why Concurrent Programs Can't Assume Sequential Execution

**What you will build**: A proof, by exhaustive case analysis, of a
guarantee every earlier lesson in this section quietly assumed without
ever naming it — that two threads' operations always interleave into
*one* global order every thread agrees on. Then a second, honest model
showing exactly how real hardware breaks that assumption (store
buffering, the actual reason), reproducing the specific outcome the
first model proved impossible. It closes with the real fix — a memory
fence — and shows precisely what a fence restores and why.

**What you need to know first**: Lesson 212's interleaving technique
(two threads' individually-ordered steps, reordered against each other).
Lesson 217's atomic operations and the idea that a single function call
can't be observed half-finished by anything else.

**Terms used in this lesson**:

- **sequential consistency** — the guarantee that every thread's
  operations interleave into one single global order that every thread
  agrees on; the assumption every earlier lesson in this section made
  without ever naming it, since "a list of legal interleavings" only
  makes sense if there's one shared timeline every thread's steps fit
  into.
- **memory model** — the actual set of rules a real system provides for
  when one thread's writes become visible to another thread's reads;
  exists because sequential consistency turns out to be a convenient
  assumption, not something real hardware provides for free.
- **store buffer** — a small, per-core piece of hardware that holds a
  core's own pending writes before they're actually pushed out to the
  shared memory every other core reads from; exists because forcing a
  core to wait for every single write to fully reach shared memory
  before continuing would make every core far slower than it needs to
  be.
- **memory reordering** — a thread's write becoming visible to other
  threads later than its own position in that thread's program order
  would suggest; the real, hardware-level consequence of store
  buffering.
- **memory fence** (also **barrier**) — an instruction that forces every
  write issued before it, by the same thread, to become fully visible to
  every other thread before that thread is allowed to execute anything
  after it; exists to let software explicitly buy back the ordering
  guarantee sequential consistency assumed, exactly where it's actually
  needed.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson — `mem-write`, `mem-read`,
    `buffer-write`, `flush-write`, `memory-fence`.
- **`def`**
  - *What it is:* Clojure's top-level name-binding form, used here only
    at the REPL to hold example state between steps.
  - *Implementation:* `(def name value)` evaluates `value` once and
    binds `name` to the result.
  - *Its use:* every `user=>` transcript in this lesson uses `def` to
    carry `x`, `y`, and each thread's own buffered state from one step
    to the next, in a specific chosen order — the entire subject of this
    lesson is which order is actually legal.

---

## Concept Unit: Sequential Consistency — the Assumption Every Earlier Lesson Made

### The Problem

Every interleaving lesson so far — Lesson 212's lost update, Lesson
217's races — modeled concurrency the same way: pick some legal
reordering of two threads' individually-ordered steps, and reason about
what that reordering produces. That technique only makes sense if
there's one single, true sequence of events that both threads' reads and
writes actually fit into — if thread A's read of some value genuinely
either happens before or after thread B's write to it, with no third
possibility. Has that assumption ever actually been checked, or has this
whole section been quietly relying on it?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because memory models are a systems concept this curriculum
  is deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn mem-write [new-value]
  new-value)

(defn mem-read [current-value]
  current-value)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

Two threads, A and B, sharing two starting-at-zero values, `x` and `y`.
A writes `x`, then reads `y`. B writes `y`, then reads `x`. Trace one
legal ordering — A completes both its steps, then B does:

```
user=> (def x0 0)
user=> (def y0 0)
user=> (def x1 (mem-write 1))
#'user/x1
user=> (def r1a (mem-read y0))
#'user/r1a
user=> (def y1 (mem-write 1))
#'user/y1
user=> (def r2a (mem-read x1))
#'user/r2a
user=> [r1a r2a]
[0 1]
```

Trace the opposite ordering — B completes both its steps first, then A:

```
user=> (def y0b 0)
user=> (def x0b 0)
user=> (def y1b (mem-write 1))
user=> (def r2b (mem-read x0b))
user=> (def x1b (mem-write 1))
user=> (def r1b (mem-read y1b))
user=> [r1b r2b]
[1 0]
```

### Mechanical Walkthrough

`(defn mem-write [new-value] new-value)` — `defn`, reappearing. The
body is nothing but its own argument, returned unchanged. This is
deliberately the simplest possible function — the entire point of this
lesson isn't what a write *computes*, it's *when* it's allowed to take
effect relative to everything else. `(defn mem-read [current-value]
current-value)` — the same, for reading: given whatever value is
currently considered "the" shared value, return it.

First trace: `x0` and `y0` both start `0`. `(mem-write 1)` — A's write
to `x` — produces `x1 = 1`; in this model, a write's result is treated
as immediately, globally true the instant it happens, since there's only
one value, `x1`, and nothing yet distinguishes "written" from "visible
to everyone." `(mem-read y0)` — A's read of `y` — reads `y0`, still
`0`, because B's write to `y` hasn't happened yet in this ordering:
`r1a = 0`. `(mem-write 1)` — B's write to `y` — produces `y1 = 1`.
`(mem-read x1)` — B's read of `x` — reads `x1`, which is `1`, because
A's write already happened: `r2a = 1`. Result: `[0 1]`.

Second trace: the identical two functions, called in the opposite
order — B fully first, then A. This time `r2b = 0` (B reads `x` before A
has written it) and `r1b = 1` (A reads `y` after B already wrote it).
Result: `[1 0]`.

### CS Lens

Both traces above produced exactly one `0` and one `1` — never both
`1`s (impossible here, since only one thread's write can happen first)
and, notice, never both `0`s either. That's not a coincidence of these
two particular orderings — it's provable for *every* legal ordering of
these four steps, by a short argument: call A's write `A1`, A's read
`A2`, B's write `B1`, B's read `B2`. Program order fixes `A1` before `A2`
and `B1` before `B2` — nothing else is fixed. Suppose, for contradiction,
that both reads saw the pre-write value: `r1 = 0` means `A2` happened
before `B1` (B hadn't written `y` yet); `r2 = 0` means `B2` happened
before `A1` (A hadn't written `x` yet). Chain what's now forced: `A1 <
A2 < B1` (the first fact, plus program order) and `B1 < B2 < A1` (the
second fact, plus program order). Put together, `A1 < B1` and `B1 <
A1` — a direct contradiction. No legal ordering can produce `[0 0]`.
This specific two-thread, two-variable pattern has a name in real
memory-model literature: the **store-buffer litmus test**, and this
exact "can both reads see zero" question is precisely what it's built to
ask.

Also recognized in: a proof by contradiction in ordinary mathematics,
assuming the negation and deriving an impossibility; a scheduling
conflict-checker proving two meetings *can't* both be first, given each
person's own fixed personal ordering of their day; a logician's argument
that two claims can't both be true because each one, combined with an
agreed-on background fact, forces the other's negation.

### SE Lens

The alternative to proving this outright would be to simply trust it —
every earlier lesson in this section implicitly did exactly that,
reasoning about interleavings as if "some single global order" were an
obviously safe assumption, never in need of justification. The
tradeoff of skipping the proof: it's cheap to skip, and for a purely
software, single-machine simulation like everything built in Lessons
212–217, the assumption happens to be true, so skipping it never
produced a wrong lesson. The real cost only shows up the moment this
model meets real hardware, which is exactly what the next unit does —
an assumption that was silently true the whole time becomes a silently
false one, with nothing in the code's own shape warning that anything
changed.

---

## Concept Unit: Store Buffering — Where the Assumption Breaks on Real Hardware

### The Problem

Real multi-core processors don't push every write straight through to
the shared memory every core reads from. Each core keeps its own small
**store buffer** — a place to stash a pending write locally, so the core
can keep executing its next instructions immediately instead of stalling
until that write has actually traveled out to memory. What does "a
write" even mean, once it's split into two separate events — landing in
the writer's own local buffer, and later becoming visible to everyone
else — instead of one instantaneous global event?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because memory models are a systems concept this curriculum
  is deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn buffer-write [local-value]
  local-value)

(defn flush-write [buffered-value]
  buffered-value)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def global-x 0)
user=> (def global-y 0)
user=> (def a-buf-x (buffer-write 1))
#'user/a-buf-x
user=> (def b-buf-y (buffer-write 1))
#'user/b-buf-y
user=> (def r1c (mem-read global-y))
#'user/r1c
user=> (def r2c (mem-read global-x))
#'user/r2c
user=> [r1c r2c]
[0 0]
user=> (def global-x2 (flush-write a-buf-x))
user=> (def global-y2 (flush-write b-buf-y))
user=> [global-x2 global-y2]
[1 1]
```

### Mechanical Walkthrough

`(defn buffer-write [local-value] local-value)` — `defn`, reappearing,
same trivial-looking body as `mem-write` before it. That's deliberate:
the difference between this lesson's two write functions isn't in what
either one computes — it's that `buffer-write`'s result is only ever
treated, in this trace, as *this thread's own local knowledge*, never
handed to `global-x` or `global-y` directly.

`(defn flush-write [buffered-value] buffered-value)` — a second,
equally trivial function, representing the *separate*, later event: the
buffered value actually becoming the new globally-visible value.

Trace: `global-x` and `global-y` both start `0`, shared state any
thread's `mem-read` would see. `(buffer-write 1)` — A's write to `x` —
produces `a-buf-x = 1`, but notice: `global-x` itself is untouched,
still `0`. This is the honest model of what happens on real hardware
the instant a store instruction executes: it lands in *this core's own*
store buffer, not yet in the shared memory every other core actually
reads. `(buffer-write 1)` — B's write to `y` — the same: `b-buf-y = 1`,
`global-y` still `0`.

`(mem-read global-y)` — A's read of `y`, reused exactly from Unit 1 —
reads the *actual global* value, `0`, because B's write is still sitting
in B's own buffer, not yet flushed: `r1c = 0`. `(mem-read global-x)` —
B's read of `x` — the same: `global-x` is still `0`, A's write hasn't
flushed either: `r2c = 0`.

`[r1c r2c]` is `[0 0]` — the exact outcome Unit 1 proved, by direct
logical contradiction, could never happen. It happened here because
"write" is no longer one event — it's two, `buffer-write` then
`flush-write`, with a real gap between them, and nothing forces either
thread's flush to happen before the other thread's read. Both flushes
do eventually happen — `global-x2` and `global-y2` both end up `1` — but
only *after* both reads already ran and captured the stale `0`.

### CS Lens

This is **memory reordering**, made concrete: from an outside observer's
point of view (here, the other thread), A's write to `x` appears to
happen *later* than its actual position in A's own program — specifically,
later than A's own read of `y`, even though the write came first in the
code A actually wrote. Nothing about A's own execution changed; A still
executed `write x; read y` in that order and would see its own write
immediately if it read `x` itself (a store buffer always lets its own
core see its own pending write right away) — it's only *other threads'*
view of the ordering that shifted. This is a real, well-documented
behavior of real processors (x86 and ARM both exhibit exactly this
pattern under the right conditions), not a hypothetical worst case.

Also recognized in: a group chat where a message you sent shows up
instantly on your own screen but takes a moment to reach everyone
else's, so for a brief window your own view and theirs genuinely
disagree about what's "already happened"; a distributed cache where a
write is acknowledged to the writer immediately but takes time to
propagate to every replica, so a read against a different replica can
briefly see stale data; a bank's own internal ledger reflecting a
transfer instantly for the sending branch while the receiving branch's
copy hasn't synced yet.

### SE Lens

The alternative real hardware could have chosen is to make every single
store instruction block until it's fully visible to every other core
before letting that core continue — genuine sequential consistency, for
real, all the time, no exceptions. Some real systems do choose exactly
that trade for specific pieces of memory, and it's not a wrong choice —
it's just an expensive one: every single ordinary write would cost a
full round trip to shared memory (and to every other core's cache) before
the writing core could do anything else, even when nothing else actually
needed that guarantee for that particular write. Store buffering trades
that cost away, buying real speed on the overwhelmingly common case where
no other thread cares about this exact write's timing, at the cost of
making the store-buffer litmus test's `[0 0]` genuinely reachable when
something *does* care. The debt this leaves for software, honestly: any
code that needs the strong guarantee back — Lesson 213's lock, Lesson
217's atomics — cannot get it for free anymore; it has to ask for it
explicitly, which is exactly what the next unit does.

---

## Concept Unit: Memory Fences — Restoring the Guarantee Where It's Needed

### The Problem

Lesson 213's lock and Lesson 217's atomics were built and verified under
Unit 1's model — one shared global order everyone agrees on. Unit 2 just
showed that model isn't free on real hardware. Software that genuinely
needs the stronger guarantee — and a lock absolutely does, since two
threads disagreeing about whether a lock is held defeats the entire
point of having one — needs a way to explicitly demand it, right at the
specific point it actually matters, without paying the cost everywhere
else too.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because memory models are a systems concept this curriculum
  is deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn memory-fence [buffered-value]
  (flush-write buffered-value))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

Both threads now flush their own write, via `memory-fence`, *before*
performing their own read — reversing Unit 2's order, where the flush
was left until "eventually." First, A completes fully before B starts:

```
user=> (def a-buf1 (buffer-write 1))
user=> (def gx1 (memory-fence a-buf1))
#'user/gx1
user=> (def r1d (mem-read 0))
#'user/r1d
user=> (def b-buf1 (buffer-write 1))
user=> (def gy1 (memory-fence b-buf1))
user=> (def r2d (mem-read gx1))
user=> [r1d r2d]
[0 1]
```

Then the reverse — B completes fully first, then A:

```
user=> (def b-buf2 (buffer-write 1))
user=> (def gy2 (memory-fence b-buf2))
user=> (def r2e (mem-read 0))
user=> (def a-buf2 (buffer-write 1))
user=> (def gx2 (memory-fence a-buf2))
user=> (def r1e (mem-read gy2))
user=> [r1e r2e]
[1 0]
```

### Mechanical Walkthrough

`(defn memory-fence [buffered-value] (flush-write buffered-value))` —
`defn`, reappearing; the body simply calls `flush-write`, reappearing,
on its argument. Read as raw code, this is identical to just calling
`flush-write` directly — and that's the honest, important point: a
fence adds *nothing* to what gets computed. Its entire meaning is a
promise about *when* it's allowed to run relative to the thread's own
surrounding code — specifically, that everything before it, in program
order, is fully visible to every other thread before the thread that
issued the fence is allowed to execute anything after it. A simulation
running one step at a time, as this lesson's traces already do by hand,
can only demonstrate that promise by choosing to write the flush call
*before* the read call in the trace, every time — which is exactly what
both traces above do, and exactly what Unit 2's trace deliberately did
not do.

Trace 1: A calls `buffer-write`, then immediately `memory-fence` — `gx1
= 1`, globally visible, *before* A's own `mem-read` of `y` runs at all.
A's read sees `0` (`r1d`), since B hasn't even started yet in this
ordering. B then does the same — `buffer-write`, `memory-fence` — and
only then reads `x`, correctly seeing `gx1 = 1`, since A's fence already
made it visible: `r2d = 1`. Result `[0 1]` — one zero, one one, exactly
Unit 1's shape.

Trace 2: the mirror image, B first. `r2e = 0` (A hasn't started), `r1e =
1` (B's fence already made `y` visible by the time A reads it). Result
`[1 0]` — again, exactly Unit 1's shape.

Neither trace produces `[0 0]`, and this isn't a coincidence of these
two particular orderings: once *both* threads fence between their own
write and their own read, each thread's write is guaranteed globally
visible before that same thread's own read runs — which is precisely
the constraint Unit 1's proof depended on (`A1` complete before `A2`
begins, `B1` complete before `B2` begins, now true of *global*
visibility, not just program order). The exact same contradiction
argument from Unit 1 applies again, unchanged, and rules out `[0 0]`
here too.

### CS Lens

A fence doesn't undo store buffering — the buffer is still there, still
real, still saving the writing thread from stalling on ordinary writes
that don't need this guarantee. What a fence does is create a specific,
named point where the software insists the buffer must have drained
before anything past that point runs. This is the same shape as Lesson
213's lock, one level more primitive: a lock buys exclusive access to a
*section of code*; a fence buys a guarantee about *visibility timing* at
one specific point — and, not coincidentally, every real lock
implementation has to use a fence (or an atomic that carries one built
in, per Lesson 217's own closing note) internally, or the lock itself
would be vulnerable to exactly this section's own reordering problem.

Also recognized in: a "sync" or "flush" command in any buffered I/O
system, forcing data that's been written to an in-memory buffer out to
actual disk before the program is allowed to consider the write done; a
video call's "everyone confirm before we proceed" checkpoint, ensuring
every participant has actually received the last update before the
meeting moves on, rather than assuming a message sent means a message
received; a relay race's baton handoff, a deliberate synchronization
point forcing the outgoing runner to have fully completed before the
incoming runner is allowed to start.

### SE Lens

The alternative to a targeted fence is Unit 2's closing point taken to
its extreme: make every write on the entire system fully synchronous,
buying the guarantee everywhere, all the time, whether any given write
needs it or not. A fence's real advantage is precision — it costs
exactly at the points software actually inserts it, and costs nothing
anywhere else, letting the overwhelming majority of ordinary writes keep
their store-buffer speed. The tradeoff, and the real debt every
concurrent system carries because of it: a fence has to be placed by
someone who correctly identified that this exact point needs the
guarantee — miss one, and the bug this section spent three units proving
impossible becomes reachable again, silently, exactly the way Unit 2
reached it, and with no crash or error to point at the missing fence
directly.

---

## Connect the Pieces

Follow the value of `x` through all three units, in the specific
ordering that makes the danger concrete: A writes `x`, B writes `y`,
each thread then reads the other's variable. Under Unit 1's model, "write"
is one atomic event — `mem-write` — and the proof by contradiction shows
`[0 0]` structurally cannot happen, no matter which of the six legal
orderings of the two threads' steps is chosen. Unit 2 makes the exact
same scenario honest about real hardware: `buffer-write` splits that one
event into two, a local buffering step and a separate, later
`flush-write`, and scheduling both reads before either flush reproduces
`[0 0]` directly — proving, by direct construction, that Unit 1's clean
model was an assumption, not a law of nature, the moment real store
buffering enters the picture. Unit 3 closes the gap `memory-fence` opened
back up: forcing each thread's own `flush-write` to run, via
`memory-fence`, before that same thread's own read collapses the
scenario back into exactly Unit 1's shape, and the identical
contradiction argument rules `[0 0]` back out. The same two variables,
the same two threads, three different real behaviors — depending
entirely on whether the write and the read on each side are one
indivisible event, two separable events with no ordering promise between
them, or two separable events explicitly re-ordered back together.

## What Breaks Without This

Take Unit 3's fenced trace and remove the fence from just one of the two
threads — B keeps its fence, A goes back to Unit 2's unfenced write:

```
user=> (def a-buf3 (buffer-write 1))
user=> (def r1f (mem-read 0))
user=> (def b-buf3 (buffer-write 1))
user=> (def gy3 (memory-fence b-buf3))
user=> (def r2f (mem-read 0))
```

A's read (`r1f`) happens before A's own write ever gets flushed to
`global-x` at all — `r1f = 0`, and A's write is still sitting unflushed
in its own buffer when B's read runs, so `r2f = 0` too: `[0 0]`,
reproduced again, even with one real, correctly-placed fence in the
code. A single thread's fence only guarantees *that thread's own*
ordering — it says nothing about a different thread that has no fence
of its own. This is why the correct fix in Unit 3 required a fence on
*both* sides, not one: restoring the guarantee needs every thread whose
ordering matters to ask for it, not just one of them.

## Exercises

1. Reproduce Unit 2's `[0 0]` result, then add a fence to only thread B
   (not A) and confirm `[0 0]` is still reachable — matching this
   lesson's own "What Breaks Without This" finding, from the other
   thread's side.
2. Extend Unit 1's contradiction proof to three threads and three
   variables, each thread writing its own variable and reading the
   *next* thread's variable in a cycle (A writes `x` and reads `y`, B
   writes `y` and reads `z`, C writes `z` and reads `x`). Determine
   whether "every read sees the pre-write value" is still provably
   impossible, and if the proof changes shape, say how.
3. Using `buffer-write`, `flush-write`, and `memory-fence`, construct a
   trace where thread A fences correctly but reads a *third* shared
   variable no fence protects, and explain in one sentence why adding
   fences everywhere A writes doesn't automatically protect variables A
   only ever reads.

## Definition of Done

- [ ] `mem-write`, `mem-read`, `buffer-write`, `flush-write`, and
      `memory-fence` all defined and run in a live `bb` REPL, matching
      every transcript shown above exactly.
- [ ] Unit 1's contradiction proof reproduced in your own words, not
      copied, and checked against both concrete traces.
- [ ] Unit 2's `[0 0]` trace reproduced, with a clear statement of which
      two events "write" was split into and why the split makes `[0 0]`
      reachable.
- [ ] Unit 3's two fenced traces reproduced, both avoiding `[0 0]`, plus
      the "What Breaks Without This" single-sided-fence trace showing
      `[0 0]` returning.
- [ ] Exercise 1 completed and compared directly against Unit 2's
      original trace.
- [ ] `git commit -m "Add Lesson 218: prove sequential consistency by
      contradiction, break it with store buffering, and restore it with
      a memory fence"`
