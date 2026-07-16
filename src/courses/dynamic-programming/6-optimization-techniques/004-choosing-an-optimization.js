export default {
  id: 'dp6-004',
  slug: 'choosing-an-optimization',
  chapter: 'dp6',
  order: 4,
  title: 'Choosing the Right DP Optimization',
  subtitle: 'Reading a recurrence to recognize which speedup technique applies',
  tags: ['dynamic programming', 'dp optimization', 'monotonic deque', 'knuths optimization', 'divide and conquer optimization', 'practice'],
  aliases: 'which dp optimization to use recurrence pattern recognition practice',

  hook: {
    question: 'Three lessons, three optimizations, three different recurrence shapes: a sliding-window max inside a 1D recurrence (monotonic deque), a split point across a 2D interval table (Knuth\'s), and a split point within a single DP layer built from the previous layer (divide and conquer). In practice, the hard part is rarely APPLYING one of these once you know which one fits — it\'s recognizing which one a brand-new recurrence calls for just by reading its shape.',
    realWorldContext: 'Interview and competitive-programming problems rarely announce "use Knuth\'s optimization here" — recognizing the recurrence SHAPE (how many dimensions, what the inner min/max ranges over, whether the cost function looks convex) is the actual skill being tested, and it transfers across every DP-heavy domain: scheduling, computational geometry, string algorithms, and bioinformatics sequence alignment all lean on these same three patterns.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Read the recurrence\'s shape first, before reaching for any specific technique.** Ask three questions: (1) How many "free" dimensions does the DP table have — one (`dp[i]`) or two (`dp[i][j]`)? (2) Does the inner min/max range over a WINDOW of fixed or shrinking size (as `i` grows, do old candidates fall out of range), or over an unrestricted, growing range of split points? (3) If it is a split point being chosen, does it live INSIDE one 2D interval table (so shorter intervals are already known), or does it define one layer\'s dependence on the PREVIOUS layer (so there\'s no shorter-interval structure to exploit directly)?',
      '**Monotonic deque optimization fits question (2)\'s "fixed or shrinking window" answer.** The signature shape is `dp[i] = f(nums[i]) + best(dp[i-k..i-1])` — a 1D table where each entry needs the max or min over a SLIDING WINDOW of the `k` most recent (or otherwise bounded) previous entries. The window\'s bound (`k`) is what lets a monotonic deque discard now-irrelevant old candidates in amortized O(1) per step, giving O(n) total instead of O(n·k).',
      '**Knuth\'s optimization fits a 2D interval table where the SAME table feeds itself.** The signature shape is `dp[i][j] = min over r in [i,j] of dp[i][r-1] + dp[r+1][j] + cost(i,j)` — both halves of the split come from the SAME 2D table, just at strictly shorter intervals. This "shorter intervals already computed" structure is exactly what lets `opt[i][j-1]` and `opt[i+1][j]` already be known when computing `opt[i][j]`, bounding its search range.',
      '**Divide and conquer optimization fits a layered (2D) recurrence where one layer depends ENTIRELY on the previous layer, not on itself.** The signature shape is `dp[k][i] = min over j < i of dp[k-1][j] + cost(j,i)` — note `dp[k-1][*]` on the right, never `dp[k][*]`. There is no "already-known shorter interval" trick available within a layer, so instead the recursion computes the MIDDLE position\'s best split first and uses monotonicity to bound the two recursive halves\' search ranges.',
      '**When none of the three match, the recurrence may need a different technique entirely (or none) — don\'t force it.** Some recurrences are already O(n) or O(n log n) and need no optimization. Others need a technique outside this chapter\'s three (e.g., convex hull trick / Li Chao tree for a different kind of min-plus convolution, or matrix exponentiation for periodic linear recurrences) — recognizing "this doesn\'t fit any of these three shapes" is itself a valuable, correct answer, not a failure to find the right trick.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 6, Lesson 4: Choosing the Right Optimization (closing lesson)',
        body: '**Previous:** Divide and Conquer Optimization — split-point monotonicity within a single DP layer.\n**This lesson:** a synthesis/practice lesson — reading a new recurrence\'s shape and matching it to the right technique from this chapter.\n**Next:** Chapter 7 — Probability & Game-Theory DP.',
      },
      {
        type: 'insight',
        title: 'The three signature shapes, side by side',
        body: 'Monotonic deque: dp[i] = f(i) + best(dp[window of size k]) — ONE table, sliding window. Knuth\'s: dp[i][j] = min_r dp[i][r-1]+dp[r+1][j]+cost — the SAME 2D table split against itself. D&C: dp[k][i] = min_j dp[k-1][j]+cost(j,i) — a NEW layer built purely from the PREVIOUS layer.',
      },
      {
        type: 'strategy',
        title: 'A recognition checklist to run through',
        body: '1) Is there a bounded window (fixed k) in the inner search? &rarr; monotonic deque. 2) Is the inner search a split point WITHIN one 2D table, both halves from that same table? &rarr; Knuth\'s (verify the quadrangle inequality). 3) Is the inner search a split point where one layer depends only on the previous layer? &rarr; divide and conquer (verify the same monotonicity). 4) None of these? &rarr; the recurrence may already be efficient, or may need a technique beyond this chapter.',
      },
      {
        type: 'warning',
        title: 'Pattern-matching the shape is not a substitute for verifying the precondition',
        body: 'Recognizing "this LOOKS like a Knuth\'s-shaped recurrence" is necessary but not sufficient — the quadrangle inequality (or convexity, for D&C) must actually hold for the specific cost function in front of you. Two recurrences with identical shape can differ in whether the optimization is valid. Always cross-check a new application against a naive/brute-force version on small inputs before trusting the speedup, exactly as done in the previous two lessons.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Matching Four Recurrences to Their Optimization',
        caption: 'Read each recurrence\'s shape, then reveal which technique (if any) applies and why.',
        props: {
          lesson: {
            title: 'Recurrence Shape Recognition',
            subtitle: 'Four examples, worked through the checklist.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Four Recurrences, Classified',
                instruction: 'Click through each recurrence to see which optimization (if any) fits, and why.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}.card{background:#1e293b;border-radius:6px;padding:10px 14px;margin-bottom:8px}.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;margin-bottom:6px}`,
                startCode: `const d = document.getElementById('d');
const cases = [
  {
    recurrence: 'dp[i] = prices[i] + min(dp[i-1], dp[i-2], ..., dp[i-k])',
    tag: 'Monotonic Deque',
    color: '#4ade80',
    why: 'One table (1D), inner search is a min over a FIXED-size trailing window of size k. Classic sliding-window minimum shape.',
  },
  {
    recurrence: 'dp[i][j] = min over r in [i,j] of dp[i][r-1] + dp[r+1][j] + (cost depending only on i,j)',
    tag: "Knuth's Optimization",
    color: '#60a5fa',
    why: 'A single 2D table splitting against itself at strictly shorter intervals — the signature Knuth shape (matches Optimal BST exactly). Must verify the quadrangle inequality before trusting it.',
  },
  {
    recurrence: 'dp[k][i] = min over j<i of dp[k-1][j] + cost(j,i), where cost is convex (e.g., squared group sum)',
    tag: 'Divide and Conquer Optimization',
    color: '#facc15',
    why: 'A layer built entirely from the PREVIOUS layer, with a convex cost function. No shorter-interval structure inside one layer, so D&C recursion over answer positions is the right tool.',
  },
  {
    recurrence: 'dp[i] = dp[i-1] + dp[i-2]  (plain Fibonacci-shaped recurrence)',
    tag: 'No Optimization Needed',
    color: '#94a3b8',
    why: 'Already O(n) with O(1) work per step — there is no search to speed up. Forcing one of the three techniques here would be solving a problem that does not exist.',
  },
];
cases.forEach((c, idx) => {
  d.innerHTML += '<div class="card"><div style="color:#e2e8f0">' + c.recurrence + '</div>' +
    '<div class="tag" style="background:' + c.color + '22;color:' + c.color + ';margin-top:8px">' + c.tag + '</div>' +
    '<div style="color:#94a3b8;margin-top:4px;font-size:12px">' + c.why + '</div></div>';
});`,
                outputHeight: 480,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Practice: Classify and Solve',
        caption: 'Given a recurrence, pick the right technique and implement it.',
        props: {
          lesson: {
            title: 'Classification Practice',
            subtitle: 'Apply the checklist to a new problem end to end.',
            cells: [
              {
                type: 'js',
                instruction: `## Practice — Constrained Subsequence Sum

Given \`nums\` and integer \`k\`, find the maximum sum of a non-empty subsequence such that for every two consecutive chosen indices \`i < j\`, \`j - i <= k\`.

Recurrence: \`dp[i] = nums[i] + max(0, dp[i-k..i-1])\`.

**Classify it first:** one table, inner search is a max over a bounded trailing window of size k &rarr; monotonic deque shape (same as Lesson 1). Implement it with a deque.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function constrainedSubsetSum(nums, k) {
  const n = nums.length;
  const dp = new Array(n).fill(0);
  const deque = []; // stores indices, dp-values decreasing front-to-back

  let ans = -Infinity;
  for (let i = 0; i < n; i++) {
    // TODO: pop front while deque[0] < i - k (out of window)
    // TODO: best = deque.length ? Math.max(0, dp[deque[0]]) : 0
    // TODO: dp[i] = nums[i] + best
    // TODO: update ans = Math.max(ans, dp[i])
    // TODO: pop back while dp[back] <= dp[i], then push i
  }
  return ans;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('example 1', constrainedSubsetSum([10,2,-10,5,20], 2), 37);
test('example 2', constrainedSubsetSum([-1,-2,-3], 1), -1);
test('example 3', constrainedSubsetSum([10,-2,-10,-5,20], 2), 23);`,
                solutionCode: `function constrainedSubsetSum(nums, k) {
  const n = nums.length;
  const dp = new Array(n).fill(0);
  const deque = []; // stores indices, dp-values decreasing front-to-back

  let ans = -Infinity;
  for (let i = 0; i < n; i++) {
    while (deque.length && deque[0] < i - k) deque.shift();
    const best = deque.length ? Math.max(0, dp[deque[0]]) : 0;
    dp[i] = nums[i] + best;
    ans = Math.max(ans, dp[i]);
    while (deque.length && dp[deque[deque.length - 1]] <= dp[i]) deque.pop();
    deque.push(i);
  }
  return ans;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('example 1', constrainedSubsetSum([10,2,-10,5,20], 2), 37);
test('example 2', constrainedSubsetSum([-1,-2,-3], 1), -1);
test('example 3', constrainedSubsetSum([10,-2,-10,-5,20], 2), 23);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Classification Drill in Python',
        caption: 'Verify the mixed practice problem, then a from-scratch classification-and-solve challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Constrained Subsequence Sum — Verify the Monotonic Deque Solution',
              code: `from collections import deque


def constrained_subset_sum(nums, k):
    n = len(nums)
    dp = [0] * n
    dq = deque()  # indices, dp-values decreasing front-to-back
    ans = float("-inf")
    for i in range(n):
        while dq and dq[0] < i - k:
            dq.popleft()
        best = max(0, dp[dq[0]]) if dq else 0
        dp[i] = nums[i] + best
        ans = max(ans, dp[i])
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return ans


tests = [
    ([10, 2, -10, 5, 20], 2, 37),
    ([-1, -2, -3], 1, -1),
    ([10, -2, -10, -5, 20], 2, 23),
]
for nums, k, expected in tests:
    result = constrained_subset_sum(nums, k)
    print(f"nums={nums} k={k}: got={result}, expected={expected}")
    assert result == expected

print("All assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Side-by-Side: All Three Techniques on Their Signature Problems',
              code: `import matplotlib.pyplot as plt
import time
import random


def naive_sliding_max_dp(nums, k):
    n = len(nums)
    dp = [0] * n
    for i in range(n):
        window = [max(0, dp[j]) for j in range(max(0, i - k), i)]
        dp[i] = nums[i] + (max(window) if window else 0)
    return max(dp)


def deque_sliding_max_dp(nums, k):
    from collections import deque
    n = len(nums)
    dp = [0] * n
    dq = deque()
    for i in range(n):
        while dq and dq[0] < i - k:
            dq.popleft()
        best = max(0, dp[dq[0]]) if dq else 0
        dp[i] = nums[i] + best
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return max(dp)


random.seed(3)
sizes = [200, 400, 800, 1600]
naive_times, deque_times = [], []
for n in sizes:
    nums = [random.randint(-50, 50) for _ in range(n)]
    k = 30

    t0 = time.perf_counter()
    naive_sliding_max_dp(nums, k)
    naive_times.append(time.perf_counter() - t0)

    t0 = time.perf_counter()
    deque_sliding_max_dp(nums, k)
    deque_times.append(time.perf_counter() - t0)

fig, ax = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
ax.plot(sizes, naive_times, "o-", color="#f87171", label="Naive O(n*k)")
ax.plot(sizes, deque_times, "o-", color="#4ade80", label="Monotonic deque O(n)")
ax.set_xlabel("n", color="#94a3b8")
ax.set_ylabel("Time (s)", color="#94a3b8")
ax.set_title("Recognizing the sliding-window shape pays off as n grows", color="#e2e8f0", fontsize=11)
ax.tick_params(colors="#94a3b8")
ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()
print("naive_times:", [f"{t:.4f}" for t in naive_times])
print("deque_times:", [f"{t:.4f}" for t in deque_times])`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Classify and implement: paint-house-style layered partition',
              difficulty: 'hard',
              prompt: 'This recurrence partitions n items into k contiguous groups minimizing sum of squared group sums — dp[k][i] = min over j<i of dp[k-1][j] + (prefix[i]-prefix[j])**2. Classify it (it is the divide-and-conquer-optimization shape from Lesson 3) and fill in solve() accordingly. Uncomment the assertion once ready.',
              hint: 'This is a layer-depends-only-on-previous-layer recurrence with a convex (squared) cost — the D&C optimization shape, not the monotonic-deque or Knuth shape. Reuse the solve(lo, hi, optLo, optHi) pattern from Lesson 3.',
              label: 'From Scratch — Classify Then Solve',
              code: `def min_cost_partition_scratch(nums, k):
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
            # YOUR CODE HERE (this is the D&C-optimization shape from Lesson 3):
            # search j in range(opt_lo, min(mid, opt_hi)+1) for the best split
            # dp_cur[mid] = best_cost
            # solve(lo, mid-1, opt_lo, best_j)
            # solve(mid+1, hi, best_j, opt_hi)
            pass

        solve(1, n, 0, n - 1)
        dp_prev = dp_cur

    return dp_prev[n]


nums = [4, 8, 2, 5, 1, 9, 3, 7]

# --- Uncomment to test when ready ---
# result = min_cost_partition_scratch(nums, 2)
# print(f"min_cost_partition_scratch(nums, 2) = {result}")
# assert result == 761, f"got {result}"
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
      text: 'A recurrence has the shape dp[i] = f(i) + best(dp over a fixed-size trailing window of k previous entries). Which optimization fits?',
      options: [
        "Knuth's optimization, since any windowed search is really a disguised interval split",
        'Monotonic deque optimization — a single 1D table with a bounded sliding window is exactly its signature shape',
        'Divide and conquer optimization, since the window could be treated as a mini-layer',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A recurrence has the shape dp[i][j] = min over r in [i,j] of dp[i][r-1] + dp[r+1][j] + cost(i,j), where both halves come from the SAME 2D table at shorter intervals. What should you check before applying an optimization here?',
      options: [
        'Nothing — this shape always speeds up automatically once you track opt[i][j]; no precondition needs verifying',
        'This matches the Knuth\'s-optimization shape (self-referential 2D interval table), but you must still verify the cost function satisfies the quadrangle inequality before trusting the search-range restriction — matching the shape is necessary but not sufficient',
        'This is actually the monotonic deque shape, since dp[i][r-1] looks like a windowed lookup',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A recurrence has the shape dp[k][i] = min over j<i of dp[k-1][j] + cost(j,i), where the right side only ever references layer k-1, never layer k itself. Which technique fits, and why not Knuth\'s?',
      options: [
        "Knuth's optimization, since it also involves a split point j",
        'Divide and conquer optimization — because the layer depends purely on the PREVIOUS layer with no shorter-interval structure within layer k itself, the recursion must compute the middle answer first and bound the two halves, rather than looking up already-known shorter-interval optima the way Knuth\'s does',
        'Neither — layered recurrences can never be optimized past their naive complexity',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A recurrence is simply dp[i] = dp[i-1] * 2 + 1. What is the correct response?',
      options: [
        'Apply monotonic deque optimization anyway, since it never hurts to try',
        'Recognize that this recurrence is already O(1) work per step (O(n) total) with no search to speed up — recognizing "no optimization needed" is a correct, valuable answer, not a failure to find a trick',
        'Apply divide and conquer optimization, since any recurrence with an index can be split in half',
      ],
      correct: 1,
    },
  ],
};
