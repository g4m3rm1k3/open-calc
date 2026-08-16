# Lesson 92: Binary Search Trees

**What you will build**: By the end of this lesson you'll be able to derive a data structure that gets Lesson 91's `O(\log n)` search *and* Lesson 85's cheap insertion at the same time — something neither a sorted array nor a plain linked structure offers on its own — by building Lesson 91's ordering logic directly into the shape of Lesson 30's recursive tree, and enforcing it as an invariant in the sense Lesson 16 already gave that word.

**What you need to know first**: Lesson 91's binary search elimination logic, Lesson 85's vector-as-node pattern for building structures from scratch, Lesson 30's accessor-function pattern and two-recursive-call structural recursion on trees, and Lesson 16's invariants.

**Terms introduced in this lesson**:

- **binary search tree (BST)** — a binary tree (Lesson 30) whose every node satisfies one ordering constraint: every value in that node's left subtree is smaller than the node's own value, and every value in its right subtree is larger. *Why it matters*: this single constraint is what lets Lesson 91's "eliminate half without inspecting it" logic apply directly to a tree's shape, without needing a sorted array prepared and kept sorted in advance.

**Objects and methods used**: None new. This lesson combines `get` (Lesson 84), `nil` and `nil?` (Lesson 85), and `max` (Lesson 30), each already covered.

---

## Concept Unit: Representing a Binary Search Tree

### The Problem

Lesson 91 made search fast by exploiting a sorted array's order — but inserting a new value into that array means shifting every later element to keep it sorted. Lesson 85 showed the opposite tradeoff: a node-and-reference structure makes attaching a new node cheap, but nothing about it carries any order the way an array's positions do. Can a node-and-reference structure be given order too — enough order for Lesson 91's own elimination logic to still work on it?

### Introduce the concept in isolation

```clojure
(defn make-bst-node [value left right]
  [value left right])

(defn bst-value [node] (get node 0))
(defn bst-left [node] (get node 1))
(defn bst-right [node] (get node 2))
```

Build the identical seven values Lesson 91 searched with `binary-search` over the array `[10 20 30 40 50 60 70]` — this time shaped by an ordering constraint instead of contiguous position:

```clojure
(def bst
  (make-bst-node 40
    (make-bst-node 20
      (make-bst-node 10 nil nil)
      (make-bst-node 30 nil nil))
    (make-bst-node 60
      (make-bst-node 50 nil nil)
      (make-bst-node 70 nil nil))))
```

```
user=> (bst-value bst)
40
user=> (bst-value (bst-left bst))
20
user=> (bst-value (bst-right (bst-left bst)))
30
user=> (bst-left (bst-left (bst-left bst)))
nil
```

`bst`'s left subtree (rooted at `20`) holds only values smaller than `40`; its right subtree (rooted at `60`) holds only values larger than `40` — and the same holds recursively at every node underneath: `20`'s left child `10` is smaller than `20`, its right child `30` is larger. This is called a **binary search tree**: not a new shape (it's exactly Lesson 30's recursive tree), but Lesson 30's shape with one constraint imposed on every node, everywhere, always. That constraint is an **invariant** in precisely Lesson 16's sense — a property required to stay true, not just at this moment, but across every operation performed on the structure from now on, including the insertions this lesson builds next.

### Discard the throwaway example

Not applicable — `make-bst-node`, `bst-value`, `bst-left`, and `bst-right` are real, reusable functions, and `bst` is a running example the rest of this lesson builds on.

### Project Change

