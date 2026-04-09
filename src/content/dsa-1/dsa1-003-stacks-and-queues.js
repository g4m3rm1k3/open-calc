export default {
  id: 'dsa1-003',
  slug: 'stacks-and-queues',
  chapter: 'dsa1',
  order: 3,
  title: 'Stacks & Queues',
  subtitle: 'Two constraints that turn a list into a tool. LIFO and FIFO are not just academic — they are the operating principle behind function calls, undo history, breadth-first search, and job scheduling.',
  tags: ['stack', 'queue', 'LIFO', 'FIFO', 'push', 'pop', 'enqueue', 'dequeue', 'call stack', 'BFS'],
  aliases: 'stack queue LIFO FIFO push pop enqueue dequeue call stack undo buffer',

  hook: {
    question: 'Every time you call a function, something tracks where to return when it finishes. Every time you hit undo, something knows exactly what to undo in exactly the right order. What data structure makes both of those possible?',
    realWorldContext: 'The call stack in every programming language is a stack — function calls are pushed on, return values pop them off. Your browser\'s back button is a stack of URLs. Every undo/redo system is two stacks. Printers use a queue to process jobs in order. Operating systems use queues to schedule CPU time. BFS graph traversal — which finds the shortest path in an unweighted graph — requires a queue. Understanding stacks and queues means understanding how software actually runs.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You built arrays (contiguous, O(1) access) and linked lists (O(1) prepend, O(n) access). Both are general-purpose containers — you can insert or remove anywhere. But most real problems don\'t need arbitrary access. They need a specific discipline: only interact with one end.',
      '**A Stack is LIFO — Last In, First Out.** Think of a stack of plates. You add to the top, you remove from the top. The last plate you put on is the first one you take off. Two operations: `push` (add to top) and `pop` (remove from top). That\'s it. Constraint is the point — it\'s what makes it useful.',
      '**A Queue is FIFO — First In, First Out.** Think of a line at a store. First person in line is first to be served. Two operations: `enqueue` (add to back) and `dequeue` (remove from front). The constraint here enforces ordering — whoever arrived first gets processed first.',
      '**Both are built on top of what you already know.** A stack can be implemented with an array (push/pop at the end are both O(1)) or a linked list (push/pop at the head are both O(1)). A queue can be implemented with a linked list with both head and tail pointers — enqueue at tail (O(1)), dequeue at head (O(1)).',
      '**The power is in the constraint.** By restricting access to one end (or two ends), you get predictable behavior that maps perfectly to real problems. The call stack tracks function execution because functions must return in LIFO order. Job queues process tasks fairly because FIFO guarantees order.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of Linear Structures',
        body: '**Previous:** Linked Lists — nodes, pointers, O(1) prepend.\n**This lesson:** Stacks & Queues — constrained access patterns that power real systems.\n**Next:** Strings — sequences with their own set of algorithms.',
      },
      {
        type: 'insight',
        title: 'Implementation vs. Abstraction',
        body: 'A stack is an abstract data type — it defines WHAT operations exist (push, pop, peek), not HOW they\'re implemented. You can implement a stack with an array or a linked list. The interface is the same. This separation is fundamental to how software is designed.',
      },
      {
        type: 'warning',
        title: 'Stack Overflow is literally this',
        body: 'When a recursive function calls itself infinitely, each call pushes a frame onto the call stack. Eventually the stack runs out of memory — that\'s a stack overflow error. Understanding the call stack as a literal stack makes this error make sense.',
      },
      {
        type: 'strategy',
        title: 'When to reach for each',
        body: 'Stack: anything that needs "last thing first" — undo, backtracking, matching brackets, function calls.\nQueue: anything that needs "first thing first" — BFS, job scheduling, print queues, event handling.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Stack vs Queue: See the Difference',
        mathBridge: 'Watch how insertion order affects removal order. In the stack, the last item pushed is always the first popped. In the queue, the first item enqueued is always the first dequeued.',
        caption: 'Same items, different constraints — completely different behavior.',
        props: {
          lesson: {
            title: 'Stack (LIFO) vs Queue (FIFO)',
            subtitle: 'The constraint defines the structure.',
            sequential: false,
            cells: [
              {
                type: 'js',
                title: 'Stack: LIFO — Push and Pop',
                instruction: 'Click **Push** to add an item to the top of the stack. Click **Pop** to remove the top item.\n\nWatch: the item you pushed **last** is always the item you pop **first**. The order of removal is the reverse of insertion.',
                html: `<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
  <div style="flex:1;min-width:180px">
    <div style="color:#94a3b8;font-size:11px;margin-bottom:6px;font-family:monospace">STACK — top ↑</div>
    <div id="stack-viz" style="min-height:180px;display:flex;flex-direction:column-reverse;gap:4px;border:1px solid #1e293b;border-radius:6px;padding:8px"></div>
  </div>
  <div style="flex:1;min-width:180px">
    <div style="color:#94a3b8;font-size:11px;margin-bottom:6px;font-family:monospace">LOG</div>
    <div id="log" style="min-height:180px;border:1px solid #1e293b;border-radius:6px;padding:8px;font-family:monospace;font-size:11px;color:#64748b;overflow-y:auto"></div>
  </div>
</div>
<div style="margin-top:10px;display:flex;gap:8px">
  <button id="btn-push" style="padding:7px 18px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Push</button>
  <button id="btn-pop" style="padding:7px 18px;border-radius:6px;border:none;background:#b91c1c;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Pop</button>
  <button id="btn-rst" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
  <span id="msg" style="font-family:monospace;font-size:12px;color:#94a3b8;line-height:32px"></span>
</div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.item{padding:8px 16px;background:#1e1b4b;border:2px solid #6366f1;border-radius:5px;color:#a5b4fc;font-weight:bold;font-size:14px;text-align:center;animation:slide .2s ease}
.item.new{border-color:#2dd4bf;background:#042f2e;color:#2dd4bf}
.item.popped{opacity:0;transform:translateY(-20px);transition:.25s}
@keyframes slide{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}`,
                startCode: `const viz = document.getElementById('stack-viz');
const log = document.getElementById('log');
const msg = document.getElementById('msg');
const VALS = [12, 7, 43, 5, 28, 91, 3, 67];
let idx = 0, stack = [];

function render(newTop = false) {
  viz.innerHTML = '';
  stack.forEach((v, i) => {
    const el = document.createElement('div');
    el.className = 'item' + (i === stack.length-1 && newTop ? ' new' : '');
    el.textContent = v;
    viz.appendChild(el);
  });
  msg.textContent = stack.length ? \`top = \${stack[stack.length-1]}, size = \${stack.length}\` : '(empty)';
}

function addLog(text, color='#94a3b8') {
  const line = document.createElement('div');
  line.style.color = color;
  line.textContent = text;
  log.insertBefore(line, log.firstChild);
}

document.getElementById('btn-push').addEventListener('click', () => {
  const v = VALS[idx++ % VALS.length];
  stack.push(v);
  addLog(\`push(\${v}) → top is now \${v}\`, '#a5b4fc');
  render(true);
});

document.getElementById('btn-pop').addEventListener('click', () => {
  if (!stack.length) { addLog('pop() on empty stack!', '#f87171'); return; }
  const v = stack.pop();
  addLog(\`pop() → removed \${v}\`, '#f87171');
  render();
});

document.getElementById('btn-rst').addEventListener('click', () => {
  stack = []; idx = 0; log.innerHTML = ''; render();
});

render();`,
                outputHeight: 280,
              },
              {
                type: 'js',
                title: 'Queue: FIFO — Enqueue and Dequeue',
                instruction: 'Click **Enqueue** to add to the back. Click **Dequeue** to remove from the front.\n\nNotice: the item you enqueued **first** is the one that leaves **first**. Arrival order is preserved.',
                html: `<div style="margin-bottom:10px">
  <div style="color:#94a3b8;font-size:11px;margin-bottom:6px;font-family:monospace">QUEUE — front → back</div>
  <div id="queue-viz" style="min-height:56px;display:flex;gap:4px;align-items:center;border:1px solid #1e293b;border-radius:6px;padding:8px;flex-wrap:wrap"></div>
</div>
<div id="log" style="min-height:80px;border:1px solid #1e293b;border-radius:6px;padding:8px;font-family:monospace;font-size:11px;color:#64748b;overflow-y:auto;margin-bottom:10px"></div>
<div style="display:flex;gap:8px;align-items:center">
  <button id="btn-enq" style="padding:7px 18px;border-radius:6px;border:none;background:#0d9488;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Enqueue</button>
  <button id="btn-deq" style="padding:7px 18px;border-radius:6px;border:none;background:#b91c1c;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Dequeue</button>
  <button id="btn-rst" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
  <span id="msg" style="font-family:monospace;font-size:11px;color:#94a3b8"></span>
</div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.item{padding:8px 14px;background:#042f2e;border:2px solid #2dd4bf;border-radius:5px;color:#2dd4bf;font-weight:bold;font-size:14px;animation:pop .2s ease}
.item.front{border-color:#f59e0b;background:#1c1007;color:#f59e0b}
.label{font-size:9px;color:#475569;margin-top:2px;text-align:center}
@keyframes pop{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}`,
                startCode: `const viz = document.getElementById('queue-viz');
const log = document.getElementById('log');
const msg = document.getElementById('msg');
const VALS = [12, 7, 43, 5, 28, 91, 3, 67];
let idx = 0, queue = [];

function render(newBack = false) {
  viz.innerHTML = '';
  queue.forEach((v, i) => {
    const wrap = document.createElement('div');
    const el = document.createElement('div');
    el.className = 'item' + (i === 0 ? ' front' : '') + (i === queue.length-1 && newBack ? ' new' : '');
    el.textContent = v;
    const lbl = document.createElement('div');
    lbl.className = 'label';
    lbl.textContent = i === 0 ? '← front' : i === queue.length-1 ? 'back →' : '';
    wrap.appendChild(el); wrap.appendChild(lbl);
    viz.appendChild(wrap);
  });
  if (!queue.length) viz.innerHTML = '<span style="color:#475569;font-size:12px">(empty)</span>';
  msg.textContent = queue.length ? \`front=\${queue[0]}  back=\${queue[queue.length-1]}  size=\${queue.length}\` : '';
}

function addLog(text, color='#94a3b8') {
  const line = document.createElement('div');
  line.style.color = color;
  line.textContent = text;
  log.insertBefore(line, log.firstChild);
}

document.getElementById('btn-enq').addEventListener('click', () => {
  const v = VALS[idx++ % VALS.length];
  queue.push(v);
  addLog(\`enqueue(\${v}) → added to back\`, '#2dd4bf');
  render(true);
});

document.getElementById('btn-deq').addEventListener('click', () => {
  if (!queue.length) { addLog('dequeue() on empty queue!', '#f87171'); return; }
  const v = queue.shift();
  addLog(\`dequeue() → removed \${v} from front\`, '#f59e0b');
  render();
});

document.getElementById('btn-rst').addEventListener('click', () => {
  queue = []; idx = 0; log.innerHTML = ''; render();
});

render();`,
                outputHeight: 240,
              },
            ],
          },
        },
      },

      // ── JavaScript guided walkthrough ─────────────────────────────────────────
      {
        id: 'JSNotebook',
        title: 'Build a Stack and Queue in JavaScript',
        caption: 'Build each method one at a time. Then put the whole thing together from scratch.',
        props: {
          lesson: {
            title: 'Stack & Queue in JavaScript',
            subtitle: 'Type every method. Understand every line.',
            cells: [
              // ── JS Cell 1: Stack push and pop ─────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 1 — The Stack: push() and pop()

A stack stores items in an array. The "top" of the stack is the **end** of the array — because \`array.push()\` and \`array.pop()\` are both O(1).

**push(val):** add val to \`this.items\` using the built-in array push.
**pop():** if empty return undefined. Otherwise remove and return the last item.
**peek():** return the last item without removing it. \`this.items[this.items.length - 1]\`

The test below pushes 3 values and pops them — watch that they come back in reverse order (LIFO).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.info{color:#94a3b8;margin:2px 0}`,
                startCode: `class Stack {
  constructor() {
    this.items = [];
  }

  push(val) {
    // TODO: add val to the end of this.items

  }

  pop() {
    // TODO: if empty, return undefined
    // TODO: otherwise remove and return the last item
    // Hint: this.items.pop()

  }

  peek() {
    // TODO: return the last item without removing it

  }

  get size() { return this.items.length; }
  isEmpty()  { return this.items.length === 0; }
}

// ── Tests (don't edit) ────────────────────────────────
const out = document.getElementById('out');
function log(msg, pass) {
  out.innerHTML += \`<div class="\${pass===undefined?'info':pass?'pass':'fail'}">\${pass===undefined?'  ':pass?'✓ ':'✗ '}\${msg}</div>\`;
}

const s = new Stack();
log('push(10), push(20), push(30)');
s.push(10); s.push(20); s.push(30);
log(\`peek() = \${s.peek()}\`, s.peek() === 30);
log(\`size = \${s.size}\`, s.size === 3);
log(\`pop() = \${s.pop()}\`, s.pop() === undefined ? false : true);  // pops 30... but wait we called pop() above
// fresh stack
const s2 = new Stack();
s2.push(10); s2.push(20); s2.push(30);
const p1 = s2.pop(), p2 = s2.pop(), p3 = s2.pop();
log(\`pop order: \${p1}, \${p2}, \${p3} (should be 30, 20, 10 — LIFO)\`, p1===30 && p2===20 && p3===10);
log(\`isEmpty after all pops: \${s2.isEmpty()}\`, s2.isEmpty() === true);
log(\`pop on empty returns undefined: \${s2.pop()}\`, s2.pop() === undefined);`,
                solutionCode: `class Stack {
  constructor() { this.items = []; }
  push(val) { this.items.push(val); }
  pop() { if (this.isEmpty()) return undefined; return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  get size() { return this.items.length; }
  isEmpty() { return this.items.length === 0; }
}
const out = document.getElementById('out');
function log(msg, pass) {
  out.innerHTML += \`<div class="\${pass===undefined?'info':pass?'pass':'fail'}">\${pass===undefined?'  ':pass?'✓ ':'✗ '}\${msg}</div>\`;
}
const s = new Stack();
s.push(10); s.push(20); s.push(30);
log('push(10), push(20), push(30)');
log(\`peek() = \${s.peek()}\`, s.peek()===30);
log(\`size = \${s.size}\`, s.size===3);
const p1=s.pop(),p2=s.pop(),p3=s.pop();
log(\`pop order: \${p1}, \${p2}, \${p3} — LIFO ✓\`, p1===30&&p2===20&&p3===10);
log(\`isEmpty: \${s.isEmpty()}\`, s.isEmpty()===true);
log(\`pop on empty: \${s.pop()}\`, s.pop()===undefined);`,
                outputHeight: 180,
              },

              // ── JS Cell 2: Queue enqueue and dequeue ──────────────────────────
              {
                type: 'js',
                instruction: `## Step 2 — The Queue: enqueue() and dequeue()

A queue adds to the back and removes from the front.

**Using an array naively:** \`push\` at back = O(1), \`shift\` from front = O(n) (shifts all elements). Fine for learning. Production queues use a linked list or a circular buffer.

**enqueue(val):** add to the back — \`this.items.push(val)\`
**dequeue():** remove from the front — \`this.items.shift()\`. Return undefined if empty.
**front():** return \`this.items[0]\` without removing.

The test enqueues 3 items and dequeues them — they should come out in the **same** order they went in (FIFO).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.info{color:#94a3b8;margin:2px 0}`,
                startCode: `class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(val) {
    // TODO: add val to the back

  }

  dequeue() {
    // TODO: if empty return undefined
    // TODO: remove and return the front item
    // Hint: this.items.shift()

  }

  front() {
    // TODO: return first item without removing

  }

  get size() { return this.items.length; }
  isEmpty()  { return this.items.length === 0; }
}

// ── Tests (don't edit) ────────────────────────────────
const out = document.getElementById('out');
function log(msg, pass) {
  out.innerHTML += \`<div class="\${pass===undefined?'info':pass?'pass':'fail'}">\${pass===undefined?'  ':pass?'✓ ':'✗ '}\${msg}</div>\`;
}

const q = new Queue();
q.enqueue('A'); q.enqueue('B'); q.enqueue('C');
log('enqueue A, B, C');
log(\`front() = \${q.front()}\`, q.front() === 'A');
log(\`size = \${q.size}\`, q.size === 3);
const d1 = q.dequeue(), d2 = q.dequeue(), d3 = q.dequeue();
log(\`dequeue order: \${d1}, \${d2}, \${d3} (should be A, B, C — FIFO)\`, d1==='A' && d2==='B' && d3==='C');
log(\`isEmpty: \${q.isEmpty()}\`, q.isEmpty() === true);
log(\`dequeue on empty: \${q.dequeue()}\`, q.dequeue() === undefined);`,
                solutionCode: `class Queue {
  constructor() { this.items = []; }
  enqueue(val) { this.items.push(val); }
  dequeue() { if (this.isEmpty()) return undefined; return this.items.shift(); }
  front() { return this.items[0]; }
  get size() { return this.items.length; }
  isEmpty() { return this.items.length === 0; }
}
const out = document.getElementById('out');
function log(msg, pass) {
  out.innerHTML += \`<div class="\${pass===undefined?'info':pass?'pass':'fail'}">\${pass===undefined?'  ':pass?'✓ ':'✗ '}\${msg}</div>\`;
}
const q = new Queue();
q.enqueue('A'); q.enqueue('B'); q.enqueue('C');
log('enqueue A, B, C');
log(\`front() = \${q.front()}\`, q.front()==='A');
log(\`size = \${q.size}\`, q.size===3);
const d1=q.dequeue(),d2=q.dequeue(),d3=q.dequeue();
log(\`dequeue order: \${d1}, \${d2}, \${d3} — FIFO ✓\`, d1==='A'&&d2==='B'&&d3==='C');
log(\`isEmpty: \${q.isEmpty()}\`, q.isEmpty()===true);
log(\`dequeue on empty: \${q.dequeue()}\`, q.dequeue()===undefined);`,
                outputHeight: 180,
              },

              // ── JS Cell 3: Real application — bracket matching with a stack ──
              {
                type: 'js',
                instruction: `## Step 3 — Real Application: Bracket Matching

Stacks shine at matching problems. Given a string like \`"({[]})"\ — is it valid?

**The algorithm:**
1. Walk character by character
2. If it's an **opening** bracket \`( [ {\`, push it onto the stack
3. If it's a **closing** bracket \`) ] }\`, pop from the stack and check it matches
4. At the end, the stack must be **empty** — otherwise there are unmatched openers

Implement \`isValid(s)\`. The closing-to-opening map is provided.`,
                html: `<div style="margin-bottom:10px">
  <input id="inp" type="text" value="({[]})" style="padding:8px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:14px;width:200px">
  <button id="btn" style="padding:8px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer;margin-left:8px">Check</button>
</div>
<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:3px 0;padding:6px 10px;background:#052e16;border-radius:5px}
.fail{color:#f87171;margin:3px 0;padding:6px 10px;background:#450a0a;border-radius:5px}
.step{color:#94a3b8;margin:2px 0;font-size:11px}`,
                startCode: `class Stack {
  constructor() { this.items = []; }
  push(val)  { this.items.push(val); }
  pop()      { return this.items.pop(); }
  peek()     { return this.items[this.items.length - 1]; }
  isEmpty()  { return this.items.length === 0; }
}

function isValid(s) {
  const stack = new Stack();
  const match = { ')': '(', ']': '[', '}': '{' };
  const closing = new Set([')', ']', '}']);
  const opening = new Set(['(', '[', '{']);

  for (const ch of s) {
    if (opening.has(ch)) {
      // TODO: push ch onto the stack

    } else if (closing.has(ch)) {
      // TODO: if stack is empty, return false (no opener to match)
      // TODO: pop the top — if it doesn't equal match[ch], return false

    }
  }

  // TODO: return true only if the stack is empty at the end

}

// ── Test runner ────────────────────────────────────────
const out = document.getElementById('out');
const CASES = [
  { input: '()',      expected: true  },
  { input: '()[]{}', expected: true  },
  { input: '({[]})', expected: true  },
  { input: '(]',     expected: false },
  { input: '([)]',   expected: false },
  { input: '{[]',    expected: false },
];

function runTests() {
  out.innerHTML = '';
  CASES.forEach(({ input, expected }) => {
    const got = isValid(input);
    const pass = got === expected;
    out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} isValid("\${input}") → \${got} \${pass?'':'(expected '+expected+')'}</div>\`;
  });
}

document.getElementById('btn').addEventListener('click', () => {
  const val = document.getElementById('inp').value.trim();
  if (!val) return;
  out.innerHTML = \`<div class="step">isValid("\${val}") = \${isValid(val)}</div>\`;
});

runTests();`,
                solutionCode: `class Stack {
  constructor() { this.items = []; }
  push(val) { this.items.push(val); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length-1]; }
  isEmpty() { return this.items.length === 0; }
}
function isValid(s) {
  const stack = new Stack();
  const match = { ')':'(', ']':'[', '}':'{' };
  const closing = new Set([')',']','}']);
  const opening = new Set(['(','[','{']);
  for (const ch of s) {
    if (opening.has(ch)) { stack.push(ch); }
    else if (closing.has(ch)) {
      if (stack.isEmpty()) return false;
      if (stack.pop() !== match[ch]) return false;
    }
  }
  return stack.isEmpty();
}
const out = document.getElementById('out');
const CASES = [
  {input:'()',expected:true},{input:'()[]{}',expected:true},
  {input:'({[]})',expected:true},{input:'(]',expected:false},
  {input:'([)]',expected:false},{input:'{[]',expected:false},
];
function runTests(){out.innerHTML='';CASES.forEach(({input,expected})=>{const got=isValid(input);const pass=got===expected;out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} isValid("\${input}") → \${got}</div>\`;});}
document.getElementById('btn').addEventListener('click',()=>{const v=document.getElementById('inp').value.trim();out.innerHTML=\`<div class="step">isValid("\${v}") = \${isValid(v)}</div>\`;});
runTests();`,
                outputHeight: 220,
              },

              // ── JS Cell 4: From scratch ───────────────────────────────────────
              {
                type: 'js',
                instruction: `## Challenge — Build Both From Scratch

Empty shells. No hints. Write the complete Stack and Queue from memory, then implement \`isValid\` using your Stack.

All three components must work for the test suite to go green.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.section{color:#64748b;font-size:11px;margin-top:10px;border-top:1px solid #1e293b;padding-top:6px}
.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}
.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}
.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `// ─── Stack ────────────────────────────────────────────
class Stack {
  // constructor, push, pop, peek, isEmpty, size
}

// ─── Queue ────────────────────────────────────────────
class Queue {
  // constructor, enqueue, dequeue, front, isEmpty, size
}

// ─── isValid(s) ───────────────────────────────────────
function isValid(s) {
  // bracket matching using your Stack
}

// ─── Tests (don't edit) ───────────────────────────────
const out = document.getElementById('out');
const results = [];
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

try {
  out.innerHTML += '<div class="section">Stack tests</div>';
  const s = new Stack();
  s.push(1); s.push(2); s.push(3);
  test('peek()', s.peek(), 3);
  test('size', s.size, 3);
  test('pop order', [s.pop(), s.pop(), s.pop()], [3,2,1]);
  test('isEmpty after all pops', s.isEmpty(), true);
  test('pop on empty', s.pop(), undefined);

  out.innerHTML += '<div class="section">Queue tests</div>';
  const q = new Queue();
  q.enqueue('X'); q.enqueue('Y'); q.enqueue('Z');
  test('front()', q.front(), 'X');
  test('size', q.size, 3);
  test('dequeue order', [q.dequeue(), q.dequeue(), q.dequeue()], ['X','Y','Z']);
  test('isEmpty after all dequeues', q.isEmpty(), true);
  test('dequeue on empty', q.dequeue(), undefined);

  out.innerHTML += '<div class="section">isValid tests</div>';
  test('isValid("()")', isValid('()'), true);
  test('isValid("({[]})")', isValid('({[]})'), true);
  test('isValid("(]")', isValid('(]'), false);
  test('isValid("{[]")', isValid('{[]'), false);

  const all = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all
    ? '✓ All tests pass. Stack, Queue, and isValid — built from scratch.'
    : results.filter(Boolean).length + '/' + results.length + ' passing.'
  }</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `class Stack {
  constructor() { this.items = []; }
  push(val) { this.items.push(val); }
  pop() { return this.isEmpty() ? undefined : this.items.pop(); }
  peek() { return this.items[this.items.length-1]; }
  get size() { return this.items.length; }
  isEmpty() { return this.items.length === 0; }
}
class Queue {
  constructor() { this.items = []; }
  enqueue(val) { this.items.push(val); }
  dequeue() { return this.isEmpty() ? undefined : this.items.shift(); }
  front() { return this.items[0]; }
  get size() { return this.items.length; }
  isEmpty() { return this.items.length === 0; }
}
function isValid(s) {
  const stack = new Stack();
  const match = {')':'(',']':'[','}':'{'};
  const closing = new Set([')',']','}']);
  const opening = new Set(['(','[','{']);
  for (const ch of s) {
    if (opening.has(ch)) stack.push(ch);
    else if (closing.has(ch)) { if (stack.isEmpty() || stack.pop() !== match[ch]) return false; }
  }
  return stack.isEmpty();
}
const out=document.getElementById('out');const results=[];
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);results.push(pass);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}</div>\`;}
out.innerHTML+='<div class="section">Stack</div>';const s=new Stack();s.push(1);s.push(2);s.push(3);test('peek',s.peek(),3);test('size',s.size,3);test('pop order',[s.pop(),s.pop(),s.pop()],[3,2,1]);test('isEmpty',s.isEmpty(),true);test('pop empty',s.pop(),undefined);
out.innerHTML+='<div class="section">Queue</div>';const q=new Queue();q.enqueue('X');q.enqueue('Y');q.enqueue('Z');test('front',q.front(),'X');test('size',q.size,3);test('dequeue order',[q.dequeue(),q.dequeue(),q.dequeue()],['X','Y','Z']);test('isEmpty',q.isEmpty(),true);test('dequeue empty',q.dequeue(),undefined);
out.innerHTML+='<div class="section">isValid</div>';test('()',isValid('()'),true);test('({[]})',isValid('({[]})'),true);test('(]',isValid('(]'),false);test('{[]',isValid('{[]'),false);
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
        title: 'Build a Stack and Queue in Python',
        caption: 'Same implementation in Python. Build each method, then write the whole thing from scratch.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — Stack: push, pop, peek',
              prose: [
                'Python lists have `append()` (add to end) and `pop()` (remove from end) — both O(1). That makes the end of a list a perfect stack top.',
                'Build the Stack class. The `draw_stack()` helper is provided — it draws the stack visually with the top item highlighted.',
              ],
              instructions: `Implement push(), pop(), and peek() inside the Stack class. Then run — draw_stack() will show your stack state after each push.`,
              code: `from opencalc import Figure, BLUE, GREEN, AMBER, RED, PURPLE

class Stack:
    def __init__(self):
        self.items = []

    def push(self, val):
        # TODO: add val to the end of self.items

    def pop(self):
        # TODO: if empty return None
        # TODO: otherwise remove and return the last item (self.items.pop())

    def peek(self):
        # TODO: return last item without removing
        # Hint: self.items[-1] if self.items else None

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

# ── Draw helper ────────────────────────────────────────
def draw_stack(stack, title="Stack"):
    items = stack.items
    n = len(items)
    if n == 0:
        print(f"{title}: (empty)")
        return
    height = max(120, n * 36 + 20)
    fig = Figure(xmin=0, xmax=4, ymin=0, ymax=n+1,
                 width=160, height=height, title=title)
    fig.axes(labels=False, ticks=False)
    for i, v in enumerate(items):
        is_top = (i == n - 1)
        color = GREEN if is_top else BLUE
        fig.point((2, i + 0.7), color=color, label=str(v), radius=18)
    print(fig.show())

# ── Test ───────────────────────────────────────────────
s = Stack()
s.push(10)
s.push(20)
s.push(30)
draw_stack(s, "After push(10, 20, 30) — top is 30")

print(f"peek() = {s.peek()}")   # should be 30
print(f"pop()  = {s.pop()}")    # should be 30
print(f"pop()  = {s.pop()}")    # should be 20
draw_stack(s, "After two pops")
print(f"pop()  = {s.pop()}")    # should be 10
print(f"empty? = {s.is_empty()}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — Queue: enqueue, dequeue, front',
              prose: [
                'A queue adds to the back and removes from the front. Python `list.append()` = O(1) for back. `list.pop(0)` = O(n) (shifts everything). That\'s fine for now — a production queue would use `collections.deque`.',
                'Implement the Queue class. The draw helper will show front (amber) and back (teal) positions clearly.',
              ],
              instructions: `Implement enqueue(), dequeue(), and front(). Run the test cell to see FIFO behavior and the opencalc visualization.`,
              code: `from opencalc import Figure, BLUE, GREEN, AMBER, RED

class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, val):
        # TODO: add to the back

    def dequeue(self):
        # TODO: if empty return None
        # TODO: remove and return from the front
        # Hint: self.items.pop(0)

    def front(self):
        # TODO: return first item without removing

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)

# ── Draw helper ────────────────────────────────────────
def draw_queue(queue, title="Queue"):
    vals = queue.items
    n = len(vals)
    if n == 0:
        print(f"{title}: (empty)")
        return
    fig = Figure(xmin=0, xmax=n*2+1, ymin=0, ymax=3,
                 width=max(260, n*80), height=100, title=title)
    fig.axes(labels=False, ticks=False)
    for i, v in enumerate(vals):
        x = 1 + i * 2
        color = AMBER if i == 0 else (GREEN if i == n-1 else BLUE)
        fig.point((x, 1.5), color=color, label=str(v), radius=18)
        if i < n - 1:
            fig.arrow((x+0.3, 1.5), (x+1.7, 1.5), width=2)
    print(fig.show())

# ── Test ───────────────────────────────────────────────
q = Queue()
q.enqueue('A')
q.enqueue('B')
q.enqueue('C')
draw_queue(q, "After enqueue A, B, C — front=A (amber)")

print(f"front()    = {q.front()}")      # A
print(f"dequeue()  = {q.dequeue()}")    # A — FIFO
print(f"dequeue()  = {q.dequeue()}")    # B
draw_queue(q, "After two dequeues")
print(f"dequeue()  = {q.dequeue()}")    # C
print(f"empty?     = {q.is_empty()}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Step 3 — Real Application: isValid() bracket matching',
              prose: [
                'Now use your Stack to solve a real problem. The bracket matching algorithm is one of the most common interview questions and a perfect demonstration of why stacks exist.',
                'The logic: push openers, check-and-pop on closers, return True only if stack is empty at end.',
              ],
              instructions: `Implement is_valid(s) using your Stack class. The closing-to-opening map is provided. Test cases run automatically.`,
              code: `class Stack:
    def __init__(self): self.items = []
    def push(self, val): self.items.append(val)
    def pop(self): return self.items.pop() if self.items else None
    def peek(self): return self.items[-1] if self.items else None
    def is_empty(self): return len(self.items) == 0

def is_valid(s):
    stack = Stack()
    match   = {')': '(', ']': '[', '}': '{'}
    closing = set([')', ']', '}'])
    opening = set(['(', '[', '{'])

    for ch in s:
        if ch in opening:
            # TODO: push ch

        elif ch in closing:
            # TODO: if stack is empty, return False
            # TODO: pop and check — if popped value != match[ch], return False

    # TODO: return True only if stack is empty

# ── Tests ──────────────────────────────────────────────
cases = [
    ('()',       True),
    ('()[]{}',  True),
    ('({[]})',   True),
    ('(]',       False),
    ('([)]',     False),
    ('{[]',      False),
]

all_pass = True
for s, expected in cases:
    got = is_valid(s)
    ok = got == expected
    if not ok: all_pass = False
    print(f"{'✓' if ok else '✗'} is_valid({s!r}) = {got}")

print()
print("All tests passed!" if all_pass else "Some tests failed — check your logic.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Challenge — Build Stack and Queue From Scratch in Python',
              prose: [
                'No fill-in-the-blank. Just the class shells.',
                'Implement everything from memory: Stack (push, pop, peek, is_empty, size) and Queue (enqueue, dequeue, front, is_empty, size). Then implement is_valid() using your Stack.',
                'The assertions will tell you exactly which method failed. The opencalc Figure draws your stack and queue when everything passes.',
              ],
              instructions: `Write every method from scratch. All assertions must pass before the visualization runs.`,
              code: `from opencalc import Figure, BLUE, GREEN, AMBER, RED

# ── Your implementation ────────────────────────────────

class Stack:
    def __init__(self):
        pass

    def push(self, val):
        pass

    def pop(self):
        pass

    def peek(self):
        pass

    def is_empty(self):
        pass

    def size(self):
        pass


class Queue:
    def __init__(self):
        pass

    def enqueue(self, val):
        pass

    def dequeue(self):
        pass

    def front(self):
        pass

    def is_empty(self):
        pass

    def size(self):
        pass


def is_valid(s):
    pass


# ── Assertions ─────────────────────────────────────────
# Stack
s = Stack()
s.push(1); s.push(2); s.push(3)
assert s.peek() == 3,       f"peek() failed: {s.peek()}"
assert s.size() == 3,       f"size() failed: {s.size()}"
assert s.pop() == 3,        f"pop() should return 3"
assert s.pop() == 2,        f"pop() should return 2 (LIFO)"
assert s.pop() == 1,        f"pop() should return 1"
assert s.is_empty() == True, "is_empty() after all pops"
assert s.pop() is None,     "pop() on empty should return None"
print("✓ Stack: all assertions passed")

# Queue
q = Queue()
q.enqueue('A'); q.enqueue('B'); q.enqueue('C')
assert q.front() == 'A',    f"front() failed: {q.front()}"
assert q.size() == 3,       f"size() failed: {q.size()}"
assert q.dequeue() == 'A',  "dequeue() should return A (FIFO)"
assert q.dequeue() == 'B',  "dequeue() should return B"
assert q.dequeue() == 'C',  "dequeue() should return C"
assert q.is_empty() == True, "is_empty() after all dequeues"
assert q.dequeue() is None, "dequeue() on empty should return None"
print("✓ Queue: all assertions passed")

# is_valid
assert is_valid('()') == True
assert is_valid('({[]})') == True
assert is_valid('(]') == False
assert is_valid('{[]') == False
print("✓ is_valid: all assertions passed")

print()
print("Everything passes. Drawing your structures:")

# ── Visualize Stack state ──────────────────────────────
s2 = Stack()
for v in [5, 12, 8, 3]:
    s2.push(v)

n = len(s2.items)
fig = Figure(xmin=0, xmax=4, ymin=0, ymax=n+1,
             width=160, height=max(120, n*40+20),
             title="Your Stack (top = 3)")
fig.axes(labels=False, ticks=False)
for i, v in enumerate(s2.items):
    color = GREEN if i == n-1 else BLUE
    fig.point((2, i+0.7), color=color, label=str(v), radius=18)
print(fig.show())

# ── Visualize Queue state ──────────────────────────────
q2 = Queue()
for v in ['X', 'Y', 'Z']:
    q2.enqueue(v)

vals = q2.items
m = len(vals)
fig2 = Figure(xmin=0, xmax=m*2+1, ymin=0, ymax=3,
              width=max(200, m*80), height=100,
              title="Your Queue (front=X amber, back=Z green)")
fig2.axes(labels=False, ticks=False)
for i, v in enumerate(vals):
    x = 1 + i * 2
    color = AMBER if i == 0 else (GREEN if i == m-1 else BLUE)
    fig2.point((x, 1.5), color=color, label=str(v), radius=18)
    if i < m-1:
        fig2.arrow((x+0.3, 1.5), (x+1.7, 1.5), width=2)
print(fig2.show())`,
              output: '', status: 'idle', figureJson: null,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'Stack time complexities:\n- push: O(1) — append to end of array\n- pop: O(1) — remove from end of array\n- peek: O(1) — read last element\n- Space: O(n)',
      'Queue time complexities (array implementation):\n- enqueue: O(1) — append to end\n- dequeue: O(n) — shift all elements left (array)\n- dequeue: O(1) — with linked list or deque\n- front: O(1) — read first element\n- Space: O(n)',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Use collections.deque for O(1) queues in Python',
        body: 'Python\'s `collections.deque` supports O(1) `appendleft()` and `popleft()`. For production queues in Python, always use deque over a list. The list-based queue taught here is for understanding the concept — not performance.',
      },
    ],
    visualizations: [],
  },

  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],

  challenges: [
    {
      id: 'dsa1-003-c1',
      title: 'Implement a Queue Using Two Stacks',
      difficulty: 'hard',
      description: 'Implement a queue with only two Stack instances. enqueue() must be O(1). dequeue() can be amortized O(1).',
      starterCode: `class Stack:
    def __init__(self): self.items = []
    def push(self, v): self.items.append(v)
    def pop(self): return self.items.pop() if self.items else None
    def is_empty(self): return len(self.items) == 0

class QueueFromStacks:
    def __init__(self):
        self.inbox  = Stack()   # enqueue here
        self.outbox = Stack()   # dequeue from here

    def enqueue(self, val):
        # TODO: push onto inbox

    def dequeue(self):
        # TODO: if outbox is empty, pour all of inbox into outbox
        #   while not self.inbox.is_empty():
        #       self.outbox.push(self.inbox.pop())
        # TODO: return self.outbox.pop()
        pass

q = QueueFromStacks()
q.enqueue(1); q.enqueue(2); q.enqueue(3)
print(q.dequeue())  # 1 — FIFO
print(q.dequeue())  # 2
q.enqueue(4)
print(q.dequeue())  # 3
print(q.dequeue())  # 4`,
      solution: `def dequeue(self):
    if self.outbox.is_empty():
        while not self.inbox.is_empty():
            self.outbox.push(self.inbox.pop())
    return self.outbox.pop()`,
      hint: 'inbox receives all pushes. When outbox is empty and you need to dequeue, flip the entire inbox into outbox — this reverses the order, making the oldest item the new top of outbox.',
    },
  ],
};
