# FOUNDATIONS — LAB-029 — Trees and Binary Search Trees

**Series:** FOUNDATIONS — Part V: Data Structures
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 60–75 minutes.

---

## What You Will Build

A binary search tree (BST) with insert and search, in-order traversal that produces sorted output, and a demonstration of how sorted insertion degrades the tree to O(n). After this lab you will understand why balanced BSTs underlie every sorted collection (JavaScript's `Map`, Java's `TreeMap`, C++'s `std::set`) and why the balanced variant exists.

---

## What You Need to Know First

**From LAB-028 (Linked Lists):** A node holds a value and a pointer to the next node. A BST node holds a value and pointers to two children instead of one.

**From LAB-008 (Recursion):** Tree traversal is the canonical recursive algorithm. The tree structure and recursive calls mirror each other exactly.

**From LAB-005 (Big-O):** O(log n) — the number of times you can halve n before reaching 1. That is the height of a balanced tree with n nodes.

---

> **Quick Check — try to answer before reading:**
>
> 1. A balanced BST has 1,000,000 nodes. How many comparisons does a search need in the worst case?
> 2. What ordering property does every node in a BST maintain?
> 3. If you insert the numbers 1, 2, 3, 4, 5 in order into a BST, what shape does the tree have?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — Tree Terminology and the BST Property

**The problem this step solves:** Before writing code, understand the vocabulary and the invariant that makes a BST useful.

A **tree** is a hierarchical data structure made of nodes. Each node has zero or more **children**. The node at the top with no parent is the **root**. A node with no children is a **leaf**. Every non-root node has exactly one **parent**.

A **binary tree** restricts each node to at most two children: a **left child** and a **right child**.

A **binary search tree** adds the ordering invariant:

> For every node N:
> - every value in N's **left subtree** is **less than** N's value
> - every value in N's **right subtree** is **greater than** N's value

This invariant makes search O(log n) in a balanced tree: at each node, you eliminate half the remaining candidates by going left or right.

**The height of a tree** is the length of the longest path from root to leaf. A balanced tree of n nodes has height approximately log₂(n). An unbalanced tree can have height n (a straight chain, equivalent to a linked list).

---

### Step 2 — The BST Node

**The code:**

```js
class BSTNode {
  constructor(value) {
    this.value = value;
    this.left  = null;
    this.right = null;
  }
}
```

**The walkthrough:** A BST node has two child pointers instead of the one in a singly linked list node. `null` means "no child in this direction." The value is the key used for comparisons.

---

### Step 3 — Insert

**The problem this step solves:** Add a value to the BST while maintaining the ordering invariant.

**The code:**

```js
class BinarySearchTree {
  #root = null;
  #size = 0;

  insert(value) {
    const newNode = new BSTNode(value);
    if (this.#root === null) {
      this.#root = newNode;
    } else {
      this.#insertNode(this.#root, newNode);
    }
    this.#size++;
    return this;
  }

  #insertNode(currentNode, newNode) {
    if (newNode.value < currentNode.value) {
      // Belongs in left subtree
      if (currentNode.left === null) {
        currentNode.left = newNode;    // found the empty slot
      } else {
        this.#insertNode(currentNode.left, newNode);   // recurse left
      }
    } else if (newNode.value > currentNode.value) {
      // Belongs in right subtree
      if (currentNode.right === null) {
        currentNode.right = newNode;
      } else {
        this.#insertNode(currentNode.right, newNode);  // recurse right
      }
    }
    // Equal values are ignored (no duplicates in this implementation)
  }

  get size() { return this.#size; }
}
```

**The walkthrough — inserting 50, 30, 70, 20, 40:**

`insert(50)`: root is null → root = node(50).

`insert(30)`:
- Start at root (50). 30 < 50 → go left.
- root.left is null → place 30 there.

`insert(70)`:
- Start at root (50). 70 > 50 → go right.
- root.right is null → place 70 there.

`insert(20)`:
- Start at root (50). 20 < 50 → go left to node(30).
- 20 < 30 → go left. node(30).left is null → place 20 there.

`insert(40)`:
- Start at root (50). 40 < 50 → go left to node(30).
- 40 > 30 → go right. node(30).right is null → place 40 there.

Tree:
```
        50
       /  \
      30   70
     /  \
    20   40
```

**The CS lens — recursive structure:** The tree is recursively defined: a BST is either empty, or a node whose left subtree is a BST with all values less than the node, and whose right subtree is a BST with all values greater. The recursive definition maps directly to the recursive code.

**The SE lens — private method:** `#insertNode` is private. External callers call `insert(value)`; the private method handles the recursive descent. This is the facade pattern at the method level — a clean public API hiding recursive complexity.

---

### Step 4 — Search

**The problem this step solves:** Determine whether a value exists in the BST, in O(log n) time on a balanced tree.

**The code:**

```js
// Add to BinarySearchTree:
contains(value) {
  return this.#searchNode(this.#root, value);
}

#searchNode(currentNode, target) {
  if (currentNode === null) return false;          // fell off the tree — not found
  if (target === currentNode.value) return true;   // found it
  if (target < currentNode.value) {
    return this.#searchNode(currentNode.left, target);   // search left
  }
  return this.#searchNode(currentNode.right, target);    // search right
}
```

**The walkthrough — searching for 40 in the tree above:**

1. `currentNode = root (50)`. 40 ≠ 50. 40 < 50 → go left.
2. `currentNode = node(30)`. 40 ≠ 30. 40 > 30 → go right.
3. `currentNode = node(40)`. 40 === 40 → return `true`.

Two comparisons eliminated half the remaining candidates. On a balanced tree of n nodes, at most log₂(n) comparisons are needed.

**Searching for 35:**

1. `currentNode = 50`. 35 < 50 → left.
2. `currentNode = 30`. 35 > 30 → right.
3. `currentNode = 40`. 35 < 40 → left.
4. `currentNode = null` → return `false`.

Each step eliminates one branch of the tree. Not found in log₂(5) ≈ 2.3, so at most 3 comparisons for this tree.

---

### Step 5 — In-Order Traversal: The Sorting Property

**The problem this step solves:** Retrieve all values from the BST in sorted (ascending) order.

**The code:**

```js
// Add to BinarySearchTree:
inOrder() {
  const sortedValues = [];
  this.#inOrderTraverse(this.#root, sortedValues);
  return sortedValues;
}

#inOrderTraverse(currentNode, accumulator) {
  if (currentNode === null) return;                         // base case
  this.#inOrderTraverse(currentNode.left, accumulator);    // left subtree first
  accumulator.push(currentNode.value);                     // then this node
  this.#inOrderTraverse(currentNode.right, accumulator);   // then right subtree
}
```

**The walkthrough on the tree `[50, 30, 70, 20, 40]`:**

Call `inOrderTraverse(50)`:
→ Call `inOrderTraverse(30)`:
  → Call `inOrderTraverse(20)`:
    → Call `inOrderTraverse(null)` — base case, return.
    → Push **20**.
    → Call `inOrderTraverse(null)` — base case, return.
  → Push **30**.
  → Call `inOrderTraverse(40)`:
    → Call `inOrderTraverse(null)` — return.
    → Push **40**.
    → Call `inOrderTraverse(null)` — return.
→ Push **50**.
→ Call `inOrderTraverse(70)`:
  → Call `inOrderTraverse(null)` — return.
  → Push **70**.
  → Call `inOrderTraverse(null)` — return.

Result: `[20, 30, 40, 50, 70]` — **sorted ascending**. ✓

**The CS lens — in-order = sorted:** The BST invariant guarantees this. Every node's left subtree is smaller, so processing left-then-node-then-right recursively visits every node in ascending order. This is the same principle that makes merge sort O(n log n) — you sort left, sort right, then merge.

**Other traversal orders:**
- **Pre-order** (node, left, right): used to copy a tree or produce prefix notation.
- **Post-order** (left, right, node): used to delete a tree or produce postfix notation.
- **Level-order** (breadth-first, using a queue): visits nodes layer by layer.

---

### Step 6 — The Degenerate Case

**The problem this step demonstrates:** What happens when values are inserted in sorted order.

**The code:**

```js
const degenerateTree = new BinarySearchTree();
[1, 2, 3, 4, 5, 6, 7].forEach(n => degenerateTree.insert(n));

// Every value is greater than the previous, so every insertion goes right:
//
// 1
//  \
//   2
//    \
//     3
//      \
//       4  ... and so on
//
// Height = n-1. Search is O(n), not O(log n).
// This is a linked list wearing a BST costume.
```

**The walkthrough:** `insert(1)` → root. `insert(2)`: 2 > 1, go right. Right is null, place 2. `insert(3)`: 3 > 1, go right (2). 3 > 2, go right. Place 3. Every insertion goes right, making a straight chain. The BST invariant is maintained, but height is n−1 instead of log₂(n).

**The CS lens — balanced vs degenerate:** The O(log n) guarantee only holds for a *balanced* tree. A degenerate BST degrades to O(n) search and insert — identical to a linked list. Self-balancing BSTs (AVL trees, Red-Black trees) automatically rebalance after each insertion to maintain O(log n). These are what power JavaScript's `Map` and `Set` in V8's implementation (though V8 actually uses hash tables — Java's `TreeMap` uses Red-Black trees).

**The SE lens — real-world consequence:** Inserting pre-sorted data into a naive BST is a common bug. A database that builds a BST index on an auto-increment primary key will produce a degenerate tree unless it uses a self-balancing variant.

**Try it:**

```js
const tree = new BinarySearchTree();
[50, 30, 70, 20, 40, 60, 80].forEach(n => tree.insert(n));
console.log(tree.inOrder());     // [20, 30, 40, 50, 60, 70, 80]
console.log(tree.contains(40));  // true
console.log(tree.contains(45));  // false
console.log(tree.size);          // 7
```

---

## Connect the Pieces

- **JavaScript's `Map` and `Set`** use hash tables (LAB-025) for O(1) average access. Java's `TreeMap` and `TreeSet` use Red-Black trees (a balanced BST) for O(log n) access with sorted iteration — use them when you need sorted traversal.
- **Database B-trees:** Database indexes use B-trees (a generalization of BSTs where each node has many children). This keeps the tree shallow enough to minimize disk reads. LAB-115 covers this in the database context.
- **The file system** on most operating systems stores directory entries in a B-tree, not a flat list.
- **The `Array.prototype.sort` comparison** that you write in JavaScript is the comparator used internally — the same role as the `<` comparison in `#insertNode`.

---

## What Breaks Without This

**Missing base case in traversal:**

```js
#inOrderTraverse(currentNode, accumulator) {
  // BUG: no null check
  this.#inOrderTraverse(currentNode.left, accumulator);  // crashes when currentNode is null
  accumulator.push(currentNode.value);
  this.#inOrderTraverse(currentNode.right, accumulator);
}
```

`currentNode.left` throws `TypeError: Cannot read properties of null (reading 'left')`. Every recursive tree algorithm needs a base case for `null` — the leaves of the tree have null children, and the recursion must stop there.

---

## Definition of Done

- [ ] `insert` five values, `inOrder()` returns them sorted ascending
- [ ] `contains` returns `true` for an inserted value and `false` for a missing value
- [ ] Inserting `[1, 2, 3, 4, 5]` in order still produces sorted output from `inOrder()` (though the tree is degenerate)
- [ ] You can explain why a degenerate BST's search is O(n), not O(log n)

**Git commit:**

```
git add src/
git commit -m "LAB-029: BST with insert, search, and in-order traversal — sorted output proves the ordering invariant; degenerate case motivates balanced trees"
```

---

## Quick Check Answers

1. **~20 comparisons.** log₂(1,000,000) ≈ 20. Each comparison halves the search space. After 20 halvings, at most 1 candidate remains.
2. **For every node N:** all values in its left subtree are less than N.value, and all values in its right subtree are greater than N.value.
3. **A straight right chain (degenerate tree, height 4).** Each insertion is greater than the previous, so every node goes into the right child of the last node. The result is indistinguishable from a linked list in terms of search performance.
