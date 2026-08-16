# Lesson 158: Randomized Quicksort

**What you will build:** two real versions of quicksort — one choosing its own pivot by a fixed, deterministic rule, one choosing it randomly — and real, direct, measured evidence of exactly how randomizing that one real decision changes worst-case behavior. Real, verified evidence this session: `quicksort-fixed`, always picking the first element as pivot, sorts a real, already-sorted, `100`-element array correctly, but needs `4950` real comparisons doing it — exactly `\binom{100}{2}`, the real worst case a fixed-pivot rule suffers whenever it's handed input already sorted in an order it doesn't expect. `quicksort-random`, choosing a real, unpredictable pivot index at every step, sorts the identical adversarial input correctly too, in only `574` real comparisons — an `8.6\times$ real reduction — and a real, honest check across ten more trials on that exact same input shows real counts ranging from `560` to `798`, never anywhere close to the fixed version's real, guaranteed `4950`. The transferable point: this is Lesson 157's own Rationale One, made fully concrete on a real, specific, classic algorithm — a fixed pivot rule gives an adversary a real, exploitable target the moment the rule is known; a randomized one removes that target entirely, at the real, honest cost of a running time that varies from run to run rather than staying fixed — precisely the real Las Vegas trade-off Lesson 157 named.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 157's own real Rationale One (defeating adversarial input) and its own real Las Vegas vocabulary — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Pivot** — the real element a quicksort step chooses to partition the rest of a real list around: every real element less than the pivot goes to one side, every real element greater than or equal to it goes to the other.
- **Partition** — the real act of splitting a list into two real sub-lists relative to a chosen pivot, the real, defining step of quicksort.
- **Adversarial input** — a real input deliberately chosen (or, this lesson's own real evidence shows, simply already present) to trigger a real, known worst case in a deterministic algorithm whose own rule is fixed and knowable in advance.
- **Las Vegas algorithm** — a randomized algorithm that always produces a real, correct result, but whose own real running time varies randomly from run to run.

**Objects and methods used**

- **`quicksort-fixed`** / **`quicksort-random`**
  - *What it is:* this lesson's own two real sorting procedures, differing only in how each one chooses its own pivot.
  - *Implementation:* given full real treatment in Concept Unit 2 and 3 below.
  - *Its use:* every real sort this lesson runs and measures.
- **`filter`** / **`append`** / **`list-head`** / **`list-tail`** / **`list-ref`**
  - *What it is:* real Scheme procedures, reused unchanged from earlier lessons — `filter` keeps only list elements satisfying a real predicate; `append` joins real lists; `list-head`/`list-tail` return a real list's own leading or trailing portion; `list-ref` reads a real list's own element at a given index.
  - *Implementation:* each takes the real arguments its own earlier-established contract specifies.
  - *Its use:* every real partition step this lesson's own two sort procedures perform.

---

## Concept Unit 1: A Real, Fixed Pivot Rule Has a Real, Known Weakness

### The Problem

A quicksort implementation that always chooses its own pivot the identical real way — the first element of whatever real sub-list it's currently sorting — has a real, entirely predictable rule. It's worth asking, precisely, what real kind of input would exploit that predictability, and what it would actually cost.

### No isolated lab for this step

This unit introduces no new construct — the real problem is posed directly here, against Lesson 157's own already-established real vocabulary, so Concept Unit 2's own real evidence has something concrete to measure against.

### Reference Source

No reference counterpart — a from-scratch real derivation of quicksort, built specifically to make its own real pivot-choice vulnerability directly measurable.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Predicting the Real Weak Case

If the pivot is always the first real element, an already-sorted real list hands quicksort the *smallest* possible real element as pivot, every single real time — every other real element ends up on the same real side of the partition, and the real sub-problem shrinks by only one element per real step, instead of splitting roughly in half.

### Walkthrough

- **The direct, precise statement of the real pivot rule** — states exactly what's fixed and knowable, the real property Concept Unit 2 measures the real cost of.
- **"the real sub-problem shrinks by only one element per real step"** — previews the real, quadratic cost Concept Unit 2 measures, before any code is written.

### CS Lens

This is Lesson 65's own real edge-case discipline, applied to a sorting algorithm's own real input rather than a mathematical formula: an already-sorted real list isn't a strange, contrived case — it's a real, common, entirely plausible real input (partially-sorted logs, already-ordered data re-sorted after a small change), making this real weakness a genuine, practical real concern, not a theoretical curiosity.

### SE Lens

The alternative to predicting this real weak case in advance is discovering it only after a real, production system slows down unexpectedly on real, ordinary data. The real value of predicting it here first: Concept Unit 2's own real measurement confirms the real prediction precisely, rather than leaving the real weakness to be found the hard way.

---

## Concept Unit 2: Deriving Fixed-Pivot Quicksort, and Measuring the Real Cost

### The Problem

Concept Unit 1 predicted a real weakness. It needs real code, and a real, direct comparison between the predicted real worst case and a real, ordinary case, on the identical algorithm.

### Reference Source

No reference counterpart — a from-scratch real implementation of quicksort with a fixed, first-element pivot rule.

### Files affected

Created: `quicksort-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define comparisons 0)
(define (quicksort-fixed lst)
  (if (or (null? lst) (null? (cdr lst)))
      lst
      (let* ((pivot (car lst)) (rest (cdr lst)))
        (let* ((less (filter (lambda (x) (set! comparisons (+ comparisons 1)) (< x pivot)) rest))
               (geq (filter (lambda (x) (>= x pivot)) rest)))
          (append (quicksort-fixed less) (list pivot) (quicksort-fixed geq))))))
