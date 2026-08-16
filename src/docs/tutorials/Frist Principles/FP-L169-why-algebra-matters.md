# Lesson 169: A Law You Can't Always Trust — Why Algebra Matters to Programmers

**What you will build.** A real, working test for one specific algebraic law — **associativity** — applied to real Scheme operations, and a real, dramatic case where a law this curriculum has silently relied on since Lesson 1 turns out not to hold at all. Three real procedures: a direct comparison of `(op (op a b) c)` against `(op a (op b c))`; `sum-left-to-right` and `split-sum`, two genuinely different ways of adding up the same list of numbers; and a real check that list concatenation obeys the same law addition does, even though the two operations look nothing alike. The transferable idea, opening this whole new Era: an **algebraic law** is a precise, testable claim about how an operation behaves — not a vague mathematical nicety, but the exact reason a compiler, a parallel reduction, or a reordered computation is allowed to produce the same answer a different way, and a real, concrete reason to check a law rather than assume it, the same discipline Lesson 168 just closed Era VI with.

**What you need to know first.** Lesson 79 (Merge Sort) and Lesson 158 (Randomized Quicksort) for divide-and-conquer, the pattern this lesson's own `split-sum` reuses. Lesson 162 (Sampling) for this curriculum's now-standard exact-rational-arithmetic practice, and the contrast this lesson draws against it. Lesson 168 (Reasoning Under Uncertainty) for this curriculum's closing habit from Era VI — checking an assumption directly against real evidence, rather than trusting it by default — the exact habit this lesson applies to a completely different kind of assumption.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. Scheme's loop construct, with no separate `for` or `while` keyword.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call. This lesson reuses it, unchanged, for `sum-left-to-right`'s own running total.
- **`if`** — a two-branch conditional: evaluates its test, then evaluates exactly one of its remaining sub-expressions.
- **Quoted list literal** — a list written directly in source code, preceded by `'`, treated as a literal value rather than a procedure call.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction, never a rounded decimal — this lesson's own contrast case, since exact arithmetic never rounds and never breaks the laws this lesson tests.
- **Floating-point (inexact) numbers** — Guile's other numeric representation, used for real numbers that can't be written as exact fractions, or written directly with a decimal point or scientific notation (`1e20`). Every floating-point value is really a fixed-width binary approximation, and every operation on one can introduce a small rounding error — this lesson's own subject, and the reason this lesson exists at all.
- **Binary operation** — an operation that takes exactly two inputs of some type and produces one output of that same type, like `+` on numbers or `append` on lists — the shape every algebraic law in this lesson (and this whole Era) is stated about.
- **Algebraic law** — a precise, testable claim about how a binary operation behaves for *every* valid input, not just some — a genuine mathematical statement, checkable the same way any other claim in this curriculum gets checked: exactly, or by real evidence.
- **Associativity** — the specific law this lesson tests: an operation `op` is associative when `(op (op a b) c)` always equals `(op a (op b c))`, for every valid `a`, `b`, and `c` — meaning the *grouping* of a chain of operations never changes the result, only their left-to-right order matters.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`sum-left-to-right`**
  - *What it is:* a procedure this lesson derives in Concept Unit 3 — adds up a list of numbers strictly in order, one at a time, left to right.
  - *Implementation:* `(sum-left-to-right lst)` → a number, the same type (exact or inexact) as `lst`'s own elements.
  - *Its use:* the baseline, single "obviously correct" way of summing a list, used as the standard everything else gets compared against.
- **`split-sum`**
  - *What it is:* derived in Concept Unit 3 — adds up the same list a genuinely different way: split it into two halves, sum each half independently, then add the two half-sums together.
  - *Implementation:* `(split-sum lst)` → a number, computed with a different real grouping of additions than `sum-left-to-right` uses.
  - *Its use:* the real, concrete stand-in for what a parallel reduction actually does — splitting work into independent chunks, then combining the results — and the real test of whether that split is safe.

*Everything else in the file, not this lesson's subject but still explained:*

