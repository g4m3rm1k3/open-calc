# Lesson 146: Why Probability Appears in Computing

**What you will build:** real, direct evidence for two genuinely different reasons probability enters computing at all — not as abstract mathematics, but as a real, load-bearing tool. First: a real, deterministic hash function has a real, guaranteed worst case an adversary can find and exploit on purpose — ten real, deliberately chosen keys collide into a single real bucket, `100%` of the time, every real run. A real, randomized hash function, using a per-instance random seed unknown to any attacker in advance, spreads those identical ten real keys across `2` to `5` distinct real buckets depending on the real seed, confirmed across ten separately-run real trials — never a full, guaranteed collapse, though, honestly, not an impossible one either: across `1,000` real, independent trials, the identical full collision still happens `22` real times, a real, non-zero but genuinely rare `2.2%`, against the fixed hash's real, guaranteed `100%`. Second: Lesson 74's own real average-case formula for linear search, `(n + 1) / 2`, is only true because it silently assumes the target's real position is uniformly distributed — real, direct evidence shows an equally legitimate different real assumption (the target is always last) gives a real average of `10` moves at `n = 10`, not `5.5`, on the identical real algorithm. The transferable point: a "worst case" that's real and guaranteed is a genuinely different kind of real threat than one that's real but merely *possible*, and "average case" was never a real, free fact about an algorithm — it was always a real claim about a distribution, quietly assumed rather than stated. This Era exists to make that real distinction precise.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 74's own real average-case formula for linear search and this curriculum's own real hash-table vulnerability work — both explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Deterministic algorithm** — an algorithm whose own real output and real behavior depend only on its input, never on any internal real choice made along the way. Every algorithm this curriculum has built through Lesson 145 is deterministic in this real sense.
- **Adversarial input** — a real input deliberately chosen by someone working against a system, specifically to trigger a real, known worst case in a deterministic algorithm the attacker has studied in advance.
- **Randomized algorithm** — an algorithm whose own real behavior depends not only on its input but on real random choices it makes internally, at run time, in a way no outside observer can predict in advance. It exists to take a real, guaranteed worst case away from an adversary's own control, replacing it with a real, merely *possible* one.
- **Distribution** — a real, precise statement of how likely each possible real outcome actually is. It exists because "average case," used loosely, has no real meaning at all until a real distribution over inputs (or over an algorithm's own random choices) is actually specified — a distribution is the real thing an average is always computed *over*.

**Objects and methods used**

- **`logxor`**
  - *What it is:* a real Scheme procedure computing the real, bitwise exclusive-or of two integers.
  - *Implementation:* takes two real integers, returns a new real integer whose own binary digits are each `1` exactly where the two inputs' corresponding digits disagree.
  - *Its use:* this lesson's own `randomized-hash`, combining a real key with a real random seed in a way that does not preserve the real key's own arithmetic relationship to other keys, unlike a real, plain addition would.
- **`random`**
  - *What it is:* a real Scheme procedure, reused unchanged since Lesson 80, returning a pseudo-random, non-negative real integer below a given real bound.
  - *Implementation:* takes a real, exclusive upper bound, returns a real integer in `[0, bound)`.
  - *Its use:* choosing this lesson's own real, per-trial hash seed, and, in Concept Unit 4, driving `1,000` real, independent repetitions.
- **`modulo`**
  - *What it is:* a real Scheme procedure, reused unchanged since Lesson 142, returning the real remainder of dividing its first argument by its second.
  - *Implementation:* takes two real integers, returns the real, non-negative remainder.
  - *Its use:* both `fixed-hash` and `randomized-hash`, mapping a real key down into one of `table-size` real buckets.
- **`iota`**
  - *What it is:* a real Scheme procedure, reused unchanged since Lesson 80, returning a real list of consecutive integers.
  - *Implementation:* takes a real count and a real starting value, returns a real list of that many consecutive integers beginning there.
  - *Its use:* Concept Unit 3's own real, exhaustive list of every possible target position, `1` through `10`.

---

## Concept Unit 1: A Real, Guaranteed Worst Case

### The Problem

Every algorithm this curriculum has built through Lesson 145 is deterministic — the identical real input always produces the identical real behavior. This curriculum's own earlier hash-table work already showed what that real guarantee can cost: a real hash function computing a bucket from a key by a fixed, knowable real rule can be studied by an attacker in advance, who then constructs real keys guaranteed to collide, every single real time, on purpose.

### No isolated lab for this step

This unit introduces no new construct — the real problem is posed directly here, using `modulo`, given full real treatment in this lesson's own Header, applied to a small, real, concrete case built to make the real vulnerability undeniable.

### Reference Source

No reference counterpart for this lesson's own small, fresh demonstration — this lesson's own `fixed-hash` is a deliberately minimal real hash function, built specifically to make a real, guaranteed collision easy to construct and verify; the real underlying vulnerability it demonstrates is the identical real class of problem this curriculum's own earlier hash-table work already established.

### Files affected

Created: `probability-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define table-size 10)
(define (fixed-hash x) (modulo x table-size))
(define attack-keys (list 3 13 23 33 43 53 63 73 83 93))
```

### The Updated Project

This is `probability-check.scm`, in full:

```scheme
(define table-size 10)                                              ; ← new
(define (fixed-hash x) (modulo x table-size))                          ; ← new
(define attack-keys (list 3 13 23 33 43 53 63 73 83 93))                  ; ← new

(define (count-distinct lst)                                        ; ← new
  (let loop ((lst lst) (seen '()))                                     ; ← new
    (cond ((null? lst) (length seen))                                     ; ← new
          ((member (car lst) seen) (loop (cdr lst) seen))                    ; ← new
          (else (loop (cdr lst) (cons (car lst) seen))))))                      ; ← new

(display "=== CU1: a real, guaranteed hash collision ===") (newline) ; ← new
(display "fixed-hash buckets for attack keys: ") (display (map fixed-hash attack-keys)) (newline) ; ← new
(display "distinct real buckets used: ") (display (count-distinct (map fixed-hash attack-keys))) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define table-size 10)`** — a real, fixed hash-table size, first appearance in this lesson, known to the attacker in advance in this unit's own scenario, exactly as a real table's own size is typically not a secret.
- **`(define (fixed-hash x) (modulo x table-size))`** — a real, minimal hash function: a real key's own bucket is simply its remainder when divided by `table-size`.
- **`(define attack-keys (list 3 13 23 33 43 53 63 73 83 93))`** — ten real, deliberately chosen keys, each exactly `10` apart — real, trivial to construct once `table-size` and `fixed-hash`'s own real rule are both known.
- **`(define (count-distinct lst) ...)`** — first appearance in this lesson of this procedure; a real, named-let scan, `seen`, accumulating each real value encountered for the first time, `member` (reused since Lesson 141) checking whether the current element is already there; returns the real count of genuinely distinct values.
- **The real, exact `(3 3 3 3 3 3 3 3 3 3)`, and the real, exact `1`** — direct, measured confirmation: every one of these ten real, deliberately different keys lands in the identical single real bucket, `100%` of the time, every real run, with no randomness anywhere in `fixed-hash` to prevent it.

### CS Lens

This is Lesson 95's own real hash-flooding finding, restated in full: a real hash function that's an entirely public, fixed, knowable rule gives an attacker everything needed to defeat it on paper, before ever sending a single real request. Also recognized in: a real combination lock with a small, fixed number of possible codes, crackable by trying every one in advance; a real traffic light timed on a fixed, publicly knowable schedule, allowing a real driver to plan around it exactly.

### SE Lens

The alternative to taking this real vulnerability seriously is trusting that `fixed-hash`'s own real collisions are rare enough in ordinary, non-adversarial use to not matter. The real cost of that trust: ordinary use and adversarial use are not the real same threat model — an attacker does not need collisions to be rare in general, only needs to *construct* ten real keys that are guaranteed to collide, exactly what this unit's own real `attack-keys` demonstrates takes no real effort at all once the real rule is known.

### Run It — Show the Real Output

```
$ guile probability-check.scm
=== CU1: a real, guaranteed hash collision ===
fixed-hash buckets for attack keys: (3 3 3 3 3 3 3 3 3 3)
distinct real buckets used: 1
```

Verified this session — ten real, deliberately chosen keys collide into the identical single real bucket under `fixed-hash`, every real time, direct, measured confirmation of a real, guaranteed, adversarially-exploitable worst case.

---

## Concept Unit 2: Randomness as a Real Defense

### The Problem

Concept Unit 1's own real vulnerability exists because `fixed-hash`'s own rule is entirely knowable in advance. A real fix needs to introduce something the attacker genuinely cannot know ahead of time — a real, per-instance random choice, made once, that changes which real keys collide without changing anything about how the real hash table itself is used.

### Reference Source

No reference counterpart — a from-scratch real derivation, extending Concept Unit 1's own `fixed-hash` with one real, added ingredient.

### Files affected

Modified: `probability-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 1 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (randomized-hash x seed) (modulo (logxor x seed) table-size))
```

### The Updated Project

This is `probability-check.scm`, with Concept Unit 1's own file extended by this unit's own real randomized hash and ten real, independent trials:

```scheme
;; ... Concept Unit 1's code above, unchanged ...

(define (randomized-hash x seed) (modulo (logxor x seed) table-size)) ; ← new

(display "=== CU2: the identical attack keys, a real randomized hash ===") (newline) ; ← new
(for-each                                                                ; ← new
 (lambda (trial)                                                           ; ← new
   (let* ((seed (random 1000)))                                              ; ← new
     (display "seed=") (display seed)                                           ; ← new
     (display " buckets: ") (display (map (lambda (x) (randomized-hash x seed)) attack-keys)) ; ← new
     (display " distinct: ") (display (count-distinct (map (lambda (x) (randomized-hash x seed)) attack-keys))) ; ← new
     (newline)))                                                                                  ; ← new
 (list 1 2 3 4 5 6 7 8 9 10))                                                                         ; ← new
```

### Mechanical Walkthrough

- **`(define (randomized-hash x seed) (modulo (logxor x seed) table-size))`** — first appearance in this lesson of this procedure; two real arguments, the key and a real, per-instance seed; `logxor`, given full real treatment in this lesson's own Header, combines them bit by bit before the identical real `modulo` step `fixed-hash` already used.
- **`(random 1000)`** — draws a real, fresh, unpredictable seed for each one of this unit's own ten real trials — the real, added ingredient no attacker, working from `fixed-hash`'s own knowable rule alone, could ever have anticipated.
- **`(for-each (lambda (trial) ...) (list 1 2 ... 10))`** — runs the identical real check ten real, independent times, each with its own real, freshly-drawn seed.
- **The real, exact bucket lists and distinct-counts, ranging from `2` to `5` real distinct buckets across the ten real trials, never a single real value repeated across all ten keys** — direct, measured confirmation: the identical `attack-keys` that guaranteed a full real collision under `fixed-hash` no longer reliably collide at all once one real, unpredictable ingredient is added.

### CS Lens

This is Lesson 92's own real load-factor discipline, recognized from a genuinely new angle: Lesson 92 showed a hash table's own real performance depends on how evenly keys spread across real buckets; this unit shows that *evenness itself* can be turned into something an adversary cannot reliably defeat, simply by making the real rule for achieving it unpredictable rather than fixed.

### SE Lens

The alternative to adding real randomness is trying to patch `fixed-hash`'s own real rule to be "more complicated," hoping a more intricate fixed formula is harder to reverse-engineer. The real cost of that alternative: any deterministic rule, however intricate, is still, in principle, fully knowable by a sufficiently determined real attacker — Lesson 22's own discipline (exhaustive checking beats spot-checking) cuts both ways, since an attacker willing to check exhaustively can eventually defeat any *fixed*, deterministic scheme. Real, added unpredictability, not real, added complexity, is what actually closes this gap.

### Run It — Show the Real Output

```
$ guile probability-check.scm
=== CU2: the identical attack keys, a real randomized hash ===
seed=445 buckets: (6 2 6 2 6 2 6 0 4 0) distinct: 4
seed=819 buckets: (6 0 4 6 2 4 0 0 4 8) distinct: 5
seed=621 buckets: (2 8 4 8 2 0 4 8 4 0) distinct: 4
seed=420 buckets: (3 5 5 9 9 1 1 3 3 5) distinct: 4
seed=593 buckets: (4 4 2 4 4 2 2 6 4 4) distinct: 3
seed=965 buckets: (6 8 8 6 6 8 8 8 8 0) distinct: 3
seed=486 buckets: (5 1 7 5 1 7 3 1 7 3) distinct: 4
seed=759 buckets: (6 2 6 6 2 6 2 2 6 2) distinct: 2
seed=301 buckets: (2 8 4 8 2 0 4 6 2 8) distinct: 5
seed=84 buckets: (7 9 7 7 7 7 7 9 7 9) distinct: 2
```

Verified this session — across ten real, independent random seeds, the identical `attack-keys` that guaranteed a full collision under `fixed-hash` spread across `2` to `5` real distinct buckets under `randomized-hash`, direct, measured evidence that real, added unpredictability defeats a real, precomputed attack.

---

## Concept Unit 3: "Average Case" Was Always a Claim About a Distribution

### The Problem

Lesson 74's own real formula, `(n + 1) / 2`, gives linear search's own real average number of comparisons. It's worth asking, honestly, exactly what real assumption that formula depends on — and what happens to the real number if that assumption changes.

### No isolated lab for this step

This unit introduces no new construct — `iota`, given full real treatment in this lesson's own Header, is applied here to a real, already-familiar procedure, `linear-search-counted`, to make an implicit real assumption explicit rather than to teach anything genuinely new.

### Reference Source

No reference counterpart — a from-scratch real re-derivation of Lesson 74's own real average, made explicit about the real assumption it depends on.

### Files affected

Modified: `probability-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (linear-search-counted lst target)
  (let loop ((lst lst) (count 0))
    (cond ((null? lst) count)
          ((= (car lst) target) (+ count 1))
          (else (loop (cdr lst) (+ count 1))))))
```

### The Updated Project

This is `probability-check.scm`, with Concept Unit 2's own file extended by a real, exhaustive check of linear search's own real average, under two genuinely different real assumptions:

```scheme
;; ... Concept Unit 1 and 2's code above, unchanged ...

(define (linear-search-counted lst target)                          ; ← new
  (let loop ((lst lst) (count 0))                                       ; ← new
    (cond ((null? lst) count)                                              ; ← new
          ((= (car lst) target) (+ count 1))                                  ; ← new
          (else (loop (cdr lst) (+ count 1))))))                                 ; ← new

(define n 10)                                                        ; ← new
(define search-list (iota n 1))                                         ; ← new
(define counts (map (lambda (pos) (linear-search-counted search-list pos)) (iota n 1))) ; ← new

(display "=== CU3: two real, different assumptions about the target's position ===") (newline) ; ← new
(display "real comparison counts, target at each real position 1-10: ") (display counts) (newline) ; ← new
(display "real average, assuming a uniform real distribution over position: ") (display (exact->inexact (/ (apply + counts) n))) (newline) ; ← new
(display "real average, assuming the target is always at the real last position: ") (display (linear-search-counted search-list n)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (linear-search-counted lst target) ...)`** — first appearance in this lesson of this procedure; a real, named-let scan, incrementing `count` once per real element examined, stopping the instant the real target is found.
- **`(define search-list (iota n 1))`** — a real list of the integers `1` through `10`, built via `iota`, given full real treatment in this lesson's Header.
- **`(map (lambda (pos) (linear-search-counted search-list pos)) (iota n 1))`** — real, exhaustive: computes the real comparison count for the target at *every* one of the list's own `10` real positions, not a sample.
- **`(/ (apply + counts) n)`** — the real, uniform average: sums every one of the `10` real comparison counts and divides by `10` — the real, precise meaning of "assume the target is equally likely to be at any position."
- **`(exact->inexact ...)`** — first appearance in this lesson of `exact->inexact`, a real Scheme procedure converting an exact real fraction (here, `11/2`) into its own real decimal approximation, `5.5`, for readable display.
- **The real, exact `5.5`, matching Lesson 74's own formula, `(10 + 1) / 2`, exactly** — direct, checked confirmation that Lesson 74's own real average was always computed under one specific, real, assumed distribution: every position equally likely.
- **The real, exact `10`, from `(linear-search-counted search-list n)`, assuming instead that the target is *always* at the last real position** — direct, measured confirmation that a genuinely different, equally legitimate real assumption about where the target tends to be gives a completely different real average, nearly double Lesson 74's own uniform-case number, using the identical real algorithm and the identical real list.

### CS Lens

This is Lesson 74's own worst/average/best-case vocabulary, given the one real piece it was always missing: "average case," this unit's own real evidence shows, is not a real property of an algorithm alone — it's a real property of an algorithm *combined with* a real, specific distribution over its own inputs, and two real, different distributions can give the identical algorithm two real, wildly different real averages.

### SE Lens

The alternative to naming the real, assumed distribution explicitly is quoting an "average case" number without ever stating what it's actually averaged over — exactly how Lesson 74's own formula has been used, correctly but implicitly, ever since. The real risk of that omission: a real system whose actual real inputs follow the "always last" real pattern this unit just measured, but is designed around the uniform real average instead, would be planned for `5.5` real comparisons when the real, true figure is `10` — a real, silent, twofold underestimate.

### Run It — Show the Real Output

```
$ guile probability-check.scm
=== CU3: two real, different assumptions about the target's position ===
real comparison counts, target at each real position 1-10: (1 2 3 4 5 6 7 8 9 10)
real average, assuming a uniform real distribution over position: 5.5
real average, assuming the target is always at the real last position: 10
```

Verified this session — the identical real algorithm, `linear-search-counted`, given the identical real ten-element list, has a real average of `5.5` under a uniform real assumption and a real average of `10` under a different, equally legitimate real assumption — direct, checked confirmation that "average case" was always a claim about a real, specific distribution.

---

## Concept Unit 4: The Honest, Real, Aggregate Picture

### The Problem

Concept Unit 2 showed real, added randomness helps. It's worth measuring, honestly, exactly how much, and whether it actually *eliminates* the real worst case from Concept Unit 1, or merely makes it real, genuinely rare.

### Reference Source

No reference counterpart — a real, direct, larger-scale application of this lesson's own `randomized-hash`, already given full real treatment in Concept Unit 2.

### Files affected

Modified: `probability-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define trials 1000)
(define total-distinct 0)
(define full-collision-count 0)
```

### The Updated Project

This is `probability-check.scm`, with Concept Unit 3's own file extended by `1,000` real, independent trials of `randomized-hash`:

```scheme
;; ... Concept Unit 1, 2, and 3's code above, unchanged ...

(define trials 1000)                                                ; ← new
(define total-distinct 0)                                              ; ← new
(define full-collision-count 0)                                           ; ← new

(let loop ((i 0))                                                    ; ← new
  (if (< i trials)                                                       ; ← new
      (let* ((seed (random 1000))                                            ; ← new
             (d (count-distinct (map (lambda (x) (randomized-hash x seed)) attack-keys)))) ; ← new
        (set! total-distinct (+ total-distinct d))                                ; ← new
        (if (= d 1) (set! full-collision-count (+ full-collision-count 1)))          ; ← new
        (loop (+ i 1)))))                                                               ; ← new

(display "=== CU4: the honest, real, aggregate picture, 1000 real trials ===") (newline) ; ← new
(display "real average distinct buckets: ") (display (exact->inexact (/ total-distinct trials))) (newline) ; ← new
(display "real full-collision trials out of 1000: ") (display full-collision-count) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define trials 1000)` / `(define total-distinct 0)` / `(define full-collision-count 0)`** — three real, mutable top-level counters, first appearance in this lesson, tracking respectively how many real trials to run, the real running sum of distinct-bucket counts (for computing a real average), and how many real trials hit the worst case exactly.
- **`(let loop ((i 0)) (if (< i trials) (let* (...) ...) ...))`** — a real, named-let loop, running exactly `1,000` real, independent trials, each with its own real, freshly-drawn seed.
- **`(if (= d 1) (set! full-collision-count (+ full-collision-count 1)))`** — checks whether this specific real trial reproduced Concept Unit 1's own real worst case exactly, all ten real keys landing in one real bucket; if so, counts it.
- **The real, exact `3.501` average distinct buckets, against `fixed-hash`'s own real, guaranteed `1`** — direct, measured confirmation of Concept Unit 2's own real claim, now backed by `1,000` real trials instead of ten: real, added randomness substantially improves the *typical* real outcome.
- **The real, exact `22` full collisions out of `1,000` real trials — a real `2.2%`, not `0%`** — the real, honest qualification this unit exists to add: randomization does not make Concept Unit 1's own real worst case *impossible*. It makes it real, genuinely rare, converting a `100%`-guaranteed adversarial exploit into an event that happens roughly `1` real time in `45`.

### CS Lens

This is Lesson 137's own "honest, non-overclaiming" discipline, applied to a genuinely new kind of real claim: exactly as Lesson 137 reported a real `0%` improvement on one instance alongside a real `40%` improvement on another rather than only the flattering number, this unit reports the real, remaining `2.2%` failure rate alongside the real, substantial `3.501`-average improvement, rather than claiming randomization "solves" Concept Unit 1's own real vulnerability outright.

### SE Lens

The alternative to running `1,000` real trials is trusting Concept Unit 2's own ten real trials as sufficient evidence that randomization works. The real risk of that trust: ten real trials, by pure real chance, might never have shown a full collision at all, leaving a real, false impression that `randomized-hash` eliminates Concept Unit 1's own vulnerability completely — this unit's own larger real sample is exactly what catches that the real worst case still happens, rarely but genuinely, information a real system's own security reasoning needs to have.

### Run It — Show the Real Output

```
$ guile probability-check.scm
=== CU4: the honest, real, aggregate picture, 1000 real trials ===
real average distinct buckets: 3.501
real full-collision trials out of 1000: 22
```

Verified this session — across `1,000` real, independent trials, `randomized-hash` averages `3.501` real distinct buckets, a substantial real improvement over `fixed-hash`'s own guaranteed `1`, while still producing a real, full collision `22` times, a genuine but rare `2.2%`, direct, honest evidence that randomization converts a guaranteed real vulnerability into an unlikely one, not an impossible one.

---

## Closing

### Connect the pieces

Two real reasons, one real recurring theme:

1. **A real, guaranteed worst case, constructed (Unit 1):** ten real keys, one real bucket, every real time.
2. **Real, added unpredictability, as a real defense (Unit 2):** the identical keys, `2` to `5` real distinct buckets, across ten real trials.
3. **"Average case," made honest (Unit 3):** the identical real algorithm, `5.5` or `10`, depending entirely on a real, assumed distribution.
4. **The real, full, honest picture (Unit 4):** a real, substantial average improvement, and a real, non-zero, genuinely rare `2.2%` failure rate — both true at once.

Every claim in this lesson traces to real, executed code: a real, constructed worst-case attack, ten and then `1,000` real randomized trials, and a real, exhaustive check of an algorithm's own average under two different real assumptions.

### What breaks without this

Suppose a real system's own engineers, having built Concept Unit 1's own `fixed-hash`, dismissed the real vulnerability because ordinary, non-adversarial use rarely triggered a collision. Concept Unit 1's own real evidence shows precisely what that dismissal misses: an adversary does not need collisions to be common — only needs to *construct* ten real keys guaranteed to collide, a real, five-minute exercise once the real rule is known. And suppose those same real engineers, having added `randomized-hash`, declared the real problem solved. Concept Unit 4's own real evidence shows what that declaration misses in turn: a real, genuine `2.2%` failure rate, small enough to miss in casual testing, large enough to matter at real scale.

### Exercises

1. **Observe.** Before checking, predict whether increasing `attack-keys` from `10` real keys to `20` (all still `10` apart, extending the identical real pattern) would change `fixed-hash`'s own real distinct-bucket count, using this lesson's own Concept Unit 1 reasoning to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Modify Concept Unit 4's own real trial loop to also record the real *minimum* distinct-bucket count seen across all `1,000` trials, and report whether it ever dropped below the real average reported this session — connect your own real finding to this unit's own real, honest `2.2%` figure.
4. **Explain.** In your own words, explain why `randomized-hash`'s own use of `logxor` genuinely breaks the real relationship between `attack-keys`' own values, while a simpler real change — adding the same real seed to every key with plain `+` instead — would not, referencing what `attack-keys` has in common under `fixed-hash`.
5. **Explain.** Using this lesson's own real Concept Unit 3 evidence, explain why quoting an algorithm's own "average case" without stating the real, assumed distribution is a genuinely incomplete real claim, not just an informal shorthand — referencing the real, twofold gap between `5.5` and `10` this unit measured on the identical algorithm.

### Definition of done

- [ ] You can construct, by hand, a real set of keys guaranteed to collide under a given fixed hash function, and explain why that construction works.
- [ ] You can point to this lesson's own real `3.501`-versus-`1` and `22`-out-of-`1000` numbers as direct, honest evidence for both what randomization improves and what it does not eliminate.
- [ ] You can explain, precisely, why Lesson 74's own real average-case formula depends on an assumed real distribution, and compute what changes when that assumption changes.
- [ ] You completed Exercises 1–5, including a real, checked measurement of Concept Unit 4's own real minimum distinct-bucket count.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
