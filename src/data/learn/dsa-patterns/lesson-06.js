// DSA + Design Patterns — Lesson 06
// Binary Trees and the Composite Pattern

export const lesson = {
  id: 'dsa-patterns-06',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '6. Binary Trees and the Composite Pattern',
  checkpoints: [
    { id: 'cp-tree',      label: 'Tree Structure' },
    { id: 'cp-bst',       label: 'Binary Search Tree' },
    { id: 'cp-composite', label: 'Composite Pattern' },
  ],
  segments: [

    // ── Introduction ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'intro',
      text: 'A tree is a data structure that organises items hierarchically — one item at the top, branching downward. Every item in a tree is called a node. The topmost node is the root. Nodes below a node are its children. A node above is the parent. A node with no children is a leaf. Unlike arrays and linked lists where items form a single chain, trees branch. A file system is a tree: a folder can contain other folders and files. An organisation chart is a tree. HTML is a tree. JSON is a tree. Once you see trees, you see them everywhere.',
      code: null,
    },

    // ── Step 1: TreeNode ──────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step1-node',
      text: 'A binary tree is a tree where each node has at most two children, called left and right. Start with the node factory. A node holds a value and two child references — left and right — both starting as null. When left and right are null, the node is a leaf. This is identical in spirit to the linked list node from lesson 2, but with two next pointers instead of one.',
      code: `// A binary tree node — value plus two child references
function createTreeNode(value) {
  return {
    value,
    left:  null,   // left child (null = no child)
    right: null,   // right child
  }
}

const root  = createTreeNode(10)
const left  = createTreeNode(5)
const right = createTreeNode(15)

// Connect them manually — root is the parent of both
root.left  = left
root.right = right

console.log('root:',       root.value)
console.log('root.left:',  root.left.value)
console.log('root.right:', root.right.value)
console.log('left.left:',  left.left)    // null — left is a leaf`,
    },

    // ── Step 2: Tree traversal ────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step2-traversal',
      text: 'To visit every node in a tree, we need traversal. There are three standard orders. In-order: left subtree, then current node, then right subtree. Pre-order: current node first, then left, then right. Post-order: left, right, then current last. Each is a natural fit for different jobs: in-order on a binary search tree gives sorted output (you will see why in a moment). Pre-order is used for copying a tree. Post-order for deleting a tree or computing directory sizes. All three use recursion — the definition of "visit left subtree" is itself a traversal.',
      code: `function createTreeNode(value) {
  return { value, left: null, right: null }
}

// Three traversal orders — all recursive
function inOrder(node) {
  if (node === null) return   // base case: empty subtree
  inOrder(node.left)
  console.log(node.value)
  inOrder(node.right)
}

function preOrder(node) {
  if (node === null) return
  console.log(node.value)
  preOrder(node.left)
  preOrder(node.right)
}

function postOrder(node) {
  if (node === null) return
  postOrder(node.left)
  postOrder(node.right)
  console.log(node.value)
}

//        10
//       /  \\
//      5    15
//     / \\
//    3   7

const root = createTreeNode(10)
root.left  = createTreeNode(5)
root.right = createTreeNode(15)
root.left.left  = createTreeNode(3)
root.left.right = createTreeNode(7)

console.log('in-order (left → root → right):')
inOrder(root)      // 3 5 7 10 15

console.log('pre-order (root → left → right):')
preOrder(root)     // 10 5 3 7 15

console.log('post-order (left → right → root):')
postOrder(root)    // 3 7 5 15 10`,
    },

    {
      type: 'challenge',
      id: 'ch-tree',
      text: 'Write a countNodes(node) function that recursively counts every node in a tree. Build a tree with 7 nodes (root 1, children 2 and 3, each with two children). Log the count. Expected: 7.',
      expectedOutput: '7',
      startCode: `function createTreeNode(value) {
  return { value, left: null, right: null }
}

function countNodes(node) {
  // base case: null means no node here
  // recursive case: 1 + count left + count right
}

const root = createTreeNode(1)
root.left  = createTreeNode(2)
root.right = createTreeNode(3)
root.left.left   = createTreeNode(4)
root.left.right  = createTreeNode(5)
root.right.left  = createTreeNode(6)
root.right.right = createTreeNode(7)

console.log(countNodes(root))   // 7`,
      hint: 'if (node === null) return 0. return 1 + countNodes(node.left) + countNodes(node.right).',
      validate: ({ logs }) => logs.some(l => String(l).trim() === '7'),
    },

    { type: 'checkpoint', id: 'cp-tree' },

    // ── Step 3: BST property ──────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step3-bst-property',
      text: 'A Binary Search Tree (BST) is a binary tree with one additional rule: for every node, all values in its left subtree are less than the node\'s value, and all values in its right subtree are greater. This ordering property is what makes search fast. When you search for a value, at each node you know immediately which half of the tree to go into — just like binary search on a sorted array. A balanced BST of n nodes has O(log n) search, insert, and delete.',
      code: `// The BST property — left < node < right at every level
function createTreeNode(value) {
  return { value, left: null, right: null }
}

//        8
//       / \\
//      3   10
//     / \\    \\
//    1   6    14
//       / \\
//      4   7

const root = createTreeNode(8)
root.left  = createTreeNode(3)
root.right = createTreeNode(10)
root.left.left   = createTreeNode(1)
root.left.right  = createTreeNode(6)
root.left.right.left  = createTreeNode(4)
root.left.right.right = createTreeNode(7)
root.right.right = createTreeNode(14)

// In-order traversal of a BST always gives sorted output
function inOrder(node) {
  if (node === null) return
  inOrder(node.left)
  console.log(node.value)
}

// Verify BST property: every left child < parent, every right child > parent
console.log('root:', root.value)           // 8
console.log('root.left:', root.left.value) // 3 — less than 8 ✓
console.log('root.right:', root.right.value) // 10 — greater than 8 ✓`,
    },

    // ── Step 4: BST insert ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step4-insert',
      text: 'BST insert follows the property: compare the value to insert with the current node. If smaller, go left. If larger, go right. Keep going until you reach null — that is where the new node belongs. Use recursion: insert into the left subtree returns the updated left subtree; the current node then points to it. This style of "return the updated subtree" is a common recursive tree pattern.',
      code: `function createTreeNode(value) {
  return { value, left: null, right: null }
}

// Recursive insert — returns the (possibly new) root of the subtree
function insert(node, value) {
  // Base case: empty spot found — create the node here
  if (node === null) return createTreeNode(value)

  if (value < node.value) {
    node.left  = insert(node.left,  value)   // go left
  } else if (value > node.value) {
    node.right = insert(node.right, value)   // go right
  }
  // If value === node.value: duplicate, ignore

  return node   // return the (unchanged) current node
}

function inOrder(node, result = []) {
  if (!node) return result
  inOrder(node.left, result)
  result.push(node.value)
  inOrder(node.right, result)
  return result
}

let root = null
for (const v of [8, 3, 10, 1, 6, 14, 4, 7]) {
  root = insert(root, v)
}

console.log('sorted:', inOrder(root))   // [1, 3, 4, 6, 7, 8, 10, 14]`,
    },

    // ── Step 5: BST search ────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step5-search',
      text: 'Search follows the same logic as insert: at each node, compare and go left or right. The recursion eliminates half the remaining tree at every step — that is O(log n) for a balanced tree. The worst case is a degenerate tree where every value was inserted in sorted order, making it a linked list: O(n). This is why self-balancing trees (like AVL trees) exist, but they are beyond this lesson. For now, appreciate the best-case: in-order insertion always gives O(log n).',
      code: `function createTreeNode(v) { return { value: v, left: null, right: null } }

function insert(node, value) {
  if (!node) return createTreeNode(value)
  if (value < node.value) node.left  = insert(node.left,  value)
  else if (value > node.value) node.right = insert(node.right, value)
  return node
}

// Search — O(log n) for balanced tree
function search(node, target) {
  // Base case 1: null — not found
  if (node === null) return null

  // Base case 2: found
  if (node.value === target) return node

  // Recursive case: go left or right based on comparison
  if (target < node.value) return search(node.left, target)
  else                     return search(node.right, target)
}

let root = null
for (const v of [8, 3, 10, 1, 6, 14, 4, 7]) root = insert(root, v)

console.log(search(root, 6)?.value)    // 6 — found
console.log(search(root, 14)?.value)   // 14 — found
console.log(search(root, 9))           // null — not found`,
    },

    {
      type: 'challenge',
      id: 'ch-bst',
      text: 'Write a findMin(node) and findMax(node) function for a BST. The minimum is always the leftmost node (keep going left until left is null). The maximum is always the rightmost node. Build a BST from [5, 3, 8, 1, 4, 7, 9]. Log min and max.',
      expectedOutput: null,
      startCode: `function createTreeNode(v) { return { value: v, left: null, right: null } }
function insert(node, value) {
  if (!node) return createTreeNode(value)
  if (value < node.value) node.left  = insert(node.left,  value)
  else if (value > node.value) node.right = insert(node.right, value)
  return node
}

function findMin(node) {
  // keep going left until left is null
}

function findMax(node) {
  // keep going right until right is null
}

let root = null
for (const v of [5, 3, 8, 1, 4, 7, 9]) root = insert(root, v)

console.log(findMin(root).value)   // 1
console.log(findMax(root).value)   // 9`,
      hint: 'findMin: if (!node.left) return node; return findMin(node.left). findMax: same but going right.',
      validate: ({ logs }) => {
        const nums = logs.map(l => parseInt(String(l).trim(), 10))
        return nums.includes(1) && nums.includes(9)
      },
    },

    { type: 'checkpoint', id: 'cp-bst' },

    // ── Step 6: Composite Pattern ─────────────────────────────────────────────

    {
      type: 'narration',
      id: 'step6-composite-problem',
      text: 'Now the design pattern. Here is the problem: you want to calculate the total size of a directory. A directory can contain files (with a known size) and other directories (which in turn contain files and directories). You need to handle both cases. Without a pattern, you end up with type-checking code everywhere: "if this is a file, return its size; if it is a directory, loop over its children." The code gets messy and every operation (size, count, find) has to repeat this branching logic.',
      code: `// Without Composite: type-checking everywhere
function getTotalSize(item) {
  if (item.type === 'file') {
    return item.size
  } else if (item.type === 'directory') {
    let total = 0
    for (const child of item.children) {
      // Have to repeat the same type-checking logic recursively
      if (child.type === 'file') {
        total += child.size
      } else if (child.type === 'directory') {
        total += getTotalSize(child)   // had to add recursion anyway
      }
    }
    return total
  }
}

const fileSystem = {
  type: 'directory', name: 'root', children: [
    { type: 'file', name: 'readme.txt', size: 1 },
    { type: 'directory', name: 'src', children: [
      { type: 'file', name: 'app.js', size: 10 },
      { type: 'file', name: 'utils.js', size: 5 },
    ]},
  ]
}

console.log(getTotalSize(fileSystem))   // 16 — works, but type checking is everywhere`,
    },

    // ── Step 7: Composite interface ───────────────────────────────────────────

    {
      type: 'narration',
      id: 'step7-composite-interface',
      text: 'The Composite pattern solves this by giving files and directories the same interface. Both have a size() method. File.size() returns its own size. Directory.size() asks all its children for their size() and sums them. The caller does not need to know or check the type — it just calls size(). This is the insight: when an object represents a single thing and a collection of those things, give them the same interface so they can be treated uniformly.',
      code: `// Composite: File and Directory share the same interface
function createFile(name, size) {
  return {
    name,
    size() { return size },     // leaf — returns its own size
    type: 'file',
  }
}

function createDirectory(name) {
  const children = []
  return {
    name,
    add(child)  { children.push(child); return this },
    size() {
      // delegate to children — no type checking needed
      let total = 0
      for (const child of children) total += child.size()
      return total
    },
    type: 'directory',
  }
}

const root = createDirectory('root')
  .add(createFile('readme.txt', 1))
  .add(
    createDirectory('src')
      .add(createFile('app.js', 10))
      .add(createFile('utils.js', 5))
  )
  .add(
    createDirectory('tests')
      .add(createFile('app.test.js', 3))
  )

console.log('total size:', root.size())   // 19
// root.size() → 1 + src.size() + tests.size()
//             → 1 + (10 + 5) + 3 = 19`,
    },

    // ── Step 8: Full Composite with count ─────────────────────────────────────

    {
      type: 'narration',
      id: 'step8-composite-full',
      text: 'Add a count() method to both. File.count() returns 1. Directory.count() sums children.count(). Both operations follow the same pattern: leaf returns a single value, composite delegates to children and aggregates. The pattern works for any operation you can define recursively: total size, file count, deepest path, list of all file names. You define it once on each type and the tree structure handles the rest.',
      code: `function createFile(name, size) {
  return {
    name,
    size()  { return size },
    count() { return 1 },        // a file is 1 item
    list()  { return [name] },   // a file is just itself
  }
}

function createDirectory(name) {
  const children = []
  return {
    name,
    add(child) { children.push(child); return this },

    size()  { let t=0; for(const c of children) t += c.size();  return t },
    count() { let t=0; for(const c of children) t += c.count(); return t },
    list()  {
      const names = []
      for (const c of children) {
        for (const n of c.list()) names.push(n)
      }
      return names
    },
  }
}

const root = createDirectory('root')
  .add(createFile('readme.txt', 1))
  .add(
    createDirectory('src')
      .add(createFile('app.js', 10))
      .add(createFile('utils.js', 5))
      .add(createDirectory('lib').add(createFile('math.js', 2)))
  )
  .add(createDirectory('tests').add(createFile('app.test.js', 3)))

console.log('size:', root.size())     // 21
console.log('count:', root.count())   // 5 files
console.log('files:', root.list())    // all file names`,
    },

    {
      type: 'challenge',
      id: 'ch-composite',
      text: 'Add a find(name) method to both File and Directory. File.find(name) returns the file if its name matches, otherwise null. Directory.find(name) checks each child and returns the first non-null result. Build a tree with at least 4 files in different directories. Find a deeply nested file by name.',
      expectedOutput: null,
      startCode: `function createFile(name, size) {
  return {
    name, size() { return size },
    find(target) { return name === target ? this : null },
  }
}

function createDirectory(name) {
  const children = []
  return {
    name,
    add(c) { children.push(c); return this },
    size() { let t=0; for(const c of children) t+=c.size(); return t },
    find(target) {
      // check each child — return first non-null result
    },
  }
}

const root = createDirectory('root')
  .add(createFile('readme.md', 1))
  .add(createDirectory('src')
    .add(createFile('index.js', 5))
    .add(createDirectory('util')
      .add(createFile('helpers.js', 3))
    )
  )

const found = root.find('helpers.js')
console.log(found ? found.name : 'not found')   // helpers.js`,
      hint: 'for (const child of children) { const result = child.find(target); if (result) return result } return null',
      validate: ({ logs }) => logs.some(l => String(l).includes('helpers.js')),
    },

    { type: 'checkpoint', id: 'cp-composite' },

    // ── CodeLens ──────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens and step through the BST insert and search. Watch how insert navigates left and right at each node. Then watch search follow the same path without creating anything. After that, watch the recursive size() call on the directory: the Variables panel will show you the recursive descent into each subdirectory, and the return values accumulating back up.',
      code: `function createTreeNode(v) { return { value: v, left: null, right: null } }
function insert(node, val) {
  if (!node) return createTreeNode(val)
  if (val < node.value) node.left  = insert(node.left,  val)
  else if (val > node.value) node.right = insert(node.right, val)
  return node
}
function search(node, target) {
  if (!node) return null
  if (node.value === target) return node
  return target < node.value ? search(node.left, target) : search(node.right, target)
}

let root = null
for (const v of [8, 3, 10, 1, 6]) root = insert(root, v)

console.log(search(root, 6)?.value)   // 6
console.log(search(root, 9))          // null`,
    },

    {
      type: 'codelens',
      id: 'cl-trees',
      text: 'Step through insert and search in CodeLens. Watch the recursive calls navigate left and right at each node. On insert, see the null check at a leaf position create the new node. On search, see the same comparisons follow the same path to find it.',
      code: `function createTreeNode(v) { return { value: v, left: null, right: null } }
function insert(node, val) {
  if (!node) return createTreeNode(val)
  if (val < node.value) node.left  = insert(node.left,  val)
  else if (val > node.value) node.right = insert(node.right, val)
  return node
}
function search(node, target) {
  if (!node) return null
  if (node.value === target) return node
  return target < node.value ? search(node.left, target) : search(node.right, target)
}

let root = null
for (const v of [8, 3, 10, 1, 6]) root = insert(root, v)
console.log(search(root, 6)?.value)
console.log(search(root, 9))`,
      lang: 'js',
    },

  ],
}
