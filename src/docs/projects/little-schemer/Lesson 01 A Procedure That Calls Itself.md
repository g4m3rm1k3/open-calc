# Lesson 01: A Procedure That Calls Itself

**What you will build:** two small predicates — `lat?`, which answers
"is every top-level item in this list an atom?", and `member?`, which
answers "does this list contain a given atom?" Both are original
examples built to teach exactly what the opening territory of *The
Little Schemer* teaches: a procedure with no loop construct at all can
still walk a list of any length, by calling *itself* on a smaller
piece of that list until it reaches a case simple enough to answer
directly.

**What you need to know first:** Lesson 00 — prefix expressions,
`quote`, `car`/`cdr`/`cons`, `null?`/`atom?`/`eq?`, and
`lambda`/`define`/`cond`. Nothing here uses a construct Lesson 00
didn't already cover, except `or`, introduced below.

**Terms introduced in this lesson:**
- **Recursion** — a procedure whose own body calls itself, on a
  smaller piece of the same input, until it reaches a case simple
  enough to answer without calling itself again. This dialect has no
  `for` or `while` loop at all — recursion is the *only* way any
  procedure in this series repeats an action across a list.
- **Base case** — the case in a recursive procedure that answers
  directly, with no further recursive call. Without one, a recursive
  procedure calls itself forever, exactly as an infinite loop would.
- **Recursive case** — the case that calls the procedure again, on a
  smaller piece of the input than it was just called with — the part
  that has to make real progress toward the base case, every time, or
  the base case is never reached.

**Objects and methods this lesson uses:**
- **`or`**
  - *What it is:* a special form combining any number of expressions,
    true if at least one of them is.
  - *Implementation:* `(or e1 e2 ...)` evaluates its arguments left to
    right, returning the first one that isn't `#f` immediately,
    without evaluating any argument after it. If every argument is
    `#f`, it returns `#f`.
  - *Its use:* `member?`, in Concept Unit 2 below, uses `or`'s
    left-to-right stop to check "is this the item?" before ever
    recursing further.
- **`begin`**
  - *What it is:* a special form for running more than one expression
    in a row where only one expression is allowed.
  - *Implementation:* `(begin e1 e2 ... en)` evaluates each argument
    in order, purely for whatever side effect it has (like `display`),
    and returns whatever the *last* one evaluated to.
  - *Its use:* Exercise 2, below, uses it to run a `display` and a
    real check inside a single `or` branch.

**Everything else this lesson's code uses, not this lesson's own
subject but still relied on — all reappearing from Lesson 00, brief
restatement only:**
- **`car`, `cdr`, `cons`** — take a list apart / build one; Lesson 00,
  Concept Unit 2.
- **`null?`, `atom?`, `eq?`** — is this the empty list? / is this not
  a pair? / are these the same atom?; Lesson 00, Concept Unit 2.
- **`cond`, `else`** — Scheme's multi-branch conditional; Lesson 00,
  Concept Unit 3.
- **`lambda`, `define`** — build a procedure / give it a name; Lesson
  00, Concept Unit 3.
- **`add1`** — adds one to a number; Lesson 00, Concept Unit 1. Used
  only in this lesson's throwaway warm-up example, not in `lat?` or
  `member?` themselves.

---

## Concept Unit 1: Recursion — Walking a List Without a Loop

### The Problem

`atom?` (Lesson 00) answers the question for one value at a time. But
*The Little Schemer* immediately asks a harder version: given a whole
list, is *every* top-level item in it an atom? A list can be any
length — one item, three, three hundred — and `atom?` alone has no way
to check "all of them." Nothing in Lesson 00 lets you write a
procedure whose body doesn't already know, in advance, how many items
it needs to check.

### A Quick Review, Not a New Lab

`atom?` itself was already given a full isolated lab in Lesson 00,
Concept Unit 2 — no new lab needed here, per the Concept Isolation
Rule. As a reminder, in this series' own toolbox vocabulary rather
than a fresh unrelated example:

