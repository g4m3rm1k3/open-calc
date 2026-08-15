# Lesson 02: Building a New List, One Cons at a Time

**What you will build:** `rember` (remove an atom's first occurrence
from a list), `firsts` (pull the first item out of each pair in a list
of pairs), and `insertR`/`insertL` (splice a new atom in just after or
just before another). The transferable problem: `lat?` and `member?`
(Lesson 01) only ever answer a yes/no question. This lesson's four
procedures all answer a different kind of question — "give me back a
whole new list, changed in one specific way" — which needs a genuinely
different recursive shape, not just a different base case.

**What you need to know first:** Lesson 01 — recursion, base case,
recursive case, and the `lat?`/`member?` shape (`cond`, base case
checked first, a recursive case that shrinks the list by one `cdr`).
No new Scheme syntax appears in this lesson at all — every procedure
below is built entirely from `cons`, `car`, `cdr`, `null?`, `eq?`,
`cond`, `lambda`, and `define`, all already covered. What's new is a
*pattern*, not a construct.

**Terms introduced in this lesson:** none. This lesson is a new way of
combining already-taught pieces, not a new piece.

**Everything this lesson's code uses, all reappearing from Lessons 00
and 01 — brief restatement only:**
- **`cons`, `car`, `cdr`** — build a pair / take its two halves apart;
  Lesson 00, Concept Unit 2.
- **`null?`, `eq?`** — is this the empty list? / are these the same
  atom?; Lesson 00, Concept Unit 2.
- **`cond`, `else`** — Scheme's multi-branch conditional; Lesson 00,
  Concept Unit 3.
- **`lambda`, `define`** — build a procedure / name it; Lesson 00,
  Concept Unit 3.

---

## Concept Unit 1: `rember` — Keep, Recurse, Cons Back Together

### The Problem

`member?` (Lesson 01) answers "does this list contain `bolt`?" with
`#t` or `#f` — the list itself is untouched, thrown away as soon as
the answer is known. What if the thing you actually want is a *new*
list with `bolt` taken out? Nothing shown so far builds a list up as
a recursion runs — every procedure so far has only ever consumed one,
returning an atom or a boolean.

### Isolated Example — Just the Shape, Nothing Removed Yet

```scheme
(define copy-lat
  (lambda (lat)
    (cond
      ((null? lat) '())
      (else (cons (car lat) (copy-lat (cdr lat)))))))
(copy-lat '(wrench bolt gasket))
```

```
; copy-lat defined
=> (wrench bolt gasket)
```

`copy-lat` does nothing useful on its own — it just rebuilds an
identical copy of whatever list it's given. But it proves the new
shape: the base case returns `'()` instead of `#t`, and the recursive
case doesn't just call `copy-lat` and return whatever comes back — it
`cons`es the current item onto the front of that result first. This is
called **list-building recursion**: each call keeps its own item,
recurses on the rest, and reassembles the list on the way back out of
the recursion, one `cons` per call.

### Discarding the Throwaway Example

`copy-lat` has proven the shape and is discarded now — an exact copy
of a list is never actually useful on its own, and it doesn't appear
again in this series.

### Where This Lives

**Reference Source:** no reference counterpart — original companion
content, same as every unit so far.

**Where this lives:** nowhere permanent — run it here, or in the
sandbox at `/lab/little-schemer`.

### The Real Procedure — `rember`

```scheme
(define rember
  (lambda (a lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) a) (cdr lat))
      (else (cons (car lat) (rember a (cdr lat)))))))
(rember 'bolt '(wrench bolt gasket))
(rember 'nut '(wrench bolt gasket))
(rember 'wrench '(wrench wrench gasket))
```

```
; rember defined
=> (wrench gasket)
=> (wrench bolt gasket)
=> (wrench gasket)
```

### Mechanical Walkthrough

- `(cond ((null? lat) '()) ((eq? (car lat) a) (cdr lat)) (else (cons
  (car lat) (rember a (cdr lat)))))` — three clauses, base case first
  (Lesson 01's SE Lens: the empty-list check has to come before
  anything that assumes a non-empty list).
- `((eq? (car lat) a) (cdr lat))` — **first appearance of this
  specific answer shape**: found the match, so the "new list with it
  removed" is simply everything *after* it — `(cdr lat)`, no `cons`
  needed, because nothing needs re-adding here.
- `(cons (car lat) (rember a (cdr lat)))` — **list-building recursion,
  reapplied from `copy-lat`** — keep the current item (it isn't the
  one being removed), recurse on the rest, `cons` the kept item back
  onto whatever that recursive call returns.
- The third test, `(rember 'wrench '(wrench wrench gasket))` —
  removes only the *first* `wrench`, leaving the second one untouched
  in the result. The match clause fires on the very first call, before
  the second `wrench` is ever inspected — `rember` has no concept of
  "keep looking for more," only "stop at the first one."

### Execution Trace

Tracing `(rember 'gasket '(wrench bolt gasket))`:

```
Call 1: a = gasket, lat = (wrench bolt gasket)
  → (eq? 'wrench 'gasket) is #f — not the match clause
  → recursive case: (cons 'wrench (rember 'gasket '(bolt gasket)))

Call 2: a = gasket, lat = (bolt gasket)
  → (eq? 'bolt 'gasket) is #f — not the match clause
  → recursive case: (cons 'bolt (rember 'gasket '(gasket)))

Call 3: a = gasket, lat = (gasket)
  → (eq? 'gasket 'gasket) is #t — match clause
  → returns (cdr lat) = '()

Call 2 receives '() and returns (cons 'bolt '()) = (bolt)
Call 1 receives (bolt) and returns (cons 'wrench '(bolt)) = (wrench bolt)
```

Three calls deep before the match, then three `cons` calls unwinding
back out — each one re-attaching the item it kept, in order, as the
recursion returns.

### CS Lens

**Recursing down a structure while building a new one back up on the
way out is a shape recognized well beyond lists.** Also recognized in:
a recursive-descent parser building a syntax tree as it consumes
tokens; a directory-copy routine that recurses into subfolders and
reconstructs the tree as it returns; any "process this, keep the
result, and combine it with the results of everything smaller" pattern
— the general recursive shape functional languages call `map` or
`filter` when the transformation is regular enough to name once and
reuse, rather than hand-writing the recursion every time (a
generalization this series hasn't built yet, but the hand-written
version here is exactly what a `map`/`filter` implementation is doing
underneath).

### SE Lens

**Why does `rember` return a brand-new list instead of changing the
original one in place?** This dialect has no way to change a pair
after `cons` builds it — there's no operation here that reaches into
an existing list and removes an item from it directly. The real cost:
every call to `rember` on a long list rebuilds a new spine of pairs
all the way up to the match, even though most of those pairs hold
exactly the same atoms as before — nothing here is free. The real
benefit: whoever held a reference to the original list before calling
`rember` still has it, completely unchanged, since `rember` never
touched it — nothing they're relying on can be silently altered out
from under them by a call they didn't even make. This tradeoff —
safety from unexpected change, paid for with copying work — is the
same one immutable data structures make in every language that offers
them.

### Connecting Sentence

`rember` builds a new list by keeping most items and dropping one; the
next Concept Unit reuses the exact same shape for a different job —
pulling one specific piece out of a list of pairs.

---

## Concept Unit 2: `firsts` — The Same Shape, One New Wrinkle

### The Problem

`rember` and `copy-lat` both worked on a flat list of atoms. What
about a list of *pairs* — say, an inventory where each entry is a
two-item list, `(item count)`? Getting just the item names back out
needs the same "keep, recurse, cons back together" shape, but reaching
*into* each pair before keeping anything.

### The Real Procedure — `firsts`

```scheme
(define firsts
  (lambda (l)
    (cond
      ((null? l) '())
      (else (cons (car (car l)) (firsts (cdr l)))))))
(firsts '((wrench 3) (bolt 5) (gasket 2)))
```

```
; firsts defined
=> (wrench bolt gasket)
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run it here or in the
sandbox.

### Mechanical Walkthrough

- `(cond ((null? l) '()) (else (cons (car (car l)) (firsts (cdr
  l)))))` — **list-building recursion, reappearing** (Concept Unit
  1's hard concept) — same base case, same "keep and cons back
  together" recursive case as `rember` and `copy-lat`.
- `(car (car l))` — **first appearance of a nested `car`.** `l`'s own
  first item, `(car l)`, is itself a pair — `(wrench 3)` on the first
  call — so a single `car` only reaches that whole pair, not the
  `wrench` inside it. A second `car`, applied to that result, reaches
  one level deeper. This is ordinary function composition, not a new
  construct: `(car (car l))` means exactly what it looks like, `car`
  applied to whatever `(car l)` returns.
- `firsts` has no `eq?` check at all, unlike `rember` — there's
  nothing to compare against here, every pair contributes its first
  item to the result, unconditionally.

### Connecting Sentence

`firsts` proves the list-building shape isn't tied to flat lists of
atoms — it reapplies cleanly the moment the items being kept are
reached through one extra `car`. The next Concept Unit keeps the shape
again, this time to add something *new* into the list instead of only
ever removing or extracting.

---

## Concept Unit 3: `insertR` and `insertL` — Splicing In, Not Just Taking Out

### The Problem

`rember`'s match clause replaces the matched item with nothing —
`(cdr lat)`, the rest of the list, no `cons`. What if, instead of
removing an item, the goal is to add a *new* one right next to it —
immediately after, or immediately before?

### The Real Procedure — `insertR`

```scheme
(define insertR
  (lambda (new old lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) old) (cons old (cons new (cdr lat))))
      (else (cons (car lat) (insertR new old (cdr lat)))))))
