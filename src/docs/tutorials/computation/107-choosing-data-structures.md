# Lesson 107: Choosing Data Structures

**What you will build**: By the end of this lesson you'll have a repeatable method — four questions, asked in order — for choosing which of this section's structures actually fits a new problem, backed by real, counted operation costs rather than only asymptotic claims, replacing "which one have I heard of" with "which one's representation invariant matches what this problem actually needs."

**What you need to know first**: Lesson 92's BST and `bst-search`; Lesson 94's `heap-peek`; Lesson 97's degenerate-BST concern; Lesson 106's ADT-versus-representation vocabulary.

**Terms introduced in this lesson**: None new — this lesson organizes already-built vocabulary into a decision procedure, grounded in measured evidence rather than naming anything further.

**Objects and methods used**: None new. This lesson reuses `bst-search`, `bst-left`, `bst-insert` (Lesson 92), `heap-peek` (Lesson 94), and `get`/`count` (Lesson 84), each already covered.

---

## Concept Unit: Which Operations Actually Need to Be Fast — Measured, Not Assumed

### The Problem

Every structure in this section supports *some* form of insert and lookup. The real first question is which specific operation is on the critical path — but is the cost difference between two structures' answers to "the same" operation actually large, or a difference this series has been overstating in Big-O notation alone?

### Introduce the concept in isolation

```clojure
(defn count-search-steps [node target steps]
  (if (nil? node)
    steps
    (if (= (bst-value node) target)
      (+ steps 1)
      (if (< target (bst-value node))
        (count-search-steps (bst-left node) target (+ steps 1))
        (count-search-steps (bst-right node) target (+ steps 1))))))

(defn count-linear-steps [values target i]
  (if (>= i (count values))
    i
    (if (= (get values i) target)
      (+ i 1)
      (count-linear-steps values target (+ i 1)))))
```

```
user=> (count-search-steps bst 70 0)
3
user=> (count-linear-steps [10 20 30 40 50 60 70] 70 0)
7
```

`bst` is Lesson 92's own balanced tree, holding the same seven values as `[10 20 30 40 50 60 70]`. Searching for `70` — the value furthest from where either search starts — costs `3` steps through the tree, `7` steps through a plain linear scan of the same seven values: a real, counted, more-than-double difference, not just an asymptotic claim.

### Discard the throwaway example

Not applicable — `count-search-steps` and `count-linear-steps` are real, reusable functions.

### Project Change

- **Reference Source**: `count-search-steps` reuses Lesson 92's `bst-search` logic directly, instrumented to return a step count instead of the found value; `count-linear-steps` reuses Lesson 24's own linear-scan shape.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn count-search-steps [node target steps]
  (if (nil? node)
    steps
    (if (= (bst-value node) target)
      (+ steps 1)
      (if (< target (bst-value node))
        (count-search-steps (bst-left node) target (+ steps 1))
        (count-search-steps (bst-right node) target (+ steps 1))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? node)`** — reappearing base case (Lesson 85): the target was never found; `steps` at this point counts every comparison made along the failed path.
- **`(+ steps 1)`** — first appearance of this specific counting use: incremented once per comparison, threaded through every recursive call, the same "compute once, pass to a helper" discipline Lesson 91 established for a different purpose.
- **`(>= i (count values))`** — reappearing counting-up base case (Lesson 94), now bounding a linear scan instead of a heap-build.

### CS Lens

This is Lesson 91's own `O(\log n)` versus `O(n)` claim, made concrete rather than asymptotic: the gap between `3` and `7` is modest at seven elements, but Lesson 91's own SE lens already showed this exact gap becomes dramatic, not subtle, at real scale — this unit measures the small case directly so that claim isn't taken purely on faith.

### SE Lens

Whichever operation shows the largest measured gap between candidate structures — here, ordered search versus linear scan — is exactly what this lesson's first question is asking about: not "which operations exist" (both structures support search), but "which operation's *cost difference* actually matters for this problem."

---

## Concept Unit: Workload and Guarantees — a Second Measured Comparison

### The Problem

Lesson 92's BST can answer "what's the minimum" via its own leftmost path; Lesson 94's heap answers the identical question via `heap-peek`. Question 1 alone doesn't obviously separate them — both support the operation. Does measuring the actual cost, on a case built for each to look reasonable on, break the tie?

### Introduce the concept in isolation

```clojure
(defn count-bst-min-steps [node steps]
  (if (nil? (bst-left node))
    (+ steps 1)
    (count-bst-min-steps (bst-left node) (+ steps 1))))
```

```
user=> (def descending-chain (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert nil 50) 40) 30) 20) 10))
user=> (count-bst-min-steps descending-chain 0)
5
user=> (heap-peek (heapify [50 40 30 20 10]))
10
```

`descending-chain` builds Lesson 92's own degenerate case, leaning left this time (each smaller value inserted becomes a left child) — finding the minimum costs `5` steps, one per level of the chain. `heap-peek`, on a heap built from the identical five values, finds the same minimum, `10`, in a single `get` — Lesson 94's own `O(1)` guarantee, now measured directly against a real worst-case BST rather than only asserted.

### Discard the throwaway example

Not applicable — `count-bst-min-steps` and `descending-chain` are real, and the comparison is a genuine measured fact.

### Project Change

- **Reference Source**: `count-bst-min-steps` reuses Lesson 93's own `bst-min` exercise shape (walk the leftmost path), instrumented to count steps; `heap-peek` reused unchanged from Lesson 94.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn count-bst-min-steps [node steps]
  (if (nil? (bst-left node))
    (+ steps 1)
    (count-bst-min-steps (bst-left node) (+ steps 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? (bst-left node))`** — reappearing `bst-left`/`nil?` (Lesson 92, Lesson 85): the leftmost node is the one whose own left subtree is empty — the base case for "no smaller value exists further left."
