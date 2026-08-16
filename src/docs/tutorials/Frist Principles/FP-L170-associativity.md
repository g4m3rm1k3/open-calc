# Lesson 170: One Law, Any Shape — Associativity

**What you will build.** Proof that associativity's own power goes well beyond "addition doesn't care about parentheses": `compose`, showing the *same* law holds for combining functions themselves, not just numbers or lists; `tree-sum`, a genuinely different way of grouping a reduction — pairing neighbors, then pairing the results, again and again — rather than Lesson 169's own single left-half/right-half split; and `prefix-sums`/`range-sum`, a real, practical structure that only works *because* addition is associative, answering "what's the sum of this whole range" in constant time, no matter how large the range is. The transferable idea: Lesson 169 asked whether a specific operation obeys associativity at all; this lesson asks what becomes *possible*, concretely, once an operation provably does — building a tree from it, and building a genuinely faster tool on top of that tree.

**What you need to know first.** Lesson 169 (Why Algebra Matters to Programmers), directly and completely — this lesson assumes associativity's own definition, `(op (op a b) c) = (op a (op b c))`, and Lesson 169's own real proof that exact addition satisfies it, are already established; nothing here re-derives them. Lesson 79 (Merge Sort) for the divide-and-conquer shape this lesson's own combination tree reuses. Lambda and higher-order procedures, used pervasively since early in this curriculum, for treating a function as an ordinary value that can itself be combined with another.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. Scheme's loop construct, with no separate `for` or `while` keyword.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call. This lesson reuses it for `prefix-sums`' own running total.
- **`cond`** — a multi-branch conditional, its clauses tried top to bottom, stopping at the first one whose test is true. This lesson reuses it for a genuinely three-way choice: a list is empty, a list has exactly one leftover element, or a list has at least a pair left to combine.
- **`else`** — `cond`'s reserved catch-all clause, always true, always tried last if nothing earlier matched. It exists to guarantee some clause always fires, so `cond` never silently produces nothing.
- **`lambda`** — builds an anonymous procedure, created right where it's needed. This lesson's own `compose` returns one directly, rather than passing one to something else.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction, never a rounded decimal. Every number in this lesson stays exact throughout, deliberately avoiding Lesson 169's own floating-point complications to isolate this lesson's own, different point.
- **Function composition** — combining two functions into one new function that applies the second, then the first, to whatever input it's given: `(compose f g)` applied to `x` means `f(g(x))`. A **binary operation**, in Lesson 169's own sense, except the things being combined are procedures, not numbers or lists.
- **Combination tree** — the general shape any repeated application of an associative binary operation can take: not a single fixed grouping, but any tree of pairings whatsoever, all provably giving the identical result.
- **Prefix computation** — precomputing, once, the combined result of every prefix of a list (the first `0` elements, the first `1`, the first `2`, and so on), so that the combined result of any *range* within the list can be recovered later without recombining that range from scratch.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`compose`**
  - *What it is:* a procedure this lesson derives in Concept Unit 1 — combines two functions into one, applying the second before the first.
  - *Implementation:* `(compose f g)` → a new, one-argument procedure; `((compose f g) x)` computes `(f (g x))`.
  - *Its use:* the first real binary operation this curriculum has tested for associativity whose own inputs and output are all procedures, not data.
- **`tree-sum`**
  - *What it is:* derived in Concept Unit 2 — sums a list by repeatedly pairing up neighboring elements and combining each pair, rather than strictly left to right.
  - *Implementation:* `(tree-sum lst)` → a number, computed via a genuinely different grouping than Lesson 169's `sum-left-to-right`.
  - *Its use:* real, concrete proof that associativity licenses *any* grouping shape, not just the two specific ones ("strictly sequential" and "one even split") Lesson 169 happened to compare.
