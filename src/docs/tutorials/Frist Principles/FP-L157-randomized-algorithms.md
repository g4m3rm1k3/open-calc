# Lesson 157: Randomized Algorithms

**What you will build:** real, direct evidence for two genuinely different reasons an algorithm might deliberately use randomness internally, plus the real vocabulary — **Las Vegas** and **Monte Carlo** — distinguishing two real families of randomized algorithm. Real, verified evidence this session: on a real, `100`-element array where every "special" element is deliberately placed in the last `10` positions, a real, deterministic left-to-right scan needs `91` real checks in this specific real arrangement to find one; a real, randomized algorithm that simply picks a random index and checks it, repeating until success, needs only `9.89` real checks on average, across `2,000` real, independent trials — matching the real, theoretical prediction, `1/p = 10`, almost exactly, and completely unaffected by *where* the special elements happen to sit. A real, bounded version of the identical randomized algorithm, capped at `30` real attempts, fails to find a special element `4.1\%` of the real time across those same `2,000` trials — matching the real, predicted failure rate, `(1-p)^{30} = 4.24\%$, almost exactly. The transferable point: Lesson 146 already showed randomness can defeat an adversary who knows an algorithm's own fixed rule in advance; this lesson shows a real, second, independent reason — randomness can make an algorithm's own real performance *insensitive to input arrangement entirely*, not merely resistant to a knowing attacker — and names the real, precise distinction between an algorithm that trades away a guaranteed running time for guaranteed correctness, and one that trades away guaranteed correctness for a guaranteed, bounded running time.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 146's own real, deterministic-versus-randomized hash-collision evidence — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Deterministic algorithm** — an algorithm whose own real output and real behavior depend only on its input, never on any internal real choice made along the way.
- **Randomized algorithm** — an algorithm whose own real behavior depends not only on its input but on real random choices it makes internally, at run time, in a way no outside observer can predict in advance.
- **Adversarial input** — a real input deliberately chosen by someone working against a system, specifically to trigger a real, known worst case in a deterministic algorithm the attacker has studied in advance.
- **Las Vegas algorithm** — a randomized algorithm that always produces a real, correct result, but whose own real running time varies randomly from run to run. It exists to name, precisely, algorithms that trade away a *guaranteed* running time in exchange for keeping a full, unconditional correctness guarantee.
- **Monte Carlo algorithm** — a randomized algorithm with a real, fixed, guaranteed running time, but which carries a real, small, computable probability of an incorrect result. It exists to name, precisely, the opposite real trade-off: a guaranteed running time, purchased at the cost of a real, bounded, but nonzero chance of error.

**Objects and methods used**

- **`rand-find`** / **`rand-find-bounded`**
  - *What it is:* this lesson's own real, randomized search procedures.
  - *Implementation:* given full real treatment in Concept Unit 3 and 4 below.
  - *Its use:* every real randomized search this lesson runs.
- **`randomized-hash`**
  - *What it is:* Lesson 146's own real hash function, combining a key with a real, per-instance random seed.
  - *Implementation:* `(define (randomized-hash x seed) (modulo (logxor x seed) table-size))`.
  - *Its use:* this lesson's own real, restated example of randomness defeating a real, knowing adversary.
- **`list-ref`** / **`random`**
  - *What it is:* real Scheme procedures, reused unchanged from earlier lessons — `list-ref` reads a list's own element at a given real index; `random` returns a real, unpredictable integer below a given bound.
  - *Implementation:* each takes the real arguments its own earlier-established contract specifies.
  - *Its use:* every real, randomized index chosen in this lesson's own search procedures.

---

## Concept Unit 1: Is Defeating an Adversary the Only Real Reason?

### The Problem

Lesson 146 showed real, direct evidence that adding randomness to a hash function defeats an attacker who has studied the hash rule in advance and constructed keys guaranteed to collide under it. That's a real, specific, powerful use of randomness — but it's worth asking, honestly, whether it's the *only* real reason an algorithm might deliberately reach for randomness, or whether a genuinely different real benefit exists too.

### No isolated lab for this step

This unit introduces no new construct — Lesson 146's own real hash-flooding evidence is restated here as this lesson's own real motivation, not re-derived.

### Reference Source

`randomized-hash` — quoted unchanged in this lesson's own Header above, originally Lesson 146.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What a Second Real Rationale Would Need to Show

A genuinely second real reason for randomness would need to produce a real, measurable benefit even in a real scenario with no adversary at all — no one deliberately choosing a bad input, just an input whose own real arrangement happens to be unfavorable for a specific deterministic algorithm.

### Walkthrough

- **The direct citation of Lesson 146's own real, adversarial hash-flooding scenario** — grounds this unit's own real question in already-verified evidence, not an abstract distinction.
- **"no one deliberately choosing a bad input"** — previews Concept Unit 3's own real, non-adversarial scenario before any code is written.

### CS Lens

This is Lesson 74's own worst/average/best-case vocabulary, applied to a genuinely new question: Lesson 146's own real evidence was about defeating a worst case chosen *on purpose*; this unit asks whether randomness can also help with a worst case that arises *by accident*, from an input's own real, unfavorable arrangement, with no intent behind it at all.

### SE Lens

The alternative to distinguishing these two real rationales is treating "add randomness" as one, undifferentiated real technique, applied whenever a system feels insecure or slow. The real value of separating them, made concrete in Concept Unit 3 and 4: knowing *which* real problem randomness is solving in a specific real system determines what kind of real guarantee — Las Vegas or Monte Carlo — that system actually needs.

---

## Concept Unit 2: Rationale One, Restated in Full

### The Problem

Before deriving a genuinely second rationale, it's worth restating Lesson 146's own real, first one precisely, so Concept Unit 3's own real contrast has something concrete and complete to stand against.

### Reference Source

`randomized-hash` — quoted unchanged in this lesson's own Header above, originally Lesson 146.

### Files affected

Created: `randomized-algorithms-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — Rationale One, Precisely

