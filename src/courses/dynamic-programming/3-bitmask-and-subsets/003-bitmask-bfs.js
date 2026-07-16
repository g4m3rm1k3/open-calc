export default {
  id: 'dp3-003',
  slug: 'bitmask-bfs',
  chapter: 'dp3',
  order: 3,
  title: 'Bitmask BFS: Shortest Path Visiting All Nodes',
  subtitle: 'When the state needs a mask AND a position, and edges are unweighted',
  tags: ['dynamic programming', 'bitmask dp', 'bfs', 'shortest path', 'state space search'],
  aliases: 'bitmask bfs shortest path visiting all nodes state space search',

  hook: {
    question: 'A robot vacuum must visit every room in a house (rooms connect via an unweighted graph of doorways) in the fewest possible moves, starting from ANY room, not a fixed one. This is TSP-shaped (a mask of visited rooms, plus a current position), but two things differ: edges are unweighted (every move costs exactly 1), and you may start anywhere and revisit rooms freely along the way. Unweighted "fewest steps" problems are exactly what BFS solves — and BFS composes naturally with a bitmask state the same way DP does.',
    realWorldContext: 'This exact pattern (minimum moves to visit every required location, unweighted graph) models robot coverage path planning, network packet routing where a message must be acknowledged by every node, and puzzle games (collect every key, visiting rooms in a dungeon graph, in the fewest moves). It is also a staple "hard" interview problem precisely because it requires recognizing that BFS — not plain DFS or Dijkstra — is the right base algorithm once you see that all edges have equal weight.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Why this needs a mask AND a position — both, like TSP.** Unlike the Assignment Problem (where the mask alone told you everything), this problem is like TSP: two different ways to reach "the same set of visited rooms" can end at different current rooms, and that matters for future moves. So the state is `(mask, node)` — exactly TSP\'s state shape.',
      '**Why BFS instead of the DP table-fill from Lesson 1.** TSP had weighted edges of varying cost, so filling `dp[mask][i]` by increasing mask (or via any fixed order) and taking a min was necessary — there is no "first" or "closest" edge to prioritize outside the DP recurrence itself. Here, every edge costs exactly 1 step. Whenever every edge has the same weight, BFS finds the shortest path more directly than a general DP fill: BFS explores states in increasing order of "number of steps taken" automatically, because of the level-by-level nature of a queue. The FIRST time a state `(mask, node)` is reached, it is reached via the shortest possible number of steps.',
      '**The state space and the search.** Treat every `(mask, node)` pair as a node in a MUCH bigger implicit graph. Start the BFS from every single node individually (since you may start anywhere): initial states are `(1 << i, i)` for every node `i`, all at distance 0. From `(mask, node)`, for every neighbor `next` of `node`, there is an edge to `(mask | (1 << next), next)` at distance +1. The answer is the number of steps taken when the FIRST state with `mask == fullMask` is dequeued.',
      '**Why multi-source BFS (starting from every node at once) is correct and efficient.** Since the goal is "minimum moves starting from anywhere," it might seem like you would need to run BFS separately from each of the n possible starting nodes and take the best result — O(n) separate BFS runs. Instead, seed the queue with ALL n starting states at distance 0 simultaneously, in ONE BFS. Because BFS processes states in nondecreasing distance order regardless of which "source" they trace back to, this single combined run correctly finds the global minimum across all starting choices, in the same total time as one BFS.',
      '**When to reach for bitmask+BFS versus bitmask+DP.** If edges are weighted and can vary, you need the DP table-fill approach (Lesson 1\'s TSP shape), processing masks in an order that respects the recurrence\'s dependencies. If every edge costs the same (unweighted, "fewest moves/steps"), bitmask BFS is simpler to reason about and implement correctly, because BFS\'s natural level-order traversal replaces the need to carefully order mask processing.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 3, Lesson 3: Bitmask BFS',
        body: '**Previous:** Assignment Problem — bitmask over tasks, one-dimensional state.\n**This lesson:** Bitmask BFS — Shortest Path Visiting All Nodes, a mask+position state searched via BFS instead of a DP fill.\n**Next:** Broken Profile DP — domino tiling, bitmask over a sliding "frontier."',
      },
      {
        type: 'insight',
        title: 'Weighted vs. unweighted: DP fill vs. BFS',
        body: 'Weighted edges (varying cost per move) → fill a DP table in an order that respects the recurrence (TSP-style). Unweighted edges (every move costs 1) → BFS over the (mask, node) state space; the first visit to any state is automatically the shortest path to it.',
      },
      {
        type: 'strategy',
        title: 'Multi-source BFS: seed every starting option at once',
        body: 'Whenever a problem allows starting from ANY of several options and asks for the global minimum, do not loop over each starting option and run a separate search. Seed all starting states into ONE BFS queue at distance 0 simultaneously — the single combined run finds the same answer in the same time as just one BFS, not n times the work.',
      },
      {
        type: 'warning',
        title: 'The visited set must include BOTH mask and node',
        body: 'A "visited" check that only tracks `node` (ignoring which mask you arrived with) is wrong here — the same physical room can legitimately be revisited multiple times with DIFFERENT visited-sets, and each (mask, node) combination needs its own independent "have I seen this before" check. Deduplicating on `node` alone would incorrectly block revisits that are necessary to reach new rooms.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Bitmask BFS: The State Space Fills Level by Level',
        caption: 'Every (mask, node) pair is its own BFS state — watch them get discovered in nondecreasing distance order.',
        props: {
          lesson: {
            title: 'Bitmask BFS Step by Step',
            subtitle: 'A multi-source BFS over (visited-set, current-node) states.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The Graph',
                instruction: 'A 4-node graph: node 0 connects to 1, 2, and 3. Every edge costs exactly 1 step.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const graph = [[1,2,3],[0],[0],[0]];
let html = '<div style="color:#60a5fa;margin-bottom:8px">Adjacency list:</div>';
graph.forEach((neighbors, i) => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">node ' + i + ' &rarr; [' + neighbors.join(', ') + ']</div>';
});
html += '<div style="margin-top:10px;color:#94a3b8">Star shape: node 0 is the hub.</div>';
d.innerHTML = html;`,
                outputHeight: 200,
              },
              {
                type: 'js',
                title: 'Multi-Source BFS: All Starting Points at Once',
                instruction: 'Every node starts its own BFS "thread" at distance 0. Watch which (mask, node) states get discovered, level by level.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const graph = [[1,2,3],[0],[0],[0]];
const n = graph.length;
const FULL = (1 << n) - 1;

const queue = [];
const visited = new Set();
for (let i = 0; i < n; i++) {
  const state = (1 << i) * 100 + i; // encode (mask, node) as one number: mask*100+node
  queue.push({ mask: 1 << i, node: i, dist: 0 });
  visited.add(state);
}

const log = [];
let answer = -1;
let qi = 0;
while (qi < queue.length) {
  const { mask, node, dist } = queue[qi++];
  log.push({ mask, node, dist });
  if (mask === FULL) { answer = dist; break; }
  for (const next of graph[node]) {
    const newMask = mask | (1 << next);
    const key = newMask * 100 + next;
    if (!visited.has(key)) {
      visited.add(key);
      queue.push({ mask: newMask, node: next, dist: dist + 1 });
    }
  }
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">States dequeued, in BFS order:</div>';
log.forEach(e => {
  html += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px;font-size:12px">mask=' + e.mask.toString(2).padStart(4,'0') + '  node=' + e.node + '  dist=<b style="color:#4ade80">' + e.dist + '</b></div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">First time mask=FULL was reached: ' + answer + ' steps</div>';
d.innerHTML = html;`,
                outputHeight: 400,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Bitmask BFS from Scratch',
        caption: 'Multi-source BFS over (mask, node) states.',
        props: {
          lesson: {
            title: 'Bitmask BFS in JavaScript',
            subtitle: 'BFS replaces the DP table-fill when every edge costs 1.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Encode a (mask, node) State

To use a Set for "have I visited this state," combine mask and node into a single number. Implement \`encodeState(mask, node, n)\` (n is the number of nodes, used to make the encoding unambiguous).`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function encodeState(mask, node, n) {
  // TODO: return a single integer that uniquely identifies (mask, node).
  // Hint: node only ranges 0..n-1, so mask * n + node is unambiguous —
  // like reading (mask, node) as a two-digit number in base n.
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('encodeState(0b0001, 0, 4)', encodeState(0b0001, 0, 4), 4);
test('encodeState(0b0001, 1, 4)', encodeState(0b0001, 1, 4), 5);
test('Different masks give different codes', encodeState(0b0011, 0, 4) !== encodeState(0b0001, 0, 4), true);
test('Different nodes give different codes', encodeState(0b0001, 2, 4) !== encodeState(0b0001, 0, 4), true);`,
                solutionCode: `function encodeState(mask, node, n) {
  return mask * n + node;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('encodeState(0b0001, 0, 4)', encodeState(0b0001, 0, 4), 4);
test('encodeState(0b0001, 1, 4)', encodeState(0b0001, 1, 4), 5);
test('Different masks give different codes', encodeState(0b0011, 0, 4) !== encodeState(0b0001, 0, 4), true);
test('Different nodes give different codes', encodeState(0b0001, 2, 4) !== encodeState(0b0001, 0, 4), true);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Multi-Source Bitmask BFS

Implement \`shortestPathAllNodes(graph)\`. Seed the queue with every node as its own starting state at distance 0, then BFS over (mask, node) states until mask becomes the full set.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function shortestPathAllNodes(graph) {
  const n = graph.length;
  const FULL = (1 << n) - 1;
  const visited = new Set();
  const queue = [];

  // TODO: seed the queue with { mask: 1 << i, node: i, dist: 0 } for every node i,
  //       marking each corresponding state as visited

  let qi = 0;
  while (qi < queue.length) {
    const { mask, node, dist } = queue[qi++];
    if (mask === FULL) return dist;
    for (const next of graph[node]) {
      // TODO: compute newMask, encode the (newMask, next) state,
      //       and if unvisited, mark it visited and enqueue it at dist + 1
    }
  }
  return -1;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Star graph', shortestPathAllNodes([[1,2,3],[0],[0],[0]]), 4);
test('5-node graph', shortestPathAllNodes([[1],[0,2,4],[1,3,4],[2],[1,2]]), 4);
test('Single node', shortestPathAllNodes([[]]), 0);
test('Two connected nodes', shortestPathAllNodes([[1],[0]]), 1);`,
                solutionCode: `function shortestPathAllNodes(graph) {
  const n = graph.length;
  const FULL = (1 << n) - 1;
  const visited = new Set();
  const queue = [];

  for (let i = 0; i < n; i++) {
    queue.push({ mask: 1 << i, node: i, dist: 0 });
    visited.add((1 << i) * n + i);
  }

  let qi = 0;
  while (qi < queue.length) {
    const { mask, node, dist } = queue[qi++];
    if (mask === FULL) return dist;
    for (const next of graph[node]) {
      const newMask = mask | (1 << next);
      const key = newMask * n + next;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ mask: newMask, node: next, dist: dist + 1 });
      }
    }
  }
  return -1;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Star graph', shortestPathAllNodes([[1,2,3],[0],[0],[0]]), 4);
test('5-node graph', shortestPathAllNodes([[1],[0,2,4],[1,3,4],[2],[1,2]]), 4);
test('Single node', shortestPathAllNodes([[]]), 0);
test('Two connected nodes', shortestPathAllNodes([[1],[0]]), 1);`,
                outputHeight: 200,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Bitmask BFS in Python',
        caption: 'Multi-source BFS with a visualization of the state space explored.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Shortest Path Visiting All Nodes — Build and Verify',
              code: `from collections import deque


def shortest_path_all_nodes(graph):
    n = len(graph)
    full = (1 << n) - 1
    queue = deque()
    visited = set()
    for i in range(n):
        state = (1 << i, i)
        queue.append((state, 0))
        visited.add(state)

    while queue:
        (mask, node), steps = queue.popleft()
        if mask == full:
            return steps
        for nxt in graph[node]:
            new_mask = mask | (1 << nxt)
            new_state = (new_mask, nxt)
            if new_state not in visited:
                visited.add(new_state)
                queue.append((new_state, steps + 1))
    return -1


graph1 = [[1, 2, 3], [0], [0], [0]]
graph2 = [[1], [0, 2, 4], [1, 3, 4], [2], [1, 2]]

result1 = shortest_path_all_nodes(graph1)
result2 = shortest_path_all_nodes(graph2)
print(f"Star graph: {result1} steps")
print(f"5-node graph: {result2} steps")
assert result1 == 4
assert result2 == 4
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: State Space Growth by BFS Level',
              code: `import matplotlib.pyplot as plt
from collections import deque


def bfs_with_levels(graph):
    n = len(graph)
    full = (1 << n) - 1
    queue = deque()
    visited = set()
    level_counts = {}
    for i in range(n):
        state = (1 << i, i)
        queue.append((state, 0))
        visited.add(state)
        level_counts[0] = level_counts.get(0, 0) + 1

    answer = None
    while queue:
        (mask, node), steps = queue.popleft()
        if mask == full and answer is None:
            answer = steps
        for nxt in graph[node]:
            new_mask = mask | (1 << nxt)
            new_state = (new_mask, nxt)
            if new_state not in visited:
                visited.add(new_state)
                queue.append((new_state, steps + 1))
                level_counts[steps + 1] = level_counts.get(steps + 1, 0) + 1
    return answer, level_counts


graph2 = [[1], [0, 2, 4], [1, 3, 4], [2], [1, 2]]
answer, level_counts = bfs_with_levels(graph2)
print(f"Answer: {answer} steps")
print(f"New states discovered per BFS level: {level_counts}")

fig, ax = plt.subplots(figsize=(7, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
levels = sorted(level_counts.keys())
counts = [level_counts[l] for l in levels]
colors = ["#4ade80" if l == answer else "#3b82f6" for l in levels]
ax.bar([str(l) for l in levels], counts, color=colors)
ax.set_xlabel("BFS level (steps taken)", color="#94a3b8")
ax.set_ylabel("New (mask, node) states discovered", color="#94a3b8")
ax.set_title(f"Green level = when mask first became FULL (answer = {answer})", color="#e2e8f0", fontsize=11)
ax.tick_params(colors="#94a3b8")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Bitmask BFS on a 6-node graph',
              difficulty: 'medium',
              prompt: 'Fill in shortest_path_scratch(graph): seed the queue with every node as a starting state, then BFS over (mask, node) pairs. Uncomment the assertion once ready.',
              hint: 'Seed: for i in range(n): queue.append(((1 << i, i), 0)); visited.add((1 << i, i)). Transition: new_mask = mask | (1 << nxt); if (new_mask, nxt) not in visited: add it and enqueue at steps + 1.',
              label: 'From Scratch — 6-Node Graph',
              code: `from collections import deque


def shortest_path_scratch(graph):
    n = len(graph)
    full = (1 << n) - 1
    queue = deque()
    visited = set()

    # YOUR CODE HERE: seed the queue with every node as a starting state at 0 steps

    while queue:
        (mask, node), steps = queue.popleft()
        if mask == full:
            return steps
        for nxt in graph[node]:
            # YOUR CODE HERE: compute new_mask, check/mark visited, enqueue at steps + 1
            pass
    return -1


# A 6-node graph shaped like two triangles joined by a bridge: 0-1-2-0, 2-3, 3-4-5-3
graph6 = [[1, 2], [0, 2], [0, 1, 3], [2, 4, 5], [3, 5], [3, 4]]

# --- Uncomment to test when ready ---
# result = shortest_path_scratch(graph6)
# print(f"6-node graph: {result} steps")
# assert result == 5, f"got {result}"
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
      text: 'Why does Shortest Path Visiting All Nodes need BOTH a mask and a current-node dimension, unlike the Assignment Problem?',
      options: [
        'It does not — a mask alone would be sufficient here too',
        'Like TSP (and unlike Assignment), you may start anywhere and the order of visits is not fixed — two different ways of reaching the same visited-set can end at different current nodes, and that matters for which moves are available next',
        'Because the graph in this problem always has more nodes than the Assignment Problem',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is BFS the right base algorithm here instead of the DP table-fill approach used for TSP?',
      options: [
        'BFS is always better than DP, regardless of the problem',
        'Every edge costs exactly 1 step (unweighted) — BFS naturally explores states in nondecreasing distance order via its queue, so the first time any (mask, node) state is reached is guaranteed to be via the shortest path. TSP needed weighted-edge DP because costs varied and no simple traversal order would guarantee correctness',
        'BFS uses less memory than DP for any bitmask problem',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does seeding the BFS queue with ALL n nodes as starting states (each at distance 0) correctly solve "minimum moves starting from anywhere," instead of requiring n separate BFS runs?',
      options: [
        'It does not — this only works by coincidence for small graphs',
        'BFS processes states in nondecreasing distance order regardless of which starting node a state traces back to, so a single combined run correctly finds the global minimum across all n possible starting choices, in the same total time as one ordinary BFS',
        'Because all nodes in these graphs are always equidistant from each other',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why must the "visited" check track (mask, node) together, rather than just node?',
      options: [
        'Tracking just node would be more efficient and give the same correct answer',
        'The same physical node can legitimately be revisited multiple times with genuinely different visited-sets attached — deduplicating on node alone would incorrectly block a revisit that is necessary to later reach new, still-unvisited nodes',
        'Because node alone is not a valid array index in most languages',
      ],
      correct: 1,
    },
  ],
};
