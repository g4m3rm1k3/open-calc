# Lesson 49: Recursive Search

**What you will build:** A real procedure that searches a physically-built tree for a target value, and a second, more consequential procedure that searches a *space of possible choices* — which numbers to include in a subset — without ever building the tree of possibilities as actual data at all. The transferable problem this lesson is actually about: Lesson 41's trees were built first, as real, inspectable Scheme values, and then searched. Many real search problems have no data structure to search at all until the searching itself creates one — the "tree" being explored is a tree of decisions, existing only in the shape of the recursive calls that consider them.

**What you need to know first:** Lesson 11 (`FP-L011-logical-operators.md`) — specifically `OR`'s short-circuiting truth table, reused directly for early termination. Lesson 14 (`FP-L014-quantifiers.md`) — specifically *existential quantifier* and *witness*, reused directly for what a successful search actually establishes. Lesson 41 (`FP-L041-trees.md`) — specifically `example-tree`, reused directly in Concept Unit 2.

**Terms introduced in this lesson**

- **Search space** — the complete collection of possibilities a search considers, whether or not that collection is ever built as an actual data structure. A physically-built tree's own nodes are one kind of search space; every possible way of choosing a subset of a list's items, considered one decision at a time, is another — one this lesson builds without ever constructing the full collection of subsets directly.
- **Choice point** — a place in a search where more than one option must be considered, each one explored (at least potentially) before the search can conclude no option works. Every recursive call that tries more than one possibility is a choice point, whether it's a tree's left-versus-right subtree or a subset-sum search's include-versus-exclude decision.

## Objects and methods used

None new. This lesson reuses `or` (Lesson 11), `if`, `null?`, `car`, `cdr`, and the tree accessors from Lesson 41, applied to genuinely new search procedures.

---

## Concept Unit 1: Finding Something in a Structure — Beyond Membership

### The Problem

Lesson 33's `contains?` searched a flat list — one linear path, checked item by item. `example-tree` (Lesson 41) branches; finding whether a target value exists anywhere in it needs to consider two separate directions at every node, not one, and needs to conclude "not found" only after every branch has actually been checked.

### No isolated lab for this step

This concept has no code of its own to isolate — the gap between searching a list and searching a tree is demonstrated directly below, not through a construct with its own syntax.

### Applying It — What Tree Search Actually Needs

**`contains?`'s recursive case, reappearing from Lesson 33:** check the current item; if it doesn't match, recurse on the rest of the list — exactly one direction to continue in.

**Checking whether this directly applies to a tree:** a tree node has *two* subtrees, not one "rest" — after checking the current node's own value, both the left and right subtrees might contain the target, and neither one can be skipped without possibly missing it.

**Naming what's needed:** a search that checks the current position, and if that fails, tries every remaining choice — here, both subtrees — succeeding if *any* of them succeeds, and failing only once *all* of them have failed.

### Walkthrough

- **`contains?`'s single-direction recursive case, reappearing from Lesson 33** — establishes the baseline this unit is about to extend.
- **The two-subtree check** — confirms precisely what's different about searching a tree versus a list, rather than assuming the difference is obvious.
- **"succeeding if any... failing only once all"** — a direct forward-reference to *existential quantifier* (Lesson 14), previewing exactly the logical shape Concept Unit 2 will use.

### CS Lens

This is the recognition that searching a branching structure needs to consider every branch, not just follow a single path, the same branching Lesson 41 already required `tree-size` and `tree-height` to handle with two recursive calls rather than one. Also recognized in: searching a family tree for a specific ancestor, requiring checking both parental lines, not just one; searching a corporate hierarchy for a specific employee, requiring checking every subsidiary, not just one designated path; searching a maze with branching corridors, requiring trying every branch, not just the first one encountered.

### SE Lens

