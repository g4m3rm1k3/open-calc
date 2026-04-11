export default {
  id: 'dp1-003',
  slug: '2d-dp-grids',
  chapter: 'dp1',
  order: 3,
  title: '2D DP: Grids and the Table Mindset',
  subtitle: 'From linear sequences to rectangular tables — how two-state problems unlock a new class of optimal solutions',
  tags: ['dynamic programming', '2D DP', 'unique paths', 'minimum path sum', 'grid DP', 'Bellman', 'state space', 'tabulation'],
  aliases: 'DP grid 2D table robot paths minimum path sum rectangle optimal substructure',

  hook: {
    question: 'A robot sits in the top-left corner of a 20x20 grid. It can only move right or down. How many distinct paths reach the bottom-right corner? You could try to enumerate them — there are over 35 billion. Or you could notice that every path through any given cell comes from exactly two directions: above or to the left. That one observation collapses a 35-billion-path problem into 400 arithmetic operations. This is the 2D DP table: a grid of answers that builds itself from the top-left corner outward, each cell standing on the shoulders of the two cells before it.',
    realWorldContext: 'Grid DP is not just a toy problem. Computer vision uses 2D DP for image seam carving (removing the lowest-energy path through an image to resize it without distortion — used in Photoshop). Genomics uses it for sequence alignment across entire chromosomes. Natural language processing uses 2D DP tables for CYK parsing (determining grammatical structure). Robotics uses grid DP for motion planning in discretized environments. Whenever you have two dimensions of choice and want an optimal path through them, you need a 2D table.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The man who invented dynamic programming lied about the name.** Richard Bellman coined the term in 1953 while working at RAND Corporation. He was a mathematician studying multi-stage decision processes — problems where you make a sequence of choices, each affecting future options. His actual work was mathematical research, but RAND was funded by the U.S. Air Force, and his boss, Secretary of Defense Charles Wilson, had a pathological aversion to the word "research." Bellman needed a name that sounded impressive, not academic. He chose "dynamic" because it was impossible to use in a pejorative sense, and "programming" because it had a connotation of planning and scheduling — not mathematics. "Dynamic programming" was political theater. The math underneath was profound.',
      '**What Bellman actually discovered: the Principle of Optimality.** In 1957 he published the foundational theorem: "An optimal policy has the property that whatever the initial state and initial decision are, the remaining decisions must constitute an optimal policy with regard to the state resulting from the first decision." In plain English: the best solution to any problem must include the best solutions to all its sub-problems. If your optimal path from A to C passes through B, then the A-to-B segment of that path must itself be optimal. This is what we mean by optimal substructure. And combined with overlapping subproblems, it gives us the license to build answers bottom-up in a table.',
      '**The 2D table: what it represents.** In 1D DP, dp[i] answers "what is the optimal result considering the first i elements?" In 2D DP, dp[i][j] answers "what is the optimal result considering the first i rows and the first j columns?" — or, more generally, "what is the best answer when both varying quantities are fixed at (i, j)?" The table is not a grid of values to search through; it is a grid of answers to sub-problems, each computed once and used by future cells. You fill it row by row (or column by column), and the final answer is usually in the last cell.',
      '**Unique Paths: counting routes through a grid.** A robot moves only right or down in an m×n grid. dp[i][j] = number of distinct paths to reach cell (i,j). The robot can arrive from above (i-1, j) or from the left (i, j-1). So dp[i][j] = dp[i-1][j] + dp[i][j-1]. Base cases: entire top row = 1 (only one way to reach any cell in the top row — go straight right), entire left column = 1 (only one way — go straight down). This is Bellman\'s Principle in action: the number of paths to (i,j) is exactly the sum of paths through the two cells that feed into it.',
      '**Minimum Path Sum: optimizing cost through a grid.** Now each cell has a cost. The robot still moves only right or down. dp[i][j] = minimum cost to reach cell (i,j). The robot arrives from the cheaper of the two options: from above or from the left. So dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]). Same structure, different operation. The pattern — "what feeds into this cell and what is the best of those options?" — is the universal grammar of grid DP.',
      '**Space optimization: from O(m×n) to O(n).** The 2D table only ever reads from the current row and the row above. So you can replace the full table with a single 1D array dp[] of length n, updating it in place as you scan each row. At cell (i,j), the updated dp[j] represents the current row, and dp[j-1] (already updated in the current row) is the left neighbor, while the old dp[j] (from the previous row) is the neighbor above. This collapses the 2D table to one row without changing the answer.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 1, Lesson 3: 2D DP — Grids',
        body: '**Previous:** 1D DP patterns — House Robber, Min Cost Stairs.\n**This lesson:** 2D DP — Unique Paths, Minimum Path Sum, seam carving intuition, space optimization.\n**Next:** Sequence DP — Longest Common Subsequence, Edit Distance (comparing two strings).',
      },
      {
        type: 'insight',
        title: 'The 2D DP recipe — same five steps, two dimensions',
        body: '1. **Define dp[i][j]:** "Best answer when the first dimension is fixed at i and the second at j"\n2. **Write the recurrence:** dp[i][j] = f(dp[i-1][j], dp[i][j-1], ...)\n3. **Initialize base cases:** first row and first column (no "above" or "left" to read from)\n4. **Fill the table:** row by row, left to right\n5. **Optimize space:** replace the 2D array with a single 1D row if you only look at the row above',
      },
      {
        type: 'strategy',
        title: 'How to spot a 2D DP problem',
        body: 'Ask: does this problem have TWO quantities that both vary? Grid position (row AND column), two string positions, amount AND coin type, capacity AND item index — these all scream 2D table. If you tried 1D DP and needed to parameterize the subproblem with two values, you need a 2D table.',
      },
      {
        type: 'insight',
        title: 'Seam carving: 2D DP in production',
        body: 'Adobe Photoshop\'s "Content-Aware Scale" uses a 2D DP grid on each row of the image. The energy function assigns a cost to each pixel based on local contrast. The algorithm finds the minimum-cost vertical path through the grid (a "seam") and removes it. The image shrinks by one column without distorting important content. This runs in O(W×H) time — grid DP at production scale, on every resize operation.',
      },
      {
        type: 'warning',
        title: 'Base cases in 2D are two full edges, not two single cells',
        body: 'In 1D, base cases are dp[0] and dp[1]. In 2D, base cases are the entire first row AND the entire first column — because cells in those edges have only one direction to come from. Forgetting to initialize the full edge (not just the corner) is the most common 2D DP bug.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: '2D DP Visualized: Unique Paths and Minimum Path Sum',
        caption: 'Watch the table fill cell by cell. Each value depends only on its left neighbor and its top neighbor — two inputs, one output, propagating from corner to corner.',
        props: {
          lesson: {
            title: '2D Dynamic Programming: Grid Tables',
            subtitle: 'Build the full table. See how each cell inherits from exactly two sources.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Unique Paths — Counting Routes Through a Grid',
                instruction: 'Each cell shows the number of distinct paths from the top-left to reach it. Top row = 1 (one way: go straight right). Left column = 1 (one way: go straight down). Every other cell = left neighbor + top neighbor. The answer is in the bottom-right.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const m = 5, n = 6;
const dp = Array.from({ length: m }, () => new Array(n).fill(0));
for (let j = 0; j < n; j++) dp[0][j] = 1;
for (let i = 0; i < m; i++) dp[i][0] = 1;
for (let i = 1; i < m; i++) {
  for (let j = 1; j < n; j++) {
    dp[i][j] = dp[i-1][j] + dp[i][j-1];
  }
}

function cellColor(val, max) {
  const t = Math.log(val + 1) / Math.log(max + 1);
  const r = Math.round(15 + t * (96 - 15));
  const g = Math.round(23 + t * (165 - 23));
  const b = Math.round(42 + t * (233 - 42));
  return "rgb(" + r + "," + g + "," + b + ")";
}
const maxVal = dp[m-1][n-1];

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:8px'>Unique Paths — " + m + " x " + n + " grid</div>";
h += "<div style='color:#94a3b8;font-size:12px;margin-bottom:10px'>dp[i][j] = dp[i-1][j] + dp[i][j-1] &nbsp; | &nbsp; top row and left col = 1</div>";
h += "<table style='border-collapse:collapse;margin-bottom:12px'>";
for (let i = 0; i < m; i++) {
  h += "<tr>";
  for (let j = 0; j < n; j++) {
    const isAnswer = (i === m-1 && j === n-1);
    const isEdge = (i === 0 || j === 0);
    const bg = isAnswer ? "#f59e0b" : isEdge ? "#1e3a5f" : cellColor(dp[i][j], maxVal);
    const color = isAnswer ? "#0f172a" : "#e2e8f0";
    h += "<td style='width:52px;height:40px;text-align:center;border:1px solid #334155;background:" + bg + ";color:" + color + ";font-weight:bold;font-size:13px'>" + dp[i][j] + "</td>";
  }
  h += "</tr>";
}
h += "</table>";
h += "<div style='background:#1e293b;border-radius:6px;padding:8px 12px;color:#f59e0b;font-size:13px'>Answer: dp[" + (m-1) + "][" + (n-1) + "] = <b>" + dp[m-1][n-1] + "</b> distinct paths</div>";
h += "<div style='margin-top:6px;color:#64748b;font-size:11px'>Darker blue = fewer paths | Brighter = more paths | Orange = answer</div>";
out.innerHTML = h;`,
                outputHeight: 310,
              },
              {
                type: 'js',
                title: 'Minimum Path Sum — Cheapest Route Through a Grid',
                instruction: 'Now each cell has a cost. Moving only right or down, find the minimum-cost path from top-left to bottom-right. dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]). The heat map shows accumulated cost — cooler means cheaper paths.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const grid = [
  [1, 3, 1, 5, 2],
  [1, 5, 1, 1, 4],
  [4, 2, 1, 3, 1],
  [2, 1, 4, 1, 2],
];
const m = grid.length, n = grid[0].length;
const dp = Array.from({ length: m }, () => new Array(n).fill(0));
dp[0][0] = grid[0][0];
for (let j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];
for (let i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];
for (let i = 1; i < m; i++) {
  for (let j = 1; j < n; j++) {
    dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);
  }
}

const minVal = 1, maxVal = dp[m-1][n-1];
function heatColor(val) {
  const t = (val - minVal) / (maxVal - minVal);
  const r = Math.round(15 + t * 240);
  const g = Math.round(130 - t * 70);
  const b = Math.round(120 - t * 80);
  return "rgb(" + r + "," + g + "," + b + ")";
}

// Trace optimal path backwards
const path = new Set();
let pi = m-1, pj = n-1;
path.add(pi + "," + pj);
while (pi > 0 || pj > 0) {
  if (pi === 0) pj--;
  else if (pj === 0) pi--;
  else if (dp[pi-1][pj] < dp[pi][pj-1]) pi--;
  else pj--;
  path.add(pi + "," + pj);
}

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:4px'>Minimum Path Sum — " + m + " x " + n + " grid</div>";
h += "<div style='color:#94a3b8;font-size:12px;margin-bottom:8px'>dp[i][j] = grid[i][j] + min(above, left) &nbsp; | &nbsp; starred cells = optimal path</div>";
h += "<div style='display:flex;gap:16px;margin-bottom:8px'>";
h += "<div><div style='color:#64748b;font-size:11px;margin-bottom:4px'>Grid (costs)</div><table style='border-collapse:collapse'>";
for (let i = 0; i < m; i++) {
  h += "<tr>";
  for (let j = 0; j < n; j++) {
    h += "<td style='width:36px;height:32px;text-align:center;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:12px'>" + grid[i][j] + "</td>";
  }
  h += "</tr>";
}
h += "</table></div>";
h += "<div><div style='color:#64748b;font-size:11px;margin-bottom:4px'>DP table (accumulated)</div><table style='border-collapse:collapse'>";
for (let i = 0; i < m; i++) {
  h += "<tr>";
  for (let j = 0; j < n; j++) {
    const isPath = path.has(i + "," + j);
    const bg = isPath ? "#f59e0b" : heatColor(dp[i][j]);
    const color = isPath ? "#0f172a" : "#e2e8f0";
    h += "<td style='width:36px;height:32px;text-align:center;border:1px solid #334155;background:" + bg + ";color:" + color + ";font-weight:bold;font-size:12px'>" + dp[i][j] + (isPath ? "*" : "") + "</td>";
  }
  h += "</tr>";
}
h += "</table></div></div>";
h += "<div style='background:#1c1917;border-radius:6px;padding:8px 12px;color:#f59e0b'>Min cost: <b>" + dp[m-1][n-1] + "</b> &nbsp; (starred cells show the optimal path)</div>";
out.innerHTML = h;`,
                outputHeight: 320,
              },
              {
                type: 'js',
                title: 'Space Optimization — O(m×n) Table Compressed to O(n)',
                instruction: 'The 2D table only reads from the row above. Replace it with a single 1D array. Before updating dp[j], the old dp[j] holds the value from the row above (from above). After updating dp[j-1], that holds the value from the left (current row). One array, no full table needed.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const grid = [
  [1, 3, 1, 5, 2],
  [1, 5, 1, 1, 4],
  [4, 2, 1, 3, 1],
  [2, 1, 4, 1, 2],
];
const m = grid.length, n = grid[0].length;

// 2D version for comparison
const dp2d = Array.from({ length: m }, () => new Array(n).fill(0));
dp2d[0][0] = grid[0][0];
for (let j = 1; j < n; j++) dp2d[0][j] = dp2d[0][j-1] + grid[0][j];
for (let i = 1; i < m; i++) dp2d[i][0] = dp2d[i-1][0] + grid[i][0];
for (let i = 1; i < m; i++)
  for (let j = 1; j < n; j++)
    dp2d[i][j] = grid[i][j] + Math.min(dp2d[i-1][j], dp2d[i][j-1]);

// 1D version — track snapshots
const snapshots = [];
const dp = new Array(n).fill(0);
dp[0] = grid[0][0];
for (let j = 1; j < n; j++) dp[j] = dp[j-1] + grid[0][j];
snapshots.push({ row: 0, arr: [...dp], label: "After row 0 (base case: cumulative sum)" });

for (let i = 1; i < m; i++) {
  dp[0] += grid[i][0];
  for (let j = 1; j < n; j++) {
    dp[j] = grid[i][j] + Math.min(dp[j], dp[j-1]);
  }
  snapshots.push({ row: i, arr: [...dp], label: "After row " + i });
}

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:10px'>Space Optimization: Single 1D Array</div>";
h += "<div style='color:#94a3b8;font-size:12px;margin-bottom:10px'>dp[j] before update = value from row above. dp[j-1] after update = value from left. Same recurrence, one array.</div>";
snapshots.forEach(function(s) {
  h += "<div style='margin-bottom:6px'>";
  h += "<div style='color:#64748b;font-size:11px;margin-bottom:3px'>" + s.label + ":</div>";
  h += "<div style='display:flex;gap:4px'>";
  s.arr.forEach(function(v, j) {
    const isLast = (j === n-1 && s.row === m-1);
    h += "<div style='background:" + (isLast ? "#f59e0b" : "#1e293b") + ";color:" + (isLast ? "#0f172a" : "#4ade80") + ";font-weight:bold;padding:5px 8px;border-radius:4px;font-size:13px;min-width:32px;text-align:center'>" + v + "</div>";
  });
  h += "</div></div>";
});
h += "<div style='margin-top:8px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80'>Answer: dp[" + (n-1) + "] = <b>" + dp[n-1] + "</b> — same as 2D table result: " + dp2d[m-1][n-1] + "</div>";
out.innerHTML = h;`,
                outputHeight: 320,
              },
              {
                type: 'js',
                title: 'Seam Carving — 2D DP in Production Image Processing',
                instruction: 'Seam carving finds the minimum-energy vertical path through an image to remove it for content-aware resizing. This cell simulates it on a grayscale energy matrix. The DP table accumulates energy top-down. The minimum-cost seam is then traced back from the bottom.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");

// Simulated energy map (like pixel contrast values in an image)
// Lower = boring background, Higher = important edge content
const energy = [
  [9, 9, 0, 9, 9, 9, 0, 9],
  [9, 9, 0, 9, 9, 9, 0, 9],
  [9, 9, 0, 9, 9, 9, 0, 9],
  [9, 0, 0, 0, 9, 0, 0, 0],
  [9, 0, 9, 9, 9, 0, 9, 9],
  [9, 0, 9, 9, 9, 0, 9, 9],
  [9, 0, 0, 0, 0, 0, 9, 9],
  [9, 9, 9, 9, 9, 9, 9, 9],
];
const rows = energy.length, cols = energy[0].length;

// Build DP table: minimum cumulative energy to reach each cell from the top
const dp = energy.map(function(row) { return row.slice(); });
for (let i = 1; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    const above = dp[i-1][j];
    const aboveLeft = j > 0 ? dp[i-1][j-1] : Infinity;
    const aboveRight = j < cols-1 ? dp[i-1][j+1] : Infinity;
    dp[i][j] = energy[i][j] + Math.min(above, aboveLeft, aboveRight);
  }
}

// Find the seam: start at minimum in last row, trace back
const seam = new Array(rows);
let minJ = 0;
for (let j = 1; j < cols; j++) if (dp[rows-1][j] < dp[rows-1][minJ]) minJ = j;
seam[rows-1] = minJ;
for (let i = rows-2; i >= 0; i--) {
  const j = seam[i+1];
  let best = j;
  if (j > 0 && dp[i][j-1] < dp[i][best]) best = j-1;
  if (j < cols-1 && dp[i][j+1] < dp[i][best]) best = j+1;
  seam[i] = best;
}
const seamSet = new Set(seam.map(function(j, i) { return i + "," + j; }));

function energyColor(v) {
  return v === 0 ? "#1e293b" : v <= 3 ? "#1e3a5f" : "#f59e0b";
}
function dpColor(v, maxDp) {
  const t = v / maxDp;
  return "rgb(" + Math.round(15 + t*180) + "," + Math.round(23 + t*60) + "," + Math.round(100 - t*60) + ")";
}
const maxDp = Math.max(...dp.flat());

let h = "<div style='display:flex;gap:16px'>";
// Energy grid
h += "<div><div style='color:#64748b;font-size:11px;margin-bottom:4px'>Energy map (0=low, 9=high)</div><table style='border-collapse:collapse'>";
for (let i = 0; i < rows; i++) {
  h += "<tr>";
  for (let j = 0; j < cols; j++) {
    const seamed = seamSet.has(i + "," + j);
    h += "<td style='width:30px;height:24px;text-align:center;border:1px solid #334155;background:" + (seamed ? "#f87171" : energyColor(energy[i][j])) + ";color:#e2e8f0;font-size:11px;font-weight:bold'>" + energy[i][j] + "</td>";
  }
  h += "</tr>";
}
h += "</table></div>";
// DP table
h += "<div><div style='color:#64748b;font-size:11px;margin-bottom:4px'>DP table (cumulative min energy)</div><table style='border-collapse:collapse'>";
for (let i = 0; i < rows; i++) {
  h += "<tr>";
  for (let j = 0; j < cols; j++) {
    const seamed = seamSet.has(i + "," + j);
    h += "<td style='width:30px;height:24px;text-align:center;border:1px solid #334155;background:" + (seamed ? "#f87171" : dpColor(dp[i][j], maxDp)) + ";color:#e2e8f0;font-size:10px;font-weight:bold'>" + dp[i][j] + "</td>";
  }
  h += "</tr>";
}
h += "</table></div></div>";
h += "<div style='margin-top:10px;background:#450a0a;border-radius:6px;padding:8px 12px;color:#f87171;font-size:12px'>Red cells = minimum energy seam (total cost: " + dp[rows-1][seam[rows-1]] + "). Removing this column resizes the image without distorting important content.</div>";
h += "<div style='margin-top:6px;color:#64748b;font-size:11px'>This exact algorithm runs in Photoshop Content-Aware Scale. Grid DP at production scale.</div>";
out.innerHTML = h;`,
                outputHeight: 360,
              },
            ],
          },
        },
      },
      {
        id: 'JSNotebook',
        title: 'Grid DP in JavaScript — Build It From Scratch',
        caption: 'Unique Paths, Minimum Path Sum, and space-optimized variants. Every cell is a TODO that teaches the recurrence.',
        props: {
          lesson: {
            title: '2D Dynamic Programming in JavaScript',
            subtitle: 'Build the table. Trace the recurrence. Then optimize.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Unique Paths

A robot in an m×n grid moves only right or down. Count distinct paths from top-left to bottom-right.

**Recurrence:** \`dp[i][j] = dp[i-1][j] + dp[i][j-1]\`

**Base cases:** entire top row = 1, entire left column = 1.

Fill row by row. The answer is \`dp[m-1][n-1]\`.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function uniquePaths(m, n) {
  // TODO: create dp array m x n filled with 0
  // TODO: set entire first row to 1
  // TODO: set entire first column to 1
  // TODO: fill dp[i][j] = dp[i-1][j] + dp[i][j-1] for i,j >= 1
  // TODO: return dp[m-1][n-1]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("3x7",   uniquePaths(3, 7),   28);
check("3x2",   uniquePaths(3, 2),   3);
check("1x1",   uniquePaths(1, 1),   1);
check("1x10",  uniquePaths(1, 10),  1);
check("5x5",   uniquePaths(5, 5),   70);
check("10x10", uniquePaths(10, 10), 48620);`,
                solutionCode: `function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) dp[0][j] = 1;
  for (let i = 0; i < m; i++) dp[i][0] = 1;
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      dp[i][j] = dp[i-1][j] + dp[i][j-1];
  return dp[m-1][n-1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("3x7",   uniquePaths(3, 7),   28);
check("3x2",   uniquePaths(3, 2),   3);
check("1x1",   uniquePaths(1, 1),   1);
check("1x10",  uniquePaths(1, 10),  1);
check("5x5",   uniquePaths(5, 5),   70);
check("10x10", uniquePaths(10, 10), 48620);`,
                outputHeight: 140,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Unique Paths II: Obstacles

Same grid, but some cells are blocked (value 1 in obstacle grid). A path cannot go through a blocked cell.

**Key changes from Step 1:**
- If \`obstacle[i][j] === 1\`, set \`dp[i][j] = 0\` (no paths through here)
- First row: once you hit an obstacle, all cells to the right get 0 (can only come from left, and that path is blocked)
- First column: same logic going down`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function uniquePathsWithObstacles(grid) {
  const m = grid.length, n = grid[0].length;
  if (grid[0][0] === 1 || grid[m-1][n-1] === 1) return 0;
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));

  // TODO: fill first row — stop at first obstacle (everything after = 0)
  // TODO: fill first column — stop at first obstacle
  // TODO: fill dp[i][j]: if obstacle, set 0; else dp[i-1][j] + dp[i][j-1]
  // TODO: return dp[m-1][n-1]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

// [[0,0,0],[0,1,0],[0,0,0]] -> 2
check("3x3 center blocked", uniquePathsWithObstacles([[0,0,0],[0,1,0],[0,0,0]]), 2);
// [[0,1],[0,0]] -> 1
check("2x2 top-right blocked", uniquePathsWithObstacles([[0,1],[0,0]]), 1);
// [[1,0]] -> 0  (start is blocked)
check("blocked start", uniquePathsWithObstacles([[1,0]]), 0);
check("no obstacles", uniquePathsWithObstacles([[0,0,0],[0,0,0],[0,0,0]]), 6);`,
                solutionCode: `function uniquePathsWithObstacles(grid) {
  const m = grid.length, n = grid[0].length;
  if (grid[0][0] === 1 || grid[m-1][n-1] === 1) return 0;
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    if (grid[0][j] === 1) break;
    dp[0][j] = 1;
  }
  for (let i = 0; i < m; i++) {
    if (grid[i][0] === 1) break;
    dp[i][0] = 1;
  }
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (grid[i][j] === 1) { dp[i][j] = 0; continue; }
      dp[i][j] = dp[i-1][j] + dp[i][j-1];
    }
  }
  return dp[m-1][n-1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("3x3 center blocked", uniquePathsWithObstacles([[0,0,0],[0,1,0],[0,0,0]]), 2);
check("2x2 top-right blocked", uniquePathsWithObstacles([[0,1],[0,0]]), 1);
check("blocked start", uniquePathsWithObstacles([[1,0]]), 0);
check("no obstacles", uniquePathsWithObstacles([[0,0,0],[0,0,0],[0,0,0]]), 6);`,
                outputHeight: 120,
              },
              {
                type: 'js',
                instruction: `## Step 3 — Minimum Path Sum

Each cell has a cost. Move only right or down. Find the path with minimum total cost.

**Recurrence:** \`dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])\`

**Base cases:** \`dp[0][0] = grid[0][0]\`, first row is a running sum going right, first column is a running sum going down.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function minPathSum(grid) {
  const m = grid.length, n = grid[0].length;
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));
  // TODO: dp[0][0] = grid[0][0]
  // TODO: first row: dp[0][j] = dp[0][j-1] + grid[0][j]
  // TODO: first col:  dp[i][0] = dp[i-1][0] + grid[i][0]
  // TODO: rest: dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
  // TODO: return dp[m-1][n-1]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("3x3 example", minPathSum([[1,3,1],[1,5,1],[4,2,1]]), 7);
check("2x3 example", minPathSum([[1,2,3],[4,5,6]]), 12);
check("1x1", minPathSum([[5]]), 5);
check("1x3", minPathSum([[1,2,3]]), 6);`,
                solutionCode: `function minPathSum(grid) {
  const m = grid.length, n = grid[0].length;
  const dp = Array.from({ length: m }, () => new Array(n).fill(0));
  dp[0][0] = grid[0][0];
  for (let j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];
  for (let i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);
  return dp[m-1][n-1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("3x3 example", minPathSum([[1,3,1],[1,5,1],[4,2,1]]), 7);
check("2x3 example", minPathSum([[1,2,3],[4,5,6]]), 12);
check("1x1", minPathSum([[5]]), 5);
check("1x3", minPathSum([[1,2,3]]), 6);`,
                outputHeight: 120,
              },
              {
                type: 'js',
                instruction: `## Step 4 — Space Optimization: O(m*n) → O(n)

The full 2D table for Minimum Path Sum uses O(m*n) space. But you only ever look at the current row and the row above. Replace the 2D table with a single 1D array.

**The trick:** when updating \`dp[j]\`, the old \`dp[j]\` still holds the value from the row above (not yet overwritten). The already-updated \`dp[j-1]\` holds the value from the left in the current row. Same recurrence, one array.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function minPathSumSpaceOptimized(grid) {
  const m = grid.length, n = grid[0].length;
  // TODO: create 1D dp array of length n
  // TODO: initialize dp[0] = grid[0][0]
  // TODO: fill first row: dp[j] = dp[j-1] + grid[0][j]
  // TODO: for each row i from 1 to m-1:
  //         dp[0] += grid[i][0]  (only one way down the first column)
  //         for j from 1 to n-1:
  //           dp[j] = grid[i][j] + min(dp[j], dp[j-1])
  //           ^ dp[j] = from above (not yet overwritten)
  //           ^ dp[j-1] = from left (already updated this row)
  // TODO: return dp[n-1]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("3x3", minPathSumSpaceOptimized([[1,3,1],[1,5,1],[4,2,1]]), 7);
check("2x3", minPathSumSpaceOptimized([[1,2,3],[4,5,6]]), 12);
check("5x5 large", minPathSumSpaceOptimized([[1,3,1,5,2],[1,5,1,1,4],[4,2,1,3,1],[2,1,4,1,2],[3,2,1,4,1]]), 10);`,
                solutionCode: `function minPathSumSpaceOptimized(grid) {
  const m = grid.length, n = grid[0].length;
  const dp = new Array(n).fill(0);
  dp[0] = grid[0][0];
  for (let j = 1; j < n; j++) dp[j] = dp[j-1] + grid[0][j];
  for (let i = 1; i < m; i++) {
    dp[0] += grid[i][0];
    for (let j = 1; j < n; j++) {
      dp[j] = grid[i][j] + Math.min(dp[j], dp[j-1]);
    }
  }
  return dp[n-1];
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("3x3", minPathSumSpaceOptimized([[1,3,1],[1,5,1],[4,2,1]]), 7);
check("2x3", minPathSumSpaceOptimized([[1,2,3],[4,5,6]]), 12);
check("5x5 large", minPathSumSpaceOptimized([[1,3,1,5,2],[1,5,1,1,4],[4,2,1,3,1],[2,1,4,1,2],[3,2,1,4,1]]), 10);`,
                outputHeight: 120,
              },
            ],
          },
        },
      },
      {
        id: 'PythonNotebook',
        title: 'Grid DP in Python — Visualize the Table',
        caption: 'Build each DP table, render it as a heatmap, trace the optimal path, and implement from scratch.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Unique Paths — Build and Visualize the DP Table',
              code: `import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np


def unique_paths(m: int, n: int) -> int:
    dp = [[0] * n for _ in range(m)]
    for j in range(n): dp[0][j] = 1
    for i in range(m): dp[i][0] = 1
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]


def visualize_unique_paths(m: int, n: int) -> None:
    dp = [[0] * n for _ in range(m)]
    for j in range(n): dp[0][j] = 1
    for i in range(m): dp[i][0] = 1
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]

    data = np.log1p(np.array(dp, dtype=float))  # log scale for color

    fig, ax = plt.subplots(figsize=(n * 0.9, m * 0.8), facecolor="#0f172a")
    ax.set_facecolor("#0f172a")
    im = ax.imshow(data, cmap="Blues", aspect="auto")

    for i in range(m):
        for j in range(n):
            color = "white" if data[i][j] > data.max() * 0.5 else "#94a3b8"
            weight = "bold" if (i == m-1 and j == n-1) else "normal"
            ax.text(j, i, str(dp[i][j]), ha="center", va="center",
                    color=color, fontsize=11, fontweight=weight)

    ax.set_xticks(range(n))
    ax.set_yticks(range(m))
    ax.set_xticklabels([f"col {j}" for j in range(n)], color="#94a3b8", fontsize=9)
    ax.set_yticklabels([f"row {i}" for i in range(m)], color="#94a3b8", fontsize=9)
    ax.tick_params(colors="#94a3b8")
    ax.spines[:].set_color("#334155")
    ax.set_title(f"Unique Paths — {m}x{n} grid — Answer: {dp[m-1][n-1]}",
                 color="#e2e8f0", fontsize=12)
    plt.tight_layout()
    plt.show()


visualize_unique_paths(5, 7)
print(f"unique_paths(3, 7) = {unique_paths(3, 7)}")   # 28
print(f"unique_paths(5, 5) = {unique_paths(5, 5)}")   # 70
print(f"unique_paths(10,10) = {unique_paths(10, 10)}") # 48620`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Minimum Path Sum — Heatmap + Optimal Path Trace',
              code: `import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np


def min_path_sum(grid: list[list[int]]) -> int:
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    dp[0][0] = grid[0][0]
    for j in range(1, n): dp[0][j] = dp[0][j-1] + grid[0][j]
    for i in range(1, m): dp[i][0] = dp[i-1][0] + grid[i][0]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
    return dp[m-1][n-1]


def trace_path(dp: list[list[int]], grid: list[list[int]]) -> list[tuple]:
    m, n = len(dp), len(dp[0])
    path = []
    i, j = m-1, n-1
    path.append((i, j))
    while i > 0 or j > 0:
        if i == 0:
            j -= 1
        elif j == 0:
            i -= 1
        elif dp[i-1][j] < dp[i][j-1]:
            i -= 1
        else:
            j -= 1
        path.append((i, j))
    return path


def visualize_min_path(grid: list[list[int]]) -> None:
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    dp[0][0] = grid[0][0]
    for j in range(1, n): dp[0][j] = dp[0][j-1] + grid[0][j]
    for i in range(1, m): dp[i][0] = dp[i-1][0] + grid[i][0]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])

    path = set(trace_path(dp, grid))
    data = np.array(dp, dtype=float)

    fig, axes = plt.subplots(1, 2, figsize=(12, 4), facecolor="#0f172a")
    for ax in axes:
        ax.set_facecolor("#0f172a")

    # Left: grid costs
    axes[0].imshow(np.array(grid, dtype=float), cmap="YlOrRd_r", aspect="auto")
    for i in range(m):
        for j in range(n):
            in_path = (i, j) in path
            axes[0].text(j, i, str(grid[i][j]), ha="center", va="center",
                         color="#f59e0b" if in_path else "#e2e8f0",
                         fontsize=12, fontweight="bold" if in_path else "normal")
    axes[0].set_title("Grid (costs)", color="#e2e8f0")
    axes[0].set_xticks(range(n))
    axes[0].set_yticks(range(m))
    axes[0].tick_params(colors="#94a3b8")

    # Right: DP table
    axes[1].imshow(data, cmap="Blues", aspect="auto")
    for i in range(m):
        for j in range(n):
            in_path = (i, j) in path
            axes[1].text(j, i, str(dp[i][j]),
                         ha="center", va="center",
                         color="#f59e0b" if in_path else "#e2e8f0",
                         fontsize=12, fontweight="bold" if in_path else "normal")
    axes[1].set_title(f"DP table — optimal = {dp[m-1][n-1]}", color="#e2e8f0")
    axes[1].set_xticks(range(n))
    axes[1].set_yticks(range(m))
    axes[1].tick_params(colors="#94a3b8")

    fig.suptitle("Minimum Path Sum (highlighted = optimal path)", color="#94a3b8", fontsize=10)
    plt.tight_layout()
    plt.show()


visualize_min_path([[1,3,1],[1,5,1],[4,2,1]])
print(f"min_path_sum([[1,3,1],[1,5,1],[4,2,1]]) = {min_path_sum([[1,3,1],[1,5,1],[4,2,1]])}")  # 7`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Space Optimization — Side-by-Side Comparison',
              code: `"""
Compare memory usage: full 2D table vs 1D rolling array.
Both produce the same answer. The 1D version uses O(n) instead of O(m*n).
"""
import sys


def min_path_sum_2d(grid: list[list[int]]) -> tuple[int, int]:
    """Returns (answer, bytes_used)."""
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    dp[0][0] = grid[0][0]
    for j in range(1, n): dp[0][j] = dp[0][j-1] + grid[0][j]
    for i in range(1, m): dp[i][0] = dp[i-1][0] + grid[i][0]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
    return dp[m-1][n-1], sys.getsizeof(dp) * m


def min_path_sum_1d(grid: list[list[int]]) -> tuple[int, int]:
    """Returns (answer, bytes_used)."""
    m, n = len(grid), len(grid[0])
    dp = [0] * n
    dp[0] = grid[0][0]
    for j in range(1, n): dp[j] = dp[j-1] + grid[0][j]
    for i in range(1, m):
        dp[0] += grid[i][0]
        for j in range(1, n):
            dp[j] = grid[i][j] + min(dp[j], dp[j-1])
    return dp[n-1], sys.getsizeof(dp)


# Test on different grid sizes
grids = {
    "3x3":   [[1,3,1],[1,5,1],[4,2,1]],
    "5x5":   [[1,3,1,5,2],[1,5,1,1,4],[4,2,1,3,1],[2,1,4,1,2],[3,2,1,4,1]],
    "10x10": [[i+j for j in range(10)] for i in range(10)],
}

print(f"{'Grid':<10} {'2D answer':<12} {'1D answer':<12} {'Match'}")
print("-" * 45)
for name, grid in grids.items():
    ans_2d, _ = min_path_sum_2d(grid)
    ans_1d, _ = min_path_sum_1d(grid)
    match = "OK" if ans_2d == ans_1d else "MISMATCH"
    print(f"{name:<10} {ans_2d:<12} {ans_1d:<12} {match}")

# Assertions
assert min_path_sum_1d([[1,3,1],[1,5,1],[4,2,1]])[0] == 7
assert min_path_sum_1d([[1,2,3],[4,5,6]])[0] == 12
print("\nAll assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'From Scratch: Triangle and Dungeon Game',
              code: `"""
FROM SCRATCH CHALLENGES

TRIANGLE (LeetCode 120)
  Given a triangle array, find the minimum path sum from top to bottom.
  At each row i, you can move to adjacent elements in row i+1
  (index j or j+1 from index j in row i).
  Hint: work bottom-up. Start from second-to-last row.
  dp[i][j] = triangle[i][j] + min(dp[i+1][j], dp[i+1][j+1])
  Space optimization: use a 1D array.

DUNGEON GAME (LeetCode 174)
  Knight starts top-left, princess at bottom-right.
  Each cell adds or removes health. Knight dies if health <= 0.
  Find minimum initial health to guarantee survival.
  Key: work BACKWARDS from the princess (bottom-right to top-left).
  dp[i][j] = minimum health needed when ENTERING cell (i,j).
"""


def minimum_total(triangle: list[list[int]]) -> int:
    # YOUR CODE HERE
    pass


def calculate_minimum_hp(dungeon: list[list[int]]) -> int:
    # YOUR CODE HERE
    pass


# --- Triangle tests ---
# assert minimum_total([[2],[3,4],[6,5,7],[4,1,8,3]]) == 11
# assert minimum_total([[-10]]) == -10
# print("Triangle: all passed!")

# --- Dungeon tests ---
# assert calculate_minimum_hp([[-2,-3,3],[-5,-10,1],[10,30,-5]]) == 7
# assert calculate_minimum_hp([[0]]) == 1
# print("Dungeon: all passed!")`,
            },
          ],
        },
      },
    ],
  },
};
