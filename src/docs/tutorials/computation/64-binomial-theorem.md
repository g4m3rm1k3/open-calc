# Lesson 64: Binomial Theorem

**What you will build**: By the end of this lesson you'll understand exactly why expanding `(x+y)ⁿ` by hand produces coefficients that match Pascal's Triangle row for row — not a coincidence, but a direct consequence of what a binomial coefficient actually counts — and you'll compute an entire expansion's coefficients directly, verified against real polynomial arithmetic.

**What you need to know first**: Lesson 62's `combination-count`, Lesson 63's Pascal's Triangle, and Lesson 42's polynomials.

**Terms introduced in this lesson**:

- **binomial theorem** — the formula `(x+y)ⁿ = Σ (k=0 to n) C(n,k) x^(n-k) y^k`, expressing a power of a two-term sum directly in terms of binomial coefficients. *Why it matters*: connects combinations, Pascal's Triangle, and polynomial expansion into a single identity — three previously separate lessons, unified.

**Objects and methods used**: None new. This lesson combines `combination-count` (Lesson 62), `power` (Lesson 42), `cons`, and `list`, each already covered.

---

## Concept Unit: Expanding (x+y)ⁿ by Hand — Where Do the Coefficients Come From?

### The Problem

Expanding `(x+y)² = x² + 2xy + y²` and `(x+y)³ = x³ + 3x²y + 3xy² + y³` by hand, the coefficients — `1, 2, 1` and `1, 3, 3, 1` — are exactly Pascal's Triangle's rows `2` and `3` (Lesson 63). Is this a coincidence, or does it reveal something real about what a binomial coefficient counts?

### Introduce the concept in isolation

`(x+y)³` means `(x+y) × (x+y) × (x+y)` — three separate factors. Expanding it fully means choosing, from *each* of the three factors independently, either its `x` or its `y`, and multiplying the three choices together — the fundamental counting principle (Lesson 59) applied directly. A term like `x²y` arises from choosing `x` from two of the three factors and `y` from the remaining one — and the *number of ways* to choose which one factor contributes the `y` (out of three factors) is exactly `C(3,1) = 3`, matching the coefficient of `x²y` in the expansion precisely.

### Discard the throwaway example

Not applicable — this argument is the direct justification for the formula stated next.

### Generalizing

The identical reasoning applies to every term of `(x+y)ⁿ`'s expansion: the coefficient of `x^(n-k) y^k` is exactly the number of ways to choose which `k` of the `n` factors contribute a `y` (the rest contributing `x`) — precisely `C(n,k)`, the binomial coefficient this series has now derived three separate ways (Lesson 62's division, Lesson 63's recursive identity, and this unit's direct counting argument).

### CS Lens

This is exactly why the formula is called the **binomial theorem** — "binomial" naming the two-term sum being raised to a power, and the theorem stating precisely which coefficients appear, derived here from the same counting-principle reasoning Lesson 59 established for entirely different-looking problems.

### SE Lens

Recognizing `(x+y)ⁿ`'s coefficients as binomial coefficients, rather than a pattern to memorize separately, means Pascal's Triangle (Lesson 63) and `combination-count` (Lesson 62) are both immediately available tools for polynomial expansion — no new machinery needed, only the recognition that this is the same underlying idea in a new setting.

---

## Concept Unit: Computing an Entire Expansion's Coefficients

### The Problem

Derive a function that returns every coefficient of `(x+y)ⁿ`'s expansion, in order, directly from `combination-count`.

### Introduce the concept in isolation

```clojure
(defn binomial-coefficients-from [n k]
  (if (> k n)
    (list)
    (cons (combination-count n k) (binomial-coefficients-from n (+ k 1)))))

(defn binomial-coefficients [n]
  (binomial-coefficients-from n 0))
```

```
user=> (binomial-coefficients 3)
(1 3 3 1)
user=> (binomial-coefficients 4)
(1 4 6 4 1)
```

