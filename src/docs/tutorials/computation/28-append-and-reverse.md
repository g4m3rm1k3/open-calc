# Lesson 28: Append and Reverse

**What you will build**: By the end of this lesson you'll have derived list concatenation and two genuinely different ways to reverse a list — one direct and structurally obvious, one using an accumulator the way Lesson 27's `reduce` did. You'll also count, precisely, why the direct version does meaningfully more work than the accumulator version as a list grows, using nothing more than the counting techniques already available, well before this series' formal treatment of complexity in Section IV.

**What you need to know first**: Lesson 24's `cons`/`first`/`rest`/`empty?`, and Lesson 27's accumulator-passing `my-reduce`.

**Terms introduced in this lesson**:

- **naive implementation** — an implementation that directly follows a definition's structure without regard for how much repeated work it might cause. *Why it matters*: this lesson's `reverse-naive` is completely correct and structurally clean — "naive" here names a real cost, not a mistake, and precisely counting that cost is this lesson's actual point.

**Objects and methods used**:

- **`concat`**
  - *What it is:* a function in Clojure's core library that concatenates sequences.
  - *Implementation:* `(concat a-list b-list)` — established behavior: `(concat (list 1 2) (list 3 4))` produces `(1 2 3 4)`.
  - *Its use:* Concept Unit 1, as the real counterpart to this lesson's hand-derived `my-append`.
- **`reverse`**
  - *What it is:* a function in Clojure's core library that reverses a list's element order.
  - *Implementation:* `(reverse a-list)` — established behavior: `(reverse (list 1 2 3))` produces `(3 2 1)`.
  - *Its use:* Concept Unit 4, as the real counterpart to this lesson's two hand-derived reverse functions.

---

## Concept Unit: Append — Combining Two Lists

### The Problem

Two separate lists — say, this month's deposits and last month's carried-over deposits — sometimes need to be treated as one combined list. Neither `cons` (which adds one element) nor anything else this section has built so far combines two entire lists into one.

### Introduce the concept in isolation

Derive it structurally, the way every recursive function in this section has been derived — by recursing on the first list, since it's the one being consumed:

```clojure
(defn my-append [lst1 lst2]
  (if (empty? lst1)
    lst2
    (cons (first lst1) (my-append (rest lst1) lst2))))
```

```
user=> (my-append (list 1 2) (list 3 4))
(1 2 3 4)
user=> (concat (list 1 2) (list 3 4))
(1 2 3 4)
```

**Base case:** if the first list is empty, the combined result is just the second list, entirely — nothing from an empty list to place in front of it. **Recursive case:** otherwise, place the first list's leading element in front of the result of appending the rest of the first list to the second list — structurally recursive on the *first* list only, exactly the way Lesson 24's `my-length` recursed on its only argument.

### Discard the throwaway example

Not applicable — `my-append` is a real, reusable function, and the rest of this lesson builds on it directly.

### Project Change

- **Reference Source**: No reference counterpart — a direct structural translation of the list definition (Lesson 19) applied to a two-list combination.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn my-append [lst1 lst2]
  (if (empty? lst1)
    lst2
    (cons (first lst1) (my-append (rest lst1) lst2))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (empty? lst1) lst2 ...)`** — reappearing structural-recursion shape; the base case's answer, `lst2`, is a whole list rather than a single literal, the one new fact this function's base case introduces.
- **`(cons (first lst1) (my-append (rest lst1) lst2))`** — reappearing `cons`/`first`/`rest` (Lesson 24); the recursive call carries `lst2` forward unchanged at every step — only `lst1` shrinks, exactly the single-argument recursion pattern every earlier list function in this section used, with a second, passenger argument along for the ride.

### CS Lens

`my-append`'s cost is directly tied to its *first* argument's length — walking `lst1` all the way to its own empty-list base case is unavoidable work, regardless of how long `lst2` is, since `lst2` is only ever attached once, at the very end, never inspected or rebuilt. This single fact is the entire reason the next two units exist.

### SE Lens

`concat`, Clojure's real, built-in combining function, matches `my-append`'s behavior exactly for this lesson's purposes — knowing the underlying shape (recurse on the first list, attach the second at the base case) is what makes the next unit's cost analysis possible at all, even though real code should reach for `concat` rather than reimplementing it by hand.

---

## Concept Unit: Reverse, the Naive Way

### The Problem

Reversing a list — turning `(1 2 3)` into `(3 2 1)` — sounds like it should follow the same structural-recursion recipe as everything else in this section. Does it?

### Introduce the concept in isolation

```clojure
(defn reverse-naive [lst]
  (if (empty? lst)
    (list)
    (my-append (reverse-naive (rest lst)) (list (first lst)))))
