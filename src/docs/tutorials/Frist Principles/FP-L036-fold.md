# Lesson 36: Fold

**What you will build:** A real, working `my-fold` procedure that generalizes every list-processing procedure this curriculum has written so far — `my-length`, `sum-list`, `my-map`, `my-filter` — into instances of a single pattern, plus a check against Scheme's own built-in `fold` and `fold-right`, which turn out to disagree with each other in a way worth understanding precisely. The transferable problem this lesson is actually about: Lesson 34 generalized *what transformation* gets applied; Lesson 35 generalized *what condition* selects an item. Neither one generalized the actual combining step itself — and once that's generalized too, it becomes clear that `map`, `filter`, `my-length`, and `sum-list` were never four different techniques. They were one technique, applied four different ways.

**What you need to know first:** Lesson 32 (`FP-L032-lists.md`) through Lesson 35 (`FP-L035-filter.md`) — specifically every list-processing procedure built across those lessons, all reappearing directly in Concept Unit 3 as instances of this lesson's single generalized pattern.

**Terms introduced in this lesson**

- **Accumulation** — building up a single result by repeatedly combining each item of a collection with whatever has been combined so far. Every list-processing procedure this curriculum has written — counting, summing, transforming, selecting — has been an instance of accumulation, using a different combining rule and a different starting value each time, without this lesson's vocabulary yet available to say so.

## Objects and methods used

- **`fold`**
  - *What it is:* Scheme's own built-in procedure implementing this lesson's central pattern, processing a list from left to right.
  - *Implementation:* takes a combining procedure, a starting value, and a list, `(fold proc knil lst)`, calling `proc` as `(proc item accumulated-so-far)` for each item in order; confirmed this session using the SRFI-1 library, loaded with `(use-modules (srfi srfi-1))`.
  - *Its use:* Concept Unit 4 checks `my-fold` against `fold` directly, and separately checks `fold` against `fold-right` to reveal a genuine, order-dependent difference between them.
- **`fold-right`**
  - *What it is:* Scheme's own built-in procedure implementing the same pattern, processing a list from right to left instead.
  - *Implementation:* takes the same three arguments as `fold`, calling `proc` as `(proc item accumulated-so-far)` starting from the *last* item of the list rather than the first; confirmed this session.
  - *Its use:* Concept Unit 4 uses `fold-right` specifically to demonstrate that combining direction, not just the combining rule, can change a fold's actual result.

---

## Concept Unit 1: Looking Back at Every Combine Step So Far

### The Problem

`my-length`'s combine step was `(+ 1 (my-length (cdr lst)))`. `sum-list`'s was `(+ (car lst) (sum-list (cdr lst)))`. `my-map`'s was `(cons (f (car lst)) (my-map f (cdr lst)))`. `my-filter`'s was a conditional between two of those shapes. Every one of them, examined side by side, has exactly the same skeleton: take the current item, take the result of recursing on the rest, and combine the two into a single value. Only *what counts as combining* has ever actually changed.

### No isolated lab for this step

This concept has no code of its own to isolate — comparing four already-written procedures is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Four Procedures, One Skeleton

**`my-length`'s combine step, isolated:** given the current item (ignored) and the recursive result, produce `(+ 1 recursive-result)`.

**`sum-list`'s combine step, isolated:** given the current item and the recursive result, produce `(+ item recursive-result)`.

**`my-map`'s combine step, isolated:** given the current item and the recursive result, produce `(cons (f item) recursive-result)`.

**The shared skeleton, made explicit by removing what each one actually does with its two inputs:**

```scheme
(define (process lst)
  (if (null? lst)
      <base-value>
      (<combine> (car lst) (process (cdr lst)))))
```

**Confirming this is Lesson 33's own template, examined once more, now with `<combine>` recognized as a genuine, fillable function of exactly two arguments — the current item, and the recursive result — rather than a fixed piece of code rewritten by hand each time.**

### Walkthrough

