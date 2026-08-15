# Lesson 51: Big-O

**What you will build**: By the end of this lesson you'll be able to state and apply the formal definition of Big-O notation — not as a memorized symbol, but as the precise, provable version of Lesson 50's informal "grows like" comparisons, derived directly from the observation that constants and lower-order terms stop mattering once an input gets large enough.

**What you need to know first**: Lesson 50's six growth-rate categories and Lesson 49's closed forms, especially `reverse-naive`'s `n(n-1)/2`.

**Terms introduced in this lesson**:

- **Big-O notation** — a way of describing a function's growth rate by bounding it above by a simpler function, up to a constant factor, once the input is large enough. *Why it matters*: the formal, provable version of Lesson 50's informal growth-rate categories — precise enough to state and check, not just observe from a table of numbers.
- **dominant term** — in a formula with several terms of different growth rates (like `n²/2 - n/2`), the term that grows fastest as the input increases. *Why it matters*: this is exactly what survives when a formula is simplified down to its Big-O classification — everything else gets discarded as not mattering for large enough input.

**Objects and methods used**: None new. This lesson formalizes reasoning about closed forms already derived.

---

## Concept Unit: Why Constants and Lower-Order Terms Stop Mattering

### The Problem

`reverse-naive`'s exact cost, from Lesson 49, is `n(n-1)/2` — which expands to `n²/2 - n/2`. This has *two* terms, growing at two different rates (`n²` and `n`), combined with a constant factor (`1/2`). Lesson 50 called this "quadratic" without further qualification — is that a simplification that loses real information, or does it capture everything that actually matters?

### Introduce the concept in isolation

Compute `n²/2` and `n/2` separately, at increasing `n`, to see how their relative sizes change:

```
n = 10:  n²/2 = 50      n/2 = 5      ratio: 10x
n = 100: n²/2 = 5,000   n/2 = 50     ratio: 100x
n = 1000: n²/2 = 500,000  n/2 = 500  ratio: 1000x
```

As `n` grows, the `n²/2` term doesn't just stay larger than `n/2` — it grows *proportionally* larger, without bound. At `n = 1000`, the `n/2` term contributes less than a tenth of a percent to the total; subtracting it changes the answer by an amount that becomes utterly negligible as `n` keeps growing. The `n²` part is the **dominant term** — for large enough `n`, it alone determines how the whole expression behaves, and everything else (the `-n/2`, and even the `1/2` constant factor in front of `n²` itself) becomes irrelevant to the *category* of growth, even though it still matters for the exact number.

### Discard the throwaway example

Not applicable — this observation is the direct motivation for the formal definition in the next unit.

### Generalizing

This is true of every closed form Lesson 49 derived: `T(0) + nc` is dominated by `nc` (the constant `T(0)` fades to irrelevance as `n` grows); `2ⁿT(0) + (2ⁿ-1)c` is dominated by its `2ⁿ` terms. In every case, one term's growth rate eventually swamps every other term's contribution entirely.

### CS Lens

This is exactly why Lesson 50's table showed such dramatic gaps between categories, but comparatively modest differences *within* a category (a constant factor of `2` matters far less than the difference between `n²` and `n³`) — Big-O notation, derived next, is built specifically to capture this asymmetry precisely.

### SE Lens

Two algorithms, one costing `n²` operations and another costing `50n²` operations, are both "quadratic" in exactly the sense that matters most for predicting how they'll behave as input grows — the factor of `50` is a real, sometimes important difference in absolute speed, but it doesn't change *which* input sizes become impractical, the way the difference between quadratic and exponential does.

---

## Concept Unit: The Formal Definition of Big-O

### The Problem

State "constants and lower-order terms don't matter for large `n`" precisely enough to prove, rather than just observe from a few examples.

### Introduce the concept in isolation

> A function `f(n)` is **O(g(n))** if there exist positive constants `c` and `n₀` such that `f(n) ≤ c · g(n)` for every `n ≥ n₀`.

Apply this directly to `reverse-naive`'s cost, proving `n(n-1)/2` is `O(n²)`:

