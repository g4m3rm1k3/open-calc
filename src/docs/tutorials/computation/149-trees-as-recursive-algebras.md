# Lesson 149: Trees as Recursive Algebras

**What you will build**: By the end of this lesson you'll write two genuinely different tree functions — counting nodes, summing values — and show they share the *identical* recursive skeleton, differing only in two small replacement pieces. Then you'll factor that shared skeleton into one generic `fold-tree`, and prove both original functions are literally that same fold, called with different arguments — Lesson 30's recursive tree definition, revealed as an algebraic structure with its own "leaf value" and "combine" slots, the same shape Lesson 141's monoid gave `reduce`.

**What you need to know first**: Lesson 30's recursive tree definition; Lesson 92's vector-as-triple node representation (`[value left right]`) and `nil` for an empty subtree; Lesson 141's `reduce` and its own operation-plus-identity shape.

**Terms introduced in this lesson**: None new — this lesson recognizes an already-familiar recursive pattern as an instance of Section VII's own vocabulary, rather than naming a new concept.

**Objects and methods used**: None new. This lesson reuses `get` (Lesson 84) and `nil?` (Lesson 136), each already covered.

---

## Concept Unit: Two Functions, One Skeleton

### The Problem

Counting a tree's nodes and summing its values look like two unrelated tasks. Are they actually built from the identical recursive shape underneath, with only a couple of pieces swapped?

### Introduce the concept in isolation

```clojure
(defn make-node [value left right] [value left right])
(defn node-value [n] (get n 0))
(defn node-left [n] (get n 1))
(defn node-right [n] (get n 2))

(defn count-nodes [t]
  (if (nil? t)
    0
    (+ 1 (count-nodes (node-left t)) (count-nodes (node-right t)))))

(defn sum-values [t]
  (if (nil? t)
    0
    (+ (node-value t) (sum-values (node-left t)) (sum-values (node-right t)))))
```

```
user=> (def tree (make-node 5 (make-node 3 nil nil) (make-node 8 nil (make-node 9 nil nil))))
user=> (count-nodes tree)
4
user=> (sum-values tree)
25
```

