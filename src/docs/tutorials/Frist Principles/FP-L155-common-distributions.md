# Lesson 155: Common Distributions

**What you will build:** the **Bernoulli** and **Binomial** distributions — two real, named, reusable patterns generalizing the one-off random variables Lesson 152 through 154 built by hand — verified three genuinely different real ways against each other. Real, verified evidence this session: counting how many of `3` independent dice rolls come up doubles (each with real probability `1/6`), a real, exhaustive enumeration of the full `46656`-outcome compound sample space gives `P(k{=}0) = 0.5787`, `P(k{=}1) = 0.3472`, `P(k{=}2) = 0.0694`, `P(k{=}3) = 0.0046`. A real, general, closed-form combinatorial formula, `\binom{n}{k} p^k (1-p)^{n-k}`, computed with no enumeration at all, matches every one of those four real values exactly. And Lesson 153 and 154's own already-built `expected-value` and `variance` procedures, applied directly to this real distribution, give `E[\text{Binomial}] = 0.5` and `\text{Var}(\text{Binomial}) = 0.4167` — both confirmed, independently, by the real, general shortcuts `np` and `np(1-p)`. The transferable point: a "common distribution" is not a new kind of randomness — it is a real, recurring *shape*, general enough that its own mean, variance, and complete distribution can all be computed by a real, reusable formula, checked here against the identical brute-force machinery this Era has trusted since Lesson 147, rather than assumed correct because a formula looks authoritative.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 152's own real indicator random variables, Lesson 153's own real `expected-value`, and Lesson 154's own real `variance` — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Random variable** — a real, precise function mapping every outcome in a sample space to a real number.
- **Distribution (of a random variable)** — a real, complete listing of every value a random variable can take, paired with the real probability of it taking that specific value.
- **Bernoulli trial** — a single real experiment with exactly two possible real outcomes, success or failure, where success occurs with some real, fixed probability `p`. It exists to name, precisely, the real shape Lesson 152's own `I-doubles` already had — a single, real `0`-or-`1` outcome — independent of what specific real event it happens to represent.
- **Binomial distribution** — the real distribution of the total number of successes across `n` independent, identical Bernoulli trials, each with the identical real success probability `p`. It exists because "how many times did this happen, out of several independent tries" is a real, recurring question across countless different real problems, and its own real distribution follows one fixed, reusable shape regardless of what the underlying trials actually are.
- **Combination, `\binom{n}{k}`** — the real, exact count of ways to choose `k` items from a real set of `n`, with order not mattering. It exists as the real, combinatorial piece the Binomial distribution's own formula needs to count how many distinct real ways `k` successes could be arranged among `n` real trials.

**Objects and methods used**

- **`choose`**
  - *What it is:* this lesson's own real procedure computing `\binom{n}{k}`.
  - *Implementation:* given full real treatment in Concept Unit 3 below.
  - *Its use:* this lesson's own real, closed-form Binomial formula.
- **`expected-value`** / **`variance`**
  - *What it is:* Lesson 153 and 154's own real procedures computing a random variable's own mean and spread from its own distribution.
  - *Implementation:* `(define (expected-value dist) (apply + (map (lambda (pair) (* (car pair) (cdr pair))) dist)))`; `(define (variance dist) (let* ((mu (expected-value dist)) (sq-dist (map (lambda (pair) (cons (* (car pair) (car pair)) (cdr pair))) dist))) (- (expected-value sq-dist) (* mu mu))))`.
  - *Its use:* this lesson's own real, direct application to a Binomial distribution, checked against real, closed-form shortcuts.
- **`iota`** / **`append`** / **`map`** / **`filter`** / **`length`**
  - *What it is:* real Scheme procedures, reused unchanged from earlier lessons.
  - *Implementation:* each takes the real arguments its own earlier-established contract specifies.
  - *Its use:* building this lesson's own real, explicit, `46656`-outcome compound sample space.

---

