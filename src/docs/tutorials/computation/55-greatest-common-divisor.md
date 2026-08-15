# Lesson 55: Greatest Common Divisor

**What you will build**: By the end of this lesson you'll have derived and implemented Euclid's algorithm — over two thousand years old, and still the standard way to compute a greatest common divisor — not as a memorized recipe, but from a real, provable identity connecting a pair of numbers' common divisors to a smaller pair's, using Lesson 54's modular arithmetic directly.

**What you need to know first**: Lesson 54's `mod`, and Lesson 13's factoring — this lesson's core proof uses factoring directly to establish the identity Euclid's algorithm depends on.

**Terms introduced in this lesson**:

- **greatest common divisor (GCD)** — the largest positive integer that divides two given numbers evenly, with no remainder. *Why it matters*: this lesson's actual subject — a precise, well-defined quantity this series will derive a real algorithm for, rather than just define.
- **Euclid's algorithm** — a method for computing the GCD of two numbers by repeatedly replacing the pair `(a, b)` with `(b, a mod b)` until reaching `(d, 0)`, at which point `d` is the answer. *Why it matters*: one of the oldest algorithms known to still be in standard, practical use — derived here from a real, provable identity, not presented as a memorized recipe.

**Objects and methods used**: None new. This lesson combines `mod` (Lesson 54), `if`, and `=`, all already covered.

---

## Concept Unit: The Key Identity — gcd(a, b) = gcd(b, a mod b)

### The Problem

