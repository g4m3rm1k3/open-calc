export default {
  id: 'dp2-004',
  slug: 'rerooting-technique',
  chapter: 'dp2',
  order: 4,
  title: 'Rerooting: Answering "For Every Possible Root" in O(n)',
  subtitle: 'Sum of Distances in Tree — two DFS passes instead of one per node',
  tags: ['dynamic programming', 'tree dp', 'rerooting', 'sum of distances', 'two-pass dfs'],
  aliases: 'rerooting technique reroot dp sum of distances in tree second dfs',

  hook: {
    question: 'A company wants to place a single shared server somewhere in its office network (modeled as a tree of rooms and hallways) to minimize the total cable distance to every other room. The obvious approach: for each candidate room, run a DFS measuring distance to every other room, and keep the best — O(n) work per candidate, O(n²) total. For a network with 100,000 rooms, that is 10 billion operations. Rerooting solves the entire problem, for every possible root simultaneously, in O(n) total — using the answer for one root to derive the answer for its neighbor in O(1).',
    realWorldContext: 'Sum of Distances in Tree is the mathematical core of facility-location problems: placing a server, warehouse, or cache to minimize total network latency or shipping distance. Network engineers use rerooting-style analysis to find the best root for a spanning tree. Phylogenetic tree software uses the same technique to compute "the most central species" in an evolutionary tree without recomputing pairwise distances from scratch for every candidate.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Restating the problem.** Given an unrooted tree, compute, for every single node v, the sum of distances from v to every other node. A brute-force DFS from each of the n nodes costs O(n) each, O(n²) total. Rerooting computes all n answers in O(n) total — a genuine algorithmic technique, not just a constant-factor speedup.',
      '**Pass 1: root arbitrarily, gather bottom-up.** Pick any node (say, node 0) as a temporary root. Run a post-order DFS computing two things per node: `subtreeSize[v]` (the count of nodes in v\'s subtree, including v itself) and `distSum[v]` — but for now, `distSum[0]` (the true root) is the only fully correct value; the other `distSum[v]` values computed during this pass are just "sum of distances from v to nodes in v\'s OWN subtree," a partial answer. The recurrence: `distSum[v] = Σ(distSum[child] + subtreeSize[child])` — each node in a child\'s subtree is one edge farther from v than it was from that child.',
      '**Pass 2: reroot top-down, using the parent\'s FINAL answer.** Once `distSum[0]` is the true, complete answer (root has no "outside its subtree" to worry about — everything is in its subtree), walk back DOWN the tree. For each edge from a node `u` (whose true answer is already known) to a child `v`: moving the "center" from `u` to `v` makes every node in `v`\'s subtree exactly one edge CLOSER (there are `subtreeSize[v]` such nodes), and every other node in the tree exactly one edge FARTHER (there are `n - subtreeSize[v]` such nodes). So `distSum[v] = distSum[u] - subtreeSize[v] + (n - subtreeSize[v])`. This is an O(1) update per edge — the entire second pass is O(n) total.',
      '**Why this is a genuinely different shape from Lessons 1-3.** House Robber III and diameter each compute one thing about the WHOLE tree using one DFS. Rerooting computes a DIFFERENT, complete answer FOR EVERY NODE, and the trick is that pass 2 never "looks around" — it derives each node\'s answer purely from its immediate parent\'s already-finalized answer plus O(1) local bookkeeping (`subtreeSize`, computed once in pass 1). This is dynamic programming across a "for every possible root" family of problems, not dynamic programming on the tree itself.',
      '**Recognizing when rerooting applies.** The signal: "compute X for every node as if it were the root/center," where recomputing from scratch per node would be O(n) each. Rerooting applies whenever the quantity can be updated in O(1) when moving the root across a single edge — which is true whenever the quantity decomposes additively over "distance from root," like a sum of distances, a sum of depths, or a count weighted by depth.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 2, Lesson 4: Rerooting',
        body: '**Previous:** DP on DAGs — topological order, Longest Increasing Path, Critical Path Method.\n**This lesson:** Rerooting — Sum of Distances in Tree, two-pass DFS.\n**Next chapter:** Bitmask DP — subsets as state, the Traveling Salesman Problem.',
      },
      {
        type: 'insight',
        title: 'Two passes, two different jobs',
        body: '**Pass 1 (post-order, bottom-up):** compute subtreeSize for every node, and the TRUE answer for the arbitrary root only.\n**Pass 2 (pre-order, top-down):** propagate from each node\'s true answer to its children\'s true answers, in O(1) per edge, using only subtreeSize and n.',
      },
      {
        type: 'strategy',
        title: 'The O(1) reroot formula, derived',
        body: 'Moving the root from u to its child v: the subtreeSize[v] nodes "under" v (from u\'s perspective) each get one edge closer. The remaining n - subtreeSize[v] nodes (everything else in the tree) each get one edge farther. `distSum[v] = distSum[u] - subtreeSize[v] + (n - subtreeSize[v])`. Memorize the DERIVATION, not just the formula — it transfers to other rerooting problems with a different "what changes when the root moves one edge" rule.',
      },
      {
        type: 'warning',
        title: 'subtreeSize is relative to the ARBITRARY first root, not the current one',
        body: '`subtreeSize[v]` is computed once, in pass 1, relative to the original arbitrary root — it does NOT get recomputed as pass 2 conceptually "moves" the root. This is intentional: subtreeSize[v] always means "how many nodes are on the far side of the edge (parent(v), v), away from the original root" — a fixed structural fact about the tree, independent of which node you are currently treating as the center.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Rerooting: Watch Both Passes',
        caption: 'First pass computes subtree sizes and one true answer. Second pass derives every other answer in O(1) each.',
        props: {
          lesson: {
            title: 'Rerooting Step by Step',
            subtitle: 'Two DFS passes replace n separate DFS runs.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The Tree',
                instruction: 'A small 6-node tree. Node 0 is chosen as the arbitrary starting root purely for pass 1 — the final answer will not depend on this choice.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const edges = [[0,1],[0,2],[2,3],[2,4],[2,5]];
let html = '<div style="color:#60a5fa;margin-bottom:8px">Edges:</div>';
edges.forEach(([a,b]) => {
  html += '<span style="display:inline-block;padding:4px 10px;background:#1e293b;border-radius:4px;margin:0 6px 6px 0">' + a + ' — ' + b + '</span>';
});
html += '<div style="margin-top:10px;color:#94a3b8">Shape: 0 connects to 1 and 2; 2 connects to 3, 4, and 5.</div>';
d.innerHTML = html;`,
                outputHeight: 160,
              },
              {
                type: 'js',
                title: 'Pass 1: Subtree Sizes and the Root\'s True Answer',
                instruction: 'Post-order DFS from node 0. Watch subtreeSize accumulate, and distSum[0] converge to the TRUE total distance sum for node 0.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const adj = { 0: [1,2], 1: [0], 2: [0,3,4,5], 3: [2], 4: [2], 5: [2] };
const n = 6;
const subtreeSize = new Array(n).fill(1);
const distSum = new Array(n).fill(0);
const log = [];

function dfs1(node, parent) {
  for (const next of adj[node]) {
    if (next === parent) continue;
    dfs1(next, node);
    subtreeSize[node] += subtreeSize[next];
    distSum[node] += distSum[next] + subtreeSize[next];
  }
  log.push({ node, subtreeSize: subtreeSize[node], distSum: distSum[node] });
}
dfs1(0, -1);

let html = '<div style="color:#60a5fa;margin-bottom:8px">Post-order completion (subtreeSize, distSum so far):</div>';
log.forEach(entry => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">node ' + entry.node + ':  subtreeSize=<b style="color:#f59e0b">' + entry.subtreeSize + '</b>  distSum=<b style="color:#4ade80">' + entry.distSum + '</b></div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">distSum[0] = ' + distSum[0] + ' is the TRUE final answer for node 0 — everything is in its subtree.</div>';
d.innerHTML = html;`,
                outputHeight: 340,
              },
              {
                type: 'js',
                title: 'Pass 2: Reroot in O(1) Per Edge',
                instruction: 'Starting from node 0\'s true answer, derive every other node\'s true answer using only subtreeSize and n.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const adj = { 0: [1,2], 1: [0], 2: [0,3,4,5], 3: [2], 4: [2], 5: [2] };
const n = 6;
const subtreeSize = new Array(n).fill(1);
const distSum = new Array(n).fill(0);

function dfs1(node, parent) {
  for (const next of adj[node]) {
    if (next === parent) continue;
    dfs1(next, node);
    subtreeSize[node] += subtreeSize[next];
    distSum[node] += distSum[next] + subtreeSize[next];
  }
}
dfs1(0, -1);

const log = [{ node: 0, distSum: distSum[0], note: '(pass 1 root — already final)' }];
function dfs2(node, parent) {
  for (const next of adj[node]) {
    if (next === parent) continue;
    distSum[next] = distSum[node] - subtreeSize[next] + (n - subtreeSize[next]);
    log.push({ node: next, distSum: distSum[next], note: 'from parent ' + node + ': ' + distSum[node] + ' - ' + subtreeSize[next] + ' + ' + (n - subtreeSize[next]) });
    dfs2(next, node);
  }
}
dfs2(0, -1);

let html = '<div style="color:#60a5fa;margin-bottom:8px">Every node\\'s true answer:</div>';
log.forEach(entry => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">node ' + entry.node + ': distSum=<b style="color:#4ade80">' + entry.distSum + '</b> &nbsp; <span style="color:#64748b;font-size:11px">' + entry.note + '</span></div>';
});
html += '<div style="margin-top:10px;background:#172554;border-radius:6px;padding:8px 12px;color:#93c5fd">Best server location: node ' + distSum.indexOf(Math.min(...distSum)) + ' (distSum=' + Math.min(...distSum) + ') — computed for ALL 6 nodes in one pass, not six separate DFS runs.</div>';
d.innerHTML = html;`,
                outputHeight: 380,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Rerooting from Scratch',
        caption: 'Both passes, then find the optimal server location.',
        props: {
          lesson: {
            title: 'Rerooting in JavaScript',
            subtitle: 'Two DFS passes, O(n) total.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — Pass 1: Subtree Sizes and the Arbitrary Root's Answer

Implement the post-order part: for each node (processed after its children), accumulate \`subtreeSize\` and \`distSum\` from its children.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function computeSubtreeAndRootAnswer(adj, n) {
  const subtreeSize = new Array(n).fill(1);
  const distSum = new Array(n).fill(0);

  function dfs1(node, parent) {
    for (const next of adj[node]) {
      if (next === parent) continue;
      dfs1(next, node);
      // TODO: subtreeSize[node] += subtreeSize[next]
      // TODO: distSum[node] += distSum[next] + subtreeSize[next]
    }
  }
  dfs1(0, -1);
  return { subtreeSize, distSum };
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}, want \${JSON.stringify(e)}</div>\`;
}

const adj = { 0: [1,2], 1: [0], 2: [0,3,4,5], 3: [2], 4: [2], 5: [2] };
const { subtreeSize, distSum } = computeSubtreeAndRootAnswer(adj, 6);
test('subtreeSize', subtreeSize, [6, 1, 4, 1, 1, 1]);
test('distSum[0] (true answer for node 0)', distSum[0], 8);`,
                solutionCode: `function computeSubtreeAndRootAnswer(adj, n) {
  const subtreeSize = new Array(n).fill(1);
  const distSum = new Array(n).fill(0);

  function dfs1(node, parent) {
    for (const next of adj[node]) {
      if (next === parent) continue;
      dfs1(next, node);
      subtreeSize[node] += subtreeSize[next];
      distSum[node] += distSum[next] + subtreeSize[next];
    }
  }
  dfs1(0, -1);
  return { subtreeSize, distSum };
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}, want \${JSON.stringify(e)}</div>\`;
}

const adj = { 0: [1,2], 1: [0], 2: [0,3,4,5], 3: [2], 4: [2], 5: [2] };
const { subtreeSize, distSum } = computeSubtreeAndRootAnswer(adj, 6);
test('subtreeSize', subtreeSize, [6, 1, 4, 1, 1, 1]);
test('distSum[0] (true answer for node 0)', distSum[0], 8);`,
                outputHeight: 160,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Pass 2: Reroot Every Other Node in O(1)

Using distSum[0] (already correct) and subtreeSize (already computed), fill in every other node's true answer.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function sumOfDistances(adj, n) {
  const subtreeSize = new Array(n).fill(1);
  const distSum = new Array(n).fill(0);

  function dfs1(node, parent) {
    for (const next of adj[node]) {
      if (next === parent) continue;
      dfs1(next, node);
      subtreeSize[node] += subtreeSize[next];
      distSum[node] += distSum[next] + subtreeSize[next];
    }
  }
  dfs1(0, -1);

  function dfs2(node, parent) {
    for (const next of adj[node]) {
      if (next === parent) continue;
      // TODO: distSum[next] = distSum[node] - subtreeSize[next] + (n - subtreeSize[next])
      dfs2(next, node);
    }
  }
  dfs2(0, -1);
  return distSum;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
}

test('Example tree', sumOfDistances({0:[1,2],1:[0],2:[0,3,4,5],3:[2],4:[2],5:[2]}, 6), [8, 12, 6, 10, 10, 10]);
test('Star (center + 3 leaves)', sumOfDistances({0:[1,2,3],1:[0],2:[0],3:[0]}, 4), [3, 5, 5, 5]);
test('Path of 4', sumOfDistances({0:[1],1:[0,2],2:[1,3],3:[2]}, 4), [6, 4, 4, 6]);`,
                solutionCode: `function sumOfDistances(adj, n) {
  const subtreeSize = new Array(n).fill(1);
  const distSum = new Array(n).fill(0);

  function dfs1(node, parent) {
    for (const next of adj[node]) {
      if (next === parent) continue;
      dfs1(next, node);
      subtreeSize[node] += subtreeSize[next];
      distSum[node] += distSum[next] + subtreeSize[next];
    }
  }
  dfs1(0, -1);

  function dfs2(node, parent) {
    for (const next of adj[node]) {
      if (next === parent) continue;
      distSum[next] = distSum[node] - subtreeSize[next] + (n - subtreeSize[next]);
      dfs2(next, node);
    }
  }
  dfs2(0, -1);
  return distSum;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
}

test('Example tree', sumOfDistances({0:[1,2],1:[0],2:[0,3,4,5],3:[2],4:[2],5:[2]}, 6), [8, 12, 6, 10, 10, 10]);
test('Star (center + 3 leaves)', sumOfDistances({0:[1,2,3],1:[0],2:[0],3:[0]}, 4), [3, 5, 5, 5]);
test('Path of 4', sumOfDistances({0:[1],1:[0,2],2:[1,3],3:[2]}, 4), [6, 4, 4, 6]);`,
                outputHeight: 180,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Rerooting in Python',
        caption: 'Build both passes, visualize every node\'s answer on the tree, then find the best server location from scratch.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Sum of Distances — Build and Verify',
              code: `from collections import defaultdict


def sum_of_distances(n, edges):
    adj = defaultdict(list)
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    subtree_size = [1] * n
    dist_sum = [0] * n

    def dfs1(node, parent):
        for neighbor in adj[node]:
            if neighbor == parent:
                continue
            dfs1(neighbor, node)
            subtree_size[node] += subtree_size[neighbor]
            dist_sum[node] += dist_sum[neighbor] + subtree_size[neighbor]

    def dfs2(node, parent):
        for neighbor in adj[node]:
            if neighbor == parent:
                continue
            dist_sum[neighbor] = dist_sum[node] - subtree_size[neighbor] + (n - subtree_size[neighbor])
            dfs2(neighbor, node)

    dfs1(0, -1)
    dfs2(0, -1)
    return dist_sum


result = sum_of_distances(6, [(0, 1), (0, 2), (2, 3), (2, 4), (2, 5)])
print(f"Sum of distances for every node: {result}")
assert result == [8, 12, 6, 10, 10, 10]
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Best Server Location',
              code: `import matplotlib.pyplot as plt
from collections import defaultdict


def sum_of_distances(n, edges):
    adj = defaultdict(list)
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    subtree_size = [1] * n
    dist_sum = [0] * n

    def dfs1(node, parent):
        for neighbor in adj[node]:
            if neighbor == parent:
                continue
            dfs1(neighbor, node)
            subtree_size[node] += subtree_size[neighbor]
            dist_sum[node] += dist_sum[neighbor] + subtree_size[neighbor]

    def dfs2(node, parent):
        for neighbor in adj[node]:
            if neighbor == parent:
                continue
            dist_sum[neighbor] = dist_sum[node] - subtree_size[neighbor] + (n - subtree_size[neighbor])
            dfs2(neighbor, node)

    dfs1(0, -1)
    dfs2(0, -1)
    return dist_sum


n = 6
edges = [(0, 1), (0, 2), (2, 3), (2, 4), (2, 5)]
dist_sum = sum_of_distances(n, edges)
best_node = dist_sum.index(min(dist_sum))
print(f"Distance sums: {dist_sum}")
print(f"Best server location: node {best_node} (total distance {dist_sum[best_node]})")

fig, ax = plt.subplots(figsize=(7, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
colors = ["#4ade80" if i == best_node else "#3b82f6" for i in range(n)]
bars = ax.bar([str(i) for i in range(n)], dist_sum, color=colors)
for bar, val in zip(bars, dist_sum):
    ax.text(bar.get_x() + bar.get_width() / 2, val + 0.2, str(val), ha="center", color="#e2e8f0")
ax.set_xlabel("Node", color="#94a3b8")
ax.set_ylabel("Sum of distances to every other node", color="#94a3b8")
ax.set_title(f"Green = best server location (node {best_node})", color="#e2e8f0")
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
              challengeTitle: 'Rerooting on a bigger tree',
              difficulty: 'hard',
              prompt: 'Fill in both dfs1 (subtree sizes and the root\'s true answer) and dfs2 (rerooting every other node in O(1)) in sum_of_distances_scratch. Uncomment the assertions once ready.',
              hint: 'dfs1: subtree_size[node] += subtree_size[neighbor]; dist_sum[node] += dist_sum[neighbor] + subtree_size[neighbor]. dfs2: dist_sum[neighbor] = dist_sum[node] - subtree_size[neighbor] + (n - subtree_size[neighbor]).',
              label: 'From Scratch — Bigger Tree',
              code: `from collections import defaultdict


def sum_of_distances_scratch(n, edges):
    adj = defaultdict(list)
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    subtree_size = [1] * n
    dist_sum = [0] * n

    def dfs1(node, parent):
        for neighbor in adj[node]:
            if neighbor == parent:
                continue
            dfs1(neighbor, node)
            # YOUR CODE HERE:
            # subtree_size[node] += subtree_size[neighbor]
            # dist_sum[node] += dist_sum[neighbor] + subtree_size[neighbor]
            pass

    def dfs2(node, parent):
        for neighbor in adj[node]:
            if neighbor == parent:
                continue
            # YOUR CODE HERE:
            # dist_sum[neighbor] = dist_sum[node] - subtree_size[neighbor] + (n - subtree_size[neighbor])
            dfs2(neighbor, node)

    dfs1(0, -1)
    dfs2(0, -1)
    return dist_sum


# A 7-node tree: 0-1, 1-2, 1-3, 0-4, 4-5, 4-6
edges = [(0, 1), (1, 2), (1, 3), (0, 4), (4, 5), (4, 6)]

# --- Uncomment to test when ready ---
# result = sum_of_distances_scratch(7, edges)
# print("Distance sums:", result)
# assert result == [10, 11, 16, 16, 11, 16, 16], f"got {result}"
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
      text: 'Why does a brute-force approach to Sum of Distances in Tree cost O(n²) instead of O(n)?',
      options: [
        'Because computing distances requires sorting the nodes first, which costs O(n log n) per node',
        'Running a full DFS from each of the n candidate roots to measure distances to every other node costs O(n) per root, and there are n roots, giving O(n) × O(n) = O(n²) total',
        'Trees inherently require quadratic time for any traversal',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'In pass 1 of rerooting, why is distSum[0] (the arbitrary starting root) the ONLY value that is immediately correct, while other nodes\' distSum values computed during this pass are merely partial?',
      options: [
        'Because node 0 is always the node with the smallest distance sum',
        'The starting root\'s subtree IS the entire tree — every other node is genuinely inside it — so its distance sum is complete after pass 1. Any other node\'s subtree (relative to root 0) only contains SOME of the tree; the pass-1 value for those nodes only accounts for distances within their own subtree, not to nodes outside it',
        'It is not actually correct — distSum[0] must also be corrected in pass 2',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'The reroot formula is distSum[v] = distSum[u] - subtreeSize[v] + (n - subtreeSize[v]), moving from parent u to child v. What do the two terms represent?',
      options: [
        'subtreeSize[v] is subtracted because those nodes are deleted from consideration; (n - subtreeSize[v]) is added as a penalty for the remaining nodes',
        'subtreeSize[v] nodes (v\'s own subtree) each become one edge CLOSER when v becomes the new center, so their total distance contribution decreases by subtreeSize[v]; the remaining (n - subtreeSize[v]) nodes each become one edge FARTHER, so their contribution increases by that amount',
        'Both terms are arbitrary normalization constants with no geometric meaning',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why is subtreeSize[v] computed ONCE in pass 1, relative to the arbitrary original root, rather than being recomputed as pass 2 conceptually moves the center to each new node?',
      options: [
        'subtreeSize[v] represents a fixed structural fact — the count of nodes on the far side of the edge (parent(v), v), away from the original root — which does not change no matter which node is currently being treated as the center; recomputing it would be redundant wasted work',
        'It actually does need to be recomputed every time; the algorithm as described has a bug',
        'subtreeSize only matters for the first DFS pass and is discarded before pass 2 begins',
      ],
      correct: 0,
    },
  ],
};
