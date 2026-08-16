# Lesson 206: Performance Models

- **What you will build** — a unified cost formula combining Lesson 197's
  instruction count, Lesson 198's cache cost, and Lesson 199's
  misprediction cost into one real total, revealing that naive
  instruction-counting alone understates real cost by a factor of three;
  two access patterns with *identical* Big-O complexity and genuinely
  different real cost — `44` cycles against `80` — from nothing but
  visiting the same elements in a different order; and a combined
  stack-plus-heap memory footprint estimate, the space side of the same
  question. The transferable problem: Section III's own Big-O analysis
  (Lessons 50–53) answers "how does this scale" — it was never designed
  to answer "how fast does this actually run," and this section's own
  cache and branch-prediction work already proved those two questions can
  have very different answers.
- **What you need to know first** — `run-cycles` (Lesson 197);
  `access2`, `run-accesses` (Lesson 198); `misprediction-cost` (Lesson
  199); `push-n-frames` (Lesson 193); `allocate` (Lesson 194); Big-O
  (Lesson 51).
- **Terms introduced in this lesson**
  - **performance model** — a formula or method for predicting a
    program's real cost, as opposed to its asymptotic behavior — this
    lesson's own combination of instruction, cache, and branch costs is
    one concrete example.
  - **cache thrashing** — a real, specific failure of a cache: an access
    pattern that keeps evicting a line right before it's needed again,
    turning what should be cheap, repeated hits into expensive misses,
    over and over.
  - **memory footprint** — the real, total memory a running program
    actually uses — stack plus heap — as opposed to its asymptotic space
    complexity.
- **Objects and methods used**: None new. This lesson reuses `+`, `-`,
  `*` (Section I), `empty?`, `first`, `rest` (Section II), each already
  covered.

---

## Concept Unit: A Realistic Total Cost

### The Problem

Lesson 197's `run-cycles` counts one cycle per instruction and stops
there — it has no idea a cache miss might cost ten times that, or that a
mispredicted branch might cost a real, separate penalty on top. How badly
wrong is "just count instructions" as a real performance estimate?

### Introduce the Concept in Isolation

Skipped — this unit is plain addition over already-covered numbers;
the real content is what the sum reveals, shown directly below.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lessons 197 through 199.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

The naive model — Lesson 197's own, exactly:

```clojure
(defn naive-cost
  [instruction-count]
  instruction-count)
```

A realistic model, adding cache and branch costs on top:

```clojure
(defn realistic-cost
  [instruction-count memory-cost branch-cost]
  (+ instruction-count memory-cost branch-cost))
```

### The Updated Project

Skipped — no enclosing file exists yet; both are standalone calls at the
`bb` REPL.

### Mechanical Walkthrough

`naive-cost`'s body — **(c) already basic**; literally Lesson 197's own
`run-cycles` result, renamed.

`realistic-cost`'s body, `(+ instruction-count memory-cost branch-cost)`
— **(a) first appearance**: three genuinely separate cost sources,
already independently measured in three separate earlier lessons, summed
into one number for the first time.

Compare both models on the same underlying work: Lesson 197's own
`16`-cycle countdown loop, combined with Lesson 198's own `22`-cycle
four-address cache result and Lesson 199's own `10`-cycle last-outcome
misprediction cost:

```
naive-cost 16 → 16

realistic-cost 16 22 10 → 16 + 22 + 10 → 48
```

The naive model says `16`. The realistic one, accounting for cache and
branch costs this section already measured separately, says `48` — three
times as much. Nothing about either number is wrong on its own terms;
`16` really is how many instructions ran. It just was never a complete
answer to "how long did this actually take."

### CS Lens

Modeling a system's real cost as the sum of several independently
measurable cost sources is a real, standard technique, not unique to this
lesson's own example.

```
Also recognized in: real profilers and performance-analysis tools, which
report exactly this kind of breakdown — instructions, cache misses,
branch mispredictions — as separate, addable line items; the general
systems-modeling principle that a real system's total cost is often the
sum of several distinct, separately measurable components; and Amdahl's
Law, a real, standard tool for reasoning about which of several cost
components actually dominates a system's total real-world performance
```

