# Lesson 32: Lists

**What you will build:** A real, working list of quiz scores built entirely from two primitives — the empty list and a single pairing operation — plus a length-counting procedure that reveals lists are built using exactly the same base-case-and-recursive-case shape as `factorial`. The transferable problem this lesson is actually about: Lesson 1's forty quiz scores, Lesson 14's five-item domain, and every other "collection" this curriculum has discussed have all been described informally, never actually built as a real, inspectable data structure. A list is that structure, and it turns out to be recursive data — built the same way a recursive definition is built, just with data instead of numbers.

**What you need to know first:** Lesson 15 (`FP-L015-sets.md`) — specifically *set*, deliberately contrasted here: a list, unlike a set, cares about both order and repetition. Lesson 27 (`FP-L027-recursive-definitions.md`) — specifically *base case* and *recursive case*, both directly extended to a data structure rather than a numeric function in Concept Unit 5.

**Terms introduced in this lesson**

- **Pair** — a Scheme value holding exactly two other values, constructed with `cons` and accessed with `car` (the first) and `cdr` (the second, pronounced "could-er," a name with historical rather than descriptive origins). A pair is Scheme's single, minimal building block for structured data — everything a list is built from is nothing but pairs, nested inside each other.
- **List** — either the empty list, `'()`, or a pair whose second element (its `cdr`) is itself a list. This is a recursive definition in the exact sense Lesson 27 already established: `'()` is the base case, and a pair built from an item and a smaller list is the recursive case.

## Objects and methods used

- **`cons`**
  - *What it is:* the real Scheme procedure that constructs a pair from two values.
  - *Implementation:* takes exactly two arguments, `(cons a b)`, and returns a new pair whose first element is `a` and whose second is `b` — confirmed this session.
  - *Its use:* every list in this lesson is built by repeatedly applying `cons`, one item at a time, onto a smaller list — the actual mechanism behind *recursive case* applied to data.
- **`car`**
  - *What it is:* the real Scheme procedure that retrieves a pair's first element.
  - *Implementation:* takes one pair as its argument; applying it to anything that isn't a pair (including the empty list) is an error — confirmed this session.
  - *Its use:* retrieving the first item of a list — the item most recently `cons`ed onto the front.
- **`cdr`**
  - *What it is:* the real Scheme procedure that retrieves a pair's second element.
  - *Implementation:* takes one pair as its argument, with the same restriction as `car` — confirmed this session.
  - *Its use:* when the pair is a list, `cdr` retrieves "the rest of the list" — everything except the first item — which is itself a smaller list, exactly the smaller instance a recursive case needs.
- **`null?`**
  - *What it is:* the real Scheme predicate (Lesson 13) that checks whether a value is the empty list.
  - *Implementation:* takes one argument, returns `#t` for `'()` and `#f` for anything else — confirmed this session.
  - *Its use:* the guard for a list's base case, checked before ever calling `car` or `cdr`, both of which are undefined on the empty list.

---

## Concept Unit 1: Representing a Sequence Recursively

### The Problem

Lesson 1's forty quiz scores, Lesson 14's five-item domain, `{72, 85, 91, 45, 100}` — every one of these has been described informally, as a stack of paper or a set written with curly braces, but never actually built as something a real program can construct, inspect, and take apart piece by piece. What's needed is a way to represent "a sequence of items" using nothing but tools already available: values (Lesson 3), and a way to combine two values into a larger structure.

### No isolated lab for this step

This concept has no code of its own to isolate — the motivating gap is demonstrated directly below, not through a construct with its own syntax.

### Applying It — What "a Sequence" Actually Needs

**What a sequence of scores needs to represent, stated precisely:** an ordered collection where an item can be retrieved, where more items can be added, and where "no items left" is itself a real, checkable state — not merely the absence of a program crashing, but something a running program can actually test for.

**Confirming nothing built so far provides this:** Lesson 15's sets explicitly discard order (Lesson 15, Concept Unit 1) and cannot represent repetition — wrong for a sequence, where both matter. A single value (Lesson 3) holds exactly one thing, with no way to hold "and then the rest."

**What Concept Unit 2 and 3 will build instead:** a structure defined the same way *any* recursive idea in this curriculum has been defined since Lesson 27 — a base case (the smallest possible sequence) and a recursive case (a bigger sequence built from a smaller one).