- **`prefix-sums`**
  - *What it is:* derived in Concept Unit 3 — computes, once, the running total through every position of a list.
  - *Implementation:* `(prefix-sums lst)` → a list one element longer than `lst`, its `i`-th entry the sum of `lst`'s own first `i` elements.
  - *Its use:* the one-time precomputation this lesson's whole range-query payoff is built on.
- **`range-sum`**
  - *What it is:* derived in Concept Unit 3 — answers "what's the sum of the elements from position `i` up to (not including) position `j`," using only `prefix-sums`' own precomputed result.
  - *Implementation:* `(range-sum prefixes i j)` → a number, computed with a single subtraction.
  - *Its use:* the real, practical payoff this entire lesson has been building toward — a genuinely faster way to answer a real, recurring question.

*Everything else in the file, not this lesson's subject but still explained:*

- **`+`, `-`, `*`, `max`**
  - *What it is:* four of Scheme's arithmetic procedures — ordinary procedures, not special syntax.
  - *Implementation:* `(+ a b)`, `(- a b)`, and `(* a b)` compute the obvious result on exact numbers, staying exact throughout; `(max a b ...)` returns the largest of its arguments.
  - *Its use:* `+` is the operation every real procedure in this lesson combines values with; `-` powers `range-sum`'s own single, constant-time subtraction; `*` builds a couple of this lesson's own test functions; `max`, used only in this lesson's own Closing, provides a real, deliberate contrast to addition.
- **`=`**
  - *What it is:* a numeric comparison procedure, returning `#t` or `#f`.
  - *Implementation:* `(= a b)` compares two numbers for exact equality.
  - *Its use:* directly checks whether two differently-grouped computations produced the identical result.
- **`car`**
  - *What it is:* an accessor — returns the first element of a pair, and by extension a list's first element.
  - *Implementation:* `(car p)` returns the first component of pair `p`.
  - *Its use:* reads the current number off the front of a list being walked or paired up.
- **`cdr`**
  - *What it is:* an accessor — returns everything in a pair after the first element; for a list, the rest of the list.
  - *Implementation:* `(cdr p)` returns the second component of pair `p`.
  - *Its use:* advances a walk through a list one element at a time.
- **`cadr`**
  - *What it is:* an accessor — a shorthand for "the second element of a list," exactly equivalent to `(car (cdr lst))`.
  - *Implementation:* `(cadr lst)` returns the second element of `lst`.
  - *Its use:* reads a list's second element when pairing up its first two elements together.
- **`cddr`**
  - *What it is:* an accessor — a shorthand for "everything after the first two elements of a list," exactly equivalent to `(cdr (cdr lst))`.
  - *Implementation:* `(cddr lst)` returns `lst` with its first two elements removed.
  - *Its use:* advances past a just-paired-up pair of elements, moving on to whatever comes after both of them.
- **`null?`**
  - *What it is:* a predicate — reports whether a value is the empty list.
  - *Implementation:* `(null? x)` returns `#t` if `x` is `'()`.
  - *Its use:* detects an empty list, and (paired with `cdr`) detects a list with exactly one element left.
- **`cons`**
  - *What it is:* a constructor — builds one new pair from two values; repeated `cons`ing builds a list.
  - *Implementation:* `(cons a b)` returns a fresh pair whose `car` is `a` and whose `cdr` is `b`.
  - *Its use:* builds up both a list of paired sums and a list of running prefix totals, one new front element at a time.
- **`reverse`**
  - *What it is:* a converter — builds a new list holding the same elements as a given list, but in the opposite order.
  - *Implementation:* `(reverse lst)` returns a fresh list; `lst` itself is untouched.
  - *Its use:* `prefix-sums` builds its own result backwards, via `cons`, and `reverse`s it once at the end.
- **`list-ref`**
  - *What it is:* an accessor — reads the value at a given position in a list.
  - *Implementation:* `(list-ref lst i)` walks `lst` forward `i` times and returns what's there.
  - *Its use:* `range-sum` reads two specific precomputed prefix totals out of `prefixes` by their own position.
