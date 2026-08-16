# Lesson 153: Expected Value

**What you will build:** **expected value**, `E[X]` — a real, single number summarizing an entire real distribution, computed as the real, probability-weighted average of every value a random variable can take — and real, direct evidence of **linearity of expectation**, the real, surprising fact that `E[X + Z] = E[X] + E[Z]` even when `X` and `Z` are genuinely dependent. Real, verified evidence this session: `E[X\text{-sum}]$, computed by Lesson 152's own real distribution, comes out to exactly `7.0`, confirmed independently by a real, direct average over all `36` atomic outcomes — the identical real answer, two genuinely different real computational paths. Splitting the sum into its own two real, individual dice, `E[d_1] + E[d_2] = 3.5 + 3.5 = 7.0`, matches `E[X\text{-sum}]$ exactly — an expected real result, since the two dice are independent. But `E[d_1] + E[I_{\text{doubles}}]$, where `I_{\text{doubles}}$ is Lesson 152's own indicator variable, computed directly *from* `d_1$ and therefore genuinely dependent on it, comes out to `3.6667` — and a real, direct, exhaustive average of `d_1 + I_{\text{doubles}}$ over every one of the `36` real outcomes gives the identical `3.6667`, confirming linearity holds exactly even here, where the two real quantities being added are provably not independent. The transferable point: expected value turns a whole real distribution into one real number, and linearity of expectation is not a convenient special case for independent quantities — it is a real, unconditional identity, true regardless of any real relationship between the two quantities being combined.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 152's own real random variables and distributions, `X-sum`, `d1`, `d2`, and `I-doubles` — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Random variable** — a real, precise function mapping every outcome in a sample space to a real number.
- **Distribution (of a random variable)** — a real, complete listing of every value a random variable can take, paired with the real probability of it taking that specific value.
- **Expected value, `E[X]`** — the real, probability-weighted average of a random variable's own possible values: `E[X] = \sum_v v \times P(X = v)`, summed over every real value `v` in `X`'s own distribution. It exists to collapse an entire real distribution into a single real number representing its own real, long-run average behavior.
- **Linearity of expectation** — the real, general identity `E[X + Z] = E[X] + E[Z]`, true for any two real random variables `X` and `Z` defined over the identical sample space, regardless of whether they are independent or genuinely dependent. It exists because it is, this lesson's own real evidence shows, dramatically more general than it might first appear — no real condition about independence is required for it to hold.

**Objects and methods used**

- **`expected-value`**
  - *What it is:* this lesson's own real procedure computing a random variable's own expected value from its own already-computed distribution.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real expected value this lesson computes, from Concept Unit 2 onward.
- **`distribution`**
  - *What it is:* Lesson 152's own real, general procedure computing any random variable's own complete distribution.
  - *Implementation:* `(define (distribution rv sample-space possible-values) (map (lambda (v) (cons v (P (filter (lambda (o) (= (rv o) v)) sample-space)))) possible-values))`.
  - *Its use:* the real input every expected-value computation in this lesson starts from.

---

## Concept Unit 1: A Whole Distribution Is Often More Than Needed

### The Problem

Lesson 152's own real `distribution` procedure produces a complete, eleven-row real listing for `X-sum` — every possible sum, and its own real probability. A real, common question — "on average, what sum should I expect from rolling two dice" — doesn't need all eleven real rows at once; it needs one real, single number summarizing them.

### No isolated lab for this step

This unit introduces no new construct — Lesson 152's own real `distribution` procedure, given full real treatment in this lesson's own Header, is restated here as the concrete real starting point Concept Unit 2 builds on.

### Reference Source

`distribution`, `X-sum` — quoted unchanged in this lesson's own Header above, originally Lesson 152.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What "On Average" Actually Means

A real, precise meaning for "on average": weight each possible real value by how often it actually happens, then add those real, weighted contributions together — exactly what a real distribution already contains all the information needed for, one real multiplication and one real sum away.

### Walkthrough

- **The direct citation of Lesson 152's own real, eleven-row sum distribution** — grounds this unit's own real question in already-computed, real data, not an abstract example.
- **"one real multiplication and one real sum away"** — previews Concept Unit 2's own real formula before any code is written.

