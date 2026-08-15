# Lesson 59: Combinations

**What you will build:** `combinations`, a real procedure generating every possible way to choose `k` items from a list, order ignored — verified against a direct binomial-coefficient formula built from `factorial` (Lesson 28) at every one of nine tested values, and verified to sum, across every possible `k` from `0` to `8`, to exactly `256`, matching `all-subsets`' own `2⁸` count (Lesson 51, Lesson 57) exactly. The transferable point: Lesson 58 counted orderings, where *which position* an item lands in matters. This lesson counts selections, where it doesn't — a genuinely different question, related to permutations by a precise, derivable formula, not just a similar-sounding one.

**What you need to know first:** Lesson 28 (`FP-L028-recursive-functions.md`) — specifically `factorial`, reused directly to build the binomial-coefficient formula this lesson checks `combinations` against. Lesson 51 (`FP-L051-generating-possibilities.md`) — specifically `all-subsets`, whose `2ⁿ` total this lesson's summed combination counts are checked against. Lesson 57 (`FP-L057-addition-and-multiplication-principles.md`) — specifically the addition principle, reused directly in `combinations`' own recursive case. Lesson 58 (`FP-L058-permutations.md`) — specifically `permutations` and the leap-of-faith derivation style, both extended here.

**Terms introduced in this lesson**

- **Combination** — a selection of `k` items from a collection, where order doesn't matter. Choosing `{1, 2}` from `(1 2 3 4)` is one combination — `{2, 1}` is the *same* combination, not a second one, unlike `permutations` (Lesson 58), where `(1 2)` and `(2 1)` are two distinct orderings.
- **Binomial coefficient** — the count of combinations of `k` items chosen from `n`, written `C(n, k)`, computed as `n! / (k! × (n − k)!)`. `C(8, 2) = 28`, meaning there are exactly `28` distinct two-item selections from an eight-item collection.

## Objects and methods used

- **`cond`**
  - *What it is:* a real Scheme special form for choosing among more than two branches, checking each of several conditions in order and evaluating the first one that's true.
  - *Implementation:* takes any number of `(condition result)` clauses, plus an optional final `(else result)` clause, evaluating and returning the result of the first clause whose condition is true; confirmed this session as `(cond ((< n 0) 'negative) ((= n 0) 'zero) (else 'positive))`.
  - *Its use:* `combinations`' own three-way branch — zero items still needed, no items left to choose from, or neither, requiring the actual recursive combining logic.

---

## Concept Unit 1: cond — Isolated Lab

### The Problem

`combinations`' derivation, worked out next, needs to distinguish three separate situations, not two — every `if` this curriculum has built so far has chosen between exactly two branches. A new tool is needed for choosing among more than two, and per this curriculum's Concept Isolation Rule, it gets its own throwaway lab before real use.

### Concept Isolation Rule — Throwaway Lab

```scheme
(define (classify n)
  (cond ((< n 0) 'negative)
        ((= n 0) 'zero)
        (else 'positive)))

(display (classify -5)) (newline)
(display (classify 0)) (newline)
(display (classify 5)) (newline)
```

```
$ guile cond-lab.scm
negative
zero
positive
```

Verified this session — `(classify -5)` checks `(< n 0)` first, finds it true, and returns `'negative` without checking any further clause; `(classify 0)` checks `(< n 0)`, finds it false, checks `(= n 0)`, finds it true, and returns `'zero`; `(classify 5)` fails both specific conditions and falls through to `else`, returning `'positive`.

**Discarding this lab:** `classify` exists purely to see `cond` choose among three branches in isolation. It is discarded now — `combinations`' real use of `cond`, built next, is a separate, real use serving a real purpose.

### Walkthrough

