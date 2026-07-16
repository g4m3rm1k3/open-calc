export default {
  id: 'dp6-002',
  slug: 'knuths-optimization',
  chapter: 'dp6',
  order: 2,
  title: "Knuth's Optimization: O(n³) Interval DP Down to O(n²)",
  subtitle: 'Bounding the search for the optimal split point using monotonicity',
  tags: ['dynamic programming', 'dp optimization', 'knuths optimization', 'interval dp', 'optimal bst'],
  aliases: 'knuths optimization interval dp speedup optimal split point',

  hook: {
    question: 'Chapter 1\'s Optimal Binary Search Tree ran in O(n³) — for each of the O(n²) intervals [i,j], trying every one of O(n) possible split points r. For n=1000 keys, that is roughly a billion operations. Yet the optimal split point does not jump around randomly as the interval grows — it tends to shift smoothly. Knuth\'s optimization turns that empirical observation into a hard mathematical guarantee, letting each interval search a MUCH smaller range of candidate split points, without ever missing the true optimum.',
    realWorldContext: 'Knuth\'s optimization (sometimes called the "quadrangle inequality" optimization) applies to a well-defined class of interval DP problems — optimal BST construction, some text-justification variants, and certain matrix-chain-like scheduling problems — and is a standard tool in competitive programming for pushing an O(n³) interval DP down to O(n²), the difference between "too slow" and "fast enough" at real input sizes.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**The empirical observation, made precise.** Define `opt[i][j]` as the optimal split point `r` for interval `[i,j]` (the value of `r` that achieves `dp[i][j]`\'s minimum). Knuth\'s theorem states: if the cost function satisfies certain conditions (the "quadrangle inequality" — a technical monotonicity condition on the cost function that holds for Optimal BST and several related problems), then `opt[i][j-1] <= opt[i][j] <= opt[i+1][j]` — the optimal split for a slightly smaller interval is always a LOWER BOUND for the optimal split of the interval one step wider (extending on the right), and the optimal split for the interval one step wider (extending on the left) is always an UPPER BOUND.',
      '**Turning the bound into a search-space restriction.** Instead of trying every `r` in `[i, j]` when computing `dp[i][j]` (an O(n) search), only try `r` in `[opt[i][j-1], opt[i+1][j]]` — a MUCH smaller range once `opt[i][j-1]` and `opt[i+1][j]` are both already known (they were computed for shorter intervals, processed earlier in the standard "increasing interval length" fill order). Record whichever `r` in that restricted range achieves the best cost as `opt[i][j]`, to be used by even wider intervals later.',
      '**Why the total work becomes O(n²), not O(n³).** This requires a genuinely clever amortized argument: although any SINGLE interval\'s restricted search range could still be as large as O(n) in the worst case, summing the WIDTH of `opt[i+1][j] - opt[i][j-1]` across every interval of a given length turns out to telescope — the total work across all intervals of a fixed length is bounded by O(n), not O(n²), giving O(n) work per length times O(n) lengths, for O(n²) total. This is a genuinely non-obvious result — it is worth verifying computationally (as the Python cell does) rather than trying to re-derive the telescoping sum from scratch every time.',
      '**Applicability is not automatic — the quadrangle inequality must actually hold.** Knuth\'s optimization is not a mechanical trick to try on any interval DP; the cost function must satisfy the quadrangle inequality (roughly: `cost(a,c) + cost(b,d) <= cost(a,d) + cost(b,c)` for `a <= b <= c <= d`) for the monotonicity of `opt` to be guaranteed. Optimal BST\'s cost function (a range-sum of probabilities) satisfies this. Applying the search-range restriction to a cost function that does NOT satisfy it can silently produce a WRONG answer, not just a slow one — always verify against the unoptimized version on small cases before trusting the optimization on a new problem.',
      '**Where this sits among the optimizations.** Monotonic deque optimization (Lesson 1) speeds up a 1D recurrence with a sliding-window max/min. Knuth\'s optimization speeds up a 2D interval DP by bounding the search for the best split point using a proven monotonicity property of that specific split point across neighboring intervals. Both replace "search everything" with "search a provably-sufficient smaller range" — the recurring theme of every DP optimization technique.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: "Chapter 6, Lesson 2: Knuth's Optimization",
        body: '**Previous:** Monotonic Deque Optimization — sliding-window max/min inside a 1D DP.\n**This lesson:** Knuth\'s Optimization — bounding the interval-DP split-point search using monotonicity.\n**Next:** Divide and Conquer Optimization — a related but distinct technique for a different class of recurrences.',
      },
      {
        type: 'insight',
        title: "Knuth's monotonicity bound, stated as a formula",
        body: 'opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j]. Read it as: shrinking the interval from the right can only move the optimal split point left or keep it the same; shrinking from the left can only move it right or keep it the same. This gives a provably correct, provably smaller search window for every interval.',
      },
      {
        type: 'strategy',
        title: 'The fill order matters — same as any interval DP',
        body: 'Process intervals by increasing LENGTH (same discipline as Chapter 3\'s interval DP), because opt[i][j-1] and opt[i+1][j] must already be computed (they belong to strictly shorter intervals) before opt[i][j] can look them up.',
      },
      {
        type: 'warning',
        title: 'Verify the quadrangle inequality before trusting the speedup',
        body: 'This optimization is a mathematical theorem with real preconditions, not a general-purpose trick. Applying the restricted search range to a cost function that does not satisfy the quadrangle inequality can silently skip the TRUE optimal split point, producing a wrong (not just differently-computed) answer. When in doubt, cross-check the optimized version against the brute-force O(n³) version on small random inputs — exactly the verification done in this lesson\'s own Python cell.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: "Knuth's Optimization: Watching opt[i][j] Stay Bounded",
        caption: 'Watch the optimal split point for each interval fall within the range predicted by shorter intervals.',
        props: {
          lesson: {
            title: "Knuth's Optimization Step by Step",
            subtitle: 'Bounding the search using neighboring intervals\' known optima.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The opt[][] Table: Monotonicity in Action',
                instruction: 'For the Optimal BST example, watch opt[i][j] always fall between opt[i][j-1] and opt[i+1][j].',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const probs = [0.15, 0.10, 0.05, 0.10, 0.20, 0.25, 0.15];
const n = probs.length;
const prefix = new Array(n + 1).fill(0);
for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + probs[i];
const rangeSum = (i, j) => prefix[j+1] - prefix[i];

const dp = Array.from({length: n}, () => new Array(n).fill(0));
const opt = Array.from({length: n}, () => new Array(n).fill(0));
for (let i = 0; i < n; i++) { dp[i][i] = probs[i]; opt[i][i] = i; }

const log = [];
for (let length = 2; length <= n; length++) {
  for (let i = 0; i + length - 1 < n; i++) {
    const j = i + length - 1;
    const s = rangeSum(i, j);
    const lo = opt[i][j-1] !== undefined && j-1 >= i ? opt[i][j-1] : i;
    const hi = (i+1 <= j && opt[i+1][j] !== undefined) ? opt[i+1][j] : j;
    let bestCost = Infinity, bestR = lo;
    for (let r = lo; r <= hi; r++) {
      const left = r > i ? dp[i][r-1] : 0;
      const right = r < j ? dp[r+1][j] : 0;
      const cost = left + right + s;
      if (cost < bestCost) { bestCost = cost; bestR = r; }
    }
    dp[i][j] = bestCost;
    opt[i][j] = bestR;
    log.push({ i, j, lo, hi, searched: hi - lo + 1, chosen: bestR });
  }
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">Search range for each interval (restricted by neighbors\\' optima):</div>';
log.forEach(e => {
  html += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px;font-size:12px">[' + e.i + ',' + e.j + ']: searched r in [' + e.lo + ',' + e.hi + '] (' + e.searched + ' candidates) &rarr; chose r=<b style="color:#4ade80">' + e.chosen + '</b></div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Final answer: ' + dp[0][n-1].toFixed(4) + '</div>';
d.innerHTML = html;`,
                outputHeight: 400,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: "Build Knuth's Optimization from Scratch",
        caption: 'The naive O(n³) version, then the O(n²) optimized version.',
        props: {
          lesson: {
            title: "Knuth's Optimization in JavaScript",
            subtitle: 'Restricting the split-point search using neighboring optima.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Naive O(n³) Optimal BST (Recap)

Implement \`optimalBstNaive(probs)\` exactly as in Chapter 1: try every split r in [i, j] for every interval.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function optimalBstNaive(probs) {
  const n = probs.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + probs[i];
  const rangeSum = (i, j) => prefix[j+1] - prefix[i];

  const dp = Array.from({length: n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) dp[i][i] = probs[i];

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      let best = Infinity;
      const s = rangeSum(i, j);
      for (let r = i; r <= j; r++) {
        // TODO: left = r > i ? dp[i][r-1] : 0
        // TODO: right = r < j ? dp[r+1][j] : 0
        // TODO: best = Math.min(best, left + right + s)
      }
      dp[i][j] = best;
    }
  }
  return dp[0][n-1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('7-key example', optimalBstNaive([0.15,0.10,0.05,0.10,0.20,0.25,0.15]), 2.3);
test('single key', optimalBstNaive([1.0]), 1.0);`,
                solutionCode: `function optimalBstNaive(probs) {
  const n = probs.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + probs[i];
  const rangeSum = (i, j) => prefix[j+1] - prefix[i];

  const dp = Array.from({length: n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) dp[i][i] = probs[i];

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      let best = Infinity;
      const s = rangeSum(i, j);
      for (let r = i; r <= j; r++) {
        const left = r > i ? dp[i][r-1] : 0;
        const right = r < j ? dp[r+1][j] : 0;
        best = Math.min(best, left + right + s);
      }
      dp[i][j] = best;
    }
  }
  return dp[0][n-1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('7-key example', optimalBstNaive([0.15,0.10,0.05,0.10,0.20,0.25,0.15]), 2.3);
test('single key', optimalBstNaive([1.0]), 1.0);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Knuth-Optimized O(n²) Version

Implement \`optimalBstKnuth(probs)\`, tracking \`opt[i][j]\` and restricting each interval's search to [opt[i][j-1], opt[i+1][j]].`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function optimalBstKnuth(probs) {
  const n = probs.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + probs[i];
  const rangeSum = (i, j) => prefix[j+1] - prefix[i];

  const dp = Array.from({length: n}, () => new Array(n).fill(0));
  const opt = Array.from({length: n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) { dp[i][i] = probs[i]; opt[i][i] = i; }

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      const s = rangeSum(i, j);
      const lo = (j - 1 >= i) ? opt[i][j-1] : i;
      const hi = (i + 1 <= j) ? opt[i+1][j] : j;
      let best = Infinity, bestR = lo;
      for (let r = lo; r <= hi; r++) {
        // TODO: left = r > i ? dp[i][r-1] : 0
        // TODO: right = r < j ? dp[r+1][j] : 0
        // TODO: cost = left + right + s; update best and bestR if cost improves
      }
      dp[i][j] = best;
      opt[i][j] = bestR;
    }
  }
  return dp[0][n-1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('7-key example', optimalBstKnuth([0.15,0.10,0.05,0.10,0.20,0.25,0.15]), 2.3);
test('single key', optimalBstKnuth([1.0]), 1.0);`,
                solutionCode: `function optimalBstKnuth(probs) {
  const n = probs.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i+1] = prefix[i] + probs[i];
  const rangeSum = (i, j) => prefix[j+1] - prefix[i];

  const dp = Array.from({length: n}, () => new Array(n).fill(0));
  const opt = Array.from({length: n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) { dp[i][i] = probs[i]; opt[i][i] = i; }

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      const s = rangeSum(i, j);
      const lo = (j - 1 >= i) ? opt[i][j-1] : i;
      const hi = (i + 1 <= j) ? opt[i+1][j] : j;
      let best = Infinity, bestR = lo;
      for (let r = lo; r <= hi; r++) {
        const left = r > i ? dp[i][r-1] : 0;
        const right = r < j ? dp[r+1][j] : 0;
        const cost = left + right + s;
        if (cost < best) { best = cost; bestR = r; }
      }
      dp[i][j] = best;
      opt[i][j] = bestR;
    }
  }
  return dp[0][n-1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('7-key example', optimalBstKnuth([0.15,0.10,0.05,0.10,0.20,0.25,0.15]), 2.3);
test('single key', optimalBstKnuth([1.0]), 1.0);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: "Knuth's Optimization in Python",
        caption: 'Verify against random inputs, visualize the search-range savings, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Naive vs Knuth-Optimized — Verify on Random Inputs',
              code: `import random


def optimal_bst_naive(probs):
    n = len(probs)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + probs[i]
    def range_sum(i, j):
        return prefix[j + 1] - prefix[i]
    dp = [[0.0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = probs[i]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            s = range_sum(i, j)
            dp[i][j] = min(
                (dp[i][r - 1] if r > i else 0) + (dp[r + 1][j] if r < j else 0) + s
                for r in range(i, j + 1)
            )
    return dp[0][n - 1]


def optimal_bst_knuth(probs):
    n = len(probs)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + probs[i]
    def range_sum(i, j):
        return prefix[j + 1] - prefix[i]
    dp = [[0.0] * n for _ in range(n)]
    opt = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = probs[i]
        opt[i][i] = i
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            s = range_sum(i, j)
            lo = opt[i][j - 1] if j - 1 >= i else i
            hi = opt[i + 1][j] if i + 1 <= j else j
            best_cost, best_r = float("inf"), lo
            for r in range(lo, hi + 1):
                left = dp[i][r - 1] if r > i else 0
                right = dp[r + 1][j] if r < j else 0
                cost = left + right + s
                if cost < best_cost:
                    best_cost, best_r = cost, r
            dp[i][j] = best_cost
            opt[i][j] = best_r
    return dp[0][n - 1]


random.seed(42)
all_ok = True
for _ in range(20):
    n = random.randint(1, 8)
    p = [random.random() for _ in range(n)]
    total = sum(p)
    p = [x / total for x in p]
    a = optimal_bst_naive(p)
    b = optimal_bst_knuth(p)
    if abs(a - b) > 1e-9:
        all_ok = False
        print("MISMATCH:", p, a, b)

print(f"Reference example: naive={optimal_bst_naive([0.15,0.10,0.05,0.10,0.20,0.25,0.15]):.4f}, knuth={optimal_bst_knuth([0.15,0.10,0.05,0.10,0.20,0.25,0.15]):.4f}")
assert all_ok
print("All 20 random trials matched — assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Search-Range Savings by Interval Length',
              code: `import matplotlib.pyplot as plt


def knuth_search_widths(probs):
    n = len(probs)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + probs[i]
    def range_sum(i, j):
        return prefix[j + 1] - prefix[i]
    dp = [[0.0] * n for _ in range(n)]
    opt = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = probs[i]
        opt[i][i] = i

    naive_widths, knuth_widths = [], []
    for length in range(2, n + 1):
        naive_total, knuth_total = 0, 0
        for i in range(n - length + 1):
            j = i + length - 1
            s = range_sum(i, j)
            lo = opt[i][j - 1] if j - 1 >= i else i
            hi = opt[i + 1][j] if i + 1 <= j else j
            best_cost, best_r = float("inf"), lo
            for r in range(lo, hi + 1):
                left = dp[i][r - 1] if r > i else 0
                right = dp[r + 1][j] if r < j else 0
                cost = left + right + s
                if cost < best_cost:
                    best_cost, best_r = cost, r
            dp[i][j] = best_cost
            opt[i][j] = best_r
            naive_total += length
            knuth_total += hi - lo + 1
        naive_widths.append(naive_total)
        knuth_widths.append(knuth_total)
    return naive_widths, knuth_widths


probs = [1 / 20] * 20
naive_widths, knuth_widths = knuth_search_widths(probs)

fig, ax = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
lengths = list(range(2, len(probs) + 1))
ax.plot(lengths, naive_widths, "o-", color="#f87171", label="Naive: total split points tried")
ax.plot(lengths, knuth_widths, "o-", color="#4ade80", label="Knuth: total split points tried")
ax.set_xlabel("Interval length", color="#94a3b8")
ax.set_ylabel("Total candidate split points tried at this length", color="#94a3b8")
ax.set_title("Knuth's optimization tries far fewer split points per interval length", color="#e2e8f0", fontsize=11)
ax.tick_params(colors="#94a3b8")
ax.legend(facecolor="#1e293b", edgecolor="#334155", labelcolor="#e2e8f0")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()
print("Naive total across all lengths:", sum(naive_widths))
print("Knuth total across all lengths:", sum(knuth_widths))`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: "Knuth's optimization, from scratch",
              difficulty: 'hard',
              prompt: 'Fill in the restricted search loop in optimal_bst_scratch(probs): compute lo/hi from opt[i][j-1] and opt[i+1][j], then search only that range. Uncomment the assertion once ready.',
              hint: 'lo = opt[i][j-1] if j-1 >= i else i. hi = opt[i+1][j] if i+1 <= j else j. Search r in range(lo, hi+1), tracking the best cost and its r as opt[i][j].',
              label: 'From Scratch — Knuth-Optimized Optimal BST',
              code: `def optimal_bst_scratch(probs):
    n = len(probs)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + probs[i]
    def range_sum(i, j):
        return prefix[j + 1] - prefix[i]

    dp = [[0.0] * n for _ in range(n)]
    opt = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = probs[i]
        opt[i][i] = i

    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            s = range_sum(i, j)
            # YOUR CODE HERE:
            # lo = opt[i][j-1] if j-1 >= i else i
            # hi = opt[i+1][j] if i+1 <= j else j
            # search r in range(lo, hi+1); track best_cost and best_r
            # dp[i][j] = best_cost; opt[i][j] = best_r
            pass

    return dp[0][n - 1]


probs = [0.04, 0.06, 0.08, 0.02, 0.10, 0.12, 0.14, 0.03, 0.09, 0.32]

# --- Uncomment to test when ready ---
# result = optimal_bst_scratch(probs)
# print(f"optimal_bst_scratch result: {result:.4f}")
# assert abs(result - 2.18) < 0.01, f"got {result}"
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
      text: "What does Knuth's monotonicity bound, opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j], actually guarantee?",
      options: [
        'That the optimal split point is always exactly in the middle of the interval',
        'That the optimal split point for interval [i,j] is bounded below by the optimal split of the slightly-shorter interval [i,j-1], and bounded above by the optimal split of the slightly-shorter interval [i+1,j] — letting the search for [i,j]\'s optimum be restricted to that range without ever missing the true best split',
        'That every interval of the same length has the identical optimal split point',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: "Why does the total work across all intervals become O(n²) rather than O(n³), even though a single interval's restricted search range could still be as large as O(n) in the worst case?",
      options: [
        'It does not — Knuth\'s optimization is still O(n³) in the worst case, just with a smaller constant factor',
        'Summing the restricted search-range WIDTH across every interval of a given length telescopes to a bound of O(n) total per length (not O(n) per interval), and there are O(n) lengths, giving O(n) × O(n) = O(n²) total — a genuinely non-obvious amortized argument, not simply "small range → fast" reasoning applied interval by interval',
        'The optimization only works because n is always small enough that O(n³) and O(n²) are practically identical',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: "What precondition must a cost function satisfy before Knuth's optimization can be safely applied?",
      options: [
        'The cost function must always return an integer',
        'The cost function must satisfy the quadrangle inequality (a specific monotonicity condition) — this is what guarantees the opt[][] bound actually holds; applying the restricted search to a cost function that does not satisfy it can silently skip the true optimal split point and produce a WRONG answer, not just a slow one',
        'The array being processed must already be sorted in increasing order',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: "Why must intervals still be processed in increasing order of LENGTH, exactly as in Chapter 3's interval DP, when applying Knuth's optimization?",
      options: [
        'It is not actually required for Knuth\'s optimization specifically, only for the unoptimized version',
        'Computing dp[i][j] and opt[i][j] requires opt[i][j-1] and opt[i+1][j] to already be known — both belong to strictly shorter intervals, so the fill order must guarantee every shorter interval is fully processed before any longer interval that depends on it',
        'Length-based ordering is only a performance convenience with no correctness implications',
      ],
      correct: 1,
    },
  ],
};