- **`list`**
  - *What it is:* a constructor — builds a list directly from its arguments.
  - *Implementation:* `(list v0 v1 ... vn)` returns a fresh list holding exactly those values, in that order.
  - *Its use:* builds every real number list this lesson tests, and `prefix-sums`' own starting one-element result, `(list 0)`.
- **`display`**
  - *What it is:* an output procedure — writes a human-readable representation of a value to the terminal.
  - *Implementation:* `(display obj)` sends `obj`'s printed form to the current output port.
  - *Its use:* every real result in this lesson's Run It sections was produced with `display`.
- **`newline`**
  - *What it is:* an output procedure — writes a single line break.
  - *Implementation:* `(newline)` takes no required arguments.
  - *Its use:* keeps each displayed result on its own line.

---

## Concept Unit: Associativity Beyond Numbers — Function Composition

### The Problem

Lesson 169 tested associativity on numbers and on lists — both, in their own way, *data*. Associativity's own definition, though, never mentioned numbers or lists specifically: `(op (op a b) c) = (op a (op b c))` is a claim about any binary operation, on any kind of value at all. Functions themselves can be combined — apply one, then feed its result into another — so does *that* combination, function composition, obey the same law?

### Project Change

- **Reference Source** — No reference counterpart. This lesson derives its own examples from first principles, the same way Lesson 169 did.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree.
- **Change type** — add: one new top-level procedure.
- **Location** — nothing precedes it in this lesson yet; this is the first definition this lesson makes.
- **Dependencies** — none beyond ordinary procedure calls.

### The New Code

```scheme
(define (compose f g)
  (lambda (x) (f (g x))))
```

### The Updated Project

Skipped — `compose` is a brand-new, freestanding top-level procedure with no existing enclosing structure to place it inside yet; Project Change already covers this case.

### Isolated Lab: Combining Two Functions, Concretely

The core new idea here is treating a *function* as a value two other functions can be combined around, rather than a number or a list. Isolated, combining a function that doubles a number with one that adds one to it:

```scheme
(define (double x) (* x 2))
(define (add-one x) (+ x 1))
(define double-then-nothing (compose double add-one))
```

Run for real:

```scheme
(double-then-nothing 5)
;=> 12
```

`12` — `(compose double add-one)` applied to `5` computes `add-one` first (`5 + 1 = 6`), then `double` on *that* result (`6 × 2 = 12`), exactly matching `compose`'s own definition: apply the second argument first, then the first. This confirms `compose` genuinely builds a new, callable function out of two others — the raw material Concept Unit 1's own real test needs three of, combined two different ways.

### Discarding the Lab

`double`, `add-one`, and `double-then-nothing` are discarded now — this specific pair is never reused. `compose`, defined above, is the real, permanent version of this same idea, ready to be tested for associativity with three functions instead of two.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (compose f g) (lambda (x) (f (g x))))`** — `define` binds `compose` to a two-parameter procedure, `f` and `g`, both expected to be one-argument functions themselves. `(lambda (x) (f (g x)))` is the entire body: rather than computing a number or a list directly, `compose` *returns a new function* — one that, whenever it's eventually called with some `x`, first calls `(g x)`, then passes that result into `f`. Nothing inside this `lambda` runs the moment `compose` is called; it only runs later, whenever the function `compose` returns is itself finally applied to some real argument.

### CS Lens

This is **function composition** treated as a genuine **binary operation** — its own two inputs and its own output are all functions, not the ordinary data every earlier binary operation in this curriculum combined.

Also recognized in: Unix pipelines, where `cmd1 | cmd2 | cmd3` composes three separate programs into one combined data transformation, and grouping those pipes differently never changes the final output; mathematical function notation itself, `(f ∘ g)(x) = f(g(x))`, the exact notation `compose` implements directly; middleware chains in web frameworks, where each middleware function wraps the next, and the *order* they're chained in matters (composition isn't commutative) even though *how* they're grouped doesn't (composition is associative); and UNIX-style shell script step chaining more generally, where a multi-step build or deploy process is really one large composed function, built from smaller ones.

### SE Lens

The design principle here is **treating an operation's own structure as more fundamental than what it operates on**. Every earlier lesson's associativity test in this curriculum operated on data — numbers, lists; `compose` proves the exact same law-checking discipline applies just as well to functions, because Scheme treats functions as ordinary, first-class values, not a separate category with its own rules.

An alternative that was *not* chosen: treat "combining functions" and "combining data" as fundamentally different kinds of problems, needing separate reasoning each time. That alternative feels natural, since a function and a number don't *look* alike — but it costs a real, missed generalization: recognizing that both are instances of the same abstract shape, a binary operation obeying (or not obeying) associativity, is exactly what will let Lesson 172 (Monoids) unify addition, list concatenation, and function composition under one single idea, rather than treating each as its own unrelated special case.

### Run It

Three real functions, combined two different ways:

```scheme
(define (inc x) (+ x 1))
(define (square x) (* x x))

