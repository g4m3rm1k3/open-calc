# Lesson 35: Filter

**What you will build:** A real, working `my-filter` procedure that keeps only the list items satisfying a predicate, discarding the rest — Lesson 13's predicates, finally put to work selecting real data instead of only answering yes-or-no questions about individual values. The transferable problem this lesson is actually about: Lesson 34's `map` transforms every item, keeping all of them; a genuinely different, equally common need is keeping only *some* items, based on a condition, and Lesson 33's template needs a new kind of combine step to do this — one that sometimes adds nothing to the result at all.

**What you need to know first:** Lesson 8 (`FP-L008-composition.md`) — specifically *composition*, reused directly in Concept Unit 5 for real running code. Lesson 13 (`FP-L013-predicates.md`) — specifically *predicate*, reused directly as the function `my-filter` takes as its argument. Lesson 33 (`FP-L033-processing-a-list.md`) and Lesson 34 (`FP-L034-map.md`) — specifically the structural-recursion template and *higher-order function*, both directly extended.

## Objects and methods used

- **`filter`**
  - *What it is:* Scheme's own built-in procedure implementing this lesson's central pattern.
  - *Implementation:* takes a predicate and a list, returning a new list of exactly the items satisfying the predicate, in their original order; confirmed this session as `(filter passing? scores)`.
  - *Its use:* Concept Unit 3 checks `my-filter` against Scheme's real `filter`, exactly the way Lesson 34 checked `my-map` against the real `map`.
- **`>=`**
  - *What it is:* a real Scheme procedure for "at least" numeric comparison — a reappearance of *comparison operation* (Lesson 10).
  - *Implementation:* confirmed this session as an ordinary callable Guile procedure, used as `(>= s 60)`.
  - *Its use:* the predicate this lesson's examples filter by — a reappearance of `is_valid_score`-style checks (Lesson 13), now written as real, callable Scheme.

---

## Concept Unit 1: A Combine That Sometimes Skips an Item

### The Problem

`map` (Lesson 34) always includes a transformed version of every item — its result is always exactly as long as its input (Lesson 34, Concept Unit 5). Keeping only the passing scores out of `(91 45 72 85 30)` needs something different: a combine step that includes an item, unchanged, when it satisfies some condition, and includes *nothing at all* for it otherwise.

### The New Code — Type It Yourself

```scheme
(define (keep-passing lst)
  (if (null? lst)
      '()
      (if (>= (car lst) 60)
          (cons (car lst) (keep-passing (cdr lst)))
          (keep-passing (cdr lst)))))
```

### The Updated Project

This is `keep-passing.scm`, in full:

```scheme
(define (keep-passing lst)
  (if (null? lst)
      '()
      (if (>= (car lst) 60)
          (cons (car lst) (keep-passing (cdr lst)))
          (keep-passing (cdr lst)))))

(define scores (cons 91 (cons 45 (cons 72 (cons 85 (cons 30 '()))))))

(display (keep-passing scores))
(newline)
```

### Reference Source

Lesson 33's structural-recursion template, filled in with a combine step that branches on a condition rather than unconditionally combining, as every prior instance did.

### Files affected

Created: `keep-passing.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile keep-passing.scm
(91 72 85)
```

Verified this session — `45` and `30`, both below `60`, are entirely absent from the result; `91`, `72`, and `85` appear, unchanged, in their original order.

### Mechanical Walkthrough

- **`(if (null? lst) '() ...)`** — the base case, `'()`, identical to `map`'s: filtering nothing produces nothing, exactly the same reasoning as doubling nothing.
- **`(if (>= (car lst) 60) (cons (car lst) (keep-passing (cdr lst))) (keep-passing (cdr lst)))`** — the combine step, now itself a conditional (Lesson 12): when the guard holds, `(car lst)` is `cons`ed onto the recursive result, exactly as in `map`; when it fails, the recursive result is used *directly*, with nothing added for the current item at all.
- **`45` and `30`, entirely absent from `(91 72 85)`** — confirms the "add nothing" branch genuinely removes an item from the result, rather than replacing it with some placeholder the way a failed `map` transformation might.

### CS Lens

This is a new shape for the template's combine step — conditionally including an item rather than always transforming and including it — extending Lesson 33's template to a category of problem `map` alone could never solve. Also recognized in: a security checkpoint that lets some people through and turns others away entirely, rather than modifying everyone who passes; a spam filter that keeps some emails and discards others outright, rather than editing every email; a sieve, physically letting some particles through and blocking others, changing nothing about the ones that pass; a customs inspection that allows some goods through and rejects others, unchanged, rather than altering every shipment.

