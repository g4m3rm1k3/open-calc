# Lesson 58: Algebraic Reasoning in Code

**What you will build**: By the end of this lesson you'll have a single, named, five-step discipline combining every algebraic technique Section III built — recognizing structure, finding an identity, proving it, applying it, and verifying — and you'll have watched it applied, completely, to derive an efficient least-common-multiple function from a real, proven identity connecting it to `my-gcd`, closing the loop between Lessons 55 through 57.

**What you need to know first**: Everything from Lessons 41 through 57 — this lesson assembles what's already there, the same closing shape Lessons 18 and 40 gave their own sections.

**Terms introduced in this lesson**:

- **least common multiple (LCM)** — the smallest positive number that both of two given numbers divide evenly. *Why it matters*: the second half of this lesson's capstone identity, connecting directly back to `my-gcd` (Lesson 55).
- **algebraic reasoning in code** — a repeatable discipline: recognize an expression's algebraic structure, search for a known identity or simplification, prove the simplification is actually valid, apply it, and verify the result against the original. *Why it matters*: names the process every optimization in Section III actually followed — Horner's method, the GCD identity, the amortized binary-counter bound — turning "notice a pattern" into a deliberate, repeatable method.

**Objects and methods used**: None new. This lesson applies `my-gcd` (Lesson 55), `*`, and `quot`, each already covered.

---

## Concept Unit: The Discipline, Named

### The Problem

Section III solved several genuinely different problems — evaluating polynomials faster (Lesson 42), analyzing a binary counter's real cost (Lesson 53), computing a GCD without checking every divisor (Lesson 55) — using what, on reflection, was the same underlying process each time. Is that process nameable, and reusable on a problem this section hasn't already solved?

### Introduce the concept in isolation

State the five steps, naming which earlier lesson supplied each:

1. **Recognize the expression's algebraic structure.** What operation is actually being performed, and does it match a shape this series already has a name for — a polynomial, a series, a recurrence, a divisor search?
2. **Search for a known identity or simplification.** Factoring (Lesson 13), an exponent law (Lesson 43), a series formula (Lessons 46–47), or a proven bound (Lesson 51) that applies to this specific structure.
3. **Prove the simplification is actually valid.** Not "this looks similar" — a real derivation, the way Lesson 13's factoring, Lesson 42's Horner's method, and Lesson 55's GCD identity were each proven before being trusted.
4. **Apply it.** Rewrite the computation using the proven simplification.
5. **Verify the result against the original**, on concrete cases — the same "check the fast version against a slow, obviously-correct reference" habit Lesson 20 established from the very start of this series.

### Discard the throwaway example

Not applicable — the next unit applies this exact sequence, in order, to a new problem.

### CS Lens

This is Section III's own version of Lesson 18's computational proof mindset and Lesson 40's recursive problem-solving method — the same underlying discipline (specify, recognize structure, prove, apply, verify), specialized here for algebraic simplification specifically.

### SE Lens

Step 3 is where this discipline earns its keep over ordinary pattern-matching: recognizing that two expressions "look similar" (step 1 and 2, easy) is not the same as proving they're actually, provably equal (step 3, the part that's easy to skip and dangerous to skip) — Lesson 42's `eval-poly-horner` and Lesson 55's `my-gcd` were both trustworthy specifically because step 3 was done in full, not assumed.

---

## Concept Unit: Applying the Discipline — Deriving an Efficient LCM

### The Problem

Compute the **least common multiple** of `12` and `18` — the smallest number both evenly divide. A direct approach searches multiples one at a time; is there a faster way, connecting to machinery this section has already built?

### Introduce the concept in isolation

**Step 1 — Recognize the structure.** LCM and GCD are both about shared divisibility structure between two numbers — Lesson 57's prime factorization makes this precise: if `a` and `b` are written as products of primes (`a = \prod p_i^{e_i}`, `b = \prod p_i^{f_i}`, using the same set of primes, with exponent `0` for any prime absent from one of them), then `gcd(a,b) = \prod p_i^{\min(e_i,f_i)}` and `lcm(a,b) = \prod p_i^{\max(e_i,f_i)}`.