### Walkthrough

- **Lesson 1's forty scores and Lesson 14's five-item domain, both reappearing** — examined here specifically for what representing them for real would actually require.
- **The explicit contrast with Lesson 15's sets** — a reappearance of *set*, distinguished precisely from what's needed here: order and repetition, which a set was deliberately built to discard.
- **"a base case... and a recursive case"** — not a new concept, but a direct forward-reference to Lesson 27's exact vocabulary, previewing the shape the rest of this lesson will build.

### CS Lens

This is the recognition that "a sequence" is not a primitive notion needing its own special machinery — it can be built entirely from tools this curriculum already has, the same way Lesson 10's Boolean values were built from nothing but Lesson 3's general notion of a value. Also recognized in: a train, built from nothing but individual cars, each one connected to the next; a sentence, built from nothing but individual words in sequence; a staircase, built from nothing but individual steps, each one leading to the next; a chain, built from nothing but individual links.

### SE Lens

The alternative to building sequences from first principles is to treat "a list" as an unexplained primitive, available for use without ever understanding what it's actually made of. The real cost of that alternative is exactly what this curriculum's own philosophy warns against: a black box a learner can use but not reason about, unable to predict its behavior in an unfamiliar situation because its actual construction was never shown. Building lists from `cons` and the empty list, as the rest of this lesson does, costs the extra step of starting from primitives rather than a ready-made structure; it buys a complete, inspectable understanding of exactly what a list is, all the way down.

---

## Concept Unit 2: The Empty List — the Base Case for Sequences

### The Problem

Every recursive definition in this curriculum has needed an explicit base case, stated directly, with no self-reference (Lesson 27). A sequence's base case needs to represent "zero items" — and, per Lesson 29's insistence on checking a base case precisely, it needs to be something a running program can actually test for, not just informally understand.

### Introduce the Concept in Isolation

```scheme
(display (null? '())) (newline)
(display (null? (list 1 2))) (newline)
```

Run, producing real output:

```
$ guile empty1.scm
#t
#f
```

Verified this session. `'()`, the empty list, satisfies `null?`; a list with actual items in it does not.

This isolated example is discarded now; it will not appear in this lesson's real project again.

### Project Change

**Reference Source:** No reference counterpart — a from-scratch introduction of Scheme's built-in empty-list value.

**Files affected:** A new throwaway file, `empty1.scm`.

**Change type:** Add (new, temporary file).

**Location:** Not applicable.

**Dependencies:** The Guile interpreter (Lesson 28).

### Mechanical Walkthrough

- **`'()`** — first appearance of the empty list, Scheme's own base-case value for sequences, written with a leading quote mark to distinguish it from an empty procedure call (a distinction this curriculum will examine precisely once quoting itself is introduced).
- **`(null? '())`** — first appearance of `null?` (see Objects and methods used), checked against the empty list itself, confirming it correctly identifies its own base case.
- **`(null? (list 1 2))`** — the same check against a non-empty list, confirming `null?` correctly rejects a case that isn't the base case, exactly the exhaustive-checking discipline Lesson 29 already modeled for base cases in general.

### CS Lens

This is the same base case Lesson 27 already required for factorial and Fibonacci, now applied to data rather than to a number — `'()` plays exactly the role `0! = 1` and `fib(0) = 0` played, a directly-defined, self-reference-free foundation. Also recognized in: an empty shopping cart, the base case for "items in a cart"; a blank page, the base case for "lines of text"; an empty room, the base case for "people in the room"; silence, the base case for "notes in a melody."

### SE Lens

The alternative to a real, checkable empty-sequence value is to represent "no items" some other way — a special number like `-1`, or simply never handling the case at all. The real cost of that alternative is exactly Lesson 29's warning about a present-but-wrong base case, transplanted to data: a special sentinel value invites exactly the kind of off-by-one confusion Lesson 29 demonstrated, and no handling at all invites Lesson 27's unbounded regress. `'()`, checked with `null?`, costs nothing beyond using what Scheme already provides; it gives every list-processing procedure in this curriculum a base case exactly as reliable as `factorial`'s `0`.

---

## Concept Unit 3: cons — Building a List One Item at a Time

### The Problem

