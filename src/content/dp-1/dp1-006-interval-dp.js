export default {
  id: 'dp1-006',
  slug: 'interval-dp',
  chapter: 'dp1',
  order: 6,
  title: 'Interval DP: Splitting Problems in Half',
  subtitle: 'Fill the table by length, not by position. Every cell is the best answer for a contiguous range.',
  tags: ['dynamic programming', 'interval DP', 'matrix chain', 'burst balloons', 'palindrome partitioning', 'range DP', 'split point'],
  aliases: 'interval DP range DP matrix chain multiplication burst balloons palindrome partitioning min cuts optimal BST split point length',

  hook: {
    question: 'You have four matrices to multiply: A×B×C×D. Matrix multiplication is associative — the answer is the same regardless of grouping — but the NUMBER OF OPERATIONS depends enormously on the order. ((A×B)×C)×D might take 87,500 multiplications. A×((B×C)×D) might take only 34,500. Your compiler makes this decision for you before your program runs. With 50 matrices, there are 4 billion possible orderings. The DP solution evaluates the optimal split for every subrange and finds the answer in O(n³) time. This is interval DP: fill a triangular table by interval length, splitting each range at every possible point.',
    realWorldContext: 'Interval DP appears wherever an optimal solution over a range depends on how that range is split. Database query optimizers use it to decide the order in which to JOIN tables — the join order changes query time by orders of magnitude. Compilers use it for expression evaluation order. Computational biology uses it for RNA secondary structure prediction (which pairs of bases form bonds). Game theory uses it for optimal game strategies. Any time your problem is "what is the best way to process this contiguous range?", interval DP is the answer.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**What makes interval DP different.** In grid DP, you fill row by row. In sequence DP, you fill left-to-right across two axes. In interval DP, you fill by interval LENGTH. Start with all intervals of length 1 (base cases — usually trivial). Then compute all intervals of length 2 using the length-1 results. Then length 3 using length-1 and length-2 results. And so on. The key invariant: when you compute dp[i][j] for an interval of length L, all shorter intervals have already been computed.',
      '**The split point.** Every interval DP problem has a split point k that divides the interval [i, j] into two sub-intervals [i, k] and [k+1, j]. You try every possible split point and take the best. The recurrence is always: dp[i][j] = best over all k in [i, j-1] of { dp[i][k] + dp[k+1][j] + cost(i, k, j) }. The cost function is problem-specific. The structure — split, solve halves, combine — is universal.',
      '**Matrix Chain Multiplication.** Given n matrices with dimensions dims[0]×dims[1], dims[1]×dims[2], ..., find the minimum number of scalar multiplications to compute the product. dp[i][j] = min multiplications to compute the product of matrices i through j. Split at k: compute matrices i..k, compute matrices k+1..j, then multiply the results. The cost of that final multiplication is dims[i] × dims[k+1] × dims[j+1]. dp[i][i] = 0 (one matrix needs no multiplication). Fill by length 2, 3, ..., n. Answer: dp[0][n-1].',
      '**Burst Balloons.** Given balloons with values nums[], burst them all to maximize coins. Bursting balloon k when neighbors are i and j gives nums[i]×nums[k]×nums[j] coins. Key insight: instead of thinking about which balloon to burst FIRST, think about which balloon is burst LAST in range (i, j). dp[i][j] = max coins from bursting all balloons strictly between i and j. The last balloon k in (i, j) gives nums[i]×nums[k]×nums[j] coins, plus dp[i][k] and dp[k][j] for the left and right sub-ranges. This "last burst" framing is what makes the subproblems independent — when k is the last balloon, i and j are still intact as boundaries.',
      '**Palindrome Partitioning.** Find the minimum cuts to split a string into palindromic substrings. "aab" → ["aa","b"] needs 1 cut. dp[i][j] = min cuts for s[i..j]. If s[i..j] is already a palindrome, dp[i][j] = 0. Otherwise, try all split points k: dp[i][j] = min(dp[i][k] + dp[k+1][j] + 1). Precompute isPalin[i][j] in O(n²) using the fact that s[i..j] is a palindrome iff s[i+1..j-1] is a palindrome and s[i] === s[j].',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 1, Lesson 6: Interval DP',
        body: '**Previous:** Knapsack DP — 0/1, Coin Change, Subset Sum.\n**This lesson:** Interval DP — Matrix Chain, Burst Balloons, Palindrome Partitioning.\n**Next:** Tree DP — problems on trees and DAGs.',
      },
      {
        type: 'insight',
        title: 'The loop order: length before start index',
        body: 'Always iterate interval length in the outer loop, start index in the inner loop. len=2 → all pairs (i, i+1). len=3 → all triples. This guarantees that when you compute dp[i][j], every shorter interval is already solved. If you loop by start index first, you would try to use dp[k+1][j] before it is computed.',
      },
      {
        type: 'strategy',
        title: 'Burst Balloons: think about the last balloon, not the first',
        body: 'The natural instinct is "which balloon do I burst first?" But that makes the subproblems overlap — after bursting balloon k, the neighbors of k change, which means the state depends on history. Flip it: "which balloon is burst LAST?" When k is the last balloon in range (i,j), i and j are still intact as boundaries throughout. The subproblems dp[i][k] and dp[k][j] are fully independent. This reversal of perspective is a classic interval DP trick.',
      },
      {
        type: 'insight',
        title: 'The table is triangular — only i ≤ j cells exist',
        body: 'Interval DP uses only the upper triangle of the table (where start ≤ end). Cells where i > j have no meaning. The base cases are on the diagonal (i = j). The answer is typically dp[0][n-1] — the entire range. Cells are filled in diagonal bands: first the diagonal (length 1), then one step above (length 2), and so on up to the top-right corner.',
      },
      {
        type: 'warning',
        title: 'Matrix chain indexing: matrices vs dimensions',
        body: 'If you have n matrices, you have n+1 dimensions. Matrix i has dimensions dims[i] × dims[i+1]. The dp table is n×n. When multiplying matrices i..k and k+1..j, the final cost is dims[i] × dims[k+1] × dims[j+1]. Off-by-one errors in dimensions are the most common matrix chain bug. Write the dimensions array first, check it has n+1 entries, then build from there.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Interval DP Step-Through: Matrix Chain and Burst Balloons',
        caption: 'Step through the triangular table filling by interval length. Each step tries a split point and updates the cell if it improves the answer.',
        props: {
          lesson: {
            title: 'Interval DP — Interactive Step-Through',
            subtitle: 'Fill by length. Split at every k. Take the best.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Matrix Chain Multiplication — Step Through the Splits',
                instruction: 'Each step tries one split point k for one interval [i,j]. Yellow = current cell being updated. Red = left subproblem dp[i][k]. Green = right subproblem dp[k+1][j]. The info bar shows the full cost formula. Watch how longer intervals build on shorter ones.',
                html: `<div style="font-family:monospace;font-size:12px;display:flex;flex-direction:column;height:100%">
  <div style="background:#1e293b;border-bottom:1px solid #334155;padding:8px 12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <button id="rst"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">↺ Reset</button>
    <button id="prev" style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">← Prev</button>
    <button id="play" style="background:#1d4ed8;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">▶ Play</button>
    <button id="nxt"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">Next →</button>
    <span id="ctr" style="color:#64748b;font-size:11px;margin-left:4px">Ready</span>
  </div>
  <div id="info" style="padding:8px 12px;background:#0f172a;font-size:11px;min-height:40px;border-bottom:1px solid #1e293b"></div>
  <div id="tbl" style="padding:10px 12px;overflow:auto;flex:1"></div>
</div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `// 5 matrices: A0(10x30) A1(30x5) A2(5x60) A3(60x10) A4(10x20)
const DIMS = [10, 30, 5, 60, 10, 20];
const N = DIMS.length - 1; // 5 matrices

// Pre-compute full table
const DP = Array.from({ length: N }, () => new Array(N).fill(0));
const BEST_K = Array.from({ length: N }, () => new Array(N).fill(-1));
const STEPS = []; // { i, j, k, cost, prev_best, is_improvement, final }

for (let i = 0; i < N; i++) DP[i][i] = 0;

for (let len = 2; len <= N; len++) {
  for (let i = 0; i <= N - len; i++) {
    const j = i + len - 1;
    DP[i][j] = Infinity;
    for (let k = i; k < j; k++) {
      const cost = DP[i][k] + DP[k+1][j] + DIMS[i] * DIMS[k+1] * DIMS[j+1];
      const prev = DP[i][j];
      const improved = cost < DP[i][j];
      if (improved) { DP[i][j] = cost; BEST_K[i][j] = k; }
      STEPS.push({ i, j, k, cost, prev, improved, cur: DP[i][j], finalK: BEST_K[i][j] });
    }
  }
}

// Snapshot of dp table after each step
const SNAPS = [];
const snap = Array.from({ length: N }, () => new Array(N).fill(-1));
for (let i = 0; i < N; i++) snap[i][i] = 0;
SNAPS.push(snap.map(r => r.slice()));
for (const { i, j, cur } of STEPS) {
  snap[i][j] = cur;
  SNAPS.push(snap.map(r => r.slice()));
}

const TOTAL = STEPS.length;
let step = 0, timer = null;

function render() {
  const s = step > 0 ? STEPS[step - 1] : null;
  const tableSnap = SNAPS[step];
  document.getElementById("ctr").textContent = step === 0 ? "Base cases (diagonal = 0)" : "Step " + step + " / " + TOTAL;

  const info = document.getElementById("info");
  if (!s) {
    info.innerHTML = "<span style='color:#94a3b8'>All dp[i][i] = 0. One matrix needs no multiplication. Press Next to start.</span>";
  } else {
    const { i, j, k, cost, prev, improved } = s;
    const left  = DP[i][k]  === 0 ? "0" : DP[i][k].toLocaleString();
    const right = DP[k+1][j] === 0 ? "0" : DP[k+1][j].toLocaleString();
    const mult  = (DIMS[i] * DIMS[k+1] * DIMS[j+1]).toLocaleString();
    const costStr = cost.toLocaleString();
    const prevStr = prev === Infinity ? "Inf" : prev.toLocaleString();
    info.innerHTML =
      "<b style='color:#fbbf24'>[" + i + "," + j + "]</b> split at k=" + k +
      ": dp[" + i + "][" + k + "]+dp[" + (k+1) + "][" + j + "]+" +
      DIMS[i] + "×" + DIMS[k+1] + "×" + DIMS[j+1] +
      " = " + left + "+" + right + "+" + mult +
      " = <b style='color:" + (improved ? "#4ade80" : "#fca5a5") + "'>" + costStr + "</b>" +
      (improved ? " ← new best!" : " (prev=" + prevStr + ", no improvement)");
  }

  let h = "<div style='margin-bottom:8px;color:#94a3b8;font-size:11px'>Dims: [" + DIMS.join(", ") + "]  — A0(" + DIMS[0] + "×" + DIMS[1] + ") A1(" + DIMS[1] + "×" + DIMS[2] + ") ... (upper triangle only)</div>";
  h += "<table style='border-collapse:collapse'>";
  h += "<tr><td style='width:28px;height:24px'></td>";
  for (let j2 = 0; j2 < N; j2++)
    h += "<td style='width:70px;height:24px;text-align:center;color:#475569;font-size:10px'>j=" + j2 + "</td>";
  h += "</tr>";

  for (let i2 = 0; i2 < N; i2++) {
    h += "<tr><td style='color:#475569;font-size:10px;padding-right:4px'>i=" + i2 + "</td>";
    for (let j2 = 0; j2 < N; j2++) {
      if (j2 < i2) {
        h += "<td style='width:70px;height:32px;background:#0a0f1a'></td>";
        continue;
      }
      const isCur  = s && s.i === i2 && s.j === j2;
      const isLeft = s && s.i === i2 && s.k === j2;
      const isRight= s && s.k + 1 === i2 && s.j === j2;
      const val    = tableSnap[i2][j2];
      const isDone = val >= 0 && val !== Infinity && !(isCur && s && s.prev === Infinity && !s.improved);
      const isBase = i2 === j2;

      let bg = "#0f2231", fc = "#334155", txt = "·";
      if (isBase)   { bg = "#0f2231"; fc = "#475569"; txt = "0"; }
      else if (isCur)  { bg = "#92400e"; fc = "#fef3c7"; txt = val === Infinity ? "?" : val.toLocaleString(); }
      else if (isLeft) { bg = "#14532d"; fc = "#86efac"; txt = val >= 0 ? val.toLocaleString() : "0"; }
      else if (isRight){ bg = "#7f1d1d"; fc = "#fca5a5"; txt = val >= 0 ? val.toLocaleString() : "0"; }
      else if (isDone) { bg = "#1e293b"; fc = "#94a3b8"; txt = val.toLocaleString(); }

      const brd = isCur ? "2px solid #f59e0b" : (isLeft || isRight) ? "2px solid #334155" : "1px solid #1e293b";
      h += "<td style='width:70px;height:32px;text-align:center;border:" + brd + ";background:" + bg + ";color:" + fc + ";font-size:11px;font-weight:bold'>" + txt + "</td>";
    }
    h += "</tr>";
  }
  h += "</table>";
  if (step === TOTAL) {
    h += "<div style='margin-top:10px;background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b'>Min multiplications = <b>" + DP[0][N-1].toLocaleString() + "</b> (optimal split for A0..A" + (N-1) + ")</div>";
  }
  document.getElementById("tbl").innerHTML = h;
}

document.getElementById("nxt").onclick  = () => { if (step < TOTAL) { step++; render(); } };
document.getElementById("prev").onclick = () => { if (step > 0) { step--; render(); } };
document.getElementById("rst").onclick  = () => {
  if (timer) { clearInterval(timer); timer = null; document.getElementById("play").textContent = "▶ Play"; }
  step = 0; render();
};
document.getElementById("play").onclick = function() {
  if (timer) { clearInterval(timer); timer = null; this.textContent = "▶ Play"; return; }
  this.textContent = "⏸ Pause";
  timer = setInterval(() => {
    if (step >= TOTAL) { clearInterval(timer); timer = null; document.getElementById("play").textContent = "▶ Play"; return; }
    step++; render();
  }, 250);
};
render();`,
                outputHeight: 420,
              },
              {
                type: 'js',
                title: 'Burst Balloons — The "Last Balloon" Insight',
                instruction: 'Think of k as the LAST balloon burst in range (i,j). Boundaries i and j are still intact, so the coins are nums[i]×nums[k]×nums[j]. Step through each cell: yellow = current (i,j), green = dp[i][k] (left range already burst), red = dp[k][j] (right range already burst).',
                html: `<div style="font-family:monospace;font-size:12px;display:flex;flex-direction:column;height:100%">
  <div style="background:#1e293b;border-bottom:1px solid #334155;padding:8px 12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <button id="rst"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">↺ Reset</button>
    <button id="prev" style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">← Prev</button>
    <button id="play" style="background:#1d4ed8;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">▶ Play</button>
    <button id="nxt"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">Next →</button>
    <span id="ctr" style="color:#64748b;font-size:11px;margin-left:4px">Ready</span>
  </div>
  <div id="info" style="padding:8px 12px;background:#0f172a;font-size:11px;min-height:40px;border-bottom:1px solid #1e293b"></div>
  <div id="tbl" style="padding:10px 12px;overflow:auto;flex:1"></div>
</div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `// Pad with 1 on both sides as boundaries
const RAW = [3, 1, 5, 8, 2];
const NUMS = [1].concat(RAW).concat([1]);
const N = NUMS.length; // includes boundary 1s

const DP = Array.from({ length: N }, () => new Array(N).fill(0));
const STEPS = [];

// dp[i][j] = max coins bursting all balloons strictly between i and j
for (let len = 2; len < N; len++) {
  for (let i = 0; i <= N - len - 1; i++) {
    const j = i + len;
    for (let k = i + 1; k < j; k++) {
      const coins = NUMS[i] * NUMS[k] * NUMS[j];
      const candidate = DP[i][k] + coins + DP[k][j];
      const prev = DP[i][j];
      const improved = candidate > prev;
      if (improved) DP[i][j] = candidate;
      STEPS.push({ i, j, k, coins, candidate, prev, improved, cur: DP[i][j] });
    }
  }
}

// Snapshots
const SNAPS = [];
const snap = Array.from({ length: N }, () => new Array(N).fill(0));
SNAPS.push(snap.map(r => r.slice()));
for (const { i, j, cur } of STEPS) {
  snap[i][j] = cur;
  SNAPS.push(snap.map(r => r.slice()));
}

const TOTAL = STEPS.length;
let step = 0, timer = null;

function render() {
  const s = step > 0 ? STEPS[step - 1] : null;
  const tableSnap = SNAPS[step];
  document.getElementById("ctr").textContent = step === 0 ? "Base cases (all 0)" : "Step " + step + " / " + TOTAL;

  const info = document.getElementById("info");
  if (!s) {
    info.innerHTML = "<span style='color:#94a3b8'>dp[i][j] = 0 initially. Balloons: [" + RAW.join(", ") + "] with boundary 1s on each side. Press Next to start.</span>";
  } else {
    const { i, j, k, coins, candidate, prev, improved } = s;
    info.innerHTML =
      "<b style='color:#fbbf24'>dp[" + i + "][" + j + "]</b>: last balloon = k=" + k + " (value=" + NUMS[k] + ")" +
      " — dp[" + i + "][" + k + "] + " + NUMS[i] + "×" + NUMS[k] + "×" + NUMS[j] +
      " + dp[" + k + "][" + j + "] = " + tableSnap[i][k] + "+" + coins + "+" + tableSnap[k][j] +
      " = <b style='color:" + (improved ? "#4ade80" : "#fca5a5") + "'>" + candidate + "</b>" +
      (improved ? " ← new best!" : " (prev=" + prev + ")");
  }

  // Build labels (show balloon values)
  let h = "<div style='margin-bottom:8px;color:#94a3b8;font-size:11px'>Balloons: [1|<b>" + RAW.join(", ") + "</b>|1]  (index 0 and " + (N-1) + " are boundary 1s)</div>";
  h += "<table style='border-collapse:collapse'>";
  h += "<tr><td style='width:28px'></td>";
  for (let j2 = 0; j2 < N; j2++) {
    const lbl = j2 === 0 || j2 === N-1 ? "1" : RAW[j2-1];
    h += "<td style='width:52px;height:24px;text-align:center;color:#475569;font-size:10px'>j=" + j2 + "(" + lbl + ")</td>";
  }
  h += "</tr>";

  for (let i2 = 0; i2 < N; i2++) {
    h += "<tr><td style='color:#475569;font-size:10px'>i=" + i2 + "</td>";
    for (let j2 = 0; j2 < N; j2++) {
      if (j2 <= i2) { h += "<td style='width:52px;height:30px;background:#0a0f1a'></td>"; continue; }
      const isCur   = s && s.i === i2 && s.j === j2;
      const isLeft  = s && s.i === i2 && s.k === j2;
      const isRight = s && s.k === i2 && s.j === j2;
      const val     = tableSnap[i2][j2];
      const isAdj   = j2 === i2 + 1; // no balloons between adjacent

      let bg = "#1e293b", fc = "#334155", txt = val > 0 ? String(val) : (isAdj ? "0" : "·");
      if (isCur)   { bg = "#92400e"; fc = "#fef3c7"; txt = String(DP[i2][j2]); }
      else if (isLeft)  { bg = "#14532d"; fc = "#86efac"; }
      else if (isRight) { bg = "#7f1d1d"; fc = "#fca5a5"; }
      else if (val > 0) { bg = "#1e293b"; fc = "#94a3b8"; }
      else if (isAdj)   { bg = "#0f2231"; fc = "#334155"; }

      const brd = isCur ? "2px solid #f59e0b" : (isLeft || isRight) ? "2px solid #334155" : "1px solid #1e293b";
      h += "<td style='width:52px;height:30px;text-align:center;border:" + brd + ";background:" + bg + ";color:" + fc + ";font-size:11px;font-weight:bold'>" + txt + "</td>";
    }
    h += "</tr>";
  }
  h += "</table>";
  if (step === TOTAL) {
    h += "<div style='margin-top:10px;background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b'>Max coins = <b>" + DP[0][N-1] + "</b></div>";
  }
  document.getElementById("tbl").innerHTML = h;
}

document.getElementById("nxt").onclick  = () => { if (step < TOTAL) { step++; render(); } };
document.getElementById("prev").onclick = () => { if (step > 0) { step--; render(); } };
document.getElementById("rst").onclick  = () => {
  if (timer) { clearInterval(timer); timer = null; document.getElementById("play").textContent = "▶ Play"; }
  step = 0; render();
};
document.getElementById("play").onclick = function() {
  if (timer) { clearInterval(timer); timer = null; this.textContent = "▶ Play"; return; }
  this.textContent = "⏸ Pause";
  timer = setInterval(() => {
    if (step >= TOTAL) { clearInterval(timer); timer = null; document.getElementById("play").textContent = "▶ Play"; return; }
    step++; render();
  }, 220);
};
render();`,
                outputHeight: 440,
              },
              {
                type: 'js',
                title: 'Palindrome Partitioning — Min Cuts',
                instruction: 'Two tables: isPalin[i][j] (is substring s[i..j] a palindrome?) and dp[i][j] (min cuts for s[i..j]). Step through: green diagonal = single characters (always palindromes). Gold = palindromes. The min cuts table uses isPalin to short-circuit — if the whole range is a palindrome, 0 cuts needed.',
                html: `<div style="font-family:monospace;font-size:12px;display:flex;flex-direction:column;height:100%">
  <div style="background:#1e293b;border-bottom:1px solid #334155;padding:8px 12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <button id="rst"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">↺ Reset</button>
    <button id="prev" style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">← Prev</button>
    <button id="play" style="background:#1d4ed8;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">▶ Play</button>
    <button id="nxt"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">Next →</button>
    <span id="ctr" style="color:#64748b;font-size:11px;margin-left:4px">Ready</span>
  </div>
  <div id="info" style="padding:8px 12px;background:#0f172a;font-size:11px;min-height:40px;border-bottom:1px solid #1e293b"></div>
  <div id="tbl" style="padding:10px 12px;overflow:auto;flex:1"></div>
</div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const S = "aabcbaa";
const N = S.length;

// Precompute palindrome table
const isPalin = Array.from({ length: N }, () => new Array(N).fill(false));
for (let i = 0; i < N; i++) isPalin[i][i] = true;
for (let i = 0; i < N - 1; i++) isPalin[i][i+1] = S[i] === S[i+1];
for (let len = 3; len <= N; len++) {
  for (let i = 0; i <= N - len; i++) {
    const j = i + len - 1;
    isPalin[i][j] = S[i] === S[j] && isPalin[i+1][j-1];
  }
}

// Min cuts DP
const dp = Array.from({ length: N }, () => new Array(N).fill(0));
const STEPS = [];
for (let len = 2; len <= N; len++) {
  for (let i = 0; i <= N - len; i++) {
    const j = i + len - 1;
    if (isPalin[i][j]) { dp[i][j] = 0; STEPS.push({ i, j, result: 0, reason: "palindrome" }); continue; }
    dp[i][j] = Infinity;
    for (let k = i; k < j; k++) {
      const candidate = dp[i][k] + dp[k+1][j] + 1;
      if (candidate < dp[i][j]) dp[i][j] = candidate;
    }
    STEPS.push({ i, j, result: dp[i][j], reason: "split" });
  }
}

// Snapshots
const SNAPS = [];
const snap = Array.from({ length: N }, () => new Array(N).fill(-1));
for (let i = 0; i < N; i++) snap[i][i] = 0;
SNAPS.push(snap.map(r => r.slice()));
for (const { i, j, result } of STEPS) {
  snap[i][j] = result;
  SNAPS.push(snap.map(r => r.slice()));
}

const TOTAL = STEPS.length;
let step = 0, timer = null;

function render() {
  const s = step > 0 ? STEPS[step - 1] : null;
  const tableSnap = SNAPS[step];
  document.getElementById("ctr").textContent = step === 0 ? "Base cases" : "Step " + step + " / " + TOTAL;

  const info = document.getElementById("info");
  if (!s) {
    info.innerHTML = "<span style='color:#94a3b8'>String: <b>" + S + "</b>. Single characters = palindromes (0 cuts). Adjacent pairs checked. Press Next.</span>";
  } else if (s.reason === "palindrome") {
    info.innerHTML = "<b style='color:#f59e0b'>[" + s.i + "," + s.j + "]</b> " +
      "s[" + s.i + ".." + s.j + "] = <b style='color:#fbbf24'>" + S.slice(s.i, s.j+1) + "</b> is a palindrome → <b style='color:#4ade80'>0 cuts</b>";
  } else {
    info.innerHTML = "<b style='color:#f59e0b'>[" + s.i + "," + s.j + "]</b> " +
      S.slice(s.i, s.j+1) + " is not a palindrome → best split gives <b style='color:#fbbf24'>" + s.result + " cut" + (s.result === 1 ? "" : "s") + "</b>";
  }

  let h = "<div style='margin-bottom:6px;color:#94a3b8;font-size:11px'>String: <b style='color:#60a5fa'>" + S.split("").map((c,i) => i + ":" + c).join("  ") + "</b></div>";
  h += "<div style='display:flex;gap:24px'>";

  // isPalin table
  h += "<div><div style='color:#64748b;font-size:10px;margin-bottom:4px'>isPalin[i][j]</div>";
  h += "<table style='border-collapse:collapse'>";
  h += "<tr><td style='width:16px'></td>";
  for (let j2 = 0; j2 < N; j2++)
    h += "<td style='width:24px;height:20px;text-align:center;color:#475569;font-size:9px'>" + j2 + "</td>";
  h += "</tr>";
  for (let i2 = 0; i2 < N; i2++) {
    h += "<tr><td style='color:#475569;font-size:9px'>" + i2 + "</td>";
    for (let j2 = 0; j2 < N; j2++) {
      if (j2 < i2) { h += "<td style='width:24px;height:24px;background:#0a0f1a'></td>"; continue; }
      const isCur = s && s.i === i2 && s.j === j2;
      const val   = isPalin[i2][j2];
      const isBase = i2 === j2;
      let bg = "#1e293b", fc = "#334155", txt = " ";
      if (val && isBase) { bg = "#166534"; fc = "#4ade80"; txt = "T"; }
      else if (val)      { bg = "#854d0e"; fc = "#fef08a"; txt = "T"; }
      else               { bg = "#1e293b"; fc = "#334155"; txt = "F"; }
      if (isCur)         { bg = "#92400e"; fc = "#fef3c7"; }
      h += "<td style='width:24px;height:24px;text-align:center;border:1px solid #1e293b;background:" + bg + ";color:" + fc + ";font-size:9px;font-weight:bold'>" + txt + "</td>";
    }
    h += "</tr>";
  }
  h += "</table></div>";

  // dp min cuts table
  h += "<div><div style='color:#64748b;font-size:10px;margin-bottom:4px'>dp[i][j] = min cuts</div>";
  h += "<table style='border-collapse:collapse'>";
  h += "<tr><td style='width:16px'></td>";
  for (let j2 = 0; j2 < N; j2++)
    h += "<td style='width:28px;height:20px;text-align:center;color:#475569;font-size:9px'>" + j2 + "</td>";
  h += "</tr>";
  for (let i2 = 0; i2 < N; i2++) {
    h += "<tr><td style='color:#475569;font-size:9px'>" + i2 + "</td>";
    for (let j2 = 0; j2 < N; j2++) {
      if (j2 < i2) { h += "<td style='width:28px;height:24px;background:#0a0f1a'></td>"; continue; }
      const isCur = s && s.i === i2 && s.j === j2;
      const val   = tableSnap[i2][j2];
      const isAns = step === TOTAL && i2 === 0 && j2 === N - 1;
      let bg = "#1e293b", fc = "#334155", txt = val >= 0 ? String(val) : "·";
      if (isAns)          { bg = "#f59e0b"; fc = "#0f172a"; }
      else if (isCur)     { bg = "#92400e"; fc = "#fef3c7"; txt = String(dp[i2][j2]); }
      else if (val === 0) { bg = "#166534"; fc = "#4ade80"; }
      else if (val > 0)   { bg = "#1e3a5f"; fc = "#93c5fd"; }
      const brd = isCur ? "2px solid #f59e0b" : "1px solid #1e293b";
      h += "<td style='width:28px;height:24px;text-align:center;border:" + brd + ";background:" + bg + ";color:" + fc + ";font-size:10px;font-weight:bold'>" + txt + "</td>";
    }
    h += "</tr>";
  }
  h += "</table></div>";
  h += "</div>";
  if (step === TOTAL) {
    h += "<div style='margin-top:10px;background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b'>Min cuts for <b>" + S + "</b> = <b>" + dp[0][N-1] + "</b></div>";
  }
  document.getElementById("tbl").innerHTML = h;
}

document.getElementById("nxt").onclick  = () => { if (step < TOTAL) { step++; render(); } };
document.getElementById("prev").onclick = () => { if (step > 0) { step--; render(); } };
document.getElementById("rst").onclick  = () => {
  if (timer) { clearInterval(timer); timer = null; document.getElementById("play").textContent = "▶ Play"; }
  step = 0; render();
};
document.getElementById("play").onclick = function() {
  if (timer) { clearInterval(timer); timer = null; this.textContent = "▶ Play"; return; }
  this.textContent = "⏸ Pause";
  timer = setInterval(() => {
    if (step >= TOTAL) { clearInterval(timer); timer = null; document.getElementById("play").textContent = "▶ Play"; return; }
    step++; render();
  }, 300);
};
render();`,
                outputHeight: 420,
              },
            ],
          },
        },
      },
      {
        id: 'JSNotebook',
        title: 'Interval DP in JavaScript — Guided Exercises',
        caption: 'The loop structure is given. Fill in the cost formula and the recurrence update. Each exercise has a worked trace.',
        props: {
          lesson: {
            title: 'Interval DP in JavaScript',
            subtitle: 'Length outer, start inner, split at k. Fill the triangular table.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Matrix Chain Multiplication

Given n matrices with dimensions in \`dims\` (length n+1), return the minimum number of scalar multiplications.

**Loop structure is written.** Fill in the cost of splitting at k:

\`\`\`
cost = dp[i][k] + dp[k+1][j] + dims[i] * dims[k+1] * dims[j+1]
//     left half   right half   final multiplication cost
\`\`\`

**Trace for dims=[10,30,5,60] (3 matrices):**
\`\`\`
dp[0][1]: k=0: 0 + 0 + 10×30×5   = 1500
dp[1][2]: k=1: 0 + 0 + 30×5×60   = 9000
dp[0][2]: k=0: dp[0][0]+dp[1][2]+10×30×60 = 0+9000+18000 = 27000
          k=1: dp[0][1]+dp[2][2]+10×5×60  = 1500+0+3000  = 4500 ← best
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function matrixChain(dims) {
  const n = dims.length - 1; // number of matrices
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  // Base: dp[i][i] = 0 (one matrix, no multiplication needed)

  for (let len = 2; len <= n; len++) {       // interval length
    for (let i = 0; i <= n - len; i++) {     // start of interval
      const j = i + len - 1;                 // end of interval
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {          // try every split point
        // TODO: compute cost = dp[i][k] + dp[k+1][j] + dims[i]*dims[k+1]*dims[j+1]
        const cost = 0; // replace this line
        if (cost < dp[i][j]) dp[i][j] = cost;
      }
    }
  }
  return dp[0][n - 1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[10,30,5,60]",         matrixChain([10,30,5,60]),         4500);
check("[30,35,15,5,10,20,25]",matrixChain([30,35,15,5,10,20,25]),15125);
check("[40,20,30,10,30]",     matrixChain([40,20,30,10,30]),     26000);
check("[10,20,30]",           matrixChain([10,20,30]),            6000);
check("[5,10,3,12,5,50,6]",   matrixChain([5,10,3,12,5,50,6]),   2010);`,
                solutionCode: `function matrixChain(dims) {
  const n = dims.length - 1;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k+1][j] + dims[i] * dims[k+1] * dims[j+1];
        if (cost < dp[i][j]) dp[i][j] = cost;
      }
    }
  }
  return dp[0][n - 1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[10,30,5,60]",         matrixChain([10,30,5,60]),         4500);
check("[30,35,15,5,10,20,25]",matrixChain([30,35,15,5,10,20,25]),15125);
check("[40,20,30,10,30]",     matrixChain([40,20,30,10,30]),     26000);
check("[10,20,30]",           matrixChain([10,20,30]),            6000);
check("[5,10,3,12,5,50,6]",   matrixChain([5,10,3,12,5,50,6]),   2010);`,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Burst Balloons

Burst all balloons to maximize coins. Bursting balloon k when its neighbors are l and r gives \`nums[l]*nums[k]*nums[r]\` coins.

**Key insight:** Think of k as the **last** balloon burst in range (l, r). Pad with 1s on both sides.

**Loop structure is written.** Fill in the recurrence update:
\`\`\`
candidate = dp[l][k] + nums[l]*nums[k]*nums[r] + dp[k][r]
//          left done  last burst in (l,r)         right done
\`\`\`

**Trace for [3,1,5]:** padded = [1,3,1,5,1]
\`\`\`
dp[0][2]: k=1: dp[0][1]+1×3×1+dp[1][2] = 0+3+0 = 3
dp[1][3]: k=2: dp[1][2]+3×1×5+dp[2][3] = 0+15+0 = 15
          k=1: dp[1][1]+3×3×5+dp[1][3] -- wait, k must be strictly inside
dp[0][3]: k=1: 0+1×3×5+15=30  k=2: 3+1×1×5+0=8 → best=30
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function maxCoins(nums) {
  const arr = [1, ...nums, 1];   // pad with 1s
  const n = arr.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  // dp[l][r] = max coins bursting all balloons strictly between l and r
  for (let len = 2; len < n; len++) {         // interval length (gap size)
    for (let l = 0; l <= n - len - 1; l++) {  // left boundary
      const r = l + len;                      // right boundary
      for (let k = l + 1; k < r; k++) {       // k = last balloon burst in (l,r)
        // TODO: compute candidate = dp[l][k] + arr[l]*arr[k]*arr[r] + dp[k][r]
        const candidate = 0; // replace this line
        if (candidate > dp[l][r]) dp[l][r] = candidate;
      }
    }
  }
  return dp[0][n - 1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[3,1,5,8]",    maxCoins([3,1,5,8]),    167);
check("[1,5]",        maxCoins([1,5]),         10);
check("[3,1,5]",      maxCoins([3,1,5]),       35);
check("[5]",          maxCoins([5]),             5);
check("[1,2,3,4,5]",  maxCoins([1,2,3,4,5]),  110);`,
                solutionCode: `function maxCoins(nums) {
  const arr = [1, ...nums, 1];
  const n = arr.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let len = 2; len < n; len++) {
    for (let l = 0; l <= n - len - 1; l++) {
      const r = l + len;
      for (let k = l + 1; k < r; k++) {
        const candidate = dp[l][k] + arr[l] * arr[k] * arr[r] + dp[k][r];
        if (candidate > dp[l][r]) dp[l][r] = candidate;
      }
    }
  }
  return dp[0][n - 1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[3,1,5,8]",    maxCoins([3,1,5,8]),    167);
check("[1,5]",        maxCoins([1,5]),         10);
check("[3,1,5]",      maxCoins([3,1,5]),       35);
check("[5]",          maxCoins([5]),             5);
check("[1,2,3,4,5]",  maxCoins([1,2,3,4,5]),  110);`,
              },
              {
                type: 'js',
                instruction: `## Step 3 — Palindrome Partitioning II (Min Cuts)

Return the minimum number of cuts so every partition is a palindrome.

**Two-phase approach:**
1. Build \`isPalin[i][j]\` — precompute which substrings are palindromes
2. Build \`dp[i][j]\` — min cuts for s[i..j]

**isPalin recurrence:**
\`\`\`
isPalin[i][i] = true
isPalin[i][i+1] = s[i] === s[i+1]
isPalin[i][j] = s[i] === s[j] && isPalin[i+1][j-1]
\`\`\`

**dp recurrence** (loops are written — fill the update):
\`\`\`
if isPalin[i][j]: dp[i][j] = 0
else: dp[i][j] = min over k: dp[i][k] + dp[k+1][j] + 1
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function minCut(s) {
  const n = s.length;

  // Phase 1: precompute palindrome table
  const isPalin = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = 0; i < n; i++) isPalin[i][i] = true;
  for (let i = 0; i < n - 1; i++) isPalin[i][i+1] = s[i] === s[i+1];
  for (let len = 3; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      isPalin[i][j] = s[i] === s[j] && isPalin[i+1][j-1];
    }
  }

  // Phase 2: min cuts DP
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      if (isPalin[i][j]) { dp[i][j] = 0; continue; }
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        // TODO: const candidate = dp[i][k] + dp[k+1][j] + 1
        const candidate = Infinity; // replace this line
        if (candidate < dp[i][j]) dp[i][j] = candidate;
      }
    }
  }
  return dp[0][n - 1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check('"aab"',        minCut("aab"),       1);
check('"a"',          minCut("a"),         0);
check('"ab"',         minCut("ab"),        1);
check('"aabcbaa"',    minCut("aabcbaa"),   0);
check('"ababababab"',  minCut("ababababab"), 1);`,
                solutionCode: `function minCut(s) {
  const n = s.length;

  const isPalin = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = 0; i < n; i++) isPalin[i][i] = true;
  for (let i = 0; i < n - 1; i++) isPalin[i][i+1] = s[i] === s[i+1];
  for (let len = 3; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      isPalin[i][j] = s[i] === s[j] && isPalin[i+1][j-1];
    }
  }

  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      if (isPalin[i][j]) { dp[i][j] = 0; continue; }
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const candidate = dp[i][k] + dp[k+1][j] + 1;
        if (candidate < dp[i][j]) dp[i][j] = candidate;
      }
    }
  }
  return dp[0][n - 1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check('"aab"',        minCut("aab"),       1);
check('"a"',          minCut("a"),         0);
check('"ab"',         minCut("ab"),        1);
check('"aabcbaa"',    minCut("aabcbaa"),   0);
check('"ababababab"',  minCut("ababababab"), 1);`,
              },
              {
                type: 'js',
                instruction: `## Step 4 — Longest Palindromic Subsequence

This is interval DP meets LCS. Given a string, find the length of its longest palindromic subsequence (characters don't need to be contiguous).

**Recurrence:**
\`\`\`
dp[i][i] = 1  (single char is a palindrome)
if s[i] === s[j]: dp[i][j] = 2 + dp[i+1][j-1]
else:             dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1])
\`\`\`

**Trace for "bbbab":**
\`\`\`
dp[0][4]: s[0]=b, s[4]=b → match → 2 + dp[1][3]
dp[1][3]: s[1]=b, s[3]=a → no match → max(dp[2][3], dp[1][2])
...
\`\`\`
Answer for "bbbab" = 4 ("bbbb").`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) dp[i][i] = 1;

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      if (s[i] === s[j]) {
        // TODO: dp[i][j] = 2 + dp[i+1][j-1]   (match: extend inward)
        dp[i][j] = 0; // replace
      } else {
        // TODO: dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1])
        dp[i][j] = 0; // replace
      }
    }
  }
  return dp[0][n - 1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check('"bbbab"',   longestPalindromeSubseq("bbbab"),   4);
check('"cbbd"',    longestPalindromeSubseq("cbbd"),    2);
check('"a"',       longestPalindromeSubseq("a"),       1);
check('"abcba"',   longestPalindromeSubseq("abcba"),   5);
check('"aabaa"',   longestPalindromeSubseq("aabaa"),   5);`,
                solutionCode: `function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) dp[i][i] = 1;

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      if (s[i] === s[j]) {
        dp[i][j] = 2 + dp[i+1][j-1];
      } else {
        dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
      }
    }
  }
  return dp[0][n - 1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check('"bbbab"',   longestPalindromeSubseq("bbbab"),   4);
check('"cbbd"',    longestPalindromeSubseq("cbbd"),    2);
check('"a"',       longestPalindromeSubseq("a"),       1);
check('"abcba"',   longestPalindromeSubseq("abcba"),   5);
check('"aabaa"',   longestPalindromeSubseq("aabaa"),   5);`,
              },
            ],
          },
        },
      },
      {
        id: 'PythonNotebook',
        title: 'Interval DP in Python',
        caption: 'Heatmap the triangular table, visualize burst balloons order, and solve from-scratch challenges.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Matrix Chain Multiplication — triangular heatmap',
              code: `import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

dims = [30, 35, 15, 5, 10, 20, 25]
n = len(dims) - 1  # 6 matrices

dp = [[0] * n for _ in range(n)]
split = [[-1] * n for _ in range(n)]

for length in range(2, n + 1):
    for i in range(n - length + 1):
        j = i + length - 1
        dp[i][j] = float("inf")
        for k in range(i, j):
            cost = dp[i][k] + dp[k+1][j] + dims[i] * dims[k+1] * dims[j+1]
            if cost < dp[i][j]:
                dp[i][j] = cost
                split[i][j] = k

# Reconstruct optimal parenthesization
def parenthesize(i, j):
    if i == j: return "A" + str(i)
    k = split[i][j]
    return "(" + parenthesize(i, k) + " × " + parenthesize(k+1, j) + ")"

print(f"Matrix dimensions: {dims}")
print(f"Min multiplications: {dp[0][n-1]:,}")
print(f"Optimal order: {parenthesize(0, n-1)}")
print()

# Heatmap (upper triangle only)
fig, ax = plt.subplots(figsize=(10, 8))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

valid_vals = [dp[i][j] for i in range(n) for j in range(i, n) if dp[i][j] > 0]
minv = min(valid_vals) if valid_vals else 0
maxv = max(valid_vals) if valid_vals else 1

for i in range(n):
    for j in range(n):
        if j < i:
            rect = plt.Rectangle([j - 0.5, (n-1-i) - 0.5], 1, 1, color="#0a0f1a")
            ax.add_patch(rect)
            continue
        val = dp[i][j]
        is_ans = (i == 0 and j == n - 1)
        is_base = (i == j)

        if is_ans:
            bg = "#f59e0b"
        elif is_base:
            bg = "#0f2231"
        else:
            norm = (val - minv) / (maxv - minv) if maxv > minv else 0
            r = int(15 + norm * 30)
            g = int(58 + norm * 62)
            b = int(130 + norm * 100)
            bg = f"#{r:02x}{g:02x}{b:02x}"

        rect = plt.Rectangle([j - 0.5, (n-1-i) - 0.5], 1, 1, color=bg)
        ax.add_patch(rect)
        txt = "0" if is_base else (f"{val:,}" if val < 100000 else f"{val//1000}k")
        fc = "#0f172a" if is_ans else ("white" if not is_base else "#475569")
        ax.text(j, n-1-i, txt, ha="center", va="center",
                color=fc, fontsize=8, fontweight="bold", fontfamily="monospace")

ax.set_xlim(-0.5, n - 0.5)
ax.set_ylim(-0.5, n - 0.5)
ax.set_xticks(range(n))
ax.set_xticklabels([f"j={j}" for j in range(n)], color="#94a3b8", fontsize=9)
ax.set_yticks(range(n))
ax.set_yticklabels([f"i={n-1-i}" for i in range(n)], color="#94a3b8", fontsize=9)
for sp in ax.spines.values(): sp.set_edgecolor("#334155")
ax.set_title(f"Matrix Chain — min mults = {dp[0][n-1]:,}\\n{parenthesize(0, n-1)}",
             color="#60a5fa", fontsize=11, pad=12)
plt.tight_layout()
plt.show()
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Burst Balloons — visualize the optimal burst order',
              code: `import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

def max_coins(nums):
    arr = [1] + nums + [1]
    n = len(arr)
    dp = [[0] * n for _ in range(n)]
    best_k = [[-1] * n for _ in range(n)]

    for length in range(2, n):
        for l in range(n - length - 1 + 1):
            r = l + length
            for k in range(l + 1, r):
                coins = arr[l] * arr[k] * arr[r]
                candidate = dp[l][k] + coins + dp[k][r]
                if candidate > dp[l][r]:
                    dp[l][r] = candidate
                    best_k[l][r] = k
    return dp[0][n-1], dp, best_k, arr

nums = [3, 1, 5, 8, 2]
result, dp, best_k, arr = max_coins(nums)
n = len(arr)

print(f"Balloons: {nums}")
print(f"Max coins: {result}")

# Reconstruct burst order
def get_order(l, r, arr, best_k, order):
    if r - l <= 1: return
    k = best_k[l][r]
    if k == -1: return
    get_order(l, k, arr, best_k, order)
    get_order(k, r, arr, best_k, order)
    order.append((arr[k], arr[l] * arr[k] * arr[r]))

order = []
get_order(0, n-1, arr, best_k, order)
print("Burst order (value, coins_earned):", order)

# Heatmap of dp table
fig, ax = plt.subplots(figsize=(10, 8))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

valid_vals = [dp[i][j] for i in range(n) for j in range(i+2, n)]
maxv = max(valid_vals) if valid_vals else 1

for i in range(n):
    for j in range(n):
        if j <= i:
            rect = plt.Rectangle([j - 0.5, (n-1-i) - 0.5], 1, 1, color="#0a0f1a")
            ax.add_patch(rect)
            continue
        val = dp[i][j]
        is_ans = (i == 0 and j == n - 1)
        is_adj = (j == i + 1)

        if is_ans:       bg = "#f59e0b"
        elif is_adj:     bg = "#0f2231"
        elif val == 0:   bg = "#1e293b"
        else:
            norm = val / maxv
            r = int(15 + norm * 30)
            g = int(58 + norm * 62)
            b = int(130 + norm * 100)
            bg = f"#{r:02x}{g:02x}{b:02x}"

        rect = plt.Rectangle([j - 0.5, (n-1-i) - 0.5], 1, 1, color=bg)
        ax.add_patch(rect)
        fc = "#0f172a" if is_ans else "white"
        ax.text(j, n-1-i, str(val), ha="center", va="center",
                color=fc, fontsize=9, fontweight="bold", fontfamily="monospace")

ax.set_xlim(-0.5, n - 0.5)
ax.set_ylim(-0.5, n - 0.5)
lbl = ["1|"] + [f"{v}" for v in nums] + ["|1"]
ax.set_xticks(range(n))
ax.set_xticklabels([f"j={j}({arr[j]})" for j in range(n)], color="#94a3b8", fontsize=8)
ax.set_yticks(range(n))
ax.set_yticklabels([f"i={n-1-i}({arr[n-1-i]})" for i in range(n)], color="#94a3b8", fontsize=8)
for sp in ax.spines.values(): sp.set_edgecolor("#334155")
ax.set_title(f"Burst Balloons {nums}  |  Max coins = {result}",
             color="#60a5fa", fontsize=12, pad=12)
plt.tight_layout()
plt.show()
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'From scratch: Optimal BST + Strange Printer',
              code: `# ============================================================
# Challenge 1: Optimal Binary Search Tree
# Given sorted keys with search probabilities, find the BST
# structure that minimizes expected search cost.
# dp[i][j] = min cost BST for keys i..j
# dp[i][j] = min over root r: dp[i][r-1] + dp[r+1][j] + sum(probs[i..j])
# ============================================================

def optimal_bst(probs):
    n = len(probs)
    # prefix sums for range sum in O(1)
    prefix = [0] * (n + 1)
    for i in range(n): prefix[i+1] = prefix[i] + probs[i]
    def range_sum(i, j): return prefix[j+1] - prefix[i]

    dp = [[0.0] * n for _ in range(n)]
    for i in range(n): dp[i][i] = probs[i]

    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float("inf")
            s = range_sum(i, j)
            for r in range(i, j + 1):
                left  = dp[i][r-1] if r > i else 0
                right = dp[r+1][j] if r < j else 0
                cost  = left + right + s
                dp[i][j] = min(dp[i][j], cost)
    return dp[0][n-1]

probs = [0.15, 0.10, 0.05, 0.10, 0.20, 0.25, 0.15]
result = optimal_bst(probs)
print(f"Optimal BST expected search cost: {result:.4f}")
assert abs(result - 3.12) < 0.01, f"Expected ~3.12, got {result:.4f}"
print("Assertion passed!")
print()

# ============================================================
# Challenge 2: Strange Printer
# A printer can print consecutive identical characters in one turn.
# Find min turns to print a string.
# dp[i][j] = min turns to print s[i..j]
# If s[i] == s[k] for some k in (i,j], we can merge the first char
# with position k, saving one turn.
# ============================================================

def strange_printer(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n): dp[i][i] = 1

    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = dp[i][j-1] + 1  # worst case: print s[j] separately
            for k in range(i, j):
                if s[k] == s[j]:
                    # s[j] matches s[k]: when printing s[k], extend to s[j] for free
                    candidate = dp[i][k] + (dp[k+1][j-1] if k+1 <= j-1 else 0)
                    dp[i][j] = min(dp[i][j], candidate)
    return dp[0][n-1]

tests = [("aaabbb", 2), ("aba", 2), ("leetcode", 6), ("a", 1), ("aab", 2)]
for s, want in tests:
    got = strange_printer(s)
    status = "PASS" if got == want else "FAIL"
    print(f"{status} strange_printer({repr(s)}) = {got} (want {want})")
`,
            },
          ],
        },
      },
    ],
  },
};
