# Lesson 151: Bayes' Rule

**What you will build:** **Bayes' Rule** — a real, derived formula converting `P(B \mid A)` into `P(A \mid B)`, without ever rebuilding a restricted sample space from scratch. Real, verified evidence this session: given only `P(\text{even-sum} \mid \text{doubles}) = 1.0` (a real, easy fact — every double sums to an even number, by definition) and the two real, individual probabilities `P(\text{doubles}) = 0.1667` and `P(\text{even-sum}) = 0.5`, Bayes' Rule computes `P(\text{doubles} \mid \text{even-sum}) = 0.3333` — the exact real number Lesson 149 found by literally restricting the sample space to `18` real outcomes and recounting, now reached by a completely different, purely algebraic real path. Applied to a real, explicit population of `200` balls — `20` real red, `180` real blue, a real detector correctly flagging `90\%` of red balls and incorrectly flagging `10\%` of blue ones — real, exhaustive counting shows that among every ball the detector actually flags, only `50\%` are genuinely red, confirmed exactly by Bayes' Rule computed independently from the same real numbers. And, real, honestly explored further: as the real population's own red fraction shrinks from `100` in `200` down to `2` in `200`, the real posterior probability of a flagged ball actually being red falls from `0.9` all the way to `0.0909` — the identical `90\%`-accurate detector, six real, different real answers, depending entirely on how rare red actually is. The transferable point: a conditional probability's own reverse direction is never free — it has to be paid for with real, specific information about how common each event is on its own, and a "highly accurate" real test can still produce a real, mostly-wrong answer when what it's testing for is rare enough.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 149's own real conditional-probability ratio formula and its own real, already-established asymmetry between `P(\text{doubles} \mid \text{even-sum})` and `P(\text{even-sum} \mid \text{doubles})` — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Sample space (Ω)** — the real, complete set of every possible outcome of a real random process.
- **Event** — a real, precise subset of a sample space.
- **Conditional probability, `P(A | B)`** — the real probability that event `A` occurs, given that event `B` is already known to have occurred.
- **Bayes' Rule** — the real, derived identity `P(A \mid B) = \dfrac{P(B \mid A) \times P(A)}{P(B)}`. It exists to compute one conditional probability from its own reverse direction, using only three real, individually-measurable quantities — `P(B \mid A)`, `P(A)`, and `P(B)` — without needing to reconstruct any restricted sample space directly.
- **Prior probability** — a real event's own probability *before* any conditioning information is taken into account — `P(A)` on its own, standing for what's real and known ahead of any real evidence.
- **Posterior probability** — a real event's own probability *after* real, conditioning information has been incorporated — `P(A \mid B)`, the real, updated belief Bayes' Rule computes.
- **Base rate** — how common a real event genuinely is within the whole real population it's drawn from, independent of any real test or detector applied to it. It exists to name, precisely, the real quantity this lesson's own Concept Unit 4 shows has a dramatic real effect on a real test's own posterior reliability.

**Objects and methods used**

- **`bayes`**
  - *What it is:* this lesson's own real procedure computing `P(A \mid B)` from `P(B \mid A)`, `P(A)`, and `P(B)`.
  - *Implementation:* `(define (bayes p-b-given-a p-a p-b) (/ (* p-b-given-a p-a) p-b))` — the real, direct translation of this lesson's own derived formula into code.
  - *Its use:* every real, reverse-direction conditional probability this lesson computes, from Concept Unit 2 onward.
- **`iota`** / **`append`** / **`filter`** / **`length`**
  - *What it is:* real Scheme procedures, reused unchanged from earlier lessons — `iota` builds a real list of consecutive integers; `append` joins real lists; `filter` keeps only real elements satisfying a predicate; `length` counts a real list's own elements.
  - *Implementation:* each takes the real arguments its own earlier-established contract specifies, returning a new real list or a real count accordingly.
  - *Its use:* Concept Unit 3's own real, explicit population of `200` real balls, and every real count taken from it.

---

## Concept Unit 1: A Real Question With Two Ways to Answer It

### The Problem