The empty list alone can only ever represent zero items. Building a real sequence of quiz scores needs a way to combine one item with an already-existing (possibly empty) sequence, producing a new, larger sequence — precisely the shape of a recursive case, applied to structure instead of arithmetic.

### Introduce the Concept in Isolation

```scheme
(define one-pair (cons 91 100))
(display one-pair) (newline)
(display (car one-pair)) (newline)
(display (cdr one-pair)) (newline)
```

Run, producing real output:

```
$ guile cons1.scm
(91 . 100)
91
100
```

Verified this session. `(cons 91 100)` builds a pair holding both values; `(91 . 100)` is Scheme's own way of displaying a pair whose second element isn't itself a list — a detail Concept Unit 4 explains directly.

This isolated example is discarded now; it will not appear in this lesson's real project again.

### Project Change

**Reference Source:** No reference counterpart.

**Files affected:** A new throwaway file, `cons1.scm`.

**Change type:** Add (new, temporary file).

**Location:** Not applicable.

**Dependencies:** The Guile interpreter.

### Mechanical Walkthrough

- **`(cons 91 100)`** — first appearance of `cons` (see Objects and methods used), building a pair from two plain values.
- **`(91 . 100)`** — Scheme's printed form for a pair, with a dot separating its two elements — this dot is a genuine part of the notation, not a typo, and it appears specifically because `100` here is a plain number, not itself a list.
- **`(car one-pair)` and `(cdr one-pair)`** — first appearance of `car` and `cdr` (see Objects and methods used), retrieving exactly the two values `cons` combined, confirming the pair genuinely holds both.

### CS Lens

This is the single, minimal operation — combine two things into one structured thing — that every richer data structure in this curriculum will eventually be built from, directly or indirectly. Also recognized in: a two-item coat check ticket, pairing a claim number with a coat; a labeled box, pairing a label with its contents; a dictionary entry, pairing a word with its definition; a key-value pair in any lookup structure, pairing a key with its associated value.

### SE Lens

The alternative to building lists from a single, minimal pairing operation is to introduce a separate, dedicated list primitive with its own independent rules. The real cost of that alternative is exactly the duplicated-machinery cost Lesson 15, Concept Unit 3, already warned about: a whole new system of rules to learn and trust, when a much smaller, already-understood building block — combine two values — turns out to be enough. Building lists from `cons` alone, as the rest of this lesson does, costs nothing beyond learning one new procedure; it means every list this curriculum ever builds is understood in terms of the same single operation, all the way down.

---

## Concept Unit 4: Building a Real List — Scores as Nested Pairs

### The Problem

Concept Unit 3's pair held two plain numbers. Building an actual list — where the *second* element is itself another list, all the way down to the empty list — requires nesting `cons` calls, exactly the way Lesson 27's recursive definitions nested references to smaller instances of themselves.

### The New Code — Type It Yourself

```scheme
(define scores (cons 91 (cons 85 (cons 72 '()))))
```

### The Updated Project

This is `scores.scm`, in full:

```scheme
(define scores (cons 91 (cons 85 (cons 72 '()))))

(display scores)
(newline)
(display (car scores))
(newline)
(display (cdr scores))
(newline)
```

### Reference Source

No reference counterpart — this is the first real, lasting list this lesson builds, directly realizing Concept Unit 1's motivating problem.

### Files affected

Created: `scores.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile scores.scm
(91 85 72)
91
(85 72)
```

Verified this session.

### Mechanical Walkthrough

- **`(cons 72 '())`** — the innermost `cons`: a pair whose first element is `72` and whose second element is the empty list — Concept Unit 2's base case, used here as the smaller list Lesson 27's recursive case needs.
- **`(cons 85 (cons 72 '()))`** — a pair whose first element is `85` and whose second element is the pair just built — a list of two items, `85` and `72`, in that order.
- **`(cons 91 (cons 85 (cons 72 '())))`** — the outermost `cons`, producing the full three-item list.
- **`(91 85 72)`, Scheme's own printed form** — confirms that a chain of nested pairs, each one's second element itself a list ending in `'()`, is displayed as an ordinary-looking list, not with Concept Unit 3's dotted notation, because every second element here genuinely is a list.
- **`(car scores)` returning `91`, `(cdr scores)` returning `(85 72)`** — confirms directly that `car` retrieves the first item just `cons`ed onto the front, and `cdr` retrieves everything else, itself a complete, smaller list.

