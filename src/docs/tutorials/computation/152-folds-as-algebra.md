# Lesson 152: Folds as Algebra

**What you will build**: By the end of this lesson you'll rewrite Lesson 149's `fold-tree` using Lesson 151's `cond`, making explicit what it always was — a pattern match against a tree's two constructors, one branch per alternative. Then you'll show, with real conflicting numbers, that a fold's own `combine` function must itself be associative (Lesson 140) for the fold's result to mean anything reliable: two equally reasonable-looking ways of writing subtraction into `combine` give genuinely different answers, `-6` and `10`, on the identical tree.

**What you need to know first**: Lesson 149's `fold-tree`; Lesson 151's `cond` and pattern matching; Lesson 140's associativity.

**Terms introduced in this lesson**: None new — this lesson connects three already-built ideas (fold, pattern matching, associativity) rather than naming a new concept.

**Objects and methods used**: None new. This lesson reuses `cond` (Lesson 151), `nil?` (Lesson 136), and `+`/`-` (Lesson 2), each already covered.

---

## Concept Unit: `fold-tree` Was Always a Pattern Match

### The Problem

Lesson 149's `fold-tree` used a plain `if (nil? t)`. Lesson 151 later named exactly this shape — checking which of a sum type's alternatives a value is — pattern matching. Was `fold-tree` already doing that, just without the name?

### Introduce the concept in isolation

```clojure
(defn fold-tree [t leaf-val combine]
  (cond
    (nil? t) leaf-val
    true (combine (node-value t) (fold-tree (node-left t) leaf-val combine) (fold-tree (node-right t) leaf-val combine))))
```

Rewritten with `cond` instead of `if`, `fold-tree`'s two branches line up exactly with Lesson 150's own sum-type shape: `(nil? t)` matches the "empty" constructor, returning `leaf-val`; the `true` fallback matches the only other possibility, "a real node," and that's the *only* place `combine` is ever called. Two constructors, two `cond` branches — not a coincidence, the same one-to-one correspondence Lesson 151's own `category` function had with its three tags.

### Discard the throwaway example

Not applicable — this `fold-tree` is behaviorally identical to Lesson 149's own version, confirmed by construction (an `if` with exactly one true/false split is precisely `cond`'s two-branch special case, per Lesson 151's own CS Lens).

### Project Change

- **Reference Source**: Lesson 149's own `fold-tree`, rewritten here using Lesson 151's `cond` in place of `if` — logic unchanged, only the dispatch construct.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn fold-tree [t leaf-val combine]
  (cond
    (nil? t) leaf-val
    true (combine (node-value t) (fold-tree (node-left t) leaf-val combine) (fold-tree (node-right t) leaf-val combine))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? t) leaf-val`** — reappearing `cond` branch (Lesson 151): matches the empty-tree alternative, returning the fold's own identity-like starting value, exactly the way `leaf-val` already worked in Lesson 149.
- **`true (combine ...)`** — reappearing fallback branch (Lesson 151): matches every non-empty tree, the only place a real node's value and both recursive results ever meet.

### CS Lens

Every fold over a sum type has this identical shape: one `cond` branch per constructor, and the branch for a "recursive" constructor (one containing more of the same type inside it) is the only place that constructor's own contained values and sub-results get combined — the general recipe underneath every recursive function this curriculum has written since Lesson 20, now named precisely.

### SE Lens

Writing `fold-tree` with `cond` instead of `if` costs nothing here — two branches is exactly `if`'s own shape — but it makes the correspondence to the type's constructors visible in the code itself, not just in a comment: a reader can count `cond` branches and compare that count directly against the sum type's own known alternatives.

---

## Concept Unit: Why `combine` Must Be Associative

### The Problem

`fold-tree` calls `combine` once per node, nesting according to the tree's own shape. Does it matter, for the final answer, *how* `combine` itself groups its three arguments — or is any reasonable-looking definition equally safe to use?

### Introduce the concept in isolation

```clojure
(defn sub-combine-a [value left right] (- (- value left) right))
(defn sub-combine-b [value left right] (- value (- left right)))
```

```
user=> (def branching-tree (make-node 5 (make-node 3 nil nil) (make-node 8 nil nil)))
user=> (fold-tree branching-tree 0 sub-combine-a)
-6
user=> (fold-tree branching-tree 0 sub-combine-b)
10
```

The identical tree, the identical three values (`5`, `3`, `8`), two combine functions that both look like reasonable ways to "subtract everything together" — and two genuinely different answers, `-6` and `10`. Compare against addition, which Lesson 140 already proved associative:

```clojure
(defn add-combine [value left right] (+ value left right))
(defn add-combine-b [value left right] (+ value (+ left right)))
```

```
user=> (fold-tree branching-tree 0 add-combine)
16
user=> (fold-tree branching-tree 0 add-combine-b)
16
```

Both additive groupings agree, `16` both times — because `+` is associative, exactly Lesson 140's own property, `combine`'s internal grouping choice genuinely doesn't matter for it. It does for subtraction, precisely because subtraction isn't.

### Discard the throwaway example

Not applicable — all four results are real, confirming a genuine disagreement for subtraction and a genuine agreement for addition on the identical tree.

### Project Change

- **Reference Source**: No reference counterpart — a direct application of Lesson 140's own associativity property to `fold-tree`'s `combine` argument.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn sub-combine-a [value left right] (- (- value left) right))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(- (- value left) right)`**, in `sub-combine-a` — first appearance of this specific grouping: subtract `left` from `value` first, then subtract `right` from that result.
- **`(- value (- left right))`**, in `sub-combine-b` — the other grouping: subtract `right` from `left` first, then subtract that from `value` — a different real computation, not a stylistic variation of the first.

