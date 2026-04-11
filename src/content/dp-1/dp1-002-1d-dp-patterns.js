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
    question: 'You are a thief. You can rob any house on a street, but adjacent houses are connected to the same alarm — rob two in a row and you trip it. Which houses do you rob to maximize your haul? This is not a greedy problem. Always taking the biggest house fails. The right answer requires asking: "For every house, what is the best I can do if I rob it? What is the best if I skip it?" That two-state question is the foundation of all 1D DP.',
    realWorldContext: 'The include-vs-exclude DP pattern appears everywhere: portfolio selection (include this asset or not?), job scheduling (take this job or the one that ends later?), cutting a rod for max price, selecting non-overlapping intervals. The "min cost" variant powers shortest-path planning and text justification. These two problem shapes — maximize non-adjacent selections and minimize cost with choices — cover a huge fraction of real-world optimization problems.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The include-vs-exclude recurrence.** In House Robber, at every house you make one decision: rob it or skip it. If you rob house i, you must have skipped house i-1, so you carry forward the best you could do up to house i-2 plus the current value. If you skip house i, you carry forward the best up to house i-1. Formally: `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`. That is the entire problem.',
      '**Why greedy fails here.** Consider `[2, 10, 3, 11, 2]`. A greedy algorithm takes the biggest value (11), then cannot take 3 or 2 adjacent to it, netting 10+11=21. But the real answer is 10+11=21... actually the same. Try `[3, 10, 3, 1, 2]`: greedy takes 10, then 2, giving 12. But 3+3+2=8 is worse — wait, greedy gives 10+2=12, and the optimal is 3+3+2=8 — still greedy wins here. The real failure case: `[5, 1, 1, 5]`. Greedy takes 5, skips 1, takes 1, cannot take 5 → result 6. Optimal: skip 5, skip 1, skip 1, skip first 5, take two 5s → 5+5=10. Greedy is forever one-step-sighted. DP sees the whole chain.',
      '**Min Cost Climbing Stairs: the "minimize" shape.** Instead of maximizing loot, you pay a cost to step on each stair and want to reach the top cheaply. You can step from stair i to stair i+1 or i+2. So `dp[i] = cost[i] + min(dp[i-1], dp[i-2])`. The structure is identical — the only change is `max` → `min` and the values are costs not profits. This is the template for all "min cost path" DP.',
      '**Space optimization.** Both problems only look back two steps. You never need the entire dp array — just two variables, `prev2` and `prev1`. Update them in a loop and throw away everything else. This compresses O(n) space to O(1). This trick works whenever your recurrence only depends on a constant number of previous states.',
      '**The state machine view.** Think of dp[i] as answering the question: "What is the best outcome I can guarantee, considering only the first i items, ending in a particular state?" In House Robber, state = {robbed, skipped}. In more complex problems (like stock trading with cooldowns), you have more states — but the same rule applies: enumerate states, write the transition for each, initialize correctly, read the answer from the final state.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 1, Lesson 2: 1D DP Patterns',
        body: '**Previous:** What is DP? — overlapping subproblems, memoization, tabulation.\n**This lesson:** House Robber (include-vs-exclude), Min Cost Stairs (minimize variant), space optimization to O(1).\n**Next:** 2D DP — grids, sequences, unique paths, edit distance.',
      },
      {
        type: 'insight',
        title: 'Every 1D DP problem follows the same recipe',
        body: '1. **Define dp[i]:** "Best outcome considering the first i elements"\n2. **Write the recurrence:** dp[i] = f(dp[i-1], dp[i-2], ...)\n3. **Initialize base cases:** dp[0], dp[1] before the loop\n4. **Read the answer:** usually dp[n-1] or dp[n]\n5. **Optimize space:** replace the array with two variables if you only look back 2 steps',
      },
      {
        type: 'strategy',
        title: 'How to write the recurrence for any new 1D problem',
        body: 'Ask at each position i: "What choices did I make to get here?" For each choice, compute: (cost/value of that choice) + (best result of the subproblem that choice implies). Take the max or min across all choices. That expression IS the recurrence.',
      },
      {
        type: 'warning',
        title: 'Base cases are where most bugs hide',
        body: 'Off-by-one errors in DP almost always live in the base cases. Always ask: What is dp[0]? What is dp[1]? What does my recurrence assume is already filled in? Write it out explicitly before you start the loop. If your array has 0 elements or 1 element, return early — do not let the loop run on garbage.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'House Robber and Min Cost Stairs: Step-by-Step DP Tables',
        caption: 'Build the dp array cell by cell, see the recurrence in action, then watch the space optimization collapse it to two variables.',
        props: {
          lesson: {
            title: '1D Dynamic Programming Patterns',
            subtitle: 'Include-vs-exclude, minimize variants, and space optimization.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'House Robber — Building the DP Table',
                instruction: 'At each house, we pick the better of two choices: rob it (take its value plus best of two houses back) or skip it (take the best of one house back). Watch the dp table fill in left to right.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const nums = [2, 7, 9, 3, 1];
const n = nums.length;
const dp = new Array(n).fill(0);
dp[0] = nums[0];
dp[1] = Math.max(nums[0], nums[1]);
for (let i = 2; i < n; i++) {
  dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i]);
}

let html = '<div style="color:#60a5fa;font-size:14px;margin-bottom:10px">Houses: [' + nums.join(', ') + ']</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:8px">dp[i] = best loot using first i+1 houses</div>';
html += '<div style="display:flex;gap:8px;margin-bottom:16px">';
for (let i = 0; i < n; i++) {
  html += '<div style="text-align:center">' +
    '<div style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:6px 10px;color:#4ade80;font-weight:bold;min-width:36px">' + dp[i] + '</div>' +
    '<div style="color:#64748b;font-size:11px;margin-top:2px">dp[' + i + ']</div>' +
    '<div style="color:#94a3b8;font-size:11px">h=' + nums[i] + '</div></div>';
}
html += '</div>';
html += '<div style="background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80;font-size:13px">Answer: dp[\' + (n-1) + \'] = <b>\' + dp[n-1] + \'</b> (rob houses 0, 2, 4: 2+9+1=12 — wait, that\\'s 12, and dp gives \' + dp[n-1] + \')</div>';
const recurrences = [];
for (let i = 2; i < n; i++) {
  const robIt = dp[i-2] + nums[i];
  const skipIt = dp[i-1];
  recurrences.push('<div style="margin-top:4px;color:#94a3b8;font-size:12px">dp[' + i + '] = max(dp[' + (i-1) + ']=' + dp[i-1] + ', dp[' + (i-2) + ']+'+ nums[i] +'=' + robIt + ') = <b style="color:#f0abfc">' + dp[i] + '</b></div>');
}
html += '<div style="margin-top:12px;border-top:1px solid #1e293b;padding-top:10px">' + recurrences.join('') + '</div>';
d.innerHTML = html;`,
                outputHeight: 260,
              },
              {
                type: 'js',
                title: 'House Robber — Space-Optimized to O(1)',
                instruction: 'The dp array only ever looks back two steps. We can throw away everything else. Two variables — prev2 and prev1 — slide forward through the array. Same answer, zero extra memory.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const nums = [2, 7, 9, 3, 1];

function rob(nums) {
  if (nums.length === 1) return nums[0];
  let prev2 = nums[0];
  let prev1 = Math.max(nums[0], nums[1]);
  const steps = [
    { i: 0, prev2: '-', prev1: nums[0], curr: nums[0], label: 'base: prev2 = nums[0]' },
    { i: 1, prev2: nums[0], prev1: Math.max(nums[0], nums[1]), curr: Math.max(nums[0], nums[1]), label: 'base: prev1 = max(nums[0], nums[1])' },
  ];
  for (let i = 2; i < nums.length; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    steps.push({ i, prev2, prev1, curr, label: 'max(prev1=' + prev1 + ', prev2+' + nums[i] + '=' + (prev2+nums[i]) + ')' });
    prev2 = prev1;
    prev1 = curr;
  }
  return { answer: prev1, steps };
}

const { answer, steps } = rob(nums);

let html = '<div style="color:#60a5fa;font-size:14px;margin-bottom:10px">Houses: [' + nums.join(', ') + ']</div>';
html += '<table style="border-collapse:collapse;width:100%;font-size:12px;margin-bottom:12px">';
html += '<tr style="color:#64748b"><td style="padding:3px 6px">i</td><td style="padding:3px 6px">house</td><td style="padding:3px 6px">prev2</td><td style="padding:3px 6px">prev1</td><td style="padding:3px 6px">curr</td><td style="padding:3px 6px">decision</td></tr>';
steps.forEach(s => {
  html += '<tr style="border-top:1px solid #1e293b">' +
    '<td style="padding:3px 6px;color:#94a3b8">' + s.i + '</td>' +
    '<td style="padding:3px 6px;color:#e2e8f0">' + (nums[s.i] ?? '-') + '</td>' +
    '<td style="padding:3px 6px;color:#f59e0b">' + s.prev2 + '</td>' +
    '<td style="padding:3px 6px;color:#f59e0b">' + s.prev1 + '</td>' +
    '<td style="padding:3px 6px;color:#4ade80;font-weight:bold">' + s.curr + '</td>' +
    '<td style="padding:3px 6px;color:#94a3b8">' + s.label + '</td></tr>';
});
html += '</table>';
html += '<div style="background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80;font-size:13px">Answer: <b>' + answer + '</b> — O(1) space, same as O(n) table version.</div>';
d.innerHTML = html;`,
                outputHeight: 240,
              },
              {
                type: 'js',
                title: 'Min Cost Climbing Stairs — The Minimize Shape',
                instruction: 'Now each step has a cost. You want to reach the top paying the least. From step i you can jump to i+1 or i+2. The recurrence flips from max to min. Everything else is identical.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const cost = [10, 15, 20, 5, 30, 8];
const n = cost.length;

// dp[i] = min cost to LEAVE step i (pay cost[i] then jump 1 or 2)
const dp = new Array(n).fill(0);
dp[0] = cost[0];
dp[1] = cost[1];
for (let i = 2; i < n; i++) {
  dp[i] = cost[i] + Math.min(dp[i-1], dp[i-2]);
}
// Can start from step 0 or step 1, reach "top" which is index n
const answer = Math.min(dp[n-1], dp[n-2]);

let html = '<div style="color:#60a5fa;font-size:14px;margin-bottom:10px">Costs: [' + cost.join(', ') + ']</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:8px">dp[i] = min cost to depart stair i</div>';
html += '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">';
for (let i = 0; i < n; i++) {
  html += '<div style="text-align:center">' +
    '<div style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:6px 10px;color:#f59e0b;font-weight:bold;min-width:36px">' + dp[i] + '</div>' +
    '<div style="color:#64748b;font-size:11px;margin-top:2px">dp[' + i + ']</div>' +
    '<div style="color:#94a3b8;font-size:11px">c=' + cost[i] + '</div></div>';
}
html += '<div style="text-align:center">' +
  '<div style="background:#1e293b;border:2px solid #4ade80;border-radius:4px;padding:6px 10px;color:#4ade80;font-weight:bold;min-width:36px">TOP</div>' +
  '<div style="color:#64748b;font-size:11px;margin-top:2px">goal</div></div>';
html += '</div>';

const recurrences = [];
for (let i = 2; i < n; i++) {
  recurrences.push('<div style="margin-top:3px;color:#94a3b8;font-size:12px">dp[' + i + '] = ' + cost[i] + ' + min(' + dp[i-1] + ', ' + dp[i-2] + ') = <b style="color:#f0abfc">' + dp[i] + '</b></div>');
}
html += '<div style="margin-bottom:12px">' + recurrences.join('') + '</div>';
html += '<div style="background:#1c1917;border-radius:6px;padding:8px 12px;color:#f59e0b;font-size:13px">Answer: min(dp[' + (n-2) + ']=' + dp[n-2] + ', dp[' + (n-1) + ']=' + dp[n-1] + ') = <b>' + answer + '</b></div>';
d.innerHTML = html;`,
                outputHeight: 280,
              },
              {
                type: 'js',
                title: 'Why Greedy Fails: A Concrete Counterexample',
                instruction: 'Greedy says: always make the locally best choice. Here we compare greedy (always take the bigger house) vs DP (consider all futures) on an adversarial input.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');

function robDP(nums) {
  if (nums.length === 1) return nums[0];
  let prev2 = nums[0];
  let prev1 = Math.max(nums[0], nums[1]);
  for (let i = 2; i < nums.length; i++) {
    [prev2, prev1] = [prev1, Math.max(prev1, prev2 + nums[i])];
  }
  return prev1;
}

function robGreedy(nums) {
  // Greedy: always pick the largest available, skip neighbors
  const used = new Set();
  let total = 0;
  // Sort indices by value descending, take if both neighbors unused
  const sorted = [...nums.keys()].sort((a, b) => nums[b] - nums[a]);
  for (const i of sorted) {
    if (!used.has(i-1) && !used.has(i+1) && !used.has(i)) {
      total += nums[i];
      used.add(i);
    }
  }
  return total;
}

const tests = [
  { nums: [2, 1, 1, 2],   label: 'Classic greedy trap' },
  { nums: [4, 1, 1, 4],   label: 'Symmetric: both work' },
  { nums: [10, 1, 1, 10, 1, 1, 10], label: 'Three big houses' },
  { nums: [1, 100, 1, 1, 100, 1], label: 'Greedy misses pattern' },
];

let html = '';
for (const { nums, label } of tests) {
  const dp = robDP(nums);
  const greedy = robGreedy(nums);
  const mismatch = dp !== greedy;
  html += '<div style="margin-bottom:12px;background:#1e293b;border-radius:6px;padding:10px;border-left:3px solid ' + (mismatch ? '#f87171' : '#4ade80') + '">';
  html += '<div style="color:#e2e8f0;margin-bottom:4px"><b>' + label + '</b>: [' + nums.join(', ') + ']</div>';
  html += '<div style="display:flex;gap:16px;font-size:13px">';
  html += '<span style="color:#60a5fa">DP: <b>' + dp + '</b></span>';
  html += '<span style="color:' + (mismatch ? '#f87171' : '#4ade80') + '">Greedy: <b>' + greedy + '</b></span>';
  if (mismatch) {
    html += '<span style="color:#f87171">← GREEDY WRONG by ' + (dp - greedy) + '</span>';
  } else {
    html += '<span style="color:#64748b">(agree)</span>';
  }
  html += '</div></div>';
}
d.innerHTML = html;`,
                outputHeight: 260,
              },
            ],
          },
        },
      },
      {
        id: 'JSNotebook',
        title: 'House Robber & Min Cost Stairs in JavaScript',
        caption: 'Implement both problems from the recurrence, then extend to circular arrays and variable-step jumps.',
        props: {
          lesson: {
            cells: [
              {
                type: 'code',
                language: 'javascript',
                label: 'House Robber — Tabulation',
                code: `// HOUSE ROBBER (LeetCode 198)
// You cannot rob two adjacent houses. Maximize loot.
// Recurrence: dp[i] = max(dp[i-1], dp[i-2] + nums[i])

function rob(nums) {
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

// Tests
console.log(rob([1, 2, 3, 1]));     // 4  (rob 0+2: 1+3)
console.log(rob([2, 7, 9, 3, 1]));  // 12 (rob 0+2+4: 2+9+1)
console.log(rob([5]));               // 5
console.log(rob([1, 2]));            // 2
console.log(rob([2, 1, 1, 2]));     // 4 (rob 0+3: 2+2)`,
              },
              {
                type: 'code',
                language: 'javascript',
                label: 'House Robber II — Circular Street',
                code: `// HOUSE ROBBER II (LeetCode 213)
// Houses arranged in a circle — first and last are adjacent.
// Key insight: in a circle, you can't rob BOTH house 0 and house n-1.
// So: run House Robber on [0..n-2] and on [1..n-1], take the max.

function rob(nums) {
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

  // Either exclude house 0 or exclude house n-1
  return Math.max(
    robLinear(nums.slice(0, n - 1)),
    robLinear(nums.slice(1))
  );
}

console.log(rob([2, 3, 2]));        // 3  (can't rob both 0 and 2)
console.log(rob([1, 2, 3, 1]));     // 4  (rob 0+2 or 1+3 — both give 4)
console.log(rob([1, 2, 3, 4, 5]));  // 8  (rob 1+3+... = 2+4? No: rob 0+2+4=9? Circular! 0 adj to 4)
// Check: [1,2,3,4,5] circular: best is 3+5=8 (skip neighbors 2,4 of 3 and 1,4 of 5... wait)
// Slice [0..3]=[1,2,3,4] → rob: max(rob[0..2], ...) = 1+3=4 vs 2+4=6 → 6
// Slice [1..4]=[2,3,4,5] → 2+4=6 vs 3+5=8 → 8. Answer: 8.
console.log(rob([1, 2, 3, 4, 5]));  // 8`,
              },
              {
                type: 'code',
                language: 'javascript',
                label: 'Min Cost Climbing Stairs',
                code: `// MIN COST CLIMBING STAIRS (LeetCode 746)
// Each step has a cost. Pay it, then jump 1 or 2 steps.
// Can start at step 0 or step 1. Goal: reach index cost.length (past the end).
// Recurrence: dp[i] = cost[i] + min(dp[i-1], dp[i-2])

function minCostClimbingStairs(cost) {
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

  // Top is past the end — can arrive from last or second-to-last step
  return Math.min(prev1, prev2);
}

console.log(minCostClimbingStairs([10, 15, 20]));         // 15  (start at 1, jump 2 to top)
console.log(minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1])); // 6

// Trace [10, 15, 20]:
// dp[0]=10, dp[1]=15, dp[2]=20+min(15,10)=30
// Answer: min(dp[1]=15, dp[2]=30) = 15 ✓`,
              },
              {
                type: 'code',
                language: 'javascript',
                label: 'From Scratch Challenge: Jump Game & Delete-and-Earn',
                code: `// CHALLENGE 1: JUMP GAME (LeetCode 55)
// nums[i] = max jump length from i. Can you reach the last index?
// Greedy works here! But let's understand it as DP first, then see why greedy suffices.
// dp[i] = true if index i is reachable
// dp[i] = any j < i where dp[j] = true AND j + nums[j] >= i

function canJump(nums) {
  // YOUR IMPLEMENTATION HERE
  // Hint: dp or track the farthest reachable index
}

// CHALLENGE 2: DELETE AND EARN (LeetCode 740)
// Pick number x: earn x points, but must delete all (x-1) and (x+1).
// Key insight: group values by number. Total points for picking x = x * count(x).
// After grouping, this IS House Robber on the value array!

function deleteAndEarn(nums) {
  // YOUR IMPLEMENTATION HERE
  // Step 1: build points[] where points[v] = v * count(v)
  // Step 2: run House Robber on points[]
}

// Tests — uncomment to run:
// console.log(canJump([2,3,1,1,4]));  // true
// console.log(canJump([3,2,1,0,4]));  // false
// console.log(deleteAndEarn([3,4,2]));  // 6 (delete 4, earn 3+3... wait: pick 4→earn 4, delete 3,5; pick 2→earn 2. total 6)
// console.log(deleteAndEarn([2,2,3,3,3,4]));  // 9 (pick all 3s: 3*3=9)`,
              },
            ],
          },
        },
      },
      {
        id: 'PythonNotebook',
        title: 'House Robber & Min Cost Stairs in Python',
        caption: 'Implement the core patterns, visualize the DP table, and tackle the delete-and-earn reduction.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'House Robber — Tabulation with Table Trace',
              code: `def rob(nums: list[int]) -> int:
    """
    Recurrence: dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    Space optimized: only track prev2 and prev1.
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


def rob_with_trace(nums: list[int]) -> None:
    """Same algorithm, but prints each step so you can see the DP unfold."""
    n = len(nums)
    if n == 0:
        print("Empty — return 0")
        return
    if n == 1:
        print(f"Single house — return {nums[0]}")
        return

    prev2 = nums[0]
    prev1 = max(nums[0], nums[1])
    print(f"Houses: {nums}")
    print(f"  i=0: prev2={prev2}  (base case: just house 0)")
    print(f"  i=1: prev1={prev1}  (base case: max(house0, house1))")

    for i in range(2, n):
        curr = max(prev1, prev2 + nums[i])
        choice = "SKIP" if prev1 >= prev2 + nums[i] else "ROB"
        print(f"  i={i}: house={nums[i]}, max(prev1={prev1}, prev2+house={prev2+nums[i]}) → {curr} [{choice}]")
        prev2, prev1 = prev1, curr

    print(f"Answer: {prev1}")


rob_with_trace([2, 7, 9, 3, 1])
print()
print("Assertions:")
assert rob([1, 2, 3, 1]) == 4
assert rob([2, 7, 9, 3, 1]) == 12
assert rob([2, 1, 1, 2]) == 4
assert rob([1]) == 1
print("All passed!")`,
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

    prev2 = cost[0]
    prev1 = cost[1]

    for i in range(2, n):
        curr = cost[i] + min(prev1, prev2)
        prev2, prev1 = prev1, curr

    return min(prev1, prev2)


def visualize_staircase(cost: list[int]) -> None:
    """Show the dp table as a bar chart alongside costs."""
    n = len(cost)
    dp = [0] * n
    dp[0] = cost[0]
    if n > 1:
        dp[1] = cost[1]
    for i in range(2, n):
        dp[i] = cost[i] + min(dp[i-1], dp[i-2])

    x = np.arange(n)
    fig, ax = plt.subplots(figsize=(9, 4), facecolor='#0f172a')
    ax.set_facecolor('#0f172a')

    bars_cost = ax.bar(x - 0.2, cost, 0.35, label='Step cost', color='#f59e0b', alpha=0.8)
    bars_dp   = ax.bar(x + 0.2, dp,   0.35, label='dp[i] (min cost to depart)', color='#60a5fa', alpha=0.8)

    ax.set_xticks(x)
    ax.set_xticklabels([f'Step {i}' for i in x], color='#94a3b8')
    ax.tick_params(colors='#94a3b8')
    ax.spines[:].set_color('#334155')
    ax.set_ylabel('Cost', color='#94a3b8')
    ax.set_title(f'Min Cost Climbing Stairs — answer = {min_cost_climbing_stairs(cost)}', color='#e2e8f0')
    ax.legend(facecolor='#1e293b', edgecolor='#334155', labelcolor='#e2e8f0')

    for bar in bars_cost:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
                str(int(bar.get_height())), ha='center', va='bottom', color='#f59e0b', fontsize=9)
    for bar in bars_dp:
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
                str(int(bar.get_height())), ha='center', va='bottom', color='#60a5fa', fontsize=9)

    plt.tight_layout()
    plt.show()


