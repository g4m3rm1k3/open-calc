# Lesson 212: Race Conditions

- **What you will build** — a real, simulated interleaving of two
  threads incrementing one shared counter, proving directly that a
  perfectly reasonable ordering can silently lose an update; every one
  of the six legal interleavings run and counted, showing that only two
  of them — the two where neither thread interrupts the other — produce
  the correct answer; and a demonstration that a well-intentioned "check
  before you act" fix doesn't actually solve anything, because the check
  and the act are still two separate, interruptible steps. The
  transferable problem: Lesson 209 proved two threads can see the same
  shared memory and closed by showing one thread's assumption about a
  value can go stale without warning. This lesson makes that concrete —
  not "a value might be different than expected," but a precise,
  countable demonstration of exactly how often, and exactly why.
- **What you need to know first** — shared memory between threads
  (Lesson 209); `read-byte`, `write-byte` (Lesson 191); combinations and
  counting orderings under a constraint (Lesson 62); `cons`, structural
  recursion (Section II).
- **Terms introduced in this lesson**
  - **race condition** — a real, standard term: a program's correctness
    depending on the precise timing or order of operations across more
    than one thread, when it shouldn't have to.
  - **interleaving** — one specific, legal ordering of two or more
    threads' individual operations, respecting each thread's own
    internal order but otherwise mixing freely with the others'.
  - **critical section** — a sequence of operations (here, read-compute-
    write) that has to run as if it were a single, uninterruptible step
    for the result to stay correct.
  - **lost update** — the real, named failure this lesson's own first
    unit demonstrates directly: two threads both increment a shared
    value, and the net result reflects only one of the two increments.
- **Objects and methods used**: None new. This lesson reuses `read-byte`,
  `write-byte` (Lesson 191), `[...]`, `get` (Section V), `cond`, `if`,
  `=`, `+`, `cons`, `empty?`, `first`, `rest` (already covered).

---

## Concept Unit: One Bad Interleaving

### The Problem

`x = x + 1` looks like one step in source code. It never is, at the
hardware level this whole section has built: it's a read, then a
computation, then a write — three separate operations, each one capable
of being interrupted by something else in between.

### Introduce the Concept in Isolation

Skipped — this unit's functions compose only already-covered `read-byte`,
`write-byte`, and `cond`; the real content is what happens when two
threads' own read-compute-write sequences interleave, shown directly
below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 209's shared-memory work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Each thread's own read captures a value into its own private slot —
never touching the other thread's — and each thread's own write uses
*only* its own captured value, exactly the way real hardware genuinely
separates a private register from shared memory:

```clojure
(defn apply-op
  [state address op]
  (cond
    (= op "A-read") [(get state 0) (read-byte (get state 0) address) (get state 2)]
    (= op "A-write") [(write-byte (get state 0) address (+ (get state 1) 1)) (get state 1) (get state 2)]
    (= op "B-read") [(get state 0) (get state 1) (read-byte (get state 0) address)]
    (= op "B-write") [(write-byte (get state 0) address (+ (get state 2) 1)) (get state 1) (get state 2)]
    true state))
```

### The Updated Project

Running a whole sequence of operations, in whatever order they're given,
and reporting the final value at the shared address:

```clojure
(defn run-interleaving
  [state address ops]
  (if (empty? ops)
    (read-byte (get state 0) address)
    (run-interleaving (apply-op state address (first ops)) address (rest ops))))
```

### Mechanical Walkthrough

Enumerating `apply-op`'s body: `state` as `[memory temp-a temp-b]` —
**(a) first appearance**: `temp-a` and `temp-b` are each thread's own
private "just read this" slot — the register-versus-memory distinction
Lesson 209 already established, made concrete here as exactly two
values that never leak into each other. Each `cond` branch touching only
its own thread's temp slot and the shared `memory` — **(c) already
basic** individually, composing into the actual point of this unit:
neither thread's write ever reads the *other* thread's temp value,
only its own.

`run-interleaving`'s body — **(b) a hard concept reappearing**:
accumulator recursion, threading `state` through a list of operations.

Trace two different, both individually legal, interleavings — starting
`memory = [0]`, `state = [memory 0 0]`:

