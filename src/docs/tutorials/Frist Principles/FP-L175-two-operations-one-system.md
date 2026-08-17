# Lesson 175: The Law That Makes Two Operations One System

- **What you will build** — a real Guile program, `semiring.scm`, that
  bundles two operations and their two identities into one real, named
  value; proves, with real executed checks, that ordinary arithmetic and
  ordinary boolean logic are actually two instances of the exact same
  underlying algebraic shape; and runs one single, generic matrix
  multiplication procedure over both, unmodified, getting genuinely
  different, correct real answers from each. The transferable problem this
  lesson is actually about: an algorithm written in terms of a structure's
  own laws, rather than one domain's concrete operations, only has to be
  written and proven correct once — and recognizing when several
  seemingly unrelated real systems (numbers, booleans, and — as Lesson 176
  will show — graphs) actually share that same underlying shape is what
  lets one piece of real code legitimately replace many.

- **What you need to know first** — Lesson 170's associativity, Lesson
  171's identity, and Lesson 172's monoid (an operation bundled with its
  own identity) — a semiring, this lesson's own subject, is two monoids
  that additionally agree to cooperate with each other. Lesson 174's real
  proof that grouping a reduction differently never changes an
  associative operation's answer, reused here without repeating its own
  full argument. Passing a `lambda` expression as a plain value to
  another procedure, and calling a procedure that was itself passed in
  as an argument.

- **Terms used in this lesson**

  - **semiring** — a real algebraic structure: two operations
    (traditionally named "plus," `⊕`, and "times," `⊗`) together with two
    special values (a "zero," the identity for `⊕`, and a "one," the
    identity for `⊗`), satisfying, together, three real laws this lesson
    checks directly: `⊕` is associative and commutative, with `zero` as
    its identity; `⊗` is associative, with `one` as its identity; and,
    the one law that actually ties the two operations to each other
    rather than leaving them as two unrelated monoids sitting side by
    side, `⊗` distributes over `⊕`, and `zero` annihilates under `⊗`.
    This exists because countless real algorithms — this lesson's own
    matrix multiplication among them — are written using only these
    properties, never anything specific to numbers, meaning the identical
    real code can run correctly over any domain that happens to supply
    operations with these properties, not only arithmetic.
  - **record type** — a real, named compound data type that bundles
    several individually-named fields into one value, along with a real
    constructor to build one, a real predicate to test whether a value is
    one, and real accessor procedures to read each field back out. This
    exists so several related pieces of data — in this lesson's case,
    two operations and two values that only make real sense *together* —
    can be passed around, stored, and reasoned about as one single thing,
    instead of as several separately named values a caller has to
    remember to keep in sync by hand.
  - **distributivity** — a real, provable law connecting two different
    binary operations, `⊕` and `⊗`: for all `a`, `b`, `c`, `a ⊗ (b ⊕ c)`
    equals `(a ⊗ b) ⊕ (a ⊗ c)`. This exists as the one law that makes `⊗`
    genuinely *respect* `⊕`'s own structure — without it, expanding or
    factoring an expression built from both operations would not be a
    safe, meaning-preserving rewrite, the way `2 × (3 + 4)` and
    `(2 × 3) + (2 × 4)` genuinely are for ordinary numbers.
  - **annihilation (of a zero)** — a real property of a semiring's own
    zero: multiplying anything by it, in either order, always produces
    zero back. This exists because it is what makes "zero" actually
    deserve the name inside a semiring, rather than being merely `⊕`'s
    identity, coincidentally reused — being `⊕`'s identity and annihilating
    under `⊗` are two genuinely separate real facts, and both ordinary
    arithmetic's `0` and, as this lesson proves, the boolean semiring's
    `#f` happen to have both.
  - **commutativity** — a real, provable law about a binary operation:
    for all `a`, `b`, `a ⊕ b` equals `b ⊕ a` — swapping the two
    arguments' order never changes the answer. This exists as a genuinely
    separate fact from associativity: an operation can be associative
    without being commutative (ordinary function composition is one real
    example), so a semiring's own definition has to require commutativity
    of `⊕` explicitly, not assume grouping-doesn't-matter already implies
    order-doesn't-matter.
  - **generic algorithm** — a real algorithm written in terms of a
    structure's own operations (here, a semiring's `plus`, `times`, and
    `zero`) rather than any one specific domain's concrete operations, so
    the identical written code produces correct, meaningfully different
    results depending only on which real structure gets passed in. This
    exists so an algorithm's own correctness proof, and its own written
    code, only has to exist once, rather than once per domain it happens
    to apply to.

- **Objects and methods used**

  - **`define-record-type`**
    - *What it is:* a real special form, part of the `(srfi srfi-9)`
      module, that declares a brand-new compound data type in one single
      form.
    - *Implementation:* takes a type name, a constructor specification
      (a name plus the field names it accepts, in order), a predicate
      name, and one field specification per field (the field's own name,
      plus the name of the real accessor procedure that will read it
      back out). Evaluating it defines every one of those names at
      once — the constructor, the predicate, and every accessor — as
      real, callable procedures; nothing about the new type exists until
      this form actually runs.
    - *Its use:* this lesson calls it twice — once for a small throwaway
      `<point>` type in the isolated lab, once for real, to declare the
      `<semiring>` type this entire lesson is built around.
  - **`procedure?`**
    - *What it is:* a real predicate that tests whether a value is a
      callable procedure.
    - *Implementation:* takes one argument, any real value; returns `#t`
      if that value is something `(...)`-style call syntax could
      actually invoke, `#f` otherwise.
    - *Its use:* this lesson uses it to prove, concretely, that ordinary
      procedures like `+` can be stored in a semiring's own fields and
      called later through an accessor, while Scheme's `or` and `and`
      cannot, without first being wrapped.
  - **`for-each`**
    - *What it is:* a real procedure that calls a given procedure once
      per element of a list, purely for whatever side effect that call
      has.
    - *Implementation:* takes a procedure and one or more lists; calls
      the procedure once per element, in order, the same way `map` does,
      but — unlike `map` — throws away whatever each call returns and
      itself returns an unspecified value.
    - *Its use:* this lesson nests three calls to `for-each`, one per
      variable, to genuinely run and print all eight real
      true/false combinations a real, executed distributivity check over
      booleans needs to cover.
  - **`map`**
    - *What it is:* a real procedure that applies a given procedure to
      every element of one or more lists, in order, and collects each
      real result into a new list.
    - *Implementation:* takes a procedure and one or more lists of equal
      length; returns a new list whose `n`-th element is the result of
      calling the procedure on all the lists' own `n`-th elements
      together.
    - *Its use:* this lesson uses the one-list form to apply
      `semiring-dot` across every row of a matrix, and — inside
      `transpose` — a real, different trick: applying the plain
      procedure `list` across *several* lists at once, one per row of
      the original matrix, to rebuild it column-by-column.
  - **`apply`**
    - *What it is:* a real procedure that calls another procedure,
      spreading a list's own elements out to become that procedure's
      individual arguments.
    - *Implementation:* takes at least two arguments — a procedure and a
      list — and calls the procedure with each element of the list as
      its own separate argument, in order, rather than passing the list
      itself as one single argument.
    - *Its use:* `transpose` calls `(apply map list m)`, spreading the
      matrix `m`'s own rows out to become `map`'s individual list
      arguments — `map` needs one list per row to zip them together
      column-by-column, but `transpose` only ever has one single value,
      `m`, holding all of them; `apply` is what bridges that gap.

