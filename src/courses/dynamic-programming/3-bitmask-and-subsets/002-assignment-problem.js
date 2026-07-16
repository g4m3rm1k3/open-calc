export default {
  id: 'dp3-002',
  slug: 'assignment-problem',
  chapter: 'dp3',
  order: 2,
  title: 'The Assignment Problem: Bitmask Over Resources, Not Positions',
  subtitle: 'Minimum-cost worker-to-task matching, one worker at a time',
  tags: ['dynamic programming', 'bitmask dp', 'assignment problem', 'bipartite matching'],
  aliases: 'assignment problem bitmask dp worker task matching bipartite',

  hook: {
    question: 'A shop has 8 CNC machinists and 8 jobs queued for the week. Each machinist has a different estimated completion cost for each job (based on their specialization). Assign each machinist to exactly one job, each job to exactly one machinist, minimizing total cost. This "sounds" like TSP\'s cousin — and it is — but the bitmask here tracks something different: not "which cities visited," but "which TASKS have been claimed," while workers are processed one at a time in a fixed order rather than chosen freely.',
    realWorldContext: 'The Assignment Problem is the mathematical model behind job-shop scheduling (which machinist handles which job), task allocation in distributed computing (which server handles which request type), and matching problems in economics (which applicant gets which position, minimizing total mismatch cost). While the classical polynomial-time solution is the Hungarian Algorithm (O(n³)), bitmask DP gives an easier-to-derive exact solution for smaller n (roughly n ≤ 20) and is frequently what interview problems and smaller production systems actually reach for first.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    prose: [
      '**A different bitmask target: tasks, not a tour.** In TSP, the mask tracked cities visited AND we needed to know the current city (since the next move\'s cost depends on where you are). In Assignment, workers are processed in a FIXED order — worker 0, then worker 1, then worker 2, and so on — so "which worker are we assigning" is not extra state to track at all; it is directly implied by `popcount(mask)` (the number of tasks already assigned equals the number of workers already processed). The mask tracks which TASKS have been claimed.',
      '**The recurrence.** `dp[mask]` = minimum total cost to have assigned the first `popcount(mask)` workers (workers 0 through `popcount(mask)-1`), using exactly the tasks in `mask`. Transition: from `dp[mask]`, the next worker to assign is `worker = popcount(mask)`; try giving them every task `j` not yet in `mask`: `dp[mask | (1<<j)] = min(dp[mask | (1<<j)], dp[mask] + cost[worker][j])`. Base case: `dp[0] = 0` (no workers assigned yet, no tasks claimed, zero cost). Answer: `dp[(1<<n) - 1]` (every task claimed, meaning every worker has been assigned).',
      '**Why the state only needs ONE dimension here, not two.** TSP needed `dp[mask][currentCity]` because the mask alone did not tell you where you currently stood — many different tours visit the same set of cities but end in different places, and the ending place changes future costs. Assignment does not have this ambiguity: given a mask, the identity of "the next worker" is forced (`popcount(mask)`), so there is nothing extra to track. This is a recurring lesson in bitmask DP: always ask "does the mask alone determine everything I need, or is there a second piece of state (like a current position) that varies independently?"',
      '**Complexity.** `O(2ⁿ × n)` — for each of the `2ⁿ` masks, one iteration over `n` possible next tasks. This is actually cheaper than TSP\'s `O(2ⁿ × n²)`, precisely because Assignment does not need the extra "current city" dimension. For n=20, that is roughly 20 million operations — comfortably fast.',
      '**Connection to Chapter 1\'s knapsack family.** Squint at the recurrence and it looks like 0/1 Knapsack: "process items (workers) one at a time, decide what to do with each, track which resources (tasks) are consumed." The difference is that knapsack tracked a single numeric "capacity used so far," while Assignment tracks an entire SET of specific tasks used so far — because unlike knapsack capacity, tasks are not interchangeable units, they are distinct, individually-identified resources. When "how much capacity is left" is not enough and you need to know exactly WHICH specific resources remain, that is the signal to promote a numeric DP state to a bitmask state.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 3, Lesson 2: The Assignment Problem',
        body: '**Previous:** Bitmask DP Fundamentals — subsets as integers, TSP.\n**This lesson:** Assignment Problem — bitmask over tasks, one worker at a time, no extra "current position" dimension needed.\n**Next:** Bitmask DP with an extra dimension — Shortest Path Visiting All Nodes.',
      },
      {
        type: 'insight',
        title: 'The key question: does popcount(mask) already tell you "which turn"?',
        body: 'If workers/steps are processed in a FIXED, predetermined order, popcount(mask) (how many items are already in the set) directly tells you whose turn is next — no extra dimension needed (Assignment). If the "current position" can be freely chosen and varies independently of which items are used (TSP: you can end anywhere), you need a second DP dimension for it.',
      },
      {
        type: 'strategy',
        title: 'From knapsack to bitmask: when capacity is not enough',
        body: '0/1 Knapsack tracks "how much capacity used" as a single number, because capacity units are interchangeable. When resources are NOT interchangeable — specific, distinct tasks, each with a different cost per worker — a single number cannot capture "which ones" are gone. That is exactly when a numeric DP dimension needs to become a bitmask dimension.',
      },
      {
        type: 'warning',
        title: 'Off-by-one: popcount(mask) as the "next worker" index',
        body: 'If `mask` has k bits set, the workers 0..k-1 have already been assigned (in that fixed order), and worker k is next. Using `popcount(mask)` directly as an ARRAY INDEX into the cost matrix\'s worker rows is correct only because workers are processed in strict order 0,1,2,...  If a problem lets you choose which worker goes next too, you need a second bitmask (or the two-dimensional TSP-style state) instead.',
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: 'Assignment: One Worker at a Time, Tasks as a Bitmask',
        caption: 'Watch popcount(mask) directly determine which worker is being assigned next.',
        props: {
          lesson: {
            title: 'Assignment Problem Step by Step',
            subtitle: 'The mask tracks claimed tasks; popcount tells you whose turn it is.',
            sequential: true,
            cells: [
              {
                type: 'js',
                title: 'The Cost Matrix',
                instruction: 'cost[worker][task] — 3 workers, 3 tasks. Find the assignment (a permutation) minimizing total cost.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const cost = [[9,2,7],[6,4,3],[5,8,1]];
let html = '<div style="color:#60a5fa;margin-bottom:8px">Cost matrix (rows=workers, cols=tasks):</div><table style="border-collapse:collapse">';
html += '<tr><td></td>' + [0,1,2].map(j => '<td style="padding:6px 12px;color:#94a3b8">task ' + j + '</td>').join('') + '</tr>';
cost.forEach((row, i) => {
  html += '<tr><td style="padding:6px 12px;color:#94a3b8">worker ' + i + '</td>' + row.map(v => '<td style="border:1px solid #334155;padding:6px 12px;text-align:center;color:#4ade80">' + v + '</td>').join('') + '</tr>';
});
html += '</table>';
d.innerHTML = html;`,
                outputHeight: 200,
              },
              {
                type: 'js',
                title: 'popcount(mask) IS the Worker Index',
                instruction: 'Watch: for every mask, the number of set bits tells you exactly which worker is being assigned next — no separate tracking needed.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
function popcount(mask) {
  let c = 0;
  while (mask) { c += mask & 1; mask >>= 1; }
  return c;
}
let html = '<div style="color:#60a5fa;margin-bottom:8px">Every mask from 0 to 7 (3 tasks), and the worker it implies:</div>';
for (let mask = 0; mask < 8; mask++) {
  const tasksClaimed = [];
  for (let j = 0; j < 3; j++) if (mask & (1 << j)) tasksClaimed.push(j);
  html += '<div style="padding:4px 10px;background:#1e293b;border-radius:4px;margin-bottom:3px">mask=' + mask.toString(2).padStart(3,'0') + '  tasks claimed={' + tasksClaimed.join(',') + '}  &rarr;  next worker = popcount = <b style="color:#f59e0b">' + popcount(mask) + '</b></div>';
}
d.innerHTML = html;`,
                outputHeight: 300,
              },
              {
                type: 'js',
                title: 'The DP Table Filling In',
                instruction: 'dp[mask] = min cost to have assigned popcount(mask) workers using exactly these tasks.',
                html: `<div id="d" style="padding:12px;font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0}`,
                startCode: `const d = document.getElementById('d');
const cost = [[9,2,7],[6,4,3],[5,8,1]];
const n = 3;
const FULL = 1 << n;
const dp = new Array(FULL).fill(Infinity);
dp[0] = 0;

function popcount(mask) {
  let c = 0;
  while (mask) { c += mask & 1; mask >>= 1; }
  return c;
}

const log = [];
for (let mask = 0; mask < FULL; mask++) {
  if (dp[mask] === Infinity) continue;
  const worker = popcount(mask);
  if (worker >= n) continue;
  for (let task = 0; task < n; task++) {
    if (mask & (1 << task)) continue;
    const newMask = mask | (1 << task);
    const newCost = dp[mask] + cost[worker][task];
    if (newCost < dp[newMask]) {
      dp[newMask] = newCost;
      log.push({ mask, worker, task, newMask, newCost });
    }
  }
}

let html = '<div style="color:#60a5fa;margin-bottom:8px">Transitions (mask &rarr; assign worker to task &rarr; newMask):</div>';
log.forEach(e => {
  html += '<div style="padding:3px 10px;background:#1e293b;border-radius:4px;margin-bottom:2px;font-size:12px">mask=' + e.mask.toString(2).padStart(3,'0') + '  worker' + e.worker + '&rarr;task' + e.task + '  newMask=' + e.newMask.toString(2).padStart(3,'0') + '  cost=<b style="color:#4ade80">' + e.newCost + '</b></div>';
});
html += '<div style="margin-top:10px;background:#052e16;border-radius:6px;padding:8px 12px;color:#4ade80">Minimum total cost: ' + dp[FULL - 1] + '</div>';
d.innerHTML = html;`,
                outputHeight: 400,
              },
            ],
          },
        },
      },

      {
        id: 'JSNotebook',
        title: 'Build the Assignment Problem from Scratch',
        caption: 'One-dimensional bitmask DP — simpler than TSP because order is fixed.',
        props: {
          lesson: {
            title: 'Assignment Problem in JavaScript',
            subtitle: 'popcount(mask) replaces an entire extra DP dimension.',
            cells: [
              {
                type: 'js',
                instruction: `## Step 1 — popcount

Implement \`popcount(mask)\`, counting the number of set bits. This will directly tell you which worker to assign next.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function popcount(mask) {
  let count = 0;
  // TODO: while mask is nonzero: add the lowest bit (mask & 1) to count, shift mask right by 1
  return count;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('popcount(0)', popcount(0), 0);
test('popcount(0b101)', popcount(0b101), 2);
test('popcount(0b1111)', popcount(0b1111), 4);
test('popcount(0b1000000)', popcount(0b1000000), 1);`,
                solutionCode: `function popcount(mask) {
  let count = 0;
  while (mask) {
    count += mask & 1;
    mask >>= 1;
  }
  return count;
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('popcount(0)', popcount(0), 0);
test('popcount(0b101)', popcount(0b101), 2);
test('popcount(0b1111)', popcount(0b1111), 4);
test('popcount(0b1000000)', popcount(0b1000000), 1);`,
                outputHeight: 140,
              },
              {
                type: 'js',
                instruction: `## Step 2 — The Assignment DP

Implement \`minAssignmentCost(cost)\`. \`dp[mask]\` = min cost to assign workers \`0..popcount(mask)-1\` using exactly the tasks in \`mask\`.`,
                html: `<div id="out" style="font-family:monospace;font-size:13px"></div>`,
                css: `body{margin:0;padding:14px;background:#0f172a;color:#e2e8f0;box-sizing:border-box;font-family:monospace}.pass{color:#4ade80;margin:2px 0}.fail{color:#f87171;margin:2px 0}`,
                startCode: `function popcount(mask) {
  let count = 0;
  while (mask) { count += mask & 1; mask >>= 1; }
  return count;
}

function minAssignmentCost(cost) {
  const n = cost.length;
  const FULL = 1 << n;
  const dp = new Array(FULL).fill(Infinity);
  dp[0] = 0;

  for (let mask = 0; mask < FULL; mask++) {
    if (dp[mask] === Infinity) continue;
    const worker = popcount(mask);
    if (worker >= n) continue;
    for (let task = 0; task < n; task++) {
      if (mask & (1 << task)) continue;
      // TODO: newMask = mask | (1 << task)
      // TODO: newCost = dp[mask] + cost[worker][task]
      // TODO: if newCost improves dp[newMask], update it
    }
  }
  return dp[FULL - 1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('3x3 assignment', minAssignmentCost([[9,2,7],[6,4,3],[5,8,1]]), 9);
test('Identity-favoring 2x2', minAssignmentCost([[1,10],[10,1]]), 2);
test('Single worker/task', minAssignmentCost([[5]]), 5);`,
                solutionCode: `function popcount(mask) {
  let count = 0;
  while (mask) { count += mask & 1; mask >>= 1; }
  return count;
}

function minAssignmentCost(cost) {
  const n = cost.length;
  const FULL = 1 << n;
  const dp = new Array(FULL).fill(Infinity);
  dp[0] = 0;

  for (let mask = 0; mask < FULL; mask++) {
    if (dp[mask] === Infinity) continue;
    const worker = popcount(mask);
    if (worker >= n) continue;
    for (let task = 0; task < n; task++) {
      if (mask & (1 << task)) continue;
      const newMask = mask | (1 << task);
      const newCost = dp[mask] + cost[worker][task];
      if (newCost < dp[newMask]) dp[newMask] = newCost;
    }
  }
  return dp[FULL - 1];
}

const out = document.getElementById('out');
function test(l, g, e) {
  const p = g === e;
  out.innerHTML += \`<div class="\${p?'pass':'fail'}">\${p?'✓':'✗'} \${l}: got \${g}, want \${e}</div>\`;
}

test('3x3 assignment', minAssignmentCost([[9,2,7],[6,4,3],[5,8,1]]), 9);
test('Identity-favoring 2x2', minAssignmentCost([[1,10],[10,1]]), 2);
test('Single worker/task', minAssignmentCost([[5]]), 5);`,
                outputHeight: 160,
              },
            ],
          },
        },
      },

      {
        id: 'PythonNotebook',
        title: 'Assignment Problem in Python',
        caption: 'Build the DP, visualize which worker gets which task, then a from-scratch challenge.',
        props: {
          initialCells: [
            {
              type: 'code',
              language: 'python',
              label: 'Assignment DP — Build and Verify',
              code: `def min_assignment_cost(cost):
    n = len(cost)
    full = 1 << n
    dp = [float("inf")] * full
    dp[0] = 0

    for mask in range(full):
        if dp[mask] == float("inf"):
            continue
        worker = bin(mask).count("1")
        if worker >= n:
            continue
        for task in range(n):
            if mask & (1 << task):
                continue
            new_mask = mask | (1 << task)
            new_cost = dp[mask] + cost[worker][task]
            if new_cost < dp[new_mask]:
                dp[new_mask] = new_cost

    return dp[full - 1]


cost = [
    [9, 2, 7],
    [6, 4, 3],
    [5, 8, 1],
]
result = min_assignment_cost(cost)
print(f"Minimum assignment cost: {result}")
assert result == 9
print("Assertion passed!")`,
            },
            {
              type: 'code',
              language: 'python',
              label: 'Visualize: Which Worker Gets Which Task',
              code: `import matplotlib.pyplot as plt


def assignment_with_choice(cost):
    n = len(cost)
    full = 1 << n
    dp = [float("inf")] * full
    choice = [None] * full
    dp[0] = 0

    for mask in range(full):
        if dp[mask] == float("inf"):
            continue
        worker = bin(mask).count("1")
        if worker >= n:
            continue
        for task in range(n):
            if mask & (1 << task):
                continue
            new_mask = mask | (1 << task)
            new_cost = dp[mask] + cost[worker][task]
            if new_cost < dp[new_mask]:
                dp[new_mask] = new_cost
                choice[new_mask] = task

    # Reconstruct assignment
    mask = full - 1
    assignment = [None] * n
    for worker in range(n - 1, -1, -1):
        task = choice[mask]
        assignment[worker] = task
        mask ^= (1 << task)
    return dp[full - 1], assignment


cost = [
    [9, 2, 7],
    [6, 4, 3],
    [5, 8, 1],
]
total, assignment = assignment_with_choice(cost)
print(f"Total cost: {total}")
for worker, task in enumerate(assignment):
    print(f"  Worker {worker} -> Task {task} (cost {cost[worker][task]})")

fig, ax = plt.subplots(figsize=(5, 5), facecolor="#0f172a")
ax.set_facecolor("#0f172a")
n = len(cost)
im = ax.imshow(cost, cmap="Blues", aspect="auto")
for i in range(n):
    for j in range(n):
        is_chosen = assignment[i] == j
        color = "#4ade80" if is_chosen else "white"
        weight = "bold" if is_chosen else "normal"
        ax.text(j, i, str(cost[i][j]), ha="center", va="center", color=color, fontsize=14, fontweight=weight)
ax.set_xticks(range(n)); ax.set_xticklabels([f"Task {j}" for j in range(n)], color="#94a3b8")
ax.set_yticks(range(n)); ax.set_yticklabels([f"Worker {i}" for i in range(n)], color="#94a3b8")
ax.set_title(f"Green = chosen assignment (total cost {total})", color="#e2e8f0")
plt.tight_layout()
plt.show()`,
            },
            {
              type: 'code',
              language: 'python',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Assignment problem, 4 workers and 4 tasks',
              difficulty: 'medium',
              prompt: 'Fill in the transition loop in min_assignment_scratch(cost): compute the next worker from popcount(mask), then try assigning them to every unclaimed task. Uncomment the assertion once ready.',
              hint: 'worker = bin(mask).count("1"). new_mask = mask | (1 << task). new_cost = dp[mask] + cost[worker][task].',
              label: 'From Scratch — 4x4 Assignment',
              code: `def min_assignment_scratch(cost):
    n = len(cost)
    full = 1 << n
    dp = [float("inf")] * full
    dp[0] = 0

    for mask in range(full):
        if dp[mask] == float("inf"):
            continue
        worker = bin(mask).count("1")
        if worker >= n:
            continue
        for task in range(n):
            if mask & (1 << task):
                continue
            # YOUR CODE HERE:
            # new_mask = mask | (1 << task)
            # new_cost = dp[mask] + cost[worker][task]
            # if new_cost < dp[new_mask]: dp[new_mask] = new_cost
            pass

    return dp[full - 1]


cost4 = [
    [90, 75, 75, 80],
    [35, 85, 55, 65],
    [125, 95, 90, 105],
    [45, 110, 95, 115],
]

# --- Uncomment to test when ready ---
# result = min_assignment_scratch(cost4)
# print(f"4x4 assignment optimal cost: {result}")
# assert result == 275, f"got {result}"
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
      text: 'In the Assignment Problem, why does dp[mask] not need a second dimension for "current worker," unlike dp[mask][city] in TSP?',
      options: [
        'Because the Assignment Problem always has fewer workers than TSP has cities',
        'Workers are assigned in a fixed order (0, 1, 2, ...), so the next worker to assign is always popcount(mask) — a value already determined by the mask itself, not independent information that needs its own dimension',
        'Because tasks and workers are always the same number, making the extra dimension redundant',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What is the time complexity of the bitmask Assignment DP, and why is it cheaper than bitmask TSP?',
      options: [
        'O(2ⁿ) — it only needs to consider each mask once with no inner loop',
        'O(2ⁿ × n) — one iteration over n possible tasks per mask, with no extra factor of n for a "current position" dimension the way TSP needs (TSP is O(2ⁿ × n²) because it tracks both mask AND current city)',
        'O(n!) — same as brute force, bitmask DP does not help the Assignment Problem',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'When does a DP problem need to "promote" a numeric state (like knapsack\'s capacity-used) to a bitmask state?',
      options: [
        'Whenever the numbers involved are larger than about 20',
        'When the resources being tracked are NOT interchangeable — a single number can represent "how much capacity is used" because units of capacity are identical, but it cannot represent "which specific distinct items are used," which requires knowing exactly which ones, not just how many',
        'A numeric state should always be promoted to a bitmask for better performance',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why is using popcount(mask) as a direct array index into the cost matrix\'s worker rows only valid under a specific condition?',
      options: [
        'It is always valid regardless of the problem structure',
        'It is only valid because workers are processed in a strict, predetermined order (0, 1, 2, ...) — if a problem instead let you freely choose which worker to assign next, popcount(mask) would no longer uniquely identify "whose turn it is," and a second DP dimension would be needed',
        'It requires the cost matrix to be square',
      ],
      correct: 1,
    },
  ],
};
