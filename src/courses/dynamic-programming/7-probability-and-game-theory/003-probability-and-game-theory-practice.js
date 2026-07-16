export default {
  id: 'dp7-003',
  slug: 'probability-and-game-theory-practice',
  chapter: 'dp7',
  order: 3,
  title: 'Practice: Combining Probability DP with Extra State',
  subtitle: 'A stopping-condition probability game, and a resource-tracking stone game',
  tags: ['dynamic programming', 'probability dp', 'game theory dp', 'new 21 game', 'stone game ii', 'practice'],
  aliases: 'new 21 game probability dp practice stone game 2 extra state dp',

  hook: {
    question: 'Alice draws random point values (uniformly from 1 to maxPts) and keeps a running total, but STOPS drawing the moment her total reaches at least k. What is the probability her final total is at most n? This looks like Lesson 1\'s probability propagation, but with a wrinkle borrowed from Chapter 4\'s digit DP: a STOPPING CONDITION that changes which states are even reachable. Meanwhile, a stone-taking game where a player can take between 1 and 2M piles from the FRONT (not either end), with M updating afterward, borrows the "extra state dimension" idea too — but for a game-theory DP instead of a probability one. Both problems are exactly Chapter 7\'s two families, each needing one more piece of state than Lessons 1 and 2 used alone.',
    realWorldContext: 'Real probability and game-theory problems are rarely as clean as the textbook versions in Lessons 1 and 2 — a stopping condition, a resource budget, or a running constraint almost always needs to be folded into the DP state, exactly the "add a dimension" instinct Chapter 4\'s digit DP first introduced and every later chapter has reused.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**New 21 Game: the stopping condition restricts which states can still draw.** Define `dp[x]` as the probability Alice\'s running total ever EQUALS exactly `x` during play. `dp[0] = 1` (she starts at 0). For `x >= 1`, `dp[x]` is built from the `maxPts` totals that could have preceded it (`x - maxPts` through `x - 1`) — but ONLY from those preceding totals that are `< k` (since once her total reaches `k` or more, she stops drawing, so a total `>= k` never draws again and cannot be a "previous total" for a later draw). This mirrors digit DP\'s "started"/"tight" flags exactly: a boolean condition (here, "still drawing" vs. "stopped") determines which transitions are even legal.',
      '**Turning an O(n · maxPts) sum into O(n) with a sliding window.** Computing `dp[x]` as `(1/maxPts) * sum of dp[x-1..x-maxPts] restricted to indices < k` naively re-sums up to `maxPts` terms for every `x`. But as `x` increases by 1, the window of preceding indices also just shifts by 1 — exactly Chapter 6 Lesson 1\'s sliding-window insight, except summing (not taking a max) over the window. Maintain a running `windowSum`, adding `dp[x]` in when `x < k` (it can still be drawn from later) and subtracting `dp[x - maxPts]` back out once it falls out of range, giving O(1) work per `x` instead of O(maxPts).',
      '**The final answer sums over the states that were reachable but already stopped.** Once every `dp[x]` for `x` from `0` to `n` is known, the answer is `sum of dp[x] for x from k to n` — every total in that range represents a point where Alice\'s score reached `x` and, since `x >= k`, she stopped right there, ending with exactly that final total. Totals below `k` are never final scores (she would have kept drawing), so they are excluded from the answer sum even though they were needed as intermediate values to compute other `dp[x]`.',
      '**Stone Game II: the "resource" dimension is the multiplier M itself.** A player facing piles `[i..n-1]` with a current multiplier `M` can take between 1 and `2M` piles from the FRONT. Define `dp[i][M]` as the maximum total the current mover can secure from `piles[i:]` given multiplier `M`. Trying `x` piles (`1 <= x <= 2M`): the mover gets `suffixSum[i] - dp[i+x][max(M, x)]` (their own total-remaining minus whatever the OPPONENT secures afterward, echoing Lesson 2\'s "subtract the recursive term" perspective flip) — take the best `x`. The base case: once `i + 2M >= n`, the mover can just take ALL remaining piles, so `dp[i][M] = suffixSum[i]`.',
      '**Both problems needed exactly one more state dimension than Lessons 1 and 2\'s versions — recognize that pattern, don\'t memorize the problems.** New 21 Game added a boolean-like "still drawing" constraint (structurally identical to digit DP\'s flags). Stone Game II added a numeric resource dimension `M` that changes the legal move set (structurally similar to bitmask DP\'s "extra dimension for a constraint" from Chapter 3). Neither problem is a new technique — both are Lessons 1 and 2\'s core recurrences with one more piece of state layered in, exactly the skill this whole course has been building toward.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 7, Lesson 3: Practice — Combining Probability DP with Extra State (closing lesson)',
        body: '**Previous:** Game Theory DP — minimax with a perspective-flipping subtraction over interval states.\n**This lesson:** two practice problems, each layering one more state dimension onto Lessons 1–2\'s core recurrences.\n**Next:** Chapter 8 — State-Machine DP, where the "extra dimension" habit becomes the entire chapter\'s subject.',
      },
      {
        type: 'insight',
        title: 'New 21 Game\'s sliding window, stated precisely',
        body: 'windowSum tracks Σ dp[j] for j in the last maxPts indices with j < k. dp[x] = windowSum / maxPts. After computing dp[x]: if x < k, add dp[x] into windowSum (it can be drawn from later); if x - maxPts >= 0 and x - maxPts < k, subtract dp[x-maxPts] back out (it has aged out of the window).',
      },
      {
        type: 'strategy',
        title: 'Stone Game II\'s suffix-sum trick',
        body: 'Precompute suffixSum[i] = sum of piles[i:] once, in O(n). Then "mover\'s total for piles[i:]" is just suffixSum[i] minus whatever the opponent secures from piles[i+x:] onward — avoiding recomputing partial sums inside the recursion.',
      },
      {
        type: 'warning',
        title: 'A "reachable but not final" state is easy to double-count or drop',
        body: 'In New 21 Game, dp[x] for x < k is a real, necessary intermediate value (it feeds later draws) but must NOT be added into the final answer — only x in [k, n] represents an actual stopping point. Conflating "used in the recurrence" with "counted in the answer" is the most common bug in stopping-condition probability DP.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'New 21 Game: The Sliding Probability Window',
        caption: 'Watch windowSum track only the still-drawing states as x advances.',
        props: {
          lesson: {
            title: 'Stopping-Condition Probability DP, Step by Step',
            subtitle: 'A sliding window that only includes states below the stopping threshold k.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'dp[x] and windowSum, Side by Side',
                instruction: 'For n=10, k=4, maxPts=3, watch which dp[x] values feed the window and which fall out.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const n = 10, k = 4, maxPts = 3;
const dp = new Array(n + 1).fill(0);
dp[0] = 1;
let windowSum = 1;
const log = [];
for (let x = 1; x <= n; x++) {
  dp[x] = windowSum / maxPts;
  let note = '';
  if (x < k) { windowSum += dp[x]; note = 'added to window (still < k)'; }
  else { note = 'NOT added to window (>= k, this is a stopping point)'; }
  if (x - maxPts >= 0 && x - maxPts < k) { windowSum -= dp[x - maxPts]; note += ' | removed dp[' + (x-maxPts) + '] (aged out)'; }
  log.push({ x, value: dp[x].toFixed(4), note });
}
let answer = 0;
for (let x = k; x <= n; x++) answer += dp[x];

d.innerHTML += '<div style="color:#60a5fa;margin-bottom:8px">n=' + n + ', k=' + k + ', maxPts=' + maxPts + '</div>';
log.forEach(e => {
  d.innerHTML += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px">dp[' + e.x + ']=' + e.value + ' — ' + e.note + '</div>';
});
d.innerHTML += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Answer (sum of dp[k..n]) = ' + answer.toFixed(4) + '</div>';`,
                outputHeight: 480,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build New 21 Game from Scratch',
        caption: 'The naive O(n·maxPts) version, then the O(n) sliding-window version.',
        props: {
          lesson: {
            title: 'New 21 Game in JavaScript',
            subtitle: 'A stopping condition inside a sliding-window probability DP.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Naive O(n·maxPts) Version

Implement \`new21GameNaive(n, k, maxPts)\`: for each x, sum dp[x-1..x-maxPts] directly (restricted to indices < k), instead of maintaining a running window.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function new21GameNaive(n, k, maxPts) {
  if (k === 0 || n >= k + maxPts - 1) return 1.0;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  let result = 0;
  for (let x = 1; x <= n; x++) {
    let sum = 0;
    for (let prev = Math.max(0, x - maxPts); prev <= x - 1; prev++) {
      // TODO: only include prev if prev < k (still-drawing states)
      // TODO: sum += dp[prev]
    }
    dp[x] = sum / maxPts;
    if (x >= k) result += dp[x];
  }
  return result;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g.toFixed(6)}, want \${e}</div>\`;
}

test('n=10,k=1,maxPts=10', new21GameNaive(10, 1, 10), 1.0);
test('n=6,k=1,maxPts=10', new21GameNaive(6, 1, 10), 0.6);`,
                solutionCode: `function new21GameNaive(n, k, maxPts) {
  if (k === 0 || n >= k + maxPts - 1) return 1.0;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  let result = 0;
  for (let x = 1; x <= n; x++) {
    let sum = 0;
    for (let prev = Math.max(0, x - maxPts); prev <= x - 1; prev++) {
      if (prev < k) sum += dp[prev];
    }
    dp[x] = sum / maxPts;
    if (x >= k) result += dp[x];
  }
  return result;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g.toFixed(6)}, want \${e}</div>\`;
}

test('n=10,k=1,maxPts=10', new21GameNaive(10, 1, 10), 1.0);
test('n=6,k=1,maxPts=10', new21GameNaive(6, 1, 10), 0.6);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Sliding-Window O(n) Version

Implement \`new21Game(n, k, maxPts)\` maintaining a running windowSum instead of re-summing each time.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function new21Game(n, k, maxPts) {
  if (k === 0 || n >= k + maxPts - 1) return 1.0;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  let windowSum = 1;
  let result = 0;
  for (let x = 1; x <= n; x++) {
    dp[x] = windowSum / maxPts;
    // TODO: if (x < k) windowSum += dp[x]
    // TODO: else result += dp[x]
    // TODO: if (x - maxPts >= 0 && x - maxPts < k) windowSum -= dp[x - maxPts]
  }
  return result;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-6;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g.toFixed(6)}, want \${e}</div>\`;
}

test('n=10,k=1,maxPts=10', new21Game(10, 1, 10), 1.0);
test('n=6,k=1,maxPts=10', new21Game(6, 1, 10), 0.6);
test('n=21,k=17,maxPts=10', new21Game(21, 17, 10), 0.73278);`,
                solutionCode: `function new21Game(n, k, maxPts) {
  if (k === 0 || n >= k + maxPts - 1) return 1.0;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  let windowSum = 1;
  let result = 0;
  for (let x = 1; x <= n; x++) {
    dp[x] = windowSum / maxPts;
    if (x < k) windowSum += dp[x];
    else result += dp[x];
    if (x - maxPts >= 0 && x - maxPts < k) windowSum -= dp[x - maxPts];
  }
  return result;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-6;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g.toFixed(6)}, want \${e}</div>\`;
}

test('n=10,k=1,maxPts=10', new21Game(10, 1, 10), 1.0);
test('n=6,k=1,maxPts=10', new21Game(6, 1, 10), 0.6);
test('n=21,k=17,maxPts=10', new21Game(21, 17, 10), 0.73278);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Practice in Python: Extra-State DP',
        caption: 'Verify New 21 Game, visualize Stone Game II\'s (i, M) table, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'New 21 Game — Sliding-Window Probability DP, Verified',
              code: `def new_21_game(n, k, max_pts):
    if k == 0 or n >= k + max_pts - 1:
        return 1.0
    dp = [0.0] * (n + 1)
    dp[0] = 1.0
    window_sum = 1.0
    result = 0.0
    for x in range(1, n + 1):
        dp[x] = window_sum / max_pts
        if x < k:
            window_sum += dp[x]
        else:
            result += dp[x]
        if x - max_pts >= 0 and x - max_pts < k:
            window_sum -= dp[x - max_pts]
    return result


tests = [
    (10, 1, 10, 1.0),
    (6, 1, 10, 0.6),
    (21, 17, 10, 0.7327777870686082),
]
for n, k, max_pts, expected in tests:
    result = new_21_game(n, k, max_pts)
    print(f"n={n} k={k} maxPts={max_pts}: got={result:.6f}, expected={expected:.6f}")
    assert abs(result - expected) < 1e-9

print("All assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Stone Game II\'s (i, M) Value Table',
              code: `import matplotlib.pyplot as plt
import numpy as np
from functools import lru_cache


def stone_game_ii_table(piles):
    n = len(piles)
    suffix_sum = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix_sum[i] = suffix_sum[i + 1] + piles[i]

    max_m = n  # M can never usefully exceed n
    table = [[None] * (max_m + 1) for _ in range(n + 1)]

    @lru_cache(maxsize=None)
    def dp(i, m):
        if i >= n:
            return 0
        if i + 2 * m >= n:
            return suffix_sum[i]
        best = 0
        for x in range(1, 2 * m + 1):
            best = max(best, suffix_sum[i] - dp(i + x, max(m, x)))
        return best

    for i in range(n + 1):
        for m in range(1, max_m + 1):
            table[i][m] = dp(i, m)
    return table, dp(0, 1)


piles = [2, 7, 9, 4, 4, 5, 3]
table, answer = stone_game_ii_table(piles)
n = len(piles)

data = np.array([[table[i][m] if table[i][m] is not None else 0 for m in range(1, n + 1)] for i in range(n)], dtype=float)

fig, ax = plt.subplots(figsize=(7, 5), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
im = ax.imshow(data, cmap="viridis", aspect="auto")
ax.set_xlabel("M (multiplier)", color="#94a3b8")
ax.set_ylabel("i (starting pile index)", color="#94a3b8")
ax.set_xticks(range(n)); ax.set_xticklabels(range(1, n + 1))
ax.set_yticks(range(n))
ax.set_title(f"dp[i][M] for piles={piles}", color="#e2e8f0", fontsize=11)
ax.tick_params(colors="#94a3b8")
plt.tight_layout()
plt.show()
print(f"First-mover total with optimal play: dp(0,1) = {answer} out of total {sum(piles)}")`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Stone Game II, from scratch',
              difficulty: 'hard',
              prompt: 'Fill in dp(i, m) for stone_game_ii_scratch(piles): the mover can take between 1 and 2m piles from the front; if i+2m >= n they should just take everything remaining. Uncomment the assertion once ready.',
              hint: 'Base case: if i + 2*m >= n, return suffix_sum[i] (take all remaining piles). Otherwise try every x from 1 to 2*m, and take the best of suffix_sum[i] - dp(i+x, max(m,x)).',
              label: 'From Scratch — Stone Game II',
              code: `from functools import lru_cache


def stone_game_ii_scratch(piles):
    n = len(piles)
    suffix_sum = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix_sum[i] = suffix_sum[i + 1] + piles[i]

    @lru_cache(maxsize=None)
    def dp(i, m):
        # YOUR CODE HERE:
        # if i >= n: return 0
        # if i + 2*m >= n: return suffix_sum[i]
        # try x in range(1, 2*m+1): best = max(best, suffix_sum[i] - dp(i+x, max(m,x)))
        # return best
        pass

    result = dp(0, 1)
    dp.cache_clear()
    return result


piles = [1, 2, 3, 4, 5, 100]

# --- Uncomment to test when ready ---
# result = stone_game_ii_scratch(piles)
# print(f"stone_game_ii_scratch({piles}) = {result}")
# assert result == 104, f"got {result}"
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
      text: 'In New 21 Game, why must dp[x] for x < k still be computed even though it never contributes directly to the final answer sum?',
      options: [
        'It does not need to be computed — only dp[x] for x >= k matters',
        'Because dp[x] for x < k represents an intermediate "still drawing" state that later draws build on — it feeds the windowSum used to compute dp[x\'] for larger x\', even though it itself is not a stopping point counted in the answer',
        'Because dp[x] for x < k is always exactly equal to dp[x] for x >= k',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What makes the sliding-window version of New 21 Game O(n) instead of O(n · maxPts)?',
      options: [
        'It skips computing dp[x] for most values of x',
        'It maintains a running windowSum, adding and removing one term per step as x advances, instead of re-summing up to maxPts terms from scratch for every x — the same amortized O(1)-per-step idea as Chapter 6\'s monotonic deque optimization, applied to a sum instead of a max',
        'It replaces the probability calculation with an exact closed-form formula requiring no loop at all',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'In Stone Game II, why is M tracked as part of the DP state rather than fixed at 1 throughout?',
      options: [
        'M is not actually needed; it is only cosmetic',
        'Because M changes after every move (M becomes max(M, x) where x piles were just taken), which changes how many piles the NEXT mover is allowed to take — M is a genuine piece of state the future recurrence depends on, so it must be part of the DP key, the same "extra dimension for a changing constraint" idea used in Chapter 3\'s bitmask DP and Chapter 4\'s digit DP',
        'M is tracked purely for visualization purposes and does not affect correctness',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the common thread between New 21 Game\'s "still drawing" flag and Stone Game II\'s multiplier M?',
      options: [
        'Both are unrelated quirks specific to their individual problems',
        'Both are extra state dimensions layered onto a core recurrence already taught earlier (Lesson 1\'s probability propagation, Lesson 2\'s minimax subtraction) — recognizing when a new constraint needs its own DP dimension, rather than treating each new problem as requiring an entirely new technique, is the actual transferable skill',
        'Both require abandoning dynamic programming entirely in favor of greedy heuristics',
      ],
      correct: 1,
    },
  ],
};