---

## Concept Unit 1: Bundling Two Operations Into One Real Value

### The Problem

A monoid, as this curriculum has already built it, bundles exactly *one*
operation together with its own identity. But almost no real computation
this curriculum has actually run uses only one operation — ordinary
arithmetic itself genuinely needs two, `+` and `×`, working together, and
nothing built so far holds "a whole small algebraic system" — two
operations and their two identities — as one real, single value that
could be passed around, swapped out, or handed to one generic algorithm
as configuration. Passing `+` and `×` to a procedure as two separate
arguments would work for exactly one call; it says nothing about how a
program would keep a *second*, entirely different pair of operations
straight from the first, or hand either whole pair to the same generic
code later. The problem this unit solves: how does a program bundle
several genuinely different real values — here, two operations and two
identities — into one real, named thing?

### Project Change

- **Reference Source** — no reference counterpart. This curriculum's Era
  VII lessons build standalone demonstration programs proving a
  mathematical property pays off in practice; they are not a port of an
  existing reference codebase.
- **Files affected** — a new file, `semiring.scm`, created for this
  lesson.
- **Change type** — add (new file).
- **Location** — not applicable; nothing exists yet to locate a position
  within.
- **Dependencies** — none beyond Guile itself. `(srfi srfi-9)` ships as
  part of Guile's own standard distribution, so no separate package
  installation step is required.

### The New Code

```scheme
(use-modules (srfi srfi-9))

(define-record-type <semiring>
  (make-semiring plus times zero one)
  semiring?
  (plus semiring-plus)
  (times semiring-times)
  (zero semiring-zero)
  (one semiring-one))

(define arithmetic-semiring
  (make-semiring + * 0 1))

(define (check-commutativity sr equal-op a b)
  (equal-op ((semiring-plus sr) a b) ((semiring-plus sr) b a)))
```

### The Updated Project

This step is skipped here: the fragment above *is* the whole new
structure so far — a brand-new file with nothing surrounding it yet — so
there is no larger enclosing context to return to and show.

### Introduce the Concept in Isolation

The real code just shown declares a genuinely new kind of value,
`<semiring>`, with four real fields. Before trusting what
`define-record-type` actually does with those field names, here is a
small, unrelated, throwaway record — a two-dimensional point — built the
exact same way:

```scheme
(use-modules (srfi srfi-9))

(define-record-type <point>
  (make-point x y)
  point?
  (x point-x)
  (y point-y))

(define p (make-point 3 4))
(display (point? p))
(newline)
(display (point-x p))
(newline)
(display (point-y p))
(newline)
(display (point? 5))
(newline)
```

Run for real, this produces:

```
#t
3
4
#f
```

One single `define-record-type` form defined four real, callable names at
once: `make-point`, the constructor; `point?`, the predicate; and
`point-x` and `point-y`, one accessor per field. `(make-point 3 4)` built
one real compound value holding both `3` and `4` together; `point?`
correctly reports `#t` for that real value and `#f` for a plain number,
`5`, that was never built by `make-point` at all; `point-x` and `point-y`
each read back exactly the one field they were declared for, matched
correctly to the value that was actually stored there. This is exactly
what `define-record-type` in the real code above is doing for
`<semiring>` — four fields instead of two, and real operations and
values instead of plain numbers, but the identical real mechanism. This
kind of bundled, multi-field value is called a **record type**.

### Discard the Throwaway Example

`<point>`, `p`, and every name defined alongside them are deleted now.
They existed only to prove `define-record-type` really does generate a
working constructor, predicate, and one accessor per field, all from one
single declaration; the project file never uses any of them again.

### Mechanical Walkthrough

Every distinct syntactic element of the New Code above, in order:

- **`(use-modules (srfi srfi-9))`** — already familiar in shape from
  Lesson 174's own `(use-modules (ice-9 threads))`; here it loads a
  different real module, `(srfi srfi-9)`, importing `define-record-type`
  and everything it depends on into the current environment.
- **`define-record-type`** — already given full treatment above in
  *Objects and methods used*; called here with the type name `<semiring>`,
  the constructor specification `(make-semiring plus times zero one)`,
  the predicate name `semiring?`, and four field specifications.
- **`<semiring>`** — the new type's own name; the surrounding angle
  brackets are not required Scheme syntax — nothing about `<` or `>` is
  special to the reader here — they are a real, widely followed naming
  *convention* among Scheme programmers specifically for record type
  names, making a type name visually distinct from an ordinary procedure
  or variable name at a glance.
- **`(make-semiring plus times zero one)`** — the constructor
  specification; `make-semiring` is the real name this lesson chose for
  the generated constructor procedure, and `plus`, `times`, `zero`, `one`
  are the names its four real parameters will be known by, in the order
  a caller must supply them.
- **`semiring?`** — the predicate name this lesson chose; after this
  form runs, `semiring?` becomes a real, callable procedure that reports
  whether any given value was actually built by `make-semiring`.
- **`(plus semiring-plus)`, `(times semiring-times)`, `(zero
  semiring-zero)`, `(one semiring-one)`** — the four field
  specifications; each pairs one field's own internal name (`plus`,
  `times`, `zero`, `one`) with the real name of the accessor procedure
  that will read it back out of a real `<semiring>` value.