## Concept Unit 1: A Real, Recurring Shape

### The Problem

Lesson 152's own `I-doubles` was a real, single `0`-or-`1` random variable. A real, different but closely related question — "out of `3` independent dice rolls, how many come up doubles" — needs a genuinely new real random variable, one counting successes across several real, independent repetitions of the identical Bernoulli trial. It's worth asking whether this real shape is common enough, across different real problems, to deserve a real, reusable formula rather than a fresh, from-scratch derivation every time.

### No isolated lab for this step

This unit introduces no new construct — Lesson 152's own real `I-doubles`, given full real treatment in this lesson's own Header, is restated here as the concrete real starting point Concept Unit 2 generalizes from.

### Reference Source

`I-doubles` — no reference counterpart to quote verbatim this session, since it is this lesson's own file, rebuilt fresh using Lesson 152's own already-established real idea.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Makes This Shape General

Nothing about "count successes across `n` independent, identical trials" depends on the trials being dice rolls specifically — the identical real shape applies to counting heads across coin flips, defective items across a manufacturing batch, or successful requests across repeated network calls, provided each real trial is independent and shares the identical real success probability.

### Walkthrough

- **The direct citation of Lesson 152's own real `I-doubles`** — grounds this unit's own real generalization in already-verified code, not an abstract new idea.
- **The three real, alternative examples (coin flips, defective items, network calls)** — previews why this real shape is worth naming once, formally, rather than re-deriving per problem.

### CS Lens

This is Lesson 144's own real generalization discipline, applied to probability distributions rather than search algorithms: exactly as `explore` named one real shape underneath several differently-purposed recursive procedures, the Binomial distribution names one real shape underneath every "count of successes across `n` independent identical trials" problem, regardless of the trials' own specific real subject.

### SE Lens

The alternative to naming this shape formally is deriving a fresh, real, exhaustive enumeration for every new "how many successes" question, the way this lesson's own Concept Unit 2 does once, by hand. The real cost of that alternative, made concrete in Concept Unit 3: exhaustive enumeration, `46656` real outcomes for just `n{=}3` trials here, grows real, dramatically worse as `n` grows — a real, closed-form formula answers the identical question without ever building the compound space at all.

---

## Concept Unit 2: A Real, Exhaustive Binomial Distribution

### The Problem

Concept Unit 1 named the real shape. It needs real code: a real, complete compound sample space for `3` independent doubles-trials, and a real, exhaustive count of how many of its own `46656` outcomes have exactly `0`, `1`, `2`, or `3` real successes.

### Reference Source

No reference counterpart — a from-scratch real construction, generalizing Lesson 147's own real `two-dice-outcomes` Cartesian-product technique to three independent real trials instead of two dice.

### Files affected

Created: `common-distributions-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (make-trial-space) (append (map (lambda (i) 'success) (iota 6)) (map (lambda (i) 'failure) (iota 30))))
(define (cartesian3 a b c)
  (apply append (map (lambda (x) (apply append (map (lambda (y) (map (lambda (z) (list x y z)) c)) b))) a)))
```

### The Updated Project

This is `common-distributions-check.scm`, in full:

```scheme
(define (make-trial-space) (append (map (lambda (i) 'success) (iota 6)) (map (lambda (i) 'failure) (iota 30)))) ; ← new
(define trial-space (make-trial-space))                              ; ← new

(define (cartesian3 a b c)                                           ; ← new
  (apply append (map (lambda (x) (apply append (map (lambda (y) (map (lambda (z) (list x y z)) c)) b))) a))) ; ← new
(define compound (cartesian3 trial-space trial-space trial-space))   ; ← new

(define (count-successes triple) (length (filter (lambda (x) (eq? x 'success)) triple))) ; ← new
(define (count-with-k k) (length (filter (lambda (triple) (= (count-successes triple) k)) compound))) ; ← new

(display "=== CU2: a real, exhaustive Binomial(n=3, p=1/6) ===") (newline) ; ← new
(display "real trial-space size: ") (display (length trial-space)) (newline) ; ← new
(display "real compound space size: ") (display (length compound)) (newline) ; ← new
(for-each (lambda (k) (display "k=") (display k) (display " real P: ") (display (exact->inexact (/ (count-with-k k) 46656))) (newline)) ; ← new
          (list 0 1 2 3))                                                ; ← new
```

