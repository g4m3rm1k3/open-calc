# Lesson 100: Tree Rotations

**What you will build:** a real **rotation** — a local restructuring that changes which node roots a subtree without touching any value or breaking Lesson 97's ordering invariant. Real, verified evidence this session: rotating a degenerate three-node chain (`1 → 2 → 3`, height `3`) produces a perfectly balanced three-node tree (`2` on top, `1` and `3` as its children, height `2`), with the in-order sequence of values — `(1 2 3)` — completely unchanged before and after. Applied to just one piece of a larger, four-level tree, the identical local rotation reduces the *whole* tree's height from `4` to `3`, while `valid-bst?` (Lesson 98) confirms the entire tree, not just the rotated piece, still satisfies the invariant. The transferable point: Lesson 99 showed insertion-order control isn't practical, since real data arrives incrementally with no way to know the "good" order in advance. This lesson derives the alternative — a small, local fix, usable the moment an imbalance is noticed, needing no knowledge of what hasn't been inserted yet.

**What you need to know first:** Lesson 99 (`FP-L099-degenerate-trees.md`) — specifically its closing argument that insertion-order control fails for real, incrementally-arriving data, the exact gap this lesson's local mechanism fills. Lesson 97 (`FP-L097-binary-search-trees.md`) and Lesson 98 (`FP-L098-tree-invariants.md`) — specifically the BST invariant and `valid-bst?`, both used directly here to prove rotation preserves correctness.

**Terms introduced in this lesson**

- **Rotation** — a local restructuring of a small piece of a BST (a node and its child) that changes which one is the local root, while preserving both the ordering invariant and the exact sequence of values an in-order walk produces. It exists to give an already-built tree a way to improve its own balance using only information already present at one spot, without needing to know anything about values inserted earlier or not yet inserted at all.

---

## Concept Unit 1: A Fix That Doesn't Need to See the Future

### The Problem

Lesson 99 showed the best possible tree shape requires knowing the *entire* set of values in advance, in order to insert the true median first — information real, incrementally-arriving data never provides. It's worth deriving a fundamentally different kind of fix: one usable the moment an imbalance is noticed, using only the specific nodes involved, with no need to know what came before or what comes after.

### No isolated lab for this step

This concept has no code of its own to isolate — the requirement is stated directly here, building on Lesson 99's own closing argument.

### Applying It — What "Local" Actually Requires

A local fix can only look at a small, fixed piece of the tree — a node and one of its children, say — and must produce a result that's still a valid BST *and* still contains exactly the same values in exactly the same order, using nothing outside that small piece. Any transformation satisfying both requirements could, in principle, be applied the instant a specific spot in the tree looks unbalanced, regardless of anything else happening elsewhere in the tree.

### Walkthrough

- **"using only the specific nodes involved"** — the defining constraint that separates this lesson's approach from Lesson 99's global, whole-dataset-dependent one.
- **The two hard requirements, named precisely** — validity and value-preservation — are exactly what Concept Unit 3 will need to verify, not merely assert.

### CS Lens

This is a genuinely different engineering strategy than Lesson 99's: instead of controlling the *input* to guarantee a good outcome, this lesson controls the *structure* directly, after the fact, using a transformation cheap enough to apply routinely. Also recognized in: a librarian who can't control the order patrons return books in, but can locally re-shelve a specific overcrowded shelf the moment it's noticed, without needing to reorganize the entire library or know what will be returned next.

### SE Lens

The alternative to a local fix is accepting Lesson 99's real, measured degeneration as an unavoidable cost of not controlling insertion order. The real cost of that alternative, given Lesson 99's own `700×` real gap, is exactly what motivates finding a mechanism usable in the one setting Lesson 99 already showed matters most: ordinary, incrementally-arriving, realistically-ordered data.

---

## Concept Unit 2: Deriving Rotation

### The Problem

Concept Unit 1's two requirements — local, and provably correctness-preserving — need a real, concrete transformation, not just a description of what's wanted.

### No isolated lab for this step

This concept has no code of its own to isolate — the derivation is stated directly below, and Concept Unit 3 implements and checks it as real code.

### Applying It — Deriving rotate-left

