# Lesson 04: Recursing Into Both Halves of a Pair

**What you will build:** `rember*` (remove every occurrence of an atom
anywhere in a list, no matter how deeply nested) and `occur*` (count
them the same way). The transferable problem: every procedure since
Lesson 01 has assumed a flat list — `car` always an atom, never a list
itself. The moment that assumption breaks, `rember`'s whole shape
breaks with it, and fixing it needs a genuinely new kind of recursive
call, not just a new clause.

**What you need to know first:** Lessons 01 through 03 — recursion,
list-building recursion, and recursing past a match instead of
stopping at it. `atom?` (Lesson 00) reappears here doing real,
load-bearing work for the first time since it was introduced.

**Terms introduced in this lesson:**
- **Nested list** — a list with at least one top-level item that is
  itself a list, not an atom — `'(wrench (case bolt) gasket)`, where
  the second item is a two-atom list rather than a bare atom. `lat?`
  (Lesson 01) exists specifically to detect the *absence* of this:
  `(lat? '(wrench (case bolt) gasket))` returns `#f`, precisely
  because one item fails to be an atom.

**Objects and methods this lesson uses:** none new — `cons`, `car`,
`cdr`, `null?`, `atom?`, `eq?`, `add1`, `+`, `cond`, `or`, `lambda`,
and `define` all reappear from Lessons 00 through 03. `atom?`
specifically reappears in a new role, covered in the walkthrough below
rather than restated here.

---

## Concept Unit 1: The Problem — `rember` Can't Reach Inside a Nested List

### The Problem

```scheme
(define rember
  (lambda (a lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) a) (cdr lat))
      (else (cons (car lat) (rember a (cdr lat)))))))
(rember 'bolt '(wrench (case bolt) bolt))
```

```
; rember defined
=> (wrench (case bolt))
```

The trailing top-level `bolt` is gone, exactly as expected. But the
`bolt` sitting *inside* `(case bolt)` survives completely untouched —
`rember`'s `eq?` check compares `(car lat)` against `a` directly, and
on the second item, `(car lat)` is the whole sublist `(case bolt)`,
never `eq?` to the bare atom `bolt` no matter what's inside it.
`rember` isn't wrong, exactly — it was never built to look *inside* an
item, only to compare each item as a whole. Reaching inside needs a
new kind of recursive call.

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox at `/lab/little-schemer`.

### Connecting Sentence

Every procedure so far recurses one way: forward, through `(cdr l)`.
Reaching inside a nested item needs a second, independent recursive
call — into `(car l)` — whenever that item turns out to be a list
instead of an atom.

---

## Concept Unit 2: `rember*` — Recursing Into Both `car` and `cdr`

### Isolated Example — Counting, Not Removing Yet

```scheme
(define count-atoms
  (lambda (l)
    (cond
      ((null? l) 0)
      ((atom? (car l)) (add1 (count-atoms (cdr l))))
      (else (+ (count-atoms (car l)) (count-atoms (cdr l)))))))
(count-atoms '(wrench (bolt gasket) washer))
```

```
; count-atoms defined
=> 4
```

`wrench` and `washer` are atoms, counted directly; `(bolt gasket)` is
itself a two-atom list. `count-atoms` proves the new shape: when
`(atom? (car l))` is true, count it and move on through `(cdr l)`, the
same as before — but when it's *false*, `(car l)` is a list, and
`count-atoms` calls *itself* on that list too, completely separately
from the call already recursing through `(cdr l)`. Two independent
recursive calls, on two different, smaller pieces of the same input,
combined with `+`. This is called **tree recursion**: unlike every
procedure before this lesson, which recursed exactly once per call, a
nested list branches — and the recursion branches with it, once per
branch.

### Discarding the Throwaway Example

`count-atoms` has proven the shape and is discarded now — the real,
kept procedure is `rember*`, built next.

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox.

### The Real Procedure — `rember*`

```scheme
(define rember*
  (lambda (a l)
    (cond
      ((null? l) '())
      ((atom? (car l))
       (cond
         ((eq? (car l) a) (rember* a (cdr l)))
         (else (cons (car l) (rember* a (cdr l))))))
      (else (cons (rember* a (car l)) (rember* a (cdr l)))))))
(rember* 'bolt '(wrench (case bolt) bolt))
(rember* 'bolt '((bolt) (bolt (bolt)) bolt))
```

```
; rember* defined
=> (wrench (case))
=> (() (()))
```

### Mechanical Walkthrough

