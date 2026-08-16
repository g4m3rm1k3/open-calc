# Lesson 100: B-Trees

**What you will build**: By the end of this lesson you'll derive a tree where a single node holds *several* sorted values and *several* children at once — a genuine departure from every tree since Lesson 30's binary definition — motivated not by comparison count the way Lessons 91–99 were, but by minimizing how many separate nodes ever have to be visited at all, the dominant cost once a tree is too large to fit in fast memory.

**What you need to know first**: Lesson 92's BST search and ordering invariant, for direct contrast; Lesson 84's `get`/`assoc`/`count`; Lesson 43's logarithms and Lesson 50's growth rates; Lesson 53's amortized analysis, for this lesson's cost-model framing.

**Terms introduced in this lesson**:

- **B-tree** — a tree whose nodes hold multiple sorted keys and multiple children, keeping every leaf at the identical depth. *Why it matters*: every tree since Lesson 30 held exactly one value per node and had at most two children; a B-tree's whole point is holding *many* of each, on purpose.
- **order** — the maximum number of children a B-tree node may have (this lesson uses order `4`: at most `3` keys, at most `4` children, per node). *Why it matters*: a single number controlling both how "wide" each node is and, this lesson's second unit shows, how shallow the whole tree ends up.
- **split** — dividing an overfull node into two nodes plus one value pushed up into the parent. *Why it matters*: this lesson's mechanism for keeping every leaf at the same depth, the multiway counterpart to Lesson 98's rotation.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, and `count` (Lesson 84, Lesson 94), each already covered.

---

## Concept Unit: A Node That Holds Several Values

### The Problem

Every comparison Lesson 91 through Lesson 99 counted assumed a comparison is the expensive step. On a structure too large for fast memory — a database index with millions of entries, read from disk — *reaching* a node at all costs far more than comparing a handful of values already sitting in it once it's loaded. Does a tree whose nodes hold *several* values, not one, change what "expensive" even means?

### Introduce the concept in isolation

```clojure
(defn b-keys [node] (get node 0))
(defn b-children [node] (get node 1))
(defn b-leaf? [node] (= (count (b-children node)) 0))
```

```
user=> (def left-leaf [[10 20] []])
user=> (def mid-leaf [[40] []])
user=> (def right-leaf [[60 70] []])
user=> (def btree [[30 50] [left-leaf mid-leaf right-leaf]])
user=> (b-keys btree)
[30 50]
user=> (b-leaf? left-leaf)
true
```

`btree` holds the same seven values Lessons 91–99 have used throughout, in one node holding *two* keys (`30`, `50`) and *three* children — every value in `left-leaf` is less than `30`, every value in `mid-leaf` is between `30` and `50`, every value in `right-leaf` is greater than `50`, the direct multiway generalization of Lesson 92's single-key ordering invariant. This is a **B-tree** of **order** `4`: at most `3` keys and `4` children per node.

### Discard the throwaway example

Not applicable — `btree` is a real tree this lesson's next unit searches.

### Project Change

