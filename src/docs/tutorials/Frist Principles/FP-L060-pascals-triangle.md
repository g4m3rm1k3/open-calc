# Lesson 60: Pascal's Triangle

**What you will build:** `pascal-row-only`, a real procedure generating an entire row of binomial coefficients using nothing but addition — verified to match `combinations`' and `binomial`'s already-established values exactly, and, at a real, measured `n = 3,000`, running in **`923.756` ms** against a factorial-based approach's **`6,431.07` ms** — nearly seven times slower, computing the identical row. The transferable point: Lesson 59 already derived the exact recurrence this lesson names and builds from — it was sitting inside `combinations`' own recursive case the entire time, unrecognized until now. Naming it, and building the bottom-up table it implies, is this lesson's entire job.

**What you need to know first:** Lesson 28 (`FP-L028-recursive-functions.md`) — specifically `factorial`, reused in this lesson's slower comparison procedure. Lesson 55 (`FP-L055-dynamic-programming-emerges.md`) — specifically bottom-up tabulation, whose exact shape this lesson's `pascal-row-only` follows. Lesson 57 (`FP-L057-addition-and-multiplication-principles.md`) — specifically the addition principle, reused directly in recognizing Pascal's rule. Lesson 59 (`FP-L059-combinations.md`) — specifically `combinations`' own recursive case, whose structure *is* this lesson's central recurrence, and `binomial`, checked against this lesson's real output.

**Terms introduced in this lesson**

- **Pascal's rule** — the recurrence `C(n, k) = C(n − 1, k − 1) + C(n − 1, k)`, stating that the count of `k`-item selections from `n` items equals the count of selections that include one specific item plus the count of selections that exclude it — exactly Lesson 59's own recursive-case derivation, named here formally for the first time.
- **Pascal's Triangle** — the triangular arrangement of binomial coefficients produced by applying Pascal's rule repeatedly, each row built entirely from the row above it, with `1`s along both edges.

## Objects and methods used

No new procedures are introduced in this lesson — `adjacent-sums` and `next-row`, built below, use only `car`, `cdr`, `cadr` (Lesson 40–41), `null?`, `append`, and `cons`, all already established.

---

## Concept Unit 1: Recognizing Pascal's Rule Was Already Derived

### The Problem

Lesson 59's `combinations` derivation stated, in prose, that every `k`-item selection from `lst` either includes `(car lst)` or excludes it — two disjoint categories, added together by the addition principle. It's worth restating that derivation in the language of counts alone, stripped of the list-processing details, to see what it actually says.

### No isolated lab for this step

This concept has no code of its own to isolate — the recognition is stated directly below, using Lesson 59's own derivation, unchanged.

### Applying It — Restating combinations' Recursive Case as a Recurrence

**Lesson 59's derivation, restated:** the count of `k`-item selections from `n` items equals the count of selections that include one specific item (which need `k − 1` more items chosen from the remaining `n − 1`) plus the count of selections that exclude it (which need all `k` items chosen from the remaining `n − 1`).

**Written as a formula, using `C(n, k)` for "the count of `k`-item selections from `n` items":**

$$C(n, k) = C(n - 1, k - 1) + C(n - 1, k)$$

**Naming this:** this is **Pascal's rule** — not a new fact requiring new evidence, but Lesson 59's own already-derived and already-verified recursive case, written in the language of counts rather than the language of list recursion.

### Walkthrough

- **The restatement in plain language, then as a formula** — a direct translation exercise, moving from `combinations`' code-shaped derivation (Lesson 59) to a pure counting statement, with no new reasoning introduced.
- **"C(n − 1, k − 1) + C(n − 1, k)"** — the first formal appearance of Pascal's rule, though its content has been true, and used, since Lesson 59's own recursive case.

### CS Lens

