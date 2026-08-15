# Lesson 57: Addition and Multiplication Principles

**What you will build:** `all-pairs`, a real procedure generating every combination of one item from one list and one item from another — plus two real, verified counting rules derived directly from it and from `all-subsets` (Lesson 51): choices from **disjoint** categories *add*; choices made **independently** *multiply*. Real, verified evidence this session: splitting `all-subsets`' `1,024` ten-item subsets by even versus odd length gives exactly `512` and `512`, summing back to `1,024`; pairing `5` shirts with `7` pants gives exactly `35` outfits, matching `5 × 7` exactly. The transferable point: Lesson 56 named counting as the shared root behind memory, time, and probability. This lesson supplies the two rules that make counting *computable* without generating and counting every possibility by hand, the way `all-subsets` still does.

**What you need to know first:** Lesson 34 (`FP-L034-map.md`) — specifically `map`, reused directly in `all-pairs`. Lesson 35 (`FP-L035-filter.md`) — specifically `filter`, reused to split subsets by length. Lesson 37 (`FP-L037-append-and-reverse.md`) — specifically `append`, reused to combine `all-pairs`' results. Lesson 51 (`FP-L051-generating-possibilities.md`) — specifically `all-subsets`, whose real subset counts anchor this lesson's addition-principle evidence.

**Terms introduced in this lesson**

- **Disjoint** — two collections of possibilities that share no member in common, so that a possibility belongs to at most one of them. A subset with even length and a subset with odd length are disjoint categories — no subset is both.
- **Addition principle** — if a count is made up of two or more disjoint categories, the total count equals the sum of each category's count. `512` even-length subsets plus `512` odd-length subsets equals `1,024` total subsets, because "even-length" and "odd-length" are disjoint and together cover every subset.
- **Independent choice** — two choices where making one choice doesn't change which options are available for the other. Choosing a shirt doesn't change which pants are available, so shirt and pants are independent choices.
- **Multiplication principle** — if a count is made up of two or more independent choices made together, the total count equals the product of each choice's count. `5` shirts and `7` pants, chosen independently, produce `5 × 7 = 35` total outfits.
- **Cartesian product** — the complete collection of pairs formed by combining every member of one collection with every member of another. `all-pairs` generates exactly the Cartesian product of its two input lists.

## Objects and methods used

- **`even?`**
  - *What it is:* a real Scheme procedure testing whether a number is evenly divisible by `2`.
  - *Implementation:* takes one number, returns `#t` or `#f`; confirmed this session as `(even? (length s))`.
  - *Its use:* Concept Unit 1's split of `all-subsets`' output into disjoint even-length and odd-length categories.
- **`odd?`**
  - *What it is:* a real Scheme procedure testing whether a number is not evenly divisible by `2`.
  - *Implementation:* takes one number, returns `#t` or `#f`; confirmed this session as `(odd? (length s))`.
  - *Its use:* Concept Unit 1's complementary category to `even?`, confirming every subset falls into exactly one of the two.

---

## Concept Unit 1: The Addition Principle — Derived from a Disjoint Split

### The Problem

`all-subsets` (Lesson 51) already produces every subset of a list, and Lesson 56 already confirmed a 10-item list produces exactly `1,024` of them. Splitting that same collection into two categories — subsets with an even number of items, and subsets with an odd number — and counting each category separately raises a direct question: does splitting and re-summing recover the original total, and if so, why should it?

### No isolated lab for this step

`even?` and `odd?` are simple built-in predicates, requiring no new syntax beyond an ordinary procedure call already familiar since Lesson 9 — no isolated lab is needed, following the precedent set for comparison operators in Lesson 35.

### Applying It — Splitting and Re-Summing

```scheme
(define subsets (all-subsets (make-list-of-n 10)))
(define even-count (length (filter (lambda (s) (even? (length s))) subsets)))
(define odd-count (length (filter (lambda (s) (odd? (length s))) subsets)))
```

```
$ guile addition.scm
total subsets: 1024
even-length subsets: 512
odd-length subsets: 512
sum: 1024
```

Verified this session — filtering `all-subsets`' real `1,024` results by `even?` length gives exactly `512`; filtering by `odd?` length gives exactly `512`; the two sum back to `1,024` exactly.

**Naming why this works, in general, not just for this example:** every subset has *some* length, and that length is either even or odd — never both, never neither. "Even-length" and "odd-length" are disjoint (Terms introduced): no subset belongs to both categories. Because the two categories are disjoint *and* together cover every possibility, counting each separately and adding recovers the true total exactly — this is the addition principle.

### Walkthrough

- **`(filter (lambda (s) (even? (length s))) subsets)`** — Lesson 35's `filter`, applied to select only the subsets whose length satisfies `even?`.
- **The real `512`/`512`/`1024` split** — direct, verified evidence that two disjoint, exhaustive categories sum to the whole.
- **"never both, never neither"** — the precise condition (disjoint and exhaustive) under which the addition principle applies, stated explicitly rather than left implicit.

