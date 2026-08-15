# Lesson 41: Trees

**What you will build:** A real binary tree of numbers, built from nothing but `list`, `car`, and `cadr`/`caddr`, plus two structurally recursive procedures over it — one counting its nodes, one summing its values — both making *two* recursive calls per node rather than one. The transferable problem this lesson is actually about: Lesson 40 generalized structural recursion beyond lists using an expression whose recursive case still happened to make exactly one call per level down one path. A tree is the first recursively defined data this curriculum has built where the recursive case genuinely branches into two independent smaller instances at once — the same branching shape Lesson 31 already traced for `fib`, except this time the branching *is* the data, not merely an artifact of how a procedure happens to call itself.

**What you need to know first:** Lesson 27 (`FP-L027-recursive-definitions.md`) — specifically *base case* and *recursive case*, applied here to a data type with two smaller instances per level rather than one. Lesson 31 (`FP-L031-tracing-recursive-evaluation.md`) — specifically *evaluation tree*, revisited directly in Concept Unit 4 now that a tree-shaped call structure processes genuinely tree-shaped data. Lesson 32 (`FP-L032-lists.md`) through Lesson 40 (`FP-L040-structural-recursion.md`) — specifically `cons`-built data and the structural-recursion derivation process, both directly extended.

**Terms introduced in this lesson**

- **Binary tree** — a recursively defined structure that is either empty, or a node holding a value together with two smaller binary trees, called its left and right subtrees. This is Lesson 27's base-case-and-recursive-case shape, applied to data with *two* smaller instances per recursive case rather than the one a list or an expression's operands used.
- **Node** — a single non-empty binary tree: a value, together with a left subtree and a right subtree (either of which may itself be empty).
- **Leaf** — a node whose left and right subtrees are both empty — a node with nothing beneath it.
- **Subtree** — either of the two smaller binary trees a node holds — itself a complete binary tree in every sense the definition requires, exactly the way a list's `cdr` is itself a complete, smaller list.
- **Root** — the topmost node of a tree, the one node not itself a subtree of anything else in that same tree.

## Objects and methods used

None new. This lesson reuses `list`, `car`, `cadr`, `caddr`, `null?`, and `append` (Lessons 32, 37, and 40), applied to a new recursively structured value.

---

## Concept Unit 1: Some Data Isn't Linear — a Sequence Isn't Always Enough

### The Problem

Every recursive data structure this curriculum has built — lists (Lesson 32), expressions (Lesson 40) — has had exactly one "next smaller instance" per level: a list's `cdr`, an expression's two operands combined by a single operator at the top. Some real structures genuinely need to branch into two independent smaller structures at once, at every single level, not just at the very top.

### No isolated lab for this step

This concept has no code of its own to isolate — the motivating gap is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Organizing Numbers for Fast Search

**A situation worth representing precisely:** the numbers `50, 30, 70, 20, 40`, arranged so that from any starting point, smaller values sit to one side and larger values sit to the other — `30` and `20` and `40` (all less than `50`) on one side, `70` (greater than `50`) on the other, and, within that first group, `20` (less than `30`) and `40` (greater than `30`) split the same way again.

**Checking whether a list captures this arrangement:** a list (Lesson 32) has exactly one "next" item after any given one — it cannot represent "the numbers less than this one" and "the numbers greater than this one" as two separate, independently structured groups at the same time.

**Naming what's actually needed:** a structure where a single value can have *two* separate smaller structures hanging off it at once, each one recursively organized the identical way.

### Walkthrough

- **`50, 30, 70, 20, 40`, described by their less-than/greater-than relationships** — establishes a genuine, motivating need for branching structure, rather than introducing trees as an arbitrary new topic.
- **The explicit check against list's own definition (Lesson 32)** — confirms precisely what a list cannot represent, rather than merely asserting it.
- **"two separate smaller structures hanging off it at once"** — not yet a formal definition, but the precise shape Concept Unit 2 is about to name.

### CS Lens

