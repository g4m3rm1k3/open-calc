# Lesson 07: A Program Is Just Data, Until Something Reads It

**What you will build:** `numbered?` (does this list have the right
shape to represent an arithmetic expression?) and `value` (actually
compute the number it represents) — together, a tiny evaluator for
expressions like "1 plus (2 times 3)," represented as nested lists.
The transferable problem: every procedure in this series has treated a
list as generic data — atoms and sublists, nothing more. This lesson
treats a list as a *program* — using a piece of the data itself to
decide which real computation to perform. This is the same basic
mechanism every real programming language's interpreter is built from.

**What you need to know first:** Lesson 04 (tree recursion) and Lesson
05 (`plus` and `x`, built there, reused directly here).

**Terms introduced in this lesson:**
- **Expression tree** — data whose shape represents a nested
  computation. This lesson's shape is a three-item list: a left
  sub-expression, an operator symbol, and a right sub-expression —
  where each sub-expression is either a plain number or another whole
  expression tree, nested arbitrarily deep.
- **Evaluator** — a procedure that takes data representing a
  computation and actually performs it, producing a real value. `value`,
  built in this lesson, is a small one; the mechanism — read the data,
  recurse into its pieces, use part of the data to decide what to do
  with them — is the same mechanism behind every real language's own
  interpreter or compiler.

**Objects and methods this lesson uses:** none new — `atom?`,
`number?`, `eq?`, `and`, `cond`, `lambda`, and `define` all reappear
from Lessons 00 and 04.

---

## Concept Unit 1: Representing a Computation as Data

### The Problem

"1 plus (2 times 3)" needs to become a plain list before any procedure
in this series can touch it — the same kind of data `rember` or
`value`'s own inputs are. What shape should that list have, and how
should a procedure pull the pieces back out of it?

### The Representation

This lesson represents an expression as a three-item list: the left
sub-expression, an operator symbol, and the right sub-expression —
`'(1 add (2 mul 3))`. The second item, `(2 mul 3)`, is itself a whole
three-item expression, nested inside the first one, exactly the way
`rember*` (Lesson 04) worked with lists nested inside lists.

### Naming the Pieces

```scheme
(define left-of
  (lambda (aexp) (car aexp)))
(define op-of
  (lambda (aexp) (car (cdr aexp))))
(define right-of
  (lambda (aexp) (car (cdr (cdr aexp)))))
(left-of '(1 add (2 mul 3)))
(op-of '(1 add (2 mul 3)))
(right-of '(1 add (2 mul 3)))
```

```
; left-of defined
; op-of defined
; right-of defined
=> 1
=> add
=> (2 mul 3)
```

`op-of`'s `(car (cdr aexp))` and `right-of`'s `(car (cdr (cdr
aexp)))` are **nested `car`/`cdr` chains, reappearing** — `firsts`
(Lesson 02) already used `(car (car l))` to reach one level deeper
into a pair. Naming each chain here — `left-of`, `op-of`, `right-of`
— rather than writing the raw nested calls directly inside every
procedure that needs them, is a real, transferable practice: the name
says *what* is being reached for, not just *how* to reach it, and
every later procedure that needs the operator can say `(op-of aexp)`
instead of repeating `(car (cdr aexp))` and risking a typo each time.

### The Real Procedure — `numbered?`

```scheme
(define left-of
  (lambda (aexp) (car aexp)))
(define right-of
  (lambda (aexp) (car (cdr (cdr aexp)))))
(define numbered?
  (lambda (aexp)
    (cond
      ((atom? aexp) (number? aexp))
      (else
       (and (numbered? (left-of aexp))
            (numbered? (right-of aexp)))))))
(numbered? '(1 add (2 mul 3)))
(numbered? '(1 add bolt))
(numbered? 5)
```

