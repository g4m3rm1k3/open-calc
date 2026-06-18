export default {
  id: 'dsa4-002',
  slug: 'binary-search-trees',
  chapter: 'dsa4',
  order: 2,
  title: 'Binary Search Trees',
  subtitle: 'The BST invariant — left < node < right — makes search, insert, and delete O(log n) on average.',
  tags: ['BST', 'binary search tree', 'insert', 'search', 'delete', 'inorder', 'sorted', 'in-order successor'],
  aliases: 'BST binary search tree insert search delete inorder sorted successor predecessor balanced',

  hook: {
    question: 'A sorted array gives you O(log n) search but O(n) insert. A linked list gives O(1) insert but O(n) search. What data structure gives you O(log n) for both?',
    realWorldContext: 'BSTs are everywhere you need sorted, dynamic data. Database indexes use tree variants (B-trees, red-black trees) to keep rows sorted while supporting fast inserts and deletes. The C++ std::map and Java TreeMap are red-black trees — BSTs that stay balanced automatically. Git uses sorted trees internally for object lookup. Every autocomplete suggestion engine that needs sorted prefix matching is built on a BST variant. Understanding the plain BST first gives you the foundation for all of these.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Binary trees let you branch. Now add one rule — the BST invariant — and everything changes. Every node in the left subtree has a smaller value; every node in the right subtree has a larger value. This single constraint means you can search a tree the same way you search a sorted array: eliminate half the candidates with each comparison.',
      '**Insert follows the invariant.** Start at the root. If the new value is smaller, go left; if larger, go right. Keep going until you reach a null pointer — that\'s where the new node belongs. The invariant is preserved automatically because you always go the right direction.',
      '**Search is identical to insert.** Same comparisons, same direction choices. Either you find the value or you fall off the tree (null). Each step eliminates an entire subtree from consideration.',
      '**Deletion has three cases.** A leaf node: just remove it. A node with one child: splice it out, connect parent to grandchild. A node with two children: find the in-order successor (the smallest value in the right subtree), copy its value into the node being deleted, then delete the successor. The successor has at most one child, so it falls into the simpler cases.',
      '**In-order traversal gives sorted output — for free.** Visit the left subtree, then the node, then the right subtree. Because of the BST invariant, this always visits nodes in ascending order. Inserting n items into a BST and running in-order is a tree sort: O(n log n) on average.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 4, Lesson 2: BSTs',
        body: '**Previous:** Binary Trees — structure and traversal.\n**This lesson:** BSTs — the invariant that makes trees useful for search.\n**Next:** Heaps — a different tree shape for priority queues.',
      },
      {
        type: 'insight',
        title: 'Why "in-order successor" for two-child deletion',
        body: 'When deleting a node with two children, you need a replacement that preserves the invariant. The in-order successor (smallest in right subtree) is larger than everything in the left subtree and smaller than everything remaining in the right subtree — the only value that fits.',
      },
      {
        type: 'warning',
        title: 'BSTs can degenerate',
        body: 'If you insert sorted data (1, 2, 3, 4, ...) into a plain BST, you get a linked list — O(n) for every operation. Self-balancing trees (AVL, red-black) solve this by rotating to keep height O(log n). The plain BST is the foundation to understand before learning balanced variants.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'BST: Insert, Search, and Sorted Output',
        mathBridge: 'Watch how the BST invariant guides every insert and search decision. Notice that in-order traversal always produces sorted output regardless of insertion order.',
        caption: 'Three cells: the BST invariant, O(log n) search steps, and free sorted output.',
        props: {
          lesson: {
            title: 'How a BST Stays Sorted',
            subtitle: 'Every insert preserves the invariant: left < node ≤ right',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The BST Property',
                instruction: 'This BST was built by inserting values one at a time. Every node\'s left subtree contains smaller values; its right subtree contains larger values.\n\nNotice how the shape depends entirely on insertion order.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display = document.getElementById('display');
function Node(val){this.val=val;this.left=null;this.right=null;}
function insert(root,val){if(!root)return new Node(val);if(val<root.val)root.left=insert(root.left,val);else root.right=insert(root.right,val);return root;}
const values=[8,3,10,1,6,14,4,7,13];
let root=null;
for(const v of values)root=insert(root,v);
function lines(node,prefix='',isLeft=true){if(!node)return[];const out=[];out.push(...lines(node.right,prefix+(isLeft?'│   ':'    '),false));out.push(prefix+(isLeft?'└── ':'┌── ')+node.val);out.push(...lines(node.left,prefix+(isLeft?'    ':'│   '),true));return out;}
display.innerHTML='<pre style="font-size:14px;color:#e2e8f0;line-height:1.6">'+lines(root).join('\\n')+'</pre><p style="color:#94a3b8;margin-top:8px">Inserted: '+values.join(' → ')+'</p><p style="color:#f59e0b;font-size:13px">Left child always smaller. Right child always larger.</p>';`,
                outputHeight: 280,
              },
              {
                type: 'js',
                title: 'Search: Only Log(n) Comparisons',
                instruction: 'Searching for 7. At each node, one comparison eliminates an entire subtree. Watch how many steps it takes versus a linear scan of 9 elements.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
function Node(v){this.val=v;this.left=null;this.right=null;}
function insert(r,v){if(!r)return new Node(v);if(v<r.val)r.left=insert(r.left,v);else r.right=insert(r.right,v);return r;}
let root=null;for(const v of[8,3,10,1,6,14,4,7,13])root=insert(root,v);
function searchSteps(r,t){const path=[];let n=r;while(n){path.push({v:n.val,d:n.val===t?'FOUND':n.val>t?'go left':'go right'});if(n.val===t)break;n=n.val>t?n.left:n.right;}return path;}
const steps=searchSteps(root,7);
let html='<h3 style="color:#60a5fa;margin:0 0 12px">Searching for 7 in 9-node BST</h3><table style="border-collapse:collapse;width:100%;font-size:13px"><tr style="color:#94a3b8"><th style="text-align:left;padding:4px 8px">Step</th><th style="text-align:left;padding:4px 8px">Visiting</th><th style="text-align:left;padding:4px 8px">Decision</th></tr>';
steps.forEach((s,i)=>{const c=s.d==='FOUND'?'#4ade80':'#f59e0b';html+='<tr style="border-top:1px solid #334155"><td style="padding:4px 8px;color:#94a3b8">'+(i+1)+'</td><td style="padding:4px 8px;color:#e2e8f0;font-weight:bold">'+s.v+'</td><td style="padding:4px 8px;color:'+c+'">'+s.d+'</td></tr>';});
html+='</table><p style="color:#94a3b8;margin-top:12px;font-size:13px">'+steps.length+' comparisons vs 9 for linear scan.</p>';
display.innerHTML=html;`,
                outputHeight: 240,
              },
              {
                type: 'js',
                title: 'In-Order = Sorted Output, Free',
                instruction: 'No matter what order you inserted the values, in-order traversal always produces them sorted. This is a direct consequence of the BST invariant.',
                html: `<div id="display" style="padding:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;font-family:monospace;box-sizing:border-box}`,
                startCode: `const display=document.getElementById('display');
function Node(v){this.val=v;this.left=null;this.right=null;}
function insert(r,v){if(!r)return new Node(v);if(v<r.val)r.left=insert(r.left,v);else r.right=insert(r.right,v);return r;}
function inOrder(n,res=[]){if(!n)return res;inOrder(n.left,res);res.push(n.val);inOrder(n.right,res);return res;}
const inserted=[8,3,10,1,6,14,4,7,13];
let root=null;for(const v of inserted)root=insert(root,v);
display.innerHTML='<h3 style="color:#60a5fa;margin:0 0 8px">In-order traversal (left → node → right)</h3><p style="color:#94a3b8;margin:0 0 6px">Inserted in order: <b style="color:#e2e8f0">'+inserted.join(', ')+'</b></p><p style="color:#94a3b8;margin:0 0 12px">In-order result: <b style="color:#4ade80">'+inOrder(root).join(', ')+'</b></p><p style="color:#f59e0b;font-size:13px">A BST in-order walk is a free sort — the invariant does the work.</p>';`,
                outputHeight: 180,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build a BST in JavaScript',
        caption: 'Implement insert, search, in-order traversal, and the three-case delete — then build the whole thing from scratch.',
        props: {
          lesson: {
            title: 'Binary Search Trees in JavaScript',
            subtitle: 'The invariant guides every operation.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — TreeNode and insert()

A BST node is the same as a binary tree node: \`val\`, \`left\`, \`right\`.

\`insert()\` recurses down the tree following the invariant:
- If \`val < root.val\` → go left
- If \`val >= root.val\` → go right
- If you hit \`null\` → place the new node here

**Implement \`insert()\`. Return the updated root.**`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `class TreeNode {
  constructor(val) {
    // TODO: this.val, this.left = null, this.right = null
  }
}

function insert(root, val) {
  // TODO: base case — if root is null, return new TreeNode(val)

  // TODO: if val < root.val → root.left = insert(root.left, val)
  //       else              → root.right = insert(root.right, val)

  // TODO: return root
}

// Build and test
let root = null;
for (const v of [8, 3, 10, 1, 6, 14, 4, 7, 13]) root = insert(root, v);

const out = document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('root', root?.val, 8);
test('root.left', root?.left?.val, 3);
test('root.right', root?.right?.val, 10);
test('root.left.left', root?.left?.left?.val, 1);`,
                solutionCode: `class TreeNode{constructor(val){this.val=val;this.left=null;this.right=null;}}
function insert(root,val){if(!root)return new TreeNode(val);if(val<root.val)root.left=insert(root.left,val);else root.right=insert(root.right,val);return root;}
let root=null;for(const v of[8,3,10,1,6,14,4,7,13])root=insert(root,v);
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('root',root?.val,8);test('root.left',root?.left?.val,3);test('root.right',root?.right?.val,10);test('root.left.left',root?.left?.left?.val,1);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — search() and inOrder()

\`search(root, val)\` — iterative walk: go left if smaller, right if larger, return \`true\` when found, \`false\` when you hit null.

\`inOrder(node, result)\` — recursive: left subtree → push val → right subtree. Because of the BST invariant, the result is always sorted ascending.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `class TreeNode{constructor(val){this.val=val;this.left=null;this.right=null;}}
function insert(root,val){if(!root)return new TreeNode(val);if(val<root.val)root.left=insert(root.left,val);else root.right=insert(root.right,val);return root;}
let root=null;for(const v of[8,3,10,1,6,14,4,7,13])root=insert(root,v);

// Iterative: at each node go left/right. Return true if found, false if null.
function search(root, val) {
  // TODO: while (root) { if val===root.val return true; go left or right }
  // return false
}

// Recursive: inOrder(left), push node.val, inOrder(right)
function inOrder(node, result = []) {
  // TODO: base case, recurse left, push, recurse right
  // return result
}

const out = document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('search 7 (exists)',  search(root, 7), true);
test('search 5 (missing)', search(root, 5), false);
test('inOrder sorted',     inOrder(root),  [1,3,4,6,7,8,10,13,14]);`,
                solutionCode: `class TreeNode{constructor(val){this.val=val;this.left=null;this.right=null;}}
function insert(root,val){if(!root)return new TreeNode(val);if(val<root.val)root.left=insert(root.left,val);else root.right=insert(root.right,val);return root;}
let root=null;for(const v of[8,3,10,1,6,14,4,7,13])root=insert(root,v);
function search(root,val){while(root){if(val===root.val)return true;root=val<root.val?root.left:root.right;}return false;}
function inOrder(node,result=[]){if(!node)return result;inOrder(node.left,result);result.push(node.val);inOrder(node.right,result);return result;}
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('search 7 (exists)',search(root,7),true);test('search 5 (missing)',search(root,5),false);test('inOrder sorted',inOrder(root),[1,3,4,6,7,8,10,13,14]);`,
                outputHeight: 140,
              },
              {
                type: 'js',
                instruction: `## Step 3 — deleteNode()

Deletion has three cases:
1. **No children (leaf):** just remove it — return \`null\`
2. **One child:** return the one child, skipping this node
3. **Two children:** find the **in-order successor** (minimum of right subtree), copy its value here, delete the successor from the right subtree

\`findMin(node)\` — keep going left until \`node.left\` is null.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `class TreeNode{constructor(val){this.val=val;this.left=null;this.right=null;}}
function insert(r,v){if(!r)return new TreeNode(v);if(v<r.val)r.left=insert(r.left,v);else r.right=insert(r.right,v);return r;}
function inOrder(n,res=[]){if(!n)return res;inOrder(n.left,res);res.push(n.val);inOrder(n.right,res);return res;}
let root=null;for(const v of[8,3,10,1,6,14,4,7,13])root=insert(root,v);

// Find the node with the minimum value in a subtree (keep going left)
function findMin(node) {
  // TODO: while (node.left) node = node.left; return node
}

function deleteNode(root, val) {
  // TODO: if !root return null
  // if val < root.val → recurse left
  // if val > root.val → recurse right
  // else (found):
  //   if !root.left → return root.right
  //   if !root.right → return root.left
  //   successor = findMin(root.right)
  //   root.val = successor.val
  //   root.right = deleteNode(root.right, successor.val)
  // return root
}

let r=null;for(const v of[8,3,10,1,6,14,4,7,13])r=insert(r,v);
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('before', inOrder(r), [1,3,4,6,7,8,10,13,14]);
r=deleteNode(r,3); test('del 3 (two children)', inOrder(r), [1,4,6,7,8,10,13,14]);
r=deleteNode(r,13);test('del 13 (leaf)',         inOrder(r), [1,4,6,7,8,10,14]);
r=deleteNode(r,10);test('del 10 (one child)',     inOrder(r), [1,4,6,7,8,14]);`,
                solutionCode: `class TreeNode{constructor(val){this.val=val;this.left=null;this.right=null;}}
function insert(r,v){if(!r)return new TreeNode(v);if(v<r.val)r.left=insert(r.left,v);else r.right=insert(r.right,v);return r;}
function inOrder(n,res=[]){if(!n)return res;inOrder(n.left,res);res.push(n.val);inOrder(n.right,res);return res;}
function findMin(node){while(node.left)node=node.left;return node;}
function deleteNode(root,val){if(!root)return null;if(val<root.val)root.left=deleteNode(root.left,val);else if(val>root.val)root.right=deleteNode(root.right,val);else{if(!root.left)return root.right;if(!root.right)return root.left;const s=findMin(root.right);root.val=s.val;root.right=deleteNode(root.right,s.val);}return root;}
let r=null;for(const v of[8,3,10,1,6,14,4,7,13])r=insert(r,v);
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('before',inOrder(r),[1,3,4,6,7,8,10,13,14]);r=deleteNode(r,3);test('del 3',inOrder(r),[1,4,6,7,8,10,13,14]);r=deleteNode(r,13);test('del 13',inOrder(r),[1,4,6,7,8,10,14]);r=deleteNode(r,10);test('del 10',inOrder(r),[1,4,6,7,8,14]);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Challenge — Full BST From Scratch

Empty shells. Write every function from memory:
- \`TreeNode\` class
- \`insert(root, val)\`
- \`search(root, val)\`
- \`findMin(node)\`
- \`deleteNode(root, val)\`
- \`inOrder(node)\`

Build the tree, run all 6 tests.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `class TreeNode {
  // val, left, right
}

function insert(root, val) { }
function search(root, val) { }
function findMin(node) { }
function deleteNode(root, val) { }
function inOrder(node, result = []) { }

// Build tree with [8,3,10,1,6,14,4,7,13]
let root = null;

const out = document.getElementById('out');
const results = [];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}\${p?'':' (want '+JSON.stringify(e)+')'}</div>\`;}

try {
  test('inOrder after inserts', inOrder(root), [1,3,4,6,7,8,10,13,14]);
  test('search 7 exists',       search(root, 7), true);
  test('search 5 missing',      search(root, 5), false);
  root = deleteNode(root, 3);
  test('del 3 (two children)',  inOrder(root), [1,4,6,7,8,10,13,14]);
  root = deleteNode(root, 13);
  test('del 13 (leaf)',         inOrder(root), [1,4,6,7,8,10,14]);
  root = deleteNode(root, 10);
  test('del 10 (one child)',    inOrder(root), [1,4,6,7,8,14]);
  const all = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all ? '✓ All tests pass. BST built from scratch.' : results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `class TreeNode{constructor(val){this.val=val;this.left=null;this.right=null;}}
function insert(root,val){if(!root)return new TreeNode(val);if(val<root.val)root.left=insert(root.left,val);else root.right=insert(root.right,val);return root;}
function search(root,val){while(root){if(val===root.val)return true;root=val<root.val?root.left:root.right;}return false;}
function findMin(node){while(node.left)node=node.left;return node;}
function deleteNode(root,val){if(!root)return null;if(val<root.val)root.left=deleteNode(root.left,val);else if(val>root.val)root.right=deleteNode(root.right,val);else{if(!root.left)return root.right;if(!root.right)return root.left;const s=findMin(root.right);root.val=s.val;root.right=deleteNode(root.right,s.val);}return root;}
function inOrder(node,result=[]){if(!node)return result;inOrder(node.left,result);result.push(node.val);inOrder(node.right,result);return result;}
let root=null;for(const v of[8,3,10,1,6,14,4,7,13])root=insert(root,v);
const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('inOrder after inserts',inOrder(root),[1,3,4,6,7,8,10,13,14]);test('search 7 exists',search(root,7),true);test('search 5 missing',search(root,5),false);root=deleteNode(root,3);test('del 3',inOrder(root),[1,4,6,7,8,10,13,14]);root=deleteNode(root,13);test('del 13',inOrder(root),[1,4,6,7,8,10,14]);root=deleteNode(root,10);test('del 10',inOrder(root),[1,4,6,7,8,14]);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 260,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Build a BST in Python',
        caption: 'Same algorithms in Python — then from scratch with opencalc tree visualization.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — TreeNode, insert, search',
              prose: [
                'Python uses `None` where JavaScript uses `null`. Everything else is identical — the BST invariant doesn\'t change between languages.',
                '`search()` is iterative: follow the invariant at each node until you find the value or fall off.',
              ],
              instructions: 'Implement TreeNode, insert(), and search(). Build the tree and pass all assertions.',
              code: `class TreeNode:
    def __init__(self, val):
        # TODO: self.val, self.left = None, self.right = None
        pass


def insert(root, val):
    # TODO: if root is None return TreeNode(val)
    # if val < root.val: root.left = insert(root.left, val)
    # else: root.right = insert(root.right, val)
    # return root
    pass


def search(root, val):
    # TODO: while root: if val == root.val return True; go left or right
    # return False
    pass


root = None
for v in [8, 3, 10, 1, 6, 14, 4, 7, 13]:
    root = insert(root, v)

assert root.val == 8
assert root.left.val == 3
assert root.right.val == 10
assert search(root, 7) == True
assert search(root, 5) == False
print("✓ insert and search")`,
              output: '✓ insert and search',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — in_order() and delete_node()',
              prose: [
                '`in_order()` returns a sorted list — it\'s a free sort because of the BST invariant.',
                '`delete_node()` handles the three cases. For two children: find the minimum of the right subtree, copy its value, delete it from the right subtree.',
              ],
              instructions: 'Implement in_order(), find_min(), and delete_node(). All assertions must pass.',
              code: `class TreeNode:
    def __init__(self, val):
        self.val = val; self.left = None; self.right = None

def insert(root, val):
    if root is None: return TreeNode(val)
    if val < root.val: root.left = insert(root.left, val)
    else: root.right = insert(root.right, val)
    return root

def in_order(node, result=None):
    if result is None: result = []
    # TODO: if not node return result
    # in_order(node.left, result)
    # result.append(node.val)
    # in_order(node.right, result)
    # return result
    pass

def find_min(node):
    # TODO: while node.left: node = node.left; return node
    pass

def delete_node(root, val):
    # TODO: if not root: return None
    # if val < root.val: root.left = delete_node(root.left, val)
    # elif val > root.val: root.right = delete_node(root.right, val)
    # else:
    #   if not root.left: return root.right
    #   if not root.right: return root.left
    #   succ = find_min(root.right)
    #   root.val = succ.val
    #   root.right = delete_node(root.right, succ.val)
    # return root
    pass

root = None
for v in [8, 3, 10, 1, 6, 14, 4, 7, 13]:
    root = insert(root, v)

assert in_order(root) == [1, 3, 4, 6, 7, 8, 10, 13, 14]
root = delete_node(root, 3)
assert in_order(root) == [1, 4, 6, 7, 8, 10, 13, 14]
root = delete_node(root, 13)
assert in_order(root) == [1, 4, 6, 7, 8, 10, 14]
root = delete_node(root, 10)
assert in_order(root) == [1, 4, 6, 7, 8, 14]
print("✓ in_order and delete_node")`,
              output: '✓ in_order and delete_node',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'From Scratch — Full BST + Tree Visualization',
              prose: [
                'Write every function from memory. When all assertions pass, opencalc draws the final BST state — each node as a point with arrows to its children.',
              ],
              instructions: 'Fill in all six functions. The figure draws the tree after deletions.',
              code: `from collections import deque
from opencalc import Figure

class TreeNode:
    def __init__(self, val):
        pass  # your code

def insert(root, val):
    pass  # your code

def search(root, val):
    pass  # your code

def in_order(node, result=None):
    pass  # your code

def find_min(node):
    pass  # your code

def delete_node(root, val):
    pass  # your code

# Assertions
root = None
for v in [8, 3, 10, 1, 6, 14, 4, 7, 13]:
    root = insert(root, v)

assert in_order(root) == [1, 3, 4, 6, 7, 8, 10, 13, 14]
assert search(root, 7) == True
assert search(root, 5) == False
root = delete_node(root, 3)
assert in_order(root) == [1, 4, 6, 7, 8, 10, 13, 14]
root = delete_node(root, 13)
assert in_order(root) == [1, 4, 6, 7, 8, 10, 14]
root = delete_node(root, 10)
assert in_order(root) == [1, 4, 6, 7, 8, 14]
print("All assertions passed!")

# Visualize final tree
fig = Figure()
fig.set_title("BST after deletions — in-order: " + str(in_order(root)))
positions = {}
queue = deque([(root, 0, 0, -4, 4)])
while queue:
    node, x, y, lo, hi = queue.popleft()
    if not node: continue
    positions[node.val] = (x, y)
    queue.append((node.left,  (lo+x)/2, y-1, lo, x))
    queue.append((node.right, (x+hi)/2, y-1, x, hi))

visited = set()
def draw_edges(node):
    if not node or node.val in visited: return
    visited.add(node.val)
    px, py = positions[node.val]
    if node.left and node.left.val in positions:
        cx, cy = positions[node.left.val]
        fig.arrow(px, py, cx-px, cy-py, color="#64748b")
    if node.right and node.right.val in positions:
        cx, cy = positions[node.right.val]
        fig.arrow(px, py, cx-px, cy-py, color="#64748b")
    draw_edges(node.left); draw_edges(node.right)
draw_edges(root)
for val, (x, y) in positions.items():
    fig.point(x, y, label=str(val), color="#60a5fa", size=8)
fig.show()`,
              output: 'All assertions passed!',
              status: 'idle',
              figureJson: null,
            },
          ],
        },
      },
    ],
  },
};