- **Reference Source**: `make-bst-node`/`bst-value`/`bst-left`/`bst-right` reuse Lesson 85's vector-as-node pattern directly, extended from a two-slot `[value next]` node to a three-slot `[value left right]` node.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn make-bst-node [value left right]
  [value left right])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[value left right]`** — reappearing vector literal (Lesson 84), but its first appearance in this series as a *three*-slot container rather than Lesson 85's two-slot `[value next]` — one more reference than a linked node needs, because a tree node (Lesson 30) has two smaller instances to point at, not one.
- **`(get node 0)`, `(get node 1)`, `(get node 2)`** — reappearing indexed `get` (Lesson 84), one call per slot, giving each position a name exactly the way Lesson 30's `tree-value`/`tree-left`/`tree-right` and Lesson 85's `node-value`/`node-next` both already did for their own representations.
- **`nil`** — reappearing empty-subtree marker (Lesson 85), used here at *two* positions per leaf (both `left` and `right`) instead of Lesson 85's one `next` position — `(make-bst-node 10 nil nil)` is a leaf: a value whose left and right subtrees are both empty, exactly Lesson 30's own definition of a leaf, now built on vectors instead of lists.
- **The ordering constraint itself** — a hard concept reappearing: this is Lesson 16's invariant, applied for the first time to a tree's own shape rather than to a loop's accumulator or a list's length.

### CS Lens

A binary search tree is Lesson 85's node-and-reference structure with Lesson 91's ordering-based elimination built directly into its shape, rather than needing a separately-sorted array maintained alongside it. Where Lesson 91's order lived in an array's *positions*, a BST's order lives in a *local rule* — smaller left, larger right — repeated at every node.

### SE Lens

A sorted array (Lesson 91) and a BST both support fast search, but for different costs: the array's order is global and free to read (any position tells you everything by comparison), but expensive to maintain under insertion (Lesson 83's shifting cost). A BST's order is only ever a *local* promise at each node — cheap to maintain (Concept Unit 3 derives exactly how), but, as this lesson's closing section shows, nothing about that local promise alone guarantees the tree stays shallow.

---

## Concept Unit: `bst-search` — Applying Elimination to Node References

### The Problem

Lesson 91's `binary-search` eliminates half the remaining array by comparing against the middle index. A BST has no index and no middle to compute — only a root and two references. Does the same eliminate-half logic still work, using nothing but the ordering invariant Concept Unit 1 just established?

### Introduce the concept in isolation

```clojure
(defn bst-search [node target]
  (if (nil? node)
    nil
    (if (= (bst-value node) target)
      (bst-value node)
      (if (< target (bst-value node))
        (bst-search (bst-left node) target)
        (bst-search (bst-right node) target)))))
```

```
user=> (bst-search bst 70)
70
user=> (bst-search bst 15)
nil
```

Trace `(bst-search bst 70)`:

```
compare 70 vs 40 -> 70 > 40 -> search bst-right (the 60-subtree)
compare 70 vs 60 -> 70 > 60 -> search bst-right (the 70-leaf)
compare 70 vs 70 -> match -> return 70
```

Three comparisons — the identical count Lesson 91's `binary-search` needed to find `70` in the array `[10 20 30 40 50 60 70]`, because this tree holds the same seven values arranged into the same three levels. `(bst-search bst 15)` traces `40 -> 20 -> 10 -> nil`: `15` is smaller than `40`, smaller than `20`, larger than `10` (so it would have to be `10`'s right subtree, but that's `nil`) — absence correctly reported the moment a `nil` is reached, the same way `binary-search`'s `low > high` reported absence in Lesson 91.

### Discard the throwaway example

Not applicable — `bst-search` is a real, reusable function.

### Project Change

- **Reference Source**: `bst-search` reuses Lesson 91's `binary-search` elimination logic directly — compare against the current position, discard the half that cannot contain the target — now walking node references (Lesson 85) instead of computing an array midpoint (Lesson 84).
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn bst-search [node target]
  (if (nil? node)
    nil
    (if (= (bst-value node) target)
      (bst-value node)
      (if (< target (bst-value node))
        (bst-search (bst-left node) target)
        (bst-search (bst-right node) target)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? node)`** — reappearing base case (Lesson 85): an empty subtree, reached without ever finding the target, means the target is absent — the direct structural counterpart of Lesson 91's `(> low high)`.
- **`(= (bst-value node) target)`** — a first comparison against the current node's own value, deciding whether the search stops here.
- **`(< target (bst-value node))`** — a hard concept reappearing: this is Lesson 91's elimination decision itself, now phrased as "go left or go right" instead of "narrow `low`/`high`" — the same guarantee (discard half without inspecting it) produced by the ordering invariant instead of array position.
- **`(bst-search (bst-left node) target)`, `(bst-search (bst-right node) target)`** — reappearing structural recursion (Lesson 21, extended to trees in Lesson 30), except only *one* of the two calls is ever actually made per invocation, not both — unlike `tree-sum` and `tree-depth`, which always recursed into both subtrees, a search only ever needs the one subtree the comparison just proved could contain the target.

### CS Lens

This is Lesson 91's `O(\log n)` elimination again, but produced by an entirely different mechanism: Lesson 91 computed an index arithmetically from contiguous memory (Lesson 84); `bst-search` follows a physical reference (Lesson 85) instead. Same asymptotic idea, opposite underlying machinery — and the match is exact only because `bst` happens to be balanced. `bst-search`'s real cost is `O(\text{depth})`, not `O(\log n)` outright; Lesson 93 (*Tree Invariants*) studies this distinction formally, and this lesson's own closing section shows exactly where it can go wrong.

### SE Lens

Lesson 91's sorted array guarantees its own order globally, by construction — there's no way to build an unsorted array and call it "the sorted array." A BST's order is only ever a *local* promise, checked one node at a time; nothing in `bst-search` itself prevents the tree it's searching from being badly shaped, only from being incorrectly shaped. Keeping a BST both correct *and* shallow are two separate concerns — this lesson's remaining unit and closing section pull them apart.

