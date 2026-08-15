# Lesson 76: Variance

**What you will build**: By the end of this lesson you'll be able to compute variance — how spread out a distribution is around its average — and derive its computational shortcut, `E[X²] - (E[X])²`, directly from Lesson 75's linearity of expectation, rather than accepting it as a memorized formula.

**What you need to know first**: Lesson 75's expected value and linearity, and Lesson 13's algebraic expansion.

**Terms introduced in this lesson**:

- **variance** — a measure of how spread out a distribution is around its expected value, defined as `E[(X-E[X])²]`, equivalently `E[X²] - (E[X])²`. *Why it matters*: expected value alone doesn't distinguish a tightly clustered distribution from a widely spread one with the identical average — this lesson's own example proves the two are genuinely different questions.

**Objects and methods used**: None new. This lesson combines `+`, `-`, `*`, `/`, and `power` (Lesson 42), each already covered.

---

## Concept Unit: Why Expectation Alone Isn't Enough

### The Problem

A single fair die has `E[X] = 7/2` (Lesson 75). Consider a completely different random quantity `Y`: a coin flip that pays `0` on tails, `7` on heads, each with probability `1/2`. `E[Y] = 0×(1/2) + 7×(1/2) = 7/2` — the *identical* expected value as the die. Are `X` and `Y` "the same," in any meaningful sense, just because their averages match?

### Introduce the concept in isolation

Obviously not — `X` (the die) always lands somewhere between `1` and `6`, close to its own average; `Y` (the coin) never actually equals anything close to `3.5` at all, always landing at one of two extremes. Expected value, on its own, cannot distinguish these two genuinely different behaviors — a second measure, describing *spread* around the average, is needed.

### Discard the throwaway example

Not applicable — this contrast is the direct motivation for the formula derived next.

### CS Lens

This is exactly why a single summary statistic is rarely enough to fully characterize a distribution — the same lesson Lesson 50's growth-rate table taught about algorithms (a single "it's fast" claim hides real, important differences), now applied to randomness instead of computational cost.

### SE Lens

Two systems with identical *average* response time can have wildly different real-world reliability — one consistently near the average, one wildly variable — exactly the `X` versus `Y` distinction this unit just raised, with real consequences for anyone actually depending on that response time.

---

## Concept Unit: Deriving Variance and Its Computational Shortcut

### The Problem

Define spread precisely, and find a way to compute it without needing every individual deviation from the mean.

### Introduce the concept in isolation

> **Var(X) = E[(X - E[X])²]** — the average squared distance from the mean (squared, so positive and negative deviations don't cancel out).

Expand this algebraically, using `μ` for `E[X]` and Lesson 75's linearity directly:

```
E[(X-μ)²] = E[X² - 2μX + μ²]              (expand the square — Lesson 13)
          = E[X²] - E[2μX] + E[μ²]        (linearity of expectation — Lesson 75, applied term by term)
          = E[X²] - 2μE[X] + μ²           (constants factor out of expectation)
          = E[X²] - 2μ·μ + μ²             (E[X] is μ, by definition)
          = E[X²] - μ²
```

> **Var(X) = E[X²] - (E[X])²**

```clojure
(defn expected-value-of-squares [counts total i]
  (if (empty? counts)
    0
    (+ (/ (* i i (first counts)) total) (expected-value-of-squares (rest counts) total (+ i 1)))))

(defn variance-from-counts [counts total]
  (- (expected-value-of-squares counts total 0) (power (expected-value-from-counts counts total 0) 2)))
```

```
user=> (variance-from-counts (list 0 1 1 1 1 1 1) 6)
35/12
```

`Var(\text{die}) = 35/12 ≈ 2.92`. Compute `Y`'s (the coin's) variance the same way — `E[Y²] = 0²×(1/2) + 7²×(1/2) = 49/2`, `Var(Y) = 49/2 - (7/2)² = 49/4 = 12.25` — over four times larger than the die's, quantifying precisely what Concept Unit 1 only described qualitatively: `Y` really is far more spread out than `X`, despite their identical averages.

### Discard the throwaway example

Not applicable — `variance-from-counts` is a real, reusable function.

### Project Change

- **Reference Source**: `expected-value-from-counts`, from Lesson 75, is reused directly inside this lesson's formula.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `power`, from Lesson 42.

### The New Code — type it yourself

