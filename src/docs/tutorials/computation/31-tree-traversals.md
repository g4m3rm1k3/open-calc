# Lesson 31: Tree Traversals

**What you will build**: By the end of this lesson you'll be able to derive all three standard tree-visiting orders — preorder, inorder, and postorder — as small, deliberate variations on the exact two-recursive-call shape the previous lesson already established, differing only in *when* each node's own value gets collected relative to its two subtrees. You'll also see a genuinely useful payoff: for one specific kind of tree, one of these three orders produces a sorted list, for free.

**What you need to know first**: The previous lesson's `tree-value`, `tree-left`, `tree-right`, and its two-recursive-call structural recursion, plus Lesson 28's `my-append`.

**Terms introduced in this lesson**:

- **preorder traversal** — visiting a tree's root before either of its subtrees. *Why it matters*: the first of three standard, named visiting orders, each a small variation on the same underlying recursive shape.
- **inorder traversal** — visiting a tree's root between its left and right subtrees. *Why it matters*: for a binary search tree specifically (Concept Unit 4 shows exactly why), this produces every value in sorted order — a genuinely useful consequence, not just a different-sounding name.
- **postorder traversal** — visiting a tree's root after both of its subtrees. *Why it matters*: the order needed whenever a node's own processing depends on both subtrees already being fully handled first — computing a folder's total size only once every file and subfolder inside it is already accounted for, for instance.

**Objects and methods used**: None new. This lesson reuses `cons`, `my-append`, and `list`, each already covered, applied to the previous lesson's tree representation.

---

## Concept Unit: Preorder — Visit the Root First

### The Problem

`tree-sum` and `tree-depth` (previous lesson) each *combine* a tree's values into one final answer, discarding the individual values along the way. Sometimes the goal is different: produce a list of every value in the tree, in some specific, meaningful order. What does the simplest possible ordering — visit each node's own value the moment you arrive at it, before looking at anything below it — actually look like in code?

### Introduce the concept in isolation

```clojure
(defn preorder [tree]
  (if (empty? tree)
    (list)
    (cons (tree-value tree) (my-append (preorder (tree-left tree)) (preorder (tree-right tree))))))
```

```
user=> (preorder small-tree)
(5 3 8)
```

`5` (the root) appears first, exactly matching the name: **preorder** visits the root *pre-* (before) its subtrees. The recursive case conses the current node's value onto the front of everything collected from both subtrees combined — `my-append`, from Lesson 28, joining the left subtree's full preorder list with the right's.

### Discard the throwaway example

Not applicable — `preorder` is a real, reusable function; the rest of this lesson traces it against a larger tree.

### Project Change

- **Reference Source**: No reference counterpart — a direct variation on the previous lesson's `tree-sum` shape, replacing `+` with list-building.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `my-append` (Lesson 28), and `account-tree` from the previous lesson's Connect the Pieces.

### The New Code — type it yourself

```clojure
(defn preorder [tree]
  (if (empty? tree)
    (list)
    (cons (tree-value tree) (my-append (preorder (tree-left tree)) (preorder (tree-right tree))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(cons (tree-value tree) ...)`** — the current node's value placed at the very front, *before* either recursive call's results are even examined — this positioning, relative to the two recursive calls, is the entire definition of "preorder."
- **`(my-append (preorder (tree-left tree)) (preorder (tree-right tree)))`** — reappearing two-recursive-call shape (previous lesson), combined this time with `my-append` rather than `+` or `max`, since the goal is a combined *list*, not a single number.

### CS Lens

