# Lesson 150: Independence

**What you will build:** a real, precise, checkable test for **independence** — whether knowing one event occurred genuinely tells you nothing about another — applied to real event pairs from Lesson 147 and 148's own two-dice sample space, with real, sometimes surprising results. Real, verified evidence this session: "doubles" and "even sum," already shown in Lesson 149 to be genuinely related (`P(\text{doubles} \mid \text{even-sum}) = 0.3333 \ne P(\text{doubles}) = 0.1667`), fail this lesson's own real independence test exactly as expected — `P(\text{doubles}) \times P(\text{even-sum}) = 0.0833`, while `P(\text{doubles and even-sum}) = 0.1667`, real, unequal numbers. But "the sum is `7`" and "the first die shows `3`" — two events that sound, on the surface, closely related, since both are facts about the same real roll — pass the identical real test exactly: `0.1667 \times 0.1667 = 0.0278`, matching `P(\text{sum} = 7 \text{ and } d_1 = 3) = 0.0278` precisely. A real, exhaustive check across all six possible real first-die values confirms this isn't a coincidence: "the sum is `7`" is independent of *every* possible first-die value, verified all six times. But "the sum is `8`" and "the first die shows `3`" — a real, structurally similar-looking pair — fail the identical test: `0.0231 \ne 0.0278`, genuinely dependent. The transferable point: independence is never something a pair of events "looks like" it has, based on how related or unrelated their own descriptions sound — it's a real, precise, computable equality, and this lesson's own real evidence shows it can hold for one sum and fail for a structurally near-identical one.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 147's own real sample space, Lesson 148's own real events, and Lesson 149's own real conditional probability, including its own already-established real finding that doubles and even-sum are related — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Sample space (Ω)** — the real, complete set of every possible outcome of a real random process.
- **Event** — a real, precise subset of a sample space.
- **Conditional probability, `P(A | B)`** — the real probability that event `A` occurs, given that event `B` is already known to have occurred.
- **Independence** — two real events `A` and `B` are independent exactly when `P(A \cap B) = P(A) \times P(B)` — equivalently, when knowing `B` occurred leaves `A`'s own real probability completely unchanged, `P(A \mid B) = P(A)`. It exists to give "these two things have nothing to do with each other, probabilistically" a real, precise, checkable meaning, distinct from any informal sense that two events "sound" related or unrelated based on their own descriptions.

**Objects and methods used**

- **`independent?`**
  - *What it is:* this lesson's own real predicate testing whether two events satisfy the real independence equation.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real independence check this lesson performs, from Concept Unit 2 onward.
- **`P`**
  - *What it is:* this lesson's own real, small procedure computing an event's own real probability.
  - *Implementation:* `(define (P ev) (/ (length ev) 36))` — a real event's own size, divided by the real, fixed sample-space size this lesson's own two-dice domain has used since Lesson 147.
  - *Its use:* every real probability computed in this lesson.
- **`event-intersection`**
  - *What it is:* Lesson 148's own real procedure returning the real, shared overlap between two events.
  - *Implementation:* `(define (event-intersection a b) (filter (lambda (x) (member x b)) a))`.
  - *Its use:* the real numerator every independence check in this lesson depends on.

---

## Concept Unit 1: A Real, Precise Test Is Needed

### The Problem

Lesson 149's own real evidence already showed doubles and even-sum are related: conditioning on even-sum changed doubles' own real probability from `0.1667` to `0.3333`. That's real, direct evidence of *dependence* — but "conditioning changed the number" and "these two events are independent" are two claims about the exact same real relationship, stated in opposite real directions, and it's worth deriving a real, direct test for the second one, usable even before any conditional probability has been computed.

### No isolated lab for this step

This unit introduces no new construct — Lesson 149's own real, already-established finding is restated here as this lesson's own real motivation, not re-derived.

### Reference Source

No reference counterpart — the real motivating question is restated directly from Lesson 149's own real evidence.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Two Equivalent Real Ways to Say "Unrelated"

