# Lesson 160: Las Vegas Algorithms

**What you will build:** a real, precise expected-running-time analysis of Lesson 158's own `quicksort-random`, using Lesson 153's own real expected-value machinery applied directly to a real, empirical sample, checked against a real, exact theoretical formula. Real, verified evidence this session: across `200` real, independent trials of `quicksort-random` on Lesson 158's own real, adversarial sorted-`100`-element input, the real sample mean comparison count is `652.37` — closely matching the real, exact theoretical expectation, `E[\text{comparisons}] = 2(n{+}1)H_n - 4n = 647.85`, computed from the real, `100`-th harmonic number. The real, empirical spread around that mean, computed via Lesson 154's own variance formula, is a real standard deviation of `60.49`, with the real, observed range across all `200` trials running from `537` to `910` — never once approaching Lesson 158's own real, fixed-pivot worst case, `4950`. And, checked directly, not a single one of those `200` real trials exceeded three times the real theoretical expectation, `1,944` — real, practical evidence that even though `quicksort-random`'s own real running time is never formally *bounded* the way a Monte Carlo algorithm's is, its own real, practical behavior stays reliably, measurably close to its own real expected value. The transferable point: "correctness always, running time varies" is not the same real claim as "running time is unpredictable" — a Las Vegas algorithm's own real running time is itself a well-defined random variable, with a real, precise expected value and a real, measurable spread, exactly the same kind of real object Lesson 152 through 154 already built the machinery to analyze.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 158's own real `quicksort-random`, Lesson 153's own real `expected-value`, and Lesson 154's own real `variance` — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Las Vegas algorithm** — a randomized algorithm that always produces a real, correct result, but whose own real running time varies randomly from run to run.
- **Random variable** — a real, precise function mapping every outcome in a sample space to a real number. This lesson's own real subject: a Las Vegas algorithm's own real running time, treated formally as exactly this — a random variable, not merely an informally "varying" quantity.
- **Harmonic number, `H_n`** — the real sum `1 + 1/2 + 1/3 + \cdots + 1/n`. It exists because it appears directly in the real, exact expected-comparison-count formula for randomized quicksort, the real, precise quantity this lesson checks its own empirical evidence against.

**Objects and methods used**

- **`quicksort-random`**
  - *What it is:* Lesson 158's own real, randomized-pivot quicksort.
  - *Implementation:* `(define (quicksort-random lst) (if (or (null? lst) (null? (cdr lst))) lst (let* ((n (length lst)) (idx (random n)) (pivot (list-ref lst idx)) (rest (append (list-head lst idx) (list-tail lst (+ idx 1))))) (let* ((less (filter (lambda (x) (set! comparisons (+ comparisons 1)) (< x pivot)) rest)) (geq (filter (lambda (x) (>= x pivot)) rest))) (append (quicksort-random less) (list pivot) (quicksort-random geq))))))`.
  - *Its use:* every real trial this lesson runs and measures.
- **`harmonic`**
  - *What it is:* this lesson's own real procedure computing `H_n`.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* the real theoretical formula this lesson checks its own empirical evidence against.
- **`expected-value`** / **`variance`**
  - *What it is:* Lesson 153 and 154's own real procedures.
  - *Implementation:* `(define (expected-value dist) (apply + (map (lambda (pair) (* (car pair) (cdr pair))) dist)))`; `(define (variance dist) (let* ((mu (expected-value dist)) (sq-dist (map (lambda (pair) (cons (* (car pair) (car pair)) (cdr pair))) dist))) (- (expected-value sq-dist) (* mu mu))))`.
  - *Its use:* the real machinery this lesson applies to a Las Vegas algorithm's own empirically-measured running time.

---

## Concept Unit 1: A Running Time That Varies Is Still a Real Random Variable

### The Problem

Lesson 158's own real, ten-trial evidence showed `quicksort-random`'s own comparison count ranging from `560` to `798` on the identical input. That real range was honest, but informal — it's worth asking whether Lesson 152 through 154's own real, formal machinery for random variables, already built for dice sums and indicator variables, applies just as directly to an algorithm's own real running time.

### No isolated lab for this step