### SE Lens

The alternative to writing a genuinely new combine shape is to try to force this problem into `map`'s existing pattern — perhaps by mapping every score to either itself or some placeholder value for a failing score, and cleaning up the placeholders afterward in a second pass. The real cost of that alternative is needless indirection: an extra pass over the data, and a placeholder value that has to be chosen carefully enough never to collide with a genuine score. Writing the conditional combine step directly, as this unit does, costs nothing beyond the one additional `if`; it solves the actual problem in a single pass, with no placeholder ever needed.

---

## Concept Unit 2: Filter — Generalizing to Any Predicate

### The Problem

`keep-passing` only ever checks for a score of at least `60`. Exactly the repetition problem Lesson 34 already generalized away for transformations applies here too: a different selection condition — scores above `90`, say, or scores that are even numbers — would need its own, separately written, nearly identical procedure.

### The New Code — Type It Yourself

```scheme
(define (my-filter pred lst)
  (if (null? lst)
      '()
      (if (pred (car lst))
          (cons (car lst) (my-filter pred (cdr lst)))
          (my-filter pred (cdr lst)))))
```

### The Updated Project

This is `my-filter.scm`, in full:

```scheme
(define (my-filter pred lst)
  (if (null? lst)
      '()
      (if (pred (car lst))
          (cons (car lst) (my-filter pred (cdr lst)))
          (my-filter pred (cdr lst)))))

(define (passing? s) (>= s 60))
(define scores (cons 91 (cons 45 (cons 72 (cons 85 (cons 30 '()))))))

(display (my-filter passing? scores))
(newline)
```

### Reference Source

`keep-passing.scm` (Concept Unit 1), with its hardcoded `(>= (car lst) 60)` generalized into `(pred (car lst))`, `pred` supplied as a new parameter — the identical generalizing move Lesson 34, Concept Unit 2, made for `double-all`.

### Files affected

Created: `my-filter.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile my-filter.scm
(91 72 85)
```

Verified this session — identical to `keep-passing.scm`'s output, confirming the generalized version still filters correctly when `passing?` is supplied as `pred`.

### Mechanical Walkthrough

- **`(define (my-filter pred lst) ...)`** — a reappearance of *higher-order function* (Lesson 34), this time taking a predicate specifically — a reappearance of *predicate* (Lesson 13), now passed as a real, callable argument rather than only applied directly.
- **`(pred (car lst))`** — a reappearance of *application* (Lesson 7), applying the parameter `pred` to the current item, exactly the way `my-map`'s `f` was applied in Lesson 34.
- **`(define (passing? s) (>= s 60))`** — a real, named predicate, following Lesson 13's exact form, now genuinely usable as `my-filter`'s argument.
- **The identical output to `keep-passing.scm`** — confirms the generalization preserved exact behavior for this one predicate, while opening `my-filter` to any other predicate as well.

### CS Lens

This is `map`'s exact generalizing move (Lesson 34), applied to a different combine shape: a hardcoded condition, lifted out into a parameter, turning one narrow procedure into a reusable pattern usable with any predicate at all. Also recognized in: a search engine's filter options, letting a user supply any specific criterion rather than the engine offering only one fixed filter; a spreadsheet's filter feature, letting a user supply any condition on any column; a customs inspection's rules, configurable to flag any specific category of goods rather than only one fixed category; a spam filter's rule engine, letting an administrator supply new detection criteria without rewriting the filter itself.

### SE Lens

The alternative to generalizing `keep-passing` into `my-filter` is to write a new, nearly identical procedure for every selection condition ever needed. The real cost of that alternative, precisely as in Lesson 34, is that the entire surrounding structure — base case, recursive case, the two-branch combine logic — gets copied and re-verified for every new condition, when only the condition itself actually needs to vary. Generalizing to `my-filter`, as this unit does, costs the same conceptual step Lesson 34 already required; it means every future selection condition needs only the predicate itself supplied.

---

## Concept Unit 3: Checking my-filter Against Scheme's Real filter

### The Problem

Exactly as Lesson 34 checked `my-map` against Scheme's own built-in `map`, `my-filter` should be checked against Scheme's own built-in `filter`, confirming the hand-derived version agrees with the language's own.