### CS Lens

This is a list, built entirely and explicitly from nested pairs, with nothing hidden — exactly the demystification this curriculum's own schema insists on: not "here's a list, trust it," but "here is precisely what a list is made of." Also recognized in: a stack of trays in a cafeteria, where picking up the top tray reveals the rest of the stack, itself a smaller stack; a train, where uncoupling the front car leaves the rest of the train, itself a complete, smaller train; a to-do list on paper, where crossing off the first item leaves the rest of the list, itself a complete, shorter list; a set of nested envelopes, where opening the outer one reveals the next, itself a complete, smaller nested structure.

### SE Lens

The alternative to building `scores` from explicit, nested `cons` calls is to reach for a ready-made list literal, like `(list 91 85 72)`, without ever seeing what it expands to underneath. The real cost of that alternative, specifically for this lesson's purpose, is losing the direct visibility into exactly how a list is constructed — `(list 91 85 72)` is a genuine, convenient shorthand this curriculum will use freely from here forward, but building it out by hand once, as this unit does, costs nothing beyond typing three nested calls; it confirms, concretely, that the shorthand is doing nothing more than what Concept Unit 3's `cons` already fully explained.

---

## Concept Unit 5: Lists Are Recursive Data — Just Like Recursive Definitions

### The Problem

Concept Unit 4 built a list; it hasn't yet processed one. Writing a procedure that actually does something with a list's contents — counting how many items it has, say — should, if this lesson's central claim is right, follow the exact same base-case-and-recursive-case shape `factorial` and `fib` already used, just applied to `null?`, `car`, and `cdr` instead of `=`, `*`, and `-`.

### The New Code — Type It Yourself

```scheme
(define (my-length lst)
  (if (null? lst)
      0
      (+ 1 (my-length (cdr lst)))))
```

### The Updated Project

This is `my-length.scm`, in full:

```scheme
(define (my-length lst)
  (if (null? lst)
      0
      (+ 1 (my-length (cdr lst)))))

(define scores (cons 91 (cons 85 (cons 72 '()))))

(display (my-length scores))
(newline)
(display (my-length '()))
(newline)
```

### Reference Source

Lesson 27 (`FP-L027-recursive-definitions.md`), Concept Unit 2's exact base-case-and-recursive-case shape — translated here to a list instead of a number.

### Files affected

Created: `my-length.scm`.

### Change type

