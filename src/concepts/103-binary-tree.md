---
concept: 103-binary-tree
name: Binary Tree
---

## Definition

A binary tree is a hierarchical structure where each node has at most two
children, conventionally called left and right — the general shape
underlying binary search trees, heaps, and expression trees, before any
ordering rule is added.

## Problem

Some data is naturally hierarchical rather than linear — an expression like
`(2+3)*4`, a decision process with two branches at each step — and doesn't
fit cleanly into a flat array or linked list. A binary tree gives each node
exactly two potential branches to represent that structure directly.

## Execution

Build a small tree: 1 with children 2 and 3; 2 has a left child 4
↓
Preorder (node, left, right): 1, 2, 4, 3
↓
Inorder (left, node, right): 4, 2, 1, 3
↓
Postorder (left, right, node): 4, 2, 3, 1

## Computer Science

The three traversal orders differ only in WHEN the current node's own
value is visited relative to its two subtrees — this ordering choice
matters a great deal for what the traversal is useful for: inorder on a
binary *search* tree specifically produces sorted order, preorder is the
natural way to reconstruct or copy a tree's structure, and postorder is the
natural order for safely deleting a tree bottom-up.

Tags: Tree traversal, Preorder, Inorder, Postorder, Recursion

## Software Engineering

Binary trees underlie many higher-level structures — binary search trees,
heaps, and expression parsing (each node is an operator, its two children
are the operands). Recognizing "this is fundamentally a binary tree" is
often the first step toward picking the right specialized variant for a
given problem.

Tags: Binary search trees, Heaps, Expression trees, Recursive structure

## Common Mistakes

- Assuming ANY binary tree is automatically searchable in O(log n) — that guarantee only holds for a binary search tree specifically, which maintains an ordering invariant; a plain binary tree has no such guarantee.
- Writing a traversal without a proper base case (checking for a null node) — the same recursion pitfall as any other recursive structure, causing a crash instead of a clean stop at the leaves.

## Exercises

- Build the example tree by hand and trace all three traversal orders yourself before running the code.
- Add a right child under node `2`, and re-run all three traversals to see how the output changes.

## javascript

```javascript
class TreeNode {
  constructor(value, left = null, right = null) {
    this.value = value; this.left = left; this.right = right
  }
}

const tree = new TreeNode(1, new TreeNode(2, new TreeNode(4)), new TreeNode(3))

function preorder(node, result = []) {
  if (!node) return result
  result.push(node.value)
  preorder(node.left, result)
  preorder(node.right, result)
  return result
}
function inorder(node, result = []) {
  if (!node) return result
  inorder(node.left, result)
  result.push(node.value)
  inorder(node.right, result)
  return result
}

console.log(preorder(tree))   // [ 1, 2, 4, 3 ]
console.log(inorder(tree))    // [ 4, 2, 1, 3 ]
```
Walkthrough: `preorder` visits a node's own value BEFORE recursing into its
children, so the root (`1`) appears first. `inorder` visits the left
subtree, then the node, then the right subtree — for this particular
(non-search) tree the output isn't sorted, since there's no ordering
invariant here yet; that only comes with a Binary Search Tree.

## python

```python
class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


tree = TreeNode(1, TreeNode(2, TreeNode(4)), TreeNode(3))


def preorder(node, result=None):
    if result is None:
        result = []
    if node is None:
        return result
    result.append(node.value)
    preorder(node.left, result)
    preorder(node.right, result)
    return result


def inorder(node, result=None):
    if result is None:
        result = []
    if node is None:
        return result
    inorder(node.left, result)
    result.append(node.value)
    inorder(node.right, result)
    return result


print(preorder(tree))   # [1, 2, 4, 3]
print(inorder(tree))    # [4, 2, 1, 3]
```
Walkthrough: identical traversal mechanics as the JavaScript version — the
only difference between preorder/inorder/postorder is exactly when each
node's own value is appended relative to recursing into its children.
