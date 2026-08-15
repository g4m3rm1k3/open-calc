# Lesson 45: Product Notation

**What you will build**: By the end of this lesson you'll be able to read and write pi notation (`Π`) — the multiplicative counterpart to the previous lesson's sigma notation — and use it to derive a real combinatorial formula, counting the number of ways to arrange a subset of items in order, directly from `factorial`'s own recursive shape.

**What you need to know first**: The previous lesson's sigma notation and translation process, and `factorial` (Lesson 20).

**Terms introduced in this lesson**:

- **product notation** (**pi notation**, `Π`) — a compact way of writing "multiply this expression for every value of a variable across some range." *Why it matters*: the exact multiplicative counterpart to the previous lesson's sigma notation — `factorial` (Lesson 20) is `Π (i=1 to n) i`, stated precisely for the first time.

**Objects and methods used**: None new. This lesson gives already-written code (`factorial`) a formal mathematical notation, and derives one new function from it.

---

## Concept Unit: What Pi Notation Actually Says

### The Problem

`factorial`'s recursive definition (Lesson 20) — `1` if `n = 0`, otherwise `n` times the factorial of `n - 1` — precisely describes "multiply every integer from `1` to `n` together." The previous lesson gave addition its own compact notation; does multiplication have the identical treatment?

### Introduce the concept in isolation

> **Π (i=1 to n) i** means: multiply the expression `i`, once for each value of `i` starting at `1` and ending at `n`.

For `n = 4`: `Π (i=1 to 4) i = 1 × 2 × 3 × 4 = 24`, matching `(factorial 4)`'s own result exactly (Lesson 20 computed the identical `24`). Pi notation has the same three parts sigma notation did (Lesson 44) — the expression being multiplied, the index variable's start, and its end — with multiplication replacing addition as the combining operation.

### Discard the throwaway example

Not applicable — this notation is what the rest of this lesson builds on directly.

### Generalizing

Just as sigma notation wasn't limited to summing a bare index variable, pi notation isn't limited to multiplying one either — `Π (i=1 to n) (2i)` means `2 × 4 × 6 × ... × 2n`, and, as the next unit derives, `Π (i=0 to k-1) (n - i)` describes counting arrangements directly.

### CS Lens

`factorial` and `Π (i=1 to n) i` are the same identical relationship Lesson 44 established between `sum-to` and `Σ (i=1 to n) i` — one recursive function, one compact notation, describing the identical computation.

### SE Lens

Recognizing a piece of code as computing a named product — a factorial, a permutation count — is what makes a proven closed-form alternative (if one exists) discoverable, the same reuse-of-known-results argument Lesson 44 already made for sums.

---

## Concept Unit: Deriving Permutation Counting from Pi Notation

### The Problem

How many different orderings are there for choosing `2` items, in sequence, out of `5` distinct options — the first choice from all `5`, the second from whatever's left? This isn't `factorial` directly (which counts orderings of *all* `5`), but it has the same multiplicative shape.

### Introduce the concept in isolation

Reason it out directly: the first choice has `5` options; the second, having used one already, has `4` remaining. Total orderings: `5 × 4 = 20`. In pi notation:

> **Π (i=0 to k-1) (n - i)**, for choosing `k` items in order from `n`: at `i=0`, the factor is `n`; at `i=1`, it's `n-1`; continuing down to `i=k-1`, the factor is `n-(k-1)`.

For `n=5`, `k=2`: `Π (i=0 to 1) (5-i) = (5-0) × (5-1) = 5 × 4 = 20`, matching the direct reasoning above.

Translate this into a recursive function, the same way Lesson 44 translated sigma notation into code — read the index range as the base case boundary, the expression as what's multiplied at each step:

```clojure
(defn permutation-count [n k]
  (if (= k 0)
    1
    (* n (permutation-count (- n 1) (- k 1)))))
```

```
user=> (permutation-count 5 2)
20
user=> (permutation-count 5 3)
60
```

Trace `(permutation-count 5 3)`: `5 × (permutation-count 4 2) = 5 × (4 × (permutation-count 3 1)) = 5 × 4 × (3 × (permutation-count 2 0)) = 5 × 4 × 3 × 1 = 60` — `5 × 4 × 3`, exactly three factors for choosing `3` items from `5`, in order, matching direct reasoning: `5` choices for the first, `4` for the second, `3` for the third.

### Discard the throwaway example

