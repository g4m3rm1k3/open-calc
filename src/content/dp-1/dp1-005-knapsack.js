export default {
  id: 'dp1-005',
  slug: 'knapsack',
  chapter: 'dp1',
  order: 5,
  title: 'Knapsack DP: Items, Capacity, and Choice',
  subtitle: 'Every cell is a decision: take this item or skip it. The table remembers every choice you ever made.',
  tags: ['dynamic programming', 'knapsack', '0/1 knapsack', 'unbounded knapsack', 'coin change', 'subset sum', 'capacity DP', 'resource allocation'],
  aliases: 'knapsack 0/1 knapsack unbounded knapsack coin change minimum coins subset sum partition equal subset capacity weight value items DP',

  hook: {
    question: 'A thief breaks into a museum. Their bag holds 10 kg. The exhibits are worth millions, but each has a weight. Which items to steal? This is the knapsack problem — and the naive approach of checking every subset takes 2^n time. With n=50 items, that\'s a quadrillion checks. DP solves it in O(n × capacity) by reframing the question: instead of "which combination of all items is best?", ask "what\'s the best I can do with the first i items and exactly w kg of capacity?" Answer that for every (i, w) pair and the global answer falls out of the table.',
    realWorldContext: 'Knapsack DP is the backbone of resource allocation under constraints. Financial portfolio optimization (maximize return given a risk budget) is a continuous knapsack. Compiler register allocation (assign variables to limited CPU registers) is a discrete knapsack. Cloud scheduling (pack jobs into servers without exceeding RAM) is a bin-packing variant. Cryptographic systems use the subset-sum hardness of knapsack for security proofs. And every time your navigation app finds the fastest route within a fuel budget, it\'s solving a capacity-constrained optimization — knapsack DP family.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The knapsack insight: decisions stack.** In grid DP, cells depend on their neighbors. In sequence DP, cells compare two strings. Knapsack DP adds a new dimension of choice: for each item, you decide to take it or leave it. The table encodes every possible decision sequence. dp[i][w] = the best value achievable using any subset of the first i items with total weight at most w. The recurrence is a simple max of two choices: skip item i (answer is dp[i-1][w]), or take item i (answer is item i\'s value plus the best you can do with the remaining capacity dp[i-1][w-weight[i]]).',
      '**0/1 Knapsack recurrence.** Each item can be used at most once (0/1 — either you take it or you don\'t). The table is (n+1) × (capacity+1). Row 0 = no items available (all zeros). Column 0 = zero capacity (always zero). For each item i and weight w: if weight[i] > w, you can\'t take item i, so dp[i][w] = dp[i-1][w]. Otherwise dp[i][w] = max(dp[i-1][w], value[i] + dp[i-1][w-weight[i]]). The answer is dp[n][capacity]. The "i-1" in both branches is critical — it means you look at the same subproblem without item i.',
      '**Unbounded Knapsack: items can be reused.** The only change from 0/1 knapsack: when you take item i, you stay in row i instead of moving to row i-1. dp[i][w] = max(dp[i-1][w], value[i] + dp[i][w-weight[i]]). "dp[i]" instead of "dp[i-1]" — you can take item i again from the same row. In practice this collapses to a 1D recurrence: for each item, sweep weights forward (not backward), and reuse the same array.',
      '**Coin Change: minimize, don\'t maximize.** Coin Change is unbounded knapsack with minimization. dp[amount] = minimum coins to make that amount. Base case dp[0] = 0. For each coin denomination and each amount w, if we use this coin: dp[w] = min(dp[w], dp[w-coin] + 1). Initialize dp[1..amount] = Infinity. Sweep amounts forward, update if using a coin improves the count. The answer is dp[amount] — Infinity if impossible.',
      '**Coin Change II: count the ways.** Same setup, but dp[amount] = number of ways to make the amount using unlimited coins. Base case dp[0] = 1 (one way to make zero: use no coins). For each coin, sweep amounts forward: dp[w] += dp[w-coin]. Order matters: iterate coins in the outer loop, amounts in the inner loop. This ensures each combination is counted once regardless of order (it\'s a combination count, not a permutation count).',
      '**Space optimization: 1D array.** The 0/1 knapsack table only ever reads from the previous row. Compress to 1D by iterating weights in reverse (high to low). If you go forward, you\'d use each item multiple times (unbounded). Going backward ensures item i is used at most once — when you compute dp[w], dp[w-weight[i]] still holds the value from row i-1. This is the production implementation: O(capacity) space instead of O(n × capacity).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 1, Lesson 5: Knapsack DP',
        body: '**Previous:** Sequence DP — LCS, Edit Distance, LIS.\n**This lesson:** Knapsack DP — 0/1 Knapsack, Unbounded Knapsack, Coin Change, Subset Sum.\n**Next:** Interval DP — Matrix Chain Multiplication, Burst Balloons, Palindrome Partitioning.',
      },
      {
        type: 'insight',
        title: 'The knapsack family: one pattern, many problems',
        body: 'Coin Change (min coins), Coin Change II (count ways), Subset Sum (boolean: can we reach exactly W?), Partition Equal Subset Sum, Rod Cutting, Perfect Squares — these are all knapsack variants. The outer loop iterates items (or denominations). The inner loop iterates capacity (or amount). The recurrence either maximizes, minimizes, counts, or checks feasibility. Recognize the pattern and you recognize the whole family.',
      },
      {
        type: 'strategy',
        title: '0/1 vs unbounded: one word changes everything',
        body: 'In 0/1 knapsack, when you take an item, move to dp[i-1][w-weight]: the previous row, so item i can\'t be reused. In unbounded knapsack, stay at dp[i][w-weight]: the current row, so item i can be reused. In the 1D space-optimized version: 0/1 iterates weights high-to-low (backward). Unbounded iterates weights low-to-high (forward). The direction of the inner loop is the entire difference between the two variants.',
      },
      {
        type: 'insight',
        title: 'Coin Change: why greedy fails',
        body: 'For coins [1, 5, 6] and amount 10, greedy picks 6 + 1 + 1 + 1 + 1 = 5 coins. DP finds 5 + 5 = 2 coins. Greedy fails because a locally optimal choice (largest coin that fits) can block the globally optimal combination. DP considers every coin at every amount and finds the true minimum. This is the textbook example of why greedy needs a proof of optimality — and DP is the safe fallback when greedy fails.',
      },
      {
        type: 'warning',
        title: 'Inner loop direction determines 0/1 vs unbounded',
        body: 'In the 1D formulation, iterating weights high-to-low gives 0/1 knapsack (each item used at most once). Iterating low-to-high gives unbounded (each item reused freely). Getting this backward is a silent bug — your code runs without error but gives wrong answers. Before writing the inner loop, ask: can items repeat? If no: backward. If yes: forward.',
      },
      {
        type: 'warning',
        title: 'Subset Sum vs Knapsack: boolean vs numeric',
        body: 'Subset Sum asks "can we reach exactly W?" — dp[w] is true/false. Knapsack asks "what\'s the max value at capacity W?" — dp[w] is a number. The recurrence structure is identical. The only difference is the type stored and the operation: dp[w] = dp[w] || dp[w-num] for Subset Sum, dp[w] = max(dp[w], val + dp[w-wt]) for Knapsack.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Knapsack DP: Table, Traceback, Coin Change',
        caption: 'Watch the 0/1 knapsack table fill row by row. Each cell picks the best of "skip" or "take". Then trace back to see which items were selected.',
        props: {
          lesson: {
            title: 'Knapsack DP: Items, Capacity, and Coin Change',
            subtitle: 'Take it or leave it. The table remembers every version of every decision.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: '0/1 Knapsack — Fill the Table',
                instruction: 'Each row = one item added. Each column = a capacity. Cell dp[i][w] = best value using the first i items with capacity w. Gold = taking the item improved things. Blue = skipping was better.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px;overflow:auto"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const items = [
  { name: "Ruby",    weight: 2, value: 6 },
  { name: "Diamond", weight: 3, value: 9 },
  { name: "Gold",    weight: 4, value: 5 },
  { name: "Silver",  weight: 1, value: 3 },
  { name: "Emerald", weight: 3, value: 7 },
];
const W = 8;
const n = items.length;

const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
const took = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(false));

for (let i = 1; i <= n; i++) {
  const { weight, value } = items[i-1];
  for (let w = 0; w <= W; w++) {
    dp[i][w] = dp[i-1][w];
    if (weight <= w && dp[i-1][w-weight] + value > dp[i][w]) {
      dp[i][w] = dp[i-1][w-weight] + value;
      took[i][w] = true;
    }
  }
}

// Traceback
const selected = [];
let w = W;
for (let i = n; i >= 1; i--) {
  if (took[i][w]) { selected.push(items[i-1].name); w -= items[i-1].weight; }
}
selected.reverse();

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:8px'>0/1 Knapsack — capacity " + W + " | " + n + " items</div>";

// Item list
h += "<div style='margin-bottom:10px;font-size:12px;color:#94a3b8'>";
items.forEach((it, i) => {
  h += "<span style='margin-right:14px'>Item " + (i+1) + " " + it.name + ": wt=" + it.weight + " val=" + it.value + "</span>";
});
h += "</div>";

// Table header
h += "<table style='border-collapse:collapse;margin-bottom:12px'>";
h += "<tr><td style='width:72px;height:28px;color:#64748b;font-size:11px'>item</td>";
for (let w2 = 0; w2 <= W; w2++) {
  h += "<td style='width:36px;height:28px;text-align:center;color:#64748b;font-size:11px'>w=" + w2 + "</td>";
}
h += "</tr>";

for (let i2 = 0; i2 <= n; i2++) {
  const label = i2 === 0 ? "—" : items[i2-1].name.slice(0,3);
  h += "<tr><td style='width:72px;height:32px;color:#94a3b8;font-size:11px;padding-right:6px'>" + (i2===0?"none":i2+"."+label) + "</td>";
  for (let w2 = 0; w2 <= W; w2++) {
    const isTook = took[i2][w2];
    const isAns = (i2 === n && w2 === W);
    const bg = isAns ? "#f59e0b" : isTook ? "#1d4ed8" : i2 === 0 ? "#0f2231" : "#1e293b";
    const color = isAns ? "#0f172a" : isTook ? "#fff" : "#94a3b8";
    h += "<td style='width:36px;height:32px;text-align:center;border:1px solid #334155;background:" + bg + ";color:" + color + ";font-weight:bold;font-size:12px'>" + dp[i2][w2] + "</td>";
  }
  h += "</tr>";
}
h += "</table>";
h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b;margin-bottom:6px'>Max value = <b>" + dp[n][W] + "</b></div>";
h += "<div style='font-size:12px;color:#4ade80'>Selected items: " + selected.join(", ") + "</div>";
h += "<div style='margin-top:6px;color:#64748b;font-size:11px'>Blue = taking item improved the value | Orange = final answer</div>";
out.innerHTML = h;`,
                outputHeight: 380,
              },
              {
                type: 'js',
                title: 'Knapsack Traceback — Which Items Were Chosen?',
                instruction: 'After filling the table, trace from dp[n][W] upward. If took[i][w] is true, item i was selected — subtract its weight and move up. Otherwise skip item i and just move up one row.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px;overflow:auto"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const items = [
  { name: "Ruby",    weight: 2, value: 6 },
  { name: "Diamond", weight: 3, value: 9 },
  { name: "Gold",    weight: 4, value: 5 },
  { name: "Silver",  weight: 1, value: 3 },
  { name: "Emerald", weight: 3, value: 7 },
];
const W = 8;
const n = items.length;

const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
const took = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(false));

for (let i = 1; i <= n; i++) {
  const { weight, value } = items[i-1];
  for (let w = 0; w <= W; w++) {
    dp[i][w] = dp[i-1][w];
    if (weight <= w && dp[i-1][w-weight] + value > dp[i][w]) {
      dp[i][w] = dp[i-1][w-weight] + value;
      took[i][w] = true;
    }
  }
}

// Animate traceback path
const path = [];
let w = W;
for (let i = n; i >= 1; i--) {
  path.push({ i, w, selected: took[i][w] });
  if (took[i][w]) w -= items[i-1].weight;
}
path.reverse();

const pathCells = new Set(path.map(p => p.i + "," + p.w));
const selectedItems = path.filter(p => p.selected).map(p => items[p.i-1]);

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:8px'>Knapsack Traceback — following the optimal path</div>";
h += "<table style='border-collapse:collapse;margin-bottom:12px'>";
h += "<tr><td style='width:72px;height:28px;color:#64748b;font-size:11px'>item</td>";
for (let w2 = 0; w2 <= W; w2++) {
  h += "<td style='width:36px;height:28px;text-align:center;color:" + (w2===W?"#f59e0b":"#64748b") + ";font-size:11px'>w=" + w2 + "</td>";
}
h += "</tr>";

for (let i2 = 0; i2 <= n; i2++) {
  const label = i2 === 0 ? "—" : items[i2-1].name.slice(0,4);
  h += "<tr><td style='width:72px;height:32px;color:#94a3b8;font-size:11px;padding-right:6px'>" + (i2===0?"none":i2+"."+label) + "</td>";
  for (let w2 = 0; w2 <= W; w2++) {
    const onPath = pathCells.has(i2 + "," + w2);
    const isTook = took[i2][w2];
    const isAns = (i2 === n && w2 === W);
    let bg = i2 === 0 ? "#0f2231" : "#1e293b";
    let color = "#94a3b8";
    if (isAns) { bg = "#f59e0b"; color = "#0f172a"; }
    else if (onPath && isTook) { bg = "#166534"; color = "#4ade80"; }
    else if (onPath) { bg = "#4a1d96"; color = "#c4b5fd"; }
    else if (isTook) { bg = "#1e3a5f"; color = "#93c5fd"; }
    const border = onPath ? "2px solid #f59e0b" : "1px solid #334155";
    h += "<td style='width:36px;height:32px;text-align:center;border:" + border + ";background:" + bg + ";color:" + color + ";font-weight:bold;font-size:12px'>" + dp[i2][w2] + "</td>";
  }
  h += "</tr>";
}
h += "</table>";
h += "<div style='margin-bottom:6px;font-size:12px;color:#94a3b8'>Traceback path: ";
path.forEach(p => {
  const color = p.selected ? "#4ade80" : "#c4b5fd";
  const action = p.selected ? "TAKE " + items[p.i-1].name : "skip";
  h += "<span style='color:" + color + ";margin-right:8px'>[" + p.i + "," + p.w + "] " + action + "</span>";
});
h += "</div>";
h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b'>Selected: " + selectedItems.map(it => it.name + "(wt:" + it.weight + " val:" + it.value + ")").join(", ") + "</div>";
h += "<div style='margin-top:6px;color:#64748b;font-size:11px'>Green = item taken on path | Purple = item skipped on path | Blue = other take decisions</div>";
out.innerHTML = h;`,
                outputHeight: 400,
              },
              {
                type: 'js',
                title: 'Coin Change — Minimum Coins (1D Unbounded DP)',
                instruction: 'dp[w] = min coins to make amount w. Base: dp[0]=0, rest=Infinity. For each coin, sweep amounts forward: dp[w] = min(dp[w], dp[w-coin]+1). Bar chart shows the buildup — each amount inherits from a smaller amount.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const coins = [1, 5, 6, 9];
const amount = 11;

const dp = new Array(amount + 1).fill(Infinity);
const from = new Array(amount + 1).fill(-1);
dp[0] = 0;

for (const coin of coins) {
  for (let w = coin; w <= amount; w++) {
    if (dp[w - coin] + 1 < dp[w]) {
      dp[w] = dp[w - coin] + 1;
      from[w] = coin;
    }
  }
}

// Reconstruct which coins
const usedCoins = [];
let cur = amount;
while (cur > 0 && from[cur] !== -1) {
  usedCoins.push(from[cur]);
  cur -= from[cur];
}

const maxH = 120;
const maxCoins = Math.max(...dp.filter(v => v !== Infinity));

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:6px'>Coin Change: coins=" + JSON.stringify(coins) + " amount=" + amount + "</div>";
h += "<div style='display:flex;align-items:flex-end;gap:4px;margin-bottom:12px;height:" + (maxH + 36) + "px'>";
for (let w = 0; w <= amount; w++) {
  const val = dp[w];
  const isInf = val === Infinity;
  const bh = isInf ? 20 : Math.max(8, Math.round((val / maxCoins) * maxH));
  const isCoin = coins.includes(w);
  const isAns = (w === amount);
  const bg = isAns ? "#f59e0b" : isCoin ? "#3b82f6" : "#334155";
  const labelColor = isAns ? "#f59e0b" : "#64748b";
  h += "<div style='display:flex;flex-direction:column;align-items:center;gap:2px'>";
  h += "<div style='color:" + labelColor + ";font-size:10px'>" + (isInf ? "∞" : val) + "</div>";
  h += "<div style='width:26px;height:" + bh + "px;background:" + bg + ";border-radius:3px 3px 0 0" + (isInf ? ";opacity:0.3" : "") + "'></div>";
  h += "<div style='color:#94a3b8;font-size:10px'>" + w + "</div>";
  h += "</div>";
}
h += "</div>";

if (dp[amount] === Infinity) {
  h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#f87171'>Amount " + amount + " is impossible with these coins.</div>";
} else {
  h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b;margin-bottom:6px'>Min coins = <b>" + dp[amount] + "</b></div>";
  h += "<div style='font-size:12px;color:#4ade80'>Coins used: [" + usedCoins.join(", ") + "]</div>";
}
h += "<div style='margin-top:6px;color:#64748b;font-size:11px'>Number above bar = dp[w] (min coins) | Blue = coin denomination | Orange = answer</div>";
out.innerHTML = h;`,
                outputHeight: 280,
              },
              {
                type: 'js',
                title: 'Coin Change II — Count the Ways',
                instruction: 'dp[w] = number of ways to make amount w. Base: dp[0]=1. For each coin (outer), sweep amounts forward (inner): dp[w] += dp[w-coin]. Outer=coins, inner=amounts ensures each combination is counted once.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const coins = [1, 2, 5];
const amount = 10;

const dp = new Array(amount + 1).fill(0);
dp[0] = 1;

// Show snapshots after each coin is added
const snapshots = [dp.slice()];
for (const coin of coins) {
  for (let w = coin; w <= amount; w++) {
    dp[w] += dp[w - coin];
  }
  snapshots.push(dp.slice());
}

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:8px'>Coin Change II: coins=" + JSON.stringify(coins) + " amount=" + amount + "</div>";
h += "<div style='color:#94a3b8;font-size:12px;margin-bottom:10px'>dp[w] = number of ways to make amount w. Outer loop = coins, inner loop = amounts.</div>";

// Table showing progression
h += "<table style='border-collapse:collapse;margin-bottom:12px'>";
h += "<tr><td style='width:80px;height:28px;color:#64748b;font-size:11px'>after coin</td>";
for (let w2 = 0; w2 <= amount; w2++) {
  h += "<td style='width:32px;height:28px;text-align:center;color:#64748b;font-size:11px'>" + w2 + "</td>";
}
h += "</tr>";

const rowLabels = ["(start)"].concat(coins.map(c => "+" + c));
snapshots.forEach((snap, si) => {
  h += "<tr><td style='width:80px;height:30px;color:#94a3b8;font-size:11px'>" + rowLabels[si] + "</td>";
  snap.forEach((val, w2) => {
    const isAns = (si === snapshots.length - 1 && w2 === amount);
    const changed = si > 0 && snap[w2] !== snapshots[si-1][w2];
    const bg = isAns ? "#f59e0b" : changed ? "#1d4ed8" : w2 === 0 ? "#0f2231" : "#1e293b";
    const color = isAns ? "#0f172a" : changed ? "#fff" : "#94a3b8";
    h += "<td style='width:32px;height:30px;text-align:center;border:1px solid #334155;background:" + bg + ";color:" + color + ";font-weight:bold;font-size:11px'>" + val + "</td>";
  });
  h += "</tr>";
});
h += "</table>";
h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b'>Ways to make " + amount + " = <b>" + dp[amount] + "</b></div>";
h += "<div style='margin-top:6px;color:#64748b;font-size:11px'>Blue = cells updated by adding this coin | Orange = final answer</div>";
out.innerHTML = h;`,
                outputHeight: 300,
              },
            ],
          },
        },
      },
      {
        id: 'JSNotebook',
        title: 'Knapsack DP in JavaScript — Build It From Scratch',
        caption: '0/1 Knapsack, Coin Change, Coin Change II, and space-optimized knapsack. Implement each from the recurrence up.',
        props: {
          lesson: {
            title: 'Knapsack DP in JavaScript',
            subtitle: 'Take it or leave it. Build the table, then compress it to one row.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — 0/1 Knapsack

Given items with weights and values, and a capacity W, return the maximum value achievable.

**Table:** (n+1) × (W+1). dp[i][w] = best value using first i items with capacity w.

**Recurrence:**
\`\`\`
if weights[i-1] > w:   dp[i][w] = dp[i-1][w]          // can't take
else:                  dp[i][w] = max(
                           dp[i-1][w],                  // skip
                           values[i-1] + dp[i-1][w - weights[i-1]]  // take
                       )
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function knapsack(weights, values, W) {
  const n = weights.length;
  // TODO: create (n+1) x (W+1) table filled with 0
  // TODO: fill using the recurrence above
  // TODO: return dp[n][W]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("basic 4-item W=5",     knapsack([1,3,4,5], [1,4,5,7], 5),     9);
check("capacity 0",           knapsack([1,2,3], [10,20,30], 0),       0);
check("all too heavy",        knapsack([5,6,7], [10,20,30], 4),       0);
check("exact fit",            knapsack([2,3,4], [3,4,5], 5),          7);
check("museum example W=8",   knapsack([2,3,4,1,3], [6,9,5,3,7], 8), 25);`,
                solutionCode: `function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i-1][w];
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(dp[i][w], values[i-1] + dp[i-1][w - weights[i-1]]);
      }
    }
  }
  return dp[n][W];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("basic 4-item W=5",     knapsack([1,3,4,5], [1,4,5,7], 5),     9);
check("capacity 0",           knapsack([1,2,3], [10,20,30], 0),       0);
check("all too heavy",        knapsack([5,6,7], [10,20,30], 4),       0);
check("exact fit",            knapsack([2,3,4], [3,4,5], 5),          7);
check("museum example W=8",   knapsack([2,3,4,1,3], [6,9,5,3,7], 8), 25);`,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Coin Change (Minimum Coins)

Given coin denominations and an amount, return the minimum number of coins needed. Return -1 if impossible.

**1D unbounded DP:**
- dp[0] = 0, dp[1..amount] = Infinity
- For each coin, for each w from coin to amount:
  - dp[w] = Math.min(dp[w], dp[w - coin] + 1)
- Return dp[amount] === Infinity ? -1 : dp[amount]`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function coinChange(coins, amount) {
  // TODO: create dp array of size amount+1, filled with Infinity
  // TODO: set dp[0] = 0
  // TODO: for each coin, sweep amounts forward: dp[w] = min(dp[w], dp[w-coin]+1)
  // TODO: return dp[amount] === Infinity ? -1 : dp[amount]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[1,5,6,9] -> 11",  coinChange([1,5,6,9], 11),  2);
check("[1,2,5] -> 11",    coinChange([1,2,5], 11),     3);
check("[2] -> 3",         coinChange([2], 3),           -1);
check("[1] -> 0",         coinChange([1], 0),           0);
check("[186,419,83,408] -> 6249", coinChange([186,419,83,408], 6249), 20);`,
                solutionCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins) {
    for (let w = coin; w <= amount; w++) {
      if (dp[w - coin] + 1 < dp[w]) {
        dp[w] = dp[w - coin] + 1;
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("[1,5,6,9] -> 11",  coinChange([1,5,6,9], 11),  2);
check("[1,2,5] -> 11",    coinChange([1,2,5], 11),     3);
check("[2] -> 3",         coinChange([2], 3),           -1);
check("[1] -> 0",         coinChange([1], 0),           0);
check("[186,419,83,408] -> 6249", coinChange([186,419,83,408], 6249), 20);`,
              },
              {
                type: 'js',
                instruction: `## Step 3 — Coin Change II (Count the Ways)

Count the number of combinations of coins that sum to the amount. Each coin can be used unlimited times.

**Key:** outer loop = coins, inner loop = amounts. This order counts combinations (not permutations).

- dp[0] = 1 (one way to make zero: use nothing)
- dp[1..amount] = 0
- For each coin: for w from coin to amount: dp[w] += dp[w - coin]`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function change(amount, coins) {
  // TODO: dp[0] = 1, rest = 0
  // TODO: outer loop: each coin
  // TODO: inner loop: w from coin to amount — dp[w] += dp[w - coin]
  // TODO: return dp[amount]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("amount=5 coins=[1,2,5]",  change(5, [1,2,5]),   4);
check("amount=3 coins=[2]",      change(3, [2]),        0);
check("amount=10 coins=[10]",    change(10, [10]),      1);
check("amount=0 coins=[1,2,3]",  change(0, [1,2,3]),   1);
check("amount=10 coins=[1,2,5]", change(10, [1,2,5]),  10);`,
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
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("amount=5 coins=[1,2,5]",  change(5, [1,2,5]),   4);
check("amount=3 coins=[2]",      change(3, [2]),        0);
check("amount=10 coins=[10]",    change(10, [10]),      1);
check("amount=0 coins=[1,2,3]",  change(0, [1,2,3]),   1);
check("amount=10 coins=[1,2,5]", change(10, [1,2,5]),  10);`,
              },
              {
                type: 'js',
                instruction: `## Step 4 — Space-Optimized 0/1 Knapsack

Compress the 2D table to a single 1D array. Iterate weights **high to low** (reverse) to prevent using an item twice.

**Why reverse?** When computing dp[w], we need dp[w-weight] from the *previous* row (before item i was considered). If we go forward, dp[w-weight] was already updated in the current pass — we'd accidentally use item i twice.

\`\`\`
for each item:
    for w from W down to weight[i]:
        dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
\`\`\``,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function knapsack1D(weights, values, W) {
  // TODO: create 1D dp array of size W+1 filled with 0
  // TODO: for each item i, sweep w from W DOWN to weights[i]
  //         dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]])
  // TODO: return dp[W]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

// Must match the 2D results exactly
check("basic 4-item W=5",   knapsack1D([1,3,4,5], [1,4,5,7], 5),     9);
check("capacity 0",         knapsack1D([1,2,3], [10,20,30], 0),       0);
check("all too heavy",      knapsack1D([5,6,7], [10,20,30], 4),       0);
check("exact fit",          knapsack1D([2,3,4], [3,4,5], 5),          7);
check("museum W=8",         knapsack1D([2,3,4,1,3], [6,9,5,3,7], 8), 25);`,
                solutionCode: `function knapsack1D(weights, values, W) {
  const dp = new Array(W + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = W; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
    }
  }
  return dp[W];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("basic 4-item W=5",   knapsack1D([1,3,4,5], [1,4,5,7], 5),     9);
check("capacity 0",         knapsack1D([1,2,3], [10,20,30], 0),       0);
check("all too heavy",      knapsack1D([5,6,7], [10,20,30], 4),       0);
check("exact fit",          knapsack1D([2,3,4], [3,4,5], 5),          7);
check("museum W=8",         knapsack1D([2,3,4,1,3], [6,9,5,3,7], 8), 25);`,
              },
            ],
          },
        },
      },
      {
        id: 'PythonNotebook',
        title: 'Knapsack DP in Python — Visualize and Extend',
        caption: 'Heatmap the knapsack table, plot coin change buildup, solve Partition Equal Subset Sum, and implement Rod Cutting.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: '0/1 Knapsack heatmap with traceback path',
              code: `import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

items = [
    {"name": "Ruby",    "weight": 2, "value": 6},
    {"name": "Diamond", "weight": 3, "value": 9},
    {"name": "Gold",    "weight": 4, "value": 5},
    {"name": "Silver",  "weight": 1, "value": 3},
    {"name": "Emerald", "weight": 3, "value": 7},
]
W = 8
n = len(items)

dp   = [[0] * (W + 1) for _ in range(n + 1)]
took = [[False] * (W + 1) for _ in range(n + 1)]

for i in range(1, n + 1):
    wt, val = items[i-1]["weight"], items[i-1]["value"]
    for w in range(W + 1):
        dp[i][w] = dp[i-1][w]
        if wt <= w and dp[i-1][w-wt] + val > dp[i][w]:
            dp[i][w] = dp[i-1][w-wt] + val
            took[i][w] = True

# Traceback
path = set()
selected = []
w = W
for i in range(n, 0, -1):
    path.add((i, w))
    if took[i][w]:
        selected.append(items[i-1]["name"])
        w -= items[i-1]["weight"]
path.add((0, w))
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
        is_ans = (i2 == n and w2 == W)
        norm = val / maxval

        if is_ans:
            bg = "#f59e0b"
        elif on_path and is_took:
            bg = "#166534"
        elif on_path:
            bg = "#4a1d96"
        elif is_took:
            r = int(15 + norm * 20)
            g = int(58 + norm * 82)
            b = int(130 + norm * 100)
            bg = f"#{r:02x}{g:02x}{b:02x}"
        elif i2 == 0:
            bg = "#0f2231"
        else:
            t = norm
            r = int(30 + t * 15)
            g = int(41 + t * 30)
            b = int(59 + t * 50)
            bg = f"#{r:02x}{g:02x}{b:02x}"

        rect = plt.Rectangle([w2 - 0.5, (n - i2) - 0.5], 1, 1, color=bg)
        ax.add_patch(rect)
        if on_path:
            border = plt.Rectangle([w2 - 0.5, (n - i2) - 0.5], 1, 1,
                                   fill=False, edgecolor="#f59e0b", linewidth=2)
            ax.add_patch(border)
        fc = "#0f172a" if is_ans else "white"
        ax.text(w2, n - i2, str(val), ha="center", va="center",
                color=fc, fontsize=10, fontweight="bold", fontfamily="monospace")

ax.set_xlim(-0.5, W + 0.5)
ax.set_ylim(-0.5, n + 0.5)
ax.set_xticks(range(W + 1))
ax.set_xticklabels([f"w={w}" for w in range(W + 1)], color="#94a3b8", fontsize=9)
ax.set_yticks(range(n + 1))
ax.set_yticklabels(["none"] + [f"{i+1}.{items[i]['name'][:4]}" for i in range(n-1,-1,-1)],
                   color="#94a3b8", fontsize=9)
for sp in ax.spines.values():
    sp.set_edgecolor("#334155")
ax.set_title(f"0/1 Knapsack (W={W})  |  Max value = {dp[n][W]}  |  Selected: {', '.join(selected)}",
             color="#60a5fa", fontsize=12, pad=12)

legend = [
    mpatches.Patch(color="#166534", label="Taken (on path)"),
    mpatches.Patch(color="#4a1d96", label="Skipped (on path)"),
    mpatches.Patch(color="#1e3a5f", label="Taken (off path)"),
    mpatches.Patch(color="#f59e0b", label="Answer dp[n][W]"),
]
ax.legend(handles=legend, loc="upper left",
          facecolor="#1e293b", edgecolor="#334155", labelcolor="#94a3b8", fontsize=9)
plt.tight_layout()
plt.show()
print(f"Max value: {dp[n][W]}")
print(f"Items selected: {selected}")
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Coin Change — buildup visualization and greedy comparison',
              code: `import matplotlib.pyplot as plt
import numpy as np

coins = [1, 5, 6, 9]
amount = 15

# DP solution
dp = [float("inf")] * (amount + 1)
from_coin = [-1] * (amount + 1)
dp[0] = 0

for coin in coins:
    for w in range(coin, amount + 1):
        if dp[w - coin] + 1 < dp[w]:
            dp[w] = dp[w - coin] + 1
            from_coin[w] = coin

# Reconstruct DP path
dp_coins = []
cur = amount
while cur > 0 and from_coin[cur] != -1:
    dp_coins.append(from_coin[cur])
    cur -= from_coin[cur]

# Greedy attempt (largest coin first)
greedy_coins = []
remaining = amount
for coin in sorted(coins, reverse=True):
    while remaining >= coin:
        greedy_coins.append(coin)
        remaining -= coin

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(13, 8))
fig.patch.set_facecolor("#0f172a")

# Top: dp[w] bar chart
ax1.set_facecolor("#0f172a")
vals = [v if v != float("inf") else 0 for v in dp]
colors = []
for w in range(amount + 1):
    if w == amount:
        colors.append("#f59e0b")
    elif coins.count(w) > 0 or w in coins:
        colors.append("#3b82f6")
    else:
        colors.append("#334155")

bars = ax1.bar(range(amount + 1), vals, color=colors, width=0.7)
for w, v in enumerate(dp):
    label = str(v) if v != float("inf") else "inf"
    ax1.text(w, vals[w] + 0.05, label, ha="center", color="#94a3b8", fontsize=9)

ax1.set_xticks(range(amount + 1))
ax1.set_xticklabels(range(amount + 1), color="#94a3b8", fontsize=9)
ax1.set_yticks([])
for sp in ax1.spines.values(): sp.set_visible(False)
ax1.set_facecolor("#0f172a")
ax1.set_title(f"Coin Change DP: coins={coins}, amount={amount}  |  dp[w] = min coins",
              color="#60a5fa", fontsize=11, pad=8)

# Bottom: DP vs Greedy comparison
ax2.set_facecolor("#0f172a")
max_coins = max(len(dp_coins), len(greedy_coins))

for idx, coin in enumerate(dp_coins):
    rect = plt.Rectangle([idx - 0.4, 0.55], 0.8, 0.35, color="#3b82f6")
    ax2.add_patch(rect)
    ax2.text(idx, 0.725, str(coin), ha="center", va="center", color="white", fontsize=11, fontweight="bold")

for idx, coin in enumerate(greedy_coins):
    color = "#ef4444" if len(greedy_coins) > len(dp_coins) else "#22c55e"
    rect = plt.Rectangle([idx - 0.4, 0.1], 0.8, 0.35, color=color)
    ax2.add_patch(rect)
    ax2.text(idx, 0.275, str(coin), ha="center", va="center", color="white", fontsize=11, fontweight="bold")

ax2.text(-0.8, 0.725, f"DP ({len(dp_coins)})", color="#60a5fa", va="center", fontsize=10, fontweight="bold")
ax2.text(-0.8, 0.275, f"Greedy ({len(greedy_coins)})", color="#f87171" if len(greedy_coins) > len(dp_coins) else "#4ade80",
         va="center", fontsize=10, fontweight="bold")
ax2.set_xlim(-1, max(max_coins, 5) - 0.4)
ax2.set_ylim(0, 1)
ax2.set_xticks([])
ax2.set_yticks([])
for sp in ax2.spines.values(): sp.set_visible(False)
ax2.set_title("DP (blue) vs Greedy (red=worse / green=same)", color="#94a3b8", fontsize=10)

plt.tight_layout()
plt.show()
print(f"DP: {len(dp_coins)} coins = {dp_coins}")
print(f"Greedy: {len(greedy_coins)} coins = {greedy_coins}")
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Partition Equal Subset Sum — boolean knapsack',
              code: `# Can we partition an array into two subsets with equal sum?
# This is knapsack with boolean dp: dp[w] = can we reach exactly weight w?
# If total sum is odd, impossible. Otherwise target = sum // 2.

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

def can_partition(nums):
    total = sum(nums)
    if total % 2 != 0:
        return False, None
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    history = [dp[:]]  # snapshot before each item
    for num in nums:
        for w in range(target, num - 1, -1):  # backward = 0/1
            dp[w] = dp[w] or dp[w - num]
        history.append(dp[:])
    return dp[target], history

nums = [1, 5, 11, 5]
result, history = can_partition(nums)
target = sum(nums) // 2

print(f"nums = {nums}")
print(f"sum = {sum(nums)}, target = {target}")
print(f"Can partition: {result}")

if result:
    # Find the subset
    dp2 = [False] * (target + 1)
    dp2[0] = True
    parent = [None] * (target + 1)
    for num in nums:
        for w in range(target, num - 1, -1):
            if not dp2[w] and dp2[w - num]:
                dp2[w] = True
                parent[w] = num
    subset1, w = [], target
    while w > 0 and parent[w] is not None:
        subset1.append(parent[w])
        w -= parent[w]
    subset2 = nums[:]
    for x in subset1:
        subset2.remove(x)
    print(f"Subset 1: {subset1} (sum={sum(subset1)})")
    print(f"Subset 2: {subset2} (sum={sum(subset2)})")

# Visualize the boolean DP table evolution
fig, ax = plt.subplots(figsize=(13, 6))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

n_rows = len(history)
n_cols = target + 1

for row_idx, snap in enumerate(history):
    for col_idx, val in enumerate(snap):
        is_target = (col_idx == target)
        is_ans = (row_idx == n_rows - 1 and col_idx == target)
        if is_ans and val:
            bg = "#f59e0b"
        elif val and is_target:
            bg = "#f59e0b"
        elif val:
            bg = "#166534"
        else:
            bg = "#1e293b"
        rect = plt.Rectangle([col_idx - 0.5, (n_rows - 1 - row_idx) - 0.5], 1, 1, color=bg)
        ax.add_patch(rect)
        ax.text(col_idx, n_rows - 1 - row_idx, "T" if val else "F",
                ha="center", va="center",
                color="#4ade80" if val else "#334155",
                fontsize=9, fontweight="bold", fontfamily="monospace")

ax.set_xlim(-0.5, n_cols - 0.5)
ax.set_ylim(-0.5, n_rows - 0.5)
ax.set_xticks(range(n_cols))
ax.set_xticklabels(range(n_cols), color="#94a3b8", fontsize=9)
ax.set_yticks(range(n_rows))
ax.set_yticklabels(["add " + str(nums[i]) if i < len(nums) else "start" for i in range(n_rows-1, -1, -1)],
                   color="#94a3b8", fontsize=9)
for sp in ax.spines.values():
    sp.set_edgecolor("#334155")
ax.set_title(f"Partition Equal Subset Sum: {nums}  |  target={target}  |  {'POSSIBLE' if result else 'IMPOSSIBLE'}",
             color="#60a5fa", fontsize=12, pad=10)
legend = [
    mpatches.Patch(color="#166534", label="Reachable sum"),
    mpatches.Patch(color="#f59e0b", label="Target sum (answer)"),
    mpatches.Patch(color="#1e293b", label="Unreachable"),
]
ax.legend(handles=legend, loc="upper left",
          facecolor="#1e293b", edgecolor="#334155", labelcolor="#94a3b8", fontsize=9)
plt.tight_layout()
plt.show()
`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'From scratch: Rod Cutting + Unbounded Knapsack',
              code: `# ============================================================
# Challenge 1: Rod Cutting (unbounded knapsack variant)
# Given a rod of length n and prices for each length 1..n,
# find the maximum revenue by cutting the rod into pieces.
# Unbounded: you can use the same length multiple times.
# ============================================================

def rod_cutting(prices, n):
    """
    prices[i] = revenue from a piece of length i+1 (1-indexed in problem)
    n = total rod length
    """
    dp = [0] * (n + 1)
    for length in range(1, n + 1):
        price = prices[length - 1]
        for w in range(length, n + 1):   # forward = unbounded
            dp[w] = max(dp[w], price + dp[w - length])
    return dp[n]

prices = [1, 5, 8, 9, 10, 17, 17, 20]  # prices[i] = price of piece of length i+1
n = 8
result = rod_cutting(prices, n)
print(f"Rod Cutting: n={n}, prices={prices}")
print(f"Max revenue: {result}")  # expected: 22

# Verify known results
assert rod_cutting([1,5,8,9,10,17,17,20], 8) == 22
assert rod_cutting([3,5,8,9,10,17,17,20], 8) == 24
assert rod_cutting([1,5,8,9,10,17,17,20], 1) == 1
print("All rod cutting assertions passed!")
print()

# ============================================================
# Challenge 2: Full Unbounded Knapsack
# Items can be used unlimited times.
# Forward sweep (not backward) — same item stays in play.
# ============================================================

def unbounded_knapsack(weights, values, W):
    dp = [0] * (W + 1)
    for i in range(len(weights)):
        for w in range(weights[i], W + 1):   # forward = reuse allowed
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    return dp[W]

# Contrast with 0/1: item (weight=3, value=9) gives 24 with W=8 if reused
wts = [2, 3, 4, 1]
vals = [6, 9, 5, 3]
W = 8

bounded = None
def knapsack_01(weights, values, W):
    n = len(weights)
    dp = [0] * (W + 1)
    for i in range(n):
        for w in range(W, weights[i] - 1, -1):  # backward = no reuse
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    return dp[W]

r01 = knapsack_01(wts, vals, W)
runb = unbounded_knapsack(wts, vals, W)
print(f"Same items, same capacity W={W}:")
print(f"  0/1 knapsack (each item once):      {r01}")
print(f"  Unbounded knapsack (items reusable): {runb}")
print(f"  Difference: {runb - r01} extra value from reuse")
print()

import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(13, 5))
fig.patch.set_facecolor("#0f172a")

# Left: rod cutting dp bar chart
ax = axes[0]
ax.set_facecolor("#0f172a")
dp_rod = [0] * (n + 1)
for length in range(1, n + 1):
    price = prices[length - 1]
    for w in range(length, n + 1):
        dp_rod[w] = max(dp_rod[w], price + dp_rod[w - length])

colors_rod = ["#f59e0b" if i == n else "#3b82f6" for i in range(n + 1)]
ax.bar(range(n + 1), dp_rod, color=colors_rod, width=0.7)
for i, v in enumerate(dp_rod):
    ax.text(i, v + 0.3, str(v), ha="center", color="#94a3b8", fontsize=10)
ax.set_xticks(range(n + 1))
ax.set_xticklabels([f"n={i}" for i in range(n + 1)], color="#94a3b8", fontsize=8)
ax.set_yticks([])
for sp in ax.spines.values(): sp.set_visible(False)
ax.set_title(f"Rod Cutting dp[length] — max revenue\nAnswer dp[{n}] = {dp_rod[n]}", color="#60a5fa", fontsize=11)

# Right: 0/1 vs unbounded bar comparison
ax2 = axes[1]
ax2.set_facecolor("#0f172a")
dp01 = [0] * (W + 1)
for i in range(len(wts)):
    for w in range(W, wts[i] - 1, -1):
        dp01[w] = max(dp01[w], vals[i] + dp01[w - wts[i]])
dpunb = [0] * (W + 1)
for i in range(len(wts)):
    for w in range(wts[i], W + 1):
        dpunb[w] = max(dpunb[w], vals[i] + dpunb[w - wts[i]])

x = range(W + 1)
w_arr = list(x)
ax2.bar([i - 0.2 for i in w_arr], dp01,  width=0.38, color="#3b82f6", label="0/1")
ax2.bar([i + 0.2 for i in w_arr], dpunb, width=0.38, color="#8b5cf6", label="Unbounded")
ax2.set_xticks(w_arr)
ax2.set_xticklabels([f"W={w}" for w in w_arr], color="#94a3b8", fontsize=8)
ax2.set_yticks([])
for sp in ax2.spines.values(): sp.set_visible(False)
ax2.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#94a3b8")
ax2.set_title(f"0/1 vs Unbounded Knapsack\nBlue=0/1({r01}) Purple=Unbounded({runb})", color="#60a5fa", fontsize=11)

plt.tight_layout()
plt.show()
`,
            },
          ],
        },
      },
    ],
  },
};
