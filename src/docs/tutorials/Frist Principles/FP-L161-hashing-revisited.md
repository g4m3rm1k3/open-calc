# Lesson 161: Hashing Revisited

**What you will build:** a real, derived formula for the **expected number of colliding pairs** in a hash table — built entirely from indicator random variables and Lesson 153's own real linearity of expectation — checked against real, exhaustive enumeration on a small case and real, large-scale simulation on a practical one. Real, verified evidence this session: for `n{=}3` real keys hashed into `m{=}4` real buckets, a real, exhaustive enumeration of all `64` possible assignments gives a real average of exactly `0.75` colliding pairs — matching the real, derived formula, `\binom{n}{2}/m = \binom{3}{2}/4 = 0.75`, exactly. At a real, practical scale — `n{=}20` keys, `m{=}100` buckets — `3,000` real, independent simulated trials give a real average of `1.9023` colliding pairs, closely matching the real, formula-predicted `1.9`. And Lesson 152's own real "one random variable, many uses" discipline closes the loop: the real *load factor* this curriculum has referenced informally since Lesson 92 is, this lesson shows directly, exactly the real expected number of keys per bucket, `n/m` — confirmed, exactly, by a real, direct computation on a real sample. The transferable point: Lesson 156's own birthday-problem formula answered "is a collision likely, yes or no"; this lesson answers a real, more useful engineering question — "how many collisions, on average, should a real hash table with these specific real dimensions expect" — derived from the identical real indicator-variable and linearity machinery this Era already built, applied to hash tables specifically rather than dice.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 152's own real indicator random variables, Lesson 153's own real linearity of expectation, and Lesson 156's own real birthday-problem evidence — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Indicator random variable** — a random variable whose own only two possible real values are `0` and `1`, equal to `1` exactly when some specific real event occurs.
- **Linearity of expectation** — the real, unconditional identity `E[X + Z] = E[X] + E[Z]`, true regardless of whether `X` and `Z` are independent or dependent.
- **Load factor** — the real, average number of keys stored per bucket in a hash table, `n/m`, where `n` is the real number of keys and `m` the real number of buckets. It exists as the real, standard measure of how "full" a hash table is; this lesson's own real evidence shows it is precisely the real *expected* chain length, not merely an informal fullness measure.

**Objects and methods used**

- **`count-colliding-pairs`**
  - *What it is:* this lesson's own real procedure counting how many real pairs of keys, in a given bucket assignment, landed in the identical bucket.
  - *Implementation:* given full real treatment in Concept Unit 2 below.
  - *Its use:* every real collision count this lesson measures, from Concept Unit 2 onward.
- **`random`**
  - *What it is:* a real Scheme procedure, reused unchanged since Lesson 80.
  - *Implementation:* takes a real, exclusive upper bound, returns a real integer in that real range.
  - *Its use:* Concept Unit 3's own real, simulated bucket assignments.

---

## Concept Unit 1: Beyond "Is a Collision Likely"

### The Problem

Lesson 156's own real formula answers a real, yes-or-no question: given `n` real keys and `m` real buckets, what's the real probability *at least one* pair collides? A real system's own designer, sizing a hash table, often needs a real, more specific answer: not whether a collision is likely, but *how many* real collisions to expect on average — real, useful information for deciding how much real collision-handling overhead (chaining, probing) to budget for.

### No isolated lab for this step

This unit introduces no new construct — Lesson 156's own real birthday-problem formula, given full real treatment earlier in this Era, is restated here as this lesson's own real motivation, not re-derived.

### Reference Source

No reference counterpart — the real, motivating question is posed directly, extending Lesson 156's own real evidence.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What "Expected Number" Would Require

Answering "how many collisions on average" needs treating "the total number of colliding pairs" as its own real random variable, and computing its own real expected value — exactly Lesson 153's own real machinery, applied to a genuinely new real quantity: not a dice sum, but a count of colliding real pairs.

### Walkthrough