- **`+`, `-`**
  - *What it is:* two of Scheme's arithmetic procedures — ordinary procedures, not special syntax.
  - *Implementation:* `(+ a b)` and `(- a b)` each take any number of numeric arguments; on exact rationals, the result stays exact; on floating-point numbers, the result is rounded to the nearest representable value.
  - *Its use:* `+` is this lesson's own main subject, tested directly for associativity; `-` provides this lesson's first, simplest example of an operation that plainly isn't associative at all.
- **`=`**
  - *What it is:* a numeric comparison procedure, returning `#t` or `#f`.
  - *Implementation:* `(= a b)` compares two numbers for exact numeric equality, regardless of whether either is exact or inexact.
  - *Its use:* directly checks whether two different groupings of the same operation produced the identical result.
- **`append`**
  - *What it is:* a procedure — joins two or more lists together into one new list.
  - *Implementation:* `(append lst1 lst2)` returns a fresh list holding every element of `lst1` followed by every element of `lst2`; neither original list is modified.
  - *Its use:* this lesson's second real binary operation, tested for the exact same associativity law `+` was tested for, on genuinely different data.
- **`equal?`**
  - *What it is:* a predicate — checks whether two values have the same structure and contents, not merely whether they're the identical object in memory.
  - *Implementation:* `(equal? a b)` returns `#t` for two lists (or other compound structures) with matching elements in matching positions.
  - *Its use:* `=` only compares numbers; comparing two lists for "the same contents" needs `equal?` instead.
- **`length`**
  - *What it is:* a measuring procedure — counts how many elements a list has.
  - *Implementation:* `(length lst)` returns an exact integer.
  - *Its use:* `split-sum` needs to know how big a list is before deciding where its own midpoint falls.
- **`quotient`**
  - *What it is:* a procedure — performs integer division, discarding any remainder.
  - *Implementation:* `(quotient a b)` returns the whole number of times `b` divides into `a`.
  - *Its use:* `split-sum` divides a list's own length by `2` to find where to split it into two halves.
- **`list-head`**
  - *What it is:* an accessor — returns a new list holding just the first several elements of a given list.
  - *Implementation:* `(list-head lst k)` returns a fresh list of `lst`'s own first `k` elements.
  - *Its use:* `split-sum` reads off the first half of a list this way.
- **`list-tail`**
  - *What it is:* an accessor — returns everything in a list *after* its own first several elements.
  - *Implementation:* `(list-tail lst k)` returns the remainder of `lst` after skipping its first `k` elements.
  - *Its use:* `split-sum` reads off the second half of a list this way.
- **`null?`**
  - *What it is:* a predicate — reports whether a value is the empty list.
  - *Implementation:* `(null? x)` returns `#t` if `x` is `'()`.
  - *Its use:* `sum-left-to-right`'s own base case, detecting when every element has already been added.
- **`car`**
  - *What it is:* an accessor — returns the first element of a pair, and by extension a list's first element.
  - *Implementation:* `(car p)` returns the first component of pair `p`.
  - *Its use:* reads the current number off the front of the list `sum-left-to-right` is walking.
- **`cdr`**
  - *What it is:* an accessor — returns everything in a pair after the first element; for a list, the rest of the list.
  - *Implementation:* `(cdr p)` returns the second component of pair `p`.
  - *Its use:* advances `sum-left-to-right`'s own walk one number at a time.
- **`list`**
  - *What it is:* a constructor — builds a list directly from its arguments.
  - *Implementation:* `(list v0 v1 ... vn)` returns a fresh list holding exactly those values, in that order.
  - *Its use:* builds every real number list this lesson tests.
- **`display`**
  - *What it is:* an output procedure — writes a human-readable representation of a value to the terminal.
  - *Implementation:* `(display obj)` sends `obj`'s printed form to the current output port.
  - *Its use:* every real result in this lesson's Run It sections was produced with `display`.
- **`newline`**
  - *What it is:* an output procedure — writes a single line break.
  - *Implementation:* `(newline)` takes no required arguments.
  - *Its use:* keeps each displayed result on its own line.

---

## Concept Unit: Associativity — A Law to Test, Not Assume

### The Problem

