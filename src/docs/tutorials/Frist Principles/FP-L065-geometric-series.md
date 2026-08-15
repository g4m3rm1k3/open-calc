# Lesson 65: Geometric Series

**What you will build:** `geometric-sum-formula`, a second closed form — this time for sequences that grow by a fixed *ratio* rather than a fixed difference — derived using a genuinely different algebraic technique from Lesson 64's pairing trick. Real, verified evidence this session: the formula matches `sigma` (Lesson 63) exactly across five varied test cases, including a ratio of exactly `1` (a degenerate edge case requiring special handling) and a fractional ratio, `1/2`, producing an exact rational answer, `63/16`. Most strikingly: `(geometric-sum-formula 1 2 11)` computes exactly `2047` — the identical number this curriculum already measured directly, as real call counts, back in Lesson 51's naive `all-subsets` procedure. The transferable point: a formula derived here from pure algebra turns out to explain a real, previously mysterious-looking number this curriculum encountered four eras ago, not by coincidence.

**What you need to know first:** Lesson 51 (`FP-L051-generating-possibilities.md`) — specifically the real `2047`-call measurement, checked directly against this lesson's formula. Lesson 63 (`FP-L063-sequences-and-sums.md`) — specifically `sigma`, reused as this lesson's independent check. Lesson 64 (`FP-L064-arithmetic-series.md`) — specifically the derive-then-verify discipline, and the *arithmetic* sequence structure, contrasted directly against this lesson's *geometric* one.

**Terms introduced in this lesson**

- **Geometric sequence** — a sequence (Lesson 63) where each term is a fixed multiple of the one before it, called the common ratio. `1, 2, 4, 8, 16, …` is a geometric sequence with common ratio `2`; as a function, `f(i) = a × rⁱ`, where `a` is the first term and `r` is the common ratio.
- **Geometric series** — the sum of a geometric sequence's terms over some range.

---

## Concept Unit 1: What Makes a Sequence "Geometric"

### The Problem

Lesson 64 derived a formula for sequences that grow by a fixed *difference*. A genuinely different, equally common structure grows by a fixed *ratio* instead — worth naming precisely, the same way Lesson 64, Concept Unit 1 named arithmetic sequences before deriving anything about them.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated directly below.

### Applying It — Naming the Structure

**The defining property:** in a geometric sequence, each term is the one before it, multiplied by a fixed value — the common ratio, `r`. Given a first term `a` and common ratio `r`, the sequence's `i`th term (starting from `i = 0`) is `a × rⁱ`.

**As real code, following Lesson 64's identical pattern:**

```scheme
(define (geometric-term a r) (lambda (i) (* a (expt r i))))
```

`(geometric-term 1 2)` is the sequence `1, 2, 4, 8, 16, …`; `(geometric-term 3 2)` is `3, 6, 12, 24, …`; `(geometric-term 5 1)` is `5, 5, 5, 5, …` — a valid, degenerate geometric sequence with common ratio `1`, worth naming explicitly here, since (as Concept Unit 2 will show) it needs special handling in the closed form.

### Walkthrough

- **"each term is the one before it, multiplied by a fixed value"** — the precise defining property, contrasted directly against Lesson 64's "differ by a fixed amount."
- **`(geometric-term a r)`** — the identical function-returning pattern Lesson 64 used for `arithmetic-term`, applied to multiplication instead of addition.
- **`r = 1` named as a degenerate case** — flagged here deliberately, exactly the way Lesson 64 flagged `d = 0`, anticipating a derivation step that will need to treat it specially.

### CS Lens

This is the same specialization discipline Lesson 64 already modeled, applied to a genuinely different structure: multiplicative growth rather than additive growth, worth recognizing as its own case because it behaves fundamentally differently at scale, exactly the exponential-versus-linear distinction Lesson 69's Growth Rates will formalize. Also recognized in: a savings account earning compound interest, where each period's balance is the previous balance multiplied by a fixed growth factor, contrasted against a pension paying a fixed amount each period regardless of the balance; a virus's infection count, where each generation infects a multiple of the previous generation's count, contrasted against a factory's output, which typically increases by a fixed amount per shift added.

### SE Lens

The alternative to distinguishing "grows by a fixed difference" from "grows by a fixed ratio" is to treat both as generically "sequences that increase," reaching for the identical arithmetic techniques regardless. The real cost of that alternative is exactly what Concept Unit 2 demonstrates: a geometric series's growth is fundamentally different from an arithmetic one's, and Gauss's pairing trick (Lesson 64) does not apply here at all — a genuinely different derivation is needed. Naming the distinction precisely first, as this unit does, is what signals that a new technique, not a reused one, is required.

---

