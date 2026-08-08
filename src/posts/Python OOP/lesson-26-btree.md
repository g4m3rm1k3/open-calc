# Lesson 26: A Tree That Refuses to Degenerate
### (Project 9 — Mini Database Engine, C++)

**What you will build.** A real, from-scratch B-Tree — the actual data
structure underlying nearly every real database's index — supporting
insert and search, tested against the exact worst case that breaks a
plain binary search tree: inserting already-sorted keys. The
transferable problem this lesson is actually about: a binary tree's
`O(log n)` search time is only true for a *balanced* tree, and nothing
about a plain BST's insert logic guarantees balance — a B-Tree's real
innovation is a structural rule that makes an unbalanced tree
impossible to construct in the first place, not something to detect and
fix after the fact.

**What you need to know first.** Lesson 25 — `Record`'s fixed layout,
raw file I/O. Project 2, Lesson 6 — linear search and its measured,
deliberately deferred cost, which this lesson closes for good, on top
of a genuinely different structure than the hash index Project 3,
Lesson 9 used to close it there.

---

## Concept Unit: A Binary Search Tree's Worst Case

### The Problem

Lesson 25's `std::vector<Record>` scan is `O(n)` — the exact cost
Project 2, Lesson 6 measured and deferred for Python's own linear
search. A binary search tree promises `O(log n)` search by halving the
search space at every step — but that promise depends entirely on the
tree actually being roughly balanced, and nothing about a plain BST's
own insert logic enforces that.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `bst_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond `g++`.

### The New Code

```cpp
struct BSTNode {
    int key;
    BSTNode* left;
    BSTNode* right;
    BSTNode(int k) : key(k), left(nullptr), right(nullptr) {}
};

BSTNode* insert(BSTNode* root, int key) {
    if (root == nullptr) return new BSTNode(key);
    if (key < root->key) root->left = insert(root->left, key);
    else root->right = insert(root->right, key);
    return root;
}

