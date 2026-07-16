export default {
  id: 'dp7-001',
  slug: 'expected-value-dp',
  chapter: 'dp7',
  order: 1,
  title: 'Expected Value DP: Knight Probability in a Chessboard',
  subtitle: 'Building a probability distribution forward, one move at a time',
  tags: ['dynamic programming', 'expected value', 'probability dp', 'knight probability'],
  aliases: 'expected value dp probability dp knight probability chessboard',

  hook: {
    question: 'A knight starts on a chessboard square and makes k random moves, each of the (up to) 8 legal knight moves chosen with equal probability — but some moves would walk it off the edge of the board, ending the experiment. What is the probability the knight is STILL on the board after all k moves? Brute-force enumeration of every move sequence is 8^k — utterly intractable for even modest k. But this is really just a DP over probability distributions: track, layer by layer, the probability of being at each square after each move, exactly the same "build the table forward" discipline used everywhere else in this course.',
    realWorldContext: 'Expected value / probability DP shows up whenever a process makes a sequence of random choices and you need the probability (or expected value) of some outcome — dice games, random walks, Markov-chain-style simulations, and reliability analysis (probability a system survives k random failures) are all the same shape: propagate a probability distribution forward through states, exactly like propagating a cost or count forward through states in every other chapter of this course.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Reframe "probability of an outcome" as "a distribution propagated forward."** Instead of asking "what is the probability the knight survives k moves," ask the layered question: "if the knight starts at square `(r,c)`, what is the probability it survives EXACTLY k more moves?" Call this `dp[k][r][c]`. The base case is trivial: `dp[0][r][c] = 1` for every square (with zero moves left, the knight trivially "survives," since it hasn\'t moved at all). This is exactly the same "define the base case as the trivial/already-solved case" instinct from every earlier chapter.',
      '**The recurrence: average over the 8 possible next moves.** `dp[k][r][c]` is built from `dp[k-1][*][*]`: from `(r,c)`, the knight has 8 equally likely moves; for each one that lands ON the board at `(nr,nc)`, the probability of surviving the remaining `k-1` moves from there is `dp[k-1][nr][nc]`; for each one that lands OFF the board, that branch contributes 0 (game over). So `dp[k][r][c] = (1/8) * sum over the (up to 8) on-board destinations of dp[k-1][nr][nc]`. Squares near the edge have fewer on-board destinations, so their survival probability decays faster with each additional move — this is the entire mechanic, expressed as one line of arithmetic per cell.',
      '**Why this is layered, not purely recursive top-down.** Just like Chapter 4\'s digit DP layered by digit position, or Chapter 6\'s partition DP layered by group count, this problem is naturally layered by MOVE NUMBER: compute the full `n x n` grid for `k=1` from the (trivial) grid for `k=0`, then the grid for `k=2` from the grid for `k=1`, and so on, up to the target `k`. Each layer only ever reads the PREVIOUS layer — never itself — so a simple nested loop over rows and columns, moving layer by layer, computes the whole table in `O(k * n^2)` time using only `O(n^2)` space (two alternating grids) rather than storing all `k` layers at once.',
      '**Expected value is the same idea with a sum instead of a probability weight.** If a problem instead asked for an EXPECTED total score rather than a survival probability, the recurrence would look identical in shape — `E[state] = sum over each random outcome of (probability of that outcome) * (value earned + E[next state])` — averaging over the same possible transitions, just accumulating a value instead of accumulating "probability of staying alive." Recognizing this shared shape means anything learned here about probability DP applies directly to expected-value DP, and vice versa.',
      '**Where this fits in the chapter.** This lesson establishes forward probability propagation. The next lesson, Game Theory DP, looks like a very different problem on the surface (two competing players, not one random walk) but reuses the exact same interval-DP table-building discipline from Chapter 1\'s interval DP — recognizing that shared structure, rather than treating each new problem as unrelated, is the actual skill this chapter is building.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 7, Lesson 1: Expected Value DP',
        body: '**This lesson:** propagating a probability distribution forward, layer by layer, using the Knight Probability problem.\n**Next:** Game Theory DP — minimax with memoization, reusing Chapter 1\'s interval-DP structure for a two-player adversarial game.\n**Then:** a synthesis/practice lesson combining both families.',
      },
      {
        type: 'insight',
        title: 'The recurrence, stated precisely',
        body: 'dp[k][r][c] = (1/8) · Σ over the 8 knight-move offsets (dr,dc) of dp[k-1][r+dr][c+dc], counting a term as 0 whenever (r+dr, c+dc) falls off the board. dp[0][r][c] = 1 for every square.',
      },
      {
        type: 'strategy',
        title: 'Two alternating grids, not a 3D array, when only the answer matters',
        body: 'Since layer k only reads layer k-1, you never need to keep all k layers in memory at once — two n×n grids (current and previous), swapped after each move, suffice. This is the same "roll the array down to O(n) or O(1) space" instinct used for 1D DP throughout Chapter 1.',
      },
      {
        type: 'warning',
        title: 'Off-board moves contribute 0, not "undefined" — don\'t special-case them away',
        body: 'A tempting bug is to skip off-board moves entirely as if they "didn\'t happen," silently renormalizing the remaining on-board moves to sum to 1. That is wrong: an off-board move ends the knight\'s journey in failure, contributing exactly 0 probability, not a redistributed share among the valid moves. Divide by the fixed constant 8 always, regardless of how many of the 8 moves are actually on-board.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Knight Probability: Watching the Distribution Decay',
        caption: 'Watch dp[k][r][c] shrink move by move as the knight risks falling off the board.',
        props: {
          lesson: {
            title: 'Expected Value / Probability DP Step by Step',
            subtitle: 'Propagating survival probability forward, one move at a time.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Survival Probability Grid, Move by Move',
                instruction: 'For a 5x5 board, watch the survival-probability grid evolve as k increases from 0 to 3.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:12px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}.grid{display:grid;gap:2px;margin-bottom:10px}.cell{padding:4px;text-align:center;border-radius:3px;background:#1e293b}`,
                startCode: `const d = document.getElementById('d');
const n = 5;
const moves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

function step(dp) {
  const ndp = Array.from({length:n}, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let total = 0;
      for (const [dr, dc] of moves) {
        const ni = i + dr, nj = j + dc;
        if (ni >= 0 && ni < n && nj >= 0 && nj < n) total += dp[ni][nj];
      }
      ndp[i][j] = total / 8;
    }
  }
  return ndp;
}

let dp = Array.from({length:n}, () => new Array(n).fill(1));
for (let k = 0; k <= 3; k++) {
  d.innerHTML += '<div style="color:#60a5fa;margin-bottom:4px">After k=' + k + ' moves:</div>';
  d.innerHTML += '<div class="grid" style="grid-template-columns:repeat(' + n + ',1fr);max-width:320px">' +
    dp.flat().map(v => {
      const g = Math.round(v * 255);
      return '<div class="cell" style="background:rgba(74,222,128,' + v.toFixed(2) + ')">' + v.toFixed(3) + '</div>';
    }).join('') + '</div>';
  dp = step(dp);
}`,
                outputHeight: 520,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Knight Probability from Scratch',
        caption: 'Brute-force recursion first (to see WHY it explodes), then the layered DP.',
        props: {
          lesson: {
            title: 'Knight Probability in JavaScript',
            subtitle: 'From exponential recursion to O(k·n²) layered DP.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Brute-Force Recursion (No Memoization)

Implement \`knightProbabilityBrute(n, k, r, c)\`: recursively try all 8 moves at each step, summing the fraction of paths that stay on the board. Correct, but exponential — only usable for tiny k.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `const KNIGHT_MOVES = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

function knightProbabilityBrute(n, k, r, c) {
  if (k === 0) return 1;
  if (r < 0 || r >= n || c < 0 || c >= n) return 0;
  let total = 0;
  for (const [dr, dc] of KNIGHT_MOVES) {
    // TODO: total += knightProbabilityBrute(n, k - 1, r + dr, c + dc)
  }
  return total / 8;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('n=3,k=2,(0,0)', knightProbabilityBrute(3, 2, 0, 0), 0.0625);
test('n=1,k=0,(0,0)', knightProbabilityBrute(1, 0, 0, 0), 1.0);`,
                solutionCode: `const KNIGHT_MOVES = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

function knightProbabilityBrute(n, k, r, c) {
  if (k === 0) return 1;
  if (r < 0 || r >= n || c < 0 || c >= n) return 0;
  let total = 0;
  for (const [dr, dc] of KNIGHT_MOVES) {
    total += knightProbabilityBrute(n, k - 1, r + dr, c + dc);
  }
  return total / 8;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('n=3,k=2,(0,0)', knightProbabilityBrute(3, 2, 0, 0), 0.0625);
test('n=1,k=0,(0,0)', knightProbabilityBrute(1, 0, 0, 0), 1.0);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Layered DP: O(k·n²)

Implement \`knightProbabilityDP(n, k, r, c)\`: build the full n×n survival-probability grid layer by layer, from k=0 up to the target k.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `const KNIGHT_MOVES = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

function knightProbabilityDP(n, k, r, c) {
  let dp = Array.from({length: n}, () => new Array(n).fill(1));
  for (let move = 0; move < k; move++) {
    const next = Array.from({length: n}, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let total = 0;
        for (const [dr, dc] of KNIGHT_MOVES) {
          // TODO: if (i+dr, j+dc) is on the board, total += dp[i+dr][j+dc]
        }
        // TODO: next[i][j] = total / 8
      }
    }
    dp = next;
  }
  return dp[r][c];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('n=3,k=2,(0,0)', knightProbabilityDP(3, 2, 0, 0), 0.0625);
test('n=8,k=3,(0,0)', knightProbabilityDP(8, 3, 0, 0), 0.125);
test('n=5,k=3,(2,2)', knightProbabilityDP(5, 3, 2, 2), 0.25);`,
                solutionCode: `const KNIGHT_MOVES = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

function knightProbabilityDP(n, k, r, c) {
  let dp = Array.from({length: n}, () => new Array(n).fill(1));
  for (let move = 0; move < k; move++) {
    const next = Array.from({length: n}, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let total = 0;
        for (const [dr, dc] of KNIGHT_MOVES) {
          const ni = i + dr, nj = j + dc;
          if (ni >= 0 && ni < n && nj >= 0 && nj < n) total += dp[ni][nj];
        }
        next[i][j] = total / 8;
      }
    }
    dp = next;
  }
  return dp[r][c];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = Math.abs(g - e) < 1e-9;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('n=3,k=2,(0,0)', knightProbabilityDP(3, 2, 0, 0), 0.0625);
test('n=8,k=3,(0,0)', knightProbabilityDP(8, 3, 0, 0), 0.125);
test('n=5,k=3,(2,2)', knightProbabilityDP(5, 3, 2, 2), 0.25);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Expected Value / Probability DP in Python',
        caption: 'Verify against known cases, visualize the decay, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Knight Probability — Layered DP, Verified',
              code: `KNIGHT_MOVES = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]


def knight_probability(n, k, r, c):
    dp = [[1.0] * n for _ in range(n)]
    for _ in range(k):
        nxt = [[0.0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                total = 0.0
                for dr, dc in KNIGHT_MOVES:
                    ni, nj = i + dr, j + dc
                    if 0 <= ni < n and 0 <= nj < n:
                        total += dp[ni][nj]
                nxt[i][j] = total / 8
        dp = nxt
    return dp[r][c]


tests = [
    (3, 2, 0, 0, 0.0625),
    (1, 0, 0, 0, 1.0),
    (8, 3, 0, 0, 0.125),
    (5, 3, 2, 2, 0.25),
]
for n, k, r, c, expected in tests:
    result = knight_probability(n, k, r, c)
    print(f"n={n} k={k} start=({r},{c}): got={result}, expected={expected}")
    assert abs(result - expected) < 1e-9

print("All assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Survival Probability by Distance from Center',
              code: `import matplotlib.pyplot as plt

KNIGHT_MOVES = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]


def knight_probability_grid(n, k):
    dp = [[1.0] * n for _ in range(n)]
    for _ in range(k):
        nxt = [[0.0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                total = 0.0
                for dr, dc in KNIGHT_MOVES:
                    ni, nj = i + dr, j + dc
                    if 0 <= ni < n and 0 <= nj < n:
                        total += dp[ni][nj]
                nxt[i][j] = total / 8
        dp = nxt
    return dp


n = 8
fig, axes = plt.subplots(1, 4, figsize=(14, 3.5), facecolor="#0f172a")
for ax, k in zip(axes, [0, 1, 2, 4]):
    grid = knight_probability_grid(n, k)
    ax.set_facecolor("#0f172a")
    im = ax.imshow(grid, cmap="Greens", vmin=0, vmax=1)
    ax.set_title(f"k={k}", color="#e2e8f0", fontsize=11)
    ax.set_xticks([])
    ax.set_yticks([])
fig.suptitle("Survival probability spreads and decays as move count k grows (n=8)", color="#e2e8f0")
plt.tight_layout()
plt.show()
print("Center square (3,3) survival probs by k:", [round(knight_probability_grid(n, k)[3][3], 4) for k in [0,1,2,4]])
print("Corner square (0,0) survival probs by k:", [round(knight_probability_grid(n, k)[0][0], 4) for k in [0,1,2,4]])`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Knight probability on a rectangular board',
              difficulty: 'medium',
              prompt: 'Generalize the layered DP to a w×h rectangular board: knight_probability_rect(w, h, k, r, c). Fill in the update rule, checking bounds against both w and h. Uncomment the assertion once ready.',
              hint: 'Same recurrence as the square-board version, but bound checks are 0 <= ni < h and 0 <= nj < w (rows range over h, columns range over w).',
              label: 'From Scratch — Rectangular Board Knight Probability',
              code: `def knight_probability_rect(w, h, k, r, c):
    KNIGHT_MOVES = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]
    dp = [[1.0] * w for _ in range(h)]
    for _ in range(k):
        nxt = [[0.0] * w for _ in range(h)]
        for i in range(h):
            for j in range(w):
                # YOUR CODE HERE:
                # total = sum of dp[ni][nj] for each knight move landing
                # on the board (0 <= ni < h and 0 <= nj < w)
                # nxt[i][j] = total / 8
                pass
        dp = nxt
    return dp[r][c]


# --- Uncomment to test when ready ---
# result = knight_probability_rect(4, 6, 2, 1, 1)
# print(f"knight_probability_rect(4, 6, 2, 1, 1) = {result}")
# assert abs(result - 0.25) < 1e-9, f"got {result}"
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
      text: 'In the Knight Probability recurrence dp[k][r][c] = (1/8) · Σ dp[k-1][nr][nc] over on-board destinations, why is the base case dp[0][r][c] = 1 for every square?',
      options: [
        'Because every square is assumed to be a corner, which trivially has probability 1',
        'Because with zero remaining moves, the knight has not moved at all, so it trivially "survives" — this is the same trivial-base-case instinct used throughout the course (e.g., an empty interval or an empty prefix costs 0)',
        'Because the knight always starts at the center of the board, which has the highest survival probability',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A move that lands the knight off the board contributes what to the sum in dp[k][r][c]?',
      options: [
        'Exactly 0 — it is a failed branch, not an omitted one, so the division is still by the fixed constant 8, not by the count of valid on-board moves',
        'It is excluded from both the sum and the denominator, so dp[k][r][c] is renormalized over only the on-board moves',
        'It contributes dp[k-1][r][c] itself, since the knight is assumed to stay in place instead',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why can this DP be computed with two alternating n×n grids instead of storing all k layers in a 3D array?',
      options: [
        'Because n is always small enough that memory is never a concern',
        'Because layer k only ever reads layer k-1, never itself or any earlier layer — the same "roll the array down" pattern used to reduce 1D DP space throughout Chapter 1',
        'Because the knight can only make at most 2 moves in any well-posed version of this problem',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'How does expected-value DP (e.g., accumulating a score) generalize the probability-DP recurrence used here?',
      options: [
        'It does not generalize — expected value and probability DP are unrelated techniques that happen to share notation',
        'The recurrence keeps the same shape — averaging (weighting by probability) over each possible random transition — but accumulates an expected VALUE (probability × value earned + future expectation) instead of accumulating a probability of survival',
        'Expected value DP never needs a base case, unlike probability DP',
      ],
      correct: 1,
    },
  ],
};
