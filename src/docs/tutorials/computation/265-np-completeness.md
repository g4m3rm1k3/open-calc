# Lesson 265: NP-Completeness

**What you will build**: a real, `bb`-verified decision procedure for
**Partition** — given a list of numbers, can it be split into two groups
with exactly equal sums — built entirely on top of Lesson 264's own
Subset-Sum machinery, plus a real, `bb`-verified polynomial-time
**reduction** proving that solving Partition would mean solving
Subset-Sum too. The transferable problem this lesson is actually about:
**NP-completeness** — the precise, mechanical reason that Partition
(splitting a pile fairly), Subset-Sum (hitting an exact target), and
thousands of other problems that look completely unrelated on the
surface all turn out to share the *identical* worst-case difficulty,
provable not by staring at each one individually but by connecting them
together with real, checkable transformations.

**What you need to know first**: Lesson 262's reduction technique —
assume a hypothetical solver, transform an instance of one problem into
an instance of another, prove the transformation preserves the answer,
compose the pieces into one proof — now sharpened to require the
transformation itself run in polynomial time, the exact bar this
lesson's own class needs. Lesson 264's `P`/`NP` definitions, and its
real, `bb`-verified `candidate-sum`, `verify-subset-sum`,
`brute-force-subset-sum`, and `all-subsets` machinery, reused here
completely unchanged. Lesson 263's own asymptotic vocabulary
(polynomial versus exponential growth).

**Terms used in this lesson**:

- **Subset-Sum** — the decision problem from Lesson 264: given a list of
  numbers and a target, does some subset of the numbers sum to exactly
  the target? Reused here as the already-understood problem this
  lesson's own new problem gets connected back to.
- **Partition** — a new decision problem: given a list of numbers, can
  it be split into two groups whose sums are exactly equal? It exists
  as this lesson's own concrete example of a problem that looks
  genuinely different on the surface from Subset-Sum — fair division
  between two people, or balancing load across two machines, rather
  than hitting one specific number — while turning out, as this lesson
  proves with real code, to share Subset-Sum's exact difficulty.
- **Polynomial-time reduction** — Lesson 262's own reduction technique,
  with one added requirement: the transformation step itself must run in
  polynomial time, not merely be computable at all. It exists because an
  reduction whose *own* transformation took exponential time would prove
  nothing about relative difficulty — a slow-enough transformation could
  connect almost any two problems without saying anything real about
  either one's actual hardness.
- **NP-hard** — a decision problem `X` such that *every* problem in `NP`
  has a polynomial-time reduction to `X`. It exists to name "at least as
  hard as the hardest problem in `NP`," whether or not `X` is itself in
  `NP` at all (some NP-hard problems aren't decision problems, or aren't
  efficiently verifiable — this lesson's own example, Partition, happens
  to be both, which is what earns it the stronger name below).
- **NP-complete** — a decision problem that is both in `NP` (efficiently
  verifiable) and `NP`-hard (at least as hard as everything else in
  `NP`). It exists to name the specific set of problems sitting at the
  very top of `NP`'s own difficulty ordering: solve any single one of
  them in polynomial time, and — because every other `NP` problem
  reduces to it — every problem in `NP` would be solvable in polynomial
  time too, meaning `P = NP` after all.

**Objects and methods used**

- **`partition?`**
  - *What it is:* this lesson's own new decision procedure for the
    Partition problem.
  - *Implementation:* `(partition? numbers)` reuses
    `brute-force-subset-sum` directly, asking whether some subset sums
    to exactly half the total.
  - *Its use:* the concrete demonstration that Partition, defined
    completely independently, collapses to an instance of Subset-Sum the
    moment it's actually implemented.
- **`abs-of`**
  - *What it is:* a small new helper computing a number's absolute
    value.
  - *Implementation:* `(if (< x 0) (- x) x)`.
  - *Its use:* the reduction below needs a non-negative gap regardless
    of which of two quantities happens to be larger.