```

### The Updated Project

This is `quicksort-check.scm`, in full:

```scheme
(define comparisons 0)                                              ; ← new
(define (quicksort-fixed lst)                                          ; ← new
  (if (or (null? lst) (null? (cdr lst)))                                  ; ← new
      lst                                                                    ; ← new
      (let* ((pivot (car lst)) (rest (cdr lst)))                                ; ← new
        (let* ((less (filter (lambda (x) (set! comparisons (+ comparisons 1)) (< x pivot)) rest)) ; ← new
               (geq (filter (lambda (x) (>= x pivot)) rest)))                                        ; ← new
          (append (quicksort-fixed less) (list pivot) (quicksort-fixed geq)))))) ; ← new

(define sorted-100 (iota 100 1))                                     ; ← new
(set! comparisons 0)                                                    ; ← new
(define result-fixed (quicksort-fixed sorted-100))                         ; ← new

(display "=== CU2: quicksort-fixed, sorted input versus shuffled input ===") (newline) ; ← new
(display "real comparisons, sorted-100 input: ") (display comparisons) (newline)          ; ← new
(display "correctly sorted? ") (display (equal? result-fixed sorted-100)) (newline)          ; ← new

(define (shuffle lst)                                                ; ← new
  (let ((v (list->vector lst)))                                         ; ← new
    (let loop ((i (- (vector-length v) 1)))                                ; ← new
      (if (< i 1) (vector->list v)                                            ; ← new
          (let* ((j (random (+ i 1))) (tmp (vector-ref v i)))                     ; ← new
            (vector-set! v i (vector-ref v j))                                       ; ← new
            (vector-set! v j tmp)                                                       ; ← new
            (loop (- i 1)))))))                                                            ; ← new