### Mechanical Walkthrough

- **`(define (make-trial-space) (append (map (lambda (i) 'success) (iota 6)) (map (lambda (i) 'failure) (iota 30))))`** — first appearance in this lesson of this procedure; a real, `36`-element list, `6` real copies of the symbol `'success` and `30` real copies of `'failure`, matching Lesson 148's own real `6`-versus-`30` doubles-versus-not-doubles split exactly, without carrying along the specific `(d1 . d2)` pairs themselves — only which real category each atomic outcome falls into.
- **`(define (cartesian3 a b c) ...)`** — first appearance in this lesson of this procedure; the real, three-way generalization of Lesson 147's own two-way Cartesian-product construction, nesting three real `map`/`apply append` layers to build every real combination of one element from each of the three real lists.
- **`(cartesian3 trial-space trial-space trial-space)`** — the identical real `trial-space`, `36` elements, used three times — three real, independent, identically-distributed trials.
- **`(define (count-successes triple) (length (filter (lambda (x) (eq? x 'success)) triple)))`** — first appearance in this lesson of this procedure; counts how many of a real, three-element outcome's own entries are `'success`.
- **`(define (count-with-k k) (length (filter (lambda (triple) (= (count-successes triple) k)) compound)))`** — the identical real filter-and-count idiom this curriculum has used since Lesson 147, applied to `count-successes` instead of a dice sum.
- **The real, exact `36` and `46656`, and the real, exact `0.5787`, `0.3472`, `0.0694`, `0.0046`** — direct, checked confirmation: this lesson's own real, exhaustive enumeration produces a complete, real Binomial distribution, verified to be built correctly by its own real, matching component sizes (`36^3 = 46656`).

### CS Lens

This is Lesson 147's own real Cartesian-product idea, applied a second time at a genuinely larger real scale: `cartesian3` is the identical real construction as `two-dice-outcomes`, generalized from two real factors to three, real, direct evidence that this curriculum's own foundational sample-space technique scales to any real number of independent real trials.

### SE Lens

The alternative to building `trial-space` as `36` abstract `'success`/`'failure` symbols is reusing the full, real `(d1 . d2)` pairs from Lesson 147 directly. The real value of the smaller, abstracted representation: it keeps the real compound space's own size manageable (`46656` real elements instead of needing to track and later discard real, irrelevant dice-face detail), while preserving every real probability exactly.

### Run It — Show the Real Output

```
$ guile common-distributions-check.scm
=== CU2: a real, exhaustive Binomial(n=3, p=1/6) ===
real trial-space size: 36
real compound space size: 46656
k=0 real P: 0.5787037037037037
k=1 real P: 0.3472222222222222
k=2 real P: 0.06944444444444445
k=3 real P: 0.004629629629629629
```

Verified this session — a real, exhaustive enumeration of all `46656` real outcomes across three independent doubles-trials gives a real, complete Binomial distribution.

---

## Concept Unit 3: A Real, Closed-Form Alternative

### The Problem

Concept Unit 2's own real, exhaustive approach already grows to `46656` real outcomes at `n{=}3`; it would grow far larger for real, bigger `n`. A real, closed-form formula, needing no enumeration at all, is worth deriving and checking against Concept Unit 2's own already-verified numbers.

### Reference Source

No reference counterpart — a from-scratch real derivation of the standard Binomial probability formula.

### Files affected

Modified: `common-distributions-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### Applying It — Deriving the Real Formula

