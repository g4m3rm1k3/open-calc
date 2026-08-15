# Lesson 42: Tree Traversal

**What you will build:** All three of a tree's classic visiting orders — preorder, inorder, and postorder — implemented, run for real, and cross-checked against Scheme's own built-in `sort`, finally resolving the striking fact Lesson 41 deliberately left unexplained. The transferable problem this lesson is actually about: Lesson 41 showed two different visiting orders produce two different sequences and stopped there, honestly, without naming either one or explaining why one of them happened to come out sorted. This lesson names all three orders precisely, derives each one directly from the tree's own recursive definition, and gives the actual reason — not a coincidence — that inorder traversal of `example-tree` produces increasing order.

**What you need to know first:** Lesson 41 (`FP-L041-trees.md`) — specifically `example-tree`, `collect-root-first`, and `collect-left-first`, all reused directly, with the last two renamed precisely once this lesson names them. Lesson 22 (`FP-L022-proof-as-reliable-reasoning.md`) — specifically the distinction between evidence and proof, reused directly in Concept Unit 3's honest, partial explanation.

**Terms introduced in this lesson**

- **Preorder** — visiting a node's own value before either of its subtrees. Lesson 41's `collect-root-first` was already computing this, without the name.
- **Inorder** — visiting the left subtree, then the node's own value, then the right subtree. Lesson 41's `collect-left-first` was already computing this.
- **Postorder** — visiting both subtrees before the node's own value — the one order Lesson 41 never tried.

## Objects and methods used

- **`sort`**
  - *What it is:* a real Scheme procedure that sorts a list according to a given comparison.
  - *Implementation:* takes a list and a comparison procedure, `(sort lst <)`, and returns a new list arranged so the comparison holds between every adjacent pair; confirmed this session.
  - *Its use:* Concept Unit 5 uses `sort` as an independent, trusted reference to check `inorder`'s output against, rather than trusting the sorted-looking result on sight alone.

---

## Concept Unit 1: Naming the Two Orders Already Seen

### The Problem

Lesson 41 built two procedures, `collect-root-first` and `collect-left-first`, and compared their output without ever giving either one a proper name. Naming them precisely is the first step toward deriving a third, and toward discussing all three with the same precision this curriculum has demanded of every other concept.

### No isolated lab for this step

This concept has no code of its own to isolate — naming two already-built procedures is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Preorder and Inorder, Named

**`collect-root-first`, quoted directly from Lesson 41:** `(append (list (node-value tree)) (collect-root-first (node-left tree)) (collect-root-first (node-right tree)))` — the current node's value collected *before* either recursive call.

**Naming this precisely:** visiting a node's value before its subtrees is preorder — "pre," because the node comes before what follows from it.

**`collect-left-first`, quoted directly:** `(append (collect-left-first (node-left tree)) (list (node-value tree)) (collect-left-first (node-right tree)))` — the current node's value collected *between* the two recursive calls.

**Naming this precisely:** visiting a node's value between its two subtrees is inorder — "in," because the node sits in the middle of the two subtree visits, not before or after both.

**Rechecking Lesson 41's real output against these names:** `collect-root-first`, now understood as preorder, produced `(50 30 20 40 70)` — `50`, the root, genuinely first. `collect-left-first`, now understood as inorder, produced `(20 30 40 50 70)` — `50` genuinely sits between its left subtree's values (`20, 30, 40`) and its right subtree's value (`70`).

### Walkthrough

- **`collect-root-first`, reappearing from Lesson 41 verbatim** — examined here specifically for exactly when it collects the current node's value relative to its two recursive calls.
- **"preorder"** — first appearance of the term, defined by direct reference to the already-familiar procedure.
- **`collect-left-first`, reappearing from Lesson 41 verbatim** — examined the same way.
- **"inorder"** — first appearance of the term, likewise defined by direct reference.

### CS Lens

