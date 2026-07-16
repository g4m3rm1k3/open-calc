export default {
  id: 'dp3-001',
  slug: 'bitmask-dp-fundamentals',
  chapter: 'dp3',
  order: 1,
  title: 'Bitmask DP: A Subset Is a State',
  subtitle: 'The Traveling Salesman Problem — dp[visited set][current city]',
  tags: ['dynamic programming', 'bitmask dp', 'subset dp', 'traveling salesman', 'tsp', 'bit manipulation'],
  aliases: 'bitmask dp subset state traveling salesman problem tsp held karp',

  hook: {
    question: 'A delivery driver must visit every one of 15 addresses exactly once and return to the depot, minimizing total distance. There are 14! (over 87 billion) possible orderings — brute force is hopeless. But the ENTIRE state a DP needs to remember at any point is not "the exact sequence visited so far" — it is just two things: WHICH addresses have been visited (a set, not an order) and WHERE you currently are. A set of up to 15 items has only 2^15 = 32,768 possible subsets. Representing that set as a single integer, where bit i means "city i has been visited," turns an intractable problem into a table with 32,768 x 15 cells.',
    realWorldContext: 'Bitmask DP over subsets is the standard technique (Held-Karp algorithm) for exact Traveling Salesman solutions on tens of cities — used in vehicle routing, PCB drilling paths, and DNA sequencing (finding the shortest superstring is a TSP variant). The same "subset as an integer" trick underlies assignment problems (matching workers to tasks), boolean satisfiability solvers, and any combinatorial search where "which items are used" is the only thing that matters, not the order in which they were chosen.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Representing a set as an integer.** For up to about 20-25 items, a subset can be represented as a single integer\'s binary digits: bit `i` is 1 if item `i` is in the set, 0 otherwise. The empty set is `0`. The full set of `n` items is `(1 << n) - 1` (n ones in binary). Three operations cover almost everything you need: check membership (`mask & (1 << i)`), add an item (`mask | (1 << i)`), and remove an item (`mask & ~(1 << i)`). These are single CPU instructions — this representation is not just compact, it is fast.',
      '**Why "which cities visited" is a valid DP state, but "the exact route so far" is not.** The key DP question is always "what is the minimum information needed to correctly continue?" For TSP, two different orderings that visit the SAME set of cities and end at the SAME current city are completely interchangeable for all future decisions — the future only cares about which cities remain available and where you are standing now, never how you got there. This is optimal substructure: the best completion of a partial tour depends only on (visited set, current city), not on the path taken to reach that state.',
      '**The recurrence.** `dp[mask][i]` = minimum cost to have visited exactly the cities in `mask`, ending at city `i` (where bit `i` must be set in `mask`). Base case: `dp[{0}][0] = 0` (start at city 0, having visited only city 0). Transition: `dp[mask | (1<<j)][j] = min(dp[mask][i] + dist[i][j])` for every `j` not yet in `mask`. The final answer: `min over i of (dp[full][i] + dist[i][0])` — every city visited, plus the cost to return home.',
      '**Complexity: from factorial to exponential-but-tractable.** Brute force is O(n!). Bitmask DP is O(2ⁿ × n²) — the `2ⁿ` masks, `n` choices of "current city" per mask, `n` choices of "next city" per transition. For n=15, that is about 32,768 × 225 ≈ 7.4 million operations — instantaneous, versus 14! ≈ 87 billion for brute force. This is still exponential (bitmask DP does not make TSP polynomial — it remains NP-hard), but it is the best known EXACT algorithm, and it is what makes exact solutions feasible up to roughly n=20-25 on ordinary hardware.',
      '**The general pattern beyond TSP.** Whenever a problem\'s state needs to remember "which of a bounded number of items have been used/visited/assigned" plus a small amount of extra information (like "current position"), and that bound is small (roughly n ≤ 20), bitmask DP applies: represent the used-items set as an integer, index your DP table by that integer, and iterate over which bit to flip next.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 3, Lesson 1: Bitmask DP Fundamentals',
        body: '**Previous (Chapter 2):** Tree & Graph DP — trees, DAGs, rerooting.\n**This lesson:** Bitmask DP — representing subsets as integers, the Traveling Salesman Problem.\n**Next:** The Assignment Problem — bitmask over tasks instead of cities.',
      },
      {
        type: 'insight',
        title: 'Bit tricks used constantly in bitmask DP',
        body: '`mask & (1 << i)` — is bit i set? (nonzero if yes)\n`mask | (1 << i)` — set bit i\n`mask & ~(1 << i)` — clear bit i\n`(1 << n) - 1` — the full set of n items, all bits set\n`bin(mask).count("1")` (Python) / a popcount loop (JS) — how many items are in this subset',
      },
      {
        type: 'strategy',
        title: 'How to spot a bitmask DP problem',
        body: 'Look for: (1) a bounded, small number of items (roughly n ≤ 20-25) where (2) the answer depends on WHICH items have been used, not the order, and (3) you need to track that alongside one or two other small pieces of state (like "current position"). If n could be in the thousands, bitmask DP is the wrong tool — 2ⁿ would be astronomically large.',
      },
      {
        type: 'warning',
        title: 'dp[mask][i] requires bit i to actually be set in mask',
        body: 'It is meaningless to ask "cost to have visited this set, ending at city i" if city i is not even in the set. Always initialize dp[mask][i] to infinity (or leave unreachable) unless `mask & (1 << i)` is true. Forgetting this check is the most common bitmask TSP bug — it silently allows "ending" at a city that was never actually visited.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'TSP: Watch the Subset Table Fill In',
        caption: 'Every subset of visited cities, paired with the current city, is one entry in the table.',
        props: {
          lesson: {
            title: 'Bitmask DP Step by Step',
            subtitle: 'Subsets represented as integers, filled by increasing popcount.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'Representing Subsets as Integers',
                instruction: 'For 4 cities, every subset from {} to {0,1,2,3} is a number from 0 to 15. Watch how the binary representation directly shows membership.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
let html = '<div style="color:#60a5fa;margin-bottom:8px">All 16 subsets of {city0, city1, city2, city3}:</div>';
for (let mask = 0; mask < 16; mask++) {
  const cities = [];
  for (let i = 0; i < 4; i++) if (mask & (1 << i)) cities.push(i);
  html += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px;display:flex;gap:10px">' +
    '<span style="color:#f59e0b;width:36px">' + mask + '</span>' +
    '<span style="color:#94a3b8;width:50px">' + mask.toString(2).padStart(4,'0') + '</span>' +
    '<span style="color:#4ade80">{' + cities.join(',') + '}</span></div>';
}
d.innerHTML = html;`,
                outputHeight: 380,
              },
              {
                type: 'js',
                title: 'The TSP Table Filling In',
                instruction: 'For a 4-city TSP, watch dp[mask][city] get filled. Only reachable (mask, city) combinations get a finite value — everything else stays infinity.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const dist = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
];
const n = 4;
const FULL = 1 << n;
const dp = Array.from({length: FULL}, () => new Array(n).fill(Infinity));
dp[1][0] = 0; // visited {0}, currently at city 0

for (let mask = 0; mask < FULL; mask++) {
  for (let i = 0; i < n; i++) {
    if (dp[mask][i] === Infinity) continue;
    if (!(mask & (1 << i))) continue;
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) continue;
      const newMask = mask | (1 << j);
      const newCost = dp[mask][i] + dist[i][j];
      if (newCost < dp[newMask][j]) dp[newMask][j] = newCost;
    }
  }
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">Reachable (mask, city) entries, in increasing mask order:</div>';
for (let mask = 0; mask < FULL; mask++) {
  for (let i = 0; i < n; i++) {
    if (dp[mask][i] !== Infinity) {
      html += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px">mask=' + mask.toString(2).padStart(4,'0') + '  city=' + i + '  cost=<b style="color:#4ade80">' + dp[mask][i] + '</b></div>';
    }
  }
}
const full = FULL - 1;
let answer = Infinity;
for (let i = 1; i < n; i++) answer = Math.min(answer, dp[full][i] + dist[i][0]);
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Optimal tour cost: ' + answer + '</div>';
d.innerHTML = html;`,
                outputHeight: 400,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Bitmask TSP from Scratch',
        caption: 'Subset operations, then the full Held-Karp algorithm.',
        props: {
          lesson: {
            title: 'Bitmask DP in JavaScript',
            subtitle: 'Subsets as integers, then the TSP recurrence.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Subset Operations

Implement three tiny helpers: \`hasCity(mask, i)\` (is city i in this subset?), \`addCity(mask, i)\` (return a new mask with city i added), and \`countCities(mask)\` (how many cities are in this subset?).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function hasCity(mask, i) {
  // TODO: return true if bit i is set in mask
}

function addCity(mask, i) {
  // TODO: return mask with bit i set
}

function countCities(mask) {
  let count = 0;
  // TODO: loop over all bits (0 to 31), incrementing count for each set bit
  return count;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('hasCity(0b1010, 1)', hasCity(0b1010, 1), true);
test('hasCity(0b1010, 0)', hasCity(0b1010, 0), false);
test('addCity(0b0010, 3)', addCity(0b0010, 3), 0b1010);
test('countCities(0b1011)', countCities(0b1011), 3);
test('countCities(0)', countCities(0), 0);`,
                solutionCode: `function hasCity(mask, i) {
  return (mask & (1 << i)) !== 0;
}

function addCity(mask, i) {
  return mask | (1 << i);
}

function countCities(mask) {
  let count = 0;
  for (let i = 0; i < 32; i++) {
    if (mask & (1 << i)) count++;
  }
  return count;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('hasCity(0b1010, 1)', hasCity(0b1010, 1), true);
test('hasCity(0b1010, 0)', hasCity(0b1010, 0), false);
test('addCity(0b0010, 3)', addCity(0b0010, 3), 0b1010);
test('countCities(0b1011)', countCities(0b1011), 3);
test('countCities(0)', countCities(0), 0);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Held-Karp: The Full TSP Recurrence

Implement \`tsp(dist)\`. Build the dp table exactly as shown in the visualization: \`dp[mask][i]\` = min cost to visit exactly \`mask\`, ending at city i. Transition to every unvisited city j. Finally, close the tour back to city 0.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function tsp(dist) {
  const n = dist.length;
  const FULL = 1 << n;
  const dp = Array.from({length: FULL}, () => new Array(n).fill(Infinity));
  dp[1][0] = 0;

  for (let mask = 0; mask < FULL; mask++) {
    for (let i = 0; i < n; i++) {
      if (dp[mask][i] === Infinity) continue;
      if (!(mask & (1 << i))) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue; // j already visited
        // TODO: newMask = mask | (1 << j)
        // TODO: newCost = dp[mask][i] + dist[i][j]
        // TODO: if newCost improves dp[newMask][j], update it
      }
    }
  }

  const full = FULL - 1;
  let answer = Infinity;
  for (let i = 1; i < n; i++) answer = Math.min(answer, dp[full][i] + dist[i][0]);
  return answer;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('4-city TSP', tsp([[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]]), 80);
test('Triangle (3 cities)', tsp([[0,1,2],[1,0,3],[2,3,0]]), 6);
test('2 cities (there and back)', tsp([[0,5],[5,0]]), 10);`,
                solutionCode: `function tsp(dist) {
  const n = dist.length;
  const FULL = 1 << n;
  const dp = Array.from({length: FULL}, () => new Array(n).fill(Infinity));
  dp[1][0] = 0;

  for (let mask = 0; mask < FULL; mask++) {
    for (let i = 0; i < n; i++) {
      if (dp[mask][i] === Infinity) continue;
      if (!(mask & (1 << i))) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;
        const newMask = mask | (1 << j);
        const newCost = dp[mask][i] + dist[i][j];
        if (newCost < dp[newMask][j]) dp[newMask][j] = newCost;
      }
    }
  }

  const full = FULL - 1;
  let answer = Infinity;
  for (let i = 1; i < n; i++) answer = Math.min(answer, dp[full][i] + dist[i][0]);
  return answer;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('4-city TSP', tsp([[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]]), 80);
test('Triangle (3 cities)', tsp([[0,1,2],[1,0,3],[2,3,0]]), 6);
test('2 cities (there and back)', tsp([[0,5],[5,0]]), 10);`,
                outputHeight: 200,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Bitmask DP in Python',
        caption: 'Held-Karp TSP with a heatmap of the dp table and the optimal tour path.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Held-Karp TSP — Build and Verify',
              code: `def tsp(dist):
    n = len(dist)
    full = 1 << n
    dp = [[float("inf")] * n for _ in range(full)]
    dp[1][0] = 0

    for mask in range(full):
        for i in range(n):
            if dp[mask][i] == float("inf"):
                continue
            if not (mask & (1 << i)):
                continue
            for j in range(n):
                if mask & (1 << j):
                    continue
                new_mask = mask | (1 << j)
                new_cost = dp[mask][i] + dist[i][j]
                if new_cost < dp[new_mask][j]:
                    dp[new_mask][j] = new_cost

    full_mask = full - 1
    return min(dp[full_mask][i] + dist[i][0] for i in range(1, n))


dist = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0],
]
result = tsp(dist)
print(f"Optimal TSP tour cost: {result}")
assert result == 80
print("Assertion passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: DP Table Heatmap and Optimal Tour',
              code: `import matplotlib.pyplot as plt
import numpy as np


def tsp_with_path(dist):
    n = len(dist)
    full = 1 << n
    dp = [[float("inf")] * n for _ in range(full)]
    parent = [[None] * n for _ in range(full)]
    dp[1][0] = 0

    for mask in range(full):
        for i in range(n):
            if dp[mask][i] == float("inf"):
                continue
            if not (mask & (1 << i)):
                continue
            for j in range(n):
                if mask & (1 << j):
                    continue
                new_mask = mask | (1 << j)
                new_cost = dp[mask][i] + dist[i][j]
                if new_cost < dp[new_mask][j]:
                    dp[new_mask][j] = new_cost
                    parent[new_mask][j] = i

    full_mask = full - 1
    best_cost, best_end = min((dp[full_mask][i] + dist[i][0], i) for i in range(1, len(dist)))

    # Reconstruct the path
    path = [best_end]
    mask, cur = full_mask, best_end
    while parent[mask][cur] is not None:
        prev = parent[mask][cur]
        mask ^= (1 << cur)
        cur = prev
        path.append(cur)
    path.reverse()
    return best_cost, path, dp


dist = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0],
]
cost, path, dp = tsp_with_path(dist)
print(f"Optimal cost: {cost}, tour: {' -> '.join(map(str, path + [0]))}")

fig, ax = plt.subplots(figsize=(7, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
n = len(dist)
data = np.array([[dp[mask][i] if dp[mask][i] != float("inf") else np.nan for i in range(n)] for mask in range(1 << n)])
im = ax.imshow(data, cmap="viridis", aspect="auto")
ax.set_xlabel("Current city", color="#94a3b8")
ax.set_ylabel("Visited-set mask", color="#94a3b8")
ax.set_title(f"dp[mask][city] — optimal tour: {' -> '.join(map(str, path + [0]))} (cost {cost})", color="#e2e8f0", fontsize=10)
ax.tick_params(colors="#94a3b8")
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'TSP from scratch, 5 cities',
              difficulty: 'hard',
              prompt: 'Fill in the transition loop in tsp_scratch(dist): for each reachable (mask, i), try extending to every unvisited city j, updating dp[new_mask][j] if improved. Uncomment the assertion once ready.',
              hint: 'new_mask = mask | (1 << j); new_cost = dp[mask][i] + dist[i][j]; update dp[new_mask][j] = min(dp[new_mask][j], new_cost).',
              label: 'From Scratch — 5-City TSP',
              code: `def tsp_scratch(dist):
    n = len(dist)
    full = 1 << n
    dp = [[float("inf")] * n for _ in range(full)]
    dp[1][0] = 0

    for mask in range(full):
        for i in range(n):
            if dp[mask][i] == float("inf"):
                continue
            if not (mask & (1 << i)):
                continue
            for j in range(n):
                if mask & (1 << j):
                    continue
                # YOUR CODE HERE:
                # new_mask = mask | (1 << j)
                # new_cost = dp[mask][i] + dist[i][j]
                # if new_cost < dp[new_mask][j]: dp[new_mask][j] = new_cost
                pass

    full_mask = full - 1
    return min(dp[full_mask][i] + dist[i][0] for i in range(1, n))


dist5 = [
    [0, 2, 9, 10, 7],
    [1, 0, 6, 4, 3],
    [15, 7, 0, 8, 3],
    [6, 3, 12, 0, 11],
    [9, 7, 5, 6, 0],
]

# --- Uncomment to test when ready ---
# result = tsp_scratch(dist5)
# print(f"5-city TSP optimal cost: {result}")
# assert result == 22, f"got {result}"
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
      text: 'Why can a subset of up to ~20 items be represented as a single integer for DP purposes?',
      options: [
        'Because integers in most languages happen to be exactly 20 bits',
        'Each bit position corresponds to one item — bit i is 1 if item i is in the subset, 0 otherwise — so a single integer can encode any of the 2ⁿ possible subsets of n items, and membership/add/remove become fast bitwise operations',
        'Subsets can only be represented as integers if the items are already sorted',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'In TSP\'s dp[mask][i], why is "the exact order cities were visited" NOT part of the state, even though the problem is fundamentally about finding an ordering?',
      options: [
        'The order does not matter at all for computing distances',
        'Two different visiting orders that cover the same set of cities and end at the same current city are completely interchangeable for every future decision — the future only depends on (which cities remain, where you are now), never on the specific path taken to get there. This is optimal substructure',
        'TSP does not actually require visiting cities in any particular order',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Bitmask TSP runs in O(2ⁿ × n²) instead of O(n!). Does this make TSP a polynomial-time (tractable for any size) problem?',
      options: [
        'Yes — O(2ⁿ × n²) is polynomial in n',
        'No — 2ⁿ is still exponential in n, just a MUCH smaller exponential base than n!. Bitmask DP is the best known EXACT algorithm and makes n≈20-25 tractable, but TSP remains NP-hard; it does not become polynomial-time',
        'It depends on whether the distance matrix is symmetric',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What must always be true before treating dp[mask][i] as a valid, meaningful entry?',
      options: [
        'mask must be greater than i',
        'Bit i must actually be set in mask — it is meaningless to ask "cost ending at city i" for a visited-set that does not even include city i; unchecked, this silently allows invalid states to pollute the table',
        'mask must be a power of two',
      ],
      correct: 1,
    },
  ],
};