- `((atom? (car l)) (cond ...))` — **`atom?`, reappearing in a new
  role.** Lesson 00 used it to answer a single yes/no question about
  one value; here, it's the branch condition deciding which of
  `rember*`'s two entirely different recursive strategies applies to
  the current item.
- The inner `cond`, reached only when `(car l)` is an atom — **the
  exact shape `multirember` already proved** (Lesson 03): match, keep
  searching without keeping the item; no match, keep the item and
  keep searching.
- `(else (cons (rember* a (car l)) (rember* a (cdr l))))` — **first
  appearance of tree recursion inside the real, kept procedure**, full
  treatment above (`count-atoms`). Reached exactly when `(car l)` is
  itself a list — `rember*` recurses into it (removing `bolt` from
  *inside* that sublist) completely independently of recursing into
  `(cdr l)` (removing `bolt` from everything *after* it), then `cons`s
  the two results back together.
- The second test result, `(() (()))` — every `bolt` at every depth is
  gone, but the *shape* survives: `(bolt)` becomes `()`, `(bolt
  (bolt))` becomes `(())`, and the trailing top-level `bolt` vanishes
  entirely, same as it always has. Removing atoms never removes the
  parentheses around them.

### Execution Trace

Tracing `(rember* 'bolt '((bolt) wrench))`:

```
Call 1: l = ((bolt) wrench)
  → (car l) = (bolt) — not an atom
  → else clause: (cons (rember* 'bolt '(bolt))
                        (rember* 'bolt '(wrench)))
     two independent calls, made separately

  Call 2 (into car): l = (bolt)
    → (car l) = 'bolt — an atom, and (eq? 'bolt 'bolt) is #t
    → inner match clause: (rember* 'bolt '())
    Call 3: l = () — base case, returns '()
    Call 2 returns '()

  Call 4 (into cdr): l = (wrench)
    → (car l) = 'wrench — an atom, (eq? 'wrench 'bolt) is #f
    → inner fall-through: (cons 'wrench (rember* 'bolt '()))
    Call 5: l = () — base case, returns '()
    Call 4 returns (cons 'wrench '()) = (wrench)

Call 1 returns (cons '() '(wrench)) = (() wrench)
```

Five calls total, branching into two separate recursion chains from
Call 1 — one exploring `(car l)`, one exploring `(cdr l)` — neither
chain aware of or waiting on the other, until Call 1 combines both
results with one `cons` at the very end.

### CS Lens

**Recursing separately into two (or more) smaller pieces of the same
structure, then combining the results, is called tree recursion** —
named for the shape of the calls themselves, which branch the way a
tree does, not for any specific data type. Also recognized in: walking
a computer's real file system (a folder branches into files *and*
subfolders, each subfolder walked completely separately before the
walk returns); a compiler traversing an abstract syntax tree (an
addition node has to recurse into *both* its left and right operand
before it can combine them); `JSON.parse` descending into a nested
object's every key independently; any divide-and-conquer algorithm —
merge sort recurses into both halves of an array completely
separately, exactly the way `rember*` recurses into both `(car l)` and
`(cdr l)`.

### SE Lens

**Why does `rember*` rebuild the nested structure with `cons`, instead
of, say, flattening everything into one flat list of whatever atoms
survive?** `cons`ing the two recursive results back together — rather
than something that would merge them into one flat sequence —
preserves exactly the shape the input had, just with matching atoms
missing. The real alternative: a version that flattened nesting away
entirely would be simpler to write in one sense, but would throw away
real information — whether `bolt` was at the top level or three
layers deep. Preserving shape costs nothing extra here (the `cons` is
no more work than a flattening `append` would be), but it's a
deliberate design choice `rember*` makes, not the only possible one —
a different lesson could ask for a `flatten` procedure instead, and it
would recurse the same way, only combine its results differently.

### Connecting Sentence

`rember*` proves the whole new shape: check whether the current item
is an atom, and if it isn't, recurse into it as a second, independent
call. `occur*`, next, reapplies that exact shape to a different job.

---

## Concept Unit 3: `occur*` — The Same Shape, Counting Instead of Removing

### The Real Procedure — `occur*`

```scheme
(define occur*
  (lambda (a l)
    (cond
      ((null? l) 0)
      ((atom? (car l))
       (cond
         ((eq? (car l) a) (add1 (occur* a (cdr l))))
         (else (occur* a (cdr l)))))
      (else (+ (occur* a (car l)) (occur* a (cdr l)))))))
(occur* 'bolt '((bolt) (bolt (bolt)) bolt))
(occur* 'nut '(wrench (case bolt) bolt))
```

