# Lesson 74: Bayes' Rule

**What you will build**: By the end of this lesson you'll be able to derive Bayes' rule directly from Lesson 72's conditional probability formula, applied in both directions — and use it to compute a genuinely surprising, real result: why a medical test that's `95%` accurate can still mean a positive result has only a `16%` chance of indicating real disease, verified against a concrete population count, not just trusted as a formula.

**What you need to know first**: Lesson 72's conditional probability formula, and Lesson 13's rearrangement technique.

**Terms introduced in this lesson**:

- **Bayes' rule** — `P(B|A) = P(A|B) × P(B) / P(A)`, a formula for reversing which event is being conditioned on. *Why it matters*: derived directly from conditional probability's own definition, applied in both directions — the exact technique behind updating a belief once new evidence arrives.

**Objects and methods used**: None new. This lesson combines `*`, `/`, `+`, and `-`, each already covered.

---

## Concept Unit: Deriving Bayes' Rule

### The Problem

Lesson 72 computed `P(A|B)` from `P(A ∩ B)` and `P(B)`. Sometimes the *reverse* is what's actually known — `P(A|B)` is measurable, but `P(B|A)` is what's actually needed. Is there a way to convert one into the other?

### Introduce the concept in isolation

Lesson 72's own definition applies in both directions, since `P(A ∩ B)` is symmetric (`A` and `B` intersecting doesn't depend on which one is named first):

```
P(A ∩ B) = P(A|B) × P(B)     (Lesson 72's definition, solved for the intersection)
P(A ∩ B) = P(B|A) × P(A)     (the identical definition, with A and B's roles swapped)
```

Both right-hand sides equal the same quantity, `P(A ∩ B)` — setting them equal to each other and rearranging (Lesson 13):

> **P(B|A) × P(A) = P(A|B) × P(B)**
>
> **P(B|A) = P(A|B) × P(B) / P(A)**

This is **Bayes' rule** — not a new, independent fact, but a direct algebraic rearrangement of conditional probability's own definition, applied to itself from two directions.

### Discard the throwaway example

Not applicable — this derivation is applied to a genuine, verified example in the next unit.

### CS Lens

This is the identical rearrangement technique Lesson 13 first demonstrated on `apply-withdrawal`'s own formula — isolate the desired quantity by applying the same operation to both sides of an equation — here applied to a probability identity instead of an arithmetic one.

### SE Lens

Bayes' rule is the mathematical foundation of every "update a belief given new evidence" system — spam filters, medical diagnosis support, and Lesson 80's Markov chains all depend on exactly this reversal, precisely because the *measurable* direction (how often spam contains a word) and the *needed* direction (given this word, how likely is spam) are usually not the same quantity.

---

## Concept Unit: The Surprising Medical Test Example

### The Problem

A disease affects `1%` of a population. A test correctly identifies `95%` of people who have it, and correctly clears `95%` of people who don't (a `5%` false-positive rate). Given a *positive* test result, what's the actual probability of having the disease?

### Introduce the concept in isolation

```clojure
(def disease-rate 1/100)
(def true-positive-rate 95/100)
(def false-positive-rate 5/100)
(def healthy-rate (- 1 disease-rate))

(def p-positive (+ (* true-positive-rate disease-rate) (* false-positive-rate healthy-rate)))

(defn bayes-rule [p-evidence-given-hypothesis p-hypothesis p-evidence]
  (/ (* p-evidence-given-hypothesis p-hypothesis) p-evidence))

(bayes-rule true-positive-rate disease-rate p-positive)
```

```
user=> (bayes-rule true-positive-rate disease-rate p-positive)
19/118
```

`19/118 ≈ 16%` — despite a `95%`-accurate test, a positive result means only about a `16%` chance of actually having the disease. Verify this against a concrete population, rather than trusting the fraction alone:

```clojure
(def population 100000)
(def diseased (quot (* population 1) 100))
(def healthy (- population diseased))
(def true-positives (quot (* diseased 95) 100))
(def false-positives (quot (* healthy 5) 100))
(def total-positives (+ true-positives false-positives))
```

```
user=> diseased
1000
user=> true-positives
950
user=> false-positives
4950
user=> total-positives
5900
user=> (/ true-positives total-positives)
19/118
```

Out of `100{,}000` people, `1{,}000` have the disease (`950` test positive), and `99{,}000` don't (`4{,}950` still test positive — a small `5%` rate applied to a *huge* healthy population). Of the `5{,}900` total positive results, only `950` are genuine — `950/5900 = 19/118`, matching Bayes' rule exactly, and making the surprising result concrete: the disease's rarity means false positives from the enormous healthy population outnumber true positives from the small diseased one.

### Discard the throwaway example

Not applicable — this is a genuine, doubly-verified result (formula and direct population count agreeing).

### Project Change

