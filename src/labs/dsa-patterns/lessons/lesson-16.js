// DSA + Design Patterns — Lesson 16
// AVL Trees & Self-Balancing

export const lesson = {
  id: 'dsa-patterns-16',
  series: { id: 'dsa-patterns', title: 'DSA + Design Patterns' },
  title: '16. AVL Trees & Self-Balancing',
  checkpoints: [
    { id: 'cp-degenerate', label: 'The Degenerate BST' },
    { id: 'cp-rotations',  label: 'Rotations' },
    { id: 'cp-avl',        label: 'AVL Invariant' },
  ],
  segments: [

    {
      type: 'narration',
      id: 'intro',
      text: 'You built a BST in the previous lesson. Insert [1, 2, 3, 4, 5] in order. Each new value is greater than the last, so it always goes right. The tree becomes a straight line leaning right — a linked list wearing a tree disguise. Search is O(n), not O(log n). The BST invariant is maintained but the height guarantee is broken. A BST is only O(log n) when it is balanced — when no path from root to leaf is much longer than any other. Sorted or nearly-sorted input, the most common real-world case, produces the worst BST. This lesson covers the AVL tree: the first self-balancing BST, which automatically restores balance after every insert and delete.',
      code: null,
    },

    {
      type: 'narration',
      id: 'step1-degenerate',
      text: 'A degenerate BST is one that has degenerated into a linked list. All nodes are in a single chain — either all left or all right children. Height equals n. Every search traverses the entire chain: O(n). The balance factor of a node is the height of its right subtree minus the height of its left subtree. In a perfectly balanced tree, every node has balance factor -1, 0, or +1. In a degenerate tree, the root\'s balance factor is ±(n-1). Height is defined recursively: height(node) = 1 + max(height(left), height(right)). Height of null is -1.',
      code: `function height(node) {
  if (node === null) return -1
  return 1 + Math.max(height(node.left), height(node.right))
}

function balanceFactor(node) {
  if (node === null) return 0
  return height(node.right) - height(node.left)
}

// Build a degenerate BST by inserting sorted values
class N{constructor(v){this.value=v;this.left=null;this.right=null}}
let root = null
for (const v of [1, 2, 3, 4, 5]) {
  const node = new N(v)
  if (!root) { root = node; continue }
  let cur = root
  while (true) {
    if (v < cur.value) { if (!cur.left)  { cur.left=node;break }; cur=cur.left }
    else               { if (!cur.right) { cur.right=node;break }; cur=cur.right }
  }
}

console.log('height:', height(root))              // 4 — should be 2 if balanced
console.log('root balance factor:', balanceFactor(root))  // 4 — very unbalanced`,
    },

    {
      type: 'narration',
      id: 'step2-rotations',
      text: 'A rotation is a local restructuring operation that changes the tree\'s shape without violating the BST invariant. A right rotation on node X: X\'s left child (Y) becomes the new root of this subtree; X becomes Y\'s right child; Y\'s old right subtree becomes X\'s new left subtree. This moves one node from the left-heavy side to the right-heavy side, reducing height by 1 on one branch and increasing it by 1 on the other. Left rotation is the mirror image. Rotations are O(1) — they update a constant number of references.',
      code: `function rotateRight(y) {
  const x  = y.left       // x becomes the new root
  const T2 = x.right      // T2 is x's right subtree (will move to y.left)
  x.right  = y            // y becomes x's right child
  y.left   = T2           // T2 becomes y's left child
  return x                // x is the new root of this subtree
}

function rotateLeft(x) {
  const y  = x.right      // y becomes the new root
  const T2 = y.left       // T2 is y's left subtree
  y.left   = x            // x becomes y's left child
  x.right  = T2           // T2 becomes x's right child
  return y                // y is the new root
}

// Demonstrate: fix a right-heavy chain 1→2→3 with a left rotation
class N{constructor(v){this.value=v;this.left=null;this.right=null;this.height=0}}
const n1=new N(1),n2=new N(2),n3=new N(3)
n1.right=n2; n2.right=n3

// Before: 1(right=2(right=3)) — degenerate
// After left rotation on 1: 2 becomes root, 1 is left, 3 is right
const newRoot = rotateLeft(n1)
console.log(newRoot.value)         // 2
console.log(newRoot.left.value)    // 1
console.log(newRoot.right.value)   // 3`,
    },

    {
      type: 'narration',
      id: 'step3-avl-invariant',
      text: 'An AVL tree maintains the AVL invariant: at every node, the balance factor (right height minus left height) is -1, 0, or +1. After every insert, re-check the balance factor on the path from the inserted node back to the root. If any node\'s balance factor goes to ±2, apply one or two rotations to restore balance. Four cases: Left-Left (right rotate), Right-Right (left rotate), Left-Right (left rotate on left child, then right rotate on root), Right-Left (right rotate on right child, then left rotate on root). AVL trees guarantee O(log n) height always, so search, insert, and delete are all O(log n) worst case.',
      code: `function h(n){return n?n.h:-1}
function bf(n){return n?h(n.right)-h(n.left):0}
function upd(n){if(n)n.h=1+Math.max(h(n.left),h(n.right))}

function rotL(x){const y=x.right;x.right=y.left;y.left=x;upd(x);upd(y);return y}
function rotR(y){const x=y.left;y.left=x.right;x.right=y;upd(y);upd(x);return x}

function balance(n){
  upd(n)
  const b=bf(n)
  if(b<-1){if(bf(n.left)>0)n.left=rotL(n.left);return rotR(n)}
  if(b> 1){if(bf(n.right)<0)n.right=rotR(n.right);return rotL(n)}
  return n
}

function insert(node,v){
  if(!node)return{value:v,left:null,right:null,h:0}
  if(v<node.value)node.left=insert(node.left,v)
  else node.right=insert(node.right,v)
  return balance(node)
}

let root=null
for(const v of[1,2,3,4,5])root=insert(root,v)

function maxH(n){if(!n)return-1;return 1+Math.max(maxH(n.left),maxH(n.right))}
console.log('height after inserting 1-5:', maxH(root))  // 2 — balanced!
console.log('root value:', root.value)                   // 2 or 4 depending on rotations`,
    },

    {
      type: 'challenge',
      id: 'ch-degenerate',
      text: 'Write a function called treeHeight(values) that: (1) builds a plain BST by inserting values in order (no balancing), and (2) returns the height. Then write avlHeight(values) that builds an AVL tree using the insert() function below and returns the height. Compare the two for [1,2,3,4,5,6,7]. Plain BST height should be 6; AVL height should be 2. Log both.',
      expectedOutput: null,
      startCode: `function h(n){return n?n.h:-1}
function bf(n){return n?h(n.right)-h(n.left):0}
function upd(n){if(n)n.h=1+Math.max(h(n.left),h(n.right))}
function rotL(x){const y=x.right;x.right=y.left;y.left=x;upd(x);upd(y);return y}
function rotR(y){const x=y.left;y.left=x.right;x.right=y;upd(y);upd(x);return x}
function balance(n){upd(n);const b=bf(n);if(b<-1){if(bf(n.left)>0)n.left=rotL(n.left);return rotR(n)}if(b>1){if(bf(n.right)<0)n.right=rotR(n.right);return rotL(n)}return n}
function avlInsert(node,v){if(!node)return{value:v,left:null,right:null,h:0};if(v<node.value)node.left=avlInsert(node.left,v);else node.right=avlInsert(node.right,v);return balance(node)}

function treeHeight(values) {
  // insert without balancing, return height
  let root = null
  for (const v of values) { /* plain BST insert */ }
  function maxH(n){return !n?-1:1+Math.max(maxH(n.left),maxH(n.right))}
  return maxH(root)
}

function avlHeight(values) {
  let root = null
  for (const v of values) root = avlInsert(root, v)
  return root ? root.h : -1
}

const vals = [1,2,3,4,5,6,7]
console.log('plain BST height:', treeHeight(vals))   // 6
console.log('AVL height:', avlHeight(vals))           // 2`,
      hint: 'For plain BST insert: class N{constructor(v){this.value=v;this.left=null;this.right=null}} then standard insert loop.',
      validate: ({ logs }) => {
        const flat = logs.join(' ')
        return flat.includes('6') && flat.includes('2')
      },
    },

    { type: 'checkpoint', id: 'cp-degenerate' },

    {
      type: 'narration',
      id: 'step4-rotation-cases',
      text: 'The four rotation cases in detail. Left-Left: node is left-heavy, left child is also left-heavy — single right rotation fixes it. Right-Right: node is right-heavy, right child is also right-heavy — single left rotation. Left-Right: node is left-heavy but left child is right-heavy — first left-rotate the left child (makes it Left-Left), then right-rotate the node. Right-Left: node is right-heavy but right child is left-heavy — first right-rotate the right child, then left-rotate the node.',
      code: `// Demonstrating each rotation case manually
function h(n){return n?n.h:-1}
function upd(n){if(n)n.h=1+Math.max(h(n.left),h(n.right))}
function rotL(x){const y=x.right;x.right=y.left;y.left=x;upd(x);upd(y);return y}
function rotR(y){const x=y.left;y.left=x.right;x.right=y;upd(y);upd(x);return x}

// Right-Right case: 1→2→3
// Single left rotation makes 2 the root
const n1={value:1,left:null,right:null,h:0}
const n2={value:2,left:null,right:null,h:0}
const n3={value:3,left:null,right:null,h:0}
n2.right=n3; upd(n2)
n1.right=n2; upd(n1)
const fixed=rotL(n1)   // left rotation on 1
console.log('RR fixed: root=',fixed.value,'left=',fixed.left.value,'right=',fixed.right.value)

// Left-Right case: 3, left=1, 1.right=2
const a={value:3,left:null,right:null,h:0}
const b={value:1,left:null,right:null,h:0}
const c={value:2,left:null,right:null,h:0}
b.right=c; upd(b)
a.left=b; upd(a)
a.left=rotL(a.left)  // left rotate the left child first
const fixed2=rotR(a) // then right rotate
console.log('LR fixed: root=',fixed2.value,'left=',fixed2.left.value,'right=',fixed2.right.value)`,
    },

    {
      type: 'challenge',
      id: 'ch-rotations',
      text: 'Using the AVL insert function below, insert values [5,3,7,1,4,6,8,2] one by one. After all inserts, call inorder() on the root to verify the BST invariant is maintained. Log the inorder result as a comma-separated string. It must be "1,2,3,4,5,6,7,8" — sorted. Also log the final height — it should be 3 (not 7 as a plain BST would give).',
      expectedOutput: null,
      startCode: `function h(n){return n?n.h:-1}
function upd(n){if(n)n.h=1+Math.max(h(n.left),h(n.right))}
function rotL(x){const y=x.right;x.right=y.left;y.left=x;upd(x);upd(y);return y}
function rotR(y){const x=y.left;y.left=x.right;x.right=y;upd(y);upd(x);return x}
function bal(n){upd(n);const b=h(n.right)-h(n.left);if(b<-1){if(h(n.left.right)>h(n.left.left))n.left=rotL(n.left);return rotR(n)}if(b>1){if(h(n.right.left)>h(n.right.right))n.right=rotR(n.right);return rotL(n)}return n}
function ins(node,v){if(!node)return{value:v,left:null,right:null,h:0};if(v<node.value)node.left=ins(node.left,v);else node.right=ins(node.right,v);return bal(node)}
function inorder(n,r=[]){if(!n)return r;inorder(n.left,r);r.push(n.value);inorder(n.right,r);return r}

let root = null
for (const v of [5,3,7,1,4,6,8,2]) root = ins(root, v)

console.log(inorder(root).join(','))   // '1,2,3,4,5,6,7,8'
console.log('height:', root.h)         // 3`,
      hint: 'Just run the provided code — the AVL insert handles balancing automatically.',
      validate: ({ logs }) => {
        const strs = logs.map(l => String(l).trim())
        return strs[0] === '1,2,3,4,5,6,7,8'
      },
    },

    { type: 'checkpoint', id: 'cp-rotations' },

    {
      type: 'narration',
      id: 'step5-when-avl',
      text: 'When do you need AVL vs plain BST? If your data arrives in random order, a plain BST has expected O(log n) height and AVL overhead is unnecessary. If data arrives sorted or nearly sorted — IDs incrementing, timestamps in order, alphabetically sorted names — plain BST degenerates to O(n) and AVL is essential. Real databases use B-trees (a generalisation of AVL) for exactly this reason. In practice: use a built-in sorted set (JavaScript has no built-in BST, but sorted arrays with binary search often suffice). Build an AVL when you need O(log n) insert and search and cannot tolerate O(n) worst case.',
      code: `// When plain BST breaks: sorted input
function plainHeight(n){
  let root=null,h=-1
  for(const v of n){const node={value:v,left:null,right:null};if(!root){root=node;continue}let c=root;while(true){if(v<c.value){if(!c.left){c.left=node;break}c=c.left}else{if(!c.right){c.right=node;break}c=c.right}}}
  function mh(x){return!x?-1:1+Math.max(mh(x.left),mh(x.right))}
  return mh(root)
}

function h(n){return n?n.h:-1}
function upd(n){if(n)n.h=1+Math.max(h(n.left),h(n.right))}
function rotL(x){const y=x.right;x.right=y.left;y.left=x;upd(x);upd(y);return y}
function rotR(y){const x=y.left;y.left=x.right;x.right=y;upd(y);upd(x);return x}
function bal(n){upd(n);const b=h(n.right)-h(n.left);if(b<-1){if(h(n.left.right)>h(n.left.left))n.left=rotL(n.left);return rotR(n)}if(b>1){if(h(n.right.left)>h(n.right.right))n.right=rotR(n.right);return rotL(n)}return n}
function avlIns(nd,v){if(!nd)return{value:v,left:null,right:null,h:0};if(v<nd.value)nd.left=avlIns(nd.left,v);else nd.right=avlIns(nd.right,v);return bal(nd)}
function avlHeight(vals){let r=null;for(const v of vals)r=avlIns(r,v);return r?r.h:-1}

const sorted = Array.from({length:16},(_,i)=>i+1)
console.log('plain BST height (sorted input):', plainHeight(sorted))  // 15
console.log('AVL height (sorted input):',       avlHeight(sorted))    // 3`,
    },

    {
      type: 'challenge',
      id: 'ch-avl',
      text: 'Write a function called countNodes(root) that counts the total number of nodes in a tree. Then: insert [10,5,15,3,7,12,20] into an AVL tree, count the nodes (should be 7), and verify the height is at most 3. Log the count (7) and height.',
      expectedOutput: null,
      startCode: `function h(n){return n?n.h:-1}
function upd(n){if(n)n.h=1+Math.max(h(n.left),h(n.right))}
function rotL(x){const y=x.right;x.right=y.left;y.left=x;upd(x);upd(y);return y}
function rotR(y){const x=y.left;y.left=x.right;x.right=y;upd(y);upd(x);return x}
function bal(n){upd(n);const b=h(n.right)-h(n.left);if(b<-1){if(h(n.left.right)>h(n.left.left))n.left=rotL(n.left);return rotR(n)}if(b>1){if(h(n.right.left)>h(n.right.right))n.right=rotR(n.right);return rotL(n)}return n}
function ins(nd,v){if(!nd)return{value:v,left:null,right:null,h:0};if(v<nd.value)nd.left=ins(nd.left,v);else nd.right=ins(nd.right,v);return bal(nd)}

function countNodes(root) {
  if (!root) return 0
  return 1 + countNodes(root.left) + countNodes(root.right)
}

let root = null
for (const v of [10,5,15,3,7,12,20]) root = ins(root, v)

console.log(countNodes(root))   // 7
console.log(root.h)             // ≤ 3`,
      hint: 'countNodes is already written. Just run and verify.',
      validate: ({ logs }) => {
        const nums = logs.map(l=>parseInt(String(l).trim(),10))
        return nums[0] === 7 && nums[1] <= 3
      },
    },

    { type: 'checkpoint', id: 'cp-avl' },

    {
      type: 'narration',
      id: 'codelens-setup',
      text: 'Open in CodeLens. Insert values [1,2,3] into the AVL tree one at a time. After inserting 1 and 2, the tree is fine (balance factor 1). After inserting 3, the root\'s balance factor becomes 2 — a Right-Right case. Watch rotateLeft() fire: the root becomes 2, with 1 on the left and 3 on the right. The tree goes from a degenerate chain to a perfectly balanced three-node tree in one O(1) rotation.',
      code: `function h(n){return n?n.h:-1}
function upd(n){if(n)n.h=1+Math.max(h(n.left),h(n.right))}
function rotL(x){const y=x.right;x.right=y.left;y.left=x;upd(x);upd(y);return y}
function rotR(y){const x=y.left;y.left=x.right;x.right=y;upd(y);upd(x);return x}
function bal(n){upd(n);const b=h(n.right)-h(n.left);if(b>1){return rotL(n)}if(b<-1){return rotR(n)}return n}
function ins(nd,v){if(!nd)return{value:v,left:null,right:null,h:0};if(v<nd.value)nd.left=ins(nd.left,v);else nd.right=ins(nd.right,v);return bal(nd)}
let root=null
root=ins(root,1); console.log('after 1: root=',root.value,'h=',root.h)
root=ins(root,2); console.log('after 2: root=',root.value,'h=',root.h)
root=ins(root,3); console.log('after 3: root=',root.value,'h=',root.h,'(rotated!)')`,
    },

    {
      type: 'codelens',
      id: 'cl-avl',
      text: `After inserting 1 and 2: root is 1, root.right is 2. Balance factor = h(right) - h(left) = 0 - (-1) = 1. Within bounds.

After inserting 3: it goes right of 2. bal(2) — balance factor = 1, fine. Returns up to bal(1): h(right) = 1, h(left) = -1. Balance factor = 2. Too heavy right — rotateLeft(1) fires.

rotateLeft(1): y = 1.right = 2. 1.right = 2.left = null. 2.left = 1. upd(1) → h=0. upd(2) → h=1. Returns 2.

root is now 2. root.left = 1, root.right = 3. Height = 1. Balanced.`,
      code: `function h(n){return n?n.h:-1}
function upd(n){if(n)n.h=1+Math.max(h(n.left),h(n.right))}
function rotL(x){const y=x.right;x.right=y.left;y.left=x;upd(x);upd(y);return y}
function rotR(y){const x=y.left;y.left=x.right;x.right=y;upd(y);upd(x);return x}
function bal(n){upd(n);const b=h(n.right)-h(n.left);if(b>1)return rotL(n);if(b<-1)return rotR(n);return n}
function ins(nd,v){if(!nd)return{value:v,left:null,right:null,h:0};if(v<nd.value)nd.left=ins(nd.left,v);else nd.right=ins(nd.right,v);return bal(nd)}
let root=null
for(const v of[1,2,3])root=ins(root,v)
console.log('root:',root.value,'h:',root.h)`,
      lang: 'js',
    },

  ],
}
