# Lesson 58: Permutations

**What you will build:** `permutations`, a real procedure generating every possible ordering of a list — verified to produce exactly `n!` orderings for `n` from `1` through `7`, matching `factorial` (Lesson 28) exactly at every value. Real, measured evidence of what that growth actually costs: generating all `3,628,800` orderings of a `10`-item list takes **`15,984` ms — nearly sixteen seconds** — up from `720` orderings in `2.858` ms for a `6`-item list, just four items earlier. The transferable point: Lesson 57 derived the multiplication principle from independent choices. Permutations are a multiplication-principle count too, but a specific, especially fast-growing one — worth deriving on its own, and worth feeling the real cost of directly, before Era III's later lessons name this growth rate formally.

**What you need to know first:** Lesson 28 (`FP-L028-recursive-functions.md`) — specifically `factorial`, whose exact values this lesson checks `permutations`' counts against. Lesson 35 (`FP-L035-filter.md`) — specifically `filter`, reused to remove an item from a list. Lesson 46 (`FP-L046-recursive-invariants.md`) — specifically the leap-of-faith derivation discipline, applied to `permutations`' own recursive case. Lesson 57 (`FP-L057-addition-and-multiplication-principles.md`) — specifically the multiplication principle, whose reasoning explains why `permutations`' count is exactly `n!`.

**Terms introduced in this lesson**

- **Permutation** — one specific ordering of a collection's members. The list `(1 2 3)` has six permutations: `(1 2 3)`, `(1 3 2)`, `(2 1 3)`, `(2 3 1)`, `(3 1 2)`, and `(3 2 1)` — the same three items, arranged every possible way.
- **Factorial growth** — the growth pattern of `n!`, where each additional item multiplies the total by a value that itself keeps increasing (`n` at step `n`, not a fixed number), making it grow faster than any fixed multiplication rate. `permutations`' real, measured cost — `2.858` ms at `n = 6` up to nearly sixteen seconds at `n = 10` — is factorial growth, felt directly rather than only stated.

## Objects and methods used

- **`apply`**
  - *What it is:* a real Scheme procedure that calls a given procedure, spreading the members of a given list out as that procedure's separate arguments, rather than passing the list itself as one single argument.
  - *Implementation:* takes a procedure and a list, returning the result of calling the procedure with the list's members as individual arguments; confirmed this session as `(apply + (list 1 2 3 4 5))` returning `15`, and `(apply append (list (list 1 2) (list 3 4) (list 5)))` returning `(1 2 3 4 5)`.
  - *Its use:* `permutations`' own recursive case, flattening a list of lists of permutations — one sub-list per choice of first item — into one single, combined list.

---

## Concept Unit 1: apply — Isolated Lab

### The Problem

`permutations`' recursive case will need to combine several separate lists of results — one batch per possible first item — into one single flat list. `append` (Lesson 37) combines exactly two lists; combining a *list of* lists, whose number isn't known until the input's length is known, needs a genuinely new tool. Per this curriculum's Concept Isolation Rule, it gets its own throwaway lab before real use.

### Concept Isolation Rule — Throwaway Lab

```scheme
(display (apply + (list 1 2 3 4 5))) (newline)
(display (apply max (list 7 2 9 4))) (newline)
(display (apply append (list (list 1 2) (list 3 4) (list 5)))) (newline)
```

```
$ guile apply-lab.scm
15
9
(1 2 3 4 5)
```

Verified this session — `(apply + (list 1 2 3 4 5))` calls `+` with `1`, `2`, `3`, `4`, and `5` as five *separate* arguments, exactly as if `(+ 1 2 3 4 5)` had been written directly, returning `15`; `(apply max (list 7 2 9 4))` behaves identically for `max`, returning `9`; `(apply append (list (list 1 2) (list 3 4) (list 5)))` calls `append` with three separate list arguments, flattening them into one combined list, `(1 2 3 4 5)`.

**Discarding this lab:** these three calls exist purely to see `apply` spread a list into separate arguments, for three different procedures. They are discarded now — `permutations`' real use of `apply append`, built next, is a separate, real use serving a real purpose.

### Walkthrough

- **`(apply + (list 1 2 3 4 5))`** — first real use: `apply` taking a procedure (`+`) and a list, calling the procedure as if each list member had been typed as its own argument.
- **`(apply max (list 7 2 9 4))`** — confirming this isn't specific to `+`: any procedure that accepts multiple separate arguments works identically.
- **`(apply append (list (list 1 2) (list 3 4) (list 5)))`** — the specific pattern `permutations` will need: `append` normally combines two lists at a time; `apply append` combines *however many* lists a list-of-lists happens to contain, in one step.

### CS Lens

