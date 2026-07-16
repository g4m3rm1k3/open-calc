export default {
  id: 'dp2-002',
  slug: 'general-tree-dp',
  chapter: 'dp2',
  order: 2,
  title: 'General Tree DP: N-ary Trees and the Diameter Pattern',
  subtitle: 'Maximum weight independent set on any tree, and a DP shape where the answer is NOT the return value',
  tags: ['dynamic programming', 'tree dp', 'diameter', 'independent set', 'n-ary tree', 'dfs'],
  aliases: 'general tree dp n-ary independent set diameter of tree global answer',

  hook: {
    question: 'House Robber III only had binary trees — every node had at most two children, so the recurrence hardcoded "left" and "right." Real org charts, file systems, and network topologies branch into any number of children. And a completely different question — "what is the longest path between any two nodes in this tree?" — needs a DP pattern where the value returned up the recursion is NOT the final answer at all, just an ingredient for it.',
    realWorldContext: 'N-ary tree DP shows up in file-system disk usage (a directory has arbitrarily many children), organizational hierarchies (a manager can have any number of direct reports), and DOM trees (an HTML element can have any number of child elements). Tree diameter specifically models worst-case network latency (the two most distant servers in a hub-and-spoke topology), the longest chain of dependencies in a build system, and phylogenetic distance in evolutionary biology.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Generalizing include/exclude beyond two children.** House Robber III hardcoded `left` and `right`. For a node with an arbitrary list of children, the same idea becomes a loop: `robThis = node.val + sum(child.skipThis for each child)`, and `skipThis = sum(max(child.robThis, child.skipThis) for each child)`. Nothing about the underlying idea changed — a robbed node forces every child to be in its skipped state, and a skipped node lets each child independently pick its own best state. Only the "two named variables" became "a sum over a list."',
      '**A genuinely different shape: the answer is not the return value.** Tree diameter asks for the longest path between any two nodes — but that path does not have to pass through the root, or even be describable by a single number returned upward. The trick: define `height(node)` = the longest downward chain of edges starting at `node`. Every node can compute its own height from its children\'s heights: `height(node) = 1 + max(height of each child)`, with `height(null) = -1` (so a leaf gets height 0). But the diameter *through* a node is `(tallest child height + 1) + (second-tallest child height + 1)` — and the true answer is the MAXIMUM of that quantity over every node in the tree, not just the root.',
      '**Why this needs a side-channel, not just a return value.** The recursive call returns `height(node)` upward, because that is what a *parent* needs to compute its own height. But "diameter through this node" needs to be recorded somewhere else — typically a variable declared outside the recursive function (or passed by reference) that gets updated with `max(currentBest, diameterThroughThisNode)` at every single node, whether or not that node ends up being useful to its parent. The recursion computes one thing (height, for the parent) while silently accumulating a different thing (the global best diameter) as a side effect.',
      '**Recognizing which shape a new tree DP problem needs.** Ask: "does the final answer have to be assembled from the root downward, or could the best answer be hiding entirely inside one subtree, never surfacing at the root?" House Robber III\'s answer genuinely is `max(root.rob, root.skip)` — nothing outside the root matters. Diameter\'s answer could be a path entirely contained within a left subtree, never involving the root at all — so the root\'s own return value cannot possibly encode it. Whenever the phrase "longest path between ANY two nodes" or "best value ANYWHERE in the tree" appears, suspect the side-channel-plus-height pattern.',
      '**Two heights, not one, matter at combination time.** A subtlety: at a node with three or more children, only the top TWO heights matter for the diameter through that node — a third child can contribute a path down into it, but a path can only pass through a node via at most two of its neighbors (one path "in," one path "out"). Track the top two child heights at each node, not just the single tallest.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 2, Lesson 2: General Tree DP',
        body: '**Previous:** Tree DP Fundamentals — House Robber III, the two-state DFS pattern.\n**This lesson:** N-ary independent set, and the diameter pattern (return value ≠ final answer).\n**Next:** DP on DAGs — topological order, Longest Increasing Path in a Matrix.',
      },
      {
        type: 'insight',
        title: 'Two shapes of tree DP, side by side',
        body: '**Shape A (House Robber III):** the value returned by the root call IS the answer.\n**Shape B (Diameter):** the value returned by each call is an ingredient a PARENT needs (height); the actual answer is tracked separately and updated at every node, then read out after the whole traversal finishes.',
      },
      {
        type: 'strategy',
        title: 'The general N-ary include/exclude template',
        body: '`robThis = node.val + Σ(child.skipThis for each child)`\n`skipThis = Σ(max(child.robThis, child.skipThis) for each child)`\nWorks for exactly the same reason as the binary case: robbing a node forces every child into its skipped state; skipping a node frees each child independently.',
      },
      {
        type: 'warning',
        title: 'Diameter bug: using only the single tallest child',
        body: 'If a node has three children with heights 5, 4, and 3, the diameter through that node uses the top TWO (5 and 4), not just the single tallest. Forgetting to track the second-best height silently under-counts the diameter whenever a node has more than two children — a bug that will not show up on binary trees at all, only on general N-ary ones.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Diameter: Height Flows Up, Diameter Is Tracked Separately',
        caption: 'Watch each node report its height, and watch the running best-diameter update independently.',
        props: {
          lesson: {
            title: 'Tree Diameter Step by Step',
            subtitle: 'Two different quantities computed by the same traversal.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The Tree: A Y-Shape',
                instruction: 'Nodes 0-1-2 form a spine, then 2 branches into 3 and 4. The longest path is 0 to 3 (or 0 to 4) — 3 edges — even though it does not pass through every node.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const edges = [[0,1],[1,2],[2,3],[2,4]];
let html = '<div style="color:#60a5fa;margin-bottom:8px">Edges (undirected):</div>';
edges.forEach(([a,b]) => {
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:4px;display:inline-block;margin-right:6px">' + a + ' — ' + b + '</div>';
});
html += '<div style="margin-top:12px;color:#94a3b8">Shape: 0—1—2, then 2 branches to 3 and to 4.</div>';
d.innerHTML = html;`,
                outputHeight: 160,
              },
              {
                type: 'js',
                title: 'Height Reported Upward, Diameter Tracked Separately',
                instruction: 'Watch two columns: the height each node returns to its parent, and the running best diameter after visiting that node.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const adj = { 0: [1], 1: [0,2], 2: [1,3,4], 3: [2], 4: [2] };
let bestDiameter = 0;
const log = [];

function dfs(node, parent) {
  let top1 = 0, top2 = 0;
  for (const next of adj[node]) {
    if (next === parent) continue;
    const h = dfs(next, node) + 1;
    if (h > top1) { top2 = top1; top1 = h; }
    else if (h > top2) { top2 = h; }
  }
  bestDiameter = Math.max(bestDiameter, top1 + top2);
  log.push({ node, height: top1, runningBest: bestDiameter });
  return top1;
}
dfs(2, -1); // root the traversal at node 2 (any root works — diameter is root-independent)

let html = '<div style="color:#60a5fa;margin-bottom:10px">Node | height returned | running best diameter:</div>';
log.forEach(entry => {
  html += '<div style="padding:5px 10px;background:#1e293b;border-radius:4px;margin-bottom:4px">node ' + entry.node + '&nbsp;&nbsp;height=<b style="color:#4ade80">' + entry.height + '</b>&nbsp;&nbsp;bestDiameter=<b style="color:#f59e0b">' + entry.runningBest + '</b></div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Final diameter: ' + bestDiameter + '</div>';
d.innerHTML = html;`,
                outputHeight: 300,
              },
              {
                type: 'js',
                title: 'Root Choice Does Not Matter',
                instruction: 'Diameter is a property of the whole tree, not of a chosen root. Run the same DFS starting from a different node and confirm the diameter is identical.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const adj = { 0: [1], 1: [0,2], 2: [1,3,4], 3: [2], 4: [2] };

function diameterFrom(root) {
  let best = 0;
  function dfs(node, parent) {
    let top1 = 0, top2 = 0;
    for (const next of adj[node]) {
      if (next === parent) continue;
      const h = dfs(next, node) + 1;
      if (h > top1) { top2 = top1; top1 = h; }
      else if (h > top2) { top2 = h; }
    }
    best = Math.max(best, top1 + top2);
    return top1;
  }
  dfs(root, -1);
  return best;
}

let html = '<div style="color:#60a5fa;margin-bottom:10px">Diameter computed from each possible root:</div>';
for (let r = 0; r <= 4; r++) {
  html += '<div style="padding:5px 10px;background:#1e293b;border-radius:4px;margin-bottom:4px">root=' + r + ' &rarr; diameter=<b style="color:#4ade80">' + diameterFrom(r) + '</b></div>';
}
html += '<div style="margin-top:10px;background:#172554;border-radius:6px;padding:8px 12px;color:#93c5fd;font-size:12px">Same answer every time — 3. The diameter is a structural property of the tree itself.</div>';
d.innerHTML = html;`,
                outputHeight: 280,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build General Tree DP from Scratch',
        caption: 'N-ary independent set, then tree diameter.',
        props: {
          lesson: {
            title: 'General Tree DP in JavaScript',
            subtitle: 'A sum over children, and a global side-channel.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — N-ary Maximum Weight Independent Set

Each node has a \`val\` and a \`children\` array (any length, including zero). Implement \`maxIndependentSet(node)\`, generalizing House Robber III: \`robThis = val + sum of every child's skipThis\`; \`skipThis = sum of max(child.robThis, child.skipThis) over every child\`.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function maxIndependentSet(root) {
  function dfs(node) {
    let robThis = node.val;
    let skipThis = 0;
    for (const child of node.children) {
      const [childRob, childSkip] = dfs(child);
      // TODO: robThis += childSkip
      // TODO: skipThis += Math.max(childRob, childSkip)
    }
    return [robThis, skipThis];
  }
  const [rob, skip] = dfs(root);
  return Math.max(rob, skip);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

// CEO(10) -> [VP_A(6) -> [Mgr1(3), Mgr2(2)], VP_B(5) -> [Mgr3(4)]]
const orgChart = {
  val: 10,
  children: [
    { val: 6, children: [{ val: 3, children: [] }, { val: 2, children: [] }] },
    { val: 5, children: [{ val: 4, children: [] }] },
  ],
};
test('Org chart (CEO + 3 managers = 19)', maxIndependentSet(orgChart), 19);

// Single node, no children
test('Single node', maxIndependentSet({ val: 7, children: [] }), 7);

// Node with 4 children, all leaves — must skip the root, take all 4 leaves
const fourLeaves = { val: 1, children: [{val:5,children:[]},{val:5,children:[]},{val:5,children:[]},{val:5,children:[]}] };
test('4 leaves beat their parent', maxIndependentSet(fourLeaves), 20);`,
                solutionCode: `function maxIndependentSet(root) {
  function dfs(node) {
    let robThis = node.val;
    let skipThis = 0;
    for (const child of node.children) {
      const [childRob, childSkip] = dfs(child);
      robThis += childSkip;
      skipThis += Math.max(childRob, childSkip);
    }
    return [robThis, skipThis];
  }
  const [rob, skip] = dfs(root);
  return Math.max(rob, skip);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

const orgChart = {
  val: 10,
  children: [
    { val: 6, children: [{ val: 3, children: [] }, { val: 2, children: [] }] },
    { val: 5, children: [{ val: 4, children: [] }] },
  ],
};
test('Org chart (CEO + 3 managers = 19)', maxIndependentSet(orgChart), 19);
test('Single node', maxIndependentSet({ val: 7, children: [] }), 7);
const fourLeaves = { val: 1, children: [{val:5,children:[]},{val:5,children:[]},{val:5,children:[]},{val:5,children:[]}] };
test('4 leaves beat their parent', maxIndependentSet(fourLeaves), 20);`,
                outputHeight: 200,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Tree Diameter

Implement \`treeDiameter(adj, n)\` for an undirected tree given as an adjacency list. Track a variable \`best\` OUTSIDE the recursive helper, and update it at every node with the sum of that node's top two child heights. Return only the height upward.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function treeDiameter(adj, n) {
  let best = 0;
  function dfs(node, parent) {
    let top1 = 0, top2 = 0;
    for (const next of adj[node]) {
      if (next === parent) continue;
      const h = dfs(next, node) + 1;
      // TODO: update top1/top2 with h (keep the two largest)
    }
    // TODO: best = max(best, top1 + top2)
    return top1;
  }
  dfs(0, -1);
  return best;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

// Path 0-1-2-3-4 -> diameter 4
test('Path of 5 nodes', treeDiameter({0:[1],1:[0,2],2:[1,3],3:[2,4],4:[3]}, 5), 4);
// Star: 0 connected to 1,2,3,4 -> diameter 2
test('Star graph', treeDiameter({0:[1,2,3,4],1:[0],2:[0],3:[0],4:[0]}, 5), 2);
// Y-shape: 0-1-2, 2-3, 2-4 -> diameter 3
test('Y-shape', treeDiameter({0:[1],1:[0,2],2:[1,3,4],3:[2],4:[2]}, 5), 3);`,
                solutionCode: `function treeDiameter(adj, n) {
  let best = 0;
  function dfs(node, parent) {
    let top1 = 0, top2 = 0;
    for (const next of adj[node]) {
      if (next === parent) continue;
      const h = dfs(next, node) + 1;
      if (h > top1) { top2 = top1; top1 = h; }
      else if (h > top2) { top2 = h; }
    }
    best = Math.max(best, top1 + top2);
    return top1;
  }
  dfs(0, -1);
  return best;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Path of 5 nodes', treeDiameter({0:[1],1:[0,2],2:[1,3],3:[2,4],4:[3]}, 5), 4);
test('Star graph', treeDiameter({0:[1,2,3,4],1:[0],2:[0],3:[0],4:[0]}, 5), 2);
test('Y-shape', treeDiameter({0:[1],1:[0,2],2:[1,3,4],3:[2],4:[2]}, 5), 3);`,
                outputHeight: 200,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'General Tree DP in Python',
        caption: 'N-ary independent set with a bar chart, then diameter visualized on the tree itself.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'N-ary Independent Set — Build and Verify',
              code: `class OrgNode:
    def __init__(self, val, children=None):
        self.val = val
        self.children = children or []


def max_independent_set(root: OrgNode) -> int:
    def dfs(node):
        rob_this = node.val
        skip_this = 0
        for child in node.children:
            child_rob, child_skip = dfs(child)
            rob_this += child_skip
            skip_this += max(child_rob, child_skip)
        return rob_this, skip_this

    rob_root, skip_root = dfs(root)
    return max(rob_root, skip_root)


mgr1, mgr2, mgr3 = OrgNode(3), OrgNode(2), OrgNode(4)
vp_a = OrgNode(6, [mgr1, mgr2])
vp_b = OrgNode(5, [mgr3])
ceo = OrgNode(10, [vp_a, vp_b])

result = max_independent_set(ceo)
print(f"Max weight independent set: {result}")
assert result == 19
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Which Nodes Are In the Optimal Set',
              code: `import matplotlib.pyplot as plt


class OrgNode:
    def __init__(self, val, children=None, name=""):
        self.val = val
        self.children = children or []
        self.name = name


def independent_set_with_choice(root):
    def dfs(node):
        rob_total = node.val
        rob_set = [node]
        skip_total = 0
        skip_set = []
        for child in node.children:
            c_rob_total, c_rob_set, c_skip_total, c_skip_set = dfs(child)
            rob_total += c_skip_total
            rob_set += c_skip_set
            if c_rob_total >= c_skip_total:
                skip_total += c_rob_total
                skip_set += c_rob_set
            else:
                skip_total += c_skip_total
                skip_set += c_skip_set
        return rob_total, rob_set, skip_total, skip_set

    rob_total, rob_set, skip_total, skip_set = dfs(root)
    if rob_total >= skip_total:
        return rob_total, rob_set
    return skip_total, skip_set


mgr1 = OrgNode(3, name="Mgr1")
mgr2 = OrgNode(2, name="Mgr2")
mgr3 = OrgNode(4, name="Mgr3")
vp_a = OrgNode(6, [mgr1, mgr2], name="VP-A")
vp_b = OrgNode(5, [mgr3], name="VP-B")
ceo = OrgNode(10, [vp_a, vp_b], name="CEO")

total, chosen = independent_set_with_choice(ceo)
chosen_names = {n.name for n in chosen}
print(f"Total: {total}, chosen: {sorted(chosen_names)}")

all_nodes = [ceo, vp_a, vp_b, mgr1, mgr2, mgr3]
names = [n.name for n in all_nodes]
values = [n.val for n in all_nodes]
colors = ["#4ade80" if n.name in chosen_names else "#334155" for n in all_nodes]

fig, ax = plt.subplots(figsize=(7, 4), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
bars = ax.bar(names, values, color=colors)
for bar, val in zip(bars, values):
    ax.text(bar.get_x() + bar.get_width() / 2, val + 0.2, str(val), ha="center", color="#e2e8f0")
ax.set_title(f"Green = in optimal set. Total = {total}", color="#e2e8f0")
ax.tick_params(colors="#94a3b8")
ax.spines[:].set_color("#334155")
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Tree diameter, height plus a side-channel',
              difficulty: 'medium',
              prompt: 'Fill in dfs(node, parent): compute each neighbor\'s height, track the top two among them, update best with their sum, and return only the tallest height upward. Uncomment the assertions once ready.',
              hint: 'h = dfs(neighbor, node) + 1. If h beats top1, demote top1 to top2 first. best[0] = max(best[0], top1 + top2) happens once per node, after the loop.',
              label: 'From Scratch — Tree Diameter',
              code: `def tree_diameter(adj: dict, root=0) -> int:
    best = [0]

    def dfs(node, parent):
        top1 = top2 = 0
        for neighbor in adj[node]:
            if neighbor == parent:
                continue
            # YOUR CODE HERE:
            # h = dfs(neighbor, node) + 1
            # update top1, top2 to be the two largest heights seen so far
            pass
        best[0] = max(best[0], top1 + top2)
        return top1

    dfs(root, -1)
    return best[0]


# Path 0-1-2-3-4-5-6 (diameter 6), and a star with 6 leaves (diameter 2)
path_adj = {i: [i - 1, i + 1] for i in range(1, 6)}
path_adj[0] = [1]
path_adj[6] = [5]

star_adj = {0: [1, 2, 3, 4, 5, 6]}
for i in range(1, 7):
    star_adj[i] = [0]

# --- Uncomment to test when ready ---
# assert tree_diameter(path_adj) == 6
# assert tree_diameter(star_adj) == 2
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
      text: 'How does the N-ary independent set recurrence generalize the binary House Robber III recurrence?',
      options: [
        'It requires a completely different algorithm — sums over children do not relate to the binary case',
        '`robThis` becomes `val + sum of every child\'s skipThis`, and `skipThis` becomes `sum of max(childRob, childSkip)` over every child — the same rule (robbing forces children to be skipped; skipping frees each child independently), just summed over an arbitrary number of children instead of hardcoded left/right',
        'N-ary trees must first be converted to binary trees before any DP can be applied',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'In the tree diameter algorithm, why is the value returned by dfs() not the final answer?',
      options: [
        'Because JavaScript and Python cannot return two values from a function',
        'The returned height is only what a PARENT needs to compute its own height — but the longest path in the whole tree might be entirely contained within one subtree and never reach the root, so it has to be tracked as a running best-so-far value updated at every node, independent of what gets returned upward',
        'Because diameter is always found at the root of the tree',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does the diameter calculation need the top TWO child heights, not just the tallest one?',
      options: [
        'Using two heights is only a minor optimization for speed, not correctness',
        'A path through a node can only enter from one neighbor and exit through another — so the longest path passing through a given node combines its two best downward branches, not just its single tallest one',
        'Binary trees need one height; only N-ary trees need two',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does the tree diameter give the same answer no matter which node you start the DFS from?',
      options: [
        'It does not — different roots give different answers, and you must try all of them and take the max',
        'Diameter is a structural property of the tree itself (the longest path between any two nodes), not a property relative to a chosen root — the DFS root is just an implementation detail for the traversal, the same way choosing where to start Post-order DFS does not change which subtrees exist',
        'Because all trees are symmetric by definition',
      ],
      correct: 1,
    },
  ],
};