`P(A \mid B) = P(A)` says: knowing `B` doesn't move `A`'s own real probability at all. Lesson 149's own real ratio formula, `P(A \mid B) = P(A \cap B) / P(B)`, means this is exactly equivalent to `P(A \cap B) / P(B) = P(A)`, or, multiplying both real sides by `P(B)`: `P(A \cap B) = P(A) \times P(B)` — a real equation involving no conditional probability at all, directly checkable from two individual real probabilities and one real intersection.

### Walkthrough

- **The direct algebraic derivation from Lesson 149's own ratio formula** — grounds this unit's own real test in already-verified machinery, not a new, unrelated definition.
- **"a real equation involving no conditional probability at all"** — previews Concept Unit 2's own real code, which never needs to compute `P(A \mid B)` directly to test independence.

### CS Lens

This is Lesson 148's own real inclusion-exclusion check, encountered from a related angle: exactly as that formula compared a real, measured union against a real, algebraic prediction, `P(A \cap B) = P(A) \times P(B)` is a real, algebraic prediction about the intersection specifically, checkable against a real, direct measurement the identical way.

### SE Lens

The alternative to deriving a direct real test is always computing a full conditional probability first, then comparing it against the unconditioned real probability. The real value of the direct, multiplicative form: it's checkable from three real quantities already sitting in hand — `P(A)`, `P(B)`, `P(A \cap B)` — without an extra real division step, and it treats `A` and `B` symmetrically, unlike a conditional probability's own inherently one-directional shape.

---

## Concept Unit 2: A Real Test, Checked Against Already-Known Dependence

### The Problem

Concept Unit 1 derived a real equation. It needs real code, and a first real check against a pair of events already known, from Lesson 149, to be genuinely dependent — confirming the real test correctly reports "not independent" before trusting it on anything new.

### Reference Source

`event-doubles`, `event-even-sum`, `event-intersection` — quoted unchanged in this lesson's own Header above, originally Lessons 147 and 148.

### Files affected

Created: `independence-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (P ev) (/ (length ev) 36))
(define (independent? a b) (= (P (event-intersection a b)) (* (P a) (P b))))
```

### The Updated Project

This is `independence-check.scm`, in full — Lesson 147 and 148's own real sample space, events, and `event-intersection`, quoted unchanged, with this unit's own real independence test added on top:

```scheme
(define die-faces (list 1 2 3 4 5 6))
(define two-dice-outcomes
  (apply append (map (lambda (d1) (map (lambda (d2) (cons d1 d2)) die-faces)) die-faces)))
(define (event-doubles? p) (= (car p) (cdr p)))
(define (event-even-sum? p) (even? (+ (car p) (cdr p))))
(define event-doubles (filter event-doubles? two-dice-outcomes))
(define event-even-sum (filter event-even-sum? two-dice-outcomes))
(define (event-intersection a b) (filter (lambda (x) (member x b)) a))

(define (P ev) (/ (length ev) 36))                                   ; ← new
(define (independent? a b) (= (P (event-intersection a b)) (* (P a) (P b)))) ; ← new

(display "=== CU2: the real test, checked against known dependence ===") (newline) ; ← new
(display "P(doubles)*P(even-sum): ") (display (exact->inexact (* (P event-doubles) (P event-even-sum)))) (newline) ; ← new
(display "P(doubles AND even-sum): ") (display (exact->inexact (P (event-intersection event-doubles event-even-sum)))) (newline) ; ← new
(display "doubles, even-sum independent? ") (display (independent? event-doubles event-even-sum)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (P ev) (/ (length ev) 36))`** — first appearance in this lesson of this procedure; a real event's own size, divided by this lesson's own fixed, `36`-outcome sample space.
- **`(define (independent? a b) (= (P (event-intersection a b)) (* (P a) (P b))))`** — first appearance in this lesson of this procedure; computes both real sides of Concept Unit 1's own derived equation — `P` of the real intersection on one side, the real product of the two individual probabilities on the other — and checks them for exact real equality via `=`.
- **The real, exact `0.0833`, against the real, exact `0.1667`** — direct, measured confirmation: the two real sides of the independence equation genuinely disagree for doubles and even-sum.
- **The real, exact `#f`** — direct, checked confirmation that `independent?` correctly reports these two events as *not* independent, consistent with Lesson 149's own real conditional-probability finding.

### CS Lens

