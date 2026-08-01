# CPP DSA — LAB-13 — Binary Search Trees

**Prerequisites:** LAB-12 (Binary Trees)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What single rule turns a plain binary tree (LAB-12) into a binary *search* tree?
2. Why does searching a balanced BST take O(log n) instead of O(n)?
3. What does "unbalanced" mean for a BST, and what's the worst possible shape one could take?

## What You Will Build

`BST<T>` with `insert`, `search`, and `remove` (the hardest of the three — removing a node with two children is the one genuinely tricky case), plus a deliberate demonstration of what happens when you insert already-sorted data: the exact "danger" of an unbalanced tree this lab's concept section warns about, made visible.

```
$ ./bst_demo
Inserting: 5, 3, 8, 1, 4, 7, 9
Tree shape:
        5
       / \
      3   8
     / \ / \
    1  4 7  9

search(7): FOUND (2 comparisons: 5 -> 8 -> 7)
search(6): NOT FOUND (3 comparisons: 5 -> 8 -> 7, then nullptr)

--- DANGER: inserting already-sorted data ---
Inserting: 1, 2, 3, 4, 5 (sorted order)
Tree shape:
1
 \
  2
   \
    3
     \
      4
       \
        5
search(5) in this tree: 5 comparisons -- degraded to O(n), same as a linked list!
```

## Concept: The BST Invariant — Left Is Smaller, Right Is Larger, Always

**What it is:** A binary search tree adds exactly one rule on top of LAB-12's plain binary tree: for *every* node, every value in its left subtree is smaller than the node's own value, and every value in its right subtree is larger. This single rule — called the **BST invariant** — is what makes `search` fast: at each node, comparing the target against the current node's value tells you *which entire subtree* to explore next, letting you discard the other subtree completely, without ever looking inside it.

**The problem before:** LAB-12's `contains` had to potentially check *every* node — no ordering rule meant no way to know which subtree might contain the target, so both had to be searched. That's O(n), no better than a linear scan of `MyVector`. For a tree structure to actually be *worth* its extra complexity over a flat array, it needs to enable something an array can't do as well — and a correctly-shaped BST search is exactly that: O(log n), because each comparison eliminates roughly half of the remaining nodes from consideration, the same halving idea LAB-16 will show for binary search on a sorted array.

**The solution:** Maintain the BST invariant on every `insert` — new values are placed by walking down from the root, going left whenever the new value is smaller than the current node, right whenever it's larger, until an empty spot (a `nullptr` child) is found. `search` uses the identical walking logic to decide, at each step, which single subtree could possibly contain the target — never needing to check both. The catch, demonstrated directly in this lab's "danger" section: if data is inserted in already-sorted order, every new value is larger (or smaller) than everything already in the tree, so every insertion goes the *same* direction every time, producing a tree that's really just a disguised linked list — and search on it degrades all the way back to O(n), the exact problem the tree was supposed to solve.

**Canonical example:**

```cpp
template<typename T>
TreeNode<T>* insert(TreeNode<T>* node, T value) {
    if (node == nullptr) return new TreeNode<T>(value); // base case: found the empty spot
    if (value < node->value) node->left = insert(node->left, value);
    else if (value > node->value) node->right = insert(node->right, value);
    return node; // unchanged subtree pointer for the caller to reattach
}
```

**Project Application:** LAB-14's hash table is, in a real sense, the answer to this lab's exact "unbalanced BST" danger — a well-designed hash table gives average O(1) lookup *regardless* of insertion order, sidestepping the ordering-sensitivity a BST has entirely, at the cost of losing the BST's naturally sorted traversal order (LAB-12's in-order traversal on a BST visits every value in sorted order — a property a hash table cannot offer).

**Watch for:** Assuming a BST's search is *always* O(log n). It's only O(log n) for a *balanced* tree — one whose left and right subtrees stay roughly equal in size/depth at every node. Real-world data is often inserted in an order that's accidentally sorted or near-sorted (timestamps, sequential IDs, alphabetically-processed input) — exactly the scenario that degrades a plain BST to O(n), which is why production systems use *self-balancing* variants (AVL trees, red-black trees) that this series doesn't build but is worth knowing exist specifically to prevent this degradation.

## Step 1: `insert` — walking down, maintaining the invariant

```cpp
// BST.h
#ifndef BST_H
#define BST_H

#include "BinaryTree.h" // reuses TreeNode<T> from LAB-12 directly

template<typename T>
class BST {
private:
    TreeNode<T>* root;

    TreeNode<T>* insertHelper(TreeNode<T>* node, T value) {
        if (node == nullptr) return new TreeNode<T>(value); // base case
        if (value < node->value) {
            node->left = insertHelper(node->left, value);
        } else if (value > node->value) {
            node->right = insertHelper(node->right, value);
        }
        // if value == node->value, do nothing -- no duplicates in this implementation
        return node;
    }

public:
    BST() : root(nullptr) {}

    void insert(T value) {
        root = insertHelper(root, value);
    }
};

#endif
```