```clojure
(defn variance-from-counts [counts total]
  (- (expected-value-of-squares counts total 0) (power (expected-value-from-counts counts total 0) 2)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`expected-value-of-squares`** — reappearing shape from Lesson 75's `expected-value-from-counts`, with `(* i i ...)` in place of `(* i ...)` — computing `E[X²]` instead of `E[X]`, the identical accumulation pattern applied to squared values.
- **`(power (expected-value-from-counts counts total 0) 2)`** — reappearing `power` (Lesson 42), squaring the mean itself — the `(E[X])²` term this lesson's own derivation produced.

### CS Lens

Deriving `Var(X) = E[X²] - (E[X])²` from the definition, rather than memorizing it, is exactly this series' recurring insistence — Lesson 42's Horner's method and Lesson 55's GCD identity were both proven, not merely stated, and variance's shortcut formula gets the identical treatment here.

### SE Lens

The shortcut formula is computationally cheaper than the original definition: it needs only two passes over the distribution (one for `E[X]`, one for `E[X²]`) rather than needing `E[X]` computed *first*, then a second pass computing `(X-E[X])²` for every value — a real, if modest, efficiency gain earned directly from the algebraic derivation.

### Connection to the previous unit

The previous unit showed expectation alone was insufficient; this unit derives the precise, computable measure that fills the gap, verified on both halves of the previous unit's own contrasting example.

---

## Connect the Pieces

Both distributions, fully characterized by both statistics together:

```clojure
(println "Die: E=" (expected-value-from-counts (list 0 1 1 1 1 1 1) 6 0) ", Var=" (variance-from-counts (list 0 1 1 1 1 1 1) 6))
(println "Coin-0-or-7: E=" (expected-value-from-counts (list 1/2 0 0 0 0 0 0 1/2) 1 0) ", Var=" (variance-from-counts (list 1/2 0 0 0 0 0 0 1/2) 1))
```

```
Die: E= 7/2 , Var= 35/12
Coin-0-or-7: E= 7/2 , Var= 49/4
```

(The coin's "counts" list uses probabilities directly, with `total=1`, rather than raw counts — the identical formula works either way, since `count/total` and a direct probability are the same thing.) Both distributions share the identical `E = 7/2`; their genuinely different variances, `35/12` versus `49/4`, are exactly the quantitative confirmation Concept Unit 1's qualitative observation needed.

## What Breaks Without This

Suppose two investment options were compared using only their expected returns, both reporting an identical average — without ever computing variance. One option might behave like the die (moderate, consistent variation), the other like the coin (rare, extreme swings) — identical on average, but representing genuinely different levels of risk. Choosing based on expected value alone, the way Concept Unit 1's `X` and `Y` example demonstrated, would treat these two meaningfully different situations as interchangeable, exactly the gap variance exists to close.

## Exercises

1. **Trace.** By hand, compute `E[X²]` for a single die directly (summing `1²+2²+...+6²`, divided by `6`), confirming `91/6`.
2. **Predict.** Before computing it, predict whether a `d20` (twenty-sided die) has larger or smaller variance than a `d6`. Compute both to check.
3. **Verify.** Confirm `Var(Y)` for the coin-valued-`0`-or-`7` example by computing `E[(Y-3.5)²]` directly (the original definition), rather than the shortcut formula, and check it matches `49/4`.
4. **Break it, on purpose.** Compute variance using only `E[X]²` (squaring the whole sum before dividing) instead of the correct `(E[X])²` — a plausible-looking notational slip. Does it actually produce a different, wrong number, or are the two expressions secretly the same? Justify your answer.
5. **Generalize.** Using the two-`d4` distribution (Lesson 71), compute both `E[\text{sum}]` and `Var(\text{sum})`.
6. **Reconstruct.** Close this lesson. From memory, derive `Var(X) = E[X²] - (E[X])²` from the definition `E[(X-E[X])²]`, using linearity of expectation.

## Definition of Done

- [ ] You can compute a distribution's variance using the shortcut formula.
- [ ] You completed Exercise 3, verifying the shortcut against the original definition directly.
- [ ] You completed Exercise 5, computing both expectation and variance for the two-`d4` sum.
- [ ] You can derive the variance shortcut formula from its definition, using linearity of expectation, from memory.
- [ ] Commit your Exercise 2 and Exercise 5 results to your notes repository, with a commit message stating the variances you computed — for example, `"Verify d20 variance (33.25) exceeds d6 variance (2.92); compute two-d4 sum variance = 5/2"` — not just `"lesson 76 exercise"`.

---

**Next lesson:** Lesson 77, *Random Variables*, steps back and formalizes precisely what `X` and `Y` have actually been this entire section — functions over a sample space's outcomes — giving this lesson's and the previous two lessons' informal usage a precise definition.
