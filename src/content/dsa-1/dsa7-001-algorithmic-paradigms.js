const lesson = {
  id: 'dsa7-001',
  title: 'Algorithmic Paradigms',
  subtitle: 'Divide & Conquer, Greedy, and Dynamic Programming — the three master patterns',
  course: 'dsa-1',
  chapter: 'dsa7',

  scienceNotebook: {
    title: 'Three Ways to Think About Hard Problems',
    subtitle: 'Each paradigm is a mental framework — learn when to reach for each one',
    sequential: true,
    cells: [
      {
        id: 'paradigm-overview',
        title: 'The Three Paradigms',
        type: 'js',
        code: `
const display = document.getElementById('display');
display.innerHTML = \`
<div style="color:#e2e8f0;font-size:13px;line-height:1.8">
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
    <div style="background:#1e293b;border-radius:8px;padding:12px;border-top:3px solid #60a5fa">
      <h3 style="color:#60a5fa;margin:0 0 8px;font-size:14px">Divide & Conquer</h3>
      <p style="color:#94a3b8;margin:0 0 8px;font-size:12px">Split the problem into independent subproblems, solve each, combine results.</p>
      <p style="color:#64748b;font-size:12px">Examples: merge sort, quicksort, binary search, max subarray</p>
    </div>
    <div style="background:#1e293b;border-radius:8px;padding:12px;border-top:3px solid #4ade80">
      <h3 style="color:#4ade80;margin:0 0 8px;font-size:14px">Greedy</h3>
      <p style="color:#94a3b8;margin:0 0 8px;font-size:12px">Always make the locally optimal choice. Works when local optimal = global optimal.</p>
      <p style="color:#64748b;font-size:12px">Examples: coin change (certain denominations), activity selection, Huffman coding, Dijkstra</p>
    </div>
    <div style="background:#1e293b;border-radius:8px;padding:12px;border-top:3px solid #f59e0b">
      <h3 style="color:#f59e0b;margin:0 0 8px;font-size:14px">Dynamic Programming</h3>
      <p style="color:#94a3b8;margin:0 0 8px;font-size:12px">Break into overlapping subproblems. Cache results (memoization or tabulation).</p>
      <p style="color:#64748b;font-size:12px">Examples: fibonacci, knapsack, longest common subsequence, edit distance</p>
    </div>
  </div>
  <div style="background:#0f172a;border-radius:6px;padding:10px;margin-top:12px;font-size:12px;color:#94a3b8">
    <b style="color:#e2e8f0">How to choose:</b> Can I solve subproblems independently? → D&C.
    Does a local greedy choice always lead to global optimum? → Greedy.
    Do subproblems overlap and need caching? → DP.
  </div>
</div>
\`;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },

      {
        id: 'dc-max-subarray',
        title: 'Divide & Conquer — Maximum Subarray',
        type: 'js',
        code: `
const display = document.getElementById('display');

// Maximum subarray via divide and conquer.
// The max subarray either:
//  (a) lies entirely in the left half
//  (b) lies entirely in the right half
//  (c) crosses the midpoint
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
  log.push({ lo, hi, mid, left, right, cross, result });
  return result;
}

const arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
const answer = maxSubarrayDC(arr, 0, arr.length - 1);

let html = '<h3 style="color:#60a5fa;margin:0 0 4px">Max Subarray D&C: ' + JSON.stringify(arr) + '</h3>';
html += '<p style="color:#94a3b8;margin:0 0 12px;font-size:13px">Answer: <b style="color:#4ade80">' + answer + '</b> (subarray [4,-1,2,1])</p>';
log.slice(-5).forEach(e => {
  html += '<div style="font-size:12px;margin-bottom:5px;padding:5px 8px;background:#1e293b;border-radius:4px">' +
    'arr[' + e.lo + '..' + e.hi + ']: left=' + e.left + ' right=' + e.right + ' cross=' + e.cross +
    ' → <b style="color:#4ade80">max=' + e.result + '</b></div>';
});
display.innerHTML = html;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },

      {
        id: 'greedy-demo',
        title: 'Greedy — Activity Selection',
        type: 'js',
        code: `
const display = document.getElementById('display');

// Activity selection: given activities with start/end times,
// pick the maximum number of non-overlapping activities.
// Greedy: always pick the activity that ends earliest.

function activitySelection(activities) {
  const sorted = [...activities].sort((a, b) => a.end - b.end);
  const selected = [sorted[0]];
  const steps = [{ activity: sorted[0], reason: 'First pick: earliest end time', selected: true }];

  for (let i = 1; i < sorted.length; i++) {
    const last = selected[selected.length - 1];
    if (sorted[i].start >= last.end) {
      selected.push(sorted[i]);
      steps.push({ activity: sorted[i], reason: 'Start ' + sorted[i].start + ' >= last end ' + last.end + ' → select', selected: true });
    } else {
      steps.push({ activity: sorted[i], reason: 'Start ' + sorted[i].start + ' < last end ' + last.end + ' → skip', selected: false });
    }
  }
  return { selected, steps };
}

const activities = [
  {name:'A', start:1, end:4},
  {name:'B', start:3, end:5},
  {name:'C', start:0, end:6},
  {name:'D', start:5, end:7},
  {name:'E', start:3, end:9},
  {name:'F', start:5, end:9},
  {name:'G', start:6, end:10},
  {name:'H', start:8, end:11},
  {name:'I', start:8, end:12},
];

const { selected, steps } = activitySelection(activities);

let html = '<h3 style="color:#60a5fa;margin:0 0 12px">Activity Selection (Greedy: earliest end first)</h3>';
steps.forEach(s => {
  const c = s.selected ? '#4ade80' : '#f87171';
  const icon = s.selected ? '✓' : '✗';
  html += '<div style="margin-bottom:5px;padding:6px 10px;background:#1e293b;border-radius:4px;font-size:13px">' +
    '<span style="color:' + c + '">' + icon + '</span> ' +
    '<b>' + s.activity.name + '</b> [' + s.activity.start + '-' + s.activity.end + '] — <span style="color:#94a3b8">' + s.reason + '</span></div>';
});
html += '<p style="color:#4ade80;margin-top:8px">Selected: ' + selected.map(a => a.name).join(', ') + ' (' + selected.length + ' activities)</p>';
display.innerHTML = html;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },

      {
        id: 'dp-tabulation-demo',
        title: 'Dynamic Programming — Coin Change (Tabulation)',
        type: 'js',
        code: `
const display = document.getElementById('display');

// Coin change: minimum number of coins to make amount.
// Greedy FAILS here (e.g., coins=[1,3,4], amount=6: greedy gives 4+1+1=3 but 3+3=2).
// DP solution: dp[i] = min coins to make amount i.

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  const steps = [];
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (c <= i && dp[i-c] + 1 < dp[i]) {
        dp[i] = dp[i-c] + 1;
      }
    }
    steps.push({ i, val: dp[i] });
  }
  return { dp, steps };
}