(insertR 'washer 'bolt '(wrench bolt gasket))
(insertR 'washer 'nut '(wrench bolt gasket))
```

```
; insertR defined
=> (wrench bolt washer gasket)
=> (wrench bolt gasket)
```

### Mechanical Walkthrough

- `((eq? (car lat) old) (cons old (cons new (cdr lat))))` — **first
  appearance of two `cons` calls chained in one clause.** Read from
  the inside out: `(cons new (cdr lat))` puts `new` at the front of
  everything *after* the match; wrapping that in `(cons old ...)` puts
  the matched item, `old`, back in front of it — the net effect is
  `old` followed immediately by `new`, followed by the rest of the
  list, exactly as if `new` had been spliced in right after `old`.
- The recursive and base cases — **list-building recursion,
  reappearing**, identical in shape to `rember` and `firsts`.
- The second test, `(insertR 'washer 'nut '(wrench bolt gasket))` —
  `nut` never appears, so the match clause never fires; every call
  falls through to the recursive case, and the result is an unchanged
  copy of the original list, same as `rember`'s no-match case.

### `insertL` — the Mirror Image

```scheme
(define insertL
  (lambda (new old lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) old) (cons new lat))
      (else (cons (car lat) (insertL new old (cdr lat)))))))
(insertL 'washer 'bolt '(wrench bolt gasket))
```

```
; insertL defined
=> (wrench washer bolt gasket)
```

**`insertL`'s match clause is `insertR`'s reappearing, with one
difference worth a clause:** `(cons new lat)`, not two chained
`cons`es. `lat`, at the point of the match, already *starts* with
`old` — `(bolt gasket)` — so consing `new` onto the front of `lat`
directly places it immediately before `old`, with `old` itself already
exactly where it needs to end up, unchanged. `insertR` needed two
`cons`es because it had to move `old` out of the way first to make
room after it; `insertL` needs only one, because nothing has to move
before it.

### CS Lens

**Adding a new element next to an existing one, without disturbing
anything else's relative order, is called splicing.** Also recognized
in: inserting a node into a linked list (rewire two pointers instead
of shifting every following element, the way an array insert would);
a text editor inserting a character at the cursor; version control
inserting a new commit between two existing ones in a rebase. The
shared idea every time: find the spot, then reattach what comes after
it to include the new piece, without rebuilding anything before that
spot.

### Connecting Sentence

`rember`, `firsts`, `insertR`, and `insertL` are four different jobs
built from exactly one recursive shape — keep or transform the current
item, recurse on the rest, `cons` the result back together. Later
lessons keep reaching for this same shape; what changes from here on
is only what happens at the match.

---

## Connect the Pieces

One inventory list, followed through three of this lesson's
procedures: `'((wrench 3) (bolt 5) (gasket 2))`. `firsts` (Concept
Unit 2) pulls out `(wrench bolt gasket)` — just the item names.
Suppose `wrench` needs removing from that flat list and `washer` added
right after `bolt`: `(rember 'wrench (firsts '((wrench 3) (bolt 5)
(gasket 2))))` removes it, `(insertR 'washer 'bolt ...)` on that
result splices `washer` in — three procedures from this lesson, each
one the same "keep, recurse, cons back together" shape, chained
together on one real list.

## What Breaks Without This

Delete the `cons` from `rember`'s recursive case, keeping everything
else:

```scheme
(define rember-broken
  (lambda (a lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) a) (cdr lat))
      (else (rember-broken a (cdr lat))))))
(rember-broken 'bolt '(wrench bolt gasket))
```

```
; rember-broken defined
=> (gasket)
```

**No error at all — and that's what makes this worse than the broken
`lat?` from Lesson 01.** `wrench` silently vanished from the result
along with `bolt`, because the recursive case now only ever returns
whatever the deeper call returns, never re-attaching the item it was
supposed to keep. A crash is loud and easy to find; a procedure that
runs to completion and returns a plausible-looking but wrong answer
is not — this is exactly the class of bug list-building recursion is
prone to the moment the closing `cons` gets dropped. Restore it, and
confirm the full list — minus only the one matched item — comes back
again.

## Exercises

1. Predict, before running, what `(rember 'gasket '(wrench bolt
   gasket gasket))` returns — how many `gasket`s remain? Then run it
   and check.
2. Write and `define` `seconds`, a companion to `firsts` that returns
   the *second* item of each pair instead of the first (`(seconds
   '((wrench 3) (bolt 5)))` should return `(3 5)`). Reuse `firsts`'s
   shape — only the piece pulled out of each pair changes.
3. Trace `(insertL 'washer 'nut '(wrench bolt gasket))` by hand first
   — `nut` isn't in the list. What does `insertL` return when nothing
   matches? Then run it and confirm.
4. Open *The Little Schemer* to Chapter 2 and work its own questions
   about `rember`, `firsts`, and the insert procedures in the sandbox.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, the difference between
      `rember`'s match clause (`(cdr lat)`, no `cons`) and its
      recursive case (`cons`, always).
- [ ] You can explain why `insertR`'s match clause needs two `cons`
      calls and `insertL`'s needs only one.
- [ ] You completed the Exercises above, including writing `seconds`
      yourself.
- [ ] You're working the book's own Chapter 2 questions in the
      sandbox.