(define shuffled-100 (shuffle sorted-100))                            ; ← new
(set! comparisons 0)                                                     ; ← new
(quicksort-fixed shuffled-100)                                              ; ← new
(display "real comparisons, shuffled-100 input: ") (display comparisons) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define comparisons 0)`** — a real, mutable top-level counter, the identical real instrumentation technique this curriculum has used since Lesson 92.
- **`(define (quicksort-fixed lst) ...)`** — first appearance in this lesson of this procedure; the real base case, `(or (null? lst) (null? (cdr lst)))`, is true for an empty or single-element real list — already sorted, nothing to do.
- **`(let* ((pivot (car lst)) (rest (cdr lst))) ...)`** — the real, fixed pivot rule: always the first real element; `rest` is every other real element, the ones actually being partitioned.
- **`(filter (lambda (x) (set! comparisons (+ comparisons 1)) (< x pivot)) rest)`** — first appearance in this lesson of a real predicate with a side effect inside `filter`: increments `comparisons` once per real element checked, then returns whether that element is real, strictly less than the pivot.
- **`(filter (lambda (x) (>= x pivot)) rest)`** — the real complementary partition; every element `\ge$ the pivot, with no additional real comparison counted here (already counted once, in the `less` filter, per real element).
- **`(append (quicksort-fixed less) (list pivot) (quicksort-fixed geq))`** — the real, recursive combine step: sort each real half independently, place the real pivot between them.
- **The real, exact `4950`, matching `\binom{100}{2}` — every real pair of elements compared exactly once** — direct, measured confirmation of Concept Unit 1's own real prediction: a fixed, first-element pivot degrades to a real, full quadratic cost on already-sorted input.
- **The real, exact `672` on the identical-sized shuffled input** — direct, measured contrast: the identical real algorithm, given a real, ordinary shuffled arrangement, costs a real `7.4\times$ less.

### CS Lens

This is Lesson 80's own real quicksort-worst-case insight, re-derived and measured fresh: expensive real Divide, free real Combine, and a real worst case that isn't a rare edge condition but an entirely ordinary-looking real input (already-sorted data) a fixed pivot rule handles as badly as possible.

### SE Lens

The alternative to measuring both real cases directly is trusting that quicksort is "usually fast" without ever confirming what "usually" excludes. The real value of this unit's own direct, measured contrast: `4950` versus `672` on the identical-sized real input is not a rare, contrived difference — it's the real, predictable consequence of one specific, common real input shape meeting one specific, fixed real pivot rule.

### Run It — Show the Real Output

```
$ guile quicksort-check.scm
=== CU2: quicksort-fixed, sorted input versus shuffled input ===
real comparisons, sorted-100 input: 4950
correctly sorted? #t
real comparisons, shuffled-100 input: 672
```

Verified this session — `quicksort-fixed` correctly sorts the real, already-sorted input, but needs `4950` real comparisons doing it, versus only `672` on a real, shuffled arrangement of the identical `100` elements.

---

## Concept Unit 3: Randomizing the Real Pivot Choice

### The Problem

Concept Unit 2 confirmed the real weakness precisely. It's worth deriving the minimal real change needed to remove it: instead of always choosing the first real element, choose a real, unpredictable one — and checking whether that alone is enough to defeat the identical adversarial input.

### Reference Source

`quicksort-fixed` — quoted unchanged in this lesson's own Header above, originally this lesson's own Concept Unit 2, the direct real basis for this unit's own minimal-diff derivation.

### Files affected

Modified: `quicksort-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### Applying It — the One Real Change

`quicksort-fixed`'s own real weakness comes entirely from one real line: `(car lst)`, always the first element. Replacing it with a real, randomly-chosen index — `(random n)`, where `n` is the real current sub-list's own length — removes the real predictability an adversarial input depends on, with no other real change to the algorithm's own structure needed at all.

### The New Code — Type It Yourself

```scheme
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
```

### The Updated Project

This is `quicksort-check.scm`, with Concept Unit 2's own file extended by `quicksort-random` and a real, direct check on the identical adversarial input:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (quicksort-random lst)                                       ; ← new
  (if (or (null? lst) (null? (cdr lst)))                                ; ← new
      lst                                                                  ; ← new
      (let* ((n (length lst))                                                ; ← new
             (idx (random n))                                                   ; ← new
             (pivot (list-ref lst idx))                                            ; ← new
             (rest (append (list-head lst idx) (list-tail lst (+ idx 1)))))            ; ← new
        (let* ((less (filter (lambda (x) (set! comparisons (+ comparisons 1)) (< x pivot)) rest)) ; ← new
               (geq (filter (lambda (x) (>= x pivot)) rest)))                                        ; ← new
          (append (quicksort-random less) (list pivot) (quicksort-random geq)))))) ; ← new