const coins = [1, 3, 4];
const amount = 6;
const { dp, steps } = coinChange(coins, amount);

let html = '<h3 style="color:#60a5fa;margin:0 0 4px">Coin Change DP: coins=[1,3,4], amount=' + amount + '</h3>';
html += '<p style="color:#94a3b8;font-size:13px;margin:0 0 12px">dp[i] = min coins to make i</p>';
html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
dp.forEach((v, i) => {
  const color = v === Infinity ? '#475569' : i === amount ? '#f59e0b' : '#4ade80';
  html += '<div style="text-align:center"><div style="background:#1e293b;border:1px solid #334155;border-radius:4px;padding:6px 10px;color:' + color + ';font-weight:bold">' + (v === Infinity ? '∞' : v) + '</div><div style="color:#64748b;font-size:11px;margin-top:2px">i=' + i + '</div></div>';
});
html += '</div>';
html += '<p style="color:#4ade80;margin-top:12px">dp[' + amount + '] = <b>' + dp[amount] + '</b> coins (3+3)</p>';
html += '<p style="color:#f87171;font-size:12px;margin-top:4px">Greedy would give: 4+1+1 = 3 coins — wrong!</p>';
display.innerHTML = html;
        `,
        html: '<div id="display" style="padding:12px"></div>',
      },
    ],
  },

  jsNotebook: {
    title: 'Algorithmic Paradigms — JavaScript',
    subtitle: 'Implement D&C, Greedy, and DP patterns step by step',
    cells: [
      {
        id: 'paradigm-js-dc',
        title: 'Step 1 — Divide & Conquer: Maximum Subarray',
        prose: [
          'Kadane\'s algorithm (linear scan) is simpler, but D&C teaches the pattern.',
          'The max subarray crossing the midpoint must include arr[mid] and arr[mid+1]. Scan outward from mid in both directions to find the best crossing sum.',
        ],
        instructions: 'Implement maxCrossing() and maxSubarray(). Return the maximum subarray sum.',
        startCode: `// Find the maximum sum of any subarray crossing the midpoint.
