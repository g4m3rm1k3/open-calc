# Lesson 71: Discrete Probability

**What you will build**: By the end of this lesson you'll be able to state a sample space and an event using exactly Lesson 10's set vocabulary, compute a real probability as an exact fraction using Lesson 2's own exact-division behavior, and verify the probability axioms directly against the previous lesson's dice-sum distribution.

**What you need to know first**: Lesson 10's sets, Lesson 2's exact fractions, and Lesson 70's two-dice sum distribution.

**Terms introduced in this lesson**:

- **sample space** — the set of all possible outcomes of a random process. *Why it matters*: literally a set (Lesson 10) — probability's own foundational object is built directly on already-established vocabulary, not a new kind of thing.
- **event** — a subset of the sample space; the outcomes that "count," out of every outcome that could occur. *Why it matters*: probability is assigned to events, not necessarily single outcomes — an event can contain one outcome, several, or none at all.
- **probability axioms** — the basic requirements any valid probability assignment must satisfy: every event's probability is between `0` and `1`, and the probability of the entire sample space is `1`. *Why it matters*: the precise, checkable conditions that distinguish a genuine probability from an arbitrary number.

**Objects and methods used**: None new. This lesson combines `/` (Lesson 2) and `clojure.set` operations (Lesson 10), each already covered.

---

## Concept Unit: Sample Space and Events

### The Problem

Rolling two dice, "the sum is `7`" is a meaningful event to ask about. What, precisely, is the full space of possibilities this event is being compared against, and how is the event itself represented?

### Introduce the concept in isolation

The **sample space** for rolling two dice is the set of every possible outcome — all `36` equally likely `(first-die, second-die)` pairs, `#{[1 1] [1 2] ... [6 6]}` (Lesson 11's ordered pairs, collected into a Lesson 10 set). An **event** is any subset of that space — "the sum is `7`" corresponds to the subset `#{[1 6] [2 5] [3 4] [4 3] [5 2] [6 1]}`, exactly the six pairs Lesson 70's convolution counted, now named as a genuine set rather than only a number.

### Discard the throwaway example

Not applicable — this framing is the direct basis for the probability computation in the next unit.

### CS Lens

Defining an event as a *set* (rather than, say, a single favored outcome) is exactly what makes Lesson 10's set operations — union, intersection, complement — directly applicable to combining events: "sum is `7` or sum is `11`" is a union of two events; "sum is `7` and both dice show the same value" is an intersection — probability inherits Section I's entire set vocabulary for free.

### SE Lens

This is exactly why Lesson 70's dice-sum distribution mattered beyond a numerical curiosity — every entry in that distribution *is* the size of a specific event (the set of dice pairs summing to that value), waiting for this lesson's probability formula to turn it into an actual probability.

---

## Concept Unit: Probability as a Ratio — the Axioms

### The Problem

Given the sample space and an event, state precisely what "the probability of the event" means, and confirm it satisfies real, checkable requirements rather than being an arbitrary number.

### Introduce the concept in isolation

For a sample space where every outcome is **equally likely**:

> **P(event) = |event| / |sample space|**

```clojure
(defn probability [favorable total]
  (/ favorable total))
```

```
user=> (probability 6 36)
1/6
```

The probability of rolling a sum of `7` is exactly `1/6` — Lesson 2's exact fraction, not a rounded decimal, because `favorable` and `total` are both whole numbers and `/` preserves exactness (Lesson 2's own behavior, directly relevant here rather than incidental). Check the **probability axioms** directly: `1/6` is between `0` and `1` (confirmed: `0 ≤ 1/6 ≤ 1`), and the probability of the *entire* sample space is `(probability 36 36) = 1`, exactly as the axioms require — the whole sample space, by definition, always contains "the event that happens," so its probability must be `1`.

### Discard the throwaway example

Not applicable — this is a genuine, verified probability computation.

### Project Change