This is Lesson 22's own real discipline, applied to a mathematical claim rather than an algorithm: before trusting `independent?` on any new, unverified pair of events, check it against a pair whose own real answer is already known — the identical real move as checking a new procedure against an already-trusted result before relying on it elsewhere.

### SE Lens

The alternative to this real, confirming first check is writing `independent?` and trusting it immediately on a brand-new pair of events with no known real answer to compare against. The real value of checking it here first: if `independent?` had returned `#t` for doubles and even-sum, that would have directly contradicted Lesson 149's own already-verified real evidence — a real, immediate signal something in this unit's own new code was wrong, caught before Concept Unit 3 ever runs.

### Run It — Show the Real Output

```
$ guile independence-check.scm
=== CU2: the real test, checked against known dependence ===
P(doubles)*P(even-sum): 0.08333333333333333
P(doubles AND even-sum): 0.16666666666666666
doubles, even-sum independent? #f
```

Verified this session — `independent?`, applied to doubles and even-sum, correctly reports `#f`, matching Lesson 149's own already-established real finding that these two events are genuinely related.

---

## Concept Unit 3: A Real, Surprising Positive Case

### The Problem

Concept Unit 2 confirmed the real test on a known-dependent pair. It's worth checking a pair that *sounds* related — two facts about the identical dice roll — to see whether `independent?` can also correctly report `#t`, and whether that real result holds up under real, exhaustive scrutiny rather than a single lucky-looking case.

### Reference Source

No reference counterpart — a from-scratch real check of a new pair of events over this lesson's own already-established sample space.

### Files affected

Modified: `independence-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (event-sum? s) (lambda (p) (= (+ (car p) (cdr p)) s)))
(define (event-d1? v) (lambda (p) (= (car p) v)))
```

### The Updated Project

This is `independence-check.scm`, with Concept Unit 2's own file extended by this unit's own real event-builders and a real, exhaustive check:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (event-sum? s) (lambda (p) (= (+ (car p) (cdr p)) s))) ; ← new
(define (event-d1? v) (lambda (p) (= (car p) v)))                 ; ← new
(define sum7 (filter (event-sum? 7) two-dice-outcomes))              ; ← new
(define d1-3 (filter (event-d1? 3) two-dice-outcomes))                  ; ← new

(display "=== CU3: sum=7 and d1=3, a real, surprising positive case ===") (newline) ; ← new
(display "P(sum=7): ") (display (exact->inexact (P sum7))) (newline)                  ; ← new
(display "P(d1=3): ") (display (exact->inexact (P d1-3))) (newline)                      ; ← new
(display "P(sum=7 AND d1=3): ") (display (exact->inexact (P (event-intersection sum7 d1-3)))) (newline) ; ← new
(display "sum=7, d1=3 independent? ") (display (independent? sum7 d1-3)) (newline)              ; ← new
(newline)                                                                                            ; ← new

(display "=== real, exhaustive check: sum=7 vs every possible d1 value ===") (newline) ; ← new
(for-each (lambda (v)                                                                     ; ← new
  (let ((dv (filter (event-d1? v) two-dice-outcomes)))                                       ; ← new
    (display "d1=") (display v) (display " independent of sum=7? ") (display (independent? sum7 dv)) (newline))) ; ← new
  (list 1 2 3 4 5 6))                                                                                    ; ← new
```

### Mechanical Walkthrough

- **`(define (event-sum? s) (lambda (p) (= (+ (car p) (cdr p)) s)))`** — first appearance in this lesson of this procedure; returns a real, fresh predicate for a given sum `s`, rather than being a predicate itself — a real, small procedure factory, letting Concept Unit 3 and later units build a "sum equals `s`" event for any real `s` without writing a new named predicate each time.
- **`(define (event-d1? v) (lambda (p) (= (car p) v)))`** — the identical real factory idea, for "first die equals `v`."
- **`(filter (event-sum? 7) two-dice-outcomes)`** — first appearance in this lesson of calling a predicate-factory's own real result immediately: `(event-sum? 7)` returns a real predicate, used directly as `filter`'s own second argument.
- **The real, exact `0.1667`, `0.1667`, and `0.0278`, with `0.1667 \times 0.1667 = 0.0278`** — direct, measured confirmation that `P(\text{sum}=7) \times P(d_1=3)` equals `P(\text{sum}=7 \text{ and } d_1=3)` exactly.
- **The real, exact `#t`** — direct, checked confirmation: sum-`7` and first-die-`3`, two facts about the identical real roll, are genuinely independent.
- **The real, exact `#t` at every one of the six real first-die values** — direct, exhaustive confirmation, the identical real discipline Lesson 22 established: "sum equals `7`" is independent of *every* possible first-die value, not merely the one value, `3`, this unit happened to check first.

