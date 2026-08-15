# Lesson 46: Arithmetic Series

**What you will build**: By the end of this lesson you'll be able to derive Lesson 15's own sum-of-integers formula a second, genuinely different way — not by induction this time, but by a direct, visual pairing argument — and generalize it to any sequence that increases by a fixed amount each step, not just the integers `1` through `n`.

**What you need to know first**: Lesson 15's proven formula `n(n+1)/2` — this lesson derives the identical result by a different method, and then generalizes past it.

**Terms introduced in this lesson**:

- **arithmetic series** — a sum of numbers where each term differs from the previous one by a fixed amount, called the common difference. *Why it matters*: the general category Lesson 15's "sum of the first `n` integers" belongs to — a common-difference-of-`1` special case of a much broader, equally derivable family.

**Objects and methods used**: None new. This lesson combines `if`, `=`, `+`, `-`, and `/`, each already fully covered.

---

## Concept Unit: A Different Way to See the Same Formula — Pairing

### The Problem

Lesson 15 proved `1 + 2 + ... + n = n(n+1)/2` by induction — a complete, valid proof, but one that doesn't obviously *show* where the formula comes from, only that it holds. Is there a more direct way to see it — one that would let someone derive the formula from scratch, rather than verify one already given?

### Introduce the concept in isolation

Write the sum twice — once forwards, once backwards — and add the two copies together, term by term:

```
  S = 1 +   2 +   3 + ... + (n-1) + n
  S = n + (n-1) + (n-2) + ... +  2  + 1
-----------------------------------------
2S = (n+1) + (n+1) + (n+1) + ... + (n+1) + (n+1)
```

Every column adds to exactly `n + 1`: `1 + n = n+1`; `2 + (n-1) = n+1`; and so on — this holds for *every* one of the `n` columns, because as the top row counts up by `1` each step, the bottom row counts down by `1` each step, keeping every pair's total constant. That gives `2S = n × (n+1)` — `n` columns, each totaling `n+1` — so `S = n(n+1)/2`, the identical formula Lesson 15 proved by induction, now derived by directly seeing *why* it must be true.

### Discard the throwaway example

Not applicable — this is a formal derivation, not code.

### Generalizing

This pairing argument never actually used the fact that the sequence was specifically `1, 2, 3, ..., n` — only that consecutive terms differ by a fixed amount, and that pairing the first with the last, the second with the second-to-last, and so on, always gives the identical total. The next unit generalizes it directly.

### CS Lens

This technique is frequently told as a story about the young Carl Friedrich Gauss, said to have found this shortcut instantly as a schoolchild asked to sum `1` through `100` — whether or not the anecdote is literally accurate, the *method* it illustrates — pair opposite ends, notice every pair totals the same amount — is genuinely how this class of formula is most naturally discovered, not merely a colorful history lesson.

### SE Lens

Two independent derivations of the identical formula — induction (Lesson 15) and pairing (this unit) — is stronger evidence of correctness than either alone, the same "check a fast implementation against a slow, obviously-correct reference" habit Lesson 20's Connect the Pieces already established, here applied to two *proofs* instead of two implementations.

---

## Concept Unit: Generalizing to Any Arithmetic Series

### The Problem

Does the pairing trick only work for `1, 2, 3, ..., n`, or does it work for *any* sequence with a fixed common difference — say, `10, 15, 20, 25, ..., 45` (starting at `10`, increasing by `5` each step)?

### Introduce the concept in isolation

Repeat the identical pairing argument on a general **arithmetic series**: first term `a`, common difference `d`, `n` terms total, so the last term is `a + (n-1)d`.

```
  S = a           + (a+d)       + ... + (a+(n-1)d)
  S = a+(n-1)d     + (a+(n-2)d)  + ... + a
-----------------------------------------------------
2S = (2a+(n-1)d) + (2a+(n-1)d) + ... + (2a+(n-1)d)
```

Every column again totals the identical amount — `a + (a + (n-1)d) = 2a + (n-1)d`, which is exactly *first term + last term*. There are `n` columns, so `2S = n × (\text{first} + \text{last})`, giving:

> **S = n × (first + last) / 2**

Check it recovers Lesson 15's own case: for `1` through `n`, first `= 1`, last `= n`, giving `n(1+n)/2 = n(n+1)/2` — exactly Lesson 15's formula, confirmed as the special case where the common difference is `1` and the first term is `1`.

### Discard the throwaway example

Not applicable — this general formula is what the rest of this lesson verifies against real code.

### Formal Definition, Walked Through

> For an arithmetic series with `n` terms, first term `a`, and last term `ℓ`: **sum = n(a + ℓ) / 2**.

- *"n(a + ℓ)"* — `n` copies of the same paired total, exactly as the pairing argument produced, whether the series counts up by `1`s or by any other fixed amount.
- Notice the formula only needs the *first* and *last* term, plus the count — never the common difference directly, because the common difference's only role was guaranteeing every pair totals the same amount, which the pairing argument already used to derive the formula, not something the final formula itself needs to reference again.