Every arithmetic expression this curriculum has ever written with more than two numbers — `(+ a b c)`, or a chain of additions inside a loop — has an implicit grouping choice buried inside it: does `a + b + c` mean `(a + b) + c`, or `a + (b + c)`? For ordinary arithmetic, this feels like a non-question — everyone learns in school that addition just doesn't care how it's grouped. But "everyone knows this" is exactly the kind of claim Lesson 168 just spent an entire lesson insisting shouldn't be trusted without being checked. Is grouping genuinely irrelevant for every operation this curriculum has used `+`-like reasoning on, or does that depend on something worth checking directly?

### Project Change

- **Reference Source** — No reference counterpart. This lesson tests a real algebraic law directly, rather than porting a reference implementation.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree.
- **Change type** — none yet — this Concept Unit's own content is a direct comparison using Scheme's already-existing `+`, not a new procedure.
- **Location** — not applicable; nothing is being added to any existing structure.
- **Dependencies** — none beyond Guile's built-in arithmetic.

### The New Code

None — this Concept Unit tests an already-existing operation, `+`, directly, rather than deriving a new procedure.

### The Updated Project

Not applicable — no new code is being added to any existing structure.

### Isolated Lab: A Clearly Non-Associative Operation

Before testing whether `+` respects **associativity**, it's worth seeing an operation that clearly, obviously doesn't — so the *shape* of a genuine violation is unmistakable before looking for a subtler one. Subtraction, on two small, ordinary integers:

```scheme
(- (- 10 5) 2)
;=> 3

(- 10 (- 5 2))
;=> 7
```

`3` and `7` — genuinely different real results from the exact same three numbers, `10`, `5`, and `2`, differing only in how the two subtractions are grouped. `(- (- 10 5) 2)` computes `10 - 5`, getting `5`, then subtracts `2` more, landing on `3`; `(- 10 (- 5 2))` computes `5 - 2` first, getting `3`, then subtracts *that* from `10`, landing on `7`. Subtraction is **not associative** — grouping genuinely changes the answer, with no rounding or approximation involved at all, just the ordinary meaning of subtraction itself.

### Discarding the Lab

This one subtraction example is discarded now. It never appears in the project again — it served only to make unmistakably clear what a real associativity violation looks like, before testing the operation this lesson actually cares about.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(- (- 10 5) 2)`** — the inner `(- 10 5)` computes `5` first, since Scheme always evaluates a sub-expression before the expression containing it; the outer `-` then subtracts `2` from that `5`, giving `3`.
- **`(- 10 (- 5 2))`** — here, the inner `(- 5 2)` computes `3` first; the outer `-` then subtracts that `3` from `10`, giving `7`. Same three numbers, same operation, different grouping — the parentheses alone decide which subtraction happens first, and that choice genuinely changes which number the final answer is.

### CS Lens

This is **associativity** (or, here, its absence) — whether `(op (op a b) c)` equals `(op a (op b c))` for every valid input, a precise, checkable claim about an operation's own behavior.

Also recognized in: matrix multiplication, associative even though it's not commutative (`AB ≠ BA` in general, but `(AB)C = A(BC)` always); function composition, where `(f ∘ g) ∘ h` and `f ∘ (g ∘ h)` always describe the exact same combined function; and, as a deliberate non-example matching this lesson's own subtraction case, floating-point division, which — like subtraction — plainly isn't associative even before any rounding is considered: `(10 / 5) / 2 = 1`, but `10 / (5 / 2) = 4`.

### SE Lens

The design principle here is **checking a law's shape on an obvious case before hunting for a subtle one**. Subtraction's own violation needed no special numbers, no rounding, nothing surprising — it's simply true, always, for almost any three numbers tried.

An alternative that was *not* chosen: skip straight to testing `+`, the operation this lesson actually cares about, without first confirming what a genuine violation even looks like. That alternative saves one small example, but risks a real confusion later: if `+`'s own test (Concept Unit 2) turns up a genuine violation, having already seen one clean, unambiguous violation here makes it immediately recognizable as the same *kind* of result, rather than something that might be mistaken for a display quirk or a typo.

### Run It

The Isolated Lab's own two calls *are* this Concept Unit's real, run output — there is no further code to execute here, only the conclusion to carry forward: grouping can genuinely change an operation's result, confirmed on subtraction, real and unambiguous. The next problem is checking whether addition, the operation this whole curriculum has trusted implicitly since Lesson 1, actually avoids that same fate.

### Connection

A clean, obvious non-associative operation is now on record. The next problem is testing addition itself — first on exact numbers, where the answer might be reassuring, and then on the numeric type this curriculum has, so far, only used for *reading* results, never for computing with directly.

---

## Concept Unit: Testing Addition, Exact and Inexact

### The Problem

Subtraction breaks associativity plainly and unsurprisingly. Addition is the operation every fold, every sum, every accumulator this curriculum has built since Era I has silently trusted to be associative — but "silently trusted" is exactly the phrase Lesson 168 spent a whole lesson warning against. Does `+` actually satisfy `(+ (+ a b) c) = (+ a (+ b c))`, for every kind of number this curriculum has used?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — none — this Concept Unit also tests `+` directly, an already-existing operation.
- **Location** — not applicable.
- **Dependencies** — none beyond Guile's built-in arithmetic.

### The New Code

None — this Concept Unit tests `+` directly, the same way Concept Unit 1 tested `-`.

### The Updated Project

Not applicable.

### Isolated Lab: None — Justified Skip

This Concept Unit's own content — comparing `(+ (+ a b) c)` against `(+ a (+ b c))` — is the exact same comparison shape Concept Unit 1's Isolated Lab already demonstrated, applied to a different operation. No new Scheme construct is introduced; the whole point of this Concept Unit is the *result* of that already-established comparison, applied first to exact integers, then to floating-point numbers, not a new mechanical idea needing its own isolated demonstration.

### Run It

Exact integers first:

```scheme
(+ (+ 2 3) 4)
;=> 9

