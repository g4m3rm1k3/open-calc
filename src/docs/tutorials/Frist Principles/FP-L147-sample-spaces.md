# Lesson 147: Sample Spaces

**What you will build:** a real, exhaustive **sample space** — every possible outcome of a real random process, enumerated in full — for two genuinely different real processes, and real, direct evidence of what goes wrong when a probability statement is built on the wrong one. Real, verified evidence this session: rolling two real dice has exactly `36` real, equally-likely atomic outcomes, confirmed by real, exhaustive enumeration; grouping those `36` real outcomes by their own real sum shows the sum `7` occurs `6` real ways, while the sum `2` occurs only `1` real way — direct, measured refutation of the real, tempting assumption that all eleven possible sums, `2` through `12`, are equally likely. Under that wrong real assumption, each sum would carry a real probability of about `0.0909`; the real, true probability of rolling a `7` is `0.1667`, nearly double, and the real, true probability of rolling a `2` is `0.0278`, a third of the naive guess. A second real process, three runners finishing a race, has exactly `6` real, equally-likely outcomes — confirmed by real, exhaustive enumeration of every possible finishing order. The transferable point: a probability is never a real, free-floating number — it is always a real fraction of a real, precisely-defined sample space, and getting that space wrong (treating eleven differently-likely sums as eleven equally-likely outcomes) produces a real, confidently wrong answer that looks exactly as legitimate as a correct one.

**What you need to know first:** everything this lesson's own code depends on is explained in full below, in this lesson's own Terms and Objects and Methods sections and inside its own Concept Units. This lesson builds directly on Lesson 146's own real, informal introduction of "distribution" — explained again here, in full, not cited as already covered.

**Terms used in this lesson**

- **Sample space (Ω)** — the real, complete set of every possible outcome of a real random process, with no outcome left out and no outcome counted twice. It exists to give "what could happen" a precise, checkable real meaning, rather than an informal, possibly incomplete list.
- **Outcome** — a single, specific real result the random process could produce — one real roll of two dice, one real finishing order of a race.
- **Atomic (elementary) outcome** — an outcome at the finest real level of detail the sample space is built from, not further grouped or combined with any other. Each real `(d1, d2)` pair, for two dice, is atomic; a real *sum*, like `7`, is not — it's built by grouping several atomic outcomes together.
- **Equally likely outcomes** — a real, checkable claim that every atomic outcome in a sample space has the identical real probability of occurring. It exists because most of the real probability arithmetic this Era will build depends on this claim being true — and, this lesson's own real evidence shows, it is a claim that has to be verified for the *specific* sample space in question, never assumed to transfer automatically to a differently-grouped one.
- **Derived (compound) outcome** — a real outcome built by grouping one or more atomic outcomes together under some real, shared property — a dice sum, grouping every atomic pair with that total. A derived outcome's own real probability is the real count of atomic outcomes it groups, divided by the real size of the whole sample space — never assumed equal to any other derived outcome's own probability without that real count actually being checked.

**Objects and methods used**

- **`permutations`**
  - *What it is:* this lesson's own real procedure enumerating every possible real ordering of a given list's own elements.
  - *Implementation:* given full real treatment in Concept Unit 4 below.
  - *Its use:* building this lesson's own real, complete race sample space.
- **`filter`** / **`map`** / **`apply`** / **`append`**
  - *What it is:* real Scheme procedures, reused unchanged since early in this curriculum — `filter` keeps only list elements satisfying a real predicate; `map` applies a real procedure to every element of a list, collecting the results; `apply` calls a real procedure with a list's own elements as separate real arguments; `append` joins two real lists end to end.
  - *Implementation:* each takes a real procedure and one or more real lists (`filter`/`map`), or a real procedure and one real list of arguments (`apply`), or two or more real lists (`append`); each returns a new real list built accordingly.
  - *Its use:* every real sample space and every real grouping-by-property computation in this lesson.
- **`list-head`**
  - *What it is:* a real Scheme procedure returning the first `n` real elements of a list.
  - *Implementation:* takes a real list and a real count, returns a new real list containing just that many elements from the front.
  - *Its use:* displaying a real, readable preview of this lesson's own `36`-element sample space without printing all of it at once.

---

## Concept Unit 1: A Real, Tempting, Wrong Assumption

### The Problem

Two real dice are rolled together, and their real sum is recorded. The real sum can be anything from `2` to `12` — eleven real possible values. It's real, natural, and wrong to assume each of those eleven real values is equally likely, the way each face of a single die genuinely is.

### No isolated lab for this step