### CS Lens

This is Lesson 65's own real edge-case discipline, recognized from an unexpected angle: sum `7` is the unique real "balanced" sum on two six-sided dice — every one of the six first-die values pairs with exactly one second-die value to reach it — and this unit's own real, exhaustive check confirms that balance is exactly what produces independence here, not a coincidence specific to first-die value `3`.

### SE Lens

The alternative to checking all six real first-die values is trusting the single real check against `d1=3` and generalizing informally. The real value of the exhaustive check: it turns "sum `7` seems independent of the first die" from a real, single data point into a real, complete, provable fact about this specific sum — exactly the kind of real claim Concept Unit 4 goes on to show does *not* hold for a structurally similar but numerically different sum.

### Run It — Show the Real Output

```
$ guile independence-check.scm
=== CU3: sum=7 and d1=3, a real, surprising positive case ===
P(sum=7): 0.16666666666666666
P(d1=3): 0.16666666666666666
P(sum=7 AND d1=3): 0.027777777777777776
sum=7, d1=3 independent? #t

=== real, exhaustive check: sum=7 vs every possible d1 value ===
d1=1 independent of sum=7? #t
d1=2 independent of sum=7? #t
d1=3 independent of sum=7? #t
d1=4 independent of sum=7? #t
d1=5 independent of sum=7? #t
d1=6 independent of sum=7? #t
```

Verified this session — sum-`7` and first-die-`3` satisfy the real independence equation exactly, and a real, exhaustive check across all six possible first-die values confirms sum-`7` is independent of every one of them.

---

## Concept Unit 4: The Real, Honest Contrast

### The Problem

Concept Unit 3's own real evidence might tempt a real, false generalization: "the sum of two dice is always independent of the first die." It's worth checking, honestly, a structurally near-identical pair — a different sum, the same first-die value — to see whether that real pattern actually holds in general.

### Reference Source

No reference counterpart — a real, direct application of this lesson's own already-established real procedures to one new event.

### Files affected

Modified: `independence-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define sum8 (filter (event-sum? 8) two-dice-outcomes))
```

### The Updated Project

This is `independence-check.scm`, with Concept Unit 3's own file extended by a real, contrasting check:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define sum8 (filter (event-sum? 8) two-dice-outcomes))              ; ← new

(display "=== CU4: sum=8 and d1=3, a real, honest contrast ===") (newline) ; ← new
(display "P(sum=8): ") (display (exact->inexact (P sum8))) (newline)         ; ← new
(display "P(sum=8 AND d1=3): ") (display (exact->inexact (P (event-intersection sum8 d1-3)))) (newline) ; ← new
(display "P(sum=8)*P(d1=3): ") (display (exact->inexact (* (P sum8) (P d1-3)))) (newline) ; ← new
(display "sum=8, d1=3 independent? ") (display (independent? sum8 d1-3)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define sum8 (filter (event-sum? 8) two-dice-outcomes))`** — first appearance in this lesson of this specific real event; built with `event-sum?`, given full real treatment in Concept Unit 3, applied to `8` instead of `7`.
- **The real, exact `0.1389` for `P(\text{sum}=8)`, distinct from sum-`7`'s own real `0.1667`** — a direct, real reminder, already established in Lesson 147, that not every sum has the identical real probability.
- **The real, exact `0.0278` for the real intersection, against the real, exact `0.0231` for the real product `P(\text{sum}=8) \times P(d_1=3)`** — direct, measured confirmation that these two real numbers genuinely disagree this time.
- **The real, exact `#f`** — direct, checked confirmation: sum-`8` and first-die-`3` are *not* independent, breaking Concept Unit 3's own tempting pattern.

### CS Lens

