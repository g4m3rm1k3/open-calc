# Lesson 81: Monte Carlo and Las Vegas Algorithms

**What you will build**: By the end of this lesson you'll be able to name the exact correctness/performance split Lesson 78's `randomized-search` first demonstrated, and build a genuinely different kind of randomized algorithm — one with fixed, bounded running time but only *probable* correctness — deriving its precise error probability from Lesson 73's independence and Lesson 42's `power`.

**What you need to know first**: Lesson 78's `randomized-search`, Lesson 73's independence, and Lesson 42's `power`.

**Terms introduced in this lesson**:

- **Las Vegas algorithm** — a randomized algorithm that is always correct; only its running time is random. *Why it matters*: this is precisely what Lesson 78's `randomized-search` already was, without a name — naming it now makes the pattern recognizable wherever it reappears.
- **Monte Carlo algorithm** — a randomized algorithm with fixed, bounded running time, whose *correctness* is only probable, not certain. *Why it matters*: a genuinely different tradeoff than Las Vegas — trading a guarantee of correctness for a guarantee of speed.

**Objects and methods used**:

- **`rand-int`**
  - *What it is:* a function in Clojure's core library that returns a random non-negative integer strictly less than its argument.
  - *Implementation:* `(rand-int n)` — returns a random integer in the range `0` to `n-1`, inclusive, different (in general) on each call, exactly the same kind of non-determinism `shuffle` (Lesson 78) introduced.
  - *Its use:* Concept Unit 2, to pick a random position to sample.

---

## Concept Unit: Naming the Pattern — Las Vegas Algorithms

### The Problem

Lesson 78's `randomized-search` always eventually finds its target, if the target is present — correctness never in question — but the number of comparisons it takes varies between runs. Is there a name for this specific tradeoff?

### Introduce the concept in isolation

