# Lesson 30: Trees as Recursive Data

**What you will build**: By the end of this lesson you'll have a real, working binary tree in Clojure — built directly from the same recursive definition Lesson 19 already gave it — and two structurally recursive functions operating on it, each making the two recursive calls a binary tree's own definition requires.

**What you need to know first**: Lesson 19's recursive tree definition (empty tree base case; a value with a left and right subtree as the recursive case), and this section's structural recursion.

**Terms introduced in this lesson**:

- **leaf** — a tree node whose left and right subtrees are both empty. *Why it matters*: the "bottom" of a tree, worth naming directly since traversals and every later tree lesson refer to leaves constantly — a leaf is to a tree what the base case is to a recursive function, the point where recursion into that branch stops.

**Objects and methods used**:

- **`max`**
  - *What it is:* a function in Clojure's core library returning the largest of its arguments.
  - *Implementation:* `(max a b ...)` — established behavior: `(max 3 8)` → `8`.
  - *Its use:* Concept Unit 3, to combine two subtrees' depths into the whole tree's depth.

---

## Concept Unit: Representing a Tree in Code

### The Problem

Lesson 19 defined a binary tree recursively: the empty tree is a tree; a value together with a left and a right subtree (both themselves trees) is a tree. Lists have `(list)` and `cons` as their real, running counterparts (Lesson 24). What's the equivalent for trees?

### Introduce the concept in isolation

Represent the empty tree exactly the way the empty list already is — `(list)`, checked with `empty?` — and represent a non-empty tree as a three-element list: the value, the left subtree, and the right subtree.

```clojure
(defn make-tree [value left right] (list value left right))

(defn tree-value [tree] (first tree))
(defn tree-left [tree] (second tree))
(defn tree-right [tree] (first (rest (rest tree))))
```

```clojure
(def small-tree (make-tree 5 (make-tree 3 (list) (list)) (make-tree 8 (list) (list))))
```

```
user=> (tree-value small-tree)
5
user=> (tree-value (tree-left small-tree))
3
user=> (tree-value (tree-right small-tree))
8
user=> (empty? (tree-left (tree-left small-tree)))
true
```

`small-tree` has `5` at its root, `3` as its left child, `8` as its right child — both children are **leaves**, since each one's own left and right subtrees are empty. This is exactly Lesson 19's definition, made real: `(make-tree 3 (list) (list))` *is* "a value together with two empty subtrees," the recursive case's smallest possible non-empty instance.

### Discard the throwaway example

Not applicable — `make-tree` and the three accessor functions are real, reusable tools; `small-tree` is a running example the rest of this lesson builds on.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of Lesson 19's own recursive tree definition.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn make-tree [value left right] (list value left right))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(list value left right)`** — reappearing `list` construction (Lesson 24); a tree, in this representation, is nothing more than an ordinary three-element list — no new data type, just a deliberate convention for what each position means.
- **`tree-value`, `tree-left`, `tree-right`** — three small accessor functions, each a reappearing `first`/`second`/`rest` combination (Lessons 11 and 24), giving each position in the three-element list a meaningful name instead of requiring every later function to remember "position two means the left subtree" by convention alone.

### CS Lens

Choosing a plain list to represent a tree, with accessor functions giving its positions meaningful names, is the same idea as Lesson 11's ordered pairs representing a relation — the underlying value (a list) isn't a new kind of thing; the *meaning assigned to its structure* is what makes it a tree. Also recognized in: a company's org chart file format that's really just nested plain records with "manager" and "reports" fields, and a filesystem's directory entries, which are ultimately just structured data with agreed-upon meaning, not a fundamentally different kind of storage from anything else on disk.

### SE Lens

Writing `tree-value`, `tree-left`, and `tree-right` once, rather than having every later function reach directly for `(first tree)` or `(first (rest (rest tree)))`, is Lesson 4's naming argument applied to data access instead of computation: if this representation ever changed (a different position order, say), only these three functions would need updating, not every function that ever inspects a tree — an early, small instance of the abstraction boundary Lesson 106 (*Representation Invariants*) studies formally, much later.

---

## Concept Unit: `tree-sum` — Structural Recursion on Trees

### The Problem

`list-sum` (Lesson 27) sums a flat list using one recursive call per step. A binary tree's own recursive case, per Lesson 19's definition, refers to *two* smaller trees at once — a left and a right subtree. Does summing a tree's values need two recursive calls to match?

### Introduce the concept in isolation

```clojure
(defn tree-sum [tree]
  (if (empty? tree)
    0
    (+ (tree-value tree) (tree-sum (tree-left tree)) (tree-sum (tree-right tree)))))
```

```
user=> (tree-sum small-tree)
16
```

