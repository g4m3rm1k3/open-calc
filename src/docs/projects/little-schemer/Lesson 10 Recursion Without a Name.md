# Lesson 10: Recursion Without a Name

**What you will build:** a real, working length-counting procedure
that never once uses `define` to refer to itself — every procedure in
this series so far has recursed by calling its own name (`rember`
calls `rember`, `lat?` calls `lat?`). This lesson proves that's not
actually required: a procedure can recurse by being handed a copy of
*itself* as data, with no name involved at all. This is the hardest
idea in this series so far, and it's built up in very small steps on
purpose — go slowly.

**What you need to know first:** Lesson 09 — specifically, `rember-f`'s
recursive case, `((rember-f test?) a (cdr lat))`, which rebuilds a
procedure and calls it immediately rather than calling a name. This
lesson generalizes exactly that shape one step further.

**Terms introduced in this lesson:**
- **Self-application** — calling a procedure with a copy of itself as
  an argument, so that inside the procedure, that argument can be used
  to reconstruct "the same procedure" again, without ever naming it.

**Objects and methods this lesson uses:** none new — `cond`, `null?`,
`add1`, `cdr`, `lambda`, and `define` all reappear, used in a
genuinely new combination.

---

## Concept Unit 1: A Procedure Can Be Applied to Itself

### The Problem

Every recursive procedure so far refers to itself *by name* —
`rember`'s own body contains the literal symbol `rember`. What if
`define` didn't exist, and there were no names at all — would
recursion even be possible?

### Isolated Example — Nothing Recursive Yet, Just Self-Application

```scheme
((lambda (me) 'i-got-called) (lambda (me) 'i-got-called))
```

```
=> i-got-called
```

Nothing unusual is happening here in terms of *evaluation* — this is
an entirely ordinary procedure call, the exact same shape as `((lambda
(x) (add1 x)) 5)` from Lesson 00. The only thing worth noticing is
*what* got passed as the argument: a copy of the exact same procedure
being called. This is called **self-application**. It proves nothing
useful by itself yet — only that a procedure being handed "itself" is
not a special case the language needs to support; it's just an
ordinary value, like any other.

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox at `/lab/little-schemer`.

### Connecting Sentence

Self-application alone doesn't compute anything interesting. The next
Concept Unit uses it for real: a procedure that, once given a copy of
itself, can use that copy to recurse.

---

## Concept Unit 2: Building a Real Procedure From Self-Application

### The Real Procedure

```scheme
(define mk-length
  (lambda (mk-length)
    (lambda (l)
      (cond
        ((null? l) 0)
        (else (add1 ((mk-length mk-length) (cdr l))))))))
((mk-length mk-length) '(wrench bolt gasket))
```