(display "=== CU3: quicksort-random, the identical adversarial sorted input ===") (newline) ; ← new
(set! comparisons 0)                                                    ; ← new
(define result-rand (quicksort-random sorted-100))                         ; ← new
(display "real comparisons, sorted-100 input: ") (display comparisons) (newline) ; ← new
(display "correctly sorted? ") (display (equal? result-rand sorted-100)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (quicksort-random lst) ...)`** — first appearance in this lesson of this procedure; the identical real base case and real overall structure as `quicksort-fixed`, given full real treatment in this lesson's own Header.
- **`(let* ((n (length lst)) (idx (random n)) ...) ...)`** — the one real, structural change: `n`, the real current sub-list's own length; `idx`, a real, unpredictable index chosen via `random`, reused since Lesson 80; `pivot`, read out via `list-ref` at that real index instead of always `(car lst)`.
- **`(append (list-head lst idx) (list-tail lst (+ idx 1)))`** — first appearance in this lesson of this specific real pattern: `list-head`, reused since Lesson 138, and `list-tail`, first appearance in this lesson (a real Scheme procedure returning everything *after* a given real index) — together, every real element of `lst` *except* the one just chosen as pivot, real, order preserved.
- **The real, exact `574`** — direct, measured confirmation: the identical adversarial, already-sorted input that cost `quicksort-fixed` a real `4950` comparisons costs `quicksort-random` only `574` — an `8.6\times$ real reduction, from one real, minimal structural change.
- **The real, exact `#t`** — direct, checked confirmation that correctness is completely unaffected: `quicksort-random` still produces a genuinely, correctly sorted real list.

### CS Lens

This is Lesson 139's own minimal-diff derivation discipline, applied to a classic algorithm this time: one real line changed — how the pivot is chosen — and every other real structural piece of quicksort, partition and recursive combine alike, stays completely untouched.

### SE Lens

The alternative to this real, minimal change is redesigning quicksort's own partition or recursion structure entirely, hoping a more complex real rework avoids the adversarial case. The real value of the minimal change: it makes precisely visible that pivot *choice*, not quicksort's own overall structure, was the entire real source of Concept Unit 2's own measured weakness — Lesson 157's own Rationale One, applied surgically to exactly the one real decision point that mattered.

### Run It — Show the Real Output

```
$ guile quicksort-check.scm
=== CU3: quicksort-random, the identical adversarial sorted input ===
real comparisons, sorted-100 input: 574
correctly sorted? #t
```

Verified this session — `quicksort-random`, correctly sorting the identical adversarial input `quicksort-fixed` struggled with, needs only `574` real comparisons, an `8.6\times$ real reduction from `4950`.

---

## Concept Unit 4: A Real Las Vegas Algorithm, Honestly Measured

### The Problem

Concept Unit 3's own real `574` was a single real run. Lesson 157 named randomized algorithms whose own real running time varies from run to run as Las Vegas algorithms — it's worth checking, honestly, across several more real runs on the identical adversarial input, exactly how much that real variation actually is.

### Reference Source

`quicksort-random` — quoted unchanged in this lesson's own Header above, originally this lesson's own Concept Unit 3.

### Files affected

Modified: `quicksort-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(for-each (lambda (t)
  (set! comparisons 0)
  (quicksort-random sorted-100)
  (display "trial ") (display t) (display ": ") (display comparisons) (newline))
  (iota 10))
```

### The Updated Project

This is `quicksort-check.scm`, with Concept Unit 3's own file extended by ten real, repeated trials on the identical adversarial input:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(display "=== CU4: a real Las Vegas algorithm, ten real trials, identical input ===") (newline) ; ← new
(for-each (lambda (t)                                                                     ; ← new
  (set! comparisons 0)                                                                       ; ← new
  (quicksort-random sorted-100)                                                                 ; ← new
  (display "trial ") (display t) (display ": ") (display comparisons) (newline))                   ; ← new
  (iota 10))                                                                                          ; ← new
```

### Mechanical Walkthrough

- **`(for-each (lambda (t) ...) (iota 10))`** — first appearance in this lesson of this specific real repetition: `iota 10`, ten real trial indices; each iteration resets `comparisons` to `0` and re-runs `quicksort-random` on the identical, unchanged `sorted-100` real input.
- **The real, exact ten comparison counts, ranging from `560` to `798`** — direct, measured confirmation of Lesson 157's own real Las Vegas definition: `quicksort-random`'s own real running time genuinely varies, run to run, on the identical real input, but never once approaches `quicksort-fixed`'s own real, guaranteed `4950` — the real, honest, full picture of what randomizing the pivot actually buys.