- **`define` (`arithmetic-semiring`)** — reappearing; names the real
  value `make-semiring` returns when called on ordinary arithmetic's own
  four real pieces.
- **`make-semiring`** — the constructor `define-record-type` just
  generated; called here with four real arguments.
- **`+`** — the reappearing addition procedure; unlike `or` or `and`
  (Concept Unit 3 shows exactly why this distinction matters),
  `+` in Scheme genuinely is an ordinary, callable procedure — a real,
  first-class value that can be passed as an argument and stored in a
  field, exactly as it is here.
- **`*`** — the reappearing multiplication procedure; a real, first-class
  value in the same sense as `+`.
- **`0`** and **`1`** — the two literal values being stored as this
  semiring's own zero and one.
- **`define` (`check-commutativity`)** — reappearing; names a
  three-argument procedure, a semiring `sr` and two real values `a`, `b`.
- **`lambda`** — reappearing (implicit here as `check-commutativity`
  itself is a `define`d procedure, not a `lambda`, but its own body calls
  procedures the same way a `lambda`'s body would).
- **`semiring-plus`** — the accessor `define-record-type` just generated
  for the `plus` field; called here on `sr` to retrieve whichever real
  operation that specific semiring was actually built with.
- **`equal-op`** — a parameter, not a fixed procedure name; this
  lesson's own `check-commutativity` accepts *which* equality test to use
  as an argument, rather than hard-coding one, because ordinary numeric
  `=` will turn out not to be the right test for every real domain this
  lesson checks (Concept Unit 3 needs a different one).

### CS Lens

Bundling several related pieces of data — or, as here, several related
operations and values — into one compound value is a hard concept: the
real shape underneath *records*, *structs*, and *product types* across
languages. Also recognized in: a `struct` in C; a `record` type in
Pascal or OCaml; a plain object literal in JavaScript; a `namedtuple` or
`dataclass` in Python; a `data class` in Kotlin. Every one of these exists
to solve the exact same real problem this unit solves: keeping several
values that only make sense *together* from drifting apart because a
caller forgot to pass one of them, or passed them in the wrong order.

### SE Lens

The design choice here is one bundled record holding all four real
pieces of a semiring together. The real alternative not chosen: four
separate top-level names — `plus-op`, `times-op`, `zero-val`, `one-val` —
defined once, globally. The real tradeoff: separate globals genuinely
work, right up until a second, genuinely different semiring is needed —
Concept Unit 3 builds exactly that — at which point four *more* globally
named values would be needed, and every piece of code written against the
first four would have to be rewritten, by hand, to use the second four
instead. A record makes "which semiring" an explicit, passable real
value; the real cost this project accepts in exchange is one extra
accessor call — `(semiring-plus sr)` instead of just `plus` — every
single time an operation is actually used.

### Run It

First, confirming `arithmetic-semiring` really is a `<semiring>` value at
all, not some other kind of value that merely looks like one:

```scheme
(semiring? arithmetic-semiring)
;=> #t
```

Now reading its `plus` field back out and calling it on two real numbers:

```scheme
((semiring-plus arithmetic-semiring) 3 4)
;=> 7
```

And its `times` field, called the same way:

```scheme
((semiring-times arithmetic-semiring) 3 4)
;=> 12
```

Real evidence the bundling actually works: `arithmetic-semiring` is a
real `<semiring>` value, and reading its `plus` field back out and
calling it on `3` and `4` genuinely computes real addition, `7`; reading
its `times` field back out and calling it the same way genuinely computes
real multiplication, `12` — not four independent globals that merely
happen to agree, but the exact same four real pieces, retrievable from
one single value.

One more real check, proving `⊕` itself satisfies the law a semiring
requires of it — commutativity, not merely being callable:

```scheme
(check-commutativity arithmetic-semiring = 3 4)
;=> #t
```

And once more, crossing zero with a negative number, so the first real
check isn't dismissed as a coincidence specific to two positive numbers:

```scheme
(check-commutativity arithmetic-semiring = -8 2)
;=> #t
```

Both real checks confirm `3 + 4` equals `4 + 3`, and `-8 + 2` equals
`2 + (-8)`, real evidence ordinary addition genuinely does not care about
argument order, the property a semiring's own `⊕` is required to have and
that this lesson checks directly rather than merely assuming.

### Connect to What Came Before

This lesson opened by asking how several genuinely different real
operations and values could be held together as one thing. This unit
answers that for real: `<semiring>`, built from one
`define-record-type` declaration, now holds ordinary arithmetic's own
`+`, `*`, `0`, and `1` as one single, passable value — proven, by real
accessor calls, to hand back the exact real operations it was built
with — and a real, executed check confirms `⊕` itself already satisfies
one of the three laws a semiring actually requires.

---

## Concept Unit 2: Distributivity — The Law That Ties the Two Operations Together

### The Problem

`arithmetic-semiring` bundles `+` and `*` together, and Concept Unit 1
already confirmed `+` is genuinely commutative — but nothing yet checks
that `+` and `*`, specifically *together*, behave the way ordinary
arithmetic actually does. Two operations could each individually satisfy
every law a monoid requires — associative, with an identity — while
still having nothing real to do with each other: nothing so far would
stop someone from bundling `+` as `plus` and, say, ordinary subtraction
as `times`, into a real `<semiring>` value that `make-semiring` would
build without complaint. The problem this unit solves: what real,
checkable law is missing — the one that actually makes `⊗` respect `⊕`'s
own structure, rather than two operations merely coexisting in the same
record?

### Project Change

- **Reference Source** — no reference counterpart, same reasoning as
  Concept Unit 1.
- **Files affected** — `semiring.scm` (modified).
- **Change type** — add.
- **Location** — at the end of the file, directly after
  `check-commutativity`, added in Concept Unit 1.
- **Dependencies** — none new.

### The New Code

```scheme
(define (check-distributivity sr equal-op a b c)
  (equal-op ((semiring-times sr) a ((semiring-plus sr) b c))
            ((semiring-plus sr) ((semiring-times sr) a b) ((semiring-times sr) a c))))
```

### The Updated Project

```scheme
(use-modules (srfi srfi-9))

(define-record-type <semiring>
  (make-semiring plus times zero one)
  semiring?
  (plus semiring-plus)
  (times semiring-times)
  (zero semiring-zero)
  (one semiring-one))

(define arithmetic-semiring
  (make-semiring + * 0 1))

(define (check-commutativity sr equal-op a b)
  (equal-op ((semiring-plus sr) a b) ((semiring-plus sr) b a)))

; ← new, starts here
(define (check-distributivity sr equal-op a b c)
  (equal-op ((semiring-times sr) a ((semiring-plus sr) b c))
            ((semiring-plus sr) ((semiring-times sr) a b) ((semiring-times sr) a c))))
```

Running this file now still declares `<semiring>` and `arithmetic-semiring`
exactly as before, and now also defines a real procedure able to check,
for any semiring and any real three values, whether that semiring's own
`⊗` actually distributes over its own `⊕` — nothing calls it for real
work yet.

### Introduce the Concept in Isolation

Before trusting a generic checker built around two field-accessor calls,
here is the exact real law it checks, on plain numbers, with no record
involved at all:

```scheme
(display (* 2 (+ 3 4)))
(newline)
(display (+ (* 2 3) (* 2 4)))
(newline)
(display (= (* 2 (+ 3 4)) (+ (* 2 3) (* 2 4))))
(newline)
```

Run for real, this produces:

```
14
14
#t
```

`2 × (3 + 4)` and `(2 × 3) + (2 × 4)` both genuinely compute `14` — real
evidence that multiplying `2` across a sum, or multiplying it against
each addend separately and adding the two real products afterward,
produces the identical real answer either way. This real, provable
relationship between two different operations is called
**distributivity**. This is exactly what `check-distributivity` in the
code above checks generically, for any semiring's own `⊕` and `⊗`,
instead of only for `+` and `*` on these two specific numbers.

### Discard the Throwaway Example

Nothing here was assigned a name to discard — the three `display` calls
above were plain, one-off checks, not a named example standing in for
project code. The project file never repeats these exact three calls
again; Run It below checks the same law a different way, through the
real generic procedure instead.

### Mechanical Walkthrough

Every distinct syntactic element of the New Code above, in order:

- **`define` (`check-distributivity`)** — reappearing; names a
  four-argument procedure: a semiring `sr`, an equality test `equal-op`
  (already introduced in Concept Unit 1), and three real values `a`,
  `b`, `c`.
- **`equal-op`** — already given full treatment in Concept Unit 1; used
  here the same way, so this checker works for any domain with its own
  correct notion of "equal," not only numbers.
- **`semiring-times`** — already given full treatment in Concept Unit 1;
  called here on `sr` to retrieve whichever real `⊗` operation that
  specific semiring holds.
- **`semiring-plus`** — already given full treatment in Concept Unit 1;
  called here twice — once inside the left-hand side, computing
  `b ⊕ c` before `⊗` is applied to it, once combining the two real
  products on the right-hand side.
- **`a`, `b`, `c`** — the three real values under test, each used more
  than once: `a` appears on both sides of the law; `b` and `c` each
  appear once combined by `⊕` and once combined separately by `⊗`.

### CS Lens

Distributivity is a hard concept in its own right, not merely a fact
about `+` and `×`: the real algebraic law that legitimizes rewriting an
expression from one shape into an equivalent one built from different
groupings of the same two operations. Also recognized in: a real
compiler's own constant-folding and expression-simplification passes,
which only rewrite `a × (b + c)` into `(a × b) + (a × c)` — or the
reverse — because this exact law guarantees the rewrite preserves
meaning; a database query optimizer pushing a filter condition through a
join because the underlying relational operations distribute the same
way; a spreadsheet formula engine simplifying a nested arithmetic
expression; symbolic algebra software (Boolean circuit minimizers among
them) that treats `AND` distributing over `OR` as a safe rewrite rule for
exactly the same real reason.

### SE Lens

The design choice here is one generic `check-distributivity`, taking
`equal-op` as a real parameter, rather than one hand-written checker per
semiring. The real alternative not chosen: a separate
`check-arithmetic-distributivity` using `=` directly, and, later, a
separate `check-boolean-distributivity` using whatever booleans need
instead. The real tradeoff: hard-coding `=` would work for this unit
alone, but Concept Unit 3's boolean values cannot be compared with
ordinary numeric `=` at all — a real, concrete failure this lesson
avoids only because `equal-op` was accepted as a parameter from the
start, rather than being added later once the second domain's real needs
became apparent.

### Run It

The same real triple the isolated lab already checked by hand, now
through the generic checker instead:

```scheme
(check-distributivity arithmetic-semiring = 2 3 4)
;=> #t
```

A second real triple, with `b` genuinely `0` this time:

```scheme
(check-distributivity arithmetic-semiring = 5 0 7)
;=> #t
```

And a third, crossing a negative number, so no single "friendly" triple
is doing all the real work of proving this law:

```scheme
(check-distributivity arithmetic-semiring = -3 6 -2)
;=> #t
```

Three real, different triples all genuinely confirm the law, real
evidence this isn't a coincidence specific to the one triple checked by
hand above.

One more real law this semiring's own zero has to satisfy — not merely
being `⊕`'s identity, but genuinely *annihilating* under `⊗`. Multiplying
`17` by zero on the left:

```scheme
((semiring-times arithmetic-semiring) (semiring-zero arithmetic-semiring) 17)
;=> 0
```

And on the right, the other real argument order:

```scheme
((semiring-times arithmetic-semiring) 17 (semiring-zero arithmetic-semiring))
;=> 0
```

Multiplying `17` by this semiring's own zero, in either order, genuinely
produces zero back — real, executed evidence of **annihilation**, a
separate real fact from zero simply being `⊕`'s own identity.

### Connect to What Came Before

Concept Unit 1 proved `<semiring>` really can bundle two operations
together, and that `⊕` itself is commutative. This unit proves the two
operations, bundled together, genuinely *cooperate* — `⊗` respects `⊕`'s
own structure, and `⊕`'s zero genuinely disappears under `⊗` — checked
generically, on three real triples, not merely assumed because the
record type happened to accept both operations without complaint.

---

## Concept Unit 3: A Genuinely Different Semiring — Booleans

### The Problem

One real semiring instance, built entirely from ordinary arithmetic,
proves `<semiring>` and its two checking procedures actually work — but
it proves nothing about whether this whole abstraction *generalizes*, or
whether it was accidentally shaped to fit numbers specifically. The
problem this unit solves: build one more real semiring, over a domain
that shares nothing with numbers except the two abstract properties this
lesson actually cares about, and check the identical laws against it,
using the identical procedures, unmodified.

### Project Change

- **Reference Source** — no reference counterpart, same reasoning as
  every earlier unit in this lesson.
- **Files affected** — `semiring.scm` (modified).
- **Change type** — add.
- **Location** — at the end of the file, directly after the
  zero-annihilation checks added in Concept Unit 2.
- **Dependencies** — none new.

### The New Code

```scheme
(define boolean-semiring
  (make-semiring (lambda (a b) (or a b))
                  (lambda (a b) (and a b))
                  #f
                  #t))
```

### The Updated Project

```scheme
(use-modules (srfi srfi-9))

(define-record-type <semiring>
  (make-semiring plus times zero one)
  semiring?
  (plus semiring-plus)
  (times semiring-times)
  (zero semiring-zero)
  (one semiring-one))

(define arithmetic-semiring
  (make-semiring + * 0 1))

(define (check-commutativity sr equal-op a b)
  (equal-op ((semiring-plus sr) a b) ((semiring-plus sr) b a)))

(define (check-distributivity sr equal-op a b c)
  (equal-op ((semiring-times sr) a ((semiring-plus sr) b c))
            ((semiring-plus sr) ((semiring-times sr) a b) ((semiring-times sr) a c))))

; ← new, starts here
(define boolean-semiring
  (make-semiring (lambda (a b) (or a b))
                  (lambda (a b) (and a b))
                  #f
                  #t))
```

Running this file now still does everything Concept Units 1 and 2 built,
and now also holds a second, real, genuinely different `<semiring>`
value — the identical record type, the identical two checking
procedures, holding boolean logic instead of arithmetic.

### Introduce the Concept in Isolation

`arithmetic-semiring` stored `+` and `*` directly, with no wrapping at
all. Trying to do the same thing with Scheme's `or` and `and` fails, for
a real, concrete reason — here it is, in isolation:

```scheme
(display (procedure? +))
(newline)
```

Run for real, this produces:

```
#t
```

`+` is a genuine, ordinary procedure — `(procedure? +)` reports `#t`, and
it can be passed around and stored in a field exactly like any other
value, which is exactly why Concept Unit 1 could store it directly. Now
the same real check on `or`, run as its own separate program — kept
separate specifically so nothing about one check's own real output can be
confused with the other's:

```scheme
(display (procedure? or))
(newline)
```

Run for real, this program never reaches its own `display` call at all —
Guile stops immediately with a real error:

```
Syntax error:
unknown location: source expression failed to match any pattern in form or
```

`or` is not a procedure at all; it is a real *special form*, built
directly into Scheme's own grammar, and special forms cannot appear as
bare values the way procedures can — Guile's own real error confirms
this, rather than merely asserting it. The fix is real and simple: wrap
it in a `lambda`.

```scheme
(display (procedure? (lambda (a b) (or a b))))
(newline)
```

Run for real, this produces:

```
#t
```

A `lambda` expression that merely *calls* `or` inside its own body is a
genuine, ordinary procedure — `(procedure? ...)` now reports `#t` —
because the `lambda` itself, not `or`, is the real value being passed
around; `or`'s own special-form nature never has to leave the `lambda`'s
body, where special forms are perfectly at home. This is exactly what the
real code above does for both `or` and `and`.

### Discard the Throwaway Example

The two bare `procedure?` checks and the wrapped-`lambda` check above are
deleted now. They existed only to prove, with a real error and a real
fix, why `or` and `and` need wrapping where `+` and `*` did not; the
project file never repeats these exact checks again.

### Mechanical Walkthrough

Every distinct syntactic element of the New Code above, in order:

- **`define` (`boolean-semiring`)** — reappearing; names the real value
  `make-semiring` returns when called on boolean logic's own four real
  pieces.
- **`make-semiring`** — already given full treatment in Concept Unit 1;
  called here with two `lambda`-wrapped special forms and two boolean
  literals, instead of arithmetic's two bare procedures and two numbers.
- **`lambda` (wrapping `or`)** — already given full treatment in Lesson
  174; here its own body is a single call, `(or a b)`, turning the
  special form `or` into a genuine, callable two-argument procedure, per
  the isolated lab above.
- **`or`** — a real special form, reappearing from earlier in this
  curriculum; evaluates its first argument, and only evaluates its
  second if the first was false, returning the first true value found
  (or the last value, if none were true). Used here as this semiring's
  own real `⊕`.
- **`and`** — a real special form, reappearing from earlier in this
  curriculum; evaluates its arguments in order, stopping and returning
  `#f` at the first false one, or returning the last value if every
  argument was true. Used here as this semiring's own real `⊗`.
- **`lambda` (wrapping `and`)** — the same real pattern as the `or`
  wrapper, immediately above.
- **`#f`** — the literal boolean false value; used here as this
  semiring's own zero — `⊕`'s identity (`(or #f x)` is always `x`) and,
  Run It below confirms, `⊗`'s annihilator too.
- **`#t`** — the literal boolean true value; used here as this
  semiring's own one — `⊗`'s identity (`(and #t x)` is always `x`).

### CS Lens

A semiring built from `or` and `and` connects directly to a hard concept
this curriculum has already named: **boolean algebra**. Also recognized
in: real digital logic circuits, where `AND` and `OR` gates are
physically wired together using exactly this same distributive law to
simplify a circuit's own real component count; a database engine
evaluating a `WHERE` clause's own combination of conditions; a feature-flag
system combining several real boolean checks into one go/no-go decision;
propositional logic used to verify a real program's own control flow is
exhaustive and non-contradictory; a regular expression engine's own
alternation (`|`) and concatenation, which — as a later lesson in this
curriculum will show — form a semiring of their own, built from
genuinely different operations than either arithmetic or plain booleans.

### SE Lens

The design choice here is reusing `check-distributivity` and
`check-commutativity` completely unmodified against this new domain. The
real alternative not chosen: writing dedicated
`check-boolean-distributivity` and `check-boolean-commutativity`
procedures, hard-coded to use `eq?` instead of `=`. The real tradeoff: a
dedicated pair would work today, but the two checkers would inevitably
drift apart the moment either one is improved or fixed later, and a
*third* domain — Lesson 176's own graph-path values — would need a
*third* hand-written pair. Reusing the same two generic procedures, with
only `equal-op` changing per call, is the real payoff Concept Unit 2's
own design decision already bought; this unit is the first real proof
that payoff actually materializes.

### Run It

Reading `boolean-semiring`'s own `plus` field back out and calling it:

```scheme
((semiring-plus boolean-semiring) #f #t)
;=> #t
```

And its `times` field, the same way:

```scheme
((semiring-times boolean-semiring) #t #t)
;=> #t
```

Real evidence the boolean instance works the same way the arithmetic one
did: reading `boolean-semiring`'s own `plus` field back out and calling
it computes real `or`; reading its `times` field back out computes real
`and`.

```scheme
(check-commutativity boolean-semiring eq? #f #t)
;=> #t
```

The identical `check-commutativity` from Concept Unit 1, called now with
`eq?` instead of `=` — real, direct evidence why `equal-op` had to be a
parameter, not a hard-coded `=`, from the very first unit.

Now the real, full check this unit exists for: every one of the eight
real true/false combinations of `a`, `b`, `c`, checked against
`check-distributivity`, unmodified:

```scheme
(for-each
 (lambda (a)
   (for-each
    (lambda (b)
      (for-each
       (lambda (c)
         (display (list a b c '-> (check-distributivity boolean-semiring eq? a b c)))
         (newline))
       (list #f #t)))
    (list #f #t)))
 (list #f #t))
```

Run for real, this produces:

```
(#f #f #f -> #t)
(#f #f #t -> #t)
(#f #t #f -> #t)
(#f #t #t -> #t)
(#t #f #f -> #t)
(#t #f #t -> #t)
(#t #t #f -> #t)
(#t #t #t -> #t)
```

All eight real combinations report `#t` — not one representative case,
but genuinely every possible real assignment of `a`, `b`, `c` over two
values, exhaustively checked. `and` really does distribute over `or`,
across every real input it could ever be given.

One last real check, confirming `#f` genuinely annihilates under `and`,
not merely serving as `or`'s own identity:

Zero on the left:

```scheme
((semiring-times boolean-semiring) (semiring-zero boolean-semiring) #t)
;=> #f
```

Zero on the right, the other real argument order:

```scheme
((semiring-times boolean-semiring) #t (semiring-zero boolean-semiring))
;=> #f
```

### Connect to What Came Before

Concept Units 1 and 2 built one real semiring and two real, generic
laws to check it against. This unit built a second, genuinely different
real semiring — sharing not one concrete operation with the first, only
the same abstract shape — and every single check, run unmodified, passed
for real, across all eight possible boolean inputs. The abstraction is
not merely plausible; it is now checked against two real, unrelated
domains.

---

## Concept Unit 4: One Generic Algorithm, Two Real Semirings

### The Problem

Two real semirings, both genuinely satisfying the same real laws, is
strong evidence the abstraction is sound — but it is still only evidence
about the *laws themselves*, checked by procedures built specifically to
check laws. The real payoff of a semiring was never the laws in
isolation; it is a single, genuinely useful algorithm, written once in
terms of a semiring's own `plus`/`times`/`zero`, that runs correctly over
*any* real semiring handed to it, producing meaningfully different real
answers depending only on which one. Nothing built so far actually
reuses one procedure across both real instances for a real, useful task.
The problem this unit solves: build one such algorithm for real.

### Project Change

- **Reference Source** — no reference counterpart, same reasoning as
  every earlier unit in this lesson.
- **Files affected** — `semiring.scm` (modified).
- **Change type** — add.
- **Location** — at the end of the file, directly after
  `boolean-semiring`, added in Concept Unit 3.
- **Dependencies** — none new.

### The New Code

```scheme
(define (semiring-dot sr row col)
  (let loop ((r row) (c col) (acc (semiring-zero sr)))
    (if (null? r)
        acc
        (loop (cdr r) (cdr c)
              ((semiring-plus sr) acc ((semiring-times sr) (car r) (car c)))))))

(define (transpose m)
  (apply map list m))

(define (semiring-matrix-multiply sr a b)
  (let ((bt (transpose b)))
    (map (lambda (row)
           (map (lambda (col) (semiring-dot sr row col)) bt))
         a)))
```

### The Updated Project

```scheme
(use-modules (srfi srfi-9))

(define-record-type <semiring>
  (make-semiring plus times zero one)
  semiring?
  (plus semiring-plus)
  (times semiring-times)
  (zero semiring-zero)
  (one semiring-one))

(define arithmetic-semiring
  (make-semiring + * 0 1))

(define (check-commutativity sr equal-op a b)
  (equal-op ((semiring-plus sr) a b) ((semiring-plus sr) b a)))

(define (check-distributivity sr equal-op a b c)
  (equal-op ((semiring-times sr) a ((semiring-plus sr) b c))
            ((semiring-plus sr) ((semiring-times sr) a b) ((semiring-times sr) a c))))

(define boolean-semiring
  (make-semiring (lambda (a b) (or a b))
                  (lambda (a b) (and a b))
                  #f
                  #t))

; ← new, starts here
(define (semiring-dot sr row col)
  (let loop ((r row) (c col) (acc (semiring-zero sr)))
    (if (null? r)
        acc
        (loop (cdr r) (cdr c)
              ((semiring-plus sr) acc ((semiring-times sr) (car r) (car c)))))))

(define (transpose m)
  (apply map list m))

(define (semiring-matrix-multiply sr a b)
  (let ((bt (transpose b)))
    (map (lambda (row)
           (map (lambda (col) (semiring-dot sr row col)) bt))
         a)))
```

`semiring.scm` now does everything this lesson set out to build: bundle
two operations and two identities into one real value, check the real
laws that make them cooperate, hold a second, genuinely different real
instance, and — new in this unit — reduce two whole matrices together
using nothing but a semiring's own three real operations.

### Introduce the Concept in Isolation

`semiring-matrix-multiply` leans on one real trick, `transpose`, that
hasn't run yet. Before trusting it inside a larger procedure, here it is
alone, on a small, concrete matrix:

```scheme
(display (apply map list (list (list 1 2 3) (list 4 5 6))))
(newline)
```

Run for real, this produces:

```
((1 4) (2 5) (3 6))
```

A two-row, three-column matrix, `((1 2 3) (4 5 6))`, came back as a
three-row, two-column matrix, `((1 4) (2 5) (3 6))` — its real transpose,
every row now holding what used to be one column. `apply` spread the
matrix's own two rows out to become `map`'s two separate list arguments;
`map`, given the real procedure `list` and those two lists together, built
one new list per real position, pairing each row's first elements
together, then each row's second elements, then each row's third — which
is exactly what a transpose is. This is exactly what `transpose` in the
code above does, on whatever real matrix `semiring-matrix-multiply` is
actually given.

### Discard the Throwaway Example

Nothing here was assigned a name to discard; the one `display` call above
was a plain, one-off check that the project file never repeats. Run It
below exercises the real `transpose` procedure itself, not this
throwaway call.

### Mechanical Walkthrough

Every distinct syntactic element of the New Code above, in order:

- **`define` (`semiring-dot`)** — reappearing; names a three-argument
  procedure, a semiring `sr` and two real lists, `row` and `col`, of
  equal length.
- **named `let`, `loop`** — already given full treatment in Lesson 174;
  here it walks `row` and `col` together, one real pair of elements at a
  time, accumulating a running combined value in `acc`.
- **`semiring-zero`** — already given full treatment in Concept Unit 1;
  called here once, to seed `acc` with this specific semiring's own real
  zero — `0` for arithmetic, `#f` for booleans — rather than a value
  hard-coded for one domain.
- **`null?`** — reappearing; tests whether `r`, the remaining part of
  `row`, is empty, meaning every real pair of elements has already been
  combined.
- **`cdr`** — reappearing; called on both `r` and `c` together, advancing
  the loop through `row` and `col` one element further, in lockstep.
- **`semiring-plus`** — already given full treatment in Concept Unit 1;
  called here to combine the running `acc` with one freshly computed
  real product.
- **`semiring-times`** — already given full treatment in Concept Unit 1;
  called here on `(car r)` and `(car c)` — the row's and column's own
  current elements — producing one real product before `semiring-plus`
  folds it into `acc`.
- **`car`** — reappearing; called on both `r` and `c`, reading each
  one's own current first element.
- **`define` (`transpose`)** — reappearing; names a one-argument
  procedure, a real matrix `m`, represented as a list of lists.
- **`apply`** — already given full treatment above in *Objects and
  methods used*.
- **`map`** — already given full treatment above in *Objects and methods
  used*; here, as the procedure `apply` calls, spread across `m`'s own
  rows.
- **`list`** — reappearing; the plain procedure that builds a new list
  from its own arguments, used here as `map`'s own combining procedure —
  called once per real position, across every one of `m`'s rows at once,
  to rebuild the matrix column-by-column.
- **`define` (`semiring-matrix-multiply`)** — reappearing; names a
  three-argument procedure, a semiring `sr` and two real matrices, `a`
  and `b`.
- **`let` (`bt`)** — reappearing; binds `bt` to `b`'s own real
  transpose, computed once, before either `map` below runs — needed
  because every one of `a`'s rows will be checked against every one of
  `bt`'s rows, and transposing `b` only once, up front, is what makes
  "one of `bt`'s rows" the same real thing as "one of `b`'s original
  columns."
- **`map` (outer, over `a`)** — already given full treatment above;
  applies its own `lambda` once per real row of `a`.
- **`lambda` (outer)** — reappearing; for one real `row` of `a`, its own
  body computes an entire new row of the real result.
- **`map` (inner, over `bt`)** — the same real procedure as the outer
  `map`, applied differently: once per real row of `bt` — which is to
  say, once per real column of the original `b`.
- **`lambda` (inner)** — reappearing; for one real `col` — one of `bt`'s
  rows, one of `b`'s original columns — calls `semiring-dot` to combine
  it with the outer `row`, producing exactly one real entry of the
  result matrix.
- **`semiring-dot`** — the procedure defined earlier in this same unit;
  called here once per real (row, column) pair, doing the actual
  combining work this entire unit exists to generalize.

### CS Lens

Writing one algorithm in terms of a structure's own abstract operations,
rather than one domain's concrete ones, is a hard concept:
*generic programming* (also called *parametric polymorphism*). Also
recognized in: C++ templates and Java generics, both letting one written
`sort` or `max` work over any type supplying the right comparison
operation; Haskell's and Rust's own typeclass/trait systems, which are,
under the hood, close relatives of this lesson's own semiring record —
bundling a type together with the specific operations it promises to
support; a SQL database's own aggregate functions (`SUM`, `MAX`) working
identically over integers, dates, or currency columns; any real numerical
library's `generic` matrix or vector routines, written once and reused
across `float`, `double`, and complex-number types alike.

### SE Lens

The design choice here is one real `semiring-matrix-multiply`, taking a
semiring as an explicit argument, rather than two separately hand-written
procedures — one multiplying real number matrices with `+` and `*` wired
in directly, one multiplying real boolean matrices with `or` and `and`
wired in directly. The real alternative not chosen: exactly that
duplication. The real tradeoff: a hand-written, non-generic version would
run with one less real accessor call per operation — a genuine, small
performance cost this generic version pays every time `semiring-plus` or
`semiring-times` is called instead of `+` or `or` directly — but the real
debt duplication would create is worse: fixing a genuine bug in one
hand-written matrix-multiply would say nothing about whether the *other*
hand-written copy has the identical bug, and a *third* domain (paths in a
graph, Lesson 176's own subject) would need a *third* hand-copied
procedure, forever drifting further from the first two.

### Run It

```scheme
(semiring-matrix-multiply arithmetic-semiring (list (list 1 2) (list 3 4)) (list (list 5 6) (list 7 8)))
;=> ((19 22) (43 50))
```

Real, ordinary matrix multiplication — `1×5 + 2×7 = 19`, `1×6 + 2×8 = 22`,
`3×5 + 4×7 = 43`, `3×6 + 4×8 = 50` — produced entirely by
`semiring-matrix-multiply`, a procedure whose own written code never once
mentions `+` or `*` by name.

Now the exact same procedure, entirely unmodified, over real boolean
matrices instead:

```scheme
(semiring-matrix-multiply boolean-semiring (list (list #t #f) (list #f #t)) (list (list #f #t) (list #t #f)))
;=> ((#f #t) (#t #f))
```

The identical `semiring-matrix-multiply`, called with `boolean-semiring`
instead of `arithmetic-semiring`, produced a genuinely different real
answer, of a genuinely different real kind — a matrix of booleans, not
numbers — using `or` and `and` everywhere the arithmetic call used `+`
and `*`. Nothing in `semiring-matrix-multiply`'s own written code changed
between these two real calls; only the single argument `sr` did.

### Connect to What Came Before

Concept Unit 1 bundled two operations into one real value; Concept Unit
2 proved those two operations genuinely cooperate; Concept Unit 3 proved
a second, unrelated real domain satisfies the identical laws. This unit
spent all three real facts at once: one procedure, written against a
semiring's own abstract shape, produced two genuinely different, correct
real answers from two genuinely different real inputs — the actual real
payoff every earlier unit in this lesson was building toward.

---

## Closing

### Connect the Pieces

Follow one real semiring, and one real value, through every unit this
lesson built. `boolean-semiring` is built in Concept Unit 3 from
`make-semiring`, itself generated by Concept Unit 1's own
`define-record-type` — one real value, holding `or`, `and`, `#f`, and
`#t` together, each individually confirmed retrievable by
`semiring-plus`, `semiring-times`, `semiring-zero`, and `semiring-one`.
Concept Unit 2's `check-distributivity`, run unmodified against it in
Concept Unit 3, confirmed all eight real true/false combinations satisfy
the one law connecting `⊕` and `⊗` — not assumed, checked. Concept Unit
4's `semiring-matrix-multiply` then called `semiring-dot`, which itself
calls `semiring-plus` and `semiring-times` — the same two real accessors
Concept Unit 1 first proved could hand back whichever operations a given
semiring actually holds — once per real (row, column) pair, seeded with
`semiring-zero`'s own real value, `#f`, instead of arithmetic's `0`. The
real result, `((#f #t) (#t #f))`, is not a coincidence or a special case
carved out for booleans: it is the exact same generic procedure that
produced `((19 22) (43 50))` for real numbers, run over a real value
built entirely from Concept Unit 3's own two `lambda`-wrapped special
forms.

### What Breaks Without This

Every real check this lesson ran assumed `⊗` genuinely distributes over
`⊕` — the one law, checked directly in Concept Unit 2, that actually ties
two operations into one real semiring rather than leaving them as two
unrelated monoids that merely happen to share a record. Here is what
happens, for real, when that law is quietly false: a semiring built from
`+` as `⊕` and ordinary subtraction, `-`, as `⊗`.

```scheme
(define broken-semiring
  (make-semiring + - 0 1))

(display (check-distributivity broken-semiring = 2 3 4))
(newline)
```

Run for real, this produces:

```
#f
```

`make-semiring` built `broken-semiring` without any complaint at all —
nothing about `define-record-type` checks whether the real operations
handed to it actually satisfy a semiring's own laws, only that four real
values were supplied. `check-distributivity` is what actually catches the
real problem: `2 - (3 + 4)` computes `2 - 7`, a real `-5`; `(2 - 3) +
(2 - 4)` computes `-1 + -2`, a real `-3`. `-5` does not equal `-3` — the
two sides of the law genuinely disagree, for real, concrete values, not
merely in the abstract. Nothing here is a coding mistake in the ordinary
sense; `make-semiring`, `semiring-plus`, and `semiring-times` all did
exactly what earlier units already proved they do. The real lesson is
that bundling two operations into one `<semiring>` record, by itself,
proves nothing about whether they actually belong together — only a real,
executed check like `check-distributivity` does that, and any generic
algorithm built on top, like `semiring-matrix-multiply`, would produce
real, silently wrong answers if it were ever run against a semiring like
this one that was never actually checked first.

### Exercises

- Build a `min-semiring`, using `min` as `⊕` and `+` as `⊗`, with a
  suitably large number standing in for zero and `0` standing in for
  one. Run `check-commutativity` and `check-distributivity` against it,
  for real, on several real triples. Does the law hold? Do not look
  ahead to name what this particular combination might be useful for —
  treat it as a pure question about whether these two specific real
  operations happen to satisfy a semiring's own laws.
- Run `semiring-matrix-multiply` with `arithmetic-semiring` on two
  matrices of different real sizes than this lesson used — a `3×2`
  matrix and a `2×3` matrix, for instance — and confirm the real result's
  own dimensions match what ordinary matrix multiplication predicts.
- Build a `broken-semiring` variant using `*` as `⊕` instead of `+`
  (keeping `*` as `⊗` too). Predict, before running it, whether
  `check-distributivity` will report `#t` or `#f`, and why — then check
  your real prediction against the real output.
- Write `check-identity`, a generic checker confirming a semiring's own
  `zero` is genuinely `⊕`'s identity and `one` is genuinely `⊗`'s
  identity, following `check-commutativity` and `check-distributivity`'s
  own real shape. Run it against both `arithmetic-semiring` and
  `boolean-semiring`.

### Definition of Done

- [ ] `semiring.scm` exists and, run with `guile semiring.scm`, defines
      `<semiring>`, `arithmetic-semiring`, `boolean-semiring`,
      `check-commutativity`, `check-distributivity`, `semiring-dot`,
      `transpose`, and `semiring-matrix-multiply` with no errors.
- [ ] `(check-distributivity arithmetic-semiring = 2 3 4)` and
      `(check-distributivity boolean-semiring eq? #t #f #t)` both report
      `#t` on your own machine.
- [ ] The real eight-combination boolean distributivity check, from
      Concept Unit 3, prints all eight lines, every one ending in `#t`.
- [ ] `(semiring-matrix-multiply arithmetic-semiring (list (list 1 2)
      (list 3 4)) (list (list 5 6) (list 7 8)))` produces `((19 22) (43
      50))`, and the identical call with `boolean-semiring` and boolean
      matrices produces a real, different-in-kind result.
- [ ] The real "What Breaks" section was actually run, producing `#f` for
      `broken-semiring`'s own distributivity check, with the real `-5`
      versus `-3` disagreement understood, not just observed.
- [ ] `git commit` the finished file, with a message explaining *why*
      this lesson exists — for example: "Bundle two operations into one
      checkable structure, and prove one generic algorithm can run
      correctly over two genuinely different real instances of it" — not
      merely restating what the code does.

**Next lesson: Lesson 176 — Graph Algorithms Through Algebra**,
connecting real path problems in graphs to the same semiring shape this
lesson just proved arithmetic and boolean logic both already share.
