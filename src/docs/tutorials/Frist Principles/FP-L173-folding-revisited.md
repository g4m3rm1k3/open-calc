# Lesson 173: The Fold Hiding Inside Everything — Folding Revisited

**What you will build.** `fold-right`, a genuinely different way of combining a list's elements than every reduction this curriculum has built since Lesson 162 — building up its own combined result from the *last* element backward, rather than accumulating from the first element forward. A real, dramatic case where it agrees with Lesson 171's own `reduce` (also called `fold-left`) exactly, and a real case where it doesn't. And two genuine reveals: that a list literal is already, secretly, the result of one specific fold — `(cons 1 (cons 2 '()))` really is `fold-right cons '()` applied to `1` and `2` — and that `map` and `filter`, treated as separate, independent tools everywhere else in this curriculum, are both really just `fold-right` wearing a different combining function. The transferable idea: fold isn't one tool among several this curriculum has built — once a list is understood as `cons`-and-`'()` all the way down, *every* one of this curriculum's own list-processing tools turns out to be the same one recursion, differently dressed.

**What you need to know first.** Lesson 171 (Identity), directly and completely — this lesson's own `fold-left` is Lesson 171's `reduce`, unchanged, given a new name specifically to set up a real contrast. Lesson 169 (Why Algebra Matters to Programmers) for associativity's own real behavior on `+` versus `-`, the exact contrast this lesson's own Concept Unit 1 reuses in a new context. `map`, used pervasively throughout this curriculum as an assumed primitive, and `cons`/`car`/`cdr`, this curriculum's own list-building and list-reading tools since early on.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. Scheme's loop construct, with no separate `for` or `while` keyword.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call. This lesson's own `fold-left` uses it, unchanged from Lesson 171's `reduce`; `fold-right`, this lesson's own new procedure, deliberately does *not* use this pattern, a real structural difference worth noticing.
- **`if`** — a two-branch conditional: evaluates its test, then evaluates exactly one of its remaining sub-expressions.
- **`cond`** — a multi-branch conditional, its clauses tried top to bottom, stopping at the first one whose test is true. This lesson reuses it for a genuine three-way choice inside a from-scratch filtering procedure: a list is empty, its first element passes a test, or it doesn't.
- **`else`** — `cond`'s reserved catch-all clause, always true, always tried last if nothing earlier matched. It exists to guarantee some clause always fires, so `cond` never silently produces nothing.
- **`lambda`** — builds an anonymous procedure, created right where it's needed. This lesson uses it to build the specific combining function that turns `fold-right` into `map`, and the different one that turns it into `filter`.
- **Fold-left** — combining a list's elements strictly from the first toward the last, carrying a running accumulated result forward at every step; Lesson 171's own `reduce`, under this lesson's own, more specific name.
- **Fold-right** — combining a list's elements starting from the *last* element and working backward, where the very first combination performed is between the list's last element and the identity, and every earlier element gets combined with *that* growing result.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`fold-left`**
  - *What it is:* a procedure this lesson derives in Concept Unit 1 — Lesson 171's own `reduce`, restated here under a name that makes its real direction explicit.
  - *Implementation:* `(fold-left op identity lst)` → a single combined value, built by accumulating left to right.
  - *Its use:* this lesson's own baseline — the direction every reduction this curriculum has built until now has quietly assumed was the only one.
- **`fold-right`**
  - *What it is:* derived in Concept Unit 1 — combines a list's elements starting from its last element and working backward.
  - *Implementation:* `(fold-right op identity lst)` → a single combined value, built by combining the current element with the *already-folded* result of everything after it.
  - *Its use:* the genuinely different direction this lesson exists to introduce, and the raw material Concept Unit 2 and 3 both build their own reveals from.

*Everything else in the file, not this lesson's subject but still explained:*

- **`+`, `-`, `*`**
  - *What it is:* three of Scheme's arithmetic procedures — ordinary procedures, not special syntax.
  - *Implementation:* `(+ a b)`, `(- a b)`, and `(* a b)` compute the obvious result on exact numbers.
  - *Its use:* `+` and `-` are this lesson's own test operations, one associative and one not; `*` builds this lesson's own `square` test function.