```
; left-of defined
; right-of defined
; numbered? defined
=> #t
=> #f
=> #t
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox at `/lab/little-schemer`.

### Mechanical Walkthrough

- `((atom? aexp) (number? aexp))` — **tree recursion's base case,
  reapplied** (Lesson 04): once a piece of the expression is a bare
  atom rather than a further nested list, the only question left is
  whether that atom is actually a number.
- `(and (numbered? (left-of aexp)) (numbered? (right-of aexp)))` —
  **tree recursion, reappearing** (Lesson 04) — recurse into both
  halves independently, same as `rember*`, combined here with `and`
  (Lesson 00) instead of `cons` or `+`: the whole expression is only
  valid if *both* sides are.
- The second test, `(numbered? '(1 add bolt))` — `bolt` is an atom but
  not a number, so `(numbered? (right-of aexp))` returns `#f`, and
  `and` short-circuits (Lesson 03's `or` reapplied in its sibling
  form) the whole thing to `#f`.

### Connecting Sentence

`numbered?` only checks whether an expression has the right shape —
it doesn't compute anything. The next Concept Unit reuses the same
accessors to actually read an expression and produce its value.

---

## Concept Unit 2: `value` — Reading the Data to Decide What to Compute

### The Problem

Given a valid expression, actually compute the number it represents.
The hard part: `(1 add (2 mul 3))` and `(1 mul (2 add 3))` have the
exact same *shape* — three items, an operator in the middle — but need
completely different arithmetic. Something has to *read* the operator
symbol itself, out of the data, to decide which real procedure to
call.

### Isolated Example — Data Choosing a Behavior

```scheme
(define describe-op
  (lambda (op)
    (cond
      ((eq? op 'add) 'addition)
      (else 'multiplication))))
(describe-op 'add)
(describe-op 'mul)
```

```
; describe-op defined
=> addition
=> multiplication
```

Nothing recursive here — this isolates just the new piece: `op`, a
plain symbol, is compared with `eq?` to decide which branch runs.
`describe-op` only reports a *name* back; `value`, next, uses this
exact same comparison to decide which *procedure* — `plus` or `x` — to
actually call.

### The Real Procedure — `value`

```scheme
(define plus
  (lambda (n m)
    (cond
      ((zero? m) n)
      (else (add1 (plus n (sub1 m)))))))
(define x
  (lambda (n m)
    (cond
      ((zero? m) 0)
      (else (plus n (x n (sub1 m)))))))
(define left-of
  (lambda (aexp) (car aexp)))
(define op-of
  (lambda (aexp) (car (cdr aexp))))
(define right-of
  (lambda (aexp) (car (cdr (cdr aexp)))))
(define value
  (lambda (nexp)
    (cond
      ((number? nexp) nexp)
      ((eq? (op-of nexp) 'add)
       (plus (value (left-of nexp)) (value (right-of nexp))))
      (else
       (x (value (left-of nexp)) (value (right-of nexp)))))))
(value '(1 add (2 mul 3)))
(value 5)
(value '((2 mul 3) add (4 mul 5)))
```

```
; plus defined
; x defined
; left-of defined
; op-of defined
; right-of defined
; value defined
=> 7
=> 5
=> 26
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox.

### Mechanical Walkthrough

- `((number? nexp) nexp)` — **base case.** A bare number evaluates to
  itself — the second test, `(value 5)`, is this clause alone, no
  recursion at all.
- `((eq? (op-of nexp) 'add) (plus (value (left-of nexp)) (value
  (right-of nexp))))` — **first appearance of a piece of data
  selecting which procedure runs**, full mechanism proven above
  (`describe-op`). `(op-of nexp)` reads the operator symbol out of the
  expression; if it's `'add`, `value` calls `plus` — not `x` — on the
  *evaluated* results of both sides.
- `(value (left-of nexp))` / `(value (right-of nexp))` — **`value`
  calling itself on both halves before combining them** — tree
  recursion again (Lesson 04), needed because either side might itself
  be a further nested expression, not yet a plain number. The third
  test proves this: both `(2 mul 3)` and `(4 mul 5)` are evaluated
  down to plain numbers, `6` and `20`, *before* the outer `add`
  combines them into `26`.
- `else` — reached whenever the operator isn't `'add`; in this
  lesson's version, that only ever means `'mul`, so `x` runs
  unconditionally. Exercise 2, below, adds a third real operator,
  which means this clause can no longer assume "not add" means
  "multiply."

### CS Lens

**Reading a piece of data to decide which real operation to perform
on the rest of it is the core mechanism behind every interpreter or
compiler ever written.** Also recognized in: a real programming
language's interpreter, reading each AST node's type (`+`, `*`, an
`if`) and dispatching to the matching evaluation rule; a bytecode
virtual machine reading one opcode at a time and jumping to the
handler for that exact instruction; a calculator app reading which
button was pressed and running the matching arithmetic; a database
engine reading a query plan node's type and deciding whether it's a
filter, a join, or a sort. `value` is a tiny, real instance of exactly
this — not an analogy for it.

