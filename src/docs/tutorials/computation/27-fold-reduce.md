# Lesson 27: Fold / Reduce

**What you will build**: By the end of this lesson you'll have derived `reduce` — the third and most general of this section's core list tools — and discovered that several functions this series has already written separately (`sum-to`'s list-processing cousin, a product function, `my-length`) were all, underneath, the identical shape. You'll also see precisely why the order `reduce` processes elements in isn't a minor detail, using a combining operation where order genuinely changes the answer.

**What you need to know first**: Lesson 24's `list-sum` exercise, `my-length`, and the derivation process the previous two lessons used for `map` and `filter`.

**Terms introduced in this lesson**:

- **reduce** (or **fold**) — a function that combines every element of a list into a single accumulated result, by repeatedly applying a combining function to the current accumulator and the next element, starting from a given initial value. *Why it matters*: the most general of this section's core list tools — this lesson shows that summing, multiplying, and counting a list's elements are all specific instances of one shared shape, not three unrelated patterns.
- **accumulator** — a value that carries a computation's running result forward from one step to the next, updated at each step rather than recomputed from scratch. *Why it matters*: this is what `reduce`'s initial value becomes as it processes each element — the first real appearance of a pattern Lesson 34 studies in its own right, independent of `reduce` specifically.

**Objects and methods used**:

- **`reduce`**
  - *What it is:* a function in Clojure's core library that combines every element of a list into one accumulated result.
  - *Implementation:* `(reduce f init a-list)` — starts with `init` as the accumulator; for each element `x` of `a-list`, in order, replaces the accumulator with `(f accumulator x)`; returns the final accumulator once every element has been processed. Verified established behavior: `(reduce + 0 (list 1 2 3 4))` → `10`; the combining function always receives the accumulator *first*, the current element *second*.
  - *Its use:* Concept Unit 2, replacing the shared shape Concept Unit 1 identifies across three separately-written functions.

---

## Concept Unit: The Same Shape, Combining Into One Value

### The Problem

Write a function that sums every number in a list. Then write one that multiplies every number in a list together. Then recall `my-length` from Lesson 24, which counts a list's elements. Three functions computing three different kinds of answers — do they actually differ as much as they seem to?

### Introduce the concept in isolation

```clojure
(defn list-sum [lst]
  (if (empty? lst)
    0
    (+ (first lst) (list-sum (rest lst)))))

(defn list-product [lst]
  (if (empty? lst)
    1
    (* (first lst) (list-product (rest lst)))))

(defn my-length [lst]
  (if (empty? lst)
    0
    (+ 1 (my-length (rest lst)))))
```

```
user=> (list-sum (list 1 2 3 4))
10
user=> (list-product (list 1 2 3 4))
24
user=> (my-length (list 1 2 3 4))
4
```

All three share an identical shape: a base case returning some fixed starting value (`0`, `1`, `0` — different per function, but each one *fixed*), and a recursive case combining `(first lst)` with the result of recursing on `(rest lst)`, using some operation (`+`, `*`, or "ignore the element, just add `1`"). Three functions, one shape, three different (starting value, combining operation) pairs.

### Discard the throwaway example

Not applicable — all three functions directly motivate this lesson's real content.

### Generalizing

This is the identical realization Lesson 25 had about `map` (one shape, one varying transformation) and Lesson 26 had about `filter` (one shape, one varying predicate) — except this time, *two* things vary together: the starting value, and the combining operation. Naming and extracting both is this lesson's task.

### CS Lens

Recognizing that summing, multiplying, and counting are the same underlying shape is a small, concrete instance of a much larger fact: an enormous number of computations that look completely different on the surface reduce (in both senses of the word) to "start somewhere, combine one element at a time" — the exact idea Lesson 152 (*Folds as Algebra*) returns to formally, much later, connecting it to the algebraic structures Section VII studies in depth.

### SE Lens

Three separately-maintained functions sharing one shape means three separate places the shared shape's base case and recursive structure could each independently drift or break — the identical repeated-shape risk Lesson 25 and Lesson 26 already named for `map` and `filter`, now recognized a third time.

---

## Concept Unit: Deriving `reduce`

### The Problem

Both the starting value and the combining operation varied across the three functions. Can both be taken as parameters, the way `map` took its transformation and `filter` took its predicate?

### Introduce the concept in isolation

Write the shared shape once, as an **accumulator**-passing function — carrying the running result forward as a parameter, rather than combining it *after* the recursive call returns:

```clojure
(defn my-reduce [f init lst]
  (if (empty? lst)
    init
    (my-reduce f (f init (first lst)) (rest lst))))
```

```
user=> (my-reduce + 0 (list 1 2 3 4))
10
user=> (my-reduce * 1 (list 1 2 3 4))
24
```

Trace `(my-reduce + 0 (list 1 2 3 4))` to see the accumulator update at each step:

```
my-reduce(+, 0, (1 2 3 4))
  → my-reduce(+, (+ 0 1) = 1, (2 3 4))
    → my-reduce(+, (+ 1 2) = 3, (3 4))
      → my-reduce(+, (+ 3 3) = 6, (4))
        → my-reduce(+, (+ 6 4) = 10, ())
          → base case: return 10
```

Unlike `list-sum`'s trace (Lesson 24's style — combine happens *after* the recursive call returns), `my-reduce`'s accumulator is updated *before* each recursive call, and the base case simply returns whatever the accumulator has already become — no combining left to do once the list is empty.

