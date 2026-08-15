# Lesson 63: Sequences and Sums

**What you will build:** `sigma`, a real, general procedure translating mathematical summation notation directly into code — taking a function, a starting index, and an ending index, and adding up the function's value at every index in between. Real, verified evidence this session: `sigma`'s sum of the identity function from `1` to `n` matches `sum` (Lesson 44) exactly at every value from `1` through `10`; `sigma`'s sum of squares from `1` to `10` gives exactly `385`, matching the closed-form formula `n(n + 1)(2n + 1) / 6` exactly. The transferable point: this curriculum has been writing sums as recursive code since Lesson 27's own `sum`. This lesson names the mathematical notation that code has been silently implementing all along, and builds one general tool capable of expressing any of it.

**What you need to know first:** Lesson 7 (`FP-L007-functions-as-transformations.md`) — specifically functions understood by input/output behavior, reused directly to define *sequence*. Lesson 18 (`FP-L018-functions-revisited.md`) — specifically domain and range, reused to describe a sequence's index set. Lesson 44 (`FP-L044-mathematical-induction.md`) — specifically `sum`, checked directly against this lesson's `sigma`.

**Terms introduced in this lesson**

- **Sequence** — a function whose domain is a set of indices (typically the natural numbers, or a finite range of them) and whose values are the sequence's terms. The sequence `1, 4, 9, 16, 25, …` is the function `f(i) = i²`, evaluated at `i = 1, 2, 3, 4, 5, …` — a sequence is nothing more than a function viewed this particular way, exactly Lesson 7's function definition applied to indices.
- **Summation notation (sigma notation)** — the notation `∑ᵢ₌ₐᵇ f(i)`, read "the sum of `f(i)` for `i` from `a` to `b`," meaning `f(a) + f(a + 1) + f(a + 2) + ⋯ + f(b)`. `sigma`, built in this lesson, is a direct, general, working translation of this notation into real code.

## Objects and methods used

- **`expt`**
  - *What it is:* a real Scheme procedure computing one number raised to the power of another.
  - *Implementation:* takes a base and an exponent, returning the base raised to that power; confirmed this session as `(expt 2 i)`, computing `2ⁱ`.
  - *Its use:* Concept Unit 4's real check of `sigma` applied to a sum of powers of two.

---

## Concept Unit 1: What a Sequence Actually Is

### The Problem

This curriculum has already built several procedures whose entire purpose is producing a series of related numbers, one per index — `fib` (Lesson 29), `factorial` (Lesson 28), `pascal-triangle`'s rows (Lesson 60). It's worth stating directly what these all have in common, using vocabulary already established rather than new machinery.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below, using functions already fully built.

### Applying It — Naming the Common Shape

**Restating Lesson 7's function definition:** a function is something understood entirely by its input/output behavior — given an input, it produces a specific output.

**Applying this directly to `fib` (Lesson 29):** `fib` takes an index — `0`, `1`, `2`, `3`, … — and produces a value — `0`, `1`, `1`, `2`, `3`, `5`, … . `fib` *is* a function whose domain (Lesson 18) is the natural numbers.

**Naming this:** a function understood specifically as producing a series of values, one per index, is a **sequence**. `fib` is a sequence. So is `factorial`. So is "the `n`th row of Pascal's Triangle" (Lesson 60), though its values are themselves lists rather than numbers. Nothing new has been built to say this — it's a new name for something this curriculum has been constructing since Lesson 28.

### Walkthrough

- **The restatement of Lesson 7's function definition** — establishes the vocabulary this unit's definition is built from, without introducing anything new.
- **`fib` reexamined as a sequence** — the first explicit naming of an already-familiar procedure using this lesson's new term.
- **"Nothing new has been built to say this"** — an explicit acknowledgment that this unit introduces a name, not a mechanism, following the identical pattern Lesson 60 used for Pascal's rule.

### CS Lens

This is the recognition that "sequence" and "function with a natural-number domain" are the same mathematical object, viewed through a naming convention chosen for convenience, not a genuinely different structure — exactly the kind of naming-versus-substance distinction this curriculum has drawn since its earliest Era I lessons on functions and relations. Also recognized in: a company's "quarterly revenue" being nothing more than a function from quarter-number to dollar amount, called a "sequence" purely by financial convention; a physics simulation's "frame `n`'s position," being nothing more than a function from frame-number to position, called a "trajectory" purely by convention within that field.

### SE Lens