Lesson 149 computed `P(\text{doubles} \mid \text{even-sum}) = 0.3333` by literally restricting the sample space to the `18` real even-sum outcomes and recounting doubles within it. That real approach works, but it required rebuilding a real, restricted universe from scratch. A genuinely different real question: given only the real, *reverse* conditional probability, `P(\text{even-sum} \mid \text{doubles}) = 1.0` — a real fact that's actually easier to state outright, since every double provably sums to an even number — plus the two real, individual probabilities of doubles and even-sum on their own, can the identical real answer, `0.3333`, be reached without ever touching the underlying sample space again?

### No isolated lab for this step

This unit introduces no new construct — Lesson 149's own real, already-established numbers are restated here as this lesson's own real motivation, not re-derived.

### Reference Source

No reference counterpart — the real motivating question is restated directly from Lesson 149's own real evidence.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Would Have to Be True

For this to work, there would need to be a real, algebraic relationship connecting all four real quantities — `P(A \mid B)`, `P(B \mid A)`, `P(A)`, and `P(B)` — precise enough to solve for any one of them given the other three. Concept Unit 2 derives exactly that relationship directly from Lesson 149's own already-established formula.

### Walkthrough

- **The direct citation of Lesson 149's own real `0.3333` and `1.0`** — grounds this unit's own real question in already-verified numbers, not an abstract example.
- **"a real, algebraic relationship... precise enough to solve for any one of them"** — previews Concept Unit 2's own real derivation before any code is written.

### CS Lens

This is Lesson 76's own real algebraic-manipulation discipline, applied to a probability identity instead of a recurrence: exactly as Lesson 76 solved `binary-search`'s own recurrence by repeated substitution, this unit's own real question is answered by algebraic substitution into Lesson 149's own already-derived formula, not a fresh, unrelated derivation.

### SE Lens

The alternative to deriving a real, general relationship is treating every new "reverse the conditioning direction" question as its own, separate real problem, solvable only by rebuilding a restricted sample space each time. The real cost of that alternative, made concrete in Concept Unit 3: a real population of `200` balls is small enough to enumerate directly, but a real population of millions would make Lesson 149's own restriction approach real, genuinely expensive — Bayes' Rule, once derived, answers the identical real question from three numbers alone, regardless of how large the underlying real population actually is.

---

## Concept Unit 2: Deriving Bayes' Rule

### The Problem

Concept Unit 1 named the real question. Lesson 149's own real ratio formula, applied in both real directions to the identical real intersection, gives exactly the real algebraic relationship needed.

### Reference Source

Lesson 149's own real ratio formula — quoted here for direct derivation: `P(A \mid B) = P(A \cap B) / P(B)`, and, applied with the roles of `A` and `B` reversed, `P(B \mid A) = P(A \cap B) / P(A)`.

### Files affected

Created: `bayes-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — Solving Both Real Equations for the Identical Real Quantity

Both of Lesson 149's own real formulas involve the identical real quantity, `P(A \cap B)`. Solving each for it: `P(A \cap B) = P(A \mid B) \times P(B)`, and also `P(A \cap B) = P(B \mid A) \times P(A)`. Since both real expressions equal the identical real number, they equal each other: `P(A \mid B) \times P(B) = P(B \mid A) \times P(A)`. Dividing both real sides by `P(B)` gives Bayes' Rule directly: `P(A \mid B) = \dfrac{P(B \mid A) \times P(A)}{P(B)}`.

### The New Code — Type It Yourself

```scheme
(define (bayes p-b-given-a p-a p-b) (/ (* p-b-given-a p-a) p-b))
```

### The Updated Project

This is `bayes-check.scm`, in full — Lesson 147 and 148's own real sample space and events, quoted unchanged, with this unit's own real Bayes' Rule procedure and a real, direct check against Lesson 149's own already-established answer:

```scheme
(define die-faces (list 1 2 3 4 5 6))
(define two-dice-outcomes
  (apply append (map (lambda (d1) (map (lambda (d2) (cons d1 d2)) die-faces)) die-faces)))
(define (event-doubles? p) (= (car p) (cdr p)))
(define (event-even-sum? p) (even? (+ (car p) (cdr p))))
(define event-doubles (filter event-doubles? two-dice-outcomes))
(define event-even-sum (filter event-even-sum? two-dice-outcomes))
(define (P ev) (/ (length ev) 36))

(define (bayes p-b-given-a p-a p-b) (/ (* p-b-given-a p-a) p-b)) ; ← new

