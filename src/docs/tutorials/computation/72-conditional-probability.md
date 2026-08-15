# Lesson 72: Conditional Probability

**What you will build**: By the end of this lesson you'll be able to compute the probability of an event given that some other event is already known to have occurred — deriving the formula directly from Lesson 71's sample-space shrinking, and verifying it against direct counting on the two-dice distribution already built.

**What you need to know first**: Lesson 71's sample space, event, and probability formula.

**Terms introduced in this lesson**:

- **conditional probability** — the probability of event `A` occurring, given that event `B` is already known to have occurred: `P(A|B) = P(A∩B) / P(B)`. *Why it matters*: the precise, computable way "already knowing something" changes a probability calculation — the mathematical foundation behind spam filtering, medical testing, and every other "given this evidence, how likely is that" question.

**Objects and methods used**: None new. This lesson combines `/` (Lesson 2) and already-established probability vocabulary (Lesson 71).

---

## Concept Unit: Deriving Conditional Probability

### The Problem

Given that two dice sum to an *even* number, what's the probability the sum is also *greater than 8*? Not the same question as "what's the probability the sum is both even and greater than 8" among *all* outcomes — this question already assumes the sum is even, and asks only among *those* outcomes.

### Introduce the concept in isolation

"Given `B`" means the sample space itself shrinks — only the `18` outcomes where the sum is even are still under consideration, not all `36`. Among those `18`, how many also satisfy "sum greater than `8`"? Sums of `10` (`3` ways) and `12` (`1` way) — `4` outcomes, out of the `18` now being considered:

> **P(sum>8 | sum is even) = 4/18 = 2/9**

### Discard the throwaway example

Not applicable — this direct count is the evidence the formula in the next unit is checked against.

### Generalizing

This "shrink the sample space to exactly the outcomes satisfying `B`, then ask what fraction of *those* also satisfy `A`" process works for any two events, not just this specific dice example — the next unit states it as a formula.

### CS Lens

Also recognized in: a spam filter asking "given this email contains the word 'free,' what's the probability it's spam" (not "what's the probability an email is both spam and contains 'free,' out of all email") — conditional probability is precisely the mathematical shape of "update my estimate given new evidence."

### SE Lens

Confusing `P(A|B)` with `P(A ∩ B)` (the unconditional probability of both) is a real, common, consequential mistake — the two numbers are related but genuinely different, and this lesson's dice example already shows a concrete case where they differ (`2/9` versus, as the next unit computes directly, `1/9`).

---

## Concept Unit: The Formula P(A|B) = P(A∩B) / P(B)

### The Problem

Turn the previous unit's direct-counting argument into a reusable formula.

### Introduce the concept in isolation

> **P(A|B) = P(A ∩ B) / P(B)**

```clojure
(defn conditional-probability [p-a-and-b p-b]
  (/ p-a-and-b p-b))
```

```
user=> (conditional-probability 1/9 1/2)
2/9
```

`P(A ∩ B)` — sum is both even *and* greater than `8` — is `4/36 = 1/9` (the `4` outcomes from the previous unit, out of all `36`). `P(B)` — sum is even — is `18/36 = 1/2`. Dividing: `(1/9) / (1/2) = 2/9`, matching Concept Unit 1's direct count exactly — the formula and the direct shrink-the-sample-space reasoning agree, because dividing by `P(B)` is algebraically exactly what "restrict attention to only `B`'s outcomes" does to the ratio.

### Discard the throwaway example

Not applicable — `conditional-probability` is a real, verified function.

### Project Change

