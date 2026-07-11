---
series: dsa-python
level: 9
title: Trees
lang: python
---

# Trees

A tree is a linked structure where each node has a value and zero or more children.
Unlike a linked list (each node has exactly one next), tree nodes branch. Binary trees
are the most common variant: each node has at most two children, called `left` and
`right`. Trees model hierarchical data — file systems, HTML DOM, expression parsing,
decision logic, and sorted collections. Every tree algorithm is a traversal with a
purpose.

## Tree Nodes and Traversal

A binary tree node is like a linked list node with two pointers instead of one.
The tree is represented by a reference to the root node. To process the whole tree,
traverse it — visit every node in some order.

```python
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Build tree:
#       1
#      / \
#     2   3
#    / \
#   4   5
root = TreeNode(1,
    TreeNode(2, TreeNode(4), TreeNode(5)),
    TreeNode(3))
```

**CS lens:** A tree with n nodes has exactly n − 1 edges. There is exactly one path
between any two nodes. Contrast with a graph, which may have cycles and multiple paths.
Every linked list is a degenerate tree (each node has at most one child). Every tree
algorithm can be implemented recursively because a tree is a recursive structure: a
tree is either empty or a root node plus zero or more subtrees.

**SE lens:** `TreeNode` follows the same minimal pattern as `Node` in Level 5: just the
value and the structural pointers. The tree is the root reference plus the recursive
structure. There is no wrapper class. The same design governs trees in Python's `ast`
module, React's virtual DOM, and every JSON parser.

Depth-first traversal visits each node by recursing into children before or after
processing the current node. The three orders — pre-order, in-order, post-order —
differ only in when the current node's value is recorded.

```python
def inorder(root):
    # left → root → right  (produces sorted order for binary search trees)
    if root is None:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def preorder(root):
    # root → left → right  (useful for copying trees, expression evaluation)
    if root is None:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)

root = TreeNode(1,
    TreeNode(2, TreeNode(4), TreeNode(5)),
    TreeNode(3))

print(inorder(root))   # [4, 2, 5, 1, 3]
print(preorder(root))  # [1, 2, 4, 5, 3]
```

## Challenge: tree sum

Write `tree_sum(root)` that returns the sum of all values in the binary tree.
Return 0 for an empty tree (`root` is `None`). The `TreeNode` class is already defined.

```challenge
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def tree_sum(root):
    pass
```

```test
assert tree_sum(None) == 0
assert tree_sum(TreeNode(5)) == 5
assert tree_sum(TreeNode(1, TreeNode(2), TreeNode(3))) == 6
assert tree_sum(TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))) == 15
assert tree_sum(TreeNode(-1, TreeNode(1), None)) == 0
```

## Tree Height and Level-Order Traversal

The height of a tree is the number of edges on the longest path from the root to a
leaf. An empty tree has height -1; a single node has height 0; a tree with one child
has height 1. Height is a structural property: computed recursively as
`1 + max(height(left), height(right))`.

```python
def tree_height(root):
    if root is None:
        return -1
    left_height = tree_height(root.left)
    right_height = tree_height(root.right)
    return 1 + max(left_height, right_height)

root = TreeNode(1,
    TreeNode(2, TreeNode(4), TreeNode(5)),
    TreeNode(3))
print(tree_height(root))   # 2  (root → 2 → 4, two edges)
print(tree_height(TreeNode(1)))  # 0  (single node, zero edges)
```

**CS lens:** The recursive structure matches the definition: `height(tree) = -1` if
empty, else `1 + max(height(left_subtree), height(right_subtree))`. Each node is
visited once — O(n) time. The call stack depth is O(h) where h is the height —
O(log n) for balanced trees, O(n) for degenerate (all-left or all-right) trees.

**SE lens:** `max(left_height, right_height)` makes both recursive calls before
comparing them. This is post-order traversal: children are fully processed before
the parent uses their results. Any time a node needs information from its children
to compute its own result, post-order is the right traversal order.

Level-order traversal visits nodes level by level — all nodes at depth 0, then depth 1,
then depth 2. This requires a queue (Level 4), not a call stack, because BFS is
inherently iterative.

```python
from collections import deque

def level_order(root):
    if root is None:
        return []
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result

root = TreeNode(1,
    TreeNode(2, TreeNode(4), TreeNode(5)),
    TreeNode(3))
print(level_order(root))  # [1, 2, 3, 4, 5]  — breadth-first order
```

## Challenge: tree height

Write `tree_height(root)` that returns the height of the binary tree. An empty tree
has height `-1`. A single node has height `0`. Height is the number of edges on the
longest root-to-leaf path.

```challenge
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def tree_height(root):
    pass
```

```test
assert tree_height(None) == -1
assert tree_height(TreeNode(1)) == 0
assert tree_height(TreeNode(1, TreeNode(2), None)) == 1
assert tree_height(TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))) == 2
assert tree_height(TreeNode(1, TreeNode(2, TreeNode(3, TreeNode(4), None), None), None)) == 3
```