Not applicable — `permutation-count` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct translation of the pi-notation formula for permutation counts, itself derived from first-principles counting.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn permutation-count [n k]
  (if (= k 0)
    1
    (* n (permutation-count (- n 1) (- k 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (= k 0) 1 ...)`** — base case: choosing zero items from anything has exactly one way to do it (choose nothing) — the identical "one way to do nothing" base case Lesson 32's `power-set` used for its own empty-choice case.
- **`(* n (permutation-count (- n 1) (- k 1)))`** — the recursive case: the current number of available choices (`n`), multiplied by the count for one fewer item still needed (`k - 1`), chosen from one fewer remaining option (`n - 1`) — both parameters shrink together, tracking "how many choices are left" and "how many more picks are needed" simultaneously.

### CS Lens

Setting `k` equal to `n` recovers `factorial` exactly: `permutation-count(n, n)` counts orderings of *every* item, with no choices left over — confirming `factorial` is the special case of permutation counting where every item participates, the same "one general shape, several specific instances" relationship Lesson 27 already found between summing, multiplying, and counting.

### SE Lens

`permutation-count`'s two shrinking parameters (`n` and `k`, both decrementing together) is a slightly richer accumulator shape than any single-parameter recursion this series has written — a direct preview of Lesson 62 (*Combinations*), which needs the identical two-parameter shape with one more twist (dividing out orderings that don't matter) to count *unordered* selections instead of ordered ones.

### Connection to the previous unit

The previous unit stated pi notation's shared shape with sigma notation; this unit derives a genuine, useful combinatorial formula from it — proof the notation isn't just a restatement of `factorial`, but a general tool for a whole family of counting problems.

---

## Connect the Pieces

`factorial` and `permutation-count`, confirmed to agree at their shared special case:

```clojure
(println "factorial 4:" (factorial 4))
(println "permutation-count 4 4:" (permutation-count 4 4))
(println "They agree when k = n:" (= (factorial 4) (permutation-count 4 4)))
(println "permutation-count 5 0:" (permutation-count 5 0))
```

```
factorial 4: 24
permutation-count 4 4: 24
They agree when k = n: true
permutation-count 5 0: 1
```

`permutation-count(n, n)` and `factorial(n)` agree exactly, confirming `factorial` is `permutation-count`'s special case where every item is chosen — and `permutation-count(5, 0)` correctly returns `1`, the base case's "one way to choose nothing," the identical empty-product convention `Π` over an empty range always uses (the multiplicative counterpart to Lesson 44's empty *sum* being `0`).

## What Breaks Without This

Suppose `permutation-count` were called with `k` larger than `n` — asking for more ordered choices than there are items available, something the function never checks for:

```clojure
(permutation-count 3 5)
```

Tracing it: `3 × (permutation-count 2 4)`, then `2 × (permutation-count 1 3)`, then `1 × (permutation-count 0 2)`, then `0 × (permutation-count -1 1)` — the "number of available choices" has gone *negative*, something that has no meaning at all for counting real items, and the recursion continues past `k = 0`'s intended stopping point without any check catching the nonsensical input. This is Lesson 12's partial-function warning again: `permutation-count`'s rule is only meaningful over the domain `0 ≤ k ≤ n`, and nothing in the function currently enforces that domain — a real gap Lesson 1's specification discipline would have flagged from the very first lesson of this series, worth fixing directly in this lesson's exercises.

## Exercises

1. **Trace.** By hand, trace `(permutation-count 6 3)`, confirming it matches `6 × 5 × 4 = 120`.
2. **Predict.** Before running it, predict `(permutation-count 4 1)` — choosing one item, in order, from four. Verify against direct reasoning (how many ways are there to choose one item from four?).
3. **Verify.** Confirm `(permutation-count 6 6)` equals `(factorial 6)` directly, the way Connect the Pieces did for `n = 4`.
4. **Break it, on purpose.** Run `(permutation-count 3 5)` yourself, the way "What Breaks Without This" described, and confirm it produces a nonsensical (not just wrong-looking, but genuinely meaningless) result rather than an error.
5. **Generalize.** Add a guard to `permutation-count` that returns `0` (the correct count — there are zero ways to choose more items than exist, in order, without repeats) when `k > n`, rather than continuing into negative territory. Verify your fixed version against Exercise 4's input.
6. **Reconstruct.** Close this lesson. From memory, explain why `permutation-count(n, n)` equals `factorial(n)`, and state the empty-product convention pi notation uses for a range with nothing in it.

## Definition of Done

- [ ] You can read a pi-notation formula aloud, correctly identifying the index variable, its range, and the multiplied expression.
- [ ] You can derive `permutation-count` from first-principles counting reasoning, not just from the formula handed to you.
- [ ] You completed Exercise 5, adding a domain guard to `permutation-count` and verifying it against the previously nonsensical input.
- [ ] You can explain why `factorial` is `permutation-count`'s special case, using the word "domain" precisely.
- [ ] Commit your fixed `permutation-count` to your notes repository, with a commit message stating what domain violation you guarded against — for example, `"Guard permutation-count against k > n — previously produced negative 'choices remaining' with no error"` — not just `"lesson 45 exercise"`.

---

**Next lesson:** Lesson 46, *Arithmetic Series*, derives Lesson 15's own sum formula from scratch — this time by a genuinely different method than induction — and Lesson 47 does the same for geometric series, both feeding directly into Section IV's growth-rate analysis.
