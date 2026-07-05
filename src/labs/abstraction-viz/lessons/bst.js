export default {
  id: 'bst',
  title: 'Binary Search Tree',
  tag: 'Data Structure',
  steps: [
    {
      title: 'Node — the building block',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.left  = null
    this.right = null
  }
}

const root = new Node(50)
console.log(root.value)
console.log(root.left)
console.log(root.right)`,
      explanation: [
        'A `Node` holds a `value` and two child pointers: `left` and `right`, both starting as `null`. Line 10 prints `50`. Lines 11–12 print `null`. The single node is a complete tree of size 1 — the root with no children. Every BST is built by connecting Node instances through their `left` and `right` pointers.',
        'CS — A binary tree is a graph where each node has at most two children, called left and right. A Binary Search Tree (BST) adds the ordering invariant: every value in the left subtree is less than the node\'s value; every value in the right subtree is greater. This invariant makes search `O(log n)` on a balanced tree — halving the search space at each step.',
        'SE — Trees appear throughout software: the DOM is an `n`-ary tree (each node can have many children). A file system is a tree (directories contain files and subdirectories). JSON is a tree. TypeScript\'s Abstract Syntax Tree (AST) is a tree of `Node` objects. Webpack and Rollup traverse the import/export AST to build the dependency tree. BSTs specifically power database indexes and sorted sets.',
        'Without this: without the `left`/`right` pointers, a node has nowhere to attach children. The entire tree structure is encoded in these two references — `null` means "no child here." The BST works because every recursive operation makes one binary decision at each node: go left or go right.',
      ],
      active: [
        { startLine: 1,  endLine: 7,  color: 'indigo',  label: 'Node — value + left + right pointers' },
        { startLine: 9,  endLine: 12, color: 'emerald', label: 'root node: 50, left: null, right: null' },
      ],
      connections: [],
    },
    {
      title: 'BST class and insert()',
      code:
`class Node {
  constructor(value) {
    this.value = value
    this.left  = null
    this.right = null
  }
}

class BST {
  constructor() {
    this.root = null
  }

  insert(value) {
    const node = new Node(value)
    if (this.root === null) {
      this.root = node
      return this
    }
    let current = this.root
    while (true) {
      if (value < current.value) {
        if (current.left === null) { current.left = node; return this }
        current = current.left
      } else {
        if (current.right === null) { current.right = node; return this }
        current = current.right
      }
    }
  }
}

const bst = new BST()
bst.insert(50).insert(30).insert(70).insert(20).insert(40)
console.log(bst.root.value)
console.log(bst.root.left.value)
console.log(bst.root.right.value)
console.log(bst.root.left.left.value)
console.log(bst.root.left.right.value)`,
      explanation: [
        '`insert(value)` walks the tree: if `value < current.value`, go left; otherwise go right. When a `null` slot is found, place the new node there. After inserting 50, 30, 70, 20, 40: root is 50, root.left is 30, root.right is 70, root.left.left is 20, root.left.right is 40. Lines 35–39 print `50`, `30`, `70`, `20`, `40`. The BST invariant holds at every node.',
        'CS — Insert is `O(h)` where `h` is the tree height. For a balanced BST, `h = log₂(n)` — inserting into 1,000 nodes takes at most 10 comparisons. For a degenerate tree (inserting values in sorted order: 1, 2, 3, 4...), `h = n` — insert degrades to `O(n)`, identical to a linked list. Self-balancing BSTs (AVL tree, Red-Black tree) maintain `O(log n)` by rotating nodes on insert.',
        'SE — Database B-trees (B+ trees) generalise the BST for disk storage — each node holds many keys to maximise use of a disk block. MySQL\'s InnoDB and PostgreSQL use B+ trees for indexes. Redis\'s sorted sets use a skip list (probabilistic BST alternative). MongoDB\'s indexes use B-trees. Every `CREATE INDEX` creates a BST-family structure that makes `WHERE column = value` go from `O(n)` scan to `O(log n)` lookup.',
        'Without this: without the BST ordering invariant, finding a value in a tree requires visiting every node — `O(n)`. The invariant (left < node < right) is what makes binary search possible: at each node, you eliminate half the remaining tree. Maintaining the invariant on insert is the price that makes all subsequent searches fast.',
      ],
      active: [
        { startLine: 14, endLine: 29, color: 'violet',  label: 'insert — walk down, place at first null slot' },
        { startLine: 33, endLine: 39, color: 'emerald', label: 'tree shape: 50 root, 30/70 children, 20/40 grandchildren' },
      ],
      connections: [
        { fromLine: 22, toLine: 23, color: 'violet',  label: 'value < current → go left' },
        { fromLine: 25, toLine: 26, color: 'indigo',  label: 'value >= current → go right' },
      ],
    },
    {
      title: 'search() — find a value',
      code:
`class Node {
  constructor(value) {
    this.value = value; this.left = null; this.right = null
  }
}

class BST {
  constructor() { this.root = null }

  insert(value) {
    const node = new Node(value)
    if (this.root === null) { this.root = node; return this }
    let current = this.root
    while (true) {
      if (value < current.value) {
        if (current.left  === null) { current.left  = node; return this }
        current = current.left
      } else {
        if (current.right === null) { current.right = node; return this }
        current = current.right
      }
    }
  }

  search(value) {
    let current = this.root
    while (current !== null) {
      if (value === current.value) return current
      current = value < current.value ? current.left : current.right
    }
    return null
  }
}

const bst = new BST()
bst.insert(50).insert(30).insert(70).insert(20).insert(40)
console.log(bst.root.value)
console.log(bst.root.left.value)
console.log(bst.root.right.value)
console.log(bst.root.left.left.value)
console.log(bst.root.left.right.value)

console.log(bst.search(40) !== null)
console.log(bst.search(40).value)
console.log(bst.search(99) === null)`,
      explanation: [
        '`search(value)` starts at `root` and at each node compares `value` to `current.value`: if equal, return the node; if less, go left; if greater, go right. `search(40)` path: 50 (go left) → 30 (go right) → 40 (found). Line 43 prints `true` (node found). Line 44 prints `40`. `search(99)`: 50 → 70 → null (not found). Line 45 prints `true` (result is `null`).',
        'CS — Search visits at most `h` nodes — one per level of the tree. For a balanced tree of 1,000 nodes (`h ≈ 10`), search takes at most 10 comparisons. Compare to a linear array: finding 40 in `[20, 30, 40, 50, 70]` with `indexOf` requires scanning until the match — `O(n)` worst case. The BST\'s ordering invariant converts linear scan to binary search.',
        'SE — Database index lookup is BST search. `SELECT * FROM users WHERE id = 42` on a B-tree indexed column does exactly this walk: compare 42 to the root page\'s keys, decide which child page to follow, repeat. Without the index, the database scans all rows. The index makes it `O(log n)`. PostgreSQL\'s `EXPLAIN` output shows "Index Scan" vs. "Seq Scan" — BST search vs. linear scan.',
        'Without this: without the BST invariant, search requires checking every node — `O(n)`. The invariant is what makes the decision at each node unambiguous: go left or right, never both. If the invariant were violated (e.g., 60 stored in the left subtree of 50), search would follow the wrong path and report "not found" for a value that exists.',
      ],
      active: [
        { startLine: 25, endLine: 32, color: 'violet',  label: 'search — binary decision at each node, O(log n)' },
        { startLine: 43, endLine: 45, color: 'emerald', label: 'found 40, found 40.value, 99 not found → null' },
      ],
      connections: [{ fromLine: 29, toLine: 29, color: 'violet', label: 'ternary: < current → left, else → right' }],
    },
    {
      title: 'In-order traversal — values in sorted order',
      code:
`class Node {
  constructor(value) { this.value = value; this.left = null; this.right = null }
}

class BST {
  constructor() { this.root = null }

  insert(value) {
    const node = new Node(value)
    if (this.root === null) { this.root = node; return this }
    let cur = this.root
    while (true) {
      if (value < cur.value) {
        if (cur.left  === null) { cur.left  = node; return this }
        cur = cur.left
      } else {
        if (cur.right === null) { cur.right = node; return this }
        cur = cur.right
      }
    }
  }

  search(value) {
    let cur = this.root
    while (cur !== null) {
      if (value === cur.value) return cur
      cur = value < cur.value ? cur.left : cur.right
    }
    return null
  }

  inOrder(node, result) {
    if (node === null) return
    this.inOrder(node.left, result)
    result.push(node.value)
    this.inOrder(node.right, result)
  }

  toArray() {
    const result = []
    this.inOrder(this.root, result)
    return result
  }
}

const bst = new BST()
bst.insert(50).insert(30).insert(70).insert(20).insert(40).insert(60).insert(80)
console.log(bst.root.value)
console.log(bst.search(40).value)
console.log(bst.search(99) === null)
console.log(bst.toArray())`,
      explanation: [
        '`inOrder(node, result)` is a recursive depth-first traversal: visit left subtree → push current value → visit right subtree. For the BST with 50, 30, 70, 20, 40, 60, 80 inserted: left subtree of 50 is 20, 30, 40 (in order); current is 50; right subtree is 60, 70, 80. Line 53 prints `[20, 30, 40, 50, 60, 70, 80]` — sorted ascending. In-order traversal of a BST always produces sorted output.',
        'CS — In-order traversal visits nodes in the sequence: left → root → right. This is a depth-first traversal. The three DFS traversal orders for a BST are: pre-order (root → left → right, useful for serialising a tree), in-order (left → root → right, produces sorted order), post-order (left → right → root, useful for deletion). Breadth-first traversal processes nodes level by level.',
        'SE — In-order traversal is used to: enumerate all keys in a sorted dictionary (B-tree database index range scan — `BETWEEN` query traverses the index in-order), merge two sorted arrays from BSTs in `O(n+m)`, and flatten a BST to a sorted array for binary search. Git\'s object model is a Merkle tree traversed in pre-order when computing diffs.',
        'Without this: without in-order traversal, extracting a sorted sequence from a BST requires extracting all values and sorting them — `O(n log n)`. In-order traversal exploits the BST invariant to produce sorted output in `O(n)` — the sorting is implicit in the tree structure. The traversal IS the sort.',
      ],
      active: [
        { startLine: 32, endLine: 37, color: 'violet',  label: 'inOrder — left → push → right (recursive DFS)' },
        { startLine: 48, endLine: 53, color: 'emerald', label: 'toArray → [20,30,40,50,60,70,80] sorted!' },
      ],
      connections: [
        { fromLine: 34, toLine: 33, color: 'violet',  label: 'recurse left first' },
        { fromLine: 36, toLine: 33, color: 'indigo',  label: 'then recurse right' },
      ],
    },
    {
      title: 'min(), max() and height()',
      code:
`class Node {
  constructor(value) { this.value = value; this.left = null; this.right = null }
}

class BST {
  constructor() { this.root = null }

  insert(value) {
    const node = new Node(value)
    if (!this.root) { this.root = node; return this }
    let cur = this.root
    while (true) {
      if (value < cur.value) {
        if (!cur.left)  { cur.left  = node; return this } cur = cur.left
      } else {
        if (!cur.right) { cur.right = node; return this } cur = cur.right
      }
    }
  }

  search(value) {
    let cur = this.root
    while (cur) { if (value === cur.value) return cur; cur = value < cur.value ? cur.left : cur.right }
    return null
  }

  inOrder(node, result) {
    if (!node) return
    this.inOrder(node.left, result); result.push(node.value); this.inOrder(node.right, result)
  }

  toArray() { const r = []; this.inOrder(this.root, r); return r }

  min() {
    let cur = this.root
    while (cur.left !== null) cur = cur.left
    return cur.value
  }

  max() {
    let cur = this.root
    while (cur.right !== null) cur = cur.right
    return cur.value
  }

  height(node) {
    if (node === null) return -1
    return 1 + Math.max(this.height(node.left), this.height(node.right))
  }
}

const bst = new BST()
bst.insert(50).insert(30).insert(70).insert(20).insert(40).insert(60).insert(80)
console.log(bst.toArray())
console.log(bst.min())
console.log(bst.max())
console.log(bst.height(bst.root))`,
      explanation: [
        '`min()` walks leftward until `left === null` — the leftmost node is always the smallest. `max()` walks rightward — the rightmost node is always the largest. `height(node)` recursively computes the longest path to a leaf: `-1` for null, `1 + max(leftHeight, rightHeight)` for a node. Line 53 prints `[20,30,40,50,60,70,80]`. Line 54 prints `20`. Line 55 prints `80`. Line 56 prints `2` (the tree has 4 levels: root at 0, nodes at 1, leaves at 2 → height = 2).',
        'CS — Min and max are `O(h)` — walk one direction to the bottom. Height is `O(n)` — must visit every node to find the deepest leaf. A perfectly balanced BST of 7 nodes (like ours: 50 at root, 30/70 as children, 20/40/60/80 as grandchildren) has height 2. Inserting 7 sorted values (1,2,3,4,5,6,7) would produce a degenerate tree of height 6 — a right-leaning chain.',
        'SE — `min()` and `max()` directly implement database `SELECT MIN()` and `SELECT MAX()` on indexed columns — follow the leftmost or rightmost B-tree path. Height is used by AVL and Red-Black tree rebalancing algorithms: if `|height(left) - height(right)| > 1`, the tree is unbalanced and rotation is needed. PostgreSQL and MySQL check balance factors during index maintenance.',
        'Without this: without following the ordering invariant, finding min would require visiting all `n` nodes. The BST stores the minimum at the bottom-left by construction — the invariant encodes the sort order structurally. Min and max "for free" are a direct payoff of maintaining the BST invariant on every insert.',
      ],
      active: [
        { startLine: 33, endLine: 43, color: 'violet',  label: 'min → leftmost, max → rightmost, O(h)' },
        { startLine: 45, endLine: 48, color: 'indigo',  label: 'height — recursive DFS, O(n)' },
        { startLine: 52, endLine: 56, color: 'emerald', label: 'sorted array, min=20, max=80, height=2' },
      ],
      connections: [],
    },
  ],
}