Add (new file; this lesson's second real, kept artifact).

### Dependencies

The Guile interpreter, and `scores` from Concept Unit 4.

### Run It — Show the Real Output

```
$ guile my-length.scm
3
0
```

Verified this session. `(my-length scores)` correctly counts all three items; `(my-length '())` correctly returns `0` for the empty list, its own base case.

### Mechanical Walkthrough

- **`(if (null? lst) 0 ...)`** — the base case: a reappearance of `null?` (Concept Unit 2), guarding exactly the way `(= n 0)` guarded `factorial`'s base case — directly parallel, right down to using `if` (Lesson 28) the same way.
- **`(+ 1 (my-length (cdr lst)))`** — the recursive case: `(cdr lst)` produces a list one item smaller than `lst` (a reappearance of *progress measure*, Lesson 30 — a list genuinely gets smaller with each `cdr`, bottoming out at `'()`), and `my-length` is called on it, with `1` added to account for the item `cdr` removed.
- **The direct structural comparison to `factorial`:** `factorial`'s base case, `(if (= n 0) 1 ...)`, checks a number against `0`; `my-length`'s base case checks a list against `'()`. `factorial`'s recursive case shrinks `n` by `1` via `(- n 1)`; `my-length`'s recursive case shrinks `lst` by one item via `(cdr lst)`. The shapes are identical; only what's being checked and shrunk has changed.

### CS Lens

This is confirmation, with real running code, of exactly what Concept Unit 1 previewed: a list is recursive data, defined the same way any recursive idea in this curriculum has been defined since Lesson 27, and a procedure that processes a list follows the identical base-case-and-recursive-case shape as a procedure that processes a number. Also recognized in: any recursive tree-processing procedure this curriculum will introduce later, following the identical shape once more; a recursive file-system search, base-cased on an empty directory; a recursive parser, base-cased on reaching the end of its input; a recursive translation process, base-cased on an empty sentence left to translate.

### SE Lens

The alternative to recognizing this structural identity is to treat "processing a number recursively" and "processing a list recursively" as two unrelated skills, each learned independently from scratch. The real cost of that alternative is exactly the kind of fragmented understanding this curriculum's own philosophy warns against — missing the connection between `factorial` and `my-length` means missing that everything already learned about base cases (Lesson 29), progress measures (Lesson 30), and evaluation traces (Lesson 31) transfers directly, with no new theory required, the moment the underlying pattern is recognized. Building `my-length` explicitly parallel to `factorial`, as this unit does, costs nothing beyond writing the procedure; it is what makes that transfer visible rather than left for a learner to notice, or not, on their own.

---

## Closing

### Connect the pieces

One list of scores, `(cons 91 (cons 85 (cons 72 '())))`, traced through every unit built in this lesson, start to finish:

1. **The gap named (Unit 1):** no tool built so far actually represents an ordered, repeatable sequence.
2. **The base case, real and checkable (Unit 2):** `'()`, confirmed against `null?` for both an empty and a non-empty list.
3. **The single building block (Unit 3):** `cons`, combining two values into a pair, with `car` and `cdr` retrieving them.
4. **A real list, built and inspected (Unit 4):** `scores`, three nested pairs deep, correctly displaying, and correctly splitting into its first item and the rest.
5. **A list processed recursively, matching `factorial`'s exact shape (Unit 5):** `my-length`, correctly counting `scores` as `3` and the empty list as `0`.

Unit 5's `my-length` is applied directly to Unit 4's exact `scores` list — nothing in this lesson's second half introduced a fresh, unrelated list to process.

### What breaks without this

Suppose a procedure needed to process a list but never checked `null?` before calling `car` or `cdr` on it — following, for instance, only the recursive case's shape and skipping the base case check Lesson 27 already insisted is non-negotiable. Applied to `scores`, this would work by pure luck for exactly as many steps as there are real items, and then fail the moment it reached the empty list at the very end, attempting `(car '())` or `(cdr '())` — operations this lesson's own definitions never gave any meaning to. This is the identical failure shape Lesson 3 first demonstrated for division by zero: an operation applied outside the domain it was ever defined for, producing a real error rather than a silently wrong answer, precisely because `car` and `cdr` are only ever defined on pairs, never on the empty list. Restoring this lesson's discipline — checking `null?` before every `car` or `cdr`, exactly the way `my-length` does — is what keeps list processing from failing at the one boundary every list, however long, is guaranteed to eventually reach.

### Exercises

1. **Observe.** Build a list of five items of your own choosing, using nested `cons` calls all the way down to `'()`, the way Concept Unit 4 built `scores`.
2. **Predict.** Before running it, predict what `(car (cdr your-list))` and `(cdr (cdr your-list))` will produce for your Exercise 1 list. Check your predictions against real output.
3. **Formalize.** Write a recursive procedure, following `my-length`'s exact shape, that sums every number in a list of numbers (base case: the empty list sums to `0`; recursive case: the first item plus the sum of the rest).
4. **Explain.** Compare your Exercise 3 procedure's base case and recursive case directly against `factorial`'s, the way Concept Unit 5 compared `my-length`'s, stating exactly what plays the role of `0`, `(= n 0)`, and `(- n 1)` in your version.
5. **Formalize.** Run your Exercise 3 procedure on your Exercise 1 list and on `'()` directly, confirming both produce correct, real output.

### Definition of done

- [ ] You can build a list of your own choosing entirely from nested `cons` calls and `'()`, with no shortcuts.
- [ ] You can explain, precisely, why `null?` must be checked before `car` or `cdr` is ever called.
- [ ] You can write a recursive list-processing procedure whose base case and recursive case directly parallel `factorial`'s, and explain the parallel explicitly.
- [ ] You can predict, and then verify with real output, what `car` and `cdr` produce for a list of your own choosing.
- [ ] You completed Exercises 1–5 using a list of your own choosing, not `scores`.
- [ ] Commit `scores.scm`, `my-length.scm`, and your Exercise 3 procedure, with a commit message stating which part of `my-length` you found least obviously parallel to `factorial` before working through the comparison.