`insertHelper` returns `TreeNode<T>*` and every recursive call does `node->left = insertHelper(node->left, value);` — reassigning the child pointer to whatever the recursive call returns, even on the way *back up* the recursion, not just at the bottom. This matters specifically for the base case: when `insertHelper` is called with `node == nullptr` (an empty spot was found), it returns a brand-new node — and that new node only actually gets attached to the tree because the *caller* one level up assigns it: `node->left = insertHelper(node->left, value);` is what wires the newly created node into its parent's `left` field.

### SAVE AND TRY

```cpp
BST<int> tree;
for (int v : {5, 3, 8, 1, 4, 7, 9}) {
    tree.insert(v);
}
```

Add a temporary `printTree` method (reuse LAB-12's `inOrder` as a starting point, or write an indented recursive printer) and confirm the resulting shape matches "What You Will Build"'s diagram — every left child smaller than its parent, every right child larger, at every single node in the tree, not just the root.

## Step 2: `search` — using the invariant to skip half the tree at every step

```cpp
template<typename T>
class BST {
    // ...continued from Step 1...
private:
    bool searchHelper(TreeNode<T>* node, T target, int& comparisons) {
        if (node == nullptr) return false; // base case: ran off the tree, not found
        comparisons++;

        if (target == node->value) return true;
        if (target < node->value) return searchHelper(node->left, target, comparisons);
        return searchHelper(node->right, target, comparisons);
    }

public:
    bool search(T target) {
        int comparisons = 0;
        bool found = searchHelper(root, target, comparisons);
        std::cout << "search(" << target << "): " << (found ? "FOUND" : "NOT FOUND")
                   << " (" << comparisons << " comparisons)\n";
        return found;
    }
};
```

At each node, exactly *one* of the three branches runs — `target == node->value` (found), or a recursive call into *either* `left` or `right`, never both. This is the direct payoff of the BST invariant: unlike LAB-12's plain-tree `contains`, which had to check both subtrees because it had no information about which one might contain the target, `searchHelper` here uses the comparison result itself to eliminate an entire subtree from consideration without ever looking inside it. The `int& comparisons` reference parameter (LAB-10's Challenge pattern, reused) counts exactly how many nodes were actually visited, making the O(log n) claim directly measurable rather than just asserted.

### SAVE AND TRY

Run `tree.search(7)` and `tree.search(6)` on the tree from Step 1, and compare the printed comparison counts against "What You Will Build"'s trace at the top of this lab. For a 7-node balanced tree, no search should ever need more than 3 comparisons (`log2(7) ≈ 2.8`, rounded up) — confirm this holds for several different search targets, including ones not in the tree at all.

## Step 3: The danger — inserting sorted data, and watching search degrade

```cpp
BST<int> sortedTree;
for (int v : {1, 2, 3, 4, 5}) {
    sortedTree.insert(v);
}
sortedTree.search(5);
```

Trace through by hand: inserting `1` makes it the root. Inserting `2` — `2 > 1`, so it becomes `1`'s *right* child. Inserting `3` — `3 > 1`, go right to `2`; `3 > 2`, so it becomes `2`'s right child. Every single subsequent insertion goes right, and right again, and right again — because the data arrives in an order where every new value is larger than everything already in the tree. The resulting structure has *no* left children anywhere at all — it's a tree in name and type only; structurally, it's identical to a singly linked list, with `right` playing the exact role `next` played in LAB-07.

### SAVE AND TRY

Run the search-comparison-counting version of `search` (Step 2) on `sortedTree.search(5)` and confirm it takes exactly `5` comparisons — not `~3` like the balanced tree from Step 1/2 with the same number of nodes. This is the concrete, measured proof of this lab's central warning: the *same* BST class, the *same* number of elements, but O(n) instead of O(log n) purely because of insertion order — nothing about the `BST` class itself changed between the two demonstrations.

## Step 4: `remove` — the genuinely tricky case