(+ 2 (+ 3 4))
;=> 9

(= (+ (+ 2 3) 4) (+ 2 (+ 3 4)))
;=> #t
```

`9` and `9` — matching exactly, confirmed with `=`. This isn't a coincidence of these particular numbers: exact integer and exact rational addition genuinely is associative, for every valid input, provably so from the ordinary mathematical definition of addition — Guile's own exact numeric tower never rounds, so there's no mechanism by which grouping *could* change the answer.

Now the same law, tested on floating-point numbers instead — chosen deliberately, not randomly, to make any real rounding effect as visible as possible:

```scheme
(define a 1e20)
(define b -1e20)
(define c 1.0)

(+ (+ a b) c)
;=> 1.0

(+ a (+ b c))
;=> 0.0

(= (+ (+ a b) c) (+ a (+ b c)))
;=> #f
```

`1.0` and `0.0` — genuinely different real results, confirmed by `=` returning `#f`, from adding the exact same three numbers in a different grouping. `(+ (+ a b) c)` computes `1e20 + (-1e20)` first — exactly `0.0`, no rounding involved, since the two huge numbers cancel perfectly — then adds `1.0` to that `0`, giving `1.0`. `(+ a (+ b c))` computes `-1e20 + 1.0` first — and *this* is where rounding enters: `1.0` is astronomically smaller than `1e20`'s own precision at that magnitude, so `-1e20 + 1.0` rounds right back down to exactly `-1e20`, with the `1.0` silently lost; adding that rounded `-1e20` to `a`, `1e20`, then gives exactly `0.0`. The real number, mathematically, is `1` either way — but floating-point addition isn't computing the real number exactly, it's computing the *closest representable approximation* at every single step, and which intermediate roundings happen depends entirely on the grouping.

### CS Lens

This is **floating-point non-associativity**: `+` on inexact numbers fails the same associativity law that exact addition satisfies provably, because every individual addition can silently round its own result before the next addition ever sees it.

Also recognized in: numerical simulation and scientific computing, where running the identical calculation on different hardware, or with a different compiler's own optimization choices about operation order, can produce measurably different final results, purely from this effect; financial systems that deliberately use exact decimal or fixed-point arithmetic instead of floating-point for money, specifically to avoid this class of surprise; machine learning training runs, where reordering how gradients from different batches get summed (often for parallelism) can produce slightly different trained models, run to run, even given the identical data and the identical random seed; and reproducibility bugs in any parallel numerical codebase, where "the same program gave a different answer" traces back, more often than intuition expects, to exactly this non-associativity rather than to any actual logic error.

### SE Lens