A specific real sequence of `n` trials with exactly `k` successes and `n-k` failures, in one particular real order, has real probability `p^k (1-p)^{n-k}$, by real, direct multiplication (independent trials). The real number of *distinct orderings* achieving exactly `k` successes among `n` trials is `\binom{n}{k}`, this lesson's own real combination count. Multiplying the two real quantities together: `P(k \text{ successes}) = \binom{n}{k} \, p^k (1-p)^{n-k}`.

### The New Code — Type It Yourself

```scheme
(define (factorial n) (if (= n 0) 1 (* n (factorial (- n 1)))))
(define (choose n k) (/ (factorial n) (* (factorial k) (factorial (- n k)))))
(define (binomial-prob n k p) (* (choose n k) (expt p k) (expt (- 1 p) (- n k))))
```

### The Updated Project

This is `common-distributions-check.scm`, with Concept Unit 2's own file extended by this unit's own real, closed-form formula:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (factorial n) (if (= n 0) 1 (* n (factorial (- n 1)))))     ; ← new
(define (choose n k) (/ (factorial n) (* (factorial k) (factorial (- n k))))) ; ← new
(define (binomial-prob n k p) (* (choose n k) (expt p k) (expt (- 1 p) (- n k)))) ; ← new

(display "=== CU3: the real, closed-form formula, checked against Concept Unit 2 ===") (newline) ; ← new
(for-each (lambda (k) (display "k=") (display k) (display " closed-form P: ") (display (exact->inexact (binomial-prob 3 k 1/6))) (newline)) ; ← new
          (list 0 1 2 3))                                                ; ← new
```

### Mechanical Walkthrough

- **`(define (factorial n) (if (= n 0) 1 (* n (factorial (- n 1)))))`** — first appearance in this lesson of this procedure; the real, standard recursive factorial, `n!`.
- **`(define (choose n k) (/ (factorial n) (* (factorial k) (factorial (- n k)))))`** — first appearance in this lesson of `choose`, given full real treatment in this lesson's own Header; the real, standard formula `\binom{n}{k} = \dfrac{n!}{k! (n-k)!}`.
- **`(define (binomial-prob n k p) (* (choose n k) (expt p k) (expt (- 1 p) (- n k))))`** — first appearance in this lesson of this procedure; `expt`, reused since Lesson 66, raises `p` to the real power `k` and `(1-p)` to the real power `n-k`; multiplies both together with the real combination count — the real, direct code translation of this unit's own derived formula.
- **The real, exact `0.5787`, `0.3472`, `0.0694`, `0.0046`, matching Concept Unit 2's own real, exhaustively-counted values precisely, at every one of the four real `k` values** — direct, checked confirmation: the real, closed-form formula and the real, brute-force enumeration agree completely, with no enumeration needed for the formula's own computation at all.

### CS Lens

This is Lesson 76's own real "solve a recurrence by expansion, then verify the closed form matches" discipline, applied to a probability formula instead of an algorithm's own running time: `binomial-prob`'s own real, closed-form output is checked directly against Concept Unit 2's own real, exhaustive ground truth, not trusted purely because the derivation looked sound.

### SE Lens

The alternative to deriving a real, closed-form formula is always falling back to Concept Unit 2's own real, exhaustive enumeration, even for large `n`. The real value of the closed form, made concrete by its own real growth: `\binom{100}{50}$, a real Binomial question over `100` trials, would need a real, `2^{100}`-outcome compound space to enumerate exhaustively — computationally impossible — while `binomial-prob`'s own real formula computes the identical real answer directly, in a real, fixed number of arithmetic operations.

### Run It — Show the Real Output

```
$ guile common-distributions-check.scm
=== CU3: the real, closed-form formula, checked against Concept Unit 2 ===
k=0 closed-form P: 0.5787037037037037
k=1 closed-form P: 0.3472222222222222
k=2 closed-form P: 0.06944444444444445
k=3 closed-form P: 0.004629629629629629
```