This is the general tool for bridging "a list of things" and "separate arguments to a procedure" — necessary whenever the number of things to combine isn't fixed in advance. Also recognized in: a shipping company combining however many boxes a specific order happens to contain into one manifest, without knowing the number of boxes ahead of time; a spreadsheet's `SUM` function totaling however many cells a user happens to select, not a fixed number of cells.

### SE Lens

The alternative to isolating `apply` in its own lab is to introduce it for the first time inside `permutations` itself, where its behavior would be tangled up with the recursive derivation's own logic. The real cost of that alternative is exactly what this curriculum's Concept Isolation Rule has guarded against since Lesson 3: a bug in `permutations` becomes ambiguous between "`apply` was misunderstood" and "the recursive derivation was wrong." Isolating it first, as this unit does, costs three small lines and one real run; it means Concept Unit 3's real code can be trusted to reveal only algorithmic issues, not syntax confusion.

---

## Concept Unit 2: Deriving permutations — Base Case and Recursive Case

### The Problem

Following Lesson 46's leap-of-faith discipline, `permutations`' base case and recursive case need working out in prose, before any code is written.

### Applying It — The Derivation

**The invariant, stated first:** `(permutations lst)` returns a list containing every possible ordering of `lst`'s members, each ordering itself a list.

**The base case:** the empty list has exactly one ordering — itself. `(permutations '())` should return `(list '())` — a list *containing* the empty list, exactly Lesson 51's identical base-case reasoning for `all-subsets`.

**The recursive case, derived by trusting `(permutations (remove-item x lst))` without tracing it, for each possible choice of `x`:** every permutation of `lst` starts with *some* member of `lst` as its first element. For a specific member `x`, every permutation starting with `x` is `x` followed by some permutation of the *remaining* members — trusted, by the leap of faith, to already be sitting in `(permutations (remove-item x lst))`. Considering every possible choice of `x` in turn, and combining all the resulting permutations together, produces every permutation of `lst`.

### Walkthrough

- **The invariant, stated in Lesson 46's precise form** — establishes exactly what `permutations` must guarantee before any code exists.
- **The base case, directly parallel to `all-subsets`' own (Lesson 51)** — a reappearance of the same "one empty ordering/subset" reasoning, applied to a genuinely different question.
- **"for each possible choice of `x`... combining all the resulting permutations together"** — the specific structural difference from `all-subsets`: `all-subsets`' recursive case considered *one* item's two choices (include or exclude); `permutations`' recursive case considers *every* item as a candidate first element, one at a time.

### CS Lens

This is the recursive leap of faith (Lesson 46) applied to a genuinely new shape of problem: not "does an item appear or not" (Lesson 51's binary choice) but "which item comes first," a choice with as many options as there are remaining items. Also recognized in: choosing a starting runner for a relay race, then trusting the remaining runners to be ordered correctly among themselves; choosing a first course for a tasting menu, then trusting the remaining courses to be sequenced correctly among themselves.

### SE Lens

The alternative to deriving `permutations`' recursive case in prose first is to write nested loops directly, generating orderings by some ad-hoc index-swapping scheme, and trust the result without a clear invariant to check it against. The real cost of that alternative is exactly the kind of subtle duplicate-or-missing-ordering bug this curriculum has repeatedly guarded against since Lesson 46 — a plausible-looking generator that silently produces `119` or `121` orderings instead of `120`. Deriving it carefully first, as this unit does, costs one careful prose derivation; it gives Concept Unit 3's real code a precise specification to be checked against.

---

## Concept Unit 3: The Complete permutations Procedure, Verified

### The Problem

Concept Unit 2 supplied the derivation; Concept Unit 1 supplied the tool needed to combine each choice's results. It's time to write the real, final procedure and check it thoroughly.

### The New Code — Type It Yourself

```scheme
(define (remove-item x lst)
  (filter (lambda (y) (not (equal? y x))) lst))

(define (permutations lst)
  (if (null? lst)
      (list '())
      (apply append
             (map (lambda (x)
                    (map (lambda (p) (cons x p))
                         (permutations (remove-item x lst))))
                  lst))))
```

### The Updated Project

This is `permutations.scm`, in full:

```scheme
(define (remove-item x lst)
  (filter (lambda (y) (not (equal? y x))) lst))

(define (permutations lst)
  (if (null? lst)
      (list '())
      (apply append
             (map (lambda (x)
                    (map (lambda (p) (cons x p))
                         (permutations (remove-item x lst))))
                  lst))))

(display (permutations (list 1 2 3)))
(newline)
```

### Reference Source

Concept Unit 2's derivation, translated directly: `(list '())` for the base case; `remove-item`, using `filter` (Lesson 35), removing a chosen member from `lst`; the outer `map` considering every possible choice of `x` from `lst`; the inner `map` prepending `x` to every permutation of what remains; `apply append` (Concept Unit 1) flattening the resulting list-of-lists into one combined list.

### Files affected

Created: `permutations.scm`, `remove-item` (defined in the same file).

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile permutations.scm
((1 2 3) (1 3 2) (2 1 3) (2 3 1) (3 1 2) (3 2 1))
```

