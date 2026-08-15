# Lesson 08: A Set Is a List With One Extra Rule

**What you will build:** `set?` and `makeset` (check and enforce "no
duplicates"), then `subset?` and `intersect` (basic relations between
two sets). The transferable idea, different from most lessons so far:
not every new procedure needs a new recursive shape. A **set** is
just a list with one extra rule — no duplicate elements — and every
procedure in this lesson is built almost entirely by reusing `member?`
(Lesson 01) and `multirember` (Lesson 03) exactly as they already are.

**What you need to know first:** Lesson 01 (`member?`) and Lesson 03
(`multirember`) — both reused directly, unchanged, throughout this
lesson.

**Terms introduced in this lesson:**
- **Set** — a list with no duplicate elements. Every set is a list;
  not every list is a set.

**Objects and methods this lesson uses:** none new — `member?`,
`multirember`, `null?`, `cond`, `lambda`, and `define` all reappear.

---

## Concept Unit 1: `set?` and `makeset` — Reusing Already-Built Tools

### The Problem

Checking whether a list has any duplicates, and building a
duplicate-free version of one, both sound like they need new
recursive machinery. They don't — both jobs reduce directly to
questions this series already knows how to answer.

### The Real Procedure — `set?`

```scheme
(define member?
  (lambda (a lat)
    (cond
      ((null? lat) #f)
      (else (or (eq? (car lat) a) (member? a (cdr lat)))))))
(define set?
  (lambda (lat)
    (cond
      ((null? lat) #t)
      ((member? (car lat) (cdr lat)) #f)
      (else (set? (cdr lat))))))
(set? '(wrench bolt gasket))
(set? '(wrench bolt wrench))
```

```
; member? defined
; set? defined
=> #t
=> #f
```

### `makeset` — Enforcing the Rule

```scheme
(define multirember
  (lambda (a lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) a) (multirember a (cdr lat)))
      (else (cons (car lat) (multirember a (cdr lat)))))))
(define makeset
  (lambda (lat)
    (cond
      ((null? lat) '())
      (else (cons (car lat) (makeset (multirember (car lat) (cdr lat))))))))
(makeset '(wrench bolt wrench gasket bolt))
```