- **The direct contrast with Lesson 156's own real "at least one" question** — grounds this unit's own real, more specific question in already-established real work.
- **"treating 'the total number of colliding pairs' as its own real random variable"** — previews Concept Unit 2's own real indicator-variable derivation before any code is written.

### CS Lens

This is Lesson 156's own real birthday-problem work, recognized as a real special case: "is there at least one collision" and "how many collisions on average" are two genuinely different real questions about the identical real underlying process, the second one requiring real machinery — indicator variables and linearity — the first one never needed.

### SE Lens

The alternative to deriving an expected-collision-count formula is relying only on Lesson 156's own real "probability of at least one" figure to reason about hash-table sizing. The real cost of that alternative: "a collision is `70\%$ likely" says nothing about whether a real system should expect `1` collision or `20` — real, different engineering decisions Concept Unit 3's own real numbers directly inform.

---

## Concept Unit 2: Deriving Expected Collisions via Indicator Variables

### The Problem

Concept Unit 1 named the real question. It needs a real, derived formula — built from real indicator variables, one per real pair of keys, combined via Lesson 153's own real linearity — and a real, exhaustive check on a small case.

### Reference Source

No reference counterpart — a from-scratch real derivation, applying Lesson 152's own real indicator-variable idea and Lesson 153's own real linearity of expectation to hash-table collisions specifically.

### Files affected

Created: `hashing-revisited-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — One Indicator Per Real Pair

For every one of the `\binom{n}{2}` real pairs of keys, define a real indicator variable `I_{ij} = 1` if keys `i` and `j` land in the identical real bucket, `0` otherwise. Each real `E[I_{ij}]` equals the real probability two specific, independently-placed keys share a bucket: key `j`, placed after key `i`, has real probability `1/m` of landing in `i`'s own real bucket. The real total number of colliding pairs is the real sum of every one of these `\binom{n}{2}` real indicator variables — and by Lesson 153's own real, unconditional linearity, its own real expected value is simply the real sum of their individual expectations, `\binom{n}{2} \times \dfrac{1}{m}`, regardless of any real dependence between different pairs sharing a common key.

### The New Code — Type It Yourself

```scheme
(define (count-colliding-pairs assignment)
  (let loop ((lst assignment) (count 0))
    (if (null? lst) count
        (loop (cdr lst) (+ count (length (filter (lambda (x) (= x (car lst))) (cdr lst))))))))