- **Reference Source**: Lesson 71's `probability` function and Lesson 70's dice distribution supply the real numbers this formula is checked against.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn conditional-probability [p-a-and-b p-b]
  (/ p-a-and-b p-b))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(/ p-a-and-b p-b)`** — reappearing exact division (Lesson 2); dividing one exact fraction by another, staying exact throughout — `(1/9)/(1/2)` computed precisely, not approximated.

### CS Lens

`P(A|B) × P(B) = P(A ∩ B)` (the formula, rearranged — Lesson 13's own rearrangement technique) is exactly the **chain rule** of probability, and the direct algebraic basis for Lesson 74's *Bayes' rule*, which rearranges this identical relationship in the opposite direction.

### SE Lens

Verifying `conditional-probability`'s output against Concept Unit 1's *direct count* — not just trusting the formula symbolically — is the same "check the derived version against direct enumeration" discipline this series has practiced since Lesson 20, now applied to a probability formula instead of a numeric one.

### Connection to the previous unit

The previous unit computed a conditional probability by direct counting; this unit is the general formula, confirmed to produce the identical answer on the exact case already worked out by hand.

---

## Connect the Pieces

The formula, cross-checked against direct counting on the two-dice distribution once more, using a different pair of events:

```clojure
(println "P(sum=7 | at least one die shows an even total contribution... ) — direct dice check:")
(println "P(sum > 10):" (probability (+ 2 1) 36))
(println "P(sum > 10 and sum is even):" (probability (+ 0 1) 36))
(println "P(sum is even):" (probability 18 36))
(println "P(sum > 10 | sum is even):" (conditional-probability (probability 1 36) (probability 18 36)))
```

```
P(sum > 10): 1/12
P(sum > 10 and sum is even): 1/36
P(sum is even): 1/2
P(sum > 10 | sum is even): 1/18
```

Every value traces back to Lesson 70's own convolved distribution (`sum=11` has `2` ways, `sum=12` has `1` way, giving `3/36=1/12` for "sum > 10"; only `sum=12`'s `1` way is both `>10` and even) — the conditional probability formula, applied to a second, independently-checkable case, confirming it isn't a coincidence specific to the first example.

## What Breaks Without This

Suppose `P(A|B)` were computed by mistakenly dividing `P(B)` by `P(A ∩ B)` — the fraction inverted:

```
user=> (conditional-probability 1/2 1/9)
9/2
```

`9/2` — a number greater than `1`, immediately violating Lesson 71's own probability axioms (every probability must be between `0` and `1`) — a clear, catchable sign something is wrong, in this particular case. This is a useful, real safety check: *any* time a "probability" computation produces a value outside `0` to `1`, the axioms themselves flag it as impossible, even before re-checking the arithmetic in detail — a direct, practical use of Lesson 71's axioms as a sanity check on this lesson's formula.

## Exercises

1. **Trace.** By hand, count directly: given a two-dice sum is odd, how many of those outcomes also have a sum less than `6`? Compute the conditional probability from your count.
2. **Predict.** Before computing it, predict whether `P(sum=7 | sum is odd)` is larger or smaller than the unconditional `P(sum=7) = 1/6`. Compute both and compare.
3. **Verify.** Confirm your Exercise 1 answer using `conditional-probability` directly, cross-checking against the direct count.
4. **Break it, on purpose.** Compute a conditional probability with the numerator and denominator swapped, the way "What Breaks Without This" did, and confirm the axiom violation catches it.
5. **Generalize.** Using the two-`d4` distribution from Lesson 71's Exercise 5, compute `P(\text{sum}=5 \mid \text{sum is odd})`.
6. **Reconstruct.** Close this lesson. From memory, state the conditional probability formula, and explain why dividing by `P(B)` is what "restricting to B's outcomes" means algebraically.

## Definition of Done

- [ ] You can compute a conditional probability both by direct counting and by the formula, and confirm they agree.
- [ ] You completed Exercise 2 and can state whether new information increased or decreased the probability, with a number.
- [ ] You completed Exercise 5 using the `d4` distribution.
- [ ] You can explain why a computed "probability" outside `0` to `1` immediately signals an error, using the axioms directly.
- [ ] Commit your Exercise 1 and Exercise 5 work to your notes repository, with a commit message stating the conditional probabilities you verified — for example, `"Verify P(sum<6 | sum odd) by direct count and formula, both give 5/18; compute P(sum=5|odd) for two d4 = 1/4"` — not just `"lesson 72 exercise"`.

---

**Next lesson:** Lesson 73, *Independence*, derives the precise condition under which conditioning on `B` changes nothing at all — `P(A|B) = P(A)` — distinguishing genuine independence from events that merely look unrelated.