The design principle here is **an operation's own type determines which laws are safe to assume**, not the operation's name alone. `+` is `+` regardless of whether it's adding exact rationals or floating-point numbers — the *same symbol*, the *same conceptual operation* — but only one of the two obeys associativity, and nothing about the syntax `(+ a b c)` reveals which one is in play.

An alternative that was *not* chosen: use exact rational arithmetic everywhere in this curriculum, as Lessons 162 through 168 have consistently done, and simply never encounter this problem at all. That alternative is exactly why floating-point non-associativity never surfaced as an issue in six straight lessons of real probability work — real trial counts, real tallies, and real exact-fraction probabilities never needed an inexact representation for computing, only occasionally for *reading*. The real cost of avoiding floating-point entirely, though: exact rational arithmetic gets slower and its numerators and denominators get larger the more operations accumulate, and some real quantities (most measured physical values, most `sqrt`s, most irrational constants) have no exact rational representation at all — floating-point exists precisely because avoiding it entirely isn't always an option, which is exactly why knowing its own real, specific limitations (starting with this one) matters.

### Run It

*(Both real checks above — the exact-integer case and the floating-point case — together constitute this Concept Unit's own complete Run It; nothing further needs running to establish its conclusion.)*

### Connection

A real, measured law violation now exists for a specific pair of numbers. The next problem is showing this isn't just a curiosity about two specific huge numbers — it has a genuine, practical consequence for how a sum gets computed at all.

---

## Concept Unit: Why It Matters — Grouping a Real Sum Two Ways

### The Problem

Concept Unit 2 found one specific triple of numbers where grouping changes the answer. A real, practical question follows directly: if a long list of numbers needs to be summed, does it actually matter whether that sum happens strictly left to right, one at a time, versus being split into chunks — summed independently, possibly even in parallel — and then combined? For exact numbers, Concept Unit 2 already answered this: no, it can't matter, ever. For floating-point numbers, is Concept Unit 2's own two-number example a fluke too small to matter in practice, or can it show up in an ordinary-looking list?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: two new top-level procedures.
- **Location** — nothing precedes them in this lesson yet; these are the first definitions this lesson makes.
- **Dependencies** — none beyond Guile's built-in list and arithmetic procedures.

### The New Code

```scheme
(define (sum-left-to-right lst)
  (let loop ((remaining lst) (total 0))
    (if (null? remaining)
        total
        (loop (cdr remaining) (+ total (car remaining))))))

(define (split-sum lst)
  (let ((n (length lst)))
    (if (<= n 1)
        (sum-left-to-right lst)
        (let ((half (quotient n 2)))
          (+ (split-sum (list-head lst half))
             (split-sum (list-tail lst half)))))))
```

### The Updated Project

Skipped — `sum-left-to-right` and `split-sum` are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside yet; Project Change already covers this case.

### Isolated Lab: None — Justified Skip

`sum-left-to-right` is a count-terminated (here, list-terminated) accumulator loop, identical in shape to dozens of procedures built since Lesson 162. `split-sum` reuses the divide-and-conquer pattern Lesson 79 and Lesson 158 already gave full treatment to, applied to summation instead of sorting. Neither introduces a new Scheme construct; this Concept Unit's own real content is what happens when these already-familiar shapes are applied specifically to test this lesson's own law, not a new piece of syntax.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (sum-left-to-right lst) ...)`** — `define` binds `sum-left-to-right` to a one-parameter procedure.
- **`(let loop ((remaining lst) (total 0)) ...)`** — a named `let`: `remaining` tracks how much of the list is still unprocessed, `total` accumulates the running sum.
- **`(if (null? remaining) total (loop (cdr remaining) (+ total (car remaining))))`** — the base case returns the final accumulated `total` once nothing remains; otherwise, `(car remaining)` reads the current number, `(+ total ...)` adds it into the running total, and `(cdr remaining)` advances to the rest of the list — the same accumulator-passing shape every summation this curriculum has built has used, restated here as the deliberate baseline this lesson's whole comparison is built against.
- **`(define (split-sum lst) ...)`** — `define` binds `split-sum` to a one-parameter procedure.
- **`(let ((n (length lst))) ...)`** — a plain `let`, one binding: `n`, the list's own length, needed to decide where its midpoint falls.
- **`(if (<= n 1) (sum-left-to-right lst) ...)`** — the base case: a list of zero or one elements has nothing left to meaningfully split, so it's summed directly (correctly handling both the empty list, `0`, and a single-element list, that one element).
- **`(let ((half (quotient n 2))) ...)`** — a plain `let`, one binding: `half`, the list's own midpoint index, computed by integer division.
- **`(+ (split-sum (list-head lst half)) (split-sum (list-tail lst half)))`** — `(list-head lst half)` reads off the first half of the list, `(list-tail lst half)` reads off the second half; `split-sum` calls *itself*, recursively, on each half independently — this is genuine divide-and-conquer, Lesson 79's own pattern, applied to summation — and the outer `+` combines the two half-sums into one final total, the one addition in this whole procedure whose grouping differs from `sum-left-to-right`'s own strictly-sequential shape.

### CS Lens

This is **divide-and-conquer summation**, and it is exactly what a real parallel reduction does mechanically: split the input into independent chunks, process each chunk on its own (here, sequentially, but in principle simultaneously, on separate hardware), and combine the partial results — correct only when the combining operation is genuinely associative.

Also recognized in: MapReduce and every big-data framework built on the same idea, splitting a massive dataset across many machines, reducing each piece independently, and combining partial reductions — a design that is only ever correct because the reduction operation is assumed associative, an assumption this lesson has just shown isn't automatic; multi-threaded sum or aggregate functions in any programming language's own standard library, which internally perform exactly this kind of split-then-combine; SIMD (single-instruction-multiple-data) vectorized addition, where a CPU adds several numbers' worth of a sum "at once" in a different grouping than a strictly sequential loop would; and database query engines that partition a large aggregate computation (a `SUM` or `AVG` over billions of rows) across multiple workers, exactly the scenario this Concept Unit's own `split-sum` is a minimal, honest model of.

### SE Lens

The design principle here is **parallelism's own correctness is inherited from an algebraic property, not granted for free**. `split-sum` isn't "obviously" the same as `sum-left-to-right` just because both compute "the sum" in some informal sense — it's *provably* the same, for exact numbers, specifically because `+` on exact numbers is associative, and *not* provably the same, in general, for floating-point numbers, because it isn't.

An alternative that was *not* chosen: assume any reduction that's "just addition" is automatically safe to parallelize, without checking what numeric type is actually flowing through it. That alternative is what most real code implicitly does, most of the time, and it's usually fine — the effect Concept Unit 2 demonstrated needs numbers of wildly different magnitudes to become large enough to notice, and most real sums don't have that shape. The real cost of never checking: the failure mode isn't a crash, or an obviously wrong answer — it's a small, silent numerical discrepancy between a sequential and a parallel version of the identical calculation, exactly the kind of bug that's brutal to track down precisely because both versions *look* correct and neither one is more "wrong" than the other in any way the code itself reveals.

### Run It

Exact integers first — a genuine control case:

```scheme
(define int-list (list 1 2 3 4 5 6 7 8))