(define p-even-given-doubles 1)                                      ; ← new
(define bayes-result (bayes p-even-given-doubles (P event-doubles) (P event-even-sum))) ; ← new

(display "=== CU2: Bayes' Rule, checked against Lesson 149's own real answer ===") (newline) ; ← new
(display "Bayes-computed P(doubles | even-sum): ") (display (exact->inexact bayes-result)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (bayes p-b-given-a p-a p-b) (/ (* p-b-given-a p-a) p-b))`** — first appearance in this lesson of this procedure; three real arguments, matching Bayes' Rule's own three real inputs exactly; multiplies the first two, divides by the third — the real, direct code translation of this unit's own algebraic derivation.
- **`(define p-even-given-doubles 1)`** — the one real, easy-to-state fact this unit starts from: every double has an even sum, a real, provable certainty, `1`.
- **`(bayes p-even-given-doubles (P event-doubles) (P event-even-sum))`** — calls `bayes` with `P(\text{even-sum} \mid \text{doubles})`, `P(\text{doubles})`, and `P(\text{even-sum})`, in that exact real order, matching the procedure's own three real parameters.
- **The real, exact `0.3333`, matching Lesson 149's own real, directly-restricted answer precisely** — direct, checked confirmation that Bayes' Rule, computed from three real, individually-known quantities and nothing about the underlying `36`-outcome sample space itself, reaches the identical real conclusion.

### CS Lens

This is Lesson 79's own real "check a derived algorithm against an independently-trusted reference" discipline, applied to a formula instead of a sort: `bayes`'s own real output is checked directly against Lesson 149's own real, independently-computed `0.3333`, not merely trusted because the algebra looked correct on paper.

### SE Lens

The alternative to deriving `bayes` as a small, real, general procedure is inlining the identical real arithmetic wherever a reversed conditional probability happens to be needed. The real value of the named procedure: Concept Unit 3's own real, much larger population reuses this exact same real code, unchanged, rather than re-deriving the identical algebra a second time for a genuinely different real domain.

### Run It — Show the Real Output

```
$ guile bayes-check.scm
=== CU2: Bayes' Rule, checked against Lesson 149's own real answer ===
Bayes-computed P(doubles | even-sum): 0.3333333333333333
```

Verified this session — `bayes`, given only `P(\text{even-sum} \mid \text{doubles})`, `P(\text{doubles})`, and `P(\text{even-sum})`, computes `P(\text{doubles} \mid \text{even-sum}) = 0.3333`, exactly matching Lesson 149's own real, independently-computed answer.

---

## Concept Unit 3: A Real, Dramatic Application

### The Problem

Concept Unit 2 confirmed `bayes` on a known real case. It's worth applying it to a real, larger, more dramatic scenario — one where the reverse conditional probability isn't as easy to guess as "every double is even" — and checking the real result against a real, explicit, exhaustively-countable population.

### Reference Source

No reference counterpart — a from-scratch real population, built specifically to make Bayes' Rule's own real, sometimes-surprising behavior checkable by direct, exhaustive count.

### Files affected

Modified: `bayes-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### Applying It — Building a Real, Explicit Population

A real population of `200` balls: `20` real red, `180` real blue. A real detector correctly flags `90\%` of red balls (`18` of the `20`) and incorrectly flags `10\%` of blue balls (`18` of the `180`) — real, exact rates, not approximations, chosen specifically so every real count in this unit comes out to a whole number.

### The New Code — Type It Yourself

```scheme
(define red-count 20)
(define blue-count 180)
(define red-balls (map (lambda (i) (list 'red i)) (iota red-count)))
(define blue-balls (map (lambda (i) (list 'blue i)) (iota blue-count)))
(define population (append red-balls blue-balls))

(define (flagged? ball)
  (let ((color (car ball)) (id (cadr ball)))
    (cond ((eq? color 'red) (< id 18))
          ((eq? color 'blue) (< id 18)))))
```

### The Updated Project