```
; mk-length defined
=> 3
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox, where it's worth keeping defined for the Exercises below.

### Mechanical Walkthrough

- `(lambda (mk-length) (lambda (l) ...))` — `mk-length` names *two*
  different things here, deliberately: the outer `define` binds the
  name `mk-length` at the top level, and the *parameter* of the outer
  `lambda` is also named `mk-length` — inside the body, the parameter
  shadows the outer name completely (ordinary scoping, already
  covered — parameters always shadow names from an enclosing scope).
  Calling this outer `lambda` with one argument doesn't compute a
  length at all yet — it returns the *inner* `lambda`, a real
  one-argument procedure, with whatever was passed in remembered
  inside it as `mk-length`.
- `(mk-length mk-length)` in `((mk-length mk-length) '(wrench bolt
  gasket))` — **the self-application from Concept Unit 1, used for
  real.** The outer, top-level `mk-length` is called with a copy of
  *itself*. Inside the resulting inner `lambda`, the parameter
  `mk-length` now refers to that same self-copy — not a length
  procedure yet, just the raw self-application-capable builder.
- `((mk-length mk-length) (cdr l))` — **the exact same shape,
  reappearing inside the recursive case.** Every time this line runs,
  it re-derives "the real length procedure" from scratch, by
  self-applying the parameter `mk-length` again, then immediately
  calls that freshly-derived procedure on the smaller list — the same
  rebuild-and-call shape `rember-f`'s recursive case used (Lesson 09),
  just with the procedure being rebuilt from itself instead of from a
  fixed `test?`.

### Execution Trace

Tracing `((mk-length mk-length) '(wrench bolt))`:

```
(mk-length mk-length) — self-application, produces a real procedure.
Call this result LEN-1.

Call 1 (calling LEN-1): l = (wrench bolt)
  → (null? l) is #f
  → (add1 ((mk-length mk-length) (cdr l)))
     (mk-length mk-length) self-applies again, producing a fresh
     result — call it LEN-2 — then LEN-2 is called on (cdr l) = (bolt)

Call 2 (calling LEN-2): l = (bolt)
  → (null? l) is #f
  → (add1 ((mk-length mk-length) (cdr l)))
     self-applies again, producing LEN-3, called on (cdr l) = ()

Call 3 (calling LEN-3): l = ()
  → (null? l) is #t — base case, returns 0

Call 2 returns (add1 0) = 1
Call 1 returns (add1 1) = 2
```

Every single recursive step re-derives the length procedure from
scratch via `(mk-length mk-length)`, then immediately uses the fresh
copy exactly once — no name anywhere in this trace ever refers
directly to "the length procedure." Every reference to "keep going" is
built, used once, and discarded, the moment it's needed.

### CS Lens

**Recursion built entirely from a procedure applying itself to itself,
with no named binding required, is the foundation the Y combinator —
Lesson 11 — generalizes into a single reusable tool.** Also recognized
in: the pure lambda calculus, which has no built-in recursion or
naming at all — every recursive computation expressible in it is
built from exactly this kind of self-application; a quine (a program
that prints its own source code), which needs a structurally similar
trick to refer to "itself" without being handed its own name from
outside; self-referential encodings in mathematical logic (the core
trick behind Gödel's incompleteness proofs is a numeric analogue of
"a statement that refers to itself" built the same indirect way,
without the statement literally naming itself).

### SE Lens

**Would any real codebase actually write a procedure this way?**
No — honestly, never. `mk-length` is dramatically harder to read than
`count-items` (Lesson 01), computes the exact same thing, and gains
nothing in return except proving a theoretical point. That point is
the entire reason this lesson exists: `define`-based recursion, used
everywhere else in this series, is a convenience the language
provides — not a fundamental requirement recursion itself depends on.
Real code should keep using `define`; this lesson is about
understanding what `define` is quietly doing for you, not replacing
it.

### Connecting Sentence

`mk-length` recurses with zero names referring to itself directly —
`mk-length`, the top-level name, is only ever used to *start* the
process. The next Concept Unit removes even that.

---

## Concept Unit 3: Removing the Name Entirely

### The Real Procedure — No `define` At All

```scheme
(((lambda (mk-length)
    (lambda (l)
      (cond
        ((null? l) 0)
        (else (add1 ((mk-length mk-length) (cdr l)))))))
  (lambda (mk-length)
    (lambda (l)
      (cond
        ((null? l) 0)
        (else (add1 ((mk-length mk-length) (cdr l))))))))
 '(wrench bolt gasket))
```

```
=> 3
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox.

### Mechanical Walkthrough

- This is Concept Unit 2's `mk-length`, written out twice — once as
  the procedure being called, once as the argument it's called with —
  in place of the single top-level name. No `define` appears anywhere
  in this expression at all.
- The result — `3`, the same answer Concept Unit 2 got — proves the
  top-level name `mk-length` was never actually load-bearing for the
  *recursion itself*. It only ever existed so the two copies needed
  for self-application didn't have to be written out in full, twice,
  by hand. Every real recursive call inside this expression still
  works exactly the way Concept Unit 2's Execution Trace showed —
  self-apply, call the result, repeat.

### Connecting Sentence

A whole recursive computation, with genuinely zero names, anywhere.
Lesson 11 takes this exact repeated pattern — the doubled `lambda`,
the self-application — and factors it out into one small, reusable
tool that builds this shape automatically, for *any* procedure, not
just a length-counter.

---

## Connect the Pieces

One list, `'(wrench bolt)`, through all three Concept Units: Unit 1
proves self-application is ordinary function application, nothing
more. Unit 2's `mk-length` uses it for real, computing `2` — the
Execution Trace showed exactly three self-applications happening
along the way, each one immediately used and never referred to again.
Unit 3 shows the identical computation with the top-level name
stripped out entirely — still `2` for a two-item list, still built
from nothing but `lambda` and application.

## What Breaks Without This

Call `mk-length` directly on a list, skipping the self-application:

```scheme
(define mk-length
  (lambda (mk-length)
    (lambda (l)
      (cond
        ((null? l) 0)
        (else (add1 ((mk-length mk-length) (cdr l))))))))
(mk-length '(wrench bolt))
```

```
; mk-length defined
=> #<procedure>
```

**Not a number — a procedure, sitting unused.** `mk-length` is a
one-argument procedure expecting a *copy of itself*; handing it a list
instead just binds its parameter to that list and returns the inner
`lambda`, exactly as written, never applying it to anything. The
returned procedure is real and correctly built — it simply never gets
called on the actual list. Restore the self-application, `(mk-length
mk-length)`, apply *that* to the list, and confirm a real number comes
back.

## Exercises

1. Predict, before running, what `((mk-length mk-length) '())`
   returns. Then run it and check.
2. Adapt `mk-length`'s shape into `mk-sum` — sums a list of numbers
   instead of counting items, using `plus` (Lesson 05) in place of
   `add1`, and returning `0` instead of `0` for the base case (the
   base case doesn't actually change — only the recursive case's
   combining step does). Test it against `'(3 5 8)`.
3. Trace `((mk-length mk-length) '(wrench bolt gasket))` by hand — the
   three-item version — the way Concept Unit 2's Execution Trace did
   for the two-item version. How many self-applications happen in
   total?
4. Open *The Little Schemer* to the start of Chapter 9 and work its
   own self-application questions in the sandbox. Take this chapter
   slowly — it's the hardest material in the whole book, not just in
   this series.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, what `(mk-length mk-length)`
      actually returns, and why calling it again inside the recursive
      case is necessary.
- [ ] You can explain why real code should still use `define` for
      recursion, despite this lesson proving it isn't strictly
      required.
- [ ] You completed the Exercises above, including writing `mk-sum`
      yourself.
- [ ] You're working the start of the book's Chapter 9 in the sandbox
      — slowly.
