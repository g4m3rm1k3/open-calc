# Lesson 172: One Idea, Many Disguises — Monoids

**What you will build.** A name, and a real, reusable representation, for the exact pattern Lesson 170 and Lesson 171 have independently verified three separate times without ever naming it: a **monoid** — a binary operation, plus its own genuine two-sided identity, bundled together as one real value. Three real procedures: `make-monoid`, bundling an operation with its identity; `monoid-reduce`, Lesson 171's own `reduce` rewritten to take one bundled monoid instead of two separate arguments; and `product-monoid`, which builds a genuinely *new* monoid out of two existing ones, combining their results side by side. The transferable payoff: computing a dataset's sum and its count in a single pass, using one combined monoid built entirely from two simpler ones, rather than two separate passes over the same data.

**What you need to know first.** Lesson 169 (Why Algebra Matters to Programmers) and Lesson 170 (Associativity), both directly, for the first half of a monoid's own definition. Lesson 171 (Identity), directly and completely — this lesson's own `monoid-reduce` is Lesson 171's `reduce`, unchanged in its own logic, only restructured to take a bundled monoid instead of two loose arguments. Lesson 162 (Sampling) and Lesson 166 (Concentration Intuition) for the sample mean this lesson's own closing payoff computes, reused here as a genuinely practical destination rather than a new concept.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. Scheme's loop construct, with no separate `for` or `while` keyword.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call. This lesson reuses it, unchanged, inside `monoid-reduce`.
- **`if`** — a two-branch conditional: evaluates its test, then evaluates exactly one of its remaining sub-expressions.
- **`lambda`** — builds an anonymous procedure, created right where it's needed. This lesson uses it to build a genuinely new operation, a counting step, and to build `product-monoid`'s own combined operation, on the spot.
- **`map`** — a transformation procedure — applies a given procedure to every element of a list, returning a new list of the results. This lesson uses it to turn a plain list of numbers into a list of `(value, 1)` pairs, ready for a combined sum-and-count reduction.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction, never a rounded decimal. This lesson's own average, computed at the end, stays an exact fraction throughout, converted to a decimal only for reading.
- **Monoid** — a binary operation together with its own genuine two-sided identity element, treated as one combined, reusable unit — the precise name for a pattern this lesson's own Concept Unit 1 shows Lesson 169 through 171 already verified three separate times, for `+`, `append`, and `compose`, without ever bundling the two halves together or giving the pattern itself a name.
- **Product monoid** — a new monoid built from two existing monoids, operating on *pairs* of values: combining two pairs means combining their first halves with the first monoid's own operation, and their second halves with the second monoid's own operation, independently.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`make-monoid`**
  - *What it is:* a procedure this lesson derives in Concept Unit 1 — bundles a binary operation and its own identity element into one combined value.
  - *Implementation:* `(make-monoid op identity)` → a two-element list, `(list op identity)`.
  - *Its use:* the one, single representation every other procedure in this lesson builds on — a monoid, as a real, passable value, rather than two separate arguments that have to be kept in sync by hand.
- **`monoid-reduce`**
  - *What it is:* derived in Concept Unit 1 — Lesson 171's own `reduce`, restructured to take one bundled monoid instead of two loose arguments.
  - *Implementation:* `(monoid-reduce m lst)` → a single combined value, the same type `m`'s own identity and `lst`'s own elements share.
  - *Its use:* every real reduction in this lesson runs through this one procedure, regardless of which monoid it's handed.
- **`product-monoid`**
  - *What it is:* derived in Concept Unit 2 — builds a new monoid out of two existing ones, operating on pairs.
  - *Implementation:* `(product-monoid m1 m2)` → a new monoid (itself built with `make-monoid`), whose own values are two-element lists, one component from each input monoid's own domain.
  - *Its use:* the real mechanism behind this lesson's own closing payoff — computing two independent aggregates in a single pass, by combining two independent monoids into one.

*Everything else in the file, not this lesson's subject but still explained:*

- **`+`**
  - *What it is:* Scheme's addition procedure — an ordinary procedure, not special syntax.
  - *Implementation:* `(+ a b)` takes any number of numeric arguments and returns their sum.
  - *Its use:* the operation behind this lesson's own `sum-monoid`.
