# Lesson 98: AVL Trees

**What you will build**: By the end of this lesson you'll derive a height-tracking invariant strict enough to *guarantee* Lesson 91's `O(\log n)` depth for every insertion order — not merely the *expected* case Lesson 97 settled for — and the **rotation** operation that restores it after every single insertion, turning Lesson 92's plain BST into a structure that can never degrade toward Lesson 85's linked list at all.

**What you need to know first**: Lesson 92's `bst-insert` and node representation; Lesson 95's height (this lesson adapts it to BST nodes); Lesson 97's balance-range argument, for direct contrast; Lesson 30's `max`.

**Terms introduced in this lesson**:

- **balance factor** — a node's left subtree height minus its right subtree height. *Why it matters*: a single number capturing exactly how lopsided a node currently is, positive when left-heavy, negative when right-heavy, zero when perfectly even.
- **AVL tree** — a BST in which every node's balance factor is `-1`, `0`, or `1`, always. *Why it matters*: unlike Lesson 97's "usually shallow," this is an invariant in Lesson 16's own sense — checked and restored after *every* insertion, not merely typical of most insertion orders.
- **rotation** — a local rearrangement of a small number of nodes that reduces a subtree's height by one, without changing the set of values it holds or violating the BST ordering invariant (Lesson 92, Lesson 93). *Why it matters*: this lesson's actual mechanism for restoring the AVL invariant — the one new operation everything else in this lesson exists to justify.

**Objects and methods used**: None new. This lesson reuses `max` (Lesson 30), and Lesson 92's `make-bst-node`, `bst-value`, `bst-left`, `bst-right`, each already covered.

---

## Concept Unit: Height and Balance Factor for a BST

### The Problem

Lesson 95 defined height for a heap's array positions. Lesson 92's BST uses node references, not array positions — and Lesson 97 showed a BST's depth can range all the way from `\lceil \log_2(n+1) \rceil$ to `n`, depending entirely on insertion order. What single number, computed at every node, would make an *imbalance* directly visible and checkable, rather than only discoverable after the fact by measuring a whole tree's depth?

### Introduce the concept in isolation

```clojure
(defn bst-height [node]
  (if (nil? node)
    -1
    (+ 1 (max (bst-height (bst-left node)) (bst-height (bst-right node))))))

(defn avl-balance-factor [node]
  (- (bst-height (bst-left node)) (bst-height (bst-right node))))
```

```
user=> (bst-height nil)
-1
user=> (bst-height (make-bst-node 10 nil nil))
0
user=> (avl-balance-factor (make-bst-node 40 (make-bst-node 20 nil nil) nil))
1
```

`bst-height` gives an empty subtree height `-1`, specifically so a leaf — one value, two empty subtrees — comes out to `1 + \max(-1, -1) = 0`, matching Lesson 95's own definition (a leaf has height `0`) exactly. **Balance factor** subtracts right height from left: positive means left-heavy, negative means right-heavy, `0` means perfectly even. An **AVL tree** requires every node's balance factor to be `-1`, `0`, or `1` — never `2` or worse — an invariant in Lesson 16's sense, not merely a typical outcome the way Lesson 97's "expected `O(\log n)`" was.

### Discard the throwaway example

Not applicable — `bst-height` and `avl-balance-factor` are real, reusable functions.

### Project Change

- **Reference Source**: `bst-height` reuses Lesson 30's `tree-depth` combining shape (`+1`, `max` of two recursive results) directly, adapted to Lesson 92's `nil`-based representation and shifted so an empty subtree contributes `-1` instead of `0` — a deliberate change, not an oversight, needed so a leaf still computes to height `0`.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn avl-balance-factor [node]
  (- (bst-height (bst-left node)) (bst-height (bst-right node))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? node) -1`** — first appearance of this specific base-case value; chosen, not arbitrary, so the arithmetic above works out to `0` for a leaf.
- **`(+ 1 (max ...))`** — reappearing combining shape (Lesson 30's `tree-depth`, Lesson 95's own height definition for heaps): one more than the taller of the two subtrees.
- **`(- (bst-height (bst-left node)) (bst-height (bst-right node)))`** — first appearance: a direct subtraction, not a comparison — the *magnitude* of imbalance matters here, not just which side is taller.

### CS Lens

Balance factor is Lesson 16's state invariant, applied to a quantity — height difference — rather than to an ordering relationship the way Lesson 93's `is-bst?` was; both are checked wherever the data could change, not tied to any one specific loop.

### SE Lens

Lesson 97 accepted an *expected*-case guarantee, honestly weaker than a proof. A balance factor restricted to `\{-1, 0, 1\}` at *every* node is the specific, checkable condition strong enough to guarantee `O(\log n)` depth *unconditionally* — the next two units derive the operation that keeps it true.

---

## Concept Unit: Rotation — Reducing Height Without Losing Order

### The Problem

Inserting `10`, then `20`, then `30` into a plain BST (Lesson 92) produces a right-leaning chain of depth `3` — Lesson 92's own degenerate case, at the smallest possible scale. Can three nodes already shaped this way be rearranged into a shallower tree, without changing which values it holds or breaking the BST ordering invariant?

### Introduce the concept in isolation

```clojure
(defn bst-rotate-left [x]
  (make-bst-node (bst-value (bst-right x))
    (make-bst-node (bst-value x) (bst-left x) (bst-left (bst-right x)))
    (bst-right (bst-right x))))