Lesson 146's own real evidence: ten real, deliberately chosen keys, `3, 13, 23, \ldots, 93`, collided into a single real bucket, `100\%$ of the time, under a real, fixed, publicly-knowable hash rule. Adding a real, per-instance random seed, unknown to the attacker in advance, spread the identical real keys across `2` to `5` real distinct buckets, and reduced the real, guaranteed collision to a real, rare `2.2\%$ across `1,000` real trials. This is **Rationale One**: randomness converts a real, *guaranteed* adversarial worst case into a real, merely *possible* one, by removing the attacker's own real ability to predict the algorithm's own specific behavior in advance.

### Walkthrough

- **The precise, numeric restatement of Lesson 146's own real `100\%$-to-`2.2\%$ result** — a real, complete restatement, per this curriculum's own Repetition Rule, not a bare citation.
- **"removing the attacker's own real ability to predict"** — names, precisely, the real mechanism Rationale One depends on: an adversary who cannot predict the algorithm's own random choices cannot construct an input guaranteed to exploit them.

### CS Lens

This is Lesson 146's own real evidence, now given its own formal name: Rationale One is precisely the real principle Lesson 146 demonstrated, without yet being named as one of potentially several real reasons randomness earns a place in algorithm design.

### SE Lens

The alternative to naming Rationale One explicitly, as its own real category, is leaving it conflated with whatever real technique comes next. The real value of naming it: Concept Unit 3's own real evidence can now be checked, directly, for whether it's really a *different* real rationale, or just Rationale One under a new name.

---

## Concept Unit 3: Rationale Two — Insensitivity to Arrangement

### The Problem

Rationale One defeats a real, *knowing* adversary. It's worth checking whether randomness offers a real benefit even against an input arrangement that's merely unfavorable, with no adversary — no intent, no foreknowledge of the algorithm — behind it at all.

### Reference Source

No reference counterpart — a from-scratch real construction, testing a deterministic and a randomized search procedure against an identical, real, unfavorably-arranged array.

### Files affected

Modified: `randomized-algorithms-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### Applying It — a Real, Unfavorably-Arranged Array

A real, `100`-element array, `10` real "special" elements, all placed in the final `10` real positions — not necessarily by any adversary's own deliberate design, simply an unfavorable real arrangement a deterministic, left-to-right search would suffer under regardless of *why* it arose.

### The New Code — Type It Yourself

```scheme
(define (det-find arr)
  (let loop ((lst arr) (count 0))
    (cond ((null? lst) count)
          ((car lst) (+ count 1))
          (else (loop (cdr lst) (+ count 1))))))