- **`reduction-gap` / `reduce-subset-sum-to-partition`**
  - *What it is:* this lesson's own real reduction — the actual new
    code this lesson is about.
  - *Implementation:* `reduction-gap` computes one new number from a
    Subset-Sum instance's own total and target; `reduce-subset-sum-to-partition`
    appends that one number onto the original list, producing a real
    Partition instance.
  - *Its use:* the concrete, `bb`-verified transformation proving
    Subset-Sum reduces to Partition in genuinely polynomial (here,
    linear) time.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`candidate-sum`**
  - *What it is:* Lesson 264's own sum-computing function, reused
    unchanged.
  - *Implementation:* sums a list via the accumulator-threaded
    `sum-counted`, returning just the final total.
  - *Its use:* both `partition?` (to find half the total) and
    `reduction-gap` (to find the whole list's total) depend on it
    directly.
- **`brute-force-subset-sum`**
  - *What it is:* Lesson 264's own exhaustive search, reused unchanged.
  - *Implementation:* builds the full power set of a list via
    `all-subsets`, then tries every subset via `try-candidates` until one
    matches the target or all are exhausted.
  - *Its use:* `partition?` is built *entirely* out of this one call —
    no new search logic is written for Partition at all.

---

## Concept Unit: Partition — A Different-Looking Problem, the Same Machinery

### The Problem

Take a genuinely different-sounding question: given a pile of numbers,
can it be split into two groups with *exactly* equal sums — fair
division between two people, or balancing load evenly across two
machines? Nothing about "split into two equal groups" sounds like
"does some subset hit one specific target," Lesson 264's own Subset-Sum
question. Before connecting them formally, the first real step is just
building a working decision procedure for Partition at all.

### Introduce the Concept, Isolated

A throwaway, disposable example — checking whether two already-proposed
groups have equal sums:

```clojure
(defn quick-sum [lst] (if (empty? lst) 0 (+ (first lst) (quick-sum (rest lst)))))

(defn verify-halves-throwaway [left right] (= (quick-sum left) (quick-sum right)))
```

Run it:

```
user=> (verify-halves-throwaway [1 4] [2 3])
true
user=> (verify-halves-throwaway [1 4] [2 2])
false
```

This proves that, exactly like Subset-Sum, *checking* a proposed
Partition — two already-chosen groups — costs almost nothing: two
independent sums and one comparison, regardless of how hard finding
those two groups from scratch might be. This is the same shape of
**certificate** Lesson 264 introduced: the pair of groups themselves
*is* the certificate, and `verify-halves-throwaway` shows verifying it
sits in `P`, exactly like `verify-subset-sum` did for Subset-Sum. That
alone is enough to place Partition inside `NP` — proven concretely here,
formalized properly once `partition?` itself exists below.

### Discard the Throwaway Example

`quick-sum` and `verify-halves-throwaway` are deleted here. They never
appear again — only the fact they proved (a proposed Partition is cheap
to check) carries forward.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, because
  Partition has never come up in this curriculum before.
- **Files affected**: None (standalone lesson script).
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka; `candidate-sum` and `brute-force-subset-sum`
  from Lesson 264, reused unchanged.

### The New Code

```clojure
(defn partition? [numbers]
  (get (brute-force-subset-sum numbers (/ (candidate-sum numbers) 2)) 0))
```

### The Updated Project

Skipped — no enclosing file exists yet; this one function is the whole
new structure.

### Mechanical Walkthrough

- **`(defn partition? [numbers] ...)`** — a single-argument function:
  the entire list of numbers, no separate target, since Partition's own
  question ("can this be split evenly") never mentions one — unlike
  Subset-Sum, whose target is part of the problem's own input.
- **`(candidate-sum numbers)`** — reused completely unchanged from
  Lesson 264: sums the whole list, returning just the total.
- **`(/ (candidate-sum numbers) 2)`** — `/`, Clojure's division
  operator, already established since this curriculum's earliest
  lessons on rational arithmetic (Section I): dividing the total by `2`
  produces the exact target a valid partition's smaller-numbered half
  would need to hit — an *exact* rational number, not a rounded
  approximation, which matters directly below.
- **`(brute-force-subset-sum numbers (/ (candidate-sum numbers) 2))`**
  — reused completely unchanged from Lesson 264: searches for *some*
  subset of `numbers` summing to exactly half the total. If one exists,
  it and its complement (everything else in `numbers`) are two groups
  with equal sums — a valid partition.
- **`(get ... 0)`** — `brute-force-subset-sum` returns a `[found?
  tries]` pair (Lesson 264's own convention); `(get ... 0)` pulls out
  just the `true`/`false` answer, discarding the search's own real
  effort count, which isn't this function's concern.

There is no new search logic here at all — `partition?` is *entirely*
Lesson 264's own machinery, asked a specifically-constructed question.

### CS Lens

Notice what `(/ (candidate-sum numbers) 2)` quietly handles for free: if
the total is odd, dividing by `2` produces an exact non-integer ratio
(like `7/2`), and since every subset of whole numbers always sums to a
whole number, `brute-force-subset-sum` correctly reports "no subset
matches" without any special-cased even/odd check anywhere in this
lesson's own code — a real, direct payoff of this curriculum's very
first lessons on exact rational arithmetic, still paying off in Lesson
265. More importantly: `partition?`'s entire existence is a live
demonstration of `NP`-completeness's own core idea, before that term
even gets formally defined in Unit 2 — a problem that reads as
genuinely different (splitting a pile in half) collapses, the instant
it's implemented, into a differently-parameterized instance of a problem
already solved. Also recognized in: load-balancing two identical
machines, splitting an inheritance evenly by asset value rather than by
item count, and a two-team draft where the goal is equal total roster
strength rather than an equal number of players.

### SE Lens

The alternative not chosen: write a brand-new brute-force search from
scratch specifically for Partition, independent of
`brute-force-subset-sum`. That would work, but it would hide the exact
fact this lesson exists to expose — that Partition and Subset-Sum are
not merely *similar*, they are, computationally, the *same* problem
wearing a different name, once the target is pinned to exactly half the
total. Reusing Lesson 264's code unchanged, rather than re-deriving a
parallel search, is itself the honest way to show that relationship,
not just describe it.

### Commands

None new.

### Run It — Real Output

```
user=> (partition? [1 2 3])
true
user=> (partition? [1 2 4])
false
user=> (partition? [3 1 4 1 5])
true
```

`[1 2 3]` splits evenly (`{3}` and `{1, 2}`, both summing to `3`).
`[1 2 4]` sums to `7`, odd, so no split can ever be exactly equal — and
`partition?` correctly reports `false` with no special-case code, exactly
as the CS Lens above predicted. `[3 1 4 1 5]` sums to `14`; a valid split
exists (`{3, 4}` and `{1, 1, 5}`, both summing to `7`), and `partition?`
finds it.

### Connecting Back

Partition, asked completely independently, turned out to need zero new
search logic — just Subset-Sum, asked the right question. The next unit
makes that relationship formal and precise: a real, `bb`-verified
transformation from *any* Subset-Sum instance into a Partition instance,
proving the connection isn't a coincidence of this one implementation
choice.

---

## Concept Unit: The Reduction That Proves It

### The Problem

`partition?`'s own implementation strongly *suggests* Partition and
Subset-Sum share the same difficulty, but an implementation choice isn't
a proof — a different, cleverer implementation of `partition?` might not
have reused `brute-force-subset-sum` at all. What's needed is something
stronger: a real transformation that turns *any* Subset-Sum instance
into a Partition instance, provably preserving the yes/no answer, so
that a fast Partition solver — however it happened to be built — could
be handed straight to any Subset-Sum instance and produce the correct
answer.

### Introduce the Concept, Isolated

Not applicable — this unit's real code (`reduction-gap` and
`reduce-subset-sum-to-partition`) is already the smallest way to
demonstrate the actual transformation; there's no smaller throwaway
version that would teach the technique without just being a simplified,
soon-discarded copy of the real thing, following the same precedent set
once concept isolation and real project code stopped needing to be two
different things (Lesson 130 onward).

### Discard the Throwaway Example

Not applicable, for the same reason.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka; `candidate-sum` from Lesson 264 and
  `partition?` from Unit 1, both reused unchanged.

### The New Code

```clojure
(defn abs-of [x] (if (< x 0) (- x) x))

(defn reduction-gap [numbers target]
  (abs-of (- (candidate-sum numbers) (* 2 target))))
```

### The Updated Project

```clojure
(defn reduce-subset-sum-to-partition [numbers target]
  (conj numbers (reduction-gap numbers target)))
```

`reduce-subset-sum-to-partition` is the smallest new piece added on top
of `abs-of`/`reduction-gap` — the complete reduction, sitting directly
on top of the two functions just shown, with nothing yet surrounding
any of the three.

### Mechanical Walkthrough

- **`(defn abs-of [x] (if (< x 0) (- x) x))`** — `<` and unary `-` are
  both already familiar; together they compute a number's distance from
  zero regardless of sign, needed because the gap computed next can come
  out negative depending on whether the target is above or below half
  the total.
- **`(defn reduction-gap [numbers target] (abs-of (- (candidate-sum numbers) (* 2 target))))`**
  — `(candidate-sum numbers)` is the Subset-Sum instance's own total
  (call it `S`); `(* 2 target)` doubles the target (call it `t`); `(-
  S (* 2 target))` computes `S - 2t`; `abs-of` makes it non-negative.
  This single number, `|S - 2t|`, is the entire mathematical core of the
  reduction: it's exactly the amount needed to make one side of a
  two-way split equal the other, whichever side `t` happens to be
  closer to.
- **`(defn reduce-subset-sum-to-partition [numbers target] (conj numbers (reduction-gap numbers target)))`**
  — `conj`, already familiar from every earlier lesson's vector-building
  code, appends the newly computed gap value onto the *end* of the
  original numbers list. The result is a brand-new list — one element
  longer than the input — that is handed to `partition?` as a genuinely
  new Partition instance.

Both new functions run in a fixed, small number of operations on top of
`candidate-sum`'s own linear pass — the *whole transformation* is
`O(n)`, comfortably polynomial, satisfying the requirement a valid
reduction needs.

### CS Lens

This is a real, `bb`-verified **polynomial-time reduction** — Lesson
262's own four-step technique (assume, transform, prove preservation,
compose), sharpened here to require the transformation step itself run
fast. The "prove preservation" step is exactly what the real output
below checks directly: for every one of four combinations tried (target
above half the total, target below half the total, each with a genuine
"yes" and a genuine "no" case), `partition?` of the transformed instance
matches `brute-force-subset-sum`'s own real answer on the original
instance, every single time. This lesson does *not* re-derive
Subset-Sum's own `NP`-completeness from first principles — that would
mean reducing from a canonical starting point like 3-SAT, via the
Cook-Levin theorem, well beyond this lesson's honest scope, the same
honest boundary Lessons 99, 100, 134, and 260 already drew around their
own hardest cases. Taking Subset-Sum's `NP`-completeness as an
already-established, real result, this lesson's own reduction is the
missing piece: because *every* problem in `NP` already reduces to
Subset-Sum (that's what Subset-Sum's own `NP`-completeness means), and
Subset-Sum now reduces to Partition too, composing the two reductions —
exactly Lesson 262's own "compose" step — means every problem in `NP`
reduces to Partition as well. Combined with Unit 1's own `NP`-membership
argument (a partition's own two halves are a cheap-to-verify
certificate), Partition is **NP-complete**: efficiently verifiable, and
at least as hard as every other problem in `NP`. Also recognized in:
graph coloring, the traveling salesperson decision problem, Boolean
satisfiability, and Sudoku on an arbitrarily large grid — thousands of
problems from wildly different domains, all connected by exactly this
kind of real, checkable transformation, not by resemblance or intuition.