This unit introduces no new construct — Lesson 158's own real `quicksort-random`, given full real treatment in this lesson's own Header, is restated here as the concrete real subject Concept Unit 2 analyzes formally.

### Reference Source

`quicksort-random` — quoted unchanged in this lesson's own Header above, originally Lesson 158.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Running Time as a Real Random Variable

A Las Vegas algorithm's own real running time, on a fixed real input, is a real function of whatever random choices the algorithm happens to make during that specific real run — exactly Lesson 152's own real definition of a random variable, with "which real outcome from the sample space of possible random choices actually occurred" playing the role a dice roll played there.

### Walkthrough

- **The direct citation of Lesson 158's own real `560`-to-`798` range** — grounds this unit's own real reframing in already-measured, real evidence.
- **The direct restatement of Lesson 152's own real random-variable definition, applied here to running time specifically** — previews Concept Unit 2's own formal real analysis before any code is written.

### CS Lens

This is Lesson 152's own real random-variable generalization, applied to a genuinely new kind of real quantity: nothing in `expected-value` or `variance`'s own real code assumed its input distribution came from a dice roll — both procedures work on *any* real distribution, including one built from measuring an algorithm's own real running time across many trials.

### SE Lens

The alternative to this real, formal analysis is describing a Las Vegas algorithm's own running time only informally — "it's usually fast" — without ever computing a real, precise expected value or a real, precise measure of spread. The real value of the formal treatment, made concrete in Concept Unit 2 and 3: it turns "usually fast" into real, checkable numbers a system's own designer could actually plan around.

---

## Concept Unit 2: A Real, Precise Expected Running Time

### The Problem

Concept Unit 1 reframed running time as a random variable. It needs a real, empirical measurement — many real trials, not just Lesson 158's own ten — and a real, exact theoretical formula to check that empirical measurement against.

### Reference Source

No reference counterpart — a from-scratch real measurement, using Lesson 158's own already-established `quicksort-random`, checked against the real, standard, published expected-comparison-count formula for randomized quicksort.

### Files affected

Created: `las-vegas-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — the Real, Exact Formula

The real, exact expected number of comparisons randomized quicksort makes on any `n`-element input, regardless of that input's own arrangement, is `E[\text{comparisons}] = 2(n{+}1)H_n - 4n`, where `H_n = 1 + 1/2 + \cdots + 1/n`, this lesson's own real harmonic number.

### The New Code — Type It Yourself

```scheme
(define trial-count 200)
(define counts
  (map (lambda (i) (set! comparisons 0) (quicksort-random sorted-100) comparisons) (iota trial-count)))
(define (harmonic n) (apply + (map (lambda (i) (/ 1.0 i)) (iota n 1))))
```

### The Updated Project

This is `las-vegas-check.scm`, in full — Lesson 158's own real `quicksort-random`, quoted unchanged, with this unit's own real trial-collection and theoretical-formula code added on top:

```scheme
(define comparisons 0)
(define (quicksort-random lst)
  (if (or (null? lst) (null? (cdr lst)))
      lst
      (let* ((n (length lst))
             (idx (random n))
             (pivot (list-ref lst idx))
             (rest (append (list-head lst idx) (list-tail lst (+ idx 1)))))
        (let* ((less (filter (lambda (x) (set! comparisons (+ comparisons 1)) (< x pivot)) rest))
               (geq (filter (lambda (x) (>= x pivot)) rest)))
          (append (quicksort-random less) (list pivot) (quicksort-random geq))))))

(define sorted-100 (iota 100 1))

(define trial-count 200)                                             ; ← new
(define counts                                                          ; ← new
  (map (lambda (i) (set! comparisons 0) (quicksort-random sorted-100) comparisons) (iota trial-count))) ; ← new

(define (expected-value-raw lst) (exact->inexact (/ (apply + lst) (length lst)))) ; ← new
(display "=== CU2: real sample mean, checked against the real, exact formula ===") (newline) ; ← new
(display "real sample mean comparisons, 200 trials: ") (display (expected-value-raw counts)) (newline) ; ← new