### CS Lens

This is the general principle behind every "total equals sum of parts" count, valid exactly when the parts don't overlap and don't leave anything out — a condition worth checking explicitly, since Lesson 61's Inclusion-Exclusion will later handle the case where categories *do* overlap. Also recognized in: a store's total inventory, computed by summing separately counted, non-overlapping categories (shirts, pants, shoes); a school's total enrollment, computed by summing each disjoint grade level's roster, with no student counted in two grades at once.

### SE Lens

The alternative to checking that categories are genuinely disjoint before adding their counts is to add category counts by habit, trusting that "we split it into groups" automatically means the groups don't overlap. The real cost of that alternative, when categories secretly do overlap, is a total that's silently too large — an error Lesson 61 will name and fix directly, but one only detectable if the disjointness assumption is checked rather than assumed. Verifying it explicitly here, as this unit does with a real `512 + 512 = 1024` check against `all-subsets`' actual, independently known total, costs one small computation; it confirms the addition principle's precondition rather than merely hoping it holds.

---

## Concept Unit 2: The Multiplication Principle — Derived from Independent Choices

### The Problem

The addition principle handles disjoint categories of one collection. A genuinely different situation is two *separate* choices, made together — a shirt and a pair of pants, say — where every combination of the two is a distinct possibility. `all-subsets` has no direct answer for how many such combinations exist; a new procedure is needed.

### Deriving all-pairs — Base Case and Recursive Case, in Prose First

Following Lesson 46's leap-of-faith discipline, before writing any code:

**The invariant, stated first:** `(all-pairs xs ys)` returns a list containing every pair `(x y)` where `x` comes from `xs` and `y` comes from `ys`.

**The base case:** if `xs` is empty, there's no `x` to pair with anything — the result is the empty list.

**The recursive case, derived by trusting `(all-pairs (cdr xs) ys)` without tracing it:** every pair in the final result either uses `(car xs)` as its first element, or it uses some later element of `xs` instead. The pairs using a later element are exactly `(all-pairs (cdr xs) ys)` — trusted, by the leap of faith, to already be correct. The pairs using `(car xs)` are formed by combining `(car xs)` with *every* member of `ys` — exactly `(map (lambda (y) (list (car xs) y)) ys)`.

### The New Code — Type It Yourself

```scheme
(define (all-pairs xs ys)
  (if (null? xs)
      '()
      (append (map (lambda (y) (list (car xs) y)) ys)
              (all-pairs (cdr xs) ys))))
```

### The Updated Project

This is `all-pairs.scm`, in full:

```scheme
(define (all-pairs xs ys)
  (if (null? xs)
      '()
      (append (map (lambda (y) (list (car xs) y)) ys)
              (all-pairs (cdr xs) ys))))

(define shirts (list 'red 'blue 'green 'black 'white))
(define pants (list 'jeans 'khakis 'shorts 'sweats 'slacks 'cargo 'joggers))

(display (length (all-pairs shirts pants)))
(newline)
```

### Reference Source

The derivation above, translated directly: `'()` for the base case; `map` (Lesson 34) pairing `(car xs)` with every member of `ys`; `append` (Lesson 37) combining that batch with the recursive result for the rest of `xs`.

### Files affected

Created: `all-pairs.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile all-pairs.scm
35
```

Verified this session — `5` shirts paired with `7` pants produce exactly `35` combinations, matching `5 × 7` exactly. The first four pairs generated, checked directly: `((red jeans) (red khakis) (red shorts) (red sweats))` — confirming `all-pairs` genuinely combines every shirt with every pant, not some partial subset of combinations.

### Mechanical Walkthrough

- **`(if (null? xs) '() ...)`** — the base case: no shirts left means no pairs left to form.
- **`(map (lambda (y) (list (car xs) y)) ys)`** — forming every pair using the *current* first shirt, one pair per pant, by mapping over the entire `ys` list.
- **`(append ... (all-pairs (cdr xs) ys))`** — combining this shirt's pairs with every pair formed using the *remaining* shirts, trusted by the leap of faith to already be correct.
- **`(length (all-pairs shirts pants))`** — counting the result directly, rather than generating and reading every pair by hand, exactly the way `all-subsets`' count was checked in Lesson 51 and 56.

### CS Lens

This is the direct, mechanical realization of the multiplication principle: for every one of `xs`'s `5` members, `all-pairs` generates a full copy of `ys`'s `7` pairs, giving `5` copies of `7`, which is exactly `5 × 7`. Also recognized in: a restaurant's fixed-price menu, where every one of `4` appetizers can be combined with every one of `6` entrées, giving `4 × 6` possible meals; a car configurator, where every one of `3` colors can be combined with every one of `2` trim levels, giving `3 × 2` possible configurations.

