# Lesson 03: Matching Doesn't Have to Mean Stopping

**What you will build:** `subst` (replace an atom's first occurrence
with a new one — `rember`'s shape, reused directly), then
`multirember` and `multiinsertR` — procedures that act on *every*
occurrence of an atom, not just the first. The transferable problem:
in every procedure Lesson 02 built, finding a match and stopping the
search were the same event, baked into one `cond` clause. This lesson
pulls those two decisions apart — a match can be found and acted on
*without* ending the search.

**What you need to know first:** Lesson 02 — list-building recursion,
and `rember`'s specific shape (base case, a match clause that acts
without recursing further, a fall-through clause that keeps the
current item and recurses).

**Terms introduced in this lesson:** none — same as Lesson 02, this is
a new way of combining already-taught pieces.

**Everything this lesson's code uses, all reappearing from Lessons 00
through 02 — brief restatement only:**
- **`cons`, `car`, `cdr`** — Lesson 00, Concept Unit 2.
- **`null?`, `eq?`** — Lesson 00, Concept Unit 2.
- **`cond`, `else`** — Lesson 00, Concept Unit 3.
- **`lambda`, `define`** — Lesson 00, Concept Unit 3.

---

## Concept Unit 1: `subst` — `rember`'s Shape, Reused Directly

### The Problem

`rember`'s match clause throws the matched item away, returning `(cdr
lat)`. What if, instead of throwing it away, the goal is to *replace*
it with something else?

### The Real Procedure — `subst`

No new isolated lab needed here — this is `rember`'s exact shape
(Lesson 02, Concept Unit 1), reapplied with a different match clause:

```scheme
(define subst
  (lambda (new old lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) old) (cons new (cdr lat)))
      (else (cons (car lat) (subst new old (cdr lat)))))))
(subst 'washer 'bolt '(wrench bolt gasket bolt))
(subst 'washer 'nut '(wrench bolt gasket))
```

```
; subst defined
=> (wrench washer gasket bolt)
=> (wrench bolt gasket)
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run it here or in the
sandbox at `/lab/little-schemer`.

### Mechanical Walkthrough

- Base case and fall-through recursive case — **list-building
  recursion, reappearing** (Lesson 02, Concept Unit 1) — identical to
  `rember`'s.
- `((eq? (car lat) old) (cons new (cdr lat)))` — **`rember`'s match
  clause, reappearing, with one change**: `(cons new (cdr lat))`
  instead of plain `(cdr lat)` — the matched item is still dropped
  from the front, but `new` takes its place instead of nothing taking
  its place.
- The second test, `(subst 'washer 'nut '(wrench bolt gasket))` —
  `nut` doesn't appear anywhere in the list, so every call falls
  through to the recursive case, returning an unchanged copy — the
  same no-match behavior every procedure in this series has shown so
  far.

### Connecting Sentence

`subst` only ever touches the *first* match, exactly like `rember` —
proving the shape carries over unchanged. The next Concept Unit
changes that shape in exactly one place, with a much bigger effect
than it looks.

---

## Concept Unit 2: `multirember` — Recursing Past a Match, Not Stopping At It

### The Problem

Every procedure so far — `rember`, `subst`, `insertR`, `insertL` —
acts on the *first* occurrence only, because their match clause
returns an answer directly instead of recursing any further. What if
every occurrence needs the same treatment — removing every `gasket`
from a list, not just the first one?

### Isolated Example — the One Line That Changes

```scheme
(define multirember
  (lambda (a lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) a) (multirember a (cdr lat)))
      (else (cons (car lat) (multirember a (cdr lat)))))))
(multirember 'gasket '(wrench gasket bolt gasket washer))
(multirember 'wrench '(wrench wrench wrench))
```

```
; multirember defined
=> (wrench bolt washer)
=> ()
```

Compare this match clause to `rember`'s: `rember` had `((eq? (car lat)
a) (cdr lat))` — return the rest of the list, no recursive call at
all, search over. `multirember` has `((eq? (car lat) a) (multirember a
(cdr lat)))` — a real recursive call, on the rest of the list, exactly
like the fall-through clause makes — the *only* difference between
`multirember`'s two non-base clauses is whether the current item gets
`cons`ed back into the result. Both clauses keep searching; only one
of them keeps what it found. The second test proves this all the way:
every single item matches, and the result is the empty list — nothing
at all survives to be `cons`ed back.

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run it here or in the
sandbox, where it's worth keeping alongside `subst` for the Exercises
below.

### Execution Trace

Tracing `(multirember 'bolt '(bolt wrench bolt))`:

```
Call 1: a = bolt, lat = (bolt wrench bolt)
  → (eq? 'bolt 'bolt) is #t — match clause
  → recurses anyway: (multirember 'bolt '(wrench bolt))
     (nothing consed — 'bolt is not kept)

Call 2: a = bolt, lat = (wrench bolt)
  → (eq? 'wrench 'bolt) is #f — fall-through clause
  → (cons 'wrench (multirember 'bolt '(bolt)))

Call 3: a = bolt, lat = (bolt)
  → (eq? 'bolt 'bolt) is #t — match clause
  → recurses anyway: (multirember 'bolt '())

Call 4: lat = () — base case, returns '()

Call 3 returns whatever Call 4 returned: '()
Call 2 returns (cons 'wrench '()) = (wrench)
Call 1 returns whatever Call 2 returned: (wrench)
```

Four calls deep — one more than a version that stopped at the first
match would need — because Call 1's match doesn't end the recursion;
it only decides that `bolt` won't be `cons`ed back in.

### CS Lens

**Separating "did this match?" from "should the search stop?" is the
same idea behind the difference between finding one result and finding
every result.** Also recognized in: a text editor's "Find" (stops at
the first hit) versus "Find All" (keeps searching after every hit); a
single-value database lookup versus a query with no `LIMIT`; a
regular-expression engine's non-global versus global replace mode
(`replace` versus `replaceAll` in many languages, or a missing versus
present `g` flag). `rember` is this lesson's "Find"; `multirember` is
its "Find All" — same underlying search, one flag's worth of
difference in what happens after a hit.

### SE Lens

**Does `multirember` still provably reach its base case, the same way
`rember` did?** Yes, and for exactly the same reason: every recursive
call — whichever of the two non-base clauses makes it — passes `(cdr
lat)`, one item shorter than what it received. Neither clause is
allowed to call `multirember` again on the same `lat` it was just
given, or on anything longer. The specific *content* of the two
non-base clauses changed completely from `rember` to `multirember`;
the *shrinking argument* that guarantees the recursion actually ends
did not change at all, because both versions still shrink `lat` by
exactly one `cdr` on every single call, no exceptions.

### Connecting Sentence

`multirember` proves matching and stopping are two separate decisions;
the next Concept Unit combines that same separation with `insertR`'s
splicing from Lesson 02, to insert *after every* occurrence instead of
just the first.

---

## Concept Unit 3: `multiinsertR` — Two Reappearing Ideas, Combined

### The Problem

`insertR` (Lesson 02) splices a new atom in after the *first*
occurrence of an old one. Combining `insertR`'s splice with
`multirember`'s "keep searching after a match" gives a procedure that
splices in after *every* occurrence.

### The Real Procedure — `multiinsertR`

```scheme
(define multiinsertR
  (lambda (new old lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) old)
       (cons old (cons new (multiinsertR new old (cdr lat)))))
      (else (cons (car lat) (multiinsertR new old (cdr lat)))))))