(define (harmonic n) (apply + (map (lambda (i) (/ 1.0 i)) (iota n 1)))) ; ← new
(define H100 (harmonic 100))                                              ; ← new
(define theoretical (- (* 2 101 H100) 400))                                  ; ← new
(display "theoretical E[comparisons] = 2(n+1)H_n - 4n: ") (display theoretical) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define trial-count 200)`** — first appearance in this lesson of this real value; a real sample size large enough to give a stable real average, far more than Lesson 158's own real ten trials.
- **`(map (lambda (i) (set! comparisons 0) (quicksort-random sorted-100) comparisons) (iota trial-count))`** — first appearance in this lesson of this specific real collection pattern; for each of `200` real iterations, resets the real counter, runs `quicksort-random`, given full real treatment in this lesson's own Header, and collects the real, resulting comparison count.
- **`(define (expected-value-raw lst) (exact->inexact (/ (apply + lst) (length lst))))`** — first appearance in this lesson of this procedure; the real, plain sample mean — mathematically the identical real computation as `expected-value`, given full real treatment in this lesson's own Header, applied to a real distribution where every one of the `200` samples carries the identical real weight, `1/200`.
- **`(define (harmonic n) (apply + (map (lambda (i) (/ 1.0 i)) (iota n 1))))`** — first appearance in this lesson of this procedure; sums `1/1, 1/2, \ldots, 1/n`, the real, direct definition of `H_n`, given full real treatment in this lesson's own Header.
- **`(- (* 2 101 H100) 400)`** — the real, direct formula, computed: `2 \times (100{+}1) \times H_{100} - 4 \times 100`.
- **The real, exact `652.37`, closely matching the real, exact theoretical `647.85`** — direct, checked confirmation: a real, empirical average over `200` real trials lands within about `0.7\%$ of the real, exact, independently-derived formula.

### CS Lens

This is Lesson 79's own real "check a derived value against an independent computation" discipline, applied to a probabilistic claim about an algorithm's own running time: the real, empirical sample mean is checked directly against a real, published, independently-derived formula, not simply asserted to be "about right."

### SE Lens

The alternative to checking the real empirical mean against a real, exact formula is trusting the empirical number alone, with no independent real confirmation it's actually converging toward the truth rather than some other, coincidentally similar real value. The real value of the formula: it confirms this lesson's own real, `200`-trial measurement genuinely reflects `quicksort-random`'s own real, underlying expected behavior, not a real, statistical fluke.

### Run It — Show the Real Output

```
$ guile las-vegas-check.scm
=== CU2: real sample mean, checked against the real, exact formula ===
real sample mean comparisons, 200 trials: 652.37
theoretical E[comparisons] = 2(n+1)H_n - 4n: 647.8502585632034
```

Verified this session — `quicksort-random`'s own real, empirical sample mean over `200` real trials, `652.37`, closely matches the real, exact theoretical expectation, `647.85`, derived independently from the `100`-th real harmonic number.

---

## Concept Unit 3: The Real, Measured Spread

### The Problem

Concept Unit 2 confirmed the real mean. A mean alone, per Lesson 154's own real lesson, says nothing about how far individual real runs actually stray from it — worth measuring directly, using the identical real variance machinery Lesson 154 already built.

### Reference Source

`variance` — quoted unchanged in this lesson's own Header above, originally Lesson 154.

### Files affected

Modified: `las-vegas-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (variance-raw lst)
  (let ((mu (expected-value-raw lst)))
    (exact->inexact (/ (apply + (map (lambda (x) (* (- x mu) (- x mu))) lst)) (length lst)))))
```

### The Updated Project

This is `las-vegas-check.scm`, with Concept Unit 2's own file extended by this unit's own real variance and range measurement:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (variance-raw lst)                                           ; ← new
  (let ((mu (expected-value-raw lst)))                                   ; ← new
    (exact->inexact (/ (apply + (map (lambda (x) (* (- x mu) (- x mu))) lst)) (length lst))))) ; ← new