// Scan left from mid to lo, track running sum and best leftSum.
// Scan right from mid+1 to hi, track running sum and best rightSum.
// Return leftSum + rightSum.
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
  // TODO: return Math.max(maxSubarray(arr, lo, mid), maxSubarray(arr, mid+1, hi), maxCrossing(arr, lo, mid, hi))
}

// --- Tests ---
console.log('test 1:', maxSubarray([-2,1,-3,4,-1,2,1,-5,4])); // 6  ([4,-1,2,1])
console.log('test 2:', maxSubarray([1]));                       // 1
console.log('test 3:', maxSubarray([-1,-2,-3]));                // -1
console.log('test 4:', maxSubarray([5,4,-1,7,8]));              // 23
`,
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

console.log('test 1:', maxSubarray([-2,1,-3,4,-1,2,1,-5,4]));
console.log('test 2:', maxSubarray([1]));
console.log('test 3:', maxSubarray([-1,-2,-3]));
console.log('test 4:', maxSubarray([5,4,-1,7,8]));
`,
        check: (output) => {
          return output.includes('test 1: 6') &&
                 output.includes('test 2: 1') &&
                 output.includes('test 3: -1') &&
                 output.includes('test 4: 23');
        },
      },

      {
        id: 'paradigm-js-greedy',
        title: 'Step 2 — Greedy: Jump Game',
        prose: [
          'Jump Game: given an array where each element is your maximum jump length from that position, can you reach the last index?',
          'Greedy approach: track the farthest position reachable so far. If you\'re ever at a position beyond farthest, you\'re stuck.',
        ],
        instructions: 'Implement canJump() and also jumpGameII() — the minimum number of jumps to reach the end.',
        startCode: `// Can you reach the last index?
// Greedy: track 'maxReach' — the farthest index reachable so far.
// If i ever exceeds maxReach, return false.
function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    // TODO: if i > maxReach, return false (stuck)
    // TODO: maxReach = Math.max(maxReach, i + nums[i])
  }
  // TODO: return true
}

// Minimum jumps to reach the end.
// Greedy: at each "level" (current jump range), find the farthest
// you can reach. When you exhaust the current level, increment jumps.
function jumpGameII(nums) {
  let jumps = 0, currentEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    // TODO: farthest = Math.max(farthest, i + nums[i])
    // TODO: if i === currentEnd: jumps++; currentEnd = farthest
  }
  return jumps;
}

// --- Tests ---
console.log('canJump [2,3,1,1,4]:', canJump([2,3,1,1,4]));  // true
console.log('canJump [3,2,1,0,4]:', canJump([3,2,1,0,4]));  // false
console.log('minJumps [2,3,1,1,4]:', jumpGameII([2,3,1,1,4])); // 2
console.log('minJumps [2,3,0,1,4]:', jumpGameII([2,3,0,1,4])); // 2
`,
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

console.log('canJump [2,3,1,1,4]:', canJump([2,3,1,1,4]));
console.log('canJump [3,2,1,0,4]:', canJump([3,2,1,0,4]));
console.log('minJumps [2,3,1,1,4]:', jumpGameII([2,3,1,1,4]));
console.log('minJumps [2,3,0,1,4]:', jumpGameII([2,3,0,1,4]));
`,
        check: (output) => {
          return output.includes('canJump [2,3,1,1,4]: true') &&
                 output.includes('canJump [3,2,1,0,4]: false') &&
                 output.includes('minJumps [2,3,1,1,4]: 2') &&
                 output.includes('minJumps [2,3,0,1,4]: 2');
        },
      },

      {
        id: 'paradigm-js-dp',
        title: 'Step 3 — Dynamic Programming: Coin Change and Knapsack',
        prose: [
          'Coin change: dp[i] = minimum coins to make amount i. For each amount, try every coin — if coin c fits, dp[i] = min(dp[i], dp[i-c] + 1).',
          '0/1 Knapsack: dp[i][w] = maximum value using items 0..i with weight capacity w. Either skip item i, or include it (if it fits).',
        ],
        instructions: 'Implement coinChange() and knapsack(). Both use bottom-up tabulation.',
        startCode: `// Minimum coins to make 'amount' using given coin denominations.
// dp[0] = 0; dp[i] = min over all coins c where c<=i of dp[i-c]+1
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

// 0/1 Knapsack: items have weights[] and values[]. Capacity = W.
// dp[i][w] = max value using items 0..i-1 with capacity w
// Either skip item i: dp[i][w] = dp[i-1][w]
// Or include item i (if weights[i-1] <= w): dp[i][w] = values[i-1] + dp[i-1][w - weights[i-1]]
function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({length: n+1}, () => new Array(W+1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      // TODO: dp[i][w] = dp[i-1][w]  (skip item)
      // TODO: if weights[i-1] <= w: dp[i][w] = Math.max(dp[i][w], values[i-1] + dp[i-1][w - weights[i-1]])
    }
  }
  return dp[n][W];
}