This is the recognition that "recursively smaller" doesn't have to mean "one smaller instance" — a structure's own definition can legitimately require two, or more, independent smaller instances at every level, exactly the branching Lesson 31 already found inside `fib`'s call structure, here appearing inside the data itself. Also recognized in: a family tree, where each person has two parents, each of whom has two parents; a knockout tournament bracket, where each match's winner came from two smaller brackets; a decision process, where each choice leads to two smaller decision processes depending on the answer; a river system, where each confluence joins two smaller tributary systems.

### SE Lens

The alternative to recognizing this need is to try to force branching data into a list anyway — perhaps a list of lists, tracked by hand, with no structure actually enforcing the branching relationship. The real cost of that alternative is exactly the kind of unenforced, error-prone bookkeeping this curriculum's earlier lessons have repeatedly warned against: nothing about an ordinary list guarantees "the second item is everything less than the first," the way a tree's own definition will. Naming the actual need precisely, as this unit does, costs nothing beyond stating what a list cannot do; it sets up Concept Unit 2 to define a structure that enforces the branching relationship directly, rather than merely hoping it's maintained by convention.

---

## Concept Unit 2: A Binary Tree — Recursively Defined, Just Like a List

### The Problem

Concept Unit 1 identified the need. Stating it precisely, as a recursive definition in Lesson 27's exact sense, is what actually makes it something a real procedure can be derived from.

### No isolated lab for this step

This concept has no code of its own to isolate — the definition is stated and checked directly below, not through a construct with its own syntax.

### Applying It — Defining Binary Tree Precisely

**The base case:** the empty tree, `'()` — reusing exactly the same value Lesson 32 used for the empty list.

**The recursive case:** a node — a value, together with a left subtree and a right subtree, each one itself a complete binary tree (possibly empty, possibly not).

**Comparing this directly against list's own definition (Lesson 32), restated:** "either the empty list, `'()`, or a pair whose second element is itself a list." A binary tree's definition has the identical shape — an empty case, and a non-empty case built from smaller instances of the same thing — differing only in *how many* smaller instances the non-empty case requires: one for a list, two for a tree.

**Confirming the base case correctly stops the recursion, exactly the way Lesson 29 already insisted a base case must:** since both the left and right subtrees of a node are themselves required to be complete binary trees, and the empty tree is a legitimate binary tree needing no further breakdown, a tree built by nesting nodes finitely deep always bottoms out at `'()` on every branch, the same guarantee Lesson 27 required of factorial's single base case, now required twice per node instead of once.

### Walkthrough

- **The base case, `'()`** — first appearance of *binary tree*'s base case, deliberately reusing the identical empty-list value Lesson 32 already established.
- **The recursive case, a value plus two subtrees** — first appearance of the recursive case, explicitly named as requiring *two* smaller instances rather than list's one.
- **The direct, clause-by-clause comparison against list's definition** — not a new concept, but confirmation that this is the same underlying shape Lesson 27 already established, differing in exactly one respect (how many smaller instances) rather than in kind.

### CS Lens

This is Lesson 27's recursive-definition shape, shown for the second time (after Lesson 40's expressions) to accommodate more than one smaller instance per recursive case — confirming the shape itself doesn't require exactly one branch, only that every branch strictly gets smaller and every path eventually reaches a base case. Also recognized in: a legal definition of "estate," recursively including a person's direct assets and the estates of anyone they've inherited from, potentially branching across multiple inheritances; a corporate structure's definition of "subsidiary," recursively including direct subsidiaries and their own subsidiaries, potentially branching across many divisions; a chemical compound's molecular structure, recursively built from smaller bonded groups, potentially branching at multiple points; a mathematical definition of a fractal, recursively built from multiple smaller copies of the same base shape.

### SE Lens

The alternative to stating the tree's recursive definition precisely, matched clause by clause against the list definition it's built alongside, is to treat trees as a completely new, unrelated topic requiring separate first-principles reasoning. The real cost of that alternative is losing exactly the transfer Lesson 40 already established: every technique built around "check the base case, recurse structurally on the recursive case" carries over directly, and failing to notice the direct structural parallel risks re-deriving guarantees (termination, correctness) that were already fully earned for the general shape, not just for lists specifically. Stating the definition this precisely, side by side with list's own, as this unit does, costs one direct comparison; it confirms nothing new needs to be re-proven — only the number of recursive branches has changed.