- **`my-length`, `sum-list`, and `my-map`'s combine steps, listed side by side** — direct reappearances of Lessons 32 through 34's own procedures, examined here specifically for what they share.
- **The shared skeleton, matching Lesson 33's template exactly** — a reappearance of *structural recursion*, now with `<combine>` understood precisely as a two-argument function, setting up Concept Unit 2's actual generalization.

### CS Lens

This is the recognition that four things that felt like four separate skills — counting, summing, transforming, selecting — are, structurally, the exact same operation with a different two-argument function plugged in each time. Also recognized in: four different factory processes — counting units, weighing units, repackaging units, sorting units — all built on the identical conveyor-belt structure, differing only in what happens at the single inspection station; four different financial calculations — a running total, a running count, a running maximum, a running average — all built on the identical "process one transaction, update the running value" loop; four different essay-grading tasks — counting words, tallying grammar errors, extracting keywords, filtering off-topic sentences — all built on the identical "look at one sentence, update the accumulated result" process.

### SE Lens

The alternative to noticing this shared skeleton is to continue treating each new list-processing need as its own problem, the way this curriculum did from Lesson 32 through Lesson 35, deriving each one individually from Lesson 33's template without ever generalizing the template's own combine step into something directly reusable. The real cost of that alternative, now made fully visible, is redundant work: four separate derivations, each one re-deriving the same "check `null?`, combine the first item with the recursive result" reasoning, when the only genuinely new information in each case was a two-argument function. Recognizing the shared skeleton explicitly, as this unit does, costs nothing beyond the comparison itself; it sets up Concept Unit 2 to generalize the *entire* template at once, not just one blank at a time.

---

## Concept Unit 2: Fold — Taking the Combine Function Itself as a Parameter

### The Problem

Lesson 34 generalized `<combine>`'s transformation. Lesson 35 generalized `<combine>`'s condition. Neither one generalized `<combine>` itself — the actual two-argument function deciding how an item and a recursive result become a single new value. Doing that fully means writing one procedure that takes *three* things: the combining function, the base value, and the list.

### The New Code — Type It Yourself

```scheme
(define (my-fold combine base lst)
  (if (null? lst)
      base
      (combine (car lst) (my-fold combine base (cdr lst)))))
```

### The Updated Project

This is `my-fold.scm`, in full:

```scheme
(define (my-fold combine base lst)
  (if (null? lst)
      base
      (combine (car lst) (my-fold combine base (cdr lst)))))

(define scores (list 91 85 72))

(display (my-fold + 0 scores))
(newline)
```

### Reference Source

Lesson 33's structural-recursion template, with *both* of its blanks — `<base-value>` and `<combine>` — now supplied as real parameters, rather than one being hardcoded into the procedure's own body.

### Files affected

Created: `my-fold.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile my-fold.scm
248
```

Verified this session — `(my-fold + 0 scores)` sums `91 + 85 + 72` correctly, using `+` supplied directly as the combining function.

### Mechanical Walkthrough

- **`(define (my-fold combine base lst) ...)`** — first appearance of a procedure taking *two* higher-order-relevant parameters at once: `combine`, a function, and `base`, an ordinary value — both of Lesson 33's template blanks, now genuine parameters rather than choices baked into the procedure's own body.
- **`(if (null? lst) base ...)`** — the base case, now `base` itself rather than a hardcoded `0` or `'()` — the template's `<base-value>` blank, filled by the caller rather than the procedure's author.
- **`(combine (car lst) (my-fold combine base (cdr lst)))`** — the recursive case, calling `combine` with the current item and the recursive result — exactly Concept Unit 1's shared skeleton, with `combine` itself supplied as an argument, a reappearance of *higher-order function* (Lesson 34).
- **`(my-fold + 0 scores)`, with `+` supplied directly as `combine`** — confirms `+`, an ordinary Scheme procedure (Lesson 28), can be passed as `my-fold`'s argument exactly the way `double` and `passing?` were passed to `my-map` and `my-filter`.

### CS Lens