### No isolated lab for this step

This concept has no code of its own to isolate — comparing `my-filter` against the real `filter` is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — Comparing the Two

**Both applied to the identical predicate and list:**

```
$ guile -q
scheme@(guile-user)> (define (my-filter pred lst) (if (null? lst) '() (if (pred (car lst)) (cons (car lst) (my-filter pred (cdr lst))) (my-filter pred (cdr lst)))))
scheme@(guile-user)> (define (passing? s) (>= s 60))
scheme@(guile-user)> (define scores (cons 91 (cons 45 (cons 72 (cons 85 (cons 30 '()))))))
scheme@(guile-user)> (my-filter passing? scores)
$1 = (91 72 85)
scheme@(guile-user)> (filter passing? scores)
$2 = (91 72 85)
```

Verified this session — identical results.

**Confirming this is evidence, not proof, exactly as Lesson 34 and Lesson 22 already established:** agreement on this one predicate and list is what checking a specific example can honestly provide — sufficient reason to trust and use Scheme's built-in `filter` going forward, not a guarantee valid for every conceivable predicate and list.

### Walkthrough

- **`(filter passing? scores)`** — first appearance of Scheme's built-in `filter` (see Objects and methods used), applied identically to Concept Unit 2's `(my-filter passing? scores)`.
- **Both producing `(91 72 85)`** — confirms the two agree on this case, the same checking discipline Lesson 34, Concept Unit 4, already established.
- **The explicit evidence-versus-proof statement** — not a new concept, but a direct, brief reappearance of Lesson 22's distinction, appropriately repeated here rather than assumed carried over silently.

### CS Lens

This is the identical from-scratch-then-checked-against-a-reference pattern Lesson 34 already established for `map`, now applied to `filter` — building understanding first, then adopting the trusted, built-in version for everyday use. Also recognized in: every instance already named in Lesson 34's own Concept Unit 4 — a hand-solved problem checked against a calculator, a prototype checked against a reference design — applying identically here.

### SE Lens

The alternative and its cost are identical to Lesson 34's own Concept Unit 4: skipping the from-scratch build entirely would mean using `filter` without ever understanding what it does underneath, the same black-box risk already argued against there. Building `my-filter` first, as this lesson does, costs the same kind of extra work Lesson 34 already justified; it buys the same kind of complete, inspectable understanding.

---

## Concept Unit 4: Filter Does Not Preserve Length

### The Problem

Lesson 34, Concept Unit 5, proved `map` always produces a result the same length as its input. `filter`'s entire purpose is to sometimes discard items — it would be a direct contradiction if it also preserved length unconditionally. This is worth checking explicitly, precisely because it's easy to instinctively expect all list-processing procedures to behave alike after seeing one clear invariant established.

### No isolated lab for this step

This concept has no code of its own to isolate — the length comparison is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Checking Length Before and After

**Checking `scores`'s length before filtering:**

```
$ guile -q
scheme@(guile-user)> (define (my-length lst) (if (null? lst) 0 (+ 1 (my-length (cdr lst)))))
scheme@(guile-user)> (define (passing? s) (>= s 60))
scheme@(guile-user)> (define scores (cons 91 (cons 45 (cons 72 (cons 85 (cons 30 '()))))))
scheme@(guile-user)> (my-length scores)
$1 = 5
scheme@(guile-user)> (my-length (filter passing? scores))
$2 = 3
```

Verified this session — `5` before, `3` after: two items, `45` and `30`, genuinely removed.

**Stating the correct property precisely, in contrast to `map`'s:** `(my-length (filter pred lst))` is always *at most* `(my-length lst)`, never more — but not, in general, equal to it. The exact length after filtering depends entirely on how many items satisfy `pred`, which can be anywhere from zero (if none do) to the full original length (if all do).

**Confirming both extremes are real, checked directly:**

```
scheme@(guile-user)> (my-length (filter passing? '()))
$3 = 0
scheme@(guile-user)> (my-length (filter (lambda (x) #t) scores))
$4 = 5
```

Verified this session — filtering an empty list produces length `0`; filtering with a predicate that accepts everything preserves the full length `5`.

### Walkthrough

