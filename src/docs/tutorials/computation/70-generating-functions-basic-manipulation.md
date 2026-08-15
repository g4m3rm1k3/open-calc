# Lesson 70: Generating Functions — Basic Manipulation

**What you will build**: By the end of this lesson you'll be able to multiply two generating functions and know precisely what the resulting coefficients mean — a real algebraic operation, not just a representation — and use it to compute the number of ways to roll each possible sum with two dice, verified against a famous, well-known fact.

**What you need to know first**: Lesson 69's generating-function representation, and Lesson 42's polynomial coefficient lists.

**Terms introduced in this lesson**:

- **convolution** — the operation on two sequences that results from multiplying their generating functions: the `n`-th coefficient of the product is `c_n = Σ (k=0 to n) a_k × b_(n-k)`. *Why it matters*: the single most useful algebraic operation on generating functions — it corresponds exactly to combining two independent sequences' possibilities, as this lesson's dice example shows concretely.

**Objects and methods used**: None new. This lesson combines `if`, `>`, `=`, `+`, `-`, `*`, `first`, `rest`, `empty?`, and `cons`, each already covered.

---

## Concept Unit: Multiplying Generating Functions — Convolution

### The Problem

`(1 + 2x) × (3 + 4x)` can be expanded directly: `3 + 4x + 6x + 8x² = 3 + 10x + 8x²`. Is there a direct formula for a product's coefficients, in terms of the two original coefficient lists, without expanding the multiplication by hand each time?

### Introduce the concept in isolation

The coefficient of `x^n` in a product comes from every pair of terms `x^k` (from the first factor) and `x^(n-k)` (from the second) whose exponents add up to `n` — summed together:

> **c_n = a₀b_n + a₁b_(n-1) + ... + a_nb₀ = Σ (k=0 to n) a_k × b_(n-k)**

```clojure
(defn nth-or-zero [lst i]
  (if (empty? lst)
    0
    (if (= i 0)
      (first lst)
      (nth-or-zero (rest lst) (- i 1)))))

(defn convolve-term [a b n k]
  (if (> k n)
    0
    (+ (* (nth-or-zero a k) (nth-or-zero b (- n k))) (convolve-term a b n (+ k 1)))))

(defn convolve [a b max-degree]
  (convolve-from a b max-degree 0))

(defn convolve-from [a b max-degree n]
  (if (> n max-degree)
    (list)
    (cons (convolve-term a b n 0) (convolve-from a b max-degree (+ n 1)))))
```

```
user=> (convolve (list 1 2) (list 3 4) 2)
(3 10 8)
```

Matching the hand-expanded result exactly: `3, 10, 8` — the coefficients of `3 + 10x + 8x²`.

### Discard the throwaway example

