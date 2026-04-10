export default {
  id: 'dsa4-001',
  slug: 'binary-trees',
  chapter: 'dsa4',
  order: 1,
  title: 'Binary Trees',
  subtitle: 'Every node has at most two children. That constraint unlocks logarithmic search, elegant recursion, and the structure behind every file system, compiler, and database index.',
  tags: ['binary tree', 'node', 'root', 'leaf', 'height', 'depth', 'inorder', 'preorder', 'postorder', 'BFS', 'DFS', 'traversal'],
  aliases: 'binary tree node root leaf height depth inorder preorder postorder BFS DFS traversal level order',

  hook: {
    question: 'A linked list is a tree with one child per node. What happens when each node can have two children — and how does that simple change make search logarithmically faster?',
    realWorldContext: 'File systems are trees — folders contain folders. HTML is a tree — elements nest inside elements. Every expression in code (`a + b * c`) is parsed into an AST (abstract syntax tree). Database B-trees store sorted records for O(log n) lookup. Decision trees power machine learning classifiers. The tree is the most important non-linear data structure in all of computing.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You\'ve mastered every linear structure and hash tables. Linear structures are great — but they\'re one-dimensional. A tree adds a second dimension: hierarchy. Each node can branch into children, and those children can branch further.',
      '**Anatomy of a binary tree.** Every node has a `val`, a `left` child (or null), and a `right` child (or null). The **root** is the top node — the entry point. A **leaf** is a node with no children. The **height** of a tree is the number of edges on the longest path from root to a leaf.',
      '**Three traversal orders.** You visit every node exactly once, but the order matters:\n- **Inorder (left → node → right):** visits nodes in sorted order for a BST\n- **Preorder (node → left → right):** visits root before children — used to copy or serialize a tree\n- **Postorder (left → right → node):** visits children before parent — used to delete a tree or evaluate expressions\n- **Level-order (BFS):** visits all nodes at depth 0, then depth 1, etc. Uses a queue.',
      '**Recursion is the natural fit.** A tree is a recursive structure — the left subtree is itself a tree, and so is the right. Every tree algorithm follows the same recursive skeleton: handle the null case, process the current node, recurse left, recurse right.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 4, Lesson 1: Trees',
        body: '**Previous chapter:** Hashing — O(1) lookup by key.\n**This lesson:** Binary Trees — hierarchical structure, recursive traversal.\n**Next:** Binary Search Trees — sorted trees for O(log n) search, insert, delete.',
      },
      {
        type: 'insight',
        title: 'All traversals are the same recursion, reordered',
        body: 'Preorder, inorder, and postorder differ only in where you place `process(node)` relative to the recursive calls. Move one line and you get a different traversal. This is why mastering one means you understand all three.',
      },
      {
        type: 'strategy',
        title: 'Tree recursion template',
        body: '```\nfunction solve(node):\n  if node is null: return base_value\n  left_result  = solve(node.left)\n  right_result = solve(node.right)\n  return combine(node.val, left_result, right_result)\n```\nHeight, sum, count, max depth — all follow this exact shape.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Tree Traversals: See the Order',
        mathBridge: 'Watch the traversal visit each node. The highlighted node is the current one being processed. Notice how inorder visits left first, then root, then right — reading a BST inorder gives sorted output.',
        caption: 'Same tree, four different visit orders.',
        props: {
          lesson: {
            title: 'Binary Tree Traversals',
            subtitle: 'Inorder, Preorder, Postorder, Level-Order.',
            sequential: false,
            cells: [
              {
                type: 'js',
                title: 'Traversal Order Visualizer',
                instruction: 'Click a traversal type to animate the visit order. The number inside each node shows when it gets visited (1 = first, 7 = last).\n\n**Inorder:** left→node→right. For a BST, this gives sorted output.\n**Preorder:** node→left→right. Root always first.\n**Postorder:** left→right→node. Root always last.\n**Level-order:** top to bottom, left to right.',
                html: `<div style="margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap">
  <button class="trav-btn" data-t="inorder"   style="padding:6px 14px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">Inorder</button>
  <button class="trav-btn" data-t="preorder"  style="padding:6px 14px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">Preorder</button>
  <button class="trav-btn" data-t="postorder" style="padding:6px 14px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">Postorder</button>
  <button class="trav-btn" data-t="level"     style="padding:6px 14px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">Level-Order</button>
</div>
<canvas id="c" width="620" height="240" style="display:block;width:100%;border-radius:6px;background:#0a0f1e"></canvas>
<div id="order" style="margin-top:8px;font-family:monospace;font-size:12px;color:#94a3b8;min-height:18px"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.trav-btn.active{background:#6d28d9;color:#fff;border-color:#6d28d9}`,
                startCode: `const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const PR = devicePixelRatio;
canvas.width = canvas.offsetWidth * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

// Tree: values and positions
//         4
//       /   \
//      2     6
//     / \   / \
//    1   3 5   7
const nodes = [
  { val:4, x:0.50, y:0.12, left:1, right:2 },
  { val:2, x:0.27, y:0.38, left:3, right:4 },
  { val:6, x:0.73, y:0.38, left:5, right:6 },
  { val:1, x:0.15, y:0.68, left:-1,right:-1 },
  { val:3, x:0.38, y:0.68, left:-1,right:-1 },
  { val:5, x:0.62, y:0.68, left:-1,right:-1 },
  { val:7, x:0.85, y:0.68, left:-1,right:-1 },
];

function getOrder(type) {
  const order = [];
  function inorder(i) { if(i<0)return; inorder(nodes[i].left); order.push(i); inorder(nodes[i].right); }
  function preorder(i) { if(i<0)return; order.push(i); preorder(nodes[i].left); preorder(nodes[i].right); }
  function postorder(i) { if(i<0)return; postorder(nodes[i].left); postorder(nodes[i].right); order.push(i); }
  function level() { const q=[0]; while(q.length){const i=q.shift();order.push(i);if(nodes[i].left>=0)q.push(nodes[i].left);if(nodes[i].right>=0)q.push(nodes[i].right);} }
  if(type==='inorder')   inorder(0);
  if(type==='preorder')  preorder(0);
  if(type==='postorder') postorder(0);
  if(type==='level')     level();
  return order;
}

let visitOrder = {};

function draw() {
  ctx.clearRect(0,0,W,H);
  // edges
  nodes.forEach((n,i) => {
    [n.left,n.right].forEach(ci => {
      if(ci<0)return;
      ctx.strokeStyle='#334155';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(n.x*W,n.y*H);ctx.lineTo(nodes[ci].x*W,nodes[ci].y*H);ctx.stroke();
    });
  });
  // nodes
  nodes.forEach((n,i) => {
    const visited = i in visitOrder;
    const rank = visitOrder[i];
    const r = 18;
    ctx.fillStyle = visited ? '#1e1b4b' : '#1e293b';
    ctx.strokeStyle = visited ? '#6366f1' : '#334155';
    ctx.lineWidth = visited ? 2 : 1;
    ctx.beginPath();ctx.arc(n.x*W,n.y*H,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle = visited ? '#a5b4fc' : '#64748b';
    ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(n.val, n.x*W, n.y*H);
    if(visited) {
      ctx.fillStyle='#f59e0b';ctx.font='9px monospace';
      ctx.fillText(rank, n.x*W+14, n.y*H-14);
    }
  });
}

function animate(order) {
  visitOrder = {};
  draw();
  order.forEach((nodeIdx, rank) => {
    setTimeout(() => {
      visitOrder[nodeIdx] = rank+1;
      draw();
      if(rank === order.length-1) {
        document.getElementById('order').textContent =
          'Visit order: ' + order.map(i=>nodes[i].val).join(' → ');
      }
    }, rank * 400);
  });
}

document.querySelectorAll('.trav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.trav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    animate(getOrder(btn.dataset.t));
  });
});

draw();`,
                outputHeight: 290,
              },
            ],
          },
        },
      },

      // ── JavaScript guided walkthrough ─────────────────────────────────────────
      {
        id: 'JSNotebook',
        title: 'Build Binary Tree Algorithms in JavaScript',
        caption: 'Build the Node class, implement all four traversals, then solve height and sum recursively.',
        props: {
          lesson: {
            title: 'Binary Trees in JavaScript',
            subtitle: 'Recursive structure. Recursive algorithms.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — TreeNode and Building a Tree

A tree node is simpler than a linked list node — same idea, just two children instead of one.

**Implement the \`TreeNode\` class:**
- \`this.val = val\`
- \`this.left = null\`
- \`this.right = null\`

Then build this tree manually by linking nodes:
\`\`\`
        4
       / \\
      2   6
     / \\ / \\
    1  3 5  7
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.info{color:#94a3b8;font-size:11px;margin:1px 0}`,
                startCode: `class TreeNode {
  constructor(val) {
    // TODO: store val, set left and right to null

  }
}

// ── Build the tree manually ────────────────────────────
//         4
//        / \\
//       2   6
//      / \\ / \\
//     1  3 5  7

const root = new TreeNode(4);
// TODO: create nodes for 2, 6, 1, 3, 5, 7
// TODO: link them: root.left = ..., root.right = ..., etc.

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

test('root.val', root?.val, 4);
test('root.left.val', root?.left?.val, 2);
test('root.right.val', root?.right?.val, 6);
test('root.left.left.val', root?.left?.left?.val, 1);
test('root.left.right.val', root?.left?.right?.val, 3);
test('root.right.left.val', root?.right?.left?.val, 5);
test('root.right.right.val', root?.right?.right?.val, 7);
test('leaves have no children', root?.left?.left?.left, null);`,
                solutionCode: `class TreeNode {
  constructor(val) { this.val=val; this.left=null; this.right=null; }
}
const root = new TreeNode(4);
root.left = new TreeNode(2); root.right = new TreeNode(6);
root.left.left = new TreeNode(1); root.left.right = new TreeNode(3);
root.right.left = new TreeNode(5); root.right.right = new TreeNode(7);
const out=document.getElementById('out');
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}</div>\`;}
test('root.val',root?.val,4);test('root.left.val',root?.left?.val,2);test('root.right.val',root?.right?.val,6);
test('root.left.left.val',root?.left?.left?.val,1);test('leaves have no children',root?.left?.left?.left,null);`,
                outputHeight: 200,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Inorder, Preorder, Postorder Traversal

All three traversals are the same recursive function — just the placement of \`result.push(node.val)\` changes.

**Implement all three:**

\`inorder(node, result)\`:
1. if node is null, return
2. recurse left
3. push node.val  ← process BETWEEN children
4. recurse right

\`preorder(node, result)\`:
1. if null, return
2. push node.val  ← process BEFORE children
3. recurse left
4. recurse right

\`postorder(node, result)\`:
1. if null, return
2. recurse left
3. recurse right
4. push node.val  ← process AFTER children`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `class TreeNode {
  constructor(val) { this.val=val; this.left=null; this.right=null; }
}

function inorder(node, result = []) {
  if (node === null) return result;
  // TODO: recurse left, push val, recurse right

  return result;
}

function preorder(node, result = []) {
  if (node === null) return result;
  // TODO: push val, recurse left, recurse right

  return result;
}

function postorder(node, result = []) {
  if (node === null) return result;
  // TODO: recurse left, recurse right, push val

  return result;
}

// ── Build tree and test ────────────────────────────────
//         4
//        / \\
//       2   6
//      / \\ / \\
//     1  3 5  7
const root = new TreeNode(4);
root.left=new TreeNode(2); root.right=new TreeNode(6);
root.left.left=new TreeNode(1); root.left.right=new TreeNode(3);
root.right.left=new TreeNode(5); root.right.right=new TreeNode(7);

const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: [\${got}]\${pass?'':' (expected ['+expected+'])'}</div>\`;
}

test('inorder',   inorder(root),   [1,2,3,4,5,6,7]);
test('preorder',  preorder(root),  [4,2,1,3,6,5,7]);
test('postorder', postorder(root), [1,3,2,5,7,6,4]);`,
                solutionCode: `class TreeNode { constructor(val){this.val=val;this.left=null;this.right=null;} }
function inorder(node,result=[]){if(!node)return result;inorder(node.left,result);result.push(node.val);inorder(node.right,result);return result;}
function preorder(node,result=[]){if(!node)return result;result.push(node.val);preorder(node.left,result);preorder(node.right,result);return result;}
function postorder(node,result=[]){if(!node)return result;postorder(node.left,result);postorder(node.right,result);result.push(node.val);return result;}
const root=new TreeNode(4);root.left=new TreeNode(2);root.right=new TreeNode(6);root.left.left=new TreeNode(1);root.left.right=new TreeNode(3);root.right.left=new TreeNode(5);root.right.right=new TreeNode(7);
const out=document.getElementById('out');
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: [\${got}]</div>\`;}
test('inorder',inorder(root),[1,2,3,4,5,6,7]);test('preorder',preorder(root),[4,2,1,3,6,5,7]);test('postorder',postorder(root),[1,3,2,5,7,6,4]);`,
                outputHeight: 150,
              },
              {
                type: 'js',
                instruction: `## Step 3 — Height, Sum, and Level-Order

**\`height(node)\`:** max depth from this node to a leaf.
- Base: null → return -1 (or 0 depending on convention — use -1 for edge count)
- Recursive: \`1 + Math.max(height(node.left), height(node.right))\`

**\`treeSum(node)\`:** sum of all values.
- Base: null → return 0
- Recursive: \`node.val + treeSum(node.left) + treeSum(node.right)\`

**\`levelOrder(root)\`:** BFS using a queue, return array of arrays (one per level).
- Use a queue (array with shift/push)
- Dequeue a node, push its value, enqueue its children
- Group by level using the queue size at the start of each level`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `class TreeNode { constructor(val){this.val=val;this.left=null;this.right=null;} }

function height(node) {
  // TODO: base case null → return -1
  // TODO: return 1 + Math.max(height(left), height(right))
}

function treeSum(node) {
  // TODO: base case null → return 0
  // TODO: return node.val + treeSum(left) + treeSum(right)
}

function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const level = [];
    const size = queue.length;  // snapshot: nodes at this level

    for (let i = 0; i < size; i++) {
      // TODO: dequeue (queue.shift()), push its val to level
      // TODO: if it has a left child, enqueue it
      // TODO: if it has a right child, enqueue it

    }

    result.push(level);
  }

  return result;
}

// ── Tree and tests ─────────────────────────────────────
const root = new TreeNode(4);
root.left=new TreeNode(2);root.right=new TreeNode(6);
root.left.left=new TreeNode(1);root.left.right=new TreeNode(3);
root.right.left=new TreeNode(5);root.right.right=new TreeNode(7);

const out = document.getElementById('out');
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;}

test('height',     height(root),     2);
test('height leaf',height(root.left.left), 0);
test('treeSum',    treeSum(root),    28);
test('levelOrder', levelOrder(root), [[4],[2,6],[1,3,5,7]]);`,
                solutionCode: `class TreeNode{constructor(val){this.val=val;this.left=null;this.right=null;}}
function height(node){if(!node)return -1;return 1+Math.max(height(node.left),height(node.right));}
function treeSum(node){if(!node)return 0;return node.val+treeSum(node.left)+treeSum(node.right);}
function levelOrder(root){if(!root)return[];const res=[],q=[root];while(q.length){const level=[],sz=q.length;for(let i=0;i<sz;i++){const n=q.shift();level.push(n.val);if(n.left)q.push(n.left);if(n.right)q.push(n.right);}res.push(level);}return res;}
const root=new TreeNode(4);root.left=new TreeNode(2);root.right=new TreeNode(6);root.left.left=new TreeNode(1);root.left.right=new TreeNode(3);root.right.left=new TreeNode(5);root.right.right=new TreeNode(7);
const out=document.getElementById('out');
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('height',height(root),2);test('treeSum',treeSum(root),28);test('levelOrder',levelOrder(root),[[4],[2,6],[1,3,5,7]]);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Challenge — All Algorithms From Scratch

Empty signatures. Write everything from memory:

- \`TreeNode\` class
- \`inorder(node)\`, \`preorder(node)\`, \`postorder(node)\`
- \`height(node)\`
- \`treeSum(node)\`
- \`levelOrder(root)\`

Build the same 7-node tree and pass all tests.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}
.section{color:#64748b;font-size:11px;margin-top:10px;border-top:1px solid #1e293b;padding-top:6px}
.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}
.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}
.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `class TreeNode {
  // val, left, right
}

function inorder(node, result = []) { }
function preorder(node, result = []) { }
function postorder(node, result = []) { }
function height(node) { }
function treeSum(node) { }
function levelOrder(root) { }

// ── Build tree ─────────────────────────────────────────
//         4
//        / \\
//       2   6
//      / \\ / \\
//     1  3 5  7

const root = null; // TODO: build the tree

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
const results = [];
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

try {
  out.innerHTML += '<div class="section">structure</div>';
  test('root.val', root?.val, 4);
  test('root.left.val', root?.left?.val, 2);
  test('root.right.right.val', root?.right?.right?.val, 7);

  out.innerHTML += '<div class="section">traversals</div>';
  test('inorder',   inorder(root),   [1,2,3,4,5,6,7]);
  test('preorder',  preorder(root),  [4,2,1,3,6,5,7]);
  test('postorder', postorder(root), [1,3,2,5,7,6,4]);

  out.innerHTML += '<div class="section">queries</div>';
  test('height',     height(root),     2);
  test('treeSum',    treeSum(root),    28);
  test('levelOrder', levelOrder(root), [[4],[2,6],[1,3,5,7]]);

  const all = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all
    ? '✓ All tests pass. Binary tree — built and traversed from scratch.'
    : results.filter(Boolean).length + '/' + results.length + ' passing.'
  }</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `class TreeNode{constructor(val){this.val=val;this.left=null;this.right=null;}}
function inorder(n,r=[]){if(!n)return r;inorder(n.left,r);r.push(n.val);inorder(n.right,r);return r;}
function preorder(n,r=[]){if(!n)return r;r.push(n.val);preorder(n.left,r);preorder(n.right,r);return r;}
function postorder(n,r=[]){if(!n)return r;postorder(n.left,r);postorder(n.right,r);r.push(n.val);return r;}
function height(n){if(!n)return -1;return 1+Math.max(height(n.left),height(n.right));}
function treeSum(n){if(!n)return 0;return n.val+treeSum(n.left)+treeSum(n.right);}
function levelOrder(root){if(!root)return[];const res=[],q=[root];while(q.length){const lv=[],sz=q.length;for(let i=0;i<sz;i++){const n=q.shift();lv.push(n.val);if(n.left)q.push(n.left);if(n.right)q.push(n.right);}res.push(lv);}return res;}
const root=new TreeNode(4);root.left=new TreeNode(2);root.right=new TreeNode(6);root.left.left=new TreeNode(1);root.left.right=new TreeNode(3);root.right.left=new TreeNode(5);root.right.right=new TreeNode(7);
const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
test('root.val',root?.val,4);test('inorder',inorder(root),[1,2,3,4,5,6,7]);test('preorder',preorder(root),[4,2,1,3,6,5,7]);test('postorder',postorder(root),[1,3,2,5,7,6,4]);
test('height',height(root),2);test('treeSum',treeSum(root),28);test('levelOrder',levelOrder(root),[[4],[2,6],[1,3,5,7]]);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 320,
              },
            ],
          },
        },
      },

      // ── Python guided walkthrough ─────────────────────────────────────────────
      {
        id: 'PythonNotebook',
        title: 'Build Binary Tree Algorithms in Python',
        caption: 'TreeNode class, all traversals, height, sum, and level-order — then from scratch with opencalc visualization.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — TreeNode and traversals',
              prose: [
                'Python tree recursion looks almost identical to JavaScript. The main difference: `None` instead of `null`.',
                'All three traversals are one function with three lines. Only the order of those lines changes.',
              ],
              instructions: `Implement TreeNode, inorder(), preorder(), and postorder(). Build the 7-node tree and pass all assertions.`,
              code: `class TreeNode:
    def __init__(self, val):
        # TODO: store val, left=None, right=None
        pass


def inorder(node, result=None):
    if result is None: result = []
    if node is None: return result
    # TODO: recurse left, append val, recurse right
    return result


def preorder(node, result=None):
    if result is None: result = []
    if node is None: return result
    # TODO: append val, recurse left, recurse right
    return result


def postorder(node, result=None):
    if result is None: result = []
    if node is None: return result
    # TODO: recurse left, recurse right, append val
    return result


# ── Build tree ─────────────────────────────────────────
#         4
#        / \\
#       2   6
#      / \\ / \\
#     1  3 5  7
root = TreeNode(4)
# TODO: build the full tree

# ── Assertions ─────────────────────────────────────────
assert root.val == 4
assert root.left.val == 2
assert root.right.val == 6

assert inorder(root)   == [1, 2, 3, 4, 5, 6, 7]
assert preorder(root)  == [4, 2, 1, 3, 6, 5, 7]
assert postorder(root) == [1, 3, 2, 5, 7, 6, 4]
print("✓ TreeNode and traversals")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — height(), tree_sum(), level_order()',
              prose: [
                '`height()` and `tree_sum()` follow the exact same recursive template — process this node using results from left and right subtrees.',
                '`level_order()` uses a queue. Python\'s `collections.deque` with `popleft()` is O(1) dequeue — use it instead of `list.pop(0)`.',
              ],
              instructions: `Implement height(), tree_sum(), and level_order(). All assertions must pass. Then the cell draws the tree using opencalc points and arrows.`,
              code: `from collections import deque
from opencalc import Figure, BLUE, GREEN, AMBER

class TreeNode:
    def __init__(self, val):
        self.val = val; self.left = None; self.right = None

def height(node):
    # TODO: None → -1, else 1 + max(height(left), height(right))
    pass

def tree_sum(node):
    # TODO: None → 0, else val + tree_sum(left) + tree_sum(right)
    pass

def level_order(root):
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        level, size = [], len(queue)
        for _ in range(size):
            # TODO: popleft(), append val, enqueue children
            pass
        result.append(level)
    return result

# ── Build tree ─────────────────────────────────────────
root = TreeNode(4)
root.left=TreeNode(2); root.right=TreeNode(6)
root.left.left=TreeNode(1); root.left.right=TreeNode(3)
root.right.left=TreeNode(5); root.right.right=TreeNode(7)

# ── Assertions ─────────────────────────────────────────
assert height(root) == 2,        f"height: {height(root)}"
assert height(root.left.left)==0, "leaf height"
assert tree_sum(root) == 28,     f"sum: {tree_sum(root)}"
assert level_order(root) == [[4],[2,6],[1,3,5,7]]
print("✓ height, tree_sum, level_order")

# ── Visualize tree structure ───────────────────────────
positions = {
    root:              (5, 4),
    root.left:         (2.5, 2.5),
    root.right:        (7.5, 2.5),
    root.left.left:    (1, 1),
    root.left.right:   (4, 1),
    root.right.left:   (6, 1),
    root.right.right:  (9, 1),
}
fig = Figure(xmin=0, xmax=10, ymin=0, ymax=5,
             width=420, height=220, title="Binary tree (inorder = sorted)")
fig.axes(labels=False, ticks=False)
edges = [
    (root, root.left), (root, root.right),
    (root.left, root.left.left), (root.left, root.left.right),
    (root.right, root.right.left), (root.right, root.right.right),
]
for parent, child in edges:
    px, py = positions[parent]
    cx, cy = positions[child]
    fig.arrow((px, py-0.2), (cx, cy+0.2), width=1)
for node, (x, y) in positions.items():
    is_root = node is root
    is_leaf = node.left is None and node.right is None
    color = AMBER if is_root else GREEN if is_leaf else BLUE
    fig.point((x, y), color=color, label=str(node.val), radius=20)
print(fig.show())`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Challenge — Full Binary Tree From Scratch in Python',
              prose: [
                'No fill-in-the-blank. Write TreeNode and every algorithm from memory.',
                'When all assertions pass, the cell draws the tree and prints its traversals side by side.',
              ],
              instructions: `Implement everything from scratch. All assertions must pass.`,
              code: `from collections import deque
from opencalc import Figure, BLUE, GREEN, AMBER, PURPLE

class TreeNode:
    def __init__(self, val):
        pass

def inorder(node, result=None):
    pass

def preorder(node, result=None):
    pass

def postorder(node, result=None):
    pass

def height(node):
    pass

def tree_sum(node):
    pass

def level_order(root):
    pass


# ── Build tree ─────────────────────────────────────────
root = None  # TODO: build the 7-node tree

# ── Assertions ─────────────────────────────────────────
assert root.val == 4
assert root.right.right.val == 7

assert inorder(root)   == [1, 2, 3, 4, 5, 6, 7]
assert preorder(root)  == [4, 2, 1, 3, 6, 5, 7]
assert postorder(root) == [1, 3, 2, 5, 7, 6, 4]
print("✓ traversals")

assert height(root) == 2
assert tree_sum(root) == 28
assert level_order(root) == [[4], [2, 6], [1, 3, 5, 7]]
print("✓ height, sum, level_order")

print()
print(f"Inorder:    {inorder(root)}")
print(f"Preorder:   {preorder(root)}")
print(f"Postorder:  {postorder(root)}")
print(f"Level-order:{level_order(root)}")
print(f"Height: {height(root)}, Sum: {tree_sum(root)}")

# ── Draw tree ──────────────────────────────────────────
nodes_list = [root, root.left, root.right,
              root.left.left, root.left.right,
              root.right.left, root.right.right]
positions  = [(5,4),(2.5,2.5),(7.5,2.5),(1,1),(4,1),(6,1),(9,1)]
edges_idx  = [(0,1),(0,2),(1,3),(1,4),(2,5),(2,6)]

fig = Figure(xmin=0, xmax=10, ymin=0, ymax=5,
             width=420, height=220,
             title="Your binary tree — built from scratch")
fig.axes(labels=False, ticks=False)
for pi, ci in edges_idx:
    px,py = positions[pi]; cx,cy = positions[ci]
    fig.arrow((px,py-0.2),(cx,cy+0.2),width=1)
for i,(node,(x,y)) in enumerate(zip(nodes_list,positions)):
    is_root = i==0; is_leaf = node.left is None and node.right is None
    color = AMBER if is_root else GREEN if is_leaf else BLUE
    fig.point((x,y), color=color, label=str(node.val), radius=20)
print(fig.show())`,
              output: '', status: 'idle', figureJson: null,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'Binary tree complexity:\n- All traversals (inorder/preorder/postorder/level-order): O(n) time, O(h) space where h = height\n- Height of balanced tree: O(log n)\n- Height of skewed tree (worst case): O(n)\n- height(), treeSum(): O(n) time — visits every node once',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Height determines everything',
        body: 'A balanced tree has height O(log n) — all recursive operations cost O(log n). A degenerate tree (every node has one child) has height O(n) — all operations cost O(n). Keeping a tree balanced is the entire motivation for AVL trees, red-black trees, and B-trees.',
      },
    ],
    visualizations: [],
  },

  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],

  challenges: [
    {
      id: 'dsa4-001-c1',
      title: 'Maximum Depth of Binary Tree',
      difficulty: 'medium',
      description: 'Return the maximum depth (number of nodes along the longest path from root to leaf). Note: this counts nodes, not edges — so a single-node tree has depth 1.',
      starterCode: `class TreeNode:
    def __init__(self, val): self.val=val; self.left=None; self.right=None

def max_depth(node):
    # TODO: None → 0 (counting nodes, not edges)
    # TODO: return 1 + max(max_depth(left), max_depth(right))
    pass

root = TreeNode(3)
root.left = TreeNode(9)
root.right = TreeNode(20)
root.right.left = TreeNode(15)
root.right.right = TreeNode(7)

print(max_depth(root))   # 3
print(max_depth(None))   # 0`,
      solution: `def max_depth(node):
    if node is None: return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))`,
      hint: 'Almost identical to height(), but count nodes not edges. The base case returns 0 (an empty tree has depth 0), and each node adds 1.',
    },
  ],
};
