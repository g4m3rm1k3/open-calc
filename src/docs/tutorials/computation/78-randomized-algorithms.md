# Lesson 78: Randomized Algorithms

**What you will build**: By the end of this lesson you'll be able to write an algorithm that makes its own random choices — a genuinely different kind of function than anything else in this series, since its output can differ between runs on identical input — and analyze its *expected* behavior precisely, using Lesson 75's expected value and Lesson 46's arithmetic series together.

**What you need to know first**: Lesson 77's random variables, Lesson 75's expected value, and Lesson 46's arithmetic series formula.

**Terms introduced in this lesson**:

- **randomized algorithm** — an algorithm that makes random choices as part of its own execution, rather than being fully determined by its input alone. *Why it matters*: randomness becomes a genuine algorithmic resource here, not merely something this series has been analyzing from the outside — the algorithm itself now depends on it.

**Objects and methods used**:

- **`shuffle`**
  - *What it is:* a function in Clojure's core library that returns a randomly reordered version of a collection.
  - *Implementation:* `(shuffle a-list)` — returns the same elements, in a random order, different (in general) on each call. Unlike every function this series has trusted since Lesson 2, `shuffle`'s output is *not* a pure function of its input alone — calling it twice on the identical list can (and usually does) produce different results.
  - *Its use:* Concept Unit 1, to build this lesson's randomized search.

---

## Concept Unit: Randomness as an Algorithmic Resource — `shuffle`

### The Problem

Every function this series has written, since `sum-to` in Lesson 20, has been **deterministic** — the same input always produces the same output, a property this series has relied on constantly (every "verify against a reference" check this series has performed depends on it). Is there a real, principled way to write a function whose behavior genuinely depends on chance, without breaking every assumption this series has built on determinism?

### Introduce the concept in isolation

```clojure
(defn find-position [lst target pos]
  (if (empty? lst)
    nil
    (if (= (first lst) target)
      pos
      (find-position (rest lst) target (+ pos 1)))))

(defn randomized-search [lst target]
  (find-position (shuffle lst) target 1))
```

Calling `(randomized-search (list 1 2 3 4 5) 3)` returns the position of `3` in a *randomly shuffled* copy of the list — a different position, in general, on different calls, because `shuffle` itself is not deterministic. This is a genuine, deliberate departure from every function this series has trusted so far: `randomized-search`'s own correctness (does it eventually find the target, assuming the target is actually present) doesn't depend on the shuffle's specific outcome, but its *performance* — how many comparisons it takes — genuinely does, differently, on different calls.

### Discard the throwaway example

Not applicable — `randomized-search` is a real, if intentionally simple, randomized algorithm.

### Project Change

- **Reference Source**: No reference counterpart — a direct, deliberate introduction of randomness into an otherwise ordinary search.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn randomized-search [lst target]
  (find-position (shuffle lst) target 1))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`shuffle`** — first appearance as a called function (covered fully in Objects and methods used, above): the source of this function's non-determinism.
- **`(find-position (shuffle lst) target 1)`** — reappearing linear-search shape (Lesson 24), applied to a shuffled copy instead of the original list order — correctness (finding the target if it's present) is completely unaffected by the shuffle; only *how many comparisons it takes* varies.

### CS Lens

This is the exact distinction real randomized algorithms rely on throughout computer science: **correctness** (does it eventually give the right answer) and **performance** (how much work does it take) can be separated, with randomness affecting only the second while a careful design keeps the first guaranteed — Lesson 81's *Las Vegas algorithms*, later, name this exact pattern directly.

### SE Lens

A function whose output can differ between identical calls is a real departure from everything this series has verified by direct, reproducible comparison — testing a randomized algorithm honestly requires a different approach than Lesson 20's "run it once, compare to a known answer," precisely because "run it once" no longer tells the whole story.

---

## Concept Unit: Analyzing Expected Behavior — Expected Search Position

### The Problem

`randomized-search`'s number of comparisons varies between runs. Is there a precise, provable statement about its *average* behavior, even without being able to predict any single run exactly?

### Introduce the concept in isolation

Let `X` be the position of the target within a randomly shuffled list of `n` elements — a genuine random variable (Lesson 77), a function of the random shuffle's outcome. By symmetry, the target is equally likely to land in any of the `n` positions: `P(X=i) = 1/n` for each `i` from `1` to `n`. Its expected value (Lesson 75):

```
E[X] = Σ (i=1 to n) i × (1/n) = (1/n) × Σ (i=1 to n) i = (1/n) × [n(n+1)/2] = (n+1)/2
```

The final step uses Lesson 46's own proven arithmetic series formula directly. For a `5`-element list: `E[X] = (5+1)/2 = 3` — on average, across many random shuffles, the target is found at position `3`, exactly the middle of the list, matching intuition (a uniformly random position averages to the midpoint) but now derived precisely rather than merely assumed.

### Discard the throwaway example

Not applicable — this derivation is a real, general, provable fact about `randomized-search`'s behavior.

### Formal Definition, Walked Through

- *"by symmetry"* — this is the crucial, checkable assumption: `shuffle` genuinely produces every ordering with equal likelihood, which is precisely what makes `P(X=i) = 1/n` valid for every position — a real property of a correctly-implemented shuffle, not something to take purely on faith.
- The derivation never needed to know *which* specific list or target was searched — the `(n+1)/2` result depends only on the list's length `n`, a general fact about `randomized-search`'s behavior on any input of that size.

### CS Lens

This exact expected-position analysis is the standard technique behind analyzing randomized quickselect and quicksort's pivot choices (Section VI, much later) — a random choice's *expected* cost, derived precisely using indicator-variable-style reasoning and known series formulas, rather than trusting an average is "probably fine" without proof.

### SE Lens

Knowing `E[\text{comparisons}] = (n+1)/2` — the identical expected cost as searching in a *fixed*, non-random order, on average — reveals something real: for this particular problem, randomizing the search order doesn't change the expected cost at all; its value lies elsewhere (avoiding a worst case that depends on the input's own structure, a concern Lesson 33's backtracking and Section VI's algorithm-design material return to directly).