Verified this session — `binomial-prob`'s own real, closed-form output matches Concept Unit 2's own real, exhaustively-enumerated Binomial distribution exactly, at every one of the four possible `k` values.

---

## Concept Unit 4: Real Mean and Variance, Checked Against Real Shortcuts

### The Problem

Concept Unit 2 and 3 confirmed the real Binomial distribution itself. It's worth applying Lesson 153 and 154's own already-built `expected-value` and `variance` directly to it, and checking the real results against the standard, real, well-known Binomial shortcuts, `np` and `np(1-p)`.

### Reference Source

`expected-value`, `variance` — quoted unchanged in this lesson's own Header above, originally Lessons 153 and 154.

### Files affected

Modified: `common-distributions-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (expected-value dist)
  (apply + (map (lambda (pair) (* (car pair) (cdr pair))) dist)))
(define (variance dist)
  (let* ((mu (expected-value dist))
         (sq-dist (map (lambda (pair) (cons (* (car pair) (car pair)) (cdr pair))) dist)))
    (- (expected-value sq-dist) (* mu mu))))
```

### The Updated Project

This is `common-distributions-check.scm`, with Concept Unit 3's own file extended by a real, direct application of already-built machinery:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (expected-value dist)                                       ; ← new
  (apply + (map (lambda (pair) (* (car pair) (cdr pair))) dist)))       ; ← new
(define (variance dist)                                                 ; ← new
  (let* ((mu (expected-value dist))                                        ; ← new
         (sq-dist (map (lambda (pair) (cons (* (car pair) (car pair)) (cdr pair))) dist))) ; ← new
    (- (expected-value sq-dist) (* mu mu))))                                  ; ← new

(define binom-dist (map (lambda (k) (cons k (/ (count-with-k k) 46656))) (list 0 1 2 3))) ; ← new

(display "=== CU4: real mean and variance, checked against np and np(1-p) ===") (newline) ; ← new
(display "E[Binomial(3,1/6)] real: ") (display (exact->inexact (expected-value binom-dist))) (newline) ; ← new
(display "n*p: ") (display (exact->inexact (* 3 1/6))) (newline)                       ; ← new
(display "Var[Binomial(3,1/6)] real: ") (display (exact->inexact (variance binom-dist))) (newline) ; ← new
(display "n*p*(1-p): ") (display (exact->inexact (* 3 1/6 5/6))) (newline)                ; ← new
```

### Mechanical Walkthrough

- **`(define binom-dist (map (lambda (k) (cons k (/ (count-with-k k) 46656))) (list 0 1 2 3)))`** — first appearance in this lesson of this specific real distribution built in exactly the shape `expected-value` and `variance` both already expect: a real list of `(value . probability)` pairs, matching Lesson 152's own `distribution` procedure's own real output format precisely, even though it's built here directly from Concept Unit 2's own `count-with-k` rather than by calling `distribution` itself.
- **`(expected-value binom-dist)`** — calls `expected-value`, given full real treatment in this lesson's own Header, completely unmodified, on this real Binomial distribution.
- **`(variance binom-dist)`** — the identical real, unmodified call for `variance`.
- **The real, exact `0.5`, matching `n \times p = 3 \times 1/6 = 0.5` exactly** — direct, checked confirmation that `expected-value`, built for arbitrary real distributions with no special knowledge of "Binomial" anywhere in its own code, correctly reproduces the real, well-known Binomial mean shortcut.
- **The real, exact `0.4167`, matching `n \times p \times (1-p) = 3 \times 1/6 \times 5/6 = 0.4167` exactly** — the identical real confirmation for variance.

### CS Lens

This is Lesson 152's own real "one general procedure, several different real random variables" discipline, completed at this Era's own closing: `expected-value` and `variance`, built with no knowledge of Bernoulli or Binomial distributions anywhere in their own real code, correctly reproduce two real, well-known, named-distribution shortcuts simply by being handed the right real distribution — real, direct evidence that generality, built once and trusted, pays off precisely when applied to something it was never specifically designed for.

### SE Lens

The alternative to reusing `expected-value` and `variance` directly is deriving separate, Binomial-specific formulas for mean and variance from scratch, even though the real, general machinery for computing them from any real distribution already exists and is already trusted. The real value of reuse here: this unit's own real numbers are direct, independent confirmation that `np` and `np(1-p)`, real, well-known textbook shortcuts, are not separate facts to memorize — they are exactly what Lesson 153 and 154's own already-general formulas produce, applied to this one real, specific distribution shape.

### Run It — Show the Real Output

```
$ guile common-distributions-check.scm
=== CU4: real mean and variance, checked against np and np(1-p) ===
E[Binomial(3,1/6)] real: 0.5
n*p: 0.5
Var[Binomial(3,1/6)] real: 0.4166666666666667
n*p*(1-p): 0.4166666666666667
```

Verified this session — `expected-value` and `variance`, applied directly and unmodified to a real Binomial distribution, exactly reproduce the real, standard `np` and `np(1-p)` shortcuts.

---

## Closing

### Connect the pieces

One real, recurring shape, checked three genuinely independent ways:

1. **The real shape, named (Unit 1):** counting successes across `n` independent, identical trials recurs across many real problems.
2. **A real, exhaustive Binomial distribution, built (Unit 2):** `46656` real outcomes, four real probabilities.
3. **A real, closed-form formula, derived and checked (Unit 3):** `\binom{n}{k} p^k (1-p)^{n-k}$, matching Concept Unit 2's own real numbers exactly, at a real fraction of the computational cost.
4. **Real mean and variance, via already-built machinery (Unit 4):** `expected-value` and `variance`, unmodified, exactly reproduce `np` and `np(1-p)`.

