# Lesson 99: Red-Black Trees

**What you will build**: By the end of this lesson you'll understand a second, different way to guarantee Lesson 98's `O(\log n)` bound — not by tracking exact height at every node, but by coloring each node red or black and enforcing a looser, cheaper-to-restore invariant on those colors — and see concretely why the one repair case this lesson works through by hand needs only a single rotation, reusing Lesson 98's own rotations directly, rather than checking every ancestor the way `avl-rebalance` had to.

**What you need to know first**: Lesson 98's balance factor, rotations, and height-tracking cost; Lesson 93's structural induction and `is-bst?`-style validity checking; Lesson 43's logarithms.

**Terms introduced in this lesson**:

- **red-black tree** — a BST in which every node is colored red or black, satisfying: the root is black; every empty subtree counts as black; a red node never has a red child; and every path from a node to any descendant empty subtree passes through the same number of black nodes (that count is the node's **black-height**). *Why it matters*: four simple, cheap-to-check rules that, together, bound the tree's height without ever computing an exact height the way Lesson 98's balance factor did.
- **uncle** — during insertion, the sibling of a node's parent. *Why it matters*: whether a newly-inserted red node's uncle is red or black determines which of this lesson's two repair strategies applies — the single concrete case this lesson works through by hand is specifically the black-uncle case.

**Objects and methods used**: None new. This lesson reuses `get` (Lesson 84), `nil?` (Lesson 85), and `and`/`or` (Lesson 7), each already covered.

---

## Concept Unit: Four Rules Instead of One Number

### The Problem

Lesson 98's `avl-balance-factor` computes an *exact* height at every node, every time it's checked — real, honest work, paid on every single insertion. Can a cheaper set of *local* rules, checked without recomputing height from scratch, still guarantee a tree can't collapse toward Lesson 85's linked list?

### Introduce the concept in isolation

```clojure
(defn make-rb-node [red? value left right] [red? value left right])
(defn rb-red? [node] (if (nil? node) false (get node 0)))
(defn rb-value [node] (get node 1))
(defn rb-left [node] (get node 2))
(defn rb-right [node] (get node 3))

(defn rb-no-red-red? [node]
  (if (nil? node)
    true
    (if (and (rb-red? node) (or (rb-red? (rb-left node)) (rb-red? (rb-right node))))
      false
      (and (rb-no-red-red? (rb-left node)) (rb-no-red-red? (rb-right node))))))
```

```
user=> (def valid-example (make-rb-node false 20 (make-rb-node true 10 nil nil) (make-rb-node true 30 nil nil)))
user=> (rb-no-red-red? valid-example)
true
user=> (def broken-example (make-rb-node false 20 (make-rb-node true 10 (make-rb-node true 5 nil nil) nil) (make-rb-node true 30 nil nil)))
user=> (rb-no-red-red? broken-example)
false
```

A **red-black tree**'s node is a four-slot vector — this lesson's own extension of Lesson 92's three-slot `[value left right]`, one more slot for color — where `nil` itself always counts as black (`rb-red?`'s own `nil?` check). `valid-example` has a black root with two red leaf children, satisfying every rule. `broken-example` gives `10` (red) a red child, `5` — two reds in a row, caught directly by `rb-no-red-red?`, with no height computed anywhere.

### Discard the throwaway example

Not applicable — every function here is real and reusable.

### Project Change

