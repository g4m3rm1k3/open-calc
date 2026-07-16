export default {
  id: 'dp6-003',
  slug: 'divide-and-conquer-optimization',
  chapter: 'dp6',
  order: 3,
  title: 'Divide and Conquer Optimization',
  subtitle: 'Turning O(k·n²) partition DP into O(k·n log n) using split-point monotonicity',
  tags: ['dynamic programming', 'dp optimization', 'divide and conquer optimization', 'partition dp'],
  aliases: 'divide and conquer optimization dp partition problems opt monotonicity',

  hook: {
    question: 'Splitting an array into k contiguous groups to minimize some cost (say, the sum of squares of each group\'s total) is a classic layered DP: dp[k][i] = min over split point j of dp[k-1][j] + cost(j,i). Computed directly, this is O(k·n²) — for each of k layers, for each of n prefixes i, try every one of n possible split points j. Just like Knuth\'s optimization from the last lesson, the optimal split point opt(k,i) turns out to be monotonic in i. But this time the shape of the recurrence (one layer built entirely from the PREVIOUS layer, not from itself) calls for a different exploitation strategy: divide and conquer over the i values themselves.',
    realWorldContext: 'Divide and Conquer (D&C) optimization is the standard technique for a wide class of "partition into k contiguous groups" problems — task scheduling across k machines, paginating content to minimize a per-page penalty, and any layered DP where dp[k][i] depends only on dp[k-1][*] with a monotonic optimal split. It is a direct cousin of Knuth\'s optimization: same underlying monotonicity idea, different algorithmic shape.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The recurrence and its optimal split point.** For partitioning the first `i` elements into `k` groups, `dp[k][i] = min over j in [0, i) of dp[k-1][j] + cost(j, i)`, where `cost(j, i)` is the cost of making elements `j+1..i` one group (e.g., the square of their sum). Define `opt(k, i)` as the `j` that achieves this minimum. When `cost` is well-behaved (formally: satisfies the "totally monotone" or quadrangle-inequality-like condition — true for convex costs like sum-of-squares), `opt(k, i)` is non-decreasing as `i` increases: `opt(k, i) <= opt(k, i+1)`. This is the SAME kind of monotonicity Knuth\'s optimization exploited, but here it constrains how `opt` moves as `i` increases within a SINGLE layer `k`, not across two dimensions `i` and `j` of one interval table.',
      '**Why divide and conquer is the natural exploitation here, not a direct range restriction.** In Knuth\'s optimization, `opt[i][j-1]` and `opt[i+1][j]` were already known by the time `opt[i][j]` was needed, because interval DP fills strictly shorter intervals first. Here, layer `k` depends only on layer `k-1`, but WITHIN layer `k`, the `n` values `dp[k][1..n]` don\'t have an obvious "already computed" ordering to exploit directly — so instead, `solve(lo, hi, optLo, optHi)` recursively computes `dp[k][mid]` for `mid = (lo+hi)/2` FIRST (searching only `j` in `[optLo, optHi]` for its split point, call the answer `optMid`), and then recurses on `solve(lo, mid-1, optLo, optMid)` and `solve(mid+1, hi, optMid, optHi)` — the monotonicity guarantees the left half\'s optimal splits are all `<= optMid` and the right half\'s are all `>= optMid`, so each recursive call\'s own search range shrinks accordingly.',
      '**The resulting complexity.** Each layer\'s `solve` call forms a balanced binary recursion over `i` values (like a segment-tree traversal), doing `O(hi - lo)` work to pick each `mid`\'s split (bounded by `optHi - optLo`) at every level of the recursion. Summing the total search-range width across one full level of the recursion is bounded by `O(n)` (the ranges at each level partition `[0,n]` without much overlap), and there are `O(log n)` levels, so one full layer costs `O(n log n)`. Across `k` layers, that\'s `O(k n log n)` total — versus `O(k n²)` naively. For `k` around `n` (e.g., partitioning into as many groups as elements), this is the difference between roughly `O(n³)` and `O(n² log n)`.',
      '**The precondition, again.** Exactly as with Knuth\'s optimization, this speedup depends on `cost(j, i)` actually satisfying the monotonicity condition that guarantees `opt(k,i)` is non-decreasing in `i`. Convex cost functions (like sum-of-squares, or many "penalty grows faster than linearly" costs) typically satisfy it; costs that don\'t have this shape may not, and blindly applying divide and conquer optimization to an arbitrary cost function can produce a WRONG answer. Always verify a new application against the naive O(k n²) version on small random cases before trusting it.',
      '**Relating the three techniques so far.** Monotonic deque optimization (Lesson 1) exploited a sliding window inside a single 1D recurrence. Knuth\'s optimization (Lesson 2) exploited monotonicity of a split point ACROSS a 2D interval table, using shorter intervals\' already-known answers. Divide and conquer optimization (this lesson) exploits the SAME kind of split-point monotonicity, but within a single layer whose dependency is entirely on the PREVIOUS layer — recursion over the answer positions themselves, rather than a direct range lookup, is what makes that monotonicity usable here.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 6, Lesson 3: Divide and Conquer Optimization',
        body: '**Previous:** Knuth\'s Optimization — bounding an interval-DP split search using neighboring intervals\' known optima.\n**This lesson:** Divide and Conquer Optimization — same monotonicity idea, applied via recursion over answer positions within one DP layer.\n**Next:** a synthesis lesson on recognizing which optimization technique fits which recurrence shape.',
      },
      {
        type: 'insight',
        title: 'The recursion pattern, in one line',
        body: 'solve(lo, hi, optLo, optHi): pick mid=(lo+hi)/2, find its best split j in [optLo, optHi] (call it optMid), then recurse solve(lo, mid-1, optLo, optMid) and solve(mid+1, hi, optMid, optHi). Each recursive call only searches the range monotonicity guarantees is sufficient.',
      },
      {
        type: 'strategy',
        title: 'Layer by layer, same as any grouped/knapsack-shaped DP',
        body: 'Process one full k-layer at a time (compute all of dp[k][*] using only dp[k-1][*]), exactly like the classic bounded-knapsack "layer" discipline — the divide and conquer recursion runs entirely WITHIN a single layer\'s computation.',
      },
      {
        type: 'warning',
        title: "Same precondition as Knuth's — verify before trusting",
        body: 'This speedup requires opt(k,i) to be genuinely non-decreasing in i, which in turn requires cost(j,i) to satisfy a monotonicity condition (typically: convexity of the cost). Sum-of-squares group cost satisfies it. An arbitrary or non-convex cost function might not — cross-check against the naive O(k n²) version on small cases before trusting a new application.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'D&C Optimization: The Recursion Tree Over Split Points',
        caption: 'Watch each mid-point search shrink to the range monotonicity guarantees is sufficient.',
        props: {
          lesson: {
            title: 'Divide and Conquer Optimization Step by Step',
            subtitle: 'Recursing over answer positions, not intervals.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'One Layer of the Recursion Tree',
                instruction: 'For k=3 groups over 8 numbers, watch how each recursive call restricts its own search range.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const nums = [3,1,4,1,5,9,2,6];
const n = nums.length;
const prefix = new Array(n+1).fill(0);
for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + nums[i];
const cost = (j, i) => { const s = prefix[i] - prefix[j]; return s * s; };

const INF = Infinity;
let dpPrev = new Array(n+1).fill(INF);
dpPrev[0] = 0;
const log = [];

function solveLayer(dpPrev) {
  const dpCur = new Array(n+1).fill(INF);
  function solve(lo, hi, optLo, optHi) {
    if (lo > hi) return;
    const mid = Math.floor((lo + hi) / 2);
    let bestCost = INF, bestJ = optLo;
    const searchHi = Math.min(mid, optHi);
    for (let j = optLo; j <= searchHi; j++) {
      if (dpPrev[j] === INF) continue;
      const c = dpPrev[j] + cost(j, mid);
      if (c < bestCost) { bestCost = c; bestJ = j; }
    }
    dpCur[mid] = bestCost;
    log.push({ mid, searchLo: optLo, searchHi, width: searchHi - optLo + 1, bestJ });
    solve(lo, mid - 1, optLo, bestJ);
    solve(mid + 1, hi, bestJ, optHi);
  }
  solve(1, n, 0, n - 1);
  return dpCur;
}

for (let k = 1; k <= 3; k++) {
  log.length = 0;
  dpPrev = solveLayer(dpPrev);
  d.innerHTML += '<div style="color:#60a5fa;margin:6px 0 2px">Layer k=' + k + ' (dp[' + k + '][8] = ' + dpPrev[n] + '):</div>';
  log.sort((a,b) => a.mid - b.mid).forEach(e => {
    d.innerHTML += '<div style="padding:2px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px">mid=' + e.mid + ': searched j in [' + e.searchLo + ',' + e.searchHi + '] (' + e.width + ' candidates) &rarr; best split j=<b style="color:#4ade80">' + e.bestJ + '</b></div>';
  });
}`,
                outputHeight: 480,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Divide and Conquer Optimization from Scratch',
        caption: 'The naive O(k·n²) version, then the O(k·n log n) optimized version.',
        props: {
          lesson: {
            title: 'Divide and Conquer Optimization in JavaScript',
            subtitle: 'Recursively restricting the split-point search per layer.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Naive O(k·n²) Partition DP

Implement \`minCostNaive(nums, k)\`: partition nums into k contiguous groups minimizing the sum, over all groups, of (group sum)².`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function minCostNaive(nums, k) {
  const n = nums.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + nums[i];
  const cost = (j, i) => { const s = prefix[i] - prefix[j]; return s * s; };

  const INF = Infinity;
  let dp = new Array(n + 1).fill(INF);
  dp[0] = 0;

  for (let layer = 1; layer <= k; layer++) {
    const next = new Array(n + 1).fill(INF);
    for (let i = 1; i <= n; i++) {
      for (let j = 0; j < i; j++) {
        // TODO: if dp[j] is INF, skip
        // TODO: candidate = dp[j] + cost(j, i); update next[i] if better
      }
    }
    dp = next;
  }
  return dp[n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

const nums = [3,1,4,1,5,9,2,6];
test('k=1', minCostNaive(nums, 1), 961);
test('k=2', minCostNaive(nums, 2), 485);
test('k=4', minCostNaive(nums, 4), 245);`,
                solutionCode: `function minCostNaive(nums, k) {
  const n = nums.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + nums[i];
  const cost = (j, i) => { const s = prefix[i] - prefix[j]; return s * s; };

  const INF = Infinity;
  let dp = new Array(n + 1).fill(INF);
  dp[0] = 0;

  for (let layer = 1; layer <= k; layer++) {
    const next = new Array(n + 1).fill(INF);
    for (let i = 1; i <= n; i++) {
      for (let j = 0; j < i; j++) {
        if (dp[j] === INF) continue;
        const candidate = dp[j] + cost(j, i);
        if (candidate < next[i]) next[i] = candidate;
      }
    }
    dp = next;
  }
  return dp[n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

const nums = [3,1,4,1,5,9,2,6];
test('k=1', minCostNaive(nums, 1), 961);
test('k=2', minCostNaive(nums, 2), 485);
test('k=4', minCostNaive(nums, 4), 245);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — D&C-Optimized O(k·n log n) Version

Implement \`minCostDC(nums, k)\` using the recursive solve(lo, hi, optLo, optHi) pattern.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function minCostDC(nums, k) {
  const n = nums.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + nums[i];
  const cost = (j, i) => { const s = prefix[i] - prefix[j]; return s * s; };
  const INF = Infinity;

  let dpPrev = new Array(n + 1).fill(INF);
  dpPrev[0] = 0;

  for (let layer = 1; layer <= k; layer++) {
    const dpCur = new Array(n + 1).fill(INF);
    function solve(lo, hi, optLo, optHi) {
      if (lo > hi) return;
      const mid = Math.floor((lo + hi) / 2);
      let bestCost = INF, bestJ = optLo;
      const searchHi = Math.min(mid, optHi);
      for (let j = optLo; j <= searchHi; j++) {
        // TODO: skip if dpPrev[j] is INF
        // TODO: candidate = dpPrev[j] + cost(j, mid); update bestCost/bestJ if better
      }
      dpCur[mid] = bestCost;
      // TODO: recurse solve(lo, mid-1, optLo, bestJ) and solve(mid+1, hi, bestJ, optHi)
    }
    solve(1, n, 0, n - 1);
    dpPrev = dpCur;
  }
  return dpPrev[n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

const nums = [3,1,4,1,5,9,2,6];
test('k=1', minCostDC(nums, 1), 961);
test('k=2', minCostDC(nums, 2), 485);
test('k=4', minCostDC(nums, 4), 245);`,
                solutionCode: `function minCostDC(nums, k) {
  const n = nums.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + nums[i];
  const cost = (j, i) => { const s = prefix[i] - prefix[j]; return s * s; };
  const INF = Infinity;

  let dpPrev = new Array(n + 1).fill(INF);
  dpPrev[0] = 0;

  for (let layer = 1; layer <= k; layer++) {
    const dpCur = new Array(n + 1).fill(INF);
    function solve(lo, hi, optLo, optHi) {
      if (lo > hi) return;
      const mid = Math.floor((lo + hi) / 2);
      let bestCost = INF, bestJ = optLo;
      const searchHi = Math.min(mid, optHi);
      for (let j = optLo; j <= searchHi; j++) {
        if (dpPrev[j] === INF) continue;
        const candidate = dpPrev[j] + cost(j, mid);
        if (candidate < bestCost) { bestCost = candidate; bestJ = j; }
      }
      dpCur[mid] = bestCost;
      solve(lo, mid - 1, optLo, bestJ);
      solve(mid + 1, hi, bestJ, optHi);
    }
    solve(1, n, 0, n - 1);
    dpPrev = dpCur;
  }
  return dpPrev[n];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

const nums = [3,1,4,1,5,9,2,6];
test('k=1', minCostDC(nums, 1), 961);
test('k=2', minCostDC(nums, 2), 485);
test('k=4', minCostDC(nums, 4), 245);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Divide and Conquer Optimization in Python',
        caption: 'Verify against random inputs, visualize the recursion tree, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Naive vs D&C-Optimized — Verify on Random Inputs',
              code: `import random


def min_cost_naive(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + nums[i]
    def cost(j, i):
        s = prefix[i] - prefix[j]
        return s * s

    INF = float("inf")
    dp = [INF] * (n + 1)
    dp[0] = 0
    for _ in range(k):
        nxt = [INF] * (n + 1)
        for i in range(1, n + 1):
            for j in range(i):
                if dp[j] == INF:
                    continue
                c = dp[j] + cost(j, i)
                if c < nxt[i]:
                    nxt[i] = c
        dp = nxt
    return dp[n]


def min_cost_dc(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + nums[i]
    def cost(j, i):
        s = prefix[i] - prefix[j]
        return s * s

    INF = float("inf")
    dp_prev = [INF] * (n + 1)
    dp_prev[0] = 0

    for _ in range(k):
        dp_cur = [INF] * (n + 1)

        def solve(lo, hi, opt_lo, opt_hi):
            if lo > hi:
                return
            mid = (lo + hi) // 2
            best_cost, best_j = INF, opt_lo
            for j in range(opt_lo, min(mid, opt_hi) + 1):
                if dp_prev[j] == INF:
                    continue
                c = dp_prev[j] + cost(j, mid)
                if c < best_cost:
                    best_cost, best_j = c, j
            dp_cur[mid] = best_cost
            solve(lo, mid - 1, opt_lo, best_j)
            solve(mid + 1, hi, best_j, opt_hi)

        solve(1, n, 0, n - 1)
        dp_prev = dp_cur

    return dp_prev[n]


random.seed(7)
all_ok = True
for _ in range(15):
    n = random.randint(1, 10)
    k = random.randint(1, n)
    nums = [random.randint(1, 9) for _ in range(n)]
    a = min_cost_naive(nums, k)
    b = min_cost_dc(nums, k)
    if a != b:
        all_ok = False
        print("MISMATCH:", nums, k, a, b)

nums = [3, 1, 4, 1, 5, 9, 2, 6]
for k in [1, 2, 3, 4]:
    print(f"k={k}: naive={min_cost_naive(nums, k)}, dc={min_cost_dc(nums, k)}")

assert all_ok
print("All 15 random trials matched — assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Search-Width Savings per Layer',
              code: `import matplotlib.pyplot as plt


def dc_widths(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + nums[i]
    def cost(j, i):
        s = prefix[i] - prefix[j]
        return s * s

    INF = float("inf")
    dp_prev = [INF] * (n + 1)
    dp_prev[0] = 0
    naive_totals, dc_totals = [], []

    for _ in range(k):
        dp_cur = [INF] * (n + 1)
        width_sum = [0]

        def solve(lo, hi, opt_lo, opt_hi):
            if lo > hi:
                return
            mid = (lo + hi) // 2
            best_cost, best_j = INF, opt_lo
            search_hi = min(mid, opt_hi)
            width_sum[0] += search_hi - opt_lo + 1
            for j in range(opt_lo, search_hi + 1):
                if dp_prev[j] == INF:
                    continue
                c = dp_prev[j] + cost(j, mid)
                if c < best_cost:
                    best_cost, best_j = c, j
            dp_cur[mid] = best_cost
            solve(lo, mid - 1, opt_lo, best_j)
            solve(mid + 1, hi, best_j, opt_hi)

        solve(1, n, 0, n - 1)
        dc_totals.append(width_sum[0])
        naive_totals.append(n * n // 2)
        dp_prev = dp_cur

    return naive_totals, dc_totals


nums = list(range(1, 31))
naive_totals, dc_totals = dc_widths(nums, 10)

fig, ax = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
layers = list(range(1, len(nums[:10]) + 1)) if False else list(range(1, 11))
ax.plot(layers, naive_totals, "o-", color="#f87171", label="Naive: ~n²/2 comparisons per layer")
ax.plot(layers, dc_totals, "o-", color="#4ade80", label="D&C: actual comparisons per layer")
ax.set_xlabel("Layer (k)", color="#94a3b8")
ax.set_ylabel("Split-point comparisons in this layer", color="#94a3b8")
ax.set_title("D&C optimization keeps per-layer work near O(n log n), not O(n²)", color="#e2e8f0", fontsize=11)
ax.tick_params(colors="#94a3b8")
ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()
print("Naive per-layer (n=30):", naive_totals[0])
print("D&C per-layer (n=30):", dc_totals)`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Divide and conquer optimization, from scratch',
              difficulty: 'hard',
              prompt: 'Fill in solve() inside min_cost_scratch(nums, k): find the best split for mid within [optLo, min(mid, optHi)], then recurse on both halves using that split as a bound. Uncomment the assertion once ready.',
              hint: 'best_j starts at opt_lo. After computing dp_cur[mid], recurse solve(lo, mid-1, opt_lo, best_j) then solve(mid+1, hi, best_j, opt_hi) — best_j bounds both recursive calls.',
              label: 'From Scratch — D&C-Optimized Partition DP',
              code: `def min_cost_scratch(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + nums[i]
    def cost(j, i):
        s = prefix[i] - prefix[j]
        return s * s

    INF = float("inf")
    dp_prev = [INF] * (n + 1)
    dp_prev[0] = 0

    for _ in range(k):
        dp_cur = [INF] * (n + 1)

        def solve(lo, hi, opt_lo, opt_hi):
            if lo > hi:
                return
            mid = (lo + hi) // 2
            # YOUR CODE HERE:
            # search j in range(opt_lo, min(mid, opt_hi)+1) for the best split
            # dp_cur[mid] = best_cost
            # solve(lo, mid-1, opt_lo, best_j)
            # solve(mid+1, hi, best_j, opt_hi)
            pass

        solve(1, n, 0, n - 1)
        dp_prev = dp_cur

    return dp_prev[n]


nums = [2, 4, 1, 8, 3, 7, 5, 6, 9, 2]

# --- Uncomment to test when ready ---
# result = min_cost_scratch(nums, 3)
# print(f"min_cost_scratch(nums, 3) = {result}")
# assert result == 739, f"got {result}"
# print("All assertions passed!")`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'What monotonicity property makes divide and conquer optimization applicable?',
      options: [
        'That the input array must already be sorted',
        'That opt(k, i) — the optimal split point for prefix i in layer k — is non-decreasing as i increases, which holds when the cost function satisfies a quadrangle-inequality-like condition (e.g., convex costs such as sum-of-squares)',
        'That every layer must produce the same dp value regardless of k',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: "Why does this technique use recursion over answer positions (solve(lo, hi, optLo, optHi)) instead of a direct range lookup like Knuth's optimization used?",
      options: [
        'Because recursion is always faster than iteration in every language',
        'Because within a single layer, the n answer positions don\'t have an "already computed, shorter" ordering to look up the way interval DP\'s shorter intervals do — so the algorithm instead computes the middle position first and uses monotonicity to bound the search range for the two recursive halves',
        'Because the cost function can only be evaluated recursively, never iteratively',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What is the overall complexity improvement from divide and conquer optimization, and where does the O(n log n) per layer come from?',
      options: [
        'From O(k·n²) naively to O(k·n log n) optimized — each layer costs O(n log n) because the total search-range width across one full level of the recursion is bounded by O(n), and there are O(log n) levels',
        'From O(k·n²) to O(k·n) — the optimization removes the search step entirely',
        'From O(n³) to O(n²) always, regardless of k',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What precondition must the cost function satisfy for this optimization to give a correct (not just faster) answer?',
      options: [
        'The cost function must be a simple linear function of its inputs',
        'The cost function must satisfy the monotonicity condition (typically convexity) that guarantees opt(k,i) is genuinely non-decreasing in i — without it, restricting the search range can silently skip the true optimal split and produce a wrong answer, so a new application should always be cross-checked against the naive version on small cases',
        'The array must contain only positive numbers',
      ],
      correct: 1,
    },
  ],
};
