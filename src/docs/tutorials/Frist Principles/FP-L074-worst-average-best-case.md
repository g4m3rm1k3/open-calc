# Lesson 74: Worst, Average, and Best Case

**What you will build:** a real, exhaustive computation of `linear-search-counted`'s cost across *every possible* target position at a given `n` — not just the two extreme cases Lesson 73 happened to measure. Real, verified evidence this session: at `n = 10,000`, the worst case is exactly `10,000` comparisons, the best case is exactly `1`, and the average — computed exactly, not approximately, over all `10,000` equally likely positions — is exactly `10001/2`, matching Lesson 64's `arithmetic-sum-formula` prediction precisely. The sharper result: `linear-search-reverse-counted`, whose worst and best cases were the *mirror image* of the forward version's in Lesson 73 (`1,000,000` vs. `1`, and vice versa), has the *exact same* average as the forward version, at every `n` tested. The transferable point: Lesson 73's real `1,000,000`-vs-`1` divergence was true and dramatic, but it described only the two most extreme inputs — this lesson gives the vocabulary and the computation for what happens across *all* of them, and shows that "worst-case" and "typical" can be answering genuinely different questions.

**What you need to know first:** Lesson 73 (`FP-L073-big-omega.md`) — specifically `linear-search-counted` and `linear-search-reverse-counted`, both extended directly here, and the adversary argument's order-independence claim, revisited for the average case specifically. Lesson 71 (`FP-L071-big-o.md`) — specifically the Big-O classification table, which classified every procedure by its worst case without ever saying so explicitly. Lesson 64 (`FP-L064-arithmetic-series.md`) — specifically `arithmetic-sum-formula`, whose closed form predicts this lesson's real average exactly. Lesson 65 (`FP-L065-geometric-series.md`) — specifically Guile's exact rational arithmetic, reused here to display an exact average rather than a rounded decimal.

**Terms introduced in this lesson**