```
Interleaving 1 — fully sequential, A completes before B starts:
  A-read:  temp-a = 0
  A-write: memory = [1]           (0 + 1)
  B-read:  temp-b = 1
  B-write: memory = [2]           (1 + 1)
  → final value: 2                CORRECT

Interleaving 2 — B's read lands between A's read and A's write:
  A-read:  temp-a = 0
  B-read:  temp-b = 0             (memory hasn't changed yet)
  A-write: memory = [1]           (0 + 1)
  B-write: memory = [1]           (0 + 1 — B never saw A's write!)
  → final value: 1                WRONG
```

Both threads genuinely incremented the counter. The correct final answer
is `2`. Interleaving `2` produces `1` — B's own read happened before A's
write, so B's own increment was computed from a value that was already
stale by the time B actually wrote it, silently discarding A's
contribution entirely. **This is called a lost update.**

### CS Lens

A shared value's correctness depending on the precise order two threads'
operations happen to interleave in is the single most foundational
concurrency bug, not a rare edge case.

```
Also recognized in: literally the most famous, most commonly taught
concurrency bug in computer science, the "lost update" specifically and
race conditions generally; real, documented production bugs across
decades of concurrent software, many traced to exactly this pattern; and
Lesson 209's own closing section, whose entire "what breaks"
demonstration was a preview of precisely this unit's own second
interleaving
```

### SE Lens

Trusting that `x = x + 1` is simple enough to "just work," because it
reads as one line of source code, was the available assumption — and
this unit's own trace disproves it directly and concretely. The real
cost of that trust is exactly interleaving `2`'s own result: a
completely silent, completely plausible-looking wrong answer, with
nothing in either thread's own code announcing that anything went
wrong. This is precisely why this entire section built `fetch`/`decode`/
`execute` as genuinely separate phases (Lesson 197) and threads sharing
memory as a real, structural fact (Lesson 209) — neither one was ever
just background detail; both were the exact preconditions this lesson's
own bug depends on.

---

## Concept Unit: Every Possible Interleaving, Counted

### The Problem

One bad interleaving proves the danger is real. It doesn't say how
*likely* it is. Given two threads, each doing one read and one write, in
their own fixed internal order, how many distinct legal interleavings
are even possible — and how many of them are actually wrong?

### Introduce the Concept in Isolation

Skipped — this unit runs already-covered functions against a small,
explicitly listed set of orderings; the real content is the complete
enumeration itself, shown directly below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `run-interleaving`.
- **Dependencies**: Babashka, already installed.

### The New Code

Every legal interleaving of `A-read`, `A-write`, `B-read`, `B-write` —
respecting that each thread's own read must come before its own write,
the same constraint Lesson 62's own combinations work already reasoned
about for choosing positions under a rule:

```clojure
(defn all-interleavings
  []
  (list
    (list "A-read" "A-write" "B-read" "B-write")
    (list "A-read" "B-read" "A-write" "B-write")
    (list "A-read" "B-read" "B-write" "A-write")
    (list "B-read" "A-read" "A-write" "B-write")
    (list "B-read" "A-read" "B-write" "A-write")
    (list "B-read" "B-write" "A-read" "A-write")))
```

### The Updated Project

Running every one of them, fresh, and collecting the results:

```clojure
(defn run-all-interleavings
  [interleavings]
  (if (empty? interleavings)
    (list)
    (cons (run-interleaving [(make-memory 1) 0 0] 0 (first interleavings)) (run-all-interleavings (rest interleavings)))))
```

```clojure
(defn count-correct
  [results expected]
  (if (empty? results)
    0
    (+ (if (= (first results) expected) 1 0) (count-correct (rest results) expected))))
```

### Mechanical Walkthrough

`all-interleavings`'s body — **(a) first appearance**: exactly six
orderings, matching `4` operations with `2` positions reserved for
`A`'s own two (in their fixed relative order) — the identical counting
question Lesson 62's combinations already answered, `C(4,2) = 6`, here
listed out explicitly rather than computed.

`run-all-interleavings`'s and `count-correct`'s bodies — **(b) a hard
concept reappearing**: accumulator recursion over a list, building up a
result and a running count respectively.

Trace `run-all-interleavings` against all six, and `count-correct`
against the results:

