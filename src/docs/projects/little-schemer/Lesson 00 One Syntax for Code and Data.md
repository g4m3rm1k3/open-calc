# Lesson 00: One Syntax for Code and Data

**What you will build:** nothing project-shaped — this lesson is a primer,
not a build. *The Little Schemer* teaches recursion through a
question-and-answer dialogue and deliberately never stops to explain
Scheme's own syntax first; it assumes you can already read `(car '(a b
c))` before the questions start. This lesson is that missing stop:
prefix expressions, quoting, and writing your own named procedures —
just enough Scheme to walk into Chapter 1 able to read every line the
book shows you.

**What you need to know first:** nothing — this is the first lesson in
the series.

**Terms introduced in this lesson:**
- **S-expression** — short for "symbolic expression," the one syntax
  shape Scheme uses for everything: a parenthesized list whose first
  element says what to do with the rest. There is no separate syntax
  for "a function call" versus "a piece of data" — the same shape
  serves both, which is exactly the problem Concept Unit 2 below
  exists to untangle.
- **Atom** — anything that isn't a list: a number, or a symbol like
  `wrench`. The opposite of an atom, in this dialect, is a pair — a
  list built by joining things together, covered in Concept Unit 2.
- **Symbol** — a bare name, like `wrench` or `+`, used either as a
  piece of data (a label) or as the name of something to look up and
  run, depending entirely on where it appears — the exact ambiguity
  quoting exists to resolve.
- **REPL** — "Read-Eval-Print Loop": type an expression, the
  environment reads it, evaluates it, and prints the result, then
  waits for the next one. The sandbox at `/lab/little-schemer` is a
  REPL; every runnable code block in this lesson is a one-shot version
  of the same idea.

**Objects and methods this lesson uses:**
- **`+`, `add1`, `sub1`**
  - *What it is:* this dialect's basic arithmetic procedures. `add1`
    and `sub1` are the ones *The Little Schemer* actually leans on —
    it treats "add one" and "subtract one" as the atomic units of
    counting, building everything numeric from those two.
  - *Implementation:* `+` takes any number of numeric arguments and
    sums them; `add1`/`sub1` each take exactly one number and return
    it plus or minus one.
  - *Its use:* Concept Unit 1's first isolated example, below.
- **`quote`**
  - *What it is:* a special form — it looks like a procedure call but
    doesn't evaluate its argument the way one would.
  - *Implementation:* `(quote x)` returns `x` completely unevaluated,
    exactly as written. `'x` is shorthand for `(quote x)` — the reader
    expands one into the other before evaluation ever happens, so they
    are the same thing, not two features.
  - *Its use:* every quoted list in this lesson and every lesson after
    it — `'(a b c)`, `'wrench` — uses this shorthand form.
- **`cons`, `car`, `cdr`**
  - *What it is:* the three procedures every list in this dialect is
    ultimately built and taken apart with.
  - *Implementation:* `cons` takes two values and joins them into a
    pair; `car` returns the first thing in a pair; `cdr` returns
    everything after the first thing.
  - *Its use:* Concept Unit 2's isolated examples, below — and, from
    here on, essentially every piece of Scheme code this series
    writes.
- **`null?`, `atom?`, `eq?`**
  - *What it is:* three questions Scheme can ask about a value.
  - *Implementation:* `null?` takes one value and returns `#t` exactly
    when it's the empty list `'()`; `atom?` returns `#t` exactly when
    its argument is not a pair and not `'()`; `eq?` takes two values
    and returns `#t` when they're the same atom.
  - *Its use:* Concept Unit 2's isolated examples, and, starting in
    Lesson 01, the base case of every recursive procedure this series
    writes.
- **`lambda`**
  - *What it is:* the special form that builds a procedure — a value
    that can be called, the same way `5` is a value that can be added.
  - *Implementation:* `(lambda (params...) body...)` returns a
    procedure taking exactly those parameters, running its body when
    called.
  - *Its use:* Concept Unit 3, below — every procedure this series
    ever defines is a `lambda` given a name.
- **`define`**
  - *What it is:* the special form that gives a name to a value.
  - *Implementation:* `(define name value-expr)` evaluates
    `value-expr` once and binds the result to `name` in the current
    environment, so later expressions can refer to `name` directly.
  - *Its use:* Concept Unit 3, below — almost always paired with
    `lambda`, to name a procedure.
