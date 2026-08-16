# Lesson 154: Variance

**What you will build:** **variance**, `\text{Var}(X)$ — a real, precise measure of how spread out a random variable's own values are around its own expected value — and real, direct, sometimes-surprising evidence about when variance does and does not simply add across two random variables. Real, verified evidence this session: `\text{Var}(X\text{-sum}) = 5.8333`, confirmed two genuinely different real ways — once via a real, algebraic formula, once via a real, direct average of `(X - \bar{X})^2$ over all `36` atomic outcomes. Splitting the sum into its own two dice, `\text{Var}(d_1) + \text{Var}(d_2) = 2.9167 + 2.9167 = 5.8333`, matches exactly, since the two dice are independent. More surprisingly, `\text{Var}(d_1) + \text{Var}(I_{\text{doubles}}) = 3.0556`, and a real, direct check of `\text{Var}(d_1 + I_{\text{doubles}})$ gives the identical `3.0556` — even though `I_{\text{doubles}}$ is computed directly *from* `d_1$, a real, independent check (Lesson 150's own equation, `P(d_1{=}3) \times P(\text{doubles}) = P(d_1{=}3 \text{ and doubles})$, confirmed exactly) reveals `d_1$ and `I_{\text{doubles}}$ are actually, formally independent despite that appearance. A genuinely correlated pair tells a real, different story: `\text{Var}(d_1) + \text{Var}(X\text{-sum}) = 8.75`, but the real, direct `\text{Var}(d_1 + X\text{-sum})$ comes out to `14.5833` — dramatically different, since `X\text{-sum}$ literally contains `d_1$ as one of its own two additive parts, a real, genuine, provable correlation. The transferable point: unlike Lesson 153's own expected value, which adds unconditionally regardless of dependence, variance's own additivity is real but conditional — it requires the two random variables to be uncorrelated, a real, weaker condition than full independence, but a real condition nonetheless, one this lesson's own final evidence shows genuinely fails when it isn't met.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 152's own real random variables and Lesson 153's own real expected value and linearity — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Random variable** — a real, precise function mapping every outcome in a sample space to a real number.
- **Expected value, `E[X]`** — the real, probability-weighted average of a random variable's own possible values.
- **Variance, `\text{Var}(X)`** — the real, expected squared distance of a random variable from its own mean: `\text{Var}(X) = E[(X - E[X])^2]`, algebraically equal to the real, more directly computable `E[X^2] - (E[X])^2`. It exists to give "how spread out" a real, precise, computable meaning distinct from the mean itself.
- **Uncorrelated** — two real random variables whose own real covariance is exactly `0`, a real, checkable condition strictly weaker than independence: independent random variables are always uncorrelated, but two uncorrelated random variables, this lesson's own real evidence shows, are not always independent-*looking* on the surface, even when one is computed directly from the other.

**Objects and methods used**

- **`variance`**
  - *What it is:* this lesson's own real procedure computing a random variable's own variance from its own already-computed distribution.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real variance this lesson computes, from Concept Unit 2 onward.
- **`expected-value`**
  - *What it is:* Lesson 153's own real procedure computing a random variable's own expected value.
  - *Implementation:* `(define (expected-value dist) (apply + (map (lambda (pair) (* (car pair) (cdr pair))) dist)))`.
  - *Its use:* the real mean `variance`'s own formula is built around.
- **`distribution`**
  - *What it is:* Lesson 152's own real, general procedure computing any random variable's own complete distribution.
  - *Implementation:* `(define (distribution rv sample-space possible-values) (map (lambda (v) (cons v (P (filter (lambda (o) (= (rv o) v)) sample-space)))) possible-values))`.
  - *Its use:* the real input every variance computation in this lesson starts from.

---

## Concept Unit 1: A Mean Alone Doesn't Say Enough

### The Problem

Lesson 153's own real `E[X\text{-sum}] = 7.0` says where a dice-sum tends to center. It says nothing at all about how tightly the real, actual sums cluster around that real center, versus how widely they scatter — two real distributions could share the identical real mean while looking nothing alike.

### No isolated lab for this step

This unit introduces no new construct — Lesson 153's own real `E[X\text{-sum}]`, given full real treatment in this lesson's own Header, is restated here as the concrete real gap Concept Unit 2 fills.

### Reference Source

`expected-value`, `X-sum` — quoted unchanged in this lesson's own Header above, originally Lessons 152 and 153.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What "Spread" Needs to Measure

A real, precise measure of spread needs to grow when real values tend to land far from the mean, and shrink when they cluster close to it — and needs to treat "far below the mean" and "far above the mean" identically, since both represent the identical real amount of real deviation, just in opposite directions.

### Walkthrough

- **The direct citation of Lesson 153's own real `7.0`** — grounds this unit's own real question in an already-established, real number.
- **"treat 'far below' and 'far above' identically"** — previews Concept Unit 2's own real squaring step before any code is written.

### CS Lens

This is Lesson 69's own real timing-noise discipline, recognized from a related angle: measuring how much a real, repeated quantity varies around its own typical value is exactly the real question variance answers precisely, where Lesson 69 could only describe the real variation qualitatively.

### SE Lens

The alternative to a real, precise spread measure is describing distributions only by their own real means, leaving "how reliable is this number" to informal judgment. The real cost of that alternative, made concrete in Concept Unit 3 and 4: two real quantities with the identical real mean can combine in genuinely different real ways depending on how they individually spread and relate to each other — information a mean alone can never reveal.

---

## Concept Unit 2: Deriving Variance

### The Problem

Concept Unit 1 named the real gap. It needs a real, direct formula — and a real, independent check that the formula's own real answer matches a completely different real computational path.

### Reference Source

No reference counterpart — a from-scratch real derivation, applied directly to Lesson 152's own already-established `X-sum` distribution.

### Files affected

Created: `variance-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — the Real Algebraic Shortcut