### CS Lens

This is Lesson 74's own real average-case computation, recognized as a real special case: Lesson 74's own `(n+1)/2` was already a real expected value, computed under a real, uniform assumption over target position — this lesson names that identical real computation formally and generalizes it to any real distribution, uniform or not.

### SE Lens

The alternative to computing a real, single expected value is always working with the full real distribution, even when only a real, summary number is actually needed. The real cost of that alternative: a real system that needs to compare "which of two random quantities tends to be larger, on average" would have to compare two full real distributions row by row, rather than two real, single numbers.

---

## Concept Unit 2: Deriving Expected Value

### The Problem

Concept Unit 1 named the real gap. It needs a real, direct formula, and a real, independent check that the formula's own real answer matches a completely different real computational path — a direct average over every real atomic outcome, with no distribution involved at all.

### Reference Source

No reference counterpart — a from-scratch real derivation, applied directly to Lesson 152's own already-established `X-sum` distribution.

### Files affected

Created: `expected-value-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (expected-value dist)
  (apply + (map (lambda (pair) (* (car pair) (cdr pair))) dist)))
```

### The Updated Project

This is `expected-value-check.scm`, in full — Lesson 152's own real sample space, `X-sum`, and `distribution`, quoted unchanged, with this unit's own real `expected-value` added on top:

```scheme
(define die-faces (list 1 2 3 4 5 6))
(define two-dice-outcomes
  (apply append (map (lambda (d1) (map (lambda (d2) (cons d1 d2)) die-faces)) die-faces)))
(define (P ev) (/ (length ev) 36))
(define (X-sum outcome) (+ (car outcome) (cdr outcome)))
(define (distribution rv sample-space possible-values)
  (map (lambda (v) (cons v (P (filter (lambda (o) (= (rv o) v)) sample-space)))) possible-values))

(define (expected-value dist)                                       ; ← new
  (apply + (map (lambda (pair) (* (car pair) (cdr pair))) dist)))       ; ← new

(define sum-dist (distribution X-sum two-dice-outcomes (list 2 3 4 5 6 7 8 9 10 11 12))) ; ← new

(display "=== CU2: E[X-sum], via distribution, and via a real, direct average ===") (newline) ; ← new
(display "E[X-sum] via distribution: ") (display (exact->inexact (expected-value sum-dist))) (newline) ; ← new
(display "E[X-sum] via direct exhaustive average: ")                                            ; ← new
(display (exact->inexact (/ (apply + (map X-sum two-dice-outcomes)) 36))) (newline)               ; ← new
```

### Mechanical Walkthrough

- **`(define (expected-value dist) (apply + (map (lambda (pair) (* (car pair) (cdr pair))) dist)))`** — first appearance in this lesson of this procedure; one real argument, a distribution — a real list of `(value . probability)` pairs, exactly Lesson 152's own `distribution` procedure's own real output shape.
- **`(map (lambda (pair) (* (car pair) (cdr pair))) dist)`** — for every real `(value . probability)` pair, multiplies the two together — the real, weighted contribution of that specific value.
- **`(apply + ...)`** — sums every real weighted contribution, the identical real "apply a combining operator across a list" pattern this curriculum has used since Lesson 147's own `two-dice-outcomes`.
- **`(/ (apply + (map X-sum two-dice-outcomes)) 36)`** — a completely different real computational path: applies `X-sum` directly to every one of the `36` real atomic outcomes, sums every real result, and divides by `36` — the real, ordinary, un-weighted average, with no distribution or probability computed anywhere along the way.
- **The real, exact `7.0`, from both real paths** — direct, checked confirmation: computing `E[X\text{-sum}]$ from its own probability distribution and computing it as a plain average over every equally-likely atomic outcome are two genuinely different real routes to the identical real answer, exactly as they must be when every atomic outcome is equally likely.

### CS Lens

This is Lesson 79's own real "check a derived value against an independent computation" discipline, applied to expected value directly: `expected-value`, run on Lesson 152's own distribution, is checked against a real, completely distribution-free average — the identical real cross-checking rigor this curriculum has applied to algorithms, now applied to a probability computation.

### SE Lens

The alternative to computing `E[X\text{-sum}]$ two genuinely different real ways is trusting `expected-value`'s own formula the first time it produces a plausible-looking real number. The real value of the second, independent check: it confirms not just that the *formula* is correct in the abstract, but that `distribution`'s own real output, from Lesson 152, is actually being consumed correctly here — a real, concrete guard against a real, subtle bug in how the two lessons' own code connects.

