# Lesson 62: Combinations

**What you will build**: By the end of this lesson you'll be able to count unordered selections — combinations — by dividing the previous lesson's permutation count by exactly the right amount, derived from a precise argument about how many orderings each combination secretly represents, and verified against `power-set` and `filter` directly.

**What you need to know first**: Lesson 61's permutation formula, Lesson 32's `power-set`, and Lesson 26's `filter`.

**Terms introduced in this lesson**:

- **combination** — an unordered selection of items from a larger set; a group where order doesn't matter, distinct from a permutation where it does. *Why it matters*: the direct counterpart to Lesson 61's permutation, with order stripped away — the central distinction this entire lesson is about.
- **binomial coefficient** — the count of combinations of `k` items chosen from `n`, written `C(n,k)` or "`n` choose `k`." *Why it matters*: this lesson's central formula, connecting forward to Lesson 63's Pascal's Triangle and Lesson 64's Binomial Theorem.

**Objects and methods used**: None new. This lesson combines `permutation-count-formula` (Lesson 61), `factorial` (Lesson 20), `power-set` (Lesson 32), `filter` (Lesson 26), and `my-length` (Lesson 24), each already covered.

---

## Concept Unit: From Permutations to Combinations — Dividing Out Order

### The Problem

Choosing `2` items from `{A, B, C}`, where order matters, gives `permutation-count(3,2) = 6` outcomes: `AB, BA, AC, CA, BC, CB`. But `AB` and `BA` are the *same group* — `{A, B}` — just listed in a different order. How many *genuinely different groups* of `2` are there, really?

### Introduce the concept in isolation

List the `6` permutations again, grouped by which underlying set they represent: `{AB, BA}` are both the group `{A,B}`; `{AC, CA}` are both `{A,C}`; `{BC, CB}` are both `{B,C}` — three genuinely distinct groups, each one counted *twice* among the six permutations, because each `2`-item group has exactly `2! = 2` different orderings.

This is the general pattern: every combination of `k` items corresponds to exactly `k!` different permutations (all the ways those same `k` items could be ordered) — so dividing the permutation count by `k!` converts "count every ordering separately" into "count each group exactly once."

### Discard the throwaway example

Not applicable — this small, fully-listed case is the direct evidence for the formula in the next unit.

### Generalizing

Nothing about the `{A,B,C}` example depended on its specific size — for *any* `n` and `k`, each combination corresponds to exactly `k!` permutations (Lesson 61's own "arrange everything" special case, applied here to just the `k` chosen items), so the same division applies universally.

### CS Lens

This "count with order, then divide out the internal orderings that shouldn't have mattered" technique recurs throughout combinatorics — it's the identical correction Lesson 65 (*Inclusion-Exclusion*) applies to a different kind of overcounting, and the same idea behind counting distinguishable arrangements of a word with repeated letters (each repeated letter's own internal orderings need dividing out too).

### SE Lells

Recognizing "does order matter here" as the deciding question between reaching for `permutation-count` or this lesson's combination formula is real, practical judgment — a five-card poker hand is a combination (the order the cards were dealt in doesn't change the hand); a race's first-second-third finishers is a permutation (the order is the entire point).

---

## Concept Unit: The Binomial Coefficient Formula

### The Problem

Translate this unit's division argument directly into a formula and code.

### Introduce the concept in isolation

> **C(n,k) = permutation-count(n,k) / k! = n! / (k! × (n-k)!)**

```clojure
(defn combination-count [n k]
  (quot (permutation-count-formula n k) (factorial k)))
```

```
user=> (combination-count 5 2)
10
user=> (combination-count 3 2)
3
```

`combination-count(3,2) = 3`, matching Concept Unit 1's direct enumeration exactly — three genuine groups (`{A,B}`, `{A,C}`, `{B,C}`), not six orderings.

### Discard the throwaway example

Not applicable — `combination-count` is a real, reusable function, and this is `C(n,k)`, the **binomial coefficient**, computed for the first time.

### Project Change

- **Reference Source**: `permutation-count-formula`, from Lesson 61, is the direct basis this formula divides.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `factorial`, from Lesson 20.

### The New Code — type it yourself

```clojure
(defn combination-count [n k]
  (quot (permutation-count-formula n k) (factorial k)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(permutation-count-formula n k)`** — reappearing closed-form permutation count (Lesson 61), computing the "with order" total first.
- **`(quot ... (factorial k))`** — reappearing `factorial` and integer division, dividing out exactly the `k!` internal orderings this unit's own argument identified — guaranteed to divide evenly, since every combination contributes exactly `k!` permutations, never a fraction of one.