### SE Lens

Counting only instructions, and treating that as "close enough," is the
available alternative — it's what Lesson 197's own `run-cycles` did, and
it's genuinely simpler: one number, no separate cache or branch analysis
required. This unit's own result prices that simplicity concretely: a
threefold underestimate, for perfectly ordinary code, not a contrived
worst case. A fuller model costs real extra analysis effort — measuring
or estimating cache and branch behavior separately — in exchange for not
badly misjudging whether a real optimization is actually worth pursuing.

---

## Concept Unit: Same Big-O, Different Real Cost

### The Problem

Two access patterns can visit the exact same set of addresses, the exact
same number of times — identical by every measure Big-O analysis cares
about — and still cost genuinely different amounts in practice. Does
that actually happen, or is it a theoretical worry?

### Introduce the Concept in Isolation

Skipped — this unit reuses Lesson 198's own `run-accesses` unmodified,
against two new access sequences; nothing syntactic here is new.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `realistic-cost`.
- **Dependencies**: Babashka, already installed.

### The New Code

The gap between two measured costs, named directly:

```clojure
(defn cache-cost-gap
  [pattern-a-cost pattern-b-cost]
  (- pattern-b-cost pattern-a-cost))
```

### The Updated Project

Two access sequences over the same eight-byte memory, `[10 20 30 40 50
60 70 80]`, `block-size 2`, `num-lines 2` — visiting every address
exactly once, in two different orders:

```clojure
(run-accesses [nil nil] memory (list 0 1 2 3 4 5 6 7) 2 2 0)
```

```clojure
(run-accesses [nil nil] memory (list 0 2 4 6 1 3 5 7) 2 2 0)
```

### Mechanical Walkthrough

Both calls — **(c) already basic**, Lesson 198's own `run-accesses`,
unmodified. `cache-cost-gap`'s body — **(c) already basic** subtraction,
naming what the difference actually means.

Trace the sequential order first — addresses `0` through `7`, in order:

```
addr 0: block [0,1], line 0 → MISS  (10)
addr 1: block [0,1], line 0 → hit   (1)
addr 2: block [2,3], line 1 → MISS  (10)
addr 3: block [2,3], line 1 → hit   (1)
addr 4: block [4,5], line 0 → MISS, evicts [0,1]  (10)
addr 5: block [4,5], line 0 → hit   (1)
addr 6: block [6,7], line 1 → MISS, evicts [2,3]  (10)
addr 7: block [6,7], line 1 → hit   (1)
total: 44
```

Now the reordered sequence — the identical eight addresses, visiting
every *other* block first:

```
addr 0: block [0,1], line 0 → MISS               (10)
addr 2: block [2,3], line 1 → MISS               (10)
addr 4: block [4,5], line 0 → MISS, evicts [0,1] (10)
addr 6: block [6,7], line 1 → MISS, evicts [2,3] (10)
addr 1: block [0,1], line 0 → MISS, evicts [4,5] — [0,1] was evicted at addr 4! (10)
addr 3: block [2,3], line 1 → MISS, evicts [6,7] — [2,3] was evicted at addr 6! (10)
addr 5: block [4,5], line 0 → MISS, evicts [0,1] again  (10)
addr 7: block [6,7], line 1 → MISS, evicts [2,3] again  (10)
total: 80
```

```
cache-cost-gap 44 80 → 36
```

Both sequences visit all eight addresses exactly once — identically
`O(n)` by every measure Big-O analysis considers. The reordered one costs
`80` cycles; the sequential one costs `44` — nearly double, from nothing
but the *order* elements were visited in. With only two cache lines
available and four blocks in play, the reordered sequence keeps evicting
a block moments before it's needed again — every single access misses.
**This is called cache thrashing.**

### CS Lens

Two algorithms, or two access patterns, with identical asymptotic
complexity but genuinely different real performance is a real,
well-documented phenomenon, not a contrived edge case.