```
run-all-interleavings (all-interleavings)
  → (2 1 1 1 1 2)

count-correct (2 1 1 1 1 2) 2 → 2
```

Two correct out of six — exactly the two interleavings where neither
thread's read-write pair was ever interrupted by the other thread at
all. The other four — anything where one thread's read lands before the
other thread's write completes — all produce the identical wrong answer,
`1`. This isn't a rare, unlucky edge case: two-thirds of every legal way
these four operations could interleave give the wrong result.

### CS Lens

Systematically enumerating every possible interleaving and checking each
one is a real, legitimate verification technique, not just a teaching
device.

```
Also recognized in: real formal-verification and model-checking tools
for concurrent programs, which perform exactly this kind of exhaustive
interleaving enumeration at a much larger, automated scale; and Lesson
62's own combinations work, now paying off directly — counting how many
ways one sequence's operations can be positioned relative to another's,
under a fixed-order constraint, is exactly the same question this unit
had to answer to know there were six interleavings to check in the
first place
```

### SE Lens

Simply running a concurrent program a few times and checking whether the
answer looks right — testing for a race condition rather than proving
its absence — is the available, and extremely common, alternative. This
unit's own numbers cut both ways on that: in *this* small example, most
random runs would actually surface the bug, since four of six
interleavings are wrong. The real, honest danger testing poses is the
opposite case — a race that only manifests in one interleaving out of
many thousands, which casual testing can miss for a very long time,
right up until it doesn't. Exhaustive enumeration, built in this unit,
scales badly by hand but is exactly the principle real automated tools
apply at scale, specifically because "it worked when I ran it" is never
proof a race isn't there.

---

## Concept Unit: The Critical Section

### The Problem

Both bad and good interleavings ran the exact same four operations —
only their *order* differed. What, precisely, is it about certain
orderings that makes them dangerous?

### Introduce the Concept in Isolation

Skipped — this unit pairs already-covered data; nothing syntactic is
new.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `count-correct`.
- **Dependencies**: Babashka, already installed.

### The New Code

Pairing each interleaving with its own outcome, to see the pattern
directly:

```clojure
(defn label-results
  [interleavings results]
  (if (empty? interleavings)
    (list)
    (cons [(first interleavings) (first results)] (label-results (rest interleavings) (rest results)))))
```

### The Updated Project

Skipped — no enclosing file exists yet; a standalone call combining this
lesson's own already-built pieces at the `bb` REPL.

### Mechanical Walkthrough

`label-results`'s body — **(b) a hard concept reappearing**: the same
parallel-recursion-over-two-lists shape used throughout this curriculum
whenever two already-computed sequences need to be paired up.

Look at the two *correct* interleavings side by side with their own
operation order:

```
("A-read" "A-write" "B-read" "B-write") → 2
("B-read" "B-write" "A-read" "A-write") → 2
```

In both, one thread's `read` and its own `write` sit *immediately*
adjacent — nothing from the other thread ever runs in between. That
adjacent read-then-write span is a **critical section**: a sequence that
has to execute as if it were one indivisible step for the result to
stay correct. Every wrong interleaving in this lesson's own list has
exactly one thing in common: something from the *other* thread ran
somewhere inside one thread's own critical section, breaking the
assumption that nothing else could see or touch the value in between.

### CS Lens

A sequence of operations that must run as an uninterruptible unit for
correctness, and the real name for it, recur throughout concurrent
systems far beyond this lesson's own toy counter.

```
Also recognized in: the real, standard terms "critical section" and
"atomicity," used identically in real concurrency literature and real
production system design; real hardware atomic instructions — CPUs
provide dedicated instructions guaranteeing true, uninterruptible read-
modify-write for specific operations, a real fix this section's own
upcoming Section X material on atomics builds toward directly; and the
general, recurring theme that something looking like one step in source
code is not the same guarantee as it actually being one step in
hardware — the identical gap Lesson 205's undefined behavior work
already exploited, now causing trouble for a different reason
```

### SE Lens