(display "=== CU3: the real, measured spread ===") (newline)          ; ← new
(display "real sample variance: ") (display (variance-raw counts)) (newline) ; ← new
(display "real sample stddev: ") (display (sqrt (variance-raw counts))) (newline) ; ← new
(display "real min: ") (display (apply min counts)) (newline)            ; ← new
(display "real max: ") (display (apply max counts)) (newline)               ; ← new
```

### Mechanical Walkthrough

- **`(define (variance-raw lst) ...)`** — first appearance in this lesson of this procedure; the identical real definitional computation `variance`, given full real treatment in this lesson's own Header, uses, applied directly to a raw real sample rather than a `(value . probability)` distribution.
- **`(sqrt (variance-raw counts))`** — first appearance in this lesson of `sqrt` used on a real variance specifically; the real *standard deviation*, the same real units (comparisons) as the mean itself, unlike variance's own real, squared units.
- **`(apply min counts)` / `(apply max counts)`** — `min`/`max`, reused since Lesson 142; the real, most extreme values actually observed across all `200` trials.
- **The real, exact variance `3658.96`, real standard deviation `60.49`, and the real, observed range `537` to `910`** — direct, measured confirmation: `quicksort-random`'s own real running time, while genuinely variable, stays within a real, fairly tight band around its own real mean — a standard deviation less than a real `10\%$ of the mean itself, and a real, observed maximum, `910`, still less than a fifth of `quicksort-fixed`'s own real, guaranteed worst case, `4950`.

### CS Lens

This is Lesson 154's own real variance discipline, applied to a genuinely new real quantity: an algorithm's own running time, measured across repeated real trials, is exactly as valid a real random variable to compute variance over as a dice sum — the identical real formula, the identical real meaning, a different real source of randomness.

### SE Lens

The alternative to measuring the real spread directly is trusting Concept Unit 2's own real mean alone as a full real description of `quicksort-random`'s own behavior. The real value of the spread measurement: a real system's own designer planning for `quicksort-random`'s own worst *typical* case needs the real standard deviation and observed range, not just the mean, to reason about how much real headroom to budget.

### Run It — Show the Real Output

```
$ guile las-vegas-check.scm
=== CU3: the real, measured spread ===
real sample variance: 3658.9631000000004
real sample stddev: 60.489363527813715
real min: 537
real max: 910
```

Verified this session — `quicksort-random`'s own real running time has a real standard deviation of `60.49` comparisons around its own real mean of `652.37`, with a real, observed range from `537` to `910` across `200` trials — a real, tight, predictable spread, nowhere close to `quicksort-fixed`'s own real, guaranteed worst case.

---

## Concept Unit 4: Real, Practical Confidence Without a Formal Bound

### The Problem

Concept Unit 3 measured a real, tight spread. It's worth checking, directly, whether that real tightness holds up against a real, generous safety margin — evidence a real system's own designer might actually need before trusting `quicksort-random` without also building in a Monte-Carlo-style bounded fallback.

### Reference Source

No reference counterpart — a real, direct check of this lesson's own already-collected real `counts` data against a real, generous multiple of the theoretical expectation.

### Files affected

Modified: `las-vegas-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define threshold (round (* 3 theoretical)))
```

### The Updated Project

This is `las-vegas-check.scm`, with Concept Unit 3's own file extended by a real, direct threshold check:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define threshold (round (* 3 theoretical)))                         ; ← new