Yes: a **Las Vegas algorithm**. `randomized-search` is one directly — correctness (Lesson 78's own SE Lens already flagged this exact split) is completely unaffected by the random shuffle; only performance varies. Naming it now makes the pattern recognizable the next time it appears, rather than re-deriving the same observation from scratch.

### Discard the throwaway example

Not applicable — this unit names an already-built, already-verified pattern rather than introducing new code.

### CS Lens

Las Vegas algorithms are common wherever a randomized approach reliably makes *progress* without ever risking a wrong final answer — randomized quicksort's pivot choice (Section VI, later) is Las Vegas in exactly this sense: always eventually correctly sorted, with a running time that depends on the random pivot choices made along the way.

### SE Lens

Knowing a system relies on a Las Vegas algorithm is directly useful information: correctness never needs to be re-verified per run, but *performance* does — the kind of monitoring worth building around such a system is different from one built on the genuinely different guarantee this lesson introduces next.

---

## Concept Unit: A Different Guarantee — Monte Carlo Algorithms

### The Problem

Is a *fixed*, bounded running time — rather than a fixed, guaranteed correctness — ever the more useful tradeoff? Build an algorithm that checks whether a list is sorted using only a small, fixed number of random checks, regardless of how long the list actually is.

### Introduce the concept in isolation

Checking every adjacent pair (Lesson 24's list-traversal style) always gives a correct answer, but takes time proportional to the list's length. Instead, sample a small, *fixed* number of random adjacent pairs:

```clojure
(defn value-at [lst i]
  (if (= i 0)
    (first lst)
    (value-at (rest lst) (- i 1))))

(defn check-pair-at [lst i]
  (<= (value-at lst i) (value-at lst (+ i 1))))

(defn one-random-check [lst list-length]
  (check-pair-at lst (rand-int (- list-length 1))))

(defn probably-sorted? [lst list-length checks-remaining]
  (if (= checks-remaining 0)
    true
    (if (one-random-check lst list-length)
      (probably-sorted? lst list-length (- checks-remaining 1))
      false)))
```

```
user=> (probably-sorted? (list 1 2 3 4 5 6) 6 3)
true
```

`probably-sorted?` always runs exactly `checks-remaining` checks — completely independent of the list's actual length — a genuinely fixed, bounded running time. But it can be *wrong*: if the list has exactly one out-of-order pair among many correctly-ordered ones, a small number of random checks might simply never land on the bad pair, wrongly reporting `true`.

### Discard the throwaway example

Not applicable — `probably-sorted?` is a real, if deliberately simple, Monte Carlo algorithm.

### Project Change

- **Reference Source**: `value-at` reuses Lesson 24's list-traversal-by-counting-down shape directly; no other reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn one-random-check [lst list-length]
  (check-pair-at lst (rand-int (- list-length 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`value-at`** — reappearing recursive, counting-down list traversal (Lesson 24's shape): counts an index down to `0`, returning `first` at that point — a list-position lookup built from scratch, without vector indexing.
- **`rand-int`** — first appearance (covered fully in Objects and methods used, above): the source of this algorithm's non-determinism, producing a valid random index into the list's adjacent-pair positions.
- **`check-pair-at`** — compares the values at two adjacent positions directly, returning whether that one specific pair happens to be in order.
- **`probably-sorted?`** — reappearing counting-down recursion (Lesson 34's accumulator shape), stopping either at `0` remaining checks (success) or the first failed check (immediate `false`) — the *number of checks* is the only thing controlling how long this runs, never the list's length.

### Deriving the Error Probability

Suppose a list of length `6` (so `5` adjacent pairs) has exactly one out-of-order pair. Each single random check has probability `1/5` of landing on it, so probability `4/5` of missing it. By Lesson 73's independence (each call to `rand-int` is a fresh, independent trial), the probability of missing the bad pair on *every one* of `3` checks is:

```
(4/5)^3 = 64/125 = 0.512
```

Over `20,000` simulated trials of `(probably-sorted? unsorted-list 6 3)` on such a list, `probably-sorted?` wrongly returned `true` `51.75\%` of the time — matching the predicted `51.2\%` closely, the small gap fully explained by ordinary sampling variation over a finite number of trials.

### Discard the throwaway example

Not applicable — this derivation is a real, general fact about `probably-sorted?`'s behavior, verified empirically above.

### CS Lens

This exact tradeoff — fixed running time, quantifiable error probability, and *more checks lowers the error exponentially* (Lesson 42's `power`, with a base under `1`, shrinking rapidly as `checks-remaining` grows) — is the defining shape of real Monte Carlo algorithms, from primality testing to statistical sampling: an error probability that can be driven arbitrarily low by paying for more checks, without ever needing to check everything.

### SE Lens

A `51\%` error rate at only `3` checks is a genuinely weak guarantee — a real engineering decision about how many checks to run requires weighing the cost of more checks (still bounded, but larger) against how low an error probability is actually acceptable for the situation; unlike a Las Vegas algorithm, "run it and trust the result" is not automatically safe here without first doing exactly this kind of probability accounting.

### Connection to the previous unit

The previous unit named a pattern this series had already built, without introducing new risk; this unit builds a genuinely different kind of algorithm — one that trades away Las Vegas's correctness guarantee for a fixed running time, with that tradeoff's real cost derived precisely rather than left vague.

---

## Connect the Pieces

Both families, side by side, on the identical style of input:

```clojure
(println "Las Vegas (Lesson 78): randomized-search always finds the target, if present.")
(println "Monte Carlo, sorted list, 3 checks:" (probably-sorted? (list 1 2 3 4 5 6) 6 3))
(println "Monte Carlo, one-bad-pair list, 3 checks (may wrongly say true):" (probably-sorted? (list 1 2 3 5 4 6) 6 3))
(println "Predicted error probability, 3 checks:" (/ 64 125))
```

```
Las Vegas (Lesson 78): randomized-search always finds the target, if present.
Monte Carlo, sorted list, 3 checks: true
Monte Carlo, one-bad-pair list, 3 checks (may wrongly say true): true
Predicted error probability, 3 checks: 64/125
```

(The second `probably-sorted?` call's actual result will vary between runs — `true` roughly `51\%` of the time, `false` the rest, on this specific one-bad-pair list, exactly the derived error probability.) The sorted list always, correctly, returns `true` — `probably-sorted?` never produces a *false negative* on an actually-sorted list, only a possible false positive on an unsorted one, a real asymmetry worth noticing in its own right.

## What Breaks Without This

Suppose `probably-sorted?` were used to guard something important — say, skipping a full, expensive sort only when the list is already believed sorted — without ever deriving or checking its actual error rate. At `3` checks, over half of all genuinely-unsorted lists (of this lesson's specific shape) would slip through undetected, silently skipping a needed sort. This isn't a bug in the code — `probably-sorted?` does exactly what a Monte Carlo algorithm promises — it's a mismatch between what the algorithm actually guarantees and what a careless caller assumed it guarantees, exactly the gap this lesson's error-probability derivation exists to close before deploying such an algorithm anywhere the mistake would matter.

## Exercises

1. **Trace.** By hand, using this lesson's formula, compute the error probability for `5` checks instead of `3`, on the identical one-bad-pair, length-`6` list.
2. **Predict.** Before computing it, predict whether increasing the list length (keeping exactly one bad pair, and keeping `checks-remaining` fixed at `3`) makes the error probability larger or smaller. Justify using the derivation's own structure.
3. **Verify.** Run `(probably-sorted? (list 1 2 3 5 4 6) 6 3)` several times yourself, and confirm the results are a mix of `true` and `false`, roughly matching this lesson's `51\%`/`49\%` split.
4. **Break it, on purpose.** Modify `probably-sorted?` so it checks the *same* random pair `checks-remaining` times instead of a fresh random pair each time (call `rand-int` once, reuse the result). Explain, using Lesson 73's independence, why this change makes the error probability far worse than this lesson's derivation predicts.
5. **Generalize.** Derive a formula for the minimum number of checks needed to bring the error probability below `1\%`, for this lesson's length-`6`, one-bad-pair example.
6. **Reconstruct.** Close this lesson. From memory, state the difference between a Las Vegas and a Monte Carlo algorithm, and re-derive `probably-sorted?`'s error probability for `3` checks.

## Definition of Done

- [ ] You can state the difference between a Las Vegas and a Monte Carlo algorithm precisely.
- [ ] You can build a Monte Carlo algorithm with fixed running time and derive its error probability.
- [ ] You completed Exercise 3 and observed real runs matching the predicted error rate.
- [ ] You completed Exercise 5 and can state how many checks are needed to reach a specific error target.
- [ ] Commit your Exercise 1 and Exercise 5 work to your notes repository, with a commit message stating what you found — for example, `"Compute 5-check error probability (0.328); derive checks needed for <1% error on 6-element one-bad-pair list"` — not just `"lesson 81 exercise"`.

---

**Next lesson:** Lesson 82, *Probabilistic Problem Solving*, closes this section by using probability itself as a proof technique — showing an object with a desired property must exist, without ever constructing it directly, using every tool this section has built.