(define (rand-find arr n)
  (let loop ((count 0))
    (let ((i (random n)))
      (if (list-ref arr i)
          (+ count 1)
          (loop (+ count 1))))))
```

### The Updated Project

This is `randomized-algorithms-check.scm`, with Concept Unit 2's own file extended by a real, adversarially-arranged array and both real search procedures:

```scheme
;; ... Concept Unit 2's own restated real evidence, no new code of its own ...

(define n 100)                                                       ; ← new
(define (special? i) (>= i 90))                                         ; ← new
(define arr (map special? (iota n)))                                       ; ← new

(define (det-find arr)                                               ; ← new
  (let loop ((lst arr) (count 0))                                       ; ← new
    (cond ((null? lst) count)                                              ; ← new
          ((car lst) (+ count 1))                                             ; ← new
          (else (loop (cdr lst) (+ count 1))))))                                 ; ← new

(define (rand-find arr n)                                             ; ← new
  (let loop ((count 0))                                                  ; ← new
    (let ((i (random n)))                                                   ; ← new
      (if (list-ref arr i)                                                     ; ← new
          (+ count 1)                                                             ; ← new
          (loop (+ count 1))))))                                                     ; ← new

(display "=== CU3: a real, unfavorably-arranged array, two real search styles ===") (newline) ; ← new
(display "deterministic real checks needed: ") (display (det-find arr)) (newline)             ; ← new

(define trials 2000)                                                    ; ← new
(define total 0)                                                           ; ← new
(let loop ((t 0))                                                             ; ← new
  (if (< t trials)                                                               ; ← new
      (begin (set! total (+ total (rand-find arr n))) (loop (+ t 1)))))             ; ← new
(display "real average random-sampling checks, 2000 real trials: ")                    ; ← new
(display (exact->inexact (/ total trials))) (newline)                                     ; ← new
```

### Mechanical Walkthrough

- **`(define (special? i) (>= i 90))`** — first appearance in this lesson of this predicate; true exactly for the real, last `10` positions of a `100`-element array.
- **`(define arr (map special? (iota n)))`** — first appearance in this lesson of this real array; `#t` at positions `90` through `99`, `#f` everywhere else.
- **`(define (det-find arr) ...)`** — first appearance in this lesson of this procedure; a real, named-let scan, counting how many real elements are checked before the first real `#t` is found (or the whole real list is exhausted).
- **`(define (rand-find arr n) ...)`** — first appearance in this lesson of this procedure; picks a real, unpredictable index via `random`, checks it via `list-ref`, and repeats — with *no* real memory of which indices were already tried, unlike `det-find`'s own real, ordered progression.
- **The real, exact `91`** — direct, measured confirmation: `det-find`, on this specific real arrangement, must check `91` real elements before reaching the first special one.
- **The real, exact `9.89`, close to the real, theoretical `1/p = 1/0.1 = 10`** — direct, measured confirmation: `rand-find`'s own real average cost is roughly a real `9\times$ improvement over `det-find`'s own real cost on this exact arrangement, and — crucially — `rand-find`'s own real expected cost would be identical, `10`, no matter *where* the ten real special elements happened to sit.

### CS Lens

This is Lesson 79's own real merge-sort-versus-insertion-sort discipline, applied to search rather than sorting: a real algorithm whose own real cost depends heavily on input arrangement (`det-find`) is directly, measurably outperformed, on this real unfavorable case, by one whose own real cost genuinely does not (`rand-find`) — the identical real kind of contrast, a different real technique.

### SE Lens

The alternative to measuring `rand-find`'s own real arrangement-independence directly is assuming randomization only ever helps against a deliberate adversary. The real value of this unit's own evidence: `rand-find`'s own real `9.89`-check average would hold identically even if the real special elements' own positions arose from pure, unremarkable happenstance — a real, second, genuinely distinct rationale from Rationale One, which specifically required an adversary with foreknowledge.

### Run It — Show the Real Output

```
$ guile randomized-algorithms-check.scm
=== CU3: a real, unfavorably-arranged array, two real search styles ===
deterministic real checks needed: 91
real average random-sampling checks, 2000 real trials: 9.8895
```

