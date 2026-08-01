# CPP DSA — LAB-12 — Binary Trees

**Prerequisites:** LAB-11 (Recursion and the Call Stack)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What makes a tree "binary" specifically — what's the one structural rule?
2. Why is a tree's recursive structure ("a node, with two smaller trees as children") a natural match for LAB-11's recursive functions?
3. What's the difference between what in-order, pre-order, and post-order traversal each visit *first* — the node itself, or its children?

## What You Will Build

A generic `BinaryTree<T>` with a visualized ASCII-art print of its shape, plus all three classic recursive traversals (in-order, pre-order, post-order) run on the same tree, showing how the exact same shape produces three genuinely different visit orders depending purely on *when* each traversal visits the current node relative to its children.

```
$ ./tree_demo
Tree shape:
        4
       / \
      2   6
     / \ / \
    1  3 5  7

In-order:   1 2 3 4 5 6 7   (sorted! -- a property specific to THIS tree's arrangement)
Pre-order:  4 2 1 3 6 5 7
Post-order: 1 3 2 5 7 6 4
```

## Concept: Trees Are Recursive Structures — And So Are the Functions That Walk Them

**What it is:** A binary tree node holds a value and up to two children: `left` and `right` — "binary" meaning at most two, never more. The recursive insight: a binary tree *is*, structurally, a node plus two smaller binary trees (its left and right subtrees, each of which is itself either empty or another node with its own two subtrees). This self-similar definition is exactly why LAB-11's recursive functions are the natural tool for working with trees — a function that processes "a tree" naturally reduces to "process this node, then process its left subtree (a smaller tree), then process its right subtree (another smaller tree)."

**The problem before:** Every structure so far in this series — `MyVector`, `MyLinkedList` — has been fundamentally *linear*: one element leads to exactly one next element. Some real data is naturally *hierarchical* instead — a filesystem's folders and subfolders, an expression's nested sub-expressions (LAB-11 in the SE Masterclass series built exactly this kind of tree for arithmetic), a decision process with branching outcomes. Forcing hierarchical data into a linear structure loses the branching relationships entirely.

