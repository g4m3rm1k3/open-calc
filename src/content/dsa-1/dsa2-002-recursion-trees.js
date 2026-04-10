export default {
  id: 'dsa2-002',
  slug: 'recursion-trees',
  chapter: 'dsa2',
  order: 2,
  title: 'Recursion Trees & Memoization',
  subtitle: 'Visualize the redundant work in naive recursion, then eliminate it. Memoization transforms O(2^n) Fibonacci into O(n) by caching answers you\'ve already computed.',
  tags: ['memoization', 'recursion tree', 'dynamic programming', 'top-down', 'cache', 'overlapping subproblems', 'fibonacci', 'optimal substructure'],
  aliases: 'memoization recursion tree dynamic programming top-down cache overlapping subproblems fibonacci',

  hook: {
    question: 'If your recursive function keeps computing the same answer over and over, what if you just saved the first answer and looked it up every time after?',
    realWorldContext: 'Memoization is the foundation of dynamic programming — used everywhere from route planning (Google Maps caches intermediate distances) to compiler optimization (caching type-check results) to bioinformatics (DNA sequence alignment). Every interview DP problem is memoization applied to a recursive structure. Once you see memoization, you see it everywhere.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Last lesson you built four recursive functions and felt the danger of Fibonacci — O(2^n) calls. Now you fix it. The problem isn\'t recursion itself, it\'s **redundant computation**. fib(3) gets called multiple times in fib(6). Every one of those calls does the same work and returns the same answer.',
      '**Overlapping subproblems.** When the same subproblem appears in multiple branches of your recursion tree, you have overlapping subproblems. This is the signal that memoization will help. If every subproblem is unique (like sumArray), memoization does nothing.',
      '**Memoization: cache before you recurse.** The pattern is three lines added to any existing recursive function:\n1. Check if the answer is already in the cache — if so, return it immediately\n2. Compute the answer as normal\n3. Store it in the cache before returning\nThat\'s it. Same recursion, same logic, O(n) instead of O(2^n).',
      '**Top-down vs bottom-up.** Memoization is called "top-down DP" — you start at the big problem and recurse down, caching on the way back up. The alternative ("bottom-up" or "tabulation") starts from the smallest subproblems and builds up. Both have the same complexity. Top-down is easier to derive from an existing recursive solution.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 2, Lesson 2: Recursion Trees & Memoization',
        body: '**Previous:** Recursion Basics — base cases, call stack, factorial/fibonacci/flatten.\n**This lesson:** Memoization — cache results to eliminate redundant branches.\n**Next:** Backtracking — recursion that explores choices and backtracks on dead ends.',
      },
      {
        type: 'insight',
        title: 'The memoization template',
        body: '```\ncache = {}\ndef fib(n):\n    if n in cache: return cache[n]   # ← lookup\n    if n <= 1: return n\n    cache[n] = fib(n-1) + fib(n-2)  # ← store\n    return cache[n]\n```\nAdd two lines to any recursive function and it becomes memoized.',
      },
      {
        type: 'warning',
        title: 'Memoization only helps overlapping subproblems',
        body: 'If every subproblem is unique, the cache never gets a hit and you just pay the cost of storing results. Check your recursion tree first — if you see the same node appearing at multiple branches, memoize. If every node is unique, memoization won\'t help.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Memoization: Before and After',
        mathBridge: 'The left tree shows naive Fibonacci — grey nodes are repeated computations. The right shows memoized — each subproblem computed exactly once. The cache hits are shown in amber.',
        caption: 'Same answer. Completely different work.',
        props: {
          lesson: {
            title: 'Recursion Trees: Naive vs Memoized',
            subtitle: 'See the redundancy, then eliminate it.',
            sequential: false,
            cells: [
              {
                type: 'js',
                title: 'fib(6): Naive vs Memoized — Call Count Comparison',
                instruction: 'Use the slider to change n. Watch the call counts diverge as n grows.\n\n**Left counter:** total calls in naive recursion (exponential).\n**Right counter:** total calls with memoization (linear — each subproblem computed once).',
                html: `<div style="margin-bottom:10px;display:flex;gap:12px;align-items:center">
  <label style="font-family:monospace;font-size:12px;color:#94a3b8">n =</label>
  <input id="slider" type="range" min="1" max="20" value="8" style="width:180px">
  <span id="n-label" style="font-family:monospace;font-size:14px;color:#e2e8f0;min-width:20px">8</span>
</div>
<div style="display:flex;gap:16px">
  <div style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:14px;text-align:center">
    <div style="color:#94a3b8;font-size:11px;font-family:monospace;margin-bottom:6px">NAIVE</div>
    <div id="naive-count" style="font-size:28px;font-weight:bold;color:#f87171;font-family:monospace">-</div>
    <div style="color:#64748b;font-size:10px;font-family:monospace;margin-top:4px">function calls</div>
  </div>
  <div style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:14px;text-align:center">
    <div style="color:#94a3b8;font-size:11px;font-family:monospace;margin-bottom:6px">MEMOIZED</div>
    <div id="memo-count" style="font-size:28px;font-weight:bold;color:#4ade80;font-family:monospace">-</div>
    <div style="color:#64748b;font-size:10px;font-family:monospace;margin-top:4px">function calls</div>
  </div>
  <div style="flex:1;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:14px;text-align:center">
    <div style="color:#94a3b8;font-size:11px;font-family:monospace;margin-bottom:6px">SPEEDUP</div>
    <div id="speedup" style="font-size:28px;font-weight:bold;color:#f59e0b;font-family:monospace">-</div>
    <div style="color:#64748b;font-size:10px;font-family:monospace;margin-top:4px">× fewer calls</div>
  </div>
</div>
<div id="bar" style="margin-top:12px;height:18px;border-radius:4px;background:#334155;overflow:hidden">
  <div id="bar-fill" style="height:100%;background:#f87171;transition:width .3s;width:50%"></div>
</div>
<div style="font-family:monospace;font-size:10px;color:#475569;margin-top:3px">← naive fill proportion (100% = naive uses all the calls)</div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}`,
                startCode: `function naiveCalls(n) {
  let c = 0;
  function fib(k) { c++; if (k <= 1) return k; fib(k-1); fib(k-2); }
  fib(n); return c;
}
function memoCalls(n) {
  let c = 0; const cache = {};
  function fib(k) {
    c++;
    if (k in cache) return cache[k];
    if (k <= 1) { cache[k] = k; return k; }
    cache[k] = fib(k-1) + fib(k-2);
    return cache[k];
  }
  fib(n); return c;
}

function update() {
  const n = parseInt(document.getElementById('slider').value);
  document.getElementById('n-label').textContent = n;
  const naive = naiveCalls(n);
  const memo  = memoCalls(n);
  const ratio = (naive / memo).toFixed(1);
  document.getElementById('naive-count').textContent = naive.toLocaleString();
  document.getElementById('memo-count').textContent  = memo.toLocaleString();
  document.getElementById('speedup').textContent     = ratio + '×';
  const pct = Math.min(100, (naive / (naive + memo)) * 100);
  document.getElementById('bar-fill').style.width = pct + '%';
}

document.getElementById('slider').addEventListener('input', update);
update();`,
                outputHeight: 220,
              },
              {
                type: 'js',
                title: 'Cache Hits: Watch Memoization Work Step by Step',
                instruction: 'Click **Step** to execute fib(7) with memoization one call at a time.\n\n**Purple node:** first time computing — work is done.\n**Amber node:** cache HIT — result returned immediately, no recursion.\n\nCount how many amber nodes appear. That\'s how much work is saved.',
                html: `<div style="margin-bottom:8px;display:flex;gap:8px;align-items:center">
  <button id="btn-step" style="padding:7px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Step →</button>
  <button id="btn-play" style="padding:7px 14px;border-radius:6px;border:none;background:#0d9488;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Play</button>
  <button id="btn-rst"  style="padding:7px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
  <span id="stats" style="font-family:monospace;font-size:11px;color:#94a3b8"></span>
</div>
<canvas id="c" width="620" height="240" style="display:block;width:100%;border-radius:6px;background:#0a0f1e"></canvas>
<div id="log" style="margin-top:8px;font-family:monospace;font-size:11px;color:#64748b;min-height:18px"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}`,
                startCode: `const N = 7;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const PR = devicePixelRatio;
canvas.width = canvas.offsetWidth * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

// Build call sequence with memoization
const sequence = [];
const cache = {};
function buildSeq(n, depth=0, x=0.5, spread=0.35) {
  const hit = n in cache;
  const node = { n, depth, x, hit, val: hit ? cache[n] : null };
  sequence.push(node);
  if (!hit) {
    if (n <= 1) { cache[n] = n; node.val = n; }
    else {
      buildSeq(n-1, depth+1, x - spread, spread*0.55);
      buildSeq(n-2, depth+1, x + spread, spread*0.55);
      cache[n] = cache[n-1] + cache[n-2];
      node.val = cache[n];
    }
  }
  return node;
}

// reset cache and rebuild
Object.keys(cache).forEach(k => delete cache[k]);
buildSeq(N);

const nodes = [];
let stepIdx = 0, computeCount = 0, hitCount = 0;

function getPos(depth, x) {
  return { cx: x * W, cy: 24 + depth * (H - 40) / N };
}

function drawAll() {
  ctx.clearRect(0, 0, W, H);
  // Draw edges first
  nodes.forEach(nd => {
    if (nd.parent) {
      const p = getPos(nd.parent.depth, nd.parent.x);
      const c = getPos(nd.depth, nd.x);
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.cx, p.cy+10); ctx.lineTo(c.cx, c.cy-10); ctx.stroke();
    }
  });
  nodes.forEach(nd => {
    const { cx, cy } = getPos(nd.depth, nd.x);
    const r = Math.max(9, 14 - nd.depth * 1.2);
    ctx.fillStyle   = nd.hit ? '#292107' : '#1e1b4b';
    ctx.strokeStyle = nd.hit ? '#f59e0b' : '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = nd.hit ? '#f59e0b' : '#a5b4fc';
    ctx.font = \`bold \${Math.max(8, 12 - nd.depth)}px monospace\`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(\`f\${nd.n}\`, cx, cy);
  });
}

function doStep() {
  if (stepIdx >= sequence.length) return;
  const s = sequence[stepIdx];
  const nd = { ...s, parent: stepIdx > 0 ? nodes[nodes.length - 1] : null };
  // fix parent tracking: build parent map
  nodes.push(nd);
  stepIdx++;
  if (s.hit) hitCount++; else computeCount++;
  document.getElementById('stats').textContent =
    \`computed: \${computeCount} | cache hits: \${hitCount}\`;
  document.getElementById('log').textContent = s.hit
    ? \`cache HIT: fib(\${s.n}) = \${s.val} — skipped recursion\`
    : s.n <= 1
      ? \`base case: fib(\${s.n}) = \${s.n}\`
      : \`computing: fib(\${s.n})…\`;
  drawAll();
}

document.getElementById('btn-step').addEventListener('click', doStep);
document.getElementById('btn-rst').addEventListener('click', () => {
  nodes.length = 0; stepIdx = 0; computeCount = 0; hitCount = 0;
  ctx.clearRect(0, 0, W, H);
  document.getElementById('stats').textContent = '';
  document.getElementById('log').textContent = '';
});
document.getElementById('btn-play').addEventListener('click', () => {
  nodes.length = 0; stepIdx = 0; computeCount = 0; hitCount = 0;
  ctx.clearRect(0, 0, W, H);
  const t = setInterval(() => {
    if (stepIdx >= sequence.length) { clearInterval(t); return; }
    doStep();
  }, 300);
});`,
                outputHeight: 290,
              },
            ],
          },
        },
      },

      // ── JavaScript guided walkthrough ─────────────────────────────────────────
      {
        id: 'JSNotebook',
        title: 'Build Memoization in JavaScript',
        caption: 'Add memoization to naive recursion, then build a general memoize() wrapper.',
        props: {
          lesson: {
            title: 'Memoization in JavaScript',
            subtitle: 'Cache it. Never compute the same thing twice.',
            cells: [
              // ── JS Cell 1: Memoized fibonacci ─────────────────────────────────
              {
                type: 'js',
                instruction: `## Step 1 — Memoize Fibonacci

Take the naive fibonacci from last lesson and add three things:
1. A \`cache\` object (outside or inside the function, your choice — but it must persist across calls)
2. At the **top** of the function: if \`n in cache\`, return \`cache[n]\`
3. Before returning: store the result in \`cache[n]\`

Everything else stays the same. The recursion logic is unchanged.

After the implementation, the test times both versions on n=38 — you'll see the speedup firsthand.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}
.timing{color:#f59e0b;margin:4px 0;font-size:12px}.fast{color:#4ade80;margin:4px 0;font-size:12px}`,
                startCode: `// ── Naive (for comparison) ───────────────────────────
function fibNaive(n) {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// ── Memoized ───────────────────────────────────────────
const cache = {};  // cache persists across calls

function fibMemo(n) {
  // TODO: if n is in cache, return cache[n] immediately

  // TODO: base cases (same as before)

  // TODO: compute result (same recursive formula)

  // TODO: store result in cache[n] before returning

}

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}\${pass?'':' (expected '+expected+')'}</div>\`;
}

test('fibMemo(0)',  fibMemo(0),  0);
test('fibMemo(1)',  fibMemo(1),  1);
test('fibMemo(6)',  fibMemo(6),  8);
test('fibMemo(10)', fibMemo(10), 55);
test('fibMemo(30)', fibMemo(30), 832040);

// ── Timing comparison ─────────────────────────────────
const t1 = performance.now();
fibNaive(38);
const naiveMs = (performance.now() - t1).toFixed(0);

const t2 = performance.now();
fibMemo(38);
const memoMs = (performance.now() - t2).toFixed(1);

out.innerHTML += \`<div class="timing">fibNaive(38): \${naiveMs}ms</div>\`;
out.innerHTML += \`<div class="fast">fibMemo(38):  \${memoMs}ms  (\${Math.round(naiveMs/Math.max(0.1,memoMs))}× faster)</div>\`;`,
                solutionCode: `function fibNaive(n) { if(n<=1)return n; return fibNaive(n-1)+fibNaive(n-2); }
const cache = {};
function fibMemo(n) {
  if (n in cache) return cache[n];
  if (n <= 1) return (cache[n] = n);
  cache[n] = fibMemo(n-1) + fibMemo(n-2);
  return cache[n];
}
const out=document.getElementById('out');
function test(label,got,expected){const pass=got===expected;out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}</div>\`;}
test('fibMemo(0)',fibMemo(0),0);test('fibMemo(1)',fibMemo(1),1);test('fibMemo(6)',fibMemo(6),8);test('fibMemo(10)',fibMemo(10),55);test('fibMemo(30)',fibMemo(30),832040);
const t1=performance.now();fibNaive(38);const nm=(performance.now()-t1).toFixed(0);
const t2=performance.now();fibMemo(38);const mm=(performance.now()-t2).toFixed(1);
out.innerHTML+=\`<div style="color:#f59e0b;margin:4px 0;font-size:12px">fibNaive(38): \${nm}ms</div>\`;
out.innerHTML+=\`<div style="color:#4ade80;margin:4px 0;font-size:12px">fibMemo(38): \${mm}ms</div>\`;`,
                outputHeight: 190,
              },

              // ── JS Cell 2: Generic memoize() wrapper ──────────────────────────
              {
                type: 'js',
                instruction: `## Step 2 — A Generic memoize() Wrapper

Instead of manually adding a cache to every function, build a \`memoize(fn)\` higher-order function that wraps any function and caches its results automatically.

**How it works:**
\`\`\`js
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);  // serialize args as cache key
    if (key in cache) return cache[key];
    cache[key] = fn(...args);
    return cache[key];
  };
}
\`\`\`

The tricky part: a memoized recursive function must call **its own memoized version**, not the original. You'll handle that by reassigning after wrapping.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.info{color:#94a3b8;margin:2px 0}`,
                startCode: `function memoize(fn) {
  const cache = {};
  return function(...args) {
    // TODO: create a key from args using JSON.stringify(args)

    // TODO: if key is in cache, return cache[key]

    // TODO: compute result with fn(...args), store in cache[key], return it

  };
}

// ── Use memoize on fibonacci ───────────────────────────
// Note: fib must call the memoized version of itself
let fib = function(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);  // 'fib' here refers to the reassigned memoized version
};
fib = memoize(fib);  // reassign so recursive calls hit the cache

// ── Use memoize on a different function ───────────────
// Slow: count how many ways to climb n stairs (1 or 2 steps at a time)
let climbStairs = function(n) {
  if (n <= 1) return 1;
  if (n === 2) return 2;
  return climbStairs(n - 1) + climbStairs(n - 2);
};
climbStairs = memoize(climbStairs);

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
function test(label, got, expected) {
  const pass = got === expected;
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}\${pass?'':' (expected '+expected+')'}</div>\`;
}

out.innerHTML += '<div class="info">fib (memoized):</div>';
test('fib(0)',  fib(0),  0);
test('fib(10)', fib(10), 55);
test('fib(30)', fib(30), 832040);

out.innerHTML += '<div class="info" style="margin-top:8px">climbStairs (memoized):</div>';
test('climbStairs(1)',  climbStairs(1),  1);
test('climbStairs(4)',  climbStairs(4),  5);
test('climbStairs(10)', climbStairs(10), 89);`,
                solutionCode: `function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) return cache[key];
    cache[key] = fn(...args);
    return cache[key];
  };
}
let fib = function(n) { if(n<=1)return n; return fib(n-1)+fib(n-2); };
fib = memoize(fib);
let climbStairs = function(n) { if(n<=1)return 1; if(n===2)return 2; return climbStairs(n-1)+climbStairs(n-2); };
climbStairs = memoize(climbStairs);
const out=document.getElementById('out');
function test(label,got,expected){const pass=got===expected;out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}</div>\`;}
test('fib(0)',fib(0),0);test('fib(10)',fib(10),55);test('fib(30)',fib(30),832040);
test('climbStairs(1)',climbStairs(1),1);test('climbStairs(4)',climbStairs(4),5);test('climbStairs(10)',climbStairs(10),89);`,
                outputHeight: 200,
              },

              // ── JS Cell 3: From scratch ───────────────────────────────────────
              {
                type: 'js',
                instruction: `## Challenge — Memoized Functions From Scratch

Write both from memory:

1. **\`fibMemo(n)\`** — fibonacci with its own internal cache (no memoize wrapper)
2. **\`memoize(fn)\`** — the generic wrapper that works on any function
3. Use \`memoize\` to speed up \`climbStairs\`

All tests must go green.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}
.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}
.section{color:#64748b;font-size:11px;margin-top:10px;border-top:1px solid #1e293b;padding-top:6px}
.banner{margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px}
.banner.ok{background:#052e16;border:1px solid #166534;color:#4ade80}
.banner.bad{background:#450a0a;border:1px solid #7f1d1d;color:#f87171}`,
                startCode: `// ── 1. Memoized fibonacci (internal cache) ───────────
function fibMemo(n) {
  // implement with a cache variable
}

// ── 2. Generic memoize wrapper ────────────────────────
function memoize(fn) {
  // wrap fn so that results are cached by JSON.stringify(args)
}

// ── 3. climbStairs via memoize ────────────────────────
let climbStairs = function(n) {
  if (n <= 1) return 1;
  if (n === 2) return 2;
  return climbStairs(n - 1) + climbStairs(n - 2);
};
climbStairs = memoize(climbStairs);

// ── Tests ──────────────────────────────────────────────
const out = document.getElementById('out');
const results = [];
function test(label, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  results.push(pass);
  out.innerHTML += \`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}\${pass?'':' (expected '+expected+')'}</div>\`;
}

try {
  out.innerHTML += '<div class="section">fibMemo</div>';
  test('fibMemo(0)',  fibMemo(0),  0);
  test('fibMemo(1)',  fibMemo(1),  1);
  test('fibMemo(6)',  fibMemo(6),  8);
  test('fibMemo(30)', fibMemo(30), 832040);

  out.innerHTML += '<div class="section">climbStairs (via memoize)</div>';
  test('climbStairs(1)',  climbStairs(1),  1);
  test('climbStairs(4)',  climbStairs(4),  5);
  test('climbStairs(10)', climbStairs(10), 89);
  test('climbStairs(20)', climbStairs(20), 10946);

  const all = results.every(Boolean);
  out.innerHTML += \`<div class="banner \${all?'ok':'bad'}">\${all
    ? '✓ All tests pass. Memoization — implemented from scratch.'
    : results.filter(Boolean).length + '/' + results.length + ' passing.'
  }</div>\`;
} catch(e) {
  out.innerHTML += '<div class="fail">Error: ' + e.message + '</div>';
}`,
                solutionCode: `const _cache = {};
function fibMemo(n) {
  if (n in _cache) return _cache[n];
  if (n <= 1) return (_cache[n] = n);
  return (_cache[n] = fibMemo(n-1) + fibMemo(n-2));
}
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (key in cache) return cache[key];
    return (cache[key] = fn(...args));
  };
}
let climbStairs = function(n) { if(n<=1)return 1; if(n===2)return 2; return climbStairs(n-1)+climbStairs(n-2); };
climbStairs = memoize(climbStairs);
const out=document.getElementById('out');const results=[];
function test(label,got,expected){const pass=JSON.stringify(got)===JSON.stringify(expected);results.push(pass);out.innerHTML+=\`<div class="\${pass?'pass':'fail'}">\${pass?'✓':'✗'} \${label}: \${got}</div>\`;}
test('fibMemo(0)',fibMemo(0),0);test('fibMemo(6)',fibMemo(6),8);test('fibMemo(30)',fibMemo(30),832040);
test('climbStairs(1)',climbStairs(1),1);test('climbStairs(4)',climbStairs(4),5);test('climbStairs(10)',climbStairs(10),89);
const all=results.every(Boolean);out.innerHTML+=\`<div class="banner \${all?'ok':'bad'}">\${all?'✓ All tests pass.':results.filter(Boolean).length+'/'+results.length+' passing.'}</div>\`;`,
                outputHeight: 280,
              },
            ],
          },
        },
      },

      // ── Python guided walkthrough ─────────────────────────────────────────────
      {
        id: 'PythonNotebook',
        title: 'Memoization in Python',
        caption: 'Build memoization manually, then use Python\'s built-in @lru_cache. Visualize the call savings.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — Memoize fibonacci manually',
              prose: [
                'The pattern is the same as JavaScript: check the cache at the top, compute normally, store before returning.',
                'Python dict lookup is O(1). Checking `if n in cache` is the same cost as any other dict access.',
              ],
              instructions: `Add memoization to fib_naive to create fib_memo. Then run the timing comparison.`,
              code: `import time

def fib_naive(n):
    if n <= 1: return n
    return fib_naive(n-1) + fib_naive(n-2)

# ── Your turn: add memoization ────────────────────────
cache = {}

def fib_memo(n):
    # TODO: if n is in cache, return cache[n]

    # TODO: base cases

    # TODO: compute, store in cache[n], return

    pass

# ── Correctness ────────────────────────────────────────
assert fib_memo(0)  == 0
assert fib_memo(1)  == 1
assert fib_memo(6)  == 8
assert fib_memo(10) == 55
assert fib_memo(30) == 832040
print("✓ fib_memo: correct")

# ── Timing ────────────────────────────────────────────
t0 = time.perf_counter()
fib_naive(35)
naive_ms = (time.perf_counter() - t0) * 1000

t1 = time.perf_counter()
fib_memo(35)
memo_ms = (time.perf_counter() - t1) * 1000

print(f"fib_naive(35): {naive_ms:.1f}ms")
print(f"fib_memo(35):  {memo_ms:.4f}ms")
print(f"Speedup: {naive_ms / max(memo_ms, 0.001):.0f}×")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Step 2 — Python\'s @lru_cache decorator',
              prose: [
                'Python ships with `functools.lru_cache` — a decorator that memoizes any function automatically. It\'s the production way to do what you just built manually.',
                '`@lru_cache(maxsize=None)` means unlimited cache size. `maxsize=128` would evict old entries when the cache fills (LRU = Least Recently Used).',
              ],
              instructions: `Use @lru_cache to memoize fibonacci and climbStairs. Compare the decorator approach to your manual cache. Then see how to clear the cache between calls.`,
              code: `from functools import lru_cache
import time

# ── With @lru_cache ────────────────────────────────────
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)

@lru_cache(maxsize=None)
def climb_stairs(n):
    if n <= 1: return 1
    if n == 2: return 2
    return climb_stairs(n-1) + climb_stairs(n-2)

# ── Tests ──────────────────────────────────────────────
assert fib(0)  == 0
assert fib(6)  == 8
assert fib(30) == 832040
print("✓ fib with @lru_cache")

assert climb_stairs(1)  == 1
assert climb_stairs(4)  == 5
assert climb_stairs(10) == 89
print("✓ climb_stairs with @lru_cache")

# ── Cache info ────────────────────────────────────────
print(f"fib cache info: {fib.cache_info()}")

# ── Timing: lru_cache vs manual ───────────────────────
t0 = time.perf_counter()
fib(100)
lru_ms = (time.perf_counter() - t0) * 1000
print(f"fib(100) with @lru_cache: {lru_ms:.4f}ms")
print(f"fib(100) = {fib(100)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Challenge — Memoization From Scratch in Python',
              prose: [
                'No decorators. No hints. Write both the manual memoized version and a generic memoize() function.',
                'When all assertions pass, the cell draws an opencalc bar chart comparing call counts: naive vs memoized across n=1 to 15.',
              ],
              instructions: `Implement fib_memo() with an internal cache dict, and memoize(fn) as a generic wrapper. All assertions must pass.`,
              code: `from opencalc import Figure, RED, GREEN, BLUE, AMBER

# ── 1. Memoized fibonacci (internal cache) ────────────
def fib_memo(n, cache={}):
    # TODO: check cache, handle base cases, compute, store, return
    pass

# ── 2. Generic memoize wrapper ────────────────────────
def memoize(fn):
    # TODO: return a wrapper function that caches by args
    pass

# ── 3. Use memoize on climb_stairs ────────────────────
def _climb(n):
    if n <= 1: return 1
    if n == 2: return 2
    return climb_stairs(n-1) + climb_stairs(n-2)

climb_stairs = memoize(_climb)

# ── Assertions ─────────────────────────────────────────
assert fib_memo(0)  == 0,      f"fib_memo(0) = {fib_memo(0)}"
assert fib_memo(6)  == 8,      f"fib_memo(6) = {fib_memo(6)}"
assert fib_memo(30) == 832040, f"fib_memo(30) = {fib_memo(30)}"
print("✓ fib_memo")

assert climb_stairs(1)  == 1,  f"climb_stairs(1) = {climb_stairs(1)}"
assert climb_stairs(4)  == 5,  f"climb_stairs(4) = {climb_stairs(4)}"
assert climb_stairs(10) == 89, f"climb_stairs(10) = {climb_stairs(10)}"
print("✓ climb_stairs via memoize")

print()
print("All assertions passed. Drawing call count comparison:")

# ── Visualize call counts ──────────────────────────────
def count_naive(n):
    count = [0]
    def f(k):
        count[0] += 1
        if k <= 1: return k
        return f(k-1) + f(k-2)
    f(n); return count[0]

def count_memo(n):
    count = [0]; c = {}
    def f(k):
        count[0] += 1
        if k in c: return c[k]
        if k <= 1: c[k]=k; return k
        c[k]=f(k-1)+f(k-2); return c[k]
    f(n); return count[0]

ns = list(range(1, 16))
naive_counts = [count_naive(n) for n in ns]
memo_counts  = [count_memo(n)  for n in ns]
max_val = max(naive_counts)

fig = Figure(xmin=0, xmax=17, ymin=0, ymax=max_val * 1.1,
             width=500, height=220,
             title='Call counts: naive (red) vs memoized (green)')
for i, n in enumerate(ns):
    x = n
    fig.bar(x - 0.22, naive_counts[i], width=0.38, color=RED)
    fig.bar(x + 0.22, memo_counts[i],  width=0.38, color=GREEN)
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
      'Memoized Fibonacci complexity:\n- Time: O(n) — each subproblem computed exactly once\n- Space: O(n) — cache stores n entries, call stack depth is O(n)',
      'Recurrence with memoization: T(n) = O(1) per unique subproblem × n unique subproblems = O(n)',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Memoization = trading space for time',
        body: 'You pay O(n) extra memory to store results. In exchange you drop from O(2^n) to O(n) time. This is the classic space-time tradeoff — almost always worth it when subproblems overlap.',
      },
    ],
    visualizations: [],
  },

  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],

  challenges: [
    {
      id: 'dsa2-002-c1',
      title: 'Unique Paths (Grid DP)',
      difficulty: 'hard',
      description: 'A robot starts at the top-left of an m×n grid and can only move right or down. How many unique paths to the bottom-right? Solve recursively with memoization.',
      starterCode: `def unique_paths(m, n, cache={}):
    """
    Base cases:
    - 1 row or 1 column: only 1 path (forced direction)
    Recursive case:
    - paths(m,n) = paths(m-1,n) + paths(m,n-1)
    """
    key = (m, n)
    # TODO: check cache

    # TODO: base case — single row or column

    # TODO: recursive case, store in cache

print(unique_paths(3, 7))   # 28
print(unique_paths(3, 2))   # 3
print(unique_paths(1, 1))   # 1`,
      solution: `def unique_paths(m, n, cache={}):
    key = (m, n)
    if key in cache: return cache[key]
    if m == 1 or n == 1: return 1
    cache[key] = unique_paths(m-1, n, cache) + unique_paths(m, n-1, cache)
    return cache[key]`,
      hint: 'A 1×k grid has exactly 1 path (go right k times). An m×1 grid has exactly 1 path (go down m times). For any other cell, the number of paths = paths from above + paths from the left.',
    },
  ],
};