- **`/`**
  - *What it is:* Scheme's division procedure.
  - *Implementation:* `(/ a b)` returns an exact rational when both arguments are exact and don't divide evenly.
  - *Its use:* computes this lesson's own closing payoff, a real average, from a real sum and a real count.
- **`append`**
  - *What it is:* a procedure — joins two or more lists together into one new list.
  - *Implementation:* `(append lst1 lst2)` returns a fresh list holding every element of `lst1` followed by every element of `lst2`.
  - *Its use:* the operation behind this lesson's own `concat-monoid`.
- **`car`**
  - *What it is:* an accessor — returns the first element of a pair, and by extension a list's first element.
  - *Implementation:* `(car p)` returns the first component of pair `p`.
  - *Its use:* reads a monoid's own operation back out of its bundled representation, and reads the first component of a value pair.
- **`cdr`**
  - *What it is:* an accessor — returns everything in a pair after the first element; for a list, the rest of the list.
  - *Implementation:* `(cdr p)` returns the second component of pair `p`.
  - *Its use:* advances `monoid-reduce`'s own walk through a list one element at a time.
- **`cadr`**
  - *What it is:* an accessor — a shorthand for "the second element of a list," exactly equivalent to `(car (cdr lst))`.
  - *Implementation:* `(cadr lst)` returns the second element of `lst`.
  - *Its use:* reads a monoid's own identity back out of its bundled representation, and reads the second component of a value pair.
- **`null?`**
  - *What it is:* a predicate — reports whether a value is the empty list.
  - *Implementation:* `(null? x)` returns `#t` if `x` is `'()`.
  - *Its use:* `monoid-reduce`'s own base case, detecting an empty list to combine.
- **`list`**
  - *What it is:* a constructor — builds a list directly from its arguments.
  - *Implementation:* `(list v0 v1 ... vn)` returns a fresh list holding exactly those values, in that order.
  - *Its use:* builds every bundled monoid and every value pair this lesson works with.
- **`length`**
  - *What it is:* a measuring procedure — counts how many elements a list has.
  - *Implementation:* `(length lst)` returns an exact integer.
  - *Its use:* checked against this lesson's own one-pass count, to confirm the combined monoid's own counting component actually works.
- **`exact->inexact`**
  - *What it is:* a converter — turns an exact number into an ordinary inexact decimal, for reading.
  - *Implementation:* `(exact->inexact n)` returns the closest floating-point representation of `n`.
  - *Its use:* converts this lesson's own exact-fraction average into a readable decimal.
- **`display`**
  - *What it is:* an output procedure — writes a human-readable representation of a value to the terminal.
  - *Implementation:* `(display obj)` sends `obj`'s printed form to the current output port.
  - *Its use:* every real result in this lesson's Run It sections was produced with `display`.
- **`newline`**
  - *What it is:* an output procedure — writes a single line break.
  - *Implementation:* `(newline)` takes no required arguments.
  - *Its use:* keeps each displayed result on its own line.

---

## Concept Unit: Naming the Structure

### The Problem

Lesson 170 verified that `+`, `append`, and function composition are all associative. Lesson 171 verified that `+` and `append` both have a genuine two-sided identity — `0` and `'()`. Every one of those checks used two separate pieces, an operation and (sometimes) an identity, passed around independently, never bundled together as one real, single thing. Is there a name for "an associative operation plus its own genuine two-sided identity, treated as one unit" — and if there is, what does actually bundling the two together, in real code, buy over keeping them separate?

### Project Change

- **Reference Source** — No reference counterpart. This lesson names and bundles a pattern already verified piece by piece in Lessons 170 and 171, rather than porting a reference implementation.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree.
- **Change type** — add: two new top-level procedures.
- **Location** — nothing precedes them in this lesson yet; these are the first definitions this lesson makes.
- **Dependencies** — Lesson 171's own `reduce`, restated here as `monoid-reduce`, per this curriculum's Repetition Rule.

### The New Code

```scheme
(define (make-monoid op identity) (list op identity))
(define (monoid-op m) (car m))
(define (monoid-identity m) (cadr m))

(define (monoid-reduce m lst)
  (let loop ((remaining lst) (acc (monoid-identity m)))
    (if (null? remaining)
        acc
        (loop (cdr remaining) ((monoid-op m) acc (car remaining))))))
```