Every claim in this lesson traces to real, executed code: a real, exhaustive enumeration, a real, closed-form formula checked against it, and this Era's own already-built expected-value and variance machinery applied to a distribution it was never specifically designed for.

### What breaks without this

Suppose a real system needed to know the real probability of at least `40` successes out of `100` independent real trials — a real, common question in real quality control or reliability engineering. Concept Unit 2's own real, exhaustive approach would need a real, `2^{100}`-outcome compound space, computationally impossible to build. Concept Unit 3's own real, closed-form formula answers the identical real question directly, in a real, fixed number of arithmetic steps, precisely because this lesson's own real work went into deriving and checking it against a real, smaller case first.

### Exercises

1. **Observe.** Before checking, predict `P(k{=}0)$ for `n{=}5$ independent doubles-trials (still `p{=}1/6}$), using this lesson's own real, closed-form `binomial-prob` reasoning (`(1-p)^n$) to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, using `binomial-prob` directly.
3. **Formalize.** Build a real, exhaustive `n{=}4$ compound sample space (generalizing `cartesian3` to a real `cartesian4`), and confirm every one of its own real, exhaustively-counted probabilities matches `binomial-prob`'s own real, closed-form output exactly.
4. **Explain.** In your own words, explain why `choose`'s own real formula divides by `k!` *and* `(n-k)!`, rather than just one of the two, referencing what real, unwanted repetition each one separately corrects for.
5. **Explain.** Using this lesson's own real Concept Unit 4 evidence, explain why confirming `expected-value` reproduces `np` is stronger real evidence for `expected-value`'s own general correctness than simply trusting that `np` is the well-known textbook formula — referencing what `expected-value` does and does not know about Binomial distributions specifically.

### Definition of done

- [ ] You can state the real Binomial probability formula and explain, precisely, what each of its own three real factors represents.
- [ ] You can point to this lesson's own real match between exhaustive enumeration and the closed-form formula as direct evidence the formula is correct, not merely standard.
- [ ] You can explain why `expected-value` and `variance`, built with no Binomial-specific knowledge, correctly reproduce `np` and `np(1-p)`.
- [ ] You completed Exercises 1–5, including a real, checked `n=4` exhaustive verification.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
