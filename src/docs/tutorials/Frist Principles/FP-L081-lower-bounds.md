# Lesson 81: Lower Bounds

**What you will build:** a real, exhaustive check — every single one of `40,320` possible orderings of an `8`-element list, not a sample — confirming that `merge-sort`'s true worst-case comparison count (`17`, found by brute force) is never less than `log₂(8!) ≈ 15.3`, the real, computed value of a **decision-tree** lower bound that applies to *any* comparison-based sorting algorithm, not just `merge-sort`. The transferable point: Lesson 73 proved a lower bound for one specific problem (unsorted search) using an adversary argument tailored to that problem. This lesson generalizes the *idea* — ruling out every possible algorithm at once, not measuring one — to an entirely different technique, a counting argument over decision trees, and applies it to answer a question Lesson 79 and 80 left open: is `Θ(n log n)` sorting actually the best any comparison-based algorithm could ever do, or just the best one this curriculum happened to derive?

**What you need to know first:** Lesson 73 (`FP-L073-big-omega.md`) — specifically the adversary argument, and the general idea of a lower bound applying to every possible algorithm for a problem, not one implementation. Lesson 58 (`FP-L058-permutations.md`) — specifically `permutations`, reused directly to exhaustively generate every possible ordering for this lesson's real check. Lesson 79 (`FP-L079-merge-sort.md`) — specifically `merge-sort`, whose true worst case this lesson finds by brute force for the first time.

**Terms introduced in this lesson**

- **Decision tree (for a comparison-based algorithm)** — a way of modeling *any* algorithm that only learns about its input by comparing pairs of elements: each internal node represents one comparison, branching two ways for its two possible outcomes, and each leaf represents one final answer the algorithm could produce. It exists to turn "how many comparisons does *some* algorithm need" into a countable, structural question about trees — the same shift from one implementation to every possible implementation that Lesson 73's adversary argument made for search, now made by counting instead of adversarial reasoning.

---

## Concept Unit 1: Is n log n Actually the Best Possible?

### The Problem

Lesson 79 derived `merge-sort`, real and correct, running in `Θ(n log n)`. Lesson 80 showed `quicksort` sharing that same typical growth rate. Nothing so far has actually ruled out the *possibility* that some other, not-yet-invented comparison-based sorting algorithm could do better — the way Lesson 73's adversary argument ruled out beating `Θ(n)` for unsorted search, for every possible algorithm, not just `linear-search`.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, using Lesson 79 and 80's own real, already-measured algorithms.

### Applying It — Why This Needs a New Kind of Argument

Lesson 73's adversary argument worked by reasoning about an adversary choosing unfavorable answers to a search algorithm's checks. Sorting is a genuinely different kind of problem: a sorting algorithm doesn't just answer yes-or-no about one target, it must produce one specific, fully correct final ordering out of every ordering the input could possibly have started in. Ruling out every possible sorting algorithm needs an argument built around *that* fact specifically — how many different orderings exist, and how much a single comparison can possibly reveal about which one it is.

### Walkthrough

- **The direct question, stated precisely** — is `Θ(n log n)` a genuine floor, or just the best result this curriculum has derived so far?
- **The named structural difference from Lesson 73's problem** — search asks "is X present"; sorting asks "which of every possible ordering is this one" — a different kind of question, needing a different lower-bound technique.

### CS Lens

This is exactly the kind of question a lower bound is built to answer: not "is this specific algorithm good," but "could *any* algorithm, including ones nobody has thought of yet, ever do fundamentally better." Also recognized in: a physicist asking whether a proposed engine design could ever be improved with cleverer engineering, versus asking whether *any* engine, however cleverly designed, could beat a hard thermodynamic limit.

### SE Lens

The alternative to seeking a lower bound is to keep deriving new sorting algorithms and comparing their real, measured performance against `merge-sort` and `quicksort`, hoping to eventually find something faster by trial and effort. The real cost of that alternative, if `Θ(n log n)` genuinely is optimal, is unbounded wasted effort searching for something that provably cannot exist. A real lower bound, once established, ends that search with certainty rather than accumulating more and more unsuccessful attempts.

---

## Concept Unit 2: The Decision-Tree Argument

### The Problem

Concept Unit 1's question needs a real, general argument — one that reasons about the entire space of possible comparison-based sorting algorithms, not any one of them.

### No isolated lab for this step

This concept has no code of its own to isolate — the argument is stated directly below, and Concept Unit 3 checks its real, computed conclusion.