Verified this session — all six orderings of `(1 2 3)` generated, matching the six permutations named directly in this lesson's "Terms introduced" section, exactly.

### Mechanical Walkthrough

- **`(define (remove-item x lst) (filter (lambda (y) (not (equal? y x))) lst))`** — a small helper procedure, keeping every member of `lst` that isn't `equal?` to `x`.
- **`(if (null? lst) (list '()) ...)`** — the base case: an empty list's one ordering is itself.
- **`(map (lambda (x) ...) lst)`** — the outer map, considering every member `x` of `lst` in turn as a candidate first element.
- **`(map (lambda (p) (cons x p)) (permutations (remove-item x lst)))`** — for a specific choice of `x`, the inner map prepends `x` onto every permutation of the remaining members, trusted by the leap of faith to already be correct.
- **`(apply append ...)`** — Concept Unit 1's tool, flattening the outer map's result — one sub-list of orderings per choice of `x` — into one single, combined list of every ordering.

### CS Lens

This is a complete, correct realization of Concept Unit 2's derivation, every clause of the prose corresponding to one piece of the final code, exactly the disciplined translation this curriculum has modeled since Lesson 28's own `factorial`. Also recognized in: a relay race's full set of possible running orders, generated by choosing each possible starting runner, then recursively ordering the rest; a tournament bracket's full set of possible matchup sequences, generated the identical way.

### SE Lens

The alternative to deriving `permutations` this carefully is to trust a remembered or copied permutation algorithm without re-deriving it from the leap of faith, risking a subtle mismatch between what the code does and what's actually needed for this specific problem. The real cost of that alternative, made concrete in Concept Unit 4's verification, is a count that might look plausible without being provably exact. Deriving and then checking `permutations` against `factorial`'s independently known values, as this unit does, costs one careful derivation and one direct comparison; it produces a procedure whose correctness is checked, not merely assumed.

---

## Concept Unit 4: Checking permutations Against factorial, and Feeling the Growth

### The Problem

Concept Unit 3's `permutations` looks correct. Lesson 57's multiplication principle predicts it should produce exactly `n!` orderings for a list of `n` distinct items. This prediction needs checking directly against real, independently known `factorial` values — and the real cost of that growth needs to be felt directly, not just read as a formula.

### No isolated lab for this step

This concept has no code of its own to isolate — the real comparison and timing are demonstrated directly below, using code already fully built.

### Applying It — Counts Checked Against factorial

**Predicting, using the multiplication principle (Lesson 57), before checking:** choosing a first element has `n` options; choosing a second has `n − 1` remaining options; and so on down to `1` — `n` independent choices, of shrinking size, multiplying together: `n × (n − 1) × ⋯ × 1 = n!`, exactly `factorial`'s own definition (Lesson 28).

```
$ guile perm-check.scm
n=1 permutations=1 n!=1
n=2 permutations=2 n!=2
n=3 permutations=6 n!=6
n=4 permutations=24 n!=24
n=5 permutations=120 n!=120
n=6 permutations=720 n!=720
n=7 permutations=5040 n!=5040
```

Verified this session — `permutations`' real, generated count matches `factorial`'s independently computed value exactly, at every one of seven tested sizes.

### Applying It — Feeling the Real Cost of Factorial Growth

```
$ guile perm-timing.scm
n=6 count=720 time=2.858 ms
n=7 count=5040 time=14.76 ms
n=8 count=40320 time=133.43 ms
n=9 count=362880 time=1409.105 ms
n=10 count=3628800 time=15984.115 ms
```

Verified this session — moving from `n = 6` to `n = 10`, just four more items, the real, measured time to generate every permutation grows from `2.858` ms to `15,984.115` ms — nearly sixteen seconds. Each additional item doesn't add a fixed amount of time; it *multiplies* the time by a growing factor (`n` at step `n`) — `factorial growth`, felt directly, not just read as a formula. A list of `15` items would have `15!`, over a trillion, orderings — with generation time growing accordingly, well past anything practical to actually run.

### Walkthrough

- **The real seven-way count-versus-`factorial` check** — direct, verified confirmation that `permutations`' recursive derivation produces exactly the count the multiplication principle predicts.
- **The real `2.858` ms to `15,984.115` ms timing progression** — first direct, felt experience of factorial growth's practical cost, not merely its formula.
- **"a list of `15` items would have... over a trillion... orderings"** — an honest extrapolation, clearly marked as extrapolation rather than measured, following this curriculum's discipline (Lesson 39) of distinguishing what was actually run from what's predicted beyond it.