- **`(my-length scores)` and `(my-length (filter passing? scores))`, `5` and `3`** — a reappearance of `my-length` (Lesson 32), used here to check a genuinely different property than Lesson 34's, and finding a genuinely different result.
- **"at most... never more"** — states the correct, weaker property precisely, deliberately distinguished from `map`'s stronger, exact-equality guarantee.
- **The two extreme checks, `0` and `5`** — confirms the range this weaker property actually allows, rather than leaving "at most" as a vague, unverified impression.

### CS Lens

This is the recognition that two closely related higher-order functions, `map` and `filter`, built from the same underlying template, can have meaningfully different guarantees about their own output — and that assuming one's invariant automatically applies to the other is a mistake worth guarding against explicitly. Also recognized in: two similar-looking manufacturing steps, one that relabels every unit (preserving count) and one that inspects and rejects some units (not preserving count); two similar-looking editorial processes, one that edits every submitted article (preserving count) and one that accepts only some for publication (not preserving count); two similar database operations, an `UPDATE` (preserving row count) and a `DELETE ... WHERE` (not preserving row count); two similar quality-control steps, a re-labeling pass and a rejection pass.

### SE Lens

The alternative to checking this explicitly is to assume, based on `map`'s established invariant, that `filter` must behave similarly — a natural but incorrect inference given how similar the two procedures look in code. The real cost of that alternative is exactly the kind of assumption Lesson 8, Concept Unit 3, already warned against for composed functions: two similar-looking things can behave differently, and assuming otherwise without checking is how subtle bugs enter code that relies on a length match that `filter` was never going to provide. Checking `filter`'s actual length behavior directly, at both extremes, as this unit does, costs two additional checks; it replaces an unverified assumption with a precisely stated, confirmed property.

---

## Concept Unit 5: Combining Map and Filter

### The Problem

Real tasks often need both: select only the items satisfying some condition, then transform the ones that remain — curving only the passing scores, say, leaving failing scores out of the result entirely rather than curving those too. This is exactly Lesson 8's composition, now shown for the first time as real, running code.

### No isolated lab for this step

This concept has no code of its own to isolate — composing `filter` and `map` is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — Filter, Then Map

**Both steps, defined separately first:**

```scheme
(define (passing? s) (>= s 60))
(define (curve s) (+ s 5))
```

**Composed directly, in real code, exactly the way Lesson 8 composed `price_after_discount` and `total_with_tax`:**

```scheme
(map curve (filter passing? scores))
```

**Running it for real:**

```
$ guile -q
scheme@(guile-user)> (define (passing? s) (>= s 60))
scheme@(guile-user)> (define (curve s) (+ s 5))
scheme@(guile-user)> (define scores (cons 91 (cons 45 (cons 72 (cons 85 (cons 30 '()))))))
scheme@(guile-user)> (map curve (filter passing? scores))
$1 = (96 77 90)
```

Verified this session — `45` and `30`, filtered out first, never reach `curve` at all; `91, 72, 85` are each curved by `5`, in order.

**Confirming the evaluation order, connecting directly to Lesson 8:** `(filter passing? scores)` is evaluated first, exactly as Lesson 8's inner function application was, producing `(91 72 85)`; `map` is then applied to that already-filtered result, exactly as Lesson 8's outer function was applied to the inner one's result.

### Walkthrough

- **`(map curve (filter passing? scores))`** — first appearance of a real, running composed expression, directly paralleling Lesson 8's `total_with_tax(price_after_discount(...), ...)` in structure: an inner call's result supplying the outer call's argument.
- **`45` and `30`, absent from the final result entirely** — confirms the filtering happens first, and completely, before mapping ever sees the remaining items.
- **`(96 77 90)`, each five more than the filtered values `91, 72, 85`** — confirms `curve` was applied correctly to exactly the items that survived filtering, and no others.

### CS Lens

This is Lesson 8's composition, demonstrated for the first time as genuine, running code rather than mathematical notation — one procedure's real output becoming another's real input, exactly the pattern this curriculum has been building toward since Lesson 3's own receipt calculation. Also recognized in: a factory line that first inspects and rejects defective units, then applies a finishing process only to the units that passed inspection; a hiring pipeline that first screens candidates against minimum qualifications, then interviews only those who passed the screen; a data pipeline that first filters out invalid records, then transforms the valid ones; an editorial process that first rejects submissions not meeting a topic requirement, then edits only the accepted ones.

### SE Lens