This is Lesson 65's own real edge-case reasoning, completed: sum `8` has no such perfect real balance — first-die value `3` (pairing with second-die `5`) is only one of five real ways to reach `8`, but not every first-die value contributes to sum-`8` equally (a first die of `1` or `7` could never reach `8` at all combined with the other die's own bounded range) — the identical real structural imbalance that made sum-`7` special is genuinely absent here, and this unit's own real numbers show precisely what that absence costs.

### SE Lens

The alternative to checking this real contrast is stopping at Concept Unit 3's own real, exhaustive-but-single-sum result and assuming it generalizes to every sum. The real cost of that assumption, made concrete here: a real system reasoning "the dice sum tells you nothing about the individual dice," built on Concept Unit 3's own real evidence alone, would be silently wrong the moment it encountered a sum other than `7` — exactly the kind of real, unchecked generalization this curriculum's own discipline, since Lesson 22, exists to prevent.

### Run It — Show the Real Output

```
$ guile independence-check.scm
=== CU4: sum=8 and d1=3, a real, honest contrast ===
P(sum=8): 0.1388888888888889
P(sum=8 AND d1=3): 0.027777777777777776
P(sum=8)*P(d1=3): 0.023148148148148147
sum=8, d1=3 independent? #f
```

Verified this session — sum-`8` and first-die-`3`, a structurally similar-looking pair to Concept Unit 3's own sum-`7` case, genuinely fail the real independence test, `0.0278 \ne 0.0231`, direct, honest evidence that independence must be checked for each specific real pair, never assumed from a structurally similar case.

---

## Closing

### Connect the pieces

Two real known cases, one real surprising pair, one real honest contrast:

1. **A real test, derived (Unit 1):** `P(A \cap B) = P(A) \times P(B)`, algebraically equivalent to Lesson 149's own conditional-probability definition.
2. **The real test, confirmed against known dependence (Unit 2):** doubles and even-sum correctly fail it.
3. **A real, surprising positive case, checked exhaustively (Unit 3):** sum-`7` is independent of every possible first-die value.
4. **The real, honest contrast (Unit 4):** sum-`8` and first-die-`3` fail the identical test, breaking any temptation to generalize Unit 3's own result.

Every claim in this lesson traces to real, executed code: a real test derived algebraically from already-verified machinery, confirmed against a known case, then applied to a real, exhaustive positive example and a real, honest negative one.

### What breaks without this

Suppose a real system assumed, from Concept Unit 3's own real evidence alone, that a dice-based game's own total score never reveals anything about its own individual components — and built a real feature (hiding individual rolls, showing only the total) around that assumption. Concept Unit 4's own real evidence shows precisely where that assumption breaks: for a total of `8`, unlike `7`, knowing the total *does* shift the real likelihood of any specific individual roll — a real, silent information leak the system's own designer, trusting an unchecked generalization, would never have noticed.

### Exercises

1. **Observe.** Before checking, predict whether sum-`2` (the unique real sum reachable only by `d1=1, d2=1`) would be independent of `d1=1`, using this lesson's own real Concept Unit 4 reasoning about real imbalance to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Run this lesson's own real, exhaustive check (all six `d1` values) against sum-`8` instead of sum-`7`, and report how many of the six real checks come back independent versus dependent.
4. **Explain.** In your own words, explain why sum `7` is the *only* real sum, among `2` through `12`, capable of being independent of every possible first-die value on a pair of six-sided dice, referencing this lesson's own real reasoning about balanced counts.
5. **Explain.** Using this lesson's own real Concept Unit 2 numbers, explain why `independent?`'s own real test, unlike Lesson 149's own conditional-probability formula, treats `a` and `b` symmetrically — referencing what would happen to the real result if `independent?`'s own two arguments were swapped.

### Definition of done

- [ ] You can state the real independence equation and explain why it's algebraically equivalent to `P(A|B) = P(A)`.
- [ ] You can point to this lesson's own real `#t`/`#f` results across four checked pairs as direct evidence independence must be verified per pair, never assumed from a similar-looking case.
- [ ] You can explain, using real counting, why sum `7` specifically is independent of the first die on two six-sided dice.
- [ ] You completed Exercises 1–5, including a real, checked exhaustive comparison for sum `8`.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