**Step 2 — Search for an identity.** For any two numbers `e` and `f`, `\min(e,f) + \max(e,f) = e + f` (one of them is the smaller, one the larger, and their sum doesn't depend on which is which). Applied to every prime's exponent simultaneously:

```
gcd(a,b) × lcm(a,b) = ∏ p_i^(min(e_i,f_i)) × ∏ p_i^(max(e_i,f_i))
                     = ∏ p_i^(min(e_i,f_i) + max(e_i,f_i))     [combining exponents of the same prime]
                     = ∏ p_i^(e_i + f_i)                        [the identity just noted]
                     = (∏ p_i^e_i) × (∏ p_i^f_i)                [separating the product]
                     = a × b
```

**Step 3 — Verify concretely.** `12 = 2² × 3`, `18 = 2 × 3²`. `gcd(12,18) = 2^{\min(2,1)} × 3^{\min(1,2)} = 2¹ × 3¹ = 6`. `lcm(12,18) = 2^{\max(2,1)} × 3^{\max(1,2)} = 2² × 3² = 36`. Check: `6 × 36 = 216`, and `12 × 18 = 216` — matching exactly, confirming **gcd(a,b) × lcm(a,b) = a × b**.

**Step 4 — Apply it.**

```clojure
(defn lcm-efficient [a b]
  (quot (* a b) (my-gcd a b)))
```

```
user=> (lcm-efficient 12 18)
36
```

**Step 5 — Verify against a slow, obviously-correct reference:**

```clojure
(defn lcm-naive [a b]
  (lcm-naive-search a b 1))

(defn lcm-naive-search [a b m]
  (if (and (= (mod m a) 0) (= (mod m b) 0))
    m
    (lcm-naive-search a b (+ m 1))))
```

```
user=> (lcm-naive 12 18)
36
```

Both agree. `lcm-naive` checks every candidate multiple, one at a time, starting from `1`, until it finds one divisible by both `12` and `18` — thirty-six separate checks for this example. `lcm-efficient` computes the identical answer using one multiplication, one division, and a call to `my-gcd` (itself only a handful of steps, per Lesson 55) — a direct, real efficiency gain, earned by proving and applying a genuine identity rather than searching.

### Discard the throwaway example

Not applicable — both `lcm-efficient` and `lcm-naive` are real, verified functions.

### Project Change

- **Reference Source**: `my-gcd`, from Lesson 55, is used directly as the reference this unit's derivation builds on.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn lcm-efficient [a b]
  (quot (* a b) (my-gcd a b)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(my-gcd a b)`** — reappearing GCD function (Lesson 55), computing the divisor this unit's proven identity needs.
- **`(quot (* a b) (my-gcd a b))`** — reappearing multiplication and integer division (Lessons 2, 43), applying the identity `lcm(a,b) = ab / \gcd(a,b)` directly, rearranged from `gcd(a,b) × lcm(a,b) = a × b` exactly the way Lesson 13's rearrangement technique would isolate any other variable in a proven equation.

### CS Lens

This derivation used four separate Section III techniques together: Lesson 57's prime factorization (to see *why* the identity holds), Lesson 13's rearrangement (to isolate `lcm` in the proven equation), Lesson 55's `my-gcd` (as a trusted building block), and this lesson's own five-step discipline (to organize the whole process) — direct, concrete proof that Section III's lessons compose, rather than standing as isolated topics.

### SE Lens

`lcm-efficient`'s cost is dominated entirely by `my-gcd`'s own cost — and Lesson 55 already established that Euclid's algorithm runs in very few steps even for large numbers, meaning `lcm-efficient` inherits that same efficiency, essentially for free, simply by being built on top of an already-analyzed, trusted piece rather than a fresh search.

### Connection to the previous unit

The previous unit named the five-step discipline abstractly; this unit ran every step against a real problem, producing a genuinely faster, fully proven function — the complete, demonstrated payoff of the method, not just its description.

---

## Connect the Pieces

The full chain, connecting three lessons' worth of number theory into one working result:

```clojure
(println "gcd(12,18):" (my-gcd 12 18))
(println "lcm-efficient(12,18):" (lcm-efficient 12 18))
(println "Identity check, gcd*lcm = a*b:" (= (* (my-gcd 12 18) (lcm-efficient 12 18)) (* 12 18)))
```

```
gcd(12,18): 6
lcm-efficient(12,18): 36
Identity check, gcd*lcm = a*b: true
```

Every value traces back to a specific, earlier-proven fact: `my-gcd` (Lesson 55), the identity connecting GCD and LCM (this lesson, derived from Lesson 57's prime factorization), and the final check confirming the whole chain is self-consistent, not merely plausible.

## What Breaks Without This

Suppose the identity had been mis-stated as `gcd(a,b) + lcm(a,b) = a + b` (addition instead of multiplication) — a plausible-looking, but unproven and actually false, guess:

```
user=> (+ (my-gcd 12 18) (lcm-efficient 12 18))
42
user=> (+ 12 18)
30
```

`42 ≠ 30` — the addition version is simply false, caught immediately by checking it against concrete numbers (step 5 of this lesson's own discipline). This is exactly why step 3 — proving the identity, not merely guessing it looks plausible — and step 5 — verifying against real numbers — both matter: a guessed identity that happens to be wrong is caught immediately by either step, before it could ever be trusted inside a real, unverified function.

## Exercises

1. **Trace.** By hand, factor `20` and `30` into primes, and use this lesson's `min`/`max` exponent argument to compute `gcd(20,30)` and `lcm(20,30)` directly from the factorizations.
2. **Predict.** Before running it, predict `lcm-efficient 7 11` (two primes, sharing no factors) using the identity directly. Verify.
3. **Verify.** Confirm `lcm-naive` and `lcm-efficient` agree on your Exercise 1 numbers, `20` and `30`.
4. **Break it, on purpose.** Reproduce "What Breaks Without This" yourself, confirming the addition version of the identity fails on a pair of your own choosing.
5. **Generalize.** Apply this lesson's five-step discipline to a genuinely new problem: derive an efficient way to check whether a number is a **perfect square** (some integer squared equals it exactly), without searching every candidate square root one at a time from `1` upward — state each of the five steps explicitly.
6. **Reconstruct.** Close this lesson — and Section III. From memory, list the five steps of algebraic reasoning in code, and re-derive the `gcd × lcm = a × b` identity from the prime-factorization argument.

## Definition of Done

- [ ] You can state all five steps of the algebraic reasoning discipline from memory.
- [ ] You can derive and prove the `gcd × lcm = a × b` identity using the prime-factorization argument, not just recall it.
- [ ] You completed Exercise 5, applying all five steps to a genuinely new problem (perfect-square checking).
- [ ] You can explain why step 3 (proving) and step 5 (verifying) both matter, using this lesson's own "What Breaks Without This" example.
- [ ] Commit `lcm-efficient`, `lcm-naive`, and your Exercise 5 perfect-square checker to your notes repository, with a commit message stating what identity or bound each one relies on — for example, `"Add lcm-efficient (gcd*lcm=a*b identity); add efficient perfect-square check using sqrt-style bound like is-prime?'s divisor search"` — not just `"lesson 58 exercise, section III complete"`.

---

**Next lesson:** Lesson 59, *Counting Without Listing*, opens Section IV — Combinatorics and Discrete Mathematics — where the counting instincts this series has already used informally (`power-set`'s `2ⁿ` subsets, `permutation-count`'s ordered selections) get their own formal foundation, starting from the single fundamental counting principle everything else in the section builds on.