- **`cond`**
  - *What it is:* Scheme's multi-branch conditional — the closest
    equivalent to a chain of `if`/`else if` in a language with that
    syntax.
  - *Implementation:* `(cond (test1 result1) (test2 result2) ... (else
    resultN))` evaluates each test in order and runs the result
    expression next to the first one that isn't `#f`; `else` matches
    unconditionally, and conventionally comes last.
  - *Its use:* Concept Unit 3's `sign` example, below — and, from
    Lesson 01 onward, the backbone of every recursive procedure the
    book builds.

---

## Concept Unit 1: Prefix Expressions

### The Problem

In most languages you're used to, an operator sits *between* its
operands — `2 + 3`. Scheme has no such rule, and no operators in that
sense at all: every operation, arithmetic included, is written the
same way everything else is written — a parenthesized list with the
thing to do listed first, followed by its arguments.

### Isolated Example

```scheme
(+ 2 3)
```

Run it, in the sandbox or by clicking Run on this block:

```
=> 5
```

Nested calls read the same way, worked from the inside out:

```scheme
(add1 (add1 5))
```

```
=> 7
```

This proves the whole rule: `(add1 (add1 5))` means "call `add1` on
the result of calling `add1` on `5`" — no different in kind from `(+ 2
3)` meaning "call `+` on `2` and `3`." Every single Scheme expression
you will ever read, in this series or in the book, has this exact
shape: **a parenthesized list, first element first.** This uniform
shape is called **prefix notation** — the operation always comes
first, never between or after its arguments.

### Where This Lives

**Reference Source:** no reference counterpart — this is an original
primer, not a port of an existing implementation.

**Where this lives:** nowhere permanent. Every code block in this
series is runnable in place — click Run, or retype it in the sandbox
at `/lab/little-schemer`. There is no project file to edit.

### Mechanical Walkthrough

- `(+ 2 3)` — **first appearance.** `+` is the operation, `2` and `3`
  are its arguments; the whole parenthesized list is one call.
- `(add1 (add1 5))` — **first appearance of nesting.** The inner `(add1
  5)` is evaluated first, producing `6`; the outer `add1` then runs on
  that result, producing `7`. Nesting is not a separate feature from a
  single call — it's the same rule (evaluate the list, first element
  first) applied recursively to whichever arguments are themselves
  lists.

### CS Lens

**Writing an operation before its operands, rather than between or
after them, is called prefix notation** (also, in older literature on
this exact convention, Polish notation). Also recognized in: RPN
calculators (which use the *reverse* of this — operands first, the
mirror image of Scheme's choice); `printf`-style function calls in
almost every language, which are prefix notation for everything except
arithmetic; a compiler's own internal representation of `2 + 3`, which
is usually prefix internally even in a language whose surface syntax
is infix. Scheme is unusual only in applying prefix notation
*everywhere*, arithmetic included, instead of carving out an
exception for it the way most languages do.

### Connecting Sentence

Every expression from here on — quoting, defining, conditionals — is
still just this one shape: a parenthesized list, first element first.

---

## Concept Unit 2: Quote — Data That Looks Like Code, Held Still

### The Problem

Try running this:

```scheme
(a b c)
```

```
=> [error] Unbound variable: a
```

This is the ambiguity Terms Introduced flagged above: `(a b c)` has the
exact same shape as `(add1 5)` — a parenthesized list, first element
first — so this environment tries to treat `a` as a procedure to call
on `b` and `c`. There's no procedure named `a`, so it fails. But `(a b
c)` might not have been meant as a call at all — it might have been
meant as *data*: a three-item list, full stop. Nothing about the shape
alone tells this environment which one you meant.

### Isolated Example

```scheme
'(a b c)
```

```
=> (a b c)
```

This is the fix: `'` (shorthand for the `quote` special form named in
Terms Introduced) tells the environment "don't evaluate this — hand it
back exactly as written." `'(a b c)` is a real, three-item list, held
still, never treated as a call. This is called **quoting**.

### Taking Lists Apart and Putting Them Together

```scheme
(car '(a b c))
(cdr '(a b c))
(cons 'a '(b c))
```

```
=> a
=> (b c)
=> (a b c)
```

