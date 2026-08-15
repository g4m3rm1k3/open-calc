# Lesson 75: Expected Value

**What you will build**: By the end of this lesson you'll be able to compute a distribution's expected value — its long-run average — and verify a genuinely surprising, powerful fact: the expected value of a sum equals the sum of the expected values, even when the two quantities aren't independent, confirmed directly on the two-dice distribution this section has built.

**What you need to know first**: Lesson 71's probability distribution vocabulary, and Lesson 70's two-dice sum distribution.

**Terms introduced in this lesson**:

- **expected value** — the long-run average value of a random quantity, computed as `Σ (value × its probability)`. *Why it matters*: a different, additional way to summarize a probability distribution beyond listing every individual probability — a single representative number.
- **linearity of expectation** — `E[X+Y] = E[X] + E[Y]`, true even when `X` and `Y` are not independent. *Why it matters*: a genuinely surprising, powerful property — the expectation of a sum never requires knowing how the two quantities relate to each other, only their individual expectations.

**Objects and methods used**: None new. This lesson combines `+`, `*`, `/`, `map` (Lesson 25), and `reduce` (Lesson 27), each already covered.

---

## Concept Unit: Defining Expected Value

### The Problem

Rolling a single fair die, no single outcome is "expected" — each of `1` through `6` is equally likely. Is there still a meaningful single number that summarizes "what to expect," averaged over many rolls?

### Introduce the concept in isolation

> **E[X] = Σ (value × P(value))**

For a single die: `E = 1×(1/6) + 2×(1/6) + 3×(1/6) + 4×(1/6) + 5×(1/6) + 6×(1/6) = (1+2+3+4+5+6)/6 = 21/6 = 7/2`.

`7/2 = 3.5` — not a value the die can ever actually show, but the genuine long-run average: rolling a die many times and averaging the results converges toward `3.5`, precisely because each face contributes its value weighted by how often it occurs.

### Discard the throwaway example

Not applicable — this computation directly motivates the next unit's larger example.

### CS Lens

Expected value is Lesson 44's sigma notation, applied to a probability distribution specifically — `Σ x·P(x)` is structurally identical to any other weighted sum this series has computed, with probabilities playing the role of weights.

### SE Lens

A single expected value can be genuinely more useful than the full distribution for many practical decisions (should I take this bet, on average) — even though, like the `3.5` above, it may not be a value the underlying quantity can ever actually take.

---

## Concept Unit: Expected Value of Two Dice — Using the Distribution Already Built

### The Problem

Compute the expected value of the *sum* of two dice, using Lesson 70's already-derived distribution directly.

### Introduce the concept in isolation

```clojure
(defn expected-value-from-counts [counts total i]
  (if (empty? counts)
    0
    (+ (/ (* i (first counts)) total) (expected-value-from-counts (rest counts) total (+ i 1)))))
```

```
user=> (expected-value-from-counts (list 0 0 1 2 3 4 5 6 5 4 3 2 1) 36 0)
7
```

`E[\text{sum}] = 7`, computed directly from Lesson 70's distribution — every possible sum, weighted by how many of the `36` equally-likely outcomes produce it, summed together.

### Discard the throwaway example

Not applicable — `expected-value-from-counts` is a real, reusable function.

### Project Change