(sum-left-to-right int-list)
;=> 36

(split-sum int-list)
;=> 36
```

`36` and `36` — identical, exactly as Concept Unit 2's own exact-arithmetic result predicts they have to be, for any list of exact numbers, any split point, always.

Now the same two procedures, on a floating-point list built the same deliberate way Concept Unit 2's own example was — large-magnitude values positioned to interact with small ones differently depending on grouping:

```scheme
(define float-list (list 1e20 1.0 1.0 1.0 -1e20 1.0 1.0 1.0))

(sum-left-to-right float-list)
;=> 3.0

(split-sum float-list)
;=> 0.0

(= (sum-left-to-right float-list) (split-sum float-list))
;=> #f
```

`3.0` against `0.0` — not a rounding error in the fifth decimal place, but two entirely different real numbers, from summing the exact same eight-element list two different, individually reasonable-looking ways. `sum-left-to-right` adds `1e20 + 1.0 + 1.0 + 1.0` first — each `1.0` genuinely lost to rounding against `1e20`'s own scale, so the running total stays at `1e20` through all three — then adds `-1e20`, cancelling back to `0.0`, and *then* adds the final three `1.0`s, each one now added against a `0`-scale total where they're no longer lost, landing on `3.0`. `split-sum` instead sums the first half (`1e20, 1.0, 1.0, 1.0`) to `1e20` and the second half (`-1e20, 1.0, 1.0, 1.0`) to `-1e20 + 3.0`, itself rounded back down to exactly `-1e20` (three `1.0`s, still too small to survive addition against `-1e20`'s own scale) — and adding those two half-sums, `1e20` and `-1e20`, gives exactly `0.0`, with all six of the small `1.0`s lost along the way, never once landing at a moment where the running total's own scale was small enough to preserve them.

### Connection

A genuinely different real total, from the same numbers, the same operation, only a different grouping — this curriculum's first real demonstration that "sum a list" isn't one single, unambiguous computation once floating-point is involved. The next problem is confirming this whole lesson's law isn't only ever about numbers at all.

---

## Concept Unit: The Same Law, a Different Operation

### The Problem

Every real example so far has been about `+`. Associativity, as a *law*, was stated abstractly in this lesson's own Header — `(op (op a b) c) = (op a (op b c))`, for *some* operation `op`, not specifically addition. Does that same law, checked the same way, hold for an operation that looks nothing like arithmetic at all — joining lists together?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — none — this Concept Unit tests `append`, an already-existing Guile procedure, directly.
- **Location** — not applicable.
- **Dependencies** — none beyond Guile's built-in list procedures.

### The New Code

None — this Concept Unit tests `append` directly, the same way Concept Units 1 and 2 tested `-` and `+`.

### The Updated Project

Not applicable.

### Isolated Lab: None — Justified Skip

Testing `append` for associativity is, mechanically, the exact same comparison this lesson has already performed twice — `(op (op a b) c)` against `(op a (op b c))` — with a different `op` and different values substituted in. No new Scheme construct is introduced; `equal?`, needed here in place of `=` because lists (unlike numbers) need structural comparison, is the only genuinely new element, and it's a single, self-explanatory accessor, not a construct warranting its own isolated demonstration.

### Run It

```scheme
(append (append (list 1 2) (list 3)) (list 4 5))
;=> (1 2 3 4 5)