Not applicable — `convolve` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of the convolution formula, verified against hand-expanded polynomial multiplication.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn convolve-term [a b n k]
  (if (> k n)
    0
    (+ (* (nth-or-zero a k) (nth-or-zero b (- n k))) (convolve-term a b n (+ k 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`nth-or-zero`** — first appearance: retrieves a list's `i`-th element, or `0` if the list is too short — necessary because two generating functions being multiplied don't need to have the same number of terms, and a "missing" coefficient means exactly `0`, the same convention Lesson 42's polynomial representation already implied for any power not explicitly listed.
- **`(convolve-term a b n k)`** — sums `a_k × b_(n-k)` over every `k` from `0` to `n`, exactly Lesson 44's sigma notation, translated directly into recursive code the same way Lesson 44 always did.

### CS Lens

Convolution is precisely why generating functions are useful beyond mere representation (Lesson 69): multiplying two polynomials, an operation this series already had (implicitly, via `eval-poly-horner` evaluating one), corresponds to a *combinatorially meaningful* operation on the underlying sequences — combining two independent sources of possibilities into one, exactly what the next unit demonstrates concretely.

### SE Lens

`convolve`'s cost is itself worth noting: computing all coefficients up to degree `d` costs roughly `d²` total multiplications (Lesson 51's own quadratic shape, for reasons directly parallel to `reverse-naive`'s), a real, honest cost to be aware of before applying this technique to very large sequences.

---

## Concept Unit: A Real Use — Counting Dice Roll Sums

### The Problem

Rolling two standard six-sided dice, how many different ways produce each possible sum (`2` through `12`)? A famous fact says a sum of `7` has more ways than any other — can convolution derive this directly?

### Introduce the concept in isolation

Represent one die as a generating function: coefficient `1` at each power `x¹` through `x⁶` (one way to roll each face), `0` elsewhere, including position `0` (rolling a `0` isn't possible):

```clojure
(def die-gf (list 0 1 1 1 1 1 1))
```

Two dice, rolled independently, correspond exactly to *multiplying* the single die's generating function by itself — convolution combines every way to get some value on the first die with every way to get some value on the second, summing over every pair that adds to a given total:

```
user=> (convolve die-gf die-gf 7)
(0 0 1 2 3 4 5 6)
```

Reading position `7` (the eighth entry, index `7`): `6` — exactly the famous fact confirmed directly: `6` distinct ways to roll a sum of `7` (`1+6, 2+5, 3+4, 4+3, 5+2, 6+1`), computed by convolution rather than counted by hand.

### Discard the throwaway example

Not applicable — this is a genuine, verified combinatorial fact, derived by algebraic manipulation of a generating function rather than direct enumeration.

### CS Lens

This is the actual payoff Lesson 69 deferred: `die-gf`'s generating function, *squared* via convolution, directly encodes every possible two-dice sum's count simultaneously — one algebraic operation producing an entire table of counts at once, rather than eleven separate combinatorial arguments (one per possible sum from `2` to `12`).

### SE Lens

This exact technique — convolving a "single event" generating function with itself to get "combined event" counts — is the foundation of Lesson 80's *Markov chains* and Lesson 82's probabilistic problem-solving: representing a distribution of outcomes as a generating function, then using algebraic operations to derive facts about combined or repeated events, rather than tracing every combined outcome by hand.

### Connection to the previous unit

The previous unit derived convolution as a formula, verified on small, abstract numbers; this unit applies it to a real, famous combinatorial fact, confirming the formula's practical value directly.

---

## Connect the Pieces

The complete distribution of two-dice sums, all eleven values at once:

```clojure
(println "Two-dice sum counts, positions 0-12:" (convolve die-gf die-gf 12))
```

```
Two-dice sum counts, positions 0-12: (0 0 1 2 3 4 5 6 5 4 3 2 1)
```

Reading this list: sum `2` has `1` way, sum `3` has `2` ways, climbing to sum `7`'s `6` ways, then symmetrically descending back to sum `12`'s `1` way — the complete, famous "triangle" shape of two-dice probabilities, derived entirely from one `convolve` call on a seven-element list, rather than eleven separate hand counts.

## What Breaks Without This

Suppose `die-gf` were built starting from position `1` instead of `0` — `(1 1 1 1 1 1)` instead of `(0 1 1 1 1 1 1)`, dropping the leading zero under the assumption it "doesn't matter since it's just a placeholder":

```
user=> (convolve (list 1 1 1 1 1 1) (list 1 1 1 1 1 1) 6)
(1 2 3 4 5 6 5)
```

Position `6` (meant to represent the count for a sum of `7`) now shows `5`, not `6` — every position has silently shifted by one, because dropping the leading zero changed what each coefficient's *position* actually means (position `0` now represents rolling a `1`, not the impossible roll of `0`). This is exactly Lesson 42's own representation-convention warning, recurring here: a generating function's coefficients only mean what they're supposed to if every position, including the "obviously zero" ones, is accounted for exactly as the representation requires.

## Exercises

1. **Trace.** By hand, verify `convolve`'s prediction for a sum of `2` (should be `1` way: `1+1`) and a sum of `12` (should be `1` way: `6+6`).
2. **Predict.** Before computing it, predict how many ways exist to roll a sum of `5` with two dice, then verify against `(convolve die-gf die-gf 12)`.
3. **Verify.** Confirm the total of all values in `(convolve die-gf die-gf 12)` equals `36` — the total number of equally likely two-dice outcomes (`6 × 6`).
4. **Break it, on purpose.** Reproduce the leading-zero mistake from "What Breaks Without This" yourself, and confirm every position shifts by exactly one from the correct answer.
5. **Generalize.** Build a generating function for a four-sided die (`d4`, values `1`-`4`), and use convolution to find how many ways exist to roll each possible sum of two `d4`s.
6. **Reconstruct.** Close this lesson. From memory, state the convolution formula, and explain why squaring a single die's generating function correctly computes two-dice sum counts.

## Definition of Done

- [ ] You can compute a convolution by hand for two short coefficient lists.
- [ ] You can explain why `die-gf` needs a leading `0` at position `0`.
- [ ] You completed Exercise 3 and confirmed the two-dice distribution sums to `36`.
- [ ] You completed Exercise 5 (`d4` sums) and can state the resulting distribution.
- [ ] Commit your Exercise 5 `d4` convolution to your notes repository, with a commit message stating the resulting distribution and its total — for example, `"Add d4-gf, convolved with itself: sum counts (0 0 1 2 3 4 3 2 1), totals 16 = 4x4"` — not just `"lesson 70 exercise"`.

---

**Next lesson:** Lesson 71, *Discrete Probability*, opens this section's final stretch — sample spaces, events, and probability axioms — building directly on this lesson's dice-sum distribution, now given its own formal probabilistic vocabulary.