- **Reference Source**: Lesson 70's `die-gf` convolution result supplies the real `favorable`-count numbers this unit's formula uses directly.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn probability [favorable total]
  (/ favorable total))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(/ favorable total)`** — reappearing exact division (Lesson 2); `probability` is nothing more than this one operation, applied to two counts already fully derivable from Lesson 70's convolution and this lesson's own event/sample-space vocabulary.

### CS Lens

Every probability computed this way is automatically a well-defined rational number between `0` and `1` — the axioms aren't a separate thing to check by hand each time, they follow directly from `favorable` being a subset's size (never negative, never larger than the whole space) and `total` being the whole space's own size.

### SE Lens

Using exact fractions (Lesson 2) rather than decimal approximations for probability is a real, deliberate choice: `1/6` stays exact through further computation (adding, multiplying probabilities together, as later lessons will), where a rounded `0.1666...` would silently accumulate small errors exactly the way Lesson 2's own `0.3333333333333333` example first demonstrated.

### Connection to the previous unit

The previous unit defined the sample space and event as sets; this unit turns their sizes into an actual probability, and confirms that number satisfies the real, checkable axioms rather than merely resembling one.

---

## Connect the Pieces

The complete two-dice probability distribution, derived directly from Lesson 70's convolution:

```clojure
(def dice-sum-counts (convolve die-gf die-gf 12))

(println "P(sum=7):" (probability (nth-or-zero dice-sum-counts 7) 36))
(println "P(sum=2):" (probability (nth-or-zero dice-sum-counts 2) 36))
(println "Sum of all probabilities:" (reduce + 0 (map (fn [c] (probability c 36)) dice-sum-counts)))
```

```
P(sum=7): 1/6
P(sum=2): 1/36
P(sum=2): 1/36
Sum of all probabilities: 1
```

Every individual probability is between `0` and `1`, and summing every possible sum's probability together gives exactly `1` — a direct, computed confirmation of the probability axioms, using `reduce` (Lesson 27) and `map` (Lesson 25) together on Lesson 70's own distribution, not merely asserted.

## What Breaks Without This

Suppose a probability were computed using the wrong denominator — say, `24` instead of the true `36` total outcomes (an easy mistake if the sample space's actual size isn't verified directly):

```
user=> (probability 6 24)
1/4
```

`1/4`, not the correct `1/6` — and nothing about this wrong fraction looks obviously broken; `1/4` is a perfectly valid-looking probability, satisfying the axioms' `0`-to-`1` requirement on its own. Only checking it against the *actual* sample space size (confirmed directly, the way Concept Unit 1 built it as a real set of `36` genuine outcomes) catches the mistake — the axioms alone can't distinguish a correctly-computed probability from a wrong one built on a miscounted denominator.

## Exercises

1. **Trace.** By hand, compute `P(sum=4)` using Lesson 70's distribution and this lesson's formula.
2. **Predict.** Before computing it, predict `P(sum=7 or sum=11)` using the addition rule (Lesson 60 — these two events don't overlap) applied to their individual probabilities. Verify.
3. **Verify.** Confirm `P(\text{sum is even})` by summing the probabilities of every even sum from `2` to `12`.
4. **Break it, on purpose.** Compute a probability using a wrong total (not `36`), the way "What Breaks Without This" did, and confirm the axioms alone don't reveal the mistake.
5. **Generalize.** Using a `d4`'s convolved distribution from Lesson 70's own Exercise 5, compute the full probability distribution for the sum of two `d4` rolls.
6. **Reconstruct.** Close this lesson. From memory, state the probability axioms, and explain why summing every outcome's probability in a sample space must always equal `1`.

## Definition of Done

- [ ] You can define a sample space and an event using set vocabulary, and compute a probability as an exact fraction.
- [ ] You completed Exercise 3 and can state `P(sum is even)` exactly.
- [ ] You completed Exercise 5, deriving a full probability distribution for two `d4` rolls.
- [ ] You can explain why the axioms alone don't catch a wrong-denominator mistake, connecting this to Lesson 1's original warning.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating the probabilities you verified — for example, `"Verify P(sum even)=1/2 for two d6; derive full d4+d4 sum distribution, P(sum=5)=1/4"` — not just `"lesson 71 exercise"`.

---

**Next lesson:** Lesson 72, *Conditional Probability*, derives what happens to a probability once partial information is already known — the direct mathematical foundation behind everything from spam filtering to medical testing.