(append (list 1 2) (append (list 3) (list 4 5)))
;=> (1 2 3 4 5)

(equal? (append (append (list 1 2) (list 3)) (list 4 5))
        (append (list 1 2) (append (list 3) (list 4 5))))
;=> #t
```

Identical results, confirmed with `equal?` since these are lists, not numbers — `append` genuinely is associative, for every real list, with no exception this curriculum has any reason to suspect, since `append` never rounds or approximates anything the way floating-point `+` does; joining lists together is exact, structural work, all the way through. Addition on exact numbers and list concatenation look, on the surface, like completely unrelated operations — one arithmetic, one structural — and yet both satisfy the *identical* algebraic law, checked the *identical* way. That shared shape, one law describing two superficially unrelated operations, is not a coincidence this lesson is equipped to explain yet — it's the exact question Lesson 172, Monoids, exists to answer.

### Connection

Three real operations, tested the same way, gave three different verdicts: subtraction fails plainly, exact addition holds provably, floating-point addition fails silently and dramatically, and list concatenation holds again — the same law, genuinely orthogonal to what the operation is even about. What's left is tracing one real computation through this lesson's own central discovery, and being honest about what a program actually loses when it assumes associativity without checking.

---

## Closing

### Connect the Pieces

One real list of numbers, moving through every piece built in this lesson, start to finish:

```scheme
float-list
;=> (1e20 1.0 1.0 1.0 -1e20 1.0 1.0 1.0)
```

Eight real floating-point numbers, deliberately shaped to expose a real algebraic law's own limits.

```scheme
(sum-left-to-right float-list)
;=> 3.0
```

One real, legitimate way of summing them — strictly in order, the way a simple loop naturally would.

```scheme
(split-sum float-list)
;=> 0.0
```

A second real, equally legitimate-looking way — divide, conquer, and combine, the exact shape a real parallel reduction takes — landing on a genuinely different real number, not a rounding-error's difference but a completely different value.

```scheme
(= (sum-left-to-right float-list) (split-sum float-list))
;=> #f
```

And the direct, unambiguous confirmation: for this real list, on this real operation, grouping is not a free choice — associativity, a law exact addition and list concatenation both satisfy provably, silently fails for floating-point addition, and only checking, the way this whole lesson (and Era VI before it) insists on, reveals which side of that line a given operation actually falls on.

### What Breaks Without This

`split-sum`'s own correctness — matching `sum-left-to-right`'s result exactly — was never guaranteed by the code itself; it was guaranteed by `+`'s own associativity, or not, depending entirely on what kind of numbers flow through it. Breaking the *assumption* that this doesn't matter, directly: try `split-sum` on a list of exact integers built to have the exact same "large, small, large, small" shape as `float-list`, to see whether the earlier `36`-and-`36` match was a fluke of small numbers rather than a real property of exactness itself.

```scheme
(define big-int-list (list 100000000000000000000 1 1 1 -100000000000000000000 1 1 1))