- **Reference Source**: `make-rb-node`/`rb-value`/`rb-left`/`rb-right` extend Lesson 92's vector-as-triple pattern (itself Lesson 85's vector-as-pair, extended once already) to four slots.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn rb-no-red-red? [node]
  (if (nil? node)
    true
    (if (and (rb-red? node) (or (rb-red? (rb-left node)) (rb-red? (rb-right node))))
      false
      (and (rb-no-red-red? (rb-left node)) (rb-no-red-red? (rb-right node))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(if (nil? node) false (get node 0))`** — first appearance: `nil` is *defined* as black here, not merely assumed — every downstream check relies on this exact convention.
- **`(and (rb-red? node) (or (rb-red? (bst-left node)) (rb-red? (bst-right node))))`** — first appearance: catches the one specific violation this unit's rules forbid — a red node with at least one red child — checked at every node, not only where an insertion just happened.
- **`(and (rb-no-red-red? (rb-left node)) (rb-no-red-red? (rb-right node)))`** — reappearing structural recursion (Lesson 30, Lesson 93): the rule must hold recursively, everywhere, exactly the way Lesson 93's `is-bst?` checked its own ordering invariant everywhere, not just at the root.

### CS Lens

Where Lesson 98 tracked a precise number (height) that changes by exactly one with every insertion, this lesson tracks a *pattern* (adjacent colors) that a single insertion can violate in only one specific, local way — a genuinely different kind of invariant, cheaper to state, and, this lesson's closing units argue, sometimes cheaper to restore.

### SE Lens

`avl-balance-factor` has to be recomputed at every node on an insertion's path, since height itself changes. `rb-no-red-red?`, checked here as a whole-tree validator (mirroring Lesson 93's `is-bst?`), only actually needs checking *locally*, at the one node where a new red leaf was just attached — the next unit's insertion logic exploits exactly this difference.

---

## Concept Unit: Why Four Local Rules Bound the Height

### The Problem

Lesson 98 guaranteed `O(\log n)` by keeping an *exact* height difference within `1` at every node. This lesson's rules never mention height at all — only color patterns and a black-node count per path. Do they actually bound height the same way, or just look like they should?

### Introduce the concept in isolation

**Claim**: a red-black tree with `n` nodes has height at most `2 \log_2(n+1)`.

**Step 1 — a lower bound on nodes, from black-height.** By structural induction (Lesson 93) on black-height `bh`: a subtree with black-height `bh` holds at least `2^{bh} - 1` nodes. *Base case*, `bh = 0`: an empty subtree, `2^0 - 1 = 0$ nodes — holds trivially. *Inductive step*: a node with black-height `bh` has two subtrees each with black-height `bh` or `bh - 1` (one less exactly when the node itself is black — property (5), "same black-height on every path," combined with property (2)/(3)'s black-counts), each holding, by the inductive hypothesis, at least `2^{bh-1} - 1` nodes; the node itself plus both subtrees gives at least `2(2^{bh-1}-1) + 1 = 2^{bh} - 1`. So `n \geq 2^{bh} - 1`, meaning `bh \leq \log_2(n+1)` — Lesson 43's logarithms, the identical bound Lesson 91 already derived for a perfectly balanced tree.

**Step 2 — bounding actual height from black-height.** Property (4), "a red node never has a red child," means no path can have two reds in a row — at most every *other* node on any path is red. A path's total length is therefore at most twice its black-node count: `\text{height} \leq 2 \cdot bh`.

**Combining both steps**: `\text{height} \leq 2 \cdot bh \leq 2\log_2(n+1)` — still `O(\log n)`, with a worse constant than Lesson 98's AVL bound, but the same asymptotic guarantee.

### Discard the throwaway example

Not applicable — this is a formal proof about the properties already stated, not new code.

### Mechanical walkthrough — how the argument works, step by step

1. **Structural induction on black-height** — reappearing (Lesson 93): establishes a *minimum* node count for a given black-height, the mirror of Lesson 91's own minimum-depth argument for a fixed node count.
2. **No-red-red bounds path length by black-height** — first appearance of this specific consequence: a purely *local*, per-node rule (property 4) implying a *global* bound on every path's total length.
3. **Combine via substitution** — reappearing algebra (Lesson 6): chaining `\text{height} \leq 2 \cdot bh` and `bh \leq \log_2(n+1)` into one bound on height directly.

### CS Lens

This proof's shape — a structural-induction lemma bounding a substructure's size, then an algebraic step converting that bound into the actual quantity of interest — is the identical two-step shape Lesson 91's own `O(\log n)` claim used, just built from black-height instead of Lesson 91's array positions directly.

### SE Lens

A weaker constant (`2\log_2(n+1)` versus Lesson 98's tighter AVL bound) is a real, honest cost of this lesson's looser invariant — a red-black tree can be *up to twice as deep* as a maximally-balanced AVL tree holding the same values, while still keeping every operation `O(\log n)`. The next unit shows what that looseness buys back.

### Connection to the previous unit

The previous unit stated four local rules; this unit proves they're not merely tidy bookkeeping — they mathematically force the same `O(\log n)` height guarantee Lesson 98 earned through exact tracking, by a genuinely different argument.

---

## Concept Unit: Repairing One Violation — the Black-Uncle Case

### The Problem

Lesson 98's `avl-insert` had to call `avl-rebalance` at *every* level on the way back up from an insertion, since a height change can propagate arbitrarily far upward. A new node in a red-black tree is always inserted red (never violating the black-height rule, property (5), since a red node adds nothing to any black-height count) — but it can violate property (4) if its own parent is also red. Does fixing *that one* violation ever need to look further than the new node's immediate grandparent?

### Introduce the concept in isolation

Start from a valid two-node red-black tree, and insert `5`:

```clojure
(def before (make-rb-node false 20 (make-rb-node true 10 nil nil) nil))
```

Inserting `5` (always red, landing left of `10`) produces `20`(black) → `10`(red) → `5`(red) — two reds in a row, `10`'s own parent-sibling (its **uncle**, `20`'s right child) is `nil`, which counts as black. This is exactly the case a single rotation fixes:

```clojure
(defn rb-rotate-right [y]
  (make-rb-node (rb-red? (rb-left y)) (rb-value (rb-left y))
    (rb-left (rb-left y))
    (make-rb-node (rb-red? y) (rb-value y) (rb-right (rb-left y)) (rb-right y))))

(defn rb-recolor-root-black [node]
  (make-rb-node false (rb-value node) (make-rb-node true (rb-value (rb-left node)) (rb-left (rb-left node)) (rb-right (rb-left node))) (make-rb-node true (rb-value (rb-right node)) (rb-left (rb-right node)) (rb-right (rb-right node)))))
```

```
user=> (def after (rb-recolor-root-black (rb-rotate-right (make-rb-node false 20 (make-rb-node true 10 (make-rb-node true 5 nil nil) nil) nil))))
user=> after
[false 10 [true 5 nil nil] [true 20 nil nil]]
```

`rb-rotate-right` is Lesson 98's `bst-rotate-right`, adapted to carry each node's own color along with it, structurally unchanged. `rb-recolor-root-black` then fixes the colors directly: the new local root (`10`) becomes black, and both its children (`5`, `20`) become red. The result, `after`, is `10`(black) with two red leaf children — check it against `before`'s own black-height (`1`, computed the same way as this lesson's first unit): `after`'s black-height is *also* `1`. **This case never changes the black-height an ancestor above it would see** — which is exactly why no further check above this point is ever needed for this specific case.

### Discard the throwaway example

Not applicable — every function here is real, and `after` is a genuinely fixed, valid tree.

### Project Change

- **Reference Source**: `rb-rotate-right` reuses Lesson 98's `bst-rotate-right` structure directly (by this lesson's own SE lens claim of left-right symmetry, Lesson 98's `bst-rotate-left` mirrored), adapted only to preserve each moved node's own color unchanged during the purely structural move.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn rb-rotate-right [y]
  (make-rb-node (rb-red? (rb-left y)) (rb-value (rb-left y))
    (rb-left (rb-left y))
    (make-rb-node (rb-red? y) (rb-value y) (rb-right (rb-left y)) (rb-right y))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(rb-red? (rb-left y))`, `(rb-red? y)`** — first appearance of a rotation carrying color: every node's own color travels with it to its new position, unchanged by the rotation itself — only the *structure* moves.
- **`rb-recolor-root-black`** — first appearance: a deliberately separate step from rotation, matching the real algorithm's own two-part shape (rearrange, then recolor) rather than one function doing both at once.

**This lesson covers this one case concretely, and describes, without full running code, the second: when the uncle *is* red** — the fix there is pure recoloring (flip the parent and uncle to black, the grandparent to red), no rotation at all, but that recoloring can itself turn the grandparent red-on-red with *its* own parent, requiring the identical check to repeat one level further up. Unlike this unit's rotation case, the red-uncle case does not always terminate locally — it's the reason a full red-black insertion, unlike this lesson's single worked example, sometimes does have to walk back up several levels, just via cheap recoloring rather than Lesson 98's per-level height recomputation.

### CS Lens

This case's height-preserving property — the fixed subtree has the *identical* black-height as before the violation appeared — is a direct consequence of Lesson 98's own rotation proof (Concept Unit 2, that lesson): a rotation changes structure without changing which values are present, and here, the recoloring is specifically chosen so the black-node count along every path stays exactly what it was.

### SE Lens

This is the real tradeoff this lesson's second unit's weaker constant bought back: the black-uncle case, worked through concretely here, needs exactly one rotation and terminates immediately, cheaper than `avl-rebalance`'s guaranteed per-level check; the red-uncle case can propagate, but only ever as cheap recoloring, never a rotation, until it either terminates or reaches the root.

### Connection to the previous unit

The previous unit proved these rules bound height in principle; this unit shows concretely, on a real, hand-verified example, that restoring a violated rule can be strictly cheaper than Lesson 98's approach — for this one case, one rotation, and provably no further propagation needed.

---

## Connect the Pieces

The full repair, checked against this lesson's own validity checker:

```clojure
(println "Before, valid?" (rb-no-red-red? before))
(def violated (make-rb-node false 20 (make-rb-node true 10 (make-rb-node true 5 nil nil) nil) nil))
(println "After inserting 5, valid?" (rb-no-red-red? violated))
(println "After repair, valid?" (rb-no-red-red? after))
```

```
Before, valid? true
After inserting 5, valid? false
After repair, valid? true
```

Exactly the sequence Lesson 93's own `is-bst?` demonstration followed for a different invariant: valid, then broken by one change, then confirmed restored — here by one rotation and a two-node recolor, rather than a proof about `bst-insert` alone.

## What Breaks Without This

Suppose the rotation were applied without the recoloring step — fixing structure but leaving every node's original color untouched:

```
user=> (rb-rotate-right (make-rb-node false 20 (make-rb-node true 10 (make-rb-node true 5 nil nil) nil) nil))
[true 10 [true 5 nil nil] [false 20 nil nil]]
```

The new root, `10`, is still **red** — and its own parent, whatever sits above this subtree in a larger tree, might also be red, reproducing the exact violation this repair was supposed to eliminate, just one level higher, with nothing ever detecting it. Rotation alone only ever fixes the *shape* of a violation (Lesson 98's own concern); this lesson's colors need their own, separate repair step, precisely because rotation was never designed to know anything about them.

## Exercises

1. **Trace.** By hand, verify `rb-no-red-red?` on `after`, confirming it returns `true`.
2. **Predict.** Before checking, predict whether inserting `1` into `after` (landing left of `5`) creates a black-uncle or red-uncle case. (Hint: check `5`'s own uncle — `after`'s right child, `20`.)
3. **Verify.** Compute `after`'s black-height using this lesson's black-height reasoning (Concept Unit 2), and confirm it equals `before`'s.
4. **Break it, on purpose.** Using the unrepaired rotation shown in "What Breaks Without This," construct a three-level example where the still-red new root creates a *second* red-red violation with a grandparent above it.
5. **Generalize.** Write `rb-rotate-left`, using this lesson's `rb-rotate-right` and Lesson 98's left-right symmetry argument, without looking back at `rb-rotate-right`'s code while writing it.
6. **Reconstruct.** Close this lesson. From memory, state all four red-black rules, and explain why the black-uncle case needs only one rotation while the red-uncle case can propagate upward.

## Definition of Done

- [ ] You can state all four red-black rules and check them against a small tree by hand.
- [ ] You can derive, from black-height and the no-red-red rule, why height is bounded by `2\log_2(n+1)`.
- [ ] You can explain why the black-uncle repair case never needs to check above the rotated subtree.
- [ ] You completed Exercise 3 and confirmed black-height is preserved by the repair.
- [ ] You completed Exercise 5 and wrote a correct `rb-rotate-left` from the symmetry argument alone.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you verified and built — for example, `"Confirm black-height preserved across the black-uncle repair; derive rb-rotate-left by symmetry with rb-rotate-right"` — not just `"lesson 99 exercise"`.

---

**Next lesson:** Lesson 100, *B-Trees*, moves from a tree where every node holds exactly one value to one where a single node can hold several — a different answer to the same balance problem, motivated by data too large to fit in fast memory all at once.