// --- Tests ---
console.log('coinChange [1,3,4] 6:', coinChange([1,3,4], 6));   // 2  (3+3)
console.log('coinChange [2] 3:', coinChange([2], 3));             // -1 (impossible)
console.log('coinChange [1,2,5] 11:', coinChange([1,2,5], 11));  // 3  (5+5+1)
console.log('knapsack:', knapsack([2,3,4,5],[3,4,5,6], 5));       // 7  (items 0+1: w=2+3, v=3+4)
`,
        solutionCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (c <= i && dp[i-c] + 1 < dp[i]) dp[i] = dp[i-c] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({length: n+1}, () => new Array(W+1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i-1][w];
      if (weights[i-1] <= w) dp[i][w] = Math.max(dp[i][w], values[i-1] + dp[i-1][w - weights[i-1]]);
    }
  }
  return dp[n][W];
}

console.log('coinChange [1,3,4] 6:', coinChange([1,3,4], 6));
console.log('coinChange [2] 3:', coinChange([2], 3));
console.log('coinChange [1,2,5] 11:', coinChange([1,2,5], 11));
console.log('knapsack:', knapsack([2,3,4,5],[3,4,5,6], 5));
`,
        check: (output) => {
          return output.includes('coinChange [1,3,4] 6: 2') &&
                 output.includes('coinChange [2] 3: -1') &&
                 output.includes('coinChange [1,2,5] 11: 3') &&
                 output.includes('knapsack: 7');
        },
      },

      {
        id: 'paradigm-js-scratch',
        title: 'From Scratch — All Three Paradigms',
        prose: [
          'Write all five functions from memory: maxSubarray (D&C), canJump + jumpGameII (Greedy), coinChange + knapsack (DP).',
        ],
        instructions: 'Empty shells — type every algorithm. 11 tests verify all three paradigms.',
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
let pass = 0, fail = 0;
function test(desc, got, expected) {
  const g = JSON.stringify(got), e = JSON.stringify(expected);
  if (g === e) { console.log('✓', desc); pass++; }
  else { console.log('✗', desc, '| expected:', e, '| got:', g); fail++; }
}

// D&C
test('maxSubarray basic',    maxSubarray([-2,1,-3,4,-1,2,1,-5,4]), 6);
test('maxSubarray all neg',  maxSubarray([-1,-2,-3]),               -1);
test('maxSubarray all pos',  maxSubarray([5,4,-1,7,8]),             23);

// Greedy
test('canJump reachable',    canJump([2,3,1,1,4]),   true);
test('canJump stuck',        canJump([3,2,1,0,4]),   false);
test('jumpGameII 2 jumps',   jumpGameII([2,3,1,1,4]), 2);
test('jumpGameII 2 jumps 2', jumpGameII([2,3,0,1,4]), 2);

// DP
test('coinChange 2 coins',   coinChange([1,3,4], 6),    2);
test('coinChange impossible', coinChange([2], 3),         -1);
test('coinChange 3 coins',   coinChange([1,2,5], 11),    3);
test('knapsack optimal',     knapsack([2,3,4,5],[3,4,5,6], 5), 7);

console.log('\\n' + pass + '/' + (pass+fail) + ' tests passed');
`,
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

let pass = 0, fail = 0;
function test(desc, got, expected) {
  const g = JSON.stringify(got), e = JSON.stringify(expected);
  if (g === e) { console.log('✓', desc); pass++; }
  else { console.log('✗', desc, '| expected:', e, '| got:', g); fail++; }
}

test('maxSubarray basic',    maxSubarray([-2,1,-3,4,-1,2,1,-5,4]), 6);
test('maxSubarray all neg',  maxSubarray([-1,-2,-3]),               -1);
test('maxSubarray all pos',  maxSubarray([5,4,-1,7,8]),             23);
test('canJump reachable',    canJump([2,3,1,1,4]),   true);
test('canJump stuck',        canJump([3,2,1,0,4]),   false);
test('jumpGameII 2 jumps',   jumpGameII([2,3,1,1,4]), 2);
test('jumpGameII 2 jumps 2', jumpGameII([2,3,0,1,4]), 2);
test('coinChange 2 coins',   coinChange([1,3,4], 6),    2);
test('coinChange impossible', coinChange([2], 3),         -1);
test('coinChange 3 coins',   coinChange([1,2,5], 11),    3);
test('knapsack optimal',     knapsack([2,3,4,5],[3,4,5,6], 5), 7);

console.log('\\n' + pass + '/' + (pass+fail) + ' tests passed');
`,
        check: (output) => {
          return output.includes('11/11 tests passed');
        },
      },
    ],
  },

  pythonNotebook: {
    title: 'Algorithmic Paradigms — Python',
    subtitle: 'D&C, Greedy, and DP in Python with DP table visualization',
    cells: [
      {
        id: 'paradigm-py-dc-greedy',
        cellTitle: 'Step 1 — D&C (max subarray) and Greedy (jump game)',
        prose: [
          'max_subarray uses divide & conquer. can_jump and jump_game_ii use greedy — no cache, just track reachability.',
        ],
        instructions: 'Fill in all four functions.',
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
    # base case: if lo == hi: return arr[lo]
    # mid = (lo + hi) // 2
    # return max(max_subarray(...left...), max_subarray(...right...), max_crossing(...))
    pass

# TODO: fill in can_jump (greedy)
def can_jump(nums):
    pass

# TODO: fill in jump_game_ii (greedy — min jumps)
def jump_game_ii(nums):
    pass

print('max_subarray:', max_subarray([-2,1,-3,4,-1,2,1,-5,4]))  # 6
print('can_jump T:', can_jump([2,3,1,1,4]))   # True
print('can_jump F:', can_jump([3,2,1,0,4]))   # False
print('min jumps:', jump_game_ii([2,3,1,1,4])) # 2
`,
        output: `max_subarray: 6
can_jump T: True
can_jump F: False
min jumps: 2`,
        status: 'incomplete',
      },

      {
        id: 'paradigm-py-dp',
        cellTitle: 'Step 2 — DP: Coin Change and Knapsack',
        prose: [
          'Both use bottom-up tabulation. coin_change builds a 1D dp array. knapsack builds a 2D dp table.',
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
print('knapsack:', knapsack([2,3,4,5],[3,4,5,6], 5))   # 7
`,
        output: `coin [1,3,4] 6: 2
coin [2] 3: -1
coin [1,2,5] 11: 3
knapsack: 7`,
        status: 'incomplete',
      },

      {
        id: 'paradigm-py-scratch',
        cellTitle: 'From Scratch — All Paradigms + DP Table Visualization',
        prose: [
          'Write every function from memory. When assertions pass, opencalc draws the coin change DP table as a bar chart — each bar shows dp[i], the minimum coins needed to make that amount.',
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
fig.show()
`,
        output: `All assertions passed!`,
        status: 'incomplete',
        figureJson: null,
      },
    ],
  },
};

export default lesson;
