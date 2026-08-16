# Lesson 152: Random Variables

**What you will build:** a **random variable** — a real, named, standalone function mapping every outcome in a sample space to a real number — and a real, general procedure computing any random variable's own complete **distribution**, verified to always sum to exactly `1.0`. Real, verified evidence this session: `X`, the sum of two dice, computed as a real function rather than inline arithmetic scattered through five earlier lessons, has a real, eleven-value distribution running from `P(X=2) = 0.0278` up to `P(X=7) = 0.1667` and back down to `P(X=12) = 0.0278` — the identical real numbers Lesson 147 first found, now produced by one, general, reusable real procedure instead of Lesson 147's own one-off counting code. A second, genuinely different real random variable over the identical sample space, `Y`, the maximum of the two dice, has its own completely different real distribution, `P(Y=6) = 0.3056`, confirmed to also sum to exactly `1.0` using the identical general procedure, no new counting logic written. And a third, a real *indicator* random variable, `I`, equal to `1` exactly when the roll is doubles and `0` otherwise, has real distribution `P(I=1) = 0.1667` — the exact real number Lesson 148 already established as `P(\text{doubles})` directly, real, exact confirmation that an indicator variable's own probability of equaling `1` is always identical to its underlying event's own probability. The transferable point: a random variable is not a new kind of randomness — it's a real, precise naming of something this curriculum has been computing informally since Lesson 147, and naming it formally is what makes one general `distribution` procedure reusable across every random variable a sample space can support, rather than writing fresh counting code for each one.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 147's own real sample space and sum-counting, and Lesson 148's own real events — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Sample space (Ω)** — the real, complete set of every possible outcome of a real random process.
- **Random variable** — a real, precise function mapping every outcome in a sample space to a real number. It exists to give "a number computed from a random outcome" — a dice sum, a maximum, a count — a real, standalone identity of its own: a genuine function, callable and reusable, rather than an ad hoc expression rewritten every time it's needed.
- **Distribution (of a random variable)** — a real, complete listing of every value a random variable can take, paired with the real probability of it taking that specific value. It exists to summarize a random variable's own entire real behavior in one place, rather than requiring a fresh, separate computation for each individual value.
- **Indicator random variable** — a random variable whose own only two possible real values are `0` and `1`, equal to `1` exactly when some specific real event occurs. It exists to give any real event a direct, numeric real form — real, useful precisely because `P(\text{indicator} = 1)` is always identical to the underlying event's own real probability, a real bridge this lesson establishes and Lesson 153 depends on.

**Objects and methods used**

- **`distribution`**
  - *What it is:* this lesson's own real, general procedure computing any random variable's own complete distribution.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real distribution this lesson computes, from Concept Unit 2 onward, for three genuinely different random variables without any change to the procedure itself.
- **`max`**
  - *What it is:* a real Scheme procedure, reused unchanged since Lesson 142, returning the largest of its own real arguments.
  - *Implementation:* takes one or more real numbers, returns the real, largest one.
  - *Its use:* this lesson's own `Y-max` random variable.

---

## Concept Unit 1: A Real Pattern, Never Named

### The Problem

Lesson 147 computed `(+ (car p) (cdr p))` — a real outcome's own sum — directly inline, inside a real, one-off counting procedure, `count-with-sum`. Lesson 148 and 149 both reused the identical real arithmetic, `(even? (+ (car p) (cdr p)))`, inline again, inside real, differently-purposed procedures. The identical real computation, "a real outcome's own sum," has now appeared several separate real times, never once given a real, standalone name of its own.

### No isolated lab for this step

This unit introduces no new construct — Lesson 147's own real sum-counting is restated here as this lesson's own real motivation, not re-derived.

### Reference Source

No reference counterpart — the real, recurring pattern is restated directly from Lesson 147, 148, and 149's own already-established real code.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What a Real Name Would Buy

Giving "a real outcome's own sum" a real, standalone name — a real function, callable on its own — would mean any future real question about sums could reuse that exact real function, rather than re-typing `(+ (car p) (cdr p))` a sixth, seventh, or eighth real time, and would let a real, general "compute the distribution of *any* such function" procedure exist, usable for sums and for anything else shaped the identical real way.