**The solution:** A node with two child pointers (`left`, `right`) instead of one (`next`). Walking the whole tree means recursively walking `left`, then doing something with the current node, then recursively walking `right` (or some other ordering — that's exactly what the three traversal orders below vary). The base case for every tree-walking recursive function is the same: an empty subtree (a `nullptr` child) does nothing and returns immediately, exactly mirroring LAB-11's "base case stops the recursion" lesson.

**Canonical example:**

```cpp
template<typename T>
struct TreeNode {
    T value;
    TreeNode* left;
    TreeNode* right;
    TreeNode(T v) : value(v), left(nullptr), right(nullptr) {}
};

template<typename T>
void inOrder(TreeNode<T>* node) {
    if (node == nullptr) return; // base case
    inOrder(node->left);
    std::cout << node->value << " ";
    inOrder(node->right);
}
```

**Project Application:** LAB-13's binary *search* tree adds exactly one rule (left subtree values are smaller, right subtree values are larger) on top of this lab's plain binary tree, turning these same traversal techniques into a way to retrieve values in sorted order — this lab's "In-order: sorted!" observation in "What You Will Build" is not a coincidence; LAB-13 explains precisely why.

**Watch for:** Forgetting the `if (node == nullptr) return;` base case at the top of *every* tree-recursive function. Without it, walking off the bottom of the tree (past a leaf node's `nullptr` children) dereferences a null pointer — the exact same crash LAB-07 warned about for linked lists, just one level more places it can hide, since a tree has two child pointers to forget checking instead of one.

## Step 1: `TreeNode` and building a tree by hand

```cpp
// BinaryTree.h
#ifndef BINARY_TREE_H
#define BINARY_TREE_H

#include <iostream>

template<typename T>
struct TreeNode {
    T value;
    TreeNode* left;
    TreeNode* right;
    TreeNode(T v) : value(v), left(nullptr), right(nullptr) {}
};
```

```cpp
// Building the exact tree shown in "What You Will Build," by hand, node by node:
TreeNode<int>* root = new TreeNode<int>(4);
root->left = new TreeNode<int>(2);
root->right = new TreeNode<int>(6);
root->left->left = new TreeNode<int>(1);
root->left->right = new TreeNode<int>(3);
root->right->left = new TreeNode<int>(5);
root->right->right = new TreeNode<int>(7);
```

Building a tree by directly wiring up `left`/`right` pointers, one at a time, is deliberately tedious here — it's meant to make the tree's actual pointer structure completely concrete before any traversal function touches it, the same "see the raw structure first" discipline LAB-07 used for its chain of `next` pointers.

### SAVE AND TRY

After building this tree, directly access `root->left->right->value` and confirm it's `3` — manually walking two hops (`left`, then `right`) from the root without using any traversal function yet, to build intuition for what "the tree" actually *is* as nested pointers before any recursive algorithm walks it for you.

## Step 2: In-order traversal — left, node, right

```cpp
template<typename T>
void inOrder(TreeNode<T>* node) {
    if (node == nullptr) return; // base case: empty subtree, nothing to do
    inOrder(node->left);          // 1. recurse LEFT first
    std::cout << node->value << " "; // 2. THEN visit this node
    inOrder(node->right);         // 3. recurse RIGHT last
}
```

The order of these three lines — recurse left, visit, recurse right — is the entire definition of "in-order." Tracing through the example tree: `inOrder(root)` first fully recurses into `root->left` (the `2` subtree) before printing `4` at all, and that recursive call itself fully recurses into *its* left (`1`) before printing `2` — the deepest-left node ends up being the very first thing printed, which is exactly why the output for this particular tree comes out sorted (`1 2 3 4 5 6 7`): each smaller value happens to live to the left of each larger one in this specific arrangement.

### SAVE AND TRY

```cpp
std::cout << "In-order: ";
inOrder(root);
std::cout << "\n";
```

Confirm this prints `1 2 3 4 5 6 7`. Then, before reading further, predict by hand what pre-order (visit node, then left, then right) would print for the same tree — write your prediction down before Step 3 confirms or corrects it.

## Step 3: Pre-order and post-order — same recursion, different placement of "visit"

```cpp
template<typename T>
void preOrder(TreeNode<T>* node) {
    if (node == nullptr) return;
    std::cout << node->value << " "; // visit FIRST
    preOrder(node->left);
    preOrder(node->right);
}

template<typename T>
void postOrder(TreeNode<T>* node) {
    if (node == nullptr) return;
    postOrder(node->left);
    postOrder(node->right);
    std::cout << node->value << " "; // visit LAST
}
```

All three traversals (`inOrder`, `preOrder`, `postOrder`) are structurally identical — same base case, same two recursive calls — differing *only* in where the "visit this node" line sits relative to the two recursive calls. This is worth sitting with directly: three meaningfully different algorithms, differing by only the position of one line, because that position determines exactly *when*, relative to a node's children, that node's own value gets processed.

### SAVE AND TRY

```cpp
std::cout << "Pre-order:  "; preOrder(root); std::cout << "\n";
std::cout << "Post-order: "; postOrder(root); std::cout << "\n";
```

Confirm pre-order prints `4 2 1 3 6 5 7` (compare against your Step 2 prediction) and post-order prints `1 3 2 5 7 6 4`. Notice pre-order's first-printed value is always the root (`4`) — the node is visited *before* either child is explored — while post-order's *last*-printed value is always the root — visited only after both children are completely finished.

## Step 4: Height and node count — recursion computing a value, not just printing

```cpp
template<typename T>
int height(TreeNode<T>* node) {
    if (node == nullptr) return -1; // an empty tree has height -1, by convention (a single leaf node has height 0)
    int leftHeight = height(node->left);
    int rightHeight = height(node->right);
    return 1 + std::max(leftHeight, rightHeight);
}

template<typename T>
int countNodes(TreeNode<T>* node) {
    if (node == nullptr) return 0;
    return 1 + countNodes(node->left) + countNodes(node->right);
}
```

Both functions follow the exact same shape as the traversals — base case for an empty subtree, recurse into both children — but instead of printing, they *combine* the two recursive results (`std::max` for height, addition for count) into a single returned value. This is a direct answer to a common beginner confusion: recursion isn't only for "do something to every node," it's equally natural for "compute one aggregate value *from* every node," which is precisely the shape LAB-13's BST search and LAB-14's hash table resizing will both need later.

### SAVE AND TRY

```cpp
std::cout << "Height: " << height(root) << "\n";      // 2 (root -> child -> leaf is 2 levels down)
std::cout << "Node count: " << countNodes(root) << "\n"; // 7
```

Verify `countNodes` by counting the nodes in the ASCII diagram from "What You Will Build" by eye — confirm your manual count matches the function's returned value exactly.

## 🎯 Challenge

Write a recursive `bool contains(TreeNode<T>* node, T target)` that searches the *entire* tree (checking every node — this is a plain binary tree with no ordering rule yet, unlike LAB-13's BST, so there's no shortcut; every node must potentially be checked).

<details>
<summary>Solution</summary>

```cpp
template<typename T>
bool contains(TreeNode<T>* node, T target) {
    if (node == nullptr) return false; // base case: ran off the tree, not found

    if (node->value == target) return true;

    return contains(node->left, target) || contains(node->right, target);
}
```

```cpp
std::cout << (contains(root, 5) ? "found" : "not found") << "\n"; // found
std::cout << (contains(root, 99) ? "found" : "not found") << "\n"; // not found
```

The `||` (logical OR) is doing real work here: `contains` returns `true` the moment *either* the left subtree *or* the right subtree reports finding the target — and because `||` short-circuits (LAB-83's Nano interpreter, in the SE Masterclass series, built exactly this behavior by hand), if `contains(node->left, target)` already returns `true`, the right subtree is never even searched at all, an automatic small efficiency gain from the language's own evaluation rules.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| A binary tree | Some special built-in structure | A node with up to 2 children — itself a smaller tree per child |
| Base case for tree recursion | Reaching a leaf node | Reaching PAST a leaf — a `nullptr` child — that's when recursion actually stops |
| In/pre/post-order | Three unrelated algorithms | The identical recursive skeleton, "visit" moved to a different position |
| Recursion on trees | Only useful for printing/visiting | Equally natural for computing aggregate values (height, count, search) |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `inOrder` visit the deepest-left node before anything else in the tree? | |
| 2 | Why does `height(nullptr)` return `-1` instead of `0`? | |
| 3 | Why can `contains` skip searching the right subtree once the left subtree already returns `true`? | |

## Quick Check Answers

1. At most two children per node — `left` and `right`, never more — is the entire structural rule; a general "tree" can have any number of children per node, but "binary" specifically caps it at two.
2. Because a tree is recursively defined as a node with two subtrees, each of which is itself either empty or another node with its own two subtrees — this self-similarity is exactly the "smaller version of the same problem" shape LAB-11 established as the requirement for a natural recursive solution.
3. In-order visits the node strictly between recursing left and recursing right; pre-order visits the node before either recursive call; post-order visits the node after both recursive calls — same recursive skeleton in all three, differing only in when, relative to the two recursive calls, the "visit" step happens.

*Next: [LAB-13 — Binary Search Trees](CPP-S02-LAB-13-BINARY-SEARCH-TREES.md)*
