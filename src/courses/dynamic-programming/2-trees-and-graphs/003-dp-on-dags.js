export default {
  id: 'dp2-003',
  slug: 'dp-on-dags',
  chapter: 'dp2',
  order: 3,
  title: 'DP on DAGs: Topological Order as a DP Sequence',
  subtitle: 'Longest Increasing Path in a Matrix, and critical-path scheduling',
  tags: ['dynamic programming', 'dag', 'topological sort', 'memoized dfs', 'longest path', 'critical path'],
  aliases: 'dp on dag topological order longest increasing path critical path method',

  hook: {
    question: 'A build system has tasks with dependencies: compile the core library before the app, compile the app before linking, link before packaging. Some tasks can run in parallel; others must wait. What is the minimum total time to finish everything, given the dependency graph? This is not a tree (a task can depend on more than one predecessor) and not a simple array (there is no single "index i-1"). It is a Directed Acyclic Graph — and topological order turns out to be exactly the "already-solved subproblems" order that 1D DP needed a sorted index for.',
    realWorldContext: 'DP on DAGs is the mathematical foundation of the Critical Path Method (CPM), used in every project-scheduling tool (Microsoft Project, Gantt charts, construction timelines) to find the minimum possible project duration and identify which tasks, if delayed, delay the whole project. Build systems (Make, Bazel, npm scripts) use the same DAG structure to decide what can build in parallel. Spreadsheet engines evaluate formula dependency graphs the same way — cell B2 cannot be computed until every cell it references is computed.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Why 1D array DP secretly relies on a DAG.** House Robber\'s `dp[i]` depends on `dp[i-1]` and `dp[i-2]` — think of each index as a node, with edges pointing from `i-1` to `i` and from `i-2` to `i`. This is a DAG (a path graph, specifically), and iterating `i` from 0 to n-1 is walking it in topological order: every predecessor of `i` is guaranteed already computed by the time you reach `i`. Tree DP\'s post-order traversal is the same idea, specialized to a tree-shaped DAG. The general principle: **DP is possible whenever the subproblem dependency structure is a DAG, and the fill order must be a topological order of that DAG.**',
      '**Longest Increasing Path in a Matrix.** Given a grid of numbers, find the longest path where each step moves to an adjacent cell with a strictly greater value. Build the DAG explicitly: a directed edge from cell A to cell B exists if B is adjacent to A and `B > A`. Because values strictly increase along any edge, this graph cannot have a cycle (a cycle would require a value to be greater than itself). `dp[r][c]` = the longest increasing path STARTING at `(r,c)`. The recurrence: `dp[r][c] = 1 + max(dp[neighbor] for every neighbor with greater value)`, with `dp[r][c] = 1` if no neighbor has a greater value (a "sink" in the DAG).',
      '**Two equivalent ways to guarantee correct order.** You could explicitly topologically sort every cell by value (ascending) and fill `dp` in that order — largest values first, since they have no outgoing edges to rely on. Or, simpler in practice: memoized DFS. `dfs(r, c)` recurses into every greater neighbor first, caches its own answer once computed, and returns it. Because the graph has no cycles, this recursion is guaranteed to terminate — there is no way to revisit a cell through its own call stack, since that would require a decreasing-then-increasing loop back to a smaller-or-equal value, which no edge allows.',
      '**Critical Path Method.** Model each task as a node, each dependency as a directed edge weighted by duration. `dp[v]` = the earliest time task `v` can finish, computed as `max(dp[u] + duration(edge u→v))` over every prerequisite `u`. Processing nodes in topological order (using Kahn\'s algorithm: repeatedly remove nodes with no remaining unprocessed prerequisites) guarantees every `dp[u]` is final before it is used to compute `dp[v]`. The overall project duration is `max(dp[v])` over every node — and the *critical path* is the specific chain of tasks that achieves that maximum, the one sequence with zero slack.',
      '**Why this generalizes both previous lessons.** Array DP is a DAG that happens to be a simple path. Tree DP is a DAG that happens to be a tree (each node has exactly one path in from the root). General DAG DP drops both restrictions — a node can have multiple incoming edges from genuinely different predecessors (unlike a tree, where a node has only one parent) — and the only requirement left is "no cycles," which is exactly what guarantees a valid processing order exists at all.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 2, Lesson 3: DP on DAGs',
        body: '**Previous:** General Tree DP — N-ary independent set, diameter.\n**This lesson:** DP on DAGs — Longest Increasing Path, Critical Path Method, topological order as a DP sequence.\n**Next:** Rerooting — computing an answer for every possible root in O(n) total instead of O(n²).',
      },
      {
        type: 'insight',
        title: 'The universal DP requirement, stated precisely',
        body: 'Every DP problem\'s subproblems form a DAG (an edge from subproblem A to B means "B\'s answer needs A\'s answer"). A DP is valid exactly when you process nodes in a topological order of that DAG — increasing index (1D), post-order (trees), Kahn\'s algorithm or memoized DFS (general DAGs). If you ever process a subproblem before one of its dependencies, the DP is wrong, not just slow.',
      },
      {
        type: 'strategy',
        title: 'Memoized DFS vs explicit topological sort',
        body: 'Both give correct results on a DAG. Memoized DFS ("top-down") is often less code — you write the recurrence exactly as stated and let recursion discover the order for you. Explicit topological sort ("bottom-up") avoids recursion-depth limits and makes the processing order visible and debuggable. For Longest Increasing Path specifically, memoized DFS is standard; for scheduling problems, Kahn\'s algorithm (explicit topological sort) is standard because you often need the order itself, not just the final answers.',
      },
      {
        type: 'warning',
        title: 'A DAG requirement, not a graph requirement',
        body: 'This entire pattern breaks on a graph with cycles — there is no valid topological order, and "the answer for A needs B, which needs A" has no well-defined base case. Longest Increasing Path is only DP-able because strictly-increasing edges cannot form a cycle. If a problem allows equal values to connect (non-strict), check whether cycles become possible before assuming the same recurrence works.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Longest Increasing Path: The Matrix as a DAG',
        caption: 'Every cell points to its greater neighbors — watch the memoized DFS fill in answers only once per cell.',
        props: {
          lesson: {
            title: 'DP on DAGs Step by Step',
            subtitle: 'A grid, reframed as a directed acyclic graph.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The Matrix',
                instruction: 'A 3x3 grid of values. An edge exists from a cell to any adjacent cell with a strictly greater value.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const matrix = [[9,9,4],[6,6,8],[2,1,1]];
let html = '<div style="color:#60a5fa;margin-bottom:8px">Matrix:</div><table style="border-collapse:collapse">';
matrix.forEach(row => {
  html += '<tr>';
  row.forEach(v => { html += '<td style="border:1px solid #334155;padding:8px 14px;text-align:center;color:#4ade80;font-weight:bold">' + v + '</td>'; });
  html += '</tr>';
});
html += '</table>';
d.innerHTML = html;`,
                outputHeight: 180,
              },
              {
                type: 'js',
                title: 'Memoized DFS: Each Cell Computed Once',
                instruction: 'Watch dp[r][c] get filled the first time each cell is visited. Later visits (through a different path) return the cached value instantly.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const matrix = [[9,9,4],[6,6,8],[2,1,1]];
const rows = matrix.length, cols = matrix[0].length;
const memo = Array.from({length: rows}, () => Array(cols).fill(0));
const log = [];

function dfs(r, c) {
  if (memo[r][c]) return memo[r][c];
  let best = 1;
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
      best = Math.max(best, 1 + dfs(nr, nc));
    }
  }
  memo[r][c] = best;
  log.push({ r, c, val: matrix[r][c], dp: best });
  return best;
}

let answer = 0;
for (let r = 0; r < rows; r++)
  for (let c = 0; c < cols; c++)
    answer = Math.max(answer, dfs(r, c));

let html = '<div style="color:#60a5fa;margin-bottom:8px">Computation order (first-time visits only):</div>';
log.forEach(entry => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">(' + entry.r + ',' + entry.c + ') val=' + entry.val + '  dp=<b style="color:#4ade80">' + entry.dp + '</b></div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Longest increasing path: ' + answer + '</div>';
d.innerHTML = html;`,
                outputHeight: 340,
              },
              {
                type: 'js',
                title: 'Critical Path: A Small Build System',
                instruction: 'Tasks with durations and dependencies. dp[v] = earliest finish time, computed in topological order.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const names = ['compile-core', 'compile-app', 'compile-tests', 'link', 'package'];
const edges = [[0,1,3],[0,2,3],[1,3,2],[2,3,4],[3,4,2]]; // [from, to, duration of "from"]

const n = names.length;
const adj = Array.from({length:n}, () => []);
const indegree = new Array(n).fill(0);
edges.forEach(([u,v,w]) => { adj[u].push([v,w]); indegree[v]++; });

const order = [];
const queue = [];
const indeg = [...indegree];
for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);
while (queue.length) {
  const u = queue.shift();
  order.push(u);
  for (const [v] of adj[u]) { indeg[v]--; if (indeg[v] === 0) queue.push(v); }
}

const dist = new Array(n).fill(0);
for (const u of order) {
  for (const [v, w] of adj[u]) {
    dist[v] = Math.max(dist[v], dist[u] + w);
  }
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">Topological order: ' + order.map(i => names[i]).join(' -> ') + '</div>';
html += '<div style="margin-top:8px">';
names.forEach((name, i) => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">' + name + ': earliest finish = <b style="color:#4ade80">' + dist[i] + '</b></div>';
});
html += '</div>';
html += '<div style="margin-top:10px;background:#172554;border-radius:6px;padding:8px 12px;color:#93c5fd">Total project duration = ' + Math.max(...dist) + '</div>';
d.innerHTML = html;`,
                outputHeight: 340,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build DAG DP from Scratch',
        caption: 'Longest Increasing Path, then a topological-order critical path calculation.',
        props: {
          lesson: {
            title: 'DAG DP in JavaScript',
            subtitle: 'Memoized DFS and Kahn\'s algorithm.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Longest Increasing Path (Memoized DFS)

Implement \`longestIncreasingPath(matrix)\`. For each cell, recurse into every strictly-greater neighbor, take the best, add 1, and cache the result so no cell is ever recomputed.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function longestIncreasingPath(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const memo = Array.from({length: rows}, () => Array(cols).fill(0));

  function dfs(r, c) {
    if (memo[r][c]) return memo[r][c];
    let best = 1;
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      // TODO: if (nr, nc) is in bounds AND matrix[nr][nc] > matrix[r][c]:
      //   best = max(best, 1 + dfs(nr, nc))
    }
    memo[r][c] = best;
    return best;
  }

  let answer = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      answer = Math.max(answer, dfs(r, c));
  return answer;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Example 1', longestIncreasingPath([[9,9,4],[6,6,8],[2,1,1]]), 4);
test('Example 2', longestIncreasingPath([[3,4,5],[3,2,6],[2,2,1]]), 4);
test('Single cell', longestIncreasingPath([[5]]), 1);
test('All equal (no valid step)', longestIncreasingPath([[7,7],[7,7]]), 1);`,
                solutionCode: `function longestIncreasingPath(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const memo = Array.from({length: rows}, () => Array(cols).fill(0));

  function dfs(r, c) {
    if (memo[r][c]) return memo[r][c];
    let best = 1;
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
        best = Math.max(best, 1 + dfs(nr, nc));
      }
    }
    memo[r][c] = best;
    return best;
  }

  let answer = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      answer = Math.max(answer, dfs(r, c));
  return answer;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Example 1', longestIncreasingPath([[9,9,4],[6,6,8],[2,1,1]]), 4);
test('Example 2', longestIncreasingPath([[3,4,5],[3,2,6],[2,2,1]]), 4);
test('Single cell', longestIncreasingPath([[5]]), 1);
test('All equal (no valid step)', longestIncreasingPath([[7,7],[7,7]]), 1);`,
                outputHeight: 200,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Critical Path via Topological Order

Implement \`criticalPathLength(n, edges)\` where \`edges\` is a list of \`[from, to, duration]\`. Use Kahn's algorithm to get a topological order, then sweep through it computing each node's earliest-finish time.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function criticalPathLength(n, edges) {
  const adj = Array.from({length: n}, () => []);
  const indegree = new Array(n).fill(0);
  edges.forEach(([u, v, w]) => { adj[u].push([v, w]); indegree[v]++; });

  const order = [];
  const queue = [];
  const indeg = [...indegree];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const [v] of adj[u]) { indeg[v]--; if (indeg[v] === 0) queue.push(v); }
  }

  const dist = new Array(n).fill(0);
  for (const u of order) {
    for (const [v, w] of adj[u]) {
      // TODO: dist[v] = max(dist[v], dist[u] + w)
    }
  }
  return Math.max(...dist);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

// compile-core(3) -> compile-app(2) -> link(1); compile-core -> compile-tests(4) -> link; link -> package(2)
test('Build system critical path', criticalPathLength(5, [[0,1,3],[0,2,3],[1,3,2],[2,3,4],[3,4,2]]), 9);
test('Simple chain', criticalPathLength(3, [[0,1,5],[1,2,5]]), 10);
test('Single task, no edges', criticalPathLength(1, []), 0);`,
                solutionCode: `function criticalPathLength(n, edges) {
  const adj = Array.from({length: n}, () => []);
  const indegree = new Array(n).fill(0);
  edges.forEach(([u, v, w]) => { adj[u].push([v, w]); indegree[v]++; });

  const order = [];
  const queue = [];
  const indeg = [...indegree];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const [v] of adj[u]) { indeg[v]--; if (indeg[v] === 0) queue.push(v); }
  }

  const dist = new Array(n).fill(0);
  for (const u of order) {
    for (const [v, w] of adj[u]) {
      dist[v] = Math.max(dist[v], dist[u] + w);
    }
  }
  return Math.max(...dist);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Build system critical path', criticalPathLength(5, [[0,1,3],[0,2,3],[1,3,2],[2,3,4],[3,4,2]]), 9);
test('Simple chain', criticalPathLength(3, [[0,1,5],[1,2,5]]), 10);
test('Single task, no edges', criticalPathLength(1, []), 0);`,
                outputHeight: 200,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'DP on DAGs in Python',
        caption: 'Longest Increasing Path with a heatmap, then critical path scheduling.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Longest Increasing Path — Build and Visualize',
              code: `import matplotlib.pyplot as plt
import numpy as np


def longest_increasing_path(matrix):
    rows, cols = len(matrix), len(matrix[0])
    memo = [[0] * cols for _ in range(rows)]

    def dfs(r, c):
        if memo[r][c]:
            return memo[r][c]
        best = 1
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        memo[r][c] = best
        return best

    answer = max(dfs(r, c) for r in range(rows) for c in range(cols))
    return answer, memo


matrix1 = [[9, 9, 4], [6, 6, 8], [2, 1, 1]]
answer, memo = longest_increasing_path(matrix1)
print(f"Longest increasing path: {answer}")
assert answer == 4
print("Assertion passed!")

fig, axes = plt.subplots(1, 2, figsize=(9, 4), facecolor="#0f172a")
for ax in axes:
    ax.set_facecolor("#0f172a")

axes[0].imshow(np.array(matrix1), cmap="Blues", aspect="auto")
axes[0].set_title("Matrix values", color="#e2e8f0")
for r in range(len(matrix1)):
    for c in range(len(matrix1[0])):
        axes[0].text(c, r, str(matrix1[r][c]), ha="center", va="center", color="white", fontsize=12)

axes[1].imshow(np.array(memo), cmap="Greens", aspect="auto")
axes[1].set_title("dp[r][c] = longest path from here", color="#e2e8f0")
for r in range(len(memo)):
    for c in range(len(memo[0])):
        axes[1].text(c, r, str(memo[r][c]), ha="center", va="center", color="white", fontsize=12)

for ax in axes:
    ax.set_xticks([]); ax.set_yticks([])
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Critical Path — Gantt-Style Visualization',
              code: `import matplotlib.pyplot as plt


def critical_path(n, edges, names):
    from collections import deque
    adj = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v, w in edges:
        adj[u].append((v, w))
        indegree[v] += 1

    order = []
    q = deque(i for i in range(n) if indegree[i] == 0)
    indeg = indegree[:]
    while q:
        u = q.popleft()
        order.append(u)
        for v, w in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)

    start = [0] * n
    duration = [0] * n
    for u, v, w in edges:
        duration[u] = w  # duration attached to the FROM node (task takes w to complete)
    for u in order:
        for v, w in adj[u]:
            start[v] = max(start[v], start[u] + w)
    return start, duration, order


names = ["compile-core", "compile-app", "compile-tests", "link", "package"]
edges = [(0, 1, 3), (0, 2, 3), (1, 3, 2), (2, 3, 4), (3, 4, 2)]
start, duration, order = critical_path(5, edges, names)

print("Topological order:", [names[i] for i in order])
for i, name in enumerate(names):
    print(f"  {name}: starts at {start[i]}, duration {duration[i]}, finishes at {start[i] + duration[i]}")
print(f"Total project duration: {max(s + d for s, d in zip(start, duration))}")

fig, ax = plt.subplots(figsize=(8, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#4ade80", "#f87171"]
for i, name in enumerate(names):
    ax.barh(name, duration[i], left=start[i], color=colors[i % len(colors)])
    ax.text(start[i] + duration[i] / 2, i, f"{duration[i]}", ha="center", va="center", color="white", fontweight="bold")
ax.set_xlabel("Time", color="#94a3b8")
ax.tick_params(colors="#94a3b8")
ax.set_title("Build Schedule (Gantt view)", color="#e2e8f0")
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Longest Path in a General Weighted DAG',
              difficulty: 'medium',
              prompt: 'Fill in longest_path_dag(n, edges): use the topological order (already computed for you via Kahn\'s algorithm) to fill dist[] so that dist[v] ends up as the longest path ending at v. Uncomment the assertions once ready.',
              hint: 'For each u in topological order, relax every outgoing edge: dist[v] = max(dist[v], dist[u] + weight).',
              label: 'From Scratch — Longest Path in a Weighted DAG',
              code: `from collections import deque


def longest_path_dag(n, edges):
    adj = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v, w in edges:
        adj[u].append((v, w))
        indegree[v] += 1

    order = []
    q = deque(i for i in range(n) if indegree[i] == 0)
    indeg = indegree[:]
    while q:
        u = q.popleft()
        order.append(u)
        for v, w in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)

    dist = [0] * n
    for u in order:
        for v, w in adj[u]:
            # YOUR CODE HERE: dist[v] = max(dist[v], dist[u] + w)
            pass
    return dist


# --- Uncomment to test when ready ---
# result = longest_path_dag(5, [(0,1,3), (0,2,3), (1,3,2), (2,3,4), (3,4,2)])
# assert result == [0, 3, 3, 7, 9], f"got {result}"
# print("Longest distances:", result)
# print("Critical path length:", max(result))
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
      text: 'Why is a valid topological order guaranteed to exist for the "cells with strictly increasing values" graph in Longest Increasing Path?',
      options: [
        'It is not guaranteed — the algorithm just happens to work on small grids',
        'A cycle would require following a sequence of strictly-increasing edges back to a starting value — impossible, since values would have to be simultaneously greater than and equal to themselves. No cycles means a topological order (and therefore a valid DP fill order) always exists',
        'Topological order only matters for graphs with negative weights',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What is the general requirement for a set of subproblems to be solvable by DP (i.e., generalizing both array DP and tree DP)?',
      options: [
        'The subproblems must form an array, since arrays are the only structure with a well-defined "previous" element',
        'The subproblem dependency structure (an edge from A to B whenever B\'s answer needs A\'s answer) must be a DAG — array DP and tree DP are both special cases where that DAG happens to be a simple path or a tree, respectively',
        'DP only works on binary trees; general DAGs require a completely different technique',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'In the Critical Path Method, what does the "critical path" specifically represent?',
      options: [
        'The path with the fewest number of tasks',
        'The specific chain of tasks achieving the maximum total duration — the one sequence with zero slack, meaning any delay to a task on this path delays the entire project',
        'The path that uses the most resources simultaneously',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Memoized DFS and explicit topological sort (Kahn\'s algorithm) both correctly solve DAG DP problems. What is a practical reason to prefer explicit topological sort for a scheduling problem specifically?',
      options: [
        'Explicit topological sort is always asymptotically faster',
        'Scheduling problems often need the order itself (to display a schedule or Gantt chart), not just the final computed values — Kahn\'s algorithm produces that order directly as a byproduct, while memoized DFS only produces the final answers',
        'Memoized DFS cannot handle weighted edges',
      ],
      correct: 1,
    },
  ],
};