This is the same naming-what-was-already-there move Lesson 18 made for "function" and Lesson 24 made for "counterexample" — recognizing that a concept was already in genuine use, correctly, before this curriculum gave it a proper name. Also recognized in: a cooking technique used correctly by home cooks for generations before being given a formal name in culinary school; a rhetorical device used correctly by speakers for centuries before being catalogued and named; a musical interval played correctly by ear before being named and notated formally; a legal principle applied correctly in early rulings before being codified with a specific name.

### SE Lens

The alternative to naming these two orders precisely is to keep referring to them only by their specific procedure names, `collect-root-first` and `collect-left-first`, indefinitely. The real cost of that alternative is losing exactly the reusability a proper name provides: "preorder" and "inorder" are names that will apply to *any* tree-visiting procedure with this shape, not just these two specific procedures over `example-tree`, the same generalizing benefit every named concept in this curriculum has provided since Lesson 1's own move from a specific instance to a general computational problem. Naming them precisely, as this unit does, costs nothing beyond the act of naming; it is what lets Concept Unit 2 introduce a third order using the identical, established vocabulary.

---

## Concept Unit 2: A Third Order — Postorder

### The Problem

Preorder visits a node before its subtrees; inorder visits it between them. The one remaining possibility — visiting a node's value only after both of its subtrees are fully visited — is worth deriving and running for real, the same way the first two orders already were, rather than left as an unexplored gap.

### The New Code — Type It Yourself

```scheme
(define (postorder tree)
  (if (null? tree)
      '()
      (append (postorder (node-left tree)) (postorder (node-right tree)) (list (node-value tree)))))
```

### The Updated Project

This is `traversals.scm`, in full:

```scheme
(define empty-tree '())
(define (make-node value left right) (list value left right))
(define (node-value node) (car node))
(define (node-left node) (cadr node))
(define (node-right node) (caddr node))

(define (preorder tree)
  (if (null? tree)
      '()
      (append (list (node-value tree)) (preorder (node-left tree)) (preorder (node-right tree)))))

(define (inorder tree)
  (if (null? tree)
      '()
      (append (inorder (node-left tree)) (list (node-value tree)) (inorder (node-right tree)))))

(define (postorder tree)
  (if (null? tree)
      '()
      (append (postorder (node-left tree)) (postorder (node-right tree)) (list (node-value tree)))))

(define example-tree
  (make-node 50
    (make-node 30
      (make-node 20 empty-tree empty-tree)
      (make-node 40 empty-tree empty-tree))
    (make-node 70 empty-tree empty-tree)))

(display (preorder example-tree))
(newline)
(display (inorder example-tree))
(newline)
(display (postorder example-tree))
(newline)
```

### Reference Source

Concept Unit 1's `preorder` and `inorder`, each showing exactly where the current node's value is collected relative to the two recursive calls — `postorder` derived by moving it to the one remaining position.

### Files affected

Created: `traversals.scm`.

### Change type