- **`(count-bst-min-steps (bst-left node) (+ steps 1))`** — reappearing reference-chasing recursion (Lesson 85, Lesson 102): one step per level, exactly the cost this unit measures.
- **`(heap-peek (heapify [50 40 30 20 10]))`** — reappearing `heapify`/`heap-peek` (Lesson 94, Lesson 95), run here against the identical five values as `descending-chain`, for a fair, matched comparison.

### CS Lens

This is question 1 (which operation needs to be fast) and question 2 (what does the workload look like) working together: a workload that calls "find the minimum" *often*, on data whose insertion order isn't controllable, is exactly the scenario where this unit's measured `5`-versus-`1` gap — not a hypothetical one — actually decides the choice.

### SE Lens

Both structures are *correct* here — `count-bst-min-steps` never returns a wrong answer, only a slow one. This is precisely Lesson 106's own distinction: both satisfy some ordered-collection promise, but only one's representation invariant happens to make *this specific operation* cheap, and that's a property of the representation, not the ADT.

### Connection to the previous unit

The previous unit measured a search-cost gap; this unit measures a different operation's gap on a different pair of structures, confirming the same lesson generalizes — the *specific* operation on the critical path determines which measured comparison actually matters.

---

## Concept Unit: The Cost of Choosing Wrong, Measured Directly

### The Problem

Lesson 97 already warned, in prose, that a plain BST trusted for "typical" performance can degrade badly under realistic, non-random insertion order. Does this unit's own step-counting tool make that concrete, on the exact scenario Lesson 97 described only in words?

### Introduce the concept in isolation

```clojure
(def sorted-chain (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert nil 10) 20) 30) 40) 50) 60) 70))
```

```
user=> (count-search-steps sorted-chain 70 0)
7
user=> (count-search-steps bst 70 0)
3
```

The identical seven values, the identical target, two different insertion histories: `bst` (this lesson's first unit, balanced) costs `3` steps; `sorted-chain` (Lesson 92's own worst case, built here explicitly rather than only described) costs `7` — more than double, for a structure that is, per Lesson 93's proof, every bit as *correct* as the balanced one.

### Discard the throwaway example

Not applicable — `sorted-chain` is a real tree, and both step counts are genuine, verified measurements.

### Project Change