int height(BSTNode* root) {
    if (root == nullptr) return 0;
    int leftHeight = height(root->left);
    int rightHeight = height(root->right);
    return 1 + (leftHeight > rightHeight ? leftHeight : rightHeight);
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
BSTNode* root = nullptr;
for (int i = 0; i < 1000; i++) {
    root = insert(root, i);
}
std::cout << "Tree height: " << height(root) << std::endl;
```

Real output:

```
Inserted 1000 sorted keys into a BST.
Tree height: 1000
```

**1000 keys, height 1000.** Every single key was greater than the one
before it, so `insert`'s own logic — "smaller goes left, otherwise
right" — sent every single new key to the *right* child of the
previous one, every time, building a structure that is, in every
meaningful sense, a linked list wearing tree syntax. Searching this
"tree" for the last-inserted key means following 1000 pointers, one at
a time — exactly the `O(n)` cost this whole lesson exists to escape,
achieved by accident, through a perfectly ordinary-looking insert
function given a perfectly realistic input: data that happens to
already be sorted, which is a genuinely common, real situation — not a
contrived edge case.

### Discard the throwaway example

`bst_lab.cpp` is deleted — it proved a plain BST's balance is not
guaranteed, only *possible*, and that the worst case is a realistic
input, not an adversarial one.

### Mechanical walkthrough

- `struct BSTNode { int key; BSTNode* left; BSTNode* right; ... };` —
  **(a) first appearance** of a binary tree node: a value, plus two
  pointers to child nodes — the fundamental building block this whole
  lesson's real structure will generalize past.
- `if (key < root->key) root->left = insert(root->left, key);` — **(a)
  first appearance** of recursive BST insertion: descends left or right
  based on comparison, recursing until an empty spot (`nullptr`) is
  found, then placing the new node there.
- `int height(BSTNode* root)` — **(b) hard concept reappearing**: a
  recursive function measuring the tree's own depth, the same
  recursive-summing shape as Lesson 22's `Category.GetTotalValue()`,
  here measuring structure instead of accumulating a value.

### CS lens

A tree whose height approaches its node count instead of its
*logarithm* is called **degenerate**. Also recognized in: any
self-balancing tree's entire reason to exist (AVL trees, red-black
trees — both explicitly designed to *prevent* exactly this scenario by
rebalancing after every insert), a hash table with a badly chosen hash
function producing every key in the same bucket (Project 3, Lesson 9's
own hash index, degenerating to a linear list under different
circumstances).

### SE lens

The alternative already named in the CS lens — a self-balancing binary
tree — genuinely fixes this exact problem, at the cost of real
rebalancing work on every insert. B-Trees, the subject of the rest of
this lesson, take a structurally different approach: instead of
detecting and correcting imbalance after the fact, they use a node
shape that makes severe imbalance impossible to construct in the first
place — worth previewing now, before the real structure is built, so
the design choice lands as deliberate rather than arbitrary.

### Commands needed

Same `g++`/execute pattern as every lesson in this phase.

### Run it

Shown above.

### Connecting sentence

A binary tree's balance is never guaranteed by its own insert logic
alone — the rest of this lesson builds a tree whose *node shape* makes
the problem structurally impossible instead.

---

## Concept Unit: A Node That Holds More Than One Key

### The Problem

A real database index doesn't just need to avoid degenerating — it
needs to be efficient specifically for *disk*-backed storage, where
reading one node from disk is dramatically more expensive than
comparing a few numbers already in memory. A binary tree node holding
exactly one key means one disk read buys exactly one comparison. A node
that could hold *several* keys at once would let one disk read narrow
the search far more per step.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `btree_lab.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<vector>`.

### The New Code

```cpp
const int T = 2;  // minimum degree: each node holds between T-1 and 2T-1 keys

struct BTreeNode {
    std::vector<int> keys;
    std::vector<BTreeNode*> children;
    bool leaf;

    BTreeNode(bool isLeaf) : leaf(isLeaf) {}
};
```

### The Updated Project

Brand-new file, shown whole above — this lesson's real, permanent
structure, not a throwaway.

### Introduce the concept in isolation

No separate lab needed — the node shape itself, and *why* it holds
multiple keys, is best explained directly against the real definition
above, since a fabricated example would need to make the identical
points about the same fields.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `const int T = 2;` — **(a) first appearance** of a B-Tree's
  **minimum degree**: the defining parameter of the whole structure —
  every node (except the root) must hold *at least* `T - 1` keys and
  *at most* `2T - 1` keys; every internal node holds exactly one more
  child than it has keys. With `T = 2`, every node holds 1 to 3 keys and
  2 to 4 children — deliberately small here so the tree's real behavior
  (splitting, in the next unit) is easy to observe; real databases use
  much larger values of `T`, sized so one full node fits exactly one
  disk page.
- `std::vector<int> keys;` — **(b) hard concept reappearing**, `vector`
  from Lesson 25, here holding a small, bounded number of keys per node
  instead of one.
- `std::vector<BTreeNode*> children;` — **(a) first appearance,**
  conceptually: a node with `k` keys always has exactly `k + 1`
  children — one "slot" before the first key, one between each pair of
  keys, one after the last — each child holding keys that fall in that
  specific range.
- `bool leaf;` — **(a) first appearance.** Tracks whether this node has
  any children at all — a **leaf** node holds keys but nothing beneath
  it; every other node is **internal**.

### CS lens

This is the structural core of a **B-Tree**: a self-balancing tree
generalized past binary (two children per node) to allow many children
per node, keeping the tree shallow — few levels deep — even for a very
large number of keys, specifically because each level costs one real
disk access in a genuine database engine. Also recognized in: B+ Trees
(this project's own upcoming, closely related structure, and the one
most real relational databases actually use for their primary indexes),
file system directory structures on many real operating systems, the
`std::map`/`std::set` in C++'s own standard library (typically
implemented as a red-black tree rather than a B-Tree, since they're
designed for in-memory use rather than disk access — a real, different
design point than this project's own on-disk index).

### SE lens

The real tradeoff behind choosing `T`: a larger minimum degree means
fewer levels (fewer disk reads to reach any key) but more keys to
compare *within* each node once it's loaded — a real, tunable balance
point, chosen in practice to match how many keys fit comfortably in one
disk page. This lesson's small `T = 2` optimizes for *visibility* —
watching the tree actually split and grow — over realistic disk
performance; a real database engine would choose `T` in the hundreds.

### Commands needed

None new yet.

### Run it

Deferred to the next unit — a node with no insert logic yet has nothing
to run.

### Connecting sentence

A node that holds several keys at once is the shape a B-Tree needs —
the next unit is the real, load-bearing logic: what happens when a node
is already full and one more key needs to go in.

---

## Concept Unit: Insertion, With Splitting

### The Problem

A node can hold at most `2T - 1` keys. Inserting into a node that's
already full has to do *something* — and whatever that something is has
to preserve the tree's own balance guarantee, not just cram the key in
somehow.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `btree_lab.cpp`.
- **Change type** — add (a `BTree` class wrapping `BTreeNode`, with
  `insert`, `splitChild`, `insertNonFull`).
- **Location** — same file, alongside `BTreeNode`.
- **Dependencies** — `BTreeNode`, this lesson's previous unit.

### The New Code

```cpp
class BTree {
public:
    BTreeNode* root = nullptr;

    void insert(int key) {
        if (root == nullptr) {
            root = new BTreeNode(true);
            root->keys.push_back(key);
            return;
        }
        if ((int)root->keys.size() == 2 * T - 1) {
            BTreeNode* newRoot = new BTreeNode(false);
            newRoot->children.push_back(root);
            splitChild(newRoot, 0);
            root = newRoot;
        }
        insertNonFull(root, key);
    }

private:
    void splitChild(BTreeNode* parent, int i) {
        BTreeNode* fullChild = parent->children[i];
        BTreeNode* newChild = new BTreeNode(fullChild->leaf);

        int mid = fullChild->keys[T - 1];

        newChild->keys.assign(fullChild->keys.begin() + T, fullChild->keys.end());
        fullChild->keys.resize(T - 1);

        if (!fullChild->leaf) {
            newChild->children.assign(fullChild->children.begin() + T, fullChild->children.end());
            fullChild->children.resize(T);
        }

        parent->children.insert(parent->children.begin() + i + 1, newChild);
        parent->keys.insert(parent->keys.begin() + i, mid);
    }

    void insertNonFull(BTreeNode* node, int key) {
        int i = (int)node->keys.size() - 1;
        if (node->leaf) {
            node->keys.push_back(0);
            while (i >= 0 && key < node->keys[i]) {
                node->keys[i + 1] = node->keys[i];
                i--;
            }
            node->keys[i + 1] = key;
        } else {
            while (i >= 0 && key < node->keys[i]) i--;
            i++;
            if ((int)node->children[i]->keys.size() == 2 * T - 1) {
                splitChild(node, i);
                if (key > node->keys[i]) i++;
            }
            insertNonFull(node->children[i], key);
        }
    }
};
```

### The Updated Project

`BTree` is new, wrapping `BTreeNode` with the actual algorithm — the
whole class shown above is the complete, working insert logic.

### Mechanical walkthrough

This is the densest code in this lesson, and it earns a full, careful
pass rather than a compressed one — a hard concept, given the room it
needs, per this curriculum's own standing rule.

- `if (root == nullptr) { root = new BTreeNode(true); root->keys.push_back(key); return; }`
  — **(c) already basic**: the very first key ever inserted becomes a
  single-key leaf root, no splitting possible yet.
- `if ((int)root->keys.size() == 2 * T - 1) { ... splitChild(newRoot, 0); root = newRoot; }`
  — **(a) first appearance** of the **preemptive split**: before
  descending to actually insert, `insert` checks whether the *root*
  itself is already full, and if so, splits it *first*, growing the
  tree's height by exactly one level, with a brand-new, empty root
  sitting above the old one. This is the specific mechanism that keeps
  the tree height-balanced: growth happens at the *top*, uniformly,
  never by one branch silently growing deeper than the others the way
  the degenerate BST did.
- `int mid = fullChild->keys[T - 1];` inside `splitChild` — **(a)
  first appearance** of the split itself: a full node's *middle* key
  (`keys[T-1]`, the exact middle of `2T-1` keys) is promoted *up* into
  the parent, becoming a new separator; everything to its left stays in
  the original node, everything to its right moves into a brand-new
  sibling node.
- `newChild->keys.assign(fullChild->keys.begin() + T, fullChild->keys.end()); fullChild->keys.resize(T - 1);`
  — **(a) first appearance**: the actual redistribution — `newChild`
  takes everything after the promoted middle key; `fullChild` keeps
  everything before it, shrunk down with `.resize()`.
- `if (!fullChild->leaf) { newChild->children.assign(...); fullChild->children.resize(T); }`
  — **(a) first appearance**: if the split node has children of its
  own (it's internal, not a leaf), those children have to be
  redistributed too, in the same proportion as the keys — every child
  still ends up under the correct one of the two resulting nodes.
- `parent->children.insert(parent->children.begin() + i + 1, newChild); parent->keys.insert(parent->keys.begin() + i, mid);`
  — **(a) first appearance**: the parent gains one new key (the
  promoted middle) and one new child (the new sibling), inserted at the
  exact position that keeps every key in the parent still correctly
  ordered relative to its neighbors.
- `insertNonFull`'s leaf case — `node->keys.push_back(0); while (i >= 0 && key < node->keys[i]) { node->keys[i + 1] = node->keys[i]; i--; } node->keys[i + 1] = key;`
  — **(b) hard concept reappearing**: this is an ordinary **insertion
  sort** single-element insert — shifting larger keys one position to
  the right until the new key's correct sorted position is found — the
  same shifting idea, at a much smaller scale, as any sorted-insert
  operation.
- `insertNonFull`'s internal case — descends to the correct child based
  on comparisons, but **first** checks `if
  ((int)node->children[i]->keys.size() == 2 * T - 1) { splitChild(node, i); ... }`
  — **(a) first appearance** of the same preemptive-split idea, applied
  recursively: every node along the path *down* to where the key will
  actually land gets split first if it's already full, guaranteeing
  `insertNonFull` never actually has to insert into a node that has no
  room.

### CS lens

The **preemptive split on the way down** is the real structural
guarantee this whole lesson has been building toward: because every
full node is split *before* a new key is ever placed into it, a B-Tree
can never end up more than one level taller than strictly necessary —
unlike the plain BST, which had no mechanism at all preventing one
branch from growing arbitrarily deeper than its siblings.

### SE lens

The real cost of this algorithm, worth naming plainly: it's genuinely
more code, and genuinely harder to get right on the first attempt, than
the plain BST's four-line `insert`. The payoff is the entire point of
this lesson, proven with real numbers in the next unit — a structural
guarantee against the exact degenerate case that broke the BST outright,
for realistic, common input, not just adversarial edge cases.

### Commands needed

Same pattern.

### Run it

Deferred to the final unit, where insert and search are both exercised
together against the same input that broke the plain BST.

### Connecting sentence

Every full node splits before it can ever cause an overflow — the last
unit proves what that buys, in both structure and real, measured time.

---

## Concept Unit: Search, and the Real Payoff

### The Problem

An insert algorithm that merely *claims* to prevent degeneration is
worth nothing without proof — this unit inserts the identical sorted
sequence that produced a height-1000 BST, and measures what the B-Tree
actually produces instead.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `btree_lab.cpp`.
- **Change type** — add (`search`, `height` methods on `BTree`).
- **Location** — inside `class BTree`.
- **Dependencies** — none new.

### The New Code

```cpp
bool search(BTreeNode* node, int key) {
    if (node == nullptr) return false;
    size_t i = 0;
    while (i < node->keys.size() && key > node->keys[i]) i++;
    if (i < node->keys.size() && node->keys[i] == key) return true;
    if (node->leaf) return false;
    return search(node->children[i], key);
}

int height(BTreeNode* node) {
    if (node == nullptr || node->leaf) return 1;
    return 1 + height(node->children[0]);
}
```

### The Updated Project

`BTree` gains these two methods alongside `insert` — the complete,
working structure this whole lesson has been building toward.

### Mechanical walkthrough

- `while (i < node->keys.size() && key > node->keys[i]) i++;` — **(a)
  first appearance** of a B-Tree's own search-within-a-node step: scans
  across a node's (small, bounded) list of keys to find either an exact
  match or the correct child to descend into — a real, small linear
  scan *within* a node, still overall logarithmic *across* the whole
  tree because each node holds so few keys relative to the tree's total
  size.
- `if (i < node->keys.size() && node->keys[i] == key) return true;` —
  **(c) already basic.**
- `if (node->leaf) return false;` — **(b) hard concept reappearing**:
  the same base-case pattern as `find_by_title` returning `None` in
  Project 2, Lesson 6 — reaching a leaf with no match means the key
  genuinely isn't present.
- `int height(BTreeNode* node) { if (node == nullptr || node->leaf) return 1; return 1 + height(node->children[0]); }`
  — **(a) first appearance,** specific to a B-Tree: unlike the plain
  BST's `height`, which had to check *both* children (since either
  branch could be deeper), a B-Tree only needs to check *one* child —
  proven, not just assumed, that every leaf sits at exactly the same
  depth, a real, structural guarantee this lesson's splitting logic
  provides.

### CS lens

Nothing new beyond what the previous unit already established — this
unit's real content is the measurement, not a new idea.

### SE lens

Proven directly, side by side, both structures built from the *identical*
1000 sorted keys that produced the BST's degenerate height:

```
Inserted 1000 sorted keys into a B-Tree (min degree 2).
Tree height: 9
search(500): 1
search(999): 1
search(1500): 0
```

**Height 9, not 1000** — the same 1000 keys, the same sorted insertion
order that broke the plain BST completely, producing a tree only 9
levels deep. And, scaled up and timed for real, against 50,000 keys and
20,000 real searches each:

```
50000 sorted keys inserted into each structure.
Degenerate BST: 20000 searches in 2052ms (20000 found)
B-Tree:         20000 searches in 1ms (20000 found)
```

**2052 milliseconds versus 1 millisecond** — over two thousand times
faster, on the exact same data, finding the exact same keys, correctly,
every time. This is the real, measured version of the guarantee this
entire lesson has been building toward: not a theoretical `O(log n)`
claim taken on faith, but a structural property — no node ever
overflows without splitting first — proven, at real scale, against the
precise input that breaks the naive alternative.

### Commands needed

`g++ -O2 -o <output> <file>.cpp`, same as Lesson 25's own timing
measurements.

### Run it

Both shown above.

### Connecting sentence

Every idea in this lesson closes into one proof: a node shape that
splits before overflowing guarantees every leaf sits at the same depth,
and that guarantee is worth over two thousand times the search speed,
measured, on exactly the input that would otherwise defeat it.

---

## Closing

**Connect the pieces.** One key, through the whole lesson: inserting
`999` as the thousandth sequential key first checks whether the current
root is full — if so, splits it, growing the tree's height by exactly
one level uniformly, before ever touching `999` itself; `insertNonFull`
then descends, splitting any *other* full node it encounters along the
way down, guaranteeing `999` always lands in a node with room; and a
later `search(999)` retraces a similarly short path — height 9, not
1000 — because every leaf, by the same splitting guarantee, sits at
that same shallow depth, proven directly by `height()` only ever
needing to check one child.

**What breaks without this.** Already shown, twice, at two different
scales: the height-1000 degenerate BST, and the 2052-millisecond search
cost it produced. Deliberately not restaged — both were real,
measured consequences of the exact same realistic input, sorted data,
run directly against the structure that has no defense against it.

**Exercises.**
1. Insert 1000 keys in *random* order (not sorted) into the plain BST
   from this lesson's first unit, and measure its height. Confirm it's
   much closer to `log₂(1000) ≈ 10` than to 1000 — proving the BST's
   problem is specifically about input order, not binary trees in
   general.
2. Add a `count()` method to `BTree` that returns the total number of
   keys stored, by recursively summing `node->keys.size()` across every
   node — confirm it returns exactly 1000 after this lesson's own
   insertion sequence.
3. This lesson's B-Tree has no `delete` operation. Research (without
   necessarily implementing) what makes B-Tree deletion harder than
   insertion — specifically, what has to happen when removing a key
   would leave a node with fewer than `T - 1` keys — and write a few
   sentences explaining the core difficulty in your own words.

**Definition of done.**
- [ ] You've measured a real, degenerate BST — height equal to node
      count — from realistic sorted input.
- [ ] The real `BTree` class correctly inserts and searches, including
      splitting nodes on overflow, confirmed against real output for
      both present and absent keys.
- [ ] You've measured the B-Tree's height on the identical sorted input
      that degenerated the BST, and confirmed it stays small — 9, not
      1000.
- [ ] You've measured real search time for both structures at scale,
      and can state the actual, real speedup factor from your own
      output.
- [ ] Commit with a message explaining why — e.g. `"Replace linear scan
      and a naive BST, both proven to degrade badly, with a real
      B-Tree that splits full nodes preemptively, keeping every leaf
      at the same depth"` — not `"add B-Tree"`.

**Next lesson** stays in Project 9: parsing a real, minimal SQL-like
query language — the Storage Engine finally meets a real
`Text → Lexer → Parser → AST` pipeline, this curriculum's own
long-referenced multi-stage structure, built for real for the first
time.
