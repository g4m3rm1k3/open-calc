// DSA + Design Patterns — Lesson 15
// BST + Template Method

export const lesson = {
  id: 'dsa-patterns-15',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '15. BST + Template Method',
  checkpoints: [
    { id: 'cp-bst',      label: 'BST Invariant' },
    { id: 'cp-template', label: 'Template Method' },
    { id: 'cp-together', label: 'Put Together' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'In the Binary Trees lesson we built a tree and traversed it. We could insert nodes and walk the tree in pre-order, in-order, and post-order. But that tree had no ordering — you had to scan every node to find a value. What if you need to find, insert, and delete values in a tree that stays sorted at all times? And what if the comparison logic — what "less than" means for your data — needs to be swappable? A name comparison is different from a number comparison, which is different from a date comparison. The algorithm skeleton should stay the same; only the comparison step should change.',
      code: null,
    },

    {
      type: 'narration',
      id: 'step1-bst-invariant',
      text: 'A Binary Search Tree (BST) is a binary tree with one invariant: for every node, all values in its left subtree are less than the node\'s value, and all values in its right subtree are greater. Invariant: a rule that is always true. This invariant is what makes search efficient: at each node, you can eliminate half the remaining tree based on a single comparison. Search is O(h) where h is the height of the tree — O(log n) for a balanced tree. Without the invariant you have an ordinary binary tree and search is O(n).',
      code: `class BSTNode {
  constructor(value) {
    this.value = value
    this.left  = null   // all descendants < value
    this.right = null   // all descendants > value
  }
}

// Verify BST invariant manually with a small tree
const root   = new BSTNode(10)
root.left    = new BSTNode(5)
root.right   = new BSTNode(15)
root.left.left  = new BSTNode(3)
root.left.right = new BSTNode(7)
root.right.left = new BSTNode(12)

// In-order traversal of a BST always yields sorted output
function inorder(node, result = []) {
  if (node === null) return result
  inorder(node.left, result)
  result.push(node.value)
  inorder(node.right, result)
  return result
}

console.log(inorder(root))   // [3, 5, 7, 10, 12, 15] — always sorted`,
    },

    {
      type: 'narration',
      id: 'step2-insert',
      text: 'Insert into a BST: starting at the root, compare the new value with the current node. If less, go left; if greater, go right. Repeat until you reach a null slot — that is where the new node belongs. The invariant is maintained because the new node always ends up on the correct side of every node it passed through.',
      code: `class BST {
  constructor() { this.root = null }

  insert(value) {                      // ← NEW
    const node = new BSTNode(value)
    if (this.root === null) { this.root = node; return }
    let cur = this.root
    while (true) {
      if (value < cur.value) {
        if (cur.left === null) { cur.left = node; return }
        cur = cur.left
      } else {
        if (cur.right === null) { cur.right = node; return }
        cur = cur.right
      }
    }
  }
}

class BSTNode { constructor(v){this.value=v;this.left=null;this.right=null} }

const bst = new BST()
for (const v of [10, 5, 15, 3, 7, 12, 20]) bst.insert(v)

function inorder(n,r=[]){if(!n)return r;inorder(n.left,r);r.push(n.value);inorder(n.right,r);return r}
console.log(inorder(bst.root))   // [3,5,7,10,12,15,20]`,
    },

    {
      type: 'narration',
      id: 'step3-search',
      text: 'Search in a BST: compare the target with the current node. If equal, found. If less, search the left subtree. If greater, search the right subtree. Each comparison eliminates one half of the remaining tree. O(log n) for a balanced tree — a tree of 1 million nodes requires at most 20 comparisons.',
      code: `// Add search to BST
function search(node, value) {
  if (node === null) return false        // fell off the tree — not found
  if (value === node.value) return true  // found
  if (value < node.value) return search(node.left, value)
  return search(node.right, value)
}

class BSTNode{constructor(v){this.value=v;this.left=null;this.right=null}}
class BST{constructor(){this.root=null}insert(v){const n=new BSTNode(v);if(!this.root){this.root=n;return}let c=this.root;while(true){if(v<c.value){if(!c.left){c.left=n;return}c=c.left}else{if(!c.right){c.right=n;return}c=c.right}}}}

const bst = new BST()
for (const v of [10,5,15,3,7,12,20]) bst.insert(v)

console.log(search(bst.root, 7))    // true — O(log n): root→5→7
console.log(search(bst.root, 11))   // false — O(log n): root→15→12→null
console.log(search(bst.root, 20))   // true`,
    },

    {
      type: 'challenge',
      id: 'ch-bst',
      text: 'Add a min() method to the BST class below that returns the minimum value in the tree. The minimum is always the leftmost node — follow left references until you reach a node with no left child. Test: insert [10,5,15,3,7]. min() should return 3. Log it.',
      expectedOutput: null,
      startCode: `class BSTNode{constructor(v){this.value=v;this.left=null;this.right=null}}
class BST {
  constructor(){this.root=null}
  insert(v){const n=new BSTNode(v);if(!this.root){this.root=n;return}let c=this.root;while(true){if(v<c.value){if(!c.left){c.left=n;return}c=c.left}else{if(!c.right){c.right=n;return}c=c.right}}}

  min() {
    // follow left references to the leftmost node
    // return that node's value
  }
}

const bst = new BST()
for (const v of [10,5,15,3,7]) bst.insert(v)
console.log(bst.min())   // 3`,
      hint: 'let cur = this.root; while (cur.left !== null) cur = cur.left; return cur.value',
      validate: ({ logs }) => logs.map(l=>parseInt(String(l).trim(),10)).includes(3),
    },

    { type: 'checkpoint', id: 'cp-bst' },

    {
      type: 'narration',
      id: 'step4-template-intro',
      text: 'The Template Method pattern defines the skeleton of an algorithm in a base class and lets subclasses fill in one or more steps without changing the overall structure. The base class contains the invariant part: the algorithm\'s shape, order of steps, and flow. Subclasses contain the variant part: the specific behaviour of one step. In a BST, the search, insert, and traversal algorithms are all skeletons where the comparison step is swappable. The template IS the BST logic; the comparison IS the template method.',
      code: null,
    },

    {
      type: 'narration',
      id: 'step5-template-code',
      text: 'Build a BST base class with a compare() method that subclasses override. The search and insert algorithms call this.compare() without knowing the comparison logic. A NumberBST compares numerically. A StringBST compares lexicographically. The algorithm skeleton is identical.',
      code: `class GenericBST {
  constructor() { this.root = null }

  compare(a, b) {                // ← template method: subclasses override this
    throw new Error('compare() must be implemented')
  }

  insert(value) {
    const node = { value, left: null, right: null }
    if (!this.root) { this.root = node; return }
    let cur = this.root
    while (true) {
      const cmp = this.compare(value, cur.value)   // ← calls the template method
      if (cmp < 0) { if (!cur.left)  { cur.left  = node; return }; cur = cur.left  }
      else         { if (!cur.right) { cur.right = node; return }; cur = cur.right }
    }
  }

  inorder(node = this.root, result = []) {
    if (!node) return result
    this.inorder(node.left, result)
    result.push(node.value)
    this.inorder(node.right, result)
    return result
  }
}

class NumberBST extends GenericBST {
  compare(a, b) { return a - b }             // ← NEW: numeric comparison
}

class StringBST extends GenericBST {
  compare(a, b) { return a.localeCompare(b) } // ← NEW: lexicographic comparison
}

const nums = new NumberBST()
for (const v of [10,5,15,3,7]) nums.insert(v)
console.log(nums.inorder())   // [3,5,7,10,15]

const strs = new StringBST()
for (const v of ['banana','apple','cherry','avocado']) strs.insert(v)
console.log(strs.inorder())   // ['apple','avocado','banana','cherry']`,
    },

    {
      type: 'narration',
      id: 'step6-meeting',
      text: 'This is where the two ideas meet. The BST invariant — left < node < right — is enforced at every insert and search. The comparison that determines "less than" is the template method step. The invariant is maintained by the algorithm skeleton in the base class. The definition of "less than" lives only in the subclass. You can change the ordering rule — swap numbers to sort descending, sort strings case-insensitively, sort objects by a property — without touching the insert or search logic at all. The BST IS the template. The comparison IS the variable step.',
      code: null,
    },

    {
      type: 'challenge',
      id: 'ch-template',
      text: 'Create a class called PersonBST that extends GenericBST below. Override compare(a, b) to compare by person.age numerically (return a.age - b.age). Insert three people: { name: "Alice", age: 30 }, { name: "Bob", age: 25 }, { name: "Carol", age: 35 }. Call inorder() and log the names in age order — expected: "Bob,Alice,Carol".',
      expectedOutput: null,
      startCode: `class GenericBST {
  constructor(){this.root=null}
  compare(a,b){throw new Error('implement compare')}
  insert(v){const n={value:v,left:null,right:null};if(!this.root){this.root=n;return}let c=this.root;while(true){const cmp=this.compare(v,c.value);if(cmp<0){if(!c.left){c.left=n;return}c=c.left}else{if(!c.right){c.right=n;return}c=c.right}}}
  inorder(n=this.root,r=[]){if(!n)return r;this.inorder(n.left,r);r.push(n.value);this.inorder(n.right,r);return r}
}

class PersonBST extends GenericBST {
  compare(a, b) {
    // compare by age
  }
}

const tree = new PersonBST()
tree.insert({ name: 'Alice', age: 30 })
tree.insert({ name: 'Bob',   age: 25 })
tree.insert({ name: 'Carol', age: 35 })

console.log(tree.inorder().map(p => p.name).join(','))  // 'Bob,Alice,Carol'`,
      hint: 'compare(a, b) { return a.age - b.age }',
      validate: ({ logs }) => String(logs[0]).trim() === 'Bob,Alice,Carol',
    },

    { type: 'checkpoint', id: 'cp-template' },

    {
      type: 'narration',
      id: 'step7-combined',
      text: 'Build a sorted leaderboard using a PersonBST sorted by score descending. The Template Method step is the comparison — reversed so that higher scores come first in the inorder traversal.',
      code: `class GenericBST{constructor(){this.root=null}compare(a,b){throw new Error('implement')}insert(v){const n={value:v,left:null,right:null};if(!this.root){this.root=n;return}let c=this.root;while(true){const cmp=this.compare(v,c.value);if(cmp<0){if(!c.left){c.left=n;return}c=c.left}else{if(!c.right){c.right=n;return}c=c.right}}}inorder(n=this.root,r=[]){if(!n)return r;this.inorder(n.left,r);r.push(n.value);this.inorder(n.right,r);return r}}

class ScoreBST extends GenericBST {
  compare(a, b) { return b.score - a.score }   // descending: higher score goes left
}

const board = new ScoreBST()
const players = [
  { name: 'Alice', score: 85 },
  { name: 'Bob',   score: 92 },
  { name: 'Carol', score: 78 },
  { name: 'Dave',  score: 95 },
  { name: 'Eve',   score: 88 },
]
for (const p of players) board.insert(p)

const ranked = board.inorder()
ranked.forEach((p, i) => console.log(i + 1, p.name, p.score))`,
    },

    {
      type: 'challenge',
      id: 'ch-together',
      text: 'Use the GenericBST class and create a DateBST that sorts Date objects chronologically (earlier dates first). Override compare(a, b) to return a.getTime() - b.getTime(). Insert three dates: new Date("2024-03-01"), new Date("2024-01-15"), new Date("2024-06-10"). Call inorder() and log the months in order — expected: "1,3,6" (January, March, June).',
      expectedOutput: null,
      startCode: `class GenericBST{constructor(){this.root=null}compare(a,b){throw new Error('implement')}insert(v){const n={value:v,left:null,right:null};if(!this.root){this.root=n;return}let c=this.root;while(true){const cmp=this.compare(v,c.value);if(cmp<0){if(!c.left){c.left=n;return}c=c.left}else{if(!c.right){c.right=n;return}c=c.right}}}inorder(n=this.root,r=[]){if(!n)return r;this.inorder(n.left,r);r.push(n.value);this.inorder(n.right,r);return r}}

class DateBST extends GenericBST {
  compare(a, b) {
    // compare Date objects chronologically
  }
}

const tree = new DateBST()
tree.insert(new Date('2024-03-01'))
tree.insert(new Date('2024-01-15'))
tree.insert(new Date('2024-06-10'))

// log the month numbers in order
console.log(tree.inorder().map(d => d.getMonth() + 1).join(','))  // '1,3,6'`,
      hint: 'compare(a, b) { return a.getTime() - b.getTime() }',
      validate: ({ logs }) => String(logs[0]).trim() === '1,3,6',
    },

    { type: 'checkpoint', id: 'cp-together' },

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open this in CodeLens. Watch insert() navigate the BST. Step through each iteration of the while loop. At each step, watch the compare() call return a positive or negative number, and watch the algorithm go left (negative) or right (positive). After inserting all values, step through inorder() — watch the recursive calls build the sorted array from left to right.',
      code: `class GBST{constructor(){this.root=null}compare(a,b){throw new Error()}insert(v){const n={value:v,left:null,right:null};if(!this.root){this.root=n;return}let c=this.root;while(true){if(this.compare(v,c.value)<0){if(!c.left){c.left=n;return}c=c.left}else{if(!c.right){c.right=n;return}c=c.right}}}inorder(n=this.root,r=[]){if(!n)return r;this.inorder(n.left,r);r.push(n.value);this.inorder(n.right,r);return r}}
class NumBST extends GBST{compare(a,b){return a-b}}
const t=new NumBST()
for(const v of[10,5,15,3,7])t.insert(v)
console.log(t.inorder().join(','))`,
    },

    {
      type: 'codelens',
      id: 'cl-bst-template',
      text: `Step to: insert(5) — compare(5, 10) returns -5 (negative). Algorithm goes left. root.left is null — 5 is placed here.

Step to: insert(15) — compare(15, 10) returns +5 (positive). Algorithm goes right. root.right is null — 15 placed here.

Step to: insert(3) — compare(3, 10) → -7, go left. compare(3, 5) → -2, go left. 5.left is null — 3 placed here.

Step through inorder(): watch the call stack grow as recursion goes to the leftmost node (3), then unwinds adding nodes in sorted order.`,
      code: `class GBST{constructor(){this.root=null}compare(a,b){return a-b}insert(v){const n={value:v,left:null,right:null};if(!this.root){this.root=n;return}let c=this.root;while(true){if(this.compare(v,c.value)<0){if(!c.left){c.left=n;return}c=c.left}else{if(!c.right){c.right=n;return}c=c.right}}}inorder(n=this.root,r=[]){if(!n)return r;this.inorder(n.left,r);r.push(n.value);this.inorder(n.right,r);return r}}
const t=new GBST()
for(const v of[10,5,15,3,7])t.insert(v)
console.log(t.inorder().join(','))`,
      lang: 'js',
    },

  ],
}