`\text{Var}(X) = E[(X - \mu)^2]$, where `\mu = E[X]$, is the real, direct definition — but computing it requires a distribution of *squared deviations*, an extra real step. A real, equivalent, more direct formula: `\text{Var}(X) = E[X^2] - \mu^2` — the expected value of `X`'s own square, minus the square of `X`'s own mean. Both real formulas give the identical real answer; the second needs only `X`'s own ordinary distribution, squared value by value, never a separately-built deviation distribution.

### The New Code — Type It Yourself

```scheme
(define (variance dist)
  (let* ((mu (expected-value dist))
         (sq-dist (map (lambda (pair) (cons (* (car pair) (car pair)) (cdr pair))) dist)))
    (- (expected-value sq-dist) (* mu mu))))
```

### The Updated Project

This is `variance-check.scm`, in full — Lesson 152 and 153's own real sample space, `X-sum`, `distribution`, and `expected-value`, quoted unchanged, with this unit's own `variance` added on top:

```scheme
(define die-faces (list 1 2 3 4 5 6))
(define two-dice-outcomes
  (apply append (map (lambda (d1) (map (lambda (d2) (cons d1 d2)) die-faces)) die-faces)))
(define (P ev) (/ (length ev) 36))
(define (X-sum outcome) (+ (car outcome) (cdr outcome)))
(define (distribution rv sample-space possible-values)
  (map (lambda (v) (cons v (P (filter (lambda (o) (= (rv o) v)) sample-space)))) possible-values))
(define (expected-value dist)
  (apply + (map (lambda (pair) (* (car pair) (cdr pair))) dist)))

(define (variance dist)                                              ; ← new
  (let* ((mu (expected-value dist))                                      ; ← new
         (sq-dist (map (lambda (pair) (cons (* (car pair) (car pair)) (cdr pair))) dist))) ; ← new
    (- (expected-value sq-dist) (* mu mu))))                                  ; ← new

(define sum-dist (distribution X-sum two-dice-outcomes (list 2 3 4 5 6 7 8 9 10 11 12))) ; ← new

(display "=== CU2: Var(X-sum), via formula, and via a real, direct average ===") (newline) ; ← new
(display "Var(X-sum) via formula: ") (display (exact->inexact (variance sum-dist))) (newline) ; ← new
(define mu (expected-value sum-dist))                                      ; ← new
(display "direct exhaustive Var(X-sum): ")                                    ; ← new
(display (exact->inexact (/ (apply + (map (lambda (o) (let ((v (X-sum o))) (* (- v mu) (- v mu)))) two-dice-outcomes)) 36))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (variance dist) (let* ((mu ...) (sq-dist ...)) (- (expected-value sq-dist) (* mu mu))))`** — first appearance in this lesson of this procedure; `mu` is `dist`'s own real mean, via `expected-value`, given full real treatment in this lesson's own Header; `sq-dist` builds a new real distribution by squaring each real value while keeping its own real probability unchanged.
- **`(map (lambda (pair) (cons (* (car pair) (car pair)) (cdr pair))) dist)`** — for every real `(value . probability)` pair, replaces `value` with `value²`, real probability untouched — the real distribution of `X²`, not `X`.
- **`(- (expected-value sq-dist) (* mu mu))`** — the real algebraic shortcut, executed directly: `E[X^2]$ minus `\mu^2}$.
- **`(let ((v (X-sum o))) (* (- v mu) (- v mu)))`** — the real, direct definitional computation, applied per real outcome: subtract the real mean, square the real result — `(X-\mu)^2}$, computed with no shortcut formula at all.
- **The real, exact `5.8333`, from both real paths** — direct, checked confirmation: the real algebraic shortcut and the real, literal, per-outcome definition agree exactly.

### CS Lens

This is Lesson 66's own real `fast-expt`-versus-`expt` discipline, applied to a probability formula rather than an algorithm: `variance`'s own real algebraic shortcut is checked directly against the real, literal, definitional computation it's derived from, not trusted purely on algebra.

### SE Lens

The alternative to deriving `variance` via the real algebraic shortcut is always computing `(X - \mu)^2$ directly for every real outcome, the way Concept Unit 2's own second real check does. The real value of the shortcut, confirmed correct here: it reuses `expected-value` and `distribution`, already fully built and trusted, rather than writing new, separate real machinery for handling squared deviations.