### Run It — Show the Real Output

```
$ guile expected-value-check.scm
=== CU2: E[X-sum], via distribution, and via a real, direct average ===
E[X-sum] via distribution: 7.0
E[X-sum] via direct exhaustive average: 7.0
```

Verified this session — `E[X\text{-sum}]$, computed from Lesson 152's own real distribution, and computed as a plain average over all `36` real atomic outcomes, agree exactly: `7.0`.

---

## Concept Unit 3: Linearity, the Expected Case

### The Problem

Concept Unit 2 established `E[X\text{-sum}] = 7.0`. It's worth checking whether that real number can be reached a third way: by computing each individual die's own expected value separately, and simply adding them.

### Reference Source

No reference counterpart — a from-scratch real application of `distribution` and `expected-value`, both given full real treatment above, to two new random variables.

### Files affected

Modified: `expected-value-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (d1 outcome) (car outcome))
(define (d2 outcome) (cdr outcome))
```

### The Updated Project

This is `expected-value-check.scm`, with Concept Unit 2's own file extended by two real, individual-die random variables:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (d1 outcome) (car outcome))                                  ; ← new
(define (d2 outcome) (cdr outcome))                                     ; ← new
(define d1-dist (distribution d1 two-dice-outcomes (list 1 2 3 4 5 6)))    ; ← new
(define d2-dist (distribution d2 two-dice-outcomes (list 1 2 3 4 5 6)))       ; ← new

(display "=== CU3: linearity, the expected, independent case ===") (newline) ; ← new
(display "E[d1]: ") (display (exact->inexact (expected-value d1-dist))) (newline) ; ← new
(display "E[d2]: ") (display (exact->inexact (expected-value d2-dist))) (newline)   ; ← new
(display "E[d1]+E[d2]: ") (display (exact->inexact (+ (expected-value d1-dist) (expected-value d2-dist)))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (d1 outcome) (car outcome))`** — first appearance in this lesson of this real random variable; the real, first die's own value, on its own.
- **`(define (d2 outcome) (cdr outcome))`** — the identical real idea for the second die.
- **`(distribution d1 two-dice-outcomes (list 1 2 3 4 5 6))`** — the identical real `distribution` call shape used throughout this lesson, now applied to a random variable that ignores the second die entirely.
- **The real, exact `3.5` for both `E[d_1]$ and `E[d_2]$, and the real, exact `7.0` for their real sum** — direct, checked confirmation: each individual real die's own expected value is `3.5`, the real midpoint of `1` through `6`, and their real sum matches `E[X\text{-sum}]$ from Concept Unit 2 exactly.

### CS Lens

This is Lesson 152's own real "one sample space, several random variables" discipline, extended: `d1` and `d2` are two more real random variables over the identical `36`-outcome sample space, and their own expected values combine, by real addition, into `X-sum`'s own — a real, first hint of linearity, though `d1` and `d2` are genuinely independent here, leaving open whether the identical real addition would still work for two dependent quantities.

### SE Lens