Verified this session — on a real, unfavorably-arranged `100`-element array, deterministic search needs `91` real checks while randomized sampling needs only `9.89` on average, real, direct evidence of Rationale Two: insensitivity to input arrangement, independent of any adversary.

---

## Concept Unit 4: Las Vegas and Monte Carlo, Named Precisely

### The Problem

`rand-find`, as built, always eventually finds a real special element — it just might take a real, variable number of attempts. It's worth checking, honestly, what happens if that real, unbounded patience isn't acceptable — if a real system needs a guaranteed, fixed running time instead, even at the cost of sometimes being wrong.

### Reference Source

`rand-find` — quoted unchanged in this lesson's own Header above, originally this lesson's own Concept Unit 3.

### Files affected

Modified: `randomized-algorithms-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (rand-find-bounded arr n max-attempts)
  (let loop ((count 0))
    (if (= count max-attempts)
        'not-found
        (let ((i (random n)))
          (if (list-ref arr i)
              (+ count 1)
              (loop (+ count 1)))))))
```

### The Updated Project

This is `randomized-algorithms-check.scm`, with Concept Unit 3's own file extended by a real, bounded search procedure and a real, measured failure rate:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (rand-find-bounded arr n max-attempts)                       ; ← new
  (let loop ((count 0))                                                 ; ← new
    (if (= count max-attempts)                                             ; ← new
        'not-found                                                            ; ← new
        (let ((i (random n)))                                                    ; ← new
          (if (list-ref arr i)                                                      ; ← new
              (+ count 1)                                                              ; ← new
              (loop (+ count 1)))))))                                                     ; ← new