Avoiding shared, mutable state entirely — having each thread compute its
own independent partial result and combining them only once, safely, at
the very end — is a real, legitimate alternative this curriculum has
already been practicing the whole time, restated directly from Lesson
209's own closing insight: no interleaving of purely independent
computations can ever produce a wrong answer, because there's no shared
mutable value for interleaving order to matter to at all. When shared
mutable state genuinely can't be avoided — this lesson's own counter is
a deliberately minimal, honest example of exactly that case — the real
fix is making the critical section actually behave like one
indivisible step, which is precisely what a lock does, the direct
subject of the very next lesson.

---

## Connect the Pieces

Follow one shared counter through every idea this lesson built.
`apply-op` and `run-interleaving`, run against interleaving `2`,
concretely lose one of two genuine increments — the final value is `1`,
not `2`, entirely because `B`'s read landed inside `A`'s own critical
section. `all-interleavings`, `run-all-interleavings`, and
`count-correct` extend that single example into a complete, exhaustive
proof: only two of six legal orderings — the two where each thread's own
read-write pair stays uninterrupted — produce the correct answer.
`label-results` makes the actual pattern visible directly: every correct
outcome corresponds to a critical section nothing else ever interrupted;
every wrong one corresponds to a critical section something else ran
inside of. Nothing about any individual operation — a single `read-byte`
or `write-byte` call — was ever wrong. The failure exists entirely in
the *order* they were allowed to run in.

## What Breaks Without This

A tempting first fix: check the value *before* writing, and only write
if it still matches what was expected — surely that catches the problem?

```clojure
(defn naive-checked-increment
  [memory address expected]
  (if (= (read-byte memory address) expected)
    (write-byte memory address (+ expected 1))
    memory))
```

Trace what happens if this function's own `if`-check and its own
`write-byte` call — still two separate steps, exactly the same shape as
the original problem — get interrupted between them: Thread `A` calls
`naive-checked-increment memory 0 0`. It reads address `0`, gets `0`,
confirms `0 = 0`, and is about to write `1` — but is interrupted right
there, before the write actually happens. Thread `B` now calls
`naive-checked-increment memory 0 0` — reads address `0`, still `0` (`A`
never got to write), confirms `0 = 0`, and *does* write: `memory`
becomes `[1]`. Thread `A` now resumes exactly where it left off — its
own check already passed, using its own already-captured `expected = 0`
— and writes `(+ 0 1)`, `1`, overwriting `B`'s legitimate update with the
identical value `B` had already correctly written. Two increments still
happened; the final value is still `1`, not `2` — the exact same lost
update as before. `naive-checked-increment`'s own check didn't fail; it
succeeded, honestly, for both threads — the danger was never in the
check being wrong, it was in the check and the write still being two
separate, interruptible operations, the identical structural flaw this
whole lesson has been demonstrating from its very first unit. This
specific shape — checking a condition, then acting on it, with a real
gap in between where the condition can silently stop being true — is a
real, well-documented pattern in its own right, sometimes called a
"time-of-check to time-of-use" bug. A genuine fix needs the check and
the write to happen as one true, uninterruptible step — not a more
careful version of checking first.

## Exercises

1. Trace `run-interleaving` by hand for interleaving `3`,
   `("A-read" "B-read" "B-write" "A-write")`, and confirm it also
   produces `1`, matching this lesson's own reported result.
2. Using `all-interleavings` and `label-results`, identify, without
   running any code, which of the six interleavings you'd expect to be
   correct *before* checking — based purely on this lesson's own
   critical-section explanation — and then confirm against the actual
   results.
3. Sketch, in prose, how three threads, each incrementing the same
   counter once, would multiply the number of legal interleavings to
   check, and state whether you'd expect the *fraction* of correct
   interleavings to go up or down compared to two threads. No code
   required yet.

## Definition of Done

- [ ] `apply-op` and `run-interleaving` are written and hand-traced for
      both interleaving `1` and interleaving `2`, matching `2` and `1`.
- [ ] `all-interleavings`, `run-all-interleavings`, and `count-correct`
      are written and hand-traced, matching exactly `2` correct out of
      `6`.
- [ ] `label-results` is written and used to confirm which two
      interleavings are the correct ones, and that both share the
      "read-write never interrupted" property.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why `naive-checked-increment`'s own check
      succeeding for both threads is exactly the problem, not a
      reassurance.
- [ ] Commit with a message explaining *why* checking a condition and
      acting on it must be one atomic step, not just *what* functions
      were added.
