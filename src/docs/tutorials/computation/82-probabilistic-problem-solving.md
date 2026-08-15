# Lesson 82: Probabilistic Problem Solving

**What you will build**: By the end of this lesson you'll be able to prove that an object with a desired property *must* exist, without ever constructing it or exhibiting which one it is — the probabilistic method's signature move — using expected value's core existence lemma, proven by Lesson 17's proof by contradiction, applied through Lesson 75's linearity to a genuine, non-obvious result.

**What you need to know first**: Lesson 75's expected value and linearity, Lesson 17's proof by contradiction, and Lesson 27's `reduce`.

**Terms introduced in this lesson**:

- **probabilistic method** — a proof technique that shows an object with some desired property must exist by showing a randomly chosen object has that property with positive probability (or, equivalently, that a random quantity's expected value forces some specific outcome to meet a threshold). *Why it matters*: a genuinely different kind of proof than anything else in this series — it establishes existence without ever constructing or identifying the object itself.

**Objects and methods used**: None new. This lesson combines `reduce` (Lesson 27) and `/`, both already covered.

---

## Concept Unit: From Average to Existence

### The Problem

Knowing only a random quantity's *average* value — nothing else about it — what, if anything, can be concluded about whether some specific outcome meets or exceeds that average?

### Introduce the concept in isolation

> **Lemma:** If `E[X] = v`, then there exists at least one outcome `ω` with `X(ω) ≥ v`.

Prove this by contradiction (Lesson 17's technique, reused directly): suppose, for contradiction, that *every* outcome has `X(ω) < v`. Then the weighted average of all those values — which is exactly what `E[X]` computes — must itself be strictly less than `v` too (a weighted average of numbers every one of which is below `v` cannot itself reach `v`). But `E[X] = v`, by assumption. This is a direct contradiction, so the supposition was false: at least one outcome must actually satisfy `X(ω) ≥ v`.

### Discard the throwaway example

Not applicable — this lemma is a general, reusable fact, applied concretely in the next unit.

### CS Lens

This lemma is deliberately simple — almost obvious once stated — yet it's the entire engine behind the **probabilistic method**: every non-constructive existence proof this technique produces reduces, eventually, to exactly this one observation applied to some cleverly chosen random quantity.

### SE Lens

Lesson 17's proof by contradiction reappears here in a genuinely new role: not proving a fact about a fixed mathematical object (Lesson 17's own examples), but proving a fact about an entire, possibly enormous, space of possibilities at once — a technique whose real power shows up precisely when the space of outcomes is too large to check by hand, the subject of the next unit.

---

## Concept Unit: An Existence Proof Without Construction

### The Problem

Given a list of numbers, prove that *some* subset of them sums to at least half the total — without checking every possible subset, and without ever saying which subset actually achieves it.

### Introduce the concept in isolation

Consider choosing a random subset by independently deciding, for *each* number, whether to include it — like flipping a fair coin once per number. Let `S` be the random variable "sum of the chosen subset." By linearity of expectation (Lesson 75), applied to `n` independent inclusion decisions rather than two dice:

```
E[S] = Σ (each number's value × its own probability of being included)
     = Σ (value × 1/2)
     = (1/2) × (total sum)
```

```clojure
(defn expected-subset-sum [lst]
  (/ (reduce + 0 lst) 2))
```

```
user=> (expected-subset-sum (list 3 7 2 9 5))
13
```

For this list, `E[S] = 13` — exactly half of the total sum, `26`. By the previous unit's lemma, since `E[S] = 13`, **some specific subset must have a sum of at least `13`.** This is a complete, rigorous existence proof: with `5` numbers, there are `32` possible subsets, and this argument establishes at least one of them sums to `13` or more, without ever checking any of the `32`, or saying which one it is.

### Discard the throwaway example

Not applicable — this argument is a general, reusable proof technique, illustrated on this one concrete list.

### Project Change

- **Reference Source**: `expected-subset-sum` reuses Lesson 27's `reduce` directly.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn expected-subset-sum [lst]
  (/ (reduce + 0 lst) 2))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(reduce + 0 lst)`** — reappearing `reduce` (Lesson 27), computing the list's total sum.
- **`(/ ... 2)`** — halves the total, exactly the value linearity of expectation derives for `E[S]` — each element contributes its own value weighted by its own independent `1/2` inclusion probability, summing to half the total overall.

### CS Lens

This is the probabilistic method's classic shape: a random process (`n` independent coin flips, choosing a subset) is invented specifically to make some quantity's expectation easy to compute (here, trivially, half the total, via linearity), and the previous unit's lemma converts that easy computation directly into an existence guarantee about the much larger, harder-to-search space of all `2^n` actual subsets.

### SE Lens

For a list of even moderate size, checking all `2^n` subsets directly is completely infeasible (Lesson 50's exponential growth-rate table makes this concrete: `2^30` already exceeds a billion) — the probabilistic method proves a subset with the desired property exists in a few lines of algebra, entirely avoiding the search a constructive proof would otherwise require.

### Connection to the previous unit

The previous unit proved a simple, general lemma connecting expectation to existence; this unit applies it to a genuinely hard-to-search space, using linearity of expectation to make the needed average trivial to compute, producing a real result no exhaustive check was needed to establish.

---

## Connect the Pieces

The complete argument, computed and stated together:

```clojure
(println "Total sum:" (reduce + 0 (list 3 7 2 9 5)))
(println "Expected subset sum (half of total):" (expected-subset-sum (list 3 7 2 9 5)))
(println "Conclusion: some subset of (3 7 2 9 5) sums to at least 13 -- proven, not searched for.")
```

```
Total sum: 26
Expected subset sum (half of total): 13
Conclusion: some subset of (3 7 2 9 5) sums to at least 13 -- proven, not searched for.
```

This entire section's probability machinery — Lesson 71's distributions, Lesson 75's expectation and linearity, and this lesson's own existence lemma — converges on a single, genuine proof: an existence claim about an exponentially large space of possibilities, established with a few lines of arithmetic and one proof by contradiction, exactly the kind of result Lesson 17 first showed could be reached without ever constructing the object in question.

## What Breaks Without This

Suppose someone insisted every existence claim needed a constructive proof — an explicit example, or an algorithm that finds one. For this lesson's subset-sum claim, on a list of, say, `100` numbers, that would mean either checking (or searching through) up to `2^100` subsets — a number so large Lesson 50's own growth-rate table calls categorically unusable — or designing a genuinely clever search algorithm, when none is actually needed. Demanding construction where only existence was asked for can turn an easy, few-line proof into an intractable, or at least far harder, problem — precisely the unnecessary cost the probabilistic method exists to avoid.

## Exercises

1. **Trace.** By hand, compute `expected-subset-sum` for the list `(10 20 30 40)`, and state the existence conclusion it proves.
2. **Predict.** Before computing it, predict whether adding a `0` to a list changes `expected-subset-sum`'s value. Verify by computing both versions.
3. **Verify.** For the list `(3 7 2 9 5)`, find an actual subset (by hand, checking a few) that sums to at least `13`, confirming the lemma's guarantee is genuinely satisfiable — while noting this hand search is *not* the proof itself, only a sanity check of it.
4. **Break it, on purpose.** Attempt to conclude, using this lesson's lemma, that some subset sums to at least the *total* (not half) — using the same `E[S] = \text{total}/2` fact. Explain precisely why the lemma does not support this stronger claim.
5. **Generalize.** Adapt this lesson's argument to prove that some subset sums to *at most* half the total as well (using the previous unit's lemma applied to a lower bound instead of an upper one).
6. **Reconstruct.** Close this lesson. From memory, state the core lemma, prove it by contradiction, and re-derive the subset-sum existence proof using linearity of expectation.

## Definition of Done

- [ ] You can state and prove, by contradiction, the core "average implies existence" lemma.
- [ ] You can apply it, through linearity of expectation, to prove a genuine existence claim about subsets.
- [ ] You completed Exercise 3 and found a concrete subset satisfying the lesson's proven guarantee.
- [ ] You completed Exercise 5 and can state the matching "at most half" existence claim.
- [ ] Commit your Exercise 1 and Exercise 5 work to your notes repository, with a commit message stating what you proved — for example, `"Prove subset of (10 20 30 40) sums to at least 50; prove matching at-most-half existence claim via the same lemma"` — not just `"lesson 82 exercise"`.

---

**Next lesson:** Lesson 83 begins Section V, *Data Structures*, with *Why Data Structures Exist* — connecting how data is represented directly to what operations on it cost, the question every data structure in this new section exists to answer.