The alternative to composing `filter` and `map` directly is to write one combined procedure that both checks the condition and applies the transformation in a single pass, the way `keep-passing` combined both jobs into one hand-written recursive procedure before Concept Unit 2 separated the condition out. The real cost of that alternative is exactly Lesson 8's original argument for composition over duplication: a single combined procedure has to be individually written, tested, and maintained for every specific pairing of condition and transformation, while composing two already-correct, already-tested procedures — `filter` and `map`, both trusted since Concept Unit 3 — costs nothing beyond writing the composition itself, and inherits both procedures' already-established correctness directly.

---

## Closing

### Connect the pieces

One list of scores, `(91 45 72 85 30)`, traced through every unit built in this lesson, start to finish:

1. **A new combine shape (Unit 1):** `keep-passing`, conditionally including an item or adding nothing at all, producing `(91 72 85)`.
2. **The condition generalized (Unit 2):** `my-filter`, taking a predicate as a parameter — Lesson 34's higher-order-function generalization, applied to selection instead of transformation.
3. **Checked against the real built-in (Unit 3):** `my-filter` and `filter`, agreeing exactly on `passing?` and `scores`.
4. **A different invariant, checked explicitly (Unit 4):** length reduced from `5` to `3`, with both extremes (`0` and `5`) confirmed as real possibilities, in direct contrast to `map`'s exact preservation.
5. **Composed with map, for real (Unit 5):** `(map curve (filter passing? scores))`, producing `(96 77 90)` — Lesson 8's composition, now genuine running code.

Unit 5's composed expression uses the exact `passing?` predicate from Unit 2 and Unit 3, and the exact `scores` list every prior unit examined — nothing in this lesson's closing unit introduced a fresh, unrelated example.

### What breaks without this

Suppose code elsewhere assumed, by analogy with `map`'s established length-preservation, that `(filter pred lst)` could always be safely paired up, item by item, with the original `lst` — for instance, assuming the third item of a filtered result always corresponds to the third item of the original list. Applied to `scores`, filtered down to `(91 72 85)`, the third filtered item is `85` — but `85` was the *fourth* item in the original list, `scores`; the third original item, `72`, is now the second filtered item, because `45`, the second original item, was removed entirely. Any code relying on position-based correspondence between a filtered list and its original would silently associate results with the wrong original items the moment even one item gets filtered out, exactly the misalignment risk Lesson 34's own closing warned about for a broken `map` — except here, it's not a bug in `filter` causing it; it's a correct, working `filter` being used under an assumption that only ever held for `map`. Restoring this lesson's discipline — checking which specific invariant a given higher-order function actually provides, rather than assuming every list-processing procedure behaves like the last one examined — is what prevents this exact category of mistake.

### Exercises

1. **Observe.** Write a predicate of your own (something other than `passing?`), following Lesson 13's exact form, the way Concept Unit 2 defined `passing?`.
2. **Formalize.** Apply your Exercise 1 predicate through `my-filter` to a list of your own choosing, predicting the result before running it.
3. **Explain.** Apply Scheme's built-in `filter` to the same predicate and list, and confirm it matches your Exercise 2 result, the way Concept Unit 3 compared `my-filter` and `filter`.
4. **Explain.** Check your Exercise 2 result's length against the original list's length using `my-length`, the way Concept Unit 4 did for `scores`, and state whether your predicate happened to accept everything, nothing, or something in between.
5. **Formalize.** Compose your Exercise 1 predicate with a transformation of your own (via `filter` then `map`, in that order), the way Concept Unit 5 composed `passing?` and `curve`, and confirm the composed result by hand before checking it against real output.

### Definition of done

- [ ] You can write a predicate-taking procedure that selects list items, deriving its base case and combine step explicitly rather than copying `my-filter`'s structure without deriving it.
- [ ] You can state, precisely, why `filter`'s length guarantee is weaker than `map`'s, and demonstrate both extremes (accepting everything, accepting nothing) with real output.
- [ ] You can compose a `filter` and a `map` in real running Scheme code, and explain, using Lesson 8's vocabulary, which one's output supplies the other's input.
- [ ] You can compare a hand-built filtering procedure against Scheme's built-in `filter` and state what that comparison does and doesn't establish.
- [ ] You completed Exercises 1–5 using a predicate and transformation of your own, not `passing?` or `curve`.
- [ ] Commit your Exercise 1 predicate, your `my-filter` applications, and your Exercise 5 composition, with a commit message stating what fraction of your Exercise 2 list survived your own predicate.