Line by line, `count-nodes` and `sum-values` are the identical shape: an `if (nil? t)` base case, and a recursive case combining the current node with both subtrees' own recursive results. The *only* differences: the base case's value (`0` for both, here, though they don't have to match), and what happens to the current node's own value at the combining step — `count-nodes` discards it, adding a flat `1` instead; `sum-values` adds it directly.

### Discard the throwaway example

Not applicable — both functions are real, reusable, and verified against the identical tree.

### Project Change

- **Reference Source**: Lesson 92's own `[value left right]` vector-as-triple representation, reused directly, unchanged.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn count-nodes [t]
  (if (nil? t)
    0
    (+ 1 (count-nodes (node-left t)) (count-nodes (node-right t)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? t)`** — reappearing (Lesson 136): the empty-subtree base case, identical in both functions.
- **`(+ 1 (count-nodes (node-left t)) (count-nodes (node-right t)))`** — first appearance of this specific combining shape: one node's own contribution (`1`, a flat count) plus both subtrees' already-computed results.
- **`(+ (node-value t) (sum-values (node-left t)) (sum-values (node-right t)))`** — the identical shape, `sum-values`'s own contribution swapped from a flat `1` to the node's real value.

### CS Lens

A tree's own recursive definition — Lesson 30's "a tree is either empty, or a value with two subtrees" — is a genuine algebraic structure: two **constructors** (empty, and value-with-two-subtrees), and any function processing every tree the same structural way is fully determined by what it does at each constructor, nothing more.

### SE Lens

Two functions sharing an identical skeleton, differing only in two small pieces, is a real, visible sign that skeleton itself deserves to be factored out — exactly the motivation for this lesson's next unit, not a coincidence specific to counting and summing.

---

## Concept Unit: `fold-tree` — the Skeleton, Factored Out

### The Problem

Can the shared skeleton be written *once*, taking the two varying pieces — the empty-case value, and the combining function — as arguments, the way Lesson 141's `reduce` took an operation and an identity as arguments instead of being rewritten for every new use?

### Introduce the concept in isolation

```clojure
(defn fold-tree [t leaf-val combine]
  (if (nil? t)
    leaf-val
    (combine (node-value t) (fold-tree (node-left t) leaf-val combine) (fold-tree (node-right t) leaf-val combine))))

(defn count-combine [value left-result right-result] (+ 1 left-result right-result))
(defn sum-combine [value left-result right-result] (+ value left-result right-result))
```

```
user=> (fold-tree tree 0 count-combine)
4
user=> (fold-tree tree 0 sum-combine)
25
user=> (= (fold-tree tree 0 count-combine) (count-nodes tree))
true
user=> (= (fold-tree tree 0 sum-combine) (sum-values tree))
true
```

`fold-tree` is the shared skeleton, written exactly once. `count-combine` and `sum-combine` are the two small varying pieces from the previous unit, now ordinary functions passed in as arguments rather than baked into two separate recursive definitions. Both results agree, exactly, with the previous unit's own hand-written `count-nodes`/`sum-values` — confirmed directly on the last two lines, not merely argued from resemblance.

### Discard the throwaway example

Not applicable — `fold-tree` is real, reusable, and proven to agree with both original functions on the identical tree.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch generalization of this lesson's own first unit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn fold-tree [t leaf-val combine]
  (if (nil? t)
    leaf-val
    (combine (node-value t) (fold-tree (node-left t) leaf-val combine) (fold-tree (node-right t) leaf-val combine))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`leaf-val`, `combine`**, as parameters — first appearance of this specific idea: the two pieces that varied between `count-nodes` and `sum-values` are now ordinary function arguments, not separate hand-written recursive definitions.
- **`(combine (node-value t) (fold-tree (node-left t) leaf-val combine) (fold-tree (node-right t) leaf-val combine))`** — reappearing recursive-call shape (this lesson's first unit), with `combine` now called explicitly instead of a hardcoded `+`: `combine` receives the current node's value and both subtrees' *already-folded* results, exactly matching `count-combine`'s and `sum-combine`'s own three-argument shape.

### CS Lens

`fold-tree` is `reduce` (Lesson 141) generalized from a flat collection to a branching recursive structure: `reduce`'s `init` is `fold-tree`'s `leaf-val`; `reduce`'s combining operation is `fold-tree`'s `combine`, taking one extra argument to account for a tree having two subtrees where a list only ever has one "rest."

### SE Lens

Any *future* tree function that fits this same shape — computing a maximum, checking a property, building a new tree — can now be written as a single `combine` function passed to `fold-tree`, rather than a whole new hand-written recursive definition repeating the identical `nil?`-check-then-recurse skeleton every time.

### Connection to the previous unit

The previous unit noticed two functions sharing a skeleton; this unit factors that exact skeleton into one reusable function, and proves the factoring is faithful by checking both original functions still agree with their `fold-tree`-based replacements.

---

## Connect the Pieces

The same tree, folded two different ways through the identical function:

```clojure
(println "Node count via fold-tree:" (fold-tree tree 0 count-combine))
(println "Value sum via fold-tree:" (fold-tree tree 0 sum-combine))
(println "Both match their hand-written originals:" (= (fold-tree tree 0 count-combine) (count-nodes tree)) (= (fold-tree tree 0 sum-combine) (sum-values tree)))
```

```
Node count via fold-tree: 4
Value sum via fold-tree: 25
Both match their hand-written originals: true true
```

`fold-tree` never changed between these two calls — only `combine` did, exactly the reuse Lesson 141 already proved `reduce` gives for flat collections, now shown holding for trees as well.

## What Breaks Without This

Suppose a third tree function — finding the maximum value, say — were written as yet another hand-copied `nil?`-check-then-recurse definition, rather than a `combine` function passed to `fold-tree`. Any bug in the shared skeleton itself (an off-by-one in the base case, a missed subtree) would need fixing in three separate places instead of one, and the three copies would have no structural guarantee of staying consistent with each other as the codebase grew — exactly Lesson 139's own abstraction-barrier argument, now applied to recursive structure instead of a single ADT's operations.

## Exercises

1. **Trace.** By hand, trace `(fold-tree tree 0 sum-combine)` on this lesson's own four-node tree, showing each recursive call's own three arguments to `combine`.
2. **Predict.** Before checking, write a named `min-combine` function that computes a tree's minimum value via `fold-tree`, and predict its result on this lesson's own tree before running it.
3. **Verify.** Confirm `fold-tree`'s result for `min-combine` matches a hand-computed minimum of this lesson's own tree's four values (`5, 3, 8, 9`).
4. **Break it, on purpose.** Write a `combine` function that ignores one of its three arguments (say, always returns `1` regardless of `left-result`/`right-result`), and explain what real quantity `(fold-tree tree 0 that-combine)` ends up computing instead of a node count.
5. **Generalize.** Describe, without coding it, how `fold-tree` would need to change for a tree where each node has *three* children instead of two.
6. **Reconstruct.** Close this lesson. From memory, explain why `count-nodes` and `sum-values` are both literally `fold-tree`, not merely two functions that happen to look similar.

## Definition of Done

- [ ] You can write two different tree functions and recognize when they share an identical recursive skeleton.
- [ ] You can factor that skeleton into a generic `fold-tree`, taking a leaf value and a combining function as arguments.
- [ ] You can explain why `fold-tree` is `reduce`, generalized from a list to a branching tree.
- [ ] You completed Exercise 3 and confirmed a hand-written `min-combine`'s result against a hand-computed minimum.
- [ ] You completed Exercise 4 and explained what quantity a deliberately-broken `combine` actually computes.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you built and found — for example, `"Implement min-combine, confirm result 3 against hand-computed minimum; show ignoring left/right in combine computes tree height's upper bound, not node count"` — not just `"lesson 149 exercise"`.

---

**Next lesson:** Lesson 150, *Algebraic Data Types*, names this lesson's own "constructors" idea precisely — sum types and product types — and connects a tree's own `nil`-or-`[value left right]` shape directly to the mathematical construction it's secretly built from.