```
; occur* defined
=> 4
=> 0
```

### Where This Lives

**Reference Source:** no reference counterpart.

**Where this lives:** nowhere permanent — run this here or in the
sandbox.

### Mechanical Walkthrough

- Base case, the `atom?` branch, and the tree-recursion `else` branch
  — **tree recursion, reappearing whole** (Concept Unit 2's hard
  concept) — identical shape to `rember*`, atom-by-atom and
  branch-by-branch.
- `(+ (occur* a (car l)) (occur* a (cdr l)))` — **the one real
  difference from `rember*`**: the two independent recursive results
  are combined with `+`, not `cons`. `rember*` was building a new
  *list*, so `cons` was the only combining operation that made sense;
  `occur*` is building a *count*, so `+` is. The recursive *shape* —
  branch into `(car l)` and `(cdr l)` independently — doesn't care
  what the results actually are or how they get combined; only the
  combining step changes to fit the job.
- First test: four `bolt`s total — one inside `(bolt)`, two inside
  `(bolt (bolt))` (one at each nesting level), and one more at the top
  level — every branch that finds a match contributing `1` via
  `add1`, summed together by every `+` above it as the recursion
  returns. Second test: `nut` never appears anywhere, at any depth, so
  every branch contributes `0`, and `+` never has anything nonzero to
  add.

### Connecting Sentence

`rember*` and `occur*` are the same tree-recursive shape, doing two
different jobs, the same way Lesson 02's four procedures were all one
list-building shape doing different jobs. The combining operation at
the very end — `cons`, `+`, or something else entirely — is the only
thing that actually changes from one job to the next.

---

## Connect the Pieces

One nested list, `'(wrench (case bolt) bolt)`, through this lesson in
order: plain `rember` (Concept Unit 1) removes only the trailing
top-level `bolt`, leaving the one inside `(case bolt)` untouched —
`(wrench (case bolt))`. `rember*` (Concept Unit 2) removes *both*,
recursing separately into `(case bolt)` to reach the one hiding there
— `(wrench (case))`. `occur*` (Concept Unit 3), run against the
*original* list before either removal, reports `2` — proving there
really were two, exactly the number `rember*` needed to find and
remove to produce its result.

## What Breaks Without This

Run plain `rember` — not `rember*` — against a nested list where the
target atom sits both at the top level and buried inside a sublist:

```scheme
(define rember
  (lambda (a lat)
    (cond
      ((null? lat) '())
      ((eq? (car lat) a) (cdr lat))
      (else (cons (car lat) (rember a (cdr lat)))))))
(rember 'bolt '((bolt) wrench bolt))
```

```
; rember defined
=> ((bolt) wrench)
```

The trailing `bolt` is gone; `(bolt)`, sitting untouched at the front,
still holds its own `bolt` completely unremoved — `rember` has no way
to know it's even there, since `(car lat)` on that first item is the
whole sublist `(bolt)`, never `eq?` to the bare atom `bolt`. Nothing
crashes; the result merely looks plausible until compared against what
`rember*` would have produced. Swap in `rember*`, and confirm both
occurrences are gone this time.

## Exercises

1. Predict, before running, what `(occur* 'bolt '(bolt (bolt bolt)
   (bolt)))` returns. Then run it and check.
2. Write and `define` `member*` — the tree-recursive cousin of
   `member?` (Lesson 01): does `a` occur anywhere in `l`, at any
   depth? Reuse `member?`'s `or`-based shape (Lesson 01, Concept Unit
   2) for the atom case, and `rember*`'s branch-into-both-halves shape
   for the nested case. Test it on a list where the atom is buried at
   least two levels deep.
3. Trace `(rember* 'gasket '(gasket (gasket)))` by hand, the way
   Concept Unit 2's Execution Trace did — how many calls does it take,
   and in what order do the two independent branches from the first
   call finish?
4. Open *The Little Schemer* to Chapter 3 and work its own nested-list
   questions in the sandbox.

## Definition of Done

- [ ] You ran every code block above yourself — here or in the
      sandbox — and saw the same output shown.
- [ ] You can explain, without looking, why plain `rember` can't
      remove an atom buried inside a sublist, and exactly what
      `rember*` adds to fix that.
- [ ] You can point to the one line in `rember*` where the recursion
      genuinely branches into two independent calls.
- [ ] You completed the Exercises above, including writing `member*`
      yourself.
- [ ] You're working the book's Chapter 3 in the sandbox.