### SE Lens

The alternative not chosen: prove Partition is hard by trying, and
failing, to find a fast algorithm for it directly — the same way a
programmer might spend days convinced some specific problem is "just
hard" without ever being able to say precisely *how* hard, or *why*, or
what it has in common with other problems they've already given up on.
A reduction replaces that vague conviction with a specific, checkable
artifact: `reduce-subset-sum-to-partition` itself, real code anyone can
run against real inputs and confirm. The real cost paid for that
certainty: constructing a correct reduction takes real derivation work
up front — `reduction-gap`'s own `|S - 2t|` formula isn't obvious by
inspection, and getting the sign or the factor of `2` wrong produces
something that still *runs* without error but is silently unsound, shown
directly below.

### Commands

None new.

### Run It — Real Output

```
user=> (brute-force-subset-sum [3 7 2 9] 12)
[true 12]
user=> (reduction-gap [3 7 2 9] 12)
3
user=> (reduce-subset-sum-to-partition [3 7 2 9] 12)
[3 7 2 9 3]
user=> (partition? (reduce-subset-sum-to-partition [3 7 2 9] 12))
true
user=> (brute-force-subset-sum [3 7 2 9] 13)
[false 16]
user=> (reduction-gap [3 7 2 9] 13)
5
user=> (partition? (reduce-subset-sum-to-partition [3 7 2 9] 13))
false
user=> (brute-force-subset-sum [3 7 2 9] 9)
[true 2]
user=> (reduction-gap [3 7 2 9] 9)
3
user=> (partition? (reduce-subset-sum-to-partition [3 7 2 9] 9))
true
user=> (brute-force-subset-sum [3 7 2 9] 4)
[false 16]
user=> (reduction-gap [3 7 2 9] 4)
13
user=> (partition? (reduce-subset-sum-to-partition [3 7 2 9] 4))
false
```