**Claim:** `n(n-1)/2 ≤ c · n²` for some `c` and all `n ≥ n₀`.

**Proof:** Choose `c = 1` and `n₀ = 1`. For any `n ≥ 1`:

```
n(n-1)/2 = (n² - n)/2 ≤ n²/2 ≤ n² = 1 · n²
```

(`n² - n ≤ n²` because `n ≥ 0` for any input size; `n²/2 ≤ n²` because `1/2 ≤ 1`.) This holds for *every* `n ≥ 1`, so the definition's requirements are satisfied with `c = 1`, `n₀ = 1` — `n(n-1)/2` is `O(n²)`, proven, not merely asserted from a table of examples.

### Discard the throwaway example

Not applicable — this is a complete, formal proof.

### Formal Definition, Walked Through

- *"there exist positive constants c and n₀"* — Lesson 9's existential quantifier, precisely: the definition doesn't require finding the *best possible* `c` and `n₀`, only *some* valid pair — this is exactly why the proof above could pick simple, convenient values (`c=1`, `n₀=1`) rather than needing the tightest possible bound.
- *"for every n ≥ n₀"* — Lesson 9's universal quantifier, over a restricted domain: the inequality doesn't need to hold for every `n` at all, only from `n₀` onward — Big-O is explicitly a statement about large-input behavior, indifferent to what happens for small `n`.
- *"f(n) ≤ c · g(n)"* — an upper bound, not an exact match: `O(g(n))` means `f` grows *no faster than* `g`, up to a constant factor — it doesn't claim `f` and `g` grow at exactly the same rate (Lesson 52 covers the notation, `Θ`, that does make that stronger claim).

### CS Lens

This is precisely Lesson 49's honest upper-bound argument for `fib`, given its proper name: showing `T(n) ≤ 2^n T(0) + (2^n - 1)c` is exactly a Big-O argument — `T(n)` is `O(2ⁿ)`, proven by exhibiting constants that make the defining inequality hold, the identical technique this unit just formalized for `reverse-naive`.

### SE Lens

A Big-O claim is a genuine, checkable mathematical statement — "this algorithm is `O(n²)`" is either provable (by exhibiting `c` and `n₀`, the way this unit just did) or it isn't, which is a meaningfully stronger claim than "this algorithm seems to slow down a lot on bigger inputs," the kind of description this series has been careful to avoid relying on since Lesson 1.

### Connection to the previous unit

The previous unit observed, informally, that a dominant term eventually swamps everything else; this unit is the precise, provable statement of exactly that observation, applied directly to a function this series has already measured by hand.

---

## Concept Unit: Classifying This Series' Own Functions

### The Problem

Apply Big-O to every representative function from Lesson 50's table, stating each one's classification precisely.

### Introduce the concept in isolation

- **`sum-to`** is **O(n)**: its closed form, `T(0) + nc`, satisfies `T(0) + nc ≤ c' \cdot n` for a suitable constant `c'` (roughly `c + T(0)`, once `n ≥ 1`) and all `n` beyond a small `n₀`.
- **`reverse-naive`** is **O(n²)**, proven directly in the previous unit.
- **naive `fib`** is **O(2ⁿ)**: proven via the upper-bound recurrence `U(n) = 2^n T(0) + (2^n-1)c`, itself bounded by `c' \cdot 2^n` for a suitable constant.
- **`count-halvings`** is **O(log n)**: each call halves `n`, and Lesson 43 already showed the number of halvings needed is `log2(n)`, directly matching the defining inequality with `g(n) = log(n)`.

Every classification follows the identical two-step pattern: derive (or recall) the closed form, then show it's bounded above by a constant multiple of the named comparison function, for large enough `n`.

### Discard the throwaway example

Not applicable — every classification connects to an already-derived closed form.

### CS Lells

This is the actual, complete toolkit real algorithm analysis uses: derive a recurrence (Lesson 48), solve or bound it (Lesson 49), then state its Big-O classification (this lesson) — the exact sequence this series has now built, lesson by lesson, rather than presenting Big-O as an isolated symbol to memorize without the derivation behind it.

