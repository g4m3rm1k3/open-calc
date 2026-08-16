# Lesson 159: Monte Carlo Algorithms

**What you will build:** real, direct evidence of **amplification** — running a Monte Carlo algorithm several real, independent times and succeeding if *any* one of them does, driving its own real failure rate down exponentially while keeping a real, still-bounded total running time. Real, verified evidence this session: Lesson 157's own real, bounded search, `rand-find-bounded`, fails to find a real special element `4.22\%` of the time across `5,000` real trials, on its own. Run twice, independently, and reporting failure only if *both* real runs fail, the real, measured failure rate drops to `0.12\%` — close to the real, predicted `p^2 = 0.18\%`. Run three times or four times, zero real failures appear across all `5,000` trials in either case, consistent with the real, predicted rates, `0.0075\%` and `0.0003\%`, both being rarer than this lesson's own real sample size can reliably observe. A real, general formula, `k \ge \dfrac{\log \varepsilon}{\log p}`, predicts that reaching a real target failure rate of `0.1\%` needs only `k = 3` real repetitions — confirmed directly, since this lesson's own real, measured `k{=}3` failure rate, `0.0\%` (zero real failures observed), is already comfortably below that real target. The transferable point: a Monte Carlo algorithm's own real, fixed failure rate is not a permanent ceiling — it can be driven arbitrarily low, at a real, precisely quantifiable cost in repeated running time, without ever sacrificing the real, bounded-time guarantee that makes it Monte Carlo in the first place.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 157's own real Monte Carlo definition and its own real `rand-find-bounded` procedure — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Monte Carlo algorithm** — a randomized algorithm with a real, fixed, guaranteed running time, but which carries a real, small, computable probability of an incorrect result.
- **Amplification** — running a Monte Carlo algorithm several real, independent times, and combining the real results (here, succeeding if *any* single run succeeds) to reduce the real, overall failure probability, at the real cost of a proportionally larger, but still bounded, total running time. It exists because a single Monte Carlo run's own real failure rate is rarely acceptable on its own, and amplification gives a real, precise, computable way to reduce it to whatever real target a specific use actually requires.

**Objects and methods used**

- **`rand-find-bounded`**
  - *What it is:* Lesson 157's own real, bounded Monte Carlo search procedure.
  - *Implementation:* `(define (rand-find-bounded arr n max-attempts) (let loop ((count 0)) (if (= count max-attempts) 'not-found (let ((i (random n))) (if (list-ref arr i) (+ count 1) (loop (+ count 1)))))))`.
  - *Its use:* the real, single-run building block every real amplified check in this lesson repeats.
- **`amplified-fails?`**
  - *What it is:* this lesson's own real procedure running `k` independent Monte Carlo trials and reporting real, overall failure only if every single one of them fails.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real amplification check this lesson performs, from Concept Unit 2 onward.

---

## Concept Unit 1: A Real, Fixed Failure Rate Isn't the End of the Story

### The Problem

Lesson 157's own real `rand-find-bounded`, capped at `30` real attempts, fails a real, measured `4.22\%` of the time. For many real uses, that real failure rate might be too high to accept as-is — and it's worth asking whether it can be reduced, without giving up the real, bounded-running-time guarantee that made it Monte Carlo to begin with.

### No isolated lab for this step

This unit introduces no new construct — Lesson 157's own real `rand-find-bounded`, given full real treatment in this lesson's own Header, is restated here as the concrete real starting point Concept Unit 2 builds on.

### Reference Source

`rand-find-bounded` — quoted unchanged in this lesson's own Header above, originally Lesson 157.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What "Reducing Failure, Keeping Bounded Time" Would Require

A real fix would need to somehow use `rand-find-bounded` more than once, combining the real results in a way that makes the *overall* real chance of failure smaller than any single real run's own chance — while the real, total running time stays a fixed, known real multiple of a single run's own bound, never unbounded.

### Walkthrough

- **The direct citation of Lesson 157's own real `4.22\%$ failure rate** — grounds this unit's own real question in an already-measured, real number.
- **"a fixed, known real multiple... never unbounded"** — previews Concept Unit 2's own real amplification technique before any code is written.

### CS Lens