- **`modulo`**
  - *What it is:* a procedure — computes the remainder left over after dividing one integer by another.
  - *Implementation:* `(modulo a b)` returns an integer with the same sign as `b`, satisfying `a = b·q + (modulo a b)` for some integer `q`.
  - *Its use:* tests whether a number is even, by checking if dividing it by `2` leaves no remainder — the real filtering condition Concept Unit 3's own `filter-via-fold` is tested against.
- **`string-append`**
  - *What it is:* a procedure — joins two or more strings together into one new string.
  - *Implementation:* `(string-append s1 s2 ...)` returns a fresh string, `s1`'s own characters followed by `s2`'s, and so on.
  - *Its use:* this lesson's own Closing builds a real, order-sensitive log string with it, one step at a time.
- **`number->string`**
  - *What it is:* a converter — turns a number into its own textual representation.
  - *Implementation:* `(number->string n)` returns a string, like `"5"` for the number `5`; called on a non-number, it raises a real, immediate error.
  - *Its use:* turns a real step number into text before appending it into this lesson's own Closing log string — and, called on the wrong kind of value, produces this lesson's own real, verified failure.
- **`=`**
  - *What it is:* a numeric comparison procedure, returning `#t` or `#f`.
  - *Implementation:* `(= a b)` compares two numbers for exact equality.
  - *Its use:* checks a remainder against `0`, and checks two differently-computed totals against each other.
- **`equal?`**
  - *What it is:* a predicate — checks whether two values have the same structure and contents, not merely whether they're the identical object in memory.
  - *Implementation:* `(equal? a b)` returns `#t` for two lists with matching elements in matching positions.
  - *Its use:* checks whether two independently-built lists — one folded, one direct — actually contain the same real elements in the same real order.
- **`cons`**
  - *What it is:* a constructor — builds one new pair from two values; repeated `cons`ing builds a list.
  - *Implementation:* `(cons a b)` returns a fresh pair whose `car` is `a` and whose `cdr` is `b`.
  - *Its use:* this lesson's own central reveal in Concept Unit 2 — folding with `cons` itself is what a list literal secretly already is.
- **`car`**
  - *What it is:* an accessor — returns the first element of a pair, and by extension a list's first element.
  - *Implementation:* `(car p)` returns the first component of pair `p`.
  - *Its use:* reads the current element off the front of the list `fold-right` is walking.
- **`cdr`**
  - *What it is:* an accessor — returns everything in a pair after the first element; for a list, the rest of the list.
  - *Implementation:* `(cdr p)` returns the second component of pair `p`.
  - *Its use:* hands `fold-right` the rest of the list to recurse on.
- **`null?`**
  - *What it is:* a predicate — reports whether a value is the empty list.
  - *Implementation:* `(null? x)` returns `#t` if `x` is `'()`.
  - *Its use:* the base case both `fold-left` and `fold-right` stop at, and the base case a from-scratch filtering procedure stops at.
- **`map`**
  - *What it is:* a transformation procedure — applies a given procedure to every element of a list, returning a new list of the results.
  - *Implementation:* `(map proc list)` returns a new list, `(proc x)` for each `x` in `list`.
  - *Its use:* this lesson's own independent, already-trusted point of comparison — proving `map-via-fold` computes the identical thing Guile's own built-in `map` does.
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

## Concept Unit: Fold Right, Not Just Left

### The Problem

Every reduction this curriculum has built since Lesson 162 — `sum-left-to-right`, `reduce`, `monoid-reduce` — has combined a list's elements in exactly one direction: start from the identity, combine it with the first element, combine *that* with the second, and so on, forward through the list. Nothing about combining a list's elements actually requires that direction. What happens starting from the *last* element instead, working backward — and for an operation this curriculum has already proven isn't associative, does the direction actually matter to the final answer?

### Project Change

- **Reference Source** — No reference counterpart. This lesson derives its own contrast directly, the same way Lesson 169 through 172 did.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree.
- **Change type** — add: two new top-level procedures.
- **Location** — nothing precedes them in this lesson yet; these are the first definitions this lesson makes.
- **Dependencies** — none beyond ordinary recursion.