```

```
user=> (def chain (make-bst-node 10 nil (make-bst-node 20 nil (make-bst-node 30 nil nil))))
user=> (bst-height chain)
2
user=> (def rotated (bst-rotate-left chain))
user=> rotated
[20 [10 nil nil] [30 nil nil]]
user=> (bst-height rotated)
1
```

`chain` is `10 → 20 → 30`, each one only a right child, depth `3`. `bst-rotate-left` takes `x`'s *right child* (`20`) and makes *it* the new local root, demoting `x` (`10`) to be the new root's left child, and handing `20`'s own former left subtree (empty, here) to `10` as *its* new right subtree. The result, `rotated`, holds the identical three values (`10`, `20`, `30`) — confirm by inorder traversal: still `10, 20, 30` — but its height dropped from `2` to `1`.

### Discard the throwaway example

Not applicable — `bst-rotate-left` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct derivation: relocate exactly the three references that change (`x`'s right child becomes the new root; the new root's old left subtree becomes `x`'s new right subtree; `x` becomes the new root's left child), leaving every other reference in the subtree untouched.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn bst-rotate-left [x]
  (make-bst-node (bst-value (bst-right x))
    (make-bst-node (bst-value x) (bst-left x) (bst-left (bst-right x)))
    (bst-right (bst-right x))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(bst-value (bst-right x))`** — the new local root's value: `x`'s right child's own value, promoted up one level.
- **`(make-bst-node (bst-value x) (bst-left x) (bst-left (bst-right x)))`** — first appearance of demoting the old root: a fresh node holding `x`'s original value and original left subtree, but with its *right* subtree replaced by whatever used to be `x`'s right child's *left* subtree — the one reference that has to move for the BST ordering invariant to survive the rotation (every value there is greater than `x`, less than the new root — exactly where it still belongs).
- **`(bst-right (bst-right x))`** — the new root's right subtree: `x`'s right child's own right subtree, entirely untouched.

### CS Lens

The values that could have broken the BST invariant (Lesson 92, proven in Lesson 93) — the middle subtree, relocated from one side to the other — are exactly, and only, the ones this rotation moves; every other value's position relative to the ones around it is provably unchanged, which is precisely why a rotation never needs to re-derive or re-check ordering the way a fresh `bst-insert` would.

### SE Lens

`bst-rotate-right` is this operation's exact mirror — swap every "left" for "right" and vice versa — not a function requiring its own separate derivation; deriving one rotation carefully and trusting the other by symmetry is itself a real, common engineering shortcut, valid here because the BST ordering invariant is itself left-right symmetric.

### Connection to the previous unit

The previous unit gave imbalance a precise number; this unit gives the operation that changes it — one rotation, applied at the one node where it's needed, reduces that node's height by exactly one.

---

## Concept Unit: `avl-insert` — Rebalancing After Every Insertion

### The Problem

A single rotation fixes one already-identified imbalance. `bst-insert` (Lesson 92) can create an imbalance anywhere along its insertion path, and the *shape* of that imbalance — which child is too tall, and which of *that* child's own children is too tall — determines whether one rotation suffices or two are needed. Can `bst-insert` be extended to detect and fix this automatically, at every level, on the way back up from every insertion?

### Introduce the concept in isolation