Consider a node `X` with a right child `Y`. By the BST invariant, everything in `X`'s left subtree is less than `X`; `Y` and everything in `Y`'s subtrees are greater than `X`; and within `Y`'s own subtrees, `Y`'s left subtree (call it `B`) sits between `X` and `Y` in value, while `Y`'s right subtree is greater than `Y`.

**The rotation:** make `Y` the new local root. `X` becomes `Y`'s *left* child. `B` — previously `Y`'s left subtree — becomes `X`'s new *right* subtree. `X`'s original left subtree, and `Y`'s original right subtree, stay exactly where they are.

**Confirming this still satisfies the invariant, using the ordering already established above:** `X`'s new right subtree, `B`, is genuinely between `X` and `Y` in value — greater than `X` (satisfying `X`'s right-subtree requirement) and less than `Y` (satisfying the new root `Y`'s left-subtree requirement, since `X`, now containing `B`, must be entirely less than `Y`). Every other subtree involved keeps its original relationship to its (unchanged) parent.

**`rotate-right` is the exact mirror image**, swapping every "left" for "right" and vice versa, for a node whose *left* child needs to become the new local root.

### Walkthrough

- **The three relocated pieces, and the two left unchanged** — precisely which parts of the local structure change (`X`, `Y`, and `B`'s attachment point) and which don't (`X`'s original left subtree, `Y`'s original right subtree).
- **The invariant re-confirmed for `B` specifically** — the one subtree that actually moves to a new parent, and therefore the one place the invariant needs active checking, not just re-statement.
- **`rotate-right` as an exact mirror** — a hard concept reappearing in mirrored form, restated rather than left implicit.

### CS Lens

This is a structural transformation proven correct by algebra on the ordering relationships *before* any code runs — exactly the same derive-then-verify discipline Lesson 46 used for recursive correctness, applied here to a data structure's shape rather than a function's return value. Also recognized in: renovating a building by moving one load-bearing wall and correctly recalculating which rooms fall on which side, using only the local blueprint around that one wall, without needing to inspect the rest of the building.

### SE Lens

The alternative to deriving this algebraically first is to write a plausible-looking rotation function and test it against a few examples, hoping it generalizes. The real cost of that alternative is exactly Lesson 22's standing concern: a transformation that happens to work on a few hand-picked trees but silently breaks the invariant on a shape nobody happened to test. Deriving the ordering relationships first, as this unit does, is what Concept Unit 3's real code can then be checked against with confidence.

---

## Concept Unit 3: Implementing and Verifying Rotation

### The Problem

Concept Unit 2's derivation needs real code, checked against both of Concept Unit 1's hard requirements: the invariant must hold afterward, and the in-order sequence of values must be identical.

### The New Code — Type It Yourself

```scheme
(define (rotate-left x)
  (let ((y (bst-right x)))
    (make-bst-node (bst-value y)
                    (make-bst-node (bst-value x) (bst-left x) (bst-left y))
                    (bst-right y))))
```

### The Updated Project

This is `rotation-check.scm`, in full:

```scheme
(define (make-bst-node value left right) (list value left right))
(define (bst-value n) (car n))
(define (bst-left n) (cadr n))
(define (bst-right n) (caddr n))
(define empty-bst '())
(define (bst-empty? n) (null? n))

(define (rotate-left x)                                        ; ← new
  (let ((y (bst-right x)))                                         ; ← new
    (make-bst-node (bst-value y)                                     ; ← new
                    (make-bst-node (bst-value x) (bst-left x) (bst-left y)) ; ← new
                    (bst-right y))))                                          ; ← new

(define (rotate-right y)                                                        ; ← new
  (let ((x (bst-left y)))                                                         ; ← new
    (make-bst-node (bst-value x)                                                    ; ← new
                    (bst-left x)                                                       ; ← new
                    (make-bst-node (bst-value y) (bst-right x) (bst-right y)))))          ; ← new

(define (valid-bst? tree lo hi)
  (if (bst-empty? tree)
      #t
      (and (or (not lo) (> (bst-value tree) lo))
           (or (not hi) (< (bst-value tree) hi))
           (valid-bst? (bst-left tree) lo (bst-value tree))
           (valid-bst? (bst-right tree) (bst-value tree) hi))))

(define (bst-height tree)
  (if (bst-empty? tree) 0
      (+ 1 (max (bst-height (bst-left tree)) (bst-height (bst-right tree))))))

(define (inorder tree)
  (if (bst-empty? tree) '()
      (append (inorder (bst-left tree)) (list (bst-value tree)) (inorder (bst-right tree)))))

(define chain (make-bst-node 1 empty-bst (make-bst-node 2 empty-bst (make-bst-node 3 empty-bst empty-bst))))
(display "chain height: ") (display (bst-height chain)) (newline)
(display "chain inorder: ") (display (inorder chain)) (newline)
(display "chain valid?: ") (display (valid-bst? chain #f #f)) (newline)

(define rotated (rotate-left chain))
(display "after rotate-left height: ") (display (bst-height rotated)) (newline)
(display "after rotate-left inorder: ") (display (inorder rotated)) (newline)
(display "after rotate-left valid?: ") (display (valid-bst? rotated #f #f)) (newline)
(display "rotated structure (value left right): ") (display rotated) (newline)
```

`valid-bst?` and `bst-height` are Lesson 98 and 97's own, unchanged; `inorder` is new — a standard recursive walk (left subtree, then this node, then right subtree) that, for any valid BST, always visits values in increasing order, making it the natural way to check that rotation didn't change *which* values are present or their relative order.

### Reference Source

Lesson 98's `valid-bst?` (`FP-L098-tree-invariants.md`, Concept Unit 3), reused unchanged as the correctness check this lesson's new `rotate-left`/`rotate-right` are verified against.

### Files affected

Created: `rotation-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile rotation-check.scm
chain height: 3
chain inorder: (1 2 3)
chain valid?: #t
after rotate-left height: 2
after rotate-left inorder: (1 2 3)
after rotate-left valid?: #t
rotated structure (value left right): (2 (1 () ()) (3 () ()))
```

Verified this session — the original degenerate chain (`1 → 2 → 3`) has height `3`; after a single `rotate-left`, height drops to `2`, the smallest possible for three values (matching Lesson 99's own `⌈log₂(n+1)⌉` optimum exactly). The in-order sequence, `(1 2 3)`, is *identical* before and after — real, checked confirmation that rotation only restructured the tree's shape, changing nothing about which values it holds or their order. `valid-bst?` confirms the result is still a genuinely correct BST, not merely a differently-shaped structure that happens to look right.

### Mechanical Walkthrough

- **`(bst-right x)`** — a reappearance of `bst-right`; names `y`, the node about to become the new local root.
- **`(make-bst-node (bst-value x) (bst-left x) (bst-left y))`** — builds `X`'s new form: its own value and original left subtree unchanged, but its right subtree now `Y`'s *former* left subtree (`B`, in Concept Unit 2's derivation).
- **`(make-bst-node (bst-value y) ... (bst-right y))`** — builds the new local root: `Y`'s own value, the just-rebuilt `X` as its left child, and `Y`'s original right subtree, untouched.
- **The real, exact height drop from `3` to `2`, with identical in-order output** — direct, checked confirmation of both of Concept Unit 1's hard requirements at once.

### CS Lens

This is Concept Unit 2's algebraic derivation confirmed by real execution: the specific relocations predicted on paper — `B` moving from `Y`'s left to `X`'s right, `X` and `Y` swapping which one is on top — are exactly what the real code performs, and the real, checked output (identical in-order sequence, valid invariant) is exactly what the derivation promised. Also recognized in: a mechanical proof-of-concept model confirming an engineering calculation — the physical result matching the predicted one exactly is what turns algebra into a demonstrated fact.

### SE Lens

The alternative to checking both the invariant and the in-order sequence is to check only one. The real cost of that alternative is incomplete verification: a transformation could preserve the invariant while silently losing or duplicating a value (checked by `inorder`, not `valid-bst?`), or preserve every value while violating the ordering (checked by `valid-bst?`, not `inorder`). Checking both together, as this unit does, is what confirms rotation is fully correctness-preserving, not just correct on the one property that happened to be checked.

---

## Concept Unit 4: A Local Fix, Applied Locally

### The Problem

Concept Unit 3 rotated an entire, small tree. It's worth confirming rotation genuinely works as a *local* fix — applied to just one piece of a larger tree, without needing to touch or even look at the rest of it — and that doing so still preserves the *whole* tree's validity, not just the rotated piece's.

### The New Code — Type It Yourself

```scheme
(define fixed-subtree (rotate-left (bst-right bigger-tree)))
(define fixed-tree (make-bst-node 10 (bst-left bigger-tree) fixed-subtree))
```

### The Updated Project

This is `local-rotation-check.scm`, in full:

```scheme
(define (make-bst-node value left right) (list value left right))
(define (bst-value n) (car n))
(define (bst-left n) (cadr n))
(define (bst-right n) (caddr n))
(define empty-bst '())
(define (bst-empty? n) (null? n))

(define (rotate-left x)
  (let ((y (bst-right x)))
    (make-bst-node (bst-value y)
                    (make-bst-node (bst-value x) (bst-left x) (bst-left y))
                    (bst-right y))))

(define (valid-bst? tree lo hi)
  (if (bst-empty? tree)
      #t
      (and (or (not lo) (> (bst-value tree) lo))
           (or (not hi) (< (bst-value tree) hi))
           (valid-bst? (bst-left tree) lo (bst-value tree))
           (valid-bst? (bst-right tree) (bst-value tree) hi))))

(define (bst-height tree)
  (if (bst-empty? tree) 0
      (+ 1 (max (bst-height (bst-left tree)) (bst-height (bst-right tree))))))

(define (inorder tree)
  (if (bst-empty? tree) '()
      (append (inorder (bst-left tree)) (list (bst-value tree)) (inorder (bst-right tree)))))

(define bigger-tree
  (make-bst-node 10
    (make-bst-node 5 empty-bst empty-bst)
    (make-bst-node 15 empty-bst (make-bst-node 20 empty-bst (make-bst-node 25 empty-bst empty-bst)))))

(display "bigger-tree height: ") (display (bst-height bigger-tree)) (newline)
(display "bigger-tree valid?: ") (display (valid-bst? bigger-tree #f #f)) (newline)
(display "bigger-tree inorder: ") (display (inorder bigger-tree)) (newline)

(define fixed-subtree (rotate-left (bst-right bigger-tree)))                ; ← new
(define fixed-tree (make-bst-node 10 (bst-left bigger-tree) fixed-subtree))   ; ← new

(display "after local rotation, height: ") (display (bst-height fixed-tree)) (newline)
(display "after local rotation, valid?: ") (display (valid-bst? fixed-tree #f #f)) (newline)
(display "after local rotation, inorder: ") (display (inorder fixed-tree)) (newline)
```

`bigger-tree` is built directly: a tree rooted at `10`, with `5` as its left child and a degenerate chain (`15 → 20 → 25`) as its right subtree. `fixed-subtree` rotates *only* that right subtree — `rotate-left` is applied to the node `15`, never to `bigger-tree` itself — and `fixed-tree` reattaches the rotated result under the unchanged root `10`.

### Reference Source

Concept Unit 3's own `rotate-left` and `valid-bst?`, reused unchanged, applied here to a subtree embedded in a larger structure.

### Files affected

Created: `local-rotation-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile local-rotation-check.scm
bigger-tree height: 4
bigger-tree valid?: #t
bigger-tree inorder: (5 10 15 20 25)
after local rotation, height: 3
after local rotation, valid?: #t
after local rotation, inorder: (5 10 15 20 25)
```

Verified this session — `bigger-tree` starts at real height `4`. Rotating *only* the right subtree and reattaching it under the unchanged root `10` drops the *whole* tree's height to `3`. The in-order sequence, `(5 10 15 20 25)`, and `valid-bst?`'s result are both unchanged — confirming a rotation performed on one small piece, using only information local to that piece, correctly preserves validity for the *entire* structure around it, not merely the piece touched directly.

### Mechanical Walkthrough

- **`(bst-right bigger-tree)`** — a reappearance of `bst-right`; isolates just the subtree rooted at `15`, the only piece being rotated.
- **`(rotate-left (bst-right bigger-tree))`** — a reappearance of Concept Unit 3's `rotate-left`, applied to that isolated subtree alone.
- **`(make-bst-node 10 (bst-left bigger-tree) fixed-subtree)`** — a reappearance of `make-bst-node`; reassembles the whole tree, keeping the untouched root and left subtree exactly as they were, attaching only the rotated result.
- **The real, whole-tree height reduction from one local change** — direct, measured confirmation that a small, local operation has a real, structural effect on the entire tree it's embedded in.
- **The rotation applied to a subtree, not the whole tree** — the concrete demonstration of "local" from Concept Unit 1: nothing about node `5`, or the root `10` itself, needed to be inspected or changed.

### CS Lens

This is exactly the property that makes rotation practical as a real, incremental fix: because the invariant is itself recursive (Lesson 97), a transformation that's locally correctness-preserving is automatically globally correctness-preserving, wherever in the tree it's applied — no need to re-verify the parts of the tree untouched by the rotation. Also recognized in: a home repair that only requires inspecting and fixing the specific damaged section of a wall, trusting — correctly, because the wall's structural soundness is a local, section-by-section property — that undamaged sections elsewhere remain sound without needing separate inspection.

### SE Lens

The alternative to testing a local rotation inside a larger tree is to only ever test rotation on small, standalone examples like Concept Unit 3's three-node chain. The real cost of that alternative is never confirming the property that actually makes rotation useful in practice — that it can be reached for at exactly the specific spot where an imbalance is noticed, without needing to rebuild or even inspect the rest of a much larger, real tree.

---

## Closing

### Connect the pieces

One local transformation, derived on paper, implemented, and checked at two scales:

1. **The requirement, named (Unit 1):** a fix usable without knowing anything beyond the specific nodes involved.
2. **Rotation, derived (Unit 2):** three pieces relocated, two left untouched, the ordering relationships checked algebraically before any code exists.
3. **Real, dual verification (Unit 3):** height drops to the true optimum on a small chain; both the invariant and the exact value sequence confirmed unchanged.
4. **Local, applied inside something larger (Unit 4):** the identical operation, touching only one branch, correctly improves and preserves the *entire* surrounding tree.

Every claim in this lesson traces to real, executed code, checked against two independent, already-verified tools (Lesson 97's height measurement, Lesson 98's `valid-bst?`) rather than asserted from the algebraic derivation alone.

### What breaks without this

Suppose an engineer, faced with Lesson 99's real degeneration risk, concluded that fixing an already-unbalanced BST required rebuilding it entirely from scratch — extracting every value, choosing a good order (Lesson 99's `balanced-order`), and reinserting everything. For a large, already-built tree, that real cost would be proportional to the *entire* tree's size, every time a fix was needed. This lesson's rotation shows a cheaper alternative exists: a small, local, `O(1)`-sized transformation, usable exactly where an imbalance is noticed, without touching or rebuilding anything else — the real foundation Lesson 101 onward builds an automatic balancing *policy* on top of.

### Exercises

1. **Observe.** Before checking, predict whether applying `rotate-right` immediately after `rotate-left` to the identical original tree would restore the exact original shape, or produce something different.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, applying both rotations in sequence to Concept Unit 3's original chain.
3. **Formalize.** Build a degenerate `7`-node right-only chain and find, by hand or by writing code to search for one, a sequence of rotations that reduces its height to `3` (the optimum for `7` nodes, per Lesson 99's `⌈log₂(n+1)⌉`).
4. **Explain.** In your own words, explain why `rotate-left` requires `x` to have a non-empty right child, and what would go wrong (or simply not apply) if it were called on a node whose right child was empty.
5. **Explain.** Using Concept Unit 2's algebraic derivation, explain precisely why `B` (`y`'s original left subtree) is the *only* subtree among the four involved that changes which node is its immediate parent.

### Definition of done

- [ ] You can derive `rotate-left`'s three relocated pieces from the ordering relationships alone, before looking at any code.
- [ ] You can explain both hard requirements a rotation must satisfy, and how this lesson verified each one separately.
- [ ] You confirmed, with real code, that a rotation applied to one branch of a larger tree preserves validity for the whole tree.
- [ ] You completed Exercise 3, finding a real rotation sequence that improves a larger degenerate chain.
- [ ] You completed Exercises 1–5, including checking whether rotations are their own exact inverses.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating the rotation sequence you found and its real height result.
