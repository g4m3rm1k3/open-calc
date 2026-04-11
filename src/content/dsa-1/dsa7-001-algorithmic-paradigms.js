export default {
  id: 'dsa7-001',
  slug: 'algorithmic-paradigms',
  chapter: 'dsa7',
  order: 1,
  title: 'Algorithmic Paradigms',
  subtitle: 'Divide & Conquer, Greedy, and Dynamic Programming — the three master patterns',
  tags: ['divide and conquer', 'greedy', 'dynamic programming', 'DP', 'paradigms'],
  aliases: ['D&C', 'memoization', 'tabulation', 'knapsack', 'coin change'],

  hook: {
    title: 'Three lenses for hard problems',
    body: 'Most algorithm problems fit one of three mental models: split and conquer independent subproblems (Divide & Conquer), always grab the locally best option (Greedy), or cache overlapping subproblem results (Dynamic Programming). Recognising which lens applies is often the entire skill.',
  },

  intuition: {
    prose: 'D&C works when subproblems are independent — merge sort, quicksort, max subarray. Greedy works when a locally optimal choice is globally optimal — activity selection, jump game, Dijkstra. DP works when subproblems overlap and re-solving them is wasteful — coin change, knapsack, longest common subsequence.',
    callouts: [
      { kind: 'sequencing', body: 'Learn the D&C max-subarray pattern first (it illustrates the template), then Greedy jump game, then DP coin change and knapsack.' },
    ],
    visualizations: [
      {
        type: 'ScienceNotebook',
        cells: [
          {
            type: 'js',
            title: 'The Three Paradigms',
            instruction: 'Each paradigm is a mental framework. The key question is which one applies to your problem.',
            html: '<div id="d" style="padding:12px"></div>',
            css: '',
            startCode: `document.getElementById('d').innerHTML = \`
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:13px">
  <div style="background:#1e293b;border-radius:8px;padding:12px;border-top:3px solid #60a5fa">
    <div style="color:#60a5fa;font-weight:bold;margin-bottom:6px">Divide &amp; Conquer</div>
    <div style="color:#94a3b8;font-size:12px;margin-bottom:6px">Split into <i>independent</i> subproblems, solve each, combine results.</div>
    <div style="color:#64748b;font-size:11px">merge sort · quicksort · binary search · max subarray</div>
  </div>
  <div style="background:#1e293b;border-radius:8px;padding:12px;border-top:3px solid #4ade80">
    <div style="color:#4ade80;font-weight:bold;margin-bottom:6px">Greedy</div>
    <div style="color:#94a3b8;font-size:12px;margin-bottom:6px">Always make the locally optimal choice. Works when local optimal = global optimal.</div>
    <div style="color:#64748b;font-size:11px">activity selection · jump game · Dijkstra · Huffman</div>
  </div>
  <div style="background:#1e293b;border-radius:8px;padding:12px;border-top:3px solid #f59e0b">
    <div style="color:#f59e0b;font-weight:bold;margin-bottom:6px">Dynamic Programming</div>
    <div style="color:#94a3b8;font-size:12px;margin-bottom:6px">Overlapping subproblems — cache results (memoization or tabulation).</div>
    <div style="color:#64748b;font-size:11px">fibonacci · coin change · knapsack · LCS · edit distance</div>
  </div>
</div>
<div style="background:#0f172a;border-radius:6px;padding:10px;margin-top:12px;font-size:12px;color:#94a3b8">
  <b style="color:#e2e8f0">How to choose:</b> Subproblems independent? → D&amp;C. Local greedy = global optimal? → Greedy. Subproblems overlap? → DP.
</div>
\`;`,
            outputHeight: 240,
          },
          {
            type: 'js',
            title: 'Divide & Conquer — Maximum Subarray',
            instruction: 'The max subarray either lies in the left half, right half, or crosses the midpoint. D&C handles all three cases recursively.',
            html: '<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>',
            css: '',
            startCode: `const d = document.getElementById('d');
const log = [];

function maxCrossing(arr, lo, mid, hi) {
  let leftSum = -Infinity, sum = 0;
  for (let i = mid; i >= lo; i--) { sum += arr[i]; leftSum = Math.max(leftSum, sum); }
  let rightSum = -Infinity; sum = 0;
  for (let i = mid+1; i <= hi; i++) { sum += arr[i]; rightSum = Math.max(rightSum, sum); }
  return leftSum + rightSum;
}

function maxSubarrayDC(arr, lo, hi) {
  if (lo === hi) return arr[lo];
  const mid   = Math.floor((lo + hi) / 2);
  const left  = maxSubarrayDC(arr, lo, mid);
  const right = maxSubarrayDC(arr, mid+1, hi);
  const cross = maxCrossing(arr, lo, mid, hi);
  const result = Math.max(left, right, cross);
  log.push({ lo, hi, left, right, cross, result });
  return result;
}

const arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
const answer = maxSubarrayDC(arr, 0, arr.length - 1);

let html = '<div style="color:#60a5fa;margin-bottom:6px">arr=' + JSON.stringify(arr) + '</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:10px">Answer: <b style="color:#4ade80">' + answer + '</b> — subarray [4,-1,2,1]</div>';
log.slice(-5).forEach(e => {
  html += '<div style="padding:5px 8px;margin-bottom:4px;background:#1e293b;border-radius:3px;font-size:12px">' +
    'arr[' + e.lo + '..' + e.hi + ']: left=' + e.left + ' right=' + e.right + ' cross=' + e.cross +
    ' → <b style="color:#4ade80">max=' + e.result + '</b></div>';
});
d.innerHTML = html;`,
            outputHeight: 260,
          },
          {
            type: 'js',
            title: 'Greedy — Activity Selection',
            instruction: 'Always pick the activity that ends earliest. This greedy choice is provably optimal — choosing the earliest end leaves the most room for future activities.',
            html: '<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>',
            css: '',
            startCode: `const d = document.getElementById('d');

function activitySelection(activities) {
  const sorted = [...activities].sort((a, b) => a.end - b.end);
  const selected = [sorted[0]];
  const steps = [{ act: sorted[0], reason: 'First: earliest end time', ok: true }];
  for (let i = 1; i < sorted.length; i++) {
    const last = selected[selected.length - 1];
    if (sorted[i].start >= last.end) {
      selected.push(sorted[i]);
      steps.push({ act: sorted[i], reason: 'start ' + sorted[i].start + ' >= last end ' + last.end + ' → select', ok: true });
    } else {
      steps.push({ act: sorted[i], reason: 'start ' + sorted[i].start + ' < last end ' + last.end + ' → skip', ok: false });
    }
  }
  return { selected, steps };
}

const activities = [
  {name:'A',start:1,end:4},{name:'B',start:3,end:5},{name:'C',start:0,end:6},
  {name:'D',start:5,end:7},{name:'E',start:3,end:9},{name:'F',start:5,end:9},
  {name:'G',start:6,end:10},{name:'H',start:8,end:11},{name:'I',start:8,end:12},
];
const { selected, steps } = activitySelection(activities);

let html = '<div style="color:#60a5fa;margin-bottom:8px">Activity Selection (greedy: earliest end first)</div>';
steps.forEach(s => {
  const c = s.ok ? '#4ade80' : '#f87171';
  html += '<div style="padding:4px 8px;margin-bottom:3px;background:#1e293b;border-radius:3px">' +
    '<span style="color:' + c + '">' + (s.ok?'✓':'✗') + '</span> ' +
    '<b>' + s.act.name + '</b> [' + s.act.start + '-' + s.act.end + '] — <span style="color:#94a3b8">' + s.reason + '</span></div>';
});
html += '<div style="color:#4ade80;margin-top:8px">Selected: ' + selected.map(a=>a.name).join(', ') + ' (' + selected.length + ' activities)</div>';
d.innerHTML = html;`,
            outputHeight: 340,
          },
          {
            type: 'js',
            title: 'Dynamic Programming — Coin Change (Tabulation)',
            instruction: 'dp[i] = minimum coins to make amount i. Greedy fails here — [1,3,4] amount=6: greedy picks 4+1+1=3 but 3+3=2 is better.',
            html: '<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>',
            css: '',
            startCode: `const d = document.getElementById('d');

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++)
    for (const c of coins)
      if (c <= i && dp[i-c] + 1 < dp[i]) dp[i] = dp[i-c] + 1;
  return dp;
}

const coins = [1, 3, 4], amount = 6;
const dp = coinChange(coins, amount);

let html = '<div style="color:#60a5fa;margin-bottom:4px">Coin Change DP: coins=' + JSON.stringify(coins) + ', amount=' + amount + '</div>';
html += '<div style="color:#94a3b8;font-size:12px;margin-bottom:10px">dp[i] = min coins to make i</div>';
html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
dp.forEach((v, i) => {
  const color = v === Infinity ? '#475569' : i === amount ? '#f59e0b' : '#4ade80';
  html += '<div style="text-align:center">' +
    '<div style="background:#1e293b;border-radius:4px;padding:6px 10px;color:' + color + ';font-weight:bold">' + (v===Infinity?'∞':v) + '</div>' +
    '<div style="color:#64748b;font-size:11px;margin-top:2px">i=' + i + '</div></div>';
});
html += '</div>';
html += '<div style="color:#4ade80;margin-top:10px">dp[6] = <b>2</b> coins (3+3)</div>';
html += '<div style="color:#f87171;font-size:12px;margin-top:4px">Greedy gives 4+1+1 = 3 — wrong!</div>';
d.innerHTML = html;`,
            outputHeight: 200,
          },
        ],
      },

      {
        type: 'JSNotebook',
        cells: [
          {
            type: 'js',
            instruction: '**Step 1 — Divide & Conquer: Maximum Subarray**\n\nThe max subarray crossing the midpoint must include `arr[mid]` and `arr[mid+1]`. Scan outward from mid in both directions — track the running sum and keep the best left-half sum and right-half sum separately. Return `leftSum + rightSum`.',
            html: '<style>.pass{color:#4ade80}.fail{color:#f87171}</style><div id="out" style="padding:10px;font-family:monospace;font-size:13px"></div>',
            css: '',
            startCode: `// Find the max subarray sum that crosses the midpoint.
function maxCrossing(arr, lo, mid, hi) {
  let leftSum = -Infinity, sum = 0;
  // TODO: for i from mid down to lo: sum += arr[i]; leftSum = max(leftSum, sum)

  let rightSum = -Infinity; sum = 0;
  // TODO: for i from mid+1 to hi: sum += arr[i]; rightSum = max(rightSum, sum)

  // TODO: return leftSum + rightSum
}

// Divide and conquer max subarray.
function maxSubarray(arr, lo = 0, hi = arr.length - 1) {
  // TODO: base case — if lo === hi, return arr[lo]
  // TODO: mid = Math.floor((lo + hi) / 2)
  // TODO: return Math.max(maxSubarray left, maxSubarray right, maxCrossing)
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}, want \${JSON.stringify(e)}</div>\`;
}

test('basic [-2,1,-3,4,-1,2,1,-5,4]', maxSubarray([-2,1,-3,4,-1,2,1,-5,4]), 6);
test('single element [1]',            maxSubarray([1]), 1);
test('all negative [-1,-2,-3]',       maxSubarray([-1,-2,-3]), -1);
test('all positive [5,4,-1,7,8]',     maxSubarray([5,4,-1,7,8]), 23);`,
            solutionCode: `function maxCrossing(arr, lo, mid, hi) {
  let leftSum = -Infinity, sum = 0;
  for (let i = mid; i >= lo; i--) { sum += arr[i]; leftSum = Math.max(leftSum, sum); }
  let rightSum = -Infinity; sum = 0;
  for (let i = mid+1; i <= hi; i++) { sum += arr[i]; rightSum = Math.max(rightSum, sum); }
  return leftSum + rightSum;
}

function maxSubarray(arr, lo = 0, hi = arr.length - 1) {
  if (lo === hi) return arr[lo];
  const mid = Math.floor((lo + hi) / 2);
  return Math.max(maxSubarray(arr, lo, mid), maxSubarray(arr, mid+1, hi), maxCrossing(arr, lo, mid, hi));
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}, want \${JSON.stringify(e)}</div>\`;
}

test('basic [-2,1,-3,4,-1,2,1,-5,4]', maxSubarray([-2,1,-3,4,-1,2,1,-5,4]), 6);
test('single element [1]',            maxSubarray([1]), 1);
test('all negative [-1,-2,-3]',       maxSubarray([-1,-2,-3]), -1);
test('all positive [5,4,-1,7,8]',     maxSubarray([5,4,-1,7,8]), 23);`,
            outputHeight: 140,
          },

          {
            type: 'js',
            instruction: '**Step 2 — Greedy: Jump Game**\n\nTrack `maxReach` — the farthest index reachable so far. If you ever reach a position `i > maxReach`, you\'re stuck and must return false. For the minimum jumps variant, treat each jump range as a "level" — increment jumps when you exhaust the current level.',
            html: '<style>.pass{color:#4ade80}.fail{color:#f87171}</style><div id="out" style="padding:10px;font-family:monospace;font-size:13px"></div>',
            css: '',
            startCode: `// Can you reach the last index?
function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    // TODO: if i > maxReach, return false (stuck)
    // TODO: maxReach = Math.max(maxReach, i + nums[i])
  }
  // TODO: return true
}

// Minimum number of jumps to reach the end.
function jumpGameII(nums) {
  let jumps = 0, currentEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    // TODO: farthest = Math.max(farthest, i + nums[i])
    // TODO: if i === currentEnd: jumps++; currentEnd = farthest
  }
  return jumps;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}, want \${JSON.stringify(e)}</div>\`;
}

test('canJump reachable [2,3,1,1,4]',  canJump([2,3,1,1,4]),    true);
test('canJump stuck    [3,2,1,0,4]',   canJump([3,2,1,0,4]),    false);
test('minJumps [2,3,1,1,4]',           jumpGameII([2,3,1,1,4]), 2);
test('minJumps [2,3,0,1,4]',           jumpGameII([2,3,0,1,4]), 2);`,
            solutionCode: `function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}

function jumpGameII(nums) {
  let jumps = 0, currentEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) { jumps++; currentEnd = farthest; }
  }
  return jumps;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}, want \${JSON.stringify(e)}</div>\`;
}

test('canJump reachable [2,3,1,1,4]',  canJump([2,3,1,1,4]),    true);
test('canJump stuck    [3,2,1,0,4]',   canJump([3,2,1,0,4]),    false);
test('minJumps [2,3,1,1,4]',           jumpGameII([2,3,1,1,4]), 2);
test('minJumps [2,3,0,1,4]',           jumpGameII([2,3,0,1,4]), 2);`,
            outputHeight: 140,
          },

          {
            type: 'js',
            instruction: '**Step 3 — Dynamic Programming: Coin Change and Knapsack**\n\n`coinChange`: `dp[i]` = minimum coins to make amount `i`. For each amount, try every coin — if coin `c` fits, `dp[i] = min(dp[i], dp[i-c] + 1)`.\n\n`knapsack`: `dp[i][w]` = max value using items `0..i` with capacity `w`. Either skip item `i`, or include it (if it fits).',
            html: '<style>.pass{color:#4ade80}.fail{color:#f87171}</style><div id="out" style="padding:10px;font-family:monospace;font-size:13px"></div>',
            css: '',
            startCode: `// Minimum coins to make 'amount'. Return -1 if impossible.
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      // TODO: if c <= i and dp[i-c] + 1 < dp[i]: dp[i] = dp[i-c] + 1
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// 0/1 Knapsack: max value with capacity W.
function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({length: n+1}, () => new Array(W+1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      // TODO: dp[i][w] = dp[i-1][w]  (skip item i)
      // TODO: if weights[i-1] <= w: dp[i][w] = Math.max(dp[i][w], values[i-1] + dp[i-1][w - weights[i-1]])
    }
  }
  return dp[n][W];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}, want \${JSON.stringify(e)}</div>\`;
}

test('coinChange [1,3,4] 6',    coinChange([1,3,4], 6),    2);
test('coinChange [2] 3',        coinChange([2], 3),         -1);
test('coinChange [1,2,5] 11',   coinChange([1,2,5], 11),   3);
test('knapsack w=[2,3,4,5] W=5', knapsack([2,3,4,5],[3,4,5,6], 5), 7);`,
            solutionCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++)
    for (const c of coins)
      if (c <= i && dp[i-c] + 1 < dp[i]) dp[i] = dp[i-c] + 1;
  return dp[amount] === Infinity ? -1 : dp[amount];
}

function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({length: n+1}, () => new Array(W+1).fill(0));
  for (let i = 1; i <= n; i++)
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i-1][w];
      if (weights[i-1] <= w) dp[i][w] = Math.max(dp[i][w], values[i-1] + dp[i-1][w - weights[i-1]]);
    }
  return dp[n][W];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}, want \${JSON.stringify(e)}</div>\`;
}

test('coinChange [1,3,4] 6',    coinChange([1,3,4], 6),    2);
test('coinChange [2] 3',        coinChange([2], 3),         -1);
test('coinChange [1,2,5] 11',   coinChange([1,2,5], 11),   3);
test('knapsack w=[2,3,4,5] W=5', knapsack([2,3,4,5],[3,4,5,6], 5), 7);`,
            outputHeight: 140,
          },

          {
            type: 'js',
            instruction: '**From Scratch — All Three Paradigms**\n\nWrite all six functions from memory: `maxCrossing` + `maxSubarray` (D&C), `canJump` + `jumpGameII` (Greedy), `coinChange` + `knapsack` (DP). 11 tests verify correctness.',
            html: '<style>.pass{color:#4ade80}.fail{color:#f87171}</style><div id="out" style="padding:10px;font-family:monospace;font-size:13px"></div>',
            css: '',
            startCode: `// Divide & Conquer
function maxCrossing(arr, lo, mid, hi) { /* your code */ }
function maxSubarray(arr, lo = 0, hi = arr.length - 1) { /* your code */ }

// Greedy
function canJump(nums) { /* your code */ }
function jumpGameII(nums) { /* your code */ }

// Dynamic Programming
function coinChange(coins, amount) { /* your code */ }
function knapsack(weights, values, W) { /* your code */ }

// --- Test Suite ---
const out = document.getElementById('out');
let pass = 0, fail = 0;
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
  p ? pass++ : fail++;
}

test('maxSubarray basic',    maxSubarray([-2,1,-3,4,-1,2,1,-5,4]), 6);
test('maxSubarray all neg',  maxSubarray([-1,-2,-3]),               -1);
test('maxSubarray all pos',  maxSubarray([5,4,-1,7,8]),             23);

test('canJump reachable',    canJump([2,3,1,1,4]),    true);
test('canJump stuck',        canJump([3,2,1,0,4]),    false);
test('jumpGameII 1',         jumpGameII([2,3,1,1,4]), 2);
test('jumpGameII 2',         jumpGameII([2,3,0,1,4]), 2);

test('coinChange 2 coins',   coinChange([1,3,4], 6),    2);
test('coinChange impossible', coinChange([2], 3),        -1);
test('coinChange 3 coins',   coinChange([1,2,5], 11),   3);
test('knapsack',             knapsack([2,3,4,5],[3,4,5,6], 5), 7);

out.innerHTML += \`<div style="margin-top:8px;color:\${fail===0?'#4ade80':'#f59e0b'}">\${pass}/\${pass+fail} tests passed</div>\`;`,
            solutionCode: `function maxCrossing(arr, lo, mid, hi) {
  let leftSum = -Infinity, sum = 0;
  for (let i = mid; i >= lo; i--) { sum += arr[i]; leftSum = Math.max(leftSum, sum); }
  let rightSum = -Infinity; sum = 0;
  for (let i = mid+1; i <= hi; i++) { sum += arr[i]; rightSum = Math.max(rightSum, sum); }
  return leftSum + rightSum;
}
function maxSubarray(arr, lo = 0, hi = arr.length - 1) {
  if (lo === hi) return arr[lo];
  const mid = Math.floor((lo + hi) / 2);
  return Math.max(maxSubarray(arr, lo, mid), maxSubarray(arr, mid+1, hi), maxCrossing(arr, lo, mid, hi));
}

function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}
function jumpGameII(nums) {
  let jumps = 0, currentEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) { jumps++; currentEnd = farthest; }
  }
  return jumps;
}

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++)
    for (const c of coins)
      if (c <= i && dp[i-c] + 1 < dp[i]) dp[i] = dp[i-c] + 1;
  return dp[amount] === Infinity ? -1 : dp[amount];
}
function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({length: n+1}, () => new Array(W+1).fill(0));
  for (let i = 1; i <= n; i++)
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i-1][w];
      if (weights[i-1] <= w) dp[i][w] = Math.max(dp[i][w], values[i-1] + dp[i-1][w - weights[i-1]]);
    }
  return dp[n][W];
}

const out = document.getElementById('out');
let pass = 0, fail = 0;
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
  p ? pass++ : fail++;
}

test('maxSubarray basic',    maxSubarray([-2,1,-3,4,-1,2,1,-5,4]), 6);
test('maxSubarray all neg',  maxSubarray([-1,-2,-3]),               -1);
test('maxSubarray all pos',  maxSubarray([5,4,-1,7,8]),             23);
test('canJump reachable',    canJump([2,3,1,1,4]),    true);
test('canJump stuck',        canJump([3,2,1,0,4]),    false);
test('jumpGameII 1',         jumpGameII([2,3,1,1,4]), 2);
test('jumpGameII 2',         jumpGameII([2,3,0,1,4]), 2);
test('coinChange 2 coins',   coinChange([1,3,4], 6),    2);
test('coinChange impossible', coinChange([2], 3),        -1);
test('coinChange 3 coins',   coinChange([1,2,5], 11),   3);
test('knapsack',             knapsack([2,3,4,5],[3,4,5,6], 5), 7);

out.innerHTML += \`<div style="margin-top:8px;color:\${fail===0?'#4ade80':'#f59e0b'}">\${pass}/\${pass+fail} tests passed</div>\`;`,
            outputHeight: 340,
          },
        ],
      },

      {
        type: 'PythonNotebook',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Step 1 — D&C (max subarray) and Greedy (jump game)',
              prose: [
                'max_subarray uses divide & conquer — split at mid, recurse both halves, find best crossing sum.',
                'can_jump and jump_game_ii use greedy — no cache, just track how far you can reach.',
              ],
              instructions: 'Fill in max_subarray(), can_jump(), and jump_game_ii().',
              code: `def max_crossing(arr, lo, mid, hi):
    left_sum, total = float('-inf'), 0
    for i in range(mid, lo - 1, -1):
        total += arr[i]
        left_sum = max(left_sum, total)
    right_sum, total = float('-inf'), 0
    for i in range(mid + 1, hi + 1):
        total += arr[i]
        right_sum = max(right_sum, total)
    return left_sum + right_sum

# TODO: fill in max_subarray (divide & conquer)
def max_subarray(arr, lo=0, hi=None):
    if hi is None: hi = len(arr) - 1
    # if lo == hi: return arr[lo]
    # mid = (lo + hi) // 2
    # return max(max_subarray(arr, lo, mid), max_subarray(arr, mid+1, hi), max_crossing(arr, lo, mid, hi))
    pass

# TODO: fill in can_jump (greedy)
def can_jump(nums):
    pass

# TODO: fill in jump_game_ii (greedy — min jumps)
def jump_game_ii(nums):
    pass

print('max_subarray:', max_subarray([-2,1,-3,4,-1,2,1,-5,4]))  # 6
print('can_jump T:', can_jump([2,3,1,1,4]))    # True
print('can_jump F:', can_jump([3,2,1,0,4]))    # False
print('min jumps:', jump_game_ii([2,3,1,1,4])) # 2`,
              output: `max_subarray: 6
can_jump T: True
can_jump F: False
min jumps: 2`,
              status: 'idle',
              figureJson: null,
            },

            {
              id: 2,
              cellTitle: 'Step 2 — DP: Coin Change and Knapsack',
              prose: [
                'coin_change builds a 1D dp array. knapsack builds a 2D dp table — rows are items, columns are capacity.',
                'Both use bottom-up tabulation — no recursion needed.',
              ],
              instructions: 'Fill in coin_change() and knapsack().',
              code: `# TODO: fill in coin_change
def coin_change(coins, amount):
    # dp = [float('inf')] * (amount + 1); dp[0] = 0
    # for i in range(1, amount + 1):
    #   for c in coins:
    #     if c <= i and dp[i-c] + 1 < dp[i]: dp[i] = dp[i-c] + 1
    # return -1 if dp[amount] == float('inf') else dp[amount]
    pass

# TODO: fill in knapsack
def knapsack(weights, values, W):
    # n = len(weights)
    # dp = [[0]*(W+1) for _ in range(n+1)]
    # for i in range(1, n+1):
    #   for w in range(W+1):
    #     dp[i][w] = dp[i-1][w]
    #     if weights[i-1] <= w:
    #       dp[i][w] = max(dp[i][w], values[i-1] + dp[i-1][w - weights[i-1]])
    # return dp[n][W]
    pass

print('coin [1,3,4] 6:', coin_change([1,3,4], 6))     # 2
print('coin [2] 3:', coin_change([2], 3))              # -1
print('coin [1,2,5] 11:', coin_change([1,2,5], 11))   # 3
print('knapsack:', knapsack([2,3,4,5],[3,4,5,6], 5))   # 7`,
              output: `coin [1,3,4] 6: 2
coin [2] 3: -1
coin [1,2,5] 11: 3
knapsack: 7`,
              status: 'idle',
              figureJson: null,
            },

            {
              id: 3,
              cellTitle: 'From Scratch — All Paradigms + DP Table Visualization',
              prose: [
                'Write every function from memory. When assertions pass, opencalc draws the coin change DP array as a bar chart — each bar is dp[i], the minimum coins to make amount i.',
              ],
              instructions: 'Fill in all six functions. The figure visualizes the DP array.',
              code: `from opencalc import Figure

def max_crossing(arr, lo, mid, hi):
    pass  # your code

def max_subarray(arr, lo=0, hi=None):
    pass  # your code

def can_jump(nums):
    pass  # your code

def jump_game_ii(nums):
    pass  # your code

def coin_change(coins, amount):
    pass  # your code — return int

def knapsack(weights, values, W):
    pass  # your code — return int

# ---------- Assertions ----------
assert max_subarray([-2,1,-3,4,-1,2,1,-5,4]) == 6,  "max_subarray"
assert max_subarray([-1,-2,-3]) == -1,               "max_subarray all neg"
assert can_jump([2,3,1,1,4]) == True,                "can_jump T"
assert can_jump([3,2,1,0,4]) == False,               "can_jump F"
assert jump_game_ii([2,3,1,1,4]) == 2,               "jump_game_ii"
assert coin_change([1,3,4], 6)  == 2,                "coin 6"
assert coin_change([2], 3)       == -1,               "coin impossible"
assert coin_change([1,2,5], 11) == 3,                "coin 11"
assert knapsack([2,3,4,5],[3,4,5,6], 5) == 7,        "knapsack"

print("All assertions passed!")

# ---------- Visualize DP table ----------
coins  = [1, 3, 4]
amount = 12
dp = [float('inf')] * (amount + 1)
dp[0] = 0
for i in range(1, amount + 1):
    for c in coins:
        if c <= i and dp[i-c] + 1 < dp[i]:
            dp[i] = dp[i-c] + 1

fig = Figure()
fig.set_title(f"Coin change DP — coins={coins}, amount={amount}")
for i, v in enumerate(dp):
    val = v if v != float('inf') else 0
    color = "#f59e0b" if i == amount else "#60a5fa"
    fig.bar(i, val, label=f"{i}:{val}", color=color)
fig.show()`,
              output: `All assertions passed!`,
              status: 'idle',
              figureJson: null,
            },
          ],
        },
      },
    ],
  },
};