### Run It — Show the Real Output

```
$ guile variance-check.scm
=== CU2: Var(X-sum), via formula, and via a real, direct average ===
Var(X-sum) via formula: 5.833333333333333
direct exhaustive Var(X-sum): 5.833333333333333
```

Verified this session — `\text{Var}(X\text{-sum})$, computed via the real algebraic shortcut and via the real, literal per-outcome definition, agree exactly: `5.8333`.

---

## Concept Unit 3: Variance Adds — Sometimes Surprisingly

### The Problem

Lesson 153 showed expected value adds unconditionally. It's worth checking, honestly, whether variance behaves the identical way — starting with two genuinely independent random variables, then a real, second pair that only *looks* like it should behave differently.

### Reference Source

`d1`, `d2`, `I-doubles` — no reference counterpart to quote verbatim this session, since they are this lesson's own file, rebuilt fresh using Lesson 152's own already-established real constructions.

### Files affected

Modified: `variance-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (d1 outcome) (car outcome))
(define (d2 outcome) (cdr outcome))
(define (I-doubles outcome) (if (= (car outcome) (cdr outcome)) 1 0))
```

### The Updated Project

This is `variance-check.scm`, with Concept Unit 2's own file extended by two real checks:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (d1 outcome) (car outcome))                                  ; ← new
(define (d2 outcome) (cdr outcome))                                     ; ← new
(define (I-doubles outcome) (if (= (car outcome) (cdr outcome)) 1 0))      ; ← new
(define d1-dist (distribution d1 two-dice-outcomes (list 1 2 3 4 5 6)))       ; ← new
(define d2-dist (distribution d2 two-dice-outcomes (list 1 2 3 4 5 6)))          ; ← new
(define I-dist (distribution I-doubles two-dice-outcomes (list 0 1)))               ; ← new
(define (X-plus-Z outcome) (+ (d1 outcome) (I-doubles outcome)))                       ; ← new
(define sumZ-dist (distribution X-plus-Z two-dice-outcomes (list 1 2 3 4 5 6 7)))         ; ← new

(display "=== CU3: variance, adding for independent AND for one, real, surprising case ===") (newline) ; ← new
(display "Var(d1): ") (display (exact->inexact (variance d1-dist))) (newline)                       ; ← new
(display "Var(d1)+Var(d2): ") (display (exact->inexact (+ (variance d1-dist) (variance d2-dist)))) (newline) ; ← new
(display "Var(d1)+Var(I_doubles): ") (display (exact->inexact (+ (variance d1-dist) (variance I-dist)))) (newline) ; ← new
(display "real, direct Var(d1+I_doubles): ") (display (exact->inexact (variance sumZ-dist))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (d1 outcome) (car outcome))`, `(define (d2 outcome) (cdr outcome))`, `(define (I-doubles outcome) ...)`** — Lesson 152's own real random variables, given full real treatment in this lesson's own Header, rebuilt here.
- **`(define (X-plus-Z outcome) (+ (d1 outcome) (I-doubles outcome)))`** — first appearance in this lesson of this real, combined random variable.
- **The real, exact `5.8333` for `\text{Var}(d_1)+\text{Var}(d_2)$, matching `\text{Var}(X\text{-sum})$ from Concept Unit 2 exactly** — direct, checked confirmation that variance adds for these two, genuinely independent random variables.
- **The real, exact `3.0556` for both `\text{Var}(d_1)+\text{Var}(I_{\text{doubles}})$ and the real, direct `\text{Var}(d_1+I_{\text{doubles}})$** — direct, measured, surprising confirmation: variance adds correctly here too, even though `I_{\text{doubles}}$ is computed directly from `d_1$'s own value — real evidence worth explaining, not just accepting, in the real check below.

