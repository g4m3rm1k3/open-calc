# Lesson 213: Locks and Mutual Exclusion

- **What you will build** — `lock-acquire` and `lock-release`, the
  simplest real synchronization primitive; a proof that a correctly
  locked critical section, called twice, always produces the correct
  result regardless of ordering — the direct, working fix for Lesson
  212's own lost update; and the honest, deeper problem underneath it
  all: `lock-acquire` itself is a read-then-write, and if it isn't
  genuinely atomic, the exact same race condition reappears one level
  down, inside the very mechanism meant to prevent it. The transferable
  problem: Lesson 212 proved a critical section needs to run as if it
  were one indivisible step. This lesson builds the real primitive that
  makes that true — and takes seriously the fact that the primitive
  itself has to earn that guarantee from somewhere.
- **What you need to know first** — race conditions, interleavings,
  critical sections, lost updates (Lesson 212); `read-byte`,
  `write-byte` (Lesson 191); function composition (Lesson 5).
- **Terms introduced in this lesson**
  - **lock** — a shared value used to guarantee only one thread is ever
    inside a given critical section at a time.
  - **mutual exclusion** — the real, standard property a lock exists to
    provide: while one thread holds it, every other thread is excluded
    from the section it protects.
  - **acquire / release** — the two operations on a lock: acquire claims
    it (only succeeding if no one else already holds it), release gives
    it back.
  - **test-and-set** — the real, named hardware operation locks are
    actually built on: reading a lock's current value and setting a new
    one, as one genuinely indivisible step no interleaving can ever land
    inside of.
- **Objects and methods used**: None new. This lesson reuses `read-byte`,
  `write-byte` (Lesson 191), `if`, `=` (already covered).

---

## Concept Unit: Acquire and Release

### The Problem

Lesson 212 proved that a read-compute-write sequence needs to run as one
uninterruptible step. Nothing built so far actually enforces that —
every function in this section has let anything interleave with
anything else, freely. Something needs to say "not while I'm using
this," and mean it.

### Introduce the Concept in Isolation

Skipped — a lock is a plain value, `0` for free and `1` for held, and
checking or changing it is already-covered comparison and arithmetic;
the real content is what the two operations guarantee, shown directly
below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 212's race-condition work.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

A **lock** is free at `0`, held at `1`. **Acquiring** it only succeeds if
it was actually free:

```clojure
(defn lock-free?
  [lock]
  (= lock 0))
```

```clojure
(defn lock-acquire
  [lock]
  (if (lock-free? lock)
    1
    lock))
```

### The Updated Project

**Releasing** it always sets it back to free, regardless of what it was:

```clojure
(defn lock-release
  [lock]
  0)
```

### Mechanical Walkthrough

`lock-free?`'s body — **(c) already basic**, ordinary equality.

`lock-acquire`'s body — **(a) first appearance**: if the lock was free,
this thread now holds it, `1`; if it was *already* held, `lock-acquire`
returns the lock completely unchanged — this attempt did not succeed,
and whoever called it has to try again later, not proceed as if it had.

`lock-release`'s body, the bare literal `0` — **(a) first appearance**:
release doesn't check who's releasing it, or whether it was even held —
it simply sets the lock back to free.

Trace both:

```
lock-acquire 0 → 1     (was free, now held)
lock-acquire 1 → 1     (already held — attempt did not succeed)
lock-release 1 → 0     (now free again)
```

The second trace matters as much as the first: calling `lock-acquire` on
an already-held lock does *not* grant a second holder anything — it
returns the same held value, an honest "you didn't get it," not a
silent success.

### CS Lens

A shared value used to guarantee only one holder at a time is the real,
standard mechanism behind every real synchronization primitive.

```
Also recognized in: real mutex and lock implementations in every
mainstream threading library — POSIX's own `pthread_mutex`, Java's
`synchronized`, and effectively every other real one — all providing
exactly this acquire/release shape; and the real, standard term "mutual
exclusion" itself, used identically across all of them
```

### SE Lens

No lock at all — just careful, disciplined programming — was the
available alternative, and Lesson 212 already priced its real cost
concretely: four of six legal interleavings produced a wrong answer. A
lock, built here, costs real overhead of its own: acquiring and
releasing take real time, and any thread that can't acquire has to wait
— genuinely idle, doing no useful work, until whoever holds it releases.
That waiting cost is real and worth naming honestly; it's traded
directly for the guarantee the next unit proves actually holds.

---

## Concept Unit: The Guarantee, Proven

### The Problem

A lock is only worth building if it actually fixes Lesson 212's own
problem. Does protecting the increment with acquire and release actually
guarantee the correct answer, no matter how two calls happen to be
ordered?