```
Also recognized in: real, well-known cases in numerical computing where
traversal order alone — row-major versus column-major access over the
same matrix — produces a measurable, sometimes dramatic real performance
difference despite identical Big-O complexity; "cache-oblivious
algorithms," a real, named subfield of algorithm design specifically
about designing algorithms that perform well across a memory hierarchy
without even knowing its exact parameters; and this curriculum's own
Big-O material (Lessons 50–53), now revealed to be a necessary but
genuinely insufficient tool for predicting real-world performance
```

### SE Lens

Trusting Big-O analysis alone when choosing between two algorithms or
access patterns is the available alternative, and it's often a
reasonable first filter — an `O(n²)` algorithm rarely beats a well-
implemented `O(n log n)` one at real scale. But this unit's own `44`-
versus-`80` result is a case Big-O analysis is mathematically blind to
by design — it deliberately abstracts away constant factors and access
order entirely. The real, practical alternative is measuring on real
hardware with representative data, which costs real engineering time and
real test infrastructure, but is the only way to catch a gap like this
one before it costs something in production.

---

## Concept Unit: Memory Footprint

### The Problem

Every cost measured so far has been about time. A program also uses a
real, finite amount of space — how much stack, and how much heap, does a
program's own shape actually demand?

### Introduce the Concept in Isolation

Skipped — this unit's functions are plain arithmetic and list summation,
both already covered; the real content is what they estimate, shown
directly below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `cache-cost-gap`.
- **Dependencies**: Babashka, already installed.

### The New Code

Stack footprint: however deep the recursion goes, times how many slots
each frame needs — the exact shape Lesson 193's own `push-n-frames`
already used:

```clojure
(defn stack-footprint
  [max-depth frame-size]
  (* max-depth frame-size))
```

Heap footprint: the sum of every live allocation's own size:

```clojure
(defn heap-footprint-sum
  [allocations total]
  (if (empty? allocations)
    total
    (heap-footprint-sum (rest allocations) (+ total (first allocations)))))
```

### The Updated Project

```clojure
(defn heap-footprint
  [allocations]
  (heap-footprint-sum allocations 0))
```

```clojure
(defn total-footprint
  [max-depth frame-size allocations]
  (+ (stack-footprint max-depth frame-size) (heap-footprint allocations)))
```

### Mechanical Walkthrough

`stack-footprint`'s body — **(c) already basic** arithmetic, but
applying it to *predict* a stack's needed size, rather than only
tracing one already built, is **(a) first appearance**.

`heap-footprint-sum`'s body — **(b) a hard concept reappearing**:
ordinary accumulator recursion (Section III), summing a list.

`total-footprint`'s body — **(a) first appearance**: stack and heap,
Lessons 193 and 194's own separate subjects, added into one real space
estimate for the first time.

Trace `total-footprint` for a recursion four calls deep, two slots per
frame — exactly Lesson 193's own `push-n-frames 4` example, which exactly
filled an eight-slot memory — alongside Lesson 194's own three heap
allocations, `5`, `8`, and `3` bytes:

```
stack-footprint 4 2 → 8
heap-footprint (5 8 3) → 5 + 8 + 3 → 16
total-footprint 4 2 (5 8 3) → 8 + 16 → 24
```

Twenty-four bytes, total, real — not an asymptotic bound, a concrete
number, built from exactly the same two lessons' own worked examples.

### CS Lens

Estimating a program's real memory footprint, not just its asymptotic
space complexity, is a real, practical engineering concern in its own
right.

```
Also recognized in: real, practical memory budgeting in embedded and
resource-constrained systems programming, where a concrete byte count,
not a Big-O bound, is what actually has to fit; and the same Big-O-
versus-real-cost gap the second unit demonstrated for time, now applying
identically to space — asymptotic space complexity (Section III) and
actual real memory footprint (this unit) answer genuinely different
questions
```

### SE Lens