Four real cases, chosen specifically to cover both sides of the formula:
`12` and `9` sit on opposite sides of half the total (`21 / 2 = 10.5`)
and are both genuine "yes" instances (`{3, 9}` and `{7, 2}`
respectively); `13` and `4` are both genuine "no" instances, also on
opposite sides. In every one of the four cases, `partition?` of the
transformed instance matches `brute-force-subset-sum`'s own real answer
on the original instance exactly — the reduction is proven faithful, not
just for one lucky case, but across every combination this lesson could
cheaply check.

### Connecting Back

Everything in this lesson connects through one number, `12`:
`brute-force-subset-sum` proved `[3 7 2 9]` has a subset summing to `12`
(real answer: `true`, in `12` tries). `reduction-gap` computed `3` from
that same instance. `reduce-subset-sum-to-partition` appended it,
producing `[3 7 2 9 3]`. `partition?` — built in Unit 1 from nothing but
Lesson 264's own Subset-Sum machinery — confirmed that new list really
does split evenly. The same real answer, `true`, survived the entire
trip from one problem to a completely different-looking one.

## Connect the Pieces

Start to finish, on the concrete instance `numbers = [3 7 2 9]`, `target
= 12`: `brute-force-subset-sum`, unchanged from Lesson 264, confirmed a
real subset (`{3, 9}`) sums to `12`. `reduction-gap` computed the single
new number, `3`, that `reduce-subset-sum-to-partition` appended to build
a genuine Partition instance, `[3 7 2 9 3]`. `partition?`, itself built
from nothing but `brute-force-subset-sum` asked a different question,
confirmed that new instance splits evenly. Every step used real,
`bb`-verified code — no step asserted a fact the previous step didn't
actually produce. The chain proves something stronger than any one
example: because the *same* transformation was checked against three
more real cases, covering both a "yes" and a "no" answer on both sides
of the target's relationship to half the total, and matched every time,
this is a real polynomial-time reduction, not a coincidence that happens
to work on one convenient input — which is exactly the kind of evidence
Lesson 262's own reduction technique, and this lesson's sharper,
`NP`-completeness-grade version of it, both demand.