The alternative to recognizing this need is to try to reuse `contains?`'s single-direction shape directly on a tree, silently missing an entire branch's worth of data, exactly the kind of incomplete recursive case Lesson 41's own closing warning described. The real cost of that alternative is a search that reports "not found" incorrectly, for any target sitting in the branch that got skipped, with nothing about the wrong result looking obviously broken. Naming what tree search actually requires, as this unit does, costs nothing beyond recognizing the structural difference; it sets up Concept Unit 2's actual, correct derivation.

---

## Concept Unit 2: Deriving tree-contains? by Structural Recursion

### The Problem

Concept Unit 1 identified what's needed. Deriving it precisely, following Lesson 33's exact template, means stating the base case and combining rule explicitly before writing any code.

### The New Code — Type It Yourself

```scheme
(define (tree-contains? tree target)
  (if (null? tree)
      #f
      (or (= (node-value tree) target)
          (tree-contains? (node-left tree) target)
          (tree-contains? (node-right tree) target))))
```

### The Updated Project

This is `tree-search.scm`, in full:

```scheme
(define empty-tree '())
(define (make-node value left right) (list value left right))
(define (node-value node) (car node))
(define (node-left node) (cadr node))
(define (node-right node) (caddr node))

(define (tree-contains? tree target)
  (if (null? tree)
      #f
      (or (= (node-value tree) target)
          (tree-contains? (node-left tree) target)
          (tree-contains? (node-right tree) target))))

(define example-tree
  (make-node 50
    (make-node 30
      (make-node 20 empty-tree empty-tree)
      (make-node 40 empty-tree empty-tree))
    (make-node 70 empty-tree empty-tree)))

(display (tree-contains? example-tree 40))
(newline)
(display (tree-contains? example-tree 99))
(newline)
```

### Reference Source

Lesson 33's structural-recursion template: `<base-value>` for the empty tree is `#f` (nothing found in nothing); `<combine>` checks the current node directly, then tries both subtrees, succeeding if any one of the three checks succeeds.

### Files affected

Created: `tree-search.scm`.

### Change type