Compare against Clojure's real `reduce`:

```
user=> (reduce + 0 (list 1 2 3 4))
10
user=> (reduce * 1 (list 1 2 3 4))
24
```

Identical results — `my-reduce` reproduces the real `reduce` exactly, including its exact argument order: the combining function always receives the accumulator first, the current element second, in both.

### Discard the throwaway example

Not applicable — `my-reduce` and `reduce` are both standard, permanent tools from here forward.

### Project Change

- **Reference Source**: No reference counterpart — `reduce`'s behavior is derived directly from the previous unit's three hand-written functions.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn my-reduce [f init lst]
  (if (empty? lst)
    init
    (my-reduce f (f init (first lst)) (rest lst))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(f init (first lst))`** — first appearance of updating an **accumulator**: the new value the accumulator becomes *before* the next recursive call, rather than a value computed *after* the recursive call returns, the way every previous recursive function in this series (`sum-to`, `factorial`, `my-length`, `list-sum`) worked.
- **`(my-reduce f (f init (first lst)) (rest lst))`** — the recursive call itself, carrying the *updated* accumulator forward, along with the smaller list — two things shrinking and changing together, rather than one.
- **`init`** at the base case — simply returned directly, with no further combining, since the accumulator already holds the complete answer by the time the list runs out.

### CS Lens

Also recognized in: a running total kept on a physical adding machine (each new receipt updates the total directly, rather than the machine remembering every receipt and adding them all up at the end), and a marathon's live leaderboard (updated incrementally as each runner finishes, never recomputed from scratch).

### SE Lens

`list-sum` (Lesson 24's style) and `my-reduce` (this lesson's style) compute the identical answer for `+`, but organize the work differently — `list-sum` waits until the recursive call returns before combining; `my-reduce` combines immediately and carries the result forward. This distinction feels cosmetic here, but Lesson 34 (*Accumulators*) and Lesson 35 (*Tail Recursion*) both show it has real, practical consequences for how much a running program needs to remember at once — a difference invisible in this lesson's small examples and significant at scale.

### Connection to the previous unit

The previous unit identified one shared shape across three functions with two varying pieces; this unit extracts both into parameters, producing one tool — verified to exactly match Clojure's own `reduce`, not merely resemble it.

---

## Concept Unit: Order Matters — `reduce` Processes Left to Right

### The Problem

`+` and `*` are both commutative and associative — grouping and order never change the answer, which is exactly why `reduce`'s specific processing order was invisible in every example so far. Does the order actually matter, in general, or was this lesson just lucky in its choice of examples?

### Introduce the concept in isolation

```
user=> (reduce - 0 (list 1 2 3))
-6
```

Trace it, the same accumulator-updating way as before:

```
reduce(-, 0, (1 2 3))
  → reduce(-, (- 0 1) = -1, (2 3))
    → reduce(-, (- -1 2) = -3, (3))
      → reduce(-, (- -3 3) = -6, ())
        → base case: return -6
```

`-6`, not `-4` (which `1 - 2 - 3` read the ordinary way might suggest) and not `2` (which combining in the opposite order, `1 - (2 - 3)`, would give). `reduce`'s answer is *exactly* `((0 - 1) - 2) - 3` — the accumulator starts at `init` and is combined with each element strictly left to right, no exceptions, no reordering. For `+` and `*`, this specific order was invisible because those operations don't care about order or grouping; for `-`, which cares about both, the order is not a minor detail — it's the entire answer.

### Discard the throwaway example

Not applicable — this trace is the actual verification of a real, precise fact about `reduce`'s behavior.

### CS Lens

An operation where grouping and order don't affect the result — like `+` and `*` — is exactly Lesson 140's **algebraic structure** vocabulary (a monoid, formally introduced in Lesson 141) waiting to be named properly; `reduce` works correctly and predictably for *any* combining function, but only produces an order-independent answer when the function itself has that property. `-` simply doesn't, and `reduce`'s left-to-right discipline is what makes its result on a non-associative function precise and reproducible rather than ambiguous.

### SE Lens

Knowing `reduce`'s exact processing order — left to right, accumulator first — matters most exactly when the combining function isn't commutative or associative: using `reduce` to build a report, a formatted string, or any result where sequence carries meaning depends entirely on this being a fixed, guaranteed order, not an implementation detail that happens to work out. Assuming `reduce`'s order doesn't matter, based only on examples using `+` or `*`, is a real, easy mistake this unit's `-` example exists specifically to prevent.

### Connection to the previous unit

The previous unit derived `reduce`'s mechanism using commutative operations, where the exact processing order was invisible in the results; this unit uses a non-commutative one specifically to make that same order visible and precise, rather than leaving it an untested assumption.

---

## Connect the Pieces

All three original functions, now expressed as `reduce` calls, confirming Concept Unit 1's claim directly:

```clojure
(println "list-sum via reduce:" (reduce + 0 (list 1 2 3 4)))
(println "list-product via reduce:" (reduce * 1 (list 1 2 3 4)))
(println "my-length via reduce:" (reduce (fn [acc _] (+ acc 1)) 0 (list 1 2 3 4)))
```

```
list-sum via reduce: 10
list-product via reduce: 24
my-length via reduce: 4
```

Every one matches the hand-written version from Concept Unit 1 exactly. The length version's combining function, `(fn [acc _] (+ acc 1))`, ignores the element entirely (the `_` parameter name signals this deliberately) and just increments the accumulator — proof that `reduce`'s combining function doesn't have to use the current element at all, only that it's *given* the opportunity to. Three functions that looked unrelated at the start of this lesson are now three specific arguments to one shared tool.

## What Breaks Without This

Suppose someone used `reduce` with `-` to compute "total withdrawals subtracted from a starting balance," assuming (incorrectly, based only on experience with `+`) that argument order wouldn't matter:

```clojure
(def starting-balance 100)
(def withdrawals (list 20 30 10))

(println "Intended: 100 - 20 - 30 - 10 =" (reduce - starting-balance withdrawals))
```

```
Intended: 100 - 20 - 30 - 10 = 40
```

This one actually comes out correctly — `((100 - 20) - 30) - 10 = 40` matches the intended left-to-right subtraction exactly, because `reduce`'s real order (accumulator first, left to right) happens to match how "subtract these one at a time, starting from 100" is naturally meant. The risk isn't in this specific case — it's in trusting that match without having verified it, the way Concept Unit 3's `(reduce - 0 (list 1 2 3))` example showed a case where the "obvious" reading (`1 - 2 - 3 = -4`) and `reduce`'s actual behavior can still diverge from a *different* naive expectation (starting from `0` instead of the first list element changes what "the obvious answer" even means). Verifying `reduce`'s exact order against a hand trace, as this lesson did, is what turns "probably works the way I expect" into "confirmed to work exactly this way."

## Exercises

1. **Trace.** By hand, trace `(reduce * 1 (list 2 3 4))`, showing the accumulator's value after each step, before running it to check.
2. **Predict.** Before running it, predict `(reduce - 100 (list 20 30 10))` using this lesson's exact left-to-right rule. Check your prediction.
3. **Derive.** Using `reduce`, write a one-line function that finds the largest number in a non-empty list (hint: what combining function, given an accumulator and an element, returns whichever one is larger — does this need a new predicate, or does one from an earlier lesson already do this job?).
4. **Break it, on purpose.** Predict, then verify, whether `(reduce - 0 (list 3))` (a single-element list) matches `(- 0 3)` directly. What does this confirm about how `reduce` handles a list with only one element?
5. **Generalize.** This series' `apply-deposit` and `apply-withdrawal` (Lessons 4 and 7) each take a balance and one transaction amount, returning a new balance. Using `reduce`, process an entire list of deposit amounts against a starting balance in one line, without writing a new recursive function by hand.
6. **Reconstruct.** Close this lesson. From memory, state `reduce`'s exact argument order (accumulator or element first) and processing order (left to right or right to left), and explain why `+` and `*` never revealed which order was actually being used.

## Definition of Done

- [ ] You can trace a `reduce` call by hand, correctly tracking the accumulator's value at each step.
- [ ] You completed Exercise 3 (largest-element via `reduce`) and verified it against a list of your own choosing.
- [ ] You completed Exercise 5, using `reduce` to process a list of transactions against a starting balance.
- [ ] You can explain, from memory, why `reduce`'s left-to-right order was invisible when using `+` and `*` but became visible with `-`.
- [ ] Commit your Exercise 3 and Exercise 5 solutions to your notes repository, with a commit message noting which combining function each one used and why — for example, `"Add largest-via-reduce (uses >) and process-deposits-via-reduce (uses apply-deposit directly as the combining function)"` — not just `"lesson 27 exercise"`.

---

**Next lesson:** Lesson 28, *Append and Reverse*, applies everything this section has built so far to two more list operations — implemented two different ways each, with a first, direct look at why one version of each turns out to cost meaningfully more than the other as a list grows.