Trace `(preorder account-tree)` (the three-level tree from the previous lesson's Connect the Pieces): `(50 30 80 70)` — the root first, then everything from the left subtree, then everything from the right. This exact order — root, then left, then right — is what a program printing a directory tree would use to list a folder's own name before diving into its contents: parent always announced before any of its children.

### SE Lens

Preorder is the natural choice whenever a value needs to be known *before* its subtrees are processed — reconstructing a tree from a flat list (a use this series returns to once parsing is covered, Section VIII) requires exactly this order, since the root has to be identified before its children can even be separated out.

---

## Concept Unit: Inorder — Visit the Root Between Its Subtrees

### The Problem

Preorder visits the root first. What does visiting it *between* the two subtrees — process the left subtree completely, then the root, then the right subtree — look like, and does the resulting order have a use beyond just being a different sequence?

### Introduce the concept in isolation

```clojure
(defn inorder [tree]
  (if (empty? tree)
    (list)
    (my-append (inorder (tree-left tree)) (cons (tree-value tree) (inorder (tree-right tree))))))
```

```
user=> (inorder small-tree)
(3 5 8)
```

The root, `5`, now appears *between* `3` (from the left subtree) and `8` (from the right) — **inorder**, exactly as named. The recursive case appends the left subtree's full inorder list onto a list that starts with the current value and continues with the right subtree's inorder list.

### Discard the throwaway example

Not applicable — `inorder` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `my-append`.

### The New Code — type it yourself

```clojure
(defn inorder [tree]
  (if (empty? tree)
    (list)
    (my-append (inorder (tree-left tree)) (cons (tree-value tree) (inorder (tree-right tree))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(cons (tree-value tree) (inorder (tree-right tree)))`** — the current value placed in front of the *right* subtree's results specifically, not the left's — this is what positions it "in the middle" once the outer `my-append` attaches the left subtree's results in front of this whole expression.
- **`(my-append (inorder (tree-left tree)) ...)`** — the left subtree's results placed first, ahead of everything else — the same `my-append` role as preorder's, just wrapping a different inner expression.

### CS Lens

Inorder's name comes from exactly this positioning — "in order" between the two subtrees — and Concept Unit 4 shows this specific choice has a genuinely useful mathematical consequence, not just a structurally different-looking output.

### SE Lens

Comparing `preorder`'s and `inorder`'s code side by side: the only difference is *where* `(cons (tree-value tree) ...)` sits relative to the two recursive calls — preorder wraps it around everything; inorder tucks it between the left recursive call's `my-append` and the right recursive call directly. A small, deliberate placement decision, not a structurally different algorithm.

### Connection to the previous unit

The previous unit placed the current value before both recursive calls' results; this unit places it between them — the identical recursive shape, one placement decision changed.

---

## Concept Unit: Postorder — Visit the Root Last

### The Problem

Preorder visits the root first; inorder, in the middle. What does visiting it *last* — after both subtrees are completely processed — look like?

### Introduce the concept in isolation

```clojure
(defn postorder [tree]
  (if (empty? tree)
    (list)
    (my-append (my-append (postorder (tree-left tree)) (postorder (tree-right tree))) (list (tree-value tree)))))
```

```
user=> (postorder small-tree)
(3 8 5)
```

`5` (the root) now appears *last* — **postorder**, exactly as named. Both subtrees' results are appended together first, and the current value, wrapped in a one-element list, is appended onto the very end of that combined result.

### Discard the throwaway example

Not applicable — `postorder` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `my-append`.

### The New Code — type it yourself

```clojure
(defn postorder [tree]
  (if (empty? tree)
    (list)
    (my-append (my-append (postorder (tree-left tree)) (postorder (tree-right tree))) (list (tree-value tree)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(list (tree-value tree))`** — reappearing pattern from Lesson 28's `reverse-naive` (wrapping a single value so `my-append` can attach it): the current value, wrapped as a one-element list, placed at the very end via the outer `my-append`.
- **`(my-append (postorder (tree-left tree)) (postorder (tree-right tree)))`** — both subtrees' results combined first, entirely before the current value is even considered — the opposite emphasis from preorder, which considered the current value *before* looking at either subtree.

### CS Lens

Postorder is the order a filesystem needs to compute a folder's total size correctly: a folder's own size depends on knowing every file's and every subfolder's size first — visiting the folder itself (the "root" of that portion of the tree) only makes sense *after* both of its subtrees (its own contents) have already been fully processed. Also recognized in: safely deleting a folder and everything inside it (delete the contents first, the folder itself last — never the reverse), and calculating a company's total expenses by summing every department's expenses before reporting the company-wide total.

### SE Lens

Three traversal functions, differing only in where `(cons (tree-value tree) ...)` or `(list (tree-value tree))` sits relative to the two recursive calls, is a small, concrete instance of Lesson 25 and Lesson 27's repeated realization: once the underlying recursive shape is understood, several genuinely different, useful behaviors are reachable by changing one small, deliberate placement decision rather than rewriting the whole function from scratch each time.

### Connection to the previous unit

The previous unit placed the current value between the two recursive calls; this unit places it after both — completing the three possible positions (before, between, after) a single value can occupy relative to two recursive calls, each one a real, named, useful traversal order.

---

## Concept Unit: Why Order Matters — Inorder on a Binary Search Tree

### The Problem

`account-tree`, from the previous lesson, has a property worth noticing: `30 < 50`, and `50 < 80`, and `70` (in `80`'s left position) satisfies `50 < 70 < 80`. Every left child is less than its parent; every right child is greater. Does inorder's specific visiting order do something useful with a tree built this way?

### Introduce the concept in isolation

```
user=> (inorder account-tree)
(30 50 70 80)
```

Sorted — smallest to largest, exactly. This isn't a coincidence specific to this one tree: a **binary search tree** (a tree where every left subtree's values are all less than the current node, and every right subtree's values are all greater) visited inorder always produces its values in sorted order. Inorder visits the entire left subtree (everything smaller) first, then the current value, then the entire right subtree (everything larger) — precisely the order a sorted list requires, guaranteed by the binary-search-tree property itself, not by anything special about the traversal function.

### Discard the throwaway example

Not applicable — this is a real, verifiable, and genuinely useful property.

### Generalizing

This connection is why Lesson 92 (*Binary Search Trees*), much later in this series, treats inorder traversal as one of its core operations rather than a curiosity: any binary search tree, regardless of how it was built or how unbalanced its shape, always yields a correctly sorted list under inorder traversal — a free, essentially zero-extra-cost way to sort, provided the data was already organized into a binary search tree for some other reason (fast lookup, typically).

### CS Lens

This is a genuine, well-known algorithmic fact, not a teaching device invented for this lesson: "inorder traversal of a BST yields sorted output" is one of the most commonly cited properties of the data structure, referenced directly in Section VI's algorithm design work once sorting (Lessons 113–115) is covered formally.

### SE Lens

Choosing which traversal to use is a real design decision with real consequences, not an arbitrary style preference: preorder for reconstructing structure top-down, postorder for bottom-up dependent computation, inorder specifically when a binary search tree's values need to come out sorted — three genuinely different needs, matched by three genuinely different, deliberately derived orders, not three interchangeable options.

### Connection to the previous unit

The previous unit derived postorder as the third possible placement of a node's value relative to its two recursive calls; this unit shows that inorder, specifically, isn't merely "a third option" alongside preorder and postorder — for a binary search tree, it's the one order that produces something additionally, provably useful.

---

## Connect the Pieces

All three traversals, run against the same tree, side by side:

```clojure
(println "Preorder:  " (preorder account-tree))
(println "Inorder:   " (inorder account-tree))
(println "Postorder: " (postorder account-tree))
```

```
Preorder:   (50 30 80 70)
Inorder:    (30 50 70 80)
Postorder:  (30 70 80 50)
```

Same tree, same four values, three genuinely different orders — each one determined entirely by where `(tree-value tree)` sits relative to the two recursive calls on `(tree-left tree)` and `(tree-right tree)`. Inorder's result, and only inorder's, happens to also be sorted — a direct, visible confirmation of Concept Unit 4's claim, not merely an assertion.

## What Breaks Without This

Suppose a program needed to print a folder structure with each folder's total size, computed as it goes, using preorder instead of postorder:

```
Attempting to print each folder's size in preorder (root before children):
  folder "Documents" — size: ??? (subfolders not yet processed)
    folder "Photos" — size: 400 MB
    folder "Videos" — size: 900 MB
```

`"Documents"`'s own size depends on both `"Photos"`'s and `"Videos"`'s sizes — but preorder visits `"Documents"` *before* either subfolder has been processed at all, meaning the information needed to report its size correctly simply doesn't exist yet at the moment it's needed. This isn't a bug in the traversal function — preorder is doing exactly what it's defined to do — it's a mismatch between what the task actually requires (postorder: children fully processed before their parent) and which traversal was chosen, precisely the deliberate-choice consequence Concept Unit 4's SE Lens named directly.

## Exercises

1. **Trace.** By hand, trace `(preorder small-tree)`, `(inorder small-tree)`, and `(postorder small-tree)`, confirming all three match this lesson's own results.
2. **Predict.** Build a small binary search tree of your own (at least four values, following the left-less-than, right-greater-than rule), and predict its inorder traversal before running it.
3. **Verify.** Confirm your Exercise 2 prediction, and separately compute its preorder and postorder traversals, checking each one produces the same four values in a genuinely different order.
4. **Break it, on purpose.** Build a tree that is *not* a valid binary search tree (put a larger value somewhere in a left subtree, say), and run inorder on it. Confirm the result is no longer sorted, and explain in one sentence why the guarantee from Concept Unit 4 didn't hold.
5. **Generalize.** Write a function `tree-depth-first-labels` that returns *both* a value and its depth (using `tree-depth`-style reasoning) as a pair for every node, in preorder — combining this lesson's traversal shape with the previous lesson's depth computation.
6. **Reconstruct.** Close this lesson. From memory, explain the one difference in code between `preorder`, `inorder`, and `postorder`, and explain precisely why inorder produces sorted output only for a binary search tree, not for an arbitrary tree.

## Definition of Done

- [ ] You can write all three traversal functions from memory, given only the previous lesson's tree accessor functions.
- [ ] You completed Exercise 3 and confirmed all three traversals on your own binary search tree produce the same values in three different orders.
- [ ] You completed Exercise 4 and can explain why breaking the binary-search-tree property breaks inorder's sorted-output guarantee.
- [ ] You can explain, using a concrete scenario (like the folder-size example), why choosing the wrong traversal for a task produces a real, specific failure, not just "the wrong output."
- [ ] Commit your Exercise 2 tree and its three traversals to your notes repository, with a commit message confirming the inorder-sorted property held — for example, `"Add BST with values 15,7,20,3,10 — inorder gives (3 7 10 15 20), confirms sorted-output property"` — not just `"lesson 31 exercise"`.

---

**Next lesson:** Lesson 32, *Generators and Search*, uses this section's recursive tools to explore a space of possibilities rather than a single fixed data structure — the first step toward Lesson 33's backtracking and Section VI's full algorithm-design toolkit.