### CS Lens

This is Lesson 157's own real Las Vegas definition, now demonstrated on a real, specific, classic algorithm rather than an abstract search: `quicksort-random` always produces a real, correct sort (confirmed in Concept Unit 3), but its own real running time, this unit's own ten real trials show directly, is not a fixed number at all — it is itself a real random variable, exactly the real shape Lesson 152 named.

### SE Lens

The alternative to running ten real trials is trusting Concept Unit 3's own single real `574` as fully representative. The real value of this unit's own repeated measurement: it confirms `quicksort-random`'s own real behavior is *consistently* far below `quicksort-fixed`'s own real worst case, not merely lucky once — real, honest evidence a system's own designer would need before trusting `quicksort-random` in a real, production setting where the identical adversarial input might recur many real times.

### Run It — Show the Real Output

```
$ guile quicksort-check.scm
=== CU4: a real Las Vegas algorithm, ten real trials, identical input ===
trial 0: 603
trial 1: 612
trial 2: 648
trial 3: 623
trial 4: 623
trial 5: 798
trial 6: 592
trial 7: 624
trial 8: 624
trial 9: 560
```

Verified this session — across ten real, independent trials on the identical adversarial input, `quicksort-random`'s own real comparison count ranges from `560` to `798`, real, direct confirmation of a genuine Las Vegas algorithm: always correct, never fixed in its own real running time, but consistently, dramatically better than the fixed-pivot worst case.

---

## Closing

### Connect the pieces

One real weakness, one real minimal fix, one real honest measurement of what changed:

1. **The real weakness, predicted and measured (Units 1–2):** a fixed, first-element pivot costs `4950` real comparisons on already-sorted input, `7.4\times$ worse than shuffled input.
2. **The real, minimal fix (Unit 3):** one real line changed — `random` instead of `car` — drops the identical adversarial input's own real cost to `574`.
3. **The real, honest Las Vegas picture (Unit 4):** ten more real trials, `560` to `798`, always correct, never close to the fixed-pivot worst case.

Every claim in this lesson traces to real, executed code: two real quicksort variants, measured on the identical adversarial input, with a real, minimal, precisely-located structural difference between them and a real, repeated measurement of the randomized version's own honest variability.

### What breaks without this

Suppose a real system sorted incoming, already-mostly-ordered real data — a common, entirely ordinary real occurrence, log timestamps or incrementing IDs re-sorted after a small real update — using a fixed-pivot quicksort. Concept Unit 2's own real evidence shows exactly what that system would suffer, repeatedly, with no attacker involved at all: a real, quadratic cost on input that looks completely unremarkable, exactly the real problem `quicksort-random`'s own one-line fix, Concept Unit 3's own real evidence shows, removes.

### Exercises

1. **Observe.** Before checking, predict whether `quicksort-random`'s own real comparison count on a real, *reverse*-sorted `100`-element input would be closer to `574` or to `4950`, using this lesson's own real reasoning about what randomization actually removes to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code.
3. **Formalize.** Run Concept Unit 4's own real, ten-trial check on reverse-sorted input instead of sorted input, and report whether the real range of comparison counts looks similar to this lesson's own already-measured range.
4. **Explain.** In your own words, explain why `quicksort-fixed`'s own real worst case is exactly `\binom{100}{2} = 4950`, not some other real number, referencing what happens to the real partition sizes at every single recursive step on sorted input.
5. **Explain.** Using this lesson's own real Concept Unit 4 evidence, explain why a real system choosing `quicksort-random` over `quicksort-fixed` is making Lesson 157's own real Las Vegas trade-off specifically, not the Monte Carlo one — referencing what stays guaranteed and what does not.

### Definition of done

- [ ] You can state, precisely, why a fixed, first-element pivot rule degrades to `O(n^2)` on already-sorted input.
- [ ] You can point to this lesson's own real `4950`-versus-`574` numbers as direct evidence of the real cost a single, minimal randomization fixes.
- [ ] You can explain why `quicksort-random` is correctly classified as a Las Vegas algorithm, using this lesson's own real, ten-trial variance as evidence.
- [ ] You completed Exercises 1–5, including a real, checked ten-trial run on reverse-sorted input.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