`car` returns the first item of a list; `cdr` returns everything after
the first item; `cons` builds a new pair by joining a first item onto
the front of an existing list. `cons`, `car`, and `cdr` are not
convenience functions layered on top of some other list type — in this
dialect, a list *is* nothing more than pairs `cons` built, chained
together, ending in the empty list `'()`. `car` and `cdr` are how you
ask a pair "what's your first half?" and "what's your second half?"

### Asking Questions About Values

```scheme
(null? '())
(atom? 'a)
(atom? '(a b))
```

```
=> #t
=> #t
=> #f
```

```scheme
(eq? 'a 'a)
(eq? 'a 'b)
```

```
=> #t
=> #f
```

### Where This Lives

**Reference Source:** no reference counterpart — original primer
content.

**Where this lives:** nowhere permanent, same as Concept Unit 1 — run
these directly, here or in the sandbox.

### Mechanical Walkthrough

- `'(a b c)` — **first appearance of quote's shorthand form**, full
  treatment above (Objects and methods).
- `(car '(a b c))` / `(cdr '(a b c))` — **first appearance of `car`
  and `cdr`**, full treatment above. Note that `car`/`cdr` are called
  on the *quoted* list — `'(a b c)` is evaluated first (to the list
  itself, since quoting stops further evaluation), and only then does
  `car` run on that result.
- `(cons 'a '(b c))` — **first appearance of `cons`**, full treatment
  above. Both arguments are quoted: `'a`, a single quoted symbol, and
  `'(b c)`, a quoted two-item list.
- `(null? '())`, `(atom? 'a)`, `(atom? '(a b))`, `(eq? 'a 'a)`, `(eq?
  'a 'b)` — **first appearance of `null?`, `atom?`, and `eq?`**, full
  treatment above.

### CS Lens

**Code and data sharing one uniform syntax — so that "data" can be
handed to `quote` and "code" is just the same shape evaluated instead
of quoted — is a property called homoiconicity.** Also recognized in:
every Lisp-family language (Scheme, Common Lisp, Clojure, Racket) by
design; more loosely, in any format that can represent both a program
and its own data equally well, like JSON representing a config file
that a JavaScript program can also treat as a plain object. Most
languages keep "source code" and "the data the program manipulates" in
two visibly different representations — a Java class file and a Java
`ArrayList` don't look anything alike. Scheme's choice to make them
look identical, distinguished only by whether `quote` is present, is
the single design decision this whole Concept Unit exists to make
visible.

### Connecting Sentence

Quoting lets you hand the environment a list as inert data; the next
Concept Unit uses `lambda` and `define` to hand it a *procedure* as a
value instead — the other half of "everything here is just a value."

---

## Concept Unit 3: Naming Your Own Procedures

### The Problem

Every procedure used so far — `add1`, `car`, `cons` — already existed.
Nothing yet lets you build a new one of your own and give it a name to
call later, the way *The Little Schemer* expects you to do starting in
its very first chapter.

### Isolated Example — a Procedure Without a Name

```scheme
((lambda (x) (add1 x)) 5)
```

```
=> 6
```

`(lambda (x) (add1 x))` builds a procedure — call it with one argument
`x`, and it runs `(add1 x)`. Wrapping that whole thing in an outer
pair of parens with `5` after it *calls* the procedure `lambda` just
built, immediately, with `5` as `x`. This proves `lambda` produces a
real, callable value — this is called a **first-class procedure**: a
procedure is a value, exactly the way `5` or `'(a b c)` are values,
and can be built, held, and used the same way.

### Giving It a Name

```scheme
(define add2
  (lambda (x)
    (add1 (add1 x))))
(add2 5)
```

```
; add2 defined
=> 7
```

`define` takes the procedure `lambda` built and binds it to the name
`add2`, so `(add2 5)` can call it later without rebuilding it inline
each time — exactly the shape every procedure in *The Little Schemer*,
and every procedure this series writes from Lesson 01 on, takes:
`(define name (lambda (params) body))`.

### Choosing Between Branches

```scheme
(define sign
  (lambda (n)
    (cond
      ((zero? n) 'zero)
      ((< n 0) 'negative)
      (else 'positive))))
(sign 5)
(sign -3)
(sign 0)
```

```
; sign defined
=> positive
=> negative
=> zero
```

### Where This Lives

**Reference Source:** no reference counterpart — original primer
content.