```clojure
(defn avl-rebalance [node]
  (if (= (avl-balance-factor node) 2)
    (if (>= (avl-balance-factor (bst-left node)) 0)
      (bst-rotate-right node)
      (bst-rotate-right (make-bst-node (bst-value node) (bst-rotate-left (bst-left node)) (bst-right node))))
    (if (= (avl-balance-factor node) -2)
      (if (<= (avl-balance-factor (bst-right node)) 0)
        (bst-rotate-left node)
        (bst-rotate-left (make-bst-node (bst-value node) (bst-left node) (bst-rotate-right (bst-right node)))))
      node)))

(defn avl-insert [node target]
  (if (nil? node)
    (make-bst-node target nil nil)
    (if (= (bst-value node) target)
      node
      (if (< target (bst-value node))
        (avl-rebalance (make-bst-node (bst-value node) (avl-insert (bst-left node) target) (bst-right node)))
        (avl-rebalance (make-bst-node (bst-value node) (bst-left node) (avl-insert (bst-right node) target)))))))
```

```
user=> (def t1 (avl-insert (avl-insert (avl-insert nil 10) 20) 30))
user=> t1
[20 [10 nil nil] [30 nil nil]]
user=> (def t2 (avl-insert (avl-insert (avl-insert nil 30) 10) 20))
user=> t2
[20 [10 nil nil] [30 nil nil]]
```

`t1` inserts `10, 20, 30` — each one immediately right-heavy, balance factor `-2` at the root once `30` lands, with the right child (`20`)'s own balance factor `-1` (`\leq 0`): a **single** rotation, `bst-rotate-left` applied at the root. `t2` inserts `30, 10, 20` — balance factor `2` at the root (left-heavy), but the left child (`10`)'s own balance factor is `-1` (`< 0`, not `\geq 0`): a **double** rotation — `bst-rotate-left` at `10` first, straightening the "zigzag" shape into a single-direction lean, then `bst-rotate-right` at the root, exactly this unit's second case. Both insertion orders — one already-handled by a single rotation, one needing two — converge on the *identical* balanced result.

### Discard the throwaway example

Not applicable — `avl-rebalance` and `avl-insert` are real, reusable functions.

### Project Change