```cpp
template<typename T>
class BST {
    // ...continued...
private:
    TreeNode<T>* findMin(TreeNode<T>* node) {
        while (node->left != nullptr) node = node->left; // leftmost node = smallest value
        return node;
    }

    TreeNode<T>* removeHelper(TreeNode<T>* node, T value) {
        if (node == nullptr) return nullptr; // not found, nothing to remove

        if (value < node->value) {
            node->left = removeHelper(node->left, value);
        } else if (value > node->value) {
            node->right = removeHelper(node->right, value);
        } else {
            // FOUND the node to remove -- now handle its 3 possible shapes:
            if (node->left == nullptr) {          // case 1: no left child (0 or 1 children)
                TreeNode<T>* rightChild = node->right;
                delete node;
                return rightChild;
            } else if (node->right == nullptr) {   // case 2: no right child
                TreeNode<T>* leftChild = node->left;
                delete node;
                return leftChild;
            } else {                                // case 3: TWO children -- the hard case
                TreeNode<T>* successor = findMin(node->right); // smallest value in the right subtree
                node->value = successor->value;                 // copy successor's value into this node
                node->right = removeHelper(node->right, successor->value); // then remove the successor's OLD position
            }
        }
        return node;
    }

public:
    void remove(T value) { root = removeHelper(root, value); }
};
```

Case 3 (two children) is the genuinely hard one: you can't just delete a node with two children — what would its children's parent become? The standard trick: find the node's **in-order successor** — the smallest value in its *right* subtree (found by walking as far left as possible from `node->right`, exactly `findMin`) — copy that successor's value into the node being "removed" (so the node keeps its position in the tree, just with a new value), and then recursively remove the successor from its *original* location, which is guaranteed to be an easy case (a successor found via `findMin` can never have a left child, by definition of being the leftmost node reached).

### SAVE AND TRY

Build the balanced tree from Step 1 (`5, 3, 8, 1, 4, 7, 9`), call `remove(3)` (a two-children case: `3`'s children are `1` and `4`), then print the tree (reusing your Step 1 printer). Confirm the BST invariant still holds everywhere afterward (every left smaller, every right larger) — the clearest sign the two-children removal logic worked correctly, not just that the program didn't crash.

## 🎯 Challenge

Write a `bool isValidBST(TreeNode<T>* node)` function that checks whether a given tree actually satisfies the BST invariant everywhere — not just "is `node->left->value < node->value`" at each node individually (which is *not* sufficient — a node could satisfy that locally while still violating the invariant against an ancestor further up), but genuinely correct for the whole tree. Hint: pass down a valid `(min, max)` range each recursive call must stay within.

<details>
<summary>Solution</summary>

```cpp
#include <limits>

template<typename T>
bool isValidBSTHelper(TreeNode<T>* node, T minVal, T maxVal) {
    if (node == nullptr) return true; // an empty subtree is trivially valid

    if (node->value <= minVal || node->value >= maxVal) return false;

    return isValidBSTHelper(node->left, minVal, node->value) &&
           isValidBSTHelper(node->right, node->value, maxVal);
}

template<typename T>
bool isValidBST(TreeNode<T>* node) {
    return isValidBSTHelper(node, std::numeric_limits<T>::min(), std::numeric_limits<T>::max());
}
```

The key insight the hint points at: a node's value must be within a valid *range* that narrows as you go deeper — not just "less than my immediate parent," but "less than every ancestor whose right subtree I'm inside of, and greater than every ancestor whose left subtree I'm inside of." Passing `(minVal, maxVal)` down and narrowing it on each recursive call (`node->value` becomes the new `maxVal` going left, the new `minVal` going right) enforces the *global* invariant correctly, catching subtle violations a naive "just check the immediate parent" version would miss entirely.

</details>

## Mental Model

| Concept | Plain binary tree (LAB-12) | Binary search tree (this lab) |
|---|---|---|
| Ordering rule | None | Left < node < right, at every single node |
| `search` | O(n) — must check every node | O(log n) IF balanced |
| Insert order matters? | N/A — no search speed to protect | Yes — sorted-order insertion degrades to O(n) |
| Removing a node with 2 children | N/A (LAB-12 never removed nodes) | Replace with in-order successor, then remove successor's old spot |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `search` only need to recurse into ONE subtree at each node, unlike LAB-12's `contains`? | |
| 2 | Why does inserting already-sorted data produce a tree shaped like a linked list? | |
| 3 | Why must a two-children removal copy the SUCCESSOR's value in, rather than just deleting the node directly? | |

## Quick Check Answers

1. Every value in a node's left subtree must be smaller than the node's own value, and every value in its right subtree must be larger — this single ordering rule, maintained on every insertion, is what LAB-12's plain binary tree lacked entirely.
2. Because at each node, comparing the target against that node's value immediately tells you which single subtree (left or right) could possibly contain it — the other subtree is guaranteed, by the invariant, not to contain the target, so it can be skipped without ever being examined, roughly halving the remaining search space at each step.
3. It means the tree's shape has become severely lopsided — every node has a child on only one side, with nothing on the other — the worst possible case being a tree that's structurally a straight line, identical in shape (and search performance) to a linked list, entirely defeating the O(log n) benefit a balanced tree provides.

*Next: [LAB-14 — Hash Tables From Scratch](CPP-S02-LAB-14-HASH-TABLES.md)*