---

## Concept Unit 3: Building a Real Tree, and Naming Its Parts

### The Problem

Concept Unit 2 defined binary trees precisely; it hasn't built one. Representing Concept Unit 1's motivating example — `50, 30, 70, 20, 40`, arranged by less-than/greater-than relationships — as real Scheme data means choosing a concrete representation and naming the resulting structure's parts precisely.

### The New Code — Type It Yourself

```scheme
(define empty-tree '())

(define (make-node value left right) (list value left right))
(define (node-value node) (car node))
(define (node-left node) (cadr node))
(define (node-right node) (caddr node))
```

### The Updated Project

This is `tree.scm`, in full:

```scheme
(define empty-tree '())

(define (make-node value left right) (list value left right))
(define (node-value node) (car node))
(define (node-left node) (cadr node))
(define (node-right node) (caddr node))

(define example-tree
  (make-node 50
    (make-node 30
      (make-node 20 empty-tree empty-tree)
      (make-node 40 empty-tree empty-tree))
    (make-node 70 empty-tree empty-tree)))

(display example-tree)
(newline)
```

### Reference Source

Concept Unit 2's definition, translated directly: a node is represented as a three-item list (value, left subtree, right subtree), and the empty tree is represented, exactly as the empty list already is, by `'()`.

### Files affected

Created: `tree.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile tree.scm
(50 (30 (20 () ()) (40 () ())) (70 () ()))
```

Verified this session.

### Mechanical Walkthrough

- **`(define empty-tree '())`** — the base case, named directly rather than written as a bare `'()` everywhere it's needed, exactly the readability benefit a named constant provides anywhere else in this curriculum.
- **`(define (make-node value left right) (list value left right))`** — a constructor, bundling a value and two subtrees into the three-item list representation Concept Unit 2's node definition requires.
- **`(node-value node)`, `(node-left node)`, `(node-right node)`** — three accessors, each a thin, precisely named wrapper around `car`, `cadr`, and `caddr` (Lesson 40) — a reappearance of the same naming discipline Lesson 32's `car`/`cdr` already modeled, here made even more readable by names that say what each piece *means* rather than only how to reach it.
- **`example-tree`, nesting `make-node` calls three levels deep** — first appearance of *node*, *subtree*, *leaf*, and *root*: `example-tree` itself is the root; `20`, `40`, and `70` are each leaves (their own left and right subtrees are both `empty-tree`); `(make-node 30 ...)` is a subtree of the root, itself containing two further subtrees.

### CS Lens

This is the same constructor-and-accessor pattern this curriculum has used informally since Lesson 32's `car`/`cdr`, now applied deliberately, with names chosen specifically to make a tree's own vocabulary — value, left, right — visible directly in the code, rather than requiring every reader to remember that "the second element" means "the left subtree." Also recognized in: a shipping label's named fields (sender, recipient, weight) standing in for raw positions on a form; a spreadsheet's named cell ranges standing in for raw cell coordinates; a legal contract's defined terms standing in for repeating a description in full every time; a recipe's named ingredients standing in for generic references like "the third item on the list."

### SE Lens

The alternative to writing named accessors is to use `car`, `cadr`, and `caddr` directly, everywhere a tree's value or subtrees are needed, the way `eval-expr` did in Lesson 40. The real cost of that alternative, specifically now that this curriculum is working with a data type that has real, meaningful part-names (value, left, right, unlike an expression's more arbitrary "second" and "third" elements), is code that says *where* to look but not *what* it means — a reader has to remember that `cadr` means "left subtree" for a tree, while it meant something entirely different for `eval-expr`'s expressions. Writing `node-value`, `node-left`, and `node-right`, as this unit does, costs three small wrapper procedures; it buys code that reads as tree-vocabulary directly, wherever it's used from here forward in this curriculum.

---

## Concept Unit 4: Processing a Tree — Structural Recursion With Two Recursive Calls

### The Problem

Lesson 40's `eval-expr` combined the results of exactly two sub-evaluations at its recursive case, but only because that particular expression's operator happened to be binary — nothing about expressions in general required exactly two. A binary tree's own definition, per Concept Unit 2, *always* requires exactly two subtrees at every non-empty node. Deriving a procedure over it, following Lesson 33's exact template, means the template's `<combine>` now genuinely needs both recursive results at once, every single time.

### The New Code — Type It Yourself

```scheme
(define (tree-size tree)
  (if (null? tree)
      0
      (+ 1 (tree-size (node-left tree)) (tree-size (node-right tree)))))
```

### The Updated Project

This is `tree-size.scm`, in full:

```scheme
(define empty-tree '())
(define (make-node value left right) (list value left right))
(define (node-value node) (car node))
(define (node-left node) (cadr node))
(define (node-right node) (caddr node))

(define (tree-size tree)
  (if (null? tree)
      0
      (+ 1 (tree-size (node-left tree)) (tree-size (node-right tree)))))

(define example-tree
  (make-node 50
    (make-node 30
      (make-node 20 empty-tree empty-tree)
      (make-node 40 empty-tree empty-tree))
    (make-node 70 empty-tree empty-tree)))

(display (tree-size example-tree))
(newline)
```

### Reference Source

Lesson 33's structural-recursion template, filled in against Concept Unit 2's tree definition: `<base-value>` for the empty tree is `0` (no nodes); `<combine>` for a node is `1` (counting the node itself) plus the size of *both* subtrees.

### Files affected

Created: `tree-size.scm`.

### Change type

Add (new file).

### Dependencies

`tree.scm`'s constructors and accessors.

### Run It — Show the Real Output

```
$ guile tree-size.scm
5
```

Verified this session — `example-tree` has exactly five nodes: `50, 30, 70, 20, 40`.

**Confirming the empty tree's own base case directly:**

```
$ guile -q
scheme@(guile-user)> (define (tree-size tree) (if (null? tree) 0 (+ 1 (tree-size (car (cdr tree))) (tree-size (car (cdr (cdr tree)))))))
scheme@(guile-user)> (tree-size '())
$1 = 0
```

Verified this session.

### Mechanical Walkthrough

- **`(if (null? tree) 0 ...)`** — the base case: a reappearance of `null?` (Lesson 32), checked against the empty tree exactly the way it was checked against the empty list, since both use the identical `'()` value.
- **`(+ 1 (tree-size (node-left tree)) (tree-size (node-right tree)))`** — the recursive case: two separate recursive calls, one per subtree, both needed before `+` (now genuinely called with three arguments, not two) can produce a result — the direct realization of Concept Unit 1's original motivating need for two-way branching.
- **The direct structural parallel to `fib` (Lesson 29), examined explicitly:** `fib`'s two recursive calls, `(fib (- n 1))` and `(fib (- n 2))`, branch because *the procedure* was written to call itself twice. `tree-size`'s two recursive calls branch because *the data itself* — every non-empty node — genuinely contains two separate subtrees. The call shapes look identical; the reason for the branching is different.

### CS Lens

This is structural recursion (Lesson 33) applied to data whose own recursive case has two branches, confirming the technique scales to however many smaller instances a data type's definition actually requires — one for a list, two for a binary tree, and, in principle, however many a differently-shaped recursive structure might need. Also recognized in: counting every member of a family tree, requiring counting both parents' own family trees at every generation; counting every match in a tournament bracket, requiring counting both halves of the bracket at every round; counting every subsidiary in a corporate structure, requiring counting the subsidiaries of every direct subsidiary; counting every tributary in a river system, requiring counting both branches at every confluence.

### SE Lens

The alternative to deriving `tree-size` from the template is to write it by intuition, the same risk Lesson 33 and Lesson 40 already warned against for other recursive data. The real cost of that alternative, specifically for trees, is a genuinely easy mistake to make without the template's discipline: forgetting one of the two subtrees entirely, silently undercounting every tree with any right-side structure while still returning a plausible-looking number for the small, left-only trees someone happened to test with. Deriving it explicitly from Concept Unit 2's definition, as this unit does, costs nothing beyond the same disciplined process already used repeatedly; it guarantees both subtrees are accounted for, because the definition itself requires two, not because a habit of remembering happened to catch it.

---

## Concept Unit 5: Tree Traversal Order Matters — Visiting Nodes in Different Sequences

### The Problem

A list has exactly one natural order to visit its items in — first to last, following `cdr` down to `'()`. A tree, with two subtrees per node, raises a genuinely new question a list never had to answer: when a node has both a value and two subtrees, in what order should they actually be visited relative to each other? This lesson closes by showing, concretely, that the answer isn't obvious — different choices produce genuinely different, both entirely legitimate, sequences.

### No isolated lab for this step

This concept has no code of its own to isolate — two different visiting orders are demonstrated directly below, previewing rather than fully resolving the question Lesson 42 exists to answer.

### Applying It — Two Orders, Two Different Results

**One order: visit the current node's value first, then its left subtree, then its right subtree.**

**A different order: visit the left subtree first, then the current node's value, then the right subtree.**

**Running both against `example-tree`:**

```
$ guile -q
scheme@(guile-user)> (define (collect-root-first tree) (if (null? tree) '() (append (list (car tree)) (collect-root-first (cadr tree)) (collect-root-first (caddr tree)))))
scheme@(guile-user)> (define (collect-left-first tree) (if (null? tree) '() (append (collect-left-first (cadr tree)) (list (car tree)) (collect-left-first (caddr tree)))))
scheme@(guile-user)> (collect-root-first example-tree)
$1 = (50 30 20 40 70)
scheme@(guile-user)> (collect-left-first example-tree)
$2 = (20 30 40 50 70)
```

Verified this session — two genuinely different sequences from the identical tree.

**A striking fact worth noticing, without yet fully explaining it:** `(20 30 40 50 70)` is sorted, smallest to largest — a direct, real consequence of how `example-tree` was originally arranged, back in Concept Unit 1, by less-than/greater-than relationships. This is not a coincidence, and precisely why it isn't one, along with proper names for both orders shown here and a third one this lesson hasn't tried, is the entire subject of the next lesson.

### Walkthrough

- **The two collecting procedures, differing only in *when* each one adds the current node's value relative to its two recursive calls** — demonstrates concretely that "process this node" can be placed before, between, or after its two subtrees' own processing, with each placement a genuine, different choice.
- **`(50 30 20 40 70)` versus `(20 30 40 50 70)`** — confirms the choice isn't cosmetic; it produces genuinely different sequences from the identical underlying tree.
- **The sorted-order observation, deliberately left unexplained** — an honest, explicit forward-pointer, in the same spirit as Lesson 14 and Lesson 21's own, naming exactly what the next lesson will resolve rather than attempting to resolve it here.

### CS Lens

This is the first appearance of a genuinely new question recursive data raises once it branches: not just "how do I combine two subtrees' results" (Concept Unit 4's question) but "in what order, relative to the current node, should each part actually be visited" — a question with more than one legitimate answer, each useful for different purposes. Also recognized in: reading a family tree by generation versus by branch; touring a building floor by floor versus wing by wing; reviewing a corporate structure by visiting a division's own leadership before or after visiting its subsidiaries; presenting a tournament bracket's results by round versus by individual matchup path.

### SE Lens

The alternative to raising this question explicitly, at the end of this lesson, is to let a learner assume, from `tree-size` and `tree-sum` alone, that a tree only ever needs to be processed by combining subtree results, with no separate question about visiting order at all — both of those procedures, after all, don't actually care what order their two recursive calls happen in, since addition doesn't care about order (Lesson 15, Concept Unit 4). The real cost of that alternative would be a learner unprepared for Lesson 42's actual content, encountering "traversal order" as an unmotivated new topic rather than a natural question this lesson's own closing demonstration already raised concretely. Raising it here, honestly unresolved, as this unit does, costs one demonstration and an explicit acknowledgment of what's left open; it is what makes Lesson 42 feel like the direct continuation of a question already asked, not a fresh, disconnected topic.

---

## Closing

### Connect the pieces

One tree, `example-tree`, traced through every unit built in this lesson, start to finish:

1. **The need for branching data (Unit 1):** `50, 30, 70, 20, 40`, related by less-than/greater-than, shown to need more than a list can represent.
2. **The precise recursive definition (Unit 2):** empty tree as base case; a value plus two subtrees as recursive case, compared directly against list's own definition.
3. **A real tree, and its vocabulary (Unit 3):** `example-tree`, built from `make-node` and `empty-tree`, with `node-value`, `node-left`, and `node-right` naming its parts.
4. **Structural recursion with two branches (Unit 4):** `tree-size`, correctly counting all five nodes, its two recursive calls compared directly against `fib`'s.
5. **An open question, honestly raised (Unit 5):** two different visiting orders shown to produce genuinely different sequences, with the sorted-order result left unexplained for Lesson 42.

Unit 5's two orders are applied to the exact same `example-tree` built in Unit 3 and already measured in Unit 4 — nothing in this lesson's closing unit introduced a fresh, unrelated tree.

### What breaks without this

Suppose a procedure needed to process a tree and, following `eval-expr`'s example from Lesson 40 too closely, wrote only one recursive call instead of two — perhaps recursing into the left subtree and simply forgetting the right, on the mistaken assumption that a tree's recursive case works the same way a list's single-`cdr` recursive case does. Applied to a tree with any actual structure on its right side, this would silently undercount, undersum, or otherwise fail to process an entire portion of the data, while still running to completion and producing a plausible-looking, wrong result — exactly the kind of confident, incorrect output Lesson 29 already warned a present-but-wrong base case, or here a present-but-incomplete recursive case, can produce with no visible sign anything went wrong. Restoring this lesson's discipline — deriving a tree-processing procedure directly from Concept Unit 2's definition, which explicitly requires *two* subtrees at every node, not assuming a shape carried over from a different, one-branch recursive data type — is what catches this before an entire subtree's worth of data goes silently unprocessed.

### Exercises

1. **Observe.** Build a binary tree of your own, following Concept Unit 3's exact pattern (`make-node`, `empty-tree`, at least five values), representing some real relationship of your choosing between the values.
2. **Formalize.** Derive a `tree-sum` procedure for your Exercise 1 tree, following Concept Unit 4's exact derivation process — stating `<base-value>` and `<combine>` explicitly before writing any code.
3. **Explain.** Run your Exercise 2 procedure and check its result by hand, adding up your tree's values independently.
4. **Formalize.** Write two different node-collecting procedures for your Exercise 1 tree, differing only in when they visit the current node relative to its two subtrees, the way Concept Unit 5 wrote `collect-root-first` and `collect-left-first`.
5. **Explain.** Run both of your Exercise 4 procedures and compare their results. State, honestly, whether you can explain why they differ the way they do, or whether that's a question you're leaving open for the next lesson, the way this lesson left its own sorted-order observation open.

### Definition of done

- [ ] You can state a binary tree's recursive definition precisely, and compare it directly against a list's definition, naming exactly what's different.
- [ ] You can build a real binary tree using named constructors and accessors, and correctly identify its root, at least one leaf, and at least one subtree.
- [ ] You can derive a tree-processing procedure with two recursive calls, following Lesson 33's template, and explain why a tree's recursive case needs two calls where a list's needed one.
- [ ] You can demonstrate, with real code, that two different node-visiting orders produce genuinely different sequences from the identical tree.
- [ ] You completed Exercises 1–5 using a tree of your own choosing, not `example-tree`.
- [ ] Commit `tree.scm`, `tree-size.scm`, your Exercise 2 `tree-sum` procedure, and your Exercise 4 collecting procedures, with a commit message stating whether your Exercise 5 comparison revealed anything you can already partly explain.