### Applying It — The Argument, Step by Step

**Modeling any comparison-based sort as a decision tree.** Any algorithm that sorts by comparing pairs of elements can be pictured as a tree: at each internal node, the algorithm makes one comparison; the two branches below it correspond to the comparison's two possible outcomes. Following any single root-to-leaf path corresponds to one specific run of the algorithm on some specific input, making one specific sequence of comparisons.

**Counting how many distinct answers the tree must produce.** For a list of `n` distinct elements, there are `n!` possible orderings the original input could have started in — Lesson 58's own real subject. A correct sorting algorithm must end up at a *different* leaf for each of these `n!` possible starting orderings (if two different starting orderings ever led to the identical leaf, the algorithm couldn't have correctly distinguished them). So the tree needs at least `n!` leaves.

**Connecting leaf count to tree depth.** Every internal node branches exactly two ways — one comparison's two possible outcomes. A binary tree of depth `d` has at most `2^d` leaves. For a tree with at least `n!` leaves to exist at all, its depth must satisfy `2^d ≥ n!`, which means `d ≥ log₂(n!)`.

**Naming the conclusion.** The tree's depth is exactly the *worst-case* number of comparisons the algorithm could make — the longest possible root-to-leaf path. So *any* correct comparison-based sorting algorithm, however cleverly designed, needs at least `log₂(n!)` comparisons in its worst case. Since `log₂(n!)` grows in proportion to `n log₂(n)` (checked directly in Concept Unit 3), this proves `Ω(n log n)` is a genuine floor for the entire *problem* of comparison-based sorting — not a property of `merge-sort` or `quicksort` specifically.

### Walkthrough

- **"a tree with at least `n!` leaves"** — the crux of the entire argument: correctness itself, not efficiency, is what forces the tree to be large.
- **"a binary tree of depth `d` has at most `2^d` leaves"** — a purely structural fact about trees, not about sorting at all, doing the real work of turning a leaf count into a depth requirement.
- **"the tree's depth is exactly the worst-case number of comparisons"** — connects the abstract tree picture back to something concretely measurable, the same kind of connection Lesson 77's recurrence trees made between a tree's shape and a real call count.

### CS Lens