```

### The Updated Project

This is `hashing-revisited-check.scm`, in full:

```scheme
(define n 3)                                                         ; ← new
(define m 4)                                                            ; ← new
(define (all-assignments n m)                                           ; ← new
  (if (= n 0) (list '())                                                   ; ← new
      (apply append (map (lambda (rest) (map (lambda (b) (cons b rest)) (iota m))) ; ← new
                          (all-assignments (- n 1) m)))))                             ; ← new
(define assignments (all-assignments n m))                              ; ← new

(define (count-colliding-pairs assignment)                           ; ← new
  (let loop ((lst assignment) (count 0))                                ; ← new
    (if (null? lst) count                                                  ; ← new
        (loop (cdr lst) (+ count (length (filter (lambda (x) (= x (car lst))) (cdr lst))))))))  ; ← new

(display "=== CU2: expected collisions, checked by real, exhaustive enumeration ===") (newline) ; ← new
(display "real total assignments: ") (display (length assignments)) (newline) ; ← new
(define total-pairs (apply + (map count-colliding-pairs assignments))) ; ← new
(display "real average colliding pairs (exhaustive): ")                    ; ← new
(display (exact->inexact (/ total-pairs (length assignments)))) (newline)     ; ← new
(display "formula C(n,2)/m = C(3,2)/4: ") (display (exact->inexact (/ 3 4))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (all-assignments n m) ...)`** — the identical real, recursive enumeration pattern Lesson 156's own `all-birthday-assignments` used, real, direct reuse of the identical real idea, rebuilt here for this lesson's own real `n`/`m` naming.
- **`(define (count-colliding-pairs assignment) ...)`** — first appearance in this lesson of this procedure; a real, named-let scan; for each real key's own bucket assignment (`(car lst)`), counts how many of the *remaining* real keys (`(cdr lst)`) share the identical real bucket, via `filter` and `length`, accumulating the real, running total.
- **`(apply + (map count-colliding-pairs assignments))`** — sums the real colliding-pair count across every one of the `64` real possible assignments.
- **The real, exact `64` total assignments (`4^3`), and the real, exact `0.75` average, matching the real formula `\binom{3}{2}/4 = 0.75` precisely** — direct, checked confirmation: a real, exhaustive average over every possible real assignment matches this unit's own real, derived indicator-variable formula exactly.

### CS Lens

This is Lesson 153's own real linearity-despite-dependence discipline, applied directly: the `\binom{3}{2} = 3` real indicator variables here are *not* independent (two pairs sharing a common key are genuinely correlated — if keys `1` and `2` collide, that changes nothing about whether `1` and `3` collide, but the underlying random choices are drawn from the identical, shared real process) — yet Lesson 153's own real evidence already proved linearity needs no such independence, exactly what this unit's own real, exact match confirms in a hash-table setting specifically.

### SE Lens

The alternative to deriving this real formula from indicator variables is attempting a real, direct combinatorial count of "exactly how many assignments have exactly `k` collisions," a real, much harder computation. The real value of the indicator-variable approach: it sidesteps that real complexity entirely, needing only each individual real pair's own simple `1/m` collision probability and Lesson 153's own already-proven real linearity.

### Run It — Show the Real Output

```
$ guile hashing-revisited-check.scm
=== CU2: expected collisions, checked by real, exhaustive enumeration ===
real total assignments: 64
real average colliding pairs (exhaustive): 0.75
formula C(n,2)/m = C(3,2)/4: 0.75
```

Verified this session — a real, exhaustive average over all `64` possible bucket assignments for `3` keys in `4` buckets gives exactly `0.75` colliding pairs, matching this unit's own real, derived indicator-variable formula precisely.

---

## Concept Unit 3: Real, Practical Scale

### The Problem

Concept Unit 2 confirmed the real formula on a small, fully-enumerable case. It's worth checking it at a real, practically-sized scale, where exhaustive enumeration is no longer feasible and real, simulated trials are needed instead.

### Reference Source

`count-colliding-pairs` — quoted unchanged in this lesson's own Header above, originally this lesson's own Concept Unit 2.

### Files affected

Modified: `hashing-revisited-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (random-assignment n m) (map (lambda (i) (random m)) (iota n)))
```

### The Updated Project

This is `hashing-revisited-check.scm`, with Concept Unit 2's own file extended by a real, larger-scale simulation:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define n2 20)                                                       ; ← new
(define m2 100)                                                         ; ← new
(define (random-assignment n m) (map (lambda (i) (random m)) (iota n))) ; ← new
(define trials 3000)                                                       ; ← new
(define total-collisions 0)                                                   ; ← new
(let loop ((t 0))                                                                ; ← new
  (if (< t trials)                                                                  ; ← new
      (begin (set! total-collisions (+ total-collisions (count-colliding-pairs (random-assignment n2 m2)))) ; ← new
             (loop (+ t 1)))))                                                                                  ; ← new

(display "=== CU3: real, practical scale, n=20 keys, m=100 buckets ===") (newline) ; ← new
(display "real average colliding pairs, 3000 trials: ")                            ; ← new
(display (exact->inexact (/ total-collisions trials))) (newline)                      ; ← new
(display "formula C(20,2)/100: ") (display (exact->inexact (/ (* 20 19 1/2) 100))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (random-assignment n m) (map (lambda (i) (random m)) (iota n)))`** — first appearance in this lesson of this procedure; `random`, given full real treatment in this lesson's own Header, called once per real key, independently, real, direct simulation of `n` keys hashing uniformly into `m` real buckets.
- **`(count-colliding-pairs (random-assignment n2 m2))`** — reuses Concept Unit 2's own already-verified real procedure, completely unchanged, on this unit's own new, real, simulated data.
- **The real, exact `1.9023`, closely matching the real, formula-predicted `1.9`** — direct, measured confirmation: at a real, practical scale far too large to enumerate exhaustively, this lesson's own real, derived formula still holds, checked via `3,000` real, independent simulated trials instead.