### The Updated Project

Skipped — `make-monoid`, `monoid-op`, `monoid-identity`, and `monoid-reduce` are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside yet; Project Change already covers this case.

### Isolated Lab: Bundling Two Related Values Into One

The core new idea here isn't `list`, `car`, or `cadr` themselves — every one of them already has full treatment — it's the *pattern* of bundling two separately-meaningful values into one combined value, specifically so they travel together instead of needing to be kept in sync by hand. Isolated, on a made-up example with nothing to do with monoids: bundling a person's name and age.

```scheme
(define (make-person name age) (list name age))
(define (person-name p) (car p))
(define (person-age p) (cadr p))

(define alice (make-person "Alice" 30))
```

Run for real:

```scheme
(person-name alice)
;=> "Alice"

(person-age alice)
;=> 30
```

`"Alice"` and `30`, read back out correctly — `alice` is one single value, a two-element list, and `person-name`/`person-age` are the two, real, separate ways of asking it a question, rather than the caller having to remember to pass a name and an age around as two loose, easily-mismatched arguments everywhere `alice` is used. `make-monoid`, `monoid-op`, and `monoid-identity` do the exact same bundling, for an operation and its identity instead of a name and an age.

### Discarding the Lab

`make-person`, `person-name`, `person-age`, and `alice` are discarded now. They never appear in the project again — `make-monoid` and its own two accessors are the real, permanent version of this same bundling idea.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (make-monoid op identity) (list op identity))`** — `define` binds `make-monoid` to a two-parameter procedure; `(list op identity)` bundles the two arguments into a single two-element list — the entire representation a monoid needs, per this lesson's own definition.
- **`(define (monoid-op m) (car m))`** — `define` binds `monoid-op` to a one-parameter procedure; `(car m)` reads the operation back out of a bundled monoid, since `op` was placed first when `make-monoid` built the list.
- **`(define (monoid-identity m) (cadr m))`** — `define` binds `monoid-identity` to a one-parameter procedure; `(cadr m)` reads the identity back out, since `identity` was placed second.
- **`(define (monoid-reduce m lst) ...)`** — `define` binds `monoid-reduce` to a two-parameter procedure: a bundled monoid, and a list to reduce.
- **`(let loop ((remaining lst) (acc (monoid-identity m))) ...)`** — a named `let`: `remaining` tracks the unprocessed tail of `lst`, `acc` accumulates the running combined result, starting from `(monoid-identity m)` — read out of the bundle itself, rather than Lesson 171's own `reduce` needing a separate `identity` argument passed alongside `op` every single call.
- **`(if (null? remaining) acc (loop (cdr remaining) ((monoid-op m) acc (car remaining))))`** — the base case returns `acc` once nothing remains, exactly as Lesson 171's `reduce` did; otherwise, `((monoid-op m) acc (car remaining))` reads the operation back out of `m` and applies it, combining the running result with the current element, and the loop advances.

### CS Lens

This is a **monoid**: a binary operation and its own genuine two-sided identity, bundled together as a single, reusable value, rather than two facts a caller has to remember to keep paired correctly on their own.

Also recognized in: object-oriented "value object" design, bundling related data (like a name and an age, this Concept Unit's own Isolated Lab) into one object specifically so related pieces can't drift out of sync; configuration objects in real software, bundling a setting's own value together with its default, rather than tracking the two separately; algebraic structures generally, where mathematics itself treats a set-plus-operation (a group, a ring, a monoid) as one combined object worth its own name, not merely "a set" and, separately, "some operation that happens to apply to it"; and dependency injection patterns, which bundle a service together with how to construct or reset it, for exactly the same "keep related things together" reason.

### SE Lens

The design principle here is **bundling data that must always travel together, so it's structurally impossible to separate them by mistake**. Lesson 171's own `reduce` took `op` and `identity` as two separate arguments — nothing in that design stopped a caller from accidentally passing `+` alongside `'()` (the wrong identity for `+`), a real, silent mistake `reduce`'s own code had no way to catch.