### CS Lens

This is Lesson 140's associativity property, and Lesson 141's monoid requirement, showing up as a genuine correctness condition rather than an abstract definition: `fold-tree` is only guaranteed to produce one well-defined answer, independent of exactly how `combine` chooses to group its own three arguments, when `combine` is built from an associative operation.

### SE Lens

A fold built on a non-associative `combine`, like `sub-combine-a` versus `sub-combine-b`, isn't merely "less elegant" — it has *no single correct answer* independent of an implementation detail (which grouping the author happened to write), the same real hazard Lesson 142's own closing warned about for relaxation built on the wrong operation pair. Choosing `combine` from a genuine monoid isn't a best practice here; it's the specific, checkable condition under which `fold-tree`'s result means anything reliable at all.

### Connection to the previous unit

The previous unit showed `fold-tree` pattern-matches its way through a tree's constructors; this unit shows that pattern match's own combining step inherits every requirement Lesson 140 and 141 already placed on monoids — the algebra in this lesson's own title isn't a metaphor, it's Lesson 140's real, checkable properties, still in force.

---

## Connect the Pieces

Pattern matching and associativity, both required, both checked on the identical tree:

```clojure
(println "Two constructors, two cond branches - matches Lesson 150's own sum type.")
(println "Associative combine (+) agrees regardless of grouping:" (= (fold-tree branching-tree 0 add-combine) (fold-tree branching-tree 0 add-combine-b)))
(println "Non-associative combine (-) disagrees:" (= (fold-tree branching-tree 0 sub-combine-a) (fold-tree branching-tree 0 sub-combine-b)))
```

```
Two constructors, two cond branches - matches Lesson 150's own sum type.
Associative combine (+) agrees regardless of grouping: true
Non-associative combine (-) disagrees: false
```

`fold-tree`'s own shape was always safe — the risk was never in the pattern match, it was entirely in what `combine` the caller chose to hand it.

## What Breaks Without This

Suppose a real codebase used `fold-tree` (or a fold like it) with a `combine` function nobody had checked for associativity — a floating-point average, say, which isn't exactly associative once rounding error is considered. Two developers restructuring the *same* underlying tree — one balancing it differently for performance, changing nothing about its actual contents — could see the fold's own result silently shift by a tiny amount, with no bug anywhere in either version of the tree-balancing code. The bug, if it's ever found, is really in the assumption that `combine`'s grouping never mattered — exactly the assumption this lesson's own `sub-combine-a`/`sub-combine-b` disagreement proves is never safe to make without checking.

## Exercises

1. **Trace.** By hand, using `sub-combine-a`'s own definition, confirm `(fold-tree branching-tree 0 sub-combine-a)` really does compute `-6`.
2. **Predict.** Before checking, predict whether `\max` (already known associative, Lesson 141's own exercise) gives the same result under both a `max-combine-a` and `max-combine-b` grouping. Then verify.
3. **Verify.** Confirm `mod4-add` (Lesson 140, already proven associative) also agrees regardless of grouping, when used as `fold-tree`'s own `combine`, on a small tree of your own choosing.
4. **Break it, on purpose.** Write a third subtraction-based `combine` — a *different* grouping from both `sub-combine-a` and `sub-combine-b` — and report its own, likely third, different answer on `branching-tree`.
5. **Generalize.** Describe, without coding it, why a fold over a *list* (Lesson 27's `reduce`) never has this ambiguity, even for a non-associative operation like subtraction — what's different about a list's shape compared to a branching tree's.
6. **Reconstruct.** Close this lesson. From memory, explain why `fold-tree` itself was never the source of this lesson's `-6`-versus-`10` disagreement — name precisely what was.

## Definition of Done

- [ ] You can rewrite `fold-tree` using `cond` and explain the one-to-one correspondence between its branches and the tree's constructors.
- [ ] You can explain why `combine` must be associative for `fold-tree`'s result to be grouping-independent.
- [ ] You can produce two genuinely different results from the same tree using two non-associative `combine` groupings.
- [ ] You completed Exercise 3 and confirmed `mod4-add` agrees regardless of grouping when used as `combine`.
- [ ] You completed Exercise 4 and reported a third, different subtraction-based result.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm mod4-add grouping-independent as fold-tree combine; find a third sub-combine grouping giving result 2, different from both -6 and 10"` — not just `"lesson 152 exercise"`.

---

**Next lesson:** Lesson 153, *Functors as Structure-Preserving Transformations*, steps back from combining values to transforming them — asking what it means to apply a function "inside" a structure like a tree or a list without disturbing that structure's own shape, the practical idea behind functors, before any formal category theory.