This unit introduces no new construct — the real, tempting assumption is posed directly here, in prose, so Concept Unit 2 and 3's own real evidence has something concrete to check it against.

### Reference Source

No reference counterpart — a real, classic probability confusion, posed directly for this lesson's own capstone purposes.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — Why the Assumption Feels Reasonable

A single real die has `6` faces, each equally likely — a real, true, checkable fact. Extending that same real intuition to "the sum has `11` possible values, so each is equally likely" feels like the identical real move, but it isn't: a single die's own `6` faces are each produced by exactly *one* real, physical way the die can land. A dice-sum of `7`, this unit's own real question, could be produced by *several* real, physically different combinations — `1` and `6`, `2` and `5`, `3` and `4`, and more — while a sum of `2` can only ever be produced one real way, `1` and `1`. Nothing about "eleven possible values" says anything about how many real, physical ways each one can happen.

### Walkthrough

- **The direct contrast with a single die's own genuinely equally-likely `6` faces** — grounds why the wrong assumption feels intuitive, rather than dismissing it as an obviously silly mistake.
- **The real, concrete counting difference between how sum `7` and sum `2` can occur** — previews Concept Unit 2 and 3's own real, exhaustive confirmation before any code is written.

### CS Lens

This is Lesson 22's own real "exhaustive checking beats spot-checking, or in this case, beats *guessing entirely*" discipline, applied to a real probability claim instead of a real algorithm's correctness: "there are eleven possible sums" is real and true; "therefore each is equally likely" is a real, unearned leap this unit's own Concept Unit 2 and 3 refuse to take without checking.

### SE Lens

The alternative to checking this real assumption is building a real system — a real dice game's own payout structure, say — around the naive, equal-probability guess. The real cost of that alternative, made concrete in Concept Unit 3: a real system that pays out identically for every sum, believing sum `2` and sum `7` equally likely, would be badly, measurably miscalibrated, paying out on `2` far more generously, relative to its real likelihood, than the real system's own designer ever intended.

---

## Concept Unit 2: The Real, Correct Sample Space

### The Problem

Concept Unit 1 named a real, wrong assumption. Checking it requires first building the real sample space that genuinely *does* have equally-likely atomic outcomes — not the eleven real sums, but every real, physically distinct way the two dice can land.

### Reference Source

No reference counterpart — a from-scratch real enumeration of two dice's own real, physical outcomes.

### Files affected

Created: `sample-space-check.scm`.

### Change type