### SE Lens

The alternative to deriving `all-pairs`' recursive structure carefully, base case and recursive case stated in prose first, is to write nested loops directly and trust the result without checking it against a known formula. The real cost of that alternative is exactly the kind of off-by-one or double-counting bug this curriculum has repeatedly guarded against since Lesson 46 — a nested-loop implementation that looks plausible but silently produces `34` or `36` instead of `35`. Deriving it carefully and then checking the real count against `5 × 7` directly, as this unit does, costs one extra verification line; it confirms the implementation matches the counting principle it's meant to demonstrate, not just that it runs without error.

---

## Concept Unit 3: Recognizing Which Principle Applies

### The Problem

Two rules now exist — add for disjoint categories, multiply for independent choices — and using the wrong one silently produces a wrong count with no error message. It's worth stating, directly, how to tell which situation is which, and connecting both back to material already built.

### No isolated lab for this step

This concept has no code of its own to isolate — the distinction is stated directly below, using examples already built in this lesson and in Lesson 51.

### Applying It — A Direct Test, and a Familiar Example Reexamined

**The test:** ask whether the possibilities being counted are alternatives (only one happens — use addition) or combinations (all of them happen together, in every combination — use multiplication). Even-length and odd-length subsets are alternatives — a given subset is one or the other, never both — so they add. A shirt and a pair of pants are combined together into one outfit — every shirt appears with every pant — so they multiply.

**Reexamining `all-subsets`' own `2ⁿ` count (Lesson 52) through this lens:** each item in a 10-item list independently either is or isn't included in a given subset — an independent choice, two options, made once per item, ten times over. By the multiplication principle, ten independent choices of `2` options each multiply: `2 × 2 × ⋯ × 2` (ten times) `= 2¹⁰ = 1,024` — the identical number Lesson 51 and 56 already measured directly, now derived from the multiplication principle alone, without generating a single subset.

### Walkthrough

- **The alternatives-versus-combinations test** — a direct, practical rule for choosing between the two principles this lesson has built, stated explicitly rather than left to intuition.
- **The re-derivation of `all-subsets`' `2¹⁰ = 1,024`** — not new evidence, but confirmation that the multiplication principle alone, with no code run at all, predicts a number this curriculum already measured directly in Lesson 51 and 56.

### CS Lens

This is the actual payoff Lesson 56 promised: counting a search space's size without generating it. `all-subsets` needed real computation, real memory (Lesson 56's `94,191,616` bytes for `n = 20`), and real time to produce `1,048,576` subsets; the multiplication principle predicts that exact number, `2²⁰`, from one line of arithmetic, no generation required. Also recognized in: predicting a combination lock's total possible codes from its number of dials and digits per dial, without ever physically trying every combination; predicting a license plate system's total capacity from its number of character positions and allowed characters per position, without ever printing every plate.

### SE Lens

The alternative to deriving a count via addition and multiplication principles is to always generate the full collection and count it directly, the way `all-subsets` still does. The real cost of that alternative, at a scale where generation itself becomes impractical — Lesson 56's `n = 20` already cost `89.8` MB; a `40`-item list would need far more — is losing the ability to answer "how many?" at all, once actually generating the collection becomes infeasible. Deriving the count algebraically, as this unit does for `all-subsets`' `2¹⁰`, costs nothing beyond the arithmetic itself; it answers a question generation alone cannot answer once the space grows too large to hold.

---

## Concept Unit 4: Combining Both Principles in One Real Count

### The Problem

Real counting questions often need both principles together, not just one in isolation. It's worth building and verifying one such combined question directly, using code already built in this lesson.

### No isolated lab for this step

This concept has no code of its own to isolate — the combined count is demonstrated directly below, using `all-pairs` unchanged from Concept Unit 2.

### Applying It — How Many Outfits Use a Red or Blue Shirt?

**The question, stated precisely:** of all `35` outfits `all-pairs` generates, how many use a shirt that is either red or blue?