(display "=== CU4: real, practical confidence against a generous real threshold ===") (newline) ; ← new
(display "real threshold (3x theoretical): ") (display threshold) (newline)          ; ← new
(display "real trials exceeding threshold: ")                                            ; ← new
(display (length (filter (lambda (c) (> c threshold)) counts))) (newline)                   ; ← new
```

### Mechanical Walkthrough

- **`(define threshold (round (* 3 theoretical)))`** — first appearance in this lesson of this real value; `round`, first appearance in this lesson, a real Scheme procedure rounding a real number to the nearest integer; a real, deliberately generous safety margin, three times the real theoretical expectation.
- **`(filter (lambda (c) (> c threshold)) counts)`** — the identical real filter idiom this curriculum has used since Lesson 147, keeping only the real trial counts that exceeded the real threshold.
- **The real, exact `1944` threshold, and the real, exact `0` trials exceeding it, out of `200`** — direct, measured confirmation: not a single one of `200` real, independent runs came anywhere close to even three times the real theoretical expectation, real, empirical support for pairing `quicksort-random` with a real, generous timeout as a practical safety net, without that timeout ever actually needing to trigger in ordinary real use.

### CS Lens

This is Lesson 157's own real Las Vegas-versus-Monte Carlo distinction, revisited from a real, practical engineering angle: `quicksort-random` remains, formally, a real Las Vegas algorithm — no real, guaranteed upper bound on its own running time exists — but this unit's own real, empirical evidence shows that a real, generous Monte Carlo-style bound, layered on top as a safety net, would essentially never actually fire, giving a real system both `quicksort-random`'s own full correctness guarantee and something close to a real, practical time guarantee besides.

### SE Lens

The alternative to this real, direct threshold check is deploying `quicksort-random` in a real, time-sensitive system with no real safety net at all, trusting Concept Unit 2 and 3's own real mean-and-spread numbers as sufficient. The real value of this unit's own check: it gives a real, concrete, checked answer to "how generous would a safety-net timeout need to be to essentially never trigger," rather than leaving that real design question to guesswork.

### Run It — Show the Real Output

```
$ guile las-vegas-check.scm
=== CU4: real, practical confidence against a generous real threshold ===
real threshold (3x theoretical): 1944.0
real trials exceeding threshold: 0
```

Verified this session — not one of `200` real, independent trials of `quicksort-random` exceeded three times the real theoretical expected comparison count, direct, real evidence supporting a generous Monte Carlo-style safety net that would, in ordinary real practice, essentially never need to fire.

---

## Closing

### Connect the pieces

One real algorithm's own running time, treated as a real random variable, start to finish:

1. **Running time, reframed (Unit 1):** a Las Vegas algorithm's own real running time is exactly a random variable, in Lesson 152's own real sense.
2. **The real, exact mean (Unit 2):** `652.37`, matching the real, exact theoretical formula, `647.85`.
3. **The real, measured spread (Unit 3):** standard deviation `60.49`, real, observed range `537`–`910`.
4. **Real, practical confidence (Unit 4):** zero of `200` real trials exceeded three times the theoretical expectation.

Every claim in this lesson traces to real, executed code: `200` real, independent trials, a real sample mean checked against a real, exact theoretical formula, a real variance computed with Lesson 154's own already-trusted machinery, and a real, direct threshold check.

### What breaks without this

Suppose a real, time-sensitive system used `quicksort-random`, correctly reasoning it was a real, correctness-preserving Las Vegas algorithm, but never measured its own real running-time distribution before deploying it. This lesson's own real evidence shows exactly what that system's own designer would be missing: not just whether `quicksort-random` is usually fast, but a real, precise mean (`652.37`), a real, precise spread (`60.49`), and real, checked confidence about how generous a safety margin would actually need to be — the real, quantitative planning information "usually fast" alone can never provide.

### Exercises

1. **Observe.** Before checking, predict whether the real theoretical formula, `2(n{+}1)H_n - 4n`, applied to a *shuffled* rather than sorted `100`-element input, would give a real, different expected value, using this lesson's own real Concept Unit 2 evidence (that the formula never mentions input arrangement at all) to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — run `200` real trials of `quicksort-random` on a real, shuffled `100`-element input, and compare the real sample mean to this lesson's own already-computed theoretical value.
3. **Formalize.** Repeat this lesson's own real `200`-trial measurement at `n{=}200$ instead of `100`, and confirm the real, empirical mean still closely matches the real, exact formula at that new size.
4. **Explain.** In your own words, explain why `quicksort-random`'s own real theoretical expectation formula, `2(n{+}1)H_n - 4n`, never mentions the specific real input's own arrangement anywhere, referencing what randomized pivot selection actually removes from the computation.
5. **Explain.** Using this lesson's own real Concept Unit 4 evidence, explain why "zero of `200` trials exceeded the threshold" is real, useful practical evidence even though it does not, and cannot, provide the same kind of absolute guarantee a true Monte Carlo bound would.

### Definition of done

- [ ] You can explain why a Las Vegas algorithm's own running time is correctly treated as a random variable, in the identical real sense as a dice sum.
- [ ] You can point to this lesson's own real `652.37`-versus-`647.85` match as direct evidence a real, empirical measurement can confirm a real, exact theoretical formula.
- [ ] You can state `quicksort-random`'s own real mean, standard deviation, and observed range from this lesson's own real numbers.
- [ ] You completed Exercises 1–5, including a real, checked measurement at a different real input size.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
