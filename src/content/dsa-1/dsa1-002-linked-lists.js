export default {
  id: 'dsa1-002',
  slug: 'linked-lists',
  chapter: 'dsa1',
  order: 2,
  title: 'Linked Lists',
  subtitle: 'The first data structure you build from scratch. Nodes, pointers, and the tradeoffs that make linked lists powerful where arrays fail — and weak where arrays shine.',
  tags: ['linked list', 'node', 'pointer', 'singly linked', 'prepend', 'append', 'delete', 'traversal'],
  aliases: 'linked list singly linked doubly linked node next pointer head tail prepend append delete traverse',

  hook: {
    question: 'Arrays give you O(1) access to any element but O(n) insertion at the front. What if insertion at the front needed to be O(1) — even if you gave up random access to do it?',
    realWorldContext: 'The undo history in every text editor is a linked list. Your browser\'s back button traverses a linked list of pages. The Linux kernel\'s process scheduler uses a circular doubly linked list to track runnable tasks — when a process is added or removed, only pointer updates are needed, with no shifting of any array. Music players use circular linked lists for playlist looping. Hash tables use linked lists internally for collision chaining. The linked list is the data structure that teaches you what a pointer actually is — and once you understand pointers, you understand trees, graphs, and every complex structure that follows.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Arrays store elements contiguously — that\'s their power and their limitation. A linked list abandons contiguity entirely. Instead, each element (called a **node**) stores its value AND a pointer to the next node. The nodes can be scattered anywhere in memory. The structure is in the pointers, not the positions.',
      '**The Node:** The fundamental unit. A node holds two things: a `val` (the data) and a `next` pointer (the address of the next node, or `null` if this is the last node). That\'s it. Two fields. Everything a linked list does comes from this simple structure.',
      '**The Head:** The linked list itself just needs to remember one thing: the address of the first node, called the **head**. From the head, you can reach every other node by following `next` pointers. Lose the head pointer and the entire list is unreachable — orphaned in memory.',
      '**Prepend is O(1) — this is the payoff.** To add a node at the front: create a new node, set its `next` to the current head, update head to point at the new node. Three pointer operations. No shifting. No copying. It does not matter if the list has 1 element or 1,000,000 — prepend is always the same cost.',
      '**But append is O(n) unless you track the tail.** To append, you must find the last node — which means traversing every node until you reach one whose `next` is `null`. That\'s O(n). The fix: maintain a `tail` pointer alongside `head`. Then append is also O(1).',
      '**Access is O(n) — this is the cost.** To get the element at index 5, you must start at head and follow `next` five times. There is no formula. There is no shortcut. This is the fundamental tradeoff: you gained O(1) prepend but lost O(1) random access.',
      '**Deletion is the trickiest operation.** To delete a node, you need the node *before* it — so you can redirect its `next` pointer to skip the deleted node. This means traversal. Handle the head separately: deleting the head just means updating the head pointer.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of Linear Structures',
        body: '**Previous:** Arrays — contiguous memory, O(1) access, O(n) insert.\n**This lesson:** Linked Lists — O(1) prepend, O(n) access, scattered memory.\n**Next:** Stacks & Queues — built on top of both structures.',
      },
      {
        type: 'insight',
        title: 'The core tradeoff in one line',
        body: 'Array: O(1) access, O(n) insert/delete at front.\nLinked list: O(n) access, O(1) insert/delete at front.\nNeither is universally better. Choose based on your access pattern.',
      },
      {
        type: 'warning',
        title: 'Never lose the head',
        body: 'If you overwrite the head pointer before unlinking the rest of the list, you have a memory leak — all the nodes are orphaned with no way to reach or free them. Always save the reference you need before updating pointers.',
      },
      {
        type: 'strategy',
        title: 'Draw the pointers before you code',
        body: 'Linked list bugs are almost always pointer bugs. Before writing delete() or insert(), draw boxes for each node and arrows for each pointer. Draw the state BEFORE and AFTER the operation. Then translate the arrows into code.',
      },
    ],
    visualizations: [
      // ── Concept: what a linked list looks like ───────────────────────────────
      {
        id: 'ScienceNotebook',
        title: 'What a Linked List Looks Like in Memory',
        mathBridge: 'These two concept cells show the structure before you build it. Then the JavaScript and Python notebooks have you build the real implementation from scratch.',
        caption: 'Notice how the nodes are scattered in memory — only the pointers give the list its structure.',
        props: {
          lesson: {
            title: 'Linked List: Structure & Tradeoffs',
            subtitle: 'See it before you build it.',
            sequential: false,
            cells: [
              {
                type: 'js',
                title: 'Nodes, Pointers & the Head',
                instruction: 'Each box is a **node** in memory — it can be anywhere. The arrows are **pointers** (memory addresses stored inside each node). The `head` is the only entry point to the whole list.\n\nClick a node to highlight it and see what it stores.',
                html: `<canvas id="c" width="660" height="240" style="display:block;width:100%;border-radius:8px"></canvas>
<div id="info" style="margin-top:8px;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;font-family:monospace;font-size:12px;color:#94a3b8;min-height:36px"></div>`,
                css: `body{margin:0;padding:10px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const PR     = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;
const info = document.getElementById('info');

// Nodes at irregular memory addresses (scattered)
const nodes = [
  { val: 12, addr: '0x3A10', nextAddr: '0x1F88', x: 80,  y: 80  },
  { val: 7,  addr: '0x1F88', nextAddr: '0x4C20', x: 260, y: 140 },
  { val: 43, addr: '0x4C20', nextAddr: '0x2B04', x: 440, y: 70  },
  { val: 5,  addr: '0x2B04', nextAddr: 'null',   x: 600, y: 150 },
];

const BOX_W = 84, BOX_H = 52, SEL = { i: -1 };

function drawArrow(x1, y1, x2, y2, color) {
  const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy);
  if (len < 2) return;
  const ux = dx/len, uy = dy/len;
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2-ux*8,y2-uy*8); ctx.stroke();
  const px = -uy*5, py = ux*5;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x2,y2);
  ctx.lineTo(x2-ux*12+px,y2-uy*12+py);
  ctx.lineTo(x2-ux*12-px,y2-uy*12-py);
  ctx.closePath(); ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Draw pointer arrows between nodes
  nodes.forEach((n, i) => {
    if (i < nodes.length - 1) {
      const nx = nodes[i+1];
      drawArrow(n.x + BOX_W, n.y + BOX_H/2, nx.x, nx.y + BOX_H/2, '#6366f1');
    }
  });

  // Draw null terminator
  const last = nodes[nodes.length-1];
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(last.x + BOX_W, last.y + BOX_H/2);
  ctx.lineTo(last.x + BOX_W + 50, last.y + BOX_H/2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#475569'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
  ctx.fillText('null', last.x + BOX_W + 54, last.y + BOX_H/2 + 4);

  // Draw HEAD label
  const first = nodes[0];
  drawArrow(first.x - 60, first.y + BOX_H/2, first.x, first.y + BOX_H/2, '#4ade80');
  ctx.fillStyle = '#4ade80'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'right';
  ctx.fillText('head', first.x - 64, first.y + BOX_H/2 + 4);

  // Draw nodes
  nodes.forEach((n, i) => {
    const sel = i === SEL.i;
    ctx.fillStyle   = sel ? '#1e1b4b' : '#1e293b';
    ctx.strokeStyle = sel ? '#818cf8' : '#334155';
    ctx.lineWidth   = sel ? 2.5 : 1.5;
    ctx.beginPath(); ctx.roundRect(n.x, n.y, BOX_W, BOX_H, 6); ctx.fill(); ctx.stroke();

    // val | next sections
    ctx.strokeStyle = sel ? '#4b5563' : '#334155'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(n.x+44, n.y); ctx.lineTo(n.x+44, n.y+BOX_H); ctx.stroke();

    ctx.fillStyle = sel ? '#a5b4fc' : '#e2e8f0';
    ctx.font = \`bold 16px monospace\`; ctx.textAlign = 'center';
    ctx.fillText(n.val, n.x+22, n.y+BOX_H/2+6);

    ctx.fillStyle = '#6366f1'; ctx.font = '8px monospace';
    ctx.fillText('next', n.x+BOX_W-20, n.y+BOX_H/2+3);

    ctx.fillStyle = '#475569'; ctx.font = '8px monospace';
    ctx.fillText(n.addr, n.x+BOX_W/2, n.y+BOX_H+12);
  });
}

canvas.addEventListener('click', e => {
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  SEL.i = -1;
  nodes.forEach((n, i) => {
    if (mx >= n.x && mx <= n.x+BOX_W && my >= n.y && my <= n.y+BOX_H) SEL.i = i;
  });
  draw();
  if (SEL.i >= 0) {
    const n = nodes[SEL.i];
    info.innerHTML =
      \`Node at <span style="color:#818cf8">\${n.addr}</span>: &nbsp;\` +
      \`val = <span style="color:#e2e8f0;font-weight:bold">\${n.val}</span> &nbsp;|\` +
      \`&nbsp; next = <span style="color:#6366f1">\${n.nextAddr}</span>\` +
      (SEL.i === 0 ? \` &nbsp;<span style="color:#4ade80">← head points here</span>\` : '');
  } else {
    info.textContent = 'Click any node to inspect it.';
  }
});

draw();
info.textContent = 'Click any node to inspect it.';
`,
                outputHeight: 320,
              },

              {
                type: 'js',
                title: 'Array vs Linked List — Side by Side',
                instruction: 'Both store the same values. The difference is in memory layout and what operations cost.\n\nClick **Insert at Front** on each side. Count the steps.',
                html: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
  <div>
    <div style="color:#38bdf8;font-family:monospace;font-size:11px;font-weight:bold;margin-bottom:6px">ARRAY — contiguous</div>
    <canvas id="ca" width="300" height="100" style="display:block;width:100%;border-radius:6px"></canvas>
    <button id="ins-arr" style="margin-top:6px;width:100%;padding:7px;border-radius:6px;border:none;background:#1e293b;border:1px solid #334155;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Insert 99 at front</button>
    <div id="arr-cost" style="font-family:monospace;font-size:11px;color:#f87171;margin-top:4px;min-height:16px"></div>
  </div>
  <div>
    <div style="color:#4ade80;font-family:monospace;font-size:11px;font-weight:bold;margin-bottom:6px">LINKED LIST — scattered</div>
    <canvas id="cl" width="300" height="100" style="display:block;width:100%;border-radius:6px"></canvas>
    <button id="ins-ll" style="margin-top:6px;width:100%;padding:7px;border-radius:6px;border:none;background:#1e293b;border:1px solid #334155;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer">Prepend 99</button>
    <div id="ll-cost" style="font-family:monospace;font-size:11px;color:#4ade80;margin-top:4px;min-height:16px"></div>
  </div>
</div>`,
                css: `body{margin:0;padding:10px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
function setupCanvas(id) {
  const c = document.getElementById(id);
  const pr = devicePixelRatio;
  c.width  = c.offsetWidth  * pr;
  c.height = c.offsetHeight * pr;
  const ctx = c.getContext('2d');
  ctx.scale(pr, pr);
  return { ctx, W: c.offsetWidth, H: c.offsetHeight };
}

let arrData = [12, 7, 43, 5];
let llData  = [12, 7, 43, 5];

function drawArr(highlight = []) {
  const {ctx, W, H} = setupCanvas('ca');
  ctx.clearRect(0,0,W,H);
  const cw = Math.floor((W-20)/arrData.length);
  const cy = (H-48)/2;
  arrData.forEach((v,i) => {
    const x = 10 + i*cw;
    const hl = highlight.includes(i);
    ctx.fillStyle = hl ? '#450a0a' : '#1e293b';
    ctx.strokeStyle = hl ? '#f87171' : '#334155'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(x+1,cy,cw-2,48,4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hl ? '#f87171' : '#94a3b8';
    ctx.font = \`\${hl?'bold ':''}14px monospace\`; ctx.textAlign = 'center';
    ctx.fillText(v, x+cw/2, cy+30);
    ctx.fillStyle='#475569';ctx.font='8px monospace';
    ctx.fillText(\`[\${i}]\`,x+cw/2,cy+48+10);
  });
}

function drawLL() {
  const {ctx, W, H} = setupCanvas('cl');
  ctx.clearRect(0,0,W,H);
  const bw=48, gap=20, tot=(bw+gap)*llData.length - gap;
  const sx=(W-tot)/2, cy=(H-44)/2;
  llData.forEach((v,i) => {
    const x=sx+i*(bw+gap);
    ctx.fillStyle='#052e16';ctx.strokeStyle='#4ade80';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(x,cy,bw,44,4);ctx.fill();ctx.stroke();
    ctx.fillStyle='#4ade80';ctx.font='bold 13px monospace';ctx.textAlign='center';
    ctx.fillText(v,x+bw/2,cy+28);
    if(i<llData.length-1){
      ctx.strokeStyle='#6366f1';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x+bw,cy+22);ctx.lineTo(x+bw+gap,cy+22);ctx.stroke();
      ctx.fillStyle='#6366f1';
      ctx.beginPath();ctx.moveTo(x+bw+gap,cy+22);ctx.lineTo(x+bw+gap-6,cy+18);ctx.lineTo(x+bw+gap-6,cy+26);ctx.fill();
    }
  });
}

drawArr(); drawLL();

document.getElementById('ins-arr').addEventListener('click', async () => {
  const shifts = arrData.length;
  arrData = [99, ...arrData];
  for (let k = arrData.length-1; k >= 0; k--) {
    drawArr(Array.from({length:arrData.length-k},(_,i)=>i+k));
    await new Promise(r=>setTimeout(r,120));
  }
  drawArr([0]);
  document.getElementById('arr-cost').textContent = \`Shifted \${shifts} elements — O(n)\`;
});

document.getElementById('ins-ll').addEventListener('click', () => {
  llData = [99, ...llData];
  drawLL();
  document.getElementById('ll-cost').textContent = \`Updated 1 pointer — O(1)\`;
});
`,
                outputHeight: 220,
              },
            ],
          },
        },
      },

      // ── JavaScript hands-on coding ────────────────────────────────────────────
      {
        id: 'JSNotebook',
        title: 'Build a Linked List in JavaScript',
        caption: 'You write the implementation. The visualization renders your list live in the browser as you code.',
        props: {
          lesson: {
            title: 'Linked List in JavaScript',
            subtitle: 'Type the implementation. Watch your nodes appear.',
            cells: [
              // ── JS Cell 1: Node class ─────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 1 — The Node Class

Every linked list is built from nodes. A node is the smallest building block: it holds a **value** and a **pointer** to the next node.

Your task: complete the \`Node\` constructor so it stores \`val\` in \`this.val\` and sets \`this.next\` to \`null\`.

When it works, you'll see the two nodes and the pointer between them rendered below.`,
                html: `<div id="out" style="padding:8px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}
.node{display:inline-flex;border:2px solid #6366f1;border-radius:6px;overflow:hidden;margin:2px}
.val{padding:8px 14px;background:#1e1b4b;color:#a5b4fc;font-weight:bold;font-size:15px}
.nxt{padding:8px 10px;background:#0f172a;color:#6366f1;font-size:11px;border-left:1px solid #4b5563}
.arrow{display:inline-block;color:#6366f1;margin:0 4px;font-size:18px;vertical-align:middle}
.null{display:inline-block;color:#475569;font-style:italic;font-size:13px;vertical-align:middle;margin-left:4px}
.ok{color:#4ade80;margin-top:8px;font-size:12px}
.err{color:#f87171;margin-top:8px;font-size:12px}`,
                startCode: `class Node {
  constructor(val) {
    // TODO: store the value in this.val
    // TODO: set this.next to null (no next node yet)

  }
}

// ── Test your Node ─────────────────────────────────────
const a = new Node(12);
const b = new Node(7);
a.next = b;           // link a → b manually

// ── Render (already written for you) ──────────────────
const out = document.getElementById('out');

function renderNode(n) {
  return \`<span class="node">
    <span class="val">\${n.val}</span>
    <span class="nxt">next</span>
  </span>\`;
}

function renderList(head) {
  let html = '', cur = head;
  while (cur) {
    html += renderNode(cur);
    html += cur.next ? '<span class="arrow">→</span>' : '<span class="null">→ null</span>';
    cur = cur.next;
  }
  return html;
}

try {
  const listHtml = renderList(a);
  const check = a.val === 12 && b.val === 7 && a.next === b && b.next === null;
  out.innerHTML = listHtml +
    (check
      ? '<div class="ok">✓ Node class works! a.val=12, b.val=7, a.next→b, b.next=null</div>'
      : '<div class="err">✗ Check your constructor — this.val and this.next must be set</div>');
} catch(e) {
  out.innerHTML = '<div class="err">Error: ' + e.message + '</div>';
}`,
                solutionCode: `class Node {
  constructor(val) {
    this.val  = val;    // store the value
    this.next = null;   // no next node yet
  }
}

const a = new Node(12);
const b = new Node(7);
a.next = b;

const out = document.getElementById('out');

function renderNode(n) {
  return \`<span class="node">
    <span class="val">\${n.val}</span>
    <span class="nxt">next</span>
  </span>\`;
}

function renderList(head) {
  let html = '', cur = head;
  while (cur) {
    html += renderNode(cur);
    html += cur.next ? '<span class="arrow">→</span>' : '<span class="null">→ null</span>';
    cur = cur.next;
  }
  return html;
}

out.innerHTML = renderList(a) + '<div class="ok">✓ Node class works!</div>';`,
                outputHeight: 140,
                check: (_code, logs, _html) => {
                  // Look for the success message appearing
                  return _html && _html.includes('✓ Node class works');
                },
                successMessage: '✓ Your Node stores val and sets next=null.',
                failMessage: '✗ Make sure constructor sets this.val = val and this.next = null.',
              },

              // ── JS Cell 2: LinkedList with append ────────────────────────────
              {
                type: 'js',
                instruction: `## Step 2 — The LinkedList: append()

Now build the list itself. A \`LinkedList\` tracks one thing: the \`head\` node (first node).

**Implement \`append(val)\`:**
- If the list is empty (\`this.head === null\`), the new node becomes the head
- Otherwise, **walk to the last node** (where \`node.next === null\`), then set \`node.next\` to the new node

When correct, clicking **Append** will add nodes and your linked list will render live.`,
                html: `<div style="margin-bottom:8px;display:flex;gap:8px;align-items:center">
  <button id="btn-app" style="padding:7px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Append</button>
  <button id="btn-rst" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
  <span id="status" style="font-family:monospace;font-size:11px;color:#64748b"></span>
</div>
<div id="list-view" style="min-height:52px;padding:4px 0"></div>
<div id="msg" style="font-family:monospace;font-size:12px;margin-top:8px;min-height:18px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.node{display:inline-flex;border:2px solid #6366f1;border-radius:6px;overflow:hidden;margin:2px;animation:pop .2s ease}
.val{padding:8px 14px;background:#1e1b4b;color:#a5b4fc;font-weight:bold;font-size:15px}
.nxt{padding:8px 8px;background:#0f172a;color:#6366f1;font-size:10px;border-left:1px solid #4b5563}
.arrow{display:inline-block;color:#6366f1;margin:0 3px;font-size:16px;vertical-align:middle}
.null{display:inline-block;color:#475569;font-style:italic;font-size:12px;vertical-align:middle}
@keyframes pop{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}`,
                startCode: `class Node {
  constructor(val) {
    this.val  = val;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  append(val) {
    const newNode = new Node(val);
    // TODO: if head is null, set this.head = newNode and return

    // TODO: otherwise, walk to the last node
    //   let cur = this.head;
    //   while (cur.next !== null) { cur = cur.next; }
    //   cur.next = newNode;

  }
}

// ── Render helper (don't edit this) ───────────────────
function renderList(list) {
  const view = document.getElementById('list-view');
  if (!list.head) { view.innerHTML = '<span style="color:#475569">(empty)</span>'; return; }
  let html = '', cur = list.head;
  while (cur) {
    html += \`<span class="node"><span class="val">\${cur.val}</span><span class="nxt">next</span></span>\`;
    html += cur.next ? '<span class="arrow">→</span>' : '<span class="null">→ null</span>';
    cur = cur.next;
  }
  view.innerHTML = html;
}

// ── Wire up buttons ────────────────────────────────────
const list = new LinkedList();
let counter = 1;
const VALUES = [12, 7, 43, 5, 28, 91];

document.getElementById('btn-app').addEventListener('click', () => {
  const val = VALUES[(counter - 1) % VALUES.length];
  counter++;
  try {
    list.append(val);
    renderList(list);
    // Count nodes
    let n = 0, c = list.head; while(c) { n++; c = c.next; }
    document.getElementById('status').textContent = \`size = \${n}\`;
    document.getElementById('msg').style.color = '#4ade80';
    document.getElementById('msg').textContent = \`Appended \${val} ✓\`;
  } catch(e) {
    document.getElementById('msg').style.color = '#f87171';
    document.getElementById('msg').textContent = 'Error: ' + e.message;
  }
});

document.getElementById('btn-rst').addEventListener('click', () => {
  list.head = null; counter = 1;
  document.getElementById('status').textContent = '';
  document.getElementById('msg').textContent = '';
  renderList(list);
});

renderList(list);`,
                solutionCode: `class Node {
  constructor(val) { this.val = val; this.next = null; }
}

class LinkedList {
  constructor() { this.head = null; }

  append(val) {
    const newNode = new Node(val);
    if (this.head === null) { this.head = newNode; return; }
    let cur = this.head;
    while (cur.next !== null) cur = cur.next;
    cur.next = newNode;
  }
}

function renderList(list) {
  const view = document.getElementById('list-view');
  if (!list.head) { view.innerHTML = '<span style="color:#475569">(empty)</span>'; return; }
  let html = '', cur = list.head;
  while (cur) {
    html += \`<span class="node"><span class="val">\${cur.val}</span><span class="nxt">next</span></span>\`;
    html += cur.next ? '<span class="arrow">→</span>' : '<span class="null">→ null</span>';
    cur = cur.next;
  }
  view.innerHTML = html;
}

const list = new LinkedList();
let counter = 1;
const VALUES = [12, 7, 43, 5, 28, 91];

document.getElementById('btn-app').addEventListener('click', () => {
  const val = VALUES[(counter-1) % VALUES.length];
  counter++;
  list.append(val);
  renderList(list);
  let n=0,c=list.head; while(c){n++;c=c.next;}
  document.getElementById('status').textContent = \`size = \${n}\`;
  document.getElementById('msg').style.color='#4ade80';
  document.getElementById('msg').textContent = \`Appended \${val} ✓\`;
});

document.getElementById('btn-rst').addEventListener('click', () => {
  list.head=null;counter=1;
  document.getElementById('status').textContent='';
  document.getElementById('msg').textContent='';
  renderList(list);
});
renderList(list);`,
                outputHeight: 170,
              },

              // ── JS Cell 3: prepend ────────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 3 — prepend(val): O(1) insert at front

This is the operation where linked lists beat arrays. To prepend:
1. Create a new node
2. Set \`newNode.next = this.head\` (new node points at old head)
3. Set \`this.head = newNode\` (head now points at new node)

**That's it. Three lines. No traversal. O(1) regardless of list size.**

Also implement \`toArray()\` — traverse the list and return all values as a JS array. You'll need this pattern constantly.`,
                html: `<div style="margin-bottom:8px;display:flex;gap:8px;flex-wrap:wrap">
  <button id="btn-pre" style="padding:7px 14px;border-radius:6px;border:none;background:#0d9488;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Prepend</button>
  <button id="btn-app" style="padding:7px 14px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Append</button>
  <button id="btn-rst" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
</div>
<div id="list-view" style="min-height:52px;padding:4px 0"></div>
<div id="arr-view" style="font-family:monospace;font-size:11px;color:#64748b;margin-top:4px"></div>
<div id="msg" style="font-family:monospace;font-size:12px;color:#4ade80;margin-top:6px;min-height:18px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.node{display:inline-flex;border:2px solid #6366f1;border-radius:6px;overflow:hidden;margin:2px;animation:pop .2s ease}
.node.new{border-color:#2dd4bf}
.val{padding:8px 14px;background:#1e1b4b;color:#a5b4fc;font-weight:bold;font-size:15px}
.nxt{padding:8px 8px;background:#0f172a;color:#6366f1;font-size:10px;border-left:1px solid #4b5563}
.arrow{display:inline-block;color:#6366f1;margin:0 3px;font-size:16px;vertical-align:middle}
.null{display:inline-block;color:#475569;font-style:italic;font-size:12px;vertical-align:middle}
@keyframes pop{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}`,
                startCode: `class Node {
  constructor(val) { this.val = val; this.next = null; }
}

class LinkedList {
  constructor() { this.head = null; }

  append(val) {
    const n = new Node(val);
    if (!this.head) { this.head = n; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = n;
  }

  prepend(val) {
    // TODO: create a new node
    // TODO: set newNode.next = this.head
    // TODO: set this.head = newNode

  }

  toArray() {
    const result = [];
    // TODO: walk from head to null, pushing each val into result
    // Hint: let cur = this.head; while (cur) { ... cur = cur.next; }
    return result;
  }
}

// ── Render (don't edit) ───────────────────────────────
let newHead = null;
function renderList(list, highlightHead = false) {
  const view = document.getElementById('list-view');
  const arrView = document.getElementById('arr-view');
  if (!list.head) { view.innerHTML = '<span style="color:#475569">(empty)</span>'; arrView.textContent=''; return; }
  let html = '', cur = list.head, first = true;
  while (cur) {
    const isNew = first && highlightHead;
    html += \`<span class="node\${isNew?' new':''}">\` +
            \`<span class="val">\${cur.val}</span><span class="nxt">next</span></span>\`;
    html += cur.next ? '<span class="arrow">→</span>' : '<span class="null">→ null</span>';
    cur = cur.next; first = false;
  }
  view.innerHTML = html;
  try { arrView.textContent = 'toArray() → ' + JSON.stringify(list.toArray()); } catch(e) { arrView.textContent = ''; }
}

const list = new LinkedList();
const MSG = document.getElementById('msg');
[12, 7, 43].forEach(v => list.append(v));
renderList(list);

document.getElementById('btn-pre').addEventListener('click', () => {
  try {
    list.prepend(99);
    renderList(list, true);
    MSG.style.color='#2dd4bf'; MSG.textContent='Prepended 99 at front — O(1) ✓';
  } catch(e) { MSG.style.color='#f87171'; MSG.textContent='Error: '+e.message; }
});
document.getElementById('btn-app').addEventListener('click', () => {
  list.append(55); renderList(list);
  MSG.style.color='#a78bfa'; MSG.textContent='Appended 55 at end';
});
document.getElementById('btn-rst').addEventListener('click', () => {
  list.head=null; [12,7,43].forEach(v=>list.append(v)); renderList(list); MSG.textContent='';
});`,
                solutionCode: `class Node {
  constructor(val) { this.val = val; this.next = null; }
}
class LinkedList {
  constructor() { this.head = null; }
  append(val) {
    const n = new Node(val);
    if (!this.head) { this.head = n; return; }
    let cur = this.head; while (cur.next) cur = cur.next; cur.next = n;
  }
  prepend(val) {
    const n = new Node(val);
    n.next = this.head;
    this.head = n;
  }
  toArray() {
    const r = []; let cur = this.head;
    while (cur) { r.push(cur.val); cur = cur.next; }
    return r;
  }
}
function renderList(list, hl=false) {
  const view=document.getElementById('list-view');
  const av=document.getElementById('arr-view');
  if(!list.head){view.innerHTML='<span style="color:#475569">(empty)</span>';av.textContent='';return;}
  let html='',cur=list.head,first=true;
  while(cur){
    html+=\`<span class="node\${first&&hl?' new':''}"><span class="val">\${cur.val}</span><span class="nxt">next</span></span>\`;
    html+=cur.next?'<span class="arrow">→</span>':'<span class="null">→ null</span>';
    cur=cur.next;first=false;
  }
  view.innerHTML=html;
  av.textContent='toArray() → '+JSON.stringify(list.toArray());
}
const list=new LinkedList();
[12,7,43].forEach(v=>list.append(v));renderList(list);
document.getElementById('btn-pre').addEventListener('click',()=>{list.prepend(99);renderList(list,true);document.getElementById('msg').style.color='#2dd4bf';document.getElementById('msg').textContent='Prepended 99 ✓';});
document.getElementById('btn-app').addEventListener('click',()=>{list.append(55);renderList(list);});
document.getElementById('btn-rst').addEventListener('click',()=>{list.head=null;[12,7,43].forEach(v=>list.append(v));renderList(list);document.getElementById('msg').textContent='';});`,
                outputHeight: 180,
              },

              // ── JS Cell 4: delete ─────────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 4 — delete(val): Rewire the Pointers

Deletion is the trickiest operation. You need the node **before** the target so you can redirect its \`next\` pointer to skip it.

**The algorithm:**
1. **Special case:** if \`this.head.val === val\`, set \`this.head = this.head.next\` and return
2. **General case:** walk with two pointers — \`prev\` and \`cur\`
3. When \`cur.val === val\`, set \`prev.next = cur.next\` — this skips \`cur\`

**Draw it first:** Before coding, draw the boxes and arrows for a 3-node list and show what changes when you delete the middle node.`,
                html: `<div id="list-view" style="min-height:52px;padding:4px 0"></div>
<div style="margin:8px 0;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
  <span style="color:#64748b;font-family:monospace;font-size:12px">Delete val:</span>
  <input id="del-val" type="number" value="7" style="width:56px;padding:5px 8px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:12px">
  <button id="btn-del" style="padding:7px 14px;border-radius:6px;border:none;background:#b91c1c;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Delete →</button>
  <button id="btn-rst" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
</div>
<div id="msg" style="font-family:monospace;font-size:12px;min-height:18px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.node{display:inline-flex;border:2px solid #6366f1;border-radius:6px;overflow:hidden;margin:2px}
.node.del{border-color:#f87171;opacity:.4;text-decoration:line-through}
.val{padding:8px 14px;background:#1e1b4b;color:#a5b4fc;font-weight:bold;font-size:15px}
.nxt{padding:8px 8px;background:#0f172a;color:#6366f1;font-size:10px;border-left:1px solid #4b5563}
.arrow{display:inline-block;color:#6366f1;margin:0 3px;font-size:16px;vertical-align:middle}
.null{display:inline-block;color:#475569;font-style:italic;font-size:12px;vertical-align:middle}`,
                startCode: `class Node {
  constructor(val) { this.val = val; this.next = null; }
}
class LinkedList {
  constructor() { this.head = null; }
  append(val) {
    const n = new Node(val);
    if (!this.head) { this.head = n; return; }
    let cur = this.head; while (cur.next) cur = cur.next; cur.next = n;
  }
  prepend(val) {
    const n = new Node(val); n.next = this.head; this.head = n;
  }
  toArray() {
    const r = []; let cur = this.head; while (cur) { r.push(cur.val); cur = cur.next; } return r;
  }

  delete(val) {
    if (!this.head) return;

    // TODO: Special case — deleting the head
    // if (this.head.val === val) {
    //   ???
    //   return;
    // }

    // TODO: General case — walk with prev and cur
    // let prev = this.head;
    // let cur  = this.head.next;
    // while (cur) {
    //   if (cur.val === val) {
    //     prev.next = ???;   // skip cur
    //     return;
    //   }
    //   prev = cur;
    //   cur  = cur.next;
    // }
  }
}

// ── Render (don't edit) ───────────────────────────────
function renderList(list, deletedVal = null) {
  const view = document.getElementById('list-view');
  if (!list.head) { view.innerHTML = '<span style="color:#475569">(empty)</span>'; return; }
  let html = '', cur = list.head;
  while (cur) {
    const isDel = cur.val === deletedVal;
    html += \`<span class="node\${isDel?' del':''}">\` +
            \`<span class="val">\${cur.val}</span><span class="nxt">next</span></span>\`;
    html += cur.next ? '<span class="arrow">→</span>' : '<span class="null">→ null</span>';
    cur = cur.next;
  }
  view.innerHTML = html;
}

const list = new LinkedList();
const MSG = document.getElementById('msg');
[12, 7, 43, 5, 28].forEach(v => list.append(v));
renderList(list);

document.getElementById('btn-del').addEventListener('click', () => {
  const val = parseInt(document.getElementById('del-val').value);
  const before = list.toArray();
  list.delete(val);
  const after = list.toArray();
  if (after.length < before.length) {
    MSG.style.color = '#4ade80';
    MSG.textContent = \`Deleted \${val} ✓ — \${JSON.stringify(after)}\`;
  } else {
    MSG.style.color = '#f87171';
    MSG.textContent = \`\${val} not found, or delete() not implemented\`;
  }
  renderList(list);
});
document.getElementById('btn-rst').addEventListener('click', () => {
  list.head = null;
  [12, 7, 43, 5, 28].forEach(v => list.append(v));
  renderList(list); MSG.textContent = '';
});`,
                solutionCode: `class Node { constructor(v){this.val=v;this.next=null;} }
class LinkedList {
  constructor(){this.head=null;}
  append(v){const n=new Node(v);if(!this.head){this.head=n;return;}let c=this.head;while(c.next)c=c.next;c.next=n;}
  prepend(v){const n=new Node(v);n.next=this.head;this.head=n;}
  toArray(){const r=[];let c=this.head;while(c){r.push(c.val);c=c.next;}return r;}
  delete(val) {
    if (!this.head) return;
    if (this.head.val === val) { this.head = this.head.next; return; }
    let prev = this.head, cur = this.head.next;
    while (cur) {
      if (cur.val === val) { prev.next = cur.next; return; }
      prev = cur; cur = cur.next;
    }
  }
}
function renderList(list){const v=document.getElementById('list-view');if(!list.head){v.innerHTML='<span style="color:#475569">(empty)</span>';return;}let h='',c=list.head;while(c){h+=\`<span class="node"><span class="val">\${c.val}</span><span class="nxt">next</span></span>\`;h+=c.next?'<span class="arrow">→</span>':'<span class="null">→ null</span>';c=c.next;}v.innerHTML=h;}
const list=new LinkedList();const MSG=document.getElementById('msg');
[12,7,43,5,28].forEach(v=>list.append(v));renderList(list);
document.getElementById('btn-del').addEventListener('click',()=>{const val=parseInt(document.getElementById('del-val').value);const b=list.toArray();list.delete(val);const a=list.toArray();MSG.style.color=a.length<b.length?'#4ade80':'#f87171';MSG.textContent=a.length<b.length?\`Deleted \${val} ✓ → \${JSON.stringify(a)}\`:\`\${val} not found\`;renderList(list);});
document.getElementById('btn-rst').addEventListener('click',()=>{list.head=null;[12,7,43,5,28].forEach(v=>list.append(v));renderList(list);MSG.textContent='';});`,
                outputHeight: 200,
              },

              // ── JS Cell 5: Build it from scratch ─────────────────────────────
              {
                type: 'js',
                instruction: `## Challenge — Build the Whole Thing From Scratch

No skeletons. No TODOs. Just the class shells.

You know what each method needs to do — you just built them one at a time. Now put it all together from memory.

**What to implement:**
- \`Node\` constructor: store \`val\`, set \`next = null\`
- \`LinkedList\` constructor: \`head = null\`
- \`append(val)\` — walk to end, link the new node
- \`prepend(val)\` — new node points at old head, update head
- \`toArray()\` — traverse, collect values into an array
- \`delete(val)\` — handle head deletion + general prev/cur walk

The render and test code is provided. When all four operations work, you'll see a green success banner.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.node{display:inline-flex;border:2px solid #6366f1;border-radius:6px;overflow:hidden;margin:2px}
.val{padding:7px 12px;background:#1e1b4b;color:#a5b4fc;font-weight:bold}
.nxt{padding:7px 8px;background:#0f172a;color:#6366f1;font-size:10px;border-left:1px solid #4b5563}
.arrow{color:#6366f1;margin:0 3px;font-size:15px;vertical-align:middle}
.null{color:#475569;font-style:italic;font-size:12px;vertical-align:middle}
.pass{color:#4ade80;margin:4px 0;font-size:12px}
.fail{color:#f87171;margin:4px 0;font-size:12px}
.section{margin-top:12px;color:#94a3b8;font-size:11px;border-top:1px solid #1e293b;padding-top:8px}
.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}
.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}
.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `// ─── Your implementation goes here ───────────────────

class Node {
  // fill in the constructor
}

class LinkedList {
  // fill in the constructor

  append(val) {
    // walk to the end, link the new node
  }

  prepend(val) {
    // new node points at old head, then update head
  }

  toArray() {
    // traverse and collect values
  }

  delete(val) {
    // handle head deletion + general prev/cur walk
  }
}

// ─── Tests & render (don't edit below) ────────────────

function renderList(head) {
  if (!head) return '<span class="null">(empty)</span>';
  let html = '', cur = head;
  while (cur) {
    html += \`<span class="node"><span class="val">\${cur.val}</span><span class="nxt">next</span></span>\`;
    html += cur.next ? '<span class="arrow">→</span>' : '<span class="null">→ null</span>';
    cur = cur.next;
  }
  return html;
}

const out = document.getElementById('out');
const results = [];

function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: got \${JSON.stringify(got)}\${pass?'':' — expected '+JSON.stringify(expected)}</div>\`;
}

try {
  // Build list via append
  const ll = new LinkedList();
  ll.append(12); ll.append(7); ll.append(43); ll.append(5);
  out.innerHTML += '<div class="section">append(12, 7, 43, 5)</div>';
  out.innerHTML += renderList(ll.head) + '<br>';
  test('toArray after 4 appends', ll.toArray(), [12,7,43,5]);

  // Prepend
  ll.prepend(99);
  out.innerHTML += '<div class="section">prepend(99)</div>';
  out.innerHTML += renderList(ll.head) + '<br>';
  test('toArray after prepend', ll.toArray(), [99,12,7,43,5]);

  // Delete middle
  ll.delete(7);
  out.innerHTML += '<div class="section">delete(7)</div>';
  out.innerHTML += renderList(ll.head) + '<br>';
  test('toArray after delete(7)', ll.toArray(), [99,12,43,5]);

  // Delete head
  ll.delete(99);
  test('toArray after delete(99) — head', ll.toArray(), [12,43,5]);

  // Delete tail
  ll.delete(5);
  test('toArray after delete(5) — tail', ll.toArray(), [12,43]);

  const allPassed = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${allPassed?'ok':'bad'}">\${allPassed
    ? '✓ All tests pass. You built a linked list from scratch.'
    : \`\${results.filter(Boolean).length}/\${results.length} tests passing — keep going.\`
  }</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `class Node {
  constructor(val) { this.val = val; this.next = null; }
}

class LinkedList {
  constructor() { this.head = null; }

  append(val) {
    const n = new Node(val);
    if (!this.head) { this.head = n; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = n;
  }

  prepend(val) {
    const n = new Node(val);
    n.next = this.head;
    this.head = n;
  }

  toArray() {
    const r = []; let cur = this.head;
    while (cur) { r.push(cur.val); cur = cur.next; }
    return r;
  }

  delete(val) {
    if (!this.head) return;
    if (this.head.val === val) { this.head = this.head.next; return; }
    let prev = this.head, cur = this.head.next;
    while (cur) {
      if (cur.val === val) { prev.next = cur.next; return; }
      prev = cur; cur = cur.next;
    }
  }
}

function renderList(head) {
  if (!head) return '<span class="null">(empty)</span>';
  let html = '', cur = head;
  while (cur) {
    html += \`<span class="node"><span class="val">\${cur.val}</span><span class="nxt">next</span></span>\`;
    html += cur.next ? '<span class="arrow">→</span>' : '<span class="null">→ null</span>';
    cur = cur.next;
  }
  return html;
}

const out = document.getElementById('out');
const results = [];
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: got \${JSON.stringify(got)}</div>\`;
}
const ll = new LinkedList();
ll.append(12); ll.append(7); ll.append(43); ll.append(5);
out.innerHTML += '<div class="section">append(12,7,43,5)</div>' + renderList(ll.head) + '<br>';
test('toArray after 4 appends', ll.toArray(), [12,7,43,5]);
ll.prepend(99);
out.innerHTML += '<div class="section">prepend(99)</div>' + renderList(ll.head) + '<br>';
test('toArray after prepend', ll.toArray(), [99,12,7,43,5]);
ll.delete(7); test('delete(7)', ll.toArray(), [99,12,43,5]);
ll.delete(99); test('delete(99) head', ll.toArray(), [12,43,5]);
ll.delete(5); test('delete(5) tail', ll.toArray(), [12,43]);
const ok = results.every(Boolean);
out.innerHTML += \`<div class="banner \${ok?'ok':'bad'}">\${ok?'✓ All tests pass. You built a linked list from scratch.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 340,
              },
            ],
          },
        },
      },

      // ── Python hands-on coding ────────────────────────────────────────────────
      {
        id: 'PythonNotebook',
        title: 'Build a Linked List in Python + Visualize with OpenCalc',
        caption: 'Same implementation in Python. OpenCalc draws your linked list with real arrows as your code runs.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — Node class + first visualization',
              prose: [
                'Build the `Node` class and use the opencalc Figure library to draw the first linked list.',
                'The `draw_list()` function below uses `fig.arrow()` to draw pointer arrows between nodes — fill in the loop that walks the list.',
              ],
              instructions: 'Complete the Node class and fill in the walk loop inside draw_list(). Then run to see your list rendered with real arrows.',
              code: `from opencalc import Figure, BLUE, GREEN, AMBER, RED, PURPLE

class Node:
    def __init__(self, val):
        # TODO: set self.val = val
        # TODO: set self.next = None
        pass

# Build a small list manually
a = Node(12)
b = Node(7)
c = Node(43)
a.next = b
b.next = c

# Draw it
def draw_list(head, title="Linked List"):
    fig = Figure(xmin=0, xmax=10, ymin=-1, ymax=3,
                 width=500, height=120, title=title)
    fig.axes(labels=False, ticks=False)

    x = 1.0
    cur = head
    nodes_x = []
    while cur is not None:
        # Draw the node box (as a point with label)
        fig.point((x, 1), color=BLUE, label=str(cur.val), radius=18)
        nodes_x.append(x)
        # TODO: draw an arrow from this node to the next
        # Hint: if cur.next is not None, use fig.arrow((x+0.3, 1), (x+1.4, 1))
        x += 2.0
        cur = cur.next

    return fig.show()

print(draw_list(a, "My first linked list"))`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — LinkedList class with append() and prepend()',
              prose: [
                'Build the full LinkedList class. Then visualize the difference between `append` (walks to end) and `prepend` (O(1) update to head).',
                'The `draw_list_fancy()` helper is provided — it draws nodes as boxes with color coding: green for head, blue for regular nodes.',
              ],
              instructions: 'Implement append() and prepend(). Run the cell — the opencalc Figure will show your list before and after each operation.',
              code: `from opencalc import Figure, BLUE, GREEN, AMBER, RED

class Node:
    def __init__(self, val):
        self.val  = val
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, val):
        """Add to end — O(n) without tail pointer."""
        new_node = Node(val)
        # TODO: if empty, set head and return
        # TODO: walk to last node (where cur.next is None)
        # TODO: set cur.next = new_node

    def prepend(self, val):
        """Add to front — O(1)."""
        new_node = Node(val)
        # TODO: new_node.next = self.head
        # TODO: self.head = new_node

    def to_list(self):
        """Return Python list of values — useful for checking."""
        result = []
        cur = self.head
        while cur is not None:
            result.append(cur.val)
            cur = cur.next
        return result

def draw_list(ll, title=""):
    vals = ll.to_list()
    n = len(vals)
    if n == 0:
        print(f"{title}: (empty)")
        return
    fig = Figure(xmin=0, xmax=n*2+1, ymin=0, ymax=3,
                 width=max(300, n*80), height=100, title=title)
    for i, v in enumerate(vals):
        x = 1 + i * 2
        color = GREEN if i == 0 else BLUE
        fig.point((x, 1.5), color=color, label=str(v), radius=16)
        if i < n - 1:
            fig.arrow((x+0.25, 1.5), (x+1.75, 1.5), color=AMBER, width=2)
    print(fig.show())

# Test your implementation
ll = LinkedList()
ll.append(7)
ll.append(43)
ll.append(5)
draw_list(ll, "After 3 appends")

ll.prepend(12)
draw_list(ll, "After prepend(12) — new head")

print("to_list():", ll.to_list())`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Step 3 — delete() and complexity comparison',
              prose: [
                'Implement `delete(val)`. Then compare operation costs between arrays and linked lists with a timing table.',
                'Remember the two cases: deleting the head (update `self.head`) vs deleting any other node (update `prev.next`).',
              ],
              instructions: 'Implement delete(). Then run the timing comparison to see the tradeoffs in real numbers.',
              code: `import time

class Node:
    def __init__(self, val): self.val = val; self.next = None

class LinkedList:
    def __init__(self): self.head = None
    def append(self, val):
        n = Node(val)
        if not self.head: self.head = n; return
        cur = self.head
        while cur.next: cur = cur.next
        cur.next = n
    def prepend(self, val):
        n = Node(val); n.next = self.head; self.head = n
    def to_list(self):
        r, cur = [], self.head
        while cur: r.append(cur.val); cur = cur.next
        return r

    def delete(self, val):
        """Remove first node with this value. O(n)."""
        if not self.head:
            return

        # TODO: Special case — is it the head?
        # if self.head.val == val:
        #     ???
        #     return

        # TODO: General case — walk with prev and cur
        # prev, cur = self.head, self.head.next
        # while cur:
        #     if cur.val == val:
        #         ???  # skip cur
        #         return
        #     prev, cur = cur, cur.next

# ── Timing comparison ─────────────────────────────────
def time_op(fn, reps=1000):
    t = time.perf_counter()
    for _ in range(reps): fn()
    return (time.perf_counter() - t) / reps * 1e6  # microseconds

N = 5000

# Array (Python list)
arr = list(range(N))
t_arr_idx    = time_op(lambda: arr[N//2])
t_arr_insert = time_op(lambda: arr.insert(0, -1) or arr.pop(0))

# Linked list
def make_ll():
    ll = LinkedList()
    for i in range(N): ll.append(i)
    return ll

ll = make_ll()
t_ll_prep = time_op(lambda: ll.prepend(-1) or setattr(ll, 'head', ll.head.next))

print(f"N = {N} elements")
print(f"{'Operation':<28} {'Array':>10} {'Linked List':>12}")
print("-" * 52)
print(f"{'Access by index [N//2]':<28} {t_arr_idx:>8.2f}μs {'O(n) — no random':>12}")
print(f"{'Insert at front':<28} {t_arr_insert:>8.2f}μs {t_ll_prep:>10.2f}μs")
print()
print("Key insight: prepend is FASTER in linked list (O(1) vs O(n)).")
print("But random access doesn't exist in linked list at all.")`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 4,
              cellTitle: 'Challenge — Build the Whole LinkedList From Scratch in Python',
              prose: [
                'No hints. No skeleton methods. You have the class shells — fill in every method yourself.',
                'When your implementation passes all the assertions, the opencalc Figure will draw the final list state showing you built it correctly.',
              ],
              instructions: `Implement Node and LinkedList completely. Then the test block at the bottom will verify every operation and draw the final list.

**What you need:**
- \`Node.__init__\`: store val, set next to None
- \`LinkedList.__init__\`: set head to None
- \`append(val)\`: walk to end, link new node — O(n)
- \`prepend(val)\`: new node points at old head, update head — O(1)
- \`to_list()\`: traverse and return Python list
- \`delete(val)\`: handle head case + prev/cur walk`,
              code: `from opencalc import Figure, BLUE, GREEN, AMBER, RED

# ── Your implementation ────────────────────────────────

class Node:
    def __init__(self, val):
        pass  # fill this in

class LinkedList:
    def __init__(self):
        pass  # fill this in

    def append(self, val):
        pass  # walk to end, link the new node

    def prepend(self, val):
        pass  # new node points at old head, update head

    def to_list(self):
        pass  # traverse and collect values

    def delete(self, val):
        pass  # handle head case + prev/cur walk

# ── Tests ──────────────────────────────────────────────
ll = LinkedList()
ll.append(12); ll.append(7); ll.append(43); ll.append(5)
assert ll.to_list() == [12, 7, 43, 5], f"append failed: {ll.to_list()}"
print("✓ append: ", ll.to_list())

ll.prepend(99)
assert ll.to_list() == [99, 12, 7, 43, 5], f"prepend failed: {ll.to_list()}"
print("✓ prepend:", ll.to_list())

ll.delete(7)
assert ll.to_list() == [99, 12, 43, 5], f"delete middle failed: {ll.to_list()}"
print("✓ delete middle:", ll.to_list())

ll.delete(99)
assert ll.to_list() == [12, 43, 5], f"delete head failed: {ll.to_list()}"
print("✓ delete head:", ll.to_list())

ll.delete(5)
assert ll.to_list() == [12, 43], f"delete tail failed: {ll.to_list()}"
print("✓ delete tail:", ll.to_list())

print()
print("All tests passed — drawing your list:")

# ── Draw final state ───────────────────────────────────
vals = ll.to_list()
n = len(vals)
fig = Figure(xmin=0, xmax=n*2+1, ymin=0, ymax=3,
             width=max(300, n*100), height=110,
             title="Your linked list — built from scratch")
for i, v in enumerate(vals):
    x = 1 + i * 2
    color = GREEN if i == 0 else BLUE
    fig.point((x, 1.5), color=color, label=str(v), radius=20)
    if i < n - 1:
        fig.arrow((x+0.3, 1.5), (x+1.7, 1.5), color=AMBER, width=2)
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
      'Time complexities for a singly linked list (with head pointer only):\n- Access element i: O(n) — must traverse from head\n- Search by value: O(n) — linear scan\n- Insert at head (prepend): O(1) — pointer update only\n- Insert at tail (append): O(n) without tail pointer; O(1) with tail pointer\n- Insert after a given node: O(1) — given the node reference\n- Delete at head: O(1) — update head pointer\n- Delete by value: O(n) — must find the node first',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'O(1) insert given a node reference',
        body: 'If you already HAVE a reference to a node in the list, inserting after it is O(1) — just update two pointers. This is something arrays can never do. This property makes linked lists ideal as the collision chain in a hash table.',
      },
    ],
    visualizations: [],
  },

  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],

  challenges: [
    {
      id: 'dsa1-002-c1',
      title: 'Reverse a Linked List In-Place',
      difficulty: 'hard',
      description: 'Reverse a singly linked list in-place using O(1) extra space. The classic three-pointer technique.',
      starterCode: `class Node:
    def __init__(self, val): self.val = val; self.next = None

def reverse(head):
    """Reverse the linked list in-place. Return new head."""
    prev = None
    cur  = head
    while cur is not None:
        # TODO: save cur.next before overwriting it
        # TODO: reverse the pointer: cur.next = prev
        # TODO: advance: prev = cur, cur = next_node
        pass
    return prev  # prev is the new head

# Test
def to_list(h):
    r=[]; c=h
    while c: r.append(c.val); c=c.next
    return r

head = Node(1)
head.next = Node(2)
head.next.next = Node(3)
head.next.next.next = Node(4)
print("Before:", to_list(head))
head = reverse(head)
print("After: ", to_list(head))  # should be [4, 3, 2, 1]`,
      solution: `def reverse(head):
    prev, cur = None, head
    while cur is not None:
        nxt      = cur.next   # save next
        cur.next = prev       # reverse pointer
        prev     = cur        # advance prev
        cur      = nxt        # advance cur
    return prev`,
      hint: 'Three variables: prev (starts None), cur (starts head), nxt (temp). Each iteration: save nxt=cur.next, flip cur.next=prev, then advance both prev and cur forward.',
    },
  ],
};