- **Reference Source**: Directly reuses `count-search-steps` (this lesson's first unit) and Lesson 92's `bst-insert`, applied here to Lesson 97's own previously-described-but-unbuilt worst case.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(def sorted-chain (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert nil 10) 20) 30) 40) 50) 60) 70))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(bst-insert (bst-insert ... nil 10) ... 70)`** — reappearing (Lesson 92): seven nested calls, each value larger than every one already present, reproducing Lesson 97's own worst-case insertion order as an actual, runnable tree.
- **`(count-search-steps sorted-chain 70 0)`** — reappearing (this lesson's first unit), applied to a genuinely different tree shape than that unit used, isolating *insertion order* as the only variable that changed.

### CS Lens

This is question 3 (what guarantee is actually required) made measurable: `bst-search` on `sorted-chain` is not a different function, nor a buggy one — it's the identical, Lesson-93-proven-correct code, paying a real, counted cost because nothing about a plain BST's representation invariant constrains *shape*, only *order*.

### SE Lens

Choosing between Lesson 92's plain BST and Lesson 98's AVL tree for a workload resembling `sorted-chain`'s own insertion order isn't a matter of taste — it's the direct, measured difference between `3` steps and `7`, here, at seven elements; Lesson 98's own SE lens already showed that gap only widens as `n` grows.

### Connection to the previous unit

The previous unit measured two different structures on matched data; this unit measures the *identical* structure and function on two different insertion histories — proof that "which structure" is only half the choice this lesson's method has to make; "built under what conditions" is the other half.

---

## Connect the Pieces

Every measurement from this lesson, together:

```clojure
(println "Balanced BST, search for 70:" (count-search-steps bst 70 0) "steps")
(println "Linear scan, search for 70:" (count-linear-steps [10 20 30 40 50 60 70] 70 0) "steps")
(println "Degenerate BST (sorted insert), search for 70:" (count-search-steps sorted-chain 70 0) "steps")
(println "BST find-min, worst case:" (count-bst-min-steps descending-chain 0) "steps")
(println "Heap peek, any case:" 1 "step")
```

```
Balanced BST, search for 70: 3 steps
Linear scan, search for 70: 7 steps
Degenerate BST (sorted insert), search for 70: 7 steps
BST find-min, worst case: 5 steps
Heap peek, any case: 1 step
```

Every one of this section's structures is correct; this lesson's whole method exists because "correct" was never the question — every number in this table is a real, measured answer to "how much work, exactly," the question this section's own asymptotic claims were always standing in for.

## What Breaks Without This

Suppose a system stored millions of user records in Lesson 92's plain BST, keyed by account-creation timestamp — accounts created in time order mean every insertion adds the current largest value, exactly `sorted-chain`'s own shape, at real scale. This lesson's method, applied *before* writing any code — operations (ordered lookup), workload (insertion order is timestamps, not random, a live warning sign per this lesson's own `sorted-chain` measurement), guarantee required (yes, given the workload) — would have flagged Lesson 98 or Lesson 99 as the right choice before a single record was ever inserted, rather than discovering the `3`-versus-`7`-and-growing gap only after real, sorted-by-nature data degraded the plain BST in production.

## Exercises

1. **Trace.** By hand, trace `(count-search-steps sorted-chain 10 0)` — the *first*-inserted value, now sitting at the root. Confirm it costs only `1` step, despite the tree's own degenerate shape.
2. **Predict.** Before checking, predict `(count-linear-steps [10 20 30 40 50 60 70] 10 0)` — the same first value, via linear scan. Verify, and explain why this case *doesn't* favor the BST the way searching for `70` did.
3. **Verify.** Build an AVL version of `sorted-chain` using `avl-insert` (Lesson 98) on the identical seven values, and confirm `count-search-steps` on it costs `3`, not `7`.
4. **Break it, on purpose.** Find a specific target value where `count-search-steps` on `sorted-chain` and on `bst` return the *same* number of steps, despite the trees' very different shapes — explain why that particular target doesn't expose the gap.
5. **Generalize.** Using this lesson's four questions, decide between Lesson 89's hash table and Lesson 101's trie for "autocomplete suggestions as a user types" — state which question settles it.
6. **Reconstruct.** Close this lesson. From memory, state the four questions in order, and explain why this lesson insisted on *measuring* real step counts rather than trusting Big-O notation alone.

## Definition of Done

- [ ] You can state this lesson's four questions from memory, in order.
- [ ] You can implement a step-counting instrumentation of a function you didn't write this lesson.
- [ ] You can explain, using real measured numbers, why insertion order changes `bst-search`'s cost but not its correctness.
- [ ] You completed Exercise 3 and confirmed the AVL version resists `sorted-chain`'s own degeneration.
- [ ] You completed Exercise 5 and applied the method to a new scenario.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you measured and decided — for example, `"Confirm avl-insert resists sorted-chain degeneration (3 steps vs 7); apply four-question method to autocomplete (trie wins on question 1)"` — not just `"lesson 107 exercise"`.

---

**Next lesson:** Lesson 108, *Designing a Data Structure*, is this section's checkpoint — no new concept, minimal scaffolding, and a companion implementation with a deliberately planted mistake for you to find before it's revealed, putting this section's own four-question method to real use.