**Predicting the answer using both principles together, before checking:** "red or blue" is an addition-principle question over shirts alone — `2` disjoint shirt choices (a shirt can't be both red and blue at once). Each of those `2` shirt choices still combines independently with all `7` pants — a multiplication-principle question. Combined: `2 × 7 = 14`.

```scheme
(define red-or-blue-outfits
  (filter (lambda (p) (or (eq? (car p) 'red) (eq? (car p) 'blue))) pairs))
```

```
$ guile combined.scm
total outfits: 35
red-or-blue outfits: 14
predicted (2 * 7): 14
```

Verified this session — filtering `all-pairs`' real `35` outfits down to those with a red or blue shirt gives exactly `14`, matching the `2 × 7` prediction made *before* checking, exactly.

### Walkthrough

- **The prediction, stated and justified before running any code** — following this curriculum's standing discipline (Lesson 22 onward) of predicting before checking, not explaining after the fact.
- **The real `14`-outfit result, matching the prediction exactly** — confirms both principles apply correctly together, addition nested inside multiplication, not merely each in isolation.

### CS Lens

This is the general shape of most real counting problems: a mix of alternatives and combinations, requiring both principles applied in the correct order, exactly the reasoning behind counting how many ways a database query's filtered, joined result set can grow, or how many test cases a combinatorial test suite needs to cover every disjoint category of input crossed with every independent parameter. Also recognized in: a car configurator counting how many configurations use either of `2` preferred colors, crossed independently with `4` trim levels; a meal-kit service counting how many weekly boxes include either of `2` preferred proteins, crossed independently with `5` side-dish options.

### SE Lens

The alternative to predicting the combined count algebraically is to only ever check combined counts by filtering a fully generated collection, the way Concept Unit 4's verification does. The real cost of that alternative alone, at a scale where generating `all-pairs`' full output becomes impractical, is the same loss Concept Unit 3 already named — no way to answer the question once generation itself is infeasible. Predicting first and confirming with a real, generated check second, as this unit does, gets both: a formula that will keep working at a scale generation cannot reach, and a real, verified confirmation that the formula was applied correctly this time.

---

## Closing

### Connect the pieces

Two rules, derived, verified, and combined:

1. **The addition principle, derived (Unit 1):** `512` even-length plus `512` odd-length subsets of `all-subsets`' real `1,024`-subset output, summing back exactly, because the two categories are disjoint and exhaustive.
2. **`all-pairs`, built (Unit 2):** a new, verified procedure generating every combination of two lists, its `35`-pair count for `5` shirts and `7` pants matching `5 × 7` exactly.
3. **The multiplication principle, named and reapplied (Unit 3):** `all-subsets`' own `2¹⁰ = 1,024`, re-derived from ten independent two-option choices, with no code run at all.
4. **Both principles combined (Unit 4):** a real, predicted-then-verified `2 × 7 = 14` count, addition nested inside multiplication.

Every real number in this lesson — `512`/`512`/`1,024`, `35`, `2¹⁰ = 1,024`, `14` — was either generated by real, running code or predicted algebraically and then checked against real, running code, exactly this curriculum's standing evidence discipline, applied here to two rules general enough to answer Lesson 58 through 62's coming questions (permutations, combinations, Pascal's Triangle, inclusion-exclusion, pigeonhole) without generating a single possibility by hand.

### What breaks without this

Suppose an engineer needed to estimate how many test cases a combinatorial test suite requires — say, `3` disjoint input categories, each independently crossed with `4` configuration options — and, lacking the addition and multiplication principles this lesson derived, attempted to answer the question only by writing code to generate and count every case directly, the way `all-subsets` still does. For a small number of categories and options, this might work; for a realistically sized test matrix, actually generating every combination just to count them could cost far more time and memory than the count itself is worth knowing for, exactly Lesson 56's storage-cost warning, now applied to test design rather than subset generation. Applying the addition and multiplication principles directly, as this lesson does for `all-subsets`' own `2¹⁰`, answers the same question with arithmetic alone, at any scale, generation-free.

### Exercises

1. **Observe.** Identify a real counting question from your own experience — a menu, a wardrobe, a scheduling problem — and classify each part of it as an addition-principle question (alternatives) or a multiplication-principle question (independent choices).
2. **Formalize.** Compute your Exercise 1 question's total count algebraically, using the addition and/or multiplication principle, before writing or running any code.
3. **Explain.** Implement a real, small Scheme program that generates your Exercise 1 question's full collection of possibilities (using `all-pairs`, `all-subsets`, or a procedure of your own), and confirm its real count matches your Exercise 2 prediction exactly.
4. **Explain.** State, in your own words, why `all-subsets`' `2ⁿ` count is an application of the multiplication principle specifically, not the addition principle — referencing Concept Unit 3's alternatives-versus-combinations test directly.
5. **Formalize.** Design one combined addition-and-multiplication counting question of your own, modeled on Concept Unit 4's "red or blue shirt" example, and verify it both algebraically and with real, generated code.

### Definition of done

- [ ] You can state the addition principle and the multiplication principle, each in one precise sentence.
- [ ] You can classify a real counting scenario as needing addition, multiplication, or both, using the alternatives-versus-combinations test.
- [ ] You can implement and verify `all-pairs`, and explain why its structure directly realizes the multiplication principle.
- [ ] You can re-derive `all-subsets`' `2ⁿ` count from the multiplication principle alone, without generating any subsets.
- [ ] You completed Exercises 1–5 using a counting question of your own, not the shirts-and-pants example.
- [ ] Commit your Exercise 3 and Exercise 5 code and findings, with a commit message stating both counting questions and their verified totals.