### Checking Why This Surprising Case Actually Works

`I_{\text{doubles}}$ being *computed from* `d_1$ does not automatically mean the two are dependent in the real, formal sense Lesson 150 defined: a real, direct independence check — `P(d_1{=}3) \times P(\text{doubles})$ against `P(d_1{=}3 \text{ and doubles})$ — gives `0.1667 \times 0.1667 = 0.0278`, matching `P(d_1{=}3 \text{ and doubles}) = 0.0278` exactly. For every one of `d1`'s own six possible values, exactly one of the six possible `d2` values makes it a double — real, perfect symmetry meaning `d1` and `I-doubles` are, formally, genuinely independent, despite `I-doubles`'s own definition mentioning `d1` directly.

### CS Lens

This is Lesson 150's own real "unrelated-looking events might not be independent, and related-looking ones might be" discipline, encountered from the opposite direction: `I-doubles` *looks* dependent on `d1`, since its own formula uses `d1` directly, but the real, formal independence check, run here exactly as Lesson 150 first derived it, proves otherwise.

### SE Lens

The alternative to running this real, formal independence check is trusting the real *appearance* of dependence (`I-doubles`'s own formula visibly uses `d1`) as sufficient evidence variance shouldn't add cleanly here. The real cost of that assumption: it would have wrongly predicted a real correction term was needed, when this unit's own real evidence shows none was.

### Run It — Show the Real Output

```
$ guile variance-check.scm
=== CU3: variance, adding for independent AND for one, real, surprising case ===
Var(d1): 2.9166666666666665
Var(d1)+Var(d2): 5.833333333333333
Var(d1)+Var(I_doubles): 3.0555555555555554
real, direct Var(d1+I_doubles): 3.0555555555555554
```

Verified this session — variance adds exactly for `d1` and `d2` (genuinely independent), and, surprisingly but correctly, for `d1` and `I-doubles` too, real evidence traced to a real, formal independence check, not mere appearance.

---

## Concept Unit 4: The Real, Honest Limit

### The Problem

Concept Unit 3's own real evidence might tempt a false real conclusion: "variance always adds, regardless of appearance." A real, genuinely correlated pair — not merely appearing related, but actually, provably sharing real information — needs checking directly.

### Reference Source

No reference counterpart — a real, direct check using `d1` and `X-sum`, given full real treatment above, a pair genuinely, structurally correlated since `X-sum` literally contains `d1` as one of its own two real additive components.

### Files affected

Modified: `variance-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (d1-plus-sum outcome) (+ (d1 outcome) (X-sum outcome)))
```

### The Updated Project

This is `variance-check.scm`, with Concept Unit 3's own file extended by a real, genuinely correlated pair:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (d1-plus-sum outcome) (+ (d1 outcome) (X-sum outcome)))      ; ← new
(define d1sum-dist (distribution d1-plus-sum two-dice-outcomes (list 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18))) ; ← new

(display "=== CU4: the real, honest limit — d1 and X-sum are genuinely correlated ===") (newline) ; ← new
(display "Var(d1)+Var(X-sum): ") (display (exact->inexact (+ (variance d1-dist) (variance sum-dist)))) (newline) ; ← new
(display "real, direct Var(d1+X-sum): ") (display (exact->inexact (variance d1sum-dist))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (d1-plus-sum outcome) (+ (d1 outcome) (X-sum outcome)))`** — first appearance in this lesson of this real, combined random variable; adds `d1`'s own value to the *entire sum*, `X-sum`, which already includes `d1` as one of its own two real terms.
- **`(distribution d1-plus-sum two-dice-outcomes (list 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18))`** — the identical real `distribution` call shape, with a real, wider range of possible values, since `d1 + X\text{-sum}$ can reach as high as `6 + 12 = 18`.
- **The real, exact `8.75` for `\text{Var}(d_1) + \text{Var}(X\text{-sum})$, against the real, exact `14.5833` for the direct `\text{Var}(d_1 + X\text{-sum})$** — direct, measured confirmation: these two real numbers genuinely disagree, by a substantial real margin, unlike every earlier pair this lesson checked.

### CS Lens

This is Lesson 150's own real independence-versus-appearance discipline, completed with its own real mirror image: Concept Unit 3 showed a real, dependent-*looking* pair that was actually independent; this unit shows a real, dependent-*looking* pair — `d1` and `X-sum`, which share `d1` as a literal, common real term — that genuinely is dependent, and variance's own additivity genuinely fails as a real, direct consequence.

### SE Lens

The alternative to running this real, final check is stopping at Concept Unit 3's own real, surprising success and concluding variance behaves like expected value, adding unconditionally. The real cost of that false conclusion: a real system computing the variance of a combined real quantity by simply summing two individually-computed variances — safe, unconditionally, for expected value, per Lesson 153 — would be silently, substantially wrong the moment the two real quantities being combined shared real, structural information, exactly as `d1` and `X-sum` do here.

### Run It — Show the Real Output

```
$ guile variance-check.scm
=== CU4: the real, honest limit — d1 and X-sum are genuinely correlated ===
Var(d1)+Var(X-sum): 8.75
real, direct Var(d1+X-sum): 14.583333333333334
```

Verified this session — `\text{Var}(d_1) + \text{Var}(X\text{-sum}) = 8.75`, while the real, direct `\text{Var}(d_1 + X\text{-sum}) = 14.5833` — a real, substantial disagreement, direct, honest evidence that variance's own additivity, unlike expected value's, genuinely requires the two combined random variables to be uncorrelated.

---

## Closing

### Connect the pieces

One real formula, one real surprising success, one real honest failure:

1. **The real gap, named (Unit 1):** a mean alone says nothing about spread.
2. **`variance`, derived and cross-checked (Unit 2):** `5.8333`, matching a completely independent, literal per-outcome computation.
3. **Variance adds, even surprisingly (Unit 3):** correctly, for `d1`/`d2` (independent) and, surprisingly but correctly, for `d1`/`I-doubles` (independent despite appearances).
4. **The real, honest limit (Unit 4):** `d1` and `X-sum`, genuinely correlated, break variance's own additivity by a real, substantial margin.

Every claim in this lesson traces to real, executed code: variance computed two independent real ways, checked across three real pairs of random variables, with a real, formal independence check explaining the one surprising success and a real, structural correlation explaining the one genuine failure.

### What breaks without this

Suppose a real system computed the variance of a combined real quantity — total real processing time across two pipeline stages, say — by simply adding each stage's own individually-measured variance, trusting Lesson 153's own real, unconditional linearity to extend automatically. This lesson's own real evidence shows exactly where that trust breaks: if the two stages' own real processing times are genuinely correlated (a slow first stage tending to produce a slow second stage too, the identical real structural relationship `d1` and `X-sum` share here), the real, true combined variance could be substantially larger than the naive sum — `14.5833` instead of `8.75`, a real, nearly `67\%` underestimate in this lesson's own specific numbers.

### Exercises

1. **Observe.** Before checking, predict whether `\text{Var}(d_2) + \text{Var}(X\text{-sum})$ would also disagree with the real, direct `\text{Var}(d_2 + X\text{-sum})$, using this lesson's own real Concept Unit 4 reasoning (that `X-sum` shares a real, literal term with the variable being added to it) to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Run Lesson 150's own real independence check on `d1` and `X-sum` directly, and confirm, with real code, that they fail it — direct, additional evidence for why Concept Unit 4's own variance sum disagreed.
4. **Explain.** In your own words, explain why `variance`'s own real algebraic shortcut, `E[X^2] - \mu^2`, needed `expected-value` to be called *twice* — once on the original distribution, once on the squared one — referencing what each of the two real calls actually computes.
5. **Explain.** Using this lesson's own real Concept Unit 3 and 4 evidence together, explain why "independence" is the real, correct condition to check before assuming variance adds, rather than "whether one variable's own formula visibly mentions the other" — referencing both the real success and the real failure this lesson found.

### Definition of done

- [ ] You can state the real variance formula, both the definitional form and the algebraic shortcut, and explain why they're equivalent.
- [ ] You can point to this lesson's own real `5.8333` result, confirmed two ways, as direct evidence variance is a real, well-defined, computable quantity.
- [ ] You can explain, using this lesson's own real, formal independence check, why variance added correctly for `d1` and `I-doubles` despite their surface appearance of dependence.
- [ ] You can explain, using this lesson's own real numbers, why variance's own additivity genuinely fails for `d1` and `X-sum`.
- [ ] You completed Exercises 1–5, including a real, checked independence test explaining Concept Unit 4's own failure.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