```scheme
(atom? 'wrench)
(atom? '(wrench bolt))
(atom? 7)
```

```
=> #t
=> #f
=> #t
```

A bare symbol or a number is an atom; a list — even a list containing
only atoms — is not.

### Isolated Example — Recursion, in Its Own Right

Before building `lat?` for real, a smaller throwaway example proves
recursion works at all, using nothing `lat?` itself needs later:

```scheme
(define count-items
  (lambda (l)
    (cond
      ((null? l) 0)
      (else (add1 (count-items (cdr l)))))))
(count-items '(wrench bolt gasket))
(count-items '())
```

```
; count-items defined
=> 3
=> 0
```

`count-items` calls *itself*, by name, inside its own body — this is
called **recursion**. `(null? l) 0` is the **base case**: the empty
list has zero items, answered directly, no further call. The `else`
clause is the **recursive case**: it calls `count-items` again, on
`(cdr l)` — one item shorter than `l` — and adds `1` for the item
`(car l)` that recursive call didn't count. Every call either hits the
base case or shrinks `l` by one `cdr`, so the chain of calls always
eventually reaches `'()` and stops.

### Discarding the Throwaway Example

`count-items` has done its job — proving recursion, with a base case
and a shrinking recursive case, actually works — and is discarded now.
It doesn't appear again in this series; `lat?`, built next, is the
real, kept procedure.

### Where This Lives

**Reference Source:** no reference counterpart — *The Little Schemer*
has no reference implementation to port from; this is an original
companion example built to teach the same recursive shape the book's
own opening chapter teaches, using this series' own toolbox examples
instead of the book's.

**Where this lives:** nowhere permanent — run it here, or in the
sandbox at `/lab/little-schemer`, where it's worth keeping defined
for the rest of Concept Unit 1.

### The Real Procedure — `lat?`

```scheme
(define lat?
  (lambda (l)
    (cond
      ((null? l) #t)
      ((atom? (car l)) (lat? (cdr l)))
      (else #f))))
(lat? '(wrench bolt gasket))
(lat? '(wrench (bolt gasket)))
(lat? '())
```

```
; lat? defined
=> #t
=> #f
=> #t
```

### Mechanical Walkthrough

