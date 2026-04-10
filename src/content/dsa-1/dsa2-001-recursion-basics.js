export default {
  id: 'dsa2-001',
  slug: 'recursion-basics',
  chapter: 'dsa2',
  order: 1,
  title: 'Recursion Basics',
  subtitle: 'A function that calls itself — with one rule that makes it work: the base case. Every recursive algorithm is a deal: trust the smaller version of the problem, handle the simplest case yourself.',
  tags: ['recursion', 'base case', 'recursive case', 'call stack', 'factorial', 'fibonacci', 'stack frame', 'stack overflow'],
  aliases: 'recursion recursive base case call stack factorial fibonacci stack frame self-referential',

  hook: {
    question: 'Can a function solve a problem by solving a smaller version of the same problem — and how does that ever stop?',
    realWorldContext: 'Recursion is everywhere once you see it: file systems are recursive (folders contain folders), HTML is recursive (elements nest inside elements), JSON is recursive (objects can contain objects). Every tree traversal, every divide-and-conquer algorithm, every graph search — recursive at their core. Understanding recursion is the unlock for the entire second half of DSA.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You\'ve built every major linear structure — arrays, linked lists, stacks, queues, strings. Those structures store data. Now you need a new thinking tool: recursion. It\'s how you write elegant solutions to problems that are naturally self-similar.',
      '**The two-part deal.** Every recursive function must have exactly two things: a **base case** (the simplest possible input, which you solve directly without calling yourself) and a **recursive case** (reduce the problem to a smaller version and call yourself). Miss the base case and you get infinite recursion — stack overflow.',
      '**The call stack is literal.** When `factorial(5)` calls `factorial(4)`, a new stack frame is pushed. That frame holds local variables and the return address. `factorial(4)` calls `factorial(3)`, another frame. This keeps going until the base case — then frames pop off in reverse, returning values back up the chain.',
      '**Trust the recursion.** The hardest mental shift: you don\'t need to trace every level. Write the base case, then assume the recursive call returns the correct answer for `n-1` and use it to compute the answer for `n`. This is the leap. Most beginners try to trace all the levels mentally — that\'s the wrong approach.',
      '**Fibonacci reveals the danger.** Naive recursive Fibonacci recomputes the same subproblems exponentially. `fib(5)` calls `fib(4)` and `fib(3)`. `fib(4)` calls `fib(3)` and `fib(2)`. `fib(3)` gets computed twice. This grows into O(2^n) time. The fix — memoization — is coming in a later lesson. For now, see the problem.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 2, Lesson 1: Recursion & State',
        body: '**Previous chapter:** Linear Structures — arrays, linked lists, stacks, queues, strings.\n**This lesson:** Recursion — the mental model, base cases, call stack mechanics.\n**Next:** Recursion Trees — visualizing the branching cost of recursive calls.',
      },
      {
        type: 'warning',
        title: 'The base case is not optional',
        body: 'Every recursive function that doesn\'t reach a base case will eventually overflow the call stack. Python default recursion limit is 1000 frames. JavaScript varies by engine. Always identify your base case before writing the recursive case.',
      },
      {
        type: 'insight',
        title: 'Trust the smaller problem',
        body: 'When writing `factorial(n)`, you don\'t trace how `factorial(n-1)` works. You just trust it returns `(n-1)!` and multiply by `n`. This is the mental model: define what the function does, assume it works for n-1, build n from it.',
      },
      {
        type: 'strategy',
        title: 'Recursion template',
        body: 'Every recursive function follows the same skeleton:\n```\nif base_case: return base_answer\nsmaller = recurse(smaller_input)\nreturn build_answer_from_smaller\n```\nIdentify these three parts before writing any code.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'The Call Stack: Frames In, Frames Out',
        mathBridge: 'Watch each recursive call push a frame onto the stack. The stack grows until the base case is hit — then frames pop off in reverse, each one returning its value to the caller above it.',
        caption: 'The stack grows down to the base case, then collapses back up carrying the answer.',
        props: {
          lesson: {
            title: 'How Recursion Uses the Call Stack',
            subtitle: 'See the frames push and pop.',
            sequential: false,
            cells: [
              {
                type: 'js',
                title: 'factorial(5): Watch the Stack Grow and Collapse',
                instruction: 'Click **Step** to execute one step at a time — either a recursive call (frame pushed) or a return (frame popped).\n\nNotice: the stack grows until factorial(0) hits the base case, then every frame pops in reverse order returning its computed value.',
                html: `<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
  <div style="flex:0 0 200px">
    <div style="color:#94a3b8;font-size:11px;font-family:monospace;margin-bottom:6px">CALL STACK (top = active)</div>
    <div id="stack" style="display:flex;flex-direction:column-reverse;gap:3px;min-height:200px"></div>
  </div>
  <div style="flex:1;min-width:200px">
    <div style="color:#94a3b8;font-size:11px;font-family:monospace;margin-bottom:6px">EXECUTION LOG</div>
    <div id="log" style="font-family:monospace;font-size:11px;color:#64748b;line-height:1.7;max-height:220px;overflow-y:auto"></div>
  </div>
</div>
<div style="margin-top:10px;display:flex;gap:8px;align-items:center">
  <button id="btn-step" style="padding:7px 18px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Step →</button>
  <button id="btn-play" style="padding:7px 14px;border-radius:6px;border:none;background:#0d9488;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Play</button>
  <button id="btn-rst"  style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
  <span id="result" style="font-family:monospace;font-size:13px;color:#4ade80;margin-left:6px"></span>
</div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.frame{padding:7px 12px;border-radius:5px;font-size:12px;transition:all .25s;border:2px solid transparent}
.frame.call{background:#1e1b4b;border-color:#6366f1;color:#a5b4fc}
.frame.active{background:#1e1b4b;border-color:#2dd4bf;color:#2dd4bf;font-weight:bold}
.frame.base{background:#052e16;border-color:#4ade80;color:#4ade80}
.frame.returning{background:#292107;border-color:#f59e0b;color:#f59e0b}
.log-call{color:#a5b4fc}.log-base{color:#4ade80}.log-ret{color:#f59e0b}`,
                startCode: `// Build the step-by-step trace of factorial(5)
const N = 5;
const steps = [];

(function trace(n, depth) {
  steps.push({ type: 'call', n, depth });
  if (n === 0) {
    steps.push({ type: 'base', n, depth, val: 1 });
  } else {
    trace(n - 1, depth + 1);
    steps.push({ type: 'return', n, depth, val: null }); // val filled below
  }
})(N, 0);

// Fill return values
const retStack = [];
steps.forEach(s => {
  if (s.type === 'base') retStack.push(1);
  else if (s.type === 'return') {
    const sub = retStack.pop();
    s.val = s.n * sub;
    retStack.push(s.val);
  }
});

let stepIdx = 0;
let callStack = [];
const stackEl = document.getElementById('stack');
const logEl   = document.getElementById('log');
const resultEl = document.getElementById('result');

function render() {
  stackEl.innerHTML = '';
  callStack.forEach((frame, i) => {
    const el = document.createElement('div');
    const isTop = i === callStack.length - 1;
    el.className = 'frame ' + (frame.type === 'base' ? 'base' : isTop ? 'active' : 'call');
    el.textContent = frame.label;
    stackEl.appendChild(el);
  });
}

function addLog(text, cls) {
  const line = document.createElement('div');
  line.className = cls;
  line.textContent = text;
  logEl.insertBefore(line, logEl.firstChild);
}

function doStep() {
  if (stepIdx >= steps.length) return;
  const s = steps[stepIdx++];

  if (s.type === 'call') {
    callStack.push({ label: \`factorial(\${s.n})\`, type: 'call' });
    addLog(\`→ call  factorial(\${s.n})\`, 'log-call');
  } else if (s.type === 'base') {
    callStack[callStack.length - 1].type = 'base';
    callStack[callStack.length - 1].label = \`factorial(0) = 1  ← BASE\`;
    addLog(\`✓ base  factorial(0) returns 1\`, 'log-base');
  } else if (s.type === 'return') {
    callStack.pop();
    addLog(\`← ret   factorial(\${s.n}) = \${s.n} × \${s.val / s.n} = \${s.val}\`, 'log-ret');
    if (callStack.length === 0) {
      resultEl.textContent = \`factorial(5) = \${s.val}\`;
    }
  }
  render();
}

document.getElementById('btn-step').addEventListener('click', doStep);
document.getElementById('btn-rst').addEventListener('click', () => {
  stepIdx = 0; callStack = []; logEl.innerHTML = ''; resultEl.textContent = ''; render();
});
document.getElementById('btn-play').addEventListener('click', () => {
  stepIdx = 0; callStack = []; logEl.innerHTML = ''; resultEl.textContent = ''; render();
  const t = setInterval(() => {
    if (stepIdx >= steps.length) { clearInterval(t); return; }
    doStep();
  }, 450);
});

render();`,
                outputHeight: 300,
              },
              {
                type: 'js',
                title: 'Fibonacci: When Recursion Branches',
                instruction: 'Fibonacci calls itself **twice** at each step — `fib(n-1)` and `fib(n-2)`. The tree of calls grows exponentially.\n\nClick **Show Tree** and choose an n value. Watch how many times the same subproblem gets computed. fib(3) appears multiple times in fib(6).',
                html: `<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center">
  <label style="font-family:monospace;font-size:12px;color:#94a3b8">n =</label>
  <input id="n-val" type="number" value="6" min="1" max="10" style="width:56px;padding:5px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:13px">
  <button id="btn-tree" style="padding:7px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Show Tree</button>
  <span id="calls" style="font-family:monospace;font-size:11px;color:#f87171"></span>
</div>
<canvas id="c" width="600" height="260" style="display:block;width:100%;border-radius:6px;background:#0a0f1e"></canvas>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}`,
                startCode: `const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const PR = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

let callCount = 0;
const memo = {};

function fib(n) {
  callCount++;
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Build tree structure
function buildTree(n, depth=0, x=0.5, spread=0.4) {
  const node = { n, depth, x, calls: 1, children: [] };
  if (n > 1) {
    node.children.push(buildTree(n-1, depth+1, x - spread, spread/2));
    node.children.push(buildTree(n+0,  depth+1, x + spread, spread/2)); // fib(n-2)
    // fix: right child
    node.children[1] = buildTree(n-2, depth+1, x + spread, spread/2);
  }
  return node;
}

function drawTree(node, maxDepth) {
  const radius = Math.max(8, 16 - node.depth * 1.5);
  const cx = node.x * W;
  const cy = 30 + node.depth * (H - 50) / (maxDepth + 1);

  // Draw edges to children
  node.children.forEach(child => {
    const childCx = child.x * W;
    const childCy = 30 + child.depth * (H - 50) / (maxDepth + 1);
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy + radius); ctx.lineTo(childCx, childCy - radius); ctx.stroke();
    drawTree(child, maxDepth);
  });

  // Draw node
  const isBase = node.n <= 1;
  const isDup  = node.n >= 2 && node.n < parseInt(document.getElementById('n-val').value) - 1;
  ctx.fillStyle = isBase ? '#052e16' : isDup ? '#1e1b4b' : '#1e293b';
  ctx.strokeStyle = isBase ? '#4ade80' : isDup ? '#6366f1' : '#334155';
  ctx.lineWidth = isBase || isDup ? 2 : 1;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = isBase ? '#4ade80' : isDup ? '#a5b4fc' : '#94a3b8';
  ctx.font = \`bold \${Math.max(9, 13 - node.depth)}px monospace\`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(\`f(\${node.n})\`, cx, cy);
}

document.getElementById('btn-tree').addEventListener('click', () => {
  const n = parseInt(document.getElementById('n-val').value);
  callCount = 0;
  fib(n);
  document.getElementById('calls').textContent = \`\${callCount} function calls to compute fib(\${n})\`;

  ctx.clearRect(0, 0, W, H);
  const tree = buildTree(n);
  function maxD(node) { return node.children.length ? Math.max(...node.children.map(maxD)) + 1 : node.depth; }
  drawTree(tree, maxD(tree));
});`,
                outputHeight: 300,
              },
            ],
          },
        },
      },

      // ── JavaScript guided walkthrough ─────────────────────────────────────────
      {
        id: 'JSNotebook',
        title: 'Build Recursive Functions in JavaScript',
        caption: 'Implement each recursive function one step at a time, then write all three from scratch.',
        props: {
          lesson: {
            title: 'Recursion in JavaScript',
            subtitle: 'Base case first. Trust the smaller call. Build the answer.',
            cells: [
              // ── JS Cell 1: factorial ──────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 1 — factorial(n)

The simplest recursive function. Before you write anything, identify the two parts:

**Base case:** \`factorial(0) = 1\` — by definition. Return 1 directly.
**Recursive case:** \`factorial(n) = n × factorial(n-1)\` — trust that \`factorial(n-1)\` returns the right answer.

That's it. Two lines plus the function signature.

**Do not trace the full call chain in your head.** Just write: if n is 0, return 1. Otherwise return n times whatever factorial(n-1) gives back.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.info{color:#94a3b8;margin:2px 0}`,
                startCode: `function factorial(n) {
  // TODO: base case — what is factorial(0)?

  // TODO: recursive case — return n times factorial of what?

}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: got \${got}\${pass?'':' — expected '+expected}</div>\`;
}

test('factorial(0)', factorial(0), 1);
test('factorial(1)', factorial(1), 1);
test('factorial(3)', factorial(3), 6);
test('factorial(5)', factorial(5), 120);
test('factorial(6)', factorial(6), 720);`,
                solutionCode: `function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}</div>\`;
}
test('factorial(0)', factorial(0), 1);
test('factorial(1)', factorial(1), 1);
test('factorial(3)', factorial(3), 6);
test('factorial(5)', factorial(5), 120);
test('factorial(6)', factorial(6), 720);`,
                outputHeight: 150,
              },

              // ── JS Cell 2: sumArray ───────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 2 — sumArray(arr): Recursion Over a List

Sum an array recursively — without a loop. This builds the pattern you'll use for tree traversal.

**Base case:** empty array → return 0
**Recursive case:** \`arr[0] + sumArray(arr.slice(1))\`

Read that recursive case aloud: "the sum of this array is the first element plus the sum of the rest." That's it.

\`arr.slice(1)\` gives you every element except the first — a strictly smaller array. Each call reduces the problem until the array is empty.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function sumArray(arr) {
  // TODO: base case — if array is empty, return 0

  // TODO: recursive case — first element plus sum of the rest
  // Hint: return arr[0] + sumArray(arr.slice(1));

}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}\${pass?'':' (expected '+expected+')'}</div>\`;
}

test('sumArray([])',         sumArray([]),         0);
test('sumArray([5])',        sumArray([5]),        5);
test('sumArray([1,2,3])',    sumArray([1,2,3]),    6);
test('sumArray([4,5,6,7])', sumArray([4,5,6,7]), 22);`,
                solutionCode: `function sumArray(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + sumArray(arr.slice(1));
}
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}</div>\`;
}
test('sumArray([])', sumArray([]), 0);
test('sumArray([1,2,3])', sumArray([1,2,3]), 6);
test('sumArray([4,5,6,7])', sumArray([4,5,6,7]), 22);`,
                outputHeight: 130,
              },

              // ── JS Cell 3: fibonacci ──────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 3 — fibonacci(n): Two Recursive Calls

Fibonacci: each number is the sum of the two before it.
\`0, 1, 1, 2, 3, 5, 8, 13, 21, ...\`

**Base cases (two this time):**
- \`fib(0) = 0\`
- \`fib(1) = 1\`

**Recursive case:**
- \`fib(n) = fib(n-1) + fib(n-2)\`

This works. It's also **slow** — O(2^n). fib(40) makes over a billion calls. You're implementing it this way to feel the problem firsthand. The fix (memoization) comes next lesson.

After the tests, the cell times how long fib(38) takes — watch the number.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.warn{color:#f59e0b;margin:4px 0;font-size:12px}`,
                startCode: `function fibonacci(n) {
  // TODO: base case for n === 0

  // TODO: base case for n === 1

  // TODO: recursive case — sum of the two before it

}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}\${pass?'':' (expected '+expected+')'}</div>\`;
}

test('fibonacci(0)',  fibonacci(0),  0);
test('fibonacci(1)',  fibonacci(1),  1);
test('fibonacci(6)',  fibonacci(6),  8);
test('fibonacci(10)', fibonacci(10), 55);

// Timing — feel the exponential cost
const t0 = performance.now();
const r = fibonacci(38);
const ms = (performance.now() - t0).toFixed(0);
out.innerHTML += \`<div class="warn">fibonacci(38) = \${r} — took \${ms}ms (that's O(2^n) in action)</div>\`;`,
                solutionCode: `function fibonacci(n) {
  if (n === 0) return 0;
  if (n === 1) return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}</div>\`;
}
test('fibonacci(0)',  fibonacci(0),  0);
test('fibonacci(1)',  fibonacci(1),  1);
test('fibonacci(6)',  fibonacci(6),  8);
test('fibonacci(10)', fibonacci(10), 55);
const t0=performance.now();const r=fibonacci(38);const ms=(performance.now()-t0).toFixed(0);
out.innerHTML+=\`<div class="warn">fibonacci(38) = \${r} — took \${ms}ms</div>\`;`,
                outputHeight: 170,
              },

              // ── JS Cell 4: flatten ────────────────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 4 — flatten(arr): Recursion Over Nested Structure

This is where recursion earns its keep. Flatten a nested array like \`[1, [2, [3, 4]], 5]\` into \`[1, 2, 3, 4, 5]\`.

A loop can't do this cleanly for arbitrary depth. Recursion can.

**The logic:** walk the array element by element. If the element is itself an array, **recursively flatten it** and spread the results. If it's not, just push it.

\`\`\`
for each element:
  if Array.isArray(element): result = [...result, ...flatten(element)]
  else: result.push(element)
\`\`\`

The base case is implicit: a flat array's elements are not arrays, so the recursion stops naturally.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function flatten(arr) {
  const result = [];

  for (const el of arr) {
    if (Array.isArray(el)) {
      // TODO: recursively flatten el and spread its elements into result
      // result.push(...flatten(el));

    } else {
      // TODO: just push the plain element

    }
  }

  return result;
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: [\${got}]\${pass?'':' (expected ['+expected+'])'}</div>\`;
}

test('[1,2,3]',                flatten([1,2,3]),                [1,2,3]);
test('[1,[2,3],4]',            flatten([1,[2,3],4]),            [1,2,3,4]);
test('[1,[2,[3,4]],5]',        flatten([1,[2,[3,4]],5]),        [1,2,3,4,5]);
test('[[1],[2],[3]]',          flatten([[1],[2],[3]]),          [1,2,3]);
test('[1,[2,[3,[4,[5]]]]]',    flatten([1,[2,[3,[4,[5]]]]]),    [1,2,3,4,5]);`,
                solutionCode: `function flatten(arr) {
  const result = [];
  for (const el of arr) {
    if (Array.isArray(el)) result.push(...flatten(el));
    else result.push(el);
  }
  return result;
}
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: [\${got}]</div>\`;
}
test('[1,2,3]', flatten([1,2,3]), [1,2,3]);
test('[1,[2,3],4]', flatten([1,[2,3],4]), [1,2,3,4]);
test('[1,[2,[3,4]],5]', flatten([1,[2,[3,4]],5]), [1,2,3,4,5]);
test('[1,[2,[3,[4,[5]]]]]', flatten([1,[2,[3,[4,[5]]]]]), [1,2,3,4,5]);`,
                outputHeight: 150,
              },

              // ── JS Cell 5: From scratch ───────────────────────────────────────
              {
                type: 'js',
                instruction: `## Challenge — All Four From Scratch

Empty signatures. Write every function from memory.

For each one, think: **what is the base case?** Then: **how do I reduce to a smaller problem?**

- \`factorial(n)\` — base: n=0. Recursive: n × factorial(n-1)
- \`sumArray(arr)\` — base: empty arr. Recursive: arr[0] + sumArray(rest)
- \`fibonacci(n)\` — two base cases. Recursive: fib(n-1) + fib(n-2)
- \`flatten(arr)\` — recurse on nested arrays, push plain elements`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}
.section{color:#64748b;font-size:11px;margin-top:10px;border-top:1px solid #1e293b;padding-top:6px}
.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}
.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}
.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `function factorial(n) {
  // base case + recursive case
}

function sumArray(arr) {
  // base case + recursive case
}

function fibonacci(n) {
  // two base cases + recursive case
}

function flatten(arr) {
  // recurse on nested arrays, collect plain values
}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
const results = [];
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}\${pass?'':' (expected '+JSON.stringify(expected)+')'}</div>\`;
}

try {
  out.innerHTML += '<div class="section">factorial</div>';
  test('factorial(0)', factorial(0), 1);
  test('factorial(5)', factorial(5), 120);
  test('factorial(6)', factorial(6), 720);

  out.innerHTML += '<div class="section">sumArray</div>';
  test('sumArray([])',      sumArray([]),      0);
  test('sumArray([1,2,3])', sumArray([1,2,3]), 6);
  test('sumArray([4,5,6])', sumArray([4,5,6]), 15);

  out.innerHTML += '<div class="section">fibonacci</div>';
  test('fibonacci(0)',  fibonacci(0),  0);
  test('fibonacci(1)',  fibonacci(1),  1);
  test('fibonacci(6)',  fibonacci(6),  8);
  test('fibonacci(10)', fibonacci(10), 55);

  out.innerHTML += '<div class="section">flatten</div>';
  test('[1,[2,3],4]',         flatten([1,[2,3],4]),         [1,2,3,4]);
  test('[1,[2,[3,4]],5]',     flatten([1,[2,[3,4]],5]),     [1,2,3,4,5]);
  test('[1,[2,[3,[4,[5]]]]]', flatten([1,[2,[3,[4,[5]]]]]), [1,2,3,4,5]);

  const all = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all
    ? '✓ All tests pass. factorial, sumArray, fibonacci, flatten — from scratch.'
    : results.filter(Boolean).length + '/' + results.length + ' passing.'
  }</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `function factorial(n) { return n === 0 ? 1 : n * factorial(n-1); }