### The New Code

```scheme
(define (fold-left op identity lst)
  (let loop ((remaining lst) (acc identity))
    (if (null? remaining)
        acc
        (loop (cdr remaining) (op acc (car remaining))))))

(define (fold-right op identity lst)
  (if (null? lst)
      identity
      (op (car lst) (fold-right op identity (cdr lst)))))
```

### The Updated Project

Skipped — `fold-left` and `fold-right` are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside yet; Project Change already covers this case.

### Isolated Lab: None — Justified Skip

`fold-left` is exactly Lesson 171's own `reduce`, restated under a new name with no change to its own logic — no new construct at all. `fold-right`'s own recursive shape — a base case on the empty list, an operation applied to the current element and the recursive result of the rest — is the same ordinary recursion this curriculum has used since very early on, not a new Scheme construct. This Concept Unit's own real content is the *comparison* between the two, worked through directly in the Mechanical Walkthrough and Run It below.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (fold-left op identity lst) ...)`** through its own closing parenthesis — identical, line for line, to Lesson 171's `reduce`: a named `let` accumulates a running result forward, starting from `identity`, combining it with each element in turn from the front of the list.
- **`(define (fold-right op identity lst) ...)`** — `define` binds `fold-right` to a three-parameter procedure, matching `fold-left`'s own parameter shape exactly.
- **`(if (null? lst) identity (op (car lst) (fold-right op identity (cdr lst))))`** — the base case: an empty list folds to `identity` directly, exactly as `fold-left` does. The recursive case is where the real, structural difference lives: `(op (car lst) (fold-right op identity (cdr lst)))` computes `fold-right` on the *rest* of the list *first* — recursing all the way down to the empty list before any real combining happens — and only then applies `op` to the current element and whatever that recursive call returned. `fold-left` builds its own answer forward, carrying a growing accumulator through an ordinary loop; `fold-right` builds its own answer backward, with the *last* element combined with `identity` first, and every earlier element wrapping one more `op` application around that already-computed result.

### CS Lens

This is **fold-right**: combining a list's elements starting from the last and working backward, in contrast to **fold-left**'s forward accumulation — two genuinely different recursion shapes for the exact same general idea, "combine every element of a list."

Also recognized in: `foldr` and `foldl` as two distinct, separately-named standard functions in Haskell and many other functional languages, exactly because the direction genuinely matters, not just as a naming convenience; right-associative operators in a programming language's own grammar (like `::` in many languages, or exponentiation in mathematics, `2^(3^2)` meaning `2^(3^2) = 2^9`, not `(2^3)^2 = 64`), which are effectively parsed via a fold-right-shaped rule; recursive descent parsers building right-branching abstract syntax trees, structurally identical to `fold-right`'s own recursive shape; and reverse-order log processing, where the most recent entry needs to be considered "closest" to the combining logic, a real, natural fold-right situation.

### SE Lens

The design principle here is **the direction of accumulation is a real design choice, not an implementation detail**. `fold-left`, built as a named-let loop, can run in genuinely constant extra memory beyond the accumulator itself — Guile can optimize its own recursive call into a plain loop, since nothing is left to do after the recursive call returns. `fold-right`, as written, does real work *after* its own recursive call returns — the call to `op` — so each pending call has to stay on the call stack until the whole recursion bottoms out, a real, structural cost `fold-left` doesn't share.

An alternative that was *not* chosen: only ever build and use `fold-left`, since it's the more resource-efficient shape and, for an associative operation, gives the identical final value anyway. That alternative is exactly what this curriculum has done, silently, since Lesson 162 — and it's a perfectly reasonable default. The real cost of never having `fold-right` available at all: Concept Unit 2 and Concept Unit 3's own reveals — a list literal being a fold in disguise, and `map`/`filter` being folds in disguise — are only true of `fold-right`'s own specific shape, not `fold-left`'s; some real structural facts about how lists and list-processing functions actually work are only visible from this direction.

### Run It

An associative operation first — `+`, on the same five numbers, both directions:

```scheme
(define nums (list 1 2 3 4 5))

(fold-left + 0 nums)
;=> 15

(fold-right + 0 nums)
;=> 15
```

`15` and `15` — matching exactly, exactly as Lesson 169's own associativity proof for `+` predicts they have to, regardless of which direction the folding happens.

Now `-`, an operation Lesson 169 already proved is *not* associative, folded both directions on the same five numbers:

```scheme
(fold-left - 0 nums)
;=> -15

(fold-right - 0 nums)
;=> 3
```

`-15` and `3` — genuinely different real numbers, not a rounding discrepancy but two completely different answers. `fold-left` computes `((((0 - 1) - 2) - 3) - 4) - 5`, working out to `-15`. `fold-right` computes `1 - (2 - (3 - (4 - (5 - 0))))`, working out to `3` — `5 - 0 = 5`, then `4 - 5 = -1`, then `3 - (-1) = 4`, then `2 - 4 = -2`, then `1 - (-2) = 3`. Same five numbers, same operation, same identity — the *direction* alone changes the answer, because subtraction was never associative to begin with, and fold-left and fold-right are, structurally, two different specific groupings.

### Connection

Two real directions of folding now exist, agreeing when the operation is associative and genuinely disagreeing when it isn't. The next problem is a specific, surprising instance of `fold-right` this curriculum has actually been using, silently, since the very first list literal it ever wrote.

---

## Concept Unit: Every List Is Already a Fold

### The Problem

A list literal like `(list 1 2 3)` has always been treated, throughout this entire curriculum, as a given — a starting point, not something built out of anything more basic. But `cons` builds pairs, and a list *is* nested pairs: `(list 1 2 3)` really is `(cons 1 (cons 2 (cons 3 '())))`, just written with friendlier syntax. Given that, and given `fold-right` from Concept Unit 1, is there a real, precise sense in which a list literal already *is* the result of a fold — one this curriculum has been silently relying on since the very first time it ever wrote `(list ...)`?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — none — this Concept Unit tests `fold-right` directly, applying it with `cons` and `'()` as its own operation and identity.
- **Location** — not applicable.
- **Dependencies** — `fold-right`, defined in Concept Unit 1.

### The New Code

None — this Concept Unit applies `fold-right` directly, with `cons` as the operation and `'()` as the identity, rather than deriving a new procedure.

### The Updated Project

Not applicable.

### Isolated Lab: None — Justified Skip