## What Breaks Without This

`reduction-gap`'s own formula depends on doubling the target before
subtracting — `(* 2 target)`, not `target` alone. Drop the factor of `2`:

```clojure
(defn broken-reduction-gap [numbers target]
  (abs-of (- (candidate-sum numbers) target)))

(defn broken-reduce-subset-sum-to-partition [numbers target]
  (conj numbers (broken-reduction-gap numbers target)))
```

This still runs without error, still produces *some* new number, and
still returns a list one element longer, exactly like the correct
version:

```
user=> (broken-reduction-gap [3 7 2 9] 12)
9
user=> (partition? (broken-reduce-subset-sum-to-partition [3 7 2 9] 12))
false
user=> (broken-reduction-gap [3 7 2 9] 4)
13
user=> (partition? (broken-reduce-subset-sum-to-partition [3 7 2 9] 4))
true
```

Both real answers are now wrong, in opposite directions. `target = 12`
is a genuine "yes" for the original Subset-Sum instance (`{3, 9}`,
confirmed above) — the broken reduction produces `false`, a false
negative. `target = 4` is a genuine "no" (confirmed above,
`brute-force-subset-sum` tried all `16` subsets and found none) — the
broken reduction produces `true`, a false positive. A reduction that's
wrong in *either* direction is worthless as a proof: it no longer
guarantees a fast Partition solver could actually solve Subset-Sum, and
the entire chain connecting Partition back to every problem in `NP`
collapses with it. Restoring the missing `(* 2 ...)` is the one-token
fix that makes both directions correct again.