### Connection to the previous unit

The previous unit built a shape that enforces order at every node; this unit shows that shape alone reproduces Lesson 91's own search behavior, comparison for comparison, on the identical data — just walking references instead of narrowing an index range.

---

## Concept Unit: `bst-insert` — Deriving Insertion From the Same Comparison

### The Problem

Lesson 85 made insertion cheap by attaching one new node at a chosen end, with no ordering to respect. A BST can't insert just anywhere — the new value has to land exactly where Concept Unit 1's invariant still holds afterward. Can `bst-insert` reuse the *identical* comparison `bst-search` already makes, just to decide where to attach instead of where to stop?

### Introduce the concept in isolation

```clojure
(defn bst-insert [node target]
  (if (nil? node)
    (make-bst-node target nil nil)
    (if (= (bst-value node) target)
      node
      (if (< target (bst-value node))
        (make-bst-node (bst-value node) (bst-insert (bst-left node) target) (bst-right node))
        (make-bst-node (bst-value node) (bst-left node) (bst-insert (bst-right node) target))))))
```

```
user=> (def bst2 (bst-insert bst 25))
user=> (bst-value (bst-left (bst-right (bst-left bst2))))
25
user=> (bst-left (bst-right (bst-left bst)))
nil
```

`(bst-insert bst 25)` retraces `bst-search`'s exact path — `25` is less than `40` (go left), greater than `20` (go right, into the `30`-leaf's position), less than `30` (go left, where the subtree is `nil`) — and attaches a new leaf there, keeping `20 < 25 < 30` and `25 < 40` both true. The last line confirms `bst` itself is unchanged: `25` was never inserted into it, only into the new tree `bst2`.

### Discard the throwaway example

Not applicable — `bst-insert` is a real, reusable function.

### Project Change

