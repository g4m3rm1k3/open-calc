export default {
  id: 'dp2-001',
  slug: 'tree-dp-fundamentals',
  chapter: 'dp2',
  order: 1,
  title: 'Tree DP: The Include/Exclude Pattern on Trees',
  subtitle: 'Post-order DFS returning two states per node — House Robber III',
  tags: ['dynamic programming', 'tree dp', 'dfs', 'post-order', 'house robber', 'recursion', 'binary tree'],
  aliases: 'tree DP DFS post order house robber 3 include exclude state',

  hook: {
    question: 'A thief targets houses arranged not in a street, but in a tree — a neighborhood where every house connects to sub-neighborhoods below it. Rob a house and its direct parent/children trip a shared alarm. No array, no index i-1 or i-2 to look back at — just a branching structure. How do you adapt "rob or skip" when there is no previous element, only children?',
    realWorldContext: 'Tree DP appears anywhere a decision at one node constrains its neighbors in a branching structure: network intrusion detection (monitor a server or its direct children, not both, to avoid redundant sensors), org-chart scheduling (a manager and their direct reports cannot both be on-call), and file-system quota allocation (a directory or its immediate subdirectories get a budget, not both independently). Compilers use the same shape for register allocation across an expression tree.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**Why array DP techniques do not directly transfer.** In House Robber (1D DP), `dp[i]` depends on `dp[i-1]` and `dp[i-2]` — a linear chain with exactly one predecessor structure. A tree has no "previous index." A node can have zero, one, or many children, and the decision at a node depends on combining information from *all* of them at once. The recurrence has to be rewritten in terms of children, not indices.',
      '**The fix: return two numbers from every node, not one.** Post-order DFS visits a node only after both its children have been fully processed. So the function at each node can ask its children: "if I could see the best answer assuming you get robbed, and the best answer assuming you get skipped, I could decide about myself." Concretely, `dfs(node)` returns a pair `(robThis, skipThis)`: the maximum loot in `node`\'s subtree if `node` is robbed, and the maximum loot if `node` is not robbed.',
      '**The recurrence.** If `node` is robbed, its children cannot be robbed (shared alarm) — so `robThis = node.val + left.skipThis + right.skipThis`. If `node` is skipped, each child is free to be robbed or not, so we take whichever is better independently — `skipThis = max(left.robThis, left.skipThis) + max(right.robThis, right.skipThis)`. The base case (no child, i.e. `null`) returns `(0, 0)` — an empty subtree contributes nothing either way. The final answer is `max(root.robThis, root.skipThis)`.',
      '**Why there is no cache dict here — and why that is not a mistake.** Fibonacci needed memoization because `fib(n-2)` is reached through *multiple different call paths* (via `fib(n-1)` and directly), causing exponential blow-up. A proper tree has exactly one path from the root to any node — every subtree is visited by exactly one parent, exactly once. Post-order DFS over a tree is already O(n) with no repeated work, so there are no overlapping subproblems to cache. What makes this "DP" is not caching — it is the *state design*: deciding what two numbers to carry upward so a parent can make an optimal local decision without looking at the whole subtree again.',
      '**This is still dynamic programming.** The definition from Lesson 1 was: optimal substructure (the best answer for a subtree is built from the best answers of its children\'s subtrees) plus a well-defined state per node (`robThis`/`skipThis`). Both hold here. The absence of a cache is a property of trees, not a violation of the definition — compare this to 1D array DP where the "subtree" (a prefix `dp[0..i]`) truly is shared across many different `i+1`, `i+2` computations.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 2, Lesson 1: Tree DP Fundamentals',
        body: '**Previous (Chapter 1):** Interval DP — Matrix Chain, Burst Balloons.\n**This lesson:** Tree DP — House Robber III, the two-state DFS return pattern.\n**Next:** General Tree DP — Maximum Independent Set on N-ary trees, and Tree Diameter.',
      },
      {
        type: 'insight',
        title: 'The tree DP recipe — four steps every time',
        body: '1. **Choose the traversal:** post-order (children before parent) for "bottom-up" decisions.\n2. **Define the state per node:** what must a parent know about this subtree to make its own decision? (Here: robbed-value and skipped-value.)\n3. **Write the combination rule:** how do a node\'s own value and its children\'s states combine into this node\'s states?\n4. **Read the answer at the root:** usually the best of the states returned by the top-level call.',
      },
      {
        type: 'strategy',
        title: 'How to spot a tree DP problem',
        body: 'The problem describes a tree (or is reducible to one — an org chart, a file system, a binary tree) AND a local constraint between a node and its direct neighbors (parent/child) that affects a global optimum (max, min, or count). If you can articulate "what does the parent need to know about my subtree," you have found the state.',
      },
      {
        type: 'warning',
        title: 'Forgetting the base case for a missing child',
        body: 'A `null` child is not "no information" — it is the state `(0, 0)`: zero loot whether "robbed" or "skipped," because there is nothing there. Skipping this base case (e.g. returning `None` instead of `(0, 0)`) causes a `TypeError` or silently wrong arithmetic the first time a node has only one child.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'House Robber III: Watching the Two States Flow Upward',
        caption: 'Post-order DFS visits leaves first, then combines robbed/skipped pairs on the way back to the root.',
        props: {
          lesson: {
            title: 'Tree DP Step by Step',
            subtitle: 'From leaves to root — one pair of numbers per node.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The Tree: LeetCode 337 Example 2',
                instruction: 'This is the classic Example 2 tree: root 3, children 4 and 5, grandchildren 1, 3, and 1. The expected optimal loot is 9 (rob nodes 4, 5, and 1 — wait, check the trace below to see exactly which nodes.)',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');

const tree = {
  val: 3,
  left:  { val: 4, left: { val: 1 }, right: { val: 3 } },
  right: { val: 5, left: null, right: { val: 1 } },
};

function render(node, depth) {
  if (!node) return '';
  const indent = '&nbsp;'.repeat(depth * 6);
  return indent + 'node(' + node.val + ')<br>' +
    render(node.left, depth + 1) +
    render(node.right, depth + 1);
}

let html = '<div style="color:#60a5fa;margin-bottom:10px">Tree structure (indent = depth):</div>';
html += '<div style="line-height:1.7">' + render(tree, 0) + '</div>';
d.innerHTML = html;`,
                outputHeight: 220,
              },
              {
                type: 'js',
                title: 'Post-Order DFS: Leaves Report First',
                instruction: 'Watch the order nodes report their (robThis, skipThis) pair. Leaves (1, 3, 1) report immediately since they have no children. Then node 4 and node 5 combine their children. Root reports last.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');

const tree = {
  val: 3,
  left:  { val: 4, left: { val: 1 }, right: { val: 3 } },
  right: { val: 5, left: null, right: { val: 1 } },
};

const log = [];
function dfs(node) {
  if (!node) return [0, 0];
  const [lRob, lSkip] = dfs(node.left);
  const [rRob, rSkip] = dfs(node.right);
  const robThis = node.val + lSkip + rSkip;
  const skipThis = Math.max(lRob, lSkip) + Math.max(rRob, rSkip);
  log.push({ val: node.val, robThis, skipThis });
  return [robThis, skipThis];
}
const [rootRob, rootSkip] = dfs(tree);

let html = '<div style="color:#60a5fa;margin-bottom:10px">Report order (post-order — children before parent):</div>';
log.forEach((entry, i) => {
  html += '<div style="margin-bottom:4px;padding:5px 10px;background:#1e293b;border-radius:4px">' +
    (i + 1) + '. node(' + entry.val + ')  rob=<b style="color:#4ade80">' + entry.robThis + '</b>  skip=<b style="color:#f59e0b">' + entry.skipThis + '</b>' +
    '</div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Answer = max(' + rootRob + ', ' + rootSkip + ') = ' + Math.max(rootRob, rootSkip) + '</div>';
d.innerHTML = html;`,
                outputHeight: 320,
              },
              {
                type: 'js',
                title: 'Why No Cache Is Needed',
                instruction: 'Count how many times dfs() is called on each node. Unlike Fibonacci, every node is visited exactly once — there is only one path from root to any node in a tree.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');

const tree = {
  val: 3,
  left:  { val: 4, left: { val: 1 }, right: { val: 3 } },
  right: { val: 5, left: null, right: { val: 1 } },
};

const callCount = {};
function dfs(node) {
  if (!node) return [0, 0];
  callCount[node.val] = (callCount[node.val] || 0) + 1;
  const [lRob, lSkip] = dfs(node.left);
  const [rRob, rSkip] = dfs(node.right);
  return [node.val + lSkip + rSkip, Math.max(lRob, lSkip) + Math.max(rRob, rSkip)];
}
dfs(tree);

let html = '<div style="color:#60a5fa;margin-bottom:10px">Call count per node value:</div>';
html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
Object.entries(callCount).forEach(([val, count]) => {
  html += '<div style="text-align:center"><div style="background:#1e293b;border-radius:4px;padding:5px 12px;color:#4ade80;font-weight:bold">' + count + '</div><div style="color:var(--color-text-secondary,#475569);font-size:11px;margin-top:2px">node(' + val + ')</div></div>';
});
html += '</div>';
html += '<div style="margin-top:10px;background:#172554;border-radius:6px;padding:8px 12px;color:#93c5fd;font-size:12px">Every node called exactly once — 5 nodes, 5 calls. No repeated subproblems, so no cache needed. Compare this to naive Fibonacci, where fib(2) was called 3+ times for fib(5) alone.</div>';
d.innerHTML = html;`,
                outputHeight: 260,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build Tree DP from Scratch in JavaScript',
        caption: 'Implement the two-state DFS, then extend it to a deeper tree.',
        props: {
          lesson: {
            title: 'Tree DP in JavaScript',
            subtitle: 'One function, two return values, no cache.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — The Two-State DFS

Implement \`robTree(node)\`, which returns the maximum loot achievable. Internally, write a helper that returns \`[robThis, skipThis]\` for each node, following the recurrence:
- \`robThis = node.val + leftSkip + rightSkip\`
- \`skipThis = max(leftRob, leftSkip) + max(rightRob, rightSkip)\`
- base case: a \`null\` node returns \`[0, 0]\`

The final answer is \`max(rootRob, rootSkip)\`.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function robTree(root) {
  function dfs(node) {
    if (!node) return [0, 0];
    // TODO: recurse into node.left and node.right
    // TODO: robThis = node.val + leftSkip + rightSkip
    // TODO: skipThis = max(leftRob, leftSkip) + max(rightRob, rightSkip)
    // TODO: return [robThis, skipThis]
  }
  const [rob, skip] = dfs(root);
  return Math.max(rob, skip);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

// [3,2,3,null,3,null,1] -> 7
test('Example A', robTree({ val: 3, left: { val: 2, left: null, right: { val: 3 } }, right: { val: 3, left: null, right: { val: 1 } } }), 7);
// [3,4,5,1,3,null,1] -> 9
test('Example B', robTree({ val: 3, left: { val: 4, left: { val: 1 }, right: { val: 3 } }, right: { val: 5, left: null, right: { val: 1 } } }), 9);
// single node -> its own value
test('Single node', robTree({ val: 42, left: null, right: null }), 42);
// chain 1 -> 2 -> 3 (right children only) -> rob 1 and 3 = 4
test('Chain 1-2-3', robTree({ val: 1, left: null, right: { val: 2, left: null, right: { val: 3, left: null, right: null } } }), 4);`,
                solutionCode: `function robTree(root) {
  function dfs(node) {
    if (!node) return [0, 0];
    const [leftRob, leftSkip] = dfs(node.left);
    const [rightRob, rightSkip] = dfs(node.right);
    const robThis = node.val + leftSkip + rightSkip;
    const skipThis = Math.max(leftRob, leftSkip) + Math.max(rightRob, rightSkip);
    return [robThis, skipThis];
  }
  const [rob, skip] = dfs(root);
  return Math.max(rob, skip);
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('Example A', robTree({ val: 3, left: { val: 2, left: null, right: { val: 3 } }, right: { val: 3, left: null, right: { val: 1 } } }), 7);
test('Example B', robTree({ val: 3, left: { val: 4, left: { val: 1 }, right: { val: 3 } }, right: { val: 5, left: null, right: { val: 1 } } }), 9);
test('Single node', robTree({ val: 42, left: null, right: null }), 42);
test('Chain 1-2-3', robTree({ val: 1, left: null, right: { val: 2, left: null, right: { val: 3, left: null, right: null } } }), 4);`,
                outputHeight: 200,
              },
              {
                type: 'js',
                instruction: `## Step 2 — Also Return Which Nodes Were Robbed

Extend the DFS to also return the *set* of robbed values, not just the total. This is the tree-DP equivalent of "reconstructing the path" from Lesson 4 (sequence DP) — the table (or here, the recursive state) gives you the score, but recovering the actual choice requires carrying more information through the recursion.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function robTreeWithChoice(root) {
  // returns { total, robbedValues: number[] }
  function dfs(node) {
    if (!node) return { rob: [0, []], skip: [0, []] };
    const left = dfs(node.left);
    const right = dfs(node.right);
    // TODO: robThis total = node.val + left.skip[0] + right.skip[0]
    // TODO: robThis list = [node.val, ...left.skip[1], ...right.skip[1]]
    // TODO: skipThis: for each child, take whichever of rob/skip has the bigger total
    // TODO: return { rob: [robThisTotal, robThisList], skip: [skipThisTotal, skipThisList] }
  }
  const { rob, skip } = dfs(root);
  return rob[0] >= skip[0] ? { total: rob[0], robbedValues: rob[1] } : { total: skip[0], robbedValues: skip[1] };
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
}

const tree = { val: 3, left: { val: 4, left: { val: 1 }, right: { val: 3 } }, right: { val: 5, left: null, right: { val: 1 } } };
const result = robTreeWithChoice(tree);
test('Total loot', result.total, 9);
const sortedRobbed = [...result.robbedValues].sort((a,b) => a - b);
out.innerHTML += \`<div>Robbed nodes (sorted): \${JSON.stringify(sortedRobbed)}\</div>\`;`,
                solutionCode: `function robTreeWithChoice(root) {
  function dfs(node) {
    if (!node) return { rob: [0, []], skip: [0, []] };
    const left = dfs(node.left);
    const right = dfs(node.right);
    const robThisTotal = node.val + left.skip[0] + right.skip[0];
    const robThisList = [node.val, ...left.skip[1], ...right.skip[1]];
    const leftBest = left.rob[0] >= left.skip[0] ? left.rob : left.skip;
    const rightBest = right.rob[0] >= right.skip[0] ? right.rob : right.skip;
    const skipThisTotal = leftBest[0] + rightBest[0];
    const skipThisList = [...leftBest[1], ...rightBest[1]];
    return { rob: [robThisTotal, robThisList], skip: [skipThisTotal, skipThisList] };
  }
  const { rob, skip } = dfs(root);
  return rob[0] >= skip[0] ? { total: rob[0], robbedValues: rob[1] } : { total: skip[0], robbedValues: skip[1] };
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = JSON.stringify(g) === JSON.stringify(e);
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${JSON.stringify(g)}</div>\`;
}

const tree = { val: 3, left: { val: 4, left: { val: 1 }, right: { val: 3 } }, right: { val: 5, left: null, right: { val: 1 } } };
const result = robTreeWithChoice(tree);
test('Total loot', result.total, 9);
const sortedRobbed = [...result.robbedValues].sort((a,b) => a - b);
out.innerHTML += \`<div>Robbed nodes (sorted): \${JSON.stringify(sortedRobbed)}</div>\`;`,
                outputHeight: 220,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Tree DP in Python',
        caption: 'Build the two-state DFS, then visualize the tree with rob/skip decisions colored.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'House Robber III — Build and Verify',
              code: `import sys
sys.setrecursionlimit(10000)


class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def rob_tree(root: TreeNode) -> int:
    def dfs(node):
        if node is None:
            return (0, 0)  # (rob_this, skip_this)
        left_rob, left_skip = dfs(node.left)
        right_rob, right_skip = dfs(node.right)
        rob_this = node.val + left_skip + right_skip
        skip_this = max(left_rob, left_skip) + max(right_rob, right_skip)
        return (rob_this, skip_this)

    rob_root, skip_root = dfs(root)
    return max(rob_root, skip_root)


# Example A: [3,2,3,null,3,null,1] -> 7
tree_a = TreeNode(3, TreeNode(2, None, TreeNode(3)), TreeNode(3, None, TreeNode(1)))
# Example B: [3,4,5,1,3,null,1] -> 9
tree_b = TreeNode(3, TreeNode(4, TreeNode(1), TreeNode(3)), TreeNode(5, None, TreeNode(1)))

print(f"Example A: {rob_tree(tree_a)}  (expected 7)")
print(f"Example B: {rob_tree(tree_b)}  (expected 9)")

assert rob_tree(tree_a) == 7
assert rob_tree(tree_b) == 9
print("Assertions passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize the Tree — Robbed vs Skipped',
              code: `import matplotlib.pyplot as plt


class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def rob_tree_with_choice(root):
    def dfs(node):
        if node is None:
            return (0, [], 0, [])  # rob_total, rob_set, skip_total, skip_set
        l_rob, l_rob_set, l_skip, l_skip_set = dfs(node.left)
        r_rob, r_rob_set, r_skip, r_skip_set = dfs(node.right)
        rob_total = node.val + l_skip + r_skip
        rob_set = [node.val] + l_skip_set + r_skip_set
        left_best_total, left_best_set = (l_rob, l_rob_set) if l_rob >= l_skip else (l_skip, l_skip_set)
        right_best_total, right_best_set = (r_rob, r_rob_set) if r_rob >= r_skip else (r_skip, r_skip_set)
        skip_total = left_best_total + right_best_total
        skip_set = left_best_set + right_best_set
        return (rob_total, rob_set, skip_total, skip_set)

    rob_total, rob_set, skip_total, skip_set = dfs(root)
    if rob_total >= skip_total:
        return rob_total, set(rob_set)
    return skip_total, set(skip_set)


def positions(node, depth=0, x=0.0, spread=8.0, coords=None):
    if coords is None:
        coords = {}
    if node is None:
        return coords, x
    coords, x = positions(node.left, depth + 1, x, spread / 2, coords)
    my_x = x
    coords[id(node)] = (my_x, -depth, node)
    x += 1
    coords, x = positions(node.right, depth + 1, x, spread / 2, coords)
    return coords, x


def draw_tree(root, robbed):
    coords, _ = positions(root)
    fig, ax = plt.subplots(figsize=(7, 4), facecolor="#0f172a")
    ax.set_facecolor("#0f172a")

    def draw_edges(node):
        if node is None:
            return
        px, py, _ = coords[id(node)]
        for child in (node.left, node.right):
            if child is not None:
                cx, cy, _ = coords[id(child)]
                ax.plot([px, cx], [py, cy], color="#334155", zorder=1)
                draw_edges(child)

    draw_edges(root)
    for x, y, node in coords.values():
        is_robbed = node.val in robbed
        color = "#4ade80" if is_robbed else "#334155"
        text_color = "#0f172a" if is_robbed else "#e2e8f0"
        ax.scatter([x], [y], s=1400, color=color, zorder=2, edgecolors="#94a3b8")
        ax.text(x, y, str(node.val), ha="center", va="center", color=text_color, fontsize=13, fontweight="bold", zorder=3)
    ax.set_title("Green = robbed. Total loot = " + str(sum(robbed)), color="#e2e8f0")
    ax.axis("off")
    plt.tight_layout()
    plt.show()


tree_b = TreeNode(3, TreeNode(4, TreeNode(1), TreeNode(3)), TreeNode(5, None, TreeNode(1)))
total, robbed = rob_tree_with_choice(tree_b)
print(f"Total: {total}, robbed values: {sorted(robbed)}")
draw_tree(tree_b, robbed)`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'The two-state DFS, on a deeper tree',
              difficulty: 'medium',
              prompt: 'Fill in dfs(node) to return (rob_this, skip_this), combining the left and right children\'s states exactly as derived above. Uncomment the assertion once ready.',
              hint: 'rob_this = node.val + left_skip + right_skip. skip_this = max(left_rob, left_skip) + max(right_rob, right_skip).',
              label: 'From Scratch — Deeper Tree + Verify',
              code: `import sys
sys.setrecursionlimit(10000)


class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def rob_tree(root):
    def dfs(node):
        if node is None:
            return (0, 0)
        # YOUR CODE HERE — combine left and right states, return (rob_this, skip_this)
        pass
    rob_root, skip_root = dfs(root)
    return max(rob_root, skip_root)


# A deeper, four-level tree to test on
#              5
#           /     \\
#          3       1
#        /   \\       \\
#       2     6        8
#      /                 \\
#     4                    9
deep_tree = TreeNode(5,
    TreeNode(3, TreeNode(2, TreeNode(4)), TreeNode(6)),
    TreeNode(1, None, TreeNode(8, None, TreeNode(9))))

# --- Uncomment to test when ready ---
# assert rob_tree(deep_tree) == 24, f"got {rob_tree(deep_tree)}"
# print("Deep tree max loot:", rob_tree(deep_tree))
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
      text: 'Why does House Robber III not need a memoization cache, unlike naive recursive Fibonacci?',
      options: [
        'Because trees are always small enough that exponential time does not matter',
        'Because every node in a tree has exactly one parent, so post-order DFS visits each subtree exactly once — there is no repeated subproblem to cache, unlike fib(n-2) which is reachable through multiple different call paths',
        'Because JavaScript and Python automatically cache recursive function calls',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'In the House Robber III recurrence, why does robThis use leftSkip and rightSkip (not leftRob/rightRob)?',
      options: [
        'Because skip values are always larger than rob values',
        'If the current node is robbed, its direct children cannot also be robbed (shared alarm) — so the children\'s contribution must come from their "skipped" state, which still allows the children\'s own children to be robbed',
        'Because of operator precedence in the max() function',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What is the base case for a null child in tree DP, and why?',
      options: [
        '(0, 0) — an empty subtree contributes zero loot whether treated as "robbed" or "skipped," since there is nothing there',
        '(-1, -1) — to signal that this branch should never be chosen',
        'null — matching the input, propagated upward unchanged',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A tree DP problem asks you to find the maximum weight independent set on a general (not binary) tree with variable numbers of children per node. What changes about the recurrence compared to House Robber III?',
      options: [
        'Nothing changes — the recurrence only ever considers two children',
        'The "robThis"/"skipThis" pattern generalizes to a sum over ALL children (add each child\'s skip value when robbing this node; add max(child rob, child skip) for each child when skipping this node) instead of hardcoded left/right terms',
        'General trees require an entirely different algorithm unrelated to include/exclude',
      ],
      correct: 1,
    },
  ],
};