Both match Pascal's Triangle's rows `3` and `4` exactly (Lesson 63's own Connect the Pieces already computed row `4` this identical way, using `pascal` instead of `combination-count` — a third independent confirmation).

### Discard the throwaway example

Not applicable — `binomial-coefficients` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct application of `combination-count` across the full range this lesson's own theorem specifies.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `combination-count`, from Lesson 62.

### The New Code — type it yourself

```clojure
(defn binomial-coefficients-from [n k]
  (if (> k n)
    (list)
    (cons (combination-count n k) (binomial-coefficients-from n (+ k 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(cons (combination-count n k) ...)`** — reappearing `combination-count` (Lesson 62), computing one coefficient at a time, in increasing order of `k`.
- **`(if (> k n) (list) ...)`** — the base case: once `k` exceeds `n`, every term of the expansion (`k = 0` through `k = n`, exactly `n+1` terms) has already been produced.

### CS Lens

This function is a direct, structural translation of Lesson 44's sigma notation applied to a list-building recursion instead of a numeric sum — `Σ (k=0 to n) C(n,k)` (a number) and `binomial-coefficients` (a list of those same values) are the identical index range and the identical per-term expression, differing only in whether the terms are summed or collected.

### SE Lens

Verifying a symbolic-algebra claim (the binomial theorem) numerically, by actually computing coefficients and checking a specific expansion, is the same discipline Lesson 41's `eval-expr` established: an algebraic identity is trustworthy once it's been checked against real, concrete computation, not merely asserted from a textbook formula.

### Connection to the previous unit

The previous unit argued, by direct counting, why the binomial coefficients are the correct expansion coefficients; this unit computes an entire row of them directly, ready to check against a real polynomial expansion in the closing section.

---

## Connect the Pieces

The full binomial theorem, checked numerically — `(2+3)³` computed both directly and via the expanded formula:

```clojure
(println "Direct: (2+3)^3 =" (power (+ 2 3) 3))
(println "Coefficients for n=3:" (binomial-coefficients 3))
(println "Expanded: 1*2^3*3^0 + 3*2^2*3^1 + 3*2^1*3^2 + 1*2^0*3^3 ="
         (+ (* 1 (power 2 3) (power 3 0))
            (* 3 (power 2 2) (power 3 1))
            (* 3 (power 2 1) (power 3 2))
            (* 1 (power 2 0) (power 3 3))))
```

```
Direct: (2+3)^3 = 125
Coefficients for n=3: (1 3 3 1)
Expanded: 1*2^3*3^0 + 3*2^2*3^1 + 3*2^1*3^2 + 1*2^0*3^3 = 125
```

Both routes to `(2+3)³` agree — `125`, computed either as a single power operation or as the full binomial expansion, term by term, using exactly the coefficients `binomial-coefficients` produced — direct, numeric confirmation that the theorem isn't just a symbolic curiosity, it computes the identical real number.

## What Breaks Without This

Suppose someone expanded `(x+y)³` using the *wrong* row of Pascal's Triangle — say, row `2`'s coefficients (`1, 2, 1`) instead of row `3`'s (`1, 3, 3, 1`), an easy off-by-one mistake given how similar the two rows look:

```
"Expansion" using row 2's coefficients: 1*x^3 + 2*x^2*y + 1*x*y^2   (missing a term entirely, and wrong coefficients)
```

This isn't just numerically wrong — it's *structurally* wrong, missing an entire term (`y³`) because row `2` only has three entries where row `3` needs four (`n+1` terms for `(x+y)ⁿ`, per Concept Unit 2's own base case). Checking a claimed expansion's *term count* first (`n+1` terms, always) is a cheap, immediate sanity check that would have caught this mistake before ever comparing individual coefficients.

## Exercises

1. **Trace.** By hand, expand `(x+y)⁴` using `binomial-coefficients(4)` directly, writing out all five terms with their exponents.
2. **Predict.** Before computing it, predict how many terms `(x+y)⁶`'s expansion has, using this lesson's `n+1` rule. Verify with `binomial-coefficients`.
3. **Verify.** Check `(1+1)⁴` two ways: directly as `power(2,4)`, and as the sum of `binomial-coefficients(4)` itself (since `x=y=1` makes every `x^(n-k)y^k` term equal to `1`). Do they match?
4. **Break it, on purpose.** Reproduce the row-2-instead-of-row-3 mistake from "What Breaks Without This" yourself, and state exactly which term is missing and why.
5. **Generalize.** Using `binomial-coefficients`, write a function that fully evaluates `(x+y)ⁿ` numerically for specific `x`, `y`, and `n`, the way Connect the Pieces did for `(2,3,3)`, generalized to work for any `n`.
6. **Reconstruct.** Close this lesson. From memory, explain why the coefficient of `x^(n-k)y^k` in `(x+y)ⁿ`'s expansion is `C(n,k)`, using the "choosing which factors contribute y" argument directly.

## Definition of Done

- [ ] You can expand `(x+y)ⁿ` for a small `n` using `binomial-coefficients`, and explain why each coefficient is what it is.
- [ ] You completed Exercise 3 and confirmed the sum of a row of binomial coefficients equals `2ⁿ`.
- [ ] You completed Exercise 5, writing a general numeric evaluator for the binomial expansion.
- [ ] You can explain, from memory, the counting argument behind the binomial theorem, not just recite the formula.
- [ ] Commit your Exercise 5 evaluator to your notes repository, with a commit message stating a verified case — for example, `"Add binomial-expand, verified (3+4)^2=49 matches direct power computation"` — not just `"lesson 64 exercise"`.

---

**Next lesson:** Lesson 65, *Inclusion-Exclusion*, derives the precise correction Lesson 60 already flagged as needed — accounting for overlap between cases the addition rule alone can't handle safely.