This is the maximally general version of Lesson 33's template — not one blank generalized at a time, the way `map` and `filter` each generalized only one, but both generalized simultaneously, producing a single procedure capable of expressing every one of this curriculum's earlier list-processing procedures as a specific choice of its two arguments. Also recognized in: a universal factory station, configurable with both an inspection rule and a starting condition, capable of implementing counting, weighing, sorting, or rejecting depending purely on what's plugged in; a spreadsheet's generic aggregation formula, configurable with both an operation (`SUM`, `MAX`, `COUNT`) and a starting value; a general-purpose financial ledger, configurable with both a starting balance and a rule for how each transaction updates it; a board game's generic scoring engine, configurable with both a starting score and a rule for how each move updates it.

### SE Lens

The alternative to fully generalizing the template is to stop at Lesson 35's level of generalization, writing a new higher-order function every time a new *kind* of combining is needed — `map` for transformation, `filter` for selection, and, inevitably, a third and fourth specialized function for whatever comes next. The real cost of that alternative is an ever-growing collection of specialized tools, each one a legitimate but separate generalization, when a single, maximally general one — `fold` — could express all of them and more. Writing `my-fold` with both blanks generalized, as this unit does, costs a slightly more abstract procedure to understand at first; it buys a tool general enough that Concept Unit 3 can derive every earlier procedure from it directly, with nothing left to specially generalize again.

---

## Concept Unit 3: Deriving Earlier Procedures as Instances of Fold

### The Problem

Concept Unit 2's claim — that `my-fold` generalizes everything built so far — is only actually true if every earlier procedure can be expressed as a specific call to `my-fold`. This is worth checking directly, one procedure at a time, rather than simply asserted.

### No isolated lab for this step

This concept has no code of its own to isolate — deriving four earlier procedures as fold instances is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — Rebuilding Four Procedures From Fold Alone

**`sum-list`, as a fold:**

```scheme
(my-fold + 0 scores)
```

**`my-length`, as a fold, using a combine function that ignores its item and adds one to the accumulated result:**

```scheme
(my-fold (lambda (item acc) (+ 1 acc)) 0 scores)
```