### SE Lens

Being able to derive a Big-O classification, rather than only recognizing one when told, is what makes it possible to classify genuinely *new* code — a function this series hasn't already analyzed — using the identical process: write its recurrence, solve or bound it, compare to a known growth-rate family.

### Connection to the previous unit

The previous unit proved one classification in full detail; this unit applies the identical reasoning to three more already-familiar functions, confirming the technique generalizes rather than being a one-off trick specific to `reverse-naive`.

---

## Connect the Pieces

Every function this series has built, classified in one place:

| Function | Big-O | Derived from |
|---|---|---|
| `count-halvings` | `O(log n)` | Lesson 43's halving count |
| `sum-to`, `factorial`, `my-length` | `O(n)` | Lesson 49's `T(0) + nc` |
| `reverse-naive` | `O(n²)` | This lesson's direct proof |
| naive `fib` | `O(2ⁿ)` | Lesson 49's upper-bound recurrence |
| `permutation-count(n,n)` | `O(n!)` | Lesson 45's `factorial` equivalence |

Every single classification in this table traces back to a specific, already-derived recurrence or closed form from earlier in this series — nothing here was memorized or asserted; every entry is a provable consequence of code this series wrote, traced, and analyzed directly.

## What Breaks Without This

Suppose someone claimed `reverse-acc` (Lesson 28's accumulator-based reverse) is `O(n²)`, reasoning loosely that "it's still processing a list, so it's probably similar to `reverse-naive`." Checking this against the formal definition immediately reveals the error: `reverse-acc` does exactly one `cons` per element, no nested `my-append` calls at all — its recurrence is `T(n) = T(n-1) + c` (Lesson 48's own first, simplest recurrence shape), giving `T(n) = O(n)`, not `O(n²)`. The claim wasn't wrong because of a subtle technicality — it was wrong because "processes a list" alone says nothing about growth rate; only actually deriving the recurrence, the way this lesson insists on, distinguishes `reverse-naive`'s real `O(n²)` from `reverse-acc`'s real `O(n)`, a difference invisible to a surface-level description but decisive for large input.

## Exercises

1. **Trace.** Prove `2n + 5` is `O(n)`, exhibiting specific values of `c` and `n₀` the way Concept Unit 2 did for `reverse-naive`.
2. **Predict.** Before proving it, predict whether `n² + n` is `O(n)`, `O(n²)`, or neither. Attempt a proof (or explain why one direction fails).
3. **Classify.** State the Big-O classification for `eval-poly-naive` and `eval-poly-horner` (Lesson 42), using their multiplication counts from that lesson directly.
4. **Break it, on purpose.** Attempt to "prove" `n²` is `O(n)` — try to find valid constants `c` and `n₀` satisfying the definition, and explain concretely why no such constants can exist.
5. **Generalize.** State the Big-O classification for `complete-tree-node-count` (Lesson 47), justifying it from that lesson's own closed form.
6. **Reconstruct.** Close this lesson. From memory, state the formal definition of Big-O, and prove `count-halvings` is `O(log n)` using it directly, the way this lesson proved `reverse-naive` is `O(n²)`.

## Definition of Done

- [ ] You can state the formal definition of Big-O from memory, correctly using both quantifiers.
- [ ] You completed Exercise 1, proving `2n + 5` is `O(n)` with explicit constants.
- [ ] You completed Exercise 4 and can explain, using the definition directly, why `n²` is not `O(n)`.
- [ ] You can classify a new function's growth rate by deriving its recurrence and comparing it to this lesson's known categories.
- [ ] Commit your Exercise 3 and Exercise 5 classifications to your notes repository, with a commit message stating each proof's constants — for example, `"Classify eval-poly-naive as O(n^2), eval-poly-horner as O(n); complete-tree-node-count is O(2^d) in tree depth"` — not just `"lesson 51 exercise"`.

---

**Next lesson:** Lesson 52, *Big-Theta and Big-Omega*, completes this lesson's one-directional upper bound with the two notations that state a lower bound and a tight, two-sided bound — the difference between "grows no faster than" and "grows exactly like."