(multiinsertR 'washer 'bolt '(wrench bolt gasket bolt))
```

```
; multiinsertR defined
=> (wrench bolt washer gasket bolt washer)
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run it here or in the
sandbox.

### Mechanical Walkthrough

- `(cons old (cons new (multiinsertR new old (cdr lat))))` — **two
  ideas reappearing together, not a new one**: the double-`cons`
  splice is `insertR`'s match clause (Lesson 02, Concept Unit 3); the
  recursive call in place of a direct return is `multirember`'s
  "recurse past a match" (Concept Unit 2, above). Neither piece is
  new — this procedure exists entirely by combining two shapes this
  series already built separately.
- Base case and fall-through clause — list-building recursion,
  reappearing, unchanged from every procedure so far.
- The result shows both matched `bolt`s kept, each immediately
  followed by a `washer` — proof that the match clause both keeps
  searching *and* keeps what it found this time, unlike
  `multirember`'s match clause, which searched on but kept nothing.

### Connecting Sentence

Every procedure in this lesson reuses a piece already built in Lesson
02 — `subst` reuses `rember`'s shape whole; `multiinsertR` combines
`insertR`'s splice with `multirember`'s "don't stop." Nothing here
required a genuinely new recursive shape, only new combinations of two
shapes already understood separately.

---

## Connect the Pieces

One list, `'(wrench bolt gasket bolt)`, through two of this lesson's
procedures: `(subst 'nut 'bolt '(wrench bolt gasket bolt))` replaces
only the *first* `bolt` — `(wrench nut gasket bolt)`, one `bolt`
remaining untouched. Now `multirember 'bolt` on the *original* list
instead: `(multirember 'bolt '(wrench bolt gasket bolt))` removes
*both* — `(wrench gasket)`. Same starting list, same atom being
searched for, genuinely different results — entirely because of the
first-versus-every distinction this lesson exists to teach.

## What Breaks Without This

Build `multirember` using `rember`'s stop-at-the-first-match clause
instead of `multirember`'s own:

```scheme
(define multirember-broken
  (lambda (a lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) a) (cdr lat))
      (else (cons (car lat) (multirember-broken a (cdr lat)))))))
(multirember-broken 'gasket '(wrench gasket bolt gasket washer))
```

```
; multirember-broken defined
=> (wrench bolt gasket washer)
```

**No crash — and the bug is easy to miss at a glance**, the same way
Lesson 02's broken `rember` was: the *first* `gasket` is gone, so a
quick look says "it worked." The *second* `gasket`, later in the list,
survives completely untouched, because the match clause returned
`(cdr lat)` directly instead of recursing — the search ended the
instant it found one match, exactly like real `rember` is supposed to.
Restore the recursive match clause, and confirm every `gasket`, not
just the first, is gone from the result.

## Exercises

1. Predict, before running, what `(multiinsertR 'washer 'nut
   '(wrench bolt gasket))` returns, when `nut` never appears at all.
   Then run it and check.
2. Write and `define` `multiinsertL`, the "every occurrence" version
   of `insertL` — combine `insertL`'s single-`cons` match clause
   (Lesson 02) with `multirember`'s "recurse past a match" the same
   way `multiinsertR` combined `insertR`'s. Test it on a list with the
   target atom appearing three times.
3. Write and `define` `multisubst`, the "every occurrence" version of
   `subst` from Concept Unit 1. Test that it replaces every
   occurrence, not just the first.
4. Open *The Little Schemer* to the rest of Chapter 2 and work its own
   `subst`/`multirember`/multi-insert questions in the sandbox.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, the exact one-clause
      difference between `rember` and `multirember`.
- [ ] You can explain why `multirember`'s recursion still provably
      ends, even though its match clause looks so different from
      `rember`'s.
- [ ] You completed the Exercises above, including writing both
      `multiinsertL` and `multisubst` yourself.
- [ ] You're working the rest of the book's Chapter 2 in the sandbox.
