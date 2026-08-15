# Lesson 57: Prime Numbers

**What you will build**: By the end of this lesson you'll be able to test whether a number is prime, checking dramatically fewer candidate divisors than the obvious approach requires — using a real, provable reason why checking up to a number's square root is always enough — and derive a complete prime factorization directly from that same test.

**What you need to know first**: Lesson 54's `mod`, Lesson 43's exponents, and Lesson 51's Big-O reasoning about why checking fewer candidates matters.

**Terms introduced in this lesson**:

- **prime number** — a whole number greater than `1` with no positive divisors other than `1` and itself. *Why it matters*: this lesson's actual subject, and the building block Lesson 56's modular inverses turn out to depend on directly.
- **prime factorization** — expressing a number as a product of prime numbers. *Why it matters*: every whole number greater than `1` has exactly one such factorization (a fact called the Fundamental Theorem of Arithmetic) — this lesson derives a function that finds it directly.

**Objects and methods used**: None new. This lesson combines `if`, `=`, `>`, `mod`, `quot`, `cons`, and `list`, each already fully covered.

---

## Concept Unit: Testing Primality — Why the Square Root Is Enough

### The Problem

Testing whether `n` is prime by checking every possible divisor from `2` up to `n - 1` works, but for a large `n`, that's a lot of checking — Lesson 51's own Big-O vocabulary would call this `O(n)` candidate divisors. Is there a real, provable reason a much smaller search suffices?

### Introduce the concept in isolation

**Claim:** if `n = a × b` with `a ≤ b`, then `a ≤ \sqrt{n}`.

**Proof:** Suppose, for contradiction (Lesson 17), that `a > \sqrt{n}`. Since `a ≤ b`, this would mean `b ≥ a > \sqrt{n}` too — so `a × b > \sqrt{n} × \sqrt{n} = n`. But `a × b = n` by assumption — contradiction (`n > n` is impossible). So `a ≤ \sqrt{n}` after all.

The consequence: *any* number `n` with a nontrivial factorization has a divisor no larger than `\sqrt{n}` — checking every candidate divisor from `2` up to `\sqrt{n}` is enough to find one if it exists, without ever needing to check anything beyond that point.

```clojure
(defn has-divisor-up-to [n d]
  (if (> (* d d) n)
    false
    (if (= (mod n d) 0)
      true
      (has-divisor-up-to n (+ d 1)))))

(defn is-prime? [n]
  (if (< n 2)
    false
    (not (has-divisor-up-to n 2))))
```

```
user=> (is-prime? 17)
true
user=> (is-prime? 15)
false
```

Note `(* d d)` compared against `n`, rather than computing an actual square root — `d × d > n` is exactly equivalent to `d > \sqrt{n}`, avoiding needing a square-root function at all, using only multiplication and comparison, both already fully established.

### Discard the throwaway example