- **Reference Source**: Lesson 70's convolved dice distribution supplies the real counts this function sums over.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn expected-value-from-counts [counts total i]
  (if (empty? counts)
    0
    (+ (/ (* i (first counts)) total) (expected-value-from-counts (rest counts) total (+ i 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`i`** — reappearing accumulator-style index (Lesson 34's shape), tracking which sum value the current count corresponds to, incremented once per recursive call.
- **`(/ (* i (first counts)) total)`** — one term of the expected-value sum: this position's value (`i`), times how often it occurs (`(first counts)`), divided by the total outcome count — exactly `value × probability`, with `probability` computed inline as `count/total`.

### CS Lens

`E[\text{sum}] = 7` is exactly the midpoint of the possible range `2` to `12` — no coincidence, since the distribution (Lesson 70's convolution) is perfectly symmetric around `7`, the single most likely sum and also the mathematical average.

### SE Lens

Computing this expectation directly from the already-derived distribution, rather than re-deriving it from scratch, is the same reuse this series has favored throughout — Lesson 70's convolution work pays off again here, for a genuinely different question than the one it was originally built to answer.

### Connection to the previous unit

The previous unit defined expected value on a simple, single-die case; this unit applies it to a real distribution this series already built, computing a genuine, non-obvious result.

---

## Concept Unit: Linearity of Expectation

### The Problem

`E[\text{first die}] = 7/2` and `E[\text{second die}] = 7/2` (each individually, from Concept Unit 1). `E[\text{sum}] = 7` (Concept Unit 2). Is `7 = 7/2 + 7/2` a coincidence specific to dice, or a general fact about expectation?

### Introduce the concept in isolation

> **E[X+Y] = E[X] + E[Y]**, always — even when `X` and `Y` are not independent.

```
user=> (= 7 (+ 7/2 7/2))
true
```

This isn't a coincidence: **linearity of expectation** holds for *any* two quantities, related or not. This is genuinely surprising — Lesson 73 showed some pairs of dice events are dependent, yet expectation still simply adds, without needing to know anything about how `X` and `Y` relate. Contrast this with, say, computing the full distribution of `X+Y` (Lesson 70's convolution), which *does* require knowing the relationship between `X` and `Y` in full detail — expectation is a strictly easier question than the full distribution, and linearity is exactly why.

### Discard the throwaway example

Not applicable — this confirmed identity is a genuine, general mathematical fact, not specific to this one example.

### CS Lens

Linearity of expectation is one of the most powerful tools in all of probabilistic algorithm analysis — it lets an expected cost be computed by summing simple, individual expectations, even when the underlying random choices are deeply interrelated, without ever needing the full joint distribution Lesson 70's convolution would otherwise require.

### SE Lens

Knowing linearity holds *unconditionally* — not just for independent quantities — means a complicated system's expected total cost can often be estimated by breaking it into simple pieces and summing their individual expectations, without needing to model how those pieces interact at all, a genuine and frequently-used practical shortcut.

### Connection to the previous unit

The previous unit computed `E[\text{sum}]` directly from the full distribution; this unit shows the identical answer was available far more cheaply, by simply adding the two individual expectations — a real, verified example of linearity's power.

---

## Connect the Pieces

Both computation routes to `E[\text{sum}]`, confirming linearity's shortcut against the full distribution's direct computation:

```clojure
(println "E[single die]:" (expected-value-from-counts (list 0 1 1 1 1 1 1) 6 0))
(println "E[sum], via full distribution:" (expected-value-from-counts (list 0 0 1 2 3 4 5 6 5 4 3 2 1) 36 0))
(println "E[sum], via linearity (2 x single die):" (* 2 (expected-value-from-counts (list 0 1 1 1 1 1 1) 6 0)))
```

```
E[single die]: 7/2
E[sum], via full distribution: 7
E[sum], via linearity (2 x single die): 7
```

Both routes agree exactly — the expensive, full-distribution computation (requiring Lesson 70's entire convolution) and the cheap, linearity-based shortcut (doubling a single die's own expectation) produce the identical answer, confirming linearity's real, practical value: the easier computation was trustworthy all along.

## What Breaks Without This

Suppose linearity were mistakenly believed to require independence — leading someone to conclude that `E[\text{sum} \mid \text{some dependent event}]` couldn't be computed by simple addition, and to always fall back on the full, expensive distribution instead, even when it wasn't necessary. This isn't a correctness error (the full distribution always works) but a real, avoidable cost: linearity holds regardless of dependence, so restricting its use to only independent cases discards a shortcut that was actually available the whole time — precisely the kind of unnecessary caution that costs real computational effort for no actual gain in correctness.

## Exercises

1. **Trace.** Compute `E[\text{single die}]` by hand, summing all six terms directly, confirming `7/2`.
2. **Predict.** Before computing it, predict `E[\text{sum of three dice}]` using linearity (three individual die expectations, summed). Justify without computing a full three-dice distribution.
3. **Verify.** Compute `E[X]` where `X` is "first die value doubled" (i.e., `2 × \text{first die}`), and confirm it equals `2 × E[\text{first die}]`.
4. **Break it, on purpose.** Attempt to compute `E[X \times Y]` (product, not sum) for two dice, and check whether `E[X] \times E[Y]` gives the same answer — does multiplication have the same unconditional linearity that addition does?
5. **Generalize.** Using the two-`d4` distribution (Lesson 71), compute `E[\text{sum}]` both directly from the full distribution and via linearity from a single `d4`'s expectation.
6. **Reconstruct.** Close this lesson. From memory, state linearity of expectation, and explain why it holds even for dependent quantities, using this lesson's dice example.

## Definition of Done

- [ ] You can compute an expected value directly from a distribution.
- [ ] You completed Exercise 2 and can state `E[\text{sum of three dice}]` using linearity alone.
- [ ] You completed Exercise 4 and can state whether multiplication shares addition's unconditional linearity.
- [ ] You completed Exercise 5 using the `d4` distribution, confirming both computation routes agree.
- [ ] Commit your Exercise 4 and Exercise 5 findings to your notes repository, with a commit message stating what you found — for example, `"Confirm E[X*Y] != E[X]*E[Y] in general for dependent dice quantities; verify E[sum] for two d4 = 5 via both direct and linearity routes"` — not just `"lesson 75 exercise"`.

---

**Next lesson:** Lesson 76, *Variance*, introduces a second summary statistic — not the average, but how spread out a distribution actually is around that average — derived directly from expected value.