### Introduce the Concept in Isolation

Skipped — this unit composes only already-covered `read-byte` and
`write-byte`; the real content is what correct locking actually
guarantees about ordering, demonstrated directly below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `lock-release`.
- **Dependencies**: Babashka, already installed.

### The New Code

A properly protected increment — this is exactly what running *inside* a
correctly held lock means: nothing else can appear between the read and
the write, because a correct lock has already excluded it:

```clojure
(defn protected-increment
  [memory address]
  (protected-increment-write memory address (read-byte memory address)))
```

### The Updated Project

```clojure
(defn protected-increment-write
  [memory address value]
  (write-byte memory address (+ value 1)))
```

### Mechanical Walkthrough

Both bodies — **(c) already basic** individually. The real content,
**(a) first appearance**: a lock's entire job is guaranteeing that
whatever runs between acquire and release behaves *exactly* like an
ordinary, uninterrupted function call — no thread's operations can ever
land inside another's protected section, the way Lesson 212's own
interleavings freely could. That guarantee is what turns "worry about
every possible interleaving" into "reason about it the same way you'd
reason about two ordinary, sequential function calls."

Call `protected-increment` twice in a row, exactly the composition a
correctly enforced lock reduces two "concurrent" calls to:

```
protected-increment (make-memory 1) 0
  → protected-increment-write memory 0 (read-byte memory 0 = 0)
  → write-byte memory 0 (0 + 1) → [1]

protected-increment [1] 0
  → protected-increment-write [1] 0 (read-byte [1] 0 = 1)
  → write-byte [1] 0 (1 + 1) → [2]
```

`(protected-increment (protected-increment (make-memory 1) 0) 0)`
returns `[2]` — correct, every time, regardless of which call happens
"first," because a correct lock never allows anything else to run
between one call's read and its own write. Lesson 212's own exhaustive
six-interleaving check is no longer needed at all: mutual exclusion
collapses the whole space of possible interleavings down to plain
sequential composition, which this curriculum has already known how to
reason about since Lesson 5.

### CS Lens

A correctly locked critical section behaving exactly like ordinary
sequential composition is a real, named, foundational guarantee in
concurrency and database theory alike.

```
Also recognized in: the real, standard concept of "serializability" —
concurrent operations that are guaranteed to behave as if they ran in
some genuine sequential order, a term used identically in both operating-
systems concurrency and database transaction theory; and this
curriculum's own function composition (Lesson 5), now revealed as
exactly the reasoning tool a correct lock earns back for concurrent code
```

### SE Lens

Reasoning about every possible interleaving by hand, the way Lesson 212
had to for the unlocked version, was the available alternative for
verifying correctness — and it scales terribly, growing combinatorially
with every additional operation or thread. The entire, primary value a
correct lock provides isn't just "the bug is fixed" — it's that
reasoning about the locked code at all goes back to being as simple as
reasoning about ordinary sequential calls, a real, substantial reduction
in how hard the problem is to think about, not only whether it's solved.

---

## Concept Unit: Who Locks the Lock?

### The Problem

`lock-acquire` reads the lock's current value, then decides, then
writes a new one — a read, then a write, exactly the same shape as the
original unprotected increment Lesson 212 already proved is unsafe. Is
`lock-acquire` itself actually safe from the very problem it exists to
solve?

### Introduce the Concept in Isolation

Skipped — this unit reuses Lesson 212's own interleaving-tracing method,
applied to `lock-acquire`'s own two steps instead of the counter's; the
real content is the result, shown directly below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script; no new
  functions, only a trace of `lock-acquire`'s own internal steps.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

Split `lock-acquire`'s own body back into its two real steps — a read of
the current lock value, and a write of the new one — exactly the way
Lesson 212 split the counter increment apart:

```clojure
(if (lock-free? lock) 1 lock)
```

### The Updated Project

Skipped — no enclosing file exists yet; this is a trace of
`lock-acquire`'s own internal shape, not a new call.

### Mechanical Walkthrough

`lock-acquire`'s own `if`, read internally as two separate real steps —
**(a) first appearance** as a genuine concern: checking `lock-free?`
*is* a read of the lock's current value; returning `1` (or `lock`) *is*
a write. Nothing in this lesson's own Clojure code forces those two
steps to happen as one atomic hardware operation — they're simply two
expressions evaluated in order, the same as any other function.

Trace two threads' `lock-acquire` attempts interleaving, exactly the way
Lesson 212 traced two threads' increments interleaving:

```
lock = 0
Thread A reads lock: sees 0 (free)
Thread B reads lock: sees 0 (free) — B's read landed before A's write
Thread A writes lock = 1 — believes it has acquired the lock
Thread B writes lock = 1 — also believes it has acquired the lock
```