- **Worst-case cost** — `T_worst(n)`, the *maximum* cost over every possible input of size `n`. This is the cost every Big-O, Big-Omega, and Big-Theta classification in Lessons 71–73 has actually been describing, without ever naming it as a specific choice among several possible questions.
- **Best-case cost** — `T_best(n)`, the *minimum* cost over every possible input of size `n` — the mirror image of worst-case, naming a question this curriculum has measured (Lesson 73's real `1`-comparison result) but never formally distinguished from the worst case.
- **Average-case cost** — `T_avg(n)`, the *expected* cost over inputs of size `n`, under some explicitly assumed distribution of which inputs are how likely. Unlike worst-case and best-case, which are defined without any assumption about likelihood, average-case is only ever as meaningful as the distribution assumption behind it — a claim of the form "the average case is X" that doesn't say what inputs it assumed is an incomplete claim.

---

## Concept Unit 1: One Number Isn't Enough

### The Problem

Lesson 73 measured two real, true numbers about searching for a target at the last position of a `1,000,000`-element vector: `linear-search-counted` needs `1,000,000` comparisons, `linear-search-reverse-counted` needs `1`. Both are correct. Neither, by itself, answers a natural question: if a real system used one of these procedures on genuinely varied inputs, what would actually searching through it typically cost? The two measured numbers are the most extreme possible answers, not typical ones.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem is posed directly here, using Lesson 73's own real numbers.

### Applying It — What a Single Big-O Classification Hides

Lesson 71's classification table called `linear-search`, flatly, `O(n)`. That classification is true — but true of *which* cost, exactly? Lesson 68's own real measurement underlying it (`1,000,000` comparisons) was the cost of searching for the *last* element — the single most expensive input `linear-search` can face at that size. The table never stated this was a worst-case measurement, because every classification in it happened to be a worst-case measurement, silently, by convention.

### Walkthrough

- **The two extreme, real numbers from Lesson 73** — both true, both already measured, and both still incomplete as a description of "how expensive is this, generally."
- **Lesson 71's table, revisited** — every one of its entries was silently a worst-case claim; naming that convention explicitly is this lesson's starting point.

### CS Lens

This is the practical limitation of any single-number cost summary: a worst-case number protects against the most expensive possible input but says nothing about ordinary operation, while a best-case number describes a scenario that may rarely or never occur in practice. Also recognized in: a car's advertised "highway mileage" versus its worst-case mileage towing a full trailer uphill — both real, measured numbers, describing genuinely different driving conditions; a restaurant's average wait time versus its longest-ever wait time during a single chaotic holiday rush.

### SE Lens

The alternative to distinguishing these questions is to keep citing a single Big-O classification and treat it as a complete description of an algorithm's real-world behavior. The real cost of that alternative is a genuine engineering mistake this curriculum hasn't yet named directly: choosing or rejecting an algorithm based on its worst case alone, when the actual deployed workload rarely or never triggers that worst case, or — the opposite mistake — assuming an algorithm's typical, average behavior will hold under adversarial or unusual conditions it was never actually checked against. Naming the three separate questions, as this lesson does, is what makes either mistake avoidable.

---

## Concept Unit 2: Defining the Three Cases Precisely

### The Problem

Concept Unit 1's distinction needs formal definitions, the same way Lesson 71 gave Big-O a formal definition instead of leaving "grows like" informal.

### No isolated lab for this step

This concept has no code of its own to isolate — the definitions are stated directly below.

### Applying It — The Three Formal Definitions

**Worst-case cost, `T_worst(n)`:** the maximum cost of running the algorithm, taken over every possible input of size `n`. Formally, if `cost(x)` is the real cost on a specific input `x`, and `Inputs(n)` is the set of every input of size `n`, then `T_worst(n) = max { cost(x) : x ∈ Inputs(n) }`.

**Best-case cost, `T_best(n)`:** the minimum cost, over the identical set of inputs — `T_best(n) = min { cost(x) : x ∈ Inputs(n) }`.

**Average-case cost, `T_avg(n)`:** the expected cost, over the identical set of inputs, *weighted by how likely each input actually is* — `T_avg(n) = Σ [ cost(x) × P(x) ]` for every `x ∈ Inputs(n)`, where `P(x)` is the assumed probability of input `x` occurring. This requires an explicit assumption `T_worst` and `T_best` never needed: some statement of which inputs are more or less likely, or, in the simplest case, that every input is equally likely.

**The assumption this lesson uses:** for `linear-search-counted`, every one of the `n` positions is assumed equally likely to hold the target, each with probability `1/n` — the simplest possible assumption, and the one this lesson verifies directly. A different assumption (say, the target is always at an already-known "hot" position) would produce a genuinely different average, without either calculation being wrong — a different question, honestly answered.

### Walkthrough

- **`T_worst(n)`'s definition, as a maximum over a set of inputs** — formalizes what every Big-O classification in Lessons 71–73 was implicitly measuring.
- **`T_best(n)`'s definition, as the mirror-image minimum** — formalizes Lesson 73's real `1`-comparison result as a named, specific quantity, not just an interesting side observation.
- **`T_avg(n)`'s definition, requiring an explicit probability assumption** — the one genuinely new piece of machinery, and the reason average-case claims need to state their assumption to mean anything precise.

### CS Lens

This is the standard three-way split used throughout algorithm analysis specifically because a single cost function cannot answer "what's the worst that can happen," "what's the best that can happen," and "what usually happens" all at once — they are three different mathematical objects, computed from the same underlying cost function but combined differently (`max`, `min`, weighted sum). Also recognized in: an insurance actuary computing a policy's maximum possible payout, its minimum possible payout, and its expected payout separately, because a single number cannot serve all three purposes; a weather forecast stating a day's expected high temperature separately from the record high and record low for that date.

### SE Lens

The alternative to defining all three formally is to keep using "worst case" informally, the way this curriculum has since Lesson 71, without ever naming the other two as legitimate, separately computable questions. The real cost of that alternative is losing the vocabulary to even ask "but what's typical" precisely — Concept Unit 1's whole problem. Defining all three, including average-case's explicit dependency on a stated distribution, is what makes Concept Unit 3's real computation possible without hiding an unstated assumption inside it.

---

## Concept Unit 3: Computing All Three, Exactly

### The Problem

Concept Unit 2's definitions need real, computed numbers behind them — not just for the two extreme inputs Lesson 73 happened to pick, but for *every* possible target position, so `T_worst`, `T_best`, and `T_avg` can each be found directly rather than guessed at.

### The New Code — Type It Yourself

```scheme
(define (all-costs search-proc vec)
  (map (lambda (i) (search-proc vec i) comparisons)
       (iota (vector-length vec))))
```

### The Updated Project

This is `case-analysis.scm`, in full:

```scheme
(define comparisons 0)

(define (linear-search-counted vec target)
  (set! comparisons 0)
  (let ((n (vector-length vec)))
    (let loop ((i 0))
      (if (= i n)
          #f
          (begin
            (set! comparisons (+ comparisons 1))
            (if (= (vector-ref vec i) target)
                i
                (loop (+ i 1))))))))

(define (linear-search-reverse-counted vec target)
  (set! comparisons 0)
  (let ((n (vector-length vec)))
    (let loop ((i (- n 1)))
      (if (< i 0)
          #f
          (begin
            (set! comparisons (+ comparisons 1))
            (if (= (vector-ref vec i) target)
                i
                (loop (- i 1))))))))

(define (build-vector-0-to n)
  (let ((v (make-vector n)))
    (let loop ((i 0))
      (if (= i n)
          v
          (begin (vector-set! v i i) (loop (+ i 1)))))))

(define (all-costs search-proc vec)                          ; ← new
  (map (lambda (i) (search-proc vec i) comparisons)           ; ← new
       (iota (vector-length vec))))                            ; ← new

(define (mean lst) (/ (apply + lst) (length lst)))            ; ← new

(define (report label search-proc vec n)                      ; ← new
  (let ((costs (all-costs search-proc vec)))                   ; ← new
    (display label) (display " n=") (display n)                ; ← new
    (display " best=") (display (apply min costs))              ; ← new
    (display " worst=") (display (apply max costs))              ; ← new
    (display " average=") (display (mean costs))                 ; ← new
    (newline)))                                                   ; ← new

(for-each                                                       ; ← new
 (lambda (n)                                                    ; ← new
   (let ((v (build-vector-0-to n)))                              ; ← new
     (report "forward" linear-search-counted v n)                 ; ← new
     (report "reverse" linear-search-reverse-counted v n)))        ; ← new
 (list 5 10 100 1000 10000))                                        ; ← new
```

`linear-search-counted`, `linear-search-reverse-counted`, and `build-vector-0-to` are Lesson 73's own procedures, unchanged.

### Reference Source

No reference counterpart — this combines Lesson 73's counted search procedures with already-established list tools (`map`, `iota`, `apply`, Lessons 34/37/58) for a new purpose: computing every case, not just one chosen input.

### Files affected

Created: `case-analysis.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

**Starting small, hand-checkable at `n = 5`, before the real, larger scale:**

```
$ guile case-analysis.scm
forward n=5 best=1 worst=5 average=3
reverse n=5 best=1 worst=5 average=3
forward n=10 best=1 worst=10 average=11/2
reverse n=10 best=1 worst=10 average=11/2
forward n=100 best=1 worst=100 average=101/2
reverse n=100 best=1 worst=100 average=101/2
forward n=1000 best=1 worst=1000 average=1001/2
reverse n=1000 best=1 worst=1000 average=1001/2
forward n=10000 best=1 worst=10000 average=10001/2
reverse n=10000 best=1 worst=10000 average=10001/2
```

Verified this session. **Why this stops at `n = 10,000` instead of Lesson 73's `1,000,000`:** computing every case exhaustively costs one full search per position — `n` searches, each up to `n` comparisons — an honestly `O(n²)` computation for this lesson's *analysis itself*, unlike Lesson 73's single `O(n)` search. `10,000` already means up to `100,000,000` total comparisons counted across all positions, real and exhaustive, without needing to reach for `1,000,000` and a much longer run to make the point.

**Confirming Concept Unit 2's definitions against the real numbers, at `n = 10,000`:** `T_worst(10000) = 10000` (searching for the position each order visits last); `T_best(10000) = 1` (searching for the position each order visits first); `T_avg(10000) = 10001/2` (the exact mean over all `10,000` equally likely positions) — and every one of `1`, `10000`, and `10001/2` is an *exact* value, computed from all `10,000` real cases, not estimated from a sample.

**Confirming the average against Lesson 64's formula:** the sum `1 + 2 + ... + n`, Lesson 64's own `arithmetic-sum-formula`, is `n(n+1)/2`; dividing by the `n` equally likely positions gives exactly `(n+1)/2`. At `n = 10,000`, that's `10001/2` — matching the real, measured average exactly, not approximately, the same exact-match discipline Lesson 68 applied to `19 + 1 = 20`.

### Mechanical Walkthrough

- **`(map (lambda (i) (search-proc vec i) comparisons) (iota (vector-length vec)))`** — a reappearance of `map` (Lesson 34), `iota` (Lesson 37), and `vector-length` (Lesson 55): builds the list of every position `0` through `n - 1`, and for each one, runs the search with that position as the target, then collects the resulting `comparisons` count. The lambda's body — `(search-proc vec i)` followed by `comparisons` — is a reappearance of the implicit multi-expression body already used in `fib-traced` (Lesson 31): the search runs first for its side effect on `comparisons`, then the counter's current value is the expression actually returned.
- **`(define (mean lst) (/ (apply + lst) (length lst)))`** — a reappearance of `apply` (Lesson 58) and `length` (an already-established list procedure), summing the list and dividing by its count — Guile's exact rational arithmetic (Lesson 65) preserving the result precisely rather than rounding.
- **`(apply min costs)` / `(apply max costs)`** — a reappearance of `apply`, `min`, and `max` (Lesson 33), finding `T_best` and `T_worst` directly from the real, exhaustive list of every case's cost.
- **`(for-each (lambda (n) ...) (list 5 10 100 1000 10000))`** — a reappearance of `for-each` (Lesson 60), running the whole analysis at five increasing scales in sequence.
- **The real, exact `1`, `n`, and `(n+1)/2` results at every scale tested** — direct, exhaustive confirmation of Concept Unit 2's three definitions, computed from real runs rather than derived only algebraically.

### CS Lens

This is exhaustive case analysis: rather than reasoning abstractly about "the best and worst inputs," every single possible input of a given size is actually run, and `T_worst`, `T_best`, and `T_avg` are read directly off the real results — the same evidence-over-assertion discipline this curriculum has applied since Lesson 22, now applied to an entire input space rather than one chosen input. Also recognized in: a quality control process that tests every unit off an assembly line rather than a sample, when the total run is small enough to make that feasible; a board game's complete win-rate analysis for a given opening move, computed by simulating every possible response rather than estimating from played games.

### SE Lens

The alternative to computing all three cases exhaustively is to reason about them algebraically only — arguing "the average should be `(n+1)/2` because positions are symmetric" without ever actually running all `n` cases to check. The real cost of that alternative, as with every algebraic claim in this curriculum since Lesson 22, is an unchecked assumption standing in for verified evidence — here, specifically, the assumption that every position really does cost exactly what the formula for its 1-indexed position predicts, with no off-by-one or boundary surprise hiding in the real code. Running all `n` cases and confirming an *exact* match, as this unit does, closes that gap completely rather than partially.

---

## Concept Unit 4: Average-Case Is Order-Invariant, Even Though Worst and Best Aren't

### The Problem

Lesson 73 found `linear-search-counted` and `linear-search-reverse-counted` diverging sharply in their worst and best cases — mirror images of each other. Concept Unit 3's real output shows their *averages* matching exactly, at every scale tested. That's worth explaining, not just observing.

### No isolated lab for this step

This concept has no code of its own to isolate — the explanation is a direct argument about Concept Unit 3's already-real numbers.

### Applying It — Why the Averages Must Match Exactly

`linear-search-counted`'s cost when the target is at (zero-indexed) position `i` is `i + 1` — it checks positions `0, 1, ..., i`, in order, stopping as soon as it finds the target. `linear-search-reverse-counted`'s cost at the identical position `i` is `n - i` — it checks positions `n - 1, n - 2, ..., i`, in order.

As `i` ranges over every position `0` through `n - 1`, forward's costs `{i + 1}` take every value in `{1, 2, ..., n}` exactly once — and reverse's costs `{n - i}` *also* take every value in `{1, 2, ..., n}` exactly once, just assigned to the opposite positions. The two orders produce the identical *multiset* of costs, `{1, 2, ..., n}`, merely relabeled across positions — so any statistic computed from that multiset alone, including the average, must come out identical. The maximum and minimum of that same multiset are still `n` and `1` respectively for both orders — what differs between the two orders is only *which position* achieves each extreme, not the multiset of possible costs itself.

**Connecting directly to Lesson 73's adversary argument:** that argument proved order-independence only at the level of the worst case's *growth rate* — `Ω(n)`, regardless of order. This unit's finding is sharper and exact, not merely asymptotic: the entire distribution of costs, not just its maximum, is identical between the two orders, position-for-position swapped.

**What this doesn't generalize to:** this exact equivalence relied on `linear-search`'s specific structure — every position visited exactly once, at a cost that's a simple function of its visiting order. Lesson 80 will meet an algorithm, Quicksort, whose average and worst cases differ not merely in which input triggers them, but in *order of growth itself* — flagged here, not yet explained.

### Walkthrough

- **`i + 1` versus `n - i`** — the two orders' cost formulas, differing in every individual value except at the exact midpoint, yet describing the identical underlying set of possible values.
- **"the identical multiset of costs, merely relabeled"** — the precise reason an exact numeric match, not just a rough resemblance, was guaranteed before Concept Unit 3 even ran the numbers.
- **The explicit limit on what generalizes** — prevents over-claiming that average-case is *always* order-invariant; only this specific structure guarantees it.

### CS Lens

This is a concrete instance of a broader idea: a summary statistic (here, the mean) can be invariant under a transformation (here, reversing the visiting order) even when the individual values it's computed from change completely. Also recognized in: a classroom's average test score staying identical if every student's score is reassigned to a different student, since the underlying set of scores hasn't changed, only who holds which one; a factory's average defect rate per shift staying the same if shifts are renumbered, since the same defects occurred, just relabeled by shift.

### SE Lens

The alternative to explaining this match is to note it as a curiosity and move on, treating Concept Unit 3's identical averages as a coincidence of this particular example. The real cost of that alternative is missing a genuinely transferable insight — that average-case behavior can be robust to a design choice (search order) that worst-case and best-case behavior are highly sensitive to — which directly informs Lesson 74's own closing caution about which case actually matters for a given real decision.

---

## Closing

### Connect the pieces

One algorithm, three questions, each answered exactly:

1. **The gap, named (Unit 1):** Lesson 73's real `1,000,000`-vs-`1` numbers were both true and both incomplete, describing only the two extremes.
2. **Three precise definitions (Unit 2):** `T_worst`, `T_best`, `T_avg` — the last one requiring an explicit, stated distribution assumption the other two don't need.
3. **All three, computed exhaustively (Unit 3):** at `n = 10,000`, `T_worst = 10000`, `T_best = 1`, `T_avg = 10001/2` — every value exact, from all `10,000` real cases, matching Lesson 64's arithmetic-series formula precisely.
4. **The order-invariance explained, not just observed (Unit 4):** forward and reverse search share an identical average because they produce the identical multiset of costs, `{1, ..., n}`, merely relabeled — while their worst and best cases genuinely differ, because those depend on *which* position holds each extreme, not just what the extremes are.

Every number in this lesson came from running all `n` real cases, at five increasing scales, and comparing the result against an independently derived formula from four lessons earlier — the same standing evidence discipline, now applied across an entire input space instead of one chosen input.

### What breaks without this

Suppose two engineers were choosing a search strategy for a system whose real inputs are, in practice, almost always searches for elements near the front of the collection. One engineer, looking only at Lesson 71's `O(n)` worst-case classification, treats both `linear-search-counted` and `linear-search-reverse-counted` as equivalent, since both carry the identical worst-case label. In practice, for this system's actual, typical workload, one of the two orders would consistently outperform the other — a real difference the shared worst-case label, by design, cannot show. Conversely, a system that instead reasoned only from a measured average-case number, without ever checking the worst case, could be blindsided by a pathological or adversarial input that Lesson 73's adversary argument already proved is always possible for unsorted search — exactly the situation this lesson's three-way vocabulary exists to prevent: knowing which of the three questions a given design decision actually depends on, before choosing.

### Exercises

1. **Observe.** Before checking, predict whether `T_avg(n)` for a search that always checks a *fixed* middle-out order (position `n/2`, then `n/2 - 1`, then `n/2 + 1`, and so on outward) would match `11/2`-style results at `n = 10`, using this lesson's multiset argument to justify your prediction.
2. **Formalize.** Implement your Exercise 1 search order as a new counted procedure, run Concept Unit 3's `report` against it at `n = 10` and `n = 1000`, and confirm or correct your prediction with the real numbers.
3. **Explain.** State, in your own words, why Concept Unit 3's `T_avg` computation would give a genuinely different, and equally valid, answer if the assumed distribution were changed to "the target is present at position `0` with probability `1/2`, and uniformly among the remaining positions otherwise" — compute the new expected value symbolically.
4. **Formalize.** Extend Concept Unit 3's `all-costs` to include the "target absent" case as one additional possible input (so there are `n + 1` equally likely inputs, not `n`), and compute the new exact average at `n = 10` and `n = 100`, comparing it to this lesson's `n`-input-only average.
5. **Explain.** Using Lesson 73's adversary argument together with this lesson's `T_worst` definition, explain in your own words why `T_worst(n) = n` for *any* correct unsorted-search strategy, not only the two specific orders this lesson tested.

### Definition of done

- [ ] You can state the formal definitions of worst-case, best-case, and average-case cost, including why average-case alone requires an explicit distribution assumption.
- [ ] You can compute all three exactly for a real procedure by exhaustively running every input of a given size, rather than estimating from a sample.
- [ ] You can explain why two structurally different search orders can share an identical average-case cost while having opposite worst-case and best-case costs.
- [ ] You can state which of the three cases a specific past classification in this curriculum (for example, Lesson 71's `has-duplicate? = O(n²)`) was actually describing.
- [ ] You completed Exercises 1–5 using a search order not used as this lesson's own example.
- [ ] Commit your Exercise 2 through 5 findings, with a commit message stating the search order you implemented and the exact average you measured.