### Connection to the previous unit

The previous unit introduced a function whose behavior genuinely varies between runs; this unit proves a precise, provable fact about its *average* behavior across all those varying runs, using tools (expected value, series formulas) already fully trusted from earlier in this series.

---

## Connect the Pieces

The full derivation, connecting this lesson's randomness directly to two previously-proven results:

```clojure
(println "shuffle (10 20 30 40 50):" (shuffle (list 10 20 30 40 50)))
(println "Expected position for n=5, via arithmetic series formula:" (arithmetic-sum-formula 1 5 5))
```

```
shuffle (10 20 30 40 50): (30 10 50 20 40)
Expected position for n=5, via arithmetic series formula: 15
```

(`arithmetic-sum-formula(1, 5, 5)` computes `n × (first+last)/2 = 5 × (1+5)/2 = 15`, the *sum* `1+2+3+4+5`; dividing by `n=5` gives the expected position, `3`, matching this lesson's own derivation exactly.) `shuffle`'s actual output will differ on every real run — but the *expected* position it produces, on average across many such runs, is a fixed, provable number, derived from Lesson 46's own formula, not dependent on any specific shuffle's outcome at all.

## What Breaks Without This

Suppose `randomized-search`'s expected cost were assumed, without derivation, to be `n` (checking the whole list on average) rather than the correctly-derived `(n+1)/2` — a plausible-sounding but wrong guess. For large `n`, this overestimates the true expected cost by roughly a factor of two — a real, consequential planning error if this function's expected performance were being used to estimate how a larger system built on top of it would behave. Deriving the expected value precisely, the way this lesson did, rather than guessing at a "reasonable-sounding" number, is exactly what avoids this kind of confidently wrong estimate.

## Exercises

1. **Trace.** By hand, using Lesson 46's formula, compute the expected search position for a list of `10` elements.
2. **Predict.** Before checking, predict whether the expected position changes if the *target itself* changes but the list length stays the same. Justify using this lesson's symmetry argument.
3. **Verify.** Run `(shuffle (list 1 2 3 4 5))` several times yourself, recording the target's position each time, and confirm the results cluster around this lesson's predicted average of `3`.
4. **Break it, on purpose.** Write a "randomized" search that isn't actually random — say, one that always reverses the list instead of shuffling it — and explain why the symmetry assumption behind this lesson's expected-value derivation would no longer hold for it.
5. **Generalize.** Derive the expected position formula for a list of `n` elements where the search stops at the *first* of *two* possible targets, rather than one — does linearity of expectation (Lesson 75) still apply directly, or does this need a genuinely different argument?
6. **Reconstruct.** Close this lesson. From memory, re-derive `E[X] = (n+1)/2` using the symmetry argument and Lesson 46's arithmetic series formula.

## Definition of Done

- [ ] You can write a function that uses genuine randomness (`shuffle`) and explain why it's not a pure function in Lesson 4's original sense.
- [ ] You can derive the expected search position for a list of any length, using Lesson 46's formula directly.
- [ ] You completed Exercise 3 and observed real randomized runs clustering around the predicted average.
- [ ] You can explain why "expected cost" and "actual cost of one run" are different, precisely stated questions.
- [ ] Commit your Exercise 3 observations and Exercise 5 derivation attempt to your notes repository, with a commit message stating what you found — for example, `"Run randomized-search 10 times on n=5 list, observed positions averaged close to 3 as predicted; attempted two-target expected position derivation"` — not just `"lesson 78 exercise"`.

---

**Next lesson:** Lesson 79, *Birthday Paradox*, uses the pigeonhole principle's cousin — a probabilistic, not certain, coincidence — to derive a famously surprising result using exactly the probability tools this section has built.