(sum-left-to-right big-int-list)
```

Run for real:

```
;; real output:
;; 6
```

And the same list, summed the divide-and-conquer way instead:

```scheme
(split-sum big-int-list)
```

Run for real:

```
;; real output:
;; 6
```

`6` and `6` — matching exactly, even at the identical astronomical scale that broke floating-point addition completely. And `6` is worth pausing on for a second reason, beyond just the match: `big-int-list` holds exactly six `1`s (three before the huge positive term flips to the huge negative one, three after), and the two astronomical terms cancel exactly — so `6` is not merely *consistent*, it's the actual, true, mathematically correct sum of this list, recovered by both groupings alike. `float-list`, the identically-shaped list from Concept Unit 3, never recovered that true answer either way: `sum-left-to-right` landed on `3.0`, `split-sum` landed on `0.0`, and neither matches the true value, `6.0`, that exact arithmetic finds without effort. This isn't a coincidence needing more digits to eventually break: exact-integer addition has no rounding step anywhere in its own definition, at any magnitude, so there is no mechanism, ever, by which grouping could change the result, or the result could drift from the true value — the "large, small, large, small" shape that exposed floating-point's own limitation is entirely irrelevant to an operation that never approximates anything in the first place. The lesson this contrast makes concrete: associativity's failure in this lesson was never about *big numbers* being inherently dangerous, and it wasn't only about two different groupings *disagreeing with each other* — both of floating-point's own answers were simply wrong, and exact arithmetic sidesteps the entire problem by construction, at any scale.

### Exercises

- Find a floating-point triple of your own — different numbers than `1e20`, `-1e20`, and `1.0` — that also violates associativity, and verify it for real with `=`. Try to find one using numbers of a more "ordinary," everyday magnitude, not astronomically large ones.
- Test `*` (multiplication) for associativity, both on exact numbers and on a floating-point triple designed the same deliberate way this lesson's `+` example was. Does multiplication's own behavior match addition's, or differ?
- `split-sum` always splits a list exactly in half. Modify it to split at a different, uneven point instead (say, one-quarter through the list rather than the midpoint), and check, for real, on `float-list`, whether *that* grouping also disagrees with `sum-left-to-right`, and whether it disagrees by the same amount `split-sum`'s own even split did.
- This lesson tested `append` for associativity but never tested it for *commutativity* — whether `(append a b)` equals `(append b a)`. Test that directly, for real, on two real, different lists, and explain in one sentence why the real result shouldn't be surprising.

### Definition of Done

- [ ] Every operation this lesson claims is or isn't associative — subtraction, exact addition, floating-point addition, list concatenation — has been checked with real code and real output, not asserted from memory.
- [ ] `sum-left-to-right` and `split-sum` are both defined, both actually run in Guile this session, on both an exact-integer list and a floating-point list, with real output pasted in for every claim.
- [ ] The exact-integer version of the "large, small, large, small" list has been checked for real, confirming the earlier floating-point failure was about representation, not magnitude.
- [ ] Every real associativity violation shown in this lesson has been traced back to a specific rounding step, not just observed as "the numbers came out different."
- [ ] `git commit` — a message explaining *why* this lesson opens Era VII the way it does: an algebraic law isn't a fact about an operation's name, it's a fact about an operation's real, checkable behavior, and the entire Era that follows is built on laws exactly this precise, tested exactly this directly.
