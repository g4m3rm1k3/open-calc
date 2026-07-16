export default {
  id: 'dp6-001',
  slug: 'monotonic-deque-optimization',
  chapter: 'dp6',
  order: 1,
  title: 'Monotonic Deque Optimization: Sliding-Window Max Inside a DP',
  subtitle: 'Turning an O(n × k) recurrence into O(n)',
  tags: ['dynamic programming', 'dp optimization', 'monotonic deque', 'sliding window maximum'],
  aliases: 'monotonic deque dp optimization sliding window maximum jump game',

  hook: {
    question: 'You can jump from index i to any index in [i+1, i+k]. Landing on index i adds nums[i] to your score (which can be negative). Starting at index 0, what is the maximum score reachable at the last index? The direct recurrence, dp[i] = nums[i] + max(dp[i-k..i-1]), is correct but costs O(k) per index — O(n×k) total. Every one of those per-index max-over-a-window computations is doing repeated, overlapping work — exactly the kind of redundancy a sliding-window technique eliminates.',
    realWorldContext: 'This "DP recurrence needs a sliding-window max/min" pattern shows up whenever a decision at position i is influenced by the best outcome within a bounded recent history — resource allocation with a limited lookback window, stock trading strategies with a cooldown, and real-time signal processing (bounded-memory smoothing filters). The monotonic deque itself (maintaining a strictly decreasing — or increasing — sequence of candidates) is one of the most reused data-structure tricks in competitive programming, independent of DP specifically.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The recurrence, and why it is expensive as written.** `dp[i] = nums[i] + max(dp[j] for j in [i-k, i-1])`. Computed naively, each `dp[i]` scans up to `k` previous values — O(n×k) total. For large `k` (up to n), this degrades to O(n²).',
      '**The insight: the window slides by exactly one position each step.** Going from computing `dp[i]`\'s window `[i-k, i-1]` to `dp[i+1]`\'s window `[i-k+1, i]`, only two things change: one new index (`i`) enters the window on the right, and possibly one old index (`i-k`) falls out on the left. A data structure that can efficiently answer "what is the max in the current window" while supporting exactly these two operations (add on the right, possibly remove from the left) turns each step into O(1) amortized work.',
      '**The monotonic deque, mechanically.** Maintain a deque (double-ended queue) of INDICES, with the invariant that their `dp` VALUES are in strictly decreasing order from front to back. To add a new index `i`: while the back of the deque has a `dp` value ≤ `dp[i]`, pop it (it can never be the answer again — `i` is both more recent AND at least as good, so the old entry is strictly dominated). Then push `i`. To query the max: the front of the deque always holds the index with the largest `dp` value currently in range. To slide the window: before querying, pop any front index that has fallen out of range (`front < i - k`).',
      '**Why each element is added and removed at most once — the amortized O(1) argument.** Every index is pushed onto the deque exactly once (when its `dp` value is computed) and popped at most once (either because a later, better value displaced it, or because it fell out of the window). Across the entire algorithm, the TOTAL number of push and pop operations is O(n), even though any single step could theoretically pop several old entries at once. This is amortized analysis: not every step costs O(1), but the AVERAGE cost per step, across the whole run, is O(1).',
      '**Recognizing the pattern for a NEW problem.** Whenever a DP recurrence has the shape `dp[i] = f(nums[i]) + max/min(dp[j] for j in a sliding window of j)`, suspect monotonic deque optimization. The two requirements: (1) the window\'s bounds must be monotonically non-decreasing as `i` increases (so old entries can be safely discarded, never revisited), and (2) you need max or min specifically (not, say, the sum or the count of the window, which need different structures — a running sum or a Fenwick tree, respectively).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 6, Lesson 1: Monotonic Deque Optimization',
        body: '**Previous (Chapter 5):** Advanced String DP — wildcard matching, word break, distinct subsequences, scramble string.\n**This lesson:** Monotonic Deque Optimization — sliding-window max/min inside a DP recurrence.\n**Next:** Knuth\'s Optimization — speeding up a class of interval DP problems from O(n³) to O(n²).',
      },
      {
        type: 'insight',
        title: 'The monotonic deque invariant, stated precisely',
        body: 'Indices in the deque, front to back, have STRICTLY DECREASING dp-values, and are also in increasing index order. The front is always both the earliest-added AND the current window\'s maximum — either property alone would not guarantee correctness, but the invariant guarantees both simultaneously.',
      },
      {
        type: 'strategy',
        title: 'Two cleanup steps, every iteration',
        body: '**Before querying the max:** pop expired indices from the FRONT (fallen outside the window).\n**After computing the new dp[i]:** pop dominated indices from the BACK (any index whose dp-value is ≤ the new one), then push i.\nOrder matters: query the (already-valid) front before pushing the new value, since the new value has not "aged into" the window yet at the moment it is computed.',
      },
      {
        type: 'warning',
        title: 'Sum or count over a window needs a different structure',
        body: 'A monotonic deque answers max/min queries efficiently because dominated values can be safely discarded. A SUM over a sliding window cannot discard old values this way (every value still contributes to the total) — that needs a running sum with subtraction, or a Fenwick tree/segment tree for more complex range aggregations. Do not reach for a monotonic deque when the aggregation is not max or min.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Monotonic Deque: Watch the Window Slide',
        caption: 'Indices enter from the right, dominated entries get evicted from the back, expired entries fall off the front.',
        props: {
          lesson: {
            title: 'Monotonic Deque Optimization Step by Step',
            subtitle: 'From O(n×k) to O(n).',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Naive O(n×k): Scanning the Whole Window Every Time',
                instruction: 'For nums=[1,-1,-2,4,-7,3], k=2, watch each dp[i] scan its entire window.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const nums = [1,-1,-2,4,-7,3];
const k = 2;
const n = nums.length;
const dp = new Array(n).fill(-Infinity);
dp[0] = nums[0];
const log = [];
let totalScans = 0;

for (let i = 1; i < n; i++) {
  let best = -Infinity;
  for (let j = Math.max(0, i - k); j < i; j++) {
    best = Math.max(best, dp[j]);
    totalScans++;
  }
  dp[i] = nums[i] + best;
  log.push({ i, windowStart: Math.max(0, i-k), best, dpi: dp[i] });
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">Each dp[i] scans its whole window:</div>';
log.forEach(e => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">dp[' + e.i + '] = nums[' + e.i + '] + max(dp[' + e.windowStart + '..' + (e.i-1) + ']=' + e.best + ') = <b style="color:#4ade80">' + e.dpi + '</b></div>';
});
html += '<div style="margin-top:10px;background:#450a0a;border-radius:6px;padding:8px 12px;color:#f87171">Total window-scan operations: ' + totalScans + ' (for n=' + n + ', k=' + k + ')</div>';
d.innerHTML = html;`,
                outputHeight: 320,
              },
              {
                type: 'js',
                title: 'Monotonic Deque: The Same Answer, O(1) Amortized per Step',
                instruction: 'Watch the deque maintain a decreasing sequence of candidates, with far fewer total operations.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const nums = [1,-1,-2,4,-7,3];
const k = 2;
const n = nums.length;
const dp = new Array(n).fill(0);
dp[0] = nums[0];
const dq = [0]; // indices, dp-values strictly decreasing
const log = [];
let totalOps = 0;

for (let i = 1; i < n; i++) {
  while (dq.length && dq[0] < i - k) { dq.shift(); totalOps++; }
  const best = dp[dq[0]];
  dp[i] = nums[i] + best;
  while (dq.length && dp[dq[dq.length - 1]] <= dp[i]) { dq.pop(); totalOps++; }
  dq.push(i);
  totalOps++;
  log.push({ i, best, dpi: dp[i], deque: [...dq] });
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">Deque contents after each step:</div>';
log.forEach(e => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">dp[' + e.i + '] = nums[' + e.i + '] + ' + e.best + ' = <b style="color:#4ade80">' + e.dpi + '</b> &nbsp; deque=[' + e.deque.join(',') + ']</div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Total deque operations: ' + totalOps + ' — compare to the naive scan count above.</div>';
d.innerHTML = html;`,
                outputHeight: 340,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Monotonic Deque Optimization from Scratch',
        caption: 'The naive version, then the optimized deque version.',
        props: {
          lesson: {
            title: 'Monotonic Deque Optimization in JavaScript',
            subtitle: 'Sliding-window max, maintained incrementally.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Naive O(n×k) Version

Implement \`maxResultNaive(nums, k)\`, scanning the full window for each i. This will be your correctness baseline.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function maxResultNaive(nums, k) {
  const n = nums.length;
  const dp = new Array(n).fill(-Infinity);
  dp[0] = nums[0];
  for (let i = 1; i < n; i++) {
    let best = -Infinity;
    for (let j = Math.max(0, i - k); j < i; j++) {
      // TODO: best = Math.max(best, dp[j])
    }
    dp[i] = nums[i] + best;
  }
  return dp[n - 1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Example 1', maxResultNaive([1,-1,-2,4,-7,3], 2), 7);
test('Example 2', maxResultNaive([10,-5,-2,4,0,3], 3), 17);
test('Example 3', maxResultNaive([1,-5,-20,4,-1,3,-6,-3], 2), 0);`,
                solutionCode: `function maxResultNaive(nums, k) {
  const n = nums.length;
  const dp = new Array(n).fill(-Infinity);
  dp[0] = nums[0];
  for (let i = 1; i < n; i++) {
    let best = -Infinity;
    for (let j = Math.max(0, i - k); j < i; j++) {
      best = Math.max(best, dp[j]);
    }
    dp[i] = nums[i] + best;
  }
  return dp[n - 1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Example 1', maxResultNaive([1,-1,-2,4,-7,3], 2), 7);
test('Example 2', maxResultNaive([10,-5,-2,4,0,3], 3), 17);
test('Example 3', maxResultNaive([1,-5,-20,4,-1,3,-6,-3], 2), 0);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Monotonic Deque Version

Implement \`maxResultDeque(nums, k)\`. Maintain a deque of indices with strictly decreasing dp-values.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function maxResultDeque(nums, k) {
  const n = nums.length;
  const dp = new Array(n).fill(0);
  dp[0] = nums[0];
  const dq = [0];

  for (let i = 1; i < n; i++) {
    // TODO: while (dq.length && dq[0] < i - k) dq.shift();  // evict expired front
    const best = dp[dq[0]];
    dp[i] = nums[i] + best;
    // TODO: while (dq.length && dp[dq[dq.length-1]] <= dp[i]) dq.pop();  // evict dominated back
    // TODO: dq.push(i)
  }
  return dp[n - 1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Example 1', maxResultDeque([1,-1,-2,4,-7,3], 2), 7);
test('Example 2', maxResultDeque([10,-5,-2,4,0,3], 3), 17);
test('Example 3', maxResultDeque([1,-5,-20,4,-1,3,-6,-3], 2), 0);`,
                solutionCode: `function maxResultDeque(nums, k) {
  const n = nums.length;
  const dp = new Array(n).fill(0);
  dp[0] = nums[0];
  const dq = [0];

  for (let i = 1; i < n; i++) {
    while (dq.length && dq[0] < i - k) dq.shift();
    const best = dp[dq[0]];
    dp[i] = nums[i] + best;
    while (dq.length && dp[dq[dq.length - 1]] <= dp[i]) dq.pop();
    dq.push(i);
  }
  return dp[n - 1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Example 1', maxResultDeque([1,-1,-2,4,-7,3], 2), 7);
test('Example 2', maxResultDeque([10,-5,-2,4,0,3], 3), 17);
test('Example 3', maxResultDeque([1,-5,-20,4,-1,3,-6,-3], 2), 0);`,
                outputHeight: 180,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Monotonic Deque Optimization in Python',
        caption: 'Build both versions, visualize the operation-count savings, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Both Versions — Build and Verify',
              code: `from collections import deque


def max_result_naive(nums, k):
    n = len(nums)
    dp = [float("-inf")] * n
    dp[0] = nums[0]
    for i in range(1, n):
        best = max(dp[j] for j in range(max(0, i - k), i))
        dp[i] = nums[i] + best
    return dp[n - 1]


def max_result_deque(nums, k):
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    dq = deque([0])
    for i in range(1, n):
        while dq and dq[0] < i - k:
            dq.popleft()
        dp[i] = nums[i] + dp[dq[0]]
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return dp[n - 1]


tests = [([1, -1, -2, 4, -7, 3], 2, 7), ([10, -5, -2, 4, 0, 3], 3, 17)]
for nums, k, expected in tests:
    naive = max_result_naive(nums, k)
    fast = max_result_deque(nums, k)
    print(f"nums={nums} k={k}: naive={naive}, deque={fast}, expected={expected}")
    assert naive == fast == expected

print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Operation Count vs. Naive',
              code: `import matplotlib.pyplot as plt
from collections import deque


def max_result_naive_counted(nums, k):
    n = len(nums)
    dp = [float("-inf")] * n
    dp[0] = nums[0]
    ops = 0
    for i in range(1, n):
        best = float("-inf")
        for j in range(max(0, i - k), i):
            best = max(best, dp[j])
            ops += 1
        dp[i] = nums[i] + best
    return dp[n - 1], ops


def max_result_deque_counted(nums, k):
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    dq = deque([0])
    ops = 0
    for i in range(1, n):
        while dq and dq[0] < i - k:
            dq.popleft()
            ops += 1
        dp[i] = nums[i] + dp[dq[0]]
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
            ops += 1
        dq.append(i)
        ops += 1
    return dp[n - 1], ops


import random
random.seed(7)
sizes = [10, 20, 40, 80, 160]
naive_ops = []
deque_ops = []
for size in sizes:
    nums = [random.randint(-10, 10) for _ in range(size)]
    k = size // 4
    _, no = max_result_naive_counted(nums, k)
    _, do = max_result_deque_counted(nums, k)
    naive_ops.append(no)
    deque_ops.append(do)

fig, ax = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
ax.plot(sizes, naive_ops, "o-", color="#f87171", label="Naive O(n×k)")
ax.plot(sizes, deque_ops, "o-", color="#4ade80", label="Monotonic deque O(n)")
ax.set_xlabel("n (array size, k = n/4)", color="#94a3b8")
ax.set_ylabel("Operations performed", color="#94a3b8")
ax.set_title("Monotonic deque scales linearly; naive scales with n×k", color="#e2e8f0")
ax.tick_params(colors="#94a3b8")
ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Monotonic deque optimization, from scratch',
              difficulty: 'hard',
              prompt: 'Fill in max_result_scratch(nums, k): maintain a deque of indices with strictly decreasing dp-values, evicting expired front entries and dominated back entries. Uncomment the assertions once ready.',
              hint: 'Front eviction: while dq and dq[0] < i - k: dq.popleft(). Back eviction: while dq and dp[dq[-1]] <= dp[i]: dq.pop(), then dq.append(i).',
              label: 'From Scratch — Monotonic Deque',
              code: `from collections import deque


def max_result_scratch(nums, k):
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    dq = deque([0])

    for i in range(1, n):
        # YOUR CODE HERE: evict expired indices from the front (dq[0] < i - k)
        dp[i] = nums[i] + dp[dq[0]]
        # YOUR CODE HERE: evict dominated indices from the back, then append i
        pass

    return dp[n - 1]


# --- Uncomment to test when ready ---
# assert max_result_scratch([1, -5, -20, 4, -1, 3, -6, -3], 2) == 0
# assert max_result_scratch([100, -1, -100, -100, 100], 2) == 100
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
      text: 'Why can a monotonic deque safely discard an old index when a new, better dp-value arrives at the back?',
      options: [
        'It cannot safely be discarded — this would be a bug that only happens to work on small examples',
        'The old index is strictly dominated: the new index is both more recent (will remain valid in the window for at least as long, if not longer) and has an equal-or-better dp-value, so the old index can never again be the answer to any future window-max query',
        'Old indices are only discarded once they physically leave the array bounds',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What does "amortized O(1) per step" mean for the monotonic deque, given that some individual steps pop multiple entries?',
      options: [
        'Every single step literally takes the same constant time with no variation',
        'While any individual step COULD pop several entries at once, each index is pushed exactly once and popped at most once across the ENTIRE algorithm — so the total number of push/pop operations across all n steps is O(n), making the AVERAGE cost per step O(1), even though costs vary step to step',
        'Amortized O(1) means the algorithm is only correct on average, not on every input',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What are the two requirements for a DP recurrence to be a candidate for monotonic deque optimization?',
      options: [
        'The recurrence must involve exactly two previous states, and the array must be sorted',
        'The window of previous states being aggregated must have monotonically non-decreasing bounds as i increases (so old entries can be safely discarded), and the aggregation must specifically be a MAX or MIN (not a sum or other aggregate that cannot discard dominated values)',
        'The recurrence must be over a bitmask state, and n must be less than 20',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does a monotonic deque NOT help optimize a recurrence like dp[i] = nums[i] + SUM(dp[j] for j in a sliding window)?',
      options: [
        'It actually does help, in exactly the same way as for max/min',
        'A sum cannot discard old values the way max/min can — every value in the window genuinely still contributes to the total, so there is no way to declare an old entry "dominated" and safely drop it; a running sum (adding the new entry, subtracting the expired one) or a different structure entirely is needed instead',
        'Sums are always O(1) to compute already, so no optimization is ever needed',
      ],
      correct: 1,
    },
  ],
};
