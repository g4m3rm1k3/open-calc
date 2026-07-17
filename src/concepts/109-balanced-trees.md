---
concept: 109-balanced-trees
name: Balanced Trees
---

## Definition

A balanced tree is a binary search tree that automatically restructures
itself during insertion and deletion to keep its height close to log(n),
guaranteeing O(log n) operations even in the worst case — instead of the
plain O(n) worst case a naively-built BST can degrade to.

## Problem

A plain BST can become lopsided — effectively a linked list — if data is
inserted in an unlucky order, like already-sorted data, degrading every
operation to O(n). A balanced tree actively rebalances itself after every
insertion or deletion, so its height never grows beyond O(log n),
regardless of insertion order.

## Execution

Insert 1, 2, 3 in that already-sorted order into a plain BST
↓
Plain BST: 1 → 2 → 3, a straight lopsided line (height 3, same as a linked list)
↓
Insert the SAME 1, 2, 3 into a self-balancing tree
↓
After inserting 3, the tree detects it's become unbalanced (a straight
line) and performs a ROTATION
↓
Result: 2 becomes the root, with 1 and 3 as its two children — height 2, not 3 — balanced

## Computer Science

Self-balancing trees (AVL trees, Red-Black trees) each define their own
precise balance condition — AVL: the heights of any node's two subtrees
differ by at most 1; Red-Black: a set of coloring rules that bound the
longest path to at most twice the shortest — and restore that condition
via **rotations**, local restructurings that fix the balance in O(log n)
time without needing to rebuild the whole tree.

Tags: AVL trees, Red-Black trees, Rotations, Balance invariant

## Software Engineering

Red-Black trees are what many language standard libraries actually use for
ordered map/set types (Java's TreeMap, C++'s std::map) — they rebalance
less aggressively than AVL trees, trading slightly taller trees for faster
average-case updates, which is usually the better trade-off for
general-purpose library use.

Tags: Standard library implementations, AVL vs Red-Black tradeoffs, TreeMap

## Common Mistakes

- Assuming EVERY binary search tree automatically has O(log n) guarantees — only a genuinely self-balancing variant provides that guarantee; a plain BST doesn't rebalance itself at all.
- Underestimating how much extra bookkeeping self-balancing requires (tracking heights or colors, performing rotations) compared to a plain BST — this complexity is exactly the cost being paid for the worst-case guarantee.

## Exercises

- Insert 1, 2, 3, 4, 5 in sorted order into a plain BST and observe how lopsided it becomes; conceptually compare that shape to what a balanced tree would look like with the same data.
- Look up the specific rotation that would fix a 3-node straight-line BST into a balanced shape, and confirm it matches the example below.

## javascript

```javascript
// A minimal AVL-style single rotation, applied to a 3-node straight line.
class TreeNode {
  constructor(value) { this.value = value; this.left = null; this.right = null }
}

// Before rotation: 1 -> 2 -> 3 (as right children), a straight lopsided line
let root = new TreeNode(1)
root.right = new TreeNode(2)
root.right.right = new TreeNode(3)

function leftRotate(node) {
  const newRoot = node.right
  node.right = newRoot.left
  newRoot.left = node
  return newRoot
}

root = leftRotate(root)   // rebalances the 3-node line into a proper shape

console.log(root.value)         // 2 — now the root
console.log(root.left.value)    // 1
console.log(root.right.value)   // 3
```
Walkthrough: before the rotation, the tree is a straight line (1 → 2 → 3),
height 3. `leftRotate` restructures it so `2` becomes the new root with
`1` and `3` as its two direct children — height 2, matching what a
self-balancing tree would automatically do after detecting this
unbalanced shape.

## python

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


# Before rotation: 1 -> 2 -> 3 (as right children), a straight lopsided line
root = TreeNode(1)
root.right = TreeNode(2)
root.right.right = TreeNode(3)


def left_rotate(node):
    new_root = node.right
    node.right = new_root.left
    new_root.left = node
    return new_root


root = left_rotate(root)   # rebalances the 3-node line into a proper shape

print(root.value)          # 2 -- now the root
print(root.left.value)     # 1
print(root.right.value)    # 3
```
Walkthrough: identical rotation mechanics as the JavaScript version — the
straight 3-node line becomes a balanced shape with `2` at the root, exactly
what a self-balancing tree's rebalancing step accomplishes automatically
after every insertion that would otherwise unbalance it.