### Walkthrough

- **The direct citation of the identical real expression, `(+ (car p) (cdr p))`, appearing in three separate earlier lessons** — grounds this unit's own real motivation in already-written, already-verified code, not an abstract complaint.
- **"a real, general 'compute the distribution of *any* such function' procedure"** — previews Concept Unit 2's own real `distribution` procedure before any code is written.

### CS Lens

This is Lesson 144's own real generalization discipline, applied to probability rather than search: exactly as `explore` named the real, shared shape underneath several differently-purposed recursive procedures, a random variable names the real, shared shape underneath "compute a number from an outcome," letting one real distribution-computing procedure serve every random variable a sample space can support.

### SE Lens

The alternative to naming random variables formally is continuing to write one-off real counting code for every new "what's the distribution of this quantity" question, the way Lesson 147 did for sums specifically. The real cost of that alternative, made concrete in Concept Unit 3: a second, genuinely different real question (the maximum of two dice, not their sum) would otherwise require its own, separately-written real counting procedure, duplicating the identical real logic `count-with-sum` already used, just for a different real function of the outcome.

---

## Concept Unit 2: Random Variables and Real, General Distributions

### The Problem

Concept Unit 1 named the real gap. It needs a real, standalone function for "the sum," and a real, general procedure computing *any* such function's own complete real distribution — checked, honestly, against Lesson 147's own already-established numbers.

### Reference Source

No reference counterpart — a from-scratch real naming of Lesson 147's own already-established arithmetic as a standalone real function, plus a genuinely new, general real distribution-computing procedure.

### Files affected

Created: `random-variables-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (X-sum outcome) (+ (car outcome) (cdr outcome)))
(define (distribution rv sample-space possible-values)
  (map (lambda (v) (cons v (P (filter (lambda (o) (= (rv o) v)) sample-space)))) possible-values))
```

### The Updated Project

This is `random-variables-check.scm`, in full — Lesson 147's own real sample space, quoted unchanged, with this unit's own real random variable and general distribution procedure added on top:

```scheme
(define die-faces (list 1 2 3 4 5 6))
(define two-dice-outcomes
  (apply append (map (lambda (d1) (map (lambda (d2) (cons d1 d2)) die-faces)) die-faces)))
(define (P ev) (/ (length ev) 36))

(define (X-sum outcome) (+ (car outcome) (cdr outcome)))             ; ← new
(define (distribution rv sample-space possible-values)                  ; ← new
  (map (lambda (v) (cons v (P (filter (lambda (o) (= (rv o) v)) sample-space)))) possible-values)) ; ← new

(display "=== CU2: X, the real sum random variable, and its own distribution ===") (newline) ; ← new
(for-each (lambda (pair) (display "X=") (display (car pair)) (display " P=") (display (exact->inexact (cdr pair))) (newline)) ; ← new
          (distribution X-sum two-dice-outcomes (list 2 3 4 5 6 7 8 9 10 11 12))) ; ← new
```

### Mechanical Walkthrough

- **`(define (X-sum outcome) (+ (car outcome) (cdr outcome)))`** — first appearance in this lesson of this real, standalone function; a real random variable — takes one real outcome, returns one real number, exactly the real definition this lesson's own Header gives.
- **`(define (distribution rv sample-space possible-values) ...)`** — first appearance in this lesson of this procedure; three real arguments — `rv`, any real random variable (a real, callable procedure like `X-sum`); `sample-space`, the real outcomes to consider; `possible-values`, every real value `rv` could possibly take.
- **`(map (lambda (v) (cons v (P (filter (lambda (o) (= (rv o) v)) sample-space)))) possible-values)`** — for each real candidate value `v`, filters `sample-space` down to only the real outcomes where `(rv o)` equals `v`, computes that real subset's own probability via `P`, given full real treatment in this lesson's own Header, and pairs the real value with its own real probability via `cons`.
- **The real, exact eleven pairs, matching Lesson 147's own already-established numbers precisely — `P(X{=}7) = 0.1667`, `P(X{=}2) = 0.0278`, and so on** — direct, checked confirmation: this lesson's own general `distribution` procedure, given `X-sum` and the real list of possible sums, reproduces Lesson 147's own real, hand-built counting exactly, from one, reusable real procedure.