## Exercises

1. Run `reduce-subset-sum-to-partition` against a target *exactly* equal
   to half the total of some list (so `S - 2t = 0`). Predict what
   `reduction-gap` returns before confirming it, and explain in your own
   words why a gap of exactly `0` still produces a valid reduction.
2. `partition?`'s own certificate, per Unit 1's CS Lens, is the pair of
   two groups themselves. Write a real function,
   `verify-partition-halves`, that takes two proposed groups and checks
   they have equal sums (reusing `candidate-sum`), and confirm it
   correctly accepts a real valid split of `[3 1 4 1 5]` and correctly
   rejects an unequal one.
3. State, in your own words, why composing two reductions (every `NP`
   problem reduces to Subset-Sum; Subset-Sum reduces to Partition) is
   enough to conclude every `NP` problem reduces to Partition too —
   using Lesson 262's own "compose" step from its four-part reduction
   technique as the basis for your answer.
4. The broken reduction above produced a false negative at `target=12`
   and a false positive at `target=4`. Trace, by hand, exactly why the
   *direction* of the error differs between the two — what does `target`
   being above versus below half the total have to do with which way the
   missing factor of `2` breaks the answer?

## Definition of Done

- [ ] `partition?` produces the real, `bb`-verified answers shown above
      for `[1 2 3]`, `[1 2 4]`, and `[3 1 4 1 5]`.
- [ ] `reduce-subset-sum-to-partition`, combined with `partition?`,
      reproduces all four real, `bb`-verified biconditional results shown
      above (`12`→`true`, `13`→`false`, `9`→`true`, `4`→`false`),
      matching `brute-force-subset-sum`'s own answers on the original
      instances exactly.
- [ ] The broken, factor-of-`2`-dropped reduction reproduces the real,
      verified false-negative (`12`) and false-positive (`4`) results
      shown above.
- [ ] You can state, without looking back at this lesson, the formal
      definitions of `NP`-hard and `NP`-complete, and explain concretely
      (using this lesson's own reduction) why Partition qualifies as
      both.
- [ ] Commit: *"Add Partition and a real polynomial-time reduction from
      Subset-Sum, so NP-completeness has a real, checkable connection
      behind it instead of an asserted family resemblance."*