function sumArray(arr) { return arr.length === 0 ? 0 : arr[0] + sumArray(arr.slice(1)); }
function fibonacci(n) { if (n===0) return 0; if (n===1) return 1; return fibonacci(n-1)+fibonacci(n-2); }
function flatten(arr) { const r=[]; for(const el of arr){ if(Array.isArray(el)) r.push(...flatten(el)); else r.push(el); } return r; }
const out=document.getElementById('out');const results=[];
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);results.push(pass);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${JSON.stringify(got)}</div>\`;}
out.innerHTML+='<div class="section">factorial</div>';test('factorial(0)',factorial(0),1);test('factorial(5)',factorial(5),120);test('factorial(6)',factorial(6),720);
out.innerHTML+='<div class="section">sumArray</div>';test('sumArray([])',sumArray([]),0);test('sumArray([1,2,3])',sumArray([1,2,3]),6);
out.innerHTML+='<div class="section">fibonacci</div>';test('fibonacci(0)',fibonacci(0),0);test('fibonacci(6)',fibonacci(6),8);test('fibonacci(10)',fibonacci(10),55);
out.innerHTML+='<div class="section">flatten</div>';test('[1,[2,3],4]',flatten([1,[2,3],4]),[1,2,3,4]);test('[1,[2,[3,4]],5]',flatten([1,[2,[3,4]],5]),[1,2,3,4,5]);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 340,
              },
            ],
          },
        },
      },

      // ── Python guided walkthrough ─────────────────────────────────────────────
      {
        id: 'PythonNotebook',
        title: 'Build Recursive Functions in Python',
        caption: 'Same implementations in Python. Visualize the recursion tree with opencalc.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — factorial and sum_array',
              prose: [
                'Python recursion is identical in structure to JavaScript recursion. The syntax differs, the thinking doesn\'t.',
                'Python\'s default recursion limit is 1000 frames (`sys.getrecursionlimit()`). For deep recursion, you\'d use iteration or `sys.setrecursionlimit()` — but for learning, the default is fine.',
              ],
              instructions: `Implement factorial() and sum_array(). Think: what is the base case? What is the smaller problem?`,
              code: `def factorial(n):
    # TODO: base case — factorial(0) = 1

    # TODO: recursive case — n times factorial(n-1)
    pass