```
; multirember defined
; makeset defined
=> (wrench bolt gasket)
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox at `/lab/little-schemer`.

### Mechanical Walkthrough

- `((member? (car lat) (cdr lat)) #f)` — **`member?`, reapplied
  directly, unchanged** (Lesson 01): "is the current item found
  anywhere in the rest of the list?" is exactly `member?`'s own
  question — a list fails to be a set the moment any item reappears
  later in it.
- `(cons (car lat) (makeset (multirember (car lat) (cdr lat))))` —
  **`multirember`, reapplied directly, unchanged** (Lesson 03): keep
  the current item, strip out every *later* occurrence of that exact
  item from the rest of the list first, then recurse on what's left.
  Nothing about `multirember` itself changed — it's doing precisely
  the job it always did, just aimed at "everything matching the item
  currently being kept."

### Connecting Sentence

`set?` and `makeset` prove that a genuinely new job doesn't always
need a genuinely new recursive shape — sometimes it needs exactly the
right combination of shapes already built. The next Concept Unit
combines `member?` once more, this time comparing two whole sets
against each other.

---

## Concept Unit 2: `subset?` and `intersect` — Relations Between Two Sets

### The Real Procedure — `subset?`

```scheme
(define member?
  (lambda (a lat)
    (cond
      ((null? lat) #f)
      (else (or (eq? (car lat) a) (member? a (cdr lat)))))))
(define subset?
  (lambda (set1 set2)
    (cond
      ((null? set1) #t)
      ((member? (car set1) set2) (subset? (cdr set1) set2))
      (else #f))))
(subset? '(wrench bolt) '(wrench bolt gasket))
(subset? '(wrench nut) '(wrench bolt gasket))
```

```
; member? defined
; subset? defined
=> #t
=> #f
```

### `intersect` — What Two Sets Share

```scheme
(define member?
  (lambda (a lat)
    (cond
      ((null? lat) #f)
      (else (or (eq? (car lat) a) (member? a (cdr lat)))))))
(define intersect
  (lambda (set1 set2)
    (cond
      ((null? set1) '())
      ((member? (car set1) set2) (cons (car set1) (intersect (cdr set1) set2)))
      (else (intersect (cdr set1) set2)))))
(intersect '(wrench bolt gasket) '(bolt gasket washer))
(intersect '(wrench bolt) '(nut washer))
```

```
; member? defined
; intersect defined
=> (bolt gasket)
=> ()
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox.

### Mechanical Walkthrough

- `subset?`'s base case, `((null? set1) #t)` — an empty set is
  vacuously a subset of anything, the same reasoning `lat?`'s base
  case (Lesson 01) used for "every item in an empty list is an atom."
- `((member? (car set1) set2) (subset? (cdr set1) set2))` —
  **`member?`, reappearing.** Every item in `set1` has to show up
  *somewhere* in `set2`, checked one at a time; the moment one doesn't
  (the `else` clause, returning `#f` directly with no further
  recursion), the whole check is settled.
- `intersect` — **list-building recursion, reappearing** (Lesson 02),
  combined with `member?` as the keep/drop decision, the exact same
  combination `rember`'s match clause used, just inverted: keep the
  item when it *is* found, instead of when it isn't.

### Connecting Sentence

`subset?` and `intersect` both reduce to "check `member?` against
`set2`, once per item in `set1`" — the same underlying question,
answered two different ways: stop at the first failure, or collect
every success.

---

## Connect the Pieces

Two sets, `'(wrench bolt gasket)` and `'(bolt gasket washer)`.
`intersect` (Concept Unit 2) finds what they share — `(bolt gasket)`.
Feed that result into `set?` (Concept Unit 1): `(set? '(bolt
gasket))` confirms it's a real set — `#t` — which it always will be,
since `intersect` can never produce a duplicate: each item it keeps
came from `set1`, itself already a set, and `intersect` never
`cons`es the same item onto its result twice.

## What Breaks Without This

Check only the *immediately next* item for a duplicate, instead of
checking against the whole rest of the list the way `member?` does:

```scheme
(define set-broken?
  (lambda (lat)
    (cond
      ((null? lat) #t)
      ((null? (cdr lat)) #t)
      ((eq? (car lat) (car (cdr lat))) #f)
      (else (set-broken? (cdr lat))))))
(set-broken? '(wrench wrench bolt))
(set-broken? '(wrench bolt wrench))
```

```
; set-broken? defined
=> #f
=> #t
```

**Half right, half silently wrong.** The first test — the duplicate
`wrench`s sit right next to each other — is correctly caught, `#f`.
The second test has the exact same duplicate, just not adjacent, and
`set-broken?` reports `#t`: a valid set, which it plainly is not. This
is exactly why `set?`'s real match clause reuses `member?` against
`(cdr lat)` — the *entire* rest of the list — rather than only peeking
at the one item immediately next. Restore the real `set?`, and confirm
both lists are judged correctly.

## Exercises

1. Write and `define` `eqset?` — do two sets contain exactly the same
   elements, regardless of order? Reuse `subset?` twice: `set1` is a
   subset of `set2`, *and* `set2` is a subset of `set1`. Test it
   against two sets with the same elements in different orders, and
   against two sets that differ by one element.
2. Write and `define` `union` — combine two sets into one, with no
   duplicates. Reuse `member?` the same way `intersect` did, but
   invert which branch keeps the current item.
3. Predict, before running, what `(intersect '(wrench bolt) '(nut
   washer))` returns, when the two sets share nothing at all. Then run
   it and check.
4. Open *The Little Schemer* to Chapter 7 and work its own set
   questions in the sandbox.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, why `set?` and `makeset` don't
      need any genuinely new recursive shape.
- [ ] You can explain what's wrong with checking only the next item
      for a duplicate, instead of the entire rest of the list.
- [ ] You completed the Exercises above, including writing both
      `eqset?` and `union` yourself.
- [ ] You're working the book's Chapter 7 in the sandbox.