visualize_staircase([10, 15, 20, 5, 30, 8])
print(min_cost_climbing_stairs([10, 15, 20]))  # 15
print(min_cost_climbing_stairs([1, 100, 1, 1, 1, 100, 1, 1]))  # 6`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Delete and Earn — Reduction to House Robber',
              code: `"""
DELETE AND EARN (LeetCode 740)
-------
Given nums[], you can pick any number x:
  - Earn x points
  - All occurrences of x-1 and x+1 are deleted from nums

Find the max points you can earn.

KEY INSIGHT: If you pick x, you earn x * count(x) total.
And picking x prevents picking x-1 and x+1 — just like House Robber
prevents robbing adjacent houses!

Reduction:
  Build points[] where points[v] = v * count(v) for every value v.
  Then run House Robber on points[].
"""

from collections import Counter

def delete_and_earn(nums: list[int]) -> int:
    if not nums:
        return 0

    count = Counter(nums)
    max_val = max(nums)

    # Build the "houses" array: points[v] = v * count[v]
    points = [v * count[v] for v in range(max_val + 1)]

    # House Robber on points
    if len(points) == 1:
        return points[0]

    prev2 = points[0]
    prev1 = max(points[0], points[1])

    for i in range(2, len(points)):
        prev2, prev1 = prev1, max(prev1, prev2 + points[i])

    return prev1


# Trace the reduction
def trace_reduction(nums: list[int]) -> None:
    count = Counter(nums)
    max_val = max(nums)
    points = [v * count[v] for v in range(max_val + 1)]

    print(f"nums = {nums}")
    print(f"counts = {dict(count)}")
    print(f"points = {points}  (index = value, content = value * count)")
    print(f"Now run House Robber on {points}")
    print(f"Answer = {delete_and_earn(nums)}")


trace_reduction([3, 4, 2])
print()
trace_reduction([2, 2, 3, 3, 3, 4])
print()

# Assertions
assert delete_and_earn([3, 4, 2]) == 6
assert delete_and_earn([2, 2, 3, 3, 3, 4]) == 9
assert delete_and_earn([1]) == 1
print("All assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'From Scratch: Jump Game + House Robber II',
              code: `"""
FROM SCRATCH CHALLENGES

1. JUMP GAME — Can you reach the last index?
   nums[i] = max jump length from i
   Hint: track 'farthest' reachable index as you scan left to right
   Time: O(n), Space: O(1)

2. HOUSE ROBBER II — Houses in a circle
   First and last are adjacent. Rob max without adjacent.
   Hint: run linear House Robber twice — once excluding first house,
         once excluding last house. Take the max.
"""


def can_jump(nums: list[int]) -> bool:
    # YOUR CODE HERE
    pass


def rob_circular(nums: list[int]) -> int:
    # YOUR CODE HERE
    # Helper: linear house robber on a subarray
    def rob_linear(arr):
        pass
    pass


# --- Tests (uncomment when ready) ---
# Jump Game
# assert can_jump([2, 3, 1, 1, 4]) == True,  "Should reach end"
# assert can_jump([3, 2, 1, 0, 4]) == False, "Stuck at index 3"
# assert can_jump([0]) == True,              "Already at end"
# assert can_jump([1, 0]) == True,           "One jump"
# print("Jump Game: all passed!")

# House Robber II
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
