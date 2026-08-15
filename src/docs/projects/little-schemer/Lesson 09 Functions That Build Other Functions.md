# Lesson 09: Functions That Build Other Functions

**What you will build:** `eq?-c` (a warm-up: a function that builds
and returns a specialized comparison function) and `rember-f` — a
fully generalized `rember` that works with *any* comparison, not just
`eq?`. The transferable problem: `rember` (Lesson 02) hard-codes
`eq?`. What if a caller needs to remove a matching *sublist* instead
of a matching atom — which needs `equal?`, not `eq?` — without a whole
second, separately-written procedure?

**What you need to know first:** Lesson 02 (`rember`'s original
shape) and Lesson 06 (functions as values — collectors already proved
a function can be built and passed around; this lesson goes one step
further: a function that *returns* another function).

**Terms introduced in this lesson:**
- **Currying** — building a procedure that takes its arguments one at
  a time across separate calls, rather than all at once — each call
  returns a new procedure waiting for the next argument, until enough
  have been supplied to actually do the real work.

**Objects and methods this lesson uses:** `equal?` (Lesson 00) —
introduced there but never actually used until now. `eq?`, `cons`,
`car`, `cdr`, `null?`, `cond`, `lambda`, and `define` all reappear.

---

## Concept Unit 1: `eq?-c` — A Function That Builds a Function

### The Problem

Getting a one-argument procedure that tests "is this equal to
`bolt`?" specifically would normally mean writing `(lambda (x) (eq? x
'bolt))` by hand, every single time a different atom is needed. What
if that whole `lambda` could be built automatically, for whichever
atom is actually wanted, on demand?

### The Real Procedure — `eq?-c`

```scheme
(define eq?-c
  (lambda (a)
    (lambda (x) (eq? x a))))
(define eq?-bolt (eq?-c 'bolt))
(eq?-bolt 'bolt)
(eq?-bolt 'nut)
```

```
; eq?-c defined
; eq?-bolt defined
=> #t
=> #f
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox at `/lab/little-schemer`.

### Mechanical Walkthrough

- `(lambda (a) (lambda (x) (eq? x a)))` — **first appearance of a
  `lambda` whose entire body is another `lambda`.** Calling `eq?-c`
  with one atom, `'bolt`, doesn't run any comparison yet — it returns
  a brand-new procedure, `(lambda (x) (eq? x a))`, with `a` already
  fixed to `'bolt` inside it. This is called **currying**: `eq?-c`
  takes its first argument now and its second argument *later*,
  through a completely separate call, instead of taking both at once
  the way `eq?` itself does.
- `(eq?-bolt 'bolt)` — calling the *returned* procedure. `a` is still
  `'bolt` inside it, remembered from when `eq?-c` was first called —
  the same closure behavior a collector's rebuilt `lambda` (Lesson 06)
  already relied on, just used here as the entire point of the
  procedure rather than an incidental detail.

### CS Lens

**Splitting a multi-argument function into a chain of one-argument
functions, each returning the next, is called currying** — named
after the logician Haskell Curry. Also recognized in: JavaScript's
`.bind()`, which fixes some of a function's arguments and returns a
new function waiting for the rest; Haskell, where every function is
curried this way by default, with no special syntax needed to opt in;
partial application generally, in any functional-programming-style
codebase, wherever a general function gets specialized once and reused
many times with the fixed part already baked in.

### Connecting Sentence

`eq?-c` proves a function can build and return a *specialized* version
of a comparison. The next Concept Unit uses that same idea to
generalize `rember` itself — not to a *specific* atom, but to any
comparison test at all.

---

## Concept Unit 2: `rember-f` — Generalizing `rember` to Take Its Own Test

### The Problem

`rember` (Lesson 02) always compares with `eq?`. What if the list
being searched contains sublists, and the goal is to remove a matching
*sublist* — which needs `equal?` (Lesson 00), not `eq?`, the same
distinction `rember*` (Lesson 04) exists because of? Writing a second,
separate `rember`-for-`equal?` procedure would duplicate `rember`'s
entire shape just to swap one comparison.

### The Real Procedure — `rember-f`

```scheme
(define rember-f
  (lambda (test?)
    (lambda (a lat)
      (cond
        ((null? lat) '())
        ((test? (car lat) a) (cdr lat))
        (else (cons (car lat) ((rember-f test?) a (cdr lat))))))))
(define rember-eq? (rember-f eq?))
(rember-eq? 'bolt '(wrench bolt gasket))
(define rember-equal? (rember-f equal?))
(rember-equal? '(bolt) '(wrench (bolt) gasket))
```