def sum_array(arr):
    # TODO: base case — empty list returns 0

    # TODO: recursive case — first element plus sum of the rest
    # Hint: return arr[0] + sum_array(arr[1:])
    pass


# ── Tests ──────────────────────────────────────────────
assert factorial(0) == 1,   f"factorial(0) got {factorial(0)}"
assert factorial(5) == 120, f"factorial(5) got {factorial(5)}"
assert factorial(6) == 720, f"factorial(6) got {factorial(6)}"
print("✓ factorial: all pass")

assert sum_array([])        == 0,  f"sum_array([]) got {sum_array([])}"
assert sum_array([1,2,3])   == 6,  f"sum_array([1,2,3]) got {sum_array([1,2,3])}"
assert sum_array([4,5,6,7]) == 22, f"sum_array([4,5,6,7]) got {sum_array([4,5,6,7])}"
print("✓ sum_array: all pass")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — fibonacci and the cost visualization',
              prose: [
                'Fibonacci has two base cases — both must be explicit. Then the recursive case calls itself twice.',
                'After confirming correctness, the cell times fib(35) and draws an opencalc bar chart showing how the number of calls grows with n. The exponential curve makes the O(2^n) cost visible.',
              ],
              instructions: `Implement fibonacci(). Then run — the timing and bar chart will show you exactly why naive recursion is dangerous.`,
              code: `import time
from opencalc import Figure, BLUE, RED, AMBER

def fibonacci(n):
    # TODO: base case n == 0

    # TODO: base case n == 1

    # TODO: recursive case

    pass


# ── Correctness ────────────────────────────────────────
assert fibonacci(0)  == 0,  f"fib(0) got {fibonacci(0)}"
assert fibonacci(1)  == 1,  f"fib(1) got {fibonacci(1)}"
assert fibonacci(6)  == 8,  f"fib(6) got {fibonacci(6)}"
assert fibonacci(10) == 55, f"fib(10) got {fibonacci(10)}"
print("✓ fibonacci: correct")

# ── Count calls per n ──────────────────────────────────
call_counts = {}
def fib_counted(n):
    call_counts[n] = call_counts.get(n, 0)
    count = [0]
    def _fib(k):
        count[0] += 1
        if k <= 1: return k
        return _fib(k-1) + _fib(k-2)
    result = _fib(n)
    return result, count[0]

ns = list(range(1, 16))
counts = [fib_counted(n)[1] for n in ns]

fig = Figure(xmin=0, xmax=16, ymin=0, ymax=max(counts)*1.1,
             width=480, height=200,
             title='Function calls to compute fib(n) — exponential growth')
for i, (n, c) in enumerate(zip(ns, counts)):
    color = RED if n >= 12 else AMBER if n >= 8 else BLUE
    fig.bar(n, c, width=0.6, color=color, label=str(c) if n >= 10 else '')
print(fig.show())

# Timing
t0 = time.perf_counter()
r = fibonacci(30)
ms = (time.perf_counter() - t0) * 1000
print(f"fibonacci(30) = {r}  took {ms:.1f}ms")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Step 3 — flatten: recursion on nested structure',
              prose: [
                '`flatten()` is where recursion proves its worth. A loop can flatten one level deep. Recursion handles arbitrary depth with the same logic.',
                'Python\'s `isinstance(el, list)` checks if an element is a list — the equivalent of `Array.isArray()` in JavaScript.',
              ],
              instructions: `Implement flatten(). The pattern: loop through elements, recurse if it's a list, collect if it's a plain value.`,
              code: `def flatten(arr):
    result = []

    for el in arr:
        if isinstance(el, list):
            # TODO: recursively flatten el and extend result with it
            # result.extend(flatten(el))
            pass
        else:
            # TODO: append plain element
            pass

    return result