Add (new file; this lesson's first real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile tree-search.scm
#t
#f
```

Verified this session — `40` is found; `99` is not.

### Mechanical Walkthrough

- **`(if (null? tree) #f ...)`** — the base case: an empty tree contains nothing, exactly the reasoning `contains?`'s base case already used for an empty list.
- **`(or (= (node-value tree) target) (tree-contains? (node-left tree) target) (tree-contains? (node-right tree) target))`** — first appearance of `or` (Lesson 11) used to combine three separate checks: the current node's own value, the left subtree, and the right subtree — succeeding the moment any one of the three does.
- **`or`'s short-circuit behavior, reappearing from Lesson 12's discussion of only-the-selected-branch evaluation:** if the current node's value matches, `or` never evaluates either recursive call at all — the search stops the instant it succeeds, rather than needlessly continuing to search subtrees that no longer matter.

### CS Lens

This is `contains?`'s exact technique, generalized to a branching data structure — a base case, and a combine step that checks the current position and defers to however many smaller instances the data's own definition actually requires, here using `or` to express "any one of these three checks succeeding is enough." Also recognized in: a missing-person search checking a specific location, then dispatching separate teams to check every connecting route, calling off the wider search the moment any team reports success; a product recall check, examining a specific batch, then checking every downstream distributor, stopping once the defective unit is located; a virus scan, checking a specific file, then recursing into every subdirectory, until an infected file is found or every location has been checked.

### SE Lens

The alternative to using `or` for the combining step is to write out an explicit chain of `if`s checking each of the three possibilities in sequence, arriving at the identical behavior through more verbose code. The real cost of that alternative is unnecessary length obscuring a genuinely simple idea — "any of these three" is exactly what `or` already means, precisely and compactly, the identical readability argument Lesson 11 already made for naming logical operators rather than writing out their behavior by hand. Using `or` directly, as this unit does, costs nothing beyond recognizing the fit; it produces code that reads as clearly as the underlying logic it expresses.

---

## Concept Unit 3: A Search Space Without a Data Structure — Subset Sum

### The Problem

`tree-contains?` searched a tree that already existed as real data. Many search problems have no such structure to search — the question "can some subset of these numbers sum to a target?" has no tree sitting anywhere in memory; the "choices" being searched are decisions (include this number, or don't) made one at a time, with the search space existing only in the shape of the recursive calls exploring it.

### The New Code — Type It Yourself

```scheme
(define (can-sum-to? items target)
  (if (= target 0)
      #t
      (if (null? items)
          #f
          (if (> (car items) target)
              (can-sum-to? (cdr items) target)
              (or (can-sum-to? (cdr items) (- target (car items)))
                  (can-sum-to? (cdr items) target))))))
```

### The Updated Project

This is `subset-sum.scm`, in full:

```scheme
(define (can-sum-to? items target)
  (if (= target 0)
      #t
      (if (null? items)
          #f
          (if (> (car items) target)
              (can-sum-to? (cdr items) target)
              (or (can-sum-to? (cdr items) (- target (car items)))
                  (can-sum-to? (cdr items) target))))))

(display (can-sum-to? (list 3 7 5 2) 9))
(newline)
(display (can-sum-to? (list 3 7 5 2) 100))
(newline)
```

### Reference Source

No reference counterpart — a from-scratch procedure, whose derivation is this unit's own subject.

### Files affected

Created: `subset-sum.scm`.

### Change type

Add (new file; this lesson's second real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile subset-sum.scm
#t
#f
```

Verified this session — `9` is reachable (`7 + 2`); `100` is not, from `(3 7 5 2)`.

**Confirming two more cases directly:**

```
$ guile -q
scheme@(guile-user)> (define (can-sum-to? items target) (if (= target 0) #t (if (null? items) #f (if (> (car items) target) (can-sum-to? (cdr items) target) (or (can-sum-to? (cdr items) (- target (car items))) (can-sum-to? (cdr items) target))))))
scheme@(guile-user)> (can-sum-to? (list 3 7 5 2) 0)
$1 = #t
scheme@(guile-user)> (can-sum-to? (list 3 7 5 2) 10)
$2 = #t
```

Verified this session — a target of `0` is trivially reachable (the empty subset); `10` is reachable (`3 + 7`).

### Mechanical Walkthrough

- **`(if (= target 0) #t ...)`** — the first base case: a target of exactly `0` is always reachable, by choosing no further items at all — the empty subset, needing no items and summing to `0` by definition.
- **`(if (null? items) #f ...)`** — the second base case: if there are no items left to choose from, and the target isn't already `0` (checked first), no subset of what remains can possibly reach it.
- **`(if (> (car items) target) (can-sum-to? (cdr items) target) ...)`** — a genuine choice point that turns out to have only one live option: if the current item alone already exceeds the remaining target, including it can never help, so the search skips directly to considering the rest without it.
- **`(or (can-sum-to? (cdr items) (- target (car items))) (can-sum-to? (cdr items) target))`** — the real choice point, in exactly Lesson 41's two-branch shape: *include* the current item (reducing the target by its value, and moving to the rest) or *exclude* it (leaving the target unchanged, and moving to the rest) — succeeding if *either* choice eventually reaches a target of `0`.

### CS Lens

This is the same search technique as `tree-contains?`, applied to a search space that exists only implicitly — each recursive call represents one node of an unbuilt "tree of choices," where the two branches are "include this item" and "exclude this item," rather than a tree's already-built left and right subtrees. Also recognized in: a combination lock's every possible combination, considered one digit-choice at a time, without ever listing every combination explicitly; a chess engine's every possible sequence of moves, considered one move-choice at a time, without ever building the full game tree in memory; a route-planning search's every possible path, considered one turn-choice at a time, without ever enumerating every possible route in advance.

### SE Lens

The alternative to searching this implicit space directly is to first generate every possible subset explicitly, as an actual list of lists, and then check each one — building `tree-contains?`'s equivalent of an actual tree before searching it, the way Lesson 41 built `example-tree` before `tree-contains?` ever ran. The real cost of that alternative, for `n` items, is generating and holding `2ⁿ` explicit subsets in memory before checking even one of them — for a list of only twenty items, over a million subsets, built and stored, before the search that actually answers the question even begins. Searching the implicit space directly, as this unit does, costs nothing beyond the recursive calls actually needed to explore it; no subset is ever built as an explicit list at all, only considered, one include-or-exclude decision at a time.

---

## Concept Unit 4: Search That Stops Early — Reusing OR's Short-Circuit Behavior

### The Problem

Concept Unit 3's `can-sum-to?` searches a space that could, in principle, require checking every one of `2ⁿ` possible subsets. It's worth confirming directly that it doesn't always do all that work — that `or`'s short-circuit behavior, already established in Lesson 12, genuinely stops the search the moment a working subset is found.

### No isolated lab for this step

This concept has no code of its own to isolate — confirming early termination is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Confirming the Search Actually Stops Early

**A version of `can-sum-to?`, instrumented to count how many calls it actually makes, the way Lesson 31 instrumented `fib`:**

```
$ guile -q
scheme@(guile-user)> (define call-count 0)
scheme@(guile-user)> (define (can-sum-to? items target) (set! call-count (+ call-count 1)) (if (= target 0) #t (if (null? items) #f (if (> (car items) target) (can-sum-to? (cdr items) target) (or (can-sum-to? (cdr items) (- target (car items))) (can-sum-to? (cdr items) target))))))
scheme@(guile-user)> (can-sum-to? (list 3 7 5 2) 3)
$1 = #t
scheme@(guile-user)> call-count
$2 = 2
```

Verified this session — finding that `3` alone reaches the target took only `2` calls, not anywhere near the `2⁴ = 16` subsets of a four-item list.

**Confirming what actually happened, tracing by hand:** `can-sum-to?((3 7 5 2), 3)` — the first call — immediately tries including `3` first: `can-sum-to?((7 5 2), 0)` — the second call — hits the `(= target 0)` base case directly, returning `#t` immediately. Because this is the *first* operand of `or`, and it's already `#t`, `or`'s short-circuit rule (Lesson 11) means the second operand — excluding `3` and trying the rest — is never evaluated at all.

**Connecting this directly to Lesson 14's existential quantifier:** "can some subset sum to the target" is exactly an existential claim, `∃` subset such that its sum equals the target — and Lesson 14, Concept Unit 4, already established that confirming an existential claim needs only one witness, found and reported immediately, with no requirement to check any of the remaining possibilities once one has succeeded.

### Walkthrough

- **The instrumented version, counting real calls** — a reappearance of Lesson 31's own instrumentation technique, applied here to confirm early termination rather than to count redundant work.
- **`call-count = 2`, far short of `16`** — the concrete, measured confirmation that the search genuinely stopped early, not merely a claim about what `or` "should" do.
- **The hand-traced explanation, showing exactly which branch was never evaluated** — connects the measured result directly to `or`'s specific, already-established evaluation rule.
- **The explicit connection to Lesson 14's existential quantifier** — not a new concept, but the precise recognition that this entire search technique is quantifier-checking (Lesson 14), now performed over an implicit space rather than an explicit, listed domain.

### CS Lens

This is a direct, measured confirmation that a search over an exponentially large space can, in practice, finish in far fewer steps than the space's full size, whenever a satisfying choice happens to be found early — the same short-circuiting Lesson 12 and Lesson 14 already established, now shown mattering enormously for a search space too large to ever fully enumerate. Also recognized in: a hiring search that stops the moment an excellent candidate is found, rather than interviewing every possible applicant; a product search that stops the moment an exact match is found, rather than checking every item in a catalog; a medical diagnostic process that stops the moment a conclusive test result is found, rather than running every possible test.

### SE Lens

The alternative to relying on `or`'s short-circuit behavior is to check every possible subset unconditionally, regardless of whether an early one already succeeded — either by using an operation that doesn't short-circuit, or by collecting every result before checking any of them. The real cost of that alternative, for a search space of size `2ⁿ`, could mean the difference between a search that finishes almost instantly, as this unit measured, and one that takes an amount of time growing exponentially with the number of items, even when a valid answer sits near the very first choice checked. Trusting and confirming `or`'s short-circuit behavior directly, as this unit does, costs nothing beyond the measurement itself; it is what makes searching an exponential space practical at all, whenever a satisfying answer happens to be found early.

---

## Closing

### Connect the pieces

Two searches, one over real tree data and one over an implicit space of choices, traced through every unit built in this lesson, start to finish:

1. **The gap beyond simple membership named (Unit 1):** a tree's two subtrees, neither one safely skippable, unlike a list's single "rest."
2. **`tree-contains?`, derived and verified (Unit 2):** base case `#f`, combining the current node with both subtrees via `or`, correctly finding `40` and correctly missing `99`.
3. **A search space with no built structure (Unit 3):** `can-sum-to?`, exploring include-or-exclude choices directly, without ever constructing any of `2ⁿ` possible subsets explicitly.
4. **Early termination confirmed by measurement (Unit 4):** `2` real calls, not `16`, to find that `3` alone reaches a target of `3` — connected directly to Lesson 14's existential quantifier.

Unit 4's measurement is performed on the exact `can-sum-to?` procedure Unit 3 derived — not a separate optimization added afterward, but a property the original derivation already had, simply confirmed here rather than assumed.

### What breaks without this

Suppose a real system needed to check whether some combination of available items — shipping packages of various sizes fitting into a container's remaining capacity, say — could exactly fill a required amount, and its author, unfamiliar with searching an implicit space directly, instead generated every possible combination explicitly before checking any of them, the alternative Concept Unit 3 already warned against. For a modest number of available items, this might run acceptably slowly; for a realistically sized inventory of even a few dozen items, the number of explicit combinations to generate and store — over a billion, past thirty items — would make the approach completely impractical, regardless of how quickly an acceptable answer could actually be found by searching directly. Restoring this lesson's technique — searching the space of choices directly, one include-or-exclude decision at a time, relying on `or`'s short-circuit behavior to stop the instant a satisfying combination is found — is what keeps a search like this practical at any realistic scale, exactly the difference Concept Unit 4 measured directly between two calls and sixteen.

### Exercises

1. **Observe.** Build a small tree of your own (five or more nodes, any values), and write `tree-contains?` for it, following Concept Unit 2's exact derivation.
2. **Predict.** Choose one value definitely in your Exercise 1 tree and one definitely not. Predict `tree-contains?`'s result for each, then check against real output.
3. **Formalize.** Choose a small list of numbers and a target sum, and trace `can-sum-to?`'s recursive calls by hand for at least the first two levels, the way Concept Unit 4 traced `can-sum-to?((3 7 5 2), 3)`.
4. **Explain.** Instrument your Exercise 3 call the way Concept Unit 4 instrumented `can-sum-to?`, counting real calls made. Compare the count against `2ⁿ` for your list's length, and explain the difference.
5. **Formalize.** Choose a target you're confident is *not* reachable from your Exercise 3 list, and run `can-sum-to?` on it. Instrument this call too, and explain, using Concept Unit 4's reasoning, why this call necessarily requires checking more possibilities than a successful search does.

### Definition of done

- [ ] You can derive a tree-search procedure using `or` to combine a current-node check with recursive calls on both subtrees.
- [ ] You can write a search over an implicit space of choices (include-or-exclude, or similar) without ever constructing the full space of possibilities explicitly.
- [ ] You can instrument a search procedure to count its own real calls, and explain why a successful search often makes far fewer calls than the full size of its search space.
- [ ] You can connect a successful search's early termination directly to Lesson 14's existential quantifier and Lesson 11's `or` short-circuiting.
- [ ] You completed Exercises 1–5 using your own tree and list, not `example-tree` or `(3 7 5 2)`.
- [ ] Commit `tree-search.scm`, `subset-sum.scm`, and your Exercise 3–5 traces and measurements, with a commit message stating how many real calls your Exercise 5 unsuccessful search made, compared to your Exercise 4 successful one.
