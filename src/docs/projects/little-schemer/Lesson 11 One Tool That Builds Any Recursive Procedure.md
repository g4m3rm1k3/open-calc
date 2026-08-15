# Lesson 11: One Tool That Builds Any Recursive Procedure

**What you will build:** `Y` — a single procedure that takes *any*
function written in a particular shape and returns a genuinely working
recursive procedure from it, with no `define`-based self-reference and
no hand-written self-application anywhere. The transferable problem:
Lesson 10's `mk-length` had to hand-write its own self-application
machinery, baked directly into its own body — a `mk-sum` would need
that exact same machinery copied and pasted in again. This lesson
factors that machinery out, once, into a tool reusable for any
recursive procedure at all.

**What you need to know first:** Lesson 10 — self-application,
`mk-length`, and specifically its Execution Trace, which this lesson's
own walkthrough refers back to directly.

**Terms introduced in this lesson:**
- **Fixed-point combinator** — a procedure that takes a function
  written as "what to do, assuming a working recursive version already
  existed" and returns a real, fully working recursive procedure built
  from it. `Y` is the specific, classic example — the name comes from
  a related idea in mathematical logic, a *fixed point* being a value
  a function maps to itself.

**Objects and methods this lesson uses:** none new — `lambda`,
`define`, and ordinary application are used in a new combination.

---

## Concept Unit 1: Spotting the Repeated Shape

### The Problem

`mk-length` (Lesson 10) and a hypothetical `mk-sum`, built the same
way, would each need their *own* copy of the self-application
boilerplate — the doubled `lambda`, applied to itself — with only the
`cond` inside actually differing between them. Copy-pasting that
boilerplate into every new recursive procedure defeats the entire
point of factoring out repeated shapes, the same instinct that led to
naming `left-of`/`op-of`/`right-of` instead of repeating raw
`car`/`cdr` chains (Lesson 07). Can the self-application machinery be
written exactly once?

### Connecting Sentence

Factoring it out means separating `mk-length`'s two genuinely
different jobs: the self-application plumbing (identical every time),
and the actual recursive logic (the only part that should change from
one procedure to the next).

---

## Concept Unit 2: `Y` — Building the Reusable Tool

### The Problem With the Obvious Attempt

The most direct way to factor out self-application looks like this:

```scheme
(define Y-naive
  (lambda (f)
    ((lambda (x) (f (x x)))
     (lambda (x) (f (x x))))))
(define length
  (Y-naive (lambda (mk-length)
             (lambda (l)
               (cond
                 ((null? l) 0)
                 (else (add1 (mk-length (cdr l)))))))))
(length '(wrench bolt))
```

```
; Y-naive defined
[error] Maximum call stack size exceeded
[error] Unbound variable: length
```

**This fails before `length` is even fully built — the `define`
itself never completes.** The reason: `(f (x x))` evaluates `(x x)`
*immediately*, as an ordinary argument, before `f` ever gets a chance
to run — and evaluating `(x x)` calls `x` with itself again, which
evaluates `(x x)` again inside *that* call, and so on, forever, before
`f`'s own `cond` — the part that would actually check `null?` and stop
— ever runs even once. This dialect evaluates arguments eagerly,
before a call happens, and eager evaluation is exactly what makes this
version loop before it can do anything useful.

### The Fix — Delay the Self-Application

```scheme
(define Y
  (lambda (f)
    ((lambda (x) (f (lambda (n) ((x x) n))))
     (lambda (x) (f (lambda (n) ((x x) n)))))))
(define length
  (Y (lambda (mk-length)
       (lambda (l)
         (cond
           ((null? l) 0)
           (else (add1 (mk-length (cdr l)))))))))
(length '(wrench bolt gasket))
(length '())
```

```
; Y defined
; length defined
=> 3
=> 0
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox at `/lab/little-schemer`, where `Y` is worth keeping defined
for the next Concept Unit and the Exercises below.

### Mechanical Walkthrough

- `(lambda (n) ((x x) n))` — **the fix, precisely.** This is a
  procedure, not a call — building a `lambda` doesn't run its body.
  `(x x)` only actually gets evaluated once this procedure is *called*
  with a real `n`, which only happens from inside `f`'s own logic,
  at the exact point a real recursive call is needed — never before.
  This delaying trick is sometimes called **eta-expansion**: wrapping
  a call in an extra `lambda` that takes the call's own argument and
  passes it straight through, changing nothing about *what* runs, only
  *when*.
- `f` — the argument to `Y` — **is exactly the function passed to
  `mk-length` in Lesson 10, unchanged in shape.** Compare: Lesson 10's
  `mk-length` had `(mk-length mk-length)` written directly inside its
  own recursive case. Here, the function passed to `Y` — the `(lambda
  (mk-length) (lambda (l) ...))` bound to `length` — has only
  `(mk-length (cdr l))`, no self-application in sight anywhere. `Y`
  supplies the self-application machinery *around* this function
  entirely from the outside; the function itself never needs to know
  it's happening.
- `((lambda (x) (f (lambda (n) ((x x) n)))) (lambda (x) (f (lambda (n)
  ((x x) n)))))` — **Lesson 10's whole self-application shape,
  reappearing wholesale**, with the delaying `lambda` wrapped around
  every `(x x)`. This is the exact machinery `mk-length` had baked
  into its own body — now written once, inside `Y`, and reused for
  any `f` at all.

### Connecting Sentence

`Y` reproduces everything Lesson 10's `mk-length` did, mechanically,
with the self-application factored all the way out. The next Concept
Unit proves the payoff: the *same* `Y`, unchanged, builds a completely
different recursive procedure.

---

## Concept Unit 3: `Y` Is Truly Reusable

### The Real Procedure — `sum`, Built From the Same `Y`

```scheme
(define Y
  (lambda (f)
    ((lambda (x) (f (lambda (n) ((x x) n))))
     (lambda (x) (f (lambda (n) ((x x) n)))))))