## Concept Unit 2: Deriving the Sum Formula — Subtract and Cancel

### The Problem

Lesson 64's pairing trick relied on forward and backward sums matching term by term — a technique specific to *additive* structure. A geometric series needs a genuinely different derivation, exploiting its *multiplicative* structure instead.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is stated directly below, in prose.

### Applying It — The Derivation

**Setting up the sum, for `n` terms starting at `a` with common ratio `r`:**

$$S = a + ar + ar^2 + \cdots + ar^{n-1}$$

**Multiplying the entire sum by `r` — this is the technique's key move, exploiting the geometric (multiplicative) structure directly, with no analogue in Lesson 64's additive derivation:**

$$rS = ar + ar^2 + ar^3 + \cdots + ar^n$$

**Subtracting the second equation from the first — notice nearly every term cancels, since `ar`, `ar²`, … `ar^{n-1}` appear in both:**

$$S - rS = a - ar^n$$

**Factoring both sides:**

$$S(1 - r) = a(1 - r^n)$$

**Solving for `S`, valid whenever `r ≠ 1` (dividing by `1 − r` requires it to be nonzero — exactly Concept Unit 1's flagged degenerate case):**

$$S = \frac{a(1 - r^n)}{1 - r}$$

**Handling the `r = 1` case separately:** when `r = 1`, every term equals `a` itself (Concept Unit 1's degenerate example), so the sum is simply `n` copies of `a`: `S = a × n`.

### Walkthrough

- **"Multiplying the entire sum by `r`"** — the defining move of this derivation, genuinely different from Lesson 64's forwards-and-backwards pairing, exploiting multiplication rather than symmetric addition.
- **"nearly every term cancels"** — the key structural insight: subtracting `rS` from `S` leaves only the very first term of `S` and the negative of the very last term of `rS`, everything in between canceling exactly.
- **The `r ≠ 1` requirement, and the separate `r = 1` case** — a direct consequence of the algebra itself (dividing by `1 - r`), not an arbitrary restriction, resolved by falling back to direct reasoning exactly when the formula's own derivation breaks down.

### CS Lens

This is a genuinely different derivation technique from Lesson 64's, demonstrating that "derive, don't memorize" (Lesson 22's standing discipline) isn't a single trick to be reapplied identically everywhere — different structures call for genuinely different algebraic moves, and recognizing which technique fits which structure is itself a skill. Also recognized in: an engineer choosing a genuinely different analysis technique for a system with multiplicative feedback (like a compounding financial model) than for one with additive accumulation (like a simple running total), because the same technique wouldn't correctly capture the other's behavior; a biologist using a different mathematical technique to model exponential population growth than to model linear resource depletion.

### SE Lens

The alternative to deriving this formula via subtract-and-cancel is to attempt Lesson 64's pairing trick again out of habit, discovering only partway through that forward and backward geometric terms don't combine into a constant sum the way arithmetic ones did. The real cost of that alternative is wasted derivation effort down an approach that structurally cannot work here. Recognizing the need for a genuinely different technique, as this unit does from the outset, and explicitly handling the `r = 1` edge case the algebra itself reveals, produces a formula whose scope and limitations are fully understood, not just a result that happens to work on the cases tried first.

---

## Concept Unit 3: Checking the Formula Against sigma

### The Problem

Concept Unit 2's derivation is algebraically sound, including its explicit handling of `r = 1`. Following this curriculum's evidence discipline (Lesson 22), it's worth checking it directly against real, independently computed sums.

### The New Code — Type It Yourself

```scheme
(define (geometric-sum-formula a r n)
  (if (= r 1)
      (* a n)
      (/ (* a (- 1 (expt r n))) (- 1 r))))
```

### The Updated Project

This is `geometric-series.scm`, in full:

```scheme
(define (sigma f lo hi)
  (if (> lo hi)
      0
      (+ (f lo) (sigma f (+ lo 1) hi))))

(define (geometric-term a r) (lambda (i) (* a (expt r i))))

(define (geometric-sum-formula a r n)
  (if (= r 1)
      (* a n)
      (/ (* a (- 1 (expt r n))) (- 1 r))))

(for-each
  (lambda (params)
    (let* ((a (car params)) (r (cadr params)) (n (caddr params))
           (real-sum (sigma (geometric-term a r) 0 (- n 1)))
           (formula-sum (geometric-sum-formula a r n)))
      (display "a=") (display a) (display " r=") (display r) (display " n=") (display n)
      (display " sigma=") (display real-sum)
      (display " formula=") (display formula-sum)
      (display " match=") (display (= real-sum formula-sum))
      (newline)))
  (list (list 1 2 10) (list 3 2 5) (list 5 1 8) (list 1 3 12) (list 2 1/2 6)))
```

### Reference Source

Concept Unit 2's derived formula, translated directly, including its explicit `r = 1` branch: `(if (= r 1) (* a n) (/ (* a (- 1 (expt r n))) (- 1 r)))`, using `expt` (Lesson 63) for `rⁿ`.

### Files affected

Created: `geometric-series.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile geometric-series.scm
a=1 r=2 n=10 sigma=1023 formula=1023 match=#t
a=3 r=2 n=5 sigma=93 formula=93 match=#t
a=5 r=1 n=8 sigma=40 formula=40 match=#t
a=1 r=3 n=12 sigma=265720 formula=265720 match=#t
a=2 r=1/2 n=6 sigma=63/16 formula=63/16 match=#t
```

Verified this session — across five varied test cases, including `r = 1` (Concept Unit 2's degenerate case) and a fractional ratio `r = 1/2` (producing an exact rational answer, `63/16`, Guile's built-in exact arithmetic preserving it precisely), `geometric-sum-formula`'s result matches `sigma`'s independently, term-by-term computed sum exactly, every time.

### Mechanical Walkthrough

- **`(if (= r 1) (* a n) ...)`** — the explicit degenerate case, handled directly rather than allowed to reach the division by `1 - r`, which would be division by zero when `r = 1`.
- **`(/ (* a (- 1 (expt r n))) (- 1 r))`** — a direct translation of `a(1 - rⁿ) / (1 - r)`, using `expt` for `rⁿ`.
- **`(geometric-term a r)` passed to `sigma`** — the independent check: computing the identical sum by actually multiplying out and adding every term, rather than via the closed form.
- **The real `#t` match at every one of five varied cases, including the fractional case** — direct, verified confirmation, extending even to non-integer ratios.

### CS Lens

This is the identical trust-building pattern Lesson 64 established, now applied to a formula whose derivation used a genuinely different technique — confirming that "derive, then verify against an independent computation" is a general discipline, not tied to any one specific algebraic method. Also recognized in: a compound-interest calculator's closed-form output checked against a year-by-year simulation of the identical account, for several different interest rates including an edge case of `0%` growth; a population-growth model's closed-form projection checked against a generation-by-generation simulation.

### SE Lens

The alternative to checking `geometric-sum-formula` against `sigma` across a case specifically including `r = 1` is to test only "typical" ratios and assume the edge case works because the `if` branch "looks right." The real cost of that alternative is exactly the kind of untested-boundary bug this curriculum has repeatedly guarded against since Lesson 29's base-case lessons — an `r = 1` input silently producing a division-by-zero error, or worse, a silently wrong answer, if the special case were mishandled. Explicitly including `r = 1` in the real test battery, as this unit does, confirms the degenerate case Concept Unit 1 and 2 both flagged is actually handled correctly, not just assumed to be.

---

## Concept Unit 4: Explaining Lesson 51's Own Number

### The Problem

Lesson 51 measured, as a real call count, that `all-subsets`, written without `let`, made exactly `2047` calls generating subsets of a ten-item list. That number was measured, not derived, back in Lesson 51. It's worth checking whether this lesson's geometric series formula explains it directly.

### No isolated lab for this step

This concept has no code of its own to isolate — the real connection is demonstrated directly below, using code already fully built in this lesson.

### Applying It — Deriving Lesson 51's 2047 From First Principles

**Recalling the structure, from Lesson 51's own diagnosis:** without `let`, `all-subsets` calls itself twice at every level of recursion — once for the "include" branch, once for the "exclude" branch — so the number of calls at recursion depth `i` is `2ⁱ`. Across ten items, the recursion reaches eleven levels deep (depths `0` through `10`), and the total call count is the *sum* of calls across every level — exactly a geometric series, first term `1` (`2⁰`), common ratio `2`, for `11` terms.

```scheme
(geometric-sum-formula 1 2 11)
```

```
$ guile connect.scm
geometric-sum-formula(1,2,11) = 2047
```

Verified this session — `geometric-sum-formula`, applied with `a = 1`, `r = 2`, `n = 11`, gives exactly `2047`, matching Lesson 51's real, measured call count exactly. A number this curriculum first encountered as a surprising, empirically measured fact, four lessons before this Era even began, turns out to be a direct, predictable instance of this lesson's own derived formula.

### Walkthrough

- **The recalled structure from Lesson 51** — connects this lesson's abstract formula directly to a specific, previously measured, real piece of evidence from earlier in the curriculum.
- **The real `2047`-versus-`2047` match** — the strongest possible confirmation available: not merely "the formula seems to work," but "the formula predicts a number this curriculum already independently measured, months of lesson-content ago, exactly."

### CS Lens

This is the payoff of deriving general tools rather than memorizing specific facts: a formula built from pure algebra in this lesson turns out to retroactively explain a specific, real measurement made in an entirely different context, four eras of this curriculum earlier — exactly the kind of unifying power a genuinely understood mathematical tool provides over a collection of disconnected, memorized facts. Also recognized in: a physicist deriving a general formula for projectile motion, then discovering it retroactively explains a specific, previously puzzling data point recorded in an old, unrelated experiment; an economist deriving a general model of compound growth, then discovering it explains a specific historical dataset that had seemed anomalous before the model existed.

### SE Lens

The alternative to connecting this lesson's formula back to Lesson 51's real evidence is to treat this lesson's derivation as an isolated mathematical exercise, disconnected from anything actually built or measured elsewhere in this curriculum. The real cost of that alternative is missing exactly the kind of validation this curriculum has modeled since Lesson 22 — a formula's *predictive power against independently gathered evidence* is stronger confirmation than any number of freshly constructed test cases, because the evidence wasn't designed with this formula in mind at all. Making the connection explicit, as this unit does, is what turns Concept Unit 3's careful verification into something more: proof the formula generalizes beyond the cases it was built and tested against.

---

## Closing

### Connect the pieces

One kind of sequence, one derived formula, connected back to real prior evidence:

1. **The structure, named (Unit 1):** geometric sequences, defined by a fixed common ratio, with `r = 1` flagged as a degenerate case requiring care.
2. **The formula, derived (Unit 2):** subtract-and-cancel, a genuinely different technique from Lesson 64's pairing trick, producing `S = a(1 - rⁿ)/(1 - r)` for `r ≠ 1`, and `S = an` for `r = 1`.
3. **The formula, checked (Unit 3):** matched against `sigma`'s independent computation exactly, across five varied cases including the `r = 1` edge case and a fractional ratio.
4. **The formula, connected to real prior evidence (Unit 4):** `geometric-sum-formula(1, 2, 11) = 2047`, exactly explaining Lesson 51's real, independently measured call count from four eras earlier.

Every real number in this lesson — the five exact matches and the `2047`-versus-`2047` connection — was checked against something independently known, and the final connection reaches all the way back to Lesson 51's real, measured evidence, confirming this lesson's derived formula isn't just internally consistent, but genuinely explains something this curriculum encountered and measured long before this formula existed.

### What breaks without this

Suppose an engineer needed to estimate the total number of nodes explored by a recursive search that branches into two independent sub-searches at every level, to depth `20` — exactly the shape Lesson 51's `all-subsets` exhibited without `let` — and, lacking the geometric series formula, attempted to estimate the total by running the search at a smaller depth and extrapolating linearly. Because the total is a geometric series with ratio `2`, not an arithmetic one, a linear extrapolation would badly underestimate the true total, which grows explosively rather than steadily — precisely the distinction Concept Unit 1's CS Lens named between additive and multiplicative growth. Deriving and applying the correct closed form, as this lesson did, is what produces an accurate prediction instead of a dangerously optimistic guess.

### Exercises

1. **Observe.** Choose your own values of `a`, `r` (with `r ≠ 1`), and `n`, and compute the geometric series sum by hand, using the subtract-and-cancel technique directly (write `S`, write `rS`, subtract, solve) rather than multiplying out every term.
2. **Formalize.** Check your Exercise 1 hand computation against both `sigma` and `geometric-sum-formula`, confirming all three agree.
3. **Explain.** State, in your own words, why the derivation in Concept Unit 2 requires `r ≠ 1`, referencing specifically which step in the algebra would fail if `r` were `1`.
4. **Formalize.** Find another real, previously measured number elsewhere in this curriculum that might be explainable as a geometric series (consider Lesson 39's memory growth measurements, or Lesson 53's `fib` call counts), and check whether `geometric-sum-formula` predicts it — report your finding honestly, including if it does *not* match.
5. **Explain.** Using Concept Unit 1's growth distinction, explain in your own words why a geometric series with `r > 1` eventually outgrows any arithmetic series, no matter how large that arithmetic series's common difference `d` is.

### Definition of done

- [ ] You can state what makes a sequence geometric, and express one as a function of the form `f(i) = a × rⁱ`.
- [ ] You can derive the geometric series sum formula using the subtract-and-cancel technique, without looking it up.
- [ ] You can explain why the formula requires special handling when `r = 1`.
- [ ] You can check a derived closed-form formula against an independent, term-by-term computation, including its edge cases.
- [ ] You completed Exercises 1–5, including an honest attempt to connect the formula to another real number already measured elsewhere in this curriculum.
- [ ] Commit `geometric-series.scm` and your Exercise 4 finding, with a commit message stating whether your connection attempt succeeded or not.