(define left-grouped (compose (compose double inc) square))
(define right-grouped (compose double (compose inc square)))

(left-grouped 3)
;=> 20

(right-grouped 3)
;=> 20

(left-grouped 5)
;=> 52

(right-grouped 5)
;=> 52

(= (left-grouped 3) (right-grouped 3))
;=> #t
```

`20` and `20`, then `52` and `52` — genuinely different real inputs, both groupings agreeing every time. `(compose (compose double inc) square)` applied to `3` computes `square(3) = 9` first, then `(compose double inc)` on `9` — `inc(9) = 10`, then `double(10) = 20`. `(compose double (compose inc square))` applied to `3` instead computes `(compose inc square)` on `3` first — `square(3) = 9`, then `inc(9) = 10` — and then `double` on *that*, `double(10) = 20`. Same three functions, same final answer, regardless of which pair gets composed first — function composition genuinely is associative.

### Connection

Associativity now has a second, genuinely different kind of confirmation — not just on numbers, but on functions themselves. The next problem is what this law actually *licenses*, beyond just "left-to-right or one even split are both fine": if grouping truly never matters, how many different groupings actually exist, and does trying a completely different one still work?

---

## Concept Unit: Any Grouping, Not Just Two — Building a Combination Tree

### The Problem

Lesson 169 compared exactly two groupings of a sum: strictly left-to-right, and one even split into two halves. Associativity's own law, though, says *every* possible grouping gives the same answer — not just those two. A genuinely different shape: pair up neighboring elements first (position `0` with position `1`, position `2` with position `3`, and so on), then pair up *those* results, repeating until only one value remains — a **combination tree**, branching by twos at every level rather than splitting the whole list in half just once. Does this genuinely different shape actually produce the same answer too?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: two new top-level procedures.
- **Location** — after `compose`; independent of it.
- **Dependencies** — none beyond Guile's built-in list procedures.

### The New Code

```scheme
(define (pair-up lst)
  (cond
    ((null? lst) '())
    ((null? (cdr lst)) (list (car lst)))
    (else (cons (+ (car lst) (cadr lst)) (pair-up (cddr lst))))))

(define (tree-sum lst)
  (if (null? (cdr lst))
      (car lst)
      (tree-sum (pair-up lst))))
```

### The Updated Project

Skipped — `pair-up` and `tree-sum` are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside yet.

### Isolated Lab: None — Justified Skip

`pair-up` and `tree-sum` are built entirely from `cond`, `null?`, `car`, `cdr`, `cadr`, `cddr`, `cons`, and recursion — every one of them already fully treated, either earlier in this lesson or in prior ones. What's new here is the *shape* of the recursion — repeatedly halving a list's own length by combining neighbors, rather than any new Scheme construct — worked through directly in the Mechanical Walkthrough and Run It below.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (pair-up lst) ...)`** — `define` binds `pair-up` to a one-parameter procedure: given a list, it returns a new, roughly-half-as-long list of combined neighbor pairs.
- **`(cond ((null? lst) '()) ((null? (cdr lst)) (list (car lst))) (else ...))`** — a three-way `cond`, needed because there are genuinely three distinct situations: the list is already empty, the list has exactly one element left over with no partner to pair with, or the list has at least two elements to combine.
- **`((null? lst) '())`** — the empty-list case: nothing to pair, so the result is the empty list too.
- **`((null? (cdr lst)) (list (car lst)))`** — the one-leftover case: `(cdr lst)` being empty means `lst` has exactly one element; that element has no partner, so it passes through to the next round unpaired, wrapped in its own single-element list.
- **`(else (cons (+ (car lst) (cadr lst)) (pair-up (cddr lst))))`** — the general case: `(car lst)` and `(cadr lst)` are the first two elements; `(+ ...)` combines them into one value; `(cons ... (pair-up (cddr lst)))` places that combined value at the front of the result, and `pair-up` recurses on `(cddr lst)` — everything *after* the pair just consumed — to handle the rest.
- **`(define (tree-sum lst) ...)`** — `define` binds `tree-sum` to a one-parameter procedure.
- **`(if (null? (cdr lst)) (car lst) (tree-sum (pair-up lst)))`** — the base case: once a list is down to exactly one element (`(cdr lst)` is empty), that element *is* the final combined total; otherwise, `(pair-up lst)` combines every neighboring pair once, producing a shorter list, and `tree-sum` recurses on *that* shorter list — each recursive call operating on a list roughly half the length of the one before it, the real, concrete shape of a combination tree, one level at a time.

### CS Lens

This is a **combination tree**: repeatedly pairing and combining neighbors until one value remains, the general shape any associative reduction can safely take, not merely "sequential" or "one even split."

Also recognized in: parallel prefix / scan algorithms, which build exactly this kind of pairwise tree to combine large arrays efficiently across many processors at once; tournament brackets, where competitors are paired up round by round until one champion remains — structurally identical to `tree-sum`'s own shape, with "combine" standing in for "the winner advances"; segment trees, a real data structure (previewed further in Concept Unit 3) built by precomputing exactly this kind of pairwise combination tree once, up front; and hardware adder circuits, some of which are physically built as a tree of smaller adders combining pairs of bits in parallel, rather than one long sequential chain.

### SE Lens

The design principle here is **the same guarantee (correctness) can come with a genuinely different real cost (structure)**, once a law like associativity licenses more than one valid approach. `tree-sum` and Lesson 169's own `sum-left-to-right` compute the identical answer, always, for any associative operation — but they get there through completely different real work: `sum-left-to-right` performs `n - 1` additions, one at a time, in a single unbroken chain; `tree-sum` performs the same `n - 1` additions total, but grouped into `⌈log₂ n⌉` rounds, each round's own additions independent of every other addition in that same round.

An alternative that was *not* chosen: always use the simplest possible grouping, `sum-left-to-right`'s own strict sequence, since it's shorter to write and easier to trace by hand. That alternative is completely reasonable when nothing about the *shape* of the computation matters — only the final total. The real benefit `tree-sum`'s own shape buys, at the cost of a more intricate procedure: every addition within the same round is independent of every other addition in that round, meaning a real parallel implementation could genuinely perform an entire round's worth of additions *simultaneously*, on separate hardware — a benefit `sum-left-to-right`'s own strictly sequential chain structurally forecloses, since each of its additions depends on the running total the previous one just produced.

### Run It

```scheme
(define nums (list 3 1 4 1 5 9 2 6))

(pair-up nums)
;=> (4 5 14 8)

(tree-sum nums)
;=> 31
```

`(4 5 14 8)` — four combined pairs from eight original numbers (`3+1=4`, `4+1=5`, `5+9=14`, `2+6=8`), and `tree-sum` continuing to pair those down (`4+5=9`, `14+8=22`, then `9+22=31`) until one value, `31`, remains.

```scheme
(define (sum-left-to-right lst)
  (let loop ((remaining lst) (total 0))
    (if (null? remaining)
        total
        (loop (cdr remaining) (+ total (car remaining))))))

(sum-left-to-right nums)
;=> 31
```

`31` and `31` — matching exactly, confirmed on a genuinely different grouping than either of Lesson 169's own two.

An odd-length list, to confirm `pair-up`'s own one-leftover case works correctly too:

```scheme
(define odd-nums (list 3 1 4 1 5))

(tree-sum odd-nums)
;=> 14

(sum-left-to-right odd-nums)
;=> 14
```

`14` and `14` — matching even when a round has a genuinely unpaired leftover element, confirming `pair-up`'s own second `cond` clause correctly lets that element pass through a round untouched rather than being lost or miscounted.

### Connection

A third, genuinely different grouping now agrees with the first two — real, repeated confirmation that associativity licenses any tree shape at all. The next problem is what this actually buys, concretely, beyond an interesting structural fact: a real, faster way to answer a question this curriculum has never had an efficient tool for.

---

## Concept Unit: The Real Payoff — Range Queries in Constant Time

### The Problem

Given a long list of numbers, a single, very common real question: what's the sum of the numbers from position `i` up to (not including) position `j`? Every tool this curriculum has built so far answers this the same way — walk from `i` to `j`, adding as you go, taking time proportional to how wide the range is. If the exact same range gets asked about repeatedly, or many different ranges over the same fixed list, that's real, repeated, avoidable work. Associativity is the reason a smarter answer exists at all: does precomputing something *once* make every later range query fast, no matter how wide the range?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: two new top-level procedures.
- **Location** — after `tree-sum`; independent of it.
- **Dependencies** — none beyond Guile's built-in list procedures.

### The New Code

```scheme
(define (prefix-sums lst)
  (let loop ((remaining lst) (running 0) (result (list 0)))
    (if (null? remaining)
        (reverse result)
        (let ((new-running (+ running (car remaining))))
          (loop (cdr remaining) new-running (cons new-running result))))))

(define (range-sum prefixes i j)
  (- (list-ref prefixes j) (list-ref prefixes i)))
```

### The Updated Project

Skipped — `prefix-sums` and `range-sum` are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside yet.

### Isolated Lab: None — Justified Skip

`prefix-sums` is a count-terminated accumulator loop, identical in shape to dozens of procedures this curriculum has built; `range-sum` is a single subtraction. Neither introduces a new Scheme construct — this Concept Unit's own real content is the *idea* being implemented, worked through directly in the Mechanical Walkthrough and Run It below.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (prefix-sums lst) ...)`** — `define` binds `prefix-sums` to a one-parameter procedure.
- **`(let loop ((remaining lst) (running 0) (result (list 0))) ...)`** — a named `let`: `remaining` tracks the unprocessed tail of `lst`, `running` accumulates the total so far, and `result` accumulates every running total seen, starting with a single `0` — the sum of the first *zero* elements, a real, deliberate base case that makes every later index line up correctly.
- **`(if (null? remaining) (reverse result) ...)`** — the base case reverses the accumulated `result` back into forward order, since it was built backwards via `cons`, exactly the same reversal pattern this curriculum has used since Lesson 163's own trajectory-building.
- **`(let ((new-running (+ running (car remaining)))) (loop (cdr remaining) new-running (cons new-running result)))`** — the recursive step: `(car remaining)` reads the next real number, `(+ running ...)` folds it into a new running total, and `(cons new-running result)` records that new total at the front of the accumulated list — one more entry in the growing sequence of "sum of the first `k` elements," for every `k` from `0` up to `lst`'s own full length.
- **`(define (range-sum prefixes i j) (- (list-ref prefixes j) (list-ref prefixes i)))`** — `define` binds `range-sum` to a three-parameter procedure. `(list-ref prefixes j)` reads the precomputed sum of the first `j` elements; `(list-ref prefixes i)` reads the precomputed sum of the first `i`; subtracting the second from the first leaves exactly the sum of the elements from position `i` up to `j` — everything through position `j - 1` minus everything through position `i - 1` cancels out everything before position `i`, leaving only the range actually asked about.

### CS Lens

This is **prefix computation**: precomputing every prefix's own combined result once, so any later range query can be answered by combining just two precomputed values, in constant time, regardless of how wide the range is.

Also recognized in: segment trees and Fenwick trees, real data structures that generalize this exact idea to support range queries *and* updates efficiently, built on the same underlying "precompute combined results, don't recombine from scratch" principle; database query engines maintaining running aggregates (a cumulative `SUM` or `COUNT` column) specifically so a later report doesn't have to re-scan an entire table; video editing and audio processing tools that precompute cumulative waveform data once, so scrubbing to any point or measuring any clip's own loudness doesn't require re-processing from the very start of the file; and dynamic programming itself, where a table of precomputed subproblem answers plays exactly the same role `prefix-sums` plays here — solve the small pieces once, combine them cheaply, as many times as needed.

### SE Lens

The design principle here is **paying a one-time precomputation cost to make every future query cheap**, a real trade only available at all because addition is both associative *and* has a genuine inverse operation, subtraction, that can "undo" part of a combined result.

An alternative that was *not* chosen: skip precomputing anything, and answer every range query by walking the actual range directly, from scratch, every single time. That alternative needs no setup at all, and for a list that's only ever queried once, or barely ever queried, it's strictly cheaper — building `prefix-sums` for a list nobody ever asks a second range query about is pure wasted work. The real cost `prefix-sums` accepts in exchange: one full pass over the whole list, and one full extra list's worth of memory, paid *before* a single query is answered, a cost that only pays for itself once enough real queries actually arrive to make the savings add up. And there's a deeper, structural cost worth naming honestly, previewed for Concept Unit 3's own Closing: this exact trick — precompute prefixes, answer a range query with one subtraction — depends on addition having a genuine inverse. Not every associative operation does.

### Run It

```scheme
(define data (list 3 1 4 1 5 9 2 6))

(prefix-sums data)
;=> (0 3 4 8 9 14 23 25 31)
```

Nine entries for eight real numbers — `0` (the sum of nothing), `3` (just the first element), `4` (`3 + 1`), and so on, up through `31`, the sum of the entire list.

```scheme
(define prefixes (prefix-sums data))

(range-sum prefixes 2 5)
;=> 10
```

The sum of `data`'s own elements from position `2` up to (not including) position `5` — `4, 1, 5`, which really do sum to `10` — computed here with one single subtraction, `14 - 4`, reading two already-precomputed values rather than adding `4 + 1 + 5` fresh.

```scheme
(range-sum prefixes 5 8)
;=> 17
```

The sum of positions `5` through `7` — `9, 2, 6`, which sum to `17` — again, one subtraction, `31 - 14`, regardless of how wide that particular range happens to be.

### Connection

A real, working range-query tool now exists, built entirely on associativity's own guarantee that combining values never depends on how they're grouped. What's left is tracing one real range query through everything this lesson built, and being honest, directly, about the one thing `range-sum`'s own trick actually needs that not every associative operation provides.

---

## Closing

### Connect the Pieces

One real list, moving through every piece built in this lesson, start to finish:

```scheme
data
;=> (3 1 4 1 5 9 2 6)
```

Eight real numbers, the same list threaded through every Concept Unit.

```scheme
(tree-sum data)
;=> 31
```

A genuinely different grouping than Lesson 169 ever tried — pairing neighbors, then pairing results — landing on the identical total Lesson 169's own `sum-left-to-right` would give, real confirmation that associativity licenses more than just two specific groupings.

```scheme
(prefix-sums data)
;=> (0 3 4 8 9 14 23 25 31)
```

The same list's own full prefix structure, computed once.

```scheme
(range-sum (prefix-sums data) 2 5)
;=> 10
```

And the concrete, practical payoff: a real range's own sum, answered in one subtraction, entirely dependent on the same law that let `tree-sum` regroup this exact list's own additions freely.

### What Breaks Without This

`range-sum`'s own trick — precompute prefixes, subtract to get a range — quietly depends on more than associativity alone: it needs `-` to genuinely *undo* a `+`, a property called an inverse. Breaking that assumption on purpose: try the identical trick with `max` in place of `+`, an operation that's associative (checkable the same way Lesson 169 checked `+`) but has no real inverse at all.

```scheme
(define (prefix-maxes lst)
  (let loop ((remaining lst) (running (car lst)) (result (list (car lst))))
    (if (null? remaining)
        (reverse result)
        (let ((new-running (max running (car remaining))))
          (loop (cdr remaining) new-running (cons new-running result))))))

(prefix-maxes data)
```

Run for real:

```
;; real output:
;; (3 3 3 4 4 5 9 9 9)
```

Every entry is non-decreasing — `prefix-maxes` can only ever grow or stay flat, because once some value becomes the largest seen so far, nothing that comes later can ever *un-set* that fact the way subtracting an earlier prefix sum genuinely removes it from a running total. There is no operation `undo-max` that could take `prefix-maxes`' own value at position `j` and position `i` and recover "the max of just the elements between them" — the moment the true maximum of the whole range happens to sit *before* position `i`, subtracting (or any other combination of the two precomputed values) can't distinguish "the range's own real max" from "a leftover max from before the range even started." `range-sum`'s entire trick, and not merely associativity by itself, is why addition supports this specific shortcut and `max` doesn't — a real, honest limit on how far this lesson's own payoff generalizes, and exactly why real range-maximum queries need a genuinely different structure (a segment tree, mentioned in this lesson's own CS Lens) rather than this lesson's simple prefix-and-subtract trick.