- **Reference Source**: `avl-insert` reuses `bst-insert`'s exact structure (Lesson 92) with one addition: `avl-rebalance` wraps every rebuilt node before it's returned, checking and, if needed, fixing the one node whose balance factor could have just changed.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn avl-insert [node target]
  (if (nil? node)
    (make-bst-node target nil nil)
    (if (= (bst-value node) target)
      node
      (if (< target (bst-value node))
        (avl-rebalance (make-bst-node (bst-value node) (avl-insert (bst-left node) target) (bst-right node)))
        (avl-rebalance (make-bst-node (bst-value node) (bst-left node) (avl-insert (bst-right node) target)))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(= (avl-balance-factor node) 2)`, `(= (avl-balance-factor node) -2)`** — a hard concept reappearing: proof by cases (Lesson 17), exhaustive over the only two ways a single insertion can push a previously-valid balance factor (`\{-1,0,1\}`) out of range — exactly `2` or exactly `-2`, never further, since one insertion changes any subtree's height by at most one.
- **`(>= (avl-balance-factor (bst-left node)) 0)`** — the single-versus-double decision: a left-heavy node (`2`) whose left child leans left or is even (`\geq 0`) is a straight lean, fixed by one rotation; leaning the *other* way (`< 0`) is the "zigzag" needing two.
- **`(bst-rotate-right (make-bst-node (bst-value node) (bst-rotate-left (bst-left node)) (bst-right node)))`** — first appearance of the double-rotation case: `bst-rotate-left`, applied to the *left child alone*, straightens the zigzag first; the outer `bst-rotate-right`, on the now-straight-leaning result, is the exact same single-rotation case already derived — not a fourth new operation, two already-derived ones composed.

### CS Lens

Every one of the four textbook-named AVL cases (left-left, right-right, left-right, right-left) reduces to exactly two operations — `bst-rotate-left` and `bst-rotate-right` — applied once or twice; naming four cases obscures that there are only two real mechanisms underneath, composed differently.

### SE Lens

`avl-rebalance` runs at *every* level `avl-insert` returns through, not only where an imbalance actually occurred — necessary because a single node's height changing can, in principle, unbalance an ancestor several levels up, even after a lower rotation already fixed the node directly below it. The cost: every insertion now does `O(\log n)` work checking balance, not just `O(\log n)` work finding the insertion point — a real, honest overhead Lesson 92's plain `bst-insert` never paid, in exchange for a guarantee it never made either.

### Connection to the previous unit

The previous unit derived one rotation and trusted its mirror by symmetry; this unit shows every possible imbalance a single insertion can cause reduces to one of those two operations, applied once or composed twice — nothing else is ever needed.

---

## Connect the Pieces

Both worked examples, and the plain `bst-insert` result they're improving on, side by side:

```clojure
(println "Plain bst-insert, 10-20-30, depth:" (bst-height (bst-insert (bst-insert (bst-insert nil 10) 20) 30)))
(println "avl-insert, 10-20-30, depth:" (bst-height t1))
(println "avl-insert, 30-10-20, depth:" (bst-height t2))
```

```
Plain bst-insert, 10-20-30, depth: 2
avl-insert, 10-20-30, depth: 1
avl-insert, 30-10-20, depth: 1
```

Lesson 92's plain `bst-insert` reproduces its own worst case on sorted input, exactly as Lesson 97 characterized; `avl-insert`, on the identical values, in two entirely different orders, both converge to height `1` — the minimum possible for three values — regardless of which order they arrived in.

## What Breaks Without This

Suppose `avl-rebalance` were called only at the *exact* node where `avl-insert` places the new leaf, not at every ancestor on the way back up:

```clojure
(defn broken-avl-insert [node target]
  (if (nil? node)
    (make-bst-node target nil nil)
    (if (= (bst-value node) target)
      node
      (if (< target (bst-value node))
        (make-bst-node (bst-value node) (avl-rebalance (broken-avl-insert (bst-left node) target)) (bst-right node))
        (make-bst-node (bst-value node) (bst-left node) (avl-rebalance (broken-avl-insert (bst-right node) target)))))))
```

This rebalances the *subtree just returned from*, but never re-checks the *current* node once its own child changes size — an ancestor two or more levels above an actual rotation can end up with a balance factor of `2` that nothing ever inspects. `avl-insert`'s real version wraps `avl-rebalance` around the node being *returned* at every single level of the recursion, not only the level where the new leaf landed, specifically so no ancestor's balance factor is ever left unchecked.

## Exercises

1. **Trace.** By hand, trace `(avl-insert (avl-insert nil 10) 20)` — just the first two insertions from `t1` — confirming no rotation fires yet (balance factor `1`, still valid).
2. **Predict.** Before checking, predict which single case (`LL`, `RR`, `LR`, `RL`) inserting `10, 30, 20` triggers, and whether it needs one rotation or two. Verify by tracing.
3. **Verify.** Build `t1` and `t2` from this lesson yourself, and confirm both are `=` to each other despite arising from different insertion orders.
4. **Break it, on purpose.** Run `broken-avl-insert` on a five-value sequence engineered so an ancestor two levels above an insertion ends up with balance factor `2`. Confirm `avl-balance-factor` reports it, uncorrected.
5. **Generalize.** Write `bst-rotate-right`, using `bst-rotate-left`'s derivation and this lesson's own symmetry claim (Concept Unit 2's SE lens) as your guide, without looking back at `bst-rotate-left`'s code while writing it.
6. **Reconstruct.** Close this lesson. From memory, explain why a single insertion can only ever unbalance a node to exactly `2` or `-2`, never further, and derive the single-versus-double rotation decision from a node's own child's balance factor.

## Definition of Done

- [ ] You can compute a node's balance factor and state the AVL invariant precisely.
- [ ] You can derive `bst-rotate-left` and explain, using the BST ordering invariant, why exactly one reference has to move.
- [ ] You can explain why `avl-rebalance` must run at every level of the recursion, not just where the new leaf lands.
- [ ] You completed Exercise 4 and demonstrated the broken version leaving an ancestor unbalanced.
- [ ] You completed Exercise 5 and wrote a correct `bst-rotate-right` from the symmetry argument alone.
- [ ] Commit your Exercise 4 and Exercise 5 work to your notes repository, with a commit message stating what you found and built — for example, `"Demonstrate broken-avl-insert leaving an ancestor at balance factor 2; derive bst-rotate-right by left-right symmetry"` — not just `"lesson 98 exercise"`.

---

**Next lesson:** Lesson 99, *Red-Black Trees*, studies a second, different way to guarantee the same `O(\log n)` bound this lesson just earned through exact height tracking — trading a precise balance-factor check at every node for a looser, color-based invariant that needs fewer rotations per insertion on average.