- **Reference Source**: No reference counterpart — a direct application of this lesson's own derived formula.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn bayes-rule [p-evidence-given-hypothesis p-hypothesis p-evidence]
  (/ (* p-evidence-given-hypothesis p-hypothesis) p-evidence))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`p-positive`** — computed via `+` combining two products (Lesson 44's sigma notation, applied to exactly two cases: testing positive *with* the disease, or *without* it) — the total probability of a positive result, regardless of actual disease status.
- **`(bayes-rule true-positive-rate disease-rate p-positive)`** — reappearing formula (Concept Unit 1), computing `P(\text{disease}|\text{positive})` directly from three separately measurable quantities.

### CS Lens

The population-count verification isn't just a teaching device — it's the identical reasoning real epidemiologists use to explain this exact counterintuitive result to non-specialists: raw counts, not abstract fractions, make clear why a rare condition combined with an imperfect test produces so many more false alarms than true detections.

### SE Lens

A system that treats "the test says positive" as strong evidence of the underlying condition, without accounting for the condition's actual rarity (`disease-rate`), makes exactly the mistake this lesson's Bayes computation corrects — the test's own `95%` accuracy is a real, true fact about the test, but it is *not* the same number as the probability of disease given a positive result, and conflating the two is a common, consequential error.

### Connection to the previous unit

The previous unit derived Bayes' rule algebraically; this unit applies it to a real, surprising result, and independently confirms it by literally counting a hypothetical population — two different routes to the identical, verified conclusion.

---

## Connect the Pieces

The complete chain, from conditional probability's original definition through to a concrete, human-readable conclusion:

```clojure
(println "P(positive test):" p-positive)
(println "P(disease | positive), via Bayes:" (bayes-rule true-positive-rate disease-rate p-positive))
(println "P(disease | positive), via population count:" (/ true-positives total-positives))
(println "Both agree:" (= (bayes-rule true-positive-rate disease-rate p-positive) (/ true-positives total-positives)))
```

```
P(positive test): 59/1000
P(disease | positive), via Bayes: 19/118
P(disease | positive), via population count: 19/118
Both agree: true
```

Every number traces back to this lesson's own derivation and Lesson 72's original definition — the formula and the direct population count aren't two different facts that happen to agree, they're the identical calculation, performed two ways, confirming the surprising `19/118` result is genuinely correct, not an artifact of one particular method.

## What Breaks Without This

Suppose a positive test result were treated as if it directly meant "`95%` chance of having the disease" — confusing `P(\text{positive}|\text{disease}) = 95\%` (the test's own accuracy, a fact about the test) with `P(\text{disease}|\text{positive})` (the actual question, this lesson's computed `19/118 ≈ 16\%`) — the two numbers differ by a factor of nearly `6`. This isn't a subtle rounding issue; it's the exact confusion Bayes' rule exists to prevent, and in a real medical context, conflating these two numbers could lead to serious, avoidable distress or unnecessary treatment based on a number that was never actually the probability of having the condition.

## Exercises

1. **Trace.** By hand, using the population-count method, verify `p-positive` (Concept Unit 2) equals `5900/100000`, matching `59/1000`.
2. **Predict.** Before computing it, predict whether `P(\text{disease}|\text{positive})` would increase or decrease if the disease rate were `10\%` instead of `1\%` (same test accuracy). Compute it to check.
3. **Verify.** Recompute the medical test example with a `99\%`-accurate test (both true-positive and true-negative rates) instead of `95\%`, and see how much the result improves.
4. **Break it, on purpose.** Compute `P(\text{disease}|\text{positive})` incorrectly by treating it as equal to `true-positive-rate` directly (the confusion described in "What Breaks Without This"), and state the size of the error.
5. **Generalize.** A different disease affects `5\%` of a population, with a test that's `90\%` accurate both ways. Compute `P(\text{disease}|\text{positive})` using Bayes' rule, then verify against a population of `100{,}000`.
6. **Reconstruct.** Close this lesson. From memory, derive Bayes' rule from conditional probability's own definition, applied in both directions.

## Definition of Done

- [ ] You can derive Bayes' rule from Lesson 72's conditional probability formula, from memory.
- [ ] You completed Exercise 2 and can state how the disease rate affects the final probability.
- [ ] You completed Exercise 5, computing and verifying a new Bayes' rule scenario against a population count.
- [ ] You can explain, precisely, the difference between `P(\text{positive}|\text{disease})` and `P(\text{disease}|\text{positive})`, using this lesson's numbers.
- [ ] Commit your Exercise 3 and Exercise 5 results to your notes repository, with a commit message stating the computed probabilities — for example, `"Verify 99%-accurate test improves P(disease|positive) to roughly 50%; new disease (5% rate, 90% test) gives P(disease|positive) ≈ 32%"` — not just `"lesson 74 exercise"`.

---

**Next lesson:** Lesson 75, *Expected Value*, introduces a different way to summarize a probability distribution — not the most likely outcome, but its long-run average — derived directly from the two-dice distribution this section has already built.
