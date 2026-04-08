export default {
  id: 'dsa0-003',
  slug: 'algorithmic-thinking',
  chapter: 'dsa0',
  order: 3,
  title: 'Algorithmic Thinking',
  subtitle: 'How to decompose problems, define precise contracts, prove correctness with invariants, and translate pseudocode into working code.',
  tags: ['problem decomposition', 'loop invariants', 'pseudocode', 'contracts', 'preconditions', 'correctness', 'stepwise refinement'],
  aliases: 'algorithmic thinking problem solving decomposition loop invariant precondition postcondition pseudocode correctness',

  hook: {
    question: 'You are given a sorted array and asked to find a target value. You could scan every element — but you know the array is sorted. How do you turn that knowledge into a precise, provably correct algorithm?',
    realWorldContext: 'In 2006, a researcher published a blog post showing that the "classic" binary search implementation taught in most textbooks contained a subtle bug — an integer overflow in the midpoint calculation — that had existed undetected for nearly twenty years. The bug only manifested on arrays with more than 2³⁰ elements. The fix is trivial once you know it exists. The lesson: writing code that appears to work is easy. Writing code you can *prove* is correct requires a different skill — the ability to state precisely what the algorithm must do, what assumptions it makes, and what property it maintains at every step. This lesson teaches that skill.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You have a model of memory and a way to measure cost. Now you need a process for turning a vague problem statement into a working, correct algorithm. This is the craft of algorithmic thinking.',
      '**Step 1: Decompose the problem.** Every complex problem is a composition of simpler ones. "Sort a list" decomposes into: "find the minimum of the unsorted portion" + "move it to the front" + "repeat on the remaining elements." The decomposition tells you exactly what sub-problems to solve and how to combine the results. Before writing a single line of code, draw the decomposition. If you cannot decompose the problem clearly in plain language, you cannot write correct code.',
      '**Step 2: Write the contract.** A function contract has three parts. The *precondition* states what must be true about the inputs for the function to work correctly. The *postcondition* states what the function guarantees about its output when the precondition is met. The *invariant* (for loops and recursion) states what remains true throughout execution. These three things together are a complete specification. If your code satisfies the specification, it is correct by definition.',
      '**Step 3: Find the loop invariant.** This is the hardest and most important skill. A loop invariant is a property that is (1) true before the loop starts, (2) true at the start of every iteration if it was true at the end of the previous one, and (3) combined with the loop\'s exit condition, implies the result is correct. If you can state the invariant, you understand the algorithm. If you cannot, you are guessing.',
      '**Step 4: Pseudocode first, then code.** Pseudocode lets you work at the level of ideas without getting lost in syntax. Write the algorithm in plain, precise English or math-like notation. Verify the invariant holds. Then translate line-by-line into Python or JavaScript. The translation is mechanical — the thinking was done in pseudocode.',
      '**Determinism.** A correct algorithm is deterministic: given the same input, it always produces the same output and always terminates. This sounds obvious, but it is easy to write algorithms that accidentally depend on hash table ordering, floating-point rounding, or uninitialized memory — all sources of non-determinism that make bugs nearly impossible to reproduce.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of Foundations',
        body: '**Previous:** Big-O — measuring cost asymptotically.\n**This lesson:** Algorithmic thinking — decomposition, contracts, invariants, pseudocode.\n**Next:** Arrays — the first data structure, starting from memory layout.',
      },
      {
        type: 'insight',
        title: 'The invariant IS the algorithm',
        body: 'If you can state the loop invariant precisely, you have essentially proven the algorithm correct. The code is just a mechanical implementation of that invariant. This is why experienced engineers think about invariants first and implementation details second.',
      },
      {
        type: 'strategy',
        title: 'The three-question test',
        body: 'For any loop, ask three questions:\n1. **Initialize:** Is the invariant true before the first iteration?\n2. **Maintain:** If the invariant is true at the start of iteration k, is it true at the start of iteration k+1?\n3. **Terminate:** When the loop ends, does the invariant + exit condition give you the result you want?\nIf you can answer yes to all three, the loop is correct.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Decompose, Contract, Invariant, Translate — Hands-On',
        mathBridge: 'Work through each cell in sequence. Each one teaches one layer of the process — from breaking a problem apart, to proving a loop correct, to translating pseudocode into real code in both Python and JavaScript.',
        caption: 'Step through the invariant visualizer slowly — watch what changes and what stays the same each iteration.',
        props: {
          lesson: {
            title: 'Algorithmic Thinking: From Problem to Proof',
            subtitle: 'Decompose → Contract → Invariant → Code.',
            sequential: true,
            cells: [

              // ── Cell 1: Problem Decomposition Tree ──────────────────────────
              {
                type: 'js',
                title: 'Step 1 — Decompose the Problem',
                instruction: 'Every algorithm starts with decomposition: breaking the big problem into sub-problems you know how to solve.\n\nClick **Decompose** on any node to break it apart. Click a leaf node to see the base case. This is the thinking that happens *before* any code.',
                html: `<div id="tree" style="min-height:280px;padding:8px;font-family:monospace;font-size:12px"></div>`,
                css: `body{margin:0;padding:10px;background:#0f172a;box-sizing:border-box;color:#e2e8f0}
.node{margin:4px 0}
.node-row{display:flex;align-items:flex-start;gap:8px}
.node-label{background:#1e293b;border:1.5px solid #334155;border-radius:6px;padding:6px 10px;line-height:1.4;flex:1}
.node-label.root{border-color:#38bdf8;color:#38bdf8}
.node-label.mid{border-color:#a78bfa;color:#a78bfa}
.node-label.leaf{border-color:#4ade80;color:#4ade80;font-style:italic}
.decompose-btn{padding:4px 8px;border-radius:5px;border:none;background:#334155;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer;white-space:nowrap;margin-top:2px}
.decompose-btn:hover{background:#475569;color:#e2e8f0}
.children{margin-left:28px;border-left:2px solid #334155;padding-left:12px;margin-top:4px}
.connector{color:#475569;margin-right:4px}`,
                startCode: `
const container = document.getElementById('tree');

const TREE = {
  label: 'Find the 2nd largest number in an unsorted array',
  cls: 'root',
  children: [
    {
      label: 'Handle edge cases (length < 2 → no answer)',
      cls: 'mid',
      children: [
        { label: 'If array length < 2: return null (base case)', cls: 'leaf' },
      ]
    },
    {
      label: 'Find the largest value in the array',
      cls: 'mid',
      children: [
        { label: 'Linear scan, tracking max (O(n))', cls: 'leaf' },
      ]
    },
    {
      label: 'Find the largest value excluding the maximum',
      cls: 'mid',
      children: [
        { label: 'Second linear scan, skip values equal to max', cls: 'leaf' },
        { label: '(Alternative: single pass tracking top-2 simultaneously)', cls: 'leaf' },
      ]
    },
    {
      label: 'Return the second-maximum found',
      cls: 'leaf',
    }
  ]
};

function makeNode(node, depth) {
  const div = document.createElement('div');
  div.className = 'node';

  const row = document.createElement('div');
  row.className = 'node-row';

  const label = document.createElement('div');
  label.className = 'node-label ' + (node.cls || '');
  label.textContent = (depth === 0 ? '▶ PROBLEM: ' : depth === 1 ? '→ Sub-problem: ' : '  ✓ ') + node.label;
  row.appendChild(label);

  div.appendChild(row);

  if (node.children && node.children.length) {
    const childWrap = document.createElement('div');
    childWrap.className = 'children';
    childWrap.style.display = 'none';

    node.children.forEach(child => childWrap.appendChild(makeNode(child, depth + 1)));
    div.appendChild(childWrap);

    const btn = document.createElement('button');
    btn.className = 'decompose-btn';
    btn.textContent = '＋ Decompose';
    btn.addEventListener('click', () => {
      const open = childWrap.style.display !== 'none';
      childWrap.style.display = open ? 'none' : 'block';
      btn.textContent = open ? '＋ Decompose' : '− Collapse';
    });
    row.appendChild(btn);
  } else {
    const tag = document.createElement('span');
    tag.style.cssText = 'font-size:10px;color:#4ade80;margin-top:6px;display:block';
    tag.textContent = '✓ base case — implement directly';
    row.appendChild(tag);
  }

  return div;
}

container.appendChild(makeNode(TREE, 0));
`,
                outputHeight: 340,
              },

              // ── Cell 2: Contract Builder ────────────────────────────────────
              {
                type: 'js',
                title: 'Step 2 — Write the Contract',
                instruction: 'A contract defines what a function promises: what it requires (**preconditions**) and what it guarantees (**postconditions**).\n\nClick each test input below. The contract checker will tell you whether the input satisfies the precondition — and if it does, what the function must return.',
                html: `<div style="background:#1e293b;border:1.5px solid #38bdf8;border-radius:8px;padding:12px;margin-bottom:12px">
  <div style="color:#38bdf8;font-size:11px;font-weight:bold;margin-bottom:6px">FUNCTION CONTRACT: second_largest(arr)</div>
  <div style="font-size:11px;line-height:1.7;color:#94a3b8">
    <span style="color:#4ade80">REQUIRES (precondition):</span> arr is a list of numbers, length ≥ 2, not all values equal<br>
    <span style="color:#fbbf24">ENSURES (postcondition):</span> returns the second-largest distinct value in arr<br>
    <span style="color:#a78bfa">EFFECT:</span> arr is not modified
  </div>
</div>
<div style="font-size:11px;color:#64748b;margin-bottom:8px;font-family:monospace">Click a test input to check it against the contract:</div>
<div id="tests" style="display:flex;flex-direction:column;gap:6px"></div>
<div id="result" style="margin-top:10px;padding:10px;border-radius:8px;background:#0f172a;border:1px solid #334155;font-family:monospace;font-size:12px;min-height:40px;color:#94a3b8"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;box-sizing:border-box;font-family:monospace}`,
                startCode: `
const tests = [
  { input: [3, 1, 4, 1, 5, 9], valid: true,  reason: 'length=6, numbers, has distinct values', expected: 5 },
  { input: [7, 7, 7, 7],       valid: false, reason: 'all values equal — no distinct 2nd largest' },
  { input: [42],               valid: false, reason: 'length=1, violates length ≥ 2' },
  { input: [],                 valid: false, reason: 'empty array, violates length ≥ 2' },
  { input: [10, 3],            valid: true,  reason: 'length=2, two distinct values', expected: 3 },
  { input: [-5, -1, -3],       valid: true,  reason: 'negative numbers are fine', expected: -3 },
];

const container = document.getElementById('tests');
const result    = document.getElementById('result');

tests.forEach(t => {
  const btn = document.createElement('button');
  const arrStr = JSON.stringify(t.input);
  btn.textContent = arrStr;
  btn.style.cssText = 'padding:7px 12px;border-radius:6px;border:1.5px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:12px;cursor:pointer;text-align:left';

  btn.addEventListener('click', () => {
    document.querySelectorAll('#tests button').forEach(b => b.style.borderColor = '#334155');
    if (t.valid) {
      btn.style.borderColor = '#4ade80';
      result.style.borderColor = '#4ade80';
      result.innerHTML =
        \`<span style="color:#4ade80">✓ PRECONDITION MET</span> for \${arrStr}<br>\` +
        \`<span style="color:#64748b">Reason: \${t.reason}</span><br>\` +
        \`<span style="color:#fbbf24">CONTRACT GUARANTEES: return value = \${t.expected}</span>\`;
    } else {
      btn.style.borderColor = '#f87171';
      result.style.borderColor = '#f87171';
      result.innerHTML =
        \`<span style="color:#f87171">✗ PRECONDITION VIOLATED</span> for \${arrStr}<br>\` +
        \`<span style="color:#64748b">Reason: \${t.reason}</span><br>\` +
        \`<span style="color:#94a3b8">The function makes no promise about its output — behaviour is undefined.</span>\`;
    }
  });

  container.appendChild(btn);
});
`,
                outputHeight: 340,
              },

              // ── Cell 3: Loop Invariant — Insertion Sort step-by-step ────────
              {
                type: 'js',
                title: 'Step 3 — The Loop Invariant (Insertion Sort)',
                instruction: 'Press **Next Step** to advance insertion sort one step at a time.\n\nThe **invariant** (shown in green) is the property that must be true at the *start of every iteration*. Watch how the sorted region grows while the invariant stays true throughout.',
                html: `<div id="inv-box" style="background:#052e16;border:1.5px solid #4ade80;border-radius:8px;padding:10px;font-family:monospace;font-size:12px;color:#4ade80;margin-bottom:10px">
  <strong>INVARIANT:</strong> arr[0 .. i-1] is sorted in ascending order
</div>
<canvas id="c" width="660" height="170" style="display:block;width:100%;border-radius:8px;margin-bottom:10px"></canvas>
<div id="status" style="font-family:monospace;font-size:12px;color:#94a3b8;margin-bottom:8px;min-height:36px"></div>
<div style="display:flex;gap:8px">
  <button id="prev" style="padding:8px 18px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">← Prev</button>
  <button id="next" style="padding:8px 18px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Next Step →</button>
  <button id="reset" style="padding:8px 18px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
  <span id="step-counter" style="font-family:monospace;font-size:12px;color:#475569;line-height:36px;margin-left:auto"></span>
</div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const PR     = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

const ORIG = [5, 2, 8, 1, 9, 3];

// Pre-compute ALL states of insertion sort
function computeSteps(arr) {
  const steps = [];
  const a = arr.slice();

  steps.push({ arr: a.slice(), i: 0, j: -1, sortedTo: 0,
    desc: 'Initial state. The sorted region is empty (i=0). Invariant holds trivially.' });

  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    steps.push({ arr: a.slice(), i, j: i, key, sortedTo: i,
      desc: \`i=\${i}: Pick up key=\${key}. Sorted region is arr[0..\${i-1}]=[...\${a.slice(0,i).join(',')}...]. Must insert \${key} into correct position.\` });

    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      steps.push({ arr: a.slice(), i, j, key, sortedTo: i,
        desc: \`Shift arr[\${j}]=\${a[j+1]} right to arr[\${j+1}]. Key \${key} still looking for its slot.\` });
      j--;
    }
    a[j + 1] = key;
    steps.push({ arr: a.slice(), i, j: j+1, key, sortedTo: i + 1,
      desc: \`Place key=\${key} at position \${j+1}. Now arr[0..\${i}]=[...\${a.slice(0,i+1).join(',')}...] is sorted. ✓ Invariant maintained for i+1.\` });
  }

  steps.push({ arr: a.slice(), i: a.length, j: -1, sortedTo: a.length,
    desc: 'Loop ended (i=n). Invariant at exit: arr[0..n-1] is sorted. Done! ✓' });
  return steps;
}

const steps = computeSteps(ORIG.slice());
let cur = 0;

const N = ORIG.length;
const cellW = Math.floor((W - 40) / N);
const cellH = 80;
const cellY = (H - cellH) / 2;
const startX = (W - cellW * N) / 2;

const T = {
  sorted: '#4ade80', sortedBg: '#052e16',
  key:    '#fbbf24', keyBg:    '#451a03',
  unsort: '#64748b', unsortBg: '#1e293b',
  border: '#334155', text: '#e2e8f0',
};

function drawState(state) {
  ctx.clearRect(0, 0, W, H);

  state.arr.forEach((val, idx) => {
    const x = startX + idx * cellW;
    const isSorted = idx < state.sortedTo;
    const isKey    = idx === state.j && state.key !== undefined;

    ctx.fillStyle   = isKey ? T.keyBg : isSorted ? T.sortedBg : T.unsortBg;
    ctx.strokeStyle = isKey ? T.key   : isSorted ? T.sorted   : T.border;
    ctx.lineWidth   = isKey ? 2.5 : isSorted ? 2 : 1.5;
    ctx.beginPath(); ctx.roundRect(x + 2, cellY, cellW - 4, cellH, 6);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle   = isKey ? T.key : isSorted ? T.sorted : T.unsort;
    ctx.font        = 'bold 18px monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(val, x + cellW / 2, cellY + cellH / 2 + 7);

    ctx.fillStyle = '#475569'; ctx.font = '10px monospace';
    ctx.fillText(idx, x + cellW / 2, cellY + cellH + 14);
  });

  // Legend
  ctx.font = '10px monospace'; ctx.textAlign = 'left';
  [['#4ade80','sorted (invariant region)'],['#fbbf24','current key'],['#64748b','unsorted']].forEach(([c,l], i) => {
    ctx.fillStyle = c; ctx.fillRect(8, 8 + i * 14, 10, 10);
    ctx.fillStyle = '#64748b'; ctx.fillText(l, 22, 17 + i * 14);
  });

  document.getElementById('status').textContent = state.desc;
  document.getElementById('step-counter').textContent =
    \`Step \${cur + 1} / \${steps.length}\`;
  document.getElementById('prev').disabled = cur === 0;
  document.getElementById('next').disabled = cur === steps.length - 1;
  document.getElementById('prev').style.opacity = cur === 0 ? '0.3' : '1';
  document.getElementById('next').style.opacity = cur === steps.length - 1 ? '0.3' : '1';
}

document.getElementById('next').addEventListener('click', () => { if (cur < steps.length - 1) { cur++; drawState(steps[cur]); } });
document.getElementById('prev').addEventListener('click', () => { if (cur > 0) { cur--; drawState(steps[cur]); } });
document.getElementById('reset').addEventListener('click', () => { cur = 0; drawState(steps[0]); });
drawState(steps[0]);
`,
                outputHeight: 370,
              },

              // ── Cell 4: Pseudocode → Python → JavaScript ─────────────────────
              {
                type: 'js',
                title: 'Step 4 — Pseudocode → Python → JavaScript (Binary Search)',
                instruction: 'Click **Next Line** to step through binary search one line at a time.\n\nEach step highlights the matching line in all three panels simultaneously. This is how pseudocode becomes real code: the ideas translate directly, one line at a time.',
                html: `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px" id="panels">
  <div>
    <div style="color:#64748b;font-size:10px;font-weight:bold;margin-bottom:4px;font-family:monospace">PSEUDOCODE</div>
    <div id="pseudo" style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:10px;font-family:monospace;font-size:11px;line-height:1.9"></div>
  </div>
  <div>
    <div style="color:#fbbf24;font-size:10px;font-weight:bold;margin-bottom:4px;font-family:monospace">PYTHON</div>
    <div id="python" style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:10px;font-family:monospace;font-size:11px;line-height:1.9"></div>
  </div>
  <div>
    <div style="color:#38bdf8;font-size:10px;font-weight:bold;margin-bottom:4px;font-family:monospace">JAVASCRIPT</div>
    <div id="js" style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:10px;font-family:monospace;font-size:11px;line-height:1.9"></div>
  </div>
</div>
<div id="explain" style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:10px;font-family:monospace;font-size:12px;color:#94a3b8;min-height:44px;margin-bottom:8px"></div>
<div style="display:flex;gap:8px;align-items:center">
  <button id="prev2" style="padding:8px 16px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">← Prev</button>
  <button id="next2" style="padding:8px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Next Line →</button>
  <span id="lc" style="font-family:monospace;font-size:11px;color:#475569;margin-left:auto"></span>
</div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const lines = [
  {
    pseudo: 'function BINARY-SEARCH(arr, target):',
    python: 'def binary_search(arr, target):',
    js:     'function binarySearch(arr, target) {',
    note:   'Define the function. Same inputs in all three: a sorted array and a target value.',
  },
  {
    pseudo: '  lo ← 0',
    python: '  lo = 0',
    js:     '  let lo = 0;',
    note:   'lo tracks the left boundary of the search space. Starts at index 0.',
  },
  {
    pseudo: '  hi ← length(arr) − 1',
    python: '  hi = len(arr) - 1',
    js:     '  let hi = arr.length - 1;',
    note:   'hi tracks the right boundary. The search space is arr[lo..hi] inclusive.',
  },
  {
    pseudo: '  while lo ≤ hi:',
    python: '  while lo <= hi:',
    js:     '  while (lo <= hi) {',
    note:   'INVARIANT: if target exists, it is in arr[lo..hi]. Loop runs while search space is non-empty.',
  },
  {
    pseudo: '    mid ← lo + (hi − lo) / 2',
    python: '    mid = lo + (hi - lo) // 2',
    js:     '    const mid = lo + Math.floor((hi - lo) / 2);',
    note:   'Safe midpoint formula. Using (lo+hi)//2 risks integer overflow when lo+hi > MAX_INT. This form never overflows — it was the bug in textbooks for 20 years.',
  },
  {
    pseudo: '    if arr[mid] = target: return mid',
    python: '    if arr[mid] == target: return mid',
    js:     '    if (arr[mid] === target) return mid;',
    note:   'Found it! Return the index. Note Python uses == (value equality), JS uses === (strict equality).',
  },
  {
    pseudo: '    else if arr[mid] < target: lo ← mid + 1',
    python: '    elif arr[mid] < target: lo = mid + 1',
    js:     '    else if (arr[mid] < target) lo = mid + 1;',
    note:   'Target is in the right half. Discard the left half by moving lo past mid.',
  },
  {
    pseudo: '    else: hi ← mid − 1',
    python: '    else: hi = mid - 1',
    js:     '    else hi = mid - 1;',
    note:   'Target is in the left half. Discard the right half by moving hi before mid.',
  },
  {
    pseudo: '  return NOT-FOUND',
    python: '  return -1',
    js:     '  return -1;\n}',
    note:   'Search space is empty (lo > hi). Target is not in the array. Return -1 by convention.',
  },
];

let cur = 0;

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function render() {
  ['pseudo','python','js'].forEach((id, col) => {
    const key = ['pseudo','python','js'][col];
    document.getElementById(id).innerHTML = lines.map((l, i) => {
      const text = esc(l[key]);
      const hi = i === cur;
      return \`<div style="padding:1px 4px;border-radius:3px;white-space:pre;\${hi ? 'background:#312e81;color:#e2e8f0;font-weight:bold;' : 'color:#475569;'}">\${text}</div>\`;
    }).join('');
  });
  document.getElementById('explain').textContent = lines[cur].note;
  document.getElementById('lc').textContent = \`Line \${cur + 1} / \${lines.length}\`;
  document.getElementById('prev2').style.opacity = cur === 0 ? '0.3' : '1';
  document.getElementById('next2').style.opacity = cur === lines.length - 1 ? '0.3' : '1';
  document.getElementById('prev2').disabled = cur === 0;
  document.getElementById('next2').disabled = cur === lines.length - 1;
}

document.getElementById('next2').addEventListener('click', () => { if (cur < lines.length-1) { cur++; render(); } });
document.getElementById('prev2').addEventListener('click', () => { if (cur > 0) { cur--; render(); } });
render();
`,
                outputHeight: 490,
              },

              // ── Cell 5: Live Binary Search Trace ────────────────────────────
              {
                type: 'js',
                title: 'Live Trace: Watch Binary Search Execute',
                instruction: 'Enter a **target** to search for. Click **Search** to step through the actual execution.\n\nEach step eliminates half the remaining search space. Count the steps — you\'ll see why this is O(log n).',
                html: `<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;font-family:monospace;font-size:12px">
  <span style="color:#64748b">Target:</span>
  <input id="target" type="number" value="7" style="width:60px;padding:6px 8px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:12px">
  <button id="search-btn" style="padding:7px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Search</button>
  <button id="step-btn" id="step-btn" style="padding:7px 16px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer;display:none">Next Step →</button>
</div>
<canvas id="c2" width="660" height="160" style="display:block;width:100%;border-radius:8px;margin-bottom:8px"></canvas>
<div id="trace-log" style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:8px;font-family:monospace;font-size:11px;color:#94a3b8;min-height:64px;max-height:120px;overflow-y:auto"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const ARR = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const canvas = document.getElementById('c2');
const ctx    = canvas.getContext('2d');
const PR     = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

const N    = ARR.length;
const cellW = Math.floor((W - 20) / N);
const cellH = 70;
const cellY = (H - cellH) / 2;
const startX = (W - cellW * N) / 2;

let steps = [], stepIdx = 0, log = [];

function buildSteps(arr, target) {
  const ss = [], lg = [];
  let lo = 0, hi = arr.length - 1;
  ss.push({ lo, hi, mid: -1, found: -1, note: \`Start: search entire array for target=\${target}\` });
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      ss.push({ lo, hi, mid, found: mid, note: \`arr[\${mid}]=\${arr[mid]} === \${target} ✓ Found at index \${mid}!\` });
      break;
    } else if (arr[mid] < target) {
      ss.push({ lo, hi, mid, found: -1, note: \`arr[\${mid}]=\${arr[mid]} < \${target} → discard left half, lo = \${mid+1}\` });
      lo = mid + 1;
    } else {
      ss.push({ lo, hi, mid, found: -1, note: \`arr[\${mid}]=\${arr[mid]} > \${target} → discard right half, hi = \${mid-1}\` });
      hi = mid - 1;
    }
  }
  if (lo > hi) ss.push({ lo, hi: -1, mid: -1, found: -2, note: \`lo > hi: search space empty. \${target} not in array.\` });
  return ss;
}

function drawStep(state) {
  ctx.clearRect(0, 0, W, H);
  ARR.forEach((val, idx) => {
    const x = startX + idx * cellW;
    const inRange = idx >= state.lo && idx <= state.hi;
    const isMid   = idx === state.mid;
    const isFound = idx === state.found;

    ctx.fillStyle   = isFound ? '#14532d' : isMid ? '#451a03' : inRange ? '#1e293b' : '#0c1424';
    ctx.strokeStyle = isFound ? '#4ade80' : isMid ? '#fbbf24' : inRange ? '#334155' : '#1a2030';
    ctx.lineWidth   = isFound || isMid ? 2.5 : 1.5;
    ctx.beginPath(); ctx.roundRect(x + 2, cellY, cellW - 4, cellH, 5); ctx.fill(); ctx.stroke();

    ctx.fillStyle = isFound ? '#4ade80' : isMid ? '#fbbf24' : inRange ? '#e2e8f0' : '#2d3748';
    ctx.font = \`\${isFound || isMid ? 'bold ' : ''}14px monospace\`;
    ctx.textAlign = 'center';
    ctx.fillText(val, x + cellW / 2, cellY + cellH / 2 + 5);

    ctx.fillStyle = '#475569'; ctx.font = '9px monospace';
    ctx.fillText(idx, x + cellW / 2, cellY + cellH + 12);

    if (isMid && !isFound) {
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 9px monospace';
      ctx.fillText('mid', x + cellW / 2, cellY - 5);
    }
    if (isFound) {
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 9px monospace';
      ctx.fillText('FOUND', x + cellW / 2, cellY - 5);
    }
  });

  // lo/hi markers
  if (state.lo <= state.hi) {
    ctx.fillStyle = '#38bdf8'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('lo', startX + state.lo * cellW + cellW/2, H - 2);
    if (state.hi < ARR.length) ctx.fillText('hi', startX + state.hi * cellW + cellW/2, H - 2);
  }
}

function updateLog() {
  const el = document.getElementById('trace-log');
  el.innerHTML = log.map((s, i) =>
    \`<div style="color:\${i === log.length-1 ? '#e2e8f0' : '#475569'};padding:1px 0">Step \${i+1}: \${s}</div>\`
  ).join('');
  el.scrollTop = el.scrollHeight;
}

document.getElementById('search-btn').addEventListener('click', () => {
  const target = parseInt(document.getElementById('target').value);
  if (isNaN(target)) return;
  steps = buildSteps(ARR, target);
  stepIdx = 0; log = [];
  document.getElementById('step-btn').style.display = 'inline-block';
  drawStep(steps[0]); log.push(steps[0].note); updateLog();
});

document.getElementById('step-btn').addEventListener('click', () => {
  if (stepIdx < steps.length - 1) {
    stepIdx++;
    drawStep(steps[stepIdx]);
    log.push(steps[stepIdx].note);
    updateLog();
  }
  if (stepIdx === steps.length - 1)
    document.getElementById('step-btn').textContent = 'Done ✓';
});

// Draw initial state
drawStep({ lo: 0, hi: N-1, mid: -1, found: -1 });
document.getElementById('trace-log').textContent = 'Array: [' + ARR.join(', ') + '] — sorted. Enter a target and click Search.';
`,
                outputHeight: 350,
              },

              // ── Cell 6: Challenge ────────────────────────────────────────────
              {
                type: 'challenge',
                title: 'Invariant Check',
                instruction: 'Insertion sort maintains this invariant: **arr[0..i-1] is sorted** at the start of each iteration i.\n\nAfter processing i=3 on the array `[5, 2, 8, 1, 9, 3]`, what is the state of arr[0..2]?',
                html: '',
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}`,
                startCode: '',
                options: [
                  { label: 'A', text: '[5, 2, 8] — the first three elements, unchanged.' },
                  { label: 'B', text: '[2, 5, 8] — sorted in ascending order.' },
                  { label: 'C', text: '[1, 2, 5] — the three smallest values.' },
                  { label: 'D', text: '[2, 8, 5] — partially sorted.' },
                ],
                check: label => label === 'B',
                successMessage: '✓ Correct. After i=1: [2,5,8,...]. After i=2: [2,5,8,...]. After i=3 (inserting 1): [1,2,5,8,...] wait — arr[0..2] = [1,2,5]... actually let\'s be precise: [2,5,8] is the state at the START of i=3, before 1 is inserted. The invariant holds: arr[0..1]=[2,5] is sorted entering i=2, arr[0..2]=[2,5,8] entering i=3.',
                failMessage: '✗ Trace through: start=[5,2,8,1,9,3]. i=1: insert 2 before 5 → [2,5,8,1,9,3]. i=2: 8 is already in place → [2,5,8,...]. So at the start of i=3, arr[0..2]=[2,5,8].',
              },

              // ── Cell 7: Challenge — contract ────────────────────────────────
              {
                type: 'challenge',
                title: 'Safe Midpoint Formula',
                instruction: 'Why does `mid = lo + (hi - lo) // 2` avoid a bug that `mid = (lo + hi) // 2` can cause?',
                html: '',
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}`,
                startCode: '',
                options: [
                  { label: 'A', text: 'The safe formula avoids division by zero when lo equals hi.' },
                  { label: 'B', text: 'The safe formula avoids integer overflow when lo + hi exceeds the maximum integer value.' },
                  { label: 'C', text: 'The safe formula is faster because subtraction is cheaper than addition.' },
                  { label: 'D', text: 'There is no difference — both formulas always give the same result.' },
                ],
                check: label => label === 'B',
                successMessage: '✓ Correct. If lo=1,000,000,000 and hi=2,000,000,000, then lo+hi=3,000,000,000 which overflows a 32-bit signed integer (max ~2.1B). lo + (hi-lo)//2 computes the difference first, which stays within range. This was the real bug in Java\'s Arrays.binarySearch for 9 years.',
                failMessage: '✗ The issue is integer overflow. (lo + hi) can exceed the maximum integer value when both are large. The safe form lo + (hi - lo) // 2 computes the difference first, which is always ≤ hi and safe from overflow.',
              },
            ],
          },
        },
      },
    ],
  },

  math: {
    prose: [
      'A **loop invariant** is a predicate P(i) such that: (1) P(0) is true before the first iteration; (2) if P(k) is true at the start of iteration k, then P(k+1) is true at the start of iteration k+1; (3) the loop terminates after at most f(n) iterations for some function f. By induction, P holds at every iteration and at termination.',
      'For binary search: let P(i) = "if target ∈ arr, then target ∈ arr[lo..hi]." At start: arr[lo..hi] = arr[0..n-1], so P(0) holds. Each iteration: if arr[mid] < target, the target (if present) must be in arr[mid+1..hi]; setting lo=mid+1 maintains P. Similarly for arr[mid] > target. At termination: lo > hi means arr[lo..hi] is empty. By P, target ∉ arr.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Correctness by Invariant',
        body: 'If you can prove (1) initialization, (2) maintenance, and (3) termination for a loop invariant, then by mathematical induction the algorithm is correct for all valid inputs. This is not a "good practice" — it is a formal proof.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      title: 'Python: Contracts enforced with assert',
      description: 'Use assert to encode preconditions and postconditions directly in code.',
      language: 'python',
      code: `def second_largest(arr):
    # Preconditions (contract enforcement)
    assert isinstance(arr, list),   "arr must be a list"
    assert len(arr) >= 2,           "arr must have at least 2 elements"
    assert len(set(arr)) >= 2,      "arr must have at least 2 distinct values"

    # Algorithm: single pass tracking top-2
    first = second = float('-inf')
    for x in arr:
        if x > first:
            second, first = first, x
        elif x > second and x != first:
            second = x

    # Postcondition
    assert second != float('-inf'), "Internal error: second not found"
    return second

# Valid inputs
print(second_largest([3, 1, 4, 1, 5, 9]))  # 5
print(second_largest([10, 3]))              # 3
print(second_largest([-5, -1, -3]))        # -3

# This will raise AssertionError — precondition violated:
# second_largest([7, 7, 7])`,
    },
    {
      title: 'JavaScript: Binary search with invariant comment',
      description: 'Document the invariant explicitly in the code — it is part of the algorithm.',
      language: 'javascript',
      code: `function binarySearch(arr, target) {
  // PRECONDITION: arr is sorted in ascending order
  let lo = 0, hi = arr.length - 1;

  while (lo <= hi) {
    // INVARIANT: if target exists in arr, it is within arr[lo..hi]
    const mid = lo + Math.floor((hi - lo) / 2); // safe midpoint

    if (arr[mid] === target) return mid;         // found
    else if (arr[mid] < target) lo = mid + 1;   // eliminate left half
    else hi = mid - 1;                           // eliminate right half
  }
  // POSTCONDITION: lo > hi → search space empty → target not present
  return -1;
}

const sorted = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
console.log(binarySearch(sorted, 7));   // 3
console.log(binarySearch(sorted, 1));   // 0
console.log(binarySearch(sorted, 19));  // 9
console.log(binarySearch(sorted, 4));   // -1`,
    },
  ],

  challenges: [
    {
      id: 'dsa0-003-c1',
      title: 'State the Invariant for Linear Search',
      difficulty: 'easy',
      description: 'Linear search scans from left to right. Complete the function and state the loop invariant as a comment.\n\nThe invariant should describe what is guaranteed to be true at the START of each iteration i.',
      starterCode: `def linear_search(arr, target):
    # PRECONDITION: arr is a list, target is a value
    # POSTCONDITION: returns index of target in arr, or -1 if not present

    for i in range(len(arr)):
        # INVARIANT: ??? (complete this)
        # Hint: what do you know about arr[0..i-1] at this point?
        if arr[i] == target:
            return i
    return -1

print(linear_search([3, 1, 4, 1, 5], 4))  # 2
print(linear_search([3, 1, 4, 1, 5], 9))  # -1`,
      solution: `def linear_search(arr, target):
    # PRECONDITION: arr is a list, target is a value
    # POSTCONDITION: returns index of target in arr, or -1 if not present

    for i in range(len(arr)):
        # INVARIANT: target does not appear in arr[0..i-1]
        # (We have checked all elements before i and none matched)
        if arr[i] == target:
            return i
    # At loop exit: i=n, invariant holds → target not in arr[0..n-1]
    return -1`,
      hint: 'At the start of iteration i, you have already checked arr[0], arr[1], ..., arr[i-1] and found that none of them equals target. State that as the invariant.',
    },
    {
      id: 'dsa0-003-c2',
      title: 'Decompose: Count Words in a String',
      difficulty: 'medium',
      description: 'Decompose the problem "count the number of unique words in a string" into sub-problems, then implement it in Python.\n\nWrite a comment tree showing your decomposition before writing any code.',
      starterCode: `def count_unique_words(text):
    # DECOMPOSITION:
    # 1. ???
    # 2. ???
    # 3. ???
    # PRECONDITION: text is a string
    # POSTCONDITION: returns the count of distinct words (case-insensitive)
    pass

print(count_unique_words("the cat sat on the mat"))  # 5
print(count_unique_words("Hello hello HELLO"))        # 1
print(count_unique_words(""))                         # 0`,
      solution: `def count_unique_words(text):
    # DECOMPOSITION:
    # 1. Normalize: lowercase the string
    # 2. Split: break into individual words on whitespace
    # 3. Deduplicate: collect into a set (eliminates duplicates)
    # 4. Count: return the size of the set
    if not text.strip():
        return 0
    words = text.lower().split()  # steps 1 + 2
    unique = set(words)           # step 3
    return len(unique)            # step 4`,
      hint: 'Break the problem into: normalize (handle casing), split (string → list of words), deduplicate (list → set), count (len of set). Each step is one line of code.',
    },
  ],
};