This is `bayes-check.scm`, with Concept Unit 2's own file extended by this unit's own real, explicit population, and a real, exhaustive check cross-verified against `bayes`:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define red-count 20)                                                ; ← new
(define blue-count 180)                                                 ; ← new
(define red-balls (map (lambda (i) (list 'red i)) (iota red-count)))       ; ← new
(define blue-balls (map (lambda (i) (list 'blue i)) (iota blue-count)))       ; ← new
(define population (append red-balls blue-balls))                                ; ← new

(define (flagged? ball)                                              ; ← new
  (let ((color (car ball)) (id (cadr ball)))                            ; ← new
    (cond ((eq? color 'red) (< id 18))                                     ; ← new
          ((eq? color 'blue) (< id 18)))))                                    ; ← new
(define flagged (filter flagged? population))                        ; ← new
(define flagged-red (filter (lambda (b) (eq? (car b) 'red)) flagged))   ; ← new

(display "=== CU3: a real, explicit population, exhaustively counted ===") (newline) ; ← new
(display "real total population: ") (display (length population)) (newline)             ; ← new
(display "real total flagged: ") (display (length flagged)) (newline)                      ; ← new
(display "real flagged AND actually red: ") (display (length flagged-red)) (newline)          ; ← new
(display "real, exhaustive P(red | flagged): ") (display (exact->inexact (/ (length flagged-red) (length flagged)))) (newline) ; ← new
(newline)                                                                                          ; ← new

(define p-red (/ red-count (+ red-count blue-count)))                ; ← new
(define p-flagged-given-red (/ 18 20))                                  ; ← new
(define p-flagged (/ (length flagged) (length population)))                ; ← new
(display "Bayes-computed P(red | flagged): ")                                 ; ← new
(display (exact->inexact (bayes p-flagged-given-red p-red p-flagged))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(map (lambda (i) (list 'red i)) (iota red-count))`** — first appearance in this lesson of this specific real construction: `iota`, given full real treatment in this lesson's own Header, builds the real integers `0` through `19`; each becomes a real, uniquely-identified ball, tagged `'red`.
- **`(define population (append red-balls blue-balls))`** — the real, complete, explicit population, every one of its `200` real members individually distinguishable.
- **`(define (flagged? ball) (let ((color (car ball)) (id (cadr ball))) (cond ...)))`** — first appearance in this lesson of this procedure; `cadr`, reused since Lesson 116, reads a ball's own real ID; a red ball is flagged exactly when its real ID is below `18` (`18` of the `20` real red balls, `90\%`); a blue ball is flagged exactly when its real ID is below `18` (`18` of the `180` real blue balls, `10\%`) — the identical real threshold, `18`, doing genuinely different real work against two differently-sized real groups.
- **The real, exact `200`, `36`, and `18`** — direct, checked confirmation: `36` real balls total get flagged, of which exactly `18` are genuinely red.
- **The real, exact `0.5`** — direct, measured, exhaustive confirmation: only *half* of every flagged ball is actually red, despite the detector's own `90\%` real accuracy rate on red balls specifically.
- **The real, exact `0.5` from `bayes`, matching the exhaustive count precisely** — direct, checked confirmation that Bayes' Rule, computed from `P(\text{flagged} \mid \text{red}) = 0.9`, `P(\text{red}) = 0.1`, and `P(\text{flagged}) = 0.18`, reaches the identical real answer as counting every one of the `200` real balls directly.

### CS Lens

This is Lesson 146's own real "average case secretly assumes a distribution" discipline, encountered from a related angle: a detector's own `90\%` accuracy rate is itself only meaningful relative to the real distribution it's applied to — a `90\%`-accurate test applied to a real population where the thing being tested for is rare produces a real, very different practical reliability than the same real `90\%` figure might suggest in isolation.

### SE Lens

The alternative to running this real, exhaustive population check is trusting the detector's own `90\%` real accuracy figure as a real, sufficient description of its own reliability. The real, measured cost of that trust: a real system reporting "flagged, `90\%` accurate" to an end user, without ever surfacing the real, true `50\%` posterior probability this unit's own evidence reveals, would be technically citing a real, correct number while leaving its own user with a badly overconfident real impression.

### Run It — Show the Real Output

```
$ guile bayes-check.scm
=== CU3: a real, explicit population, exhaustively counted ===
real total population: 200
real total flagged: 36
real flagged AND actually red: 18
real, exhaustive P(red | flagged): 0.5

Bayes-computed P(red | flagged): 0.5
```

Verified this session — of `200` real balls, `36` get flagged by a `90\%`-accurate detector, and only `18` of those, exactly `50\%`, are genuinely red — confirmed exactly by Bayes' Rule, computed independently from three real, summary quantities.

---

## Concept Unit 4: The Real, Honest Effect of Rarity

### The Problem

Concept Unit 3 found a real, `50\%` posterior for one specific real population, `20` red out of `200`. It's worth checking, honestly, what happens to that real posterior as the red balls become genuinely rarer, with the identical detector accuracy held fixed.

### Reference Source

No reference counterpart — a real, direct, repeated application of Concept Unit 3's own already-established real construction, varied across several real population splits.

### Files affected

Modified: `bayes-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (make-population red-count blue-count)
  (append (map (lambda (i) (list 'red i)) (iota red-count))
          (map (lambda (i) (list 'blue i)) (iota blue-count))))

(define (flagged-at-rates? red-count blue-count)
  (lambda (ball)
    (let ((color (car ball)) (id (cadr ball)))
      (cond ((eq? color 'red) (< id (round (* red-count 0.9))))
            ((eq? color 'blue) (< id (round (* blue-count 0.1))))))))
```

### The Updated Project

This is `bayes-check.scm`, with Concept Unit 3's own file extended by a real, general population-builder and six real, varied trials:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (make-population red-count blue-count)                       ; ← new
  (append (map (lambda (i) (list 'red i)) (iota red-count))              ; ← new
          (map (lambda (i) (list 'blue i)) (iota blue-count))))             ; ← new

(define (flagged-at-rates? red-count blue-count)                     ; ← new
  (lambda (ball)                                                        ; ← new
    (let ((color (car ball)) (id (cadr ball)))                             ; ← new
      (cond ((eq? color 'red) (< id (round (* red-count 0.9))))               ; ← new
            ((eq? color 'blue) (< id (round (* blue-count 0.1))))))))            ; ← new

(define (real-posterior red-count blue-count)                        ; ← new
  (let* ((pop (make-population red-count blue-count))                    ; ← new
         (flag? (flagged-at-rates? red-count blue-count))                    ; ← new
         (this-flagged (filter flag? pop))                                      ; ← new
         (this-flagged-red (filter (lambda (b) (eq? (car b) 'red)) this-flagged))) ; ← new
    (exact->inexact (/ (length this-flagged-red) (length this-flagged)))))         ; ← new

(display "=== CU4: the real, honest effect of rarity, detector accuracy held fixed ===") (newline) ; ← new
(for-each (lambda (rc)                                                                    ; ← new
  (display "red=") (display rc) (display "/200 real posterior P(red|flagged): ")             ; ← new
  (display (real-posterior rc (- 200 rc))) (newline))                                           ; ← new
  (list 100 40 20 10 4 2))                                                                         ; ← new
```

### Mechanical Walkthrough

- **`(define (make-population red-count blue-count) ...)`** — first appearance in this lesson of this procedure; the identical real construction Concept Unit 3 used directly, now generalized to any real red and blue counts.
- **`(define (flagged-at-rates? red-count blue-count) ...)`** — first appearance in this lesson of this procedure; a real predicate-factory, identical in spirit to Lesson 150's own `event-sum?`, computing the real threshold count (`90\%` of red, `10\%` of blue) fresh for whatever real population size is passed in; `round`, first appearance in this lesson, rounds a real number to the nearest integer, needed since `90\%` of an odd real count isn't always a whole number.
- **`(define (real-posterior red-count blue-count) ...)`** — first appearance in this lesson of this procedure; builds a real population at the given real split, flags it, and computes the real, exhaustive posterior exactly as Concept Unit 3 did by hand.
- **The real, exact trend — `0.9`, `0.6923`, `0.5`, `0.3214`, `0.1667`, `0.0909`, as red shrinks from `100` to `2` out of a fixed `200`** — direct, measured confirmation: the identical `90\%`-accurate detector's own real posterior reliability collapses as the real event it's detecting becomes rarer, from a real, comfortable `90\%` down to a real, mostly-wrong `9\%`.

### CS Lens

This is Lesson 146's own real, aggregate-versus-single-instance discipline, applied a second time in this Era: Concept Unit 3's own single real data point, `0.5`, was already real and correct, but this unit's own real, six-point trend reveals the actual real shape of the relationship — a real, continuous, dramatic decline, not a single, isolated fact.

### SE Lens

The alternative to checking this real trend across several real prevalence levels is trusting Concept Unit 3's own single real result as representative of "how Bayes' Rule behaves" in general. The real risk of that trust: a real system's own detector, tuned and validated against a real population where the target event happens to be moderately common (like Concept Unit 3's own `10\%` red rate), could see its own real, practical reliability collapse if deployed against a real population where the true rate is much lower — exactly this unit's own real, measured pattern, from `0.5` down to `0.0909`.

### Run It — Show the Real Output

```
$ guile bayes-check.scm
=== CU4: the real, honest effect of rarity, detector accuracy held fixed ===
red=100/200 real posterior P(red|flagged): 0.9
red=40/200 real posterior P(red|flagged): 0.6923076923076923
red=20/200 real posterior P(red|flagged): 0.5
red=10/200 real posterior P(red|flagged): 0.32142857142857145
red=4/200 real posterior P(red|flagged): 0.16666666666666666
red=2/200 real posterior P(red|flagged): 0.09090909090909091
```

Verified this session — with the identical `90\%`-accurate detector held fixed, the real posterior probability of a flagged ball actually being red falls from `0.9` to `0.0909` as red's own real share of the population shrinks from `50\%` to `1\%`, direct, measured evidence that base rate, not test accuracy alone, governs a real test's own practical reliability.

---

## Closing

### Connect the pieces

One real formula, derived once, applied twice, honestly extended:

1. **The real question, posed (Unit 1):** can `P(A|B)` be reached from `P(B|A)` without rebuilding a sample space?
2. **Bayes' Rule, derived and checked (Unit 2):** the real, exact `0.3333`, matching Lesson 149's own independently-computed answer.
3. **A real, dramatic application (Unit 3):** a `90\%`-accurate detector, only `50\%` reliable once flagged, confirmed by real, exhaustive count and by Bayes' Rule alike.
4. **The real, honest trend (Unit 4):** from `0.9` down to `0.0909`, as the real event being detected gets rarer.

Every claim in this lesson traces to real, executed code: a formula derived algebraically and checked against an already-known answer, a real, exhaustively-countable population confirming a genuinely surprising real result, and a real, six-point trend showing exactly how that result depends on base rate.

### What breaks without this

Suppose a real, `90\%`-accurate detector — for spam, for fraud, for any rare real event — were deployed and its own flagged results trusted at close to face value, the real mistake Concept Unit 3's own evidence directly warns against. This lesson's own real numbers show precisely what that trust costs: with the real event being detected occurring in only `10\%` of the real population, half of every flagged real case is a real false alarm — and if the real event is rarer still, Concept Unit 4's own real trend shows that false-alarm rate only gets worse, not better, the more the detector's own raw accuracy might otherwise seem to promise.

### Exercises

1. **Observe.** Before checking, predict the real posterior `P(\text{red} \mid \text{flagged})` for a population of `1` red ball and `199` blue, using this lesson's own real Concept Unit 4 trend to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, using `real-posterior` directly.
3. **Formalize.** Modify `flagged-at-rates?` to use a genuinely more accurate detector — `99\%` true positive, `1\%` false positive — and re-run Concept Unit 4's own real six-point trend; report whether the real posterior collapse at low prevalence still happens, and how much less severe it is.
4. **Explain.** In your own words, explain why `bayes`'s own real formula needs `P(B)` in its own denominator, referencing what would happen to the real computed result if a rarer real event `B` were used without adjusting for its own smaller real probability.
5. **Explain.** Using this lesson's own real Concept Unit 3 and 4 numbers, explain why "the detector is `90\%` accurate" is an incomplete real description of its own real-world reliability, referencing what additional real quantity — this lesson's own "base rate" term — is needed to actually predict how trustworthy a flagged result is.

### Definition of done

- [ ] You can state Bayes' Rule from memory and explain, in your own words, how it's derived from Lesson 149's own ratio formula.
- [ ] You can point to this lesson's own real `0.5` posterior, against a `90\%`-accurate detector, as direct evidence that test accuracy alone doesn't determine real-world reliability.
- [ ] You can explain, using this lesson's own real six-point trend, why the identical detector becomes less reliable, not more, as the event it detects gets rarer.
- [ ] You completed Exercises 1–5, including a real, checked comparison against a more accurate detector.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