### Exercises

- `compose` was tested with three specific functions. Pick three different real functions of your own and confirm, for real, that composing them associatively still holds.
- `tree-sum` and Lesson 169's `split-sum` are two different associative groupings of the same operation. Confirm, for real, that they agree with each other too, not just each separately agreeing with `sum-left-to-right`.
- Modify `prefix-sums` and `range-sum` to work with `*` (multiplication) instead of `+`, computing range *products* instead of range sums. Multiplication is associative and has a genuine inverse (division, for nonzero values) — confirm the same precompute-and-undo trick works for real.
- This lesson's Closing showed `max` breaks the simple prefix-and-subtract trick. Research (or design from first principles) how a real segment tree answers a range-maximum query in better than linear time despite this limitation, and sketch, in prose, the real structural difference between it and this lesson's own `prefix-sums`.

### Definition of Done

- [ ] `compose`, `tree-sum`, `prefix-sums`, and `range-sum` are all defined, all actually run in Guile this session, with real output pasted in for every claim.
- [ ] Function composition's own associativity has been checked at more than one real input, not just asserted from the definition alone.
- [ ] `tree-sum` has been checked against `sum-left-to-right` on both an even-length and an odd-length real list.
- [ ] At least two real range queries have been answered with `range-sum` and independently confirmed against a direct, from-scratch sum of that same range.
- [ ] The `max`-based limitation has been caused on purpose, its real non-decreasing output observed, and the reason — no genuine inverse operation exists for `max` — has been articulated, not just observed.
- [ ] `git commit` — a message explaining *why* this lesson exists separately from Lesson 169: knowing an operation is associative is one fact; knowing what that fact actually *licenses* — any grouping tree, and a real constant-time range-query structure for operations with an inverse — is a genuinely different, more practical one.