### CS Lens

`combination-count(n, 0)` and `combination-count(n, n)` both equal `1` — there's exactly one way to choose nothing, and exactly one way to choose everything — a boundary check directly analogous to Lesson 61's `k=n` special case, worth verifying the same careful way.

### SE Lells

`combination-count` is dramatically smaller than `permutation-count` for the same `n` and `k` (the `k!` division shrinks it substantially once `k` grows) — a real, useful fact whenever a problem asks "how many distinct groups" rather than "how many distinct orderings," since a naive count that forgets to divide out order overcounts by a large, specific, avoidable factor.

### Connection to the previous unit

The previous unit argued, by direct enumeration, that dividing by `k!` corrects for overcounted order; this unit turns that argument into a working formula, verified against the same small case already checked by hand.

---

## Connect the Pieces

`combination-count`, verified against actually generating and filtering every subset — connecting this lesson directly to Section II's own tools:

```clojure
(println "combination-count(5,2):" (combination-count 5 2))
(println "2-element subsets of {1,2,3,4,5}, counted directly:"
         (my-length (filter (fn [s] (= (my-length s) 2)) (power-set (list 1 2 3 4 5)))))
```

```
combination-count(5,2): 10
2-element subsets of {1,2,3,4,5}, counted directly: 10
```

Both numbers agree — `combination-count`'s closed-form shortcut, and `power-set` combined with `filter` and `my-length` actually generating and counting every genuine `2`-element subset directly, land on the identical answer, `10` — the same "verify the fast, derived version against a slow, exhaustive one" habit this series has practiced since Lesson 20, now applied to a combinatorial formula instead of a numeric one.

## What Breaks Without This

Suppose a problem asking "how many different `2`-person committees can be formed from `5` candidates" were answered using `permutation-count(5,2) = 20` instead of `combination-count(5,2) = 10` — a plausible mistake, since both functions are readily available and both take the same two arguments. A committee of "Alice and Bob" is the *same* committee as "Bob and Alice" — there's no meaningful "first" or "second" committee member — so the correct answer is `10`, not `20`; using the permutation count silently double-counts every committee, exactly the "AB versus BA are the same group" overcounting Concept Unit 1 identified directly, now shown as a real, consequential mistake rather than only an abstract warning.

## Exercises

1. **Trace.** By hand, list every `2`-element subset of `{1,2,3,4}`, confirming the count matches `combination-count(4,2)`.
2. **Predict.** Before computing it, predict whether `combination-count(n,k)` equals `combination-count(n, n-k)` in general (choosing `k` to keep versus choosing `n-k` to leave out). Verify with `combination-count(5,2)` and `combination-count(5,3)`.
3. **Verify.** Confirm `combination-count(6,3)` against `power-set` and `filter`, the way Connect the Pieces did for `(5,2)`.
4. **Break it, on purpose.** Compute the committee-count mistake from "What Breaks Without This" yourself, confirming `permutation-count-formula(5,2)` really does give `20`, double `combination-count(5,2)`'s correct `10`.
5. **Generalize.** How many distinct `5`-card poker hands can be dealt from a standard `52`-card deck? Compute using `combination-count` directly (order doesn't matter in a dealt hand).
6. **Reconstruct.** Close this lesson. From memory, explain why each combination corresponds to exactly `k!` permutations, and re-derive the formula `C(n,k) = n!/(k!(n-k)!)`.

## Definition of Done

- [ ] You can derive the combination formula from the permutation formula by dividing out internal orderings, from memory.
- [ ] You completed Exercise 2 and confirmed `C(n,k) = C(n,n-k)` on a concrete example.
- [ ] You completed Exercise 5 (poker hands) and can state the result.
- [ ] You can explain, with a concrete example, the real-world difference between a situation needing a permutation count and one needing a combination count.
- [ ] Commit your Exercise 3 and Exercise 5 results to your notes repository, with a commit message stating each result — for example, `"Verify C(6,3)=20 against power-set/filter; 5-card poker hands from 52-card deck: C(52,5)=2,598,960"` — not just `"lesson 62 exercise"`.

---

**Next lesson:** Lesson 63, *Pascal's Triangle*, derives a recursive relationship between binomial coefficients directly — `C(n,k) = C(n-1,k-1) + C(n-1,k)` — giving this lesson's formula a second, structurally different derivation, and a computational shortcut that avoids factorials entirely.