An alternative that was *not* chosen: keep `op` and `identity` as separate, individually-named top-level values (`sum-op`, `sum-identity`, `concat-op`, `concat-identity`, and so on), rather than bundling them into `make-monoid`. That alternative needs no new procedure at all — Lesson 171's own `reduce` already works exactly as written. The real cost of leaving them separate: every single call site has to correctly pair the right operation with the right identity, by convention, with nothing in the code itself enforcing that pairing — precisely the kind of unstated, unchecked assumption Lesson 168 spent an entire lesson warning against, applied here to a completely different kind of correctness.

### Run It

Two real monoids, both built from operations Lesson 169 and Lesson 170 already proved associative, and Lesson 171 already proved have a genuine two-sided identity:

```scheme
(define sum-monoid (make-monoid + 0))
(define concat-monoid (make-monoid append '()))

(monoid-reduce sum-monoid (list 1 2 3 4 5))
;=> 15

(monoid-reduce concat-monoid (list (list 1 2) (list 3) (list 4 5)))
;=> (1 2 3 4 5)
```

`15`, correctly summing five real numbers, and `(1 2 3 4 5)`, correctly concatenating three real lists — the *identical* procedure, `monoid-reduce`, producing both, differing only in which bundled monoid it was handed.

### Connection

A monoid now exists as one real, passable value, not two loose arguments. The next problem is what becomes possible once a monoid is a real value in its own right: building an entirely new one out of two existing ones.

---

## Concept Unit: Building a New Monoid From Two Old Ones

### The Problem

`sum-monoid` computes a total. A separate reduction, using a different operation entirely, could compute a count. Running both over the same list means walking that list twice — once for each. If a monoid is now a real, first-class value, can two monoids be *combined* into one new monoid, computing both aggregates in a single pass over the data, without writing a brand-new, hand-specialized "sum-and-count" procedure from scratch?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: one new top-level procedure.
- **Location** — after `monoid-reduce`; builds directly on `make-monoid` and `monoid-op`/`monoid-identity`.
- **Dependencies** — `make-monoid`, `monoid-op`, and `monoid-identity`, all defined in Concept Unit 1.

### The New Code

```scheme
(define (product-monoid m1 m2)
  (make-monoid
   (lambda (pair-a pair-b)
     (list ((monoid-op m1) (car pair-a) (car pair-b))
           ((monoid-op m2) (cadr pair-a) (cadr pair-b))))
   (list (monoid-identity m1) (monoid-identity m2))))
```

### The Updated Project

Skipped — `product-monoid` is a brand-new, freestanding top-level procedure with no existing enclosing structure to place it inside yet.

### Isolated Lab: Combining Two Values Component-Wise

The core new idea here is combining *pairs* of values, where each half of the pair gets combined by its own, independent operation. Isolated, on two made-up pairs, combining the first halves with `+` and the second halves with `append`, entirely separately:

```scheme
(define pair-a (list 3 (list 'x)))
(define pair-b (list 4 (list 'y)))

(list (+ (car pair-a) (car pair-b))
      (append (cadr pair-a) (cadr pair-b)))
```

Run for real:

```scheme
(list (+ (car pair-a) (car pair-b))
      (append (cadr pair-a) (cadr pair-b)))
;=> (7 (x y))
```

`(7 (x y))` — the first components, `3` and `4`, combined with `+` into `7`; the second components, `(x)` and `(y)`, combined with `append` into `(x y)` — two completely independent combinations, computed side by side, each using whichever operation actually belongs to that half of the pair. This is exactly what `product-monoid` automates: instead of writing this component-wise combination by hand for one specific pair of operations, it builds a *new*, general monoid that performs this same component-wise combination for whatever two monoids it's given.

### Discarding the Lab