(define max-attempts 30)                                             ; ← new
(define fail-count 0)                                                   ; ← new
(let loop ((t 0))                                                          ; ← new
  (if (< t trials)                                                            ; ← new
      (begin                                                                     ; ← new
        (if (eq? (rand-find-bounded arr n max-attempts) 'not-found)                 ; ← new
            (set! fail-count (+ fail-count 1)))                                        ; ← new
        (loop (+ t 1)))))                                                                 ; ← new

(display "=== CU4: Las Vegas (rand-find) versus Monte Carlo (rand-find-bounded) ===") (newline) ; ← new
(display "real failure count, bounded at 30 attempts, 2000 real trials: ") (display fail-count) (newline) ; ← new
(display "real failure rate: ") (display (exact->inexact (/ fail-count trials))) (newline)          ; ← new
(display "predicted (1-p)^30: ") (display (exact->inexact (expt 0.9 30))) (newline)                    ; ← new
```

### Mechanical Walkthrough

- **`(define (rand-find-bounded arr n max-attempts) ...)`** — first appearance in this lesson of this procedure; identical in real structure to `rand-find`, with one real addition: `(if (= count max-attempts) 'not-found ...)`, giving up and reporting real failure once the real attempt count reaches `max-attempts`, rather than continuing indefinitely.
- **`(expt 0.9 30)`** — `expt`, reused since Lesson 66; `0.9`, the real probability of *missing* on any single real attempt (`1 - 0.1`), raised to the real power `30`, the real number of independent attempts — the real, theoretical probability of missing on *every single one* of them.
- **The real, exact `82` failures out of `2,000`, a real `4.1\%$, closely matching the real, predicted `4.24\%$** — direct, measured confirmation: `rand-find-bounded` fails to find a real special element roughly `1` real time in `24`, a real, small but genuinely nonzero probability.

### Naming the Real Distinction

`rand-find`, given full real treatment in Concept Unit 3, is a real **Las Vegas algorithm**: it never returns a wrong answer — every real element it reports finding genuinely is special — but its own real running time (the real number of attempts before success) varies randomly, with no fixed upper bound at all. `rand-find-bounded`, this unit's own real subject, is a real **Monte Carlo algorithm**: its own real running time is fixed and guaranteed, at most `30` real attempts, but it carries a real, small, precisely computable chance, `4.24\%$, of reporting `'not-found` even when a real special element genuinely exists.

### CS Lens

This is Lesson 137's own real, honest-tradeoff discipline, applied to a real, general algorithmic design choice: exactly as Lesson 137 reported pruning's own real payoff honestly, instance by instance, rather than claiming a universal win, this unit names Las Vegas and Monte Carlo as two real, genuinely different tradeoffs — unbounded time for guaranteed correctness, or guaranteed time for a real, bounded, nonzero error rate — neither one a strictly better real choice than the other, only appropriate for different real requirements.

### SE Lens

The alternative to naming this real distinction precisely is treating "randomized algorithm" as a single, undifferentiated real category, leaving a real system's own designer to discover the difference only after a real, unbounded Las Vegas search causes an unacceptable, unpredictable real delay, or a real Monte Carlo algorithm's own small failure rate causes a real, silent wrong answer no one budgeted for. The real value of the precise vocabulary: it forces the real question — "does this system need a guaranteed answer, or a guaranteed deadline" — to be asked and answered explicitly, before either real risk becomes a real, unplanned surprise.

### Run It — Show the Real Output

```
$ guile randomized-algorithms-check.scm
=== CU4: Las Vegas (rand-find) versus Monte Carlo (rand-find-bounded) ===
real failure count, bounded at 30 attempts, 2000 real trials: 82
real failure rate: 0.041
predicted (1-p)^30: 0.042391158275216265
```

Verified this session — `rand-find-bounded`, a real Monte Carlo algorithm with a guaranteed, fixed real running time, fails `4.1\%$ of the real time across `2,000` trials, closely matching its own real, predicted `4.24\%$ failure rate — the real, precise price paid for trading away `rand-find`'s own real, unbounded-but-always-correct Las Vegas guarantee.

---

## Closing

### Connect the pieces

Two real rationales, one real, precise vocabulary:

1. **Rationale One, restated (Units 1–2):** randomness defeats a real, knowing adversary — Lesson 146's own real `100\%$-to-`2.2\%$ evidence.
2. **Rationale Two, discovered (Unit 3):** randomness makes real performance insensitive to input arrangement entirely — a real `91`-versus-`9.89` improvement, with no adversary involved.
3. **Las Vegas and Monte Carlo, named (Unit 4):** the identical real search technique, unbounded (always correct) versus bounded (a real, computable `4.24\%$ failure rate) — two genuinely different real tradeoffs.

Every claim in this lesson traces to real, executed code: a real, unfavorably-arranged array, a real, direct comparison between deterministic and randomized search, and a real, measured failure rate matching a real, theoretical prediction closely.

### What breaks without this

Suppose a real system's own designer, having read only Lesson 146's own real evidence, concluded that randomization is useful *only* against a deliberate adversary, and reached for a deterministic algorithm everywhere else, trusting average-case reasoning alone. Concept Unit 3's own real evidence shows precisely what that conclusion misses: a real, entirely honest, non-adversarial input arrangement can still produce real, dramatically worse deterministic performance than randomized sampling would have given, with no attacker anywhere in the picture.

### Exercises

1. **Observe.** Before checking, predict `rand-find-bounded`'s own real failure rate if `max-attempts` were doubled to `60`, using this lesson's own real `(1-p)^{\text{attempts}}$ formula to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Modify Concept Unit 3's own real array so the `10` special elements are placed at *random*, unpredictable positions instead of the fixed last `10`, and confirm, with real code, that `det-find`'s own real average cost (across many real trials, each with a fresh random arrangement) drops to be much closer to `rand-find`'s own real average — real evidence that `det-find`'s own real weakness was specific to *this* real, unfavorable arrangement, not general.
4. **Explain.** In your own words, explain why `rand-find`, as built, is correctly classified as Las Vegas rather than Monte Carlo, referencing what real property its own output always has, regardless of how long it takes to produce it.
5. **Explain.** Using this lesson's own real numbers, explain why a real system choosing between `rand-find` and `rand-find-bounded` would need to know something about its own real requirements — not just about the algorithms themselves — to make the real, correct choice between them.

### Definition of done

- [ ] You can state, precisely, two genuinely different real reasons an algorithm might use randomness, with a real, checked example of each.
- [ ] You can define Las Vegas and Monte Carlo algorithms precisely, and correctly classify `rand-find` and `rand-find-bounded` as one or the other.
- [ ] You can point to this lesson's own real `91`-versus-`9.89` and `4.1\%$-versus-`4.24\%$ numbers as direct evidence for Rationale Two and for the Monte Carlo tradeoff, respectively.
- [ ] You completed Exercises 1–5, including a real, checked comparison using a randomly-arranged array.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