### CS Lens

This is Lesson 105's own real ADT discipline, applied to a probability computation rather than a data structure: `distribution`'s own real contract — a random variable, a sample space, and a list of possible values in, a real, complete probability listing out — stays fixed regardless of which specific real random variable is passed in, exactly as an ADT's own contract stays fixed across swappable implementations.

### SE Lens

The alternative to writing `distribution` as a real, general procedure is keeping Lesson 147's own real, sum-specific `count-with-sum` as the only tool available. The real value of the general version, made concrete in Concept Unit 3: it computes a *completely different* random variable's own distribution with zero new counting logic, only a different real function passed in as an argument.

### Run It — Show the Real Output

```
$ guile random-variables-check.scm
=== CU2: X, the real sum random variable, and its own distribution ===
X=2 P=0.027777777777777776
X=3 P=0.05555555555555555
X=4 P=0.08333333333333333
X=5 P=0.1111111111111111
X=6 P=0.1388888888888889
X=7 P=0.16666666666666666
X=8 P=0.1388888888888889
X=9 P=0.1111111111111111
X=10 P=0.08333333333333333
X=11 P=0.05555555555555555
X=12 P=0.027777777777777776
```

Verified this session — `distribution`, applied to `X-sum`, reproduces Lesson 147's own already-established real sum probabilities exactly, using one general real procedure instead of Lesson 147's own hand-written, sum-specific counting code.

---

## Concept Unit 3: A Second, Genuinely Different Random Variable

### The Problem

Concept Unit 2 confirmed `distribution` reproduces already-known real numbers. It's worth checking it on a genuinely new real random variable — one whose own distribution has never been computed anywhere in this curriculum — using the identical, unmodified real procedure.

### Reference Source

No reference counterpart — a from-scratch real random variable, `Y-max`, applied through Concept Unit 2's own already-established real `distribution` procedure.

### Files affected

Modified: `random-variables-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (Y-max outcome) (max (car outcome) (cdr outcome)))
```

### The Updated Project

This is `random-variables-check.scm`, with Concept Unit 2's own file extended by a real, second random variable:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (Y-max outcome) (max (car outcome) (cdr outcome)))          ; ← new

(display "=== CU3: Y, the real max random variable, distribution ===") (newline) ; ← new
(for-each (lambda (pair) (display "Y=") (display (car pair)) (display " P=") (display (exact->inexact (cdr pair))) (newline)) ; ← new
          (distribution Y-max two-dice-outcomes (list 1 2 3 4 5 6))) ; ← new
