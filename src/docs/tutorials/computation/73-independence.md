# Lesson 73: Independence

**What you will build**: By the end of this lesson you'll be able to state and check the precise, computable condition for two events being genuinely independent — and, more importantly, prove a pair of dice-based events are genuinely *dependent* using the identical check, showing independence isn't a default assumption but a specific, verifiable fact.

**What you need to know first**: Lesson 72's conditional probability formula and its dice-based verification.

**Terms introduced in this lesson**:

- **independence** — two events `A` and `B` are independent if knowing one occurred doesn't change the probability of the other: `P(A|B) = P(A)`, equivalently `P(A ∩ B) = P(A) × P(B)`. *Why it matters*: the precise, checkable condition distinguishing "genuinely unrelated" from events that merely seem unrelated — this lesson proves both a genuinely independent pair and a genuinely dependent one.

**Objects and methods used**: None new. This lesson applies `=` and `*` to already-established probability vocabulary.

---

## Concept Unit: When Conditioning Changes Nothing — Independence

### The Problem

"The first die shows an even number" and "the second die shows a `6`" — two events about two physically separate dice. Does knowing one actually change the probability of the other?

### Introduce the concept in isolation

`P(\text{first even}) = 1/2`. `P(\text{second is } 6) = 1/6`. Their intersection — first die even *and* second die is `6` — is `{(2,6), (4,6), (6,6)}`, exactly `3` outcomes out of `36`: `P(A ∩ B) = 3/36 = 1/12`. Compare to `P(A) × P(B) = 1/2 × 1/6 = 1/12` — **identical**. Confirm via `P(A|B)`: `P(A ∩ B)/P(B) = (1/12)/(1/6) = 1/2` — exactly `P(A)` unconditionally, unchanged. Knowing the second die's result genuinely tells you nothing about the first die.

> **A and B are independent iff P(A ∩ B) = P(A) × P(B).**

### Discard the throwaway example

Not applicable — this direct verification is the evidence behind the definition just stated.

### CS Lens

This multiplication-based check is exactly Lesson 59's fundamental counting principle, restated in probability's own vocabulary: independent events combine by multiplying their probabilities, the identical "independent choices multiply" idea from counting, now applied to likelihood instead of raw counts.

### SE Lens

Two physically separate dice being independent isn't an assumption to take on faith — it's a fact this unit *proved*, by checking the multiplication condition directly against real counts, the same standard this series has held every claim to since Lesson 20.

---

## Concept Unit: Dependence — When Information Actually Matters

### The Problem

"The sum is greater than `8`" and "the first die shows a `6`" — two events about the *same* roll. Does knowing the first die's value change the probability the sum exceeds `8`?

### Introduce the concept in isolation

```clojure
(defn independent? [p-a p-b p-a-and-b]
  (= p-a-and-b (* p-a p-b)))
```

`P(\text{sum}>8) = 10/36 = 5/18` (sums `9,10,11,12`, with counts `4,3,2,1`). `P(\text{first}=6) = 1/6`. Their intersection — first die is `6` *and* sum exceeds `8` — means the second die is `3, 4, 5,` or `6` (giving sums `9,10,11,12`): `4` outcomes out of `36`, `P(A \cap B) = 4/36 = 1/9`.

```
user=> (independent? 5/18 1/6 1/9)
false
```

`P(A) × P(B) = 5/18 × 1/6 = 5/108`, but `P(A ∩ B) = 1/9 = 12/108` — genuinely different numbers, confirming real dependence. Check directly with the conditional formula: `P(A|B) = (1/9)/(1/6) = 2/3` — far larger than the unconditional `P(A) = 5/18 ≈ 0.28`. Knowing the first die is `6` makes "sum exceeds `8`" *much* more likely (`2/3`, since the second die only needs to be `3` or higher), exactly the opposite of independence.

### Discard the throwaway example

Not applicable — this is a genuine, verified case of real dependence, checked with the identical formula that confirmed independence in the previous unit.

### Project Change