```
; rember-f defined
; rember-eq? defined
=> (wrench gasket)
; rember-equal? defined
=> (wrench gasket)
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox.

### Mechanical Walkthrough

- `(lambda (test?) (lambda (a lat) ...))` — **`eq?-c`'s shape,
  reapplied**: `rember-f` takes one argument, `test?`, and returns a
  whole two-argument procedure with `test?` fixed inside it. `(rember-f
  eq?)` and `(rember-f equal?)` are two genuinely different procedures
  — same shape, different comparison baked in.
- `((test? (car lat) a) (cdr lat))` — **`rember`'s match clause,
  reapplied**, with `eq?` replaced by whichever `test?` got fixed in.
- `(cons (car lat) ((rember-f test?) a (cdr lat)))` — **the one
  genuinely new, tricky piece.** The inner procedure `rember-f`
  returns has no name of its own — nothing inside it can call "itself"
  directly the way `rember` could call `rember` by name. The only way
  to get a reference to *this exact specialized version* again is to
  ask `rember-f` to build it again, with the same `test?`, then call
  the freshly-built copy immediately with the smaller list. `(rember-f
  test?)` builds it; the trailing `a (cdr lat)` calls it, right there,
  in the same expression.

### Execution Trace

Tracing `(rember-eq? 'bolt '(wrench bolt))`, where `rember-eq?` is
`(rember-f eq?)`:

```
Call 1: a = bolt, lat = (wrench bolt), test? = eq? (fixed in)
  → (eq? 'wrench 'bolt) is #f — not the match clause
  → (cons 'wrench ((rember-f eq?) 'bolt '(bolt)))
     (rember-f eq?) rebuilds a fresh, equivalent copy of the inner
     procedure — same fixed test? — then that fresh copy is called
     immediately with 'bolt and '(bolt)

Call 2 (inside the freshly rebuilt procedure): a = bolt, lat = (bolt)
  → (eq? 'bolt 'bolt) is #t — match clause
  → returns (cdr lat) = '()

Call 1 completes: (cons 'wrench '()) = (wrench)
```

Two calls, the same shape `rember`'s own trace (Lesson 02) had — the
only real difference is that Call 1 has to *rebuild* the procedure it
recurses into, rather than simply calling a name that already refers
to itself.

### SE Lens

**Rebuilding the specialized procedure on every single recursive call
is real, honest extra work** — `test?` never actually changes across
the whole recursion, yet `(rember-f test?)` runs again at every step
regardless. `rember`'s original, non-generalized version (Lesson 02)
never pays this cost, because it can just call its own name directly.
The tradeoff: `rember-f` can be specialized to *any* comparison at
all, decided by whoever calls it, without ever touching `rember-f`'s
own source — `rember`'s plain version would need a full copy-and-edit
to swap in `equal?`. Flexibility, paid for with real, repeated,
avoidable work — the same kind of honest cost Lesson 05's from-scratch
`plus` and Lesson 06's collectors both named plainly instead of
glossing over.

### Connecting Sentence

`rember-f` generalizes one procedure to take its comparison as a
parameter. The same technique — take the *behavior* as an argument,
not just the data — generalizes to `insertR`, `insertL`, and every
other comparison-based procedure this series has built, though this
lesson stops at `rember-f` alone.

---

## Connect the Pieces

One nested list, `'(wrench (bolt) gasket (bolt))`. `(rember-f eq?)`
can't remove the sublist `(bolt)` at all — `eq?` never considers a
sublist equal to anything, the same limitation plain `rember` always
had (Lesson 04's opening problem). `(rember-f equal?)`, built from the
exact same `rember-f`, with nothing about `rember-f`'s own source
touched, removes the *first* `(bolt)` correctly — proof that swapping
the comparison really did swap the whole procedure's behavior, without
a second procedure ever being written by hand.

## What Breaks Without This

Call `rember-f-broken` directly, as if it still took three arguments
the way plain `rember` does, instead of re-currying it first:

```scheme
(define rember-f-broken
  (lambda (test?)
    (lambda (a lat)
      (cond
        ((null? lat) '())
        ((test? (car lat) a) (cdr lat))
        (else (cons (car lat) (rember-f-broken test? a (cdr lat))))))))
(define rember-eq?-broken (rember-f-broken eq?))
(rember-eq?-broken 'bolt '(wrench bolt gasket))
```

```
; rember-f-broken defined
; rember-eq?-broken defined
=> (wrench . #<procedure>)
```

**Not even a proper list anymore — a visible, structural giveaway
that something is wrong.** `rember-f-broken` only ever takes *one*
argument, `test?` — calling it with three, `(rember-f-broken test? a
(cdr lat))`, doesn't error in this dialect (unlike stricter Scheme
implementations, this one doesn't check argument counts); it quietly
uses the first argument and ignores the rest, returning the *inner,
uncalled procedure itself* instead of a real recursive result. `cons`
then builds a pair with a live procedure sitting where a list was
supposed to be. Restore the re-currying `((rember-f test?) a (cdr
lat))`, and confirm a real list comes back.

## Exercises

1. Predict, before running, what `(eq?-c 5)` followed by calling the
   result on `5` and on `6` produces — does `eq?-c` work on numbers,
   not just atoms like `'bolt`? Then run it and check.
2. Use `(rember-f equal?)` against a list containing a *number-holding*
   sublist — something like `'(wrench (3 5) gasket)`, removing `(3
   5)`. Confirm it works exactly the way it did for atom-sublists.
3. Trace `(rember-equal? '(bolt) '(wrench (bolt) gasket))` by hand,
   the same way Concept Unit 2's Execution Trace did — how many calls
   deep before the match?
4. Open *The Little Schemer* to Chapter 8 and work its own
   generalized-procedure questions in the sandbox.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, why `rember-f`'s recursive
      case has to write `((rember-f test?) a (cdr lat))` instead of
      just calling itself by name.
- [ ] You can explain what currying means, in your own words, using
      `eq?-c` as the example.
- [ ] You completed the Exercises above.
- [ ] You're working the book's Chapter 8 in the sandbox.