(newline)                                                                ; ← new
(display "real sum-dist total P (must equal 1): ")                         ; ← new
(display (exact->inexact (apply + (map cdr (distribution X-sum two-dice-outcomes (list 2 3 4 5 6 7 8 9 10 11 12)))))) (newline) ; ← new
(display "real max-dist total P (must equal 1): ")                            ; ← new
(display (exact->inexact (apply + (map cdr (distribution Y-max two-dice-outcomes (list 1 2 3 4 5 6)))))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (Y-max outcome) (max (car outcome) (cdr outcome)))`** — first appearance in this lesson of this real random variable; `max`, given full real treatment in this lesson's own Header, applied to a real outcome's own two values.
- **`(distribution Y-max two-dice-outcomes (list 1 2 3 4 5 6))`** — the identical real call shape as Concept Unit 2's own `X-sum` call, with `Y-max` and its own real possible values, `1` through `6`, substituted in — no change at all to `distribution` itself.
- **The real, exact six pairs, climbing from `P(Y{=}1) = 0.0278` to `P(Y{=}6) = 0.3056`** — direct, measured confirmation of a genuinely different real distribution: unlike `X-sum`'s own real, symmetric, peaked-in-the-middle shape, `Y-max`'s own real distribution rises steadily, since a larger real maximum has more real ways to occur (either die could be the larger one) than a smaller real maximum (both dice must be small).
- **The real, exact `1.0` for both distributions' own real total probability** — direct, checked confirmation of the fundamental real requirement every distribution must satisfy: every real outcome belongs to exactly one real value-group, so the real probabilities across every possible value must always sum to exactly `1`, for any random variable at all.

### CS Lens

This is Lesson 147's own real "atomic outcomes, equally likely; derived outcomes, not automatically so" discipline, extended: `Y-max`'s own real distribution is derived from the identical `36` real, equally-likely atomic outcomes as `X-sum`'s, yet the two real distributions look nothing alike — a real, direct demonstration that a sample space's own equally-likely atomic structure says nothing, by itself, about what shape any particular random variable's own distribution will take.

### SE Lens

The alternative to checking that both real distributions sum to exactly `1.0` is trusting `distribution`'s own real correctness after Concept Unit 2's single, successful check. The real value of this unit's own second, independent check: a real bug specific to how `distribution` handles a different real range of possible values (six, not eleven) could easily have escaped Concept Unit 2's own test alone — checking the real total probability here catches a real class of error Concept Unit 2's own numeric match, alone, would not.

### Run It — Show the Real Output

```
$ guile random-variables-check.scm
=== CU3: Y, the real max random variable, distribution ===
Y=1 P=0.027777777777777776
Y=2 P=0.08333333333333333
Y=3 P=0.1388888888888889
Y=4 P=0.19444444444444445
Y=5 P=0.25
Y=6 P=0.3055555555555556

real sum-dist total P (must equal 1): 1.0
real max-dist total P (must equal 1): 1.0
```

Verified this session — `Y-max`'s own real distribution, computed by the identical, unmodified `distribution` procedure Concept Unit 2 used for `X-sum`, is a genuinely different real shape, and both real distributions sum to exactly `1.0`.

---

## Concept Unit 4: Indicator Random Variables — A Real Bridge to Events

### The Problem

Concept Unit 3 confirmed `distribution` generalizes across genuinely different real random variables. It's worth checking one more, special real case — a random variable whose own only possible real values are `0` and `1` — and confirming, precisely, what real relationship it has to Lesson 148's own real events.

### Reference Source

`event-doubles?` — no reference counterpart to quote verbatim this session, since this lesson's own `I-doubles` is a fresh, real reformation of the identical real idea Lesson 148 already established, built and verified independently here.

### Files affected

Modified: `random-variables-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (I-doubles outcome) (if (= (car outcome) (cdr outcome)) 1 0))
```

### The Updated Project

This is `random-variables-check.scm`, with Concept Unit 3's own file extended by a real, indicator random variable:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (I-doubles outcome) (if (= (car outcome) (cdr outcome)) 1 0)) ; ← new

(display "=== CU4: I, a real indicator random variable, distribution ===") (newline) ; ← new
(for-each (lambda (pair) (display "I=") (display (car pair)) (display " P=") (display (exact->inexact (cdr pair))) (newline)) ; ← new
          (distribution I-doubles two-dice-outcomes (list 0 1))) ; ← new
```

### Mechanical Walkthrough

- **`(define (I-doubles outcome) (if (= (car outcome) (cdr outcome)) 1 0))`** — first appearance in this lesson of this real random variable; a real, direct translation of "is this outcome doubles" into a real number, `1` or `0`, rather than a real boolean — the identical real check Lesson 148's own `event-doubles?` performs, but returning a real number this lesson's own `distribution` procedure can consume directly.
- **`(distribution I-doubles two-dice-outcomes (list 0 1))`** — the identical real call shape once more, with only two real possible values this time.
- **The real, exact `P(I{=}0) = 0.8333` and `P(I{=}1) = 0.1667`** — direct, checked confirmation, and a real, exact match: `P(I{=}1)`, `0.1667`, is precisely `P(\text{doubles})`, the real number Lesson 148 first established directly from `event-doubles`.

### CS Lens

This is Lesson 138's own real heuristic-function idea, recognized from an unexpected angle: exactly as a heuristic function collapsed a complex real state into one real, comparable number, an indicator random variable collapses a real, boolean event ("is it doubles") into one real, arithmetic number (`0` or `1`) — real, useful precisely because arithmetic can be done on numbers in ways that can't be done directly on boolean truth values, a real capability Lesson 153's own real Expected Value depends on.