**`double-all` (Lesson 34's `map`, specialized to doubling), as a fold, using `cons` composed with the doubling itself:**

```scheme
(my-fold (lambda (item acc) (cons (* 2 item) acc)) '() scores)
```

**Running all three for real, checked against each earlier procedure's already-verified results:**

```
$ guile -q
scheme@(guile-user)> (define (my-fold combine base lst) (if (null? lst) base (combine (car lst) (my-fold combine base (cdr lst)))))
scheme@(guile-user)> (define scores (list 91 85 72))
scheme@(guile-user)> (my-fold + 0 scores)
$1 = 248
scheme@(guile-user)> (my-fold (lambda (item acc) (+ 1 acc)) 0 scores)
$2 = 3
scheme@(guile-user)> (my-fold (lambda (item acc) (cons (* 2 item) acc)) '() scores)
$3 = (182 170 144)
```

Verified this session — `248`, matching `sum-list.scm`'s own result exactly (Lesson 33); `3`, matching `my-length`'s result exactly (Lesson 32); `(182 170 144)`, matching `double-all.scm`'s result exactly (Lesson 34).

### Walkthrough

- **`(my-fold + 0 scores)`** — `sum-list`, rebuilt with no procedure of its own, just a specific choice of `combine` (`+`) and `base` (`0`).
- **`(lambda (item acc) (+ 1 acc))`** — first real use of an anonymous function in this curriculum, needed here because `my-length`'s combine rule (ignore the item, add one) has no natural existing name the way `+` does — Scheme's own way of writing a function without `define`ing it first, a full treatment of which belongs to a later lesson; used here only because `my-fold` needs some function value, and this is the smallest way to supply one.
- **All three real results, matching three already-verified earlier procedures exactly** — not a new concept, but the concrete confirmation that Concept Unit 2's claim was correct: these were never separate techniques, only separate choices of the same two arguments.

### CS Lens

This is the payoff of full generalization: a claim that several specific tools are all instances of one general tool is only genuinely established once every specific tool has actually been rebuilt from the general one and checked to agree — exactly the derivation discipline Lesson 33, Concept Unit 3, already modeled for `contains?`. Also recognized in: a unified theory in physics, only genuinely validated once it correctly reproduces every specific, previously separate law it claims to generalize; a general-purpose tool in a workshop, only genuinely proven versatile once it's actually been used to replace several specialized tools and checked to do their jobs correctly; a universal remote, only genuinely useful once it's actually been programmed to replace several separate remotes and checked against each device.

### SE Lens

The alternative to rebuilding earlier procedures explicitly is to simply assert that `fold` is "more general" and trust the claim on its face. The real cost of that alternative is exactly Lesson 22's warning about unverified claims: a plausible-sounding generalization can still be subtly wrong — perhaps `my-fold`'s specific argument order doesn't actually support one of the cases it claims to. Actually deriving and checking three separate earlier procedures, as this unit does, costs the real effort of the derivations themselves; it is what turns "fold is general" from an assertion into a demonstrated fact.

---

## Concept Unit 4: Scheme's Real fold — and a Genuine Surprise About Direction

### The Problem

`my-fold` should be checked against Scheme's own built-in version, exactly as `my-map` and `my-filter` were. Doing so surfaces something worth understanding carefully: Scheme actually provides two built-in fold procedures, `fold` and `fold-right`, and they do not always agree.

### No isolated lab for this step

This concept has no code of its own to isolate — comparing `my-fold` against both real built-ins is demonstrated directly below, not through a new construct with its own syntax.

### Applying It — fold vs. fold-right

**Checking `my-fold` against Scheme's real `fold` for summing, where order shouldn't matter:**

```
$ guile -q
scheme@(guile-user)> (use-modules (srfi srfi-1))
scheme@(guile-user)> (define (my-fold combine base lst) (if (null? lst) base (combine (car lst) (my-fold combine base (cdr lst)))))
scheme@(guile-user)> (define scores (list 91 85 72))
scheme@(guile-user)> (my-fold + 0 scores)
$1 = 248
scheme@(guile-user)> (fold + 0 scores)
$2 = 248
```

Verified this session — agreement, unsurprising since `+` doesn't care about order (Lesson 15, Concept Unit 4).

**Checking both against `cons`, where order very much does matter:**

```
scheme@(guile-user)> (fold cons '() scores)
$3 = (72 85 91)
scheme@(guile-user)> (fold-right cons '() scores)
$4 = (91 85 72)
scheme@(guile-user)> (my-fold cons '() scores)
$5 = (91 85 72)
```

Verified this session — `fold` produces the *reversed* list, `(72 85 91)`; `fold-right` and `my-fold` both produce the original order, `(91 85 72)`.

**Explaining precisely why, rather than treating it as an unexplained quirk:** `my-fold` processes `scores`'s first item, `91`, *last* — its recursion goes all the way down to the base case before any `cons` actually happens, so the deepest, final `cons` is the one involving `91`, placing it at the front of the final result. Scheme's built-in `fold` instead processes items left to right, calling `(cons 91 base)` first, then `(cons 85 (that result))`, and so on — each new item gets `cons`ed onto the *front* of an already-built, growing list, which reverses the original order. `fold-right`, true to its name, processes right to left, exactly matching `my-fold`'s own recursive structure.

### Walkthrough

- **`(fold + 0 scores)` matching `(my-fold + 0 scores)`** — confirms agreement for a combining function where order doesn't matter, exactly the situation Lesson 15's `AND`/`OR` symmetry already covered for a different operator.
- **`(fold cons '() scores)` producing `(72 85 91)`, the reversed list** — a genuine, real disagreement with `my-fold`, worth taking seriously rather than dismissing.
- **`(fold-right cons '() scores)` producing `(91 85 72)`, matching `my-fold` exactly** — resolves the apparent disagreement: `my-fold` was never wrong; it simply matches `fold-right`'s direction, not `fold`'s.
- **The explicit, mechanical explanation of why left-to-right processing with `cons` reverses order** — not a new concept, but a direct, careful account of exactly what's happening, in the same spirit as Lesson 8's insistence on checking, rather than assuming, whether an operation's order matters.

### CS Lens

This is a concrete, real instance of Lesson 8's central warning — composing or applying operations in a different order can produce a genuinely different result, and assuming otherwise without checking is a real source of error — here surfacing inside Scheme's own standard library rather than in a constructed example. Also recognized in: a spreadsheet's running total, correct only if transactions are processed in the actual order they occurred; a document version history, correct only if edits are replayed in their actual order; a recipe's steps, correct only if performed in their stated order; a bank's transaction processing, correct only if deposits and withdrawals are applied in their actual chronological order, exactly Lesson 6's own order-dependence lesson.

### SE Lens

The alternative to checking `my-fold` against both `fold` and `fold-right` is to check it against only one of them, notice a mismatch, and conclude — incorrectly — that `my-fold` itself must be broken. The real cost of that alternative is a wasted debugging effort chasing a bug that doesn't exist, when the actual issue is a mismatch in a convention (which direction to process the list) that was never stated or checked. Checking against both real built-ins, and working out precisely why they differ, as this unit does, costs one additional comparison and one careful explanation; it turns a confusing discrepancy into a precisely understood, expected difference in processing direction.

---

## Concept Unit 5: Fold Lets You Build Anything — But Readability Has a Cost

### The Problem

Concept Unit 3 showed `fold` can express `sum-list`, `my-length`, and `map`-style transformation, all from one procedure. It would be a mistake to conclude from this that `fold` should therefore replace `map` and `filter` everywhere. It's worth stating honestly why it usually shouldn't.

### No isolated lab for this step

This concept has no code of its own to isolate — the readability comparison is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Comparing Two Ways to Double a List

**Doubling every score, written using `map` (Lesson 34):**

```scheme
(map (lambda (x) (* 2 x)) scores)
```

**The identical result, written using `fold` instead:**

```scheme
(fold-right (lambda (item acc) (cons (* 2 item) acc)) '() scores)
```

**Both checked to produce the identical result:**

```
scheme@(guile-user)> (map (lambda (x) (* 2 x)) scores)
$6 = (182 170 144)
scheme@(guile-user)> (fold-right (lambda (item acc) (cons (* 2 item) acc)) '() scores)
$7 = (182 170 144)
```

Verified this session — identical output, from meaningfully different amounts of code and required understanding.

**Stating the honest tradeoff directly:** the `map` version says exactly what it does — "transform every item" — in a name a reader recognizes instantly. The `fold-right` version says *how* to achieve the same result in terms of a more general mechanism, requiring a reader to reconstruct "oh, this is doubling every item" from the combining logic itself, rather than being told directly by the procedure's name.

### Walkthrough

- **`(map (lambda (x) (* 2 x)) scores)`** — a reappearance of Lesson 34's `map`, chosen here specifically for its readability.
- **`(fold-right (lambda (item acc) (cons (* 2 item) acc)) '() scores)`** — the equivalent expressed through `fold-right`, deliberately written to compute the identical result, so the comparison isolates readability rather than correctness.
- **The explicit, honest tradeoff statement** — not a new concept, but a direct, mature engineering judgment, in the same spirit as Lesson 25's own honest closing about proof not replacing testing: generality and readability are two different virtues, and maximizing one doesn't automatically maximize the other.

### CS Lens

This is the recognition that the most general available tool is not automatically the best choice for every specific job — a real, recurring tension in engineering between expressive power and immediate clarity. Also recognized in: choosing a specific hand tool over a fully general multi-tool, when the specific tool communicates its purpose at a glance; choosing a named, purpose-built legal clause over a more general, flexible one that technically covers the same situation but obscures the specific intent; choosing a specific, well-named recipe technique over describing the same physical process from first principles every time; choosing a domain-specific database query over an equivalent, fully general one written in a lower-level query language.

### SE Lens

The alternative to stating this tradeoff honestly is to treat Concept Unit 3's demonstration — that `fold` can express everything — as a reason to prefer `fold` everywhere, on the grounds that fewer distinct tools are simpler to remember. The real cost of that alternative is exactly what this unit's side-by-side comparison shows: code that technically does less work to write, in the sense of using one universal tool, but more work to *read*, since every reader has to mentally reconstruct what specific, common operation a general-purpose fold expression is actually performing. Choosing `map` or `filter` when they fit, and reaching for the fully general `fold` only when neither does, as this unit recommends, costs the discipline of recognizing which specific tool best matches the job; it is what keeps code readable by whoever encounters it next, including, eventually, the person who wrote it.

---

## Closing

### Connect the pieces

One list, `scores`, and four earlier procedures, traced through every unit built in this lesson, start to finish:

1. **The shared skeleton noticed (Unit 1):** `my-length`, `sum-list`, and `my-map`'s combine steps, compared directly and found structurally identical.
2. **Both template blanks generalized (Unit 2):** `my-fold`, taking `combine` and `base` as real parameters.
3. **Earlier procedures rebuilt and checked (Unit 3):** `sum-list`, `my-length`, and `double-all`, each reproduced exactly using only `my-fold` and a specific choice of arguments.
4. **A genuine surprise, explained precisely (Unit 4):** `fold` and `fold-right` disagreeing on `cons`, resolved by identifying `my-fold`'s own processing direction.
5. **An honest tradeoff, stated directly (Unit 5):** `map` preferred over an equivalent `fold-right` expression, purely for readability.

Unit 5's comparison uses the exact `scores` list and the exact doubling operation Unit 3 already derived through `my-fold` — nothing in this lesson's closing unit introduced a fresh, unrelated example.

### What breaks without this

Suppose a later piece of code needed to build a new list from an existing one, and its author, having just learned `fold` is maximally general, reached for `(fold cons '() lst)` specifically hoping to get a copy of `lst` back — a reasonable-looking, but incorrect, assumption, given Concept Unit 4's own finding that `fold` with `cons` actually reverses a list, while `fold-right` preserves it. Every downstream use of the resulting list, if it depended on the original order — displaying scores in the order they were entered, say — would silently receive them in reverse, with nothing about the code itself signaling an error: `fold` ran successfully, `cons` is a completely ordinary operation, and the result is a perfectly well-formed list, just not the one intended. Restoring Concept Unit 4's discipline — knowing precisely which direction a given fold processes its list in, and checking a combining function's order-sensitivity the way Lesson 8 already insisted on checking composition order — is what prevents this exact, easy-to-make mistake.

### Exercises

1. **Observe.** Take two procedures from your own Lesson 33, 34, or 35 exercises, and identify their shared skeleton, the way Concept Unit 1 compared `my-length`, `sum-list`, and `my-map`.
2. **Formalize.** Rebuild both of your Exercise 1 procedures using `my-fold`, choosing the appropriate `combine` and `base` for each, the way Concept Unit 3 rebuilt `sum-list` and `my-length`.
3. **Explain.** Run your Exercise 2 fold-based versions and check them against your original procedures' already-verified results, the way Concept Unit 3 checked against `double-all.scm`'s output.
4. **Formalize.** Write a `combine` function where order genuinely matters (not `+`, which doesn't), and check it against both Scheme's `fold` and `fold-right`, the way Concept Unit 4 checked `cons`. Explain any disagreement precisely.
5. **Explain.** Choose one of your Exercise 2 fold-based procedures and compare it, side by side, against writing the same operation using `map` or `filter` directly, the way Concept Unit 5 compared doubling written both ways. State which version you find more readable, and why.

### Definition of done

- [ ] You can identify the shared skeleton across two or more list-processing procedures you've already written.
- [ ] You can rebuild a specific earlier procedure using only `my-fold` and a chosen `combine` and `base`, and verify it produces the identical result.
- [ ] You can explain, precisely, why `fold` and `fold-right` can disagree for a combining function like `cons`, and state which one matches a given hand-written recursive procedure's own processing direction.
- [ ] You can state a genuine case for preferring `map` or `filter` over an equivalent `fold`, in your own words, rather than treating generality as an unconditional good.
- [ ] You completed Exercises 1–5 using your own earlier procedures, not `sum-list`, `my-length`, or `double-all`.
- [ ] Commit your Exercise 2 fold-based procedures and your Exercise 4 order-sensitive combine function, with a commit message stating which of `fold` or `fold-right` matched your Exercise 4 function's intended behavior, and why.
