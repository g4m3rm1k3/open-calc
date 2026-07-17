---
concept: 104-binary-search-tree
name: Binary Search Tree
---

## Definition

A binary search tree (BST) is a binary tree that maintains an ordering
invariant at every node — everything in its left subtree is smaller,
everything in its right subtree is larger — which makes search, insert, and
delete all achievable in O(log n) on a balanced tree, instead of O(n).

## Problem

Searching a plain unordered structure requires checking every element,
O(n). A BST's ordering invariant means that at every node, comparing the
target against that node's value tells you which subtree (if either) could
possibly contain it, letting search skip an entire half of the remaining
tree with each comparison — the same halving idea as binary search on a
sorted array, but on a tree instead.

## Execution

Insert 5, 3, 8, 1, 4 one at a time into an empty tree
↓
insert(5) into an empty tree → 5 becomes the root
↓
insert(3): 3 < 5 → becomes 5's left child
↓
insert(8): 8 > 5 → becomes 5's right child
↓
insert(1): 1 < 5 → left; 1 < 3 → becomes 3's left child
↓
insert(4): 4 < 5 → left; 4 > 3 → becomes 3's right child
↓
search(4): 4 < 5 → go left to 3; 4 > 3 → go right to 4; found — 2 comparisons, not 5

## Computer Science

The ordering invariant — left < node < right, recursively, at every node —
is what makes O(log n) search possible on a balanced tree: each comparison
eliminates an entire subtree from consideration, the same
halving-the-search-space idea as Binary Search, but the "array" here is a
tree shape instead of a contiguous block of memory. Without maintaining
this invariant carefully during insertion, the tree can degrade toward a
plain linked list — and O(n) operations — in the worst case.

Tags: Ordering invariant, Logarithmic time, Balanced trees, Worst-case degeneration

## Software Engineering

A naively-built BST can degrade to O(n) operations if data is inserted in
a bad order — already-sorted data produces a completely lopsided tree,
effectively a linked list. This is exactly why self-balancing variants
(AVL trees, Red-Black trees) exist: they perform extra rebalancing work on
insert/delete specifically to guarantee the tree never degenerates, keeping
operations at O(log n) even in the worst case.

Tags: Self-balancing trees, AVL trees, Red-Black trees, Worst-case guarantees

## Common Mistakes

- Inserting already-sorted data into a plain (non-self-balancing) BST and expecting O(log n) performance — this produces a completely lopsided tree, degrading every operation to O(n).
- Forgetting the ordering invariant must hold at EVERY node, not just the root — a node's left child must be smaller than that node specifically, not just smaller than the overall tree's root.

## Exercises

- Insert the values 1, 2, 3, 4, 5 in that already-sorted order into an empty BST, and observe how lopsided the resulting tree becomes.
- Trace how many comparisons `search()` takes to find `4` versus `8` in the example tree.

## javascript

```javascript
class TreeNode {
  constructor(value) { this.value = value; this.left = null; this.right = null }
}

function insert(node, value) {
  if (!node) return new TreeNode(value)
  if (value < node.value) node.left = insert(node.left, value)
  else node.right = insert(node.right, value)
  return node
}

function search(node, target) {
  if (!node) return false
  if (node.value === target) return true
  return target < node.value ? search(node.left, target) : search(node.right, target)
}

let root = null
for (const v of [5, 3, 8, 1, 4]) root = insert(root, v)

console.log(search(root, 4))    // true
console.log(search(root, 6))    // false
```
Walkthrough: `insert` places each new value by comparing it down the tree
— smaller goes left, larger goes right — maintaining the ordering
invariant as the tree grows. `search` exploits that same invariant: at
each node, comparing the target tells you which single subtree could
possibly contain it, letting search skip the other subtree entirely.

## python

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


def insert(node, value):
    if node is None:
        return TreeNode(value)
    if value < node.value:
        node.left = insert(node.left, value)
    else:
        node.right = insert(node.right, value)
    return node


def search(node, target):
    if node is None:
        return False
    if node.value == target:
        return True
    return search(node.left, target) if target < node.value else search(node.right, target)


root = None
for v in [5, 3, 8, 1, 4]:
    root = insert(root, v)

print(search(root, 4))   # True
print(search(root, 6))   # False
```
Walkthrough: identical ordering-invariant mechanics as the JavaScript
version — `insert` and `search` both navigate left/right based on the same
comparison, exploiting the fact that everything in a node's left subtree is
guaranteed smaller and everything in its right subtree is guaranteed
larger.