# ── Tests ──────────────────────────────────────────────
assert flatten([1, 2, 3])              == [1, 2, 3]
assert flatten([1, [2, 3], 4])         == [1, 2, 3, 4]
assert flatten([1, [2, [3, 4]], 5])    == [1, 2, 3, 4, 5]
assert flatten([[1], [2], [3]])        == [1, 2, 3]
assert flatten([1, [2, [3, [4, [5]]]]])== [1, 2, 3, 4, 5]
print("✓ flatten: all pass")

# Show it working on a deeply nested structure
nested = [1, [2, [3, [4, [5, [6, 7]]]]]]
print(f"flatten({nested}) = {flatten(nested)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Challenge — All Four From Scratch in Python',
              prose: [
                'No hints. Empty function bodies. Write every recursive function from memory.',
                'When all assertions pass, the cell draws a recursion "depth ladder" for factorial(6) using opencalc — showing each stack frame as a point.',
              ],
              instructions: `Implement all four functions. Every assertion must pass before the visualization runs.`,
              code: `from opencalc import Figure, BLUE, GREEN, AMBER, PURPLE

def factorial(n):
    pass

def sum_array(arr):
    pass

def fibonacci(n):
    pass

def flatten(arr):
    pass


# ── Assertions ─────────────────────────────────────────
assert factorial(0) == 1
assert factorial(5) == 120
assert factorial(6) == 720
print("✓ factorial")

assert sum_array([])        == 0
assert sum_array([1, 2, 3]) == 6
assert sum_array([4, 5, 6]) == 15
print("✓ sum_array")

assert fibonacci(0)  == 0
assert fibonacci(1)  == 1
assert fibonacci(6)  == 8
assert fibonacci(10) == 55
print("✓ fibonacci")

assert flatten([1, [2, 3], 4])      == [1, 2, 3, 4]
assert flatten([1, [2, [3, 4]], 5]) == [1, 2, 3, 4, 5]
print("✓ flatten")

print()
print("All assertions passed.")

# ── Visualize: factorial(6) call stack depths ─────────
# Each point = one stack frame, labeled with the call
labels = [f"factorial({i})" for i in range(7)]
n_frames = len(labels)
fig = Figure(xmin=0, xmax=3, ymin=-0.5, ymax=n_frames,
             width=240, height=max(160, n_frames*36+20),
             title="Call stack frames for factorial(6)")
fig.axes(labels=False, ticks=False)
for i, lbl in enumerate(labels):
    color = GREEN if i == 0 else BLUE
    fig.point((1.5, i), color=color, label=lbl, radius=22)
    if i < n_frames - 1:
        fig.arrow((1.5, i+0.2), (1.5, i+0.8), width=1)
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
      'Recursive time complexity analysis:\n- factorial(n): T(n) = T(n-1) + O(1) → O(n)\n- sumArray(n): T(n) = T(n-1) + O(1) → O(n)\n- fibonacci(n): T(n) = T(n-1) + T(n-2) + O(1) → O(2^n) naive\n- flatten: O(n) where n = total number of elements across all levels',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Recursion depth = stack space',
        body: 'Every recursive call uses O(1) stack space per frame. Factorial on n uses O(n) stack space. Fibonacci on n uses O(n) stack space (deepest branch). Deep recursion on large inputs can overflow the stack before running out of time.',
      },
    ],
    visualizations: [],
  },

  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],

  challenges: [
    {
      id: 'dsa2-001-c1',
      title: 'Power Function: x^n Recursively',
      difficulty: 'medium',
      description: 'Implement pow(x, n) recursively. The naive approach is O(n). The fast approach uses the fact that x^n = (x^(n/2))^2 for even n — cutting the problem in half each time. O(log n).',
      starterCode: `def pow_naive(x, n):
    """O(n) — multiply x by itself n times recursively."""
    if n == 0:
        return 1
    # TODO: x times pow_naive(x, n-1)


def pow_fast(x, n):
    """O(log n) — halve n each time using x^n = (x^2)^(n/2)."""
    if n == 0:
        return 1
    if n % 2 == 0:
        # TODO: compute half = pow_fast(x, n // 2), return half * half
        pass
    else:
        # TODO: return x * pow_fast(x, n - 1)
        pass

print(pow_naive(2, 10))   # 1024
print(pow_fast(2, 10))    # 1024
print(pow_fast(3, 5))     # 243`,
      solution: `def pow_naive(x, n):
    if n == 0: return 1
    return x * pow_naive(x, n-1)

def pow_fast(x, n):
    if n == 0: return 1
    if n % 2 == 0:
        half = pow_fast(x, n // 2)
        return half * half
    return x * pow_fast(x, n - 1)`,
      hint: 'For even n: x^8 = (x^4)^2. Compute x^4 once, square it — saves half the work. For odd n: fall back to x * x^(n-1) and let the next call handle the now-even exponent.',
    },
  ],
};