The alternative to naming this explicitly is to keep treating every index-to-value procedure as its own unrelated thing, missing the chance to build one general tool — Concept Unit 2's `sigma` — capable of working with *any* of them. The real cost of that alternative would be writing a separate summing procedure for every new sequence encountered, the way `sum` (Lesson 44) was written specifically for the identity sequence and nothing else. Naming the shared shape explicitly, as this unit does, costs nothing beyond the recognition itself; it is what makes one general summing tool possible, rather than many narrow ones.

---

## Concept Unit 2: Summation Notation, Translated Directly Into Code

### The Problem

Mathematics has a standard, compact notation for "add up a sequence's values over a range of indices" — sigma notation. It's worth introducing that notation directly, and building the one general procedure it names, rather than continuing to write a new summing procedure by hand for every new sequence.

### The New Code — Type It Yourself

```scheme
(define (sigma f lo hi)
  (if (> lo hi)
      0
      (+ (f lo) (sigma f (+ lo 1) hi))))
```

### The Updated Project

This is `sigma.scm`, in full:

```scheme
(define (sigma f lo hi)
  (if (> lo hi)
      0
      (+ (f lo) (sigma f (+ lo 1) hi))))

(display (sigma (lambda (i) i) 1 10))
(newline)
```

### Reference Source

Sigma notation, `∑ᵢ₌ₐᵇ f(i)`, translated directly: `f` is the sequence being summed, `lo` is `a`, `hi` is `b`; the base case, `lo > hi`, is an empty range, summing to `0`; the recursive case adds `f(lo)`'s value to the sum of the remaining range — exactly the notation's own meaning, `f(a) + f(a+1) + ⋯ + f(b)`, built up one term at a time.

### Files affected

Created: `sigma.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile sigma.scm
55
```

Verified this session — `(sigma (lambda (i) i) 1 10)` computes `1 + 2 + 3 + ⋯ + 10 = 55`, matching the well-known value directly.

### Mechanical Walkthrough

- **`(define (sigma f lo hi) ...)`** — `sigma` takes a sequence `f` (any procedure from index to value), a lower bound, and an upper bound — a direct, general translation of `∑ᵢ₌ₗₒʰⁱ f(i)`'s own three parts.
- **`(if (> lo hi) 0 ...)`** — the base case: if the range is empty (the lower bound has passed the upper bound), the sum is `0`, exactly sigma notation's own convention for an empty sum.
- **`(+ (f lo) (sigma f (+ lo 1) hi))`** — the recursive case: `f`'s value at the current lower bound, plus the sum of the rest of the range — `f(lo) + ∑ᵢ₌ₗₒ₊₁ʰⁱ f(i)`, unfolding sigma notation's own recursive structure one term at a time.
- **`(lambda (i) i)`** — the identity sequence, `f(i) = i`, passed as `sigma`'s first argument — the specific sequence being summed in this run, kept separate from `sigma`'s own general summing logic.

### CS Lens