### SE Lens

**What happens when a third operator needs adding — subtraction, say?**
Exercise 2, below, asks you to do exactly this. The real cost, worth
naming honestly: adding a new operator means editing `value` itself,
inserting one more `cond` clause before the catch-all `else` — every
operator this evaluator will ever support has to be written directly
into this one procedure's body. That's a real limitation, not just an
inconvenience: a version supporting *many* operators, each defined
somewhere else entirely and simply plugged in, would need a
fundamentally different design — passing the actual operation in as a
value, the way Lesson 06's collectors passed in "what to do with the
answer." Lesson 08 picks up exactly that idea.

### Connecting Sentence

`value` proves the whole mechanism: read a piece of data, use it to
choose a real procedure, recurse into the rest first so that procedure
always receives plain numbers, never further expressions.

---

## Connect the Pieces

One nested expression, `'((1 add 2) mul (3 add 1))`, through both
procedures: `(numbered? '((1 add 2) mul (3 add 1)))` confirms the
shape is valid — `#t` — before anything gets computed. `(value '((1
add 2) mul (3 add 1)))` then evaluates it for real: `(1 add 2)`
becomes `3`, `(3 add 1)` becomes `4`, and the outer `mul` combines
them — `12`. Two procedures sharing the same three accessors from
Concept Unit 1, one confirming the data is well-formed, the other
reading it to actually compute something.

## What Breaks Without This

Check the wrong position for the operator — `(left-of nexp)` instead
of `(op-of nexp)`:

```scheme
(define left-of
  (lambda (aexp) (car aexp)))
(define right-of
  (lambda (aexp) (car (cdr (cdr aexp)))))
(define plus
  (lambda (n m)
    (cond
      ((zero? m) n)
      (else (add1 (plus n (sub1 m)))))))
(define x
  (lambda (n m)
    (cond
      ((zero? m) 0)
      (else (plus n (x n (sub1 m)))))))
(define value-broken
  (lambda (nexp)
    (cond
      ((number? nexp) nexp)
      ((eq? (left-of nexp) 'add)
       (plus (value-broken (left-of nexp)) (value-broken (right-of nexp))))
      (else
       (x (value-broken (left-of nexp)) (value-broken (right-of nexp)))))))
(value-broken '(1 add (2 mul 3)))
```

```
; left-of defined
; right-of defined
; plus defined
; x defined
; value-broken defined
=> 6
```

**No crash, and a wrong number that could easily pass an
under-tested glance.** `(left-of nexp)` is a *number* — `1`, or `2`,
or whatever the left side evaluates to — never the symbol `'add`, so
that `eq?` check is always `#f`, no matter what the real operator
actually was. Every single expression, everywhere, silently falls
through to the `else` branch and gets multiplied instead of using its
real operator — `1 + 6` quietly becomes `1 × 6` and comes back `6`
instead of `7`. Restore `op-of`, and confirm the real answer, `7`,
comes back.

## Exercises

1. Predict, before running, what `(value '((1 add 2) mul (3 add
   4)))` returns. Then run it and check.
2. Add real subtraction: define `minus` (Lesson 05, if you haven't
   kept it defined already), add a `((eq? (op-of nexp) 'sub) (minus
   ...))` clause to `value` *before* its `else`, and confirm `(value
   '(10 sub (2 mul 3)))` returns `4`.
3. Now that `value` supports three operators, is the `else` clause
   still safe to assume "multiply"? What would happen if `(op-of
   nexp)` were some fourth symbol entirely, one none of the clauses
   check for? Try it and see what actually happens, rather than only
   predicting.
4. Open *The Little Schemer* to Chapter 6 and work its own expression
   and evaluator questions in the sandbox.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, what `(op-of nexp)` is for,
      and why `value` checks it before deciding whether to call `plus`
      or `x`.
- [ ] You can explain why `value` calls itself on both `(left-of
      nexp)` and `(right-of nexp)` before combining them, rather than
      combining them directly.
- [ ] You completed the Exercises above, including adding real
      subtraction support to `value`.
- [ ] You're working the book's Chapter 6 in the sandbox.