`pair-a` and `pair-b` are discarded now. They never appear in the project again — `product-monoid`, defined above, performs this same component-wise combination generally, for any two real monoids, not just `+` and `append` specifically.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (product-monoid m1 m2) ...)`** — `define` binds `product-monoid` to a two-parameter procedure: two existing monoids to combine.
- **`(make-monoid ...)`** — the entire body is one call to `make-monoid`, building a genuinely new monoid out of a new operation and a new identity, both constructed from `m1` and `m2`.
- **`(lambda (pair-a pair-b) (list ((monoid-op m1) (car pair-a) (car pair-b)) ((monoid-op m2) (cadr pair-a) (cadr pair-b))))`** — the new monoid's own operation: given two pairs, `pair-a` and `pair-b`, `(monoid-op m1)` reads `m1`'s own operation and applies it to both pairs' first components, `(car pair-a)` and `(car pair-b)`; `(monoid-op m2)` reads `m2`'s own operation and applies it to both pairs' second components, `(cadr pair-a)` and `(cadr pair-b)`; `list` bundles the two independently-combined results back into one new pair.
- **`(list (monoid-identity m1) (monoid-identity m2))`** — the new monoid's own identity: a pair whose first component is `m1`'s own identity and whose second component is `m2`'s own identity — the value that, combined with anything using the operation just built, leaves that thing unchanged in *both* components at once, since each half only ever interacts with its own matching half.

### CS Lens

This is a **product monoid**: a new monoid, built from two existing ones, that combines values component-wise — each half of a pair evolving under its own independent operation, oblivious to the other half.

Also recognized in: multi-metric monitoring systems that track several independent running statistics (request count, error count, total latency) in one combined pass over incoming events, rather than one separate pass per metric; vector addition in physics and graphics, where combining two vectors really is combining each coordinate independently with the same underlying `+`; parallel MapReduce jobs computing several unrelated aggregates over the same dataset in one shared pass, exactly to avoid the cost of scanning the data once per aggregate; and, in category theory itself, the product of two monoids being a completely standard, named construction — this lesson's own `product-monoid` is a real, working instance of a genuinely general idea, not an ad hoc trick specific to sums and counts.

### SE Lens

The design principle here is **composing small, independently-verified pieces instead of writing one large, specialized one**. `product-monoid` never needed to know anything about sums, counts, or any specific operation at all — it only needed `m1` and `m2` to already be real, correct monoids, each independently checked by Lesson 169 through 171's own methods.

An alternative that was *not* chosen: write a dedicated `sum-and-count-monoid` procedure directly, hard-coding both operations and both identities into one purpose-built definition. That alternative would work, and for exactly two specific aggregates it's not obviously worse — arguably simpler to read, with nothing generic to trace through. The real cost of that alternative: a *third* desired aggregate (a running minimum, say) needs an entirely new, hand-written three-way version, sharing no code with the two-way one; `product-monoid`, by contrast, composes with itself — `(product-monoid (product-monoid m1 m2) m3)` builds a genuine three-way combination for free, reusing the exact same procedure, because a product monoid is itself just another monoid, valid input to `product-monoid` again.

### Run It

```scheme
(define count-monoid (make-monoid (lambda (a b) (+ a 1)) 0))
(define sum-count-monoid (product-monoid sum-monoid count-monoid))

(define (to-pairs lst) (map (lambda (x) (list x 1)) lst))

(monoid-reduce sum-count-monoid (to-pairs (list 3 1 4 1 5 9 2 6)))
;=> (31 8)
```

`(31 8)` — a real sum, `31`, and a real count, `8`, both computed in one single pass over one single list, using one single combined monoid built entirely from two separate, simpler ones — `count-monoid`'s own operation, `(lambda (a b) (+ a 1))`, ignores its second argument entirely and just counts, one `+1` per element, exactly the shape a running count needs.

### Connection

Two aggregates, computed together, in one pass, from two independently-verified monoids. What's left is putting that combined result to real, practical use, and being honest about what building a product monoid quietly assumed.

---

## Closing

### Connect the Pieces

One real dataset, moving through every piece built in this lesson, start to finish:

```scheme
(define data (list 3 1 4 1 5 9 2 6))

(monoid-reduce sum-count-monoid (to-pairs data))
;=> (31 8)
```

A real sum and a real count, computed together, in one pass, using `product-monoid`'s own combination of two separately-verified monoids from Concept Unit 1.

```scheme
(/ 31 8)
;=> 31/8

