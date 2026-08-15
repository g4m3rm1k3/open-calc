# Lesson 05: Arithmetic Built From Nothing But `add1` and `sub1`

**What you will build:** `plus` and `minus` — real addition and
subtraction, built entirely from `add1`, `sub1`, `zero?`, and
recursion — then `addtup` (sum every number in a list) and `tup+` (add
two lists of numbers together, position by position). The
transferable problem: this dialect already has native `+` and `-`
(Lesson 00) — so building them again isn't about needing them. It's
proof that arithmetic itself is just another recursive procedure, no
different in kind from `lat?` or `rember`: a base case, and a
recursive case that shrinks toward it.

**What you need to know first:** Lessons 00 through 04 — recursion,
list-building recursion, recursing past a match, and tree recursion.
`add1`, `sub1`, `zero?`, and the native `+` were all introduced in
Lesson 00, Concept Unit 1, but never really *used* until now.

**Terms introduced in this lesson:**
- **Reducing recursion** — a recursive shape that consumes a list and
  returns a single accumulated value, rather than a new list (Lesson
  02) or a yes/no answer (Lesson 01). Already seen twice without the
  name: `count-items` (Lesson 01's throwaway) and `count-atoms`
  (Lesson 04's throwaway) are both reducing recursion — this lesson's
  `addtup` is the first *kept* procedure built this way.

**Objects and methods this lesson uses:** none new — `add1`, `sub1`,
`zero?`, `cons`, `car`, `cdr`, `null?`, `cond`, `lambda`, and `define`
all reappear from Lesson 00 and Lesson 04.

---

## Concept Unit 1: `plus` and `minus` — Arithmetic as Recursion, Not a Primitive

### The Problem

`(+ 3 4)` already works in this dialect (Lesson 00) — so why write
addition again? Because *how* `+` is implemented under the hood is
hidden from view; writing it out in terms of only `add1`, `sub1`, and
recursion proves that a number, in this style of thinking, is nothing
more than "zero, or one more than a smaller number" — and that
addition is nothing more than a specific instance of the exact same
recursive shape every procedure since Lesson 01 has used, applied to
numbers instead of lists.

### The Real Procedure — `plus`

```scheme
(define plus
  (lambda (n m)
    (cond
      ((zero? m) n)
      (else (add1 (plus n (sub1 m)))))))
(plus 3 4)
(plus 0 5)
(plus 5 0)
```

```
; plus defined
=> 7
=> 5
=> 5
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox at `/lab/little-schemer`.

### Mechanical Walkthrough

- `((zero? m) n)` — **base case.** Adding zero to anything is that
  thing, unchanged — `n` needs no further work once `m` has shrunk all
  the way down to `0`.
- `(add1 (plus n (sub1 m)))` — **reapplies `count-atoms`'s
  "wrap the recursive result" shape** (Lesson 04) to numbers instead
  of a count: recurse on `m` shrunk by one (`sub1 m`), then wrap
  whatever comes back in one more `add1`. `n` itself never changes
  across any call — only `m` shrinks, one `sub1` per call, and one
  `add1` gets applied on the way back out for each `sub1` spent on
  the way in.
- `minus`, below, is the same shape with `add1` and `sub1` swapped —
  **reapplication, not a new shape.**

### `minus` — the Mirror Image

```scheme
(define minus
  (lambda (n m)
    (cond
      ((zero? m) n)
      (else (sub1 (minus n (sub1 m)))))))
(minus 7 3)
(minus 5 5)
```

```
; minus defined
=> 4
=> 0
```

### Execution Trace

Tracing `(plus 2 3)`:

```
Call 1: n = 2, m = 3
  → (zero? 3) is #f
  → (add1 (plus 2 2))

Call 2: n = 2, m = 2
  → (zero? 2) is #f
  → (add1 (plus 2 1))

Call 3: n = 2, m = 1
  → (zero? 1) is #f
  → (add1 (plus 2 0))

Call 4: n = 2, m = 0
  → (zero? 0) is #t — base case
  → returns n = 2

Call 3 returns (add1 2) = 3
Call 2 returns (add1 3) = 4
Call 1 returns (add1 4) = 5
```

Three `sub1`s spent getting `m` down to `0`, three `add1`s applied
coming back out — `2` plus `3` really is "`2`, `add1`'ed three times,"
exactly what `plus`'s definition claims it is.

### CS Lens

**Defining every number as either zero or one more than a smaller
number, and every arithmetic operation recursively in terms of that,
is the same idea behind Peano arithmetic** — the formal foundation
built from just two things, `zero` and `successor` (`add1`, here).
Also recognized in: unary tally-mark counting, where a quantity really
is represented as "one mark, one more, one more..."; how computability
theory defines the *primitive recursive functions*, a whole class of
computable functions built from nothing but zero, successor, and
composition; even a mechanical adding machine built from nothing but
an increment mechanism and a counter tracking how many increments are
left to apply.

### SE Lens

**Given that native `+` already exists (Lesson 00), why would any real
project ever write its own recursive `plus`?** It wouldn't, in
practice — this is the honest tradeoff worth naming plainly. `plus`
here costs `m` full recursive calls to add `n` and `m`; a real
processor's native addition is a single, fixed-cost hardware
operation, regardless of how large the numbers are. Writing `plus`
this way has exactly one purpose in this series: proving the *idea*
that arithmetic reduces to the same recursive shape as everything
else, at a real, honestly-acknowledged efficiency cost nobody would
actually pay outside of a lesson built to prove that point.

### Connecting Sentence

`plus` and `minus` prove numbers fit the same recursive mold as lists.
The next Concept Unit puts `plus` to real use, combining it with a
list-consuming recursion this series has already built twice without
naming it.

---

## Concept Unit 2: `addtup` — Reducing a List to One Number

### The Problem

Given a list of numbers — a **tuple**, in this book's own vocabulary —
what's their sum? This needs a recursion that consumes a list one item
at a time, the same as ever, but combines everything into a single
number at the end instead of building a new list or answering yes/no.

### Reapplying an Already-Isolated Shape

No new throwaway lab is needed here, per the Concept Isolation Rule —
**reducing recursion was already isolated twice**: `count-items`
(Lesson 01) and `count-atoms` (Lesson 04) both consume a list and
return a single accumulated number, exactly the shape `addtup` needs.
The only change is what gets accumulated, and how.

### The Real Procedure — `addtup`

```scheme
(define plus
  (lambda (n m)
    (cond
      ((zero? m) n)
      (else (add1 (plus n (sub1 m)))))))
(define addtup
  (lambda (tup)
    (cond
      ((null? tup) 0)
      (else (plus (car tup) (addtup (cdr tup)))))))
(addtup '(3 5 2 8))
(addtup '())
```

```
; plus defined
; addtup defined
=> 18
=> 0
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox.

### Mechanical Walkthrough

- `((null? tup) 0)` — **base case.** An empty tuple sums to `0`, the
  same identity value `plus`'s own base case returns unchanged numbers
  from.
- `(plus (car tup) (addtup (cdr tup)))` — **reducing recursion,
  reappearing** (Concept Unit 1's Terms entry) — combine the current
  item with the recursive result on the rest of the tuple. The
  combining operation is `plus`, the procedure Concept Unit 1 just
  built — proof it's a real, usable procedure, not only a teaching
  exercise.

### Connecting Sentence

`addtup` collapses a whole list into one number using `plus` to
combine as it goes. The next Concept Unit needs `plus` again, this
time inside a recursion consuming *two* lists at once instead of one.

---

## Concept Unit 3: `tup+` — Recursing on Two Lists in Parallel

### The Problem

Given two tuples of numbers, add them together position by position —
first plus first, second plus second, and so on. Every recursion so
far has consumed exactly one list argument at a time; this needs two,
advancing together.

### The Real Procedure — `tup+`

```scheme
(define plus
  (lambda (n m)
    (cond
      ((zero? m) n)
      (else (add1 (plus n (sub1 m)))))))
(define tup+
  (lambda (tup1 tup2)
    (cond
      ((null? tup1) tup2)
      ((null? tup2) tup1)
      (else (cons (plus (car tup1) (car tup2))
                   (tup+ (cdr tup1) (cdr tup2)))))))
(tup+ '(3 6 9) '(1 2 3))
(tup+ '(3 6) '(1 2 3))
```

```
; plus defined
; tup+ defined
=> (4 8 12)
=> (4 8 3)
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox.

### Mechanical Walkthrough

- `((null? tup1) tup2)` / `((null? tup2) tup1)` — **first appearance
  of two base cases in the same procedure, for two different
  arguments.** Either tuple can run out first — the second test proves
  it: `tup1` is shorter, so once it's exhausted, whatever remains of
  `tup2` is returned exactly as it is, unmatched and unchanged, rather
  than being an error or getting silently dropped.
- `(cons (plus (car tup1) (car tup2)) (tup+ (cdr tup1) (cdr tup2)))`
  — **first appearance of recursing on two arguments in the same
  call.** Both `tup1` and `tup2` shrink by one `cdr` together, on
  every single recursive call — neither one is allowed to shrink
  without the other, as long as both still have items left.
- `(plus (car tup1) (car tup2))` — **`plus`, reappearing** (Concept
  Unit 1) — combining this call's pair of numbers, exactly the way
  `addtup` reused `plus` to combine a single number with a recursive
  result.

### CS Lens

**Advancing through two sequences together, position by position, is
often called a zip.** Also recognized in: Python's own `zip()`
function, pairing up two lists the same way `tup+` pairs up two
tuples; the merge step of merge sort, which walks two already-sorted
lists in lockstep, always comparing their current fronts; SIMD
hardware instructions, which apply one operation to two arrays'
worth of numbers simultaneously, position by position, in real
silicon. `tup+`'s two base cases — either input can run out first —
are the general shape any such pairing has to handle whenever the two
sequences aren't guaranteed to be the same length.

### Connecting Sentence

`tup+` closes this lesson's arc: `plus` proved arithmetic is
recursion; `addtup` and `tup+` both put `plus` to work inside two
different list-consuming recursive shapes — one list at a time, then
two lists at once.

---

## Connect the Pieces

Two tuples, `'(3 5)` and `'(10 20)`. `tup+` (Concept Unit 3) adds them
position by position — `(plus 3 10)` and `(plus 5 20)` — giving
`(13 25)`. Feed that result into `addtup` (Concept Unit 2):
`(addtup '(13 25))` sums it down to one number — `38` — using `plus`
(Concept Unit 1) at every step along the way, in both procedures.
Three procedures, one lesson, one shared building block.

## What Breaks Without This

Delete the `add1` from `plus`'s recursive case:

```scheme
(define plus-broken
  (lambda (n m)
    (cond
      ((zero? m) n)
      (else (plus-broken n (sub1 m))))))
(plus-broken 2 3)
```

```
; plus-broken defined
=> 2
```

**No crash, and a wrong answer that's easy to miss if you're not
checking carefully**: `plus-broken` still correctly counts `m` down to
zero — the recursion still terminates — but nothing ever gets added
back on the way out, so the result is just `n`, completely unchanged,
regardless of what `m` was. Restore the `add1`, and confirm `(plus-broken
2 3)` — renamed back to `plus` — returns `5` again.

## Exercises

1. Write and `define` `x` (multiplication), built from `plus` and
   recursion the same way `plus` was built from `add1`: `(x n m)`
   should add `n` to itself `m` times. `(zero? m)` is the base
   case — multiplying by zero is zero, not `n` unchanged, unlike
   `plus`'s base case. Test `(x 3 4)` and confirm it's `12`.
2. Write and `define` `one?` — is a number exactly `1`? — using only
   `zero?` and `sub1`, no comparison operator. Test it against `1`,
   `4`, and `0`.
3. Predict, before running, what `(tup+ '(3 6 9) '(1 2))` returns —
   which tuple is longer, and what happens to its extra item? Then
   run it and check.
4. Open *The Little Schemer* to Chapter 4 and work its own number
   questions in the sandbox.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, why `plus`'s base case
      returns `n` while `addtup`'s base case returns `0`.
- [ ] You can explain what happens in `tup+` when the two tuples are
      different lengths, and point to the exact clause responsible.
- [ ] You completed the Exercises above, including writing both `x`
      and `one?` yourself.
- [ ] You're working the book's Chapter 4 in the sandbox.