Trace it: `(tree-sum small-tree)` is `5 + (tree-sum (tree-left small-tree)) + (tree-sum (tree-right small-tree))` — `5 + (tree-sum 3-leaf) + (tree-sum 8-leaf)`. Each leaf's own subtrees are empty, so `(tree-sum 3-leaf)` is `3 + 0 + 0 = 3`, and `(tree-sum 8-leaf)` is `8 + 0 + 0 = 8`. Total: `5 + 3 + 8 = 16`.

### Discard the throwaway example

Not applicable — `tree-sum` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct structural translation of Lesson 19's tree definition (empty tree → `0`; a value with two subtrees → the value plus both subtrees' sums).
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn tree-sum [tree]
  (if (empty? tree)
    0
    (+ (tree-value tree) (tree-sum (tree-left tree)) (tree-sum (tree-right tree)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(tree-sum (tree-left tree))`, `(tree-sum (tree-right tree))`** — first appearance, in this series, of a recursive function on trees making exactly two recursive calls per non-empty node — precisely Lesson 21's structural recursion, extended to a recursive definition with two "smaller instance" references instead of one, exactly as that lesson's formal definition anticipated for trees specifically.
- **`(+ (tree-value tree) ... ...)`** — a three-argument `+` (Lesson 2's variadic arithmetic), combining the current node's own value with both subtrees' results in one step.

### CS Lens

`tree-sum`'s evaluation, traced out fully, produces an evaluation tree with exactly the same branching shape as `small-tree` itself — each call to `tree-sum` on a non-empty node branches into two further calls, one per subtree, the identical shape Lesson 23 first drew for `fib`. This isn't a coincidence: a tree-shaped recursive definition, structurally recursed on, always produces a tree-shaped trace of its own execution.

### SE Lens

`tree-sum`'s termination follows Lesson 22's checklist exactly, applied per subtree independently: each recursive call operates on a strictly smaller tree (one fewer level of nesting), bounded below by the empty tree, caught by the `empty?` base case — the identical guarantee already trusted for every list function in this section, now confirmed to extend cleanly to a data shape with two smaller instances instead of one.

### Connection to the previous unit

The previous unit built a tree and gave its parts meaningful names; this unit is the first function that actually uses all three named parts together, recursing on both subtrees the way the tree's own definition requires.

---

## Concept Unit: `tree-depth` — Combining Two Recursive Results Differently

### The Problem

`tree-sum` combines its two recursive results by adding them. Not every useful tree function should add its subtrees' results — a tree's **depth** (how many levels it has) isn't the sum of its two subtrees' depths; a tree with a left subtree of depth `3` and a right subtree of depth `1` has depth `4` under addition, but should really have depth `4` measuring the *longer* path down, not `3 + 1`. Wait — does it need something other than addition entirely?

### Introduce the concept in isolation

```clojure
(defn tree-depth [tree]
  (if (empty? tree)
    0
    (+ 1 (max (tree-depth (tree-left tree)) (tree-depth (tree-right tree))))))
```

```
user=> (tree-depth small-tree)
2
```

Trace it: `(tree-depth small-tree)` is `1 + (max (tree-depth 3-leaf) (tree-depth 8-leaf))`. Each leaf's own subtrees are empty, so both leaves have depth `1 + (max 0 0) = 1`. `small-tree`'s depth is `1 + (max 1 1) = 2` — one level for the root, one more for its deepest child, matching the tree's actual two-level shape exactly.

Unlike `tree-sum`, which added both subtrees' results together, `tree-depth` takes the *larger* of the two — depth cares about the longest path from root to an empty subtree, not the combined size of both branches.

### Discard the throwaway example

Not applicable — `tree-depth` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn tree-depth [tree]
  (if (empty? tree)
    0
    (+ 1 (max (tree-depth (tree-left tree)) (tree-depth (tree-right tree))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`max`** — first appearance as a called function (covered fully in Objects and methods used, above): selects the larger of the two subtrees' depths.
- **`(+ 1 (max ... ...))`** — reappearing recursive-call shape from `tree-sum`, with `max` in place of a second `+` term — the identical "two recursive calls, combined somehow" structure, with a different combining operation, exactly the way Lesson 25 and Lesson 27's `map`/`reduce` derivations varied their combining operation while keeping the surrounding shape fixed.

### CS Lens

`tree-sum` and `tree-depth` sharing a shape — two recursive calls, one per subtree, combined by some operation — while genuinely differing in *which* operation combines them (`+` for a total, `max` for a longest path), is the exact same realization Lesson 27 built around `reduce`: once a shape recurs reliably, only the combining operation (and possibly the base case's value) needs to change between uses, not the surrounding recursive structure.

### SE Lens

Depth is precisely the quantity Lesson 97 (*Balanced Trees*), much later, cares about intensely — a tree's usefulness for fast lookup depends directly on keeping its depth small relative to how many values it holds, a concern this lesson's `tree-depth` gives this series its first real, checkable way to measure.

### Connection to the previous unit

The previous unit summed a tree's values by adding both subtrees' results; this unit measures a genuinely different property using the identical two-recursive-call shape, substituting `max` for `+` — direct evidence the shape itself, not the specific operation, is what structural recursion on trees actually provides.

---

## Connect the Pieces

A slightly larger tree, exercising every function from this lesson:

```clojure
(def account-tree
  (make-tree 50
    (make-tree 30 (list) (list))
    (make-tree 80
      (make-tree 70 (list) (list))
      (list))))

(println "Tree sum:" (tree-sum account-tree))
(println "Tree depth:" (tree-depth account-tree))
(println "Root value:" (tree-value account-tree))
(println "Right-left value:" (tree-value (tree-left (tree-right account-tree))))
```

```
Tree sum: 230
Tree depth: 3
Root value: 50
Right-left value: 70
```

`account-tree` has three levels — `50` at the root, `30` and `80` as its children, and `70` as `80`'s left child (with `80`'s right subtree empty) — `tree-sum` correctly adds all four values (`50+30+80+70=230`) regardless of the tree's uneven shape, and `tree-depth` correctly reports `3`, following the longer branch (through `80` and `70`) rather than the shorter one (through `30`, which stops at depth `2`). Both functions handled a tree with subtrees of genuinely different depths without any special-casing — exactly what structural recursion on Lesson 19's definition guarantees.

## What Breaks Without This

Suppose `tree-sum` were written with only *one* recursive call, forgetting the right subtree entirely:

```clojure
(defn broken-tree-sum [tree]
  (if (empty? tree)
    0
    (+ (tree-value tree) (broken-tree-sum (tree-left tree)))))
```

```
user=> (broken-tree-sum small-tree)
8
```

`8`, not `16` — the right subtree (`8`, a leaf on its own) was silently never visited at all. This doesn't error, and it doesn't obviously look wrong (`8` is a real, valid-looking number) — it's exactly Lesson 1's original warning, recurring in a new shape: a structurally incomplete recursive function, missing exactly one of the two calls a binary tree's own recursive case requires, produces a plausible, silently incorrect answer rather than any visible sign that half the data was never examined.

## Exercises

1. **Trace.** By hand, trace `(tree-sum account-tree)` from Connect the Pieces, showing every recursive call and the value each one contributes.
2. **Predict.** Before running it, predict `(tree-depth account-tree)` by tracing which branch is actually longest, the way this lesson traced `small-tree`'s depth.
3. **Derive.** Write `tree-count`, a function returning how many non-empty nodes a tree has (not the sum of their values — just a count), using the same two-recursive-call shape as `tree-sum` and `tree-depth`.
4. **Break it, on purpose.** Write a version of `tree-depth` that uses `+` instead of `max` to combine the two subtrees' depths, run it on `account-tree`, and explain in one sentence why the result no longer means "depth."
5. **Generalize.** Write `tree-max`, a function returning the largest value stored anywhere in a non-empty tree, using `max` to combine the current node's value with both subtrees' results (careful: a leaf's empty subtrees have no value to compare against — what should an empty subtree contribute to a *maximum*, as opposed to what it contributed to a sum or a depth?).
6. **Reconstruct.** Close this lesson. From memory, explain why `tree-sum` and `tree-depth` both need two recursive calls, tracing this requirement back to Lesson 19's own recursive definition of a binary tree.

## Definition of Done

- [ ] You can build a small binary tree using `make-tree` and the empty list, and correctly retrieve any node's value using the three accessor functions.
- [ ] You can write a structurally recursive function on a tree, using two recursive calls, without additional guidance.
- [ ] You completed Exercise 3 (`tree-count`) and Exercise 5 (`tree-max`), each verified against a tree of your own choosing.
- [ ] You can explain why `broken-tree-sum`'s missing recursive call produces a plausible-looking wrong answer rather than an error.
- [ ] Commit `tree-count` and `tree-max` to your notes repository, with a commit message stating what value an empty subtree contributes in each — for example, `"Add tree-count (empty contributes 0) and tree-max (empty subtrees excluded from the max comparison, only real values compared)"` — not just `"lesson 30 exercise"`.

---

**Next lesson:** Lesson 31, *Tree Traversals*, derives three standard, named orders for visiting every value in a tree — preorder, inorder, and postorder — each one a small, deliberate variation on exactly the two-recursive-call shape this lesson already established.