The alternative to checking `E[d_1] + E[d_2]$ against `E[X\text{-sum}]$ directly is assuming addition of expected values "obviously" works, since addition of the underlying random variables themselves clearly does (`X\text{-sum} = d_1 + d_2}$, by `X-sum`'s own real definition). The real value of checking it anyway: Concept Unit 4 goes on to show this identical real addition also works in a case where that "obviousness" argument doesn't apply nearly as cleanly.

### Run It — Show the Real Output

```
$ guile expected-value-check.scm
=== CU3: linearity, the expected, independent case ===
E[d1]: 3.5
E[d2]: 3.5
E[d1]+E[d2]: 7.0
```

Verified this session — the two individual dice's own real expected values, `3.5` each, sum to exactly `7.0`, matching `E[X\text{-sum}]$ from Concept Unit 2 precisely.

---

## Concept Unit 4: Linearity, Even Under Real Dependence

### The Problem

Concept Unit 3's own real check involved two genuinely independent random variables — `d1` and `d2` don't influence each other at all. It's worth checking, honestly, whether the identical real addition still holds for two random variables that are genuinely, provably dependent, the way Lesson 152's own `I-doubles` is dependent on `d1` by its own real construction.

### Reference Source

`I-doubles` — quoted unchanged in this lesson's own Header, originally Lesson 152's own indicator random variable, computed directly from both dice.

### Files affected

Modified: `expected-value-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (I-doubles outcome) (if (= (car outcome) (cdr outcome)) 1 0))
(define (X-plus-Z outcome) (+ (d1 outcome) (I-doubles outcome)))
```

### The Updated Project

This is `expected-value-check.scm`, with Concept Unit 3's own file extended by a real, dependent pair and a real, direct check:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (I-doubles outcome) (if (= (car outcome) (cdr outcome)) 1 0)) ; ← new
(define I-dist (distribution I-doubles two-dice-outcomes (list 0 1)))    ; ← new
(define (X-plus-Z outcome) (+ (d1 outcome) (I-doubles outcome)))            ; ← new

(display "=== CU4: linearity, even though d1 and I-doubles are genuinely dependent ===") (newline) ; ← new
(display "E[I_doubles]: ") (display (exact->inexact (expected-value I-dist))) (newline)               ; ← new
(display "E[d1]+E[I_doubles]: ") (display (exact->inexact (+ (expected-value d1-dist) (expected-value I-dist)))) (newline) ; ← new
(display "real, direct E[d1+I_doubles] via exhaustive average: ")                                          ; ← new
(display (exact->inexact (/ (apply + (map X-plus-Z two-dice-outcomes)) 36))) (newline)                        ; ← new
```

### Mechanical Walkthrough

- **`(define (I-doubles outcome) (if (= (car outcome) (cdr outcome)) 1 0))`** — Lesson 152's own real indicator variable, given full real treatment in this lesson's own Header, genuinely dependent on `d1`: `I-doubles`' own real value is computed by comparing `d1` directly against `d2` — knowing `d1`'s own real value changes what `d2` would need to be for `I-doubles` to equal `1`.
- **`(define (X-plus-Z outcome) (+ (d1 outcome) (I-doubles outcome)))`** — first appearance in this lesson of this real random variable; the real *sum* of two dependent random variables, evaluated on a single real outcome at a time.
- **`(/ (apply + (map X-plus-Z two-dice-outcomes)) 36)`** — the identical real, direct-average technique Concept Unit 2 used, applied here to the real, *combined* random variable `X-plus-Z` directly, with no distribution or linearity assumption anywhere in this specific real computation.
- **The real, exact `0.1667` for `E[I_{\text{doubles}}]$, the real, exact `3.6667` for `E[d_1] + E[I_{\text{doubles}}]$, and the real, exact `3.6667` for the real, direct exhaustive average of `d_1 + I_{\text{doubles}}$** — direct, checked confirmation: even though `d1` and `I-doubles` are genuinely, provably dependent (Concept Unit 4's own opening argument), adding their two real expected values separately gives *exactly* the identical real answer as computing the expected value of their real sum directly, with no dependence-related correction needed anywhere.

### CS Lens

This is Lesson 148's own real inclusion-exclusion lesson, recognized in direct contrast: Lesson 148 showed real probabilities of *unioned* events do *not* simply add when the events overlap — a real correction term was needed. This unit shows real *expected values* of *summed* random variables always add, with no correction term at all, regardless of dependence — two real, structurally similar-sounding operations, addition of probabilities versus addition of expectations, behaving in genuinely different real ways under dependence.

### SE Lens

The alternative to checking this real, dependent case directly is assuming linearity of expectation only applies safely to independent random variables, the way Concept Unit 3's own real check alone might suggest. The real cost of that overly-cautious assumption: a real system computing an expected total by summing several real, individually-dependent expected values (a real, common, powerful technique) would be needlessly avoided, when this lesson's own real evidence proves it's exactly, unconditionally correct.

### Run It — Show the Real Output

```
$ guile expected-value-check.scm
=== CU4: linearity, even though d1 and I-doubles are genuinely dependent ===
E[I_doubles]: 0.16666666666666666
E[d1]+E[I_doubles]: 3.6666666666666665
real, direct E[d1+I_doubles] via exhaustive average: 3.6666666666666665
```

Verified this session — `E[d_1] + E[I_{\text{doubles}}]$, `3.6667`, exactly matches the real, direct, dependence-agnostic average of `d_1 + I_{\text{doubles}}$ over all `36` real outcomes, direct, checked confirmation that linearity of expectation holds even for genuinely dependent random variables.

---

## Closing

### Connect the pieces

One real distribution, one real formula, one real, unconditional guarantee:

1. **The real gap, named (Unit 1):** a whole distribution is often more than a real question actually needs.
2. **`expected-value`, derived and cross-checked (Unit 2):** `7.0`, matching a completely independent, distribution-free average exactly.
3. **Linearity, the expected case (Unit 3):** `E[d_1] + E[d_2] = E[X\text{-sum}]$, for two genuinely independent random variables.
4. **Linearity, even under real dependence (Unit 4):** the identical real addition, `E[d_1] + E[I_{\text{doubles}}]$, still exactly matches the real, direct expected value of their sum.

Every claim in this lesson traces to real, executed code: expected value computed two independent real ways, and linearity of expectation checked both for independent and for genuinely dependent random variables, with no correction term needed in either real case.

### What breaks without this

Suppose a real system needed the expected real total of several genuinely interdependent real quantities — the expected total wait time across several stages of a real pipeline where a delay at one stage changes the likelihood of delay at the next. Believing linearity of expectation only applies to independent quantities, a real engineer might reach for a far more expensive, real, joint-distribution computation to get a trustworthy real total. This lesson's own real evidence shows that caution unnecessary: the real, individually-computed expected values could simply be added, exactly as `E[d_1] + E[I_{\text{doubles}}]$ was in Concept Unit 4, with no loss of correctness at all.

### Exercises

1. **Observe.** Before checking, predict `E[I_{\text{doubles}}] + E[I_{\text{doubles}}]$ (the identical indicator variable added to itself) using this lesson's own real Concept Unit 4 number for `E[I_{\text{doubles}}]$ to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, and separately confirm it matches a real, direct exhaustive average of `I_{\text{doubles}} + I_{\text{doubles}}$ (equivalently, `2 \times I_{\text{doubles}}$) over all `36` real outcomes.
3. **Formalize.** Define a real indicator variable for Lesson 148's own `event-even-sum?`, and confirm, with real code, that `E[d_1] + E[I_{\text{even-sum}}]$ still matches a real, direct exhaustive average of their real sum, the identical linearity check this lesson's own Concept Unit 4 ran for doubles.
4. **Explain.** In your own words, explain why `expected-value`'s own real implementation never needs to know whether its own input distribution came from an independent or a dependent random variable, referencing what information a distribution alone actually contains.
5. **Explain.** Using this lesson's own real Concept Unit 4 evidence, explain why linearity of expectation is a genuinely more powerful real tool than it might first appear, referencing Lesson 148's own real inclusion-exclusion correction as the kind of complication linearity of expectation never needs.

### Definition of done

- [ ] You can state the real formula for expected value and compute it by hand for a small, real distribution.
- [ ] You can point to this lesson's own real `7.0` result, confirmed two independent ways, as direct evidence expected value is a real, well-defined quantity, not an approximation.
- [ ] You can state linearity of expectation precisely, and explain, using this lesson's own real Concept Unit 4 numbers, why it requires no independence assumption.
- [ ] You completed Exercises 1–5, including a real, checked linearity test of your own dependent pair.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