- **Reference Source**: No reference counterpart — a direct generalization of Lesson 92's single-key ordering invariant to several keys per node, using Lesson 85's vector-as-pair convention (`[keys children]`) at the whole-node level.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn b-leaf? [node] (= (count (b-children node)) 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[keys children]`** — reappearing vector-as-pair (Lesson 85, Lesson 96), applied here at the *whole-node* level rather than to two individual values — `keys` is itself a vector of sorted values, `children` a vector of subtree references.
- **`(= (count (b-children node)) 0)`** — first appearance: a leaf is defined by having *no* children at all, not, as in Lesson 92, by both of exactly two child references being `nil`.

### CS Lens

`btree`'s single root node encodes, in one place, exactly what would have taken three separate BST nodes (Lesson 92) to represent the same partition of values — the same information, packed more densely, which is precisely this lesson's whole motivation.

### SE Lens

Every value in `left-leaf`, `mid-leaf`, and `right-leaf` sits at the *identical* depth (`1`, one level below the root) — unlike Lesson 92's BST, whose depth varied node to node depending on insertion order (Lesson 97's own concern), a B-tree's shape constraint (derived fully once insertion is introduced, this lesson's third unit) keeps every leaf at exactly the same depth, always.

---

## Concept Unit: `b-search` and Why Wider Nodes Mean Shallower Trees

### The Problem

Lesson 92's `bst-search` makes one comparison per node visited. A B-tree node might hold several keys — does searching it cost more comparisons per node, and if so, does a shallower tree still win overall?

### Introduce the concept in isolation

```clojure
(defn b-key-at-least [keys target i]
  (if (>= i (count keys))
    i
    (if (>= (get keys i) target)
      i
      (b-key-at-least keys target (+ i 1)))))

(defn b-search [node target]
  (b-search-at node target (b-key-at-least (b-keys node) target 0)))

(defn b-search-at [node target i]
  (if (and (< i (count (b-keys node))) (= (get (b-keys node) i) target))
    target
    (if (b-leaf? node)
      nil
      (b-search (get (b-children node) i) target))))
```

```
user=> (b-search btree 60)
60
user=> (b-search btree 45)
nil
```

`(b-search btree 60)`: `b-key-at-least` scans `btree`'s keys (`[30 50]`) for the first one `\geq 60$ — neither is, so it returns `2` (past the end). `b-search-at` finds index `2` out of range for `keys`, so it's not a match *here*; not a leaf, so it descends into `children[2]`, `right-leaf` — where `b-key-at-least` finds `60` at index `0` directly, and `b-search-at` confirms the match. `(b-search btree 45)` similarly narrows to `mid-leaf` (between `30` and `50`), finds no match, and — since `mid-leaf` *is* a leaf — correctly returns `nil`.

### Discard the throwaway example

Not applicable — `b-key-at-least`, `b-search`, and `b-search-at` are real, reusable functions.

### Project Change

- **Reference Source**: `b-search`/`b-search-at` reuse Lesson 91's compute-once-pass-to-a-helper pattern directly — the index `b-key-at-least` finds is computed once, then passed into `b-search-at` rather than recomputed.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn b-search [node target]
  (b-search-at node target (b-key-at-least (b-keys node) target 0)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(b-key-at-least keys target 0)`** — reappearing linear-scan recursion (Lesson 24's own shape), now scanning a node's *own* keys — at most `3` comparisons per node in this lesson's order-`4` tree, not `O(\log n)` the way Lesson 91's array-wide binary search was, since a single node's own key count is small and fixed.
- **`(and (< i (count (b-keys node))) (= (get (b-keys node) i) target))`** — first appearance: distinguishes "found, at this exact node" from "not here, descend" using the same index `b-key-at-least` already computed.
- **`(b-search (get (b-children node) i) target)`** — reappearing structural recursion, now indexing into a *vector* of children (Lesson 84's `get`) rather than choosing between exactly two named references (Lesson 92's `bst-left`/`bst-right`).

### CS Lens

Total search cost is (comparisons per node) `\times` (nodes visited) — for order `m`, roughly `m` comparisons per node, `\log_m n` nodes visited (this unit's own claim, proven below): total work is `O(m \log_m n)`, genuinely more *comparisons* than Lesson 92's `O(\log_2 n)` for small `m`, but far fewer *node visits* — and node visits, not comparisons, are what actually cost time once each node lives on disk.

### SE Lens

**Why fewer node visits wins**: for `n = 10^9` values, `\log_2 n \approx 30$ — a plain BST could need `30` separate node accesses. An order-`1000$ B-tree (realistic for a disk-block-sized node) needs only `\log_{1000} n \approx 3$ — ten times fewer. Lesson 53's amortized analysis warned against trusting a single per-operation number without checking what it's actually counting; here, counting *node visits* instead of *comparisons* is precisely the right choice once each visit's real-world cost (a disk read) dwarfs a handful of in-memory comparisons.

### Connection to the previous unit

The previous unit built one node holding several keys; this unit shows searching it costs a little more *within* a node, in exchange for needing far fewer nodes visited overall — the entire tradeoff this lesson exists to make.

---

## Concept Unit: Insertion and Splitting

### The Problem

Inserting into a leaf's own sorted keys (find the position, keep the rest sorted) is a small, ordinary step, no different in spirit from any other sorted-insertion. But a leaf holding order `4`'s maximum of `3` keys has no room for a fourth. What happens when a node genuinely overflows?

### Introduce the concept in isolation

A leaf with keys `[10 20 30]` (already at capacity) receiving `40` briefly holds `[10 20 30 40]` — one too many. **Splitting** resolves this: take the median key, push it *up* into the parent, and divide the rest into two nodes:

```
Before (overflowed):  [10 20 30 40]

After splitting:
  left  = [10 20]
  median = 30   (pushed up into the parent)
  right = [40]
```

```clojure
(def overflowed [10 20 30 40])
(def split-left [(get overflowed 0) (get overflowed 1)])
(def split-median (get overflowed 2))
(def split-right [(get overflowed 3)])
```

```
user=> split-left
[10 20]
user=> split-median
30
user=> split-right
[40]
```

If the overflowing node was an internal node rather than a leaf, its `children` vector splits at the identical point — the first half of children stay with `split-left`, the rest go with `split-right` — this lesson works through the leaf case concretely; an internal split follows the same division, one level up, on children instead of keys.

### Discard the throwaway example

Not applicable — this is a real, if small, worked instance of the split this lesson names.

### CS Lens

Pushing the median *up*, rather than leaving it in either half, is what keeps every leaf at the same depth (this lesson's own first-unit claim): a split never makes any leaf deeper — it only ever adds *one* value to the parent, which itself may then overflow and split in turn, propagating upward exactly the way Lesson 98's rebalancing propagated, but by growing the parent's own key count rather than by rotating.

### SE Lens

If splitting propagates all the way to the root and the root itself overflows, the *only* case that increases a B-tree's height happens: a brand-new root is created, holding just the one median value pushed up from the old root's split, with the two split halves as its two children — height grows by exactly one, at the top, and only there, which is precisely why every leaf stays at the same depth no matter how the tree grows.

### Connection to the previous unit

The previous unit showed a wide node costs a little more to search but saves entire node visits; this unit shows the mechanism that keeps every node wide enough to earn that saving, without ever letting the tree grow unevenly the way Lesson 92's plain BST could.

---

## Connect the Pieces

Representation, search, and the motivating comparison, together:

```clojure
(println "Search for 60:" (b-search btree 60))
(println "Search for 45 (absent):" (b-search btree 45))
(println "Node visits for a balanced BST on 7 values:" 3)
(println "Node visits for this B-tree on 7 values:" 2)
```

```
Search for 60: 60
Search for 45 (absent): nil
Node visits for a balanced BST on 7 values: 3
Node visits for this B-tree on 7 values: 2
```

The same seven values, correctly searchable both ways — `btree`'s own two levels (root, then one leaf) beat a balanced BST's three levels on this small example already; the second unit's argument is exactly why that gap only widens as `n` grows.

## What Breaks Without This

Suppose a split pushed the *first* key up instead of the median:

```
Before (overflowed):  [10 20 30 40]
Broken split: left = [], median = 10, right = [20 30 40]
```

`right`, with `3` keys, is still within capacity — but nothing was actually balanced: the left side is now completely empty, and the very next insertion into that side has nowhere to go but immediately overflow again. Worse, over many insertions, this "push the smallest" rule biases every split the same direction, degrading toward one badly lopsided branch — not Lesson 92's exact linked-list failure, but the identical underlying mistake: a "fix" that doesn't actually distribute values evenly reintroduces the imbalance this lesson's real median-based split exists to prevent.

## Exercises

1. **Trace.** By hand, trace `(b-search btree 30)` — a value stored in the *root* itself, not a leaf — showing it's found without ever visiting a leaf.
2. **Predict.** Before checking, predict how many node visits `(b-search btree 25)` (absent, between `20` and `30`) takes. Verify by tracing.
3. **Verify.** Split `[5 15 25 35]` by this lesson's median rule, and confirm the result's `left`, `median`, and `right` correctly partition all four original values with none lost or duplicated.
4. **Break it, on purpose.** Using "What Breaks Without This"'s broken split rule, apply it twice in a row to two consecutive overflowing leaves, and show the resulting imbalance directly.
5. **Generalize.** For an order-`4` B-tree holding `n = 1{,}000$ values, estimate the maximum height using this lesson's `\log_4 n` argument, and compare it to a balanced BST's `\log_2 n`.
6. **Reconstruct.** Close this lesson. From memory, explain why a B-tree's height only ever grows at the root, and why that keeps every leaf at the same depth.

## Definition of Done

- [ ] You can build a small order-`4` B-tree and explain what its `keys` and `children` vectors represent.
- [ ] You can implement `b-search` and explain why it visits fewer nodes than a comparable BST.
- [ ] You can explain the median-split rule and why pushing the median up (not the smallest or largest key) keeps every leaf at the same depth.
- [ ] You completed Exercise 3 and verified a correct split.
- [ ] You completed Exercise 5 and compared `\log_4 n` against `\log_2 n$ for a concrete `n`.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you verified — for example, `"Verify median split on [5 15 25 35]; compare log_4(1000) vs log_2(1000) node-visit estimates"` — not just `"lesson 100 exercise"`.

---

**Next lesson:** Lesson 101, *Tries*, moves from ordering *whole* values against each other to indexing by the *pieces* a key is made of — deriving a tree shaped by a string's own characters, where shared prefixes are never stored twice.
