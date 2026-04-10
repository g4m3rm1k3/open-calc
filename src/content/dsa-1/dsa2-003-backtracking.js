export default {
  id: 'dsa2-003',
  slug: 'backtracking',
  chapter: 'dsa2',
  order: 3,
  title: 'Backtracking',
  subtitle: 'Recursion that explores choices and retreats when a path fails. Every constraint satisfaction problem — sudoku, N-queens, permutations, mazes — is a backtracking problem in disguise.',
  tags: ['backtracking', 'recursion', 'constraint satisfaction', 'permutations', 'subsets', 'N-queens', 'maze', 'pruning', 'decision tree'],
  aliases: 'backtracking recursion constraint satisfaction permutations subsets N-queens maze pruning decision tree',

  hook: {
    question: 'How do you find all possible arrangements of items, or solve a puzzle that requires trying choices one at a time and undoing them when they lead to dead ends?',
    realWorldContext: 'Backtracking powers puzzle solvers (sudoku, crosswords), game AI (chess move generation), compiler optimization (register allocation), route planning with constraints, and scheduling systems. The N-queens problem is a classic interview question. Understanding backtracking means understanding how to search a solution space systematically — without brute-forcing every possibility blindly.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You know recursion (base case + recursive case) and memoization (cache to avoid redundant work). Backtracking is recursion applied to **decision trees** — at each step you make a choice, recurse deeper, and if the choice leads to failure, you **undo** it and try the next option.',
      '**The template.** Every backtracking function looks the same:\n```\nfunction backtrack(state, choices):\n  if goal reached: record solution, return\n  for each choice:\n    if choice is valid:\n      make the choice (modify state)\n      backtrack(new state, remaining choices)\n      undo the choice (restore state)  ← this is the "back" in backtracking\n```\nThe undo step is what makes it backtracking and not just recursion.',
      '**Permutations: every ordering.** To generate all permutations of `[1,2,3]`: at each position, try every unused number. Mark it used, recurse to fill the next position, then unmark it. When the current path fills all positions, record it.',
      '**Subsets: every combination.** For subsets of `[1,2,3]`: at each index, decide include or exclude. Two choices, recurse both, no undo needed (you pass a new array each time). Produces 2^n subsets.',
      '**Pruning cuts dead ends early.** If you know a partial state can\'t possibly lead to a valid solution, don\'t recurse into it. This is called pruning and can reduce the search space from exponential to manageable. N-queens prunes by checking row/column/diagonal conflicts before placing a queen.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 2, Lesson 3: Backtracking',
        body: '**Previous:** Recursion Trees & Memoization — caching to avoid redundant work.\n**This lesson:** Backtracking — systematic choice + undo to explore solution spaces.\n**Next:** Chapter 3 — Hashing.',
      },
      {
        type: 'insight',
        title: 'State must be fully restored after each branch',
        body: 'The "undo" step is the hardest part to get right. After recursing into a choice, the state must be exactly what it was before that choice. If you pass a copy of state into each call, undo is automatic. If you mutate shared state, you must explicitly reverse every mutation.',
      },
      {
        type: 'strategy',
        title: 'How to approach any backtracking problem',
        body: '1. What is the state? (current path, board, remaining choices)\n2. What is the goal? (when do you record a solution?)\n3. What are the choices at each step?\n4. What makes a choice invalid? (pruning condition)\n5. How do you undo a choice?',
      },
      {
        type: 'warning',
        title: 'Backtracking is exponential — but pruning saves it',
        body: 'Without pruning, permutations of n items = n! paths. With aggressive pruning (like N-queens\' conflict check), the actual explored paths drop dramatically. Always prune as early as possible — check validity before recursing, not after.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Decision Tree: Watching Backtracking Explore and Retreat',
        mathBridge: 'Each node is a choice. Green nodes lead to a valid partial state. Red nodes are pruned — backtracking retreats immediately. Gold nodes are complete solutions.',
        caption: 'The algorithm explores depth-first, retreating whenever a branch fails.',
        props: {
          lesson: {
            title: 'Backtracking: Exploring and Retreating',
            subtitle: 'Make a choice, recurse, undo.',
            sequential: false,
            cells: [
              {
                type: 'js',
                title: 'Permutations of [1,2,3]: The Decision Tree',
                instruction: 'Click **Generate** to watch the backtracking algorithm build all permutations of [1,2,3].\n\nEach level of the tree is one position in the permutation. At each node, every unused number is tried. When a complete permutation is found (leaf), it\'s recorded and backtracking retreats.',
                html: `<div style="margin-bottom:8px;display:flex;gap:8px;align-items:center">
  <button id="btn-gen" style="padding:7px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Generate</button>
  <button id="btn-step" style="padding:7px 14px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">Step</button>
  <button id="btn-rst" style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
  <span id="info" style="font-family:monospace;font-size:11px;color:#94a3b8"></span>
</div>
<canvas id="c" width="620" height="220" style="display:block;width:100%;border-radius:6px;background:#0a0f1e"></canvas>
<div id="results" style="margin-top:8px;font-family:monospace;font-size:11px;color:#4ade80;min-height:18px"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}`,
                startCode: `const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const PR = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

const ITEMS = [1, 2, 3];
const steps = [];
const solutions = [];

// Build all backtracking steps
function buildSteps(path, used, depth, x, spread) {
  if (path.length === ITEMS.length) {
    solutions.push([...path]);
    steps.push({ type: 'solution', path: [...path], depth, x });
    return;
  }
  for (let i = 0; i < ITEMS.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    path.push(ITEMS[i]);
    const childX = x + (i - 1) * spread;
    steps.push({ type: 'choose', path: [...path], depth: depth+1, x: childX, val: ITEMS[i] });
    buildSteps(path, used, depth+1, childX, spread * 0.4);
    steps.push({ type: 'undo', path: [...path], depth: depth+1, x: childX });
    path.pop();
    used[i] = false;
  }
}

buildSteps([], [false,false,false], 0, 0.5, 0.3);

const nodes = [];
let stepIdx = 0;

function nodePos(depth, x) {
  return { cx: x * W, cy: 20 + depth * (H - 30) / 4 };
}

function drawAll() {
  ctx.clearRect(0, 0, W, H);
  nodes.forEach(nd => {
    if (nd.parent) {
      const p = nodePos(nd.parent.depth, nd.parent.x);
      const c = nodePos(nd.depth, nd.x);
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.cx, p.cy+10); ctx.lineTo(c.cx, c.cy-10); ctx.stroke();
    }
  });
  nodes.forEach(nd => {
    const { cx, cy } = nodePos(nd.depth, nd.x);
    const r = 13;
    ctx.fillStyle   = nd.type === 'solution' ? '#1c1007' : nd.type === 'undo' ? '#1c0707' : '#1e1b4b';
    ctx.strokeStyle = nd.type === 'solution' ? '#f59e0b' : nd.type === 'undo' ? '#f87171' : '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = nd.type === 'solution' ? '#f59e0b' : nd.type === 'undo' ? '#f87171' : '#a5b4fc';
    ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('[' + nd.path.join(',') + ']', cx, cy);
  });
}

function doStep() {
  if (stepIdx >= steps.length) return;
  const s = steps[stepIdx++];
  const nd = { ...s, parent: nodes.length ? nodes[nodes.length-1] : null };
  nodes.push(nd);
  if (s.type === 'solution') {
    document.getElementById('results').textContent =
      'Solutions: ' + solutions.slice(0, nodes.filter(n=>n.type==='solution').length)
        .map(p=>'['+p.join(',')+']').join('  ');
  }
  document.getElementById('info').textContent =
    s.type === 'solution' ? \`✓ Found [\${s.path.join(',')}]\` :
    s.type === 'undo'     ? \`↩ Backtrack from \${s.val||'...'}\` :
                            \`→ Try \${s.val}\`;
  drawAll();
}

document.getElementById('btn-step').addEventListener('click', doStep);
document.getElementById('btn-gen').addEventListener('click', () => {
  nodes.length = 0; stepIdx = 0;
  document.getElementById('results').textContent = '';
  ctx.clearRect(0, 0, W, H);
  const t = setInterval(() => {
    if (stepIdx >= steps.length) { clearInterval(t); return; }
    doStep();
  }, 200);
});
document.getElementById('btn-rst').addEventListener('click', () => {
  nodes.length = 0; stepIdx = 0;
  document.getElementById('results').textContent = '';
  document.getElementById('info').textContent = '';
  ctx.clearRect(0, 0, W, H);
});`,
                outputHeight: 280,
              },
            ],
          },
        },
      },

      // ── JavaScript guided walkthrough ─────────────────────────────────────────
      {
        id: 'JSNotebook',
        title: 'Build Backtracking Algorithms in JavaScript',
        caption: 'Permutations, subsets, then a real constraint problem — N-queens.',
        props: {
          lesson: {
            title: 'Backtracking in JavaScript',
            subtitle: 'Choose, recurse, undo. Every time.',
            cells: [
              // ── JS Cell 1: Permutations ───────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 1 — All Permutations

Generate every ordering of an array. For \`[1,2,3]\` that's 6 permutations (3! = 6).

**The template:**
\`\`\`
function backtrack(path, used):
  if path.length === nums.length: record path, return
  for i from 0 to nums.length-1:
    if used[i]: continue        ← skip already-used
    used[i] = true              ← make choice
    path.push(nums[i])
    backtrack(path, used)       ← recurse
    path.pop()                  ← UNDO
    used[i] = false             ← UNDO
\`\`\`

Implement \`permutations(nums)\` that returns all orderings.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.perm{color:#a5b4fc;font-size:11px;margin:1px 0}`,
                startCode: `function permutations(nums) {
  const result = [];

  function backtrack(path, used) {
    // TODO: if path is full (path.length === nums.length), push a copy to result and return

    for (let i = 0; i < nums.length; i++) {
      // TODO: if used[i], skip (continue)

      // TODO: make choice — set used[i] = true, push nums[i] to path

      // TODO: recurse

      // TODO: undo — pop from path, set used[i] = false

    }
  }

  backtrack([], new Array(nums.length).fill(false));
  return result;
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expectedLen, sample) {
  const lenOk = got.length === expectedLen;
  const hasAll = sample.every(s => got.some(p => JSON.stringify(p) === JSON.stringify(s)));
  const pass = lenOk && hasAll;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got.length} permutations\${pass?'':' (expected '+expectedLen+')'}</div>\`;
}

const p2 = permutations([1, 2]);
test('permutations([1,2])', p2, 2, [[1,2],[2,1]]);

const p3 = permutations([1, 2, 3]);
test('permutations([1,2,3])', p3, 6, [[1,2,3],[3,2,1],[2,1,3]]);

// Show them
if (p3.length === 6) {
  out.innerHTML += '<br>';
  p3.forEach(p => { out.innerHTML += \`<div class="perm">[\${p.join(', ')}]</div>\`; });
}`,
                solutionCode: `function permutations(nums) {
  const result = [];
  function backtrack(path, used) {
    if (path.length === nums.length) { result.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);
      backtrack(path, used);
      path.pop(); used[i] = false;
    }
  }
  backtrack([], new Array(nums.length).fill(false));
  return result;
}
const out=document.getElementById('out');
function test(label,got,expectedLen,sample){const pass=got.length===expectedLen&&sample.every(s=>got.some(p=>JSON.stringify(p)===JSON.stringify(s)));out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got.length} permutations</div>\`;}
const p2=permutations([1,2]);test('permutations([1,2])',p2,2,[[1,2],[2,1]]);
const p3=permutations([1,2,3]);test('permutations([1,2,3])',p3,6,[[1,2,3],[3,2,1]]);
p3.forEach(p=>{out.innerHTML+=\`<div style="color:#a5b4fc;font-size:11px">[\${p.join(', ')}]</div>\`;});`,
                outputHeight: 200,
              },

              // ── JS Cell 2: Subsets ────────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 2 — All Subsets (Power Set)

Every subset of \`[1,2,3]\` — including empty set and the full set. 2^3 = 8 subsets total.

At each index, you make a **binary choice**: include this element or skip it. No "used" array needed — you move forward through the array index by index.

\`\`\`
function backtrack(index, current):
  record current as a solution (every partial path is valid)
  for i from index to nums.length-1:
    current.push(nums[i])       ← include nums[i]
    backtrack(i + 1, current)   ← recurse forward
    current.pop()               ← undo (exclude this element)
\`\`\`

Implement \`subsets(nums)\`.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.sub{color:#2dd4bf;font-size:11px;margin:1px 0}`,
                startCode: `function subsets(nums) {
  const result = [];

  function backtrack(index, current) {
    // TODO: record current (a copy) as a valid subset — every path is a solution

    for (let i = index; i < nums.length; i++) {
      // TODO: include nums[i] in current

      // TODO: recurse from i+1 (move forward, not backward)

      // TODO: undo — remove the last element

    }
  }

  backtrack(0, []);
  return result;
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expectedLen) {
  const pass = got.length === expectedLen;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got.length} subsets\${pass?'':' (expected '+expectedLen+')'}</div>\`;
}

test('subsets([1])',     subsets([1]),     2);   // [], [1]
test('subsets([1,2])',   subsets([1,2]),   4);   // [], [1], [2], [1,2]
test('subsets([1,2,3])', subsets([1,2,3]), 8);   // 2^3

const s3 = subsets([1,2,3]);
if (s3.length === 8) {
  out.innerHTML += '<br>';
  s3.forEach(s => { out.innerHTML += \`<div class="sub">[\${s.join(', ')}]</div>\`; });
}`,
                solutionCode: `function subsets(nums) {
  const result = [];
  function backtrack(index, current) {
    result.push([...current]);
    for (let i = index; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return result;
}
const out=document.getElementById('out');
function test(label,got,expectedLen){const pass=got.length===expectedLen;out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got.length} subsets</div>\`;}
test('subsets([1])',subsets([1]),2);test('subsets([1,2])',subsets([1,2]),4);test('subsets([1,2,3])',subsets([1,2,3]),8);
subsets([1,2,3]).forEach(s=>{out.innerHTML+=\`<div style="color:#2dd4bf;font-size:11px">[\${s.join(', ')}]</div>\`;});`,
                outputHeight: 210,
              },

              // ── JS Cell 3: N-Queens ───────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 3 — N-Queens: Backtracking with Pruning

Place N queens on an N×N board so no two queens share a row, column, or diagonal. This is the canonical backtracking problem.

**Strategy:** place one queen per row. For each row, try every column. Before placing, check validity — if any existing queen conflicts, skip. This is **pruning**: you eliminate invalid branches before recursing.

**Conflict check for a new queen at (row, col):**
- Same column: any previous queen has col \`c === col\`
- Same diagonal: \`Math.abs(r - row) === Math.abs(c - col)\`

Fill in the \`isValid\` function. The board and backtrack loop are provided.`,
                html: `<div style="margin-bottom:8px;display:flex;gap:8px;align-items:center">
  <label style="font-family:monospace;font-size:12px;color:#94a3b8">N =</label>
  <input id="n-in" type="number" value="4" min="1" max="8" style="width:48px;padding:5px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:13px">
  <button id="btn-solve" style="padding:7px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Solve</button>
</div>
<div id="boards" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px"></div>
<div id="msg" style="font-family:monospace;font-size:12px;color:#94a3b8;margin-top:8px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.board{display:grid;gap:1px;background:#1e293b;padding:4px;border-radius:6px;border:1px solid #334155}
.cell{width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px}
.cell.dark{background:#0f172a}.cell.light{background:#1e293b}`,
                startCode: `function solveNQueens(n) {
  const solutions = [];

  function isValid(queens, row, col) {
    // queens is an array of [row, col] pairs already placed
    for (const [r, c] of queens) {
      // TODO: return false if same column (c === col)

      // TODO: return false if same diagonal
      // Hint: Math.abs(r - row) === Math.abs(c - col)

    }
    return true;
  }

  function backtrack(row, queens) {
    if (row === n) {
      solutions.push([...queens]);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isValid(queens, row, col)) {
        queens.push([row, col]);
        backtrack(row + 1, queens);
        queens.pop();  // undo
      }
    }
  }

  backtrack(0, []);
  return solutions;
}

// ── Render boards (don't edit) ────────────────────────
function renderBoard(queens, n) {
  const grid = document.createElement('div');
  grid.className = 'board';
  grid.style.gridTemplateColumns = \`repeat(\${n}, 24px)\`;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      cell.textContent = queens.some(([qr,qc]) => qr===r && qc===c) ? '♛' : '';
      if (queens.some(([qr,qc]) => qr===r && qc===c)) cell.style.color = '#f59e0b';
      grid.appendChild(cell);
    }
  }
  return grid;
}

document.getElementById('btn-solve').addEventListener('click', () => {
  const n = parseInt(document.getElementById('n-in').value);
  const boards = document.getElementById('boards');
  const msg    = document.getElementById('msg');
  boards.innerHTML = '';
  const solutions = solveNQueens(n);
  msg.textContent = \`\${solutions.length} solution\${solutions.length!==1?'s':''} for N=\${n}\`;
  solutions.slice(0, 6).forEach(queens => boards.appendChild(renderBoard(queens, n)));
  if (solutions.length > 6) msg.textContent += \` (showing first 6)\`;
});`,
                solutionCode: `function solveNQueens(n) {
  const solutions = [];
  function isValid(queens, row, col) {
    for (const [r, c] of queens) {
      if (c === col) return false;
      if (Math.abs(r - row) === Math.abs(c - col)) return false;
    }
    return true;
  }
  function backtrack(row, queens) {
    if (row === n) { solutions.push([...queens]); return; }
    for (let col = 0; col < n; col++) {
      if (isValid(queens, row, col)) {
        queens.push([row, col]); backtrack(row+1, queens); queens.pop();
      }
    }
  }
  backtrack(0, []); return solutions;
}
function renderBoard(queens, n) {
  const grid=document.createElement('div');grid.className='board';grid.style.gridTemplateColumns=\`repeat(\${n},24px)\`;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){const cell=document.createElement('div');cell.className='cell '+((r+c)%2===0?'light':'dark');cell.textContent=queens.some(([qr,qc])=>qr===r&&qc===c)?'♛':'';if(queens.some(([qr,qc])=>qr===r&&qc===c))cell.style.color='#f59e0b';grid.appendChild(cell);}
  return grid;
}
document.getElementById('btn-solve').addEventListener('click',()=>{const n=parseInt(document.getElementById('n-in').value);const boards=document.getElementById('boards');boards.innerHTML='';const s=solveNQueens(n);document.getElementById('msg').textContent=s.length+' solutions for N='+n;s.slice(0,6).forEach(q=>boards.appendChild(renderBoard(q,n)));});`,
                outputHeight: 260,
              },

              // ── JS Cell 4: From scratch ───────────────────────────────────────
              {
                type: 'js',
                instruction: `## Challenge — All Three From Scratch

Empty function signatures. Write everything from memory.

For each one, ask yourself:
1. What is my state? (path, current, queens)
2. When do I record a solution?
3. What choices do I have at each step?
4. How do I make and undo a choice?
5. What is my pruning condition? (N-queens only)`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}
.section{color:#64748b;font-size:11px;margin-top:10px;border-top:1px solid #1e293b;padding-top:6px}
.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}
.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}
.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `function permutations(nums) {
  // choose, recurse, undo — use a 'used' array
}

function subsets(nums) {
  // record at every node — include or skip each element
}

function solveNQueens(n) {
  // one queen per row — check column and diagonal conflicts
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
const results = [];
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}
function testLen(label, got, expectedLen) {
  const pass = got.length === expectedLen;
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: length \${got.length}\${pass?'':' (expected '+expectedLen+')'}</div>\`;
}

try {
  out.innerHTML += '<div class="section">permutations</div>';
  testLen('permutations([1,2,3])', permutations([1,2,3]), 6);
  testLen('permutations([1,2,3,4])', permutations([1,2,3,4]), 24);

  out.innerHTML += '<div class="section">subsets</div>';
  testLen('subsets([1,2,3])', subsets([1,2,3]), 8);
  testLen('subsets([1,2,3,4])', subsets([1,2,3,4]), 16);

  out.innerHTML += '<div class="section">solveNQueens</div>';
  testLen('solveNQueens(4)', solveNQueens(4), 2);
  testLen('solveNQueens(5)', solveNQueens(5), 10);
  testLen('solveNQueens(6)', solveNQueens(6), 4);

  const all = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all
    ? '✓ All tests pass. Permutations, subsets, N-queens — from scratch.'
    : results.filter(Boolean).length + '/' + results.length + ' passing.'
  }</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `function permutations(nums) {
  const result = [];
  function bt(path, used) {
    if (path.length === nums.length) { result.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i]=true; path.push(nums[i]); bt(path,used); path.pop(); used[i]=false;
    }
  }
  bt([], new Array(nums.length).fill(false)); return result;
}
function subsets(nums) {
  const result = [];
  function bt(idx, cur) {
    result.push([...cur]);
    for (let i = idx; i < nums.length; i++) { cur.push(nums[i]); bt(i+1,cur); cur.pop(); }
  }
  bt(0, []); return result;
}
function solveNQueens(n) {
  const sols = [];
  function valid(q, row, col) { for(const[r,c]of q){if(c===col||Math.abs(r-row)===Math.abs(c-col))return false;} return true; }
  function bt(row, q) { if(row===n){sols.push([...q]);return;} for(let col=0;col<n;col++){if(valid(q,row,col)){q.push([row,col]);bt(row+1,q);q.pop();}}}
  bt(0,[]); return sols;
}
const out=document.getElementById('out');const results=[];
function test(l,g,e){const p=JSON.stringify(g)===JSON.stringify(e);results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: \${JSON.stringify(g)}</div>\`;}
function testLen(l,g,e){const p=g.length===e;results.push(p);out.innerHTML+=\`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: length \${g.length}</div>\`;}
testLen('permutations([1,2,3])',permutations([1,2,3]),6);testLen('permutations([1,2,3,4])',permutations([1,2,3,4]),24);
testLen('subsets([1,2,3])',subsets([1,2,3]),8);testLen('subsets([1,2,3,4])',subsets([1,2,3,4]),16);
testLen('solveNQueens(4)',solveNQueens(4),2);testLen('solveNQueens(5)',solveNQueens(5),10);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 300,
              },
            ],
          },
        },
      },

      // ── Python guided walkthrough ─────────────────────────────────────────────
      {
        id: 'PythonNotebook',
        title: 'Build Backtracking in Python',
        caption: 'Permutations, subsets, N-queens — in Python, with opencalc visualizations.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — Permutations',
              prose: [
                'The backtracking template is language-agnostic. Python\'s `list.append()` and `list.pop()` are the make/undo pair.',
                'Pass `used` as a list of booleans parallel to `nums`. Mark True when chosen, False when undone.',
              ],
              instructions: `Implement permutations(nums) using the backtrack template. Every assert must pass.`,
              code: `def permutations(nums):
    result = []

    def backtrack(path, used):
        # TODO: if path is complete, append a copy and return

        for i in range(len(nums)):
            # TODO: if used[i], skip (continue)

            # TODO: make choice — used[i] = True, path.append(nums[i])

            # TODO: recurse

            # TODO: undo — path.pop(), used[i] = False

    backtrack([], [False] * len(nums))
    return result


# ── Tests ──────────────────────────────────────────────
p2 = permutations([1, 2])
assert len(p2) == 2, f"expected 2, got {len(p2)}"
assert [1,2] in p2 and [2,1] in p2
print("✓ permutations([1,2])")

p3 = permutations([1, 2, 3])
assert len(p3) == 6, f"expected 6, got {len(p3)}"
print("✓ permutations([1,2,3])")

print(f"\nAll {len(p3)} permutations of [1,2,3]:")
for p in p3:
    print(f"  {p}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — Subsets',
              prose: [
                'Subsets differ from permutations in one key way: every partial path is itself a valid answer. You record at every node, not just at the leaves.',
                'Move forward by index — always recurse with `i + 1` to avoid duplicates.',
              ],
              instructions: `Implement subsets(nums). Record at every call. Recurse forward from each index. Test and print all 8 subsets of [1,2,3].`,
              code: `def subsets(nums):
    result = []

    def backtrack(index, current):
        # TODO: record a copy of current (it's valid at every level)

        for i in range(index, len(nums)):
            # TODO: include nums[i]

            # TODO: recurse from i+1 (forward only)

            # TODO: undo

    backtrack(0, [])
    return result


# ── Tests ──────────────────────────────────────────────
s1 = subsets([1])
assert len(s1) == 2, f"expected 2 subsets, got {len(s1)}"
print("✓ subsets([1])")

s2 = subsets([1, 2])
assert len(s2) == 4, f"expected 4 subsets, got {len(s2)}"
print("✓ subsets([1,2])")

s3 = subsets([1, 2, 3])
assert len(s3) == 8, f"expected 8 subsets, got {len(s3)}"
print("✓ subsets([1,2,3])")

print(f"\nAll {len(s3)} subsets of [1,2,3]:")
for s in s3:
    print(f"  {s}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Step 3 — N-Queens with opencalc board visualization',
              prose: [
                'N-queens is backtracking with pruning. The `is_valid()` check prevents invalid placements before recursing.',
                'The opencalc Figure draws each solution as a grid — queens as gold points, empty squares as blue.',
              ],
              instructions: `Implement is_valid() — check column and diagonal conflicts. The backtrack loop is provided. Solve for N=4 and N=5, then draw the solutions.`,
              code: `from opencalc import Figure, AMBER, BLUE, GREEN

def solve_n_queens(n):
    solutions = []

    def is_valid(queens, row, col):
        for r, c in queens:
            # TODO: return False if same column (c == col)

            # TODO: return False if same diagonal
            # abs(r - row) == abs(c - col)

        return True

    def backtrack(row, queens):
        if row == n:
            solutions.append(list(queens))
            return
        for col in range(n):
            if is_valid(queens, row, col):
                queens.append((row, col))
                backtrack(row + 1, queens)
                queens.pop()  # undo

    backtrack(0, [])
    return solutions


# ── Tests ──────────────────────────────────────────────
s4 = solve_n_queens(4)
assert len(s4) == 2,  f"N=4: expected 2 solutions, got {len(s4)}"
print(f"✓ N=4: {len(s4)} solutions")

s5 = solve_n_queens(5)
assert len(s5) == 10, f"N=5: expected 10 solutions, got {len(s5)}"
print(f"✓ N=5: {len(s5)} solutions")

# ── Draw first 2 solutions for N=4 ────────────────────
for idx, queens in enumerate(s4):
    fig = Figure(xmin=-0.5, xmax=4.5, ymin=-0.5, ymax=4.5,
                 width=160, height=160,
                 title=f"N=4 solution {idx+1}")
    fig.axes(labels=False, ticks=False)
    for r in range(4):
        for c in range(4):
            color = AMBER if (r, c) in queens else BLUE
            fig.point((c, 3-r), color=color, radius=18,
                      label='♛' if (r,c) in queens else '')
    print(fig.show())`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Challenge — All Three From Scratch in Python',
              prose: [
                'No fill-in-the-blank. Write every function from memory.',
                'When all assertions pass, the cell draws solution counts for N-queens from N=1 to N=8 as a bar chart.',
              ],
              instructions: `Implement permutations(), subsets(), and solve_n_queens(). Every assertion must pass.`,
              code: `from opencalc import Figure, BLUE, GREEN, AMBER, RED

def permutations(nums):
    pass

def subsets(nums):
    pass

def solve_n_queens(n):
    pass


# ── Assertions ─────────────────────────────────────────
assert len(permutations([1,2,3]))   == 6
assert len(permutations([1,2,3,4])) == 24
print("✓ permutations")

assert len(subsets([1,2,3]))   == 8
assert len(subsets([1,2,3,4])) == 16
print("✓ subsets")

assert len(solve_n_queens(4)) == 2
assert len(solve_n_queens(5)) == 10
assert len(solve_n_queens(6)) == 4
print("✓ solve_n_queens")

print()
print("All assertions passed.")

# ── Visualize N-queens solution counts ────────────────
known = {1:1, 2:0, 3:0, 4:2, 5:10, 6:4, 7:40, 8:92}
ns = list(range(1, 9))
counts = [len(solve_n_queens(n)) for n in ns]

fig = Figure(xmin=0, xmax=9, ymin=0, ymax=max(counts)*1.15,
             width=400, height=200,
             title='N-Queens solution counts (N=1 to 8)')
for n, c in zip(ns, counts):
    color = GREEN if c > 0 else BLUE
    fig.bar(n, c, width=0.6, color=color,
            label=str(c) if c > 0 else '0')
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
      'Backtracking complexity:\n- Permutations of n items: O(n × n!) time — n! leaves, each takes O(n) to copy\n- Subsets of n items: O(n × 2^n) time — 2^n subsets, each takes O(n) to copy\n- N-queens: O(n!) worst case without pruning; actual explored nodes much smaller with conflict checking',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Backtracking = DFS on a decision tree',
        body: 'Every backtracking algorithm is a depth-first search through a decision tree. The tree structure determines the complexity. Pruning cuts branches early, reducing the effective tree size without changing worst-case complexity.',
      },
    ],
    visualizations: [],
  },

  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],

  challenges: [
    {
      id: 'dsa2-003-c1',
      title: 'Combination Sum',
      difficulty: 'hard',
      description: 'Given a list of distinct positive integers and a target, find all combinations that sum to target. You may use each number multiple times.',
      starterCode: `def combination_sum(candidates, target):
    result = []

    def backtrack(start, current, remaining):
        if remaining == 0:
            result.append(list(current))
            return
        if remaining < 0:
            return  # pruning — overshot
        for i in range(start, len(candidates)):
            # TODO: add candidates[i], recurse from i (allow reuse), then undo
            pass

    backtrack(0, [], target)
    return result

print(combination_sum([2,3,6,7], 7))   # [[2,2,3],[7]]
print(combination_sum([2,3,5], 8))      # [[2,2,2,2],[2,3,3],[3,5]]`,
      solution: `def combination_sum(candidates, target):
    result = []
    def backtrack(start, current, remaining):
        if remaining == 0: result.append(list(current)); return
        if remaining < 0: return
        for i in range(start, len(candidates)):
            current.append(candidates[i])
            backtrack(i, current, remaining - candidates[i])
            current.pop()
    backtrack(0, [], target)
    return result`,
      hint: 'Recurse from index i (not i+1) to allow reuse of the same number. Prune when remaining < 0. Sort candidates first to prune earlier.',
    },
  ],
};