(define plus
  (lambda (n m)
    (cond
      ((zero? m) n)
      (else (add1 (plus n (sub1 m)))))))
(define sum
  (Y (lambda (mk-sum)
       (lambda (l)
         (cond
           ((null? l) 0)
           (else (plus (car l) (mk-sum (cdr l)))))))))
(sum '(3 5 8))
```

```
; Y defined
; plus defined
; sum defined
=> 16
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox.

### Mechanical Walkthrough

- `Y` itself — **not redefined, not touched, not copy-pasted.** The
  exact same procedure from Concept Unit 2 builds `sum` here. `mk-sum`
  is just a parameter name, not a special word `Y` looks for — any
  name would work identically.
- `(plus (car l) (mk-sum (cdr l)))` — **`addtup`'s exact shape**
  (Lesson 05), with `mk-sum` standing in for what would ordinarily be
  a `define`d name. `mk-sum (cdr l)` recurses correctly, with `Y`
  quietly supplying everything Lesson 10's `mk-length` had to spell
  out by hand, every time, inside itself.

### Connecting Sentence

`length` and `sum` are two genuinely different recursive procedures,
built from the exact same unmodified `Y`. Lesson 10 proved recursion
doesn't strictly need a name; this lesson proves the *mechanism* that
makes that possible doesn't need rewriting for every new procedure
either — it needs building exactly once.

---

## Connect the Pieces — the Whole Series, One Last Time

`Y`'s own `(lambda (n) ((x x) n))` is `cons`, `car`, and `cdr`'s
distant descendant: this entire series, since Lesson 00, has been
about building exactly the right small piece, understanding precisely
what it does, and combining it with pieces already understood. `atom?`
and `lat?` (Lesson 01) proved recursion could answer a yes/no question
about a list. `rember` (Lesson 02) proved a recursion could build a
new list instead. `rember*` (Lesson 04) proved recursion could branch
into two independent pieces of the same structure. `plus` (Lesson 05)
proved the exact same recursive shape works on numbers, not just
lists. Collectors (Lesson 06) proved a recursion doesn't have to
return its answer directly — it can hand that job to a function
instead. `value` (Lesson 07) proved a list can represent a
computation, not just data, and be read back out again. `rember-f`
(Lesson 09) proved a procedure can take *another procedure* as a
parameter and build a specialized version from it. `mk-length` (Lesson
10) proved a procedure can recurse with no name referring to itself at
all. `Y`, here, proves that whole mechanism is itself just one more
procedure — buildable once, and reusable for anything shaped the right
way. Nothing in this closing paragraph is a new idea; it's the same
one, `cons`ed onto itself, twelve lessons deep.

## What Breaks Without This

Already shown above, in the most direct way this series has used yet:
`Y-naive`, missing the delaying `lambda` around `(x x)`, doesn't
produce a wrong answer or a strange value — it fails to finish being
*built* at all, with a real `Maximum call stack size exceeded`, before
`length` even exists to be called. Every other "what breaks" section
in this series showed a procedure that ran to completion and returned
something wrong, or hit a clean, contained error partway through. This
one is different on purpose: eager evaluation punishes `(x x)` written
bare, immediately, with no partial result to inspect at all — proof
that the delaying `lambda` isn't a stylistic nicety, it's the one
thing standing between `Y` working and `Y` never returning control at
all.

## Exercises

1. Predict, before running, what `(Y (lambda (mk-len) (lambda (l)
   (cond ((null? l) 0) (else (add1 (mk-len (cdr l))))))))` applied to
   `'(wrench bolt gasket washer)` returns. Then run it and check.
2. Build `count-nums` using `Y` — counts how many items in a list are
   numbers, reusing `number?` (Lesson 00). Test it against a mixed
   list of atoms and numbers.
3. `Y` only directly supports one-argument recursive procedures —
   `mk-length`'s `l`, `mk-sum`'s `l`. What would building something
   like `rember` (two arguments: `a` and `lat`) via `Y` require? You
   don't need to write it — describe, in your own words, what would
   have to change.
4. Open *The Little Schemer* to the rest of Chapter 9 and all of
   Chapter 10 and work its own questions in the sandbox — Chapter 10
   is mostly a revisit of ideas already built in this series (`value`,
   from Lesson 07, generalized further), not a wall of new material.
   You have every real tool the book uses by this point.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown, including the `Y-naive`
      failure.
- [ ] You can explain, without looking, why `(x x)` written bare loops
      forever in this dialect, and what the wrapping `lambda` around it
      actually delays.
- [ ] You can explain what stayed exactly the same and what changed
      between `mk-length` (Lesson 10) and `length` built via `Y`.
- [ ] You completed the Exercises above, including building
      `count-nums` yourself.
- [ ] You're working through the rest of the book's Chapters 9 and 10
      in the sandbox — you have every tool this series built, from
      `car` and `cdr` all the way to `Y`.