### CS Lens

This is the direct, felt confirmation of Lesson 56's central claim: counting a search space's size in advance — here, `n!` — predicts a real, measured runtime cost, and factorial growth specifically outpaces every fixed multiplication rate, because the factor multiplied at each step keeps growing. Also recognized in: a tournament bracket's number of possible full outcomes, growing factorially with the number of teams, quickly exceeding any practical number to enumerate; a delivery route planner's number of possible stop orderings, growing factorially with the number of stops, becoming impractical to check exhaustively past a small number of destinations.

### SE Lens

The alternative to measuring `permutations`' real timing across several sizes is to trust the `n!` formula abstractly, without ever feeling what it costs in practice. The real cost of that alternative is exactly the "impossible to run" trap Era III's introduction warns about — a formula memorized without an intuition for how fast it actually grows can lead to attempting `permutations` on an input where the honest answer is simply "don't," discovered only after the program has already been waiting for an unacceptably long time. Measuring it directly, as this unit does, up to a real, felt sixteen-second cost at `n = 10`, costs one patient test run; it builds the intuition that will let this reasoning transfer to problems this curriculum hasn't built yet, without needing to re-measure each one from scratch.

---

## Closing

### Connect the pieces

One procedure, `permutations`, traced through every unit built in this lesson:

1. **`apply`, isolated (Unit 1):** a new tool for combining however many lists a list-of-lists happens to contain, verified on three small, disposable examples.
2. **The derivation, in prose (Unit 2):** base case, one empty ordering; recursive case, every possible first element combined with every permutation of what remains — following Lesson 46's leap-of-faith discipline exactly.
3. **The real code (Unit 3):** `permutations`, each clause a direct translation of Unit 2's prose, verified on `(1 2 3)`'s six real orderings.
4. **The count and the cost, both verified (Unit 4):** `permutations`' real counts matching `factorial`'s values exactly at seven sizes, and its real, measured time growing from `2.858` ms to nearly sixteen seconds across just four more items — factorial growth, checked twice, once for correctness and once for cost.

Every real number in this lesson — the six permutations, the seven count-versus-`factorial` matches, the five real timing measurements — came from code built and run this lesson, not asserted from the `n!` formula alone; the formula and the measured evidence were checked against each other directly, exactly this curriculum's standing discipline since Lesson 22.

### What breaks without this

Suppose an engineer needed to check every possible ordering of a set of tasks — scheduling `12` jobs on a single machine to find an optimal sequence, say — and, having learned the `n!` formula abstractly without ever measuring what it costs in practice the way this lesson did, wrote a `permutations`-style generator and simply ran it on all `12` jobs, expecting it to finish in a reasonable amount of time. `12!` is over four hundred seventy million — at this lesson's own measured rate, that could mean a program running for hours or days rather than the seconds a smaller test might have suggested, discovered only after the attempt was already underway. Having felt factorial growth directly, the way Concept Unit 4 did up through `n = 10`'s real sixteen seconds, is what would have predicted this outcome *before* attempting it, motivating a genuinely different approach (later Eras' subject) rather than a doomed brute-force one.

### Exercises

1. **Observe.** List, by hand, all `24` permutations of a `4`-item list of your choosing, and cross-check your count against `factorial(4)`.
2. **Formalize.** Run `permutations` on your Exercise 1 list and confirm its real output matches your hand-written list exactly — same orderings, none missing, none duplicated.
3. **Explain.** State, in your own words, why `permutations`' recursive case considers *every* remaining item as a candidate first element, rather than just one, the way `all-subsets`' recursive case (Lesson 51) considered just one item's two choices.
4. **Formalize.** Measure `permutations`' real timing at three sizes of your own choosing, at least three apart (for example, `n = 5`, `8`, and `11`), following Concept Unit 4's methodology, and report the real, measured growth.
5. **Explain.** Using your Exercise 4 measurements, estimate — honestly marked as an estimate, not a measurement — how long `permutations` would take on an input five items larger than your largest tested size, and explain your reasoning.

### Definition of done

- [ ] You can state `permutations`' base case and recursive case in prose, using the leap-of-faith discipline, without reference to the finished code.
- [ ] You can use `apply` to combine a list of lists into one flat list.
- [ ] You can implement and verify `permutations`, checking its counts against `factorial`'s independently known values.
- [ ] You can explain, from real measured evidence, why factorial growth outpaces every fixed multiplication rate.
- [ ] You completed Exercises 1–5 using a list of your own, not `(1 2 3)`.
- [ ] Commit `permutations.scm` and your Exercise 4 measurements, with a commit message stating the real timing growth you observed.