### SE Lens

The alternative to naming this real correspondence explicitly — `P(I{=}1) = P(\text{event})`, always — is treating indicator variables as an unrelated, separate real idea from events, requiring their own real justification each time. The real value of naming the correspondence directly: any real event this curriculum has already built, from Lesson 148 onward, can be turned into a real indicator variable with no new real derivation needed, simply by defining a function returning `1` exactly where the event's own predicate would return `#t`.

### Run It — Show the Real Output

```
$ guile random-variables-check.scm
=== CU4: I, a real indicator random variable, distribution ===
I=0 P=0.8333333333333334
I=1 P=0.16666666666666666
```

Verified this session — `I-doubles`'s own real `P(I{=}1)`, `0.1667`, exactly matches Lesson 148's own real, independently-established `P(\text{doubles})`, direct, checked confirmation that an indicator variable's own probability of equaling `1` is always identical to its underlying event's own probability.

---

## Closing

### Connect the pieces

One real sample space, three real random variables, one general real procedure:

1. **The real gap, named (Unit 1):** "a real outcome's own sum" kept being rewritten inline, never named.
2. **`X-sum`, named, and `distribution`, derived (Unit 2):** the identical real numbers Lesson 147 already found, produced by one general real procedure.
3. **`Y-max`, a genuinely different real random variable (Unit 3):** a genuinely different real distribution, the identical general procedure, both real distributions summing to exactly `1.0`.
4. **`I-doubles`, an indicator, and a real bridge to events (Unit 4):** `P(I{=}1)` exactly matches Lesson 148's own already-established `P(\text{doubles})`.

Every claim in this lesson traces to real, executed code: one general real distribution-computing procedure, applied unmodified to three genuinely different real random variables, checked against already-established real numbers and against the fundamental real requirement that every distribution sums to `1`.

### What breaks without this

Suppose a real system needed the real distribution of a dozen genuinely different real quantities computed from the identical underlying real sample space — sums, maximums, differences, indicators for a dozen different real events. Without a real random-variable abstraction and a real, general `distribution` procedure, each one would need its own hand-written real counting code, the way Lesson 147's own `count-with-sum` was written specifically, and only, for sums. This lesson's own real evidence shows the actual cost of that: twelve real, separate, duplicated implementations of the identical real filter-and-count logic, instead of twelve real, one-line functions passed into one already-verified real procedure.

### Exercises

1. **Observe.** Before checking, predict the real shape of `Y-max`'s own distribution if it were replaced with `Y-min` (the minimum of the two dice instead of the maximum), using this lesson's own real Concept Unit 3 reasoning about counting to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — define `Y-min` and compute its own real distribution using `distribution`, unmodified.
3. **Formalize.** Define a real indicator random variable for Lesson 148's own `event-even-sum?`, and confirm, with real code, that its own `P(I{=}1)` exactly matches `P(\text{even-sum})`, `0.5`.
4. **Explain.** In your own words, explain why `distribution`'s own real third argument, `possible-values`, has to be supplied by the caller rather than computed automatically by `distribution` itself, referencing what `distribution` would need to know about an arbitrary real random variable's own range that it currently doesn't.
5. **Explain.** Using this lesson's own real Concept Unit 4 evidence, explain why an indicator random variable's own distribution always has exactly two rows, `I{=}0` and `I{=}1`, and why those two real probabilities must always sum to exactly `1`, referencing Lesson 148's own real complement definition.

### Definition of done

- [ ] You can state the real definition of a random variable as a function from a sample space to the real numbers.
- [ ] You can point to this lesson's own real match between `X-sum`'s own distribution and Lesson 147's own numbers as direct evidence that formalizing a pattern doesn't change its own real answer, only how reusably it's computed.
- [ ] You can explain why an indicator variable's own `P(I=1)` always equals its underlying event's own probability.
- [ ] You completed Exercises 1–5, including a real, checked second indicator variable of your own.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