Ignoring space and optimizing only for time was the available
alternative — and this section's own earlier lessons already show why it
can't be done for free: a bigger cache (fewer misses, less time cost)
costs more real chip area; a larger cache line (Lesson 198's own block
size) fetches more data per miss, reducing time cost, but wastes real
memory bandwidth on bytes that might never be used. Every one of this
section's own optimizations has an implicit space cost sitting
underneath its time benefit — this unit only makes that cost countable
instead of leaving it implicit.

---

## Connect the Pieces

Follow one program's full cost, time and space together, through every
model this lesson built. `naive-cost`, counting only instructions, says
`16`. `realistic-cost`, adding Lesson 198's cache cost and Lesson 199's
branch cost on top, says `48` — the real number, not the convenient one.
`cache-cost-gap` shows that even within the cache-cost piece alone, the
*same* work, reordered, can cost `44` or `80` cycles — a nearly two-fold
swing Big-O analysis alone could never have predicted. And
`total-footprint`, entirely separate from all of that, prices the same
kind of program's real space cost at `24` bytes, stack and heap combined.
None of these numbers came from a new mechanism — every one of them
reuses a function this section already built and verified in an earlier
lesson. The only thing new in this lesson is refusing to look at any one
of them alone.

## What Breaks Without This

`realistic-cost` is only realistic because it includes all three terms.
Drop one — forget the branch cost, the way a naive analysis easily might:

```clojure
(defn realistic-cost-broken
  [instruction-count memory-cost]
  (+ instruction-count memory-cost))
```

Trace it against the same numbers this lesson's first unit already used:
`realistic-cost-broken 16 22` gives `38`. Compare that to the real total,
computed with the branch cost properly included: `48`. Suppose a real
performance budget allowed `40` cycles for this program. `38` — the
broken model's answer — says the budget is met, with room to spare.
`48` — the true cost, once the misprediction penalty this program's own
loop actually pays is counted — says it's already over budget by `8`
cycles. Nothing about `realistic-cost-broken` looks obviously incomplete;
it runs, returns a plausible number, and that number is simply missing an
entire real cost source. This is the same failure shape as every earlier
"silently wrong, not crashing" bug in this section, now at the level of a
performance decision instead of a single wrong value: a model that leaves
out one real cost component doesn't fail loudly — it just quietly
recommends the wrong conclusion to whoever trusts it. Restoring
`branch-cost` as a genuine third term, not an optional extra, is what
keeps `realistic-cost` actually realistic.

## Exercises

1. Using `realistic-cost`, compute the true total for `instruction-count
   16`, `memory-cost 22`, and `branch-cost 20` — the *naive-not-taken*
   predictor's cost from Lesson 199, instead of the smarter last-outcome
   predictor's `10` — and state how much worse the naive predictor makes
   the program's real total cost.
2. Using `stack-footprint` and `heap-footprint`, compute the total
   footprint for a recursion six calls deep at two slots per frame,
   alongside heap allocations of `10`, `4`, and `6` bytes.
3. Sketch, in prose, why `cache-cost-gap`'s two access patterns having
   *identical* Big-O complexity is exactly what makes this lesson's
   second unit a genuine counterexample, rather than just "one algorithm
   being asymptotically better than another." No code required yet.

## Definition of Done

- [ ] `naive-cost` and `realistic-cost` are written and hand-traced,
      matching this lesson's `16` and `48` results.
- [ ] The sequential and reordered access traces are hand-verified,
      matching `44` and `80` cycles, and `cache-cost-gap` is confirmed to
      return `36`.
- [ ] `stack-footprint`, `heap-footprint-sum`, `heap-footprint`, and
      `total-footprint` are written and hand-traced, matching `24` bytes.
- [ ] The "What Breaks Without This" comparison is understood well enough
      to explain, without notes, why `38` versus `48` is a
      budget-relevant difference, not just a rounding gap.
- [ ] Commit with a message explaining *why* two access patterns with the
      same Big-O complexity can have genuinely different real cost, not
      just *what* functions were added.