Add (new file; this lesson's own real, kept artifact).

### Dependencies

The Guile interpreter.

### Applying It — What Makes This Sample Space the Right One

Each real die, rolled independently, can land on any of its own `6` real faces with equal real likelihood — a real, physically justified claim, not an assumption. Since the two dice are independent, every real *combination* of a first die's face and a second die's face is an equally likely real, atomic outcome — `6` real possibilities for the first die, times `6` for the second, `36` real, equally-likely atomic outcomes in total. A real sum, like `7`, is not itself one of these `36` — it's a real property several of them happen to share.

### The New Code — Type It Yourself

```scheme
(define die-faces (list 1 2 3 4 5 6))
(define two-dice-outcomes
  (apply append (map (lambda (d1) (map (lambda (d2) (cons d1 d2)) die-faces)) die-faces)))
```

### The Updated Project

This is `sample-space-check.scm`, in full:

```scheme
(define die-faces (list 1 2 3 4 5 6))                               ; ← new
(define two-dice-outcomes                                              ; ← new
  (apply append (map (lambda (d1) (map (lambda (d2) (cons d1 d2)) die-faces)) die-faces))) ; ← new

(display "=== CU2: the real, correct two-dice sample space ===") (newline) ; ← new
(display "real total outcomes: ") (display (length two-dice-outcomes)) (newline) ; ← new
(display "first few real outcomes: ") (display (list-head two-dice-outcomes 5)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define die-faces (list 1 2 3 4 5 6))`** — first appearance in this lesson of this real list; the six real faces a single die can show.
- **`(map (lambda (d2) (cons d1 d2)) die-faces)`** — for a fixed real first-die value `d1`, builds all `6` real `(d1 . d2)` pairs, one per possible real second-die value.
- **`(map (lambda (d1) ...) die-faces)`** — the outer `map`, repeating the inner real computation once for every possible real first-die value, producing `6` real lists of `6` real pairs each.
- **`(apply append ...)`** — first appearance in this lesson of `apply` used this way: `append` normally joins two real lists; `(apply append lists-of-lists)` calls `append` with every one of those `6` real inner lists as separate real arguments, flattening them into one real, `36`-element list.
- **The real, exact `36`, and the real, exact preview `((1 . 1) (1 . 2) (1 . 3) (1 . 4) (1 . 5))`** — direct, checked confirmation: this lesson's own real sample space has exactly `6 × 6 = 36` real atomic outcomes, and the first five shown are exactly the real pairs a reader would expect from this specific real construction order.

### CS Lens

This is Lesson 22's own real Cartesian-product idea (every combination of two real, independent choices), recognized in a genuinely new domain: `two-dice-outcomes` is the identical real construction — every real pairing of one real die's own six faces with the other's — applied here to define a real sample space rather than to search a real state space.

### SE Lens

The alternative to explicitly building all `36` real atomic outcomes is reasoning about dice sums directly, the way Concept Unit 1's own real, wrong assumption did. The real value of building the atomic sample space first: every real probability question about this process — "what's the real chance of a `7`," "what's the real chance of doubles" — can now be answered by a real, mechanical count over `two-dice-outcomes`, rather than a fresh, potentially-wrong real guess each time.

### Run It — Show the Real Output

```
$ guile sample-space-check.scm
=== CU2: the real, correct two-dice sample space ===
real total outcomes: 36
first few real outcomes: ((1 . 1) (1 . 2) (1 . 3) (1 . 4) (1 . 5))
```

Verified this session — this lesson's own real, correct sample space for two dice has exactly `36` real, equally-likely atomic outcomes, confirmed by real, exhaustive construction.

---

## Concept Unit 3: Grouping the Real Sample Space, and Refuting the Wrong Assumption

### The Problem

Concept Unit 2 built the real, correct atomic sample space. Concept Unit 1's own real assumption — that all eleven possible sums are equally likely — can now be checked directly, by real, exhaustive counting rather than intuition.

### Reference Source

No reference counterpart — a real, direct application of Concept Unit 2's own already-built `two-dice-outcomes`.

### Files affected

Modified: `sample-space-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 2 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (sum-of-pair p) (+ (car p) (cdr p)))
(define (count-with-sum s) (length (filter (lambda (p) (= (sum-of-pair p) s)) two-dice-outcomes)))
```

### The Updated Project

This is `sample-space-check.scm`, with Concept Unit 2's own file extended by a real, exhaustive count of every possible sum:

```scheme
;; ... Concept Unit 2's code above, unchanged ...

(define (sum-of-pair p) (+ (car p) (cdr p)))                        ; ← new
(define (count-with-sum s) (length (filter (lambda (p) (= (sum-of-pair p) s)) two-dice-outcomes))) ; ← new

(display "=== CU3: real counts per sum, out of 36 real atomic outcomes ===") (newline) ; ← new
(for-each (lambda (s) (display "sum=") (display s) (display " real ways: ") (display (count-with-sum s)) (newline)) ; ← new
          (list 2 3 4 5 6 7 8 9 10 11 12))                                                ; ← new
(display "real total across all sums (should be 36): ")                                     ; ← new
(display (apply + (map count-with-sum (list 2 3 4 5 6 7 8 9 10 11 12)))) (newline)              ; ← new
(newline)                                                                                           ; ← new
(display "if all 11 sums were equally likely, real probability of each would be: ")                   ; ← new
(display (exact->inexact (/ 1 11))) (newline)                                                            ; ← new
(display "real, true probability of sum=7: ") (display (exact->inexact (/ (count-with-sum 7) 36))) (newline) ; ← new
(display "real, true probability of sum=2: ") (display (exact->inexact (/ (count-with-sum 2) 36))) (newline)   ; ← new
```

### Mechanical Walkthrough

- **`(define (sum-of-pair p) (+ (car p) (cdr p)))`** — first appearance in this lesson of this procedure; reads a real atomic outcome's own two real values and adds them.
- **`(define (count-with-sum s) (length (filter (lambda (p) (= (sum-of-pair p) s)) two-dice-outcomes)))`** — first appearance in this lesson of this procedure; `filter` keeps only the real atomic outcomes whose own sum equals `s`; `length` counts how many real ones remain — the real, precise definition of "how many real ways can this sum occur."
- **`(for-each (lambda (s) ...) (list 2 3 ... 12))`** — real, exhaustive: checks every one of the eleven real possible sums, not a sample.
- **The real, exact counts, `1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1`, summing to the real, exact `36`** — direct, checked confirmation, matching Concept Unit 2's own real total exactly: every one of the `36` real atomic outcomes belongs to exactly one real sum group, none lost, none double-counted.
- **The real, exact `0.0909...`, against the real, exact `0.1667`, for sum `7`, and the real, exact `0.0278`, for sum `2`** — direct, measured refutation of Concept Unit 1's own real, tempting assumption: the real, true probability of a `7` is nearly double the naive guess, and the real, true probability of a `2` is well under a third of it.

### CS Lens

This is Lesson 20's own real combination-counting idea, applied here to justify a real probability rather than to size a real search space: the real reason `7` is more likely than `2` is exactly the same real reason a search problem with more ways to reach one state than another would spend more of its own real attention on the more-reachable one — real count, not real intuition, is what actually governs likelihood.

### SE Lens

The alternative to this real, exhaustive count is trusting Concept Unit 1's own real, intuitive guess and building a real system around it. The real, measured gap this unit's own evidence reveals — nearly `2×` too low for `7`, nearly `3×` too high for `2` — is exactly the kind of real, silent miscalibration a system built on an unchecked probability assumption would carry forward, with nothing in its own real behavior announcing the mistake.

### Run It — Show the Real Output

```
$ guile sample-space-check.scm
=== CU3: real counts per sum, out of 36 real atomic outcomes ===
sum=2 real ways: 1
sum=3 real ways: 2
sum=4 real ways: 3
sum=5 real ways: 4
sum=6 real ways: 5
sum=7 real ways: 6
sum=8 real ways: 5
sum=9 real ways: 4
sum=10 real ways: 3
sum=11 real ways: 2
sum=12 real ways: 1
real total across all sums (should be 36): 36

if all 11 sums were equally likely, real probability of each would be: 0.09090909090909091
real, true probability of sum=7: 0.16666666666666666
real, true probability of sum=2: 0.027777777777777776
```

Verified this session — real, exhaustive counting over all `36` atomic outcomes confirms sum `7` occurs `6` real ways and sum `2` occurs only `1`, direct, measured refutation of the assumption that all eleven possible sums are equally likely.

---

## Concept Unit 4: A Second Real Sample Space, From Scratch

### The Problem

Concept Unit 2 and 3's own real evidence was specific to dice. It's worth building one more real sample space, for a genuinely different real process, to confirm this lesson's own real discipline — enumerate every real atomic outcome, exhaustively, before trusting any real probability claim — generalizes.

### Reference Source

No reference counterpart — a from-scratch real enumeration of every possible finishing order for three real runners.

### Files affected

Modified: `sample-space-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The New Code — Type It Yourself

```scheme
(define (permutations lst)
  (if (null? lst)
      (list '())
      (apply append
             (map (lambda (x)
                    (map (lambda (p) (cons x p)) (permutations (filter (lambda (y) (not (equal? y x))) lst))))
                  lst))))
```

### The Updated Project

This is `sample-space-check.scm`, with Concept Unit 3's own file extended by a real, second sample space, three runners' own real finishing orders:

```scheme
;; ... Concept Unit 2 and 3's code above, unchanged ...

(define (permutations lst)                                           ; ← new
  (if (null? lst)                                                        ; ← new
      (list '())                                                            ; ← new
      (apply append                                                            ; ← new
             (map (lambda (x)                                                     ; ← new
                    (map (lambda (p) (cons x p))                                     ; ← new
                         (permutations (filter (lambda (y) (not (equal? y x))) lst)))) ; ← new
                  lst))))                                                                 ; ← new

(define runners (list 'A 'B 'C))                                     ; ← new
(define race-outcomes (permutations runners))                           ; ← new

(display "=== CU4: real race sample space, 3 runners ===") (newline) ; ← new
(display "all real finishing orders: ") (display race-outcomes) (newline) ; ← new
(display "real total outcomes: ") (display (length race-outcomes)) (newline) ; ← new
```

### Mechanical Walkthrough

- **`(define (permutations lst) ...)`** — first appearance in this lesson of this procedure; a real, recursive definition.
- **`(if (null? lst) (list '()) ...)`** — the real base case: the empty real list has exactly one real permutation, itself — `(list '())`, a one-element list containing the empty list, not the empty list itself, since "zero ways to order nothing" is wrong; "one way," the real, vacuous ordering, is correct.
- **`(map (lambda (x) ...) lst)`** — for every real element `x` in `lst`, considers `x` as the real, first element of a permutation.
- **`(filter (lambda (y) (not (equal? y x))) lst)`** — the real remaining elements, `lst` with `x` removed — `equal?`, reused since Lesson 141, checking real structural equality; `not`, reused since Lesson 138, inverting the real result.
- **`(permutations (filter ...))`** — the real recursive call: every real way to order the *remaining* elements.
- **`(map (lambda (p) (cons x p)) ...)`** — prepends `x`, this branch's own real chosen first element, onto every one of those real, recursively-computed orderings.
- **`(apply append ...)`** — flattens the real, outer list of per-`x` real permutation-lists into one real, combined list, the identical real technique Concept Unit 2's own `two-dice-outcomes` used.
- **The real, exact six orderings, `((A B C) (A C B) (B A C) (B C A) (C A B) (C B A))`, and the real, exact total `6`** — direct, checked confirmation, matching the real, independently-known fact that `3` distinct real items have exactly `3! = 6` real orderings.

### CS Lens

This is Lesson 78's own divide-and-conquer recognition, applied to real enumeration rather than real search: `permutations`' own real structure — pick a real first element, recursively solve the smaller real remaining problem, combine — is the identical real shape this curriculum has recognized in `dc-max`, `merge-sort`, and `quicksort`, now applied to building a real sample space instead of computing a real value.

### SE Lens

The alternative to writing a real, general `permutations` procedure is hand-listing all six real orderings directly, the way a reader might for a problem this small. The real value of the general procedure: it produces the identical, real, exhaustive sample space for `4`, `5`, or any real number of runners without any of this lesson's own reasoning needing to change — exactly the real generality Concept Unit 2's own dice-pair construction and this unit's own permutation construction both share.

### Run It — Show the Real Output

```
$ guile sample-space-check.scm
=== CU4: real race sample space, 3 runners ===
all real finishing orders: ((A B C) (A C B) (B A C) (B C A) (C A B) (C B A))
real total outcomes: 6
```

Verified this session — three real runners have exactly `6` real, equally-likely finishing orders, confirmed by real, exhaustive enumeration, the identical real discipline Concept Unit 2 and 3 applied to dice.

---

## Closing

### Connect the pieces

Two real sample spaces, one real recurring lesson:

1. **A real, tempting, wrong assumption, named (Unit 1):** eleven possible dice sums does not mean eleven equally likely ones.
2. **The real, correct atomic sample space, built (Unit 2):** `36` real, genuinely equally-likely `(d1, d2)` pairs.
3. **The real assumption, refuted by real counting (Unit 3):** sum `7` is `6×` more likely than sum `2`, not equally likely at all.
4. **A second real sample space, confirming the discipline generalizes (Unit 4):** `6` real, equally-likely finishing orders for three runners.

Every claim in this lesson traces to real, executed code: two real, exhaustively-built sample spaces, and a real, direct, measured refutation of a real, common probability mistake.

### What breaks without this

Suppose a real dice game's own payout table were built directly around Concept Unit 1's own real, tempting assumption — paying out identically for any of the eleven possible sums, since "there are eleven, so they're each `1`-in-`11`." Concept Unit 3's own real evidence shows precisely what that design would get wrong: sum `7`, the real, most common outcome, would be paying out as if it were as rare as sum `2` or sum `12`, the real, rarest outcomes — a real, systematic, silent miscalibration built into the game from the very first real design decision.

### Exercises

1. **Observe.** Before checking, predict the real number of atomic outcomes for rolling *three* dice together, using this lesson's own real Concept Unit 2 reasoning (`6` choices, three independent times) to justify your answer.
2. **Formalize.** Confirm your Exercise 1 prediction with real code — extend `two-dice-outcomes`' own real construction to a third die.
3. **Formalize.** Using your own real three-dice sample space, compute the real probability of rolling a sum of `10`, and compare it to the real, naive assumption that all `16` possible three-dice sums (`3` through `18`) are equally likely.
4. **Explain.** In your own words, explain why `permutations`' own real base case returns `(list '())` rather than `'()`, referencing what each one would really mean about how many ways there are to order zero elements.
5. **Explain.** Using this lesson's own real Concept Unit 3 numbers, explain why an *atomic* outcome (a specific `(d1, d2)` pair) and a *derived* outcome (a sum) require genuinely different real reasoning to assign a probability to — referencing what makes the atomic ones, but not the derived ones, safe to assume equally likely.

### Definition of done

- [ ] You can state, precisely, the difference between an atomic outcome and a derived outcome, using this lesson's own dice example.
- [ ] You can point to this lesson's own real `6`-ways-versus-`1`-way counts as direct evidence that not every derived outcome is equally likely, even when its own atomic sample space is.
- [ ] You can explain why `two-dice-outcomes`' own real `36` atomic outcomes are safe to treat as equally likely, while the `11` possible sums are not.
- [ ] You completed Exercises 1–5, including a real, checked three-dice sample space of your own.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