This is the higher-order function pattern (first built explicitly in Lesson 34's `map`) applied to summation itself: `sigma` doesn't know or care which sequence it's summing — that knowledge lives entirely in whatever function is passed to it — exactly the same separation of "what to do with each value" from "how to process the whole collection" that `map` and `filter` (Lessons 34–35) already established for other operations. Also recognized in: a spreadsheet's `SUM` function working identically whether the cells contain sales figures, temperatures, or test scores — the summing logic never changes, only the data does; an accounting ledger's running-total column, mechanically identical regardless of which specific transactions it's totaling.

### SE Lens

The alternative to building one general `sigma` is to keep writing a dedicated summing procedure for each new sequence, the way `sum` (Lesson 44) was written specifically for `f(i) = i`. The real cost of that alternative, made concrete in Concept Unit 4, is duplicated recursive-summing logic repeated for every new sequence needing a total — logic that's identical in every case except for which function gets applied to each index. Building `sigma` once, as this unit does, costs one small, general procedure; it replaces an unbounded number of narrow, near-duplicate ones.

---

## Concept Unit 3: Checking sigma Against Already-Built Code

### The Problem

`sigma`, applied to the identity sequence, should compute exactly what `sum` (Lesson 44) already computes. This is worth checking directly, entry by entry, not just trusting the two procedures "look similar."

### No isolated lab for this step

This concept has no code of its own to isolate — the real comparison is demonstrated directly below, using `sum` unchanged from Lesson 44.

### Applying It — A Direct, Ten-Way Comparison

```scheme
(do ((n 1 (+ n 1))) ((> n 10))
  (display "n=") (display n)
  (display " sigma(id,1,n)=") (display (sigma (lambda (i) i) 1 n))
  (display " sum(n)=") (display (sum n))
  (newline))
```

```
$ guile sigma.scm
n=1 sigma(id,1,n)=1 sum(n)=1
n=2 sigma(id,1,n)=3 sum(n)=3
n=3 sigma(id,1,n)=6 sum(n)=6
n=4 sigma(id,1,n)=10 sum(n)=10
n=5 sigma(id,1,n)=15 sum(n)=15
n=6 sigma(id,1,n)=21 sum(n)=21
n=7 sigma(id,1,n)=28 sum(n)=28
n=8 sigma(id,1,n)=36 sum(n)=36
n=9 sigma(id,1,n)=45 sum(n)=45
n=10 sigma(id,1,n)=55 sum(n)=55
```

Verified this session — `sigma` applied to the identity function, summed from `1` to `n`, matches `sum(n)` exactly, at every one of ten tested values.

### Walkthrough

- **The real, ten-way exact match** — direct, verified confirmation that `sigma`, a genuinely general tool, correctly reproduces a narrow tool (`sum`) purpose-built for exactly the case being tested.
- **No new syntax** — this unit is pure verification, using `sigma` and `sum` exactly as already built, following the same checked-not-assumed discipline this curriculum has used since Lesson 22.

### CS Lens

This is the standard way a new, general tool earns trust: checking it against an already-trusted, narrower tool on the case where both should agree, before relying on the general tool for cases the narrow one can't handle at all. Also recognized in: a new, general-purpose calculator app checked against a purpose-built adding machine on simple sums, before being trusted for more complex calculations the adding machine was never built to handle; a new general shipping-cost calculator checked against an old, single-route-only spreadsheet on that one route, before being trusted for every other route.

### SE Lens

The alternative to this direct comparison is to trust `sigma`'s translation from sigma notation is correct because the code "looks right" against the notation. The real cost of that alternative is exactly the risk this curriculum has guarded against since its earliest recursive procedures (Lesson 28) — a plausible-looking translation that's subtly wrong, perhaps off by one at a boundary the identity-sum case happens not to expose. Checking against `sum`'s ten independently-known values, as this unit does, is what confirms the translation is actually correct, not just superficially plausible.

---

## Concept Unit 4: sigma Beyond sum's Reach

### The Problem

`sum` (Lesson 44) can only ever sum the identity sequence. `sigma`'s entire purpose is working with *any* sequence — it's worth demonstrating this directly, on sequences `sum` was never built to handle at all, checking each against an independent source of truth.

### No isolated lab for this step

This concept has no code of its own to isolate — the real demonstrations are shown directly below, using `sigma` unchanged from Concept Unit 2.

### Applying It — Two Sequences sum Could Never Sum

**Sum of squares, checked against a known closed-form formula, `n(n + 1)(2n + 1) / 6`:**

```scheme
(sigma (lambda (i) (* i i)) 1 10)
```

```
$ guile sigma.scm
sigma(i^2, 1, 10) = 385
formula check: 385
```

Verified this session — `sigma` applied to `f(i) = i²`, summed from `1` to `10`, gives `385`, matching the closed-form formula's independently computed value exactly.

**Sum of powers of two, checked against a value already familiar from this curriculum's own work in Era II:**

```scheme
(sigma (lambda (i) (expt 2 i)) 0 9)
```

```
$ guile sigma.scm
sigma(2^i, 0, 9) = 1023
```

Verified this session — `sigma` applied to `f(i) = 2ⁱ`, summed from `0` to `9`, gives `1023` — `2¹⁰ − 1`, the identical shape of number Lesson 51's own `2047 = 2¹¹ − 1` call-count measurement already produced, no coincidence, but a direct instance of the geometric-series pattern Lesson 65 will name formally.

### Walkthrough

- **`(sigma (lambda (i) (* i i)) 1 10)`** — the identical `sigma` procedure, applied to a genuinely different sequence, requiring no change to `sigma` itself, only a different function passed in.
- **The real `385`-versus-formula match** — confirms `sigma`'s general correctness on a sequence structurally different from the identity function.
- **`(sigma (lambda (i) (expt 2 i)) 0 9)`, giving `1023`** — a second, independent confirmation, and a direct, honest connection forward to a pattern (`2ⁿ − 1`) this curriculum has already encountered without naming, in Lesson 51's real measurements.

### CS Lens

This is the practical payoff of Concept Unit 2's higher-order design: one procedure, `sigma`, now handles every sequence tested in this lesson — the identity function, squares, powers of two — with zero changes to `sigma` itself, exactly the reusability this curriculum's higher-order functions (`map`, `filter`, `fold`) have delivered since Lesson 34. Also recognized in: a single, general invoicing system correctly totaling line items regardless of whether they represent hourly labor, flat fees, or percentage-based commissions, because the totaling logic never needed to know which; a single, general grading script correctly computing course totals regardless of whether assignments are weighted equally, by percentage, or by point value.

### SE Lens

The alternative to building one general `sigma` is exactly what Concept Unit 2's SE Lens already named: a separate summing procedure per sequence. This unit makes that cost concrete — summing squares and summing powers of two would each have needed their own from-scratch recursive procedure, each one a near-duplicate of `sum`'s own structure, differing only in which value gets added at each step. `sigma`, built once, handles both instead, with the actual per-sequence logic reduced to a single `lambda` at the call site.

---

## Closing

### Connect the pieces

One idea — a sequence is a function from index to value — traced through naming, tool-building, and verification:

1. **The definition, named (Unit 1):** a sequence is a function whose domain is indices — a name for something this curriculum has built since `factorial` and `fib`, not a new mechanism.
2. **The notation, translated into code (Unit 2):** `sigma`, a direct, general realization of `∑ᵢ₌ₐᵇ f(i)`, using the identical higher-order pattern already established by `map` and `filter`.
3. **The translation, checked (Unit 3):** `sigma` matched against `sum` (Lesson 44) exactly, at ten independently known values.
4. **The generality, demonstrated (Unit 4):** `sigma` applied to two sequences `sum` was never built to handle, each checked against an independent source of truth — a formula, and this curriculum's own earlier measured evidence.

Every real number in this lesson — the ten `sigma`-versus-`sum` matches, `385`, `1023` — was checked against something independently known, not merely computed once and trusted; `sigma` itself is now available as a general tool for Lesson 64 and 65's coming work deriving arithmetic and geometric series formulas.

### What breaks without this

Suppose an engineer needed to compute a total across several genuinely different sequences over the course of a project — a sum of linear costs, then later a sum of squared error terms, then later still a sum of exponentially decaying weights — and, lacking a general summing tool, wrote a separate, purpose-built recursive summing procedure for each one, the way `sum` (Lesson 44) was purpose-built for exactly one sequence. Each new procedure would need its own base case, its own recursive case, and its own separate testing, multiplying the chances of a subtle bug (an off-by-one boundary, say) being introduced fresh each time, in code that's structurally near-identical to code already written and already tested elsewhere in the same project. Building one general `sigma`, as this lesson did, and testing it thoroughly once, removes that repeated risk entirely — every future sequence needs only a new `lambda`, not a new recursive procedure.

### Exercises

1. **Observe.** Choose a sequence of your own — a formula `f(i)` not used in this lesson — and compute `sigma(f, 1, 5)` by hand, adding the five terms individually.
2. **Formalize.** Run `sigma` with your Exercise 1 sequence and bounds, and confirm the real output matches your by-hand computation exactly.
3. **Explain.** State, in your own words, why `sum` (Lesson 44) can be understood as a special case of `sigma` — specifically, which fixed function and which fixed lower bound `sum` implicitly uses that `sigma` leaves general.
4. **Formalize.** Use `sigma` to compute the sum of the first `20` cube numbers (`f(i) = i³`, summed from `1` to `20`), and check your result against the closed-form formula `[n(n + 1)/2]²`.
5. **Explain.** Using Concept Unit 1's definition, state whether `pascal-triangle`'s `n`th row (Lesson 60) is a sequence in the strict sense defined here, and if its values aren't ordinary numbers, explain what that means for whether `sigma`, as currently built, could sum them directly.

### Definition of done

- [ ] You can state the definition of *sequence* in terms of Lesson 7's function definition, without introducing any new mechanism.
- [ ] You can read and translate sigma notation, `∑ᵢ₌ₐᵇ f(i)`, into a real computation.
- [ ] You can implement and verify `sigma`, checking it against an already-trusted, narrower procedure.
- [ ] You can apply `sigma` to a sequence of your own choosing and check the result against an independent source of truth.
- [ ] You completed Exercises 1–5 using a sequence not used as this lesson's own example.
- [ ] Commit `sigma.scm` and your Exercise 2 and 4 findings, with a commit message stating the sequences you tested and the totals you verified.
