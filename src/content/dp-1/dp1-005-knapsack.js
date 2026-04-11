export default {
  id: 'dp1-005',
  slug: 'knapsack',
  chapter: 'dp1',
  order: 5,
  title: 'Knapsack DP: Items, Capacity, and Choice',
  subtitle: 'Every cell is a decision: take this item or skip it. The table remembers every choice you ever made.',
  tags: ['dynamic programming', 'knapsack', '0/1 knapsack', 'unbounded knapsack', 'coin change', 'subset sum', 'capacity DP'],
  aliases: 'knapsack 0/1 knapsack unbounded coin change minimum coins subset sum partition capacity weight value items DP',

  hook: {
    question: 'A thief breaks into a museum. Their bag holds 10 kg. The exhibits are worth millions but each has a weight. Which items to steal? The naive approach checks every subset — 2^50 combinations for 50 items, a quadrillion checks. DP solves it in O(n × capacity) by reframing the question: instead of "which combination is best?", ask "what is the best I can do with the first i items and exactly w kg of capacity?" Answer that for every (i, w) pair and the global answer falls out of the bottom-right corner of the table.',
    realWorldContext: 'Knapsack DP is the backbone of resource allocation under constraints. Financial portfolio optimization (maximize return given a risk budget) is a continuous knapsack. Compiler register allocation assigns variables to limited CPU registers using knapsack variants. Cloud schedulers pack jobs into servers without exceeding RAM. And Coin Change — the minimum-coins problem — runs inside every payment processor and ATM that needs to make change optimally.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The knapsack insight: decisions stack.** dp[i][w] = the best value achievable using any subset of the first i items with total weight at most w. The recurrence is a max of two choices: skip item i (answer is dp[i-1][w] — unchanged from the row above), or take item i (answer is item i\'s value plus the best you could do with the remaining capacity: dp[i-1][w-weight[i]]). The table encodes every possible decision sequence simultaneously.',
      '**0/1 Knapsack: each item used at most once.** Row 0 = no items (all zeros). Column 0 = zero capacity (always zero). For item i at capacity w: if weight[i] > w, the item doesn\'t fit — copy from dp[i-1][w]. Otherwise take the max of skip and take. The "i-1" in both branches is critical: you look at the previous row, so item i can only appear once. Fill row by row, left to right. Answer is dp[n][W].',
      '**Coin Change: minimize instead of maximize.** Coin Change is unbounded knapsack with minimization. dp[amount] = minimum coins to make that amount. Base: dp[0]=0, rest=Infinity. For each coin denomination, sweep amounts forward: dp[w] = min(dp[w], dp[w-coin]+1). "Forward" sweep means the same coin can be reused — unbounded. The answer is dp[amount], or -1 if still Infinity.',
      '**Coin Change II: count ways.** dp[w] = number of combinations of coins that sum to w. Base: dp[0]=1 (one way to reach zero: use nothing). Outer loop is coins, inner loop is amounts (forward). This order ensures each combination is counted once regardless of order — not once per permutation. If you swapped the loops (amounts outer, coins inner), you would count permutations instead.',
      '**Space optimization: 1D.** The 0/1 knapsack table only reads from the previous row. Replace with a 1D array and sweep weights high-to-low (reverse). If you go forward, dp[w-wt] was already updated in this pass — you\'d use item i twice. Reverse sweep ensures dp[w-wt] still holds the value from the previous row (before item i was considered). For unbounded (coin change), sweep forward: you want to reuse.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 1, Lesson 5: Knapsack DP',
        body: '**Previous:** Sequence DP — LCS, Edit Distance, LIS.\n**This lesson:** Knapsack — 0/1, Coin Change, Coin Change II, Subset Sum.\n**Next:** Interval DP — Matrix Chain, Burst Balloons, Palindrome Partitioning.',
      },
      {
        type: 'insight',
        title: 'One pattern, many problems',
        body: 'Coin Change, Coin Change II, Subset Sum, Partition Equal Subset Sum, Rod Cutting, Perfect Squares — all knapsack variants. The outer loop iterates items (or coins). The inner loop iterates capacity (or amount). The operation changes: maximize, minimize, count, or check feasibility. Recognize the frame and you recognize the whole family.',
      },
      {
        type: 'strategy',
        title: 'Forward vs reverse inner loop',
        body: 'In 1D: sweep weights **high-to-low** for 0/1 knapsack (each item once). Sweep **low-to-high** for unbounded (items reusable). Getting this backwards is a silent bug — code runs, gives wrong answers. Ask yourself: can items repeat? No → reverse. Yes → forward.',
      },
      {
        type: 'warning',
        title: 'Why greedy fails for Coin Change',
        body: 'Coins [1, 5, 6], amount 10. Greedy picks 6+1+1+1+1 = 5 coins. DP finds 5+5 = 2 coins. A locally optimal choice (largest coin that fits) blocks the globally optimal combination. DP considers every coin at every amount. This is the textbook example of why greedy needs a proof — and DP is the safe fallback when that proof doesn\'t exist.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Step Through the Knapsack and Coin Change Tables',
        caption: 'Use Prev / Play / Next to fill the table one cell at a time. Each step shows the formula being evaluated and highlights the source cells it reads from.',
        props: {
          lesson: {
            title: 'Knapsack DP — Interactive Step-Through',
            subtitle: 'Watch each cell decide: skip or take? Then watch Coin Change minimize one amount at a time.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: '0/1 Knapsack — Step Through the Table',
                instruction: 'Press Next to fill one cell. Yellow = current cell being computed. Red = dp[i-1][w] (skip source). Green = dp[i-1][w-wt] (take source). Blue cells took the item. The info bar shows the full recurrence being evaluated.',
                html: `<div style="font-family:monospace;font-size:12px;display:flex;flex-direction:column;height:100%">
  <div style="background:#1e293b;border-bottom:1px solid #334155;padding:8px 12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <button id="rst"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">↺ Reset</button>
    <button id="prev" style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">← Prev</button>
    <button id="play" style="background:#1d4ed8;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">▶ Play</button>
    <button id="nxt"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">Next →</button>
    <span id="ctr" style="color:#64748b;font-size:11px;margin-left:4px">Ready — press Next or Play</span>
  </div>
  <div id="info" style="padding:8px 12px;background:#0f172a;font-size:11px;min-height:36px;border-bottom:1px solid #1e293b"></div>
  <div id="tbl" style="padding:10px 12px;overflow:auto;flex:1"></div>
</div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const ITEMS = [
  { name: "Ruby",    weight: 2, value: 6 },
  { name: "Diamond", weight: 3, value: 9 },
  { name: "Gold",    weight: 4, value: 5 },
  { name: "Silver",  weight: 1, value: 3 },
  { name: "Emerald", weight: 3, value: 7 },
];
const W = 8, N = ITEMS.length;

const dp   = Array.from({ length: N + 1 }, () => new Array(W + 1).fill(0));
const took = Array.from({ length: N + 1 }, () => new Array(W + 1).fill(false));
for (let i = 1; i <= N; i++) {
  const { weight: wt, value: val } = ITEMS[i - 1];
  for (let w = 0; w <= W; w++) {
    const skip = dp[i-1][w];
    const take = wt <= w ? val + dp[i-1][w - wt] : -1;
    dp[i][w] = take > skip ? take : skip;
    took[i][w] = take > skip;
  }
}

const TOTAL = N * (W + 1);
let step = -1, timer = null;

function cell(s) { return { i: Math.floor(s / (W+1)) + 1, w: s % (W+1) }; }

function render() {
  const cur = (step >= 0 && step < TOTAL) ? cell(step) : null;
  const ctr = document.getElementById("ctr");
  const info = document.getElementById("info");
  const tbl  = document.getElementById("tbl");

  ctr.textContent = step < 0 ? "Base cases ready" :
    step >= TOTAL ? "Complete! (" + TOTAL + "/" + TOTAL + ")" :
    "Step " + (step + 1) + " / " + TOTAL;

  if (!cur) {
    if (step < 0) {
      info.innerHTML = "<span style='color:#94a3b8'>Row 0 = no items. dp[0][w] = 0 for all w. Press Next to start.</span>";
    } else {
      const sel = []; let w = W;
      for (let i = N; i >= 1; i--) { if (took[i][w]) { sel.push(ITEMS[i-1].name); w -= ITEMS[i-1].weight; } }
      info.innerHTML = "<span style='color:#4ade80'>Done! Max value = <b>" + dp[N][W] + "</b> — Items: " + sel.join(", ") + "</span>";
    }
  } else {
    const { i, w } = cur;
    const it = ITEMS[i - 1];
    const skip = dp[i-1][w];
    if (it.weight > w) {
      info.innerHTML = "<b style='color:#fbbf24'>Item " + i + " [" + it.name + " wt=" + it.weight + "]</b>" +
        " is too heavy for w=" + w + ". dp[" + i + "][" + w + "] = dp[" + (i-1) + "][" + w + "] = " +
        "<b style='color:#fca5a5'>" + skip + "</b> (forced skip)";
    } else {
      const take = it.value + dp[i-1][w - it.weight];
      const choice = took[i][w] ? "TAKE" : "SKIP";
      const choiceColor = took[i][w] ? "#4ade80" : "#fca5a5";
      info.innerHTML = "<b style='color:#fbbf24'>Item " + i + " [" + it.name + " wt=" + it.weight + " val=" + it.value + "]</b>" +
        " at w=" + w + " — skip=<b style='color:#fca5a5'>" + skip + "</b>" +
        "  take=" + it.value + "+dp[" + (i-1) + "][" + (w - it.weight) + "]=<b style='color:#4ade80'>" + take + "</b>" +
        "  → <b style='color:" + choiceColor + "'>" + choice + " (" + dp[i][w] + ")</b>";
    }
  }

  let h = "<table style='border-collapse:collapse'>";
  h += "<tr><td style='width:74px;height:24px;color:#475569;font-size:10px'>item \\ cap</td>";
  for (let w2 = 0; w2 <= W; w2++)
    h += "<td style='width:34px;height:24px;text-align:center;color:#475569;font-size:10px'>w=" + w2 + "</td>";
  h += "</tr>";

  for (let i2 = 0; i2 <= N; i2++) {
    const lbl = i2 === 0 ? "— none" : i2 + ". " + ITEMS[i2-1].name.slice(0,4);
    h += "<tr><td style='color:#64748b;font-size:10px;padding-right:4px;white-space:nowrap'>" + lbl + "</td>";
    for (let w2 = 0; w2 <= W; w2++) {
      const isCur  = cur && cur.i === i2 && cur.w === w2;
      const isSkip = cur && i2 === cur.i - 1 && w2 === cur.w;
      const isTake = cur && took[cur.i] && took[cur.i][cur.w] &&
                     ITEMS[cur.i-1].weight <= cur.w &&
                     i2 === cur.i - 1 && w2 === cur.w - ITEMS[cur.i-1].weight;
      const seq    = i2 === 0 ? -1 : (i2 - 1) * (W + 1) + w2;
      const filled = i2 === 0 || step >= TOTAL || (step >= 0 && seq < step);

      let bg = "#1e293b", fc = "#475569", txt = filled ? String(dp[i2][w2]) : "·";
      if (i2 === 0)   { bg = "#0f2231"; fc = "#475569"; txt = "0"; }
      if (isCur)      { bg = "#92400e"; fc = "#fef3c7"; }
      else if (isTake){ bg = "#14532d"; fc = "#86efac"; }
      else if (isSkip){ bg = "#7f1d1d"; fc = "#fca5a5"; }
      else if (filled && took[i2][w2]) { bg = "#1e3a5f"; fc = "#93c5fd"; }

      const brd = isCur ? "2px solid #f59e0b" : (isTake || isSkip) ? "2px solid #334155" : "1px solid #1e293b";
      h += "<td style='width:34px;height:30px;text-align:center;border:" + brd + ";background:" + bg + ";color:" + fc + ";font-weight:bold;font-size:11px'>" + txt + "</td>";
    }
    h += "</tr>";
  }
  h += "</table>";
  tbl.innerHTML = h;
}

document.getElementById("nxt").onclick  = () => { if (step < TOTAL) { step++; render(); } };
document.getElementById("prev").onclick = () => { if (step > -1)    { step--; render(); } };
document.getElementById("rst").onclick  = () => {
  if (timer) { clearInterval(timer); timer = null; document.getElementById("play").textContent = "▶ Play"; }
  step = -1; render();
};
document.getElementById("play").onclick = function() {
  if (timer) { clearInterval(timer); timer = null; this.textContent = "▶ Play"; return; }
  this.textContent = "⏸ Pause";
  timer = setInterval(() => {
    if (step >= TOTAL) { clearInterval(timer); timer = null; document.getElementById("play").textContent = "▶ Play"; return; }
    step++; render();
  }, 180);
};
render();`,
                outputHeight: 440,
              },
              {
                type: 'js',
                title: 'Coin Change — Step Through the 1D Array',
                instruction: 'Each coin sweeps all amounts from coin to target. Orange bar = currently updating. Red = source cell (dp[w-coin]). The formula shows exactly what is happening at each update. Watch how smaller denominations "fill in" amounts that larger coins can\'t reach.',
                html: `<div style="font-family:monospace;font-size:12px;display:flex;flex-direction:column;height:100%">
  <div style="background:#1e293b;border-bottom:1px solid #334155;padding:8px 12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <button id="rst"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">↺ Reset</button>
    <button id="prev" style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">← Prev</button>
    <button id="play" style="background:#1d4ed8;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">▶ Play</button>
    <button id="nxt"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">Next →</button>
    <span id="ctr" style="color:#64748b;font-size:11px;margin-left:4px">Ready</span>
  </div>
  <div id="info" style="padding:8px 12px;background:#0f172a;font-size:11px;min-height:36px;border-bottom:1px solid #1e293b"></div>
  <div id="bars" style="padding:16px 12px;overflow:auto;flex:1"></div>
</div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const COINS  = [1, 5, 6, 9];
const AMOUNT = 15;

const INF = 999;
const snapshots = [];
const stepMeta  = [];

let cur = new Array(AMOUNT + 1).fill(INF);
cur[0] = 0;
snapshots.push(cur.slice());
stepMeta.push({ type: "init" });

for (let ci = 0; ci < COINS.length; ci++) {
  const coin = COINS[ci];
  for (let w = coin; w <= AMOUNT; w++) {
    const prev = cur.slice();
    const candidate = cur[w - coin] + 1;
    if (candidate < cur[w]) { cur[w] = candidate; }
    snapshots.push(cur.slice());
    stepMeta.push({ type: "update", coin, w, src: w - coin, improved: candidate < prev[w], before: prev[w], after: cur[w] });
  }
}

const TOTAL = snapshots.length - 1;
let step = 0, timer = null;

function render() {
  const snap = snapshots[step];
  const meta = stepMeta[step];
  const ctr  = document.getElementById("ctr");
  const info = document.getElementById("info");
  const bars = document.getElementById("bars");

  ctr.textContent = step === 0 ? "Initialized" : "Step " + step + " / " + TOTAL;

  if (meta.type === "init") {
    info.innerHTML = "<span style='color:#94a3b8'>dp[0]=0 (make amount 0 with 0 coins). All other dp[w]=Infinity (not yet reachable).</span>";
  } else {
    const { coin, w, src, improved, before, after } = meta;
    const srcVal = snap[src] === INF ? "Inf" : snap[src];
    const candStr = srcVal === "Inf" ? "Inf" : (snap[src] + 1);
    const beforeStr = before === INF ? "Inf" : before;
    const afterStr  = after  === INF ? "Inf" : after;
    if (improved) {
      info.innerHTML = "Coin <b style='color:#60a5fa'>" + coin + "</b> at w=<b>" + w + "</b>: " +
        "dp[" + src + "]+1=<b style='color:#4ade80'>" + candStr + "</b> &lt; " + beforeStr +
        " → update dp[" + w + "] = <b style='color:#f59e0b'>" + afterStr + "</b>";
    } else {
      info.innerHTML = "Coin <b style='color:#60a5fa'>" + coin + "</b> at w=<b>" + w + "</b>: " +
        "dp[" + src + "]+1=" + candStr + " ≥ " + beforeStr + " → no improvement, keep <b>" + afterStr + "</b>";
    }
  }

  const curW   = meta.type === "update" ? meta.w : -1;
  const srcW   = meta.type === "update" ? meta.src : -1;
  const maxH   = 100;
  const finite = snap.filter(v => v < INF);
  const maxVal = finite.length ? Math.max(...finite) : 1;

  let h = "<div style='display:flex;align-items:flex-end;gap:4px;margin-bottom:12px;height:" + (maxH + 44) + "px'>";
  for (let w2 = 0; w2 <= AMOUNT; w2++) {
    const val = snap[w2];
    const isInf = val >= INF;
    const isCur = w2 === curW;
    const isSrc = w2 === srcW;
    const isCoin = COINS.includes(w2);
    const isAns  = w2 === AMOUNT && step === TOTAL;
    const bh     = isInf ? 12 : Math.max(8, Math.round((val / maxVal) * maxH));
    let bg = isCoin ? "#1e3a5f" : "#1e293b";
    if (isCur && meta.improved) bg = "#92400e";
    else if (isCur) bg = "#374151";
    if (isSrc) bg = "#14532d";
    if (isAns) bg = "#f59e0b";
    h += "<div style='display:flex;flex-direction:column;align-items:center;gap:2px'>";
    h += "<div style='font-size:9px;color:" + (isCur ? "#fbbf24" : isSrc ? "#4ade80" : "#64748b") + "'>" + (isInf ? "∞" : val) + "</div>";
    h += "<div style='width:22px;height:" + bh + "px;background:" + bg + ";border-radius:2px 2px 0 0" + (isInf ? ";opacity:0.3" : "") + "'></div>";
    h += "<div style='font-size:9px;color:" + (isCoin ? "#60a5fa" : "#475569") + "'>" + w2 + "</div>";
    h += "</div>";
  }
  h += "</div>";
  h += "<div style='font-size:10px;color:#475569'>Blue labels = coin denominations | Orange = current | Green = source cell</div>";
  bars.innerHTML = h;
}

document.getElementById("nxt").onclick  = () => { if (step < TOTAL) { step++; render(); } };
document.getElementById("prev").onclick = () => { if (step > 0)    { step--; render(); } };
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
  }, 120);
};
render();`,
                outputHeight: 360,
              },
              {
                type: 'js',
                title: 'Coin Change II — Count Ways, Watch the Table Build',
                instruction: 'Outer loop = coins. Inner loop = amounts. Each step shows one dp[w] += dp[w-coin] update. The table snapshot row is added after each full coin sweep. Notice how the count at each amount accumulates — multiple coins contribute independently.',
                html: `<div style="font-family:monospace;font-size:12px;display:flex;flex-direction:column;height:100%">
  <div style="background:#1e293b;border-bottom:1px solid #334155;padding:8px 12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <button id="rst"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">↺ Reset</button>
    <button id="prev" style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">← Prev</button>
    <button id="play" style="background:#1d4ed8;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px">▶ Play</button>
    <button id="nxt"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">Next →</button>
    <span id="ctr" style="color:#64748b;font-size:11px;margin-left:4px">Ready</span>
  </div>
  <div id="info" style="padding:8px 12px;background:#0f172a;font-size:11px;min-height:36px;border-bottom:1px solid #1e293b"></div>
  <div id="out" style="padding:10px 12px;overflow:auto;flex:1"></div>
</div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const COINS  = [1, 2, 5];
const AMOUNT = 8;

const snaps = [], meta = [];
let dp = new Array(AMOUNT + 1).fill(0);
dp[0] = 1;
snaps.push({ dp: dp.slice(), coin: null, w: null, delta: null });

for (const coin of COINS) {
  for (let w = coin; w <= AMOUNT; w++) {
    const before = dp[w];
    dp[w] += dp[w - coin];
    snaps.push({ dp: dp.slice(), coin, w, src: w - coin, before, after: dp[w], delta: dp[w - coin] });
  }
}

const TOTAL = snaps.length - 1;
let step = 0, timer = null;

function render() {
  const { dp: d, coin, w, src, before, after, delta } = snaps[step];
  const ctr  = document.getElementById("ctr");
  const info = document.getElementById("info");
  const out  = document.getElementById("out");

  ctr.textContent = step === 0 ? "Initialized" : "Step " + step + " / " + TOTAL;

  if (step === 0) {
    info.innerHTML = "<span style='color:#94a3b8'>dp[0]=1 (one way to make 0: use nothing). All others = 0.</span>";
  } else {
    info.innerHTML = "Coin <b style='color:#60a5fa'>" + coin + "</b> at w=<b>" + w + "</b>: " +
      "dp[" + w + "] += dp[" + src + "] = " + before + " + " + delta + " = <b style='color:#f59e0b'>" + after + "</b>";
  }

  const maxVal = Math.max(...d, 1);
  const barH = 80;
  let h = "<div style='display:flex;align-items:flex-end;gap:5px;margin-bottom:10px;height:" + (barH + 44) + "px'>";
  for (let w2 = 0; w2 <= AMOUNT; w2++) {
    const val = d[w2];
    const isCur = w2 === w && step > 0;
    const isSrc = w2 === src && step > 0;
    const isAns = w2 === AMOUNT && step === TOTAL;
    const bh    = Math.max(4, Math.round((val / maxVal) * barH));
    let bg = "#1e293b";
    if (isAns) bg = "#f59e0b";
    else if (isCur) bg = "#92400e";
    else if (isSrc) bg = "#14532d";
    else if (val > 0) bg = "#1e3a5f";
    h += "<div style='display:flex;flex-direction:column;align-items:center;gap:2px'>";
    h += "<div style='font-size:10px;color:" + (isCur ? "#fbbf24" : isSrc ? "#4ade80" : "#94a3b8") + "'>" + val + "</div>";
    h += "<div style='width:28px;height:" + bh + "px;background:" + bg + ";border-radius:2px 2px 0 0'></div>";
    h += "<div style='font-size:10px;color:#475569'>" + w2 + "</div>";
    h += "</div>";
  }
  h += "</div>";

  if (step === TOTAL) {
    h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b'>Ways to make " + AMOUNT + " = <b>" + d[AMOUNT] + "</b></div>";
  }
  out.innerHTML = h;
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
  }, 150);
};
render();`,
                outputHeight: 340,
              },
              {
                type: 'js',
                title: 'Knapsack Traceback — Which Items Were Selected?',
                instruction: 'After the table is complete, step backward from dp[n][W] to dp[0][0]. At each row: if took[i][w] is true, item i was selected — subtract its weight and move up. Otherwise skip it and move up. Step through to see the path unfold.',
                html: `<div style="font-family:monospace;font-size:12px;display:flex;flex-direction:column;height:100%">
  <div style="background:#1e293b;border-bottom:1px solid #334155;padding:8px 12px;display:flex;align-items:center;gap:8px">
    <button id="rst"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">↺ Reset</button>
    <button id="prev" style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">← Prev</button>
    <button id="nxt"  style="background:#374151;color:#e2e8f0;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px">Next →</button>
    <span id="ctr" style="color:#64748b;font-size:11px;margin-left:4px"></span>
  </div>
  <div id="info" style="padding:8px 12px;background:#0f172a;font-size:11px;min-height:36px;border-bottom:1px solid #1e293b"></div>
  <div id="tbl" style="padding:10px 12px;overflow:auto;flex:1"></div>
</div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const ITEMS = [
  { name: "Ruby",    weight: 2, value: 6 },
  { name: "Diamond", weight: 3, value: 9 },
  { name: "Gold",    weight: 4, value: 5 },
  { name: "Silver",  weight: 1, value: 3 },
  { name: "Emerald", weight: 3, value: 7 },
];
const W = 8, N = ITEMS.length;

const dp   = Array.from({ length: N + 1 }, () => new Array(W + 1).fill(0));
const took = Array.from({ length: N + 1 }, () => new Array(W + 1).fill(false));
for (let i = 1; i <= N; i++) {
  const { weight: wt, value: val } = ITEMS[i - 1];
  for (let w = 0; w <= W; w++) {
    const skip = dp[i-1][w];
    const take = wt <= w ? val + dp[i-1][w - wt] : -1;
    dp[i][w] = take > skip ? take : skip;
    took[i][w] = take > skip;
  }
}

// Build traceback steps
const tbSteps = [];
let wi = W;
for (let i = N; i >= 1; i--) {
  const action = took[i][wi] ? "take" : "skip";
  tbSteps.push({ i, w: wi, action, item: ITEMS[i-1] });
  if (took[i][wi]) wi -= ITEMS[i-1].weight;
}
const TOTAL = tbSteps.length;
let step = 0;

const selected = new Set();
const visited  = new Set();

function render() {
  const ctr  = document.getElementById("ctr");
  const info = document.getElementById("info");
  const tbl  = document.getElementById("tbl");

  ctr.textContent = "Traceback step " + step + " / " + TOTAL;

  if (step === 0) {
    info.innerHTML = "<span style='color:#94a3b8'>Starting at dp[" + N + "][" + W + "] = " + dp[N][W] + ". We will walk up row by row.</span>";
  } else if (step <= tbSteps.length) {
    const { i, w, action, item } = tbSteps[step - 1];
    if (action === "take") {
      info.innerHTML = "Row " + i + " [" + item.name + " wt=" + item.weight + "]: " +
        "<b style='color:#4ade80'>TAKE</b> — took[" + i + "][" + w + "] is true. " +
        "Subtract weight: remaining capacity = " + w + " - " + item.weight + " = " + (w - item.weight);
    } else {
      info.innerHTML = "Row " + i + " [" + item.name + "]: " +
        "<b style='color:#fca5a5'>SKIP</b> — took[" + i + "][" + w + "] is false. Capacity stays at " + w;
    }
  }

  selected.clear(); visited.clear();
  let cw = W;
  for (let s = 0; s < step && s < tbSteps.length; s++) {
    const { i, w, action } = tbSteps[s];
    visited.add(i + "," + w);
    if (action === "take") { selected.add(i); cw -= tbSteps[s].item.weight; }
  }

  let h = "<table style='border-collapse:collapse'>";
  h += "<tr><td style='width:74px;height:24px;color:#475569;font-size:10px'>item \\ cap</td>";
  for (let w2 = 0; w2 <= W; w2++)
    h += "<td style='width:34px;height:24px;text-align:center;color:" + (w2 === W ? "#f59e0b" : "#475569") + ";font-size:10px'>" + w2 + "</td>";
  h += "</tr>";

  for (let i2 = 0; i2 <= N; i2++) {
    const lbl = i2 === 0 ? "— none" : i2 + ". " + ITEMS[i2-1].name.slice(0,4);
    const isSel = selected.has(i2);
    h += "<tr><td style='color:" + (isSel ? "#4ade80" : "#64748b") + ";font-size:10px;padding-right:4px;white-space:nowrap'>" + lbl + (isSel ? " ✓" : "") + "</td>";
    for (let w2 = 0; w2 <= W; w2++) {
      const isVis = visited.has(i2 + "," + w2);
      const isTook = took[i2][w2];
      let bg = "#1e293b", fc = "#475569";
      if (i2 === 0) { bg = "#0f2231"; fc = "#334155"; }
      else if (isVis && isTook) { bg = "#166534"; fc = "#4ade80"; }
      else if (isVis) { bg = "#4a1d96"; fc = "#c4b5fd"; }
      else if (isTook) { bg = "#1e3a5f"; fc = "#475569"; }
      const brd = isVis ? "2px solid #f59e0b" : "1px solid #1e293b";
      h += "<td style='width:34px;height:30px;text-align:center;border:" + brd + ";background:" + bg + ";color:" + fc + ";font-weight:bold;font-size:11px'>" + dp[i2][w2] + "</td>";
    }
    h += "</tr>";
  }
  h += "</table>";

  if (step === TOTAL) {
    const sel = tbSteps.filter(s => s.action === "take").map(s => s.item.name);
    h += "<div style='margin-top:10px;background:#1e293b;border-radius:6px;padding:8px 12px;color:#4ade80'>Selected: <b>" + sel.join(", ") + "</b> — total value: " + dp[N][W] + "</div>";
  }
  tbl.innerHTML = h;
}

document.getElementById("nxt").onclick  = () => { if (step <= TOTAL) { step++; render(); } };
document.getElementById("prev").onclick = () => { if (step > 0) { step--; render(); } };
document.getElementById("rst").onclick  = () => { step = 0; render(); };
render();`,
                outputHeight: 440,
              },
            ],
          },
        },
      },
      {
        id: 'JSNotebook',
        title: 'Knapsack DP in JavaScript — Guided Exercises',
        caption: 'The outer loops are written. Your job: fill in the one or two recurrence lines. Each exercise has a worked trace in the instructions.',
        props: {
          lesson: {
            title: 'Knapsack DP in JavaScript',
            subtitle: 'Fill in the recurrence. The structure is given — you write the math.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — 0/1 Knapsack

The table and both loops are written. Fill in the **take** value (one expression).

**Trace for items=[{wt:2,val:6},{wt:3,val:9}], W=5:**
\`\`\`
i=1 (Ruby wt=2 val=6):
  w=0: wt>w → skip only → dp[1][0]=0
  w=1: wt>w → skip only → dp[1][1]=0
  w=2: skip=dp[0][2]=0, take=6+dp[0][0]=6 → TAKE → dp[1][2]=6
  w=3: skip=0, take=6+dp[0][1]=6 → TAKE → dp[1][3]=6
  ...
i=2 (Diamond wt=3 val=9):
  w=3: skip=dp[1][3]=6, take=9+dp[1][0]=9 → TAKE → dp[2][3]=9
  w=5: skip=dp[1][5]=6, take=9+dp[1][2]=9+6=15 → TAKE → dp[2][5]=15
\`\`\`
Answer: dp[n][W] = 15.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const wt  = weights[i - 1];
    const val = values[i - 1];
    for (let w = 0; w <= W; w++) {
      const skip = dp[i-1][w];
      // If wt <= w, we can take item i.
      // take = val + dp[i-1][w - wt]
      // If wt > w, item doesn't fit — set take = 0 so skip always wins.
      const take = /* TODO: wt <= w ? val + dp[i-1][w - wt] : 0 */ 0;
      dp[i][w] = Math.max(skip, take);
    }
  }
  return dp[n][W];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("basic W=5",      knapsack([1,3,4,5], [1,4,5,7], 5),     9);
check("capacity 0",     knapsack([1,2,3], [10,20,30], 0),       0);
check("all too heavy",  knapsack([5,6,7], [10,20,30], 4),       0);
check("exact fit",      knapsack([2,3,4], [3,4,5], 5),          7);
check("museum W=8",     knapsack([2,3,4,1,3], [6,9,5,3,7], 8), 25);`,
                solutionCode: `function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const wt  = weights[i - 1];
    const val = values[i - 1];
    for (let w = 0; w <= W; w++) {
      const skip = dp[i-1][w];
      const take = wt <= w ? val + dp[i-1][w - wt] : 0;
      dp[i][w] = Math.max(skip, take);
    }
  }
  return dp[n][W];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("basic W=5",      knapsack([1,3,4,5], [1,4,5,7], 5),     9);
check("capacity 0",     knapsack([1,2,3], [10,20,30], 0),       0);
check("all too heavy",  knapsack([5,6,7], [10,20,30], 4),       0);
check("exact fit",      knapsack([2,3,4], [3,4,5], 5),          7);
check("museum W=8",     knapsack([2,3,4,1,3], [6,9,5,3,7], 8), 25);`,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Coin Change (Minimum Coins)

Both loops are written. Fill in **one line**: the update inside the inner loop.

**Trace for coins=[1,5,6,9], amount=11:**
\`\`\`
Start: dp=[0,Inf,Inf,Inf,Inf,Inf,Inf,Inf,Inf,Inf,Inf,Inf]

coin=1:
  w=1:  dp[0]+1=1  < Inf → dp[1]=1
  w=2:  dp[1]+1=2  < Inf → dp[2]=2
  ...
  w=11: dp[10]+1=11 < Inf → dp[11]=11

coin=5:
  w=5:  dp[0]+1=1  < 5  → dp[5]=1
  w=6:  dp[1]+1=2  < 6  → dp[6]=2
  ...
  w=11: dp[6]+1=3  < 11 → dp[11]=3  (5+6 not better yet)

coin=6:
  w=6:  dp[0]+1=1  < 2  → dp[6]=1
  w=11: dp[5]+1=2  < 3  → dp[11]=2  ← ANSWER (5+6)
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (const coin of coins) {
    for (let w = coin; w <= amount; w++) {
      // candidate = dp[w - coin] + 1
      // if candidate is better (smaller), update dp[w]
      // TODO: dp[w] = Math.min(dp[w], dp[w - coin] + 1)
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[1,5,6,9] -> 11",  coinChange([1,5,6,9], 11),  2);
check("[1,2,5] -> 11",    coinChange([1,2,5], 11),     3);
check("[2] -> 3",         coinChange([2], 3),          -1);
check("[1] -> 0",         coinChange([1], 0),           0);
check("[2,5,10] -> 27",   coinChange([2,5,10], 27),     4);`,
                solutionCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (const coin of coins) {
    for (let w = coin; w <= amount; w++) {
      dp[w] = Math.min(dp[w], dp[w - coin] + 1);
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[1,5,6,9] -> 11",  coinChange([1,5,6,9], 11),  2);
check("[1,2,5] -> 11",    coinChange([1,2,5], 11),     3);
check("[2] -> 3",         coinChange([2], 3),          -1);
check("[1] -> 0",         coinChange([1], 0),           0);
check("[2,5,10] -> 27",   coinChange([2,5,10], 27),     4);`,
              },
              {
                type: 'js',
                instruction: `## Step 3 — Coin Change II (Count Ways)

Fill in the single update line. Note the loop order: **coins outer, amounts inner**. This is what makes it count combinations (not permutations).

**Trace for coins=[1,2,5], amount=5:**
\`\`\`
Start: dp=[1,0,0,0,0,0]

After coin=1: dp=[1,1,1,1,1,1]
  (every amount reachable with 1-coins)

After coin=2: dp=[1,1,2,2,3,3]
  w=2: dp[2] += dp[0] → 1+1=2
  w=3: dp[3] += dp[1] → 1+1=2
  w=4: dp[4] += dp[2] → 1+2=3
  w=5: dp[5] += dp[3] → 1+2=3

After coin=5: dp=[1,1,2,2,3,4]
  w=5: dp[5] += dp[0] → 3+1=4  ← ANSWER
\`\`\`
The 4 ways: {1×5}, {1×3+2×1}, {1×1+2×2}, {5×1}.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1; // one way to make 0: use nothing

  for (const coin of coins) {       // outer: coins
    for (let w = coin; w <= amount; w++) { // inner: amounts (forward = reuse)
      // Each way to make (w - coin) can be extended by adding this coin once
      // TODO: dp[w] += dp[w - coin]
    }
  }

  return dp[amount];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("amount=5  coins=[1,2,5]",  change(5,  [1,2,5]),   4);
check("amount=3  coins=[2]",      change(3,  [2]),        0);
check("amount=10 coins=[10]",     change(10, [10]),       1);
check("amount=0  coins=[1,2,3]",  change(0,  [1,2,3]),   1);
check("amount=10 coins=[1,2,5]",  change(10, [1,2,5]),  10);`,
                solutionCode: `function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;

  for (const coin of coins) {
    for (let w = coin; w <= amount; w++) {
      dp[w] += dp[w - coin];
    }
  }

  return dp[amount];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("amount=5  coins=[1,2,5]",  change(5,  [1,2,5]),   4);
check("amount=3  coins=[2]",      change(3,  [2]),        0);
check("amount=10 coins=[10]",     change(10, [10]),       1);
check("amount=0  coins=[1,2,3]",  change(0,  [1,2,3]),   1);
check("amount=10 coins=[1,2,5]",  change(10, [1,2,5]),  10);`,
              },
              {
                type: 'js',
                instruction: `## Step 4 — Partition Equal Subset Sum

Can you split nums into two subsets with equal sum?

**Strategy:** If total sum is odd → impossible. Otherwise target = sum/2. Boolean knapsack: dp[w] = can we hit exactly weight w using some subset?

**Key:** Reverse inner loop (0/1 — each number used once). dp[w] = dp[w] || dp[w - num].

**Trace for [1,5,5,11]:** total=22, target=11.
\`\`\`
Start: dp[0]=true, rest=false
Add 1:  dp[1]=true
Add 5:  dp[5]=dp[6]=true
Add 5:  dp[10]=dp[11]=true  ← dp[11] is true → POSSIBLE
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;

  const dp = new Array(target + 1).fill(false);
  dp[0] = true; // can always make 0 (empty subset)

  for (const num of nums) {
    // Reverse loop: 0/1 — each number used at most once
    for (let w = target; w >= num; w--) {
      // dp[w] is reachable if it was already reachable,
      // OR if dp[w - num] was reachable (extend that subset with num)
      // TODO: dp[w] = dp[w] || dp[w - num]
    }
  }

  return dp[target];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[1,5,11,5]",   canPartition([1,5,11,5]),   true);
check("[1,2,3,5]",    canPartition([1,2,3,5]),     false);
check("[1,1]",        canPartition([1,1]),          true);
check("[1,2,5]",      canPartition([1,2,5]),        false);
check("[3,3,3,4,5]",  canPartition([3,3,3,4,5]),   true);`,
                solutionCode: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;

  const dp = new Array(target + 1).fill(false);
  dp[0] = true;

  for (const num of nums) {
    for (let w = target; w >= num; w--) {
      dp[w] = dp[w] || dp[w - num];
    }
  }

  return dp[target];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok ? "pass" : "fail") + "'>" + (ok ? "PASS" : "FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[1,5,11,5]",   canPartition([1,5,11,5]),   true);
check("[1,2,3,5]",    canPartition([1,2,3,5]),     false);
check("[1,1]",        canPartition([1,1]),          true);
check("[1,2,5]",      canPartition([1,2,5]),        false);
check("[3,3,3,4,5]",  canPartition([3,3,3,4,5]),   true);`,
              },
            ],
          },
        },
      },
      {
        id: 'PythonNotebook',
        title: 'Knapsack DP in Python',
        caption: 'Heatmap the table, compare DP vs greedy on coin change, and build the boolean knapsack.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: '0/1 Knapsack heatmap with traceback',
              code: `import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

items = [
    {"name": "Ruby",    "weight": 2, "value": 6},
    {"name": "Diamond", "weight": 3, "value": 9},
    {"name": "Gold",    "weight": 4, "value": 5},
    {"name": "Silver",  "weight": 1, "value": 3},
    {"name": "Emerald", "weight": 3, "value": 7},
]
W, n = 8, len(items)

dp   = [[0] * (W + 1) for _ in range(n + 1)]
took = [[False] * (W + 1) for _ in range(n + 1)]

for i in range(1, n + 1):
    wt, val = items[i-1]["weight"], items[i-1]["value"]
    for w in range(W + 1):
        skip = dp[i-1][w]
        take = val + dp[i-1][w-wt] if wt <= w else -1
        dp[i][w] = take if take > skip else skip
        took[i][w] = take > skip

path, selected = set(), []
w = W
for i in range(n, 0, -1):
    path.add((i, w))
    if took[i][w]:
        selected.append(items[i-1]["name"])
        w -= items[i-1]["weight"]
selected.reverse()

fig, ax = plt.subplots(figsize=(13, 7))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

maxval = dp[n][W] or 1
for i2 in range(n + 1):
    for w2 in range(W + 1):
        val = dp[i2][w2]
        on_path = (i2, w2) in path
        is_took = took[i2][w2]
        norm = val / maxval

        if i2 == n and w2 == W:                  bg = "#f59e0b"
        elif on_path and is_took:                 bg = "#166534"
        elif on_path:                             bg = "#4a1d96"
        elif is_took:
            r = int(15 + norm * 20)
            g = int(58 + norm * 82)
            b = int(130 + norm * 100)
            bg = f"#{r:02x}{g:02x}{b:02x}"
        elif i2 == 0:                             bg = "#0f2231"
        else:                                     bg = "#1e293b"

        rect = plt.Rectangle([w2 - 0.5, (n - i2) - 0.5], 1, 1, color=bg)
        ax.add_patch(rect)
        if on_path:
            ax.add_patch(plt.Rectangle([w2 - 0.5, (n - i2) - 0.5], 1, 1,
                                       fill=False, edgecolor="#f59e0b", linewidth=2))
        fc = "#0f172a" if (i2 == n and w2 == W) else "white"
        ax.text(w2, n - i2, str(val), ha="center", va="center",
                color=fc, fontsize=10, fontweight="bold", fontfamily="monospace")

ax.set_xlim(-0.5, W + 0.5); ax.set_ylim(-0.5, n + 0.5)
ax.set_xticks(range(W + 1))
ax.set_xticklabels([f"w={w}" for w in range(W + 1)], color="#94a3b8", fontsize=9)
ax.set_yticks(range(n + 1))
ax.set_yticklabels(["none"] + [f"{i+1}.{items[i]['name'][:4]}" for i in range(n-1,-1,-1)],
                   color="#94a3b8", fontsize=9)
for sp in ax.spines.values(): sp.set_edgecolor("#334155")
ax.set_title(f"0/1 Knapsack  |  Max value = {dp[n][W]}  |  Selected: {', '.join(selected)}",
             color="#60a5fa", fontsize=12, pad=12)
ax.legend(handles=[
    mpatches.Patch(color="#166534", label="Taken (on path)"),
    mpatches.Patch(color="#4a1d96", label="Skipped (on path)"),
    mpatches.Patch(color="#f59e0b", label="Answer dp[n][W]"),
], loc="upper left", facecolor="#1e293b", edgecolor="#334155", labelcolor="#94a3b8", fontsize=9)
plt.tight_layout(); plt.show()
print(f"Max value: {dp[n][W]}  |  Items: {selected}")
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Coin Change: DP vs Greedy comparison',
              code: `import matplotlib.pyplot as plt

def coin_change_dp(coins, amount):
    dp = [float("inf")] * (amount + 1)
    from_coin = [-1] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for w in range(coin, amount + 1):
            if dp[w - coin] + 1 < dp[w]:
                dp[w] = dp[w - coin] + 1
                from_coin[w] = coin
    path = []
    cur = amount
    while cur > 0 and from_coin[cur] != -1:
        path.append(from_coin[cur]); cur -= from_coin[cur]
    return dp[amount] if dp[amount] != float("inf") else -1, path, dp

def coin_change_greedy(coins, amount):
    path, remaining = [], amount
    for coin in sorted(coins, reverse=True):
        while remaining >= coin:
            path.append(coin); remaining -= coin
    return (len(path), path) if remaining == 0 else (-1, [])

coins  = [1, 5, 6, 9]
amount = 15
dp_ans, dp_path, dp_arr = coin_change_dp(coins, amount)
gr_ans, gr_path         = coin_change_greedy(coins, amount)

print(f"Coins: {coins}  Amount: {amount}")
print(f"  DP:     {dp_ans} coins → {dp_path}")
print(f"  Greedy: {gr_ans} coins → {gr_path}")
print(f"  DP wins by {gr_ans - dp_ans} coins" if gr_ans > dp_ans else "  Both equal!")

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(13, 7))
fig.patch.set_facecolor("#0f172a")
for ax in (ax1, ax2):
    ax.set_facecolor("#0f172a")
    for sp in ax.spines.values(): sp.set_visible(False)

# dp[w] bar chart
vals = [v if v != float("inf") else 0 for v in dp_arr]
colors = ["#f59e0b" if w == amount else "#3b82f6" if w in coins else "#334155"
          for w in range(amount + 1)]
ax1.bar(range(amount + 1), vals, color=colors, width=0.7)
for w, v in enumerate(dp_arr):
    ax1.text(w, vals[w] + 0.05, "∞" if v == float("inf") else str(v),
             ha="center", color="#94a3b8", fontsize=9)
ax1.set_xticks(range(amount + 1))
ax1.set_xticklabels(range(amount + 1), color="#94a3b8", fontsize=9)
ax1.set_yticks([]); ax1.set_title(f"dp[w] — min coins (blue=coin denom, orange=answer)",
                                   color="#60a5fa", fontsize=11)

# DP vs Greedy side-by-side bars
for idx, coin in enumerate(dp_path):
    ax2.bar(idx - 0.2, coin, width=0.38, color="#3b82f6")
    ax2.text(idx - 0.2, coin + 0.1, str(coin), ha="center", color="#fff", fontsize=10)
for idx, coin in enumerate(gr_path):
    color = "#ef4444" if gr_ans > dp_ans else "#22c55e"
    ax2.bar(idx + 0.2, coin, width=0.38, color=color)
    ax2.text(idx + 0.2, coin + 0.1, str(coin), ha="center", color="#fff", fontsize=10)
ax2.set_xticks([]); ax2.set_yticks([])
ax2.set_title(f"Blue=DP ({dp_ans} coins)  Red=Greedy ({gr_ans} coins)", color="#60a5fa", fontsize=11)

plt.tight_layout(); plt.show()
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'From scratch: Rod Cutting + Unbounded Knapsack',
              code: `# ============================================================
# Rod Cutting — unbounded knapsack (items reusable)
# prices[i] = revenue from a piece of length i+1
# Find max revenue by cutting a rod of length n
# ============================================================

def rod_cutting(prices, n):
    dp = [0] * (n + 1)
    for length in range(1, n + 1):
        price = prices[length - 1]
        for w in range(length, n + 1):   # forward = unbounded
            dp[w] = max(dp[w], price + dp[w - length])
    return dp[n]

prices = [1, 5, 8, 9, 10, 17, 17, 20]
n = 8
print(f"Rod Cutting: n={n}, max revenue = {rod_cutting(prices, n)}")  # 22

assert rod_cutting([1,5,8,9,10,17,17,20], 8) == 22
assert rod_cutting([3,5,8,9,10,17,17,20], 8) == 24
print("All assertions passed!")
print()

# ============================================================
# 0/1 vs Unbounded — same items, same capacity
# Only difference: inner loop direction
# ============================================================

def knapsack_01(weights, values, W):
    dp = [0] * (W + 1)
    for i in range(len(weights)):
        for w in range(W, weights[i] - 1, -1):   # BACKWARD = 0/1
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    return dp[W]

def knapsack_unbounded(weights, values, W):
    dp = [0] * (W + 1)
    for i in range(len(weights)):
        for w in range(weights[i], W + 1):        # FORWARD = unbounded
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    return dp[W]

wts, vals, W = [2, 3, 4, 1], [6, 9, 5, 3], 8
r01  = knapsack_01(wts, vals, W)
runb = knapsack_unbounded(wts, vals, W)
print(f"Weights={wts}  Values={vals}  W={W}")
print(f"  0/1 knapsack:      {r01}")
print(f"  Unbounded knapsack: {runb}")
print(f"  Difference from reuse: {runb - r01}")

import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(12, 4))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

dp01_all  = [0] * (W + 1)
dpunb_all = [0] * (W + 1)
for i in range(len(wts)):
    for w in range(W, wts[i] - 1, -1):
        dp01_all[w] = max(dp01_all[w], vals[i] + dp01_all[w - wts[i]])
for i in range(len(wts)):
    for w in range(wts[i], W + 1):
        dpunb_all[w] = max(dpunb_all[w], vals[i] + dpunb_all[w - wts[i]])

x = list(range(W + 1))
ax.bar([i - 0.2 for i in x], dp01_all,  width=0.38, color="#3b82f6", label=f"0/1 ({r01})")
ax.bar([i + 0.2 for i in x], dpunb_all, width=0.38, color="#8b5cf6", label=f"Unbounded ({runb})")
for i, (a, b) in enumerate(zip(dp01_all, dpunb_all)):
    if a: ax.text(i - 0.2, a + 0.2, str(a), ha="center", color="#93c5fd", fontsize=9)
    if b: ax.text(i + 0.2, b + 0.2, str(b), ha="center", color="#c4b5fd", fontsize=9)

ax.set_xticks(x)
ax.set_xticklabels([f"W={w}" for w in x], color="#94a3b8", fontsize=9)
ax.set_yticks([])
for sp in ax.spines.values(): sp.set_visible(False)
ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#94a3b8")
ax.set_title("0/1 (blue) vs Unbounded (purple) — only loop direction differs",
             color="#60a5fa", fontsize=12)
plt.tight_layout(); plt.show()
`,
            },
          ],
        },
      },
    ],
  },
};