- `(cond ((null? l) #t) ((atom? (car l)) (lat? (cdr l))) (else #f))` —
  three clauses. `(null? l) #t` is the **base case**: an empty list
  has every top-level item an atom, vacuously, so the answer is `#t`.
  `(atom? (car l)) (lat? (cdr l))` is the **recursive case**: if the
  first item is an atom, the answer depends entirely on whether the
  *rest* of the list is also all atoms — so `lat?` calls itself on
  `(cdr l)` to find out. `else #f` — reached only when the first item
  is *not* an atom (it's itself a list), which immediately means "no,
  not every top-level item is an atom" — no recursive call needed,
  since one failure is enough to answer the whole question.
- `(lat? (cdr l))` — **first appearance of a procedure calling
  itself.** Written exactly like calling any other procedure — `car`,
  `cons` — because from the language's point of view, it *is* exactly
  that: `lat?` is a name, bound to a procedure, and nothing stops a
  procedure's own body from looking up and calling its own name, the
  same as any other name in scope.
- `'(wrench bolt gasket))`, `'(wrench (bolt gasket))`, `'()` — three
  test cases, chosen specifically to hit all three `cond` clauses
  across the three calls: an all-atoms list, a list whose second item
  is itself a list, and the base case directly.

### Execution Trace

Tracing `(lat? '(wrench (bolt gasket)))` — the case that returns `#f`:

```
Call 1: l = (wrench (bolt gasket))
  → (null? l) is #f — not the base case
  → (atom? (car l)) = (atom? 'wrench) = #t — recursive case
  → calls (lat? (cdr l)), i.e. (lat? '((bolt gasket)))

Call 2: l = ((bolt gasket))
  → (null? l) is #f — not the base case
  → (atom? (car l)) = (atom? '(bolt gasket)) = #f — not the recursive
    case either
  → else: returns #f directly

Call 1 returns exactly what Call 2 returned: #f
```

Two calls deep, not three or thirty, because the second item — a
list, not an atom — answers the whole question immediately; `lat?`
never even reaches the third item, `gasket`, or needs to.

### CS Lens

**A procedure defined in terms of a smaller call to itself, with a
case simple enough to answer directly stopping the chain, is called
recursion.** Also recognized in: a file system's own directory
listing (a folder contains files and other folders, each of which may
contain more folders); parsing a nested expression like `(2 + (3 *
4))`, where evaluating the outer expression requires first evaluating
whatever's nested inside it; a Russian nesting doll, opened one layer
at a time until reaching the solid one that doesn't open further. Once
recognized, recursion turns out to be the natural shape for anything
built by nesting a smaller version of itself inside a larger one —
which is exactly what a list already is: an item, `cons`ed onto a
smaller list, all the way down to `'()`.

### SE Lens

**Why does `lat?` check `(null? l)` first, before checking `(atom?
(car l))`?** Clause order in `cond` is meaningful (Lesson 00's SE
Lens) — first match wins. If the empty-list check came *after* the
atom check, `(atom? (car l))` would run against an empty `l`, and
`(car '())` is an error (Lesson 00 never showed this case, since
`car`/`cdr` were only ever demonstrated on non-empty lists). Ordering
the base case first isn't a style preference — it's the only ordering
that avoids asking `(car l))` a question `l` can't answer. This is a
general rule for every recursive procedure in this series: the base
case's test must be checked before anything that assumes the input is
non-empty.

### Connecting Sentence

`lat?` answers a yes/no question about a whole list by recursing down
it one item at a time; the next Concept Unit builds `member?`, which
recurses the same way but has to make a *choice* between two different
reasons to stop early.

---

## Concept Unit 2: `member?` — Recursion Combined With `or`

### The Problem

`lat?` (Concept Unit 1) only ever has one reason to stop and answer
`#t`: reaching the end of the list. `member?` — does this list contain
a given atom? — has *two* separate reasons to answer `#t`: finding the
item right now, at the front of the list, or finding it somewhere
further in via a recursive call. Nothing shown so far combines two
different true-conditions into a single yes/no answer.

### Isolated Example — `or`

```scheme
(or #f #t)
(or #f #f)
(or #t (car '()))
```

```
=> #t
=> #f
=> #t
```

`or` returns `#t` (or, more precisely, whatever its first non-`#f`
argument evaluated to) the moment it finds one true argument, without
evaluating what comes after. The third line proves this concretely:
`(car '())` is a real error (Concept Unit 1's SE Lens) — if `or`
evaluated *both* arguments regardless, this would error. It returns
`#t` instead, because `#t` came first and `or` never even looked at
`(car '())`. This is called **short-circuiting**: stopping as soon as
the answer is already known, not evaluating the rest just because it's
there.

### The Real Procedure — `member?`

```scheme
(define member?
  (lambda (a lat)
    (cond
      ((null? lat) #f)
      (else (or (eq? (car lat) a) (member? a (cdr lat)))))))
(member? 'bolt '(wrench bolt gasket))
(member? 'nut '(wrench bolt gasket))
```

```
; member? defined
=> #t
=> #f
```

### Where This Lives

**Reference Source:** no reference counterpart — original companion
content, same as Concept Unit 1.

**Where this lives:** nowhere permanent — run it here, or in the
sandbox, where `member?` is worth keeping defined alongside `lat?` for
the Exercises below.

### Mechanical Walkthrough

- `(cond ((null? lat) #f) (else ...))` — **recursion, reappearing**
  (Concept Unit 1's hard concept) — same base-case-first shape as
  `lat?`, but the base case here answers `#f`: an empty list plainly
  cannot contain `a`.
- `(or (eq? (car lat) a) (member? a (cdr lat)))` — **first appearance
  of `or` in real use**, full treatment above. Two ways to be true,
  checked left to right: `(eq? (car lat) a)` — is the *first* item the
  one we're looking for? — or, only if that's `#f`, `(member? a (cdr
  lat))` — is it somewhere in the *rest* of the list? `or`'s
  short-circuit means the recursive call only happens when it's
  actually needed — the moment the front item matches, `member?`
  returns `#t` immediately, without recursing any further.
- `(member? a (cdr lat))` — **recursion, reappearing.** Same shape as
  `lat?`'s `(lat? (cdr l))`: call the same procedure, on one item
  less, making progress toward the base case exactly the same way.

### Connecting Sentence

`lat?` and `member?` are both built from the exact same skeleton —
`cond`, a base case checked first, a recursive case that shrinks the
list by one `cdr` — the shape essentially every procedure in *The
Little Schemer*'s opening chapters takes. Later procedures change what
the base case returns and what the recursive case combines it with;
the skeleton itself does not change.

---

## Connect the Pieces

One list, followed through both procedures:
`'(wrench (bolt gasket))`. `lat?` walks it (Concept Unit 1): checks
`wrench` — an atom, recurse; checks `(bolt gasket)` — not an atom,
answer `#f` immediately, two calls deep. Now ask a different question
of a different, flatter list, `'(wrench bolt gasket)`: does it contain
`bolt`? `member?` walks it (Concept Unit 2): checks `wrench` against
`bolt` — no match, recurse; checks `bolt` against `bolt` — match,
`or` short-circuits, answer `#t`, two calls deep, same shape as
`lat?`'s own trace.

## What Breaks Without This

Delete `lat?`'s base case, leaving only the recursive and `else`
clauses:

```scheme
(define lat-broken?
  (lambda (l)
    (cond
      ((atom? (car l)) (lat-broken? (cdr l)))
      (else #f))))
(lat-broken? '(wrench bolt gasket))
```

```
; lat-broken? defined
=> [error] car: expects a non-empty list, got ()
```

Without `(null? l) #t` checked first, the recursion eventually reaches
`l = '()` — and instead of stopping, tries `(atom? (car l))`, calling
`car` on the empty list, which errors exactly as Concept Unit 1's SE
Lens predicted. Restore the base case, and confirm it succeeds again.

## Exercises

1. Open the sandbox at `/lab/little-schemer` and define both `lat?`
   and `member?` there. Test `lat?` on a list containing a number
   (`'(wrench 7 gasket)`) — predict the answer before running it, then
   check.
2. Trace `(member? 'gasket '(wrench bolt gasket))` by hand, the same
   way Concept Unit 1's Execution Trace did for `lat?` — how many
   calls deep does it go before finding a match? Then confirm it for
   real, using `begin` to run a `display` alongside each check:
   ```scheme
   (define member?
     (lambda (a lat)
       (cond
         ((null? lat) #f)
         (else (or (begin (display 'checking) (newline) (eq? (car lat) a))
                   (member? a (cdr lat)))))))
   (member? 'gasket '(wrench bolt gasket))
   ```
   Count the `checking` lines it prints, and confirm that count matches
   your hand trace.
3. Open *The Little Schemer* to its opening chapter and work its own
   questions about atoms and lists of atoms in the sandbox — you now
   have every tool the book assumes: `car`, `cdr`, `cons`, `null?`,
   `atom?`, `eq?`, `cond`, `lambda`, `define`, `or`, and recursion
   itself.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, why `lat?` checks `(null? l)`
      before `(atom? (car l))`, and what breaks if that order is
      reversed.
- [ ] You can trace `lat?` or `member?` on a short list by hand,
      naming which `cond` clause fires on each call.
- [ ] You completed the Exercises above.
- [ ] You've started working the book's own opening-chapter questions
      in the sandbox, using `lat?` and `member?` as your first two
      real building blocks.
