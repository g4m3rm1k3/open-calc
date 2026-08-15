# Lesson 43: Exponents and Logarithms

**What you will build**: By the end of this lesson you'll be able to prove the basic exponent laws by induction, define a logarithm precisely as an inverse function, and — the actual payoff — explain exactly why "logarithmic" is the word this series will eventually use for the growth rate Lesson 1's binary search and Lesson 32's `bst-contains?` both already demonstrated informally.

**What you need to know first**: Lesson 42's `power` function, Lesson 15's induction, and Lesson 12's inverse functions.

**Terms introduced in this lesson**:

- **exponent** (or **power**) — `x^n` means `x` multiplied by itself `n` times. *Why it matters*: the base operation this entire lesson's laws and logarithms are built from — everything here follows from taking this definition literally and reasoning about what repeated multiplication actually does.
- **logarithm** — `logb(x)` is the exponent you'd need to raise `b` to, in order to get `x`; the inverse of exponentiation. *Why it matters*: directly realizes Lesson 12's inverse-function vocabulary for a specific, extremely common operation, and gives a precise name to the growth rate Lesson 1's binary search and Lesson 32's `bst-contains?` already demonstrated without naming it.

**Objects and methods used**:

- **`quot`**
  - *What it is:* a function in Clojure's core library that performs integer division, discarding any remainder.
  - *Implementation:* `(quot a b)` — established behavior: `(quot 7 2)` → `3`; `(quot 16 2)` → `8`.
  - *Its use:* Concept Unit 3, to repeatedly halve a number using whole numbers only.

---

## Concept Unit: Deriving the Product Law

### The Problem

Is `x^a × x^b` always equal to `x^(a+b)` — a rule likely already familiar from school algebra — actually *true*, provably, rather than just a memorized shortcut?

### Introduce the concept in isolation

Take the definition literally: `x^a` is `x` multiplied by itself `a` times; `x^b` is `x` multiplied by itself `b` times. Multiplying `x^a` by `x^b` concatenates those two runs of multiplication into one longer run — `a` copies of `x`, followed by `b` more copies of `x`, is exactly `a + b` copies of `x` multiplied together, which is precisely what `x^(a+b)` means.

State this as a real induction proof (Lesson 15), fixing `a` and inducting on `b`:

- **Base case, `b = 0`:** `x^a × x^0 = x^a × 1 = x^a`, and `x^(a+0) = x^a` — they match.
- **Inductive step:** assume `x^a × x^b = x^(a+b)` for some `b`. Show it holds for `b + 1`. Using `power`'s own recursive definition (Lesson 42), `x^(b+1) = x^b × x`. So:

```
x^a × x^(b+1)
= x^a × (x^b × x)             [x^(b+1)'s own definition]
= (x^a × x^b) × x             [regrouping — multiplication is associative]
= x^(a+b) × x                 [the inductive hypothesis, substituted]
= x^((a+b)+1)                 [x^(a+b)'s own definition, applied once more]
= x^(a+b+1)
```

Exactly matching `x^(a + (b+1))`. By induction, `x^a × x^b = x^(a+b)` for every natural number `b`.

### Discard the throwaway example

Not applicable — this is a formal proof, not code to run.

### CS Lens

This is the identical proof shape Lesson 15 used for the sum formula — a base case checked directly, an inductive step built from substitution — applied here to an algebraic identity instead of a summation. Regrouping (`x^a × (x^b × x) = (x^a × x^b) × x`) is Lesson 13's associativity, used silently in ordinary arithmetic since Lesson 2, now doing real proof work.

### SE Lens