Finding the greatest common divisor of `48` and `18` by checking every possible divisor directly (Lesson 8's exhaustive-checking spirit, applied to divisors instead of boolean rows) works, but scales poorly — is there a way to reduce the problem to a genuinely *smaller* pair of numbers, the way every other algorithm in this series has been derived from a smaller-instance relationship?

### Introduce the concept in isolation

**Claim:** `gcd(a, b) = gcd(b, a mod b)`, for `b > 0`.

**Proof:** Let `r = a mod b`, so `a = bq + r` for some whole number `q` (the quotient of `a` divided by `b`).

- **Any common divisor of `a` and `b` also divides `r`.** If `d` divides both `a` and `b`, then `d` divides `bq` (Lesson 13's factoring: `d` divides any multiple of something it already divides) — and since `r = a - bq`, `d` divides `r` too (`d` divides both terms of the subtraction, so it divides their difference).
- **Any common divisor of `b` and `r` also divides `a`.** If `d` divides both `b` and `r`, then `d` divides `bq` and divides `r`, so `d` divides `bq + r = a` (both terms of the sum).

Both directions together mean `(a, b)` and `(b, r)` have *exactly* the same set of common divisors — nothing divides one pair without dividing the other — so their greatest common divisors must be identical: `gcd(a, b) = gcd(b, r) = gcd(b, a \bmod b)`.

### Discard the throwaway example

Not applicable — this is a formal proof, the direct basis for the next unit's algorithm.

### Generalizing

This identity reduces the problem `gcd(a, b)` to the strictly smaller problem `gcd(b, a \bmod b)` — `a \bmod b` is always less than `b` (Lesson 54's own `mod` definition guarantees this) — the exact "smaller instance of the same problem" shape Lesson 19 required of every recursive definition this series has built.

### CS Lens

This proof technique — show two sets are identical by proving each is a subset of the other — is a standard mathematical move, here applied to sets of divisors specifically; the same "prove both directions" discipline Lesson 7's biconditional first required for logical claims, now applied to a claim about numbers.

### SE Lens

Deriving the identity from real algebraic reasoning, rather than accepting "this is how you compute GCD" as a given fact, is exactly this series' recurring insistence (since Lesson 20) that an algorithm should be *derivable*, not merely *known* — the entire reason this lesson proves the identity before writing any code at all.

---

## Concept Unit: Deriving Euclid's Algorithm

### The Problem

Translate the proven identity directly into a recursive function, the same "read the definition, write the function" process Section II established repeatedly.

### Introduce the concept in isolation

```clojure
(defn my-gcd [a b]
  (if (= b 0)
    a
    (my-gcd b (mod a b))))
```

```
user=> (my-gcd 48 18)
6
```

**Base case:** `gcd(a, 0) = a` — anything divides `0` (every number is a divisor of `0`, since `0` divided by anything is `0` with no remainder), so the greatest common divisor of `a` and `0` is simply `a` itself, the largest number available. **Recursive case:** exactly the identity just proved — replace `(a, b)` with `(b, a \bmod b)`, a strictly smaller second argument each time (Lesson 22's termination measure: `b` decreases, bounded below by `0`, caught exactly by the base case).

Trace `(my-gcd 48 18)`: `(48, 18) → (18, 12) → (12, 6) → (6, 0)` — the base case fires, returning `6`. Confirm by hand: `48`'s divisors include `1, 2, 3, 6, 8, ...`; `18`'s include `1, 2, 3, 6, 9, 18`; the greatest number in both lists is `6`, matching exactly.

### Discard the throwaway example

Not applicable — `my-gcd` is a real, reusable, and historically significant function.

### Project Change

- **Reference Source**: No reference counterpart — a direct structural translation of this lesson's own proven identity.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn my-gcd [a b]
  (if (= b 0)
    a
    (my-gcd b (mod a b))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (= b 0) a ...)`** — reappearing structural recursion shape; the base case's justification (anything divides `0`) is specific to GCD, but the shape — check for the smallest instance, return an answer directly — is the same pattern this series has used since `sum-to`.
- **`(my-gcd b (mod a b))`** — the recursive call, with the arguments swapped and reduced exactly as the proven identity specifies: the old second argument becomes the new first; the old first argument's remainder mod the old second becomes the new second.

### CS Lens

**Euclid's algorithm**, described this way, appears in Euclid's *Elements*, written roughly 2,300 years ago — one of the oldest algorithms with a continuous, documented history, and still, today, essentially the fastest known general method for computing a GCD, not merely a historical curiosity. Also recognized in: reducing a fraction to lowest terms (dividing both numerator and denominator by their GCD, exactly what `my-gcd` computes), and Lesson 56's modular inverses, which extend this identical algorithm one step further.

### SE Lens

`my-gcd`'s termination is guaranteed by the exact same measure-based reasoning Lesson 22 formalized generally — `b` strictly decreases (since `a \bmod b < b` always, a direct consequence of `mod`'s own definition), bounded below by `0`, caught precisely by the base case — no new termination argument was needed, only the recognition that this lesson's proven identity already fits Section II's established framework.

### Connection to the previous unit

The previous unit proved the identity `gcd(a,b) = gcd(b, a \bmod b)` in the abstract; this unit is its direct, working translation into code, following the identical derivation method every recursive function in this series has used.

---

## Connect the Pieces

`my-gcd`, verified against a case where the answer is `1` (no common factors beyond `1` itself — the numbers are **coprime**, a term Lesson 56 uses directly):

```clojure
(println "gcd(48, 18):" (my-gcd 48 18))
(println "gcd(17, 5):" (my-gcd 17 5))
(println "gcd(100, 75):" (my-gcd 100 75))
```

```
gcd(48, 18): 6
gcd(17, 5): 1
gcd(100, 75): 25
```

`gcd(17, 5) = 1` — `17` is prime (Lesson 57 covers this directly) and shares no factors with `5` beyond `1` — while `gcd(100, 75) = 25` reduces `100/75` to its lowest terms, `4/3`, exactly the fraction-simplification application mentioned in this lesson's CS Lens.

## What Breaks Without This

Suppose `my-gcd` were called with its arguments in the "wrong" order relative to what a caller assumed — say, expecting `gcd(a, b)` to require `a > b`, and calling `(my-gcd 18 48)` (the smaller number first) without checking whether the algorithm actually needs that ordering:

```
user=> (my-gcd 18 48)
6
```

It still works, correctly — the *first* recursive call, `(my-gcd 48 (mod 18 48))`, computes `(mod 18 48) = 18` (since `18 < 48`, its remainder when divided by `48` is just `18` itself), effectively swapping the pair back into the "expected" order on the very first step. This isn't a coincidence to rely on without checking, though — verifying an algorithm handles an edge case correctly (here, "does argument order actually matter") by tracing it directly, rather than simply assuming based on how the algorithm is usually presented, is exactly the habit Lesson 18's closing method insisted on: check, don't assume.

## Exercises

1. **Trace.** By hand, trace `(my-gcd 60 24)`, showing each `(a, b)` pair until the base case.
2. **Predict.** Before running it, predict `(my-gcd 7 7)` (two equal numbers) using the algorithm's own logic, not just intuition about what the "obvious" answer should be.
3. **Verify.** Confirm `my-gcd`'s answer for `(my-gcd 100 75)` by listing several divisors of each number by hand and finding their greatest common one directly.
4. **Break it, on purpose.** Predict, then verify, what `(my-gcd 0 0)` returns, using the function's actual base case condition. Does this match what "greatest common divisor of nothing and nothing" should intuitively mean, or does it expose a genuine edge case worth thinking about?
5. **Generalize.** Write a function `simplify-fraction` that takes a numerator and denominator and returns both divided by their GCD, using `my-gcd` directly. Verify it reduces `100/75` to `4/3`.
6. **Reconstruct.** Close this lesson. From memory, re-derive the proof that `gcd(a,b) = gcd(b, a mod b)`, using the two-direction "common divisors are identical" argument.

## Definition of Done

- [ ] You can derive and re-prove the GCD identity from scratch, without looking back at this lesson.
- [ ] You can write `my-gcd` from the identity, correctly stating its base case's justification.
- [ ] You completed Exercise 5 (`simplify-fraction`) and verified it against a fraction of your own choosing.
- [ ] You investigated Exercise 4's edge case (`gcd(0, 0)`) and can state, honestly, whether the function's actual behavior matches a sensible mathematical answer.
- [ ] Commit `simplify-fraction` to your notes repository, with a commit message stating the fraction you tested and its simplified result — for example, `"Add simplify-fraction, verified 100/75 -> 4/3 via gcd=25"` — not just `"lesson 55 exercise"`.

---

**Next lesson:** Lesson 56, *Extended Euclidean Algorithm*, extends this lesson's algorithm one step further — tracking not just the GCD itself, but the exact coefficients that combine `a` and `b` to produce it, unlocking modular inverses directly.