- **Reference Source**: No reference counterpart — a direct application of this lesson's own independence check.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn independent? [p-a p-b p-a-and-b]
  (= p-a-and-b (* p-a p-b)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= p-a-and-b (* p-a p-b))`** — reappearing `=` and `*` (Lessons 6, 2); the entire check is one exact-fraction comparison, no approximation involved, so the `false` result here is a genuine, provable inequality, not a rounding artifact.

### CS Lens

That "sum exceeds `8`" and "first die is `6`" are dependent, while "first die even" and "second die is `6`" are independent, both involve the *same physical dice* — dependence isn't about whether two things are physically connected, it's about whether one event's *definition* happens to constrain the other's possible outcomes, exactly what "sum" does by combining both dice together.

### SE Lens

Assuming two events are independent without checking — a common, real mistake in statistics and machine learning alike — can produce confidently wrong probability estimates; this lesson's `independent?` function is precisely the check that would have caught the dependence between "sum exceeds 8" and "first die is 6" before any calculation downstream trusted a false independence assumption.

### Connection to the previous unit

The previous unit confirmed a genuinely independent pair using the multiplication check; this unit applies the identical check to a pair that fails it, proving real dependence rather than merely suspecting it.

---

## Connect the Pieces

Both results, side by side, using the identical function:

```clojure
(println "First-even & second-is-6 independent?" (independent? 1/2 1/6 1/12))
(println "Sum>8 & first-is-6 independent?" (independent? 5/18 1/6 1/9))
```

```
First-even & second-is-6 independent? true
Sum>8 & first-is-6 independent? false
```

One function, two genuinely different, both fully verified answers — proof that `independent?` isn't biased toward either outcome; it reports exactly what the underlying probabilities actually satisfy.

## What Breaks Without This

Suppose a system estimated the probability of two conditions both holding by simply multiplying their individual probabilities, *without* checking independence first — applying `P(A) × P(B)` to "sum exceeds `8`" and "first die is `6`" would give `5/108`, when the true joint probability is `1/9 = 12/108` — more than double the naive estimate. This isn't a rounding error; it's the direct, provable consequence of assuming independence where none exists, exactly the mistake Concept Unit 2's `false` result exists to prevent — checking `independent?` first, rather than multiplying probabilities out of habit, is what catches this before it propagates into a wrong conclusion.

## Exercises

1. **Trace.** Verify by hand that "second die shows an even number" and "first die shows a `6`" are independent, computing all three probabilities directly.
2. **Predict.** Before checking, predict whether "sum is `7`" and "first die is `3`" are independent (hint: for every possible first-die value, is there exactly one second-die value making the sum `7`?). Verify using `independent?`.
3. **Verify.** Confirm "sum is even" and "first die is even" — are these independent? Compute all three probabilities and check.
4. **Break it, on purpose.** Construct your own pair of clearly dependent dice events (different from this lesson's example), and confirm `independent?` correctly reports `false`.
5. **Generalize.** Using the two-`d4` distribution (Lesson 71), check whether "sum is `5`" and "first die is `2`" are independent.
6. **Reconstruct.** Close this lesson. From memory, state the independence condition, and explain why "sum exceeds 8" and "first die is 6" are dependent while "first die even" and "second die is 6" are not.

## Definition of Done

- [ ] You can check whether two events are independent using the multiplication condition, with exact fractions.
- [ ] You completed Exercise 2 and correctly predicted (and verified) whether "sum is 7" is independent of the first die's value.
- [ ] You completed Exercise 5 using the `d4` distribution.
- [ ] You can explain, using a concrete example, why two events about the same physical dice can still be genuinely independent.
- [ ] Commit your Exercise 3 and Exercise 5 findings to your notes repository, with a commit message stating each verdict — for example, `"Verify sum-even & first-even are dependent (not independent); sum=5 & first=2 for two d4 are dependent"` — not just `"lesson 73 exercise"`.

---

**Next lesson:** Lesson 74, *Bayes' Rule*, rearranges Lesson 72's conditional probability formula in the opposite direction — deriving `P(B|A)` from `P(A|B)`, the exact technique behind updating a belief when new evidence arrives.
