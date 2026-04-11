export default {
  id: 'dp1-002',
  slug: '1d-dp-patterns',
  chapter: 'dp1',
  order: 2,
  title: '1D DP Patterns',
  subtitle: 'House Robber, Min Cost Climbing Stairs, and the include-vs-exclude decision',
  tags: ['dynamic programming', 'house robber', 'min cost climbing stairs', 'include exclude', '1D DP', 'state machine'],
  aliases: 'DP patterns 1D linear array house robber rob adjacent min cost stairs decision',

  hook: {
    question: 'You are a thief on a street of houses. You can rob any house — but adjacent houses share an alarm. Rob two in a row and you trip it. Which houses maximize your haul? Greedy fails: always grabbing the biggest house misses combinations that beat it. The right answer requires asking at every house: what is the best outcome if I rob it, and what is the best if I skip it? That two-state question is the engine of all 1D dynamic programming.',
    realWorldContext: 'The include-vs-exclude DP pattern appears throughout real systems: portfolio selection (include this asset or not?), job scheduling (take this job or the one that ends later?), rod cutting for maximum price, and non-overlapping interval selection. The minimize-cost variant powers route planning, text justification, and compiler register allocation. These two shapes cover a huge fraction of real-world optimization problems.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The include-vs-exclude recurrence.** At every house you make one decision: rob it or skip it. If you rob house i, you must have skipped house i-1, so you carry forward the best you could do up to house i-2 plus the current value. If you skip house i, you carry forward the best up to house i-1. Formally: `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`. That is the entire problem.',
      '**Why greedy fails.** Consider [1, 100, 1, 1, 100, 1]. The greedy algorithm sees 100 at index 1, grabs it, then sees 100 at index 4, grabs it — total 200. But that is actually optimal here. The failure case is more subtle: [5, 1, 1, 5]. Greedy takes 5 at index 0, skips 1, takes 1 at index 2, cannot take the final 5 (adjacent to index 2)... actually takes 5+1=6. But optimal is 5+5=10 by taking indices 0 and 3. Greedy is permanently one-step-sighted; DP considers the full chain.',
      '**Min Cost Climbing Stairs: the minimize shape.** Instead of maximizing loot, you pay a cost to step on each stair and want to reach the top cheaply. You can step from stair i to i+1 or i+2. So `dp[i] = cost[i] + min(dp[i-1], dp[i-2])`. The structure is identical to House Robber — the only change is max to min and values are costs not profits. This is the template for all min-cost path DP.',
      '**Space optimization.** Both problems only look back two steps. You never need the full dp array — just two variables, prev2 and prev1. Update them in a loop and discard everything else. This compresses O(n) space to O(1). The trick works whenever your recurrence depends on a constant number of previous states.',
      '**The state machine view.** Think of dp[i] as: "What is the best outcome I can guarantee considering only the first i items?" In House Robber, state is simply the best value achievable. In more complex problems (like stock trading with cooldowns), you track multiple states per position — but the same pattern holds: enumerate states, write the transition for each, initialize correctly, read from the final state.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 1, Lesson 2: 1D DP Patterns',
        body: '**Previous:** What is DP? — overlapping subproblems, memoization, tabulation.\n**This lesson:** House Robber (include-vs-exclude), Min Cost Stairs (minimize variant), space optimization to O(1).\n**Next:** 2D DP — grids, sequences, unique paths, edit distance.',
      },
      {
        type: 'insight',
        title: 'The 1D DP recipe — five steps every time',
        body: '1. **Define dp[i]:** "Best outcome considering the first i elements"\n2. **Write the recurrence:** dp[i] = f(dp[i-1], dp[i-2], ...)\n3. **Initialize base cases:** dp[0], dp[1] before the loop\n4. **Read the answer:** usually dp[n-1] or min(dp[n-1], dp[n-2])\n5. **Optimize space:** replace the array with two variables if you only look back 2 steps',
      },
      {
        type: 'strategy',
        title: 'How to write the recurrence for any new 1D problem',
        body: 'Ask at each position i: "What choices brought me here?" For each choice, compute: (cost or value of that choice) + (best result of the subproblem that choice implies). Take the max or min across all choices. That expression IS the recurrence.',
      },
      {
        type: 'warning',
        title: 'Base cases are where most bugs hide',
        body: 'Off-by-one errors in DP almost always live in the base cases. Always ask: what is dp[0]? What is dp[1]? What does my recurrence assume is already filled? Write them explicitly before the loop. If the input has 0 or 1 element, return early — do not let the loop run on uninitialized state.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'House Robber and Min Cost Stairs: DP Tables Step by Step',
        caption: 'Build the dp array cell by cell, see the recurrence fire at each position, then watch the space-optimized version track only two variables.',
        props: {
          lesson: {
            title: '1D Dynamic Programming Patterns',
            subtitle: 'Include-vs-exclude, minimize variants, and O(1) space optimization.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'House Robber — Building the DP Table',
                instruction: 'At each house, pick the better of two choices: rob it (take its value plus the best result two houses back) or skip it (carry forward the best result one house back). The table fills left to right.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const nums = [2, 7, 9, 3, 1];
const n = nums.length;
const dp = new Array(n).fill(0);
dp[0] = nums[0];
dp[1] = Math.max(nums[0], nums[1]);
for (let i = 2; i < n; i++) {
  dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
}

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:10px'>Houses: [" + nums.join(", ") + "]</div>";
h += "<div style='color:#94a3b8;font-size:12px;margin-bottom:8px'>dp[i] = best loot reachable using the first i+1 houses</div>";
h += "<div style='display:flex;gap:8px;margin-bottom:16px'>";
for (let i = 0; i < n; i++) {
  h += "<div style='text-align:center'>" +
    "<div style='background:#1e293b;border:1px solid #334155;border-radius:4px;padding:6px 10px;color:#4ade80;font-weight:bold;min-width:36px'>" + dp[i] + "</div>" +
    "<div style='color:#64748b;font-size:11px;margin-top:2px'>dp[" + i + "]</div>" +
    "<div style='color:#94a3b8;font-size:11px'>val=" + nums[i] + "</div></div>";
}
h += "</div>";
const steps = [];
for (let i = 2; i < n; i++) {
  const rob = dp[i - 2] + nums[i];
  const skip = dp[i - 1];
  steps.push("<div style='margin-top:3px;color:#94a3b8;font-size:12px'>dp[" + i + "] = max(skip=" + skip + ", rob=dp[" + (i-2) + "]+" + nums[i] + "=" + rob + ") = <b style='color:#f0abfc'>" + dp[i] + "</b></div>");
}
h += "<div style='margin-top:8px;border-top:1px solid #1e293b;padding-top:8px'>" + steps.join("") + "</div>";
h += "<div style='margin-top:12px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80'>Answer: dp[" + (n-1) + "] = <b>" + dp[n-1] + "</b></div>";
out.innerHTML = h;`,
                outputHeight: 260,
              },
              {
                type: 'js',
                title: 'Space Optimization — O(n) Table Collapsed to O(1)',
                instruction: 'The recurrence only looks back two steps. Replace the full array with two sliding variables. The table below shows prev2 and prev1 at each step — the answer never changes, the memory footprint drops to constant.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const nums = [2, 7, 9, 3, 1];

function rob(arr) {
  if (arr.length === 1) return arr[0];
  let prev2 = arr[0];
  let prev1 = Math.max(arr[0], arr[1]);
  const trace = [
    { i: 0, prev2: "—", prev1: arr[0], curr: arr[0], note: "base: prev2 = arr[0]" },
    { i: 1, prev2: arr[0], prev1: Math.max(arr[0], arr[1]), curr: Math.max(arr[0], arr[1]), note: "base: prev1 = max(arr[0], arr[1])" },
  ];
  for (let i = 2; i < arr.length; i++) {
    const curr = Math.max(prev1, prev2 + arr[i]);
    trace.push({ i, prev2, prev1, curr, note: "max(prev1=" + prev1 + ", prev2+val=" + (prev2 + arr[i]) + ")" });
    prev2 = prev1;
    prev1 = curr;
  }
  return { answer: prev1, trace };
}

const { answer, trace } = rob(nums);
let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:8px'>Houses: [" + nums.join(", ") + "]</div>";
h += "<table style='border-collapse:collapse;width:100%;font-size:12px;margin-bottom:12px'>";
h += "<tr style='color:#64748b'><td style='padding:3px 6px'>i</td><td style='padding:3px 6px'>val</td><td style='padding:3px 6px'>prev2</td><td style='padding:3px 6px'>prev1</td><td style='padding:3px 6px'>curr</td><td style='padding:3px 6px'>decision</td></tr>";
trace.forEach(function(s) {
  h += "<tr style='border-top:1px solid #1e293b'>" +
    "<td style='padding:3px 6px;color:#94a3b8'>" + s.i + "</td>" +
    "<td style='padding:3px 6px;color:#e2e8f0'>" + (nums[s.i] !== undefined ? nums[s.i] : "—") + "</td>" +
    "<td style='padding:3px 6px;color:#f59e0b'>" + s.prev2 + "</td>" +
    "<td style='padding:3px 6px;color:#f59e0b'>" + s.prev1 + "</td>" +
    "<td style='padding:3px 6px;color:#4ade80;font-weight:bold'>" + s.curr + "</td>" +
    "<td style='padding:3px 6px;color:#94a3b8'>" + s.note + "</td></tr>";
});
h += "</table>";
h += "<div style='background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80'>Answer: <b>" + answer + "</b> — identical to the O(n) table, zero extra memory.</div>";
out.innerHTML = h;`,
                outputHeight: 240,
              },
              {
                type: 'js',
                title: 'Min Cost Climbing Stairs — The Minimize Shape',
                instruction: 'Flip max to min and treat values as costs instead of profits. The recurrence is dp[i] = cost[i] + min(dp[i-1], dp[i-2]). The top is reached from either the last or second-to-last step.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");
const cost = [10, 15, 20, 5, 30, 8];
const n = cost.length;
const dp = new Array(n).fill(0);
dp[0] = cost[0];
dp[1] = cost[1];
for (let i = 2; i < n; i++) {
  dp[i] = cost[i] + Math.min(dp[i - 1], dp[i - 2]);
}
const answer = Math.min(dp[n - 1], dp[n - 2]);

let h = "<div style='color:#60a5fa;font-size:14px;margin-bottom:8px'>Costs: [" + cost.join(", ") + "]</div>";
h += "<div style='color:#94a3b8;font-size:12px;margin-bottom:8px'>dp[i] = min cost to depart stair i (pay cost[i], then jump 1 or 2)</div>";
h += "<div style='display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap'>";
for (let i = 0; i < n; i++) {
  h += "<div style='text-align:center'>" +
    "<div style='background:#1e293b;border:1px solid #334155;border-radius:4px;padding:6px 10px;color:#f59e0b;font-weight:bold;min-width:36px'>" + dp[i] + "</div>" +
    "<div style='color:#64748b;font-size:11px;margin-top:2px'>dp[" + i + "]</div>" +
    "<div style='color:#94a3b8;font-size:11px'>c=" + cost[i] + "</div></div>";
}
h += "<div style='text-align:center'><div style='background:#1e293b;border:2px solid #4ade80;border-radius:4px;padding:6px 10px;color:#4ade80;font-weight:bold;min-width:36px'>TOP</div><div style='color:#64748b;font-size:11px;margin-top:2px'>goal</div></div>";
h += "</div>";
const steps = [];
for (let i = 2; i < n; i++) {
  steps.push("<div style='margin-top:3px;color:#94a3b8;font-size:12px'>dp[" + i + "] = " + cost[i] + " + min(" + dp[i-1] + ", " + dp[i-2] + ") = <b style='color:#f0abfc'>" + dp[i] + "</b></div>");
}
h += "<div style='margin-bottom:10px'>" + steps.join("") + "</div>";
h += "<div style='background:#1c1917;border-radius:6px;padding:8px 12px;color:#f59e0b'>Answer: min(dp[" + (n-2) + "]=" + dp[n-2] + ", dp[" + (n-1) + "]=" + dp[n-1] + ") = <b>" + answer + "</b></div>";
out.innerHTML = h;`,
                outputHeight: 280,
              },
              {
                type: 'js',
                title: 'Greedy vs DP — Where Greedy Breaks',
                instruction: 'Greedy always picks the largest available house, skipping neighbors. DP considers the full chain. This cell runs both on adversarial inputs and highlights where they diverge.',
                html: `<div id="out" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const out = document.getElementById("out");

function robDP(nums) {
  if (nums.length === 1) return nums[0];
  let prev2 = nums[0];
  let prev1 = Math.max(nums[0], nums[1]);
  for (let i = 2; i < nums.length; i++) {
    const t = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = t;
  }
  return prev1;
}

function robGreedy(nums) {
  const used = new Set();
  let total = 0;
  const sorted = Array.from(nums.keys()).sort(function(a, b) { return nums[b] - nums[a]; });
  for (const i of sorted) {
    if (!used.has(i - 1) && !used.has(i + 1) && !used.has(i)) {
      total += nums[i];
      used.add(i);
    }
  }
  return total;
}

const tests = [
  { nums: [2, 1, 1, 2],           label: "Symmetric trap" },
  { nums: [5, 1, 1, 5],           label: "Classic failure case" },
  { nums: [1, 100, 1, 1, 100, 1], label: "Two large peaks" },
  { nums: [10, 1, 1, 10, 1, 1, 10], label: "Three large peaks" },
];

let h = "";
for (const t of tests) {
  const dp = robDP(t.nums);
  const greedy = robGreedy(t.nums);
  const wrong = dp !== greedy;
  h += "<div style='margin-bottom:10px;background:#1e293b;border-radius:6px;padding:10px;border-left:3px solid " + (wrong ? "#f87171" : "#4ade80") + "'>";
  h += "<div style='color:#e2e8f0;margin-bottom:4px'><b>" + t.label + "</b>: [" + t.nums.join(", ") + "]</div>";
  h += "<div style='display:flex;gap:16px;font-size:13px'>";
  h += "<span style='color:#60a5fa'>DP: <b>" + dp + "</b></span>";
  h += "<span style='color:" + (wrong ? "#f87171" : "#4ade80") + "'>Greedy: <b>" + greedy + "</b></span>";
  if (wrong) h += "<span style='color:#f87171'>GREEDY WRONG by " + (dp - greedy) + "</span>";
  else h += "<span style='color:#64748b'>(agree)</span>";
  h += "</div></div>";
}
out.innerHTML = h;`,
                outputHeight: 260,
              },
            ],
          },
        },
      },
      {
        id: 'JSNotebook',
        title: 'House Robber and Variants in JavaScript',
        caption: 'Implement the core recurrence, extend to circular streets, then tackle Delete-and-Earn as a reduction to House Robber.',
        props: {
          lesson: {
            title: 'House Robber and 1D DP Patterns',
            subtitle: 'Build each algorithm from the recurrence up.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — House Robber

The recurrence is \`dp[i] = max(dp[i-1], dp[i-2] + nums[i])\`.

Space optimize immediately: you only need \`prev2\` and \`prev1\`. At each position, compute \`curr = max(prev1, prev2 + nums[i])\`, then slide the window forward.

Handle edge cases first: empty array → 0, single house → nums[0].`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function rob(nums) {
  // TODO: handle n===0 and n===1 edge cases
  // TODO: initialize prev2 = nums[0], prev1 = max(nums[0], nums[1])
  // TODO: loop i from 2 to n-1, compute curr, slide prev2/prev1
  // TODO: return prev1
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("rob([1,2,3,1])",    rob([1,2,3,1]),    4);
check("rob([2,7,9,3,1])",  rob([2,7,9,3,1]),  12);
check("rob([5])",          rob([5]),           5);
check("rob([1,2])",        rob([1,2]),         2);
check("rob([2,1,1,2])",    rob([2,1,1,2]),     4);`,
                solutionCode: `function rob(nums) {
  const n = nums.length;
  if (n === 0) return 0;
  if (n === 1) return nums[0];
  let prev2 = nums[0];
  let prev1 = Math.max(nums[0], nums[1]);
  for (let i = 2; i < n; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("rob([1,2,3,1])",    rob([1,2,3,1]),    4);
check("rob([2,7,9,3,1])",  rob([2,7,9,3,1]),  12);
check("rob([5])",          rob([5]),           5);
check("rob([1,2])",        rob([1,2]),         2);
check("rob([2,1,1,2])",    rob([2,1,1,2]),     4);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Min Cost Climbing Stairs

Flip the direction: instead of maximizing loot, minimize cost. Each step has a cost — pay it and jump 1 or 2 steps forward. You can start at step 0 or step 1. The top is past the last index.

Recurrence: \`dp[i] = cost[i] + min(dp[i-1], dp[i-2])\`

Answer: \`min(dp[n-1], dp[n-2])\` — you can arrive from either of the last two steps.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function minCostClimbingStairs(cost) {
  // TODO: handle n===0, n===1 edge cases
  // TODO: initialize prev2 = cost[0], prev1 = cost[1]
  // TODO: loop i from 2, compute curr = cost[i] + min(prev1, prev2), slide window
  // TODO: return min(prev1, prev2)
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

// [10,15,20]: start at step 1 (cost=15), jump 2 to top. Answer: 15
check("stairs([10,15,20])",     minCostClimbingStairs([10,15,20]),     15);
check("stairs([1,100,1,1,1,100,1,1])", minCostClimbingStairs([1,100,1,1,1,100,1,1]), 6);`,
                solutionCode: `function minCostClimbingStairs(cost) {
  const n = cost.length;
  if (n === 0) return 0;
  if (n === 1) return cost[0];
  let prev2 = cost[0];
  let prev1 = cost[1];
  for (let i = 2; i < n; i++) {
    const curr = cost[i] + Math.min(prev1, prev2);
    prev2 = prev1;
    prev1 = curr;
  }
  return Math.min(prev1, prev2);
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("stairs([10,15,20])",     minCostClimbingStairs([10,15,20]),     15);
check("stairs([1,100,1,1,1,100,1,1])", minCostClimbingStairs([1,100,1,1,1,100,1,1]), 6);`,
                outputHeight: 100,
              },
              {
                type: 'js',
                instruction: `## Step 3 — House Robber II: Circular Street

First and last houses are adjacent. You cannot rob both.

**Reduction:** In a circle, either house 0 is excluded or house n-1 is excluded. So run linear House Robber twice:
- Once on \`nums[0..n-2]\` (exclude last)
- Once on \`nums[1..n-1]\` (exclude first)

Take the max. This works because every valid solution must skip at least one of the two boundary houses.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function rob(nums) {
  const n = nums.length;
  if (n === 0) return 0;
  if (n === 1) return nums[0];
  if (n === 2) return Math.max(nums[0], nums[1]);

  function robLinear(arr) {
    // TODO: linear house robber (same as Step 1)
  }

  // TODO: return max of robLinear on [0..n-2] and robLinear on [1..n-1]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("rob([2,3,2])",       rob([2,3,2]),       3);
check("rob([1,2,3,1])",     rob([1,2,3,1]),     4);
check("rob([1,2,3,4,5])",   rob([1,2,3,4,5]),   8);`,
                solutionCode: `function rob(nums) {
  const n = nums.length;
  if (n === 0) return 0;
  if (n === 1) return nums[0];
  if (n === 2) return Math.max(nums[0], nums[1]);

  function robLinear(arr) {
    let prev2 = arr[0];
    let prev1 = Math.max(arr[0], arr[1]);
    for (let i = 2; i < arr.length; i++) {
      const curr = Math.max(prev1, prev2 + arr[i]);
      prev2 = prev1;
      prev1 = curr;
    }
    return prev1;
  }

  return Math.max(robLinear(nums.slice(0, n - 1)), robLinear(nums.slice(1)));
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("rob([2,3,2])",       rob([2,3,2]),       3);
check("rob([1,2,3,1])",     rob([1,2,3,1]),     4);
check("rob([1,2,3,4,5])",   rob([1,2,3,4,5]),   8);`,
                outputHeight: 120,
              },
              {
                type: 'js',
                instruction: `## Step 4 — Delete and Earn: Reduce to House Robber

Choosing value x earns \`x * count(x)\` points. But choosing x deletes all x-1 and x+1.

This is House Robber in disguise. Build \`points[]\` where \`points[v] = v * count(v)\`. Choosing index v prevents choosing v-1 and v+1 — the same adjacency constraint. Run House Robber on points[].`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function deleteAndEarn(nums) {
  if (!nums.length) return 0;
  const maxVal = Math.max(...nums);
  // TODO: build points[] where points[v] = v * count of v in nums
  // TODO: run house robber on points[]
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

// [3,4,2]: points=[0,0,2,3,4], rob points -> 6
check("earn([3,4,2])",          deleteAndEarn([3,4,2]),          6);
// [2,2,3,3,3,4]: points=[0,0,4,9,4], rob -> 9
check("earn([2,2,3,3,3,4])",    deleteAndEarn([2,2,3,3,3,4]),    9);`,
                solutionCode: `function deleteAndEarn(nums) {
  if (!nums.length) return 0;
  const maxVal = Math.max(...nums);
  const points = new Array(maxVal + 1).fill(0);
  for (const n of nums) points[n] += n;

  if (points.length === 1) return points[0];
  let prev2 = points[0];
  let prev1 = Math.max(points[0], points[1]);
  for (let i = 2; i < points.length; i++) {
    const curr = Math.max(prev1, prev2 + points[i]);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

const out = document.getElementById("out");
function check(label, got, want) {
  const ok = got === want;
  out.innerHTML += "<div class='" + (ok?"pass":"fail") + "'>" + (ok?"PASS":"FAIL") + " " + label + ": got " + got + ", want " + want + "</div>";
}

check("earn([3,4,2])",          deleteAndEarn([3,4,2]),          6);
check("earn([2,2,3,3,3,4])",    deleteAndEarn([2,2,3,3,3,4]),    9);`,
                outputHeight: 100,
              },
            ],
          },
        },
      },
      {
        id: 'PythonNotebook',
        title: 'House Robber and Min Cost Stairs in Python',
        caption: 'Trace the recurrence step by step, visualize dp tables, and implement from scratch with full test suites.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'House Robber — Trace and Verify',
              code: `def rob(nums: list[int]) -> int:
    """
    dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    Space optimized to O(1) with two sliding variables.
    """
    n = len(nums)
    if n == 0: return 0
    if n == 1: return nums[0]
    prev2 = nums[0]
    prev1 = max(nums[0], nums[1])
    for i in range(2, n):
        curr = max(prev1, prev2 + nums[i])
        prev2, prev1 = prev1, curr
    return prev1


def rob_trace(nums: list[int]) -> None:
    n = len(nums)
    if n <= 1:
        print(f"Trivial case: {nums[0] if n else 0}")
        return
    prev2 = nums[0]
    prev1 = max(nums[0], nums[1])
    print(f"Houses: {nums}")
    print(f"  i=0  prev2={prev2}  (base)")
    print(f"  i=1  prev1={prev1}  (base: max of first two)")
    for i in range(2, n):
        curr = max(prev1, prev2 + nums[i])
        action = "ROB" if prev2 + nums[i] >= prev1 else "SKIP"
        print(f"  i={i}  house={nums[i]}  max(prev1={prev1}, prev2+house={prev2+nums[i]}) -> {curr}  [{action}]")
        prev2, prev1 = prev1, curr
    print(f"Answer: {prev1}\n")


rob_trace([2, 7, 9, 3, 1])
rob_trace([2, 1, 1, 2])

assert rob([1, 2, 3, 1]) == 4
assert rob([2, 7, 9, 3, 1]) == 12
assert rob([2, 1, 1, 2]) == 4
assert rob([5]) == 5
print("All assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Min Cost Climbing Stairs with Chart',
              code: `import matplotlib.pyplot as plt
import numpy as np


def min_cost_climbing_stairs(cost: list[int]) -> int:
    n = len(cost)
    if n == 0: return 0
    if n == 1: return cost[0]
    prev2, prev1 = cost[0], cost[1]
    for i in range(2, n):
        curr = cost[i] + min(prev1, prev2)
        prev2, prev1 = prev1, curr
    return min(prev1, prev2)


def show_dp_table(cost: list[int]) -> None:
    n = len(cost)
    dp = [0] * n
    dp[0] = cost[0]
    if n > 1:
        dp[1] = cost[1]
    for i in range(2, n):
        dp[i] = cost[i] + min(dp[i - 1], dp[i - 2])

    x = np.arange(n)
    fig, ax = plt.subplots(figsize=(9, 4), facecolor="#0f172a")
    ax.set_facecolor("#0f172a")
    ax.bar(x - 0.2, cost, 0.35, label="Step cost", color="#f59e0b", alpha=0.85)
    ax.bar(x + 0.2, dp,   0.35, label="dp[i] (min cost to depart)", color="#60a5fa", alpha=0.85)

    for bar, val in zip(ax.patches[:n], cost):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.4,
                str(val), ha="center", va="bottom", color="#f59e0b", fontsize=9)
    for bar, val in zip(ax.patches[n:], dp):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.4,
                str(val), ha="center", va="bottom", color="#60a5fa", fontsize=9)

    ax.set_xticks(x)
    ax.set_xticklabels([f"Step {i}" for i in x], color="#94a3b8")
    ax.tick_params(colors="#94a3b8")
    ax.spines[:].set_color("#334155")
    ax.set_ylabel("Cost", color="#94a3b8")
    ax.set_title(f"Min Cost Climbing Stairs — answer = {min_cost_climbing_stairs(cost)}", color="#e2e8f0")
    ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0")
    plt.tight_layout()
    plt.show()


show_dp_table([10, 15, 20, 5, 30, 8])
assert min_cost_climbing_stairs([10, 15, 20]) == 15
assert min_cost_climbing_stairs([1, 100, 1, 1, 1, 100, 1, 1]) == 6
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Delete and Earn — Reduction Explained',
              code: `"""
DELETE AND EARN (LeetCode 740)

Choosing x earns x * count(x) total points.
Choosing x prevents choosing x-1 and x+1.

This is exactly House Robber on a value array where points[v] = v * count(v).
"""
from collections import Counter


def delete_and_earn(nums: list[int]) -> int:
    if not nums:
        return 0
    count = Counter(nums)
    max_val = max(nums)
    points = [v * count[v] for v in range(max_val + 1)]

    if len(points) == 1:
        return points[0]
    prev2 = points[0]
    prev1 = max(points[0], points[1])
    for i in range(2, len(points)):
        prev2, prev1 = prev1, max(prev1, prev2 + points[i])
    return prev1


def trace_reduction(nums: list[int]) -> None:
    count = Counter(nums)
    max_val = max(nums)
    points = [v * count[v] for v in range(max_val + 1)]
    print(f"nums    = {nums}")
    print(f"counts  = {dict(count)}")
    print(f"points  = {points}  (index=value, content=value*count)")
    print(f"answer  = {delete_and_earn(nums)}")
    print()


trace_reduction([3, 4, 2])
trace_reduction([2, 2, 3, 3, 3, 4])

assert delete_and_earn([3, 4, 2]) == 6
assert delete_and_earn([2, 2, 3, 3, 3, 4]) == 9
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'From Scratch: Jump Game and House Robber II',
              code: `"""
FROM SCRATCH CHALLENGES

JUMP GAME (LeetCode 55)
  nums[i] = max jump length from index i.
  Can you reach the last index?
  Hint: track the farthest reachable index as you scan left to right.
  Time O(n), Space O(1).

HOUSE ROBBER II (LeetCode 213)
  Houses in a circle: first and last are adjacent.
  Hint: run linear rob() twice:
    - once excluding the first house
    - once excluding the last house
  Take the max.
"""


def can_jump(nums: list[int]) -> bool:
    # YOUR CODE HERE
    pass


def rob_circular(nums: list[int]) -> int:
    def rob_linear(arr: list[int]) -> int:
        # YOUR CODE HERE
        pass
    # YOUR CODE HERE
    pass


# --- Uncomment to test when ready ---
# assert can_jump([2, 3, 1, 1, 4]) == True
# assert can_jump([3, 2, 1, 0, 4]) == False
# assert can_jump([0]) == True
# assert can_jump([1, 0]) == True
# print("Jump Game: all passed!")

# assert rob_circular([2, 3, 2]) == 3
# assert rob_circular([1, 2, 3, 1]) == 4
# assert rob_circular([1, 2, 3, 4, 5]) == 8
# assert rob_circular([1]) == 1
# print("House Robber II: all passed!")`,
            },
          ],
        },
      },
    ],
  },
};