Not applicable — `is-prime?` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of this unit's own proven bound.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn is-prime? [n]
  (if (< n 2)
    false
    (not (has-divisor-up-to n 2))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(> (* d d) n)`** — the stopping condition, checking `d² > n` (equivalent to `d > \sqrt{n}`) directly via multiplication rather than a separate square-root operation — the base case for `has-divisor-up-to`'s own recursion.
- **`(if (< n 2) false ...)`** — handles the definition's own boundary explicitly: `0`, `1`, and negative numbers are not prime by definition, checked directly rather than accidentally falling through `has-divisor-up-to`'s logic for an input it was never designed to handle.

### CS Lens

Checking only up to `\sqrt{n}` instead of `n` is a real, substantial efficiency gain — `O(\sqrt{n})` candidate divisors instead of `O(n)` — a direct application of Lesson 51's Big-O vocabulary to a genuinely different problem than any this series has analyzed so far.

### SE Lells

The proof, not just the resulting code, is what makes this optimization trustworthy — a primality test that merely "seemed to work" on a few test cases wouldn't carry the same guarantee that no divisor could possibly exist beyond `\sqrt{n}`, the same "prove it, don't just observe it" discipline this series has insisted on since Lesson 20.

---

## Concept Unit: Prime Factorization

### The Problem

Beyond testing whether `n` is prime, derive its complete **prime factorization** — every prime number that multiplies together to produce it, extending the same divisor-search idea.

### Introduce the concept in isolation

```clojure
(defn prime-factors-from [n d]
  (if (= n 1)
    (list)
    (if (> (* d d) n)
      (list n)
      (if (= (mod n d) 0)
        (cons d (prime-factors-from (quot n d) d))
        (prime-factors-from n (+ d 1))))))

(defn prime-factors [n]
  (prime-factors-from n 2))
```

```
user=> (prime-factors 60)
(2 2 3 5)
```

Check: `2 × 2 × 3 × 5 = 60`, exactly. Four cases, matching this lesson's own definitions: if `n` has been fully divided down to `1`, there's nothing left to factor (base case, empty list). If the current candidate `d` has passed `\sqrt{n}`, whatever's left of `n` is itself prime (Concept Unit 1's own bound, applied here in reverse: if no divisor was found up to `\sqrt{n}`, the remaining `n` has no divisor at all besides itself, so it must be prime) — added directly. If `d` divides `n` evenly, `d` is a genuine prime factor — `cons` it onto the list, and continue searching the *same* `d` against the *reduced* `n` (a number can have the same prime factor more than once, like `60`'s two `2`s). Otherwise, move to the next candidate divisor.

### Discard the throwaway example

Not applicable — `prime-factors` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct extension of the previous unit's divisor-search technique.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn prime-factors-from [n d]
  (if (= n 1)
    (list)
    (if (> (* d d) n)
      (list n)
      (if (= (mod n d) 0)
        (cons d (prime-factors-from (quot n d) d))
        (prime-factors-from n (+ d 1))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(cons d (prime-factors-from (quot n d) d))`** — first appearance, in this function, of *not* advancing `d` after a successful division — this is deliberate: a factor like `2` might divide `n` more than once (`60 = 2 × 2 × 15`), so the search stays at the same candidate until it no longer divides evenly.
- **`(prime-factors-from n (+ d 1))`** — reappearing "advance the search" shape (Lesson 21's structural recursion, applied to a search index rather than a list); only used when the current `d` doesn't divide `n`.

### CS Lens

`prime-factors` demonstrates the Fundamental Theorem of Arithmetic directly, by construction — every number this function is given produces exactly one factorization (up to the order the factors are listed in), because the search always tries the smallest remaining candidate first, giving a canonical, reproducible ordering.

### SE Lells

Reusing `is-prime?`'s own `\sqrt{n}` bound inside `prime-factors-from` (the `(> (* d d) n)` check) means this function inherits the previous unit's efficiency gain automatically, rather than needing a separate optimization argument — recognizing a already-proven bound applies again in a new context, rather than re-deriving it from scratch.

### Connection to the previous unit

The previous unit tested whether a single divisor exists; this unit repeats the identical search, but *keeps* every divisor found and continues searching the reduced number, building a complete factorization instead of a single yes/no answer.

---

## Connect the Pieces

Both functions, checked against each other — a number's factorization should contain more than one prime exactly when the number itself isn't prime:

```clojure
(println "is-prime? 17:" (is-prime? 17))
(println "prime-factors 17:" (prime-factors 17))
(println "is-prime? 60:" (is-prime? 60))
(println "prime-factors 60:" (prime-factors 60))
```

```
is-prime? 17: true
prime-factors 17: (17)
is-prime? 60: false
prime-factors 60: (2 2 3 5)
```

`17`, being prime, factors as itself alone — a one-element list, directly confirming `is-prime? 17`'s `true`. `60`, not prime, factors into four smaller primes — directly confirming `is-prime? 60`'s `false`. Both functions, built independently from the same `\sqrt{n}` bound, agree with each other on every case checked.

## What Breaks Without This

Suppose `is-prime?` were written checking only up to `n / 2` instead of `\sqrt{n}` — a common, plausible-sounding but unproven guess ("no factor can be more than half of `n`," which is true, but far weaker than the `\sqrt{n}` bound actually proven in this lesson):

```clojure
(defn has-divisor-up-to-half [n d]
  (if (> d (quot n 2))
    false
    (if (= (mod n d) 0)
      true
      (has-divisor-up-to-half n (+ d 1)))))
```

This still produces a *correct* answer — but it does dramatically more work than necessary: for `n = 10{,}000{,}000{,}001` (roughly ten billion), checking up to `n/2` means roughly five billion candidate divisors; checking up to `\sqrt{n}` (roughly `100{,}000`) means about a hundred thousand — a difference of nearly five orders of magnitude, for the identical correct answer. This is the real cost of using a weaker, unproven bound instead of deriving the tightest one actually available: not incorrectness, but a genuine, measurable, avoidable performance gap.

## Exercises

1. **Trace.** By hand, trace `(prime-factors 84)`, showing each candidate divisor checked and each factor found.
2. **Predict.** Before checking, predict whether `97` is prime, using Concept Unit 1's `\sqrt{n}` bound to estimate how many candidates would need checking (`\sqrt{97} \approx 9.8`). Verify with `is-prime?`.
3. **Verify.** Confirm `prime-factors`' output for `100` multiplies back to `100` exactly.
4. **Break it, on purpose.** Confirm, by tracing or running it, that `has-divisor-up-to-half` (from "What Breaks Without This") still gives the correct answer for `is-prime? 97`, despite checking far more candidates than necessary.
5. **Generalize.** Write a function `count-distinct-prime-factors` that returns how many *distinct* primes divide a number (not counting repeats — `60`'s answer would be `3`: `2`, `3`, `5`, not `4`).
6. **Reconstruct.** Close this lesson. From memory, re-derive the proof that checking divisors only up to `\sqrt{n}` is sufficient, and explain why `prime-factors-from` doesn't advance `d` immediately after finding a successful divisor.

## Definition of Done

- [ ] You can test primality using the `\sqrt{n}` bound and explain, from memory, why that bound is provably sufficient.
- [ ] You can compute a complete prime factorization and verify it multiplies back to the original number.
- [ ] You completed Exercise 5 (`count-distinct-prime-factors`) and verified it against a number with repeated prime factors.
- [ ] You can quantify, concretely, the efficiency gap between checking up to `\sqrt{n}` and checking up to `n/2`, for a specific large `n`.
- [ ] Commit `count-distinct-prime-factors` to your notes repository, with a commit message stating a verified example — for example, `"Add count-distinct-prime-factors, verified 60 -> 3 distinct (2,3,5) vs 4 total factors including repeats"` — not just `"lesson 57 exercise"`.

---

**Next lesson:** Lesson 58, *Algebraic Reasoning in Code*, closes Section III by turning every identity, factoring trick, and derivation this section has proven — from Horner's method to the GCD identity — into a single, reusable discipline for spotting and applying algebraic simplification directly in real code.