This is the standard technique for proving lower bounds across an entire class of algorithms defined by *how* they're allowed to learn about their input (here, only by pairwise comparison) — a counting argument, genuinely different in kind from Lesson 73's adversary argument, but serving the identical purpose: ruling out every possible member of the class at once. Also recognized in: proving a minimum number of yes/no questions needed to identify one item out of a known set of possibilities (a logic puzzle's information-theoretic floor), using the identical reasoning — enough distinct final states must exist, and each yes/no question can only double how many can be told apart.

### SE Lens

The alternative to a counting argument here is to keep trying variations on `merge-sort` and `quicksort`, hoping intuition eventually finds something asymptotically faster. The real cost of that alternative, given this lesson's conclusion, is effort spent searching for something the argument shows cannot exist within the comparison-based model. Proving the bound once, as this unit does, converts unbounded, uncertain search into a settled, permanent fact — freeing real engineering effort to focus on genuinely open questions instead (a different sorting *model*, for instance, one that doesn't rely on comparisons at all, which is exactly why non-comparison-based sorts like counting sort can beat `n log n` under different assumptions — a real, honest exception this lesson's bound does not rule out, because it was never a claim about *every* algorithm, only comparison-based ones).

---

## Concept Unit 3: Verifying log₂(n!)'s Real Growth Rate

### The Problem

Concept Unit 2's conclusion depends on `log₂(n!)` actually growing like `n log₂(n)`, the same growth-rate category Lesson 69 named and Lesson 79 measured for `merge-sort`. That's worth checking directly, with real computed numbers, rather than assumed.

### The New Code — Type It Yourself

```scheme
(define (log2-factorial n)
  (let loop ((k 1) (total 0.0))
    (if (> k n)
        total
        (loop (+ k 1) (+ total (/ (log k) (log 2)))))))
```

### The Updated Project

This is `lower-bound.scm`, in full:

```scheme
(define (log2-factorial n)                                    ; ← new
  (let loop ((k 1) (total 0.0))                                  ; ← new
    (if (> k n)                                                    ; ← new
        total                                                       ; ← new
        (loop (+ k 1) (+ total (/ (log k) (log 2)))))))               ; ← new

(for-each
 (lambda (n)
   (display "n=") (display n)
   (display " log2(n!)=") (display (log2-factorial n))
   (display " n*log2(n)=") (display (exact->inexact (* n (/ (log n) (log 2)))))
   (newline))
 (list 10 100 1000 10000))
```

### Reference Source

No reference counterpart — `log2-factorial` directly implements Concept Unit 2's `log₂(n!) = Σ log₂(k)` for `k` from `1` to `n`, a from-scratch computation of the derived bound.

### Files affected

Created: `lower-bound.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile lower-bound.scm
n=10 log2(n!)=21.791061114716953 n*log2(n)=33.219280948873624
n=100 log2(n!)=524.7649932900598 n*log2(n)=664.3856189774725
n=1000 log2(n!)=8529.398004204777 n*log2(n)=9965.784284662088
n=10000 log2(n!)=118458.14300288173 n*log2(n)=132877.1237954945
```

Verified this session — the ratio of `log₂(n!)` to `n × log₂(n)` (`0.656`, `0.790`, `0.856`, `0.891` at each size) climbs steadily toward `1` rather than drifting toward `0` or diverging, confirming `log₂(n!)` genuinely grows in the identical `n log n` category, not merely resembling it loosely at small sizes.

### Mechanical Walkthrough

- **`(let loop ((k 1) (total 0.0)) ...)`** — a reappearance of the named-`let` looping idiom; accumulates a running sum, starting from an inexact `0.0` so the total stays a real (non-exact-rational) number throughout.
- **`(/ (log k) (log 2))`** — a reappearance of `log`, `/`; computes `log₂(k)` from Guile's natural logarithm, the identical technique used in Lesson 79 and 80's own growth-rate checks.
- **`(+ total (/ (log k) (log 2)))`** — a reappearance of `+`; adds each term, directly implementing `Σ log₂(k)`, the sum-of-logs definition of `log₂(n!)` (since `log₂(n!) = log₂(1 × 2 × ... × n) = log₂(1) + log₂(2) + ... + log₂(n)`).
- **The real, climbing ratio toward `1`** — direct, computed confirmation of Concept Unit 2's claimed growth-rate category, not asserted from Stirling's approximation without checking.

### CS Lens

This is the same ratio-to-a-reference-formula technique this curriculum has used since Lesson 64's `f(n)/n² → 3`, now applied to confirm a *lower bound's own* growth rate, not an algorithm's. Also recognized in: confirming a newly proposed physical constant's measured value converges toward a theoretically predicted one as measurement precision improves, rather than accepting the theoretical derivation on faith alone.

### SE Lens

The alternative to computing `log2-factorial` directly is to cite Stirling's approximation (`log₂(n!) ≈ n log₂(n) - n/ln(2)`) and trust it without checking. The real cost of that alternative is exactly this curriculum's standing concern since Lesson 22 — trusting a cited formula instead of confirming it against a real, independent computation. Summing `log₂(k)` directly, as this unit does, computes the exact value being claimed, not an approximation of it.

---

## Concept Unit 4: Exhaustive, Real Confirmation Against merge-sort's True Worst Case

### The Problem

Concept Unit 2's bound needs checking against a real algorithm's *true* worst case — not one specific input like Lesson 79's reverse-sorted check, but the actual maximum over every possible input, found exhaustively rather than assumed.

### The New Code — Type It Yourself

```scheme
(define (find-worst-case sort-proc n)
  (let ((all-orderings (permutations (iota n)))
        (worst 0))
    (for-each
     (lambda (ordering)
       (set! comparisons 0)
       (sort-proc ordering)
       (if (> comparisons worst) (set! worst comparisons)))
     all-orderings)
    worst))
```

### The Updated Project

This is `worst-case-check.scm`, in full:

```scheme
(define (remove-item x lst)
  (filter (lambda (y) (not (equal? y x))) lst))

(define (permutations lst)
  (if (null? lst)
      (list '())
      (apply append
             (map (lambda (x)
                    (map (lambda (p) (cons x p))
                         (permutations (remove-item x lst))))
                  lst))))

(define comparisons 0)

(define (merge-c a b)
  (cond ((null? a) b)
        ((null? b) a)
        (else (set! comparisons (+ comparisons 1))
              (if (< (car a) (car b))
                  (cons (car a) (merge-c (cdr a) b))
                  (cons (car b) (merge-c a (cdr b)))))))

(define (merge-sort-c lst)
  (if (or (null? lst) (null? (cdr lst)))
      lst
      (let* ((half (quotient (length lst) 2))
             (left (merge-sort-c (list-head lst half)))
             (right (merge-sort-c (list-tail lst half))))
        (merge-c left right))))

(define (find-worst-case sort-proc n)                          ; ← new
  (let ((all-orderings (permutations (iota n)))                  ; ← new
        (worst 0))                                                 ; ← new
    (for-each                                                        ; ← new
     (lambda (ordering)                                                ; ← new
       (set! comparisons 0)                                              ; ← new
       (sort-proc ordering)                                                ; ← new
       (if (> comparisons worst) (set! worst comparisons)))                  ; ← new
     all-orderings)                                                           ; ← new
    worst))                                                                     ; ← new

(define (log2-factorial n)
  (let loop ((k 1) (total 0.0))
    (if (> k n)
        total
        (loop (+ k 1) (+ total (/ (log k) (log 2)))))))

(for-each
 (lambda (n)
   (display "n=") (display n)
   (display " num-perms=") (display (length (permutations (iota n))))
   (display " real-max-comparisons=") (display (find-worst-case merge-sort-c n))
   (display " log2(n!)=") (display (log2-factorial n))
   (newline))
 (list 4 5 6 7 8))
```

`permutations` and `remove-item` are Lesson 58's own, unchanged; `merge-c` and `merge-sort-c` are Lesson 79's `merge` and `merge-sort` with Lesson 31-style counting added; `log2-factorial` is Concept Unit 3's own, unchanged.

### Reference Source

Lesson 58's `permutations` (`FP-L058-permutations.md`, Concept Unit 4) and Lesson 79's `merge-sort` (`FP-L079-merge-sort.md`, Concept Unit 3), both reused directly; `find-worst-case` is new, checking every generated ordering exhaustively rather than sampling.

### Files affected

Created: `worst-case-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile worst-case-check.scm
n=4 num-perms=24 real-max-comparisons=5 log2(n!)=4.584962500721156
n=5 num-perms=120 real-max-comparisons=8 log2(n!)=6.906890595608518
n=6 num-perms=720 real-max-comparisons=11 log2(n!)=9.491853096329674
n=7 num-perms=5040 real-max-comparisons=14 log2(n!)=12.299208018387278
n=8 num-perms=40320 real-max-comparisons=17 log2(n!)=15.299208018387278
```

Verified this session — every single one of `24`, `120`, `720`, `5,040`, and `40,320` possible orderings was actually run, not sampled, at each size. At every size, `merge-sort`'s real, exhaustively-found worst case exceeds `log₂(n!)`, exactly as Concept Unit 2's bound requires, and stays remarkably close to it — at `n = 8`, a real worst case of `17` against a bound of `15.3`, a gap of under `2` comparisons, out of `40,320` possible orderings checked.

### Mechanical Walkthrough

- **`(permutations (iota n))`** — a reappearance of `permutations` (Lesson 58) and `iota`; generates every one of the `n!` possible orderings of `n` distinct elements, exhaustively.
- **`(for-each (lambda (ordering) ...) all-orderings)`** — a reappearance of `for-each`; runs the instrumented sort on every single generated ordering, not a sample.
- **`(if (> comparisons worst) (set! worst comparisons))`** — a reappearance of `if`, `>`, `set!`; keeps a running maximum across every ordering checked, exactly `T_worst(n)`'s own definition (Lesson 74) computed exhaustively rather than assumed.
- **The real, exhaustive result at every size, always exceeding the computed bound** — direct, checked confirmation that Concept Unit 2's argument correctly predicts a genuine floor on real, measured behavior.

### CS Lens

This is Lesson 74's `T_worst(n)` definition and this lesson's decision-tree bound meeting directly: the exhaustive real maximum (Lesson 74's own exact computation technique, applied here to every ordering rather than every target position) is checked against an independently derived theoretical floor, and the two agree — real evidence never falls below the bound, and stays close to it, confirming `merge-sort` isn't just `Θ(n log n)`, it's close to the best any comparison-based algorithm could possibly achieve. Also recognized in: an engineering test rig that physically tries every documented failure mode of a component and confirms none of them beat a theoretically calculated safety margin, with the real worst measured case coming impressively close to, but never crossing, the theoretical limit.

### SE Lens

The alternative to an exhaustive check is to test `merge-sort` against a handful of chosen inputs — sorted, reverse-sorted, a few shuffles — and trust that the worst among those represents the true worst case. The real cost of that alternative is exactly what Lesson 79's own reverse-sorted measurement already illustrated unintentionally: reverse-sorted turned out to be a comparatively easy case for `merge-sort`, not a hard one, and a handful of hand-picked inputs could easily miss the genuine worst case entirely. Checking literally every possible ordering, as this unit does — feasible only because `n` is kept small enough for `n!` to stay computationally reachable — is what makes "true worst case" a checked fact instead of a guess.

---

## Closing

### Connect the pieces

One general lower bound, derived by counting, then checked against a real algorithm exhaustively:

1. **The open question (Unit 1):** is `Θ(n log n)` sorting genuinely optimal, or just the best this curriculum has built so far?
2. **The decision-tree argument (Unit 2):** any comparison-based sort needs a tree with at least `n!` leaves to correctly distinguish every possible input ordering, forcing worst-case depth (comparisons) of at least `log₂(n!)`.
3. **The bound's own growth rate, verified (Unit 3):** `log₂(n!)`'s ratio to `n log₂(n)` climbs toward `1`, real, computed evidence it belongs to the identical growth-rate category.
4. **Exhaustive confirmation (Unit 4):** every one of `40,320` orderings of an `8`-element list checked, `merge-sort`'s real worst case (`17`) exceeding the bound (`15.3`) by less than `2` — real, checked, and close to optimal.

Every claim in this lesson traces to a real computation — a counting argument checked by direct calculation, and an exhaustive, not sampled, check against a real algorithm's true worst case — extending Lesson 73's single-problem lower bound into a general technique applicable to an entirely different kind of problem.

### What breaks without this

Suppose an engineer spent significant effort attempting to design a comparison-based sorting algorithm meaningfully faster than `Θ(n log n)`, believing `merge-sort` and `quicksort` simply hadn't been optimized enough yet. This lesson's decision-tree bound shows that effort is provably wasted *within the comparison-based model* — no amount of cleverness can produce a correct comparison-based sort doing fewer than `Ω(n log n)` comparisons in the worst case, because the argument depends only on counting how many distinguishable outcomes must exist, not on any particular algorithm's design. Knowing this in advance, as this lesson establishes, redirects real effort toward the genuinely open question instead — whether a *different* model (not restricted to pairwise comparisons, like counting sort under known-range assumptions) might do better, rather than continuing to search for an impossible comparison-based improvement.

### Exercises

1. **Observe.** Before checking, predict whether `quicksort` (Lesson 80) would show the identical real worst-case comparison counts as `merge-sort` at `n = 4` through `n = 8`, using this lesson's exhaustive method.
2. **Formalize.** Run Concept Unit 4's `find-worst-case` against an instrumented `quicksort` (Lesson 80) at `n = 4` through `n = 8`, and report whether its real worst case matches, exceeds, or falls between `merge-sort`'s and the `log₂(n!)` bound.
3. **Explain.** State, in your own words, why the decision-tree argument requires the tree to have at least `n!` leaves specifically, referencing what would go wrong for a correct sorting algorithm if two different starting orderings led to the identical leaf.
4. **Formalize.** Compute `log₂(n!)` at `n = 20` and `n = 25`, sizes too large to check exhaustively by brute force (`20!` and `25!` are far too many permutations to generate), and explain why this lesson's Concept Unit 3 approach still works at those sizes even though Concept Unit 4's approach does not.
5. **Explain.** Using this lesson's SE Lens point about counting sort, explain in your own words why a sorting algorithm that never directly compares two elements against each other (instead, say, using each element's value as an index) is not bound by this lesson's `Ω(n log n)` result at all.

### Definition of done

- [ ] You can state the decision-tree argument's three steps: modeling comparisons as a tree, counting required leaves, connecting leaf count to required depth.
- [ ] You can explain why this lesson's lower bound applies to every possible comparison-based sorting algorithm, not just `merge-sort` or `quicksort`.
- [ ] You can explain why an exhaustive check (every permutation) is stronger evidence of a true worst case than checking a handful of chosen inputs, referencing Lesson 79's reverse-sorted case specifically.
- [ ] You completed Exercise 2, exhaustively checking `quicksort`'s real worst case against the identical bound.
- [ ] You completed Exercises 1–5, including explaining at least one real limit of this lesson's bound (Exercise 5).
- [ ] Commit your Exercise 2 and 4 findings, with a commit message stating which algorithm and sizes you checked and whether the bound held.