- **Reference Source**: `bst-insert` reuses this lesson's own `bst-search` comparison logic directly to decide direction, and Lesson 85's make-a-node-to-attach idea at the exact `nil` spot the comparisons lead to — but unlike Lesson 85's `node-cons`, which attaches at a fixed front with nothing rebuilt around it, every node on the path back to the root here must be rebuilt, since this series has never used a mutation construct.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn bst-insert [node target]
  (if (nil? node)
    (make-bst-node target nil nil)
    (if (= (bst-value node) target)
      node
      (if (< target (bst-value node))
        (make-bst-node (bst-value node) (bst-insert (bst-left node) target) (bst-right node))
        (make-bst-node (bst-value node) (bst-left node) (bst-insert (bst-right node) target))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(nil? node)` → `(make-bst-node target nil nil)`** — first appearance of this exact use of Lesson 85's node-building idea: the empty spot the comparisons led to becomes a brand-new leaf, the new value with two empty subtrees.
- **`(= (bst-value node) target) -> node`** — first appearance: inserting a value already present returns the node completely unchanged, rather than adding a duplicate — a BST conventionally holds each value once, since a duplicate would make "smaller left, larger right" ambiguous about which copy a later search should find.
- **`(make-bst-node (bst-value node) (bst-insert (bst-left node) target) (bst-right node))`** — first appearance of rebuild-and-reuse: a *new* node is built holding the same value, a *recursively rebuilt* left subtree, and the *exact same, untouched* right subtree — nothing under `bst-right node` is copied or examined at all. The symmetric branch does the same on the other side.
- **`(bst-value node)`, `(bst-left node)`, `(bst-right node)`** — reappearing accessors (Concept Unit 1), read here, not written — this series has no assignment to write with.

### CS Lens

Only the nodes on the path from the root down to the new leaf are ever rebuilt; every subtree hanging off that path is reused exactly as it already was, unchanged — visible directly above, where `bst` printed with no `25` in it at all after `bst-insert` ran. Lesson 104 (*Persistent Data Structures*) and Lesson 105 (*Structural Sharing*) study this reuse formally, much later; for now, just notice that `bst-insert` built an entire new tree's worth of *result* while only actually allocating three new nodes (`40`, `20`, `30`'s rebuilt versions) plus the new leaf.

`bst-insert` costs `O(\text{depth})`, the same class as `bst-search` — not Lesson 85's `O(1)`, because unlike attaching at a fixed front with zero comparisons, `bst-insert` must first *locate* the one position that keeps the invariant true, and locating costs exactly what searching costs.

### SE Lens

Because a BST's shape is entirely a byproduct of insertion order, and `bst-search`'s cost is entirely a byproduct of shape, a BST inherits a real risk Lesson 91's fixed sorted array never had: nothing here checks whether the tree stays shallow, only whether it stays correctly ordered. The next section makes this concrete.

### Connection to the previous unit

The previous unit searched using the invariant to decide where to stop; this unit shows the identical comparison also derives exactly where a new value must go to keep that invariant true afterward — the same logic, run to a different conclusion.

---

## Connect the Pieces

Representation, search, and insertion, all on the same tree:

```clojure
(println "Search for 70:" (bst-search bst 70))
(println "Search for 15 (absent):" (bst-search bst 15))
(def bst2 (bst-insert bst 25))
(println "After inserting 25, search for 25:" (bst-search bst2 25))
(println "Original tree still lacks 25:" (bst-search bst 25))
```

```
Search for 70: 70
Search for 15 (absent): nil
After inserting 25, search for 25: 25
Original tree still lacks 25: nil
```

`bst-search` and `bst-insert` share one comparison (`< target (bst-value node)`) put to two different uses — deciding where to stop looking, and deciding where to attach — and both operate entirely through the ordering invariant Concept Unit 1 built into `bst`'s shape, with no array and no index arithmetic anywhere.

## What Breaks Without This

Nothing checked so far prevents a badly shaped tree — only an incorrectly *ordered* one. Insert the same five values Lesson 91 would search happily in a sorted array, but insert them one at a time, already in sorted order, starting from nothing:

```clojure
(defn bst-depth [node]
  (if (nil? node)
    0
    (+ 1 (max (bst-depth (bst-left node)) (bst-depth (bst-right node))))))

(def sorted-insert
  (bst-insert (bst-insert (bst-insert (bst-insert (bst-insert nil 10) 20) 30) 40) 50))

(println "Depth after sorted-order insertion:" (bst-depth sorted-insert))
```

```
Depth after sorted-order insertion: 5
```

`bst-depth` reuses Lesson 30's `tree-depth` combining shape exactly (`+1` plus the larger of two recursive results), applied to this lesson's `nil`-based representation instead of Lesson 30's `empty?`-based one. Five values, inserted in already-sorted order, produce a tree of depth `5` — every node has an empty left subtree and exactly one right child, which is not a binary search tree behaving badly, it is Lesson 85's linked list, wearing a BST's clothing. Contrast: five values inserted in an order that keeps the tree balanced (Concept Unit 1's `bst`, restricted to `10, 20, 30, 40, 50` minus `60, 70`) would have depth `3`, matching Lesson 91's own `\lceil \log_2(5+1) \rceil = 3`. `bst-search` on `sorted-insert` for `50` would cost five comparisons, not three — every one of this lesson's ordering guarantees held at every single step of that insertion, and the tree still ended up exactly as slow as the structure Lesson 85 already showed is expensive to search. The invariant this lesson built (Concept Unit 1) is necessary for correctness; it was never sufficient, on its own, for speed.

## Exercises

1. **Trace.** By hand, trace `(bst-search bst 10)`, showing every comparison, and confirm the count matches Lesson 91's own worst case on the identical array.
2. **Predict.** Before checking, predict how many comparisons `(bst-insert bst 45)` needs to find its attachment point, then verify by tracing.
3. **Verify.** Build `sorted-insert` from "What Breaks Without This" yourself, run `bst-search` on it for `50`, and count the comparisons by hand to confirm they really do total `5`.
4. **Break it, on purpose.** Call `(bst-insert bst 40)` — a value already present — and confirm the returned tree is `=` to the original `bst`, unchanged, per this lesson's duplicate-handling rule.
5. **Generalize.** Write `bst-min`, returning the smallest value in a non-empty BST, using the invariant directly (which single direction must the smallest value always be found by following?) rather than checking every node.
6. **Reconstruct.** Close this lesson. From memory, explain the ordering invariant a BST enforces, and derive why `bst-search` and `bst-insert` can share the identical comparison for two different purposes.

## Definition of Done

- [ ] You can build a small binary search tree using `make-bst-node` and `nil`, and explain the ordering invariant it satisfies at every node.
- [ ] You can implement `bst-search` and explain why its cost is `O(\text{depth})`, not automatically `O(\log n)`.
- [ ] You can implement `bst-insert` and explain why it rebuilds the path to the root instead of mutating anything.
- [ ] You completed Exercise 3 and confirmed a sorted-order insertion degenerates to depth `5` on `5` values.
- [ ] You completed Exercise 5 and implemented a correct `bst-min`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you found and built — for example, `"Confirm sorted-order insertion degenerates BST depth to O(n); implement bst-min using the ordering invariant directly"` — not just `"lesson 92 exercise"`.

---

**Next lesson:** Lesson 93, *Tree Invariants*, proves formally what this lesson only demonstrated by example — that `bst-search` and `bst-insert` actually preserve the ordering invariant they depend on — and studies precisely why that invariant alone was never enough to keep a tree's depth under control.