**Where this lives:** nowhere permanent — try these directly here or
in the sandbox. Unlike the earlier two units, `add2` and `sign` are
worth keeping around in the sandbox specifically, since the sandbox's
environment persists across entries — define them there once, and
they stay callable for the rest of your session.

### Mechanical Walkthrough

- `((lambda (x) (add1 x)) 5)` — **first appearance of `lambda`**, full
  treatment above (Objects and methods). `x` is a parameter name,
  scoped to the body of this one `lambda` only.
- `(define add2 (lambda (x) ...))` — **first appearance of `define`**,
  full treatment above.
- `(cond ((zero? n) 'zero) ((< n 0) 'negative) (else 'positive))` —
  **first appearance of `cond`**, full treatment above. Three clauses:
  the first two pair a test with a result, the third uses `else` to
  catch everything neither test matched. `zero?` and `<` are ordinary
  procedures, not special forms — `(zero? n)` and `(< n 0)` are called
  exactly like `(add1 x)` was, each returning `#t` or `#f` for `cond`
  to check.
- `'zero`, `'negative`, `'positive` — **reappearance of quote**, from
  Concept Unit 2 — each is a quoted symbol, returned as plain data,
  not evaluated as a call.

### SE Lens

**Why does `cond` check its tests top to bottom and stop at the first
match, instead of, say, checking all of them and picking the most
specific?** Top-to-bottom, first-match evaluation means clause order
is meaningful — a broader test placed before a narrower one can hide
the narrower one entirely. The real cost: nothing in `cond`'s own
syntax stops you from writing `((> n -100) 'positive)` before the
`(zero? n)` clause and silently getting the wrong branch every time,
since the first match wins regardless of whether a later clause would
have matched more precisely. The alternative — checking every clause
and choosing the "best" match — would remove that footgun, but at the
cost of a more expensive, harder-to-predict evaluation rule; `cond`
trades a small sharp edge for a rule simple enough to trace by eye,
top to bottom, every time.

### Connecting Sentence

`lambda`, `define`, and `cond` are the entire toolkit *The Little
Schemer* uses to build every procedure in the book — nothing in
Lesson 01 or beyond introduces a fourth way to define something.

---

## Connect the Pieces

One value, followed end to end: `'(a b c)` (Concept Unit 2) is a
quoted list — inert data. `(car '(a b c))` takes it apart, returning
the atom `a` (Concept Unit 2). Wrap that whole idea in a named
procedure — `(define first-of (lambda (l) (car l)))` — and
`(first-of '(a b c))` calls it, returning the same `a`, now reached
through a procedure built with `lambda` and named with `define`
(Concept Unit 3), instead of a bare `car` call. Every later lesson in
this series is this same small set of moves — quote, take apart,
recombine, name it — used on progressively less trivial lists.

## What Breaks Without This

Delete the quote from `(car '(a b c))`, leaving `(car (a b c))`:

```scheme
(car (a b c))
```

```
=> [error] Unbound variable: a
```

`(a b c)` is evaluated *before* `car` ever runs on it — the same
failure Concept Unit 2 opened with, now nested one level deeper.
Restore the quote, and confirm it succeeds again.

## Exercises

1. Write an expression using only `add1`, `sub1`, and nesting (no `+`)
   that computes `5 + 3`. Run it and confirm it prints `8`.
2. Predict, before running, what `(cdr (cdr '(a b c)))` returns — then
   run it and check.
3. Write and `define` a procedure `both-atoms?` taking two arguments,
   returning `#t` only when both are atoms. Using only `cond` and
   `atom?` (nest a second `cond` inside the first clause's result
   instead of reaching for a combining operator this lesson hasn't
   covered), confirm `(both-atoms? 'a 'b)` returns `#t` and
   `(both-atoms? 'a '(b c))` returns `#f`.
4. Open the sandbox at `/lab/little-schemer`, `define` `add2` and
   `sign` from Concept Unit 3 there, then call each with a few
   different numbers without redefining them — confirming the
   environment really does persist across entries.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, why `(a b c)` errors but
      `'(a b c)` doesn't.
- [ ] You can state what `car`, `cdr`, and `cons` each do, without
      looking.
- [ ] You wrote at least one `define`/`lambda` procedure of your own
      that wasn't copied directly from this lesson.
- [ ] You completed the Exercises above.
- [ ] You have *The Little Schemer* open to Chapter 1, and the sandbox
      open in another tab or window, ready to go.
