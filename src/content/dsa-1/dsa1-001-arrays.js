export default {
  id: 'dsa1-001',
  slug: 'arrays',
  chapter: 'dsa1',
  order: 1,
  title: 'Arrays',
  subtitle: 'The simplest data structure — and the one every other structure is built on. Contiguous memory, O(1) access, and the surprisingly clever trick that makes dynamic arrays work.',
  tags: ['arrays', 'dynamic array', 'contiguous memory', 'index', 'amortized', 'cache locality', 'random access'],
  aliases: 'array dynamic array list random access contiguous memory index amortized append push',

  hook: {
    question: 'An array with 1,000 elements and an array with 1,000,000,000 elements both give you any element in the exact same number of steps. How?',
    realWorldContext: 'NumPy, the backbone of all scientific computing in Python, is fundamentally a large contiguous block of memory with arithmetic wrapped around it. When a machine learning model multiplies two 10,000×10,000 matrices, it is doing billions of array accesses. The reason GPUs are fast at this isn\'t exotic hardware — it\'s that GPUs are massively parallel array processors optimized for exactly this access pattern: sequential, predictable, contiguous memory reads. Understanding why arrays are fast is understanding why modern computing is fast.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You have a mental model of memory (Lesson 1) and a way to measure cost (Lesson 2). Arrays are the first data structure — the one that directly exposes what memory is. Every other structure — linked lists, stacks, queues, hash tables, trees — is either built on arrays or is trying to solve a problem that arrays cannot.',
      '**Why O(1) access?** An array is a contiguous block of memory where every element takes the same number of bytes. Given a base address B and element size S, the address of element i is exactly B + i × S. Two arithmetic operations — one multiplication, one addition — regardless of array size. The CPU computes this address in a single instruction. There is no scanning, no chasing pointers. This is called *random access*, and it is the defining superpower of the array.',
      '**The cost of insertion and deletion.** The O(1) guarantee depends on contiguity. If you insert an element in the middle, you must shift every element after it one position right to maintain contiguity. That\'s O(n) work. Delete from the middle: shift everything left. O(n). Append to the end: no shifting needed — O(1). This cost profile determines when to use arrays and when to reach for something else.',
      '**Dynamic arrays: the doubling trick.** A fixed-size array is simple but inflexible. A dynamic array (Python list, JavaScript Array) starts small and grows on demand. When it is full and you append, it allocates a new array of *double* the current capacity, copies everything over, then adds the new element. Doubling sounds expensive — but amortized over many appends, each element is copied at most twice total, making the average cost per append O(1). This is called amortized analysis, and it is one of the most elegant ideas in computer science.',
      '**Cache locality.** Modern CPUs do not fetch one byte at a time from RAM — they fetch 64-byte cache lines. When you access arr[0], the CPU automatically loads arr[0] through arr[15] (for 4-byte integers) into L1 cache. Accessing arr[1] next is nearly instantaneous — it is already in cache. This is *spatial locality*, and arrays exploit it perfectly. Linked lists, by contrast, scatter elements across memory — each access is a cache miss. In practice, arrays beat linked lists even for operations where theory says they should be equal.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of Linear Structures',
        body: '**Previous:** Algorithmic Thinking — decomposition, contracts, invariants.\n**This lesson:** Arrays — contiguous memory, O(1) access, dynamic growth.\n**Next:** Linked Lists — the tradeoff: O(1) insert anywhere, O(n) access.',
      },
      {
        type: 'insight',
        title: 'Python list vs JavaScript Array',
        body: 'Both are dynamic arrays under the hood — not fixed-size arrays. Python\'s list uses a doubling strategy with a growth factor of roughly 1.125× after the initial doublings. JavaScript\'s Array is more complex — engines like V8 use different internal representations (SMI arrays, packed arrays, holey arrays) and switch between them based on usage. Both give amortized O(1) append.',
      },
      {
        type: 'warning',
        title: 'Insert at index 0 is the worst case',
        body: 'arr.insert(0, x) in Python (or arr.unshift(x) in JS) shifts every single element one position right — O(n). This trips up beginners who assume "lists are fast." If you frequently insert at the front, you want a deque (double-ended queue), not a list.',
      },
      {
        type: 'insight',
        title: 'The amortized O(1) proof in one sentence',
        body: 'Each element is copied at most log₂(n) times total across all resize operations, but spread over n appends, the amortized cost per element is O(1). More precisely: n appends cost at most 3n total operations (n pushes + at most 2n copies), so O(1) amortized.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Arrays — Memory Layout to Dynamic Growth',
        mathBridge: 'Each cell is hands-on. You will see why O(1) access works at the hardware level, animate every shift during an insertion, step through the doubling growth strategy, and then build a dynamic array from scratch in Python.',
        caption: 'Work through every cell. The Python notebook at the end has you building the real implementation.',
        props: {
          lesson: {
            title: 'Arrays: From Memory Cells to Dynamic Growth',
            subtitle: 'Touch the memory. Count the steps. Build the structure.',
            sequential: true,
            cells: [

              // ── Cell 1: Memory Layout ─────────────────────────────────────────
              {
                type: 'js',
                title: 'Memory Layout — Why arr[i] is O(1)',
                instruction: 'Click any cell to see how its address is computed.\n\nChange the **base address** and **element size** — watch the addresses update instantly. The formula never changes: `address = base + i × size`. Two operations. Always.',
                html: `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:10px;font-family:monospace;font-size:12px;align-items:center">
  <label style="color:#64748b">Base: <input id="base" type="number" value="1000" min="0" max="9999" style="width:60px;padding:4px 6px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:12px"></label>
  <label style="color:#64748b">Element size (bytes): <select id="esize" style="padding:4px 6px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:12px">
    <option value="1">1 (char/bool)</option>
    <option value="2">2 (int16)</option>
    <option value="4" selected>4 (int32/float)</option>
    <option value="8">8 (int64/double)</option>
  </select></label>
</div>
<canvas id="c" width="660" height="200" style="display:block;width:100%;border-radius:8px;margin-bottom:8px"></canvas>
<div id="formula" style="background:#1e293b;border:1.5px solid #38bdf8;border-radius:8px;padding:10px;font-family:monospace;font-size:13px;color:#94a3b8;min-height:44px"></div>`,
                css: `body{margin:0;padding:10px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const PR     = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

const VALUES = [42, 7, 99, 13, 55, 28, 81, 6, 71, 34, 17, 60];
const N = VALUES.length;

let selected = -1;
let base = 1000, esize = 4;

const cellW = Math.floor((W - 20) / N);
const cellH = 80;
const cellY = (H - cellH) / 2;
const startX = (W - cellW * N) / 2;

function getBase()  { return parseInt(document.getElementById('base').value)  || 1000; }
function getEsize() { return parseInt(document.getElementById('esize').value) || 4; }

function draw() {
  base  = getBase();
  esize = getEsize();
  ctx.clearRect(0, 0, W, H);

  VALUES.forEach((val, i) => {
    const x   = startX + i * cellW;
    const sel = i === selected;
    const addr = base + i * esize;

    // Cell body
    ctx.fillStyle   = sel ? '#1e1b4b' : '#1e293b';
    ctx.strokeStyle = sel ? '#818cf8' : '#334155';
    ctx.lineWidth   = sel ? 2.5 : 1.5;
    ctx.beginPath(); ctx.roundRect(x + 2, cellY, cellW - 4, cellH, 5);
    ctx.fill(); ctx.stroke();

    // Value
    ctx.fillStyle = sel ? '#a5b4fc' : '#94a3b8';
    ctx.font      = \`\${sel ? 'bold ' : ''}15px monospace\`;
    ctx.textAlign = 'center';
    ctx.fillText(val, x + cellW / 2, cellY + cellH / 2 + 5);

    // Index label below
    ctx.fillStyle = '#475569'; ctx.font = '9px monospace';
    ctx.fillText(\`[\${i}]\`, x + cellW / 2, cellY + cellH + 13);

    // Address label above
    ctx.fillStyle = sel ? '#818cf8' : '#334155';
    ctx.font = '8px monospace';
    ctx.fillText(addr, x + cellW / 2, cellY - 5);
  });

  // Base pointer arrow
  const bx = startX + cellW / 2;
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bx, cellY - 18); ctx.lineTo(bx, cellY + 2); ctx.stroke();
  ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
  ctx.fillText('base', bx, cellY - 22);

  // Formula panel
  const formula = document.getElementById('formula');
  if (selected >= 0) {
    const addr = base + selected * esize;
    formula.innerHTML =
      \`<span style="color:#818cf8">arr[\${selected}]</span> &nbsp;→&nbsp; \` +
      \`<span style="color:#fbbf24">base</span> + <span style="color:#818cf8">i</span> × <span style="color:#4ade80">size</span> &nbsp;=&nbsp; \` +
      \`<span style="color:#fbbf24">\${base}</span> + <span style="color:#818cf8">\${selected}</span> × <span style="color:#4ade80">\${esize}</span> &nbsp;=&nbsp; \` +
      \`<span style="color:#38bdf8;font-weight:bold">address \${addr}</span> &nbsp;&nbsp;\` +
      \`<span style="color:#475569;font-size:10px">(2 operations, same cost for any i)</span>\`;
  } else {
    formula.innerHTML = \`<span style="color:#475569">← Click any cell to see its address formula</span>\`;
  }
}

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const mx   = (e.clientX - rect.left);
  const idx  = Math.floor((mx - startX) / cellW);
  selected   = (idx >= 0 && idx < N) ? idx : -1;
  draw();
});

document.getElementById('base').addEventListener('input',  draw);
document.getElementById('esize').addEventListener('change', draw);
draw();
`,
                outputHeight: 310,
              },

              // ── Cell 2: Insert / Delete — shifting visualized ─────────────────
              {
                type: 'js',
                title: 'Insertion & Deletion — Count the Shifts',
                instruction: 'Choose an operation and an index, then click **Execute**.\n\nEvery shift is an individual O(1) memory write. Count them. Notice that inserting near the start is the worst case — and inserting at the end costs zero shifts.',
                html: `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;font-family:monospace;font-size:12px;align-items:center">
  <select id="op" style="padding:6px 8px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:12px">
    <option value="insert">Insert value 99</option>
    <option value="delete">Delete element</option>
  </select>
  <label style="color:#64748b">at index <input id="idx" type="number" value="2" min="0" max="7" style="width:44px;padding:4px 6px;border-radius:5px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:12px"></label>
  <button id="exec" style="padding:7px 16px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Execute →</button>
  <button id="rst"  style="padding:7px 16px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
</div>
<canvas id="c" width="660" height="180" style="display:block;width:100%;border-radius:8px;margin-bottom:8px"></canvas>
<div id="log" style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:8px;font-family:monospace;font-size:11px;color:#94a3b8;min-height:44px;max-height:80px;overflow-y:auto"></div>`,
                css: `body{margin:0;padding:10px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const PR     = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

const ORIG = [10, 25, 38, 47, 62, 71, 85, 93];
let arr = ORIG.slice();
let highlights = {}; // index → color override
let logLines = [];

const cellW = Math.floor((W - 20) / 10); // room for max 10 elements
const cellH = 70;
const cellY = (H - cellH) / 2;
const startX = 10;

function drawArr(arr, hl = {}) {
  ctx.clearRect(0, 0, W, H);
  arr.forEach((val, i) => {
    const x   = startX + i * cellW;
    const clr = hl[i] || null;
    ctx.fillStyle   = clr ? '#1a1040' : '#1e293b';
    ctx.strokeStyle = clr || '#334155';
    ctx.lineWidth   = clr ? 2.5 : 1.5;
    ctx.beginPath(); ctx.roundRect(x + 2, cellY, cellW - 4, cellH, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = clr || '#94a3b8';
    ctx.font      = \`\${clr ? 'bold ' : ''}15px monospace\`;
    ctx.textAlign = 'center';
    ctx.fillText(val, x + cellW / 2, cellY + cellH / 2 + 5);
    ctx.fillStyle = '#475569'; ctx.font = '9px monospace';
    ctx.fillText(\`[\${i}]\`, x + cellW / 2, cellY + cellH + 13);
  });
  // complexity label
  ctx.fillStyle = '#475569'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
  ctx.fillText(\`n = \${arr.length}\`, W - 60, 14);
}

function addLog(msg) {
  logLines.push(msg);
  const el = document.getElementById('log');
  el.innerHTML = logLines.map((l, i) =>
    \`<div style="color:\${i === logLines.length-1 ? '#e2e8f0' : '#475569'}">\${l}</div>\`
  ).join('');
  el.scrollTop = el.scrollHeight;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runInsert(idx, val) {
  logLines = [];
  const steps = [];
  const a = arr.slice();
  a.push(0); // make room
  // Shift right from end down to idx+1
  for (let i = a.length - 1; i > idx; i--) {
    steps.push({ arr: a.slice(), hl: {[i]: '#f87171', [i-1]: '#fbbf24'}, msg: \`Shift a[\${i-1}]=\${a[i-1]} → a[\${i}]\` });
    a[i] = a[i - 1];
  }
  a[idx] = val;
  steps.push({ arr: a.slice(), hl: {[idx]: '#4ade80'}, msg: \`Write \${val} at a[\${idx}]. Done. \${a.length - 1} shifts.\` });

  addLog(\`INSERT \${val} at index \${idx}: need to shift \${arr.length - idx} element(s) right\`);
  for (const s of steps) {
    drawArr(s.arr, s.hl);
    addLog(s.msg);
    await sleep(420);
  }
  arr = a;
  drawArr(arr, {});
}

async function runDelete(idx) {
  logLines = [];
  const a = arr.slice();
  const deleted = a[idx];
  const shifts = a.length - idx - 1;
  const steps = [];
  for (let i = idx; i < a.length - 1; i++) {
    steps.push({ arr: a.slice(), hl: {[i]: '#fbbf24', [i+1]: '#38bdf8'}, msg: \`Shift a[\${i+1}]=\${a[i+1]} → a[\${i}]\` });
    a[i] = a[i + 1];
  }
  a.pop();
  steps.push({ arr: a.slice(), hl: {}, msg: \`Done. Removed \${deleted}. \${shifts} shifts.\` });

  addLog(\`DELETE a[\${idx}]=\${deleted}: need to shift \${shifts} element(s) left\`);
  for (const s of steps) {
    drawArr(s.arr, s.hl);
    addLog(s.msg);
    await sleep(420);
  }
  arr = a;
  drawArr(arr, {});
}

document.getElementById('exec').addEventListener('click', async () => {
  const op  = document.getElementById('op').value;
  const idx = Math.max(0, Math.min(parseInt(document.getElementById('idx').value) || 0, arr.length - (op === 'delete' ? 1 : 0)));
  if (op === 'insert') await runInsert(idx, 99);
  else await runDelete(idx);
});

document.getElementById('rst').addEventListener('click', () => {
  arr = ORIG.slice(); logLines = [];
  document.getElementById('log').innerHTML = 'Array reset.';
  drawArr(arr);
});

drawArr(arr);
document.getElementById('log').textContent = 'Set an operation and index, then click Execute.';
`,
                outputHeight: 340,
              },

              // ── Cell 3: Dynamic Array Growth ──────────────────────────────────
              {
                type: 'js',
                title: 'Dynamic Array Growth — The Doubling Trick',
                instruction: 'Click **Append** to add elements one by one. When the array is **full**, watch it double in capacity — old elements are copied to the new larger array.\n\nThe **total copies** counter tracks all copying work ever done. Compare it to the total number of appends.',
                html: `<canvas id="c" width="660" height="220" style="display:block;width:100%;border-radius:8px;margin-bottom:8px"></canvas>
<div style="display:flex;gap:8px;margin-bottom:8px">
  <button id="app" style="padding:8px 20px;border-radius:6px;border:none;background:#6d28d9;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">Append</button>
  <button id="rst" style="padding:8px 16px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#64748b;font-family:monospace;font-size:12px;cursor:pointer">Reset</button>
  <span id="stats" style="font-family:monospace;font-size:12px;color:#94a3b8;line-height:36px;margin-left:8px"></span>
</div>
<div id="event-log" style="background:#0f172a;border:1px solid #334155;border-radius:6px;padding:8px;font-family:monospace;font-size:11px;color:#94a3b8;min-height:36px;max-height:72px;overflow-y:auto"></div>`,
                css: `body{margin:0;padding:10px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const PR     = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

let data = [], cap = 2, totalCopies = 0, appends = 0, events = [];
let nextVal = 1;

function draw(flash = -1) {
  ctx.clearRect(0, 0, W, H);

  const maxCells = Math.max(cap, 1);
  const cellW = Math.min(Math.floor((W - 40) / maxCells), 52);
  const cellH = 52;
  const totalW = cellW * maxCells;
  const startX = (W - totalW) / 2;
  const cellY  = 40;

  // Title
  ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText(\`Internal buffer — capacity = \${cap}\`, W / 2, 18);

  // Capacity cells
  for (let i = 0; i < maxCells; i++) {
    const x   = startX + i * cellW;
    const has = i < data.length;
    const isFlash = i === flash;
    ctx.fillStyle   = isFlash ? '#14532d' : has ? '#1e293b' : '#0f1923';
    ctx.strokeStyle = isFlash ? '#4ade80' : has ? '#334155' : '#1a2535';
    ctx.lineWidth   = isFlash ? 2.5 : 1.5;
    ctx.beginPath(); ctx.roundRect(x + 2, cellY, cellW - 4, cellH, 5); ctx.fill(); ctx.stroke();
    if (has) {
      ctx.fillStyle = isFlash ? '#4ade80' : '#94a3b8';
      ctx.font = \`\${isFlash ? 'bold ' : ''}13px monospace\`;
      ctx.textAlign = 'center';
      ctx.fillText(data[i], x + cellW / 2, cellY + cellH / 2 + 5);
    }
    if (i < cap) {
      ctx.fillStyle = '#1e2d3d'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillText(i, x + cellW / 2, cellY + cellH + 12);
    }
  }

  // Size brace
  if (data.length > 0) {
    const bx = startX, ex = startX + data.length * cellW;
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx, cellY + cellH + 20); ctx.lineTo(ex, cellY + cellH + 20); ctx.stroke();
    ctx.fillStyle = '#38bdf8'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillText(\`size=\${data.length}\`, (bx + ex) / 2, cellY + cellH + 32);
  }

  // Capacity brace
  {
    const bx = startX, ex = startX + cap * cellW;
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(bx, cellY - 10); ctx.lineTo(ex, cellY - 10); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#a78bfa'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
    ctx.fillText(\`capacity=\${cap}\`, (bx + ex) / 2, cellY - 14);
  }

  // Stats
  const ratio = appends > 0 ? (totalCopies / appends).toFixed(2) : '—';
  document.getElementById('stats').innerHTML =
    \`Appends: <span style="color:#38bdf8">\${appends}</span> &nbsp;|&nbsp; \` +
    \`Total copies: <span style="color:#fbbf24">\${totalCopies}</span> &nbsp;|&nbsp; \` +
    \`Copies/append: <span style="color:\${parseFloat(ratio) > 2 ? '#f87171' : '#4ade80'}">\${ratio}</span>\`;
}

function addEvent(msg, color = '#94a3b8') {
  events.push(\`<span style="color:\${color}">\${msg}</span>\`);
  const el = document.getElementById('event-log');
  el.innerHTML = events.slice(-6).join('<br>');
  el.scrollTop = el.scrollHeight;
}

document.getElementById('app').addEventListener('click', async () => {
  if (data.length < cap) {
    data.push(nextVal++);
    appends++;
    addEvent(\`append(\${data[data.length-1]}): fits in buffer — O(1)\`, '#4ade80');
    draw(data.length - 1);
  } else {
    const oldCap = cap;
    const copies = data.length;
    cap *= 2;
    totalCopies += copies;
    appends++;
    addEvent(\`append(\${nextVal}): FULL! Resize \${oldCap} → \${cap} (copies \${copies} elements)\`, '#fbbf24');
    data.push(nextVal++);
    draw(-1);
    await new Promise(r => setTimeout(r, 60));
    draw(data.length - 1);
  }
});

document.getElementById('rst').addEventListener('click', () => {
  data = []; cap = 2; totalCopies = 0; appends = 0; events = []; nextVal = 1;
  document.getElementById('event-log').innerHTML = 'Click Append to start.';
  draw();
});

draw();
document.getElementById('event-log').textContent = 'Click Append to start. Watch what happens when the buffer fills up.';
`,
                outputHeight: 360,
              },

              // ── Cell 4: Amortized cost bar chart ─────────────────────────────
              {
                type: 'js',
                title: 'Amortized Cost — Per-Append Breakdown',
                instruction: 'This chart shows the **actual cost** of each append operation: 1 for a normal append, 1 + n for a resize (where n is the size at that moment).\n\nDrag to any append. See the spike on resize events. Then look at the **running average** — it converges toward a constant.',
                html: `<canvas id="c" width="660" height="260" style="display:block;width:100%;border-radius:8px;margin-bottom:6px"></canvas>
<div style="font-family:monospace;font-size:12px;color:#94a3b8;display:flex;gap:10px;align-items:center;padding:2px 0">
  <span>n =</span>
  <input id="sl" type="range" min="1" max="64" value="32" style="flex:1;accent-color:#38bdf8">
  <span id="nv" style="color:#e2e8f0;font-weight:bold;min-width:24px">32</span>
</div>`,
                css: `body{margin:0;padding:10px;background:#0f172a;box-sizing:border-box}`,
                startCode: `
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const PR     = devicePixelRatio;
canvas.width  = canvas.offsetWidth  * PR;
canvas.height = canvas.offsetHeight * PR;
ctx.scale(PR, PR);
const W = canvas.offsetWidth, H = canvas.offsetHeight;

function computeCosts(n) {
  const costs = [];
  let cap = 1;
  for (let i = 1; i <= n; i++) {
    if (i > cap) { costs.push(1 + cap); cap *= 2; }
    else costs.push(1);
  }
  return costs;
}

function draw(n) {
  const costs = computeCosts(n);
  const maxC  = Math.max(...costs);
  const PAD   = { top: 20, right: 20, bottom: 40, left: 50 };
  const PW = W - PAD.left - PAD.right;
  const PH = H - PAD.top  - PAD.bottom;
  const barW = Math.max(2, Math.floor(PW / n) - 1);

  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1].forEach(f => {
    const y = PAD.top + PH - f * PH;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + PW, y); ctx.stroke();
    ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(f * maxC), PAD.left - 4, y + 3);
  });

  // Bars
  costs.forEach((c, i) => {
    const x = PAD.left + i * (PW / n);
    const h = (c / maxC) * PH;
    const y = PAD.top + PH - h;
    ctx.fillStyle = c > 1 ? '#fbbf24' : '#4ade80';
    ctx.fillRect(x, y, barW, h);
  });

  // Running average line
  ctx.beginPath(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.setLineDash([4,3]);
  let sum = 0;
  costs.forEach((c, i) => {
    sum += c;
    const avg = sum / (i + 1);
    const x = PAD.left + i * (PW / n) + barW / 2;
    const y = PAD.top + PH - (avg / maxC) * PH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke(); ctx.setLineDash([]);

  // Axes
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + PH);
  ctx.lineTo(PAD.left + PW, PAD.top + PH);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('append # (1 to n)', PAD.left + PW / 2, H - 4);
  ctx.save(); ctx.translate(12, PAD.top + PH / 2); ctx.rotate(-Math.PI/2);
  ctx.fillText('cost of this append', 0, 0); ctx.restore();

  // Final avg label
  const finalAvg = (costs.reduce((a,b)=>a+b,0) / n).toFixed(2);
  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left';
  ctx.fillText(\`avg = \${finalAvg} ops/append\`, PAD.left + PW - 130, PAD.top + 14);

  // Legend
  [['\u2588 resize (spike)', '#fbbf24'],['\u2588 normal append', '#4ade80'],['--- running avg', '#38bdf8']].forEach(([l,c],i) => {
    ctx.fillStyle = c; ctx.font = '9px monospace';
    ctx.fillText(l, PAD.left + 2 + i * 160, PAD.top + 14);
  });
}

document.getElementById('sl').addEventListener('input', e => {
  const n = parseInt(e.target.value);
  document.getElementById('nv').textContent = n;
  draw(n);
});
draw(32);
`,
                outputHeight: 310,
              },

              // ── Cell 5: Challenge ────────────────────────────────────────────
              {
                type: 'challenge',
                title: 'Address Calculation',
                instruction: 'An array of 32-bit integers (4 bytes each) starts at memory address **2048**.\n\nWhat is the memory address of `arr[6]`?',
                html: '',
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}`,
                startCode: '',
                options: [
                  { label: 'A', text: '2054 — base + index = 2048 + 6.' },
                  { label: 'B', text: '2072 — base + (index × size) = 2048 + 6×4.' },
                  { label: 'C', text: '2056 — base + (index × size + 2).' },
                  { label: 'D', text: '2064 — base + index × (size−1).' },
                ],
                check: label => label === 'B',
                successMessage: '✓ address = base + i × element_size = 2048 + 6 × 4 = 2048 + 24 = 2072. This formula is why O(1) access works — the CPU calculates 2072 directly without touching any other array element.',
                failMessage: '✗ The formula is: address = base + i × element_size. Each 32-bit int takes 4 bytes, so arr[6] is at 2048 + 6×4 = 2072. You must multiply by the element size, not just add the index.',
              },

              // ── Cell 6: Challenge ────────────────────────────────────────────
              {
                type: 'challenge',
                title: 'Amortized Copies',
                instruction: 'A dynamic array starts with capacity 1 and doubles when full.\n\nYou perform **16 consecutive appends**. How many total element copy operations happen across all resizes?',
                html: '',
                css: `body{margin:0;padding:12px;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}`,
                startCode: '',
                options: [
                  { label: 'A', text: '16 — one copy per append.' },
                  { label: 'B', text: '32 — the last resize doubles the whole array.' },
                  { label: 'C', text: '15 — resizes copy 1+2+4+8 = 15 elements total.' },
                  { label: 'D', text: '64 — worst case for 16 appends with doubling.' },
                ],
                check: label => label === 'C',
                successMessage: '✓ Resizes happen at append 2 (copy 1), append 3 (copy 2), append 5 (copy 4), append 9 (copy 8). Total = 1+2+4+8 = 15 copies across 16 appends. Average: 15/16 ≈ 0.94 copies/append → O(1) amortized. This geometric series always sums to less than 2n.',
                failMessage: '✗ Trace the resizes: capacity goes 1→2→4→8→16. Each resize copies the current size: 1 copy, then 2, then 4, then 8. Total = 1+2+4+8 = 15. Spread over 16 appends = less than 1 copy per append on average.',
              },
            ],
          },
        },
      },
    ],
  },

  math: {
    prose: [
      'Let T(n) be the total cost of n appends starting from capacity 1 with doubling. Resizes occur at append 2, 3, 5, 9, ..., 2^(k-1)+1 copying 1, 2, 4, ..., 2^(k-1) elements. Total copies = ∑_{i=0}^{k-1} 2^i = 2^k - 1 < 2n. With n pushes at cost 1 each plus < 2n copies: T(n) < 3n → amortized O(1) per operation.',
      'More precisely: a geometric series with ratio 2 sums as 1 + 2 + 4 + ... + 2^k = 2^(k+1) - 1. Since 2^k ≤ n, the total copies never exceed 2n - 1, regardless of how many appends you do.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Dynamic Array Amortized Bound',
        body: 'For any sequence of n append operations on a dynamic array starting empty with capacity 1 and doubling strategy:\n  Total work ≤ 3n\n  Amortized cost per append = O(1)\n\nThis holds even if some individual appends cost O(n).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'Python\'s list over-allocates using the pattern: new_capacity = (old_size + old_size >> 3 + 6) & ~3, not strict doubling. This gives a growth factor between 1.1 and 1.25 for large lists, reducing memory waste compared to strict 2× doubling while preserving amortized O(1). The tradeoff: more frequent resizes but smaller memory footprint.',
      'JavaScript V8 engine represents arrays as one of several internal shapes: SMI (small integers), PACKED_ELEMENTS, HOLEY_ELEMENTS, and others. Mixing types in an array triggers a shape transition that can make subsequent operations slower. For performance-critical code, keep array element types uniform and avoid creating holes (arr[100] = x on an array of length 5).',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      title: 'JavaScript: Prove O(1) access by index',
      description: 'Benchmark arr[0] vs arr[1,000,000] — they take the same time.',
      language: 'javascript',
      code: `const N = 1_000_000;
const arr = new Array(N).fill(0).map((_, i) => i);

const REPS = 100_000;

// Access element 0 (start of array)
let t = performance.now();
let sum = 0;
for (let i = 0; i < REPS; i++) sum += arr[0];
const t0 = performance.now() - t;

// Access element N-1 (end of array)
t = performance.now();
sum = 0;
for (let i = 0; i < REPS; i++) sum += arr[N - 1];
const tN = performance.now() - t;

console.log(\`arr[0]:     \${t0.toFixed(2)}ms\`);
console.log(\`arr[N-1]:   \${tN.toFixed(2)}ms\`);
console.log(\`Difference: \${Math.abs(t0-tN).toFixed(2)}ms  ← should be ~0\`);
console.log('Both O(1) — position in array does not matter.');`,
    },
    {
      title: 'Python: Observe list growth in-place',
      description: 'Use sys.getsizeof() to watch a list\'s memory footprint grow as you append.',
      language: 'python',
      code: `import sys

lst = []
prev_size = sys.getsizeof(lst)

print(f"{'len':>4} | {'bytes':>8} | {'growth':>8}")
print("-" * 28)

for i in range(33):
    lst.append(i)
    size = sys.getsizeof(lst)
    if size != prev_size:
        print(f"{len(lst):>4} | {size:>8} | {'+'+str(size-prev_size):>8}  ← resize!")
        prev_size = size

print()
print("Notice: memory grows in steps, not every append.")
print("When it grows, it over-allocates to make future appends cheap.")`,
    },
  ],

  challenges: [
    {
      id: 'dsa1-001-c1',
      title: 'Build a Fixed Array Wrapper',
      difficulty: 'easy',
      description: 'Implement a Python class `FixedArray` that wraps a list but raises an IndexError if you try to access or write beyond its fixed capacity. This simulates a C-style fixed-size array.',
      starterCode: `class FixedArray:
    def __init__(self, capacity):
        self._cap  = capacity
        self._data = [None] * capacity
        self._size = 0

    def append(self, val):
        # TODO: raise IndexError if full, otherwise add val
        pass

    def __getitem__(self, i):
        # TODO: raise IndexError if i >= self._size or i < 0
        pass

    def __len__(self):
        return self._size

    def __repr__(self):
        return f"FixedArray({self._data[:self._size]})"

fa = FixedArray(4)
fa.append(10); fa.append(20); fa.append(30)
print(fa)          # FixedArray([10, 20, 30])
print(fa[1])       # 20
print(len(fa))     # 3
fa.append(40)
fa.append(50)      # should raise IndexError`,
      solution: `class FixedArray:
    def __init__(self, capacity):
        self._cap  = capacity
        self._data = [None] * capacity
        self._size = 0

    def append(self, val):
        if self._size >= self._cap:
            raise IndexError(f"FixedArray is full (capacity={self._cap})")
        self._data[self._size] = val
        self._size += 1

    def __getitem__(self, i):
        if i < 0 or i >= self._size:
            raise IndexError(f"Index {i} out of range (size={self._size})")
        return self._data[i]

    def __len__(self):
        return self._size

    def __repr__(self):
        return f"FixedArray({self._data[:self._size]})"`,
      hint: 'Check self._size against self._cap in append. Check i against self._size in __getitem__. Use self._data as the underlying storage.',
    },
    {
      id: 'dsa1-001-c2',
      title: 'Build a DynamicArray (foundation for the next lesson)',
      difficulty: 'hard',
      description: 'Implement a DynamicArray class in Python with O(1) amortized append, O(1) access, and O(n) insert/delete at arbitrary indices. This is what Python\'s list does internally.',
      starterCode: `class DynamicArray:
    def __init__(self):
        self._cap  = 1
        self._size = 0
        self._data = [None] * self._cap

    def _resize(self):
        """Double the capacity and copy all elements."""
        # TODO
        pass

    def append(self, val):
        """Add val to the end — O(1) amortized."""
        # TODO: resize if full, then add
        pass

    def __getitem__(self, i):
        """O(1) access."""
        if i < 0 or i >= self._size:
            raise IndexError(f"index {i} out of range")
        return self._data[i]

    def insert(self, i, val):
        """Insert val at position i — O(n)."""
        # TODO: shift elements right, then place val
        pass

    def delete(self, i):
        """Remove element at position i — O(n)."""
        # TODO: shift elements left
        pass

    def __len__(self):  return self._size
    def __repr__(self): return f"DA{list(self._data[:self._size])}"

da = DynamicArray()
for x in [10, 20, 30, 40, 50]: da.append(x)
print(da)          # DA[10, 20, 30, 40, 50]
da.insert(2, 99)
print(da)          # DA[10, 20, 99, 30, 40, 50]
da.delete(0)
print(da)          # DA[20, 99, 30, 40, 50]`,
      solution: `class DynamicArray:
    def __init__(self):
        self._cap  = 1
        self._size = 0
        self._data = [None] * self._cap

    def _resize(self):
        new_cap  = self._cap * 2
        new_data = [None] * new_cap
        for i in range(self._size):
            new_data[i] = self._data[i]
        self._data = new_data
        self._cap  = new_cap

    def append(self, val):
        if self._size == self._cap:
            self._resize()
        self._data[self._size] = val
        self._size += 1

    def __getitem__(self, i):
        if i < 0 or i >= self._size:
            raise IndexError(f"index {i} out of range")
        return self._data[i]

    def insert(self, i, val):
        if self._size == self._cap:
            self._resize()
        for j in range(self._size, i, -1):
            self._data[j] = self._data[j - 1]
        self._data[i] = val
        self._size += 1

    def delete(self, i):
        for j in range(i, self._size - 1):
            self._data[j] = self._data[j + 1]
        self._data[self._size - 1] = None
        self._size -= 1

    def __len__(self):  return self._size
    def __repr__(self): return f"DA{list(self._data[:self._size])}"`,
      hint: '_resize() should allocate a new list of double the capacity and copy all self._size elements into it. append() calls _resize() when self._size == self._cap. insert() shifts right before placing. delete() shifts left after removing.',
    },
  ],
};
