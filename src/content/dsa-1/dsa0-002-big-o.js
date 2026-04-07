export default {
  id: 'dsa0-002',
  slug: 'time-and-space-complexity',
  chapter: 'dsa0',
  order: 2,
  title: 'Time & Space Complexity',
  subtitle: 'How to measure the cost of an algorithm before running it — and why the difference between O(n) and O(n²) can mean seconds vs hours.',
  tags: ['big-o', 'complexity', 'time complexity', 'space complexity', 'asymptotic analysis', 'growth rate'],
  aliases: 'big O notation time complexity space complexity algorithmic analysis O(n) O(n^2) O(log n) asymptotic',

  hook: {
    question: 'Two algorithms both sort a list correctly. One takes 1 second on 1,000 items. The other takes 0.001 seconds. At 1,000,000 items, one finishes in about 17 minutes — and the other in under 2 seconds. How do we predict this before running either?',
    realWorldContext: 'In 2012, a bug in a popular trading platform\'s order-matching code caused a $440 million loss in 45 minutes. The algorithm was O(n²) in a critical path — fine for testing with small order books, catastrophic under real market load. Google\'s search index covers hundreds of billions of pages: if their lookup were O(n) instead of O(log n), a single query would be physically impossible to answer in under a second. Every engineering decision about which data structure or algorithm to use is fundamentally a complexity decision. Big-O notation is the language engineers use to have that conversation precisely.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You have a mental model of how programs use memory. Now you need a way to talk about how much *time* and *memory* an algorithm consumes — not for a specific input, but as a function of input size.',
      'The core insight behind Big-O is this: **we do not care about exact operation counts. We care about how the count grows as input size grows.** If an algorithm does `3n + 7` operations, we say it is O(n). The 3 and the 7 disappear because for large n, they are irrelevant. What matters is the shape of the growth curve.',
      'Think of it like predicting traffic. You do not need to know exactly how many cars are on the road — you need to know: does doubling the number of cars double the travel time? Or does it make it ten times worse? The answer determines whether you can scale.',
      '**The complexity classes you will encounter constantly:**\n\nO(1) — constant time. The cost does not depend on input size at all. Array index lookup: `arr[5]`. Hash table lookup (average). These are the holy grail.\n\nO(log n) — logarithmic time. Each step cuts the problem in half. Binary search is the canonical example: searching 1,000,000 items takes about 20 steps, not 1,000,000. This is why balanced trees are so powerful.\n\nO(n) — linear time. You touch each element once. Scanning an array. Finding a maximum. Unavoidable when you must examine all input.\n\nO(n log n) — "n log n" time. The cost of comparison-based sorting. Merge sort, heapsort. Unavoidable for comparison-based sorting — proven by a lower bound argument.\n\nO(n²) — quadratic time. Two nested loops, each 0..n. Bubble sort, selection sort, naive matrix operations. Fine for n < 10,000. Catastrophic for n = 1,000,000.\n\nO(2ⁿ) — exponential time. The cost explodes. Brute-force subset enumeration. Works only for tiny inputs (n < 30).',
      '**Space complexity** is the same idea applied to memory. An algorithm that stores a copy of the input is O(n) space. One that sorts in-place is O(1) space. Recursion depth counts as space — a recursive function that goes n levels deep uses O(n) stack space, even if each frame is small.',
      '**Amortized analysis preview.** Some data structures have operations that are occasionally expensive but cheap on average. A dynamic array (Python list, JavaScript Array) doubles in capacity when full: one out of every n pushes copies the whole array. That one push costs O(n). But spread over n pushes, the cost per push is O(1) amortized. You will see this pattern with many clever data structures.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of Foundations',
        body: '**Previous:** Execution & Memory Model — how programs use memory.\n**This lesson:** Big-O — how to measure algorithmic cost before running it.\n**Next:** Algorithmic Thinking — how to decompose problems.',
      },
      {
        type: 'insight',
        title: 'Big-O is a ceiling, not an exact count',
        body: 'O(n) means "grows at most linearly." The formal definition is: f(n) = O(g(n)) if there exist constants c and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀. In practice: drop constants, drop lower-order terms, keep the dominant term.',
      },
      {
        type: 'warning',
        title: 'The constant factor still matters in practice',
        body: 'Big-O hides constants. An O(n) algorithm with a huge constant can lose to an O(n²) algorithm with a tiny constant for realistic input sizes. Always profile on real data before assuming the asymptotically better algorithm is faster in practice.',
      },
      {
        type: 'insight',
        title: 'How to read nested loops',
        body: 'Each nested loop multiplies the complexity. One loop 0..n: O(n). Two nested loops 0..n: O(n²). Three: O(n³). Exception: if the inner loop\'s range does not depend on n (e.g., always runs 5 times), it counts as a constant factor.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Growth Curves, Step Counters & Complexity Challenges',
        mathBridge: 'The interactive cells below let you see complexity classes grow, count actual algorithm steps, and test your ability to read Big-O from code. Work through them in order.',
        caption: 'Move sliders to see how each complexity class diverges from the others as n grows.',
        props: {
          lesson: {
            title: 'Big-O: Seeing Complexity',
            subtitle: 'Visualize growth curves, count steps, and identify complexity from code.',
            sequential: true,
            cells: [

              // ── Cell 1: Growth Curve Plotter ──────────────────────────────────
              {
                type: 'js',
                title: 'Growth Curve Plotter',
                instruction: 'Drag the **n** slider right and watch the curves diverge.\n\nAt small n, all algorithms feel fast. At large n, the difference between O(n log n) and O(n²) becomes the difference between milliseconds and minutes.',
                html: `<canvas id="c" width="680" height="340" style="display:block;width:100%;border-radius:8px"></canvas>
<div style="padding:6px 4px 0;display:flex;align-items:center;gap:10px;font-family:monospace;font-size:12px;color:#94a3b8">
  <span>n =</span>
  <input id="sl" type="range" min="2" max="80" value="20" style="flex:1;accent-color:#38bdf8">
  <span id="nval" style="min-width:28px;color:#e2e8f0;font-weight:bold">20</span>
</div>
<div id="legend" style="display:flex;flex-wrap:wrap;gap:6px 14px;padding:6px 4px;font-family:monospace;font-size:11px"></div>`,
                css: `body{margin:0;padding:10px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const slider = document.getElementById('sl');
const nval   = document.getElementById('nval');
const legend = document.getElementById('legend');
const ctx = canvas.getContext('2d');

const PR = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

const PAD = { top: 20, right: 24, bottom: 36, left: 54 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top  - PAD.bottom;

const classes = [
  { label: 'O(1)',      color: '#4ade80', fn: n => 1 },
  { label: 'O(log n)', color: '#38bdf8', fn: n => Math.log2(n) },
  { label: 'O(n)',      color: '#fbbf24', fn: n => n },
  { label: 'O(n log n)',color: '#fb923c', fn: n => n * Math.log2(n) },
  { label: 'O(n²)',     color: '#f87171', fn: n => n * n },
  { label: 'O(2ⁿ)',     color: '#c084fc', fn: n => Math.pow(2, n) },
];

// Build legend once
legend.innerHTML = classes.map(c =>
  \`<span style="color:\${c.color}">■ \${c.label}</span>\`
).join('');

function draw(N) {
  ctx.clearRect(0, 0, W, H);

  // Clamp to visible range — O(2ⁿ) goes to infinity fast
  const maxY = classes
    .map(c => { try { return c.fn(N); } catch { return 0; } })
    .filter(v => isFinite(v) && v < 1e12)
    .reduce((a, b) => Math.max(a, b), 1);

  const scaleX = n => PAD.left + (n / N) * PW;
  const scaleY = v => PAD.top + PH - Math.min(v / maxY, 1) * PH;

  // Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const y = PAD.top + (i / 4) * PH;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + PW, y); ctx.stroke();
    const label = ((1 - i / 4) * maxY);
    ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
    ctx.fillText(label < 1000 ? label.toFixed(0) : label.toExponential(1), PAD.left - 4, y + 3);
  }
  for (let i = 0; i <= 4; i++) {
    const x = PAD.left + (i / 4) * PW;
    ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + PH); ctx.stroke();
    ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillText(Math.round(N * i / 4), x, PAD.top + PH + 14);
  }

  // Axes
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + PH);
  ctx.lineTo(PAD.left + PW, PAD.top + PH);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('n (input size)', PAD.left + PW / 2, H - 4);
  ctx.save(); ctx.translate(10, PAD.top + PH / 2); ctx.rotate(-Math.PI/2);
  ctx.fillText('operations', 0, 0); ctx.restore();

  // Curves
  const steps = Math.min(N, 300);
  classes.forEach(cls => {
    ctx.beginPath();
    ctx.strokeStyle = cls.color;
    ctx.lineWidth   = 2;
    ctx.setLineDash([]);
    let started = false;
    for (let i = 1; i <= steps; i++) {
      const n = (i / steps) * N;
      let v;
      try { v = cls.fn(n); } catch { continue; }
      if (!isFinite(v) || v > maxY * 1.05) continue;
      const x = scaleX(n), y = scaleY(v);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Value label at n
    let vN;
    try { vN = cls.fn(N); } catch { return; }
    if (isFinite(vN) && vN <= maxY * 1.05) {
      const lx = scaleX(N) + 4;
      const ly = scaleY(vN);
      ctx.fillStyle = cls.color;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(vN < 1000 ? vN.toFixed(0) : vN.toExponential(1), lx, ly + 3);
    }
  });
}

slider.addEventListener('input', () => {
  const n = parseInt(slider.value);
  nval.textContent = n;
  draw(n);
});
draw(20);
`,
                outputHeight: 430,
              },

              // ── Cell 2: Step Counter ──────────────────────────────────────────
              {
                type: 'js',
                title: 'Step Counter: Seeing O(n) vs O(n²)',
                instruction: 'Drag **n** and watch the operation bars grow. The O(n) bar grows calmly. The O(n²) bar explodes.\n\nEach colored block represents one *primitive operation* (a comparison, an addition). This is what Big-O is literally counting.',
                html: `<div style="font-family:monospace;font-size:12px;color:#94a3b8;padding:4px 0 8px">
  n = <input id="sl" type="range" min="1" max="30" value="5" style="width:180px;accent-color:#38bdf8;vertical-align:middle">
  <span id="nv" style="color:#e2e8f0;font-weight:bold">5</span>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
  <div>
    <div style="color:#4ade80;font-size:12px;font-weight:bold;margin-bottom:6px">O(n) — one loop</div>
    <pre style="color:#94a3b8;font-size:11px;line-height:1.6;background:#1e293b;padding:10px;border-radius:6px;margin:0 0 8px">for i in range(n):
    do_work()    # ← 1 op</pre>
    <div id="linear-bar" style="height:24px;background:#064e3b;border-radius:4px;position:relative;overflow:hidden;min-width:4px">
      <div id="lbar" style="height:100%;background:#4ade80;transition:width .2s;min-width:2px"></div>
    </div>
    <div id="linear-count" style="font-size:12px;color:#4ade80;margin-top:4px;font-family:monospace"></div>
  </div>
  <div>
    <div style="color:#f87171;font-size:12px;font-weight:bold;margin-bottom:6px">O(n²) — nested loops</div>
    <pre style="color:#94a3b8;font-size:11px;line-height:1.6;background:#1e293b;padding:10px;border-radius:6px;margin:0 0 8px">for i in range(n):
  for j in range(n):
    do_work()  # ← 1 op</pre>
    <div id="quad-bar" style="height:24px;background:#450a0a;border-radius:4px;position:relative;overflow:hidden;min-width:4px">
      <div id="qbar" style="height:100%;background:#f87171;transition:width .2s;min-width:2px"></div>
    </div>
    <div id="quad-count" style="font-size:12px;color:#f87171;margin-top:4px;font-family:monospace"></div>
  </div>
</div>
<div id="ratio" style="margin-top:10px;padding:8px 10px;background:#1e293b;border-radius:6px;font-family:monospace;font-size:12px;color:#94a3b8"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const sl = document.getElementById('sl');
const nv = document.getElementById('nv');
const lbar  = document.getElementById('lbar');
const qbar  = document.getElementById('qbar');
const lcnt  = document.getElementById('linear-count');
const qcnt  = document.getElementById('quad-count');
const ratio = document.getElementById('ratio');

function update() {
  const n = parseInt(sl.value);
  nv.textContent = n;
  const lin = n, quad = n * n;
  const maxW = 100; // percentage
  const pct = (v) => Math.min(v / quad * 100, 100) + '%';

  lbar.style.width = pct(lin);
  qbar.style.width = '100%'; // quad is always max

  lcnt.textContent = \`\${lin} operations (n = \${n})\`;
  qcnt.textContent = \`\${quad} operations (n² = \${n}×\${n})\`;

  const r = (quad / lin).toFixed(1);
  let insight = '';
  if (n <= 5) insight = 'At small n, the gap feels manageable.';
  else if (n <= 15) insight = 'The gap is becoming significant.';
  else insight = 'O(n²) now costs \${n}× more than O(n) — and it keeps growing.';

  ratio.innerHTML =
    \`n=\${n}: O(n)=\${lin} ops vs O(n²)=\${quad} ops &nbsp;→&nbsp; \` +
    \`<span style="color:#fbbf24">O(n²) is \${r}× more expensive</span><br>\` +
    \`<span style="color:#64748b">\${insight.replace('\${n}', n)}</span>\`;
}

sl.addEventListener('input', update);
update();
`,
                outputHeight: 330,
              },

              // ── Cell 3: Python code timing (JS simulation) ────────────────────
              {
                type: 'js',
                title: 'Race: O(n) vs O(n²) — Simulated Timing',
                instruction: 'This simulates what you\'d measure with `time.time()` in Python or `performance.now()` in JavaScript.\n\nPick an input size and click **Race**. The bar fills in real time — each pixel represents 10 ms of simulated work. Notice when O(n²) stops being "fast enough."',
                html: `<div style="font-family:monospace;font-size:12px;color:#94a3b8;margin-bottom:10px">Input size n:</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px" id="btns"></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
  <div>
    <div style="color:#4ade80;font-size:12px;font-weight:bold;margin-bottom:4px">O(n) algorithm</div>
    <div style="background:#064e3b;border-radius:6px;height:20px;overflow:hidden">
      <div id="lb" style="height:100%;background:#4ade80;width:0%;transition:none"></div>
    </div>
    <div id="lt" style="font-family:monospace;font-size:11px;color:#4ade80;margin-top:4px">—</div>
  </div>
  <div>
    <div style="color:#f87171;font-size:12px;font-weight:bold;margin-bottom:4px">O(n²) algorithm</div>
    <div style="background:#450a0a;border-radius:6px;height:20px;overflow:hidden">
      <div id="qb" style="height:100%;background:#f87171;width:0%;transition:none"></div>
    </div>
    <div id="qt" style="font-family:monospace;font-size:11px;color:#f87171;margin-top:4px">—</div>
  </div>
</div>
<div id="verdict" style="margin-top:12px;padding:8px 12px;background:#1e293b;border-radius:6px;font-family:monospace;font-size:12px;color:#94a3b8;min-height:36px"></div>`,
                css: `body{margin:0;padding:12px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const sizes = [100, 1000, 5000, 10000, 50000, 100000];
const btns = document.getElementById('btns');
const lb = document.getElementById('lb'), lt = document.getElementById('lt');
const qb = document.getElementById('qb'), qt = document.getElementById('qt');
const verdict = document.getElementById('verdict');

// Simulated time: O(n) = n * 0.0001 ms, O(n²) = n² * 0.0000001 ms
function simTime(n, cls) {
  if (cls === 'linear') return n * 0.0001;
  return n * n * 0.0000001;
}
function fmt(ms) {
  if (ms < 1) return ms.toFixed(3) + ' ms';
  if (ms < 1000) return ms.toFixed(1) + ' ms';
  return (ms / 1000).toFixed(2) + ' s';
}

sizes.forEach(n => {
  const b = document.createElement('button');
  b.textContent = 'n=' + n.toLocaleString();
  b.style.cssText = 'padding:6px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;font-family:monospace;font-size:11px;cursor:pointer';
  b.addEventListener('click', () => race(n));
  btns.appendChild(b);
});

function race(n) {
  lb.style.width = '0%'; qb.style.width = '0%';
  lt.textContent = 'running…'; qt.textContent = 'running…';
  verdict.textContent = '';

  const tLin = simTime(n, 'linear');
  const tQuad = simTime(n, 'quad');
  const maxT = Math.max(tLin, tQuad);

  const dur = 1200; // ms of animation
  const start = performance.now();

  function tick() {
    const elapsed = performance.now() - start;
    const p = Math.min(elapsed / dur, 1);
    lb.style.width = Math.min((p * maxT / maxT) * 100, (tLin / maxT) * 100) + '%';
    qb.style.width = Math.min((p * maxT / maxT) * 100, (tQuad / maxT) * 100) + '%';
    lt.textContent = p >= tLin / maxT ? '✓ ' + fmt(tLin) : 'running…';
    qt.textContent = p >= tQuad / maxT ? (tQuad > 500 ? '✗ ' : '✓ ') + fmt(tQuad) : 'running…';
    if (p < 1) { requestAnimationFrame(tick); return; }

    lb.style.width = (tLin / maxT * 100) + '%';
    qb.style.width = '100%';
    lt.textContent = '✓ ' + fmt(tLin);
    qt.textContent = (tQuad > 500 ? '✗ ' : '✓ ') + fmt(tQuad);

    const ratio = (tQuad / tLin).toFixed(0);
    let msg = '';
    if (tQuad < 10) msg = 'Both fast. At this size the difference is invisible.';
    else if (tQuad < 200) msg = \`O(n²) is \${ratio}× slower — noticeable but tolerable.\`;
    else if (tQuad < 5000) msg = \`O(n²) is \${ratio}× slower — this is a problem.\`;
    else msg = \`O(n²) is \${ratio}× slower — this algorithm cannot be used at this scale.\`;

    verdict.innerHTML = \`n=\${n.toLocaleString()}: O(n)=\${fmt(tLin)} · O(n²)=\${fmt(tQuad)}<br><span style="color:#fbbf24">\${msg}</span>\`;
  }
  tick();
}
`,
                outputHeight: 280,
              },

              // ── Cell 4: Space Complexity ──────────────────────────────────────
              {
                type: 'js',
                title: 'Space Complexity: Memory Matters Too',
                instruction: 'Time is not the only cost. Memory (space) matters just as much — especially on memory-constrained systems or when processing huge datasets.\n\nCompare three sorting approaches by their **space** cost as n grows.',
                html: `<canvas id="c" width="680" height="260" style="display:block;width:100%;border-radius:8px"></canvas>
<div style="padding:6px 4px 0;display:flex;align-items:center;gap:10px;font-family:monospace;font-size:12px;color:#94a3b8">
  <span>n =</span>
  <input id="sl" type="range" min="10" max="1000" step="10" value="100" style="flex:1;accent-color:#38bdf8">
  <span id="nv" style="color:#e2e8f0;font-weight:bold;min-width:40px">100</span>
</div>`,
                css: `body{margin:0;padding:10px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const sl = document.getElementById('sl');
const nv = document.getElementById('nv');
const ctx = canvas.getContext('2d');

const PR = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

const algorithms = [
  { name: 'In-place sort',   space: n => 1,      label: 'O(1) space', color: '#4ade80', note: 'e.g. Heapsort' },
  { name: 'Merge sort',      space: n => n,      label: 'O(n) space', color: '#38bdf8', note: 'needs temp array' },
  { name: 'Naive recursion', space: n => n*n,    label: 'O(n²) space',color: '#f87171', note: 'some DP tables' },
];

function draw(N) {
  ctx.clearRect(0, 0, W, H);

  const PAD = { top: 16, right: 140, bottom: 36, left: 54 };
  const PW = W - PAD.left - PAD.right;
  const PH = H - PAD.top  - PAD.bottom;
  const maxY = algorithms.reduce((m,a) => Math.max(m, a.space(N)), 1);

  const sx = n => PAD.left + (n / N) * PW;
  const sy = v => PAD.top + PH - Math.min(v / maxY, 1) * PH;

  // Grid
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = PAD.top + i / 4 * PH;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + PW, y); ctx.stroke();
    const val = (1 - i/4) * maxY;
    ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
    ctx.fillText(val < 1000 ? val.toFixed(0) : (val/1000).toFixed(0)+'K', PAD.left - 4, y + 3);
  }

  // Curves
  const steps = 200;
  algorithms.forEach(alg => {
    ctx.beginPath(); ctx.strokeStyle = alg.color; ctx.lineWidth = 2.5;
    for (let i = 1; i <= steps; i++) {
      const n = i/steps * N;
      const v = alg.space(n);
      if (!isFinite(v)) continue;
      const x = sx(n), y = sy(Math.min(v, maxY));
      i === 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // End label
    let v = alg.space(N);
    if (isFinite(v)) {
      const y = sy(Math.min(v, maxY));
      ctx.fillStyle = alg.color; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
      ctx.fillText(\`\${alg.label} — \${alg.note}\`, PAD.left + PW + 6, y + 4);
    }
  });

  // Axes
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + PH);
  ctx.lineTo(PAD.left + PW, PAD.top + PH);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('n (input size)', PAD.left + PW/2, H - 4);
  ctx.save(); ctx.translate(10, PAD.top + PH/2); ctx.rotate(-Math.PI/2);
  ctx.fillText('extra memory (units)', 0, 0); ctx.restore();

  // Current n bar values
  ctx.textAlign = 'left'; ctx.font = '11px monospace';
  const bx = PAD.left + 8, by = PAD.top + 12;
  ctx.fillStyle = '#334155';
  ctx.fillRect(bx - 4, by - 12, 180, algorithms.length * 16 + 8);
  algorithms.forEach((alg, i) => {
    ctx.fillStyle = alg.color;
    const v = alg.space(N);
    ctx.fillText(\`n=\${N}: \${v < 1000 ? v : (v/1000).toFixed(1)+'K'} units\`, bx, by + i * 16);
  });
}

sl.addEventListener('input', () => { nv.textContent = sl.value; draw(parseInt(sl.value)); });
draw(100);
`,
                outputHeight: 310,
              },

              // ── Cell 5: Challenge — Identify Big-O ───────────────────────────
              {
                type: 'challenge',
                title: 'Read the Code: What is the Big-O?',
                instruction: `What is the time complexity of this JavaScript function?\n\n\`\`\`js\nfunction mystery(arr) {\n  let result = 0;\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] === arr[j]) result++;\n    }\n  }\n  return result;\n}\n\`\`\``,
                html: '',
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}`,
                startCode: '',
                options: [
                  { label: 'A', text: 'O(n) — one pass through the array.' },
                  { label: 'B', text: 'O(n log n) — divide and conquer pattern.' },
                  { label: 'C', text: 'O(n²) — two nested loops, each up to n.' },
                  { label: 'D', text: 'O(1) — result is just a counter.' },
                ],
                check: label => label === 'C',
                successMessage: '✓ Correct. The outer loop runs n times. The inner loop runs n-1, n-2, … 1 times. Total: n(n-1)/2 comparisons = O(n²). The variable `result` being a single counter does not affect time complexity.',
                failMessage: '✗ Count the loops. The outer loop is 0..n. For each i, the inner loop runs from i+1 to n. Total comparisons: n(n-1)/2 — which is O(n²).',
              },

              // ── Cell 6: Challenge — Log time ─────────────────────────────────
              {
                type: 'challenge',
                title: 'Binary Search Complexity',
                instruction: `Binary search on a sorted array of 1,000,000 elements takes at most **how many comparisons** in the worst case?\n\n(Hint: each step cuts the remaining search space in half.)`,
                html: '',
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}`,
                startCode: '',
                options: [
                  { label: 'A', text: '1,000,000 — you might have to check every element.' },
                  { label: 'B', text: '1,000 — square root of n.' },
                  { label: 'C', text: '20 — log₂(1,000,000) ≈ 20.' },
                  { label: 'D', text: '500,000 — half the array on average.' },
                ],
                check: label => label === 'C',
                successMessage: '✓ log₂(1,000,000) ≈ 19.9, so at most 20 comparisons. This is the power of O(log n): doubling the input adds only ONE more step. Going from 1M to 1B items adds just 10 more comparisons.',
                failMessage: '✗ Binary search is O(log n). Each comparison eliminates half the remaining candidates. log₂(1,000,000) ≈ 20. This is why sorted data + binary search is such a powerful combination.',
              },

            ],
          },
        },
      },

      // ── Python Notebook — real timing measurements ──────────────────────────
      {
        id: 'PythonNotebook',
        title: 'Python Lab: Measure Complexity with Real Timing',
        caption: 'Run each cell to see Big-O complexity reflected in actual execution time. Then use the opencalc Figure to plot the growth curves from real data.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Setup: time.time() benchmark tool',
              prose: [
                'We need a way to measure how long an algorithm takes for different input sizes.',
                'The function `bench(fn, sizes, trials)` runs `fn` on each size `trials` times and returns the average time per call.',
                'Run this cell first — the other cells depend on it.',
              ],
              instructions: 'Run this cell to define the benchmarking helper.',
              code: `import time
import random

def bench(fn, sizes, trials=3):
    """Return list of (n, avg_seconds) for each size."""
    results = []
    for n in sizes:
        data = list(range(n))
        random.shuffle(data)
        total = 0
        for _ in range(trials):
            start = time.perf_counter()
            fn(data[:])   # pass a copy so the fn can mutate it
            total += time.perf_counter() - start
        results.append((n, total / trials))
    return results

print("bench() defined. Ready to measure algorithms.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'O(n) vs O(n²): Selection sort vs linear scan',
              prose: [
                '`linear_max(arr)` scans once for the maximum — **O(n)**.',
                '`selection_sort(arr)` uses a nested loop to find successive minima — **O(n²)**.',
                'We measure both at n = 500, 1000, 2000, 4000.',
              ],
              instructions: 'Run cell 1 first, then run this. Watch how selection_sort\'s time grows much faster.',
              code: `def linear_max(arr):
    """Find maximum — O(n)"""
    m = arr[0]
    for x in arr:
        if x > m:
            m = x
    return m

def selection_sort(arr):
    """Sort by finding successive minima — O(n²)"""
    for i in range(len(arr)):
        min_idx = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

SIZES = [500, 1000, 2000, 4000]

lin_times  = bench(linear_max,    SIZES)
quad_times = bench(selection_sort, SIZES)

print(f"{'n':>6}  {'O(n) ms':>10}  {'O(n²) ms':>12}  {'ratio':>8}")
print("-" * 44)
for (n, lt), (_, qt) in zip(lin_times, quad_times):
    ratio = qt / lt if lt > 0 else float('inf')
    print(f"{n:>6}  {lt*1000:>10.3f}  {qt*1000:>12.3f}  {ratio:>8.1f}×")

print("\\nNote: ratio should roughly equal n (O(n²)/O(n) = n).")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Plot: Timing curves from real data',
              prose: [
                'Plot the measured times from cell 2 to see the shape of each curve.',
                'The O(n) line should be nearly flat. The O(n²) line should curve upward.',
              ],
              instructions: 'Run after cell 2. Uses the opencalc Figure library to render the chart.',
              code: `from opencalc import Figure

fig = Figure(
    xmin=0, xmax=4500,
    ymin=0, ymax=max(qt * 1000 for _, qt in quad_times) * 1.15,
    title='Measured Time vs Input Size',
    width=560, height=300
)
fig.axes(labels=True, ticks=True)
fig.grid(step=1000)

# Plot linear
fig.scatter(
    xs=[n for n, _ in lin_times],
    ys=[t * 1000 for _, t in lin_times],
    color='green', radius=5, labels=[f"{t*1000:.2f}ms" for _, t in lin_times]
)
for i in range(len(lin_times) - 1):
    x0, y0 = lin_times[i][0],  lin_times[i][1]  * 1000
    x1, y1 = lin_times[i+1][0], lin_times[i+1][1] * 1000
    fig.line([x0, y0], [x1, y1], color='green', width=2.5)

# Plot quadratic
fig.scatter(
    xs=[n for n, _ in quad_times],
    ys=[t * 1000 for _, t in quad_times],
    color='red', radius=5, labels=[f"{t*1000:.1f}ms" for _, t in quad_times]
)
for i in range(len(quad_times) - 1):
    x0, y0 = quad_times[i][0],  quad_times[i][1]  * 1000
    x1, y1 = quad_times[i+1][0], quad_times[i+1][1] * 1000
    fig.line([x0, y0], [x1, y1], color='red', width=2.5)

# Legend annotations
ymax = max(qt * 1000 for _, qt in quad_times)
fig.point([4000, quad_times[-1][1]*1000], color='red', label='O(n²) sort', radius=0)
fig.point([4000, lin_times[-1][1]*1000],  color='green', label='O(n) scan', radius=0)

print(fig.show())`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Space complexity: sys.getsizeof()',
              prose: [
                'Python\'s `sys.getsizeof()` measures the memory footprint of an object in bytes.',
                'Compare three approaches to storing n items:',
                '- A single number (O(1) space)',
                '- A flat list of n items (O(n) space)',
                '- A list of n lists of n items — an n×n matrix (O(n²) space)',
              ],
              instructions: 'Run this to see concrete memory numbers for each complexity class.',
              code: `import sys

def measure_space(n):
    # O(1): just a running total, no storage proportional to n
    o1 = 0
    mem_o1 = sys.getsizeof(o1)

    # O(n): store all n items
    o_n = list(range(n))
    mem_on = sys.getsizeof(o_n)

    # O(n²): n×n matrix
    o_n2 = [[0] * n for _ in range(n)]
    mem_on2 = sum(sys.getsizeof(row) for row in o_n2) + sys.getsizeof(o_n2)

    return mem_o1, mem_on, mem_on2

print(f"{'n':>6} | {'O(1) bytes':>12} | {'O(n) bytes':>12} | {'O(n²) bytes':>14}")
print("-" * 52)
for n in [10, 100, 1000, 10000]:
    m1, mn, mn2 = measure_space(n)
    print(f"{n:>6} | {m1:>12} | {mn:>12,} | {mn2:>14,}")`,
              output: '', status: 'idle', figureJson: null,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'Formally, f(n) = O(g(n)) if there exist positive constants c and n₀ such that 0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀. This is the "big-O upper bound."',
      'Three related notations: **Ω(g)** (omega, lower bound — at least this slow), **Θ(g)** (theta, tight bound — exactly this rate of growth), **O(g)** (upper bound — at most this slow). When people say "binary search is O(log n)," they usually mean Θ(log n).',
      'To find the Big-O of a loop-based algorithm: identify the innermost operation, count how many times it executes as a function of n, drop constants and lower-order terms.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Big-O Simplification Rules',
        body: '1. Drop constants: O(3n) = O(n)\n2. Drop lower-order terms: O(n² + n) = O(n²)\n3. Keep the dominant term: O(n³ + n² log n) = O(n³)\n4. Sequential blocks add: O(n) + O(n²) = O(n²)\n5. Nested blocks multiply: O(n) × O(n) = O(n²)',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The formal definition of Big-O uses existential quantifiers: ∃c > 0, ∃n₀ > 0 such that ∀n ≥ n₀, f(n) ≤ c·g(n). This means Big-O makes no claim about small inputs — only about behavior as n → ∞.',
      'Amortized analysis rigorously: if a sequence of n operations has total cost T(n), the amortized cost per operation is T(n)/n. For dynamic arrays, n push operations cost at most 3n total (1 for each push + at most 2n for all the copies during resizing), so amortized O(1) per push.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'O(n log n) is optimal for comparison-based sorting',
        body: 'Any algorithm that sorts by comparing elements must make at least Ω(n log n) comparisons in the worst case. Proof: there are n! possible orderings of n items. Each comparison eliminates half the remaining possibilities. To distinguish n! cases, you need at least log₂(n!) comparisons. By Stirling\'s approximation, log₂(n!) = Θ(n log n).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      title: 'JavaScript: Count operations precisely',
      description: 'Instrument an algorithm to count actual primitive operations.',
      language: 'javascript',
      code: `// Instrument two algorithms to count exact operations
function countOpsLinear(arr) {
  let ops = 0;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    ops++;               // count the comparison
    if (arr[i] > max) max = arr[i];
  }
  return { result: max, ops };
}

function countOpsQuadratic(arr) {
  let ops = 0;
  let hasDuplicate = false;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      ops++;             // count each inner comparison
      if (arr[i] === arr[j]) hasDuplicate = true;
    }
  }
  return { result: hasDuplicate, ops };
}

for (const n of [5, 10, 20, 50]) {
  const arr = Array.from({length: n}, (_, i) => i);
  const lin = countOpsLinear(arr);
  const quad = countOpsQuadratic(arr);
  console.log(\`n=\${n}: linear=\${lin.ops} ops, quadratic=\${quad.ops} ops, ratio=\${(quad.ops/lin.ops).toFixed(1)}x\`);
}`,
    },
    {
      title: 'Python: Memoization turns O(2ⁿ) into O(n)',
      description: 'The naive Fibonacci is exponential. Memoization makes it linear.',
      language: 'python',
      code: `import time

# Naive recursive Fibonacci — O(2^n)
def fib_naive(n):
    if n <= 1: return n
    return fib_naive(n-1) + fib_naive(n-2)

# Memoized Fibonacci — O(n)
def fib_memo(n, cache={}):
    if n in cache: return cache[n]
    if n <= 1: return n
    cache[n] = fib_memo(n-1) + fib_memo(n-2)
    return cache[n]

# Compare timing
for n in [10, 20, 30]:
    t0 = time.perf_counter()
    r = fib_naive(n)
    t_naive = time.perf_counter() - t0

    t0 = time.perf_counter()
    r = fib_memo(n)
    t_memo = time.perf_counter() - t0

    speedup = t_naive / t_memo if t_memo > 0 else float('inf')
    print(f"fib({n}): naive={t_naive*1000:.3f}ms  memo={t_memo*1000:.6f}ms  speedup={speedup:.0f}x")`,
    },
  ],

  challenges: [
    {
      id: 'dsa0-002-c1',
      title: 'Find the Complexity',
      difficulty: 'easy',
      description: 'What is the time complexity of the function below? Justify your answer by counting loop iterations.\n\n```python\ndef mystery(n):\n    total = 0\n    i = n\n    while i > 1:\n        total += i\n        i = i // 2\n    return total\n```',
      starterCode: `# What is the time complexity? Write your answer and justify it.
# Think: how many times does the while loop execute?
# Each iteration: i = i // 2 (integer division by 2)
# How many times can you halve n before reaching 1?

answer = "O(???)"
justification = "Because..."
print(answer, justification)`,
      solution: `# O(log n) — The loop halves i each iteration.
# Starting from n, the sequence is: n, n/2, n/4, ..., 1
# Number of steps = log₂(n)
# This is the signature of O(log n): repeated halving.

answer = "O(log n)"
justification = "Each iteration halves i. Starting at n, we reach 1 in log₂(n) steps."
print(answer, justification)`,
      hint: 'How many times can you divide n by 2 before reaching 1? That is log₂(n).',
    },
    {
      id: 'dsa0-002-c2',
      title: 'Optimize the Duplicate Check',
      difficulty: 'medium',
      description: 'The naive duplicate-check is O(n²). Use a Set to bring it down to O(n). Implement `has_duplicate_fast(arr)` that returns True if any value appears more than once.',
      starterCode: `# Naive O(n²) version for reference:
def has_duplicate_slow(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True
    return False

# Your O(n) version:
def has_duplicate_fast(arr):
    # Use a set. Sets have O(1) average lookup and insertion.
    pass

# Tests
print(has_duplicate_fast([1, 2, 3, 4]))     # False
print(has_duplicate_fast([1, 2, 3, 1]))     # True
print(has_duplicate_fast([]))               # False`,
      solution: `def has_duplicate_fast(arr):
    seen = set()
    for x in arr:
        if x in seen:   # O(1) set lookup
            return True
        seen.add(x)     # O(1) set insert
    return False
# One pass through the array: O(n) time, O(n) space (for the set).`,
      hint: 'A Python set supports O(1) average-case lookup with `x in s`. Add each element to the set as you encounter it. If you see an element that is already in the set, you found a duplicate.',
    },
  ],
};