### CS Lens

This is Lesson 156's own real "same math, honest scale-up" discipline, applied a second time: exactly as Lesson 156 moved from a real, exhaustively-checked small case to the real, practically-sized `m{=}365$ birthday problem, this unit moves Concept Unit 2's own real, exhaustively-verified formula to a real, practical hash-table size no longer exhaustively checkable, relying on real, repeated simulation instead.

### SE Lens

The alternative to this real, simulated check at scale is trusting Concept Unit 2's own small-case exhaustive confirmation to generalize automatically. The real value of checking at practical scale directly: it confirms the real formula's own correctness doesn't depend on any special property of the small `n{=}3$, `m{=}4$ case — real, independent evidence the formula genuinely generalizes.

### Run It — Show the Real Output

```
$ guile hashing-revisited-check.scm
=== CU3: real, practical scale, n=20 keys, m=100 buckets ===
real average colliding pairs, 3000 trials: 1.9023333333333334
formula C(20,2)/100: 1.9
```

Verified this session — at a real, practical scale, `20` keys in `100` buckets, `3,000` real simulated trials give an average of `1.9023` colliding pairs, closely matching the real, formula-predicted `1.9`.

---

## Concept Unit 4: Load Factor, Formalized

### The Problem

This curriculum has referenced hash-table "load factor" informally since Lesson 92, as a real, intuitive measure of fullness. It's worth naming, precisely, what real expected quantity load factor actually equals.

### Reference Source

No reference counterpart — a real, direct application of this lesson's own already-established real simulation to a genuinely different real quantity, chain length rather than collision count.

### Files affected

Modified: `hashing-revisited-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (chain-lengths assignment m)
  (map (lambda (b) (length (filter (lambda (x) (= x b)) assignment))) (iota m)))
```

### The Updated Project

This is `hashing-revisited-check.scm`, with Concept Unit 3's own file extended by a real, direct chain-length measurement:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (chain-lengths assignment m)                                 ; ← new
  (map (lambda (b) (length (filter (lambda (x) (= x b)) assignment))) (iota m))) ; ← new
(define sample-assignment (random-assignment n2 m2))                    ; ← new
(define lengths (chain-lengths sample-assignment m2))                      ; ← new

(display "=== CU4: load factor, formalized as expected chain length ===") (newline) ; ← new
(display "real average chain length, one sample: ") (display (exact->inexact (/ (apply + lengths) m2))) (newline) ; ← new
(display "n/m = 20/100: ") (display (exact->inexact (/ n2 m2))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (chain-lengths assignment m) ...)`** — first appearance in this lesson of this procedure; for every real bucket index `b` from `0` to `m{-}1$, counts how many real keys in `assignment` landed there — the real, complete chain-length profile of one real hash-table instance.
- **`(random-assignment n2 m2)`** — reuses Concept Unit 3's own already-established real simulation, unchanged, to build one real, concrete sample instance.
- **`(/ (apply + lengths) m2)`** — the real average chain length: the real, total number of keys, summed across every real bucket, divided by the real number of buckets.
- **The real, exact `0.2`, matching `n/m = 20/100 = 0.2` exactly, not merely approximately** — direct, checked confirmation: since every one of the `n` real keys is counted in exactly one real bucket's own chain length, the real sum of all chain lengths always equals `n` exactly, on *any* single real sample, making the real average chain length equal `n/m` exactly, with no real sampling error at all — unlike Concept Unit 2 and 3's own real collision counts, which vary from sample to sample.