Knowing the product law is *provably* true, not just conventionally assumed, is what licenses using it to simplify code freely — replacing `(* (power x a) (power x b))` with `(power x (+ a b))` anywhere it appears is a genuine, correctness-preserving optimization (fewer multiplications, per Lesson 42's own counting habit), backed by the same proof, not merely a stylistic rewrite.

---

## Concept Unit: Logarithms as Inverse Exponentiation

### The Problem

Given `2^y = 8`, what is `y`? This is exactly Lesson 13's "solve an equation" problem, applied to an exponent instead of a multiplied or added variable — and Lesson 13's own rearrangement techniques (subtract, divide) don't directly apply to isolating an exponent.

### Introduce the concept in isolation

Define a **logarithm** precisely: `logb(x)` is the value `y` such that `b^y = x`. For `2^y = 8`: since `2^3 = 8`, `log2(8) = 3`. This is Lesson 12's inverse-function vocabulary, applied directly: exponentiation (fixing the base `b`) is a function from `y` to `b^y`; a logarithm (base `b`) is precisely *that function's inverse* — given the output (`8`), it recovers the input (`3`) that produced it, the same "undo the transformation" role Lesson 13's Concept Unit 4 gave algebraic rearrangement, now applied to an operation rearrangement alone can't reach.

Whether this inverse function actually exists and gives a *unique* answer depends on exactly Lesson 12's injectivity question: for a fixed positive base `b ≠ 1`, `b^y` is injective (Lesson 12: different exponents always give different results) — which is exactly what guarantees `logb(x)` has one well-defined answer, not several competing candidates, whenever it's defined at all.

### Discard the throwaway example

Not applicable — this is a formal definition, connecting directly to already-established vocabulary rather than introducing new code.

### Formal Definition, Walked Through

> `logb(x) = y` if and only if `b^y = x`, for a fixed base `b > 0`, `b ≠ 1`.

- *"if and only if"* — Lesson 7's biconditional, precisely: knowing `y` lets you compute `x` (`b^y`), and knowing `x` lets you recover `y` (`logb(x)`) — the two directions are genuinely equivalent statements about the same relationship, not merely both true.
- *"b ≠ 1"* — `1^y` always equals `1`, regardless of `y` — exactly the non-injective failure Lesson 12 warned about (many different exponents produce the identical result), which is precisely why base-1 logarithms don't make sense: there'd be no unique `y` to recover.

### CS Lens

Also recognized in: the "how many digits does this number have in binary" question (closely related to `log2`), a sound level measured in decibels (a logarithmic scale, because human hearing responds to *ratios* of loudness rather than absolute differences), and the Richter scale for earthquake magnitude — several real, physical quantities are measured logarithmically for the identical underlying reason this series cares about it computationally, covered next.

### SE Lens

Because exponentiation is injective for a fixed valid base, "undo an exponentiation" is always well-defined — a genuinely different situation from Lesson 12's `square`, which wasn't injective over all integers and couldn't be reliably inverted at all. Knowing *which* transformations in a system are actually invertible, before attempting to invert one, is exactly the discipline Lesson 13's Concept Unit 4 already insisted on.

### Connection to the previous unit

The previous unit proved a law about exponentiation itself; this unit defines the operation that undoes it — the same relationship Lesson 13 established between a transformation and its algebraic reversal, now applied to exponents specifically.

---

## Concept Unit: Why Logarithms Show Up in Algorithm Analysis — Repeated Halving

### The Problem

Lesson 1's very first worked example argued that binary search works by "repeated halving," and Lesson 32's `bst-contains?` discarded roughly half the remaining tree at every comparison — but neither lesson ever said *how many* halvings that process actually needs. Is there a precise answer, and does it connect to this lesson's logarithms?

### Introduce the concept in isolation

```clojure
(defn count-halvings [n]
  (if (<= n 1)
    0
    (+ 1 (count-halvings (quot n 2)))))
```

```
user=> (count-halvings 16)
4
user=> (count-halvings 10)
3
```

`count-halvings 16` returns `4` — and `2^4 = 16` exactly: `log2(16) = 4`, matching precisely. `count-halvings 10` returns `3` — `10` isn't an exact power of `2`, but `2^3 = 8 ≤ 10 < 16 = 2^4`, and `3` is exactly how many times `10` can be halved (using whole-number division) before reaching `1`: `10 → 5 → 2 → 1`. This is `floor(log2(10))` — the logarithm, rounded down, for inputs that aren't exact powers of the base.

This is precisely why Lesson 1's binary search and Lesson 32's `bst-contains?` are described as taking "about `log2(n)` steps": each comparison halves the remaining possibilities, exactly the process `count-halvings` traces directly, and the number of halvings needed to get from `n` possibilities down to `1` is, by definition, `log2(n)`.

### Discard the throwaway example

Not applicable — `count-halvings` is a real function, directly connecting this lesson's logarithms to already-established algorithmic behavior.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn count-halvings [n]
  (if (<= n 1)
    0
    (+ 1 (count-halvings (quot n 2)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`quot`** — first appearance as a called function (covered fully in Objects and methods used, above): integer division, discarding any remainder — exactly what's needed to halve a count of discrete possibilities (you can't search "half a node").
- **`(if (<= n 1) 0 (+ 1 (count-halvings (quot n 2))))`** — reappearing structural recursion (Lesson 21), on a *new* kind of "smaller instance": not `n - 1` (the natural numbers' own successor structure), but `n` halved — exactly Lesson 21's own "non-structural recursion" category, with its own, different base case (`<= 1`, not `= 0`), for exactly the reason that lesson identified: the step size changed, so the boundary condition had to change with it.

### CS Lens

`count-halvings` is a direct, hand-traceable measurement of what Section IV's *Big-O* (Lesson 51) will name formally: an algorithm whose work halves the remaining problem at every step takes a number of steps proportional to `log2(n)` — a far smaller number than `n` itself for any reasonably large `n` (`count-halvings` of a million returns roughly `20`, not a million), which is precisely why binary search on a sorted million-element list needs only about twenty comparisons, not a million.

### SE Lens

This lesson's logarithm isn't an abstract mathematical curiosity introduced for its own sake — it's the precise, provable reason a specific category of algorithm (repeated halving: binary search, balanced-tree search, and, Section VI will show, several sorting algorithms) scales dramatically better than one that has to look at every possibility. Naming the growth rate "logarithmic" is what lets this series compare it precisely against `reverse-naive`'s quadratic cost (Lesson 28) or `fib`'s exponential cost (Lesson 23), rather than describing all three only as "slow" or "fast" informally.

### Connection to the previous unit

The previous unit defined a logarithm as the abstract inverse of exponentiation; this unit shows that exact same quantity is what a hand-traceable, already-familiar process (`count-halvings`, and by extension, binary search) was computing all along, without either earlier lesson needing to name it.

---

## Connect the Pieces

The full chain, from the abstract definition to the already-familiar algorithm:

```clojure
(println "2^4 =" (power 2 4))
(println "log2(16), via halving:" (count-halvings 16))
(println "Both describe the same relationship:" (= (power 2 (count-halvings 16)) 16))
```

```
2^4 = 16
log2(16), via halving: 4
Both describe the same relationship: true
```

`power` (Lesson 42) computes `2^4 = 16` directly; `count-halvings` computes `log2(16) = 4` by tracing the actual halving process; the final check confirms they're genuine inverses of each other for this exact value — `power`'s own output, fed back through the halving process, recovers exactly the exponent that produced it, the same inverse relationship Concept Unit 2 defined abstractly, now verified concretely on the exact numbers this lesson has used throughout.

## What Breaks Without This

Suppose someone claimed `bst-contains?` (Lesson 32) takes "about `n/2` steps on average" instead of "about `log2(n)` steps" — a plausible-sounding but fundamentally different growth rate. For a tree of a thousand values, `n/2` predicts roughly `500` comparisons; `log2(1000) ≈ 10` predicts roughly `10`. These aren't close — one predicts fifty times more work than the other — and the difference isn't a rounding error, it's a confusion between two genuinely different growth *shapes*: `n/2` still grows proportionally to the tree's size (twice as many values, twice as many comparisons); `log2(n)` barely grows at all as `n` gets large (a million-value tree needs only about twice as many comparisons as a thousand-value one, not a thousand times as many). Confusing "halved" with "linear, just smaller" is exactly the kind of imprecise growth-rate reasoning Section IV's formal treatment exists to make impossible — this lesson's `count-halvings`, traced by hand, is the concrete evidence that settles which of the two claims is actually true.

## Exercises

1. **Trace.** By hand, trace `(count-halvings 32)`, confirming it matches `log2(32) = 5`.
2. **Predict.** Before running it, predict `(count-halvings 100)` — not a power of `2` — using `2^6 = 64` and `2^7 = 128` as reference points. Verify by running it.
3. **Prove.** State and prove the **quotient law**, `x^a / x^b = x^(a-b)` (for `a ≥ b`), using the same style of induction proof Concept Unit 1 used for the product law.
4. **Break it, on purpose.** Predict what `(count-halvings 0)` returns, using the function's actual base case condition (`<= n 1`) rather than assuming. Verify.
5. **Generalize.** Write `count-thirds`, counting how many times `n` can be divided by `3` (using `quot`) before reaching `1` or less. Confirm `(count-thirds 27)` matches `log3(27) = 3`.
6. **Reconstruct.** Close this lesson. From memory, explain why `count-halvings` and `log2` compute the same thing, and explain why `power` and `count-halvings` are inverses of each other, using Lesson 12's vocabulary.

## Definition of Done

- [ ] You can prove the product law by induction, from memory, using `power`'s own recursive definition.
- [ ] You can state a logarithm's precise definition as an inverse function, and explain why the base can't be `1`.
- [ ] You completed Exercise 3 (the quotient law) with a complete induction proof, not just a statement.
- [ ] You can explain, concretely, why confusing "halves each step" with "proportional to n" is a real, consequential mistake, not a minor imprecision.
- [ ] Commit your Exercise 3 proof and Exercise 5 (`count-thirds`) to your notes repository, with a commit message stating what base your halving-style function used and what it verified — for example, `"Prove quotient law by induction; add count-thirds, verified log3(27)=3 matches count-thirds(27)"` — not just `"lesson 43 exercise"`.

---

**Next lesson:** Lesson 44, *Summation Notation*, gives this series' repeated hand-counting — the sum-of-integers formula, the multiplication counts in Lessons 42 and 43 — a compact, formal notation, and shows how to translate a loop directly into it and back.