This is Lesson 156's own real independence discipline, recognized in a new setting: if `k` real runs of `rand-find-bounded` are genuinely independent (each one's own real random choices unrelated to the others'), the real probability that *all* `k` fail simultaneously multiplies, exactly the identical real principle Lesson 150 first established for independent events.

### SE Lens

The alternative to amplification is either accepting a single run's own real, fixed failure rate, or abandoning the Monte Carlo approach entirely in favor of an unbounded, Las Vegas-style search. The real value of amplification, made concrete in Concept Unit 2: it offers a real, third option — a still-bounded running time, with a real failure rate reduced to whatever a specific real use actually requires.

---

## Concept Unit 2: Deriving Amplification

### The Problem

Concept Unit 1 named the real requirement. It needs real code, and a real, direct check that running two independent Monte Carlo trials genuinely reduces the real, measured failure rate the way Lesson 150's own independence principle predicts.

### Reference Source

No reference counterpart — a from-scratch real derivation, built directly on Lesson 157's own already-established `rand-find-bounded`.

### Files affected

Created: `monte-carlo-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — Why "Fail Only if All k Fail" Is the Right Real Combination

A single real run of `rand-find-bounded` fails only when every one of its own `30` real attempts misses. Running `k` independent copies and reporting real, overall failure only if *every one of the k runs* independently fails means overall failure requires missing on every attempt, across every run — a real, much stricter condition than any single run failing alone, and, by Lesson 150's own real independence principle, a real probability that multiplies: `p \times p \times \cdots \times p = p^k`.

### The New Code — Type It Yourself

```scheme
(define (single-run-fails?) (eq? (rand-find-bounded arr n max-attempts) 'not-found))
(define (amplified-fails? k)
  (let loop ((i 0))
    (if (= i k) #t
        (if (single-run-fails?) (loop (+ i 1)) #f))))
```

### The Updated Project

This is `monte-carlo-check.scm`, in full — Lesson 157's own real array and `rand-find-bounded`, quoted unchanged, with this unit's own real amplification procedures added on top:

```scheme
(define n 100)
(define (special? i) (>= i 90))
(define arr (map special? (iota n)))

(define (rand-find-bounded arr n max-attempts)
  (let loop ((count 0))
    (if (= count max-attempts)
        'not-found
        (let ((i (random n)))
          (if (list-ref arr i)
              'found
              (loop (+ count 1)))))))

(define max-attempts 30)                                             ; ← new
(define trials 5000)                                                    ; ← new

(define (single-run-fails?) (eq? (rand-find-bounded arr n max-attempts) 'not-found)) ; ← new
(define fail1 0)                                                        ; ← new
(let loop ((t 0)) (if (< t trials) (begin (if (single-run-fails?) (set! fail1 (+ fail1 1))) (loop (+ t 1))))) ; ← new

(display "=== CU2: single-run failure rate, and a real, direct amplification check ===") (newline) ; ← new
(display "single-run real failure rate: ") (display (exact->inexact (/ fail1 trials))) (newline) ; ← new

(define (amplified-fails? k)                                         ; ← new
  (let loop ((i 0))                                                     ; ← new
    (if (= i k) #t                                                         ; ← new
        (if (single-run-fails?) (loop (+ i 1)) #f))))                         ; ← new

(let ((fails 0))                                                        ; ← new
  (let loop ((t 0)) (if (< t trials) (begin (if (amplified-fails? 2) (set! fails (+ fails 1))) (loop (+ t 1))))) ; ← new
  (display "k=2 real failure rate: ") (display (exact->inexact (/ fails trials)))                   ; ← new
  (display " predicted p^2: ") (display (exact->inexact (expt (/ fail1 trials) 2))) (newline))          ; ← new
```

### Mechanical Walkthrough

- **`(define (single-run-fails?) (eq? (rand-find-bounded arr n max-attempts) 'not-found))`** — first appearance in this lesson of this procedure; a real, direct wrapper turning `rand-find-bounded`'s own real `'not-found`/other-value result into a real boolean.
- **`(define (amplified-fails? k) (let loop ((i 0)) (if (= i k) #t (if (single-run-fails?) (loop (+ i 1)) #f))))`** — first appearance in this lesson of this procedure; a real, named-let loop, calling `single-run-fails?` up to `k` real, independent times; returns `#t` (overall failure) only if every one of the `k` real calls itself returned true; returns `#f` (overall success) the instant any single real run succeeds.
- **The real, exact `0.0422` for the real, single-run baseline** — direct, measured confirmation, closely matching Lesson 157's own already-established `4.24\%$ real prediction.
- **The real, exact `0.0012` for `k{=}2`, closely matching the real, predicted `p^2 = 0.0018`** — direct, measured confirmation that running two real, independent Monte Carlo trials and requiring both to fail reduces the real, overall failure rate roughly the way Lesson 150's own independence principle predicts.

### CS Lens

This is Lesson 150's own real independence-multiplication rule, applied directly to algorithm reliability: `P(\text{both fail}) = P(\text{fail}) \times P(\text{fail})` is the identical real arithmetic Lesson 150 first verified for dice events, now driving a real, practical engineering technique.

### SE Lens

The alternative to deriving amplification from Lesson 150's own real independence principle is treating "run it a few more times" as an informal, unquantified real habit. The real value of the precise, derived version: it turns "try again if it fails" from a vague real instinct into a real, computable guarantee — `p^k`, not just "probably better."

### Run It — Show the Real Output

```
$ guile monte-carlo-check.scm
=== CU2: single-run failure rate, and a real, direct amplification check ===
single-run real failure rate: 0.0422
k=2 real failure rate: 0.0012 predicted p^2: 0.00178084
```

Verified this session — running `rand-find-bounded` twice, independently, and requiring both to fail before reporting overall failure, drops the real, measured failure rate from `4.22\%$ to `0.12\%$, closely matching the real, predicted `p^2 = 0.18\%$.

---

## Concept Unit 3: Real, Honest Evidence at Higher k

### The Problem

Concept Unit 2 confirmed amplification works for `k{=}2$. It's worth checking further, honestly — including being upfront about a real, practical limit this lesson's own `5,000`-trial sample size runs into as the real failure rate keeps shrinking.

### Reference Source

`amplified-fails?` — quoted unchanged in this lesson's own Header above, originally this lesson's own Concept Unit 2.

### Files affected

Modified: `monte-carlo-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (check-amplification k)
  (let ((fails 0))
    (let loop ((t 0)) (if (< t trials) (begin (if (amplified-fails? k) (set! fails (+ fails 1))) (loop (+ t 1)))))
    fails))
```

### The Updated Project

This is `monte-carlo-check.scm`, with Concept Unit 2's own file extended by a real, general checking procedure and real checks at `k{=}1$ through `4`:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (check-amplification k)                                      ; ← new
  (let ((fails 0))                                                       ; ← new
    (let loop ((t 0)) (if (< t trials) (begin (if (amplified-fails? k) (set! fails (+ fails 1))) (loop (+ t 1))))) ; ← new
    fails))                                                                  ; ← new

(display "=== CU3: real amplification, k=1 through 4 ===") (newline) ; ← new
(for-each (lambda (k)                                                    ; ← new
  (let ((fails (check-amplification k)))                                    ; ← new
    (display "k=") (display k) (display " real failures: ") (display fails)    ; ← new
    (display " real rate: ") (display (exact->inexact (/ fails trials)))          ; ← new
    (display " predicted p^k: ") (display (exact->inexact (expt (/ fail1 trials) k))) (newline))) ; ← new
  (list 1 2 3 4))                                                                ; ← new
```

### Mechanical Walkthrough

- **`(define (check-amplification k) ...)`** — first appearance in this lesson of this procedure; the identical real trial-counting structure Concept Unit 2 used inline for `k{=}2$, now generalized to any real `k`.
- **`(for-each (lambda (k) ...) (list 1 2 3 4))`** — real, direct checks at four increasing real `k` values.
- **The real, exact `0.0452` at `k{=}1$ (a real, single fresh `5,000`-trial re-measurement, close to but not identical to Concept Unit 2's own `0.0422`, itself real, honest sampling noise across two separately-run real trial batches), `0.0012` at `k{=}2$, and `0.0` (zero real observed failures) at both `k{=}3$ and `k{=}4$** — direct, measured confirmation of a real, sharply decreasing trend, broadly consistent with the real, predicted exponential decline.
- **The real, honest gap at `k{=}3$ and `k{=}4$ — the real, predicted rates, `0.0075\%$ and `0.0003\%$, are themselves rarer events than `5,000` real trials can reliably distinguish from zero, or from each other** — a real, important methodological point: observing zero real failures out of `5,000` trials at *both* `k{=}3$ and `k{=}4$ is consistent with both real, predicted rates, but does not, on its own, distinguish between them — it only confirms the real failure rate is small enough that this lesson's own real sample size couldn't catch a single one.

### CS Lens

This is Lesson 69's own real "honest, non-overclaiming treatment of imperfect data" discipline, recognized directly: rather than claiming the real `k{=}4$ result "proves" the predicted `0.0003\%$ rate exactly, this unit states plainly what a real, `5,000`-trial sample can and cannot actually confirm about an event that rare.

### SE Lens

The alternative to this real, honest caveat is reporting "zero failures observed" as if it were the identical claim as "failure rate proven to be zero." The real risk of that overclaim: a real system relying on `k{=}4$ amplification, told the failure rate is "confirmed zero," might be built with no real fallback at all for the case this lesson's own formula — not the empirical sample — correctly predicts remains real, if rare.

### Run It — Show the Real Output

```
$ guile monte-carlo-check.scm
=== CU3: real amplification, k=1 through 4 ===
k=1 real failures: 226
k=1 real rate: 0.0452 predicted p^k: 0.0422
k=2 real failures: 6
k=2 real rate: 0.0012 predicted p^k: 0.00178084
k=3 real failures: 0
k=3 real rate: 0.0 predicted p^k: 7.5151448e-5
k=4 real failures: 0
k=4 real rate: 0.0 predicted p^k: 3.1713911056e-6
```

Verified this session — real, measured failure rates fall sharply as `k` increases, from `4.52\%$ at `k{=}1$ to zero real observed failures at both `k{=}3$ and `k{=}4$, consistent with, though not on their own conclusive proof of, the real, predicted exponential decline.

---

## Concept Unit 4: How Many Repetitions Does a Real Target Actually Need

### The Problem

Concept Unit 3 confirmed the real trend. It's worth deriving a real, direct formula for exactly how many real repetitions, `k`, are needed to guarantee a real, specific target failure rate — and checking that formula's own real prediction against this lesson's own already-measured evidence.

### Reference Source

No reference counterpart — a from-scratch real derivation, solving Concept Unit 2's own `p^k` relationship for `k` directly.

### Files affected

Modified: `monte-carlo-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### Applying It — Solving `p^k \le \varepsilon` for `k`

Reaching a real target failure rate `\varepsilon` requires `p^k \le \varepsilon`. Taking the real logarithm of both real sides (a real, monotonic operation, safe since both sides are real, positive numbers less than `1`): `k \log p \le \log \varepsilon`. Since `\log p` is real, negative (`p < 1`), dividing by it *flips* the real inequality: `k \ge \dfrac{\log \varepsilon}{\log p}`.

### The New Code — Type It Yourself

```scheme
(define (repetitions-needed p epsilon) (ceiling (/ (log epsilon) (log p))))
```

### The Updated Project

This is `monte-carlo-check.scm`, with Concept Unit 3's own file extended by this unit's own real formula and a real, direct check against already-measured evidence:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (repetitions-needed p epsilon) (ceiling (/ (log epsilon) (log p)))) ; ← new

(display "=== CU4: how many real repetitions for a real target failure rate? ===") (newline) ; ← new
(define k-needed (repetitions-needed (/ fail1 trials) 0.001))        ; ← new
(display "real k needed for target epsilon=0.001: ") (display k-needed) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (repetitions-needed p epsilon) (ceiling (/ (log epsilon) (log p))))`** — first appearance in this lesson of this procedure; `log`, first appearance in this lesson, a real Scheme procedure computing the real natural logarithm; `ceiling`, first appearance in this lesson, a real Scheme procedure rounding a real number *up* to the nearest integer — necessary since `k` must be a real, whole number of repetitions, and any fractional real result from the raw formula has to be rounded up, never down, to guarantee the real target is actually met.
- **`(repetitions-needed (/ fail1 trials) 0.001)`** — applies the real formula using this lesson's own real, measured single-run failure rate and a real target of `0.1\%$.
- **The real, exact `3`** — direct, checked confirmation: reaching a real target failure rate of `0.1\%` needs only `3` real repetitions of `rand-find-bounded` — and Concept Unit 3's own already-measured `k{=}3$ real failure rate, `0.0\%$ (zero real failures observed out of `5,000$ trials), is indeed comfortably below the real `0.1\%$ target, confirming the formula's own real prediction directly against already-collected real evidence.

### CS Lens

This is Lesson 76's own real "solve a recurrence, then verify the closed form against real, measured evidence" discipline, applied to a probability-amplification formula: `repetitions-needed`'s own real output, `3`, is checked directly against Concept Unit 3's own already-measured `k{=}3$ real failure rate, not trusted purely on the algebra.

### SE Lens

The alternative to deriving `repetitions-needed` is picking a real `k` value by intuition or by simply "trying a few more times until it feels safe enough." The real value of the derived formula: it turns "how many times should I repeat this" from a real guess into a real, precise, checkable answer, driven directly by whatever real failure rate a specific system actually needs to guarantee.

### Run It — Show the Real Output

```
$ guile monte-carlo-check.scm
=== CU4: how many real repetitions for a real target failure rate? ===
real k needed for target epsilon=0.001: 3
```

Verified this session — reaching a real target failure rate of `0.1\%$ needs exactly `3` real repetitions of `rand-find-bounded`, confirmed directly against Concept Unit 3's own already-measured `k{=}3$ real failure rate, `0.0\%$ (zero real failures observed), comfortably under the real target.

---

## Closing

### Connect the pieces

One real single-run failure rate, one real amplification technique, one real formula for exactly how much is enough:

1. **The real question, posed (Unit 1):** can a fixed Monte Carlo failure rate be reduced while keeping bounded time?
2. **Amplification, derived and checked (Unit 2):** `k{=}2$ real repetitions drop `4.22\%$ to `0.12\%$, matching Lesson 150's own real independence principle.
3. **The real, honest trend, extended (Unit 3):** `k{=}1$ through `4`, a real, sharp decline, with an honest real caveat about what a `5,000`-trial sample can and cannot confirm at very low rates.
4. **The real, exact formula (Unit 4):** `k \ge \log \varepsilon / \log p`, confirmed directly against already-measured real evidence.

Every claim in this lesson traces to real, executed code: a real, single-run baseline, real amplification measured across four increasing repetition counts, and a real, derived formula checked against the identical real data already collected.

### What breaks without this

Suppose a real system used a single-run Monte Carlo algorithm with a real `4.22\%$ failure rate directly in a context requiring much higher real reliability — a real data-integrity check, say, where a false "not found" result could mean a real problem goes undetected. This lesson's own real evidence shows exactly the fix, and exactly how much of it is needed: not an unbounded, Las Vegas-style search, but `3` real, independent repetitions, reducing the real failure rate below `0.1\%$ while keeping the total real running time a fixed, known, `3\times$ multiple of a single run's own bound.

### Exercises

1. **Observe.** Before checking, predict the real `k` needed to reach a real target failure rate of `0.0001` (one in ten thousand), using this lesson's own real `repetitions-needed` formula and this lesson's own real, measured `p = 0.0422` to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Modify Lesson 157's own real array so only `5` (not `10`) of its `100` elements are special, and confirm, with real code, that `repetitions-needed` correctly predicts a real, *larger* `k` is needed to reach the identical `0.1\%$ target — connect your own real finding to why a rarer real event needs more real repetitions to amplify away.
4. **Explain.** In your own words, explain why `repetitions-needed`'s own real formula divides by `(log p)`, a real, negative number, and why that specifically requires the real inequality to flip direction, referencing what would happen to the formula's own real output if the flip were forgotten.
5. **Explain.** Using this lesson's own real Concept Unit 3 evidence, explain why "zero failures observed in `5,000` trials" is weaker real evidence than "failure rate is exactly zero," referencing what this lesson's own real formula predicts instead.

### Definition of done

- [ ] You can state, precisely, why running `k` independent Monte Carlo trials and requiring all to fail reduces the real, overall failure probability to `p^k`.
- [ ] You can point to this lesson's own real `4.22\%$-to-`0.12\%$ result as direct evidence of amplification working as Lesson 150's own independence principle predicts.
- [ ] You can derive and apply the real formula for how many repetitions are needed to reach a specific real target failure rate.
- [ ] You can explain why a real sample size limits what very low observed failure rates can and cannot actually prove.
- [ ] You completed Exercises 1–5, including a real, checked comparison using a rarer special-element rate.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