This is the recognition that a recurrence relation and a recursive algorithm can be the same underlying fact, viewed two ways — the algorithm's control flow (Lesson 59's `cond` branches) and the mathematical recurrence (this unit's formula) say the identical thing. Also recognized in: an accountant's recursive ledger-balancing rule and the mathematical formula a spreadsheet uses to compute a running total being the same relationship, expressed once in procedure and once in notation; a chemist's step-by-step titration procedure and the rate equation describing it being two views of the same underlying process.

### SE Lens

The alternative to explicitly naming the recurrence already present inside `combinations`' code is to leave it implicit, treating `combinations` as "just a working procedure" without recognizing the more general mathematical pattern inside it. The real cost of that alternative is missing the direct route to Concept Unit 2's far more efficient computation — a route only visible once the recurrence is separated from the specific list-recursion machinery it happened to be embedded in. Naming it explicitly, as this unit does, costs nothing beyond the restatement itself; it is what makes Concept Unit 2's entirely different, additive implementation possible to derive at all.

---

## Concept Unit 2: Building a Triangle via the Recurrence, Bottom-Up

### The Problem

Pascal's rule, once named, doesn't need `combinations`' list-based recursive machinery at all — it needs only addition, and a way to build each row from the one before it, exactly Lesson 55's bottom-up tabulation applied to a new problem.

### The New Code — Type It Yourself

```scheme
(define (adjacent-sums lst)
  (if (or (null? lst) (null? (cdr lst)))
      '()
      (cons (+ (car lst) (cadr lst)) (adjacent-sums (cdr lst)))))

(define (next-row row)
  (append (list 1) (adjacent-sums row) (list 1)))

(define (pascal-row-only n)
  (let loop ((k 0) (row (list 1)))
    (if (= k n) row (loop (+ k 1) (next-row row)))))
```

### The Updated Project

This is `pascal-triangle.scm`, in full:

```scheme
(define (adjacent-sums lst)
  (if (or (null? lst) (null? (cdr lst)))
      '()
      (cons (+ (car lst) (cadr lst)) (adjacent-sums (cdr lst)))))

(define (next-row row)
  (append (list 1) (adjacent-sums row) (list 1)))

(define (pascal-triangle n)
  (let loop ((k 0) (row (list 1)) (rows (list (list 1))))
    (if (= k n)
        (reverse rows)
        (let ((new-row (next-row row)))
          (loop (+ k 1) new-row (cons new-row rows))))))

(for-each (lambda (row) (display row) (newline)) (pascal-triangle 8))
```

### Reference Source

Concept Unit 1's formula, translated directly: `adjacent-sums` computes every `C(n − 1, k − 1) + C(n − 1, k)` pair for the interior of a new row, given the previous row; `next-row` adds the two boundary `1`s (Pascal's rule's edge case — a selection of size `0` or size `n` has exactly one way to happen, matching `combinations`' own two base cases from Lesson 59); `pascal-row-only` and `pascal-triangle` apply `next-row` repeatedly, in Lesson 55's exact bottom-up style — each row built entirely from the one directly before it, never recomputing an earlier row.

### Files affected

Created: `pascal-triangle.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile pascal-triangle.scm
(1)
(1 1)
(1 2 1)
(1 3 3 1)
(1 4 6 4 1)
(1 5 10 10 5 1)
(1 6 15 20 15 6 1)
(1 7 21 35 35 21 7 1)
(1 8 28 56 70 56 28 8 1)
```

Verified this session — nine real rows generated, each one built entirely by addition from the row above it, with `1`s along both edges throughout, exactly the familiar triangular shape.

### Mechanical Walkthrough

- **`(adjacent-sums lst)`** — walks `lst` computing each pair of neighbors' sum, stopping once fewer than two elements remain — the interior values of the next row, one Pascal's-rule application per pair.
- **`(next-row row)`** — assembles a full new row: a `1` on the left edge, the interior sums, a `1` on the right edge.
- **`(let loop ((k 0) (row (list 1)) (rows (list (list 1)))) ...)`** — Lesson 55's named-`let` bottom-up loop, starting from row `0` (`(1)`, the base case) and building upward.
- **`(loop (+ k 1) new-row (cons new-row rows))`** — advancing one row at a time, each new row computed purely from the previous row, never revisiting or recomputing an earlier one.

### CS Lens

This is Lesson 55's bottom-up dynamic-programming pattern, recognized in a genuinely new setting: `table-fib` filled a one-dimensional table from two prior entries; `pascal-triangle` fills a two-dimensional table (a triangle) from the entire row above, but the underlying discipline — compute each new entry only from already-computed entries, never recompute anything — is identical. Also recognized in: an accountant's running-balance ledger, each new balance computed only from the previous balance and the current transaction, never recomputed from the account's entire history; a weather model's forecast grid, each new time-step's values computed only from the grid immediately before it.

### SE Lens

The alternative to building `pascal-triangle` via the recurrence is to compute each entry independently using `combinations` or `binomial` (Lesson 59), the way Concept Unit 3 will measure directly. The real cost of that alternative, made concrete in Concept Unit 4, is repeating work Pascal's rule shows is unnecessary — every one of `combinations`' or `binomial`'s calls redoes work the row above already effectively contains. Building it bottom-up, as this unit does, costs the same careful two-helper-procedure discipline this curriculum has used since Lesson 55; it produces a computation whose total work is proportional only to the triangle's actual size, not to any redundant recomputation.

---

## Concept Unit 3: Verifying the Triangle Against Already-Established Values

### The Problem

`pascal-triangle`'s output looks like Pascal's Triangle. It's worth checking it directly against values this curriculum has already independently established, not just against visual familiarity.

### No isolated lab for this step