(exact->inexact (/ 31 8))
;=> 3.875
```

And the real, practical payoff: this dataset's own mean — the exact same **sample mean** Lesson 162 and Lesson 166 spent whole lessons deriving and concentrating around — recovered here from a sum and a count that never required two separate passes over the data to obtain.

```scheme
(length data)
;=> 8
```

A direct check, using an entirely different, already-trusted tool: `length`'s own real count, `8`, matching `sum-count-monoid`'s own second component exactly — real, independent confirmation the combined monoid's counting half works correctly, not just its summing half.

### What Breaks Without This

`product-monoid`'s own correctness depends on both `m1` and `m2` genuinely being real monoids — an associative operation, paired with its own real, checked, two-sided identity, exactly as Lesson 170 and Lesson 171 defined. Breaking that assumption on purpose: build a "monoid" around `max`, which Lesson 171 already proved has no real identity at all over the unbounded integers, and combine it into a product anyway.

```scheme
(define fake-max-monoid (make-monoid max -1000000))
(define sum-and-fake-max (product-monoid sum-monoid fake-max-monoid))

;; unlike sum-count-monoid, this pairing needs the *real* value in both
;; slots — max actually looks at its second argument, unlike count-monoid's
;; own operation, which ignored it; to-pairs's constant "1" would be wrong here
(define (to-same-pairs lst) (map (lambda (x) (list x x)) lst))

(monoid-reduce sum-and-fake-max (to-same-pairs (list -5000000 -3000000)))
```

Run for real:

```
;; real output:
;; (-8000000 -1000000)
```

The sum half, `-8000000`, is exactly right — `-5000000 + -3000000`. The second half, reported as `-1000000` — supposedly this list's own "maximum" — is completely wrong; the real maximum of `-5000000` and `-3000000` is `-3000000`, but `-1000000` was never a genuine identity for `max`, only a placeholder Lesson 171 already warned looks fine right up until it doesn't. `product-monoid`'s own code never checked whether `fake-max-monoid` was a real monoid at all — it has no way to, since checking would mean testing `(monoid-op m) (monoid-identity m) x)` against every possible `x`, an infinite check for an unbounded type. The failure isn't in `product-monoid`'s own logic, which combined exactly what it was given, correctly — it's in building a "monoid" around an operation that Lesson 171 already, explicitly proved doesn't have one, and trusting the bundle anyway because it *looked* like every other monoid this lesson built.

### Exercises

- Build a third simple monoid — a running minimum, using a genuinely bounded identity of your own choosing appropriate to your data's real range — and combine it with `sum-count-monoid` using `product-monoid` again, computing sum, count, *and* minimum in one single pass.
- `to-pairs` is needed because `sum-count-monoid` expects `(value, 1)` pairs, not bare numbers. Write a general `monoid-map-reduce` that takes a monoid, a "turn one element into that monoid's own value shape" function, and a list, folding the mapping step directly into the reduction — confirm it reproduces this lesson's own sum-count result without a separate `to-pairs` call.
- `product-monoid` combines exactly two monoids. Using it twice (`product-monoid` applied to the result of another `product-monoid` call), build a real three-way combination — sum, count, and one more real aggregate of your choosing — and verify all three components against three separate, independent single-purpose reductions.
- This lesson never checked, in code, whether a candidate monoid handed to `product-monoid` is real. Design (in prose; build it for real if you want to) a `verify-monoid` that checks associativity and both-sided identity empirically, the way Lesson 169 through 171 did by hand, and decide what `product-monoid` should do if it's handed one that fails.

### Definition of Done

- [ ] `make-monoid`, `monoid-op`, `monoid-identity`, `monoid-reduce`, and `product-monoid` are all defined, all actually run in Guile this session, with real output pasted in for every claim.
- [ ] `monoid-reduce` has been checked on at least two genuinely different real monoids — `sum-monoid` and `concat-monoid` — using the identical procedure both times.
- [ ] `product-monoid`'s own one-pass sum-and-count result has been checked against `length`'s own independent count, not just trusted.
- [ ] The fake-`max`-monoid failure has been caused on purpose, its real, silently wrong second component observed, and the reason — `product-monoid` can't verify a monoid it's handed, only combine it — has been articulated, not just observed.
- [ ] `git commit` — a message explaining *why* naming this pattern "monoid" and giving it a real, bundled representation was worth doing, three lessons after the underlying operations were already individually verified: `product-monoid` composes with itself for free, computing arbitrarily many aggregates in one pass, a genuine capability that two loose arguments, kept manually in sync, never had.