- **`(cond ((< n 0) 'negative) ...)`** — first real use: `cond`'s first clause, a condition (`(< n 0)`) paired with a result (`'negative`).
- **Checking clauses in order, stopping at the first true one** — confirmed directly by `(classify -5)` never reaching its later clauses at all.
- **`(else 'positive)`** — a catch-all final clause, reached only when every earlier condition has failed, exactly the role `if`'s final `else`-branch plays, but here as the last of several checked possibilities rather than the only alternative.

### CS Lens

This is the general tool for expressing "check several distinct possibilities in order, act on whichever one applies" — a shape `if` alone can express only awkwardly, by nesting one `if` inside another's else-branch. Also recognized in: a triage nurse checking a patient against several conditions in order of severity, treating the first one that applies; a customer support script checking several possible issue categories in order, routing to the first one that matches.

### SE Lens

The alternative to isolating `cond` in its own lab is to introduce it for the first time inside `combinations` itself, where its behavior would be tangled up with the recursive derivation's own logic. The real cost of that alternative is exactly what this curriculum's Concept Isolation Rule has guarded against since Lesson 3: a bug in `combinations` becomes ambiguous between "`cond`'s clause order was misunderstood" and "the recursive derivation was wrong." Isolating it first, as this unit does, costs three small lines and one real run; it means Concept Unit 2's real code can be trusted to reveal only algorithmic issues, not syntax confusion.

---

## Concept Unit 2: Deriving combinations — Three Cases, Not Two

### The Problem

Following Lesson 46's leap-of-faith discipline, `combinations`' cases need working out in prose, before any code is written — and unlike `all-subsets` or `permutations`, this derivation genuinely needs three cases, not two.

### Applying It — The Derivation

**The invariant, stated first:** `(combinations lst k)` returns a list containing every possible `k`-item selection from `lst`, order ignored, each selection itself a list.

**The first base case — enough already chosen:** if `k` is `0`, exactly one selection satisfies "choose zero items" — the empty selection. `(combinations lst 0)` should return `(list '())`, regardless of what `lst` contains.

**The second base case — nothing left to choose from:** if `lst` is empty but `k` is still greater than `0`, there's no way to choose `k` items from nothing — the result is the empty list, `'()`, containing *no* selections at all (not even the empty one — a genuinely different result from the first base case).

**The recursive case, derived using the addition principle (Lesson 57):** every `k`-item selection from `lst` either includes `(car lst)` or it doesn't — two disjoint categories, exactly Lesson 57's addition principle. The selections that *include* `(car lst)` are `(car lst)` combined with every `(k − 1)`-item selection of the rest — trusted, by the leap of faith, to already be sitting in `(combinations (cdr lst) (- k 1))`. The selections that *don't* include `(car lst)` are exactly every `k`-item selection of the rest — trusted to already be sitting in `(combinations (cdr lst) k)`. Adding these two disjoint categories together, exactly as Lesson 57's addition principle prescribes, gives every `k`-item selection of `lst`.

### Walkthrough

- **The invariant, stated in Lesson 46's precise form** — establishes exactly what `combinations` must guarantee before any code exists.
- **Two base cases, not one** — the first genuinely three-branch derivation this curriculum has built, motivating Concept Unit 1's `cond` directly.
- **"exactly Lesson 57's addition principle"** — a direct, explicit reapplication of a previously derived counting rule to a new recursive derivation, not a coincidental resemblance.

### CS Lens

This is the recursive leap of faith (Lesson 46), combined directly with the addition principle (Lesson 57), applied to a genuinely new question: not "which item comes first" (Lesson 58's permutations) but "is this item in or out," with the added twist of tracking exactly how many more need to be chosen. Also recognized in: assembling a committee of a fixed size from a pool of candidates, where each candidate is either selected or not, and the committee's composition, once assembled, doesn't depend on the order candidates were considered; choosing a fixed-size sample of products for quality testing, where which specific items are chosen matters, but not the order they were pulled from the shelf.

### SE Lens

The alternative to deriving `combinations`' two base cases separately is to conflate them into one, treating "nothing left to choose" the same as "nothing left needed" — a mistake this unit's derivation explicitly guards against by naming them as genuinely different results (`(list '())` versus `'()`). The real cost of that conflation, left unexamined, is a procedure that silently miscounts whenever `k` exceeds `lst`'s length, a case easy to overlook without having stated both base cases explicitly first. Deriving them separately, as this unit does, costs one extra careful distinction; it is exactly what Concept Unit 1's `cond`, with its three ordered clauses, was isolated to express cleanly.

---

## Concept Unit 3: The Complete combinations Procedure, Verified

### The Problem

Concept Unit 2 supplied the derivation; Concept Unit 1 supplied the tool needed to express its three cases cleanly. It's time to write the real, final procedure and check it thoroughly.

### The New Code — Type It Yourself

```scheme
(define (combinations lst k)
  (cond ((= k 0) (list '()))
        ((null? lst) '())
        (else (append
                (map (lambda (c) (cons (car lst) c))
                     (combinations (cdr lst) (- k 1)))
                (combinations (cdr lst) k)))))
```

### The Updated Project

This is `combinations.scm`, in full:

```scheme
(define (combinations lst k)
  (cond ((= k 0) (list '()))
        ((null? lst) '())
        (else (append
                (map (lambda (c) (cons (car lst) c))
                     (combinations (cdr lst) (- k 1)))
                (combinations (cdr lst) k)))))

(display (combinations (list 1 2 3 4) 2))
(newline)
```

### Reference Source

Concept Unit 2's derivation, translated directly, one clause of `cond` per case: `(= k 0)` guards the first base case, returning `(list '())`; `(null? lst)` guards the second, returning `'()`; `else` handles the recursive case, `append` (Lesson 37) combining the two disjoint categories the addition principle identified.

### Files affected

Created: `combinations.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile combinations.scm
((1 2) (1 3) (1 4) (2 3) (2 4) (3 4))
```

Verified this session — all six two-item selections from `(1 2 3 4)` generated, each one appearing exactly once, `(1 2)` present but `(2 1)` absent, confirming order genuinely doesn't matter here, unlike `permutations` (Lesson 58).

### Mechanical Walkthrough

- **`(cond ((= k 0) (list '())) ...)`** — the first base case: zero items needed, exactly one selection (the empty one) satisfies that.
- **`((null? lst) '())`** — the second base case: items still needed but none left to choose from, no selection satisfies that.
- **`(else (append ... ...))`** — the recursive case, reached only once both base cases have been ruled out.
- **`(map (lambda (c) (cons (car lst) c)) (combinations (cdr lst) (- k 1)))`** — the "include `(car lst)`" category: every `(k − 1)`-item selection of the rest, with `(car lst)` added to each.
- **`(combinations (cdr lst) k)`** — the "exclude `(car lst)`" category: every `k`-item selection of the rest, unchanged.
- **`(append ... ...)`** — combining the two disjoint categories, exactly as Concept Unit 2's addition-principle reasoning prescribed.

### CS Lens

This is a complete, correct realization of Concept Unit 2's derivation, every clause of the prose corresponding to one piece of the final code — and a direct, working demonstration that the addition principle (Lesson 57) isn't only useful for counting after the fact, but for *deriving* a recursive case in the first place. Also recognized in: a lottery's number-selection process, generating every possible winning combination without regard to the order the balls were drawn; a genetics textbook's enumeration of which allele combinations are possible from a set of options, order never mattering.

### SE Lens

The alternative to combining the two categories with `append`, trusting the addition-principle derivation to be correct, is to write `combinations` some other, less structured way and check its output only informally. The real cost of that alternative is a procedure whose correctness rests on inspection of a few printed examples rather than on a traceable, checkable derivation. Building it exactly the way Concept Unit 2 derived it, as this unit does, means Concept Unit 4's binomial-coefficient check is verifying a *specific, derived* procedure, not a plausible-looking guess.

---

## Concept Unit 4: Checking combinations Against the Binomial Coefficient

### The Problem

Combinations should be countable directly, by formula, the same way `permutations`' count was checked against `factorial` in Lesson 58. It's worth deriving that formula and checking it against `combinations`' real, generated output — and connecting the result back to `all-subsets`' own already-established `2ⁿ` count.

### No isolated lab for this step

This concept has no code of its own to isolate — the real comparison is demonstrated directly below, using code already fully built.

### Applying It — Deriving and Checking the Binomial Coefficient

**Deriving the formula, using `permutations` (Lesson 58) and a correction for order:** `permutations` of `k` items chosen from `n`, in order, numbers `n! / (n − k)!` (Lesson 58's own reasoning, stopped after `k` choices instead of continuing to `1`). Every one of `combinations`' *unordered* selections corresponds to exactly `k!` of those *ordered* arrangements — one for each of its own internal orderings (Lesson 58's own `k!` count, applied to the selection itself). Dividing out that overcounting gives the binomial coefficient: `C(n, k) = n! / (k! × (n − k)!)`.

```scheme
(define (binomial n k)
  (/ (factorial n) (* (factorial k) (factorial (- n k)))))
```

```
$ guile combo-check.scm
C(8,0)=1  binomial=1
C(8,1)=8  binomial=8
C(8,2)=28  binomial=28
C(8,3)=56  binomial=56
C(8,4)=70  binomial=70
C(8,5)=56  binomial=56
C(8,6)=28  binomial=28
C(8,7)=8  binomial=8
C(8,8)=1  binomial=1
```

Verified this session — `combinations`' real, generated count matches the `binomial` formula's independently computed value exactly, at every one of nine tested values of `k`, for `n = 8`.

**Connecting back to `all-subsets` (Lesson 51) and the addition principle (Lesson 57):** every subset of an 8-item list has *some* size, from `0` to `8` — disjoint, exhaustive categories, exactly the addition principle's precondition. Summing `combinations`' counts across every one of those categories should recover `all-subsets`' own total, `2⁸`.

```
$ guile combo-check.scm
sum over k=0..8: 256
2^8: 256
```

Verified this session — summing `C(8, 0)` through `C(8, 8)` gives exactly `256`, matching `2⁸` exactly, confirming `combinations` and `all-subsets` are two different ways of counting the identical thing: `all-subsets` all at once, `combinations` broken down by exact size.

### Walkthrough

- **The binomial-coefficient derivation, connecting `permutations`' `n!/(n-k)!` to `combinations` via a `k!` overcounting correction** — a genuine derivation, not a memorized formula, tracing directly back to Lesson 58's own reasoning.
- **The real nine-way match at `n = 8`** — direct, verified confirmation that `combinations`' recursive derivation produces exactly the count the binomial-coefficient formula predicts.
- **The real `256`-versus-`2⁸` match** — confirms `combinations`, summed across every possible `k`, is not merely *similar* to `all-subsets`, but counts the identical total, decomposed by size using the addition principle.

### CS Lens

This is the precise relationship between permutations and combinations made concrete: combinations undercounts orderings by exactly the factor `permutations` overcounts them by, `k!`, and the two are related by a derivable formula rather than by resemblance alone. Also recognized in: a poll's reported "unique respondent count" being derivable from its raw "response count" once duplicate submissions per respondent are known and divided out; a shipping manifest's "unique destination count" being derivable from its "package count" once average packages-per-destination is known and divided out.

### SE Lens

The alternative to deriving the binomial coefficient from `permutations`' own formula is to look it up and use it without understanding where the `k!` in the denominator comes from. The real cost of that alternative is exactly what this curriculum has warned against since its first proof lessons (Era I): a formula used correctly by luck or memorization, but not available for adapting when a genuinely new, related counting question arises — Lesson 60's Pascal's Triangle, built directly next, needs exactly this kind of adaptable understanding, not a memorized formula alone. Deriving it here, as this unit does, costs one extra reasoning step; it means the formula is available to extend, not just to apply.

---

## Closing

### Connect the pieces

One procedure, `combinations`, traced through every unit built in this lesson:

1. **`cond`, isolated (Unit 1):** a new tool for three-way branching, verified on three small, disposable examples.
2. **The derivation, in prose (Unit 2):** two base cases, carefully distinguished, and a recursive case built directly from Lesson 57's addition principle.
3. **The real code (Unit 3):** `combinations`, each `cond` clause a direct translation of one of Unit 2's three cases, verified on `(1 2 3 4)`'s six real two-item selections.
4. **The formula, derived and checked (Unit 4):** the binomial coefficient, derived from `permutations`' own reasoning, matched against `combinations`' real output at nine values, and the summed total matched against `all-subsets`' `2⁸` exactly.

Every real number in this lesson — the six two-item selections, the nine `C(8, k)`-versus-`binomial` matches, the `256`-versus-`2⁸` match — came from code built and run this lesson, and every derivation traced back to a specific, already-established piece of this curriculum: Lesson 28's `factorial`, Lesson 51's `all-subsets`, Lesson 57's addition principle, and Lesson 58's `permutations`, nothing introduced as an unexplained formula.

### What breaks without this

Suppose an engineer needed to determine how many distinct five-person teams could be formed from a pool of twenty candidates, and, having only `permutations`' formula available without ever deriving `combinations`' separate meaning, computed `20!/(15)!` — the count of *ordered* arrangements of five candidates — reporting a number roughly `120` times too large, since every actual team was being counted once for each of its `5!` possible internal orderings. This is not a hypothetical mistake; it is exactly the overcounting Concept Unit 4's derivation named and corrected for. Understanding precisely when order matters (`permutations`) and when it doesn't (`combinations`), and knowing the exact `k!` relationship between them, as this lesson derived directly, is what prevents this specific, easy-to-make counting error.

### Exercises

1. **Observe.** List, by hand, all six two-item selections from a `4`-item list of your choosing, and confirm they match Concept Unit 3's structure — no ordering distinguished, no selection repeated.
2. **Formalize.** Compute `C(4, 2)` using the binomial-coefficient formula, and confirm it matches your Exercise 1 count.
3. **Explain.** State, in your own words, why `combinations`' second base case (`(null? lst)`, returning `'()`) must return something different from its first base case (`(= k 0)`, returning `(list '())`) — referencing what each result actually means.
4. **Formalize.** For a list size of your own choosing, sum `combinations`' counts across every value of `k` from `0` to the list's length, and confirm the total matches `2ⁿ`, the way Concept Unit 4 confirmed it for `n = 8`.
5. **Explain.** Using Concept Unit 4's derived relationship between `permutations` and `combinations`, explain in your own words why `C(n, k)` is always `permutations`' `k`-item count divided by exactly `k!`, not some other value.

### Definition of done

- [ ] You can state `combinations`' two base cases and its recursive case in prose, distinguishing precisely what each base case means.
- [ ] You can use `cond` to express a three-way (or more) branch.
- [ ] You can implement and verify `combinations`, checking its counts against the binomial-coefficient formula.
- [ ] You can derive the binomial coefficient formula from `permutations`' own reasoning, explaining the role of the `k!` correction.
- [ ] You completed Exercises 1–5 using a list of your own, not `(1 2 3 4)`.
- [ ] Commit `combinations.scm` and your Exercise 4 findings, with a commit message stating the list size you tested and the total you confirmed.