This concept has no code of its own to isolate — the real comparison is demonstrated directly below, using code already fully built in Lesson 59 and this lesson.

### Applying It — Row 8 Checked Against Lesson 59's C(8, k)

**Lesson 59's real, verified values, restated:** `C(8, 0)` through `C(8, 8)` were found to be `1, 8, 28, 56, 70, 56, 28, 8, 1`.

**This lesson's row 8, from the real output above:** `(1 8 28 56 70 56 28 8 1)`.

These match exactly, entry for entry — `pascal-triangle`'s eighth row, built entirely by addition, agrees completely with `combinations`' independently generated, independently counted selections from Lesson 59.

**A second, larger check, at n = 20, comparing full rows programmatically:**

```scheme
(display (equal? (pascal-row-only 20) (binomial-row 20)))
```

```
$ guile pascal-timing.scm
agreement check n=20: #t
```

Verified this session — `pascal-row-only`'s entire row-20 output, compared element by element against `binomial`'s independently computed row (Lesson 59's formula, applied across every `k` from `0` to `20`), is `#t` — a complete, exact match.

### Walkthrough

- **The row-8 comparison against Lesson 59's own already-verified values** — direct evidence, using no new computation, that this lesson's addition-only approach agrees with the previous lesson's factorial-based one.
- **The row-20 `equal?` check, comparing two entire rows at once** — a stronger, more thorough form of the same check, confirming agreement across twenty-one separate values in one step, not just eyeballing similarity.

### CS Lens

This is the same discipline this curriculum has applied since Lesson 28's `factorial`-versus-`if`-chain comparisons: two genuinely different computational routes to the same answer, checked against each other directly, rather than trusting either one because it "looks right." Also recognized in: two independent auditors reconciling a company's books, using different methods, and confirming their totals agree exactly; two different measurement instruments, calibrated independently, confirmed to agree on the same physical quantity.

### SE Lens

The alternative to this direct, entry-by-entry check is to trust `pascal-triangle`'s output because it visually resembles the well-known triangle shape. The real cost of that alternative is exactly the risk this curriculum has warned against since its earliest proof lessons — a plausible-looking result is not a checked one, and a subtle off-by-one in `adjacent-sums` or `next-row` could produce a triangle that looks right at a glance while being wrong in a specific entry. Checking directly against Lesson 59's independently derived values, as this unit does, costs one exact comparison; it confirms correctness rather than merely visual plausibility.

---

## Concept Unit 4: Computational Significance — Real, Measured Cost

### The Problem

Concept Unit 2 claimed Pascal's-rule computation avoids redundant work that a `combinations`- or `binomial`-based approach repeats. This claim needs checking with a real, measured comparison, at a scale large enough for the difference to be unmistakable.

### No isolated lab for this step

This concept has no code of its own to isolate — the real timing comparison is demonstrated directly below, using code already fully built.

### Applying It — Real Timing, n = 3,000

**The comparison procedure, computing an entire row via `binomial` (Lesson 59), one independent call per entry:**

```scheme
(define (binomial-row n)
  (map (lambda (k) (binomial n k)) (iota (+ n 1))))
```

```
$ guile pascal-timing.scm
pascal-row-only(3000): 923.756 ms
binomial-row(3000): 6431.07 ms
```

Verified this session — generating an entire row of `3,001` binomial coefficients for `n = 3,000`: `pascal-row-only`, using nothing but addition, takes `923.756` ms; `binomial-row`, recomputing `factorial` values (up to `factorial(3000)`, a genuinely enormous number, computed fresh for every single one of the `3,001` entries) takes `6,431.07` ms — nearly seven times slower for the identical, verified-matching result.

**Naming why, directly:** `binomial-row` calls `factorial` independently for every one of `3,001` values of `k`, each call recomputing a large product essentially from scratch, exactly the redundant-recomputation pattern Lesson 53 diagnosed and Lesson 55 named dynamic programming for fixing. `pascal-row-only` never recomputes anything — every entry is built, once, from already-computed neighbors in the row above, exactly Lesson 55's bottom-up discipline.

### Walkthrough

- **The real `923.756` ms versus `6,431.07` ms measurement** — first direct, measured confirmation that Pascal's-rule computation is not merely elegant but genuinely, substantially faster at real scale.
- **The explicit naming of `binomial-row`'s redundant `factorial` recomputation** — connects this lesson's measured evidence directly back to Lesson 53's overlapping-subproblems diagnosis and Lesson 55's dynamic-programming fix, confirming Pascal's Triangle is, underneath its ancient and famous name, another instance of the identical pattern this curriculum built firsthand two lessons ago.

### CS Lens

This is dynamic programming (Lesson 55), recognized in one of the oldest named mathematical objects in this curriculum's tradition — Pascal's Triangle predates the term "dynamic programming" by centuries, but its efficient construction *is* the bottom-up tabulation technique, discovered independently, centuries apart, because it's the natural efficient answer to the identical underlying redundancy. Also recognized in: an actuarial table, built up year by year from the previous year's figures rather than recomputed from raw data each time; a compound-interest schedule, each period's balance computed only from the period before it, never recalculated from the original principal each time.

### SE Lens

The alternative to measuring this comparison directly is to assume Pascal's-rule computation "should" be faster, based on the CS Lens's reasoning alone, without checking. The real cost of that alternative is exactly the gap between evidence and assumption this curriculum has warned against since Lesson 22 — a reasonable-sounding argument is not the same as a measured fact, and without the real `923.756`-versus-`6,431.07` comparison, the actual size of the advantage, and its dependence on `factorial`'s own growing cost, would remain unconfirmed. Measuring it directly, as this unit does, at a scale large enough (`n = 3,000`) for the difference to be unmistakable, turns a plausible argument into a demonstrated fact.

---

## Closing

### Connect the pieces

One recurrence, recognized, built, verified, and measured:

1. **The recurrence, recognized (Unit 1):** Pascal's rule, restated from `combinations`' own already-derived recursive case (Lesson 59), not a new fact but a new name for an old one.
2. **The triangle, built bottom-up (Unit 2):** `pascal-row-only` and `pascal-triangle`, applying Lesson 55's exact tabulation discipline to Pascal's rule, using nothing but addition.
3. **The triangle, verified (Unit 3):** row 8 matching Lesson 59's `C(8, k)` values exactly; row 20 matching `binomial`'s independently computed row exactly, entry for entry.
4. **The advantage, measured (Unit 4):** a real, nearly sevenfold speed advantage at `n = 3,000`, traced directly back to Lesson 53's overlapping-subproblems diagnosis and Lesson 55's dynamic-programming fix.

Nothing in this lesson introduced a genuinely new algorithmic idea — every piece was already built, in Lessons 53 through 59, and this lesson's entire contribution was recognizing that one of mathematics' oldest, most famous objects is a direct instance of a pattern this curriculum had already constructed from first principles.

### What breaks without this

Suppose a student, having correctly memorized Pascal's Triangle's construction rule from a textbook, needed to compute a specific binomial coefficient for a large `n` — say, as part of a probability calculation — and reached instead for the `n! / (k! × (n − k)!)` formula directly, computing three large factorials from scratch for a single value, unaware that Pascal's rule could produce the identical answer using only addition, no factorial required at all. For one coefficient, the difference might be negligible; needing many coefficients across a range of `k`, the way a probability distribution table would, that difference compounds exactly the way Concept Unit 4 measured — a nearly sevenfold, entirely avoidable cost. Recognizing Pascal's rule as a genuine dynamic-programming technique, not just a triangular curiosity, as this lesson does, is what makes the efficient choice available rather than accidental.

### Exercises

1. **Observe.** Compute Pascal's Triangle's first five rows by hand, using only the addition rule (each interior entry the sum of the two above it), and confirm your result matches this lesson's real `pascal-triangle.scm` output for the same rows.
2. **Formalize.** State, in your own words, why Pascal's rule's two boundary `1`s correspond exactly to `combinations`' two base cases from Lesson 59 — which base case corresponds to which edge.
3. **Explain.** Run `pascal-row-only` and `binomial-row` at three sizes of your own choosing, at least `500` apart, and report the real, measured timing difference at each size, following Concept Unit 4's methodology.
4. **Formalize.** Using your Exercise 3 measurements, state whether the *ratio* between `pascal-row-only`'s time and `binomial-row`'s time grows, shrinks, or stays roughly constant as `n` increases, and explain why, referencing `factorial`'s own growth (Lesson 58).
5. **Explain.** Name one other already-built procedure in this curriculum, besides `table-fib` (Lesson 55), whose bottom-up structure `pascal-row-only`'s `next-row` loop directly resembles, and explain the resemblance precisely.

### Definition of done

- [ ] You can state Pascal's rule and explain why it is the same fact as `combinations`' recursive case, in different notation.
- [ ] You can implement `pascal-row-only` or `pascal-triangle`, building each row from the one before it, addition only.
- [ ] You can verify a generated Pascal's Triangle row against independently computed binomial coefficients.
- [ ] You can measure and explain, with real evidence, why Pascal's-rule computation outperforms repeated factorial-based computation.
- [ ] You completed Exercises 1–5, including at least one real timing comparison at a size not used as this lesson's own example.
- [ ] Commit `pascal-triangle.scm` and your Exercise 3 measurements, with a commit message stating the sizes you tested and the timing ratio you found.