This Concept Unit's own content is a single, direct application of `fold-right`, already fully derived in Concept Unit 1, to two already-fully-treated values, `cons` and `'()`. No new Scheme construct is introduced; the entire point is what this specific, already-available combination reveals, worked through directly in the Run It below.

### Run It

```scheme
(fold-right cons '() nums)
;=> (1 2 3 4 5)

(equal? (fold-right cons '() nums) nums)
;=> #t
```

`(1 2 3 4 5)` — identical, confirmed with `equal?`, to `nums` itself. Tracing why: `(fold-right cons '() nums)` computes `(cons 1 (fold-right cons '() (cdr nums)))`, and that inner call computes `(cons 2 (fold-right cons '() (cddr nums)))`, and so on, all the way down to `(fold-right cons '() '())`, which returns `'()` directly from `fold-right`'s own base case — unwinding back out, this builds exactly `(cons 1 (cons 2 (cons 3 (cons 4 (cons 5 '())))))`, which *is* `(list 1 2 3 4 5)`, by the ordinary meaning of what a list literal already is. `fold-right cons '()` doesn't just resemble building a list — applied to any list, it reconstructs that exact same list, because a list, structurally, already *is* the result of folding `cons` and `'()` over its own elements, right to left. Every list literal this entire curriculum has ever written was already, silently, an already-computed fold.

### CS Lens

This is a **catamorphism**, though this lesson won't need that formal name to use the idea directly: any recursively-defined structure (here, a list, built from `cons` and `'()`) can be "collapsed" or "consumed" by replacing its own constructors with some other operation and identity — replacing `cons` and `'()` with `cons` and `'()` again, unchanged, is simply the structure looking at itself.

Also recognized in: abstract syntax tree evaluators, which "fold" a parsed expression tree by replacing each syntax constructor with a real evaluation rule — arithmetic expression nodes replaced by real arithmetic, exactly the same shape as replacing `cons` with a different combining function; JSON or XML serializers, which fold a real in-memory data structure into a string by replacing each structural piece with its own textual representation; and, most directly, this lesson's own next Concept Unit — `map` and `filter`, both about to turn out to be exactly this same fold, with `cons` replaced by a slightly different combining function instead of left unchanged.

### SE Lens

The design principle here is **recognizing a structure's own constructors as the seed of every operation that can walk it**. Once a list is understood as literally built from two operations, `cons` and `'()`, any function that processes a list *has* to, at bottom, be replacing those same two operations with something else — there's no other way to walk a `cons`-built structure.

An alternative that was *not* chosen: treat lists as an opaque, built-in primitive, with `map`, `filter`, folds, and every other list operation each implemented as its own independent, unrelated piece of logic. That alternative is exactly how this curriculum has presented these tools until now, and it's not wrong, exactly — every one of them still works. The real cost of never making the `cons`/`fold-right` connection explicit: `map` and `filter` *look* like two separate, special-purpose tools, each needing its own separate implementation and its own separate mental model, rather than two small variations on one shared underlying idea — precisely the gap Concept Unit 3 closes.

### Connection

A list literal, revealed as an already-computed fold. The next problem is whether this curriculum's own other list tools — ones that have always looked completely different from folding — are secretly the same idea too.

---

## Concept Unit: Map and Filter Are Folds in Disguise

### The Problem

`map` transforms every element of a list. `filter` keeps only the elements that pass some test. Both have been used throughout this curriculum as though they were their own separate, primitive operations, with no obvious connection to folding at all. Given Concept Unit 2's own reveal — that a list literal is already `fold-right cons '()` — is there a real, precise sense in which `map` and `filter` are *also* just `fold-right`, with a different combining function substituted in place of plain `cons`?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: two new top-level procedures.
- **Location** — after `fold-right`; both build directly on it.
- **Dependencies** — `fold-right`, defined in Concept Unit 1.

### The New Code

```scheme
(define (map-via-fold f lst)
  (fold-right (lambda (x acc) (cons (f x) acc)) '() lst))

(define (filter-via-fold pred lst)
  (fold-right (lambda (x acc) (if (pred x) (cons x acc) acc)) '() lst))
```

### The Updated Project

Skipped — `map-via-fold` and `filter-via-fold` are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside yet.

### Isolated Lab: None — Justified Skip

Both procedures are single calls to `fold-right`, already fully derived in Concept Unit 1, with a small `lambda` supplying the one genuinely new idea each — worked through directly in the Mechanical Walkthrough below, rather than an isolated demonstration of an already-treated construct.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (map-via-fold f lst) (fold-right (lambda (x acc) (cons (f x) acc)) '() lst))`** — `define` binds `map-via-fold` to a two-parameter procedure. `(lambda (x acc) (cons (f x) acc))` is the combining function handed to `fold-right`, replacing plain `cons`: instead of `cons`ing the raw element `x` onto the accumulated result `acc` (Concept Unit 2's own reveal), it `cons`es `(f x)` — the element *after* being transformed by `f` — onto `acc` instead. `'()` stays the identity, unchanged. Every other structural piece is exactly `fold-right cons '()`, with one single substitution.
- **`(define (filter-via-fold pred lst) (fold-right (lambda (x acc) (if (pred x) (cons x acc) acc)) '() lst))`** — `define` binds `filter-via-fold` to a two-parameter procedure. `(lambda (x acc) (if (pred x) (cons x acc) acc))` is `fold-right`'s own combining function here: `(pred x)` tests whether the current element passes; if so, `(cons x acc)` includes it, exactly like plain `cons` would; if not, `acc` is returned completely unchanged, silently dropping `x` from the result. `'()` again stays the identity. `filter-via-fold` is `fold-right cons '()`, with the "always `cons`" step replaced by an "only `cons` if `pred` says so" step.

### CS Lens

This is `map` and `filter`, each revealed as `fold-right cons '()` with one small substitution — real, structural proof that "transform every element" and "keep only some elements" are not two independent ideas, but two small variations on the same underlying recursion over `cons` and `'()`.

Also recognized in: functional programming language design more broadly, where `map`, `filter`, and `fold` are frequently taught, and sometimes even *implemented in the language's own standard library*, in exactly this dependency order — fold as the one primitive, everything else built on top; database query planners that compile a chain of `SELECT`/`WHERE`/projection operations down into one single pass over the underlying data, precisely because each of those operations is, structurally, the same fold with a different combining step; and stream-processing frameworks that fuse a chain of `.map().filter().map()` calls into one combined traversal internally, a real performance optimization only possible because all three really are instances of one shared shape.

### SE Lens

The design principle here is **implementing many specific tools on top of one general, well-verified primitive**, rather than writing each one from scratch as its own independent piece of logic. `map-via-fold` and `filter-via-fold` share every structural guarantee `fold-right` itself already has — correct behavior on the empty list, for instance — without either one needing to re-derive or re-verify that guarantee separately.

An alternative that was *not* chosen: keep `map` and `filter` as Guile's own separate built-in primitives, with no code in this curriculum ever showing they reduce to fold at all. That alternative is exactly the state of affairs every earlier lesson in this curriculum has quietly accepted — and it's not wrong; Guile's own real `map` is likely more efficient than `map-via-fold`'s own extra layer of `lambda` and `fold-right` indirection. The real value gained by building the fold-based versions anyway, even knowing they're not the ones this curriculum will keep using going forward: understanding *why* `map` and `filter` behave the way they do — correctly handling an empty list, correctly preserving order — stops being "because that's how they're defined" and becomes "because that's what `fold-right cons '()`, with one substitution, structurally has to do."

### Run It

```scheme
(define (square x) (* x x))

(map-via-fold square nums)
;=> (1 4 9 16 25)

(map square nums)
;=> (1 4 9 16 25)

(equal? (map-via-fold square nums) (map square nums))
;=> #t
```

Identical results, confirmed with `equal?` — `map-via-fold`, built entirely from `fold-right`, reproduces Guile's own built-in `map` exactly, on a real transformation.

```scheme
(define (even-num? x) (= (modulo x 2) 0))

(filter-via-fold even-num? nums)
;=> (2 4)
```

`(2 4)` — the two real even numbers in `nums`, in their original order, correctly kept while `1`, `3`, and `5` were correctly dropped. Checked against a completely independent, from-scratch filtering procedure that never calls `fold-right` at all:

```scheme
(define (direct-filter-even lst)
  (cond
    ((null? lst) '())
    ((even-num? (car lst)) (cons (car lst) (direct-filter-even (cdr lst))))
    (else (direct-filter-even (cdr lst)))))

(direct-filter-even nums)
;=> (2 4)

(equal? (filter-via-fold even-num? nums) (direct-filter-even nums))
;=> #t
```

Matching exactly — two completely different-looking implementations, one built by substituting into `fold-right`, one written as its own direct recursion, computing the identical real result.

### Connection

Three tools this curriculum has used since early on — list literals themselves, `map`, and `filter` — have each, in turn, been shown to be the same one fold, wearing different combining functions. What's left is tracing one real value through this whole reveal, and being honest about the one place this lesson's own elegant unification has a real, structural limit.

---

## Closing

### Connect the Pieces

One real list, moving through every piece built in this lesson, start to finish:

```scheme
nums
;=> (1 2 3 4 5)
```

Five real numbers — themselves, per Concept Unit 2, already the result of `(fold-right cons '() nums)`, applied to this exact same list.

```scheme
(fold-right + 0 nums)
;=> 15
```

The same list, folded rightward with `+` — matching `fold-left`'s own answer, since `+` is associative, per Lesson 169.

```scheme
(map-via-fold square nums)
;=> (1 4 9 16 25)
```

The same list, transformed — `fold-right cons '()`, with `cons` replaced by "`cons` the squared value instead."

```scheme
(filter-via-fold even-num? nums)
;=> (2 4)
```

And the same list, filtered — `fold-right cons '()` again, this time with `cons` replaced by "only `cons` if this element is even." One structure, `cons`-and-`'()`, one recursion, `fold-right`, and every one of this curriculum's own core list tools turns out to be a small variation on exactly that.

### What Breaks Without This

`fold-left` and `fold-right`, as this lesson defined them, don't just differ in direction — they differ in the *argument order* their own combining function is called with. `fold-left` calls `(op acc element)` — the running result first, the current element second. `fold-right` calls `(op element acc)` — the current element first, the running result second. Breaking the assumption that this doesn't matter, directly: build a real combining function specifically for `fold-left`'s own convention, and hand it to `fold-right` unchanged, on the same list.

```scheme
(define (log-step acc step)
  (string-append acc " -> " (number->string step)))

(fold-left log-step "start" (list 1 2 3 4 5))
```

Run for real:

```
;; real output:
;; "start -> 1 -> 2 -> 3 -> 4 -> 5"
```

Exactly as intended: `log-step` expects its first argument to be the accumulated string so far and its second to be the current number, and `fold-left` calls it that way every time. Now the identical `log-step`, unchanged, handed to `fold-right` instead:

```scheme
(fold-right log-step "start" (list 1 2 3 4 5))
```

Run for real:

```
;; real output:
;; ERROR: In procedure number->string: Wrong type argument in position 1: "start"
```

A real, immediate type error, not a silently wrong answer this time. `fold-right` calls `(op (car lst) (fold-right op identity (cdr lst)))` — the current *element* first, the recursive *result* second — so at the innermost real call, it invokes `(log-step 5 "start")`: `acc` is bound to `5`, `step` is bound to `"start"`, backwards from what `log-step` was written expecting. `(number->string step)` then tries to convert `"start"`, a string, into a number-formatted string, and Guile's own `number->string` refuses outright. This is precisely why Concept Unit 3's own `map-via-fold` and `filter-via-fold` wrote their combining functions as `(lambda (x acc) ...)`, matching `fold-right`'s own real calling convention exactly, rather than reusing a function written for `fold-left`'s opposite order — the unification this lesson found (`map` and `filter` as `fold-right cons '()`, with a substitution) is only real and correct because each combining function was written for the specific fold it was actually handed to.

### Exercises

- Fix `log-step` so it works correctly with `fold-right` instead of `fold-left` — swapping its own two parameter names in the right way — and confirm, for real, what order the resulting log string comes out in this time, and why that order makes sense given `fold-right`'s own right-to-left direction.
- `filter-via-fold`'s own combining function checks `pred` and either keeps or drops an element. Write a `count-via-fold`, using `fold-right` with yet another substituted combining function, that counts how many elements pass a given predicate without building a new list at all.
- Concept Unit 2 showed `fold-right cons '()` reconstructs a list exactly. Predict, before running it, what `(fold-left cons '() nums)` produces instead — it will *not* be `nums` — and then verify your prediction for real.
- This lesson built `map-via-fold` and `filter-via-fold` on top of `fold-right` specifically. Investigate, for real, whether `map` and `filter` could instead be built on top of `fold-left`, and if so, what the combining function would need to look like differently to make that work.

### Definition of Done

- [ ] `fold-left` and `fold-right` are both defined, both actually run in Guile this session, on both an associative and a non-associative real operation, with real output pasted in for every claim.
- [ ] The `fold-right cons '()` reveal has been run for real and checked with `equal?` against the original list, not just asserted.
- [ ] `map-via-fold` and `filter-via-fold` have both been checked against an independent, already-trusted comparison — Guile's own `map`, and a from-scratch direct filter — not trusted from their own definitions alone.
- [ ] The argument-order failure has been caused on purpose, its real type error observed, and the reason — `fold-left` and `fold-right` call their own combining function with the arguments in opposite order, not just processing the list in opposite directions — has been articulated, not just observed.
- [ ] `git commit` — a message explaining *why* this lesson bothered revisiting fold at all, three lessons after Lesson 171 already built `reduce`: fold-left and fold-right are genuinely different tools, not two names for the same one, and the second one is what reveals list literals, `map`, and `filter` as the same underlying structure — an insight fold-left alone could never have shown.
