export default {
  id: 'dp7-002',
  slug: 'game-theory-dp',
  chapter: 'dp7',
  order: 2,
  title: 'Game Theory DP: Minimax with Memoization',
  subtitle: 'Two players, optimal play, and Chapter 1\'s interval DP in a new disguise',
  tags: ['dynamic programming', 'game theory dp', 'minimax', 'predict the winner', 'stone game'],
  aliases: 'game theory dp minimax memoization predict the winner stone game',

  hook: {
    question: 'Two players alternate taking a stone from either end of a row of stone piles, each trying to maximize their OWN total, both playing perfectly. Who ends up ahead? The naïve instinct — "have each player greedily grab the bigger end" — is provably wrong (a small example breaks it below). The actual structure needed is the SAME interval DP from Chapter 1, but read through a game-theoretic lens: the value of an interval isn\'t a single best cost, it\'s "the best score difference the player TO MOVE can force," which changes whose turn it is at every recursive step.',
    realWorldContext: 'Minimax with memoization over game states is the standard technique behind solving small combinatorial games exactly (Nim variants, stone-taking games, coin games) and is the DP backbone underneath more advanced adversarial search (the same "value of a state under optimal play from both sides" idea scales up to alpha-beta pruning and Monte Carlo tree search in full games like chess and Go).',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Why greedy fails — the score to track is a DIFFERENCE, not a running total.** Consider piles `[1, 5, 2]`. A greedy player facing "take from either end" might grab the bigger end each turn — but simulating that: player 1 takes 2 (right end, bigger than left\'s 1), player 2 takes 5 (only option left is the 5 or the 1; 5 is bigger), player 1 takes 1. Final score: player 1 has 2+1=3, player 2 has 5. Player 1 LOSES despite always taking the "biggest available" pile. Optimal play requires thinking ahead about what the OPPONENT gets to do next, not just what looks best right now.',
      '**The state and the recurrence.** Define `dp[i][j]` as the maximum SCORE DIFFERENCE (current player\'s total minus opponent\'s total) that the player whose turn it is can force, given only piles `stones[i..j]` remain. The player to move has two choices: take `stones[i]` (the left end) or `stones[j]` (the right end). Whichever they take, the OTHER player then moves next on the remaining interval, and by definition achieves `dp` of THAT sub-interval as their own advantage over the current player — meaning it must be SUBTRACTED, not added: `dp[i][j] = max(stones[i] - dp[i+1][j], stones[j] - dp[i][j-1])`. This subtraction is the key game-theoretic twist beyond Chapter 1\'s interval DP: every recursive call flips perspective.',
      '**Base case and reading the final answer.** When `i > j` (no piles left), `dp[i][j] = 0` — no advantage either way. When `i == j` (one pile left), the mover takes it: `dp[i][i] = stones[i]`. The final answer, `dp[0][n-1]`, is the score difference (first player\'s total minus second player\'s total) under optimal play by both. If `dp[0][n-1] >= 0`, the first player ties or wins; if negative, the first player loses.',
      '**Fill order — identical discipline to Chapter 1\'s interval DP.** Since `dp[i][j]` depends on `dp[i+1][j]` and `dp[i][j-1]` — both strictly SHORTER intervals — the table must be filled by increasing interval length, exactly like every interval DP in this course. The only thing genuinely new here is the SUBTRACTION in the recurrence (reflecting whose turn it is), not the fill order or the two-pointer interval shape itself.',
      '**Recognizing the shared shape is the actual lesson.** On the surface, "two players alternately taking from a row of piles" looks nothing like "insert parentheses to minimize multiplication cost" (Chapter 1) or "build an optimal search tree" (also Chapter 1). But both reduce to the same `dp[i][j]` built from `dp[i+1][j]`/`dp[i][j-1]`-shaped shorter intervals. Learning to see past the surface-level story to the underlying state-and-transition shape is what separates "I\'ve memorized this exact problem" from "I can solve a new problem in this family."',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 7, Lesson 2: Game Theory DP',
        body: '**Previous:** Expected Value DP — propagating a probability distribution forward layer by layer.\n**This lesson:** Game Theory DP — minimax with memoization, reusing Chapter 1\'s interval-DP shape with a perspective-flipping subtraction.\n**Next:** a synthesis/practice lesson combining probability and game-theory DP.',
      },
      {
        type: 'insight',
        title: 'The recurrence, stated precisely',
        body: 'dp[i][j] = max(stones[i] − dp[i+1][j], stones[j] − dp[i][j−1]), with dp[i][i] = stones[i] and dp[i][j] = 0 when i > j. dp[i][j] is always "current mover\'s score minus opponent\'s score" for the interval [i,j] — never an absolute total.',
      },
      {
        type: 'strategy',
        title: 'Score DIFFERENCE, not raw score, is the trick that makes this a clean DP',
        body: 'Tracking each player\'s raw running total would require carrying extra state (whose turn, cumulative score so far) that doesn\'t compose cleanly across sub-intervals. Tracking the DIFFERENCE collapses "my score" and "opponent\'s score" into one number per interval, because every recursive call already knows it is being evaluated from the perspective of whoever moves next in that interval.',
      },
      {
        type: 'warning',
        title: 'Greedy (take the bigger end) is not just suboptimal — it can flip the winner',
        body: 'The [1,5,2] example above is not a contrived edge case; greedy strategies in adversarial games routinely lose to opponents who plan one or more moves ahead. Whenever a game problem says "optimal play by both sides," greedy is essentially never correct — the DP must consider what the opponent will do in response to each choice, which is exactly what the subtraction encodes.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Minimax DP: Filling the Interval Table',
        caption: 'Watch dp[i][j] get built from strictly shorter intervals, exactly like Chapter 1\'s interval DP.',
        props: {
          lesson: {
            title: 'Game Theory DP Step by Step',
            subtitle: 'Score-difference propagation over shrinking intervals.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The dp[i][j] Table, Filled by Increasing Length',
                instruction: 'For piles [3, 9, 1, 2], watch each interval\'s optimal score difference get computed from its two shorter sub-intervals.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const stones = [3, 9, 1, 2];
const n = stones.length;
const dp = Array.from({length: n}, () => new Array(n).fill(0));
for (let i = 0; i < n; i++) dp[i][i] = stones[i];

const log = [];
for (let length = 2; length <= n; length++) {
  for (let i = 0; i + length - 1 < n; i++) {
    const j = i + length - 1;
    const takeLeft = stones[i] - dp[i+1][j];
    const takeRight = stones[j] - dp[i][j-1];
    dp[i][j] = Math.max(takeLeft, takeRight);
    log.push({ i, j, takeLeft, takeRight, chosen: dp[i][j] === takeLeft ? 'left' : 'right', value: dp[i][j] });
  }
}

d.innerHTML += '<div style="color:#60a5fa;margin-bottom:8px">stones = [' + stones.join(', ') + ']</div>';
log.forEach(e => {
  d.innerHTML += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px">[' + e.i + ',' + e.j + ']: take-left gives ' + e.takeLeft + ', take-right gives ' + e.takeRight + ' &rarr; best=<b style="color:#4ade80">' + e.value + '</b> (take ' + e.chosen + ')</div>';
});
d.innerHTML += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Final: dp[0][' + (n-1) + '] = ' + dp[0][n-1] + ' &rarr; first player ' + (dp[0][n-1] >= 0 ? 'wins or ties' : 'loses') + '</div>';`,
                outputHeight: 400,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Minimax DP from Scratch',
        caption: 'See greedy fail, then implement the correct memoized minimax.',
        props: {
          lesson: {
            title: 'Game Theory DP in JavaScript',
            subtitle: 'From a broken greedy strategy to correct minimax DP.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — See Greedy Fail

Implement \`greedyDiff(stones)\`: at each turn, the mover takes whichever end (left or right) is bigger. Return the resulting score difference (player-to-start's total minus the other player's total). This will NOT match optimal play.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}.note{color:#facc15;margin:6px 0}`,
                startCode: `function greedyDiff(stones) {
  let arr = stones.slice();
  let scores = [0, 0];
  let turn = 0;
  while (arr.length) {
    // TODO: take arr[0] if it's >= arr[arr.length-1], else take the last element
    // TODO: add the taken value to scores[turn]
    // TODO: turn = 1 - turn
  }
  return scores[0] - scores[1];
}

const out = document.getElementById('out');
out.innerHTML += '<div class="note">Greedy result for [1,5,2]: ' + greedyDiff([1,5,2]) + ' (optimal play actually gives -2 — greedy disagrees!)</div>';`,
                solutionCode: `function greedyDiff(stones) {
  let arr = stones.slice();
  let scores = [0, 0];
  let turn = 0;
  while (arr.length) {
    const taken = arr[0] >= arr[arr.length - 1] ? arr.shift() : arr.pop();
    scores[turn] += taken;
    turn = 1 - turn;
  }
  return scores[0] - scores[1];
}

const out = document.getElementById('out');
out.innerHTML += '<div class="note">Greedy result for [1,5,2]: ' + greedyDiff([1,5,2]) + ' (optimal play actually gives -2 — greedy disagrees!)</div>';`,
                outputHeight: 100,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Correct Minimax DP: O(n²)

Implement \`optimalDiff(stones)\` using the interval DP recurrence: dp[i][j] = max(stones[i] - dp[i+1][j], stones[j] - dp[i][j-1]).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function optimalDiff(stones) {
  const n = stones.length;
  const dp = Array.from({length: n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) dp[i][i] = stones[i];

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      // TODO: takeLeft = stones[i] - dp[i+1][j]
      // TODO: takeRight = stones[j] - dp[i][j-1]
      // TODO: dp[i][j] = Math.max(takeLeft, takeRight)
    }
  }
  return dp[0][n-1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('[1,5,2]', optimalDiff([1,5,2]), -2);
test('[1,5,233,7]', optimalDiff([1,5,233,7]), 222);
test('[3,7,2,3]', optimalDiff([3,7,2,3]), 5);`,
                solutionCode: `function optimalDiff(stones) {
  const n = stones.length;
  const dp = Array.from({length: n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) dp[i][i] = stones[i];

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      const takeLeft = stones[i] - dp[i+1][j];
      const takeRight = stones[j] - dp[i][j-1];
      dp[i][j] = Math.max(takeLeft, takeRight);
    }
  }
  return dp[0][n-1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('[1,5,2]', optimalDiff([1,5,2]), -2);
test('[1,5,233,7]', optimalDiff([1,5,233,7]), 222);
test('[3,7,2,3]', optimalDiff([3,7,2,3]), 5);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Game Theory DP in Python',
        caption: 'Verify against brute force, visualize the interval table, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Minimax DP vs Brute-Force Recursion — Verify',
              code: `from functools import lru_cache


def optimal_diff_memo(stones):
    n = len(stones)

    @lru_cache(maxsize=None)
    def dp(i, j):
        if i > j:
            return 0
        return max(stones[i] - dp(i + 1, j), stones[j] - dp(i, j - 1))

    result = dp(0, n - 1)
    dp.cache_clear()
    return result


def optimal_diff_brute(stones):
    def rec(i, j):
        if i > j:
            return 0
        return max(stones[i] - rec(i + 1, j), stones[j] - rec(i, j - 1))
    return rec(0, len(stones) - 1)


tests = [
    [1, 5, 2],
    [1, 5, 233, 7],
    [3, 7, 2, 3],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
]
for stones in tests:
    memo = optimal_diff_memo(stones)
    brute = optimal_diff_brute(stones)
    winner = "player 1" if memo >= 0 else "player 2"
    print(f"stones={stones}: diff={memo} (winner: {winner}), brute-force match: {memo == brute}")
    assert memo == brute

print("All assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: The Interval Table for a 6-Pile Game',
              code: `import matplotlib.pyplot as plt
import numpy as np


def build_dp_table(stones):
    n = len(stones)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = stones[i]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = max(stones[i] - dp[i+1][j], stones[j] - dp[i][j-1])
    return dp


stones = [4, 9, 2, 8, 3, 6]
dp = build_dp_table(stones)
n = len(stones)

mask = np.array([[1 if j >= i else 0 for j in range(n)] for i in range(n)])
data = np.array(dp, dtype=float)
data_masked = np.ma.masked_where(mask == 0, data)

fig, ax = plt.subplots(figsize=(6, 5.5), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
im = ax.imshow(data_masked, cmap="RdYlGn", vmin=-20, vmax=20)
for i in range(n):
    for j in range(n):
        if j >= i:
            ax.text(j, i, str(dp[i][j]), ha="center", va="center", color="#0f172a", fontsize=10, fontweight="bold")
ax.set_xticks(range(n)); ax.set_yticks(range(n))
ax.set_title(f"dp[i][j] for stones={stones}", color="#e2e8f0", fontsize=11)
ax.tick_params(colors="#94a3b8")
plt.tight_layout()
plt.show()
print(f"Final answer dp[0][{n-1}] = {dp[0][n-1]} -> {'player 1 wins/ties' if dp[0][n-1] >= 0 else 'player 2 wins'}")`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Minimax DP, from scratch',
              difficulty: 'medium',
              prompt: 'Fill in the interval DP loop in optimal_diff_scratch(stones): for each interval length from 2 upward, compute dp[i][j] as the max of taking the left or right end. Uncomment the assertion once ready.',
              hint: 'dp[i][j] = max(stones[i] - dp[i+1][j], stones[j] - dp[i][j-1]). Base case dp[i][i] = stones[i] must be filled before the length loop starts.',
              label: 'From Scratch — Minimax Interval DP',
              code: `def optimal_diff_scratch(stones):
    n = len(stones)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = stones[i]

    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            # YOUR CODE HERE:
            # take_left = stones[i] - dp[i+1][j]
            # take_right = stones[j] - dp[i][j-1]
            # dp[i][j] = max(take_left, take_right)
            pass

    return dp[0][n - 1]


stones = [5, 3, 4, 9, 1, 8, 2]

# --- Uncomment to test when ready ---
# result = optimal_diff_scratch(stones)
# print(f"optimal_diff_scratch({stones}) = {result}")
# assert result == -8, f"got {result}"
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
      text: 'Why does greedily taking whichever end (left or right) has the larger value fail to find the optimal strategy?',
      options: [
        'It never fails — greedy is always optimal for this class of game',
        'Because it only considers the immediate gain and ignores what the opponent will optimally do with the remaining piles afterward — as the [1,5,2] example shows, taking the biggest available pile each turn can still lose to a player who plans ahead',
        'Because greedy strategies are only valid when there are an even number of piles',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'In dp[i][j] = max(stones[i] - dp[i+1][j], stones[j] - dp[i][j-1]), why is the recursive term SUBTRACTED rather than added?',
      options: [
        'Because dp[i][j] tracks the current mover\'s score MINUS the opponent\'s score, and after the current mover takes an end, the opponent moves next on the remaining interval and achieves dp of that sub-interval as THEIR advantage — which must be subtracted from the current mover\'s perspective',
        'Subtraction is simply a convention with no mathematical necessity; addition would also work',
        'Because stones values are assumed to always be negative in this formulation',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What determines the fill order required for this DP table, and why?',
      options: [
        'Any fill order works since dp[i][j] does not depend on any other table entries',
        'Intervals must be filled by increasing length, because dp[i][j] depends on dp[i+1][j] and dp[i][j-1] — both strictly shorter intervals — the identical discipline required by every interval DP in this course',
        'The table must be filled in decreasing length order, starting from the full array',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is the deeper lesson in recognizing that this "two players take from either end" game reuses Chapter 1\'s interval DP shape?',
      options: [
        'That all DP problems are secretly identical and no new thinking is ever required',
        'That the surface-level story of a problem (a game, a matrix-chain multiplication, a search tree) can differ completely while the underlying state-and-transition shape (an interval built from two shorter, adjacent intervals) stays the same — recognizing that shared shape is what generalizes to solving genuinely new problems',
        'That minimax games can only ever be solved with interval DP, never with any other technique',
      ],
      correct: 1,
    },
  ],
};