### CS Lens

This formula is what turns Lesson 44's `Σ (i=1 to n) (a + (i-1)d)` — a summation that would otherwise need every term computed and added individually — into a single, closed-form calculation, the identical speedup Lesson 15's formula already provided for `sum-to`, now available for an entire family of sequences rather than one specific one.

### SE Lells

Recognizing "this loop increases by a fixed amount every iteration" as an arithmetic series is what makes this closed-form shortcut available at all — a loop summing a range with a constant step size (common in scheduling, billing periods, and evenly-spaced measurements) can skip the loop entirely once recognized this way, the same category of optimization Lesson 39's dynamic programming pursued for a different kind of recurrence.

### Connection to the previous unit

The previous unit derived the specific formula for `1` through `n`; this unit repeats the identical argument for an arbitrary starting point and step size, showing the pairing technique — not just its one specific result — is what actually generalizes.

---

## Connect the Pieces

The general formula, checked against direct summation, on this series' own savings-plan theme: deposits starting at `$10`, increasing by `$5` each week, for `8` weeks.

```clojure
(defn arithmetic-sum-direct [first-term difference count]
  (if (= count 0)
    0
    (+ first-term (arithmetic-sum-direct (+ first-term difference) difference (- count 1)))))

(defn arithmetic-sum-formula [first-term last-term n]
  (/ (* n (+ first-term last-term)) 2))

(println "Direct summation:" (arithmetic-sum-direct 10 5 8))
(println "Formula (first=10, last=45, n=8):" (arithmetic-sum-formula 10 45 8))
```

```
Direct summation: 220
Formula (first=10, last=45, n=8): 220
```

Both agree — the direct version adds all eight weekly deposits one at a time (`10, 15, 20, ..., 45`); the formula computes the identical total, `220`, from just three numbers (first term, last term, count), using the pairing-derived shortcut instead of eight separate additions.

## What Breaks Without This

Suppose the formula were applied with the wrong last term — say, `50` instead of the actual `45` (an easy mistake if the last term is computed separately and gets the count slightly wrong):

```
user=> (arithmetic-sum-formula 10 50 8)
240
```

`240`, not `220` — a specific, plausible-looking, wrong answer, silently different because the formula trusts its `first` and `last` inputs completely and has no way to verify they actually correspond to a real `8`-term sequence with a consistent common difference. This is the same "technically computed, silently wrong because an input was wrong" risk this series has flagged since Lesson 1 — the formula's own arithmetic is flawless; the error is entirely in what was handed to it, and nothing about the closed-form shortcut can catch a wrong last term the way tracing the direct, term-by-term version might make more obviously suspicious.

## Exercises

1. **Trace.** By hand, pair up the terms of `2 + 4 + 6 + 8 + 10` (five terms, common difference `2`) the way Concept Unit 1 paired `1` through `n`, and confirm the total matches `n(first+last)/2`.
2. **Predict.** Before computing it, predict the sum of every multiple of `3` from `3` to `30` using the formula (first `= 3`, last `= 30`, and you'll need to determine `n` first). Verify with `arithmetic-sum-direct`.
3. **Derive.** Using the general formula, compute the total of a savings plan starting at `$100`, increasing by `$25` each month, for `12` months. Verify against `arithmetic-sum-direct`.
4. **Break it, on purpose.** Reproduce "What Breaks Without This" yourself — call `arithmetic-sum-formula` with a `last` value that doesn't actually correspond to the stated `first`, `difference`, and `n`. Confirm the mismatch produces a silently wrong total.
5. **Generalize.** Derive a formula for the *last term* of an arithmetic series, given only the first term, the common difference, and the count `n` — the piece "What Breaks Without This" showed is easy to get wrong if computed carelessly.
6. **Reconstruct.** Close this lesson. From memory, re-derive the pairing argument for a general arithmetic series, without looking back at Concept Unit 2.

## Definition of Done

- [ ] You can derive the pairing argument from scratch, for both the `1`-to-`n` case and the general arithmetic series case.
- [ ] You can apply the general formula `n(first+last)/2` to a series with a common difference other than `1`.
- [ ] You completed Exercise 5, deriving the correct formula for an arithmetic series' last term.
- [ ] You can explain why the pairing argument's formula never needs the common difference directly, only the first term, last term, and count.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating the formula you derived for the last term — for example, `"Verify $100+12x$25/month savings plan totals $2650; derive last-term formula: a + (n-1)*d"` — not just `"lesson 46 exercise"`.

---

**Next lesson:** Lesson 47, *Geometric Series*, derives the analogous formula for a sequence that *multiplies* by a fixed ratio each step rather than adding a fixed amount — directly connecting to `fib`'s exponential growth and the doubling patterns this series has already measured by hand.