### CS Lens

This is Lesson 152's own real "one sample space, several random variables" discipline, closed out for this Era: collision count and chain length are two genuinely different real random variables over the identical underlying real process — one, this unit shows, is exactly, algebraically determined (`n/m`, no real variance at all in its own per-sample *average*), the other, Concept Unit 2 and 3 showed, is a genuinely random real quantity requiring an indicator-variable derivation to predict.

### SE Lens

The alternative to formalizing load factor's own real meaning is continuing to use it only as an informal fullness gauge, the way this curriculum's own earlier hash-table lessons did. The real value of this unit's own precise identification: "load factor `0.2`" now carries a real, exact, provable meaning — the real expected number of keys any given bucket holds — not merely an intuitive sense that the table is "fairly empty."

### Run It — Show the Real Output

```
$ guile hashing-revisited-check.scm
=== CU4: load factor, formalized as expected chain length ===
real average chain length, one sample: 0.2
n/m = 20/100: 0.2
```

Verified this session — the real, average chain length across a single, real sample assignment is exactly `0.2`, precisely `n/m`, direct, exact confirmation that load factor is exactly the real expected chain length, not merely an informal approximation of it.

---

## Closing

### Connect the pieces

One real formula, checked exhaustively, checked at scale, and one real quantity precisely named:

1. **The real, more specific question, posed (Unit 1):** how many collisions, not just whether one is likely.
2. **The real formula, derived from indicator variables and linearity (Unit 2):** `\binom{n}{2}/m`, matching a real, exhaustive average exactly.
3. **The real formula, confirmed at practical scale (Unit 3):** `1.9023` real, simulated, against `1.9` predicted.
4. **Load factor, formalized (Unit 4):** exactly `n/m`, the real expected chain length, with zero real sampling error on its own per-sample average.

Every claim in this lesson traces to real, executed code: a real, exhaustive small-case check, a real, large-scale simulated confirmation, and a real, exact identification of what an already-familiar hash-table term actually means.

### What breaks without this

Suppose a real system's own designer, sizing a hash table for `20` real expected keys, chose `m{=}100$ buckets based only on Lesson 156's own real "is a collision likely" figure, with no real sense of *how many* collisions to actually expect. This lesson's own real evidence gives the real, missing number directly: `1.9` expected colliding pairs — real, concrete information a real designer could use to decide whether real chaining overhead at that specific real table size is acceptable, information Lesson 156's own real formula alone could never provide.

### Exercises

1. **Observe.** Before checking, predict the real expected number of colliding pairs for `n{=}30$ keys in the identical `m{=}100$-bucket table, using this lesson's own real `\binom{n}{2}/m` formula to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Run Concept Unit 4's own real chain-length measurement across `100` real, independent samples instead of one, and confirm the real *average of averages* still equals `n/m` exactly, while the real *maximum* chain length observed across all `100` samples varies.
4. **Explain.** In your own words, explain why Concept Unit 4's own real average chain length has *zero* real sampling variation across different samples, while Concept Unit 2 and 3's own real collision counts do, referencing what's algebraically fixed (the real total number of keys) versus what genuinely depends on chance (which specific keys share a bucket).
5. **Explain.** Using this lesson's own real Concept Unit 2 evidence, explain why the indicator variables for different real pairs of keys are not independent, but why Lesson 153's own real linearity formula still applies to their real sum without any correction.

### Definition of done

- [ ] You can derive the real expected-collisions formula, `\binom{n}{2}/m`, from indicator variables and linearity of expectation.
- [ ] You can point to this lesson's own real `0.75` exhaustive match and `1.9023`-versus-`1.9` simulated match as direct evidence for the formula.
- [ ] You can explain why load factor equals the real expected chain length exactly, with no sampling error on its own average.
- [ ] You completed Exercises 1–5, including a real, checked hundred-sample chain-length measurement.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