```

```
user=> (reverse-naive (list 1 2 3))
(3 2 1)
```

**Base case:** the empty list reverses to itself. **Recursive case:** reverse everything *after* the first element, then append the first element to the *end* of that already-reversed result — the first element of the original list needs to end up *last*, so it's placed last, using `my-append` to attach a one-element list, `(list (first lst))`, onto the end of the recursively-reversed rest.

This is a completely direct, structurally obvious translation of "reverse the rest, then put the first element last" — and, as the next unit shows by actually counting, a genuinely expensive one.

### Discard the throwaway example

Not applicable — `reverse-naive` is correct and worth keeping, specifically so the next unit can count its real cost.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `my-append`, from the previous unit.

### The New Code — type it yourself

```clojure
(defn reverse-naive [lst]
  (if (empty? lst)
    (list)
    (my-append (reverse-naive (rest lst)) (list (first lst)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(reverse-naive (rest lst))`** — the recursive call, structurally recursive on `lst` exactly the way every earlier function in this section has been.
- **`(list (first lst))`** — reappearing `list` construction, wrapping the current element in a one-element list, so it's the right *shape* (a list) for `my-append`'s second argument.
- **`(my-append ... ...)`** — reappearing from the previous unit; this is the new cost this unit's function introduces — a full `my-append` call at *every* level of the recursion, not just once at the end.

### CS Lens

Also recognized in: repeatedly rebuilding the front of a line by walking to its current end and adding one more person, every single time someone new arrives, instead of adding new arrivals directly where they belong and only walking the line once at the very end.

### SE Lens

`reverse-naive` is exactly as "correct" as any function in this section — it produces the right answer on every input. Whether it's a *good* implementation is a separate question this lesson is built to answer precisely, rather than by intuition.

### Connection to the previous unit

The previous unit derived `my-append` on its own; this unit puts it to work inside another recursive function, at every level of that function's own recursion — setting up the next unit's actual count of how expensive that repetition becomes.

---

## Concept Unit: Counting the Work — Why Naive Reverse Costs More

### The Problem

`reverse-naive` calls `my-append` once per element of the original list. Each `my-append` call itself does work proportional to the length of *its* first argument. How much total work does reversing a list of length `n` actually require?

### Introduce the concept in isolation

Trace `(reverse-naive (list 1 2 3))`, counting each `my-append` call's own cost (measured as how many elements of its first argument it has to walk through before reaching the base case):

```
reverse-naive(1 2 3)
  = my-append(reverse-naive(2 3), (1))
    reverse-naive(2 3)
      = my-append(reverse-naive(3), (2))
        reverse-naive(3)
          = my-append(reverse-naive(), (3))
            reverse-naive() = ()                          [base case, no append needed]
          = my-append((), (3))                             [cost: 0 — first argument already empty]
          = (3)
      = my-append((3), (2))                                 [cost: 1 — walks through one element]
      = (3 2)
  = my-append((3 2), (1))                                   [cost: 2 — walks through two elements]
  = (3 2 1)
```

Total `my-append` cost: `0 + 1 + 2 = 3`. For a list of length `n`, the pattern is `0 + 1 + 2 + ... + (n-1)` — exactly the shape of Lesson 15's proven sum formula, one step off: it totals `n(n-1)/2`. For `n = 3`: `3 × 2 / 2 = 3`, matching the trace exactly. For `n = 10`, this would already be `10 × 9 / 2 = 45` — nearly five times the list's own length in extra work, just for `my-append` calls, growing faster and faster as `n` increases.

### Discard the throwaway example

Not applicable — this trace is the actual, precise verification of a real cost.

### CS Lens

A quantity that grows proportional to `n(n-1)/2` — proportional to `n²` for large `n`, since the `n` and `n-1` terms both grow together — is called **quadratic growth**, one member of the family Section IV (*Growth Rates*, Lesson 50, and *Big-O*, Lesson 51) studies formally and names precisely. This unit's exact count is the concrete, hand-verified evidence Section IV's abstract vocabulary will later attach a name to — the phenomenon comes first, proven directly; the formal name and general theory come later.

### SE Lens

Nothing about `reverse-naive`'s code looks expensive — it's short, structurally obvious, and correct on every input, the exact situation Lesson 23's Fibonacci evaluation tree already demonstrated once: a cost invisible in the code itself, revealed only by actually tracing or counting the execution. A list of a thousand elements would cost `reverse-naive` roughly half a million `my-append` steps — a real, measurable difference from a thousand steps, and one no amount of staring at the four-line definition would reveal without counting it directly, the way this unit just did.

### Connection to the previous unit

The previous unit built `reverse-naive` and trusted it was correct; this unit is the actual cost accounting that correctness alone never addresses — exactly Lesson 1's original distinction between "produces an answer" and "produces the *right kind* of answer for the situation," now applied to performance instead of correctness.

---

## Concept Unit: Reverse, the Accumulator Way

### The Problem

`reverse-naive`'s cost came entirely from repeatedly calling `my-append`. Is there a way to reverse a list that never needs `my-append` at all?

### Introduce the concept in isolation

```clojure
(defn reverse-acc [lst acc]
  (if (empty? lst)
    acc
    (reverse-acc (rest lst) (cons (first lst) acc))))
```

```
user=> (reverse-acc (list 1 2 3) (list))
(3 2 1)
```

Trace it the way Lesson 27's `my-reduce` was traced, tracking the accumulator:

```
reverse-acc((1 2 3), ())
  → reverse-acc((2 3), (cons 1 ()) = (1))
    → reverse-acc((3), (cons 2 (1)) = (2 1))
      → reverse-acc((), (cons 3 (2 1)) = (3 2 1))
        → base case: return (3 2 1)
```

Every step does exactly one `cons` — no `my-append`, no repeated walking through an already-partially-built result. The **accumulator**, `acc`, carries the reversed-so-far list forward directly, growing by one element per step, the identical accumulator-passing shape Lesson 27's `my-reduce` already established. For a list of length `n`, this costs exactly `n` `cons` operations — not `n(n-1)/2` — a real, substantial difference for any list longer than a couple of elements.

Compare against Clojure's real, built-in `reverse`:

```
user=> (reverse (list 1 2 3))
(3 2 1)
```

Matches exactly.

### Discard the throwaway example

Not applicable — `reverse-acc` is a real, reusable, and meaningfully better function than `reverse-naive`.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn reverse-acc [lst acc]
  (if (empty? lst)
    acc
    (reverse-acc (rest lst) (cons (first lst) acc))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(cons (first lst) acc)`** — reappearing `cons`, here building the reversed result directly: placing the current element in *front of* the accumulator, which already holds everything reversed so far — the earliest-processed elements end up deepest inside `acc`, which is exactly why the final result comes out reversed.
- **`(reverse-acc (rest lst) (cons (first lst) acc))`** — reappearing accumulator-passing recursion (Lesson 27's `my-reduce`); both arguments change together at every step, the identical shape.

### CS Lens

`reverse-acc` is literally `reduce`, specialized: `(reduce (fn [acc x] (cons x acc)) (list) lst)` computes the identical thing, one line, using Lesson 27's own tool directly instead of a separately hand-written recursive function — proof that this lesson's "better" reverse isn't a new idea, it's Lesson 27's accumulator pattern, recognized and reapplied.

### SE Lens

This is the real, practical payoff Lesson 27's SE Lens promised but didn't yet demonstrate concretely: the accumulator-passing shape isn't just a different way to organize the same amount of work — for `reverse` specifically, it does genuinely, measurably less work, verified by this lesson's own counting in the previous unit, not merely asserted.

### Connection to the previous unit

The previous unit counted `reverse-naive`'s real cost precisely; this unit is the direct answer to that cost — a different recursive shape, doing strictly less work, for the exact same result.

---

## Connect the Pieces

Both reverse implementations, and their costs, side by side:

```clojure
(println "reverse-naive (1 2 3 4 5):" (reverse-naive (list 1 2 3 4 5)))
(println "reverse-acc (1 2 3 4 5):" (reverse-acc (list 1 2 3 4 5) (list)))
(println "reduce-based reverse:" (reduce (fn [acc x] (cons x acc)) (list) (list 1 2 3 4 5)))
(println "built-in reverse:" (reverse (list 1 2 3 4 5)))
```

```
reverse-naive (1 2 3 4 5): (5 4 3 2 1)
reverse-acc (1 2 3 4 5): (5 4 3 2 1)
reduce-based reverse: (5 4 3 2 1)
built-in reverse: (5 4 3 2 1)
```

All four agree — `reverse-naive` costs `5 × 4 / 2 = 10` `my-append` steps for this five-element list; `reverse-acc` and the `reduce`-based version each cost exactly `5` `cons` steps; the built-in `reverse` produces the identical answer using whichever implementation Clojure's own standard library actually chose. Four routes to the same correct result, with real, countable differences in how much work each one does to get there.

## What Breaks Without This

Suppose `reverse-naive` were used inside a loop-like process this series will build in later lessons — reversing a growing list once per new transaction added to a running log, say, a hundred times over the course of processing a hundred transactions. Each individual reversal on a list of length `k` costs roughly `k²/2` `my-append` steps; summed across a hundred growing reversals, the total cost grows dramatically faster than a hundred reversals using `reverse-acc` would — not from any one call being wrong, but from a genuinely more expensive *shape* being invoked repeatedly. Nothing about this failure produces an incorrect answer at any point — every individual reversal is completely correct — the entire cost is invisible in the output and only shows up as a program that runs unexpectedly slowly once real, larger inputs are involved, exactly the category of problem Lesson 284 (*Performance Engineering*) devotes itself to diagnosing properly, much later in this series.

## Exercises

1. **Trace.** By hand, trace `(reverse-naive (list 1 2))`, counting each `my-append` call's cost the way Concept Unit 3 did for a three-element list.
2. **Predict.** Before computing it, predict the total `my-append` cost `reverse-naive` would incur on a six-element list, using the `n(n-1)/2` pattern. Verify by extending Concept Unit 3's counting method.
3. **Trace.** By hand, trace `(reverse-acc (list 1 2 3 4) (list))`, tracking the accumulator's value at each step, the way Concept Unit 4 did for a three-element list.
4. **Break it, on purpose.** Predict what `(reverse-acc (list 1 2 3) (list 99))` — calling `reverse-acc` with a *non-empty* starting accumulator — produces, and explain why in one sentence, using this lesson's own trace format.
5. **Generalize.** Using `my-append` (or `concat`), write a function `last-element` that returns a list's final element by appending the list onto an empty list and taking... (reconsider: is `my-append` actually the right tool for this, or does it suggest a simpler approach using only `first` and `rest`? Write the simplest correct version, and justify your choice in one sentence.)
6. **Reconstruct.** Close this lesson. From memory, explain why `reverse-naive` costs roughly `n²/2` operations while `reverse-acc` costs exactly `n`, tracing the source of the difference back to which function calls `my-append` and how many times.

## Definition of Done

- [ ] You can implement `my-append` and both reverse functions from scratch, without additional guidance.
- [ ] You completed Exercise 2 and correctly predicted `reverse-naive`'s cost on a six-element list before verifying it.
- [ ] You can explain, precisely, why `reverse-acc` never needs `my-append` at all.
- [ ] You can state the practical consequence of Concept Unit 3's counting — not just "naive is slower," but the actual shape of the growth (`n(n-1)/2`).
- [ ] Commit both reverse implementations and your Exercise 2 prediction-versus-verification to your notes repository, with a commit message stating the concrete operation counts you found — for example, `"Add reverse-naive and reverse-acc — naive costs 15 append-steps for n=6, acc costs 6 cons-steps, matches n(n-1)/2 prediction"` — not just `"lesson 28 exercise"`.

---

**Next lesson:** Lesson 29, *Nested Lists*, extends structural recursion to lists that contain other lists as elements — arbitrarily deep nesting — generalizing everything this section has built so far past a single flat sequence.