Add (new file; this lesson's real, kept artifact, consolidating all three orders from Lesson 41 and this lesson together).

### Dependencies

`tree.scm`'s constructors and accessors (Lesson 41).

### Run It — Show the Real Output

```
$ guile traversals.scm
(50 30 20 40 70)
(20 30 40 50 70)
(20 40 30 70 50)
```

Verified this session — `preorder` and `inorder` matching Lesson 41's already-verified results exactly; `postorder` producing a third, genuinely different sequence, `(20 40 30 70 50)`.

### Mechanical Walkthrough

- **`(append (postorder (node-left tree)) (postorder (node-right tree)) (list (node-value tree)))`** — first appearance of *postorder*: both recursive calls happen, in full, before the current node's value is ever added to the result.
- **`(20 40 30 70 50)`, with `50` — the root — appearing last** — confirms postorder's defining property directly: the topmost node, which every other order places somewhere in the middle or at the very front, appears only at the very end here.
- **All three procedures sharing the identical base case, `(if (null? tree) '() ...)`, and the identical three ingredients — `(list (node-value tree))`, `(preorder/inorder/postorder (node-left tree))`, `(preorder/inorder/postorder (node-right tree))` — differing only in the order those three ingredients are `append`ed** — not a new concept, but confirms all three orders are the same underlying structural recursion (Lesson 33), differing in exactly one respect.

### CS Lens

This is confirmation that "visit a node before, between, or after its subtrees" genuinely exhausts the meaningful possibilities for a binary tree — three orders, corresponding to the three positions a single item can occupy relative to two other groups. Also recognized in: announcing a keynote speaker before, between, or after supporting presentations at a conference; a company processing a merger by handling the parent company's own affairs before, during, or after each subsidiary's; a construction project inspecting a building's foundation before, during, or after inspecting each wing; a book review discussing a book's overall thesis before, interspersed with, or after discussing its individual chapters.

### SE Lens

The alternative to deriving `postorder` explicitly is to stop at the two orders Lesson 41 happened to try, leaving the third unexplored simply because nothing prompted building it. The real cost of that alternative, made concrete in Concept Unit 4, is missing a genuinely useful tool: postorder turns out to be exactly the right order for tasks like safely deleting a tree, where every node's subtrees must be fully processed before the node itself can be removed. Deriving all three explicitly, as this lesson does, costs one additional procedure beyond what Lesson 41 already built; it completes the set, rather than leaving a real, useful option undiscovered.

---

## Concept Unit 3: Why Inorder Produces Sorted Output — Resolving Lesson 41's Cliffhanger

### The Problem

Lesson 41 closed by observing, without explanation, that `collect-left-first` — now named `inorder` — happened to produce `example-tree`'s values in sorted order. This is the moment to actually explain why, rather than leaving it as an unresolved curiosity any longer.

### No isolated lab for this step

This concept has no code of its own to isolate — the explanation is given directly below, connecting `example-tree`'s own construction to `inorder`'s behavior, not through a construct with its own syntax.

### Applying It — Tracing the Actual Reason

**Recalling exactly how `example-tree` was built, back in Lesson 41, Concept Unit 1:** every node's left subtree contains only values less than that node's own value, and every node's right subtree contains only values greater than it — `30`'s left subtree, `20`, is less than `30`; `30`'s right subtree, `40`, is greater than `30`; `50`'s left subtree, containing `30, 20, 40`, is entirely less than `50`; `50`'s right subtree, `70`, is entirely greater than `50`.

**Tracing what `inorder` actually does at the root, `50`, given this property:** it visits the *entire* left subtree first — every one of `20, 30, 40`, all of which are less than `50` — then `50` itself, then the *entire* right subtree — `70`, greater than `50`. Whatever order the left subtree's own values come out in, every single one of them is guaranteed to be less than `50`, and every one of the right subtree's values is guaranteed to be greater.

**Applying the identical reasoning one level down, to confirm it holds throughout, not just at the root:** within the left subtree, rooted at `30`, the same property holds — its own left subtree (`20`) is less than `30`, its own right subtree (`40`) is greater. `inorder` applied to this subtree visits `20`, then `30`, then `40` — already in order, for the identical reason.

**Stating the conclusion, honestly, with its actual scope:** because this specific tree was built so that every node's left subtree is entirely less than it and every node's right subtree is entirely greater — a property this curriculum will later name a binary search tree — visiting left, then the node, then right, at every level, necessarily visits every value in increasing order. This is not a coincidence specific to `example-tree`'s five particular numbers; it follows from the general property the tree was built to have.

**Being honest about what this explanation is, and isn't, per Lesson 22:** this reasoning is convincing, and correctly identifies the actual mechanism — it is not yet a fully rigorous proof covering every possible tree with this property, of any size or shape. A genuinely complete proof needs a technique capable of reasoning about a tree of *arbitrary* depth, not just the three levels `example-tree` happens to have — precisely the tool the next lesson, structural induction, provides.

### Walkthrough

- **`example-tree`'s own construction, re-examined for its less-than/greater-than property** — a reappearance of Lesson 41 Concept Unit 1's original motivating arrangement, now recognized as the actual cause of `inorder`'s sorted output.
- **The root-level trace, then the one-level-down recheck** — demonstrates the reasoning holds at more than one level, building genuine confidence rather than resting on a single check.
- **The honest, explicit statement of the explanation's actual scope** — a direct reappearance of Lesson 22's evidence-versus-proof distinction, applied here to this lesson's own central explanation rather than to an external example.

### CS Lens

This is the discovery of a genuine, useful property connecting a tree's construction to a specific traversal's behavior — the defining reason binary search trees, which this curriculum will build formally much later, are useful at all: an ordering property built into the data's own structure, retrievable in full by nothing more than a specific choice of visiting order. Also recognized in: a properly organized filing cabinet, where flipping through folders front to back in physical order naturally produces alphabetical order because they were filed that way; a well-organized bookshelf, where scanning left to right naturally produces size or subject order because it was shelved that way; a properly seeded tournament bracket, where reading match winners in bracket order reveals a specific, meaningful ranking; a well-indexed book, where reading index entries in page order naturally produces the book's own logical progression.

### SE Lens

The alternative to explaining this mechanism is to note the sorted output as a pleasant surprise and move on, the same shallow treatment Lesson 22 already warned against for any unverified-but-convenient-seeming pattern. The real cost of that alternative is missing a genuinely important, reusable fact: this sorted-output property isn't specific to `example-tree`'s five numbers — it holds for *any* tree built with the same less-than/greater-than structure, which is precisely why this curriculum will return to it as a defining feature of an entire, important category of tree. Tracing the actual mechanism, honestly bounded by what it does and doesn't yet prove, as this unit does, costs the extra care of checking the reasoning at more than one level and stating its limits explicitly; it turns a coincidence-looking observation into genuine, transferable understanding.

---

## Concept Unit 4: Choosing the Right Order for the Task

### The Problem

Three orders now exist, each producing a different, valid sequence from the same tree. It's worth stating directly which practical tasks each one actually suits, rather than treating them as three equally arbitrary options.

### No isolated lab for this step

This concept has no code of its own to isolate — matching each order to a concrete task is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Three Orders, Three Genuine Uses

**Preorder, suited to copying or rebuilding a tree:** because a node's value comes before either of its subtrees, reading a preorder sequence left to right always encounters a node before anything that depends on it — exactly what's needed to reconstruct the tree from scratch, writing down each node the moment it's first encountered, before descending into what it contains.

**Inorder, suited to retrieving values in sorted order:** as Concept Unit 3 just established, for a tree built with the less-than/greater-than property, inorder is precisely what recovers the full sorted sequence directly, without any separate sorting step required.

**Postorder, suited to safely deleting or cleaning up a tree:** because both subtrees are fully visited before the current node, postorder guarantees nothing still depends on a node by the time it's finally processed — safe to delete a node only once, per postorder's own guarantee, everything beneath it has already been handled.

**Confirming this against something concrete, rather than leaving it abstract:** attempting to delete `example-tree` using preorder instead — processing `50` first — would mean removing the root while `30`, `20`, `40`, and `70` still depend on it existing to be reached at all; postorder's `(20 40 30 70 50)`, ending with `50`, avoids this entirely.

### Walkthrough

- **Preorder matched to reconstruction** — a concrete task, not an abstract description, grounding the choice in something checkable.
- **Inorder matched to sorted retrieval** — a direct reappearance of Concept Unit 3's own explanation, now framed as a practical use rather than only a curiosity.
- **Postorder matched to safe deletion, with the preorder-deletion failure made concrete** — demonstrates precisely why the "wrong" order for a given task isn't merely less convenient, but can be actively unsafe.

### CS Lens

This is the recognition that a genuinely equivalent set of options — three ways of visiting the same tree, each individually valid — can still differ sharply in which one suits a specific task, exactly the kind of tool-matching judgment Lesson 36, Concept Unit 5, already valued for choosing `map` over an equivalent `fold` expression. Also recognized in: choosing to review a legal case's background before, during, or after its ruling, depending on whether the goal is context-setting, side-by-side comparison, or summary; choosing to inspect a building's foundation before, during, or after its walls, depending on whether the goal is initial assessment, ongoing construction, or final certification; choosing to announce award winners before, interspersed with, or after presenting nominees, depending on the desired suspense.

### SE Lens

The alternative to matching each order to a specific task is to pick whichever order comes to mind first, regardless of what the task actually needs. The real cost of that alternative is exactly the preorder-deletion failure this unit demonstrated: using the wrong order isn't merely a stylistic choice with no consequence — for a task like deletion, it can actively break the guarantee the task depends on. Deliberately choosing an order based on what a specific task requires, as this unit models, costs nothing beyond the moment of consideration; it is what separates code that happens to work from code whose correctness is actually guaranteed by the traversal order it deliberately chose.

---

## Concept Unit 5: Cross-Checking All Three Against Independent Verification

### The Problem

Concept Unit 3's explanation of `inorder`'s sorted output was convincing, but convincing is not the same as verified — exactly Lesson 22's own distinction, restated as a discipline to actually practice here, using a tool independent of `inorder` itself.

### No isolated lab for this step

This concept has no code of its own to isolate — checking `inorder`'s output against Scheme's own `sort` is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Checking Against sort

**`inorder`'s already-verified output:** `(20 30 40 50 70)`.

**An independent way to sort the same five values, using a tool that has nothing to do with trees or traversal orders at all:**

```
$ guile -q
scheme@(guile-user)> (sort (list 50 30 70 20 40) <)
$1 = (20 30 40 50 70)
```

Verified this session — Scheme's built-in `sort` (see Objects and methods used), applied directly to the flat list of values, with no tree involved whatsoever.

**Comparing the two directly:**

```
scheme@(guile-user)> (equal? (inorder example-tree) (sort (list 50 30 70 20 40) <))
$2 = #t
```

Verified this session — genuine agreement, confirmed by direct comparison rather than by eye.

**Stating what this actually establishes, precisely:** `sort`'s correctness is independent of everything built in this lesson — it doesn't know or care that `example-tree` is a tree at all. Its agreement with `inorder`'s output is real, external evidence, in Lesson 22's exact sense, that Concept Unit 3's explanation correctly identified the true mechanism, not merely a plausible-sounding story.

### Walkthrough

- **`(sort (list 50 30 70 20 40) <)`** — first appearance of `sort` (see Objects and methods used), used deliberately as an independent check, with no connection to trees at all.
- **`(equal? (inorder example-tree) (sort ...))`, returning `#t`** — a direct, checked confirmation, not an assumption based on the two outputs merely looking similar when printed.
- **The precise statement of what independent agreement establishes** — not a new concept, but a direct application of Lesson 22's evidence-versus-proof distinction to this lesson's own central claim, closing the loop this lesson opened by resolving Lesson 41's cliffhanger honestly rather than merely plausibly.

### CS Lens

This is the practice of checking a result against a tool built for an entirely different purpose, specifically because its independence makes agreement meaningful in a way that re-checking with the same method never could — the identical discipline Lesson 31 already used, checking a hand-drawn evaluation tree against real instrumented output, and Lesson 34 used, checking `my-map` against Scheme's own built-in `map`. Also recognized in: checking a hand-calculated tax return against separate accounting software; checking a translated document against a second, independent translator's version; checking a scientific result against a differently designed experiment measuring the same underlying phenomenon; checking a navigational calculation against an independent GPS reading.

### SE Lens

The alternative to this final cross-check is to trust Concept Unit 3's explanation because it sounded rigorous and traced through two levels of the tree correctly. The real cost of that alternative is exactly the risk Lesson 22's flawed `1 = 2` proof demonstrated: an argument can look complete, and even be mostly right, while still containing an error nobody caught by reading it again. Checking against `sort`, a tool with no stake in trees or traversal orders at all, as this unit does, costs one small, independent comparison; it is what turns "this explanation seems right" into "this explanation is confirmed correct, by a method that had no way to simply agree by coincidence."

---

## Closing

### Connect the pieces

One tree, `example-tree`, traced through every unit built in this lesson, start to finish:

1. **Two orders finally named (Unit 1):** `collect-root-first` recognized as preorder; `collect-left-first` recognized as inorder.
2. **The third order derived (Unit 2):** postorder, producing `(20 40 30 70 50)`, the root visited last.
3. **The cliffhanger resolved (Unit 3):** inorder's sorted output traced to `example-tree`'s own less-than/greater-than construction, honestly flagged as convincing evidence rather than yet a full proof.
4. **Each order matched to a real task (Unit 4):** preorder for reconstruction, inorder for sorted retrieval, postorder for safe deletion — with preorder shown to actively fail at deletion specifically.
5. **The explanation independently verified (Unit 5):** `inorder`'s output checked against Scheme's own `sort`, confirming agreement through a tool with no connection to trees at all.

Unit 5's check directly verifies Unit 3's central claim — not a fresh demonstration, but the actual confirmation Unit 3 itself said, honestly, was still missing.

### What breaks without this

Suppose a system needed to delete every node of a tree safely, and its author, having only learned preorder from an incomplete lesson, used it for deletion because "it's the traversal order I know," without ever learning that different orders serve genuinely different purposes. Exactly as Concept Unit 4 demonstrated concretely, deleting `50` — the root — before `30`, `20`, `40`, and `70` have been reached would break the very structure the deletion process needs to still be intact in order to reach the remaining nodes at all, since those nodes are only reachable *through* the root and its subtrees. A real system built this way might work correctly on small, shallow trees purely by luck of implementation details, and fail unpredictably on deeper ones, in a way that would be genuinely confusing to debug without knowing that "which traversal order" was ever a meaningful decision in the first place. Restoring this lesson's discipline — knowing all three orders by name, and deliberately choosing the one whose guarantee actually matches the task, the way Concept Unit 4 matched postorder to deletion specifically — is what prevents this exact category of structural mistake.

### Exercises

1. **Observe.** Using Lesson 41's own tree (your Exercise 1 from that lesson), write all three traversal procedures — preorder, inorder, postorder — following this lesson's exact derivations.
2. **Predict.** Before running them, predict each of your three traversals' output by tracing through your tree by hand, the way Concept Unit 3 traced `example-tree`'s inorder result.
3. **Explain.** Run your Exercise 1 procedures and check your predictions. If your tree was built with the less-than/greater-than property (Lesson 41's arrangement), confirm whether inorder produced sorted output, and explain why or why not using Concept Unit 3's reasoning.
4. **Explain.** Choose one of your own tree's nodes and explain, concretely, which traversal order would be unsafe to use if that specific node needed to be deleted, the way Concept Unit 4 explained why preorder fails for deleting `example-tree`'s root.
5. **Formalize.** Cross-check your Exercise 3 inorder result against Scheme's built-in `sort` applied to your tree's flat list of values, the way Concept Unit 5 checked `example-tree`.

### Definition of done

- [ ] You can name and correctly derive all three traversal orders — preorder, inorder, postorder — for a tree of your own.
- [ ] You can explain, precisely, why a tree built with the less-than/greater-than property produces sorted output under inorder traversal, tracing the reasoning through at least two levels.
- [ ] You can match each traversal order to a real task it's specifically suited for, and demonstrate a concrete failure when the wrong order is used for that task.
- [ ] You can independently verify a traversal result using a tool unconnected to trees, the way Concept Unit 5 used `sort`.
- [ ] You completed Exercises 1–5 using a tree of your own choosing, not `example-tree`.
- [ ] Commit your three traversal procedures and your Exercise 5 cross-check, with a commit message stating whether your Exercise 3 predictions matched your real output on the first attempt.