Both threads now believe they hold the lock. Both will proceed into
whatever critical section this lock was supposed to protect,
simultaneously — the identical lost-update failure from Lesson 212,
relocated one level down, into the very mechanism built specifically to
prevent it.

### CS Lens

A protective mechanism that itself needs the same protection it
provides is a real, recurring structural problem, not unique to locking.

```
Also recognized in: the real, well-known "who guards the guards"
problem, recurring anywhere a layered system needs its own foundational
layer to actually be trustworthy; real hardware atomic instructions —
"test-and-set" and "compare-and-swap" — which exist specifically to give
`lock-acquire` a genuinely indivisible read-and-write step that no
interleaving can land inside of, because the hardware itself guarantees
it, not software reasoning; and this curriculum's own upcoming Section X
material on atomics, the direct, real answer to exactly this problem
```

### SE Lens

Implementing `lock-acquire` in ordinary software — a plain read followed
by a plain write, exactly what this unit's own trace built — is
genuinely the simplest thing to write, and this unit's own trace proves
it doesn't actually work. The real fix costs something software alone
cannot provide: genuine hardware support, a real atomic instruction
guaranteeing the read-and-write happen as one truly indivisible step.
This is an honest, structural limit, not a gap in this lesson's own
effort — *some* primitive, somewhere in a real system, has to be
genuinely atomic at the hardware level, or the entire chain of
software-level safety built on top of it — this lesson's own lock
included — has nothing solid underneath it to actually stand on.

---

## Connect the Pieces

Follow one lock through every idea this lesson built. `lock-acquire` and
`lock-release`, built in the first unit, give the vocabulary — claim it,
give it back. `protected-increment`, called twice in sequence exactly
the way a correctly enforced lock reduces two concurrent calls to,
proves the fix actually works: `2`, every time, with no need to check
every possible interleaving the way Lesson 212 had to. And the third
unit's own trace of `lock-acquire`'s internal read-then-write shows that
guarantee was never free — it rests entirely on `lock-acquire` itself
being genuinely atomic, which nothing in ordinary software, including
this lesson's own Clojure code, can actually provide on its own. Every
layer of safety this section has built, from locks down to the real
hardware `test-and-set` instruction they depend on, eventually rests on
something being truly, physically indivisible — not merely written to
look that way.

## What Breaks Without This

`lock-release` always exists to undo exactly one `lock-acquire`. Nothing
enforces that it's ever actually called. Acquire the lock, and simply
never release it:

```clojure
(def lock-held (lock-acquire 0))
```

Trace what happens to *any* later attempt to acquire it, by anyone,
including the very thread that already holds it:

```
lock-acquire lock-held
  → lock-acquire 1
  → lock-free? 1 → false
  → return 1, unchanged
```

`lock-held` is `1`. Every subsequent call to `lock-acquire` on it
returns `1` right back — never `free`, never granted to anyone, forever.
Nothing throws an error; `lock-acquire` behaves exactly as designed,
correctly refusing to grant a lock that's still marked held. The failure
is entirely upstream: whoever acquired this lock never called
`lock-release`, and nothing in this lesson's own two functions can
detect or recover from that on their own. The critical section this lock
was protecting is now permanently unreachable by anyone — not a race
condition, but its own real, equally serious failure: a lock held
forever locks *everyone* out forever, including whoever was supposed to
release it. This is a direct preview of the very next lesson's own
subject.

## Exercises

1. Trace `lock-acquire` and `lock-release` for three calls in a row —
   acquire, release, acquire again — and confirm the lock ends up held,
   not free.
2. Using `protected-increment`, trace three calls in a row starting from
   `(make-memory 1)`, and confirm the final value is `3`.
3. Sketch, in prose, what a real `test-and-set` hardware instruction
   would need to guarantee about `lock-acquire`'s own read-and-write pair
   that this lesson's plain Clojure `if` cannot guarantee on its own. No
   code required yet.

## Definition of Done

- [ ] `lock-free?`, `lock-acquire`, and `lock-release` are written and
      hand-traced for both a free and an already-held lock.
- [ ] `protected-increment` and `protected-increment-write` are written
      and hand-traced for two calls in a row, matching `[2]`.
- [ ] The `lock-acquire`-interleaving trace in the third unit is
      understood well enough to explain, without notes, why it is the
      identical failure shape as Lesson 212's own lost update, not a
      different bug.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why a forgotten `lock-release` is a
      different, equally serious failure from a race condition, not a
      smaller version of one.
- [ ] Commit with a message explaining *why* `lock-acquire` itself must
      be genuinely atomic at the hardware level for any of this lesson's
      other guarantees to actually hold, not just *what* functions were
      added.
